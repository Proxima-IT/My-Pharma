# Celery app loaded when Django starts; avoid breaking Django if broker is unavailable
try:
    from .celery import app as celery_app
    __all__ = ("celery_app",)
except Exception:
    celery_app = None
    __all__ = ()
