# 自建评论系统设计（self-hosted comments）

> 状态：设计稿（待评审） · 日期：2026-07-14
> 架构单点真相见 `docs/architecture.md`（§6 权限 / §8 安全 / §13 速查）。本文件遵循其约束。

## 1. 背景与目标

现状：评论由 `apps/web/src/components/utterances.tsx`（一个 `'use client'` 岛）注入
utteranc.es 脚本托管，**只有 GitHub 用户能评论**，数据存在 `PerfectPan/blog` 仓库的
GitHub Issues（`issue-term = slug`，label `blog-comment`）。挂载点：`routes/blog/$slug.tsx`
末尾 `<Utterances slug={post.slug} />`。

目标：把评论迁到自有 D1，去掉 utteranc.es 依赖，**仍保持 $0/月、< 3 MiB gzip**。

## 2. 已确认的决策

| 维度 | 决策 |
|---|---|
| 评论身份 | **必须登录**（Better Auth），复用 `getSessionUserFromRequest()`；无游客评论 |
| 审核 | **后置审核**：新评论立即可见（`visible`），admin 可隐藏/标垃圾/删除 |
| 嵌套 | **一层回复**：`parentId` 可空（空=顶层），代码强制深度 ≤ 1 |
| 历史评论 | **不导入**，全新开始；彻底删除 utterances |
| 评论格式 | **限制 Markdown**：复用 react-markdown 管线，但**不用 shiki/katex**（轻量岛） |
| 编辑 | **v1 不支持编辑**；支持删除 |
| 删除 | **硬删除**（作者删自己 / admin 删任意）+ **软操作**（admin 隐藏/标垃圾/恢复） |

## 3. 架构方案：全 server fn

所有读写都走 TanStack Start server function，放在 `lib/comments-service.ts`，与
`content-service.ts` / `admin-service.ts` 完全同构。**不引入 REST 路由**（全站仅
`/api/auth/$` 一个 REST 挂载）。首屏评论在 route loader 里 SSR，客户端岛负责发/回复/
加载更多/删除。

理由：
- **天然满足 §6 两层鉴权**——server fn 可被 RPC 直调，鉴权必须在 handler 内部，不能只靠
  loader。这是本仓库已确立的模式（见 `admin-service.ts` 的 `requireAdmin`、
  `blog-service.ts` 的数据层裁剪）。
- 复用既有 session 解析、zod 校验、raw D1 `prepare().bind()` 模式，零新依赖。
- 首屏 SSR（loader 取首页）→ SEO 与首屏都有内容。

不采用 REST / 混合方案：会重复鉴权逻辑，正好踩 §6 的 RPC 绕过坑。

## 4. 数据模型

新迁移 `apps/web/migrations/0004_create_comments.sql`：

```sql
CREATE TABLE IF NOT EXISTS "comment" (
  "id"        text NOT NULL PRIMARY KEY,          -- crypto.randomUUID()
  "slug"      text NOT NULL,                       -- 关联 post.slug
  "userId"    text NOT NULL,                       -- 关联 user.id
  "parentId"  text,                                -- NULL=顶层；非空→父必须是顶层（深度≤1）
  "body"      text NOT NULL,                       -- 限制 markdown 原文
  "status"    text NOT NULL DEFAULT 'visible',     -- visible | hidden | spam
  "createdAt" text NOT NULL,                       -- ISO 字符串，沿用现有列风格
  "updatedAt" text NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_comment_slug_created" ON "comment" ("slug","createdAt");
CREATE INDEX IF NOT EXISTS "idx_comment_parent"       ON "comment" ("parentId");
CREATE INDEX IF NOT EXISTS "idx_comment_user"         ON "comment" ("userId");
CREATE INDEX IF NOT EXISTS "idx_comment_status"       ON "comment" ("status");
```

设计说明：
- **不加 FK 约束**——与 `post` 表保持一致（D1/SQLite 默认 `foreign_keys=OFF`，加了也是空操作）；
  写入时应用层校验 slug 存在、userId 合法。
- **作者信息不快照**——读取时 `JOIN "user"` 取 `name` / `image` / `role`，避免昵称/头像漂移。
- **ID/时间**：`crypto.randomUUID()`（Workers 运行时内置）+ ISO 文本列，与现有表一致。
- **状态机**：
  - `visible`：对所有人可见（新评论默认值，后置审核）。
  - `hidden` / `spam`：对非 admin 读者**都不可见**，差别仅在 admin 后台分类。二者均可 `UPDATE`
    回 `visible`（恢复）。
  - **硬删除** = `DELETE` 行：作者删自己的评论、admin 永久删除任意评论。不可恢复。

