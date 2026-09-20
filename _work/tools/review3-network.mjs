// Round 3: request log per page (desktop): duplicates, external hosts, failed, totals by type, transfer size.
import { chromium } from 'playwright';
import { DEVICES, BASE, sleep } from './review-lib.mjs';

for (const path of ['/', '/ueber-uns', '/gutscheine']) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ ...DEVICES.desktop, locale: 'de-DE' });
  const page = await context.newPage();
  const reqs = [];
  page.on('request', (r) => reqs.push({ url: r.url(), type: r.resourceType(), t: Date.now() }));
  const failed = [];
  page.on('requestfailed', (r) => failed.push(`${r.url().slice(-60)} ${r.failure()?.errorText}`));
  const sizes = new Map();
  page.on('response', async (r) => { try { const b = await r.body(); sizes.set(r.url(), (sizes.get(r.url()) || 0) + b.length); } catch {} });
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) { await page.evaluate((t) => window.scrollTo({ top: t, behavior: 'instant' }), y); await sleep(200); }
  await page.waitForLoadState('networkidle').catch(() => {});
  await sleep(1000);
  const counts = new Map();
  for (const r of reqs) counts.set(r.url, (counts.get(r.url) || 0) + 1);
  const dup = [...counts].filter(([, n]) => n > 1).map(([u, n]) => `${n}x ${u.replace(BASE, '').slice(0, 90)}`);
  const hosts = new Set(reqs.map((r) => new URL(r.url).host));
  const byType = {};
  for (const r of reqs) byType[r.type] = (byType[r.type] || 0) + 1;
  const total = [...sizes.values()].reduce((a, b) => a + b, 0);
  const big = [...sizes].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([u, s]) => `${(s / 1024).toFixed(0)}k ${u.replace(BASE, '').slice(0, 70)}`);
  console.log(`\n== ${path}: ${reqs.length} requests, ${(total / 1024 / 1024).toFixed(1)} MB, hosts ${[...hosts].join(',')}, failed ${failed.length} ${failed.join('; ')}`);
  console.log('  by type', JSON.stringify(byType));
  console.log('  duplicates', dup.length ? dup.join(' | ') : 'none');
  console.log('  largest', big.join(' | '));
  await browser.close();
}
