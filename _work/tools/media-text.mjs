#!/usr/bin/env node
// Print the visible text of a page (optionally after clicking a text link). Usage: node media-text.mjs <url> [clickText] [grepRegex]
import { chromium } from 'playwright';
const [url, clickText, grep] = process.argv.slice(2);
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const browser = await chromium.launch();
const page = await (await browser.newContext({ userAgent: UA, viewport: { width: 1400, height: 1000 }, locale: 'en-US' })).newPage();
const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
if (clickText && clickText !== '-') { await page.getByText(clickText).first().click({ timeout: 5000 }).catch((e) => console.log('click failed:', e.message.split('\n')[0])); await page.waitForTimeout(1500); }
let text = await page.evaluate(() => document.body.innerText);
console.log('status', resp?.status(), 'url', page.url());
if (grep) { const re = new RegExp(grep, 'i'); text = text.split('\n').filter((l) => re.test(l)).join('\n'); }
console.log(text.slice(0, 6000));
await browser.close();
