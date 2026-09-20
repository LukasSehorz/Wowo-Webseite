#!/usr/bin/env node
// Builder self-check: one screenshot per study card (the carousel hides cards 4 and 5 in page slices).
// Usage: node build-cards.mjs <outDir> [url] [device]

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2];
const url = process.argv[3] ?? 'http://localhost:3101/';
const device = process.argv[4] ?? 'desktop';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext(
  device === 'mobile'
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'de-DE' }
    : { viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1, locale: 'de-DE' },
);
const page = await context.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
const cards = page.locator('#forschung article');
const count = await cards.count();
for (let i = 0; i < count; i++) {
  const card = cards.nth(i);
  // instant scrolling: the page scrolls anchors smoothly, and a second scroll call would cancel that
  await card.evaluate((el) => {
    const scroller = el.closest('[role="region"]');
    scroller.scrollTo({ left: el.parentElement.offsetLeft, behavior: 'instant' });
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110, behavior: 'instant' });
  });
  await page.waitForTimeout(2200);
  await card.screenshot({ path: join(out, `study-card-${device}-${i + 1}.png`) });
}
await browser.close();
console.log(`${count} cards saved to ${out}`);
