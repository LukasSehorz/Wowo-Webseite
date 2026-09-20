// usage: node research-fetch.mjs <warmup-url> <outdir> <url1> [url2 ...]
// Fetches URLs with a real browser context (for sites with JS bot challenges). Saves bodies into <outdir>.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const [,, warm, outdir, ...urls] = process.argv;
fs.mkdirSync(outdir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--disable-blink-features=AutomationControlled'] });
const ctx = await browser.newContext({ locale: 'de-DE', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36', acceptDownloads: true, viewport: { width: 1366, height: 900 } });
const page = await ctx.newPage();
try {
  await page.goto(warm, { waitUntil: 'domcontentloaded', timeout: 60000 });
  for (let i = 0; i < 12; i++) { // wait for a challenge page to resolve
    const title = await page.title().catch(() => '');
    if (!/secure connection|just a moment|checking/i.test(title)) break;
    await page.waitForTimeout(2500);
  }
  console.log('warmup title:', await page.title());
  fs.writeFileSync(path.join(outdir, '_warmup.html'), await page.content());
  for (const u of urls) {
    const name = decodeURIComponent(new URL(u).pathname.split('/').pop() || 'index.html');
    // fetch from inside the page so the request carries the browser's own fingerprint and challenge cookies
    const r = await page.evaluate(async (url) => {
      const resp = await fetch(url, { credentials: 'include' });
      const buf = new Uint8Array(await resp.arrayBuffer());
      let bin = ''; const chunk = 0x8000;
      for (let i = 0; i < buf.length; i += chunk) bin += String.fromCharCode.apply(null, buf.subarray(i, i + chunk));
      return { status: resp.status, type: resp.headers.get('content-type'), b64: btoa(bin) };
    }, u);
    const body = Buffer.from(r.b64, 'base64');
    fs.writeFileSync(path.join(outdir, name), body);
    console.log(r.status, body.length, r.type, name);
  }
} catch (e) { console.error('ERR', e.message); }
await browser.close();
