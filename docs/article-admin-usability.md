# Article admin usability

## Acceptance criteria (before implementation)

- Simplify article editing around title, topic, language, type, summary and content; collapse optional sources/sections/organisation. Keep explicit review and publication controls together.
- Existing articles default to Sourced guidance. Guidance, courses and directory records retain their source requirements.
- General information (original introductions, welcome pages and site instructions) can publish without an external source, but still requires actual human review, dates and separate translation review. Factual guidance must not be classified as general merely to bypass attribution; staff make this editorial decision.
- Supplied sources must still be valid and approved. Type/content changes invalidate review through the existing draft workflow. No automatic review dates, content publication or live database changes.
- Public API and frontend distinguish general editorial information from official guidance. Missing/invalid review metadata, samples and drafts remain private.
- Test migration compatibility, publication, frontend attribution and admin editing; run the existing checks before review. Deployment is separate.

## Implementation

Article admin now starts with title, topic, language, article type, summary and content. Source attribution, structured sections, tags/stage and URL settings are collapsed. English titles can generate a URL slug on saving; Nepali titles need an explicit Latin-letter slug if no ASCII name can be generated. Duplicate slugs remain validation errors rather than overwriting records. Ordinary article writing needs no JSON.

General information can omit both source fields. If either source field is supplied, a complete approved official source remains required. Public eligibility still checks publication, sample status, reviewer activity and recorded dates, independently for each language. Type changes are content changes: save a draft and re-review. This is an editorial classification, not automated fact-checking. The frontend explicitly labels general information as Sajilo NZ editorial content, not official guidance.

The PostgreSQL schema guidance informed a bounded article-type field with a safe existing-record default. Migration `editorial.0002_article_article_type` adds only this field, defaulting every existing article to `guidance`; it does not publish or re-review anything. The previous API/frontend safely omit or reject source-free articles after a code rollback, but do not reverse/drop the column after new content is entered. A future deployment requires its own backup and isolated migration check. No live database was accessed for this work.

## Verification

- `npm run check`, `npm test` (6 prototype + 93 frontend), `npm run build`: passed.
- Django guides/editorial tests: 48 passed with isolated SQLite, including migration preservation, admin draft/publication, missing reviews, source requirements, defensive API filtering and review invalidation.
- Migration drift check: passed; only the explicit new migration is required.
- Full browser suite: 72 passed, 2 duplicate mobile screenshot cases intentionally skipped. The new desktop/mobile admin flow saves a source-free draft, rejects publication without review, then publishes with explicit synthetic review metadata and checks public attribution. The first run's assertion also matched the unrelated footer source link; it was narrowed to attribution and the full rerun passed.
- Desktop/mobile form screenshots were visually inspected: [desktop](screenshots/article-admin/form-desktop.png), [mobile](screenshots/article-admin/form-mobile.png). Tests use a temporary database with synthetic content/review dates only. Full browser regressions retain checklist persistence and saved-guide offline checks.
- PostgreSQL CI, real-device Safari and owner admin acceptance remain separate gates. No production content, translation review, merge or deployment performed.
