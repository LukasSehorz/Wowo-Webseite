import { chromium } from 'playwright';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36' });
await context.route(/alia-prod\.com|alia-cloudflare\.com/, (r) => r.abort());
const page = await context.newPage();
await page.goto('https://move.one/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
const r = await page.evaluate(() => {
  const cb = document.querySelector('cookie-banner');
  const btns = [...cb.querySelectorAll('button, a')].map((b) => ({ tag: b.tagName, name: b.getAttribute('name'), cls: b.className, text: b.innerText.trim(), attrs: [...b.attributes].map((a) => a.name + '=' + a.value.slice(0, 60)).join(' | ') }));
  const inner = cb.querySelector('.drawer__inner');
  const r = inner.getBoundingClientRect();
  const panel = cb.querySelector('.cookie-banner');
  const pr = panel.getBoundingClientRect();
  return { btns, innerRect: [r.x, r.y, r.width, r.height], panelRect: [pr.x, pr.y, pr.width, pr.height], bodyOverflow: getComputedStyle(document.body).overflow, htmlOverflow: getComputedStyle(document.documentElement).overflow, aliaPresent: !!document.querySelector('[id^="alia-root"]') };
});
console.log(JSON.stringify(r, null, 1));
await page.screenshot({ path: '../reference/data/popups/cookie-only-desktop.png' });
await browser.close();
