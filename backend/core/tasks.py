import logging
from datetime import timedelta

from celery import shared_task
from django.utils import timezone
from .models import NotificationCampaign, NotificationDeliveryLog, UserPushSubscription
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
    campaign_id: int | None = None,
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
            if campaign_id:
                NotificationDeliveryLog.objects.create(
                    campaign_id=campaign_id,
                    user_id=subscription.user_id,
                    subscription=subscription,
                    fcm_token=(subscription.fcm_token or "")[:255],
                    status=NotificationDeliveryLog.DeliveryStatus.SUCCESS,
                    status_code=result.get("status_code"),
                    permanent_failure=False,
                    reason="",
                    provider_message_id=(result.get("provider_message_id") or "")[:255],
                )
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
        if campaign_id:
            NotificationDeliveryLog.objects.create(
                campaign_id=campaign_id,
                user_id=subscription.user_id,
                subscription=subscription,
                fcm_token=(subscription.fcm_token or "")[:255],
                status=(
                    NotificationDeliveryLog.DeliveryStatus.DEACTIVATED
                    if result["permanent_failure"]
                    else NotificationDeliveryLog.DeliveryStatus.FAILED
                ),
                status_code=result.get("status_code"),
                permanent_failure=bool(result.get("permanent_failure")),
                reason=(result.get("reason") or "")[:300],
                provider_message_id=(result.get("provider_message_id") or "")[:255],
            )

    logger.info("Push fanout completed: %s", stats)
    if campaign_id:
        campaign = NotificationCampaign.objects.filter(pk=campaign_id).first()
        if campaign:
            campaign.push_attempted = stats["push_attempted"]
            campaign.push_succeeded = stats["push_succeeded"]
            campaign.push_failed = stats["push_failed"]
            campaign.push_deactivated = stats["push_deactivated"]
            if stats["push_attempted"] == 0:
                campaign.status = NotificationCampaign.Status.COMPLETED
            elif stats["push_failed"] == 0:
                campaign.status = NotificationCampaign.Status.COMPLETED
            elif stats["push_succeeded"] == 0:
                campaign.status = NotificationCampaign.Status.FAILED
            else:
                campaign.status = NotificationCampaign.Status.PARTIAL
            campaign.save(
                update_fields=[
                    "push_attempted",
                    "push_succeeded",
                    "push_failed",
                    "push_deactivated",
                    "status",
                    "updated_at",
                ]
            )
    return stats


@shared_task
def cleanup_inactive_push_subscriptions(days: int = 90):
    """
    Remove stale inactive tokens to keep the table lean.
    """
    cutoff = timezone.now() - timedelta(days=max(1, int(days)))
    removed, _ = UserPushSubscription.objects.filter(
        is_active=False,
        updated_at__lt=cutoff,
    ).delete()
    logger.info("Cleanup inactive push subscriptions removed=%s cutoff=%s", removed, cutoff.isoformat())
    return {"removed": removed, "cutoff": cutoff.isoformat()}
