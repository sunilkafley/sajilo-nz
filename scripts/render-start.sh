#!/bin/sh
set -eu
cd /app/backend
python manage.py migrate --noinput
exec gunicorn config.wsgi:application --bind "0.0.0.0:${PORT:-10000}" --workers 1 --threads 2 --timeout 60 --access-logfile - --error-logfile -
