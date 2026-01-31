# My Pharma - Main Project Package
# This package contains the Django project configuration

# Import Celery app for Django signals
from .celery import app as celery_app

__all__ = ('celery_app',)
