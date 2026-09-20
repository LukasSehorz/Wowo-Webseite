#!/usr/bin/env node
// Walks through the move.one insole finder wizard (start -> q1 -> q2 -> result) and records UI metrics per step.
import { join } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
import { openSession, gotoReady, dismissPopups, sleep } from './ref-lib.mjs';
const out = '../reference/motion/interact';
mkdirSync(out, { recursive: true });
const report = {};
for (const dev of ['desktop', 'mobile']) {
  const { browser, page } = await openSession(dev);
  await gotoReady(page, 'https://move.one/pages/insole-finder');
  await dismissPopups(page);
  const tap = async (loc) => (dev === 'mobile' ? loc.tap() : loc.click());
  const dump = () =>
    page.evaluate(() => {
      const main = document.querySelector('main');
      const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 30 && r.height > 20 && cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0.05 && r.top < innerHeight * 3 && r.bottom > 0; };
      const els = [...main.querySelectorAll('button, [role="button"], label, a[class*="if-"], [class*="if-"]')].filter(vis);
      const seen = new Set();
      return els.map((o) => {
        const cs = getComputedStyle(o); const r = o.getBoundingClientRect();
        return { tag: o.tagName.toLowerCase(), cls: o.className.toString().slice(0, 70), text: (o.innerText || '').replace(/\s+/g, ' ').slice(0, 50), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, color: cs.color, border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`, radius: cs.borderTopLeftRadius, pad: cs.padding, fs: cs.fontSize, fw: cs.fontWeight, ff: cs.fontFamily.slice(0, 30), lh: cs.lineHeight, tt: cs.textTransform, ls: cs.letterSpacing, shadow: cs.boxShadow.slice(0, 80), transition: cs.transition.slice(0, 140), display: cs.display, gap: cs.gap, cols: cs.gridTemplateColumns.slice(0, 80) };
      }).filter((o) => { const k = o.cls + o.text + o.y; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 40);
    });
  const steps = [];
  await page.screenshot({ path: join(out, `finder-${dev}-0-intro.png`) });
  steps.push({ step: 'intro', els: await dump() });
  await tap(page.locator('main button.if-btn-primary').first());
  await sleep(900);
  await page.screenshot({ path: join(out, `finder-${dev}-1-q1.png`) });
  steps.push({ step: 'q1', els: await dump() });
  try {
    await tap(page.locator('main button.if-opt').first());
    await sleep(500);
    await page.screenshot({ path: join(out, `finder-${dev}-2-q1-selected.png`) });
    steps.push({ step: 'q1-selected', els: await dump() });
    await tap(page.locator('.if-sticky-bar button.if-btn-primary, main button.if-btn-primary:visible').first());
    await sleep(1000);
    await page.screenshot({ path: join(out, `finder-${dev}-3-q2.png`) });
    steps.push({ step: 'q2', els: await dump() });
    await tap(page.locator('main .if-q2-opt').first());
    await sleep(500);
    await page.screenshot({ path: join(out, `finder-${dev}-3b-q2-selected.png`) });
    const next2 = page.locator('.if-sticky-bar button.if-btn-primary, main button.if-btn-primary:visible').first();
    if (await next2.count()) await tap(next2).catch(() => {});
    await sleep(1800);
    await page.screenshot({ path: join(out, `finder-${dev}-4-result.png`) });
    await page.evaluate(() => window.scrollBy(0, innerHeight * 0.85));
    await sleep(700);
    await page.screenshot({ path: join(out, `finder-${dev}-5-result-2.png`) });
    steps.push({ step: 'result', els: await dump() });
  } catch (e) {
    steps.push({ step: 'error', msg: e.message.slice(0, 300) });
  }
  // wizard CSS
  const css = await page.evaluate(() => [...document.querySelectorAll('main style, style')].map((s) => s.textContent).filter((t) => t.includes('.if-')).join('\n').slice(0, 14000));
  report[dev] = { steps, css: dev === 'desktop' ? css : undefined };
  await browser.close();
}
writeFileSync(join(out, 'finder-flow-report.json'), JSON.stringify(report, null, 1));
for (const dev of ['desktop', 'mobile']) for (const s of report[dev].steps) console.log(dev, s.step, s.msg || s.els.length + ' els');
