"""
WSGI config for My Pharma project.
Production-ready configuration for deployment.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'my_pharma.settings')

application = get_wsgi_application()

# Apply security middleware for production
from django.conf import settings
if not settings.DEBUG:
    from django.middleware.security import SecurityMiddleware
    application = SecurityMiddleware(application)
