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

```bash
curl -fsS https://<deployed-url>/healthz   # if a health route exists
curl -fsS https://<deployed-url>/blog | head -c 300
```

Also click through: `/`, `/blog`, `/blog/<slug>`, `/projects`, and a login.
Report the deployed URL and what you verified. Only then is the deploy done.
