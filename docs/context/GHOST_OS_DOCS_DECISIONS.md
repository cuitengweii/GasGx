# GHOST_OS_DOCS Decisions

## 报价系统交接规则（2026-07-23）

- 报价编辑器的模块键使用 `main_config`、`optional_config`、`service_package`、`wear_parts`；易损件必须作为服务包之后的独立 section，不得复用服务包键。
- 编辑器新增模块时，必须同步更新共享数据规范化、编辑器按钮/渲染、预览运行时分组、Supabase section 约束和对应产品的 `section_config`。
- 本会话的发布流程固定为：在 `codex/publish-site-updates` 分支提交，推送到 `origin`，再使用 `scripts/ftp_deploy.sh upload` 上传变更的静态文件。FTP 默认读取 `.env.ftp`，缺失时回退到 `.vscode/sftp.json`。
