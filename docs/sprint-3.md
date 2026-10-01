# Sprint 3 — search, bookmarks and offline guides

## Acceptance criteria
- Search title, summary and body within the selected language, using all query words, with visible empty results and a clear action.
- Save/remove a reviewed guide; its language-specific bookmark survives refresh. Saved guides are searchable and require no account.
- Storage errors and malformed/future data produce a visible warning without silently replacing stored data or claiming success.
- Production app shell and saved guide copies survive an offline refresh. Existing checklist completion also persists offline.
- Saved copies retain editorial verification dates, label the copy date separately, and become review-due when the original next-review date passes.
- Successful fresh API checks update saved content and remove withdrawn bodies, retaining a removable unavailable bookmark. Failed requests never imply withdrawal.
- No missing-language fallback. Official links remain validated and require network access.
- Cache contains only the app shell/assets, never API responses, Django admin or external source pages.

## Decisions
The catalogue is currently small and unpaginated. Search is client-side; guide identity is `(language, slug)`. Saved copies use a separate versioned localStorage envelope, capped at 50 entries / 500,000 UTF-16 code units. This keeps text-only saves synchronous and makes write failure observable before confirmation. Use IndexedDB and pagination when catalogue or attachment sizes justify them. Checklist storage is unchanged. No personal records or credentials enter the guide cache.

Every save reads the current envelope before mutation; cross-tab storage events refresh visible bookmarks. Corrupt and newer-version envelopes are preserved for recovery. Quota errors retain the previous persisted copy. Concurrent simultaneous writes from different tabs are not transactionally coordinated; cross-device sync is outside scope.

Fresh language-list fetches bypass HTTP cache and validate identity, duplicate slugs, dates, task IDs and official sources before reconciliation. Publication checks run when a guide/list route opens, on retry and on reconnection. An offline device cannot discover a withdrawal; the UI states this limitation. A withdrawn guide's body and sources are removed after a successful check, while the bookmark title remains removable. Re-publication can refresh that bookmark.

The build generates a content-versioned service worker caching the shell and hashed assets. Navigation uses network with a five-second timeout then the cached shell. Only root/index navigation and allowlisted build assets are intercepted. Installation must cache every asset before activation. Updates wait until old tabs close (no forced skipWaiting), then remove only this app's old shell caches. Saved copies live outside the shell cache and survive app updates. Development does not register a worker. Offline readiness is shown only once a worker controls the page.

## Validation and review
Unit tests cover language identity, read/write persistence, withdrawal/republication, malformed/future data, unsafe snapshots, quota errors, multilingual search, date aging and invalid API lists. Browser tests run the production build with a real isolated Django test API on desktop and mobile Chromium, including offline refresh, checklist completion, removal, reconnection withdrawal and failed storage. Existing publication/checklist tests remain in CI under `quality`, using Python 3.14.8 and PostgreSQL 17 for backend tests.

Manual acceptance recipe is in README. Real iPhone Safari and human review of this increment remain outstanding. No deployment or content publication is included. The development implementation is ready for PR review once CI passes; sprint acceptance still requires the user's review.
