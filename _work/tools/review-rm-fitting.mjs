import { open, roundDir, scrollTo, sleep } from './review-lib.mjs';
const out = roundDir(undefined, 'a11y');
const { browser, page } = await open('/', 'desktop', { reducedMotion: 'reduce' });
const top = await page.evaluate(() => Math.round(document.querySelector('#anpassung').getBoundingClientRect().top + scrollY));
await scrollTo(page, top - 81, 1800);
await page.screenshot({ path: `${out}/reduced-desktop-fitting-viewport.png` });
const info = await page.evaluate(() => {
  const ol = document.querySelector('#anpassung ol');
  const cs = getComputedStyle(ol);
  return { overflowX: cs.overflowX, scrollW: ol.scrollWidth, clientW: ol.clientWidth, display: cs.display, items: [...ol.children].map((li) => Math.round(li.getBoundingClientRect().right)) };
});
console.log(JSON.stringify(info));
await browser.close();
