import { open, sleep } from './review-lib.mjs';
const { browser, page } = await open('/', 'desktop');
for (const sel of ['header nav a:nth-of-type(2)', 'button[aria-label*="Video"]', 'button[aria-label="Nächste Studie"]']) {
  const el = page.locator(sel).first();
  if (!(await el.count())) { console.log(sel, 'not found'); continue; }
  await el.scrollIntoViewIfNeeded();
  await sleep(600);
  const b = await el.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 3 });
  await sleep(200);
  await page.mouse.move(b.x + b.width - 3, b.y + b.height - 3, { steps: 6 });
  await sleep(900);
  const tr = await el.evaluate((e) => {
    const out = [];
    let p = e;
    for (let i = 0; i < 3 && p; i++) { out.push(getComputedStyle(p).transform); p = p.parentElement; }
    const inner = [...e.querySelectorAll('*')].map((c) => getComputedStyle(c).transform).filter((t) => t !== 'none');
    return { chain: out, inner };
  });
  console.log(sel, JSON.stringify(tr));
  await page.mouse.move(5, 5);
  await sleep(400);
}
await browser.close();
