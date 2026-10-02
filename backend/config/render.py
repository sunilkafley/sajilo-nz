"""Same-origin React/Django service behind Render's HTTPS edge."""
import os
import base64
from django.core.exceptions import ImproperlyConfigured

# Render generates 32 random bytes encoded as 44 base64 characters.
# Re-encode as 64 hex characters for Django's length check; entropy is unchanged.
if not os.environ.get('DJANGO_SECRET_KEY'):
    try:
        seed = base64.b64decode(os.environ.get('DJANGO_SECRET_SEED', ''), validate=True)
    except ValueError as error:
        raise ImproperlyConfigured('Invalid Render secret seed.') from error
    if len(seed) != 32:
        raise ImproperlyConfigured('Render must supply a 256-bit DJANGO_SECRET_SEED.')
    os.environ['DJANGO_SECRET_KEY'] = seed.hex()


hostname = os.environ.get('RENDER_EXTERNAL_HOSTNAME', '')
if hostname:
    os.environ.setdefault('DJANGO_ALLOWED_HOSTS', hostname)
    os.environ.setdefault('DJANGO_CSRF_TRUSTED_ORIGINS', f'https://{hostname}')

from .staging import *  # noqa: F403,E402

MIDDLEWARE = [MIDDLEWARE[0], 'config.middleware.HostValidationMiddleware',
              'whitenoise.middleware.WhiteNoiseMiddleware', *MIDDLEWARE[1:]]
WHITENOISE_ROOT = BASE_DIR.parent / 'frontend' / 'dist'
WHITENOISE_INDEX_FILE = True
WHITENOISE_MAX_AGE = 0
WHITENOISE_AUTOREFRESH = False
WHITENOISE_USE_FINDERS = False
WHITENOISE_ALLOW_ALL_ORIGINS = False
ROOT_URLCONF = 'config.render_urls'
