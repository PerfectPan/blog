<!-- Title: `type(scope): imperative subject`, English. Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert. Validated by amannn/action-semantic-pull-request. -->

## Summary

<!-- What changed and why. Link the issue when there is one. -->

-

## Validation

<!-- Commands you ran and their results; screenshots for visual claims. Name skipped checks and why. -->

- [ ] `pnpm lint` (vp check) and `pnpm typecheck`
- [ ] `pnpm test` — unit tests
- [ ] `pnpm --filter @blog/web build` + size gate (`wrangler deploy --dry-run`, < 3 MiB gzip)
- [ ] Behavior verified beyond CI green (relevant flow, local e2e, or the preview deployment — see AGENTS.md §9)

## Risks

<!-- Compatibility, rollout, rollback, or follow-up risks. Delete when none. -->

-
