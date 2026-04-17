import logging

from celery import shared_task
from .models import UserPushSubscription
from .services_push import send_web_push

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=2)
def dispatch_web_push_notifications(
    self,
    *,
    user_ids,
    title: str,
    message: str,
    target_url: str = "",
    opted_in_only: bool = False,
):
    """
    Fanout push notification to active user subscriptions.
    Permanent (404/410) push failures deactivate subscriptions.
    """
    queryset = UserPushSubscription.objects.filter(
        user_id__in=(user_ids or []),
        is_active=True,
        user__is_active=True,
    )
    if opted_in_only:
        queryset = queryset.filter(
            user__notification_preference__is_enabled=True,
            user__notification_preference__browser_permission="granted",
        )
    logger.info(
        "Push fanout started users=%s opted_in_only=%s target_url=%s",
        len(user_ids or []),
        opted_in_only,
        target_url,
    )

    stats = {
        "push_attempted": 0,
        "push_succeeded": 0,
        "push_failed": 0,
        "push_deactivated": 0,
    }

    for subscription in queryset.iterator(chunk_size=500):
        stats["push_attempted"] += 1
        result = send_web_push(
            subscription=subscription,
            title=title,
            message=message,
            target_url=target_url,
        )
        if result["success"]:
            stats["push_succeeded"] += 1
            continue

        stats["push_failed"] += 1
        logger.warning(
            "Push send failed user_id=%s token_prefix=%s status_code=%s permanent=%s reason=%s",
            subscription.user_id,
            (subscription.fcm_token or "")[:20],
            result.get("status_code"),
            result.get("permanent_failure"),
            result.get("reason"),
        )
        if result["permanent_failure"]:
            UserPushSubscription.objects.filter(pk=subscription.pk).update(is_active=False)
            stats["push_deactivated"] += 1

    logger.info("Push fanout completed: %s", stats)
    return stats
