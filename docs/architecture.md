# 项目架构（2026-02）

## 1. 总览

当前仓库是一个 monorepo，采用「前台 + CMS + 共享类型」三层结构：

- `apps/web`：TanStack Start 前台站点（博客展示、登录、权限守卫）
- `apps/cms`：Payload CMS（内容管理、后台管理、访问控制）
- `packages/shared`：前后端共享类型（角色、可见性、文章结构）

同时保留了旧版 Waku 代码（根目录 `src/`、`content/` 等）用于迁移兜底和回滚。

---

## 2. 目录结构

```txt
blog/
├─ apps/
│  ├─ web/                 # TanStack Start
│  └─ cms/                 # Payload + Next admin
├─ packages/
│  └─ shared/              # 共享类型与常量
├─ content/blog/           # 历史 markdown 文章（迁移来源）
├─ docs/
│  ├─ deploy-vercel-railway.md
│  └─ architecture.md
└─ src/                    # 旧 Waku 实现（保留）
```

---

## 3. 核心请求链路

### 3.1 博客列表/详情

1. 浏览器请求 `apps/web` 路由（如 `/blog`、`/blog/:slug`）
2. `apps/web` 在服务端读取会话，得到用户角色
3. `apps/web` 通过 `PAYLOAD_SERVICE_TOKEN` 调用 `apps/cms` 的 `/api/web/*`
4. `apps/cms` 根据角色和文章状态过滤后返回数据
5. `apps/web` 渲染页面（必要时走本地 markdown fallback）

### 3.2 登录与会话

- 前台登录用 Better Auth（`/api/auth/*`）
- 会话数据存 PostgreSQL（`user/session/account/verification` 表）
- CMS Admin 登录走 Payload 自身 `users` 集合认证
- 两套登录态互相独立（这是预期）

### 3.3 密码文章解锁

1. 文章 `visibility=password`
2. 用户在 `/unlock/:slug` 提交密码
3. `apps/web` 调用 CMS 校验
4. 成功后写入 `httpOnly + signed` 解锁 cookie（默认 24h）

---

## 4. 权限模型

### 4.1 角色

- `member`
- `vip`
- `admin`

### 4.2 文章可见性

- `public`
- `member`
- `vip`
- `admin`
- `password`

### 4.3 可见范围

- 游客：`public`
- `member`：`public/member`
- `vip`：`public/member/vip`
- `admin`：全部已发布文章（含 `password`）

---

## 5. 数据与内容

### 5.1 内容来源

- 线上权威数据：Payload `posts` 集合
- 迁移源：`content/blog/*.md`
- 迁移脚本：`apps/cms/scripts/migrate-content.ts`

### 5.2 当前兜底策略

- `apps/web` 支持 markdown fallback（`ENABLE_MARKDOWN_FALLBACK=true`）
- 用于迁移期兜底，稳定后建议关闭

---

## 6. 本地运行（标准流程）

```bash
pnpm install
```

1. 复制环境变量模板：

```bash
cp apps/cms/.env.example apps/cms/.env
cp apps/web/.env.example apps/web/.env
```

2. 启动 CMS：

```bash
pnpm dev:cms
```

3. 初始化/同步历史文章（首次或有 markdown 变更时）：

```bash
pnpm migrate:content
```

4. 初始化 Better Auth 表（首次）：

```bash
pnpm dlx @better-auth/cli migrate --cwd ./apps/web --config ./src/lib/auth.ts --yes
```

5. 启动前台：

```bash
pnpm dev:web
```

---

## 7. 部署架构

- 前台：Vercel（`apps/web`）
- CMS + DB：Railway（`apps/cms` + PostgreSQL）

关键约束：

- 浏览器不得直接调用 CMS 私有接口
- `PAYLOAD_SERVICE_TOKEN` 只允许存在于服务端环境变量
- CMS Postgres 适配器已配置 `push: false`，避免开发时误触发交互式删表

---

## 8. 维护注意事项

- 保持历史 URL 不变：`/blog`、`/blog/:slug`
- Payload import map 文件需要入库：
  - `apps/cms/src/app/(payload)/admin/importMap.js`
  - 变更 admin 组件后可手动执行：`payload generate:importmap`
- 根目录 pre-push 当前执行 `pnpm tsc --noEmit`，会覆盖 legacy + new 全仓类型检查；在完全收敛前，建议至少执行：
  - `pnpm --filter @blog/web typecheck`
  - `pnpm --filter @blog/cms typecheck`
