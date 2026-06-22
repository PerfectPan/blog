# Cloudflare 迁移 — 设计与决策

日期：2026-06-22

## 目标

1. 把整个博客迁到 Cloudflare。
2. 加一个展示个人项目的 tab。
3. 尽量省钱（理想 $0/月）。
4. 重新设计 —— **本期暂缓**，等 Claude design 导出后再单独做。

## 关键决策（含取舍）

| 决策 | 选择 | 理由 |
| --- | --- | --- |
| CMS（Payload）去留 | **砍掉** | 它是唯一会超 Workers 免费版 3 MiB 上限、逼出 $5/月 的东西；用户并不依赖在线后台 |
| 内容来源 | **git markdown**（`content/blog`，构建期内联） | 已有 75 篇原稿；写文章 = 加 `.md` + push |
| 数据库 | **Cloudflare D1**（SQLite） | 与 Workers 同生、免费、可自助 provision；逃生通道是 Neon + Hyperdrive |
| 认证 | **Better Auth on D1**（kysely-d1 dialect） | 保留邮箱密码 + GitHub OAuth + 角色 |
| 权限分级 | **保留**，服务端在 route loader 裁决 | 用户明确要；可见性改由 frontmatter `visibility` 驱动 |
| 项目 tab | **写死在代码里**（`apps/web/src/lib/projects.ts`） | 单人博客最省事，无需 API/CMS |

## 目标架构

```
apps/web (TanStack Start)  ──build──>  Cloudflare Worker  (1.28 MiB gzip)
  ├── 内容: content/blog/*.md  (import.meta.glob 构建期内联)
  ├── 认证: Better Auth ──> D1 binding "DB" (database: blog)
  ├── 权限: route loader 服务端裁决 (canAccessVisibility + unlock cookie)
  └── 静态: dist/client ──> ASSETS binding
```

移除：`apps/cms`（Payload）、Postgres、`api/index.mjs` + `vercel.json`（Vercel adapter）、
`start-server.mjs`、旧 Waku `dist/`。

## 成本结论（实测，非估算）

`wrangler deploy --dry-run` 在真实构建产物上测得：

```
Total Upload: 6776 KiB  /  gzip: 1283.79 KiB  (≈ 1.25 MiB)
Workers 免费版上限: 3 MiB  →  约 58% 占用，留 ~1.75 MiB 余量
```

含 shiki 全套语法高亮 + KaTeX + Better Auth + 全部文章。**$0/月成立。**
内容/文章增长属于"数据"不进 worker 包，不会推高这个数。

## Harness（部署脚手架）

- `.github/workflows/pull-request.yml`：typecheck + biome + build + **worker 体积守门**（dry-run，超 3 MiB 即红）。
- `.github/workflows/deploy.yml`：push master → 迁移 D1 + `wrangler deploy`。
- `/deploy` skill（`.claude/skills/deploy/SKILL.md`）：固化"验证→构建→体积门→迁移→部署→冒烟"的防呆流程。
- D1 schema 走版本化迁移 `apps/web/migrations/`，不在请求期建表。

## 本期已完成且已验证

- 项目 tab `/projects` + 导航入口。
- 内容改 git markdown，移除 Payload HTTP 依赖。
- 认证/DB 切到 D1（env、db、auth、session 全部重写）。
- Cloudflare 脚手架：`wrangler.jsonc`、`@cloudflare/vite-plugin`、移除 Vercel adapter。
- 移除 `apps/cms`、清理旧 Waku `dist/` 与 stale CI 步骤。
- D1 数据库 `blog` 已创建（id `1ead9934-…`），auth 迁移已应用到本地 + 远端。
- 验证通过：`pnpm typecheck` ✓、`biome check` ✓、`pnpm --filter @blog/web build` ✓、
  `wrangler deploy --dry-run` ✓（体积 1.28 MiB、`env.DB` 绑定解析正常）。

## 尚未做（需要真实上线迭代，刻意留给人确认）

- **生产 `wrangler deploy` + 冒烟**：发布站点属外向操作，未擅自执行。上线步骤见 `/deploy` skill 与 README。
  上线前需 `wrangler secret put BETTER_AUTH_SECRET`（GitHub OAuth 可选）。
- **运行时端到端验证**：dry-run 验证了打包与绑定，但 Better Auth on D1 的登录/会话全链路
  需真实部署后点一遍（登录、注册、角色、password 文章解锁）。
- **GitHub Actions 部署所需 secret**：仓库需配 `CLOUDFLARE_API_TOKEN`。
- **重新设计**：等 Claude design 导出（TSX/截图）后单独迭代。
