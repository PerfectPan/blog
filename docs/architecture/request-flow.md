# 页面访问调用链路

本文描述「用户打开博客页面、提交密码解锁或读写评论」时的服务端调用链与文件归属。当前全站运行在 Cloudflare Worker + D1 上：文章、评论和用户会话全部存在 D1（`post`、`comment`、`user`/`session` 表），无 CMS、无构建期内联 markdown。完整架构约束见 [`overview.md`](overview.md)。

## 1) 读文章列表与详情：`GET /blog`、`GET /blog/:slug`

```mermaid
flowchart TD
  A["浏览器请求<br/>GET /blog 或 /blog/:slug"] --> W["Worker 入口<br/>www → apex 301 判断<br/>apps/web/src/server.tsx"]
  W --> B["TanStack route loader<br/>apps/web/src/routes/blog/index.tsx<br/>apps/web/src/routes/blog/$slug.tsx"]
  B --> C["ServerFn<br/>getBlogListServerFn / getBlogPostServerFn<br/>apps/web/src/lib/blog-service.ts"]
  C --> D["读取登录态<br/>getSessionUserFromRequest(request)<br/>apps/web/src/lib/session-core.ts"]
  D --> E["Better Auth 取 session<br/>auth.api.getSession(headers)<br/>apps/web/src/lib/auth.ts"]
  E --> F["D1（user / session 表，kysely-d1）"]
  C --> G["读文章内容<br/>getAllPublishedPosts / getPostBySlug<br/>apps/web/src/lib/content-service.ts"]
  G --> H["D1（post 表，参数化 SQL）"]
  H --> I["数据层按角色过滤 / 裁剪正文<br/>canAccessVisibility(post.visibility, role)<br/>blog-service.ts / @blog/shared"]
  I --> J["详情页 route loader 裁决<br/>401 / 403 / 跳 /unlock/:slug<br/>apps/web/src/routes/blog/$slug.tsx"]
  J --> K["服务端渲染 Markdown HTML + SSR<br/>lib/markdown-html.tsx"]
  K --> L["浏览器按可见区域 Web Worker 高亮<br/>components/markdown-highlight.worker.ts"]
```

- 会话读取与文章查询并行执行，权限裁决在两者完成后进行；无权查看时在数据层即置空正文，防止直接 RPC 调用 server fn 绕过 route loader。
- 详情页通过可见性门后，再调用 `getCommentsServerFn`（`lib/comments-service.ts`）读取 D1 `comment` 表（服务端同样在 handler 内重校验会话与文章可见性，并在 worker 上把评论正文渲染为无 `rehype-raw` 的 HTML）。

## 2) 密码文章解锁：`POST /unlock/:slug`

```mermaid
flowchart TD
  A["用户提交密码<br/>POST /unlock/:slug"] --> B["路由 handler<br/>apps/web/src/routes/unlock/$slug.tsx"]
  B --> C{"触发限流?<br/>unlock-rate-limit.ts"}
  C -- "是" --> D["返回 429"]
  C -- "否" --> E["查 D1 校验密码（拒绝草稿）<br/>verifyPostPassword(slug, password)<br/>apps/web/src/lib/content-service.ts"]
  E --> F{"密码正确?"}
  F -- "否" --> G["记录失败次数并重定向<br/>/unlock/:slug?error=invalid"]
  F -- "是" --> H["签发 HMAC HttpOnly 解锁 Cookie<br/>apps/web/src/lib/unlock-cookie.ts"]
  H --> I["303 重定向到 /blog/:slug"]
```

## 3) 关键代码定位

- Worker 入口（`www → apex` 301）：`apps/web/src/server.tsx`
- 登录态入口：`apps/web/src/lib/session-core.ts`
- 页面服务端聚合与搜索：`apps/web/src/lib/blog-service.ts`
- 文章读写与密码校验（D1 `post` 表）：`apps/web/src/lib/content-service.ts`
- 评论读写与鉴权（D1 `comment` 表）：`apps/web/src/lib/comments-service.ts`
- 认证（Better Auth on D1）：`apps/web/src/lib/auth.ts`
- Markdown 服务端渲染与浏览器高亮：`apps/web/src/lib/markdown-html.tsx` + `apps/web/src/components/markdown-highlight.worker.ts`
- 详情页权限裁决：`apps/web/src/routes/blog/$slug.tsx`
- 解锁流程：`apps/web/src/routes/unlock/$slug.tsx` + `apps/web/src/lib/unlock-cookie.ts` + `apps/web/src/lib/unlock-rate-limit.ts`
