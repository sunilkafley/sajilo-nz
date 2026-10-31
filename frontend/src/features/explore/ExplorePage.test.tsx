import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../App';
import { createLocalRepository } from '../checklist/repository';
import { categories } from './catalog';
import { cityPhotos } from './cityPhotos';

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());
const mount=(path='/explore')=>render(<MemoryRouter initialEntries={[path]}><App repository={createLocalRepository(()=>localStorage)}/></MemoryRouter>);
it('offers all topic, introduction and city destinations without claiming published content',()=>{
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch);mount();
  expect(screen.getByRole('main')).toHaveFocus();
  expect(document.title).toBe('Explore · Sajilo NZ');
  const topics=screen.getByRole('region',{name:'Explore by topic'});
  expect(within(topics).getAllByRole('link')).toHaveLength(12);
  for(const category of categories)expect(within(topics).getByRole('link',{name:category.title})).toHaveAttribute('href',category.to);
  expect(screen.queryByRole('region',{name:'Get to know Aotearoa'})).toBeNull();
  expect(screen.getByRole('link',{name:'Learn about New Zealand'})).toHaveAttribute('href','/#landing-aotearoa');
  expect(within(screen.getByRole('region',{name:'Find information about your city'})).getByRole('link',{name:'Christchurch'})).toHaveAttribute('href','/cities/christchurch');
  for(const [city,photo] of Object.entries(cityPhotos)){
    const card=screen.getByRole('link',{name:city});
    expect(within(card).getByRole('img',{name:photo.landmark})).toHaveAttribute('src',photo.photo);
  }
  expect(fetch).not.toHaveBeenCalled();
});
it('opens the Home introduction section with language and keyboard focus preserved',async()=>{
  mount('/explore?lang=ne');
  const link=screen.getByRole('link',{name:'Learn about New Zealand'});
  expect(link).toHaveAttribute('href','/?lang=ne#landing-aotearoa');
  await userEvent.click(link);
  expect(screen.getByRole('heading',{name:'Get to know Aotearoa'})).toHaveFocus();
  expect(screen.getByRole('region',{name:'Get to know Aotearoa'})).toBeInTheDocument();
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
