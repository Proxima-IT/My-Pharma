"""
Auth API views: phone OTP, email register, login, refresh, logout, password-reset, me.
Throttling and permissions applied per endpoint.
"""
import logging
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from .constants import AuditAction
from .exceptions import AccountLockedError, InvalidOTPError, InvalidRegistrationTokenError, OTPRateLimitError
from .models import User
from .permissions import IsRegisteredUser
from .serializers import (
    RegisterPhoneRequestSerializer,
    VerifyOTPRequestSerializer,
    RegisterCompleteRequestSerializer,
    RegisterEmailRequestSerializer,
    LoginRequestSerializer,
    PasswordResetRequestSerializer,
    UserMeSerializer,
)
from .services import (
    request_otp_for_phone,
    verify_otp_only,
    complete_registration,
    register_with_email,
    perform_login_email,
    perform_login_phone,
    check_login_lockout,
    create_audit_log,
)
from .throttling import LoginRateThrottle, OTPSendRateThrottle, OTPVerifyRateThrottle

logger = logging.getLogger(__name__)


def _token_response_for_user(user):
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    refresh_str = str(refresh)
    return Response(
        {
            "access": access,
            "refresh": refresh_str,
            "user": UserMeSerializer(user).data,
        },
        status=status.HTTP_200_OK,
    )


class RegisterPhoneView(APIView):
    """POST /api/auth/register/phone/ – Request OTP for phone registration."""
    permission_classes = [AllowAny]
    throttle_classes = [OTPSendRateThrottle]

    def post(self, request):
        ser = RegisterPhoneRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        phone = ser.validated_data["phone"]
        try:
            request_otp_for_phone(
                phone,
                ip=request.META.get("REMOTE_ADDR", ""),
                user_agent=request.META.get("HTTP_USER_AGENT", ""),
            )
        except OTPRateLimitError:
            return Response(
                {"detail": "Too many OTP requests. Try again later.", "code": "otp_rate_limit"},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )
        create_audit_log(None, AuditAction.OTP_SENT, request=request, metadata={"phone_masked": phone[-4:]})
        return Response(
            {"message": "OTP sent successfully.", "detail": "Check your phone for the code."},
            status=status.HTTP_200_OK,
        )


