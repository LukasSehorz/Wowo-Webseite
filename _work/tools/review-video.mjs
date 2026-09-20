// Records a continuous wheel scroll through a page (webm) for judging motion.
// usage: node review-video.mjs <path> <name> <desktop|mobile> [pxPerSecond]
import { renameSync } from 'node:fs';
import { open, roundDir, sleep, DEVICES } from './review-lib.mjs';

const path = process.argv[2] || '/';
const name = process.argv[3] || 'home';
const device = process.argv[4] || 'desktop';
const speed = parseInt(process.argv[5] || '700', 10);
const out = roundDir(undefined, 'motion');

const cfg = DEVICES[device];
const { browser, context, page } = await open(path, device, {
  recordVideo: { dir: out, size: cfg.viewport },
});
await sleep(1500);
const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
const stepMs = 16;
const stepPx = (speed * stepMs) / 1000;
let y = 0;
const t0 = Date.now();
if (device === 'desktop') await page.mouse.move(720, 450);
while (y < total) {
  y = Math.min(total, y + stepPx);
  if (device === 'desktop') await page.mouse.wheel(0, stepPx);
  else await page.evaluate((top) => window.scrollTo(0, top), y);
  await sleep(stepMs);
  if (Date.now() - t0 > 100000) break;
}
await sleep(1500);
const video = page.video();
await context.close();
const p = await video.path();
renameSync(p, `${out}/${name}-${device}-scroll.webm`);
await browser.close();
console.log('done', `${out}/${name}-${device}-scroll.webm`, 'seconds', (Date.now() - t0) / 1000);
