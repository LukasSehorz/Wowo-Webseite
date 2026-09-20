#!/usr/bin/env node
// Search free stock sites and produce (a) a JSON list of results and (b) a labelled
// thumbnail contact sheet per query, so candidates can be screened visually.
//
// Usage:
//   node media-search.mjs --site pexels-video --out <dir> --q "walking feet slow motion" [--q "..."] [--max 30] [--pages 1]
//
// Sites: pexels-video | pexels-photo | mixkit | coverr | pixabay-video | pixabay-photo | unsplash
//
// Output per query: <out>/<site>__<slug>.json and <out>/<site>__<slug>.jpg (contact sheet)

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};
const multi = (n) => args.flatMap((a, i) => (a === `--${n}` && args[i + 1] ? [args[i + 1]] : []));

const site = opt('site');
const out = opt('out', './search');
const queries = multi('q');
const max = parseInt(opt('max', '30'), 10);
const pages = parseInt(opt('pages', '1'), 10);
mkdirSync(out, { recursive: true });

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SITES = {
  'pexels-video': {
    url: (q, p) =>
      `https://www.pexels.com/search/videos/${encodeURIComponent(q)}/?orientation=landscape${p > 1 ? `&page=${p}` : ''}`,
    linkRe: /\/video\/[^/]*?(\d+)\/?$/,
  },
  'pexels-photo': {
    url: (q, p) => `https://www.pexels.com/search/${encodeURIComponent(q)}/${p > 1 ? `?page=${p}` : ''}`,
    linkRe: /\/photo\/[^/]*?(\d+)\/?$/,
  },
  mixkit: {
    url: (q, p) => `https://mixkit.co/free-stock-video/${slugify(q)}/${p > 1 ? `?page=${p}` : ''}`,
    linkRe: /\/free-stock-video\/[^/]*?-(\d+)\/?$/,
  },
  coverr: {
    url: (q) => `https://coverr.co/s?q=${encodeURIComponent(q)}`,
    linkRe: /\/videos\/([^/?#]+)\/?$/,
  },
  'pixabay-video': {
    url: (q, p) => `https://pixabay.com/videos/search/${encodeURIComponent(q)}/?content_type=authentic${p > 1 ? `&pagi=${p}` : ''}`,
    linkRe: /\/videos\/[^/]*?-(\d+)\/?$/,
  },
  'pixabay-photo': {
    url: (q, p) =>
      `https://pixabay.com/photos/search/${encodeURIComponent(q)}/?content_type=authentic${p > 1 ? `&pagi=${p}` : ''}`,
    linkRe: /\/photos\/[^/]*?-(\d+)\/?$/,
  },
  unsplash: {
    url: (q) => `https://unsplash.com/s/photos/${slugify(q)}?license=free`,
    linkRe: /\/photos\/([^/?#]+)$/,
  },
};

const cfg = SITES[site];
if (!cfg || !queries.length) {
  console.error('usage: --site <site> --q "<query>" ...');
  process.exit(1);
}

const browser = await chromium.launch();
const context = await browser.newContext({
  userAgent: UA,
  viewport: { width: 1600, height: 1400 },
  locale: 'en-US',
});

async function collect(page, linkReSrc) {
  return page.evaluate((reSrc) => {
    const re = new RegExp(reSrc);
    const seen = new Set();
    const items = [];
    for (const a of document.querySelectorAll('a[href]')) {
      const href = a.href.split('?')[0].split('#')[0];
      if (/\/download\//.test(href)) continue;
      const m = href.match(re);
      if (!m) continue;
      // find a thumbnail: inside the anchor or in the closest card container
      let scope = a;
      let img = scope.querySelector('img, video');
      for (let i = 0; i < 3 && !img && scope.parentElement; i++) {
        scope = scope.parentElement;
        img = scope.querySelector('img, video');
      }
      if (!img) continue;
      if (seen.has(m[1])) continue;
      let thumb = '';
      if (img.tagName === 'VIDEO') {
        thumb = img.poster || '';
        if (!thumb) {
          const i2 = scope.querySelector('img');
          if (i2) thumb = i2.currentSrc || i2.src || i2.getAttribute('data-src') || '';
        }
      } else {
        thumb = img.currentSrc || img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy') || '';
        if ((!thumb || thumb.startsWith('data:')) && img.srcset) thumb = img.srcset.split(',')[0].trim().split(' ')[0];
      }
      const premium = /premium|plus|istock|sponsored/i.test(scope.innerText || '') ? 1 : 0;
      seen.add(m[1]);
      const slug = decodeURIComponent(href.replace(/\/$/, '').split('/').pop() || '').replace(/-/g, ' ');
      items.push({ id: m[1], page: href, thumb, alt: (img.alt || a.title || a.getAttribute('aria-label') || slug || '').slice(0, 140), premium });
    }
    return items;
  }, linkReSrc);
}

async function sheet(items, title, file) {
  const p = await context.newPage();
  const html = `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;background:#111;color:#eee;font:13px/1.3 -apple-system,Helvetica,Arial,sans-serif;padding:12px}
  h1{font-size:16px;margin:0 0 10px}
  .g{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
  .c{background:#222;position:relative}
  .c img{width:100%;aspect-ratio:16/10;object-fit:cover;display:block}
  .c b{position:absolute;left:0;top:0;background:#000c;color:#ffd84d;padding:2px 6px;font-size:14px}
  .c span{display:block;padding:3px 5px;font-size:11px;color:#bbb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  </style><h1>${title}</h1><div class="g">${items
    .map(
      (it, i) =>
        `<div class="c"><img src="${it.thumb}" referrerpolicy="no-referrer"><b>${i + 1} · ${it.id}</b><span>${(it.alt || '').replace(/</g, '&lt;')}</span></div>`,
    )
    .join('')}</div>`;
  await p.setViewportSize({ width: 1600, height: 900 });
  await p.setContent(html, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await p.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await sleep(500);
  await p.screenshot({ path: file, fullPage: true, type: 'jpeg', quality: 80 });
  await p.close();
}

const page = await context.newPage();
let cookiesDone = false;
for (const q of queries) {
  let all = [];
  for (let pn = 1; pn <= pages; pn++) {
    const url = cfg.url(q, pn);
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      const st = resp?.status();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      if (!cookiesDone) {
        for (const sel of ['button:has-text("Reject All")', 'button:has-text("Reject all")', 'button:has-text("Decline")']) {
          try {
            const b = page.locator(sel).first();
            if (await b.isVisible({ timeout: 800 })) {
              await b.click({ timeout: 1500 });
              cookiesDone = true;
              break;
            }
          } catch {}
        }
      }
      // scroll to trigger lazy loading
      for (let i = 0; i < 8; i++) {
        await page.mouse.wheel(0, 1400);
        await sleep(450);
      }
      await sleep(600);
      const items = await collect(page, cfg.linkRe.source);
      console.log(`[${site}] "${q}" p${pn}: status ${st}, ${items.length} items`);
      all = all.concat(items);
    } catch (e) {
      console.log(`[${site}] "${q}" p${pn}: ERR ${e.message.split('\n')[0]}`);
    }
  }
  const uniq = [];
  const seen = new Set();
  for (const it of all) {
    if (seen.has(it.page) || !it.thumb || it.thumb.startsWith('data:')) continue;
    seen.add(it.page);
    uniq.push(it);
  }
  const items = uniq.slice(0, max);
  const base = join(out, `${site}__${slugify(q)}`);
  writeFileSync(`${base}.json`, JSON.stringify(items, null, 1));
  if (items.length) await sheet(items, `${site} — "${q}" (${items.length})`, `${base}.jpg`);
  await sleep(800);
}
await browser.close();
