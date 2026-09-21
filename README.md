# PerfectPan's Blog

My personal blog at [perfectpan.org](https://perfectpan.org). It runs entirely
on Cloudflare and costs $0/month.

## Stack

- [TanStack Start](https://tanstack.com/start) on a Cloudflare Worker (SSR + server functions)
- [Cloudflare D1](https://developers.cloudflare.com/d1/) for posts and user data, R2 for media
- [Better Auth](https://www.better-auth.com/) for accounts and sessions
- Posts are written in the built-in `/admin` editor and stored as markdown in D1, no CMS

The repo is a pnpm workspace: `apps/web` is the site, `packages/shared` holds
shared types. Design notes and internal docs live in
[docs/architecture.md](docs/architecture.md).

## Development

```bash
pnpm install
cp apps/web/.dev.vars.example apps/web/.dev.vars   # fill in the values
pnpm --filter @blog/web db:migrate:local           # local D1 schema + seed
pnpm dev                                           # vite dev server
# or against the real worker runtime:
pnpm --filter @blog/web preview                    # wrangler dev
```

## Deploy

Pushes to `master` build and deploy automatically through Cloudflare Workers
Builds, and PR branches get preview URLs. The RSS feed is at
[`/rss.xml`](https://perfectpan.org/rss.xml).
