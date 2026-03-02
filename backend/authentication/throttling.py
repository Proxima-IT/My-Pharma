"""
Rate limiting for auth endpoints: login, OTP send, OTP verify.
Uses DRF throttle classes and Redis-backed cache.
"""
from rest_framework.throttling import SimpleRateThrottle


class AuthRateThrottle(SimpleRateThrottle):
    """Generic auth throttle; rate from settings 'auth'."""
    scope = "auth"
    rate = "10/minute"

    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return None
        ident = self.get_ident(request)
        return self.cache_format % {"scope": self.scope, "ident": ident}


class LoginRateThrottle(SimpleRateThrottle):
    """Login attempts per IP."""
    scope = "login"
    rate = "5/minute"

    def get_cache_key(self, request, view):
        return self.cache_format % {"scope": self.scope, "ident": self.get_ident(request)}


class OTPSendRateThrottle(SimpleRateThrottle):
    """OTP send per phone/identifier per hour (stricter than default)."""
    scope = "otp_send"
    rate = "3/hour"

    def get_cache_key(self, request, view):
        phone = request.data.get("phone") or request.query_params.get("phone") or ""
        if not phone:
            return self.cache_format % {"scope": self.scope, "ident": self.get_ident(request)}
        return self.cache_format % {"scope": self.scope, "ident": f"phone:{phone}"}


class OTPVerifyRateThrottle(SimpleRateThrottle):
    """OTP verify attempts per IP."""
    scope = "otp_verify"
    rate = "10/minute"

    def get_cache_key(self, request, view):
        return self.cache_format % {"scope": self.scope, "ident": self.get_ident(request)}
