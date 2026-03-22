# GasGx 网站后台稳定决策

更新时间：2026-03-21

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
