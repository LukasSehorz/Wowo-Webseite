#!/usr/bin/env node
// Scripted interaction evidence on move.one: desktop dropdown, mobile menu drawer, accordion, slider, product scroll sequence, insole finder.
// Usage: node ref-interact.mjs --scenario <dropdown|mobilemenu|accordion|ugc|scrollseq|finder|mobileslider|stickybar> [--out ../reference/motion/interact]
import { join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { openSession, gotoReady, dismissPopups, preScroll, sleep, parseArgs } from './ref-lib.mjs';

const { opt } = parseArgs();
const scenario = opt('scenario');
const out = opt('out', '../reference/motion/interact');
mkdirSync(out, { recursive: true });

async function burst(page, prefix, ms, { clip = null, everyMs = 0 } = {}) {
  const t0 = Date.now();
  const times = [];
  let i = 0;
  while (Date.now() - t0 < ms) {
    const t = Date.now() - t0;
    await page.screenshot({ path: join(out, `${prefix}-f${String(i).padStart(2, '0')}.png`), ...(clip ? { clip } : {}) });
    times.push(t);
    i += 1;
    if (everyMs) await sleep(everyMs);
  }
  return times;
}
function sheet(prefix, cols, tileW) {
  try {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-i', join(out, `${prefix}-f%02d.png`), '-vf', `scale=${tileW}:-1,tile=${cols}x${cols}:padding=6:margin=6:color=0x222222`, '-frames:v', '1', join(out, `${prefix}-sheet.png`)]);
  } catch (e) {
    console.log('sheet failed', e.message.slice(0, 200));
  }
}
const runningAnims = (page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.playState === 'running' && !(a.timeline && a.timeline.constructor.name === 'ScrollTimeline'))
      .map((a) => {
        const e = a.effect;
        const t = e.getTiming();
        const el = e.target;
        return {
          type: a.constructor.name,
          prop: a.transitionProperty || a.animationName || '',
          target: el ? `${el.tagName.toLowerCase()}.${(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || '').toString().slice(0, 60)}` : '',
          duration: t.duration,
          delay: t.delay,
          easing: t.easing,
          kf: e.getKeyframes().map((k) => ({ transform: k.transform, opacity: k.opacity, height: k.height, clipPath: k.clipPath, visibility: k.visibility })).slice(0, 3),
        };
      }),
  );
const result = { scenario };

if (scenario === 'dropdown') {
  const { browser, page, cfg } = await openSession('desktop');
  await gotoReady(page, 'https://move.one/');
  await dismissPopups(page);
  const summary = page.locator('header details[is="details-dropdown"] > summary').first();
  const box = await summary.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 30);
  await sleep(300);
  const clip = { x: 0, y: 0, width: cfg.viewport.width, height: 420 };
  await page.screenshot({ path: join(out, 'dropdown-0-before.png'), clip });
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 2 });
  await sleep(40);
  result.anims = await runningAnims(page);
  result.times = await burst(page, 'dropdown-open', 900, { clip });
  await sleep(600);
  await page.screenshot({ path: join(out, 'dropdown-1-open.png'), clip });
  result.dropdown = await page.evaluate(() => {
    const d = document.querySelector('header details[is="details-dropdown"] .dropdown');
    const c = d.querySelector('.dropdown__container');
    const cs = getComputedStyle(d);
    const ccs = getComputedStyle(c);
    const r = d.getBoundingClientRect();
    const cr = c.getBoundingClientRect();
    const a = d.querySelector('a');
    const acs = getComputedStyle(a);
    const header = document.querySelector('header.header');
    return {
      rect: [r.x, r.y, r.width, r.height].map(Math.round),
      containerRect: [cr.x, cr.y, cr.width, cr.height].map(Math.round),
      bg: cs.backgroundColor,
      containerBg: ccs.backgroundColor,
      radius: cs.borderBottomLeftRadius + ' / container ' + ccs.borderBottomLeftRadius,
      padding: cs.padding + ' / container ' + ccs.padding,
      shadow: cs.boxShadow + ' / ' + ccs.boxShadow,
      transition: cs.transition.slice(0, 260),
      containerTransition: ccs.transition.slice(0, 200),
      link: { fs: acs.fontSize, fw: acs.fontWeight, color: acs.color, lh: acs.lineHeight },
      headerColorWhileOpen: getComputedStyle(header).color,
      headerBeforeOpacity: getComputedStyle(header, '::before').opacity,
      bodyClass: document.body.className,
      htmlClass: document.documentElement.className,
    };
  });
  // nav item hover (magnet) on a plain link
  const sci = page.locator('header nav a.menu__item', { hasText: 'Science' }).first();
  const sb = await sci.boundingBox();
  await page.mouse.move(sb.x + sb.width * 0.8, sb.y + sb.height * 0.7, { steps: 4 });
  await sleep(700);
  result.navHover = await sci.evaluate((el) => {
    const t = el.querySelector('.btn-text');
    const after = getComputedStyle(t, '::after');
    return { linkTransform: getComputedStyle(el).transform, textTransform: getComputedStyle(t).transform, afterContent: after.content, afterBg: after.backgroundColor, afterW: after.width, afterH: after.height, afterTransform: after.transform, afterOpacity: after.opacity, afterTransition: after.transition.slice(0, 160), afterBottom: after.bottom, afterBorderRadius: after.borderRadius };
  });
  await page.screenshot({ path: join(out, 'dropdown-2-navitem-hover.png'), clip: { x: 380, y: 0, width: 700, height: 100 } });
  sheet('dropdown-open', 3, 640);
  await browser.close();
}

