"""
Authentication Models for My Pharma
Production-ready User model with Role-Based Access Control (RBAC)
"""

import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.conf import settings
from django.utils import timezone
from django.core.validators import RegexValidator, MinLengthValidator, EmailValidator
from django.contrib.auth.hashers import make_password, check_password


# =============================================================================
# USER ROLES (RBAC)
# =============================================================================
class UserRole(models.TextChoices):
    """User role choices for RBAC."""
    SUPER_ADMIN = 'SUPER_ADMIN', 'Super Administrator'
    PHARMACY_ADMIN = 'PHARMACY_ADMIN', 'Pharmacy Administrator'
    DOCTOR = 'DOCTOR', 'Doctor'
    REGISTERED_USER = 'REGISTERED_USER', 'Registered User'
    GUEST_USER = 'GUEST_USER', 'Guest User'


# =============================================================================
# USER STATUS
# =============================================================================
class UserStatus(models.TextChoices):
    """User account status."""
    ACTIVE = 'ACTIVE', 'Active'
    INACTIVE = 'INACTIVE', 'Inactive'
    LOCKED = 'LOCKED', 'Locked'
    PENDING_VERIFICATION = 'PENDING_VERIFICATION', 'Pending Verification'
    SUSPENDED = 'SUSPENDED', 'Suspended'


# =============================================================================
# PERMISSION GROUPS
# =============================================================================
class PermissionGroup(models.TextChoices):
    """Permission groups for RBAC."""
    # User management
    USER_VIEW = 'user.view', 'View Users'
    USER_CREATE = 'user.create', 'Create Users'
    USER_EDIT = 'user.edit', 'Edit Users'
    USER_DELETE = 'user.delete', 'Delete Users'
    
    # Pharmacy management
    PHARMACY_VIEW = 'pharmacy.view', 'View Pharmacies'
    PHARMACY_MANAGE = 'pharmacy.manage', 'Manage Pharmacies'
    
    # Product management
    PRODUCT_VIEW = 'product.view', 'View Products'
    PRODUCT_MANAGE = 'product.manage', 'Manage Products'
    
    # Prescription management
    PRESCRIPTION_VIEW = 'prescription.view', 'View Prescriptions'
    PRESCRIPTION_CREATE = 'prescription.create', 'Create Prescriptions'
    PRESCRIPTION_APPROVE = 'prescription.approve', 'Approve Prescriptions'
    
    # Order management
    ORDER_VIEW = 'order.view', 'View Orders'
    ORDER_MANAGE = 'order.manage', 'Manage Orders'
    
    # Payment management
    PAYMENT_VIEW = 'payment.view', 'View Payments'
    PAYMENT_PROCESS = 'payment.process', 'Process Payments'
    
    # Report & Analytics
    REPORT_VIEW = 'report.view', 'View Reports'
    REPORT_GENERATE = 'report.generate', 'Generate Reports'
    
    # System administration
    SYSTEM_CONFIG = 'system.config', 'System Configuration'
    AUDIT_VIEW = 'audit.view', 'View Audit Logs'


# =============================================================================
# ROLE PERMISSIONS MAPPING
# =============================================================================
ROLE_PERMISSIONS = {
    UserRole.SUPER_ADMIN: [
        # All permissions for super admin
        'user.view', 'user.create', 'user.edit', 'user.delete',
        'pharmacy.view', 'pharmacy.manage',
        'product.view', 'product.manage',
        'prescription.view', 'prescription.create', 'prescription.approve',
        'order.view', 'order.manage',
        'payment.view', 'payment.process',
        'report.view', 'report.generate',
        'system.config', 'audit.view',
    ],
    UserRole.PHARMACY_ADMIN: [
        # Pharmacy admin permissions
        'user.view', 'user.create', 'user.edit',
        'pharmacy.view', 'pharmacy.manage',
        'product.view', 'product.manage',
        'prescription.view', 'prescription.approve',
        'order.view', 'order.manage',
        'payment.view', 'payment.process',
        'report.view', 'report.generate',
    ],
    UserRole.DOCTOR: [
        # Doctor permissions
        'product.view',
        'prescription.view', 'prescription.create',
        'order.view',
        'report.view',
    ],
    UserRole.REGISTERED_USER: [
        # Registered user permissions
        'product.view',
        'prescription.view',
        'order.view', 'order.manage',
    ],
    UserRole.GUEST_USER: [
        # Guest user permissions (no database record)
        'product.view',
    ],
}