索引用途（每个绑定一个查询路径）：
- `idx_comment_slug_created`：主查询——按文章列评论、按时间分页（`WHERE slug=? ORDER BY createdAt`）。
- `idx_comment_parent`：拉某顶层评论的一层回复（`WHERE parentId=?`）。
- `idx_comment_user`：60s 限流（`MAX(createdAt) WHERE userId=?`）+ 归属判定。
- `idx_comment_status`：后台按状态全局筛（找全站 rare 的 hidden/spam）。**四个里最可有可无**——
  `visible` 占绝大多数行，小表全扫也无妨；保留它便宜且标准，要精简就先删它，以后用新 migration 补。

## 5. Server functions（`lib/comments-service.ts`）

镜像 `admin-service.ts`：`createServerFn({method}).inputValidator(zod).handler(...)`。
**每个 fn 内部独立鉴权**（§6）。

新增一个 `requireSession()`（登录即放行，任意角色；未登录抛 401）——与 `requireAdmin()`
并列；鉴权同样在 handler 内。

| fn | method | 输入(zod) | 鉴权 | 行为 |
|---|---|---|---|---|
| `getCommentsServerFn` | GET | `{slug, offset=0, limit=20}` | 解析 session（可选） | 见下「读取门」 |
| `createCommentServerFn` | POST | `{slug, parentId?, body}` | `requireSession()` | 见下「创建门」 |
| `deleteCommentServerFn` | POST | `{id}` | `requireSession()` + 归属判定 | 硬删除 |
| `setCommentStatusServerFn` | POST | `{id, status}` | `requireAdmin()` | 软操作：hidden/spam/visible |

### 5.1 读取门（`getCommentsServerFn`，§6 关键）

不能假定调用者已过 route loader 的可见性门——server fn 可被 RPC 直调。必须自验：
1. `getSessionUserFromRequest(getRequest())`（可能为 null = 游客）。
2. 查 `post` by slug；不存在 → 空列表。
3. 强制 `canAccessVisibility(post.visibility, role)`（`packages/shared/src/access.ts`）；
   `password` 文章复用 `lib/unlock-cookie.ts` 的签名 cookie 校验。
4. 无权 → 空列表（不泄露是否有评论）。
5. 非 admin 只返回 `status='visible'`；admin 返回全部。
6. 返回 `{ comments, total, hasMore }`，每条含
   `{ id, body, createdAt, parentId, author: { name, image, role }, isOwn }`。
   `isOwn` 在服务端按 `author.id === sessionUser?.id` 计算（不向客户端暴露 author.id）。
   **回复抓取**：先按 offset/limit 取当页顶层评论，再一次 `WHERE "parentId" IN (?,?,…)`
   批量取这些顶层的可见回复（v1 不分页回复——个人博客单条爆几十条回复的概率极低，真出现再加）。
   `hasMore` 只针对顶层评论计数。

### 5.2 创建门（`createCommentServerFn`）

1. `requireSession()`。
2. 查 post：存在、`status='published'`、调用者可见（同读取门的可见性判断）。
3. zod 校验 body：`1..2000` 字符，trim 后非空。
4. 若有 `parentId`：校验父评论存在、同 `slug`、且父的 `parentId IS NULL`（强制深度 ≤ 1）；
   不满足 → 400。
5. **限流**：`SELECT MAX("createdAt") WHERE "userId"=?`，距今 < 60s → 429（见 §7）。
6. `INSERT`（`status='visible'`），返回新行（含 author）。

### 5.3 删除（`deleteCommentServerFn`）

1. `requireSession()`。
2. 取评论；`comment.userId === sessionUser.id` **或** `role === 'admin'` 才允许；否则 403。
3. `DELETE FROM "comment" WHERE "id"=?`。

### 5.4 软操作（`setCommentStatusServerFn`）

1. `requireAdmin()`。
2. `UPDATE "comment" SET "status"=?, "updatedAt"=? WHERE "id"=?`，status ∈
   `{visible, hidden, spam}`（zod enum 约束）。

## 6. 前端

### 6.1 `components/comment-markdown.tsx`

轻量 markdown 渲染：`react-markdown` + `remark-gfm`，**无 shiki / katex / oniguruma**。
- 不启用 `rehype-raw`（raw HTML 被转义，沿用 §8 XSS 策略）。
- 保留默认 `urlTransform`（拦截 `javascript:` / `data:` / `vbscript:` 协议）。
- 自定义 `a`（`target=_blank rel=noreferrer`）/`p`/`strong`/`code`/`pre` 套评论样式。
- 依赖已就位（react-markdown / remark-gfm 已是 deps），**评论路径不引入新重依赖**。

### 6.2 `components/comments.tsx`（`'use client'` 岛）

Props：`{ slug, initialComments, initialHasMore, sessionUser }`。
- 顶部显示评论数。
- 列表：顶层评论 + 各自一层回复（缩进）；每条渲染 author（`name` + 头像，`image` 缺省用
  initials）、相对时间、正文（`<CommentMarkdown>`）；`role==='admin'` 显示「Author」徽标。
