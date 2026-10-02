"""Opt-in settings for a dedicated HTTPS staging environment."""
import os
from django.core.exceptions import ImproperlyConfigured
from .staging_policy import staging_options

try:
    options = staging_options(os.environ)
except ValueError as error:
    raise ImproperlyConfigured(str(error)) from error

from .settings import *  # noqa: F403,E402

DEBUG = False
ALLOWED_HOSTS = options['hosts']
CSRF_TRUSTED_ORIGINS = options['origins']
DATABASES['default']['OPTIONS'] = {'sslmode': options['sslmode']}
if os.environ.get('POSTGRES_SSLROOTCERT'):
    DATABASES['default']['OPTIONS']['sslrootcert'] = os.environ['POSTGRES_SSLROOTCERT']
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 3600
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False
STATIC_URL = '/static/'
# Enable only when the hosting proxy strips/replaces this client-supplied header
# and the application server is inaccessible except through that proxy.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https') if options['trust_proxy'] else None
