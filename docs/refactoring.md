# Incremental refactoring

## First pass: route titles and language links

Move page-title selection out of `App.tsx` into a pure routing function. Consolidate language parsing and link construction for the app shell, main navigation and FAQs. Existing topic callers keep a compatibility export so the change does not require unrelated feature edits.

Acceptance criteria:

- Existing page titles, including first-week saved guides and unavailable topics, remain unchanged.
- Changing language preserves query filters, checklist task targets and URL fragments.
- FAQ and navigation links use the same language rules.
- Existing layout, content, checklist persistence and publication behavior remain unchanged.
- The pending FAQ implementation is preserved; no prototype or deployment changes are included.

Validation: focused routing tests plus the required type checks and complete unit test suite. Production build checked separately. No new end-to-end browser run is claimed for this refactor.

Keep later refactors small and tied to a feature change. Avoid replacing the router or adding a new state-management framework just to reorganise files.
