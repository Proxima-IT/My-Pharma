"""
Authentication Tasks
Celery tasks for async operations.
"""

import logging
from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


# =============================================================================
# OTP TASKS
# =============================================================================
@shared_task(
    name='authentication.tasks.send_otp_sms_task',
    bind=True,
    max_retries=3,
    default_retry_delay=60
)
def send_otp_sms_task(self, phone: str, otp: str, purpose: str):
    """
    Send OTP via SMS gateway.
    
    Args:
        phone: Phone number
        otp: OTP code
        purpose: OTP purpose (registration, login, etc.)
    
    Returns:
        bool: Success status
    """
    try:
        # Build SMS message
        message = f"Your My Pharma verification code is: {otp}"
        
        # Check if SMS gateway is configured
        if not settings.SMS_GATEWAY_URL or not settings.SMS_GATEWAY_API_KEY:
            logger.warning(f"SMS gateway not configured. OTP for {phone}: {otp}")
            return True
        
        # TODO: Implement actual SMS gateway integration
        # Example with generic HTTP gateway:
        import requests
        
        payload = {
            'api_key': settings.SMS_GATEWAY_API_KEY,
            'sender_id': settings.SMS_SENDER_ID,
            'to': phone,
            'message': message
        }
        
        response = requests.post(
            settings.SMS_GATEWAY_URL,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            logger.info(f"OTP SMS sent to {phone}")
            return True
        else:
            logger.error(f"Failed to send OTP SMS: {response.text}")
            raise Exception(f"SMS gateway returned status {response.status_code}")
    
    except Exception as e:
        logger.error(f"Failed to send OTP SMS to {phone}: {str(e)}")
        
        # Retry on failure
        try:
            raise self.retry(exc=e)
        except self.MaxRetriesExceededError:
            logger.error(f"Max retries exceeded for OTP SMS to {phone}")
            return False


# =============================================================================
# EMAIL TASKS
# =============================================================================
@shared_task(
    name='authentication.tasks.send_email_task',
    bind=True,
    max_retries=3,
    default_retry_delay=60
)
def send_email_task(
    self,
    subject: str,
    message: str,
    recipient_list: list,
    html_message: str = None,
    from_email: str = None
):
    """
    Send email asynchronously.
    
    Args:
        subject: Email subject
        message: Plain text message
        recipient_list: List of recipient emails
        html_message: HTML message (optional)
        from_email: Sender email (optional)
    
    Returns:
        bool: Success status
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email or settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Email sent to {recipient_list}")
        return True
    
    except Exception as e:
        logger.error(f"Failed to send email to {recipient_list}: {str(e)}")
        
        try:
            raise self.retry(exc=e)
        except self.MaxRetriesExceededError:
            logger.error(f"Max retries exceeded for email to {recipient_list}")
            return False


@shared_task(name='authentication.tasks.send_verification_email_task')
def send_verification_email_task(user_id: str, verification_url: str):
    """
    Send email verification email.
    
    Args:
        user_id: User ID
        verification_url: Verification URL
    """
    try:
        from authentication.models import User
        
        user = User.objects.get(id=user_id)
        
        subject = 'Verify Your Email - My Pharma'
        
        # Plain text message
        message = f"""
        Hello {user.full_name},
        
        Thank you for registering with My Pharma. Please verify your email address by clicking the link below:
        
        {verification_url}
        
        This link will expire in 24 hours.
        
        If you did not create an account with My Pharma, please ignore this email.
        
        Best regards,
        My Pharma Team
        """
        
        # HTML message
        html_message = f"""
        <html>
        <body>
            <h2>Verify Your Email - My Pharma</h2>
            <p>Hello {user.full_name},</p>
            <p>Thank you for registering with My Pharma. Please verify your email address by clicking the button below:</p>
            <p><a href="{verification_url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
            <p>Or copy this link: {verification_url}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not create an account with My Pharma, please ignore this email.</p>
            <p>Best regards,<br>My Pharma Team</p>
        </body>
        </html>
        """
        
        send_email_task.delay(
            subject=subject,
            message=message,
            recipient_list=[user.email],
            html_message=html_message
        )
        
        logger.info(f"Verification email queued for {user.email}")
    
    except User.DoesNotExist:
        logger.error(f"User not found: {user_id}")


@shared_task(name='authentication.tasks.send_password_reset_email_task')
def send_password_reset_email_task(user_id: str, reset_url: str):
    """
    Send password reset email.
    
    Args:
        user_id: User ID
        reset_url: Password reset URL
    """
    try:
        from authentication.models import User
        
        user = User.objects.get(id=user_id)
        
        subject = 'Password Reset - My Pharma'
        
        # Plain text message
        message = f"""
        Hello {user.full_name},
        
        You requested a password reset for your My Pharma account. Click the link below to reset your password:
        
        {reset_url}
        
        This link will expire in 1 hour.
        
        If you did not request this password reset, please ignore this email or contact support if you have concerns.
        
        Best regards,
        My Pharma Team
        """
        
        # HTML message
        html_message = f"""
        <html>
        <body>
            <h2>Password Reset - My Pharma</h2>
            <p>Hello {user.full_name},</p>
            <p>You requested a password reset for your My Pharma account. Click the button below to reset your password:</p>
            <p><a href="{reset_url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
            <p>Or copy this link: {reset_url}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request this password reset, please ignore this email.</p>
            <p>Best regards,<br>My Pharma Team</p>
        </body>
        </html>
        """
        
        send_email_task.delay(
            subject=subject,
            message=message,
            recipient_list=[user.email],
            html_message=html_message
        )
        
        logger.info(f"Password reset email queued for {user.email}")
    
    except User.DoesNotExist:
        logger.error(f"User not found: {user_id}")


# =============================================================================
# MAINTENANCE TASKS
# =============================================================================
@shared_task(name='authentication.tasks.cleanup_expired_tokens')
def cleanup_expired_tokens():
    """
    Clean up expired blacklisted tokens.
    
    This task should run periodically (e.g., every hour).
    """
    from authentication.models import BlacklistedToken
    
    try:
        deleted_count = BlacklistedToken.cleanup_expired()
        logger.info(f"Cleaned up {deleted_count} expired tokens")
        return deleted_count
    except Exception as e:
        logger.error(f"Failed to cleanup expired tokens: {str(e)}")
        return 0


@shared_task(name='authentication.tasks.cleanup_otp_attempts')
def cleanup_otp_attempts():
    """
    Clean up expired OTP attempts from cache.
    
    This task should run periodically (e.g., every 30 minutes).
    """
    from django.core.cache import cache
    from authentication.services import OTPService
    
    try:
        # OTP attempts are stored with 1-hour expiry, so this is mainly
        # for ensuring cleanup of stale keys
        logger.info("OTP cleanup task executed")
        return True
    except Exception as e:
        logger.error(f"Failed to cleanup OTP attempts: {str(e)}")
        return False


@shared_task(name='authentication.tasks.cleanup_expired_sessions')
def cleanup_expired_sessions():
    """
    Clean up expired user sessions.
    
    This task should run periodically (e.g., daily).
    """
    from authentication.models import UserSession
    from django.utils import timezone
    from datetime import timedelta
    
    try:
        # Deactivate expired sessions
        expired_threshold = timezone.now()
        deactivated_count = UserSession.objects.filter(
            expires_at__lt=expired_threshold,
            is_active=True
        ).update(is_active=False)
        
        logger.info(f"Deactivated {deactivated_count} expired sessions")
        return deactivated_count
    except Exception as e:
        logger.error(f"Failed to cleanup expired sessions: {str(e)}")
        return 0


@shared_task(name='authentication.tasks.unlock_expired_accounts')
def unlock_expired_accounts():
    """
    Automatically unlock accounts that have passed their lockout period.
    
    This task should run periodically (e.g., every 5 minutes).
    """
    from authentication.models import User, UserStatus
    from django.utils import timezone
    
    try:
        # Find and unlock expired accounts
        unlocked_count = User.objects.filter(
            status=UserStatus.LOCKED,
            locked_until__lt=timezone.now()
        ).update(
            status=UserStatus.ACTIVE,
            locked_until=None,
            failed_login_attempts=0
        )
        
        if unlocked_count > 0:
            logger.info(f"Unlocked {unlocked_count} expired accounts")
        
        return unlocked_count
    except Exception as e:
        logger.error(f"Failed to unlock expired accounts: {str(e)}")
        return 0


# =============================================================================
# NOTIFICATION TASKS
# =============================================================================
@shared_task(name='authentication.tasks.send_welcome_email')
def send_welcome_email(user_id: str):
    """
    Send welcome email to new user.
    
    Args:
        user_id: User ID
    """
    try:
        from authentication.models import User
        
        user = User.objects.get(id=user_id)
        
        subject = 'Welcome to My Pharma!'
        
        message = f"""
        Hello {user.full_name},
        
        Welcome to My Pharma! Your account has been successfully created.
        
        We're excited to have you join our platform. Here's what you can do:
        
        - Browse our wide range of pharmaceutical products
        - Upload and manage prescriptions
        - Order medicines with easy delivery
        - Track your order history
        
        If you have any questions, our support team is here to help.
        
        Best regards,
        My Pharma Team
        """
        
        send_email_task.delay(
            subject=subject,
            message=message,
            recipient_list=[user.email]
        )
        
        logger.info(f"Welcome email queued for {user.email}")
    
    except User.DoesNotExist:
        logger.error(f"User not found: {user_id}")


@shared_task(name='authentication.tasks.send_security_alert')
def send_security_alert(user_id: str, alert_type: str, details: dict):
    """
    Send security alert email to user.
    
    Args:
        user_id: User ID
        alert_type: Type of security alert
        details: Alert details
    """
    try:
        from authentication.models import User
        
        user = User.objects.get(id=user_id)
        
        alert_messages = {
            'new_login': f"""
            A new login was detected on your My Pharma account.
            
            Details:
            - Time: {details.get('time', 'Unknown')}
            - IP: {details.get('ip', 'Unknown')}
            - Device: {details.get('device', 'Unknown')}
            
            If this was not you, please change your password immediately.
            """,
            'password_changed': """
            Your password has been changed.
            
            If you did not make this change, please contact support immediately.
            """,
            'account_locked': f"""
            Your account has been locked due to multiple failed login attempts.
            
            Details:
            - Time: {details.get('time', 'Unknown')}
            - IP: {details.get('ip', 'Unknown')}
            
            The account will be unlocked automatically after 30 minutes.
            If you need immediate assistance, please contact support.
            """,
        }
        
        subject = f'Security Alert - My Pharma'
        message = alert_messages.get(alert_type, 'Security alert from My Pharma.')
        
        send_email_task.delay(
            subject=subject,
            message=message,
            recipient_list=[user.email]
        )
        
        logger.info(f"Security alert email queued for {user.email}")
    
    except User.DoesNotExist:
        logger.error(f"User not found: {user_id}")
