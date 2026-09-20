// Round 3: desktop study card 3 (line chart) and 5 (ratio bars) at full resolution.
import { open, roundDir, sleep } from './review-lib.mjs';
const out = roundDir('round-3', 'states');
const { browser, page } = await open('/', 'desktop');
await page.evaluate(() => document.getElementById('forschung').scrollIntoView({ behavior: 'instant' }));
await sleep(1500);
const region = page.locator('#forschung [role="region"]');
await region.evaluate((el) => (el.scrollLeft = 2 * (560 + 24)));
await sleep(1200);
const cards = page.locator('#forschung [role="region"] > li, #forschung [role="region"] article, #forschung [role="region"] > div > *');
const n = await cards.count();
console.log('cards', n);
for (const i of [2, 4]) {
  const b = await cards.nth(i).boundingBox();
  if (b && b.x >= 0 && b.x < 1440) await page.screenshot({ path: `${out}/d-study-card-${i + 1}.png`, clip: { x: Math.max(0, b.x), y: Math.max(0, b.y), width: Math.min(b.width, 1440 - b.x), height: Math.min(b.height, 900 - b.y) } });
  else console.log('card', i + 1, 'box', b);
}
const svg = await page.evaluate(() => [...document.querySelectorAll('#forschung svg')].map((s) => { const r = s.getBoundingClientRect(); return { vb: s.getAttribute('viewBox'), w: Math.round(r.width), h: Math.round(r.height), par: s.getAttribute('preserveAspectRatio') }; }));
console.log(JSON.stringify(svg));
await browser.close();
