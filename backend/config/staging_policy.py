"""Validate explicit staging inputs before Django starts."""
import re
from urllib.parse import urlsplit


def staging_options(env):
    def required(name):
        value = env.get(name, '').strip()
        if not value:
            raise ValueError(f'{name} is required for staging.')
        return value

    if env.get('DJANGO_DEBUG', 'false').lower() != 'false':
        raise ValueError('Staging must disable DJANGO_DEBUG.')
    if env.get('DJANGO_USE_SQLITE', 'false').lower() != 'false':
        raise ValueError('Staging requires PostgreSQL, not SQLite.')
    secret = required('DJANGO_SECRET_KEY')
    if len(secret) < 50 or len(set(secret)) < 5 or secret.startswith('django-insecure-'):
        raise ValueError('Staging requires a strong, independently generated secret key.')
    hosts = [host.strip() for host in required('DJANGO_ALLOWED_HOSTS').split(',')]
    hostname = re.compile(r'(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$')
    if any(not hostname.fullmatch(host) for host in hosts):
        raise ValueError('Staging requires explicit DNS hostnames without schemes, ports or wildcards.')
    origins = [origin.strip() for origin in required('DJANGO_CSRF_TRUSTED_ORIGINS').split(',')]
    for origin in origins:
        url = urlsplit(origin)
        if url.scheme != 'https' or url.netloc not in hosts or url.path or url.query or url.fragment:
            raise ValueError('Each CSRF origin must be https:// followed by an allowed hostname.')
    for name in ('POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_HOST'):
        required(name)
    sslmode = required('POSTGRES_SSLMODE')
    if sslmode not in ('require', 'verify-ca', 'verify-full'):
        raise ValueError('Staging PostgreSQL must use TLS.')
    trust_proxy = env.get('DJANGO_TRUST_PROXY_HTTPS', 'false').lower()
    if trust_proxy not in ('true', 'false'):
        raise ValueError('DJANGO_TRUST_PROXY_HTTPS must be true or false.')
    return {'hosts': hosts, 'origins': origins, 'sslmode': sslmode, 'trust_proxy': trust_proxy == 'true'}
