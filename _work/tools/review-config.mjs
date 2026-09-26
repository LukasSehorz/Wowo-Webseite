// Gutscheine: configurator states (stepper, slider, quick picks, tier switch, format), summary math, form validation and success.
import { open, roundDir, scrollTo, sleep } from './review-lib.mjs';

const out = roundDir(undefined, 'config');
const device = process.argv[2] || 'desktop';
const { browser, page, logs } = await open('/gutscheine', device);
const isMobile = device === 'mobile';
const click = async (loc) => (isMobile ? loc.tap() : loc.click());

const summary = () =>
  page.evaluate(() => {
    const card = [...document.querySelectorAll('#anfrage *')].find((e) => /Zusammenfassung/.test(e.textContent) && e.tagName === 'H3')?.parentElement;
    const rows = card ? [...card.querySelectorAll('dt, dd, p, span')].filter((e) => e.children.length === 0 && e.textContent.trim()).map((e) => e.textContent.trim()) : [];
    const qty = document.querySelector('#anfrage input[type=number], #anfrage input[inputmode=numeric]');
    const range = document.querySelector('#anfrage input[type=range]');
    const tier = [...document.querySelectorAll('#anfrage [aria-pressed="true"], #anfrage [aria-checked="true"], #anfrage input:checked')].map((e) => (e.getAttribute('aria-label') || e.closest('label')?.textContent || e.value || e.textContent).replace(/\s+/g, ' ').trim().slice(0, 40));
    const bar = [...document.querySelectorAll('body *')].find((e) => getComputedStyle(e).position === 'fixed' && e.getBoundingClientRect().bottom >= innerHeight - 1 && e.getBoundingClientRect().height > 40 && e.getBoundingClientRect().height < 200);
    return { qty: qty?.value, range: range?.value, tier, rows: rows.slice(0, 20), bar: bar ? { h: Math.round(bar.getBoundingClientRect().height), text: bar.textContent.replace(/\s+/g, ' ').trim().slice(0, 80), bg: getComputedStyle(bar).backgroundColor, backdrop: getComputedStyle(bar).backdropFilter, pb: getComputedStyle(bar).paddingBottom } : null };
  });

const top = await page.evaluate(() => Math.round(document.querySelector('#anfrage').getBoundingClientRect().top + scrollY));
await scrollTo(page, top + (isMobile ? 60 : 80), 1500);
await page.screenshot({ path: `${out}/${device}-0-initial.png` });
console.log('initial', JSON.stringify(await summary()));

// stepper plus ×3
const plus = page.locator('#anfrage button', { hasText: /^\+$|plus|erhöhen|mehr/i }).first();
const plusBtn = (await plus.count()) ? plus : page.locator('#anfrage button[aria-label*="rhöhen"], #anfrage button[aria-label*="Plus"], #anfrage button[aria-label*="mehr"]').first();
const stepperLabels = await page.evaluate(() => [...document.querySelectorAll('#anfrage button')].slice(0, 8).map((b) => b.getAttribute('aria-label') || b.textContent.trim()));
console.log('first buttons', JSON.stringify(stepperLabels));
for (let i = 0; i < 3; i++) { await click(plusBtn); await sleep(150); }
await sleep(900);
console.log('after +3', JSON.stringify(await summary()));
await page.screenshot({ path: `${out}/${device}-1-stepper.png` });

// direct input 9 → tier 1
const qtyInput = page.locator('#anfrage input[type=number], #anfrage input[inputmode=numeric]').first();
await qtyInput.fill('9');
await qtyInput.dispatchEvent('change');
await sleep(900);
console.log('typed 9', JSON.stringify(await summary()));

// quick pick 100
await click(page.locator('#anfrage button', { hasText: /^100$/ }).first());
await sleep(900);
console.log('quick 100', JSON.stringify(await summary()));
await page.screenshot({ path: `${out}/${device}-2-quick100.png` });

// slider via keyboard
const range = page.locator('#anfrage input[type=range]').first();
await range.focus();
await page.keyboard.press('Home');
await sleep(300);
for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
await sleep(900);
const rangeInfo = await range.evaluate((r) => ({ min: r.min, max: r.max, step: r.step, value: r.value, label: r.getAttribute('aria-label'), valuetext: r.getAttribute('aria-valuetext') }));
console.log('slider Home+4', JSON.stringify(rangeInfo), JSON.stringify(await summary()));

