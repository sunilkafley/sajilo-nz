import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../App';
import { ArrivalPage } from './ArrivalPage';
import { arrivalRules } from './domain';
import { arrivalTasks } from './tasks';
import { ARRIVAL_STORAGE_KEY, createArrivalRepository } from './repository';
import { STORAGE_KEY, createLocalRepository } from '../checklist/repository';
import { updateChecklistTask } from '../checklist/useCases';
const mount=(path='/firstweek')=>render(<MemoryRouter initialEntries={[path]}><App repository={createLocalRepository(()=>localStorage)}/></MemoryRouter>);
beforeEach(()=>localStorage.clear());

it('isolates task IDs, normalises duplicates and counts only first-week tasks',()=>{
  expect(arrivalRules.decodeProgress('{"version":1,"completed":["arrival-budget","arrival-budget","passport"]}')).toEqual({version:1,completed:['arrival-budget']});
  expect(()=>arrivalRules.setCompleted({version:1,completed:[]},'passport',true)).toThrow();
  expect(arrivalRules.summarise({version:1,completed:arrivalTasks.map(task=>task.id)})).toEqual({completed:6,total:6,percent:100});
});
it('never imports or overwrites pre-departure, saved guides or prototype data',()=>{
  localStorage.setItem(STORAGE_KEY,'{"version":1,"completed":["passport"]}');
  localStorage.setItem('sajilo-prototype','{"checks":{"Settle in:Plan phone and internet access":true}}');
  localStorage.setItem('sajilo-nz.saved-guides.v1','keep this unchanged');
  const before=[localStorage.getItem(STORAGE_KEY),localStorage.getItem('sajilo-prototype'),localStorage.getItem('sajilo-nz.saved-guides.v1')];
  const repo=createArrivalRepository();
  expect(repo.load().progress.completed).toEqual([]);
  repo.save(arrivalRules.setCompleted(repo.load().progress,'arrival-budget',true));
  expect([localStorage.getItem(STORAGE_KEY),localStorage.getItem('sajilo-prototype'),localStorage.getItem('sajilo-nz.saved-guides.v1')]).toEqual(before);
});
it('preserves corrupt and future-version records and blocks persistent changes',()=>{
  for(const raw of ['{broken','{"version":2,"completed":[]}']) {
    localStorage.setItem(ARRIVAL_STORAGE_KEY,raw);
    const repo=createArrivalRepository();const loaded=repo.load();
    expect(loaded.blocked).toBe(true);
    const changed=updateChecklistTask(repo,loaded.progress,'arrival-budget',true,arrivalRules.setCompleted,loaded.blocked);
    expect(changed.progress.completed).toEqual(['arrival-budget']);
    expect(localStorage.getItem(ARRIVAL_STORAGE_KEY)).toBe(raw);
  }
});
it('first-week keyboard target, navigation and reload retain independent progress',async()=>{
  const user=userEvent.setup();const view=mount('/firstweek?task=arrival-budget');
  expect(document.title).toBe('First-week checklist · Sajilo NZ');
  const checkbox=screen.getByRole('checkbox',{name:'Review your first-week budget'});
  expect(checkbox).toHaveFocus(); await user.click(checkbox);
  await user.click(screen.getByRole('link',{name:'Pre-departure checklist'}));
  await user.click(screen.getByRole('checkbox',{name:'Passport'}));
  await user.click(screen.getByRole('link',{name:'First-week checklist'}));
  expect(screen.getByRole('checkbox',{name:'Review your first-week budget'})).toBeChecked();
  view.unmount();mount();
  expect(screen.getByRole('heading',{name:'1 of 6 first-week steps completed'})).toBeInTheDocument();
  expect(createLocalRepository(()=>localStorage).load().progress.completed).toEqual(['passport']);
});
it('write failure keeps progress in memory and retry saves when storage returns',async()=>{
  let fail=true;let raw:string|null=null;
  const repo=createArrivalRepository(()=>({getItem:()=>raw,setItem:(_key,value)=>{if(fail)throw new Error('quota');raw=value;}}));
  render(<MemoryRouter><ArrivalPage repository={repo}/></MemoryRouter>);
  await userEvent.click(screen.getByRole('checkbox',{name:'Review your first-week budget'}));
  expect(screen.getByRole('alert')).toHaveTextContent('Could not save');
  expect(raw).toBeNull();
  fail=false;await userEvent.click(screen.getByRole('button',{name:'Try saving first-week progress again'}));
  expect(repo.load().progress.completed).toEqual(['arrival-budget']);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
it('unreadable storage has no destructive retry and remains preserved after checking',async()=>{
  localStorage.setItem(ARRIVAL_STORAGE_KEY,'{broken');mount();
  await userEvent.click(screen.getByRole('checkbox',{name:'Review your first-week budget'}));
  expect(screen.getByRole('alert')).toHaveTextContent('stored data has been kept');
  expect(screen.queryByRole('button',{name:'Try saving first-week progress again'})).not.toBeInTheDocument();
  expect(localStorage.getItem(ARRIVAL_STORAGE_KEY)).toBe('{broken');
});
it('denied storage remains usable for the session without false persistence',async()=>{
  const repo=createArrivalRepository(()=>{throw new Error('denied');});
  render(<MemoryRouter><ArrivalPage repository={repo}/></MemoryRouter>);
  expect(screen.getByRole('alert')).toHaveTextContent('storage is unavailable');
  await userEvent.click(screen.getByRole('checkbox',{name:'Review your first-week budget'}));
  expect(screen.getByRole('checkbox',{name:'Review your first-week budget'})).toBeChecked();
  expect(screen.queryByRole('button',{name:'Try saving first-week progress again'})).not.toBeInTheDocument();
});
it('labels planning as unreviewed and never auto-selects another stage at completion',()=>{
  const repo=createArrivalRepository();repo.save({version:1,completed:arrivalTasks.map(task=>task.id)});
  mount();
  expect(screen.getByText(/Unreviewed planning prompts/)).toBeInTheDocument();
  expect(screen.getByText(/no next stage is selected automatically/)).toBeInTheDocument();
  expect(createLocalRepository(()=>localStorage).load().progress.completed).toEqual([]);
});
