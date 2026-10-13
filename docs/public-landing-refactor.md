# Public landing refactor — PR 1

Base: merged PR #17 (`5a718bf`). Branch: `codex/public-landing-foundation`.

## Acceptance defined before implementation

- Replace the dashboard Home with the approved public layout: horizontal desktop header, scenic hero, exactly six specified topic cards (three/two/one columns) and compact Aotearoa information.
- Preserve the approved 2172 × 724 logo bytes and aspect ratio. No duplicate tagline beside it.
- Mobile navigation has exactly Home, Journey, Explore and Community, with safe-area space, visible active state and keyboard access. About remains in the footer/header.
- Existing routes and checklist repositories/task IDs remain compatible. Move existing progress/next steps/bookmark presentation to Journey rather than deleting that functionality.
- Topic cards reach contextual Explore sections, not checklists or fabricated topic articles. Unavailable resources remain explicitly unavailable; no editorial approval is implied.
- Header search links to the existing real search interface. Preserve query/filter context on language changes. English UI fallback is explicit; no newly invented Nepali translations are published.
- Check 320/390/768/1280/1440/1920 widths, keyboard and persistence; run check, tests, build and browser regressions. Real Safari is a separate, unperformed device gate.

## Increment boundaries

1. This PR: foundation, public Home, navigation, minimal Journey/About/Community entry points and existing search presentation.
2. Journey detail/reset/print/contextual resource UX (not implemented here).
3. Explore content and curated-resource search/filter expansion.
4. Reviewed community/business directory records and filters.
5. Device/accessibility/editorial/offline/release readiness.

Existing publication, translation, real-device, usability and recovery gates in Sprint 5–7 remain open. No backend/schema, prototype, deployment or publication changes.

## Audit / file map

`App.tsx` owns routes and pre-departure state; preserve its repository/use-case calls. `HomePage.tsx` currently mixes dashboard presentation with progress/bookmarks; retain that UI under Journey. `MainNavigation.tsx` and shared styles own the old sidebar. The existing logo/icon/font assets are reusable, but scenic artwork is absent. `features/search` already indexes both guide stages/languages and local resources; only move its input to the search page. Explore's category catalogue mostly contains planned entries, and Aotearoa introductions are all planned. No reviewed community/business records currently exist.

## Implemented route and file mapping

| Responsibility | Files / destinations |
| --- | --- |
| Public shell | `App.tsx`, `components/AppHeader.tsx`, `MainNavigation.tsx`, `public-layout.css`, `main.tsx`, viewport metadata in `index.html` |
| Home | `features/home/HomePage.tsx`, `landingTopics.ts`, local scenic asset |
| Existing dashboard retained | `features/home/JourneyDashboard.tsx` at `/journey`; unchanged checklist detail routes `/predeparture`, `/firstweek` |
| Topic destinations | Existing `/explore?category=…`; contextual availability panel in `ExplorePage.tsx`; money links to the existing guide filter, immigration to existing sources |
| Informational entry points | `InformationPages.tsx`: `/about` describes privacy/content boundaries; `/community` honestly describes pending directory availability and provides existing starting points |
| Language | `interfaceLanguage.ts` is an explicit reviewed-copy/fallback seam; header preserves pathname, query parameters and fragment |
| Search | Existing combobox moved into `SearchPage`; header icon links there; `domain.ts` indexes the real Journey/About pages and updates Home's description |
| Regression coverage | Landing, branding, arrival and dashboard unit tests; browser navigation helper and affected browser tests; responsive capture test |

Journey's old dashboard features are relocated, not reimplemented. The new stage overview does not persist an inferred stage or unlock invented tasks. PR 2 remains the checklist-detail UX increment.

## Artwork and visual limitations

The original approved logo remains byte-identical (SHA256 `3F38D073A2E5C546E2063076A2BF7FE0EBDCFD8B3BF1F20F1FEB8061567DE1D1`). Its complete embedded taglines are inevitably small on phones; a separate approved compact asset would be needed for more readable miniature branding, not a crop.

The user approved temporary scenic imagery and intends to supply their own photograph later. Replace `frontend/src/assets/journey-landscape.png` with that approved photograph, then recheck desktop/mobile crops. The current 2172 × 724 PNG is generated illustrative scenery, **not an identified real-location photograph**. It is decorative CSS imagery; no location claim or editorial review is attached. Source mode: built-in image-generation tool, not a paid external stock dependency. It adds approximately 2.68 MB to the initial/offline asset bundle.

Generation prompt:

> Use case: illustration-story. Asset type: decorative wide website hero background, not a UI screenshot. Create a polished naturalistic New Zealand-inspired alpine lake scene: blue turquoise lake, dramatic distant snow-capped mountains, green tussock slopes and a winding wooden walking path with one small backpacked adult seen from behind on the right third. Bright welcoming daylight. Wide landscape 3:1 composition. Left half has softly lit pale sky and lake, quiet low detail for dark text overlay; right half contains crisp mountain peaks and walking person. No text, slogans, logos, flags, maps, interface, borders or watermark. Do not reproduce or alter any logo. This is illustrative scenery, not an identified real location.

The new reference supplies layout rather than separate production imagery. Topic cards use the existing outline icons and pastel surfaces, not the mockup's individual topic photographs. The written six-topic list overrides the screenshot's differing categories. Aotearoa introductions and missing topical resources remain visibly unavailable; no fictional articles or review dates fill those spaces. Interface copy remains English except the approved Nepali tagline and existing reviewed guide translations; choosing Nepali exposes an explicit English-interface fallback notice. Full localisation is not claimed.

## Verification

Executed automated checks:

- `npm run check`: passed.
- `npm test`: 6 prototype + 74 frontend/domain tests passed.
- `npm run build`: passed.
- Full production browser suite: 55 passed, one deliberately skipped duplicate mobile invocation of the multi-width capture test. Uses isolated synthetic Django guide fixtures, not production publication.
- Layout/no-overflow, centring, logo ratio, three/two/one topic columns and four mobile navigation items at 320, 390, 768, 1280, 1440 and 1920 pixels. Fixed navigation uses safe-area padding and content/scroll clearance.
- Keyboard main/task focus, semantic active states, language/query preservation, bilingual search, unpublished-guide exclusion, independent progress/reload, corrupt storage, failed saves/retry, saved copies/offline and withdrawal regressions.
- Initial failures included obsolete sidebar/search selectors and a real missing `aria-current` on checklist child routes. Selectors were updated and the navigation active-state implementation corrected before successful rerun.
- Desktop and mobile screenshot inspection; no distortion/clipping found. Full-page screenshots show fixed mobile navigation at the captured viewport boundary; use the viewport capture for its on-screen placement.

Not run: real iPhone Safari, assistive-technology user testing, human content/translation review, usability sessions, local PostgreSQL/container tests, deployed update/rollback or deployment. Chromium iPhone emulation is not Safari evidence. Existing CI remains the PostgreSQL/container/policy gate. No prototype/backend/deployment configuration changes.

Screenshots: [1440 desktop](screenshots/public-landing/home-1440.png), [1280](screenshots/public-landing/home-1280.png), [1920](screenshots/public-landing/home-1920.png), [390 mobile viewport](screenshots/public-landing/home-390-viewport.png), [390 full page](screenshots/public-landing/home-390.png), [320](screenshots/public-landing/home-320.png), [768](screenshots/public-landing/home-768.png), [mobile search](screenshots/public-landing/search-mobile.png).

Stop at PR review. No merge, deployment or continuation into PR 2 is authorised by this implementation.
