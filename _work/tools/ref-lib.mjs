// Shared helpers for the move.one reference analysis scripts (ref-*.mjs).
import { chromium } from 'playwright';

export const UA_DESKTOP =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
export const UA_MOBILE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

export const DEVICES = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false, userAgent: UA_DESKTOP },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA_MOBILE },
};

// Third-party popup app (Alia "20% off" full-screen modal) + heavy trackers. Blocking them keeps
// captures clean and makes network-idle reachable. Nothing of the visual design depends on them.
export const BLOCK_RE =
  /alia-prod\.com|alia-cloudflare\.com|fullstory\.com|clarity\.ms|ads-twitter\.com|getangler\.ai|intelligems\.io|facebook\.net|tiktok\.com\/i18n|analytics\.tiktok|google-analytics|googletagmanager|doubleclick|bat\.bing|snap\.licdn|sc-static\.net/;

// Popup selectors found on move.one (also usable with shoot.mjs --dismiss):
//   cookie banner (theme "Concept"): cookie-banner#CookieBanner button[name="accept"]  (appears 5 s after load)
//   Alia popup app:                  [id^="alia-root"] [aria-label="Close popup"]      (appears ~3-4 s after load)
export const DISMISS_SELECTORS = ['cookie-banner button[name="accept"]', '[id^="alia-root"] [aria-label="Close popup"]'];

export const HIDE_CSS = `
  cookie-banner, #CookieBanner, [id^="alia-root"], [id^="alia-popup-root"],
  div[class*="kl-private-reset-css"][role="dialog"], .klaviyo-form[role="dialog"],
  #shopify-pc__banner, .shopify-pc__banner__dialog { display: none !important; visibility: hidden !important; }
`;

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function openSession(device = 'desktop', { video = null, block = true, hidePopups = true, viewport = null } = {}) {
  const cfg = { ...DEVICES[device] };
  if (viewport) cfg.viewport = viewport;
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({
    ...cfg,
    locale: 'en-US',
    ...(video ? { recordVideo: { dir: video.dir, size: video.size || cfg.viewport } } : {}),
  });
  if (block) await context.route(BLOCK_RE, (r) => r.abort());
  if (hidePopups) {
    await context.addInitScript((css) => {
      const add = () => {
        const s = document.createElement('style');
        s.setAttribute('data-ref-hide', '1');
        s.textContent = css;
        (document.head || document.documentElement).appendChild(s);
      };
      if (document.head) add();
      else document.addEventListener('DOMContentLoaded', add);
    }, HIDE_CSS);
  }
  const page = await context.newPage();
  return { browser, context, page, cfg };
}

export async function gotoReady(page, url, { settle = 1500 } = {}) {
  const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('load', { timeout: 30000 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
  await page.evaluate(() => (document.fonts && document.fonts.ready ? document.fonts.ready.then(() => true) : true)).catch(() => {});
  await sleep(settle);
  return resp;
}

export async function dismissPopups(page) {
  for (const sel of DISMISS_SELECTORS) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 300 })) await el.click({ timeout: 1000 });
    } catch {}
  }
}

export const pageHeight = (page) => page.evaluate(() => document.documentElement.scrollHeight);

// Scroll through the whole page once so lazy images load and scroll-reveals fire.
export async function preScroll(page, { step = 0.6, pause = 300 } = {}) {
  const vh = page.viewportSize().height;
  let h = await pageHeight(page);
  for (let y = 0; y < h; y += Math.round(vh * step)) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await sleep(pause);
    h = await pageHeight(page);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(500);
}

// Wait until the images that intersect the viewport are decoded (no blank lazy placeholders).
export async function waitViewportImages(page, timeout = 5000) {
  await page
    .evaluate(async (timeout) => {
      const inView = (el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < innerHeight && r.width > 0 && r.height > 0;
      };
      const imgs = [...document.images].filter(inView);
      const t0 = performance.now();
      await Promise.all(
        imgs.map(
          (img) =>
            new Promise((res) => {
              const tick = () => {
                if ((img.complete && img.naturalWidth > 0) || performance.now() - t0 > timeout) return res();
                setTimeout(tick, 100);
              };
              tick();
            }),
        ),
      );
    }, timeout)
    .catch(() => {});
}

export function parseArgs(argv = process.argv.slice(2)) {
  const flag = (n) => argv.includes(`--${n}`);
  const opt = (n, d) => {
    const i = argv.indexOf(`--${n}`);
    return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d;
  };
  return { flag, opt };
}
