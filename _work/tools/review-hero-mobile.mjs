import { open, roundDir, sleep } from './review-lib.mjs';
const out = roundDir(undefined, 'states');
for (const device of ['mobile', 'desktop']) {
  const { browser, page } = await open('/', device);
  await sleep(1500);
  const m = await page.evaluate(() => {
    const sec = document.querySelector('h1').closest('section');
    const imgs = [...sec.querySelectorAll('img')].map((i) => ({ src: decodeURIComponent(i.currentSrc).replace(/.*url=/, '').slice(0, 60), sizes: i.sizes, nw: i.naturalWidth, nh: i.naturalHeight, cssW: Math.round(i.getBoundingClientRect().width), cssH: Math.round(i.getBoundingClientRect().height), display: getComputedStyle(i).display, opacity: getComputedStyle(i).opacity }));
    const vids = [...sec.querySelectorAll('video')].map((v) => ({ src: v.currentSrc.slice(-40), w: v.videoWidth, h: v.videoHeight, paused: v.paused, poster: (v.poster || '').slice(-40), cssW: Math.round(v.getBoundingClientRect().width), cssH: Math.round(v.getBoundingClientRect().height) }));
    return { imgs, vids };
  });
  console.log(device, JSON.stringify(m, null, 1));
  await browser.close();
}
