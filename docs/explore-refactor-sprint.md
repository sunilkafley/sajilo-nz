# Explore refactoring sprint — engineering first

Scope confirmed by Sunil on 13 October 2026 (Pacific/Auckland). Target: readiness for an owner-approved release over 17–18 October 2026. This is a target, not a guarantee or deployment authorization. PR #19 is merged; the planning branch starts from merged main. Implementation and acceptance are pending.

## Outcome and boundaries

Deliver the full Explore experience in one coordinated sprint, with small reviewable PRs. Content population and human review follow engineering, topic by topic. Do not interpret this sequence as permission to publish unreviewed material or copy prototype examples into production.

Preserve the approved production logo, header, mobile bottom navigation, stack, guest access, stable checklist identifiers/storage, saved guides and offline behaviour. Use the Sites prototype as the reference for topic-specific experiences, not as evidence of publication approval. Do not modify the preserved prototype or restore its obsolete account/profile shell.

Required coverage: Study & courses; Immigration; Prepare to travel; Arrive & settle; Housing & flatting; Money & budgeting; Work & careers; Community; Nepal services; Travel & transport; Student support; Education system; the six Get to know Aotearoa introductions; city information with Christchurch as the first pilot. The homepage retains six featured entry points, not a limit on Explore topics.

## Engineering slices and observable acceptance

| Slice | Scope | Acceptance before handoff |
| --- | --- | --- |
| A — Editorial foundation | Django-managed topic content and structured resources; secure preview and publication workflow | Sunil can create, edit, preview, review, publish and withdraw each supported record in admin. Anonymous users cannot retrieve drafts through list, detail, filters or search. Content edits invalidate their review. Synthetic fixtures stay isolated. |
| B — Explore and information pages | All required topic routes, Aotearoa introductions and city navigation; connect homepage cards | Each topic has an appropriate layout and meaningful destinations, language-aware loading/empty/error states, and renders only eligible published content. No fake links or production sample records. Existing URLs remain valid. |
| C — Study and education | Course catalogue, details, filters, local shortlist/comparison; qualification information | Filters derive from published records; unpublished courses cannot leak through details or comparison. Saves survive refresh, handle storage failures and do not touch checklist keys. No fees/intakes invented. |
| D — Practical living and work | Housing/consular expandable information; transport/support resources; budget calculator; career and immigration hubs | Layouts match the topic purpose. Budget arithmetic, weekly/monthly conversion and invalid input are tested; defaults are not claimed as city averages. No eligibility calculator. Interactive planning remains in Journey, linked contextually. |
| E — Community and places | Organisations, events and business directory; location/type filters; Christchurch pilot | Structured records distinguish official guidance, third-party organisations and commercial listings. No fictional entries, geolocation requirement, endorsement claims or community checklists. Locations remain extensible beyond Christchurch. |
| F — Integration and release readiness | Search/filter integration, responsiveness, admin handover, regressions and release checklist | Required automated checks pass with evidence; manual checks retain actual outcomes. Owner reviews the release candidate and remaining limitations before any merge/deployment. |

A supplies the publication boundary needed by subsequent slices. B can establish presentation while A is under review. C–E reuse A rather than inventing separate publication rules. F is continuous regression work plus a final checkpoint. All slices are in this sprint; none is silently dropped to meet the target.

## Editorial architecture and safeguards

Current guides support only two journey stages and a small official-source host allowlist. Do not overload checklist IDs or stages to represent unrelated topics, courses or businesses. Keep existing Guide API/storage contracts intact; add topic/resource capabilities through additive, reviewed models/endpoints as needed.

