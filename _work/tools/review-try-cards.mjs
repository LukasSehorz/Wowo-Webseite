// What-if test (no source edits): study card width vs. resulting height at 1440 and 390.
import { open, primeReveals, roundDir, sleep } from './review-lib.mjs';
const out = roundDir(undefined, 'whatif');
const { browser, page } = await open('/', 'desktop');
await primeReveals(page);
const info = await page.evaluate(() => {
  const a = document.querySelector('#forschung article');
  const li = a.closest('li') || a.parentElement;
  return { liCls: li.className, liStyle: li.getAttribute('style'), liW: getComputedStyle(li).width, flex: getComputedStyle(li).flex, articleCls: a.className.slice(0, 200) };
});
console.log(JSON.stringify(info));
for (const w of [420, 480, 520, 560]) {
  const h = await page.evaluate((w) => {
    const items = [...document.querySelectorAll('#forschung article')].map((a) => a.closest('li') || a.parentElement);
    items.forEach((li) => { li.style.flex = `0 0 ${w}px`; li.style.width = `${w}px`; li.style.maxWidth = 'none'; });
    return [...document.querySelectorAll('#forschung article')].map((a) => Math.round(a.getBoundingClientRect().height));
  }, w);
  console.log('card width', w, '→ heights', h.join(','));
  if (w === 520) {
    const y = await page.evaluate(() => Math.round(document.querySelector('#forschung article').getBoundingClientRect().top + scrollY));
    await page.evaluate((t) => window.scrollTo({ top: t - 100, behavior: 'instant' }), y);
    await sleep(800);
    await page.screenshot({ path: `${out}/cards-520.png` });
  }
}
await browser.close();
