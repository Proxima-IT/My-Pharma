"""
Request/response serializers for auth API.
Validation and error responses aligned with API docs.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model

from .constants import UserRole, UserStatus
from .services import normalize_phone, validate_password_strength

User = get_user_model()


# ---- Request ----

class RequestOTPSerializer(serializers.Serializer):
    """Unified: request OTP by email OR phone (exactly one)."""
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True, trim_whitespace=True)

    def validate(self, attrs):
        email = (attrs.get("email") or "").strip()
        phone = (attrs.get("phone") or "").strip()
        if not email and not phone:
            raise serializers.ValidationError("Provide email or phone.")
        if email and phone:
            raise serializers.ValidationError("Provide either email or phone, not both.")
        attrs["email"] = email.lower() if email else ""
        if phone:
            normalized = normalize_phone(phone)
            if len(normalized) < 10:
                raise serializers.ValidationError({"phone": "Invalid phone number."})
            attrs["phone"] = normalized
        else:
            attrs["phone"] = ""
        return attrs


class RegisterPhoneRequestSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20, trim_whitespace=True)

    def validate_phone(self, value):
        normalized = normalize_phone(value)
        if len(normalized) < 10:
            raise serializers.ValidationError("Invalid phone number.")
        return normalized


class VerifyOTPRequestSerializer(serializers.Serializer):
    """Unified: verify OTP by email OR phone + otp."""
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True, trim_whitespace=True)
    otp = serializers.CharField(max_length=8, min_length=6)

    def validate(self, attrs):
        email = (attrs.get("email") or "").strip()
        phone = (attrs.get("phone") or "").strip()
        if not email and not phone:
            raise serializers.ValidationError("Provide email or phone.")
        if email and phone:
            raise serializers.ValidationError("Provide either email or phone, not both.")
        attrs["email"] = email.lower() if email else ""
        if phone:
            attrs["phone"] = normalize_phone(phone)
        else:
            attrs["phone"] = ""
        return attrs


class RegisterEmailRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_password(self, value):
        ok, msg = validate_password_strength(value)
        if not ok:
            raise serializers.ValidationError(msg)
        return value

    def validate_email(self, value):
        v = value.lower().strip()
        if User.objects.filter(email__iexact=v).exclude(deleted_at__isnull=False).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return v


class LoginRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = (attrs.get("email") or "").strip()
        phone = (attrs.get("phone") or "").strip()
        if not email and not phone:
            raise serializers.ValidationError("Provide email or phone.")
        if email and phone:
            raise serializers.ValidationError("Provide either email or phone, not both.")
        attrs["email"] = email.lower() if email else ""
        if phone:
            normalized = normalize_phone(phone)
            if len(normalized) < 10:
                raise serializers.ValidationError({"phone": "Invalid phone number."})
            attrs["phone"] = normalized
        else:
            attrs["phone"] = ""
        return attrs


class RegisterCompleteRequestSerializer(serializers.Serializer):
    """Payload to complete registration: username, password, email or phone (the one not verified), profile_picture, address."""
    registration_token = serializers.CharField()
    password = serializers.CharField(min_length=8, write_only=True)
    username = serializers.CharField(max_length=150, trim_whitespace=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True, trim_whitespace=True)
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    address = serializers.CharField(required=False, allow_blank=True, max_length=500)

    def validate_password(self, value):
        ok, msg = validate_password_strength(value)
        if not ok:
            raise serializers.ValidationError(msg)
        return value

    def validate_username(self, value):
        v = (value or "").strip()
        if not v:
            raise serializers.ValidationError("Username is required.")
        if User.objects.filter(username__iexact=v).exclude(deleted_at__isnull=False).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return v

    def validate_phone(self, value):
        if not (value or "").strip():
            return ""
        return normalize_phone(value)

    def validate_email(self, value):
        if not (value or "").strip():
            return ""
        v = value.lower().strip()
        if User.objects.filter(email__iexact=v).exclude(deleted_at__isnull=False).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return v


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, write_only=True)

    def validate_new_password(self, value):
        ok, msg = validate_password_strength(value)
        if not ok:
            raise serializers.ValidationError(msg)
        return value


# ---- Response ----

class UserMeSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source="get_role_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    email = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "phone",
            "profile_picture",
            "address",
            "role",
            "role_display",
            "status",
            "status_display",
            "email_verified",
            "phone_verified",
            "created_at",
        )
        read_only_fields = ("id", "username", "phone", "role", "status", "email_verified", "phone_verified", "created_at")

    def get_profile_picture(self, obj):
        if obj.profile_picture:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None

    def get_email(self, obj):
        e = getattr(obj, "email", "") or ""
        if e.startswith("p_") and e.endswith("@ph.local"):
            return ""
        return e


class TokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserMeSerializer(required=False)


class MessageResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    detail = serializers.CharField(required=False)
