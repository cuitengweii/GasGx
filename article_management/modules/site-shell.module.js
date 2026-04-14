import { client } from './supabase.client.js';

export const SITE_SHELL_CONFIG_TABLE = 'site_shell_configs';
export const SITE_SHELL_CONFIG_SCOPE = 'global';
export const SITE_SHELL_CONFIG_SCRIPT_SRC = '/shared/ui/site-shell.config.js';

const EMPTY_SITE_SHELL_CONFIG = Object.freeze({
    navigation: [],
    sharedText: {
        en: {},
        zh: {},
    },
    pages: {
        home: {
            meta: {
                title: {
                    zh: 'GasGx - 天然气发电挖矿',
                    en: 'GasGx - Natural Gas Power Mining',
                },
                description: {
                    zh: 'GasGx 提供全球天然气发电挖矿机会、政策状态与国家排名的总览。',
                    en: 'GasGx provides a global view of natural gas-powered mining opportunities, policy status, and country rankings.',
                },
            },
            heroCard: {
                label: {
                    zh: '分析范围',
                    en: 'Analysis Scope',
                },
                value: '25+',
                unit: {
                    zh: '国家',
                    en: 'Countries',
                },
            },
            map: {
                loadingText: {
                    zh: '正在加载挖矿数据...',
                    en: 'Loading Mining Data...',
                },
                rotateHint: {
                    zh: '拖拽旋转',
                    en: 'Drag to Rotate',
                },
            },
            ranking: {
                title: {
                    zh: '总分排行',
                    en: 'Total Score Ranking',
                },
                legendLegal: {
                    zh: '合法 / 高分',
                    en: 'Legal / High Score',
                },
                legendRestricted: {
                    zh: '受限',
                    en: 'Restricted',
                },
                legendBanned: {
                    zh: '禁止',
                    en: 'Banned',
                },
            },
            capture: {
                modalTitle: {
                    zh: '截图已生成！',
                    en: 'Snapshot Generated!',
                },
                modalDescription: {
                    zh: '整页截图已成功生成。',
                    en: 'Full page captured successfully.',
                },
                closeLabel: {
                    zh: '关闭',
                    en: 'Close',
                },
                qrSubtitle: {
                    zh: '扫码关注我们',
                    en: 'Scan to follow us',
                },
                qrHint: {
                    zh: '长按或截图保存二维码。',
                    en: 'Long press or screenshot to save the QR code.',
                },
                watermarkTagline: {
                    zh: '天然气发电挖矿助手',
                    en: 'Natural Gas Power Mining Assistant',
                },
                downloadFileName: 'GasGx-Map-Capture.png',
            },
        },
        aboutCompany: {
            meta: {
                title: {
                    zh: 'About GasGx | 天然气发电算力行业研究平台',
                    en: 'About GasGx | Natural Gas Power Mining Research Platform',
                },
            },
            texts: {
                zh: {},
                en: {},
                ru: {},
            },
            subscribe: {
                emailPlaceholder: {
                    zh: '请输入您的邮箱',
                    en: 'Enter your email',
                    ru: 'Введите ваш email',
                },
                invalidEmail: {
                    zh: '请输入有效的邮箱地址',
                    en: 'Please enter a valid email address',
                    ru: 'Введите корректный email',
                },
                recipientEmail: 'contact@gasgx.com',
                subject: 'GasGx 2026 行业白皮书',
            },
        },
        aboutContact: {
            meta: {
                title: {
                    zh: 'Contact GasGx | 联系我们',
                    en: 'Contact GasGx | Get in Touch',
                },
            },
            texts: {
                zh: {},
                en: {},
                ru: {},
            },
            contactEmail: 'contact@gasgx.com',
        },
    },
    site: {
        brand: {
            name: 'GasGx',
            homeHref: '/index.html',
            footerMeta: 'Energy-compute infrastructure for mining operators.',
            copyright: '© 2026 GasGx. All rights reserved.',
        },
        features: {
            backToTopEnabled: true,
            languageSwitcherEnabled: true,
            chatbotEnabled: false,
            chatApiUrl: '',
        },
        mainAuth: {
            storageKey: 'gasgx-main-auth',
            signInUrl: '/account/user.html',
            accountUrl: '/account/account.html',
            signOutRedirectUrl: '/account/user.html',
            returnUrlStorageKey: 'gx_main_return_url',
            supabaseUrl: 'https://mkpcliytqudclkwtewru.supabase.co',
            supabaseKey: 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw',
            providerRollout: {
                twitter: false,
                linkedin: false,
            },
        },
    },
    footer: {
        visible: true,
        socialEnabled: true,
        contact: {},
        privacyPolicy: {},
        socialLinks: [],
        partners: [],
    },
});

