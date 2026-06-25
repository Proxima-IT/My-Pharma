from unittest.mock import patch
from django.core.cache import cache
from rest_framework import status
from rest_framework.test import APITestCase

from authentication.constants import UserRole, UserStatus
from authentication.models import User
from authentication import utils

class PasswordResetOtpTests(APITestCase):
    def setUp(self):
        # Create a user with both email and phone
        self.user = User.objects.create_user(
            email="user@example.com",
            phone="8801711112222",
            password="StrongPass123!",
            role=UserRole.REGISTERED_USER,
            status=UserStatus.ACTIVE,
            email_verified=True,
        )
        cache.clear()

    @patch("authentication.tasks.send_password_reset_email.delay")
    def test_request_reset_email_success(self, mock_send_email):
        response = self.client.post(
            "/api/auth/password-reset/",
            {"email": "user@example.com"},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Password reset link sent to your email.")
        mock_send_email.assert_called_once()

    def test_request_reset_email_not_found(self):
        response = self.client.post(
            "/api/auth/password-reset/",
            {"email": "nonexistent@example.com"},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch("authentication.tasks.send_otp_sms.delay")
    def test_request_reset_phone_success(self, mock_send_sms):
        response = self.client.post(
            "/api/auth/password-reset/",
            {"phone": "01711112222"},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "OTP sent successfully. Check your phone for the code.")
        mock_send_sms.assert_called_once()

        # Check that OTP is stored in cache
        phone_normalized = "8801711112222"
        stored_otp = utils.otp_get(phone_normalized)
        self.assertIsNotNone(stored_otp)
        self.assertEqual(len(stored_otp), 6)

    def test_request_reset_phone_not_found(self):
        response = self.client.post(
            "/api/auth/password-reset/",
            {"phone": "01799999999"},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch("authentication.tasks.send_otp_sms.delay")
    def test_verify_reset_otp_success_and_reset(self, mock_send_sms):
        # 1. Request OTP to populate it
        self.client.post(
            "/api/auth/password-reset/",
            {"phone": "01711112222"},
            format="json"
        )
        phone_normalized = "8801711112222"
        stored_otp = utils.otp_get(phone_normalized)

        # 2. Verify OTP
        response = self.client.post(
            "/api/auth/password-reset/verify-otp/",
            {"phone": "01711112222", "otp": stored_otp},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)
        reset_token = response.data["token"]

        # 3. Confirm Password Reset
        reset_response = self.client.post(
            "/api/auth/password-reset/confirm/",
            {
                "token": reset_token,
                "new_password": "NewStrongPass123!"
            },
            format="json"
        )
        self.assertEqual(reset_response.status_code, status.HTTP_200_OK)
        self.assertEqual(reset_response.data["message"], "Password reset successful. You can now log in.")

        # 4. Try logging in with the new password
        login_response = self.client.post(
            "/api/auth/login/",
            {
                "phone": "01711112222",
                "password": "NewStrongPass123!"
            },
            format="json"
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_response.data)

    @patch("authentication.tasks.send_otp_sms.delay")
    def test_verify_reset_otp_invalid(self, mock_send_sms):
        self.client.post(
            "/api/auth/password-reset/",
            {"phone": "01711112222"},
            format="json"
        )

        response = self.client.post(
            "/api/auth/password-reset/verify-otp/",
            {"phone": "01711112222", "otp": "999999"},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["code"], "invalid_otp")
