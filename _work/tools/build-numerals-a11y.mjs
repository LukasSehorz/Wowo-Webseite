import { chromium } from 'playwright';
const b = await chromium.launch();
// 1) reduzierte Bewegung
const ctx1 = await b.newContext({ viewport:{width:1440,height:900}, locale:'de-DE', reducedMotion:'reduce' });
const p1 = await ctx1.newPage();
await p1.goto('http://localhost:3100/', { waitUntil:'networkidle' });
await p1.evaluate(() => document.querySelector('.display-stat')?.scrollIntoView({block:'center'}));
await p1.waitForTimeout(900);
console.log('reduzierte Bewegung:', await p1.evaluate(() =>
  [...document.querySelectorAll('.display-stat')].slice(0,3).map(e => e.innerText.replace(/\s+/g,' ').trim())));
// 2) ohne JavaScript
const ctx2 = await b.newContext({ viewport:{width:1440,height:900}, locale:'de-DE', javaScriptEnabled:false });
const p2 = await ctx2.newPage();
await p2.goto('http://localhost:3100/', { waitUntil:'domcontentloaded' });
console.log('ohne JavaScript   :', await p2.evaluate(() =>
  [...document.querySelectorAll('.display-stat')].slice(0,3).map(e => e.textContent.replace(/\s+/g,' ').trim())));
// 3) Screenreader-Text
const p3 = await (await b.newContext({ viewport:{width:1440,height:900}, locale:'de-DE' })).newPage();
await p3.goto('http://localhost:3100/', { waitUntil:'networkidle' });
console.log('Screenreader      :', await p3.evaluate(() =>
  [...document.querySelectorAll('.display-stat .sr-only')].slice(0,3).map(e => e.textContent.trim())));
await b.close();
