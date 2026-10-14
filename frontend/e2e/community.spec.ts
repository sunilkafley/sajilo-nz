import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';
test('directory filters, classifications, details and language preserve publication rules',async({page})=>{
  await page.goto('/#/community');
  await expect(page.getByText('3 published listings')).toBeVisible();
  await expect(page.getByRole('option',{name:'Private city'})).toHaveCount(0);
  await expect(page.getByText('Commercial business — not an endorsement')).toBeVisible();
  await expect(page.getByText('Past event')).toBeVisible();
  await page.getByRole('button',{name:'Browse Christchurch pilot'}).click();
  await expect(page.getByText('2 published listings')).toBeVisible();
  await page.getByRole('combobox',{name:'Type',exact:true}).selectOption('organisation');
  await expect(page.getByText('1 published listings')).toBeVisible();
  await page.getByRole('link',{name:'Synthetic organisation',exact:true}).click();
  await expect(page.getByText('Synthetic listing details only.')).toBeVisible();
  await page.getByLabel('Language / भाषा').selectOption('ne');
  await expect(page.getByRole('heading',{name:'Listing unavailable'})).toBeVisible();
  await expect(page.getByText('Synthetic listing details only.')).toHaveCount(0);
  await page.getByRole('link',{name:'Check English availability'}).click();
  await page.getByRole('link',{name:'Back to directory'}).click();
  await expect(page).toHaveURL(/city=Christchurch.*kind=organisation/);
  await page.getByRole('searchbox').fill('Private');await page.getByRole('button',{name:'Search listings'}).click();
  await expect(page.getByRole('heading',{name:'No published listings match'})).toBeVisible();
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  await page.goto('/#/community/private-listing');
  await expect(page.getByRole('heading',{name:'Listing unavailable'})).toBeVisible();
});
test('directory offline errors recover without cached listings or lost progress',async({page,context})=>{
  await page.goto('/#/predeparture');await page.getByRole('checkbox').first().check();
  const before=await page.evaluate(()=>localStorage.getItem('sajilo-nz:predeparture:v1'));
  await page.goto('/#/community/test-event');await expect(page.getByText('Past event')).toBeVisible();
  await expect(page.locator('.offline-status')).toHaveAttribute('data-offline-ready','true');
  await context.setOffline(true);await page.reload();
  await expect(page.getByRole('alert')).toContainText('Listings are not saved offline');
  await expect(page.getByText('Synthetic listing details only.')).toHaveCount(0);
  await context.setOffline(false);await page.getByRole('button',{name:'Try again',exact:true}).click();
  await expect(page.getByText('Past event')).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('sajilo-nz:predeparture:v1'))).toBe(before);
});
test('directory fits target widths and filters are keyboard reachable',async({page},testInfo)=>{
  test.skip(testInfo.project.name==='mobile','Explicit viewport loop covers all sizes.');
  for(const width of [390,768,1280,1440,1920]) {
    await page.setViewportSize({width,height:1000});await page.goto('/#/community');
    await expect(page.getByText('3 published listings')).toBeVisible();
    await page.getByRole('searchbox').focus();await page.keyboard.press('Tab');
    await expect(page.getByRole('button',{name:'Search listings'})).toBeFocused();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
    await page.screenshot({path:fileURLToPath(new URL(`../../docs/screenshots/community/directory-${width}.png`,import.meta.url)),fullPage:true});
  }
});
