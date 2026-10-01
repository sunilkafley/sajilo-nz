import { parseGuide, type Guide, type Language } from './api';
export const savedKey = 'sajilo-nz.saved-guides.v1';
export interface SavedGuide { slug: string; language: Language; title: string; guide: Guide | null; fetchedAt: string }
export function readSaved(storage: Storage = window.localStorage): SavedGuide[] {
  const raw = storage.getItem(savedKey);
  if (!raw) return [];
  const data = JSON.parse(raw);
  if (data.version !== 1 || !Array.isArray(data.items) || data.items.length > 50) throw new Error('Invalid saved guides');
  const items: SavedGuide[] = data.items;
  items.forEach(item => {
    if (!item || typeof item.slug !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(item.slug) || !['en', 'ne'].includes(item.language) || typeof item.title !== 'string' || typeof item.fetchedAt !== 'string' || !Number.isFinite(Date.parse(item.fetchedAt))) throw new Error('Invalid saved guide');
    if (item.guide !== null) { const guide = parseGuide(item.guide); if (guide.slug !== item.slug || guide.language !== item.language) throw new Error('Invalid saved guide'); }
  });
  if (new Set(items.map(item => `${item.language}:${item.slug}`)).size !== items.length) throw new Error('Duplicate saved guides');
  return items;
}
export function writeSaved(change: (items: SavedGuide[]) => SavedGuide[], storage: Storage = window.localStorage): SavedGuide[] {
  const items = change(readSaved(storage));
  const value = JSON.stringify({ version: 1, items });
  if (items.length > 50 || value.length > 500_000) throw new Error('Saved guide limit reached');
  storage.setItem(savedKey, value);
  return items;
}
export function snapshot(guide: Guide): SavedGuide { return { slug: guide.slug, language: guide.language, title: guide.title, guide, fetchedAt: new Date().toISOString() }; }
export function reconcile(items: SavedGuide[], language: Language, guides: Guide[]): SavedGuide[] {
  return items.map(item => {
    if (item.language !== language) return item;
    const guide = guides.find(guide => guide.slug === item.slug);
    return guide ? snapshot(guide) : { ...item, guide: null };
  });
}
export function searchGuides(guides: Guide[], query: string): Guide[] {
  const normalize = (text: string) => text.normalize('NFKC').toLocaleLowerCase();
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  return guides.filter(guide => { const text = normalize(`${guide.title} ${guide.summary} ${guide.body}`); return words.every(word => text.includes(word)); });
}
export function reviewDue(guide: Guide, today = new Date().toISOString().slice(0, 10)): boolean { return guide.review_overdue || guide.next_review_on <= today; }
