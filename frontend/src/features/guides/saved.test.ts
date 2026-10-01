import { beforeEach, expect, it } from 'vitest';
import { readSaved, writeSaved, snapshot, reconcile, searchGuides, reviewDue, savedKey } from './saved';
import { fetchGuides, type Guide } from './api';
import { vi } from 'vitest';
const guide: Guide = { slug:'documents', language:'en', stage:'predeparture', title:'Travel documents', summary:'Prepare a passport', body:'Keep copies safe.', sources:[{title:'INZ',url:'https://www.immigration.govt.nz/'}], checklist_ids:['passport'], verified_on:'2026-01-01', next_review_on:'2026-02-01', review_overdue:false };
beforeEach(() => { localStorage.clear(); vi.unstubAllGlobals(); });
it('saves and removes across repository reads without overwriting another language', () => {
  writeSaved(items => [...items, snapshot(guide)]);
  writeSaved(items => [...items, snapshot({...guide, language:'ne'})]);
  expect(readSaved()).toHaveLength(2);
  writeSaved(items => items.filter(item => item.language !== 'en'));
  expect(readSaved()[0].language).toBe('ne');
});
it('discards withdrawn content only for the successfully checked language', () => {
  const items = reconcile([snapshot(guide), snapshot({...guide,language:'ne'})], 'en', []);
  expect(items[0].guide).toBeNull(); expect(items[1].guide).not.toBeNull();
  expect(reconcile(items, 'en', [guide])[0].guide).toEqual(guide);
});
it('preserves malformed and future-version storage instead of overwriting', () => {
  for (const value of ['{broken', '{"version":2,"items":[]}']) {
    localStorage.setItem(savedKey,value);
    expect(() => writeSaved(() => [snapshot(guide)])).toThrow();
    expect(localStorage.getItem(savedKey)).toBe(value);
  }
});
it('rejects tampered unsafe saved sources and mismatched identities', () => {
  for (const item of [{...snapshot(guide),slug:'wrong'}, snapshot({...guide,sources:[{title:'Bad',url:'javascript:alert(1)'}]})]) {
    localStorage.setItem(savedKey, JSON.stringify({version:1,items:[item]})); expect(() => readSaved()).toThrow();
  }
});
it('reports quota failure without claiming persistence', () => {
  const storage = { getItem: () => null, setItem: () => { throw new Error('QuotaExceeded'); } } as unknown as Storage;
  expect(() => writeSaved(() => [snapshot(guide)], storage)).toThrow('QuotaExceeded');
});
it('searches all words across fields and preserves Nepali characters', () => {
  expect(searchGuides([guide], '  PASSPORT copies ')).toEqual([guide]);
  expect(searchGuides([guide], 'not here')).toEqual([]);
  const nepali = {...guide,language:'ne' as const,title:'यात्रा कागजात'};
  expect(searchGuides([nepali], 'कागजात')).toEqual([nepali]);
});
it('ages offline review warnings without changing the original verification date', () => {
  expect(reviewDue(guide,'2026-01-31')).toBe(false); expect(reviewDue(guide,'2026-02-01')).toBe(true);
  expect(guide.verified_on).toBe('2026-01-01');
});
it('rejects incomplete-language and duplicate responses before reconciliation', async () => {
  for (const data of [[{...guide,language:'ne'}], [guide,guide], [{...guide,verified_on:'yesterday'}]]) {
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>data}));
    await expect(fetchGuides('en')).rejects.toThrow('Unexpected guide data');
  }
});
