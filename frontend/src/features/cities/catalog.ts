import type { Guide } from '../guides/api';

// Curated identity only: membership does not confer editorial approval.
export const christchurch = { id: 'christchurch', title: 'Christchurch', guideSlugs: ['christchurch-arrival-plan'] } as const;
export function findCity(id: string | null | undefined) {
  return id === christchurch.id ? christchurch : undefined;
}
export function cityGuides(guides: Guide[], id: string | null | undefined): Guide[] {
  if (!id) return guides;
  const city = findCity(id);
  return city ? guides.filter(guide => city.guideSlugs.some(slug => slug === guide.slug) && guide.stage === 'predeparture') : [];
}
