#!/usr/bin/env node
// Builder self-check: one screenshot of a single element, optionally with the pointer placed on it.
// Usage: node build-shot.mjs --sel "<css>" --out <file.png> [--url http://localhost:3101/] [--device desktop|mobile]
//                            [--hover 0.85,0.2] [--wait 1500] [--pad 24] [--width 1440]

import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};
const url = opt('url', 'http://localhost:3101/');
const sel = opt('sel');
const out = opt('out');
const device = opt('device', 'desktop');
const hover = opt('hover', '');
const wait = parseInt(opt('wait', '1500'), 10);
const pad = parseInt(opt('pad', '24'), 10);
const width = parseInt(opt('width', '1440'), 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const context = await browser.newContext(
  device === 'mobile'
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'de-DE' }
    : { viewport: { width, height: 900 }, deviceScaleFactor: 1, locale: 'de-DE' },
);
const page = await context.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await sleep(800);
const target = page.locator(sel).first();
await target.evaluate((el) => el.scrollIntoView({ block: 'center' }));
await sleep(wait);
const box = await target.boundingBox();
if (hover) {
  const [fx, fy] = hover.split(',').map(Number);
  await page.mouse.move(box.x + box.width * fx, box.y + box.height * fy, { steps: 6 });
  await sleep(900);
}
const view = page.viewportSize();
const clip = {
  x: Math.max(0, box.x - pad),
  y: Math.max(0, box.y - pad),
  width: Math.min(view.width - Math.max(0, box.x - pad), box.width + pad * 2),
  height: Math.min(view.height - Math.max(0, box.y - pad), box.height + pad * 2),
};
await page.screenshot({ path: out, clip });
await browser.close();
console.log('saved', out);
