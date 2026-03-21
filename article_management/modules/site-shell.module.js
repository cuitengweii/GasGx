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
    return {
        title: toLocalizedLabel(seed.title, seed.label || ''),
        path: normalizeText(seed.path),
        visible: seed.visible !== false,
        target: normalizeText(seed.target),
        rel: normalizeText(seed.rel),
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
    return {
        ...safeFallback,
        ...safeSource,
        navigation: (Array.isArray(safeSource.navigation) ? safeSource.navigation : Array.isArray(safeFallback.navigation) ? safeFallback.navigation : [])
            .map((item) => createSiteShellNavItem(item?.type, item)),
        sharedText: normalizeSharedText(safeSource.sharedText, safeFallback.sharedText),
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
