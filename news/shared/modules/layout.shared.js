function mobileToggleExpr(appGlobal) {
    return `window.${appGlobal} && window.${appGlobal}.toggleMobileMenu()`;
}

const AUTH_DEFAULT_AVATAR_KEY = 'pixel-01';
const AUTH_AVATAR_PRESETS = Object.freeze({
    'pixel-01': { bg: '#0d1410', panel: '#213429', accent: '#5DD62C', eye: '#dfffd1' },
    'pixel-02': { bg: '#131126', panel: '#2a2450', accent: '#8a7bff', eye: '#e4dcff' },
    'pixel-03': { bg: '#101922', panel: '#1e3448', accent: '#45d6ff', eye: '#d0f7ff' },
    'pixel-04': { bg: '#18120b', panel: '#3e2a16', accent: '#ffb347', eye: '#ffe8bf' },
    'pixel-05': { bg: '#1c0f15', panel: '#4a1f34', accent: '#ff6fa8', eye: '#ffd6e8' },
    'pixel-06': { bg: '#0f1915', panel: '#204534', accent: '#46dd97', eye: '#cbffe8' },
    'pixel-07': { bg: '#151515', panel: '#2a2a2a', accent: '#f4f4f4', eye: '#ffffff' },
    'pixel-08': { bg: '#12160c', panel: '#33461f', accent: '#b9ff52', eye: '#eeffcf' },
    'pixel-09': { bg: '#16111a', panel: '#3b2550', accent: '#d77dff', eye: '#f3d9ff' },
    'pixel-10': { bg: '#11141d', panel: '#1f2b46', accent: '#7fa8ff', eye: '#dce8ff' }
});

function buildPixelAvatarDataUri(preset) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" shape-rendering="crispEdges"><rect width="64" height="64" rx="14" fill="${preset.bg}"/><rect x="14" y="12" width="36" height="32" fill="${preset.panel}"/><rect x="22" y="22" width="6" height="6" fill="${preset.eye}"/><rect x="36" y="22" width="6" height="6" fill="${preset.eye}"/><rect x="26" y="32" width="12" height="4" fill="${preset.accent}"/><rect x="18" y="46" width="28" height="10" fill="${preset.accent}" opacity="0.95"/></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function resolveAuthAvatarByKey(key) {
    const normalized = String(key || '').trim().toLowerCase();
    if (window.GasGxSharedUI && typeof window.GasGxSharedUI.resolveAvatarUriByKey === 'function') {
        return window.GasGxSharedUI.resolveAvatarUriByKey(normalized || AUTH_DEFAULT_AVATAR_KEY);
    }
    const preset = AUTH_AVATAR_PRESETS[normalized] || AUTH_AVATAR_PRESETS[AUTH_DEFAULT_AVATAR_KEY];
    return buildPixelAvatarDataUri(preset);
}

const AUTH_FALLBACK_AVATAR = resolveAuthAvatarByKey(AUTH_DEFAULT_AVATAR_KEY);

function resolveAuthAvatar(currentUser) {
    if (!currentUser || typeof currentUser !== 'object') return AUTH_FALLBACK_AVATAR;
    const meta = currentUser.user_metadata && typeof currentUser.user_metadata === 'object'
        ? currentUser.user_metadata
        : {};
    const rawAvatarKey = meta?.preferences?.avatarKey || meta?.avatar_key;
    if (rawAvatarKey) {
        const avatarKey = String(rawAvatarKey).trim().toLowerCase();
        return resolveAuthAvatarByKey(avatarKey);
    }
    const raw = meta.avatar_url || meta.picture;
    return typeof raw === 'string' && raw.trim() ? raw.trim() : AUTH_FALLBACK_AVATAR;
}

function renderLoggedOutAuthLink(signInUrl) {
    return `
        <a href="${escapeHtml(signInUrl)}" class="flex items-center gap-2 text-xs font-bold text-black bg-gas-green hover:bg-white transition-all rounded-full px-4 py-1.5 shadow-neon">
            <i class="fa-brands fa-google"></i>
            <span>Login</span>
        </a>
    `;
}

