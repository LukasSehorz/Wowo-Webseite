#!/usr/bin/env node
// Observes which popups appear over time (no dismissal) and dumps their DOM structure.
// Usage: node ref-popups.mjs --url <url> --out <dir> [--device desktop|mobile]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d;
};
const url = opt('url', 'https://move.one/');
const out = opt('out', './popups');
const device = opt('device', 'desktop');
mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const cfg =
  device === 'mobile'
    ? {
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      }
    : {
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      };

const browser = await chromium.launch();
const context = await browser.newContext({ ...cfg, locale: 'en-US' });
const page = await context.newPage();
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
const t0 = Date.now();
const log = [];
for (const t of [1500, 4000, 8000, 14000, 22000, 32000]) {
  await sleep(Math.max(0, t - (Date.now() - t0)));
  await page.screenshot({ path: join(out, `popup-${device}-t${String(t).padStart(5, '0')}.png`) });
  const state = await page.evaluate(() => {
    const res = {};
    const cb = document.querySelector('cookie-banner');
    if (cb) {
      res.cookieBanner = {
        cls: cb.className,
        open: cb.hasAttribute('open') || cb.classList.contains('active'),
        html: cb.outerHTML.slice(0, 2500),
      };
    }
    const alia = document.querySelector('[id^="alia-root"]');
    if (alia) {
      const sr = alia.shadowRoot;
      res.alia = {
        id: alia.id,
        hasShadow: !!sr,
        childCount: alia.children.length,
        text: (alia.innerText || '').slice(0, 400),
        html: alia.innerHTML.replace(/<style[\s\S]*?<\/style>/g, '').slice(0, 3000),
      };
    }
    res.klaviyo = [...document.querySelectorAll('[class*="kl-private"], .klaviyo-form, [data-testid*="klaviyo"], [aria-label*="POPUP" i]')]
      .slice(0, 5)
      .map((e) => ({ tag: e.tagName, cls: e.className.toString().slice(0, 120), role: e.getAttribute('role'), text: (e.innerText || '').slice(0, 200) }));
    res.dialogs = [...document.querySelectorAll('[role="dialog"], dialog[open], [aria-modal="true"]')].map((e) => {
      const r = e.getBoundingClientRect();
      const cs = getComputedStyle(e);
      return {
        tag: e.tagName,
        id: e.id,
        cls: e.className.toString().slice(0, 160),
        rect: [r.x, r.y, r.width, r.height].map(Math.round),
        vis: cs.visibility,
        op: cs.opacity,
        text: (e.innerText || '').slice(0, 160),
      };
    });
    return res;
  });
  log.push({ t, state });
  console.log('t', t, 'cookieOpen', state.cookieBanner?.open, 'alia text:', JSON.stringify(state.alia?.text?.slice(0, 100)), 'klaviyo', state.klaviyo.length, 'dialogs', state.dialogs.length);
}
writeFileSync(join(out, `popup-${device}-log.json`), JSON.stringify(log, null, 2));
await browser.close();
