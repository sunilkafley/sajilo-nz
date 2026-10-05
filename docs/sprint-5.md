# Sprint 5 — a useful pre-departure journey

Planning opened 5 October 2026 (New Zealand); approved in merged PR #7 (`4d05b1c`). Status: Sprint 5A engineering ready for PR review; editorial review and human acceptance work remain pending.

Planning branch: `codex/sprint-5-predeparture-plan`, based on `8c59cdf` (PR #6, Sprint 4 closure). PR #7 prepared the plan and proposed slice 5A; it did not implement or publish that slice.

Implementation branch: `codex/sprint-5a-travel-documents`, based on PR #7. Slice 5A expands the two create-only draft starters, adds the [human review packet](content/travel-documents-review.md), and tests preservation of editorial records and the Nepali online/offline journey. All review metadata stays unset on new drafts; no publication, deployment, real-device pass or completed human review is claimed.

Local engineering checks on 5 October: `npm run check` passed; `npm test` passed (6 prototype + 27 frontend); Django system/migration-drift checks and 16 guide tests passed using Python 3.14.8 with isolated SQLite; `npm run test:e2e` built the production frontend and passed 18 desktop/mobile Chromium tests. The initial browser attempt could not launch because the matching Chromium executable was missing; after installing it, all 18 passed. All ten draft body paragraphs were compared against the review packet and matched. PostgreSQL integration and deployment/container checks were not run locally; their CI results belong in the PR. Human A3/A6 review, Safari acceptance and usability sessions remain pending.

## Baseline and goal

Sprint 4 is closed. Its [acceptance record](sprint-4.md) and [recovery drill](recovery-drill.md) remain the historical evidence. Staging is recorded as running `f0bf8b35111060903433c06e9232c86259f625c4` at <https://sajilo-nz-staging.onrender.com/>. The documentation merge is not a new deployed release. Backup/isolated restore and same-commit Render rollback passed; compatibility with a different schema has not been demonstrated.

Goal: a guest can find understandable, reviewed pre-departure guidance in English or Nepali, identify its official sources and actual review dates, save it, follow a linked checklist task, and return to both guidance and progress offline.

Keep React + TypeScript + Vite, Django REST Framework and PostgreSQL. Preserve the current visual design, guest access, stable checklist IDs, browser-local progress and saved-guide/offline behaviour. Keep `prototype/` unchanged. Use existing Render Free and Neon Free resources under the [hosting runbook](render-neon.md); no paid services or new hosting are needed. Automatic deployment stays off. Merge and deployment require Sunil's review and approval.

## Code audit

- `backend/guides/models.py` and `admin.py` require an official source and human reviewer/date metadata for each published language. Content changes must be saved as drafts and clear the previous review. Samples cannot publish.
- `backend/guides/management/commands/seed_drafts.py` supplies travel-documents starters in English and Nepali, and an English packing/biosecurity starter. It creates missing rows only and preserves existing content. Starters are not evidence of reviewed or live guidance.
- `frontend/src/features/guides/` supports language-specific search, source/review display, guide-to-task links and saved copies. Unavailable Nepali guides do not silently fall back to English.
- `frontend/src/features/checklist/` owns checklist rules and persistence. The service worker caches the application shell separately from guide copies. Saved copies preserve review dates and warn when publication status cannot be checked.
- Automated tests cover publication gates, separate language review, failed storage writes, offline completion and withdrawal reconciliation. Playwright's mobile project uses Chromium emulation; it does not establish real iPhone Safari acceptance.
- Sprint 4 evidences one published NZTD guide. Its Nepali publication status and additional live content must be inspected by the editor; do not infer them from code or seed data.

## Work slices

| Slice | Deliverable | Completion evidence |
| --- | --- | --- |
| 5A — proposed first implementation | One useful travel-documents guide pair prepared as unreviewed English/Nepali drafts, with source-to-claim review packet and focused regression coverage | Reviewed small PR and passing tests; separate human approval for each language before publication |
| 5B — reviewed pilot set | Proposed three-topic set: travel documents, packing/biosecurity and NZTD, each in English and Nepali | Editor confirms actual records, official sources, reviewer and real verification/next-review dates for all six language records |
| 5C — device acceptance | Complete outstanding Safari cases below against an approved release and reviewed content | Actual results with device/release context; regression tests and retesting for reproduced blockers |
| 5D — usability | Observe 2–3 consenting Nepalese students completing the journey | Anonymous task outcomes, assistance, timings, language preference and triaged findings |
| 5E — recovery follow-ups | Finish private backup housekeeping; assess compatibility before schema-changing releases | Owner confirmation; compatibility evidence if applicable |

Sunil coordinates human source/translation review, device checks and participant consent. Reviewer availability and session dates remain to be arranged. Engineering prepares drafts/tests and fixes reproduced issues. Run sessions after the reviewed pilot set and essential device checks are ready. Arrival, housing, study, jobs, courses, community, full interface localisation, accounts, sync, reminders and installability remain outside this sprint.

## First small implementation proposal: 5A — travel documents in both languages

Use the existing `travel-documents` slug and checklist IDs `passport`, `visa`, `offer` and `document-copies`. Turn the short starters into a concise preparation guide, a separately reviewable Nepali translation and a review packet. Verify relevant official pages during that work and record precise page links for each substantive claim. This plan supplies no immigration requirements or newly verified content.

Proposed changes for a follow-up implementation PR:

1. Improve only the two travel-documents entries in `backend/guides/management/commands/seed_drafts.py`. Keep new records as drafts with reviewer/date fields unset. Preserve create-only behaviour: rerunning must leave existing draft and published records unchanged. Do not run the command against staging as part of implementation.
2. Add `docs/content/travel-documents-review.md` containing English text, Nepali draft, source-to-claim mapping, linked task IDs and separate pending review records. Label both versions unreviewed. A fluent Nepali reviewer checks meaning, terminology and readability against the reviewed English and official sources. Translation, source fetching and passing tests do not constitute human review.
3. Extend `backend/guides/tests.py` for draft creation and preservation of published records/review dates. Extend isolated fixtures and journeys in `backend/e2e_server.py` and `frontend/e2e/guides.spec.ts` for a published Nepali guide as well as an unavailable translation; cover the Nepali saved/offline journey in `frontend/e2e/saved.spec.ts`. Fixture text stays synthetic and isolated from editorial databases.
4. After review, the editor applies approved text to any existing record through the admin as a draft, then records an actual review in a separate save. Editing a published guide temporarily withdraws it; coordinate that explicitly. Repository changes do not update existing database content or approve publication.

No migration, new endpoint, storage format change, navigation redesign or dependency is expected. Keep any new business rules in feature/domain modules rather than UI components. If research requires another official host, review that specific host and update backend/frontend validation with tests in a separately scoped change; do not weaken URL validation.

### Observable acceptance criteria

| ID | Expected observation | Evidence |
| --- | --- | --- |
| A1 | Fresh seed creates both travel-documents languages as drafts without reviewer/dates; neither appears in public list/detail responses | Django tests |
| A2 | Repeated seed preserves edited drafts and published versions, sources and review metadata | Django tests |
| A3 | Publishing English alone leaves Nepali unavailable; independently reviewed Nepali becomes public | Django/admin/API tests; separate actual editor review records |
| A4 | A guest selects Nepali, finds/reads the guide, sees original dates/sources, saves it, follows Passport and retains completion after reload | Synthetic browser integration; later human acceptance with reviewed content |
| A5 | After readiness and saving, offline refresh shows the saved language and warning; task changes survive refresh; review dates remain unchanged | Existing offline regressions plus Nepali coverage; Safari evidence separately |
| A6 | The packet maps substantive claims to current official pages and records English/Nepali review decisions independently | Human review pending; no invented reviewer/date values |

Engineering completion requires A1–A5 automated checks and a ready review packet. Public-content completion also requires A3/A6 human evidence and explicit publication approval. Neither is claimed by this planning PR.

## Editorial records

Proposed target: three topics in two languages. Confirm scope/source suitability during review; do not publish drafts to satisfy a count. The checklist retains its unreviewed notice until separately reviewed.

For each topic/language record: slug, exact text revision, official page URLs, claims checked, reviewer identity in the private editorial/admin record, actual verification date, next review date, decision and unresolved corrections. Translation review must identify the English revision it follows. If English meaning changes later, reassess the translation explicitly: the current model does not automatically invalidate the other language's review. Do not copy English approval dates into Nepali by default.

| Topic | English baseline | Nepali baseline | Sprint 5 status |
| --- | --- | --- | --- |
| Travel documents | Repository starter draft | Repository starter draft | Separate reviews pending |
| Packing/biosecurity | Repository starter draft | No repository starter | Separate drafts/reviews pending |
| NZTD | One published guide evidenced in Sprint 4; editor to confirm language/current record | Separate publication not evidenced | Inspect existing record; preserve actual metadata; review changes separately |

Keep reviewer identities, credentials, admin records and personal participant details out of the repository. Public progress notes can reference private evidence without copying those records. Never use a build, deployment or planning date as a verification date.

## Device follow-ups carried from Sprint 4

All cases below are pending Sprint 5 evidence. Preserve earlier user-reported successes in Sprint 4 without expanding them into unobserved passes. For each run record actual date/time, HTTPS URL, Render release commit, iPhone model, iOS version, Safari version if available, normal/private mode and guide language/revision. Use normal Safari for acceptance. Record steps, expected/actual result and pass/fail/blocked/not run, with redacted reproduction evidence for failures.

| Case | Expected result |
| --- | --- |
| Portrait/landscape, keyboard, text zoom | Navigation, search and task controls remain readable and usable without clipping |
| Matching/absent search words in each published language | Correct results and clear empty state |
| Language switching, including unavailable translation | Reviewed selected language only; clear unavailable state without fallback |
| Save each language; refresh Safari | Correct saved copies remain independently |
| Wait for readiness; airplane mode with Wi-Fi off; refresh saved guide | Body, original verification/next-review dates and saved-copy warning remain; official links need connectivity |
| Follow a task offline; change completion; refresh | New completion state persists |
| Open an unsaved guide offline | Clear unavailable state; no invented content |
| Remove saved guide offline; refresh | Copy remains removed |
| Reconnect after editor withdraws a saved test guide | Successful publication check removes body and leaves a removable bookmark |
| Approved application update on the same HTTPS origin | Close old tabs, reopen online, observe actual new release; saved copies and progress survive |
| Natural free-tier cold start and retry | Understandable loading/failure; retry recovers; checklist and saved copies remain usable |

Withdrawal testing needs an explicitly approved, human-reviewed disposable guide; never publish a synthetic fixture or withdraw the sole useful live guide for a test. Coordinate with the editor. The update case stays pending until a separately approved application deployment exists; documentation merges and same-commit rollbacks do not satisfy it. Do not create keepalive traffic or change hosting tiers for testing.

## Structured usability sessions

Arrange 2–3 sessions of about 20 minutes after consent to observation and anonymous notes. Use P1–P3. No automatic invitations, recordings, passport/visa documents or personal records. Participants use test checklist actions and choose English/Nepali; aim to include a Nepali session and record actual language coverage.

Give tasks without naming buttons: find the travel-documents guide; explain its official source and review date; save it; follow/complete a linked task; return after refresh; find/read the guide offline; explain the offline warning. Ask “What was unclear?” and “What would you expect to do next?”

For each task record success/partial/failure/not run, assistance, approximate elapsed time, hesitation/mis-taps and optional anonymous wording. Record device, release, guide language/revision and consent status for each session. No sessions are recorded complete yet:

| Participant | Consent/date | Device/release/language | Task results, time and assistance | Findings |
| --- | --- | --- | --- | --- |
| P1 | Pending | Pending | Not run | Pending |
| P2 | Pending | Pending | Not run | Pending |
| P3 (optional third) | Pending | Pending | Not run | Pending |

Treat lost progress, misleading review/publication/offline states and inaccessible essential controls as blockers. Record issues with reproduction steps, expected/actual behaviour, severity and owner. Fix reproduced blockers with regression tests and retest affected tasks. Track lesser wording/layout improvements separately. Sprint 4's general positive feedback does not count toward these structured sessions.

## Recovery follow-ups

- Sunil to record archive size, SHA256 and retained-copy details privately and confirm retention on controlled encrypted storage. Pending; no dumps or sensitive paths in this PR.
- Confirm whether `sajilo_restore_check` still exists and remove only that disposable database when no longer needed, after checking the exact target. Pending owner action; no deletion is authorized by this plan.
- Before a schema-changing release, test forward migration and rollback compatibility against an isolated restored backup and record the code/schema pair. The completed same-commit drill proves platform rollback only. Slice 5A expects no schema changes; reassess if scope changes.

## Checks, PR workflow and completion gates

Use small feature branches and PRs to `main`, retaining the existing `.github/workflows/ci.yml` **quality** check. Run `npm run check` and `npm test` locally and record results/unrun checks in each PR. Implementation PRs also run production build, Django checks/tests, migration-drift check and affected browser journeys. CI additionally verifies PostgreSQL integration, deployment policy, Render/container setup and Chromium browser tests. CI does not perform editorial review, real-device acceptance or usability sessions.

Planning PR #7 changed documentation only. Implementation results are recorded above and in the corresponding PR; identify any checks not run as unrun and do not borrow Sprint 4 results.

Sprint 5 may close when the agreed reviewed English/Nepali pilot set supports the full guest journey, required CI passes on the proposed release, device cases have recorded outcomes, 2–3 structured sessions are evidenced, blockers are resolved/retested, recovery follow-ups are resolved or explicitly accepted as deferred, and Sunil accepts the increment. Any incomplete criterion retains its actual status in the closure decision. No merge, deployment, publication or completed human test is implied by this plan.
