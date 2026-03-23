# GasGx 网站后台状态

更新时间：2026-03-23
适用范围：`D:\code\GasGx`

## 当前状态

- 现有后台入口仍然是 `/article_management/index.html`，但定位已经从 News 内容后台升级为 GasGx 网站管理后台第一阶段。
- 后台左侧信息架构已经调整为 `Dashboard / Site / News`。
- `Site` 模块当前已经落地三个页面：
  - `主站配置`
  - `主站导航`
  - `主站 Footer`
- `System` 模块已新增两个后台页：
  - `人员管理`
  - `账号安全`
- `News` 模块原有功能仍保留：
  - 文章管理
  - 新建文章
  - 回收站
  - 首页推荐位
  - 采集队列
  - 标签管理

## 已落地能力

### 1. 共享站点壳配置源

- 主站共享壳优先读取 Supabase 表 `site_shell_configs`
- 若发布态配置不存在或读取失败，则回退到 `/shared/ui/site-shell.config.js`
- 若静态配置也不可用，则继续回退到 `shared/ui/site-shell.shared.js` 的内置默认值

### 2. 前台接入链路

- `shared/ui/site-shell.shared.js`
  - 已支持优先加载 Supabase 发布态配置
  - 已支持 `navigation / sharedText / site / footer` 统一读取
  - `site.brand` 已驱动 Header / Footer 品牌名称、首页跳转、底部品牌说明、版权文案
  - `site.features` 已驱动 back-to-top / chatbot / chat API URL
  - `site.mainAuth` 已驱动主站登录、账号页、退出跳转、认证存储键与 Supabase 认证配置
- `index.html`
  - 已开始消费 `pages.home`
  - 已支持首页 `<title>` / `<meta description>`、分析范围卡片、地图加载文案、排行榜标题与 legend、截图弹窗、二维码提示、水印文案、截图文件名
- `about/company/index.html`
  - 已开始消费 `pages.aboutCompany`
  - 已支持 About Company 页标题、页面文案、订阅输入 placeholder / 校验提示、订阅邮件目标与主题
- `about/contact/index.html`
  - 已开始消费 `pages.aboutContact`
  - 已支持 Contact 页标题、页面文案、联系邮箱展示与 mailto 跳转
- `news/shared/modules/layout.shared.js`
  - News footer 已优先复用统一站点壳配置
  - 原 `feeder_form_options` 只作为兜底来源

### 3. 网站后台第一阶段 UI

- `主站配置` 页面已经支持：
  - 品牌名称 / 首页跳转 / Footer 品牌说明 / 版权文案
  - 主站共享文案双语编辑（tagline、footer tagline、partners、登录文案等）
  - 首页面板配置（title / description / 地图加载文案 / 排行榜文案 / 截图与二维码提示）
  - About Company 页文案与订阅配置
  - About Contact 页文案与联系邮箱配置
  - 运行开关（back to top / chatbot）与 chat API URL
  - 主站账号跳转与认证配置（sign in / account / sign out redirect / storage key / Supabase）
- `主站导航` 页面已经支持：
  - 一级导航编辑
  - 二级菜单编辑
  - mega section / mega item 编辑
  - 可折叠 / 展开查看
  - 新增 / 删除 / 上下移动
  - `link / menu / mega` 类型切换
  - 中英双语标题编辑
- `主站 Footer` 页面已经支持：
  - Contact
  - Privacy Policy
  - socialLinks
  - partners
- `Site` 三个页面的后台编辑器已进入第二轮可用性修正：
  - 首个默认展开节点现在可以真正收起，不再出现“箭头点击无反应”的假折叠
  - 新增页面的操作文案已进一步汉化
  - 主编辑区与右侧预览区已收窄为更常规的后台双栏布局，减少超宽表单带来的操作负担

### 4. 保存行为

- 站点壳管理模块不再依赖“统一保存”
- 当前规则：
  - 输入框：`blur` 时异步保存
  - 下拉 / checkbox：`change` 时异步保存
  - 新增 / 删除 / 排序 / 类型切换：立即异步保存
- 当前实现本质上是“每次操作都提交整份配置 JSON 到 `site_shell_configs`”

