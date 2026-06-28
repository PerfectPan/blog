# AGENTS.md

本文件给在本仓库工作的 agent / 工程师使用，目标是减少误操作并统一交付标准。

> **架构单点真相 = `docs/architecture.md`**（含数据模型 / 两层权限 / 安全 / 备份 / agent 速查 §13）。
> 本文件侧重流程与约束；架构细节以那份文档为准。

## 1. 项目定位

- 单人博客，**全量运行在 Cloudflare 上、$0/月**。
- `apps/web`（TanStack Start）部署为 **Cloudflare Worker**；`packages/shared` 放共享类型。
- 文章是 `content/blog` 下的 **git markdown**，构建期内联（无 CMS、无内容数据库）。
- 登录与角色用 **Better Auth + Cloudflare D1**。
- 旧架构已移除：Waku、Payload CMS、Postgres、Vercel adapter 都不再维护。

## 2. 必须遵守的约束

1. 路由兼容性不可破坏：`/blog`、`/blog/:slug`。
2. 权限裁决必须在服务端做（route loader 里），前端只做展示。
3. `BETTER_AUTH_SECRET` 绝不能进客户端包，只走 `wrangler secret` / `.dev.vars`。
4. worker 体积必须守住 Workers 免费版 **3 MiB gzip** 上限——这是 $0 的命根子。
   每次改动后用 `wrangler deploy -c dist/server/wrangler.json --dry-run` 看 gzip 数。
5. 文章可见性分级靠 frontmatter 的 `visibility` 字段，默认 `public`。

## 3. 常用命令

```bash
pnpm install

# 本地开发
pnpm dev                              # vite dev
pnpm --filter @blog/web preview       # wrangler dev（真实 worker 运行时）

# D1 迁移
pnpm --filter @blog/web db:migrate:local
pnpm --filter @blog/web db:migrate     # 远端

# 类型检查
pnpm typecheck

# 部署（或用 /deploy skill）
pnpm deploy
```

## 4. 环境变量 / 绑定关键点

- 绑定：`DB`（D1，数据库名 `blog`，已 provision），`ASSETS`（静态资源）。
- 变量：`APPS_WEB_URL`（`wrangler.jsonc` 的 `[vars]`）。
- 密钥：`BETTER_AUTH_SECRET`（必需）、`GITHUB_CLIENT_ID/SECRET`（可选）。
- 本地：`apps/web/.dev.vars`（从 `.dev.vars.example` 复制）。

## 5. 数据与权限

- 角色：`member | vip | admin`，存在 D1 的 `user.role`。
- 文章可见性：`public | member | vip | admin | password`。
- 首个 admin 自动提升：`ADMIN_EMAIL_ALLOWLIST` 命中且当前无 admin 时提升。
- password 文章走 `/unlock/:slug` + 签名 HttpOnly cookie（24h）。

## 6. 发布注意事项

1. Better Auth 的 D1 schema 是版本化迁移（`apps/web/migrations/`），**不在请求期建表**。
   改了 schema 要 `db:migrate` 应用到远端。
2. 部署产物里 `dist/server/wrangler.json` 由 `@cloudflare/vite-plugin` 生成，
   `wrangler deploy` 用它。
3. push 到 `master` 会触发 `.github/workflows/deploy.yml` 自动部署。

## 7. 提交前最低验证

```bash
pnpm typecheck
pnpm biome check ./apps ./packages
pnpm --filter @blog/web build
pnpm --filter @blog/web exec wrangler deploy -c dist/server/wrangler.json --dry-run  # 守 3 MiB
```

冒烟：`/`、`/blog`、`/blog/:slug`、`/projects`。

## 8. 提交与 PR 规范

- **commit message 与 PR 标题一律用 conventional commits + 英文**：`type(scope): imperative subject`，
  例如 `fix(web): ...`、`feat(web): ...`、`ci: ...`、`docs: ...`、`chore: ...`。**不要写中文标题**
  （正文描述可中文）。`type` 取最主导的那类（安全修优先 `fix`）。
- PR 标题由 `.github/workflows/pr-title.yml`（`amannn/action-semantic-pull-request`）自动校验，
  不符合 conventional 格式会标红；如需"拦死"在 GitHub 设置里把它设为必需检查。
- 一个 PR 尽量单一关注点；混合时标题用主导类型，其余在正文说明。
