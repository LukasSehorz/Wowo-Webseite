import { open, roundDir, scrollTo, sleep } from './review-lib.mjs';
const out = roundDir(undefined, 'config');
const { browser, page } = await open('/gutscheine', 'desktop');
async function strip(name, locator, pad = 16) {
  const el = locator.first();
  await el.scrollIntoViewIfNeeded();
  await sleep(500);
  const b = await el.boundingBox();
  const clip = { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: Math.min(1440 - Math.max(0, b.x - pad), b.width + pad * 2), height: b.height + pad * 2 };
  await page.mouse.move(5, 5);
  await sleep(300);
  await page.screenshot({ path: `${out}/h-${name}-0.png`, clip });
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 });
  await sleep(700);
  await page.screenshot({ path: `${out}/h-${name}-1.png`, clip });
  const cs = await el.evaluate((e) => { const c = getComputedStyle(e); return { bg: c.backgroundColor, border: c.borderColor, shadow: c.boxShadow.slice(0, 80), transform: c.transform }; });
  await page.mouse.move(5, 5);
  await sleep(700);
  return cs;
}
console.log('tier chip hover', JSON.stringify(await strip('tier', page.locator('#anfrage label', { hasText: '10 bis 24' }))));
// the format choice was removed with the printed cards, so there is no format option to hover
console.log('quick hover', JSON.stringify(await strip('quick', page.locator('#anfrage button', { hasText: /^50$/ }))));
console.log('stepper hover', JSON.stringify(await strip('stepper', page.locator('#anfrage button[aria-label="Anzahl erhöhen"]'))));
console.log('submit hover', JSON.stringify(await strip('submit', page.locator('#anfrage button[type=submit]').first(), 24)));
console.log('hero pill hover', JSON.stringify(await strip('heropill', page.locator('main a', { hasText: 'Anzahl wählen' }), 24)));
// input focus: floating label
const inp = page.locator('#anfrage input[name=company]');
await inp.scrollIntoViewIfNeeded();
await sleep(400);
const b = await inp.boundingBox();
const clip = { x: b.x - 16, y: b.y - 16, width: b.width + 32, height: b.height + 60 };
await page.screenshot({ path: `${out}/h-input-0.png`, clip });
await inp.focus();
await sleep(400);
await page.screenshot({ path: `${out}/h-input-1-focus.png`, clip });
await inp.type('Testfirma GmbH');
await sleep(300);
await page.screenshot({ path: `${out}/h-input-2-filled.png`, clip });
const st = await page.evaluate(() => { const i = document.querySelector('#anfrage input[name=company]'); const l = document.querySelector('label[for="' + i.id + '"]'); const c = getComputedStyle(i); const lc = l ? getComputedStyle(l) : null; return { outline: c.outlineStyle + ' ' + c.outlineWidth + ' ' + c.outlineColor, border: c.borderColor, bg: c.backgroundColor, label: lc ? { fs: lc.fontSize, transform: lc.transform, top: Math.round(l.getBoundingClientRect().top - i.getBoundingClientRect().top), color: lc.color } : null }; });
console.log('input focus', JSON.stringify(st));
// steps connector line drawn?
const line = await page.evaluate(() => { const s = document.querySelector('#ablauf'); const els = [...s.querySelectorAll('*')].filter((e) => { const r = e.getBoundingClientRect(); return r.height <= 2 && r.width > 100; }).map((e) => ({ w: Math.round(e.getBoundingClientRect().width), transform: getComputedStyle(e).transform, origin: getComputedStyle(e).transformOrigin, bg: getComputedStyle(e).backgroundColor })); return els; });
console.log('steps connector', JSON.stringify(line));
await browser.close();
