"""
Role and status constants for RBAC and user lifecycle.
GUEST_USER has no DB record; all other roles are persisted.
"""
from django.db import models


class UserRole(models.TextChoices):
    SUPER_ADMIN = "SUPER_ADMIN", "Super Admin"
    PHARMACY_ADMIN = "PHARMACY_ADMIN", "Pharmacy Admin"
    DOCTOR = "DOCTOR", "Doctor"
    REGISTERED_USER = "REGISTERED_USER", "Registered User"
    GUEST_USER = "GUEST_USER", "Guest User"  # No DB record; JWT/session only


class UserStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Active"
    INACTIVE = "INACTIVE", "Inactive"
    LOCKED = "LOCKED", "Locked"
    PENDING_VERIFICATION = "PENDING_VERIFICATION", "Pending Verification"


class AuditAction(models.TextChoices):
    LOGIN = "LOGIN", "Login"
    LOGOUT = "LOGOUT", "Logout"
    OTP_SENT = "OTP_SENT", "OTP Sent"
    OTP_VERIFIED = "OTP_VERIFIED", "OTP Verified"
    PASSWORD_RESET_REQUEST = "PASSWORD_RESET_REQUEST", "Password Reset Request"
    PASSWORD_RESET_COMPLETE = "PASSWORD_RESET_COMPLETE", "Password Reset Complete"
    REGISTER_PHONE = "REGISTER_PHONE", "Register via Phone"
    REGISTER_EMAIL = "REGISTER_EMAIL", "Register via Email"
    REGISTER_COMPLETE = "REGISTER_COMPLETE", "Registration Completed (phone flow)"
    ACCOUNT_LOCKED = "ACCOUNT_LOCKED", "Account Locked"