# =============================================================================
# CUSTOM USER MANAGER
# =============================================================================
class UserManager(BaseUserManager):
    """Custom user manager for User model."""
    
    def create_user(self, phone, email=None, password=None, role=None, **extra_fields):
        """
        Create and return a regular user.
        
        Args:
            phone: Phone number (required)
            email: Email address (optional)
            password: Password (optional for OTP-based auth)
            role: User role
            **extra_fields: Additional fields
        
        Returns:
            User instance
        """
        if not phone:
            raise ValueError('Phone number is required')
        
        # Normalize phone number
        phone = self.normalize_phone(phone)
        
        # Create user instance
        user = self.model(
            phone=phone,
            email=self.normalize_email(email) if email else None,
            role=role or UserRole.REGISTERED_USER,
            **extra_fields
        )
        
        # Set password if provided
        if password:
            user.set_password(password)
        else:
            # Generate random password for OTP-based users
            user.set_password(self.make_random_password())
        
        user.save(using=self._db)
        return user
    
    def create_superuser(self, phone, email=None, password=None, **extra_fields):
        """
        Create and return a superuser.
        
        Args:
            phone: Phone number
            email: Email address
            password: Password
            **extra_fields: Additional fields
        
        Returns:
            User instance with superuser privileges
        """
        extra_fields.setdefault('role', UserRole.SUPER_ADMIN)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('status', UserStatus.ACTIVE)
        extra_fields.setdefault('is_verified', True)
        
        return self.create_user(phone, email, password, **extra_fields)
    
    @staticmethod
    def normalize_phone(phone):
        """Normalize phone number format."""
        # Remove spaces, dashes, and leading + if present
        phone = phone.strip().replace(' ', '').replace('-', '')
        if phone.startswith('+'):
            phone = phone[1:]
        return phone
    
    def get_by_phone(self, phone):
        """Get user by phone number."""
        return self.get(phone=self.normalize_phone(phone))
    
    def get_active_users(self):
        """Get all active users."""
        return self.filter(status=UserStatus.ACTIVE)
    
    def get_locked_users(self):
        """Get all locked users."""
        return self.filter(status=UserStatus.LOCKED)


