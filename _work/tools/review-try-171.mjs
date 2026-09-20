import { open, primeReveals, roundDir, sleep } from './review-lib.mjs';
import { execSync } from 'node:child_process';
const out = roundDir(undefined, 'whatif');
const { browser, page } = await open('/', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, isMobile: false });
await primeReveals(page);
const variants = [
  ['v1-current', ''],
  ['v2-ls-0.03', '.display-stat,.display-stat *{letter-spacing:-0.03em !important}'],
  ['v3-ls-0.02-nokern', '.display-stat,.display-stat *{letter-spacing:-0.02em !important;font-kerning:none !important}'],
  ['v4-ls-0.01-nokern', '.display-stat,.display-stat *{letter-spacing:-0.01em !important;font-kerning:none !important}'],
];
const h = await page.evaluateHandle(() => [...document.querySelectorAll('main *')].find((e) => /^171/.test(e.textContent.trim()) && e.textContent.trim().length < 12));
const el = h.asElement();
await el.scrollIntoViewIfNeeded();
await sleep(1500);
const files = [];
for (const [n, css] of variants) {
  const tag = css ? await page.addStyleTag({ content: css }) : null;
  await sleep(250);
  const b = await el.boundingBox();
  const cx = b.x + b.width / 2;
  await page.screenshot({ path: `${out}/171-${n}.png`, clip: { x: cx - 170, y: b.y - 6, width: 340, height: b.height + 12 } });
  files.push(`171-${n}.png`);
  if (tag) await tag.evaluate((t) => t.remove());
}
await browser.close();
execSync(`cd "${out}" && ffmpeg -y -v error ${files.map((f) => `-i ${f}`).join(' ')} -filter_complex "${files.map((_, i) => `[${i}]`).join('')}hstack=inputs=${files.length}" compare-171.png`);
