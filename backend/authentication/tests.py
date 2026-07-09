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

        # 2. Verify OTP
        response = self.client.post(
            "/api/auth/password-reset/verify-otp/",
            {"phone": "01711112222", "otp": "999999"},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["code"], "invalid_otp")


class UserSoftDeleteTests(APITestCase):
    def test_soft_delete_anonymization_and_re_registration(self):
        # 1. Create a user
        email = "todelete@example.com"
        phone = "01755554444"
        username = "todelete"
        user = User.objects.create_user(
            email=email,
            phone=phone,
            username=username,
            password="StrongPass123!",
            role=UserRole.REGISTERED_USER,
            status=UserStatus.ACTIVE,
        )

        # Verify initial state
        self.assertEqual(user.email, email)
        self.assertEqual(user.phone, phone)
        self.assertEqual(user.username, username)
        self.assertTrue(user.is_active)

        # 2. Soft-delete the user
        user.soft_delete()
        user.refresh_from_db()

        # Verify anonymization occurred
        self.assertNotEqual(user.email, email)
        self.assertIn("_del_", user.email)
        self.assertEqual(user.phone, "")
        self.assertNotEqual(user.username, username)
        self.assertIn("_del_", user.username)
        self.assertFalse(user.is_active)

        # 3. Request password reset with the old email and old phone -> should return 404
        reset_email_res = self.client.post(
            "/api/auth/password-reset/",
            {"email": email},
            format="json"
        )
        self.assertEqual(reset_email_res.status_code, status.HTTP_404_NOT_FOUND)

        reset_phone_res = self.client.post(
            "/api/auth/password-reset/",
            {"phone": phone},
            format="json"
        )
        self.assertEqual(reset_phone_res.status_code, status.HTTP_404_NOT_FOUND)

        # 4. Try to re-register with the exact same email -> should succeed (no 500 IntegrityError)
        register_res = self.client.post(
            "/api/auth/register/email/",
            {
                "email": email,
                "password": "NewStrongPass123!"
            },
            format="json"
        )
        self.assertEqual(register_res.status_code, status.HTTP_200_OK)
        self.assertIn("access", register_res.data)

        # Verify new user is created and is distinct from the old soft-deleted user
        new_user = User.objects.get(email=email)
        self.assertNotEqual(new_user.pk, user.pk)
        self.assertEqual(new_user.email, email)
        self.assertTrue(new_user.is_active)


class PasswordStrengthTests(APITestCase):
    def test_simple_six_character_password_success(self):
        response = self.client.post(
            "/api/auth/register/email/",
            {
                "email": "simplepass@example.com",
                "password": "123456"
            },
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_five_character_password_fails(self):
        response = self.client.post(
            "/api/auth/register/email/",
            {
                "email": "shortpass@example.com",
                "password": "12345"
            },
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)


class GoogleAuthFallbackTests(APITestCase):
    @patch("authentication.services._get_firebase_public_keys")
    def test_manual_verification_fallback_success(self, mock_get_keys):
        from cryptography import x509
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.x509.oid import NameOID
        import datetime
        import jwt
        from django.test import override_settings
        from authentication.services import verify_google_firebase_id_token

        # 1. Generate private key & self-signed certificate for mock Firebase
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )

        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COMMON_NAME, "mock-project"),
        ])
        cert = x509.CertificateBuilder().subject_name(
            subject
        ).issuer_name(
            issuer
        ).public_key(
            private_key.public_key()
        ).serial_number(
            x509.random_serial_number()
        ).not_valid_before(
            datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)
        ).not_valid_after(
            datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=10)
        ).sign(private_key, hashes.SHA256())

        cert_pem = cert.public_bytes(serialization.Encoding.PEM).decode("utf-8")

        # 2. Mock public keys endpoint response
        mock_get_keys.return_value = {"mock-kid": cert_pem}

        # 3. Create mock Firebase ID Token
        now = datetime.datetime.now(datetime.timezone.utc)
        payload = {
            "aud": "mock-project",
            "iss": "https://securetoken.google.com/mock-project",
            "email": "test-fallback@example.com",
            "email_verified": True,
            "firebase": {"sign_in_provider": "google.com"},
            "sub": "mock-uid",
            "exp": now + datetime.timedelta(hours=1),
            "iat": now - datetime.timedelta(minutes=1),
        }
        id_token = jwt.encode(
            payload,
            private_key,
            algorithm="RS256",
            headers={"kid": "mock-kid"},
        )

        # 4. Execute verify function with overridden settings
        with override_settings(
            FIREBASE_INITIALIZED=False,
            FIREBASE_AUTH_PROJECT_ID="mock-project",
            FIREBASE_AUTH_REQUIRE_EMAIL_VERIFIED=True
        ):
            claims = verify_google_firebase_id_token(id_token)

        self.assertEqual(claims["email"], "test-fallback@example.com")
        self.assertEqual(claims["uid"], "mock-uid")
        self.assertEqual(claims["provider"], "google.com")
        self.assertTrue(claims["email_verified"])


