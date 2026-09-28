#!/usr/bin/env node
// Review screenshots of the research section: every study in both states, desktop 1440 and
// mobile 390, plus the opened details. Usage: node studies-shots.mjs [baseUrl] [outDir] [only=desktop|mobile]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:3101';
const out = process.argv[3] ?? '../review/studien-neu';
const only = process.argv[4];
mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const devices = [
  ['desktop', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, 150],
  ['mobil', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, 92],
].filter(([name]) => !only || name.startsWith(only.slice(0, 3)));

const browser = await chromium.launch();
for (const [name, options, offset] of devices) {
  const context = await browser.newContext({ ...options, locale: 'de-DE' });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base, { waitUntil: 'networkidle' });
  await sleep(800);
  const place = async () => {
    const y = await page.evaluate((o) => document.querySelector('#forschung [role="tablist"]').getBoundingClientRect().top + window.scrollY - o, offset);
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
  };
  await place();
  await sleep(1800);
  await place();
  const tabs = page.locator('#forschung [role="tab"]');
  const count = await tabs.count();
  for (let i = 0; i < count; i++) {
    await tabs.nth(i).click();
    await sleep(1700);
    await place();
    await sleep(200);
    await page.screenshot({ path: `${out}/studies-${name}-${i + 1}-b.png` });
    const panel = page.locator(`#forschung [role="tabpanel"]`).nth(i);
    await panel.locator('label').first().click();
    await sleep(1300);
    await page.screenshot({ path: `${out}/studies-${name}-${i + 1}-a.png` });
    await panel.locator('label').nth(1).click();
    await sleep(300);
  }
  await tabs.first().click();
  await sleep(900);
  await page.getByRole('button', { name: 'Genauer ansehen' }).click();
  await sleep(900);
  const y = await page.evaluate(() => document.querySelector('[data-study-details-toggle]').getBoundingClientRect().top + window.scrollY - 100);
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
  await sleep(400);
  await page.screenshot({ path: `${out}/studies-${name}-details.png` });
  console.log(`${name}: ${count} studies, console problems: ${errors.length ? errors.slice(0, 4).join(' | ') : 'none'}`);
  await context.close();
}
await browser.close();