let staticConfigPromise = null;
let publishedConfigPromise = null;

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeText(value) {
    return String(value ?? '').trim();
}

function normalizeBoolean(value, fallback = true) {
    return typeof value === 'boolean' ? value : fallback;
}

export function deepClone(value) {
    return JSON.parse(JSON.stringify(value ?? null));
}

export function toLocalizedLabel(value, fallback = '') {
    if (isPlainObject(value)) {
        const zh = normalizeText(value.zh || fallback);
        const en = normalizeText(value.en || value.zh || fallback);
        return { zh, en };
    }

    const text = normalizeText(value || fallback);
    return { zh: text, en: text };
}

export function createSiteShellNavChild(seed = {}) {
    const rawGroupKey = String(seed.groupKey || seed.group || '').trim().toLowerCase();
    const groupKey = rawGroupKey === 'application' || rawGroupKey === 'solution' ? rawGroupKey : '';
    return {
        title: toLocalizedLabel(seed.title, seed.label || ''),
        path: normalizeText(seed.path),
        visible: seed.visible !== false,
        target: normalizeText(seed.target),
        rel: normalizeText(seed.rel),
        groupKey,
    };
}

export function createSiteShellMegaItem(seed = {}) {
    return {
        title: toLocalizedLabel(seed.title, seed.label || ''),
        path: normalizeText(seed.path),
        visible: seed.visible !== false,
        target: normalizeText(seed.target),
        rel: normalizeText(seed.rel),
    };
}

export function createSiteShellMegaSection(seed = {}) {
    const items = Array.isArray(seed.items) ? seed.items.map((item) => createSiteShellMegaItem(item)) : [];
    return {
        header: toLocalizedLabel(seed.header, ''),
        visible: seed.visible !== false,
        items,
    };
}

export function createSiteShellNavItem(type = 'link', seed = {}) {
    const safeType = ['menu', 'mega'].includes(String(type || seed.type || '').trim()) ? String(type || seed.type).trim() : 'link';
    const base = {
        title: toLocalizedLabel(seed.title, seed.label || ''),
        path: normalizeText(seed.path),
        type: safeType,
        icon: normalizeText(seed.icon),
        visible: seed.visible !== false,
        target: normalizeText(seed.target),
        rel: normalizeText(seed.rel),
    };

    if (safeType === 'menu') {
        return {
            ...base,
            children: Array.isArray(seed.children) ? seed.children.map((item) => createSiteShellNavChild(item)) : [],
        };
    }

    if (safeType === 'mega') {
        return {
            ...base,
            gridCols: normalizeText(seed.gridCols),
            sections: Array.isArray(seed.sections) ? seed.sections.map((section) => createSiteShellMegaSection(section)) : [],
        };
    }

    return base;
}

