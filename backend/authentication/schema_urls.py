from django.urls import path
from rest_framework.permissions import BasePermission
from django.conf import settings
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.authentication import SessionAuthentication
from authentication.jwt_auth import JWTAuthWithBlacklist, JWTQueryParamAuthentication

class HasSwaggerAccessKey(BasePermission):
    """
    Grants access if the request contains the valid developer key
    or if the authenticated user is a staff/admin.
    """
    def has_permission(self, request, view):
        dev_key = request.query_params.get("key")
        if dev_key and hasattr(settings, "SWAGGER_ACCESS_KEY") and dev_key == settings.SWAGGER_ACCESS_KEY:
            return True
        
        user = request.user
        return bool(user and user.is_authenticated and user.is_staff)

urlpatterns = [
    path("", SpectacularAPIView.as_view(
        permission_classes=[HasSwaggerAccessKey],
        authentication_classes=[SessionAuthentication, JWTAuthWithBlacklist, JWTQueryParamAuthentication]
    ), name="schema"),
    path("swagger/", SpectacularSwaggerView.as_view(
        url_name="schema",
        permission_classes=[HasSwaggerAccessKey],
        authentication_classes=[SessionAuthentication, JWTAuthWithBlacklist, JWTQueryParamAuthentication]
    ), name="swagger-ui"),
]

