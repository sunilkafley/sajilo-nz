import { tasks } from '../checklist/tasks';
export type Language = 'en' | 'ne';
export interface Guide {
  slug: string; language: Language; stage: string; title: string; summary: string; body: string;
  sources: { title: string; url: string }[]; checklist_ids: string[];
  verified_on: string; next_review_on: string; review_overdue: boolean;
}
export class GuideError extends Error {}
const officialHosts = new Set(['www.immigration.govt.nz', 'www.mpi.govt.nz', 'www.travellerdeclaration.govt.nz']);
export function parseGuide(value: unknown): Guide {
  if (!value || typeof value !== 'object') throw new GuideError('Unexpected guide data. Please try again later.');
  const g = value as Record<string, unknown>;
  const strings = ['slug', 'stage', 'title', 'summary', 'body', 'verified_on', 'next_review_on'];
  const validDate = (value: unknown) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  const valid = typeof g.slug === 'string' && /^[a-zA-Z0-9_-]+$/.test(g.slug) && validDate(g.verified_on) && validDate(g.next_review_on) && strings.every(key => typeof g[key] === 'string' && g[key]) &&
    (g.language === 'en' || g.language === 'ne') && typeof g.review_overdue === 'boolean' &&
    Array.isArray(g.checklist_ids) && g.checklist_ids.every(id => tasks.some(task => task.id === id)) &&
    Array.isArray(g.sources) && g.sources.length > 0 && g.sources.every(source => {
      if (!source || typeof source.title !== 'string' || typeof source.url !== 'string') return false;
      try { const url = new URL(source.url); return url.protocol === 'https:' && officialHosts.has(url.hostname) && !url.username && !url.password && (!url.port || url.port === '443'); } catch { return false; }
    });
  if (!valid) throw new GuideError('Unexpected guide data. Please try again later.');
  return value as Guide;
}
export async function fetchGuides(language: Language, signal?: AbortSignal): Promise<Guide[]> {
  const response = await fetch(`/api/guides/?lang=${language}`, { signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(8000)]) : AbortSignal.timeout(8000), cache: 'no-store' });
  if (!response.ok) throw new GuideError('Guides are unavailable right now. Your checklist still works.');
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new GuideError('Unexpected guide data. Please try again later.');
  const guides = data.map(parseGuide);
  if (guides.some(guide => guide.language !== language) || new Set(guides.map(guide => guide.slug)).size !== guides.length) throw new GuideError('Unexpected guide data. Please try again later.');
  return guides;
}
