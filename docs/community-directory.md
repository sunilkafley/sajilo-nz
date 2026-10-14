# Slice E — Community and places

## Acceptance criteria defined before implementation

- Reuse reviewed DirectoryEntry records and existing admin/source rules; no schema or production content changes.
- Community opens a paginated organisation/business/event directory and detail views with city, type and category filters, plus text search. Filter options contain only published records in the chosen language.
- Christchurch is an explicit pilot filter, never detected location or a hardcoded limit on cities.
- Distinguish commercial listings, third-party community sources and official sources without implying endorsement. Preserve actual review dates; label past events and show event times with explicit timezone.
- Preserve language/filter context, honest empty/error/offline states, safe links and stale-request protection. No accounts, geolocation, checklists or saved personal data in Community.
- Test publication and disabled-source exclusion, filters, detail/translation behaviour, keyboard/mobile layout, no overflow and existing journey regressions. No merge, deployment or fabricated review evidence.

## Delivered and editorial handover

`/#/community` now opens the public directory; `/#/community/:slug` opens a listing. Location/type/category filters and title/summary/body search use the existing public API, paginated at 24 results. Filter options derive only from published records in the selected language, independent of the active filter subset. Detail/back links retain filters; changing language preserves route and query. Christchurch is an explicit pilot shortcut, not detected location. All other published cities remain available.

Use **Django admin → Editorial → Directory entries** to create organisations, events and businesses. Source domains require the existing ownership/classification review first. Businesses require a commercial source; organisations/events use official or community sources. Record actual review metadata and review translations separately. Saving material changes as draft invalidates review. No production records or approval dates are supplied by this implementation.

Cards distinguish source classification and content review from endorsement. Event times render in Pacific/Auckland; past events remain visible with a Past event label. An event with a start but no end is labelled Started once its start passes, never assumed ongoing. Check organiser links for current status. Event status is evaluated when the view renders; refresh a long-open page to update it.

The directory does not cache listings offline, create accounts, request location, store personal preferences or add checklists. Existing guide offline copies and journey progress remain unchanged. No schema/dependency/deployment change. Query-guidance review retained existing publication/foreign-key indexes, source `select_related` and pagination; production-size query-plan measurement is deferred until real data warrants additional indexes.

## Verification — 14 October 2026

- `npm run check`: passed.
- `npm test`: 6 prototype + 105 frontend tests passed. Updated the obsolete coming-soon assertion to verify the new empty-directory state.
- `npm run build`: passed.
- Django `test guides editorial`: 50 passed on isolated SQLite; migration drift: no changes.
- Full Playwright suite: 87 passed, 5 intentionally skipped duplicate viewport loops. Covers filters, source labels, past events, private details, missing Nepali translations, context preservation, keyboard access, offline error/retry and unchanged checklist progress.
- Captures at 390, 768, 1280, 1440 and 1920px with no horizontal page overflow. Desktop/mobile inspected. All programmes/listings and review dates used by browser tests are isolated synthetic fixtures, not real production content.
- `git diff --check`: passed.

[Desktop](screenshots/community/directory-1440.png) · [Mobile](screenshots/community/directory-390.png)

Real iPhone Safari, owner admin/content acceptance and reviewed interface translations remain pending. The existing English-interface fallback remains explicit; Nepali listing content follows the public API language boundary. PostgreSQL CI must pass before merge; SQLite alone is not PostgreSQL evidence. Unified search integration and final release readiness remain Slice F. No content publication, remote database operations, merge or deployment performed.
