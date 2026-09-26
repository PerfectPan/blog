# 原生 Preview Builds

## 切换状态

仓库迁移已准备；Cloudflare 的 Preview Builds 尚未启用，运行时 Base 密钥尚未设置，
实际分支预览尚未验收。不要仅因本地检查通过就合并并视为切换完成。

生产继续使用 Workers Builds，preview 继续绑定独立的 `blog-preview` D1 和
`blog-assets-preview` R2。不同 PR 共用预览数据，不共享生产的账号、会话或评论。

## 自动执行流程

非生产分支 push → Cloudflare build → `pnpm preview:deploy` → 检查 D1/R2 隔离 →
迁移 preview D1 → `wrangler preview` → 校验 URL 与 `APPS_WEB_URL` 一致 → 探测登录页与会话接口。
Workers Builds 负责 PR 链接；GitHub Action 仅保留关闭 PR 时的清理。

预览名称由分支名规范化后附加八位哈希组成，避免 `feature/a` 和 `feature-a` 相互覆盖；
域名是 `<name>.preview.perfectpan.org`。部署和清理使用同一个命名函数。
禁止以 `master`、缺失分支或 detached HEAD 创建预览。

`wrangler.jsonc.previews` 是变量和数据绑定的来源。Previews Base 保存稳定的预览专用
`BETTER_AUTH_SECRET`，创建 Preview 时复制；更新 Base 不会覆盖已有 Preview，轮换时需要
单独更新已有预览。不要导入生产密钥。

## 控制台切换步骤

1. 已核验现有 `Workers Builds - 2026-07-12 14:00` token 包含 D1 Edit，
   无需为这次迁移扩大权限。该 token 的 D1 权限覆盖当前账号，不等于仅授权 preview D1；
   部署脚本必须保留生产/预览绑定隔离检查。更换 token 后重新核验权限。
2. 在 Runtime variables and secrets → Previews Base 设置独立、稳定的 `BETTER_AUTH_SECRET`。
   普通变量和 DB/R2 由仓库配置提供；无需把生产绑定导入 Base。
3. Root directory 设为 `apps/web`；Build command 保持
   `pnpm install --frozen-lockfile && pnpm build`；Preview command 设为 `pnpm preview:deploy`。
4. 在包含本次脚本的分支上验证，开启 Builds for Preview branches 后 push 一个新提交触发。
   老分支需要先包含迁移提交，否则没有 `preview:deploy` 命令。生产 deploy command 保持不变。
5. 验证 Builds 成功、PR 链接可用、实际绑定为 preview D1/R2，页面和会话接口正常；
   再经用户批准合并。确认旧 Action 不再部署，关闭测试 PR 时只删除对应预览。

仓库原有 GitHub Actions 部署脚本在此迁移中移除。设置切换与 PR 验收需要配套完成；
如果云端权限或 Base 密钥未准备好，保持 Preview Builds 关闭，勿合并此迁移。

## 数据与认证边界

preview 数据库迁移会影响所有 PR，破坏性 schema 变更应使用另一个独立测试数据库。
Builds 并发运行时也可能争用共享数据库；应使用向后兼容迁移，迁移冲突需处理后重试，
不能忽略失败继续部署。`db:sync-preview` 会覆盖公开文章，避免与编辑回归同时运行。

GitHub OAuth 和邮件配置不会从生产自动继承。需要单独的测试 OAuth App 与回调设计；
当前动态预览不承诺真实 GitHub 授权可用，可用邮箱密码完成基础认证回归。
Fork PR 不应获得部署凭据，本地运行测试；不要为 fork 使用带密钥的 `pull_request_target` 检出。

## 官方依据

- [Preview Builds 的触发与已有 Worker 切换](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/)
- [Builds 命令、环境变量与默认 token 权限](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Previews 配置与 Base 密钥复制规则](https://developers.cloudflare.com/workers/previews/configuration/)
- [资源隔离](https://developers.cloudflare.com/workers/previews/resources/)
- [自动化与关闭 PR 清理](https://developers.cloudflare.com/workers/previews/examples/)
