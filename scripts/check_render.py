"""Test same-origin production routing with disposable settings and built assets."""
import os
from pathlib import Path
import secrets
import sys

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / 'backend'))
os.environ.update({
    'DJANGO_SETTINGS_MODULE': 'config.render',
    'RENDER_EXTERNAL_HOSTNAME': 'sajilo-test.onrender.com',
    'DJANGO_SECRET_KEY': secrets.token_urlsafe(64), 'DJANGO_DEBUG': 'false',
    'DJANGO_USE_SQLITE': 'false', 'DJANGO_TRUST_PROXY_HTTPS': 'true',
    'POSTGRES_DB': 'test', 'POSTGRES_USER': 'test', 'POSTGRES_PASSWORD': 'test-only',
    'POSTGRES_HOST': 'db.example.com', 'POSTGRES_SSLMODE': 'verify-full',
})
for key in ('DJANGO_ALLOWED_HOSTS', 'DJANGO_CSRF_TRUSTED_ORIGINS'):
    os.environ.pop(key, None)
import django
from django.core.management import call_command
from django.test import Client

django.setup()
call_command('collectstatic', interactive=False, verbosity=0)
client = Client(HTTP_HOST='sajilo-test.onrender.com', HTTP_X_FORWARDED_PROTO='https')
for path in ('/', '/sw.js', '/static/admin/css/base.css'):
    response = client.get(path)
    assert response.status_code == 200, (path, response.status_code)
    assert 'max-age=0' in response['Cache-Control'], (path, response.get('Cache-Control'))
    assert response['Strict-Transport-Security'] == 'max-age=3600'
for asset in (root / 'frontend/dist/assets').iterdir():
    assert client.get('/assets/' + asset.name).status_code == 200
assert client.get('/api/health/')['Cache-Control'] == 'no-store'
assert client.get('/api/health/').json() == {'status': 'ok'}
assert client.get('/api/not-a-route/').status_code == 404
assert client.get('/admin/').status_code == 302
assert client.get('/backend/config/settings.py').status_code == 404
assert client.get('/.env').status_code == 404
assert client.get('/', HTTP_HOST='untrusted.example.com').status_code == 400
assert client.get('/', HTTP_X_FORWARDED_PROTO='http').status_code == 301
print('Render checks passed: frontend, worker, admin assets, health, host validation, redirects and private-file exclusion.')
