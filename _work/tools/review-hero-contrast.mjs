// Worst-case background luminance behind the hero copy over the loop (text hidden, overlays kept).
import { open, roundDir, sleep } from './review-lib.mjs';
import { execSync } from 'node:child_process';
const out = roundDir(undefined, 'states');
for (const device of ['desktop', 'mobile']) {
  const { browser, page } = await open('/', device);
  const boxes = await page.evaluate(() => {
    const r = (el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; };
    const h1 = document.querySelector('h1');
    const sub = [...document.querySelectorAll('section p')].find((p) => p.textContent.startsWith('Zwei Physio'));
    const link = [...document.querySelectorAll('a')].find((a) => a.textContent.trim() === 'Was die Forschung zeigt');
    const res = { h1: r(h1), sub: r(sub), link: r(link) };
    for (const el of [h1, sub, link, link.previousElementSibling]) if (el) el.style.visibility = 'hidden';
    return res;
  });
  const lum = (r, g, b) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const worst = { h1: 0, sub: 0, link: 0 };
  for (let i = 0; i < 9; i++) {
    await sleep(1000);
    for (const k of ['h1', 'sub', 'link']) {
      const b = boxes[k];
      const buf = await page.screenshot({ clip: { x: b.x, y: b.y, width: b.w, height: b.h }, type: 'png' });
      const px = await page.evaluate(async (b64) => {
        const img = new Image();
        img.src = 'data:image/png;base64,' + b64;
        await img.decode();
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        // brightest 5 % of pixels (mean)
        const ls = [];
        for (let i = 0; i < d.length; i += 16) ls.push([d[i], d[i + 1], d[i + 2]]);
        ls.sort((a, b) => (b[0] + b[1] + b[2]) - (a[0] + a[1] + a[2]));
        const top = ls.slice(0, Math.max(1, Math.floor(ls.length * 0.05)));
        const m = top.reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0]).map((v) => v / top.length);
        return m;
      }, buf.toString('base64'));
      const L = lum(px[0], px[1], px[2]);
      const ratio = 1.05 / (L + 0.05);
      if (!worst[k] || ratio < worst[k].ratio) worst[k] = { ratio: Math.round(ratio * 100) / 100, rgb: px.map(Math.round), frame: i };
    }
  }
  console.log(device, JSON.stringify(worst));
  await browser.close();
}
