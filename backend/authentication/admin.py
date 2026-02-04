"""
Admin for custom User and AuditLog.
Uses email (not username) for login and user creation.
"""
from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserChangeForm as BaseUserChangeForm
from django.contrib.auth.forms import UserCreationForm as BaseUserCreationForm

from .models import User, AuditLog


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
        # With multipart/form-data (file upload), some string fields can be missing from POST and become None; CharField then does len(None) -> TypeError. Normalize bound data before super().
        if args and args[0] is not None:
            data = args[0].copy()
            for key in ("username", "address"):
                if key not in data or data.get(key) is None:
                    data.setdefault(key, "")
            args = (data,) + args[1:]
        super().__init__(*args, **kwargs)
        # Unbound form: coerce initial None to '' for nullable string fields
        for key in ("username", "address"):
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
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm
    list_display = ("id", "username", "email", "phone", "role", "status", "email_verified", "phone_verified", "created_at")
    list_filter = ("role", "status", "is_staff")
    search_fields = ("username", "email", "phone")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at", "last_failed_login_at", "locked_until")
    fieldsets = (
        (None, {"fields": ("username", "email", "phone", "password")}),
        ("Profile", {"fields": ("profile_picture", "address")}),
        ("Role & Status", {"fields": ("role", "status", "email_verified", "phone_verified")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser")}),
        ("Security", {"fields": ("failed_login_count", "last_failed_login_at", "locked_until", "deleted_at")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("username", "email", "phone", "password1", "password2")}),
    )


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "action", "ip_address", "created_at")
    list_filter = ("action",)
    search_fields = ("user__email", "user__phone", "ip_address")
    readonly_fields = ("user", "action", "ip_address", "user_agent", "metadata", "created_at")
    date_hierarchy = "created_at"
