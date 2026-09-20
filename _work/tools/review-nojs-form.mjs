// No-JS: does the order form still submit through the server action (progressive enhancement)?
import { chromium } from 'playwright';
import { roundDir } from './review-lib.mjs';
const out = roundDir(undefined, 'a11y');
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false, locale: 'de-DE' });
const page = await ctx.newPage();
await page.goto('http://localhost:3100/gutscheine', { waitUntil: 'load' });
await page.waitForTimeout(800);
const info = await page.evaluate(() => {
  const f = document.querySelector('#anfrage form');
  return { action: f?.getAttribute('action')?.slice(0, 40), method: f?.method, hasQty: !!document.querySelector('#anfrage input[type=number], #anfrage input[inputmode=numeric]'), qtyVisible: (() => { const q = document.querySelector('#anfrage input[type=number], #anfrage input[inputmode=numeric]'); return q ? q.getBoundingClientRect().height : 0; })(), summaryTotal: [...document.querySelectorAll('#anfrage *')].find((e) => e.children.length === 0 && /€/.test(e.textContent) && /\d\.\d{3},\d{2}/.test(e.textContent))?.textContent, submitVisible: [...document.querySelectorAll('#anfrage button[type=submit]')].map((b) => b.getBoundingClientRect().height), fixedBar: [...document.querySelectorAll('body *')].filter((e) => getComputedStyle(e).position === 'fixed').length };
});
console.log('nojs form', JSON.stringify(info));
await page.evaluate(() => document.querySelector('#anfrage').scrollIntoView());
await page.screenshot({ path: `${out}/nojs-vouchers-config.png` });
// try a submit without JS
await page.fill('#anfrage input[name=company]', 'Testfirma');
await page.fill('#anfrage input[name=contact]', 'Test Person');
await page.fill('#anfrage input[type=email]', 'test@example.com');
await page.check('#anfrage input[type=checkbox]', { force: true });
await Promise.all([page.waitForNavigation({ timeout: 15000 }).catch(() => null), page.click('#anfrage button[type=submit]:visible')]);
await page.waitForTimeout(1500);
const after = await page.evaluate(() => ({ url: location.href, success: !!document.body.textContent.match(/Anfrage ist eingegangen/), formThere: !!document.querySelector('#anfrage input[name=company]'), errors: [...document.querySelectorAll('#anfrage *')].filter((e) => e.children.length === 0 && /^Bitte /.test(e.textContent.trim())).length }));
console.log('nojs after submit', JSON.stringify(after));
await page.screenshot({ path: `${out}/nojs-vouchers-after-submit.png` });
await browser.close();
