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

def _load_env_files():
    """
    Load environment variables from backend/.env and project-root env files.
    APP_ENV_FILE (e.g. .env.dev/.env) takes priority when present.
    """
    root_dir = BASE_DIR.parent
    requested_env_file = os.environ.get("APP_ENV_FILE", "").strip()

    # Keep backward compatibility for backend/.env based local runs.
    load_dotenv(BASE_DIR / ".env", override=False)

    if requested_env_file:
        load_dotenv(root_dir / requested_env_file, override=True)
    else:
        # Local development default. Production typically injects env directly.
        load_dotenv(root_dir / ".env.dev", override=False)
        load_dotenv(root_dir / ".env", override=False)


def _parse_csv_env(name, default_values):
    raw_value = os.environ.get(name, "")
    if raw_value.strip():
        return [item.strip() for item in raw_value.split(",") if item.strip()]
    return list(default_values)


_load_env_files()
  
# ------------------------------------------------------------------------------
# SECURITY
# ------------------------------------------------------------------------------

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "change-me-in-production")

JWT_SIGNING_KEY = hashlib.sha256(
    SECRET_KEY.encode()
).hexdigest()
   
DEBUG = os.environ.get("DEBUG", "true").lower() in ("true", "1", "yes")

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
_default_cors_allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://46.202.194.251:3000",
    "https://app.mypharma.com",
    "http://bluepillc.com",
    "http://www.bluepillc.com",
    "https://bluepillc.com",
    "https://www.bluepillc.com",
    "http://46.202.194.251",
    "https://mypharma.com.bd",
    "https://www.mypharma.com.bd",
]
CORS_ALLOWED_ORIGINS = _parse_csv_env("CORS_ALLOWED_ORIGINS", _default_cors_allowed_origins)

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_PRIVATE_NETWORK = True
# Allow localhost/127.0.0.1 from any port/scheme in development tooling.
# This prevents fragile CORS failures when frontend runs on 3000/3001 or HTTPS localhost.
_default_cors_origin_regexes = [
    r"^https?://localhost(:\d+)?$",
    r"^https?://127\.0\.0\.1(:\d+)?$",
]
CORS_ALLOWED_ORIGIN_REGEXES = _parse_csv_env("CORS_ALLOWED_ORIGIN_REGEXES", _default_cors_origin_regexes)

_default_csrf_trusted_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://46.202.194.251:3000",
    "https://app.mypharma.com",
    "http://bluepillc.com",
    "http://www.bluepillc.com",
    "https://bluepillc.com",
    "https://www.bluepillc.com",
    "http://46.202.194.251",
    "https://mypharma.com.bd",
    "https://www.mypharma.com.bd",
]
CSRF_TRUSTED_ORIGINS = _parse_csv_env("CSRF_TRUSTED_ORIGINS", _default_csrf_trusted_origins)

CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False

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
    "whitenoise.middleware.WhiteNoiseMiddleware",
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

# Production-ready static files (admin CSS, etc.)
# Requires running `python manage.py collectstatic` in deploy/build.
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
WHITENOISE_MANIFEST_STRICT = False

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# When True, Django serves MEDIA files at /media/ (for dev or when not using a separate media server)
SERVE_MEDIA = os.environ.get("SERVE_MEDIA", "true" if DEBUG else "false").lower() in ("true", "1", "yes")

# Allow larger product/prescription image uploads (default 2.5 MB). 413 = Request Entity Too Large.
FILE_UPLOAD_MAX_MEMORY_SIZE = int(os.environ.get("FILE_UPLOAD_MAX_MEMORY_SIZE", 20 * 1024 * 1024))  # 20 MB
DATA_UPLOAD_MAX_MEMORY_SIZE = int(os.environ.get("DATA_UPLOAD_MAX_MEMORY_SIZE", 20 * 1024 * 1024))  # 20 MB

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
    # Fail open when Redis is temporarily unavailable so auth/login APIs keep
    # responding instead of bubbling cache connection errors to clients/proxies.
    DJANGO_REDIS_IGNORE_EXCEPTIONS = True
    CACHES = {
        "default": {
            "BACKEND":
                "django_redis.cache.RedisCache",
            "LOCATION": REDIS_URL,
            "OPTIONS": {
                "CLIENT_CLASS":
                    "django_redis.client.DefaultClient",
                "SOCKET_CONNECT_TIMEOUT": 2,
                "SOCKET_TIMEOUT": 2,
                "IGNORE_EXCEPTIONS": True,
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
    CELERY_TASK_ALWAYS_EAGER = os.environ.get("CELERY_TASK_ALWAYS_EAGER", "false").lower() in (
        "true",
        "1",
        "yes",
    )
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
# EMAIL (OTP + PASSWORD RESET)
# ------------------------------------------------------------------------------
EMAIL_BACKEND = os.environ.get(
    "EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend"
)
EMAIL_HOST = os.environ.get("EMAIL_HOST", "smtp.gmail.com").strip()
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "true").lower() in ("true", "1", "yes")
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "").strip()
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "").strip()
DEFAULT_FROM_EMAIL = os.environ.get(
    "DEFAULT_FROM_EMAIL",
    EMAIL_HOST_USER or "noreply@mypharma.com",
).strip()
AUTH_PASSWORD_RESET_FRONTEND_URL = os.environ.get(
    "AUTH_PASSWORD_RESET_FRONTEND_URL",
    os.environ.get("NEXT_PUBLIC_BACKEND_URL", "http://localhost:3000"),
).strip()
AUTH_PASSWORD_RESET_TOKEN_EXPIRY_MINUTES = int(
    os.environ.get("AUTH_PASSWORD_RESET_TOKEN_EXPIRY_MINUTES", "30")
)

