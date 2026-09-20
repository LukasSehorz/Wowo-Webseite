import { chromium } from 'playwright';
const OUT = process.argv[2];
const devices = [
  { name: 'iphone-14',    w: 390, h: 844,  dpr: 3, touch: true },
  { name: 'iphone-se',    w: 375, h: 667,  dpr: 2, touch: true },
  { name: 'ipad-portrait',w: 820, h: 1180, dpr: 2, touch: true },
  { name: 'ipad-land',    w: 1180, h: 820, dpr: 2, touch: true },
  { name: 'laptop',       w: 1440, h: 900, dpr: 1, touch: false },
  { name: 'desktop-tall', w: 1920, h: 1440,dpr: 1, touch: false },
];
const b = await chromium.launch();
for (const d of devices) {
  const ctx = await b.newContext({
    viewport: { width: d.w, height: d.h }, deviceScaleFactor: d.dpr,
    isMobile: d.touch, hasTouch: d.touch, locale: 'de-DE',
  });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3100/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  const m = await p.evaluate(() => {
    const hero = document.querySelector('section.hero-screen');
    const r = hero.getBoundingClientRect();
    const next = hero.nextElementSibling?.getBoundingClientRect();
    return { heroH: Math.round(r.height), viewportH: window.innerHeight,
             nextTop: next ? Math.round(next.top) : null };
  });
  const gap = m.viewportH - m.nextTop;
  console.log(`${d.name.padEnd(15)} ${d.w}x${d.h}  hero ${String(m.heroH).padStart(4)}px  ` +
    `naechste Section beginnt bei ${String(m.nextTop).padStart(4)}px  ` +
    (gap > 0 ? `>>> ${gap}px SICHTBAR` : 'ok, nichts sichtbar'));
  await p.screenshot({ path: `${OUT}/hero-${d.name}.png` });
  await ctx.close();
}
await b.close();
