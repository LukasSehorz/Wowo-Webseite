#!/usr/bin/env node
// Compares the reference display face (Parafina Black M, live on move.one/pages/the-science-2026) with free Google Fonts candidates.
// Output: ../reference/fonts/font-compare.png + font-compare.json (text widths at identical font-size)
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openSession, gotoReady, sleep } from './ref-lib.mjs';
const out = '../reference/fonts';
const SAMPLE = 'THE MOVE PLATFORM';
const SAMPLE2 = 'GESUNDE FÜSSE. STARKE TEAMS.';

// 1) reference metrics from live site
const s1 = await openSession('desktop');
await gotoReady(s1.page, 'https://move.one/pages/the-science-2026');
const ref = await s1.page.evaluate(async (SAMPLE2) => {
  await document.fonts.ready;
  const h = [...document.querySelectorAll('h2')].find((e) => /MOVE PLATFORM/i.test(e.innerText));
  const range = document.createRange();
  range.selectNodeContents(h);
  const r = range.getBoundingClientRect();
  const cs = getComputedStyle(h);
  // measure german sample in the same face
  const probe = document.createElement('span');
  probe.style.cssText = `font-family:${cs.fontFamily};font-size:80px;line-height:1;text-transform:uppercase;white-space:nowrap;position:absolute;left:0;top:0;visibility:hidden;font-weight:400`;
  probe.textContent = SAMPLE2;
  document.body.appendChild(probe);
  const w2 = probe.getBoundingClientRect().width;
  probe.textContent = 'H';
  const hW = probe.getBoundingClientRect().width;
  probe.remove();
  return { fontFamily: cs.fontFamily, fontSize: cs.fontSize, textWidth: Math.round(r.width), germanWidth: Math.round(w2), HWidth: Math.round(hW * 10) / 10, loaded: document.fonts.check('80px "Parafina Black M"') };
}, SAMPLE2);
const h2 = s1.page.locator('h2', { hasText: /MOVE PLATFORM/i }).first();
await h2.scrollIntoViewIfNeeded();
await sleep(500);
await h2.screenshot({ path: join(out, 'ref-parafina-h2.png') });
const h1 = s1.page.locator('h1').first();
await s1.page.evaluate(() => scrollTo(0, 0));
await sleep(400);
await h1.screenshot({ path: join(out, 'ref-parafina-h1.png') });
await s1.browser.close();

// 2) candidates
const CANDS = [
  ['League Spartan', 900], ['League Spartan', 800], ['Poppins', 900], ['Poppins', 800], ['Outfit', 900], ['Urbanist', 900], ['Jost', 900], ['Montserrat', 900],
  ['Red Hat Display', 900], ['Sora', 800], ['Lexend', 900], ['Figtree', 900], ['Plus Jakarta Sans', 800], ['Albert Sans', 900], ['Kumbh Sans', 900], ['Be Vietnam Pro', 900], ['Archivo', 900], ['Barlow', 900], ['Familjen Grotesk', 700], ['Anton', 400], ['Archivo Black', 400], ['Alfa Slab One', 400], ['Syne', 800], ['Unbounded', 900], ['Bricolage Grotesque', 800], ['Onest', 900], ['Geologica', 900], ['Golos Text', 900],
];
const fams = [...new Set(CANDS.map((c) => c[0]))];
const css = fams.map((f) => `family=${f.replace(/ /g, '+')}:wght@${[...new Set(CANDS.filter((c) => c[0] === f).map((c) => c[1]))].sort().join(';')}`).join('&');
const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?${css}&display=block">
<style>body{margin:24px;background:#fff;color:#1f1d1e;font-family:sans-serif} .row{display:flex;align-items:baseline;gap:24px;border-bottom:1px solid #eee;padding:10px 0} .lab{width:230px;font:13px/1.2 monospace;color:#666;flex:none} .s{font-size:80px;line-height:.9;text-transform:uppercase;white-space:nowrap;letter-spacing:0}</style></head><body>
<div class="row"><div class="lab">REFERENCE Parafina Black M<br>(screenshot from move.one)</div><img src="ref-parafina-h2.png" style="height:72px"></div>
${CANDS.map(([f, w], i) => `<div class="row"><div class="lab">${f} ${w}</div><div class="s" id="c${i}" style="font-family:'${f}';font-weight:${w}">${SAMPLE}</div></div>`).join('\n')}
<div style="height:30px"></div>
${CANDS.slice(0, 12).map(([f, w], i) => `<div class="row"><div class="lab">${f} ${w}</div><div class="s" id="g${i}" style="font-family:'${f}';font-weight:${w};font-size:56px">${SAMPLE2}</div></div>`).join('\n')}
</body></html>`;
writeFileSync(join(out, 'font-compare.html'), html);
const s2 = await openSession('desktop', { block: false, hidePopups: false, viewport: { width: 1500, height: 900 } });
await s2.page.goto('file://' + new URL(join(out, 'font-compare.html'), 'file://' + process.cwd() + '/').pathname);
await s2.page.waitForLoadState('networkidle').catch(() => {});
await s2.page.evaluate(() => document.fonts.ready);
await sleep(1500);
const widths = await s2.page.evaluate(({ CANDS, SAMPLE2 }) => CANDS.map(([f, w], i) => {
  const el = document.getElementById('c' + i);
  const r = document.createRange();
  r.selectNodeContents(el);
  const probe = document.createElement('span');
  probe.style.cssText = `font-family:'${f}';font-weight:${w};font-size:80px;line-height:1;text-transform:uppercase;white-space:nowrap;position:absolute;left:0;top:0;visibility:hidden`;
  probe.textContent = SAMPLE2;
  document.body.appendChild(probe);
  const gw = probe.getBoundingClientRect().width;
  probe.remove();
  return { font: f, weight: w, width: Math.round(r.getBoundingClientRect().width), germanWidth: Math.round(gw), loaded: document.fonts.check(`${w} 80px "${f}"`) };
}), { CANDS, SAMPLE2 });
await s2.page.screenshot({ path: join(out, 'font-compare.png'), fullPage: true });
await s2.browser.close();
for (const w of widths) { w.ratioToRef = Math.round((w.width / ref.textWidth) * 1000) / 1000; w.germanRatio = Math.round((w.germanWidth / ref.germanWidth) * 1000) / 1000; }
writeFileSync(join(out, 'font-compare.json'), JSON.stringify({ sample: SAMPLE, ref, widths }, null, 1));
console.log('REF', JSON.stringify(ref));
for (const w of widths.sort((a, b) => Math.abs(1 - a.ratioToRef) - Math.abs(1 - b.ratioToRef))) console.log(`${(w.font + ' ' + w.weight).padEnd(28)} width ${String(w.width).padStart(5)}  ratio ${w.ratioToRef}  german ${w.germanRatio}  loaded=${w.loaded}`);
