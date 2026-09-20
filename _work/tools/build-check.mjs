#!/usr/bin/env node
// Builder self-check: interactivity and console hygiene of the home page.
// Usage: node build-check.mjs [baseUrl]

import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:3101';
const results = [];
const ok = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const canvasHash = (page) =>
  page.evaluate(() => {
    const canvas = document.querySelectorAll('#druckverteilung canvas')[1];
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 97) sum = (sum + data[i] * (i % 251)) % 2147483647;
    return sum;
  });

const readouts = (page) =>
  page.evaluate(() => Array.from(document.querySelectorAll('#druckverteilung dd')).map((dd) => dd.textContent.trim()));

async function desktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE' });
  const page = await context.newPage();
  const problems = [];
  page.on('console', (msg) => {
    // the readback warning is caused by this script's own getImageData calls
    if (msg.text().includes('willReadFrequently')) return;
    if (['error', 'warning'].includes(msg.type())) problems.push(`${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  page.on('requestfailed', (request) => problems.push(`requestfailed: ${request.url()}`));
  page.on('response', (response) => {
    if (response.status() >= 400) problems.push(`http ${response.status()}: ${response.url()}`);
  });

  await page.goto(base, { waitUntil: 'networkidle' });
  await sleep(1200);
  ok('load: no console errors, warnings or failed requests', problems.length === 0, problems.slice(0, 6).join(' | '));

  ok('one h1', (await page.locator('h1').count()) === 1);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok('no horizontal overflow at 1440', overflow <= 0, `overflow ${overflow}px`);

  // header: transparent over the hero, solid after scrolling
  const headerColor = () => page.evaluate(() => getComputedStyle(document.querySelector('header')).color);
  const before = await headerColor();
  await page.mouse.wheel(0, 400);
  await sleep(900);
  const after = await headerColor();
  ok('header switches to the solid state on scroll', before !== after, `${before} -> ${after}`);

  // pressure map
  await page.locator('#druckverteilung').scrollIntoViewIfNeeded();
  await page.evaluate(() => document.querySelector('#druckverteilung canvas').scrollIntoView({ block: 'center' }));
  await sleep(3200);
  const hashWith = await canvasHash(page);
  const valuesWith = await readouts(page);
  await page.getByText('Stiefel allein', { exact: true }).click();
  await sleep(1300);
  const hashWithout = await canvasHash(page);
  const valuesWithout = await readouts(page);
  ok('pressure map: toggle changes the canvas', hashWith !== hashWithout);
  ok('pressure map: toggle changes the read-outs', valuesWith.join() !== valuesWithout.join(), `${valuesWith[0]} -> ${valuesWithout[0]}`);
  ok('pressure map: read-outs show the measured start values', /214/.test(valuesWithout[0]) && /4,0/.test(valuesWithout[1]) && /2,22/.test(valuesWithout[2]), valuesWithout.join(' / '));

  const slider = page.locator('#druckverteilung input[type=range]');
  await slider.focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
  await sleep(300);
  const hashHalf = await canvasHash(page);
  const valuesHalf = await readouts(page);
  ok('pressure map: arrow keys move the slider', (await slider.inputValue()) === '0.5', `value ${await slider.inputValue()}`);
  ok('pressure map: slider changes canvas and read-outs', hashHalf !== hashWithout && valuesHalf.join() !== valuesWithout.join(), valuesHalf[0]);
  await page.keyboard.press('ArrowRight');
  await sleep(200);
  const checked = await page.locator('#druckverteilung input[type=radio]:checked').getAttribute('value');
  ok('pressure map: radio group follows the slider', checked === 'with', `checked ${checked}`);

  // audience tiles
  const tile = page.locator('h3 button[aria-expanded]').first();
  await tile.scrollIntoViewIfNeeded();
  await sleep(600);
  ok('audience tile starts closed', (await tile.getAttribute('aria-expanded')) === 'false');
  await tile.click();
  await sleep(700);
  ok('audience tile opens on click', (await tile.getAttribute('aria-expanded')) === 'true');
  await page.mouse.move(5, 500);
  await sleep(300);
  await tile.focus();
  await page.keyboard.press('Enter');
  await sleep(300);
  const afterFirst = await tile.getAttribute('aria-expanded');
  await page.keyboard.press('Enter');
  await sleep(300);
  const afterSecond = await tile.getAttribute('aria-expanded');
  ok('audience tile toggles with the keyboard', afterFirst !== afterSecond, `${afterFirst} -> ${afterSecond}`);

  // study carousel
  const scroller = page.locator('#forschung [role="region"]');
  await scroller.scrollIntoViewIfNeeded();
  await sleep(800);
  const left0 = await scroller.evaluate((el) => el.scrollLeft);
  await page.getByRole('button', { name: 'Nächste Studie' }).click();
  await sleep(900);
  const left1 = await scroller.evaluate((el) => el.scrollLeft);
  ok('carousel: next arrow moves one card', left1 - left0 > 300, `${left0} -> ${left1}`);
  await page.getByRole('button', { name: 'Vorherige Studie' }).click();
  await sleep(900);
  const left2 = await scroller.evaluate((el) => el.scrollLeft);
  ok('carousel: previous arrow moves back', left2 < left1, `${left1} -> ${left2}`);
  await scroller.focus();
  await page.keyboard.press('ArrowRight');
  await sleep(900);
  const left3 = await scroller.evaluate((el) => el.scrollLeft);
  ok('carousel: arrow key moves one card', left3 - left2 > 300, `${left2} -> ${left3}`);
  const charts = await page.locator('#forschung figure[data-chart]').count();
  ok('five study charts', charts === 5, `${charts}`);

  // fitting process: scroll progress advances the steps
  const section = page.locator('#anpassung');
  const top = await section.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const current = () => page.evaluate(() => document.querySelector('#anpassung li[aria-current="step"] h3')?.textContent);
  await page.evaluate((y) => window.scrollTo(0, y + 50), top);
  await sleep(500);
  const step1 = await current();
  await page.evaluate((y) => window.scrollTo(0, y + window.innerHeight * 1.7), top);
  await sleep(500);
  const step4 = await current();
  ok('fitting process: steps advance with scroll', step1 === 'Untersuchen' && step4 === 'Kontrollieren', `${step1} -> ${step4}`);
  // R3-02: four equal shares of the pinned range, no reserved tail
  const bounds = [];
  let lastStep = null;
  const sectionHeight = await section.evaluate((el) => el.offsetHeight);
  for (let y = top - 100; y <= top + sectionHeight; y += 20) {
    await page.evaluate((s) => window.scrollTo({ top: s, behavior: 'instant' }), y);
    await sleep(40);
    const step = await current();
    if (step !== lastStep) { bounds.push(y - top); lastStep = step; }
  }
  const rangeEnd = sectionHeight - 900;
  const shares = bounds.slice(1).map((b, i) => b - (bounds[i] ?? -81)).concat([rangeEnd - bounds[bounds.length - 1]]);
  const even = Math.max(...shares) - Math.min(...shares) <= 80;
  ok('fitting process: four even steps across the whole pin (300vh)', bounds.length === 4 && even && sectionHeight === 2700, `boundaries ${bounds.join(', ')}; shares ${shares.join(', ')}`);
  const plot = await page.evaluate(() => { const svg = document.querySelectorAll('#forschung article')[2].querySelector('figure > div > svg'); return Math.round(svg.getBoundingClientRect().height); });
  ok('line chart: 160 px SVG with a 120 px plot', plot === 160, `${plot}`);
  await page.getByRole('button', { name: 'Schritt 2: Erwärmen' }).click();
  await sleep(1600);
  const step2 = await current();
  ok('fitting process: the rail jumps to a step', step2 === 'Erwärmen', `${step2}`);

  ok('after interaction: still no console errors', problems.length === 0, problems.slice(0, 6).join(' | '));

  // R1-06: hash links must land on a hard load, with the section flush under the header
  for (const [hash, expectedTop] of [['#forschung', 97], ['#druckverteilung', 81], ['#anpassung', 81]]) {
    await page.goto(`${base}/${hash}`, { waitUntil: 'networkidle' });
    await sleep(1500);
    const top = await page.evaluate((id) => Math.round(document.querySelector(id).getBoundingClientRect().top), hash);
    ok(`hard load of /${hash} lands on the section`, Math.abs(top - expectedTop) <= 4, `top ${top}, expected ${expectedTop}`);
  }
  ok('studies scroller is a named region', (await page.locator('#forschung [role="region"][aria-label="Studien"]').count()) === 1);

  // R2-01 on Home: the hero link scrolls again although #forschung is already in the URL
  await page.goto(`${base}/#forschung`, { waitUntil: 'networkidle' });
  await sleep(1200);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(300);
  await page.getByRole('link', { name: 'Was die Forschung zeigt' }).click();
  await sleep(2500);
  const again = await page.evaluate(() => Math.round(document.querySelector('#forschung').getBoundingClientRect().top));
  ok('same hash on Home: hero link scrolls to the studies again', Math.abs(again - 97) <= 4, `top ${again}`);
  await context.close();
}

async function mobile(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: 'de-DE',
  });
  const page = await context.newPage();
  const problems = [];
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) problems.push(`${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));

  await page.goto(base, { waitUntil: 'networkidle' });
  await sleep(1000);

  // scroll through once so every lazy block has rendered, then measure overflow
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 700) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await sleep(120);
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok('mobile: no horizontal overflow at 390', overflow <= 0, `overflow ${overflow}px`);

  // naturalWidth is density-corrected for `w` descriptors, so the chosen candidate width is read from the URL
  const poster = await page.evaluate(() => {
    const img = document.querySelector('main section picture img');
    const src = img?.currentSrc ?? '';
    return { src, candidate: Number(new URL(src, location.href).searchParams.get('w')), box: Math.round(img?.getBoundingClientRect().width ?? 0) };
  });
  ok('mobile: hero poster is the portrait cut at native width', poster.src.includes('portrait') && poster.candidate >= poster.box * 2, `${poster.candidate} px candidate for ${poster.box} css px at DPR 2`);
  const video = await page.evaluate(() => document.querySelector('main section video source')?.getAttribute('src') ?? '');
  ok('mobile: hero video sources are the portrait cut', video.includes('portrait'), video);

  const stack = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('#forschung [role="region"] > ul > li'));
    const lefts = new Set(items.map((li) => Math.round(li.getBoundingClientRect().left)));
    const heights = items.map((li) => Math.round(li.getBoundingClientRect().height));
    const region = document.querySelector('#forschung [role="region"]');
    return { count: items.length, columns: lefts.size, heights, tabbable: region.hasAttribute('tabindex'), arrows: document.querySelectorAll('#forschung button[aria-label="Nächste Studie"]').length };
  });
  const arrowsHidden = await page.locator('#forschung button[aria-label="Nächste Studie"]').isHidden();
  ok('mobile: studies are a vertical stack with natural heights', stack.count === 5 && stack.columns === 1 && new Set(stack.heights).size > 1 && !stack.tabbable && arrowsHidden, JSON.stringify(stack));

  const pressureOrder = await page.evaluate(() => {
    const section = document.querySelector('#druckverteilung');
    const y = (el) => Math.round(el.getBoundingClientRect().top + window.scrollY);
    const toggle = y(section.querySelector('fieldset'));
    const canvas = y(section.querySelector('canvas'));
    const slider = y(section.querySelector('input[type="range"]'));
    const readouts = y(section.querySelector('dl'));
    const lastReadout = section.querySelectorAll('dl > div');
    const bottom = Math.round(lastReadout[lastReadout.length - 1].getBoundingClientRect().bottom + window.scrollY);
    return { toggle, canvas, slider, readouts, span: bottom - toggle, canvasHeight: Math.round(section.querySelector('canvas').getBoundingClientRect().height) };
  });
  ok('mobile: pressure map order is switch, map, slider, read-outs', pressureOrder.toggle < pressureOrder.canvas && pressureOrder.canvas < pressureOrder.slider && pressureOrder.slider < pressureOrder.readouts, JSON.stringify(pressureOrder));
  ok('mobile: switch to last read-out fits one screen (≤ 767 px)', pressureOrder.span <= 767, `${pressureOrder.span} px, canvas ${pressureOrder.canvasHeight} px`);

  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);

  await page.getByRole('button', { name: 'Menü öffnen' }).tap();
  await sleep(1000);
  const dialog = page.getByRole('dialog');
  ok('mobile menu opens', await dialog.isVisible());
  const box = await dialog.boundingBox();
  ok('mobile menu is a bottom sheet from 60 px', box && Math.round(box.y) === 60, `y ${box?.y}`);
  const links = await dialog.getByRole('link').allTextContents();
  ok('mobile menu lists the three pages', ['Start', 'Über uns', 'Gutscheine'].every((label) => links.some((text) => text.trim() === label)), links.join(', '));
  await page.keyboard.press('Escape');
  await sleep(900);
  ok('mobile menu closes with Escape', (await page.getByRole('dialog').count()) === 0);

  await page.getByRole('button', { name: 'Menü öffnen' }).tap();
  await sleep(900);
  await page.getByRole('button', { name: 'Menü schließen' }).tap();
  await sleep(900);
  ok('mobile menu closes with its close button', (await page.getByRole('dialog').count()) === 0);

  const tile = page.locator('h3 button[aria-expanded]').first();
  await tile.scrollIntoViewIfNeeded();
  await sleep(500);
  await tile.tap();
  await sleep(600);
  ok('mobile: audience tile opens on tap', (await tile.getAttribute('aria-expanded')) === 'true');
  await tile.tap();
  await sleep(600);
  ok('mobile: audience tile closes on second tap', (await tile.getAttribute('aria-expanded')) === 'false');

  ok('mobile: no console errors', problems.length === 0, problems.slice(0, 6).join(' | '));
  await context.close();
}

async function reducedMotion(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE', reducedMotion: 'reduce' });
  const page = await context.newPage();
  const problems = [];
  page.on('console', (msg) => {
    // Motion prints this notice in development only; it is not part of production builds
    if (msg.text().includes('You have Reduced Motion enabled')) return;
    if (['error', 'warning'].includes(msg.type())) problems.push(`${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  await page.goto(base, { waitUntil: 'networkidle' });
  await sleep(1000);

  const hidden = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-reveal], [data-split], [data-stagger] > *, [data-chart] *'))
      .filter((el) => parseFloat(getComputedStyle(el).opacity) < 0.15)
      .map((el) => el.tagName + '.' + (el.className?.baseVal ?? el.className)),
  );
  ok('reduced motion: all revealed content is visible without animation', hidden.length === 0, hidden.slice(0, 5).join(' | '));

  const sectionHeight = await page.evaluate(() => document.querySelector('#anpassung').getBoundingClientRect().height);
  ok('reduced motion: fitting process is not pinned', sectionHeight < 1400, `height ${Math.round(sectionHeight)}`);
  const stepsVisible = await page.evaluate(() =>
    Array.from(document.querySelectorAll('#anpassung li h3')).every((el) => parseFloat(getComputedStyle(el.parentElement).opacity) === 1),
  );
  ok('reduced motion: all four steps are readable', stepsVisible);

  await page.evaluate(() => document.querySelector('#druckverteilung canvas').scrollIntoView({ block: 'center' }));
  await sleep(600);
  const values = await readouts(page);
  ok('reduced motion: pressure map starts in the insole state', /173/.test(values[0]), values[0]);

  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
  const playLabel = await page.locator('main section').first().getByRole('button').getAttribute('aria-label');
  ok('reduced motion: hero video waits for the visitor', playLabel === 'Video abspielen', playLabel);

  ok('reduced motion: no console errors', problems.length === 0, problems.slice(0, 4).join(' | '));
  await context.close();
}

const browser = await chromium.launch();
await desktop(browser);
await mobile(browser);
await reducedMotion(browser);
await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
