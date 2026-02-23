# Deploy Guide (Vercel + Railway)

## 1) Railway

1. Create PostgreSQL service.
2. Create `cms` service from `apps/cms`.
3. Set env vars:
- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `PAYLOAD_SERVICE_TOKEN`
- `PAYLOAD_PUBLIC_URL`
- `APPS_WEB_URL` (Vercel production URL)
- `ADMIN_EMAIL_ALLOWLIST`
4. Deploy and verify:
- `https://<cms-domain>/admin`
- `https://<cms-domain>/api/web/posts` returns 401 without token

## 2) Vercel

1. Import project and set root to `apps/web`.
2. Set env vars:
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `PAYLOAD_PUBLIC_URL` (Railway CMS URL)
- `PAYLOAD_SERVICE_TOKEN` (must match Railway)
- `APPS_WEB_URL` (Vercel domain)
- `COOKIE_DOMAIN` (optional)
- `ADMIN_EMAIL_ALLOWLIST`
3. Deploy.

## 3) Content Migration

Run once from repo root (with CMS reachable):

```bash
pnpm migrate:content
```

## 4) Cutover

1. Validate post counts and random slug checks.
2. Validate auth and role permissions.
3. Validate password-protected post unlock flow.
4. Switch traffic to new web app.

## 5) Rollback

1. Switch DNS / Vercel project back to legacy app.
2. Keep CMS data intact (no reverse sync to markdown).
