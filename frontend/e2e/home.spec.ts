import { navigateSidebar } from './navigation';
import { test, expect } from '@playwright/test';

test('Home matches prototype composition and connects next steps, city and guides',async({page},testInfo)=>{
  await page.goto('/');
  await expect(page).toHaveTitle('Home · Sajilo NZ');
  await expect(page.getByRole('heading',{name:'Namaste, welcome home'})).toBeVisible();
  await expect(page.getByRole('progressbar',{name:'Planning tasks completed'})).toHaveAttribute('aria-valuenow','0');
  await page.screenshot({path:testInfo.outputPath('home.png'),fullPage:true});
  for (const width of [320,768,1440]) {
    await page.setViewportSize({width,height:1000});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await expect(page.getByRole('progressbar')).toBeVisible();
    const grid=page.locator('.home-grid');
    expect(await grid.evaluate(element=>getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(width<=900?1:2);
    await page.screenshot({path:testInfo.outputPath(`home-${width}.png`),fullPage:true});
  }
  const tools=page.getByRole('region',{name:'A few handy tools'});
  await expect(tools.getByRole('link')).toHaveCount(1);
  await expect(tools.getByText('Coming soon',{exact:true})).toHaveCount(3);
  await page.getByRole('link',{name:'Passport',exact:true}).focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('checkbox',{name:'Passport',exact:true})).toBeFocused();
  await page.getByRole('checkbox',{name:'Passport',exact:true}).check();
  await navigateSidebar(page,'Home');
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','1');
  await page.reload(); await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','1');
  await expect(page.getByRole('link',{name:'Passport',exact:true})).toHaveCount(0);
  await page.getByRole('link',{name:'Explore Christchurch'}).click();
  await expect(page.getByRole('heading',{name:'Christchurch',exact:true})).toBeVisible();
  await navigateSidebar(page,'Home');
  await page.getByRole('link',{name:'Search pre-departure guides'}).click();
  await expect(page.getByRole('searchbox')).toBeVisible();
});

test('Home completion, budget and Journey navigation work offline',async({page,context})=>{
  await page.goto('/');
  await page.getByRole('checkbox',{name:'Passport',exact:true}).focus();await page.keyboard.press('Space');
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','1');
  await expect(page.getByRole('checkbox').first()).toBeFocused();
  await page.reload();await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','1');
  await expect(page.getByRole('link',{name:'NZ Police emergency information (online)'})).toHaveAttribute('href','https://www.police.govt.nz/contact-us/111-police-emergency');
  await page.getByRole('link',{name:'Open first-month budget step'}).click();
  await expect(page.getByRole('checkbox',{name:'First-month budget',exact:true})).toBeFocused();
  await page.getByRole('checkbox',{name:'First-month budget',exact:true}).check();
  await navigateSidebar(page,'Home');
  await expect(page.locator('.offline-status')).toHaveAttribute('data-offline-ready','true');
  await context.setOffline(true);await page.reload();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','2');
  await expect(page.getByText('You are offline.',{exact:false})).toBeVisible();
  await navigateSidebar(page,'First-week checklist');
  await expect(page.getByRole('heading',{name:'Your first week, one step at a time.'})).toBeVisible();
});

test('Home bookmarks retain language and open saved copies offline without bypassing withdrawals',async({page,context})=>{
  await page.goto('/#/guides/test-bilingual-documents?lang=ne');
  await expect(page.getByText('App ready for offline use.',{exact:false})).toBeVisible();
  await page.getByRole('button',{name:'Save guide',exact:true}).click();
  await navigateSidebar(page,'Home');
  await expect(page.getByText('1 saved bookmarks · 1 saved copies on this browser')).toBeVisible();
  await expect(page.getByText('यो नेपाली सामग्री परीक्षणका लागि मात्र हो।',{exact:true})).toHaveCount(0);
  await context.setOffline(true); await page.reload();
  await page.getByRole('link',{name:'परीक्षण यात्रा कागजात',exact:true}).click();
  await expect(page.locator('article.guide-body')).toHaveAttribute('lang','ne');
  await expect(page.getByText('Showing saved copies only.',{exact:false})).toBeVisible();
  await page.route('**/api/guides/**',route=>route.fulfill({json:[]}));
  await context.setOffline(false);
  await expect(page.getByRole('heading',{name:'Guide unavailable in this language'})).toBeVisible();
  await navigateSidebar(page,'Home');
  await expect(page.getByText('1 saved bookmarks · 0 saved copies on this browser')).toBeVisible();
  await page.getByRole('link',{name:'परीक्षण यात्रा कागजात',exact:true}).click();
  await expect(page.getByRole('button',{name:'Remove unavailable guide'})).toBeVisible();
});

test('Home preserves unreadable saved storage without displaying invented counts',async({page})=>{
  await page.goto('/');
  await page.evaluate(()=>localStorage.setItem('sajilo-nz.saved-guides.v1','{broken'));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('stored data has been kept');
  await expect(page.getByText('0 saved bookmarks · 0 saved copies on this browser')).toHaveCount(0);
  expect(await page.evaluate(()=>localStorage.getItem('sajilo-nz.saved-guides.v1'))).toBe('{broken');
});
