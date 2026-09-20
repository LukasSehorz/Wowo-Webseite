import { open, sleep } from './review-lib.mjs';
// A: fresh /gutscheine, click hero pill
let { browser, page } = await open('/gutscheine', 'desktop');
await page.locator('main a', { hasText: 'Anzahl wählen' }).first().click();
await sleep(3000);
console.log('A fresh page → pill:', JSON.stringify(await page.evaluate(() => ({ hash: location.hash, top: Math.round(document.querySelector('#anfrage').getBoundingClientRect().top) }))));
// B: same hash again after scrolling to top
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await sleep(800);
await page.locator('main a', { hasText: 'Anzahl wählen' }).first().click();
await sleep(3000);
console.log('B same hash again → pill:', JSON.stringify(await page.evaluate(() => ({ hash: location.hash, top: Math.round(document.querySelector('#anfrage').getBoundingClientRect().top) }))));
// C: header CTA while already on /gutscheine#anfrage and scrolled to top
await page.locator('header a', { hasText: 'Gutscheine anfragen' }).first().click();
await sleep(3000);
console.log('C header CTA same hash:', JSON.stringify(await page.evaluate(() => ({ hash: location.hash, top: Math.round(document.querySelector('#anfrage').getBoundingClientRect().top) }))));
// D: footer CTA from the same page
await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
await sleep(800);
await page.locator('footer a', { hasText: 'Zur Bestellanfrage' }).first().click();
await sleep(3000);
console.log('D footer CTA same hash:', JSON.stringify(await page.evaluate(() => ({ hash: location.hash, top: Math.round(document.querySelector('#anfrage').getBoundingClientRect().top) }))));
await browser.close();
