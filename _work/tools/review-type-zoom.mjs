// DPR-2 close-ups of display typography (collisions, umlaut clipping, tracking).
import { open, primeReveals, roundDir, sleep } from './review-lib.mjs';

const out = roundDir(undefined, 'type');
const { browser, page } = await open('/', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, isMobile: false });
await primeReveals(page);
await sleep(800);

async function shot(name, finder, pad = 14) {
  const handle = await page.evaluateHandle(finder);
  const el = handle.asElement();
  if (!el) return console.log('missing', name);
  await el.scrollIntoViewIfNeeded();
  await sleep(1400);
  const b = await el.boundingBox();
  await page.screenshot({
    path: `${out}/${name}.png`,
    clip: { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: b.width + pad * 2, height: b.height + pad * 2 },
  });
  console.log(name, JSON.stringify(b));
}

const leaf = (re) => `[...document.querySelectorAll('main *')].find(e => e.children.length === 0 && ${re}.test(e.textContent.trim()))`;
await shot('h1', () => document.querySelector('h1'));
await shot('intro-h2', () => document.querySelectorAll('h2')[0]);
await shot('stat-171', () => [...document.querySelectorAll('main *')].find((e) => /^171/.test(e.textContent.trim()) && e.textContent.trim().length < 12));
await shot('stat-46', () => [...document.querySelectorAll('main *')].find((e) => /^46/.test(e.textContent.trim()) && e.textContent.trim().length < 8));
await shot('fig-18statt26', () => [...document.querySelectorAll('#forschung *')].find((e) => /^18 statt 26$/.test(e.textContent.trim())));
await shot('fig-3monate', () => [...document.querySelectorAll('#forschung *')].find((e) => /^3 Monate$/.test(e.textContent.trim())));
await shot('fig-24', () => [...document.querySelectorAll('#forschung *')].find((e) => /^[−-]24/.test(e.textContent.trim()) && e.textContent.trim().length < 8));
await shot('voucher-word', () => [...document.querySelectorAll('main *')].find((e) => e.children.length === 0 && /^gutschein$/i.test(e.textContent.trim())), 30);
await shot('founder-initials', () => [...document.querySelectorAll('main *')].find((e) => e.children.length === 0 && /^SR$/.test(e.textContent.trim())), 30);
await shot('tile-title', () => [...document.querySelectorAll('main h3')].find((e) => /Logistik/.test(e.textContent)), 20);
await shot('h2-std', () => [...document.querySelectorAll('h2')].find((e) => /Für lange Tage/.test(e.getAttribute('aria-label') || e.textContent)));
await browser.close();
