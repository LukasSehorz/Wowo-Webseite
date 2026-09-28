import { chromium } from 'playwright';
const OUT = process.argv[2] ?? '../review/final';
const b = await chromium.launch();
for (const [n,w,h,m] of [['desktop',1440,900,false],['mobil',390,844,true]]) {
  const p = await (await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m,locale:'de-DE'})).newPage();
  await p.goto('http://localhost:3100/#forschung',{waitUntil:'networkidle'}); await p.waitForTimeout(2500);
  await p.evaluate(()=>scrollBy(0,380)); await p.waitForTimeout(1800);
  await p.screenshot({path:`${OUT}/studien-${n}.png`});
}
await b.close();
