import { test, expect } from '@playwright/test';

test('New Zealand clock fits the top-right header alongside working controls', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T11:00:00Z') });
  await page.goto('/');
  for (const width of [320, 390, 768, 1050, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const clock = page.locator('.nz-clock');
    await expect(clock).toContainText('2 Jan 2026');
    await expect(clock).toContainText(/12:00\s*am/);
    const box = (await clock.boundingBox())!;
    const logo = (await page.locator('.brand-link').boundingBox())!;
    expect(box.x).toBeGreaterThan(logo.x + logo.width);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
  await page.getByRole('button', { name: 'Switch to Nepali' }).click();
  await expect(page.locator('.nz-clock')).toBeVisible();
  await page.getByRole('link', { name: 'Search Sajilo NZ' }).click();
  await expect(page).toHaveURL(/search/);
  await expect(page.locator('.nz-clock')).toBeVisible();
});
