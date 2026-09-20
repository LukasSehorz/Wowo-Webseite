import { open, sleep } from './review-lib.mjs';
for (const rm of [false, true]) {
  const { browser, page } = await open('/ueber-uns', 'desktop', rm ? { reducedMotion: 'reduce' } : {});
  const m = await page.evaluate(() => {
    const track = [...document.querySelectorAll('body *')].find((e) => getComputedStyle(e).animationName === 'marquee');
    const bar = [...document.querySelectorAll('body *')].find((e) => getComputedStyle(e).backgroundImage.includes('gradient') && /Individuell angepasst/.test(e.textContent));
    const groups = bar ? [...bar.querySelectorAll('ul, [aria-hidden]')].map((g) => ({ tag: g.tagName, hidden: g.getAttribute('aria-hidden'), n: g.children.length })) : [];
    const state = track ? getComputedStyle(track).animationPlayState : 'no track';
    const tr1 = track ? getComputedStyle(track).transform : null;
    return { state, tr1, groups: groups.slice(0, 6), barTag: bar?.tagName, barRole: bar?.getAttribute('role'), barLabel: bar?.getAttribute('aria-label'), pauseBtn: !!bar?.querySelector('button') };
  });
  await sleep(1000);
  const tr2 = await page.evaluate(() => { const t = [...document.querySelectorAll('body *')].find((e) => getComputedStyle(e).animationName === 'marquee'); return t ? getComputedStyle(t).transform : null; });
  console.log(rm ? 'reduced' : 'normal', JSON.stringify(m), 'after 1s', tr2);
  await browser.close();
}
