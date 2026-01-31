"""
Authentication URLs
API endpoint routing for authentication.
"""

from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from authentication.views import (
    # OTP
    OTPSendView, OTPVerifyView,
    
    # Phone Auth
    PhoneRegistrationInitView, PhoneRegistrationVerifyView,
    PhoneLoginInitView, PhoneLoginVerifyView,
    
    # Email Auth
    EmailRegistrationView, EmailLoginView,
    
    # Token Management
    TokenObtainView, TokenRefreshView,
    
    # Session
    LogoutView,
    
    # Password
    PasswordResetRequestView, PasswordResetConfirmView,
    ChangePasswordView,
    
    # Profile
    UserProfileView,
    
    # Health
    HealthCheckView,
)

app_name = 'authentication'

urlpatterns = [
    # =========================================================================
    # OTP ENDPOINTS
    # =========================================================================
    path('otp/send/', OTPSendView.as_view(), name='otp-send'),
    path('otp/verify/', OTPVerifyView.as_view(), name='otp-verify'),
    
    # =========================================================================
    # PHONE REGISTRATION
    # =========================================================================
    path('register/phone/init/', PhoneRegistrationInitView.as_view(), name='phone-register-init'),
    path('register/phone/verify/', PhoneRegistrationVerifyView.as_view(), name='phone-register-verify'),
    
    # =========================================================================
    # PHONE LOGIN
    # =========================================================================
    path('login/phone/init/', PhoneLoginInitView.as_view(), name='phone-login-init'),
    path('login/phone/verify/', PhoneLoginVerifyView.as_view(), name='phone-login-verify'),
    
    # =========================================================================
    # EMAIL REGISTRATION & LOGIN
    # =========================================================================
    path('register/email/', EmailRegistrationView.as_view(), name='email-register'),
    path('login/email/', EmailLoginView.as_view(), name='email-login'),
    
    # =========================================================================
    # JWT TOKEN ENDPOINTS
    # =========================================================================
    path('token/', TokenObtainView.as_view(), name='token-obtain'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # =========================================================================
    # LOGOUT
    # =========================================================================
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # =========================================================================
    # PASSWORD MANAGEMENT
    # =========================================================================
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('password/change/', ChangePasswordView.as_view(), name='password-change'),
    
    # =========================================================================
    # USER PROFILE
    # =========================================================================
    path('me/', UserProfileView.as_view(), name='user-profile'),
    
    # =========================================================================
    # HEALTH CHECK
    # =========================================================================
    path('health/', HealthCheckView.as_view(), name='health-check'),
]
