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

class SecureSpectacularSwaggerView(SpectacularSwaggerView):
    def _get_schema_url(self, request):
        url = super()._get_schema_url(request)
        key = request.GET.get("key")
        token = request.GET.get("token")
        
        from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode
        u = urlparse(url)
        q = dict(parse_qsl(u.query))
        if key:
            q["key"] = key
        if token:
            q["token"] = token
            
        parts = list(u)
        parts[4] = urlencode(q)
        return urlunparse(parts)

urlpatterns = [
    path("", SpectacularAPIView.as_view(
        permission_classes=[HasSwaggerAccessKey],
        authentication_classes=[SessionAuthentication, JWTAuthWithBlacklist, JWTQueryParamAuthentication]
    ), name="schema"),
    path("swagger/", SecureSpectacularSwaggerView.as_view(
        url_name="schema",
        permission_classes=[HasSwaggerAccessKey],
        authentication_classes=[SessionAuthentication, JWTAuthWithBlacklist, JWTQueryParamAuthentication]
    ), name="swagger-ui"),
]

