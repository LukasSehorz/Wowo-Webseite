#!/usr/bin/env node
// Open the "Stock Video Free License" modal on mixkit.co/license and print its text.
import { chromium } from 'playwright';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const browser = await chromium.launch();
const page = await (await browser.newContext({ userAgent: UA, viewport: { width: 1400, height: 1000 }, locale: 'en-US' })).newPage();
await page.goto('https://mixkit.co/license/', { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
await page.getByText('Reject all').first().click({ timeout: 3000 }).catch(() => {});
await page.waitForTimeout(1000);
let txt = '';
for (let attempt = 0; attempt < 3; attempt++) {
  await page.getByText('View License').first().click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(1500);
  txt = await page.evaluate(() => document.body.innerText);
  if (txt.includes('Stock Video Free License')) break;
}
const i = txt.indexOf('Stock Video Free License');
console.log('len', txt.length, 'idx', i);
console.log(i >= 0 ? txt.slice(i, i + 3000) : txt.slice(-2500));
await browser.close();
