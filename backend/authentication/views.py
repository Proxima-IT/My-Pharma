"""
Authentication Views
API views for authentication endpoints.
"""

import logging
import random
import string
from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from django.core.cache import cache
from django.db import transaction

from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from authentication.models import (
    User, OTPVerification, BlacklistedToken,
    UserRole, UserStatus
)
from authentication.serializers import (
    UserSerializer, UserProfileUpdateSerializer,
    PhoneRegistrationInitSerializer, PhoneRegistrationVerifySerializer,
    PhoneLoginInitSerializer, PhoneLoginVerifySerializer,
    EmailRegistrationSerializer, EmailLoginSerializer,
    TokenRefreshSerializer, LogoutSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    ChangePasswordSerializer, OTPSendSerializer, OTPVerifySerializer,
)
from authentication.services import (
    OTPService, TokenService, AuthenticationService,
    RegistrationService, EmailService
)
from authentication.permissions import RoleBasedPermission
from authentication.throttling import LoginRateThrottle, OTPRateThrottle

logger = logging.getLogger(__name__)


# =============================================================================
# OTP VIEWS
# =============================================================================
class OTPSendView(APIView):
    """
    API endpoint to send OTP to phone number.
    
    POST /api/auth/otp/send/
    
    Request body:
    {
        "phone": "+8801712345678",
        "purpose": "REGISTRATION" | "LOGIN" | "PASSWORD_RESET"
    }
    
    Response:
    {
        "success": true,
        "message": "OTP sent successfully",
        "expires_in": 300,
        "resend_available_in": 60
    }
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [OTPRateThrottle]
    
    def post(self, request):
        """Send OTP to phone number."""
        serializer = OTPSendSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'error': 'Validation failed',
                    'code': 'VALIDATION_ERROR',
                    'details': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        phone = serializer.validated_data['phone']
        purpose = serializer.validated_data['purpose']
        
        # Check resend cooldown
        can_resend, remaining = OTPService.can_resend_otp(phone)
        if not can_resend:
            return Response(
                {
                    'success': False,
                    'error': f'OTP resend cooldown active. Try again in {remaining} seconds.',
                    'code': 'OTP_COOLDOWN',
                    'details': {'retry_in_seconds': remaining}
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        # Generate OTP
        otp = OTPService.generate_otp(settings.OTP_LENGTH)
        
        # Store OTP
        OTPService.store_otp(phone, otp, purpose)
        
        # Log OTP for development
        logger.info(f"OTP for {phone}: {otp} (purpose: {purpose})")
        
        # Send via Celery if SMS gateway configured
        if settings.SMS_GATEWAY_URL:
            from authentication.tasks import send_otp_sms_task
            send_otp_sms_task.delay(phone, otp, purpose)
        
        return Response(
            {
                'success': True,
                'message': 'OTP sent successfully',
                'expires_in': settings.OTP_EXPIRY_MINUTES * 60,
                'resend_available_in': 60
            },
            status=status.HTTP_200_OK
        )


class OTPVerifyView(APIView):
    """
    API endpoint to verify OTP.
    
    POST /api/auth/otp/verify/
    """
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Verify OTP."""
        serializer = OTPVerifySerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'error': 'Validation failed',
                    'code': 'VALIDATION_ERROR',
                    'details': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        phone = serializer.validated_data['phone']
        otp = serializer.validated_data['otp']
        purpose = serializer.validated_data['purpose']
        
        # Verify OTP
        success, message = OTPService.verify_otp(phone, otp, purpose)
        
        if not success:
            return Response(
                {
                    'success': False,
                    'error': message,
                    'code': 'OTP_INVALID'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            {
                'success': True,
                'message': 'OTP verified successfully',
                'verified_for': purpose.lower()
            },
            status=status.HTTP_200_OK
        )


# =============================================================================
# PHONE REGISTRATION VIEWS
# =============================================================================
class PhoneRegistrationInitView(APIView):
    """
    Initiate phone registration by sending OTP.
    
    POST /api/auth/register/phone/init/
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [OTPRateThrottle]
    
    def post(self, request):
        """Send OTP for registration."""
        serializer = PhoneRegistrationInitSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'error': 'Validation failed',
                    'code': 'VALIDATION_ERROR',
                    'details': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        phone = serializer.validated_data['phone']
        
        # Generate and send OTP
        otp = OTPService.generate_otp(settings.OTP_LENGTH)
        OTPService.store_otp(phone, otp, 'REGISTRATION')
        
        logger.info(f"Registration OTP for {phone}: {otp}")
        
        if settings.SMS_GATEWAY_URL:
            from authentication.tasks import send_otp_sms_task
            send_otp_sms_task.delay(phone, otp, 'REGISTRATION')
        
        return Response(
            {
                'success': True,
                'message': 'OTP sent for registration',
                'expires_in': settings.OTP_EXPIRY_MINUTES * 60
            },
            status=status.HTTP_200_OK
        )


class PhoneRegistrationVerifyView(APIView):
    """
    Verify OTP and create user account.
    
    POST /api/auth/register/phone/verify/
    """
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Verify OTP and create account."""
        serializer = PhoneRegistrationVerifySerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'error': 'Validation failed',
                    'code': 'VALIDATION_ERROR',
                    'details': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        phone = serializer.validated_data['phone']
        otp = serializer.validated_data['otp']
        first_name = serializer.validated_data.get('first_name', '')
        last_name = serializer.validated_data.get('last_name', '')
        
        # Verify OTP and create user
        user, message = RegistrationService.register_phone(
            phone=phone,
            otp=otp,
            first_name=first_name,
            last_name=last_name
        )
        
        if not user:
            return Response(
                {
                    'success': False,
                    'error': message,
                    'code': 'REGISTRATION_FAILED'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate tokens
        tokens = TokenService.generate_tokens(user)
        
        return Response(
            {
                'success': True,
                'message': 'Registration successful',
                'tokens': tokens,
                'user': {
                    'id': str(user.id),
                    'phone': user.phone,
                    'role': user.role,
                    'role_display': user.get_role_display()
                }
            },
            status=status.HTTP_201_CREATED
        )


# =============================================================================
# PHONE LOGIN VIEWS
# =============================================================================
class PhoneLoginInitView(APIView):
    """
    Initiate phone login by sending OTP.
    
    POST /api/auth/login/phone/init/
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]
    
    def post(self, request):
        """Send OTP for login."""
        serializer = PhoneLoginInitSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'error': 'Validation failed',
                    'code': 'VALIDATION_ERROR',
                    'details': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        phone = serializer.validated_data['phone']
        
        # Check if user exists
        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            return Response(
                {
                    'success': False,
                    'error': 'User not found',
                    'code': 'USER_NOT_FOUND'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user can login
        if not user.can_login:
            return Response(
                {
                    'success': False,
                    'error': 'Account is locked or inactive',
                    'code': 'ACCOUNT_LOCKED'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Generate and send OTP
        otp = OTPService.generate_otp(settings.OTP_LENGTH)
        OTPService.store_otp(phone, otp, 'LOGIN')
        
        logger.info(f"Login OTP for {phone}: {otp}")
        
        if settings.SMS_GATEWAY_URL:
            from authentication.tasks import send_otp_sms_task
            send_otp_sms_task.delay(phone, otp, 'LOGIN')
        
        return Response(
            {
                'success': True,
                'message': 'OTP sent for login',
                'expires_in': settings.OTP_EXPIRY_MINUTES * 60
            },
            status=status.HTTP_200_OK
        )


class PhoneLoginVerifyView(APIView):
    """
    Verify OTP and login user.
    
    POST /api/auth/login/phone/verify/
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]
    
    def post(self, request):
        """Verify OTP and login."""
        serializer = PhoneLoginVerifySerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'error': 'Validation failed',
                    'code': 'VALIDATION_ERROR',
                    'details': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        phone = serializer.validated_data['phone']
        otp = serializer.validated_data['otp']
        
        # Authenticate
        user, message = AuthenticationService.authenticate_phone(phone, otp, 'LOGIN')
        
        if not user:
            return Response(
                {
                    'success': False,
                    'error': message,
                    'code': 'AUTHENTICATION_FAILED'
                },
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Complete login
        result = AuthenticationService.login(user, request)
        
        return Response(
            {
                'success': True,
                'message': 'Login successful',
                **result
            },
            status=status.HTTP_200_OK
        )


# =============================================================================
# EMAIL REGISTRATION VIEW
# =============================================================================
class EmailRegistrationView(APIView):
    """
    Register user with email and password.
    
    POST /api/auth/register/email/
    """
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Register user with email and password."""
        serializer = EmailRegistrationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'error': 'Validation failed',
                    'code': 'VALIDATION_ERROR',
                    'details': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = serializer.validated_data
        
        # Create user
        user, message = RegistrationService.register_email(
            email=data['email'],
            password=data['password'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', '')
        )
        
        if not user:
            return Response(
                {
                    'success': False,
                    'error': message,
                    'code': 'REGISTRATION_FAILED'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            {
                'success': True,
                'message': 'Registration successful. Please verify your email.',
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'role': user.role,
                    'role_display': user.get_role_display()
                }
            },
            status=status.HTTP_201_CREATED
        )


# =============================================================================
# EMAIL LOGIN VIEW
# =============================================================================
class EmailLoginView(APIView):
    """
    Login user with email and password.
    
    POST /api/auth/login/email/
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]
    
    def post(self, request):
        """Login user with email and password."""
        serializer = EmailLoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'error': 'Validation failed',
                    'code': 'VALIDATION_ERROR',
                    'details': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        # Authenticate
        user, message = AuthenticationService.authenticate_email(email, password)
        
        if not user:
            return Response(
                {
                    'success': False,
                    'error': message,
                    'code': 'AUTHENTICATION_FAILED'
                },
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Complete login
        result = AuthenticationService.login(user, request)
        
        return Response(
            {
                'success': True,
                'message': 'Login successful',
                **result
            },
            status=status.HTTP_200_OK
        )


# =============================================================================
# TOKEN MANAGEMENT VIEWS
# =============================================================================
class TokenObtainView(TokenObtainPairView):
    """Custom token obtain view."""
    
    def post(self, request, *args, **kwargs):
        """Handle token obtain with custom response."""
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response(
                {
                    'success': False,
                    'error': str(e),
                    'code': 'TOKEN_ERROR'
                },
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        return Response(
            {
                'success': True,
                'message': 'Token obtained successfully',
                **serializer.validated_data
            },
            status=status.HTTP_200_OK
        )


class TokenRefreshView(TokenRefreshView):
    """Custom token refresh view."""
    
    def post(self, request, *args, **kwargs):
        """Handle token refresh with custom response."""
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'error': 'Invalid refresh token',
                    'code': 'TOKEN_INVALID',
                    'details': serializer.errors
                },
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if token is blacklisted
        refresh_token = request.data.get('refresh')
        if BlacklistedToken.objects.filter(token=refresh_token).exists():
            return Response(
                {
                    'success': False,
                    'error': 'Token has been revoked',
                    'code': 'TOKEN_REVOKED'
                },
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        return Response(
            {
                'success': True,
                'message': 'Token refreshed successfully',
                **serializer.validated_data
            },
            status=status.HTTP_200_OK
        )


# =============================================================================
# LOGOUT VIEW
# =============================================================================
class LogoutView(APIView):
    """
    Logout user and blacklist tokens.
    
    POST /api/auth/logout/
    """
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Logout user and blacklist tokens."""
        serializer = LogoutSerializer(data=request.data)
        refresh_token = serializer.validated_data.get('refresh')
        
        user = request.user
        
        # Blacklist refresh token if provided
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
                
                BlacklistedToken.objects.create(
                    token=str(token),
                    user=user,
                    token_type='REFRESH',
                    expires_at=token['exp']
                )
            except Exception as e:
                logger.warning(f"Failed to blacklist token: {e}")
        
        # Blacklist access token
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            access_token = auth_header[7:]
            try:
                BlacklistedToken.objects.create(
                    token=access_token,
                    user=user,
                    token_type='ACCESS',
                    expires_at=timezone.now() + timedelta(days=1)
                )
            except Exception as e:
                logger.warning(f"Failed to blacklist access token: {e}")
        
        # Deactivate user session
        TokenService.deactivate_session(user.id)
        
        logger.info(f"User {user.phone} logged out")
        
        return Response(
            {
                'success': True,
                'message': 'Logged out successfully'
            },
            status=status.HTTP_200_OK
        )


# =============================================================================
# PASSWORD RESET VIEWS
# =============================================================================
class PasswordResetRequestView(APIView):
    """
    Request password reset email.
    
    POST /api/auth/password-reset/request/
    """
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Request password reset email."""
        serializer = PasswordResetRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'error': 'Validation failed',
                    'code': 'VALIDATION_ERROR',
                    'details': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        email = serializer.validated_data['email']
        
        # Check if user exists
        try:
            user = User.objects.get(email=email)
            EmailService.send_password_reset_email(user)
        except User.DoesNotExist:
            pass  # Don't reveal if email exists
        
        return Response(
            {
                'success': True,
                'message': 'If an account exists with this email, a password reset link has been sent.'
            },
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(APIView):
    """
    Confirm password reset with token.
    
    POST /api/auth/password-reset/confirm/
    """
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Confirm password reset with token."""
        serializer = PasswordResetConfirmSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'error': 'Validation failed',
                    'code': 'VALIDATION_ERROR',
                    'details': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        token_str = serializer.validated_data['token']
        password = serializer.validated_data['password']
        
        # Find and validate token
        from authentication.models import PasswordResetToken
        try:
            reset_token = PasswordResetToken.objects.get(token=token_str)
            
            if reset_token.is_expired() or reset_token.is_used:
                return Response(
                    {
                        'success': False,
                        'error': 'Invalid or expired reset token',
                        'code': 'TOKEN_INVALID'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update password
            user = reset_token.user
            user.set_password(password)
            user.save()
            
            # Mark token as used
            reset_token.is_used = True
            reset_token.save()
            
            logger.info(f"Password reset completed for user {user.id}")
            
        except PasswordResetToken.DoesNotExist:
            return Response(
                {
                    'success': False,
                    'error': 'Invalid reset token',
                    'code': 'TOKEN_NOT_FOUND'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            {
                'success': True,
                'message': 'Password reset successful. Please login with your new password.'
            },
            status=status.HTTP_200_OK
        )


# =============================================================================
# CHANGE PASSWORD VIEW (Authenticated)
# =============================================================================
class ChangePasswordView(APIView):
    """
    Change password (authenticated user).
    
    POST /api/auth/password/change/
    """
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Change user password."""
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'error': 'Validation failed',
                    'code': 'VALIDATION_ERROR',
                    'details': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = request.user
        new_password = serializer.validated_data['new_password']
        
        # Update password
        user.set_password(new_password)
        user.save()
        
        logger.info(f"Password changed for user {user.id}")
        
        return Response(
            {
                'success': True,
                'message': 'Password changed successfully'
            },
            status=status.HTTP_200_OK
        )


# =============================================================================
# USER PROFILE VIEW
# =============================================================================
class UserProfileView(APIView):
    """
    User profile endpoint.
    
    GET /api/auth/me/
    PUT /api/auth/me/
    """
    
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    
    def get(self, request):
        """Get current user profile."""
        user = request.user
        serializer = UserSerializer(user)
        
        return Response(
            {
                'success': True,
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )
    
    def put(self, request):
        """Update user profile."""
        user = request.user
        serializer = UserProfileUpdateSerializer(
            user,
            data=request.data,
            partial=True
        )
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'error': 'Validation failed',
                    'code': 'VALIDATION_ERROR',
                    'details': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        
        return Response(
            {
                'success': True,
                'message': 'Profile updated successfully',
                'data': UserSerializer(user).data
            },
            status=status.HTTP_200_OK
        )


# =============================================================================
# HEALTH CHECK VIEW
# =============================================================================
class HealthCheckView(APIView):
    """
    Health check endpoint.
    
    GET /api/auth/health/
    """
    
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Check authentication service health."""
        health = {
            'status': 'healthy',
            'service': 'authentication',
            'checks': {
                'database': self.check_database(),
                'cache': self.check_cache(),
            }
        }
        
        # Determine overall status
        all_healthy = all(check['status'] == 'healthy' for check in health['checks'].values())
        health['status'] = 'healthy' if all_healthy else 'degraded'
        
        status_code = status.HTTP_200_OK if all_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
        
        return Response(health, status=status_code)
    
    def check_database(self):
        """Check database connectivity."""
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1')
            return {'status': 'healthy', 'message': 'Database connection OK'}
        except Exception as e:
            return {'status': 'unhealthy', 'message': str(e)}
    
    def check_cache(self):
        """Check cache connectivity."""
        try:
            cache.set('health_check', 'ok', 10)
            result = cache.get('health_check')
            if result == 'ok':
                return {'status': 'healthy', 'message': 'Cache connection OK'}
            return {'status': 'unhealthy', 'message': 'Cache write/read failed'}
        except Exception as e:
            return {'status': 'unhealthy', 'message': str(e)}
