#!/usr/bin/env node
// Records a scroll video of a page (fresh load -> hold -> smooth wheel scroll down -> scroll up a bit -> hold).
// A timeline JSON (video time -> scrollY) is written next to the video so frames can be mapped to sections.
// Usage: node ref-video.mjs --url <url> --name <name> --out <dir> [--device desktop|mobile] [--pxps 700] [--hold 3000] [--max 9000]
import { join } from 'node:path';
import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { openSession, sleep, parseArgs, pageHeight } from './ref-lib.mjs';

const { opt } = parseArgs();
const url = opt('url');
const name = opt('name', 'page');
const out = opt('out', '../reference/motion');
const device = opt('device', 'desktop');
const pxps = parseInt(opt('pxps', '700'), 10); // scroll speed px per second
const hold = parseInt(opt('hold', '3000'), 10);
const maxY = parseInt(opt('max', '0'), 10); // 0 = whole page
mkdirSync(out, { recursive: true });

const { browser, context, page, cfg } = await openSession(device, { video: { dir: out } });
const t0 = Date.now();
const timeline = [];
const mark = async (label) => timeline.push({ t: Date.now() - t0, label, y: await page.evaluate(() => Math.round(scrollY)).catch(() => -1) });

await page.goto(url, { waitUntil: 'commit', timeout: 60000 });
await mark('commit');
await page.waitForLoadState('domcontentloaded').catch(() => {});
await mark('domcontentloaded');
await page.waitForLoadState('load', { timeout: 30000 }).catch(() => {});
await mark('load');
await sleep(hold);
await mark('hold-end');

const total = await pageHeight(page);
const target = maxY > 0 ? Math.min(maxY, total) : total;
const step = Math.max(4, Math.round(pxps / 30));
const isTouch = device === 'mobile';
let y = 0;
let n = 0;
if (!isTouch) await page.mouse.move(cfg.viewport.width / 2, cfg.viewport.height / 2);
while (y < target - cfg.viewport.height) {
  if (isTouch) await page.evaluate((s) => window.scrollBy(0, s), step);
  else await page.mouse.wheel(0, step);
  y += step;
  n += 1;
  if (n % 15 === 0) await mark('down');
  await sleep(33);
}
await mark('bottom');
await sleep(1200);
// scroll up 900px to show sticky header on reverse scroll
for (let i = 0; i < 45; i += 1) {
  if (isTouch) await page.evaluate(() => window.scrollBy(0, -20));
  else await page.mouse.wheel(0, -20);
  if (i % 15 === 0) await mark('up');
  await sleep(33);
}
await mark('up-end');
await sleep(1200);

const video = page.video();
await context.close();
const p = await video.path();
const file = join(out, `${name}-${device}-scroll.webm`);
renameSync(p, file);
writeFileSync(join(out, `${name}-${device}-scroll-timeline.json`), JSON.stringify({ url, device, pxps, pageHeight: total, timeline }, null, 1));
await browser.close();
console.log('video ->', file, 'duration(ms)', Date.now() - t0);
