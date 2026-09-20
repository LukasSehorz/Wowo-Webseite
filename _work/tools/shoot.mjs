#!/usr/bin/env node
// Reusable screenshot tool for reference analysis and review rounds.
//
// Usage:
//   node shoot.mjs --url <url> --out <dir> [--name home] [--device desktop|mobile|both]
//                  [--slices] [--fullpage] [--video] [--wait 800] [--dismiss "<css selector>"]
//
//   --slices    scrolls through the page viewport by viewport and saves one PNG per
//               position (scroll-triggered animations get time to settle first)
//   --fullpage  one stitched full-page PNG (after a pre-scroll so lazy content is loaded)
//   --video     records a slow scroll through the page as .webm (for judging motion)
//   --dismiss   CSS selector(s), comma separated, clicked if present (cookie banners, popups)
//
// Output files: <out>/<name>-<device>-full.png, <out>/<name>-<device>-slice-01.png, ...

import { chromium } from 'playwright';
import { mkdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d;
};

const url = opt('url');
const out = opt('out', './shots');
const name = opt('name', 'page');
const device = opt('device', 'both');
const wait = parseInt(opt('wait', '800'), 10);
const dismiss = opt('dismiss', '');
if (!url) {
  console.error('missing --url');
  process.exit(1);
}
mkdirSync(out, { recursive: true });

const DEVICES = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false },
  mobile: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function tryDismiss(page) {
  if (!dismiss) return;
  for (const sel of dismiss.split(',').map((s) => s.trim()).filter(Boolean)) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 500 })) await el.click({ timeout: 1000 });
    } catch {}
  }
}

async function run(devName) {
  const cfg = DEVICES[devName];
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...cfg,
    locale: 'de-DE',
    ...(flag('video') ? { recordVideo: { dir: out, size: cfg.viewport } } : {}),
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await sleep(1500);
  await tryDismiss(page);

  const vh = cfg.viewport.height;
  const total = () => page.evaluate(() => document.documentElement.scrollHeight);

  if (flag('slices') || flag('video')) {
    let y = 0;
    let i = 1;
    let height = await total();
    while (y < height && i <= 40) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
      await sleep(wait);
      await tryDismiss(page);
      if (flag('slices')) {
        const file = join(out, `${name}-${devName}-slice-${String(i).padStart(2, '0')}.png`);
        await page.screenshot({ path: file });
      }
      y += Math.round(vh * 0.9);
      i += 1;
      height = await total();
    }
  }

  if (flag('fullpage')) {
    // pre-scroll so lazy images / reveal animations have fired before stitching
    const height = await total();
    for (let y = 0; y < height; y += Math.round(vh * 0.6)) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
      await sleep(250);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await sleep(600);
    await page.screenshot({ path: join(out, `${name}-${devName}-full.png`), fullPage: true });
  }

  const video = flag('video') ? page.video() : null;
  await context.close();
  if (video) {
    const p = await video.path();
    renameSync(p, join(out, `${name}-${devName}-scroll.webm`));
  }
  await browser.close();
  console.log(`done: ${name} (${devName}) -> ${out}`);
}

const list = device === 'both' ? ['desktop', 'mobile'] : [device];
for (const d of list) await run(d);
