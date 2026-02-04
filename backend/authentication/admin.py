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
    """Admin form for creating users; uses custom User model and email (no username)."""
    class Meta(BaseUserCreationForm.Meta):
        model = User
        fields = ("email", "phone")

    def clean_username(self):
        """Our model uses email, not username. Return email so base clean() does not fail."""
        return self.cleaned_data.get("email") or self.cleaned_data.get("phone") or ""


class CustomUserChangeForm(BaseUserChangeForm):
    """Admin form for editing users; uses custom User model."""
    class Meta(BaseUserChangeForm.Meta):
        model = User
        fields = "__all__"


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm
    list_display = ("id", "email", "phone", "first_name", "last_name", "role", "status", "email_verified", "phone_verified", "created_at")
    list_filter = ("role", "status", "is_staff")
    search_fields = ("email", "phone", "first_name", "last_name")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at", "last_failed_login_at", "locked_until")
    fieldsets = (
        (None, {"fields": ("email", "phone", "password")}),
        ("Profile", {"fields": ("first_name", "last_name")}),
        ("Role & Status", {"fields": ("role", "status", "email_verified", "phone_verified")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser")}),
        ("Security", {"fields": ("failed_login_count", "last_failed_login_at", "locked_until", "deleted_at")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "phone", "password1", "password2")}),
    )


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "action", "ip_address", "created_at")
    list_filter = ("action",)
    search_fields = ("user__email", "user__phone", "ip_address")
    readonly_fields = ("user", "action", "ip_address", "user_agent", "metadata", "created_at")
    date_hierarchy = "created_at"
