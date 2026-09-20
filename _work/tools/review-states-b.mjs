// Desktop states B: audience tiles hovered, pressure map both states, fitting steps, carousel, charts, voucher tilt, footer reveal.
import { open, roundDir, scrollTo, sleep } from './review-lib.mjs';

const out = roundDir(undefined, 'states');
const { browser, page } = await open('/', 'desktop');
const only = process.argv[2] || 'all';
const want = (k) => only === 'all' || only.split(',').includes(k);

const sectionTop = (sel) => page.evaluate((s) => Math.round(document.querySelector(s).getBoundingClientRect().top + scrollY), sel);

if (want('tiles')) {
  const y = await page.evaluate(() => {
    const h = [...document.querySelectorAll('h2')].find((x) => /Für lange Tage/.test(x.getAttribute('aria-label') || x.textContent));
    return Math.round(h.getBoundingClientRect().top + scrollY);
  });
  await scrollTo(page, y - 110, 1500);
  const cards = await page.evaluate(() =>
    [...document.querySelectorAll('[data-open]')].map((c) => {
      const r = c.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    }),
  );
  console.log('cards', JSON.stringify(cards));
  await page.screenshot({ path: `${out}/tiles-0-rest.png` });
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    await page.mouse.move(c.x + c.w / 2, c.y + c.h / 2, { steps: 5 });
    if (i === 0) {
      await sleep(200);
      await page.screenshot({ path: `${out}/tiles-1-handel-mid200.png`, clip: { x: c.x - 8, y: c.y - 8, width: c.w + 16, height: c.h + 16 } });
    }
    await sleep(900);
    await page.screenshot({ path: `${out}/tiles-2-open-${i + 1}.png`, clip: { x: c.x - 8, y: c.y - 8, width: c.w + 16, height: c.h + 16 } });
  }
  await page.mouse.move(5, 300);
  await sleep(800);
}

if (want('pressure')) {
  const top = await sectionTop('#druckverteilung');
  await scrollTo(page, top - 60, 3500); // let the intro animation finish
  await page.screenshot({ path: `${out}/pressure-1-with-insole.png`, fullPage: false });
  const radios = await page.evaluate(() =>
    [...document.querySelectorAll('#druckverteilung [role=radio], #druckverteilung input[type=radio]')].map((r) => ({
      tag: r.tagName,
      checked: r.getAttribute('aria-checked') ?? r.checked,
      label: r.getAttribute('aria-label') || r.textContent?.trim() || r.value,
    })),
  );
  console.log('radios', JSON.stringify(radios));
  await page.locator('#druckverteilung').getByText('Stiefel allein', { exact: true }).first().click();
  await sleep(2600);
  await page.screenshot({ path: `${out}/pressure-0-boot-only.png` });
  // slider to the middle via keyboard
  const slider = page.locator('#druckverteilung input[type=range]').first();
  const sl = await slider.evaluate((s) => ({ min: s.min, max: s.max, step: s.step, value: s.value, aria: s.getAttribute('aria-label'), valuetext: s.getAttribute('aria-valuetext') }));
  console.log('slider', JSON.stringify(sl));
  await slider.focus();
  for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight');
  await sleep(600);
  const sl2 = await slider.evaluate((s) => ({ value: s.value, valuetext: s.getAttribute('aria-valuetext') }));
  console.log('slider after 10x ArrowRight', JSON.stringify(sl2));
  await page.screenshot({ path: `${out}/pressure-2-slider-focus.png` });
  // canvas close-ups
  const cv = await page.locator('#druckverteilung canvas').first().boundingBox();
  console.log('canvas box', JSON.stringify(cv));
  await page.locator('#druckverteilung').getByText('Mit angeformter Einlage', { exact: true }).first().click();
  await sleep(2600);
  const fig = await page.evaluate(() => {
    const f = document.querySelector('#druckverteilung figure, #druckverteilung [role=img]');
    return f ? { tag: f.tagName, role: f.getAttribute('role'), label: f.getAttribute('aria-label')?.slice(0, 300), caption: f.querySelector('figcaption')?.textContent?.slice(0, 300) } : null;
  });
  console.log('figure a11y', JSON.stringify(fig));
}

if (want('fitting')) {
  const top = await sectionTop('#anpassung');
  const vh = 900;
  // pinned for 300vh: sample the middle of each quarter
  const points = [0.05, 0.3, 0.55, 0.8, 0.97];
  for (let i = 0; i < points.length; i++) {
    await scrollTo(page, top + Math.round(points[i] * 3 * vh), 1600);
    await page.screenshot({ path: `${out}/fitting-${i + 1}-p${Math.round(points[i] * 100)}.png` });
  }
  // transition frame between steps
  await scrollTo(page, top + Math.round(0.3 * 3 * vh), 800);
  await page.evaluate((t) => window.scrollTo({ top: t, behavior: 'instant' }), top + Math.round(0.52 * 3 * vh));
  await sleep(220);
  await page.screenshot({ path: `${out}/fitting-x-crossfade-220ms.png` });
}

