// Targeted checks: hero video + pause, display-type collisions, contrast, segmented mid-state, heading a11y, reveal timing.
import { open, roundDir, scrollTo, sleep } from './review-lib.mjs';

const out = roundDir(undefined, 'states');
const only = process.argv[2] || 'all';
const want = (k) => only === 'all' || only.split(',').includes(k);
const { browser, page } = await open('/', 'desktop');

if (want('video')) {
  const v1 = await page.evaluate(() => {
    const v = document.querySelector('video');
    return { paused: v.paused, t: v.currentTime, ready: v.readyState, src: v.currentSrc.slice(-30), opacity: getComputedStyle(v).opacity };
  });
  await sleep(1000);
  const v2 = await page.evaluate(() => ({ t: document.querySelector('video').currentTime }));
  const btn = page.locator('button[aria-label*="Video"]').first();
  await btn.click();
  await sleep(500);
  const v3 = await page.evaluate(() => ({ paused: document.querySelector('video').paused, label: document.querySelector('button[aria-label*="Video"]').getAttribute('aria-label'), pressed: document.querySelector('button[aria-label*="Video"]').getAttribute('aria-pressed') }));
  await page.screenshot({ path: `${out}/hero-paused.png`, clip: { x: 1300, y: 620, width: 140, height: 100 } });
  await btn.click();
  await sleep(400);
  // does the video pause when out of view?
  await scrollTo(page, 2500, 800);
  const v4 = await page.evaluate(() => ({ pausedOffscreen: document.querySelector('video').paused }));
  await scrollTo(page, 0, 800);
  const v5 = await page.evaluate(() => ({ pausedBackInView: document.querySelector('video').paused }));
  console.log('video', JSON.stringify({ v1, v2, v3, v4, v5 }));
}

if (want('collide')) {
  // Render display strings to a canvas with the page font and count glyph pairs that touch.
  const res = await page.evaluate(async () => {
    await document.fonts.ready;
    const fam = getComputedStyle(document.querySelector('h1')).fontFamily;
    const test = (text, size, weight, tracking, upper = true) => {
      const str = upper ? text.toUpperCase() : text;
      const c = document.createElement('canvas');
      c.width = 2600;
      c.height = Math.ceil(size * 1.6);
      const ctx = c.getContext('2d');
      ctx.font = `${weight} ${size}px ${fam}`;
      ctx.letterSpacing = `${tracking * size}px`;
      ctx.fillStyle = '#000';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(str, 10, size * 1.2);
      const w = Math.ceil(ctx.measureText(str).width) + 20;
      const d = ctx.getImageData(0, 0, w, c.height).data;
      // column occupancy
      const col = new Array(w).fill(0);
      for (let x = 0; x < w; x++) for (let y = 0; y < c.height; y++) if (d[(y * w + x) * 4 + 3] > 100) { col[x] = 1; break; }
      let runs = 0;
      for (let x = 1; x < w; x++) if (col[x] && !col[x - 1]) runs++;
      const glyphs = str.replace(/\s/g, '').length;
      return { text: str, size, weight, tracking, inkRuns: runs, glyphs, fusedPairsAtLeast: Math.max(0, glyphs - runs) };
    };
    const out = [];
    for (const tr of [-0.055, -0.045, -0.04, -0.035, -0.03, -0.02]) {
      out.push(test('Einlagen, die am', 88, 900, tr));
      out.push(test('Fuß entstehen', 88, 900, tr));
    }
    for (const tr of [-0.055, -0.04, -0.03, -0.02]) out.push(test('Gutschein', 50, 900, tr));
    for (const tr of [-0.055, -0.04, -0.03, -0.02]) out.push(test('171 Mio.', 72, 900, tr, false));
    for (const tr of [-0.055, -0.04, -0.03]) out.push(test('18 statt 26', 49, 900, tr, false));
    for (const tr of [-0.055, -0.04, -0.03]) out.push(test('Vorgeformt.', 62, 900, tr));
    return out;
  });
  res.forEach((r) => console.log(`${String(r.tracking).padEnd(7)} ${String(r.size).padEnd(3)} "${r.text}" glyphs ${r.glyphs} inkRuns ${r.inkRuns} → fused ≥ ${r.fusedPairsAtLeast}`));
}