const NEWS_NAVIGATION_ITEM_SEED = Object.freeze({
    title: { zh: '新闻', en: 'News' },
    path: '/news/',
    type: 'menu',
    icon: 'fa-solid fa-newspaper',
    children: [
        { title: { zh: '首页', en: 'Home' }, path: '/news/' },
        { title: { zh: '快讯', en: 'Flash' }, path: '/news/flash' },
        { title: { zh: '天然气能源', en: 'Gas Energy' }, path: '/news/gas-energy' },
        { title: { zh: '发电机组', en: 'Generators' }, path: '/news/generators' },
        { title: { zh: '挖矿', en: 'Mining' }, path: '/news/mining' },
        { title: { zh: '洞察', en: 'Insights' }, path: '/news/insights' },
        { title: { zh: '数据', en: 'Data' }, path: '/news/data' },
        { title: { zh: '活动', en: 'Events' }, path: '/news/events' },
    ],
});

function normalizeNavigationPath(path) {
    const value = normalizeText(path).toLowerCase();
    if (!value) return '';
    return value.replace(/\/+$/, '') || '/';
}

function isNewsNavigationItemSeed(item) {
    const path = normalizeNavigationPath(item?.path);
    return path === '/news' || path === '/news/index.html';
}

function isNewsNavigationHomeItemSeed(item) {
    const path = normalizeNavigationPath(item?.path);
    return path === '/news' || path === '/news/index.html';
}

function ensureNewsNavigationChildren(children, fallbackChildren = []) {
    const working = Array.isArray(children) ? deepClone(children) : [];
    const fallbackList = Array.isArray(fallbackChildren) ? deepClone(fallbackChildren) : [];
    const fallbackHome = fallbackList.find((item) => isNewsNavigationHomeItemSeed(item));
    const defaultHome = deepClone(fallbackHome || NEWS_NAVIGATION_ITEM_SEED.children[0]);
    const existingIndex = working.findIndex((item) => isNewsNavigationHomeItemSeed(item));
    const existing = existingIndex >= 0 ? working.splice(existingIndex, 1)[0] : null;
    const mergedHome = {
        ...defaultHome,
        ...(existing || {}),
        path: normalizeText(existing?.path || defaultHome.path || '/news/') || '/news/',
        title: {
            ...(defaultHome.title || {}),
            ...(existing?.title || {}),
        },
    };
    working.unshift(mergedHome);
    return working;
}

function ensureNewsNavigationItems(sourceNavigation, fallbackNavigation = []) {
    const working = Array.isArray(sourceNavigation) ? deepClone(sourceNavigation) : [];
    const fallbackList = Array.isArray(fallbackNavigation) ? deepClone(fallbackNavigation) : [];
    const fallbackNews = fallbackList.find((item) => isNewsNavigationItemSeed(item));
    const defaultNews = deepClone(fallbackNews || NEWS_NAVIGATION_ITEM_SEED);
    const existingIndex = working.findIndex((item) => isNewsNavigationItemSeed(item));
    const existing = existingIndex >= 0 ? working.splice(existingIndex, 1)[0] : null;
    const mergedNews = {
        ...defaultNews,
        ...(existing || {}),
        type: 'menu',
        path: normalizeText(existing?.path || defaultNews.path || '/news/') || '/news/',
        icon: normalizeText(existing?.icon || defaultNews.icon || 'fa-solid fa-newspaper'),
        title: {
            ...(defaultNews.title || {}),
            ...(existing?.title || {}),
        },
        children: ensureNewsNavigationChildren(
            Array.isArray(existing?.children) && existing.children.length ? existing.children : deepClone(defaultNews.children || []),
            deepClone(defaultNews.children || []),
        ),
    };

    const insertIndex = working.length > 0 ? 1 : 0;
    working.splice(Math.min(insertIndex, working.length), 0, mergedNews);
    return working;
}

export function createSiteShellSocialLink(seed = {}) {
    return {
        id: normalizeText(seed.id),
        enabled: seed.enabled !== false,
        visible: seed.visible !== false,
        hidden: seed.hidden === true,
        mode: normalizeText(seed.mode || 'link') || 'link',
        href: normalizeText(seed.href),
        qrType: normalizeText(seed.qrType),
        iconClass: normalizeText(seed.iconClass),
        text: normalizeText(seed.text),
        ariaLabel: normalizeText(seed.ariaLabel),
        target: normalizeText(seed.target || '_blank'),
        rel: normalizeText(seed.rel || 'noopener noreferrer'),
    };
}

