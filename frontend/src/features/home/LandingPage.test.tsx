import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { App } from '../../App';
import { createLocalRepository } from '../checklist/repository';
import { landingTopics } from './landingTopics';
import { interfaceText } from '../../components/interfaceLanguage';
function Location(){const location=useLocation();return <output data-testid="location">{location.pathname+location.search}</output>;}
const mount=(path='/')=>render(<MemoryRouter initialEntries={[path]}><App repository={createLocalRepository(()=>localStorage)}/><Location/></MemoryRouter>);
beforeEach(()=>localStorage.clear());

it('offers exactly four specified photo topics without Home checklists, invented reviews or listings',()=>{
  const write=vi.spyOn(Storage.prototype,'setItem');mount();
  const region=screen.getByRole('region',{name:'Explore key topics'});
  expect(within(region).getByRole('link',{name:'Earnings & Living Expenses'})).toHaveAttribute('href','/explore/money');
  expect(within(region).getAllByRole('link')).toHaveLength(5);
  expect(landingTopics.map(topic=>topic.title)).toEqual(['Immigration & Visas','Study & Education','Earnings & Living Expenses','Work & Careers']);
  expect(region.querySelectorAll('.topic-photo')).toHaveLength(4);
  expect(within(region).queryByRole('link',{name:'Housing & Flatting'})).toBeNull();
  expect(within(region).queryByRole('link',{name:'Everyday Life & Services'})).toBeNull();
  for(const topic of landingTopics)expect(within(region).getByRole('link',{name:topic.title})).toHaveAttribute('href','/explore/'+topic.id);
  expect(screen.queryByRole('checkbox')).toBeNull();
  expect(within(screen.getByRole('region',{name:'Get to know Aotearoa'})).getAllByRole('listitem')).toHaveLength(6);
  expect(within(screen.getByRole('region',{name:'Get to know Aotearoa'})).getAllByRole('link')).toHaveLength(6);
  expect(write).not.toHaveBeenCalled();write.mockRestore();
});
it('opens a dedicated housing information page without a checklist',async()=>{
  mount('/explore');await userEvent.click(screen.getByRole('link',{name:'Housing & flatting'}));
  expect(screen.getByTestId('location')).toHaveTextContent('/explore/housing');
  expect(screen.getByRole('heading',{name:'A place to feel settled.'})).toBeInTheDocument();
  expect(screen.queryByRole('checkbox')).toBeNull();
});
it('retains route and filter context when choosing Nepali, with explicit English interface fallback',async()=>{
  mount('/explore?category=money&topic=documents');await userEvent.click(screen.getByRole('button',{name:'Switch to Nepali'}));
  expect(screen.getByTestId('location')).toHaveTextContent('/explore/money?topic=documents&lang=ne');
  expect(screen.queryByText(/Interface shown in English/)).not.toBeInTheDocument();
  expect(screen.getByRole('link',{name:'Journey Planner'})).toHaveAttribute('href','/journey?lang=ne');
  expect(interfaceText('ne','tagline').language).toBe('ne');expect(interfaceText('ne','fallback').language).toBe('en');
  await userEvent.click(screen.getByRole('button',{name:'Switch to English'}));
  expect(screen.getByTestId('location')).toHaveTextContent('/explore/money?topic=documents');
  expect(screen.getByRole('button',{name:'Switch to Nepali'})).toHaveTextContent('नेपाली');
  expect(screen.getByRole('button',{name:'Switch to Nepali'}).querySelector('svg')).toHaveAttribute('aria-hidden','true');
});
it('Community offers real existing starting points without fictional listings or checklists',async()=>{
  const fetch=vi.spyOn(globalThis,'fetch').mockResolvedValue({ok:true,json:async()=>({results:[],count:0,next:null,facets:{city:[],kind:[],category:[]}})} as Response);
  mount('/community');
  expect(await screen.findByText('No published listings match')).toBeInTheDocument();
  expect(screen.getByRole('link',{name:'Christchurch preparation'})).toHaveAttribute('href','/cities/christchurch');
  expect(screen.queryByRole('checkbox')).toBeNull();
  fetch.mockRestore();
});
it('exposes Journey as current to assistive technology on checklist detail routes',()=>{
  mount('/predeparture');
  expect(screen.getByRole('link',{name:'Journey Planner'})).toHaveAttribute('aria-current','page');
  expect(screen.getByRole('link',{name:'Home'})).not.toHaveAttribute('aria-current');
});
