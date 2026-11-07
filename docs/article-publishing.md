# Easier article publishing

## Acceptance criteria

- Page articles offer Save draft, Save & preview and Publish article. Save & preview saves first and opens the existing private, non-cacheable saved-record preview. New records must be saved before publication.
- A readiness panel describes missing model requirements for the saved version, identifies the signed-in publisher and distinguishes saved state from unsaved form input. A failed publish must not display the submitted status as if it were saved.
- Pasting an exact official HTTPS source link selects an already approved, active official source domain on save. No source approval, domain creation or review date is inferred. Unknown hosts have an actionable validation error and never auto-create a source.
- Publishing requires explicit confirmation of review in the selected language, actual review and next-review dates and the existing model rules. The signed-in staff member is recorded as reviewer; a submitted alternative reviewer cannot impersonate another person.
- Changed published content must be saved as a draft before it can be reviewed and republished. Draft saving withdraws the article from the public site and clears prior review as before. Samples, missing/invalid attribution and unreviewed translations remain unpublished.
- View-only staff can preview but cannot save or publish. Native CSRF, admin change permissions, history and delete confirmation remain. Courses, directory entries and Journey guides keep their existing forms/rules.

## Editor flow

1. Open Articles → Add. Write the title, choose topic/language/type, add a short summary and the content. URL names are generated from English titles; corresponding Nepali records need the same Latin-letter URL name.
2. For sourced guidance, paste the exact official page link. If its hostname is approved, the source selector is handled when you save. Source settings, structured sections and organisation/URL fields remain optional advanced controls. For a new domain, a source administrator must review it separately. You can save an early draft without a source link and add it later.
3. Choose Save & preview. Check the saved text and source. Return to the record to revise, saving another draft as needed.
4. Enter the actual review and next-review dates, confirm that you reviewed this saved language version, and choose Publish article. Your signed-in identity is recorded. No dates are prefilled.

General information is for original introductions/welcome/site instructions only. It may omit external attribution but still requires human review. Factual advice must remain sourced guidance. Changing the type does not bypass the draft/review requirements.

The readiness helper uses model validation on an in-memory copy. It never saves a status, reviewer or date. Review confirmation is a form action, not a new database field; existing review metadata and admin history remain the record. No migrations, publication, production data changes or deployment are performed by this implementation.

## Validation

- `npm run check`: passed.
- `npm test`: passed (6 prototype and 137 frontend tests).
- Django `test config editorial guides --noinput`: 71 passed on isolated SQLite, including eight publishing-flow tests. Coverage includes saved previews, slug generation, exact-host source matching without domain creation, explicit review confirmation, reviewer impersonation prevention, dates/source requirements, draft-before-edit publication, independent translations, readiness with no database mutation, view-only restrictions and add-only staff navigation.
- Migration drift: no changes detected. `git diff --check`: passed.
- `node scripts/check-article-publishing.mjs "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"`: passed using a temporary database and synthetic article/review metadata outside the sandbox. Checks draft saving, private preview, visible missing-review errors, explicit publication/API visibility, blocking unsaved published edits and withdrawal/review clearing. Mobile/desktop screenshots inspected with no horizontal overflow.
- Existing editorial Playwright cases updated to the new actions/confirmation. The full Playwright suite, PostgreSQL and real Safari were not rerun locally. No frontend app build was needed; no frontend source or dependencies changed.

[New article on mobile](screenshots/article-publishing/add-390.png) · [Desktop editor](screenshots/article-publishing/add-1440.png) · [Missing-review errors](screenshots/article-publishing/review-errors-390.png).

This flow applies to Articles. Other record types keep their established forms and publication rules. It is not deployed and no real content was published.
