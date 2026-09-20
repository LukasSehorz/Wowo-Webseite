#!/usr/bin/env node
// Builder self-check: viewport slices at an arbitrary width (the shared shoot.mjs covers 1440 and 390 only).
// Usage: node build-widths.mjs --width 1024 --out <dir> [--name home] [--url http://localhost:3101/] [--height 800] [--wait 1000]

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};
const width = parseInt(opt('width', '1024'), 10);
const height = parseInt(opt('height', '800'), 10);
const out = opt('out', './shots');
const name = opt('name', 'home');
const url = opt('url', 'http://localhost:3101/');
const wait = parseInt(opt('wait', '1000'), 10);
mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, locale: 'de-DE' });
const page = await context.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await sleep(1200);

const total = () => page.evaluate(() => document.documentElement.scrollHeight);
let y = 0;
let i = 1;
while (y < (await total()) && i <= 40) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
  await sleep(wait);
  await page.screenshot({ path: join(out, `${name}-w${width}-slice-${String(i).padStart(2, '0')}.png`) });
  y += Math.round(height * 0.9);
  i += 1;
}
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
console.log(`width ${width}: ${i - 1} slices, horizontal overflow ${overflow}px`);
await browser.close();
