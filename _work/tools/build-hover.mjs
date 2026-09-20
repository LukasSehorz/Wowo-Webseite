#!/usr/bin/env node
// Builder self-check: captures hover states (before / mid / after) as small strips.
// Usage: node build-hover.mjs <outDir> [baseUrl]

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2];
const base = process.argv[3] ?? 'http://localhost:3101';
if (!out) {
  console.error('usage: node build-hover.mjs <outDir> [baseUrl]');
  process.exit(1);
}
mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE' });
const page = await context.newPage();
await page.goto(base, { waitUntil: 'networkidle' });
await sleep(1500);

async function strip(name, locator, pad = 24, scrollBlock = 'center') {
  await locator.evaluate((el, block) => el.scrollIntoView({ block }), scrollBlock);
  await sleep(1400);
  await page.mouse.move(2, 2);
  await sleep(300);
  const box = await locator.boundingBox();
  const clip = {
    x: Math.max(0, box.x - pad),
    y: Math.max(0, box.y - pad),
    width: box.width + pad * 2,
    height: box.height + pad * 2,
  };
  await page.screenshot({ path: join(out, `${name}-0-before.png`), clip });
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
  await sleep(260);
  await page.screenshot({ path: join(out, `${name}-1-mid.png`), clip });
  await sleep(900);
  await page.screenshot({ path: join(out, `${name}-2-after.png`), clip });
  await page.mouse.move(2, 2);
  await sleep(250);
  await page.screenshot({ path: join(out, `${name}-3-leaving.png`), clip });
  await sleep(800);
}

await strip('hover-hero-button', page.locator('section').first().getByRole('link', { name: 'Gutscheine für Ihr Team' }), 24, 'end');
await strip('hover-hero-link', page.getByRole('link', { name: 'Was die Forschung zeigt' }), 24, 'end');
await strip('hover-outline-button', page.getByRole('link', { name: 'Zum Hersteller' }));
await strip('hover-audience-tile', page.locator('h3 button[aria-expanded]').first().locator('xpath=ancestor::div[@data-open]'), 8);
await strip('hover-arrow-link', page.getByRole('link', { name: 'So läuft die Anpassung ab' }).last());
await strip('hover-solid-button', page.locator('main').getByRole('link', { name: 'Gutscheine anfragen' }));
await strip('hover-voucher-card', page.locator('[style*="perspective"]').first(), 30);

await browser.close();
console.log('hover strips written to', out);