### 5. 管理员账号与人员管理

- 后台登录不再只依赖前端写死邮箱白名单，现已支持优先读取 Supabase 表 `admin_users`
- 若 `admin_users` 尚未创建或当前环境仍未切换完成，后台仍会临时回退到 `ADMIN_EMAILS` 静态白名单，避免现有管理员被直接锁在门外
- `人员管理` 页面已支持：
  - 查看后台人员名单
  - 添加后台人员 allowlist
  - 选择是否同步创建 Supabase Auth 登录账号
  - 修改姓名 / 角色 / 启用状态
  - 向指定后台人员发送重置密码邮件
- `账号安全` 页面已支持：
  - 当前管理员直接修改密码
  - 给当前账号重新发送重置密码邮件
- 登录页已支持：
  - `忘记密码`
  - 通过 Supabase recovery link 进入重置密码表单

## 关键文件

- `D:\code\GasGx\article_management\modules\app.bootstrap.js`
- `D:\code\GasGx\article_management\modules\site-shell-admin.module.js`
- `D:\code\GasGx\article_management\modules\auth.module.js`
- `D:\code\GasGx\article_management\modules\admin-users.module.js`
- `D:\code\GasGx\article_management\modules\site-shell.module.js`
- `D:\code\GasGx\article_management\sql\005_admin_users.sql`
- `D:\code\GasGx\article_management\sql\004_site_shell_configs.sql`
- `D:\code\GasGx\shared\ui\site-shell.shared.js`
- `D:\code\GasGx\news\shared\modules\layout.shared.js`

## 未完成事项

- 站点后台虽然已经扩展到主站基础配置，并开始接入首页与 About 页面级配置，但还没有进入更多栏目页、专题页的页面级配置管理
- 导航编辑器当前使用 `Up / Down` 排序，还没有拖拽排序
- 当前站点后台虽然已经收窄为更常规的双栏布局，但导航编辑器仍然是“树 + 内联表单”模式，尚未升级为“左侧树 + 右侧属性面板”
- `site_shell_configs` 建表脚本已执行；后续新增字段无需再改单独 SQL，只需保持 JSON schema 与前台消费同步
- `admin_users` 需要执行 `005_admin_users.sql` 后，人员管理与数据库 allowlist 才能进入正式态；未执行时仍只会回退到静态管理员邮箱

## Next Step

1. 继续把 `Site` 模块从首页 / About 页面级配置扩展到更多栏目页、专题页和模块页配置
2. 优先梳理哪些主站页面仍在各自 HTML / JS 中维护散落文案与 meta，再逐步收口到 `site_shell_configs`
3. 将当前导航与页脚编辑器从“树 + 内联表单”继续升级为“左侧树 + 右侧属性面板”，减少纵向滚动与重复展开操作
4. 将后台人员管理从 allowlist + 自助密码能力继续升级到更完整的邀请制或服务端 Admin API，减少前端侧账号开通约束
## 2026-03-22 update

### Latest milestone

- Quote System V1 now includes customer relationship binding, soft-archive workflow, and quote access analytics inside `article_management`.
- Quote System V1 now also exposes a customer-centric admin page so operators can inspect one customer's related quotes and access timeline in one place.
- `vman` and `minerpower` are no longer treated as isolated static quote pages only; they now act as the first baseline templates and brand entries.
- The editing direction has been corrected from a fake admin visual shell to the real quote-page DOM itself.

### Effective entry points

- Admin shell: `D:\code\GasGx\article_management\index.html`
- Real product-template editor: `D:\code\GasGx\quote\editor.html?kind=product&id=<product_id>`
- Real quote-instance editor: `D:\code\GasGx\quote\editor.html?kind=instance&id=<instance_id>`
- Customer quote page: `D:\code\GasGx\quote\view.html?quote=<public_slug>`

### Effective behaviors