- `isOwn` 或 `sessionUser.role==='admin'` 的评论显示「删除」（confirm 后调
  `deleteCommentServerFn`，本地移除）。
- 顶层评论下「回复」→ 内联回复框。
- 输入框：`sessionUser` 存在则显示（textarea + 提交，调 `createCommentServerFn`，成功后插入
  列表顶部/对应回复位）；未登录显示「登录后评论」→ 链 `/login`。
- 「加载更多」：`offset` 增量调 `getCommentsServerFn`，追加。
- 提交/删除期间的 loading / 错误态用本地 React state（**项目未依赖 react-query**，沿用现有
  直调 server fn 模式）。

### 6.3 `routes/blog/$slug.tsx` 改动

loader 在可见性门（已有）**之后**追加：
```ts
const comments = await getCommentsServerFn({ data: { slug: params.slug, limit: 20, offset: 0 } });
```
component 把 `<Utterances slug={post.slug} />` 换成
`<Comments slug={post.slug} initialComments={comments.comments} initialHasMore={comments.hasMore}
sessionUser={data.sessionUser} />`。删除 `utterances.tsx` 与其 import。

## 7. 横切关注点

- **限流**：每用户 60s 一条，查 `MAX("createdAt")`。基于 D1（共享状态），**跨 isolate 有效**
  ——与 `unlock-rate-limit.ts` 的进程内 Map（架构 §8 已知失效）不同。阈值后续可调。
- **校验**：body `1..2000`；slug 走 post 存在性校验；parentId 走深度校验。全部 zod + handler。
- **XSS**：仅轻量 markdown，无 `rehype-raw`，默认 `urlTransform`。与 §8 一致。
- **体积**：评论路径不引 shiki/katex；改完跑 `pnpm --filter @blog/web size`（dry-run deploy）
  守 3 MiB（当前 ~1.18 MiB）。
- **CSRF**：会话 cookie `SameSite=Lax`（既有）；server fn 走同源 RPC。

## 8. 后台审核 `routes/admin/comments.tsx`

- loader 调 `ensureAdminServerFn`（既有），非 admin 跳 `/login` / `/`。
- 列全部评论（按 `createdAt` 倒序），筛选：状态（全部/可见/隐藏/垃圾）+ 可选 slug。
- 每条操作：隐藏 / 标垃圾 / 恢复（调 `setCommentStatusServerFn`）/ 删除（调
  `deleteCommentServerFn`）。
- `routes/admin/index.tsx` 加入口链接。

## 9. 共享类型（`packages/shared`）

新增 `CommentStatus`（`'visible'|'hidden'|'spam'`）、`Comment`、`CommentAuthor` 到
`src/types.ts` 并从 `index.ts` 导出；前后端共用，避免重复定义。

## 10. 涉及文件

- 新增：`apps/web/migrations/0004_create_comments.sql`、`apps/web/src/lib/comments-service.ts`、
  `apps/web/src/components/comments.tsx`、`apps/web/src/components/comment-markdown.tsx`、
  `apps/web/src/routes/admin/comments.tsx`；`packages/shared` 加 Comment 类型。
- 改：`apps/web/src/routes/blog/$slug.tsx`、`apps/web/src/routes/admin/index.tsx`（入口）。
- 删：`apps/web/src/components/utterances.tsx`。

## 11. 暂不做（YAGNI）

评论编辑、多层嵌套、邮件通知（无邮件基建）、Turnstile（登录已挡大部分垃圾）、历史导入。

## 12. 测试

- vitest 单测覆盖 `comments-service`：
  - **§6 鉴权门**：非 admin 读不到 `hidden`/`spam`；跨可见性（member/vip/admin/password）文章读
    不到评论（除非有权）；`createComment` 对无权文章 403；`deleteComment` 非归属非 admin 403；
    `setCommentStatus` 非 admin 拒绝。
  - **深度**：`parentId` 指向非顶层评论 → 400。
  - **限流**：60s 内二次提交 → 429。
  - zod：body 超长/空、status 非法枚举。
- playwright e2e：详情页 → 未登录见列表+登录提示 → 登录 → 发评论 → 立即可见 → 回复 → 删除自己
  的 → admin 后台隐藏/标垃圾/删除。

## 13. 风险与待实现期确认

- `getCommentsServerFn` 复用 `lib/unlock-cookie.ts` 校验 password 文章——实现时确认其函数签名，
  必要时抽公共 helper（避免与 `blog-service.ts` 重复）。
- 首屏 SSR 多一次 D1 查询（每篇详情 +1 SELECT + replies）——低流量博客可忽略；若关注可后续加
  KV 缓存。
- 作者昵称/头像来自 `user.name`/`user.image`——确认 Better Auth 注册流程会写这两个字段（缺失
  时前端 initials 兜底）。
