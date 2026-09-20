// Round 3: replicate the shoot.mjs slice sequence on /gutscheine mobile and log the order bar state per slice.
import { open, roundDir, sleep } from './review-lib.mjs';

const out = roundDir('round-3', 'states');
const { browser, page } = await open('/gutscheine', 'mobile');
const vh = 844;
const total = () => page.evaluate(() => document.documentElement.scrollHeight);
const probe = async () => page.evaluate(() => {
  const bar = [...document.querySelectorAll('div.fixed.inset-x-0.bottom-0')].find((b) => b.querySelector('button'));
  const summary = document.querySelector('aside[aria-labelledby="summary-heading"]');
  const section = document.getElementById('anfrage');
  const r = (el) => { const b = el.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom)]; };
  return {
    y: Math.round(scrollY),
    barInert: bar?.hasAttribute('inert'),
    barTranslate: bar ? getComputedStyle(bar).translate : null,
    barTop: bar ? r(bar)[0] : null,
    summary: summary ? r(summary) : null,
    section: section ? r(section) : null,
  };
});
let y = 0, i = 1, height = await total();
const rows = [];
while (y < height && i <= 40) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
  await sleep(1200);
  const p = await probe();
  rows.push({ slice: i, ...p });
  if (i >= 6 && i <= 10) await page.screenshot({ path: `${out}/m-bar-slice-${String(i).padStart(2, '0')}.png` });
  y += Math.round(vh * 0.9);
  i += 1;
  height = await total();
}
console.table(rows);
// now scroll slowly (touch-like) from slice 8 to slice 9 and log again
for (let yy = 5320; yy <= 6200; yy += 80) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), yy);
  await sleep(250);
  const p = await probe();
  console.log('slow', p.y, 'inert', p.barInert, 'translate', p.barTranslate, 'summary', p.summary, 'section', p.section);
}
await browser.close();
