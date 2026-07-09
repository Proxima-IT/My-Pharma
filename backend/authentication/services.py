"""
Business logic for auth: registration (phone/email), OTP verification, login, lockout.
Decoupled from views for testability and reuse.
"""
import logging
import re
import secrets
from django.conf import settings
from django.utils import timezone

from .constants import UserRole, UserStatus, AuditAction
from .exceptions import AccountLockedError, InvalidOTPError, InvalidRegistrationTokenError, OTPRateLimitError
from .models import User, AuditLog
from . import utils

logger = logging.getLogger(__name__)


def normalize_phone(phone: str) -> str:
    """Normalize phone for storage and Redis keys (digits only, BD prefix optional).
    Returns the international BD format: 8801XXXXXXXXX (13 digits).
    """
    digits = "".join(c for c in phone if c.isdigit())
    if not digits:
        return phone
    # Already in international format
    if digits.startswith("880") and len(digits) >= 13:
        return digits
    # Local format starts with 0: 01XXXXXXXXX (11 digits) -> 8801XXXXXXXXX
    if digits.startswith("0") and len(digits) >= 10:
        return "880" + digits[1:]
    # 10-digit number starting with 1 (no prefix) -> 880 + 1XXXXXXXXX
    if len(digits) == 10 and digits.startswith("1"):
        return "880" + digits
    # Fallback: return as-is if it's already a valid format
    return digits


def validate_password_strength(password: str) -> tuple[bool, str]:
    """Returns (ok, error_message)."""
    min_len = getattr(settings, "AUTH_PASSWORD_MIN_LENGTH", 6)
    if len(password) < min_len:
        return False, f"Password must be at least {min_len} characters."
    return True, ""



def _build_unique_username(seed: str) -> str:
    """
    Build a unique username for social sign-in accounts.
    Uses a conservative character set and appends numeric suffixes when needed.
    """
    cleaned = re.sub(r"[^A-Za-z0-9_.]+", "_", (seed or "").strip()).strip("_.")
    base = cleaned[:150] or "google_user"
    candidate = base
    suffix = 1
    while User.objects.filter(username__iexact=candidate).exists():
        suffix_text = f"_{suffix}"
        max_base_len = max(1, 150 - len(suffix_text))
        candidate = f"{base[:max_base_len]}{suffix_text}"
        suffix += 1
    return candidate


def request_otp_for_phone(phone: str, ip: str = "", user_agent: str = "") -> None:
    """Validate resend limit, generate OTP, store in Redis, enqueue Celery send. Raises OTPRateLimitError."""
    normalized = normalize_phone(phone)
    if not utils.otp_can_resend(normalized):
        raise OTPRateLimitError()
    from .tasks import send_otp_sms
    otp = _generate_otp()
    utils.otp_set(normalized, otp)
    utils.otp_resend_increment(normalized)
    if getattr(settings, "DEBUG", False):
        logger.info("[DEBUG] Generated OTP for phone %s is: %s", normalized, otp)
    send_otp_sms.delay(normalized, otp)
    logger.info("OTP requested for phone (masked); resend count incremented.")


def _generate_otp() -> str:
    # Cryptographically secure random 6-digit OTP.
    return f"{secrets.randbelow(1_000_000):06d}"


def request_otp_for_email(email: str, ip: str = "", user_agent: str = "") -> None:
    """Validate resend limit, generate OTP, store in cache, enqueue Celery send. Raises OTPRateLimitError."""
    normalized = email.lower().strip()
    if not utils.otp_can_resend(normalized):
        raise OTPRateLimitError()
    from .tasks import send_otp_email
    otp = _generate_otp()
    utils.otp_set(normalized, otp)
    utils.otp_resend_increment(normalized)
    if getattr(settings, "DEBUG", False):
        logger.info("[DEBUG] Generated OTP for email %s is: %s", normalized, otp)
    send_otp_email.delay(normalized, otp)
    logger.info("OTP requested for email (masked); resend count incremented.")


def verify_otp_only(phone: str, otp: str) -> tuple[str, str, str]:
    """
    Verify OTP for phone only; do not create user. Returns (registration_token, "phone", phone_value).
    Raises InvalidOTPError.
    """
    normalized = normalize_phone(phone)
    stored = utils.otp_get(normalized)
    if not stored or stored != otp:
        raise InvalidOTPError()
    utils.otp_delete(normalized)
    import uuid
    token = str(uuid.uuid4())
    utils.registration_token_set(token, "phone", normalized)
    return token, "phone", normalized


