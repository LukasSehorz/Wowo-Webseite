import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const [name, opts] of [['normal', {}], ['reduced', { reducedMotion: 'reduce' }]]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE', ...opts });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__log = [];
    const t0 = performance.now();
    addEventListener('scroll', () => window.__log.push([Math.round(performance.now() - t0), Math.round(scrollY)]), { passive: true });
  });
  await page.goto('http://localhost:3100/#forschung', { waitUntil: 'load' });
  await page.waitForTimeout(6000);
  const s = await page.evaluate(() => ({ y: Math.round(scrollY), top: Math.round(document.querySelector('#forschung').getBoundingClientRect().top), log: window.__log.filter((_, i, a) => i < 6 || i > a.length - 4) }));
  console.log(name, JSON.stringify(s));
  // same-page navigation from another route via client link
  await page.goto('http://localhost:3100/ueber-uns', { waitUntil: 'networkidle' });
  const link = page.locator('footer a', { hasText: 'Zur Bestellanfrage' }).first();
  const href = await link.getAttribute('href');
  console.log(name, 'footer CTA href', href);
  await ctx.close();
}
await browser.close();
