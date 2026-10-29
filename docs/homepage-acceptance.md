# Homepage compact layout

- The homepage does not display the interface language fallback notice.
- At 390×664, 360×640 and 320×640 CSS pixels, all six topic links fit above the fixed mobile navigation without scrolling.
- Topic links retain their labels, destinations and selected language.
- The header offers one-click language switching: “नेपाली” switches to Nepali and “English” switches back, preserving the current page, filters and fragment.
- The existing desktop layout and guide translation handling remain intact.
- Larger text and shorter viewports may require scrolling; content must remain accessible.

Automated layout coverage: `frontend/e2e/home-topics.spec.ts`.
