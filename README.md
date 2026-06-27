# PerfectPan's Blog

A personal blog running **entirely on Cloudflare**, for **$0/month**.

- `apps/web`: TanStack Start app deployed as a **Cloudflare Worker**.
- `packages/shared`: shared role / visibility / access types.
- `content/blog`: posts as **git-backed markdown** (no CMS, no external DB for content).
- Auth + roles: **Better Auth** on **Cloudflare D1**.

## Architecture

| Concern | Tech | Cost |
| --- | --- | --- |
| Frontend + SSR + server fns | TanStack Start on CF Workers | free (≈1.3 MiB gzip / 3 MiB limit) |
| Content | markdown in `content/blog`, inlined at build | free |
| Users / roles / sessions | Better Auth → Cloudflare D1 (SQLite) | free |
| Media (optional) | Cloudflare R2 | free tier |

There is **no Payload CMS and no Postgres** — those were removed in the
Cloudflare migration. See `docs/plans/2026-06-22-cloudflare-migration-design.md`.

## Workspace

```bash
pnpm install
```

## Local development

```bash
cp apps/web/.dev.vars.example apps/web/.dev.vars   # fill BETTER_AUTH_SECRET
pnpm --filter @blog/web db:migrate:local           # create local D1 + auth tables
pnpm dev                                            # vite dev server
# or run the worker runtime locally:
pnpm --filter @blog/web preview                     # wrangler dev
```

## Writing a post

Add a markdown file under `content/blog/`, then commit + push:

```markdown
---
title: My Post
date: 2026-06-22
description: One-line summary
tag: [TypeScript]
visibility: public        # public | member | vip | admin | password (default: public)
# password: "hunter2"     # only when visibility: password
# status: draft           # omit or 'published' to publish
---

Body in markdown. Code blocks get shiki highlighting; `$math$` via KaTeX.
```

## Access model

- roles: `member | vip | admin` (stored in D1)
- post visibility: `public | member | vip | admin | password`
- gating is enforced **server-side** in the route loaders
- password posts use `/unlock/:slug` with a signed HttpOnly cookie (24h)

## Deploy

Push to `master` → GitHub Actions builds, applies D1 migrations, and runs
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
