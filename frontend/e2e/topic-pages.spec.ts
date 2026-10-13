import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { categories } from '../src/features/explore/catalog';
import { topicConfig } from '../src/features/explore/topicConfig';

test('all twelve topics open their own information view without checklists',async({page})=>{
  for(const topic of categories) {
    await page.goto('/#'+topic.to);
    await expect(page.getByRole('heading',{name:topicConfig[topic.id].heading,exact:true})).toBeVisible();
    await expect(page.getByText('Loading published information…')).toHaveCount(0);
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(page.getByRole('checkbox')).toHaveCount(0);
  }
});

test('topic articles use real public API publication/language rules and safe navigation',async({page})=>{
  await page.goto('/#/explore?category=study&lang=en');
  await expect(page).toHaveURL(/explore\/study\?lang=en/);
  await expect(page.getByRole('link',{name:'Synthetic published article',exact:true})).toBeVisible();
  await expect(page.getByText('Synthetic draft article')).toHaveCount(0);
  await page.getByRole('link',{name:'Synthetic published article',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Synthetic published article',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Explore',exact:true}).first()).toHaveAttribute('aria-current','page');
  await expect(page.getByRole('link',{name:/Official source:/})).toHaveAttribute('href','https://official.example.org/test');
  await page.getByLabel('Language / भाषा').selectOption('ne');
  await expect(page.getByRole('heading',{name:'This article is not available'})).toBeVisible();
  await expect(page.getByText('Not real guidance.',{exact:true})).toHaveCount(0);
  await page.getByRole('link',{name:'Study & courses',exact:true}).click();
  await expect(page.getByRole('link',{name:'परीक्षण अध्ययन जानकारी',exact:true})).toBeVisible();
  await page.getByRole('link',{name:'परीक्षण अध्ययन जानकारी',exact:true}).click();
  await expect(page.locator('article[lang="ne"]')).toContainText('Synthetic article body only.');
  await expect(page.getByRole('checkbox')).toHaveCount(0);
});

test('housing accordion keyboard, city/intro pages and offline recovery',async({page,context})=>{
  await page.goto('/#/explore/housing');
  const summary=page.locator('summary').filter({hasText:'Synthetic housing information'});
  await summary.focus();await page.keyboard.press('Enter');
  await expect(page.locator('details')).toHaveAttribute('open','');
  await expect(page.getByText('Synthetic section details, not advice.')).toBeVisible();
  await page.getByRole('link',{name:'Read full article: Synthetic housing information'}).click();
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.locator('.offline-status')).toHaveAttribute('data-offline-ready','true');
  await context.setOffline(true);await page.reload();
  await expect(page.getByRole('alert')).toContainText('These articles are not saved for offline reading');
  await expect(page.getByText('Synthetic article body only.')).toHaveCount(0);
  await context.setOffline(false);await page.getByRole('button',{name:'Try again',exact:true}).click();
  await expect(page.getByText('Synthetic article body only.')).toBeVisible();
  await page.goto('/#/explore/aotearoa/about-new-zealand');
  await expect(page.getByRole('heading',{name:'Synthetic New Zealand introduction'})).toBeVisible();
  await page.goto('/#/explore/cities/auckland');
  await expect(page.getByRole('heading',{name:'Synthetic Auckland introduction'})).toBeVisible();
  await page.goto('/#/explore/aotearoa/healthcare');
  await expect(page.getByRole('heading',{name:'This article is not available'})).toBeVisible();
});

test('topic layout has no overflow at all target widths',async({page},testInfo)=>{
  test.skip(testInfo.project.name==='mobile','Desktop capture covers all explicit widths; mobile interactions run separately.');
  for(const width of [390,768,1280,1440,1920]) {
    await page.setViewportSize({width,height:1000});await page.goto('/#/explore/housing');
    if (!(await page.locator('details').evaluate(element => element.hasAttribute('open')))) {
      await page.locator('summary').click();
    }
    await expect(page.getByText('Synthetic section details, not advice.')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
    await page.screenshot({path:fileURLToPath(new URL(`../../docs/screenshots/topic-pages/housing-${width}.png`,import.meta.url)),fullPage:true});
  }
  await page.goto('/#/explore');
  await page.screenshot({path:fileURLToPath(new URL('../../docs/screenshots/topic-pages/explore-1920.png',import.meta.url)),fullPage:true});
});
