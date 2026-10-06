import { expect, it } from 'vitest';
import { localEntries, searchEntries, guideEntry } from './domain';
import { tasks } from '../checklist/tasks';
import { arrivalTasks } from '../arrival/tasks';

it('indexes every existing task using its stable direct destination',()=>{
  for(const [catalogue,path] of [[tasks,'/predeparture'],[arrivalTasks,'/firstweek']] as const) {
    for(const task of catalogue) {
      const first=searchEntries(localEntries,task.label)[0];
      expect(first.to).toBe(`${path}?task=${task.id}`);
      expect(first.status).toBe('Planning · unreviewed');
    }
  }
});
it('uses available city, topic, source and tool records, not planned hubs',()=>{
  expect(searchEntries(localEntries,'Christchurch')[0].to).toBe('/cities/christchurch');
  expect(searchEntries(localEntries,'Documents')[0].to).toBe('/guides?topic=documents');
  expect(searchEntries(localEntries,'Immigration New Zealand')[0].to).toBe('https://www.immigration.govt.nz/');
  expect(searchEntries(localEntries,'Budget checklist')[0].type).toBe('Tool');
  expect(searchEntries(localEntries,'Course finder')).toEqual([]);
  expect(searchEntries(localEntries,'Skills roadmap')).toEqual([]);
  expect(searchEntries(localEntries,'Profile')).toEqual([]);
  expect(searchEntries(localEntries,'   ')).toEqual([]);
});
it('ranks exact titles before partial titles and content, without duplicate destinations',()=>{
  const matches=searchEntries(localEntries,'Passport');
  expect(matches[0].title).toBe('Passport');
  expect(matches[1].title).toBe('Passport validity');
  const budget=searchEntries(localEntries,'budget');
  expect(new Set(budget.map(item=>item.to)).size).toBe(budget.length);
});
it('preserves guide language, stage, recorded review status and body matching',()=>{
  // Existing bilingual browser-fixture title; no production review is being recorded.
  const record=guideEntry({slug:'test-firstweek',stage:'firstweek',language:'ne',title:'परीक्षण पहिलो हप्ताको यात्रा',
    summary:'Synthetic arrival fixture.',body:'Synthetic first-week content, not travel advice.',
    sources:[{title:'Metro',url:'https://www.metroinfo.co.nz/'}],checklist_ids:['arrival-transport'],
    verified_on:'2026-01-01',next_review_on:'2026-02-01',review_overdue:true});
  expect(searchEntries([record],'पहिलो हप्ताको')[0].to).toBe('/guides/test-firstweek?lang=ne&stage=firstweek');
  expect(searchEntries([record],'travel advice')[0].excerpt).toContain('travel advice');
  expect(record.status).toBe('Reviewed 2026-01-01 · review overdue');
});
