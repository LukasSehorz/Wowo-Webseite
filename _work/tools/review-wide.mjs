import { execSync } from 'node:child_process';
import { open, roundDir, sleep } from './review-lib.mjs';
const out = roundDir(undefined, 'widths');
const cfg = { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, isMobile: false };
const { browser, page } = await open('/', cfg);
let y = 0, i = 1;
let h = await page.evaluate(() => document.documentElement.scrollHeight);
while (y < h && i <= 14) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
  await sleep(900);
  await page.screenshot({ path: `${out}/w1920-${String(i).padStart(2, '0')}.png` });
  y += 972; i++;
  h = await page.evaluate(() => document.documentElement.scrollHeight);
}
const m = await page.evaluate(() => {
  const q = (t) => [...document.querySelectorAll('h2')].find((x) => (x.getAttribute('aria-label') || x.textContent).startsWith(t));
  const cards = [...document.querySelectorAll('#forschung article')].map((a) => Math.round(a.getBoundingClientRect().width) + 'x' + Math.round(a.getBoundingClientRect().height));
  return { h1: getComputedStyle(document.querySelector('h1')).fontSize, hero: document.querySelector('h1').closest('section').getBoundingClientRect().height, h2: getComputedStyle(q('Für lange')).fontSize, cards, docH: document.documentElement.scrollHeight };
});
console.log(JSON.stringify(m));
await browser.close();
execSync(`cd "${out}" && ffmpeg -y -v error -pattern_type glob -i "w1920-*.png" -vf "scale=640:-1,tile=4x3:padding=6:margin=6:color=white" -frames:v 1 sheet-w1920.png`);
