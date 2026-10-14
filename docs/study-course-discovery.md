# Slice C — Study and course discovery

## Acceptance criteria defined before implementation

- Reuse Django Course records and source/human-review rules; no schema, content seeding, publication or deployment changes.
- Study links to a responsive course finder, detail pages, a browser-local shortlist and up to three comparison selections. Education-system and student-support information remain linked, not duplicated or fabricated.
- Search title, summary/body, provider and subject. Filter city, level, subject, institution, duration and intake using values from published records in the selected language; paginate results and preserve URL/language context.
- Show actual source and review metadata; unknown fees/intakes/requirements explicitly stay unspecified. No visa eligibility or provider endorsement claims.
- Store only versioned slug/language selections in a separate key. Corrupt/future data is preserved and writes blocked; write failures remain visible with retry. Never alter checklist or saved-guide keys.
- Resolve saved selections from the public API each time; drafts/withdrawals/missing translations never surface as cached course content. Offline course detail is explicitly unavailable, while existing offline guides remain unchanged.
- Verify publication/filter boundaries, storage limits/failures, keyboard interaction, reload persistence, safe links, languages, stale responses and responsive layouts. Required checks and screenshots recorded at handoff; no unperformed Safari/content checks marked passed.

## Delivered

Study and Education topic pages link to `/#/explore/study/courses`. The catalogue links to `/shortlist`, `/compare` and `/:courseSlug` below that route. Six exact-value filters and provider/subject/text search retain URL context. The existing language selector retains the current route and filters; unavailable Nepali records are not replaced silently with English.

Create course records under **Django admin → Editorial → Courses** using existing fields and review workflow. Course sources and human review remain required; PR #22's General Article exception does not apply to courses. No production records are created by this slice. If none are published, visitors see an honest empty state.

Shortlists store only slug, language and comparison flag in `sajilo-nz:courses:v1`, limited to 50 selections and three comparisons. They are browser/origin-local, not synced between tabs, devices or staging/local origins. Each saved record is resolved online again; course bodies are not cached offline. Unavailable selections can be removed. Existing checklist and guide storage is untouched.

No new dependency, migration or deployment configuration is needed. Database query review retained existing publication indexes and `select_related` source loading, with paginated results; no speculative schema/index change was made. Facets use published records in the chosen language, not only the current filtered subset. Duration/intake values are editorial text, not inferred dates or ranges.

## Verification — 14 October 2026

- `npm run check`: passed.
- `npm test`: passed, 6 prototype and 99 frontend tests.
- `npm run build`: passed, including the final browser-suite production build.
- Django `test guides editorial`: passed, 49 tests against isolated SQLite.
- `makemigrations --check --dry-run`: passed, no changes.
- Full Playwright suite: 77 passed, 3 intentionally skipped redundant mobile viewport loops. Covers published filters/details, private-record exclusion, shortlist reload, comparison limits, English/Nepali availability, storage corruption, offline recovery and existing journey/saved-guide regressions. Unit tests also cover failed writes/retry and stale responses. Initial selector/service-worker timing failures were corrected before the passing rerun.
- Catalogue screenshots captured at 390, 768, 1280, 1440 and 1920px; no horizontal page overflow. Desktop/mobile captures inspected. All displayed programmes and dates are isolated synthetic test fixtures, not real listings or editorial approval.
- `git diff --check`: passed.

Screenshots: [desktop](screenshots/courses/catalogue-1440.png), [mobile](screenshots/courses/catalogue-390.png). Other target widths are in the same folder.

## Remaining review gates

Real iPhone Safari/device acceptance, live editorial course review and reviewed interface translations have not been performed. The surrounding course interface is English with the existing explicit fallback; published Nepali course content is supported. PostgreSQL CI must pass before merge (local SQLite tests are not PostgreSQL evidence). Unified article/course discovery remains Slice F. No content publication, remote database operation, merge or deployment was performed.
