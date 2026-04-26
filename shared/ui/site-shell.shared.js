(function () {
    "use strict";

    if (window.GasGxSharedUI && window.GasGxSharedUI.__initialized) {
        return;
    }

    const DEFAULT_CHAT_API_PATH = "/functions/v1/site-chat";
    const INITIAL_SITE_SHELL_CONFIG_TIMEOUT_MS = 5000;
    const SUPABASE_SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    const MAIN_AUTH_DEFAULTS = Object.freeze({
        storageKey: "gasgx-main-auth",
        signInUrl: "/account/user.html",
        accountUrl: "/account/account.html",
        salesUrl: "/account/account.html?tab=sales",
        signOutRedirectUrl: "/account/user.html",
        returnUrlStorageKey: "gx_main_return_url",
        supabaseUrl: "https://mkpcliytqudclkwtewru.supabase.co",
        supabaseKey: "sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw",
        telegramBotName: "gasgx_bot",
        telegramAuthUrl: "https://mkpcliytqudclkwtewru.supabase.co/functions/v1/auth-telegram",
        providerRollout: {
            twitter: false,
            linkedin: false,
            telegram: false
        }
    });
    const SITE_SHELL_CONFIG_TABLE = "site_shell_configs";
    const SITE_SHELL_CONFIG_SCOPE = "global";
    const BRAND_LOGO_STYLE_ELEMENT_ID = "ggx-brand-logo-style";
    const MAIN_AUTH_DEFAULT_AVATAR_KEY = "pixel-01";
    const MAIN_AUTH_AVATAR_PRESETS = Object.freeze({
        "pixel-01": { bg: "#0d1410", panel: "#213429", accent: "#5DD62C", eye: "#dfffd1" },
        "pixel-02": { bg: "#131126", panel: "#2a2450", accent: "#8a7bff", eye: "#e4dcff" },
        "pixel-03": { bg: "#101922", panel: "#1e3448", accent: "#45d6ff", eye: "#d0f7ff" },
        "pixel-04": { bg: "#18120b", panel: "#3e2a16", accent: "#ffb347", eye: "#ffe8bf" },
        "pixel-05": { bg: "#1c0f15", panel: "#4a1f34", accent: "#ff6fa8", eye: "#ffd6e8" },
        "pixel-06": { bg: "#0f1915", panel: "#204534", accent: "#46dd97", eye: "#cbffe8" },
        "pixel-07": { bg: "#151515", panel: "#2a2a2a", accent: "#f4f4f4", eye: "#ffffff" },
        "pixel-08": { bg: "#12160c", panel: "#33461f", accent: "#b9ff52", eye: "#eeffcf" },
        "pixel-09": { bg: "#16111a", panel: "#3b2550", accent: "#d77dff", eye: "#f3d9ff" },
        "pixel-10": { bg: "#11141d", panel: "#1f2b46", accent: "#7fa8ff", eye: "#dce8ff" }
    });
    const MAIN_AUTH_AVATAR_URI_MAP = {};
    function buildPixelAvatarDataUri(preset) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" shape-rendering="crispEdges"><rect width="64" height="64" rx="14" fill="${preset.bg}"/><rect x="14" y="12" width="36" height="32" fill="${preset.panel}"/><rect x="22" y="22" width="6" height="6" fill="${preset.eye}"/><rect x="36" y="22" width="6" height="6" fill="${preset.eye}"/><rect x="26" y="32" width="12" height="4" fill="${preset.accent}"/><rect x="18" y="46" width="28" height="10" fill="${preset.accent}" opacity="0.95"/></svg>`;
        return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }
    Object.keys(MAIN_AUTH_AVATAR_PRESETS).forEach((key) => {
        MAIN_AUTH_AVATAR_URI_MAP[key] = buildPixelAvatarDataUri(MAIN_AUTH_AVATAR_PRESETS[key]);
    });
    const MAIN_AUTH_FALLBACK_AVATAR = MAIN_AUTH_AVATAR_URI_MAP[MAIN_AUTH_DEFAULT_AVATAR_KEY];
    const COOKIE_CONSENT_STORAGE_KEY = "ggx_cookie_consent_v2";
    const COOKIE_CONSENT_COOKIE_NAME = "ggx_cookie_consent_v2";
    const COOKIE_CONSENT_BANNER_ID = "ggx-cookie-consent-banner";
    const COOKIE_CONSENT_MAX_AGE_SECONDS = 31536000;
    const COOKIE_PREFS_STORAGE_KEY = "ggx_cookie_preferences_v2";
    const COOKIE_PREFS_MODAL_ID = "ggx-cookie-prefs-modal";
    const COOKIE_CONSENT_DELAY_MS = 60 * 1000;
    const COOKIE_CONSENT_USAGE_STORAGE_KEY = "ggx_cookie_consent_usage_ms_v1";
    let cookieConsentDelayTimer = null;
    let cookieConsentUsageTrackingBound = false;
    let cookieConsentSessionStartTs = 0;
    let cookieConsentAccumulatedMs = null;
    let headerBrandFitScheduled = false;
    let headerBrandResizeBound = false;
    const SHARED_TEXT = {
        en: {
            tagline: "Natural Gas Power Mining Assistant",
            footerTagline: "Making natural gas power mining easier",
            strategicPartners: "Strategic Partners",
            authLogin: "Login",
            authLogout: "Logout",
            contactUs: "Contact Us",
            account: "Account",
            orders: "Orders",
            welcome: "Welcome,",
            privacyPolicy: "Privacy Policy",
            languageEnglish: "EN",
            languageChinese: "中文"
        },
        zh: {
            tagline: "天然气发电挖矿助手",
            footerTagline: "让天然气发电挖矿更简单",
            strategicPartners: "战略合作伙伴",
            authLogin: "登录",
            authLogout: "退出",
            contactUs: "联系我们",
            account: "账号",
            welcome: "欢迎，",
            privacyPolicy: "隐私政策",
            languageEnglish: "EN",
            languageChinese: "中文"
        }
    };

    const CLEAN_SHARED_TEXT = {
        en: {
            tagline: "Natural Gas Power Mining Assistant",
            footerTagline: "Making natural gas power mining easier",
            strategicPartners: "Strategic Partners",
            authLogin: "Login",
            authLogout: "Logout",
            contactUs: "Contact Us",
            account: "Account",
            orders: "Orders",
            welcome: "Welcome,",
            privacyPolicy: "Privacy Policy",
            languageEnglish: "EN",
            languageChinese: "中文"
        },
        zh: {
            tagline: "天然气发电挖矿助手",
            footerTagline: "让天然气发电挖矿更简单",
            strategicPartners: "战略合作伙伴",
            authLogin: "登录",
            authLogout: "退出",
            contactUs: "联系我们",
            account: "账户",
            orders: "订单",
            welcome: "欢迎，",
            privacyPolicy: "隐私政策",
            languageEnglish: "EN",
            languageChinese: "中文"
        }
    };

    const HEADER_TEMPLATE = `
<header class="fixed top-0 w-full z-[300] gas-card h-16 transition-all duration-300">
    <div class="max-w-[1800px] mx-auto px-4 h-full flex justify-between items-center relative">
        <div class="flex flex-col justify-center gap-0.5 w-auto shrink-0 mr-2 xl:mr-4 leading-none">
            <a id="ggx-header-home-link" href="/index.html" class="group">
                <h1 id="ggx-header-brand-text" class="text-xl md:text-2xl font-bold tracking-wider text-gas-green hover:text-white transition-colors cursor-pointer">GasGx</h1>
            </a>
            <span id="header-tagline" class="block text-gas-green text-[7px] sm:text-[8px] xl:text-[9px] font-bold tracking-wide leading-tight max-w-[330px] whitespace-normal break-words">Natural Gas Power Mining Assistant</span>
        </div>

        <nav id="desktop-nav" class="hidden xl:flex items-center justify-center gap-1 xl:gap-2 2xl:gap-6 h-full flex-1 min-w-0 px-1"></nav>

        <div class="flex items-center gap-2 xl:gap-4 w-auto shrink-0 justify-end ml-2 xl:ml-4">
            <div class="hidden xl:flex relative items-center">
                <button id="auth-login-btn" data-ggx-action="auth-sign-in" class="flex items-center gap-2 text-xs font-bold text-black bg-gas-green hover:bg-white transition-all rounded-full px-4 py-1.5 shadow-glow hover:shadow-glow-strong transform hover:scale-105 active:scale-95">
                    <i class="fa-brands fa-google"></i>
                    <span data-ggx-text="auth-login">Login</span>
                </button>
                <div id="auth-user-profile" class="hidden items-center gap-2 group relative h-full">
                    <a id="auth-account-link" href="/account/account.html" class="relative flex h-10 w-10 items-center justify-center rounded-full border border-transparent hover:border-gas-green/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gas-green/70 focus-visible:ring-offset-1 focus-visible:ring-offset-[#111]" aria-label="Open account">
                        <img id="auth-user-avatar" src="" alt="User" class="w-6 h-6 rounded-full border border-gas-green p-0 transition-transform group-hover:scale-105">
                        <div class="absolute bottom-1.5 right-1.5 w-2 h-2 bg-gas-green rounded-full border border-[#151515]"></div>
                    </a>
                </div>
            </div>

            <div id="ggx-lang-picker-wrap" class="hidden sm:flex items-center">
                <div id="ggx-lang-picker" class="ggx-lang-picker">
                    <button id="lang-menu-btn" data-ggx-action="toggle-lang-menu" class="ggx-lang-trigger" title="Language" aria-label="Language menu" aria-expanded="false" aria-haspopup="true">
                        <i class="fa-solid fa-globe"></i>
                    </button>
                    <div id="ggx-lang-dropdown" class="ggx-lang-dropdown hidden">
                        <button id="ggx-btn-lang-en" data-ggx-action="set-lang" data-ggx-lang="en" class="ggx-lang-option is-active">EN</button>
                        <button id="ggx-btn-lang-zh" data-ggx-action="set-lang" data-ggx-lang="zh" class="ggx-lang-option">中文</button>
                    </div>
                </div>
            </div>

            <a id="mob-header-auth-link" href="/account/user.html" class="xl:hidden flex items-center gap-2 text-[10px] font-bold text-black bg-gas-green hover:bg-white transition-all rounded-full px-3 py-1.5 shadow-glow max-w-[132px]" aria-label="Sign in">
                <i id="mob-header-auth-icon" class="fa-solid fa-right-to-bracket"></i>
                <span id="mob-header-auth-label" class="truncate" data-ggx-text="auth-login">Login</span>
            </a>

            <button id="mobile-menu-btn" data-ggx-action="toggle-mobile-menu" class="xl:hidden p-2 text-white hover:text-gas-green text-xl focus:outline-none z-50 relative" aria-label="Toggle mobile menu">
                <i class="fa-solid fa-bars"></i>
            </button>
        </div>
    </div>
</header>

<div id="mobile-menu-container" class="fixed inset-0 z-[250] bg-[#111] transform translate-x-full pt-20 px-4 pb-8 overflow-y-auto xl:hidden">
    <div id="ggx-mobile-lang-switch-wrap" class="flex justify-center mb-6 border-b border-white/10 pb-4">
        <div class="ggx-lang-switch ggx-lang-switch-mobile">
            <button id="ggx-mob-lang-en" data-ggx-action="set-lang" data-ggx-lang="en" class="ggx-lang-btn ggx-lang-btn-mobile text-gas-green font-semibold">EN</button>
            <span class="ggx-lang-sep">/</span>
            <button id="ggx-mob-lang-zh" data-ggx-action="set-lang" data-ggx-lang="zh" class="ggx-lang-btn ggx-lang-btn-mobile text-gray-400">CN</button>
        </div>
    </div>
    <div class="mb-6 border-b border-white/10 pb-4 flex justify-center">
         <button id="mob-auth-login-btn" data-ggx-action="auth-sign-in" class="w-full max-w-xs py-3 rounded-lg bg-gas-green text-black font-bold flex items-center justify-center gap-2 shadow-glow">
            <i class="fa-brands fa-google"></i>
            <span data-ggx-text="auth-login">Login</span>
        </button>
         <div id="mob-auth-user-profile" class="hidden flex flex-col gap-3 w-full max-w-xs px-2">
            <a id="mob-auth-account-link" href="/account/account.html" class="flex items-center gap-3 min-w-0">
                 <img id="mob-auth-user-avatar" src="" alt="User avatar" class="w-6 h-6 rounded-full border border-gas-green">
                 <div class="flex flex-col min-w-0">
                     <span data-ggx-text="welcome" class="text-xs text-gray-400">Welcome,</span>
                     <span id="mob-auth-username" class="text-sm text-white font-bold truncate">User</span>
                 </div>
            </a>
            <div class="flex items-center gap-2">
                <button data-ggx-action="auth-sign-out" class="shrink-0 whitespace-nowrap text-xs text-red-400 hover:text-red-300 border border-red-900/50 bg-red-900/20 px-3 py-1.5 rounded">
                    <span data-ggx-text="auth-logout">Logout</span>
                </button>
            </div>
         </div>
    </div>
    <nav id="mobile-nav-content" class="flex flex-col space-y-1"></nav>
</div>
<button id="mobile-menu-overlay" type="button" data-ggx-action="toggle-mobile-menu" class="xl:hidden" aria-label="Close mobile menu"></button>`;

    const DEFAULT_SITE_SHELL_CONFIG = {
        pages: {
            home: {
                meta: {
                    title: {
                        zh: "GasGx - 天然气发电挖矿",
                        en: "GasGx - Natural Gas Power Mining"
                    },
                    description: {
                        zh: "GasGx 提供全球天然气发电挖矿机会、政策状态与国家排名的总览。",
                        en: "GasGx provides a global view of natural gas-powered mining opportunities, policy status, and country rankings."
                    }
                },
                heroCard: {
                    label: {
                        zh: "分析范围",
                        en: "Analysis Scope"
                    },
                    value: "25+",
                    unit: {
                        zh: "国家",
                        en: "Countries"
                    }
                },
                map: {
                    loadingText: {
                        zh: "正在加载挖矿数据...",
                        en: "Loading Mining Data..."
                    },
                    rotateHint: {
                        zh: "拖拽旋转",
                        en: "Drag to Rotate"
                    }
                },
                ranking: {
                    title: {
                        zh: "全球天然气排行榜",
                        en: "Total Score Ranking"
                    },
                    legendLegal: {
                        zh: "合法 / 高分",
                        en: "Legal / High Score"
                    },
                    legendRestricted: {
                        zh: "受限",
                        en: "Restricted"
                    },
                    legendBanned: {
                        zh: "禁止",
                        en: "Banned"
                    }
                },
                capture: {
                    modalTitle: {
                        zh: "截图已生成！",
                        en: "Snapshot Generated!"
                    },
                    modalDescription: {
                        zh: "整页截图已成功生成。",
                        en: "Full page captured successfully."
                    },
                    closeLabel: {
                        zh: "关闭",
                        en: "Close"
                    },
                    qrSubtitle: {
                        zh: "扫码关注我们",
                        en: "Scan to follow us"
                    },
                    qrHint: {
                        zh: "长按或截图保存二维码。",
                        en: "Long press or screenshot to save the QR code."
                    },
                    watermarkTagline: {
                        zh: "天然气发电挖矿助手",
                        en: "Natural Gas Power Mining Assistant"
                    },
                    downloadFileName: "GasGx-Map-Capture.png"
                }
            },
            aboutCompany: {
                meta: {
                    title: {
                        zh: "About GasGx | 天然气发电算力行业研究平台",
                        en: "About GasGx | Natural Gas Power Mining Research Platform"
                    }
                },
                texts: {
                    zh: {},
                    en: {},
                    ru: {}
                },
                subscribe: {
                    emailPlaceholder: {
                        zh: "请输入您的邮箱",
                        en: "Enter your email",
                        ru: "Введите ваш email"
                    },
                    invalidEmail: {
                        zh: "请输入有效的邮箱地址",
                        en: "Please enter a valid email address",
                        ru: "Введите корректный email"
                    },
                    recipientEmail: "contact@gasgx.com",
                    subject: "GasGx 2026 行业白皮书"
                }
            },
            aboutContact: {
                meta: {
                    title: {
                        zh: "Contact GasGx | 联系我们",
                        en: "Contact GasGx | Get in Touch"
                    }
                },
                texts: {
                    zh: {},
                    en: {},
                    ru: {}
                },
                contactEmail: "contact@gasgx.com",
                socialLinks: [
                    { id: "wechat", enabled: true, mode: "qr", qrType: "wechat", iconClass: "fa-brands fa-weixin", ariaLabel: "Open WeChat QR" },
                    { id: "telegram", enabled: true, mode: "qr", qrType: "telegram", iconClass: "fa-brands fa-telegram", ariaLabel: "Open Telegram QR" },
                    { id: "twitter", enabled: true, mode: "qr", qrType: "twitter", iconClass: "fa-brands fa-x-twitter", ariaLabel: "Open Twitter QR" },
                    { id: "whatsapp", enabled: true, mode: "qr", qrType: "whatsapp", iconClass: "fa-brands fa-whatsapp", ariaLabel: "Open WhatsApp QR" }
                ]
            }
        },
        site: {
            brand: {
                name: "GasGx",
                homeHref: "/index.html",
                footerMeta: "Energy-compute infrastructure for mining operators.",
                copyright: "© 2026 GasGx. All rights reserved.",
                logoAnimationEnabled: true
            },
            features: {
                backToTopEnabled: true,
                languageSwitcherEnabled: true,
                languageOptions: {
                    en: true,
                    zh: true
                },
                chatbotEnabled: false,
                chatApiUrl: ""
            },
            mainAuth: {
                storageKey: MAIN_AUTH_DEFAULTS.storageKey,
                signInUrl: MAIN_AUTH_DEFAULTS.signInUrl,
                accountUrl: MAIN_AUTH_DEFAULTS.accountUrl,
                signOutRedirectUrl: MAIN_AUTH_DEFAULTS.signOutRedirectUrl,
                returnUrlStorageKey: MAIN_AUTH_DEFAULTS.returnUrlStorageKey,
                supabaseUrl: MAIN_AUTH_DEFAULTS.supabaseUrl,
                supabaseKey: MAIN_AUTH_DEFAULTS.supabaseKey,
                providerRollout: Object.assign({}, MAIN_AUTH_DEFAULTS.providerRollout)
            }
        },
        footer: {
            contact: {
                mode: "qr",
                label: "www_gasgx_com",
                iconClass: "fa-brands fa-weixin",
                qrType: "wechat"
            },
            privacyPolicy: {
                href: "/about/app_privacy_policy.html",
                target: "_blank",
                rel: "noopener noreferrer",
                i18nKey: "privacy_policy"
            },
            partners: [
                { id: "bitmain", title: "BITMAIN", href: "https://www.bitmain.com/" },
                { id: "bitlink", title: "BITLINK", href: "https://www.bitlinkpower.com/" },
                { id: "linkmine", title: "LINKMINE", href: "https://linkmine.cc/" },
                { id: "vman", title: "VMAN", href: "https://www.vman-engine.com/" }
            ],
            socialLinks: [
                { id: "x", enabled: true, mode: "link", href: "https://x.com/", iconClass: "fa-brands fa-x-twitter", ariaLabel: "Open X" },
                { id: "telegram", enabled: true, mode: "link", href: "https://t.me/", iconClass: "fa-brands fa-telegram", ariaLabel: "Open Telegram" },
                { id: "discord", enabled: true, mode: "link", href: "https://discord.com/", iconClass: "fa-brands fa-discord", ariaLabel: "Open Discord" },
                { id: "youtube", enabled: true, mode: "link", href: "https://www.youtube.com/", iconClass: "fa-brands fa-youtube", ariaLabel: "Open YouTube" },
                { id: "linkedin", enabled: true, mode: "link", href: "https://www.linkedin.com/", iconClass: "fa-brands fa-linkedin", ariaLabel: "Open LinkedIn" },
                { id: "facebook", enabled: true, mode: "link", href: "https://www.facebook.com/", iconClass: "fa-brands fa-facebook", ariaLabel: "Open Facebook" },
                { id: "tiktok", enabled: true, mode: "link", href: "https://www.tiktok.com/", iconClass: "fa-brands fa-tiktok", ariaLabel: "Open TikTok" },
                { id: "wechat", enabled: true, mode: "qr", qrType: "wechat", iconClass: "fa-brands fa-weixin", ariaLabel: "Open WeChat QR" },
                { id: "whatsapp", enabled: true, mode: "link", href: "https://wa.me/", iconClass: "fa-brands fa-whatsapp", ariaLabel: "Open WhatsApp" },
                { id: "instagram", enabled: true, mode: "link", href: "https://www.instagram.com/", iconClass: "fa-brands fa-instagram", ariaLabel: "Open Instagram" },
                { id: "xhs", enabled: true, mode: "link", href: "https://www.xiaohongshu.com/", text: "XHS", ariaLabel: "Open Xiaohongshu" },
                { id: "video", enabled: true, mode: "link", href: "/news/index.html", iconClass: "fa-solid fa-circle-play", ariaLabel: "Open Video Channel" }
            ]
        }
    };

    const CURRENT_SITE_SHELL_FALLBACK_CONFIG = {
        navigation: [
            { title: { en: "GasGx", zh: "\u9996\u9875" }, path: "/index.html", type: "link", icon: "fa-solid fa-house" },
            { title: { en: "News", zh: "\u65b0\u95fb" }, path: "/news/", type: "menu", icon: "fa-solid fa-newspaper" },
            { title: { en: "Digitalization", zh: "\u6570\u5b57\u5316" }, path: "/digitalization", type: "menu" },
            { title: { en: "Tools", zh: "\u5de5\u5177\u7bb1" }, path: "/tools", type: "mega" },
            { title: { en: "Rankings", zh: "\u6392\u884c\u699c" }, path: "/rankings", type: "mega" },
            { title: { en: "Products", zh: "\u673a\u578b\u5e93" }, path: "/products", type: "mega" },
            { title: { en: "Use Cases", zh: "\u5e94\u7528\u573a\u666f" }, path: "/use-cases", type: "mega" },
            { title: { en: "Resources", zh: "\u8d44\u6599\u4e2d\u5fc3" }, path: "/resources", type: "mega" },
            { title: { en: "Support", zh: "\u670d\u52a1\u652f\u6301" }, path: "/support", type: "menu" },
            { title: { en: "About Us", zh: "\u5173\u4e8e\u6211\u4eec" }, path: "/about", type: "menu" }
        ],
        sharedText: {
            en: {
                tagline: "The World's leading engine for monetizing stranded natural gas computing power",
                footerTagline: "Making stranded natural gas power generation easier",
                languageEnglish: "EN",
                languageChinese: "中文"
            },
            zh: {
                tagline: "\u5168\u7403\u9886\u5148\u7684\u6401\u6d45\u5929\u7136\u6c14\u7b97\u529b\u53d8\u73b0\u5f15\u64ce",
                footerTagline: "\u8ba9\u6401\u6d45\u5929\u7136\u6c14\u53d1\u7535\u66f4\u7b80\u5355",
                languageEnglish: "EN",
                languageChinese: "\u4e2d\u6587"
            }
        },
        site: {
            brand: {
                name: "GasGx",
                homeHref: "/index.html",
                footerMeta: "The World's leading engine for monetizing stranded natural gas computing power",
                copyright: "© 2026 GasGx. All rights reserved.",
                logoAnimationEnabled: false
            }
        }
    };

    const BACK_TO_TOP_TEMPLATE = `
<button id="backToTopBtn" class="fixed bottom-6 right-6 w-10 h-10 rounded-full border border-gas-green bg-gas-green/[0.08] text-white shadow-[0_10px_24px_rgba(0,0,0,0.22),0_0_0_1px_rgba(93,214,44,0.2)] flex items-center justify-center translate-y-20 opacity-0 transition-all duration-300 hover:scale-110 hover:opacity-100 z-[96] cursor-pointer select-none" aria-label="Back to top">
    <i class="fa-solid fa-arrow-up text-gas-green drop-shadow-[0_0_6px_rgba(93,214,44,0.45)]"></i>
</button>`;

    const CHATBOT_TEMPLATE = `
<div id="ggx-chat-wrapper" class="fixed bottom-44 right-5 z-[88] flex flex-col items-end font-sans font-inter">
    <div id="ggx-chat-window" class="hidden flex flex-col w-[320px] md:w-[368px] h-[560px] max-h-[82vh] bg-[#101214]/94 backdrop-blur-xl border border-gas-green/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.45),0_0_0_1px_rgba(93,214,44,0.08)] overflow-hidden transition-all duration-300 origin-bottom-right transform scale-95 opacity-0 mb-3">
        <div class="bg-[#0d0f10]/88 px-4 py-3.5 flex justify-between items-center border-b border-gas-green/10 z-10 shrink-0">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-[#141a16] border border-gas-green/45 flex items-center justify-center">
                    <i class="fa-solid fa-robot text-gas-green text-[13px]"></i>
                </div>
                <div>
                    <h3 class="text-white font-semibold text-sm tracking-wide">GasGx Assistant</h3>
                    <div class="flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 bg-gas-green/80 rounded-full"></span>
                        <span class="text-[10px] text-gray-400 uppercase font-medium">Online</span>
                    </div>
                </div>
            </div>
            <button id="ggx-chat-close-btn" class="w-8 h-8 rounded-full hover:bg-gas-green/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors" aria-label="Close chat window">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div id="ggx-chat-messages" class="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 bg-[#0c0e0f]/95 min-h-0 scroll-smooth">
            <div class="text-center mb-1.5">
                <span class="text-[9px] text-gray-600 bg-[#17191a] px-2 py-0.5 rounded-full">Today</span>
            </div>
            <div class="flex flex-col items-start max-w-[85%] space-y-1">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-[10px] text-gas-green/80 ml-1 tracking-[0.12em] uppercase">GasGx Assistant</span>
                </div>
                <div class="bg-[#151817] text-gray-100 px-3.5 py-2.5 rounded-2xl rounded-tl-none text-[13px] border border-gas-green/12 shadow-[0_10px_28px_rgba(0,0,0,0.24)] leading-6">
                    <div class="space-y-2.5">
                        <div class="rounded-2xl border border-gas-green/10 bg-[#111513] px-3 py-2.5 flex items-start gap-2.5">
                            <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gas-green/35 bg-gas-green/10 text-[11px] font-bold text-gas-green">1</span>
                            <div class="min-w-0 flex-1">Tell me your project scenario, target power and gas source.</div>
                        </div>
                        <div class="rounded-2xl border border-gas-green/10 bg-[#111513] px-3 py-2.5 flex items-start gap-2.5">
                            <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gas-green/35 bg-gas-green/10 text-[11px] font-bold text-gas-green">2</span>
                            <div class="min-w-0 flex-1">Ask about oilfield, mining, CHP, industrial power, quotations, delivery or support.</div>
                        </div>
                        <div class="rounded-2xl border border-gas-green/10 bg-[#111513] px-3 py-2.5 flex items-start gap-2.5">
                            <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gas-green/35 bg-gas-green/10 text-[11px] font-bold text-gas-green">3</span>
                            <div class="min-w-0 flex-1">If a website link is relevant, I will show it as a clickable link with a short explanation.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="ggx-chat-loading" class="hidden px-3.5 pb-2 bg-[#0c0e0f]/95 shrink-0">
            <div class="flex items-center gap-2 text-gas-green bg-[#161a18] w-fit px-3 py-1.5 rounded-full text-xs border border-gas-green/20">
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                <span>Thinking...</span>
            </div>
        </div>

        <div class="px-3.5 py-3 bg-[#0d0f10]/90 border-t border-gas-green/10 shrink-0">
            <div class="relative flex items-center gap-2">
                <input type="text" id="ggx-chat-user-input" class="flex-1 bg-[#17191b] border border-gas-green/15 rounded-full pl-4 pr-10 py-2.5 text-[13px] text-white focus:outline-none focus:border-gas-green/60 transition-all placeholder-gray-600" placeholder="Type a question..." autocomplete="off">
                <button id="ggx-chat-send-btn" class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#121915] border border-gas-green/40 rounded-full flex items-center justify-center text-gas-green hover:border-gas-green hover:bg-[#162019] transition-all cursor-pointer" aria-label="Send chat message">
                    <i class="fa-solid fa-paper-plane text-xs"></i>
                </button>
            </div>
            <div class="text-center mt-1.5">
                <p class="text-[9px] text-gray-600">AI Powered by GasGx Engine Database</p>
            </div>
        </div>
    </div>

    <div class="flex items-center gap-2">
        <button id="ggx-chat-dock-btn" class="w-8 h-8 rounded-full bg-[#0e1210]/88 border border-gas-green/15 text-gray-400 hover:text-white hover:border-gas-green/45 transition-colors flex items-center justify-center" aria-label="Hide chat to right side">
            <i class="fa-solid fa-angle-right text-xs"></i>
        </button>
        <button id="ggx-chat-toggle-btn" class="w-12 h-12 bg-[#0f1311]/88 border border-gas-green/35 rounded-full ggx-chat-attention flex items-center justify-center text-gas-green text-lg hover:border-gas-green hover:bg-[#121913] transition-all duration-300 group z-50 relative shadow-[0_10px_28px_rgba(0,0,0,0.45)]" aria-label="Open chat window">
            <i id="ggx-chat-toggle-icon" class="fa-solid fa-robot"></i>
            <span data-ggx-chat-unread class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gas-green rounded-full border border-[#0F0F0F]"></span>
        </button>
    </div>
    <button id="ggx-chat-undock-btn" class="hidden fixed right-0 bottom-44 h-12 w-7 rounded-l-full bg-[#0f1311]/90 border border-r-0 border-gas-green/35 text-gas-green hover:text-white hover:border-gas-green transition-colors flex items-center justify-center shadow-[0_10px_28px_rgba(0,0,0,0.45)]" aria-label="Show chat button">
        <i class="fa-solid fa-angle-left text-xs"></i>
    </button>
</div>`;

    const state = {
        mounted: false,
        actionBound: false,
        mountPromise: null
    };
    const authBridgeState = {
        initPromise: null,
        initialized: false,
        authListenerBound: false,
        currentUser: null,
        client: null,
        runtimeConfig: null
    };
    let publishedSiteShellPromise = null;

    function cloneSiteShellValue(value) {
        return JSON.parse(JSON.stringify(value || null));
    }

    const DEFAULT_NEWS_NAVIGATION_ITEM = {
        title: { zh: "新闻", en: "News" },
        path: "/news/",
        type: "menu",
        icon: "fa-solid fa-newspaper",
        children: [
            { title: { zh: "首页", en: "Home" }, path: "/news/" },
            { title: { zh: "快讯", en: "Flash" }, path: "/news/flash" },
            { title: { zh: "天然气能源", en: "Gas Energy" }, path: "/news/gas-energy" },
            { title: { zh: "发电机组", en: "Generators" }, path: "/news/generators" },
            { title: { zh: "挖矿", en: "Mining" }, path: "/news/mining" },
            { title: { zh: "洞察", en: "Insights" }, path: "/news/insights" },
            { title: { zh: "数据", en: "Data" }, path: "/news/data" },
            { title: { zh: "活动", en: "Events" }, path: "/news/events" }
        ]
    };

    function normalizeSiteShellNavPath(path) {
        const raw = typeof path === "string" ? path.trim().toLowerCase() : "";
        if (!raw) return "";
        return raw.replace(/\/+$/, "") || "/";
    }

    function isNewsNavigationItem(item) {
        const path = normalizeSiteShellNavPath(item && item.path);
        return path === "/news" || path === "/news/index.html";
    }

    function isNewsNavigationHomeItem(item) {
        const path = normalizeSiteShellNavPath(item && item.path);
        return path === "/news" || path === "/news/index.html";
    }

    function isUseCasesNavigationItem(item) {
        const path = normalizeSiteShellNavPath(item && item.path);
        return path === "/use-cases" || path === "/use-cases/index.html";
    }

    function normalizeUseCasesSeedGroupKey(value) {
        const safe = typeof value === "string" ? value.trim().toLowerCase() : "";
        if (safe === "application" || safe === "applications") return "application";
        if (safe === "solution" || safe === "solutions") return "solution";
        return "";
    }

    function createUseCasesSectionsFromChildren(children) {
        const safeChildren = Array.isArray(children) ? cloneSiteShellValue(children) : [];
        const grouped = {
            application: [],
            solution: []
        };

        safeChildren.forEach((child, index) => {
            const explicitGroup = normalizeUseCasesSeedGroupKey(child && (child.groupKey || child.group));
            const groupKey = explicitGroup || (index < 4 ? "application" : "solution");
            if (!grouped[groupKey]) grouped[groupKey] = [];
            grouped[groupKey].push({
                title: cloneSiteShellValue(child && child.title || {}),
                path: child && child.path ? child.path : "",
                visible: !child || child.visible !== false,
                target: child && child.target ? child.target : "",
                rel: child && child.rel ? child.rel : ""
            });
        });

        const sections = [];
        if (grouped.application.length) {
            sections.push({
                header: { zh: "应用场景", en: "Use Cases" },
                visible: true,
                items: grouped.application
            });
        }
        if (grouped.solution.length) {
            sections.push({
                header: { zh: "解决方案", en: "Solutions" },
                visible: true,
                items: grouped.solution
            });
        }
        return sections;
    }

    function ensureUseCasesNavigationItem(item, fallbackItem) {
        const base = fallbackItem && typeof fallbackItem === "object" ? cloneSiteShellValue(fallbackItem) : {};
        const source = item && typeof item === "object" ? cloneSiteShellValue(item) : {};

        let sections = [];
        if (Array.isArray(source.sections) && source.sections.length) {
            sections = cloneSiteShellValue(source.sections);
        } else if (Array.isArray(source.children) && source.children.length) {
            sections = createUseCasesSectionsFromChildren(source.children);
        } else if (Array.isArray(base.sections) && base.sections.length) {
            sections = cloneSiteShellValue(base.sections);
        } else if (Array.isArray(base.children) && base.children.length) {
            sections = createUseCasesSectionsFromChildren(base.children);
        }

        return Object.assign({}, base, source, {
            type: "mega",
            path: source && source.path ? source.path : (base && base.path ? base.path : "/use-cases"),
            gridCols: source && source.gridCols ? source.gridCols : (base && base.gridCols ? base.gridCols : "grid-cols-2"),
            title: Object.assign({}, base && base.title || {}, source && source.title || {}),
            sections: sections
        });
    }

    function ensureUseCasesNavigation(navigation, fallbackNavigation) {
        const working = Array.isArray(navigation) ? cloneSiteShellValue(navigation) : [];
        const fallbackList = Array.isArray(fallbackNavigation) ? cloneSiteShellValue(fallbackNavigation) : [];
        const fallbackUseCases = fallbackList.find((item) => isUseCasesNavigationItem(item));

        let found = false;
        const normalized = working.map((item) => {
            if (!isUseCasesNavigationItem(item)) return item;
            found = true;
            return ensureUseCasesNavigationItem(item, fallbackUseCases);
        });

        if (!found && fallbackUseCases) {
            normalized.push(ensureUseCasesNavigationItem(fallbackUseCases, fallbackUseCases));
        }

        return normalized;
    }

    function ensureNewsNavigationChildren(children, fallbackChildren) {
        const working = Array.isArray(children) ? cloneSiteShellValue(children) : [];
        const fallbackList = Array.isArray(fallbackChildren) ? cloneSiteShellValue(fallbackChildren) : [];
        const fallbackHome = fallbackList.find((item) => isNewsNavigationHomeItem(item));
        const defaultHome = cloneSiteShellValue(fallbackHome || DEFAULT_NEWS_NAVIGATION_ITEM.children[0]);
        const existingIndex = working.findIndex((item) => isNewsNavigationHomeItem(item));
        const existing = existingIndex >= 0 ? working.splice(existingIndex, 1)[0] : null;
        const mergedHome = Object.assign({}, defaultHome, existing || {}, {
            path: existing && existing.path ? existing.path : defaultHome.path,
            title: Object.assign({}, defaultHome.title || {}, existing && existing.title || {})
        });
        working.unshift(mergedHome);
        return working;
    }

    function ensureNewsNavigation(navigation, fallbackNavigation) {
        const working = Array.isArray(navigation) ? cloneSiteShellValue(navigation) : [];
        const fallbackList = Array.isArray(fallbackNavigation) ? cloneSiteShellValue(fallbackNavigation) : [];
        const fallbackNews = fallbackList.find((item) => isNewsNavigationItem(item));
        const defaultNews = cloneSiteShellValue(fallbackNews || DEFAULT_NEWS_NAVIGATION_ITEM);
        const existingIndex = working.findIndex((item) => isNewsNavigationItem(item));
        const existing = existingIndex >= 0 ? working.splice(existingIndex, 1)[0] : null;
        const mergedNews = Object.assign({}, defaultNews, existing || {}, {
            type: "menu",
            path: existing && existing.path ? existing.path : defaultNews.path,
            icon: existing && existing.icon ? existing.icon : defaultNews.icon,
            title: Object.assign({}, defaultNews.title || {}, existing && existing.title || {}),
            children: ensureNewsNavigationChildren(
                Array.isArray(existing && existing.children) && existing.children.length
                    ? existing.children
                    : defaultNews.children || [],
                defaultNews.children || []
            )
        });
        const insertIndex = working.length > 0 ? 1 : 0;
        working.splice(Math.min(insertIndex, working.length), 0, mergedNews);
        return working;
    }

    function isSiteShellVisible(item) {
        return !!item && item.visible !== false && item.hidden !== true;
    }

    function filterVisibleItems(items) {
        return Array.isArray(items) ? items.filter(isSiteShellVisible) : [];
    }

    function mergeLocalizedBlock(baseBlock, sourceBlock) {
        const base = baseBlock && typeof baseBlock === "object" ? baseBlock : {};
        const source = sourceBlock && typeof sourceBlock === "object" ? sourceBlock : {};
        function mergeLocaleValue(baseValue, sourceValue) {
            const baseIsObject = !!baseValue && typeof baseValue === "object";
            const sourceIsObject = !!sourceValue && typeof sourceValue === "object";
            if (baseIsObject || sourceIsObject) {
                return Object.assign({}, baseIsObject ? baseValue : {}, sourceIsObject ? sourceValue : {});
            }
            return sourceValue || baseValue || "";
        }
        return Object.assign({}, base, source, {
            en: mergeLocaleValue(base.en, source.en),
            zh: mergeLocaleValue(base.zh, source.zh),
            ru: mergeLocaleValue(base.ru, source.ru)
        });
    }

    function mergeSiteConfig(baseSite, sourceSite) {
        const base = baseSite && typeof baseSite === "object" ? cloneSiteShellValue(baseSite) : {};
        const source = sourceSite && typeof sourceSite === "object" ? sourceSite : {};
        return Object.assign({}, base, source, {
            brand: Object.assign({}, base.brand || {}, source.brand || {}),
            features: Object.assign({}, base.features || {}, source.features || {}),
            mainAuth: Object.assign({}, base.mainAuth || {}, source.mainAuth || {})
        });
    }

    function mergeHomePageConfig(baseHome, sourceHome) {
        const base = baseHome && typeof baseHome === "object" ? cloneSiteShellValue(baseHome) : {};
        const source = sourceHome && typeof sourceHome === "object" ? sourceHome : {};
        return Object.assign({}, base, source, {
            meta: Object.assign({}, base.meta || {}, source.meta || {}, {
                title: mergeLocalizedBlock(base.meta && base.meta.title, source.meta && source.meta.title),
                description: mergeLocalizedBlock(base.meta && base.meta.description, source.meta && source.meta.description)
            }),
            heroCard: Object.assign({}, base.heroCard || {}, source.heroCard || {}, {
                label: mergeLocalizedBlock(base.heroCard && base.heroCard.label, source.heroCard && source.heroCard.label),
                unit: mergeLocalizedBlock(base.heroCard && base.heroCard.unit, source.heroCard && source.heroCard.unit)
            }),
            map: Object.assign({}, base.map || {}, source.map || {}, {
                loadingText: mergeLocalizedBlock(base.map && base.map.loadingText, source.map && source.map.loadingText),
                rotateHint: mergeLocalizedBlock(base.map && base.map.rotateHint, source.map && source.map.rotateHint)
            }),
            ranking: Object.assign({}, base.ranking || {}, source.ranking || {}, {
                title: mergeLocalizedBlock(base.ranking && base.ranking.title, source.ranking && source.ranking.title),
                legendLegal: mergeLocalizedBlock(base.ranking && base.ranking.legendLegal, source.ranking && source.ranking.legendLegal),
                legendRestricted: mergeLocalizedBlock(base.ranking && base.ranking.legendRestricted, source.ranking && source.ranking.legendRestricted),
                legendBanned: mergeLocalizedBlock(base.ranking && base.ranking.legendBanned, source.ranking && source.ranking.legendBanned)
            }),
            capture: Object.assign({}, base.capture || {}, source.capture || {}, {
                modalTitle: mergeLocalizedBlock(base.capture && base.capture.modalTitle, source.capture && source.capture.modalTitle),
                modalDescription: mergeLocalizedBlock(base.capture && base.capture.modalDescription, source.capture && source.capture.modalDescription),
                closeLabel: mergeLocalizedBlock(base.capture && base.capture.closeLabel, source.capture && source.capture.closeLabel),
                qrSubtitle: mergeLocalizedBlock(base.capture && base.capture.qrSubtitle, source.capture && source.capture.qrSubtitle),
                qrHint: mergeLocalizedBlock(base.capture && base.capture.qrHint, source.capture && source.capture.qrHint),
                watermarkTagline: mergeLocalizedBlock(base.capture && base.capture.watermarkTagline, source.capture && source.capture.watermarkTagline)
            })
        });
    }

    function mergePagesConfig(basePages, sourcePages) {
        const base = basePages && typeof basePages === "object" ? cloneSiteShellValue(basePages) : {};
        const source = sourcePages && typeof sourcePages === "object" ? sourcePages : {};
        return Object.assign({}, base, source, {
            home: mergeHomePageConfig(base.home, source.home),
            aboutCompany: Object.assign({}, base.aboutCompany || {}, source.aboutCompany || {}, {
                meta: Object.assign({}, base.aboutCompany && base.aboutCompany.meta, source.aboutCompany && source.aboutCompany.meta, {
                    title: mergeLocalizedBlock(base.aboutCompany && base.aboutCompany.meta && base.aboutCompany.meta.title, source.aboutCompany && source.aboutCompany.meta && source.aboutCompany.meta.title)
                }),
                texts: {
                    zh: Object.assign({}, base.aboutCompany && base.aboutCompany.texts && base.aboutCompany.texts.zh || {}, source.aboutCompany && source.aboutCompany.texts && source.aboutCompany.texts.zh || {}),
                    en: Object.assign({}, base.aboutCompany && base.aboutCompany.texts && base.aboutCompany.texts.en || {}, source.aboutCompany && source.aboutCompany.texts && source.aboutCompany.texts.en || {}),
                    ru: Object.assign({}, base.aboutCompany && base.aboutCompany.texts && base.aboutCompany.texts.ru || {}, source.aboutCompany && source.aboutCompany.texts && source.aboutCompany.texts.ru || {})
                },
                subscribe: Object.assign({}, base.aboutCompany && base.aboutCompany.subscribe || {}, source.aboutCompany && source.aboutCompany.subscribe || {}, {
                    emailPlaceholder: mergeLocalizedBlock(base.aboutCompany && base.aboutCompany.subscribe && base.aboutCompany.subscribe.emailPlaceholder, source.aboutCompany && source.aboutCompany.subscribe && source.aboutCompany.subscribe.emailPlaceholder),
                    invalidEmail: mergeLocalizedBlock(base.aboutCompany && base.aboutCompany.subscribe && base.aboutCompany.subscribe.invalidEmail, source.aboutCompany && source.aboutCompany.subscribe && source.aboutCompany.subscribe.invalidEmail)
                })
            }),
            aboutContact: Object.assign({}, base.aboutContact || {}, source.aboutContact || {}, {
                meta: Object.assign({}, base.aboutContact && base.aboutContact.meta, source.aboutContact && source.aboutContact.meta, {
                    title: mergeLocalizedBlock(base.aboutContact && base.aboutContact.meta && base.aboutContact.meta.title, source.aboutContact && source.aboutContact.meta && source.aboutContact.meta.title)
                }),
                texts: {
                    zh: Object.assign({}, base.aboutContact && base.aboutContact.texts && base.aboutContact.texts.zh || {}, source.aboutContact && source.aboutContact.texts && source.aboutContact.texts.zh || {}),
                    en: Object.assign({}, base.aboutContact && base.aboutContact.texts && base.aboutContact.texts.en || {}, source.aboutContact && source.aboutContact.texts && source.aboutContact.texts.en || {}),
                    ru: Object.assign({}, base.aboutContact && base.aboutContact.texts && base.aboutContact.texts.ru || {}, source.aboutContact && source.aboutContact.texts && source.aboutContact.texts.ru || {})
                },
                socialLinks: Array.isArray(source.aboutContact && source.aboutContact.socialLinks)
                    ? source.aboutContact.socialLinks.slice()
                    : (Array.isArray(base.aboutContact && base.aboutContact.socialLinks) ? base.aboutContact.socialLinks.slice() : [])
            })
        });
    }

    function mergeSiteShellConfig(baseConfig, sourceConfig) {
        const base = baseConfig && typeof baseConfig === "object" ? cloneSiteShellValue(baseConfig) : {};
        const source = sourceConfig && typeof sourceConfig === "object" ? sourceConfig : {};
        const navigationWithNews = ensureNewsNavigation(
            Array.isArray(source.navigation) ? source.navigation : (Array.isArray(base.navigation) ? base.navigation : []),
            Array.isArray(base.navigation) ? base.navigation : []
        );
        const navigation = ensureUseCasesNavigation(
            navigationWithNews,
            Array.isArray(base.navigation) ? base.navigation : []
        );
        return Object.assign({}, base, source, {
            navigation: navigation,
            sharedText: mergeLocalizedBlock(base.sharedText, source.sharedText),
            pages: mergePagesConfig(base.pages, source.pages),
            site: mergeSiteConfig(base.site, source.site),
            footer: Object.assign({}, base.footer || {}, source.footer || {})
        });
    }

    function applySiteShellConfig(config) {
        if (!config || typeof config !== "object") return;
        window.GASGX_SITE_SHELL_CONFIG = Object.assign(
            mergeSiteShellConfig(getSiteShellBaseConfig(), config),
            { __ggxPublishedSiteShellConfig: true }
        );
    }

    function getSiteShellBaseConfig() {
        return mergeSiteShellConfig(DEFAULT_SITE_SHELL_CONFIG, CURRENT_SITE_SHELL_FALLBACK_CONFIG);
    }

    function getSiteShellConfig() {
        const config = window.GASGX_SITE_SHELL_CONFIG;
        if (config && typeof config === "object") {
            if (config.__ggxPublishedSiteShellConfig) {
                return mergeSiteShellConfig(getSiteShellBaseConfig(), config);
            }
            const pageLocalConfig = mergeSiteShellConfig(DEFAULT_SITE_SHELL_CONFIG, config);
            return mergeSiteShellConfig(pageLocalConfig, CURRENT_SITE_SHELL_FALLBACK_CONFIG);
        }
        return getSiteShellBaseConfig();
    }

    function getSiteBrandConfig() {
        const siteShellConfig = getSiteShellConfig();
        const siteConfig = siteShellConfig && typeof siteShellConfig.site === "object"
            ? siteShellConfig.site
            : {};
        const brandConfig = siteConfig && typeof siteConfig.brand === "object"
            ? siteConfig.brand
            : {};
        return Object.assign({}, DEFAULT_SITE_SHELL_CONFIG.site.brand, brandConfig);
    }

    function getSharedRuntimeConfig() {
        const runtimeConfig = window.GASGX_SHARED_CONFIG || {};
        const siteShellConfig = getSiteShellConfig();
        const siteConfig = siteShellConfig && typeof siteShellConfig.site === "object"
            ? siteShellConfig.site
            : {};
        const featureConfig = siteConfig && typeof siteConfig.features === "object"
            ? siteConfig.features
            : {};
        const languageOptionsConfig = featureConfig && typeof featureConfig.languageOptions === "object"
            ? featureConfig.languageOptions
            : {};
        const mainAuthConfig = siteConfig && typeof siteConfig.mainAuth === "object"
            ? siteConfig.mainAuth
            : {};

        return Object.assign({}, runtimeConfig, {
            backToTopEnabled: typeof featureConfig.backToTopEnabled === "boolean" ? featureConfig.backToTopEnabled : runtimeConfig.backToTopEnabled,
            languageSwitcherEnabled: typeof featureConfig.languageSwitcherEnabled === "boolean"
                ? featureConfig.languageSwitcherEnabled
                : (typeof runtimeConfig.languageSwitcherEnabled === "boolean" ? runtimeConfig.languageSwitcherEnabled : true),
            languageOptions: {
                en: typeof languageOptionsConfig.en === "boolean" ? languageOptionsConfig.en : true,
                zh: typeof languageOptionsConfig.zh === "boolean" ? languageOptionsConfig.zh : true
            },
            chatbotEnabled: typeof featureConfig.chatbotEnabled === "boolean" ? featureConfig.chatbotEnabled : runtimeConfig.chatbotEnabled,
            chatApiUrl: typeof featureConfig.chatApiUrl === "string" && featureConfig.chatApiUrl.trim()
                ? featureConfig.chatApiUrl.trim()
                : runtimeConfig.chatApiUrl,
            mainAuth: Object.assign({}, runtimeConfig.mainAuth || {}, mainAuthConfig)
        });
    }

    function getAllowedLanguages() {
        const runtimeConfig = getSharedRuntimeConfig();
        const options = runtimeConfig && typeof runtimeConfig.languageOptions === "object"
            ? runtimeConfig.languageOptions
            : {};
        const allowEn = options.en !== false;
        const allowZh = options.zh !== false;
        if (!allowEn && !allowZh) {
            return ["en"];
        }
        return [allowEn ? "en" : null, allowZh ? "zh" : null].filter(Boolean);
    }

    function getConfiguredLanguages() {
        const runtimeConfig = getSharedRuntimeConfig();
        const options = runtimeConfig && typeof runtimeConfig.languageOptions === "object"
            ? runtimeConfig.languageOptions
            : {};
        const allowEn = options.en !== false;
        const allowZh = options.zh !== false;
        return [allowEn ? "en" : null, allowZh ? "zh" : null].filter(Boolean);
    }

    function setElementVisible(element, visible) {
        if (!element) return;
        element.style.display = visible ? "" : "none";
    }

    function fetchPublishedSiteShellConfig() {
        if (typeof window === "undefined" || typeof fetch !== "function") {
            return Promise.resolve(null);
        }
        if (publishedSiteShellPromise) return publishedSiteShellPromise;

        const authConfig = getMainAuthConfig();
        const query = new URLSearchParams({
            select: "config",
            scope: `eq.${SITE_SHELL_CONFIG_SCOPE}`,
            limit: "1"
        });

        publishedSiteShellPromise = fetch(`${authConfig.supabaseUrl}/rest/v1/${SITE_SHELL_CONFIG_TABLE}?${query.toString()}`, {
            cache: "no-store",
            headers: {
                apikey: authConfig.supabaseKey,
                Authorization: `Bearer ${authConfig.supabaseKey}`
            }
        })
            .then((response) => (response.ok ? response.json() : []))
            .then((rows) => {
                const firstRow = Array.isArray(rows) ? rows[0] : null;
                const config = firstRow && firstRow.config && typeof firstRow.config === "object" ? firstRow.config : null;
                if (!config) publishedSiteShellPromise = null;
                return config;
            })
            .catch(() => {
                publishedSiteShellPromise = null;
                return null;
            });

        return publishedSiteShellPromise;
    }

    function syncSiteBrandUI() {
        const brand = getSiteBrandConfig();
        applyBrandLogoCss(brand);
        const headerLink = document.getElementById("ggx-header-home-link");
        if (headerLink && typeof brand.homeHref === "string" && brand.homeHref.trim()) {
            headerLink.setAttribute("href", brand.homeHref.trim());
        }

        const headerBrand = document.getElementById("ggx-header-brand-text");
        if (headerBrand) {
            const customLogoHtml = getBrandLogoHtml(brand);
            if (customLogoHtml) {
                headerBrand.classList.add("ggx-header-brand-custom");
                headerBrand.innerHTML = `<span class="ggx-brand-logo-fit ggx-brand-logo-fit-header">${customLogoHtml}</span>`;
                scheduleHeaderBrandFit();
            } else if (typeof brand.name === "string" && brand.name.trim()) {
                headerBrand.classList.remove("ggx-header-brand-custom");
                headerBrand.textContent = brand.name.trim();
            }
        }
    }

    function fitHeaderBrandLogo() {
        if (typeof document === "undefined") return;
        const headerBrand = document.getElementById("ggx-header-brand-text");
        if (!headerBrand || !headerBrand.classList.contains("ggx-header-brand-custom")) return;
        const fitWrapper = headerBrand.querySelector(".ggx-brand-logo-fit-header");
        const logo = fitWrapper && fitWrapper.querySelector(".gasgx-logo");
        if (!fitWrapper || !logo) return;

        fitWrapper.style.width = "";
        fitWrapper.style.height = "";
        logo.style.transform = "";
        logo.style.transformOrigin = "left center";

        const rect = logo.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const maxWidth = 165;
        const maxHeight = 28;
        const scale = Math.min(1, maxWidth / rect.width, maxHeight / rect.height);
        const scaledWidth = Math.max(1, Math.round(rect.width * scale));
        const scaledHeight = Math.max(1, Math.round(rect.height * scale));

        logo.style.transform = `scale(${scale})`;
        fitWrapper.style.width = `${scaledWidth}px`;
        fitWrapper.style.height = `${scaledHeight}px`;
    }

    function scheduleHeaderBrandFit() {
        if (typeof window === "undefined") return;
        if (!headerBrandResizeBound) {
            window.addEventListener("resize", fitHeaderBrandLogo);
            headerBrandResizeBound = true;
        }
        if (headerBrandFitScheduled) return;
        headerBrandFitScheduled = true;
        window.requestAnimationFrame(() => {
            headerBrandFitScheduled = false;
            fitHeaderBrandLogo();
            if (document.fonts && typeof document.fonts.ready?.then === "function") {
                document.fonts.ready.then(() => {
                    fitHeaderBrandLogo();
                }).catch(() => {});
            }
        });
    }

    function getBrandLogoHtml(brand) {
        if (!brand || typeof brand.logoHtml !== "string") return "";
        return brand.logoHtml.trim();
    }

    function getBrandLogoCss(brand) {
        if (!brand || typeof brand.logoCss !== "string") return "";
        return brand.logoCss.trim();
    }

    function isBrandLogoAnimationEnabled(brand) {
        if (!brand || typeof brand.logoAnimationEnabled !== "boolean") return true;
        return brand.logoAnimationEnabled;
    }

    function applyBrandLogoCss(brand) {
        if (typeof document === "undefined") return;
        const cssText = getBrandLogoCss(brand);
        const animationOverride = isBrandLogoAnimationEnabled(brand)
            ? ""
            : `
#ggx-site-header-slot .ggx-brand-logo-fit .t-gas,
#ggx-site-header-slot .ggx-brand-logo-fit .t-gx,
#ggx-site-footer-slot .ggx-brand-logo-fit .t-gas,
#ggx-site-footer-slot .ggx-brand-logo-fit .t-gx {
    animation: none !important;
    transform: none !important;
    text-shadow: none !important;
    opacity: 1 !important;
}
`;
        let styleElement = document.getElementById(BRAND_LOGO_STYLE_ELEMENT_ID);
        if (!cssText && !animationOverride) {
            if (styleElement && styleElement.parentNode) {
                styleElement.parentNode.removeChild(styleElement);
            }
            return;
        }
        if (!styleElement) {
            styleElement = document.createElement("style");
            styleElement.id = BRAND_LOGO_STYLE_ELEMENT_ID;
            document.head.appendChild(styleElement);
        }
        styleElement.textContent = `${cssText}\n${animationOverride}`.trim();
    }

    function buildBrandAnchorHtml(brandConfig, anchorClassName, fallbackText, extraAttrs) {
        const href = escapeHtml(normalizePath(brandConfig.homeHref || "/index.html"));
        const className = escapeHtml(anchorClassName || "");
        const attrs = extraAttrs ? ` ${extraAttrs}` : "";
        const customLogoHtml = getBrandLogoHtml(brandConfig);
        if (customLogoHtml) {
            return `<a href="${href}" class="${className} ggx-brand-custom-link"${attrs}><span class="ggx-brand-logo-fit">${customLogoHtml}</span></a>`;
        }
        return `<a href="${href}" class="${className}"${attrs}>${escapeHtml(fallbackText || "GasGx")}</a>`;
    }

    function syncRuntimeFeatureSlots() {
        const runtimeConfig = getSharedRuntimeConfig();

        if (runtimeConfig.backToTopEnabled !== false) {
            ensureSlot("ggx-back-to-top-slot");
            mountSlot("ggx-back-to-top-slot", BACK_TO_TOP_TEMPLATE);
            initBackToTop();
        } else {
            mountSlot("ggx-back-to-top-slot", "");
        }

        if (runtimeConfig.chatbotEnabled === true) {
            ensureSlot("ggx-chatbot-slot");
            mountSlot("ggx-chatbot-slot", CHATBOT_TEMPLATE);
            initChatbot();
        } else {
            mountSlot("ggx-chatbot-slot", "");
        }
    }

    function syncLanguageSwitcherVisibility() {
        const runtimeConfig = getSharedRuntimeConfig();
        const enabled = runtimeConfig.languageSwitcherEnabled !== false;
        const configuredLanguages = getConfiguredLanguages();
        const hasConfiguredLanguage = configuredLanguages.length > 0;
        const allowedLanguages = getAllowedLanguages();
        const allowEn = allowedLanguages.indexOf("en") >= 0;
        const allowZh = allowedLanguages.indexOf("zh") >= 0;
        const desktopWrap = document.getElementById("ggx-lang-picker-wrap");
        const mobileWrap = document.getElementById("ggx-mobile-lang-switch-wrap");
        const desktopEn = document.getElementById("ggx-btn-lang-en");
        const desktopZh = document.getElementById("ggx-btn-lang-zh");
        const mobileEn = document.getElementById("ggx-mob-lang-en");
        const mobileZh = document.getElementById("ggx-mob-lang-zh");
        const mobileSep = document.querySelector("#ggx-mobile-lang-switch-wrap .ggx-lang-sep");
        setElementVisible(desktopEn, allowEn);
        setElementVisible(desktopZh, allowZh);
        setElementVisible(mobileEn, allowEn);
        setElementVisible(mobileZh, allowZh);
        setElementVisible(mobileSep, allowEn && allowZh);
        setElementVisible(desktopWrap, enabled && hasConfiguredLanguage);
        setElementVisible(mobileWrap, enabled && hasConfiguredLanguage);
        if (!enabled || !hasConfiguredLanguage) {
            closeLangMenu();
        }
        if (enabled && hasConfiguredLanguage) {
            const currentLang = getCurrentLang();
            if (allowedLanguages.indexOf(currentLang) < 0) {
                setLanguageFromShell(allowedLanguages[0] || "en");
            }
        }
    }

    function refreshShellStructure() {
        syncSiteBrandUI();
        mountSlot("ggx-site-footer-slot", buildFooterTemplate());
        syncRuntimeFeatureSlots();
        refreshShellNavigation(true);
        syncLanguageSwitcherVisibility();
        syncLanguageUI(getCurrentLang());
    }

    function syncPublishedSiteShellConfig() {
        return fetchPublishedSiteShellConfig().then((config) => {
            if (!config) return null;
            applySiteShellConfig(config);
            if (state.mounted) {
                refreshShellStructure();
            }
            document.dispatchEvent(new CustomEvent("gasgx:site-shell-config-updated"));
            return config;
        });
    }

    function applyInitialPublishedSiteShellConfig() {
        const timeout = new Promise((resolve) => {
            window.setTimeout(() => resolve(null), INITIAL_SITE_SHELL_CONFIG_TIMEOUT_MS);
        });

        return Promise.race([fetchPublishedSiteShellConfig(), timeout])
            .then((config) => {
                if (config) applySiteShellConfig(config);
                return config;
            })
            .catch(() => null);
    }

    function getFooterConfig() {
        const siteShellConfig = getSiteShellConfig();
        const sourceFooter = siteShellConfig.footer && typeof siteShellConfig.footer === "object"
            ? siteShellConfig.footer
            : {};
        const defaultFooter = DEFAULT_SITE_SHELL_CONFIG.footer;
        const defaultSocialLinks = Array.isArray(defaultFooter.socialLinks)
            ? defaultFooter.socialLinks
            : [];
        const defaultPartners = Array.isArray(defaultFooter.partners)
            ? defaultFooter.partners
            : [];
        const sourceSocialLinks = Array.isArray(sourceFooter.socialLinks)
            ? sourceFooter.socialLinks
            : [];
        const partners = Array.isArray(sourceFooter.partners) && sourceFooter.partners.length
            ? sourceFooter.partners.filter((item) => item && typeof item === "object")
            : defaultPartners.filter((item) => item && typeof item === "object");
        const rawSocialLinks = sourceSocialLinks.length ? sourceSocialLinks : defaultSocialLinks;
        const socialLinks = rawSocialLinks
            .filter((item) => item && typeof item === "object")
            .map((item) => {
                const itemId = typeof item.id === "string" ? item.id.trim().toLowerCase() : "";
                const fallback = itemId
                    ? (defaultSocialLinks.find((entry) => entry && String(entry.id || "").toLowerCase() === itemId) || {})
                    : {};
                return Object.assign(
                    {
                        enabled: true,
                        visible: true,
                        mode: "link",
                        href: "",
                        target: "_blank",
                        rel: "noopener noreferrer"
                    },
                    fallback,
                    item
                );
            });

        return {
            visible: sourceFooter.visible !== false,
            socialEnabled: sourceFooter.socialEnabled !== false,
            contact: Object.assign({}, defaultFooter.contact, sourceFooter.contact || {}),
            privacyPolicy: Object.assign({}, defaultFooter.privacyPolicy, sourceFooter.privacyPolicy || {}),
            partners: partners,
            socialLinks: socialLinks
        };
    }

    function getNavigationConfig() {
        const siteShellConfig = getSiteShellConfig();
        if (!Array.isArray(siteShellConfig.navigation)) {
            return [];
        }
        return filterVisibleItems(siteShellConfig.navigation);
    }

    function normalizePath(path) {
        const raw = typeof path === "string" ? path.trim() : "";
        if (!raw) return "#";
        if (/^(https?:|mailto:|tel:|#)/i.test(raw)) return raw;
        if (raw.startsWith("/")) return raw;
        return "/" + raw.replace(/^\/+/, "");
    }

    function normalizeLang(lang) {
        const value = String(lang || "").toLowerCase();
        if (value.startsWith("zh")) return "zh";
        if (value.startsWith("ru")) return "ru";
        return "en";
    }

    function readStoredLang() {
        try {
            const fromPrimary = window.localStorage.getItem("gasgx-lang");
            if (fromPrimary) return fromPrimary;
            return window.localStorage.getItem("gas_lang");
        } catch (error) {
            return null;
        }
    }

    function persistLang(lang) {
        try {
            window.localStorage.setItem("gasgx-lang", lang);
            window.localStorage.setItem("gas_lang", lang);
        } catch (error) {
            // Ignore storage failures in restricted environments.
        }
    }

    function getCurrentLang() {
        const stored = readStoredLang();
        if (stored) return normalizeLang(stored);

        const htmlLang = document.documentElement && document.documentElement.lang;
        if (htmlLang) return normalizeLang(htmlLang);

        const app = window.app;
        const appLang = app && (app.currentLang || app.lang);
        return normalizeLang(appLang || "en");
    }

    function getSharedText(langCandidate) {
        const lang = normalizeLang(langCandidate || "en");
        const siteShellConfig = getSiteShellConfig();
        const sharedTextConfig = siteShellConfig && typeof siteShellConfig.sharedText === "object"
            ? siteShellConfig.sharedText
            : {};
        const langOverride = sharedTextConfig && typeof sharedTextConfig[lang] === "object"
            ? sharedTextConfig[lang]
            : {};

        return Object.assign(
            {},
            CLEAN_SHARED_TEXT.en,
            CLEAN_SHARED_TEXT[lang] || CLEAN_SHARED_TEXT.en,
            langOverride
        );
    }

    function setSharedTextByKey(key, value) {
        if (typeof value !== "string" || !value.trim()) return;
        document.querySelectorAll(`[data-ggx-text="${key}"]`).forEach((el) => {
            el.textContent = value;
        });
    }

    function applySharedText(langCandidate) {
        const lang = normalizeLang(langCandidate || getCurrentLang());
        const text = getSharedText(lang);

        const headerTagline = document.getElementById("header-tagline");
        if (headerTagline && typeof text.tagline === "string") {
            headerTagline.textContent = text.tagline;
        }

        setSharedTextByKey("footer-tagline", text.footerTagline);
        setSharedTextByKey("strategic-partners", text.strategicPartners || (lang === "zh" ? "战略合作伙伴" : "Strategic Partners"));
        setSharedTextByKey("auth-login", text.authLogin);
        setSharedTextByKey("auth-logout", text.authLogout);
        setSharedTextByKey("contact-us", text.contactUs);
        setSharedTextByKey("account", text.account);
        setSharedTextByKey("orders", text.orders || (lang === "zh" ? "订单" : "Orders"));
        setSharedTextByKey("welcome", text.welcome);
        setSharedTextByKey("privacy-policy", text.privacyPolicy);

        const desktopLangEn = document.getElementById("ggx-btn-lang-en");
        if (desktopLangEn) {
            desktopLangEn.textContent = "EN";
        }

        const desktopLangZh = document.getElementById("ggx-btn-lang-zh");
        if (desktopLangZh) {
            desktopLangZh.textContent = "中文";
        }

        document.querySelectorAll("#ggx-site-footer-slot .ggx-partner-label").forEach((el) => {
            el.textContent = text.strategicPartners || (lang === "zh" ? "战略合作伙伴" : "Strategic Partners");
        });
    }

    function getLabelValue(label, lang) {
        if (label && typeof label === "object" && !Array.isArray(label)) {
            const exact = label[lang];
            if (typeof exact === "string" && exact.trim()) return exact.trim();
            const fallback = label.en || label.zh;
            if (typeof fallback === "string" && fallback.trim()) return fallback.trim();
            const first = Object.values(label).find((value) => typeof value === "string" && value.trim());
            return first ? first.trim() : "";
        }

        if (typeof label === "string") {
            const trimmed = label.trim();
            const app = window.app;
            if (app && typeof app.t === "function") {
                const translated = app.t(trimmed);
                if (typeof translated === "string" && translated.trim()) {
                    return translated.trim();
                }
            }
            return trimmed;
        }

        return "";
    }

    function isHomeNavigationPath(path) {
        const normalized = normalizePath(path);
        if (normalized === "#") return false;
        return normalized === "/" || normalized === "/index.html";
    }

    function isCurrentPath(path) {
        const target = normalizePath(path);
        if (target === "#" || /^(https?:|mailto:|tel:|#)/i.test(target)) {
            return false;
        }

        const currentRaw = window.location.pathname || "/";
        const current = currentRaw === "/" ? "/index.html" : currentRaw.replace(/\/+$/, "");
        const targetNormalized = target === "/" ? "/index.html" : target.replace(/\/+$/, "");
        return current.toLowerCase() === targetNormalized.toLowerCase();
    }

    function getItemChildren(item) {
        if (!item || typeof item !== "object") return [];
        if (Array.isArray(item.children)) return filterVisibleItems(item.children);
        if (Array.isArray(item.sections)) {
            return filterVisibleItems(item.sections)
                .filter((section) => section && Array.isArray(section.items))
                .flatMap((section) => filterVisibleItems(section.items || []));
        }
        return [];
    }

    function normalizeUseCasesGroupKey(value) {
        const raw = String(value || "").trim().toLowerCase();
        if (raw === "application" || raw === "applications") return "application";
        if (raw === "solution" || raw === "solutions") return "solution";
        return "";
    }

    function getUseCasesGroupedChildren(item, children, lang) {
        const itemPath = normalizeSiteShellNavPath(item && item.path);
        if (itemPath !== "/use-cases" && itemPath !== "/use-cases/index.html") return null;
        if (!Array.isArray(children) || !children.length) return null;

        const hasExplicitGroup = children.some((child) => normalizeUseCasesGroupKey(child && child.groupKey));
        if (!hasExplicitGroup && children.length <= 4) return null;

        const groupMeta = [
            { key: "application", title: lang === "zh" ? "应用场景" : "Use Cases" },
            { key: "solution", title: lang === "zh" ? "解决方案" : "Solutions" }
        ];
        const groupedMap = new Map(groupMeta.map((entry) => [entry.key, []]));

        children.forEach((child, index) => {
            const explicitGroup = normalizeUseCasesGroupKey(child && child.groupKey);
            const fallbackGroup = index < 4 ? "application" : "solution";
            const groupKey = explicitGroup || fallbackGroup;
            if (!groupedMap.has(groupKey)) groupedMap.set(groupKey, []);
            groupedMap.get(groupKey).push(child);
        });

        const groups = groupMeta
            .map((entry) => ({
                title: entry.title,
                items: groupedMap.get(entry.key) || []
            }))
            .filter((entry) => entry.items.length);

        return groups.length ? groups : null;
    }

    function getFooterItems(item) {
        if (!item || typeof item !== "object") return [];

        const children = getItemChildren(item)
            .map((child) => ({
                title: getLabelValue(child.title, getCurrentLang()),
                path: normalizePath(child.path || "#")
            }))
            .filter((child) => child.path !== "#" && !isHomeNavigationPath(child.path));

        if (children.length) return children;

        const path = normalizePath(item.path || "#");
        if (path === "#" || isHomeNavigationPath(path)) return [];

        return [{ title: getLabelValue(item.title, getCurrentLang()), path: path }];
    }

    function buildDesktopNavigation(lang) {
        const navigation = getNavigationConfig();

        return navigation.map((item, index) => {
            const itemType = item && item.type ? item.type : "link";
            const title = escapeHtml(getLabelValue(item && item.title, lang));
            const itemPath = escapeHtml(normalizePath(item && item.path));
            const children = getItemChildren(item);

            if (itemType === "link") {
                return `<a href="${itemPath}" class="nav-item-link font-medium text-sm"><span>${title}</span></a>`;
            }

            const visibleSections = filterVisibleItems(item && item.sections);

            if (itemType === "mega" && visibleSections.length) {
                const gridCols = typeof item.gridCols === "string" && item.gridCols.trim()
                    ? escapeHtml(item.gridCols.trim())
                    : "grid-cols-5";
                const sectionsHtml = visibleSections.map((section, sectionIndex) => {
                    const header = escapeHtml(getLabelValue(section && section.header, lang));
                    const itemsHtml = filterVisibleItems(section && section.items).map((subItem) => {
                            const subTitle = escapeHtml(getLabelValue(subItem && subItem.title, lang));
                            const subPath = escapeHtml(normalizePath(subItem && subItem.path));
                            return `<li class="mb-2"><a href="${subPath}" class="text-gray-400 hover:text-gas-green text-xs flex items-center gap-2 transition-colors"><i class="fa-solid fa-angle-right text-[10px] opacity-50"></i>${subTitle}</a></li>`;
                        }).join("");
                    const borderClass = sectionIndex === visibleSections.length - 1 ? "" : "border-r border-white/5";
                    return `
                        <div class="col-span-1 space-y-4 ${borderClass} px-2">
                            <h3 class="text-gas-green font-bold text-sm uppercase tracking-wider mb-3 border-b border-white/5 pb-2">${header}</h3>
                            <ul>${itemsHtml}</ul>
                        </div>
                    `;
                }).join("");

                const dropContent = `
                    <div class="mega-menu">
                        <div class="max-w-[1800px] mx-auto px-4 grid ${gridCols} gap-6">${sectionsHtml}</div>
                    </div>
                `;

                return `
                    <div class="group h-full flex items-center cursor-pointer">
                        <span class="nav-item-link font-medium text-sm"><span>${title}</span></span>
                        ${dropContent}
                    </div>
                `;
            }

            if ((itemType === "menu" || children.length) && children.length) {
                const groupedChildren = getUseCasesGroupedChildren(item, children, lang);
                if (groupedChildren) {
                    const sectionsHtml = groupedChildren.map((group, sectionIndex) => {
                        const groupTitle = escapeHtml(group.title);
                        const itemsHtml = group.items.map((child) => {
                            const childTitle = escapeHtml(getLabelValue(child && child.title, lang));
                            const childPath = escapeHtml(normalizePath(child && child.path));
                            return `<li class="mb-2"><a href="${childPath}" class="text-gray-400 hover:text-gas-green text-xs flex items-center gap-2 transition-colors"><i class="fa-solid fa-angle-right text-[10px] opacity-50"></i>${childTitle}</a></li>`;
                        }).join("");
                        const borderClass = sectionIndex === groupedChildren.length - 1 ? "" : "border-r border-white/5";
                        return `
                            <div class="col-span-1 space-y-4 ${borderClass} px-2">
                                <h3 class="text-gas-green font-bold text-sm uppercase tracking-wider mb-3 border-b border-white/5 pb-2">${groupTitle}</h3>
                                <ul>${itemsHtml}</ul>
                            </div>
                        `;
                    }).join("");

                    return `
                        <div class="group h-full flex items-center cursor-pointer">
                            <span class="nav-item-link font-medium text-sm"><span>${title}</span></span>
                            <div class="mega-menu">
                                <div class="max-w-[1800px] mx-auto px-4 grid grid-cols-2 gap-6">${sectionsHtml}</div>
                            </div>
                        </div>
                    `;
                }

                const isRightAligned = index >= navigation.length - 3;
                const childrenHtml = children.map((child) => {
                    const childTitle = escapeHtml(getLabelValue(child && child.title, lang));
                    const childPath = escapeHtml(normalizePath(child && child.path));
                    return `<a href="${childPath}" class="block px-4 py-2 text-sm text-gray-400 hover:text-gas-green hover:bg-white/5 whitespace-nowrap">${childTitle}</a>`;
                }).join("");

                return `
                    <div class="group h-full flex items-center cursor-pointer relative">
                        <span class="nav-item-link font-medium text-sm"><span>${title}</span></span>
                        <div class="dropdown-menu ${isRightAligned ? "right-0" : "left-0"}">${childrenHtml}</div>
                    </div>
                `;
            }

            return `<a href="${itemPath}" class="nav-item-link font-medium text-sm"><span>${title}</span></a>`;
        }).join("");
    }

    function buildMobileNavigation(lang) {
        const navigation = getNavigationConfig();

        return navigation.map((item, index) => {
            const itemType = item && item.type ? item.type : "link";
            const title = escapeHtml(getLabelValue(item && item.title, lang));
            const itemPath = escapeHtml(normalizePath(item && item.path));
            const children = getItemChildren(item);
            const visibleSections = filterVisibleItems(item && item.sections);

            if (!children.length) {
                return `
                    <a href="${itemPath}" class="block py-4 border-b border-white/10 text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-gas-green">
                        ${title}
                    </a>
                `;
            }

            const subId = `ggx-mobile-submenu-${index}`;
            let childLinks = "";
            if (itemType === "menu") {
                const groupedChildren = getUseCasesGroupedChildren(item, children, lang);
                childLinks = groupedChildren
                    ? groupedChildren.map((group) => {
                        const groupTitle = escapeHtml(group.title);
                        const groupItems = group.items.map((child) => {
                            const childTitle = escapeHtml(getLabelValue(child && child.title, lang));
                            const childPath = escapeHtml(normalizePath(child && child.path));
                            return `<a href="${childPath}" class="block py-3 pl-4 text-gray-400 border-l border-white/10 ml-2 hover:text-gas-green hover:border-gas-green text-xs font-semibold uppercase tracking-wide">${childTitle}</a>`;
                        }).join("");
                        return `<div class="py-2"><h4 class="text-gas-green text-xs font-bold uppercase mb-2 pl-4">${groupTitle}</h4>${groupItems}</div>`;
                    }).join("")
                    : children.map((child) => {
                        const childTitle = escapeHtml(getLabelValue(child && child.title, lang));
                        const childPath = escapeHtml(normalizePath(child && child.path));
                        return `<a href="${childPath}" class="block py-3 pl-4 text-gray-400 border-l border-white/10 ml-2 hover:text-gas-green hover:border-gas-green text-xs font-semibold uppercase tracking-wide">${childTitle}</a>`;
                    }).join("");
            } else {
                childLinks = visibleSections.map((section) => {
                    const header = escapeHtml(getLabelValue(section && section.header, lang));
                    const subItems = filterVisibleItems(section && section.items).map((subItem) => {
                        const subTitle = escapeHtml(getLabelValue(subItem && subItem.title, lang));
                        const subPath = escapeHtml(normalizePath(subItem && subItem.path));
                        return `<a href="${subPath}" class="block py-2 pl-6 text-gray-400 border-l border-white/10 ml-2 hover:text-gas-green hover:border-gas-green text-xs font-semibold uppercase tracking-wide">${subTitle}</a>`;
                    }).join("");
                    return `<div class="py-2"><h4 class="text-gas-green text-xs font-bold uppercase mb-2 pl-4">${header}</h4>${subItems}</div>`;
                }).join("");
            }

            return `
                <div class="border-b border-white/10">
                    <button class="w-full py-4 flex justify-between items-center text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-gas-green focus:outline-none" data-ggx-action="toggle-mobile-submenu" data-ggx-target="${subId}" aria-label="Toggle submenu">
                        <span>${title}</span>
                        <i class="fa-solid fa-chevron-down text-xs transition-transform duration-300"></i>
                    </button>
                    <div id="${subId}" class="mobile-submenu"><div class="pb-4 space-y-1">${childLinks}</div></div>
                </div>
            `;
        }).join("");
    }

    function buildFooterLinks(lang) {
        const navigation = getNavigationConfig();

        return navigation.map((item, index) => {
            if (isHomeNavigationPath(item && item.path)) return "";

            const title = escapeHtml(getLabelValue(item && item.title, lang));
            const footerSubId = `ggx-footer-section-${index}`;
            let contentHtml = "";
            let desktopContentHtml = "";
            const visibleChildren = filterVisibleItems(item && item.children);
            const visibleSections = filterVisibleItems(item && item.sections);

            if (item && item.type === "menu" && visibleChildren.length) {
                const links = visibleChildren.map((child) => {
                    const childTitle = escapeHtml(getLabelValue(child && child.title, lang));
                    const childPath = escapeHtml(normalizePath(child && child.path));
                    return `<a href="${childPath}" class="footer-link hover:text-gas-green text-gray-400 mr-4 mb-2 inline-block">${childTitle}</a>`;
                }).join("");
                contentHtml = `<div class="flex flex-wrap">${links}</div>`;
            } else if (item && item.type === "mega" && visibleSections.length) {
                const desktopSections = visibleSections.map((section) => {
                    const sectionTitle = escapeHtml(getLabelValue(section && section.header, lang));
                    const sectionLinks = filterVisibleItems(section && section.items).map((subItem) => {
                        const subTitle = escapeHtml(getLabelValue(subItem && subItem.title, lang));
                        const subPath = escapeHtml(normalizePath(subItem && subItem.path));
                        return `<a href="${subPath}" class="hover:text-gas-green text-gray-400 ml-2 text-xs">${subTitle}</a>`;
                    }).join('<span class="text-gray-700 mx-1">|</span>');
                    return `<div class="flex items-baseline mr-6 mb-2"><span class="text-gas-green text-xs font-bold uppercase mr-1 whitespace-nowrap">${sectionTitle}:</span><div class="flex flex-wrap">${sectionLinks}</div></div>`;
                }).join("");

                const mobileLinks = visibleSections.map((section) => {
                    return filterVisibleItems(section && section.items).map((subItem) => {
                        const subTitle = escapeHtml(getLabelValue(subItem && subItem.title, lang));
                        const subPath = escapeHtml(normalizePath(subItem && subItem.path));
                        return `<a href="${subPath}" class="footer-link block pl-2 border-l border-white/10 hover:border-gas-green mb-1">${subTitle}</a>`;
                    }).join("");
                }).join("");

                contentHtml = `<div class="flex flex-col">${mobileLinks}</div>`;
                desktopContentHtml = `<div class="flex flex-wrap items-center">${desktopSections}</div>`;
            } else {
                const path = normalizePath(item && item.path);
                if (path !== "#" && path !== "/") {
                    contentHtml = `<div class="flex flex-wrap"><a href="${escapeHtml(path)}" class="footer-link hover:text-gas-green text-gray-400 mr-4 mb-2 inline-block">${title}</a></div>`;
                }
            }

            const finalDesktopHtml = desktopContentHtml || contentHtml;
            if (!finalDesktopHtml) return "";

            return `
                <div class="w-full border-b border-white/5 last:border-0">
                    <div class="hidden md:flex py-4 items-start">
                        <div class="w-32 lg:w-48 shrink-0">
                            <h4 class="text-white font-bold text-sm border-l-2 border-gas-green pl-3">${title}</h4>
                        </div>
                        <div class="flex-1">${finalDesktopHtml}</div>
                    </div>
                    <div class="md:hidden">
                        <button class="w-full flex justify-between items-center py-3 text-sm font-bold text-white focus:outline-none" data-ggx-action="toggle-footer-group" data-ggx-target="${footerSubId}" aria-expanded="false">
                            <span class="border-l-2 border-gas-green pl-3">${title}</span>
                            <i id="ggx-footer-icon-${index}" class="fa-solid fa-plus text-xs text-gray-500 transition-transform duration-300"></i>
                        </button>
                        <div id="${footerSubId}" class="footer-accordion-content">
                            <div class="pt-2 pl-4 pb-4 text-gray-400">${contentHtml}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }

    function renderNavigation(force) {
        const lang = getCurrentLang();
        const desktopNav = document.getElementById("desktop-nav");
        const mobileNav = document.getElementById("mobile-nav-content");

        if (desktopNav && (force || !desktopNav.innerHTML.trim())) {
            desktopNav.innerHTML = buildDesktopNavigation(lang);
        }

        if (mobileNav && (force || !mobileNav.innerHTML.trim())) {
            mobileNav.innerHTML = buildMobileNavigation(lang);
        }
    }

    function renderFooterLinks(force) {
        const footerLinks = document.getElementById("footer-links");
        if (!footerLinks) return;

        if (force || !footerLinks.innerHTML.trim()) {
            footerLinks.innerHTML = buildFooterLinks(getCurrentLang());
        }
    }

    function refreshShellNavigation(force) {
        renderNavigation(!!force);
        renderFooterLinks(!!force);
    }

    function syncLanguageUI(langCandidate) {
        const lang = normalizeLang(langCandidate || getCurrentLang());

        document.querySelectorAll("#ggx-site-header-slot .ggx-lang-option").forEach((button) => {
            const active = button.dataset.ggxLang === lang;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", active ? "true" : "false");
            button.dataset.ggxSelected = active ? "1" : "0";
        });

        document.querySelectorAll("#ggx-site-header-slot .ggx-lang-btn-mobile").forEach((button) => {
            const active = button.dataset.ggxLang === lang;
            button.classList.toggle("text-gas-green", active);
            button.classList.toggle("font-semibold", active);
            button.classList.toggle("text-gray-400", !active);
            button.setAttribute("aria-pressed", active ? "true" : "false");
        });

        if (document.documentElement) {
            document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
        }

        applySharedText(lang);
    }

    function setLanguageFromShell(langCandidate) {
        const lang = normalizeLang(langCandidate);
        const allowedLanguages = getAllowedLanguages();
        const finalLang = allowedLanguages.indexOf(lang) >= 0
            ? lang
            : (allowedLanguages[0] || "en");
        persistLang(finalLang);

        const app = window.app;
        if (app && typeof app.setLanguage === "function") {
            app.setLanguage(finalLang, { __fromShell: true });
        } else {
            document.dispatchEvent(new CustomEvent("gasgx:lang-changed", { detail: { lang: finalLang } }));
        }

        syncLanguageUI(finalLang);
        window.setTimeout(function () {
            refreshShellNavigation(true);
            syncLanguageUI(finalLang);
        }, 0);
    }

    function syncPageAppLanguage(langCandidate) {
        const finalLang = normalizeLang(langCandidate || getCurrentLang());
        const app = window.app;
        if (!app || typeof app !== "object") {
            return;
        }

        if (typeof app.setLanguage === "function") {
            app.setLanguage(finalLang, { __fromShell: true });
            return;
        }

        if ("currentLang" in app) {
            app.currentLang = finalLang;
        }
        if ("lang" in app) {
            app.lang = finalLang;
        }
    }

    function suppressLegacyShellRenderers() {
        const app = window.app;
        if (!app || app.__ggxLegacyShellSuppressed) {
            return;
        }

        ["renderNav", "renderMobileNav", "renderFooter"].forEach((methodName) => {
            if (typeof app[methodName] === "function") {
                app[`__ggxOriginal${methodName}`] = app[methodName].bind(app);
                app[methodName] = function () {
                    return undefined;
                };
            }
        });

        app.__ggxLegacyShellSuppressed = true;
    }

    function suppressLegacyLoginReminders() {
        document.querySelectorAll("#loginReminderModal, [id^='loginReminderModal']").forEach((node) => {
            if (node && node.parentNode) {
                node.parentNode.removeChild(node);
            }
        });

        const app = window.app;
        if (!app || app.__ggxLoginReminderSuppressed) {
            return;
        }

        if (app.reminderInterval) {
            clearInterval(app.reminderInterval);
            app.reminderInterval = null;
        }

        app.reminderCount = typeof app.maxReminders === "number"
            ? app.maxReminders
            : 999;

        app.startLoginReminders = function () {
            return undefined;
        };
        app.showLoginReminder = function () {
            return undefined;
        };
        app.closeLoginReminder = function () {
            const modal = document.getElementById("loginReminderModal");
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            return undefined;
        };
        app.stopLoginReminders = function () {
            if (this.reminderInterval) {
                clearInterval(this.reminderInterval);
                this.reminderInterval = null;
            }
            const modal = document.getElementById("loginReminderModal");
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            return undefined;
        };

        app.__ggxLoginReminderSuppressed = true;
    }

    function runAppIntegrationHooks() {
        wrapAppLanguageSetter();
        suppressLegacyShellRenderers();
        suppressLegacyLoginReminders();
    }

    function wrapAppLanguageSetter() {
        const app = window.app;
        if (!app || typeof app.setLanguage !== "function" || app.__ggxSetLanguageWrapped) {
            return;
        }

        const originalSetLanguage = app.setLanguage.bind(app);
        app.setLanguage = function (langValue, options) {
            const normalizedLang = normalizeLang(langValue || getCurrentLang());
            const fromShell = !!(options && typeof options === "object" && options.__fromShell === true);
            const storedLang = readStoredLang() ? normalizeLang(readStoredLang()) : null;

            // Main-site language is centrally controlled by the header language switcher.
            // Ignore page-local default language resets (for example setLanguage('en') during page init).
            const finalLang = (!isNewsPath() && storedLang && !fromShell)
                ? storedLang
                : normalizedLang;

            const result = originalSetLanguage(finalLang);
            persistLang(finalLang);
            refreshShellNavigation(true);
            syncLanguageUI(finalLang);
            return result;
        };
        app.__ggxSetLanguageWrapped = true;
    }

    function toggleMobileMenuFallback() {
        const menu = document.getElementById("mobile-menu-container");
        if (!menu) return;

        const isOpen = menu.dataset.ggxOpen === "1" || menu.style.transform === "translateX(0%)";
        menu.style.transform = isOpen ? "translateX(100%)" : "translateX(0%)";
        menu.dataset.ggxOpen = isOpen ? "0" : "1";

        const icon = document.querySelector("#mobile-menu-btn i");
        if (icon) {
            icon.classList.toggle("fa-bars", isOpen);
            icon.classList.toggle("fa-xmark", !isOpen);
        }

        document.body.style.overflow = isOpen ? "" : "hidden";
    }

    function closeMobileMenuFallback() {
        const menu = document.getElementById("mobile-menu-container");
        if (!menu) return;

        menu.style.transform = "translateX(100%)";
        menu.dataset.ggxOpen = "0";

        const icon = document.querySelector("#mobile-menu-btn i");
        if (icon) {
            icon.classList.add("fa-bars");
            icon.classList.remove("fa-xmark");
        }

        document.body.style.overflow = "";
    }

    function toggleAccordionById(contentId, iconSelector, options) {
        if (!contentId) return;

        const content = document.getElementById(contentId);
        if (!content) return;

        const isOpen = content.classList.contains("is-open") || (content.style.maxHeight && content.style.maxHeight !== "0px");
        content.classList.toggle("is-open", !isOpen);
        content.style.maxHeight = isOpen ? "0px" : content.scrollHeight + "px";

        const trigger = document.querySelector(`[data-ggx-target="${contentId}"]`);
        if (trigger) {
            trigger.setAttribute("aria-expanded", isOpen ? "false" : "true");
        }

        const icon = iconSelector ? trigger && trigger.querySelector(iconSelector) : null;
        if (icon) {
            icon.classList.toggle("rotate-180", !isOpen);
            if (options && options.plusMinusIcon) {
                icon.classList.toggle("fa-plus", isOpen);
                icon.classList.toggle("fa-minus", !isOpen);
            }
        }
    }

    function toggleMobileSubmenuFallback(contentId) {
        toggleAccordionById(contentId, "i", { plusMinusIcon: false });
    }

    function toggleFooterGroupFallback(contentId) {
        toggleAccordionById(contentId, "i", { plusMinusIcon: true });
    }

    function buildFooterContact(contactConfig) {
        const label = escapeHtml(getLabelValue(contactConfig.label, getCurrentLang()) || "www_gasgx_com");
        const iconClass = escapeHtml(contactConfig.iconClass || "fa-brands fa-weixin");
        const commonClass = "text-sm text-gray-400 hover:text-gas-green flex items-center gap-2 transition-colors focus:outline-none";

        if (contactConfig.mode === "link" && contactConfig.href) {
            const href = escapeHtml(contactConfig.href);
            const target = escapeHtml(contactConfig.target || "_blank");
            const rel = escapeHtml(contactConfig.rel || "noopener noreferrer");
            return `<a href="${href}" target="${target}" rel="${rel}" class="${commonClass}"><i class="${iconClass}"></i><span>${label}</span></a>`;
        }

        const qrType = escapeHtml(contactConfig.qrType || "wechat");
        return `<button data-ggx-action="open-qr" data-ggx-qr-type="${qrType}" class="${commonClass}"><i class="${iconClass}"></i><span>${label}</span></button>`;
    }

    function buildFooterPrivacyLink(privacyConfig) {
        const href = escapeHtml(privacyConfig.href || "/about/app_privacy_policy.html");
        const target = escapeHtml(privacyConfig.target || "_blank");
        const rel = escapeHtml(privacyConfig.rel || "noopener noreferrer");
        const resolvedText = getLabelValue(privacyConfig.text, getCurrentLang());
        const text = typeof resolvedText === "string" && resolvedText.trim()
            ? escapeHtml(resolvedText.trim())
            : "";
        const labelHtml = text ? text : `<span data-ggx-text="privacy-policy">Privacy Policy</span>`;
        return `<a href="${href}" target="${target}" rel="${rel}" class="hover:text-gas-green transition-colors flex items-center gap-1"><i class="fa-solid fa-shield-halved text-[10px]"></i>${labelHtml}</a>`;
    }

    function isFooterSocialHidden(item) {
        return !item || item.enabled === false || item.visible === false || item.hidden === true;
    }

    function getFallbackSocialHref(item) {
        const id = String((item && (item.id || item.qrType)) || "").trim().toLowerCase();
        if (!id) return "";

        const fallbackMap = {
            x: "https://x.com/",
            twitter: "https://x.com/",
            telegram: "https://t.me/",
            discord: "https://discord.com/",
            youtube: "https://www.youtube.com/",
            linkedin: "https://www.linkedin.com/",
            facebook: "https://www.facebook.com/",
            tiktok: "https://www.tiktok.com/",
            whatsapp: "https://wa.me/",
            instagram: "https://www.instagram.com/",
            xhs: "https://www.xiaohongshu.com/",
            video: "/news/index.html"
        };
        return fallbackMap[id] || "";
    }

    function resolveFooterSocialHref(item) {
        const explicit = typeof item.href === "string" ? item.href.trim() : "";
        if (explicit) return explicit;
        return getFallbackSocialHref(item);
    }

    function buildFooterSocialEntry(item) {
        if (isFooterSocialHidden(item)) return "";

        const itemId = String((item && item.id) || "").trim().toLowerCase();
        const safeItemId = itemId.replace(/[^a-z0-9_-]/g, "");
        const iconClass = escapeHtml(item.iconClass || "fa-solid fa-link");
        const commonClass = `ggx-social-btn ${safeItemId ? `ggx-social-btn-${safeItemId}` : ""} focus:outline-none`;
        const mode = String(item.mode || "link").trim().toLowerCase();
        const iconText = typeof item.text === "string" && item.text.trim() ? item.text.trim() : "";
        const iconHtml = iconText
            ? `<span class="font-black text-[7px] leading-none">${escapeHtml(iconText)}</span>`
            : `<i class="${iconClass} text-xs"></i>`;
        const resolvedTitle = getLabelValue(item.title, getCurrentLang());
        const title = typeof resolvedTitle === "string" && resolvedTitle.trim() ? resolvedTitle.trim() : "";
        const ariaLabel = escapeHtml(item.ariaLabel || title || item.id || "Social link");
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";

        if (mode === "qr") {
            const qrType = escapeHtml(item.qrType || item.id || "wechat");
            return `<button type="button" data-ggx-action="open-qr" data-ggx-qr-type="${qrType}" class="${commonClass}" aria-label="${ariaLabel}"${titleAttr}>${iconHtml}</button>`;
        }

        const href = resolveFooterSocialHref(item);
        if (!href) return "";
        const target = escapeHtml(item.target || "_blank");
        const rel = escapeHtml(item.rel || "noopener noreferrer");
        return `<a href="${escapeHtml(href)}" target="${target}" rel="${rel}" class="${commonClass}" aria-label="${ariaLabel}"${titleAttr}>${iconHtml}</a>`;
    }

    function buildFooterPartnerEntry(item) {
        if (!item || item.enabled === false || item.visible === false || item.hidden === true) return "";

        const resolvedTitle = getLabelValue(item.title, getCurrentLang());
        const title = typeof resolvedTitle === "string" && resolvedTitle.trim()
            ? resolvedTitle.trim()
            : "";
        if (!title) return "";

        const href = typeof item.href === "string" ? item.href.trim() : "";
        const pillHtml = `<span class="ggx-partner-pill inline-flex items-center justify-center min-h-[1.9rem] px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.02] text-gray-300 text-xs font-semibold leading-none transition-colors duration-200">${escapeHtml(title)}</span>`;
        if (!href) {
            return `<span class="ggx-partner-entry">${pillHtml}</span>`;
        }

        const target = escapeHtml(item.target || "_blank");
        const rel = escapeHtml(item.rel || "noopener noreferrer");
        return `<a href="${escapeHtml(href)}" target="${target}" rel="${rel}" class="ggx-partner-entry no-underline" aria-label="${escapeHtml(title)}">${pillHtml}</a>`;
    }

    function buildFooterTemplate() {
        const footerConfig = getFooterConfig();
        const brandConfig = getSiteBrandConfig();
        if (footerConfig.visible === false) {
            return "";
        }
        const contactHtml = buildFooterContact(footerConfig.contact);
        const privacyHtml = buildFooterPrivacyLink(footerConfig.privacyPolicy);
        const partnerHtml = footerConfig.partners.map(buildFooterPartnerEntry).join("");
        const partnerContainer = partnerHtml
            ? `<div class="ggx-partner-block flex flex-wrap items-center justify-center gap-y-2 gap-x-3 w-full"><span class="ggx-partner-label text-[11px] font-semibold tracking-[0.18em] uppercase text-gas-green/80" data-ggx-text="strategic-partners">战略合作伙伴</span><div class="ggx-partner-grid flex flex-wrap justify-center gap-2">${partnerHtml}</div></div>`
            : "";

        return `
<footer class="bg-[#0a0a0a] border-t border-white/10 mt-auto pt-10 pb-8 relative z-10">
    <div class="max-w-[1800px] mx-auto px-6">
        <div class="flex flex-col md:flex-row justify-between items-start mb-8 pb-6 border-b border-white/5">
            <div class="mb-6 md:mb-0">
                <div class="flex items-center gap-2 mb-2">${buildBrandAnchorHtml(brandConfig, "text-2xl font-bold text-gas-green hover:text-white transition-colors", brandConfig.name || "GasGx")}</div>
                <p class="text-sm text-gray-400 font-medium" data-ggx-text="footer-tagline">Making natural gas power mining easier</p>
            </div>
            <div class="flex flex-col md:items-end space-y-2">
                <h4 class="text-white font-bold text-sm uppercase tracking-wider mb-1" data-ggx-text="contact-us">Contact Us</h4>
                ${contactHtml}
            </div>
        </div>
        <div id="footer-links" class="mb-10 space-y-2"></div>
        <div class="ggx-footer-bottom pt-6 border-t border-white/5">
            <div class="ggx-footer-meta">
                <div class="ggx-footer-top-row">
                    <div class="ggx-footer-brand-inline">
                        ${buildBrandAnchorHtml(brandConfig, "ggx-footer-logo", brandConfig.name || "GasGx", `aria-label="${escapeHtml((brandConfig.name || "GasGx") + " Home")}"`)}
                        <p class="ggx-footer-meta-tag text-sm text-gray-400">${escapeHtml(brandConfig.footerMeta || "Energy-compute infrastructure for mining operators.")}</p>
                    </div>
                    ${partnerContainer}
                </div>
                <div class="ggx-footer-legal-row">
                    <div class="ggx-footer-legal flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600">
                        <span>${escapeHtml(brandConfig.copyright || "© 2026 GasGx. All rights reserved.")}</span><span class="text-gray-700">|</span>
                        ${privacyHtml}
                    </div>
                </div>
            </div>
        </div>
    </div>
</footer>`;
    }

    function readCookieByName(name) {
        if (typeof document === "undefined") return null;
        const cookieStr = document.cookie || "";
        const entries = cookieStr.split(";");
        for (let i = 0; i < entries.length; i += 1) {
            const entry = entries[i].trim();
            if (!entry) continue;
            const eqIndex = entry.indexOf("=");
            const key = eqIndex >= 0 ? entry.slice(0, eqIndex).trim() : entry;
            if (key !== name) continue;
            const rawValue = eqIndex >= 0 ? entry.slice(eqIndex + 1) : "";
            try {
                return decodeURIComponent(rawValue);
            } catch (_error) {
                return rawValue;
            }
        }
        return null;
    }

    function clearCookieConsentDelayTimer() {
        if (typeof window === "undefined") return;
        if (cookieConsentDelayTimer) {
            window.clearTimeout(cookieConsentDelayTimer);
            cookieConsentDelayTimer = null;
        }
    }

    function readCookieConsentUsageMs() {
        if (typeof window === "undefined") return 0;
        try {
            const raw = window.localStorage.getItem(COOKIE_CONSENT_USAGE_STORAGE_KEY);
            const parsed = Number.parseInt(raw || "0", 10);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
        } catch (_error) {
            return 0;
        }
    }

    function writeCookieConsentUsageMs(value) {
        if (typeof window === "undefined") return;
        const safeValue = Math.max(0, Math.round(Number(value) || 0));
        try {
            window.localStorage.setItem(COOKIE_CONSENT_USAGE_STORAGE_KEY, String(safeValue));
        } catch (_error) {
            // Ignore storage errors.
        }
    }

    function getCookieConsentAccumulatedMs() {
        if (cookieConsentAccumulatedMs === null) {
            cookieConsentAccumulatedMs = readCookieConsentUsageMs();
        }
        return cookieConsentAccumulatedMs;
    }

    function appendCookieConsentUsageMs(deltaMs) {
        const safeDelta = Math.max(0, Math.round(Number(deltaMs) || 0));
        if (!safeDelta) return;
        cookieConsentAccumulatedMs = getCookieConsentAccumulatedMs() + safeDelta;
        writeCookieConsentUsageMs(cookieConsentAccumulatedMs);
    }

    function pauseCookieConsentUsageSession() {
        if (cookieConsentSessionStartTs <= 0) return;
        const elapsedMs = Math.max(0, Date.now() - cookieConsentSessionStartTs);
        cookieConsentSessionStartTs = 0;
        appendCookieConsentUsageMs(elapsedMs);
    }

    function resumeCookieConsentUsageSession() {
        if (typeof document === "undefined" || document.hidden) return;
        if (cookieConsentSessionStartTs > 0) return;
        cookieConsentSessionStartTs = Date.now();
    }

    function getCookieConsentTotalUsageMs() {
        const activeElapsedMs = cookieConsentSessionStartTs > 0
            ? Math.max(0, Date.now() - cookieConsentSessionStartTs)
            : 0;
        return getCookieConsentAccumulatedMs() + activeElapsedMs;
    }

    function bindCookieConsentUsageTracking() {
        if (cookieConsentUsageTrackingBound || typeof document === "undefined" || typeof window === "undefined") return;
        cookieConsentUsageTrackingBound = true;

        if (!document.hidden) {
            resumeCookieConsentUsageSession();
        }

        document.addEventListener("visibilitychange", function () {
            if (document.hidden) {
                pauseCookieConsentUsageSession();
                clearCookieConsentDelayTimer();
                return;
            }
            resumeCookieConsentUsageSession();
            mountCookieConsentBanner();
        });

        window.addEventListener("pagehide", function () {
            pauseCookieConsentUsageSession();
            clearCookieConsentDelayTimer();
        });

        window.addEventListener("beforeunload", function () {
            pauseCookieConsentUsageSession();
        });
    }

    function readCookieConsentChoice() {
        const cookieValue = readCookieByName(COOKIE_CONSENT_COOKIE_NAME);
        if (cookieValue === "accepted" || cookieValue === "declined") {
            try {
                if (typeof window !== "undefined") window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, cookieValue);
            } catch (_error) {
                // Ignore storage errors.
            }
            return cookieValue;
        }
        if (typeof window === "undefined") return null;
        try {
            const value = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
            return value === "accepted" || value === "declined" ? value : null;
        } catch (_error) {
            return null;
        }
    }

    function writeCookieConsentChoice(value) {
        if (value !== "accepted" && value !== "declined") return;

        if (typeof window !== "undefined") {
            try {
                window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
            } catch (_error) {
                // Ignore storage errors (privacy mode / blocked storage).
            }
        }

        if (typeof document !== "undefined") {
            try {
                const encodedValue = encodeURIComponent(value);
                document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${encodedValue}; Max-Age=${COOKIE_CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
            } catch (_error) {
                // Ignore cookie write errors.
            }
        }
    }

    function readCookiePreferences() {
        if (typeof window === "undefined") {
            return { analytics: false, advertising: false };
        }
        try {
            const raw = window.localStorage.getItem(COOKIE_PREFS_STORAGE_KEY);
            if (!raw) return { analytics: false, advertising: false };
            const parsed = JSON.parse(raw);
            return {
                analytics: parsed && parsed.analytics === true,
                advertising: parsed && parsed.advertising === true
            };
        } catch (_error) {
            return { analytics: false, advertising: false };
        }
    }

    function writeCookiePreferences(preferences) {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(COOKIE_PREFS_STORAGE_KEY, JSON.stringify({
                analytics: !!(preferences && preferences.analytics),
                advertising: !!(preferences && preferences.advertising)
            }));
        } catch (_error) {
            // Ignore storage errors.
        }
    }

    function closeCookiePreferencesModal() {
        if (typeof document === "undefined") return;
        const modal = document.getElementById(COOKIE_PREFS_MODAL_ID);
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }

    function openCookiePreferencesModal(onSave) {
        if (typeof document === "undefined") return;
        closeCookiePreferencesModal();
        const prefs = readCookiePreferences();
        const host = document.body || document.documentElement;
        if (!host) return;

        const modal = document.createElement("section");
        modal.id = COOKIE_PREFS_MODAL_ID;
        modal.className = "ggx-cookie-prefs-modal";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.setAttribute("aria-label", "Optional Cookie Preferences");
        modal.innerHTML = `
            <div class="ggx-cookie-prefs-backdrop" data-ggx-cookie-close="1"></div>
            <div class="ggx-cookie-prefs-card">
                <h4 class="ggx-cookie-prefs-title">Optional Cookies</h4>
                <p class="ggx-cookie-prefs-subtitle">Strictly necessary cookies are always enabled. Choose optional categories below.</p>
                <label class="ggx-cookie-prefs-item">
                    <span>
                        <strong>Performance & Analytics</strong>
                        <small>Help us understand traffic and improve product experience.</small>
                    </span>
                    <input type="checkbox" data-ggx-pref-key="analytics" ${prefs.analytics ? "checked" : ""}>
                </label>
                <label class="ggx-cookie-prefs-item">
                    <span>
                        <strong>Advertising Cookies</strong>
                        <small>Allow targeted content and partner campaign optimization.</small>
                    </span>
                    <input type="checkbox" data-ggx-pref-key="advertising" ${prefs.advertising ? "checked" : ""}>
                </label>
                <div class="ggx-cookie-prefs-actions">
                    <button type="button" class="ggx-cookie-consent-btn ggx-cookie-consent-btn-secondary" data-ggx-cookie-save="1">Save Preferences</button>
                </div>
            </div>
        `;

        host.appendChild(modal);

        modal.addEventListener("click", function (event) {
            const target = event.target;
            if (!(target instanceof Element)) return;
            if (target.getAttribute("data-ggx-cookie-close") === "1") {
                closeCookiePreferencesModal();
                return;
            }
            if (target.getAttribute("data-ggx-cookie-save") === "1") {
                const analyticsInput = modal.querySelector("[data-ggx-pref-key='analytics']");
                const advertisingInput = modal.querySelector("[data-ggx-pref-key='advertising']");
                const nextPrefs = {
                    analytics: !!(analyticsInput && analyticsInput.checked),
                    advertising: !!(advertisingInput && advertisingInput.checked)
                };
                writeCookiePreferences(nextPrefs);
                closeCookiePreferencesModal();
                if (typeof onSave === "function") onSave(nextPrefs);
            }
        });
    }

    function hideCookieConsentBanner() {
        if (typeof document === "undefined") return;
        const banner = document.getElementById(COOKIE_CONSENT_BANNER_ID);
        if (!banner) return;

        banner.classList.remove("ggx-cookie-consent-visible");
        banner.classList.add("ggx-cookie-consent-hidden");

        window.setTimeout(function () {
            if (banner.parentNode) banner.parentNode.removeChild(banner);
        }, 220);
    }

    function mountCookieConsentBanner() {
        if (typeof document === "undefined") return;
        if (isNewsPath()) return;
        if (document.getElementById(COOKIE_CONSENT_BANNER_ID)) return;
        if (readCookieConsentChoice()) {
            clearCookieConsentDelayTimer();
            return;
        }

        bindCookieConsentUsageTracking();
        if (!document.hidden) {
            resumeCookieConsentUsageSession();
        }
        const totalUsageMs = getCookieConsentTotalUsageMs();
        if (totalUsageMs < COOKIE_CONSENT_DELAY_MS) {
            clearCookieConsentDelayTimer();
            if (!document.hidden && typeof window !== "undefined") {
                const remainingMs = Math.max(300, COOKIE_CONSENT_DELAY_MS - totalUsageMs);
                cookieConsentDelayTimer = window.setTimeout(function () {
                    cookieConsentDelayTimer = null;
                    mountCookieConsentBanner();
                }, remainingMs);
            }
            return;
        }

        clearCookieConsentDelayTimer();

        const host = document.body || document.documentElement;
        if (!host) return;

        const banner = document.createElement("section");
        banner.id = COOKIE_CONSENT_BANNER_ID;
        banner.className = "ggx-cookie-consent ggx-cookie-consent-hidden";
        banner.setAttribute("role", "dialog");
        banner.setAttribute("aria-live", "polite");
        banner.setAttribute("aria-label", "Cookie Consent");
        banner.innerHTML = `
            <div class="ggx-cookie-consent-panel">
                <h3 class="ggx-cookie-consent-title">Review Your Cookie Preferences</h3>
                <p class="ggx-cookie-consent-text">
                    As described in our <a href="/about/app_privacy_policy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>, we use cookies and other tracking technologies (collectively, “Cookies”) when you visit our website.
                    When these Cookies are set by our partners, they may result in the collection of information about your use of our website by those partners.
                    Residents of the states of California, Connecticut, Maryland, Texas (Constellation Home or Connect customers), and Nebraska have the right to opt out of the use of these Cookies to the extent they are considered “sales” or “sharing” (i.e., targeted advertising) of personal information under applicable privacy laws.
                    We offer all individuals the ability to make choices regarding our use of Cookies when we use Cookies to provide you with a more personalized experience, analyze performance and traffic, and for advertising.
                    You can review your options by clicking on “Optional Cookies” below. Please note you cannot opt out of Strictly Necessary Cookies as they are deployed in order to ensure proper functioning of our website.
                </p>
                <div class="ggx-cookie-consent-actions">
                    <button type="button" class="ggx-cookie-consent-btn ggx-cookie-consent-btn-outline" data-ggx-consent-action="optional">Optional Cookies</button>
                    <button type="button" class="ggx-cookie-consent-btn ggx-cookie-consent-btn-secondary" data-ggx-consent-action="decline">Reject All</button>
                    <button type="button" class="ggx-cookie-consent-btn ggx-cookie-consent-btn-primary" data-ggx-consent-action="accept">Accept Cookies</button>
                </div>
            </div>
        `;

        host.appendChild(banner);

        const acceptBtn = banner.querySelector("[data-ggx-consent-action='accept']");
        const declineBtn = banner.querySelector("[data-ggx-consent-action='decline']");
        const optionalBtn = banner.querySelector("[data-ggx-consent-action='optional']");
        const onChoice = function (choice) {
            pauseCookieConsentUsageSession();
            clearCookieConsentDelayTimer();
            writeCookieConsentChoice(choice);
            hideCookieConsentBanner();
        };

        if (acceptBtn) acceptBtn.addEventListener("click", function () { onChoice("accepted"); });
        if (declineBtn) declineBtn.addEventListener("click", function () { onChoice("declined"); });
        if (optionalBtn) {
            optionalBtn.addEventListener("click", function () {
                openCookiePreferencesModal(function (preferences) {
                    const enabledOptional = !!(preferences.analytics || preferences.advertising);
                    onChoice(enabledOptional ? "accepted" : "declined");
                });
            });
        }

        window.requestAnimationFrame(function () {
            banner.classList.remove("ggx-cookie-consent-hidden");
            banner.classList.add("ggx-cookie-consent-visible");
        });
    }

    function isNewsPath(pathnameCandidate) {
        const pathname = String(pathnameCandidate || (window.location && window.location.pathname) || "/").toLowerCase();
        return pathname === "/news" || pathname.startsWith("/news/");
    }

    function getMainAuthConfig() {
        const runtimeConfig = getSharedRuntimeConfig();
        const sourceConfig = runtimeConfig && typeof runtimeConfig.mainAuth === "object"
            ? runtimeConfig.mainAuth
            : {};

        function pickString(key, fallback) {
            const candidate = sourceConfig && typeof sourceConfig[key] === "string"
                ? sourceConfig[key].trim()
                : "";
            return candidate || fallback;
        }

        return {
            storageKey: pickString("storageKey", MAIN_AUTH_DEFAULTS.storageKey),
            signInUrl: pickString("signInUrl", MAIN_AUTH_DEFAULTS.signInUrl),
            accountUrl: pickString("accountUrl", MAIN_AUTH_DEFAULTS.accountUrl),
            salesUrl: pickString("salesUrl", MAIN_AUTH_DEFAULTS.salesUrl),
            signOutRedirectUrl: pickString("signOutRedirectUrl", MAIN_AUTH_DEFAULTS.signOutRedirectUrl),
            returnUrlStorageKey: pickString("returnUrlStorageKey", MAIN_AUTH_DEFAULTS.returnUrlStorageKey),
            supabaseUrl: pickString("supabaseUrl", MAIN_AUTH_DEFAULTS.supabaseUrl),
            supabaseKey: pickString("supabaseKey", MAIN_AUTH_DEFAULTS.supabaseKey),
            telegramBotName: pickString("telegramBotName", MAIN_AUTH_DEFAULTS.telegramBotName),
            telegramAuthUrl: pickString("telegramAuthUrl", MAIN_AUTH_DEFAULTS.telegramAuthUrl),
            providerRollout: {
                twitter: Boolean(sourceConfig.providerRollout && sourceConfig.providerRollout.twitter === true),
                linkedin: Boolean(sourceConfig.providerRollout && sourceConfig.providerRollout.linkedin === true),
                telegram: Boolean(sourceConfig.providerRollout && sourceConfig.providerRollout.telegram === true)
            }
        };
    }

    function getMainAuthElements() {
        return {
            loginBtn: document.getElementById("auth-login-btn"),
            userProfile: document.getElementById("auth-user-profile"),
            accountLink: document.getElementById("auth-account-link"),
            userAvatar: document.getElementById("auth-user-avatar"),
            mobLoginBtn: document.getElementById("mob-auth-login-btn"),
            mobUserProfile: document.getElementById("mob-auth-user-profile"),
            mobAccountLink: document.getElementById("mob-auth-account-link"),
            mobUserAvatar: document.getElementById("mob-auth-user-avatar"),
            mobUsername: document.getElementById("mob-auth-username"),
            mobHeaderAuthLink: document.getElementById("mob-header-auth-link"),
            mobHeaderAuthIcon: document.getElementById("mob-header-auth-icon"),
            mobHeaderAuthLabel: document.getElementById("mob-header-auth-label"),
            mobHeaderAvatar: document.getElementById("mob-header-auth-avatar")
        };
    }

    function setAuthElementVisibility(node, visible) {
        if (!node) return;
        node.classList.toggle("hidden", !visible);
        node.classList.toggle("flex", visible);
    }

    function resolveMainAuthDisplayName(user, profileName) {
        if (!user) return "Sign In";
        if (profileName && String(profileName).trim()) return String(profileName).trim();

        const meta = user.user_metadata && typeof user.user_metadata === "object"
            ? user.user_metadata
            : {};
        const fromMeta = meta.full_name || meta.name;
        if (fromMeta && String(fromMeta).trim()) return String(fromMeta).trim();

        if (typeof user.email === "string" && user.email.includes("@")) {
            return user.email.split("@")[0];
        }
        return "Sign In";
    }

    function resolveAvatarUriByKey(key) {
        const normalized = String(key || "").trim().toLowerCase();
        return MAIN_AUTH_AVATAR_URI_MAP[normalized] || MAIN_AUTH_FALLBACK_AVATAR;
    }

    function resolveMainAuthAvatarKey(meta) {
        const keyFromPreferences = meta && meta.preferences ? meta.preferences.avatarKey : "";
        const keyFromRoot = meta ? meta.avatar_key : "";
        const candidate = String(keyFromPreferences || keyFromRoot || MAIN_AUTH_DEFAULT_AVATAR_KEY).trim().toLowerCase();
        return MAIN_AUTH_AVATAR_URI_MAP[candidate] ? candidate : MAIN_AUTH_DEFAULT_AVATAR_KEY;
    }

    function resolveMainAuthAvatar(user) {
        if (!user) return MAIN_AUTH_FALLBACK_AVATAR;
        const meta = user.user_metadata && typeof user.user_metadata === "object"
            ? user.user_metadata
            : {};
        const avatarKey = resolveMainAuthAvatarKey(meta);
        if (avatarKey) {
            return resolveAvatarUriByKey(avatarKey);
        }
        return meta.avatar_url || meta.picture || MAIN_AUTH_FALLBACK_AVATAR;
    }

    function isAccountPagePath() {
        const pathname = String((window.location && window.location.pathname) || "").toLowerCase();
        return pathname.endsWith("/account/account.html") || pathname.endsWith("/account/account");
    }

    function applyMobileHeaderAuthState(user, displayName, authConfig) {
        const els = getMainAuthElements();
        const text = getSharedText(getCurrentLang());
        const avatar = user ? resolveMainAuthAvatar(user) : MAIN_AUTH_FALLBACK_AVATAR;

        if (user) {
            if (els.mobHeaderAuthLink) {
                if (isAccountPagePath()) {
                    els.mobHeaderAuthLink.href = authConfig.accountUrl || MAIN_AUTH_DEFAULTS.accountUrl;
                    els.mobHeaderAuthLink.removeAttribute("data-sidebar-toggle");
                } else {
                    els.mobHeaderAuthLink.href = authConfig.accountUrl || MAIN_AUTH_DEFAULTS.accountUrl;
                    els.mobHeaderAuthLink.removeAttribute("data-sidebar-toggle");
                }
                els.mobHeaderAuthLink.className = "xl:hidden flex items-center justify-center text-[10px] font-bold text-gas-green border border-gas-green/30 bg-gas-green/10 hover:bg-gas-green hover:text-black transition-all rounded-full p-1.5";
                els.mobHeaderAuthLink.setAttribute("aria-label", displayName || "Account");
            }
            if (els.mobHeaderAuthIcon) {
                els.mobHeaderAuthIcon.classList.add("hidden");
            }
            if (!els.mobHeaderAvatar && els.mobHeaderAuthIcon) {
                const avatarImg = document.createElement("img");
                avatarImg.id = "mob-header-auth-avatar";
                avatarImg.alt = "User avatar";
                avatarImg.className = "h-5 w-5 rounded-full border border-gas-green object-cover";
                avatarImg.src = avatar;
                els.mobHeaderAuthIcon.insertAdjacentElement("afterend", avatarImg);
            } else if (els.mobHeaderAvatar) {
                els.mobHeaderAvatar.classList.remove("hidden");
                els.mobHeaderAvatar.src = avatar;
            }
            if (els.mobHeaderAuthLabel) {
                els.mobHeaderAuthLabel.textContent = displayName;
                els.mobHeaderAuthLabel.classList.add("hidden");
            }
            return;
        }

        if (els.mobHeaderAuthLink) {
            els.mobHeaderAuthLink.href = authConfig.signInUrl || MAIN_AUTH_DEFAULTS.signInUrl;
            els.mobHeaderAuthLink.removeAttribute("data-sidebar-toggle");
            els.mobHeaderAuthLink.className = "xl:hidden flex items-center gap-2 text-[10px] font-bold text-black bg-gas-green hover:bg-white transition-all rounded-full px-3 py-1.5 shadow-glow max-w-[132px]";
            els.mobHeaderAuthLink.setAttribute("aria-label", text.authLogin || "Login");
        }
        if (els.mobHeaderAuthIcon) {
            els.mobHeaderAuthIcon.className = "fa-solid fa-right-to-bracket";
            els.mobHeaderAuthIcon.classList.remove("hidden");
        }
        if (els.mobHeaderAvatar) {
            els.mobHeaderAvatar.classList.add("hidden");
        }
        if (els.mobHeaderAuthLabel) {
            els.mobHeaderAuthLabel.textContent = text.authLogin || "Login";
            els.mobHeaderAuthLabel.classList.remove("hidden");
        }
    }

    function applyMainAuthState(user, displayName, options = {}) {
        const els = getMainAuthElements();
        const authConfig = authBridgeState.runtimeConfig || getMainAuthConfig();
        const accountUrl = authConfig.accountUrl || MAIN_AUTH_DEFAULTS.accountUrl;
        if (user) {
            setAuthElementVisibility(els.loginBtn, false);
            setAuthElementVisibility(els.userProfile, true);
            setAuthElementVisibility(els.mobLoginBtn, false);
            setAuthElementVisibility(els.mobUserProfile, true);

            const avatar = resolveMainAuthAvatar(user);
            if (els.accountLink) els.accountLink.href = accountUrl;
            if (els.userAvatar) els.userAvatar.src = avatar;
            if (els.mobAccountLink) els.mobAccountLink.href = accountUrl;
            if (els.mobUserAvatar) els.mobUserAvatar.src = avatar;
            if (els.mobUsername) els.mobUsername.textContent = displayName;
            applyMobileHeaderAuthState(user, displayName, authConfig);
            return;
        }

        setAuthElementVisibility(els.loginBtn, true);
        setAuthElementVisibility(els.userProfile, false);
        setAuthElementVisibility(els.mobLoginBtn, true);
        setAuthElementVisibility(els.mobUserProfile, false);
        applyMobileHeaderAuthState(null, displayName, authConfig);
    }

    async function fetchMainAuthProfileName(userId) {
        if (!authBridgeState.client || !userId) return null;
        try {
            const { data: profile } = await authBridgeState.client
                .from("profiles")
                .select("full_name")
                .eq("id", userId)
                .single();
            return profile && profile.full_name ? profile.full_name : null;
        } catch (error) {
            return null;
        }
    }

    async function fetchMainAuthOrderCount() {
        if (!authBridgeState.client) return 0;
        try {
            const { data, error } = await authBridgeState.client.rpc("get_customer_pipeline_overview", {});
            if (error) throw error;
            return Array.isArray(data) ? data.length : 0;
        } catch (_error) {
            return 0;
        }
    }

    async function applyMainAuthUser(user) {
        authBridgeState.currentUser = user || null;
        if (!authBridgeState.currentUser) {
            applyMainAuthState(null, "Sign In");
            return;
        }

        const [profileName, orderCount] = await Promise.all([
            fetchMainAuthProfileName(authBridgeState.currentUser.id),
            fetchMainAuthOrderCount()
        ]);
        const displayName = resolveMainAuthDisplayName(authBridgeState.currentUser, profileName);
        applyMainAuthState(authBridgeState.currentUser, displayName, { hasOrders: orderCount > 0 });
    }

    function saveMainReturnUrl() {
        const config = authBridgeState.runtimeConfig || getMainAuthConfig();
        try {
            if (isNewsPath()) return;
            const pathname = String((window.location && window.location.pathname) || "/").toLowerCase();
            if (pathname.startsWith("/account/user")) return;
            if (pathname.startsWith("/account/account")) return;
            if (pathname.startsWith("/account/sales")) return;
            window.sessionStorage.setItem(config.returnUrlStorageKey, window.location.href);
        } catch (error) {
            // Ignore storage failures in restricted environments.
        }
    }

    async function mainAuthBridgeSignIn() {
        if (isNewsPath()) return undefined;
        const config = authBridgeState.runtimeConfig || getMainAuthConfig();
        if (authBridgeState.currentUser) {
            window.location.href = config.accountUrl;
            return undefined;
        }

        saveMainReturnUrl();
        window.location.href = config.signInUrl;
        return undefined;
    }

    function clearMainAuthStorage(config) {
        const keys = [
            config.storageKey,
            `${config.storageKey}-code-verifier`
        ];

        keys.forEach((key) => {
            try {
                window.localStorage.removeItem(key);
            } catch (error) {
                console.warn("Main auth localStorage cleanup warning:", error);
            }
            try {
                window.sessionStorage.removeItem(key);
            } catch (error) {
                console.warn("Main auth sessionStorage cleanup warning:", error);
            }
        });
    }

    async function mainAuthBridgeSignOut() {
        const config = authBridgeState.runtimeConfig || getMainAuthConfig();

        if (!authBridgeState.client && window.supabase && typeof window.supabase.createClient === "function") {
            authBridgeState.client = window.supabase.createClient(config.supabaseUrl, config.supabaseKey, {
                auth: {
                    storageKey: config.storageKey,
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            });
        }

        if (authBridgeState.client) {
            try {
                await authBridgeState.client.auth.signOut({ scope: "global" });
            } catch (error) {
                console.error("Main auth sign-out failed:", error);
            }
        }

        clearMainAuthStorage(config);
        authBridgeState.currentUser = null;
        applyMainAuthState(null, "Sign In");
        window.location.replace(config.signOutRedirectUrl);
        return undefined;
    }

    function loadSupabaseSdk() {
        if (window.supabase && typeof window.supabase.createClient === "function") {
            return Promise.resolve(window.supabase);
        }

        if (window.__ggxMainSupabasePromise) {
            return window.__ggxMainSupabasePromise;
        }

        window.__ggxMainSupabasePromise = new Promise((resolve, reject) => {
            const existingScript = document.querySelector(`script[src="${SUPABASE_SDK_URL}"]`);
            if (existingScript) {
                existingScript.addEventListener("load", () => resolve(window.supabase), { once: true });
                existingScript.addEventListener("error", () => reject(new Error("Failed to load Supabase SDK")), { once: true });
                if (window.supabase && typeof window.supabase.createClient === "function") {
                    resolve(window.supabase);
                }
                return;
            }

            const script = document.createElement("script");
            script.src = SUPABASE_SDK_URL;
            script.async = true;
            script.onload = () => resolve(window.supabase);
            script.onerror = () => reject(new Error("Failed to load Supabase SDK"));
            document.head.appendChild(script);
        });

        return window.__ggxMainSupabasePromise;
    }

    function ensureMainAuthBridge() {
        if (isNewsPath()) return Promise.resolve();
        if (authBridgeState.initPromise) return authBridgeState.initPromise;

        authBridgeState.runtimeConfig = getMainAuthConfig();
        const existingAuth = window.AuthApp && typeof window.AuthApp === "object"
            ? window.AuthApp
            : {};
        window.AuthApp = Object.assign({}, existingAuth, {
            __ggxMainAuthBridge: true,
            signIn: mainAuthBridgeSignIn,
            signOut: mainAuthBridgeSignOut
        });

        applyMainAuthState(null, "Sign In");

        authBridgeState.initPromise = (async () => {
            try {
                const supabaseSdk = await loadSupabaseSdk();
                if (!supabaseSdk || typeof supabaseSdk.createClient !== "function") {
                    return;
                }

                authBridgeState.client = supabaseSdk.createClient(
                    authBridgeState.runtimeConfig.supabaseUrl,
                    authBridgeState.runtimeConfig.supabaseKey,
                    { auth: { storageKey: authBridgeState.runtimeConfig.storageKey } }
                );

                const { data: { session } } = await authBridgeState.client.auth.getSession();
                await applyMainAuthUser(session && session.user ? session.user : null);

                if (!authBridgeState.authListenerBound) {
                    authBridgeState.client.auth.onAuthStateChange(async (_event, sessionState) => {
                        await applyMainAuthUser(sessionState && sessionState.user ? sessionState.user : null);
                    });
                    authBridgeState.authListenerBound = true;
                }
            } catch (error) {
                console.warn("Main auth bridge init failed:", error);
                await applyMainAuthUser(null);
            } finally {
                authBridgeState.initialized = true;
            }
        })();

        return authBridgeState.initPromise;
    }

    function callApp(method, ...args) {
        const app = window.app;
        if (!app || typeof app[method] !== "function") {
            return undefined;
        }
        return app[method](...args);
    }

    function callAuth(method) {
        const auth = window.AuthApp;
        if (auth && typeof auth[method] === "function") {
            return auth[method]();
        }

        if (method === "signIn") {
            return mainAuthBridgeSignIn();
        }
        if (method === "signOut") {
            return mainAuthBridgeSignOut();
        }
        return undefined;
    }

    function openQr(type) {
        if (typeof window.openQrModal === "function") {
            return window.openQrModal(type);
        }
        return undefined;
    }

    function mountSlot(slotId, html) {
        const slot = document.getElementById(slotId);
        if (!slot) return null;
        slot.innerHTML = html;
        return slot;
    }

    function ensureSlot(slotId) {
        let slot = document.getElementById(slotId);
        if (slot) return slot;
        if (!document.body) return null;

        slot = document.createElement("div");
        slot.id = slotId;
        document.body.appendChild(slot);
        return slot;
    }

    function closeLangMenu() {
        const picker = document.getElementById("ggx-lang-picker");
        const trigger = document.getElementById("lang-menu-btn");
        const dropdown = document.getElementById("ggx-lang-dropdown");
        if (picker) picker.classList.remove("is-open");
        if (dropdown) dropdown.classList.add("hidden");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
    }

    function openLangMenu() {
        const picker = document.getElementById("ggx-lang-picker");
        const trigger = document.getElementById("lang-menu-btn");
        const dropdown = document.getElementById("ggx-lang-dropdown");
        if (picker) picker.classList.add("is-open");
        if (dropdown) dropdown.classList.remove("hidden");
        if (trigger) trigger.setAttribute("aria-expanded", "true");
    }

    function toggleLangMenu() {
        const dropdown = document.getElementById("ggx-lang-dropdown");
        if (!dropdown) return;
        if (dropdown.classList.contains("hidden")) {
            openLangMenu();
        } else {
            closeLangMenu();
        }
    }

    function bindActionDelegation() {
        if (state.actionBound) return;

        document.addEventListener("click", (event) => {
            const clickInsideLangPicker = !!event.target.closest("#ggx-lang-picker");
            if (!clickInsideLangPicker) {
                closeLangMenu();
            }

            const mobileNavLink = event.target.closest("#mobile-menu-container a[href]");
            if (mobileNavLink) {
                closeMobileMenuFallback();
            }

            const trigger = event.target.closest("[data-ggx-action]");
            if (!trigger) return;

            const action = trigger.dataset.ggxAction;

            if (action === "set-lang") {
                event.preventDefault();
                setLanguageFromShell(trigger.dataset.ggxLang);
                closeLangMenu();
                return;
            }

            if (action === "toggle-lang-menu") {
                event.preventDefault();
                toggleLangMenu();
                return;
            }

            if (action === "toggle-mobile-menu") {
                event.preventDefault();
                toggleMobileMenuFallback();
                return;
            }

            if (action === "toggle-mobile-submenu") {
                event.preventDefault();
                const targetId = trigger.dataset.ggxTarget;
                toggleMobileSubmenuFallback(targetId);
                return;
            }

            if (action === "toggle-footer-group") {
                event.preventDefault();
                const targetId = trigger.dataset.ggxTarget;
                toggleFooterGroupFallback(targetId);
                return;
            }

            if (action === "auth-sign-in") {
                event.preventDefault();
                callAuth("signIn");
                return;
            }

            if (action === "auth-sign-out") {
                event.preventDefault();
                callAuth("signOut");
                return;
            }

            if (action === "open-qr") {
                event.preventDefault();
                openQr(trigger.dataset.ggxQrType);
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeLangMenu();
            }
        });

        state.actionBound = true;
    }

    function initBackToTop() {
        const backToTopBtn = document.getElementById("backToTopBtn");
        if (!backToTopBtn || backToTopBtn.dataset.ggxBound === "1") return;

        const updateButtonVisibility = function () {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                backToTopBtn.classList.remove("translate-y-20", "opacity-0");
                backToTopBtn.classList.remove("opacity-15");
                backToTopBtn.classList.add("opacity-100");
            } else {
                backToTopBtn.classList.add("translate-y-20", "opacity-0");
                backToTopBtn.classList.remove("opacity-15", "opacity-100");
            }
        };

        backToTopBtn.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        window.addEventListener("scroll", updateButtonVisibility, { passive: true });
        updateButtonVisibility();
        backToTopBtn.dataset.ggxBound = "1";
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function initChatbot() {
        const wrapper = document.getElementById("ggx-chat-wrapper");
        if (!wrapper || wrapper.dataset.ggxBound === "1") return;

        const chatWindow = document.getElementById("ggx-chat-window");
        const toggleBtn = document.getElementById("ggx-chat-toggle-btn");
        const dockBtn = document.getElementById("ggx-chat-dock-btn");
        const undockBtn = document.getElementById("ggx-chat-undock-btn");
        const toggleIcon = document.getElementById("ggx-chat-toggle-icon");
        const closeBtn = document.getElementById("ggx-chat-close-btn");
        const messagesContainer = document.getElementById("ggx-chat-messages");
        const userInput = document.getElementById("ggx-chat-user-input");
        const loadingIndicator = document.getElementById("ggx-chat-loading");
        const sendBtn = document.getElementById("ggx-chat-send-btn");
        const unreadDot = wrapper.querySelector("[data-ggx-chat-unread]");

        if (!chatWindow || !toggleBtn || !toggleIcon || !messagesContainer || !userInput || !loadingIndicator || !sendBtn) {
            return;
        }

        const runtimeConfig = getSharedRuntimeConfig();
        const authConfig = getMainAuthConfig();
        const chatApiUrl = typeof runtimeConfig.chatApiUrl === "string" && runtimeConfig.chatApiUrl.trim()
            ? runtimeConfig.chatApiUrl.trim()
            : `${String(authConfig.supabaseUrl || "").replace(/\/+$/, "")}${DEFAULT_CHAT_API_PATH}`;
        const dockStorageKey = "gasgx-chat-docked";
        const chatSessionStorageKey = "gasgx-chat-session-id";
        const conversationHistory = [];
        const chatFieldLabels = {
            en: {
                application: "application",
                power: "power",
                gas_type: "gas type",
                gas_quality: "gas quality",
                country: "country",
                basin_or_province: "basin / province",
                site_type: "site type",
                available_flow: "available flow",
                voltage_frequency: "voltage / frequency",
                deployment: "deployment",
                delivery_scope: "delivery scope",
                site_conditions: "site conditions",
                service_scope: "service scope",
                deployment_scope: "deployment scope",
                site_constraints: "site constraints",
                service_model: "service model"
            },
            zh: {
                application: "应用场景",
                power: "目标功率",
                gas_type: "气源类型",
                gas_quality: "气质",
                country: "国家地区",
                basin_or_province: "盆地 / 省州",
                site_type: "站点类型",
                available_flow: "可用流量",
                voltage_frequency: "电压 / 频率",
                deployment: "部署形式",
                delivery_scope: "交付范围",
                site_conditions: "现场条件",
                service_scope: "服务范围",
                deployment_scope: "部署范围",
                site_constraints: "现场约束",
                service_model: "运维模式"
            },
            ru: {
                application: "сценарий проекта",
                power: "требуемая мощность",
                gas_type: "тип газа",
                gas_quality: "качество газа",
                country: "страна",
                basin_or_province: "бассейн / регион",
                site_type: "тип площадки",
                available_flow: "доступный расход",
                voltage_frequency: "напряжение / частота",
                deployment: "формат размещения",
                delivery_scope: "границы поставки",
                site_conditions: "условия площадки",
                service_scope: "сервисный объем",
                deployment_scope: "границы deployment",
                site_constraints: "ограничения площадки",
                service_model: "модель сервиса"
            }
        };

        let isChatOpen = false;
        let isChatDocked = false;
        let chatUiLang = getCurrentLang();

        function scrollToBottom() {
            requestAnimationFrame(function () {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            });
        }

        function setChatOpen(nextOpen) {
            if (isChatDocked) return;
            isChatOpen = nextOpen;
            if (isChatOpen) {
                chatWindow.classList.remove("hidden");
                toggleBtn.classList.remove("ggx-chat-attention");
                if (unreadDot) unreadDot.classList.add("hidden");
                setTimeout(function () {
                    chatWindow.classList.remove("scale-95", "opacity-0");
                    chatWindow.classList.add("scale-100", "opacity-100");
                }, 10);
                toggleIcon.classList.remove("fa-robot");
                toggleIcon.classList.add("fa-chevron-down");
                setTimeout(function () {
                    userInput.focus();
                }, 250);
            } else {
                chatWindow.classList.remove("scale-100", "opacity-100");
                chatWindow.classList.add("scale-95", "opacity-0");
                toggleBtn.classList.add("ggx-chat-attention");
                setTimeout(function () {
                    chatWindow.classList.add("hidden");
                }, 300);
                toggleIcon.classList.remove("fa-chevron-down");
                toggleIcon.classList.add("fa-robot");
            }
        }

        function setChatDocked(nextDocked) {
            isChatDocked = !!nextDocked;
            wrapper.classList.toggle("ggx-chat-is-docked", isChatDocked);
            if (dockBtn) dockBtn.classList.toggle("hidden", isChatDocked);
            if (undockBtn) undockBtn.classList.toggle("hidden", !isChatDocked);

            if (isChatDocked) {
                isChatOpen = false;
                chatWindow.classList.add("hidden", "scale-95", "opacity-0");
                toggleIcon.classList.remove("fa-chevron-down");
                toggleIcon.classList.add("fa-robot");
            }

            try {
                window.localStorage.setItem(dockStorageKey, isChatDocked ? "1" : "0");
            } catch (error) {
                // Ignore storage failures in restricted environments.
            }
        }

        function getChatSessionId() {
            try {
                const existing = window.localStorage.getItem(chatSessionStorageKey);
                if (existing) return existing;
                const nextId = `gxchat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
                window.localStorage.setItem(chatSessionStorageKey, nextId);
                return nextId;
            } catch (error) {
                return `gxchat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            }
        }

        function buildMessageMeta(meta) {
            if (!meta || typeof meta !== "object") return "";
            const lang = normalizeLang(chatUiLang || getCurrentLang());
            const labels = chatFieldLabels[lang] || chatFieldLabels.en;
            const copy = {
                en: { sources: "Sources:", next: "Next:" },
                zh: { sources: "\u6765\u6e90\uff1a", next: "\u4e0b\u4e00\u6b65\uff1a" },
                ru: { sources: "\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438:", next: "\u0414\u0430\u043b\u044c\u0448\u0435:" }
            }[lang] || { sources: "Sources:", next: "Next:" };
            const sourceList = Array.isArray(meta.sources) ? meta.sources.filter(function (item) {
                return item && typeof item === "object" && item.title;
            }).slice(0, 3) : [];
            const handoff = meta.handoff && typeof meta.handoff === "object" ? meta.handoff : null;
            function sourceDescriptor(item) {
                const href = typeof item.url === "string" && item.url.trim() ? item.url.trim() : "";
                if (/^https?:\/\//i.test(href)) {
                    try {
                        const parsed = new URL(href);
                        const compactPath = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname.replace(/\/$/, "") : "";
                        return (parsed.hostname.replace(/^www\./i, "") + compactPath).slice(0, 60);
                    } catch (error) {
                        return href;
                    }
                }
                return item.source_type === "internal_sales_kb" ? "GasGx knowledge" : (item.source_type || "Reference");
            }
            const sourceHtml = sourceList.length
                ? `<div class="ggx-chat-meta-block"><div class="ggx-chat-meta-heading">${escapeHtml(copy.sources)}</div><div class="ggx-chat-source-list">${sourceList.map(function (item) {
                    const title = escapeHtml(item.title || "GasGx Knowledge");
                    const href = typeof item.url === "string" && item.url.trim() ? item.url.trim() : "";
                    const desc = escapeHtml(sourceDescriptor(item));
                    if (/^https?:\/\//i.test(href)) {
                        return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="ggx-chat-source-item"><span class="ggx-chat-source-title">${title}</span><span class="ggx-chat-source-desc">${desc}</span></a>`;
                    }
                    return `<div class="ggx-chat-source-item is-static"><span class="ggx-chat-source-title">${title}</span><span class="ggx-chat-source-desc">${desc}</span></div>`;
                }).join("")}</div></div>`
                : "";
            const handoffHtml = handoff && handoff.required && Array.isArray(handoff.next_fields) && handoff.next_fields.length
                ? `<div class="ggx-chat-meta-block"><div class="ggx-chat-meta-heading">${escapeHtml(copy.next)}</div><ul class="ggx-chat-next-list">${handoff.next_fields.map(function (item) {
                    return `<li class="ggx-chat-next-item">${escapeHtml(labels[item] || item)}</li>`;
                }).join("")}</ul></div>`
                : "";
            return sourceHtml + handoffHtml;
        }
        function simplifyChatUrl(url) {
            try {
                const parsed = new URL(url);
                const host = parsed.hostname.replace(/^www\./i, "");
                const compactPath = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname.replace(/\/$/, "") : "";
                const display = host + compactPath;
                return display.length > 56 ? display.slice(0, 53) + "..." : display;
            } catch (error) {
                return url;
            }
        }
        function splitChatMessageSegments(text) {
            const normalized = String(text || "")
                .replace(/\r\n/g, "\n")
                .replace(/[ \t]+\n/g, "\n")
                .replace(/\n{3,}/g, "\n\n")
                .trim();
            if (!normalized) return [];
            const explicitLines = normalized.split("\n").map(function (line) {
                return line.trim();
            }).filter(Boolean);
            const explicitMarker = /^(\d+[.)]|[-*])\s+/;
            const hasExplicitList = explicitLines.some(function (line) {
                return explicitMarker.test(line);
            });
            if (hasExplicitList) {
                return explicitLines.map(function (line) {
                    return line.replace(explicitMarker, "").trim();
                }).filter(Boolean);
            }
            const paragraphs = normalized.split(/\n{2,}/).map(function (part) {
                return part.trim();
            }).filter(Boolean);
            const segments = [];
            paragraphs.forEach(function (paragraph) {
                const sentenceParts = paragraph
                    .split(/(?<=[.!?。！？；;：:])(?:\s+|(?=[A-Z0-9\u4e00-\u9fff\u0400-\u04FF]))/)
                    .map(function (part) {
                        return part.trim();
                    })
                    .filter(Boolean);
                if (sentenceParts.length > 1) {
                    sentenceParts.forEach(function (part) {
                        segments.push(part);
                    });
                    return;
                }
                if (paragraph.length > 170 && /[，,、]\s*/.test(paragraph)) {
                    paragraph
                        .split(/[，,、]\s*/)
                        .map(function (part) {
                            return part.trim();
                        })
                        .filter(Boolean)
                        .forEach(function (part) {
                            segments.push(part);
                        });
                    return;
                }
                segments.push(paragraph);
            });
            const compactSegments = [];
            segments.filter(Boolean).forEach(function (segment) {
                const current = segment.trim();
                if (!current) return;
                const previous = compactSegments[compactSegments.length - 1];
                if (previous && previous.length < 38 && current.length < 38 && compactSegments.length >= 3) {
                    compactSegments[compactSegments.length - 1] = previous + " " + current;
                    return;
                }
                compactSegments.push(current);
            });
            return compactSegments;
        }
        function getChatInlineLinkCopy() {
            const lang = normalizeLang(chatUiLang || getCurrentLang());
            return lang === "zh"
                ? { open: "点击打开", internal: "站内页面", external: "外部链接" }
                : lang === "ru"
                    ? { open: "Нажмите, чтобы открыть", internal: "Страница GasGx", external: "Внешняя ссылка" }
                    : { open: "Click to open", internal: "GasGx page", external: "External link" };
        }
        function buildChatInlineLink(url, label) {
            const href = String(url || "").trim();
            if (!/^https?:\/\//i.test(href)) return escapeHtml(label || href);
            const compact = simplifyChatUrl(href);
            const linkText = label && label.trim() ? label.trim() : compact;
            const kindCopy = getChatInlineLinkCopy();
            const kind = /^https?:\/\/([a-z0-9-]+\.)*gasgx\.com(?:\/|$)/i.test(href) ? kindCopy.internal : kindCopy.external;
            const title = label && label.trim() ? compact : href;
            return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="ggx-chat-inline-link" title="${escapeHtml(title)}">${escapeHtml(linkText)}<span class="ggx-chat-inline-link-kind">${escapeHtml(kind)}</span></a>`;
        }
        function renderChatInlineText(text) {
            const source = String(text || "");
            const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]+)/g;
            let cursor = 0;
            let output = "";
            let match;
            while ((match = pattern.exec(source))) {
                output += escapeHtml(source.slice(cursor, match.index));
                if (match[3]) {
                    const rawUrl = match[3];
                    const url = rawUrl.replace(/[),.;!?，。；：！？、）】》」]+$/g, "");
                    const trailing = rawUrl.slice(url.length);
                    output += buildChatInlineLink(url);
                    output += escapeHtml(trailing);
                } else {
                    output += buildChatInlineLink(match[2], match[1]);
                }
                cursor = match.index + match[0].length;
            }
            output += escapeHtml(source.slice(cursor));
            return output;
        }
        function flushChatParagraphBlock(blocks, buffer) {
            if (!buffer.length) return;
            const text = buffer.join(" ").replace(/\s+/g, " ").trim();
            buffer.length = 0;
            if (!text) return;
            if (/[:：]$/.test(text) && text.length <= 72) {
                blocks.push({ type: "subhead", text: text });
                return;
            }
            blocks.push({ type: "paragraph", text: text });
        }
        function flushChatListBlock(blocks, listType, listItems) {
            if (!listType || !listItems.length) return;
            blocks.push({ type: listType, items: listItems.slice() });
            listItems.length = 0;
        }
        function parseChatMessageBlocks(text) {
            const normalized = String(text || "")
                .replace(/\r\n/g, "\n")
                .replace(/[ \t]+\n/g, "\n")
                .replace(/\n{3,}/g, "\n\n")
                .trim();
            if (!normalized) return [];
            const orderedMarker = /^\d+[.)]\s+/;
            const unorderedMarker = /^[-*•]\s+/;
            const blocks = [];
            const paragraphBuffer = [];
            const listItems = [];
            let listType = "";

            normalized.split("\n").forEach(function (rawLine) {
                const line = rawLine.trim();
                if (!line) {
                    flushChatListBlock(blocks, listType, listItems);
                    listType = "";
                    flushChatParagraphBlock(blocks, paragraphBuffer);
                    return;
                }
                if (orderedMarker.test(line)) {
                    flushChatParagraphBlock(blocks, paragraphBuffer);
                    if (listType && listType !== "ordered") {
                        flushChatListBlock(blocks, listType, listItems);
                    }
                    listType = "ordered";
                    listItems.push(line.replace(orderedMarker, "").trim());
                    return;
                }
                if (unorderedMarker.test(line)) {
                    flushChatParagraphBlock(blocks, paragraphBuffer);
                    if (listType && listType !== "unordered") {
                        flushChatListBlock(blocks, listType, listItems);
                    }
                    listType = "unordered";
                    listItems.push(line.replace(unorderedMarker, "").trim());
                    return;
                }
                if (listType) {
                    flushChatListBlock(blocks, listType, listItems);
                    listType = "";
                }
                paragraphBuffer.push(line);
            });

            flushChatListBlock(blocks, listType, listItems);
            flushChatParagraphBlock(blocks, paragraphBuffer);
            return blocks;
        }
        function renderChatMessageBlock(block) {
            if (!block || typeof block !== "object") return "";
            if (block.type === "ordered" || block.type === "unordered") {
                const items = Array.isArray(block.items) ? block.items.filter(Boolean) : [];
                if (!items.length) return "";
                return `<ul class="ggx-chat-list ${block.type === "ordered" ? "is-ordered" : "is-unordered"}">${items.map(function (item, index) {
                    const marker = block.type === "ordered"
                        ? `<span class="ggx-chat-list-marker">${index + 1}.</span>`
                        : `<span class="ggx-chat-list-marker">•</span>`;
                    return `<li class="ggx-chat-list-item">${marker}<div class="ggx-chat-list-content">${renderChatInlineText(item)}</div></li>`;
                }).join("")}</ul>`;
            }
            if (block.type === "subhead") {
                return `<div class="ggx-chat-subhead">${renderChatInlineText(block.text)}</div>`;
            }
            return `<p class="ggx-chat-paragraph">${renderChatInlineText(block.text)}</p>`;
        }
        function getChatSiteHint(langCandidate) {
            const lang = normalizeLang(langCandidate || chatUiLang || getCurrentLang());
            const path = String(window.location.pathname || "").toLowerCase();
            if (path.indexOf("/products/") === 0) {
                return lang === "zh"
                    ? "\u4f60\u53ef\u4ee5\u7ee7\u7eed\u7ed3\u5408\u5f53\u524d\u4ea7\u54c1\u9875\u67e5\u770b\u53c2\u6570\u548c\u90e8\u7f72\u4fe1\u606f\uff0c\u4e5f\u53ef\u4ee5\u76f4\u63a5\u5728\u8fd9\u91cc\u8865\u5145\u9879\u76ee\u6761\u4ef6\uff0c\u6211\u6765\u5e2e\u4f60\u6574\u7406\u6210\u62a5\u4ef7\u7ebf\u7d22\u3002"
                    : lang === "ru"
                        ? "\u0432\u044b \u043c\u043e\u0436\u0435\u0442\u0435 \u0441\u0432\u0435\u0440\u044f\u0442\u044c\u0441\u044f \u0441 \u0442\u0435\u043a\u0443\u0449\u0435\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435\u0439 \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u0430 \u043f\u043e \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u0430\u043c \u0438 deployment, \u0430 \u0437\u0434\u0435\u0441\u044c \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c \u0432\u0432\u043e\u0434\u0438\u0442\u044c \u043f\u0440\u043e\u0435\u043a\u0442\u043d\u044b\u0435 \u0443\u0441\u043b\u043e\u0432\u0438\u044f, \u0447\u0442\u043e\u0431\u044b \u044f \u043f\u043e\u043c\u043e\u0433 \u0441\u043e\u0431\u0440\u0430\u0442\u044c \u043b\u0438\u0434 \u0434\u043b\u044f \u043a\u043e\u043c\u043c\u0435\u0440\u0447\u0435\u0441\u043a\u043e\u0433\u043e \u043f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d\u0438\u044f."
                        : "You can keep using this product page for specs and deployment context, and continue here with your project inputs for a quotation handoff.";
            }
            if (path.indexOf("/solutions/") === 0 || path.indexOf("/use-cases/") === 0) {
                return lang === "zh"
                    ? "\u4f60\u53ef\u4ee5\u7ed3\u5408\u5f53\u524d\u65b9\u6848\u9875\u7ee7\u7eed\u5bf9\u6bd4\u573a\u666f\u9002\u914d\uff0c\u4e5f\u53ef\u4ee5\u76f4\u63a5\u628a\u529f\u7387\u3001\u6c14\u6e90\u548c\u56fd\u5bb6\u53d1\u7ed9\u6211\uff0c\u6211\u6765\u5e2e\u4f60\u6536\u655b\u5230\u53ef\u6267\u884c\u65b9\u6848\u3002"
                    : lang === "ru"
                        ? "\u043c\u043e\u0436\u043d\u043e \u0441\u043e\u043f\u043e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u043e\u0442\u0432\u0435\u0442 \u0441 \u0442\u0435\u043a\u0443\u0449\u0435\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435\u0439 \u0440\u0435\u0448\u0435\u043d\u0438\u044f \u0438 \u0441\u0440\u0430\u0437\u0443 \u043f\u0440\u0438\u0441\u043b\u0430\u0442\u044c \u043c\u043e\u0449\u043d\u043e\u0441\u0442\u044c, \u0442\u0438\u043f \u0433\u0430\u0437\u0430 \u0438 \u0441\u0442\u0440\u0430\u043d\u0443, \u0447\u0442\u043e\u0431\u044b \u044f \u0441\u0443\u0437\u0438\u043b \u0432\u0430\u0440\u0438\u0430\u043d\u0442 \u0434\u043e \u0440\u0430\u0431\u043e\u0447\u0435\u0433\u043e \u0440\u0435\u0448\u0435\u043d\u0438\u044f."
                        : "You can compare this answer with the current solution page, or send power, gas type and country here so I can narrow it to an executable direction.";
            }
            return lang === "zh"
                ? "\u4f60\u4e5f\u53ef\u4ee5\u7ee7\u7eed\u7528\u7ad9\u5185\u5bfc\u822a\u67e5\u770b\u4ea7\u54c1\u548c\u65b9\u6848\u9875\uff0c\u6216\u76f4\u63a5\u5728\u8fd9\u91cc\u7ee7\u7eed\u63d0\u95ee\uff0c\u6211\u4f1a\u5e2e\u4f60\u628a\u4fe1\u606f\u6574\u7406\u5230\u7f51\u7ad9\u5bf9\u5e94\u529f\u80fd\u5165\u53e3\u3002"
                : lang === "ru"
                    ? "\u043c\u043e\u0436\u043d\u043e \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u044c \u043d\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044e \u0441\u0430\u0439\u0442\u0430 \u0434\u043b\u044f \u043f\u0435\u0440\u0435\u0445\u043e\u0434\u0430 \u043a \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u0430\u043c \u0438 \u0440\u0435\u0448\u0435\u043d\u0438\u044f\u043c, \u0438\u043b\u0438 \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c \u0432\u043e\u043f\u0440\u043e\u0441 \u0437\u0434\u0435\u0441\u044c, \u0430 \u044f \u0441\u0432\u044f\u0436\u0443 \u043e\u0442\u0432\u0435\u0442 \u0441 \u043d\u0443\u0436\u043d\u044b\u043c \u0440\u0430\u0437\u0434\u0435\u043b\u043e\u043c \u0441\u0430\u0439\u0442\u0430."
                    : "You can also use the site navigation to open product or solution pages, and keep asking here so I can connect you to the right site flow.";
        }

        function formatChatMessageBody(text, sender) {
            if (sender === "user") {
                return renderChatInlineText(text).replace(/\n/g, "<br>");
            }
            const blocks = parseChatMessageBlocks(text);
            if (!blocks.length) return "";
            return `<div class="ggx-chat-richtext">${blocks.map(function (block) {
                return renderChatMessageBlock(block);
            }).join("")}</div>`;
        }

        function buildChatSiteHintHtml(sender) {
            if (sender === "user") return "";
            const hint = getChatSiteHint();
            if (!hint) return "";
            const lang = normalizeLang(chatUiLang || getCurrentLang());
            const label = lang === "zh" ? "\u5c0f\u63d0\u793a\uff1a" : (lang === "ru" ? "\u041f\u043e\u0434\u0441\u043a\u0430\u0437\u043a\u0430:" : "Tip:");
            return `<div class="ggx-chat-hint"><div class="ggx-chat-hint-label">${escapeHtml(label)}</div><div class="ggx-chat-hint-body">${renderChatInlineText(hint)}</div></div>`;
        }

        function addMessage(text, sender, meta) {
            const container = document.createElement("div");
            const isUser = sender === "user";
            const safeText = formatChatMessageBody(text, sender);

            container.className = "flex flex-col " + (isUser ? "items-end" : "items-start") + " " + (isUser ? "max-w-[84%]" : "max-w-[92%]") + " space-y-0.5 w-full animate-[slideDown_0.3s_ease-out]";

            const labelHtml = isUser
                ? ""
                : "<div class=\"flex items-center gap-2 mb-1\"><span class=\"text-[10px] text-gas-green/80 ml-1 tracking-[0.12em] uppercase\">GasGx Assistant</span></div>";

            const bubbleClass = isUser
                ? "bg-gas-green text-black rounded-2xl rounded-tr-none font-medium shadow-[0_0_15px_rgba(93,214,44,0.2)]"
                : "ggx-chat-bubble--assistant bg-[#151817] text-gray-100 rounded-2xl rounded-tl-none border border-gas-green/12 shadow-[0_10px_28px_rgba(0,0,0,0.24)]";

            container.innerHTML =
                labelHtml +
                "<div class=\"" + bubbleClass + " px-3.5 py-2.5 text-[13px] leading-6 break-words\">" + safeText + buildMessageMeta(meta) + buildChatSiteHintHtml(sender) + "</div>" +
                "<span class=\"text-[9px] text-gray-600 mt-0.5\">" + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + "</span>";

            messagesContainer.appendChild(container);
            scrollToBottom();
        }

        function rememberChatTurn(role, content) {
            const safeRole = role === "assistant" ? "assistant" : "user";
            const safeContent = typeof content === "string" ? content.trim() : "";
            if (!safeContent) return;
            conversationHistory.push({ role: safeRole, content: safeContent });
            if (conversationHistory.length > 8) {
                conversationHistory.splice(0, conversationHistory.length - 8);
            }
        }

        function inferChatMessageLanguage(messageText) {
            if (/[\u4e00-\u9fff]/.test(messageText || "")) return "zh";
            if (/[\u0400-\u04FF]/.test(messageText || "")) return "ru";
            if (/[A-Za-z]/.test(messageText || "")) return "en";
            return getCurrentLang();
        }

        function getChatPayload(messageText) {
            const messageLang = inferChatMessageLanguage(messageText);
            chatUiLang = messageLang;
            return {
                message: messageText,
                sessionId: getChatSessionId(),
                language: messageLang,
                history: conversationHistory.slice(-8),
                pageContext: {
                    title: document.title || "",
                    path: window.location.pathname || "",
                    url: window.location.href || "",
                    lang: messageLang
                }
            };
        }

        function getChatFailureMessage() {
            const lang = normalizeLang(chatUiLang || getCurrentLang());
            return lang === "zh"
                ? "GasGx \u667a\u80fd\u987e\u95ee\u6682\u65f6\u6ca1\u6709\u8fde\u4e0a\u3002\u8bf7\u7a0d\u540e\u91cd\u8bd5\uff0c\u6216\u76f4\u63a5\u8054\u7cfb contact@gasgx.com\u3002"
                : lang === "ru"
                    ? "GasGx Assistant \u0432\u0440\u0435\u043c\u0435\u043d\u043d\u043e \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u043f\u043e\u0437\u0436\u0435 \u0438\u043b\u0438 \u043d\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u043d\u0430 contact@gasgx.com."
                    : "GasGx Assistant is temporarily unavailable. Please try again later or contact contact@gasgx.com.";
        }
        async function sendMessage() {
            const text = userInput.value.trim();
            if (!text) return;

            addMessage(text, "user");
            userInput.value = "";
            loadingIndicator.classList.remove("hidden");
            sendBtn.disabled = true;

            try {
                const response = await fetch(chatApiUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        apikey: authConfig.supabaseKey || "",
                        Authorization: `Bearer ${authConfig.supabaseKey || ""}`
                    },
                    body: JSON.stringify(getChatPayload(text))
                });

                if (!response.ok) {
                    throw new Error(`chat_http_${response.status}`);
                }
                const data = await response.json();
                const replyText = (data && data.reply) || "No response payload.";
                rememberChatTurn("user", text);
                rememberChatTurn("assistant", replyText);
                addMessage(replyText, "bot", {
                    sources: data && data.sources,
                    handoff: data && data.handoff
                });
            } catch (error) {
                console.error("Chat Error:", error);
                addMessage(getChatFailureMessage(), "bot");
            } finally {
                loadingIndicator.classList.add("hidden");
                sendBtn.disabled = false;
                userInput.focus();
            }
        }

        toggleBtn.addEventListener("click", function () {
            if (isChatDocked) {
                setChatDocked(false);
            }
            setChatOpen(!isChatOpen);
        });

        if (dockBtn) {
            dockBtn.addEventListener("click", function () {
                setChatDocked(true);
            });
        }

        if (undockBtn) {
            undockBtn.addEventListener("click", function () {
                setChatDocked(false);
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", function () {
                setChatOpen(false);
            });
        }

        sendBtn.addEventListener("click", function () {
            sendMessage();
        });

        userInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                sendMessage();
            }
        });

        try {
            setChatDocked(window.localStorage.getItem(dockStorageKey) === "1");
        } catch (error) {
            setChatDocked(false);
        }

        wrapper.dataset.ggxBound = "1";
    }

    function shouldShowMobilePageLoader() {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return false;
        }
        return window.matchMedia("(max-width: 767px)").matches;
    }

    function ensureMobilePageLoader() {
        if (!shouldShowMobilePageLoader() || !shouldAutoMountShell()) {
            return null;
        }

        let loader = document.getElementById("ggx-mobile-page-loader");
        if (!loader) {
            loader = document.createElement("div");
            loader.id = "ggx-mobile-page-loader";
            loader.setAttribute("role", "status");
            loader.setAttribute("aria-live", "polite");
            loader.innerHTML = '<div class="ggx-mobile-page-loader-spinner" aria-hidden="true"></div><span class="ggx-mobile-page-loader-text">Loading...</span>';
            document.body.appendChild(loader);
        }
        loader.dataset.ggxVisible = "1";
        return loader;
    }

    function hideMobilePageLoader() {
        const loader = document.getElementById("ggx-mobile-page-loader");
        if (!loader) return;
        loader.dataset.ggxVisible = "0";
        window.setTimeout(function () {
            if (loader.dataset.ggxVisible === "0") {
                loader.remove();
            }
        }, 240);
    }

    function bindMobilePageLoaderLifecycle() {
        const loader = ensureMobilePageLoader();
        if (!loader || loader.dataset.ggxLifecycleBound === "1") {
            return;
        }

        loader.dataset.ggxLifecycleBound = "1";
        if (document.readyState === "complete") {
            window.requestAnimationFrame(hideMobilePageLoader);
        } else {
            window.addEventListener("load", hideMobilePageLoader, { once: true });
            window.setTimeout(hideMobilePageLoader, 8000);
        }
    }

    function mountShellNow() {
        if (state.mounted) {
            ensureMainAuthBridge();
            runAppIntegrationHooks();
            syncPageAppLanguage(getCurrentLang());
            refreshShellNavigation(true);
            syncLanguageSwitcherVisibility();
            syncLanguageUI(getCurrentLang());
            syncPublishedSiteShellConfig();
            mountCookieConsentBanner();
            window.setTimeout(function () {
                runAppIntegrationHooks();
                syncPageAppLanguage(getCurrentLang());
                refreshShellNavigation(true);
                syncLanguageUI(getCurrentLang());
            }, 0);
            return;
        }

        mountSlot("ggx-site-header-slot", HEADER_TEMPLATE);
        mountSlot("ggx-site-footer-slot", buildFooterTemplate());
        syncSiteBrandUI();
        syncRuntimeFeatureSlots();
        syncLanguageSwitcherVisibility();

        ensureMainAuthBridge();
        bindActionDelegation();
        runAppIntegrationHooks();
        const initialLang = getCurrentLang();
        syncPageAppLanguage(initialLang);
        refreshShellNavigation(true);
        syncLanguageUI(initialLang);
        state.mounted = true;
        mountCookieConsentBanner();

        document.dispatchEvent(new CustomEvent("gasgx:shared-ui-ready"));

        syncPublishedSiteShellConfig();

        // Let page scripts finish their own init first, then re-apply shared nav/footer once.
        window.setTimeout(function () {
            runAppIntegrationHooks();
            syncPageAppLanguage(getCurrentLang());
            refreshShellNavigation(true);
            syncLanguageUI(getCurrentLang());
            syncPublishedSiteShellConfig();
            mountCookieConsentBanner();
        }, 0);
    }

    function mount() {
        if (state.mounted) {
            mountShellNow();
            return;
        }

        if (state.mountPromise) {
            return state.mountPromise;
        }

        state.mountPromise = applyInitialPublishedSiteShellConfig()
            .then(() => {
                mountShellNow();
            })
            .finally(() => {
                state.mountPromise = null;
            });

        return state.mountPromise;
    }

    function ensureFooterOnlySlot(container) {
        const host = typeof container === "string"
            ? document.getElementById(container)
            : container;

        if (!host || typeof host !== "object") {
            return null;
        }

        if (host.id === "ggx-site-footer-slot") {
            return host;
        }

        // Safety guard: only allow the dedicated news footer host to be wrapped.
        // Never rewrite arbitrary containers (it can wipe page content).
        if (host.id !== "ggx-footer-slot") {
            return host.querySelector("#ggx-site-footer-slot") || null;
        }

        let slot = host.querySelector("#ggx-site-footer-slot");
        if (slot) {
            return slot;
        }

        host.innerHTML = '<div id="ggx-site-footer-slot"></div>';
        return host.querySelector("#ggx-site-footer-slot");
    }

    function renderFooterOnlySlot() {
        mountSlot("ggx-site-footer-slot", buildFooterTemplate());
        refreshShellNavigation(true);
        syncLanguageUI(getCurrentLang());
    }

    function mountFooter(container) {
        const slot = ensureFooterOnlySlot(container);
        if (!slot) {
            return null;
        }

        bindActionDelegation();
        renderFooterOnlySlot();
        mountCookieConsentBanner();

        fetchPublishedSiteShellConfig()
            .then((config) => {
                if (!config) return null;
                applySiteShellConfig(config);
                renderFooterOnlySlot();
                mountCookieConsentBanner();
                document.dispatchEvent(new CustomEvent("gasgx:site-shell-config-updated"));
                return config;
            })
            .catch(() => null);

        return slot;
    }

    window.GasGxSharedUI = {
        __initialized: true,
        get mounted() {
            return state.mounted;
        },
        callApp: callApp,
        mount: mount,
        mountFooter: mountFooter,
        refreshNavigation: refreshShellNavigation,
        reloadShellConfig: syncPublishedSiteShellConfig,
        syncLanguageUI: syncLanguageUI,
        initBackToTop: initBackToTop,
        initChatbot: initChatbot,
        ensureMainAuthBridge: ensureMainAuthBridge,
        resolveAvatarUriByKey: resolveAvatarUriByKey,
        avatarPresetKeys: Object.keys(MAIN_AUTH_AVATAR_PRESETS)
    };

    function shouldAutoMountShell() {
        return !!document.getElementById("ggx-site-header-slot");
    }

    if (document.readyState === "loading") {
        if (shouldAutoMountShell()) {
            bindMobilePageLoaderLifecycle();
            mount();
        } else {
            mountCookieConsentBanner();
        }
        document.addEventListener("DOMContentLoaded", function () {
            if (shouldAutoMountShell()) {
                bindMobilePageLoaderLifecycle();
                mount();
            } else {
                mountCookieConsentBanner();
            }
        }, { once: true });
    } else {
        if (shouldAutoMountShell()) {
            bindMobilePageLoaderLifecycle();
            mount();
        } else {
            mountCookieConsentBanner();
        }
    }
})();
