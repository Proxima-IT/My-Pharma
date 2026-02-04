"""
Business logic for auth: registration (phone/email), OTP verification, login, lockout.
Decoupled from views for testability and reuse.
"""
import logging
import re
from django.conf import settings
from django.utils import timezone

from .constants import UserRole, UserStatus, AuditAction
from .exceptions import AccountLockedError, InvalidOTPError, InvalidRegistrationTokenError, OTPRateLimitError
from .models import User, AuditLog
from . import utils

logger = logging.getLogger(__name__)

# Password: min 8, upper, lower, number, special
PASSWORD_REGEX = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$"
)


def normalize_phone(phone: str) -> str:
    """Normalize phone for storage and Redis keys (digits only, BD prefix optional)."""
    digits = "".join(c for c in phone if c.isdigit())
    if digits.startswith("0") and len(digits) >= 10:
        digits = "88" + digits[1:]
    elif len(digits) == 10 and digits.startswith("1"):
        digits = "88" + digits
    return digits or phone


def validate_password_strength(password: str) -> tuple[bool, str]:
    """Returns (ok, error_message)."""
    if len(password) < getattr(settings, "AUTH_PASSWORD_MIN_LENGTH", 8):
        return False, "Password must be at least 8 characters."
    if not PASSWORD_REGEX.match(password):
        return False, "Password must contain uppercase, lowercase, number and special character."
    return True, ""


def request_otp_for_phone(phone: str, ip: str = "", user_agent: str = "") -> None:
    """Validate resend limit, generate OTP, store in Redis, enqueue Celery send. Raises OTPRateLimitError."""
    normalized = normalize_phone(phone)
    if not utils.otp_can_resend(normalized):
        raise OTPRateLimitError()
    from .tasks import send_otp_sms
    otp = _generate_otp()
    utils.otp_set(normalized, otp)
    utils.otp_resend_increment(normalized)
    send_otp_sms.delay(normalized, otp)
    logger.info("OTP requested for phone (masked); resend count incremented.")


def _generate_otp() -> str:
    import random
    length = getattr(settings, "AUTH_OTP_LENGTH", 6)
    return "".join(str(random.randint(0, 9)) for _ in range(length))


def verify_otp_only(phone: str, otp: str) -> tuple[str, str]:
    """
    Verify OTP only; do not create user. Returns (registration_token, phone).
    Frontend uses registration_token to call complete_registration with password and other fields.
    Raises InvalidOTPError.
    """
    normalized = normalize_phone(phone)
    stored = utils.otp_get(normalized)
    if not stored or stored != otp:
        raise InvalidOTPError()
    utils.otp_delete(normalized)
    import uuid
    token = str(uuid.uuid4())
    utils.registration_token_set(token, normalized)
    return token, normalized


def complete_registration(
    registration_token: str,
    password: str,
    email: str | None = None,
    first_name: str | None = None,
    last_name: str | None = None,
) -> User:
    """
    Create user after OTP verification using the registration token.
    Phone comes from token; password required; email, first_name, last_name optional.
    Raises InvalidRegistrationTokenError, ValidationError.
    """
    phone = utils.registration_token_get(registration_token)
    if not phone:
        raise InvalidRegistrationTokenError()
    utils.registration_token_delete(registration_token)
    ok, msg = validate_password_strength(password)
    if not ok:
        from rest_framework.exceptions import ValidationError
        raise ValidationError({"password": msg})
    if email:
        email = email.lower().strip()
        if User.objects.filter(email__iexact=email).exclude(deleted_at__isnull=False).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"email": "A user with this email already exists."})
    if User.objects.filter(phone=phone).exclude(deleted_at__isnull=False).exists():
        from rest_framework.exceptions import ValidationError
        raise ValidationError({"phone": "A user with this phone number already exists."})
    user = User.objects.create_user(
        phone=phone,
        email=email or None,
        password=password,
        role=UserRole.REGISTERED_USER,
        first_name=(first_name or "").strip(),
        last_name=(last_name or "").strip(),
    )
    user.phone_verified = True
    user.status = UserStatus.ACTIVE
    user.save(update_fields=["phone_verified", "status", "updated_at"])
    return user


