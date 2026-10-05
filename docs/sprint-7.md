# Sprint 7 — arrival essentials

Started 5 October 2026 (New Zealand), after the user confirmed PR #12 complete. GitHub confirmed it merged at `4c3f2f83951b3f871232fa6cbc69965478ffe7f0`. Status: **7A merged in PR #13 at `8c52f61`; Home discovery merged in PR #14 at `01ace79`; 7B implemented for review; Sprint 7 remains open.** Both arrival-language reviews and 7C/7D remain pending.

Base: merged PR #12 (`4c3f2f8`). Branch: `codex/sprint-7a-first-week`. Staging remains recorded at `f0bf8b3`; no deployment, publication or staging seed is part of this increment.

## Goal and small slices

A guest can move from pre-departure preparation into a useful first-week journey, open reviewed practical guidance, and keep independent progress and saved guides offline without losing existing data.

| Slice | Outcome | Gate |
| --- | --- | --- |
| 7A — first-week planner | Six stable planning prompts, separate browser-local progress, Home/Explore links and offline shell | Automated acceptance below and user PR review; prompts remain explicitly unreviewed |
| 7B — arrival guidance | Small official-source-backed English/Nepali draft set linked to arrival tasks | First define the arrival stage/API/task-link contract and migration/update/rollback compatibility; human review before publication |
| 7C — journey selection | Explicit guest choice of pre-departure or first-week Home context using real progress | Define persistence/defaults and test both journeys; no automatic stage or eligibility decision |
| 7D — human validation | Reviewed content/translation and actual device/usability evidence | Complete or explicitly defer outstanding gates; merge alone is not sprint closure |

These are increments, not deadlines. Do not combine schema, editorial publication and Home stage selection into one large PR. Housing/budget tools, accounts, live course/community/event directories, global search and full interface localisation remain outside this sprint.

## 7A contract

`/firstweek` is available to guests from navigation, Home and Explore's Arrive & settle category. It uses the existing visual theme and reusable checklist domain/repository/use-case rules, not a new backend or account. Home continues to show the 27-task pre-departure journey; opening first-week planning does not switch it automatically.

| Stable ID | Unreviewed planning prompt |
| --- | --- |
| `arrival-accommodation` | Check accommodation arrival arrangements |
| `arrival-connectivity` | Plan phone and internet access |
| `arrival-transport` | Plan a local journey |
| `arrival-provider` | Contact your education provider about orientation |
| `arrival-support` | Find your provider’s student support contacts |
| `arrival-budget` | Review your first-week budget |

These are generic planning labels, not reviewed practical instructions or legal/provider requirements. The page explicitly says **Last verified: not yet reviewed** and that ticking them establishes neither readiness nor eligibility. No verification date, reviewer, source endorsement or Nepali translation is invented. Human wording review remains pending; reviewed arrival guidance is not implemented by 7A. Links to Christchurch and guides are labelled as existing preparation/pre-departure resources, not newly reviewed arrival content.

Progress uses `sajilo-nz:firstweek:v1` with the existing version-1 shape, independent from `sajilo-nz:predeparture:v1`. It neither imports prototype/pre-departure progress nor reads/writes saved-guide records. Unknown IDs are ignored on decode; corrupt/future-version records are preserved and writes blocked for that session. Failed saves retain in-memory selections and expose retry without claiming persistence. No addresses, phone/account details or personal budget values are collected.

`?task=arrival-budget` (and other known arrival IDs) focuses its checkbox. Unknown or wrong-journey IDs focus the page, not another checklist. Completing all six steps does not select another stage.

No database/API/schema/migration, source-host allowlist, dependency, hosting or prototype changes. The new storage key is additive: earlier clients ignore it. A deployed cross-version update/rollback has **not** been performed. The 6C source-host saved-copy compatibility limitation remains a release gate; the earlier same-commit rollback drill does not satisfy it.

## Observable 7A acceptance

