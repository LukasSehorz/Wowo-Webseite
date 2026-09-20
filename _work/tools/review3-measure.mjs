// Round 3: cross-page consistency (type, radii, gutters, paddings) at 1440 and 390 + round-2 fix verification numbers.
import { writeFileSync } from 'node:fs';
import { open, primeReveals, roundDir } from './review-lib.mjs';

const out = roundDir('round-3', 'data');
const result = {};
const fmt = (el) => {
  if (!el) return null;
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return { fs: +parseFloat(cs.fontSize).toFixed(1), lh: +parseFloat(cs.lineHeight).toFixed(1), fw: cs.fontWeight, ls: cs.letterSpacing, tt: cs.textTransform, w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), color: cs.color };
};
for (const path of ['/', '/ueber-uns', '/gutscheine']) {
  for (const device of ['desktop', 'mobile']) {
    const { browser, page } = await open(path, device);
    await primeReveals(page, 700, 100);
    const data = await page.evaluate((fmtSrc) => {
      const fmt = eval(fmtSrc);
      const q = (s) => document.querySelector(s);
      const sheets = [...document.querySelectorAll('main > section, main > div')].map((s) => {
        const cs = getComputedStyle(s);
        return { id: s.id || s.className.toString().slice(0, 30), pt: cs.paddingTop, pb: cs.paddingBottom, radius: cs.borderTopLeftRadius + '/' + cs.borderBottomLeftRadius, bg: cs.backgroundColor };
      });
      const container = q('main .shell, main .container, main > section > div');
      const h1 = q('h1');
      const h2s = [...document.querySelectorAll('main h2')].map((h) => ({ text: (h.getAttribute('aria-label') || h.textContent).trim().slice(0, 30), ...fmt(h) }));
      const eyebrows = [...document.querySelectorAll('main .eyebrow, main [class*="eyebrow"]')].slice(0, 3).map(fmt);
      const leads = [...document.querySelectorAll('main p')].filter((p) => parseFloat(getComputedStyle(p).fontSize) >= 19).slice(0, 3).map((p) => ({ text: p.textContent.slice(0, 25), ...fmt(p) }));
      const bodies = [...document.querySelectorAll('main p')].filter((p) => parseFloat(getComputedStyle(p).fontSize) === 16).slice(0, 1).map(fmt);
      const pills = [...document.querySelectorAll('a.rounded-full, button.rounded-full, a[class*="pill"], main a[class*="rounded-full"]')].slice(0, 3).map((a) => ({ text: a.textContent.trim().slice(0, 20), ...fmt(a), radius: getComputedStyle(a).borderRadius }));
      const cards = [...document.querySelectorAll('main [class*="rounded-card"], main [class*="rounded-\\["]')].slice(0, 6).map((c) => ({ cls: c.className.toString().match(/rounded[^\s]*/g)?.join(' ').slice(0, 60), radius: getComputedStyle(c).borderTopLeftRadius, w: Math.round(c.getBoundingClientRect().width) }));
      const header = q('header');
      const hcs = header ? getComputedStyle(header) : null;
      const gutter = container ? Math.round(container.getBoundingClientRect().left) : null;
      const contW = container ? Math.round(container.getBoundingClientRect().width) : null;
      const voucherCard = q('[class*="aspect-\\[1.586"], [style*="1.586"], [class*="voucher"] [class*="aspect"]');
      const specRows = [...document.querySelectorAll('main dl div, main ul li')].filter((r) => r.querySelector('svg') && Math.abs(r.getBoundingClientRect().height - 56) < 20).slice(0, 2).map((r) => Math.round(r.getBoundingClientRect().height));
      const form = q('#anfrage form');
      const summary = q('aside[aria-labelledby="summary-heading"]');
      return {
        h1: h1 ? { text: (h1.getAttribute('aria-label') || h1.textContent).trim().slice(0, 40), ...fmt(h1) } : null,
        h2s, eyebrows, leads, bodies, pills, cards: cards.slice(0, 6), sheets: sheets.slice(0, 14),
        gutter, contW, headerH: header ? Math.round(header.getBoundingClientRect().height) : null,
        voucherCard: voucherCard ? { w: Math.round(voucherCard.getBoundingClientRect().width), parentW: Math.round(voucherCard.parentElement.getBoundingClientRect().width) } : null,
        specRows,
        form: form ? Math.round(form.getBoundingClientRect().width) : null,
        summary: summary ? { w: Math.round(summary.getBoundingClientRect().width), pos: getComputedStyle(summary).position, top: getComputedStyle(summary).top } : null,
        docH: document.documentElement.scrollHeight,
      };
    }, fmt.toString());
    result[`${path}@${device}`] = data;
    await browser.close();
  }
}
writeFileSync(`${out}/measure.json`, JSON.stringify(result, null, 2));
for (const [k, v] of Object.entries(result)) {
  console.log(`\n== ${k}  header ${v.headerH}  gutter ${v.gutter}  container ${v.contW}  docH ${v.docH}`);
  console.log('H1', JSON.stringify(v.h1));
  v.h2s.slice(0, 12).forEach((h) => console.log('  H2', h.text.padEnd(30), h.fs, h.lh, h.fw, h.ls, h.tt, 'w' + h.w));
  console.log('  eyebrow', JSON.stringify(v.eyebrows[0]));
  v.leads.forEach((l) => console.log('  lead', JSON.stringify(l)));
  console.log('  body', JSON.stringify(v.bodies[0]));
  v.pills.forEach((p) => console.log('  pill', JSON.stringify(p)));
  console.log('  cards', JSON.stringify(v.cards));
  console.log('  sheets', v.sheets.map((s) => `${s.id}:${s.pt}/${s.pb} r${s.radius}`).join(' | '));
  if (v.voucherCard) console.log('  voucherCard', JSON.stringify(v.voucherCard));
  if (v.specRows.length) console.log('  specRows', v.specRows);
  if (v.form) console.log('  form', v.form, 'summary', JSON.stringify(v.summary));
}
