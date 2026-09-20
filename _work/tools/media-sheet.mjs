#!/usr/bin/env node
// Render a labelled thumbnail contact sheet from a simple list.
//
// Usage: node media-sheet.mjs --kind pexels-video|pexels-photo|raw --title "..." --out <file.jpg> [--cols 6] < list.txt
//
// list.txt lines:  id|thumb|title
//   kind pexels-video: thumb is the preview file name (without .jpeg) under images.pexels.com/videos/<id>/
//   kind pexels-photo: thumb may be empty -> canonical images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg
//   kind raw:          thumb is a full URL or a local file path
// Also writes <file>.json next to the sheet with the parsed list.

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const kind = opt('kind', 'raw');
const title = opt('title', 'sheet');
const out = opt('out');
const cols = parseInt(opt('cols', '6'), 10);
const ratio = opt('ratio', '16/10'); // --ratio 16/3 for 3-frame strips
if (!out) { console.error('missing --out'); process.exit(1); }

const lines = readFileSync(0, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
const items = lines.map((l) => {
  const [id, thumb = '', ...rest] = l.split('|').map((s) => s.trim());
  let t = thumb;
  if (kind === 'pexels-video') {
    // preview names always end in -<id>; the list may have lost that suffix
    let n = thumb.replace(/\.jpe?g$/, '');
    if (!n || n === 'NONE') n = `pexels-photo-${id}`;
    else if (n.endsWith('-')) n = `${n}${id}`;
    else if (!n.endsWith(`-${id}`)) n = `${n}-${id}`;
    t = /^https?:/.test(thumb) ? thumb : `https://images.pexels.com/videos/${id}/${n}.jpeg?auto=compress&cs=tinysrgb&w=500`;
  }
  else if (kind === 'unsplash') {
    // line: /photos/<slug>-<id>|photo-xxxx|author|alt
    const pagePath = id;
    const cdn = thumb.replace(/^https?:\/\/images\.unsplash\.com\//, '').split('?')[0];
    const [author = '', ...altRest] = rest;
    return { id: pagePath.slice(-11), page: `https://unsplash.com${pagePath}`, cdn, author, thumb: `https://images.unsplash.com/${cdn}?w=500&q=70&fm=jpg&fit=crop`, alt: `${author} — ${altRest.join('|')}` };
  }
  else if (kind === 'pexels-photo') t = /^https?:/.test(thumb) ? thumb : `https://images.pexels.com/photos/${id}/${(thumb || `pexels-photo-${id}`).replace(/\.jpe?g$/, '')}.jpeg?auto=compress&cs=tinysrgb&w=500`;
  else if (t && !/^https?:/.test(t)) t = pathToFileURL(t).href;
  return { id, thumb: t, alt: rest.join('|') };
});
writeFileSync(out.replace(/\.jpe?g$/, '.json'), JSON.stringify(items, null, 1));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1800, height: 900 } });
const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#111;color:#eee;font:13px/1.3 -apple-system,Helvetica,Arial,sans-serif;padding:12px}
h1{font-size:16px;margin:0 0 10px}
.g{display:grid;grid-template-columns:repeat(${cols},minmax(0,1fr));gap:8px}
.c{background:#222;position:relative;min-width:0}
.c img{width:100%;aspect-ratio:${ratio};object-fit:cover;display:block;background:#400}
.c b{position:absolute;left:0;top:0;background:#000c;color:#ffd84d;padding:2px 6px;font-size:14px}
.c span{display:block;padding:3px 5px;font-size:11px;color:#bbb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
</style><h1>${title} (${items.length})</h1><div class="g">${items
  .map((it, i) => `<div class="c"><img src="${it.thumb}" referrerpolicy="no-referrer"><b>${i + 1} · ${it.id}</b><span>${(it.alt || '').replace(/</g, '&lt;')}</span></div>`)
  .join('')}</div>`;
// load from a real file so that local file:// thumbnails are allowed
const tmpHtml = out.replace(/\.jpe?g$/, '.tmp.html');
writeFileSync(tmpHtml, html);
await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: 'load', timeout: 90000 }).catch(() => {});
await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(500);
const broken = await page.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).length);
await page.screenshot({ path: out, fullPage: true, type: 'jpeg', quality: 82 });
await browser.close();
unlinkSync(tmpHtml);
console.log(`sheet: ${out} (${items.length} items, ${broken} broken thumbs)`);
