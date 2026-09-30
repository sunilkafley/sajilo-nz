# Sprint 1: React checklist foundation

## Implemented
- React + TypeScript + Vite workspace and reproducible npm lockfile.
- Three routes: journey overview, pre-departure checklist and official sources, plus unknown-route recovery.
- All 27 prototype tasks retained; stable IDs separate saved data from display labels.
- Use cases own completion and persistence; storage is injected for tests.
- Version validation, duplicate/unknown ID filtering, same-origin legacy import, storage warnings and write retry.
- Keyboard-accessible labels, route focus, skip link, live progress announcement and responsive layout.
- CI runs type/syntax checks, tests, build and desktop/mobile Chromium tests.

## Validation
TypeScript and production build pass. Six original regression tests plus fourteen frontend unit/integration tests pass locally. Browser execution status is recorded in the PR; local Chromium installation was blocked by incomplete downloads. Browser tests are provided and enforced by the CI job when Actions runs.

## Review steps
Run npm ci and npm run dev. Open the checklist, complete Passport, reload and confirm it remains checked. Navigate home and back. Try keyboard-only navigation and a narrow/mobile viewport. Check source notices and links. Review the design against the original prototype. Test on actual iPhone Safari before approving the sprint.

## Limits
No backend, offline cache, authentication, sync or Nepali localisation in this slice. Content is not certified as reviewed. Same-origin migration cannot access data stored on the original Site's different domain. Future/invalid storage is preserved without a destructive reset button. Concurrent-tab conflict resolution remains a future task.
