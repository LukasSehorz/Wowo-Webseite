// Screenshot of the research section without JavaScript (desktop 1440 and mobile 390).
import { chromium } from 'playwright';
const out = process.argv[2] ?? '../review/studien-neu';
const b = await chromium.launch();
for (const [n, w, h, m] of [['desktop', 1440, 900, false], ['mobil', 390, 844, true]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: m, deviceScaleFactor: 1, javaScriptEnabled: false, locale: 'de-DE' });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3101/', { waitUntil: 'load' });
  const y = await p.evaluate(() => document.querySelector('#forschung').getBoundingClientRect().top + window.scrollY);
  await p.evaluate((top) => window.scrollTo(0, top + 250), y);
  await p.screenshot({ path: `${out}/studies-${n}-ohne-js.png` });
  await ctx.close();
}
await b.close();
