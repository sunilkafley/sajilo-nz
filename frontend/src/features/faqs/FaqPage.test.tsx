import { expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../App';
import { createLocalRepository } from '../checklist/repository';

it('opens FAQs from the main navigation and expands and collapses an answer', async () => {
  render(<MemoryRouter><App repository={createLocalRepository(()=>localStorage)}/></MemoryRouter>);
  const navigation = within(screen.getByRole('navigation', { name: 'Main navigation' }));
  expect(navigation.queryByRole('link', { name: 'Community' })).toBeNull();
  await userEvent.click(navigation.getByRole('link', { name: 'FAQs' }));
  expect(navigation.getByRole('link', { name: 'FAQs' })).toHaveAttribute('aria-current', 'page');
  expect(document.title).toBe('FAQs · Sajilo NZ');
  expect(screen.getByRole('heading', { name: 'Frequently asked questions' })).toBeInTheDocument();
  const question = screen.getByText('How easy is it to find work in New Zealand?');
  const accordion = question.closest('details')!;
  expect(accordion).not.toHaveAttribute('open');
  await userEvent.click(question);
  expect(accordion).toHaveAttribute('open');
  expect(within(accordion).getByRole('link', { name: 'Explore work and careers' })).toHaveAttribute('href', '/explore/work');
  await userEvent.click(question);
  expect(accordion).not.toHaveAttribute('open');
});

it('explains the English fallback and preserves Nepali context in FAQ links', async () => {
  render(<MemoryRouter initialEntries={['/faqs?lang=ne']}><App repository={createLocalRepository(()=>localStorage)}/></MemoryRouter>);
  expect(screen.getByText(/These FAQs are available in English/)).toBeInTheDocument();
  await userEvent.click(screen.getByText('How easy is it to find work in New Zealand?'));
  expect(screen.getByRole('link', { name: 'Explore work and careers' })).toHaveAttribute('href', '/explore/work?lang=ne');
});


