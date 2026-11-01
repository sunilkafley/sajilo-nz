# Compact Journey Planner on mobile

Acceptance: at phone widths all four stage cards appear in one row, with readable labels, existing checklist links and explicit coming-soon status. The flight information link stays directly after the cards. The saved-progress note and real checklist progress remain available, and the progress statistic is brought into the initial viewport where the device height permits. No task state or routing changes.

Verified in headless Edge at 320x640, 360x640 and 390x664: four cards share one row and the complete progress ring is above the bottom navigation. npm run check, npm test (130 frontend + 6 prototype) and npm run build passed. The standalone browser check is scripts/check-journey-mobile.mjs; the full browser suite was not run locally.
