"""
Custom exceptions and DRF exception handler for consistent API error responses.
"""
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler


class AccountLockedError(APIException):
    status_code = status.HTTP_423_LOCKED
    default_detail = "Account temporarily locked due to too many failed attempts."
    default_code = "account_locked"


class InvalidOTPError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Invalid or expired OTP."
    default_code = "invalid_otp"


class OTPRateLimitError(APIException):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    default_detail = "Too many OTP requests. Try again later."
    default_code = "otp_rate_limit"


class GuestConversionError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Guest conversion failed."
    default_code = "guest_conversion_failed"


class InvalidRegistrationTokenError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Invalid or expired registration token. Please complete phone and OTP steps again."
    default_code = "invalid_registration_token"


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None and isinstance(response.data, dict) and "code" not in response.data:
        response.data["code"] = getattr(exc, "default_code", "error")
    return response
