// Verifies that the pressure-map canvas really changes between the two states on mobile and desktop.
import { open, roundDir, scrollTo, sleep } from './review-lib.mjs';

const out = roundDir(undefined, 'states');
for (const device of ['mobile', 'desktop']) {
  const { browser, page } = await open('/', device);
  const top = await page.evaluate(() => {
    const c = document.querySelector('#druckverteilung canvas');
    return Math.round(c.getBoundingClientRect().top + scrollY);
  });
  await scrollTo(page, top - 100, 4500);
  const canvases = await page.evaluate(() =>
    [...document.querySelectorAll('#druckverteilung canvas')].map((c) => {
      const r = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      return { w: c.width, h: c.height, cssW: r.width, cssH: r.height, filter: cs.filter, opacity: cs.opacity, pos: cs.position };
    }),
  );
  console.log(device, 'canvases', JSON.stringify(canvases));
  const hash = () =>
    page.evaluate(() => {
      const cs = [...document.querySelectorAll('#druckverteilung canvas')];
      return cs.map((c) => {
        const ctx = c.getContext('2d');
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        let sum = 0;
        // sample the medial arch region of the left foot: x 35–45 %, y 45–65 %
        let arch = 0;
        let n = 0;
        for (let y = Math.floor(c.height * 0.45); y < c.height * 0.65; y += 4) {
          for (let x = Math.floor(c.width * 0.33); x < c.width * 0.45; x += 4) {
            const i = (y * c.width + x) * 4;
            arch += d[i] + d[i + 1] + d[i + 2];
            n++;
          }
        }
        for (let i = 0; i < d.length; i += 4001) sum += d[i] + d[i + 1] + d[i + 2];
        return { sum, archMean: Math.round(arch / n) };
      });
    });
  const c = page.locator('#druckverteilung canvas').last();
  const readout = () => page.evaluate(() => [...document.querySelectorAll('#druckverteilung dd, #druckverteilung [class*="tabular"]')].map((e) => e.textContent.trim()).slice(0, 6));
  console.log(device, 'state with (after intro):', JSON.stringify(await hash()), JSON.stringify(await readout()));
  await c.screenshot({ path: `${out}/pressure-canvas-${device}-with.png` });
  const without = page.locator('#druckverteilung label', { hasText: 'Stiefel allein' }).first();
  if (device === 'mobile') await without.tap();
  else await without.click();
  await sleep(2800);
  console.log(device, 'state without:', JSON.stringify(await hash()), JSON.stringify(await readout()));
  await c.screenshot({ path: `${out}/pressure-canvas-${device}-without.png` });
  const withL = page.locator('#druckverteilung label', { hasText: 'Mit angeformter Einlage' }).first();
  if (device === 'mobile') await withL.tap();
  else await withL.click();
  await sleep(2800);
  console.log(device, 'state with (after toggle):', JSON.stringify(await hash()), JSON.stringify(await readout()));
  await c.screenshot({ path: `${out}/pressure-canvas-${device}-with-2.png` });
  await browser.close();
}
