// What-if (no source edits): looser display tracking, DPR-2 close-ups + line widths at 1440 / 390 / 360.
import { open, primeReveals, roundDir, sleep, DEVICES } from './review-lib.mjs';
const out = roundDir(undefined, 'whatif');
const css = `
  .display { letter-spacing: -0.04em !important; word-spacing: 0.1em !important; }
  .display-h2-column { letter-spacing: -0.035em !important; }
  .display-stat, .display-figure, .display-numeral { letter-spacing: -0.03em !important; word-spacing: 0.04em !important; }
`;
for (const [name, cfg] of [['desktop', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, isMobile: false }], ['m390', DEVICES.mobile], ['m360', { ...DEVICES.mobile, viewport: { width: 360, height: 780 } }]]) {
  const { browser, page } = await open('/', cfg);
  await page.addStyleTag({ content: css });
  await primeReveals(page);
  await sleep(600);
  const m = await page.evaluate(() => {
    const width = (el) => { const r = document.createRange(); r.selectNodeContents(el); return Math.round(r.getBoundingClientRect().width); };
    const h1 = document.querySelector('h1');
    const h2 = document.querySelector('h2');
    const lh = (el) => parseFloat(getComputedStyle(el).lineHeight);
    return { vw: innerWidth, h1: { fs: getComputedStyle(h1).fontSize, textW: width(h1), lines: Math.round(h1.getBoundingClientRect().height / lh(h1)) }, h2: { fs: getComputedStyle(h2).fontSize, textW: width(h2), lines: Math.round(h2.getBoundingClientRect().height / lh(h2)), boxW: Math.round(h2.getBoundingClientRect().width) }, sw: document.documentElement.scrollWidth };
  });
  console.log(name, JSON.stringify(m));
  if (name === 'desktop') {
    for (const [n, fn] of [['h1', () => document.querySelector('h1')], ['intro-h2', () => document.querySelector('h2')], ['stat-171', () => [...document.querySelectorAll('main *')].find((e) => /^171/.test(e.textContent.trim()) && e.textContent.trim().length < 12)], ['fig-18statt26', () => [...document.querySelectorAll('#forschung *')].find((e) => /^18 statt 26$/.test(e.textContent.trim()))]]) {
      const h = await page.evaluateHandle(fn);
      const el = h.asElement();
      await el.scrollIntoViewIfNeeded();
      await sleep(1200);
      const b = await el.boundingBox();
      await page.screenshot({ path: `${out}/type-${n}.png`, clip: { x: Math.max(0, b.x - 14), y: b.y - 14, width: b.width + 28, height: b.height + 28 } });
    }
  }
  await browser.close();
}
