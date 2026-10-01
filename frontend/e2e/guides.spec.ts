import { test, expect } from '@playwright/test';
test('real API guide to checklist journey persists and handles unavailable translation', async ({page}) => {
  await page.goto('/#/guides');
  await page.getByRole('link',{name:'Test travel documents'}).click();
  await expect(page.getByText('This guide exists only in an isolated test database.')).toBeVisible();
  await expect(page.getByRole('link',{name:'Immigration New Zealand'})).toHaveAttribute('href','https://www.immigration.govt.nz/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('link',{name:'Passport',exact:true}).click();
  const checkbox = page.getByRole('checkbox',{name:'Passport',exact:true});
  await expect(checkbox).toBeFocused();
  await checkbox.check(); await page.reload(); await expect(checkbox).toBeChecked();
  await page.goto('/#/guides/test-documents?lang=ne');
  await expect(page.getByRole('heading',{name:'Guide unavailable in this language'})).toBeVisible();
});
test('guide request failure is recoverable and checklist remains accessible', async ({page}) => {
  await page.route('**/api/guides/**', route => route.fulfill({status:503,body:'Unavailable'}));
  await page.goto('/#/guides');
  await expect(page.getByRole('alert')).toContainText('Guides are unavailable');
  await page.unroute('**/api/guides/**');
  await page.getByRole('button',{name:'Try again'}).click();
  await expect(page.getByRole('link',{name:'Test travel documents'})).toBeVisible();
});