def verify_otp_only_email(email: str, otp: str) -> tuple[str, str, str]:
    """
    Verify OTP for email only; do not create user. Returns (registration_token, "email", email_value).
    Raises InvalidOTPError.
    """
    normalized = email.lower().strip()
    stored = utils.otp_get(normalized)
    if not stored or stored != otp:
        raise InvalidOTPError()
    utils.otp_delete(normalized)
    import uuid
    token = str(uuid.uuid4())
    utils.registration_token_set(token, "email", normalized)
    return token, "email", normalized


def confirm_change_email(user_id: int, new_email: str, otp: str) -> User:
    """
    Verify OTP for new_email and update user's email. Pending must have been set for this user_id.
    Raises InvalidOTPError if OTP wrong; ValueError if pending mismatch or user not found.
    """
    normalized = new_email.lower().strip()
    pending = utils.change_email_pending_get(user_id)
    if not pending or pending != normalized:
        raise InvalidOTPError()  # or a specific "pending expired" - use same for security
    verify_otp_only_email(normalized, otp)  # raises InvalidOTPError, deletes OTP
    user = User.objects.filter(pk=user_id).exclude(deleted_at__isnull=False).first()
    if not user:
        raise ValueError("User not found.")
    old_email = user.email
    user.email = normalized
    user.email_verified = True
    user.save(update_fields=["email", "email_verified", "updated_at"])
    utils.change_email_pending_delete(user_id)
    logger.info("User %s email updated (from %s to %s).", user_id, old_email, normalized)
    return user


def confirm_change_phone(user_id: int, new_phone: str, otp: str) -> User:
    """
    Verify OTP for new_phone and update user's phone. Pending must have been set for this user_id.
    Raises InvalidOTPError if OTP wrong; ValueError if pending mismatch or user not found.
    """
    normalized = normalize_phone(new_phone)
    if len(normalized) < 10:
        raise InvalidOTPError()
    pending = utils.change_phone_pending_get(user_id)
    if not pending or pending != normalized:
        raise InvalidOTPError()
    verify_otp_only(normalized, otp)  # raises InvalidOTPError, deletes OTP
    user = User.objects.filter(pk=user_id).exclude(deleted_at__isnull=False).first()
    if not user:
        raise ValueError("User not found.")
    user.phone = normalized
    user.phone_verified = True
    user.save(update_fields=["phone", "phone_verified", "updated_at"])
    utils.change_phone_pending_delete(user_id)
    logger.info("User %s phone updated to %s.", user_id, normalized)
    return user


def complete_registration(
    registration_token: str,
    password: str,
    username: str,
    email: str | None = None,
    phone: str | None = None,
    profile_picture=None,
) -> User:
    """
    Create user after OTP verification using the registration token.
    Token holds verified_identifier (type: phone|email, value). The other identifier is optional.
    Required: username, password. Optional: email (if verified was phone), phone (if verified was email),
    profile_picture. Addresses can be added after login via UserAddress API.
    Raises InvalidRegistrationTokenError, ValidationError.
    """
    payload = utils.registration_token_get(registration_token)
    if not payload:
        raise InvalidRegistrationTokenError()
    ident_type = payload.get("type")
    ident_value = payload.get("value")
    if not ident_type or not ident_value:
        raise InvalidRegistrationTokenError()
    utils.registration_token_delete(registration_token)

    ok, msg = validate_password_strength(password)
    if not ok:
        from rest_framework.exceptions import ValidationError
        raise ValidationError({"password": msg})

    username = (username or "").strip()
    if not username:
        from rest_framework.exceptions import ValidationError
        raise ValidationError({"username": "Username is required."})
    if User.objects.filter(username__iexact=username).exclude(deleted_at__isnull=False).exists():
        from rest_framework.exceptions import ValidationError
        raise ValidationError({"username": "A user with this username already exists."})

    if ident_type == "phone":
        phone_fixed = ident_value
        email_fixed = (email or "").strip().lower() if email else None
        if email_fixed and User.objects.filter(email__iexact=email_fixed).exclude(deleted_at__isnull=False).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"email": "A user with this email already exists."})
        if User.objects.filter(phone=phone_fixed).exclude(deleted_at__isnull=False).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"phone": "A user with this phone number already exists."})
        user = User.objects.create_user(
            phone=phone_fixed,
            email=email_fixed or f"p_{phone_fixed}@ph.local",
            password=password,
            role=UserRole.REGISTERED_USER,
            username=username,
        )
        user.phone_verified = True
        user.email_verified = bool(email_fixed)
        if profile_picture:
            user.profile_picture = profile_picture
        user.save(update_fields=["phone_verified", "email_verified", "profile_picture", "updated_at"])
    else:
        email_fixed = ident_value
        phone_fixed = normalize_phone(phone) if phone else ""
        if phone_fixed and len(phone_fixed) < 10:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"phone": "Invalid phone number."})
        if User.objects.filter(email__iexact=email_fixed).exclude(deleted_at__isnull=False).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"email": "A user with this email already exists."})
        if phone_fixed and User.objects.filter(phone=phone_fixed).exclude(deleted_at__isnull=False).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"phone": "A user with this phone number already exists."})
        user = User.objects.create_user(
            email=email_fixed,
            phone=phone_fixed or "",
            password=password,
            role=UserRole.REGISTERED_USER,
            username=username,
        )
        user.email_verified = True
        user.phone_verified = bool(phone_fixed)
        if profile_picture:
            user.profile_picture = profile_picture
        user.save(update_fields=["email_verified", "phone_verified", "profile_picture", "updated_at"])
    user.status = UserStatus.ACTIVE
    user.save(update_fields=["status", "updated_at"])
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


