import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';

test('simple general article draft and publication needs review but no source', async ({page,request},testInfo)=>{
  await page.goto('http://127.0.0.1:8000/admin/editorial/article/add/');
  await page.getByLabel('Username:').fill('editorial-test-admin');
  await page.getByLabel('Password:',{exact:true}).fill('isolated-editorial-test-only');
  await page.getByRole('button',{name:'Log in'}).click();
  const title=`Synthetic welcome ${testInfo.project.name}`;
  await page.getByLabel('Title:',{exact:true}).fill(title);
  await page.getByLabel('Topic:',{exact:true}).selectOption('community');
  await page.getByLabel('Article type:',{exact:true}).selectOption('general');
  await page.getByLabel('Summary:',{exact:true}).fill('Isolated browser test, not production content.');
  await page.getByLabel('Content:',{exact:true}).fill('Synthetic original introduction.');
  await expect(page.getByLabel('Source URL:',{exact:true})).not.toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.screenshot({path:fileURLToPath(new URL(`../../docs/screenshots/article-admin/form-${testInfo.project.name}.png`,import.meta.url)),fullPage:true});
  await page.getByRole('button',{name:'Save and continue editing'}).click();
  await expect(page.getByText('was added successfully',{exact:false})).toBeVisible();
  await page.getByLabel('Status:',{exact:true}).selectOption('published');
  await page.getByRole('button',{name:'Save and continue editing'}).click();
  await expect(page.getByText('Publication requires an actual human reviewer, review date and next review date.',{exact:true})).toBeVisible();
  // Explicit synthetic review only inside the temporary test database.
  await page.getByLabel('Reviewed by:',{exact:true}).selectOption({label:'editorial-test-admin'});
  await page.getByLabel('Reviewed on:',{exact:true}).fill('2026-01-01');
  await page.getByLabel('Next review on:',{exact:true}).fill('2026-02-01');
  await page.getByRole('button',{name:'Save and continue editing'}).click();
  const slug=`synthetic-welcome-${testInfo.project.name}`;
  const result=await (await request.get(`/api/explore/articles/${slug}/`)).json();
  expect(result.article_type).toBe('general');expect(result.source_kind).toBeNull();
  await page.goto(`/#/explore/community/${slug}`);
  await expect(page.getByRole('heading',{name:title})).toBeVisible();
  await expect(page.getByText(/not official guidance/)).toBeVisible();
  await expect(page.getByRole('link',{name:/Official source:/})).toHaveCount(0);
});

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
