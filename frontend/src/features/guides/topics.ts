import { tasks } from '../checklist/tasks';
import type { Guide, Language } from './api';

export const topics = [
  { id: 'documents', title: 'Documents', group: 'Documents' },
  { id: 'packing', title: 'Packing', group: 'Packing' },
  { id: 'money', title: 'Money', group: 'Money' },
  { id: 'travel-checks', title: 'Before leaving Nepal', group: 'Before leaving Nepal' },
] as const;

// Membership uses existing reviewed checklist links, never inferred titles or slugs.
export function topicGuides(guides: Guide[], topic: string | null): Guide[] {
  if (!topic) return guides;
  const selected = topics.find(item => item.id === topic);
  if (!selected) return [];
  const ids = new Set<string>(tasks.filter(task => task.group === selected.group).map(task => task.id));
  return guides.filter(guide => guide.stage === 'predeparture' && guide.checklist_ids.some(id => ids.has(id)));
}

export function guideLocation(path: string, language: Language, topic: string | null): string {
  const params = new URLSearchParams({ lang: language });
  if (topic) params.set('topic', topic);
  return `${path}?${params}`;
}
