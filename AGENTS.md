# AGENTS.md

本文件给在本仓库工作的 agent / 工程师使用，目标是减少误操作并统一交付标准。

## 1. 项目定位

- 这是一个博客 monorepo：`apps/web`（TanStack Start）+ `apps/cms`（Payload）+ `packages/shared`。
- 旧 Waku 代码仍在根目录保留，用于迁移期兜底，不应随意删除。

## 2. 必须遵守的约束

1. 路由兼容性不可破坏：
   - `/blog`
   - `/blog/:slug`
2. 权限裁决必须在服务端做，前端只做展示。
3. `PAYLOAD_SERVICE_TOKEN` 绝不能暴露给浏览器。
4. CMS 与前台登录态是两套体系，不能混用。
5. Payload admin import map 需要入库，不要忽略：
   - `apps/cms/src/app/(payload)/admin/importMap.js`

## 3. 常用命令

```bash
# 安装
pnpm install

# 本地开发
pnpm dev:cms
pnpm dev:web
pnpm dev:new

# 内容迁移
pnpm migrate:content

# 类型检查（当前以分应用为准）
pnpm --filter @blog/web typecheck
pnpm --filter @blog/cms typecheck
```

## 4. 环境变量关键点

- `apps/cms/.env` 与 `apps/web/.env` 中以下值必须一致：
  - `DATABASE_URL`
  - `PAYLOAD_SERVICE_TOKEN`
  - `APPS_WEB_URL` / `PAYLOAD_PUBLIC_URL`（按真实域名）
- 默认使用 PostgreSQL。
- `ADMIN_EMAIL_ALLOWLIST` 用于首个 admin 自动提升。

## 5. 数据与权限

- 角色：`member | vip | admin`
- 文章可见性：`public | member | vip | admin | password`
- 文章发布后前台是否可见，取决于：
  - `_status`（published/draft）
  - `visibility`
  - 当前用户角色 / 解锁 cookie

## 6. 运行与发布注意事项

1. `apps/cms/src/payload.config.ts` 中 Postgres 使用 `push: false`，避免开发时交互式删表。
2. 若改了 admin 组件映射，手动生成 import map：
   ```bash
   pnpm --filter @blog/cms exec payload generate:importmap
   ```
3. Better Auth 表迁移（首次）：
   ```bash
   pnpm dlx @better-auth/cli migrate --cwd ./apps/web --config ./src/lib/auth.ts --yes
   ```

## 7. 提交前最低验证

至少执行：

```bash
pnpm --filter @blog/web typecheck
pnpm --filter @blog/cms typecheck
```

并进行基础冒烟：

- `http://127.0.0.1:3000/blog`
- `http://127.0.0.1:4100/admin/login`

## 8. 已知现状

- `.husky/pre-push` 当前是根级 `pnpm tsc --noEmit`，会触发 legacy 与新架构混合类型检查。
- 在该问题彻底清理前，推送可能需要 `--no-verify`，但不能跳过分应用 typecheck 和冒烟验证。