export function createSiteShellPartner(seed = {}) {
    return {
        id: normalizeText(seed.id),
        title: normalizeText(seed.title),
        href: normalizeText(seed.href),
        visible: seed.visible !== false,
        target: normalizeText(seed.target || '_blank'),
        rel: normalizeText(seed.rel || 'noopener noreferrer'),
    };
}

function normalizeSharedText(source, fallback) {
    const safeSource = isPlainObject(source) ? source : {};
    const safeFallback = isPlainObject(fallback) ? fallback : {};
    return {
        en: { ...(safeFallback.en || {}), ...(safeSource.en || {}) },
        zh: { ...(safeFallback.zh || {}), ...(safeSource.zh || {}) },
    };
}

function normalizeHomePageConfig(source, fallback) {
    const safeSource = isPlainObject(source) ? source : {};
    const safeFallback = isPlainObject(fallback) ? fallback : {};
    const safeMetaSource = isPlainObject(safeSource.meta) ? safeSource.meta : {};
    const safeMetaFallback = isPlainObject(safeFallback.meta) ? safeFallback.meta : {};
    const safeHeroSource = isPlainObject(safeSource.heroCard) ? safeSource.heroCard : {};
    const safeHeroFallback = isPlainObject(safeFallback.heroCard) ? safeFallback.heroCard : {};
    const safeMapSource = isPlainObject(safeSource.map) ? safeSource.map : {};
    const safeMapFallback = isPlainObject(safeFallback.map) ? safeFallback.map : {};
    const safeRankingSource = isPlainObject(safeSource.ranking) ? safeSource.ranking : {};
    const safeRankingFallback = isPlainObject(safeFallback.ranking) ? safeFallback.ranking : {};
    const safeCaptureSource = isPlainObject(safeSource.capture) ? safeSource.capture : {};
    const safeCaptureFallback = isPlainObject(safeFallback.capture) ? safeFallback.capture : {};

    return {
        meta: {
            title: toLocalizedLabel(safeMetaSource.title || safeMetaFallback.title || 'GasGx - Natural Gas Power Mining', 'GasGx - Natural Gas Power Mining'),
            description: toLocalizedLabel(
                safeMetaSource.description || safeMetaFallback.description || 'GasGx provides a global view of natural gas-powered mining opportunities, policy status, and country rankings.',
                'GasGx provides a global view of natural gas-powered mining opportunities, policy status, and country rankings.',
            ),
        },
        heroCard: {
            label: toLocalizedLabel(safeHeroSource.label || safeHeroFallback.label || 'Analysis Scope', 'Analysis Scope'),
            value: normalizeText(safeHeroSource.value || safeHeroFallback.value || '25+') || '25+',
            unit: toLocalizedLabel(safeHeroSource.unit || safeHeroFallback.unit || 'Countries', 'Countries'),
        },
        map: {
            loadingText: toLocalizedLabel(safeMapSource.loadingText || safeMapFallback.loadingText || 'Loading Mining Data...', 'Loading Mining Data...'),
            rotateHint: toLocalizedLabel(safeMapSource.rotateHint || safeMapFallback.rotateHint || 'Drag to Rotate', 'Drag to Rotate'),
        },
        ranking: {
            title: toLocalizedLabel(safeRankingSource.title || safeRankingFallback.title || 'Total Score Ranking', 'Total Score Ranking'),
            legendLegal: toLocalizedLabel(safeRankingSource.legendLegal || safeRankingFallback.legendLegal || 'Legal / High Score', 'Legal / High Score'),
            legendRestricted: toLocalizedLabel(safeRankingSource.legendRestricted || safeRankingFallback.legendRestricted || 'Restricted', 'Restricted'),
            legendBanned: toLocalizedLabel(safeRankingSource.legendBanned || safeRankingFallback.legendBanned || 'Banned', 'Banned'),
        },
        capture: {
            modalTitle: toLocalizedLabel(safeCaptureSource.modalTitle || safeCaptureFallback.modalTitle || 'Snapshot Generated!', 'Snapshot Generated!'),
            modalDescription: toLocalizedLabel(
                safeCaptureSource.modalDescription || safeCaptureFallback.modalDescription || 'Full page captured successfully.',
                'Full page captured successfully.',
            ),
            closeLabel: toLocalizedLabel(safeCaptureSource.closeLabel || safeCaptureFallback.closeLabel || 'Close', 'Close'),
            qrSubtitle: toLocalizedLabel(safeCaptureSource.qrSubtitle || safeCaptureFallback.qrSubtitle || 'Scan to follow us', 'Scan to follow us'),
            qrHint: toLocalizedLabel(
                safeCaptureSource.qrHint || safeCaptureFallback.qrHint || 'Long press or screenshot to save the QR code.',
                'Long press or screenshot to save the QR code.',
            ),
            watermarkTagline: toLocalizedLabel(
                safeCaptureSource.watermarkTagline || safeCaptureFallback.watermarkTagline || 'Natural Gas Power Mining Assistant',
                'Natural Gas Power Mining Assistant',
            ),
            downloadFileName: normalizeText(safeCaptureSource.downloadFileName || safeCaptureFallback.downloadFileName || 'GasGx-Map-Capture.png') || 'GasGx-Map-Capture.png',
        },
    };
}

