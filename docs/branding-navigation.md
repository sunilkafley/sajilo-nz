# Approved branding and navigation — quick increment

6 October 2026 (New Zealand). Base: merged PR #15 (`b773f892ff4a993e33605ab4ff5d47593ceb07df`). Branch: `codex/approved-branding-navigation`. Scope: branding and navigation only; Sprint 7C journey selection is not part of this increment.

## Supplied approved asset

The user supplied and approved `sajilonz_logo.png`, superseding the earlier logo deferral. Stored unchanged at `frontend/src/assets/sajilonz-logo.png`: 2172 × 724 pixels, 966,632 bytes, SHA-256 `3F38D073A2E5C546E2063076A2BF7FE0EBDCFD8B3BF1F20F1FEB8061567DE1D1`. Source and repository copy hashes match. No redraw, generation, cropping, relettering, recolouring, compression or new variant. The route-shaped S, rounded lettering, colours, compass, fern, kiwi, map and both embedded taglines remain in the original bitmap.

Reusable `SajiloLogo` imports the PNG through Vite, which emits it as a local hashed asset. Existing offline shell build includes all emitted assets, so no new service worker/storage policy is needed. Intrinsic width/height and CSS `height:auto` preserve the 3:1 aspect ratio; white header/background, no filters or cover-cropping. Full logo is placed above the app rather than squeezed into the sidebar. It is at most 432px wide, with fluid phone width. The decorative My journey badge is hidden on phones to avoid shrinking the logo.

The approved taglines are used in accessible image text:

- English: Your New Zealand journey companion
- Nepali: तपाईंको न्युजिल्यान्ड सहयात्री

The visible image always contains both languages. No duplicate tagline is printed immediately beside/below it. Its Home link has a clear accessible name. Logo accessible language follows the existing `lang=ne` guide context; both variants use exactly the same bitmap.

## Audience and navigation

Removed Your student journey and My student space from the app shell. Home/README describe Nepalese students, workers, partners, families and newcomers. Student-specific tasks, guide wording and publication status are unchanged; a broader audience statement does not claim that new partner/worker eligibility guidance exists.

`MainNavigation` reuses the seven existing routes, exact labels and React Router active states, with decorative line icons from the existing icon catalogue. It is the app's only main navigation instance, not an extra landing menu. Links remain keyboard accessible with existing visible focus, skip-to-content and route/task focus handling. Phone navigation is an always-visible two-column grid; no unimplemented menu controls, new routes or placeholder destinations. Desktop sidebar remains scrollable on short viewports and starts below the full-logo header.

## Language and asset limitations

The existing language switch selects English/Nepali **guide content**, not a translated interface. This increment preserves that behaviour; the surrounding UI/navigation remains explicitly English. Only the supplied approved tagline is used for Nepali logo alternative text. Full surrounding-interface language variants are **not implemented** and need approved/reviewed UI translations in a separate scoped change; no new Nepali interface copy is invented or marked reviewed.

The wide approved logo's embedded taglines and fine details become small at phone width. They are not clipped or distorted, but cannot be made comfortably legible in a compact header merely by CSS. A separate user-approved compact/responsive asset is needed for improved small-screen legibility; do not crop or recreate this image as a workaround. Browser zoom can enlarge the intact asset. The original ~944 KiB bitmap is retained despite its download cost; no optimisation altering the approved file is performed.

## Observable acceptance and actual verification

- Source/local SHA-256 identity checked. Browser confirms original natural dimensions and 3:1 rendered ratio at 320/390/768/1440px, with no horizontal overflow or image bounds outside viewport.
- Desktop/phone screenshots inspected for complete logo, white surround and navigation balance; fine tagline readability limitation above is retained, not claimed solved.
- Component tests cover both exact approved logo alt variants, one seven-link navigation with original destinations/active state and removal of student-only branding/duplicate tagline.
- Browser tests cover keyboard Explore navigation and route focus, English→Nepali guide switching with corresponding logo alt text, saved Nepali guide/unaltered logo offline refresh and keyboard logo→Home navigation.
- `npm run check` passed; `npm test` passed (6 prototype + 64 frontend/domain tests). `npm run test:e2e` passed (50 desktop/mobile Chromium, production build and isolated synthetic API). `git diff --check` passed.
- Local Django unit/PostgreSQL, migration/container/policy, real-device Safari, deployed update/rollback and human usability checks were not rerun for this frontend-only change. Existing quality CI remains required; record its actual outcome in the PR. Synthetic fixtures are not publication review.

No new dependency or paid asset/service, no guide/checklist/API/database/publication/saved-progress changes, and no prototype changes. No deployment, publication, staging seed or merge by this task. Prior Sprint 5/6C/7B review, device, recovery and compatibility gates remain open; merging a branding PR does not satisfy them.
