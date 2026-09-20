#!/usr/bin/env node
// Builder self-check: prints computed sizes of key elements to compare with DESIGN-SPEC numbers.
// Usage: node build-measure.mjs [url] [width]

import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:3101/';
const width = parseInt(process.argv[3] ?? '1440', 10);
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width, height: 900 }, locale: 'de-DE' });
const page = await context.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

const report = await page.evaluate(() => {
  const px = (v) => Math.round(parseFloat(v) * 100) / 100;
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return `${Math.round(r.width * 10) / 10}×${Math.round(r.height * 10) / 10}`;
  };
  const type = (el) => {
    if (!el) return null;
    const c = getComputedStyle(el);
    return `${px(c.fontSize)}px / ${c.lineHeight} / ${c.fontWeight} / ls ${c.letterSpacing}`;
  };
  const q = (s) => document.querySelector(s);
  const sections = Array.from(document.querySelectorAll('main > section')).map((s) => {
    const c = getComputedStyle(s);
    return `${s.id || s.getAttribute('aria-labelledby') || 'section'}: h ${Math.round(s.getBoundingClientRect().height)} pad ${c.paddingTop}/${c.paddingBottom}`;
  });
  const tiles = q('#audiences-heading')?.closest('section').querySelector('ul');
  const features = q('#technology-heading')?.closest('section').querySelector('ul');
  return {
    header: box(q('header > div')),
    heroSection: box(q('main > section')),
    h1: type(q('h1')),
    heroSub: type(q('h1 + p')),
    heroButton: `${box(q('main .btn'))} ${type(q('main .btn'))}`,
    introImage: `${box(q('[data-image-reveal]'))} r ${getComputedStyle(q('[data-image-reveal]')).borderRadius}`,
    displayH2: type(q('#intro-heading')),
    lead: type(q('#intro-heading')?.parentElement.querySelector('p')),
    h2std: type(q('#audiences-heading')),
    tile: `${box(tiles?.querySelector('li'))} gap ${tiles ? getComputedStyle(tiles).columnGap : ''} r ${tiles ? getComputedStyle(tiles.querySelector('li > div')).borderRadius : ''}`,
    tileTitle: type(tiles?.querySelector('h3')),
    statNumeral: type(q('.display-stat')),
    feature: `${box(features?.querySelector('li'))} gap ${features ? getComputedStyle(features).columnGap : ''}`,
    featureTitle: type(features?.querySelector('h3')),
    navLink: type(q('header nav a')),
    eyebrow: type(q('.eyebrow')),
    sheetRadius: getComputedStyle(document.documentElement).getPropertyValue('--radius-sheet'),
    sections,
    pageHeight: document.documentElement.scrollHeight,
  };
});
console.log(JSON.stringify(report, null, 2));

await page.evaluate(() => window.scrollTo(0, 600));
await page.waitForTimeout(900);
console.log('header scrolled:', await page.evaluate(() => Math.round(document.querySelector('header > div').getBoundingClientRect().height * 10) / 10));
await browser.close();
