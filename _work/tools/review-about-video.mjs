import { open, scrollTo, sleep } from './review-lib.mjs';
const { browser, page, logs } = await open('/ueber-uns', 'desktop');
const reqs = [];
page.on('request', (r) => { if (/walk-bridge/.test(r.url())) reqs.push({ t: Date.now(), url: r.url().slice(-30), type: r.resourceType() }); });
page.on('requestfailed', (r) => { if (/walk-bridge/.test(r.url())) reqs.push({ t: Date.now(), url: r.url().slice(-30), failed: r.failure()?.errorText }); });
page.on('requestfinished', (r) => { if (/walk-bridge/.test(r.url())) reqs.push({ t: Date.now(), url: r.url().slice(-30), finished: true }); });
const h = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < h; y += 600) { await page.evaluate((t) => window.scrollTo(0, t), y); await sleep(250); }
await sleep(1500);
const v = await page.evaluate(() => [...document.querySelectorAll('video')].map((v) => ({ src: v.currentSrc.slice(-30), paused: v.paused, ready: v.readyState, w: v.videoWidth, err: v.error?.code, net: v.networkState, sources: [...v.querySelectorAll('source')].map((s) => s.src.slice(-30)), inView: (() => { const r = v.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; })() })));
console.log(JSON.stringify(v));
console.log(JSON.stringify(reqs));
console.log('failed logs', JSON.stringify(logs.failed));
await browser.close();
