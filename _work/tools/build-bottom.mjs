#!/usr/bin/env node
// Builder self-check: screenshot of the page end (trust strip, footer reveal, copyright bar).
// Usage: node build-bottom.mjs <out.png> [url] [desktop|mobile] [offsetFromEnd]

import { chromium } from 'playwright';

const out = process.argv[2];
const url = process.argv[3] ?? 'http://localhost:3101/';
const device = process.argv[4] ?? 'desktop';
const offset = parseInt(process.argv[5] ?? '0', 10);
const browser = await chromium.launch();
const context = await browser.newContext(
  device === 'mobile'
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'de-DE' }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'de-DE' },
);
const page = await context.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await page.evaluate((o) => window.scrollTo(0, document.documentElement.scrollHeight - window.innerHeight - o), offset);
await page.waitForTimeout(1500);
await page.screenshot({ path: out });
await browser.close();
console.log('saved', out);
