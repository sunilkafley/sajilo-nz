import { tasks } from '../checklist/tasks';
export type Language = 'en' | 'ne';
export interface Guide {
  slug: string; language: Language; stage: string; title: string; summary: string; body: string;
  sources: { title: string; url: string }[]; checklist_ids: string[];
  verified_on: string; next_review_on: string; review_overdue: boolean;
}
export class GuideError extends Error {}
const officialHosts = new Set(['www.immigration.govt.nz', 'www.mpi.govt.nz', 'www.travellerdeclaration.govt.nz']);
function parseGuide(value: unknown): Guide {
  if (!value || typeof value !== 'object') throw new GuideError('Unexpected guide data. Please try again later.');
  const g = value as Record<string, unknown>;
  const strings = ['slug', 'stage', 'title', 'summary', 'body', 'verified_on', 'next_review_on'];
  const valid = strings.every(key => typeof g[key] === 'string' && g[key]) &&
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
  const response = await fetch(`/api/guides/?lang=${language}`, { signal });
  if (!response.ok) throw new GuideError('Guides are unavailable right now. Your checklist still works.');
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new GuideError('Unexpected guide data. Please try again later.');
  return data.map(parseGuide);
}
