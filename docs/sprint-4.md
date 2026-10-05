# Sprint 4 — staging and pilot validation

Started 2 October 2026 (New Zealand). Status: closed on 5 October 2026 (New Zealand), with follow-up work recorded below.

## Acceptance evidence
- Live URL: https://sajilo-nz-staging.onrender.com/
- PR #4 merged into main at `f0bf8b35111060903433c06e9232c86259f625c4`. Render screenshots confirmed this commit; rollback target `dep-davhinnavr4c73c2047g`.
- Assistant observed HTTPS 200 responses from the homepage, `/api/health/`, guides API and admin login on 2 October. Health returned `{"status":"ok"}`.
- User screenshot confirmed remote superuser creation succeeded; subsequent screenshots showed the authenticated guide editor. Windows certificate workaround is recorded in docs/render-neon.md.
- User confirmed the reviewed NZTD guide appears in the app.
- User reported "iphone Test is pass" after the seven-step Safari protocol: save guide, complete linked task, refresh, enable airplane mode with Wi-Fi off, refresh/open saved guide, reconnect. Record this as user-reported success, not an independently observed device run.
- User reported "The usability is fine. They are okay with the app." Initial pilot feedback: no issues reported. Participant count, demographics, task timings and assistance were not supplied; do not infer 2–3 completed sessions.
- On 5 October, the user completed the backup/isolated restore and same-commit Render rollback drills. Screenshot comparisons matched 1 guide, 1 user and 19 migrations, including their full-record fingerprints. See docs/recovery-drill.md.
- Render showed rollback succeeded and Live at 14:33:05 NZDT on 5 October, duration 31 seconds. User confirmed health, published guide, admin login and iPhone checklist persistence after refresh all passed.
- User requested "Let's close this sprint" after recovery verification. Sprint closed as an accepted staging increment with incomplete original-plan items carried forward explicitly below.


## Where the prototype implementation stands
The project has a working pre-departure journey in React/TypeScript and Django REST, backed by PostgreSQL in CI. It is an early functional MVP, not the complete original prototype or a production release.

| Slice | Evidence/status |
| --- | --- |
| Sprint 1: React shell and 27-task checklist | Implemented and merged; completion persists in browser storage |
| Sprint 2: reviewed English/Nepali guides, Django admin/API and guide-to-task links | Implemented and merged; user confirmed reviewed-publication journey |
| Python alignment | Python 3.14.8 pinned; Windows installation and backend tests confirmed by user |
| Sprint 3: search, bookmarks and saved-guide offline access | PR #3 merged; 61 automated tests passed on final revision |
| Real iPhone on home Wi-Fi | User confirmed it opens and works; detailed per-task results and iOS version not yet recorded |
| Real iPhone offline refresh via HTTPS | User reported saved-guide reading and checklist persistence passed on staging |
| Full prototype coverage | Arrival, housing, study, jobs, community, courses, budgeting and other journey stages remain backlog; full interface translation and reminders are not implemented |

## Sprint goal
Make the existing pre-departure journey available on a stable HTTPS staging URL and validate it with an actual iPhone and 2–3 consenting Nepalese students.

## Work slices
- 4A, completed: opt-in staging configuration and validation; reliable Windows preview commands; deployment runbook and pilot protocol.
- 4B, deployed; recovery verification passed: configure separate staging resources, same-origin frontend/API routing, TLS, static assets, secrets, backups and release/rollback steps. User selected free tiers and created Render/Neon accounts. Target Singapore and a Render-provided hostname; use docs/render-neon.md.
- 4C, human editorial work: review a small English/Nepali guide set against official sources; record reviewer and actual verification dates. No automated publication or fabricated review dates.
- 4D, device and pilot work: complete the protocol below; log issues and fix reproducible blockers with regression tests.

## Device acceptance record
Record date, release commit, staging URL, iPhone model, iOS version and Safari normal/private mode. Use normal mode for the acceptance run. Do not assume installation as a Home Screen app is supported; manifest/install experience is outside this slice.

| Test | Expected outcome | Actual result |
| --- | --- | --- |
| Portrait/landscape, keyboard and text zoom | Navigation, search, cards and task controls remain readable and usable without clipped controls | Pending |
| Search matching and absent words | Correct results and clear empty state | Pending |
| Language switching | No unreviewed or missing-language fallback | Pending |
| Save guide then refresh Safari | Bookmark remains | User-reported pass, 2 October |
| Wait for offline readiness; save guide; airplane mode with Wi-Fi explicitly off; refresh | Saved body and original dates remain, with offline-copy warning | Offline reading user-reported pass; dates/warning not separately confirmed |
| Follow task offline; complete; refresh | Completion remains checked | Online completion survives refresh/offline reported; changing completion while offline not separately confirmed |
| Open an unsaved guide offline | Clear unavailable state, no invented cached content | Pending |
| Remove a saved guide offline; refresh | Copy stays removed | Pending |
| Reconnect after an editor returns a test guide to draft | Successful publication check removes cached body; bookmark is removable | Pending |
| Staging app update | Close old tabs and reopen online; new release loads; existing saved copies and progress survive | Pending |

Keep the same HTTPS hostname throughout. Laptop-local data and iPhone data are independent. If a check fails, record the steps, expected/actual result and a screenshot without personal data.

## Pilot protocol (20 minutes per participant)
Ask permission to observe and record anonymous notes. Use participant codes P1–P3; no passport numbers, visa documents or other personal records. Do not contact or invite participants automatically.

Give tasks without explaining where buttons are: find a guide about documents; identify its official source and review date; save it; follow a task and complete it; return after a refresh; find the guide offline. Observe hesitation, mis-taps, reading difficulty and whether offline warnings are understood. Ask: "What was unclear?" and "What would you expect to do next?"

Record each task's success/failure, assistance needed, approximate time and participant wording. Collect English/Nepali preference. Prioritize lost data, misleading publication/review states and inaccessible controls as blockers. Record lesser wording/layout improvements separately.

## Original definition of done (not all items evidenced)
- Stable HTTPS staging environment and release/rollback procedure verified, with database backup/restore checked.
- Full required CI checks pass on the release commit.
- Device record completed, including actual offline refresh on iPhone Safari.
- Human-reviewed pilot content available; original dates and source attribution preserved.
- 2–3 pilot sessions completed, issues triaged and blockers resolved.
- User accepts the increment: confirmed in conversation. Other outcomes retain their evidence status above.

## Closure decision and follow-up backlog
Sprint 4 is closed at the user's request on 5 October 2026. The delivered increment is a working free-tier HTTPS staging MVP with reviewed content, user-reported iPhone/offline acceptance, verified database recovery and a successful same-commit platform rollback. This is not a claim that every original definition-of-done item passed or that the full product is production-ready.

Carry these incomplete items into the next planning session; do not count them as passes:
- Complete the detailed device cases still marked Pending above, including withdrawal of a cached guide, unsaved/removed offline content, accessibility, search and language checks. Capture iOS version and Safari mode.
- Record 2–3 structured, consenting pilot sessions with anonymous task results; current feedback has no participant count or timings.
- Expand the human-reviewed English/Nepali guide set; only the published NZTD guide is evidenced here.
- Record private backup size/hash and retained-copy details; remove the disposable restore database when no longer needed. These housekeeping steps were not evidenced.
- Before a future schema-changing release, test migration/rollback compatibility. Today's drill used the same commit on both deployments.

No new application deployment is required for this documentation closeout. Staging remains on `f0bf8b35111060903433c06e9232c86259f625c4`.
