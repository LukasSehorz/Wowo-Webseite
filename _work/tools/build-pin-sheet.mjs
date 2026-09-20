#!/usr/bin/env node
// Builder self-check: contact sheet of the pinned fitting process, one frame every 120 px of scrolling
// from the pin start to the release, so the pacing of the four steps can be judged at a glance.
// Usage: node build-pin-sheet.mjs <out.png> [baseUrl]

import { chromium } from 'playwright';

const out = process.argv[2];
const base = process.argv[3] ?? 'http://localhost:3101';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto(base + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
const sec = await page.evaluate(() => { const el = document.getElementById('anpassung'); return { top: Math.round(el.getBoundingClientRect().top + scrollY), height: el.offsetHeight }; });
const frames = [];
for (let y = sec.top - 81; y <= sec.top + sec.height - 900 + 240; y += 120) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
  await page.waitForTimeout(700);
  frames.push({ y: y - sec.top, buf: await page.screenshot({ type: 'png' }) });
}
await browser.close();
// stitch with sharp-free approach: write frames and let a tiny Python step assemble (kept in the shell call)
import { writeFileSync, mkdirSync } from 'node:fs';
mkdirSync(out, { recursive: true });
frames.forEach((f, i) => writeFileSync(`${out}/frame-${String(i).padStart(2, '0')}-rel${f.y}.png`, f.buf));
console.log(`${frames.length} frames written to ${out}`);
