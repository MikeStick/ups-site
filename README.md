# SKE Power 网站（Astro 静态站）

产品数据来自客户档案系统（b2b.google-helper.com）的 `/api/public/products`。
每次构建时自动拉取已发布的产品，图片转成 WebP 后随网站发布到 Cloudflare 全球节点。

## 页面

- `/es/` `/en/` `/ru/`：产品列表（根路径 `/` 跳转到英语）
- `/<语言>/p/<型号>/`：产品详情（6 图 + YouTube 视频、阶梯价、规格表、卖点）

## Cloudflare Pages 设置

| 项目 | 值 |
|---|---|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |

环境变量（Settings → Environment variables，Production 和 Preview 都加）：

| 变量 | 值 |
|---|---|
| `CRM_API_BASE` | `https://b2b.google-helper.com` |
| `SITE_BUILD_KEY` | VPS 上 `/opt/customer-crm/server/site-config.json` 里的 `SITE_BUILD_KEY`（设为加密 Secret） |
| `SITE_URL` | 网站正式域名，例如 `https://ske-ups.pages.dev` |
| `NODE_VERSION` | `20` |

## 更新流程

客户档案系统里编辑产品 → 勾选"发布到网站" → 保存 → 点"更新到网站"。
按钮会调用 Cloudflare 的 Deploy Hook，Cloudflare 重新构建，约 1 分钟后生效。

如果拉取产品数据失败（VPS 宕机、密钥不对），构建会直接失败，线上网站保持上一个版本，不会变成空网站。

## 上线前要改的

- `src/config.mjs`：WhatsApp 号码、邮箱
- 本地开发没有设置环境变量时使用 `src/data/sample-products.json` 里的示例数据
