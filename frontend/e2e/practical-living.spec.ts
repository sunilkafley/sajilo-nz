import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';

test('practical hubs search their published content and preserve language',async({page})=>{
  for(const topic of ['housing','nepal','work','immigration','transport','support']) {
    await page.goto('/#/explore/'+topic);
    await expect(page.getByText('Loading published information…')).toHaveCount(0);
    await page.getByRole('searchbox').fill('no-matching-fixture');
    await page.getByRole('button',{name:'Search topic',exact:true}).click();
    await expect(page.getByRole('heading',{name:'No matching published articles'})).toBeVisible();
    await page.getByRole('button',{name:'Clear search'}).click();
    await expect(page.getByText('No matching published articles')).toHaveCount(0);
    await page.getByRole('searchbox').fill('Synthetic');
    await page.getByRole('button',{name:'Search topic',exact:true}).click();
    await expect(page.getByText('Loading published information…')).toHaveCount(0);
    await expect(page.locator('.topic-content')).toContainText('Synthetic');
    await expect(page.getByRole('checkbox')).toHaveCount(0);
  }
  await page.getByLabel('Language / भाषा').selectOption('ne');
  await expect(page).toHaveURL(/q=Synthetic.*lang=ne/);
  await expect(page.getByRole('heading',{name:'No matching published articles'})).toBeVisible();
  await page.getByRole('link',{name:'Check English availability'}).click();
  await expect(page.getByRole('link',{name:'Synthetic support information',exact:true})).toBeVisible();
  await page.goto('/#/explore/nepal');
  const summary=page.locator('summary');await summary.focus();await page.keyboard.press('Enter');
  await expect(page.getByText('Synthetic section details, not advice.')).toBeVisible();
});

test('budget conversion, offline arithmetic, clearing and journey progress',async({page,context})=>{
  await page.goto('/#/predeparture');await page.getByRole('checkbox').first().check();
  const progress=await page.evaluate(()=>localStorage.getItem('sajilo-nz:predeparture:v1'));
  await page.goto('/#/explore/money');await page.getByRole('link',{name:'Open budget calculator'}).click();
  await page.getByLabel('Rent (weekly NZD)').fill('120');
  expect(await page.locator('.budget-summary').evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe('rgb(255, 255, 255)');
  await expect(page.getByRole('complementary',{name:'Budget summary'})).toContainText('$520.00');
  await page.getByLabel('Input period').selectOption('Monthly');
  await expect(page.getByLabel('Rent (monthly NZD)')).toHaveValue('520.00');
  await page.getByLabel('Groceries (monthly NZD)').fill('-20');
  await expect(page.getByLabel('Groceries (monthly NZD)')).toHaveAttribute('aria-invalid','true');
  await page.getByLabel('Groceries (monthly NZD)').fill('130');
  await expect(page.getByRole('complementary',{name:'Budget summary'})).toContainText('$150.00');
  await page.getByRole('button',{name:'Clear figures'}).click();await page.getByRole('button',{name:'Keep figures'}).click();
  await expect(page.getByLabel('Rent (monthly NZD)')).toHaveValue('520.00');
  await expect(page.locator('.offline-status')).toHaveAttribute('data-offline-ready','true');
  await context.setOffline(true);await page.reload();
  await expect(page.getByLabel('Rent (weekly NZD)')).toHaveValue('');
  await page.getByLabel('Rent (weekly NZD)').fill('100');
  await expect(page.getByRole('complementary',{name:'Budget summary'})).toContainText('$433.33');
  await page.getByRole('button',{name:'Clear figures'}).click();await page.getByRole('button',{name:'Confirm clear'}).click();
  await expect(page.getByLabel('Rent (weekly NZD)')).toHaveValue('');
  await page.getByRole('link',{name:'Budget planning task in Journey'}).click();
  await expect(page.locator('#budget')).toBeFocused();
  expect(await page.evaluate(()=>localStorage.getItem('sajilo-nz:predeparture:v1'))).toBe(progress);
});

test('practical pages fit all target viewports',async({page},testInfo)=>{
  test.skip(testInfo.project.name==='mobile','Explicit viewport loop captures mobile and desktop.');
  for(const width of [390,768,1280,1440,1920]) {
    await page.setViewportSize({width,height:1000});
    for(const topic of ['money/budget','work']) {
      await page.goto('/#/explore/'+topic);
      if(topic==='work')await expect(page.getByRole('link',{name:'Synthetic career information',exact:true})).toBeVisible();
      else await page.getByLabel('Rent (weekly NZD)').fill('120');
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
      await page.screenshot({path:fileURLToPath(new URL(`../../docs/screenshots/practical-living/${topic==='work'?'work':'budget'}-${width}.png`,import.meta.url)),fullPage:true});
    }
  }
});
