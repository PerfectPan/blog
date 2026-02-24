# 技术选型说明（2026-02）

## 1. 目标与约束

当前博客系统的核心需求是：

- 保持路由兼容：`/blog`、`/blog/:slug`
- 支持登录与角色权限：`member | vip | admin`
- 支持文章可见性：`public | member | vip | admin | password`
- 私密内容不再放在公开仓库 markdown 中
- 前台与 CMS 解耦，权限裁决在服务端
- 早期控制成本、降低运维复杂度

## 2. 最终方案

- 前台框架：TanStack Start（`apps/web`）
- CMS 框架：Payload（`apps/cms`）
- 鉴权：Better Auth
- 数据库：PostgreSQL
- 部署：Vercel（web）+ Railway（cms + postgres）

## 3. 主选型与官网

- TanStack Start: <https://tanstack.com/start/latest/docs/framework/react/overview>
- Payload CMS: <https://payloadcms.com/docs/getting-started/what-is-payload>
- Better Auth: <https://www.better-auth.com/docs/introduction>
- PostgreSQL: <https://www.postgresql.org/>
- Vercel: <https://vercel.com/docs>
- Railway: <https://docs.railway.com/>

## 4. 为什么选 Payload

1. 权限模型贴合需求：Payload 原生支持基于角色/条件的 Access Control。  
2. 草稿发布流程成熟：支持 Drafts / Versions，方便发布与回滚。  
3. 私密内容入库：文章保存在数据库，不暴露在公开仓库。  
4. 代码优先：可直接在 TypeScript 中定义集合、字段、权限规则。  
5. 与当前架构契合：与 TanStack Start 分层清晰，服务端调用链路已落地。

Payload 相关官方文档：

- Access Control: <https://payloadcms.com/docs/access-control/overview>
- Drafts: <https://payloadcms.com/docs/versions/drafts>
- Versions: <https://payloadcms.com/docs/versions/overview>

## 5. CMS 备选（未采用）

### 5.1 Directus

- 官网：<https://directus.io/>
- 文档：<https://docs.directus.io/>
- 说明：GUI 配置权限很强，但对本项目“代码侧深度定制”场景，当前不如 Payload 直接。

### 5.2 Strapi

- 官网：<https://strapi.io/>
- 文档：<https://docs.strapi.io/>
- 说明：生态成熟，RBAC 能力完备；但迁移成本高于继续沿用已落地的 Payload 实现。

### 5.3 Keystone

- 官网：<https://keystonejs.com/>
- 文档：<https://keystonejs.com/docs>
- 说明：代码优先很灵活；但本项目当前后台体验与已有实现不需要额外更换成本。

## 6. 部署平台选型（服务层）

当前部署方案是：

- `apps/web` 部署在 Vercel
- `apps/cms` + PostgreSQL 部署在 Railway

选择理由：

1. 前台部署在 Vercel：静态资源与 Serverless 发布流程简单，预览环境开箱可用。  
2. CMS 与 DB 放 Railway：更适合常驻后端服务与数据库联动，迁移/重启/日志排障路径清晰。  
3. 职责分层明确：`web` 只做页面与服务端聚合，`cms` 专注内容管理与访问控制。  
4. 成本与运维平衡：在当前阶段，能快速迭代并保持较低维护复杂度。

官方文档：

- Vercel Docs: <https://vercel.com/docs>
- Railway Docs: <https://docs.railway.com/>
- Railway Postgres: <https://docs.railway.com/databases/postgresql>

可选部署组合（未采用）：

- 全部放 Vercel（web + cms）：可行，但 CMS 对连接与迁移流程约束更高，排障复杂度上升。  
- 全部放 Railway（web + cms + db）：可行，但前台预览与发布体验不如 Vercel 成熟。  
- 其他组合（如 Cloudflare + 独立 DB）：可行，但当前迁移成本高于收益。

## 7. 复盘与后续

- 当前结论：继续沿用 Payload，不做框架切换。
- 复盘触发条件（满足任一再评估选型）：
1. CMS 维护成本显著上升（例如迁移、升级、稳定性问题持续）
2. 内容团队对后台体验出现长期阻塞
3. 权限模型出现 Payload 难以维护的复杂度跃迁
