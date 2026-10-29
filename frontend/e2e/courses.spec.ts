import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';
const base='/#/explore/study/courses';

test('published course filters, detail, shortlist reload and comparison preserve journey data',async({page})=>{
  await page.goto('/#/predeparture');await page.getByRole('checkbox').first().check();
  const progress=await page.evaluate(()=>localStorage.getItem('sajilo-nz:predeparture:v1'));
  await page.goto('/#/explore/study');await page.getByRole('link',{name:'Find courses and compare options'}).click();
  await expect(page.getByText('4 published courses')).toBeVisible();
  await expect(page.getByText('Private synthetic course')).toHaveCount(0);
  await expect(page.getByRole('option',{name:'Private city'})).toHaveCount(0);
  await page.getByRole('combobox',{name:'City',exact:true}).selectOption('Christchurch');
  await expect(page.getByText('2 published courses')).toBeVisible();
  await page.getByLabel('Search courses, subjects or institutions').fill('Test institution 0');
  await page.getByRole('button',{name:'Search courses',exact:true}).click();
  await expect(page.getByText('1 published courses')).toBeVisible();
  await page.getByRole('link',{name:'Synthetic course 0',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Synthetic course 0'})).toBeVisible();
  await page.getByRole('button',{name:'Compare',exact:true}).click();
  await page.reload();await expect(page.getByRole('link',{name:'Shortlist (1)',exact:true})).toBeVisible();
  await page.getByRole('link',{name:'Browse courses',exact:true}).click();
  await page.getByRole('article').filter({hasText:'Synthetic course 1'}).getByRole('button',{name:'Compare',exact:true}).click();
  await page.getByRole('link',{name:'Compare (2)',exact:true}).click();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('table')).toContainText('Test institution 1');
  expect(await page.evaluate(()=>localStorage.getItem('sajilo-nz:predeparture:v1'))).toBe(progress);
  const stored=await page.evaluate(()=>localStorage.getItem('sajilo-nz:courses:v1'));
  expect(stored).not.toContain('Synthetic course');
  await page.getByRole('button',{name:'Switch to Nepali'}).click();
  await expect(page.getByRole('link',{name:'परीक्षण पाठ्यक्रम',exact:true})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Course unavailable'})).toBeVisible();
  await expect(page.getByText('Synthetic course 1',{exact:true})).toHaveCount(0);
});

test('shortlists never expose withdrawn, corrupt or offline cached course records',async({page,context})=>{
  await page.goto(base);
  await expect(page.locator('.offline-status')).toHaveAttribute('data-offline-ready','true',{timeout:15000});
  await page.evaluate(()=>localStorage.setItem('sajilo-nz:courses:v1',JSON.stringify({version:1,items:[{slug:'secret-course',language:'en',compare:true}]})));
  await page.goto(base+'/compare');await page.reload();
  await expect(page.getByRole('heading',{name:'Course unavailable'})).toBeVisible();
  await expect(page.getByText('Private synthetic course')).toHaveCount(0);
  await page.goto(base+'/test-course-0');await expect(page.getByRole('heading',{name:'Synthetic course 0'})).toBeVisible();
  await expect(page.locator('.offline-status')).toHaveAttribute('data-offline-ready','true');
  await context.setOffline(true);await page.reload();
  await expect(page.getByRole('alert')).toContainText('not saved offline');
  await expect(page.getByRole('heading',{name:'Synthetic course 0'})).toHaveCount(0);
  await context.setOffline(false);await page.getByRole('button',{name:'Try again',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Synthetic course 0'})).toBeVisible();
  await page.evaluate(()=>localStorage.setItem('sajilo-nz:courses:v1','future unreadable data'));await page.reload();
  await expect(page.getByRole('alert')).toContainText('Stored data is preserved');
  await expect(page.getByRole('button',{name:'Shortlist',exact:true})).toBeDisabled();
  expect(await page.evaluate(()=>localStorage.getItem('sajilo-nz:courses:v1'))).toBe('future unreadable data');
});

test('course pages fit target widths and comparison is keyboard scrollable',async({page},testInfo)=>{
  test.skip(testInfo.project.name==='mobile','Explicit desktop viewport loop covers capture widths.');
  for(const width of [390,768,1280,1440,1920]) {
    await page.setViewportSize({width,height:1000});await page.goto(base);
    await expect(page.getByText('4 published courses')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
    await page.screenshot({path:fileURLToPath(new URL(`../../docs/screenshots/courses/catalogue-${width}.png`,import.meta.url)),fullPage:true});
  }
  for(const index of [0,1,2])await page.getByRole('article').filter({hasText:`Synthetic course ${index}`}).getByRole('button',{name:'Compare',exact:true}).click();
  await page.getByRole('article').filter({hasText:'Synthetic course 3'}).getByRole('button',{name:'Compare',exact:true}).click();
  await expect(page.getByRole('status').filter({hasText:'Compare up to three'})).toBeVisible();
  await page.getByRole('link',{name:'Compare (3)',exact:true}).click();await page.setViewportSize({width:390,height:844});
  await page.getByRole('region',{name:'Course comparison'}).focus();
  await expect(page.getByRole('region',{name:'Course comparison'})).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
