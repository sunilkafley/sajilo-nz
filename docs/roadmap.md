# Delivery roadmap

Updated 5 October 2026 (New Zealand), following the user's decision to start Explore while content is refined. Sprints describe delivery increments; no calendar deadlines or unperformed acceptance outcomes are implied.

| Increment | Outcome | Status and next step |
| --- | --- | --- |
| Sprint 4 | Free HTTPS staging and recovery baseline | Closed. Preserve [closure evidence](sprint-4.md) and [recovery limitations](recovery-drill.md). |
| Sprint 5 | Useful reviewed bilingual pre-departure journey | 5A merged in PR #8 at `4a0c92e`. Human publication, remaining device checks, 2–3 structured sessions and housekeeping remain open. |
| Sprint 6 | Explore discovery page, topic browsing and one useful city journey | 6A merged in PR #9 at `4651e1a`. [6B topic browsing](sprint-6.md) implemented for review; 6C one city follows a user choice. Each is a small reviewable PR. |
| Sprint 7 | Arrival essentials | Planned next: arrival guide, first-week checklist and links to practical resources. Define task IDs, acceptance and reviewed content before implementing. |
| Later | Housing/budget tools, study/course discovery, jobs and community | Order and scope depend on usability findings, source availability and editorial capacity. No live catalogues, directories or events are promised. |

## Two work streams

Engineering proceeds with Sprint 6 while Sunil coordinates Sprint 5's human work. This is an explicit sequencing change, not Sprint 5 closure. A content polish cycle can continue after an increment, but every published revision and translation still requires an official source and recorded human review. Unreviewed drafts stay unpublished. Merging a code PR is not content approval.

Carry forward the detailed records in [Sprint 5](sprint-5.md): the proposed three-topic English/Nepali pilot set; Safari model/iOS/mode and remaining per-case outcomes; 2–3 consenting anonymous usability sessions; private backup size/hash/retention and restore-database cleanup confirmation; migration/rollback compatibility before any future schema-changing release. None becomes a pass by starting another sprint. Reproduced data-loss, misleading publication/offline state or essential accessibility blockers take priority over new features.

## Delivery rules

Keep React + TypeScript + Vite, Django REST and PostgreSQL, the existing design, guest access, offline guides and browser-local progress. Reuse free Render/Neon hosting; keep automatic deployment off. Preserve the prototype as reference. No new accounts, paid hosting, personal records or fabricated verification dates.

For each slice: branch from current merged main, define observable acceptance, implement and run required checks, open a small PR, then await user review. Merge and deployment are separate decisions. Human checks remain pending until actually performed. Source/translation publication approval is separate from technical PR review. Sprint closure must state any explicitly accepted deferrals.
