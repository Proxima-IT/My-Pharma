"""
Authentication Permissions
Role-Based Access Control (RBAC) permission classes.
"""

from rest_framework import permissions
from rest_framework.request import Request

from authentication.models import UserRole


# =============================================================================
# BASE PERMISSION CLASSES
# =============================================================================
class IsAuthenticated(permissions.IsAuthenticated):
    """
    Extended IsAuthenticated with additional checks.
    """
    
    def has_permission(self, request: Request, view) -> bool:
        """
        Check if user is authenticated and has valid status.
        """
        if not super().has_permission(request, view):
            return False
        
        user = request.user
        
        # Check if account is active
        if not user.is_active:
            return False
        
        # Check if account is not locked
        if user.is_account_locked():
            return False
        
        return True


class IsVerified(permissions.BasePermission):
    """
    Permission class to check if user is verified.
    """
    
    message = 'Your account is not verified.'
    
    def has_permission(self, request: Request, view) -> bool:
        """
        Check if user is verified.
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.is_verified


# =============================================================================
# ROLE-BASED PERMISSION CLASSES
# =============================================================================
class RoleBasedPermission(permissions.BasePermission):
    """
    Dynamic role-based permission class.
    
    Usage:
    - Define required_roles on view: required_roles = [UserRole.PHARMACY_ADMIN]
    - Define required_permissions on view: required_permissions = ['product.manage']
    """
    
    message = 'You do not have permission to access this resource.'
    
    def has_permission(self, request: Request, view) -> bool:
        """
        Check if user has required role or permissions.
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Super admin has all permissions
        if user.role == UserRole.SUPER_ADMIN:
            return True
        
        # Check required roles
        required_roles = getattr(view, 'required_roles', [])
        if required_roles and user.role not in required_roles:
            return False
        
        # Check required permissions
        required_permissions = getattr(view, 'required_permissions', [])
        if required_permissions:
            if not user.has_any_permission(required_permissions):
                return False
        
        return True
    
    def has_object_permission(self, request: Request, view, obj) -> bool:
        """
        Check object-level permissions.
        """
        return self.has_permission(request, view)


# =============================================================================
# SPECIFIC ROLE PERMISSIONS
# =============================================================================
class IsSuperAdmin(permissions.BasePermission):
    """
    Permission class for Super Admin only.
    """
    
    message = 'Super Admin access required.'
    
    def has_permission(self, request: Request, view) -> bool:
        """
        Check if user is Super Admin.
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.role == UserRole.SUPER_ADMIN


class IsPharmacyAdmin(permissions.BasePermission):
    """
    Permission class for Pharmacy Admin and above.
    """
    
    message = 'Pharmacy Admin access required.'
    
    def has_permission(self, request: Request, view) -> bool:
        """
        Check if user is Pharmacy Admin or Super Admin.
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.role in [
            UserRole.PHARMACY_ADMIN,
            UserRole.SUPER_ADMIN
        ]


class IsDoctor(permissions.BasePermission):
    """
    Permission class for Doctor and above.
    """
    
    message = 'Doctor access required.'
    
    def has_permission(self, request: Request, view) -> bool:
        """
        Check if user is Doctor or above.
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.role in [
            UserRole.DOCTOR,
            UserRole.PHARMACY_ADMIN,
            UserRole.SUPER_ADMIN
        ]


class IsRegisteredUser(permissions.BasePermission):
    """
    Permission class for Registered User and above.
    """
    
    message = 'Registered user access required.'
    
    def has_permission(self, request: Request, view) -> bool:
        """
        Check if user is Registered User or above.
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.role in [
            UserRole.REGISTERED_USER,
            UserRole.DOCTOR,
            UserRole.PHARMACY_ADMIN,
            UserRole.SUPER_ADMIN
        ]


