# Compact mobile Explore

Acceptance: at 320x640, 360x640 and 390x664, opening Explore shows its first four topics completely above the fixed navigation without scrolling. The search link is a compact row no taller than 48px and still opens working search. Shared photos/icons/colours/routes are retained; mobile Explore uses two columns and titles, with descriptions retained on larger screens. The publication note follows the topic grid on mobile. Saved guides remain accessible.

Validation: npm run check, npm test (130 frontend + 6 prototype), npm run build passed. Focused headless Edge check passed at all three sizes: search height 46px, fourth-card bottom 506.25px, navigation top at least 568.9px; no page overflow or initial scrolling. Captures are in docs/screenshots/explore-compact. Full backend/browser suite not run locally because Python is unavailable. Existing bundle-size advisory remains.

Standalone focused check: node scripts/check-explore-mobile.mjs "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" (optional executable argument; default uses installed Playwright Chromium). Playwright regression coverage is in frontend/e2e/explore.spec.ts.

Topic titles sit alongside their teal icons on both Home and Explore, using the shared card's two-column content layout. Descriptions stay below that row where shown; photo and arrow treatment remains shared.
