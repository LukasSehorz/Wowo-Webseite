import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE' });
const page = await ctx.newPage();
const reqs = [];
page.on('response', async (r) => {
  const u = new URL(r.url());
  let size = 0;
  try { size = (await r.body()).length; } catch {}
  reqs.push({ host: u.host, path: u.pathname.slice(0, 60), type: r.request().resourceType(), size, status: r.status() });
});
await page.goto('http://localhost:3100/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const initial = reqs.length;
const byType = {};
for (const r of reqs) { byType[r.type] = byType[r.type] || { n: 0, kb: 0 }; byType[r.type].n++; byType[r.type].kb += r.size / 1024; }
console.log('hosts', [...new Set(reqs.map((r) => r.host))].join(', '));
for (const [t, v] of Object.entries(byType)) console.log(t.padEnd(12), String(v.n).padStart(3), Math.round(v.kb) + ' kB');
console.log('fonts', reqs.filter((r) => r.type === 'font').map((r) => r.path.split('/').pop() + ' ' + Math.round(r.size / 1024) + 'kB').join(' | '));
console.log('media', reqs.filter((r) => r.type === 'media').map((r) => r.path.split('/').pop() + ' ' + r.status + ' ' + Math.round(r.size / 1024) + 'kB').join(' | '));
const perf = await page.evaluate(() => {
  const nav = performance.getEntriesByType('navigation')[0];
  const lcp = performance.getEntriesByType('largest-contentful-paint').pop();
  const cls = performance.getEntriesByType('layout-shift').reduce((a, e) => a + (e.hadRecentInput ? 0 : e.value), 0);
  return { dcl: Math.round(nav.domContentLoadedEventEnd), load: Math.round(nav.loadEventEnd), lcp: lcp ? { t: Math.round(lcp.startTime), el: lcp.element?.tagName, url: (lcp.url || '').slice(-50) } : null, cls };
});
console.log(JSON.stringify(perf));
// CLS with observer incl. buffered
const cls2 = await page.evaluate(() => new Promise((res) => { let v = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) v += e.value; }).observe({ type: 'layout-shift', buffered: true }); setTimeout(() => res(v), 500); }));
const lcp2 = await page.evaluate(() => new Promise((res) => { let last = null; new PerformanceObserver((l) => { for (const e of l.getEntries()) last = { t: Math.round(e.startTime), tag: e.element?.tagName, cls: e.element?.className?.toString().slice(0, 60), url: (e.url || '').slice(-60) }; }).observe({ type: 'largest-contentful-paint', buffered: true }); setTimeout(() => res(last), 500); }));
console.log('CLS', cls2, 'LCP', JSON.stringify(lcp2));
await browser.close();