# ------------------------------------------------------------------------------
# SSLCOMMERZ (Bangladesh payment gateway)
# ------------------------------------------------------------------------------
SSLCOMMERZ_STORE_ID = os.environ.get("SSLCOMMERZ_STORE_ID", "").strip()
SSLCOMMERZ_STORE_PASS = os.environ.get("SSLCOMMERZ_STORE_PASS", "").strip()
SSLCOMMERZ_IS_SANDBOX = os.environ.get("SSLCOMMERZ_IS_SANDBOX", "true").lower() in ("true", "1", "yes")

# Public backend URL where SSLCommerz can call success/fail/cancel/ipn.
# Example: https://api.mypharma.com
SSLCOMMERZ_CALLBACK_BASE_URL = os.environ.get("SSLCOMMERZ_CALLBACK_BASE_URL", "").strip().rstrip("/")

# Frontend redirect base after backend callback processing.
# Example: https://mypharma.com.bd
SSLCOMMERZ_FRONTEND_BASE_URL = os.environ.get("SSLCOMMERZ_FRONTEND_BASE_URL", "").strip().rstrip("/")

# ------------------------------------------------------------------------------
# FIREBASE CLOUD MESSAGING (FCM)
# ------------------------------------------------------------------------------
# Initialize Firebase Admin SDK for sending push notifications.
# Credential priority:
#   1) FIREBASE_SERVICE_ACCOUNT_FILE — path to service-account JSON file
#      (relative to project root or absolute; best for Docker volume mounts).
#   2) FIREBASE_SERVICE_ACCOUNT_JSON — raw JSON string in env var.
#   3) GOOGLE_APPLICATION_CREDENTIALS — standard Google ADC file path.
import json as _json

FIREBASE_SERVICE_ACCOUNT_JSON = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON", "").strip()
FIREBASE_SERVICE_ACCOUNT_FILE = os.environ.get("FIREBASE_SERVICE_ACCOUNT_FILE", "").strip()
FIREBASE_CREDENTIAL_SOURCE = "none"
FIREBASE_INIT_ERROR = ""

def _init_firebase():
    """Lazy-initialize Firebase Admin SDK (safe to call multiple times)."""
    global FIREBASE_CREDENTIAL_SOURCE, FIREBASE_INIT_ERROR
    try:
        import firebase_admin
        from firebase_admin import credentials
        if firebase_admin._apps:
            FIREBASE_CREDENTIAL_SOURCE = "existing_app"
            FIREBASE_INIT_ERROR = ""
            return True  # Already initialized

        # Priority 1: File path (relative to BASE_DIR.parent or absolute)
        if FIREBASE_SERVICE_ACCOUNT_FILE:
            file_path = Path(FIREBASE_SERVICE_ACCOUNT_FILE)
            if not file_path.is_absolute():
                # Try relative to project root first, then BASE_DIR (backend/)
                for base in (BASE_DIR.parent, BASE_DIR):
                    candidate = base / file_path
                    if candidate.exists():
                        file_path = candidate
                        break
            if file_path.exists():
                cred = credentials.Certificate(str(file_path))
                firebase_admin.initialize_app(cred)
                FIREBASE_CREDENTIAL_SOURCE = f"service_account_file:{file_path}"
                FIREBASE_INIT_ERROR = ""
                return True
            else:
                import logging
                logging.getLogger(__name__).warning(
                    "FIREBASE_SERVICE_ACCOUNT_FILE=%s not found, trying other methods.",
                    FIREBASE_SERVICE_ACCOUNT_FILE,
                )

        # Priority 2: Inline JSON string
        if FIREBASE_SERVICE_ACCOUNT_JSON:
            cred_dict = _json.loads(FIREBASE_SERVICE_ACCOUNT_JSON)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            FIREBASE_CREDENTIAL_SOURCE = "service_account_json"
            FIREBASE_INIT_ERROR = ""
            return True

        # Priority 3: Google Application Default Credentials
        if os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
            firebase_admin.initialize_app()
            FIREBASE_CREDENTIAL_SOURCE = "google_application_credentials"
            FIREBASE_INIT_ERROR = ""
            return True

        FIREBASE_CREDENTIAL_SOURCE = "none"
        FIREBASE_INIT_ERROR = (
            "Missing FIREBASE_SERVICE_ACCOUNT_FILE, FIREBASE_SERVICE_ACCOUNT_JSON, "
            "and GOOGLE_APPLICATION_CREDENTIALS."
        )
        return False
    except Exception as exc:
        import logging
        FIREBASE_CREDENTIAL_SOURCE = "error"
        FIREBASE_INIT_ERROR = str(exc)
        logging.getLogger(__name__).warning("Firebase init failed: %s", exc)
        return False

FIREBASE_INITIALIZED = _init_firebase()
FIREBASE_AUTH_PROJECT_ID = os.environ.get(
    "FIREBASE_AUTH_PROJECT_ID",
    os.environ.get("NEXT_PUBLIC_FIREBASE_PROJECT_ID", ""),
).strip()
FIREBASE_AUTH_REQUIRE_EMAIL_VERIFIED = os.environ.get(
    "FIREBASE_AUTH_REQUIRE_EMAIL_VERIFIED", "true"
).lower() in ("true", "1", "yes")

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
