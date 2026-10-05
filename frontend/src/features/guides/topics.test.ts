import { expect, it } from 'vitest';
import type { Guide } from './api';
import { guideLocation, topicGuides } from './topics';

const guide = (slug: string, checklist_ids: string[]) => ({ slug, stage: 'predeparture', checklist_ids } as Guide);
it('uses task relationships, supports multiple topics and keeps unlinked guides in all topics', () => {
  const documents = guide('unrelated-title', ['passport', 'medication']);
  const money = guide('documents-title', ['budget']);
  const unlinked = guide('general', []);
  const guides = [documents, money, unlinked];
  expect(topicGuides(guides, null)).toEqual(guides);
  expect(topicGuides(guides, 'documents')).toEqual([documents]);
  expect(topicGuides(guides, 'packing')).toEqual([documents]);
  expect(topicGuides(guides, 'money')).toEqual([money]);
  expect(topicGuides(guides, 'travel-checks')).toEqual([]);
  expect(topicGuides(guides, 'unknown')).toEqual([]);
});
it('preserves language and safely encoded topic context', () => {
  expect(guideLocation('/saved', 'ne', 'documents')).toBe('/saved?lang=ne&topic=documents');
  expect(guideLocation('/guides', 'en', null)).toBe('/guides?lang=en');
});
