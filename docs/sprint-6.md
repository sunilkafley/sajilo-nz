# Sprint 6 — Explore

Started 5 October 2026 (New Zealand). Status: 6A merged in PR #9 at `4651e1a`; 6B merged in PR #10 at `5b39805`; 6C Christchurch implemented for PR review, human publication review pending. User approved the [revised roadmap](roadmap.md), allowing Explore engineering alongside the outstanding Sprint 5 human work. Sprint 5 remains open.

Base: `4a0c92e` (merged PR #8). Branch: `codex/sprint-6a-explore`. Staging is still recorded at `f0bf8b3`; no deployment is part of this slice.

## Goal and slices

A guest can discover available Sajilo NZ resources through a familiar Explore page, understand what is still planned, and reach a useful guide or tool without losing saved progress.

| Slice | Scope | Exit evidence |
| --- | --- | --- |
| 6A — landing page | React route/navigation, prototype category cards, Aotearoa topics and city list; links only to implemented destinations | Acceptance below, passing CI and user review |
| 6B — topic browsing | Browse published guidance by category while retaining language, review metadata and saved/offline rules | Define topic/API contracts in a small follow-up PR; test draft exclusion, empty/error states, filters and saved copies |
| 6C — one city journey | One useful city page with sourced, reviewed resources connected to working tools | Select city with user; validate sources and review records; test responsive navigation and available/unavailable states before expanding |

6B must assess any schema change and migration/rollback compatibility before release. 6C must not copy the prototype's illustrative costs or example listings into live claims. The remaining prototype categories are navigation planning, not a commitment to implement all destinations in this sprint. Full interface translation, global search, course catalogues, community/events, accounts and new hosting remain outside 6A.

## 6A implementation

`frontend/src/features/explore/` contains the page, scoped styles and typed destination catalogue. `App.tsx` adds `/#/explore`, the Explore navigation item and page title; it retains the existing route-focus behaviour. The catalogue distinguishes available destinations from planned entries. It does not set review status or verification dates.

The page reuses the prototype's heading, forest/mint palette, rounded cards, line icons, twelve categories, six Aotearoa topics and five city names. Working categories appear first. Search is explicitly **pre-departure guide search**, linked to the existing guide page, rather than a nonfunctional global input. Existing English/Nepali selection remains on the guide page; the Explore interface stays English.

| Explore entry | Destination/behaviour |
| --- | --- |
| Search pre-departure guides | `/guides`; existing language selection, search, empty/error and offline-copy states |
| Open saved guides | `/saved`; existing browser-local saved copies |
| Prepare to travel | `/predeparture`; existing checklist/progress |
| Immigration | `/sources`; labelled “View official sources”, not an implemented immigration hub or eligibility decision |
| Other categories, Aotearoa topics and cities | Clearly marked Planned, rendered as text/cards without links or disabled controls |

The landing page itself makes no API request and has no new storage writes. It is included in the existing production application shell for offline use after readiness. Following a guide link keeps existing API and saved-copy behaviour; official websites still require connectivity. No backend, schema, source allowlist, storage format, dependency, deployment or prototype changes.

## Observable 6A acceptance

| ID | Expected observation | Evidence |
| --- | --- | --- |
| E1 | Guest reaches Explore with keyboard navigation; active link, page title and main focus reflect the route | Component and desktop/mobile Chromium tests |
| E2 | Every available Explore link reaches its named screen; guide search finds the isolated test guide | Browser test through all four destinations and search |
| E3 | Planned categories/topics/cities are labelled and have no interactive dead ends; landing render does not call the API | Component test and code review |
| E4 | After offline readiness, Explore survives refresh and connects to a previously saved guide; checklist changes survive navigation/reload | Production-build browser integration in both projects |
| E5 | Desktop/mobile layouts preserve the visual theme; 320px phone and 768px tablet have no horizontal overflow | Browser checks and screenshot inspection; real Safari remains pending |
| E6 | Existing English/Nepali, storage failure and withdrawal journeys remain working | Full existing frontend/browser regressions |

## Validation record — 5 October 2026

- `npm run check` passed after correcting unsupported `exact` options in Testing Library queries in the new component test. The initial type-check failure is resolved.
- `npm test` passed: 6 prototype tests and 29 frontend tests.
- `npm run test:e2e` passed: 24 desktop/mobile Chromium tests, including a fresh production frontend build and an isolated synthetic Django API.
- Desktop/mobile Explore screenshots generated by the browser tests were inspected; screenshot files remain ignored test outputs.
- No local Django/PostgreSQL, deployment-policy or container checks were run for this frontend-only change. Existing **quality** CI still runs its full workflow; record its outcome in the PR.
- No real-device Safari, human content/translation review, usability session, deployment or publication was performed. Sprint 5 records retain their actual status.

## Handoff and next action

Review 6C's PR before merge; review city content separately before publication. Deployment requires a separate user decision. Recommended next slice is 6D Home dashboard, followed by Sprint 7 arrival essentials; do not silently mark Sprint 5 finished or expand Explore into every planned category.

## 6B implementation and contract

Base: merged PR #9 (`4651e1a`). Branch: `codex/sprint-6b-topic-browsing`.

Explore offers four travel topics: Documents, Packing, Money and Before leaving Nepal. Membership derives from existing checklist groups and each guide's reviewed `checklist_ids`, not title/slug guesses. Multi-topic guides are supported; All topics retains unlinked guides. The wider prototype categories remain planned.

`/guides?topic=documents&lang=ne` selects a topic and language; `/saved` uses the same context. Unknown topic IDs show an explicit recovery action rather than unrelated results. Search intersects the selected topic. Detail, return, saved and language-switch navigation retain context; checklist task links keep their existing behaviour.

The API still returns the complete selected-language publication catalogue. Reconciliation checks this full catalogue before UI filtering, so hidden topics cannot invalidate saved copies, while a successful withdrawal check still removes content. An API failure filters only validated saved copies with existing offline warnings and original review dates. Unavailable bookmarks lack membership metadata and remain removable under All topics.

No API/schema/migration, storage-format, source allowlist, hosting, prototype or editorial-content changes. Existing publication and translation review gates remain authoritative; merging this feature does not approve content. Database migration/rollback compatibility is unchanged.

### Observable 6B acceptance

- Explore's four topic links select the correct guide filter; membership supports multiple topics and All topics includes unlinked guides (component/domain tests).
- Language selection and detail/saved/return links retain topic context; requests still fetch the full language catalogue (component and browser tests).
- Empty and unknown topics have explicit explanations/recovery; search remains scoped to topic and language.
- Filtering preserves unrelated saved content; offline reading retains language and dates, and a full successful withdrawal check removes cached content (component/browser regressions).
- Existing guest, publication exclusion, checklist persistence and responsive journeys remain intact. Real-device Safari and human usability evidence remain pending, not inferred from Chromium.

### 6B validation

- `npm run check` passed; `npm test` passed (6 prototype and 34 frontend tests).
- Final `npm run test:e2e` passed (28 desktop/mobile Chromium tests), including the production build and isolated Django API. The initial attempt used system Python and failed to import Django; rerunning with the repository virtual environment resolved it.
- Existing Django guide tests passed (16) against an isolated SQLite test database, including publication/draft and independent translation gates.
- Desktop/mobile Explore screenshots were inspected; generated files remain ignored. `git diff --check` passed.
- Local PostgreSQL, container/deployment-policy and real-device Safari checks were not run. The existing GitHub quality workflow remains the PostgreSQL integration gate; its outcome belongs in the PR.

Sprint 5's human reviews, remaining device cases, 2–3 sessions and recovery housekeeping remain open; no publication or deployment is part of 6B.

## 6C — Christchurch preparation

City chosen by Sunil, who is based in Christchurch. Base: merged PR #10 (`5b39805`). Branch: `codex/sprint-6c-christchurch`. Engineering implementation does not close the city content-review acceptance gate.

Small slice: prepare the airport-to-accommodation journey before departure. `/cities/christchurch` reuses the guide list, language/search/topic controls, dates/sources, save and offline-copy flow. A feature catalogue explicitly maps Christchurch to `christchurch-arrival-plan`; it does not infer location from titles, collect a user's address or approve content. Other city links remain Planned. Unknown cities show a recovery link, never unrelated guide results.

Detail/saved/return links retain `city=christchurch` and selected language/topic. The API still supplies the full selected-language catalogue; reconciliation occurs before city/topic filtering. A successful publication check removes withdrawn city bodies and retains removable bookmarks, including in a city-filtered saved list. API failures preserve saved copies and show warnings. Existing airport transport/accommodation task links keep stable IDs and browser persistence; they are explicitly not newly reviewed.

The create-only draft seeder adds English and Nepali preparation starters with no review metadata. The [review packet](content/christchurch-review.md) contains matching text, source-to-claim mapping and separate pending review records. Official source research used Christchurch Airport's parking/transport page and Metro's getting-started page. No specific fare, route, timetable, payment method, accommodation availability or community listing is asserted. Source fetching and PR review do not approve wording or translation.

### Publication and compatibility

- Backend and frontend source allowlists add only exact HTTPS `www.christchurchairport.co.nz` and `www.metroinfo.co.nz`; unsafe schemes, lookalikes, credentials and nonstandard ports remain rejected.
- No database schema/migration, API field, task-ID, saved-storage format, dependency, prototype or hosting changes. No seeding of staging, deployment, publication or merge by this task.
- A pre-6C frontend rejects saved guides containing these newly allowed source hosts and preserves, but cannot read, that saved record. Therefore rollback to older code after city publication is **not** established as seamless offline compatibility. Before a release, test existing and city saved copies through app update/rollback with an approved compatible target; do not clear user storage or reverse migrations to mask failure. The earlier same-commit Render drill does not prove this cross-version case.
- Publication requires a deployed compatible release and an editor's separate approval for each language. No review date is inferred from code or deployment.

### Observable acceptance

1. Guest follows Christchurch from Explore to its focused guide list, with keyboard focus/title and no overflow at phone/tablet widths.
2. Only curated, published language records appear. Unreviewed city translation and unrelated reviewed guides do not leak into the city list; unknown/empty/error states offer useful recovery.
3. Detail, language, search/topic, saved and return navigation retain city context. Successful full-catalogue refresh preserves unrelated saved copies.
4. Saved city content reads offline with original dates and warning; its checklist task completion survives refresh. Withdrawn city content is removed only after successful publication checking and its bookmark remains removable.
5. Seeder preserves existing edited/published records; publication needs separate human review for English/Nepali. Exact source validation and packet/seed parity are tested.
6. Actual human English/Nepali approval, real Safari cases and 2–3 usability sessions remain pending. Automated synthetic fixtures do not satisfy these gates.

### 6C validation record

- `npm run check` passed; `npm test` passed (6 prototype + 40 frontend/domain tests).
- `npm run test:e2e` passed (32 desktop/mobile Chromium tests), including production build and isolated synthetic Django API. City navigation, unpublished Nepali exclusion, error recovery, offline reading/original dates and persistent task completion passed.
- Django system check and `makemigrations --check --dry-run` passed (no migrations). Final `manage.py test guides` passed (19, isolated SQLite), including exact source-host validation, independent publication review, create-only preservation and review-packet/seed parity.
- Generated desktop/mobile Christchurch screenshots were inspected; files remain ignored test outputs. `git diff --check` passed.
- Local PostgreSQL, container/deployment-policy, source-link checks on a deployed release, cross-version app update/rollback, real Safari and human acceptance were not run. Existing quality CI supplies PostgreSQL/container/policy coverage; record its actual outcome in the PR.

Sprint 5 and recovery housekeeping follow-ups retain their existing status. Human English/Nepali city review remains pending. Home dashboard is a proposed next engineering slice, not included here.
