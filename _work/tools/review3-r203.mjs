// Round 3: verification of R2-03 (configurator grid between 1024 and 1279 px).
import { open, sleep } from './review-lib.mjs';
const cfg = { viewport: { width: 1024, height: 900 }, deviceScaleFactor: 1, isMobile: false };
const { browser, page } = await open('/gutscheine#anfrage', cfg);
await sleep(1000);
console.log(JSON.stringify(await page.evaluate(() => {
  const r = (el) => Math.round(el.getBoundingClientRect().width);
  return {
    form: r(document.querySelector('#anfrage form')),
    summary: r(document.querySelector('aside[aria-labelledby="summary-heading"]')),
    inputs: [...document.querySelectorAll('#anfrage input[type="text"], #anfrage input[type="email"]')].map(r),
    tierChips: [...document.querySelectorAll('#anfrage label')].filter((l) => /je Gutschein/.test(l.textContent)).map(r),
  };
})));
await browser.close();