1. Guests reach first-week planning from Home, Explore and navigation, with correct title, active link, keyboard main focus and valid task deep links.
2. The six-task summary reflects only arrival IDs. Checkbox changes survive navigation/reload independently of pre-departure, legacy and saved-guide data.
3. After production app offline readiness, first-week refresh and changes persist offline. Official external resources still require connectivity.
4. Malformed/future-version or denied storage is preserved with session-only warnings; quota failure can retry and then survive reload. No failed write is represented as saved.
5. The page keeps prototype styling and has no horizontal overflow at 320px and 768px. Desktop/mobile screenshots are inspected; Chromium emulation is not real Safari evidence.
6. Unreviewed status is visible, all-complete does not auto-select a stage, and existing guest, guide, language, city, withdrawal and offline regressions remain passing.

## Validation — 5 October 2026

- `npm run check` passed; `npm test` passed: 6 prototype + 56 frontend/domain tests.
- `npm run test:e2e` passed: 44 desktop/mobile Chromium tests, with production build and isolated synthetic Django API. Includes keyboard, independent progress, offline reload, corrupt storage and save/retry cases.
- Generated desktop/mobile first-week screenshots were inspected; test outputs remain ignored.
- No local Django unit/PostgreSQL, migration, container/deployment-policy, deployed cross-version rollback, real Safari or human review/usability checks were performed for this frontend-only slice. Existing quality CI remains the PostgreSQL/container/policy gate; record its actual outcome in the PR.
- No merge, deployment, publication or new human review was performed by this task.

## Carry-forward and next action

Review 7B's implementation and arrival draft packet separately. Next engineering slice is 7C's explicit guest journey choice; 7D's real-device, editorial and usability work can proceed alongside it. Do not use merged code or synthetic fixture reviews as human publication approval.

Keep [Sprint 5](sprint-5.md)'s human English/Nepali reviews (including travel-document drafts), real Safari model/iOS/mode and remaining per-case outcomes, 2–3 consenting anonymous structured sessions, private backup size/hash/retention and disposable restore-database cleanup confirmation open. Keep [Christchurch human review](content/christchurch-review.md) and [6C update/rollback compatibility](sprint-6.md) open. A merged engineering PR does not satisfy these gates.

Prioritise reproduced data loss, misleading publication/offline states and essential accessibility failures over expansion. Keep React + TypeScript + Vite, Django REST and PostgreSQL, free Render/Neon, guest access and saved/offline behaviour. User review is required before merge or deployment; publication additionally requires official sources and recorded human review for each language.

## 7B — first arrival guide journey

Started 6 October 2026 after PR #14 merge. Base: `01ace790b90d71685fdff809ddf421fcad87558f`. Branch: `codex/sprint-7b-arrival-guidance`.

Small slice: first-week local travel in Christchurch, connected to `arrival-transport`. English/Nepali drafts and matching [human-review packet](content/arrival-travel-review.md) use Metro's official Getting started page. Technical research is not human review; dates/reviewer remain unset. No specific fares, routes, timetables, payment methods or service availability are asserted. Create-only seeding preserves existing records. No new official host is added.

### API, navigation and persistence

