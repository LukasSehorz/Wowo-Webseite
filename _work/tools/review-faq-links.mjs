// Gutscheine: FAQ accordion (open, one-at-a-time, keyboard, timing), tier chip click, deep link on hard load, header CTA from Home, hero buttons.
import { open, roundDir, scrollTo, sleep } from './review-lib.mjs';

const out = roundDir(undefined, 'config');
const device = process.argv[2] || 'desktop';
const isMobile = device === 'mobile';
const { browser, page } = await open('/gutscheine', device);
const click = async (loc) => (isMobile ? loc.tap() : loc.click());

// --- tier chip: does clicking a tier set the quantity?
const before = await page.evaluate(() => document.querySelector('#anfrage input[type=number], #anfrage input[inputmode=numeric]').value);
const chip = page.locator('#anfrage label', { hasText: 'ab 50' }).first();
await chip.scrollIntoViewIfNeeded();
await sleep(400);
await click(chip);
await sleep(900);
const after = await page.evaluate(() => {
  const q = document.querySelector('#anfrage input[type=number], #anfrage input[inputmode=numeric]').value;
  const inp = [...document.querySelectorAll('#anfrage input')].find((i) => i.closest('label')?.textContent.includes('ab 50'));
  return { q, inputType: inp?.type, name: inp?.name, checked: inp?.checked, disabled: inp?.disabled, tabindex: inp?.tabIndex };
});
console.log('tier chip click: qty before', before, 'after', JSON.stringify(after));

// --- FAQ
const faqTop = await page.evaluate(() => Math.round(document.querySelector('#fragen').getBoundingClientRect().top + scrollY));
await scrollTo(page, faqTop + (isMobile ? 40 : 60), 1500);
await page.screenshot({ path: `${out}/${device}-faq-0-closed.png` });
const info = await page.evaluate(() => {
  const items = [...document.querySelectorAll('#fragen details, #fragen [aria-expanded]')];
  const first = items[0];
  const cs = first ? getComputedStyle(first.querySelector('summary') || first) : null;
  const card = document.querySelector('#fragen details')?.closest('div');
  const ccs = card ? getComputedStyle(card) : null;
  const q = first?.querySelector('summary h3, summary span, summary') || first;
  const qcs = q ? getComputedStyle(q) : null;
  return { count: items.length, kind: first?.tagName, summaryPad: cs?.padding, rowH: first?.getBoundingClientRect().height, question: qcs ? { fs: qcs.fontSize, fw: qcs.fontWeight } : null, card: ccs ? { border: ccs.borderWidth + ' ' + ccs.borderColor, radius: ccs.borderRadius, pad: ccs.padding, w: Math.round(card.getBoundingClientRect().width) } : null, icon: first?.querySelector('svg') ? getComputedStyle(first.querySelector('svg')).width : null };
});
console.log('faq', JSON.stringify(info));
const q1 = page.locator('#fragen summary, #fragen button[aria-expanded]').first();
await click(q1);
const samples = await page.evaluate(async () => {
  const btn = document.querySelector('#fragen button[aria-expanded]');
  const d = btn.closest('li, div');
  const content = document.getElementById(btn.getAttribute('aria-controls')) || btn.parentElement.nextElementSibling;
  const t0 = performance.now();
  const log = [];
  await new Promise((res) => {
    const tick = () => {
      const t = Math.round(performance.now() - t0);
      const svg = btn.querySelector('svg');
      log.push({ t, h: Math.round(d.getBoundingClientRect().height), op: content ? getComputedStyle(content).opacity : null, rot: svg ? getComputedStyle(svg).transform : null });
      if (t < 900) requestAnimationFrame(tick); else res();
    };
    requestAnimationFrame(tick);
  });
  const pick = (ms) => log.reduce((a, b) => (Math.abs(b.t - ms) < Math.abs(a.t - ms) ? b : a));
  return [0, 100, 200, 300, 400, 600, 850].map(pick);
});
console.log('open timing', JSON.stringify(samples));
await sleep(400);
await page.screenshot({ path: `${out}/${device}-faq-1-open.png` });
const openState = await page.evaluate(() => {
  const open = [...document.querySelectorAll('#fragen button[aria-expanded="true"]')].map((b) => b.textContent.trim().slice(0, 40));
  const ob = document.querySelector('#fragen button[aria-expanded="true"]');
  const answer = ob ? (document.getElementById(ob.getAttribute('aria-controls')) || ob.parentElement.nextElementSibling)?.querySelector('p') : null;
  const acs = answer ? getComputedStyle(answer) : null;
  return { open, answer: acs ? { fs: acs.fontSize, lh: acs.lineHeight, maxW: acs.maxWidth, w: Math.round(answer.getBoundingClientRect().width), pb: acs.paddingBottom } : null, scrollY: Math.round(scrollY) };
});
console.log('open state', JSON.stringify(openState));
// open second → first should close
const q2 = page.locator('#fragen summary, #fragen button[aria-expanded]').nth(1);
await click(q2);
await sleep(800);
const twoState = await page.evaluate(() => [...document.querySelectorAll('#fragen button[aria-expanded="true"]')].map((b) => b.textContent.trim().slice(0, 30)));
console.log('after opening #2, open:', JSON.stringify(twoState));
await page.screenshot({ path: `${out}/${device}-faq-2-second.png` });
// keyboard: focus summary 3, Enter
if (!isMobile) {
  const s3 = page.locator('#fragen button[aria-expanded]').nth(2);
  await s3.focus();
  await page.keyboard.press('Enter');
  await sleep(800);
  const kb = await page.evaluate(() => ({ open: [...document.querySelectorAll('#fragen button[aria-expanded="true"]')].map((b) => b.textContent.trim().slice(0, 30)), outline: getComputedStyle(document.activeElement).outlineStyle + ' ' + getComputedStyle(document.activeElement).outlineColor }));
  console.log('keyboard Enter on #3', JSON.stringify(kb));
  const b = await s3.boundingBox();
  await page.screenshot({ path: `${out}/${device}-faq-3-focus.png`, clip: { x: b.x - 20, y: b.y - 20, width: b.width + 40, height: b.height + 40 } });
}
// contact column
const contact = await page.evaluate(() => {
  const h = [...document.querySelectorAll('#fragen h2, #fragen h3')].find((x) => /Lieber persönlich/.test(x.textContent));
  const cs = getComputedStyle(h);
  const vals = [...h.parentElement.querySelectorAll('a, p, span')].filter((e) => e.children.length === 0 && /Angabe folgt|@|\+49|Telefon|E-Mail/.test(e.textContent)).map((e) => ({ t: e.textContent.trim(), tag: e.tagName, fs: getComputedStyle(e).fontSize, color: getComputedStyle(e).color }));
  return { h: { fs: cs.fontSize, fw: cs.fontWeight }, vals };
});
console.log('contact', JSON.stringify(contact));
await browser.close();

