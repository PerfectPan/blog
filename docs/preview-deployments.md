# 原生 Preview Builds

Cloudflare 已启用 Worker Previews，生产继续监听 `master`。所有预览共用 `blog-preview` D1
和 `blog-assets-preview` R2；生产使用 `blog` 和 `blog-assets`。不为每个 PR 创建数据库。
绑定分别在 `wrangler.jsonc` 顶层和 `previews` 块中声明。

## 构建与认证

控制台 root directory 为 `apps/web`，Build command 为
`pnpm install --frozen-lockfile && pnpm build`，Preview command 为 `pnpm preview:deploy`。
该命令只按顺序执行 preview D1 迁移和原生 `wrangler preview`。分支名、域名和 PR 链接由
Cloudflare 处理，不再自定义名称、拼接 URL 或解析部署结果。

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

控制台已完成切换，仓库变更仍待本 PR 合入。旧分支需要同步迁移后的 master，避免继续
运行旧的 Actions 部署流程。迁移期间创建的自定义名称预览不会被新的分支名清理命令匹配。

参考：[Cloudflare Preview Builds](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/)、
[Better Auth 动态域名](https://better-auth.com/docs/guides/dynamic-base-url)。
