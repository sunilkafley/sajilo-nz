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
- `frontend/src/features/arrival/`: separate first-week planning catalogue and browser-local progress, reusing checklist rules.
- `frontend/src/features/home/`: prototype-style Home layout, derived progress/next steps and read-only saved-bookmark preview.
- `frontend/src/features/explore/`: Explore landing page, scoped styles and available/planned destination catalogue.
- `frontend/src/features/cities/`: curated Christchurch guide membership and city preparation layout, reusing the existing guide publication/saved flow.
- `frontend/src/App.tsx`: accessible navigation and React screens; storage mutations go through use cases.
- `frontend/e2e/`: browser tests.
- `prototype/`: unchanged design reference. Run `python -m http.server 8000 --directory prototype` to view it.
- `docs/`: audit, backlog and sprint evidence.

Progress uses a versioned localStorage record. Unknown task IDs are ignored; unsupported or corrupt records are preserved and writes blocked for that session. Write failures keep progress in memory and show a retry action. Legacy checklist progress is imported only when it exists on the **same origin**. Data on the old hosted Site cannot automatically transfer to localhost or a new domain. The original legacy record is never deleted.

## Scope and review
This is a development version, not a production release. Django REST Framework and PostgreSQL configuration are included. Guides support English and Nepali; the interface remains English. Saved-guide offline support is implemented; full interface localisation and device sync remain planned. Starter guides await human review. Source links do not mean the checklist has been editorially verified; the UI explicitly says it has not yet been reviewed.

Use feature branches and small pull requests. Quality checks run on push and PR; branch protection is a separate GitHub setting. No deployment or existing Site changes are included.

## Sprint 2: guides and Django API

Use two terminals: Django on port 8000 and Vite on port 5173 (or the URL Vite prints).
The Vite development server proxies `/api` to Django. Staging serves the frontend and API on the same HTTPS origin; see the Render + Neon instructions below.

### Windows PowerShell — backend setup

From the repository root, with Python 3.14.8 installed (the version recorded in `.python-version` and used by CI):

```powershell
py -3.14 -m venv .venv
.\.venv\Scripts\python.exe --version
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
$env:DJANGO_SECRET_KEY = & .\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_urlsafe(50))"
$env:DJANGO_DEBUG = "true"
```

Confirm the version command prints `Python 3.14.8`. If you already have a working 3.14.8 `.venv`, keep it and skip environment creation. If an existing environment uses another version, stop its servers and rename it before creating a fresh `.venv`; do not overwrite it in place.

Future Python patch upgrades should update `.python-version` and this setup guide together, then pass CI before adoption.

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

### Sprint 3: search, saved guides and offline use

Search the selected language's reviewed guides by title, summary or body. Use **Save guide** to keep a copy on this browser; **Saved guides** lists those bookmarks. English and Nepali copies are saved separately. Clearing browser data removes them, and they do not sync between devices.

To test offline locally, keep Django running and use a production frontend build (the development server does not register an offline worker):

```powershell
npm run build
npm run preview
```

Open `http://127.0.0.1:4173`, wait for **App ready for offline use**, then save a reviewed guide. In browser developer tools, set the Network panel to Offline and refresh the guide. Its body and original review dates should remain visible with a saved-copy warning. Follow a checklist task, complete it and refresh again. Restore the network when finished. Official websites still require a connection.

If the guide is returned to draft in Django, reconnect and reopen the guide or Saved guides: its cached body is removed after the successful publication check. When offline or when the API fails, the app cannot check withdrawals or changes; it explicitly labels the saved copy. A storage failure never confirms a successful save. Limits: 50 text guides and approximately 1 MB per browser. Browser storage can be cleared or evicted.

Offline access needs a browser supporting service workers on HTTPS or localhost. Opening a phone against a laptop's plain HTTP LAN address does not provide this capability. Sprint 4 records user-reported iPhone Safari offline success; detailed remaining device checks are carried into Sprint 5.

### Sprint 4 — staging and pilot readiness

Sprint 4 is closed; see its [acceptance and follow-up record](docs/sprint-4.md) and [recovery drill evidence](docs/recovery-drill.md). Provider-neutral HTTPS deployment requirements: [staging runbook](docs/staging.md).

On Windows, `npm run preview` now supplies host and port directly, without forwarding flags through nested npm commands. Use `npm run preview:lan` for same-Wi-Fi iPhone layout checks; offline acceptance still requires HTTPS.

Free hosting setup: [Render + Neon instructions](docs/render-neon.md). The blueprint deploys one Docker-based Free web service; enter Neon credentials privately in Render. Merge the reviewed configuration before using New → Blueprint.

### Sprint 5 — useful pre-departure journey

