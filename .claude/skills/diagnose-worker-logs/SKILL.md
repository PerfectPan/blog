---
name: diagnose-worker-logs
description: Diagnose Cloudflare Worker problems on perfectpan.org — slow requests, 500s, errors, articles failing to open, performance complaints. Searches historical Workers Observability logs (wrangler can only `tail` live). Use when the user reports the site is slow, broken, or erroring, or asks to check Worker logs / investigate a production incident.
---

# Diagnose Worker problems via Observability logs

The blog is the `blog-web` Cloudflare Worker. `wrangler tail` only shows
**live** logs. A user usually reports an incident *after* it happens, so reach
for **Workers Observability** via this skill's helper,
`scripts/workers-logs.mjs` (next to this file). **You** invoke it — the user
doesn't query logs directly.

## 0. Preconditions

Credentials live in `.cloudflare/env` (gitignored; copy from
`.cloudflare/env.example`). Needs `CLOUDFLARE_API_TOKEN` (Account → Workers
Observability → Read) + `CLOUDFLARE_ACCOUNT_ID` (from `wrangler whoami`). If the file is missing or the
API returns auth errors, tell the user to create the token — the OAuth
`wrangler login` token **cannot** search logs (no Observability OAuth scope;
verified 2026-07-26).

## 1. Pull recent errors

```bash
node .claude/skills/diagnose-worker-logs/scripts/workers-logs.mjs --errors --since 60
```

Narrow with `--grep <text>` (matches url + message), widen `--since <min>`,
override the worker with `--worker <name>`. The script prints `rows_read` — a
high number means busy traffic (often bots); always filter with `--errors` /
`--grep` rather than reading raw.

## 2. Read the error patterns

| Stack / message | Means | Direction |
|---|---|---|
| `WebAssembly.instantiate` → `createOnigurumaEngine` → `createHighlighterCore`, on `/blog/<slug>` SSR | shiki's WASM engine failed to instantiate on the Worker (memory/CPU pressure) → article 500s | the engine should be the **JS regex engine** (`createJavaScriptRegexEngine`), not oniguruma (fix PR #88, 2026-07-26). If this returns, `markdown.tsx` regressed back to oniguruma WASM. |
| `throwRouteHandlerError` … `getFinalResponse`, on `/_serverFn/…` | a route loader / server-fn threw → 500 | URL-decode the `payload=` query to find which fn + slug (e.g. `{"slug":"record-2019"}`), then read that loader. |
| `Error in renderToReadableStream` (+ `componentStack`) | SSR-time render crash | the component in `componentStack` threw during server render. |
| `GET /wp-admin`, `/wp-login.php` flooding | bot WordPress-exploit scans — cheap 404s | **noise, not the bug.** Ignore (or block at the CF WAF later). |

Each event also carries `$workers.event.request` (url/method) and
`.response.status`; the script formats these.

## 3. Correlate with deploys

```bash
git log --oneline origin/master -10
```

If errors began right after a deploy, diff that commit. Manual `wrangler deploy`
and Workers Builds (CI from `master`) can silently diverge — see the `deploy`
skill §8; confirm which code is actually live.

## 4. Confirm live (if it's happening right now)

```bash
wrangler --env-file .cloudflare/env tail blog-web
```

## 5. Reproduce & measure (when logs are inconclusive)

A single load test often looks fine on a quiet minute. To catch an
intermittent:

- Loop the suspect route (Playwright, or `while … curl … ; sleep 1`) and time
  each response — flag anything > 1s. (This is how the shiki WASM failure was
  confirmed: 403 samples, p50 ~110ms, but the user's one request was 2.2min.)
- Cross-check D1 health/size:
  ```bash
  wrangler --env-file .cloudflare/env d1 execute blog --remote --command "SELECT 'session', COUNT(*) FROM session UNION ALL SELECT 'post', COUNT(*) FROM post"
  ```

## Gotchas

- `rows_read` can be in the millions per few minutes (bot traffic). Always
  filter (`--errors`, `--grep`) — don't eyeball raw events.
- The response shape is `result.events.events[]` (nested) — the script handles
  it; don't hand-parse.
- Event timestamps are UTC (ms). The user's "it was slow at X" is usually local
  time — convert before narrowing the window.
