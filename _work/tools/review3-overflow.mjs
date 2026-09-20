// Round 3: horizontal overflow + console at 360/390/768/1024/1280/1440/1920 for every page, after priming reveals.
import { open, primeReveals, sleep } from './review-lib.mjs';

const pages = ['/', '/ueber-uns', '/gutscheine', '/impressum', '/datenschutz'];
const widths = [360, 390, 768, 1024, 1280, 1440, 1920];
for (const path of pages) {
  const line = [];
  for (const w of widths) {
    const cfg = { viewport: { width: w, height: w < 768 ? 800 : 900 }, deviceScaleFactor: 1, isMobile: w < 768, hasTouch: w < 1024 };
    const { browser, page, logs } = await open(path, cfg);
    await primeReveals(page, 700, 120);
    await sleep(300);
    const r = await page.evaluate(() => {
      const de = document.documentElement;
      const vw = de.clientWidth;
      const bad = [];
      for (const el of document.querySelectorAll('body *')) {
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) continue;
        if (b.right > vw + 1 || b.left < -1) {
          let p = el.parentElement, inScroller = false;
          while (p && p !== document.body) {
            const cs = getComputedStyle(p);
            if (['auto', 'scroll', 'hidden', 'clip'].includes(cs.overflowX)) { inScroller = true; break; }
            p = p.parentElement;
          }
          if (!inScroller) bad.push(`${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join('.')}[${Math.round(b.left)}..${Math.round(b.right)}]`);
        }
      }
      return { sw: de.scrollWidth, cw: vw, bad: bad.slice(0, 4) };
    });
    line.push(`${w}:${r.sw === r.cw ? 'ok' : 'OVERFLOW ' + r.sw}${r.bad.length ? ' ' + r.bad.join(',') : ''}${logs.console.length ? ' console=' + logs.console.length : ''}${logs.pageerror.length ? ' ERR=' + logs.pageerror.length : ''}${logs.failed.length ? ' failed=' + logs.failed.length : ''}`);
    await browser.close();
  }
  console.log(path.padEnd(14), line.join(' | '));
}
