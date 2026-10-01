import { afterEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../App';
import { createLocalRepository } from '../checklist/repository';
const guide = { slug:'travel-documents', language:'en', stage:'predeparture', title:'Prepare documents', summary:'A guide', body:'Check your documents.', sources:[{title:'INZ',url:'https://www.immigration.govt.nz/'}], checklist_ids:['passport'], verified_on:'2026-01-01', next_review_on:'2026-02-01', review_overdue:true };
function mount(path = '/guides') {
  localStorage.clear();
  return render(<MemoryRouter initialEntries={[path]}><App repository={createLocalRepository(() => localStorage)}/></MemoryRouter>);
}
afterEach(() => vi.unstubAllGlobals());
it('reads a guide, shows overdue review and follows a task to persistent checklist', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok:true,json:async()=>[guide]}));
  mount();
  await userEvent.click(await screen.findByRole('link',{name:'Prepare documents'}));
  expect(await screen.findByText('Check your documents.')).toBeInTheDocument();
  expect(screen.getByText('Review due — check the official sources for updates.')).toHaveAttribute('role', 'status');
  await userEvent.click(screen.getByRole('link',{name:'Passport'}));
  const checkbox = screen.getByRole('checkbox',{name:'Passport'});
  expect(checkbox).toHaveFocus();
  await userEvent.click(checkbox);
  expect(checkbox).toBeChecked();
});
it('shows empty translated content without silently falling back', async () => {
  const fetch = vi.fn().mockResolvedValue({ok:true,json:async()=>[]}); vi.stubGlobal('fetch',fetch);
  mount('/guides/travel-documents?lang=ne');
  expect(await screen.findByRole('heading',{name:'Guide unavailable in this language'})).toBeInTheDocument();
  expect(fetch.mock.calls[0][0]).toBe('/api/guides/?lang=ne');
});
it('recovers from an API failure on retry', async () => {
  const fetch = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ok:true,json:async()=>[]});
  vi.stubGlobal('fetch', fetch); mount();
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not connect');
  await userEvent.click(screen.getByRole('button',{name:'Try again'}));
  expect(await screen.findByRole('heading',{name:'No reviewed guides available yet'})).toBeInTheDocument();
});
it('rejects malformed content and unsafe source URLs', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok:true,json:async()=>[{...guide,sources:[{title:'Unsafe',url:'javascript:alert(1)'}]}]}));
  mount(); expect(await screen.findByRole('alert')).toHaveTextContent('Unexpected guide data');
  expect(screen.queryByRole('link',{name:'Unsafe'})).not.toBeInTheDocument();
});
it('keeps a saved copy on API failure and removes its body after a successful withdrawal check', async () => {
  const fetch = vi.fn().mockResolvedValue({ok:true,json:async()=>[guide]}); vi.stubGlobal('fetch',fetch);
  mount('/guides/travel-documents');
  await userEvent.click(await screen.findByRole('button',{name:'Save guide'}));
  fetch.mockRejectedValue(new Error('offline'));
  await userEvent.click(screen.getByRole('link',{name:'View saved guides'}));
  expect(await screen.findByText(/Showing saved copies only/)).toBeInTheDocument();
  expect(screen.getByRole('link',{name:'Prepare documents'})).toBeInTheDocument();
  fetch.mockResolvedValue({ok:true,json:async()=>[]});
  await userEvent.click(screen.getByRole('button',{name:'Try again'}));
  expect(await screen.findByText(/This guide is no longer available/)).toBeInTheDocument();
  expect(screen.queryByRole('link',{name:'Prepare documents'})).not.toBeInTheDocument();
});
