import { chromium } from 'playwright';
const OUT = process.argv[2] ?? '../review/final';
const b = await chromium.launch();
const p = await (await b.newContext({viewport:{width:1440,height:900},locale:'de-DE',reducedMotion:'reduce'})).newPage();
await p.goto('http://localhost:3100/#druckverteilung',{waitUntil:'networkidle'}); await p.waitForTimeout(1200);
const canvas = p.locator('canvas').first();
await canvas.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
for (const [name, key] of [['links','Home'],['rechts','End']]) {
  await p.locator('input[type=range]').first().focus();
  await p.keyboard.press(key); await p.waitForTimeout(700);
  await canvas.screenshot({ path: `${OUT}/druck-${name}.png` });
}
await p.evaluate(() => document.querySelector('footer').scrollIntoView({block:'end'})); await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}/footer.png` });
await b.close();
