import { act, render, screen, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { NewZealandClock } from './NewZealandClock';

afterEach(() => { cleanup(); vi.useRealTimers(); });

it.each([
  ['2026-01-01T11:00:00Z', '2 Jan 2026', '12:00 am'],
  ['2026-07-01T00:00:00Z', '1 Jul 2026', '12:00 pm'],
])('shows Auckland date and time for %s, including daylight saving', (instant, date, time) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(instant));
  render(<NewZealandClock/>);
  const clock = screen.getByText(/2026/, { selector: 'time' });
  expect(clock.textContent).toContain(date);
  expect(clock.textContent?.replace(/\s/g, ' ')).toContain(time);
});

it('updates the date and time across midnight and clears its timer on unmount', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-01T10:59:59Z'));
  const { unmount } = render(<NewZealandClock/>);
  act(() => { vi.advanceTimersByTime(1000); });
  expect(screen.getByText(/2 Jan 2026/)).toHaveAttribute('datetime', '2026-01-01T11:00:00.000Z');
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
