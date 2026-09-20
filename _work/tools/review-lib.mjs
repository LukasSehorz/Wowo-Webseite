// Shared helpers for the reviewer's Playwright scripts (round folders under _work/review/).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

export const ROOT =
  '/Users/lukas.sehorz/Library/CloudStorage/OneDrive-Persönlich/Desktop/Webseiten/Sale/Wowo-Webseit';
export const BASE = 'http://localhost:3100';

export const DEVICES = {
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

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const ROUND = process.env.REVIEW_ROUND || 'round-1';

export function roundDir(round = ROUND, sub = 'shots') {
  const dir = `${ROOT}/_work/review/${round}/${sub}`;
  mkdirSync(dir, { recursive: true });
  return dir;
}

export async function open(path = '/', device = 'desktop', ctxOpts = {}) {
  const browser = await chromium.launch();
  const cfg = typeof device === 'string' ? DEVICES[device] : device;
  const context = await browser.newContext({ ...cfg, locale: 'de-DE', ...ctxOpts });
  const page = await context.newPage();
  const logs = { console: [], pageerror: [], failed: [], badStatus: [] };
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) logs.console.push(`[${m.type()}] ${m.text()}`);
  });
  page.on('pageerror', (e) => logs.pageerror.push(String(e)));
  page.on('requestfailed', (r) => logs.failed.push(`${r.url()} ${r.failure()?.errorText}`));
  page.on('response', (r) => {
    if (r.status() >= 400) logs.badStatus.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await sleep(1200);
  return { browser, context, page, logs };
}

export async function scrollTo(page, y, wait = 900) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
  await sleep(wait);
}

// scroll through the whole page once so that every reveal has fired
export async function primeReveals(page, step = 500, wait = 180) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += step) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await sleep(wait);
  }
}
