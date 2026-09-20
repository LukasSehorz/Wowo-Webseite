// Keyboard tour: tab order, focus ring visibility, skip link, slider + radio + carousel keys.
import { writeFileSync } from 'node:fs';
import { open, roundDir, sleep } from './review-lib.mjs';

const out = roundDir(undefined, 'a11y');
const path = process.argv[2] || '/';
const { browser, page } = await open(path, 'desktop');
await page.mouse.move(700, 300);
const stops = [];
const shotAt = new Set([1, 2, 3, 6, 7, 8, 9]);
for (let i = 1; i <= (parseInt(process.argv[3] || '60', 10)); i++) {
  await page.keyboard.press('Tab');
  await sleep(350);
  const info = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      type: el.getAttribute('type'),
      role: el.getAttribute('role'),
      label: (el.getAttribute('aria-label') || el.textContent || el.value || '').replace(/\s+/g, ' ').trim().slice(0, 50),
      outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} off ${cs.outlineOffset}`,
      shadow: cs.boxShadow.slice(0, 60),
      x: Math.round(r.left),
      y: Math.round(r.top),
      w: Math.round(r.width),
      h: Math.round(r.height),
      inViewport: r.top >= 0 && r.bottom <= innerHeight,
      coveredByHeader: r.top < 81 && scrollY > 120,
      scrollY: Math.round(scrollY),
    };
  });
  stops.push(info);
  if (!info) continue;
  const key = `${info.tag}:${info.label}`;
  if (shotAt.has(i) || /Video|Handel|Übergang|Stiefel|Nächste|10\.47102|Schritt 1|Zum Hersteller|Impressum/.test(info.label)) {
    const clip = {
      x: Math.max(0, info.x - 40),
      y: Math.max(0, info.y - 40),
      width: Math.min(1440 - Math.max(0, info.x - 40), info.w + 80),
      height: Math.min(900 - Math.max(0, info.y - 40), info.h + 80),
    };
    if (clip.width > 0 && clip.height > 0 && info.y < 900 && info.y > -20)
      await page.screenshot({ path: `${out}/focus-${String(i).padStart(2, '0')}-${key.replace(/[^a-z0-9]+/gi, '_').slice(0, 40)}.png`, clip }).catch(() => {});
  }
}
writeFileSync(`${out}/tab-order${path.replace(/\W/g, '-')}.json`, JSON.stringify(stops, null, 1));
stops.forEach((s, i) => console.log(String(i + 1).padStart(2), s ? `${s.tag}${s.type ? '[' + s.type + ']' : ''} "${s.label}" outline:${s.outline} y:${s.y} scrollY:${s.scrollY}${s.coveredByHeader ? ' UNDER-HEADER' : ''}${s.inViewport ? '' : ' OFFSCREEN'}` : 'null'));

// slider keys in detail
if (path !== '/') { await browser.close(); process.exit(0); }
const slider = page.locator('#druckverteilung input[type=range]').first();
await slider.scrollIntoViewIfNeeded();
await sleep(3500);
await slider.focus();
const log = [];
const read = async (tag) => log.push({ tag, v: await slider.evaluate((s) => s.value), vt: await slider.evaluate((s) => s.getAttribute('aria-valuetext')) });
await read('start');
await page.keyboard.press('ArrowLeft');
await sleep(80);
await read('ArrowLeft +80ms');
await sleep(1500);
await read('ArrowLeft +1.6s');
await page.keyboard.press('ArrowLeft');
await sleep(1500);
await read('ArrowLeft#2 +1.5s');
await page.keyboard.press('Home');
await sleep(1500);
await read('Home');
await page.keyboard.press('ArrowRight');
await sleep(100);
await read('ArrowRight +100ms');
await sleep(2500);
await read('ArrowRight +2.6s');
console.log('slider log', JSON.stringify(log));
await browser.close();
