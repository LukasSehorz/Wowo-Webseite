// Round 3: configurator at 1280 and 1366x768 (common laptop) — does form + sticky summary + submit fit?
import { open, roundDir, sleep } from './review-lib.mjs';
const out = roundDir('round-3', 'widths');
for (const [w, h] of [[1280, 800], [1366, 768]]) {
  const cfg = { viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: false };
  const { browser, page } = await open('/gutscheine#anfrage', cfg);
  await sleep(1200);
  const m = await page.evaluate(() => {
    const form = document.querySelector('#anfrage form');
    const aside = document.querySelector('aside[aria-labelledby="summary-heading"]');
    const btn = aside.querySelector('button[type="submit"]');
    const r = (el) => { const b = el.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), w: Math.round(b.width) }; };
    return { form: r(form), aside: r(aside), submit: r(btn), vh: innerHeight, inputs: [...document.querySelectorAll('#anfrage input[type="text"]')].map((i) => Math.round(i.getBoundingClientRect().width)) };
  });
  console.log(w + 'x' + h, JSON.stringify(m));
  await page.screenshot({ path: `${out}/vouchers-config-${w}.png` });
  await browser.close();
}