function normalizeTextDictionary(source, fallback) {
    const safeSource = isPlainObject(source) ? source : {};
    const safeFallback = isPlainObject(fallback) ? fallback : {};
    return {
        zh: { ...(safeFallback.zh || {}), ...(safeSource.zh || {}) },
        en: { ...(safeFallback.en || {}), ...(safeSource.en || {}) },
        ru: { ...(safeFallback.ru || {}) },
        ...(isPlainObject(safeSource.ru) ? { ru: { ...(safeFallback.ru || {}), ...(safeSource.ru || {}) } } : {}),
    };
}

function normalizeAboutCompanyConfig(source, fallback) {
    const safeSource = isPlainObject(source) ? source : {};
    const safeFallback = isPlainObject(fallback) ? fallback : {};
    return {
        meta: {
            title: toLocalizedLabel(
                safeSource.meta?.title || safeFallback.meta?.title || 'About GasGx | Natural Gas Power Mining Research Platform',
                'About GasGx | Natural Gas Power Mining Research Platform',
            ),
        },
        texts: normalizeTextDictionary(safeSource.texts, safeFallback.texts),
        subscribe: {
            emailPlaceholder: {
                zh: normalizeText(safeSource.subscribe?.emailPlaceholder?.zh || safeFallback.subscribe?.emailPlaceholder?.zh || '请输入您的邮箱'),
                en: normalizeText(safeSource.subscribe?.emailPlaceholder?.en || safeFallback.subscribe?.emailPlaceholder?.en || 'Enter your email'),
                ru: normalizeText(safeSource.subscribe?.emailPlaceholder?.ru || safeFallback.subscribe?.emailPlaceholder?.ru || 'Введите ваш email'),
            },
            invalidEmail: {
                zh: normalizeText(safeSource.subscribe?.invalidEmail?.zh || safeFallback.subscribe?.invalidEmail?.zh || '请输入有效的邮箱地址'),
                en: normalizeText(safeSource.subscribe?.invalidEmail?.en || safeFallback.subscribe?.invalidEmail?.en || 'Please enter a valid email address'),
                ru: normalizeText(safeSource.subscribe?.invalidEmail?.ru || safeFallback.subscribe?.invalidEmail?.ru || 'Введите корректный email'),
            },
            recipientEmail: normalizeText(safeSource.subscribe?.recipientEmail || safeFallback.subscribe?.recipientEmail || 'contact@gasgx.com') || 'contact@gasgx.com',
            subject: normalizeText(safeSource.subscribe?.subject || safeFallback.subscribe?.subject || 'GasGx 2026 行业白皮书') || 'GasGx 2026 行业白皮书',
        },
    };
}

