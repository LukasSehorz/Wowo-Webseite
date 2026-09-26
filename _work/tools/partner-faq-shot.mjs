#!/usr/bin/env node
// Correction III review: opens the FAQ entry "Wo findet die Anpassung statt?" on the voucher
// page, photographs the open answer with the partner link, and checks the keyboard path
// (Tab from the question button must reach the external link) plus the link attributes.
//
// Usage: node partner-faq-shot.mjs [--port 3102] [--out <dir>]

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d;
};

const port = opt('port', '3102');
const out = opt('out', '../review/korrektur-partner');
const url = `http://localhost:${port}/gutscheine`;
const QUESTION = 'Wo findet die Anpassung statt?';

mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const DEVICES = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const browser = await chromium.launch();
const report = {};

for (const [device, config] of Object.entries(DEVICES)) {
  const context = await browser.newContext(config);
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });

  const button = page.getByRole('button', { name: QUESTION });
  await button.scrollIntoViewIfNeeded();
  await sleep(600); // let scroll-triggered animation settle
  await button.click();
  await sleep(900); // height 300 ms + fade 150 ms after a 150 ms delay

  const link = page.getByRole('link', { name: /Partnerpraxis suchen/ });
  const panel = page.locator(`#${(await button.getAttribute('aria-controls')) ?? ''}`);

  // the open answer alone, plus some context above and below
  const box = await panel.boundingBox();
  const shot = join(out, `partner-faq-open-${device}.png`);
  if (box) {
    await page.screenshot({
      path: shot,
      clip: {
        x: Math.max(0, box.x - 24),
        y: Math.max(0, box.y - 90),
        width: Math.min(config.viewport.width, box.width + 48),
        height: box.height + 120,
      },
    });
  }
  await page.screenshot({ path: join(out, `partner-faq-viewport-${device}.png`) });

  // keyboard: focus the question button, then Tab — the next stop must be the link
  await button.focus();
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => {
    const el = document.activeElement;
    return el ? { tag: el.tagName, text: (el.textContent ?? '').trim().slice(0, 60), href: el.getAttribute('href') } : null;
  });
  const focusShot = join(out, `partner-faq-focus-${device}.png`);
  if (box) {
    await page.screenshot({
      path: focusShot,
      clip: {
        x: Math.max(0, box.x - 24),
        y: Math.max(0, box.y - 20),
        width: Math.min(config.viewport.width, box.width + 48),
        height: box.height + 40,
      },
    });
  }

  // how the answer wraps, and whether the link sits on its own line
  const metrics = await page.evaluate(
    ([question]) => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes(question));
      const panelEl = document.getElementById(btn.getAttribute('aria-controls'));
      const a = panelEl.querySelector('a[target="_blank"]');
      const inner = panelEl.firstElementChild;
      const cs = getComputedStyle(inner);
      const lineHeight = parseFloat(cs.lineHeight);
      const textNode = a.closest('span').previousSibling;
      const range = document.createRange();
      if (textNode) range.selectNodeContents(panelEl);
      return {
        panelWidth: Math.round(panelEl.getBoundingClientRect().width),
        textWidth: Math.round(inner.getBoundingClientRect().width),
        maxWidth: cs.maxWidth,
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        approxLines: Math.round(inner.getBoundingClientRect().height / lineHeight),
        linkRect: (({ x, y, width, height }) => ({
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(width),
          height: Math.round(height),
        }))(a.getBoundingClientRect()),
        linkText: a.textContent.trim(),
        linkHref: a.getAttribute('href'),
        target: a.getAttribute('target'),
        rel: a.getAttribute('rel'),
        srOnly: [...a.querySelectorAll('.sr-only')].map((s) => s.textContent.trim()),
      };
    },
    [QUESTION],
  );

  // a closed answer must keep its link out of the tab order
  const closedTabbable = await page.evaluate(
    ([question]) => {
      const btns = [...document.querySelectorAll('button')];
      const other = btns.find((b) => b.textContent?.includes(question));
      const panelEl = document.getElementById(other.getAttribute('aria-controls'));
      return { visibility: getComputedStyle(panelEl.parentElement ? panelEl : panelEl).visibility };
    },
    ['Was ist im Gutschein enthalten?'],
  );

  report[device] = { focusAfterTab: focused, metrics, closedPanel: closedTabbable };
  await context.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
