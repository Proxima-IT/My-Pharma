from rest_framework import status
from rest_framework.test import APITestCase

from authentication.constants import UserRole, UserStatus
from authentication.models import User

from .models import NotificationCampaign, UserPushSubscription


class NotificationApiSmokeTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            password="StrongPass123!",
            role=UserRole.SUPER_ADMIN,
            status=UserStatus.ACTIVE,
            is_staff=True,
            is_superuser=True,
            email_verified=True,
        )
        self.customer = User.objects.create_user(
            email="customer@example.com",
            password="StrongPass123!",
            role=UserRole.REGISTERED_USER,
            status=UserStatus.ACTIVE,
            email_verified=True,
        )
        UserPushSubscription.objects.create(
            user=self.customer,
            fcm_token="test-fcm-token",
            is_active=True,
            platform="test",
        )
        self.client.force_authenticate(user=self.admin_user)

    def test_notification_health_endpoint(self):
        response = self.client.get("/api/notifications/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("firebase_initialized", response.data)
        self.assertIn("active_subscriptions", response.data)

    def test_campaign_create_and_detail_flow(self):
        payload = {
            "title": "Smoke Test",
            "message": "Campaign smoke run",
            "audience_mode": "USER_IDS",
            "user_ids": [self.customer.id],
            "send_to_opted_in_only": False,
        }
        create_response = self.client.post("/api/notifications/campaigns/", payload, format="json")
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        campaign_id = create_response.data.get("campaign_id")
        self.assertTrue(NotificationCampaign.objects.filter(pk=campaign_id).exists())

        detail_response = self.client.get(f"/api/notifications/campaigns/{campaign_id}/")
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data["campaign"]["id"], campaign_id)
