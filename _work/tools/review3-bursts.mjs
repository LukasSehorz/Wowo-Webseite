// Round 3: time bursts of the pressure-map morph, the study chart draw and the word reveal of an H2 (desktop).
import { execSync } from 'node:child_process';
import { open, roundDir, sleep } from './review-lib.mjs';

const out = roundDir('round-3', 'motion');
const { browser, page } = await open('/', 'desktop');
const top = async (id) => page.evaluate((i) => document.getElementById(i).getBoundingClientRect().top + scrollY, id);

// pressure map: land with the canvas centre at 75% of the viewport → trigger fires
const mapTop = await top('druckverteilung');
await page.evaluate((y) => window.scrollTo({ top: y - 900, behavior: 'instant' }), mapTop);
await sleep(500);
await page.evaluate((y) => window.scrollTo({ top: y - 200, behavior: 'instant' }), mapTop);
const t0 = Date.now();
for (let i = 0; i < 10; i++) {
  await page.screenshot({ path: `${out}/burst-map-${String(i).padStart(2, '0')}.png`, clip: { x: 0, y: 81, width: 1440, height: 819 } });
  const v = await page.evaluate(() => [...document.querySelectorAll('#druckverteilung dd, #druckverteilung [data-value]')].map((d) => d.textContent.trim()).slice(0, 3).join(' | '));
  console.log('map', Date.now() - t0, 'ms', v);
  await sleep(300);
}
execSync(`cd "${out}" && ffmpeg -y -v error -pattern_type glob -i "burst-map-*.png" -vf "scale=480:-1,tile=5x2:padding=6:margin=6:color=#666666" -frames:v 1 burst-map-sheet.png`);

// studies: chart draw
const stTop = await top('forschung');
await page.evaluate((y) => window.scrollTo({ top: y - 1200, behavior: 'instant' }), stTop);
await sleep(500);
await page.evaluate((y) => window.scrollTo({ top: y - 97, behavior: 'instant' }), stTop);
for (let i = 0; i < 8; i++) {
  await page.screenshot({ path: `${out}/burst-charts-${String(i).padStart(2, '0')}.png`, clip: { x: 0, y: 81, width: 1440, height: 819 } });
  await sleep(180);
}
execSync(`cd "${out}" && ffmpeg -y -v error -pattern_type glob -i "burst-charts-*.png" -vf "scale=480:-1,tile=4x2:padding=6:margin=6:color=#666666" -frames:v 1 burst-charts-sheet.png`);
await browser.close();
