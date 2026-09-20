// Round 3: does the mobile order bar disappear while the summary card (without button) is on screen?
import { open, scrollTo, roundDir } from './review-lib.mjs';

const out = roundDir('round-3', 'states');
const { browser, page } = await open('/gutscheine', 'mobile');

const probe = async () => page.evaluate(() => {
  const bar = [...document.querySelectorAll('div.fixed.inset-x-0.bottom-0')].find((b) => b.querySelector('button'));
  const summary = document.querySelector('aside[aria-labelledby="summary-heading"]');
  const section = document.getElementById('anfrage');
  const r = (el) => { const b = el.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom) }; };
  return {
    scrollY: Math.round(scrollY),
    vh: innerHeight,
    bar: bar ? { transform: getComputedStyle(bar).transform, inert: bar.hasAttribute('inert'), ...r(bar) } : null,
    summary: summary ? r(summary) : null,
    section: section ? r(section) : null,
    summaryButtonVisible: summary ? getComputedStyle(summary.querySelector('button[type="submit"]')).display : null,
  };
});

const sec = await page.evaluate(() => { const el = document.getElementById('anfrage'); return { top: el.getBoundingClientRect().top + scrollY, height: el.offsetHeight }; });
console.log('section', sec);
const rows = [];
for (let y = Math.round(sec.top) - 600; y < sec.top + sec.height + 200; y += 150) {
  await scrollTo(page, y, 700);
  const p = await probe();
  const barShown = p.bar && p.bar.transform === 'none' || (p.bar && p.bar.transform.startsWith('matrix(1, 0, 0, 1, 0, 0'));
  rows.push({ y: p.scrollY, barTransform: p.bar?.transform, inert: p.bar?.inert, summaryTop: p.summary?.top, summaryBottom: p.summary?.bottom, sectionBottom: p.section?.bottom });
  const summaryFullyVisible = p.summary && p.summary.top >= 77 && p.summary.bottom <= p.vh;
  if (summaryFullyVisible && !barShown) {
    await page.screenshot({ path: `${out}/m-summary-no-button-y${p.scrollY}.png` });
    console.log('DEAD END at', p.scrollY, p);
  }
}
console.table(rows);
await browser.close();
