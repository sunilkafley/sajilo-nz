# Home page topic cards

Acceptance criteria:
- Home shows only Immigration & Visas, Study & Education, Earnings & Living Expenses, and Work & Careers, in that order.
- Each card has a locally bundled decorative topic photo, a readable title and its existing topic route. Nepali route context is retained.
- Cards use two columns on desktop and mobile; mobile cards fit above the bottom navigation at the tested sizes.
- Housing and everyday services remain available through Explore.

Photos are illustrative Unsplash images, not verified providers or advice. Local files in frontend/src/assets/topics correspond to these source image IDs:
- immigration: photo-1488646953014-85cb44e25828 (travel planning)
- study: photo-1498243691581-b145c3f54a5a (library)
- money: photo-1554224155-6726b3ff858f (budget paperwork and calculator)
- work: photo-1499750310107-5fef28a66643 (laptop workspace)

Source URL pattern: https://images.unsplash.com/{image-id}

Validation: npm run check passed. Browser test attempted with home-topics.spec.ts, but the configured Python backend could not launch (The system cannot execute the specified program); browser layout validation remains unrun.
