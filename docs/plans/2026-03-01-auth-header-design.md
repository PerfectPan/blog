# Auth Header UX Design

**Goal:** 登录完成后全站头部正确反映登录态，并在已登录状态下阻止进入 `/login` 和 `/signup`。

**Architecture:** 使用 TanStack Start 的 root route loader 在服务端读取当前会话，作为布局级数据传入 `AppLayout/Header`。头部组件只做展示，不做权限裁决；登录状态由服务端 session 决定，避免首屏闪烁。认证页在路由 loader 中做已登录重定向到 `/blog`。

**Tech Stack:** TanStack Start, TanStack Router, Better Auth, React, Tailwind CSS

---

## Scope

- `Header` 从静态「Login / Sign Up」改为会话感知 UI
- `AppLayout` 支持接收并向下传递 `sessionUser`
- `__root` route 增加 loader 获取会话并注入 layout
- `/login`、`/signup` 已登录时自动跳转 `/blog`
- 维持现有路由兼容和后端权限模型不变

## Data Flow

1. 浏览器请求任意页面。
2. `__root` loader 调用 `getSessionUserServerFn`（服务端读取 cookie + Better Auth）。
3. loader 返回 `sessionUser` 给 root component。
4. `RootComponent -> AppLayout -> Header` 逐层传递 `sessionUser`。
5. Header 渲染：
- 未登录：`Login` + `Sign Up`
- 已登录：用户邮箱 + 角色标识 + `Logout`

## UX Rules

- 保持品牌与现有灰黑视觉基调一致。
- 登录态右侧显示信息，避免与主导航抢注意力。
- 小屏优先保留核心动作（登录/登出），邮箱在窄屏隐藏。
- 不引入复杂动画，保证稳定和可读性。

## Error Handling

- session 读取失败时按游客渲染（已有 `getSessionUserFromRequest` 兜底）。
- loader 不抛出鉴权错误到页面层，避免整个 layout 崩掉。
- `/login` 与 `/signup` 的重定向在 loader 里完成，防止客户端闪跳。

## Verification

- 访问 `/blog`（未登录）：头部显示 `Login / Sign Up`
- GitHub 登录后回到 `/blog`：头部显示 `email + role + Logout`
- 已登录访问 `/login`：直接跳转 `/blog`
- 已登录访问 `/signup`：直接跳转 `/blog`
- 退出后刷新：头部恢复 `Login / Sign Up`
