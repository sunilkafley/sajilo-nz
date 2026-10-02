"""Same-origin React/Django service behind Render's HTTPS edge."""
import os

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
