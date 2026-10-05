# Sprint 7 — arrival essentials

Started 5 October 2026 (New Zealand), after the user confirmed PR #12 complete. GitHub confirmed it merged at `4c3f2f83951b3f871232fa6cbc69965478ffe7f0`. Status: **7A implemented for review; Sprint 7 remains open.**

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

Review 7A as a small engineering PR. Next, scope 7B's first arrival guide and explicit task-link contract: the current guide model supports pre-departure only, so arrival content must not be forced into that stage or published with task IDs older clients cannot interpret without compatibility assessment.

Keep [Sprint 5](sprint-5.md)'s human English/Nepali reviews (including travel-document drafts), real Safari model/iOS/mode and remaining per-case outcomes, 2–3 consenting anonymous structured sessions, private backup size/hash/retention and disposable restore-database cleanup confirmation open. Keep [Christchurch human review](content/christchurch-review.md) and [6C update/rollback compatibility](sprint-6.md) open. A merged engineering PR does not satisfy these gates.

Prioritise reproduced data loss, misleading publication/offline states and essential accessibility failures over expansion. Keep React + TypeScript + Vite, Django REST and PostgreSQL, free Render/Neon, guest access and saved/offline behaviour. User review is required before merge or deployment; publication additionally requires official sources and recorded human review for each language.
