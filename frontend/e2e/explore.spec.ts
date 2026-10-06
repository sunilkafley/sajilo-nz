import { navigateSidebar, openNavigation } from './navigation';
import { test, expect } from '@playwright/test';

test('Explore is keyboard accessible and every available destination works', async ({page}, testInfo) => {
  await page.goto('/');
  await openNavigation(page);
  const explore = page.getByRole('link', {name:'Explore', exact:true});
  await explore.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveTitle('Explore · Sajilo NZ');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.getByRole('link', {name:'Explore', exact:true, includeHidden:true})).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('heading', {name:'A new country. A world of possibilities.'})).toBeVisible();
  await expect(page.getByRole('article', {name:'Study & courses'})).toContainText('Planned');
  await expect(page.getByRole('region', {name:'Find your city'}).getByRole('link')).toHaveCount(1);
  await page.screenshot({path: testInfo.outputPath('explore.png'), fullPage:true});

  const destinations = [
    ['Search Sajilo NZ', 'Search results'],
    ['Open saved guides', 'Saved guides'],
    ['Prepare to travel', 'Your pre-departure checklist'],
    ['Immigration', 'Check the official guidance'],
    ['Christchurch', 'Christchurch'],
  ];
  for (const [label, heading] of destinations) {
    await page.getByRole('main').getByRole('link', {name:label}).click();
    await expect(page.getByRole('heading', {name:heading, exact:true})).toBeVisible();
    await navigateSidebar(page,'Explore');
  }
  await page.getByRole('main').getByRole('link', {name:'Search Sajilo NZ'}).click();
  const input=page.getByRole('combobox',{name:'Search Sajilo NZ guides, checklists and topics'});
  await input.fill('Test travel documents');await input.press('Enter');
  await page.locator('.search-results').getByRole('link', {name:/Test travel documents/}).click();
  await expect(page.getByText('This guide exists only in an isolated test database.')).toBeVisible();
});

test('Explore reopens offline and leads to saved guidance and persistent checklist progress', async ({page, context}) => {
  await page.goto('/#/guides/test-documents');
  await expect(page.locator('.offline-status')).toHaveAttribute('data-offline-ready','true');
  await page.getByRole('button', {name:'Save guide', exact:true}).click();
  await navigateSidebar(page,'Explore');
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', {name:'A new country. A world of possibilities.'})).toBeVisible();
  await page.getByRole('link', {name:'Prepare to travel', exact:true}).click();
  await page.getByRole('checkbox', {name:'Passport', exact:true}).check();
  await navigateSidebar(page,'Explore');
  await page.reload();
  await page.getByRole('link', {name:'Open saved guides', exact:true}).click();
  await page.getByRole('link', {name:'Test travel documents', exact:true}).click();
  await expect(page.getByText('This guide exists only in an isolated test database.')).toBeVisible();
  await expect(page.getByText('Showing saved copies only.', {exact:false})).toBeVisible();
  await page.getByRole('link', {name:'Passport', exact:true}).click();
  await expect(page.getByRole('checkbox', {name:'Passport', exact:true})).toBeChecked();
});

test('Explore fits small phones and tablets without horizontal scrolling', async ({page}) => {
  await page.goto('/#/explore');
  for (const width of [320, 768]) {
    await page.setViewportSize({width, height:900});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.getByRole('link', {name:'Prepare to travel', exact:true})).toBeVisible();
  }
});
