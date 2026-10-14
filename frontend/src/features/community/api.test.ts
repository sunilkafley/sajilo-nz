import { expect, it } from 'vitest';
import { eventStatus, parseListing } from './api';
const item={slug:'test',language:'en',title:'Test',summary:'Test',body:'',city:'City',category:'Category',kind:'organisation',source_kind:'community',source_url:'https://community.example.org/',source_hostname:'community.example.org',verified_on:'2026-01-01',next_review_on:'2026-02-01',review_overdue:true,starts_at:null,ends_at:null};
it('validates source classification, URLs, language and review dates',()=>{
  expect(parseListing(item,'en').kind).toBe('organisation');
  for(const change of [{kind:'business'},{source_url:'javascript:alert(1)'},{source_url:'https://community.example.org.evil.org/'},{language:'ne'},{verified_on:'2026-02-30'},{next_review_on:'2025-01-01'}])expect(()=>parseListing({...item,...change},'en')).toThrow();
  expect(parseListing({...item,kind:'business',source_kind:'commercial'},'en').kind).toBe('business');
});
it('labels event times without implying an undated end or live availability',()=>{
  const event=parseListing({...item,kind:'event',starts_at:'2026-01-01T12:00:00Z',ends_at:'2026-01-01T14:00:00Z'},'en');
  expect(eventStatus(event,Date.parse('2026-01-02'))).toBe('Past event');
  expect(eventStatus({...event,ends_at:null},Date.parse('2026-01-02'))).toMatch(/^Started/);
  expect(eventStatus(event,Date.parse('2025-12-31'))).toMatch(/^Scheduled/);
  expect(()=>parseListing({...event,starts_at:null},'en')).toThrow();
});
