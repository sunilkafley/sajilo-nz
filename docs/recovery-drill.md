# Sprint 4 recovery drill

Status: backup/isolated restore and same-commit rollback passed on 5 October 2026 (NZDT). Evidence and limitations are recorded below. Owner: Sunil. Keep credentials, dumps and admin records off GitHub and out of chat. This drill keeps the existing `neondb` staging database intact. No paid resources are required.

## 1. Prerequisites

Use PostgreSQL client tools (`pg_dump`, `pg_restore`, `psql`) matching the Neon server's major version, or newer. Python's psycopg package does not install these commands. Check the Neon version in its SQL Editor with `SHOW server_version;`. On Windows, if PostgreSQL tools are installed but absent from PATH, add their actual `bin` directory to the current PowerShell PATH.

```powershell
pg_dump --version
pg_restore --version
psql --version
```

In the existing Neon staging project's database management screen, create a NEW EMPTY database named `sajilo_restore_check` on the same branch, owned by the same role. Do not use a branch clone as proof of restoring a dump. Do not change Render's database settings. If that database already exists, stop and use a new empty target; do not empty or overwrite it.

## 2. Back up privately

Pause guide edits during the drill so source and restored content can be compared. In PowerShell with the Python virtual environment active:

```powershell
python -m pip install --upgrade certifi
$env:PGSSLROOTCERT = (python -m certifi).Trim()
$env:PGSSLMODE = 'verify-full'
$env:PGHOST = Read-Host 'Neon direct hostname (pooling off)'
$env:PGPORT = '5432'
$env:PGUSER = Read-Host 'Neon database role'
$env:PGDATABASE = 'neondb'
$backupDir = Join-Path $env:LOCALAPPDATA 'SajiloNZ\backups'
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$backupFile = Join-Path $backupDir ("staging-{0}.dump" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
pg_dump -W --format=custom --no-owner --no-acl --file="$backupFile"
if ($LASTEXITCODE -ne 0) { throw 'Backup failed. Stop here.' }
pg_restore --list "$backupFile" | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Archive cannot be read. Stop here.' }
Get-FileHash -Algorithm SHA256 "$backupFile"
```

Confirm the source database really is named `neondb` in Neon; change only that assignment if necessary. `-W` prompts privately for the database password. Keep the dump under your Windows account; it contains admin password hashes and potentially unpublished content. Retain at least the latest verified pre-release backup until the next release's restore has passed; keep an additional private copy on encrypted storage you control. No upload to a code repository.

## 3. Restore into the empty test database

First use the Neon SQL Editor with `sajilo_restore_check` selected to confirm there are no application tables. Then run:

```powershell
pg_restore -W --dbname=sajilo_restore_check --no-owner --no-acl --exit-on-error --single-transaction "$backupFile"
if ($LASTEXITCODE -ne 0) { throw 'Restore failed. Do not record a pass.' }
```

Do not add `--clean` or `--create`. The explicit target overrides PGDATABASE; the existing staging database is never the restore target.

Compare source and restored records without printing their contents:

```powershell
$verifySql = @'
SELECT 'guides', count(*), md5(COALESCE(string_agg(row_to_json(t)::text, '' ORDER BY id), '')) FROM guides_guide t
UNION ALL
SELECT 'users', count(*), md5(COALESCE(string_agg(row_to_json(t)::text, '' ORDER BY id), '')) FROM auth_user t
UNION ALL
SELECT 'migrations', count(*), md5(COALESCE(string_agg(row_to_json(t)::text, '' ORDER BY id), '')) FROM django_migrations t;
'@
psql -W --dbname=neondb -X -v ON_ERROR_STOP=1 -c "$verifySql"
if ($LASTEXITCODE -ne 0) { throw 'Source verification failed.' }
psql -W --dbname=sajilo_restore_check -X -v ON_ERROR_STOP=1 -c "$verifySql"
if ($LASTEXITCODE -ne 0) { throw 'Restore verification failed.' }
```

Counts and digests must match for all three rows. This compares full guide records (including sources and review dates), users and migration history. MD5 here is only a comparison checksum, not password protection. Also inspect the restored guide in Neon's SQL Editor privately: title, published status, source URL and original review dates should match. Reopen the live app and admin to confirm staging is unaffected. Do not connect the live service to the test database. After recording success, remove only the disposable test database through Neon, carefully confirming its name.

## 4. Confirm and rehearse Render rollback

Record the successful deployment ID and commit from Render's service Deploys/Events page. Use the actual dashboard value; GitHub's merge SHA alone does not prove which commit is running.

For this first release, never roll back to the pre-PR4 application: it lacks the deployment setup. If there is only one successful deploy, first redeploy that same known-good commit using Manual Deploy → Deploy a specific commit. This makes a second successful deploy with identical code/schema so the first can be a safe rollback target. Keep Neon credentials and environment settings unchanged throughout the drill.

From Deploys, choose the earlier successful deployment's Rollback action and confirm Rollback to this deploy. Wait for Live. Render reuses the prior build and associated deploy settings; verify that the selected deploy references the intended database and current valid credentials. Code rollback does not restore Neon data or undo migrations. For future schema-changing releases, review schema compatibility before any rollback; do not reverse migrations blindly.

Check the homepage, `/api/health/`, `/api/guides/?lang=en`, admin login, the published guide, and iPhone saved guide/progress. Keep automatic deploys off. Free services retain only the two most recent previous deploys for rollback, so record your known-good target before a release. Record source/target deploy IDs, commit, time and observed results. A same-commit drill verifies the platform rollback operation, not compatibility of future schema changes.

## Completion record — 5 October 2026 (NZDT)

| Evidence | Result |
| --- | --- |
| Backup time, archive size and SHA256 (no archive contents) | Backup succeeded on 5 October, user-reported; screenshot showed readable archive listing. Exact time, size and SHA256 were not captured. |
| Source/target database names, restore exit status | `neondb` → separate `sajilo_restore_check`; user confirmed successful restore. Numeric exit status not separately captured. |
| Guide/user/migration counts and digests match | Screenshots of both databases: 1 guide, 1 user, 19 migrations; all three full-record fingerprints match. |
| Published source/review metadata preserved | Included in matching full guide-record fingerprint; separate manual field inspection not reported. |
| Live staging unaffected | User confirmed app/published guide and admin work after rollback. |
| Render original/redeploy/rollback deploy IDs and commit | Both original and manual redeploy screenshots show `f0bf8b3` (full SHA `f0bf8b35111060903433c06e9232c86259f625c4`). Rollback screenshot identifies target `dep-davhinnavr4c73c2047g`, Live at 14:33:05 NZDT, duration 31 seconds. Redeploy/new rollback IDs were not shown. |
| Post-rollback app/API/admin/iPhone checks | User: "All those four checks pass": health endpoint, app/published guide, admin login, and iPhone checklist completion after refresh. Screenshot also shows repeated health HTTP 200 responses. Separate guides API and saved-guide recheck not reported at this step. |

This validates the isolated restore and platform rollback for the tested staging increment. It does not prove rollback compatibility with future schema changes or compare every database table. No credentials, dump contents or user-record fingerprints are stored here. Private backup retention, archive metadata and test-database cleanup remain follow-up housekeeping, not claimed completed.

References: https://www.postgresql.org/docs/17/app-pgdump.html ; https://www.postgresql.org/docs/17/app-pgrestore.html ; https://render.com/docs/rollbacks ; https://render.com/docs/free
