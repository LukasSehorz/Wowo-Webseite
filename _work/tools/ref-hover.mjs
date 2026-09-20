#!/usr/bin/env node
// Hover-state evidence: before / mid / after screenshots + computed-style diffs for a list of targets.
// Usage: node ref-hover.mjs --url <url> --name <prefix> --targets <json file> [--out ../reference/motion/hover]
// targets json: [{ "id": "hero-btn", "selector": "...", "nth": 0, "pad": 24, "watch": ["img", ".btn-fill"] }]
import { join } from 'node:path';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { openSession, gotoReady, dismissPopups, preScroll, sleep, parseArgs } from './ref-lib.mjs';

const { opt } = parseArgs();
const url = opt('url');
const name = opt('name', 'page');
const out = opt('out', '../reference/motion/hover');
const targets = JSON.parse(readFileSync(opt('targets'), 'utf8'));
mkdirSync(out, { recursive: true });

const { browser, page, cfg } = await openSession('desktop');
await gotoReady(page, url);
await dismissPopups(page);
await preScroll(page);
await sleep(800);

const PROPS = ['color', 'backgroundColor', 'backgroundImage', 'backgroundSize', 'borderTopColor', 'boxShadow', 'opacity', 'transform', 'filter', 'textDecorationLine', 'visibility', 'clipPath', 'backdropFilter', 'outline', 'width', 'height'];

const styleDump = (loc, watch) =>
  loc.evaluate(
    (root, { watch, PROPS }) => {
      const pick = (el, pseudo) => {
        const cs = getComputedStyle(el, pseudo);
        const o = {};
        for (const p of PROPS) o[p] = cs[p];
        o.transition = cs.transition.slice(0, 220);
        return o;
      };
      const res = { self: pick(root), before: pick(root, '::before'), after: pick(root, '::after') };
      for (const w of watch || []) {
        const el = root.querySelector(w);
        if (el) res[w] = pick(el);
        if (el) res[w + '::after'] = pick(el, '::after');
      }
      return res;
    },
    { watch, PROPS },
  );

const report = [];
for (const t of targets) {
  const nth = t.nth || 0;
  const loc = page.locator(t.selector).nth(nth);
  try {
    await loc.scrollIntoViewIfNeeded({ timeout: 4000 });
  } catch (e) {
    report.push({ id: t.id, error: 'not found: ' + t.selector });
    console.log('MISSING', t.id, t.selector);
    continue;
  }
  // center it
  await loc.evaluate((el) => {
    const r = el.getBoundingClientRect();
    window.scrollBy(0, r.top - innerHeight / 2 + r.height / 2);
  });
  await page.mouse.move(5, cfg.viewport.height - 5);
  await sleep(900);
  const box = await loc.boundingBox();
  if (!box) {
    report.push({ id: t.id, error: 'no box' });
    continue;
  }
  const pad = t.pad ?? 24;
  const clip = {
    x: Math.max(0, box.x - pad),
    y: Math.max(0, box.y - pad),
    width: Math.min(cfg.viewport.width - Math.max(0, box.x - pad), box.width + pad * 2),
    height: Math.min(cfg.viewport.height - Math.max(0, box.y - pad), box.height + pad * 2),
  };
  const before = await styleDump(loc, t.watch);
  await page.screenshot({ path: join(out, `${name}-${t.id}-0-before.png`), clip });
  const hx = box.x + box.width * (t.hx ?? 0.5);
  const hy = box.y + box.height * (t.hy ?? 0.5);
  await page.mouse.move(hx - 3, hy - 3);
  await page.mouse.move(hx, hy, { steps: 3 });
  await sleep(t.midDelay ?? 180);
  await page.screenshot({ path: join(out, `${name}-${t.id}-1-mid.png`), clip });
  await sleep(t.settle ?? 900);
  const after = await styleDump(loc, t.watch);
  await page.screenshot({ path: join(out, `${name}-${t.id}-2-after.png`), clip });
  if (t.full) await page.screenshot({ path: join(out, `${name}-${t.id}-3-viewport.png`) });
  // diff
  const diff = {};
  for (const k of Object.keys(before || {})) {
    for (const p of Object.keys(before[k])) {
      if (p === 'transition') continue;
      if (after && after[k] && before[k][p] !== after[k][p]) diff[`${k} :: ${p}`] = `${before[k][p]}  ->  ${after[k][p]}`;
    }
  }
  const transitions = {};
  for (const k of Object.keys(before || {})) if (before[k].transition && !/^all 0s/.test(before[k].transition)) transitions[k] = before[k].transition;
  report.push({ id: t.id, selector: t.selector, box: { w: Math.round(box.width), h: Math.round(box.height) }, diff, transitions });
  console.log('hovered', t.id, Object.keys(diff).length, 'changes');
  await page.mouse.move(5, cfg.viewport.height - 5);
  await sleep(500);
}
writeFileSync(join(out, `${name}-hover-report.json`), JSON.stringify(report, null, 1));
await browser.close();
