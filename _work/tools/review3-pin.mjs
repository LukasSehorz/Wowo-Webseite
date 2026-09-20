// Round 3: precise step boundaries of the pinned fitting process vs. the pin distance (desktop 1440x900).
import { open, scrollTo } from './review-lib.mjs';

const { browser, page } = await open('/', 'desktop');
const sec = await page.evaluate(() => {
  const el = document.getElementById('anpassung');
  const r = el.getBoundingClientRect();
  const stage = el.querySelector('[class*="sticky"], [style*="position: fixed"], .pin-spacer > *') || el.firstElementChild;
  return { top: Math.round(r.top + scrollY), height: el.offsetHeight, stageClass: stage?.className?.toString().slice(0, 120), html: el.outerHTML.slice(0, 600) };
});
console.log(sec);
await scrollTo(page, sec.top - 1500, 500);
await scrollTo(page, sec.top - 700, 500);
let last = null;
const bounds = [];
for (let y = sec.top - 200; y <= sec.top + sec.height + 100; y += 40) {
  await scrollTo(page, y, 90);
  const s = await page.evaluate(() => {
    const el = document.getElementById('anpassung');
    const r = el.getBoundingClientRect();
    const numeral = el.querySelector('[class*="display"]');
    const rail = [...el.querySelectorAll('button, [role="tab"], li')].filter((b) => /0[1-4]/.test(b.textContent || ''));
    const active = rail.find((b) => b.getAttribute('aria-current') || b.getAttribute('aria-selected') === 'true' || b.dataset.active === 'true');
    const stageEl = [...el.querySelectorAll('*')].find((e) => ['sticky', 'fixed'].includes(getComputedStyle(e).position));
    return {
      secTop: Math.round(r.top),
      pinned: stageEl ? getComputedStyle(stageEl).position + '@' + Math.round(stageEl.getBoundingClientRect().top) : 'none',
      step: (active?.textContent || numeral?.textContent || '').trim().slice(0, 2),
    };
  });
  if (s.step !== last) {
    bounds.push({ y, rel: y - sec.top, ...s });
    last = s.step;
  }
}
console.table(bounds);
console.log('pin distance = section height - viewport =', sec.height - 900);
await browser.close();