# =============================================================================
# PERMISSION-BASED CLASSES
# =============================================================================
class HasUserManagementPermission(permissions.BasePermission):
    """
    Permission class for user management operations.
    """
    
    message = 'User management permission required.'
    
    def has_permission(self, request: Request, view) -> bool:
        """
        Check if user has user management permissions.
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Super admin and pharmacy admin can manage users
        if user.role in [UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN]:
            return True
        
        return False


class HasProductManagementPermission(permissions.BasePermission):
    """
    Permission class for product management operations.
    """
    
    message = 'Product management permission required.'
    
    def has_permission(self, request: Request, view) -> bool:
        """
        Check if user has product management permissions.
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Check permissions
        if user.has_permission('product.manage'):
            return True
        
        return False
    
    def has_object_permission(self, request: Request, view, obj) -> bool:
        """
        Check object-level permissions.
        """
        return self.has_permission(request, view)


class HasOrderManagementPermission(permissions.BasePermission):
    """
    Permission class for order management operations.
    """
    
    message = 'Order management permission required.'
    
    def has_permission(self, request: Request, view) -> bool:
        """
        Check if user has order management permissions.
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Check permissions
        if user.has_permission('order.manage'):
            return True
        
        # Registered users can view their own orders
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return False


class HasPrescriptionManagementPermission(permissions.BasePermission):
    """
    Permission class for prescription management operations.
    """
    
    message = 'Prescription management permission required.'
    
    def has_permission(self, request: Request, view) -> bool:
        """
        Check if user has prescription permissions.
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Doctors can create prescriptions
        if user.role == UserRole.DOCTOR:
            return True
        
        # Pharmacy admins and super admins can approve
        if user.role in [UserRole.PHARMACY_ADMIN, UserRole.SUPER_ADMIN]:
            return True
        
        # Users can view their own prescriptions
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return False


class HasReportPermission(permissions.BasePermission):
    """
    Permission class for report viewing.
    """
    
    message = 'Report viewing permission required.'
    
    def has_permission(self, request: Request, view) -> bool:
        """
        Check if user has report viewing permissions.
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Check permissions
        if user.has_permission('report.view'):
            return True
        
        return False


class HasSystemConfigPermission(permissions.BasePermission):
    """
    Permission class for system configuration.
    """
    
    message = 'System configuration permission required.'
    
    def has_permission(self, request: Request, view) -> bool:
        """
        Check if user has system config permissions.
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Only super admin can configure system
        if user.role == UserRole.SUPER_ADMIN:
            return True
        
        return False


# =============================================================================
# OBJECT-LEVEL PERMISSIONS
# =============================================================================
class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners to edit their objects.
    """
    
    def has_object_permission(self, request: Request, view, obj) -> bool:
        """
        Check if user is owner of the object.
        """
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only to owner
        return obj.user == request.user


class IsOwner(permissions.BasePermission):
    """
    Object-level permission to only allow owners.
    """
    
    def has_object_permission(self, request: Request, view, obj) -> bool:
        """
        Check if user is owner of the object.
        """
        return obj.user == request.user


# =============================================================================
# PERMISSION HELPERS
# =============================================================================
def check_role(user, roles):
    """
    Helper function to check if user has any of the specified roles.
    
    Args:
        user: User instance
        roles: List of role strings
    
    Returns:
        bool: True if user has any of the roles
    """
    if not user or not user.is_authenticated:
        return False
    
    return user.role in roles


def check_permission(user, permission):
    """
    Helper function to check if user has a specific permission.
    
    Args:
        user: User instance
        permission: Permission string
    
    Returns:
        bool: True if user has the permission
    """
    if not user or not user.is_authenticated:
        return False
    
    return user.has_permission(permission)


def check_any_permission(user, permissions):
    """
    Helper function to check if user has any of the specified permissions.
    
    Args:
        user: User instance
        permissions: List of permission strings
    
    Returns:
        bool: True if user has any of the permissions
    """
    if not user or not user.is_authenticated:
        return False
    
    return user.has_any_permission(permissions)


def check_all_permissions(user, permissions):
    """
    Helper function to check if user has all specified permissions.
    
    Args:
        user: User instance
        permissions: List of permission strings
    
    Returns:
        bool: True if user has all permissions
    """
    if not user or not user.is_authenticated:
        return False
    
    return user.has_all_permissions(permissions)
