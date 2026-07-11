from django.urls import path
from rest_framework.permissions import IsAdminUser
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.authentication import SessionAuthentication
from authentication.jwt_auth import JWTAuthWithBlacklist

urlpatterns = [
    path("", SpectacularAPIView.as_view(
        permission_classes=[IsAdminUser],
        authentication_classes=[SessionAuthentication, JWTAuthWithBlacklist]
    ), name="schema"),
    path("swagger/", SpectacularSwaggerView.as_view(
        url_name="schema",
        permission_classes=[IsAdminUser],
        authentication_classes=[SessionAuthentication, JWTAuthWithBlacklist]
    ), name="swagger-ui"),
]

