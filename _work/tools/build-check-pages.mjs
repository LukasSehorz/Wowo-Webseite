#!/usr/bin/env node
// Builder self-check for phase 2: /gutscheine (configurator maths, control sync, validation, submit,
// accordion, keyboard, mobile bar), /ueber-uns and the legal pages, reduced motion, console hygiene.
// Usage: node build-check-pages.mjs [baseUrl] [devLogFile]

import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:3101';
const logFile = process.argv[3];
const results = [];
const ok = (name, pass, detail = '') => {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// non-breaking spaces and invisible word joiners are typography, not content
const norm = (text) => (text ?? '').replace(/\u2060/g, '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();

const demoLogEntries = () => (logFile ? (readFileSync(logFile, 'utf8').match(/\[Bestellanfrage\] Demo-Modus/g) ?? []).length : null);

function watch(page) {
  const problems = [];
  page.on('console', (msg) => {
    const text = msg.text();
    // development-only hints: Next's LCP advice for a below-the-fold image that a scripted scroll paints,
    // and Motion's notice that reduced motion is active
    if (text.includes('Largest Contentful Paint') || text.includes('You have Reduced Motion enabled')) return;
    if (['error', 'warning'].includes(msg.type())) problems.push(`${msg.type()}: ${text}`);
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  page.on('response', (response) => {
    if (response.status() >= 400) problems.push(`http ${response.status()}: ${response.url()}`);
  });
  return problems;
}

// final values of the summary (the visually hidden twin of every rolling number)
const summary = (page) =>
  page.evaluate(() => {
    const rows = {};
    document.querySelectorAll('aside[aria-labelledby="summary-heading"] dl > div').forEach((row) => {
      const label = row.querySelector('dt').textContent.replace(/\u00A0/g, ' ').trim();
      const final = row.querySelector('dd .sr-only');
      rows[label] = (final ?? row.querySelector('dd')).textContent.replace(/ /g, ' ').trim();
    });
    return rows;
  });

const controls = (page) =>
  page.evaluate(() => ({
    input: document.querySelector('#anfrage input[inputmode="numeric"]').value,
    slider: document.querySelector('#anfrage input[type="range"]').value,
    hidden: document.querySelector('#anfrage input[name="quantity"]').value,
    tier: document.querySelector('#anfrage input[name="tier"]:checked')?.closest('label').querySelector('span').textContent.trim(),
    pressed: Array.from(document.querySelectorAll('#anfrage button[aria-pressed="true"]')).map((b) => b.textContent.trim()).join(','),
  }));

async function expectQuote(page, name, quantity, tier, per, subtotal, vat, total) {
  await sleep(900);
  const c = await controls(page);
  const s = await summary(page);
  const synced = c.input === String(quantity) && c.slider === String(quantity) && c.hidden === String(quantity) && c.tier === tier;
  const maths =
    s['Preis je Gutschein'] === per && s['Zwischensumme netto'] === subtotal && s['Umsatzsteuer 19 %'] === vat && s['Gesamt brutto'] === total;
  ok(`${name}: controls in sync (${quantity}, tier ${tier})`, synced, JSON.stringify(c));
  ok(`${name}: ${per} · ${subtotal} · ${vat} · ${total}`, maths, JSON.stringify(s));
}

async function vouchersDesktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE' });
  const page = await context.newPage();
  const problems = watch(page);
  await page.goto(`${base}/gutscheine`, { waitUntil: 'networkidle' });
  await sleep(1000);

  ok('vouchers: one h1', (await page.locator('h1').count()) === 1);
  ok('vouchers: title from the copy deck', (await page.title()) === 'Einlagen-Gutscheine für Unternehmen | Brandmaier & Rauscher');
  ok('vouchers: no horizontal overflow at 1440', (await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 0);

  // R2-02: the voucher card is the hero object of its panel
  const card = await page.evaluate(() => {
    const stage = document.querySelector('main [style*="perspective"]');
    const panel = stage.parentElement;
    return { card: Math.round(stage.getBoundingClientRect().width), panel: Math.round(panel.getBoundingClientRect().width) };
  });
  ok('voucher card fills its panel (≥ 70 % of the panel width)', card.card / card.panel >= 0.7, `${card.card} of ${card.panel} px`);

  // hero calls to action
  await page.getByRole('link', { name: 'So funktioniert es' }).click();
  await sleep(1500);
  const stepsTop = await page.evaluate(() => Math.round(document.querySelector('#ablauf').getBoundingClientRect().top));
  ok('hero text link scrolls to the steps', Math.abs(stepsTop - 97) <= 3, `top ${stepsTop}`);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.locator('main').getByRole('link', { name: 'Anzahl wählen' }).click();
  await sleep(2200);
  const formTop = await page.evaluate(() => Math.round(document.querySelector('#anfrage').getBoundingClientRect().top));
  ok('hero pill scrolls to the configurator', Math.abs(formTop - 97) <= 3, `top ${formTop}`);

  // maths and sync
  await expectQuote(page, 'default', 25, '25 bis 49', '129,00 €', '3.225,00 €', '612,75 €', '3.837,75 €');
  await page.getByRole('button', { name: '50', exact: true }).click();
  await expectQuote(page, 'quick pick 50', 50, 'ab 50', '119,00 €', '5.950,00 €', '1.130,50 €', '7.080,50 €');
  ok('quick pick shows its pressed state', (await controls(page)).pressed === '50');
  await page.getByRole('button', { name: 'Anzahl verringern' }).click();
  await expectQuote(page, 'stepper minus', 49, '25 bis 49', '129,00 €', '6.321,00 €', '1.200,99 €', '7.521,99 €');

  const rolled = await page.evaluate(() => {
    const dd = document.querySelector('[data-total]');
    return [dd.querySelector('[aria-hidden]').textContent, dd.querySelector('.sr-only').textContent];
  });
  ok('rolling total settles on the final value', rolled[0] === rolled[1], rolled.join(' | '));

  const slider = page.locator('#anfrage input[type="range"]');
  await slider.focus();
  await page.keyboard.press('Home');
  await expectQuote(page, 'slider Home key', 1, '1 bis 9', '149,00 €', '149,00 €', '28,31 €', '177,31 €');
  ok('minus button is disabled at the minimum', await page.getByRole('button', { name: 'Anzahl verringern' }).isDisabled());
  for (let i = 0; i < 9; i++) await page.keyboard.press('ArrowRight');
  await expectQuote(page, 'slider arrow keys', 10, '10 bis 24', '139,00 €', '1.390,00 €', '264,10 €', '1.654,10 €');

  const direct = page.locator('#anfrage input[inputmode="numeric"]');
  await direct.fill('600');
  await direct.blur();
  await expectQuote(page, 'direct input above the maximum', 500, 'ab 50', '119,00 €', '59.500,00 €', '11.305,00 €', '70.805,00 €');
  await direct.fill('');
  await direct.blur();
  ok('emptied input falls back to the last valid quantity', (await direct.inputValue()) === '500');
  await direct.focus();
  await page.keyboard.press('ArrowDown');
  await sleep(200);
  ok('arrow keys step the direct input', (await direct.inputValue()) === '499');
  await direct.fill('120');
  await page.keyboard.press('Enter');
  await sleep(700);
  ok(
    'Enter in the quantity field confirms the number and does not submit',
    (await direct.inputValue()) === '120' && (await page.locator('#anfrage form [id$="-error"]').count()) === 0,
  );
  const live = await page.locator('[data-total] [aria-live="polite"]').textContent();
  ok('the gross total is announced to screen readers', norm(live) === '16.993,20 €', norm(live));

  await page.locator('#anfrage label', { hasText: '1 bis 9' }).click();
  await expectQuote(page, 'tier chip 1 bis 9', 1, '1 bis 9', '149,00 €', '149,00 €', '28,31 €', '177,31 €');
  await page.locator('#anfrage input[name="tier"]:checked').focus();
  await page.keyboard.press('ArrowRight');
  await expectQuote(page, 'tier radio with the arrow key', 10, '10 bis 24', '139,00 €', '1.390,00 €', '264,10 €', '1.654,10 €');

  await page.locator('#anfrage label', { hasText: 'Gedruckte Karten' }).click();
  await sleep(200);
  ok('format choice reaches the summary', (await summary(page))['Format der Gutscheine'] === 'Gedruckte Karten');

  // validation
  const submit = page.locator('aside').getByRole('button', { name: 'Bestellanfrage senden' });
  await submit.click();
  await page.locator('#field-company-error').waitFor({ timeout: 10000 });
  const messages = await page.locator('#anfrage form [id$="-error"]').allTextContents();
  const expected = [
    'Bitte geben Sie Ihr Unternehmen an.',
    'Bitte nennen Sie eine Ansprechperson.',
    'Bitte geben Sie eine gültige E-Mail-Adresse an.',
    'Bitte bestätigen Sie die Datenschutzerklärung.',
  ];
  ok('empty submit shows the four messages of the copy deck', expected.every((m) => messages.map(norm).includes(m)) && messages.length === 4, messages.map(norm).join(' | '));
  await sleep(300);
  ok('focus moves to the first invalid field', (await page.evaluate(() => document.activeElement?.id)) === 'field-company');
  ok('invalid fields are marked for assistive technology', (await page.locator('#anfrage [aria-invalid="true"]').count()) === 4);
  const kept = await controls(page);
  const keptFormat = await page.evaluate(() => document.querySelector('#anfrage input[name="format"]:checked')?.value);
  ok(
    'configuration survives a rejected submit (quantity, slider, tier, format)',
    kept.input === '10' && kept.slider === '10' && kept.hidden === '10' && kept.tier === '10 bis 24' && keptFormat === 'print' && (await summary(page))['Format der Gutscheine'] === 'Gedruckte Karten',
    `${JSON.stringify(kept)} format ${keptFormat}`,
  );

  await page.locator('#field-company').fill('Muster GmbH');
  await sleep(200);
  ok('a message disappears once its field is edited', (await page.locator('#field-company-error').count()) === 0);
  await page.locator('#field-contact').fill('Erika Muster');
  await page.locator('#field-email').fill('erika@');
  await page.locator('#anfrage input[name="consent"]').focus();
  await page.keyboard.press('Space');
  await submit.click();
  await sleep(1500);
  const second = await page.locator('#anfrage form [id$="-error"]').allTextContents();
  ok('invalid e-mail is the only remaining message', second.length === 1 && norm(second[0]) === expected[2], second.map(norm).join(' | '));
  ok('typed values come back after a rejected submit', (await page.locator('#field-company').inputValue()) === 'Muster GmbH' && (await page.locator('#anfrage input[name="consent"]').isChecked()));

  // successful submit in demo mode
  const before = demoLogEntries();
  await page.locator('#field-email').fill('erika@muster.example');
  await page.locator('#field-phone').fill('+49 8638 000000');
  await page.locator('#field-message').fill('Bitte Angebot für zwei Standorte.');
  await page.locator('#field-message').press('Tab');
  await submit.click();
  await page.getByRole('heading', { name: 'Ihre Anfrage ist eingegangen' }).waitFor({ timeout: 10000 });
  await sleep(500);
  const successText = norm(await page.locator('#anfrage').textContent());
  ok('success view replaces the form', (await page.locator('#anfrage form').count()) === 0 && (await page.locator('aside[aria-labelledby="summary-heading"]').count()) === 0);
  const parts = ['Muster GmbH', 'Erika Muster', 'erika@muster.example', '+49 8638 000000', 'Gedruckte Karten', '1.654,10 €', 'Bitte Angebot für zwei Standorte.', 'zwei Werktagen'];
  const missing = parts.filter((part) => !successText.includes(part));
  ok('success view repeats the request', missing.length === 0, `missing: ${missing.join(' | ')}`);
  ok('focus lands on the confirmation', (await page.evaluate(() => document.activeElement?.textContent)) === 'Ihre Anfrage ist eingegangen');
  if (before !== null) {
    await sleep(500);
    ok('server logged the request (demo mode)', demoLogEntries() === before + 1, `${before} -> ${demoLogEntries()}`);
  }

  // accordion
  const questions = page.locator('#fragen h3 button');
  await questions.nth(0).scrollIntoViewIfNeeded();
  await questions.nth(0).click();
  await sleep(500);
  await questions.nth(1).click();
  await sleep(500);
  const expanded = await questions.evaluateAll((buttons) => buttons.map((b) => b.getAttribute('aria-expanded')));
  ok('accordion: nine questions, one open at a time', expanded.length === 9 && expanded.filter((v) => v === 'true').length === 1 && expanded[1] === 'true', expanded.join(','));
  await questions.nth(2).focus();
  await page.keyboard.press('Enter');
  await sleep(500);
  const afterKey = await questions.evaluateAll((buttons) => buttons.map((b) => b.getAttribute('aria-expanded')));
  ok('accordion: opens with the keyboard', afterKey[2] === 'true' && afterKey.filter((v) => v === 'true').length === 1);
  const answerVisible = await page.evaluate(() => {
    const region = document.querySelector('#fragen [role="region"][aria-labelledby$="faq-3-button"]');
    return getComputedStyle(region).visibility === 'visible' && region.getBoundingClientRect().height > 40;
  });
  ok('accordion: the answer is revealed', answerVisible);
  await page.keyboard.press('Space');
  await sleep(500);
  ok('accordion: closes again with the keyboard', (await questions.nth(2).getAttribute('aria-expanded')) === 'false');

  ok('vouchers: no console errors or failed requests', problems.length === 0, problems.slice(0, 5).join(' | '));
  await context.close();
}

async function vouchersTablet(browser) {
  const context = await browser.newContext({ viewport: { width: 1024, height: 800 }, locale: 'de-DE' });
  const page = await context.newPage();
  await page.goto(`${base}/gutscheine#anfrage`, { waitUntil: 'networkidle' });
  await sleep(1200);
  const layout = await page.evaluate(() => {
    const form = document.querySelector('#anfrage form');
    const summary = document.querySelector('aside[aria-labelledby="summary-heading"]');
    const company = document.querySelector('#field-company');
    const contact = document.querySelector('#field-contact');
    return {
      form: Math.round(form.getBoundingClientRect().width),
      summary: Math.round(summary.getBoundingClientRect().width),
      stacked: Math.round(company.getBoundingClientRect().top) !== Math.round(contact.getBoundingClientRect().top),
      summaryPadding: getComputedStyle(summary).paddingLeft,
    };
  });
  ok('1024 px: form column ≥ 580 px, summary 340 px', layout.form >= 580 && layout.summary === 340, JSON.stringify(layout));
  ok('1024 px: inputs in one column, summary padding 24 px', layout.stacked && layout.summaryPadding === '24px', JSON.stringify(layout));
  await context.close();
}

async function vouchersHoneypot(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE' });
  const page = await context.newPage();
  await page.goto(`${base}/gutscheine#anfrage`, { waitUntil: 'networkidle' });
  await sleep(800);
  const honeypot = page.locator('#anfrage input[name="website"]');
  ok('honeypot is out of reach for people', (await honeypot.getAttribute('tabindex')) === '-1' && (await honeypot.evaluate((el) => el.getBoundingClientRect().right < 0)));
  await page.locator('#field-company').fill('Bot AG');
  await page.locator('#field-contact').fill('Bot');
  await page.locator('#field-email').fill('bot@spam.example');
  await page.locator('#anfrage input[name="consent"]').check();
  await honeypot.evaluate((el) => {
    el.value = 'https://spam.example';
  });
  const before = demoLogEntries();
  await page.locator('aside').getByRole('button', { name: 'Bestellanfrage senden' }).click();
  await page.getByRole('heading', { name: 'Ihre Anfrage ist eingegangen' }).waitFor({ timeout: 10000 });
  await sleep(600);
  if (before !== null) ok('honeypot: bot sees success, nothing is delivered', demoLogEntries() === before, `${before} -> ${demoLogEntries()}`);
  await context.close();
}

async function vouchersMobile(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'de-DE' });
  const page = await context.newPage();
  const problems = watch(page);
  await page.goto(`${base}/gutscheine`, { waitUntil: 'networkidle' });
  await sleep(800);
  const bar = page.locator('body > div.fixed');
  ok('mobile: action bar is hidden at the top of the page', (await bar.getAttribute('inert')) !== null);

  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 700) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await sleep(120);
  }
  ok('mobile: no horizontal overflow at 390', (await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 0);

  await page.evaluate(() => document.querySelector('#anfrage form').scrollIntoView({ block: 'start' }));
  await sleep(1200);
  ok('mobile: action bar appears with the configurator', (await bar.getAttribute('inert')) === null);
  await page.getByRole('button', { name: '100', exact: true }).tap();
  await sleep(900);
  const barTotal = norm(await bar.locator('.sr-only').textContent());
  ok('mobile: bar shows the gross total', barTotal === '14.161,00 €', barTotal);
  const box = await bar.boundingBox();
  ok('mobile: bar sits on the bottom edge', box && Math.round(box.y + box.height) === 844, JSON.stringify(box));

  await bar.getByRole('button', { name: 'Bestellanfrage senden' }).tap();
  await page.locator('#field-company-error').waitFor({ timeout: 10000 });
  await sleep(400);
  const fieldTop = await page.evaluate(() => Math.round(document.querySelector('#field-company').getBoundingClientRect().top));
  ok('mobile: a rejected submit brings the first error into view', fieldTop > 70 && fieldTop < 760, `top ${fieldTop}`);

  await page.evaluate(() => document.querySelector('#fragen').scrollIntoView({ block: 'start' }));
  await sleep(1200);
  ok('mobile: action bar leaves with the configurator', (await bar.getAttribute('inert')) !== null);

  // R3-01: the bar's submit button must be the hit target wherever the bar is visible, also where the
  // FAQ sheet overlaps the end of the configurator; the bar lives in <body>, outside any stacking context
  const range = await page.evaluate(() => { const r = document.querySelector('#anfrage').getBoundingClientRect(); return { top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY) }; });
  const hits = [];
  for (const y of [range.top + 300, range.bottom - 900, range.bottom - 700, range.bottom - 500, range.bottom - 300]) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await sleep(900);
    hits.push(await page.evaluate(() => {
      const bar = document.querySelector('body > div.fixed');
      const btn = bar.querySelector('button');
      const b = btn.getBoundingClientRect();
      const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
      return { y: Math.round(scrollY), parent: bar.parentElement.tagName, visible: !bar.hasAttribute('inert'), hit: hit === btn || btn.contains(hit) };
    }));
  }
  ok('mobile: order bar is portalled to <body>', hits.every((h) => h.parent === 'BODY'));
  ok('mobile: submit button is the hit target at every position, incl. under the FAQ overlap', hits.every((h) => h.visible && h.hit), JSON.stringify(hits));
  const stacked = await page.evaluate(() => {
    const row = document.querySelector('#included-heading ~ div dl > div');
    const dt = row.querySelector('dt').getBoundingClientRect();
    const dd = row.querySelector('dd').getBoundingClientRect();
    return { below: dd.top >= dt.bottom - 1, indent: getComputedStyle(row.querySelector('dd')).paddingLeft };
  });
  ok('mobile: included rows stack label and value, value indented 34 px', stacked.below && stacked.indent === '34px', JSON.stringify(stacked));

  // R2-04: the sheet starts 17 px above the header's bottom edge (108 px under the marquee, 60 px scrolled)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(500);
  await page.getByRole('button', { name: 'Menü öffnen' }).tap();
  await sleep(1200);
  const sheetTopUnderMarquee = Math.round((await page.getByRole('dialog').boundingBox()).y);
  const headerBottom = await page.evaluate(() => Math.round(document.querySelector('header > div').getBoundingClientRect().bottom));
  ok('mobile menu on an inner page starts under the header', sheetTopUnderMarquee === headerBottom - 17 && sheetTopUnderMarquee === 108, `sheet ${sheetTopUnderMarquee}, header bottom ${headerBottom}`);
  await page.keyboard.press('Escape');
  await sleep(900);
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
  await sleep(600);
  await page.getByRole('button', { name: 'Menü öffnen' }).tap();
  await sleep(1200);
  const sheetTopScrolled = Math.round((await page.getByRole('dialog').boundingBox()).y);
  ok('mobile menu on a scrolled inner page starts at 60 px', sheetTopScrolled === 60, `sheet ${sheetTopScrolled}`);
  await page.keyboard.press('Escape');
  await sleep(900);
  ok('mobile: no console errors', problems.length === 0, problems.slice(0, 5).join(' | '));
  await context.close();
}

