"""
Django settings for the Digital Library backend (config project).

Environment variables are read via python-decouple from a `.env` file
(see .env.example). This lets the same codebase run with SQLite for quick
local development and PostgreSQL on the school server, by just changing
.env — nothing in this file needs to change between environments.
"""
from datetime import timedelta
from pathlib import Path

from decouple import Csv, config

BASE_DIR = Path(__file__).resolve().parent.parent

# --------------------------------------------------------------------------
# Core / security
# --------------------------------------------------------------------------
SECRET_KEY = config("SECRET_KEY", default="django-insecure-CHANGE-ME-IN-PRODUCTION")
DEBUG = config("DEBUG", default=True, cast=bool)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv())

# --------------------------------------------------------------------------
# Applications
# --------------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
    "django_filters",
    # Local apps
    "accounts",
    "library",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # must sit above CommonMiddleware
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

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

WSGI_APPLICATION = "config.wsgi.application"

# --------------------------------------------------------------------------
# Database
# Defaults to SQLite for zero-setup local dev; set DB_ENGINE=postgresql in
# .env (school server) to switch to PostgreSQL per the spec's tech stack.
# --------------------------------------------------------------------------
if config("DB_ENGINE", default="sqlite") == "postgresql":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": config("DB_NAME", default="digital_library"),
            "USER": config("DB_USER", default="postgres"),
            "PASSWORD": config("DB_PASSWORD", default=""),
            "HOST": config("DB_HOST", default="localhost"),
            "PORT": config("DB_PORT", default="5432"),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# --------------------------------------------------------------------------
# Custom user model
# --------------------------------------------------------------------------
AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --------------------------------------------------------------------------
# Internationalization
# Local Language Support: English, Luganda, Kiswahili, Ateso, Runyankole.
# This controls Django's own UI strings; resource-level language is a field
# on the Resource model, not this setting.
# --------------------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = config("TIME_ZONE", default="Africa/Kampala")
USE_I18N = True
USE_TZ = True

# --------------------------------------------------------------------------
# Static & media files
# Media = uploaded resources (documents/videos/audio/images), stored on the
# Local File System (school server) per spec section 6. MEDIA_ROOT is where
# Resource.file / thumbnails physically live.
# --------------------------------------------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Cap upload size at the web server / Django level (200MB default; videos
# can be large). Adjust per school server storage capacity.
DATA_UPLOAD_MAX_MEMORY_SIZE = config(
    "MAX_UPLOAD_MB", default=200, cast=int
) * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = DATA_UPLOAD_MAX_MEMORY_SIZE

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --------------------------------------------------------------------------
# Django REST Framework
# --------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DATETIME_FORMAT": "iso-8601",
}

# --------------------------------------------------------------------------
# CORS — allow the React dev server (and configured production frontend)
# to call this API from a different origin.
# --------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:5173,http://127.0.0.1:5173",
    cast=Csv(),
)
CORS_ALLOW_CREDENTIALS = True

# --------------------------------------------------------------------------
# Email (used for password reset links)
# Defaults to the console backend for local development: reset emails print
# straight to this terminal instead of actually being sent — no SMTP setup
# needed while developing. Switch EMAIL_BACKEND in .env once you have real
# SMTP credentials (e.g. school Gmail account, SendGrid, etc.) for production.
# --------------------------------------------------------------------------
EMAIL_BACKEND = config(
    "EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend"
)
EMAIL_HOST = config("EMAIL_HOST", default="")
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
DEFAULT_FROM_EMAIL = config(
    "DEFAULT_FROM_EMAIL", default="Digital Library <no-reply@digitallibrary.local>"
)

# The frontend's base URL, used to build the password reset link that gets
# emailed to the user (e.g. http://localhost:5173/reset-password?...).
FRONTEND_URL = config("FRONTEND_URL", default="http://localhost:5173")

# --------------------------------------------------------------------------
# Celery (Background Tasks: Notifications, Backups, Synchronization)
# Uses Redis as the broker/cache per the spec's tech stack.
# --------------------------------------------------------------------------
CELERY_BROKER_URL = config("REDIS_URL", default="redis://localhost:6379/0")
CELERY_RESULT_BACKEND = config("REDIS_URL", default="redis://localhost:6379/0")
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_TIMEZONE = TIME_ZONE

# --------------------------------------------------------------------------
# Backups (File Management: Backup and Recovery)
# Local directory for automatic backups of the DB and media. A Celery beat
# task (library/tasks.py) writes here on a schedule.
# --------------------------------------------------------------------------
BACKUP_ROOT = BASE_DIR / "backups"

# --------------------------------------------------------------------------
# Storage Monitoring thresholds (used by library/services/storage.py to
# raise warnings before disk fills up on the school server).
# --------------------------------------------------------------------------
STORAGE_WARNING_THRESHOLD_PERCENT = config(
    "STORAGE_WARNING_THRESHOLD_PERCENT", default=85, cast=int
)