function renderLoggedInDesktopAuth({ accountUrl, ordersUrl, safeName, avatarUrl }) {
    const safeAccountUrl = escapeHtml(accountUrl);
    const safeOrdersUrl = escapeHtml(ordersUrl);
    const safeAvatarUrl = escapeHtml(avatarUrl);
    return `
        <div class="flex items-center gap-2 cursor-pointer group relative h-full">
            <a href="${safeAccountUrl}" class="relative py-3" aria-label="Open account">
                <img src="${safeAvatarUrl}" alt="${safeName}" class="w-5 h-5 rounded-full border border-gas-green p-0 transition-transform group-hover:scale-105 image-rendering-pixelated">
                <div class="absolute bottom-2 right-0 w-2 h-2 bg-gas-green rounded-full border border-[#151515]"></div>
            </a>
            <div class="absolute right-0 top-full pt-1 w-48 hidden group-hover:block z-[60]">
                <div class="bg-[#151515] border border-white/10 rounded-xl shadow-2xl py-2 mt-1">
                    <div class="px-4 py-2 border-b border-white/5 mb-1">
                        <span class="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Account</span>
                        <div class="text-xs text-white font-bold truncate mt-1">${safeName}</div>
                    </div>
                    <a href="${safeOrdersUrl}" class="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-gas-green hover:bg-white/5 transition-colors flex items-center border-b border-white/5 mb-1">
                        <i class="fa-solid fa-diagram-project mr-2"></i><span>Orders</span>
                    </a>
                    <button type="button" onclick="window.GGXNewsAuthSignOut && window.GGXNewsAuthSignOut()" class="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-red-400 hover:bg-white/5 transition-colors flex items-center">
                        <i class="fa-solid fa-right-from-bracket mr-2"></i><span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderMobileAuthLink({ isLogged, targetUrl, safeName }) {
    const iconClass = isLogged ? 'fa-user' : 'fa-right-to-bracket';
    const accentClass = isLogged
        ? 'text-gas-green border-gas-green/30 bg-gas-green/10 hover:bg-gas-green hover:text-black'
        : 'text-black bg-gas-green hover:bg-white border-transparent';
    return `
        <a href="${escapeHtml(targetUrl)}" class="flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-full transition-all max-w-[140px] border ${accentClass}" aria-label="${isLogged ? 'Account' : 'Sign In'}">
            <i class="fa-solid ${iconClass}"></i>
            <span class="truncate">${safeName}</span>
        </a>
    `;
}

function renderNewsHomeHeader({ idPrefix, appGlobal }) {
    const onToggle = mobileToggleExpr(appGlobal);
    return `
    <section class="gsh-header-shell">
        <header class="fixed top-0 w-full z-50 gsh-header-glass h-16">
            <div class="max-w-[1600px] mx-auto px-4 lg:px-6 h-full flex justify-between items-center">
                <div class="flex items-center gap-8 h-full">
                    <a href="/news/index.html" class="flex items-center gap-1 group" aria-label="GasGx News Home">
                        <div class="flex flex-col justify-center -space-y-1">
                            <span class="text-2xl font-bold italic text-white tracking-tighter font-header group-hover:text-gas-green transition-colors">GasGx</span>
                            <span class="text-[9px] font-bold text-gas-green tracking-[0.2em] uppercase leading-none pl-0.5">MINING NEWS</span>
                        </div>
                    </a>

                    <nav id="${idPrefix}-desktop-nav" class="hidden lg:flex items-center gap-1 h-full pl-6 border-l border-white/5 ml-4"></nav>
                </div>

                <div class="flex items-center gap-3 md:gap-4">
                    <div id="${idPrefix}-auth-btn-container" class="hidden lg:block ml-4"></div>

    <a href="/account/user.html" id="${idPrefix}-header-account-trigger" class="lg:hidden flex items-center gap-2 text-[10px] font-bold text-black bg-gas-green hover:bg-white transition-all rounded-full px-3 py-1.5 shadow-glow max-w-[132px]" aria-label="Account">
                        <i id="${idPrefix}-header-auth-icon" class="fa-solid fa-right-to-bracket"></i>
                        <span id="${idPrefix}-mobile-trigger-text" class="truncate">Login</span>
                    </a>

                    <button onclick="${onToggle}" class="lg:hidden text-white text-lg ml-2" aria-label="Toggle Menu">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                </div>
            </div>
        </header>

        <div class="pt-16 bg-[#080808] border-b border-white/5 relative z-40 shadow-sm">
            <div class="max-w-[1800px] mx-auto flex items-center h-8 overflow-hidden">
                <div class="flex items-center gap-2 px-4 h-full shrink-0 border-r border-white/10 bg-[#050505] z-10">
                    <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-gas-green opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-gas-green"></span></span>
                    <span class="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Live Data</span>
                </div>
                <div class="flex-1 overflow-hidden relative h-full flex items-center">
                    <div id="${idPrefix}-live-data-container" class="animate-marquee whitespace-nowrap flex items-center gap-12 px-4">
                        <div class="text-xs font-mono text-gray-600">Initializing Data Stream...</div>
                    </div>
                </div>
            </div>
        </div>

        <div id="${idPrefix}-mobile-menu-overlay" onclick="${onToggle}" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] hidden gsh-fade-transition lg:hidden"></div>

        <div id="${idPrefix}-mobile-menu-container" class="fixed top-0 right-0 bottom-0 w-64 bg-[#0F0F0F]/95 backdrop-blur-xl border-l border-white/10 z-[70] transform translate-x-full gsh-drawer-transition shadow-2xl flex flex-col pt-6 px-6 lg:hidden">
            <div class="flex justify-between items-center mb-8">
                <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Global Menu</span>
                <button onclick="${onToggle}" class="text-gray-400 hover:text-white" aria-label="Close Menu"><i class="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <div id="${idPrefix}-mobile-nav-links" class="space-y-4"></div>
        </div>
    </section>`;
}

function renderFlashHeader({ idPrefix, appGlobal }) {
    const onToggle = mobileToggleExpr(appGlobal);
    return `
    <section class="gsh-header-shell">
        <header class="fixed top-0 w-full z-50 gsh-header-glass h-16">
            <div class="max-w-[1600px] mx-auto px-6 h-full flex justify-between items-center">
                <div class="flex items-center gap-8 h-full">
                    <a href="/news/index.html" class="flex items-center gap-1 group" aria-label="GasGx News Home">
                        <div class="flex flex-col justify-center -space-y-1">
                            <span class="text-2xl font-bold italic text-white tracking-tighter font-header group-hover:text-gas-green transition-colors">GasGx</span>
                            <span class="text-[9px] font-bold text-gas-green tracking-[0.2em] uppercase leading-none pl-0.5">MINING NEWS</span>
                        </div>
                    </a>

                    <nav id="${idPrefix}-desktop-nav" class="hidden lg:flex items-center gap-1 h-full pl-6 border-l border-white/5 ml-4"></nav>
                </div>

                <div class="flex items-center gap-3 md:gap-4">
                    <div id="${idPrefix}-desktop-auth-container" class="hidden lg:flex items-center gap-2 ml-4"></div>
                    <div id="${idPrefix}-mobile-auth-trigger-wrapper" class="lg:hidden"></div>

                    <button onclick="${onToggle}" class="lg:hidden text-white text-xl w-8 h-8 flex items-center justify-center hover:text-gas-green transition-colors" aria-label="Toggle Menu">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                </div>
            </div>
        </header>

        <div id="${idPrefix}-mobile-menu-container" class="fixed inset-0 z-[60] pointer-events-none">
            <div id="${idPrefix}-mobile-menu-overlay" onclick="${onToggle}" class="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-300 pointer-events-auto hidden"></div>
            <div id="${idPrefix}-mobile-menu-drawer" class="absolute top-0 right-0 bottom-0 w-64 bg-[#0F0F0F]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col pt-6 px-6 transform translate-x-full gsh-drawer-transition pointer-events-auto">
                <div class="flex justify-between items-center mb-8">
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">GLOBAL MENU</span>
                    <button onclick="${onToggle}" class="text-gray-400 hover:text-white" aria-label="Close Menu"><i class="fa-solid fa-xmark text-xl"></i></button>
                </div>
                <div class="space-y-4" id="${idPrefix}-mobile-nav-links"></div>
            </div>
        </div>

        <div class="pt-16 bg-[#080808] border-b border-white/5 relative z-40 shadow-sm">
            <div class="max-w-[1800px] mx-auto flex items-center h-8 overflow-hidden">
                <div class="flex items-center gap-2 px-4 h-full shrink-0 border-r border-white/10 bg-[#050505] z-10">
                    <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-gas-green opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-gas-green"></span></span>
                    <span class="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Live Data</span>
                </div>
                <div class="flex-1 overflow-hidden relative h-full flex items-center">
                    <div id="${idPrefix}-live-data-container" class="animate-marquee whitespace-nowrap flex items-center gap-12 px-4">
                        <div class="flex items-center gap-2 text-xs font-mono text-gray-400"><span class="text-purple-400 font-bold">BTC</span><span class="text-white font-bold">$42,380</span><span class="text-red-500 text-[10px] ml-1">-1.3%</span></div>
                        <div class="flex items-center gap-2 text-xs font-mono text-gray-400"><span class="text-purple-400 font-bold">ETH</span><span class="text-white font-bold">$2,250</span><span class="text-gas-green text-[10px] ml-1">+0.5%</span></div>
                        <div class="flex items-center gap-2 text-xs font-mono text-gray-400"><span class="text-purple-400 font-bold">Hashrate</span><span class="text-white font-bold">750 EH/s</span><span class="text-gas-green text-[10px] ml-1">ATH</span></div>
                        <div class="flex items-center gap-2 text-xs font-mono text-gray-400"><span class="text-purple-400 font-bold">Difficulty</span><span class="text-white font-bold">82.3T</span><span class="text-gas-green text-[10px] ml-1">+2%</span></div>
                    </div>
                </div>
            </div>
        </div>
    </section>`;
}

const SITE_SHELL_CONFIG_SCRIPT_SRC = '/shared/ui/site-shell.config.js';
const MAIN_SITE_SHELL_SCRIPT_SRC = '/shared/ui/site-shell.shared.js';
const MAIN_SITE_SHELL_STYLE_HREF = '/shared/ui/site-shell.shared.css';
const SITE_SHELL_CONFIG_TABLE = 'site_shell_configs';
const SITE_SHELL_CONFIG_SCOPE = 'global';
const FOOTER_SOCIAL_SETTINGS_TABLE = 'feeder_form_options';
const FOOTER_SOCIAL_SECTION = 'footer_social';
const FOOTER_SOCIAL_META_SECTION = 'footer_social_meta';
const FOOTER_SOCIAL_ENABLED_KEY = 'social_enabled';
const FOOTER_CONTACT_SECTION = 'footer_contact';
const FOOTER_CONTACT_LABEL_KEY = 'label';
const FOOTER_CONTACT_HREF_KEY = 'href';
const SUPABASE_URL = 'https://mkpcliytqudclkwtewru.supabase.co';
const SUPABASE_KEY = 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';
let siteShellConfigPromise = null;
let footerSocialSettingsPromise = null;

function isVisibleFooterItem(item) {
    return !!item && item.visible !== false && item.hidden !== true;
}

function filterVisibleFooterItems(items) {
    return Array.isArray(items) ? items.filter(isVisibleFooterItem) : [];
}

function cloneSiteShellConfig(value) {
    return JSON.parse(JSON.stringify(value || null));
}

function mergeSiteShellRootConfig(baseConfig, sourceConfig) {
    const base = baseConfig && typeof baseConfig === 'object' ? cloneSiteShellConfig(baseConfig) : {};
    const source = sourceConfig && typeof sourceConfig === 'object' ? sourceConfig : {};
    return {
        ...base,
        ...source,
        navigation: Array.isArray(source.navigation) ? cloneSiteShellConfig(source.navigation) : Array.isArray(base.navigation) ? cloneSiteShellConfig(base.navigation) : [],
        sharedText: { ...(base.sharedText || {}), ...(source.sharedText || {}) },
        footer: { ...(base.footer || {}), ...(source.footer || {}) },
    };
}

const DEFAULT_HOMEPAGE_FOOTER_NAV = [
    {
        title: { en: 'Solutions' },
        path: '/solutions',
        type: 'menu',
        children: [
            { title: { en: 'Oil/Gas Field Power' }, path: '/solutions/oilfield' },
            { title: { en: 'Industrial Power' }, path: '/solutions/industrial' },
            { title: { en: 'Data Center / Mining' }, path: '/solutions/mining' },
            { title: { en: 'CHP Cogeneration' }, path: '/solutions/chp' },
        ],
    },
    { title: { en: 'Products' }, path: '/products', type: 'link' },
    { title: { en: 'Rankings' }, path: '/rankings', type: 'link' },
    { title: { en: 'Use Cases' }, path: '/use-cases', type: 'link' },
    { title: { en: 'Tools' }, path: '/tools', type: 'link' },
    { title: { en: 'Resources' }, path: '/resources', type: 'link' },
    {
        title: { en: 'Support' },
        path: '/support',
        type: 'menu',
        children: [
            { title: { en: 'Service Network' }, path: '/support/network' },
            { title: { en: 'Tech Support' }, path: '/support/tech' },
            { title: { en: 'After-sales' }, path: '/support/service' },
        ],
    },
    {
        title: { en: 'About Us' },
        path: '/about',
        type: 'menu',
        children: [
            { title: { en: 'Company Profile' }, path: '/about/company' },
            { title: { en: 'Contact Us' }, path: '/about/contact' },
        ],
    },
];

const DEFAULT_HOMEPAGE_FOOTER_SOCIAL_LINKS = [
    { id: 'x', iconClass: 'fa-brands fa-x-twitter', href: 'https://x.com/', ariaLabel: 'Open X' },
    { id: 'telegram', iconClass: 'fa-brands fa-telegram', href: 'https://t.me/', ariaLabel: 'Open Telegram' },
    { id: 'discord', iconClass: 'fa-brands fa-discord', href: 'https://discord.com/', ariaLabel: 'Open Discord' },
    { id: 'youtube', iconClass: 'fa-brands fa-youtube', href: 'https://www.youtube.com/', ariaLabel: 'Open YouTube' },
    { id: 'linkedin', iconClass: 'fa-brands fa-linkedin', href: 'https://www.linkedin.com/', ariaLabel: 'Open LinkedIn' },
    { id: 'facebook', iconClass: 'fa-brands fa-facebook', href: 'https://www.facebook.com/', ariaLabel: 'Open Facebook' },
    { id: 'tiktok', iconClass: 'fa-brands fa-tiktok', href: 'https://www.tiktok.com/', ariaLabel: 'Open TikTok' },
    { id: 'wechat', iconClass: 'fa-brands fa-weixin', href: '/about/contact', ariaLabel: 'Open WeChat' },
    { id: 'whatsapp', iconClass: 'fa-brands fa-whatsapp', href: 'https://wa.me/', ariaLabel: 'Open WhatsApp' },
    { id: 'instagram', iconClass: 'fa-brands fa-instagram', href: 'https://www.instagram.com/', ariaLabel: 'Open Instagram' },
    { id: 'xhs', text: 'XHS', href: 'https://www.xiaohongshu.com/', ariaLabel: 'Open Xiaohongshu' },
    { id: 'video', iconClass: 'fa-solid fa-circle-play', href: '/news/index.html', ariaLabel: 'Open Video Channel' },
];

function resolveFooterLabel(value, fallback = '') {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value && typeof value === 'object') {
        if (typeof value.en === 'string' && value.en.trim()) return value.en.trim();
        if (typeof value.zh === 'string' && value.zh.trim()) return value.zh.trim();
        const first = Object.values(value).find((item) => typeof item === 'string' && item.trim());
        if (first) return String(first).trim();
    }
    return fallback;
}

function normalizeFooterHref(value) {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) return '#';
    if (/^(https?:|mailto:|tel:|#)/i.test(raw)) return raw;
    if (raw.startsWith('/')) return raw;
    return `/${raw.replace(/^\/+/, '')}`;
}

function isHomeFooterPath(path) {
    const normalized = normalizeFooterHref(path).toLowerCase();
    const clean = normalized.split('#')[0].split('?')[0];
    return clean === '#' || clean === '/' || clean === '/index.html';
}

function getHomepageFooterConfig() {
    const rootConfig = typeof window !== 'undefined' ? window.GASGX_SITE_SHELL_CONFIG : null;
    return mergeSiteShellRootConfig({}, rootConfig && typeof rootConfig === 'object' ? rootConfig : {});
}

function getHomepageFooterNavigation() {
    const config = getHomepageFooterConfig();
    return Array.isArray(config.navigation) && config.navigation.length
        ? filterVisibleFooterItems(config.navigation)
        : DEFAULT_HOMEPAGE_FOOTER_NAV;
}

function getHomepageFooterSettings() {
    const config = getHomepageFooterConfig();
    const footer = config && typeof config.footer === 'object' ? config.footer : {};
    const socialLinks = Array.isArray(footer.socialLinks) && footer.socialLinks.length
        ? footer.socialLinks
        : DEFAULT_HOMEPAGE_FOOTER_SOCIAL_LINKS;

    return {
        contact: footer.contact && typeof footer.contact === 'object' ? footer.contact : {},
        privacyPolicy: footer.privacyPolicy && typeof footer.privacyPolicy === 'object' ? footer.privacyPolicy : {},
        visible: footer.visible !== false,
        socialEnabled: footer.socialEnabled !== false,
        socialLinks,
    };
}

function mergeFooterSocialSettings(baseSettings, overrides) {
    const settings = {
        ...(baseSettings || {}),
        contact: baseSettings?.contact && typeof baseSettings.contact === 'object' ? baseSettings.contact : {},
        socialEnabled: baseSettings?.socialEnabled !== false,
        socialLinks: Array.isArray(baseSettings?.socialLinks) ? baseSettings.socialLinks : [],
    };
    if (!overrides || typeof overrides !== 'object') return settings;

    const overrideMap = new Map(
        (Array.isArray(overrides.items) ? overrides.items : [])
            .filter((item) => item && item.id)
            .map((item) => [String(item.id).toLowerCase(), item])
    );

    return {
        ...settings,
        contact: {
            ...settings.contact,
            ...(overrides.contact && typeof overrides.contact === 'object' ? overrides.contact : {}),
        },
        socialEnabled: overrides.groupVisible !== false,
        socialLinks: settings.socialLinks.map((item) => {
            const key = String(item?.id || item?.qrType || '').toLowerCase();
            const override = overrideMap.get(key);
            if (!override) return item;
            return {
                ...item,
                href: typeof override.href === 'string' ? override.href : item.href,
                enabled: override.enabled !== false,
                visible: override.enabled !== false,
            };
        }),
    };
}

function getFooterItemChildren(item) {
    return filterVisibleFooterItems(item?.children).filter((entry) => entry && entry.path);
}

function resolveFooterSocialHref(item) {
    const explicit = typeof item?.href === 'string' ? item.href.trim() : '';
    if (explicit) return explicit;

    const id = String(item?.id || item?.qrType || '').toLowerCase();
    const fallback = {
        x: 'https://x.com/',
        twitter: 'https://x.com/',
        telegram: 'https://t.me/',
        discord: 'https://discord.com/',
        youtube: 'https://www.youtube.com/',
        linkedin: 'https://www.linkedin.com/',
        facebook: 'https://www.facebook.com/',
        tiktok: 'https://www.tiktok.com/',
        wechat: '/about/contact',
        whatsapp: 'https://wa.me/',
        instagram: 'https://www.instagram.com/',
        xhs: 'https://www.xiaohongshu.com/',
        video: '/news/index.html',
    };

    return fallback[id] || '';
}

function buildHomepageFooterContactHtml(settings) {
    const contact = settings.contact || {};
    const label = escapeHtml(resolveFooterLabel(contact.label, 'www_gasgx_com'));
    const iconClass = escapeHtml(contact.iconClass || 'fa-brands fa-weixin');
    const href = normalizeFooterHref(contact.href || '/about/contact');
    const target = /^https?:/i.test(href) ? '_blank' : '_self';
    const rel = target === '_blank' ? 'noopener noreferrer' : '';
    const relAttr = rel ? ` rel="${rel}"` : '';

    return `<a href="${escapeHtml(href)}" target="${target}"${relAttr} class="text-sm text-gray-400 hover:text-gas-green flex items-center gap-2 transition-colors focus:outline-none"><i class="${iconClass}"></i><span>${label}</span></a>`;
}

function buildHomepageFooterPrivacyHtml(settings) {
    const privacy = settings.privacyPolicy || {};
    const href = normalizeFooterHref(privacy.href || '/about/app_privacy_policy.html');
    const target = escapeHtml(privacy.target || '_blank');
    const rel = escapeHtml(privacy.rel || 'noopener noreferrer');
    const text = escapeHtml(resolveFooterLabel(privacy.text, 'Privacy Policy'));
    return `<a href="${escapeHtml(href)}" target="${target}" rel="${rel}" class="hover:text-gas-green transition-colors flex items-center gap-1"><i class="fa-solid fa-shield-halved text-[10px]"></i><span>${text}</span></a>`;
}

function buildHomepageFooterSocialHtml(settings) {
    if (settings?.socialEnabled === false) return '';
    const links = Array.isArray(settings.socialLinks) ? settings.socialLinks : [];

    return links
        .filter((item) => item && item.enabled !== false && item.visible !== false && item.hidden !== true)
        .map((item) => {
            const id = String(item.id || item.qrType || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');
            const href = resolveFooterSocialHref(item);
            if (!href) return '';

            const safeHref = escapeHtml(normalizeFooterHref(href));
            const target = /^https?:/i.test(safeHref) ? '_blank' : '_self';
            const rel = target === '_blank' ? 'noopener noreferrer' : '';
            const relAttr = rel ? ` rel="${rel}"` : '';
            const iconClass = escapeHtml(item.iconClass || 'fa-solid fa-link');
            const text = typeof item.text === 'string' && item.text.trim() ? escapeHtml(item.text.trim()) : '';
            const ariaLabel = escapeHtml(item.ariaLabel || resolveFooterLabel(item.title, item.id || 'Social Link'));
            const iconHtml = text
                ? `<span class="font-black text-[7px] leading-none">${text}</span>`
                : `<i class="${iconClass} text-xs"></i>`;

            return `<a href="${safeHref}" target="${target}"${relAttr} class="ggx-social-btn ${id ? `ggx-social-btn-${id}` : ''}" aria-label="${ariaLabel}">${iconHtml}</a>`;
        })
        .join('');
}

function fetchFooterSocialSettings() {
    if (typeof window === 'undefined' || typeof fetch !== 'function') return Promise.resolve(null);
    if (footerSocialSettingsPromise) return footerSocialSettingsPromise;

    const query = new URLSearchParams({
        select: 'section,option_id,label_en,sort_order,is_active',
        'section': `in.(${FOOTER_SOCIAL_SECTION},${FOOTER_SOCIAL_META_SECTION},${FOOTER_CONTACT_SECTION})`,
        order: 'sort_order.asc,id.asc',
    });
    footerSocialSettingsPromise = fetch(`${SUPABASE_URL}/rest/v1/${FOOTER_SOCIAL_SETTINGS_TABLE}?${query.toString()}`, {
        cache: 'no-store',
        headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
        },
    })
        .then((response) => (response.ok ? response.json() : []))
        .then((rows) => {
            const safeRows = Array.isArray(rows) ? rows : [];
            const items = safeRows
                .filter((row) => String(row?.section || '').trim().toLowerCase() === FOOTER_SOCIAL_SECTION)
                .map((row) => ({
                    id: String(row?.option_id || '').trim().toLowerCase(),
                    href: String(row?.label_en || '').trim(),
                    enabled: row?.is_active !== false,
                    sortOrder: Number(row?.sort_order || 0) || 0,
                }))
                .filter((row) => row.id);
            const groupRow = safeRows.find((row) => String(row?.section || '').trim().toLowerCase() === FOOTER_SOCIAL_META_SECTION && String(row?.option_id || '').trim().toLowerCase() === FOOTER_SOCIAL_ENABLED_KEY);
            const contactLabelRow = safeRows.find((row) => String(row?.section || '').trim().toLowerCase() === FOOTER_CONTACT_SECTION && String(row?.option_id || '').trim().toLowerCase() === FOOTER_CONTACT_LABEL_KEY);
            const contactHrefRow = safeRows.find((row) => String(row?.section || '').trim().toLowerCase() === FOOTER_CONTACT_SECTION && String(row?.option_id || '').trim().toLowerCase() === FOOTER_CONTACT_HREF_KEY);
            return {
                groupVisible: groupRow ? groupRow.is_active !== false : true,
                contact: {
                    label: String(contactLabelRow?.label_en || '').trim(),
                    href: String(contactHrefRow?.label_en || '').trim(),
                },
                items,
            };
        })
        .catch(() => null);

    return footerSocialSettingsPromise;
}

function buildHomepageFooterLinksHtml(navigation) {
    if (!Array.isArray(navigation) || navigation.length === 0) return '';

    return navigation
        .map((item, index) => {
            const path = normalizeFooterHref(item?.path);
            if (isHomeFooterPath(path)) return '';

            const title = escapeHtml(resolveFooterLabel(item?.title, 'Link'));
            const footerSubId = `gsh-footer-section-${index}`;
            const itemType = item?.type || 'link';
            const children = getFooterItemChildren(item);
            let mobileContentHtml = '';
            let desktopContentHtml = '';
            const visibleSections = filterVisibleFooterItems(item?.sections);

            if (itemType === 'menu' && children.length) {
                const links = children
                    .map((child) => {
                        const childTitle = escapeHtml(resolveFooterLabel(child?.title, 'Link'));
                        const childPath = escapeHtml(normalizeFooterHref(child?.path));
                        return `<a href="${childPath}" class="footer-link hover:text-gas-green text-gray-400 mr-4 mb-2 inline-block">${childTitle}</a>`;
                    })
                    .join('');
                mobileContentHtml = `<div class="flex flex-wrap">${links}</div>`;
                desktopContentHtml = mobileContentHtml;
            } else if (itemType === 'mega' && visibleSections.length) {
                desktopContentHtml = visibleSections
                    .map((section) => {
                        const sectionTitle = escapeHtml(resolveFooterLabel(section?.header, 'Section'));
                        const sectionLinks = filterVisibleFooterItems(section?.items)
                            .map((subItem) => {
                                const subTitle = escapeHtml(resolveFooterLabel(subItem?.title, 'Link'));
                                const subPath = escapeHtml(normalizeFooterHref(subItem?.path));
                                return `<a href="${subPath}" class="hover:text-gas-green text-gray-400 ml-2 text-xs">${subTitle}</a>`;
                            })
                            .join('<span class="text-gray-700 mx-1">|</span>');
                        return `<div class="flex items-baseline mr-6 mb-2"><span class="text-gas-green text-xs font-bold uppercase mr-1 whitespace-nowrap">${sectionTitle}:</span><div class="flex flex-wrap">${sectionLinks}</div></div>`;
                    })
                    .join('');
                desktopContentHtml = `<div class="flex flex-wrap items-center">${desktopContentHtml}</div>`;

                mobileContentHtml = visibleSections
                    .map((section) => {
                        const sectionLinks = filterVisibleFooterItems(section?.items)
                            .map((subItem) => {
                                const subTitle = escapeHtml(resolveFooterLabel(subItem?.title, 'Link'));
                                const subPath = escapeHtml(normalizeFooterHref(subItem?.path));
                                return `<a href="${subPath}" class="footer-link block pl-2 border-l border-white/10 hover:border-gas-green mb-1">${subTitle}</a>`;
                            })
                            .join('');
                        return sectionLinks;
                    })
                    .join('');
                mobileContentHtml = `<div class="flex flex-col">${mobileContentHtml}</div>`;
            } else if (!isHomeFooterPath(path)) {
                const link = `<a href="${escapeHtml(path)}" class="footer-link hover:text-gas-green text-gray-400 mr-4 mb-2 inline-block">${title}</a>`;
                mobileContentHtml = `<div class="flex flex-wrap">${link}</div>`;
                desktopContentHtml = mobileContentHtml;
            }

            if (!desktopContentHtml) return '';

            return `
                <div class="w-full border-b border-white/5 last:border-0">
                    <div class="hidden md:flex py-4 items-start">
                        <div class="w-32 lg:w-48 shrink-0">
                            <h4 class="text-white font-bold text-sm border-l-2 border-gas-green pl-3">${title}</h4>
                        </div>
                        <div class="flex-1">${desktopContentHtml}</div>
                    </div>
                    <div class="md:hidden">
                        <button class="w-full flex justify-between items-center py-3 text-sm font-bold text-white focus:outline-none" data-gsh-footer-toggle="1" data-gsh-target="${footerSubId}" aria-expanded="false">
                            <span class="border-l-2 border-gas-green pl-3">${title}</span>
                            <i class="fa-solid fa-plus text-xs text-gray-500 transition-transform duration-300"></i>
                        </button>
                        <div id="${footerSubId}" class="gsh-footer-accordion-content">
                            <div class="pt-2 pl-4 pb-4 text-gray-400">${mobileContentHtml}</div>
                        </div>
                    </div>
                </div>
            `;
        })
        .join('');
}

function fetchPublishedSiteShellConfig() {
    if (typeof window === 'undefined' || typeof fetch !== 'function') return Promise.resolve(null);

    const query = new URLSearchParams({
        select: 'config',
        scope: `eq.${SITE_SHELL_CONFIG_SCOPE}`,
        limit: '1',
    });

    return fetch(`${SUPABASE_URL}/rest/v1/${SITE_SHELL_CONFIG_TABLE}?${query.toString()}`, {
        cache: 'no-store',
        headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
        },
    })
        .then((response) => (response.ok ? response.json() : []))
        .then((rows) => {
            const firstRow = Array.isArray(rows) ? rows[0] : null;
            return firstRow?.config && typeof firstRow.config === 'object' ? firstRow.config : null;
        })
        .catch(() => null);
}

function ensureSiteShellConfigLoaded() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return Promise.resolve(null);
    if (window.GASGX_SITE_SHELL_CONFIG && typeof window.GASGX_SITE_SHELL_CONFIG === 'object') {
        return Promise.resolve(window.GASGX_SITE_SHELL_CONFIG);
    }
    if (siteShellConfigPromise) return siteShellConfigPromise;

    siteShellConfigPromise = fetchPublishedSiteShellConfig()
        .then((publishedConfig) => {
            if (publishedConfig) {
                window.GASGX_SITE_SHELL_CONFIG = mergeSiteShellRootConfig(window.GASGX_SITE_SHELL_CONFIG || {}, publishedConfig);
                return window.GASGX_SITE_SHELL_CONFIG;
            }

            return new Promise((resolve) => {
                const done = () => resolve(window.GASGX_SITE_SHELL_CONFIG || null);
                const fail = () => resolve(null);
                const existing = document.querySelector('script[data-gsh-site-shell-config="1"]');

                if (existing) {
                    if (window.GASGX_SITE_SHELL_CONFIG) return done();
                    existing.addEventListener('load', done, { once: true });
                    existing.addEventListener('error', fail, { once: true });
                    return undefined;
                }

                const script = document.createElement('script');
                script.src = SITE_SHELL_CONFIG_SCRIPT_SRC;
                script.async = true;
                script.dataset.gshSiteShellConfig = '1';
                script.addEventListener('load', done, { once: true });
                script.addEventListener('error', fail, { once: true });
                document.head.appendChild(script);
                return undefined;
            });
        });

    return siteShellConfigPromise;
}

function ensureMainSiteFooterAssets() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return Promise.resolve(null);

    if (!document.querySelector('link[data-gsh-main-site-shell-css="1"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = MAIN_SITE_SHELL_STYLE_HREF;
        link.dataset.gshMainSiteShellCss = '1';
        document.head.appendChild(link);
    }

    if (window.GasGxSharedUI && typeof window.GasGxSharedUI.mountFooter === 'function') {
        return Promise.resolve(window.GasGxSharedUI);
    }

    return new Promise((resolve) => {
        const done = () => resolve(window.GasGxSharedUI || null);
        const fail = () => resolve(null);
        const existing = document.querySelector('script[data-gsh-main-site-shell-js="1"]');

        if (existing) {
            if (window.GasGxSharedUI) return done();
            existing.addEventListener('load', done, { once: true });
            existing.addEventListener('error', fail, { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = MAIN_SITE_SHELL_SCRIPT_SRC;
        script.async = true;
        script.dataset.gshMainSiteShellJs = '1';
        script.addEventListener('load', done, { once: true });
        script.addEventListener('error', fail, { once: true });
        document.head.appendChild(script);
    });
}

function mountManagedMainSiteFooter(container) {
    return ensureMainSiteFooterAssets()
        .then((sharedUI) => {
            if (!sharedUI || typeof sharedUI.mountFooter !== 'function') {
                return false;
            }

            sharedUI.mountFooter(container);
            return true;
        })
        .catch(() => false);
}

function refreshHomepageFooterLinks(container) {
    if (!container) return;
    const linksSlot = container.querySelector('[data-gsh-home-footer-links="1"]');
    if (!linksSlot) return;
    linksSlot.innerHTML = buildHomepageFooterLinksHtml(getHomepageFooterNavigation());
}

function refreshHomepageFooterSocial(container, overrides = null) {
    if (!container) return;
    const socialSlot = container.querySelector('[data-gsh-home-footer-social="1"]');
    if (!socialSlot) return;
    const settings = mergeFooterSocialSettings(getHomepageFooterSettings(), overrides);
    const socialHtml = buildHomepageFooterSocialHtml(settings);
    socialSlot.innerHTML = socialHtml ? `<div class="ggx-connect-grid">${socialHtml}</div>` : '';
    socialSlot.hidden = !socialHtml;
}

function refreshHomepageFooterContact(container, overrides = null) {
    if (!container) return;
    const contactSlot = container.querySelector('[data-gsh-home-footer-contact="1"]');
    if (!contactSlot) return;
    const settings = mergeFooterSocialSettings(getHomepageFooterSettings(), overrides);
    contactSlot.innerHTML = buildHomepageFooterContactHtml(settings);
}

function shouldUseLegacyFooterOverrides() {
    const config = getHomepageFooterConfig();
    return !config || !config.footer || (Array.isArray(config.navigation) && config.navigation.length === 0);
}

function bindHomepageFooterInteractions(container) {
    if (!container || container.dataset.gshFooterBound === '1') return;
    container.dataset.gshFooterBound = '1';

    container.addEventListener('click', (event) => {
        const toggleBtn = event.target.closest('[data-gsh-footer-toggle="1"]');
        if (!toggleBtn || !container.contains(toggleBtn)) return;

        const targetId = toggleBtn.getAttribute('data-gsh-target');
        if (!targetId) return;

        const content = document.getElementById(targetId);
        if (!content) return;

        const isOpen = Boolean(content.style.maxHeight && content.style.maxHeight !== '0px');
        content.style.maxHeight = isOpen ? '0px' : `${content.scrollHeight}px`;
        toggleBtn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');

        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-plus', isOpen);
            icon.classList.toggle('fa-minus', !isOpen);
        }
    });
}

function renderFullFooter() {
    const settings = getHomepageFooterSettings();
    if (settings.visible === false) return '';
    const linksHtml = buildHomepageFooterLinksHtml(getHomepageFooterNavigation());
    const contactHtml = buildHomepageFooterContactHtml(settings);
    const privacyHtml = buildHomepageFooterPrivacyHtml(settings);
    const socialHtml = buildHomepageFooterSocialHtml(settings);
    const socialContainer = `<div class="ggx-connect-inline" data-gsh-home-footer-social="1"${socialHtml ? '' : ' hidden'}>${socialHtml ? `<div class="ggx-connect-grid">${socialHtml}</div>` : ''}</div>`;

    return `
    <footer class="gsh-footer gsh-footer-full bg-[#0a0a0a] border-t border-white/10 mt-auto pt-10 pb-8 relative z-20">
        <div class="max-w-[1800px] mx-auto px-6">
            <div class="flex flex-col md:flex-row justify-between items-start mb-8 pb-6 border-b border-white/5">
                <div class="mb-6 md:mb-0">
                    <div class="flex items-center gap-2 mb-2"><span class="text-2xl font-bold text-gas-green">GasGx</span></div>
                    <p class="text-sm text-gray-400 font-medium">Making natural gas power mining easier</p>
                </div>
                <div class="flex flex-col md:items-end space-y-2">
                    <h4 class="text-white font-bold text-sm uppercase tracking-wider mb-1">Contact Us</h4>
                    <div data-gsh-home-footer-contact="1">${contactHtml}</div>
                </div>
            </div>
            <div data-gsh-home-footer-links="1" class="mb-10 space-y-2">${linksHtml}</div>
            <div class="ggx-footer-bottom pt-6 border-t border-white/5">
                <div class="ggx-footer-meta">
                    <div class="ggx-footer-top-row">
                        <div class="ggx-footer-brand-inline">
                            <a href="/index.html" class="ggx-footer-logo" aria-label="GasGx Home">GasGx</a>
                            <p class="ggx-footer-meta-tag text-sm text-gray-400">Energy-compute infrastructure for mining operators.</p>
                        </div>
                        ${socialContainer}
                    </div>
                    <div class="ggx-footer-legal-row">
                        <div class="ggx-footer-legal flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600">
                            <span>&copy; 2026 GasGx. All rights reserved.</span><span class="text-gray-700">|</span>
                            ${privacyHtml}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </footer>`;
}

function renderMinimalFooter() {
    return `
    <footer class="gsh-footer gsh-footer-minimal hidden lg:block bg-[#020202] border-t border-[#1F1F1F] mt-auto pt-10 pb-8 text-sm relative z-20">
        <div class="max-w-[1600px] mx-auto px-6">
            <div class="border-t border-white/5 pt-8 text-xs text-gray-600 text-center">&copy; 2026 GasGx Technology. All rights reserved.</div>
        </div>
    </footer>`;
}

const COOKIE_CONSENT_STORAGE_KEY = 'ggx_news_cookie_consent_v1';
const COOKIE_CONSENT_BANNER_ID = 'gsh-cookie-consent-banner';
const COOKIE_CONSENT_COOKIE_NAME = 'ggx_cookie_consent';
const COOKIE_CONSENT_MAX_AGE_SECONDS = 31536000;

function readCookieByName(name) {
    if (typeof document === 'undefined') return null;
    const cookieStr = document.cookie || '';
    const entries = cookieStr.split(';');
    for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i].trim();
        if (!entry) continue;
        const eqIndex = entry.indexOf('=');
        const key = eqIndex >= 0 ? entry.slice(0, eqIndex).trim() : entry;
        if (key !== name) continue;
        const rawValue = eqIndex >= 0 ? entry.slice(eqIndex + 1) : '';
        try {
            return decodeURIComponent(rawValue);
        } catch (_error) {
            return rawValue;
        }
    }
    return null;
}

function readCookieConsentChoice() {
    const cookieValue = readCookieByName(COOKIE_CONSENT_COOKIE_NAME);
    if (cookieValue === 'accepted' || cookieValue === 'declined') {
        try {
            if (typeof window !== 'undefined') window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, cookieValue);
        } catch (_error) {
            // Ignore storage errors.
        }
        return cookieValue;
    }

    if (typeof window === 'undefined') return null;
    try {
        const value = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
        return value === 'accepted' || value === 'declined' ? value : null;
    } catch (_error) {
        return null;
    }
}

function writeCookieConsentChoice(value) {
    if (value !== 'accepted' && value !== 'declined') return;

    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
        } catch (_error) {
            // Ignore storage errors (privacy mode / blocked storage).
        }
    }

    if (typeof document !== 'undefined') {
        try {
            const encodedValue = encodeURIComponent(value);
            document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${encodedValue}; Max-Age=${COOKIE_CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
        } catch (_error) {
            // Ignore cookie write errors.
        }
    }
}

function hideCookieConsentBanner() {
    if (typeof document === 'undefined') return;
    const banner = document.getElementById(COOKIE_CONSENT_BANNER_ID);
    if (!banner) return;

    banner.classList.remove('gsh-cookie-consent-visible');
    banner.classList.add('gsh-cookie-consent-hidden');

    window.setTimeout(() => {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 220);
}

function mountCookieConsentBanner() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(COOKIE_CONSENT_BANNER_ID)) return;
    if (readCookieConsentChoice()) return;

    const host = document.body || document.documentElement;
    if (!host) return;

    const banner = document.createElement('section');
    banner.id = COOKIE_CONSENT_BANNER_ID;
    banner.className = 'gsh-cookie-consent gsh-cookie-consent-hidden';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie Consent');
    banner.innerHTML = `
        <div class="gsh-cookie-consent-panel">
            <p class="gsh-cookie-consent-text">
                We use cookies to improve site performance and user experience.
                See our <a href="/about/app_privacy_policy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
            </p>
            <div class="gsh-cookie-consent-actions">
                <button type="button" class="gsh-cookie-consent-btn gsh-cookie-consent-btn-secondary" data-gsh-consent-action="decline">Decline</button>
                <button type="button" class="gsh-cookie-consent-btn gsh-cookie-consent-btn-primary" data-gsh-consent-action="accept">Accept</button>
            </div>
        </div>
    `;

    host.appendChild(banner);

    const acceptBtn = banner.querySelector('[data-gsh-consent-action="accept"]');
    const declineBtn = banner.querySelector('[data-gsh-consent-action="decline"]');
    const onChoice = (choice) => {
        writeCookieConsentChoice(choice);
        hideCookieConsentBanner();
    };

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => onChoice('accepted'));
    }
    if (declineBtn) {
        declineBtn.addEventListener('click', () => onChoice('declined'));
    }

    window.requestAnimationFrame(() => {
        banner.classList.remove('gsh-cookie-consent-hidden');
        banner.classList.add('gsh-cookie-consent-visible');
    });
}

const RUNTIME_NAV_STYLE_ID = 'gsh-runtime-nav-styles';

function ensureRuntimeNavStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(RUNTIME_NAV_STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = RUNTIME_NAV_STYLE_ID;
    style.textContent = `
        .gsh-header-glass{background:rgba(5,5,5,.78)!important;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.08)}
        .gsh-drawer-transition{transition:transform .3s cubic-bezier(.4,0,.2,1)}
        .gsh-fade-transition{transition:opacity .3s ease-in-out}
        .gsh-nav-item{position:relative;height:100%;display:flex;align-items:center}
        .gsh-nav-link{display:inline-flex;align-items:center;gap:.35rem}
        .gsh-nav-link-active{background:rgba(93,214,44,.08)}
        .gsh-nav-caret{font-size:10px;opacity:.75;transition:transform .2s ease}
        .gsh-nav-item:hover .gsh-nav-caret,.gsh-nav-item:focus-within .gsh-nav-caret{transform:rotate(180deg)}
        .gsh-nav-submenu{position:absolute;left:0;top:calc(100% + 8px);min-width:220px;background:rgba(10,10,10,.98);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:8px;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(6px);transition:opacity .2s ease,transform .2s ease,visibility .2s ease;z-index:80;backdrop-filter:blur(12px);box-shadow:0 12px 32px rgba(0,0,0,.45)}
        .gsh-nav-item:hover>.gsh-nav-submenu,.gsh-nav-item:focus-within>.gsh-nav-submenu{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0)}
        .gsh-nav-submenu-link{display:block;border-radius:8px;padding:8px 10px;color:#b6b6b6;font-size:12px;font-weight:700;line-height:1.2;text-transform:uppercase;letter-spacing:.04em;text-decoration:none;transition:color .2s ease,background-color .2s ease}
        .gsh-nav-submenu-link:hover{color:#5dd62c;background:rgba(93,214,44,.1)}
        .gsh-nav-submenu-link-active{color:#5dd62c;background:rgba(93,214,44,.14)}
        .gsh-mobile-nav-group+.gsh-mobile-nav-group{margin-top:.25rem}
        .gsh-mobile-subnav{margin:.35rem 0 .25rem 1.8rem;padding-left:.75rem;border-left:1px solid rgba(255,255,255,.12);display:flex;flex-direction:column;gap:.2rem}
        .gsh-mobile-subnav-link{color:#9ca3af;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;text-decoration:none;padding:4px 0;transition:color .2s ease}
        .gsh-mobile-subnav-link:hover,.gsh-mobile-subnav-link-active{color:#5dd62c}
        .gsh-footer a{text-decoration:none}
        .gsh-footer ul{list-style:none;margin:0;padding:0}
        .gsh-footer .footer-link{color:#94a3b8;transition:all .2s;font-size:.8rem;white-space:nowrap}
        .gsh-footer .footer-link:hover{color:#5dd62c}
        .gsh-footer .gsh-footer-accordion-content{max-height:0;overflow:hidden;transition:max-height .3s ease-out}
        .gsh-footer .ggx-footer-bottom{display:flex;justify-content:center}
        .gsh-footer .ggx-footer-meta{display:flex;flex-direction:column;align-items:center;text-align:center;gap:.8rem}
        .gsh-footer .ggx-footer-top-row{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:.6rem 1rem}
        .gsh-footer .ggx-footer-brand-inline{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:.5rem .75rem}
        .gsh-footer .ggx-footer-logo{color:#fff;font-size:1.5rem;line-height:1;font-weight:700;font-style:italic;letter-spacing:-.02em;text-decoration:none;transition:color .2s ease}
        .gsh-footer .ggx-footer-logo:hover{color:#5dd62c}
        .gsh-footer .ggx-footer-meta-tag{margin:0;max-width:34rem;line-height:1.45}
        .gsh-footer .ggx-footer-legal-row{display:flex;justify-content:center;align-items:center;width:100%}
        .gsh-footer .ggx-footer-legal{justify-content:center}
        .gsh-footer .ggx-social-btn{color:#6b7280;width:1.68rem;height:1.68rem;border-radius:9999px;background:#111;border:1px solid rgba(255,255,255,.08);display:inline-flex;align-items:center;justify-content:center;transition:background-color .2s,color .2s,transform .2s,border-color .2s}
        .gsh-footer .ggx-social-btn:hover{color:#5dd62c;transform:translateY(-2px);border-color:rgba(255,255,255,.2)}
        .gsh-footer .ggx-social-btn.ggx-social-btn-x:hover,.gsh-footer .ggx-social-btn.ggx-social-btn-twitter:hover{background:#000;color:#fff}
        .gsh-footer .ggx-social-btn.ggx-social-btn-linkedin:hover{background:#0077B5;color:#fff}
        .gsh-footer .ggx-social-btn.ggx-social-btn-facebook:hover{background:#1877F2;color:#fff}
        .gsh-footer .ggx-social-btn.ggx-social-btn-tiktok:hover{background:#000;color:#fff}
        .gsh-footer .ggx-social-btn.ggx-social-btn-telegram:hover{background:#229ED9;color:#fff}
        .gsh-footer .ggx-social-btn.ggx-social-btn-discord:hover{background:#5865F2;color:#fff}
        .gsh-footer .ggx-social-btn.ggx-social-btn-youtube:hover{background:#FF0000;color:#fff}
        .gsh-footer .ggx-social-btn.ggx-social-btn-wechat:hover{background:#07C160;color:#fff}
        .gsh-footer .ggx-social-btn.ggx-social-btn-whatsapp:hover{background:#25D366;color:#fff}
        .gsh-footer .ggx-social-btn.ggx-social-btn-instagram:hover{background:#E1306C;color:#fff}
        .gsh-footer .ggx-social-btn.ggx-social-btn-xhs:hover{background:#FF2442;color:#fff}
        .gsh-footer .ggx-social-btn.ggx-social-btn-video:hover{background:#FF9900;color:#fff}
        .gsh-footer .ggx-connect-inline{display:flex;align-items:center}
        .gsh-footer .ggx-connect-grid{display:flex;flex-wrap:wrap;gap:.42rem;justify-content:center;align-items:center}
        @media (min-width:768px){.gsh-footer .ggx-footer-meta-tag{max-width:42rem}}
        @media (min-width:1024px){.gsh-footer .ggx-footer-top-row{flex-wrap:nowrap}.gsh-footer .ggx-connect-grid{flex-wrap:nowrap}}
        .gsh-cookie-consent{position:fixed;left:0;right:0;bottom:16px;padding:0 16px;display:flex;justify-content:center;pointer-events:none;z-index:85}
        .gsh-cookie-consent-panel{width:min(980px,100%);pointer-events:auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;background:rgba(8,8,8,.94);border:1px solid rgba(255,255,255,.15);border-radius:14px;padding:14px 16px;backdrop-filter:blur(10px);box-shadow:0 18px 45px rgba(0,0,0,.55)}
        .gsh-cookie-consent-text{margin:0;flex:1 1 420px;color:#b6b6b6;font-size:12px;line-height:1.55}
        .gsh-cookie-consent-text a{color:#5dd62c;text-decoration:none}
        .gsh-cookie-consent-text a:hover{color:#fff}
        .gsh-cookie-consent-actions{display:flex;align-items:center;gap:8px}
        .gsh-cookie-consent-btn{border-radius:999px;padding:8px 14px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;border:1px solid transparent;cursor:pointer;transition:all .2s ease}
        .gsh-cookie-consent-btn-secondary{color:#d1d5db;background:rgba(255,255,255,.02);border-color:rgba(255,255,255,.2)}
        .gsh-cookie-consent-btn-secondary:hover{color:#fff;border-color:rgba(255,255,255,.35);background:rgba(255,255,255,.06)}
        .gsh-cookie-consent-btn-primary{color:#081204;background:#5dd62c;border-color:#5dd62c}
        .gsh-cookie-consent-btn-primary:hover{background:#ffffff;border-color:#ffffff}
        .gsh-cookie-consent-hidden{opacity:0;transform:translateY(16px)}
        .gsh-cookie-consent-visible{opacity:1;transform:translateY(0)}
        .gsh-cookie-consent-hidden,.gsh-cookie-consent-visible{transition:opacity .2s ease,transform .2s ease}
        @media (max-width:640px){.gsh-cookie-consent{bottom:10px;padding:0 10px}.gsh-cookie-consent-panel{padding:12px}.gsh-cookie-consent-actions{width:100%}.gsh-cookie-consent-btn{flex:1}}
    `;

    document.head.appendChild(style);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function resolveDisplayName(currentUser, displayName) {
    if (!currentUser) return 'Sign In';
    if (displayName && String(displayName).trim()) return String(displayName).trim();

    const email = currentUser.email || '';
    const emailPrefix = typeof email === 'string' && email.includes('@') ? email.split('@')[0] : email;
    return emailPrefix || 'Sign In';
}

function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
}

function normalizePath(value) {
    if (!value) return '';
    let path = String(value).trim().toLowerCase();
    if (!path) return '';

    path = path.split('#')[0].split('?')[0];
    if (!path) return '';

    if (path.endsWith('/index.html')) {
        path = path.slice(0, -'/index.html'.length);
    }

    if (path.length > 1) {
        path = path.replace(/\/+$/, '');
    }

    return path;
}

function isPathActive(itemPath, activePath) {
    const normalizedItemPath = normalizePath(itemPath);
    const normalizedActivePath = normalizePath(activePath);

    if (!normalizedItemPath || !normalizedActivePath) return false;
    if (normalizedItemPath === normalizedActivePath) return true;
    if (normalizedItemPath === '/news') return false;
    return normalizedActivePath.startsWith(`${normalizedItemPath}/`);
}

function isNavItemActive(item, activeTitle, activePath) {
    const titleMatch = normalizeText(item?.title) && normalizeText(item?.title) === normalizeText(activeTitle);
    const pathMatch = isPathActive(item?.path, activePath);
    return Boolean(titleMatch || pathMatch);
}

function getNavChildren(item) {
    if (!Array.isArray(item?.children)) return [];
    return item.children.filter((child) => child && child.title && child.path);
}

function renderDesktopSubmenu(children, activeChildTitle, activePath) {
    if (!children.length) return '';

    const submenuItems = children
        .map((child) => {
            const childTitle = escapeHtml(child.title);
            const childPath = escapeHtml(child.path);
            const isActive = isNavItemActive(child, activeChildTitle, activePath);
            return `<a href="${childPath}" class="gsh-nav-submenu-link${isActive ? ' gsh-nav-submenu-link-active' : ''}">${childTitle}</a>`;
        })
        .join('');

    return `<div class="gsh-nav-submenu">${submenuItems}</div>`;
}

function renderDesktopNav(page, navigation, activeTitle, activePath, activeChildTitle) {
    if (!Array.isArray(navigation) || navigation.length === 0) return '';

    return navigation
        .map((item) => {
            const title = escapeHtml(item?.title || '');
            const path = escapeHtml(item?.path || '#');
            const children = getNavChildren(item);
            const hasChildren = children.length > 0;
            const hasActiveChild = hasChildren && children.some((child) => isNavItemActive(child, activeChildTitle, activePath));
            const isActive = isNavItemActive(item, activeTitle, activePath) || hasActiveChild;
            const colorClass = isActive ? 'text-gas-green gsh-nav-link-active' : 'text-gray-400';
            const extra = page === 'flash' ? ' whitespace-nowrap' : '';
            const submenu = hasChildren ? renderDesktopSubmenu(children, activeChildTitle, activePath) : '';

            return `
                <div class="gsh-nav-item">
                    <a href="${path}" class="${colorClass} text-xs font-bold hover:text-white px-4 py-2 transition-colors uppercase tracking-wide rounded-full${extra} gsh-nav-link">
                        <span>${title}</span>
                    </a>
                    ${submenu}
                </div>
            `;
        })
        .join('');
}

function renderMobileNav(navigation, activeTitle, activePath, activeChildTitle) {
    if (!Array.isArray(navigation) || navigation.length === 0) return '';

    return navigation
        .map((item) => {
            const title = escapeHtml(item?.title || '');
            const path = escapeHtml(item?.path || '#');
            const icon = escapeHtml(item?.icon || 'fa-circle');
            const children = getNavChildren(item);
            const hasChildren = children.length > 0;
            const isParentActive = isNavItemActive(item, activeTitle, activePath);
            const parentClass = isParentActive ? 'text-gas-green' : 'text-gray-300';

            const childLinks = hasChildren
                ? `
                    <div class="gsh-mobile-subnav">
                        ${children
                            .map((child) => {
                                const childTitle = escapeHtml(child.title);
                                const childPath = escapeHtml(child.path);
                                const isChildActive = isNavItemActive(child, activeChildTitle, activePath);
                                return `<a href="${childPath}" class="gsh-mobile-subnav-link${isChildActive ? ' gsh-mobile-subnav-link-active' : ''}">${childTitle}</a>`;
                            })
                            .join('')}
                    </div>
                `
                : '';

            return `
                <div class="gsh-mobile-nav-group">
                    <a href="${path}" class="flex items-center gap-3 text-sm font-bold ${parentClass} hover:text-gas-green py-2 border-b border-white/5 transition-colors">
                        <i class="fa-solid ${icon} w-5 text-center"></i> ${title}
                    </a>
                    ${childLinks}
                </div>
            `;
        })
        .join('');
}

function renderNewsHomeAuthState({ idPrefix, currentUser, isLogged, displayName, accountUrl, signInUrl, ordersUrl }) {
    const desktopAuthContainer = document.getElementById(`${idPrefix}-auth-btn-container`);
    const mobileTrigger = document.getElementById(`${idPrefix}-header-account-trigger`);
    const mobileTriggerIcon = document.getElementById(`${idPrefix}-header-auth-icon`);
    const mobileTriggerText = document.getElementById(`${idPrefix}-mobile-trigger-text`);

    const safeName = escapeHtml(displayName);
    const avatarUrl = resolveAuthAvatar(currentUser);

    if (desktopAuthContainer) {
        desktopAuthContainer.innerHTML = isLogged
            ? renderLoggedInDesktopAuth({ accountUrl, ordersUrl, safeName, avatarUrl })
            : renderLoggedOutAuthLink(signInUrl);
    }

    if (isLogged) {
        if (mobileTrigger) {
            mobileTrigger.href = accountUrl;
            mobileTrigger.className = 'lg:hidden flex items-center gap-2 text-[10px] font-bold text-gas-green border border-gas-green/30 bg-gas-green/10 hover:bg-gas-green hover:text-black transition-all rounded-full px-3 py-1.5 max-w-[180px]';
        }
        if (mobileTriggerIcon) {
            mobileTriggerIcon.classList.add('hidden');
            let avatarEl = document.getElementById(`${idPrefix}-header-auth-avatar`);
            if (!avatarEl && mobileTriggerIcon.parentNode) {
                avatarEl = document.createElement('img');
                avatarEl.id = `${idPrefix}-header-auth-avatar`;
                avatarEl.alt = 'User avatar';
                avatarEl.className = 'h-5 w-5 rounded-full border border-gas-green object-cover';
                mobileTriggerIcon.insertAdjacentElement('afterend', avatarEl);
            }
            if (avatarEl) {
                avatarEl.classList.remove('hidden');
                avatarEl.src = avatarUrl;
            }
        }
        if (mobileTriggerText) {
            mobileTriggerText.textContent = displayName;
        }
    } else {
        if (mobileTrigger) {
            mobileTrigger.href = signInUrl;
            mobileTrigger.className = 'lg:hidden flex items-center gap-2 text-[10px] font-bold text-black bg-gas-green hover:bg-white transition-all rounded-full px-3 py-1.5 shadow-glow max-w-[132px]';
        }
        if (mobileTriggerIcon) {
            mobileTriggerIcon.className = 'fa-solid fa-right-to-bracket';
            mobileTriggerIcon.classList.remove('hidden');
        }
        const avatarEl = document.getElementById(`${idPrefix}-header-auth-avatar`);
        if (avatarEl) avatarEl.classList.add('hidden');
        if (mobileTriggerText) mobileTriggerText.textContent = 'Login';
    }
}

function renderFlashAuthState({ idPrefix, currentUser, isLogged, displayName, accountUrl, signInUrl, ordersUrl }) {
    const desktopAuthContainer = document.getElementById(`${idPrefix}-desktop-auth-container`);
    const mobileAuthTriggerWrapper = document.getElementById(`${idPrefix}-mobile-auth-trigger-wrapper`);
    const safeName = escapeHtml(displayName);
    const targetUrl = isLogged ? accountUrl : signInUrl;
    const avatarUrl = resolveAuthAvatar(currentUser);

    if (desktopAuthContainer) {
        desktopAuthContainer.innerHTML = isLogged
            ? renderLoggedInDesktopAuth({ accountUrl, ordersUrl, safeName, avatarUrl })
            : renderLoggedOutAuthLink(signInUrl);
    }

    if (mobileAuthTriggerWrapper) {
        mobileAuthTriggerWrapper.innerHTML = renderMobileAuthLink({ isLogged, targetUrl, safeName });
    }
}

export function renderSharedAuthState(options = {}) {
    ensureRuntimeNavStyles();

    const page = options.page || 'news-home';
    const idPrefix = options.idPrefix || (page === 'flash' ? 'gxf' : 'ggx');
    const navigation = Array.isArray(options.navigation) ? options.navigation : [];
    const currentUser = options.currentUser || null;
    const isLogged = Boolean(currentUser);
    const displayName = resolveDisplayName(currentUser, options.displayName);
    const accountUrl = options.accountUrl || '/account/account.html';
    const ordersUrl = options.ordersUrl || '/account/account.html?tab=sales';
    const signInUrl = options.signInUrl || '/account/user.html';
    const activeTitle = options.activeTitle || '';
    const activeChildTitle = options.activeChildTitle || '';
    const activePath = options.activePath || (typeof window !== 'undefined' ? window.location.pathname : '');

    const desktopNav = document.getElementById(`${idPrefix}-desktop-nav`);
    const mobileNavLinks = document.getElementById(`${idPrefix}-mobile-nav-links`);

    if (desktopNav) {
        desktopNav.innerHTML = renderDesktopNav(page, navigation, activeTitle, activePath, activeChildTitle);
    }

    if (mobileNavLinks) {
        mobileNavLinks.innerHTML = renderMobileNav(navigation, activeTitle, activePath, activeChildTitle);
    }

    if (page === 'flash') {
        renderFlashAuthState({ idPrefix, currentUser, isLogged, displayName, accountUrl, signInUrl, ordersUrl });
    } else {
        renderNewsHomeAuthState({ idPrefix, currentUser, isLogged, displayName, accountUrl, signInUrl, ordersUrl });
    }
}

export function mountSharedHeader(container, options = {}) {
    if (!container) return;

    const page = options.page || 'news-home';
    const idPrefix = options.idPrefix || (page === 'flash' ? 'gxf' : 'ggx');
    const appGlobal = options.appGlobal || (page === 'flash' ? 'GGXFlashApp' : 'GGXNewsHomeApp');

    container.innerHTML = page === 'flash'
        ? renderFlashHeader({ idPrefix, appGlobal })
        : renderNewsHomeHeader({ idPrefix, appGlobal });
}

export function mountSharedFooter(container, options = {}) {
    if (!container) return;

    ensureRuntimeNavStyles();

    const variant = options.variant || 'full';
    const isMinimal = variant === 'minimal';
    container.innerHTML = isMinimal ? renderMinimalFooter() : renderFullFooter();

    if (!isMinimal) {
        bindHomepageFooterInteractions(container);
        mountManagedMainSiteFooter(container)
            .then((mountedManagedFooter) => {
                if (mountedManagedFooter) return null;

                return ensureSiteShellConfigLoaded()
                    .then(() => {
                        container.innerHTML = renderFullFooter();
                        bindHomepageFooterInteractions(container);
                        refreshHomepageFooterLinks(container);
                        refreshHomepageFooterContact(container);
                        refreshHomepageFooterSocial(container);
                        return shouldUseLegacyFooterOverrides() ? fetchFooterSocialSettings() : null;
                    })
                    .then((overrides) => {
                        if (!overrides) return null;
                        refreshHomepageFooterContact(container, overrides);
                        refreshHomepageFooterSocial(container, overrides);
                        return overrides;
                    });
            })
            .catch(() => undefined);
    }

    mountCookieConsentBanner();
}
