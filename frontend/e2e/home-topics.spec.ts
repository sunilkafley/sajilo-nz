import { test, expect } from '@playwright/test';

test('homepage topics fit above mobile navigation without scrolling', async ({ page }, testInfo) => {
  for (const viewport of [{ width: 390, height: 664 }, { width: 360, height: 640 }, { width: 320, height: 640 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/#/?lang=ne');
    await expect(page.locator('.language-fallback')).toHaveCount(0);
    const topics = page.locator('.landing-topic');
    await expect(topics).toHaveCount(4);
    const navigation = await page.locator('.public-navigation').boundingBox();
    for (const topic of await topics.all()) {
      await expect(topic).toBeVisible();
      const bounds = await topic.boundingBox();
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(navigation!.y);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && scrollY === 0)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`topics-${viewport.width}.png`), fullPage: false });
  }
  await page.getByRole('link', { name: 'Study & Education', exact: true }).click();
  await expect(page).toHaveURL(/explore\/study\?lang=ne/);
});
