import { chromium } from 'playwright';
const OUT = '../review/final';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1440,height:900}, locale:'de-DE' });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:3100/gutscheine#anfrage', { waitUntil:'networkidle' });
await p.waitForTimeout(1200);

// Rechenprobe: 25 x 129
const sum25 = await p.evaluate(() => document.body.innerText.match(/3\.225,00 €/) ? '3.225,00 €' : 'NICHT GEFUNDEN');
console.log('25 x 129 € =', sum25, '(erwartet 3.225,00 €)');

// 100 Stueck -> Staffel ab 50 = 119 -> 11.900
await p.evaluate(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='100'); b && b.click(); });
await p.waitForTimeout(900);
console.log('100 x 119 € =', await p.evaluate(() => document.body.innerText.match(/11\.900,00 €/) ? '11.900,00 €' : 'NICHT GEFUNDEN'), '(erwartet 11.900,00 €)');

// verbotene Begriffe
const bad = await p.evaluate(() => {
  const t = document.body.innerText;
  return ['Umsatzsteuer 19','Zwischensumme','brutto','netto','Gedruckte Karten','Format der Gutscheine']
    .filter(w => t.includes(w));
});
console.log('Verbotene Begriffe auf der Seite:', bad.length ? bad : 'keine');
// Endpreis-Hinweis
console.log('Endpreis-Hinweis:', await p.evaluate(() => document.body.innerText.includes('§ 19 UStG') ? 'vorhanden' : 'FEHLT'));
// Gruppennummerierung
console.log('Gruppen:', await p.evaluate(() =>
  [...document.querySelectorAll('[id^=config-group]')].map(e => e.id).join(', ') || 'keine ids'));

await p.screenshot({ path: `${OUT}/konfigurator.png` });
// FAQ mit Partner-Link
await p.evaluate(() => { const s=[...document.querySelectorAll('summary,button')].find(e=>/Wo findet die Anpassung/.test(e.textContent)); s && s.click(); });
await p.waitForTimeout(700);
const faq = await p.evaluate(() => {
  const a = [...document.querySelectorAll('a')].find(x => /haendlerverzeichnis/.test(x.href));
  return a ? { text: a.textContent.trim(), href: a.href, target: a.target, rel: a.rel } : 'LINK FEHLT';
});
console.log('Partner-Link:', faq);
await p.screenshot({ path: `${OUT}/faq-partner.png` });
console.log('Konsolenfehler:', errs.length ? errs : 'keine');
await b.close();
