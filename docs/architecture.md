# 项目架构（全 Cloudflare，2026-06）

> 本文是「当前架构」的单点真相。快速概览见 `README.md`，迁移决策与取舍见
> `docs/plans/2026-06-22-cloudflare-migration-design.md`。
> 旧版 Vercel + Payload + Railway 架构（2026-02）已废弃，归档文档见文末。

## 1. 总览

整个博客跑在 Cloudflare 上，**$0/月**。monorepo 两层结构（CMS 已砍掉）：

- `apps/web`：TanStack Start 应用，构建产物是一个 **Cloudflare Worker**（`blog-web`）——博客展示、登录、权限守卫、admin 后台全在这里。
- `packages/shared`：前后端共享类型（角色、可见性、文章结构）。
- `content/blog`：文章 = git 里的 markdown（无 CMS、无外部内容数据库）。

已移除：`apps/cms`（Payload）、PostgreSQL、Vercel adapter、Node server 脚手架。

## 2. 部署拓扑

```
perfectpan.org ─┐
                ├─→  Worker blog-web (Cloudflare)  ──  ASSETS (dist/client 静态)
www → 301 apex ─┘        ├─ DB binding → D1 "blog" (auth/session/admin)
                         └─ 内容: content/blog/*.md (import.meta.glob 构建期内联)
```

- **域名**：`perfectpan.org` 是 Worker Custom Domain（apex）。`www.perfectpan.org` 也是
  Custom Domain，但 worker 入口（`apps/web/src/server.tsx`）在处理前先 **301 跳到 apex**
  （保留 path/query），所以 canonical 只有 apex。
- **`workers.dev` 路由有意关闭**（`blog-web.perfectpan325.workers.dev` 返回 404）——生产
  只走 perfectpan.org，避免双域名。
- `APPS_WEB_URL = https://perfectpan.org`：Better Auth 的 `baseURL`、`trustedOrigins`
  以及 cookie 域都从它派生；apex-only 服务，不需要单独配 `COOKIE_DOMAIN`。

## 3. 核心请求链路

### 3.1 博客列表/详情（`GET /blog`、`GET /blog/:slug`）

1. Worker 入口先做 `www → apex` 301 判断（命中 www 才跳，否则继续）。
2. TanStack route loader 在服务端读取会话（D1）→ 得到用户角色。
3. 文章数据来自**构建期内联的 markdown**（frontmatter 决定可见性），不走任何外部 CMS。
4. loader 用 `canAccessVisibility` 做服务端裁决，返回可见内容；SSR 渲染。

### 3.2 登录与会话

- 前台用 Better Auth（`/api/auth/*`），通过 `kysely-d1` 直连 **D1**。
- 会话表（`user/session/account/verification`）由版本化 D1 迁移建表（`apps/web/migrations/`），
  不在请求期建表。
- GitHub OAuth 可选（secret 未配时自动禁用）；回调 `https://perfectpan.org/api/auth/callback/github`。

### 3.3 密码文章解锁

1. 文章 frontmatter `visibility: password`。
2. 用户在 `/unlock/:slug` 提交密码。
3. 服务端校验成功后写 `httpOnly + signed` 解锁 cookie（默认 24h）。

## 4. 权限模型

### 4.1 角色（存 D1）

- `member` / `vip` / `admin`

### 4.2 文章可见性（frontmatter）

- `public` / `member` / `vip` / `admin` / `password`

### 4.3 可见范围（服务端 route loader 裁决）

- 游客：`public`
- `member`：`public / member`
- `vip`：`public / member / vip`
- `admin`：全部已发布文章（含 `password`）

## 5. 数据与内容

- **内容来源**：`content/blog/*.md`（git），构建期 `import.meta.glob` 内联进 worker 包；
  写文章 = 加 `.md` + commit + push。
- **数据库**：D1 `blog`（id `1ead9934-…`），只存用户/会话/admin 内容，不存博客正文。
- **迁移**：schema 走版本化迁移 `apps/web/migrations/`，`pnpm --filter @blog/web db:migrate`
  应用到远端。

## 6. 本地运行

```bash
pnpm install
cp apps/web/.dev.vars.example apps/web/.dev.vars   # 填 BETTER_AUTH_SECRET
pnpm --filter @blog/web db:migrate:local           # 建 D1 + auth 表
pnpm dev                  # vite dev server
# 或跑 worker 运行时：pnpm --filter @blog/web preview   # wrangler dev
```

## 7. 部署

- **CI（push `master`）**：`.github/workflows/deploy.yml` → 迁移 D1 + `wrangler deploy`。
- **手动**：`/deploy` skill（验证 → 构建 → 体积门 → 迁移 → 部署 → 冒烟），或
  `pnpm --filter @blog/web deploy`（= `vite build && wrangler deploy`）。
- **必需的生产配置**：secret `BETTER_AUTH_SECRET`；var `APPS_WEB_URL`（已在 `wrangler.jsonc`）；
  D1 绑定 `DB`（已 provision）。可选 `GITHUB_CLIENT_ID/SECRET`。
- **Custom Domain 由 `wrangler.jsonc` 的 `routes` 管理**（apex + www），随部署一起绑定，
  不在 dashboard 单独维护。

### 7.1 绑定/换域名的坑（已踩，留档）

Worker **Custom Domain** 要求该主机名下**没有**现存 DNS 记录，否则部署报
`409 / code 100117: already has externally managed DNS records`，且 `wrangler login` 的
OAuth token **没有 `dns:edit` 权限**，删不掉冲突记录。处理：在 CF dashboard 的
DNS → Records 里**先删掉 apex + www 的旧记录**（A/AAAA/CNAME），再 `wrangler deploy`，
CF 会自动重建指向 worker 的记录 + 证书（zone 已有 Universal SSL 覆盖
`perfectpan.org` / `*.perfectpan.org`，HTTPS 立即可用）。`www → apex` 的 301 跳转在
worker 里做（不是 CF Redirect Rule），因为该 token 也没有 `rulesets:write`。

## 8. 维护注意事项

- 保持历史 URL 不变：`/blog`、`/blog/:slug`。
- 根目录 pre-push 执行 `pnpm typecheck`；提交前至少跑 `pnpm --filter @blog/web typecheck`。
- worker 体积守门：免费版上限 3 MiB gzip；PR workflow 会在 dry-run 时检查，超了即红。

## 9. 相关文档

- 迁移决策与取舍：`docs/plans/2026-06-22-cloudflare-migration-design.md`
- 页面访问调用链路：`docs/request-flow.md`
- 复盘记录：`docs/retrospectives/`
- **已归档（2026-02 旧栈，仅供参考）**：`docs/deploy-vercel-railway.md`、`docs/selection.md`
