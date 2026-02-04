"""Auth API URL configuration."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"admin/users", views.UserManagementViewSet, basename="admin-user")

urlpatterns = [
    path("request-otp/", views.RequestOTPView.as_view(), name="auth_request_otp"),
    path("register/phone/", views.RegisterPhoneView.as_view(), name="auth_register_phone"),
    path("verify-otp/", views.VerifyOTPView.as_view(), name="auth_verify_otp"),
    path("register/complete/", views.RegisterCompleteView.as_view(), name="auth_register_complete"),
    path("register/email/", views.RegisterEmailView.as_view(), name="auth_register_email"),
    path("login/", views.LoginView.as_view(), name="auth_login"),
    path("token/refresh/", views.TokenRefreshViewCustom.as_view(), name="token_refresh"),
    path("logout/", views.LogoutView.as_view(), name="auth_logout"),
    path("password-reset/", views.PasswordResetView.as_view(), name="auth_password_reset"),
    path("me/", views.MeView.as_view(), name="auth_me"),
    path("", include(router.urls)),
]
