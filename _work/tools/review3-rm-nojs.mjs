// Round 3: reduced motion (desktop + mobile) and no-JS: is every content element visible, is anything left at opacity 0 / translated?
import { chromium } from 'playwright';
import { DEVICES, BASE, roundDir, sleep } from './review-lib.mjs';

const out = roundDir('round-3', 'a11y');
const invisible = () => document.evaluate ? [...document.querySelectorAll('main h1, main h2, main h3, main p, main li, main img, main canvas, main svg, main button, main a')].filter((el) => {
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return false;
  let e = el;
  while (e && e !== document.body) {
    const cs = getComputedStyle(e);
    if (parseFloat(cs.opacity) < 0.05 || cs.visibility === 'hidden') return true;
    e = e.parentElement;
  }
  return false;
}).map((el) => `${el.tagName.toLowerCase()}:${(el.textContent || el.alt || '').trim().slice(0, 40)}`) : [];

for (const [device, path] of [['desktop', '/'], ['mobile', '/'], ['desktop', '/gutscheine']]) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ ...DEVICES[device], locale: 'de-DE', reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await sleep(800);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const hidden = new Set();
  for (let y = 0; y < h; y += 700) {
    await page.evaluate((t) => window.scrollTo({ top: t, behavior: 'instant' }), y);
    await sleep(150);
    for (const s of await page.evaluate(invisible)) hidden.add(s);
  }
  const state = await page.evaluate(() => ({
    videoPaused: [...document.querySelectorAll('video')].map((v) => v.paused),
    pinned: !!document.querySelector('#anpassung[data-pin]'),
    mapT: document.querySelector('#druckverteilung input[type="range"]')?.value,
    marqueePlay: [...document.querySelectorAll('[class*="marquee"] *')].map((e) => getComputedStyle(e).animationPlayState).find(Boolean),
  }));
  console.log(`RM ${device} ${path}: hidden=${hidden.size}`, [...hidden].slice(0, 8), JSON.stringify(state));
  await page.evaluate(() => document.getElementById('anpassung')?.scrollIntoView({ behavior: 'instant' }));
  await sleep(400);
  await page.screenshot({ path: `${out}/rm-${device}-${path.replace(/\W/g, '') || 'home'}-anpassung.png` });
  await browser.close();
}

// no JS
for (const [device, path] of [['desktop', '/'], ['mobile', '/gutscheine']]) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ ...DEVICES[device], locale: 'de-DE', javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await sleep(600);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const hidden = new Set();
  for (let y = 0; y < h; y += 700) {
    await page.evaluate((t) => window.scrollTo({ top: t, behavior: 'instant' }), y);
    for (const s of await page.evaluate(invisible)) hidden.add(s);
  }
  const info = await page.evaluate(() => ({
    h: document.documentElement.scrollHeight,
    formVisible: !!document.querySelector('#anfrage form'),
    submitVisible: [...document.querySelectorAll('#anfrage button[type="submit"]')].map((b) => getComputedStyle(b).display),
    canvas: !!document.querySelector('#druckverteilung canvas'),
    mapFallback: document.querySelector('#druckverteilung')?.innerText.slice(0, 80),
  }));
  console.log(`NOJS ${device} ${path}: hidden=${hidden.size}`, [...hidden].slice(0, 8), JSON.stringify(info));
  await page.screenshot({ path: `${out}/nojs-${device}-${path.replace(/\W/g, '') || 'home'}-full.png`, fullPage: true });
  await browser.close();
}
