export const ADMIN_ENTRY_KIND = 'admin';
export const SALES_ENTRY_KIND = 'sales';

export const ADMIN_CONSOLE_PATH = '/article_management/index.html';
export const SALES_CONSOLE_PATH = '/article_management/sales/index.html';

export function normalizeEntryKind(value = '') {
    const current = String(value || '').trim().toLowerCase();
    return current === SALES_ENTRY_KIND ? SALES_ENTRY_KIND : ADMIN_ENTRY_KIND;
}

export function detectAdminEntryKind(locationLike = null) {
    const pathname = String(
        locationLike?.pathname
        || (typeof window !== 'undefined' ? window.location?.pathname : '')
        || '',
    ).toLowerCase();
    return pathname.includes('/article_management/sales/')
        ? SALES_ENTRY_KIND
        : ADMIN_ENTRY_KIND;
}

export function adminConsolePath(entryKind = ADMIN_ENTRY_KIND) {
    return normalizeEntryKind(entryKind) === SALES_ENTRY_KIND
        ? SALES_CONSOLE_PATH
        : ADMIN_CONSOLE_PATH;
}

export function adminConsoleUrl(page = '', params = {}, options = {}) {
    const entryKind = normalizeEntryKind(options.entryKind || detectAdminEntryKind());
    const basePath = options.basePath || adminConsolePath(entryKind);
    const origin = options.origin
        || (typeof window !== 'undefined' ? window.location?.origin : 'http://127.0.0.1');
    const url = new URL(basePath, origin);
    if (page) url.searchParams.set('page', page);
    Object.entries(params || {}).forEach(([key, rawValue]) => {
        const value = String(rawValue ?? '').trim();
        if (value) url.searchParams.set(key, value);
    });
    return url.toString();
}

export function quoteEditorContextParams(extra = {}, options = {}) {
    const params = new URLSearchParams();
    const entryKind = normalizeEntryKind(options.entryKind || detectAdminEntryKind());
    params.set('admin_entry', entryKind);
    Object.entries(extra || {}).forEach(([key, rawValue]) => {
        const value = String(rawValue ?? '').trim();
        if (value) params.set(key, value);
    });
    return params;
}
