import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../App';
import { createLocalRepository } from '../checklist/repository';

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());
const renderExplore = () => render(<MemoryRouter initialEntries={['/explore']}><App repository={createLocalRepository(() => localStorage)}/></MemoryRouter>);

it('offers implemented destinations without making planned topics or cities interactive', () => {
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  renderExplore();
  const main = screen.getByRole('main');
  expect(document.title).toBe('Explore · Sajilo NZ');
  expect(main).toHaveFocus();
  expect(screen.getByRole('link', {name:'Explore'})).toHaveAttribute('aria-current', 'page');
  expect(within(main).getAllByRole('link').map(link => link.getAttribute('href'))).toEqual(['/search', '/saved', '/guides?topic=documents', '/guides?topic=packing', '/guides?topic=money', '/guides?topic=travel-checks', '/predeparture', '/sources', '/firstweek', '/cities/christchurch']);
  const plannedCategory = screen.getByRole('article', {name:'Study & courses'});
  expect(plannedCategory).toHaveTextContent('Planned');
  expect(within(plannedCategory).queryByRole('link')).not.toBeInTheDocument();
  for (const name of ['Get to know Aotearoa']) {
    const region = screen.getByRole('region', {name});
    expect(within(region).queryByRole('link')).not.toBeInTheDocument();
    expect(within(region).queryByRole('button')).not.toBeInTheDocument();
    expect(region).toHaveTextContent('Planned');
  }
  const cities = screen.getByRole('region', {name:'Find your city'});
  expect(within(cities).getAllByRole('link')).toHaveLength(1);
  expect(within(cities).getByRole('link',{name:'Christchurch'})).toHaveAttribute('href','/cities/christchurch');
  expect(fetch).not.toHaveBeenCalled();
});

it('keeps checklist progress when a guest returns through Explore', async () => {
  renderExplore();
  const user = userEvent.setup();
  await user.click(screen.getByRole('link', {name:'Prepare to travel'}));
  await user.click(screen.getByRole('checkbox', {name:'Passport'}));
  await user.click(screen.getByRole('link', {name:'Explore'}));
  await user.click(screen.getByRole('link', {name:'Prepare to travel'}));
  expect(screen.getByRole('checkbox', {name:'Passport'})).toBeChecked();
  expect(screen.getByRole('heading', {name:'1 of 27 completed'})).toBeInTheDocument();
});
