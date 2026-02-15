"""
Admin for custom User and AuditLog.
Uses email (not username) for login and user creation.
Access: Only SUPER_ADMIN can access Users and Audit Logs (RBAC – Manage All Users).
"""
from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserChangeForm as BaseUserChangeForm
from django.contrib.auth.forms import UserCreationForm as BaseUserCreationForm
from django.contrib.auth.forms import UsernameField as AuthUsernameField

from .constants import UserRole
from .models import User, AuditLog


class SafeUsernameField(AuthUsernameField):
    """UsernameField that coerces None to '' before to_python (avoids len(None) in auth.forms.UsernameField)."""

    def to_python(self, value):
        if value is None:
            value = ""
        return super().to_python(value)


def _is_super_admin(request):
    """True if the requesting user has role SUPER_ADMIN."""
    if not getattr(request, "user", None) or not request.user.is_authenticated:
        return False
    return getattr(request.user, "role", None) == UserRole.SUPER_ADMIN


class CustomUserCreationForm(BaseUserCreationForm):
    """Admin form for creating users; uses custom User model, email/phone, username."""
    class Meta(BaseUserCreationForm.Meta):
        model = User
        fields = ("username", "email", "phone")

    def clean_username(self):
        """Our model uses email, not username. Return email so base clean() does not fail."""
        return self.cleaned_data.get("email") or self.cleaned_data.get("phone") or ""


class CustomUserChangeForm(BaseUserChangeForm):
    """Admin form for editing users; uses custom User model. Coerces NULL/missing string fields to '' so form validation (len) does not fail (e.g. when submitting with file upload)."""
    class Meta(BaseUserChangeForm.Meta):
        model = User
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        # With multipart/form-data (file upload), some fields can be missing or None; base UsernameField does len(value) -> TypeError. Pass a plain dict with None coerced to '' so validation never sees None.
        if args and args[0] is not None:
            raw = args[0]
            data = {}
            for k in raw:
                v = raw.get(k)
                data[k] = "" if v is None else v
            for key in ("username", "address", "gender"):
                if data.get(key) is None:
                    data[key] = ""
            args = (data,) + args[1:]
        super().__init__(*args, **kwargs)
        # Replace username field with one that coerces None in to_python (avoids len(None) in auth UsernameField)
        if "username" in self.fields:
            old = self.fields["username"]
            self.fields["username"] = SafeUsernameField(
                max_length=old.max_length,
                required=old.required,
                widget=old.widget,
                help_text=old.help_text,
            )
        # Unbound form: coerce initial None to '' for nullable string fields
        for key in ("username", "address", "gender"):
            if key in self.fields and self.initial.get(key) is None:
                self.initial[key] = ""

    def clean_username(self):
        value = self.cleaned_data.get("username")
        return (value or "").strip() or None

    def clean_address(self):
        value = self.cleaned_data.get("address")
        return value if value is not None else ""


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """User management – only SUPER_ADMIN (Manage All Users)."""
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm
    list_display = ("id", "username", "email", "phone", "gender", "date_of_birth", "role", "status", "email_verified", "phone_verified", "created_at")
    list_filter = ("role", "status", "is_staff")
    search_fields = ("username", "email", "phone")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at", "last_failed_login_at", "locked_until")
    fieldsets = (
        (None, {"fields": ("username", "email", "phone", "password")}),
        ("Profile", {"fields": ("profile_picture", "address", "gender", "date_of_birth")}),
        ("Role & Status", {"fields": ("role", "status", "email_verified", "phone_verified")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser")}),
        ("Security", {"fields": ("failed_login_count", "last_failed_login_at", "locked_until", "deleted_at")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("username", "email", "phone", "password1", "password2")}),
    )

    def has_module_permission(self, request):
        return _is_super_admin(request)

    def has_view_permission(self, request, obj=None):
        return _is_super_admin(request)

    def has_add_permission(self, request):
        return _is_super_admin(request)

    def has_change_permission(self, request, obj=None):
        return _is_super_admin(request)

    def has_delete_permission(self, request, obj=None):
        return _is_super_admin(request)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """Audit log – only SUPER_ADMIN (Full System Access)."""
    list_display = ("id", "user", "action", "ip_address", "created_at")
    list_filter = ("action",)
    search_fields = ("user__email", "user__phone", "ip_address")
    readonly_fields = ("user", "action", "ip_address", "user_agent", "metadata", "created_at")
    date_hierarchy = "created_at"

    def has_module_permission(self, request):
        return _is_super_admin(request)

    def has_view_permission(self, request, obj=None):
        return _is_super_admin(request)

    def has_add_permission(self, request):
        return False  # Audit logs are created by the system only

    def has_change_permission(self, request, obj=None):
        return False  # Audit logs are immutable

    def has_delete_permission(self, request, obj=None):
        return _is_super_admin(request)
