# GasGx 网站后台状态

更新时间：2026-03-21
适用范围：`D:\code\GasGx`

## 当前状态

- 现有后台入口仍然是 `/article_management/index.html`，但定位已经从 News 内容后台升级为 GasGx 网站管理后台第一阶段。
- 后台左侧信息架构已经调整为 `Dashboard / Site / News`。
- `Site` 模块当前已经落地三个页面：
  - `主站配置`
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

- 站点后台虽然已经扩展到主站基础配置，并开始接入首页与 About 页面级配置，但还没有进入更多栏目页、专题页的页面级配置管理
- 导航编辑器当前使用 `Up / Down` 排序，还没有拖拽排序
- 当前站点后台是单页应用内的分组语义，尚未拆成更细的多模块管理体系
- `site_shell_configs` 建表脚本已执行；后续新增字段无需再改单独 SQL，只需保持 JSON schema 与前台消费同步

## Next Step

1. 继续把 `Site` 模块从首页 / About 页面级配置扩展到更多栏目页、专题页和模块页配置
2. 优先梳理哪些主站页面仍在各自 HTML / JS 中维护散落文案与 meta，再逐步收口到 `site_shell_configs`
3. 视需要把当前树形导航编辑器升级为“左侧树 + 右侧属性面板”
