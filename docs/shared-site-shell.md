# GasGx 共享站点外壳说明

## 1. 适用范围
已从首页抽离并全站复用的模块：

- Header（桌面导航、移动菜单、语言切换、登录区）
- Footer（导航聚合、联系方式、社交入口）
- 回到顶部按钮
- 聊天机器人入口

## 2. 相关文件

- `shared/ui/site-shell.config.js`：全站导航与 Footer 配置源
- `shared/ui/site-shell.shared.css`：共享壳样式（作用域隔离）
- `shared/ui/site-shell.shared.js`：共享壳渲染与交互逻辑
- `shared/i18n/index.i18n.js`：首页字典模块（仅需要 `window.app.t()` 的页面加载）

## 3. 页面接入方式

在页面 `<head>` 引入共享样式：

```html
<link rel="stylesheet" href="/shared/ui/site-shell.shared.css">
```

在页面主体中放置挂载槽位：

```html
<div id="ggx-site-header-slot"></div>
<div id="ggx-site-footer-slot"></div>
<div id="ggx-back-to-top-slot"></div>
<div id="ggx-chatbot-slot"></div>
```

在 `</body>` 前引入脚本（先配置，后渲染）：

```html
<script src="/shared/ui/site-shell.config.js"></script>
<script src="/shared/ui/site-shell.shared.js"></script>
```

如页面需要首页字典翻译（`window.app.t()`），再加：

```html
<script src="/shared/i18n/index.i18n.js"></script>
```

## 4. 全站配置（`GASGX_SITE_SHELL_CONFIG`）

统一在 `shared/ui/site-shell.config.js` 维护导航、文案、Footer 行为。

示例：

```html
<script>
  window.GASGX_SITE_SHELL_CONFIG = {
    // 全站导航树（Header + Footer 共用）
    navigation: [/* ... */],

    // 共享文案（Header/ Footer 的固定文本）
    sharedText: {
      en: {
        tagline: "Natural Gas Power Mining Assistant",
        footerTagline: "Making natural gas power mining easier",
        authLogin: "Login",
        authLogout: "Logout",
        contactUs: "Contact Us",
        privacyPolicy: "Privacy Policy",
        languageEnglish: "English",
        languageChinese: "简体中文"
      },
      zh: {
        tagline: "天然气发电挖矿助手",
        footerTagline: "让天然气发电挖矿更简单",
        authLogin: "登录",
        authLogout: "退出",
        contactUs: "联系我们",
        privacyPolicy: "隐私政策",
        languageEnglish: "English",
        languageChinese: "简体中文"
      }
    },

    footer: {
      contact: {
        // mode: "link" 为跳转；mode: "qr" 为二维码弹层
        mode: "link",
        label: "www_gasgx_com",
        iconClass: "fa-brands fa-weixin",
        href: "https://www.gasgx.com/",
        target: "_blank",
        rel: "noopener noreferrer"
      },
      privacyPolicy: {
        href: "/about/app_privacy_policy.html",
        target: "_blank",
        rel: "noopener noreferrer"
      },
      // 社交入口：全站配置驱动（默认链接，不弹窗）
      socialLinks: [
        {
          id: "tiktok",
          enabled: true,                // false 则隐藏
          href: "https://www.tiktok.com/@your_account",
          iconClass: "fa-brands fa-tiktok",
          ariaLabel: "Open TikTok",
          target: "_blank",
          rel: "noopener noreferrer"
        },
        {
          id: "linkedin",
          enabled: true,
          href: "https://www.linkedin.com/company/your_company",
          iconClass: "fa-brands fa-linkedin",
          ariaLabel: "Open LinkedIn"
        },
        {
          id: "facebook",
          hidden: true,                 // 也可用 hidden/visible 控制显隐
          href: "https://www.facebook.com/your_page",
          iconClass: "fa-brands fa-facebook",
          ariaLabel: "Open Facebook"
        }
      ]
    }
  };
</script>
```

### 4.1 `navigation` 文案写法

- `string`：作为 i18n key，由页面翻译函数处理
- `object`：显式多语言对象，例如 `{ zh: "首页", en: "Home" }`

当前标准做法：导航使用 `{ zh, en }` 对象，减少页面侧依赖。

### 4.2 Footer 社交入口规则（当前）

- 默认走链接模式（不弹窗）
- 支持字段：
  - `enabled: true/false`
  - `visible: true/false`
  - `hidden: true/false`
  - `href`
  - `iconClass`
  - `ariaLabel`
  - `target` / `rel`
- 只要满足以下任一条件即隐藏：`enabled === false`、`visible === false`、`hidden === true`

## 5. 运行时可选配置（`GASGX_SHARED_CONFIG`）

该配置与导航表独立，用于功能开关：

```html
<script>
  window.GASGX_SHARED_CONFIG = {
    chatApiUrl: "http://localhost:8000/chat",
    chatbotEnabled: true,
    backToTopEnabled: true
  };
</script>
```

## 6. 页面接口约定

共享壳对以下对象采用“可选调用”（不存在不会报错）：

- `window.app`：
  - `setLanguage(lang)`
- `window.AuthApp`：
  - `signIn()`
  - `signOut()`
- `window.openQrModal(type)`：
  - 仅当配置中使用 `mode: "qr"` 时才会触发

## 7. 防冲突策略

- JS 命名空间：`window.GasGxSharedUI`
- 运行时配置命名空间：`window.GASGX_SHARED_CONFIG`
- 站点壳配置命名空间：`window.GASGX_SITE_SHELL_CONFIG`
- CSS 作用域限制：
  - `#ggx-site-header-slot ...`
  - `#ggx-site-footer-slot ...`
  - `#ggx-chatbot-slot ...`
- 聊天相关 DOM id 统一前缀：`ggx-chat-*`

## 8. 当前实现规则（重要）

- 全站导航以 `window.GASGX_SITE_SHELL_CONFIG.navigation` 为唯一源
- 共享渲染器直接填充：
  - `#desktop-nav`
  - `#mobile-nav-content`
  - `#footer-links`
- 语言切换由共享壳接管（`English / 简体中文`）
- 共享固定文案通过 `data-ggx-text` 渲染，不依赖页面内旧 `data-i18n`
- 若页面存在 `window.app.setLanguage`，共享壳会包装该方法，切换语言后重新应用共享导航与 Footer
- 页面遗留 `renderNav/renderMobileNav/renderFooter` 会被共享壳抑制，避免覆盖统一 Header/Footer

## 9. 目录覆盖范围

以下目录已统一接入共享壳：

- `about/`
- `products/`
- `rankings/`
- `support/`
- `resources/`
- `solutions/`
- `use-cases/`
- `tools/`
