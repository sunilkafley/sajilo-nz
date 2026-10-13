import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../App';
import { createLocalRepository } from '../checklist/repository';
import { categories } from './catalog';

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());
const mount=()=>render(<MemoryRouter initialEntries={['/explore']}><App repository={createLocalRepository(()=>localStorage)}/></MemoryRouter>);
it('offers all topic, introduction and city destinations without claiming published content',()=>{
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch);mount();
  expect(screen.getByRole('main')).toHaveFocus();
  expect(document.title).toBe('Explore · Sajilo NZ');
  const topics=screen.getByRole('region',{name:'Explore by topic'});
  expect(within(topics).getAllByRole('link')).toHaveLength(12);
  for(const category of categories)expect(within(topics).getByRole('link',{name:category.title})).toHaveAttribute('href',category.to);
  expect(within(screen.getByRole('region',{name:'Get to know Aotearoa'})).getAllByRole('link')).toHaveLength(6);
  expect(within(screen.getByRole('region',{name:'Find your city'})).getByRole('link',{name:'Christchurch'})).toHaveAttribute('href','/cities/christchurch');
  expect(fetch).not.toHaveBeenCalled();
});
it('keeps checklists in Journey and retains progress through the topic page',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({results:[],count:0,next:null})}));
  mount();const user=userEvent.setup();
  await user.click(screen.getByRole('link',{name:'Prepare to travel'}));
  expect(screen.queryByRole('checkbox')).toBeNull();
  await user.click(screen.getByRole('link',{name:'Open pre-departure checklist'}));
  await user.click(screen.getByRole('checkbox',{name:'Passport'}));
  await user.click(screen.getByRole('link',{name:'Explore'}));
  await user.click(screen.getByRole('link',{name:'Prepare to travel'}));
  await user.click(screen.getByRole('link',{name:'Open pre-departure checklist'}));
  expect(screen.getByRole('checkbox',{name:'Passport'})).toBeChecked();
});
