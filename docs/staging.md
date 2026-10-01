# Staging deployment runbook

Status: configuration prepared; no provider selected and no deployment performed. Do not use this document as proof of a completed deployment.

## Intended topology
Use a separate staging hostname and database. Serve the React production build and `/api/` through the same HTTPS origin; route `/admin/` to Django for authenticated editors and `/static/` to collected Django assets. Keep the application/database on private network paths where possible. This avoids introducing cross-origin API credentials or changing the current frontend API URLs. Preserve the existing hosted prototype.

Hosting choice is still open. Confirm account, provider, region, recurring cost ceiling and stable staging hostname before provisioning. The chosen provider must support a production WSGI/ASGI process, Python 3.14.8, PostgreSQL, static hosting/reverse proxy, TLS, environment secrets, logs and backups. Vite preview and Django runserver are local testing tools, not the staging process. Pin and test the production server dependency once the platform is selected.

## Required environment
Set `DJANGO_SETTINGS_MODULE=config.staging` in the application process and all release commands. Django does not automatically load .env files.

| Variable | Value/requirement |
| --- | --- |
| DJANGO_SECRET_KEY | Independently generated staging secret; at least 50 characters; secret manager only |
| DJANGO_DEBUG | false |
| DJANGO_USE_SQLITE | false (or unset) |
| DJANGO_ALLOWED_HOSTS | Exact comma-separated DNS hostnames, without ports, schemes or wildcards |
| DJANGO_CSRF_TRUSTED_ORIGINS | Matching HTTPS origins, without trailing slash |
| POSTGRES_DB / POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_HOST | Staging-only database credentials and endpoint |
| POSTGRES_PORT | Usually 5432; use provider's actual port |
| POSTGRES_SSLMODE | Prefer verify-full; require is supported when appropriate to provider's TLS configuration |
| POSTGRES_SSLROOTCERT | Provider CA certificate path when required for certificate verification |
| DJANGO_TRUST_PROXY_HTTPS | true only after confirming the trusted edge strips/replaces X-Forwarded-Proto and the app cannot be reached directly; otherwise false |

Never copy a development key or database into staging. The opt-in settings reject unsafe inputs; the regular local settings remain unchanged. Proxy settings are a trust boundary, not a workaround for unexplained redirect loops.

Staging sends a one-hour HSTS policy for its own hostname only. Subdomain coverage and browser preload are intentionally disabled (Django security.W005/W021); do not change those without reviewing the domain's other services. All other deployment check findings must be resolved.

## Release sequence once infrastructure is selected
1. Check out a reviewed commit with passing CI. Install the pinned backend and frontend dependencies under the tested runtimes.
2. Run `npm run build`. Publish only `frontend/dist`, not repository files or environment configuration.
3. Load staging secrets and run `python backend/manage.py check --deploy --settings=config.staging`. Resolve all unexpected warnings/errors.
4. Take and verify a database backup before migrations; run `python backend/manage.py migrate --settings=config.staging` once per release.
5. Run `python backend/manage.py collectstatic --noinput --settings=config.staging`; serve its output at `/static/`.
6. Start the selected production server with `config.wsgi:application` from the backend directory, using the staging settings module.
7. Configure the HTTPS edge routes above, reject unexpected hosts, disable CDN caching of `/api/` and `/admin/`, and avoid caching authentication responses. Serve `/sw.js` and `/index.html` with revalidation; hashed `/assets/` may use immutable caching. Ensure API errors return API responses, not the SPA index.
8. Create the staging editor account through a private management console; never seed or publish reviewed guides automatically.
9. Smoke-test HTTPS redirection, frontend assets, admin login/CSRF, official sources, draft exclusion, guide reads, and saved-guide offline refresh. Run the Sprint 4 iPhone record.

## Backup, rollback and operations
Before pilot use, demonstrate restore into an isolated database. Record backup retention, restore owner and logs location. Keep the prior frontend build and backend release available. Roll back code only when compatible with applied migrations; never reverse migrations or overwrite the database without an explicit recovery plan. Verify guide publication visibility after recovery. Do not log guide-reader personal information or secrets.

## Current local checks
`python -m unittest discover -s backend -p "test_staging_policy.py"` validates required configuration without Django/database access. `python scripts/check_staging.py` uses disposable configuration to run Django deployment checks and exercise HTTPS redirect, proxy and host validation without connecting to a database. CI runs both alongside existing tests. These checks do not validate a real host, certificate, database TLS connection or provider proxy; those remain deployment acceptance checks.

References: https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/ and https://docs.djangoproject.com/en/5.2/ref/settings/#secure-proxy-ssl-header
