"""
Authentication Signals
Django signals for authentication events.
"""

import logging
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.conf import settings

from authentication.models import User, UserStatus

logger = logging.getLogger(__name__)


# =============================================================================
# USER SIGNALS
# =============================================================================
@receiver(pre_save, sender=User)
def user_pre_save(sender, instance, **kwargs):
    """
    Pre-save signal for User model.
    - Set default permissions based on role
    """
    # Set default permissions if not set
    if not instance.permissions and instance.role:
        from authentication.models import ROLE_PERMISSIONS
        instance.permissions = ROLE_PERMISSIONS.get(instance.role, [])


@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):
    """
    Post-save signal for User model.
    - Log user creation
    - Send welcome email
    """
    if created:
        logger.info(f"New user created: {instance.phone} ({instance.role})")
        
        # Queue welcome email if email is verified
        if instance.is_verified and instance.email:
            try:
                from authentication.tasks import send_welcome_email
                send_welcome_email.delay(str(instance.id))
            except Exception as e:
                logger.warning(f"Failed to queue welcome email: {e}")


# =============================================================================
# LOGIN SIGNALS
# =============================================================================
def user_logged_in_handler(sender, user, request, **kwargs):
    """
    Signal handler for successful login.
    - Log login event
    - Reset failed login attempts
    - Send security alert for new device
    """
    logger.info(f"User logged in: {user.phone}")
    
    # Reset failed login attempts
    user.reset_failed_login()
    
    # Update last login info
    from authentication.services import AuthenticationService
    user.last_login_ip = AuthenticationService.get_client_ip(request)
    user.last_login_device = AuthenticationService.get_device_info(request)
    user.save(update_fields=['last_login_ip', 'last_login_device'])
    
    # TODO: Send security alert for new device


# Connect to Django's login signal
try:
    from django.contrib.auth.signals import user_logged_in
    user_logged_in.connect(user_logged_in_handler)
except Exception as e:
    logger.warning(f"Failed to connect login signal: {e}")


# =============================================================================
# LOGOUT SIGNALS
# =============================================================================
def user_logged_out_handler(sender, request, user, **kwargs):
    """
    Signal handler for logout.
    - Log logout event
    """
    if user:
        logger.info(f"User logged out: {user.phone}")


# Connect to Django's logout signal
try:
    from django.contrib.auth.signals import user_logged_out
    user_logged_out.connect(user_logged_out_handler)
except Exception as e:
    logger.warning(f"Failed to connect logout signal: {e}")


# =============================================================================
# PASSWORD CHANGE SIGNALS
# =============================================================================
@receiver(pre_save, sender=User)
def user_password_change(sender, instance, **kwargs):
    """
    Detect password changes and send alerts.
    """
    if instance.pk:
        try:
            old_instance = User.objects.get(pk=instance.pk)
            if old_instance.password != instance.password:
                logger.info(f"Password changed for user: {instance.phone}")
                
                # TODO: Send password change notification
        except User.DoesNotExist:
            pass


# =============================================================================
# ACCOUNT LOCKOUT SIGNALS
# =============================================================================
def account_locked_handler(user, **kwargs):
    """
    Handle account lockout events.
    - Log lockout
    - Send security alert
    """
    logger.warning(f"Account locked: {user.phone}")
    
    # Send security alert
    try:
        from authentication.tasks import send_security_alert
        from django.utils import timezone
        
        send_security_alert.delay(
            user_id=str(user.id),
            alert_type='account_locked',
            details={'time': timezone.now().isoformat()}
        )
    except Exception as e:
        logger.warning(f"Failed to send lockout alert: {e}")


# =============================================================================
# TOKEN SIGNALS
# =============================================================================
@receiver(pre_save, sender=User)
def track_role_changes(sender, instance, **kwargs):
    """
    Track role changes for audit.
    """
    if instance.pk:
        try:
            old_instance = User.objects.get(pk=instance.pk)
            if old_instance.role != instance.role:
                logger.info(
                    f"Role changed for user {instance.phone}: "
                    f"{old_instance.role} -> {instance.role}"
                )
        except User.DoesNotExist:
            pass


# =============================================================================
# VERIFICATION SIGNALS
# =============================================================================
def phone_verified_handler(user, **kwargs):
    """
    Handle phone verification completion.
    - Log verification
    - Update user status
    """
    logger.info(f"Phone verified for user: {user.phone}")
    
    if user.status == UserStatus.PENDING_VERIFICATION:
        user.status = UserStatus.ACTIVE
        user.save(update_fields=['status'])


def email_verified_handler(user, **kwargs):
    """
    Handle email verification completion.
    - Log verification
    - Update user status
    """
    logger.info(f"Email verified for user: {user.email}")
    
    if user.status == UserStatus.PENDING_VERIFICATION:
        user.status = UserStatus.ACTIVE
        user.save(update_fields=['status'])
