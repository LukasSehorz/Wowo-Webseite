#!/usr/bin/env node
// Coverr search with the site's own "Hide AI-generated" filter switched on in the UI.
// Reads the JSON the page itself loads for the result grid, writes <out>/coverr__<slug>.json + contact sheet.
// Usage: node media-coverr-search.mjs --out <dir> --q "walking feet" [--q ...] [--dump]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const multi = (n) => args.flatMap((a, i) => (a === `--${n}` && args[i + 1] ? [args[i + 1]] : []));
const out = opt('out', './search');
const queries = multi('q');
const dump = args.includes('--dump');
mkdirSync(out, { recursive: true });
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const browser = await chromium.launch();
const context = await browser.newContext({ userAgent: UA, viewport: { width: 1600, height: 900 }, locale: 'en-US' });
const page = await context.newPage();
let last = null;
page.on('response', async (r) => {
  const u = r.url();
  if (u.includes('/papi/videos?') && u.includes('filter=ai:false')) {
    try { last = await r.json(); } catch {}
  }
});

async function sheet(items, title, file) {
  const p = await context.newPage();
  const html = `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;background:#111;color:#eee;font:13px/1.3 -apple-system,Helvetica,Arial,sans-serif;padding:12px}
  h1{font-size:16px;margin:0 0 10px}.g{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
  .c{background:#222;position:relative}.c img{width:100%;aspect-ratio:16/10;object-fit:cover;display:block}
  .c b{position:absolute;left:0;top:0;background:#000c;color:#ffd84d;padding:2px 6px;font-size:14px}
  .c span{display:block;padding:3px 5px;font-size:11px;color:#bbb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  </style><h1>${title}</h1><div class="g">${items.map((it, i) => `<div class="c"><img src="${it.thumb}" referrerpolicy="no-referrer"><b>${i + 1}${it.premium ? ' · PREMIUM' : ''}</b><span>${it.id} — ${(it.alt || '').replace(/</g, '&lt;')}</span></div>`).join('')}</div>`;
  await p.setViewportSize({ width: 1600, height: 900 });
  await p.setContent(html, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await p.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await sleep(500);
  await p.screenshot({ path: file, fullPage: true, type: 'jpeg', quality: 80 });
  await p.close();
}

let cookieDone = false;
for (const q of queries) {
  last = null;
  await page.goto(`https://coverr.co/s?q=${encodeURIComponent(q)}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
  if (!cookieDone) { await page.getByText('Got it!').first().click({ timeout: 2500 }).catch(() => {}); cookieDone = true; }
  // switch the site's own filter to "Hide AI-generated"
  const show = page.getByText('Show AI-generated').first();
  if (await show.isVisible({ timeout: 2500 }).catch(() => false)) {
    await show.click({ timeout: 5000 }).catch(() => {});
    await sleep(500);
    await page.locator('div', { hasText: /^Hide AI-generated$/ }).last().click({ timeout: 5000 }).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await sleep(1200);
  }
  if (!last) { console.log(`[coverr] "${q}": no filtered response captured`); continue; }
  if (dump) { console.log(JSON.stringify(last, null, 1).slice(0, 4000)); }
  const hits = last.hits || last.videos || last.items || [];
  const items = hits.map((h) => ({
    id: h.slug || h.id,
    page: `https://coverr.co/videos/${h.slug || h.id}`,
    thumb: h.thumbnail || h.poster || h.thumb || '',
    alt: h.title || '',
    premium: h.isPremium || h.is_premium || h.premium ? 1 : 0,
    ai: h.isAiGenerated ?? null,
    urls: h.urls || null,
    maxWidth: h.maxWidth || h.max_width || null,
    maxHeight: h.maxHeight || h.max_height || null,
    duration: h.duration || null,
    author: h.contributor ? (h.contributor.name || h.contributor.displayName || h.contributor.username || JSON.stringify(h.contributor).slice(0, 200)) : null,
    fps: h.fps || null,
    desc: (h.description || '').slice(0, 240),
  }));
  const base = join(out, `coverr__${slugify(q)}`);
  writeFileSync(`${base}.json`, JSON.stringify(items, null, 1));
  console.log(`[coverr] "${q}": ${items.length} items (total ${last.total ?? last.nbHits ?? '?'})`);
  if (items.length) await sheet(items, `coverr (AI hidden) — "${q}" (${items.length})`, `${base}.jpg`);
  await sleep(1000);
}
await browser.close();
