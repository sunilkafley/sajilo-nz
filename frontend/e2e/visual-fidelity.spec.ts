import { test, expect } from '@playwright/test';

test('public landing matches responsive hierarchy and preserves readable guides', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One capture set includes all requested widths.');
  for (const width of [320,390,768,1280,1440,1920]) {
    await page.setViewportSize({width,height:1000});
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('heading',{name:'Your New Zealand journey companion'})).toBeVisible();
    await expect(page.locator('.landing-topic')).toHaveCount(4);
    const columns=await page.locator('.landing-topics').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(2);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const logo=await page.locator('.sajilo-logo').boundingBox();expect(logo!.width/logo!.height).toBeCloseTo(3,2);
    const main=await page.getByRole('main').boundingBox();
    expect(main!.x).toBeCloseTo((width-main!.width)/2,0);
    const nav=page.getByRole('navigation',{name:'Main navigation'});
    await expect(nav.locator('a:visible')).toHaveCount(width<=800?4:5);
    await expect(page.getByRole('button',{name:'Menu',exact:true})).toHaveCount(0);
    if(width<=800){
      const box=await nav.boundingBox();expect(box!.y+box!.height).toBeCloseTo(1000,0);
      await page.locator('footer a').last().scrollIntoViewIfNeeded();
      expect((await page.locator('footer a').last().boundingBox())!.y+32).toBeLessThan(box!.y);
      await page.evaluate(()=>window.scrollTo(0,0));
    }
    await page.screenshot({path:'../docs/screenshots/public-landing/home-'+width+'.png',fullPage:true});
    if(width===390) await page.screenshot({path:'../docs/screenshots/public-landing/home-390-viewport.png'});
  }
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('navigation').getByRole('link',{name:'Journey Planner',exact:true}).focus();await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.getByRole('region',{name:'Journey stages'}).getByRole('link',{name:/Before you leave/}).click();
  await page.getByRole('checkbox',{name:'Passport',exact:true}).check();await page.reload();
  await expect(page.getByRole('checkbox',{name:'Passport',exact:true})).toBeChecked();
  await expect(page.getByRole('navigation').getByRole('link',{name:'Journey Planner',exact:true})).toHaveAttribute('aria-current','page');
  await page.getByRole('link',{name:'Search Sajilo NZ',exact:true}).click();
  await page.getByRole('combobox',{name:'Search Sajilo NZ guides, checklists and topics'}).fill('budget');
  await expect(page.getByRole('listbox',{name:'Search suggestions'}).getByRole('option').first()).toContainText('Budget calculator');
  await page.screenshot({path:'../docs/screenshots/public-landing/search-mobile.png'});
  await page.goto('/#/explore?category=money&lang=en');
  await page.getByRole('button',{name:'Switch to Nepali'}).click();
  await expect(page).toHaveURL(/explore\/money\?lang=ne/);
  await expect(page.locator('.language-fallback')).toHaveCount(0);
  await expect(page.getByRole('region',{name:'Money information'})).toBeVisible();
  await page.goto('/#/guides/test-documents');
  await expect(page.locator('article.guide-body')).toBeVisible();
  await page.setViewportSize({width:1920,height:1000});
  expect((await page.getByRole('main').boundingBox())!.width).toBeLessThanOrEqual(960);
});
