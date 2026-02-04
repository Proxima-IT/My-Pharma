"""
Celery tasks for auth: OTP SMS, password reset email.
Async to avoid blocking request cycle; Redis as broker.
"""
import logging
from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_otp_sms(self, phone: str, otp: str):
    """
    Send OTP via SMS. Implement actual provider (Twilio, etc.) in production.
    Placeholder logs OTP for development.
    """
    try:
        if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
            logger.info("OTP for %s: %s (dev mode)", phone[-4:], otp)
            return
        # Production: call SMS gateway (e.g. Twilio, BD local provider)
        # send_sms(phone, f"Your My Pharma OTP is {otp}. Valid for 5 minutes.")
        logger.info("OTP sent to phone (masked); implement SMS gateway in production.")
        return
    except Exception as exc:
        logger.warning("OTP send failed: %s", exc)
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_password_reset_email(self, user_id: int):
    """Send password reset link/token to user email. Implement token generation and link in production."""
    from .models import User

    user = User.objects.filter(pk=user_id).exclude(deleted_at__isnull=False).first()
    if not user or not user.email:
        return
    try:
        # Placeholder: generate reset token (e.g. signed token or one-time link) and send
        # In production: use PasswordResetTokenGenerator or similar, store in Redis with TTL
        subject = "My Pharma – Password Reset"
        message = "Use the link below to reset your password. If you did not request this, ignore this email."
        from django.core.mail import send_mail as django_send_mail
        django_send_mail(
            subject,
            message,
            getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@mypharma.com"),
            [user.email],
            fail_silently=False,
        )
        logger.info("Password reset email sent to user_id=%s", user_id)
    except Exception as exc:
        logger.warning("Password reset email failed: %s", exc)
        raise self.retry(exc=exc, countdown=60)
