# FAQ navigation update

- FAQs replaces Community in desktop and mobile main navigation, opens `/faqs` and exposes the current-page state.
- Twelve questions cover finding work, choosing and comparing cities, transport, living costs, housing, study and settling in. The focus is life in New Zealand, not app support.
- Each answer has an official source and a relevant topic link. Advice avoids guaranteed jobs, a universal best city, invented prices or personalised immigration decisions.
- Questions start collapsed and use native keyboard-accessible disclosure controls. Answers can be opened independently.
- Existing community routes remain reachable, including from the settling-in answer. The original prototype is unchanged.
- Site search includes the questions, answers and city comparisons. Nepali selection shows an explicit English fallback and preserves language context.

Sources were consulted during drafting: Immigration New Zealand's finding-work and choosing-where-to-live pages; Education New Zealand's cities and regions page; NauMai NZ's living-cost and accommodation pages; Tahatū's Job Hunters’ Workbook. Exact URLs are kept with each answer in `frontend/src/features/faqs/content.ts`. No human verification or translation-review date has been invented. This change is prepared locally and has not been published.