_FIREBASE_PUBLIC_KEYS = {}
_FIREBASE_KEYS_EXPIRY = 0


def _get_firebase_public_keys() -> dict:
    global _FIREBASE_PUBLIC_KEYS, _FIREBASE_KEYS_EXPIRY
    import time
    import requests
    now = time.time()
    if not _FIREBASE_PUBLIC_KEYS or now > _FIREBASE_KEYS_EXPIRY:
        try:
            res = requests.get(
                "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com",
                timeout=10
            )
            if res.status_code == 200:
                _FIREBASE_PUBLIC_KEYS = res.json()
                # Parse Cache-Control header for max-age
                cache_control = res.headers.get("Cache-Control", "")
                max_age = 3600
                for part in cache_control.split(","):
                    if "max-age" in part:
                        try:
                            max_age = int(part.split("=")[1].strip())
                        except Exception:
                            pass
                _FIREBASE_KEYS_EXPIRY = now + max_age
        except Exception as exc:
            logger.warning("Failed to fetch Firebase public keys: %s", exc)
    return _FIREBASE_PUBLIC_KEYS


def manual_verify_firebase_token(id_token: str, project_id: str) -> dict:
    """Manually verify Firebase ID token JWT claims and signature using public keys."""
    import jwt
    from jwt.exceptions import ExpiredSignatureError, InvalidSignatureError, InvalidTokenError

    try:
        headers = jwt.get_unverified_header(id_token)
    except Exception:
        raise ValueError("invalid_token")

    kid = headers.get("kid")
    if not kid:
        raise ValueError("invalid_token")

    public_keys = _get_firebase_public_keys()
    cert_str = public_keys.get(kid)
    if not cert_str:
        raise ValueError("invalid_token")

    # Load public key from PEM certificate using cryptography
    try:
        from cryptography.x509 import load_pem_x509_certificate
        cert_obj = load_pem_x509_certificate(cert_str.encode("utf-8"))
        public_key = cert_obj.public_key()
    except Exception as exc:
        logger.error("Failed to load PEM certificate: %s", exc)
        raise ValueError("invalid_token")

    try:
        decoded = jwt.decode(
            id_token,
            public_key,
            algorithms=["RS256"],
            audience=project_id,
            issuer=f"https://securetoken.google.com/{project_id}",
            options={"verify_iat": True},
        )
        return decoded
    except ExpiredSignatureError:
        raise ValueError("invalid_token")
    except InvalidSignatureError:
        raise ValueError("invalid_token")
    except InvalidTokenError as exc:
        logger.warning("Manual token validation failed: %s", exc)
        raise ValueError("invalid_token")


def verify_google_firebase_id_token(id_token: str) -> dict:
    """
    Verify Firebase ID token for Google sign-in and return normalized claims.
    Raises ValueError with one of:
    firebase_not_configured, invalid_token, provider_mismatch, project_mismatch,
    email_missing, email_not_verified
    """
    decoded = None
    project_id = getattr(settings, "FIREBASE_AUTH_PROJECT_ID", "")

    # Try official Firebase Admin SDK first
    if getattr(settings, "FIREBASE_INITIALIZED", False):
        try:
            from firebase_admin import auth as firebase_auth
            decoded = firebase_auth.verify_id_token(id_token, check_revoked=False)
        except Exception as exc:
            logger.warning("Firebase Admin SDK ID token verification failed: %s", exc)
            # If the token signature/expiry is invalid, raise error
            raise ValueError("invalid_token")

    # Fallback to manual JWT verification if Admin SDK is not initialized/configured
    if not decoded:
        if not project_id:
            raise ValueError("firebase_not_configured")
        decoded = manual_verify_firebase_token(id_token, project_id)

    provider = ((decoded.get("firebase") or {}).get("sign_in_provider") or "").strip()
    if provider != "google.com":
        raise ValueError("provider_mismatch")

    expected_project_id = (project_id or "").strip()
    token_project_id = (decoded.get("aud") or "").strip()
    if expected_project_id and token_project_id and token_project_id != expected_project_id:
        raise ValueError("project_mismatch")

    email = (decoded.get("email") or "").strip().lower()
    if not email:
        raise ValueError("email_missing")

    require_verified_email = bool(getattr(settings, "FIREBASE_AUTH_REQUIRE_EMAIL_VERIFIED", True))
    if require_verified_email and not bool(decoded.get("email_verified")):
        raise ValueError("email_not_verified")

    return {
        "uid": (decoded.get("uid") or decoded.get("user_id") or decoded.get("sub") or "").strip(),
        "email": email,
        "email_verified": bool(decoded.get("email_verified")),
        "name": (decoded.get("name") or "").strip(),
        "picture": (decoded.get("picture") or "").strip(),
        "provider": provider,
    }


