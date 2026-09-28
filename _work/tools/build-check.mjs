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

  // studies: one question at a time (tabs), a two-state graphic per study, details on demand
  const tabs = page.locator('#forschung [role="tab"]');
  const panels = page.locator('#forschung [role="tabpanel"]');
  ok('studies: five questions as a named tab list', (await tabs.count()) === 5 && (await page.locator('#forschung [role="tablist"][aria-label="Fragen an die Forschung"]').count()) === 1, `${await tabs.count()} tabs`);
  const shown = () => page.evaluate(() => Array.from(document.querySelectorAll('#forschung [role="tabpanel"]')).map((el) => getComputedStyle(el).visibility === 'visible'));
  const selected = () => page.evaluate(() => Array.from(document.querySelectorAll('#forschung [role="tab"]')).findIndex((el) => el.getAttribute('aria-selected') === 'true'));
  await page.evaluate(() => document.querySelector('#forschung [role="tablist"]').scrollIntoView({ block: 'center' }));
  await sleep(1800);
  const stageBox = () => page.evaluate(() => {
    const stage = document.querySelector('#forschung [role="tabpanel"]').parentElement.parentElement;
    return { height: Math.round(stage.getBoundingClientRect().height), after: Math.round(document.querySelector('#forschung h3.title-sm').getBoundingClientRect().top + window.scrollY) };
  });
  const boxes = [];
  for (let i = 0; i < 5; i++) {
    await tabs.nth(i).click();
    await sleep(700);
    boxes.push(await stageBox());
  }
  const visibility = await shown();
  ok('studies: a click shows exactly the chosen study', (await selected()) === 4 && visibility.filter(Boolean).length === 1 && visibility[4], JSON.stringify(visibility));
  ok('studies: stage and page keep their height for every study', new Set(boxes.map((b) => `${b.height}/${b.after}`)).size === 1, JSON.stringify(boxes));

  await tabs.nth(0).click();
  await sleep(600);
  await page.keyboard.press('ArrowDown');
  await sleep(500);
  const afterDown = await selected();
  const focusedTab = await page.evaluate(() => document.activeElement?.getAttribute('role') === 'tab' && document.activeElement.getAttribute('aria-selected') === 'true');
  await page.keyboard.press('End');
  await sleep(500);
  const afterEnd = await selected();
  await page.keyboard.press('Home');
  await sleep(500);
  const afterHome = await selected();
  await page.keyboard.press('ArrowUp');
  await sleep(500);
  const afterUp = await selected();
  ok('studies: arrow keys, Home and End switch the study and move focus', afterDown === 1 && focusedTab && afterEnd === 4 && afterHome === 0 && afterUp === 4, `${afterDown} ${focusedTab} ${afterEnd} ${afterHome} ${afterUp}`);
  const roving = await page.evaluate(() => Array.from(document.querySelectorAll('#forschung [role="tab"]')).map((el) => el.tabIndex).join(','));
  ok('studies: only the chosen tab is in the tab order', roving === '-1,-1,-1,-1,0', roving);

  // the first study plays once from „Ohne Einlage“ to „Mit Formthotics“; the switch then hands control over
  await tabs.nth(0).click();
  await sleep(1200);
  const barWidth = () => panels.nth(0).locator('.bar-fill').evaluate((el) => el.style.width);
  const widthWith = await barWidth();
  await panels.nth(0).locator('label', { hasText: 'Ohne Einlage' }).click();
  await sleep(900);
  const widthWithout = await barWidth();
  ok('studies: the switch changes the bar (with → without)', widthWith !== widthWithout && widthWithout === '100%' && parseFloat(widthWith) > 75 && parseFloat(widthWith) < 77, `${widthWith} -> ${widthWithout}`);
  const checkedAfter = await panels.nth(0).locator('input[type=radio]:checked').getAttribute('value');
  ok('studies: the switch is a radio group that follows the click', checkedAfter === '0', `checked ${checkedAfter}`);

  await tabs.nth(1).click();
  await sleep(1600);
  const figures = () => panels.nth(1).evaluate((el) => {
    const glyphs = Array.from(el.querySelectorAll('.person-glyph'));
    return { total: glyphs.length, olive: glyphs.filter((g) => g.classList.contains('bg-olive-500')).length, ink: glyphs.filter((g) => g.classList.contains('bg-ink')).length };
  });
  const people1 = await figures();
  await panels.nth(1).locator('label', { hasText: 'Mit flacher Sohle' }).click();
  await sleep(1200);
  const people0 = await figures();
  ok('studies: 100 figures, 18 marked with Formthotics and 26 with the flat insole', people1.total === 100 && people1.olive === 18 && people0.ink === 26 && people0.olive === 0, `${JSON.stringify(people1)} -> ${JSON.stringify(people0)}`);

  const graphics = await page.evaluate(() => Array.from(document.querySelectorAll('#forschung [role="img"][aria-label]')).map((el) => el.getAttribute('aria-label')));
  ok('studies: every graphic is an image whose label names both states', graphics.length === 5 && graphics.every((label) => (label.match(/\d/g) ?? []).length >= 4), graphics.map((l) => l.slice(0, 40)).join(' | '));

  const always = await panels.nth(1).evaluate((el) => {
    const visible = (node) => node && getComputedStyle(node).visibility === 'visible' && node.getBoundingClientRect().height > 0;
    const caveat = Array.from(el.querySelectorAll('p')).find((p) => p.textContent.startsWith('Aber '));
    const source = el.querySelector('.source-line');
    return { caveat: visible(caveat), source: visible(source) && /Br J Sports Med 2018/.test(source.textContent) && /Untersucht wurden Formthotics/.test(source.textContent) };
  });
  ok('studies: limit and source line are visible without opening anything', always.caveat && always.source, JSON.stringify(always));

  const toggle = page.getByRole('button', { name: 'Genauer ansehen' });
  ok('studies: details start closed', (await toggle.getAttribute('aria-expanded')) === 'false');
  await toggle.click();
  await sleep(900);
  const openDetails = await page.evaluate(() => {
    const region = document.querySelector('#forschung [data-study-details]');
    const links = Array.from(region.querySelectorAll('a[href*="doi.org"]')).filter((a) => getComputedStyle(a).visibility === 'visible');
    return { height: Math.round(region.getBoundingClientRect().height), links: links.map((a) => a.getAttribute('href')) };
  });
  ok('studies: details open with the exact values and the DOI of the chosen study', (await toggle.getAttribute('aria-expanded')) === 'true' && openDetails.height > 200 && openDetails.links.length === 1 && openDetails.links[0].includes('bjsports-2017-098273'), JSON.stringify(openDetails));
  await toggle.focus();
  await page.keyboard.press('Enter');
  await sleep(700);
  ok('studies: details close with the keyboard', (await toggle.getAttribute('aria-expanded')) === 'false');

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

  // studies: chips scroll sideways, the stage (answer, switch, graphic) fits one screen
  const row = await page.evaluate(() => {
    const list = document.querySelector('#forschung [role="tablist"]');
    const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
    const labels = Array.from(document.querySelectorAll('#forschung [role="tabpanel"] label')).filter((el) => el.getBoundingClientRect().height > 0);
    return {
      scrolls: list.scrollWidth > list.clientWidth && getComputedStyle(list).overflowX === 'auto',
      tabHeights: Math.min(...tabs.map((t) => Math.round(t.getBoundingClientRect().height))),
      switchHeights: Math.min(...labels.map((l) => Math.round(l.getBoundingClientRect().height))),
    };
  });
  ok('mobile: question chips form a sideways row, touch targets ≥ 44 px', row.scrolls && row.tabHeights >= 44 && row.switchHeights >= 44, JSON.stringify(row));
  const chips = page.locator('#forschung [role="tab"]');
  await page.evaluate(() => {
    const list = document.querySelector('#forschung [role="tablist"]');
    window.scrollTo({ top: list.getBoundingClientRect().top + window.scrollY - 90, behavior: 'instant' });
  });
  await sleep(600);
  const spans = [];
  for (let i = 0; i < 5; i++) {
    await chips.nth(i).tap();
    await sleep(900);
    spans.push(await page.evaluate((index) => {
      const list = document.querySelector('#forschung [role="tablist"]');
      const tab = list.querySelectorAll('[role="tab"]')[index];
      const panel = document.querySelectorAll('#forschung [role="tabpanel"]')[index];
      const answer = panel.querySelector('.title-answer').getBoundingClientRect();
      const graphic = panel.querySelector('[role="img"]').getBoundingClientRect();
      const t = tab.getBoundingClientRect();
      const l = list.getBoundingClientRect();
      return { chipInRow: t.left >= l.left - 1 && t.right <= l.right + 1, answerTop: Math.round(answer.top), graphicBottom: Math.round(graphic.bottom) };
    }, i));
  }
  ok('mobile: a tapped chip is scrolled fully into the row', spans.every((s) => s.chipInRow), JSON.stringify(spans.map((s) => s.chipInRow)));
  ok('mobile: answer, switch and graphic are visible together under the header', spans.every((s) => s.answerTop >= 77 && s.graphicBottom <= 844), JSON.stringify(spans));

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
    Array.from(document.querySelectorAll('[data-reveal], [data-split], [data-stagger] > *'))
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

  // studies: the result state is there at once and a study change does not animate
  await page.evaluate(() => document.querySelector('#forschung [role="tablist"]').scrollIntoView({ block: 'center' }));
  await sleep(500);
  const firstChecked = await page.locator('#forschung [role="tabpanel"]').first().locator('input[type=radio]:checked').getAttribute('value');
  await page.locator('#forschung [role="tab"]').nth(2).click();
  await sleep(60);
  const instantPanel = await page.evaluate(() => {
    const panel = document.querySelectorAll('#forschung [role="tabpanel"]')[2];
    return { opacity: getComputedStyle(panel).opacity, visibility: getComputedStyle(panel).visibility };
  });
  ok('reduced motion: studies show their result and switch without animation', firstChecked === '1' && instantPanel.opacity === '1' && instantPanel.visibility === 'visible', `${firstChecked} ${JSON.stringify(instantPanel)}`);

  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
  const playLabel = await page.locator('main section').first().getByRole('button').getAttribute('aria-label');
  ok('reduced motion: hero video waits for the visitor', playLabel === 'Video abspielen', playLabel);

  ok('reduced motion: no console errors', problems.length === 0, problems.slice(0, 4).join(' | '));
  await context.close();
}

async function noScript(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE', javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'load' });
  const state = await page.evaluate(() => {
    const visible = (el) => getComputedStyle(el).visibility === 'visible' && el.getBoundingClientRect().height > 0;
    const panels = Array.from(document.querySelectorAll('#forschung [data-study-panel]'));
    const questions = Array.from(document.querySelectorAll('#forschung [data-study-panel] [data-study-q]'));
    const links = Array.from(document.querySelectorAll('#forschung [data-study-details] a[href*="doi.org"]'));
    return {
      panels: panels.filter(visible).length,
      questions: questions.filter((q) => q.getBoundingClientRect().width > 100).length,
      tabsHidden: getComputedStyle(document.querySelector('#forschung [role="tablist"]')).display === 'none',
      doi: links.filter(visible).length,
    };
  });
  ok('no JS: all five studies stand one below the other with question, answer and details', state.panels === 5 && state.questions === 5 && state.tabsHidden && state.doi === 5, JSON.stringify(state));
  await context.close();
}

const browser = await chromium.launch();
await desktop(browser);
await mobile(browser);
await reducedMotion(browser);
await noScript(browser);
await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
