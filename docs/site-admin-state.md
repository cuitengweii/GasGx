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

- Quote System V1 now exists as a working admin flow inside `article_management`.
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

### Solved in this thread

- Real quote-page editing replaced the previous fake "1:1 visual editor" direction.
- Spark translation was connected through Supabase and fixed for streamed WebSocket output.
- Large-template translation now runs in batches instead of one oversized request.
- Sitemap output now discovers `/news/account/`, `/tools/quote-system/`, and newly published article routes.

### Unfinished

- Translation glossary still needs a second pass for long technical row text.
- Some admin/editor status copy still contains legacy encoding noise.
- Sitemap generation still emits Playwright Vite routes under `node_modules`.

### Next Step

1. Polish EN / RU terminology for technical rows and repeated UI labels.
2. Clean the remaining encoding-corrupted status text in quote editor/admin modules.
3. Tighten `scripts/generate_sitemap.py` exclusions so internal toolchain routes never enter sitemap output.

### Auth email template sync helper

- A local auth-email template sync helper is now present:
  - `D:\code\GasGx\scripts\update_supabase_auth_email_templates.mjs`
- Local HTML sources for Supabase Auth mailers are now organized under:
  - `D:\code\GasGx\supabase\templates\`
- This path is currently an operator/developer sync tool, not yet an admin-UI feature.
