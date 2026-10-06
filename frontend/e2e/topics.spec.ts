import { test, expect } from '@playwright/test';

test('Explore topic retains Nepali context through saved offline reading', async ({ page, context }) => {
  await page.goto('/#/explore');
  await expect(page.locator('.offline-status')).toHaveAttribute('data-offline-ready','true');
  await page.getByRole('link', {name:'Documents Browse guides'}).click();
  await expect(page.getByLabel('Guide topic')).toHaveValue('documents');
  await page.getByLabel('Guide language / भाषा').selectOption('ne');
  await page.getByRole('link', {name:'परीक्षण यात्रा कागजात', exact:true}).click();
  await expect(page).toHaveURL(/lang=ne&topic=documents/);
  await page.getByRole('button', {name:'Save guide',exact:true}).click();
  await page.getByRole('link', {name:'All guides',exact:true}).click();
  await page.getByLabel('Guide topic').selectOption('packing');
  await expect(page.getByRole('heading', {name:'No reviewed guides available yet'})).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sajilo-nz.saved-guides.v1')!).items[0].guide.body)).toContain('यो नेपाली');
  await context.setOffline(true);
  await page.getByRole('link', {name:'View saved guides'}).click();
  await expect(page.getByText('Showing saved copies only.', {exact:false})).toBeVisible();
  await page.getByLabel('Guide topic').selectOption('documents');
  await page.getByRole('link', {name:'परीक्षण यात्रा कागजात',exact:true}).click();
  await expect(page.locator('article.guide-body')).toHaveAttribute('lang','ne');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('unknown topic offers explicit recovery without showing unrelated guidance', async ({page}) => {
  await page.goto('/#/guides?topic=not-a-topic');
  await expect(page.getByRole('alert')).toContainText('Topic unavailable');
  await expect(page.getByRole('link',{name:'Test travel documents'})).toHaveCount(0);
  await page.getByRole('button',{name:'Show all topics'}).click();
  await expect(page.getByRole('link',{name:'Test travel documents'})).toBeVisible();
});
