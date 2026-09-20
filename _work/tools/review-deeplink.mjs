import { open, roundDir, sleep } from './review-lib.mjs';
const out = roundDir(undefined, 'states');
for (const hash of ['#forschung', '#druckverteilung']) {
  const { browser, page } = await open('/' + hash, 'desktop');
  await sleep(2500);
  const s = await page.evaluate((h) => ({ y: Math.round(scrollY), top: Math.round(document.querySelector(h).getBoundingClientRect().top), hiddenText: [...document.querySelectorAll(h + ' [data-reveal], ' + h + ' [data-split], ' + h + ' [data-stagger] > *')].filter((e) => { const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 && parseFloat(getComputedStyle(e).opacity) < 0.9; }).length }), hash);
  console.log(hash, JSON.stringify(s));
  await page.screenshot({ path: `${out}/deeplink-${hash.slice(1)}.png` });
  await browser.close();
}
