"""
Authentication Serializers
DRF serializers for authentication API endpoints.
"""

import re
import logging
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from authentication.models import User, UserRole, UserStatus

logger = logging.getLogger(__name__)
User = get_user_model()


# =============================================================================
# USER SERIALIZERS
# =============================================================================
class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    full_name = serializers.CharField(read_only=True)
    role_display = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'phone', 'email', 'first_name', 'last_name',
            'full_name', 'role', 'role_display', 'status',
            'is_verified', 'profile_image', 'date_of_birth',
            'gender', 'default_address', 'city', 'district',
            'postal_code', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_verified']


class UserCreateSerializer(serializers.Serializer):
    """Serializer for user creation."""
    
    phone = serializers.CharField(max_length=15)
    email = serializers.EmailField(required=False, allow_null=True, allow_blank=True)
    first_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8, required=False)
    
    def validate_phone(self, value):
        """Validate phone number format."""
        if not re.match(r'^\+?[1-9]\d{6,14}$', value):
            raise serializers.ValidationError(
                'Phone number must be in format: +[country code][number]'
            )
        return value
    
    def validate_email(self, value):
        """Validate email format."""
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError('This email is already registered.')
        return value
    
    def validate_password(self, value):
        """Validate password strength."""
        if value:
            try:
                validate_password(value)
            except Exception as e:
                raise serializers.ValidationError(str(e))
        return value
    
    def validate(self, attrs):
        """Cross-field validation."""
        # Check if phone already exists
        phone = attrs.get('phone')
        if User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError({
                'phone': 'This phone number is already registered.'
            })
        
        return attrs


# =============================================================================
# PHONE REGISTRATION SERIALIZERS
# =============================================================================
class PhoneRegistrationInitSerializer(serializers.Serializer):
    """Serializer for initiating phone registration."""
    
    phone = serializers.CharField(max_length=15)
    
    def validate_phone(self, value):
        """Validate and normalize phone number."""
        if not re.match(r'^\+?[1-9]\d{6,14}$', value):
            raise serializers.ValidationError(
                'Phone number must be in format: +[country code][number]'
            )
        
        # Check if user already exists
        from authentication.models import User
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError(
                'This phone number is already registered. Please login instead.'
            )
        
        return value


class PhoneRegistrationVerifySerializer(serializers.Serializer):
    """Serializer for verifying phone registration OTP."""
    
    phone = serializers.CharField(max_length=15)
    otp = serializers.CharField(min_length=4, max_length=10)
    first_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    def validate_phone(self, value):
        """Validate phone format."""
        if not re.match(r'^\+?[1-9]\d{6,14}$', value):
            raise serializers.ValidationError('Invalid phone number format.')
        return value
    
    def validate_otp(self, value):
        """Validate OTP format."""
        if not value.isdigit():
            raise serializers.ValidationError('OTP must contain only digits.')
        return value


# =============================================================================
# PHONE LOGIN SERIALIZERS
# =============================================================================
class PhoneLoginInitSerializer(serializers.Serializer):
    """Serializer for initiating phone login."""
    
    phone = serializers.CharField(max_length=15)
    
    def validate_phone(self, value):
        """Validate phone number."""
        if not re.match(r'^\+?[1-9]\d{6,14}$', value):
            raise serializers.ValidationError('Invalid phone number format.')
        return value


class PhoneLoginVerifySerializer(serializers.Serializer):
    """Serializer for verifying phone login OTP."""
    
    phone = serializers.CharField(max_length=15)
    otp = serializers.CharField(min_length=4, max_length=10)
    
    def validate_phone(self, value):
        """Validate phone format."""
        if not re.match(r'^\+?[1-9]\d{6,14}$', value):
            raise serializers.ValidationError('Invalid phone number format.')
        return value
    
    def validate_otp(self, value):
        """Validate OTP format."""
        if not value.isdigit():
            raise serializers.ValidationError('OTP must contain only digits.')
        return value


# =============================================================================
# EMAIL REGISTRATION SERIALIZERS
# =============================================================================
class EmailRegistrationSerializer(serializers.Serializer):
    """Serializer for email/password registration."""
    
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    password_confirm = serializers.CharField(min_length=8, write_only=True)
    first_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    def validate_email(self, value):
        """Validate email format and uniqueness."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('This email is already registered.')
        return value
    
    def validate_password(self, value):
        """Validate password strength."""
        errors = []
        
        if len(value) < 8:
            errors.append('Password must be at least 8 characters long.')
        
        if not re.search(r'[A-Z]', value):
            errors.append('Password must contain at least one uppercase letter.')
        
        if not re.search(r'[a-z]', value):
            errors.append('Password must contain at least one lowercase letter.')
        
        if not re.search(r'\d', value):
            errors.append('Password must contain at least one number.')
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            errors.append('Password must contain at least one special character.')
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return value
    
    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        return attrs


# =============================================================================
# EMAIL LOGIN SERIALIZERS
# =============================================================================
class EmailLoginSerializer(serializers.Serializer):
    """Serializer for email/password login."""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


# =============================================================================
# JWT TOKEN SERIALIZERS
# =============================================================================
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer with additional user data."""
    
    def validate(self, attrs):
        """Custom validation with role in token."""
        data = super().validate(attrs)
        
        # Add user data to response
        user = self.user
        data['user'] = {
            'id': str(user.id),
            'phone': user.phone,
            'email': user.email,
            'role': user.role,
            'role_display': user.get_role_display(),
            'is_verified': user.is_verified,
            'full_name': user.full_name,
        }
        
        return data
    
    @classmethod
    def get_token(cls, user):
        """Add custom claims to token."""
        token = super().get_token(user)
        
        # Add custom claims
        token['role'] = user.role
        token['phone'] = user.phone
        token['user_id'] = str(user.id)
        
        return token


