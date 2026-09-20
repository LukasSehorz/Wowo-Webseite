import { open } from './review-lib.mjs';
for (const p of ['/datenschutz', '/impressum']) {
  const { browser, page } = await open(p, 'desktop');
  const t = await page.evaluate(() => ({ h: [...document.querySelectorAll('main h1, main h2, main h3')].map((h) => h.tagName + ':' + h.textContent.trim()), placeholders: [...document.querySelectorAll('main *')].filter((e) => e.children.length === 0 && /Angabe folgt/.test(e.textContent)).length, maxW: getComputedStyle(document.querySelector('main h1').parentElement).maxWidth, text: document.querySelector('main').innerText.replace(/\s+/g, ' ').slice(0, 900) }));
  console.log(p, JSON.stringify(t, null, 1));
  await browser.close();
}
