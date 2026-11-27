# Documentation

Placement, writing rules, and plan retirement: [`docs/AGENTS.md`](AGENTS.md).
Contribution workflow and Change Design Gate: [`CONTRIBUTING.md`](../CONTRIBUTING.md).

## Index

- [`architecture/overview.md`](architecture/overview.md) — current architecture single source of truth (data model, two-layer auth, comments, security, backups, agent quick reference).
- [`architecture/request-flow.md`](architecture/request-flow.md) — request lifecycle, D1 content/comment queries, and unlock flow.
- [`architecture/motion.md`](architecture/motion.md) — background canvas and page-intro motion guidelines and constraints.
- [`development/preview-deployments.md`](development/preview-deployments.md) — Cloudflare Worker Preview deployment setup and maintenance.
- [`plans/`](plans/) — active design/implementation plans; each is retired in its final delivery PR.

## Repository-Specific Surfaces

- Internal architecture docs and plans under `docs/` are written in Chinese (while `docs/AGENTS.md`, `docs/plans/README.md`, and `docs/plans/0000-template.md` stay English verbatim from `project-template`).
- Operational agent skills (manual deploy, preview smoke, Worker log diagnosis) live in [`.agents/skills/`](../.agents/skills/).
