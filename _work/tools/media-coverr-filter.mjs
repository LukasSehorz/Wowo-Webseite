#!/usr/bin/env node
// Find out how Coverr's "Hide AI-generated" filter is expressed (URL param / cookie / localStorage).
import { chromium } from 'playwright';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const browser = await chromium.launch();
const context = await browser.newContext({ userAgent: UA, viewport: { width: 1600, height: 900 }, locale: 'en-US' });
const page = await context.newPage();
const apiCalls = [];
page.on('request', (r) => { const u = r.url(); if (/api|search|graphql/i.test(u) && !/\.(js|css|png|jpg|mp4|woff)/.test(u)) apiCalls.push(`${r.method()} ${u}`); });
await page.goto('https://coverr.co/s?q=running', { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
await page.getByText('Got it!').first().click({ timeout: 3000 }).catch(() => {});
const before = await page.evaluate(() => document.querySelectorAll('a[href*="/videos/"]').length);
await page.getByText('Show AI-generated').first().click({ timeout: 5000 });
await page.waitForTimeout(600);
apiCalls.length = 0;
await page.locator('div', { hasText: /^Hide AI-generated$/ }).last().click({ timeout: 5000 });
await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
await page.waitForTimeout(1500);
const after = await page.evaluate(() => document.querySelectorAll('a[href*="/videos/"]').length);
console.log('url after:', page.url());
console.log('video links before/after:', before, after);
console.log('api calls after toggle:', JSON.stringify(apiCalls.slice(0, 10), null, 1));
const ls = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([k, v]) => /ai/i.test(k) || /ai/i.test(String(v).slice(0, 80))).map(([k, v]) => [k, String(v).slice(0, 120)])));
console.log('localStorage:', JSON.stringify(ls));
const ck = (await context.cookies()).filter((c) => /ai|filter|pref/i.test(c.name)).map((c) => `${c.name}=${c.value.slice(0, 60)}`);
console.log('cookies:', JSON.stringify(ck));
await browser.close();
