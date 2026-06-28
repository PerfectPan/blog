# 项目架构（全 Cloudflare，D1 驱动 · 2026-06）

> 本文是「当前架构」的**单点真相**，面向人和 agent。快速概览见 `README.md`，迁移决策见
> `docs/plans/2026-06-22-cloudflare-migration-design.md`。旧 Vercel+Payload+Railway 架构
> （2026-02）已废弃，归档文档见文末。
>
> 给 agent 的速查直接跳 **§13**。改东西前先读 **§6（权限）** 和 **§8（安全）**。

## 1. 总览

整个博客跑在 Cloudflare 上，**$0/月**。monorepo：

- `apps/web`：TanStack Start 应用，构建产物是一个 **Cloudflare Worker**（`blog-web`）——
  博客展示、登录、权限、**admin 后台**全部在这里。
- `packages/shared`：前后端共享的类型与权限纯函数（角色、可见性、文章结构）。
- **内容存在 D1**（`post` 表），由 admin 管理；历史 markdown 已一次性迁入 D1（迁移
  `0003`），仓库里的 `.md` 源文件已删除。无 CMS、无外部内容数据库。

已移除：`apps/cms`（Payload）、PostgreSQL、Vercel adapter、Node server 脚手架、
构建期内联 markdown、`gray-matter` 依赖。

## 2. 仓库结构（改东西先看这里）

| 关注点 | 位置 |
|---|---|
| Worker 入口 / `www→apex` 301 | `apps/web/src/server.tsx` |
| 路由（文件式，自动生成） | `apps/web/src/routes/**`，`routeTree.gen.ts`（生成，勿手改） |
| 公开博客 | `routes/blog/{index,$slug}.tsx`、`lib/blog-service.ts`、`lib/content-service.ts` |
| 认证 | `lib/auth.ts`、`lib/auth-client.ts`、`lib/session-core.ts`、`routes/api/auth/$.ts`、`routes/{login,signup,logout}.tsx` |
| Admin 后台 | `routes/admin/{index,new,$slug}.tsx`、`lib/admin-service.ts`、`components/{post-editor,markdown-editor,tag-input,markdown}.tsx` |
| 密码文章解锁 | `routes/unlock/$slug.tsx`、`lib/unlock-cookie.ts`、`lib/unlock-rate-limit.ts` |
| Markdown 渲染 | `components/markdown.tsx`（react-markdown + shiki + katex） |
| D1 访问 / 迁移 | `lib/db.ts`、`apps/web/migrations/` |
| 共享类型 / 权限纯函数 | `packages/shared/src/{types,access,index}.ts` |
| CI / 部署 / 备份 | `.github/workflows/{deploy,pull-request,backup-d1}.yml` |
| Worker 配置 | `apps/web/wrangler.jsonc` |

## 3. 部署拓扑

```
perfectpan.org ─┐
                ├─→  Worker blog-web (Cloudflare)
www → 301 apex ─┘        ├─ ASSETS  = dist/client 静态资源
                         ├─ DB      = D1 "blog"（user/session/account/verification + post）
                         └─ (可选) GitHub OAuth secret
```

- **域名**：`perfectpan.org` 是 Worker Custom Domain（apex）；`www.perfectpan.org` 也是
  Custom Domain，但 worker 入口先 **301 跳到 apex**（保留 path/query），canonical 只剩 apex。
- **`workers.dev` 路由有意关闭**——生产只走 perfectpan.org，避免双域名。
- `APPS_WEB_URL = https://perfectpan.org`：Better Auth 的 `baseURL` / `trustedOrigins` /
  cookie 域都从它派生。

## 4. 数据模型（D1 `blog`）

- **better-auth 表**（迁移 `0001`）：`user`（含 `role`：`member|vip|admin`）、`session`、
  `account`（密码 hash）、`verification`。
- **`post` 表**（迁移 `0002`）：`slug`(PK)、`title`、`description`、`body`(markdown 正文)、
  `visibility`、`password`、`status`(`draft|published`)、`tags`(JSON 数组)、`publishedAt`、
  `createdAt`、`updatedAt`。
- **迁移 `0003`**：把 75 篇历史 `content/blog/*.md` 一次性导入 `post`（幂等
  `ON CONFLICT DO NOTHING`，**不带事务包裹**——75 行的 `BEGIN…COMMIT` 会触发远端
  `SQLITE_TOOBIG`）。这条迁移本身就是「上线内容快照」。
- 迁移由 `deploy.yml` 在部署前 `wrangler d1 migrations apply blog --remote` 应用；本地用
  `--local`。

## 5. 核心请求链路

