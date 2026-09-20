import { open, roundDir, sleep } from './review-lib.mjs';
const out = roundDir(undefined, 'a11y');
const { browser, page } = await open('/', 'desktop');
await page.mouse.move(700, 300);
// tab to the first tile (11 tabs), screenshot the tile focus ring
for (let i = 0; i < 11; i++) { await page.keyboard.press('Tab'); await sleep(120); }
await sleep(1500);
let a = await page.evaluate(() => { const el = document.activeElement; const card = el.closest('[data-open]'); const cs = getComputedStyle(card); const r = card.getBoundingClientRect(); return { label: el.textContent.trim(), cardOutline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, x: r.left, y: r.top, w: r.width, h: r.height }; });
console.log('tile focus', JSON.stringify(a));
await page.screenshot({ path: `${out}/focus-tile-card.png`, clip: { x: a.x - 12, y: Math.max(0, a.y - 12), width: a.w + 24, height: Math.min(a.h + 24, 900 - Math.max(0, a.y - 12)) } });
// tab on to the carousel scroller (stop 22): 11 more tabs
for (let i = 0; i < 11; i++) { await page.keyboard.press('Tab'); await sleep(150); }
await sleep(2500);
a = await page.evaluate(() => { const el = document.activeElement; const r = el.getBoundingClientRect(); return { tag: el.tagName, role: el.getAttribute('role'), label: el.getAttribute('aria-label'), top: Math.round(r.top), bottom: Math.round(r.bottom), scrollY: Math.round(scrollY), smt: getComputedStyle(el).scrollMarginTop }; });
console.log('scroller focus after 2.5 s', JSON.stringify(a));
await page.screenshot({ path: `${out}/focus-scroller.png` });
await browser.close();
