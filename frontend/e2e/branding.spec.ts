import { test, expect } from '@playwright/test';
test('approved logo stays complete and undistorted with keyboard navigation and bilingual guides',async({page,context},testInfo)=>{
  await page.goto('/');
  const logo=page.getByRole('img',{name:'Sajilo NZ — Your New Zealand journey companion'});
  await expect(logo).toBeVisible();
  expect(await logo.evaluate((image:HTMLImageElement)=>[image.naturalWidth,image.naturalHeight])).toEqual([2172,724]);
  for(const width of [320,390,768,1440]) {
    await page.setViewportSize({width,height:1000});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const box=await logo.boundingBox();expect(box!.width/box!.height).toBeCloseTo(3,2);
    expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(width);
    await page.screenshot({path:testInfo.outputPath(`branding-${width}.png`),fullPage:true});
  }
  const nav=page.getByRole('navigation',{name:'Main navigation'});
  await expect(nav.getByRole('link')).toHaveCount(7);
  await nav.getByRole('link',{name:'Explore',exact:true}).focus();await page.keyboard.press('Enter');
  await expect(nav.getByRole('link',{name:'Explore',exact:true})).toHaveAttribute('aria-current','page');
  await expect(page.getByRole('main')).toBeFocused();
  await page.goto('/#/guides/test-bilingual-documents?lang=en');
  await expect(page.locator('article.guide-body')).toHaveAttribute('lang','en');
  await page.getByLabel('Guide language / भाषा').selectOption('ne');
  await expect(page.locator('article.guide-body')).toHaveAttribute('lang','ne');
  const nepaliLogo=page.getByRole('img',{name:'Sajilo NZ — तपाईंको न्युजिल्यान्ड सहयात्री'});
  await expect(nepaliLogo).toBeVisible();
  await expect(page.getByText('App ready for offline use.',{exact:false})).toBeVisible();
  await page.getByRole('button',{name:'Save guide',exact:true}).click();
  await context.setOffline(true);await page.reload();
  await expect(nepaliLogo).toBeVisible();expect(await nepaliLogo.evaluate((image:HTMLImageElement)=>image.naturalWidth)).toBe(2172);
  await expect(page.locator('article.guide-body')).toHaveAttribute('lang','ne');
  await page.getByRole('link',{name:'Sajilo NZ home',exact:true}).focus();await page.keyboard.press('Enter');
  await expect(page).toHaveTitle('Home · Sajilo NZ');
});
