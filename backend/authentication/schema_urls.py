"""OpenAPI schema URLs for My Pharma API."""
from django.urls import path
from rest_framework.permissions import IsAdminUser
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("", SpectacularAPIView.as_view(permission_classes=[IsAdminUser]), name="schema"),
    path("swagger/", SpectacularSwaggerView.as_view(url_name="schema", permission_classes=[IsAdminUser]), name="swagger-ui"),
]

