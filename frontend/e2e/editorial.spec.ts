import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';

test('editorial API never reveals drafts or missing translations', async ({ request }) => {
  const response = await request.get('/api/explore/articles/?topic=study');
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['cache-control']).toContain('no-store');
  expect((await response.json()).results.map((row: { slug: string }) => row.slug)).toEqual(['editorial-public']);
  expect((await request.get('/api/explore/articles/editorial-draft/')).status()).toBe(404);
  expect((await (await request.get('/api/explore/articles/?q=Private')).json()).count).toBe(0);
  expect((await request.get('/api/explore/articles/editorial-public/?lang=ne')).status()).toBe(404);
});

test('admin saved-draft preview is private, readable and non-cacheable', async ({ page }, testInfo) => {
  await page.setViewportSize(testInfo.project.name === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 1000 });
  await page.goto('http://127.0.0.1:8000/admin/editorial/article/');
  await expect(page.getByLabel('Username:')).toBeVisible();
  await page.getByLabel('Username:').fill('editorial-test-admin');
  await page.getByLabel('Password:', { exact: true }).fill('isolated-editorial-test-only');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('link', { name: 'Synthetic draft article', exact: true }).click();
  await expect(page.getByLabel('Status:', { exact: true })).toHaveValue('draft');
  const previewResponse = page.waitForResponse(response => response.url().endsWith('/preview/'));
  await page.getByRole('link', { name: 'Preview saved record' }).click();
  expect((await previewResponse).headers()['cache-control']).toContain('no-store');
  await expect(page.getByText('Staff-only saved-record preview — not public.', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Synthetic section' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  const previewUrl = page.url();
  const stored = await page.evaluate(async () => {
    const urls: string[] = [];
    for (const name of await caches.keys()) {
      for (const request of await (await caches.open(name)).keys()) urls.push(request.url);
    }
    return { urls, storage: Object.keys(localStorage), values: Object.values(localStorage) };
  });
  expect(stored.urls).not.toContain(previewUrl);
  // Django may save its theme preference; editorial content must never be saved.
  expect(stored.storage.filter(key => key.startsWith('sajilo'))).toEqual([]);
  expect(stored.values.join(' ')).not.toContain('Draft body for staff preview.');
  await page.screenshot({ path: fileURLToPath(new URL(`../../docs/screenshots/editorial/preview-${testInfo.project.name}.png`, import.meta.url)), fullPage: true });
  // The first interactive content link is usable by keyboard, not only a pointer.
  const returnLink = page.getByRole('link', { name: 'Return to record' });
  await returnLink.focus();
  await expect(returnLink).toBeFocused();
  await returnLink.press('Enter');
  await expect(page.getByLabel('Status:', { exact: true })).toHaveValue('draft');
  await page.context().clearCookies();
  await page.goto(previewUrl);
  await expect(page.getByLabel('Username:')).toBeVisible();
  await expect(page.getByText('Draft body for staff preview.')).toHaveCount(0);
});
