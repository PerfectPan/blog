// scripts/workers-logs.mjs
// Search historical Workers Observability logs for the blog-web Worker.
// `wrangler` only does live `tail`; historical search needs this API + a token.
//
// Reads CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID from .cloudflare/env
// (gitignored — copy from .cloudflare/env.example). Process env overrides.
//
//   pnpm logs:search                       # last 30min, all events
//   pnpm logs:search -- --errors           # errors only
//   pnpm logs:search -- --since 120        # last 120min
//   pnpm logs:search -- --grep record-2019 # substring on url + message
//   pnpm logs:search -- --worker blog-web --limit 200

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

// Walk up from cwd to find .cloudflare/env (works from repo root or apps/web).
// Existing process.env wins over the file.
function loadEnvFile() {
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
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
