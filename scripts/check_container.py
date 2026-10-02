"""Smoke-test the built Linux image without touching a database."""
import json
import base64
import secrets
import subprocess
import time
from urllib.request import Request, urlopen

values = {
    'DJANGO_SETTINGS_MODULE': 'config.render',
    'RENDER_EXTERNAL_HOSTNAME': 'container-test.onrender.com',
    'DJANGO_SECRET_SEED': base64.b64encode(secrets.token_bytes(32)).decode(),
    'DJANGO_TRUST_PROXY_HTTPS': 'true',
    'POSTGRES_HOST': 'db.example.com', 'POSTGRES_DB': 'test',
    'POSTGRES_USER': 'test', 'POSTGRES_PASSWORD': 'test-only', 'POSTGRES_SSLMODE': 'verify-full',
}
command = ['docker', 'run', '--rm', '-d', '--name', 'sajilo-container-check',
           '-p', '127.0.0.1:18080:10000', '--entrypoint', 'gunicorn']
for key, value in values.items():
    command.extend(['-e', f'{key}={value}'])
command.extend(['sajilo-staging-check', '--chdir', '/app/backend',
                'config.wsgi:application', '--bind', '0.0.0.0:10000', '--workers', '1'])
subprocess.run(command, check=True, capture_output=True)
try:
    def get(path):
        request = Request('http://127.0.0.1:18080' + path,
                          headers={'Host': 'container-test.onrender.com', 'X-Forwarded-Proto': 'https'})
        with urlopen(request, timeout=3) as response:
            return response.status, response.headers, response.read()
    for attempt in range(30):
        try:
            status, headers, body = get('/api/health/')
            break
        except OSError:
            if attempt == 29:
                raise
            time.sleep(1)
    assert status == 200 and json.loads(body) == {'status': 'ok'}
    for path in ('/', '/sw.js', '/static/admin/css/base.css'):
        status, headers, body = get(path)
        assert status == 200 and len(body) > 0, path
        assert headers['Strict-Transport-Security'] == 'max-age=3600'
    print('Built Python 3.14.8 container serves app, worker, admin assets and health endpoint.')
except Exception:
    subprocess.run(['docker', 'logs', 'sajilo-container-check'])
    raise
finally:
    subprocess.run(['docker', 'stop', 'sajilo-container-check'], check=True, capture_output=True)
