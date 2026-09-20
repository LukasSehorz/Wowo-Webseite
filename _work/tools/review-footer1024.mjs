import { open, primeReveals, sleep } from './review-lib.mjs';
for (const w of [1024, 1440]) {
  const { browser, page } = await open('/', { viewport: { width: w, height: 900 }, deviceScaleFactor: 1, isMobile: false });
  await primeReveals(page);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await sleep(1200);
  const m = await page.evaluate(() => {
    const r = (el) => { const b = el.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), w: Math.round(b.width) }; };
    const pill = [...document.querySelectorAll('footer a')].find((a) => a.textContent.trim().startsWith('Zur Bestellanfrage'));
    const legal = [...document.querySelectorAll('footer a')].reverse().find((a) => a.textContent.trim() === 'Datenschutz');
    const kontakt = [...document.querySelectorAll('footer h2, footer h3, footer p')].find((e) => e.textContent.trim() === 'Kontakt');
    return { vw: innerWidth, pill: r(pill), legalRight: r(legal).r, kontaktCol: r(kontakt.parentElement), sw: document.documentElement.scrollWidth };
  });
  console.log(JSON.stringify(m));
  await browser.close();
}
