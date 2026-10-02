"""Exercise staging settings with disposable values; does not connect to a database."""
import os
from pathlib import Path
import secrets
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'backend'))
os.environ.update({
    'DJANGO_SETTINGS_MODULE': 'config.staging',
    'DJANGO_SECRET_KEY': secrets.token_urlsafe(64),
    'DJANGO_DEBUG': 'false', 'DJANGO_USE_SQLITE': 'false',
    'DJANGO_ALLOWED_HOSTS': 'staging.example.com',
    'DJANGO_CSRF_TRUSTED_ORIGINS': 'https://staging.example.com',
    'DJANGO_TRUST_PROXY_HTTPS': 'true',
    'POSTGRES_DB': 'staging_check', 'POSTGRES_USER': 'staging_check',
    'POSTGRES_PASSWORD': secrets.token_urlsafe(32),
    'POSTGRES_HOST': 'db.example.com', 'POSTGRES_SSLMODE': 'verify-full',
})
import django
from django.core.checks import run_checks
from django.test import Client

django.setup()
# The staging host deliberately avoids HSTS preload and sibling-subdomain policy.
issues = [issue for issue in run_checks(include_deployment_checks=True)
          if issue.id not in {'security.W005', 'security.W021'}]
if issues:
    for issue in issues:
        print(issue)
    raise SystemExit(1)
client = Client()
response = client.get('/api/guides/', HTTP_HOST='staging.example.com')
assert response.status_code == 301
assert response['Location'] == 'https://staging.example.com/api/guides/'
response = client.get('/missing-staging-check', HTTP_HOST='staging.example.com', HTTP_X_FORWARDED_PROTO='https')
assert response.status_code == 404
assert response['Strict-Transport-Security'] == 'max-age=3600'
response = client.get('/api/guides/', HTTP_HOST='untrusted.example.com')
assert response.status_code == 400
print('Staging checks passed: deployment policy, HTTPS redirect, trusted proxy and host rejection.')
