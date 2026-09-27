# GHOST_OS_DOCS Architecture

## GasGx 报价模块架构

- `shared/quote-system/quote-data.module.js` 是 section/item 规范化和默认模块顺序的单一来源。
- `shared/quote-system/quote-editor.module.js` 负责后台编辑器新增行、模块小计和多语言编辑态；`quote/editor.html` 只声明按钮和页面壳。
- `shared/quote-system/quote-runtime.module.js` 负责客户预览页的模块标题、选择状态、金额汇总和导出海报。
- `article_management/sql/042_quote_wear_parts_section.sql` 负责数据库约束及 G300 的易损件模块配置。
- 静态资源通过 `quote/public-asset-version.js` 统一版本化，避免浏览器继续使用旧 CSS/模块缓存。
