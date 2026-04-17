import json
import logging
from typing import Dict, Optional

from django.conf import settings

logger = logging.getLogger(__name__)


def fcm_is_configured() -> bool:
    """Check if Firebase Admin SDK was initialized successfully."""
    return getattr(settings, "FIREBASE_INITIALIZED", False)


def send_web_push(subscription, title: str, message: str, target_url: str = "") -> Dict[str, Optional[object]]:
    """
    Send one push notification via Firebase Cloud Messaging.
    Returns: {"success": bool, "status_code": int|None, "permanent_failure": bool, "reason": str}
    """
    try:
        from firebase_admin import messaging
    except ImportError:
        logger.error("FCM send aborted: firebase-admin dependency missing.")
        return {
            "success": False,
            "status_code": None,
            "permanent_failure": False,
            "reason": "firebase-admin is not installed.",
        }

    if not fcm_is_configured():
        logger.error("FCM send aborted: Firebase Admin SDK is not configured.")
        return {
            "success": False,
            "status_code": None,
            "permanent_failure": False,
            "reason": "Firebase Admin SDK is not configured.",
        }

    fcm_token = subscription.fcm_token
    if not fcm_token:
        logger.error("FCM send aborted: Empty FCM token for subscription_id=%s", getattr(subscription, "id", None))
        return {
            "success": False,
            "status_code": None,
            "permanent_failure": True,
            "reason": "Empty FCM token.",
        }

    notification = messaging.Notification(
        title=title,
        body=message,
    )

    # Data payload for the service worker to handle click navigation
    data = {
        "title": title,
        "message": message,
        "target_url": target_url or "/",
    }

    fcm_message = messaging.Message(
        notification=notification,
        data=data,
        token=fcm_token,
        webpush=messaging.WebpushConfig(
            notification=messaging.WebpushNotification(
                title=title,
                body=message,
                icon="/assets/images/appicon.png",
                badge="/assets/images/appicon.png",
                require_interaction=True,
                tag="my-pharma-notification",
            ),
            fcm_options=messaging.WebpushFCMOptions(
                link=target_url or "/",
            ),
        ),
    )

    try:
        logger.info(
            "FCM send requested user_id=%s token_prefix=%s target_url=%s",
            getattr(subscription, "user_id", None),
            fcm_token[:20],
            target_url or "/",
        )
        message_id = messaging.send(fcm_message)
        logger.info("FCM push sent: token=%s message_id=%s", fcm_token[:20], message_id)
        return {
            "success": True,
            "status_code": 200,
            "permanent_failure": False,
            "reason": "",
        }
    except messaging.UnregisteredError:
        # Token is expired or invalid — permanent failure
        logger.warning("FCM token unregistered: %s", fcm_token[:20])
        return {
            "success": False,
            "status_code": 404,
            "permanent_failure": True,
            "reason": "Token unregistered (expired or invalid).",
        }
    except messaging.SenderIdMismatchError:
        # Token belongs to a different Firebase project — permanent failure
        logger.warning("FCM sender ID mismatch: %s", fcm_token[:20])
        return {
            "success": False,
            "status_code": 403,
            "permanent_failure": True,
            "reason": "Sender ID mismatch.",
        }
    except messaging.InvalidArgumentError as exc:
        logger.warning("FCM invalid argument: %s err=%s", fcm_token[:20], exc)
        return {
            "success": False,
            "status_code": 400,
            "permanent_failure": True,
            "reason": f"Invalid argument: {exc}",
        }
    except Exception as exc:
        # Transient errors (network, quota, etc.)
        logger.warning("FCM push failed: token=%s err=%s", fcm_token[:20], exc)
        return {
            "success": False,
            "status_code": None,
            "permanent_failure": False,
            "reason": str(exc),
        }