- Quote authoring is now Chinese-first.
- EN / RU are optional overrides and can be auto-generated instead of manually maintained for every field.
- Product media is handled as a per-brand/per-product gallery and rendered by page config.
- Saving from the real quote editor triggers automatic EN / RU generation through Supabase Edge Function `quote-translate`.
- Quote instances now bind to a reusable customer master record while preserving a per-quote customer snapshot for audit-safe publishing.
- Quote instances are archived instead of hard-deleted; archived quotes retain customer relations, published snapshots, and access history.
- Quote page runtime now writes best-effort event logs for direct views, share-link opens, passcode unlocks, admin previews, share-link generation, and email-trigger actions.
- Quote instances now store structured share metadata in `share_config`, so the default recipient, company, owner, and follow-up notes travel through publish, share generation, and analytics logging.
- Quote instances now persist operator-side send workflow only in `quote_instance_sends`; `share_config.send_history` is no longer read or written by runtime/admin.
- Send-ledger rows can accumulate resend attempts and operator-updated outcomes, and legacy JSON rows can now be imported into the relational ledger from admin.

### Solved in this thread

- Real quote-page editing replaced the previous fake "1:1 visual editor" direction.
- Spark translation was connected through Supabase and fixed for streamed WebSocket output.
- Large-template translation now runs in batches instead of one oversized request.
- EN / RU glossary was refined for repeated technical row terms in generator, rack module, switchgear, valves, heat-recovery, container, and service-cost terminology.
- Quote instances now support customer linkage via `quote_customers`, with snapshot persistence on each instance and analytics reads from `quote_instance_events`.
- A dedicated `客户洞察` admin page now aggregates related quote instances and recent events by customer, while still allowing master-profile edits for company/contact data.
- The quote list now supports `归档 / 恢复` actions instead of assuming hard deletion from the list panel.
- Quote runtime now records who opened preview/share/direct quote routes, including logged-in session email or fallback viewer label.
- Quote instance editor now exposes a dedicated share-recipient block, and generated share links sign the current recipient/owner metadata into the token so later share-open events remain traceable.
- Quote runtime now writes outbound recipient threads directly into `quote_instance_sends` and treats `011_quote_send_ledger.sql` as required schema.
- Quote/customer admin pages now read the relational send ledger only; compatibility-mode hints and legacy JSON backfill actions were removed after production verification found no remaining `share_config.send_history` rows.
- Quote instance admin now allows operators to update send-ledger status, write outcome notes, manually record resend attempts, and backfill legacy ledger rows from the quote details page.
- Sitemap exclusion rules now block nested `node_modules` and other internal toolchain path segments instead of only excluding top-level prefixes.

### Unfinished

- The customer dimension is still quote-centric; there is not yet a dedicated customer management page showing all quotes and full interaction history grouped by customer.
- The customer page is now available, but it is still a lightweight admin surface rather than a full CRM with ownership, follow-up workflow, or export.
- Access analytics is currently exposed per quote instance; cross-customer aggregation, export, and follow-up workflow are not built yet.
- Share metadata is still quote-level default state, not yet a full multi-recipient CRM object model with separate recipient ownership and authorization rules.
- Production verification on 2026-03-23 found `quote_instances.share_config.send_history = 0` and `quote_instance_sends = 0`, so retiring the JSON fallback does not strand any historical send rows in the current environment.
- The customer-side identity model still distinguishes logged-in vs anonymous session access, but has not yet introduced a dedicated CRM-style recipient/contact authorization model.

### Next Step

1. Surface richer analytics filters in admin, including event type, date range, and logged-in vs anonymous viewers.
2. Add explicit owner workflow fields such as next follow-up date, reminder status, and closed reason on top of the current send ledger.
3. When the first real outbound send records appear in production, verify the relational ledger lifecycle again against actual operator traffic instead of migration cases.

### Auth email template sync helper

- A local auth-email template sync helper is now present:
  - `D:\code\GasGx\scripts\update_supabase_auth_email_templates.mjs`
