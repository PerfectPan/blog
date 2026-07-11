# PerfectPan's Blog

A personal blog running **entirely on Cloudflare**, for **$0/month**.

- `apps/web`: TanStack Start app deployed as a **Cloudflare Worker** (`blog-web`).
- `packages/shared`: shared role / visibility / access types and pure helpers.
- Content lives in **Cloudflare D1** (the `post` table), managed via the in-app
  `/admin` editor. There is **no CMS and no external content database** — the
  historical `content/blog/*.md` sources were migrated into D1 once and removed.

## Architecture

| Concern | Tech | Cost |
| --- | --- | --- |
| Frontend + SSR + server fns | TanStack Start on CF Workers | free (≈1.18 MiB gzip / 3 MiB limit) |
| Content | D1 `post` table (markdown bodies), edited via `/admin` | free |
| Users / roles / sessions | Better Auth → Cloudflare D1 (SQLite) | free |
| Backups | D1 Time Travel + weekly R2 export | free |
| Media (optional) | Cloudflare R2 | free tier |

> `docs/architecture.md` is the **single source of truth** for the current
> architecture (data model, request flow, two-layer authz, security, backups).
> This README is only a quick orientation. The old Vercel + Payload + Postgres
> stack (2026-02) is decommissioned — see
> `docs/plans/2026-06-22-cloudflare-migration-design.md`.

## Workspace

```bash
pnpm install
```

## Local development

```bash
cp apps/web/.dev.vars.example apps/web/.dev.vars   # fill BETTER_AUTH_SECRET
pnpm --filter @blog/web db:migrate:local           # create local D1 + auth tables + seed
pnpm dev                                           # vite dev server
# or run the worker runtime locally:
pnpm --filter @blog/web preview                    # wrangler dev
```

## Writing a post

Posts are managed through the **`/admin`** editor (sign in as admin, then
create / edit). Each post is an upsert on the D1 `post` table keyed by `slug`:

- `visibility`: `public | member | vip | admin | password` (default `public`)
- `status`: `published | draft`
- `password`: only when `visibility: password`
- `tags`: JSON array

Code blocks get shiki highlighting; `$math$` via KaTeX. **Do not** add new
`content/blog/*.md` files — that format is retired; everything goes through D1.

## Access model

- Roles: `member | vip | admin` (stored in D1 `user.role`).
- Post visibility: `public | member | vip | admin | password`.
- Gating is enforced on **two layers** (both required):
  1. **Data layer** (`getBlogPostServerFn`): unauthorized callers get the post
     with its body stripped — server fns are reachable over RPC, so the route
     loader alone is not enough.
  2. **Route loader**: `password` posts redirect to `/unlock/:slug`;
     `member/vip/admin` posts return 401/403 when unauthorized.
- Password posts use `/unlock/:slug` with an HMAC-signed HttpOnly cookie (24h).

## Deploy

Push to `master` → GitHub Actions applies D1 migrations, builds, and runs
`wrangler deploy`. To deploy by hand, use the `/deploy` skill or:

```bash
pnpm --filter @blog/web exec wrangler secret put BETTER_AUTH_SECRET   # once
pnpm deploy
```

Required production config:

- secret `BETTER_AUTH_SECRET` (`openssl rand -base64 32`)
- var `APPS_WEB_URL` (in `apps/web/wrangler.jsonc`)
- optional secrets `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
- D1 binding `DB` (already provisioned: database `blog`)

## RSS

`GET /rss.xml` — public posts only.