function normalizeAboutContactConfig(source, fallback) {
    const safeSource = isPlainObject(source) ? source : {};
    const safeFallback = isPlainObject(fallback) ? fallback : {};
    return {
        meta: {
            title: toLocalizedLabel(
                safeSource.meta?.title || safeFallback.meta?.title || 'Contact GasGx | Get in Touch',
                'Contact GasGx | Get in Touch',
            ),
        },
        texts: normalizeTextDictionary(safeSource.texts, safeFallback.texts),
        contactEmail: normalizeText(safeSource.contactEmail || safeFallback.contactEmail || 'contact@gasgx.com') || 'contact@gasgx.com',
    };
}

function normalizePagesConfig(source, fallback) {
    const safeSource = isPlainObject(source) ? source : {};
    const safeFallback = isPlainObject(fallback) ? fallback : {};
    return {
        home: normalizeHomePageConfig(safeSource.home, safeFallback.home),
        aboutCompany: normalizeAboutCompanyConfig(safeSource.aboutCompany, safeFallback.aboutCompany),
        aboutContact: normalizeAboutContactConfig(safeSource.aboutContact, safeFallback.aboutContact),
    };
}

function normalizeSiteBrandConfig(source, fallback) {
    const safeSource = isPlainObject(source) ? source : {};
    const safeFallback = isPlainObject(fallback) ? fallback : {};
    return {
        name: normalizeText(safeSource.name || safeFallback.name || 'GasGx') || 'GasGx',
        homeHref: normalizeText(safeSource.homeHref || safeFallback.homeHref || '/index.html') || '/index.html',
        footerMeta: normalizeText(safeSource.footerMeta || safeFallback.footerMeta || 'Energy-compute infrastructure for mining operators.'),
        copyright: normalizeText(safeSource.copyright || safeFallback.copyright || '© 2026 GasGx. All rights reserved.'),
    };
}

function normalizeSiteFeatures(source, fallback) {
    const safeSource = isPlainObject(source) ? source : {};
    const safeFallback = isPlainObject(fallback) ? fallback : {};
    return {
        backToTopEnabled: normalizeBoolean(safeSource.backToTopEnabled, normalizeBoolean(safeFallback.backToTopEnabled, true)),
        languageSwitcherEnabled: normalizeBoolean(safeSource.languageSwitcherEnabled, normalizeBoolean(safeFallback.languageSwitcherEnabled, true)),
        chatbotEnabled: normalizeBoolean(safeSource.chatbotEnabled, normalizeBoolean(safeFallback.chatbotEnabled, false)),
        chatApiUrl: normalizeText(safeSource.chatApiUrl || safeFallback.chatApiUrl || ''),
    };
}