if (scenario === 'mobilemenu') {
  const { browser, page, cfg } = await openSession('mobile');
  await gotoReady(page, 'https://move.one/');
  await dismissPopups(page);
  await page.screenshot({ path: join(out, 'mobilemenu-0-closed.png') });
  const btn = page.locator('header .header__icons--end button.menu-drawer-button, header button.menu-drawer-button').last();
  await btn.tap();
  await sleep(30);
  result.animsOpen = await runningAnims(page);
  result.times = await burst(page, 'mobilemenu-open', 1100);
  await sleep(700);
  await page.screenshot({ path: join(out, 'mobilemenu-1-open.png') });
  result.drawer = await page.evaluate(() => {
    const d = document.querySelector('#MenuDrawer');
    const inner = d.querySelector('.drawer__inner');
    const overlay = d.querySelector('overlay-element, .overlay');
    const cs = getComputedStyle(inner);
    const r = inner.getBoundingClientRect();
    const ocs = overlay ? getComputedStyle(overlay) : null;
    const items = [...d.querySelectorAll('.drawer__menu-item, .drawer__menu a, .drawer__menu summary')].filter((e) => e.getBoundingClientRect().height > 0).slice(0, 8);
    return {
      cls: d.className,
      innerRect: [r.x, r.y, r.width, r.height].map(Math.round),
      innerBg: cs.backgroundColor,
      innerRadius: cs.borderTopLeftRadius + ' ' + cs.borderTopRightRadius + ' ' + cs.borderBottomRightRadius + ' ' + cs.borderBottomLeftRadius,
      innerTransition: cs.transition.slice(0, 240),
      innerTransform: cs.transform,
      overlay: ocs ? { bg: ocs.backgroundColor, op: ocs.opacity, backdrop: ocs.backdropFilter, transition: ocs.transition.slice(0, 200) } : null,
      items: items.map((e) => {
        const ics = getComputedStyle(e);
        const ir = e.getBoundingClientRect();
        return { text: e.innerText.trim().slice(0, 24), fs: ics.fontSize, fw: ics.fontWeight, ls: ics.letterSpacing, lh: ics.lineHeight, h: Math.round(ir.height), top: Math.round(ir.top), pad: ics.padding, borderBottom: ics.borderBottomWidth + ' ' + ics.borderBottomColor };
      }),
      html: d.outerHTML.replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>').replace(/\s+/g, ' ').slice(0, 2600),
    };
  });
  // open sub menu
  const sub = page.locator('#MenuDrawer summary, #MenuDrawer [aria-haspopup], #MenuDrawer button').filter({ hasText: 'Shop Insoles' }).first();
  try {
    await sub.tap({ timeout: 3000 });
    await sleep(30);
    result.animsSub = await runningAnims(page);
    await burst(page, 'mobilemenu-sub', 800);
    await sleep(500);
    await page.screenshot({ path: join(out, 'mobilemenu-2-submenu.png') });
    sheet('mobilemenu-sub', 3, 300);
  } catch (e) {
    result.subError = e.message.slice(0, 160);
  }
  sheet('mobilemenu-open', 4, 300);
  await browser.close();
}

