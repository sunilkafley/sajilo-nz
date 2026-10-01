# Sajilo NZ

A student companion for the journey from Nepal to New Zealand. This development version includes a React checklist with browser-local progress and a Django API for reviewed English/Nepali guides. The original prototype is preserved in `prototype/`.

## Run locally
Use Node.js 22.12+ and npm. From the repository root:

```sh
npm ci
npm run dev
```

Open the localhost URL printed by Vite. The checklist works without a backend or reader account. For guides, complete the Django setup below.

## Checks

```sh
npm run check
npm test
npm run build
```

Browser tests also require the Python environment; see the Sprint 2 setup below.

`npm test` runs the six prototype regression tests and the React/domain/storage tests. Playwright covers keyboard completion, reload persistence, navigation, responsive overflow and failed storage writes on desktop and a Chromium mobile viewport. Mobile emulation is not a substitute for testing Safari on a real iPhone.

## Architecture
- `frontend/src/features/checklist/`: stable task IDs, domain rules, storage repository and use cases.
- `frontend/src/App.tsx`: accessible navigation and React screens; storage mutations go through use cases.
- `frontend/e2e/`: browser tests.
- `prototype/`: unchanged design reference. Run `python -m http.server 8000 --directory prototype` to view it.
- `docs/`: audit, backlog and sprint evidence.

Progress uses a versioned localStorage record. Unknown task IDs are ignored; unsupported or corrupt records are preserved and writes blocked for that session. Write failures keep progress in memory and show a retry action. Legacy checklist progress is imported only when it exists on the **same origin**. Data on the old hosted Site cannot automatically transfer to localhost or a new domain. The original legacy record is never deleted.

## Scope and review
This is a development version, not a production release. Django REST Framework and PostgreSQL configuration are included. Guides support English and Nepali; the interface remains English. Full interface localisation, offline support and device sync are planned. Starter guides await human review. Source links do not mean the checklist has been editorially verified; the UI explicitly says it has not yet been reviewed.

Use feature branches and small pull requests. Quality checks run on push and PR; branch protection is a separate GitHub setting. No deployment or existing Site changes are included.

## Sprint 2: guides and Django API

Use two terminals: Django on port 8000 and Vite on port 5173 (or the URL Vite prints).
The Vite development server proxies `/api` to Django. Production API routing/hosting is not configured yet.

### Windows PowerShell — backend setup

From the repository root, with Python 3.12 installed:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
$env:DJANGO_SECRET_KEY = & .\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_urlsafe(50))"
$env:DJANGO_DEBUG = "true"
```

Choose a database. For a quick local preview without installing PostgreSQL:

```powershell
$env:DJANGO_USE_SQLITE = "true"
```

For PostgreSQL, create a local database and role using your PostgreSQL tools, then set:

```powershell
$env:DJANGO_USE_SQLITE = "false"
$env:POSTGRES_DB = "sajilo_nz"
$env:POSTGRES_USER = "sajilo"
$env:POSTGRES_PASSWORD = Read-Host "Local PostgreSQL password"
$env:POSTGRES_HOST = "127.0.0.1"
$env:POSTGRES_PORT = "5432"
```

Then initialise and run the API:

```powershell
.\.venv\Scripts\python.exe backend/manage.py migrate
.\.venv\Scripts\python.exe backend/manage.py createsuperuser
.\.venv\Scripts\python.exe backend/manage.py seed_drafts
.\.venv\Scripts\python.exe backend/manage.py runserver
```

These environment variables last for that terminal session. `backend/.env.example` documents configuration; it is not loaded automatically. Never commit credentials.

### Frontend — second terminal

```powershell
npm ci
npm run dev
```

Open the Local URL and select **Pre-departure guides**. Initially, no guides are published.
Open <http://127.0.0.1:8000/admin/> and sign in with your superuser:

1. Open a draft guide. Check the wording and current official sources; check Nepali separately.
2. Save content changes as **Draft**. This clears existing review metadata.
3. Reopen the guide, record the actual reviewer, verification date and next review date, then select **Published** and save.
4. Open the guide in React, follow **Passport**, tick it and reload to confirm progress.

Do not publish drafts merely to populate the interface. `is_sample` content must remain a draft. Technical source validation does not replace human fact-checking.

### Checks

```powershell
npm run check
npm test
npm run build
.\.venv\Scripts\python.exe backend/manage.py test guides
.\.venv\Scripts\python.exe backend/manage.py makemigrations --check --dry-run
```

Browser tests launch their own API and frontend; stop your development servers first. Ensure the virtualenv Python is on PATH without needing PowerShell script activation:

```powershell
$env:PATH = "$PWD\.venv\Scripts;$env:PATH"
npx playwright install chromium
npm run test:e2e
```

Browser tests create synthetic published content in a temporary database, never in your local editorial database. PostgreSQL integration tests run in GitHub CI under the existing required **quality** check. See [Sprint 2 acceptance criteria](docs/sprint-2.md).
