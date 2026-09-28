#!/usr/bin/env node
// Renders the static Open Graph image (1200 × 630) from the fitting photo and the white logo.
// Usage: node build-og.mjs   (writes src/app/opengraph-image.jpg)

import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dataUri = (file, type) => `data:${type};base64,${readFileSync(join(root, file)).toString('base64')}`;
const photo = dataUri('public/media/images/fitting-hands.jpg', 'image/jpeg');
const mark = dataUri('public/brand/mark-white.png', 'image/png');

const html = `<!doctype html><html><head><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet"></head><body style="margin:0">
<div style="position:relative;width:1200px;height:630px;overflow:hidden;background:#0f2034">
  <img src="${photo}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 45%">
  <div style="position:absolute;inset:0;background:linear-gradient(200deg,rgba(15,32,52,0) 35%,rgba(15,32,52,.78) 100%)"></div>
  <div style="position:absolute;inset:0;background:rgba(15,32,52,.12)"></div>
  <div style="position:absolute;left:64px;bottom:56px;display:flex;align-items:center;gap:22px;color:#fff;font-family:Poppins,Helvetica,Arial,sans-serif">
    <img src="${mark}" style="width:96px;height:96px">
    <div style="width:1px;height:96px;background:rgba(255,255,255,.5)"></div>
    <div style="display:flex;flex-direction:column;gap:10px;white-space:nowrap">
      <span style="font-size:30px;font-weight:600;letter-spacing:.04em;line-height:1">BRANDLMAIER &amp; RAUSCHER</span>
      <span style="font-size:19px;letter-spacing:.2em;line-height:1">Einlagen</span>
    </div>
  </div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
const out = join(root, 'src/app/opengraph-image.jpg');
await page.screenshot({ path: out, type: 'jpeg', quality: 86, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log('written', out);
