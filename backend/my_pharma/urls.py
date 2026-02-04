"""My Pharma URL configuration."""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("authentication.urls")),
    path("api/schema/", include("authentication.schema_urls")),
]
