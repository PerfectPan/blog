# Contributing

Single-maintainer blog deployed on Cloudflare Workers. `AGENTS.md` is the
canonical instruction file for agents working in this repository; this
document is the human-facing equivalent.

## Development Setup

Node.js 24+ and pnpm 12 (the version in `packageManager`; the pnpm shim
picks it up automatically). Toolchain is Vite+ (`vp`): dev/build/test/lint
all run through it — see `AGENTS.md` §1.

```bash
pnpm install
pnpm db:migrate:local      # local D1 (copy .dev.vars.example first)
pnpm dev                   # vp dev on :5173
pnpm --filter @blog/web preview   # wrangler dev (real workerd runtime)
```

## Contribution Flow

1. Open an issue for ambiguous work before implementing.
2. Create a focused branch with a short descriptive name.
3. Keep changes scoped; prefer existing patterns over new abstractions.
4. For substantial work, pick the artifact the Change Design Gate below
   requires before implementing.
5. Add or update tests for behavior changes (`packages/**/*.test.ts`,
   `apps/web/tests`, Playwright specs under `tests/e2e`).
6. Update `docs/architecture.md` when architecture, data flow, or
   project policy changes.
7. Run the required checks below.
8. Open a pull request. `master` is protected by a ruleset — every change
   lands through a PR. Non-owner accounts (including agent accounts) have
   no write access: fork and open a PR from the fork.

Commit messages and PR titles follow conventional commits in English
(`type(scope): imperative subject`) — `fix(web): ...`, `chore(deps): ...`.
PR bodies are English too; the repo validates titles with
`amannn/action-semantic-pull-request`.

## Change Design Gate

Every change needs a requirement record; use the smallest set of artifacts
that makes behavior and implementation reviewable.

| Change type | Required artifact |
| --- | --- |
| Product behavior | One Spec plus one detailed Plan for the same deliverable |
| Technical refactor without changed user behavior | Detailed Plan with compatibility and acceptance conditions |
| Narrow maintenance, tests, or documentation | Requirement in the PR description; a separate Plan only when useful |

A Spec (`docs/specs/`) defines observable interactions, scope, failure
behavior, and acceptance examples — stable scenario IDs, Given/When/Then
where useful, linked to tests; it does not prescribe implementation. A
Plan (`docs/plans/`) records technical decisions and the execution plan.
A small change may keep both sections in the PR description. Move lasting
constraints into `docs/architecture.md` or tests before deleting completed
Specs and Plans in the delivery PR.

## Required Checks

```bash
pnpm lint         # vp check — Oxfmt format check + Oxlint across the repo
pnpm typecheck    # tsc (TypeScript 7 native)
pnpm test         # vp test (Vitest 5) — unit tests
pnpm --filter @blog/web build
pnpm --filter @blog/web exec wrangler deploy -c dist/server/wrangler.json --dry-run
                  # size gate: worker must stay under the 3 MiB gzip free-tier cap
```

Browser regression is part of the bar for visual or interactive changes:
verify on the PR's preview deployment (or local `pnpm dev`), not only on a
green CI. The full Playwright suite (`pnpm test:e2e`) runs against an
ephemeral **local** D1 — never against the shared preview or production
databases. Preview deployments are smoke-tested read-only by the agent
(`.agents/skills/preview-smoke`).

## Merging

The owner merges; nothing auto-merges. Merge-order regressions are rolled
back with `git revert` first, fixed second.
