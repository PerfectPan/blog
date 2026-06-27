---
name: deploy
description: Deploy the blog to Cloudflare Workers safely. Use when the user asks to deploy, ship, or release the site, or to push changes live to Cloudflare.
---

# Deploy the blog to Cloudflare Workers

This blog runs entirely on Cloudflare: the `@blog/web` TanStack Start app is a
Worker, content is git-backed markdown, users/roles live in **D1**, and the
worker must stay under the **3 MiB gzip free-tier limit**.

Run these steps **in order**. Do not skip the gates — they exist to prevent a
broken or over-budget deploy.

## 0. Preconditions

- `pnpm exec wrangler whoami` succeeds (logged in). If not: tell the user to run
  `! pnpm exec wrangler login`.
- Production secret is set once per account:
  `pnpm --filter @blog/web exec wrangler secret put BETTER_AUTH_SECRET`
  (generate with `openssl rand -base64 32`). Optional: `GITHUB_CLIENT_ID`,
  `GITHUB_CLIENT_SECRET`.

## 1. Verify (never deploy red)

```bash
pnpm typecheck
pnpm biome check ./apps ./packages
```

## 2. Build

```bash
pnpm --filter @blog/web build
```

## 3. Bundle-size gate (free-tier budget)

```bash
pnpm --filter @blog/web exec wrangler deploy -c dist/server/wrangler.json --dry-run
```

Read the `Total Upload: ... / gzip: <N> KiB` line. **If gzip ≥ 3072 KiB, STOP**
— deploying needs the $5/mo Workers Paid plan. Report the number and ask the
user before continuing.

## 4. Apply D1 migrations (only if `apps/web/migrations/` changed)

```bash
pnpm --filter @blog/web exec wrangler d1 migrations apply blog --remote
```

## 5. Deploy

```bash
pnpm --filter @blog/web exec wrangler deploy -c dist/server/wrangler.json
```

## 6. Smoke test (confirm it actually serves)

Production is `https://perfectpan.org` (the Worker Custom Domain). Verify the
real routes (no `/healthz` route exists — use these):

```bash
# each should be HTTP 200 with no x-vercel-* header (proves the Worker, not Vercel)
for p in / /blog /projects /login; do
  curl -sI "https://perfectpan.org$p" | grep -iE "^(HTTP|server|x-vercel)"
done
curl -sI "https://perfectpan.org/api/auth/get-session" | grep -iE "^HTTP"   # 200
# www must 301 to the apex, path preserved:
curl -sI "https://www.perfectpan.org/blog" | grep -iE "^(HTTP|location)"     # 301 -> perfectpan.org/blog
```

Also click through: `/`, `/blog`, `/blog/<slug>`, `/projects`, and a login.
Report what you verified. Only then is the deploy done.

## 7. Custom domains (managed by wrangler, not the dashboard)

`perfectpan.org` and `www.perfectpan.org` are **Worker Custom Domains** declared
in `apps/web/wrangler.jsonc` (`routes` → `custom_domain: true`). They attach
automatically on `wrangler deploy` — do **not** wire them up in the dashboard.

Known gotcha when binding/switching a hostname: Worker Custom Domains require the
hostname to have **no existing DNS record**, otherwise deploy fails with
`409 / code 100117: already has externally managed DNS records`. The `wrangler login`
OAuth token has **no `dns:edit`** scope, so you cannot clear it yourself — delete the
conflicting A/AAAA/CNAME records (apex + www) in the dashboard first, then redeploy;
Cloudflare recreates the records + cert (the zone's Universal SSL already covers
`perfectpan.org` / `*.perfectpan.org`, so HTTPS is immediate). The `www → apex` 301
is handled **inside the worker** (`apps/web/src/server.tsx`), not via a Cloudflare
Redirect Rule (the token lacks `rulesets:write` too).