The [Sprint 5 plan](docs/sprint-5.md) covers expanded reviewed English/Nepali guidance, remaining device checks and 2–3 structured usability sessions. Slice 5A merged in PR #8 with travel-document drafts and a [human review packet](docs/content/travel-documents-review.md). Publication review and the remaining human checks are pending.

### Sprint 6 — Explore

Open **Explore** in the navigation to find the existing checklist, guide search, saved guides and official sources. **Christchurch** opens a city preparation page. Other prototype categories, introduction topics and cities remain **Planned**. The page works offline after the production app is ready; guide availability still depends on publication or a previously saved copy.

**Browse travel guides** opens Documents, Packing, Money or Before leaving Nepal. Topic membership uses the guide's reviewed checklist links; a guide may appear in several topics. Language and topic are retained through reading and saved-guide navigation. Choose **All topics** for unlinked guides or an empty topic. Filtering never publishes drafts or changes review dates; offline topic browsing uses previously saved copies only.

Christchurch uses `/cities/christchurch` and lists only its curated `christchurch-arrival-plan` guide when published in the selected language. It connects to the existing airport transport/accommodation checklist tasks and saved/offline reading. `seed_drafts` supplies unreviewed English/Nepali starters and preserves existing records. The [city review packet](docs/content/christchurch-review.md) must be completed before publication; an empty city page does not bypass review. No listings, fares, booking, location tracking or new accounts are included.

See the [Sprint 6 plan](docs/sprint-6.md) for topic browsing and the first city journey, and the [roadmap](docs/roadmap.md) for arrival essentials and later features. Explore development proceeds alongside Sprint 5's outstanding work. Merge, deployment and content publication remain separate review decisions.

### Sprint 6D — Home dashboard

**Home** is the default `/` page: the prototype welcome, dark journey card, next steps, tools and right-hand city/guidance/community cards are recreated using the working pre-departure journey. Progress reflects the real 27-task checklist. The first three incomplete steps open and focus their existing checklist controls; Home does not add new task IDs or write separate progress.

The saved preview counts language-specific bookmarks and available local copies separately, and shows the two most recently fetched bookmarks. It never displays cached guide bodies or claims current publication. Opening a bookmark goes through the normal guide checks/offline warnings; withdrawn bookmarks link to Saved guides for removal. Home reads existing storage only and handles unreadable data without overwriting it or showing false zero counts.

Christchurch is a featured city, not a detected or saved visitor location. Search is explicitly pre-departure guide search. Course finder, budget planner, Can I bring it?, skills roadmap and community/events remain clearly Planned. No prototype immigration news, example event, fabricated review date, profile/account or full-interface language toggle is added.

### Sprint 7A — first-week planning

Open **First-week checklist** from navigation, Home or Explore's **Arrive & settle** category. Six explicitly unreviewed planning prompts have their own browser-local progress, independent from the 27 pre-departure tasks. They do not establish eligibility or readiness. No legacy progress is imported into this journey; saved guides remain unchanged. Corrupt storage is preserved, and failed writes show session-only/retry warnings.

The planner works offline after production app readiness. It links to existing Christchurch preparation, pre-departure guides and saved guides; reviewed arrival guidance is a separate next slice, not yet available. Home stays on pre-departure progress until explicit journey selection is implemented. See the [Sprint 7 plan](docs/sprint-7.md) for acceptance, 7B–7D and outstanding human/release gates. No deployment or content publication is included.

Home's **Start exploring** cards sit below the hero in two mobile/three desktop columns, followed immediately by the existing next steps and a prominent **Budget and Emergency Help** section. Study, Work and Skills remain Planned; Life currently offers Christchurch preparation only. Residence offers official INZ/IAA links, not eligibility advice. Budget opens its existing checklist step, not a calculator; Emergency Help links to official Police information online, not an in-app emergency service or offline guidance. See the [Home follow-up record](docs/home-discovery.md).

### Sprint 7B — arrival guide journey

From the first-week checklist, open **Browse first-week guides** or **Saved first-week guides**. Only human-reviewed records in the selected language appear; `seed_drafts` adds unpublished English/Nepali Christchurch local-travel starters with a [review packet](docs/content/arrival-travel-review.md). Do not publish to populate the page.

Guide stages use separate task IDs, API opt-in (`stage=firstweek`) and saved-copy records. Existing API requests still return pre-departure only; their saved storage is unchanged. First-week guide links focus the first-week checklist, and reading/saving retains selected stage/language with the normal offline and withdrawal warnings. Saved lists switch between journeys explicitly; Home's preview currently covers pre-departure only. Limits are 50 guides/approximately 1 MB **per journey** on this browser. No sync or new account is added.

Run the normal `migrate` step to record the new choice-only migration before local seeding. See [Sprint 7 compatibility assessment](docs/sprint-7.md) before any release/rollback. Local migration tests are not deployed rollback evidence; content/translation reviews and remaining human checks are still pending.
