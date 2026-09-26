import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [name, vp, mob] of [['desktop',{width:1440,height:900},false], ['mobil',{width:390,height:844},true]]) {
  const p = await (await b.newContext({ viewport: vp, locale:'de-DE', isMobile: mob, hasTouch: mob })).newPage();
  await p.goto('http://localhost:3100/gutscheine', { waitUntil:'networkidle' });
  await p.waitForTimeout(700);
  // FAQ-Eintrag finden und aufklappen
  const h = await p.evaluate(() => {
    const el = [...document.querySelectorAll('summary, button, [role=button]')]
      .find(e => /Wo findet die Anpassung/.test(e.textContent));
    if (!el) return null;
    el.click();
    return 1;
  });
  await p.waitForTimeout(900);
  // Position des Links messen und dorthin scrollen
  const box = await p.evaluate(() => {
    const a = [...document.querySelectorAll('a')].find(x => /haendlerverzeichnis/.test(x.href));
    if (!a) return null;
    const r = a.getBoundingClientRect();
    window.scrollBy(0, r.top - window.innerHeight * 0.6);
    return true;
  });
  await p.waitForTimeout(800);
  console.log(name, '| geoeffnet:', !!h, '| Link gefunden:', !!box);
  await p.screenshot({ path: `../review/final/faq2-${name}.png` });
}
await b.close();
