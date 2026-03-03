"""
My Pharma – Django settings (production-oriented).
API-only, MySQL, Redis, Celery, JWT.
"""

import hashlib
import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")
  
# ------------------------------------------------------------------------------
# SECURITY
# ------------------------------------------------------------------------------

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "change-me-in-production")

JWT_SIGNING_KEY = hashlib.sha256(
    SECRET_KEY.encode()
).hexdigest()
   
DEBUG = True

# -----------------------------
# Allowed Hosts
# -----------------------------
# Build from env so Docker media proxy (Host: backend:8000) is accepted; always include internal hosts.
_allowed = [
    h.strip()
    for h in os.environ.get("ALLOWED_HOSTS", "bluepillc.com,www.bluepillc.com,46.202.194.251").split(",")
    if h.strip()
]
_internal = ["backend", "backend:8000", "localhost", "127.0.0.1"]
for host in _internal:
    if host not in _allowed:
        _allowed.append(host)
ALLOWED_HOSTS = _allowed

# -----------------------------
# CORS + CSRF
# -----------------------------
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "https://bluepillc.com",
    "https://www.bluepillc.com",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_PRIVATE_NETWORK = True

CSRF_TRUSTED_ORIGINS = [
    "https://bluepillc.com",
    "https://www.bluepillc.com",
]

CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True

# ------------------------------------------------------------------------------
# APPLICATIONS
# ------------------------------------------------------------------------------

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "django_filters",
    "drf_spectacular",

    "authentication",
    "core",
]

# ------------------------------------------------------------------------------
# MIDDLEWARE (CORS FIRST!)
# ------------------------------------------------------------------------------

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "my_pharma.urls"

# ------------------------------------------------------------------------------
# TEMPLATES (required for Django admin)
# ------------------------------------------------------------------------------

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "my_pharma.wsgi.application"

# ------------------------------------------------------------------------------
# DATABASE
# ------------------------------------------------------------------------------

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.environ.get("MYSQL_DATABASE", "my_pharma"),
        "USER": os.environ.get("MYSQL_USER", "root"),
        "PASSWORD": (
            os.environ.get("MYSQL_PASSWORD", "")
            .strip()
            .strip("'\"")
        ),
        "HOST": os.environ.get("MYSQL_HOST", "127.0.0.1"),
        "PORT": os.environ.get("MYSQL_PORT", "3306"),
        "OPTIONS": {
            "charset": "utf8mb4",
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}

AUTH_USER_MODEL = "authentication.User"

# ------------------------------------------------------------------------------
# INTERNATIONALIZATION
# ------------------------------------------------------------------------------

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Dhaka"
USE_I18N = True
USE_TZ = True

# ------------------------------------------------------------------------------
# STATIC & MEDIA
# ------------------------------------------------------------------------------

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# When True, Django serves MEDIA files at /media/ (for dev or when not using a separate media server)
SERVE_MEDIA = os.environ.get("SERVE_MEDIA", "true" if DEBUG else "false").lower() in ("true", "1", "yes")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ------------------------------------------------------------------------------
# DJANGO REST FRAMEWORK
# ------------------------------------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "authentication.jwt_auth.JWTAuthWithBlacklist",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_PAGINATION_CLASS":
        "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
    ),
    "DEFAULT_SCHEMA_CLASS":
        "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER":
        "authentication.exceptions.custom_exception_handler",
}

# ------------------------------------------------------------------------------
# JWT
# ------------------------------------------------------------------------------

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=24),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "SIGNING_KEY": JWT_SIGNING_KEY,
}

# ------------------------------------------------------------------------------
# REDIS CACHE
# ------------------------------------------------------------------------------

USE_REDIS = os.environ.get("USE_REDIS", "false" if DEBUG else "true").lower() in (
    "true", "1", "yes"
)

REDIS_URL = os.environ.get(
    "REDIS_URL",
    "redis://127.0.0.1:6379/0"
)

if USE_REDIS:
    CACHES = {
        "default": {
            "BACKEND":
                "django_redis.cache.RedisCache",
            "LOCATION": REDIS_URL,
            "OPTIONS": {
                "CLIENT_CLASS":
                    "django_redis.client.DefaultClient",
                "SOCKET_CONNECT_TIMEOUT": 2,
            },
            "KEY_PREFIX": "my_pharma",
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "KEY_PREFIX": "my_pharma",
        }
    }

# ------------------------------------------------------------------------------
# CELERY
# ------------------------------------------------------------------------------

CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = TIME_ZONE
# When not using Redis, run tasks in-process and disable result backend so Celery never connects to Redis
if not USE_REDIS:
    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_RESULT_BACKEND = None
else:
    CELERY_TASK_ALWAYS_EAGER = DEBUG
    if DEBUG:
        CELERY_RESULT_BACKEND = None

# ------------------------------------------------------------------------------
# API DOCS
# ------------------------------------------------------------------------------

SPECTACULAR_SETTINGS = {
    "TITLE": "My Pharma API",
    "DESCRIPTION": "Authentication & Core APIs",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

# ------------------------------------------------------------------------------
# LOGGING
# ------------------------------------------------------------------------------

LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format":
                "{asctime} {levelname} {name} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "file": {
            "level": "INFO",
            "class": "logging.FileHandler",
            "filename": str(LOG_DIR / "my_pharma.log"),
            "formatter": "verbose",
        },
    },
    "loggers": {
        "authentication": {
            # Send authentication (including OTP) logs only to the file handler.
            # This keeps OTP values out of the Docker terminal and centralizes them in logs/my_pharma.log.
            "handlers": ["file"],
            "level": "INFO",
            "propagate": False,
        },
    },
}