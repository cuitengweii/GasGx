# GasGx 网站目录结构文档

更新时间：2026-02-08
根目录：`C:\Users\Administrator.DESKTOP-1OKFDHA\Desktop\GasGx`

## 1. 站点根目录（一级）

- `.github/`：仓库配置
- `.vscode/`：编辑器配置
- `.well-known/`：站点验证文件
- `about/`：关于页
- `ai/`：AI 相关页面
- `image/`：图片资源目录（当前未统计到文件）
- `news/`：新闻系统（含共享 header/footer）
- `openclaw/`：独立页面
- `private-use/`：私有页面
- `products/`：产品体系页面
- `rankings/`：排名体系页面
- `resources/`：资源中心页面
- `solutions/`：解决方案页面
- `support/`：支持页
- `test/`：测试页面
- `tools/`：工具页
- `use-cases/`：应用场景页
- 根文件：`index.html`、`404.html`、`sitemap.html`、`status.html`、`favicon.ico`、`.htaccess` 等

## 2. 主要栏目文件规模（递归文件数）

- `news/`：40
- `products/`：33
- `rankings/`：22
- `tools/`：26
- `resources/`：10
- `test/`：35
- 其余目录多为 1~8 个文件

## 3. News 子系统（重点）

```text
news/
├─ index.html                         # 新闻首页入口（模块化）
├─ data.html                          # 数据页（legacy shell 接入共享头尾）
├─ advertisement/                     # 广告素材
├─ article/                           # 文章素材/数据
├─ author_avatar/                     # 作者头像
├─ topic/
│  └─ index.html                      # Topic 页
├─ flash/
│  ├─ index.html                      # Flash 主入口（模块化）
│  ├─ account.html                    # 账号页（legacy shell）
│  ├─ user.html                       # 用户页（legacy shell）
│  ├─ index - 副本*.html              # 历史副本页（legacy shell）
│  └─ modules/
│     ├─ flash.bootstrap.js           # Flash 启动器
│     ├─ main.module.js               # Flash 主内容模块
│     └─ styles/
│        ├─ header.module.css
│        ├─ main.module.css
│        └─ footer.module.css
├─ modules/
│  ├─ news-home.bootstrap.js          # 首页启动器
│  ├─ main.module.js                  # 首页主内容模块
│  └─ styles/
│     ├─ header.module.css
│     ├─ main.module.css
│     └─ footer.module.css
├─ shared/
│  ├─ config/
│  │  └─ navigation.config.js         # 导航配置（一级+二级）
│  └─ modules/
│     ├─ layout.shared.js             # 共享 header/footer + 登录态渲染
│     ├─ legacy-shell.bootstrap.js    # 非模块老页面注入共享头尾
│     └─ styles/
│        └─ layout.shared.css         # 共享布局样式（防冲突命名）
└─ test/
   ├─ bitcoin_mining.html
   ├─ data.html
   ├─ events.html
   ├─ gas-energy.html
   ├─ generators.html
   ├─ insights.html
   └─ liebiao.html
```

## 4. 共享 Header/Footer 相关文件位置

- 共享逻辑：`news/shared/modules/layout.shared.js`
- 共享样式：`news/shared/modules/styles/layout.shared.css`
- 导航配置：`news/shared/config/navigation.config.js`
- 老页面桥接：`news/shared/modules/legacy-shell.bootstrap.js`
- 新闻首页启动器：`news/modules/news-home.bootstrap.js`
- Flash 启动器：`news/flash/modules/flash.bootstrap.js`

## 5. 页面接入说明（当前）

- 模块化入口页：通过各自 `bootstrap` 调用共享 header/footer。
- 老页面/副本页：通过 `legacy-shell.bootstrap.js` 自动挂载共享 header/footer。
- 导航维护：统一改 `news/shared/config/navigation.config.js`。

