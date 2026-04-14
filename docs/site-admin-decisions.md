# GasGx 网站后台稳定决策

更新时间：2026-03-23

## 决策 1：网站壳配置不复用其它通用配置表

- 正式使用专用表 `site_shell_configs`
- 不复用 `global_config`

原因：

- Header / Footer 站点壳属于全站共享发布态配置
- 需要单独控制结构、读写链路和回退策略
- 避免与其它无关配置混在一张表里

## 决策 2：站点壳配置读取优先级固定

运行时优先级固定为：

1. Supabase `site_shell_configs`
2. `/shared/ui/site-shell.config.js`
3. `shared/ui/site-shell.shared.js` 内置默认值

这条优先级同时适用于：

- 主站共享壳
- News footer 对统一站点壳配置的复用

## 决策 3：后台入口暂不更换 URL

- 第一阶段继续使用 `/article_management/index.html`
- 先升级语义与信息架构，不做入口迁移

当前后台语义：

- `Dashboard`
- `Site`
- `News`

## 决策 4：站点壳编辑改为异步逐项保存

- 不采用“全部改完再点统一保存”
- 每次字段操作都异步提交整份配置 JSON

当前策略：

- 输入框：`blur` 保存
- 下拉 / checkbox：`change` 保存
- 新增 / 删除 / 排序 / 类型切换：立即保存

## 决策 5：导航编辑器采用树形折叠结构

站点壳编辑器不再使用平铺长表单，而采用：

- 一级导航
- 二级菜单
- mega section
- mega item

统一的折叠树结构进行编辑。
## 2026-03-22 decisions

### Decision 6: Use the real quote page as the editor

- The quote system will not continue with a fake visual editor shell in admin.
- The real quote page DOM is now the editing surface for both product templates and quote instances.
- Admin remains the workflow shell for selection and management, but not the primary content editing surface.

### Decision 7: Chinese-first quote authoring with optional generated EN / RU

- Quote maintenance defaults to Chinese only.
- EN / RU are no longer required input fields during normal authoring.
- Missing EN / RU content falls back to Chinese until Spark-generated output or manual overrides are present.

### Decision 8: Spark translation runs through Supabase Edge Function

- Translation is mediated by `supabase/functions/quote-translate/index.ts`.
- Edge Function is deployed with `--no-verify-jwt` at the gateway layer because publishable-token browser calls were rejected with `401 Invalid JWT`.
- The function itself still performs admin-user verification via Supabase Auth + `admin_users`, so access control remains inside the function.

### Decision 9: Quote instances use soft archive, not hard delete

- Quote instances should be hidden from normal active workflow by setting `status = archived`, not physically deleted.
- Archiving must preserve the quote's published snapshot, customer linkage, and analytics history.
- Restoring an archived quote returns it to the last active business state recorded in `last_active_status`.

### Decision 10: Quote-to-customer relation uses master record plus per-quote snapshot

- Customer data is stored in `quote_customers` as the reusable master entity.
- Each quote instance also stores `customer_snapshot` so published/business history remains stable even if the customer master profile changes later.
- Quote runtime writes best-effort events into `quote_instance_events` for share generation, direct views, shared-link opens, passcode unlocks, admin previews, and email-trigger actions.

### Decision 11: Share recipient metadata lives on the quote, and share links carry a signed snapshot

- Default outbound-share metadata is stored in `quote_instances.share_config`, not as loose UI-only state.
- The quote editor maintains a structured set of fields for recipient name, recipient email, recipient company, follow-up notes, owner name, and owner email.
- When a share link is generated, the current share metadata is signed into the token payload so later `share_opened` and `passcode_unlocked` events can still be attributed even if the quote's default share settings change afterwards.

### Decision 12: Outbound-send workflow now uses `quote_instance_sends` as the primary operator ledger

- Outbound recipient-thread tracking now lives in `quote_instance_sends`, created by `011_quote_send_ledger.sql`.
- Runtime share-link generation and email-trigger actions insert or advance recipient-thread rows in that relational table.
- Customer/quote analytics pages read `quote_instance_sends` for operator-facing send traceability, while `quote_instance_events` remains the source of truth for public/open-side access events.

### Decision 13: Send-ledger rows can be operator-updated in place to accumulate attempts and outcomes

- The send ledger is no longer treated as strictly append-only for operator workflows.
- Runtime send actions still create or advance recipient-thread records automatically, but admin can now update a row's status, add outcome notes, and increment resend count from the quote detail page.
- These mutable workflow fields now live on relational send rows, so resend counts and operator outcomes are no longer blocked by quote-row JSON shape.