def verify_otp_and_get_or_create_user(phone: str, otp: str) -> User:
    """Legacy: verify OTP and create/login user immediately (no completion form). Kept for backward compatibility."""
    normalized = normalize_phone(phone)
    stored = utils.otp_get(normalized)
    if not stored or stored != otp:
        raise InvalidOTPError()
    utils.otp_delete(normalized)
    user = User.objects.filter(phone=normalized).exclude(deleted_at__isnull=False).first()
    if not user:
        user = User.objects.create_user(phone=normalized, role=UserRole.REGISTERED_USER)
        user.phone_verified = True
        user.status = UserStatus.ACTIVE
        user.save(update_fields=["phone_verified", "status", "updated_at"])
    else:
        user.phone_verified = True
        if user.status == UserStatus.PENDING_VERIFICATION:
            user.status = UserStatus.ACTIVE
        user.save(update_fields=["phone_verified", "status", "updated_at"])
    return user


def register_with_email(email: str, password: str) -> User:
    """Validate password, create user with email; email_verified=False until verification flow."""
    ok, msg = validate_password_strength(password)
    if not ok:
        from rest_framework.exceptions import ValidationError
        raise ValidationError({"password": msg})
    if User.objects.filter(email__iexact=email).exclude(deleted_at__isnull=False).exists():
        from rest_framework.exceptions import ValidationError
        raise ValidationError({"email": "A user with this email already exists."})
    user = User.objects.create_user(email=email, password=password, role=UserRole.REGISTERED_USER)
    user.status = UserStatus.PENDING_VERIFICATION
    user.save(update_fields=["status"])
    return user


def get_lockout_minutes() -> int:
    return getattr(settings, "AUTH_ACCOUNT_LOCKOUT_MINUTES", 30)


def get_max_failed_attempts() -> int:
    return getattr(settings, "AUTH_MAX_FAILED_LOGIN_ATTEMPTS", 5)


def check_login_lockout(user: User) -> None:
    """Raises AccountLockedError if user is locked (DB or Redis)."""
    if user.is_locked():
        raise AccountLockedError(detail=f"Account locked until {user.locked_until}. Try again later.")
    ident = user.email or user.phone
    if ident and utils.lockout_is_locked(ident):
        raise AccountLockedError()


def record_failed_login(user: User) -> None:
    """Increment failed count; lock account in DB and Redis if threshold reached."""
    now = timezone.now()
    user.failed_login_count += 1
    user.last_failed_login_at = now
    if user.failed_login_count >= get_max_failed_attempts():
        from datetime import timedelta
        user.locked_until = now + timedelta(minutes=get_lockout_minutes())
        user.save(update_fields=["failed_login_count", "last_failed_login_at", "locked_until", "updated_at"])
        ident = user.email or user.phone
        if ident:
            utils.lockout_set(ident, get_lockout_minutes())
        logger.warning("Account locked due to failed logins: user_id=%s", user.pk)
    else:
        user.save(update_fields=["failed_login_count", "last_failed_login_at", "updated_at"])


def perform_login_email(email: str, password: str) -> User | None:
    """Authenticate by email/password; apply lockout on failure. Returns User or None."""
    user = User.objects.filter(email__iexact=email).exclude(deleted_at__isnull=False).first()
    if not user:
        return None
    check_login_lockout(user)
    if not user.check_password(password):
        record_failed_login(user)
        return None
    # Success: clear failed count and lock
    user.failed_login_count = 0
    user.last_failed_login_at = None
    user.locked_until = None
    user.save(update_fields=["failed_login_count", "last_failed_login_at", "locked_until", "updated_at"])
    ident = user.email or user.phone
    if ident:
        utils.lockout_clear(ident)
    return user


def perform_login_phone(phone: str, password: str) -> User | None:
    """Authenticate by phone/password (normalized phone); apply lockout on failure. Returns User or None."""
    normalized = normalize_phone(phone)
    user = User.objects.filter(phone=normalized).exclude(deleted_at__isnull=False).first()
    if not user:
        return None
    check_login_lockout(user)
    if not user.check_password(password):
        record_failed_login(user)
        return None
    # Success: clear failed count and lock
    user.failed_login_count = 0
    user.last_failed_login_at = None
    user.locked_until = None
    user.save(update_fields=["failed_login_count", "last_failed_login_at", "locked_until", "updated_at"])
    ident = user.email or user.phone
    if ident:
        utils.lockout_clear(ident)
    return user


def create_audit_log(user_id: int | None, action: str, request=None, metadata=None):
    """Create AuditLog entry; request optional for IP and user_agent."""
    ip = ""
    ua = ""
    if request:
        ip = request.META.get("REMOTE_ADDR", "")
        ua = request.META.get("HTTP_USER_AGENT", "")[:512]
    AuditLog.objects.create(
        user_id=user_id,
        action=action,
        ip_address=ip or None,
        user_agent=ua,
        metadata=metadata or {},
    )
