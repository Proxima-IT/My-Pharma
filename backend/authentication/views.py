"""
Auth API views: phone OTP, email register, login, refresh, logout, password-reset, me.
Throttling and permissions applied per endpoint.
"""
import logging
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from .constants import AuditAction
from .exceptions import AccountLockedError, InvalidOTPError, InvalidRegistrationTokenError, OTPRateLimitError
from .models import User
from .permissions import IsRegisteredUser, IsSuperAdmin
from .serializers import (
    RequestOTPSerializer,
    RegisterPhoneRequestSerializer,
    VerifyOTPRequestSerializer,
    RegisterCompleteRequestSerializer,
    RegisterEmailRequestSerializer,
    LoginRequestSerializer,
    PasswordResetRequestSerializer,
    UserMeSerializer,
    UserManagementSerializer,
)
from .services import (
    request_otp_for_phone,
    request_otp_for_email,
    verify_otp_only,
    verify_otp_only_email,
    complete_registration,
    register_with_email,
    perform_login_email,
    perform_login_phone,
    check_login_lockout,
    create_audit_log,
)
from .throttling import LoginRateThrottle, OTPSendRateThrottle, OTPVerifyRateThrottle

logger = logging.getLogger(__name__)


def _token_response_for_user(user, request=None):
    refresh = RefreshToken.for_user(user)
    context = {"request": request} if request else {}
    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserMeSerializer(user, context=context).data,
        },
        status=status.HTTP_200_OK,
    )


class RequestOTPView(APIView):
    """POST /api/auth/request-otp/ – Request OTP by email or phone (unified). Sends OTP to SMS or email."""
    permission_classes = [AllowAny]
    throttle_classes = [OTPSendRateThrottle]

    def post(self, request):
        ser = RequestOTPSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        email = ser.validated_data.get("email", "")
        phone = ser.validated_data.get("phone", "")
        try:
            if email:
                request_otp_for_email(
                    email,
                    ip=request.META.get("REMOTE_ADDR", ""),
                    user_agent=request.META.get("HTTP_USER_AGENT", ""),
                )
                create_audit_log(None, AuditAction.OTP_SENT, request=request, metadata={"channel": "email", "email_masked": email[:2] + "***"})
                return Response(
                    {"message": "OTP sent successfully.", "detail": "Check your email for the code."},
                    status=status.HTTP_200_OK,
                )
            else:
                request_otp_for_phone(
                    phone,
                    ip=request.META.get("REMOTE_ADDR", ""),
                    user_agent=request.META.get("HTTP_USER_AGENT", ""),
                )
                create_audit_log(None, AuditAction.OTP_SENT, request=request, metadata={"channel": "phone", "phone_masked": phone[-4:]})
                return Response(
                    {"message": "OTP sent successfully.", "detail": "Check your phone for the code."},
                    status=status.HTTP_200_OK,
                )
        except OTPRateLimitError:
            return Response(
                {"detail": "Too many OTP requests. Try again later.", "code": "otp_rate_limit"},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
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
    """POST /api/auth/verify-otp/ – Verify OTP by email or phone; returns registration_token and verified identifier for completion form."""
    permission_classes = [AllowAny]
    throttle_classes = [OTPVerifyRateThrottle]

    def post(self, request):
        ser = VerifyOTPRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        email = ser.validated_data.get("email", "")
        phone = ser.validated_data.get("phone", "")
        otp = ser.validated_data["otp"]
        try:
            if email:
                registration_token, verified_type, verified_value = verify_otp_only_email(email, otp)
                metadata = {"channel": "email", "email_masked": verified_value[:2] + "***"}
            else:
                registration_token, verified_type, verified_value = verify_otp_only(phone, otp)
                metadata = {"channel": "phone", "phone_masked": verified_value[-4:]}
        except InvalidOTPError:
            return Response(
                {"detail": "Invalid or expired OTP.", "code": "invalid_otp"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        from .utils import get_registration_token_ttl_seconds
        create_audit_log(None, AuditAction.OTP_VERIFIED, request=request, metadata=metadata)
        payload = {
            "message": "OTP verified. Complete your registration.",
            "registration_token": registration_token,
            "verified_identifier_type": verified_type,
            "verified_identifier_value": verified_value,
            "expires_in": get_registration_token_ttl_seconds(),
        }
        if verified_type == "phone":
            payload["phone"] = verified_value
        else:
            payload["email"] = verified_value
        return Response(payload, status=status.HTTP_200_OK)


class RegisterCompleteView(APIView):
    """POST /api/auth/register/complete/ – Complete registration: username, password, email or phone (other than verified), profile_picture, address. Accepts JSON or multipart/form-data."""
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data.copy()
        if request.FILES:
            data.update(request.FILES)
        ser = RegisterCompleteRequestSerializer(data=data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        try:
            user = complete_registration(
                registration_token=data["registration_token"],
                password=data["password"],
                username=data["username"],
                email=data.get("email") or None,
                phone=data.get("phone") or None,
                profile_picture=data.get("profile_picture"),
                address=data.get("address") or None,
            )
        except InvalidRegistrationTokenError as e:
            return Response(
                {"detail": e.detail, "code": "invalid_registration_token"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        create_audit_log(user.id, AuditAction.REGISTER_COMPLETE, request=request)
        create_audit_log(user.id, AuditAction.LOGIN, request=request)
        return _token_response_for_user(user, request=request)


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
        return _token_response_for_user(user, request=request)


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
        return _token_response_for_user(user, request=request)


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
        return Response(UserMeSerializer(user, context={"request": request}).data, status=status.HTTP_200_OK)


class UserManagementViewSet(viewsets.ModelViewSet):
    """Manage All Users – SUPER_ADMIN only. List, create, retrieve, update, delete users."""
    queryset = User.objects.exclude(deleted_at__isnull=False).order_by("-created_at")
    serializer_class = UserManagementSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    filterset_fields = ["role", "status", "is_active"]
    search_fields = ["username", "email", "phone"]
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return User.objects.filter(deleted_at__isnull=True).order_by("-created_at")

    def perform_destroy(self, instance):
        instance.soft_delete()
