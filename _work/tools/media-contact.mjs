#!/usr/bin/env node
// Final contact sheet: all stock videos (poster frame) and stock photos with file names, sizes and a 4:5 crop guide.
// Usage: node media-contact.mjs            -> _work/media/contact-sheet/contact-sheet.jpg (+ contact-sheet.html)
// Files listed in _work/media/raw/preexisting-images.txt (generated images placed by others) are left out.

import { chromium } from 'playwright';
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = '/Users/lukas.sehorz/Library/CloudStorage/OneDrive-Persönlich/Desktop/Webseiten/Sale/Wowo-Webseit';
const VID = join(ROOT, 'public/media/videos');
const IMG = join(ROOT, 'public/media/images');
const OUT = join(ROOT, '_work/media/contact-sheet');
const keepFile = join(ROOT, '_work/media/raw/preexisting-images.txt');
const keep = new Set(existsSync(keepFile) ? readFileSync(keepFile, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean) : []);

const mb = (p) => (statSync(p).size / 1048576).toFixed(1);
const kb = (p) => Math.round(statSync(p).size / 1024);
const probe = (p, entries) => execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', entries, '-of', 'csv=p=0:s=x', p]).toString().trim();

const videos = readdirSync(VID).filter((f) => f.endsWith('.mp4')).sort().map((f) => {
  const n = f.replace(/\.mp4$/, '');
  const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', join(VID, f)]).toString());
  return { n, poster: join(VID, `${n}.jpg`), info: `${probe(join(VID, f), 'stream=width,height')} · ${dur.toFixed(1)} s · mp4 ${mb(join(VID, f))} MB · webm ${mb(join(VID, `${n}.webm`))} MB` };
});
const order = (f) => (f.startsWith('tile-') ? 0 : 1);
const photos = readdirSync(IMG).filter((f) => /\.jpe?g$/.test(f) && !keep.has(f)).sort((a, b) => order(a) - order(b) || a.localeCompare(b)).map((f) => ({
  n: f, file: join(IMG, f), info: `${probe(join(IMG, f), 'stream=width,height')} · ${kb(join(IMG, f))} KB`,
}));

const card = (src, name, info, cls = '') => `<figure class="${cls}"><div class="im"><img src="${pathToFileURL(src).href}"></div><figcaption><b>${name}</b><span>${info}</span></figcaption></figure>`;
const html = `<!doctype html><meta charset="utf-8"><title>Contact sheet</title><style>
:root{--navy:#14213d;--olive:#6b7a3a;--steel:#a9bcd0;--off:#f5f3ee}
body{margin:0;background:var(--navy);color:var(--off);font:14px/1.35 -apple-system,Helvetica,Arial,sans-serif;padding:28px}
h1{font-size:22px;margin:0 0 4px}p.sub{margin:0 0 22px;color:var(--steel)}
h2{font-size:15px;letter-spacing:.08em;text-transform:uppercase;color:var(--steel);margin:26px 0 12px;border-top:1px solid #ffffff22;padding-top:16px}
.g{display:grid;gap:14px}.v{grid-template-columns:repeat(4,1fr)}.p{grid-template-columns:repeat(6,1fr)}
figure{margin:0;background:#0d172b;border-radius:6px;overflow:hidden}
.im{background:#0a1222;display:flex;align-items:center;justify-content:center}
.v .im{aspect-ratio:16/9}.p .im{aspect-ratio:4/5}
.im img{max-width:100%;max-height:100%;width:auto;height:auto;display:block}
.v .im img{width:100%}
figcaption{padding:8px 10px 10px}figcaption b{display:block;font-size:13.5px;color:#fff;word-break:break-all}
figcaption span{display:block;font-size:11.5px;color:var(--steel);margin-top:2px}
</style>
<h1>Brandmaier &amp; Rauscher – stock media contact sheet</h1>
<p class="sub">${videos.length} videos (poster = first frame; each as .mp4 + .webm + .jpg in public/media/videos) · ${photos.length} photos (public/media/images) · sources and licenses: _work/media/CREDITS.md</p>
<h2>Videos</h2><div class="g v">${videos.map((v) => card(v.poster, v.n, v.info)).join('')}</div>
<h2>Photos – the four tile-*.jpg are delivered as 4:5 crops (1600×2000)</h2><div class="g p">${photos.map((p) => card(p.file, p.n, p.info)).join('')}</div>`;
writeFileSync(join(OUT, 'contact-sheet.html'), html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1800, height: 1000 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(join(OUT, 'contact-sheet.html')).href, { waitUntil: 'load' });
await page.waitForTimeout(800);
const broken = await page.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).length);
await page.screenshot({ path: join(OUT, 'contact-sheet.jpg'), fullPage: true, type: 'jpeg', quality: 86 });
await browser.close();
console.log(`contact sheet: ${videos.length} videos, ${photos.length} photos, ${broken} broken images -> ${join(OUT, 'contact-sheet.jpg')}`);
