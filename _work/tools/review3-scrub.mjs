// Round 3: fine-step scroll scrub of the pinned process, the sheet handovers and the footer reveal (desktop).
import { execSync } from 'node:child_process';
import { open, scrollTo, roundDir, sleep } from './review-lib.mjs';

const out = roundDir('round-3', 'motion');
const { browser, page } = await open('/', 'desktop');

// prime: scroll to just above the process section so earlier reveals have fired
const sec = await page.evaluate(() => {
  const el = document.getElementById('anpassung');
  const r = el.getBoundingClientRect();
  return { top: r.top + scrollY, height: el.offsetHeight };
});
console.log('anpassung', sec);
await scrollTo(page, sec.top - 1200, 600);
await scrollTo(page, sec.top - 600, 600);
const steps = 24;
const from = sec.top - 300;
const to = sec.top + sec.height + 300;
for (let i = 0; i < steps; i++) {
  const y = Math.round(from + ((to - from) * i) / (steps - 1));
  await scrollTo(page, y, 450);
  const state = await page.evaluate(() => {
    const active = document.querySelector('#anpassung [aria-current], #anpassung [data-active="true"], #anpassung .is-active');
    const stage = document.querySelector('#anpassung');
    const cs = getComputedStyle(stage);
    const imgs = [...document.querySelectorAll('#anpassung img')].map((im) => Math.round(parseFloat(getComputedStyle(im).opacity) * 100) / 100);
    return { y: Math.round(scrollY), pos: cs.position, imgOpacity: imgs, active: active?.textContent?.trim().slice(0, 12) };
  });
  console.log(i, JSON.stringify(state));
  await page.screenshot({ path: `${out}/scrub-process-${String(i).padStart(2, '0')}.png` });
}
execSync(`cd "${out}" && ffmpeg -y -v error -pattern_type glob -i "scrub-process-*.png" -vf "scale=480:-1,tile=4x6:padding=6:margin=6:color=#666666" -frames:v 1 scrub-process-sheet.png`);

// footer reveal
const doc = await page.evaluate(() => document.documentElement.scrollHeight);
const end = doc - 900;
for (let i = 0; i < 8; i++) {
  const y = Math.round(end - 1050 + (1050 * i) / 7);
  await scrollTo(page, y, 350);
  const f = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    const inner = footer.firstElementChild;
    return { y: Math.round(scrollY), footerTop: Math.round(footer.getBoundingClientRect().top), innerTransform: getComputedStyle(inner).transform };
  });
  console.log('footer', JSON.stringify(f));
  await page.screenshot({ path: `${out}/scrub-footer-${i}.png` });
}
execSync(`cd "${out}" && ffmpeg -y -v error -pattern_type glob -i "scrub-footer-*.png" -vf "scale=480:-1,tile=4x2:padding=6:margin=6:color=#666666" -frames:v 1 scrub-footer-sheet.png`);
await browser.close();
