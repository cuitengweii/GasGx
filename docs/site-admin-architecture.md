# GasGx 网站后台架构说明

更新时间：2026-03-21

## 1. 当前后台层次

后台入口：

- `/article_management/index.html`

当前信息架构：

- `Dashboard`
- `Site`
  - `主站导航`
  - `主站 Footer`
- `News`
  - 文章管理
  - 新建文章
  - 回收站
  - 首页推荐位
  - 采集队列
  - 标签管理

## 2. 站点壳配置链路

### 编辑端

- `article_management/modules/site-shell-admin.module.js`
  - 负责站点壳编辑 UI
  - 负责树形折叠编辑
  - 负责异步逐项保存

- `article_management/modules/site-shell.module.js`
  - 负责站点壳配置的加载、规范化和保存
  - 负责 Supabase 发布态与静态 fallback 之间的桥接

### 发布态存储

- `public.site_shell_configs`

关键字段：

- `scope`
- `config`
- `updated_at`
- `updated_by`

### 前台消费端

- `shared/ui/site-shell.shared.js`
  - 主站共享壳运行时读取

- `news/shared/modules/layout.shared.js`
  - News footer 对统一站点壳配置的复用入口

## 3. 当前配置模型

站点壳 JSON 顶层结构：

- `navigation`
- `sharedText`
- `footer`

其中 `navigation` 支持：

- `link`
- `menu`
- `mega`

并支持：

- 双语标题
- 显隐
- 排序
- children
- sections

## 4. 降级与容错

若 Supabase 发布态配置不可用：

1. 回退 `/shared/ui/site-shell.config.js`
2. 再回退 `site-shell.shared.js` 内置默认值

News footer 若未取到统一站点壳配置：

- 再回退旧的 `feeder_form_options`

## 5. 当前边界

第一阶段只接管全站共享壳：

- Header
- Footer

尚未覆盖：

- 全站栏目级页面配置
- 全站页面模板管理
- 更细粒度的站点运营模块
## 2026-03-22 architecture update

### Quote-system runtime layers

- Admin workflow shell:
  - `article_management/modules/quote-system.module.js`
  - manages brand/product/instance selection and admin actions
- Real quote editor runtime:
  - `quote/editor.html`
  - `shared/quote-system/quote-editor.module.js`
  - uses the actual quote-page structure as the editing surface
- Customer quote runtime:
  - `quote/view.html`
  - `shared/quote-system/quote-runtime.module.js`
  - renders published quote snapshots or preview snapshots
- Shared quote data/style layer:
  - `shared/quote-system/quote-data.module.js`
  - `shared/quote-system/quote-system.css`

### Translation architecture

- Chinese source strings are collected from the real editor runtime.
- Translation requests are sent in batches to `quote-translate`.
- `quote-translate` uses XFYUN Spark over WebSocket and returns EN / RU JSON payloads.
- The editor writes translated fields back into localized quote/template state before save.

### Media architecture

- Product media library is stored separately and bound per brand/product.
- Quote rendering consumes both media gallery items and media display config:
  - show/hide
  - above title / below table
  - carousel / stacked mode

### Current boundary

- `vman/` and `minerpower/` remain public-facing brand quote entry paths.
- The system source of truth has shifted into shared quote runtime + admin-managed product/instance data rather than per-brand static HTML duplication.

## 2026-03-23 architecture update

### Public template bootstrap layer

- `article_management/modules/quote-system.module.js` now includes a public-template-library layer in front of brand-local product templates.
- That layer reads reusable starter templates from live `vman` / `minerpower` product records and copies normalized product data into the currently selected brand draft.
- The admin workflow shell therefore has three product-template sources:
  - brand-local saved templates
  - public starter templates
  - empty/manual product drafts

### Brand routing control layer

- Brand management now exposes `default_quote_slug` as a dedicated visible control instead of leaving it buried in the long brand form.
- This turns default outbound routing into an explicit admin concern alongside brand identity, rather than an obscure secondary field.

### Editor visibility boundary

- Quote-instance-only panel styles are no longer assumed to be safe for brand and product management surfaces.
- Brand/product admin editors now require their own visibility rules so product bootstrap flows are not hidden by instance-editor CSS contracts.

## 2026-03-23 public requirement architecture update

### Requirement intake layers

- Admin requirement workflow shell:
  - `article_management/modules/quote-system.module.js`
  - creates/binds requirement drafts, issues public links, tracks submission state, and spawns quote drafts from submitted requirements
- Public customer requirement runtime:
  - `quote/requirement.html`
  - `shared/quote-system/quote-requirement.module.js`
  - renders the external customer-facing intake form for one unique requirement link
- Shared styling layer:
  - `shared/quote-system/quote-system.css`
  - now styles quote viewing, real editing, and customer requirement intake with one visual system

### Data and access boundary

- `quote_requirements` now needs both admin-side row access and public-link access semantics.
- Public access is not handled through direct anon table reads; it is mediated by RPC functions keyed by:
  - `public_slug`
  - `public_token`
- Requirement lifecycle now sits structurally between customer master and quote instance:
  - `quote_customers`
  - `quote_requirements`
  - `quote_instances`

### Workflow boundary

- Requirement collection and quote authoring are now separate runtimes.
- Admin no longer serves as the primary requirement-entry UI for customer answers; it serves as the orchestration shell around customer submission.
- Quote generation is gated behind submitted requirement state so the pipeline keeps one explicit handoff point from customer demand capture into pricing work.

## 2026-03-25 sales customer-flow architecture update

### Rendering boundary

- `article_management/modules/quote-system.module.js` now owns customer-flow page structure and stage-detail rendering.
- `article_management/modules/sales.bootstrap.js` is being reduced to shell-only responsibilities:
  - entry loading
  - page-mode classes
  - shared sales-admin frame behavior
- Business DOM ownership is no longer intended to be split across template render and bootstrap-time mutation.

### Quote-stage rendering layers

- Quote-stage routing now passes through explicit helper layers:
  - `quoteStageRecord(...)`
  - `quoteStageDetailRenderer(...)`
  - `quoteDraftStageMarkup(...)`
  - `quoteConfirmedStageMarkup(...)`
- Shared quote-stage fragments such as base meta and share-poster modal markup were also split into helpers so draft and confirmed states can evolve independently.

### Execution-stage rendering layers

- Execution stages now share a three-level rendering stack:
  - outer shell: `executionStageCardMarkup(...)`
  - action strip: `executionStageActionsMarkup(...)`
  - field primitives:
    - `executionStageFieldMarkup(...)`
    - `executionStageFieldGridMarkup(...)`
    - `executionStageTextareaFieldMarkup(...)`
- Stage-specific functions still exist, but they now mostly compose these shared helpers instead of duplicating container structure.

### Event-layer transition state

- The event layer now has three extracted binders:
  - `bindSalesRequirementActions(...)`
  - `bindSalesQuoteActions(...)`
  - `bindSalesExecutionActions(...)`
- The final architectural step is still pending:
  - `bindSalesStageListActions(...)` must be reduced to a thin dispatcher that delegates to those helpers
  - the old monolithic binding body has not yet been removed
