import { chromium } from 'playwright';
const OUT = process.argv[2] ?? '../review/final';
const b = await chromium.launch();
for (const [n,w,h,m] of [['desktop',1440,900,false],['iphone',390,844,true],['ipad',820,1180,true]]) {
  const p = await (await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m,locale:'de-DE',deviceScaleFactor:1})).newPage();
  await p.goto('http://localhost:3100/',{waitUntil:'networkidle'}); await p.waitForTimeout(1800);
  const r = await p.evaluate(() => {
    const h1=document.querySelector('h1').getBoundingClientRect();
    const hero=document.querySelector('section.hero-screen').parentElement.querySelector('section.hero-screen').getBoundingClientRect();
    const block=document.querySelector('h1').parentElement.getBoundingClientRect();
    const btn=[...document.querySelectorAll('section.hero-screen a')].pop().getBoundingClientRect();
    return {blockTop:Math.round(h1.top), blockBottom:Math.round(btn.bottom), vh:innerHeight};
  });
  const mid = (r.blockTop + r.blockBottom)/2;
  console.log(`${n.padEnd(8)} Textblock ${r.blockTop}-${r.blockBottom}px, Mitte bei ${Math.round(mid)}px von ${r.vh}px (${Math.round(mid/r.vh*100)} %)`);
  await p.screenshot({path:`${OUT}/hero-mitte-${n}.png`});
}
await b.close();
