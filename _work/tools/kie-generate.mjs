#!/usr/bin/env node
// Generates images through the kie.ai Market API (GPT Image 2.5) and downloads the results.
//
// Usage:
//   node kie-generate.mjs <jobs.json> [--out <dir>] [--only name1,name2]
//
// jobs.json: [{ "name": "insole-pair", "prompt": "...", "aspect_ratio": "3:2",
//              "resolution": "2K", "variant": "sunburst" | "flare",
//              "input_urls": ["https://..."]   // optional -> image-to-image
//           }]
// The API key is read from KIE_API_KEY (environment or <project root>/.env.local).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');

function apiKey() {
  if (process.env.KIE_API_KEY) return process.env.KIE_API_KEY;
  const envFile = join(root, '.env.local');
  if (existsSync(envFile)) {
    const m = readFileSync(envFile, 'utf8').match(/^KIE_API_KEY=(.+)$/m);
    if (m) return m[1].trim();
  }
  throw new Error('KIE_API_KEY not found (env or .env.local)');
}

const args = process.argv.slice(2);
const jobsFile = args[0];
const optOf = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};
const outDir = resolve(optOf('out', join(root, '_work', 'media', 'generated')));
const only = optOf('only', '');
if (!jobsFile) {
  console.error('usage: node kie-generate.mjs <jobs.json> [--out dir] [--only a,b]');
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const KEY = apiKey();
const BASE = 'https://api.kie.ai/api/v1/jobs';
const headers = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function createTask(job) {
  const variant = job.variant === 'flare' ? 'flare' : 'sunburst';
  const kind = job.input_urls?.length ? 'image-to-image' : 'text-to-image';
  const input = {
    prompt: job.prompt,
    aspect_ratio: job.aspect_ratio ?? '3:2',
    resolution: job.resolution ?? '2K',
  };
  if (job.input_urls?.length) input.input_urls = job.input_urls;
  if (job.background) input.background = job.background;
  const res = await fetch(`${BASE}/createTask`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: `gpt-image-2-5-${variant}-${kind}`, input }),
  });
  const json = await res.json();
  if (json.code !== 200) throw new Error(`createTask failed for ${job.name}: ${JSON.stringify(json)}`);
  return json.data.taskId;
}

async function waitFor(taskId, name) {
  let delay = 4000;
  for (let i = 0; i < 90; i++) {
    await sleep(delay);
    delay = Math.min(delay * 1.25, 12000);
    const res = await fetch(`${BASE}/recordInfo?taskId=${encodeURIComponent(taskId)}`, { headers });
    const json = await res.json();
    const state = json?.data?.state;
    if (state === 'success') return JSON.parse(json.data.resultJson).resultUrls;
    if (state === 'fail') throw new Error(`${name} failed: ${json.data.failCode} ${json.data.failMsg}`);
  }
  throw new Error(`${name} timed out`);
}

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status} ${url}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

let jobs = JSON.parse(readFileSync(jobsFile, 'utf8'));
if (only) jobs = jobs.filter((j) => only.split(',').includes(j.name));

const results = await Promise.allSettled(
  jobs.map(async (job) => {
    const taskId = await createTask(job);
    console.log(`queued  ${job.name} (${taskId})`);
    const urls = await waitFor(taskId, job.name);
    const files = [];
    for (let i = 0; i < urls.length; i++) {
      const ext = (urls[i].split('?')[0].match(/\.(png|jpe?g|webp)$/i)?.[1] ?? 'png').toLowerCase();
      const file = join(outDir, `${job.name}${urls.length > 1 ? `-${i + 1}` : ''}.${ext}`);
      await download(urls[i], file);
      files.push(file);
    }
    console.log(`done    ${job.name} -> ${files.join(', ')}`);
    return files;
  }),
);

const failed = results.filter((r) => r.status === 'rejected');
for (const f of failed) console.error('ERROR  ', f.reason.message);
process.exit(failed.length ? 1 : 0);
