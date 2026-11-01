import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','frontend','--host','127.0.0.1','--port','4179','--strictPort'],{windowsHide:true});
await new Promise((resolve,reject)=>{server.stdout.on('data',data=>{if(data.toString().includes('4179'))resolve();});server.on('error',reject);server.on('exit',code=>reject(new Error('Preview stopped: '+code)));});
const browser=await chromium.launch({executablePath:process.argv[2],headless:true});
try {
  const page=await browser.newPage();
  mkdirSync('docs/screenshots/explore-compact',{recursive:true});
  for(const viewport of [{width:320,height:640},{width:360,height:640},{width:390,height:664}]){
    await page.setViewportSize(viewport);
    await page.goto('http://127.0.0.1:4179/#/explore');
    await page.evaluate(()=>document.fonts.ready);
    const nav=await page.locator('.public-navigation').boundingBox();
    const cards=page.locator('.explore-topic-grid .topic-card');
    const positions=[];
    for(let index=0;index<4;index++){
      const box=await cards.nth(index).boundingBox();
      positions.push(box);
      if(box.y+box.height>nav.y) throw new Error(`${viewport.width}: card ${index+1} bottom ${box.y+box.height} below nav ${nav.y}`);
    }
    const search=await page.locator('.explore-search').boundingBox();
    if(search.height>48) throw new Error('Search row too tall');
    if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth && scrollY===0)) throw new Error('Initial viewport overflow');
    console.log(JSON.stringify({viewport,searchHeight:search.height,fourthCardBottom:positions[3].y+positions[3].height,navigationTop:nav.y}));
    await page.screenshot({path:`docs/screenshots/explore-compact/explore-${viewport.width}.png`});
  }
} finally {await browser.close();server.kill();}
