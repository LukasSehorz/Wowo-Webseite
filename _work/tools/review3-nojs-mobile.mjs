// Round 3: without JavaScript on a phone, is there any reachable submit button on /gutscheine? And does the marquee pause under RM?
import { chromium } from 'playwright';
import { DEVICES, BASE, roundDir, sleep } from './review-lib.mjs';

const out = roundDir('round-3', 'a11y');
let browser = await chromium.launch();
let context = await browser.newContext({ ...DEVICES.mobile, locale: 'de-DE', javaScriptEnabled: false });
let page = await context.newPage();
await page.goto(BASE + '/gutscheine', { waitUntil: 'networkidle' });
await page.evaluate(() => document.getElementById('anfrage').scrollIntoView({ behavior: 'instant' }));
await sleep(300);
const r = await page.evaluate(() => [...document.querySelectorAll('#anfrage button[type="submit"]')].map((b) => {
  const box = b.getBoundingClientRect();
  const bar = b.closest('.fixed');
  return { text: b.textContent.trim(), display: getComputedStyle(b).display, top: Math.round(box.top), inFixedBar: !!bar, barTranslate: bar ? getComputedStyle(bar).translate : null, barInert: bar?.hasAttribute('inert') };
}));
console.log('no-JS mobile submit buttons:', JSON.stringify(r));
await page.evaluate(() => document.querySelector('aside[aria-labelledby="summary-heading"]').scrollIntoView({ behavior: 'instant', block: 'center' }));
await sleep(200);
await page.screenshot({ path: `${out}/nojs-mobile-summary.png` });
await browser.close();

browser = await chromium.launch();
context = await browser.newContext({ ...DEVICES.desktop, locale: 'de-DE', reducedMotion: 'reduce' });
page = await context.newPage();
await page.goto(BASE + '/gutscheine', { waitUntil: 'networkidle' });
await sleep(500);
const m = await page.evaluate(() => [...document.querySelectorAll('*')].filter((e) => getComputedStyle(e).animationName !== 'none').map((e) => ({ tag: e.tagName, name: getComputedStyle(e).animationName, state: getComputedStyle(e).animationPlayState, dur: getComputedStyle(e).animationDuration })));
console.log('RM animations on /gutscheine:', JSON.stringify(m));
await browser.close();
