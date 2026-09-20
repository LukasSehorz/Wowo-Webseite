#!/usr/bin/env node
// Measures computed styles on a reference page: typography, sections, grids, media, buttons, header, root vars.
// Usage: node ref-measure.mjs --url <url> --name <name> --out <dir> [--device desktop|mobile|both]
import { join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { openSession, gotoReady, dismissPopups, preScroll, parseArgs, sleep } from './ref-lib.mjs';

const { opt } = parseArgs();
const url = opt('url');
const name = opt('name', 'page');
const out = opt('out', '../reference/data/measure');
const device = opt('device', 'both');
mkdirSync(out, { recursive: true });

async function run(dev) {
  const { browser, page } = await openSession(dev);
  await gotoReady(page, url);
  await dismissPopups(page);
  await preScroll(page, { step: 0.5, pause: 350 });
  await sleep(1500);

  const data = await page.evaluate(() => {
    const px = (v) => (v === 'normal' || v === 'none' || v === 'auto' ? v : Math.round(parseFloat(v) * 100) / 100);
    const vis = (el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return false;
      let e = el;
      while (e && e !== document.documentElement) {
        const cs = getComputedStyle(e);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        e = e.parentElement;
      }
      return true;
    };
    const sectionOf = (el) => {
      const s = el.closest('.shopify-section');
      if (!s) return '';
      return s.id.replace(/^shopify-section-/, '').replace(/^(template|sections)--\d+__/, '');
    };
    const ownText = (el) =>
      [...el.childNodes]
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    const clsOf = (el) => (el.className && el.className.baseVal !== undefined ? el.className.baseVal : (el.className || '').toString()).slice(0, 140);
    const rgb = (c) => c;

    // ---------- ROOT VARS ----------
    const rootCS = getComputedStyle(document.documentElement);
    const varNames = ['--page-width', '--page-padding', '--gap-padding', '--grid-gap', '--page-container', '--rounded-button', '--rounded-input', '--rounded-card', '--rounded-block', '--font-navigation-size', '--font-button-size', '--font-product-size', '--header-height', '--sticky-header-height', '--announcement-height', '--color-base-text', '--color-base-background', '--color-base-highlight', '--color-base-button', '--color-base-button-text', '--title-xs', '--title-sm', '--title-md', '--title-lg', '--title-xl', '--fluid-base', '--fluid-lg', '--fluid-xl', '--fluid-2xl'];
    const rootVars = {};
    for (const v of varNames) rootVars[v] = rootCS.getPropertyValue(v).trim();
    // resolve some vars to px via a probe element
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;';
    document.body.appendChild(probe);
    const resolved = {};
    for (const v of ['--page-padding', '--gap-padding', '--grid-gap', '--rounded-button', '--rounded-card', '--rounded-block', '--rounded-input', '--font-navigation-size', '--font-button-size', '--font-product-size']) {
      probe.style.width = `var(${v})`;
      resolved[v] = getComputedStyle(probe).width;
    }
    probe.remove();

    // ---------- TEXT ----------
    const texts = [];
    const seen = new Set();
    const candidates = document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,a,button,span,li,label,summary,dt,dd,div,input,textarea,select,blockquote,figcaption,strong,em,small');
    for (const el of candidates) {
      let t = el.matches('input,textarea') ? el.getAttribute('placeholder') || '' : ownText(el);
      if (!t || t.length < 2) continue;
      if (!vis(el)) continue;
      if (el.closest('[data-ref-hide], cookie-banner, [id^="alia"], .drawer:not(.is-open), quick-view, cart-drawer, search-drawer, menu-drawer')) continue;
      const cs = getComputedStyle(el);
      if (parseFloat(cs.opacity) === 0) continue;
      const r = el.getBoundingClientRect();
      const sig = [cs.fontFamily, cs.fontSize, cs.fontWeight, cs.lineHeight, cs.letterSpacing, cs.textTransform, cs.color, el.tagName, sectionOf(el)].join('|');
      const key = sig + '|' + t.slice(0, 30);
      if (seen.has(key)) continue;
      seen.add(key);
      // nearest heading-ish ancestor tag (words of split-words live in spans inside h2)
      const hAnc = el.closest('h1,h2,h3,h4,h5,h6');
      texts.push({
        section: sectionOf(el),
        tag: el.tagName.toLowerCase(),
        hTag: hAnc ? hAnc.tagName.toLowerCase() : '',
        cls: clsOf(el),
        pcls: el.parentElement ? clsOf(el.parentElement).slice(0, 100) : '',
        text: t.slice(0, 70),
        ff: cs.fontFamily.slice(0, 60),
        fs: px(cs.fontSize),
        fw: cs.fontWeight,
        lh: px(cs.lineHeight),
        lhRatio: cs.lineHeight === 'normal' ? 'normal' : Math.round((parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)) * 1000) / 1000,
        ls: px(cs.letterSpacing),
        lsEm: cs.letterSpacing === 'normal' ? 0 : Math.round((parseFloat(cs.letterSpacing) / parseFloat(cs.fontSize)) * 1000) / 1000,
        tt: cs.textTransform,
        color: rgb(cs.color),
        align: cs.textAlign,
        top: Math.round(r.top + scrollY),
        left: Math.round(r.left),
        w: Math.round(r.width),
      });
    }

    // ---------- HEADINGS (innerText based, catches split-words headings) ----------
    const headings = [];
    for (const el of document.querySelectorAll('h1,h2,h3,h4,h5,h6,.heading,[class*="title-"],.h1,.h2,.h3,.h4,.h5,.h6,.subheading,.subtext,[class*="subtext"],[class*="eyebrow"],[class*="caption"]')) {
      if (!vis(el)) continue;
      if (el.closest('cookie-banner, [id^="alia"], cart-drawer, search-drawer, menu-drawer, quick-view')) continue;
      const t = (el.innerText || '').replace(/\s+/g, ' ').trim();
      if (!t) continue;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const img = el.querySelector('img');
      headings.push({
        section: sectionOf(el),
        tag: el.tagName.toLowerCase(),
        cls: clsOf(el),
        text: t.slice(0, 80),
        ff: cs.fontFamily.slice(0, 60),
        fs: px(cs.fontSize),
        fw: cs.fontWeight,
        lh: px(cs.lineHeight),
        lhRatio: cs.lineHeight === 'normal' ? 'normal' : Math.round((parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)) * 1000) / 1000,
        ls: px(cs.letterSpacing),
        lsEm: cs.letterSpacing === 'normal' ? 0 : Math.round((parseFloat(cs.letterSpacing) / parseFloat(cs.fontSize)) * 1000) / 1000,
        tt: cs.textTransform,
        color: cs.color,
        align: cs.textAlign,
        mb: cs.marginBottom,
        mt: cs.marginTop,
        maxW: cs.maxWidth,
        w: Math.round(r.width),
        h: Math.round(r.height),
        lines: cs.lineHeight === 'normal' ? null : Math.round(r.height / parseFloat(cs.lineHeight)),
        top: Math.round(r.top + scrollY),
        left: Math.round(r.left),
        split: !!el.querySelector('split-words, .word'),
        bgClip: cs.webkitBackgroundClip || cs.backgroundClip,
        hasImg: !!img,
      });
    }
    // headline images (display type baked into PNG/SVG)
    const headlineImages = [];
    for (const img of document.querySelectorAll('.shopify-section img')) {
      if (!vis(img)) continue;
      const src = (img.currentSrc || img.src || '').split('?')[0].split('/').pop();
      const r = img.getBoundingClientRect();
      if (/\.png$|\.svg$|\.webp$/i.test(src) && r.width / r.height > 2.2 && r.width > 200) {
        headlineImages.push({ section: sectionOf(img), src: src.slice(0, 80), natural: `${img.naturalWidth}x${img.naturalHeight}`, w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top + scrollY), left: Math.round(r.left), alt: img.alt.slice(0, 60) });
      }
    }

    // ---------- SECTIONS ----------
    const bgOf = (el) => {
      // first non transparent background within 4 levels
      const queue = [[el, 0]];
      while (queue.length) {
        const [e, d] = queue.shift();
        const cs = getComputedStyle(e);
        const bc = cs.backgroundColor;
        const bi = cs.backgroundImage;
        const r = e.getBoundingClientRect();
        if (r.width > innerWidth * 0.6 && ((bc && bc !== 'rgba(0, 0, 0, 0)' && bc !== 'transparent') || (bi && bi !== 'none'))) return { color: bc, image: bi.slice(0, 160), on: e.tagName.toLowerCase() + '.' + clsOf(e).slice(0, 60) };
        if (d < 4) for (const c of e.children) queue.push([c, d + 1]);
      }
      return null;
    };
    const sections = [];
    for (const sec of document.querySelectorAll('.shopify-section')) {
      const r = sec.getBoundingClientRect();
      if (r.height < 1) {
        sections.push({ id: sectionOf(sec) || sec.id, h: 0 });
        continue;
      }
      const inner = sec.querySelector('.section, section, footer, header') || sec.firstElementChild;
      const ics = inner ? getComputedStyle(inner) : null;
      const pw = sec.querySelector('.page-width, .page-width--full, .container');
      let pwInfo = null;
      if (pw) {
        const pr = pw.getBoundingClientRect();
        const pcs = getComputedStyle(pw);
        pwInfo = { cls: clsOf(pw).slice(0, 80), left: Math.round(pr.left), w: Math.round(pr.width), padL: px(pcs.paddingLeft), padR: px(pcs.paddingRight), maxW: pcs.maxWidth, contentW: Math.round(pr.width - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight)) };
      }
      const scs = getComputedStyle(sec);
      sections.push({
        id: sectionOf(sec) || sec.id,
        top: Math.round(r.top + scrollY),
        h: Math.round(r.height),
        innerCls: inner ? clsOf(inner).slice(0, 120) : '',
        padTop: ics ? px(ics.paddingTop) : null,
        padBottom: ics ? px(ics.paddingBottom) : null,
        marginTop: ics ? px(ics.marginTop) : null,
        secMarginTop: px(scs.marginTop),
        secRadius: ics ? ics.borderTopLeftRadius + ' / ' + ics.borderBottomLeftRadius : '',
        secZ: scs.zIndex,
        secPos: scs.position,
        bg: bgOf(sec),
        vars: {
          padTopVar: scs.getPropertyValue('--section-padding-top').trim(),
          padBottomVar: scs.getPropertyValue('--section-padding-bottom').trim(),
          fg: scs.getPropertyValue('--color-foreground').trim(),
          bgv: scs.getPropertyValue('--color-background').trim(),
        },
        pageWidth: pwInfo,
      });
    }

    // ---------- GRIDS / FLEX ROWS ----------
    const grids = [];
    for (const el of document.querySelectorAll('.shopify-section *')) {
      const cs = getComputedStyle(el);
      if (!(cs.display === 'grid' || cs.display === 'inline-grid' || cs.display === 'flex')) continue;
      if (!vis(el)) continue;
      const kids = [...el.children].filter(vis);
      if (kids.length < 2) continue;
      const r = el.getBoundingClientRect();
      if (r.width < innerWidth * 0.5) continue;
      const kr = kids.map((k) => k.getBoundingClientRect());
      // same row check: at least 2 kids share a top
      const sameRow = kr.filter((k) => Math.abs(k.top - kr[0].top) < 4).length;
      if (cs.display === 'flex' && sameRow < 2) continue;
      if (kr[0].width < 80) continue;
      grids.push({
        section: sectionOf(el),
        tag: el.tagName.toLowerCase(),
        cls: clsOf(el),
        display: cs.display,
        cols: cs.display.includes('grid') ? cs.gridTemplateColumns.slice(0, 120) : '',
        colGap: cs.columnGap,
        rowGap: cs.rowGap,
        w: Math.round(r.width),
        left: Math.round(r.left),
        top: Math.round(r.top + scrollY),
        kids: kids.length,
        perRow: sameRow,
        kidW: kr.slice(0, 6).map((k) => Math.round(k.width)),
        kidH: kr.slice(0, 6).map((k) => Math.round(k.height)),
        kidGapPx: kr.length > 1 ? Math.round(kr[1].left - kr[0].right) : null,
      });
    }

    // ---------- MEDIA ----------
    const media = [];
    for (const el of document.querySelectorAll('.shopify-section img, .shopify-section video, .shopify-section iframe, .shopify-section svg.placeholder')) {
      if (!vis(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 90 || r.height < 60) continue;
      const cs = getComputedStyle(el);
      // find clipping ancestor with radius
      let e = el;
      let radius = cs.borderTopLeftRadius;
      let radiusOn = 'self';
      let hops = 0;
      while ((radius === '0px' || !radius) && e.parentElement && hops < 5) {
        e = e.parentElement;
        hops += 1;
        const pcs = getComputedStyle(e);
        if (pcs.borderTopLeftRadius !== '0px') {
          radius = pcs.borderTopLeftRadius + (pcs.borderBottomLeftRadius !== pcs.borderTopLeftRadius ? ` (bottom ${pcs.borderBottomLeftRadius})` : '');
          radiusOn = e.tagName.toLowerCase() + '.' + clsOf(e).slice(0, 50);
        }
      }
      const mediaWrap = el.closest('.media, figure, picture');
      const wr = mediaWrap ? mediaWrap.getBoundingClientRect() : r;
      media.push({
        section: sectionOf(el),
        tag: el.tagName.toLowerCase(),
        src: (el.currentSrc || el.src || '').split('?')[0].split('/').pop().slice(0, 60),
        natural: el.naturalWidth ? `${el.naturalWidth}x${el.naturalHeight}` : el.videoWidth ? `${el.videoWidth}x${el.videoHeight}` : '',
        w: Math.round(r.width),
        h: Math.round(r.height),
        ratio: Math.round((r.width / r.height) * 1000) / 1000,
        wrapW: Math.round(wr.width),
        wrapH: Math.round(wr.height),
        wrapRatio: Math.round((wr.width / wr.height) * 1000) / 1000,
        fit: cs.objectFit,
        pos: cs.objectPosition,
        radius,
        radiusOn,
        fullBleed: r.width >= innerWidth - 2,
        top: Math.round(r.top + scrollY),
        left: Math.round(r.left),
        video: el.tagName === 'VIDEO' ? { autoplay: el.autoplay, loop: el.loop, muted: el.muted, controls: el.controls, paused: el.paused, poster: !!el.poster, playsInline: el.playsInline, dur: Math.round(el.duration * 10) / 10 } : undefined,
      });
    }

    // ---------- OVERLAYS ----------
    const overlays = [];
    for (const el of document.querySelectorAll('.banner__overlay, [class*="overlay"], .card__overlay, .media__overlay')) {
      if (!vis(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 100 || r.height < 60) continue;
      const cs = getComputedStyle(el);
      const before = getComputedStyle(el, '::before');
      const after = getComputedStyle(el, '::after');
      overlays.push({ section: sectionOf(el), cls: clsOf(el), bg: cs.backgroundColor, bgImg: cs.backgroundImage.slice(0, 200), op: cs.opacity, beforeBg: before.backgroundColor + ' ' + before.backgroundImage.slice(0, 160) + ' op=' + before.opacity, afterBg: after.backgroundColor + ' ' + after.backgroundImage.slice(0, 160) + ' op=' + after.opacity, w: Math.round(r.width), h: Math.round(r.height) });
    }

    // ---------- BUTTONS / LINKS / PILLS ----------
    const comps = [];
    for (const el of document.querySelectorAll('.button, button, .link, a.reversed-link, [class*="badge"], [class*="pill"], [class*="tag"], [class*="rating"], input, textarea, select, summary, .btn')) {
      if (!vis(el)) continue;
      if (el.closest('cookie-banner, [id^="alia"], cart-drawer, search-drawer, menu-drawer, quick-view')) continue;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width < 16 || r.height < 12) continue;
      comps.push({
        section: sectionOf(el),
        tag: el.tagName.toLowerCase(),
        cls: clsOf(el),
        text: (el.innerText || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 40),
        w: Math.round(r.width),
        h: Math.round(r.height),
        pad: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
        radius: cs.borderTopLeftRadius,
        border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`,
        bg: cs.backgroundColor,
        bgImg: cs.backgroundImage.slice(0, 120),
        color: cs.color,
        fs: px(cs.fontSize),
        fw: cs.fontWeight,
        ls: px(cs.letterSpacing),
        tt: cs.textTransform,
        shadow: cs.boxShadow.slice(0, 100),
        backdrop: cs.backdropFilter || cs.webkitBackdropFilter || '',
        transition: cs.transition.slice(0, 200),
        top: Math.round(r.top + scrollY),
      });
    }

    // ---------- HEADER ----------
    const headerSec = document.querySelector('.header-section');
    const header = document.querySelector('header.header, .header-section header');
    const ann = document.querySelector('.topbar-section, announcement-bar, .announcement-bar');
    const hInfo = {};
    if (headerSec) {
      const cs = getComputedStyle(headerSec);
      const r = headerSec.getBoundingClientRect();
      hInfo.section = { cls: clsOf(headerSec), position: cs.position, top: cs.top, z: cs.zIndex, h: Math.round(r.height), bg: cs.backgroundColor, transition: cs.transition.slice(0, 200) };
    }
    if (header) {
      const cs = getComputedStyle(header);
      const r = header.getBoundingClientRect();
      hInfo.header = { cls: clsOf(header), attrs: [...header.attributes].map((a) => `${a.name}=${a.value.slice(0, 40)}`).join(' | '), h: Math.round(r.height), bg: cs.backgroundColor, color: cs.color, borderBottom: `${cs.borderBottomWidth} ${cs.borderBottomStyle} ${cs.borderBottomColor}`, padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`, display: cs.display, cols: cs.gridTemplateColumns, transition: cs.transition.slice(0, 200), backdrop: cs.backdropFilter };
      const logo = header.querySelector('.header__logo img, .header__logo svg');
      if (logo) {
        const lr = logo.getBoundingClientRect();
        hInfo.logo = { w: Math.round(lr.width), h: Math.round(lr.height), left: Math.round(lr.left) };
      }
      const navLinks = [...header.querySelectorAll('nav a, .header__menu a, .menu__item')].filter(vis).slice(0, 8);
      hInfo.nav = navLinks.map((a) => {
        const ncs = getComputedStyle(a);
        const nr = a.getBoundingClientRect();
        return { text: a.innerText.trim().slice(0, 30), fs: ncs.fontSize, fw: ncs.fontWeight, ls: ncs.letterSpacing, color: ncs.color, pad: `${ncs.paddingTop} ${ncs.paddingRight} ${ncs.paddingBottom} ${ncs.paddingLeft}`, left: Math.round(nr.left), w: Math.round(nr.width), h: Math.round(nr.height) };
      });
      const icons = [...header.querySelectorAll('.header__icons a, .header__icons button, .header__buttons a, .header__buttons button, [class*="header__icon"]')].filter(vis);
      hInfo.icons = icons.map((i) => {
        const ir = i.getBoundingClientRect();
        const svg = i.querySelector('svg');
        const sr = svg ? svg.getBoundingClientRect() : null;
        return { label: i.getAttribute('aria-label') || i.innerText.trim().slice(0, 20), w: Math.round(ir.width), h: Math.round(ir.height), left: Math.round(ir.left), svg: sr ? `${Math.round(sr.width)}x${Math.round(sr.height)}` : '' };
      });
    }
    if (ann) {
      const cs = getComputedStyle(ann);
      const r = ann.getBoundingClientRect();
      hInfo.announcement = { cls: clsOf(ann), h: Math.round(r.height), bg: cs.backgroundColor, bgImg: cs.backgroundImage.slice(0, 200), display: cs.display };
    }

    return {
      url: location.href,
      viewport: { w: innerWidth, h: innerHeight },
      docHeight: document.documentElement.scrollHeight,
      body: (() => {
        const cs = getComputedStyle(document.body);
        return { ff: cs.fontFamily, fs: cs.fontSize, lh: cs.lineHeight, color: cs.color, bg: cs.backgroundColor, attrs: [...document.body.attributes].map((a) => `${a.name}=${a.value.slice(0, 60)}`).join(' | ') };
      })(),
      rootVars,
      resolved,
      header: hInfo,
      sections,
      headings,
      headlineImages,
      texts,
      grids,
      media,
      overlays,
      comps,
    };
  });

  writeFileSync(join(out, `${name}-${dev}.json`), JSON.stringify(data, null, 1));
  console.log(`measured ${name} ${dev}: headings ${data.headings.length}, texts ${data.texts.length}, sections ${data.sections.length}, grids ${data.grids.length}, media ${data.media.length}, comps ${data.comps.length}`);
  await browser.close();
}

for (const d of device === 'both' ? ['desktop', 'mobile'] : [device]) await run(d);
