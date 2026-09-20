// Round 3: is the fixed order bar covered by the following FAQ sheet? (stacking context probe)
import { open, scrollTo, roundDir } from './review-lib.mjs';

const out = roundDir('round-3', 'states');
const { browser, page } = await open('/gutscheine', 'mobile');

for (const y of [5320, 5700, 6080, 6200]) {
  await scrollTo(page, y, 1200);
  const r = await page.evaluate(() => {
    const bar = [...document.querySelectorAll('div.fixed.inset-x-0.bottom-0')].find((b) => b.querySelector('button'));
    const btn = bar.querySelector('button');
    const b = btn.getBoundingClientRect();
    const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    const chain = [];
    let el = bar;
    while (el && el !== document.body) {
      const cs = getComputedStyle(el);
      chain.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${[...el.classList].slice(0, 4).join('.')} {pos:${cs.position} z:${cs.zIndex} tf:${cs.transform !== 'none'} iso:${cs.isolation} filter:${cs.filter !== 'none'} bf:${cs.backdropFilter !== 'none'} wc:${cs.willChange}}`);
      el = el.parentElement;
    }
    const faq = document.getElementById('faq') || [...document.querySelectorAll('section')].find((s) => s.textContent.includes('Häufige Fragen'));
    const fcs = faq ? getComputedStyle(faq) : null;
    return {
      scrollY: Math.round(scrollY),
      btnRect: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)],
      hit: hit ? `${hit.tagName.toLowerCase()}.${[...hit.classList].slice(0, 3).join('.')} text=${(hit.textContent || '').trim().slice(0, 30)}` : null,
      hitIsButton: hit === btn || btn.contains(hit),
      chain,
      faq: faq ? { id: faq.id, pos: fcs.position, z: fcs.zIndex, top: Math.round(faq.getBoundingClientRect().top) } : null,
    };
  });
  console.log(JSON.stringify(r, null, 1));
  await page.screenshot({ path: `${out}/m-bar-probe-y${y}.png` });
}
await browser.close();
