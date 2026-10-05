import { test, expect } from '@playwright/test';
const key='sajilo-nz.saved-guides.v1';

test('Christchurch from Explore to reviewed guide, offline reading and persistent checklist', async ({page,context},testInfo) => {
  await page.goto('/#/explore');
  await expect(page.getByText('App ready for offline use.',{exact:false})).toBeVisible();
  await page.getByRole('link',{name:'Christchurch',exact:true}).click();
  await expect(page).toHaveTitle('Christchurch · Sajilo NZ');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.getByRole('link',{name:'Test Christchurch preparation'})).toBeVisible();
  await expect(page.getByRole('link',{name:'Test travel documents'})).toHaveCount(0);
  await page.screenshot({path:testInfo.outputPath('christchurch.png'),fullPage:true});
  for(const width of [320,768]) {
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.getByRole('link',{name:'Test Christchurch preparation'}).click();
  await expect(page.getByRole('link',{name:'Metro',exact:false})).toHaveAttribute('href','https://www.metroinfo.co.nz/travel-information/getting-started-with-metro/');
  await page.getByRole('button',{name:'Save guide',exact:true}).click();
  const before=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).items[0].guide.verified_on,key);
  await context.setOffline(true); await page.reload();
  await expect(page.getByText('Synthetic Christchurch guidance, not travel advice.',{exact:true})).toBeVisible();
  await expect(page.getByText('Showing saved copies only.',{exact:false})).toBeVisible();
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).items[0].guide.verified_on,key)).toBe(before);
  await page.getByRole('link',{name:'Back to Christchurch'}).click();
  await page.getByRole('link',{name:'Airport transport checklist'}).click();
  await page.getByRole('checkbox',{name:'Airport transport',exact:true}).check();
  await page.reload(); await expect(page.getByRole('checkbox',{name:'Airport transport',exact:true})).toBeChecked();
});

test('city translation remains unpublished; unknown city and API failure recover honestly',async ({page})=>{
  await page.goto('/#/cities/christchurch?lang=ne');
  await expect(page.getByRole('heading',{name:'No reviewed guides available yet'})).toBeVisible();
  await expect(page.getByText('Unreviewed test city translation')).toHaveCount(0);
  await expect(page.getByRole('link',{name:'परीक्षण यात्रा कागजात',exact:true})).toHaveCount(0);
  await page.goto('/#/cities/auckland');
  await expect(page.getByRole('heading',{name:'City unavailable'})).toBeVisible();
  await page.route('**/api/guides/**',route=>route.fulfill({status:503,body:'Unavailable'}));
  await page.goto('/#/cities/christchurch');
  await expect(page.getByRole('alert')).toContainText('Guides are unavailable');
  await page.unroute('**/api/guides/**');
  await page.getByRole('button',{name:'Try again'}).click();
  await expect(page.getByRole('link',{name:'Test Christchurch preparation'})).toBeVisible();
});
