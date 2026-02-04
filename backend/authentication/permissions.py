"""
RBAC permission classes for My Pharma.
Explicit permission checks by role; GUEST_USER has no DB record and is handled in views.
"""
from rest_framework import permissions

from .constants import UserRole
from .models import User


class IsSuperAdmin(permissions.BasePermission):
    """Only SUPER_ADMIN."""
    message = "Super admin access required."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, "role", None) == UserRole.SUPER_ADMIN


class IsPharmacyAdminOrSuper(permissions.BasePermission):
    """PHARMACY_ADMIN or SUPER_ADMIN."""
    message = "Pharmacy admin or super admin access required."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user, "role", None)
        return role in (UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN)


class IsDoctorOrAbove(permissions.BasePermission):
    """DOCTOR, PHARMACY_ADMIN, or SUPER_ADMIN."""
    message = "Doctor or higher access required."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user, "role", None)
        return role in (UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN, UserRole.DOCTOR)


class IsRegisteredUser(permissions.BasePermission):
    """Any authenticated user with a DB record (excludes guest)."""
    message = "Registered user access required."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return isinstance(request.user, User) and getattr(request.user, "role", None) != UserRole.GUEST_USER


class AllowAnyIncludingGuest(permissions.BasePermission):
    """Allow any request; used for endpoints that support both guest and authenticated."""

    def has_permission(self, request, view):
        return True


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Object-level: owner can write, others read-only (by role)."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return getattr(obj, "user_id", None) == request.user.id or getattr(obj, "user", None) == request.user
