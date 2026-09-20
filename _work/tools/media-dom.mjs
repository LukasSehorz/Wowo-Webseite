#!/usr/bin/env node
// Dump useful DOM info for a page: anchors matching a regex, video/img sources, JSON-LD, og tags.
// Usage: node media-dom.mjs <url> [anchorRegex]
import { chromium } from 'playwright';
const [url, reSrc] = process.argv.slice(2);
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const browser = await chromium.launch();
const context = await browser.newContext({ userAgent: UA, viewport: { width: 1600, height: 1200 }, locale: 'en-US' });
const page = await context.newPage();
const media = new Set();
page.on('request', (r) => { const u = r.url(); if (/\.(mp4|webm|m3u8)(\?|$)/i.test(u)) media.add(u); });
const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
await page.waitForTimeout(1500);
const info = await page.evaluate((reSrc) => {
  const re = reSrc ? new RegExp(reSrc) : null;
  const anchors = [...document.querySelectorAll('a[href]')].map((a) => a.href).filter((h) => (re ? re.test(h) : false));
  const vids = [...document.querySelectorAll('video, video source')].map((v) => v.currentSrc || v.src).filter(Boolean);
  const metas = [...document.querySelectorAll('meta[property^="og:"], meta[name="author"], meta[name="description"]')].map((m) => `${m.getAttribute('property') || m.getAttribute('name')}=${m.content}`);
  const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent.slice(0, 3000));
  return { title: document.title, anchors: [...new Set(anchors)].slice(0, 60), vids: [...new Set(vids)].slice(0, 30), metas, ld };
}, reSrc || '');
console.log(JSON.stringify({ status: resp?.status(), ...info, mediaRequests: [...media].slice(0, 30) }, null, 1));
await browser.close();
