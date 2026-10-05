import { afterEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../App';
import { createLocalRepository } from '../checklist/repository';
import { readSaved } from './saved';
const guide = { slug:'travel-documents', language:'en', stage:'predeparture', title:'Prepare documents', summary:'A guide', body:'Check your documents.', sources:[{title:'INZ',url:'https://www.immigration.govt.nz/'}], checklist_ids:['passport'], verified_on:'2026-01-01', next_review_on:'2026-02-01', review_overdue:true };
function mount(path = '/guides') {
  localStorage.clear();
  return render(<MemoryRouter initialEntries={[path]}><App repository={createLocalRepository(() => localStorage)}/></MemoryRouter>);
}
afterEach(() => vi.unstubAllGlobals());
it('retains topic through language, detail and saved navigation without filtering the API', async () => {
  const fetch = vi.fn().mockImplementation((url: string) => Promise.resolve({ok:true,json:async()=>[{...guide,language:url.includes('lang=ne')?'ne':'en'}]}));
  vi.stubGlobal('fetch', fetch); mount('/guides?topic=documents');
  await userEvent.selectOptions(screen.getByLabelText('Guide language / भाषा'), 'ne');
  const link = await screen.findByRole('link',{name:'Prepare documents'});
  expect(link).toHaveAttribute('href','/guides/travel-documents?lang=ne&topic=documents');
  expect(screen.getByRole('link',{name:'View saved guides'})).toHaveAttribute('href','/saved?lang=ne&topic=documents');
  await userEvent.click(link);
  expect(screen.getByRole('link',{name:'All guides'})).toHaveAttribute('href','/guides?lang=ne&topic=documents');
  expect(fetch.mock.calls.every(call => !call[0].includes('topic='))).toBe(true);
});
it('filtering never withdraws unrelated saved content; a complete refresh still does', async () => {
  const fetch = vi.fn().mockResolvedValue({ok:true,json:async()=>[guide]}); vi.stubGlobal('fetch',fetch);
  mount('/guides/travel-documents');
  await userEvent.click(await screen.findByRole('button',{name:'Save guide'}));
  await userEvent.click(screen.getByRole('link',{name:'View saved guides'}));
  await screen.findByRole('link',{name:'Prepare documents'});
  await userEvent.selectOptions(screen.getByLabelText('Guide topic'),'packing');
  expect(screen.queryByRole('link',{name:'Prepare documents'})).not.toBeInTheDocument();
  expect(readSaved()[0].guide?.body).toBe(guide.body);
  fetch.mockRejectedValue(new Error('offline'));
  await userEvent.click(screen.getByRole('link',{name:'Browse all guides'}));
  await screen.findByText(/Showing saved copies only/);
  await userEvent.selectOptions(screen.getByLabelText('Guide topic'),'documents');
  expect(screen.getByRole('link',{name:'Prepare documents'})).toBeInTheDocument();
  fetch.mockResolvedValue({ok:true,json:async()=>[]});
  await userEvent.click(screen.getByRole('button',{name:'Try again'}));
  await screen.findByRole('heading',{name:'No reviewed guides available yet'});
  expect(readSaved()[0].guide).toBeNull();
});
it('does not silently treat unknown topics as all guides', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok:true,json:async()=>[guide]}));
  mount('/guides?topic=unknown');
  expect(screen.getByRole('alert')).toHaveTextContent('Topic unavailable');
  expect(screen.queryByRole('link',{name:'Prepare documents'})).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button',{name:'Show all topics'}));
  expect(await screen.findByRole('link',{name:'Prepare documents'})).toBeInTheDocument();
});
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
