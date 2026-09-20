// prefers-reduced-motion: reduce → everything must be visible without scrolling-triggered reveals.
import { open, roundDir, sleep } from './review-lib.mjs';

const out = roundDir(undefined, 'a11y');
const path = process.argv[2] || '/';
const tag = path.replace(/\W/g, '') || 'home';
for (const device of ['desktop', 'mobile']) {
  const { browser, page } = await open(path, device, { reducedMotion: 'reduce' });
  await sleep(800);
  // no pre-scroll on purpose
  const hidden = await page.evaluate(() => {
    const res = [];
    const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = walker.nextNode())) {
      const cs = getComputedStyle(n);
      const hasText = [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim().length > 1);
      if (!hasText && n.tagName !== 'IMG' && n.tagName !== 'CANVAS' && n.tagName !== 'svg') continue;
      let op = 1;
      let tr = false;
      let p = n;
      while (p && p !== document.body) {
        const pcs = getComputedStyle(p);
        op *= parseFloat(pcs.opacity);
        if (pcs.transform !== 'none' && /matrix\(1, 0, 0, 1, 0, (?!0\))/.test(pcs.transform)) tr = true;
        if (pcs.visibility === 'hidden' || pcs.display === 'none') op = -1;
        p = p.parentElement;
      }
      if (op >= 0 && op < 0.95) res.push({ tag: n.tagName, op: Math.round(op * 100) / 100, text: (n.textContent || n.alt || '').trim().slice(0, 50) });
      else if (tr && op >= 0) res.push({ tag: n.tagName, translated: true, text: (n.textContent || n.alt || '').trim().slice(0, 50) });
    }
    return res;
  });
  console.log(`== ${device}: elements with opacity < .95 or translateY without scrolling: ${hidden.length}`);
  hidden.slice(0, 30).forEach((h) => console.log('  ', JSON.stringify(h)));
  const state = await page.evaluate(() => {
    const v = document.querySelector('video');
    const range = document.querySelector('#druckverteilung input[type=range]');
    const fit = document.querySelector('#anpassung');
    const sticky = fit ? getComputedStyle(fit.firstElementChild).position : null;
    return {
      videoPaused: v ? v.paused : 'no video element',
      videoSrc: v ? (v.currentSrc || '').slice(-40) : null,
      slider: range?.value,
      fittingH: fit ? Math.round(fit.getBoundingClientRect().height) : null,
      fittingInnerPos: sticky,
      docH: document.documentElement.scrollHeight,
      marqueeAnim: [...document.querySelectorAll('*')].filter((e) => getComputedStyle(e).animationName !== 'none' && getComputedStyle(e).animationPlayState === 'running').map((e) => getComputedStyle(e).animationName).slice(0, 10),
    };
  });
  console.log('state', JSON.stringify(state));
  await page.screenshot({ path: `${out}/reduced-${tag}-${device}-full.png`, fullPage: true });
  await browser.close();
}
