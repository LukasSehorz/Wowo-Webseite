#!/usr/bin/env node
// Clean capture of a reference page: viewport slices + full page (popups blocked, lazy media awaited).
// Usage: node ref-capture.mjs --url <url> --out <dir> --name <name> [--device desktop|mobile|both]
//                             [--wait 900] [--overlap 0.9] [--noslices] [--nofull]
import { join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { openSession, gotoReady, dismissPopups, preScroll, waitViewportImages, pageHeight, sleep, parseArgs } from './ref-lib.mjs';

const { flag, opt } = parseArgs();
const url = opt('url');
const out = opt('out', '../reference/shots');
const name = opt('name', 'page');
const device = opt('device', 'both');
const wait = parseInt(opt('wait', '900'), 10);
const overlap = parseFloat(opt('overlap', '0.9'));
if (!url) {
  console.error('missing --url');
  process.exit(1);
}
mkdirSync(out, { recursive: true });

async function run(dev) {
  const { browser, page, cfg } = await openSession(dev);
  const resp = await gotoReady(page, url);
  await dismissPopups(page);
  const vh = cfg.viewport.height;
  const index = [];

  // 1) pre-scroll so lazy media is requested, then go back to the top
  await preScroll(page);

  if (!flag('noslices')) {
    let y = 0;
    let i = 1;
    let h = await pageHeight(page);
    while (y < h && i <= 45) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
      await sleep(wait);
      await waitViewportImages(page);
      const file = `${name}-${dev}-slice-${String(i).padStart(2, '0')}.png`;
      await page.screenshot({ path: join(out, file) });
      const real = await page.evaluate(() => Math.round(scrollY));
      index.push({ file, scrollY: real });
      if (real + vh >= h - 2) break;
      y += Math.round(vh * overlap);
      i += 1;
      h = await pageHeight(page);
    }
  }

  if (!flag('nofull')) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await sleep(700);
    await page.screenshot({ path: join(out, `${name}-${dev}-full.png`), fullPage: true });
  }
  const h = await pageHeight(page);
  writeFileSync(join(out, `${name}-${dev}-index.json`), JSON.stringify({ url, status: resp?.status(), device: dev, viewport: cfg.viewport, pageHeight: h, slices: index }, null, 2));
  await browser.close();
  console.log(`done ${name} ${dev}: status ${resp?.status()} height ${h}px, ${index.length} slices`);
}

for (const d of device === 'both' ? ['desktop', 'mobile'] : [device]) await run(d);
