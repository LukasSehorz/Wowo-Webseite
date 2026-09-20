#!/usr/bin/env node
// Quick probe of several URLs: final URL, title, height, section types, headings. No screenshots.
import { openSession, gotoReady } from './ref-lib.mjs';
const urls = process.argv.slice(2);
const { browser, page } = await openSession('desktop');
for (const u of urls) {
  try {
    const resp = await gotoReady(page, u, { settle: 500 });
    const info = await page.evaluate(() => ({
      title: document.title,
      h: document.documentElement.scrollHeight,
      sections: [...document.querySelectorAll('main .shopify-section, #MainContent .shopify-section')].map((s) => s.id.replace(/^shopify-section-template--\d+__/, '').replace(/_[A-Za-z0-9]{6}$/, '')),
      heads: [...document.querySelectorAll('main h1, main h2')].map((h) => h.innerText.trim().replace(/\s+/g, ' ').slice(0, 60)).filter(Boolean).slice(0, 14),
    }));
    console.log(`\n### ${u}\n-> ${page.url()} [${resp?.status()}] "${info.title}" height=${info.h}\nsections: ${info.sections.join(' | ')}\nheads: ${info.heads.join(' | ')}`);
  } catch (e) {
    console.log(`\n### ${u} ERROR ${e.message.slice(0, 120)}`);
  }
}
await browser.close();