// tier chip click (if chips are interactive)
const tierChip = page.locator('#anfrage button, #anfrage label', { hasText: 'ab 50' }).first();
const tierTag = await tierChip.evaluate((e) => ({ tag: e.tagName, role: e.getAttribute('role'), disabled: e.disabled, ariaPressed: e.getAttribute('aria-pressed'), cursor: getComputedStyle(e).cursor })).catch(() => null);
console.log('tier chip', JSON.stringify(tierTag));
if (tierTag && tierTag.tag === 'BUTTON') {
  await click(tierChip);
  await sleep(900);
  console.log('after tier click ab 50', JSON.stringify(await summary()));
}
// upper bound
await qtyInput.fill('999');
await qtyInput.dispatchEvent('change');
await qtyInput.blur();
await sleep(700);
console.log('typed 999', JSON.stringify(await summary()));
await qtyInput.fill('0');
await qtyInput.dispatchEvent('change');
await qtyInput.blur();
await sleep(700);
console.log('typed 0', JSON.stringify(await summary()));

// the delivery format was removed with the printed cards, only digital is left

// set 25 again for the order, then submit empty → validation
await click(page.locator('#anfrage button', { hasText: /^25$/ }).first());
await sleep(500);
const submit = page.locator('#anfrage button[type=submit]:visible').first();
await submit.scrollIntoViewIfNeeded();
await sleep(400);
await click(submit);
await sleep(1800);
const errs = await page.evaluate(() => {
  const list = [...document.querySelectorAll('#anfrage [role=alert], #anfrage [aria-live], #anfrage [id$="-error"], #anfrage p')].filter((e) => /Bitte/.test(e.textContent)).map((e) => ({ text: e.textContent.trim().slice(0, 70), color: getComputedStyle(e).color, fs: getComputedStyle(e).fontSize }));
  const invalid = [...document.querySelectorAll('#anfrage [aria-invalid="true"]')].map((e) => ({ name: e.name, describedby: e.getAttribute('aria-describedby'), border: getComputedStyle(e).borderColor, bg: getComputedStyle(e).backgroundColor }));
  const active = document.activeElement;
  return { list, invalid, focus: active ? `${active.tagName}#${active.name || active.id}` : null };
});
console.log('validation', JSON.stringify(errs));
const errTop = await page.evaluate(() => { const e = [...document.querySelectorAll('#anfrage *')].find((x) => x.children.length === 0 && /Bitte geben Sie Ihr Unternehmen/.test(x.textContent)); return e ? Math.round(e.getBoundingClientRect().top + scrollY) : null; });
if (errTop) await scrollTo(page, errTop - 300, 700);
await page.screenshot({ path: `${out}/${device}-4-errors.png` });

// fill with fake data
await page.fill('#anfrage input[name=company]', 'Testfirma');
await page.fill('#anfrage input[name=contact], #anfrage input[name=name], #anfrage input[name=person]', 'Test Person');
await page.fill('#anfrage input[type=email]', 'test@example.com');
await page.fill('#anfrage textarea', 'Testanfrage des Reviewers, bitte ignorieren.');
const cb = page.locator('#anfrage input[type=checkbox]').first();
await cb.check({ force: true });
await sleep(300);
await page.screenshot({ path: `${out}/${device}-5-filled.png` });
await click(submit);
await sleep(300);
await page.screenshot({ path: `${out}/${device}-6-pending.png` });
await sleep(3500);
const succ = await page.evaluate(() => {
  const h = [...document.querySelectorAll('#anfrage h2, #anfrage h3')].find((x) => /eingegangen/.test(x.textContent));
  const box = h?.closest('div, section');
  return { heading: h?.textContent, focus: document.activeElement?.tagName + ':' + (document.activeElement?.textContent || '').trim().slice(0, 40), text: box ? box.innerText.replace(/\s+/g, ' ').slice(0, 600) : null, formStillThere: !!document.querySelector('#anfrage input[name=company]'), scrollY: Math.round(scrollY), headingTop: h ? Math.round(h.getBoundingClientRect().top) : null };
});
console.log('success', JSON.stringify(succ));
await page.screenshot({ path: `${out}/${device}-7-success.png` });
console.log('logs', JSON.stringify(logs));
await browser.close();
