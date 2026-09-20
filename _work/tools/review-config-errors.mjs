import { open, roundDir, scrollTo, sleep } from './review-lib.mjs';
const out = roundDir(undefined, 'config');
const { browser, page } = await open('/gutscheine', 'desktop');
const submit = page.locator('#anfrage button[type=submit]').first();
await submit.scrollIntoViewIfNeeded();
await sleep(500);
await submit.click();
await sleep(1800);
const y = await page.evaluate(() => { const h = [...document.querySelectorAll('#anfrage h3')].find((x) => /Ihre Angaben/.test(x.textContent)); return Math.round(h.getBoundingClientRect().top + scrollY); });
await scrollTo(page, y - 120, 800);
await page.mouse.move(20, 20);
await sleep(600);
await page.screenshot({ path: `${out}/desktop-4b-errors-fields.png` });
const m = await page.evaluate(() => {
  const inp = document.querySelector('#anfrage input[name=company]');
  const cs = getComputedStyle(inp);
  const lbl = document.querySelector('label[for="' + inp.id + '"]') || inp.parentElement.querySelector('label');
  const err = document.getElementById('field-company-error');
  const ok = document.querySelector('#anfrage input[name=phone]');
  const csOk = getComputedStyle(ok);
  return { input: { h: inp.getBoundingClientRect().height, radius: cs.borderRadius, bg: cs.backgroundColor, border: cs.borderWidth + ' ' + cs.borderColor, pad: cs.padding, fs: cs.fontSize }, okInput: { bg: csOk.backgroundColor, border: csOk.borderWidth + ' ' + csOk.borderColor }, label: lbl ? { fs: getComputedStyle(lbl).fontSize, color: getComputedStyle(lbl).color, top: Math.round(lbl.getBoundingClientRect().top - inp.getBoundingClientRect().top) } : null, err: err ? { text: err.textContent, role: err.getAttribute('role'), live: err.getAttribute('aria-live'), color: getComputedStyle(err).color, fs: getComputedStyle(err).fontSize, mt: getComputedStyle(err).marginTop } : null, summaryAlert: !!document.querySelector('#anfrage [role=alert]') };
});
console.log(JSON.stringify(m));
// contrast of error text on pastel bg
const lum = (r, g, b) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const L1 = lum(...a), L2 = lum(...b); return Math.round(((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)) * 100) / 100; };
console.log('error text on paper', ratio([140, 47, 34], [250, 250, 247]), 'label on pastel', ratio([140, 47, 34], [247, 233, 229]), 'ink on pastel', ratio([11, 23, 38], [247, 233, 229]));
await browser.close();
