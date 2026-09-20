import { open, scrollTo, sleep } from './review-lib.mjs';
const { browser, page } = await open('/', 'desktop');
const top = await page.evaluate(() => Math.round(document.querySelector('#forschung article').getBoundingClientRect().top + scrollY));
await scrollTo(page, top - 120, 1500);
const sl = () => page.evaluate(() => { let sc = document.querySelector('#forschung article').parentElement; while (sc && !/auto|scroll/.test(getComputedStyle(sc).overflowX)) sc = sc.parentElement; return { left: Math.round(sc.scrollLeft), cursor: getComputedStyle(sc).cursor, tag: sc.tagName, tabindex: sc.getAttribute('tabindex'), role: sc.getAttribute('role'), label: sc.getAttribute('aria-label') }; });
console.log('before', JSON.stringify(await sl()));
await page.mouse.move(900, 500);
await page.mouse.down();
await page.mouse.move(600, 500, { steps: 12 });
await sleep(100);
const mid = await sl();
await page.mouse.up();
await sleep(1200);
console.log('during drag', JSON.stringify(mid), 'after', JSON.stringify(await sl()));
// keyboard on scroller
await page.evaluate(() => { let sc = document.querySelector('#forschung article').parentElement; while (sc && !/auto|scroll/.test(getComputedStyle(sc).overflowX)) sc = sc.parentElement; sc.scrollTo({ left: 0, behavior: 'instant' }); sc.focus(); });
await sleep(500);
await page.keyboard.press('ArrowRight');
await sleep(1200);
console.log('after ArrowRight', JSON.stringify(await sl()));
// wheel horizontally
await page.mouse.move(700, 500);
await page.mouse.wheel(300, 0);
await sleep(1200);
console.log('after wheel-x', JSON.stringify(await sl()));
await browser.close();
