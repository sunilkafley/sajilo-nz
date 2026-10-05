import { test, expect } from '@playwright/test';
test('keyboard completion persists through reload and navigation', async ({ page }) => {
  await page.goto('/#/predeparture');
  const passport = page.getByRole('checkbox',{name:'Passport',exact:true});
  await passport.focus(); await page.keyboard.press('Space');
  await expect(page.getByRole('heading',{name:'1 of 27 completed'})).toBeVisible();
  await page.reload(); await expect(passport).toBeChecked();
  await page.getByRole('link',{name:'Home',exact:true}).click();
  await page.getByRole('link',{name:'Continue my checklist'}).click();
  await expect(passport).toBeChecked();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
test('storage failure is visible and checklist still works', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('quota'); }; });
  await page.goto('/#/predeparture');
  await page.getByRole('checkbox',{name:'Passport',exact:true}).check();
  await expect(page.getByRole('alert')).toContainText('Could not save');
  await expect(page.getByRole('checkbox',{name:'Passport',exact:true})).toBeChecked();
});
