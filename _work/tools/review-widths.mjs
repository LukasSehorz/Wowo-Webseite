// Slices at intermediate widths (1280, 1024, 768) + overflow check, for layout breakage.
import { execSync } from 'node:child_process';
import { open, roundDir, sleep } from './review-lib.mjs';

const out = roundDir(undefined, 'widths');
const widths = (process.argv[2] || '1280,1024,768').split(',').map(Number);
const path = process.argv[3] || '/';
const tag = process.argv[4] || '';
for (const w of widths) {
  const cfg = { viewport: { width: w, height: 900 }, deviceScaleFactor: 1, isMobile: false, hasTouch: w < 1024 };
  const { browser, page, logs } = await open(path, cfg);
  let y = 0;
  let i = 1;
  let h = await page.evaluate(() => document.documentElement.scrollHeight);
  while (y < h && i <= 30) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await sleep(900);
    await page.screenshot({ path: `${out}/${tag}w${w}-${String(i).padStart(2, '0')}.png` });
    y += 810;
    i++;
    h = await page.evaluate(() => document.documentElement.scrollHeight);
  }
  const ov = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, h: document.documentElement.scrollHeight }));
  console.log(w, JSON.stringify(ov), 'console', logs.console.length, 'slices', i - 1);
  await browser.close();
  const cols = 5;
  execSync(`cd "${out}" && ffmpeg -y -v error -pattern_type glob -i "${tag}w${w}-*.png" -vf "scale=${Math.round(w / 2.4)}:-1,tile=${cols}x${Math.ceil((i - 1) / cols)}:padding=6:margin=6:color=white" -frames:v 1 ${tag}sheet-w${w}.png`);
}
