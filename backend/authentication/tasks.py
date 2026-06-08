"""
Celery tasks for auth: OTP SMS, password reset email.
Async to avoid blocking request cycle; Redis as broker.
"""
import logging
import json
from urllib import request as urllib_request
from urllib.error import HTTPError, URLError

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


def _send_mimsms_sms(phone: str, message: str) -> None:
    """Helper to send an arbitrary SMS via MiMSMS gateway."""
    if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
        logger.info("[EAGER DEV/TEST MODE] SMS to ****%s: %s", phone[-4:], message)
        return

    if not getattr(settings, "MIMSMS_ENABLED", True):
        logger.info("MiMSMS is disabled; skipped SMS for ****%s.", phone[-4:])
        return

    username = getattr(settings, "MIMSMS_USERNAME", "").strip()
    apikey = getattr(settings, "MIMSMS_APIKEY", "").strip()
    sender_name = getattr(settings, "MIMSMS_SENDER_NAME", "").strip()
    if not username or not apikey or not sender_name:
        logger.warning(
            "MiMSMS credentials are not fully configured (username/apikey/sender). "
            "Skipping SMS for ****%s.",
            phone[-4:],
        )
        return

    base_url = getattr(settings, "MIMSMS_BASE_URL", "https://api.mimsms.com").strip().rstrip("/")
    send_path = getattr(settings, "MIMSMS_SEND_SMS_PATH", "/api/SmsSending/SMS").strip()
    if not send_path.startswith("/"):
        send_path = "/" + send_path
    endpoint = f"{base_url}{send_path}"

    payload = {
        "UserName": username,
        "Apikey": apikey,
        "MobileNumber": phone,
        "CampaignId": getattr(settings, "MIMSMS_CAMPAIGN_ID", "null"),
        "SenderName": sender_name,
        "TransactionType": getattr(settings, "MIMSMS_TRANSACTION_TYPE", "T"),
        "Message": message,
    }

    payload_for_log = payload.copy()
    payload_for_log["Apikey"] = "********"
    logger.debug("MiMSMS Request Payload: %s", json.dumps(payload_for_log))

    req = urllib_request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    timeout = int(getattr(settings, "MIMSMS_TIMEOUT_SECONDS", 15))
    try:
        with urllib_request.urlopen(req, timeout=timeout) as resp:
            body = resp.read().decode("utf-8")
            logger.debug("MiMSMS Response: %s", body)
    except HTTPError as e:
        body = e.read().decode("utf-8")
        logger.error("MiMSMS HTTP Error %s: %s", e.code, body)
        raise ValueError(f"MiMSMS HTTP {e.code}: {body}")

    parsed = {}
    if body:
        try:
            parsed = json.loads(body)
        except json.JSONDecodeError:
            parsed = {}

    status_code = str(parsed.get("statusCode", "")).strip()
    status_text = str(parsed.get("status", "")).strip().lower()
    if status_code != "200" or status_text not in {"ok", "success"}:
        raise ValueError(f"MiMSMS send failed: {body or 'empty response'}")

    logger.info("SMS sent successfully to ****%s via MiMSMS.", phone[-4:])


@shared_task(bind=True, max_retries=3)
def send_otp_sms(self, phone: str, otp: str):
    """Send OTP via MiMSMS SMS gateway."""
    try:
        message = f"Your My Pharma OTP is {otp}. Valid for {getattr(settings, 'AUTH_OTP_EXPIRY_MINUTES', 5)} minutes."
        _send_mimsms_sms(phone, message)
    except Exception as exc:
        if isinstance(exc, HTTPError):
            detail = f"HTTP {exc.code}"
        elif isinstance(exc, URLError):
            detail = f"URL error: {exc.reason}"
        else:
            detail = str(exc)
        logger.warning("OTP send failed for ****%s: %s", phone[-4:], detail)
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_generic_sms(self, phone: str, message: str):
    """Send a generic SMS (e.g. order status) via MiMSMS gateway."""
    try:
        _send_mimsms_sms(phone, message)
    except Exception as exc:
        if isinstance(exc, HTTPError):
            detail = f"HTTP {exc.code}"
        elif isinstance(exc, URLError):
            detail = f"URL error: {exc.reason}"
        else:
            detail = str(exc)
        logger.warning("Generic SMS send failed for ****%s: %s", phone[-4:], detail)
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_otp_email(self, email: str, otp: str):
    """
    Send OTP via email. Uses Django's send_mail; configure EMAIL_* in production.
    Placeholder logs OTP for development when CELERY_TASK_ALWAYS_EAGER.
    """
    try:
        if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
            logger.info("OTP for email %s is: %s (dev mode)", email, otp)
            return
        subject = "My Pharma – Your verification code"
        message = f"Your verification code is: {otp}. It is valid for 5 minutes. Do not share it."
        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@mypharma.com")
        send_mail(subject, message, from_email, [email], fail_silently=False)
        logger.info("OTP email sent to %s***", email[:2])
    except Exception as exc:
        logger.warning("OTP email failed: %s", exc)
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_password_reset_email(self, user_id: int, reset_link: str):
    """Send password reset link to user email."""
    from .models import User

    user = User.objects.filter(pk=user_id).exclude(deleted_at__isnull=False).first()
    if not user or not user.email:
        return
    try:
        subject = "My Pharma – Password Reset"
        message = (
            "We received a request to reset your My Pharma password.\n\n"
            f"Reset your password: {reset_link}\n\n"
            "This link will expire soon. If you did not request this, ignore this email."
        )
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
