// Shared shell on a stub page: announcement bar, solid header, footer.
import { open, roundDir, scrollTo, sleep } from './review-lib.mjs';
const out = roundDir(undefined, 'shell');
for (const device of ['desktop', 'mobile']) {
  const { browser, page, logs } = await open('/ueber-uns', device);
  await page.screenshot({ path: `${out}/ueber-${device}-top.png` });
  const m = await page.evaluate(() => {
    const px = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { y: Math.round(r.top + scrollY), h: Math.round(r.height * 10) / 10, w: Math.round(r.width), pos: cs.position, bg: cs.backgroundColor, bgImage: cs.backgroundImage.slice(0, 120), fs: cs.fontSize, fw: cs.fontWeight, color: cs.color, borderB: cs.borderBottom }; };
    const header = document.querySelector('header');
    const bar = [...document.querySelectorAll('body *')].find((e) => /Individuell angepasst von Physiotherapeuten/.test(e.textContent) && getComputedStyle(e).backgroundImage.includes('gradient'));
    const track = bar ? [...bar.querySelectorAll('*')].find((e) => getComputedStyle(e).animationName !== 'none') : null;
    const tcs = track ? getComputedStyle(track) : null;
    const items = bar ? [...bar.querySelectorAll('li, span, p')].filter((e) => e.children.length === 0 && e.textContent.trim().length > 3).slice(0, 8).map((e) => ({ t: e.textContent.trim().slice(0, 50), fs: getComputedStyle(e).fontSize, fw: getComputedStyle(e).fontWeight })) : [];
    return {
      title: document.title,
      h1: document.querySelector('h1')?.textContent,
      bar: px(bar),
      barAria: bar ? { role: bar.getAttribute('role'), label: bar.getAttribute('aria-label'), hidden: bar.getAttribute('aria-hidden') } : null,
      anim: tcs ? { name: tcs.animationName, dur: tcs.animationDuration, timing: tcs.animationTimingFunction, iter: tcs.animationIterationCount } : null,
      items,
      header: px(header),
      headerInner: px(header?.firstElementChild),
      activeNav: [...document.querySelectorAll('header nav a')].map((a) => ({ t: a.textContent.trim(), cur: a.getAttribute('aria-current') })),
      mainTop: Math.round(document.querySelector('main').getBoundingClientRect().top + scrollY),
    };
  });
  console.log(device, JSON.stringify(m, null, 1));
  console.log(device, 'logs', JSON.stringify(logs));
  if (device === 'desktop') {
    await page.screenshot({ path: `${out}/ueber-desktop-header-clip.png`, clip: { x: 0, y: 0, width: 1440, height: 160 } });
    await scrollTo(page, 300, 900);
    await page.screenshot({ path: `${out}/ueber-desktop-scrolled.png`, clip: { x: 0, y: 0, width: 1440, height: 160 } });
    const st = await page.evaluate(() => { const h = document.querySelector('header'); const r = h.getBoundingClientRect(); return { top: r.top, h: r.height, pos: getComputedStyle(h).position }; });
    console.log('scrolled header', JSON.stringify(st));
  }
  const docH = await page.evaluate(() => document.documentElement.scrollHeight);
  await scrollTo(page, docH, 1200);
  await page.screenshot({ path: `${out}/ueber-${device}-bottom.png` });
  await page.screenshot({ path: `${out}/ueber-${device}-full.png`, fullPage: true });
  await browser.close();
}
