import json
import logging
from typing import Dict, Optional

from django.conf import settings

try:
    from pywebpush import WebPushException, webpush
except Exception:  # pragma: no cover - safe fallback when package missing
    WebPushException = Exception
    webpush = None


logger = logging.getLogger(__name__)


def web_push_is_configured() -> bool:
    return bool(
        getattr(settings, "WEB_PUSH_VAPID_PUBLIC_KEY", "").strip()
        and getattr(settings, "WEB_PUSH_VAPID_PRIVATE_KEY", "").strip()
        and getattr(settings, "WEB_PUSH_VAPID_CLAIMS_SUB", "").strip()
    )


def send_web_push(subscription, title: str, message: str, target_url: str = "") -> Dict[str, Optional[object]]:
    """
    Send one web push message.
    Returns: {"success": bool, "status_code": int|None, "permanent_failure": bool, "reason": str}
    """
    if webpush is None:
        return {
            "success": False,
            "status_code": None,
            "permanent_failure": False,
            "reason": "pywebpush is not installed.",
        }

    if not web_push_is_configured():
        return {
            "success": False,
            "status_code": None,
            "permanent_failure": False,
            "reason": "Web push VAPID env vars are not configured.",
        }

    payload = {
        "title": title,
        "body": message,
        "url": target_url or "/",
    }
    if target_url:
        payload["target_url"] = target_url

    try:
        webpush(
            subscription_info={
                "endpoint": subscription.endpoint,
                "keys": {"p256dh": subscription.p256dh, "auth": subscription.auth},
            },
            data=json.dumps(payload),
            vapid_private_key=settings.WEB_PUSH_VAPID_PRIVATE_KEY.strip(),
            vapid_claims={"sub": settings.WEB_PUSH_VAPID_CLAIMS_SUB.strip()},
        )
        return {
            "success": True,
            "status_code": 201,
            "permanent_failure": False,
            "reason": "",
        }
    except WebPushException as exc:
        status_code = None
        if getattr(exc, "response", None) is not None:
            status_code = getattr(exc.response, "status_code", None)
        permanent = status_code in (404, 410)
        reason = str(exc)
        if status_code:
            reason = f"{status_code}: {reason}"
        logger.warning("Web push failed endpoint=%s status=%s", subscription.endpoint, status_code)
        return {
            "success": False,
            "status_code": status_code,
            "permanent_failure": permanent,
            "reason": reason,
        }
    except Exception as exc:  # pragma: no cover - external transport/runtime errors
        logger.warning("Unexpected web push failure endpoint=%s err=%s", subscription.endpoint, exc)
        return {
            "success": False,
            "status_code": None,
            "permanent_failure": False,
            "reason": str(exc),
        }
