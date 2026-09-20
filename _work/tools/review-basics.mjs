// Basics: console/page errors, failed requests, overflow, broken images, headings, landmarks, section map.
import { writeFileSync } from 'node:fs';
import { open, primeReveals, roundDir, sleep } from './review-lib.mjs';

const path = process.argv[2] || '/';
const tag = process.argv[3] || 'home';
const out = roundDir(undefined, 'data');
const result = {};

for (const device of ['desktop', 'mobile']) {
  const { browser, page, logs } = await open(path, device);
  await primeReveals(page);
  await sleep(500);
  const data = await page.evaluate(() => {
    const de = document.documentElement;
    const vw = de.clientWidth;
    const overflowing = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > vw + 1 || r.left < -1) {
        // ignore elements inside horizontal scrollers
        let p = el.parentElement;
        let inScroller = false;
        while (p && p !== document.body) {
          const cs = getComputedStyle(p);
          if (['auto', 'scroll', 'hidden', 'clip'].includes(cs.overflowX)) {
            inScroller = true;
            break;
          }
          p = p.parentElement;
        }
        if (!inScroller)
          overflowing.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className?.toString?.() || '').slice(0, 80),
            left: Math.round(r.left),
            right: Math.round(r.right),
          });
      }
    }
    const imgs = [...document.images].map((i) => ({
      src: (i.currentSrc || i.src).slice(0, 120),
      ok: i.complete && i.naturalWidth > 0,
      alt: i.alt,
      loading: i.loading,
      w: i.naturalWidth,
      h: i.naturalHeight,
      cssW: Math.round(i.getBoundingClientRect().width),
      cssH: Math.round(i.getBoundingClientRect().height),
    }));
    const headings = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => ({
      tag: h.tagName,
      text: (h.getAttribute('aria-label') || h.textContent).trim().slice(0, 90),
    }));
    const landmarks = ['header', 'nav', 'main', 'footer'].map((t) => ({
      t,
      n: document.querySelectorAll(t).length,
    }));
    const sections = [...document.querySelectorAll('main > *, footer')].map((s) => {
      const r = s.getBoundingClientRect();
      const cs = getComputedStyle(s);
      return {
        tag: s.tagName.toLowerCase(),
        id: s.id,
        cls: (s.className?.toString?.() || '').slice(0, 100),
        top: Math.round(r.top + scrollY),
        h: Math.round(r.height),
        pt: cs.paddingTop,
        pb: cs.paddingBottom,
        bg: cs.backgroundColor,
        radius: cs.borderRadius,
      };
    });
    const videos = [...document.querySelectorAll('video')].map((v) => ({
      src: (v.currentSrc || '').slice(-60),
      poster: (v.poster || '').slice(-60),
      muted: v.muted,
      loop: v.loop,
      playsInline: v.playsInline,
      preload: v.preload,
      paused: v.paused,
      w: v.videoWidth,
      h: v.videoHeight,
    }));
    return {
      lang: de.lang,
      title: document.title,
      desc: document.querySelector('meta[name=description]')?.content,
      scrollW: de.scrollWidth,
      clientW: de.clientWidth,
      scrollH: de.scrollHeight,
      overflowing: overflowing.slice(0, 25),
      imgs,
      headings,
      landmarks,
      sections,
      videos,
      jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].length,
      og: document.querySelector('meta[property="og:image"]')?.content,
    };
  });
  result[device] = { ...data, logs };
  await browser.close();
}
writeFileSync(`${out}/${tag}-basics.json`, JSON.stringify(result, null, 2));
for (const d of ['desktop', 'mobile']) {
  const r = result[d];
  console.log(`== ${d}: scrollW ${r.scrollW} / clientW ${r.clientW}, height ${r.scrollH}`);
  console.log('console:', r.logs.console.length, 'pageerror:', r.logs.pageerror.length, 'failed:', r.logs.failed.length, 'bad:', r.logs.badStatus.length);
  r.logs.console.slice(0, 8).forEach((l) => console.log('  ', l.slice(0, 300)));
  r.logs.pageerror.slice(0, 8).forEach((l) => console.log('  PE', l.slice(0, 300)));
  r.logs.failed.slice(0, 8).forEach((l) => console.log('  F', l.slice(0, 200)));
  r.logs.badStatus.slice(0, 8).forEach((l) => console.log('  B', l.slice(0, 200)));
  console.log('overflowing:', JSON.stringify(r.overflowing.slice(0, 8)));
  console.log('broken imgs:', r.imgs.filter((i) => !i.ok).length, 'of', r.imgs.length, '| empty alts:', r.imgs.filter((i) => !i.alt).length);
  console.log('h1:', r.headings.filter((h) => h.tag === 'H1').length, 'landmarks:', JSON.stringify(r.landmarks));
}
