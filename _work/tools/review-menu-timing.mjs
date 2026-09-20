// Samples the bottom sheet transform + item opacity per frame after tapping the burger (mobile).
import { open, sleep } from './review-lib.mjs';
const { browser, page } = await open('/', 'mobile');
const res = await page.evaluate(async () => {
  const burger = document.querySelector('header button');
  const log = [];
  const t0 = performance.now();
  burger.click();
  await new Promise((resolve) => {
    const tick = () => {
      const t = Math.round(performance.now() - t0);
      const d = document.querySelector('[role=dialog]');
      if (d) {
        const r = d.getBoundingClientRect();
        const items = [...d.querySelectorAll('nav a, ul a')].slice(0, 3).map((a) => {
          let op = 1, p = a; while (p && p !== d) { op *= parseFloat(getComputedStyle(p).opacity); p = p.parentElement; }
          return Math.round(op * 100) / 100;
        });
        const ov = [...document.querySelectorAll('body *')].find((e) => getComputedStyle(e).position === 'fixed' && /0\.7\)|\/ 0\.7/.test(getComputedStyle(e).backgroundColor));
        log.push({ t, top: Math.round(r.top), items, overlay: ov ? Math.round(parseFloat(getComputedStyle(ov).opacity) * 100) / 100 : null });
      } else log.push({ t, top: null });
      if (t < 1500) requestAnimationFrame(tick); else resolve();
    };
    requestAnimationFrame(tick);
  });
  const pick = (ms) => log.reduce((a, b) => (Math.abs(b.t - ms) < Math.abs(a.t - ms) ? b : a));
  return [0, 100, 200, 300, 400, 500, 600, 700, 800, 1000, 1200].map(pick);
});
res.forEach((r) => console.log(JSON.stringify(r)));
await browser.close();