- Guide `stage` permits `firstweek` as well as existing `predeparture`; stage-specific task IDs are validated on backend and frontend. Cross-journey/unknown IDs are rejected. All existing human-review, independent-language and draft-invalidation gates remain.
- Public list/detail API defaults to pre-departure for old clients. `?stage=firstweek` explicitly opts in; unknown stages return 400. There is no mixed/all-stage endpoint. The frontend rejects wrong-stage responses rather than treating them as successful withdrawal checks.
- `/guides?stage=firstweek` and `/saved?stage=firstweek` preserve stage/language through details, return and saved links, using existing search, review-date, save/offline/error/withdrawal rules. First-week guides have no pre-departure topic selector; incompatible topic context offers recovery. Checklist links use `/firstweek?task=…`. Returning via the checklist's general saved link defaults to English; users choose Nepali again rather than an implied persisted global language.
- First-week copies use **`sajilo-nz.firstweek-saved-guides.v1`**, separate from existing saved storage. Stage switching remounts the guide view to prevent stale bodies/storage state leaking across journeys. Each journey's limit is 50 copies/approximately 1 MB; identities remain language-specific. Home explicitly previews pre-departure bookmarks only and links to first-week saved copies separately; combining journeys is not implemented by this slice.
- Reconciliation uses the complete selected-stage/selected-language catalogue before presentation filtering. API failures use only that journey's valid saved copies with original dates/warnings. Successful withdrawal removes that journey/language's cached body, keeping removable bookmarks; other saved records/progress remain untouched.

### Migration and rollback assessment

`0002_guide_firstweek_stage` changes Django field choices only, not the existing varchar type/default or row contents. Local SQLite `sqlmigrate` reports a no-op, and a migration round-trip test preserves both existing and arrival rows. PostgreSQL execution belongs to quality CI; no staging migration is performed.

An older frontend cannot read arrival task IDs, so arrival copies are never placed in its existing record. Older clients ignore the new key and request the unchanged default API. Older backends ignore the stage parameter and may return pre-departure guides; the new frontend rejects that wrong-stage response and uses valid first-week saved copies with an API warning instead of invalidating them. Rollback makes new arrival functionality unavailable, not data deleted. Never relabel arrival rows as pre-departure or clear storage to make old code appear compatible. Prefer forward migration/compatible rollback code; review downgrade admin validation of retained first-week rows before any reversal.

This is a contract assessment and isolated test evidence, **not a passed deployed update/rollback drill**. Before publication/deployment, test old/new app+API combinations with existing and arrival saved copies, including service-worker update behaviour and an approved rollback target. The outstanding 6C source-host compatibility limitation remains independent. The earlier same-commit Render drill does not prove this case.

### Observable acceptance and validation — 6 October 2026

1. API default excludes published arrival records; opt-in list/detail includes only reviewed selected-language arrival records. Invalid stages/cross-stage links fail; both draft languages remain hidden until separately reviewed (Django tests).
2. A guest navigates from first-week checklist to arrival guides, selects Nepali, reads/saves a guide and follows its real task with keyboard focus. Existing pre-departure guides do not leak into the list (browser tests).
3. Arrival saves do not alter original saved/progress records. Offline reload retains language/body/original review date; a successful withdrawal removes the arrival body and offers bookmark removal, preserving pre-departure storage (desktop/mobile browser tests).
4. Corrupt storage is preserved, wrong-stage payloads/writes rejected, and navigation retains stage. Seeder/packet parity, create-only preservation and human publication gates are tested.
5. Migration backward/forward round-trip preserves all guide row fields in an isolated SQLite test; PostgreSQL and deployed compatibility remain separate checks.

- `npm run check` and `npm test` passed: 6 prototype + 62 frontend/domain tests.
- Django system check and `makemigrations --check --dry-run` passed. Guide tests passed (22, isolated SQLite), including migration round-trip; SQLite migration SQL is a no-op.
- Full browser suite passed (48 desktop/mobile Chromium, production build and isolated synthetic API). Initial new test incorrectly expected Nepali after returning through a language-neutral checklist link; explicitly selecting Nepali resolved the test assumption. No production wording/publication issue was inferred.
- Desktop/mobile synthetic arrival-guide screenshots inspected; generated outputs remain ignored. Diff whitespace check passed.
- Local PostgreSQL/container/deployment-policy, deployed source links/app update/rollback, real Safari and human acceptance were not run. Existing quality CI remains the PostgreSQL/container/policy gate; record its actual outcome in the PR.
- No human approval, publication, staging seeding/migration, deployment or merge performed by this task. Engineering completion does not close 7B's editorial gate or Sprint 7.
