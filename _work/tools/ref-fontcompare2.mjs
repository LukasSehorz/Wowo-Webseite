#!/usr/bin/env node
// Second pass: tracking-compensated candidates vs. the Parafina reference (same cap height).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openSession, sleep } from './ref-lib.mjs';
const out = '../reference/fonts';
const REFW = 709; // measured width of "THE MOVE PLATFORM" at 80px in Parafina Black M
const C = [
  ['League Spartan', 900, -0.045, 86], ['League Spartan', 800, -0.04, 86], ['League Spartan', 900, -0.03, 80],
  ['Poppins', 900, -0.06, 80], ['Poppins', 800, -0.055, 80], ['Outfit', 900, -0.06, 80], ['Urbanist', 900, -0.05, 82], ['Barlow', 900, -0.02, 80], ['Figtree', 900, -0.055, 80],
];
const fams = [...new Set(C.map((c) => c[0]))];
const css = fams.map((f) => `family=${f.replace(/ /g, '+')}:wght@${[...new Set(C.filter((c) => c[0] === f).map((c) => c[1]))].sort().join(';')}`).join('&');
const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?${css}&display=block">
<style>body{margin:24px;background:#fff;color:#1f1d1e;font-family:sans-serif}.row{display:flex;align-items:center;gap:24px;border-bottom:1px solid #eee;padding:12px 0}.lab{width:260px;font:13px/1.3 monospace;color:#666;flex:none}.s{line-height:.9;text-transform:uppercase;white-space:nowrap}</style></head><body>
<div class="row"><div class="lab">REFERENCE Parafina Black M 80px<br>(live screenshot)</div><img src="ref-parafina-h2.png" style="height:66px;margin-left:-178px"></div>
${C.map(([f, w, ls, fs], i) => `<div class="row"><div class="lab">${f} ${w}<br>${fs}px, letter-spacing ${ls}em</div><div class="s" id="c${i}" style="font-family:'${f}';font-weight:${w};letter-spacing:${ls}em;font-size:${fs}px">THE MOVE PLATFORM</div></div>`).join('\n')}
<div style="height:24px"></div>
<div class="row"><div class="lab">REFERENCE h1 (live)</div><img src="ref-parafina-h1.png" style="height:150px"></div>
<div class="row"><div class="lab">League Spartan 900<br>-0.045em, lh .86</div><div class="s" style="font-family:'League Spartan';font-weight:900;letter-spacing:-0.045em;font-size:62px;line-height:.86;text-align:center;white-space:normal;width:760px">Entwickelt mit führenden Orthopädie&shy;technikern &amp; Sportmedizinern</div></div>
<div class="row"><div class="lab">Poppins 900<br>-0.06em, lh .9</div><div class="s" style="font-family:'Poppins';font-weight:900;letter-spacing:-0.06em;font-size:56px;line-height:.92;text-align:center;white-space:normal;width:760px">Entwickelt mit führenden Orthopädie&shy;technikern &amp; Sportmedizinern</div></div>
</body></html>`;
writeFileSync(join(out, 'font-compare-tracked.html'), html);
const s = await openSession('desktop', { block: false, hidePopups: false, viewport: { width: 1300, height: 900 } });
await s.page.goto('file://' + new URL(join(out, 'font-compare-tracked.html'), 'file://' + process.cwd() + '/').pathname);
await s.page.waitForLoadState('networkidle').catch(() => {});
await s.page.evaluate(() => document.fonts.ready);
await sleep(1200);
const widths = await s.page.evaluate((C) => C.map((c, i) => { const el = document.getElementById('c' + i); const r = document.createRange(); r.selectNodeContents(el); return Math.round(r.getBoundingClientRect().width); }), C);
await s.page.screenshot({ path: join(out, 'font-compare-tracked.png'), fullPage: true });
await s.browser.close();
C.forEach((c, i) => console.log(`${(c[0] + ' ' + c[1]).padEnd(22)} ${c[3]}px ls ${c[2]}em -> width ${widths[i]}  (ref ${REFW}, ratio ${(widths[i] / REFW).toFixed(3)})`));
