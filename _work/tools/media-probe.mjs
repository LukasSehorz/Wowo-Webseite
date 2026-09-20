#!/usr/bin/env node
// Probe which stock sites are reachable with headless Chromium.
// Usage: node media-probe.mjs <url> <outPng>
import { chromium } from 'playwright';

const [url, out] = process.argv.slice(2);
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const browser = await chromium.launch();
const context = await browser.newContext({
  userAgent: UA,
  viewport: { width: 1600, height: 1200 },
  locale: 'en-US',
});
const page = await context.newPage();
let status = null;
try {
  const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  status = resp?.status();
  await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
  await page.waitForTimeout(1500);
} catch (e) {
  console.log('ERR', e.message);
}
const title = await page.title().catch(() => '');
const counts = await page
  .evaluate(() => ({
    imgs: document.images.length,
    videos: document.querySelectorAll('video').length,
    links: document.links.length,
    bodyLen: document.body?.innerText?.length || 0,
  }))
  .catch(() => ({}));
console.log(JSON.stringify({ url, status, title, ...counts }));
if (out) await page.screenshot({ path: out }).catch(() => {});
await browser.close();
