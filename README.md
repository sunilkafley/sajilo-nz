# Sajilo NZ — development baseline

This repository contains the preserved JavaScript prototype plus an initial regression harness. It is not yet the React/Django production application.

## Run checks
Install Node.js 22 or newer, then run `npm run check` and `npm test`. No npm dependencies are required for these baseline checks.

## View the prototype
Run `python -m http.server 8000 --directory prototype`, then open http://localhost:8000. The prototype keeps preferences and progress in browser localStorage. Content includes examples and must be reviewed before public production use.

## Structure
- prototype/: original HTML, CSS and JavaScript, preserved from the existing Site.
- tests/: unit checks and integration checks in a simulated browser environment.
- docs/audit-and-backlog.md: findings and incremental migration tasks.
- .github/workflows/ci.yml: syntax checks and tests for pushes and pull requests.
- AGENTS.md: rules for coding assistants and contributors.

## Next development slice
Create frontend/ with React, TypeScript and Vite. Port the shell and a single pre-departure checklist journey. Add Vitest/React Testing Library and a real-browser Playwright test of check → reload → preserved progress. Implement backend/ using Django REST Framework when moving reviewed guide content into the database.

## Development workflow
Clone https://github.com/sunilkafley/sajilo-nz.git and create a feature branch for each small development slice. Open a pull request and check the Quality checks workflow before merging. Required checks/branch protection still need to be configured in GitHub; a workflow alone does not prevent direct pushes.

No production deployment is configured. The existing Site remains the design reference.

The baseline tests do not validate visual layout, real browser behaviour, accessibility, content accuracy, network failure or production security. Those checks are explicit backlog items.
