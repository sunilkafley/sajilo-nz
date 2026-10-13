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

it('offers exactly six specified topics without Home checklists, invented reviews or listings',()=>{
  const write=vi.spyOn(Storage.prototype,'setItem');mount();
  const region=screen.getByRole('region',{name:'Explore key topics'});
  expect(within(region).getAllByRole('link')).toHaveLength(7);
  for(const topic of landingTopics)expect(within(region).getByRole('link',{name:topic.title})).toHaveAttribute('href','/explore?category='+topic.id);
  expect(screen.queryByRole('checkbox')).toBeNull();
  expect(within(screen.getByRole('region',{name:'Get to know Aotearoa'})).getAllByRole('listitem')).toHaveLength(6);
  expect(within(screen.getByRole('region',{name:'Get to know Aotearoa'})).queryByRole('link')).toBeNull();
  expect(write).not.toHaveBeenCalled();write.mockRestore();
});
it('opens an honest contextual directory section, never a fictitious topic page',async()=>{
  mount();await userEvent.click(screen.getByRole('link',{name:'Housing & Flatting'}));
  expect(screen.getByTestId('location')).toHaveTextContent('/explore?category=housing');
  expect(screen.getByRole('region',{name:'Housing & Flatting'})).toHaveTextContent('Reviewed resources for this topic are not available yet');
  expect(screen.queryByRole('checkbox')).toBeNull();
});
it('retains route and filter context when choosing Nepali, with explicit English interface fallback',async()=>{
  mount('/explore?category=money&topic=documents');await userEvent.selectOptions(screen.getByLabelText('Language / भाषा'),'ne');
  expect(screen.getByTestId('location')).toHaveTextContent('/explore?category=money&topic=documents&lang=ne');
  expect(screen.getByText(/Interface shown in English/)).toHaveAttribute('lang','en');
  expect(screen.getByRole('link',{name:'Journey'})).toHaveAttribute('href','/journey?lang=ne');
  expect(interfaceText('ne','tagline').language).toBe('ne');expect(interfaceText('ne','fallback').language).toBe('en');
});
it('Community offers real existing starting points without fictional listings or checklists',()=>{
  mount('/community');
  expect(screen.getByText(/No community, event or business listings/)).toBeInTheDocument();
  expect(screen.getByRole('link',{name:'Explore Christchurch preparation'})).toHaveAttribute('href','/cities/christchurch');
  expect(screen.queryByRole('checkbox')).toBeNull();
});
it('exposes Journey as current to assistive technology on checklist detail routes',()=>{
  mount('/predeparture');
  expect(screen.getByRole('link',{name:'Journey'})).toHaveAttribute('aria-current','page');
  expect(screen.getByRole('link',{name:'Home'})).not.toHaveAttribute('aria-current');
});