async function crossPage(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE' });
  const page = await context.newPage();
  const problems = watch(page);
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await sleep(800);
  await page.locator('header').getByRole('link', { name: 'Gutscheine anfragen' }).click();
  await page.waitForURL('**/gutscheine#anfrage', { timeout: 15000 });
  await sleep(1800);
  const top = await page.evaluate(() => Math.round(document.querySelector('#anfrage').getBoundingClientRect().top));
  ok('header CTA leads from Home to the order request', Math.abs(top - 97) <= 4, `#anfrage top ${top}`);

  for (const [from, label] of [
    ['/', 'Gutscheine für Ihr Team'],
    ['/', 'Zur Bestellanfrage'],
    ['/ueber-uns', 'Zu den Gutscheinen'],
  ]) {
    await page.goto(`${base}${from}`, { waitUntil: 'networkidle' });
    const href = await page.getByRole('link', { name: label }).first().getAttribute('href');
    ok(`„${label}“ on ${from} points to /gutscheine#anfrage`, href === '/gutscheine#anfrage', href);
  }

  // R1-06: the order request must also land on a hard load (new tab, link in an e-mail)
  await page.goto(`${base}/gutscheine#anfrage`, { waitUntil: 'networkidle' });
  await sleep(1500);
  const hardTop = await page.evaluate(() => Math.round(document.querySelector('#anfrage').getBoundingClientRect().top));
  ok('hard load of /gutscheine#anfrage lands on the configurator', Math.abs(hardTop - 97) <= 4, `top ${hardTop}`);

  // R2-01: the CTAs must scroll again although the URL already carries #anfrage
  const anfrageTop = () => page.evaluate(() => Math.round(document.querySelector('#anfrage').getBoundingClientRect().top));
  const focused = () => page.evaluate(() => document.activeElement?.getAttribute('inputmode') ?? document.activeElement?.tagName);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(300);
  await page.locator('main').getByRole('link', { name: 'Anzahl wählen' }).click();
  await sleep(2200);
  ok('same hash: hero pill scrolls to the configurator again', Math.abs((await anfrageTop()) - 97) <= 4, `top ${await anfrageTop()}`);
  ok('same hash: focus moves to the quantity field', (await focused()) === 'numeric', String(await focused()));
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(300);
  await page.locator('header').getByRole('link', { name: 'Gutscheine anfragen' }).click();
  await sleep(2200);
  ok('same hash: header pill scrolls to the configurator again', Math.abs((await anfrageTop()) - 97) <= 4, `top ${await anfrageTop()}`);
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await sleep(600);
  await page.locator('footer').getByRole('link', { name: 'Zur Bestellanfrage' }).click();
  await sleep(2200);
  ok('same hash: footer pill scrolls up to the configurator', Math.abs((await anfrageTop()) - 97) <= 4, `top ${await anfrageTop()}`);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(300);
  await page.locator('header').getByRole('link', { name: 'Gutscheine anfragen' }).focus();
  await page.keyboard.press('Enter');
  await sleep(2200);
  ok('same hash: keyboard activation scrolls as well', Math.abs((await anfrageTop()) - 97) <= 4, `top ${await anfrageTop()}`);
  ok('same hash: URL keeps the hash', page.url().endsWith('/gutscheine#anfrage'), page.url());
  const newTab = await context.newPage();
  await newTab.goto(`${base}/gutscheine`, { waitUntil: 'networkidle' });
  await sleep(1000);
  await newTab.locator('main').getByRole('link', { name: 'So funktioniert es' }).click();
  await sleep(1800);
  const ablaufTop = await newTab.evaluate(() => Math.round(document.querySelector('#ablauf').getBoundingClientRect().top));
  ok('different hash on the same page still scrolls (text link)', Math.abs(ablaufTop - 97) <= 4 && newTab.url().endsWith('#ablauf'), `top ${ablaufTop} ${newTab.url()}`);
  await newTab.close();

  const sitemap = await (await page.request.get(`${base}/sitemap.xml`)).text();
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  ok('sitemap lists the three content pages', locs.join(',') === '/,/ueber-uns,/gutscheine', locs.join(','));
  for (const [path, expected] of [['/impressum', 'noindex'], ['/gutscheine', null]]) {
    await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
    const robots = await page.locator('meta[name="robots"]').getAttribute('content').catch(() => null);
    ok(`${path}: robots meta ${expected ?? 'absent'}`, expected ? (robots ?? '').includes(expected) : robots === null, String(robots));
  }
  const description = await page.locator('meta[name="description"]').getAttribute('content');
  ok('/gutscheine: description from the copy deck', description.startsWith('Gutscheine für Untersuchung, funktionelle Einlagen und thermische Anpassung.'));
  const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
  ok('/gutscheine: canonical Open Graph URL', ogUrl.endsWith('/gutscheine'), ogUrl);
  ok('cross-page: no console errors', problems.length === 0, problems.slice(0, 4).join(' | '));
  await context.close();
}