# =============================================================================
# USER MODEL
# =============================================================================
class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model for My Pharma.
    
    Features:
    - Phone number as primary identifier
    - Role-based access control (RBAC)
    - Soft delete support
    - Account locking mechanism
    - Email verification
    - Audit trail
    
    Attributes:
        id: UUID primary key
        phone: Phone number (unique, indexed)
        email: Email address (unique, nullable)
        role: User role (RBAC)
        status: Account status
        is_verified: Email/phone verification status
        is_active: Django auth is_active flag
        is_staff: Django admin access
        is_superuser: Django superuser flag
        first_name, last_name: Personal info
        profile_image: Profile picture URL
        date_of_birth: For age verification (healthcare)
        created_at, updated_at: Timestamps
        last_login_ip: Security tracking
        failed_login_attempts: Security tracking
        locked_until: Account lock expiry
    """
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Authentication fields
    phone = models.CharField(
        max_length=15,
        unique=True,
        db_index=True,
        validators=[
            RegexValidator(
                regex=r'^\+?[1-9]\d{6,14}$',
                message='Phone number must be in format: +[country code][number]'
            )
        ],
        help_text='Unique phone number for authentication'
    )
    email = models.EmailField(
        unique=True,
        null=True,
        blank=True,
        db_index=True,
        validators=[EmailValidator()],
        help_text='Optional email address'
    )
    
    # RBAC fields
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.REGISTERED_USER,
        db_index=True,
        help_text='User role for access control'
    )
    status = models.CharField(
        max_length=20,
        choices=UserStatus.choices,
        default=UserStatus.PENDING_VERIFICATION,
        db_index=True,
        help_text='Account status'
    )
    permissions = models.JSONField(
        default=list,
        blank=True,
        help_text='Custom permissions for this user'
    )
    
    # Verification
    is_verified = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    phone_verified_at = models.DateTimeField(null=True, blank=True)
    
    # Personal information
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    profile_image = models.URLField(max_length=500, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=10,
        choices=[('MALE', 'Male'), ('FEMALE', 'Female'), ('OTHER', 'Other')],
        blank=True
    )
    
    # Address (for delivery)
    default_address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    
    # Security tracking
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    last_login_device = models.CharField(max_length=500, blank=True)
    failed_login_attempts = models.PositiveSmallIntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True, db_index=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    # Guest user tracking
    is_guest = models.BooleanField(default=False)
    guest_session_id = models.UUIDField(null=True, blank=True, db_index=True)
    
    # Django auth required fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    # Objects
    objects = UserManager()
    
    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['email']
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['phone', 'status']),
            models.Index(fields=['email', 'status']),
            models.Index(fields=['role', 'status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['locked_until']),
        ]
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        """String representation."""
        return f"{self.phone} ({self.get_role_display()})"
    
    def save(self, *args, **kwargs):
        """Save user and set default permissions based on role."""
        if not self.permissions and self.role:
            self.permissions = ROLE_PERMISSIONS.get(self.role, [])
        super().save(*args, **kwargs)
    
    # =============================================================================
    # ROLE & PERMISSION METHODS
    # =============================================================================
    def get_role_display(self):
        """Get human-readable role name."""
        return dict(UserRole.choices).get(self.role, self.role)
    
    def has_permission(self, permission):
        """
        Check if user has a specific permission.
        
        Args:
            permission: Permission string (e.g., 'product.manage')
        
        Returns:
            bool: True if user has permission
        """
        if self.is_superuser or self.role == UserRole.SUPER_ADMIN:
            return True
        
        return permission in self.permissions
    
    def has_any_permission(self, permissions):
        """
        Check if user has any of the specified permissions.
        
        Args:
            permissions: List of permission strings
        
        Returns:
            bool: True if user has at least one permission
        """
        return any(self.has_permission(p) for p in permissions)
    
    def has_all_permissions(self, permissions):
        """
        Check if user has all specified permissions.
        
        Args:
            permissions: List of permission strings
        
        Returns:
            bool: True if user has all permissions
        """
        return all(self.has_permission(p) for p in permissions)
    
    def get_role_permissions(self):
        """Get permissions for user's role."""
        return ROLE_PERMISSIONS.get(self.role, [])
    
    def update_permissions(self):
        """Update user permissions based on role."""
        self.permissions = self.get_role_permissions()
        self.save(update_fields=['permissions'])
    
    # =============================================================================
    # ACCOUNT SECURITY METHODS
    # =============================================================================
    def is_account_locked(self):
        """Check if account is locked."""
        if self.locked_until and self.locked_until > timezone.now():
            return True
        return False
    
    def lock_account(self, duration_minutes=30):
        """
        Lock user account for specified duration.
        
        Args:
            duration_minutes: Lock duration in minutes
        """
        self.status = UserStatus.LOCKED
        self.locked_until = timezone.now() + timezone.timedelta(minutes=duration_minutes)
        self.save(update_fields=['status', 'locked_until'])
    
    def unlock_account(self):
        """Unlock user account."""
        self.status = UserStatus.ACTIVE
        self.locked_until = None
        self.failed_login_attempts = 0
        self.save(update_fields=['status', 'locked_until', 'failed_login_attempts'])
    
    def increment_failed_login(self, max_attempts=5, lock_duration=30):
        """
        Increment failed login attempts and lock if threshold reached.
        
        Args:
            max_attempts: Maximum failed attempts before lock
            lock_duration: Lock duration in minutes
        """
        self.failed_login_attempts += 1
        
        if self.failed_login_attempts >= max_attempts:
            self.lock_account(lock_duration)
        else:
            self.save(update_fields=['failed_login_attempts'])
    
    def reset_failed_login(self):
        """Reset failed login attempts counter."""
        self.failed_login_attempts = 0
        self.save(update_fields=['failed_login_attempts'])
    
    # =============================================================================
    # SOFT DELETE METHODS
    # =============================================================================
    def soft_delete(self):
        """Soft delete the user."""
        self.deleted_at = timezone.now()
        self.is_active = False
        self.status = UserStatus.INACTIVE
        self.save(update_fields=['deleted_at', 'is_active', 'status'])
    
    def restore(self):
        """Restore soft-deleted user."""
        self.deleted_at = None
        self.is_active = True
        self.status = UserStatus.ACTIVE
        self.save(update_fields=['deleted_at', 'is_active', 'status'])
    
    # =============================================================================
    # PROPERTIES
    # =============================================================================
    @property
    def full_name(self):
        """Get user's full name."""
        return f"{self.first_name} {self.last_name}".strip() or self.phone
    
    @property
    def is_guest_user(self):
        """Check if user is guest."""
        return self.role == UserRole.GUEST_USER or self.is_guest
    
    @property
    def can_login(self):
        """Check if user can log in."""
        return (
            self.is_active and
            not self.is_account_locked() and
            self.status in [UserStatus.ACTIVE, UserStatus.PENDING_VERIFICATION]
        )
    
    @property
    def is_pharmacy_admin(self):
        """Check if user is pharmacy admin."""
        return self.role in [UserRole.PHARMACY_ADMIN, UserRole.SUPER_ADMIN]
    
    @property
    def is_doctor(self):
        """Check if user is doctor."""
        return self.role == UserRole.DOCTOR
    
    @property
    def is_super_admin(self):
        """Check if user is super admin."""
        return self.role == UserRole.SUPER_ADMIN


