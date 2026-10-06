import { navigateSidebar } from './navigation';
import { test, expect } from '@playwright/test';
const key='sajilo-nz:firstweek:v1';
test('Home and Explore open an independent first-week checklist with offline persistence',async({page,context},testInfo)=>{
  await page.goto('/#/predeparture');
  await page.getByRole('checkbox',{name:'Passport',exact:true}).check();
  await navigateSidebar(page, 'Home');
  await expect(page.locator('.offline-status')).toHaveAttribute('data-offline-ready','true');
  await navigateSidebar(page,'First-week checklist');
  await expect(page).toHaveTitle('First-week checklist · Sajilo NZ');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.getByRole('heading',{name:'0 of 6 first-week steps completed'})).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('firstweek.png'),fullPage:true});
  for(const width of [320,768]) {await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
  const checkbox=page.getByRole('checkbox',{name:'Review your first-week budget',exact:true});
  await checkbox.focus();await page.keyboard.press('Space');
  await context.setOffline(true);await page.reload();await expect(checkbox).toBeChecked();
  await navigateSidebar(page, 'Pre-departure checklist');
  await expect(page.getByRole('checkbox',{name:'Passport',exact:true})).toBeChecked();
  await navigateSidebar(page, 'Home');
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','1');
  await navigateSidebar(page,'Explore');
  await page.getByRole('link',{name:'Arrive & settle',exact:true}).click();
  await expect(checkbox).toBeChecked();await checkbox.uncheck();await page.reload();await expect(checkbox).not.toBeChecked();
});
test('first-week corrupt data is preserved; deep links focus only valid first-week tasks',async({page})=>{
  await page.goto('/');await page.evaluate(key=>localStorage.setItem(key,'{broken'),key);
  await page.goto('/#/firstweek?task=arrival-budget');
  await expect(page.getByRole('checkbox',{name:'Review your first-week budget',exact:true})).toBeFocused();
  await page.getByRole('checkbox',{name:'Review your first-week budget',exact:true}).check();
  await expect(page.getByRole('alert')).toContainText('stored data has been kept');
  await expect(page.getByRole('button',{name:'Try saving first-week progress again'})).toHaveCount(0);
  expect(await page.evaluate(key=>localStorage.getItem(key),key)).toBe('{broken');
  await page.goto('/#/firstweek?task=passport');await expect(page.getByRole('main')).toBeFocused();
});
test('first-week quota failure is visible and recovery persists only its own record',async({page})=>{
  await page.goto('/#/firstweek');
  await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='sajilo-nz:firstweek:v1'&&!(window as unknown as {allowSave:boolean}).allowSave)throw new Error('quota');original.call(this,key,value);};});
  await page.getByRole('checkbox',{name:'Plan a local journey',exact:true}).check();
  await expect(page.getByRole('alert')).toContainText('Could not save');
  await page.evaluate(()=>{(window as unknown as {allowSave:boolean}).allowSave=true;});
  await page.getByRole('button',{name:'Try saving first-week progress again'}).click();
  await page.reload();await expect(page.getByRole('checkbox',{name:'Plan a local journey',exact:true})).toBeChecked();
  expect(await page.evaluate(()=>localStorage.getItem('sajilo-nz:predeparture:v1'))).toBeNull();
});
