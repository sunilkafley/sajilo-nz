# Delivery roadmap

Updated 6 October 2026 (New Zealand), following PR #13's merge and the user's Home discovery layout request. Sprints describe delivery increments; no calendar deadlines or unperformed acceptance outcomes are implied.

| Increment | Outcome | Status and next step |
| --- | --- | --- |
| Sprint 4 | Free HTTPS staging and recovery baseline | Closed. Preserve [closure evidence](sprint-4.md) and [recovery limitations](recovery-drill.md). |
| Sprint 5 | Useful reviewed bilingual pre-departure journey | 5A merged in PR #8 at `4a0c92e`. Human publication, remaining device checks, 2–3 structured sessions and housekeeping remain open. |
| Sprint 6 | Explore discovery page, topic browsing and one useful city journey | 6A/6B merged in PRs #9/#10; Christchurch 6C merged in PR #11 at `db0d340`. City publication review remains pending. |
| Sprint 6D | Prototype-style Home dashboard | Merged in PR #12 at `4c3f2f8`: actual checklist progress/next steps, saved bookmarks and Christchurch card. Unimplemented tools stay Planned; no copied example announcements/events. |
| Sprint 7 | Arrival essentials | [7A](sprint-7.md) merged in PR #13; Home discovery merged in PR #14 at `01ace79`. 7B arrival guide journey implemented for review with unpublished English/Nepali drafts. Next: explicit Home journey choice (7C) and human validation (7D). Arrival publication/compatibility gates remain open. |
| Later | Housing/budget tools, study/course discovery, jobs and community | Order and scope depend on usability findings, source availability and editorial capacity. No live catalogues, directories or events are promised. |

## Two work streams

Engineering proceeds with Sprint 7 while Sunil coordinates Sprint 5's human work. This is an explicit sequencing change, not Sprint 5 closure. A content polish cycle can continue after an increment, but every published revision and translation still requires an official source and recorded human review. Unreviewed drafts stay unpublished. Merging a code PR is not content approval.

Carry forward the detailed records in [Sprint 5](sprint-5.md): the proposed three-topic English/Nepali pilot set; Safari model/iOS/mode and remaining per-case outcomes; 2–3 consenting anonymous usability sessions; private backup size/hash/retention and restore-database cleanup confirmation; migration/rollback compatibility before any future schema-changing release. None becomes a pass by starting another sprint. Reproduced data-loss, misleading publication/offline state or essential accessibility blockers take priority over new features.

## Delivery rules

Keep React + TypeScript + Vite, Django REST and PostgreSQL, the existing design, guest access, offline guides and browser-local progress. Reuse free Render/Neon hosting; keep automatic deployment off. Preserve the prototype as reference. No new accounts, paid hosting, personal records or fabricated verification dates.

For each slice: branch from current merged main, define observable acceptance, implement and run required checks, open a small PR, then await user review. Merge and deployment are separate decisions. Human checks remain pending until actually performed. Source/translation publication approval is separate from technical PR review. Sprint closure must state any explicitly accepted deferrals.