# =============================================================================
# OTP VERIFICATION MODEL
# =============================================================================
class OTPVerification(models.Model):
    """
    OTP verification for phone number authentication.
    
    OTP is stored in Redis for production, this model for backup.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(max_length=15, db_index=True)
    otp = models.CharField(max_length=10)
    purpose = models.CharField(
        max_length=20,
        choices=[
            ('REGISTRATION', 'Registration'),
            ('LOGIN', 'Login'),
            ('PASSWORD_RESET', 'Password Reset'),
            ('PHONE_CHANGE', 'Phone Change'),
        ]
    )
    attempts = models.PositiveSmallIntegerField(default=0)
    max_attempts = models.PositiveSmallIntegerField(default=3)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    is_used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'otp_verifications'
        indexes = [
            models.Index(fields=['phone', 'purpose']),
            models.Index(fields=['expires_at']),
        ]
        ordering = ['-created_at']
        verbose_name = 'OTP Verification'
        verbose_name_plural = 'OTP Verifications'
    
    def __str__(self):
        return f"OTP for {self.phone} ({self.purpose})"
    
    def is_expired(self):
        """Check if OTP is expired."""
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        """Check if OTP is valid."""
        return not self.is_used and not self.is_expired()
    
    def increment_attempts(self):
        """Increment verification attempts."""
        self.attempts += 1
        self.save(update_fields=['attempts'])
        return self.attempts >= self.max_attempts


# =============================================================================
# EMAIL VERIFICATION TOKEN
# =============================================================================
class EmailVerificationToken(models.Model):
    """Email verification token for email-based registration."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='email_verification_tokens'
    )
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'email_verification_tokens'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Verification token for {self.user.email}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        return not self.is_used and not self.is_expired()


# =============================================================================
# PASSWORD RESET TOKEN
# =============================================================================
class PasswordResetToken(models.Model):
    """Password reset token for email-based password reset."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='password_reset_tokens'
    )
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        db_table = 'password_reset_tokens'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Password reset token for {self.user.email}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        return not self.is_used and not self.is_expired()


# =============================================================================
# SESSION/DEVICE MANAGEMENT
# =============================================================================
class UserSession(models.Model):
    """User session/device tracking for security."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    token_jti = models.CharField(max_length=255, unique=True, db_index=True)
    device_info = models.CharField(max_length=500, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'user_sessions'
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['token_jti']),
            models.Index(fields=['expires_at']),
        ]
        ordering = ['-last_activity']
    
    def __str__(self):
        return f"Session for {self.user.phone} ({self.device_info})"
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def deactivate(self):
        """Deactivate session."""
        self.is_active = False
        self.save(update_fields=['is_active'])


# =============================================================================
# BLACKLISTED TOKENS (for JWT logout)
# =============================================================================
class BlacklistedToken(models.Model):
    """Blacklisted JWT tokens for secure logout."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    token = models.TextField(unique=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='blacklisted_tokens',
        null=True,
        blank=True
    )
    token_type = models.CharField(
        max_length=20,
        choices=[('ACCESS', 'Access'), ('REFRESH', 'Refresh')]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'blacklisted_tokens'
        indexes = [
            models.Index(fields=['expires_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Blacklisted {self.token_type} token"
    
    @classmethod
    def cleanup_expired(cls):
        """Remove expired tokens from blacklist."""
        cls.objects.filter(expires_at__lt=timezone.now()).delete()
