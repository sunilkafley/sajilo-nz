import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

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
  const failedAssets=[];
  page.on('response',r=>{if(r.url().includes('/static/')&&r.status()>=400)failedAssets.push(r.url());});
  await page.goto('http://127.0.0.1:8001/admin/login/');
  await page.getByLabel('Username:').fill('synthetic-dashboard-editor');
  await page.getByLabel('Password:').fill('Synthetic-preview-only-928!');
  await page.getByRole('button',{name:'Log in',exact:true}).click();
  await page.getByRole('heading',{name:'Your content workspace'}).waitFor();
  mkdirSync('docs/screenshots/admin-workspace',{recursive:true});
  for(const width of [320,390,768,1440]) {
    await page.setViewportSize({width,height:1000});
    await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Overflow at ${width}px`);
    assert.equal(await page.getByRole('link',{name:'Manage articles',exact:true}).count(),1);
    await page.screenshot({path:`docs/screenshots/admin-workspace/dashboard-${width}.png`,fullPage:true});
    console.log(`Dashboard layout passed: ${width}px`);
  }
  await page.evaluate(()=>{localStorage.setItem('theme','dark');document.documentElement.dataset.theme='dark';});
  await page.reload();
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:'docs/screenshots/admin-workspace/dashboard-dark-1440.png',fullPage:true});
  await page.emulateMedia({colorScheme:'dark'});
  await page.evaluate(()=>localStorage.setItem('theme','auto'));
  await page.reload();
  assert.equal(await page.locator('.sajilo-model-card').first().evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(23, 44, 36)');
  assert.equal(await page.locator('.sajilo-model-card h3 a').first().evaluate(el=>getComputedStyle(el).color),'rgb(225, 237, 230)');
  await page.getByRole('link',{name:'Manage articles',exact:true}).focus();
  assert.equal(await page.getByRole('link',{name:'Manage articles',exact:true}).evaluate(el=>el===document.activeElement),true);
  await page.locator('a[href="/admin/editorial/article/add/"]').click();
  await page.getByRole('heading',{name:'Add article',exact:true}).waitFor();
  assert.equal(await page.getByLabel('Title:').count(),1);
  await page.screenshot({path:'docs/screenshots/admin-workspace/article-form-dark-1440.png',fullPage:true});
  await page.setViewportSize({width:390,height:1000});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Article form mobile overflow');
  await page.screenshot({path:'docs/screenshots/admin-workspace/article-form-dark-390.png',fullPage:true});
  await page.getByRole('button',{name:'Log out',exact:true}).click();
  await page.getByRole('link',{name:'Log in again'}).click();
  await page.getByRole('heading',{name:'Welcome back.'}).waitFor();
  await page.screenshot({path:'docs/screenshots/admin-workspace/login-regression-390.png',fullPage:true});
  assert.deepEqual(failedAssets,[]);
  console.log('Native form navigation, mobile form, explicit/automatic dark theme, keyboard focus, logout, login regression and static assets passed.');
} finally {await browser?.close();server.kill();}
