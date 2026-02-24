# 页面访问调用链路（小白版）

本文描述「用户打开博客页面」时，代码会经过哪些文件与函数。

## 1) 读文章页/列表页：`GET /blog`、`GET /blog/:slug`

```mermaid
flowchart TD
  A["浏览器请求<br/>GET /blog 或 /blog/:slug"] --> B["TanStack 路由 loader<br/>apps/web/src/routes/blog/index.tsx<br/>apps/web/src/routes/blog/$slug.tsx"]
  B --> C["ServerFn<br/>getBlogListServerFn / getBlogPostServerFn<br/>apps/web/src/lib/blog-service.ts"]
  C --> D["读取登录态<br/>getSessionUserFromRequest(request)<br/>apps/web/src/lib/session.ts"]
  D --> E["Better Auth 取 session<br/>auth.api.getSession(headers)<br/>apps/web/src/lib/auth.ts"]
  E --> F["Postgres（better-auth 用户/会话表）"]
  C --> G["Web 服务端请求 CMS<br/>fetchVisiblePostsFromCms / fetchPostBySlugFromCms<br/>apps/web/src/lib/cms-client.ts"]
  G --> H["CMS /api/web/posts*<br/>apps/cms/src/payload.config.ts"]
  H --> I["校验服务令牌+来源<br/>assertServiceRequest()"]
  I --> J["Payload 查询 posts 集合<br/>按已发布+角色过滤"]
  J --> K["返回文章数据给 web"]
  K --> L["详情页再做最终权限判断<br/>401 / 403 / 跳转 unlock<br/>apps/web/src/routes/blog/$slug.tsx"]
  L --> M["React 渲染 HTML 返回浏览器"]
```

## 2) 密码文章解锁：`POST /unlock/:slug`

```mermaid
flowchart TD
  A["用户提交密码<br/>POST /unlock/:slug"] --> B["路由 handler<br/>apps/web/src/routes/unlock/$slug.tsx"]
  B --> C{"是否触发限流?"}
  C -- "是" --> D["返回 429"]
  C -- "否" --> E["调用 CMS 验证密码<br/>verifyPostPasswordWithCms()"]
  E --> F{"密码正确?"}
  F -- "否" --> G["记录失败次数并重定向<br/>/unlock/:slug?error=invalid"]
  F -- "是" --> H["签发 HttpOnly 解锁 Cookie<br/>apps/web/src/lib/unlock-cookie.ts"]
  H --> I["303 重定向到 /blog/:slug"]
```

## 3) 关键代码定位

- 登录态入口：`apps/web/src/lib/session.ts`
- 页面服务端聚合：`apps/web/src/lib/blog-service.ts`
- 详情页权限裁决：`apps/web/src/routes/blog/$slug.tsx`
- 解锁流程：`apps/web/src/routes/unlock/$slug.tsx`
- CMS 服务端接口：`apps/cms/src/payload.config.ts`
