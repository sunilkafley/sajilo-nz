# Sprint 2 — reviewed guides to checklist

## Outcome and acceptance criteria
- Guest users can browse published pre-departure guides, read official sources and follow links to existing checklist tasks.
- English and Nepali are independent guide records. Unreviewed or missing translations are not silently replaced with English.
- Content editors use authenticated Django admin. Publishing requires approved HTTPS sources, a human reviewer, an actual verification date and a later next-review date.
- Editing published content requires saving a draft first. Content edits clear the prior review; publishing requires a separate review/save.
- Sample content cannot publish. Drafts return neither list entries nor public details; unknown guides return 404.
- Overdue guides show a review-due warning, retaining their original dates and official links.
- API failures, loading, empty results and missing translations have visible states. Checklist progress still works without the API.
- All existing checklist IDs and browser storage remain unchanged.

## Design decisions
Guide rows have a unique `(slug, language)` pair. Sources and task references are small JSON lists validated at the model boundary. Review policy lives in the model; Django admin uses the same validation. Public read-only DRF endpoints expose no reviewer identity or editing routes. Use model `save()` or Django admin for writes; bulk updates and direct database writes bypass policy and are unsupported editorial paths. Source hostname allowlists and task IDs are maintained in backend and frontend; update both with regression tests when extending them.

The guide screen loads the current language's small list, then selects the requested guide. The detail API is also available. Introduce pagination and detail-specific fetching when expanding the catalogue. The language selector translates guide content only; full interface localisation remains future work.

Starter command creates three drafts: English/Nepali travel documents and English packing/biosecurity. No human content review has been claimed. Public pages remain empty until a trusted editor reviews and publishes. Approved hostnames are a technical constraint, not evidence that a source page or guide was fact-checked.

## Validation
- Backend publication, source validation, translation visibility, edit/review invalidation, read-only API, seed idempotency and admin access tests.
- Frontend guide-to-task focus and completion, unavailable translation, failed request/retry and unsafe API data tests.
- Playwright desktop/mobile journeys use a real Django API with an isolated temporary SQLite database and explicitly synthetic test content. They exercise task completion/reload and API failure/retry.
- CI runs backend tests against PostgreSQL 17 and keeps the existing required `quality` job name. Browser tests use isolated SQLite; PostgreSQL is covered at the API integration layer.

## Scope limits
No production deployment, public accounts, cross-device sync, offline guide cache, search, content revision history, full UI translation or personalised immigration advice. Windows setup and real iPhone Safari require user validation. Next sprint: search/bookmarks/offline behaviour after reviewing this slice with users.

## Python alignment and manual review — 2026-10-01

- Runtime target: standard CPython 3.14.8, pinned in `.python-version` and consumed by CI. No dependency changes were needed for the initial alignment; CI validates the existing pins, PostgreSQL integration and browser journeys.
- User verified dependency installation, Django system checks and all 14 backend tests on Windows with Python 3.14.8 and SQLite.
- User confirmed the unreviewed-publication guardrail and successful reviewed publication → React guide → checklist completion → refresh persistence. This records functional testing, not a blanket editorial review of all starter content.
- Real iPhone Safari validation remains outstanding.
