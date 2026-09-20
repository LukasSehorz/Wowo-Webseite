// Round 3: HR-manager journey on desktop. Home → offer → studies → voucher page → configure → validation → success.
import { writeFileSync } from 'node:fs';
import { open, roundDir, sleep } from './review-lib.mjs';

const out = roundDir('round-3', 'journey');
const log = [];
const note = (...a) => { const s = a.join(' '); log.push(s); console.log(s); };
const { browser, page, logs } = await open('/', 'desktop');
const y = () => page.evaluate(() => Math.round(scrollY));
const topOf = (sel) => page.evaluate((s) => { const el = document.querySelector(s); return el ? Math.round(el.getBoundingClientRect().top) : null; }, sel);

// 1. hero text link → studies
await page.locator('main a', { hasText: 'Was die Forschung zeigt' }).first().click();
await sleep(1500);
note('hero link → #forschung: scrollY', await y(), 'section top', await topOf('#forschung'));
await page.screenshot({ path: `${out}/01-forschung.png` });

// 2. intro arrow link → process
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await sleep(600);
await page.locator('main a', { hasText: 'So läuft die Anpassung ab' }).first().click();
await sleep(1500);
note('intro link → #anpassung: scrollY', await y(), 'section top', await topOf('#anpassung'));
await page.screenshot({ path: `${out}/02-anpassung.png` });

// 3. studies carousel: next twice, prev once
await page.evaluate(() => document.getElementById('forschung').scrollIntoView({ behavior: 'instant' }));
await sleep(900);
const next = page.locator('#forschung button[aria-label="Nächste Studie"]');
const prev = page.locator('#forschung button[aria-label="Vorherige Studie"]');
note('carousel buttons: prev disabled initially =', await prev.isDisabled(), '| next disabled =', await next.isDisabled());
const disabled = async () => (await next.getAttribute('aria-disabled')) === 'true';
let clicks = 0;
while (!(await disabled()) && clicks < 6) { await next.click(); clicks++; await sleep(900); if (clicks === 1) await page.screenshot({ path: `${out}/03-studies-after-1-next.png` }); }
note('next clicks until end:', clicks, '| next aria-disabled =', await disabled(), '| scrollLeft', await page.evaluate(() => Math.round(document.querySelector('#forschung [role="region"]')?.scrollLeft)));
await page.screenshot({ path: `${out}/04-studies-end.png` });

// 4. voucher teaser pill → /gutscheine#anfrage
await page.evaluate(() => document.getElementById('gutscheine')?.scrollIntoView({ behavior: 'instant' }));
await sleep(800);
const teaserPill = page.locator('main a', { hasText: 'Gutscheine anfragen' }).first();
await teaserPill.click();
await page.waitForURL(/gutscheine/, { timeout: 10000 });
await sleep(1800);
note('teaser pill → url', page.url(), 'scrollY', await y(), '#anfrage top', await topOf('#anfrage'));
await page.screenshot({ path: `${out}/05-gutscheine-anfrage-landing.png` });

// 5. hash re-click (R2-01): scroll up, click hero pill "Anzahl wählen", then header pill
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await sleep(700);
await page.locator('main a', { hasText: 'Anzahl wählen' }).first().click();
await sleep(1500);
note('hero pill (same hash) → scrollY', await y(), '#anfrage top', await topOf('#anfrage'), 'focused:', await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName));
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await sleep(700);
await page.locator('header a', { hasText: 'Gutscheine anfragen' }).first().click();
await sleep(1500);
note('header pill (same hash) → scrollY', await y(), '#anfrage top', await topOf('#anfrage'));
await page.locator('main a', { hasText: 'So funktioniert es' }).first().click().catch(() => {});
await sleep(1200);
note('"So funktioniert es" → #ablauf top', await topOf('#ablauf'));

// 6. configure: quantity 40 via input, format printed
await page.evaluate(() => document.getElementById('anfrage').scrollIntoView({ behavior: 'instant' }));
await sleep(800);
const qty = page.locator('#anfrage input[type="text"], #anfrage input[inputmode="numeric"]').first();
await qty.fill('40');
await page.keyboard.press('Enter');
await sleep(600);
await page.locator('#anfrage label', { hasText: 'Gedruckte Karten' }).first().click();
await sleep(800);
const summary = await page.evaluate(() => document.querySelector('aside[aria-labelledby="summary-heading"]')?.innerText.replace(/\s+/g, ' ').slice(0, 300));
note('summary after qty 40 + printed:', summary);
await page.screenshot({ path: `${out}/06-configured-40-printed.png` });

// 7. submit empty → validation
await page.locator('aside button[type="submit"]').click();
await sleep(1500);
const errors = await page.evaluate(() => [...document.querySelectorAll('#anfrage [id$="-error"], #anfrage [role="alert"], #anfrage p[class*="error"], #anfrage [aria-invalid="true"] ~ *')].map((e) => e.textContent.trim()).filter(Boolean));
const invalid = await page.evaluate(() => [...document.querySelectorAll('#anfrage [aria-invalid="true"]')].map((e) => e.name || e.id));
note('validation: invalid fields', JSON.stringify(invalid), '| messages', JSON.stringify(errors), '| focus', await page.evaluate(() => document.activeElement?.name || document.activeElement?.tagName), 'scrollY', await y());
await page.screenshot({ path: `${out}/07-validation.png` });

// 8. fill fake data and submit
await page.locator('#anfrage input[name="company"]').fill('Testfirma GmbH');
await page.locator('#anfrage input[name="contact"], #anfrage input[name="name"], #anfrage input[name="person"]').first().fill('Erika Mustermann');
await page.locator('#anfrage input[type="email"]').fill('erika.mustermann@testfirma.example');
await page.locator('#anfrage input[type="tel"]').fill('0800 0000000');
await page.locator('#anfrage textarea').fill('Testanfrage aus dem Review, bitte ignorieren.');
await page.locator('#anfrage input[type="checkbox"]').first().check();
await page.screenshot({ path: `${out}/08-filled.png` });
await page.locator('aside button[type="submit"]').click();
await sleep(2500);
const success = await page.evaluate(() => {
  const h = [...document.querySelectorAll('#anfrage h2, #anfrage h3')].map((x) => x.textContent.trim());
  const text = document.getElementById('anfrage')?.innerText.replace(/\s+/g, ' ').slice(0, 900);
  return { headings: h, text, focus: document.activeElement?.textContent?.trim().slice(0, 60), scrollY: Math.round(scrollY) };
});
note('SUCCESS state:', JSON.stringify(success));
await page.screenshot({ path: `${out}/09-success.png` });
await page.screenshot({ path: `${out}/09-success-full.png`, fullPage: false });
note("failed:", JSON.stringify(logs.failed)); note('console', logs.console.length, 'errors', logs.pageerror.length, 'failed', logs.failed.length, 'bad', logs.badStatus.length);
writeFileSync(`${out}/journey.log`, log.join('\n'));
await browser.close();
