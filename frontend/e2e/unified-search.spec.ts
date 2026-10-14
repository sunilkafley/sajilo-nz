import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';
test('unified discovery finds published articles, courses and directory records with filters',async({page})=>{
  await page.goto('/#/search?q=Synthetic');
  await expect(page.getByRole('list').filter({has:page.getByText('Synthetic business',{exact:true})})).toBeVisible();
  const results=page.locator('.search-results');
  await expect(results).toContainText('Synthetic published article');
  await expect(results).toContainText('Synthetic course 0');
  await expect(results).not.toContainText('Synthetic draft article');
  await expect(results).not.toContainText('Private synthetic course');
  await page.getByRole('combobox',{name:'Resource type',exact:true}).selectOption('Course');
  await expect(results).not.toContainText('Synthetic business');
  await results.getByRole('link').filter({hasText:'Synthetic course 0'}).click();
  await expect(page.getByRole('heading',{name:'Synthetic course 0'})).toBeVisible();
  await page.goto('/#/search?q=Synthetic&type=Article&topic=housing');
  await expect(results).toContainText('Synthetic housing information');
  await expect(results).not.toContainText('Synthetic career information');
  await page.goto('/#/search?q=पहिलो&stage=firstweek');
  await expect(results).toContainText('परीक्षण पहिलो हप्ताको यात्रा');
  await page.goto('/#/search?q=Budget%20calculator');
  await results.getByRole('link').first().click();await expect(page.getByRole('heading',{name:'Make room for your new life.'})).toBeVisible();
});
test('unified search screenshots have no overflow at target widths',async({page},testInfo)=>{
  test.skip(testInfo.project.name==='mobile','Desktop loop includes all specified widths.');
  for(const width of [390,768,1280,1440,1920]) {
    await page.setViewportSize({width,height:1000});await page.goto('/#/search?q=Synthetic&type=Directory%20listing');
    await expect(page.locator('.search-results')).toContainText('Synthetic business');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
    await page.screenshot({path:fileURLToPath(new URL(`../../docs/screenshots/release-readiness/search-${width}.png`,import.meta.url)),fullPage:true});
  }
});
