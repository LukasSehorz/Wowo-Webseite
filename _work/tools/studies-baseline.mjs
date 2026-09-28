// Baseline: the studies section before the rebuild (desktop 1440, mobile 390).
import { chromium } from 'playwright';
const base = process.argv[2] ?? 'http://localhost:3101';
const out = process.argv[3] ?? '../review/studien-neu';
const b = await chromium.launch();
for (const [n, w, h, m] of [['desktop', 1440, 900, false], ['mobil', 390, 844, true]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: m, hasTouch: m, deviceScaleFactor: m ? 2 : 1, locale: 'de-DE' });
  const p = await ctx.newPage();
  await p.goto(`${base}/#forschung`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  await p.evaluate(() => scrollBy(0, 300));
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${out}/studies-vorher-${n}.png` });
  await ctx.close();
}
await b.close();
