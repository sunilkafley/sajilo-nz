# Home — Start exploring follow-up

6 October 2026 (New Zealand). User requested six discovery cards below the Home hero after reviewing and merging Sprint 7A. Base: PR #13 merge `8c52f6182bba29c1f246d2973319db6f762af90c`. Branch: `codex/home-start-exploring`. Status: implemented for PR review, not deployed or editorially published.

## Layout and availability

Hero → Start exploring → existing personalised next steps → Budget and Emergency Help → existing planned tools and saved preview. The six cards use two columns below 900px and three from 900px, preserving the prototype theme. They reuse line icons and a typed feature catalogue outside the UI. Home still derives next steps from actual browser-local pre-departure progress; no new personalisation or journey selection is claimed.

| Card | Honest current destination |
| --- | --- |
| Study & Courses | Planned; no course/institution/fee catalogue or dead control |
| Work & Careers | Planned; no job listings or employment advice |
| Residence Pathways | Official links only: Immigration New Zealand and Immigration Advisers Authority; no pathway hub or eligibility decision |
| Skills Roadmap | Planned; no skills tracker |
| Life in New Zealand | Existing Christchurch preparation only; wider housing/transport/healthcare/community hub planned |
| Preparing to Arrive | Existing pre-departure and first-week checklists, explicitly not yet reviewed |

Budget opens and focuses the existing `budget` pre-departure task; its calculator remains Planned. Emergency Help directly links to official NZ Police emergency information. External links use the same tab, explicitly require internet and are not promised as saved/offline guidance. No emergency number, triage instructions, medical/legal advice or immigration requirements are copied into the app. Sajilo NZ explicitly states that it is not an emergency service and reviewed in-app emergency guidance is unavailable.

Official destinations researched on 6 October (technical source inspection, **not** human publication review): [Immigration Advisers Authority — For migrants](https://www.iaa.govt.nz/for-migrants/), [NZ Police — 111 Police Emergency](https://www.police.govt.nz/contact-us/111-police-emergency), plus the existing [Immigration New Zealand](https://www.immigration.govt.nz/) source. These are resource/navigation labels, not newly reviewed guides. Human wording/link suitability and translation review remain pending; no reviewer or verification date is invented. Any future in-app emergency or residence guidance must go through official-source and recorded human-review gates.

## Observable acceptance and actual evidence

1. Exactly six cards in requested order, clear icons/descriptions and availability; no interactive controls for the three Planned cards (component and browser tests).
2. Discovery is the hero's immediate next section; personalised next steps follow immediately (component DOM-order assertions). Existing progress, storage warnings and saved-body exclusion regressions pass.
3. Grid has two columns at 320/768px and three at 1440px, with no horizontal overflow (computed-style/browser checks). Desktop and 320px screenshots inspected; outputs remain ignored.
4. Budget link works by keyboard and focuses the existing task. Its progress survives offline Home refresh; Preparing to Arrive opens the first-week planner offline after readiness (browser tests).
5. Emergency/IAA/INZ URLs are labelled external/online, exact official URLs tested; no automatic external navigation or simulated live catalogue. Actual phone/emergency interaction is not tested or claimed.

Validation: `npm run check` passed; `npm test` passed (6 prototype + 58 frontend/domain); `npm run test:e2e` passed (46 desktop/mobile Chromium, production build and isolated synthetic Django API). `git diff --check` passed. Local Django unit/PostgreSQL, migration/container/deployment-policy, deployed update/rollback, real Safari and human acceptance were not run for this frontend-only follow-up. Quality CI remains the PostgreSQL/container/policy gate; record its actual result in the PR.

No backend/schema/API/source-allowlist/storage-format/dependency, prototype or hosting changes; no new personal data or accounts. No merge, deployment, staging seed or publication by this task. Sprint 5 human reviews, remaining Safari cases, 2–3 usability sessions, recovery housekeeping and 6C saved-copy source-host update/rollback compatibility retain their open status. Sprint 7B–7D remain planned as recorded in [Sprint 7](sprint-7.md).
