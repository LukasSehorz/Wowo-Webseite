import { open, sleep } from './review-lib.mjs';
const { browser, page } = await open('/', 'desktop');
const r = await page.evaluate(async () => {
  await document.fonts.ready;
  const stat = [...document.querySelectorAll('main *')].find((e) => /^46/.test(e.textContent.trim()) && e.textContent.trim().length < 8);
  const leaf = [...stat.querySelectorAll('*'), stat].find((e) => e.children.length === 0 && /\d/.test(e.textContent)) || stat;
  const cs = getComputedStyle(leaf);
  const fam = cs.fontFamily;
  const measure = (txt, fvn) => { const s = document.createElement('span'); s.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font-family:${fam};font-weight:900;font-size:72px;letter-spacing:0;font-variant-numeric:${fvn}`; s.textContent = txt; document.body.appendChild(s); const w = s.getBoundingClientRect().width; s.remove(); return Math.round(w * 10) / 10; };
  return { leafTag: leaf.tagName, leafCls: leaf.className, fvn: cs.fontVariantNumeric, ls: cs.letterSpacing, kern: cs.fontKerning, w111: measure('111', 'normal'), w000: measure('000', 'normal'), w111t: measure('111', 'tabular-nums'), w000t: measure('000', 'tabular-nums') };
});
console.log(JSON.stringify(r));
await browser.close();
