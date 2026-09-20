// Desktop states A: header states, hover strips for pill / link / nav / audience tile / outline pill.
import { open, roundDir, scrollTo, sleep } from './review-lib.mjs';

const out = roundDir(undefined, 'states');
const { browser, page } = await open('/', 'desktop');

// --- header: top, mid-transition, scrolled
await page.screenshot({ path: `${out}/header-0-top.png`, clip: { x: 0, y: 0, width: 1440, height: 130 } });
await page.evaluate(() => window.scrollTo({ top: 140, behavior: 'instant' }));
await sleep(160);
await page.screenshot({ path: `${out}/header-1-mid-160ms.png`, clip: { x: 0, y: 0, width: 1440, height: 130 } });
await sleep(900);
await page.screenshot({ path: `${out}/header-2-scrolled.png`, clip: { x: 0, y: 0, width: 1440, height: 130 } });
const headerState = await page.evaluate(() => {
  const h = document.querySelector('header');
  const cs = getComputedStyle(h);
  const inner = h.firstElementChild;
  return {
    pos: cs.position,
    h: h.getBoundingClientRect().height,
    innerPad: getComputedStyle(inner).paddingTop,
    transition: getComputedStyle(inner).transition.slice(0, 200),
    borderBottom: cs.borderBottom,
  };
});
console.log('header scrolled', JSON.stringify(headerState));
await scrollTo(page, 0, 900);

// helper: hover strip
async function strip(name, locator, pad = 24, times = [0, 120, 300, 700]) {
  const el = locator.first();
  await el.scrollIntoViewIfNeeded();
  await sleep(500);
  const b = await el.boundingBox();
  if (!b) return console.log('no box for', name);
  const clip = {
    x: Math.max(0, b.x - pad),
    y: Math.max(0, b.y - pad),
    width: Math.min(1440 - Math.max(0, b.x - pad), b.width + pad * 2),
    height: b.height + pad * 2,
  };
  await page.mouse.move(5, 5);
  await sleep(300);
  await page.screenshot({ path: `${out}/${name}-0-before.png`, clip });
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 });
  let last = 0;
  for (const t of times.slice(1)) {
    await sleep(t - last);
    last = t;
    await page.screenshot({ path: `${out}/${name}-t${t}.png`, clip });
  }
  await page.mouse.move(5, 5);
  await sleep(250);
  await page.screenshot({ path: `${out}/${name}-leave-250.png`, clip });
  await sleep(700);
}

await strip('hover-hero-pill', page.locator('main a', { hasText: 'Gutscheine für Ihr Team' }));
await strip('hover-hero-link', page.locator('main a', { hasText: 'Was die Forschung zeigt' }));
await strip('hover-nav-ueber', page.locator('header nav a', { hasText: 'Über uns' }), 30);
await strip('hover-header-cta', page.locator('header a', { hasText: 'Gutscheine anfragen' }));
await strip('hover-intro-arrowlink', page.locator('main a', { hasText: 'So läuft die Anpassung ab' }));
await strip('hover-tile-handel', page.locator('main button', { hasText: 'Handel und Verkauf' }), 8, [0, 150, 350, 900]);
await strip('hover-tech-outline', page.locator('main a', { hasText: 'Zum Hersteller' }));
await strip('hover-voucher-pill', page.locator('main a', { hasText: 'Gutscheine anfragen' }));
await strip('hover-footer-link', page.locator('footer a', { hasText: 'Über uns' }), 16);
await strip('hover-footer-pill', page.locator('footer a', { hasText: 'Zur Bestellanfrage' }));
await strip('hover-doi', page.locator('main a', { hasText: '10.47102' }), 16);

// audience tile: click → open panel
const tile = page.locator('main button', { hasText: 'Pflege und Medizin' }).first();
await tile.scrollIntoViewIfNeeded();
await sleep(400);
await tile.click();
await sleep(900);
const tb = await tile.boundingBox();
await page.screenshot({ path: `${out}/tile-pflege-open.png`, clip: { x: tb.x - 8, y: tb.y - 8, width: tb.width + 16, height: tb.height + 16 } });
const aria = await tile.evaluate((b) => ({ expanded: b.getAttribute('aria-expanded'), pressed: b.getAttribute('aria-pressed'), controls: b.getAttribute('aria-controls') }));
console.log('tile aria', JSON.stringify(aria));
// whole row with one open
const rowBox = await page.evaluate(() => {
  const b = [...document.querySelectorAll('main button')].find((x) => /Handel/.test(x.textContent));
  const r = b.parentElement.closest('ul,div').getBoundingClientRect();
  return { y: r.top + scrollY, h: r.height };
});
await page.mouse.move(5, 5);
await sleep(600);
await page.screenshot({ path: `${out}/tile-row-one-open.png` });
console.log('rowBox', JSON.stringify(rowBox));
await browser.close();
console.log('done A');
