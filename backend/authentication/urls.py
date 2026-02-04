"""Auth API URL configuration."""
from django.urls import path

from . import views

urlpatterns = [
    path("register/phone/", views.RegisterPhoneView.as_view(), name="auth_register_phone"),
    path("verify-otp/", views.VerifyOTPView.as_view(), name="auth_verify_otp"),
    path("register/complete/", views.RegisterCompleteView.as_view(), name="auth_register_complete"),
    path("register/email/", views.RegisterEmailView.as_view(), name="auth_register_email"),
    path("login/", views.LoginView.as_view(), name="auth_login"),
    path("token/refresh/", views.TokenRefreshViewCustom.as_view(), name="token_refresh"),
    path("logout/", views.LogoutView.as_view(), name="auth_logout"),
    path("password-reset/", views.PasswordResetView.as_view(), name="auth_password_reset"),
    path("me/", views.MeView.as_view(), name="auth_me"),
]
