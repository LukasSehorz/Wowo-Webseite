import { execSync } from 'node:child_process';
import { open, roundDir, sleep, DEVICES } from './review-lib.mjs';
const out = roundDir(undefined, 'widths');
const cfg = { ...DEVICES.mobile, viewport: { width: 360, height: 780 } };
const { browser, page } = await open('/', cfg);
const ys = [0, 560, 3100, 3560, 8300];
let i = 1;
for (const y of ys) {
  await page.evaluate((t) => window.scrollTo({ top: t, behavior: 'instant' }), y);
  await sleep(1500);
  await page.screenshot({ path: `${out}/w360-${String(i++).padStart(2, '0')}.png` });
}
const m = await page.evaluate(() => {
  const h1 = document.querySelector('h1');
  const r = h1.getBoundingClientRect();
  const lh = parseFloat(getComputedStyle(h1).lineHeight);
  const lock = document.querySelector('header a').getBoundingClientRect();
  const burger = document.querySelector('header button').getBoundingClientRect();
  return { sw: document.documentElement.scrollWidth, h1fs: getComputedStyle(h1).fontSize, h1lines: Math.round(r.height / lh), lockRight: Math.round(lock.right), burgerLeft: Math.round(burger.left) };
});
console.log(JSON.stringify(m));
await browser.close();
execSync(`cd "${out}" && ffmpeg -y -v error -i w360-01.png -i w360-02.png -i w360-03.png -i w360-04.png -i w360-05.png -filter_complex "[0]scale=360:-1[a];[1]scale=360:-1[b];[2]scale=360:-1[c];[3]scale=360:-1[d];[4]scale=360:-1[e];[a][b][c][d][e]hstack=inputs=5" sheet-w360.png`);
