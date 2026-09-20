// Round 3: which image candidates are actually requested per device (sizes attribute vs rendered width)?
import { open, primeReveals, sleep } from './review-lib.mjs';

for (const [path, device] of [['/', 'mobile'], ['/', 'desktop'], ['/ueber-uns', 'mobile'], ['/gutscheine', 'mobile'], ['/gutscheine', 'desktop']]) {
  const { browser, page } = await open(path, device);
  // scroll the horizontal rows so lazy cards load too
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll') && el.scrollWidth > el.clientWidth) el.scrollLeft = el.scrollWidth;
    }
  });
  await primeReveals(page, 600, 150);
  await sleep(800);
  const rows = await page.evaluate(() => [...document.images].map((i) => {
    const r = i.getBoundingClientRect();
    const m = /[?&]w=(\d+)/.exec(i.currentSrc || '');
    return {
      file: decodeURIComponent((i.currentSrc || i.src)).replace(/.*url=/, '').replace(/&.*/, '').replace(/^\/media\/(images|videos)\//, '').replace(/^\/brand\//, 'brand/'),
      sizes: i.sizes || '(none)',
      cssW: Math.round(r.width),
      dpr: devicePixelRatio,
      requested: m ? Number(m[1]) : (i.currentSrc || '').slice(-30),
      loaded: i.complete && i.naturalWidth > 0,
    };
  }));
  console.log(`\n== ${path} ${device}`);
  for (const r of rows) {
    const need = r.cssW * r.dpr;
    const over = typeof r.requested === 'number' && r.requested > need * 1.6 ? ` <-- ${Math.round(r.requested / need * 10) / 10}x more than needed (${need}px)` : '';
    console.log(`${r.file.padEnd(38)} sizes=${String(r.sizes).padEnd(52)} css=${String(r.cssW).padStart(4)} req=${String(r.requested).padStart(5)} ${r.loaded ? '' : '(not loaded)'}${over}`);
  }
  await browser.close();
}
