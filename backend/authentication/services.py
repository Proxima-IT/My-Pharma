"""
Authentication Services
Business logic layer for authentication operations.
"""

import random
import string
import logging
from datetime import timedelta
from typing import Optional, Dict, Any, Tuple

from django.conf import settings
from django.utils import timezone
from django.core.cache import cache
from django.core.mail import send_mail
from django.db import transaction

from rest_framework_simplejwt.tokens import RefreshToken

from authentication.models import (
    User, OTPVerification, EmailVerificationToken,
    PasswordResetToken, UserSession, BlacklistedToken,
    UserRole, UserStatus
)

logger = logging.getLogger(__name__)


# =============================================================================
# OTP SERVICE
# =============================================================================
class OTPService:
    """
    OTP generation and verification service.
    Uses Redis for storage and rate limiting.
    """
    
    OTP_CACHE_KEY = "otp:{phone}:{purpose}"
    OTP_ATTEMPTS_KEY = "otp_attempts:{phone}"
    OTP_RESEND_KEY = "otp_resend:{phone}"
    
    @classmethod
    def generate_otp(cls, length: int = 6) -> str:
        """
        Generate numeric OTP.
        
        Args:
            length: OTP length (default 6)
        
        Returns:
            str: Numeric OTP string
        """
        return ''.join(random.choices(string.digits, k=length))
    
    @classmethod
    def get_cache_key(cls, phone: str, purpose: str) -> str:
        """Get Redis cache key for OTP."""
        return cls.OTP_CACHE_KEY.format(phone=phone, purpose=purpose)
    
    @classmethod
    def store_otp(cls, phone: str, otp: str, purpose: str) -> bool:
        """
        Store OTP in Redis with expiry.
        
        Args:
            phone: Phone number
            otp: OTP string
            purpose: OTP purpose (registration, login, etc.)
        
        Returns:
            bool: Success status
        """
        key = cls.get_cache_key(phone, purpose)
        expiry_minutes = settings.OTP_EXPIRY_MINUTES
        
        # Store OTP data as JSON
        otp_data = {
            'otp': otp,
            'phone': phone,
            'purpose': purpose,
            'created_at': timezone.now().isoformat(),
        }
        
        cache.set(key, otp_data, expiry_minutes * 60)
        
        # Set resend cooldown
        resend_key = cls.OTP_RESEND_KEY.format(phone=phone)
        cache.set(resend_key, True, 3600)  # 1 hour cooldown
        
        logger.info(f"OTP stored for {phone} with purpose {purpose}")
        return True
    
    @classmethod
    def get_otp(cls, phone: str, purpose: str) -> Optional[str]:
        """
        Get stored OTP from Redis.
        
        Args:
            phone: Phone number
            purpose: OTP purpose
        
        Returns:
            str: OTP or None if not found
        """
        key = cls.get_cache_key(phone, purpose)
        otp_data = cache.get(key)
        
        if otp_data:
            return otp_data.get('otp')
        return None
    
    @classmethod
    def verify_otp(cls, phone: str, otp: str, purpose: str) -> Tuple[bool, str]:
        """
        Verify OTP.
        
        Args:
            phone: Phone number
            otp: OTP to verify
            purpose: OTP purpose
        
        Returns:
            tuple: (success: bool, message: str)
        """
        key = cls.get_cache_key(phone, purpose)
        otp_data = cache.get(key)
        
        if not otp_data:
            return False, "OTP has expired or not found"
        
        # Check if OTP matches
        if otp_data.get('otp') != otp:
            return False, "Invalid OTP"
        
        # Clear OTP after successful verification
        cache.delete(key)
        
        logger.info(f"OTP verified for {phone} with purpose {purpose}")
        return True, "OTP verified successfully"
    
    @classmethod
    def can_resend_otp(cls, phone: str) -> Tuple[bool, int]:
        """
        Check if OTP can be resend.
        
        Args:
            phone: Phone number
        
        Returns:
            tuple: (can_resend: bool, remaining_seconds: int)
        """
        resend_key = cls.OTP_RESEND_KEY.format(phone=phone)
        is_in_cooldown = cache.get(resend_key)
        
        if is_in_cooldown:
            # Get remaining TTL
            ttl = cache.ttl(resend_key)
            return False, max(0, ttl)
        
        return True, 0
    
    @classmethod
    def check_max_resend_attempts(cls, phone: str) -> Tuple[bool, int]:
        """
        Check if max resend attempts reached.
        
        Args:
            phone: Phone number
        
        Returns:
            tuple: (can_resend: bool, attempts_remaining: int)
        """
        attempts_key = f"{cls.OTP_ATTEMPTS_KEY}:{phone}"
        attempts = cache.get(attempts_key, 0)
        max_attempts = settings.OTP_MAX_RESEND_ATTEMPTS
        
        remaining = max_attempts - attempts
        
        if attempts >= max_attempts:
            return False, 0
        
        return True, remaining
    
    @classmethod
    def increment_resend_attempts(cls, phone: str) -> int:
        """
        Increment resend attempts counter.
        
        Args:
            phone: Phone number
        
        Returns:
            int: Current attempt count
        """
        attempts_key = f"{cls.OTP_ATTEMPTS_KEY}:{phone}"
        attempts = cache.incr(attempts_key)
        
        # Set expiry if first attempt
        if attempts == 1:
            cache.expire(attempts_key, 3600)  # 1 hour
        
        return attempts
    
    @classmethod
    def cleanup_otp_attempts(cls, phone: str):
        """Clean up OTP attempts for phone."""
        attempts_key = f"{cls.OTP_ATTEMPTS_KEY}:{phone}"
        cache.delete(attempts_key)


