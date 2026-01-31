"""
ASGI config for My Pharma project.
Async support for WebSocket and real-time features.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'my_pharma.settings')

application = get_asgi_application()
