"""
Authentication Utilities
Helper functions for authentication operations.
"""

import re
import secrets
import hashlib
import hmac
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

from django.conf import settings
from django.core.cache import cache
from django.utils import timezone

logger = logging.getLogger(__name__)


# =============================================================================
# PASSWORD UTILITIES
# =============================================================================
def generate_secure_password(length: int = 16) -> str:
    """
    Generate a cryptographically secure password.
    
    Args:
        length: Password length
    
    Returns:
        str: Generated password
    """
    alphabet = (
        string.ascii_uppercase +
        string.ascii_lowercase +
        string.digits +
        string.punctuation
    )
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def check_password_strength(password: str) -> Dict[str, Any]:
    """
    Check password strength.
    
    Args:
        password: Password to check
    
    Returns:
        dict: Strength assessment
    """
    score = 0
    feedback = []
    
    # Length check
    if len(password) >= 8:
        score += 1
    else:
        feedback.append("Password should be at least 8 characters")
    
    # Uppercase check
    if re.search(r'[A-Z]', password):
        score += 1
    else:
        feedback.append("Add uppercase letters")
    
    # Lowercase check
    if re.search(r'[a-z]', password):
        score += 1
    else:
        feedback.append("Add lowercase letters")
    
    # Number check
    if re.search(r'\d', password):
        score += 1
    else:
        feedback.append("Add numbers")
    
    # Special character check
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        score += 1
    else:
        feedback.append("Add special characters")
    
    # Common password check
    common_passwords = ['password', '123456', 'qwerty', 'admin', 'welcome']
    if password.lower() in common_passwords:
        score = 0
        feedback.append("Password is too common")
    
    return {
        'score': score,
        'strength': ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][min(score, 4)],
        'feedback': feedback,
        'is_valid': score >= 4
    }


# =============================================================================
# PHONE NUMBER UTILITIES
# =============================================================================
def normalize_phone(phone: str) -> str:
    """
    Normalize phone number format.
    
    Args:
        phone: Phone number string
    
    Returns:
        str: Normalized phone number
    """
    # Remove spaces, dashes, and parentheses
    phone = re.sub(r'[\s\-\(\)]', '', phone)
    
    # Add country code if missing
    if not phone.startswith('+'):
        # Assume Bangladesh if no country code
        if len(phone) == 10 and phone.startswith('0'):
            phone = '+88' + phone
        elif len(phone) == 11 and phone.startswith('01'):
            phone = '+88' + phone
        else:
            phone = '+' + phone
    
    return phone


def validate_phone(phone: str) -> bool:
    """
    Validate phone number format.
    
    Args:
        phone: Phone number string
    
    Returns:
        bool: True if valid
    """
    pattern = r'^\+?[1-9]\d{6,14}$'
    return bool(re.match(pattern, phone))


def format_phone_display(phone: str) -> str:
    """
    Format phone number for display.
    
    Args:
        phone: Phone number string
    
    Returns:
        str: Formatted phone number
    """
    phone = normalize_phone(phone)
    
    # Format as +880-1XXX-XXXXXX
    if phone.startswith('+88'):
        phone = phone[2:]
        if phone.startswith('1'):
            return f"+880 {phone[:3]} {phone[3:6]} {phone[6:]}"
    
    return phone


# =============================================================================
# TOKEN UTILITIES
# =============================================================================
def generate_token(length: int = 32) -> str:
    """
    Generate a secure random token.
    
    Args:
        length: Token length
    
    Returns:
        str: Generated token
    """
    return secrets.token_urlsafe(length)


def generate_otp(length: int = 6) -> str:
    """
    Generate numeric OTP.
    
    Args:
        length: OTP length
    
    Returns:
        str: Generated OTP
    """
    return ''.join(secrets.choice('0123456789') for _ in range(length))


def hash_token(token: str) -> str:
    """
    Hash a token for secure storage.
    
    Args:
        token: Token to hash
    
    Returns:
        str: Hashed token
    """
    return hashlib.sha256(token.encode()).hexdigest()


def verify_token_hash(token: str, hashed_token: str) -> bool:
    """
    Verify a token against its hash.
    
    Args:
        token: Original token
        hashed_token: Stored hash
    
    Returns:
        bool: True if match
    """
    return hmac.compare_digest(hash_token(token), hashed_token)