def login_or_register_with_google(id_token: str) -> tuple[User, bool, dict]:
    """
    Verify Google Firebase token and return (user, created, claims).
    Creates a new REGISTERED_USER when email does not exist.
    """
    claims = verify_google_firebase_id_token(id_token)
    email = claims["email"]

    user = User.objects.filter(email__iexact=email).exclude(deleted_at__isnull=False).first()
    created = False

    if user:
        check_login_lockout(user)
    else:
        if User.objects.filter(email__iexact=email, deleted_at__isnull=False).exists():
            raise ValueError("email_unavailable")
        username_seed = claims.get("name") or email.split("@")[0]
        user = User.objects.create_user(
            email=email,
            password=secrets.token_urlsafe(24),
            role=UserRole.REGISTERED_USER,
            username=_build_unique_username(username_seed),
        )
        created = True

    update_fields = []
    if user.status != UserStatus.ACTIVE:
        user.status = UserStatus.ACTIVE
        update_fields.append("status")
    if not user.email_verified:
        user.email_verified = True
        update_fields.append("email_verified")
    if created and not user.username:
        user.username = _build_unique_username(email.split("@")[0])
        update_fields.append("username")
    if user.failed_login_count != 0:
        user.failed_login_count = 0
        update_fields.append("failed_login_count")
    if user.last_failed_login_at is not None:
        user.last_failed_login_at = None
        update_fields.append("last_failed_login_at")
    if user.locked_until is not None:
        user.locked_until = None
        update_fields.append("locked_until")
    if update_fields:
        update_fields.append("updated_at")
        user.save(update_fields=update_fields)

    ident = user.email or user.phone
    if ident:
        utils.lockout_clear(ident)

    return user, created, claims


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
    normalized_email = (email or "").strip().lower()
    candidates = list(
        User.objects.filter(email__iexact=normalized_email)
        .exclude(deleted_at__isnull=False)
        .order_by("id")
    )
    if not candidates:
        return None

    locked_error = None
    first_unlocked = None

    for user in candidates:
        try:
            check_login_lockout(user)
        except AccountLockedError as e:
            # Keep the first lockout error in case every candidate is locked.
            if locked_error is None:
                locked_error = e
            continue

        if first_unlocked is None:
            first_unlocked = user

        if not user.check_password(password):
            continue

        # Success: clear failed count and lock
        user.failed_login_count = 0
        user.last_failed_login_at = None
        user.locked_until = None
        user.save(
            update_fields=[
                "failed_login_count",
                "last_failed_login_at",
                "locked_until",
                "updated_at",
            ]
        )
        ident = user.email or user.phone
        if ident:
            utils.lockout_clear(ident)
        return user

    if first_unlocked is not None:
        record_failed_login(first_unlocked)
        return None

    if locked_error is not None:
        raise locked_error

    return None


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


def create_password_reset_token(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    utils.password_reset_token_set(token, user_id)
    return token


def build_password_reset_link(token: str) -> str:
    base_url = (
        getattr(settings, "AUTH_PASSWORD_RESET_FRONTEND_URL", "").strip()
        or "http://localhost:3000"
    )
    return f"{base_url.rstrip('/')}/reset-password?token={token}"


def reset_password_with_token(token: str, new_password: str) -> User:
    payload = utils.password_reset_token_get(token)
    if not payload:
        raise InvalidRegistrationTokenError(
            detail="Invalid or expired password reset token."
        )

    user_id = payload.get("user_id")
    user = User.objects.filter(pk=user_id).exclude(deleted_at__isnull=False).first()
    if not user:
        utils.password_reset_token_delete(token)
        raise InvalidRegistrationTokenError(
            detail="Invalid or expired password reset token."
        )

    ok, msg = validate_password_strength(new_password)
    if not ok:
        from rest_framework.exceptions import ValidationError
        raise ValidationError({"new_password": msg})

    user.set_password(new_password)
    user.save(update_fields=["password", "updated_at"])
    utils.password_reset_token_delete(token)
    return user
