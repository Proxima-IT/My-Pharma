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
    if getattr(settings, "DEBUG", False):
        logger.info("[DEBUG] SMS to ****%s: %s", phone[-4:], message)

    if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
        logger.info("[EAGER DEV/TEST MODE] SMS to ****%s: %s", phone[-4:], message)
        return

    if not getattr(settings, "MIMSMS_ENABLED", True):
        logger.info("MiMSMS is disabled; skipped SMS for ****%s. Message: %s", phone[-4:], message)
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
    send_path = getattr(settings, "MIMSMS_SEND_SMS_PATH", "/api/V2/SMS").strip()
    if not send_path.startswith("/"):
        send_path = "/" + send_path
    endpoint = f"{base_url}{send_path}"

    payload = {
        "userName": username,
        "apiKey": apikey,
        "mobileNumber": phone,
        "campaignName": getattr(settings, "MIMSMS_CAMPAIGN_ID", "null"),
        "senderName": sender_name,
        "transactionType": getattr(settings, "MIMSMS_TRANSACTION_TYPE", "T"),
        "message": message,
    }

    payload_for_log = payload.copy()
    payload_for_log["apiKey"] = "********"
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
        logger.warning("OTP send failed for ****%s: %s. OTP code: %s", phone[-4:], detail, otp)
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


def send_beautiful_html_email(subject: str, template_name: str, context: dict, to_email: str, attachments=None):
    """
    Helper to render and send a beautiful HTML email with the brand logo attached inline.
    """
    from django.core.mail import EmailMultiAlternatives
    from django.template.loader import render_to_string
    from django.utils.html import strip_tags
    from email.mime.image import MIMEImage
    import os

    # Set site URL context variable
    site_url = getattr(settings, "AUTH_PASSWORD_RESET_FRONTEND_URL", "http://localhost:3000").strip()
    context.setdefault("site_url", site_url)

    # Render HTML and generate plain text fallback
    html_content = render_to_string(template_name, context)
    text_content = context.get("text_message", strip_tags(html_content))

    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@mypharma.com")

    msg = EmailMultiAlternatives(subject, text_content, from_email, [to_email])
    msg.attach_alternative(html_content, "text/html")

    # Attach any regular attachments
    if attachments:
        for filename, content, mimetype in attachments:
            msg.attach(filename, content, mimetype)

    # Attach the logo inline
    logo_path = os.path.join(settings.BASE_DIR, 'core', 'static', 'images', 'my-pharma-logo.png')
    if os.path.exists(logo_path):
        try:
            with open(logo_path, 'rb') as f:
                msg_image = MIMEImage(f.read())
                msg_image.add_header('Content-ID', '<logo>')
                msg_image.add_header('Content-Disposition', 'inline', filename='my-pharma-logo.png')
                msg.attach(msg_image)
        except Exception as e:
            logger.warning("Failed to attach logo to email: %s", e)

    msg.send(fail_silently=False)


@shared_task(bind=True, max_retries=3)
def send_otp_email(self, email: str, otp: str):
    """
    Send OTP via email. Uses send_beautiful_html_email helper.
    Placeholder logs OTP for development when CELERY_TASK_ALWAYS_EAGER.
    """
    try:
        if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
            logger.info("OTP for email %s is: %s (dev mode)", email, otp)
            return
        if getattr(settings, "DEBUG", False):
            logger.info("[DEBUG] Generated OTP for email %s is: %s", email, otp)
            
        subject = "My Pharma – Your verification code"
        context = {
            "otp": otp,
            "expiry_minutes": getattr(settings, "AUTH_OTP_EXPIRY_MINUTES", 5),
            "text_message": f"Your verification code is: {otp}. It is valid for 5 minutes. Do not share it."
        }
        send_beautiful_html_email(
            subject=subject,
            template_name="emails/otp_email.html",
            context=context,
            to_email=email
        )
        logger.info("OTP email sent to %s***", email[:2])
    except Exception as exc:
        logger.warning("OTP email failed: %s", exc)
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_password_reset_email(self, user_id: int, reset_link: str):
    """Send password reset link to user email in HTML format."""
    from .models import User

    user = User.objects.filter(pk=user_id).exclude(deleted_at__isnull=False).first()
    if not user or not user.email:
        return
    try:
        subject = "My Pharma – Password Reset"
        context = {
            "username": getattr(user, "username", "Valued Customer"),
            "reset_link": reset_link,
            "text_message": (
                "We received a request to reset your My Pharma password.\n\n"
                f"Reset your password: {reset_link}\n\n"
                "This link will expire soon. If you did not request this, ignore this email."
            )
        }
        send_beautiful_html_email(
            subject=subject,
            template_name="emails/password_reset_email.html",
            context=context,
            to_email=user.email
        )
        logger.info("Password reset email sent to user_id=%s", user_id)
    except Exception as exc:
        logger.warning("Password reset email failed: %s", exc)
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_order_invoice_email(self, order_id: int):
    """Generates PDF invoice for the given order and emails it to the customer in HTML format."""
    from core.models import Order
    from core.invoice_generator import generate_invoice_pdf

    order = Order.objects.filter(pk=order_id).first()
    if not order:
        logger.warning("Order %s not found; skipping invoice email.", order_id)
        return

    email = order.user.email
    if not email or email.endswith("@ph.local"):
        logger.info("Order %s user has placeholder or no email (%s); skipping invoice email.", order_id, email)
        return

    try:
        subject = f"My Pharma – Invoice for Order #{order.id}"
        
        # Build the order URL for the frontend
        frontend_url = getattr(settings, "AUTH_PASSWORD_RESET_FRONTEND_URL", "http://localhost:3000").strip()
        order_url = f"{frontend_url.rstrip('/')}/user/orders/{order.id}"

        # Generate the PDF content
        pdf_content = generate_invoice_pdf(order)
        attachments = [
            (f"invoice_{order.id}.pdf", pdf_content, "application/pdf")
        ]

        context = {
            "username": getattr(order.user, "username", "Valued Customer"),
            "order": order,
            "order_status": order.get_status_display(),
            "order_url": order_url,
            "text_message": (
                f"Dear {getattr(order.user, 'username', 'Valued Customer')},\n\n"
                f"Thank you for your order! Your order #{order.id} has been confirmed. "
                f"We have attached the PDF invoice for your purchase.\n\n"
                f"Order Status: {order.get_status_display()}\n"
                f"Total Amount: TK {order.total}\n\n"
                f"If you have any questions, please reply to this email or contact our support team.\n\n"
                f"Best regards,\n"
                f"My Pharma Team"
            )
        }
        
        send_beautiful_html_email(
            subject=subject,
            template_name="emails/order_invoice_email.html",
            context=context,
            to_email=email,
            attachments=attachments
        )
        logger.info("Invoice email sent successfully for order_id=%s to %s", order_id, email)
    except Exception as exc:
        logger.warning("Invoice email failed for order_id=%s: %s", order_id, exc)
        raise self.retry(exc=exc, countdown=60)

