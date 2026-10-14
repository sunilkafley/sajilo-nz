# Slice F — Integration and release readiness

## Acceptance criteria before implementation

- Search published articles (including headings/body/tags), courses and community entries alongside existing guides and local routes. Never index admin, drafts or cached private content.
- Preserve exact/partial/content ranking, distinct language labels, safe destinations and source classifications. Add URL-backed topic/stage/type filters without changing content publication or checklist storage.
- Bound remote catalogue pagination, report incomplete responses honestly, retain debounce/abort/stale-response protection, and preserve keyboard dropdown behaviour.
- Add available course/budget/community destinations; no unavailable tools or visitor accounts.
- Run required frontend/backend/browser checks and record real outcomes. Document admin handover, content/device/usability gates and Render/Neon backup/rollback requirements. No merge/deploy/publication authorization inferred.

## Delivered for review

Based on merged PR #25 (`5953399`), branch `codex/search-release-readiness` integrates the existing public Article, Course and Directory APIs into search. English and Nepali records are independently validated using their existing parsers. Titles, summaries, bodies, article section headings/body, course provider/subject, directory location/category and tags are searchable. Existing local pages, official links, guide stages and checklist task destinations remain available. Exact titles rank before partial titles, then content matches; destination/language deduplication is retained.

Results show type, language and actual recorded review metadata, including overdue warnings and commercial/general-information distinctions. Resource-type, topic and journey-stage filters are URL-backed. Budget calculator and Course finder now also have working Journey tools-row links, with the existing budget task link preserved.

No schema, publication policy, prototype, logo, checklist keys, saved-guide storage or deployment configuration changed. No production records were created or reviewed. Search reads public APIs only, not admin previews or saved private bodies. New editorial records remain online-only; saved-guide offline behaviour is unchanged.

### Search limits

This small-catalogue increment reuses public APIs rather than introducing a second backend publication/search implementation. Each editorial type/language is bounded to 20 pages of 24 records (480 records); pages are sequential within each catalogue, catalogues run concurrently. Each request has an eight-second timeout and abort signal. A failed/invalid page or reached limit produces an incomplete-results warning while retaining validated earlier pages. Server-supplied next URLs are never followed.

Queries refetch eligible public catalogues after debounce; no persistent content index is created. This is suitable for the initial curated catalogue, not an unbounded search service. Before significant growth, move ranking/filtering into a paginated public backend search endpoint sharing the same publication rules. Filters only apply where records have the relevant metadata; unclassified pages do not acquire invented stages. Search can return both languages with explicit labels. Interface translation still uses the established English fallback, not unreviewed Nepali copy. External websites are not crawled.

## Owner/admin handover

1. On an approved environment, open `/admin/` and choose **Editorial → Articles, Courses or Directory entries**. Use Guides for the existing journey guides. Confirm the deployed commit and migrations first; merging a PR does not update Render automatically.
2. For sourced material, approve the exact source domain and appropriate classification through the existing Source domains workflow. Courses and listings require sources. General Article information is only for original introductions/site instructions: it must not be used to bypass attribution for factual guidance.
3. Save content as a draft; use the staff-only saved-record preview. Check title, topic/stage/tags, source links, layout and language. Editing reviewed content requires re-review.
4. After actual human checking, record the real reviewer/date/next-review and publish explicitly. Review Nepali independently. Never publish test fixtures or enter dates just to satisfy validation.
5. Check the public topic/detail page and search as a guest. Test withdrawal on an isolated disposable record/environment: draft content must disappear from fresh searches and public detail responses. Restore only legitimately approved publication states.

This documents the workflow, not completion of Sunil's acceptance or content review. See [article admin usability](article-admin-usability.md) and [editorial foundation](editorial-foundation.md).

## Verification evidence

- `npm run check`: passed.
- `npm test`: passed, 6 prototype + 108 frontend tests. New tests cover article sections/tags, safe metadata, fixed pagination, partial failures and the catalogue cap.
- `npm run build`: passed.
- Django `test guides editorial`: 50 passed using isolated SQLite; migration drift check reports no changes.
- Deployment policy unit tests: 4 passed. `scripts/check_staging.py` and `scripts/check_render.py`: passed with disposable local settings; no remote deployment/database connection.
- Full browser suite: 90 passed, 6 intentionally skipped duplicate mobile screenshot loops (the desktop loops cover all target widths). Covers keyboard search/task focus, English/Nepali content, unpublished exclusion, filter destinations, storage failures, checklist reload/navigation and saved-guide offline/withdrawal regressions. Fixtures and their review dates exist only in the temporary test database.
- Search screenshots at [390](screenshots/release-readiness/search-390.png), [768](screenshots/release-readiness/search-768.png), [1280](screenshots/release-readiness/search-1280.png), [1440](screenshots/release-readiness/search-1440.png) and [1920](screenshots/release-readiness/search-1920.png): automated no-overflow checks; desktop 1440 and mobile 390 visually inspected. Screenshots show clearly synthetic test listings, not production content.
- Initial browser runs exposed two stale assertions that Course finder was unavailable and Budget checklist preceded the new calculator. Assertions now verify the implemented destinations/ranking.

## Remaining release gates — not marked passed

| Gate | Required evidence / owner action |
| --- | --- |
| PR and CI | Review this branch; required quality check must pass on the exact candidate SHA, including PostgreSQL and Docker/container checks. Local Docker and PostgreSQL checks were not run for F. |
| Editorial readiness | Review/populate each topic, genuine courses/community records and translations. Choose explicitly between a limited reviewed-content release with honest empty states or postponement. |
| Admin acceptance | Sunil verifies editing, preview, review, publication and withdrawal on an approved test environment. Automated tests do not replace this. |
| Real devices/accessibility | Real iPhone Safari: safe areas, bottom navigation, keyboard/focus, language changes, checklist reload, storage-denied behaviour and HTTPS offline saved guides. Chromium emulation is not Safari acceptance. Complete remaining Sprint 5 device checks. |
| Usability | Run the outstanding 2–3 structured sessions and record actual findings/fixes. |
| Operations | Verify actual Render commit, environment and migration state; retain private backup/restore evidence and a code/schema-compatible rollback target. No live verification performed in this slice. |

## Release/rollback checkpoint

No deployment is included. F adds no migrations, but the full sprint includes `editorial.0001_initial`, `editorial.0002_article_article_type` and `guides.0002_guide_firstweek_stage`. Compare the approved candidate with the actual deployed schema; do not infer state from a GitHub merge or earlier deployment report.

Before a separately approved deployment, follow [Render/Neon](render-neon.md) and [recovery drill](recovery-drill.md): take a private backup, verify an isolated restore and rehearse any pending migrations, preserve existing records, record exact candidate/rollback commits and deploy IDs, and assess compatibility before selecting a rollback. Historical same-commit rollback success is not proof of compatibility for this release. Do not blindly reverse migrations or connect Render to the restore-check database. Keep automatic deployment off and free hosting unchanged.

After owner-approved deployment, verify health, guest homepage/Explore/search/details, admin login, source/review metadata, independent existing checklist progress, saved-guide offline behaviour and withdrawal checks in the appropriate test environment. Record actual outcomes. Stop on publication leaks, lost progress or essential accessibility failures. Carry forward private-backup retention and disposable-test-database cleanup; neither is performed here. Engineering readiness is separate from content readiness and public launch approval.