// --- deep link on hard load
{
  const { browser: b2, page: p2 } = await open('/gutscheine#anfrage', device);
  await sleep(2500);
  const s = await p2.evaluate(() => ({ y: Math.round(scrollY), top: Math.round(document.querySelector('#anfrage').getBoundingClientRect().top), h2Top: Math.round([...document.querySelectorAll('h2')].find((h) => /Anzahl wählen/.test(h.getAttribute('aria-label') || h.textContent)).getBoundingClientRect().top), hiddenText: [...document.querySelectorAll('#anfrage [data-reveal], #anfrage [data-split]')].filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.9).length }));
  console.log('deep link hard load', JSON.stringify(s));
  await p2.screenshot({ path: `${out}/${device}-deeplink-anfrage.png` });
  await b2.close();
}
// --- header CTA from Home (client navigation)
{
  const { browser: b3, page: p3 } = await open('/', device);
  await sleep(800);
  if (isMobile) {
    await p3.locator('header button').first().tap();
    await sleep(900);
    await p3.locator('[role=dialog] a', { hasText: 'Gutscheine anfragen' }).first().tap();
  } else {
    await p3.locator('header a', { hasText: 'Gutscheine anfragen' }).first().click();
  }
  await sleep(3500);
  const s = await p3.evaluate(() => ({ url: location.pathname + location.hash, y: Math.round(scrollY), top: document.querySelector('#anfrage') ? Math.round(document.querySelector('#anfrage').getBoundingClientRect().top) : null, headerH: document.querySelector('header').getBoundingClientRect().height }));
  console.log('header CTA from home', JSON.stringify(s));
  await p3.screenshot({ path: `${out}/${device}-cta-from-home.png` });
  // hero button "Anzahl wählen" and text link "So funktioniert es" on the vouchers page itself
  await p3.evaluate(() => window.scrollTo(0, 0));
  await sleep(600);
  await (isMobile ? p3.locator('main a', { hasText: 'Anzahl wählen' }).first().tap() : p3.locator('main a', { hasText: 'Anzahl wählen' }).first().click());
  await sleep(3000);
  const s2 = await p3.evaluate(() => ({ hash: location.hash, top: Math.round(document.querySelector('#anfrage').getBoundingClientRect().top) }));
  await p3.evaluate(() => window.scrollTo(0, 0));
  await sleep(600);
  await (isMobile ? p3.locator('main a', { hasText: 'So funktioniert es' }).first().tap() : p3.locator('main a', { hasText: 'So funktioniert es' }).first().click());
  await sleep(3000);
  const s3 = await p3.evaluate(() => ({ hash: location.hash, top: Math.round(document.querySelector('#ablauf').getBoundingClientRect().top) }));
  console.log('hero pill → #anfrage', JSON.stringify(s2), 'text link → #ablauf', JSON.stringify(s3));
  await b3.close();
}
