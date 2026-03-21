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
