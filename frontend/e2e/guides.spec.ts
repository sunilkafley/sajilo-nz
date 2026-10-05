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

test('guest finds a reviewed Nepali guide and follows its task through reload', async ({page}) => {
  const response = await page.request.get('/api/guides/?lang=ne');
  expect(response.ok()).toBe(true);
  const guide = (await response.json()).find((item: {slug: string}) => item.slug === 'test-bilingual-documents');
  expect(guide).toBeTruthy();
  await page.goto('/#/guides');
  await page.getByLabel('Guide language / भाषा').selectOption('ne');
  await page.getByRole('searchbox').fill('यात्रा कागजात');
  await page.getByRole('link', {name:'परीक्षण यात्रा कागजात', exact:true}).click();
  const body = page.locator('article.guide-body');
  await expect(body).toHaveAttribute('lang', 'ne');
  await expect(body).toContainText('यो नेपाली सामग्री परीक्षणका लागि मात्र हो।');
  await expect(body.locator('time').nth(0)).toHaveAttribute('datetime', guide.verified_on);
  await expect(body.locator('time').nth(1)).toHaveAttribute('datetime', guide.next_review_on);
  await expect(page.getByRole('link', {name:'Immigration New Zealand'})).toHaveAttribute('href', guide.sources[0].url);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', {name:'Save guide', exact:true}).click();
  await expect(page.getByText('Guide saved to this browser.', {exact:true})).toBeVisible();
  await page.getByRole('link', {name:'Passport', exact:true}).click();
  const checkbox = page.getByRole('checkbox', {name:'Passport', exact:true});
  await expect(checkbox).toBeFocused();
  await checkbox.check();
  await page.reload();
  await expect(checkbox).toBeChecked();
});