# =============================================================================
# JWT TOKEN SERVICE
# =============================================================================
class TokenService:
    """
    JWT token generation and management service.
    """
    
    @classmethod
    def generate_tokens(cls, user: User) -> Dict[str, str]:
        """
        Generate access and refresh tokens for user.
        
        Args:
            user: User instance
        
        Returns:
            dict: Token data with access, refresh, and expires_in
        """
        refresh = RefreshToken.for_user(user)
        
        # Add custom claims
        refresh['role'] = user.role
        refresh['phone'] = user.phone
        refresh['user_id'] = str(user.id)
        
        # Get expiry times
        access_token_lifetime = settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']
        refresh_token_lifetime = settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']
        
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'token_type': 'Bearer',
            'expires_in': int(access_token_lifetime.total_seconds()),
            'refresh_expires_in': int(refresh_token_lifetime.total_seconds()),
        }
    
    @classmethod
    def refresh_access_token(cls, refresh_token: str) -> Optional[Dict[str, str]]:
        """
        Refresh access token using refresh token.
        
        Args:
            refresh_token: Refresh token string
        
        Returns:
            dict: New token data or None if invalid
        """
        try:
            token = RefreshToken(refresh_token)
            
            # Check if token is blacklisted
            if BlacklistedToken.objects.filter(token=str(token)).exists():
                return None
            
            # Generate new tokens
            user_id = token['user_id']
            user = User.objects.get(id=user_id)
            
            return cls.generate_tokens(user)
            
        except Exception as e:
            logger.warning(f"Token refresh failed: {str(e)}")
            return None
    
    @classmethod
    def blacklist_token(cls, token: str, token_type: str = 'ACCESS', 
                       user: Optional[User] = None, expires_in_days: int = 7):
        """
        Add token to blacklist.
        
        Args:
            token: Token string
            token_type: Token type (ACCESS or REFRESH)
            user: User instance (optional)
            expires_in_days: Days until token naturally expires
        """
        try:
            from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
            
            # Add to Django REST Framework blacklist
            token_obj = token.payload
            jti = token_obj.get('jti')
            
            # Store in our blacklist table
            BlacklistedToken.objects.create(
                token=token,
                user=user,
                token_type=token_type,
                expires_at=timezone.now() + timedelta(days=expires_in_days)
            )
            
            logger.info(f"Token blacklisted for user {user.id if user else 'anonymous'}")
            
        except Exception as e:
            logger.error(f"Failed to blacklist token: {str(e)}")
    
    @classmethod
    def create_session(cls, user: User, token_jti: str, device_info: str,
                      ip_address: str, user_agent: str, expires_in_days: int = 7):
        """
        Create user session record.
        
        Args:
            user: User instance
            token_jti: JWT ID
            device_info: Device information
            ip_address: IP address
            user_agent: User agent string
            expires_in_days: Session validity
        
        Returns:
            UserSession: Created session
        """
        session = UserSession.objects.create(
            user=user,
            token_jti=token_jti,
            device_info=device_info,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=timezone.now() + timedelta(days=expires_in_days)
        )
        
        logger.info(f"Session created for user {user.id}")
        return session
    
    @classmethod
    def deactivate_session(cls, token_jti: str):
        """
        Deactivate user session.
        
        Args:
            token_jti: JWT ID
        """
        UserSession.objects.filter(token_jti=token_jti).update(is_active=False)
        logger.info(f"Session deactivated: {token_jti}")