1. Worker 入口：`www → apex` 301 判断（`server.tsx`），命中 www 才跳。
2. TanStack Start：route loader（服务端）→ 调用 server fn → 读写 D1 → SSR。
3. **列表 `GET /blog`**：`getBlogListServerFn` → `getAllPublishedPosts()`（D1）→ 按角色
   `canAccessVisibility` 过滤后返回（见 §6）。
4. **详情 `GET /blog/:slug`**：`getBlogPostServerFn` → `getPostBySlug()`（D1）→
   **在数据层就按可见性裁剪正文**（无权则返回空 body），route loader 再做 redirect/401/403。
5. **认证**：前台 Better Auth（`/api/auth/*`），经 `kysely-d1` 直连 D1；GitHub OAuth 可选
   （secret 未配则自动禁用）。

## 6. 权限模型（**两层都要守**）

- 角色：`member` < `vip` < `admin`。
- 文章可见性：`public` / `member` / `vip` / `admin` / `password`。
- 可见范围（`packages/shared/src/access.ts` 的 `canAccessVisibility`）：
  - 游客：`public`
  - `member`：`public / member`
  - `vip`：`public / member / vip`
  - `admin`：全部已发布（含 `password`）
- **可见性在两层强制**（缺一不可）：
  1. **数据层**（`getBlogPostServerFn`）：无权调用者的返回里 `body` 被置空。这一层必须有，
     因为 TanStack Start 的 server fn **可被直接 RPC 调用**，只靠 route loader 拦不住。
  2. **route loader**（`blog/$slug.tsx`）：`password` 未解锁 → 跳 `/unlock/:slug`；
     `member/vip/admin` 未授权 → 401/403。负责 UX 与状态码。
- **密码文章**：`/unlock/:slug` 校验密码后下发 **HMAC 签名**的 httpOnly 解锁 cookie
  （默认 24h，`lib/unlock-cookie.ts`，用 `betterAuthSecret` 签名、`timingSafeEqual` 校验）。

## 7. Admin 后台

- 路由：`/admin`（列表）、`/admin/new`、`/admin/$slug`（编辑）。
- 所有 admin server fn（list/get/upsert/delete）入口先 `requireAdmin()`：未登录 → 跳
  `/login`；非 admin → 跳 `/`（不泄露任何后台内容）。
- 编辑器（`components/post-editor.tsx` + `markdown-editor.tsx` + `tag-input.tsx`）：
  分屏 Markdown 编辑（工具栏 + 实时预览，复用前台 `<Markdown>`）、标签 chip 输入、
  可见性/状态/密码。保存 = 以 slug 为键 upsert D1 `post` 行。

## 8. 安全（审计结论）

**已落实：**
- **AuthN**：Better Auth；会话 cookie `httpOnly` + `Secure`(https) + `SameSite=Lax`。
- **AuthZ**：admin fn 全部 `requireAdmin`；公开读按角色过滤；单篇在**数据层**裁剪正文
  （已修复原先仅 loader 拦截、可被 RPC 绕过的越权读）。
- **SQL 注入**：所有 D1 查询参数化（`.prepare().bind()`），无字符串拼接。
- **XSS**：Markdown 经 react-markdown 渲染，**未启用 `rehype-raw`**（不透传原始 HTML）。
- **CSRF**：会话 cookie `SameSite=Lax` 拦截跨站 POST；Better Auth 校验 origin。
- **密钥**：`BETTER_AUTH_SECRET`、GitHub OAuth secret 放 Cloudflare **secret**（不入库、不进 git）；
  `ADMIN_EMAIL_ALLOWLIST` 是 var（非密钥）。

**已知局限（按需加固）：**
- **首位 admin 自举**：`session-core.ts` 的 `maybePromoteFirstAdmin` —— 当 D1 里 admin 数为 0
  时，用 `ADMIN_EMAIL_ALLOWLIST` 邮箱注册的账号自动提权。依赖「邮箱唯一 + 拥有者先注册」且
  **未强制邮箱验证**；一旦已有 admin 即关闭窗口。若库被重置需注意抢占风险。
- **密码文章限流是 best-effort**：`unlock-rate-limit.ts` 用进程内 `Map`，而 Workers 各 isolate
  不共享内存，跨请求基本失效。要硬防爆破需改 Durable Object / Cloudflare Rate Limiting。
- **密码明文存储**：`post.password` 存明文、明文比对（单文密码、低价值，配合上一条的限流注意）。

## 9. 备份与恢复（分层、$0）

1. **D1 Time Travel**：D1 内建时间点恢复（`wrangler d1 restore` 按时间戳回滚），零配置；
   先确认免费版保留窗口是否够「手滑回滚」需求。
