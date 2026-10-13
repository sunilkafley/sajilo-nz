# Site-wide search and balanced workspace

Branch: `codex/site-search-layout`, based on merged PR #16. Frontend increment; no deployment, publication, database migration or prototype edit.

## Acceptance criteria and implementation

- The original whitespace came from a left-aligned `main` with a 1700px maximum and 60px large-screen padding. Main now centres **within the workspace after the sidebar**, with a 1440px border-box maximum and 24–40px responsive horizontal padding. Welcome, location chip and grid share that container.
- Home has a fluid main column, 300–340px supporting column and 24px gap. Supporting cards stack below at 1200px and below, then form one column on phones. Guide detail main stays at most 960px and its existing body reading width remains 850px.
- The approved logo bytes, prototype palette/fonts, sidebar positioning and functioning journeys remain intact.
- Toolbar and Explore entry point now use Search Sajilo NZ. The accessible input label names guides, checklists and topics. Arrow keys navigate suggestions, Enter opens the selected suggestion or the query results page, Escape dismisses, Tab can reach View all results. IME composition does not submit early. Active suggestions scroll into view.
- Query is shareable/reloadable at `/#/search?q=...`. Empty, loading, no-match and incomplete/error states are explicit, with retry. Requests debounce for 250ms; superseded timers and requests are cancelled and late responses ignored even when transport ignores cancellation.

## Index and publication boundary

Business rules live in `frontend/src/features/search/domain.ts`; request lifetime in `useSearch.ts`; both dropdown and results page use them.

Search reuses the existing public guide API for English/Nepali × pre-departure/first-week. Those are all currently supported stages. Its existing server-side publication, human-review, source, sample and translation filters remain authoritative. No admin/private endpoint or stored guide body is indexed. No API/schema change, external search platform or paid dependency.

Local entries use actual task IDs/labels/groups, topic and available-category catalogues, Christchurch identity, official sources and the implemented budget-checklist destination. Working page headings and descriptions are included. Planned categories, Profile, Community and unavailable tools are excluded. Checklist and tool results explicitly say planning/unreviewed. Only returned public guides show their recorded review date, including overdue status.

Guide title, summary, full body (including headings) and source titles are searchable. Current guide/task schemas have no separate tags or per-task descriptions; none are invented. Existing groups and category descriptions are indexed. Exact title matches precede partial titles, then all-query-term content matches. Unicode NFKC/case/whitespace normalization supports English and Nepali without translating or falling back across languages. Results carry type, language, excerpt and destination; destination/language duplicates are removed after ranking.

## Verification

Recorded local checks:

- `npm run check`: passed.
- `npm test`: 6 prototype + 69 frontend/domain/hook tests passed.
- Django `manage.py test guides`: 22 passed against isolated SQLite, including existing publication guards.
- Production-build Playwright suite: 55 passed; one duplicate mobile invocation of the all-width screenshot test intentionally skipped.
- Checks/captures at **1280, 1440, 1920 and 390px**: equal remaining-workspace margins, common welcome/grid edges, no horizontal overflow, intact 3:1 logo. Guide reading-width assertion included.
- Search tests use actual repository checklists (including first-week tasks), topics, city, sources and tool entries. Published-guide/bilingual/draft-exclusion integration uses the **existing isolated browser fixtures**, not newly published content or evidence of real human review.
- Keyboard dropdown/task focus, completion after refresh, query reload, View all, English/Nepali and body search, draft/unavailable exclusion, error/retry and stale-response protection tested. Prior offline/saved withdrawal and separate checklist regressions retained.

## Screenshots

[1280px Home](screenshots/site-search/home-1280.png) · [1440px Home](screenshots/site-search/home-1440.png) · [1920px Home](screenshots/site-search/home-1920.png) · [390px Home](screenshots/site-search/home-390.png)

[Desktop suggestions](screenshots/site-search/search-desktop.png) · [Mobile suggestions](screenshots/site-search/search-mobile.png) · [Results page](screenshots/site-search/search-results.png)

## Limitations and carry-forward gates

This is bounded client-side indexing over the current small public catalogues: four existing API requests per settled query, no persisted search index. A larger catalogue may justify a paginated server-side search endpoint. No stemming, fuzzy matching, transliteration or auto-generated translation. Guide publication can change between result fetch and click; destination pages always apply their existing availability checks.

If offline or an API request fails, local content still searches and successful public responses may appear with an explicit incomplete-results warning. Saved guide bodies are deliberately not searched, avoiding stale/withdrawn-content exposure; the existing Saved resources flow remains available.

No production/staging content changed or reviewed. Nepali search coverage depends on actually published Nepali guides; the UI and static planning catalogue remain English. Real-device Safari, screen-reader and human usability sessions, PostgreSQL/container/recovery checks were not run for this increment. Earlier sprint review/device/recovery gates remain open. Full-logo fine print remains small in compact navigation; a separate approved compact asset would be needed to change that.
