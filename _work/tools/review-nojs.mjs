// No-JS robustness: is the content visible when scripts do not run?
import { chromium } from 'playwright';
import { roundDir } from './review-lib.mjs';
const out = roundDir(undefined, 'a11y');
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false, locale: 'de-DE' });
const page = await ctx.newPage();
await page.goto('http://localhost:3100/', { waitUntil: 'load' });
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}/nojs-desktop-full.png`, fullPage: true });
await browser.close();
console.log('done');