if (want('contrast')) {
  const res = await page.evaluate(() => {
    const lum = (r, g, b) => {
      const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const parse = (s) => { const m = s.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m[3] ?? 1 }; };
    const bgOf = (el) => {
      let p = el;
      while (p) {
        const cs = getComputedStyle(p);
        const c = parse(cs.backgroundColor);
        if (c.a > 0.9) return c;
        const before = getComputedStyle(p, '::before').backgroundColor;
        const cb = parse(before);
        if (cb.a > 0.9 && p.tagName === 'SECTION') return cb;
        p = p.parentElement;
      }
      return { r: 250, g: 250, b: 247, a: 1 };
    };
    const items = [];
    const seen = new Set();
    for (const el of document.querySelectorAll('main p, main span, main a, main dt, main dd, main label, main h3, main li, footer p, footer a, footer span, footer h2')) {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 2)) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;
      const fg = parse(cs.color);
      const bg = bgOf(el);
      // blend alpha
      const r = fg.r * fg.a + bg.r * (1 - fg.a), g = fg.g * fg.a + bg.g * (1 - fg.a), b = fg.b * fg.a + bg.b * (1 - fg.a);
      let op = 1; let p = el; while (p && p !== document.body) { op *= parseFloat(getComputedStyle(p).opacity); p = p.parentElement; }
      const rr = r * op + bg.r * (1 - op), gg = g * op + bg.g * (1 - op), bb = b * op + bg.b * (1 - op);
      const L1 = lum(rr, gg, bb), L2 = lum(bg.r, bg.g, bg.b);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const fs = parseFloat(cs.fontSize);
      const key = `${cs.color}|${bg.r},${bg.g},${bg.b}|${fs}|${op}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const large = fs >= 24 || (fs >= 18.66 && parseInt(cs.fontWeight) >= 700);
      if (ratio < (large ? 3 : 4.5)) items.push({ text: el.textContent.trim().slice(0, 45), fs, color: cs.color, op: Math.round(op * 100) / 100, bg: `${bg.r},${bg.g},${bg.b}`, ratio: Math.round(ratio * 100) / 100 });
    }
    return items;
  });
  console.log('contrast failures (solid backgrounds only, text on photos excluded from trust):');
  res.forEach((r) => console.log('  ', JSON.stringify(r)));
}

if (want('segment')) {
  const top = await page.evaluate(() => Math.round(document.querySelector('#druckverteilung').getBoundingClientRect().top + scrollY));
  await scrollTo(page, top + 40, 3800);
  const slider = page.locator('#druckverteilung input[type=range]').first();
  await slider.focus();
  await page.keyboard.press('Home');
  await sleep(400);
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
  await sleep(900);
  const box = await page.evaluate(() => {
    const l = [...document.querySelectorAll('#druckverteilung label')][0].parentElement.getBoundingClientRect();
    return { x: l.left - 30, y: l.top - 20, w: l.width + 60, h: l.height + 130 };
  });
  await page.screenshot({ path: `${out}/pressure-segment-mid-50.png`, clip: { x: box.x, y: box.y, width: box.w, height: box.h } });
  await page.screenshot({ path: `${out}/pressure-mid-50-full.png` });
}

if (want('headings')) {
  const res = await page.evaluate(() =>
    [...document.querySelectorAll('h1, h2')].slice(0, 9).map((h) => ({
      tag: h.tagName,
      label: h.getAttribute('aria-label'),
      text: h.textContent.replace(/\s+/g, ' ').trim().slice(0, 60),
      innerHidden: [...h.children].every((c) => c.getAttribute('aria-hidden') === 'true'),
      childCount: h.children.length,
      html: h.innerHTML.slice(0, 260),
    })),
  );
  res.forEach((r) => console.log(JSON.stringify(r)));
}

if (want('reveal')) {
  // sample the first word + last word of the technology H2 while it reveals
  await scrollTo(page, 0, 300);
  const y = await page.evaluate(() => {
    const h = [...document.querySelectorAll('h2')].find((x) => /Was eine funktionelle/.test(x.getAttribute('aria-label') || x.textContent));
    return Math.round(h.getBoundingClientRect().top + scrollY);
  });
  // fresh page so that the reveal has not fired yet
  const p2 = await page.context().newPage();
  await p2.goto('http://localhost:3100/', { waitUntil: 'networkidle' });
  await sleep(800);
  const samples = await p2.evaluate(async (targetY) => {
    const h = [...document.querySelectorAll('h2')].find((x) => /Was eine funktionelle/.test(x.getAttribute('aria-label') || x.textContent));
    const leafs = [...h.querySelectorAll('*')].filter((e) => e.children.length === 0 && e.textContent.trim());
    const first = leafs[0], last = leafs[leafs.length - 1];
    const read = (el) => {
      let op = 1, ty = 0, p = el;
      while (p && p !== h.parentElement) { const cs = getComputedStyle(p); op *= parseFloat(cs.opacity); const m = cs.transform.match(/matrix\(([^)]+)\)/); if (m) ty += parseFloat(m[1].split(',')[5]); p = p.parentElement; }
      return { op: Math.round(op * 100) / 100, ty: Math.round(ty * 10) / 10 };
    };
    const before = { first: read(first), last: read(last), words: leafs.length };
    window.scrollTo({ top: targetY - 500, behavior: 'instant' });
    const t0 = performance.now();
    const log = [];
    await new Promise((resolve) => {
      const tick = () => {
        const t = Math.round(performance.now() - t0);
        log.push({ t, first: read(first), last: read(last) });
        if (t < 1800) requestAnimationFrame(tick); else resolve();
      };
      requestAnimationFrame(tick);
    });
    const pick = (ms) => log.reduce((a, b) => (Math.abs(b.t - ms) < Math.abs(a.t - ms) ? b : a));
    const doneAt = (key) => (log.find((l) => l[key].op >= 0.99 && Math.abs(l[key].ty) < 0.5) || {}).t;
    return { before, at: [0, 100, 200, 300, 500, 800, 1000, 1200, 1500].map(pick), firstDone: doneAt('first'), lastDone: doneAt('last') };
  }, y);
  console.log('reveal', JSON.stringify(samples));
  await p2.close();
}

await browser.close();
