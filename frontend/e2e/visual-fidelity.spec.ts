import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { openNavigation } from './navigation';

test('same-viewport prototype comparison and responsive shell', async ({ page, browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One deterministic desktop reference capture.');
  await page.setViewportSize({width:2492,height:1305});
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.sajilo-logo')).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('home-updated-2492.png')});
  const referenceContext = await browser.newContext({viewport:{width:2492,height:1305},deviceScaleFactor:1,serviceWorkers:'block'});
  const reference = await referenceContext.newPage();
  const files: Record<string,string> = {'/':'../prototype/index.html','/app.js':'../prototype/app.js','/style.css':'../prototype/style.css','/dm.ttf':'src/assets/fonts/dm-sans.ttf','/manrope.ttf':'src/assets/fonts/manrope.ttf'};
  await reference.route('http://prototype.test/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (!files[path]) return route.abort();
    let body: string | Buffer = await readFile(files[path]);
    if (path === '/style.css') body = body.toString().replace(/@import url\([^)]*\);/, '') + "\n@font-face{font-family:'DM Sans';src:url('/dm.ttf');font-weight:100 1000}@font-face{font-family:Manrope;src:url('/manrope.ttf');font-weight:200 800}";
    await route.fulfill({body,contentType:path.endsWith('.css')?'text/css':path.endsWith('.js')?'text/javascript':path.endsWith('.ttf')?'font/ttf':'text/html'});
  });
  await reference.addInitScript(() => localStorage.setItem('sajilo-prototype',JSON.stringify({onboarded:true,stage:'Near graduation',city:'Christchurch'})));
  await reference.goto('http://prototype.test/#home');
  await reference.evaluate(() => document.fonts.ready);
  await reference.screenshot({path:testInfo.outputPath('home-prototype-2492.png')});
  for (const [current, original] of [['.sidebar','.sidebar'],['.topbar','.topbar'],['.home-grid','.dashboard-grid'],['.home-hero','.journey-hero']] as const) {
    const actual=await page.locator(current).boundingBox(); const target=await reference.locator(original).boundingBox();
    expect(actual).not.toBeNull();expect(target).not.toBeNull();
    expect(actual!.x).toBeCloseTo(target!.x,0);expect(actual!.width).toBeCloseTo(target!.width,0);
    if(current!=='.sidebar') expect(Math.abs(actual!.y-target!.y)).toBeLessThan(4);
  }
  await referenceContext.close();
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const logo=await page.locator('.sajilo-logo').boundingBox();expect(logo!.width/logo!.height).toBeCloseTo(3,2);
    await page.screenshot({path:testInfo.outputPath(`home-updated-${width}.png`),fullPage:true});
  }
  await page.setViewportSize({width:390,height:844});
  await openNavigation(page);
  await expect(page.getByRole('button',{name:'Menu',exact:true})).toHaveAttribute('aria-expanded','true');
  await page.screenshot({path:testInfo.outputPath('home-mobile-menu.png'),fullPage:true});
  await page.getByRole('link',{name:'Explore',exact:true}).focus();await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.getByRole('button',{name:'Menu',exact:true})).toHaveAttribute('aria-expanded','false');
  await page.getByLabel('Toolbar guide language').selectOption('ne');
  await expect(page.getByLabel('Guide language / भाषा')).toHaveValue('ne');
  await page.getByLabel('Toolbar guide language').selectOption('en');
  await expect(page.getByLabel('Guide language / भाषा')).toHaveValue('en');
});
