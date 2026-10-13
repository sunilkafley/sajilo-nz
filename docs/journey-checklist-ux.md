# Public refactor PR 2 — Journey checklist UX

Base: merged PR #18 (`faef380`). Branch: `codex/journey-checklist-ux`.

## Observable acceptance (before editing)

- Existing pre-departure and first-week routes immediately show heading, progress and interactive tasks; no tab or accordion. Supporting resources sit alongside on desktop and after tasks on mobile.
- Preserve task identifiers, independent storage keys, legacy decoding, corruption/version protections, session-only warnings and saved/offline guide behavior.
- Reset requires a named-checklist confirmation. Cancel changes nothing. Confirm resets only that checklist. Blocked storage is never overwritten; failed reset retains existing in-memory and persisted progress.
- Print / Save as PDF opens the browser's print interface without changing progress. Print CSS includes tasks, checked states, completion count and unreviewed disclaimer, but excludes navigation/actions.
- Only selected-stage/selected-language published API guides appear beside matching tasks and in supporting resources, with real review metadata. Loading, unavailable/error and empty states are honest. No invented content, translations, reviews or new sources.
- Preserve contextual task focus, keyboard controls, mobile navigation clearance and route/language context.
- Run check/test/build, desktop/mobile browser regressions and screenshots at multiple widths. Browser print emulation is not evidence of a physical printer or real Safari.

## Scope

Extract shared checklist presentation from App/ArrivalPage; keep repository/domain rules outside UI. Add a reset use case and a small public-guide resource hook. No backend/schema, publication, prototype, logo, deployment or accounts changes. Later-stage checklists remain unavailable. Stop at PR review; no PR 3 work.

## Implementation and compatibility

- `JourneyChecklist.tsx` is shared presentation; existing parent state and domain summaries remain in App and ArrivalPage. Both original routes and task deep links are retained.
- `resetChecklist` uses the existing repository and version-1 empty-progress shape. It writes only the selected key and only after UI confirmation. No keys are removed, no decoder/migration is changed, and blocked records cannot be reset. A failed write returns the original selections, not a false zero-progress success state. Successful reset announces completion and focuses the progress heading.
- `useRelatedGuides` reuses the public API parser and stage/language filters. Abort/active-request guards prevent old responses from replacing new-language results. It neither reads nor changes saved-guide storage; when unavailable, existing saved-guide links remain available. Guide detail links retain language and stage.
- `journey.css` gives checklist-first mobile flow and a 320px desktop support column. Print media hides shell/actions/support panels but retains the checklist, checked inputs, count, browser-storage explanation and unreviewed disclaimer. Native `window.confirm` and `window.print` supply browser-owned confirmation/printing; no dependency, upload or account.

## Verification — 13 October 2026 (New Zealand)

- `npm run check`, `npm test` and `npm run build` passed: 6 prototype + 82 frontend/domain tests.
- Full production browser suite passed: 59 tests, one intentionally skipped duplicate multi-width Home capture. Existing guide/publication, independent progress, quota/corruption, saved/offline/withdrawal and keyboard regressions included.
- New unit coverage: cancel/confirm reset, cross-checklist and saved/legacy isolation, blocked/future storage, failed reset retention, print invocation, returned focus, actual guide metadata, language-response race and guide failure/retry.
- New desktop/mobile browser coverage: independent reset and reload, related first-week Nepali guide navigation, empty publication/translation results, immediate task visibility, no horizontal overflow and supporting-panel placement at 390/768/1440px. Existing suite also checks narrow 320px screens.
- Print button invocation and unchanged storage checked; Chromium print media checked with one completed task and its completion count, no navigation/actions, and visible unreviewed disclaimer.
- Screenshots inspected for desktop/mobile and print layout. They use isolated synthetic test guides/review dates, **not live published content or new human review records**. Full-page mobile captures show the fixed navigation at the original viewport edge; the page has scroll clearance beneath it.
- No backend, original prototype, assets/logo or deployment configuration changes. No schema migration, staging publication, merge or deployment.

Not run: actual OS print-dialog/PDF-save interaction, physical printing, real iPhone Safari, assistive-technology user testing, local PostgreSQL/container checks, human content/translation reviews, usability sessions or deployed update/rollback. PDF availability depends on the browser/OS. Existing CI remains the PostgreSQL/container/policy gate. Prior sprint editorial/device/recovery follow-ups remain open.

## Review captures

- [First-week desktop](screenshots/journey-ux/firstweek-1440.png)
- [First-week mobile](screenshots/journey-ux/firstweek-390.png)
- [First-week tablet](screenshots/journey-ux/firstweek-768.png)
- [Pre-departure desktop](screenshots/journey-ux/predeparture-1440.png)
- [Pre-departure mobile](screenshots/journey-ux/predeparture-390.png)
- [Print media layout](screenshots/journey-ux/print-layout.png)
