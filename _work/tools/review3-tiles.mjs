// Round 3: audience tiles — does a tap (mobile) / keyboard Enter (desktop) keep the fact panel open?
import { open, roundDir, sleep } from './review-lib.mjs';
const out = roundDir('round-3', 'states');

// mobile tap
{
  const { browser, page } = await open('/', 'mobile');
  const tile = page.locator('main button', { hasText: 'Handel und Verkauf' }).first();
  await tile.scrollIntoViewIfNeeded();
  await sleep(600);
  await page.evaluate(() => window.scrollBy(0, -200));
  await sleep(400);
  await tile.tap();
  await sleep(900);
  const st = await tile.evaluate((b) => {
    const card = b.closest('li, article, div[class*="group"]') || b.parentElement;
    const panel = card.querySelector('[id]:not(button)') || card.querySelector('p')?.parentElement;
    const cs = panel ? getComputedStyle(panel) : null;
    return { expanded: b.getAttribute('aria-expanded'), panelOpacity: cs?.opacity, panelTransform: cs?.transform, text: panel?.textContent.trim().slice(0, 50) };
  });
  console.log('mobile tap:', JSON.stringify(st));
  await page.screenshot({ path: `${out}/m-tile-tapped.png` });
  await page.touchscreen.tap(200, 100);
  await sleep(900);
  console.log('mobile tap outside → expanded', await tile.getAttribute('aria-expanded'));
  await browser.close();
}
// desktop keyboard
{
  const { browser, page } = await open('/', 'desktop');
  const tile = page.locator('main button', { hasText: 'Pflege und Medizin' }).first();
  await tile.scrollIntoViewIfNeeded();
  await sleep(600);
  await page.mouse.move(5, 5);
  await tile.focus();
  await page.keyboard.press('Enter');
  await sleep(900);
  console.log('desktop Enter → expanded', await tile.getAttribute('aria-expanded'));
  const b = await tile.evaluate((x) => { const r = (x.closest('li') || x.parentElement.parentElement).getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; });
  await page.screenshot({ path: `${out}/d-tile-keyboard-open.png`, clip: { x: b[0] - 6, y: b[1] - 6, width: b[2] + 12, height: b[3] + 12 } });
  await page.keyboard.press('Escape');
  await sleep(600);
  console.log('Escape → expanded', await tile.getAttribute('aria-expanded'));
  await browser.close();
}
