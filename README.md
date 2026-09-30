# Sajilo NZ

A student companion for the journey from Nepal to New Zealand. This first React development slice includes navigation, a 27-item pre-departure checklist, official source links and browser-local progress. The original prototype is preserved in `prototype/`.

## Run locally
Use Node.js 22.12+ and npm. From the repository root:

```sh
npm ci
npm run dev
```

Open the localhost URL printed by Vite. No backend or account is required.

## Checks

```sh
npm run check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm test` runs the six prototype regression tests and the React/domain/storage tests. Playwright covers keyboard completion, reload persistence, navigation, responsive overflow and failed storage writes on desktop and a Chromium mobile viewport. Mobile emulation is not a substitute for testing Safari on a real iPhone.

## Architecture
- `frontend/src/features/checklist/`: stable task IDs, domain rules, storage repository and use cases.
- `frontend/src/App.tsx`: accessible navigation and React screens; storage mutations go through use cases.
- `frontend/e2e/`: browser tests.
- `prototype/`: unchanged design reference. Run `python -m http.server 8000 --directory prototype` to view it.
- `docs/`: audit, backlog and sprint evidence.

Progress uses a versioned localStorage record. Unknown task IDs are ignored; unsupported or corrupt records are preserved and writes blocked for that session. Write failures keep progress in memory and show a retry action. Legacy checklist progress is imported only when it exists on the **same origin**. Data on the old hosted Site cannot automatically transfer to localhost or a new domain. The original legacy record is never deleted.

## Scope and review
This is an English-only frontend development slice, not a production release. Nepali localisation, offline support, device sync, reviewed content, Django REST Framework and PostgreSQL are planned. Source links do not mean the checklist has been editorially verified; the UI explicitly says it has not yet been reviewed.

Use feature branches and small pull requests. Quality checks run on push and PR; branch protection is a separate GitHub setting. No deployment or existing Site changes are included.
