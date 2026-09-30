# Initial audit — 30 September 2026

## Observed source
Source reference: existing Sajilo NZ Site, commit a47070b8d21e4d5d9bd4e8214b0355cd128de0bf. Three static files: index.html, style.css, app.js. Hash routing and string-rendered HTML. No package manifest, component framework, backend or automated tests in that source snapshot.

Existing functions include stage-based checklists, saved items, course comparison, profile preferences and a budget calculator. State persists under sajilo-prototype in localStorage. English/Nepali helper covers some interface text; much copy remains English. There is no service worker, installable offline flow, authentication or live data feed. Official source panels exist; verification dates and example records need editorial audit. Reading source is not a complete browser or content audit.

## First sprint: one tested journey
1. Create React + TypeScript + Vite frontend and port the existing shell/theme.
2. Port pre-departure checklist and its guide links.
3. Extract completion/progress rules and storage adapter; validate malformed or outdated persisted records.
4. Unit-test progress, duplicate/unknown task handling and state validation.
5. Integration-test component → use case → storage, including storage failure.
6. Browser-test complete task → reload → completed task; keyboard and mobile checks.
7. Keep legacy prototype available as reference until the replacement journey passes acceptance criteria.

Done means: the journey works on desktop and mobile, progress survives reload, storage failure is handled visibly, automated checks pass, and the user reviews the preview.

## Subsequent slices
- Django models/admin/API for stages, guides, translations, sources and review records; PostgreSQL migrations.
- Test draft exclusion from public APIs and admin-only publication permissions using a real test database.
- Search, bookmarks and language selection with integration coverage.
- Offline cache/update behaviour, visible verification dates and failure/recovery tests.
- Reviewed pilot content and friend usability feedback, then hosting/domain setup.

## Continuous workflow
One feature per small PR. Capture friend feedback as issues with reproduction steps and expected behaviour. Add a regression test when fixing a reproducible bug. Track Backlog → Ready → In progress → Review/testing → Done. CI initially runs syntax and baseline tests; extend it with TypeScript, lint, React tests, Django tests and production build as those layers are introduced. Branch protection must be configured separately in GitHub.

## Guardrails
No fabricated verified dates; no public draft content; no secrets in git; no unauthorised editor writes; no user data in logs; no silent loss of saved progress. These are requirements, not claims that the baseline enforces every rule. Each gains automated coverage in its owning slice. Content review and usability testing remain human checks.
