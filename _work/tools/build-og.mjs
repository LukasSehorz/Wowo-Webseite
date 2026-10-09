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
const logo = dataUri('public/brand/logo-full-white.png', 'image/png');

const html = `<!doctype html><html><body style="margin:0">
<div style="position:relative;width:1200px;height:630px;overflow:hidden;background:#0f2034">
  <img src="${photo}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 45%">
  <div style="position:absolute;inset:0;background:linear-gradient(200deg,rgba(15,32,52,0) 35%,rgba(15,32,52,.78) 100%)"></div>
  <div style="position:absolute;inset:0;background:rgba(15,32,52,.12)"></div>
  <img src="${logo}" style="position:absolute;left:64px;bottom:56px;width:380px;height:auto">
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.waitForTimeout(300);
const out = join(root, 'src/app/opengraph-image.jpg');
await page.screenshot({ path: out, type: 'jpeg', quality: 86, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log('written', out);
