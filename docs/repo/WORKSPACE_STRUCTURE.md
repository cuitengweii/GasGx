# Workspace Structure

## Repository
- Repo: `GasGx`（Ghost OS 归档路由）
- Working directory: `/Users/cuitengwei/Allen/GasGx`

## Key Routes

### Ghost OS
- `shared/ui/`: 全站共享 header/footer、登录态、语言切换、聊天浮窗等通用 shell
- `products/`: 产品中心与产品详情页
- `about/`: 关于页与站点政策页
- `news/`: 新闻频道与频道页
- `docs/`: 归档、路由说明、状态沉淀文档
- `quote/`: 报价编辑器与客户预览页面
- `shared/quote-system/`: 报价数据规范化、编辑器和运行时模块
- `article_management/sql/`: Supabase 报价系统迁移
- `scripts/ftp_deploy.sh`: 默认 FTP 上传脚本

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

## 发布交接
- Git 分支：`codex/publish-site-updates`
- FTP 配置优先级：环境变量 / `.env.ftp`，缺失时回退 `.vscode/sftp.json`
- 上传命令：`sh scripts/ftp_deploy.sh upload <local_file> <remote_file>`
