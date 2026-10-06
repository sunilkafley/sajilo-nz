import { expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../App';
import { SajiloLogo } from './SajiloLogo';
import { navigationItems } from './MainNavigation';
import { createLocalRepository } from '../features/checklist/repository';

it('uses the unchanged approved image and both approved accessible taglines',()=>{
  const view=render(<SajiloLogo/>);
  const logo=screen.getByRole('img',{name:'Sajilo NZ — Your New Zealand journey companion'});
  expect(logo).toHaveAttribute('width','2172');expect(logo).toHaveAttribute('height','724');
  const src=logo.getAttribute('src');view.rerender(<SajiloLogo language="ne"/>);
  expect(screen.getByRole('img',{name:'Sajilo NZ — तपाईंको न्युजिल्यान्ड सहयात्री'})).toHaveAttribute('src',src);
  expect(screen.getByRole('img')).toHaveAttribute('lang','ne');
});
it('keeps one reusable navigation with original routes and active states; audience is not student-only',()=>{
  localStorage.clear();render(<MemoryRouter><App repository={createLocalRepository(()=>localStorage)}/></MemoryRouter>);
  const nav=screen.getByRole('navigation',{name:'Main navigation'});
  expect(within(nav).getAllByRole('link')).toHaveLength(7);
  for(const item of navigationItems) expect(within(nav).getByRole('link',{name:item.label})).toHaveAttribute('href',item.to);
  expect(within(nav).getByRole('link',{name:'Home'})).toHaveAttribute('aria-current','page');
  expect(screen.getByRole('img')).toBeInTheDocument();
  expect(screen.queryByText('Your student journey')).toBeNull();expect(screen.queryByText('My student space')).toBeNull();
  expect(screen.getByText(/For Nepalese students, workers, partners, families and newcomers/)).toBeInTheDocument();
  expect(screen.queryByText('Your New Zealand journey companion')).toBeNull();
});
