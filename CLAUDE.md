# CLAUDE.md

给 Claude Code 的精简项目上下文。**架构单点真相 = `docs/architecture.md`**
（改东西前先读它，尤其 §6 权限、§8 安全、§13 agent 速查）；完整 agent 指南见 `AGENTS.md`。

## 这是啥

单人博客，全 Cloudflare、$0/月。`apps/web`（TanStack Start）构建为 Worker `blog-web`；
内容/用户/会话都在 D1 `blog`（`post` + better-auth 表）；无 CMS。

## 必须遵守

- **commit message & PR 标题：conventional commits + 英文**，`type(scope): imperative subject`
  （`fix(web): ...`、`ci: ...`、`docs: ...`）。**不写中文标题**；PR 标题被
  `.github/workflows/pr-title.yml` 校验。
- **权限在两层强制**：route loader **和** 数据层 server fn。server fn 可被直接 RPC 调用，
  所以鉴权必须在 handler 内部做——别只靠 loader（见架构文档 §6）。
- **密钥只走 `wrangler secret` / `.dev.vars`**，绝不进客户端包、绝不进 git。
- **守 Workers 免费版 3 MiB gzip 上限**；改完用 dry-run 看体积。
- **文章走 D1 / admin**，不要再加 `content/blog/*.md`（已废弃）。

## 提交前最低验证

```bash
pnpm typecheck && pnpm biome check ./apps ./packages && pnpm --filter @blog/web build
pnpm --filter @blog/web exec wrangler deploy -c apps/web/dist/server/wrangler.json --dry-run  # 守 3 MiB
```

## 常用

- 本地：`pnpm --filter @blog/web dev`（vite）；`pnpm --filter @blog/web exec wrangler dev`（worker 运行时）。
- D1 迁移本地：`pnpm --filter @blog/web exec wrangler d1 migrations apply blog --local`。
- 部署走 push `master`（`deploy.yml`）或 `/deploy` skill；别让手动部署和 CI 分叉。
