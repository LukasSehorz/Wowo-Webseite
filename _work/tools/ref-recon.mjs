#!/usr/bin/env node
// Recon: loads a URL, reports status, title, nav links, script/css/font URLs, popup candidates.
// Usage: node ref-recon.mjs --url <url> --out <json file> [--device desktop|mobile] [--linger 12000]
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const args = process.argv.slice(2);
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d;
};
const url = opt('url');
const out = opt('out', './recon.json');
const device = opt('device', 'desktop');
const linger = parseInt(opt('linger', '12000'), 10);
mkdirSync(dirname(out), { recursive: true });

const UA_DESKTOP =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const UA_MOBILE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

const cfg =
  device === 'mobile'
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA_MOBILE }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, userAgent: UA_DESKTOP };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const context = await browser.newContext({ ...cfg, locale: 'en-US' });
const page = await context.newPage();

const requests = [];
page.on('response', (res) => {
  const req = res.request();
  requests.push({ url: res.url(), status: res.status(), type: req.resourceType() });
});

const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForLoadState('networkidle', { timeout: 25000 }).catch(() => {});
await sleep(linger);

const info = await page.evaluate(() => {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0;
  };
  const links = [...document.querySelectorAll('a[href]')].map((a) => ({
    text: (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
    href: a.href,
    inHeader: !!a.closest('header, .header, [class*="header"]'),
    inFooter: !!a.closest('footer, .footer, [class*="footer"]'),
  }));
  // Popup candidates: fixed/sticky positioned, large z-index, visible
  const fixed = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if ((cs.position === 'fixed' || cs.position === 'sticky') && vis(el)) {
      const r = el.getBoundingClientRect();
      fixed.push({
        tag: el.tagName.toLowerCase(),
        id: el.id,
        cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || '').toString().slice(0, 200),
        position: cs.position,
        z: cs.zIndex,
        rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
        text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120),
      });
    }
  }
  const iframes = [...document.querySelectorAll('iframe')].map((f) => ({ src: f.src, id: f.id, cls: f.className, vis: vis(f) }));
  const sections = [...document.querySelectorAll('main > *, #MainContent > *, .shopify-section')].map((s) => {
    const r = s.getBoundingClientRect();
    return {
      tag: s.tagName.toLowerCase(),
      id: s.id,
      cls: (s.className || '').toString().slice(0, 160),
      top: Math.round(r.top + scrollY),
      h: Math.round(r.height),
    };
  });
  return {
    title: document.title,
    lang: document.documentElement.lang,
    htmlClass: document.documentElement.className,
    bodyClass: document.body.className,
    scrollHeight: document.documentElement.scrollHeight,
    generator: document.querySelector('meta[name="generator"]')?.content,
    theme: window.Shopify && window.Shopify.theme ? window.Shopify.theme : null,
    globals: Object.keys(window).filter((k) => /gsap|swiper|lenis|splide|flickity|aos|scrolltrigger|locomotive|barba|anime|motion|klaviyo|keen|glide|embla|tns|slick|jquery|\$$/i.test(k)),
    links,
    fixed,
    iframes,
    sections,
  };
});

const result = { status: resp?.status(), finalUrl: page.url(), ...info, requests };
writeFileSync(out, JSON.stringify(result, null, 2));
console.log('status', result.status, 'title', result.title, 'scrollHeight', result.scrollHeight);
console.log('theme', JSON.stringify(result.theme));
console.log('globals', result.globals.join(', '));
console.log('fixed elements:', result.fixed.length, 'iframes:', result.iframes.length, 'sections:', result.sections.length);
await browser.close();
