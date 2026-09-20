// Peek at the builder's dev server (working tree, newer than the reviewed production build) for sections whose source changed after the build.
import { chromium } from 'playwright';
import { roundDir, sleep } from './review-lib.mjs';
const out = roundDir(undefined, 'dev-peek');
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE' });
const page = await ctx.newPage();
await page.goto('http://localhost:3101/', { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
await sleep(2000);
const h = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < h; y += 500) { await page.evaluate((t) => window.scrollTo({ top: t, behavior: 'instant' }), y); await sleep(200); }
// study card 3
await page.evaluate(() => document.querySelectorAll('#forschung article')[2].scrollIntoView({ block: 'center', inline: 'start', behavior: 'instant' }));
await sleep(1800);
const el = (await page.$$('#forschung article'))[2];
await el.screenshot({ path: `${out}/dev-study-card-3.png` });
const cards = await page.evaluate(() => [...document.querySelectorAll('#forschung article')].map((a) => Math.round(a.getBoundingClientRect().width) + 'x' + Math.round(a.getBoundingClientRect().height)));
console.log('dev cards', cards.join(' '));
// facts
const fy = await page.evaluate(() => { const e = [...document.querySelectorAll('main *')].find((x) => /^46/.test(x.textContent.trim()) && x.textContent.trim().length < 8); return Math.round(e.getBoundingClientRect().top + scrollY); });
await page.evaluate((t) => window.scrollTo({ top: t - 300, behavior: 'instant' }), fy);
await sleep(1500);
await page.screenshot({ path: `${out}/dev-facts.png` });
const ls = await page.evaluate(() => ({ h1: getComputedStyle(document.querySelector('h1')).letterSpacing, h1fs: getComputedStyle(document.querySelector('h1')).fontSize }));
console.log('dev h1', JSON.stringify(ls));
await browser.close();
