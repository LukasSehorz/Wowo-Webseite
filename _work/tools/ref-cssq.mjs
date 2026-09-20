#!/usr/bin/env node
// Tiny brace-aware CSS query tool: prints rules whose selector (or body with --body) matches a regex,
// including the enclosing @media / @supports condition.
// Usage: node ref-cssq.mjs <file.css> <regex> [--body] [--max 40] [--len 500]
import { readFileSync } from 'node:fs';

const [file, pattern, ...rest] = process.argv.slice(2);
const inBody = rest.includes('--body');
const num = (n, d) => {
  const i = rest.indexOf(`--${n}`);
  return i >= 0 ? parseInt(rest[i + 1], 10) : d;
};
const max = num('max', 40);
const len = num('len', 500);
const re = new RegExp(pattern);
const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

let count = 0;
function walk(src, ctx) {
  let i = 0;
  while (i < src.length) {
    const open = src.indexOf('{', i);
    if (open < 0) break;
    const prelude = src.slice(i, open).trim();
    // find matching close
    let depth = 1;
    let j = open + 1;
    while (j < src.length && depth > 0) {
      if (src[j] === '{') depth += 1;
      else if (src[j] === '}') depth -= 1;
      j += 1;
    }
    const body = src.slice(open + 1, j - 1);
    if (/^@(media|supports|container|layer)/.test(prelude)) {
      walk(body, [...ctx, prelude.replace(/\s+/g, ' ')]);
    } else if (/^@keyframes|^@-webkit-keyframes/.test(prelude)) {
      if (re.test(prelude) && count < max) {
        count += 1;
        console.log(`${ctx.length ? '[' + ctx.join(' && ') + '] ' : ''}${prelude} { ${body.replace(/\s+/g, ' ').slice(0, len)} }`);
      }
    } else if (!prelude.startsWith('@')) {
      const hit = inBody ? re.test(body) : re.test(prelude);
      if (hit && count < max) {
        count += 1;
        console.log(`${ctx.length ? '[' + ctx.join(' && ') + '] ' : ''}${prelude.replace(/\s+/g, ' ').slice(-320)} { ${body.replace(/\s+/g, ' ').trim().slice(0, len)} }`);
      }
    }
    i = j;
  }
}
walk(css, []);
if (!count) console.log('(no match)');