# =============================================================================
# AUTHENTICATION SERVICE
# =============================================================================
class AuthenticationService:
    """
    Main authentication service combining all auth methods.
    """
    
    @classmethod
    def authenticate_phone(cls, phone: str, otp: str, purpose: str = 'LOGIN') -> Tuple[Optional[User], str]:
        """
        Authenticate user using phone and OTP.
        
        Args:
            phone: Phone number
            otp: OTP code
            purpose: OTP purpose
        
        Returns:
            tuple: (User instance or None, message)
        """
        # Verify OTP
        success, message = OTPService.verify_otp(phone, otp, purpose)
        
        if not success:
            return None, message
        
        # Get or create user
        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            return None, "User not found. Please register first."
        
        # Check if user can login
        if not user.can_login:
            return None, "Account is locked or inactive"
        
        # Update login info
        user.reset_failed_login()
        
        logger.info(f"Phone authentication successful for {phone}")
        return user, "Authentication successful"
    
    @classmethod
    def authenticate_email(cls, email: str, password: str) -> Tuple[Optional[User], str]:
        """
        Authenticate user using email and password.
        
        Args:
            email: Email address
            password: Password
        
        Returns:
            tuple: (User instance or None, message)
        """
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return None, "Invalid email or password"
        
        # Check if user has password
        if not user.has_usable_password():
            return None, "This account uses phone authentication. Please login with phone."
        
        # Check if user can login
        if not user.can_login:
            return None, "Account is locked or inactive"
        
        # Verify password
        if not user.check_password(password):
            user.increment_failed_login(
                settings.ACCOUNT_LOCKOUT_THRESHOLD,
                settings.ACCOUNT_LOCKOUT_DURATION_MINUTES
            )
            return None, "Invalid email or password"
        
        # Reset failed attempts on success
        user.reset_failed_login()
        
        logger.info(f"Email authentication successful for {email}")
        return user, "Authentication successful"
    
    @classmethod
    def login(cls, user: User, request) -> Dict[str, Any]:
        """
        Complete login process for user.
        
        Args:
            user: User instance
            request: HTTP request
        
        Returns:
            dict: Login response with tokens and user data
        """
        # Generate tokens
        tokens = TokenService.generate_tokens(user)
        
        # Get device info
        device_info = cls.get_device_info(request)
        
        # Get client info
        ip_address = cls.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]
        
        # Create session
        TokenService.create_session(
            user=user,
            token_jti=tokens['refresh']['jti'] if 'jti' in tokens['refresh'] else str(user.id),
            device_info=device_info,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        # Update last login
        user.last_login_ip = ip_address
        user.last_login_device = device_info
        user.save(update_fields=['last_login_ip', 'last_login_device'])
        
        logger.info(f"User {user.phone} logged in from {ip_address}")
        
        return {
            'tokens': tokens,
            'user': {
                'id': str(user.id),
                'phone': user.phone,
                'email': user.email,
                'role': user.role,
                'role_display': user.get_role_display(),
                'is_verified': user.is_verified,
                'full_name': user.full_name,
            }
        }
    
    @classmethod
    def logout(cls, user: User, token: str, token_type: str = 'REFRESH'):
        """
        Logout user and blacklist token.
        
        Args:
            user: User instance
            token: Token string
            token_type: Token type
        """
        TokenService.blacklist_token(token, token_type, user)
        logger.info(f"User {user.phone} logged out")
    
    @classmethod
    def get_client_ip(cls, request) -> str:
        """Get client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        return ip
    
    @classmethod
    def get_device_info(cls, request) -> str:
        """Get device info from request."""
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Simple device detection
        if 'Mobile' in user_agent:
            device = 'Mobile'
        elif 'Tablet' in user_agent:
            device = 'Tablet'
        else:
            device = 'Desktop'
        
        # Get browser
        if 'Chrome' in user_agent:
            browser = 'Chrome'
        elif 'Firefox' in user_agent:
            browser = 'Firefox'
        elif 'Safari' in user_agent:
            browser = 'Safari'
        elif 'Edge' in user_agent:
            browser = 'Edge'
        else:
            browser = 'Unknown'
        
        return f"{device} - {browser}"


# =============================================================================
# REGISTRATION SERVICE
# =============================================================================
class RegistrationService:
    """
    User registration service.
    """
    
    @classmethod
    def register_phone(cls, phone: str, otp: str, **extra_data) -> Tuple[Optional[User], str]:
        """
        Register user with phone number and OTP.
        
        Args:
            phone: Phone number
            otp: OTP code
            **extra_data: Additional user data
        
        Returns:
            tuple: (User instance or None, message)
        """
        # Verify OTP
        success, message = OTPService.verify_otp(phone, otp, 'REGISTRATION')
        
        if not success:
            return None, message
        
        # Check if user already exists
        if User.objects.filter(phone=phone).exists():
            return None, "User with this phone already exists"
        
        # Create user
        with transaction.atomic():
            user = User.objects.create_user(
                phone=phone,
                role=UserRole.REGISTERED_USER,
                status=UserStatus.ACTIVE,
                is_verified=True,
                phone_verified_at=timezone.now(),
                **extra_data
            )
        
        # Clean up OTP attempts
        OTPService.cleanup_otp_attempts(phone)
        
        logger.info(f"User registered with phone: {phone}")
        return user, "Registration successful"
    
    @classmethod
    def register_email(cls, email: str, password: str, first_name: str = '',
                      last_name: str = '') -> Tuple[Optional[User], str]:
        """
        Register user with email and password.
        
        Args:
            email: Email address
            password: Password
            first_name: First name
            last_name: Last name
        
        Returns:
            tuple: (User instance or None, message)
        """
        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return None, "User with this email already exists"
        
        # Generate phone number placeholder
        phone = f"email_{email.replace('@', '_at_')}"
        
        # Create user
        with transaction.atomic():
            user = User.objects.create_user(
                phone=phone,
                email=email,
                password=password,
                role=UserRole.REGISTERED_USER,
                status=UserStatus.PENDING_VERIFICATION,
                first_name=first_name,
                last_name=last_name,
            )
        
        # Send verification email
        EmailService.send_verification_email(user)
        
        logger.info(f"User registered with email: {email}")
        return user, "Registration successful. Please verify your email."


# =============================================================================
# EMAIL SERVICE
# =============================================================================
class EmailService:
    """
    Email sending service.
    """
    
    @classmethod
    def send_verification_email(cls, user: User):
        """
        Send email verification email.
        
        Args:
            user: User instance
        """
        # Generate verification token
        token = ''.join(random.choices(string.ascii_letters + string.digits, k=64))
        
        # Create token record
        expires_at = timezone.now() + timedelta(hours=24)
        EmailVerificationToken.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
        
        # Build verification URL
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        
        # Send email
        subject = 'Verify Your Email - My Pharma'
        message = f"""
        Hello {user.full_name},
        
        Thank you for registering with My Pharma. Please verify your email address by clicking the link below:
        
        {verification_url}
        
        This link will expire in 24 hours.
        
        If you did not create an account with My Pharma, please ignore this email.
        
        Best regards,
        My Pharma Team
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        logger.info(f"Verification email sent to {user.email}")
    
    @classmethod
    def send_password_reset_email(cls, user: User):
        """
        Send password reset email.
        
        Args:
            user: User instance
        """
        # Generate reset token
        token = ''.join(random.choices(string.ascii_letters + string.digits, k=64))
        
        # Create token record
        expires_at = timezone.now() + timedelta(hours=1)
        
        # Get client info for security
        PasswordResetToken.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
        
        # Build reset URL
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        
        # Send email
        subject = 'Password Reset - My Pharma'
        message = f"""
        Hello {user.full_name},
        
        You requested a password reset for your My Pharma account. Click the link below to reset your password:
        
        {reset_url}
        
        This link will expire in 1 hour.
        
        If you did not request this password reset, please ignore this email or contact support if you have concerns.
        
        Best regards,
        My Pharma Team
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        logger.info(f"Password reset email sent to {user.email}")
