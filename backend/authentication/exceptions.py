"""
Authentication Exceptions
Custom exception handling for authentication API.
"""

import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


# =============================================================================
# CUSTOM EXCEPTION CLASSES
# =============================================================================
class AuthenticationError(Exception):
    """Base authentication exception."""
    
    def __init__(self, message: str, code: str = 'AUTH_ERROR', status_code: int = 400):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)


class InvalidCredentialsError(AuthenticationError):
    """Raised when invalid credentials are provided."""
    
    def __init__(self, message: str = "Invalid credentials"):
        super().__init__(
            message=message,
            code='INVALID_CREDENTIALS',
            status_code=401
        )


class AccountLockedError(AuthenticationError):
    """Raised when account is locked."""
    
    def __init__(self, message: str = "Account is locked"):
        super().__init__(
            message=message,
            code='ACCOUNT_LOCKED',
            status_code=403
        )


class AccountInactiveError(AuthenticationError):
    """Raised when account is inactive."""
    
    def __init__(self, message: str = "Account is inactive"):
        super().__init__(
            message=message,
            code='ACCOUNT_INACTIVE',
            status_code=403
        )


class OTPError(AuthenticationError):
    """Base OTP exception."""
    
    def __init__(self, message: str = "OTP verification failed"):
        super().__init__(
            message=message,
            code='OTP_ERROR',
            status_code=400
        )


class OTPExpiredError(OTPError):
    """Raised when OTP has expired."""
    
    def __init__(self, message: str = "OTP has expired"):
        super().__init__(message)
        self.code = 'OTP_EXPIRED'


class OTPInvalidError(OTPError):
    """Raised when OTP is invalid."""
    
    def __init__(self, message: str = "Invalid OTP"):
        super().__init__(message)
        self.code = 'OTP_INVALID'


class OTPAttemptsExceededError(OTPError):
    """Raised when max OTP attempts exceeded."""
    
    def __init__(self, message: str = "Maximum OTP attempts exceeded"):
        super().__init__(message)
        self.code = 'OTP_ATTEMPTS_EXCEEDED'


class TokenError(AuthenticationError):
    """Base token exception."""
    
    def __init__(self, message: str = "Token error"):
        super().__init__(
            message=message,
            code='TOKEN_ERROR',
            status_code=401
        )


class TokenExpiredError(TokenError):
    """Raised when token has expired."""
    
    def __init__(self, message: str = "Token has expired"):
        super().__init__(message)
        self.code = 'TOKEN_EXPIRED'


class TokenInvalidError(TokenError):
    """Raised when token is invalid."""
    
    def __init__(self, message: str = "Invalid token"):
        super().__init__(message)
        self.code = 'TOKEN_INVALID'


class TokenRevokedError(TokenError):
    """Raised when token has been revoked."""
    
    def __init__(self, message: str = "Token has been revoked"):
        super().__init__(message)
        self.code = 'TOKEN_REVOKED'


class PermissionError(AuthenticationError):
    """Raised when user lacks permission."""
    
    def __init__(self, message: str = "Permission denied"):
        super().__init__(
            message=message,
            code='PERMISSION_DENIED',
            status_code=403
        )


class RateLimitError(AuthenticationError):
    """Raised when rate limit is exceeded."""
    
    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__(
            message=message,
            code='RATE_LIMIT_EXCEEDED',
            status_code=429
        )


class ValidationError(AuthenticationError):
    """Raised when validation fails."""
    
    def __init__(self, message: str = "Validation failed", details: dict = None):
        super().__init__(
            message=message,
            code='VALIDATION_ERROR',
            status_code=400
        )
        self.details = details


class UserNotFoundError(AuthenticationError):
    """Raised when user is not found."""
    
    def __init__(self, message: str = "User not found"):
        super().__init__(
            message=message,
            code='USER_NOT_FOUND',
            status_code=404
        )


class UserAlreadyExistsError(AuthenticationError):
    """Raised when user already exists."""
    
    def __init__(self, message: str = "User already exists"):
        super().__init__(
            message=message,
            code='USER_EXISTS',
            status_code=400
        )


# =============================================================================
# CUSTOM EXCEPTION HANDLER
# =============================================================================
def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF.
    
    Args:
        exc: Exception instance
        context: Additional context
    
    Returns:
        Response: Error response
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Handle our custom exceptions
    if isinstance(exc, AuthenticationError):
        logger.warning(
            f"Authentication error: {exc.code} - {exc.message}",
            extra={'code': exc.code}
        )
        
        error_response = {
            'success': False,
            'error': exc.message,
            'code': exc.code,
        }
        
        if hasattr(exc, 'details') and exc.details:
            error_response['details'] = exc.details
        
        return Response(error_response, status=exc.status_code)
    
    # Handle RateLimitError
    if isinstance(exc, RateLimitError):
        logger.warning(f"Rate limit exceeded: {exc.message}")
        
        return Response(
            {
                'success': False,
                'error': exc.message,
                'code': exc.code,
            },
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
    
    # Log unexpected errors
    if response is None:
        logger.exception(f"Unhandled exception: {exc}")
        
        return Response(
            {
                'success': False,
                'error': 'An unexpected error occurred',
                'code': 'INTERNAL_ERROR',
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Add success field to DRF error responses
    if response is not None:
        error_data = response.data.copy() if hasattr(response, 'data') else {}
        
        # Format DRF errors
        if isinstance(error_data, dict):
            # Handle DRF validation errors
            if 'detail' in error_data:
                error_data = {
                    'success': False,
                    'error': str(error_data['detail']),
                    'code': 'ERROR',
                }
            else:
                error_data = {
                    'success': False,
                    'error': 'Validation failed',
                    'code': 'VALIDATION_ERROR',
                    'details': error_data,
                }
        elif isinstance(error_data, list):
            error_data = {
                'success': False,
                'error': error_data[0] if error_data else 'An error occurred',
                'code': 'ERROR',
            }
        
        response.data = error_data
    
    return response


# =============================================================================
# EXCEPTION HELPERS
# =============================================================================
def handle_auth_error(func):
    """
    Decorator to handle authentication errors.
    
    Args:
        func: Function to wrap
    
    Returns:
        Wrapped function
    """
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except AuthenticationError as e:
            raise e
        except Exception as e:
            logger.error(f"Unexpected error in {func.__name__}: {str(e)}")
            raise AuthenticationError(
                message="An unexpected error occurred",
                code='INTERNAL_ERROR',
                status_code=500
            )
    
    return wrapper
