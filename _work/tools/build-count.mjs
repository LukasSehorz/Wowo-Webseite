import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE' });
const p = await ctx.newPage();
p.on('pageerror', e => console.log('PAGEERROR:', e.message));
await p.goto('http://localhost:3100/', { waitUntil: 'networkidle' });
await p.waitForTimeout(800);

// langsam nach unten scrollen, bis die Zahlen ins Bild kommen
const target = await p.evaluate(() => {
  const el = document.querySelector('.display-stat');
  return el.getBoundingClientRect().top + window.scrollY;
});
for (let y = 0; y < target - 400; y += 220) {
  await p.evaluate(v => window.scrollTo(0, v), y);
  await p.waitForTimeout(60);
}
console.log('--- ab hier kommen die Zahlen ins Bild ---');
for (let i = 0; i < 16; i++) {
  await p.evaluate(v => window.scrollTo(0, v), target - 400 + i * 25);
  const vals = await p.evaluate(() =>
    [...document.querySelectorAll('.display-stat')].slice(0,3)
      .map(e => e.querySelector('[aria-hidden]')?.innerText.replace(/\s+/g,' ').trim()));
  console.log(String(i).padStart(3), vals.join('  |  '));
  await p.waitForTimeout(110);
}
await b.close();
