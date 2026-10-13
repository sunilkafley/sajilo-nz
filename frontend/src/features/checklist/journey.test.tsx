import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../App';
import { resetChecklist } from './useCases';
import { createLocalRepository, STORAGE_KEY } from './repository';
import { ARRIVAL_STORAGE_KEY, createArrivalRepository } from '../arrival/repository';
import { fetchGuides, type Guide } from '../guides/api';
vi.mock('../guides/api',async importOriginal=>({...await importOriginal<typeof import('../guides/api')>(),fetchGuides:vi.fn()}));
const fetchMock=vi.mocked(fetchGuides);
const mount=(path='/predeparture')=>render(<MemoryRouter initialEntries={[path]}><App repository={createLocalRepository(()=>localStorage)}/></MemoryRouter>);
beforeEach(()=>{localStorage.clear();fetchMock.mockResolvedValue([]);});
afterEach(()=>{vi.restoreAllMocks();});

it('resets only the chosen repository and preserves other progress, saved guides and legacy data',()=>{
  const repo=createLocalRepository(()=>localStorage);
  repo.save({version:1,completed:['passport']});
  localStorage.setItem(ARRIVAL_STORAGE_KEY,'{"version":1,"completed":["arrival-budget"]}');
  localStorage.setItem('sajilo-nz.saved-guides.v1','keep saved');
  localStorage.setItem('sajilo-nz.firstweek-saved-guides.v1','keep arrival saved');
  localStorage.setItem('sajilo-prototype','keep legacy');
  expect(resetChecklist(repo,repo.load().progress).reset).toBe(true);
  expect(repo.load().progress.completed).toEqual([]);
  expect(localStorage.getItem(ARRIVAL_STORAGE_KEY)).toContain('arrival-budget');
  expect(localStorage.getItem('sajilo-nz.saved-guides.v1')).toBe('keep saved');
  expect(localStorage.getItem('sajilo-nz.firstweek-saved-guides.v1')).toBe('keep arrival saved');
  expect(localStorage.getItem('sajilo-prototype')).toBe('keep legacy');
  const arrival=createArrivalRepository();
  repo.save({version:1,completed:['passport']});
  expect(resetChecklist(arrival,arrival.load().progress).reset).toBe(true);
  expect(repo.load().progress.completed).toEqual(['passport']);
});
it('failed and blocked resets never discard current selections or overwrite unreadable records',()=>{
  const current={version:1 as const,completed:['passport']};
  const save=vi.fn(()=>{throw new Error('quota');});
  expect(resetChecklist({load:()=>({progress:current}),save},current)).toMatchObject({progress:current,reset:false});
  expect(save).toHaveBeenCalledOnce();save.mockClear();
  expect(resetChecklist({load:()=>({progress:current}),save},current,true)).toMatchObject({progress:current,reset:false});
  expect(save).not.toHaveBeenCalled();
});
it('requires confirmation, preserves progress on cancel and confirms successful reset',async()=>{
  localStorage.setItem(STORAGE_KEY,'{"version":1,"completed":["passport"]}');
  const user=userEvent.setup();mount();const confirm=vi.spyOn(window,'confirm').mockReturnValue(false);
  await user.click(screen.getByRole('button',{name:'Reset checklist'}));
  expect(confirm).toHaveBeenCalledWith(expect.stringContaining('pre-departure'));
  expect(screen.getByRole('checkbox',{name:'Passport'})).toBeChecked();
  confirm.mockReturnValue(true);await user.click(screen.getByRole('button',{name:'Reset checklist'}));
  expect(screen.getByRole('checkbox',{name:'Passport'})).not.toBeChecked();
  expect(screen.getByText('Your pre-departure checklist has been reset.')).toBeInTheDocument();
  expect(screen.getByRole('heading',{name:'0 of 27 completed'})).toHaveFocus();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).completed).toEqual([]);
});
it('failed reset keeps checked tasks and shows no reset success message',async()=>{
  localStorage.setItem(STORAGE_KEY,'{"version":1,"completed":["passport"]}');
  mount();vi.spyOn(window,'confirm').mockReturnValue(true);
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota');});
  await userEvent.click(screen.getByRole('button',{name:'Reset checklist'}));
  expect(screen.getByRole('checkbox',{name:'Passport'})).toBeChecked();
  expect(screen.getByRole('alert')).toHaveTextContent('Could not reset');
  expect(screen.queryByText('Your pre-departure checklist has been reset.')).toBeNull();
});
it('disables reset for future-version storage and prints without modifying it',async()=>{
  const raw='{"version":2,"completed":["passport"]}';localStorage.setItem(STORAGE_KEY,raw);
  mount();const print=vi.spyOn(window,'print').mockImplementation(()=>{});
  expect(screen.getByRole('button',{name:'Reset checklist'})).toBeDisabled();
  await userEvent.click(screen.getByRole('button',{name:'Print / Save as PDF'}));
  expect(print).toHaveBeenCalledOnce();expect(localStorage.getItem(STORAGE_KEY)).toBe(raw);
});
const guide:Guide={slug:'test-documents',language:'en',stage:'predeparture',title:'Synthetic documents',summary:'Fixture',body:'Fixture',checklist_ids:['passport'],sources:[{title:'INZ',url:'https://www.immigration.govt.nz/'}],verified_on:'2026-01-01',next_review_on:'2026-02-01',review_overdue:true};
it('links matching published guides next to tasks with actual review information in the support panel',async()=>{
  fetchMock.mockResolvedValue([guide]);mount();
  const task=screen.getByRole('checkbox',{name:'Passport'}).closest('.task')!;
  expect(await within(task as HTMLElement).findByRole('link',{name:'Read: Synthetic documents'})).toHaveAttribute('href','/guides/test-documents?lang=en');
  expect(screen.getByRole('complementary',{name:'Related information'})).toHaveTextContent('Reviewed 2026-01-01 · Next review 2026-02-01 · Review overdue');
});
it('ignores late English responses after selecting Nepali and keeps empty translation state honest',async()=>{
  let resolve!:(guides:Guide[])=>void;
  fetchMock.mockImplementation(language=>language==='en'?new Promise(done=>{resolve=done;}):Promise.resolve([]));
  mount();await userEvent.selectOptions(screen.getByLabelText('Language / भाषा'),'ne');
  expect(await screen.findByText('No published guides are available for this stage in Nepali yet.')).toBeInTheDocument();
  await act(async()=>{resolve([guide]);});
  expect(screen.queryByText('Synthetic documents')).toBeNull();
  expect(fetchMock).toHaveBeenLastCalledWith('ne',expect.any(AbortSignal),'predeparture');
});
it('guide API failure leaves tasks interactive and offers retry',async()=>{
  fetchMock.mockRejectedValueOnce(new Error('offline'));mount();
  expect(await screen.findByRole('button',{name:'Retry related guides'})).toBeInTheDocument();
  await userEvent.click(screen.getByRole('checkbox',{name:'Passport'}));
  expect(screen.getByRole('checkbox',{name:'Passport'})).toBeChecked();
  await userEvent.click(screen.getByRole('button',{name:'Retry related guides'}));
  expect(await screen.findByText('No published guides are available for this stage in English yet.')).toBeInTheDocument();
});
