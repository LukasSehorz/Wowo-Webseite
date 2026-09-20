// Round 3 reverse copy check: every rendered line (desktop innerText incl. hidden helper texts) must exist in COPY.md.
import { readFileSync } from 'node:fs';
import { open, primeReveals, ROOT } from './review-lib.mjs';

const copyRaw = readFileSync(`${ROOT}/_work/COPY.md`, 'utf8');
const norm = (s) => s.replace(/[­⁠]/g, '').replace(/[  ]/g, ' ').replace(/\s+/g, ' ').replace(/[„“"]/g, '').trim().toLowerCase();
const copy = norm(copyRaw);
for (const path of ['/', '/ueber-uns', '/gutscheine']) {
  const { browser, page } = await open(path, 'desktop');
  await primeReveals(page, 600, 120);
  const lines = await page.evaluate(() => {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const p = n.parentElement;
      if (!p || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(p.tagName)) continue;
      const t = n.textContent.replace(/\s+/g, ' ').trim();
      if (t.length > 2) out.push(t);
    }
    for (const el of document.querySelectorAll('[aria-label]')) out.push('ARIA:' + el.getAttribute('aria-label'));
    for (const el of document.querySelectorAll('img[alt]')) if (el.alt) out.push('ALT:' + el.alt);
    for (const el of document.querySelectorAll('[placeholder]')) out.push('PH:' + el.getAttribute('placeholder'));
    return [...new Set(out)];
  });
  await browser.close();
  const unknown = [];
  for (const l of lines) {
    const bare = l.replace(/^(ARIA|ALT|PH):/, '');
    const n = norm(bare);
    if (n.length < 4) continue;
    if (/^[\d.,%€+−–\-\s:()a-z²]*$/.test(n) && n.length < 14) continue; // numbers, units
    if (copy.includes(n)) continue;
    // try without trailing punctuation and split at sentence boundaries
    const parts = n.split(/(?<=[.!?])\s+/).filter((p) => p.length > 3);
    const missing = parts.filter((p) => !copy.includes(p.replace(/[.!?]$/, '')));
    if (missing.length) unknown.push(l.slice(0, 160));
  }
  console.log(`\n== ${path}: ${lines.length} text nodes, ${unknown.length} not in COPY.md`);
  unknown.forEach((u) => console.log('  ?', u));
}
