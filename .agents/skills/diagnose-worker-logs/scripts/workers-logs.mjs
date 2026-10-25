// diagnose-worker-logs/scripts/workers-logs.mjs
// Helper for the diagnose-worker-logs skill: search historical Workers
// Observability logs for the blog-web Worker. `wrangler` only does live `tail`;
// historical search needs this API + a token. Not a user-facing command — the
// skill invokes this; humans don't query logs directly.
//
// Reads CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID from .cloudflare/env at the
// repo root (gitignored — copy from .cloudflare/env.example). Process env wins.
//
//   node .claude/skills/diagnose-worker-logs/scripts/workers-logs.mjs --errors
//   node .claude/skills/diagnose-worker-logs/scripts/workers-logs.mjs --since 120
//   node .claude/skills/diagnose-worker-logs/scripts/workers-logs.mjs --grep record-2019

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Walk up from THIS script's location to find the repo-root .cloudflare/env
// (cwd-independent — the skill may run from any cwd). Existing process.env wins.
function loadEnvFile() {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 8; i++) {
    try {
      for (const line of readFileSync(
        join(dir, '.cloudflare', 'env'),
        'utf8',
      ).split('\n')) {
        const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) {
          process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
        }
      }
      return;
    } catch {
      dir = dirname(dir);
    }
  }
}

loadEnvFile();

const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
if (!TOKEN) {
  console.error(
    'No CLOUDFLARE_API_TOKEN. Copy .cloudflare/env.example -> .cloudflare/env and fill it.',
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};
const sinceMin = Number(flag('since', 30));
const limit = Number(flag('limit', 100));
const errorsOnly = args.includes('--errors');
const grep = flag('grep', null);
const worker = flag('worker', 'blog-web');
const acct = flag('account', null) ?? process.env.CLOUDFLARE_ACCOUNT_ID;
if (!acct) {
  console.error(
    'No CLOUDFLARE_ACCOUNT_ID (in .cloudflare/env or --account <id>).',
  );
  process.exit(1);
}

const to = Date.now();
const from = to - sinceMin * 60 * 1000;
const body = {
  queryId: 'workers-logs',
  timeframe: { from, to },
  parameters: {
    datasets: ['cloudflare-workers'],
    filters: [
      {
        key: '$metadata.service',
        operation: 'eq',
        type: 'string',
        value: worker,
      },
    ],
    calculations: [],
    groupBys: [],
    havings: [],
  },
  view: 'events',
  limit,
};

const r = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${acct}/workers/observability/telemetry/query`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  },
);
const j = await r.json();
if (!j.success) {
  console.error('API error:', JSON.stringify(j.errors));
  process.exit(1);
}

let evs = j.result?.events?.events ?? [];
if (errorsOnly) evs = evs.filter((e) => e.source?.level === 'error');
if (grep) {
  evs = evs.filter((e) => {
    const w = e.$workers?.event;
    return `${e.source?.message ?? ''} ${w?.request?.url ?? ''}`.includes(grep);
  });
}
console.log(
  `${evs.length} events | worker=${worker} last ${sinceMin}min | rows_read=${j.result?.run?.statistics?.rows_read ?? '?'}`,
);
for (const e of evs) {
  const w = e.$workers?.event;
  const ts = new Date(e.timestamp).toISOString().slice(11, 19);
  const lvl = (e.source?.level ?? '?').padEnd(5);
  const st = w?.response?.status ?? '';
  const url = (w?.request?.url ?? '')
    .replace(/https?:\/\/[^/]+/, '')
    .slice(0, 64);
  console.log(`${ts} ${lvl} ${String(st).padEnd(4)} ${url}`);
  const msg = (e.source?.message ?? '').split('\n')[0].slice(0, 160);
  if (msg) console.log(`         ${msg}`);
}
