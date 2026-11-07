# Sajilo NZ editorial dashboard

## Acceptance criteria

- The authenticated admin index uses the approved logo, local fonts, forest-green accents and pale canvas, consistent with the login. It provides content cards, a review reminder and recent actions at desktop and 320px mobile widths without horizontal page overflow.
- Editorial and Journey guides appear ahead of People & access. Links derive from Django's permission-filtered `app_list`; add controls require `add_url`, view-only staff see View rather than Manage, and staff without model permissions see an explicit empty state.
- Existing staff navigation, logout POST/CSRF, password change, theme controls, recent-action ownership and model permissions remain intact. No new users, permission grants, publication actions, source approvals, schema or review dates are introduced.
- Shared admin branding carries through content lists and forms, with light/dark palettes and visible keyboard focus. The existing login layout stays intact.

## Implementation

Project templates extend Django's native base/index. The dashboard uses Django's existing model URLs and permission results, not hardcoded add links or custom content queries. Recent actions retain the native per-user log rendering. Descriptive copy explains the existing records; the review reminder is not evidence that any content is reviewed.

## Validation

- `npm run check`: passed.
- `npm test`: passed (6 prototype and 137 frontend tests).
- Django `test config editorial guides --noinput`: 63 passed on isolated SQLite. New checks cover permission-filtered cards, view-only/add restrictions, staff without content permissions, anonymous access, per-user recent actions, native review fields, logout form CSRF and login branding.
- `node scripts/check-admin-workspace.mjs "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"`: passed against an isolated temporary SQLite server. Checked 320, 390, 768 and 1440px without horizontal overflow; native article form navigation/mobile layout; explicit and automatic dark mode; keyboard focus; logout and existing login regression; no failed static-asset responses. The preview users and article are synthetic, temporary and never published.
- Mobile/desktop dashboard, dark palette, mobile article form and login screenshots visually inspected. Browser-cache 304 responses are allowed by the asset check.
- `git diff --check`: passed. PostgreSQL, full browser regression and real Safari were not rerun for this local change. Frontend build was not rerun because no frontend source changed.

[Mobile dashboard](screenshots/admin-workspace/dashboard-390.png) · [Desktop dashboard](screenshots/admin-workspace/dashboard-1440.png) · [Dark dashboard](screenshots/admin-workspace/dashboard-dark-1440.png).

This change is local and not deployed. No hosted content, permissions or credentials changed.
