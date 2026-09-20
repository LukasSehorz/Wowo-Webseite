// Copy check: every text block of COPY.md sections 0 and 1 must appear verbatim on the home page.
import { readFileSync, writeFileSync } from 'node:fs';
import { open, primeReveals, roundDir, ROOT } from './review-lib.mjs';
const out = roundDir(undefined, 'data');
const path = process.argv[2] || '/';
const startMark = process.argv[3] || '## 0 Global';
const endMark = process.argv[4] || '## 2 Über uns';
const { browser, page } = await open(path, 'desktop');
await primeReveals(page);
const pageText = await page.evaluate(() => {
  const texts = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const p = n.parentElement;
    if (!p || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(p.tagName)) continue;
    texts.push(n.textContent);
  }
  const aria = [...document.querySelectorAll('[aria-label]')].map((e) => e.getAttribute('aria-label'));
  return { body: document.body.innerText, raw: texts.join(' '), aria };
});
await browser.close();
const norm = (s) => s.replace(/[­]/g, '').replace(/[   ]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
const hay = norm(pageText.body + ' ' + pageText.raw + ' ' + pageText.aria.join(' '));
const copy = readFileSync(`${ROOT}/_work/COPY.md`, 'utf8');
const start = copy.indexOf(startMark);
const end = endMark === 'END' ? copy.length : copy.indexOf(endMark);
const part = copy.slice(start, end);
const blocks = [];
for (const line of part.split('\n')) {
  let l = line.trim();
  if (!l.startsWith('-') && !/^\d+\./.test(l)) continue;
  l = l.replace(/^[-\d.]+\s*/, '').replace(/\*\*/g, '');
  // strip the label before the first colon when it is a label like "H1 (Display):"
  const m = l.match(/^([A-Za-zÄÖÜäöüß0-9 ,()\-„“./]+?):\s+(.*)$/);
  let text = m ? m[2] : l;
  if (/TODO\(client\)/.test(text) && text.length < 60) continue;
  // split on " · " and " / " into fragments
  const frags = text.split(/\s·\s|\s\/\s|\s\|\s/).map((f) => f.trim()).filter((f) => f.length > 3);
  for (const f of frags) blocks.push({ line: l.slice(0, 60), frag: f });
}
let ok = 0;
const missing = [];
for (const b of blocks) {
  const f = norm(b.frag.replace(/`[^`]*`/g, '').replace(/\|/g, ' '));
  if (!f || f.length < 4) continue;
  if (hay.includes(f)) ok++;
  else missing.push(b);
}
console.log('fragments', blocks.length, 'found', ok, 'missing', missing.length);
missing.forEach((m) => console.log('MISSING:', m.frag.slice(0, 140)));
writeFileSync(`${out}/${path.replace(/\W/g, '') || 'home'}-text.txt`, pageText.body);
