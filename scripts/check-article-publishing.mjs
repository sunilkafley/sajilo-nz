import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

// All content and review dates below are synthetic and live only in a temp DB.
const server=spawn('.venv/Scripts/python.exe',['scripts/preview_admin_workspace.py'],{windowsHide:true,env:{...process.env,PYTHONUNBUFFERED:'1'}});
let browser,stopped=false;
server.on('exit',()=>{stopped=true;});server.on('error',()=>{stopped=true;});
try {
  let ready=false;
  for(let attempt=0;attempt<60;attempt++) {
    if(stopped)throw new Error('Isolated preview server stopped.');
    try{if((await fetch('http://127.0.0.1:8001/admin/login/',{signal:AbortSignal.timeout(1000)})).ok){ready=true;break;}}catch{}
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  assert.ok(ready,'Preview server did not become ready.');
  browser=await chromium.launch({executablePath:process.argv[2],headless:true});
  const page=await browser.newPage();
  await page.goto('http://127.0.0.1:8001/admin/login/');
  await page.getByLabel('Username:').fill('synthetic-dashboard-editor');
  await page.getByLabel('Password:').fill('Synthetic-preview-only-928!');
  await page.getByRole('button',{name:'Log in',exact:true}).click();
  await page.goto('http://127.0.0.1:8001/admin/editorial/article/add/');
  mkdirSync('docs/screenshots/article-publishing',{recursive:true});
  for(const width of [390,1440]) {
    await page.setViewportSize({width,height:1000});
    await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Add form overflow: ${width}`);
    await page.screenshot({path:`docs/screenshots/article-publishing/add-${width}.png`,fullPage:true});
  }
  await page.getByLabel('Title:',{exact:true}).fill('Synthetic publishing flow');
  await page.getByLabel('Topic:',{exact:true}).selectOption('work');
  await page.getByLabel('Article type:',{exact:true}).selectOption('general');
  await page.getByLabel('Summary:',{exact:true}).fill('Synthetic browser-test introduction only.');
  await page.getByLabel('Content:',{exact:true}).fill('Synthetic content, not published guidance.');
  await page.getByRole('button',{name:'Save & preview',exact:true}).click();
  await page.getByText('Staff-only saved-record preview — not public.',{exact:true}).waitFor();
  await page.getByRole('heading',{name:'Synthetic publishing flow',exact:true}).waitFor();
  assert.equal((await page.request.get('http://127.0.0.1:8001/api/explore/articles/synthetic-publishing-flow/')).status(),404);
  await page.getByRole('link',{name:'Return to record',exact:true}).click();
  const changeUrl=page.url();
  await page.getByRole('button',{name:'Publish article',exact:true}).click();
  await page.getByText('Confirm that you reviewed this saved version in its selected language before publishing.',{exact:true}).waitFor();
  await page.setViewportSize({width:390,height:1000});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Review-error form overflow');
  await page.screenshot({path:'docs/screenshots/article-publishing/review-errors-390.png',fullPage:true});
  await page.getByLabel('Reviewed on:',{exact:true}).fill('2026-01-01');
  await page.getByLabel('Next review on:',{exact:true}).fill('2027-01-01');
  await page.getByLabel('I have reviewed this saved version in the selected language.',{exact:true}).check();
  await page.getByRole('button',{name:'Publish article',exact:true}).click();
  await page.getByText('Article published with your recorded review.',{exact:true}).waitFor();
  assert.equal((await page.request.get('http://127.0.0.1:8001/api/explore/articles/synthetic-publishing-flow/')).status(),200);
  assert.equal(page.url(),changeUrl);
  await page.getByLabel('Content:',{exact:true}).fill('Changed synthetic content.');
  await page.getByLabel('I have reviewed this saved version in the selected language.',{exact:true}).check();
  await page.getByRole('button',{name:'Publish article',exact:true}).click();
  await page.getByText('Save content changes as a draft first, then review and publish in a separate save.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Save draft',exact:true}).click();
  await page.getByText('Draft saved. It is not published.',{exact:true}).waitFor();
  assert.equal(await page.getByLabel('Reviewed on:',{exact:true}).inputValue(),'');
  assert.equal((await page.request.get('http://127.0.0.1:8001/api/explore/articles/synthetic-publishing-flow/')).status(),404);
  await page.screenshot({path:'docs/screenshots/article-publishing/saved-draft-390.png',fullPage:true});
  console.log('Draft, saved preview, missing-review errors, explicit publication, public API visibility, edit blocking and withdrawal passed. Mobile/desktop layouts passed.');
} finally {await browser?.close();server.kill();}