function normalizeSiteMainAuth(source, fallback) {
    const safeSource = isPlainObject(source) ? source : {};
    const safeFallback = isPlainObject(fallback) ? fallback : {};
    const sourceProviderRollout = isPlainObject(safeSource.providerRollout) ? safeSource.providerRollout : {};
    const fallbackProviderRollout = isPlainObject(safeFallback.providerRollout) ? safeFallback.providerRollout : {};
    return {
        storageKey: normalizeText(safeSource.storageKey || safeFallback.storageKey || 'gasgx-main-auth') || 'gasgx-main-auth',
        signInUrl: normalizeText(safeSource.signInUrl || safeFallback.signInUrl || '/account/user.html') || '/account/user.html',
        accountUrl: normalizeText(safeSource.accountUrl || safeFallback.accountUrl || '/account/account.html') || '/account/account.html',
        signOutRedirectUrl: normalizeText(safeSource.signOutRedirectUrl || safeFallback.signOutRedirectUrl || '/account/user.html') || '/account/user.html',
        returnUrlStorageKey: normalizeText(safeSource.returnUrlStorageKey || safeFallback.returnUrlStorageKey || 'gx_main_return_url') || 'gx_main_return_url',
        supabaseUrl: normalizeText(safeSource.supabaseUrl || safeFallback.supabaseUrl || 'https://mkpcliytqudclkwtewru.supabase.co'),
        supabaseKey: normalizeText(safeSource.supabaseKey || safeFallback.supabaseKey || 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw'),
        providerRollout: {
            twitter: normalizeBoolean(sourceProviderRollout.twitter, normalizeBoolean(fallbackProviderRollout.twitter, false)),
            linkedin: normalizeBoolean(sourceProviderRollout.linkedin, normalizeBoolean(fallbackProviderRollout.linkedin, false)),
        },
    };
}

function normalizeSiteConfig(source, fallback) {
    const safeSource = isPlainObject(source) ? source : {};
    const safeFallback = isPlainObject(fallback) ? fallback : {};
    return {
        brand: normalizeSiteBrandConfig(safeSource.brand, safeFallback.brand),
        features: normalizeSiteFeatures(safeSource.features, safeFallback.features),
        mainAuth: normalizeSiteMainAuth(safeSource.mainAuth, safeFallback.mainAuth),
    };
}

function normalizeFooterConfig(source, fallback) {
    const safeSource = isPlainObject(source) ? source : {};
    const safeFallback = isPlainObject(fallback) ? fallback : {};
    return {
        ...safeFallback,
        ...safeSource,
        visible: safeSource.visible !== false,
        socialEnabled: safeSource.socialEnabled !== false,
        contact: {
            ...(safeFallback.contact || {}),
            ...(safeSource.contact || {}),
        },
        privacyPolicy: {
            ...(safeFallback.privacyPolicy || {}),
            ...(safeSource.privacyPolicy || {}),
            text: toLocalizedLabel(safeSource.privacyPolicy?.text || safeFallback.privacyPolicy?.text || 'Privacy Policy', 'Privacy Policy'),
        },
        socialLinks: (Array.isArray(safeSource.socialLinks) ? safeSource.socialLinks : Array.isArray(safeFallback.socialLinks) ? safeFallback.socialLinks : [])
            .map((item) => createSiteShellSocialLink(item)),
        partners: (Array.isArray(safeSource.partners) ? safeSource.partners : Array.isArray(safeFallback.partners) ? safeFallback.partners : [])
            .map((item) => createSiteShellPartner(item)),
    };
}

export function normalizeSiteShellConfig(config, fallback = EMPTY_SITE_SHELL_CONFIG) {
    const safeSource = isPlainObject(config) ? config : {};
    const safeFallback = isPlainObject(fallback) ? fallback : EMPTY_SITE_SHELL_CONFIG;
    const navigationSeeds = ensureNewsNavigationItems(
        Array.isArray(safeSource.navigation) ? safeSource.navigation : Array.isArray(safeFallback.navigation) ? safeFallback.navigation : [],
        Array.isArray(safeFallback.navigation) ? safeFallback.navigation : [],
    );
    return {
        ...safeFallback,
        ...safeSource,
        navigation: navigationSeeds.map((item) => createSiteShellNavItem(item?.type, item)),
        sharedText: normalizeSharedText(safeSource.sharedText, safeFallback.sharedText),
        pages: normalizePagesConfig(safeSource.pages, safeFallback.pages),
        site: normalizeSiteConfig(safeSource.site, safeFallback.site),
        footer: normalizeFooterConfig(safeSource.footer, safeFallback.footer),
    };
}

export function resetSiteShellConfigCache() {
    publishedConfigPromise = null;
}

function ensureSiteShellScript() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return Promise.resolve(null);
    }

    if (window.GASGX_SITE_SHELL_CONFIG && typeof window.GASGX_SITE_SHELL_CONFIG === 'object') {
        return Promise.resolve(window.GASGX_SITE_SHELL_CONFIG);
    }

    if (staticConfigPromise) return staticConfigPromise;

    staticConfigPromise = new Promise((resolve) => {
        const done = () => resolve(window.GASGX_SITE_SHELL_CONFIG || null);
        const fail = () => resolve(null);
        const existing = document.querySelector('script[data-ams-site-shell-config="1"]');

        if (existing) {
            existing.addEventListener('load', done, { once: true });
            existing.addEventListener('error', fail, { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = SITE_SHELL_CONFIG_SCRIPT_SRC;
        script.async = true;
        script.dataset.amsSiteShellConfig = '1';
        script.addEventListener('load', done, { once: true });
        script.addEventListener('error', fail, { once: true });
        document.head.appendChild(script);
    });

    return staticConfigPromise;
}

export async function ensureStaticSiteShellConfigLoaded() {
    const config = await ensureSiteShellScript();
    return normalizeSiteShellConfig(config, EMPTY_SITE_SHELL_CONFIG);
}

export async function fetchPublishedSiteShellConfig(forceRefresh = false) {
    if (!forceRefresh && publishedConfigPromise) return publishedConfigPromise;

    publishedConfigPromise = client
        .from(SITE_SHELL_CONFIG_TABLE)
        .select('scope,config,updated_at,updated_by')
        .eq('scope', SITE_SHELL_CONFIG_SCOPE)
        .maybeSingle()
        .then(({ data, error }) => {
            if (error) throw error;
            return data || null;
        });

    return publishedConfigPromise;
}

export async function loadSiteShellConfig(forceRefresh = false) {
    const fallbackConfig = await ensureStaticSiteShellConfigLoaded();

    try {
        const row = await fetchPublishedSiteShellConfig(forceRefresh);
        if (row?.config && isPlainObject(row.config)) {
            const config = normalizeSiteShellConfig(row.config, fallbackConfig);
            if (typeof window !== 'undefined') {
                window.GASGX_SITE_SHELL_CONFIG = deepClone(config);
            }
            return {
                config,
                source: 'supabase',
                row,
                error: null,
            };
        }
    } catch (error) {
        return {
            config: fallbackConfig,
            source: 'static',
            row: null,
            error,
        };
    }

    return {
        config: fallbackConfig,
        source: 'static',
        row: null,
        error: null,
    };
}

export async function savePublishedSiteShellConfig(config, user = null) {
    const payloadConfig = normalizeSiteShellConfig(config, EMPTY_SITE_SHELL_CONFIG);
    const timestamp = new Date().toISOString();
    const updatedBy = normalizeText(user?.email || user?.id || user || '');
    const payload = {
        scope: SITE_SHELL_CONFIG_SCOPE,
        config: payloadConfig,
        updated_at: timestamp,
        updated_by: updatedBy || null,
    };

    let { data, error } = await client
        .from(SITE_SHELL_CONFIG_TABLE)
        .upsert([payload], { onConflict: 'scope' })
        .select('scope,config,updated_at,updated_by')
        .single();

    if (error) {
        const text = String(error?.message || '').toLowerCase();
        if (text.includes('updated_at') || text.includes('updated_by')) {
            const fallback = await client
                .from(SITE_SHELL_CONFIG_TABLE)
                .upsert([{ scope: SITE_SHELL_CONFIG_SCOPE, config: payloadConfig }], { onConflict: 'scope' })
                .select('scope,config,updated_at,updated_by')
                .single();
            data = fallback.data;
            error = fallback.error;
        }
    }

    if (error) throw error;

    resetSiteShellConfigCache();
    if (typeof window !== 'undefined') {
        window.GASGX_SITE_SHELL_CONFIG = deepClone(payloadConfig);
    }

    return {
        ...(data || {}),
        config: payloadConfig,
    };
}