- Local HTML sources for Supabase Auth mailers are now organized under:
  - `D:\code\GasGx\supabase\templates\`
- This path is currently an operator/developer sync tool, not yet an admin-UI feature.

## 2026-03-23 archive update

### Latest milestone

- Quote product-template admin now exposes a reusable public template library based on the real `vman` and `minerpower` product data instead of relying on a brittle legacy bootstrap path.
- Brand management now exposes a dedicated default-link editor block so operators can see and edit the brand-level outbound quote slug without hunting through lower form sections.
- Product-template save now falls back to `product_code` or `slug` when `public_title` is still empty, so copy-template flows no longer fail on a hidden "at least one product title" validation path.
- Product-template admin now surfaces the customer-facing product title, page-header copy, and footer copy in a dedicated upper-half "publish copy" panel instead of burying them inside the lower visual editor.
- Brand default-link management now supports a published-quote picker with optional manual slug override, while still persisting a single effective `default_quote_slug`.

### Effective behaviors

- New or empty brands can bootstrap from two public template families:
  - `VMAN`: standalone power-generation template family
  - `MinerPower`: integrated miner-power-container template family
- Copying a public template into the current brand now preserves the target brand identity and generates a safe product slug for the destination brand instead of reusing the source brand identity.
- The product-template page hero and import controls were compacted so template selection no longer consumes most of the screen above the actual editor.
- Product-template editing now starts with supplier / sender metadata plus localized publish-copy fields, so operators can confirm the customer-visible title and brand copy before touching rates or line items.
- The product visual editor header now acts as a summary card for publish-copy state, while the editable localized fields live in the dedicated upper copy panel.
- Brand default-link editing now defaults to a brand-scoped published quote selection, and only falls back to a typed slug when operators explicitly use manual override.
- Brand short-name edits now sync the display name during the same edit session unless the operator explicitly diverges the display name.
- The dedicated brand default-link panel is forced visible even under older shared panel CSS rules that previously hid non-instance editor blocks.
- Product-template and brand editor panes are no longer hidden by quote-instance-only layout CSS classes.

### Solved in this thread

- Added a public template library that surfaces `vman` and `minerpower` as reusable starter templates for new brands.
- Fixed brand/product save semantics to update existing rows by `id` instead of accidentally colliding on primary keys during slug changes.
- Added a visible default-link editor for brands and corrected the CSS conflict that originally hid it after deployment.
- Fixed copy-template follow-up editing by removing instance-only hidden-panel CSS from brand/product admin pages.
- Removed the save blocker where product templates required a hidden localized title field by auto-deriving `public_title` from `product_code` or `slug`.
- Moved product-template publish-copy inputs to the top of the editor, including `public_title`, shared brand `overview_title`, and shared brand `footer_note`.
- Replaced the brand default-link free-text flow with a published-quote picker plus manual override, including an explicit "current effective slug" summary.

### Unfinished

- The public template library still assumes only two canonical families; there is not yet a first-class "template family" entity or tagging model in the database.
- The published-quote picker still stores only the final effective slug; the admin schema does not yet preserve whether the slug came from picker selection or manual override as separate metadata.
- Product-template publish-copy editing is now surfaced near the top, but the remaining UI copy field groups are still split between the publish-copy panel and the lower visual editor rather than a full property-panel architecture.

### Next Step

1. Generalize the public-template library into an explicit template-family model so future brands are not hard-coded around only `vman` and `minerpower`.
2. Decide whether brand default-link source-of-truth needs structured metadata beyond `default_quote_slug`, such as picker source instance id vs manual override marker.
3. Continue collapsing lower visual-editor copy controls into a more explicit top-level property-panel workflow so publish-copy, rates, and section editing each have a clearer home.

## 2026-03-23 requirement intake update

### Latest milestone

- Quote System admin now includes a dedicated `需求获取单` page that sits between customer master data and quote instances.
- Requirement intake records can now bind to a customer first, collect mostly multiple-choice answers, and then generate a quote draft already linked to both `customer_id` and `requirement_id`.
- The first miner-oriented questionnaire pass now covers mainstream BTC miner brands, cooling mode, hashrate band, single-machine power band, quantity band, and site/power constraints.

### Effective behaviors

- Operators can open `报价系统 / 需求获取单` from the admin sidebar and work on requirement capture separately from quote editing.
- Requirement records are designed as light intake forms: most fields are select or multi-select, while free-text is limited to a short customer note and an internal note.
- The miner-brand preset currently includes:
  - `Bitmain / ANTMINER`
  - `MicroBT / WhatsMiner`
  - `Canaan / Avalon Miner`
  - `Bitdeer / SEALMINER`
  - `Auradine / Teraflux`
  - plus `其他 / 待确认`
- Creating a quote from a requirement now carries over the bound customer, requirement summary, and questionnaire notes into the quote draft before the operator continues in the real quote editor.

### Solved in this thread

- Added `article_management/sql/012_quote_requirement_intake.sql` for the new `quote_requirements` table and `quote_instances.requirement_id`.
- Added admin navigation and page rendering for `quote-requirements`.
- Added requirement save/load flow, requirement-to-quote generation flow, and quote linkage display inside admin.
- Added choice-grid styling so multi-select brand/cooling/certification inputs render as readable cards instead of raw checkbox rows.
- Bumped admin cache versions so the new requirement page, styles, and quote-system module load reliably after deployment.

### Unfinished

- The database migration still needs to be executed in Supabase before production admins can actually persist requirement records.
- Requirement intake is currently admin-only; there is not yet a customer-facing lightweight form or external intake link.
- Quote admin and quote runtime now understand `requirement_id`, but customer analytics and follow-up workflow are still centered on quotes rather than requirement stages.
- The miner questionnaire is still a first-pass schema; it does not yet branch into deeper product-specific question trees for air-cooled vs liquid-cooled miners or detailed electrical/site engineering intake.

### Next Step

1. Execute `article_management/sql/012_quote_requirement_intake.sql` in Supabase and verify admin create/save/generate flows with a real logged-in operator session.
2. Surface requirement linkage inside quote-instance management and customer pages so operators can jump between `客户 -> 需求单 -> 报价单` without relying only on the new requirement page.
3. Decide whether the next stage should be a customer-facing intake form, or a richer internal requirement workflow with stage ownership, follow-up date, and recommendation status.

## 2026-03-23 public requirement workflow update

### Latest milestone

- Requirement intake has been redefined from an admin-only worksheet into a customer-facing public-link flow.
- Added `quote/requirement.html` plus `shared/quote-system/quote-requirement.module.js` so each requirement can be opened as a unique public form URL.
- Added `article_management/sql/013_quote_requirement_public_flow.sql` to extend `quote_requirements` with public access fields, customer-side submission state, and anon-safe RPC entry points.

### Effective behaviors

- Admin requirement management now acts as the workflow shell:
  - bind customer
  - save requirement draft
  - copy or open the public requirement link
  - wait for customer submission
  - generate quote only after submission
- Public requirement links now use `req + token` instead of exposing the raw table directly.
- Customer submission is designed to lock the public form into read-only state once status reaches `submitted` or later.
- Requirement cards and editor metadata now surface:
  - public link state
  - requester company/contact fields
  - submitted timestamp
  - quote-generation readiness

### Solved in this thread

- Added admin-side requirement public-link controls and moved requirement-page messaging from “internal intake sheet” to “public link issuance + review”.
- Added customer-facing requirement page UI with mostly select / multi-select inputs for miner brand, cooling, hashrate, power, quantity, site constraints, and certifications.
- Restricted quote generation from requirements to submitted-or-later states so quotes are not spawned from unconfirmed demand.
- Added shared requirement-page styling to `shared/quote-system/quote-system.css` and bumped admin/static cache versions.

### Unfinished

- `013_quote_requirement_public_flow.sql` still needs to be executed in Supabase before the public form can read/write production data.
- Requirement versioning is still single-record-per-round; there is not yet a formal “change request / v2 requirement” model after submission.
- Public requirement intake is currently a single Chinese-first form; there is not yet a multilingual requirement runtime matching the quote viewer’s CN / EN / RU toggle model.

### Next Step

1. Execute `article_management/sql/013_quote_requirement_public_flow.sql` in Supabase.
2. Verify the live sequence end to end with a real admin session and a real public link:
   - customer master
   - requirement draft
   - public submission
   - admin review
   - quote draft generation
3. Decide whether submitted requirements should stay immutable forever, or whether the next round should create a follow-up requirement record/version instead of editing the same row.
