#!/usr/bin/env node
// Builder self-check: every display-voice element on a page with its computed type values, the
// "weight 800 below 40 px" rule, overflow, and a zoomed contact sheet to look for fused glyphs.
// Usage: node build-type.mjs <outDir> [baseUrl] [paths…]

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2];
const base = process.argv[3] ?? 'http://localhost:3101';
const paths = process.argv.length > 4 ? process.argv.slice(4) : ['/', '/ueber-uns', '/gutscheine'];
mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SELECTOR = '.display, .display-stat, .display-figure, .display-numeral, .display-small, .numeral-spacing';

const browser = await chromium.launch();
let violations = 0;

for (const device of ['desktop', 'mobile']) {
  const context = await browser.newContext(
    device === 'mobile'
      ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'de-DE', reducedMotion: 'reduce' }
      : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'de-DE', reducedMotion: 'reduce' },
  );
  for (const path of paths) {
    const page = await context.newPage();
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await sleep(600);
    const items = await page.evaluate((selector) => {
      const seen = new Set();
      return Array.from(document.querySelectorAll(selector))
        .filter((el) => {
          const text = el.textContent.trim();
          const rect = el.getBoundingClientRect();
          if (!text || rect.width === 0) return false;
          const key = text + Math.round(parseFloat(getComputedStyle(el).fontSize));
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((el, index) => {
          el.setAttribute('data-type-probe', String(index));
          const style = getComputedStyle(el);
          const size = parseFloat(style.fontSize);
          const range = document.createRange();
          range.selectNodeContents(el);
          const lines = new Set(Array.from(range.getClientRects()).map((r) => Math.round(r.top))).size;
          const parent = el.parentElement.getBoundingClientRect();
          return {
            index,
            text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40),
            size: Math.round(size * 10) / 10,
            weight: style.fontWeight,
            tracking: Math.round((parseFloat(style.letterSpacing) / size) * 1000) / 1000,
            kerning: style.fontKerning,
            lines,
            overflow: el.scrollWidth > el.clientWidth + 1 || el.getBoundingClientRect().right > parent.right + 1,
          };
        });
    }, SELECTOR);

    console.log(`\n${device} ${path}`);
    for (const item of items) {
      const expected = item.size < 39.95 ? '800' : '900';
      const bad = item.weight !== expected || item.overflow;
      if (bad) violations += 1;
      console.log(
        `${bad ? '!!' : '  '} ${String(item.size).padStart(5)}px w${item.weight} ls ${String(item.tracking).padStart(6)}em kern ${item.kerning.padEnd(6)} lines ${item.lines}${item.overflow ? ' OVERFLOW' : ''}  ${item.text}`,
      );
    }

    // zoomed crops, stacked into one sheet per page and device
    const name = `${device}${path === '/' ? '-home' : path.replace(/\//g, '-')}`;
    const crops = [];
    for (const item of items) {
      const el = page.locator(`[data-type-probe="${item.index}"]`);
      await el.evaluate((node) => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await sleep(80);
      const file = join(out, `${name}-${String(item.index).padStart(2, '0')}.png`);
      await el.screenshot({ path: file }).catch(() => null);
      crops.push(file);
    }
    await page.close();
  }
  await context.close();
}
await browser.close();
console.log(`\n${violations} violation(s) of the weight rule or overflow`);
