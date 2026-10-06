import type { Page } from '@playwright/test';
export async function openNavigation(page: Page) {
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  if (await menu.isVisible() && await menu.getAttribute('aria-expanded') === 'false') await menu.click();
}
export async function navigateSidebar(page: Page, name: string) {
  await openNavigation(page);
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  if (name === 'First-week checklist' || name === 'Pre-departure checklist') {
    if (!await nav.locator('.journey-menu').getAttribute('open').then(value => value !== null)) await nav.locator('.journey-menu summary').click();
  }
  await nav.getByRole('link', { name, exact: true }).click();
}
