(function () {
    "use strict";

    if (window.GasGxSharedUI && window.GasGxSharedUI.__initialized) {
        return;
    }

    const DEFAULT_CHAT_API_URL = "http://localhost:8000/chat";
    const SUPABASE_SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    const MAIN_AUTH_DEFAULTS = Object.freeze({
        storageKey: "gasgx-main-auth",
        signInUrl: "/account/user.html",
        accountUrl: "/account/account.html",
        signOutRedirectUrl: "/account/user.html",
        returnUrlStorageKey: "gx_main_return_url",
        supabaseUrl: "https://mkpcliytqudclkwtewru.supabase.co",
        supabaseKey: "sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw",
        providerRollout: {
            twitter: false,
            linkedin: false
        }
    });
    const SITE_SHELL_CONFIG_TABLE = "site_shell_configs";
    const SITE_SHELL_CONFIG_SCOPE = "global";
    const MAIN_AUTH_FALLBACK_AVATAR = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2232%22 fill=%22%23121812%22/%3E%3Cpath d=%22M32 33c7.18 0 13-5.82 13-13S39.18 7 32 7 19 12.82 19 20s5.82 13 13 13Zm0 4c-9.94 0-18 6.27-18 14v2h36v-2c0-7.73-8.06-14-18-14Z%22 fill=%22%235DD62C%22/%3E%3C/svg%3E";
    const SHARED_TEXT = {
        en: {
            tagline: "Natural Gas Power Mining Assistant",
            footerTagline: "Making natural gas power mining easier",
            strategicPartners: "Strategic Partners",
            authLogin: "Login",
            authLogout: "Logout",
            contactUs: "Contact Us",
            account: "Account",
            welcome: "Welcome,",
            privacyPolicy: "Privacy Policy",
            languageEnglish: "English",
            languageChinese: "简体中文"
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
            languageEnglish: "English",
            languageChinese: "简体中文"
        }
    };

    const HEADER_TEMPLATE = `
<header class="fixed top-0 w-full z-[300] gas-card h-16 transition-all duration-300">
    <div class="max-w-[1800px] mx-auto px-4 h-full flex justify-between items-center relative">
        <div class="flex flex-col justify-center gap-0.5 w-auto shrink-0 mr-2 xl:mr-4 leading-none">
            <a id="ggx-header-home-link" href="/index.html" class="group">
                <h1 id="ggx-header-brand-text" class="text-xl md:text-2xl font-bold tracking-wider text-gas-green hover:text-white transition-colors cursor-pointer">GasGx</h1>
            </a>
            <span id="header-tagline" class="block text-gas-green text-[8px] sm:text-[9px] xl:text-[10px] font-bold tracking-wide leading-tight max-w-[240px] truncate">Natural Gas Power Mining Assistant</span>
        </div>

        <nav id="desktop-nav" class="hidden xl:flex items-center justify-start 2xl:justify-center gap-1 xl:gap-2 2xl:gap-6 h-full flex-1 min-w-0 px-1"></nav>

        <div class="flex items-center gap-2 xl:gap-4 w-auto shrink-0 justify-end ml-2 xl:ml-4">
            <div class="hidden md:flex relative items-center">
                <button id="auth-login-btn" data-ggx-action="auth-sign-in" class="flex items-center gap-2 text-xs font-bold text-black bg-gas-green hover:bg-white transition-all rounded-full px-4 py-1.5 shadow-glow hover:shadow-glow-strong transform hover:scale-105 active:scale-95">
                    <i class="fa-brands fa-google"></i>
                    <span data-ggx-text="auth-login">Login</span>
                </button>
                <div id="auth-user-profile" class="hidden items-center gap-2 cursor-pointer group relative h-full">
                    <div class="relative py-3">
                        <img id="auth-user-avatar" src="" alt="User" class="w-9 h-9 rounded-full border-2 border-gas-green p-0.5 transition-transform group-hover:scale-105">
                        <div class="absolute bottom-3 right-0 w-2.5 h-2.5 bg-gas-green rounded-full border-2 border-[#151515]"></div>
                    </div>
                    <div class="absolute right-0 top-full pt-1 w-48 hidden group-hover:block z-[60]">
                        <div class="bg-[#151515] border border-white/10 rounded-xl shadow-2xl py-2 mt-1">
                            <div class="px-4 py-2 border-b border-white/5 mb-1">
                                <span data-ggx-text="account" class="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Account</span>
                                <div id="dropdown-username" class="text-xs text-white font-bold truncate mt-1">User</div>
                            </div>
                            <button data-ggx-action="auth-sign-out" class="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-gas-green hover:bg-white/5 transition-colors flex items-center">
                                <i class="fa-solid fa-right-from-bracket mr-2"></i> <span data-ggx-text="auth-logout">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="hidden sm:flex items-center">
                <div id="ggx-lang-picker" class="ggx-lang-picker">
                    <button id="lang-menu-btn" data-ggx-action="toggle-lang-menu" class="ggx-lang-trigger" title="Language" aria-label="Language menu" aria-expanded="false" aria-haspopup="true">
                        <span class="ggx-lang-globe" aria-hidden="true"></span>
                    </button>
                    <div id="ggx-lang-dropdown" class="ggx-lang-dropdown hidden">
                        <button id="ggx-btn-lang-en" data-ggx-action="set-lang" data-ggx-lang="en" class="ggx-lang-option is-active">English</button>
                        <button id="ggx-btn-lang-zh" data-ggx-action="set-lang" data-ggx-lang="zh" class="ggx-lang-option">简体中文</button>
                    </div>
                </div>
            </div>

            <button id="mobile-menu-btn" data-ggx-action="toggle-mobile-menu" class="xl:hidden p-2 text-white hover:text-gas-green text-xl focus:outline-none z-50 relative" aria-label="Toggle mobile menu">
                <i class="fa-solid fa-bars"></i>
            </button>
        </div>
    </div>
</header>

<div id="mobile-menu-container" class="fixed inset-0 z-[250] bg-[#111] transform translate-x-full pt-20 px-4 pb-8 overflow-y-auto xl:hidden">
    <div class="flex justify-center mb-6 border-b border-white/10 pb-4">
        <div class="ggx-lang-switch ggx-lang-switch-mobile">
            <button id="ggx-mob-lang-en" data-ggx-action="set-lang" data-ggx-lang="en" class="ggx-lang-btn ggx-lang-btn-mobile text-gas-green font-semibold">EN</button>
            <span class="ggx-lang-sep">/</span>
            <button id="ggx-mob-lang-zh" data-ggx-action="set-lang" data-ggx-lang="zh" class="ggx-lang-btn ggx-lang-btn-mobile text-gray-400">中文</button>
        </div>
    </div>
    <div class="mb-6 border-b border-white/10 pb-4 flex justify-center">
         <button id="mob-auth-login-btn" data-ggx-action="auth-sign-in" class="w-full max-w-xs py-3 rounded-lg bg-gas-green text-black font-bold flex items-center justify-center gap-2 shadow-glow">
            <i class="fa-brands fa-google"></i>
            <span data-ggx-text="auth-login">Login</span>
        </button>
         <div id="mob-auth-user-profile" class="hidden flex items-center justify-between w-full max-w-xs px-2">
            <div class="flex items-center gap-3">
                 <img id="mob-auth-user-avatar" src="" alt="User avatar" class="w-10 h-10 rounded-full border border-gas-green">
                 <div class="flex flex-col">
                     <span data-ggx-text="welcome" class="text-xs text-gray-400">Welcome,</span>
                     <span id="mob-auth-username" class="text-sm text-white font-bold">User</span>
                 </div>
            </div>
            <button data-ggx-action="auth-sign-out" class="text-xs text-red-400 hover:text-red-300 border border-red-900/50 bg-red-900/20 px-3 py-1.5 rounded">
                <span data-ggx-text="auth-logout">Logout</span>
            </button>
         </div>
    </div>
    <nav id="mobile-nav-content" class="flex flex-col space-y-1"></nav>
</div>`;

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
                        zh: "总分排行",
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
                contactEmail: "contact@gasgx.com"
            }
        },
        site: {
            brand: {
                name: "GasGx",
                homeHref: "/index.html",
                footerMeta: "Energy-compute infrastructure for mining operators.",
                copyright: "© 2026 GasGx. All rights reserved."
            },
            features: {
                backToTopEnabled: true,
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

    const BACK_TO_TOP_TEMPLATE = `
<button id="backToTopBtn" class="fixed bottom-60 right-6 bg-gas-green text-black w-10 h-10 rounded-full shadow-[0_0_15px_rgba(93,214,44,0.5)] flex items-center justify-center translate-y-20 opacity-0 transition-all duration-300 hover:scale-110 z-40 cursor-pointer" aria-label="Back to top">
    <i class="fa-solid fa-arrow-up"></i>
</button>`;

    const CHATBOT_TEMPLATE = `
<div id="ggx-chat-wrapper" class="fixed bottom-44 right-5 z-[88] flex flex-col items-end font-sans font-inter">
    <div id="ggx-chat-window" class="hidden flex flex-col w-[320px] md:w-[360px] h-[460px] max-h-[75vh] bg-[#101214]/92 backdrop-blur-xl border border-white/12 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.45)] overflow-hidden transition-all duration-300 origin-bottom-right transform scale-95 opacity-0 mb-3">
        <div class="bg-[#0d0f10]/85 p-4 flex justify-between items-center border-b border-white/8 z-10 shrink-0">
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
            <button id="ggx-chat-close-btn" class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors" aria-label="Close chat window">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div id="ggx-chat-messages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0c0e0f]/95 min-h-0 scroll-smooth">
            <div class="text-center mb-2">
                <span class="text-[10px] text-gray-600 bg-[#17191a] px-2 py-1 rounded-full">Today</span>
            </div>
            <div class="flex flex-col items-start max-w-[85%] space-y-1">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-[10px] text-gray-500 ml-1">GasGx Bot</span>
                </div>
                <div class="bg-[#1b1d1f] text-gray-200 px-4 py-3 rounded-2xl rounded-tl-none text-sm border border-white/8 shadow-sm leading-relaxed">
                    Hello! I am your GasGx Power Assistant.<br><br>
                    Ask me about:
                    <ul class="list-disc pl-4 mt-1 text-gray-400">
                        <li>Generator Power Sizing</li>
                        <li>Crypto Mining Solutions</li>
                        <li>Gas Consumption Costs</li>
                    </ul>
                </div>
            </div>
        </div>

        <div id="ggx-chat-loading" class="hidden px-4 pb-2 bg-[#0c0e0f]/95 shrink-0">
            <div class="flex items-center gap-2 text-gas-green bg-[#161a18] w-fit px-3 py-1.5 rounded-full text-xs border border-gas-green/20">
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                <span>Thinking...</span>
            </div>
        </div>

        <div class="p-3 bg-[#0d0f10]/90 border-t border-white/8 shrink-0">
            <div class="relative flex items-center gap-2">
                <input type="text" id="ggx-chat-user-input" class="flex-1 bg-[#17191b] border border-white/12 rounded-full pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-gas-green/60 transition-all placeholder-gray-600" placeholder="Type a question..." autocomplete="off">
                <button id="ggx-chat-send-btn" class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#121915] border border-gas-green/40 rounded-full flex items-center justify-center text-gas-green hover:border-gas-green hover:bg-[#162019] transition-all cursor-pointer" aria-label="Send chat message">
                    <i class="fa-solid fa-paper-plane text-xs"></i>
                </button>
            </div>
            <div class="text-center mt-2">
                <p class="text-[9px] text-gray-600">AI Powered by GasGx Engine Database</p>
            </div>
        </div>
    </div>

    <div class="flex items-center gap-2">
        <button id="ggx-chat-dock-btn" class="w-8 h-8 rounded-full bg-[#0e1210]/88 border border-white/10 text-gray-400 hover:text-white hover:border-gas-green/45 transition-colors flex items-center justify-center" aria-label="Hide chat to right side">
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
        actionBound: false
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

    function isSiteShellVisible(item) {
        return !!item && item.visible !== false && item.hidden !== true;
    }

    function filterVisibleItems(items) {
        return Array.isArray(items) ? items.filter(isSiteShellVisible) : [];
    }

    function mergeLocalizedBlock(baseBlock, sourceBlock) {
        const base = baseBlock && typeof baseBlock === "object" ? baseBlock : {};
        const source = sourceBlock && typeof sourceBlock === "object" ? sourceBlock : {};
        return Object.assign({}, base, source, {
            en: Object.assign({}, base.en || {}, source.en || {}),
            zh: Object.assign({}, base.zh || {}, source.zh || {})
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
                }
            })
        });
    }

    function mergeSiteShellConfig(baseConfig, sourceConfig) {
        const base = baseConfig && typeof baseConfig === "object" ? cloneSiteShellValue(baseConfig) : {};
        const source = sourceConfig && typeof sourceConfig === "object" ? sourceConfig : {};
        return Object.assign({}, base, source, {
            navigation: Array.isArray(source.navigation) ? cloneSiteShellValue(source.navigation) : (Array.isArray(base.navigation) ? cloneSiteShellValue(base.navigation) : []),
            sharedText: mergeLocalizedBlock(base.sharedText, source.sharedText),
            pages: mergePagesConfig(base.pages, source.pages),
            site: mergeSiteConfig(base.site, source.site),
            footer: Object.assign({}, base.footer || {}, source.footer || {})
        });
    }

    function applySiteShellConfig(config) {
        if (!config || typeof config !== "object") return;
        window.GASGX_SITE_SHELL_CONFIG = mergeSiteShellConfig(DEFAULT_SITE_SHELL_CONFIG, config);
    }

    function getSiteShellConfig() {
        const config = window.GASGX_SITE_SHELL_CONFIG;
        if (config && typeof config === "object") {
            return mergeSiteShellConfig(DEFAULT_SITE_SHELL_CONFIG, config);
        }
        return DEFAULT_SITE_SHELL_CONFIG;
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
        const mainAuthConfig = siteConfig && typeof siteConfig.mainAuth === "object"
            ? siteConfig.mainAuth
            : {};

        return Object.assign({}, runtimeConfig, {
            backToTopEnabled: typeof featureConfig.backToTopEnabled === "boolean" ? featureConfig.backToTopEnabled : runtimeConfig.backToTopEnabled,
            chatbotEnabled: typeof featureConfig.chatbotEnabled === "boolean" ? featureConfig.chatbotEnabled : runtimeConfig.chatbotEnabled,
            chatApiUrl: typeof featureConfig.chatApiUrl === "string" && featureConfig.chatApiUrl.trim()
                ? featureConfig.chatApiUrl.trim()
                : runtimeConfig.chatApiUrl,
            mainAuth: Object.assign({}, runtimeConfig.mainAuth || {}, mainAuthConfig)
        });
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
        const headerLink = document.getElementById("ggx-header-home-link");
        if (headerLink && typeof brand.homeHref === "string" && brand.homeHref.trim()) {
            headerLink.setAttribute("href", brand.homeHref.trim());
        }

        const headerBrand = document.getElementById("ggx-header-brand-text");
        if (headerBrand && typeof brand.name === "string" && brand.name.trim()) {
            headerBrand.textContent = brand.name.trim();
        }
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

    function refreshShellStructure() {
        syncSiteBrandUI();
        mountSlot("ggx-site-footer-slot", buildFooterTemplate());
        syncRuntimeFeatureSlots();
        refreshShellNavigation(true);
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
            SHARED_TEXT.en,
            SHARED_TEXT[lang] || SHARED_TEXT.en,
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
        setSharedTextByKey("welcome", text.welcome);
        setSharedTextByKey("privacy-policy", text.privacyPolicy);

        const desktopLangEn = document.getElementById("ggx-btn-lang-en");
        if (desktopLangEn && typeof text.languageEnglish === "string") {
            desktopLangEn.textContent = text.languageEnglish;
        }

        const desktopLangZh = document.getElementById("ggx-btn-lang-zh");
        if (desktopLangZh && typeof text.languageChinese === "string") {
            desktopLangZh.textContent = text.languageChinese;
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
                        <span class="nav-item-link font-medium text-sm"><span>${title}</span> <i class="fa-solid fa-chevron-down text-[10px] ml-1"></i></span>
                        ${dropContent}
                    </div>
                `;
            }

            if ((itemType === "menu" || children.length) && children.length) {
                const isRightAligned = index >= navigation.length - 3;
                const childrenHtml = children.map((child) => {
                    const childTitle = escapeHtml(getLabelValue(child && child.title, lang));
                    const childPath = escapeHtml(normalizePath(child && child.path));
                    return `<a href="${childPath}" class="block px-4 py-2 text-sm text-gray-400 hover:text-gas-green hover:bg-white/5 whitespace-nowrap">${childTitle}</a>`;
                }).join("");

                return `
                    <div class="group h-full flex items-center cursor-pointer relative">
                        <span class="nav-item-link font-medium text-sm"><span>${title}</span> <i class="fa-solid fa-chevron-down text-[10px] ml-1"></i></span>
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
                    <a href="${itemPath}" class="block py-4 border-b border-white/10 text-lg font-medium hover:text-gas-green">
                        ${title}
                    </a>
                `;
            }

            const subId = `ggx-mobile-submenu-${index}`;
            let childLinks = "";
            if (itemType === "menu") {
                childLinks = children.map((child) => {
                    const childTitle = escapeHtml(getLabelValue(child && child.title, lang));
                    const childPath = escapeHtml(normalizePath(child && child.path));
                    return `<a href="${childPath}" class="block py-3 pl-4 text-gray-400 border-l border-white/10 ml-2 hover:text-gas-green hover:border-gas-green text-sm">${childTitle}</a>`;
                }).join("");
            } else {
                childLinks = visibleSections.map((section) => {
                    const header = escapeHtml(getLabelValue(section && section.header, lang));
                    const subItems = filterVisibleItems(section && section.items).map((subItem) => {
                        const subTitle = escapeHtml(getLabelValue(subItem && subItem.title, lang));
                        const subPath = escapeHtml(normalizePath(subItem && subItem.path));
                        return `<a href="${subPath}" class="block py-2 pl-6 text-gray-400 border-l border-white/10 ml-2 hover:text-gas-green hover:border-gas-green text-sm">${subTitle}</a>`;
                    }).join("");
                    return `<div class="py-2"><h4 class="text-gas-green text-xs font-bold uppercase mb-2 pl-4">${header}</h4>${subItems}</div>`;
                }).join("");
            }

            return `
                <div class="border-b border-white/10">
                    <button class="w-full py-4 flex justify-between items-center text-lg font-medium hover:text-gas-green focus:outline-none" data-ggx-action="toggle-mobile-submenu" data-ggx-target="${subId}" aria-label="Toggle submenu">
                        <span>${title}</span>
                        <i class="fa-solid fa-chevron-down text-sm transition-transform duration-300"></i>
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
        });

        document.querySelectorAll("#ggx-site-header-slot .ggx-lang-btn-mobile").forEach((button) => {
            const active = button.dataset.ggxLang === lang;
            button.classList.toggle("text-gas-green", active);
            button.classList.toggle("font-semibold", active);
            button.classList.toggle("text-gray-400", !active);
        });

        if (document.documentElement) {
            document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
        }

        applySharedText(lang);
    }

    function setLanguageFromShell(langCandidate) {
        const lang = normalizeLang(langCandidate);
        persistLang(lang);

        const app = window.app;
        if (app && typeof app.setLanguage === "function") {
            app.setLanguage(lang);
        } else {
            document.dispatchEvent(new CustomEvent("gasgx:lang-changed", { detail: { lang: lang } }));
        }

        syncLanguageUI(lang);
        window.setTimeout(function () {
            refreshShellNavigation(true);
            syncLanguageUI(lang);
        }, 0);
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
        app.setLanguage = function (langValue) {
            const normalizedLang = normalizeLang(langValue || getCurrentLang());
            const result = originalSetLanguage(normalizedLang);
            persistLang(normalizedLang);
            refreshShellNavigation(true);
            syncLanguageUI(normalizedLang);
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

    function toggleAccordionById(contentId, iconSelector, options) {
        if (!contentId) return;

        const content = document.getElementById(contentId);
        if (!content) return;

        const isOpen = content.style.maxHeight && content.style.maxHeight !== "0px";
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
        const pillHtml = `<span class="ggx-partner-pill">${escapeHtml(title)}</span>`;
        if (!href) {
            return `<span class="ggx-partner-entry">${pillHtml}</span>`;
        }

        const target = escapeHtml(item.target || "_blank");
        const rel = escapeHtml(item.rel || "noopener noreferrer");
        return `<a href="${escapeHtml(href)}" target="${target}" rel="${rel}" class="ggx-partner-entry" aria-label="${escapeHtml(title)}">${pillHtml}</a>`;
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
            ? `<div class="ggx-partner-block"><span class="ggx-partner-label">战略合作伙伴</span><div class="ggx-partner-grid">${partnerHtml}</div></div>`
            : "";

        return `
<footer class="bg-[#0a0a0a] border-t border-white/10 mt-auto pt-10 pb-8 relative z-10">
    <div class="max-w-[1800px] mx-auto px-6">
        <div class="flex flex-col md:flex-row justify-between items-start mb-8 pb-6 border-b border-white/5">
            <div class="mb-6 md:mb-0">
                <div class="flex items-center gap-2 mb-2"><a href="${escapeHtml(normalizePath(brandConfig.homeHref || "/index.html"))}" class="text-2xl font-bold text-gas-green hover:text-white transition-colors">${escapeHtml(brandConfig.name || "GasGx")}</a></div>
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
                        <a href="${escapeHtml(normalizePath(brandConfig.homeHref || "/index.html"))}" class="ggx-footer-logo" aria-label="${escapeHtml((brandConfig.name || "GasGx") + " Home")}">${escapeHtml(brandConfig.name || "GasGx")}</a>
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
            signOutRedirectUrl: pickString("signOutRedirectUrl", MAIN_AUTH_DEFAULTS.signOutRedirectUrl),
            returnUrlStorageKey: pickString("returnUrlStorageKey", MAIN_AUTH_DEFAULTS.returnUrlStorageKey),
            supabaseUrl: pickString("supabaseUrl", MAIN_AUTH_DEFAULTS.supabaseUrl),
            supabaseKey: pickString("supabaseKey", MAIN_AUTH_DEFAULTS.supabaseKey),
            providerRollout: {
                twitter: Boolean(sourceConfig.providerRollout && sourceConfig.providerRollout.twitter === true),
                linkedin: Boolean(sourceConfig.providerRollout && sourceConfig.providerRollout.linkedin === true)
            }
        };
    }

    function getMainAuthElements() {
        return {
            loginBtn: document.getElementById("auth-login-btn"),
            userProfile: document.getElementById("auth-user-profile"),
            userAvatar: document.getElementById("auth-user-avatar"),
            dropdownUsername: document.getElementById("dropdown-username"),
            mobLoginBtn: document.getElementById("mob-auth-login-btn"),
            mobUserProfile: document.getElementById("mob-auth-user-profile"),
            mobUserAvatar: document.getElementById("mob-auth-user-avatar"),
            mobUsername: document.getElementById("mob-auth-username")
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

    function resolveMainAuthAvatar(user) {
        if (!user) return MAIN_AUTH_FALLBACK_AVATAR;
        const meta = user.user_metadata && typeof user.user_metadata === "object"
            ? user.user_metadata
            : {};
        return meta.avatar_url || meta.picture || MAIN_AUTH_FALLBACK_AVATAR;
    }

    function applyMainAuthState(user, displayName) {
        const els = getMainAuthElements();
        if (user) {
            setAuthElementVisibility(els.loginBtn, false);
            setAuthElementVisibility(els.userProfile, true);
            setAuthElementVisibility(els.mobLoginBtn, false);
            setAuthElementVisibility(els.mobUserProfile, true);

            const avatar = resolveMainAuthAvatar(user);
            if (els.userAvatar) els.userAvatar.src = avatar;
            if (els.mobUserAvatar) els.mobUserAvatar.src = avatar;
            if (els.dropdownUsername) els.dropdownUsername.textContent = displayName;
            if (els.mobUsername) els.mobUsername.textContent = displayName;
            return;
        }

        setAuthElementVisibility(els.loginBtn, true);
        setAuthElementVisibility(els.userProfile, false);
        setAuthElementVisibility(els.mobLoginBtn, true);
        setAuthElementVisibility(els.mobUserProfile, false);
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

    async function applyMainAuthUser(user) {
        authBridgeState.currentUser = user || null;
        if (!authBridgeState.currentUser) {
            applyMainAuthState(null, "Sign In");
            return;
        }

        const profileName = await fetchMainAuthProfileName(authBridgeState.currentUser.id);
        const displayName = resolveMainAuthDisplayName(authBridgeState.currentUser, profileName);
        applyMainAuthState(authBridgeState.currentUser, displayName);
    }

    function saveMainReturnUrl() {
        const config = authBridgeState.runtimeConfig || getMainAuthConfig();
        try {
            if (isNewsPath()) return;
            const pathname = String((window.location && window.location.pathname) || "/").toLowerCase();
            if (pathname.startsWith("/account/user")) return;
            if (pathname.startsWith("/account/account")) return;
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

    async function mainAuthBridgeSignOut() {
        if (isNewsPath()) return undefined;
        const config = authBridgeState.runtimeConfig || getMainAuthConfig();

        if (authBridgeState.client) {
            try {
                await authBridgeState.client.auth.signOut();
            } catch (error) {
                console.error("Main auth sign-out failed:", error);
            }
        }

        authBridgeState.currentUser = null;
        applyMainAuthState(null, "Sign In");
        window.location.href = config.signOutRedirectUrl;
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
            } else {
                backToTopBtn.classList.add("translate-y-20", "opacity-0");
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
        const chatApiUrl = typeof runtimeConfig.chatApiUrl === "string" && runtimeConfig.chatApiUrl.trim()
            ? runtimeConfig.chatApiUrl.trim()
            : DEFAULT_CHAT_API_URL;
        const dockStorageKey = "gasgx-chat-docked";

        let isChatOpen = false;
        let isChatDocked = false;

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

        function addMessage(text, sender) {
            const container = document.createElement("div");
            const isUser = sender === "user";
            const safeText = escapeHtml(text).replace(/\n/g, "<br>");

            container.className = "flex flex-col " + (isUser ? "items-end" : "items-start") + " max-w-[85%] space-y-1 w-full animate-[slideDown_0.3s_ease-out]";

            const labelHtml = isUser
                ? ""
                : "<div class=\"flex items-center gap-2 mb-1\"><span class=\"text-[10px] text-gray-500 ml-1\">GasGx Bot</span></div>";

            const bubbleClass = isUser
                ? "bg-gas-green text-black rounded-2xl rounded-tr-none font-medium shadow-[0_0_15px_rgba(93,214,44,0.2)]"
                : "bg-[#252525] text-gray-200 rounded-2xl rounded-tl-none border border-white/5";

            container.innerHTML =
                labelHtml +
                "<div class=\"" + bubbleClass + " px-4 py-2 text-sm leading-relaxed break-words\">" + safeText + "</div>" +
                "<span class=\"text-[9px] text-gray-600 mt-1\">" + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + "</span>";

            messagesContainer.appendChild(container);
            scrollToBottom();
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
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: text })
                });

                const data = await response.json();
                addMessage((data && data.reply) || "No response payload.", "bot");
            } catch (error) {
                console.error("Chat Error:", error);
                addMessage("Connection failed. Please check if the local Python server is running.", "bot");
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

    function mount() {
        if (state.mounted) {
            ensureMainAuthBridge();
            runAppIntegrationHooks();
            refreshShellNavigation(true);
            syncLanguageUI(getCurrentLang());
            syncPublishedSiteShellConfig();
            return;
        }

        mountSlot("ggx-site-header-slot", HEADER_TEMPLATE);
        mountSlot("ggx-site-footer-slot", buildFooterTemplate());
        syncSiteBrandUI();
        syncRuntimeFeatureSlots();

        ensureMainAuthBridge();
        bindActionDelegation();
        runAppIntegrationHooks();
        const initialLang = getCurrentLang();
        const app = window.app;
        if (app && typeof app.setLanguage === "function") {
            app.setLanguage(initialLang);
        }
        refreshShellNavigation(true);
        syncLanguageUI(initialLang);
        state.mounted = true;

        document.dispatchEvent(new CustomEvent("gasgx:shared-ui-ready"));

        syncPublishedSiteShellConfig();

        // Let page scripts finish their own init first, then re-apply shared nav/footer once.
        window.setTimeout(function () {
            runAppIntegrationHooks();
            refreshShellNavigation(true);
            syncLanguageUI(getCurrentLang());
            syncPublishedSiteShellConfig();
        }, 0);
    }

    window.GasGxSharedUI = {
        __initialized: true,
        get mounted() {
            return state.mounted;
        },
        callApp: callApp,
        mount: mount,
        refreshNavigation: refreshShellNavigation,
        reloadShellConfig: syncPublishedSiteShellConfig,
        syncLanguageUI: syncLanguageUI,
        initBackToTop: initBackToTop,
        initChatbot: initChatbot,
        ensureMainAuthBridge: ensureMainAuthBridge
    };

    if (document.readyState === "loading") {
        if (document.getElementById("ggx-site-header-slot")) {
            mount();
        }
        document.addEventListener("DOMContentLoaded", function () {
            mount();
        }, { once: true });
    } else {
        mount();
    }
})();