if (want('studies')) {
  const top = await sectionTop('#forschung');
  await scrollTo(page, top + 120, 2500);
  await page.screenshot({ path: `${out}/studies-0-start.png` });
  const next = page.locator('button[aria-label="Nächste Studie"]').first();
  await next.click();
  await sleep(1200);
  await page.screenshot({ path: `${out}/studies-1-next1.png` });
  await next.click();
  await sleep(1200);
  await next.click().catch(() => {});
  await sleep(1400);
  await page.screenshot({ path: `${out}/studies-2-end.png` });
  const btnState = await page.evaluate(() =>
    [...document.querySelectorAll('button[aria-label*="Studie"]')].map((b) => ({ l: b.getAttribute('aria-label'), disabled: b.disabled, ariaDisabled: b.getAttribute('aria-disabled') })),
  );
  console.log('carousel buttons at end', JSON.stringify(btnState));
  // close-ups of every chart: scroll each card into view inside the scroller
  const n = await page.evaluate(() => document.querySelectorAll('#forschung article').length);
  console.log('study articles', n);
  for (let i = 0; i < n; i++) {
    await page.evaluate((idx) => {
      const a = document.querySelectorAll('#forschung article')[idx];
      a.scrollIntoView({ inline: 'start', block: 'nearest', behavior: 'instant' });
    }, i);
    await sleep(1500);
    const b = await page.evaluate((idx) => {
      const r = document.querySelectorAll('#forschung article')[idx].getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    }, i);
    const clip = { x: Math.max(0, b.x), y: Math.max(0, b.y), width: Math.min(b.w, 1440 - Math.max(0, b.x)), height: Math.min(b.h, 900 - Math.max(0, b.y)) };
    await page.screenshot({ path: `${out}/study-card-${i + 1}.png`, clip });
  }
}

if (want('voucher')) {
  const y = await page.evaluate(() => {
    const h = [...document.querySelectorAll('h2')].find((x) => /Gutscheine für Ihr Team/.test(x.getAttribute('aria-label') || x.textContent));
    return Math.round(h.getBoundingClientRect().top + scrollY);
  });
  await scrollTo(page, y - 200, 2000);
  await page.screenshot({ path: `${out}/voucher-0-rest.png` });
  const card = await page.evaluate(() => {
    const el = [...document.querySelectorAll('main *')].find((e) => e.children.length === 0 && e.textContent.trim() === 'GUTSCHEIN' || e.textContent.trim() === 'Gutschein' && e.children.length === 0);
    let c = el;
    for (let i = 0; i < 6 && c; i++) {
      const r = c.getBoundingClientRect();
      if (r.width > 380 && Math.abs(r.width / r.height - 1.586) < 0.06) break;
      c = c.parentElement;
    }
    const r = c.getBoundingClientRect();
    const cs = getComputedStyle(c);
    return { x: r.left, y: r.top, w: r.width, h: r.height, ratio: r.width / r.height, shadow: cs.boxShadow, radius: cs.borderRadius, filter: cs.filter, parentShadow: getComputedStyle(c.parentElement).boxShadow, parentFilter: getComputedStyle(c.parentElement).filter };
  });
  console.log('voucher card', JSON.stringify(card));
  await page.mouse.move(card.x + card.w * 0.85, card.y + card.h * 0.2, { steps: 8 });
  await sleep(700);
  await page.screenshot({ path: `${out}/voucher-1-tilt-topright.png`, clip: { x: 720, y: Math.max(0, card.y - 120), width: 720, height: card.h + 240 } });
  await page.mouse.move(card.x + card.w * 0.12, card.y + card.h * 0.85, { steps: 8 });
  await sleep(700);
  await page.screenshot({ path: `${out}/voucher-2-tilt-bottomleft.png`, clip: { x: 720, y: Math.max(0, card.y - 120), width: 720, height: card.h + 240 } });
  await page.mouse.move(5, 5);
  await sleep(900);
}

if (want('footer')) {
  const docH = await page.evaluate(() => document.documentElement.scrollHeight);
  for (const d of [700, 450, 250, 0]) {
    await scrollTo(page, docH - 900 - d, 900);
    await page.screenshot({ path: `${out}/footer-reveal-${String(d).padStart(3, '0')}.png` });
  }
}

await browser.close();
console.log('done B');
