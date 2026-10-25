---
name: preview-smoke
description: Read-only browser smoke of a PR's Cloudflare preview deployment (https://<branch>.preview.perfectpan.org). Use after pushing a PR and before asking for merge approval, or when the user asks to verify the preview site.
---

# Preview-deploy smoke (read-only)

CI already runs this automatically on every PR (the `preview-smoke` job in
`.github/workflows/e2e.yml`). Run it manually when you want local confirmation,
when the CI job is red, or for the deeper interactive pass described in step 3.

**Never run the full e2e suite against the preview URL.** The full suite signs
up users and creates posts — the preview D1 (`blog-preview`) is shared by every
PR. Full-suite runs belong to the ephemeral local D1 only (`pnpm test:e2e`, or
the CI `e2e` job). Only `preview-smoke.spec.ts` is safe against the deployment.

## 1. Preconditions

- The branch is pushed and a PR is open. Previews exist only for non-fork
  branches (Workers Builds deploys every non-master branch).
- Derive the host: lowercase the branch name, replace every non
  alphanumeric run with a single dash, append `.preview.perfectpan.org`.
  `chore/unify-lint-on-vp` → `chore-unify-lint-on-vp.preview.perfectpan.org`.

## 2. Wait for the deployment, then run the read-only spec

Workers Builds finishes 1–3 minutes after push. Poll until the host answers
200 (if it never does, read the Workers Builds status on the PR first):

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://<host>/
```

Then run the spec (it skips itself unless `E2E_BASE_URL` is a remote URL):

```bash
E2E_BASE_URL=https://<host> pnpm exec playwright test tests/e2e/preview-smoke.spec.ts
```

It asserts: the four key pages render with correct titles, `html[data-hydrated]`
appears, one client-side navigation works, a math article typesets KaTeX with
zero `.katex-error`, the search palette returns server-side results, and no
console/page errors fired anywhere.

## 3. Deeper interactive pass (optional, when the change is visual)

Open the preview in a real browser and walk the pages called out in
AGENTS.md §7 (`/`, `/blog`, `/blog/:slug` incl. a math post, `/projects`):
layout and max-width, KaTeX and code highlighting, the search palette
(open → type → Enter → lands on the article), theme and language toggles.
Zero console errors is the bar.

## 4. Report

Summarize what was checked on the PR (comment or review note), including the
preview URL. Do not merge — the owner decides.
