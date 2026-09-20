// Round 3: mobile menu open sequence on Home (transparent header) and on /gutscheine (marquee + solid header), plus scrolled.
import { open, roundDir, scrollTo, sleep } from './review-lib.mjs';

const out = roundDir('round-3', 'states');
for (const [path, tag, y] of [['/', 'home', 0], ['/gutscheine', 'vouchers', 0], ['/gutscheine', 'vouchers-scrolled', 900]]) {
  const { browser, page } = await open(path, 'mobile');
  if (y) await scrollTo(page, y, 800);
  const burger = page.locator('header button[aria-expanded]').first();
  await burger.click();
  const shots = [80, 250, 700];
  let last = 0;
  for (const t of shots) {
    await sleep(t - last);
    last = t;
    await page.screenshot({ path: `${out}/m-menu-${tag}-t${t}.png` });
  }
  const info = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"], dialog, [data-menu]');
    const header = document.querySelector('header');
    const r = dialog?.getBoundingClientRect();
    const items = [...(dialog?.querySelectorAll('a') || [])].map((a) => a.textContent.trim());
    return { dialogTop: r ? Math.round(r.top) : null, headerBottom: Math.round(header.getBoundingClientRect().bottom), items, focus: document.activeElement?.getAttribute('aria-label') || document.activeElement?.tagName };
  });
  console.log(tag, JSON.stringify(info));
  await page.keyboard.press('Escape');
  await sleep(800);
  await page.screenshot({ path: `${out}/m-menu-${tag}-closed.png` });
  await browser.close();
}
