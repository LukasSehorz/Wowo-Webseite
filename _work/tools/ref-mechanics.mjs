#!/usr/bin/env node
// Probes scroll mechanics on the reference homepage: reveal animations (WAAPI introspection + frame burst),
// sticky header state changes, hero/section parallax, footer parallax.
// Usage: node ref-mechanics.mjs [--device desktop|mobile] [--url https://move.one/] [--out ../reference/motion]
import { join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { openSession, gotoReady, dismissPopups, sleep, parseArgs, pageHeight } from './ref-lib.mjs';

const { opt } = parseArgs();
const device = opt('device', 'desktop');
const url = opt('url', 'https://move.one/');
const out = opt('out', '../reference/motion');
const tag = opt('name', 'home');
mkdirSync(out, { recursive: true });
const result = {};

const { browser, page, cfg } = await openSession(device);
await gotoReady(page, url, { settle: 2500 });
await dismissPopups(page);

// helper run in page: describe running animations
const animSnapshot = () =>
  page.evaluate(() => {
    const desc = (el) => {
      if (!el) return '';
      const cls = (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || '').toString().slice(0, 70);
      return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id.slice(0, 30) : ''}.${cls}`;
    };
    return document.getAnimations().map((a) => {
      const e = a.effect;
      const t = e && e.getTiming ? e.getTiming() : {};
      const c = e && e.getComputedTiming ? e.getComputedTiming() : {};
      const kf = e && e.getKeyframes ? e.getKeyframes().map((k) => ({ offset: k.offset, transform: k.transform, opacity: k.opacity, easing: k.easing, height: k.height, clipPath: k.clipPath })) : [];
      const target = e ? e.target : null;
      return {
        type: a.constructor.name,
        name: a.animationName || a.transitionProperty || a.id || '',
        target: desc(target),
        text: target ? (target.innerText || '').replace(/\s+/g, ' ').slice(0, 40) : '',
        playState: a.playState,
        duration: t.duration,
        delay: t.delay,
        easing: t.easing,
        iterations: t.iterations,
        fill: t.fill,
        progress: c.progress,
        timeline: a.timeline ? a.timeline.constructor.name : '',
        kf: kf.slice(0, 4),
      };
    });
  });

// ---------- 0) animations running at rest on top of page (marquee, videos etc.)
result.atRest = await animSnapshot();

// ---------- A) HEADER STATES
const headerState = () =>
  page.evaluate(() => {
    const sec = document.querySelector('.header-section');
    const header = document.querySelector('header.header');
    const hcs = getComputedStyle(header);
    const before = getComputedStyle(header, '::before');
    const link = header.querySelector('.header__menu a, nav a, .menu__item');
    const logoImgs = [...header.querySelectorAll('.header__logo img, .header__logo svg')].map((i) => {
      const cs = getComputedStyle(i);
      return { cls: (i.className.baseVal ?? i.className).toString().slice(0, 60), op: cs.opacity, vis: cs.visibility, display: cs.display, filter: cs.filter, w: Math.round(i.getBoundingClientRect().width) };
    });
    const r = header.getBoundingClientRect();
    return {
      scrollY: Math.round(scrollY),
      sectionClass: sec.className.replace('shopify-section shopify-section-group-header-group ', ''),
      sectionTransform: getComputedStyle(sec).transform,
      headerTop: Math.round(r.top),
      headerH: Math.round(r.height * 10) / 10,
      padding: `${hcs.paddingTop} / ${hcs.paddingBottom}`,
      color: hcs.color,
      bg: hcs.backgroundColor,
      beforeBg: before.backgroundColor,
      beforeOpacity: before.opacity,
      beforeHeight: before.height,
      beforeTransition: before.transition.slice(0, 160),
      borderBottom: `${hcs.borderBottomWidth} ${hcs.borderBottomColor}`,
      boxShadow: hcs.boxShadow,
      linkColor: link ? getComputedStyle(link).color : '',
      logoImgs,
      stickyVar: getComputedStyle(document.documentElement).getPropertyValue('--sticky-header-height'),
    };
  });

result.header = [];
await page.evaluate(() => window.scrollTo(0, 0));
await sleep(600);
result.header.push({ step: 'top', ...(await headerState()) });
if (device === 'desktop') await page.mouse.move(cfg.viewport.width / 2, cfg.viewport.height / 2);
const wheel = async (dy, steps = 10, pause = 30) => {
  for (let i = 0; i < steps; i += 1) {
    if (device === 'desktop') await page.mouse.wheel(0, dy / steps);
    else await page.evaluate((d) => window.scrollBy(0, d), dy / steps);
    await sleep(pause);
  }
};
// small scroll below threshold
await wheel(60, 4);
await sleep(700);
result.header.push({ step: 'scroll60', ...(await headerState()) });
await page.screenshot({ path: join(out, `${tag}-${device}-header-1-scroll60.png`), clip: { x: 0, y: 0, width: cfg.viewport.width, height: 160 } });
// cross threshold; sample during transition
await wheel(140, 5, 16);
const trans = [];
for (let i = 0; i < 9; i += 1) {
  trans.push({ t: i * 80, ...(await headerState()) });
  if (i === 1 || i === 3 || i === 5) await page.screenshot({ path: join(out, `${tag}-${device}-header-2-transition-${i}.png`), clip: { x: 0, y: 0, width: cfg.viewport.width, height: 160 } });
  await sleep(80);
}
result.headerTransition = trans.map((t) => ({ t: t.t, scrollY: t.scrollY, cls: t.sectionClass, padding: t.padding, h: t.headerH, color: t.color, beforeBg: t.beforeBg, beforeOpacity: t.beforeOpacity, beforeHeight: t.beforeHeight }));
await sleep(800);
result.header.push({ step: 'scroll200-settled', ...(await headerState()) });
await page.screenshot({ path: join(out, `${tag}-${device}-header-3-scrolled.png`), clip: { x: 0, y: 0, width: cfg.viewport.width, height: 160 } });
// scroll down a lot -> hidden?
await wheel(1500, 40, 25);
await sleep(300);
result.header.push({ step: 'scrolling-down-1700', ...(await headerState()) });
await sleep(900);
result.header.push({ step: 'down-settled', ...(await headerState()) });
await page.screenshot({ path: join(out, `${tag}-${device}-header-4-after-scroll-down.png`), clip: { x: 0, y: 0, width: cfg.viewport.width, height: 160 } });
await wheel(-300, 10, 25);
await sleep(900);
result.header.push({ step: 'after-scroll-up-300', ...(await headerState()) });
await page.screenshot({ path: join(out, `${tag}-${device}-header-5-after-scroll-up.png`), clip: { x: 0, y: 0, width: cfg.viewport.width, height: 160 } });

// ---------- B) HERO PARALLAX PROBE
await page.evaluate(() => window.scrollTo(0, 0));
await sleep(800);
const heroProbe = () =>
  page.evaluate(() => {
    const first = document.querySelector('main .shopify-section, #MainContent .shopify-section');
    const media = first.querySelector('video, .banner__media img, img');
    const mediaWrap = first.querySelector('.banner__media, video-media, .media');
    const content = first.querySelector('.banner__content, .banner__box');
    const box = first.querySelector('.banner__box');
    const next = first.nextElementSibling;
    const nextInner = next ? next.querySelector('.section') : null;
    const tr = (el) => (el ? getComputedStyle(el).transform : '');
    const top = (el) => (el ? Math.round(el.getBoundingClientRect().top * 10) / 10 : null);
    const chain = [];
    let e = media;
    while (e && e !== first.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.transform !== 'none' || cs.position === 'sticky' || cs.position === 'fixed') chain.push({ el: e.tagName.toLowerCase() + '.' + (e.className || '').toString().slice(0, 40), transform: cs.transform, position: cs.position, top: cs.top });
      e = e.parentElement;
    }
    return { scrollY: Math.round(scrollY), sectionTop: top(first), mediaTop: top(media), mediaWrapTop: top(mediaWrap), contentTop: top(content), boxTop: top(box), nextTop: top(next), nextInnerTop: top(nextInner), mediaTransform: tr(media), wrapTransform: tr(mediaWrap), contentTransform: tr(content), boxTransform: tr(box), boxOpacity: box ? getComputedStyle(box).opacity : '', chain };
  });
result.heroParallax = [];
for (const y of [0, 100, 200, 300, 400, 500, 600, 700]) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
  await sleep(350);
  result.heroParallax.push(await heroProbe());
}

// ---------- C) REVEAL: jump to unrevealed section, log animations + frame burst
await page.evaluate(() => window.scrollTo(0, 0));
const revealTargets = await page.evaluate(() => {
  const secs = [...document.querySelectorAll('main .shopify-section, #MainContent .shopify-section')];
  return secs.map((s) => ({ id: s.id.replace(/^shopify-section-template--\d+__/, ''), top: Math.round(s.getBoundingClientRect().top + scrollY), h: Math.round(s.getBoundingClientRect().height) })).filter((s) => s.h > 100);
});
result.revealSections = revealTargets;
result.reveals = {};
// choose up to 4 sections below the fold (skip first)
const picks = revealTargets.filter((s) => s.top > cfg.viewport.height * 1.2).slice(0, 5);
for (const s of picks) {
  // pre-state (before it was ever in view)
  const pre = await page.evaluate((id) => {
    const sec = document.querySelector(`[id$="__${id}"]`);
    const els = [...sec.querySelectorAll('animate-element, [data-animate], motion-list .card, split-words, .card, picture[is="animate-picture"]')].slice(0, 14);
    return els.map((el) => {
      const cs = getComputedStyle(el);
      return { el: el.tagName.toLowerCase() + '.' + (el.className || '').toString().slice(0, 50), animate: el.getAttribute('data-animate'), delay: el.getAttribute('data-animate-delay'), opacity: cs.opacity, transform: cs.transform, visibility: cs.visibility };
    });
  }, s.id);
  const y = Math.max(0, s.top - Math.round(cfg.viewport.height * 0.35));
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
  const t0 = Date.now();
  const snaps = [];
  let frame = 0;
  while (Date.now() - t0 < 2000) {
    const t = Date.now() - t0;
    if (frame < 12) await page.screenshot({ path: join(out, `${tag}-${device}-reveal-${s.id.slice(0, 24)}-f${String(frame).padStart(2, '0')}.png`), type: 'png' });
    if (frame === 1 || frame === 4) snaps.push({ t, anims: (await animSnapshot()).filter((a) => a.playState === 'running' && a.timeline !== 'ScrollTimeline') });
    frame += 1;
    await sleep(60);
  }
  result.reveals[s.id] = { scrolledTo: y, pre, snaps };
}

// ---------- D) FOOTER PARALLAX
const h = await pageHeight(page);
const footerProbe = () =>
  page.evaluate(() => {
    const fp = [...document.querySelectorAll('[is="footer-parallax"]')];
    const overlay = document.querySelector('parallax-overlay');
    const fg = document.querySelector('footer, .footer-group');
    return {
      scrollY: Math.round(scrollY),
      footerGroupTop: fg ? Math.round(fg.getBoundingClientRect().top) : null,
      parts: fp.map((el) => ({ cls: el.className.slice(0, 60), top: Math.round(el.getBoundingClientRect().top), h: Math.round(el.getBoundingClientRect().height), transform: getComputedStyle(el).transform })),
      overlay: overlay ? { h: getComputedStyle(overlay).height, bg: getComputedStyle(overlay).backgroundColor, op: getComputedStyle(overlay).opacity, cls: overlay.className.slice(0, 80) } : null,
    };
  });
result.footerParallax = [];
for (const back of [900, 700, 500, 350, 200, 100, 0]) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), h - cfg.viewport.height - back);
  await sleep(350);
  result.footerParallax.push({ fromBottom: back, ...(await footerProbe()) });
  if ([500, 200, 0].includes(back)) await page.screenshot({ path: join(out, `${tag}-${device}-footer-reveal-${String(back).padStart(3, '0')}.png`) });
}

writeFileSync(join(out, `${tag}-${device}-mechanics.json`), JSON.stringify(result, null, 1));
await browser.close();
console.log('mechanics done ->', join(out, `${tag}-${device}-mechanics.json`));
