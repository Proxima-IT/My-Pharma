"""
Authentication Throttling
Rate limiting configuration for authentication endpoints.
"""

from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from django.core.cache import cache


# =============================================================================
# ANONYMOUS USER THROTTLING
# =============================================================================
class LoginRateThrottle(AnonRateThrottle):
    """
    Rate throttle for login endpoints.
    
    Limits:
    - Anonymous: 5 requests per minute
    """
    
    rate = '5/minute'
    
    def allow_request(self, request, view):
        """
        Custom allow_request to add lockout check.
        """
        # Check if IP is locked out
        ident = self.get_ident(request)
        lockout_key = f"lockout:{ident}"
        
        if cache.get(lockout_key):
            return False
        
        return super().allow_request(request, view)
    
    def throttle_failure(self, request):
        """
        Handle throttle failure.
        """
        ident = self.get_ident(request)
        lockout_key = f"lockout:{ident}"
        
        # Set lockout cache
        cache.set(lockout_key, True, 60)  # 1 minute lockout
        
        return super().throttle_failure(request)


class OTPRateThrottle(AnonRateThrottle):
    """
    Rate throttle for OTP endpoints.
    
    Limits:
    - Anonymous: 3 requests per minute
    """
    
    rate = '3/minute'


class RegistrationRateThrottle(AnonRateThrottle):
    """
    Rate throttle for registration endpoints.
    
    Limits:
    - Anonymous: 10 requests per hour
    """
    
    rate = '10/hour'


class PasswordResetRateThrottle(AnonRateThrottle):
    """
    Rate throttle for password reset endpoints.
    
    Limits:
    - Anonymous: 5 requests per hour
    """
    
    rate = '5/hour'


# =============================================================================
# AUTHENTICATED USER THROTTLING
# =============================================================================
class AuthenticatedUserRateThrottle(UserRateThrottle):
    """
    Rate throttle for authenticated user endpoints.
    
    Limits:
    - Authenticated: 1000 requests per hour
    """
    
    rate = '1000/hour'


class ProfileUpdateRateThrottle(UserRateThrottle):
    """
    Rate throttle for profile update endpoints.
    
    Limits:
    - Authenticated: 10 requests per minute
    """
    
    rate = '10/minute'


# =============================================================================
# SCOPED THROTTLING
# =============================================================================
class BurstRateThrottle(AnonRateThrottle):
    """
    Burst rate throttle for short periods of high activity.
    
    Limits:
    - Anonymous: 20 requests per minute
    """
    
    rate = '20/minute'


class SustainedRateThrottle(AnonRateThrottle):
    """
    Sustained rate throttle for normal usage.
    
    Limits:
    - Anonymous: 100 requests per hour
    """
    
    rate = '100/hour'


# =============================================================================
# THROTTLE HELPERS
# =============================================================================
class ThrottleManager:
    """
    Manager for custom throttle operations.
    """
    
    @staticmethod
    def check_ip_lockout(ident: str) -> bool:
        """
        Check if IP is currently locked out.
        
        Args:
            ident: Client identifier (IP or user ID)
        
        Returns:
            bool: True if locked out
        """
        lockout_key = f"lockout:{ident}"
        return bool(cache.get(lockout_key))
    
    @staticmethod
    def lockout_ip(ident: str, duration: int = 60) -> None:
        """
        Lock out an IP for specified duration.
        
        Args:
            ident: Client identifier
            duration: Lockout duration in seconds
        """
        lockout_key = f"lockout:{ident}"
        cache.set(lockout_key, True, duration)
    
    @staticmethod
    def record_attempt(ident: str, max_attempts: int = 5,
                      window: int = 3600) -> tuple:
        """
        Record a failed attempt and check if threshold reached.
        
        Args:
            ident: Client identifier
            max_attempts: Maximum allowed attempts
            window: Time window in seconds
        
        Returns:
            tuple: (attempts_remaining, is_locked_out)
        """
        attempts_key = f"attempts:{ident}"
        attempts = cache.get(attempts_key, 0) + 1
        
        cache.set(attempts_key, attempts, window)
        
        remaining = max(0, max_attempts - attempts)
        is_locked_out = attempts >= max_attempts
        
        if is_locked_out:
            ThrottleManager.lockout_ip(ident, 1800)  # 30 min lockout
        
        return remaining, is_locked_out
    
    @staticmethod
    def reset_attempts(ident: str) -> None:
        """
        Reset failed attempts counter.
        
        Args:
            ident: Client identifier
        """
        attempts_key = f"attempts:{ident}"
        cache.delete(attempts_key)


# =============================================================================
# RATE LIMIT UTILITY FUNCTIONS
# =============================================================================
def get_client_identifier(request) -> str:
    """
    Get unique client identifier for rate limiting.
    
    Args:
        request: HTTP request
    
    Returns:
        str: Client identifier (IP or user ID)
    """
    if request.user and request.user.is_authenticated:
        return f"user:{request.user.id}"
    
    # Get IP address
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '')
    
    return f"ip:{ip}"


def check_rate_limit(request, rate: str = '10/minute') -> tuple:
    """
    Check if request is within rate limit.
    
    Args:
        request: HTTP request
        rate: Rate limit string (e.g., '10/minute')
    
    Returns:
        tuple: (is_allowed, remaining, reset_time)
    """
    from django.core.cache import cache
    from django.utils.cache import memcache_version
    
    ident = get_client_identifier(request)
    key = f"rate:{ident}:{rate}"
    
    # Parse rate limit
    count, period = rate.split('/')
    
    # Get current count
    count = cache.get(key, 0)
    
    # Get TTL
    ttl = cache.ttl(key) if hasattr(cache, 'ttl') else 60
    
    # Check if over limit
    limit = int(count)
    if count >= limit:
        return False, 0, ttl
    
    # Increment count
    period_seconds = {'s': 1, 'm': 60, 'h': 3600, 'd': 86400}
    period_value = int(period[:-1])
    period_unit = period[-1]
    expire_seconds = period_value * period_seconds.get(period_unit, 60)
    
    cache.incr(key)
    if count == 0:
        cache.expire(key, expire_seconds)
    
    remaining = limit - count - 1
    
    return True, remaining, expire_seconds
