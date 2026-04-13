# 用户指令记忆

本文件记录了用户的指令、偏好和教导，用于在未来的交互中提供参考。

## 格式

### 用户指令条目
用户指令条目应遵循以下格式：

[用户指令摘要]
- Date: [YYYY-MM-DD]
- Context: [提及的场景或时间]
- Instructions:
  - [用户教导或指示的内容，逐行描述]

### 项目知识条目
Agent 在任务执行过程中发现的条目应遵循以下格式：

[项目知识摘要]
- Date: [YYYY-MM-DD]
- Context: Agent 在执行 [具体任务描述] 时发现
- Category: [代码结构|代码模式|代码生成|构建方法|测试方法|依赖关系|环境配置]
- Instructions:
  - [具体的知识点，逐行描述]

## 去重策略
- 添加新条目前，检查是否存在相似或相同的指令
- 若发现重复，跳过新条目或与已有条目合并
- 合并时，更新上下文或日期信息
- 这有助于避免冗余条目，保持记忆文件整洁

## 条目

[用户中心 account 架构概览]
- Date: 2026-04-13
- Context: Agent 在执行“熟悉 account.html 架构以优化订单管理页”时发现
- Category: 代码结构
- Instructions:
  - 主用户中心页面为 `/account/account.html`，采用单文件 HTML + 内联脚本的多 Tab 结构（dashboard/saved/profile/security/preferences/sales）。
  - 销售与订单流相关 UI 挂载点在 `#tab-sales`，核心渲染和交互逻辑由外部脚本 `/account/sales-pipeline.portal.js` 接管。
  - `switchTab('sales')` 会调用 `window.GasGxSalesPipelinePortal.onTabActivated()`，订单流数据按需加载而非首屏一次性加载。

[用户中心订单流数据来源]
- Date: 2026-04-13
- Context: Agent 在执行“熟悉 account.html 架构以优化订单管理页”时发现
- Category: 依赖关系
- Instructions:
  - 订单流使用 Supabase RPC 获取与提交：`get_customer_pipeline_overview`、`get_customer_pipeline_detail`、`submit_customer_requirement`、`submit_customer_stage_confirmation`。
  - 兼容旧链接场景，支持 `req/req_token` 与 `confirm_stage/confirm_token` 参数，并回退到 `get_public_quote_requirement`、`get_public_quote_stage_confirmation` 等公开 RPC。

[订单列表移动端长度问题根因]
- Date: 2026-04-13
- Context: Agent 在执行“优化 account 订单管理页移动端体验”时发现
- Category: 代码模式
- Instructions:
  - `account/account.html` 在 `@media (max-width: 1279px)` 下曾将 `.sales-list-scroll` 设为 `max-height: none`，导致报价单较多时列表无限拉长。
  - 该模块适合移动端使用横向滚动卡片或受限高度滚动，避免订单列表把详情区域推到很下方。
