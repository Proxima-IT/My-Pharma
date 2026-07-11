"""
JWT authentication with Redis blacklist check for access tokens.
Invalid or expired tokens are treated as unauthenticated (return None) so that
endpoints like login that use AllowAny still work when the client sends an old token.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .utils import token_blacklist_exists


class JWTAuthWithBlacklist(JWTAuthentication):
    """Validates JWT then checks Redis blacklist by jti. Returns None for invalid/expired tokens."""

    def authenticate(self, request):
        try:
            result = super().authenticate(request)
        except (InvalidToken, TokenError):
            # Expired or invalid token: treat as unauthenticated so AllowAny views (e.g. login) still work
            return None
        if result is None:
            return None
        user, validated_token = result
        jti = validated_token.get("jti")
        if jti and token_blacklist_exists(jti):
            raise InvalidToken("Token has been revoked.")
        return user, validated_token


class JWTQueryParamAuthentication(JWTAuthentication):
    """Validates JWT passed via token query parameter. Returns None if missing/invalid."""

    def authenticate(self, request):
        token = request.query_params.get("token")
        if not token:
            return None
        try:
            validated_token = self.get_validated_token(token)
            user = self.get_user(validated_token)
            jti = validated_token.get("jti")
            if jti and token_blacklist_exists(jti):
                return None
            return user, validated_token
        except Exception:
            return None
