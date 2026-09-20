#!/usr/bin/env node
// Builder self-check: worst-case contrast of white copy over footage and graded photos. The copy is
// hidden, the overlays stay, and the brightest 5 % of the pixels behind each text box are averaged
// over several frames (the procedure of the reviewer's review-hero-contrast.mjs).
// Usage: node build-contrast.mjs [baseUrl]

import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:3101';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const lum = (r, g, b) => {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

async function brightest(page, box) {
  const buf = await page.screenshot({ clip: { x: box.x, y: box.y, width: box.w, height: box.h }, type: 'png' });
  return page.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    const ls = [];
    for (let i = 0; i < d.length; i += 16) ls.push([d[i], d[i + 1], d[i + 2]]);
    ls.sort((a, b) => b[0] + b[1] + b[2] - (a[0] + a[1] + a[2]));
    const top = ls.slice(0, Math.max(1, Math.floor(ls.length * 0.05)));
    return top.reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0]).map((v) => v / top.length);
  }, buf.toString('base64'));
}

async function worstCase(page, boxes, frames, pause) {
  const worst = {};
  for (let i = 0; i < frames; i++) {
    await sleep(pause);
    for (const [key, box] of Object.entries(boxes)) {
      const px = await brightest(page, box);
      const ratio = Math.round((1.05 / (lum(...px) + 0.05)) * 100) / 100;
      if (!worst[key] || ratio < worst[key].ratio) worst[key] = { ratio, rgb: px.map(Math.round) };
    }
  }
  return worst;
}

const boxOf = (el) => {
  const b = el.getBoundingClientRect();
  return { x: b.left, y: b.top, w: b.width, h: b.height };
};

const browser = await chromium.launch();

// hero: H1 needs 3:1 (large text), subline and link 4.5:1
for (const device of ['desktop', 'mobile']) {
  const context = await browser.newContext(
    device === 'mobile'
      ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'de-DE' }
      : { viewport: { width: 1440, height: 900 }, locale: 'de-DE' },
  );
  const page = await context.newPage();
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await sleep(1500);
  const boxes = await page.evaluate((boxOfSource) => {
    const boxOf = new Function('return ' + boxOfSource)();
    const h1 = document.querySelector('h1');
    const sub = h1.nextElementSibling;
    const link = [...document.querySelectorAll('main section a')].find((a) => a.textContent.trim() === 'Was die Forschung zeigt');
    const res = { h1: boxOf(h1), sub: boxOf(sub), link: boxOf(link) };
    for (const el of [h1, sub, link, link.previousElementSibling]) el.style.visibility = 'hidden';
    return res;
  }, boxOf.toString());
  const worst = await worstCase(page, boxes, 9, 1000);
  const pass = worst.h1.ratio >= 3 && worst.sub.ratio >= 4.5 && worst.link.ratio >= 4.5;
  console.log(`${pass ? 'PASS' : 'FAIL'}  hero ${device}: H1 ${worst.h1.ratio}:1 (needs 3), subline ${worst.sub.ratio}:1 (needs 4.5), link ${worst.link.ratio}:1 (needs 4.5)`);
  await context.close();
}

// fitting stage: each step's 16 px text needs 4.5:1, the title 3:1
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE' });
  const page = await context.newPage();
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  const rail = page.locator('#anpassung button[aria-label^="Schritt"]');
  const count = await rail.count();
  for (let i = 0; i < count; i++) {
    await page.evaluate((index) => {
      const section = document.querySelector('#anpassung');
      const top = section.getBoundingClientRect().top + window.scrollY;
      const distance = section.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + distance * (2 / 3) * ((index + 0.5) / 4), behavior: 'instant' });
    }, i);
    await sleep(1800);
    const boxes = await page.evaluate((boxOfSource) => {
      const boxOf = new Function('return ' + boxOfSource)();
      const li = document.querySelector('#anpassung li[aria-current="step"]');
      const block = li.querySelector('h3').parentElement;
      const title = li.querySelector('h3');
      const text = li.querySelector('p:last-child');
      const res = { title: boxOf(title), text: boxOf(text) };
      block.style.visibility = 'hidden';
      return res;
    }, boxOf.toString());
    await sleep(300);
    const worst = await worstCase(page, boxes, 3, 700);
    await page.evaluate(() => {
      const li = document.querySelector('#anpassung li[aria-current="step"]');
      li.querySelector('h3').parentElement.style.visibility = '';
    });
    const pass = worst.title.ratio >= 3 && worst.text.ratio >= 4.5;
    console.log(`${pass ? 'PASS' : 'FAIL'}  fitting step ${i + 1}: title ${worst.title.ratio}:1 (needs 3), text ${worst.text.ratio}:1 (needs 4.5)`);
  }
  await context.close();
}

// About closing band: display line 3:1, text 4.5:1
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE' });
  const page = await context.newPage();
  await page.goto(`${base}/ueber-uns`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelector('#closing-heading').scrollIntoView({ block: 'center', behavior: 'instant' }));
  await sleep(1800);
  const boxes = await page.evaluate((boxOfSource) => {
    const boxOf = new Function('return ' + boxOfSource)();
    const heading = document.querySelector('#closing-heading');
    const text = heading.nextElementSibling;
    const button = text.nextElementSibling;
    const res = { heading: boxOf(heading), text: boxOf(text) };
    for (const el of [heading, text, button]) el.style.visibility = 'hidden';
    return res;
  }, boxOf.toString());
  const worst = await worstCase(page, boxes, 6, 900);
  const pass = worst.heading.ratio >= 3 && worst.text.ratio >= 4.5;
  console.log(`${pass ? 'PASS' : 'FAIL'}  about closing band: heading ${worst.heading.ratio}:1 (needs 3), text ${worst.text.ratio}:1 (needs 4.5)`);
  await context.close();
}

await browser.close();
