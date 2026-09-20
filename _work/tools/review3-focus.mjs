// Round 3: tab through /gutscheine (desktop), crop each focused element with its ring; list tab order.
import { execSync } from 'node:child_process';
import { open, roundDir, sleep } from './review-lib.mjs';

const out = roundDir('round-3', 'a11y');
const { browser, page } = await open('/gutscheine', 'desktop');
const stops = [];
let shots = 0;
for (let i = 0; i < 70; i++) {
  await page.keyboard.press('Tab');
  await sleep(120);
  const info = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute('type') || el.getAttribute('role') || '',
      text: (el.getAttribute('aria-label') || el.textContent || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 40),
      outline: cs.outlineStyle !== 'none' ? `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor} off ${cs.outlineOffset}` : 'none',
      boxShadow: cs.boxShadow !== 'none' ? cs.boxShadow.slice(0, 60) : 'none',
      rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      inView: r.top >= 0 && r.bottom <= innerHeight,
    };
  });
  if (!info) break;
  stops.push(info);
  const key = `${info.tag}:${info.text}`;
  if (shots < 14 && info.inView && info.rect[2] > 0 && !stops.slice(0, -1).some((s) => `${s.tag}:${s.text}` === key)) {
    const pad = 14;
    const clip = { x: Math.max(0, info.rect[0] - pad), y: Math.max(0, info.rect[1] - pad), width: Math.min(1440, info.rect[2] + pad * 2), height: info.rect[3] + pad * 2 };
    if (clip.width > 10 && clip.height > 10) {
      await page.screenshot({ path: `${out}/focus-${String(shots).padStart(2, '0')}.png`, clip });
      shots++;
    }
  }
}
console.table(stops.map((s) => ({ el: `${s.tag} ${s.type}`.trim(), text: s.text, outline: s.outline, inView: s.inView })));
const noRing = stops.filter((s) => s.outline === 'none' && s.boxShadow === 'none');
console.log('stops without visible ring:', noRing.length, noRing.map((s) => `${s.tag}:${s.text}`).slice(0, 10));
execSync(`cd "${out}" && ffmpeg -y -v error -pattern_type glob -i "focus-*.png" -vf "scale=-1:80,pad=iw+12:ih+12:6:6:color=#b0b0b0,tile=4x4:padding=4:margin=4:color=#b0b0b0" -frames:v 1 focus-sheet.png`);
await browser.close();
