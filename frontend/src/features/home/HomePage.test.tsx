import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../App';
import { tasks } from '../checklist/tasks';
import { createLocalRepository, STORAGE_KEY } from '../checklist/repository';
import { savedKey, snapshot, writeSaved } from '../guides/saved';
import type { Guide } from '../guides/api';
import { homeJourney, savedPreview } from './domain';

const guide: Guide = {slug:'documents',language:'en',stage:'predeparture',title:'Test saved English',summary:'Synthetic summary',body:'Do not expose cached body on Home.',sources:[{title:'INZ',url:'https://www.immigration.govt.nz/'}],checklist_ids:['passport'],verified_on:'2026-01-01',next_review_on:'2026-02-01',review_overdue:true};
const mount=()=>render(<MemoryRouter><App repository={createLocalRepository(()=>localStorage)}/></MemoryRouter>);
beforeEach(()=>localStorage.clear());
afterEach(()=>{ vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('derives genuine progress and first three incomplete steps in stable task order',()=>{
  const journey=homeJourney({version:1,completed:['visa','visa','unknown']});
  expect(journey.completed).toBe(1);
  expect(journey.total).toBe(27);
  expect(journey.nextSteps.map(task=>task.id)).toEqual(['passport','offer','academic']);
  expect(homeJourney({version:1,completed:tasks.map(task=>task.id)}).nextSteps).toEqual([]);
});
it('previews latest bookmarks without mutating storage order or treating withdrawn bookmarks as copies',()=>{
  const first={...snapshot(guide),fetchedAt:'2026-01-01T00:00:00Z'};
  const second={...snapshot({...guide,language:'ne',title:'परीक्षण बुकमार्क'}),fetchedAt:'2026-01-03T00:00:00Z',guide:null};
  const third={...snapshot({...guide,slug:'third'}),fetchedAt:'2026-01-02T00:00:00Z'};
  const items=[first,second,third];
  expect(savedPreview(items)).toEqual({count:3,copies:2,recent:[second,third]});
  expect(items).toEqual([first,second,third]);
});
it('renders prototype sections, honest planned tools and real zero progress without fetching or writing',()=>{
  const fetch=vi.fn(); vi.stubGlobal('fetch',fetch);
  const write=vi.spyOn(Storage.prototype,'setItem');
  mount();
  expect(document.title).toBe('Home · Sajilo NZ');
  expect(screen.getByRole('main')).toHaveFocus();
  expect(screen.getByRole('link',{name:'Home'})).toHaveAttribute('aria-current','page');
  expect(screen.getByRole('heading',{name:'Namaste, welcome home'})).toBeInTheDocument();
  expect(screen.getByRole('progressbar',{name:'Planning tasks completed'})).toHaveAttribute('aria-valuenow','0');
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax','27');
  expect(screen.getByText('0 saved bookmarks · 0 saved copies on this browser')).toBeInTheDocument();
  const tools=screen.getByRole('region',{name:'A few handy tools'});
  expect(within(tools).getAllByRole('article')).toHaveLength(4);
  expect(within(tools).getByRole('link',{name:'Open first-month budget step'})).toHaveAttribute('href','/predeparture?task=budget');
  expect(within(tools).queryByRole('button')).not.toBeInTheDocument();
  expect(screen.queryByText(/post-study work visa options/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Dashain Celebration/)).not.toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled(); expect(write).not.toHaveBeenCalled();
});
it('next step focuses the real checklist and Home updates after completion and reload',async()=>{
  const view=mount(); const user=userEvent.setup();
  await user.click(screen.getByRole('link',{name:'Passport'}));
  const checkbox=screen.getByRole('checkbox',{name:'Passport'});
  expect(checkbox).toHaveFocus(); await user.click(checkbox);
  await user.click(screen.getByRole('link',{name:'Home'}));
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow','1');
  expect(screen.queryByRole('link',{name:'Passport'})).not.toBeInTheDocument();
  expect(screen.getByRole('link',{name:'Academic documents'})).toBeInTheDocument();
  view.unmount(); mount();
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow','1');
});
it('places working next steps directly after the hero, followed by compact tools',async()=>{
  const user=userEvent.setup();mount();
  const hero=screen.getByRole('region',{name:'Your pre-departure adventure'});
  const next=screen.getByRole('region',{name:'Your next steps'});
  expect(hero.nextElementSibling).toBe(next);
  expect(next.nextElementSibling).toBe(screen.getByRole('region',{name:'A few handy tools'}));
  await user.click(within(next).getByRole('checkbox',{name:'Passport'}));
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow','1');
  expect(within(next).getAllByRole('checkbox')[0]).toHaveFocus();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)! ).completed).toContain('passport');
});
it('keeps the budget task and official emergency resource accessible',async()=>{
  const user=userEvent.setup();mount();
  expect(screen.getByRole('link',{name:'NZ Police emergency information (online)'})).toHaveAttribute('href','https://www.police.govt.nz/contact-us/111-police-emergency');
  await user.click(screen.getByRole('link',{name:'Open first-month budget step'}));
  expect(screen.getByRole('checkbox',{name:'First-month budget'})).toHaveFocus();
});
it('all-complete state does not invent a next stage or assert eligibility',()=>{
  localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,completed:tasks.map(task=>task.id)}));
  mount();
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow','27');
  expect(within(screen.getByRole('region',{name:'Your next steps'})).getByRole('status')).toHaveTextContent('completion does not confirm travel eligibility');
  expect(screen.queryByRole('link',{name:'Passport'})).not.toBeInTheDocument();
  expect(screen.getByRole('link',{name:'See all steps'})).toBeInTheDocument();
});
it('shows independent language bookmarks without cached bodies and refreshes after cross-tab removal',()=>{
  writeSaved(()=>[snapshot(guide),{...snapshot({...guide,language:'ne',title:'परीक्षण बुकमार्क'}),guide:null}]);
  const before=localStorage.getItem(savedKey); mount();
  expect(screen.getByText('2 saved bookmarks · 1 saved copies on this browser')).toBeInTheDocument();
  expect(screen.getByRole('link',{name:'Test saved English'})).toHaveAttribute('href','/guides/documents?lang=en');
  expect(screen.getByRole('link',{name:'परीक्षण बुकमार्क'})).toHaveAttribute('href','/saved?lang=ne');
  expect(screen.getByRole('link',{name:'परीक्षण बुकमार्क'})).toHaveAttribute('lang','ne');
  expect(screen.queryByText(guide.body)).not.toBeInTheDocument();
  expect(localStorage.getItem(savedKey)).toBe(before);
  localStorage.removeItem(savedKey);
  act(()=>window.dispatchEvent(new StorageEvent('storage',{key:savedKey})));
  expect(screen.getByText('0 saved bookmarks · 0 saved copies on this browser')).toBeInTheDocument();
});
it('preserves corrupt saved data, shows no false zero count and recovers on focus',()=>{
  localStorage.setItem(savedKey,'{broken'); mount();
  expect(screen.getByRole('alert')).toHaveTextContent('stored data has been kept');
  expect(screen.queryByText('0 saved bookmarks · 0 saved copies on this browser')).not.toBeInTheDocument();
  expect(localStorage.getItem(savedKey)).toBe('{broken');
  localStorage.removeItem(savedKey);
  act(()=>window.dispatchEvent(new Event('focus')));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
it('preserves failed-write checklist state in memory while retaining the warning on Home',async()=>{
  const user=userEvent.setup(); mount();
  await user.click(screen.getByRole('link',{name:'Passport'}));
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota');});
  await user.click(screen.getByRole('checkbox',{name:'Passport'}));
  await user.click(screen.getByRole('link',{name:'Home'}));
  expect(screen.getByRole('alert')).toHaveTextContent('Could not save');
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow','1');
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
});
