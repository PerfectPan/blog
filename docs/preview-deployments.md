# 原生 Preview Builds

Cloudflare 已启用 Worker Previews，生产继续监听 `master`。所有预览共用 `blog-preview` D1
和 `blog-assets-preview` R2；生产使用 `blog` 和 `blog-assets`。不为每个 PR 创建数据库。
绑定分别在 `wrangler.jsonc` 顶层和 `previews` 块中声明。

## 构建与认证

Workers Builds 的工作目录为 `apps/web`。构建变量 `SKIP_DEPENDENCY_INSTALL=1` 关闭镜像的自动安装，依赖由下面的构建命令按原锁文件安装。镜像自带的 Node 只负责启动 npm，项目命令使用各分支声明的 Node。生产和预览的 Build command 相同：

```sh
range=$(node -p 'require("../../package.json").devEngines?.runtime?.version || require("node:fs").readFileSync("../../.nvmrc","utf8").trim()') &&
  test -n "$range" &&
  npm exec --yes --package="node@$range" -- sh -ec 'node --version && pnpm --version && pnpm install --frozen-lockfile && pnpm build'
```

声明了 `devEngines.runtime.version` 的分支使用该范围；其他分支沿用根目录 `.nvmrc`。核对实际运行时应看 Build command 输出的 `node --version`。GitHub Actions 直接从 `^26.13.1` 范围选择版本。

Deploy command 使用相同的版本选择及 npm 启动方式。生产执行 `npx wrangler deploy -c dist/server/wrangler.json`，预览执行 `pnpm preview:deploy`。常规预览先迁移 preview D1，再运行原生 `wrangler preview`。分支名、域名和 PR 链接由 Cloudflare 处理。

迁移使用原生 D1 CLI 和 `wrangler.preview-migrations.jsonc`，其数据库 ID 必须与运行时
`previews.d1_databases` 一致；该配置只选择现有数据库，不创建数据库或 Worker。

Better Auth 使用其原生动态 baseURL 配置。只有 preview 设置 `AUTH_ALLOWED_HOSTS`，
限定为 `*.preview.perfectpan.org` 且使用 HTTPS；生产仍使用固定 `APPS_WEB_URL`。
`APPS_WEB_URL` 保持正式站点的 canonical 地址，用于 RSS 等公开链接。
文章缓存按实际请求域名清理，避免 preview 编辑影响其他域名的缓存。

`BETTER_AUTH_SECRET` 由 Previews Base 提供，独立于生产且不随构建重置。Base 变更只影响
新预览，轮换时需另行更新已有预览。GitHub OAuth 和邮件凭据不继承生产配置。

## 维护

`.github/workflows/preview.yml` 只在同仓库 PR 关闭时按分支名删除预览；不存在视为完成，
其他错误保留。它不会删除数据库或存储桶。关闭事件的实际清理仍待验收。
Fork PR 不获得部署凭据，使用本地回归。

共享 preview 数据意味着不同 PR 的迁移与编辑会相互影响；迁移应向后兼容。
`db:sync-preview` 会覆盖预览文章表，避免与编辑回归同时执行。
改表过渡与所有写入方的兼容要求见 `AGENTS.md` 的“表结构演进与预览数据”。现有手动同步
仍使用固定文章字段和覆盖写入，执行前必须确认它适用于当前 schema；尚未启用月度自动同步。

控制台已完成切换，仓库变更仍待本 PR 合入。旧分支需要同步迁移后的 master，避免继续
运行旧的 Actions 部署流程。迁移期间创建的自定义名称预览不会被新的分支名清理命令匹配。

参考：[Cloudflare Preview Builds](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/)、
[Better Auth 动态域名](https://better-auth.com/docs/guides/dynamic-base-url)。