class TokenRefreshSerializer(serializers.Serializer):
    """Serializer for token refresh."""
    
    refresh = serializers.CharField()
    
    def validate_refresh(self, value):
        """Validate refresh token."""
        if not value:
            raise serializers.ValidationError('Refresh token is required.')
        return value


# =============================================================================
# LOGOUT SERIALIZERS
# =============================================================================
class LogoutSerializer(serializers.Serializer):
    """Serializer for logout."""
    
    refresh = serializers.CharField(required=False, allow_blank=True)


# =============================================================================
# PASSWORD RESET SERIALIZERS
# =============================================================================
class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request."""
    
    email = serializers.EmailField()
    
    def validate_email(self, value):
        """Validate email exists."""
        if not User.objects.filter(email=value).exists():
            # Don't reveal if email exists
            pass
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation."""
    
    token = serializers.CharField(min_length=32, max_length=128)
    password = serializers.CharField(min_length=8, write_only=True)
    password_confirm = serializers.CharField(min_length=8, write_only=True)
    
    def validate_password(self, value):
        """Validate password strength."""
        errors = []
        
        if len(value) < 8:
            errors.append('Password must be at least 8 characters long.')
        
        if not re.search(r'[A-Z]', value):
            errors.append('Password must contain at least one uppercase letter.')
        
        if not re.search(r'[a-z]', value):
            errors.append('Password must contain at least one lowercase letter.')
        
        if not re.search(r'\d', value):
            errors.append('Password must contain at least one number.')
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            errors.append('Password must contain at least one special character.')
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return value
    
    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change (authenticated user)."""
    
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=8, write_only=True)
    new_password_confirm = serializers.CharField(min_length=8, write_only=True)
    
    def validate_new_password(self, value):
        """Validate new password strength."""
        errors = []
        
        if len(value) < 8:
            errors.append('Password must be at least 8 characters long.')
        
        if not re.search(r'[A-Z]', value):
            errors.append('Password must contain at least one uppercase letter.')
        
        if not re.search(r'[a-z]', value):
            errors.append('Password must contain at least one lowercase letter.')
        
        if not re.search(r'\d', value):
            errors.append('Password must contain at least one number.')
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            errors.append('Password must contain at least one special character.')
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return value
    
    def validate(self, attrs):
        """Validate password confirmation and old password."""
        user = self.context['request'].user
        
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'New passwords do not match.'
            })
        
        # Verify old password
        if not user.check_password(attrs['old_password']):
            raise serializers.ValidationError({
                'old_password': 'Current password is incorrect.'
            })
        
        return attrs


# =============================================================================
# OTP SERIALIZERS
# =============================================================================
class OTPSendSerializer(serializers.Serializer):
    """Serializer for sending OTP."""
    
    phone = serializers.CharField(max_length=15)
    purpose = serializers.ChoiceField(
        choices=['REGISTRATION', 'LOGIN', 'PASSWORD_RESET']
    )
    
    def validate_phone(self, value):
        """Validate phone format."""
        if not re.match(r'^\+?[1-9]\d{6,14}$', value):
            raise serializers.ValidationError('Invalid phone number format.')
        return value


class OTPVerifySerializer(serializers.Serializer):
    """Serializer for verifying OTP."""
    
    phone = serializers.CharField(max_length=15)
    otp = serializers.CharField(min_length=4, max_length=10)
    purpose = serializers.ChoiceField(
        choices=['REGISTRATION', 'LOGIN', 'PASSWORD_RESET']
    )
    
    def validate_phone(self, value):
        """Validate phone format."""
        if not re.match(r'^\+?[1-9]\d{6,14}$', value):
            raise serializers.ValidationError('Invalid phone number format.')
        return value
    
    def validate_otp(self, value):
        """Validate OTP format."""
        if not value.isdigit():
            raise serializers.ValidationError('OTP must contain only digits.')
        return value


# =============================================================================
# USER PROFILE SERIALIZERS
# =============================================================================
class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'profile_image',
            'date_of_birth', 'gender', 'default_address',
            'city', 'district', 'postal_code'
        ]
    
    def validate_date_of_birth(self, value):
        """Validate date of birth."""
        from datetime import date
        if value and value > date.today():
            raise serializers.ValidationError(
                'Date of birth cannot be in the future.'
            )
        return value


# =============================================================================
# ERROR RESPONSE SERIALIZERS
# =============================================================================
class ErrorResponseSerializer(serializers.Serializer):
    """Serializer for error responses."""
    
    success = serializers.BooleanField(default=False)
    error = serializers.CharField()
    code = serializers.CharField()
    details = serializers.DictField(required=False)