async function vouchersNoJsMobile(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, javaScriptEnabled: false, locale: 'de-DE' });
  const page = await context.newPage();
  await page.goto(`${base}/gutscheine`, { waitUntil: 'load' });
  const r = await page.evaluate(() => {
    const btn = document.querySelector('aside[aria-labelledby="summary-heading"] button');
    return { summaryButton: !!btn && getComputedStyle(btn).display !== 'none' && btn.getBoundingClientRect().height >= 44, bar: !!document.querySelector('body > div.fixed') };
  });
  ok('no JS on a phone: the summary card carries a reachable submit button', r.summaryButton && !r.bar, JSON.stringify(r));
  await context.close();
}

async function typography(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, locale: 'de-DE' });
  const page = await context.newPage();
  for (const path of ['/', '/ueber-uns', '/gutscheine']) {
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    const hits = await page.evaluate(() => {
      const re = /\d (?:%|€|kPa|cm²|N\/cm²|Mio\.|Punkte|Sekunden|Minuten|Monate|Jahre|Werktagen|Schritte)(?!\p{L})|\S = \S/gu;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const found = [];
      let node;
      while ((node = walker.nextNode())) {
        if (node.parentElement.closest('script')) continue;
        const m = node.nodeValue.match(re);
        if (m) found.push(...m);
      }
      return found;
    });
    ok(`${path}: no breakable number–unit pair in the copy`, hits.length === 0, hits.slice(0, 6).join(' | '));
  }
  await context.close();
}

