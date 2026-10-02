# Free staging: Render + Neon

This is a deployable configuration, not a record of a completed deployment. User confirmed both accounts created. Use one Render Free web service and one Neon Free PostgreSQL project; no Render database, worker, paid disk or purchased domain. Choose Singapore for both. Stay within free quotas. Render may sleep after 15 idle minutes, delaying first access; Neon compute can also suspend. Do not use artificial keepalive traffic to avoid platform limits.

## Before deploying
Merge the reviewed Sprint 4 PR with passing CI into main. `render.yaml` must be present on main. The Docker build bundles React assets and a Python 3.14.8 Django server. You do not need Docker on your Windows laptop. Automatic deployment is off; later releases must be deliberately deployed after CI passes.

## Neon values (keep private)
Open the `sajilo-nz-staging` project and its Connect dialog. Select the intended staging branch/database/role. Turn connection pooling OFF for the direct connection used by this small, single-worker service and its startup migrations. Keep the original connection details private.

| Render variable | Neon value |
| --- | --- |
| POSTGRES_HOST | Direct hostname only, such as ep-example.ap-southeast-1.aws.neon.tech; no postgresql://, credentials, port or path |
| POSTGRES_DB | Database name shown in Connect (often neondb) |
| POSTGRES_USER | Database role shown in Connect |
| POSTGRES_PASSWORD | Actual role password; if extracted from a URL, URL-decode it; prefer copying the separate password field |

These settings are separate fields, not a DATABASE_URL. The template sets port 5432 and verifies the database's TLS certificate against system CAs. No database credentials belong in React, GitHub files, chat or screenshots.

## Render setup
1. In Render, choose New → Blueprint and connect GitHub with access to `sunilkafley/sajilo-nz`.
2. Select that repository, main branch and `render.yaml` path if prompted.
3. Inspect the proposed resources: exactly one `sajilo-nz-staging` web service, Docker runtime, Singapore, **Free** instance. Stop if a paid resource appears. Resource names must not collide with an existing service you want to preserve.
4. Enter the four Neon values above in the requested secret fields. Render generates DJANGO_SECRET_SEED; the app re-encodes those 32 random bytes as a 64-character Django secret without changing their entropy. The service derives its allowed hostname/CSRF origin from RENDER_EXTERNAL_HOSTNAME.
5. Create/deploy the blueprint. Docker builds React, installs pinned backend packages and collects admin static files. On startup, migrations run before Gunicorn starts. A database connection or migration error prevents startup; inspect logs without sharing credentials.
6. Open the generated HTTPS onrender.com address. Check `/api/health/`, `/api/guides/?lang=en` and `/admin/login/`. Empty guides are expected for a new database. The liveness endpoint does not claim ongoing database health.

Render terminates HTTPS and the deployment trusts its forwarded protocol header. Keep this configuration behind that edge. Root HTML, `/sw.js` and admin assets revalidate; API/admin responses are no-store. React hash routes work on the same origin. Unknown API paths stay 404, never the SPA shell. Staging responses discourage search indexing, which is not access control.

## Create your editor from Windows
Render Free has no interactive shell. After startup migrations succeed, open PowerShell in your updated local repository with your usual virtual environment activated and backend requirements installed:

```powershell
python scripts/create_staging_admin.py
```

The script asks for the target Neon direct host, database and role; prints the target for confirmation; then requests the database password without echo. It creates an admin in that remote staging database only. Django then prompts for the editor username/email/password. Use that editor login at the staging `/admin/`. This script doesn't copy your local SQLite data, create guides or publish anything. It uses a temporary process-local Django secret, which is sufficient for password creation and is not the website's signing key.

## Content and device acceptance
Your local guides do not automatically appear in Neon. Initially use the admin to enter a small pilot set and perform the existing human source/translation review before publication. Never mark sample drafts verified solely to make a page appear populated.

Complete the real iPhone HTTPS/offline checklist in `docs/sprint-4.md`. Test API retry after a cold start as well as online/offline transitions. Do not claim successful hosting, Neon TLS, migrations, admin creation or iPhone acceptance until observed.

## Maintenance and free limits
Keep accounts on Free. Review any existing payment-method and overage settings before deployment; do not authorize paid upgrades to bypass quota errors. Download database backups privately before schema-changing releases and demonstrate restoration to a separate test database. For rollback, restore an earlier compatible code release through Render; do not reverse database migrations blindly. Never delete the Neon project as a service restart step.

References: https://render.com/docs/free ; https://render.com/docs/blueprint-spec ; https://render.com/docs/docker ; https://neon.com/docs/connect/connect-from-any-app
