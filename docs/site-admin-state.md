# GasGx 网站后台状态

更新时间：2026-03-21
适用范围：`D:\code\GasGx`

## 当前状态

- 现有后台入口仍然是 `/article_management/index.html`，但定位已经从 News 内容后台升级为 GasGx 网站管理后台第一阶段。
- 后台左侧信息架构已经调整为 `Dashboard / Site / News`。
- `Site` 模块当前已经落地两个页面：
  - `主站导航`
  - `主站 Footer`
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
  - 已支持 `navigation / sharedText / footer` 统一读取
- `news/shared/modules/layout.shared.js`
  - News footer 已优先复用统一站点壳配置
  - 原 `feeder_form_options` 只作为兜底来源

### 3. 网站后台第一阶段 UI

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

### 4. 保存行为

- 站点壳管理模块不再依赖“统一保存”
- 当前规则：
  - 输入框：`blur` 时异步保存
  - 下拉 / checkbox：`change` 时异步保存
  - 新增 / 删除 / 排序 / 类型切换：立即异步保存
- 当前实现本质上是“每次操作都提交整份配置 JSON 到 `site_shell_configs`”

## 关键文件

- `D:\code\GasGx\article_management\modules\app.bootstrap.js`
- `D:\code\GasGx\article_management\modules\site-shell-admin.module.js`
- `D:\code\GasGx\article_management\modules\site-shell.module.js`
- `D:\code\GasGx\article_management\sql\004_site_shell_configs.sql`
- `D:\code\GasGx\shared\ui\site-shell.shared.js`
- `D:\code\GasGx\news\shared\modules\layout.shared.js`

## 未完成事项

- 站点后台目前只接管了共享壳（Header / Footer），还没有进入全站栏目、页面级配置管理
- 导航编辑器当前使用 `Up / Down` 排序，还没有拖拽排序
- 当前站点后台是单页应用内的分组语义，尚未拆成更细的多模块管理体系
- 若 Supabase 里尚未执行 `004_site_shell_configs.sql`，则编辑页只能依赖静态 fallback，发布态保存会失败

## Next Step

1. 在 Supabase 执行 `article_management/sql/004_site_shell_configs.sql`
2. 继续把 `Site` 模块扩展到更多主站级配置
3. 视需要把当前树形导航编辑器升级为“左侧树 + 右侧属性面板”
