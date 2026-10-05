import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../App';
import { createLocalRepository } from '../checklist/repository';
import { type Guide, parseGuide } from '../guides/api';
import { readSaved, snapshot, writeSaved } from '../guides/saved';
import { cityGuides } from './catalog';

const guide: Guide = {slug:'christchurch-arrival-plan',language:'en',stage:'predeparture',title:'Test city guide',summary:'Test city summary',body:'Synthetic city body.',sources:[{title:'Airport',url:'https://www.christchurchairport.co.nz/travellers/parking-and-transport/'},{title:'Metro',url:'https://www.metroinfo.co.nz/travel-information/getting-started-with-metro/'}],checklist_ids:['airport-transport'],verified_on:'2026-01-01',next_review_on:'2026-12-01',review_overdue:false};
const other = {...guide,slug:'other-guide',title:'Other guidance'};
function mount(path='/cities/christchurch') { return render(<MemoryRouter initialEntries={[path]}><App repository={createLocalRepository(() => localStorage)}/></MemoryRouter>); }
beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

it('matches curated city identity rather than title and rejects unknown cities', () => {
  expect(cityGuides([guide,other],'christchurch')).toEqual([guide]);
  expect(cityGuides([guide,other],'unknown')).toEqual([]);
  expect(cityGuides([guide,other],null)).toEqual([guide,other]);
});
it('validates the new exact official source hosts and rejects lookalikes and credentials', () => {
  expect(parseGuide(guide)).toEqual(guide);
  for (const url of ['http://www.metroinfo.co.nz/','https://www.metroinfo.co.nz.evil.com/','https://user@www.christchurchairport.co.nz/','https://www.metroinfo.co.nz:123/']) {
    expect(() => parseGuide({...guide,sources:[{title:'Invalid',url}]})).toThrow();
  }
});
it('retains city through detail, language and return; never passes a city-filtered catalogue to reconciliation', async () => {
  const fetch = vi.fn().mockImplementation((url: string)=>Promise.resolve({ok:true,json:async()=>url.includes('lang=ne')?[]:[guide,other]}));
  vi.stubGlobal('fetch',fetch);
  writeSaved(items=>[...items,snapshot(other)]);
  mount();
  expect(document.title).toBe('Christchurch · Sajilo NZ');
  expect(screen.getByRole('main')).toHaveFocus();
  await userEvent.click(await screen.findByRole('link',{name:'Test city guide'}));
  expect(readSaved()[0].guide).toEqual(other);
  expect(screen.getByRole('link',{name:'Back to Christchurch'})).toHaveAttribute('href','/cities/christchurch?lang=en&city=christchurch');
  await userEvent.selectOptions(screen.getByLabelText('Guide language / भाषा'),'ne');
  await screen.findByRole('heading',{name:'Guide unavailable in this language'});
  expect(screen.queryByText(guide.body)).not.toBeInTheDocument();
  expect(screen.getByRole('link',{name:'Back to Christchurch'})).toHaveAttribute('href','/cities/christchurch?lang=ne&city=christchurch');
  expect(fetch.mock.calls.every(call=>!call[0].includes('city='))).toBe(true);
});
it('shows explicit unavailable cities without exposing unrelated guides', async () => {
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>[guide,other]}));
  mount('/cities/auckland');
  expect(screen.getByRole('heading',{name:'City unavailable'})).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('not available yet');
  expect(screen.queryByRole('link',{name:'Test city guide'})).not.toBeInTheDocument();
});
it('shows an honest empty city and offers checklist preparation without published content', async () => {
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>[]})); mount();
  await screen.findByRole('heading',{name:'No reviewed guides available yet'});
  expect(screen.getByText(/City drafts require human/)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('link',{name:'Airport transport checklist'}));
  const checkbox=screen.getByRole('checkbox',{name:'Airport transport'});
  expect(checkbox).toHaveFocus();
  await userEvent.click(checkbox);
  expect(checkbox).toBeChecked();
});
it('uses city saved copies on failure and removes withdrawn body after a full publication check', async () => {
  writeSaved(items=>[...items,snapshot(guide),snapshot(other)]);
  const fetch=vi.fn().mockRejectedValue(new Error('offline')); vi.stubGlobal('fetch',fetch);
  mount('/saved?city=christchurch');
  await screen.findByText(/Showing saved copies only/);
  expect(screen.getByRole('link',{name:'Test city guide'})).toBeInTheDocument();
  expect(screen.queryByRole('link',{name:'Other guidance'})).not.toBeInTheDocument();
  fetch.mockResolvedValue({ok:true,json:async()=>[other]});
  await userEvent.click(screen.getByRole('button',{name:'Try again'}));
  await screen.findByText(/This guide is no longer available/);
  expect(readSaved().find(item=>item.slug===guide.slug)?.guide).toBeNull();
  expect(readSaved().find(item=>item.slug===other.slug)?.guide).toEqual(other);
  await userEvent.click(screen.getByRole('button',{name:'Remove unavailable guide'}));
  expect(readSaved().map(item=>item.slug)).toEqual([other.slug]);
});
