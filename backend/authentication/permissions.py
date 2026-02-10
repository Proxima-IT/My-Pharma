"""
RBAC permission classes for My Pharma.
Aligned with User Hierarchy & Role Permissions Matrix.

User Hierarchy:
  SUPER ADMIN (Full System Access)
  ├── PHARMACY ADMIN (Inventory & Orders)
  ├── DOCTOR (Consultations)
  ├── REGISTERED USER (Full Purchase Access)
  └── GUEST USER (Browse Only)

Permission Matrix:
  Manage All Users      → SUPER_ADMIN only
  Manage Products       → SUPER_ADMIN, PHARMACY_ADMIN
  Verify Prescriptions  → SUPER_ADMIN, PHARMACY_ADMIN
  Manage Inventory      → SUPER_ADMIN, PHARMACY_ADMIN
  View/Manage Orders    → SUPER_ADMIN, PHARMACY_ADMIN (all); REGISTERED_USER (own)
  Doctor Consultations  → SUPER_ADMIN, DOCTOR (manage); REGISTERED_USER (request)
  CMS Management        → SUPER_ADMIN (full); PHARMACY_ADMIN (limited)
  Purchase Products     → REGISTERED_USER only
  Upload Prescriptions  → REGISTERED_USER only
"""
from rest_framework import permissions

from .constants import UserRole
from .models import User


def _get_role(request):
    if not request.user or not request.user.is_authenticated:
        return None
    return getattr(request.user, "role", None)


class IsSuperAdmin(permissions.BasePermission):
    """
    SUPER_ADMIN only.
    Use for: Manage All Users, full CMS Management.
    """
    message = "Super admin access required."

    def has_permission(self, request, view):
        return _get_role(request) == UserRole.SUPER_ADMIN


class IsPharmacyAdminOrSuper(permissions.BasePermission):
    """
    PHARMACY_ADMIN or SUPER_ADMIN.
    Use for: Manage Products, Verify Prescriptions, Manage Inventory, View/Manage Orders (all), CMS (limited).
    """
    message = "Pharmacy admin or super admin access required."

    def has_permission(self, request, view):
        role = _get_role(request)
        return role in (UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN)


class IsDoctorOrSuper(permissions.BasePermission):
    """
    DOCTOR or SUPER_ADMIN only (not Pharmacy Admin).
    Use for: Doctor Consultations (manage side).
    """
    message = "Doctor or super admin access required."

    def has_permission(self, request, view):
        role = _get_role(request)
        return role in (UserRole.SUPER_ADMIN, UserRole.DOCTOR)


class IsDoctorOrAbove(permissions.BasePermission):
    """
    DOCTOR, PHARMACY_ADMIN, or SUPER_ADMIN.
    Use where any elevated role (doctor or above) is allowed.
    """
    message = "Doctor or higher access required."

    def has_permission(self, request, view):
        role = _get_role(request)
        return role in (UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN, UserRole.DOCTOR)


class IsRegisteredUser(permissions.BasePermission):
    """
    Any authenticated user with a DB record (excludes GUEST_USER).
    Use for: Doctor Consultations (request), browse, general authenticated access.
    """
    message = "Registered user access required."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return isinstance(request.user, User) and _get_role(request) != UserRole.GUEST_USER


class IsRegisteredUserOnly(permissions.BasePermission):
    """
    REGISTERED_USER role only (no Doctor, Pharmacy Admin, Super Admin).
    Use for: Purchase Products, Upload Prescriptions.
    """
    message = "Registered user (customer) access required; staff and doctor roles cannot perform this action."

    def has_permission(self, request, view):
        return _get_role(request) == UserRole.REGISTERED_USER


class AllowAnyIncludingGuest(permissions.BasePermission):
    """Allow any request; used for endpoints that support both guest and authenticated."""

    def has_permission(self, request, view):
        return True


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Object-level: owner can write, others read-only (e.g. View/Manage Orders – own only)."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return getattr(obj, "user_id", None) == request.user.id or getattr(obj, "user", None) == request.user
