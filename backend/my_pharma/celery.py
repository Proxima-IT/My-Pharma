"""
Celery application for My Pharma.
Uses Redis as broker and result backend.
"""
import os
import sys

# Ensure backend directory (containing my_pharma) is on the path
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_pharma.settings")

from celery import Celery

app = Celery("my_pharma")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
