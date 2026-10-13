# Slice B — Explore topic pages

## Acceptance defined before implementation

- All 12 Explore topics open dedicated information pages; the homepage's six featured topics link into them. Existing `?category=` bookmarks remain supported.
- Articles come only from Slice A's public API, in the requested language and topic. Loading, empty, unavailable, malformed-response, offline and retry states are explicit. No sample content is seeded for visitors.
- Housing and Nepal services use expandable guidance; other topics use readable article cards and relevant supporting links. Aotearoa introductions have stable reading routes; city navigation retains Christchurch's existing guide and adds honest informational destinations for other cities.
- Source attribution, actual review dates and overdue status remain visible. Articles are plain text, never injected HTML. Missing Nepali content is not silently replaced with English.
- Language context survives topic/article/related links; selected route survives language switching. Stale requests cannot display the previous topic/language, and pagination is accessible.
- Checklists remain in Journey; no progress/storage migrations. Existing saved-guide offline access is preserved; new articles do not claim offline availability.
- Tests cover routing, publication boundaries, safe rendering, language, errors/races, keyboard access and responsive overflow. Capture 390/768/1280/1440/1920px evidence. Run required checks; distinguish Chromium emulation from Safari.

## Scope

Branch from merged Slice A (PR #20). No backend schema/publication change. Source-approved Article records drive information pages; course catalogue/comparison, calculators and community directory tools remain C–E. No fake controls or prototype listings. No merge, deployment or content publication authorized.

## Implementation and editorial handover

- `topicConfig.ts` defines topic presentation and contextual destinations; `articles.ts` validates public responses and keeps fetch rules outside components. `TopicPage.tsx` renders article cards, housing/Nepal accordions and narrow reading pages.
- All twelve topics use `/#/explore/<topic>`; articles use `/#/explore/<topic>/<slug>`. Old `?category=<topic>` bookmarks redirect without dropping language/query context. Homepage cards and active navigation use these routes.
- In Django admin, create an **Editorial → Article**, choose its topic and language, add summary/body/sections and an approved official source. Preview and complete the existing human-review/publication workflow. Drafts never appear publicly. Reuse the same slug across separately reviewed translations.
- Aotearoa links use topic `aotearoa` and these slugs: `about-new-zealand`, `culture-maori-culture`, `weather-climate`, `healthcare`, `laws-everyday-rules`, `student-life`.
- City introduction links use topic `cities` and slugs `auckland`, `wellington`, `hamilton`, `dunedin`. Christchurch retains `/cities/christchurch`; additional city articles are also discoverable in the city topic listing.
- No live content or source records were created. Without eligible articles, visitors see an explicit empty/unavailable state. Synthetic screenshots exercise an isolated disposable test database, not publication approval or real guidance.

## Verification — 13 October 2026

| Check | Result |
| --- | --- |
| `npm run check` | Passed |
| `npm test` | Passed: 6 prototype + 92 frontend tests |
| `npm run build` | Passed |
| Django `test guides editorial` | Passed: 42 tests with local SQLite |
| `makemigrations --check --dry-run` | Passed: no changes |
| Full Playwright suite | Passed: 70; 2 duplicate mobile screenshot captures intentionally skipped |
| Responsive overflow | Passed at 390, 768, 1280, 1440 and 1920px |
| Publication/language, keyboard, offline recovery | Passed using real local API and synthetic isolated fixtures |
| Existing checklist persistence/reset and saved-guide offline regressions | Passed in full browser suite |
| Real iPhone Safari / owner content review / staging acceptance | Not performed; still required |

The first browser run had two test failures: an obsolete Money heading assertion and repeated accordion toggling during screenshots. Both assertions were corrected; the complete rerun passed. No production logic was changed to bypass failures.

Screenshots: [Explore desktop](screenshots/topic-pages/explore-1920.png), [housing desktop](screenshots/topic-pages/housing-1440.png), [housing mobile](screenshots/topic-pages/housing-390.png); other required widths are in the same folder. Full-page mobile screenshots place fixed bottom navigation at the viewport boundary, not the bottom of the full document. The page retains scrollable bottom clearance. Images contain explicitly synthetic test content/dates.

## Remaining limits and next checkpoint

- Topic articles are not saved offline or indexed by global article-body search yet; existing guide search and local topic discovery remain functional. Broader resource search is Slice F.
- Interface copy remains English with the existing explicit fallback notice when Nepali is selected. Only separately published Nepali article records render as Nepali; no automatic translation or silent content fallback.
- Study information is not yet a course catalogue; community articles are not a business/event directory. C–E remain planned. No sample course data, calculators or misleading controls were introduced.
- PostgreSQL CI, owner PR review, real devices and editorial population are separate gates. Existing sprint usability and recovery follow-ups remain open. No merge or deployment performed.