class VerifyOTPView(APIView):
    """POST /api/auth/verify-otp/ – Verify OTP only; returns registration_token for the completion form (no user yet)."""
    permission_classes = [AllowAny]
    throttle_classes = [OTPVerifyRateThrottle]

    def post(self, request):
        ser = VerifyOTPRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        phone = ser.validated_data["phone"]
        otp = ser.validated_data["otp"]
        try:
            registration_token, verified_phone = verify_otp_only(phone, otp)
        except InvalidOTPError:
            return Response(
                {"detail": "Invalid or expired OTP.", "code": "invalid_otp"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        from .utils import get_registration_token_ttl_seconds
        create_audit_log(None, AuditAction.OTP_VERIFIED, request=request, metadata={"phone_masked": verified_phone[-4:]})
        return Response(
            {
                "message": "OTP verified. Complete your registration.",
                "registration_token": registration_token,
                "phone": verified_phone,
                "expires_in": get_registration_token_ttl_seconds(),
            },
            status=status.HTTP_200_OK,
        )


class RegisterCompleteView(APIView):
    """POST /api/auth/register/complete/ – Complete registration with password and optional profile (after OTP). Returns JWT + user."""
    permission_classes = [AllowAny]

    def post(self, request):
        ser = RegisterCompleteRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        try:
            user = complete_registration(
                registration_token=data["registration_token"],
                password=data["password"],
                email=data.get("email") or None,
                first_name=data.get("first_name") or None,
                last_name=data.get("last_name") or None,
            )
        except InvalidRegistrationTokenError as e:
            return Response(
                {"detail": e.detail, "code": "invalid_registration_token"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        create_audit_log(user.id, AuditAction.REGISTER_COMPLETE, request=request)
        create_audit_log(user.id, AuditAction.LOGIN, request=request)
        return _token_response_for_user(user)


class RegisterEmailView(APIView):
    """POST /api/auth/register/email/ – Register with email and password."""
    permission_classes = [AllowAny]

    def post(self, request):
        ser = RegisterEmailRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = register_with_email(
            email=ser.validated_data["email"],
            password=ser.validated_data["password"],
        )
        create_audit_log(user.id, AuditAction.REGISTER_EMAIL, request=request)
        return _token_response_for_user(user)


class LoginView(APIView):
    """POST /api/auth/login/ – Login with email or phone + password. Returns JWT + user."""
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        ser = LoginRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        email = ser.validated_data.get("email", "")
        phone = ser.validated_data.get("phone", "")
        password = ser.validated_data["password"]
        try:
            if email:
                user = perform_login_email(email, password)
            else:
                user = perform_login_phone(phone, password)
        except AccountLockedError as e:
            return Response(
                {"detail": e.detail, "code": "account_locked"},
                status=status.HTTP_423_LOCKED,
            )
        if not user:
            return Response(
                {"detail": "Invalid email or password." if email else "Invalid phone or password.", "code": "invalid_credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        create_audit_log(user.id, AuditAction.LOGIN, request=request)
        return _token_response_for_user(user)


class TokenRefreshViewCustom(TokenRefreshView):
    """POST /api/auth/token/refresh/ – Rotate refresh token; returns new access + refresh + user."""

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200 and "access" in response.data:
            import jwt
            from django.conf import settings
            try:
                payload = jwt.decode(
                    response.data["access"],
                    options={"verify_signature": False},
                )
                user_id = payload.get("user_id")
                if user_id:
                    user = User.objects.filter(pk=user_id).first()
                    if user and not user.deleted_at:
                        response.data["user"] = UserMeSerializer(user).data
            except Exception:
                pass
        return response


class LogoutView(APIView):
    """POST /api/auth/logout/ – Blacklist refresh token and optional access token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from .utils import token_blacklist_add
        from rest_framework_simplejwt.settings import api_settings as jwt_settings

        refresh = request.data.get("refresh")
        if refresh:
            try:
                token = RefreshToken(refresh)
                ttl = int(jwt_settings.REFRESH_TOKEN_LIFETIME.total_seconds())
                token_blacklist_add(str(token.jti), ttl)
                token.blacklist()
            except Exception:
                pass
        # Blacklist current access token so it cannot be used after logout
        auth_header = request.META.get("HTTP_AUTHORIZATION")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                import jwt
                from django.conf import settings
                access = auth_header.split()[1]
                payload = jwt.decode(access, options={"verify_signature": False})
                jti = payload.get("jti")
                exp = payload.get("exp")
                if jti and exp:
                    import time
                    ttl = max(0, int(exp - time.time()))
                    token_blacklist_add(jti, ttl)
            except Exception:
                pass
        create_audit_log(request.user.id, AuditAction.LOGOUT, request=request)
        return Response(
            {"message": "Logged out successfully."},
            status=status.HTTP_200_OK,
        )


class PasswordResetView(APIView):
    """POST /api/auth/password-reset/ – Request password reset (email); sends link/token via Celery."""
    permission_classes = [AllowAny]

    def post(self, request):
        ser = PasswordResetRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        email = ser.validated_data["email"].lower()
        user = User.objects.filter(email__iexact=email).exclude(deleted_at__isnull=False).first()
        if user:
            from .tasks import send_password_reset_email
            send_password_reset_email.delay(user.id)
        create_audit_log(
            user.id if user else None,
            AuditAction.PASSWORD_RESET_REQUEST,
            request=request,
            metadata={"email_masked": email[:2] + "***" if email else ""},
        )
        return Response(
            {"message": "If an account exists with this email, you will receive reset instructions."},
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    """GET /api/auth/me/ – Current user profile (requires auth)."""
    permission_classes = [IsAuthenticated, IsRegisteredUser]

    def get(self, request):
        user = User.objects.filter(pk=request.user.pk).first()
        if not user or user.deleted_at:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserMeSerializer(user).data, status=status.HTTP_200_OK)
