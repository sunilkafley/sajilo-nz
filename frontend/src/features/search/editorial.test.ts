import { afterEach, expect, it, vi } from 'vitest';
import { editorialEntry, loadEditorial } from './editorial';
import { searchEntries } from './domain';
const record={slug:'synthetic',language:'en',topic:'work',stage:'daily',tags:['testing-tag'],title:'Synthetic article',summary:'Summary',body:'Body',sections:[{heading:'Interview heading',body:'Section contents'}],source_kind:'official',source_hostname:'official.example.org',source_url:'https://official.example.org/',verified_on:'2026-01-01',next_review_on:'2026-02-01',review_overdue:true};
afterEach(()=>vi.unstubAllGlobals());
it('indexes headings, tags, stage and topic with validated internal destinations',()=>{
  const item=editorialEntry(record,'articles','en');
  expect(item.to).toBe('/explore/work/synthetic?lang=en');
  expect(item.stage).toBe('daily');expect(item.topic).toBe('work');
  for(const query of ['Interview heading','Section contents','testing-tag'])expect(searchEntries([item],query)).toHaveLength(1);
  expect(()=>editorialEntry({...record,source_url:'https://evil.example.org'},'articles','en')).toThrow();
});
it('follows validated page numbers, not supplied URLs, and reports partial failures',async()=>{
  const fetch=vi.fn().mockResolvedValueOnce({ok:true,json:async()=>({results:[record],next:'https://evil.example.org'})}).mockResolvedValueOnce({ok:false});
  vi.stubGlobal('fetch',fetch);
  const data=await loadEditorial('articles','en',new AbortController().signal);
  expect(data.entries).toHaveLength(1);expect(data.partial).toBe(true);
  expect(fetch.mock.calls[1][0]).toBe('/api/explore/articles/?lang=en&page=2');
});
it('caps excessive pagination and explicitly reports incomplete results',async()=>{
  const fetch=vi.fn().mockResolvedValue({ok:true,json:async()=>({results:[],next:'more'})});vi.stubGlobal('fetch',fetch);
  expect((await loadEditorial('directory','ne',new AbortController().signal)).partial).toBe(true);
  expect(fetch).toHaveBeenCalledTimes(20);
});
