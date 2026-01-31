"""
Celery Configuration for My Pharma
Async task processing for OTP, emails, and background jobs.
"""

import os
from celery import Celery

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'my_pharma.settings')

# Create Celery app
app = Celery('my_pharma')

# Load config from Django settings with CELERY_ prefix
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all installed apps
app.autodiscover_tasks()

# Configure task routing and execution
app.conf.task_routes = {
    'authentication.tasks.send_otp_task': {'queue': 'otp'},
    'authentication.tasks.send_email_task': {'queue': 'email'},
    'authentication.tasks.cleanup_expired_tokens': {'queue': 'maintenance'},
}

# Task execution settings
app.conf.task_acks_late = True
app.conf.task_reject_on_worker_lost = True
app.conf.task_time_limit = 300  # 5 minutes
app.conf.task_soft_time_limit = 240  # 4 seconds

# Beat schedule for periodic tasks
app.conf.beat_schedule = {
    'cleanup-expired-tokens': {
        'task': 'authentication.tasks.cleanup_expired_tokens',
        'schedule': 3600.0,  # Every hour
    },
    'cleanup-otp-attempts': {
        'task': 'authentication.tasks.cleanup_otp_attempts',
        'schedule': 1800.0,  # Every 30 minutes
    },
}


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task for testing Celery setup."""
    print(f'Request: {self.request!r}')
