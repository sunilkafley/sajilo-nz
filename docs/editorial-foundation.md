# Slice A — editorial foundation

## Acceptance defined before implementation

1. Django admin manages topic articles, course records and directory entries independently of existing journey guides. No production content is seeded.
2. Each language starts as a draft. Publication requires a non-sample record, approved source domain, exact HTTPS source URL, active staff reviewer and actual review/next-review dates. Material edits must first be saved as drafts, clearing review. Withdrawal immediately removes the public record.
3. Staff with the appropriate model view/change permission can preview saved records without publishing. Anonymous, non-staff and staff lacking permission cannot preview. Preview is escaped HTML, no-store, noindex and outside the React/service-worker/saved-guide flows.
4. Read-only public list/detail endpoints and their filters/search expose only eligible records and no reviewer identity. Missing translations do not fall back. Pagination bounds responses.
5. Source-domain approval is separately permission-controlled. Domain identity/classification cannot be changed after creation; disabling a domain withdraws its records from public responses. URLs must match exactly, not suffix-match. No server-side URL fetching.
6. Existing guide API, storage keys, publication rules and prototype remain unchanged. Required checks and migration compatibility are recorded, not inferred.

## Schema and compatibility decision

Add a separate `editorial` Django app. `Article`, `Course` and `DirectoryEntry` share an abstract review policy, not a shared untyped content blob. Each has a `(slug, language)` unique constraint, indexed source/reviewer foreign keys and a public-list index on language/topic for published records. Articles use plain body text plus optional structured heading/body sections. Courses have explicit provider, city, subject, level, duration, intake, tuition and entry fields. Directory records distinguish organisations, businesses and events with category, city and optional event times. All are editable in admin.

`SourceDomain` is an admin-managed exact-host trust registry, classified as official, education provider, community or commercial. Approval needs a staff reviewer, real date and rationale. Articles require official sources; courses require a provider or official source; businesses require commercial attribution; organisations/events require community or official attribution. Trust classification is an editorial decision, not inferred from a domain suffix. No domains or content are auto-approved. This does not change the existing Guide allowlist.

The migration creates new tables only; it does not alter or populate existing guides, users or checklist data. Rolling back application code can leave the new tables in place. Do not reverse the migration after content entry: dropping these tables loses editorial records. Before deployment, test against an isolated PostgreSQL restore and take a private backup; local fresh-database tests do not establish production rollback readiness.

## Scope boundary

Slice A provides the backend/admin contract and a saved-record editorial preview, not the final visitor-facing topic layouts, course comparison or directory UI. Those belong to subsequent slices. Preview is intentionally not an unsaved live editor. No new guide offline format, visitor accounts, content publication or deployment is included.

## Admin handover

After review/merge, run the existing local `migrate` setup before using the new models. No records are installed by migration. Do not run it against staging until separately approved.

1. In **Editorial → Source domains**, add an exact hostname and source classification. Verify ownership/authority; record the real rationale, reviewer and date before enabling Approved. Approval does not cover every page on that domain or constitute approval of any content.
2. Add an **Article**, **Course** or **Directory entry**. Choose its topic/language, write its content and link to its precise source page. Save as Draft. Article sections optionally use a list of `{ "heading": "...", "body": "..." }` objects; ordinary body text needs no JSON. No HTML is rendered.
3. Select **Preview saved record**. Unsaved form edits are not included. This is an editorial reading preview within Django, not the final visitor layout. URLs display as text; copy/open the official source separately to check it.
4. Check every factual claim and translation. Reopen the record, enter the actual reviewer, verification date and next-review date, select Published and save. Samples cannot publish. Each language uses a separate record with the same slug, without automatic fallback or shared review.
5. To revise or withdraw, save as Draft first. Prior review is cleared, including on withdrawal without edits. The public API stops returning the record immediately. A new review is needed to republish. Admin History records successful changes, but is not a full content-version rollback system.
6. Disabling a source domain removes associated records from public results. Its hostname/classification cannot be edited after creation; create and approve a replacement and re-review affected records instead.

Use Django's normal staff/model permissions. A content editor needs the appropriate add/change/view permissions; source-domain management can remain with Sunil alone. Non-staff users cannot access the preview even if granted a model permission. No new visitor registration or login is introduced.

English and Nepali review are independent. Changing English does not automatically withdraw a separately approved Nepali record; the editor must reassess corresponding translations. Existing journey guides remain in **Guides**, using their unchanged source/publication rules.

## API contract for later slices

Read-only endpoints: `/api/explore/articles/`, `/api/explore/courses/`, `/api/explore/directory/`, with detail at `<slug>/`. Parameters: `lang=en|ne` (default en), optional `topic`, `stage`, `q` (title/summary/body, at most 200 characters) and `page`. Lists return DRF pagination `{count, next, previous, results}` with 24 results/page. No staff switch or query parameter reveals drafts. Ineligible/missing details return 404; invalid supported filters return 400. Public fields include source classification, precise source URL, actual review dates and an overdue flag, not reviewer identities or private domain-review notes.

Course-specific/city/category filters and unified visitor search integration remain later-slice work. These endpoints are not wired to the current Home/Explore interface in Slice A. Public read-only responses and staff previews use no-store. Existing service-worker caching intercepts only the shell/asset allowlist, not `/api/` or `/admin/`; preview has no saved-guide integration.

## Verification — 13 October 2026

Branch: `codex/editorial-foundation`, based on merged PR #19. Implementation is ready for PR review, not deployed.

| Check | Result |
| --- | --- |
| `npm run check` | Passed |
| `npm test` | Passed: 6 prototype + 82 frontend tests |
| `npm run build` | Passed |
| Django system check / migration drift | Passed; no unrecorded model changes |
| `python backend/manage.py test guides editorial` | Passed: 42 tests, isolated SQLite; includes additive migration roundtrip preserving existing guides |
| Full Playwright desktop/mobile Chromium suite | Passed on rerun: 63 passed, 1 existing duplicate screenshot skip |
| Focused editorial browser tests after final preview refinement | Passed: 4; staff login/preview, draft isolation, missing translation, no-store, no content in localStorage/cache, keyboard return and no overflow at 1440/390 CSS px |
| Render routing and staging-policy scripts | Passed locally; 4 policy unit tests passed |
| PostgreSQL / Docker | Not run locally; existing CI now includes editorial tests against PostgreSQL |
| Real iPhone Safari / human admin acceptance / content review | Not run; owner checks remain required |

Initial backend tests exposed preview method-decorator misuse and empty-object section validation; both were fixed and tests rerun. Initial browser tests incorrectly rejected Django's harmless stored theme preference; corrected to prohibit editorial content/Sajilo saved records. One existing offline-ready test timed out on the first full run and passed on the full rerun without an application change. The attempted npm worker argument did not reach Playwright; both full runs used eight workers. Focused final checks used two workers directly. Production-routing validation initially lacked WhiteNoise locally; installing the existing pinned deployment requirements allowed it to pass. No dependency versions were changed.

Screenshots use synthetic isolated content, not real editorial records: [desktop preview](screenshots/editorial/preview-desktop.png), [mobile preview](screenshots/editorial/preview-mobile.png). They show the Django editorial preview rather than the public prototype design. Public UI/guide/checklist code and the approved asset remain unchanged.
