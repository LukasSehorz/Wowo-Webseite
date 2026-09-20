#!/usr/bin/env node
// Builder self-check: screenshot of the open mobile menu.
// Usage: node build-menu.mjs <out.png> [url]

import { chromium } from 'playwright';

const out = process.argv[2];
const url = process.argv[3] ?? 'http://localhost:3101/';
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: 'de-DE',
});
const page = await context.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.getByRole('button', { name: 'Menü öffnen' }).tap();
await page.waitForTimeout(1600);
await page.screenshot({ path: out });
await browser.close();
console.log('saved', out);
