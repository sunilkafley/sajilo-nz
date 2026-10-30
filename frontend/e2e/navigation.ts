import type { Page } from '@playwright/test';
// Public navigation is always visible: header on desktop, bottom bar on mobile.
export async function openNavigation(_page: Page) {}
export async function navigateSidebar(page: Page, name: string) {
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  if(name==='First-week checklist' || name==='Pre-departure checklist') {
    await nav.getByRole('link',{name:'Journey Planner',exact:true}).click();
    await page.getByRole('region',{name:'Journey stages'}).getByRole('link',{name:name==='First-week checklist'?/Arrival \/ First week/:/Before you leave/}).click();
  } else if(['Saved resources','Pre-departure guides','Official sources'].includes(name)) {
    await page.locator('footer').getByRole('link',{name:name==='Pre-departure guides'?'Guides':name,exact:true}).click();
  } else {
    await nav.getByRole('link',{name,exact:true}).click();
  }
}
