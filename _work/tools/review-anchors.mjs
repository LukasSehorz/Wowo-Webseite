import { open, roundDir, scrollTo, sleep } from './review-lib.mjs';
const out = roundDir(undefined, 'states');
const { browser, page } = await open('/', 'desktop');
// 1 hero text link → #forschung
await page.locator('main a', { hasText: 'Was die Forschung zeigt' }).first().click();
await sleep(4500);
let s = await page.evaluate(() => ({ y: Math.round(scrollY), hash: location.hash, secTop: Math.round(document.querySelector('#forschung').getBoundingClientRect().top), h2Top: Math.round([...document.querySelectorAll('h2')].find((h) => /Was Studien/.test(h.getAttribute('aria-label') || h.textContent)).getBoundingClientRect().top) }));
console.log('after hero link', JSON.stringify(s));
await page.screenshot({ path: `${out}/anchor-forschung.png` });
// 2 intro link → #anpassung
await scrollTo(page, 900, 800);
await page.locator('main a', { hasText: 'So läuft die Anpassung ab' }).first().click();
await sleep(4000);
s = await page.evaluate(() => ({ y: Math.round(scrollY), hash: location.hash, secTop: Math.round(document.querySelector('#anpassung').getBoundingClientRect().top) }));
console.log('after intro link', JSON.stringify(s));
await page.screenshot({ path: `${out}/anchor-anpassung.png` });
// 3 header dead strip
await scrollTo(page, 2100, 800);
const strip = await page.evaluate(() => {
  const res = [];
  for (const y of [70, 79, 84, 88, 91, 95]) { const el = document.elementFromPoint(300, y); res.push({ y, tag: el?.tagName, inHeader: !!el?.closest('header') }); }
  const h = document.querySelector('header');
  return { res, pe: getComputedStyle(h).pointerEvents, h: h.getBoundingClientRect().height };
});
console.log('header strip', JSON.stringify(strip));
// 4 rail click → step 3
const top = await page.evaluate(() => Math.round(document.querySelector('#anpassung').getBoundingClientRect().top + scrollY));
await scrollTo(page, top + 100, 1000);
await page.locator('button[aria-label^="Schritt 3"]').click();
await sleep(2500);
const st = await page.evaluate(() => ({ y: Math.round(scrollY), current: document.querySelector('#anpassung li[aria-current="step"] h3')?.textContent }));
console.log('rail click → ', JSON.stringify(st), 'sectionTop', top);
await browser.close();
