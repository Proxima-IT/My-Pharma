"""
Custom User model with RBAC, soft delete, and indexed fields for My Pharma.
Optimized for MySQL and high-traffic API usage.
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

from .constants import UserRole, UserStatus


class UserManager(BaseUserManager):
    """Custom manager for User; supports creation by email or phone. Phone-only users get a unique placeholder email."""

    def create_user(self, email=None, phone=None, password=None, role=UserRole.REGISTERED_USER, **extra_fields):
        if not email and not phone:
            raise ValueError("User must have either email or phone.")
        email = (self.normalize_email(email) if email else "").strip()
        phone = (phone or "").strip()
        if not email and phone:
            email = f"p_{phone}@ph.local"
        elif not email:
            email = ""
        user = self.model(email=email, phone=phone or "", role=role, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", UserRole.SUPER_ADMIN)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("status", UserStatus.ACTIVE)
        extra_fields.setdefault("email_verified", True)
        return self.create_user(email=email, password=password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User: username (display), email (optional), phone (optional), profile_picture, address, role, status, soft delete.
    Indexed on email, phone for lookups and rate-limiting keys.
    """
    username = models.CharField(max_length=150, unique=True, null=True, blank=True, db_index=True)
    email = models.EmailField(max_length=255, unique=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True, db_index=True)
    profile_picture = models.ImageField(upload_to="profile_pics/%Y/%m/", blank=True, null=True)
    address = models.TextField(blank=True, default="")
    role = models.CharField(
        max_length=32,
        choices=UserRole.choices,
        default=UserRole.REGISTERED_USER,
        db_index=True,
    )
    status = models.CharField(
        max_length=32,
        choices=UserStatus.choices,
        default=UserStatus.PENDING_VERIFICATION,
        db_index=True,
    )
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    failed_login_count = models.PositiveIntegerField(default=0)
    last_failed_login_at = models.DateTimeField(null=True, blank=True)
    locked_until = models.DateTimeField(null=True, blank=True, db_index=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        db_table = "auth_user"
        indexes = [
            models.Index(fields=["username"]),
            models.Index(fields=["email"]),
            models.Index(fields=["phone"]),
            models.Index(fields=["role", "status"]),
            models.Index(fields=["deleted_at"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["phone"],
                condition=models.Q(phone__gt=""),
                name="unique_non_empty_phone",
            ),
        ]

    def __str__(self):
        return self.email or self.phone or str(self.pk)

    @property
    def is_deleted(self):
        return self.deleted_at is not None

    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at", "updated_at"])

    def is_locked(self):
        if not self.locked_until:
            return False
        if timezone.now() >= self.locked_until:
            self.locked_until = None
            self.failed_login_count = 0
            self.save(update_fields=["locked_until", "failed_login_count"])
            return False
        return True


class AuditLog(models.Model):
    """Audit trail for auth events (login, OTP, password reset, etc.)."""
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
        db_index=True,
    )
    action = models.CharField(max_length=64, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=512, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "auth_audit_log"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["action", "created_at"]),
        ]
