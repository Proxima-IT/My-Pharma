"""My Pharma URL configuration."""
import os
import re
from django.conf import settings
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("authentication.urls")),
    path("api/", include("core.urls")),
    path("api/schema/", include("authentication.schema_urls")),
]

# Serve media files (dev): explicit route so /media/<path> always works
_serve_media = settings.DEBUG or getattr(settings, "SERVE_MEDIA", False)
if _serve_media:
    media_root = os.fspath(settings.MEDIA_ROOT)
    media_prefix = (settings.MEDIA_URL or "/media/").strip("/")
    if media_prefix and not media_prefix.endswith("/"):
        media_prefix += "/"
    urlpatterns += [
        re_path(r"^/?%s(?P<path>.*)$" % re.escape(media_prefix), serve, {"document_root": media_root}),
    ]