### Decision 14: `quote_instance_sends` is now the only send-ledger source of truth

- Runtime/admin now require `011_quote_send_ledger.sql` and no longer fall back to `share_config.send_history`.
- Quote/customer admin surfaces were simplified to read `quote_instance_sends` only; compatibility-mode hints and JSON backfill actions were removed.
- This decision was finalized after 2026-03-23 production verification found no remaining legacy JSON send-history rows to migrate.

## 2026-03-23 archive decisions

### Decision 15: Public quote starter templates come from live `vman` and `minerpower` product records

- New-brand bootstrap should reuse the real product-template data already maintained for `vman` and `minerpower`, not a separate hard-coded demo payload.
- `VMAN` is treated as the standalone generation-template family, and `MinerPower` is treated as the integrated miner-power template family.
- Copying from the public template library must clone editable product structure into the destination brand without carrying over the source brand identity.

### Decision 16: Brand default link needs a dedicated operator-facing editor

- `default_quote_slug` should not stay buried among lower-level brand fields because operators actively use it as a routing/output control.
- Brand management now treats the default link as a first-class editable field with its own visible panel.
- The field remains manually overrideable even if later UI layers provide auto-fill or picker behavior.

### Decision 17: Product-template save must not depend on hidden localized-title inputs

- Product-template persistence should not fail solely because `public_title` is empty while the operator has already provided a meaningful `product_code` or `slug`.
- Save flow now derives a fallback title from `product_code` first, then `slug`, before enforcing the "at least one product title" invariant.
- This keeps the data contract intact while removing a UI-only hidden-field blocker from template bootstrap flows.

### Decision 18: Requirement intake is a public customer link, not an admin-only worksheet

- The requirement object represents a customer-facing public submission step inside the quote pipeline.
- Admin creates and manages the link, but the primary answer collection should happen on a unique public URL sent to the customer.
- The admin requirement page therefore acts as workflow orchestration, not as the main operator-authored source of customer demand.

### Decision 19: Quotes can only be generated from submitted requirements

- Requirement rows in `draft` state are considered invitation / waiting-link state, not confirmed demand.
- Quote generation is allowed only once the requirement reaches `submitted` or later business states.
- This keeps downstream quote, follow-up, and publication activity anchored to one explicit customer-submitted demand baseline.

## 2026-03-25 sales customer-flow decisions

### Decision 20: Customer-flow business layout belongs to `quote-system.module.js`

- The customer-flow page should be structurally rendered by the feature module that owns the workflow, not by `sales.bootstrap.js`.
- `sales.bootstrap.js` may still control entry wiring or page-mode classes, but it should not delete side panels, relocate business buttons, or rebuild workflow sections after render.
- This was finalized after repeated regressions where the template already contained the right controls, but bootstrap-time DOM manipulation removed or displaced them in live pages.

### Decision 21: Execution-stage pages should share one shell/action/field rendering model

- `contract`, `deposit`, `production`, `factory_acceptance`, `balance`, `shipping`, `deployment`, and `support` should no longer hand-roll full card shells independently.
- The execution-stage family now follows one shared rendering model:
  - shared card shell
  - shared top action strip
  - shared field-grid helpers
  - shared textarea helper
- Stage-specific files should only provide stage copy and stage-specific field definitions, so later business tweaks do not require editing multiple duplicated layouts.

### Decision 22: Event-layer refactors should extract scoped binders before collapsing the root dispatcher

- For large sales workflow binders, the safe order is:
  1. extract scoped helpers with real bodies
  2. verify the helpers are stable
  3. replace the root binder with dispatch-only wiring
- This order reduces the risk of breaking the workflow in one large patch while still lowering complexity over time.

### Decision 23: Home page must provide a first-visit guided tour for core interactions

- `index.html` now treats first-time users as a required onboarding case, not an optional enhancement.
- The guide sequence is fixed to three core interactions:
  1. hotspot country markers
  2. main globe interaction area
  3. bottom total-score ranking drawer
- Auto-trigger rule:
  - show once for first visit (tracked by localStorage version key)
  - allow manual reopen via the floating `Guide / 新手引导` button
- Scope boundary:
  - onboarding is UI-only (mask/highlight/step card)
  - no business data, route, or API behavior changes are coupled into the guide flow
