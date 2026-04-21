#!/bin/sh
set -e
echo "Waiting for database..."
python -c "
import os, sys, time
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'my_pharma.settings')
django.setup()
from django.db import connection
for i in range(30):
    try:
        connection.ensure_connection()
        break
    except Exception:
        time.sleep(1)
else:
    sys.exit(1)
"
echo "Running migrations..."
python manage.py migrate --noinput
echo "Ensuring local dev admin user..."
python - <<'PY'
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_pharma.settings")
django.setup()

from authentication.constants import UserRole, UserStatus
from authentication.models import User

enabled = os.environ.get("DEV_AUTO_CREATE_ADMIN", "false").lower() in ("true", "1", "yes")
if not enabled:
    raise SystemExit(0)

email = (os.environ.get("DEV_ADMIN_EMAIL", "") or "").strip().lower()
password = (os.environ.get("DEV_ADMIN_PASSWORD", "") or "").strip()
username = (os.environ.get("DEV_ADMIN_USERNAME", "") or "admin").strip()

if not email or not password:
    print("DEV_AUTO_CREATE_ADMIN enabled but DEV_ADMIN_EMAIL/DEV_ADMIN_PASSWORD missing; skipping.")
    raise SystemExit(0)

user = User.objects.filter(email__iexact=email).first()
if not user:
    user = User.objects.create_superuser(email=email, password=password, username=username)
    print(f"Created local admin user: {email}")
else:
    user.set_password(password)
    user.username = username or user.username
    user.role = UserRole.SUPER_ADMIN
    user.status = UserStatus.ACTIVE
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.email_verified = True
    user.save()
    print(f"Updated local admin user password/flags: {email}")
PY
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear 2>/dev/null || true
exec "$@"
