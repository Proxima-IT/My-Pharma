"""
JWT authentication with Redis blacklist check for access tokens.
On logout, access token jti is blacklisted so it is rejected until expiry.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

from .utils import token_blacklist_exists


class JWTAuthWithBlacklist(JWTAuthentication):
    """Validates JWT then checks Redis blacklist by jti."""

    def authenticate(self, request):
        result = super().authenticate(request)
        if result is None:
            return None
        user, validated_token = result
        jti = validated_token.get("jti")
        if jti and token_blacklist_exists(jti):
            raise InvalidToken("Token has been revoked.")
        return user, validated_token
