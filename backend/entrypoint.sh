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
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear 2>/dev/null || true
exec "$@"
