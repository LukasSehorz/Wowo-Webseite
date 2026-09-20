// What-if (no source edits): multiply grade instead of the alpha wash on the pinned fitting stage.
import { open, roundDir, scrollTo, sleep } from './review-lib.mjs';
import { execSync } from 'node:child_process';
const out = roundDir(undefined, 'whatif');
const { browser, page } = await open('/', 'desktop');
const top = await page.evaluate(() => Math.round(document.querySelector('#anpassung').getBoundingClientRect().top + scrollY));
for (const [i, p] of [[2, 0.3], [3, 0.42]]) {
  await scrollTo(page, top + Math.round(p * 2700), 1800);
  await page.screenshot({ path: `${out}/fitting-step${i}-before.png` });
}
await page.evaluate(() => {
  const stage = document.querySelector('#anpassung > div');
  const overlays = [...stage.children].filter((c) => c.getAttribute('aria-hidden') === 'true' && /bg-linear/.test(c.className));
  overlays.forEach((o) => (o.style.display = 'none'));
  const grade = document.createElement('div');
  grade.style.cssText = 'position:absolute;inset:0;pointer-events:none;background:#8FA5B7;mix-blend-mode:multiply;opacity:1';
  const left = document.createElement('div');
  left.style.cssText = 'position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg, rgb(15 32 52 / .62) 0%, rgb(15 32 52 / .30) 34%, rgb(15 32 52 / 0) 60%)';
  const bottom = document.createElement('div');
  bottom.style.cssText = 'position:absolute;left:0;right:0;bottom:0;height:45%;pointer-events:none;background:linear-gradient(0deg, rgb(15 32 52 / .45), rgb(15 32 52 / 0))';
  const ref = overlays[0];
  stage.insertBefore(grade, ref);
  stage.insertBefore(left, ref);
  stage.insertBefore(bottom, ref);
});
for (const [i, p] of [[2, 0.3], [3, 0.42]]) {
  await scrollTo(page, top + Math.round(p * 2700), 1800);
  await page.screenshot({ path: `${out}/fitting-step${i}-after.png` });
}
await browser.close();
execSync(`cd "${out}" && ffmpeg -y -v error -i fitting-step2-before.png -i fitting-step2-after.png -i fitting-step3-before.png -i fitting-step3-after.png -filter_complex "[0]scale=960:-1[a];[1]scale=960:-1[b];[2]scale=960:-1[c];[3]scale=960:-1[d];[a][b]hstack[r1];[c][d]hstack[r2];[r1][r2]vstack" compare-fitting.png`);
console.log('ok');
