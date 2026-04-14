import { mountSharedHeader, mountSharedFooter, renderSharedAuthState } from './layout.shared.js?v=20260413authmenu03';
import { HEADER_NAVIGATION } from '../config/navigation.config.js';

const DEFAULT_MAIN_AUTH = Object.freeze({
    storageKey: 'gasgx-main-auth',
    supabaseUrl: 'https://mkpcliytqudclkwtewru.supabase.co',
    supabaseKey: 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw',
});
const MAIN_AUTH_SHARED_SRC = '/shared/ui/main-auth.shared.js?v=20260322authshared01';
const LEGACY_HIDDEN_STYLE_ID = 'gsh-legacy-hidden-style';
const LEGACY_HIDDEN_CLASS = 'gsh-legacy-hidden';
let legacyAuthClient = null;
let legacyAuthConfig = null;
let mainAuthHelperPromise = null;

function loadMainAuthHelper() {
    if (window.GasGxMainAuthShared) {
        return Promise.resolve(window.GasGxMainAuthShared);
    }
    if (mainAuthHelperPromise) {
        return mainAuthHelperPromise;
    }

    mainAuthHelperPromise = new Promise((resolve, reject) => {
        const existingScript = Array.from(document.querySelectorAll('script')).find((script) => {
            return String(script.src || '').includes('/shared/ui/main-auth.shared.js');
        });

        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(window.GasGxMainAuthShared), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Failed to load main auth shared helper.')), { once: true });
            if (window.GasGxMainAuthShared) {
                resolve(window.GasGxMainAuthShared);
            }
            return;
        }

        const script = document.createElement('script');
        script.src = MAIN_AUTH_SHARED_SRC;
        script.async = true;
        script.onload = () => resolve(window.GasGxMainAuthShared);
        script.onerror = () => reject(new Error('Failed to load main auth shared helper.'));
        document.head.appendChild(script);
    });

    return mainAuthHelperPromise;
}

function getLegacyMainAuthConfig() {
    const source = window.GASGX_SITE_SHELL_CONFIG?.site?.mainAuth || {};
    const helper = window.GasGxMainAuthShared;
    if (helper && typeof helper.resolveConfig === 'function') {
        return helper.resolveConfig(source);
    }
    return {
        storageKey: typeof source.storageKey === 'string' && source.storageKey.trim() ? source.storageKey.trim() : DEFAULT_MAIN_AUTH.storageKey,
        signInUrl: '/account/user.html',
        accountUrl: '/account/account.html',
        signOutRedirectUrl: '/account/user.html',
        returnUrlStorageKey: 'gx_main_return_url',
        supabaseUrl: typeof source.supabaseUrl === 'string' && source.supabaseUrl.trim() ? source.supabaseUrl.trim() : DEFAULT_MAIN_AUTH.supabaseUrl,
        supabaseKey: typeof source.supabaseKey === 'string' && source.supabaseKey.trim() ? source.supabaseKey.trim() : DEFAULT_MAIN_AUTH.supabaseKey,
        providerRollout: { twitter: false, linkedin: false }
    };
}

function createLegacyClient(authConfig) {
    const helper = window.GasGxMainAuthShared;
    if (helper && typeof helper.createClient === 'function') {
        return helper.createClient(window.supabase, authConfig);
    }
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        return null;
    }
    return window.supabase.createClient(authConfig.supabaseUrl, authConfig.supabaseKey, {
        auth: {
            storageKey: authConfig.storageKey,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    });
}

