import logging
from typing import Iterable, Optional

from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone

from authentication.constants import UserRole

from .models import NotificationCampaign, UserNotification, UserNotificationPreference, UserPushSubscription
from .tasks import dispatch_web_push_notifications

logger = logging.getLogger(__name__)


def resolve_recipients(
    *,
    audience_mode: str,
    send_to_opted_in_only: bool = False,
    user_ids: Optional[Iterable[int]] = None,
    role_filter: str = "",
):
    User = get_user_model()
    recipients = (
        User.objects.filter(is_active=True, deleted_at__isnull=True)
        .exclude(role=UserRole.GUEST_USER)
        .values_list("id", flat=True)
    )
    if audience_mode == NotificationCampaign.AudienceMode.USER_IDS:
        safe_ids = [int(user_id) for user_id in (user_ids or []) if str(user_id).strip().isdigit()]
        recipients = recipients.filter(id__in=safe_ids)
    elif audience_mode == NotificationCampaign.AudienceMode.ROLE_BASED and role_filter:
        recipients = recipients.filter(role=role_filter)

    if send_to_opted_in_only:
        opted_in_user_ids = UserNotificationPreference.objects.filter(
            is_enabled=True,
            browser_permission=UserNotificationPreference.BrowserPermission.GRANTED,
        ).values_list("user_id", flat=True)
        recipients = recipients.filter(id__in=opted_in_user_ids)
    return list(recipients)


def queue_campaign_delivery(campaign: NotificationCampaign, recipient_ids: list[int], *, send_to_opted_in_only: bool):
    rows = []
    created_count = 0
    for user_id in recipient_ids:
        rows.append(
            UserNotification(
                campaign=campaign,
                user_id=user_id,
                title=campaign.title,
                message=campaign.message,
                created_by=campaign.requested_by,
            )
        )
        if len(rows) >= 1000:
            UserNotification.objects.bulk_create(rows, batch_size=1000)
            created_count += len(rows)
            rows = []
    if rows:
        UserNotification.objects.bulk_create(rows, batch_size=1000)
        created_count += len(rows)

    campaign.recipient_count = created_count
    campaign.status = NotificationCampaign.Status.QUEUED
    campaign.save(update_fields=["recipient_count", "status", "updated_at"])

    push_queryset = UserPushSubscription.objects.filter(
        user_id__in=recipient_ids,
        is_active=True,
        user__is_active=True,
    )
    if send_to_opted_in_only:
        push_queryset = push_queryset.filter(
            user__notification_preference__is_enabled=True,
            user__notification_preference__browser_permission=UserNotificationPreference.BrowserPermission.GRANTED,
        )
    push_attempted = push_queryset.count()

    push_succeeded = 0
    push_failed = 0
    push_deactivated = 0

    if recipient_ids and push_attempted > 0:
        task_result = dispatch_web_push_notifications.delay(
            user_ids=recipient_ids,
            title=campaign.title,
            message=campaign.message,
            target_url=campaign.target_url,
            opted_in_only=send_to_opted_in_only,
            campaign_id=campaign.id,
        )
        if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
            stats = task_result.get(timeout=30) or {}
            push_attempted = stats.get("push_attempted", push_attempted)
            push_succeeded = stats.get("push_succeeded", 0)
            push_failed = stats.get("push_failed", 0)
            push_deactivated = stats.get("push_deactivated", 0)
            campaign.status = (
                NotificationCampaign.Status.COMPLETED
                if push_failed == 0
                else NotificationCampaign.Status.PARTIAL
            )
            campaign.push_attempted = push_attempted
            campaign.push_succeeded = push_succeeded
            campaign.push_failed = push_failed
            campaign.push_deactivated = push_deactivated
            campaign.save(
                update_fields=[
                    "status",
                    "push_attempted",
                    "push_succeeded",
                    "push_failed",
                    "push_deactivated",
                    "updated_at",
                ]
            )

    logger.info(
        "Notification campaign queued campaign_id=%s recipients=%s push_attempted=%s",
        campaign.id,
        len(recipient_ids),
        push_attempted,
    )
    return {
        "sent_count": created_count,
        "push_attempted": push_attempted,
        "push_succeeded": push_succeeded,
        "push_failed": push_failed,
        "push_deactivated": push_deactivated,
        "push_async": not getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False),
    }


def create_and_dispatch_campaign(
    *,
    title: str,
    message: str,
    target_url: str,
    requested_by,
    audience_mode: str,
    send_to_opted_in_only: bool,
    user_ids: Optional[Iterable[int]] = None,
    role_filter: str = "",
    source: str = "admin",
    dedupe_key: str = "",
    metadata: Optional[dict] = None,
):
    if dedupe_key:
        existing = NotificationCampaign.objects.filter(dedupe_key=dedupe_key).order_by("-id").first()
        if existing:
            logger.info("Notification campaign deduped dedupe_key=%s campaign_id=%s", dedupe_key, existing.id)
            return existing, {
                "sent_count": existing.recipient_count,
                "push_attempted": existing.push_attempted,
                "push_succeeded": existing.push_succeeded,
                "push_failed": existing.push_failed,
                "push_deactivated": existing.push_deactivated,
                "push_async": not getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False),
            }

    campaign = NotificationCampaign.objects.create(
        title=title,
        message=message,
        target_url=target_url or "",
        requested_by=requested_by,
        audience_mode=audience_mode,
        role_filter=role_filter or "",
        source=source,
        dedupe_key=dedupe_key or "",
        metadata=metadata or {},
        status=NotificationCampaign.Status.DRAFT,
    )
    logger.info(
        "Notification campaign created campaign_id=%s source=%s audience=%s requested_by=%s dedupe_key=%s",
        campaign.id,
        source,
        audience_mode,
        getattr(requested_by, "id", None),
        dedupe_key,
    )

    recipient_ids = resolve_recipients(
        audience_mode=audience_mode,
        send_to_opted_in_only=send_to_opted_in_only,
        user_ids=user_ids,
        role_filter=role_filter,
    )
    stats = queue_campaign_delivery(
        campaign,
        recipient_ids,
        send_to_opted_in_only=send_to_opted_in_only,
    )
    return campaign, stats


def send_user_event_notification(
    *,
    user_id: int,
    title: str,
    message: str,
    target_url: str,
    source: str,
    dedupe_key: str,
    metadata: Optional[dict] = None,
):
    campaign, _ = create_and_dispatch_campaign(
        title=title,
        message=message,
        target_url=target_url,
        requested_by=None,
        audience_mode=NotificationCampaign.AudienceMode.USER_IDS,
        send_to_opted_in_only=False,
        user_ids=[user_id],
        source=source,
        dedupe_key=dedupe_key,
        metadata=metadata or {},
    )
    campaign.updated_at = timezone.now()
    campaign.save(update_fields=["updated_at"])
    return campaign
