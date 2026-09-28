// Keyboard focus on the question list and on the switch (desktop 1440).
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE' })).newPage();
await p.goto('http://localhost:3101/', { waitUntil: 'networkidle' });
const y = await p.evaluate(() => document.querySelector('#forschung [role="tablist"]').getBoundingClientRect().top + window.scrollY - 150);
await p.evaluate((t) => window.scrollTo(0, t), y);
await p.waitForTimeout(1500);
await p.locator('#forschung [role="tab"]').first().focus();
await p.keyboard.press('ArrowDown');
await p.keyboard.press('ArrowDown');
await p.waitForTimeout(1500);
await p.screenshot({ path: '../review/studien-neu/studies-desktop-fokus-liste.png' });
await p.keyboard.press('Tab');
await p.waitForTimeout(300);
await p.keyboard.press('ArrowLeft');
await p.waitForTimeout(1000);
await p.screenshot({ path: '../review/studien-neu/studies-desktop-fokus-umschalter.png' });
await b.close();
