#!/usr/bin/env node
// Builder self-check: screenshots of the order form states (errors, success) on desktop and mobile.
// Usage: node build-form-states.mjs <outDir> [baseUrl]

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2];
const base = process.argv[3] ?? 'http://localhost:3101';
mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
for (const device of ['desktop', 'mobile']) {
  const mobile = device === 'mobile';
  const context = await browser.newContext(
    mobile
      ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'de-DE' }
      : { viewport: { width: 1440, height: 900 }, locale: 'de-DE' },
  );
  const page = await context.newPage();
  await page.goto(`${base}/gutscheine`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelector('#anfrage form').scrollIntoView({ block: 'start' }));
  await sleep(1500);
  await page.getByRole('button', { name: '50', exact: true }).click();
  await sleep(900);
  if (mobile) await page.screenshot({ path: join(out, `form-${device}-0-configurator.png`) });

  const submit = mobile
    ? page.locator('body > div.fixed').getByRole('button', { name: 'Bestellanfrage senden' })
    : page.locator('aside').getByRole('button', { name: 'Bestellanfrage senden' });
  await submit.click();
  await page.locator('#field-company-error').waitFor();
  await sleep(700);
  await page.evaluate(() => document.querySelector('#config-group-3').scrollIntoView({ block: 'start' }));
  await sleep(500);
  await page.screenshot({ path: join(out, `form-${device}-1-errors.png`) });

  await page.locator('#field-company').fill('Muster Logistik GmbH');
  await page.locator('#field-contact').fill('Erika Mustermann');
  await page.locator('#field-email').fill('erika.mustermann@muster-logistik.example');
  await page.locator('#field-phone').fill('+49 8638 000000');
  await page.locator('#field-message').fill('Wir möchten die Gutscheine auf zwei Standorte verteilen.');
  await page.locator('#anfrage input[name="consent"]').check();
  await sleep(300);
  await page.screenshot({ path: join(out, `form-${device}-2-filled.png`) });
  await submit.click();
  await page.getByRole('heading', { name: 'Ihre Anfrage ist eingegangen' }).waitFor();
  await sleep(900);
  await page.screenshot({ path: join(out, `form-${device}-3-success.png`), fullPage: false });
  await context.close();
}
await browser.close();
console.log('form states written to', out);
