/*
 * Header navigation config.
 * - title/path/icon: top-level menu
 * - children: second-level menu list (optional)
 */
export const HEADER_NAVIGATION = [
    {
        title: 'HOME',
        path: '/news',
        icon: 'fa-house',
        children: [
             /*
            { title: 'Overview', path: '/news/generators' },
            { title: 'Buyer Guide', path: '/news/generators?view=guide' },
             */
        ],
    },
    {
        title: 'GASGX',
        path: '/index.html',
        icon: 'fa-arrow-up-right-from-square',
        children: [],
    },
    {
        title: 'FLASH',
        path: '/news/flash',
        icon: 'fa-bolt',
        children: [

        ],
    },
    {
        title: 'GAS ENERGY',
        path: '/news/gas-energy',
        icon: 'fa-fire',
        children: [

        ],
    },
    {
        title: 'GENERATORS',
        path: '/news/generators',
        icon: 'fa-gears',
        children: [
            /*
            { title: 'Overview', path: '/news/generators' },
            { title: 'Buyer Guide', path: '/news/generators?view=guide' },
             */
        ],
    },
    {
        title: 'MINING',
        path: '/news/mining',
        icon: 'fa-bitcoin-sign',
        children: [

        ],
    },
    {
        title: 'INSIGHTS',
        path: '/news/insights',
        icon: 'fa-chart-line',
        children: [

        ],
    },
    {
        title: 'DATA',
        path: '/news/data',
        icon: 'fa-database',
        children: [

        ],
    },
    {
        title: 'EVENTS',
        path: '/news/events',
        icon: 'fa-calendar-days',
        children: [

        ],
    },
];

const SUPABASE_URL = 'https://mkpcliytqudclkwtewru.supabase.co';
const SUPABASE_KEY = 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';
const SITE_SHELL_CONFIG_TABLE = 'site_shell_configs';
const SITE_SHELL_CONFIG_SCOPE = 'global';

const NAV_ICON_BY_SLUG = Object.freeze({
    home: 'fa-house',
    gasgx: 'fa-arrow-up-right-from-square',
    flash: 'fa-bolt',
    'gas-energy': 'fa-fire',
    generators: 'fa-gears',
    mining: 'fa-bitcoin-sign',
    insights: 'fa-chart-line',
    data: 'fa-database',
    events: 'fa-calendar-days',
    test: 'fa-flask',
});

let newsNavigationPromise = null;

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function normalizePath(path) {
    return String(path || '')
        .trim()
        .replace(/\/+$/, '') || '/';
}

function normalizeSlug(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/\/+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function pickTitle(rawTitle, fallbackPath = '') {
    if (typeof rawTitle === 'string' && rawTitle.trim()) return rawTitle.trim();
    if (rawTitle && typeof rawTitle === 'object') {
        if (typeof rawTitle.en === 'string' && rawTitle.en.trim()) return rawTitle.en.trim();
        if (typeof rawTitle.zh === 'string' && rawTitle.zh.trim()) return rawTitle.zh.trim();
    }
    const lastSegment = normalizePath(fallbackPath).split('/').filter(Boolean).pop() || '';
    return lastSegment ? lastSegment.toUpperCase() : 'ITEM';
}

function resolveIcon(path, title, fallbackIcon = 'fa-circle') {
    const pathSlug = normalizeSlug(normalizePath(path).split('/').filter(Boolean).pop() || '');
    const titleSlug = normalizeSlug(title);
    return NAV_ICON_BY_SLUG[pathSlug] || NAV_ICON_BY_SLUG[titleSlug] || fallbackIcon;
}

function extractNewsTopNavigation(shellNavigation) {
    const newsItem = Array.isArray(shellNavigation)
        ? shellNavigation.find((item) => normalizePath(item?.path) === '/news')
        : null;
    const children = Array.isArray(newsItem?.children) ? newsItem.children : [];
    if (children.length === 0) return deepClone(HEADER_NAVIGATION);

    return children
        .filter((item) => item && item.visible !== false && item.hidden !== true)
        .map((item) => {
            const path = normalizePath(item.path);
            const title = pickTitle(item.title, path).toUpperCase();
            return {
                title,
                path,
                icon: resolveIcon(path, title),
                children: [],
            };
        })
        .filter((item) => item.path && item.path !== '#');
}

function createSupabaseClient() {
    if (typeof window === 'undefined' || !window.supabase || typeof window.supabase.createClient !== 'function') return null;
    return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

export async function loadNewsNavigationFromSiteShell() {
    if (newsNavigationPromise) return newsNavigationPromise;

    newsNavigationPromise = (async () => {
        try {
            const client = createSupabaseClient();
            if (!client) return deepClone(HEADER_NAVIGATION);

            const { data, error } = await client
                .from(SITE_SHELL_CONFIG_TABLE)
                .select('config')
                .eq('scope', SITE_SHELL_CONFIG_SCOPE)
                .maybeSingle();

            if (error) throw error;
            const shellNavigation = data?.config?.navigation;
            const navigation = extractNewsTopNavigation(shellNavigation);
            return navigation.length ? navigation : deepClone(HEADER_NAVIGATION);
        } catch (error) {
            console.warn('[news-navigation] fallback to static navigation:', error);
            return deepClone(HEADER_NAVIGATION);
        }
    })();

    return newsNavigationPromise;
}
