import { afterEach, expect, it, vi } from 'vitest';
import { fetchGuides, parseGuide } from './api';
import { arrivalSavedKey, readSaved, savedKey, snapshot, writeSaved, reconcile } from './saved';
import { guideLocation } from './topics';
const guide = {slug:'arrival',language:'en' as const,stage:'firstweek',title:'Synthetic arrival',summary:'Test',body:'Test only',sources:[{title:'Metro',url:'https://www.metroinfo.co.nz/'}],checklist_ids:['arrival-transport'],verified_on:'2026-01-01',next_review_on:'2026-02-01',review_overdue:true};
afterEach(()=>vi.unstubAllGlobals());
it('opts in to arrival API without accepting the wrong stage as a publication check',async()=>{
  const fetch=vi.fn().mockResolvedValue({ok:true,json:async()=>[guide]});vi.stubGlobal('fetch',fetch);
  expect(await fetchGuides('en',undefined,'firstweek')).toEqual([guide]);
  expect(fetch.mock.calls[0][0]).toBe('/api/guides/?lang=en&stage=firstweek');
  await expect(fetchGuides('en')).rejects.toThrow('Unexpected guide data');
  expect(fetch.mock.calls[1][0]).toBe('/api/guides/?lang=en');
});
it('validates stage-specific IDs and rejects unknown or mixed-stage payloads',()=>{
  expect(parseGuide(guide)).toEqual(guide);
  for(const invalid of [{...guide,stage:'unknown'},{...guide,checklist_ids:['passport']},{...guide,stage:'predeparture'}]) expect(()=>parseGuide(invalid)).toThrow();
});
it('keeps arrival copies isolated and preserves all original storage on decode errors',()=>{
  localStorage.clear();localStorage.setItem(savedKey,'{legacy-invalid');
  writeSaved(()=>[snapshot(guide)],localStorage,arrivalSavedKey);
  expect(readSaved(localStorage,arrivalSavedKey)[0].guide).toEqual(guide);
  expect(localStorage.getItem(savedKey)).toBe('{legacy-invalid');
  const original=localStorage.getItem(arrivalSavedKey);
  expect(()=>readSaved()).toThrow();
  expect(localStorage.getItem(arrivalSavedKey)).toBe(original);
  localStorage.setItem(arrivalSavedKey,'{broken');
  expect(()=>writeSaved(()=>[],localStorage,arrivalSavedKey)).toThrow();
  expect(localStorage.getItem(arrivalSavedKey)).toBe('{broken');
  localStorage.removeItem(savedKey);
  expect(()=>writeSaved(()=>[snapshot(guide)])).toThrow('Wrong saved-guide journey');
  expect(localStorage.getItem(savedKey)).toBeNull();
});
it('retains stage in guide navigation and removes withdrawn bodies only for the selected language',()=>{
  expect(guideLocation('/saved','ne',null,null,'firstweek')).toBe('/saved?lang=ne&stage=firstweek');
  const en=snapshot(guide),ne=snapshot({...guide,language:'ne'});
  expect(reconcile([en,ne],'en',[])).toEqual([{...en,guide:null},ne]);
});
