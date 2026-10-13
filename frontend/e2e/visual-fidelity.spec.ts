import { test, expect } from '@playwright/test';
import { openNavigation } from './navigation';

test('centred dashboard keeps balanced margins, logo and responsive navigation', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One capture set includes all requested widths.');
  for (const width of [1280,1440,1920,390]) {
    await page.setViewportSize({width,height:1000});
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const main=await page.getByRole('main').boundingBox();
    const workspace=await page.locator('.workspace').boundingBox();
    const grid=await page.locator('.home-grid').boundingBox();
    expect(main!.width).toBeLessThanOrEqual(1440);
    expect(main!.x-workspace!.x).toBeCloseTo(workspace!.x+workspace!.width-main!.x-main!.width,0);
    const welcome=await page.locator('.home-welcome').boundingBox();
    expect(welcome!.x).toBeCloseTo(grid!.x,0);expect(welcome!.width).toBeCloseTo(grid!.width,0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const logo=await page.locator('.sajilo-logo').boundingBox();expect(logo!.width/logo!.height).toBeCloseTo(3,2);
    await page.screenshot({path:testInfo.outputPath(`home-${width}.png`),fullPage:true});
  }
  await openNavigation(page);
  await page.getByRole('link',{name:'Explore',exact:true}).focus();await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.getByRole('button',{name:'Menu',exact:true})).toHaveAttribute('aria-expanded','false');
  await page.getByRole('combobox',{name:'Search Sajilo NZ guides, checklists and topics'}).fill('budget');
  await expect(page.getByRole('option').first()).toContainText('Budget checklist');
  await page.screenshot({path:testInfo.outputPath('search-mobile.png')});
  await page.setViewportSize({width:1920,height:1000});
  await page.screenshot({path:testInfo.outputPath('search-desktop.png')});
  await page.getByRole('option',{name:'View all results',exact:true}).click();
  await expect(page.locator('.search-results')).toContainText('Budget checklist');
  await page.reload();
  await expect(page.locator('.search-results')).toContainText('Budget checklist');
  await page.screenshot({path:testInfo.outputPath('search-results.png')});
  await page.goto('/#/guides/test-documents');
  await expect(page.locator('article.guide-body')).toBeVisible();
  expect((await page.getByRole('main').boundingBox())!.width).toBeLessThanOrEqual(960);
});