if (scenario === 'accordion') {
  for (const dev of ['desktop', 'mobile']) {
    const { browser, page, cfg } = await openSession(dev);
    await gotoReady(page, 'https://move.one/pages/move-faqs');
    await dismissPopups(page);
    await preScroll(page);
    const items = page.locator('main details');
    const n = await items.count();
    const first = items.nth(1);
    await first.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -200));
    await sleep(600);
    await page.screenshot({ path: join(out, `accordion-${dev}-0-closed.png`) });
    const summary = first.locator('summary');
    if (dev === 'mobile') await summary.tap();
    else await summary.click();
    await sleep(30);
    const anims = await runningAnims(page);
    const times = await burst(page, `accordion-${dev}-open`, 800);
    await sleep(600);
    await page.screenshot({ path: join(out, `accordion-${dev}-1-open.png`) });
    const styles = await first.evaluate((d) => {
      const s = d.querySelector('summary');
      const c = d.querySelector('summary + *');
      const scs = getComputedStyle(s);
      const ccs = getComputedStyle(c);
      const dcs = getComputedStyle(d);
      const icon = s.querySelector('svg, .icon');
      const wrap = d.closest('.accordion, .faq, [class*="accordion"]') || d.parentElement;
      const wcs = getComputedStyle(wrap);
      const p = c.querySelector('p') || c;
      const pcs = getComputedStyle(p);
      return {
        count: document.querySelectorAll('main details').length,
        detailsCls: d.className,
        detailsBorder: `${dcs.borderTopWidth} ${dcs.borderTopColor} / bottom ${dcs.borderBottomWidth} ${dcs.borderBottomColor}`,
        detailsBg: dcs.backgroundColor,
        detailsRadius: dcs.borderTopLeftRadius,
        detailsPad: dcs.padding,
        summary: { fs: scs.fontSize, fw: scs.fontWeight, lh: scs.lineHeight, ls: scs.letterSpacing, pad: scs.padding, h: Math.round(s.getBoundingClientRect().height), color: scs.color, cls: s.className },
        icon: icon ? { cls: (icon.className.baseVal ?? icon.className).toString(), w: Math.round(icon.getBoundingClientRect().width), transform: getComputedStyle(icon).transform, transition: getComputedStyle(icon).transition.slice(0, 120) } : null,
        content: { pad: ccs.padding, fs: pcs.fontSize, lh: pcs.lineHeight, color: pcs.color, maxW: pcs.maxWidth, h: Math.round(c.getBoundingClientRect().height), cls: c.className },
        wrap: { cls: wrap.className.toString().slice(0, 120), w: Math.round(wrap.getBoundingClientRect().width), bg: wcs.backgroundColor, radius: wcs.borderTopLeftRadius, pad: wcs.padding, border: `${wcs.borderTopWidth} ${wcs.borderTopColor}`, shadow: wcs.boxShadow },
        html: d.outerHTML.replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>').replace(/\s+/g, ' ').slice(0, 900),
      };
    });
    result[dev] = { n, anims, times, styles };
    sheet(`accordion-${dev}-open`, 3, dev === 'mobile' ? 300 : 640);
    await browser.close();
  }
}