2. **每周 R2 备份**：`.github/workflows/backup-d1.yml`（周一 03:17 UTC）→ `wrangler d1 export
   blog --remote` → 算 sha256 → 与 R2 里的 `blog-backups/latest.sha256` 比对 →
   **有变化才上传**（静默周几乎零成本）；R2 生命周期规则 180 天自动清理。
   - **私有 bucket**：dump 含 `account` 密码 hash + `user` 邮箱，**绝不可设为公开**。
   - CI 的 `CLOUDFLARE_API_TOKEN` 需有 D1 读 + R2 读写权限。
3. **上线内容快照**：迁移 `0003_seed_blog_posts.sql`（已入库）= 75 篇上线内容；新库跑迁移即恢复。

**恢复**：`wrangler r2 object get blog-backups/dump-YYYYMMDD.sql --remote --file x.sql` →
`wrangler d1 execute blog --remote --file x.sql`（或用 Time Travel）。

## 10. 体积与成本

- Worker 包 **< 3 MiB gzip**（免费版硬限），PR workflow 在 dry-run 时守门，超了即红；当前
  约 **1.18 MiB**。改前端别引入重型编辑器（Monaco/CodeMirror 等）。
- **$0/月**：Workers / D1 / R2 均在免费额度内；备份存储可忽略（每周 ~300KB）。

## 11. 本地运行

```bash
pnpm install
cp apps/web/.dev.vars.example apps/web/.dev.vars      # 填 BETTER_AUTH_SECRET 等
pnpm --filter @blog/web exec wrangler d1 migrations apply blog --local   # 建表 + 种子
pnpm --filter @blog/web dev                            # vite dev
# 想跑 worker 运行时：pnpm --filter @blog/web exec wrangler dev
```

## 12. 部署

- **CI（push `master`）**：`.github/workflows/deploy.yml` → 迁移 D1（`--remote`）→ 构建 →
  `wrangler deploy` → 冒烟（`/healthz`、`/`、`/blog`）。
- **PR 门**：`.github/workflows/pull-request.yml` → typecheck + biome + build + 体积守门。
- **手动**：`/deploy` skill。**别让手动部署和 CI 分叉**——手动部署发的是本地代码，CI 发的是
  `master`，不一致时下次 push master 会回滚生产；手动部署后务必 commit→push→merge。
- **必需生产配置**：secret `BETTER_AUTH_SECRET`；var `APPS_WEB_URL`（已在 `wrangler.jsonc`）；
  D1 绑定 `DB`（已 provision）。可选 `GITHUB_CLIENT_ID/SECRET`。
- **Custom Domain 由 `wrangler.jsonc` 的 `routes` 管理**（apex + www）。换域名坑：Custom Domain
  要求该主机名下无现存 DNS 记录，否则 `409 / code 100117`，而 OAuth token 无 `dns:edit`——
  需先在 dashboard 删掉冲突记录再部署。

## 13. 给 Agent 的速查（常见改动）

- **加/改文章**：走 `/admin`（或直接写 D1 `post`）。**不要再加 `content/blog/*.md`**——已废弃。
- **加路由**：`apps/web/src/routes/` 下加文件（文件式路由），`routeTree.gen.ts` 在 dev/build 时自动生成。
- **加 server fn**：`createServerFn(...)` 放 `lib/*`；**鉴权必须在 handler 内部做**——别只靠
  route loader（server fn 可被 RPC 直调，见 §6）。
- **改表结构**：加 `apps/web/migrations/000N_*.sql`；deploy 时自动应用到远端、本地用 `--local`。
- **改可见性逻辑**：`packages/shared/src/access.ts`（`canAccessVisibility`）+ 在数据层 fn 里强制。
- **提交前最低验证**：`pnpm typecheck`；`pnpm biome check ./apps ./packages`；
  `pnpm --filter @blog/web build`；`pnpm --filter @blog/web exec wrangler deploy -c
  apps/web/dist/server/wrangler.json --dry-run`（体积守门）。
- **密钥**：`wrangler secret put <NAME>`（绝不进 git）；非密钥配置走 `wrangler.jsonc` 的 `vars`。
- **备份相关**：手动触发备份——Actions → `Weekly D1 backup` → Run workflow；恢复见 §9。

## 14. 相关文档

- 迁移决策与取舍：`docs/plans/2026-06-22-cloudflare-migration-design.md`
- 页面访问调用链：`docs/request-flow.md`
- 复盘记录：`docs/retrospectives/`
- **已归档（2026-02 旧栈，仅供参考）**：`docs/deploy-vercel-railway.md`、`docs/selection.md`
