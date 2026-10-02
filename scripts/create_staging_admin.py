"""Interactive laptop-only editor setup. Passwords are never echoed or stored."""
import getpass
import os
from pathlib import Path
import secrets
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'backend'))
print('Create a Django editor in your remote STAGING database after deployment migrations finish.')
host = input('Neon direct database hostname (no scheme): ').strip()
database = input('Neon database name: ').strip()
user = input('Neon database role: ').strip()
if not host.endswith('.neon.tech') or not database or not user:
    raise SystemExit('Provide the Neon hostname, database and role from your staging project.')
if input(f'Target {database} on {host}. Type CREATE to continue: ') != 'CREATE':
    raise SystemExit('Cancelled.')
password = getpass.getpass('Neon database password (hidden): ')
# Fresh process-local settings; no file writes and no local database mutation.
os.environ.update({
    'DJANGO_SETTINGS_MODULE': 'config.staging',
    'DJANGO_SECRET_KEY': secrets.token_urlsafe(64), 'DJANGO_DEBUG': 'false',
    'DJANGO_USE_SQLITE': 'false', 'DJANGO_ALLOWED_HOSTS': 'staging.example.com',
    'DJANGO_CSRF_TRUSTED_ORIGINS': 'https://staging.example.com',
    'POSTGRES_HOST': host, 'POSTGRES_DB': database, 'POSTGRES_USER': user,
    'POSTGRES_PASSWORD': password, 'POSTGRES_PORT': '5432',
    'POSTGRES_SSLMODE': 'verify-full', 'POSTGRES_SSLROOTCERT': 'system',
})
from django.core.management import execute_from_command_line
execute_from_command_line(['manage.py', 'createsuperuser'])