if (scenario === 'ugc') {
  const { browser, page, cfg } = await openSession('desktop');
  await gotoReady(page, 'https://move.one/');
  await dismissPopups(page);
  await preScroll(page);
  const sec = page.locator('[id$="17588640146bba9d65"]');
  await sec.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 250));
  await sleep(1500);
  await page.screenshot({ path: join(out, 'ugc-0-initial.png') });
  result.structure = await page.evaluate(() => {
    const sec = document.querySelector('[id$="17588640146bba9d65"]');
    const host = [...sec.querySelectorAll('*')].find((e) => e.shadowRoot);
    const root = host ? host.shadowRoot : sec;
    const cards = [...root.querySelectorAll('[class*="slide"], [class*="card"], li, article')].filter((e) => e.getBoundingClientRect().width > 150 && e.getBoundingClientRect().height > 300).slice(0, 6);
    const btns = [...root.querySelectorAll('button')].filter((b) => b.getBoundingClientRect().width > 0).slice(0, 8);
    return {
      host: host ? host.tagName.toLowerCase() + '.' + host.className : 'none',
      cards: cards.map((c) => {
        const r = c.getBoundingClientRect();
        const cs = getComputedStyle(c);
        return { cls: c.className.toString().slice(0, 60), w: Math.round(r.width), h: Math.round(r.height), left: Math.round(r.left), radius: cs.borderTopLeftRadius, overflow: cs.overflow };
      }),
      btns: btns.map((b) => {
        const r = b.getBoundingClientRect();
        const cs = getComputedStyle(b);
        return { label: b.getAttribute('aria-label') || b.innerText.slice(0, 20), w: Math.round(r.width), h: Math.round(r.height), left: Math.round(r.left), top: Math.round(r.top), bg: cs.backgroundColor, radius: cs.borderTopLeftRadius, color: cs.color };
      }),
    };
  });
  const next = page.locator('[id$="17588640146bba9d65"] button[aria-label*="ext" i]').first();
  try {
    await next.click({ timeout: 3000 });
    result.times = await burst(page, 'ugc-next', 900);
    await sleep(500);
    await page.screenshot({ path: join(out, 'ugc-1-after-next.png') });
    sheet('ugc-next', 3, 640);
  } catch (e) {
    result.nextError = e.message.slice(0, 200);
  }
  await browser.close();
}

if (scenario === 'scrollseq') {
  for (const dev of ['desktop', 'mobile']) {
    const { browser, page, cfg } = await openSession(dev);
    await gotoReady(page, 'https://move.one/products/game-day-pro-performance-insoles');
    await dismissPopups(page);
    await preScroll(page, { step: 0.5, pause: 250 });
    const info = await page.evaluate(() => {
      // find the tallest section in main: the scroll sequence
      const secs = [...document.querySelectorAll('main .shopify-section')].map((s) => ({ s, h: s.getBoundingClientRect().height, top: s.getBoundingClientRect().top + scrollY }));
      secs.sort((a, b) => b.h - a.h);
      const { s, h, top } = secs[0];
      const sticky = [...s.querySelectorAll('*')].filter((e) => getComputedStyle(e).position === 'sticky').map((e) => ({ el: e.tagName.toLowerCase() + '.' + e.className.toString().slice(0, 80), top: getComputedStyle(e).top, h: Math.round(e.getBoundingClientRect().height) }));
      const canv = [...s.querySelectorAll('canvas, video, img')].map((e) => ({ tag: e.tagName.toLowerCase(), cls: e.className.toString().slice(0, 60), src: (e.currentSrc || e.src || '').split('?')[0].split('/').pop().slice(0, 60), w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height) }));
      const customEls = [...new Set([...s.querySelectorAll('*')].filter((e) => e.tagName.includes('-')).map((e) => e.tagName.toLowerCase()))];
      return { id: s.id, top: Math.round(top), h: Math.round(h), sticky, mediaCount: canv.length, media: canv.slice(0, 8), customEls, html: s.innerHTML.replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>').replace(/srcset="[^"]*"/g, '').replace(/\s+/g, ' ').slice(0, 3000) };
    });
    result[dev] = info;
    const vh = cfg.viewport.height;
    const steps = 12;
    for (let i = 0; i <= steps; i += 1) {
      const y = Math.round(info.top - vh * 0.2 + ((info.h - vh * 0.6) * i) / steps);
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
      await sleep(450);
      await page.screenshot({ path: join(out, `scrollseq-${dev}-f${String(i).padStart(2, '0')}.png`) });
    }
    sheet(`scrollseq-${dev}`, 4, dev === 'mobile' ? 300 : 560);
    await browser.close();
  }
}

