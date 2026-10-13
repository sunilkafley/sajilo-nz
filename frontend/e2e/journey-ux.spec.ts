import { test, expect } from '@playwright/test';

test('stage pages show tasks immediately, reset independently and print without changing progress',async({page},testInfo)=>{
  await page.goto('/#/predeparture');
  await page.getByRole('checkbox',{name:'Passport',exact:true}).check();
  await page.goto('/#/firstweek');
  await page.getByRole('checkbox',{name:'Review your first-week budget',exact:true}).check();
  const reset=page.getByRole('button',{name:'Reset checklist',exact:true});
  page.once('dialog',async dialog=>{expect(dialog.message()).toContain('first-week');await dialog.dismiss();});
  await reset.click();await expect(page.getByRole('checkbox',{name:'Review your first-week budget',exact:true})).toBeChecked();
  page.once('dialog',async dialog=>{expect(dialog.message()).toContain('other checklist and saved guides will not change');await dialog.accept();});
  await reset.click();await expect(page.getByText('Your first-week checklist has been reset.')).toBeVisible();
  await expect(page.getByRole('heading',{name:'0 of 6 first-week steps completed'})).toBeFocused();
  await page.reload();await expect(page.getByRole('checkbox',{name:'Review your first-week budget',exact:true})).not.toBeChecked();
  await page.goto('/#/predeparture');await expect(page.getByRole('checkbox',{name:'Passport',exact:true})).toBeChecked();
  await expect(page.locator('#passport').locator('..').getByRole('link',{name:/Read:/}).first()).toBeVisible();
  for(const width of [390,768,1440]){
    await page.setViewportSize({width,height:900});
    await page.goto('/#/firstweek');
    await expect(page.getByRole('checkbox').first()).toBeInViewport();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const main=await page.locator('.journey-checklist-main').boundingBox(),support=await page.locator('.journey-support').boundingBox();
    expect(width<=1000?support!.y>=main!.y+main!.height:support!.x>main!.x+main!.width).toBe(true);
    if(testInfo.project.name==='desktop')await page.screenshot({path:'../docs/screenshots/journey-ux/firstweek-'+width+'.png',fullPage:true});
    if(testInfo.project.name==='desktop' && width!==768){
      await page.goto('/#/predeparture');
      await expect(page.getByRole('checkbox').first()).toBeInViewport();
      await page.screenshot({path:'../docs/screenshots/journey-ux/predeparture-'+width+'.png',fullPage:true});
      await page.goto('/#/firstweek');
    }
  }
  await page.getByRole('checkbox',{name:'Plan phone and internet access',exact:true}).check();
  const before=await page.evaluate(()=>localStorage.getItem('sajilo-nz:firstweek:v1'));
  await page.evaluate(()=>{window.print=()=>{document.body.dataset.printRequested='true';};});
  await page.getByRole('button',{name:'Print / Save as PDF'}).click();
  await expect(page.locator('body')).toHaveAttribute('data-print-requested','true');
  expect(await page.evaluate(()=>localStorage.getItem('sajilo-nz:firstweek:v1'))).toBe(before);
  await page.emulateMedia({media:'print'});
  await expect(page.locator('.app-header')).toBeHidden();await expect(reset).toBeHidden();
  await expect(page.getByRole('checkbox').first()).toBeVisible();
  await expect(page.getByRole('checkbox',{name:'Plan phone and internet access',exact:true})).toBeChecked();
  await expect(page.getByRole('heading',{name:'1 of 6 first-week steps completed'})).toBeVisible();
  await expect(page.locator('.journey-disclaimer')).toBeVisible();
  if(testInfo.project.name==='desktop')await page.screenshot({path:'../docs/screenshots/journey-ux/print-layout.png',fullPage:true});
});

test('related guides keep language and first-week context; unavailable translations are not substituted',async({page})=>{
  await page.goto('/#/firstweek?lang=ne');
  const support=page.getByRole('complementary',{name:'Related information'});
  await expect(support.getByRole('link',{name:'परीक्षण पहिलो हप्ताको यात्रा',exact:true})).toBeVisible();
  await support.getByRole('link',{name:'परीक्षण पहिलो हप्ताको यात्रा',exact:true}).click();
  await expect(page).toHaveURL(/lang=ne&stage=firstweek/);
  await expect(page.locator('article.guide-body')).toHaveAttribute('lang','ne');
  await page.route('**/api/guides/**',route=>route.fulfill({json:[]}));
  await page.goto('/#/firstweek?lang=ne');
  await expect(page.getByText('No published guides are available for this stage in Nepali yet.')).toBeVisible();
  await expect(page.locator('.task-guide')).toHaveCount(0);
});
