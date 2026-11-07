# Sajilo NZ admin login

## Acceptance criteria

- `/admin/login/` uses the approved Sajilo NZ logo, local Manrope/DM Sans fonts, pale canvas and forest-green sign-in button. Mobile widths down to 320px have no horizontal overflow.
- Welcome text identifies the editorial workspace, explains staff credentials and offers a public-site return link. No non-functional reset link or visitor registration is introduced.
- Django still owns the form, labels, autocomplete, CSRF token, errors, staff restriction, safe redirects and session authentication. Invalid credentials keep the branded form and visible errors. Keyboard focus remains visible.
- Styling is scoped to the login page. Existing admin editing, review and publishing screens retain their normal behaviour. No account, password, schema, content publication or deployment changes.

## Implementation

The project template directory overrides `admin/login.html` and extends Django's original template. `block.super` retains the native form rather than copying its authentication markup. Assets live in the editorial app's static directory so existing `collectstatic` includes them. Logo/fonts and font licences are copied from the frontend assets; keep those copies aligned if the approved branding changes. No third-party assets are loaded by this customisation.

## Validation

- `npm run check`: passed.
- `npm test`: passed (6 prototype and 137 frontend tests).
- Django `test config editorial guides --noinput`: 58 passed on isolated SQLite, including the four login integration tests. PostgreSQL and real Safari were not run.
- Django `findstatic`: resolves the branded stylesheet and logo through existing static discovery.
- `node scripts/check-admin-login.mjs "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"`: passed using the existing temporary fixture database outside the sandbox. Checked 320, 390 and 1440px, keyboard focus, native invalid-login errors, cleared password after failure, saved dark preference and successful asset responses. Mobile, desktop and error screenshots visually inspected.
- `git diff --check`: passed. No frontend build was needed for these Django templates/static assets; production asset collection still uses the existing Docker workflow.

[Mobile preview](screenshots/admin-login/login-390.png) · [Desktop preview](screenshots/admin-login/login-1440.png) · [Error state](screenshots/admin-login/login-error-390.png).

This repository change requires a separate deployment before the hosted login changes. No hosted account, content or deployment was changed.
