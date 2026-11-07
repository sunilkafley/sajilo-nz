import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

// Uses the existing isolated fixture server, never the local or hosted content DB.
const server=spawn('.venv/Scripts/python.exe',['backend/e2e_server.py'],{windowsHide:true,env:{...process.env,PYTHONUNBUFFERED:'1'}});
let browser;
let stopped=false;
server.on('exit',()=>{stopped=true;});
server.on('error',()=>{stopped=true;});
try {
  let ready=false;
  for(let attempt=0;attempt<120;attempt++) {
    if(stopped)throw new Error('Isolated fixture server could not start.');
    try {const response=await fetch('http://127.0.0.1:8000/admin/login/',{signal:AbortSignal.timeout(1000)});if(response.ok){ready=true;break;}}catch{}
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  assert.ok(ready,'Fixture server did not become ready.');
  browser=await chromium.launch({executablePath:process.argv[2],headless:true});
  const page=await browser.newPage();
  const failedAssets=[];
  page.on('response',response=>{if(response.url().includes('/static/')&&!response.ok())failedAssets.push(response.url());});
  mkdirSync('docs/screenshots/admin-login',{recursive:true});
  for(const width of [320,390,1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto('http://127.0.0.1:8000/admin/login/?next=/admin/editorial/article/');
    await page.evaluate(()=>document.fonts.ready);
    await page.getByRole('heading',{name:'Welcome back.'}).waitFor();
    assert.equal(await page.locator('.sajilo-admin-brand img').evaluate(img=>img.complete&&img.naturalWidth>0),true);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Overflow at ${width}px`);
    await page.getByLabel('Username:').focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.getByLabel('Password:').evaluate(el=>el===document.activeElement),true);
    await page.screenshot({path:`docs/screenshots/admin-login/login-${width}.png`,fullPage:true});
    console.log(`Admin login layout and keyboard check passed: ${width}px`);
  }
  await page.setViewportSize({width:390,height:900});
  await page.getByLabel('Username:').fill('synthetic-screenshot-user');
  await page.getByLabel('Password:').fill('incorrect-test-only');
  await page.getByRole('button',{name:'Log in',exact:true}).click();
  await page.locator('.errornote').waitFor();
  await page.getByRole('heading',{name:'Welcome back.'}).waitFor();
  assert.equal(await page.getByLabel('Password:').inputValue(),'');
  await page.getByLabel('Username:').fill('');
  await page.screenshot({path:'docs/screenshots/admin-login/login-error-390.png',fullPage:true});
  // The login should retain the same readable palette with a saved dark preference.
  await page.evaluate(()=>localStorage.setItem('theme','dark'));
  await page.reload();
  assert.equal(await page.locator('#container').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 255, 255)');
  assert.deepEqual(failedAssets,[]);
  console.log('Invalid-login feedback, cleared password, saved dark preference and static assets passed.');
} finally {await browser?.close();server.kill();}