# =============================================================================
# IP ADDRESS UTILITIES
# =============================================================================
def get_client_ip(request) -> str:
    """
    Get client IP address from request.
    
    Args:
        request: HTTP request
    
    Returns:
        str: Client IP address
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '')
    return ip


def get_location_from_ip(ip: str) -> Optional[Dict[str, str]]:
    """
    Get location information from IP address.
    
    Args:
        ip: IP address
    
    Returns:
        dict: Location info or None
    """
    # TODO: Integrate with IP geolocation service
    # For now, return None
    return None


# =============================================================================
# DEVICE UTILITIES
# =============================================================================
def get_device_info(request) -> str:
    """
    Get device information from request.
    
    Args:
        request: HTTP request
    
    Returns:
        str: Device info string
    """
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    # Detect device type
    if 'Mobile' in user_agent:
        device = 'Mobile'
    elif 'Tablet' in user_agent or 'iPad' in user_agent:
        device = 'Tablet'
    else:
        device = 'Desktop'
    
    # Detect browser
    if 'Chrome' in user_agent:
        browser = 'Chrome'
    elif 'Firefox' in user_agent:
        browser = 'Firefox'
    elif 'Safari' in user_agent and 'Chrome' not in user_agent:
        browser = 'Safari'
    elif 'Edge' in user_agent:
        browser = 'Edge'
    else:
        browser = 'Unknown'
    
    return f"{device} - {browser}"


# =============================================================================
# CACHE UTILITIES
# =============================================================================
def cache_get_or_set(key: str, callback, timeout: int = 300) -> Any:
    """
    Get value from cache or set it using callback.
    
    Args:
        key: Cache key
        callback: Function to get value if not cached
        timeout: Cache timeout in seconds
    
    Returns:
        Cached or computed value
    """
    value = cache.get(key)
    if value is None:
        value = callback()
        cache.set(key, value, timeout)
    return value


def invalidate_cache_pattern(pattern: str) -> int:
    """
    Invalidate all cache keys matching pattern.
    
    Args:
        pattern: Pattern to match
    
    Returns:
        int: Number of keys deleted
    """
    # This is a simplified version - in production,
    # you might use Redis SCAN command
    keys = cache.keys(f"*{pattern}*")
    if keys:
        return cache.delete_many(keys)
    return 0


# =============================================================================
# TIME UTILITIES
# =============================================================================
def get_token_expiry(minutes: int = 60) -> datetime:
    """
    Get token expiry time.
    
    Args:
        minutes: Minutes from now
    
    Returns:
        datetime: Expiry time
    """
    return timezone.now() + timedelta(minutes=minutes)


def is_token_expired(expiry: datetime) -> bool:
    """
    Check if token is expired.
    
    Args:
        expiry: Expiry datetime
    
    Returns:
        bool: True if expired
    """
    return timezone.now() >= expiry


# =============================================================================
# IMPORT STRING
# =============================================================================
import string

def import_string(dotted_path: str):
    """
    Import a class from a dotted path.
    
    Args:
        dotted_path: Dotted path to class
    
    Returns:
        class: Imported class
    """
    from django.utils.module_loading import import_module
    from django.core.exceptions import ImproperlyConfigured
    
    module_path, class_name = dotted_path.rsplit('.', 1)
    
    try:
        module = import_module(module_path)
        return getattr(module, class_name)
    except (ImportError, AttributeError) as e:
        raise ImproperlyConfigured(f"Could not import '{dotted_path}': {e}")


# =============================================================================
# RESPONSE UTILITIES
# =============================================================================
def success_response(data: Any = None, message: str = "Success") -> Dict[str, Any]:
    """
    Create a success response.
    
    Args:
        data: Response data
        message: Success message
    
    Returns:
        dict: Success response
    """
    response = {
        'success': True,
        'message': message,
    }
    
    if data is not None:
        response['data'] = data
    
    return response


def error_response(message: str, code: str = "ERROR",
                  details: Dict = None) -> Dict[str, Any]:
    """
    Create an error response.
    
    Args:
        message: Error message
        code: Error code
        details: Additional error details
    
    Returns:
        dict: Error response
    """
    response = {
        'success': False,
        'error': message,
        'code': code,
    }
    
    if details:
        response['details'] = details
    
    return response


# =============================================================================
# AUDIT UTILITIES
# =============================================================================
def log_auth_event(event_type: str, user_id: str = None,
                  ip_address: str = None, details: Dict = None):
    """
    Log authentication event for audit.
    
    Args:
        event_type: Type of event
        user_id: User ID (optional)
        ip_address: IP address (optional)
        details: Additional details (optional)
    """
    log_data = {
        'event_type': event_type,
        'user_id': user_id,
        'ip_address': ip_address,
        'timestamp': timezone.now().isoformat(),
    }
    
    if details:
        log_data['details'] = details
    
    logger.info(f"AUTH EVENT: {log_data}")
