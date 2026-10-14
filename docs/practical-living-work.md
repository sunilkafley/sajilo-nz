# Slice D — Practical living and work

## Acceptance criteria (before implementation)

- Reuse existing Article publication, translation, attribution and expandable housing/Nepal-service views; no copied prototype advice, new sources or sample production records.
- Search published information within Housing, Nepal services, Transport, Support, Work, Immigration and Money; preserve language/query context and offer explicit loading, empty and retry states. Keep planning checklists in Journey.
- Add a responsive Money budget calculator with blank inputs, NZD recurring expenses and optional take-home income. Validate finite non-negative amounts, weekly/monthly conversion using 52/12, totals and balance. No city averages, eligibility or financial recommendations.
- Budget figures stay in component memory only; disclose reload/navigation behaviour. No new storage keys, personal data transmission, progress migration or backend schema change.
- Confirm keyboard/mobile use, invalid-input handling, reset confirmation, language fallback, publication exclusion and existing checklist/offline regressions. Capture actual test outcomes; real Safari remains a human gate.

## Implementation and editorial handover

Money links to `/#/explore/money/budget`: recurring expense inputs, optional income, weekly/monthly display conversion, annual totals and income balance. No sample amounts are prefilled. Original amounts retain precision when switching periods; displays round to cents. Invalid inputs suppress totals rather than silently becoming zero. Clear requires confirmation. Browser-local checklist/guide/course storage is not read or written by the calculator. It works offline after app readiness, but figures intentionally clear on leaving the page or reloading.

The seven practical-topic views reuse the public Article endpoint's existing `q`, topic, language and pagination parameters. Search is explicitly submitted, URL-backed and aborts stale requests. Housing/Nepal services retain keyboard-native expandable articles; work/immigration/transport/support retain published resource cards, attribution and contextual links. No new static advice or eligibility logic was copied from the prototype. This builds on Slice B rather than duplicating its views.

In Django admin, choose the relevant Article topic, write the title/summary/body and expandable sections, then follow the existing review workflow. Drafts and unavailable translations do not appear. Search currently covers title, summary and main body, not individual section text or tags; unified discovery improvements remain Slice F. Practical advice still needs sources; General Article classification is not a bypass. No migration, new dependency, production seed or deployment changes.

## Evidence — 14 October 2026

- `npm run check`: passed.
- `npm test`: 6 prototype and 103 frontend tests passed.
- `npm run build`: passed (also rebuilt by browser verification).
- Django `test guides editorial`: 49 passed against isolated SQLite; `makemigrations --check --dry-run`: no changes.
- Full Playwright regression suite: 82 passed, 4 intentionally skipped duplicate viewport loops.
- Screenshot inspection caught a white-on-white budget-summary cascade conflict after the full run. Corrected with a scoped selector, added background regression assertion; focused Slice D rerun: 5 passed, 1 duplicate viewport test skipped.
- Screenshots regenerated at 390, 768, 1280, 1440 and 1920px with no horizontal page overflow. Desktop budget and mobile topic layouts inspected; no prototype/logo changes.
- Browser checks cover all six practical resource hubs, query/no-results/clear, English/Nepali context, keyboard accordions, budget errors/conversion/reset, offline arithmetic and preserved checklist progress. Unit checks cover boundary values, conversion precision and no storage writes.

[Budget desktop](screenshots/practical-living/budget-1440.png) · [Budget mobile](screenshots/practical-living/budget-390.png) · [Work mobile](screenshots/practical-living/work-390.png). Test figures and article records in screenshots are isolated synthetic fixtures, not personal financial information, real guidance or production review evidence.

Real iPhone Safari, editorial content/translation review and owner acceptance remain pending. Interface copy uses the established English fallback. PostgreSQL CI remains a merge gate; local SQLite is not PostgreSQL evidence. No remote database operation, content publication, merge or deployment occurred. Slices E (community/places) and F (integration/release) remain separate.
