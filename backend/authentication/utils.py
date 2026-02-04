"""
Redis-backed utilities: OTP storage, resend count, account lockout keys.
Used by services and throttling; keys are namespaced for My Pharma.
"""
import logging
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

KEY_PREFIX = "my_pharma:auth"
OTP_PREFIX = f"{KEY_PREFIX}:otp"
OTP_RESEND_PREFIX = f"{KEY_PREFIX}:otp_resend"
LOCKOUT_PREFIX = f"{KEY_PREFIX}:lockout"
BLACKLIST_PREFIX = f"{KEY_PREFIX}:blacklist"
REGISTRATION_TOKEN_PREFIX = f"{KEY_PREFIX}:reg_token"


def _otp_key(identifier: str) -> str:
    return f"{OTP_PREFIX}:{identifier}"


def _otp_resend_key(identifier: str) -> str:
    return f"{OTP_RESEND_PREFIX}:{identifier}"


def _lockout_key(identifier: str) -> str:
    return f"{LOCKOUT_PREFIX}:{identifier}"


def get_otp_ttl_seconds() -> int:
    return getattr(settings, "AUTH_OTP_EXPIRY_MINUTES", 5) * 60


def get_otp_resend_ttl_seconds() -> int:
    return 3600


def get_max_resend_per_hour() -> int:
    return getattr(settings, "AUTH_OTP_MAX_RESEND_PER_HOUR", 3)


def otp_set(identifier: str, otp: str) -> None:
    """Store OTP for identifier; TTL from settings."""
    key = _otp_key(identifier)
    cache.set(key, otp, timeout=get_otp_ttl_seconds())


def otp_get(identifier: str) -> str | None:
    """Return OTP if present and not expired."""
    return cache.get(_otp_key(identifier))


def otp_delete(identifier: str) -> None:
    cache.delete(_otp_key(identifier))


def otp_resend_increment(identifier: str) -> int:
    """Increment resend count for the hour; returns new count."""
    key = _otp_resend_key(identifier)
    count = cache.get(key, 0) + 1
    cache.set(key, count, timeout=get_otp_resend_ttl_seconds())
    return count


def otp_resend_count(identifier: str) -> int:
    return cache.get(_otp_resend_key(identifier), 0)


def otp_can_resend(identifier: str) -> bool:
    return otp_resend_count(identifier) < get_max_resend_per_hour()


def lockout_set(identifier: str, minutes: int) -> None:
    """Mark identifier as locked for given minutes."""
    key = _lockout_key(identifier)
    cache.set(key, "1", timeout=minutes * 60)


def lockout_is_locked(identifier: str) -> bool:
    return cache.get(_lockout_key(identifier)) is not None


def lockout_clear(identifier: str) -> None:
    cache.delete(_lockout_key(identifier))


def token_blacklist_add(jti: str, ttl_seconds: int) -> None:
    """Blacklist a JWT by jti until TTL (e.g. refresh token lifetime)."""
    key = f"{BLACKLIST_PREFIX}:{jti}"
    cache.set(key, "1", timeout=ttl_seconds)


def token_blacklist_exists(jti: str) -> bool:
    return cache.get(f"{BLACKLIST_PREFIX}:{jti}") is not None


# Registration completion: short-lived token after OTP verify (phone only, no user yet)
def get_registration_token_ttl_seconds() -> int:
    minutes = getattr(settings, "AUTH_REGISTRATION_TOKEN_EXPIRY_MINUTES", 10)
    return int(minutes) * 60


def registration_token_set(token: str, phone: str) -> None:
    """Store verified phone for this registration token; used to complete signup."""
    key = f"{REGISTRATION_TOKEN_PREFIX}:{token}"
    cache.set(key, phone, timeout=get_registration_token_ttl_seconds())


def registration_token_get(token: str) -> str | None:
    """Return verified phone for this token, or None if invalid/expired."""
    key = f"{REGISTRATION_TOKEN_PREFIX}:{token}"
    return cache.get(key)


def registration_token_delete(token: str) -> None:
    cache.delete(f"{REGISTRATION_TOKEN_PREFIX}:{token}")