function ensureLegacyHiddenStyle() {
    if (document.getElementById(LEGACY_HIDDEN_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = LEGACY_HIDDEN_STYLE_ID;
    style.textContent = `
        .${LEGACY_HIDDEN_CLASS} { display: none !important; }
    `;
    document.head.appendChild(style);
}

function ensureSharedStylesheet() {
    const marker = '/news/shared/modules/styles/layout.shared.css';
    const exists = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some((link) => String(link.href || '').includes(marker));
    if (exists) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = marker;
    document.head.appendChild(link);
}

function ensureSlot(id, position) {
    const existing = document.getElementById(id);
    if (existing) return existing;

    const slot = document.createElement('div');
    slot.id = id;

    if (position === 'start') {
        document.body.insertBefore(slot, document.body.firstChild);
    } else {
        document.body.appendChild(slot);
    }

    return slot;
}

function hideLegacyHeaderFooter() {
    ensureLegacyHiddenStyle();

    Array.from(document.body.children).forEach((node) => {
        if (node.id === 'gsh-header-slot' || node.id === 'gsh-footer-slot') return;
        if (node.tagName === 'HEADER' || node.tagName === 'FOOTER') {
            node.classList.add(LEGACY_HIDDEN_CLASS);
        }
    });

    [
        'global-menu-overlay',
        'global-mobile-menu',
        'mobile-menu-overlay',
        'mobile-menu-container',
        'desktop-nav',
        'auth-btn-container',
        'header-account-trigger',
        'mobile-trigger-text',
        'gxf-header-account-trigger',
        'gxf-mobile-trigger-text',
    ].forEach((id) => {
        const node = document.getElementById(id);
        if (node) node.classList.add(LEGACY_HIDDEN_CLASS);
    });
}

function detectPage(pathname) {
    return pathname.startsWith('/news/flash') ? 'flash' : 'news-home';
}

function detectActiveTitle(pathname) {
    const path = pathname.toLowerCase();
    if (path.startsWith('/news/flash')) return 'FLASH';
    if (path.startsWith('/news/gas-energy')) return 'GAS ENERGY';
    if (path.startsWith('/news/generators')) return 'GENERATORS';
    if (path.startsWith('/news/mining')) return 'MINING';
    if (path.startsWith('/news/insights')) return 'INSIGHTS';
    if (path.startsWith('/news/data') || path === '/news/data.html') return 'DATA';
    if (path.startsWith('/news/events')) return 'EVENTS';
    return 'HOME';
}

function toggleNewsHomeMenu(idPrefix) {
    const menu = document.getElementById(`${idPrefix}-mobile-menu-container`);
    const overlay = document.getElementById(`${idPrefix}-mobile-menu-overlay`);
    if (!menu || !overlay) return;

    const hidden = menu.classList.contains('translate-x-full');
    if (hidden) {
        menu.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
    } else {
        menu.classList.add('translate-x-full');
        overlay.classList.add('hidden');
    }
}

function toggleFlashMenu(idPrefix) {
    const drawer = document.getElementById(`${idPrefix}-mobile-menu-drawer`);
    const overlay = document.getElementById(`${idPrefix}-mobile-menu-overlay`);
    if (!drawer || !overlay) return;

    const hidden = drawer.classList.contains('translate-x-full');
    if (hidden) {
        drawer.classList.remove('translate-x-full');
        overlay.classList.remove('hidden', 'opacity-0');
    } else {
        drawer.classList.add('translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

function ensureMobileToggleBridge(page, appGlobal, idPrefix) {
    if (!window[appGlobal]) window[appGlobal] = {};
    window[appGlobal].toggleMobileMenu = () => {
        if (page === 'flash') toggleFlashMenu(idPrefix);
        else toggleNewsHomeMenu(idPrefix);
    };
}

async function resolveDisplayName(client, sessionUser) {
    if (!sessionUser) return null;
    const meta = sessionUser.user_metadata || {};
    const fallback = meta.full_name || (sessionUser.email ? sessionUser.email.split('@')[0] : 'Sign In');

    try {
        const { data: profile } = await client.from('profiles').select('full_name').eq('id', sessionUser.id).single();
        if (profile && profile.full_name) return profile.full_name;
    } catch (e) {
        console.log('Legacy shell profile fetch warning:', e);
    }

    return fallback;
}

function applySharedNavState({ page, idPrefix, currentUser, displayName, activeTitle, activePath }) {
    renderSharedAuthState({
        page,
        idPrefix,
        navigation: HEADER_NAVIGATION,
        currentUser,
        displayName,
        accountUrl: '/account/account.html',
        signInUrl: '/account/user.html',
        activeTitle,
        activePath,
    });
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function loadLegacyLiveTicker(idPrefix) {
    const container = document.getElementById(`${idPrefix}-live-data-container`);
    if (!container || !window.supabase || typeof window.supabase.createClient !== 'function') return;

    try {
        const client = window.supabase.createClient(DEFAULT_MAIN_AUTH.supabaseUrl, DEFAULT_MAIN_AUTH.supabaseKey);
        const { data } = await client
            .from('homepage_scrolling_data')
            .select('*')
            .order('sort_order', { ascending: true });

        if (!Array.isArray(data) || data.length === 0) return;

        const html = data
            .map((item) => {
                const color = item.status === 'positive'
                    ? 'text-green-400'
                    : item.status === 'negative'
                        ? 'text-red-500'
                        : 'text-gray-500';
                const label = escapeHtml(item.label || '--');
                const value = escapeHtml(item.display_value || '--');
                const unit = item.unit ? `<span class="text-gray-600 text-[10px]">${escapeHtml(item.unit)}</span>` : '';
                const extra = item.secondary_text ? `<span class="${color} text-[10px]">${escapeHtml(item.secondary_text)}</span>` : '';
                return `<div class="flex items-center gap-2 text-xs font-mono text-gray-400 whitespace-nowrap"><span class="text-purple-400 font-bold">${label}</span><span class="text-white font-bold">${value}</span>${unit}${extra}</div>`;
            })
            .join('');

        container.innerHTML = `<div class="flex items-center gap-12">${html}</div>`.repeat(2);
    } catch (error) {
        console.error('Legacy shell ticker load failed:', error);
    }
}

function clearLegacyAuthStorage(authConfig) {
    if (!authConfig) return;
    const helper = window.GasGxMainAuthShared;
    if (helper && typeof helper.clearStorage === 'function') {
        helper.clearStorage(authConfig);
        return;
    }
    [authConfig.storageKey, `${authConfig.storageKey}-code-verifier`].forEach((key) => {
        try { window.localStorage.removeItem(key); } catch (error) { console.warn('Legacy auth localStorage cleanup warning:', error); }
        try { window.sessionStorage.removeItem(key); } catch (error) { console.warn('Legacy auth sessionStorage cleanup warning:', error); }
    });
}

async function signOutLegacyAuth() {
    await loadMainAuthHelper().catch(() => null);
    const authConfig = legacyAuthConfig || getLegacyMainAuthConfig();
    if (!legacyAuthClient) {
        legacyAuthClient = createLegacyClient(authConfig);
    }

    const helper = window.GasGxMainAuthShared;
    if (helper && typeof helper.signOut === 'function') {
        await helper.signOut({
            client: legacyAuthClient,
            runtimeConfig: authConfig,
            redirectTo: '/account/user.html',
            errorLabel: 'Legacy shell sign-out failed:'
        });
        return;
    }

    clearLegacyAuthStorage(authConfig);
    window.location.replace('/account/user.html');
}

async function initAuthBridge({ page, idPrefix, activeTitle, activePath }) {
    let currentUser = null;
    let displayName = null;

    applySharedNavState({ page, idPrefix, currentUser, displayName, activeTitle, activePath });

    if (!window.supabase || typeof window.supabase.createClient !== 'function') return;
    await loadMainAuthHelper().catch(() => null);

    const authConfig = getLegacyMainAuthConfig();
    const client = createLegacyClient(authConfig);
    if (!client) return;
    legacyAuthClient = client;
    legacyAuthConfig = authConfig;
    window.GGXNewsAuthSignOut = signOutLegacyAuth;

    try {
        const {
            data: { session },
        } = await client.auth.getSession();

        if (session) {
            currentUser = session.user;
            displayName = await resolveDisplayName(client, session.user);
        }

        applySharedNavState({ page, idPrefix, currentUser, displayName, activeTitle, activePath });

        client.auth.onAuthStateChange(async (_event, sessionValue) => {
            currentUser = sessionValue ? sessionValue.user : null;
            displayName = currentUser ? await resolveDisplayName(client, currentUser) : null;
            applySharedNavState({ page, idPrefix, currentUser, displayName, activeTitle, activePath });
        });
    } catch (e) {
        console.error('Legacy shell auth bridge failed:', e);
    }
}

function normalizeLegacyBodyLayout(pathname) {
    const path = pathname.toLowerCase();
    if (path === '/news/account.html' || path === '/news/account/account.html' || path === '/news/account/user.html' || path === '/news/flash/account.html' || path === '/news/flash/user.html') {
        document.body.classList.remove('h-screen', 'overflow-hidden');
        document.body.classList.add('min-h-screen');
    }
}

function detectFooterVariant(pathname) {
    const path = pathname.toLowerCase();
    if (path === '/news/account.html' || path === '/news/account/account.html' || path === '/news/flash/account.html') return 'minimal';
    return 'full';
}

function mountLegacyShell() {
    const pathname = window.location.pathname;
    const page = detectPage(pathname);
    const activeTitle = detectActiveTitle(pathname);
    const activePath = pathname;
    const idPrefix = page === 'flash' ? 'gxf' : 'ggx';
    const appGlobal = page === 'flash' ? 'GGXFlashApp' : 'GGXNewsHomeApp';
    const footerVariant = detectFooterVariant(pathname);

    ensureSharedStylesheet();
    normalizeLegacyBodyLayout(pathname);
    hideLegacyHeaderFooter();

    const headerSlot = ensureSlot('gsh-header-slot', 'start');
    const footerSlot = ensureSlot('gsh-footer-slot', 'end');

    mountSharedHeader(headerSlot, { page, idPrefix, appGlobal });
    mountSharedFooter(footerSlot, { variant: footerVariant });
    ensureMobileToggleBridge(page, appGlobal, idPrefix);
    loadLegacyLiveTicker(idPrefix);
    initAuthBridge({ page, idPrefix, activeTitle, activePath });
}

document.addEventListener('DOMContentLoaded', mountLegacyShell);

