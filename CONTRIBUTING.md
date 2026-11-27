# Contributing

Single-maintainer blog deployed on Cloudflare Workers. `AGENTS.md` is the
canonical instruction file for agents working in this repository; this
document is the human-facing equivalent.

## Development Setup

Node.js `^26.13.1` (`>=26.13.1 <27`) and pnpm 12 (the version in `packageManager`; the pnpm shim
picks it up automatically). `.nvmrc` selects major 26; install its latest release. `devEngines.runtime`
rejects development installs outside the allowed range. CI resolves the latest matching release with
`check-latest: true`. Toolchain is Vite+ (`vp`): dev/build/test/lint
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

Most changes need only a clear PR description (`## Summary` and `## Validation`), not a separate document. Write a Plan only when upfront alignment with a human is needed before implementing. Do not write a Plan for adjustments requested during implementation or review—reflect those directly in code, durable docs, and the PR description.

| Change scope | Required artifact |
| --- | --- |
| Bugfix, localized feature/refactor, tests, dependencies, or docs | PR description explaining what changed, why, and how it was verified |
| New subsystem, schema/auth/routing contract change, major design tradeoffs, or multi-PR/multi-session work | One Plan in [`docs/plans/`](docs/plans/) |

A Plan (`docs/plans/`) records the problem, goals, outline, detailed design, verification, and (when useful) execution steps. Retire the plan in its final delivery PR following [`docs/AGENTS.md` §4](docs/AGENTS.md#4-retiring-a-plan); list durable docs in [`docs/README.md`](docs/README.md).

## Required Checks

```bash
pnpm lint         # vp check — Oxfmt format check + Oxlint across the repo
pnpm typecheck    # tsc (TypeScript 7 native)
# Both Knip checks fail CI on unused files, exports, dependencies, or configuration and tag hints.
pnpm knip
pnpm knip:production  # Check production code separately.
pnpm duplicates   # Fails on any reported clone. `pnpm duplicates:audit` only reports findings.
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
