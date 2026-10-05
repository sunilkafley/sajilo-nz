import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';
import { createLocalRepository, STORAGE_KEY } from './features/checklist/repository';
it('completes a task, navigates home and restores it after remount', async () => {
  localStorage.clear(); const repo = createLocalRepository(() => localStorage); const user = userEvent.setup();
  const view = render(<MemoryRouter initialEntries={['/predeparture']}><App repository={repo}/></MemoryRouter>);
  await user.click(screen.getByRole('checkbox', { name: 'Passport' }));
  expect(screen.getByRole('heading', { name: '1 of 27 completed' })).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Home' }));
  expect(screen.getByRole('link', { name: 'Continue my checklist' })).toBeInTheDocument();
  view.unmount();
  render(<MemoryRouter initialEntries={['/predeparture']}><App repository={repo}/></MemoryRouter>);
  expect(screen.getByRole('checkbox', { name: 'Passport' })).toBeChecked();
});
it('warns on failed writes and allows retry without losing selected tasks', async () => {
  let fail = true; let saved = '';
  const repo = createLocalRepository(() => ({getItem: () => null, setItem: (_k,v) => { if(fail) throw new Error('full'); saved = v; }}));
  render(<MemoryRouter initialEntries={['/predeparture']}><App repository={repo}/></MemoryRouter>);
  const user = userEvent.setup();
  await user.click(screen.getByRole('checkbox', {name:'Passport'}));
  expect(screen.getByRole('alert')).toHaveTextContent('Could not save');
  fail = false; await user.click(screen.getByRole('button',{name:'Try saving again'}));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument(); expect(JSON.parse(saved).completed).toEqual(['passport']);
});
it('keeps malformed storage unchanged and hides the destructive retry action', async () => {
  localStorage.setItem(STORAGE_KEY, '{broken');
  render(<MemoryRouter initialEntries={['/predeparture']}><App repository={createLocalRepository(() => localStorage)}/></MemoryRouter>);
  await userEvent.click(screen.getByRole('checkbox',{name:'Passport'}));
  expect(screen.getByRole('alert')).toHaveTextContent('stored data has been kept');
  expect(screen.queryByRole('button',{name:'Try saving again'})).not.toBeInTheDocument();
  expect(localStorage.getItem(STORAGE_KEY)).toBe('{broken');
});
