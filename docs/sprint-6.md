# Sprint 6 — Explore

Started 5 October 2026 (New Zealand). Status: 6A implemented for PR review; 6B/6C planned. User approved the [revised roadmap](roadmap.md), allowing Explore engineering alongside the outstanding Sprint 5 human work. Sprint 5 remains open.

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

Review 6A's PR and page before merge. Deployment requires a separate user decision. After 6A review, implement 6B as another feature branch/PR with its own acceptance criteria. Plan Sprint 7 arrival essentials after the Explore increment; do not silently mark Sprint 5 finished or expand 6A into every linked category.
