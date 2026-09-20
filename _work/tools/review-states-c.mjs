// Mobile states: menu open (frames), tile tap, snap rows swiped, pressure map settled, studies swiped, touch targets.
import { open, roundDir, scrollTo, sleep } from './review-lib.mjs';

const out = roundDir(undefined, 'states');
const only = process.argv[2] || 'all';
const want = (k) => only === 'all' || only.split(',').includes(k);
const { browser, page } = await open('/', 'mobile');

if (want('menu')) {
  const burger = page.locator('header button').first();
  const info = await burger.evaluate((b) => ({ label: b.getAttribute('aria-label'), expanded: b.getAttribute('aria-expanded'), controls: b.getAttribute('aria-controls'), box: b.getBoundingClientRect().toJSON() }));
  console.log('burger', JSON.stringify(info));
  await burger.tap();
  for (const t of [120, 300, 600, 1200]) {
    await sleep(t === 120 ? 120 : t === 300 ? 180 : t === 600 ? 300 : 600);
    await page.screenshot({ path: `${out}/m-menu-t${String(t).padStart(4, '0')}.png` });
  }
  const dlg = await page.evaluate(() => {
    const d = document.querySelector('[role=dialog], dialog');
    if (!d) return null;
    const r = d.getBoundingClientRect();
    const cs = getComputedStyle(d);
    const items = [...d.querySelectorAll('a')].map((a) => {
      const cs2 = getComputedStyle(a);
      const rr = a.getBoundingClientRect();
      return { t: a.textContent.trim(), fs: cs2.fontSize, fw: cs2.fontWeight, ls: cs2.letterSpacing, h: Math.round(rr.height), y: Math.round(rr.top) };
    });
    return { role: d.getAttribute('role'), modal: d.getAttribute('aria-modal'), label: d.getAttribute('aria-label') || d.getAttribute('aria-labelledby'), top: r.top, h: r.height, radius: cs.borderTopLeftRadius, bg: cs.backgroundColor, items, focusInside: d.contains(document.activeElement), active: document.activeElement?.tagName + ':' + (document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent?.trim().slice(0, 30)) };
  });
  console.log('dialog', JSON.stringify(dlg));
  const scrollLocked = await page.evaluate(() => ({ bodyOverflow: getComputedStyle(document.body).overflow, htmlOverflow: getComputedStyle(document.documentElement).overflow }));
  console.log('scroll lock', JSON.stringify(scrollLocked));
  await page.keyboard.press('Escape');
  await sleep(900);
  await page.screenshot({ path: `${out}/m-menu-closed-after-esc.png` });
}

if (want('tiles')) {
  const y = await page.evaluate(() => {
    const h = [...document.querySelectorAll('h2')].find((x) => /Für lange Tage/.test(x.getAttribute('aria-label') || x.textContent));
    return Math.round(h.getBoundingClientRect().top + scrollY);
  });
  await scrollTo(page, y - 100, 1500);
  const first = page.locator('[data-open]').first();
  await first.tap();
  await sleep(900);
  await page.screenshot({ path: `${out}/m-tile-open.png` });
  // swipe the row by one card via scrollBy and measure snapping
  const snap = await page.evaluate(async () => {
    const row = document.querySelector('[data-open]').parentElement.closest('[class*="snap"], ul, div');
    let sc = document.querySelector('[data-open]').parentElement;
    while (sc && getComputedStyle(sc).overflowX !== 'auto' && getComputedStyle(sc).overflowX !== 'scroll') sc = sc.parentElement;
    if (!sc) return null;
    sc.scrollBy({ left: 200, behavior: 'smooth' });
    await new Promise((r) => setTimeout(r, 1200));
    const cards = [...sc.children].map((c) => Math.round(c.getBoundingClientRect().left));
    return { scrollLeft: sc.scrollLeft, cards, cardW: Math.round(sc.children[0].getBoundingClientRect().width), gap: getComputedStyle(sc).gap, snapType: getComputedStyle(sc).scrollSnapType };
  });
  console.log('tile row snap', JSON.stringify(snap));
  await sleep(300);
  await page.screenshot({ path: `${out}/m-tile-row-swiped.png` });
}

if (want('pressure')) {
  const top = await page.evaluate(() => Math.round(document.querySelector('#druckverteilung').getBoundingClientRect().top + scrollY));
  await scrollTo(page, top + 480, 4200);
  await page.screenshot({ path: `${out}/m-pressure-settled.png` });
  await scrollTo(page, top + 900, 1200);
  await page.screenshot({ path: `${out}/m-pressure-controls.png` });
  const seg = await page.evaluate(() => {
    const labels = [...document.querySelectorAll('#druckverteilung label')].map((l) => {
      const r = l.getBoundingClientRect();
      return { t: l.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height), fs: getComputedStyle(l).fontSize };
    });
    const range = document.querySelector('#druckverteilung input[type=range]');
    const rr = range.getBoundingClientRect();
    return { labels, range: { w: Math.round(rr.width), h: Math.round(rr.height) } };
  });
  console.log('segmented', JSON.stringify(seg));
}

if (want('fitting')) {
  const top = await page.evaluate(() => Math.round(document.querySelector('#anpassung').getBoundingClientRect().top + scrollY));
  await scrollTo(page, top - 80, 1500);
  await page.screenshot({ path: `${out}/m-fitting-0.png` });
  await page.evaluate(async () => {
    const sc = document.querySelector('#anpassung ol');
    sc.scrollBy({ left: 330, behavior: 'smooth' });
    await new Promise((r) => setTimeout(r, 1200));
  });
  await page.screenshot({ path: `${out}/m-fitting-1-swiped.png` });
}

if (want('studies')) {
  const top = await page.evaluate(() => Math.round(document.querySelector('#forschung').getBoundingClientRect().top + scrollY));
  await scrollTo(page, top + 300, 2000);
  const info = await page.evaluate(() => {
    const a = [...document.querySelectorAll('#forschung article')];
    return a.map((x) => {
      const r = x.getBoundingClientRect();
      return { x: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) };
    });
  });
  console.log('study cards mobile', JSON.stringify(info));
  for (let i = 0; i < 5; i++) {
    await page.evaluate((idx) => document.querySelectorAll('#forschung article')[idx].scrollIntoView({ inline: 'start', block: 'nearest', behavior: 'instant' }), i);
    await sleep(1400);
    const b = await page.evaluate((idx) => {
      const r = document.querySelectorAll('#forschung article')[idx].getBoundingClientRect();
      return { y: r.top + scrollY };
    }, i);
    await scrollTo(page, b.y - 90, 700);
    await page.screenshot({ path: `${out}/m-study-${i + 1}.png` });
  }
}

if (want('targets')) {
  await scrollTo(page, 0, 500);
  const small = await page.evaluate(() => {
    const res = [];
    for (const el of document.querySelectorAll('a, button, input, [role=button], [role=radio], label')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      if (r.width < 44 || r.height < 44) {
        res.push({ tag: el.tagName, t: (el.getAttribute('aria-label') || el.textContent || el.type || '').trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height) });
      }
    }
    return res;
  });
  console.log('targets < 44px:', small.length);
  small.forEach((s) => console.log('  ', JSON.stringify(s)));
}

await browser.close();
console.log('done C');
