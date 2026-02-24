# PerfectPan's Blog Monorepo

This repo now contains:

- `apps/web`: TanStack Start frontend with Better Auth.
- `apps/cms`: Payload CMS with role-based content access.
- `packages/shared`: shared role/visibility/access types.

## Workspace

```bash
pnpm install
```

## Local Development

1. Prepare env files:

- copy `apps/cms/.env.example` to `apps/cms/.env`
- copy `apps/web/.env.example` to `apps/web/.env`
- keep `DATABASE_URL` and `PAYLOAD_SERVICE_TOKEN` consistent in both apps

2. Start CMS:

```bash
pnpm dev:cms
```

3. Migrate old markdown posts into CMS:

```bash
pnpm migrate:content
```

4. Start web:

```bash
pnpm dev:web
```

5. Start both apps in parallel:

```bash
pnpm dev:new
```

## Auth & Access Model

- auth provider: Better Auth (`email/password` + `GitHub OAuth`)
- roles: `member | vip | admin`
- post visibility: `public | member | vip | admin | password`
- password posts require `/unlock/:slug` with signed HttpOnly cookie (24h)

## CMS Endpoints for Web (service-token protected)

- `GET /api/web/posts`
- `GET /api/web/posts/:slug`
- `POST /api/web/posts/:slug/verify-password`

All requests must include `x-service-token` and should be sent only from the web server.

## RSS

- `GET /rss.xml`
- includes only `published + public` posts

## Deployment

- `apps/web` deploy to Vercel
- `apps/cms` + Postgres deploy to Railway

Required env keys:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `PAYLOAD_SECRET`
- `PAYLOAD_PUBLIC_URL`
- `PAYLOAD_SERVICE_TOKEN`
- `COOKIE_DOMAIN`
- `APPS_WEB_URL`
- `ADMIN_EMAIL_ALLOWLIST`