- Reuse the existing explicit human-review policy: drafts by default, samples never published, actual reviewer/date/next-review required, separate language review and review invalidation after material content changes.
- Keep content (headings, descriptions, article sections, sources, course attributes and directory details) editable in Django admin. Presentation and calculator business rules remain tested code, not admin-supplied executable markup.
- Use appropriate structured records for articles, courses and directory entries, with reusable editorial validation. Specify the concrete schema and migration compatibility in slice A before editing models; avoid an unrestricted page-builder or arbitrary HTML/JavaScript.
- Preview drafts only for authenticated staff with the appropriate model permission. Preview responses must be non-cacheable and must not enter public search, saved-guide storage or service-worker caches. Test anonymous and insufficient-permission requests.
- Public APIs must independently enforce publication checks. Hiding a link in React is not access control. Validate external URL schemes/hosts and source provenance; do not weaken the existing guide source allowlist to admit arbitrary commercial links.
- Commercial/provider/community sources need a distinct attribution policy; a directory listing is not government guidance. Actual records remain unpublished until that policy and human review are satisfied.
- Record editorial changes through Django admin history. Provide clear draft/published status, topic/language filters, review fields and a documented withdraw/re-review procedure. Do not add a publish-all shortcut bypassing validation.
- Nepali content requires its own review. Show an explicit unavailable translation or labelled opt-in English alternative, never silently treat English as Nepali. Preserve route/filter context.
- Use no visitor accounts, unnecessary personal data, remote checklist progress, paid services or third-party search platform.

## Acceptance and testing

For every code PR: define its observable criteria before editing; run `npm run check`, `npm test`, `npm run build`, affected Django tests, migration drift checks and applicable Playwright tests. Record exact passed/failed/not-run outcomes. CI must check PostgreSQL compatibility; SQLite alone is insufficient evidence for the deployment database.

Cover publication/withdrawal and language rules, staff-only preview, malicious URLs/unsafe content, topic and resource filters, no duplicate search results, course shortlist/comparison storage failures, budget calculations, keyboard focus, existing checklist reset/persistence and saved-guide offline/withdrawal behaviour.

Capture desktop/mobile evidence at 390, 768, 1280, 1440 and 1920px: no horizontal overflow, readable content, active navigation, accessible labels, safe-area bottom navigation and unobscured checklist controls. Chromium mobile emulation is not real Safari acceptance.

Before release, Sunil tests admin editing/preview/publication on an approved test environment and real iPhone Safari. Never publish synthetic fixtures to production for testing. Existing Sprint 5 device/usability and recovery follow-ups remain tracked; no unperformed check becomes passed by completing this sprint.

## Weekend release gate

Engineering-complete means tested capabilities ready for editorial use. It does not mean every topic is populated or reviewed. After engineering, review each slice's content in admin, check the public result and separately approve translations.

If content is incomplete, Sunil explicitly chooses whether to release a limited reviewed-content version with truthful unavailable states or postpone release. Do not call an empty directory a complete information repository. Security, publication leaks, lost progress and essential accessibility failures block release regardless of the date.

Any schema-changing deployment requires a private backup, isolated restore/migration test, code/schema compatibility assessment and safe rollback plan. The historical same-commit rollback drill is not sufficient for a new schema. Keep automatic deployment off; merge, content publication and deployment are separate owner approvals.

## Status

- Planning: recorded. [Slice A editorial foundation](editorial-foundation.md) merged in PR #20; [Slice B topic pages](explore-topic-pages.md) merged in PR #21. Article admin usability merged in PR #22, per owner confirmation. [Slice C study/course discovery](study-course-discovery.md) is implemented for review on `codex/study-course-discovery`; D–F remain pending.
- Slices C and D merged in PRs #23/#24 per owner confirmation. [Slice E community and places](community-directory.md) is implemented for review on `codex/community-directory`; F remains pending. This supersedes the earlier C–D status above.
- Editorial content/translation review: deferred until engineering, as requested; publication remains gated.
- Slice A automated checks and screenshots: recorded in its evidence document. Real-device testing and owner admin acceptance remain pending; no acceptance of later slices is implied.
- Release and deployment: not authorized or performed.

Planning-only baseline checks on 13 October 2026: `npm run check` passed; `npm test` passed (6 prototype and 82 frontend tests); `git diff --check` passed. Build, Django tests, browser tests and screenshots were not run for this documentation-only change. These baseline results do not establish acceptance of the planned features.