async function otherPages(browser) {
  for (const device of ['desktop', 'mobile']) {
    const context = await browser.newContext(
      device === 'mobile'
        ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'de-DE' }
        : { viewport: { width: 1440, height: 900 }, locale: 'de-DE' },
    );
    const page = await context.newPage();
    const problems = watch(page);
    for (const [path, title] of [
      ['/ueber-uns', 'Über uns | Brandmaier & Rauscher Einlagen'],
      ['/impressum', 'Impressum | Brandmaier & Rauscher Einlagen'],
      ['/datenschutz', 'Datenschutzerklärung | Brandmaier & Rauscher Einlagen'],
    ]) {
      await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += 700) {
        await page.evaluate((top) => window.scrollTo(0, top), y);
        await sleep(100);
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      ok(`${path} (${device}): one h1, right title, no overflow`, (await page.locator('h1').count()) === 1 && (await page.title()) === title && overflow <= 0, `overflow ${overflow}, title ${await page.title()}`);
    }
    ok(`other pages (${device}): no console errors or failed requests`, problems.length === 0, problems.slice(0, 5).join(' | '));
    await context.close();
  }
}

async function reducedMotion(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE', reducedMotion: 'reduce' });
  const page = await context.newPage();
  const problems = watch(page);
  for (const path of ['/gutscheine', '/ueber-uns']) {
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    await sleep(800);
    const hidden = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-reveal], [data-split], [data-stagger] > *, [data-image-reveal] > *'))
        .filter((el) => parseFloat(getComputedStyle(el).opacity) < 0.99 || getComputedStyle(el).transform.includes('matrix(1.3'))
        .map((el) => el.tagName),
    );
    ok(`reduced motion ${path}: everything is visible without animation`, hidden.length === 0, hidden.slice(0, 6).join(','));
  }
  const fill = await page.evaluate(() => getComputedStyle(document.querySelector('ol[data-stagger]').previousElementSibling).transform);
  ok('reduced motion: timeline rail is simply filled', fill === 'none', fill);

  await page.goto(`${base}/gutscheine`, { waitUntil: 'networkidle' });
  const line = await page.evaluate(() => getComputedStyle(document.querySelector('#ablauf ol').previousElementSibling).transform);
  ok('reduced motion: step connector is drawn', line === 'none', line);
  await page.evaluate(() => document.querySelector('#anfrage form').scrollIntoView());
  await page.getByRole('button', { name: '100', exact: true }).click();
  await sleep(60);
  const instant = await page.evaluate(() => document.querySelector('[data-total] [aria-hidden]').textContent.replace(/ /g, ' '));
  ok('reduced motion: totals change at once', instant === '14.161,00 €', instant);
  ok('reduced motion: no console errors', problems.length === 0, problems.slice(0, 4).join(' | '));
  await context.close();
}

const browser = await chromium.launch();
await vouchersDesktop(browser);
await vouchersTablet(browser);
await vouchersHoneypot(browser);
await vouchersMobile(browser);
await vouchersNoJsMobile(browser);
await typography(browser);
await crossPage(browser);
await otherPages(browser);
await reducedMotion(browser);
await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
