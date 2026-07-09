# Workspace Structure

## Repository
- Repo: `ghost-os`
- Working directory: `/Users/cuitengwei/Allen/GasGx`

## Key Routes

### Ghost OS
- `shared/ui/`: 全站共享 header/footer、登录态、语言切换、聊天浮窗等通用 shell
- `products/`: 产品中心与产品详情页
- `about/`: 关于页与站点政策页
- `news/`: 新闻频道与频道页
- `docs/`: 归档、路由说明、状态沉淀文档

## Product Route Map

| Route | Page | Notes |
| --- | --- | --- |
| `/products/` | `products/index.html` | 产品总览页 |
| `/products/300kw/` | `products/300kw/index.html` | 300kW 产品详情页 |
| `/products/1000kw/` | `products/1000kw/index.html` | 1000kW 产品页 |

## Shell Sync Notes
- 产品页通过 `shared/ui/site-shell.config.js` 提供全局导航数据。
- 产品页补充覆盖通过 `products/product-shell-config.js` 和 `products/product-detail.js` 完成。
- 全局 header/footer 由 `shared/ui/site-shell.shared.js` 统一渲染。