if (scenario === 'finder') {
  for (const dev of ['desktop', 'mobile']) {
    const { browser, page } = await openSession(dev);
    await gotoReady(page, 'https://move.one/pages/insole-finder');
    await dismissPopups(page);
    await sleep(800);
    await page.screenshot({ path: join(out, `finder-${dev}-0-step1.png`), fullPage: true });
    const info = await page.evaluate(() => {
      const main = document.querySelector('main');
      const opts = [...main.querySelectorAll('button, [role="button"], label, .option, [class*="option"], [class*="card"]')].filter((e) => e.getBoundingClientRect().width > 80 && e.getBoundingClientRect().height > 40).slice(0, 12);
      return {
        opts: opts.map((o) => {
          const cs = getComputedStyle(o);
          const r = o.getBoundingClientRect();
          return { tag: o.tagName.toLowerCase(), cls: o.className.toString().slice(0, 80), text: o.innerText.replace(/\s+/g, ' ').slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, border: `${cs.borderTopWidth} ${cs.borderTopColor}`, radius: cs.borderTopLeftRadius, pad: cs.padding, fs: cs.fontSize, fw: cs.fontWeight, transition: cs.transition.slice(0, 120) };
        }),
        styleBlocks: [...document.querySelectorAll('main style')].map((s) => s.textContent.length),
      };
    });
    result[dev] = info;
    // click first option of step 1, then first of step 2
    try {
      const o1 = page.locator('main button, main [role="button"]').filter({ hasText: /perform|game|sport|play|pain|comfort|everyday/i }).first();
      await o1.click({ timeout: 3000 });
      await sleep(900);
      await page.screenshot({ path: join(out, `finder-${dev}-1-step2.png`), fullPage: true });
      const o2 = page.locator('main button:visible, main [role="button"]:visible').filter({ hasText: /basketball|running|volleyball|walking|work/i }).first();
      await o2.click({ timeout: 3000 });
      await sleep(1200);
      await page.screenshot({ path: join(out, `finder-${dev}-2-result.png`), fullPage: true });
    } catch (e) {
      result[dev].clickError = e.message.slice(0, 200);
    }
    await browser.close();
  }
}

if (scenario === 'mobileslider') {
  const { browser, page } = await openSession('mobile');
  await gotoReady(page, 'https://move.one/');
  await dismissPopups(page);
  await preScroll(page);
  result.sliders = await page.evaluate(() => {
    const outList = [];
    for (const el of document.querySelectorAll('main *')) {
      const cs = getComputedStyle(el);
      if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 20) {
        const kids = [...el.children].filter((k) => k.getBoundingClientRect().width > 40);
        const k0 = kids[0] ? kids[0].getBoundingClientRect() : null;
        const k1 = kids[1] ? kids[1].getBoundingClientRect() : null;
        outList.push({
          section: (el.closest('.shopify-section') || {}).id?.replace(/^shopify-section-template--\d+__/, ''),
          el: el.tagName.toLowerCase() + '.' + el.className.toString().slice(0, 90),
          snap: cs.scrollSnapType,
          scrollPadding: cs.scrollPaddingLeft,
          gap: cs.columnGap,
          padL: cs.paddingLeft,
          marginL: cs.marginLeft,
          scrollbar: cs.scrollbarWidth,
          clientW: el.clientWidth,
          scrollW: el.scrollWidth,
          kids: kids.length,
          kidW: k0 ? Math.round(k0.width) : null,
          kidGap: k0 && k1 ? Math.round(k1.left - k0.right) : null,
          kidSnapAlign: kids[0] ? getComputedStyle(kids[0]).scrollSnapAlign : '',
          firstLeft: k0 ? Math.round(k0.left) : null,
        });
      }
    }
    return outList;
  });
  // indicators / dots / progress under sliders
  result.sliderUi = await page.evaluate(() => [...document.querySelectorAll('slider-dots, .slider-dots, progress-bar, .indicators, [class*="scrollbar"], [class*="slider__"]')].filter((e) => e.getBoundingClientRect().height > 0).slice(0, 10).map((e) => ({ el: e.tagName.toLowerCase() + '.' + e.className.toString().slice(0, 80), w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height) })));
  // swipe demo: scroll first slider by one card and screenshot
  const first = await page.evaluateHandle(() => [...document.querySelectorAll('main *')].find((el) => {
    const cs = getComputedStyle(el);
    return (cs.overflowX === 'auto' || cs.overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 20;
  }));
  await first.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await sleep(700);
  await page.screenshot({ path: join(out, 'mobileslider-0-start.png') });
  await first.evaluate((el) => el.scrollBy({ left: 200, behavior: 'smooth' }));
  await sleep(1200);
  await page.screenshot({ path: join(out, 'mobileslider-1-after-swipe.png') });
  result.afterSwipeScrollLeft = await first.evaluate((el) => el.scrollLeft);
  await browser.close();
}

writeFileSync(join(out, `${scenario}-report.json`), JSON.stringify(result, null, 1));
console.log('scenario done:', scenario);
