// Screenshot of one section at a given viewport: node studies-peek.mjs <hash> <outname> [width] [height] [offset]
import { chromium } from 'playwright';
const [hash, name, w = '1440', h = '900', off = '0'] = process.argv.slice(2);
const b = await chromium.launch();
const m = Number(w) < 700;
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, isMobile: m, hasTouch: m, deviceScaleFactor: m ? 2 : 1, locale: 'de-DE' });
const p = await ctx.newPage();
await p.goto(`http://localhost:3101/#${hash}`, { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
if (+off) { await p.evaluate((o) => scrollBy(0, o), +off); await p.waitForTimeout(3000); }
await p.screenshot({ path: `../review/studien-neu/${name}.png` });
await b.close();
