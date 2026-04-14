ï»¿
import {
    canAccessConsoleEntry,
    clearPasswordRecoveryUrl,
    getAdminUserAccess,
    getCurrentSession,
    getDisplayName,
    isPasswordRecoveryMode,
    onAuthStateChange,
    sendPasswordResetEmail,
    signInWithPassword,
    signOut,
    updateCurrentPassword,
} from './auth.module.js?v=20260414auth02';
import {
    ADMIN_ENTRY_KIND,
    SALES_ENTRY_KIND,
    adminConsoleUrl,
} from './admin-entry.module.js';
import {
    ARTICLE_TYPE_OPTIONS,
    batchUpdateArticleStatus,
    batchUpdateArticleType,
    createArticle,
    createEmptyArticlePayload,
    fetchArticleById,
    fetchArticles,
    hardDeleteArticle,
    restoreArticle,
    updateArticle,
    updateArticleType,
    updateArticleStatus,
} from './articles.module.js';
import { markdownToHtml } from './editor.module.js';
import { deleteTagOptionById, fetchTagOptions, TAG_SECTIONS, updateTagOptionById, upsertTagOption } from './tags.module.js';
import * as featuredApi from './featured.module.js';
import {
    approveAndPublishQueueItem,
    buildArticlePayloadFromQueue,
    fetchQueueStatuses,
    fetchReviewQueue,
    rejectQueueItem,
    updateQueueStatus,
} from './review-queue.module.js?v=20260311ams40';
import { renderAdminSecurityPage, renderAdminUsersPage } from './admin-users.module.js?v=20260327sales03';
import { renderQuoteBrandsPage, renderQuoteCustomersPage, renderQuoteInstancesPage, renderQuoteProductsPage, renderQuoteRequirementsPage } from './quote-system.module.js?v=20260414quote59';
import { renderSiteFooterAdmin, renderSiteGeneralAdmin, renderSiteNavigationAdmin } from './site-shell-admin.module.js?v=20260414site09';
import { client, DEFAULT_FEATURED_LIMIT } from './supabase.client.js?v=20260321admin01';

const HOMEPAGE_MARK_LIMIT = Number.isFinite(Number(featuredApi.HOMEPAGE_MARK_LIMIT)) ? Number(featuredApi.HOMEPAGE_MARK_LIMIT) : 3;
const fetchFeaturedPool = typeof featuredApi.fetchFeaturedPool === 'function' ? featuredApi.fetchFeaturedPool : async () => [];
const fetchFeaturedSelection = typeof featuredApi.fetchFeaturedSelection === 'function' ? featuredApi.fetchFeaturedSelection : async () => [];
const fetchHeroSelection = typeof featuredApi.fetchHeroSelection === 'function' ? featuredApi.fetchHeroSelection : async () => [];

function hasLegacyUpdatedColumnsError(error) {
    const text = String(error?.message || '').toLowerCase();
    return text.includes('updated_at') || text.includes('updated_by');
}

async function fallbackPublishHeroMarks(articleIds = [], userId = null) {
    const now = new Date().toISOString();
    const unique = Array.from(new Set((articleIds || []).map((id) => Number(id)).filter((id) => Number.isFinite(id)))).slice(0, HOMEPAGE_MARK_LIMIT);

    let { error: clearError } = await client.from('articles').update({ homepage_mark: null, updated_at: now, updated_by: userId || null }).in('homepage_mark', [1, 2, 3]);
    if (clearError && hasLegacyUpdatedColumnsError(clearError)) {
        const legacyClear = await client.from('articles').update({ homepage_mark: null }).in('homepage_mark', [1, 2, 3]);
        clearError = legacyClear.error;
    }
    if (clearError) throw clearError;

    for (let i = 0; i < unique.length; i += 1) {
        const payload = { homepage_mark: i + 1, updated_at: now, updated_by: userId || null };
        let { error: rowError } = await client.from('articles').update(payload).eq('id', unique[i]);
        if (rowError && hasLegacyUpdatedColumnsError(rowError)) {
            const legacyRow = await client.from('articles').update({ homepage_mark: i + 1 }).eq('id', unique[i]);
            rowError = legacyRow.error;
        }
        if (rowError) throw rowError;
    }

    return unique;
}

async function fallbackPublishFeaturedRanks(articleIds = [], limit = DEFAULT_FEATURED_LIMIT, userId = null) {
    const now = new Date().toISOString();
    const topN = Math.max(1, Math.min(30, Number(limit) || DEFAULT_FEATURED_LIMIT));
    const unique = Array.from(new Set((articleIds || []).map((id) => Number(id)).filter((id) => Number.isFinite(id)))).slice(0, topN);

    let { error: clearError } = await client.from('articles').update({ featured_rank: null, updated_at: now, updated_by: userId || null }).not('featured_rank', 'is', null);
    if (clearError && hasLegacyUpdatedColumnsError(clearError)) {
        const legacyClear = await client.from('articles').update({ featured_rank: null }).not('featured_rank', 'is', null);
        clearError = legacyClear.error;
    }
    if (clearError) throw clearError;

    for (let i = 0; i < unique.length; i += 1) {
        const payload = { featured_rank: i + 1, updated_at: now, updated_by: userId || null };
        let { error: rowError } = await client.from('articles').update(payload).eq('id', unique[i]);
        if (rowError && hasLegacyUpdatedColumnsError(rowError)) {
            const legacyRow = await client.from('articles').update({ featured_rank: i + 1 }).eq('id', unique[i]);
            rowError = legacyRow.error;
        }
        if (rowError) throw rowError;
    }

    return unique;
}

const publishFeaturedRanks =
    typeof featuredApi.publishFeaturedRanks === 'function'
        ? featuredApi.publishFeaturedRanks
        : fallbackPublishFeaturedRanks;
const publishHeroMarks =
    typeof featuredApi.publishHeroMarks === 'function'
        ? featuredApi.publishHeroMarks
        : fallbackPublishHeroMarks;

const root = document.getElementById('ams-root');
const toastNode = document.getElementById('ams-toast');
const PAGE_SIZE_OPTIONS = [20, 50, 100];
const EDITOR_DRAFT_STORAGE_KEY = 'gasgx:ams:editor-draft:v1';
const ARTICLE_TYPE_MAP = new Map(ARTICLE_TYPE_OPTIONS.map((item) => [item.value, item.label]));
const ARTICLE_STATUS_FILTER_OPTIONS = [
    { value: 'all', label: 'å¨é¨' },
    { value: 'published', label: 'å·²åå¸' },
    { value: 'archived', label: 'å·²ä¸æ¶' },
    { value: 'scraping', label: 'ééä¸­' },
    { value: 'failed', label: 'ééå¤±è´¥' },
];
const ADMIN_PAGE_IDS = new Set([
    'dashboard',
    'site-general',
    'site-navigation',
    'site-footer',
    'admin-users',
    'admin-security',
    'quote-brands',
    'quote-requirements',
    'quote-customers',
    'quote-products',
    'quote-instances',
    'articles',
    'editor',
    'recycle',
    'featured',
    'queue',
    'tags',
]);

function createEditorState(mode = 'create', id = null, payload = null, extra = {}) {
    return {
        mode,
        id: id ?? null,
        payload: { ...createEmptyArticlePayload(), ...(payload || {}) },
        dirty: false,
        draftRestored: false,
        restoredAt: null,
        ...extra,
    };
}

const state = {
    session: null,
    user: null,
    adminAccess: null,
    entryAllowed: false,
    renderedUserId: null,
    page: pageFromUrl() || 'dashboard',
    authView: 'login',
    articles: { page: 1, pageSize: 20, search: '', status: 'all', tag: 'all', category: 'all' },
    recycle: { page: 1, pageSize: 20, search: '' },
    editor: createEditorState(),
    featured: { limit: DEFAULT_FEATURED_LIMIT, ids: [], heroIds: [], poolScrollTop: 0 },
    siteShell: { draft: null, source: 'static', error: null, row: null, dirty: false },
    queue: { page: 1, pageSize: 20, status: 'all' },
    cache: {
        articles: null,
        dashboard: null,
        recycle: null,
        featured: null,
        siteShell: null,
        queue: null,
        tagOptions: null,
        tags: null,
    },
    selectedArticleIds: new Set(),
    selectedQueueIds: new Set(),
    previewUnbind: null,
};

function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function clearToastState() {
    if (!toastNode) return;
    toastNode.classList.remove('show', 'is-modal', 'is-busy', 'is-error');
}

function shouldUseProminentToast(message = '', isError = false) {
    if (isError) return true;
    return /(\u4fdd\u5b58|\u5df2\u4fdd\u5b58|\u66f4\u65b0|\u5df2\u66f4\u65b0|\u521b\u5efa|\u5df2\u521b\u5efa|\u63d0\u4ea4|\u5df2\u63d0\u4ea4|\u53d1\u5e03|\u5df2\u53d1\u5e03)/.test(String(message || ''));
}

function showToast(message, isError = false, options = {}) {
    if (!toastNode) return;
    const prominent = options.prominent ?? shouldUseProminentToast(message, isError);
    const busy = Boolean(options.busy);
    clearTimeout(showToast.timer);
    clearToastState();
    toastNode.textContent = message;
    toastNode.style.borderColor = isError
        ? 'rgba(239,68,68,0.55)'
        : busy
            ? 'rgba(255,191,72,0.55)'
            : 'rgba(93,214,44,0.45)';
    if (prominent) toastNode.classList.add('is-modal');
    if (busy) toastNode.classList.add('is-busy');
    if (isError) toastNode.classList.add('is-error');
    toastNode.classList.add('show');
    if (options.persist) return;
    showToast.timer = setTimeout(() => clearToastState(), prominent ? 1800 : 2600);
}

const entryRedirectGuard = {
    target: '',
    at: 0,
};

function tryRedirectToSalesDashboard() {
    const target = adminConsoleUrl('dashboard', {}, { entryKind: SALES_ENTRY_KIND });
    try {
        const currentUrl = new URL(window.location.href);
        const targetUrl = new URL(target, currentUrl.origin);
        const currentKey = `${currentUrl.origin}${currentUrl.pathname}${currentUrl.search}`;
        const targetKey = `${targetUrl.origin}${targetUrl.pathname}${targetUrl.search}`;
        const now = Date.now();

        if (currentKey === targetKey) {
            showToast('Current domain cannot switch to sales console route. Please verify /article_management/sales/index.html deployment.', true, { prominent: true });
            return false;
        }
        if (entryRedirectGuard.target === targetKey && now - entryRedirectGuard.at < 4000) {
            showToast('Redirect loop prevented. Please verify sales console route mapping on production.', true, { prominent: true });
            return false;
        }

        entryRedirectGuard.target = targetKey;
        entryRedirectGuard.at = now;
        window.location.assign(targetUrl.toString());
        return true;
    } catch (_error) {
        showToast('Unable to switch console entry automatically. Please verify production route config.', true, { prominent: true });
        return false;
    }
}

async function withButtonBusy(button, busyText, task) {
    if (typeof task !== 'function') return;
    if (!button) {
        await task();
        return;
    }
    if (button.dataset.loading === '1') return;

    const prevText = button.textContent || '';
    const prevDisabled = button.disabled;

    button.dataset.loading = '1';
    button.disabled = true;
    button.classList.add('is-loading');
    button.textContent = busyText || 'å¤çä¸­...';
    const shouldShowBusyToast = /(\u4fdd\u5b58|\u66f4\u65b0|\u521b\u5efa|\u63d0\u4ea4|\u53d1\u5e03|\u786e\u8ba4|\u63a8\u8fdb|\u751f\u6210)/.test(String(busyText || ''));
    if (shouldShowBusyToast) {
        showToast(busyText || 'å¤çä¸­...', false, { prominent: true, busy: true, persist: true });
    }

    try {
        await task();
    } finally {
        if (shouldShowBusyToast) {
            clearToastState();
        }
        button.classList.remove('is-loading');
        delete button.dataset.loading;
        if (button.isConnected) {
            button.disabled = prevDisabled;
            button.textContent = prevText;
        }
    }
}

function setPageHeader(title, sub) {
    const titleEl = document.getElementById('ams-page-title');
    const subEl = document.getElementById('ams-page-sub');
    if (titleEl) titleEl.textContent = title;
    if (subEl) subEl.textContent = sub;
}

function setContent(html) {
    const content = document.getElementById('ams-content');
    if (content) content.innerHTML = html;
}

function fmtDate(value) {
    const d = new Date(value || '');
    if (Number.isNaN(d.getTime())) return '--';
    return `${d.toISOString().slice(0, 19).replace('T', ' ')} UTC`;
}

function articleCacheKey(filters = {}) {
    return JSON.stringify({
        page: Math.max(1, Number(filters.page) || 1),
        pageSize: Math.max(1, Number(filters.pageSize) || 20),
        search: String(filters.search || '').trim(),
        status: String(filters.status || 'all').trim(),
        tag: String(filters.tag || 'all').trim(),
        category: String(filters.category || 'all').trim(),
    });
}

function invalidateArticlesCache() {
    state.cache.articles = null;
    state.cache.dashboard = null;
    state.cache.recycle = null;
    state.cache.featured = null;
}

function invalidateQueueCache() {
    state.cache.queue = null;
    state.cache.dashboard = null;
}

function invalidateTagOptionsCache() {
    state.cache.tagOptions = null;
    state.cache.tags = null;
    state.cache.articles = null;
}

function pageFromUrl() {
    try {
        const url = new URL(window.location.href);
        const page = String(url.searchParams.get('page') || '').trim();
        return ADMIN_PAGE_IDS.has(page) ? page : null;
    } catch {
        return null;
    }
}

function syncPageToUrl() {
    try {
        const url = new URL(window.location.href);
        if (state.page && state.page !== 'dashboard') url.searchParams.set('page', state.page);
        else url.searchParams.delete('page');
        window.history.replaceState({}, '', url);
    } catch {
        return;
    }
}

async function getCachedTagOptions(forceRefresh = false) {
    if (!forceRefresh && Array.isArray(state.cache.tagOptions)) return state.cache.tagOptions;
    const rows = await fetchTagOptions();
    state.cache.tagOptions = rows;
    return rows;
}

function clearArticleSelection() {
    state.selectedArticleIds.clear();
}

function pruneArticleSelection(validIds = []) {
    const validSet = new Set((validIds || []).map((item) => String(item)));
    Array.from(state.selectedArticleIds).forEach((id) => {
        if (!validSet.has(String(id))) state.selectedArticleIds.delete(String(id));
    });
}

function getSelectedArticleIds() {
    return Array.from(state.selectedArticleIds)
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item));
}

function clearQueueSelection() {
    state.selectedQueueIds.clear();
}

function pruneQueueSelection(validIds = []) {
    const validSet = new Set((validIds || []).map((item) => String(item)));
    Array.from(state.selectedQueueIds).forEach((id) => {
        if (!validSet.has(String(id))) state.selectedQueueIds.delete(String(id));
    });
}

function getSelectedQueueIds() {
    return Array.from(state.selectedQueueIds)
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item));
}

function normalizeArticleTypeValue(value) {
    const next = String(value || '').trim().toLowerCase();
    return next || '';
}

function articleTypeLabel(value) {
    const key = normalizeArticleTypeValue(value);
    return ARTICLE_TYPE_MAP.get(key) || (key ? key : 'æªè®¾ç½®');
}

function articleTypeOptionsMarkup(selected = '', includeEmpty = true) {
    const current = normalizeArticleTypeValue(selected);
    const options = includeEmpty ? [{ value: '', label: 'æªè®¾ç½®' }, ...ARTICLE_TYPE_OPTIONS] : [...ARTICLE_TYPE_OPTIONS];
    if (current && !options.some((item) => item.value === current)) options.push({ value: current, label: current });
    return options
        .map((item) => `<option value="${esc(item.value)}" ${item.value === current ? 'selected' : ''}>${esc(item.label)}</option>`)
        .join('');
}

function buildFilterTagOptions(optionRows = [], selected = 'all') {
    const activeTags = (optionRows || [])
        .filter((item) => item && item.section === 'tag' && item.is_active !== false)
        .map((item) => String(item.option_id || item.label_en || '').trim())
        .filter(Boolean);
    const unique = Array.from(new Set(activeTags));
    return [{ value: 'all', label: 'å¨é¨' }, ...unique.map((value) => ({ value, label: value }))].map(
        (item) => `<option value="${esc(item.value)}" ${selected === item.value ? 'selected' : ''}>${esc(item.label)}</option>`
    ).join('');
}

function buildFilterCategoryOptions(selected = 'all') {
    return [{ value: 'all', label: 'å¨é¨' }, ...ARTICLE_TYPE_OPTIONS]
        .map((item) => `<option value="${esc(item.value)}" ${selected === item.value ? 'selected' : ''}>${esc(item.label)}</option>`)
        .join('');
}

function resolveArticlePageId(payload, editorId) {
    return payload?.app_id || payload?.api_id || editorId || '';
}

function resolveArticleDisplayId(row) {
    return row?.app_id || row?.api_id || row?.id || '';
}

function resolveArticlePageUrl(payload, editorId) {
    const articleId = resolveArticlePageId(payload, editorId);
    if (!articleId) return '';
    return `https://www.gasgx.com/news/article/${articleId}`;
}

function resolveArticleMediaUrl(payload, mediaPath, fallback = 'https://www.gasgx.com/news/advertisement/zhanwei.jpg') {
    const path = String(mediaPath || '').trim();
    if (!path) return fallback;
    if (/^https?:\/\//i.test(path)) return path;
    const articleId = resolveArticlePageId(payload, payload?.id);
    const normalized = path.replace(/^\.?\/*(images\/)?/i, '');
    if (articleId) return `https://www.gasgx.com/news/article/${articleId}/images/${normalized}`;
    return path.startsWith('/') ? path : `/${normalized}`;
}

function getArticleMediaMeta(row) {
    const placeholder = 'https://www.gasgx.com/news/advertisement/zhanwei.jpg';
    if (!row || typeof row !== 'object') return { url: placeholder, isVideo: false };

    const videoFields = ['video_cover', 'video_cover_image', 'video_poster', 'video_thumbnail'];
    for (const field of videoFields) {
        const value = String(row[field] || '').trim();
        if (value) return { url: resolveArticleMediaUrl(row, value, placeholder), isVideo: true };
    }

    const imageFields = ['cover_image', 'thumbnail', 'thumb', 'poster'];
    for (const field of imageFields) {
        const value = String(row[field] || '').trim();
        if (value) return { url: resolveArticleMediaUrl(row, value, placeholder), isVideo: false };
    }

    return { url: placeholder, isVideo: false };
}

function renderArticleMediaThumb(row, className = 'ams-media-thumb') {
    const media = getArticleMediaMeta(row);
    return `<div class="ams-media-thumb-wrap"><img class="${className}" src="${esc(media.url)}" alt="cover" loading="lazy" onerror="this.src='https://www.gasgx.com/news/advertisement/zhanwei.jpg'">${media.isVideo ? '<span class="ams-media-badge">VIDEO</span>' : ''}</div>`;
}

function pill(value) {
    const key = String(value || '').toLowerCase();
    const labels = {
        draft: 'èç¨¿',
        published: 'å·²åå¸',
        archived: 'å·²ä¸æ¶',
        scraping: 'ééä¸­',
        failed: 'ééå¤±è´¥',
        pending: 'å¾å¤ç',
        rejected: 'å·²æç»',
        queued: 'å·²å¥é',
        scraping: 'ééä¸­',
        processing: 'å¤çä¸­',
        fetched: 'å·²éé',
        completed: 'å·²å®æ',
        failed: 'å¤±è´¥',
        success: 'æå',
        error: 'éè¯¯',
        all: 'å¨é¨',
    };
    return `<span class="ams-pill ${esc(key)}">${esc(labels[key] || value || '--')}</span>`;
}

function queueStatusKey(value, fallback = 'pending') {
    const key = String(value || '').trim().toLowerCase();
    if (!key) return fallback;
    if (key === 'scraping') return 'processing';
    if (key === 'completed' || key === 'success') return 'done';
    return key;
}

function queueStatusLabel(value) {
    const key = queueStatusKey(value, '');
    const labels = {
        pending: 'å¾å¤ç',
        done: 'å·²å®æ',
        rejected: 'å·²æç»',
        published: 'å·²åå¸',
        queued: 'å·²å¥é',
        processing: 'å¤çä¸­',
        fetched: 'å·²éé',
        failed: 'å¤±è´¥',
        error: 'éè¯¯',
    };
    return labels[key] || String(value || '--');
}

function resolveQueueRowStatus(row, fallback = 'pending') {
    const status = queueStatusKey(row?.status, '');
    const reviewStatus = queueStatusKey(row?.review_status, '');
    if (reviewStatus && (!status || status === 'pending' || isFinalQueueStatus(reviewStatus))) return reviewStatus;
    return status || reviewStatus || fallback;
}

function queueStatusPill(value) {
    const key = queueStatusKey(value, '');
    return `<span class="ams-pill ${esc(key)}">${esc(queueStatusLabel(key || value || '--'))}</span>`;
}

function isFinalQueueStatus(value) {
    return ['published', 'done', 'rejected'].includes(queueStatusKey(value, ''));
}

function sortQueueStatuses(values = []) {
    const preferredOrder = ['pending', 'processing', 'queued', 'fetched', 'error', 'failed', 'done', 'rejected', 'published'];
    const unique = Array.from(new Set((values || []).map((item) => queueStatusKey(item, '')).filter(Boolean)));
    return unique.sort((a, b) => {
        const ai = preferredOrder.indexOf(a);
        const bi = preferredOrder.indexOf(b);
        if (ai === -1 && bi === -1) return a.localeCompare(b);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
    });
}

function clearPreviewBinding() {
    if (typeof state.previewUnbind === 'function') state.previewUnbind();
    state.previewUnbind = null;
}

function shouldIgnoreAuthRender(event, nextSession = null) {
    const nextEvent = String(event || '').trim().toUpperCase();
    if (nextEvent === 'TOKEN_REFRESHED' || nextEvent === 'INITIAL_SESSION') return true;
    if (nextEvent === 'SIGNED_IN') {
        const currentUserId = state.user?.id || '';
        const nextUserId = nextSession?.user?.id || '';
        if (state.renderedUserId && nextUserId && state.renderedUserId === nextUserId) {
            return true;
        }
        if (currentUserId && nextUserId && currentUserId === nextUserId && state.authView !== 'login') {
            return true;
        }
    }
    return false;
}

function summarizeCategoryStats(rows, limit = 10) {
    const counter = new Map();
    (rows || []).forEach((row) => {
        const key = String(row?.type || row?.tag || 'æªåç±»').trim() || 'æªåç±»';
        counter.set(key, (counter.get(key) || 0) + 1);
    });
    return Array.from(counter.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, Math.max(1, limit))
        .map(([name, count]) => ({ name, count }));
}

function safeSessionStorage(method, ...args) {
    try {
        return window.sessionStorage?.[method]?.(...args);
    } catch (_error) {
        return null;
    }
}

function isMeaningfulEditorPayload(payload = {}) {
    const keys = ['main_title', 'subheading', 'content_markdown', 'content_html', 'tag', 'secondary_tag', 'type', 'publisher', 'cover_image', 'author_avatar', 'topics', 'link'];
    return keys.some((key) => String(payload?.[key] || '').trim());
}

function readStoredEditorDraft() {
    const raw = safeSessionStorage('getItem', EDITOR_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        return parsed;
    } catch (_error) {
        return null;
    }
}

function clearStoredEditorDraft() {
    safeSessionStorage('removeItem', EDITOR_DRAFT_STORAGE_KEY);
}

function ensureEditorHtmlPayload(payload = {}) {
    const nextPayload = { ...createEmptyArticlePayload(), ...(payload || {}) };
    const currentHtml = String(nextPayload.content_html || '').trim();
    if (currentHtml) return nextPayload;

    const markdown = String(nextPayload.content_markdown || '').trim();
    if (!markdown) return nextPayload;

    return {
        ...nextPayload,
        content_html: markdownToHtml(markdown),
    };
}

function persistEditorDraft(editorState) {
    const nextState = editorState || state.editor;
    const payload = ensureEditorHtmlPayload(nextState?.payload || {});
    if (!isMeaningfulEditorPayload(payload)) {
        clearStoredEditorDraft();
        return;
    }
    safeSessionStorage(
        'setItem',
        EDITOR_DRAFT_STORAGE_KEY,
        JSON.stringify({
            mode: nextState?.mode || 'create',
            id: nextState?.id || null,
            payload,
            savedAt: Date.now(),
        })
    );
}

function hydrateEditorPayload(mode, id, payload) {
    const fallbackPayload = ensureEditorHtmlPayload(payload || {});
    const draft = readStoredEditorDraft();
    if (!draft?.payload) return { payload: fallbackPayload, draftRestored: false, restoredAt: null };

    const sameMode = draft.mode === mode;
    const sameRecord = mode !== 'edit' || String(draft.id ?? '') === String(id ?? '');
    if (!sameMode || !sameRecord) return { payload: fallbackPayload, draftRestored: false, restoredAt: null };

    const shouldRestore = mode === 'edit' || !isMeaningfulEditorPayload(fallbackPayload);
    const restoredPayload = ensureEditorHtmlPayload(draft.payload || {});
    return {
        payload: shouldRestore ? restoredPayload : fallbackPayload,
        draftRestored: shouldRestore,
        restoredAt: shouldRestore ? draft.savedAt || null : null,
    };
}

function hasUnsavedEditorChanges() {
    return state.page === 'editor' && Boolean(state.editor?.dirty);
}

function confirmDiscardEditorChanges() {
    if (!hasUnsavedEditorChanges()) return true;
    return window.confirm('å½åæç« ææªä¿å­çåå®¹ï¼ç¡®è®¤ç¦»å¼ç¼è¾é¡µåï¼');
}

function prepareEditorState(mode = 'create', id = null, payload = null) {
    const hydrated = hydrateEditorPayload(mode, id, payload);
    return createEditorState(mode, id, hydrated.payload, {
        draftRestored: hydrated.draftRestored,
        restoredAt: hydrated.restoredAt,
    });
}

function countPlainWords(text) {
    const source = String(text || '');
    const latin = source.match(/[A-Za-z0-9_]+/g) || [];
    const cjk = source.match(/[\u3400-\u9fff]/g) || [];
    return latin.length + cjk.length;
}

function markdownToPlainText(markdown) {
    return String(markdown || '')
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
        .replace(/\[([^\]]+)]\(([^)]+)\)/g, '$1 $2')
        .replace(/[#>*`~_-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function htmlToPlainText(html) {
    return String(html || '')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/\s+/g, ' ')
        .trim();
}

function detectHtmlHeadings(html) {
    return Array.from(String(html || '').matchAll(/<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi))
        .map((match) => htmlToPlainText(match[2]))
        .filter(Boolean)
        .slice(0, 8);
}

function resolveEditorPreviewHtml(payload = {}) {
    const htmlSource = String(payload.content_html || '').trim();
    if (htmlSource) return htmlSource;
    return markdownToHtml(String(payload.content_markdown || ''));
}

function splitTopics(value) {
    return String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function buildEditorMetrics(payload = {}) {
    const markdown = String(payload.content_markdown || '');
    const htmlSource = String(payload.content_html || '');
    const plainText = htmlSource.trim() ? htmlToPlainText(htmlSource) : markdownToPlainText(markdown);
    const compactChars = plainText.replace(/\s+/g, '').length;
    const words = countPlainWords(plainText);
    const readingBasis = words || compactChars;
    const readMinutes = readingBasis ? Math.max(1, Math.ceil(readingBasis / 280)) : 0;
    const headings = htmlSource.trim()
        ? detectHtmlHeadings(htmlSource)
        : markdown
              .split(/\r?\n/)
              .map((line) => String(line || '').trim())
              .filter((line) => /^#{1,3}\s+/.test(line))
              .map((line) => line.replace(/^#{1,3}\s+/, '').trim())
              .filter(Boolean)
              .slice(0, 8);

    return {
        words,
        chars: compactChars,
        readMinutes,
        headings,
        topics: splitTopics(payload.topics),
        mode: htmlSource.trim() ? 'html' : 'markdown',
    };
}

function buildEditorChecklist(payload = {}, metrics = buildEditorMetrics(payload)) {
    return [
        { name: 'æ é¢', label: 'æ é¢å·²å¡«å', ready: Boolean(String(payload.main_title || '').trim()), required: true },
        { name: 'åç±»', label: 'åç±»å·²éæ©', ready: Boolean(String(payload.type || '').trim()), required: false },
        { name: 'åå¸æ¹', label: 'åå¸æ¹å·²éæ©', ready: Boolean(String(payload.publisher || '').trim()), required: false },
        { name: 'ä¸»æ ç­¾', label: 'ä¸»æ ç­¾å·²éæ©', ready: Boolean(String(payload.tag || '').trim()), required: false },
        { name: 'å°é¢å¾', label: 'å°é¢å¾å·²éç½®', ready: Boolean(String(payload.cover_image || '').trim()), required: false },
        { name: 'æ­£æ', label: 'æ­£æè¾¾å° 80 å­', ready: metrics.chars >= 80, required: true },
        { name: 'åæé¾æ¥', label: 'åæé¾æ¥å·²å¡«å', ready: Boolean(String(payload.link || '').trim()), required: false },
    ];
}

function pageSizeOptions(selected = 20) {
    return PAGE_SIZE_OPTIONS.map((value) => `<option value="${value}" ${Number(selected) === value ? 'selected' : ''}>${value} / é¡µ</option>`).join('');
}

function pageJumpOptions(totalPages = 1, limit = 10) {
    const count = Math.max(1, Math.min(Number(totalPages) || 1, limit));
    return Array.from({ length: count }, (_, index) => `<option value="${index + 1}"></option>`).join('');
}

function calcTotalPages(totalCount = 0, pageSize = 20) {
    return Math.max(1, Math.ceil((Number(totalCount) || 0) / Math.max(1, Number(pageSize) || 20)));
}

function buildPaginationWindow(currentPage = 1, totalPages = 1, width = 7) {
    const current = Math.max(1, Math.min(Number(currentPage) || 1, Number(totalPages) || 1));
    const total = Math.max(1, Number(totalPages) || 1);
    const safeWidth = Math.max(3, Number(width) || 7);
    const half = Math.floor(safeWidth / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + safeWidth - 1);
    start = Math.max(1, end - safeWidth + 1);
    const pages = [];
    for (let page = start; page <= end; page += 1) pages.push(page);
    return pages;
}

function renderPagination(idPrefix, currentPage = 1, totalPages = 1) {
    const current = Math.max(1, Math.min(Number(currentPage) || 1, Number(totalPages) || 1));
    const total = Math.max(1, Number(totalPages) || 1);
    const pages = buildPaginationWindow(current, total, 7);

    return `
        <div class="ams-pagination" data-pagination="${esc(idPrefix)}">
            <div class="ams-pagination-meta">
                <label class="ams-pagination-label" for="${esc(idPrefix)}-page-size">æ¯é¡µæ°é</label>
                <select class="ams-select ams-pagination-select" id="${esc(idPrefix)}-page-size" data-page-size-change="${esc(idPrefix)}">
                    ${pageSizeOptions(idPrefix === 'recycle' ? state.recycle.pageSize : state.articles.pageSize)}
                </select>
            </div>
            <button class="ams-btn ams-btn-muted" type="button" data-page-jump="${esc(idPrefix)}" data-page="${current - 1}" ${current <= 1 ? 'disabled' : ''}>ä¸ä¸é¡µ</button>
            <div class="ams-pagination-pages">
                ${pages
                    .map(
                        (page) =>
                            `<button class="ams-btn ${page === current ? 'ams-btn-primary' : 'ams-btn-muted'}" type="button" data-page-jump="${esc(
                                idPrefix
                            )}" data-page="${page}">${page}</button>`
                    )
                    .join('')}
            </div>
            <button class="ams-btn ams-btn-muted" type="button" data-page-jump="${esc(idPrefix)}" data-page="${current + 1}" ${current >= total ? 'disabled' : ''}>ä¸ä¸é¡µ</button>
        </div>
    `;
}

function renderSummaryChips(items = []) {
    return `<div class="ams-summary-row">${items
        .filter((item) => item && item.value !== '' && item.value !== null && item.value !== undefined)
        .map((item) => `<span class="ams-summary-chip"><strong>${esc(item.label)}</strong><span>${esc(String(item.value))}</span></span>`)
        .join('')}</div>`;
}

function renderEditorMetricCard(label, value, help = '') {
    return `<article class="ams-editor-metric"><span>${esc(label)}</span><strong>${esc(String(value))}</strong>${help ? `<small>${esc(help)}</small>` : ''}</article>`;
}

function renderEditorChecklist(items = []) {
    return `<div class="ams-editor-checklist">${items
        .map(
            (item) => `
                <div class="ams-editor-check ${item.ready ? 'is-ready' : 'is-pending'}">
                    <i class="fa-solid ${item.ready ? 'fa-circle-check' : 'fa-circle'}"></i>
                    <span>${esc(item.label)}</span>
                    ${item.required ? '<em>å¿é</em>' : '<em>å»ºè®®</em>'}
                </div>
            `
        )
        .join('')}</div>`;
}

function renderEditorOutline(headings = []) {
    if (!headings.length) return '<div class="ams-empty">è¿æ²¡æè¯å«å°æ é¢ç»æï¼å»ºè®®è³å°æ·»å ä¸ä¸ªäºçº§æ é¢ã</div>';
    return `<div class="ams-editor-outline-list">${headings
        .map((heading, index) => `<div class="ams-editor-outline-item"><span>${index + 1}</span><strong>${esc(heading)}</strong></div>`)
        .join('')}</div>`;
}

function renderTopicChips(topics = []) {
    if (!topics.length) return '<div class="ams-empty">ç¨è±æéå·åéå¤ä¸ªè¯é¢ï¼ä¾¿äºåå®¹èåã</div>';
    return `<div class="ams-chip-row">${topics.map((topic) => `<span class="ams-mini-chip">${esc(topic)}</span>`).join('')}</div>`;
}

function openExternalUrl(url, emptyMessage) {
    const target = String(url || '').trim();
    if (!target) {
        if (emptyMessage) showToast(emptyMessage, true);
        return false;
    }
    window.open(target, '_blank', 'noopener,noreferrer');
    return true;
}

async function copyText(text, fallbackInput, successMessage, failureMessage) {
    const target = String(text || '').trim();
    if (!target) {
        if (failureMessage) showToast(failureMessage, true);
        return false;
    }
    try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            await navigator.clipboard.writeText(target);
        } else if (fallbackInput) {
            fallbackInput.focus();
            fallbackInput.select();
            document.execCommand('copy');
        }
        if (successMessage) showToast(successMessage);
        return true;
    } catch (_error) {
        if (failureMessage) showToast(failureMessage, true);
        return false;
    }
}

function insertMarkdownSnippet(textarea, before, after = '', placeholder = '') {
    if (!textarea) return;
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const selected = textarea.value.slice(start, end);
    const insertValue = `${before}${selected || placeholder}${after}`;
    textarea.setRangeText(insertValue, start, end, 'select');
    const nextStart = start + before.length;
    const nextEnd = nextStart + (selected || placeholder).length;
    textarea.focus();
    textarea.setSelectionRange(nextStart, nextEnd);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

window.addEventListener('beforeunload', (event) => {
    if (!hasUnsavedEditorChanges()) return;
    event.preventDefault();
    event.returnValue = '';
});

function renderLogin() {
    const authView = state.authView === 'forgot' || state.authView === 'reset' ? state.authView : 'login';
    const isResetView = authView === 'reset';
    const isForgotView = authView === 'forgot';
    root.innerHTML = `
        <section class="ams-auth-shell">
            <div class="ams-auth-card">
                <h1 class="ams-logo">GasGx <span>AMS</span></h1>
                <p class="ams-subtitle">ç½ç«ç®¡çåå° Â· ä»åè®¸åå°äººåç»å½</p>
                ${
                    isResetView
                        ? `
                    <form id="ams-reset-form" class="ams-form">
                        <div class="ams-field">
                            <label>æ°å¯ç </label>
                            <input id="ams-reset-password" class="ams-input" type="password" placeholder="è³å° 8 ä½" required>
                        </div>
                        <div class="ams-field">
                            <label>ç¡®è®¤æ°å¯ç </label>
                            <input id="ams-reset-password-confirm" class="ams-input" type="password" placeholder="åæ¬¡è¾å¥æ°å¯ç " required>
                        </div>
                        <button class="ams-btn ams-btn-primary" type="submit">ä¿å­æ°å¯ç </button>
                    </form>
                    <div class="ams-auth-links">
                        <button class="ams-btn ams-btn-muted" type="button" data-auth-view="login">è¿åç»å½</button>
                    </div>
                    <p class="ams-footnote">è¿æ¯éè¿æ¾åå¯ç é®ä»¶è¿å¥çéç½®é¡µãä¿å­åä¼èªå¨éåºï¼è¯·ç¨æ°å¯ç éæ°ç»å½ã</p>
                `
                        : isForgotView
                          ? `
                    <form id="ams-forgot-form" class="ams-form">
                        <div class="ams-field">
                            <label>é®ç®±</label>
                            <input id="ams-forgot-email" class="ams-input" type="email" placeholder="è¯·è¾å¥ç®¡çåé®ç®±" required>
                        </div>
                        <button class="ams-btn ams-btn-primary" type="submit">åééç½®é®ä»¶</button>
                    </form>
                    <div class="ams-auth-links">
                        <button class="ams-btn ams-btn-muted" type="button" data-auth-view="login">è¿åç»å½</button>
                    </div>
                `
                          : `
                    <form id="ams-login-form" class="ams-form">
                        <div class="ams-field">
                            <label>é®ç®±</label>
                            <input id="ams-login-email" class="ams-input" type="email" placeholder="è¯·è¾å¥ç®¡çåé®ç®±" required>
                        </div>
                        <div class="ams-field">
                            <label>å¯ç </label>
                            <input id="ams-login-password" class="ams-input" type="password" placeholder="â¢â¢â¢â¢â¢â¢â¢â¢" required>
                        </div>
                        <button class="ams-btn ams-btn-primary" type="submit">ç»å½</button>
                    </form>
                    <div class="ams-auth-links">
                        <button class="ams-btn ams-btn-link" type="button" data-auth-view="forgot">å¿è®°å¯ç </button>
                    </div>
                `
                }
            </div>
        </section>
    `;

    document.querySelectorAll('[data-auth-view]').forEach((button) => {
        button.addEventListener('click', () => {
            state.authView = button.dataset.authView || 'login';
            if (state.authView === 'login') clearPasswordRecoveryUrl();
            renderLogin();
        });
    });

    document.getElementById('ams-login-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('ams-login-email')?.value || '';
        const password = document.getElementById('ams-login-password')?.value || '';
        const submitButton = event.submitter || event.currentTarget?.querySelector('button[type="submit"]');
        await withButtonBusy(submitButton, 'ç»å½ä¸­...', async () => {
            try {
                const result = await signInWithPassword(email, password);
                state.session = { ...(result.session || {}) };
                state.user = result.user || result.session?.user || null;
                state.authView = 'login';
                state.page = 'dashboard';
                await refreshAdminAccess(true);
                await renderPage();
                showToast('ç»å½æåã');
            } catch (error) {
                showToast(error.message || 'ç»å½å¤±è´¥ã', true);
            }
        });
    });

    document.getElementById('ams-forgot-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('ams-forgot-email')?.value || '';
        const submitButton = event.submitter || event.currentTarget?.querySelector('button[type="submit"]');
        await withButtonBusy(submitButton, 'åéä¸­...', async () => {
            try {
                await sendPasswordResetEmail(email);
                showToast('éç½®å¯ç é®ä»¶å·²åéã');
            } catch (error) {
                showToast(error.message || 'åééç½®å¯ç é®ä»¶å¤±è´¥ã', true);
            }
        });
    });

    document.getElementById('ams-reset-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nextPassword = document.getElementById('ams-reset-password')?.value || '';
        const confirmPassword = document.getElementById('ams-reset-password-confirm')?.value || '';
        const submitButton = event.submitter || event.currentTarget?.querySelector('button[type="submit"]');
        await withButtonBusy(submitButton, 'ä¿å­ä¸­...', async () => {
            try {
                if (nextPassword !== confirmPassword) throw new Error('ä¸¤æ¬¡è¾å¥çæ°å¯ç ä¸ä¸è´ã');
                await updateCurrentPassword(nextPassword);
                clearPasswordRecoveryUrl();
                await signOut();
                state.authView = 'login';
                renderLogin();
                showToast('å¯ç å·²éç½®ï¼è¯·ä½¿ç¨æ°å¯ç éæ°ç»å½ã');
            } catch (error) {
                showToast(error.message || 'éç½®å¯ç å¤±è´¥ã', true);
            }
        });
    });
}

function navButton(id, label, icon) {
    const active = state.page === id ? 'active' : '';
    return `<button type="button" class="ams-nav-btn ${active}" data-page="${id}"><span><i class="fa-solid ${icon}"></i> ${label}</span><i class="fa-solid fa-angle-right"></i></button>`;
}

function navGroup(label, items = []) {
    return `
        <div class="ams-nav-group">
            <div class="ams-nav-group-label">${esc(label)}</div>
            <div class="ams-nav-group-items">${items.join('')}</div>
        </div>
    `;
}

function renderShell() {
    const name = esc(getDisplayName(state.user, state.adminAccess?.row || null));
    const canOpenSalesConsole = canAccessConsoleEntry(state.adminAccess?.row, SALES_ENTRY_KIND);
    root.innerHTML = `
        <div class="ams-app">
            <aside class="ams-sidebar">
                <div class="ams-sidebar-head">
                    <h2 class="ams-sidebar-title">GasGx <span>AMS</span></h2>
                    <div class="ams-sidebar-meta">ç½ç«ç®¡çåå°</div>
                </div>
                <nav class="ams-nav">
                    ${navGroup('Dashboard', [navButton('dashboard', 'æ»è§', 'fa-chart-line')])}
                    ${navGroup('Site', [
                        navButton('site-general', 'ä¸»ç«éç½®', 'fa-sliders'),
                    ])}
                    ${navGroup('System', [
                        navButton('site-navigation', 'ä¸»ç«å¯¼èª', 'fa-compass'),
                        navButton('site-footer', 'ä¸»ç«é¡µè', 'fa-window-maximize'),
                        navButton('admin-users', 'äººåç®¡ç', 'fa-users-gear'),
                        navButton('admin-security', 'è´¦å·å®å¨', 'fa-user-shield'),
                    ])}
                    ${navGroup('Quotes', [
                        navButton('quote-brands', 'åçç®¡ç', 'fa-layer-group'),
                        navButton('quote-products', 'äº§åæ¨¡æ¿', 'fa-cubes'),
                        navButton('quote-requirements', 'å®¢æ·çº¿ç´¢', 'fa-clipboard-list'),
                        navButton('quote-customers', 'å®¢æ·è·è¸ª', 'fa-address-book'),
                        navButton('quote-instances', 'æ¥ä»·åç®¡ç', 'fa-file-invoice-dollar'),
                    ])}
                    ${navGroup('News', [
                        navButton('articles', 'æç« ç®¡ç', 'fa-file-lines'),
                        navButton('editor', 'æ°å»ºæç« ', 'fa-pen-to-square'),
                        navButton('recycle', 'åæ¶ç«', 'fa-trash-can-arrow-up'),
                        navButton('featured', 'é¦é¡µæ¨èä½', 'fa-ranking-star'),
                        navButton('queue', 'éééå', 'fa-list-check'),
                        navButton('tags', 'æ ç­¾ç®¡ç', 'fa-tags'),
                    ])}
                </nav>
            </aside>
            <main class="ams-main">
                <header class="ams-header">
                    <div>
                        <h1 id="ams-page-title">GasGx ç½ç«ç®¡çåå°</h1>
                        <p id="ams-page-sub">ç»ä¸ç®¡çä¸»ç«éç½®ãç³»ç»å¯¼èªãNews åå®¹ä¸æ¨èä½</p>
                    </div>
                    <div class="ams-user">
                        ${canOpenSalesConsole ? `<a class="ams-btn ams-btn-muted" href="${esc(adminConsoleUrl('dashboard', {}, { entryKind: SALES_ENTRY_KIND }))}">è¿å¥éå®å·¥ä½å°</a>` : ''}
                        <span><i class="fa-solid fa-user"></i> <strong>${name}</strong></span>
                        <button id="ams-signout" class="ams-btn ams-btn-muted" type="button">éåºç»å½</button>
                    </div>
                </header>
                <section id="ams-content" class="ams-content"><div class="ams-empty">å è½½ä¸­...</div></section>
            </main>
        </div>
    `;

    document.getElementById('ams-signout')?.addEventListener('click', async (event) => {
        await withButtonBusy(event.currentTarget, 'éåºä¸­...', async () => {
            try {
                await signOut();
            } catch (error) {
                showToast(error.message || 'éåºå¤±è´¥ã', true);
            }
        });
    });

    document.querySelectorAll('.ams-nav-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (!confirmDiscardEditorChanges()) return;
            state.page = btn.dataset.page || 'dashboard';
            if (state.page === 'editor' && state.editor.mode !== 'edit') {
                state.editor = prepareEditorState('create');
            }
            syncPageToUrl();
            void renderPage();
        });
    });
}
async function renderDashboard(forceRefresh = false) {
    setPageHeader('æ»è§', 'æ¥çä¸»ç«å¯¼èªãNews åå®¹ãæ¨èä½åéééåçæ´ä½ç¶æã');

    const dashboardCacheKey = JSON.stringify({ featuredLimit: state.featured.limit });
    let dashboardData = !forceRefresh && state.cache.dashboard?.key === dashboardCacheKey ? state.cache.dashboard.data : null;

    if (!dashboardData) {
        const [active, recycled, heroSlots, featured, queue, sampleRows] = await Promise.all([
            fetchArticles({ page: 1, pageSize: 1 }),
            fetchArticles({ page: 1, pageSize: 1, includeDeleted: true }),
            fetchHeroSelection(),
            fetchFeaturedSelection(state.featured.limit),
            fetchReviewQueue({ page: 1, pageSize: 1, status: 'pending' }),
            fetchArticles({ page: 1, pageSize: 200, status: 'published' }),
        ]);
        dashboardData = { active, recycled, heroSlots, featured, queue, sampleRows };
        state.cache.dashboard = { key: dashboardCacheKey, data: dashboardData };
    }

    const { active, recycled, heroSlots, featured, queue, sampleRows } = dashboardData;
    const categoryStats = summarizeCategoryStats(sampleRows.rows, 10);
    const dashboardKpis = [
        { title: 'å¨çº¿æç« ', value: active.count, sub: 'å½åå¯å¨åå°å±ç¤ºçæç« æ°é' },
        { title: 'å¾å¤çéé', value: queue.count, sub: 'éééåä¸­å¾å¤çè®°å½' },
        { title: 'é¦é¡µå¤§ä½', value: `${heroSlots.length}/${HOMEPAGE_MARK_LIMIT}`, sub: 'homepage_mark å·²éç½®æ°é' },
        { title: 'å¹¿åæ¨èä½', value: `${featured.length}/${state.featured.limit}`, sub: 'featured_rank å·²éç½®æ°é' },
        { title: 'åæ¶ç«', value: recycled.count, sub: 'å·²è½¯å é¤æç« æ°é' },
    ];

    setContent(`
        <section class="ams-card ams-dashboard-intro">
            <div class="ams-dashboard-intro-copy">
                <p class="ams-eyebrow">Dashboard</p>
                <h2>æä¸»ç«éç½®ãç³»ç»å¯¼èªãåå®¹åå¸ãæ¨èä½åééå®¡æ ¸æ¾è¿åä¸ä¸ªåå°ã</h2>
                <p class="ams-hero-text">ä¸»ç«åºç¡éç½®ä¿çå¨ Siteï¼å¯¼èªä¸ Footer ç»ä¸æ¶å£å° Systemï¼åæ¶ç»§ç»­ä¿çåæ News åå®¹è¿è¥åè½ãè¿éåçæ´ä½ç¶æï¼åè¿å¥å·ä½æä½é¡µã</p>
            </div>
            <div class="ams-dashboard-intro-meta">
                <div class="ams-dashboard-highlight">
                    <span>ä»æ¥éç¹</span>
                    <strong>${queue.count ? `ä¼åå¤ç ${queue.count} æ¡ééè®°å½` : 'å½åæ²¡æå¾å¤çééåå®¹'}</strong>
                </div>
                <div class="ams-dashboard-highlight">
                    <span>ç«ç¹å£³ç¶æ</span>
                    <strong>ä¸»ç«å¯¼èªä¸ Footer ç°å·²æ¶å£å° System æ¨¡åç»ä¸ç®¡ç</strong>
                </div>
            </div>
        </section>
        <section class="ams-dashboard-actions">
            <button class="ams-quick-link" type="button" data-dashboard-nav="site-navigation">
                <div class="ams-quick-link-icon"><i class="fa-solid fa-compass"></i></div>
                <div class="ams-quick-link-body">
                    <strong>ç³»ç»å¯¼èªç®¡ç</strong>
                    <span>ç»´æ¤ä¸»ç« Header ä¸çº§ä¸äºçº§å¯¼èª</span>
                </div>
            </button>
            <button class="ams-quick-link" type="button" data-dashboard-nav="site-footer">
                <div class="ams-quick-link-icon"><i class="fa-solid fa-window-maximize"></i></div>
                <div class="ams-quick-link-body">
                    <strong>ç³»ç» Footer ç®¡ç</strong>
                    <span>ç®¡ç Contactãç¤¾äº¤å¥å£ä¸åä½ä¼ä¼´</span>
                </div>
            </button>
            <button class="ams-quick-link" type="button" data-dashboard-nav="editor">
                <div class="ams-quick-link-icon"><i class="fa-solid fa-pen-to-square"></i></div>
                <div class="ams-quick-link-body">
                    <strong>æ°å»ºæç« </strong>
                    <span>ç´æ¥è¿å¥åå¸å·¥ä½åº</span>
                </div>
            </button>
            <button class="ams-quick-link" type="button" data-dashboard-nav="queue">
                <div class="ams-quick-link-icon"><i class="fa-solid fa-list-check"></i></div>
                <div class="ams-quick-link-body">
                    <strong>å¤çéééå</strong>
                    <span>${queue.count ? `å½åè¿æ ${queue.count} æ¡å¾å¤çè®°å½` : 'å½åæ²¡æå¾å¤çééåå®¹'}</span>
                </div>
            </button>
            <button class="ams-quick-link" type="button" data-dashboard-nav="featured">
                <div class="ams-quick-link-icon"><i class="fa-solid fa-ranking-star"></i></div>
                <div class="ams-quick-link-body">
                    <strong>è°æ´é¦é¡µæ¨èä½</strong>
                    <span>åæ­¥ç®¡ç hero ä¸ featured</span>
                </div>
            </button>
        </section>
        <section class="ams-dashboard-overview">
            <div class="ams-section-head">
                <div>
                    <h3>æ ¸å¿æ¦è§</h3>
                    <p>ä¼åçæç« æ°éãééç¶æåæ¨èä½å ç¨æåµã</p>
                </div>
            </div>
            <div class="ams-dashboard-kpis">
                ${dashboardKpis.map((item) => `
                    <article class="ams-card ams-kpi-card">
                        <h3>${esc(item.title)}</h3>
                        <div class="ams-kpi">${esc(item.value)}</div>
                        <div class="ams-kpi-sub">${esc(item.sub)}</div>
                    </article>
                `).join('')}
            </div>
        </section>
        ${renderSummaryChips([
            { label: 'å·²åå¸æ½æ ·', value: `${sampleRows.rows.length} ç¯` },
            { label: 'é¦é¡µæ¨èä½', value: `${heroSlots.length}/${HOMEPAGE_MARK_LIMIT}` },
            { label: 'å¹¿åä½', value: `${featured.length}/${state.featured.limit}` },
            { label: 'å¾å¤ç', value: `${queue.count} æ¡` },
        ])}
        <section class="ams-card ams-category-card">
            <div class="ams-section-head">
                <div>
                    <h3>åç±»åå¸</h3>
                    <p>ç»è®¡æè¿ 200 æ¡å·²åå¸æç« ï¼å¿«éæ¥çåå®¹éå¿ã</p>
                </div>
            </div>
            <div class="ams-category-grid">
                ${categoryStats.length ? categoryStats.map((item) => `<div class="ams-category-item"><span>${esc(item.name)}</span><strong>${item.count}</strong></div>`).join('') : '<div class="ams-empty">ææ åç±»æ°æ®ã</div>'}
            </div>
        </section>
        <div class="ams-footnote">ç¹å»å·¦ä¾§èåå¯è¿å¥å¯¹åºåè½é¡µã</div>
    `);

    document.querySelectorAll('[data-dashboard-nav]').forEach((button) => {
        button.addEventListener('click', () => {
            if (!confirmDiscardEditorChanges()) return;
            const nextPage = button.dataset.dashboardNav || 'dashboard';
            state.page = nextPage;
            if (nextPage === 'editor') state.editor = prepareEditorState('create');
            void renderPage();
        });
    });
}

function articleToolbar(filters, tagOptionsHtml = '', categoryOptionsHtml = '', recycleMode = false, selectedCount = 0) {
    return `
        <div class="ams-toolbar-card">
        <div class="ams-toolbar ams-article-toolbar">
            <div class="ams-field ams-toolbar-search-field">
                <label>æç´¢</label>
                <div class="ams-search-box">
                    <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                    <input id="am-search" class="ams-input" value="${esc(filters.search || '')}" placeholder="ææ é¢ãåå¸æ¹ãé¾æ¥æç´¢">
                </div>
            </div>
            ${recycleMode ? '' : `<div class="ams-field"><label>ç¶æ</label><select id="am-status" class="ams-select">${ARTICLE_STATUS_FILTER_OPTIONS.map((item) => `<option value="${esc(item.value)}" ${filters.status === item.value ? 'selected' : ''}>${esc(item.label)}</option>`).join('')}</select></div>`}
            ${recycleMode ? '' : `<div class="ams-field"><label>æ ç­¾</label><select id="am-tag" class="ams-select">${tagOptionsHtml}</select></div>`}
            ${recycleMode ? '' : `<div class="ams-field"><label>åç±»</label><select id="am-category" class="ams-select">${categoryOptionsHtml}</select></div>`}
            <div class="ams-toolbar-actions ams-article-toolbar-actions"><button class="ams-btn ams-btn-primary" id="am-apply" type="button">æ¥è¯¢</button>${recycleMode ? '' : '<button class="ams-btn ams-btn-muted" id="am-new" type="button">æ°å»º</button>'}</div>
        </div>
        ${
            recycleMode
                ? ''
                : `<div class="ams-bulk-toolbar ams-bulk-toolbar-articles">
                    <div class="ams-bulk-meta">å·²é <strong id="am-selected-count">${selectedCount}</strong> ç¯æç« </div>
                    <div class="ams-bulk-actions">
                        <button class="ams-btn ams-btn-muted" id="am-select-visible" type="button">æ¬é¡µå¨é</button>
                        <button class="ams-btn ams-btn-muted" id="am-clear-selection" type="button" ${selectedCount ? '' : 'disabled'}>æ¸ç©ºéæ©</button>
                        <select id="am-bulk-type" class="ams-select">
                            <option value="">æ¹éä¿®æ¹ç±»å</option>
                            ${articleTypeOptionsMarkup('', false)}
                        </select>
                        <button class="ams-btn ams-btn-muted" id="am-bulk-apply-type" type="button" ${selectedCount ? '' : 'disabled'}>åºç¨ç±»å</button>
                        <button class="ams-btn ams-btn-warning" id="am-bulk-offline" type="button" ${selectedCount ? '' : 'disabled'}>æ¹éä¸æ¶</button>
                    </div>
                </div>`
        }
        </div>
    `;
}

function articleRows(rows, recycleMode = false) {
    const emptyColspan = 11;
    if (!rows.length) return `<tr><td colspan="${emptyColspan}"><div class="ams-empty">ææ æ°æ®ã</div></td></tr>`;
    return rows
        .map((row) => {
            const previewUrl = resolveArticlePageUrl(row, row.id);
            const displayId = resolveArticleDisplayId(row);
            const previewAction = previewUrl
                ? `<a class="ams-btn ams-btn-muted" href="${esc(previewUrl)}" target="_blank" rel="noopener noreferrer">é¢è§</a>`
                : '';
            const checked = state.selectedArticleIds.has(String(row.id)) ? 'checked' : '';

            return `
        <tr>
            <td class="ams-col-check">
                ${
                    recycleMode
                        ? '--'
                        : `<input class="ams-check" type="checkbox" data-article-select="1" data-id="${row.id}" ${checked} aria-label="éæ©æç«  ${esc(displayId)}">`
                }
            </td>
            <td><code>${esc(displayId)}</code></td>
            <td>
                <div class="ams-article-cell">
                    ${renderArticleMediaThumb(row)}
                    <div class="ams-article-text">
                        <strong>${esc(row.main_title || 'æªå½å')}</strong>
                        <div class="ams-footnote">${esc(row.subheading || '')}</div>
                    </div>
                </div>
            </td>
            <td>${esc(row.publisher || '--')}</td>
            <td class="ams-col-type">
                ${
                    recycleMode
                        ? esc(articleTypeLabel(row.type))
                        : `<select class="ams-select ams-inline-select" data-action="set-type" data-id="${row.id}" data-current-type="${esc(normalizeArticleTypeValue(row.type))}">${articleTypeOptionsMarkup(row.type, true)}</select>`
                }
            </td>
            <td>${esc(row.tag || '--')}</td>
            <td>${esc(row.secondary_tag || '--')}</td>
            <td class="ams-col-status">${pill(row.status || '--')}</td>
            <td class="ams-col-featured">${Number.isFinite(Number(row.homepage_mark)) ? `H#${Number(row.homepage_mark)}` : '--'} / ${row.featured_rank ? `F#${row.featured_rank}` : '--'}</td>
            <td class="ams-col-time">${fmtDate(row.time)}</td>
            <td class="ams-col-actions">
                <div class="ams-row-actions">
                    ${
                        recycleMode
                            ? `${previewAction}<button class="ams-btn ams-btn-muted" data-action="restore" data-id="${row.id}">æ¢å¤</button><button class="ams-btn ams-btn-danger" data-action="purge" data-id="${row.id}">æ°¸ä¹å é¤</button>`
                            : `${previewAction}<button class="ams-btn ams-btn-muted" data-action="edit" data-id="${row.id}">ç¼è¾</button>${
                                  row.status === 'archived'
                                      ? `<button class="ams-btn ams-btn-primary" data-action="online" data-id="${row.id}">ä¸æ¶</button>`
                                      : `<button class="ams-btn ams-btn-warning" data-action="offline" data-id="${row.id}">ä¸æ¶</button>`
                              }`
                    }
                </div>
            </td>
        </tr>
    `;
        })
        .join('');
}

async function renderArticles() {
    setPageHeader('æç« ç®¡ç', 'æ°å»ºãç¼è¾ãç­éãæ¹éæ¹ç±»åä¸ä¸æ¶æç« ã');
    const optionRows = await getCachedTagOptions();
    const allowedTags = new Set(
        optionRows
            .filter((item) => item && item.section === 'tag' && item.is_active !== false)
            .map((item) => String(item.option_id || item.label_en || '').trim())
            .filter(Boolean)
    );
    const allowedCategories = new Set(ARTICLE_TYPE_OPTIONS.map((item) => item.value));
    let query = {
        ...state.articles,
        tag: state.articles.tag !== 'all' && !allowedTags.has(state.articles.tag) ? 'all' : state.articles.tag,
        category: state.articles.category !== 'all' && !allowedCategories.has(state.articles.category) ? 'all' : state.articles.category,
    };
    state.articles.tag = query.tag;
    state.articles.category = query.category;
    let tagOptionsHtml = '';
    let categoryOptionsHtml = '';
    let result = { rows: [], count: 0 };
    let resolvedTotalPages = 1;

    tagOptionsHtml = buildFilterTagOptions(optionRows, query.tag);
    categoryOptionsHtml = buildFilterCategoryOptions(query.category);

    const buildArticlesBody = () => {
        pruneArticleSelection(result.rows.map((row) => row.id));
        const selectedCount = getSelectedArticleIds().length;
        const allRowsSelected = result.rows.length > 0 && result.rows.every((row) => state.selectedArticleIds.has(String(row.id)));

        return `
        ${renderSummaryChips([
            { label: 'æç« æ»æ°', value: `${result.count} ç¯` },
            { label: 'å½åé¡µ', value: `${query.page} / ${resolvedTotalPages}` },
            { label: 'æ¯é¡µæ°é', value: `${query.pageSize}` },
            { label: 'ç­éç¶æ', value: ARTICLE_STATUS_FILTER_OPTIONS.find((item) => item.value === query.status)?.label || query.status },
            { label: 'å³é®è¯', value: query.search ? query.search : 'æªè®¾ç½®' },
            { label: 'å·²éæç« ', value: `${selectedCount} ç¯` },
        ])}
        <div class="ams-table-wrap"><table class="ams-table"><thead><tr><th class="ams-col-check"><input class="ams-check" type="checkbox" id="am-select-all" ${allRowsSelected ? 'checked' : ''} aria-label="å¨éå½åé¡µ"></th><th>ID</th><th>æ é¢</th><th>åå¸æ¹</th><th class="ams-col-type">æç« ç±»å</th><th>ä¸»æ ç­¾</th><th>äºçº§æ ç­¾</th><th class="ams-col-status">ç¶æ</th><th class="ams-col-featured">æ¨èä½</th><th class="ams-col-time">æ¶é´</th><th class="ams-col-actions">æä½</th></tr></thead><tbody>${articleRows(result.rows, false)}</tbody></table></div>
        ${renderPagination('articles', query.page, resolvedTotalPages)}
        <div class="ams-footnote">æ»æ°ï¼${result.count}ï¼ä»ç»è®¡æªå é¤æç« ï¼ï¼å½åç¬¬ ${query.page} / ${resolvedTotalPages} é¡µã</div>
    `;
    };

    const syncArticleBulkToolbar = () => {
        const selectedCount = getSelectedArticleIds().length;
        const selectedCountNode = document.getElementById('am-selected-count');
        if (selectedCountNode) selectedCountNode.textContent = String(selectedCount);

        const clearBtn = document.getElementById('am-clear-selection');
        const bulkTypeBtn = document.getElementById('am-bulk-apply-type');
        const bulkOfflineBtn = document.getElementById('am-bulk-offline');
        if (clearBtn) clearBtn.disabled = !selectedCount;
        if (bulkTypeBtn) bulkTypeBtn.disabled = !selectedCount;
        if (bulkOfflineBtn) bulkOfflineBtn.disabled = !selectedCount;
    };

    const loadArticlesData = async (forceRefresh = false) => {
        query = {
            ...query,
            tag: query.tag !== 'all' && !allowedTags.has(query.tag) ? 'all' : query.tag,
            category: query.category !== 'all' && !allowedCategories.has(query.category) ? 'all' : query.category,
        };
        state.articles = { ...state.articles, ...query };

        const cacheKey = articleCacheKey(query);
        if (!forceRefresh && state.cache.articles?.key === cacheKey) {
            ({ result } = state.cache.articles);
        } else {
            result = await fetchArticles(query);
            state.cache.articles = { key: cacheKey, tagOptionsHtml, categoryOptionsHtml, result };
        }

        resolvedTotalPages = calcTotalPages(result.count, query.pageSize);
        if (query.page > resolvedTotalPages) {
            query.page = resolvedTotalPages;
            state.articles.page = resolvedTotalPages;
            invalidateArticlesCache();
            return loadArticlesData(true);
        }
        pruneArticleSelection(result.rows.map((row) => row.id));
    };

    setContent(`
        ${articleToolbar({ ...state.articles, totalPages: resolvedTotalPages }, tagOptionsHtml, categoryOptionsHtml, false, getSelectedArticleIds().length)}
        <div id="am-articles-body"></div>
    `);

    const bodyNode = document.getElementById('am-articles-body');

    const refreshArticlesBody = () => {
        if (bodyNode) bodyNode.innerHTML = buildArticlesBody();
        syncArticleBulkToolbar();
        bindArticlesBody();
    };

    const reloadArticlesBody = async (forceRefresh = true) => {
        await loadArticlesData(forceRefresh);
        refreshArticlesBody();
    };

    const bindArticlesBody = () => {
        document.getElementById('am-select-all')?.addEventListener('change', (event) => {
            const checked = Boolean(event.currentTarget?.checked);
            result.rows.forEach((row) => {
                if (checked) state.selectedArticleIds.add(String(row.id));
                else state.selectedArticleIds.delete(String(row.id));
            });
            refreshArticlesBody();
        });

        document.querySelectorAll('[data-article-select="1"]').forEach((input) => {
            input.addEventListener('change', (event) => {
                const id = String(event.currentTarget?.dataset.id || '');
                if (!id) return;
                if (event.currentTarget.checked) state.selectedArticleIds.add(id);
                else state.selectedArticleIds.delete(id);
                refreshArticlesBody();
            });
        });

        document.querySelectorAll('[data-action="edit"]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                await withButtonBusy(btn, 'å è½½ä¸­...', async () => {
                    try {
                        const id = Number(btn.dataset.id);
                        const row = await fetchArticleById(id);
                        if (!confirmDiscardEditorChanges()) return;
                        state.editor = prepareEditorState('edit', id, row);
                        state.page = 'editor';
                        void renderPage();
                    } catch (error) {
                        showToast(error.message || 'å è½½æç« å¤±è´¥ã', true);
                    }
                });
            });
        });

        document.querySelectorAll('[data-action="offline"]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const id = Number(btn.dataset.id);
                if (!window.confirm(`ç¡®è®¤ä¸æ¶æç«  ${id} åï¼ä¸æ¶åå°ä¸å¨ /news åå°å±ç¤ºã`)) return;
                await withButtonBusy(btn, 'ä¸æ¶ä¸­...', async () => {
                    try {
                        await updateArticleStatus(id, 'archived', state.user?.id || null);
                        showToast('æç« å·²ä¸æ¶ã');
                        invalidateArticlesCache();
                        await reloadArticlesBody(true);
                    } catch (error) {
                        showToast(error.message || 'ä¸æ¶å¤±è´¥ã', true);
                    }
                });
            });
        });

        document.querySelectorAll('[data-action="online"]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const id = Number(btn.dataset.id);
                if (!window.confirm(`ç¡®è®¤ä¸æ¶æç«  ${id} åï¼ä¸æ¶åå°éæ°å¨ /news åå°å±ç¤ºã`)) return;
                await withButtonBusy(btn, 'ä¸æ¶ä¸­...', async () => {
                    try {
                        await updateArticleStatus(id, 'published', state.user?.id || null);
                        showToast('æç« å·²ä¸æ¶ã');
                        invalidateArticlesCache();
                        await reloadArticlesBody(true);
                    } catch (error) {
                        showToast(error.message || 'ä¸æ¶å¤±è´¥ã', true);
                    }
                });
            });
        });

        document.querySelectorAll('[data-action="set-type"]').forEach((selectNode) => {
            selectNode.addEventListener('change', async () => {
                const id = Number(selectNode.dataset.id);
                const previousValue = selectNode.dataset.currentType || '';
                const nextType = normalizeArticleTypeValue(selectNode.value || '');
                selectNode.disabled = true;
                try {
                    await updateArticleType(id, nextType, state.user?.id || null);
                    showToast(`æç«  ${id} ç±»åå·²æ´æ°ä¸º ${articleTypeLabel(nextType)}ã`);
                    selectNode.dataset.currentType = nextType;
                    invalidateArticlesCache();
                    await reloadArticlesBody(true);
                } catch (error) {
                    selectNode.value = previousValue;
                    showToast(error.message || 'ä¿®æ¹æç« ç±»åå¤±è´¥ã', true);
                } finally {
                    if (selectNode.isConnected) selectNode.disabled = false;
                }
            });
        });

        document.querySelectorAll('[data-page-jump="articles"]').forEach((button) => {
            button.addEventListener('click', async () => {
                const nextPage = Math.max(1, Math.min(resolvedTotalPages, Number(button.dataset.page) || 1));
                if (nextPage === query.page) return;
                query.page = nextPage;
                state.articles.page = nextPage;
                invalidateArticlesCache();
                await reloadArticlesBody(false);
            });
        });

        document.querySelectorAll('[data-page-size-change="articles"]').forEach((selectNode) => {
            selectNode.addEventListener('change', async () => {
                const nextPageSize = Math.max(1, Number(selectNode.value || query.pageSize || 20));
                if (nextPageSize === query.pageSize) return;
                query.pageSize = nextPageSize;
                query.page = 1;
                state.articles.pageSize = nextPageSize;
                state.articles.page = 1;
                clearArticleSelection();
                invalidateArticlesCache();
                await reloadArticlesBody(false);
            });
        });
    };

    await loadArticlesData(false);
    refreshArticlesBody();

    document.getElementById('am-apply')?.addEventListener('click', async () => {
        query.search = document.getElementById('am-search')?.value || '';
        query.status = document.getElementById('am-status')?.value || 'all';
        query.tag = document.getElementById('am-tag')?.value || 'all';
        query.category = document.getElementById('am-category')?.value || 'all';
        query.page = 1;
        state.articles = { ...state.articles, ...query, page: 1 };
        clearArticleSelection();
        invalidateArticlesCache();
        await reloadArticlesBody(false);
    });

    document.getElementById('am-new')?.addEventListener('click', () => {
        if (!confirmDiscardEditorChanges()) return;
        state.page = 'editor';
        state.editor = prepareEditorState('create');
        void renderPage();
    });

    document.getElementById('am-select-visible')?.addEventListener('click', () => {
        result.rows.forEach((row) => state.selectedArticleIds.add(String(row.id)));
        refreshArticlesBody();
    });

    document.getElementById('am-clear-selection')?.addEventListener('click', () => {
        clearArticleSelection();
        refreshArticlesBody();
    });

    document.getElementById('am-bulk-apply-type')?.addEventListener('click', async (event) => {
        const nextType = normalizeArticleTypeValue(document.getElementById('am-bulk-type')?.value || '');
        const ids = getSelectedArticleIds();
        if (!nextType) {
            showToast('è¯·åéæ©ç®æ æç« ç±»åã', true);
            return;
        }
        if (!ids.length) {
            showToast('è¯·åéæ©è³å°ä¸ç¯æç« ã', true);
            return;
        }
        await withButtonBusy(event.currentTarget, 'æ´æ°ä¸­...', async () => {
            try {
                await batchUpdateArticleType(ids, nextType, state.user?.id || null);
                showToast(`å·²æ ${ids.length} ç¯æç« æ´æ°ä¸º ${articleTypeLabel(nextType)}ã`);
                clearArticleSelection();
                invalidateArticlesCache();
                await reloadArticlesBody(true);
            } catch (error) {
                showToast(error.message || 'æ¹éä¿®æ¹æç« ç±»åå¤±è´¥ã', true);
            }
        });
    });

    document.getElementById('am-bulk-offline')?.addEventListener('click', async (event) => {
        const ids = getSelectedArticleIds();
        if (!ids.length) {
            showToast('è¯·åéæ©è³å°ä¸ç¯æç« ã', true);
            return;
        }
        if (!window.confirm(`ç¡®è®¤ä¸æ¶æé ${ids.length} ç¯æç« åï¼`)) return;
        await withButtonBusy(event.currentTarget, 'ä¸æ¶ä¸­...', async () => {
            try {
                await batchUpdateArticleStatus(ids, 'archived', state.user?.id || null);
                showToast(`å·²ä¸æ¶ ${ids.length} ç¯æç« ã`);
                clearArticleSelection();
                invalidateArticlesCache();
                await reloadArticlesBody(true);
            } catch (error) {
                showToast(error.message || 'æ¹éä¸æ¶å¤±è´¥ã', true);
            }
        });
    });
}

async function renderRecycleBin(forceRefresh = false) {
    setPageHeader('åæ¶ç«', 'æ¢å¤æç« ææ§è¡æ°¸ä¹å é¤ã');
    let query = {
        page: state.recycle.page,
        pageSize: state.recycle.pageSize,
        includeDeleted: true,
        search: state.recycle.search,
    };
    let result = { rows: [], count: 0 };
    let totalPages = 1;

    const loadRecycleData = async (nextForceRefresh = false) => {
        const cacheKey = JSON.stringify(query);
        if (!nextForceRefresh && state.cache.recycle?.key === cacheKey) {
            result = state.cache.recycle.result;
        } else {
            result = await fetchArticles(query);
            state.cache.recycle = { key: cacheKey, result };
        }
        totalPages = calcTotalPages(result.count, query.pageSize);
        if (query.page > totalPages) {
            query.page = totalPages;
            state.recycle.page = totalPages;
            return loadRecycleData(true);
        }
    };

    const buildRecycleBody = () => `
        ${renderSummaryChips([
            { label: 'åæ¶ç«æ»æ°', value: `${result.count} ç¯` },
            { label: 'å½åé¡µ', value: `${query.page} / ${totalPages}` },
            { label: 'æ¯é¡µæ°é', value: `${query.pageSize}` },
            { label: 'å³é®è¯', value: query.search ? query.search : 'æªè®¾ç½®' },
        ])}
        <div class="ams-table-wrap"><table class="ams-table"><thead><tr><th class="ams-col-check">éæ©</th><th>ID</th><th>æ é¢</th><th>åå¸æ¹</th><th class="ams-col-type">æç« ç±»å</th><th>ä¸»æ ç­¾</th><th>äºçº§æ ç­¾</th><th class="ams-col-status">ç¶æ</th><th class="ams-col-featured">æ¨èä½</th><th class="ams-col-time">æ¶é´</th><th class="ams-col-actions">æä½</th></tr></thead><tbody>${articleRows(result.rows, true)}</tbody></table></div>
        ${renderPagination('recycle', query.page, totalPages)}
        <div class="ams-footnote">æ³¨æï¼æ°¸ä¹å é¤åä¸å¯æ¢å¤ãå½åç¬¬ ${query.page} / ${totalPages} é¡µã</div>
    `;

    setContent(`
        ${articleToolbar({ ...state.recycle, totalPages }, [], [], true)}
        <div id="am-recycle-body"></div>
    `);

    const bodyNode = document.getElementById('am-recycle-body');

    const refreshRecycleBody = () => {
        if (bodyNode) bodyNode.innerHTML = buildRecycleBody();
        bindRecycleBody();
    };

    const reloadRecycleBody = async (nextForceRefresh = false) => {
        await loadRecycleData(nextForceRefresh);
        refreshRecycleBody();
    };

    const bindRecycleBody = () => {
        document.querySelectorAll('[data-action="restore"]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                await withButtonBusy(btn, 'æ¢å¤ä¸­...', async () => {
                    try {
                        await restoreArticle(Number(btn.dataset.id), state.user?.id || null);
                        showToast('æç« å·²æ¢å¤ã');
                        invalidateArticlesCache();
                        await reloadRecycleBody(true);
                    } catch (error) {
                        showToast(error.message || 'æ¢å¤å¤±è´¥ã', true);
                    }
                });
            });
        });

        document.querySelectorAll('[data-action="purge"]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const id = Number(btn.dataset.id);
                if (!window.confirm(`ç¡®è®¤æ°¸ä¹å é¤æç«  ${id} åï¼`)) return;
                await withButtonBusy(btn, 'å é¤ä¸­...', async () => {
                    try {
                        await hardDeleteArticle(id);
                        showToast('å·²æ°¸ä¹å é¤ã');
                        invalidateArticlesCache();
                        await reloadRecycleBody(true);
                    } catch (error) {
                        showToast(error.message || 'æ°¸ä¹å é¤å¤±è´¥ã', true);
                    }
                });
            });
        });

        document.querySelectorAll('[data-page-jump="recycle"]').forEach((button) => {
            button.addEventListener('click', async () => {
                const nextPage = Math.max(1, Math.min(totalPages, Number(button.dataset.page) || 1));
                if (nextPage === query.page) return;
                query.page = nextPage;
                state.recycle.page = nextPage;
                await reloadRecycleBody(false);
            });
        });

        document.querySelectorAll('[data-page-size-change="recycle"]').forEach((selectNode) => {
            selectNode.addEventListener('change', async () => {
                const nextPageSize = Math.max(1, Number(selectNode.value || query.pageSize || 20));
                if (nextPageSize === query.pageSize) return;
                query.pageSize = nextPageSize;
                query.page = 1;
                state.recycle.pageSize = nextPageSize;
                state.recycle.page = 1;
                await reloadRecycleBody(false);
            });
        });
    };

    await loadRecycleData(forceRefresh);
    refreshRecycleBody();

    document.getElementById('am-apply')?.addEventListener('click', async () => {
        query.search = document.getElementById('am-search')?.value || '';
        query.page = 1;
        state.recycle.search = query.search;
        state.recycle.page = 1;
        state.cache.recycle = null;
        await reloadRecycleBody(true);
    });
}
function optionsFor(values, selected) {
    return values
        .map((value) => `<option value="${esc(value)}" ${selected === value ? 'selected' : ''}>${esc(value)}</option>`)
        .join('');
}

async function renderEditor() {
    const mode = state.editor.mode === 'edit' ? `ç¼è¾æç«  #${state.editor.id}` : 'æ°å»ºæç« ';
    setPageHeader(mode, 'æ¯æèç¨¿ä¿æ¤ãå¿«æ·æå¥ãå®æ¶é¢è§ä¸åå¸æ£æ¥ã');

    const optionRows = await getCachedTagOptions();
    const optionMap = TAG_SECTIONS.reduce((acc, section) => ({ ...acc, [section]: [] }), {});
    optionRows.forEach((item) => {
        if (!item || item.is_active === false || !optionMap[item.section]) return;
        optionMap[item.section].push(item.option_id || item.label_en);
    });

    const payload = ensureEditorHtmlPayload(state.editor.payload || {});
    state.editor.payload = { ...payload };
    const metrics = buildEditorMetrics(payload);
    const checklist = buildEditorChecklist(payload, metrics);
    const readyCount = checklist.filter((item) => item.ready).length;
    const currentPageUrl = resolveArticlePageUrl(payload, state.editor.id);
    const restoredLabel = state.editor.restoredAt ? fmtDate(new Date(state.editor.restoredAt).toISOString()) : '';
    const heroMessage = state.editor.draftRestored
        ? `å·²æ¢å¤æ¬å°èç¨¿${restoredLabel ? ` Â· ${restoredLabel}` : ''}ï¼ä¿å­åä¼èªå¨æ¸é¤ç¼å­ã`
        : 'æ¬é¡µä¼å¨å½åæµè§å¨ä¼è¯åæå­èç¨¿ï¼å¹¶å¨ç¦»å¼åæéæªä¿å­åå®¹ã';

    setContent(`
        <form id="editor-form" class="ams-editor-page">
            <section class="ams-card ams-editor-hero">
                <div class="ams-hero-copy">
                    <p class="ams-eyebrow">${state.editor.mode === 'edit' ? 'Edit Workspace' : 'Create Workspace'}</p>
                    <h2 id="ed-title-mirror">${esc(payload.main_title || 'æªå½åæç« ')}</h2>
                    <p id="ed-hero-note" class="ams-hero-text">${esc(heroMessage)}</p>
                    <div class="ams-chip-row">
                        <span id="ed-save-state" class="ams-mini-chip ${state.editor.dirty ? 'is-warning' : 'is-ok'}">${state.editor.dirty ? 'æªä¿å­åæ´' : 'èç¨¿ä¿æ¤å·²å¼å¯'}</span>
                        <span class="ams-mini-chip">${state.editor.mode === 'edit' ? `æç«  #${state.editor.id}` : 'æ°æç« '}</span>
                        <span class="ams-mini-chip">${esc(payload.status || 'draft')}</span>
                    </div>
                </div>
                <div id="ed-metrics" class="ams-editor-metrics-grid">
                    ${renderEditorMetricCard('æ­£æå­ç¬¦', metrics.chars || 0, 'å»ç©ºæ ¼ç»è®¡')}
                    ${renderEditorMetricCard('ä¼°ç®éè¯»', metrics.readMinutes ? `${metrics.readMinutes} åé` : '0 åé', 'æä¸­è±æ··æä¼°ç®')}
                    ${renderEditorMetricCard('ç»ææ é¢', metrics.headings.length, 'æå¤å±ç¤ºå 8 ä¸ª')}
                    ${renderEditorMetricCard('è¯é¢æ°é', metrics.topics.length, 'ç¨äºåå°èå')}
                </div>
            </section>
            <div class="ams-editor-layout">
                <div class="ams-editor-main">
                    <section class="ams-card">
                        <div class="ams-section-head">
                            <div>
                                <h3>åå¸ä¿¡æ¯</h3>
                                <p>æ é¢ãé¾æ¥ãåç±»ååªä½èµæºéä¸­ç»´æ¤ã</p>
                            </div>
                            <div id="ed-status-pill">${pill(payload.status || 'draft')}</div>
                        </div>
                        <div class="ams-editor-meta-grid">
                            <div class="ams-field ams-field-span-2"><label>æ é¢</label><input id="ed-main_title" class="ams-input" value="${esc(payload.main_title)}" placeholder="è¾å¥æç« ä¸»æ é¢" required></div>
                            <div class="ams-field ams-field-span-2"><label>å¯æ é¢</label><textarea id="ed-subheading" class="ams-textarea" placeholder="ç¨äºåè¡¨æè¦æå¯¼è¯­">${esc(payload.subheading)}</textarea></div>
                            <div class="ams-field"><label>åå¸æ¹</label><select id="ed-publisher" class="ams-select"><option value="">è¯·éæ©åå¸æ¹</option>${optionsFor(optionMap.publisher, payload.publisher)}</select></div>
                            <div class="ams-field"><label>åç±»</label><select id="ed-type" class="ams-select"><option value="">è¯·éæ©åç±»</option>${articleTypeOptionsMarkup(payload.type, true)}</select></div>
                            <div class="ams-field"><label>ä¸»æ ç­¾</label><select id="ed-tag" class="ams-select"><option value="">è¯·éæ©ä¸»æ ç­¾</option>${optionsFor(optionMap.tag, payload.tag)}</select></div>
                            <div class="ams-field"><label>äºçº§æ ç­¾</label><select id="ed-secondary_tag" class="ams-select"><option value="">è¯·éæ©äºçº§æ ç­¾</option>${optionsFor(optionMap.secondary_tag, payload.secondary_tag)}</select></div>
                            <div class="ams-field"><label>ç¶æ</label><select id="ed-status" class="ams-select"><option value="draft" ${payload.status === 'draft' ? 'selected' : ''}>èç¨¿</option><option value="published" ${payload.status === 'published' ? 'selected' : ''}>å·²åå¸</option><option value="archived" ${payload.status === 'archived' ? 'selected' : ''}>å·²ä¸æ¶</option><option value="scraping" ${payload.status === 'scraping' ? 'selected' : ''}>ééä¸­</option><option value="failed" ${payload.status === 'failed' ? 'selected' : ''}>ééå¤±è´¥</option></select></div>
                            <div class="ams-field"><label>åå¸æ¶é´ï¼ISOï¼</label><input id="ed-time" class="ams-input" value="${esc(payload.time || '')}" placeholder="2026-03-07T08:30:00.000Z"><div class="ams-inline-actions ams-inline-actions-compact"><button type="button" class="ams-btn ams-btn-muted" id="ed-set-now">è®¾ä¸ºå½åæ¶é´</button><button type="button" class="ams-btn ams-btn-muted" id="ed-copy-time">å¤å¶æ¶é´</button></div><div id="ed-time-meta" class="ams-footnote">${esc(fmtDate(payload.time))}</div></div>
                            <div class="ams-field ams-field-span-2"><label>åæé¾æ¥</label><input id="ed-link" class="ams-input" value="${esc(payload.link)}" placeholder="https://..."><div class="ams-inline-actions"><button type="button" class="ams-btn ams-btn-muted" id="ed-open-source" ${payload.link ? '' : 'disabled'}>æå¼åæ</button><button type="button" class="ams-btn ams-btn-muted" id="ed-copy-source" ${payload.link ? '' : 'disabled'}>å¤å¶åæé¾æ¥</button></div></div>
                            <div class="ams-field ams-field-span-2"><label>å½åé¡µé¢é¾æ¥</label><input id="ed-current-page-url" class="ams-input" value="${esc(currentPageUrl)}" placeholder="æç« åå»ºåæä¼çæé¾æ¥" readonly><div class="ams-inline-actions"><button type="button" class="ams-btn ams-btn-muted" id="ed-open-current-page" ${currentPageUrl ? '' : 'disabled'}>æå¼é¡µé¢</button><button type="button" class="ams-btn ams-btn-muted" id="ed-copy-current-page" ${currentPageUrl ? '' : 'disabled'}>å¤å¶é¾æ¥</button></div></div>
                            <div class="ams-field"><label>å°é¢å¾é¾æ¥</label><input id="ed-cover_image" class="ams-input" value="${esc(payload.cover_image)}" placeholder="https://.../cover.jpg"></div>
                            <div class="ams-field"><label>ä½èå¤´åé¾æ¥</label><input id="ed-author_avatar" class="ams-input" value="${esc(payload.author_avatar)}" placeholder="https://.../avatar.png"></div>
                            <div class="ams-field ams-field-span-2"><label>è¯é¢ï¼è±æéå·åéï¼</label><input id="ed-topics" class="ams-input" value="${esc(payload.topics)}" placeholder="AI, Methane, Generator"></div>
                        </div>
                    </section>
                    <section class="ams-card">
                        <div class="ams-section-head">
                            <div>
                                <h3>æ­£æç¼è¾</h3>
                                <p>Markdown ä¸ HTML æºç åæ¶ç»´æ¤ãHTML æå¼æ¶ï¼å³ä¾§é¢è§ä¼åæ¾ç¤º HTMLã</p>
                            </div>
                            <span class="ams-footnote">Ctrl/Cmd + S ä¿å­ï¼Ctrl/Cmd + Enter åå¸</span>
                        </div>
                        <div class="ams-markdown-tools">
                            <button class="ams-btn ams-btn-muted" type="button" data-md-action="h2">H2</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-md-action="h3">H3</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-md-action="list">åè¡¨</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-md-action="quote">å¼ç¨</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-md-action="link">é¾æ¥</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-md-action="code">ä»£ç å</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-md-action="image">å¾ç</button>
                        </div>
                        <div class="ams-editor-code-grid">
                            <div class="ams-field">
                                <label>Markdown æ­£æ</label>
                                <textarea id="ed-content_markdown" class="ams-textarea ams-editor-textarea" placeholder="# æ é¢\n\næ­£æåå®¹...">${esc(payload.content_markdown || '')}</textarea>
                            </div>
                            <div class="ams-field">
                                <label>HTML æºç </label>
                                <textarea id="ed-content_html" class="ams-textarea ams-editor-textarea ams-code-textarea" placeholder="<section>\n  <h2>Title</h2>\n  <p>HTML content...</p>\n</section>" spellcheck="false">${esc(payload.content_html || '')}</textarea>
                                <div class="ams-inline-actions">
                                    <button type="button" class="ams-btn ams-btn-muted" id="ed-sync-html">ç± Markdown çæ HTML</button>
                                    <button type="button" class="ams-btn ams-btn-muted" id="ed-copy-html">å¤å¶ HTML</button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                <aside class="ams-editor-side">
                    <section class="ams-card ams-editor-sticky-card">
                        <div class="ams-section-head">
                            <div>
                                <h3>åå¸æ£æ¥</h3>
                                <p>åçå®æ´åº¦ï¼åå³å®ç´æ¥åå¸è¿æ¯ç»§ç»­è¡¥åã</p>
                            </div>
                            <span class="ams-rank">${readyCount}/${checklist.length}</span>
                        </div>
                        <div id="ed-checklist-panel">${renderEditorChecklist(checklist)}</div>
                    </section>
                    <section class="ams-card">
                        <div class="ams-section-head">
                            <div>
                                <h3>å°é¢é¢è§</h3>
                                <p>åå¸åç¡®è®¤å¾çãæ é¢ååå¸æ¹çç»åææã</p>
                            </div>
                        </div>
                        <div id="ed-cover-panel"></div>
                    </section>
                    <section class="ams-card">
                        <div class="ams-section-head">
                            <div>
                                <h3>å®æ¶é¢è§</h3>
                                <p>ç¨äºæ£æ¥åºç¡æçï¼ä¸æ¿ä»£åå°æç»æ¸²æã</p>
                            </div>
                        </div>
                        <div id="ed-preview" class="ams-preview"></div>
                    </section>
                </aside>
            </div>
            <div class="ams-editor-action-bar">
                <div class="ams-editor-action-hint">å»ºè®®åä¿å­ä¸æ¬¡ï¼åæ£æ¥é¡µé¢é¾æ¥ä¸å°é¢å¾ã</div>
                <div class="ams-row-actions ams-editor-submit-row">
                    <button type="submit" class="ams-btn ams-btn-primary">${state.editor.mode === 'edit' ? 'ä¿å­ä¿®æ¹' : 'åå»ºæç« '}</button>
                    <button type="button" class="ams-btn ams-btn-muted" id="ed-save-draft">ä¿å­èç¨¿</button>
                    <button type="button" class="ams-btn ams-btn-muted" id="ed-publish">ç«å³åå¸</button>
                    <button type="button" class="ams-btn ams-btn-muted" id="ed-cancel">è¿ååè¡¨</button>
                </div>
            </div>
        </form>
    `);

    const editorForm = document.getElementById('editor-form');
    const titleInput = document.getElementById('ed-main_title');
    const timeInput = document.getElementById('ed-time');
    const contentInput = document.getElementById('ed-content_markdown');
    const htmlInput = document.getElementById('ed-content_html');
    const currentPageInput = document.getElementById('ed-current-page-url');
    const openCurrentPageBtn = document.getElementById('ed-open-current-page');
    const copyCurrentPageBtn = document.getElementById('ed-copy-current-page');
    const openSourceBtn = document.getElementById('ed-open-source');
    const copySourceBtn = document.getElementById('ed-copy-source');
    const titleMirror = document.getElementById('ed-title-mirror');
    const saveStateChip = document.getElementById('ed-save-state');
    const statusPillNode = document.getElementById('ed-status-pill');
    const metricsNode = document.getElementById('ed-metrics');
    const checklistNode = document.getElementById('ed-checklist-panel');
    const coverPanel = document.getElementById('ed-cover-panel');
    const heroNoteNode = document.getElementById('ed-hero-note');
    const timeMetaNode = document.getElementById('ed-time-meta');
    const previewNode = document.getElementById('ed-preview');

    clearPreviewBinding();

    const readPayload = () => ({
        main_title: document.getElementById('ed-main_title')?.value || '',
        subheading: document.getElementById('ed-subheading')?.value || '',
        content_markdown: document.getElementById('ed-content_markdown')?.value || '',
        content_html: document.getElementById('ed-content_html')?.value || '',
        tag: document.getElementById('ed-tag')?.value || '',
        secondary_tag: document.getElementById('ed-secondary_tag')?.value || '',
        type: document.getElementById('ed-type')?.value || '',
        publisher: document.getElementById('ed-publisher')?.value || '',
        cover_image: document.getElementById('ed-cover_image')?.value || '',
        author_avatar: document.getElementById('ed-author_avatar')?.value || '',
        topics: document.getElementById('ed-topics')?.value || '',
        link: document.getElementById('ed-link')?.value || '',
        time: document.getElementById('ed-time')?.value || new Date().toISOString(),
        status: document.getElementById('ed-status')?.value || 'draft',
    });

    const renderCoverPanel = (nextPayload) => {
        const media = getArticleMediaMeta(nextPayload);
        const title = String(nextPayload.main_title || '').trim() || 'æªå½åæç« ';
        const publisher = String(nextPayload.publisher || '').trim() || 'æªè®¾ç½®åå¸æ¹';
        const topics = splitTopics(nextPayload.topics);
        return `
            <div class="ams-cover-preview">
                <img src="${esc(media.url)}" alt="cover preview" loading="lazy" onerror="this.src='https://www.gasgx.com/news/advertisement/zhanwei.jpg'">
                <div class="ams-cover-preview-body">
                    <strong>${esc(title)}</strong>
                    <span>${esc(publisher)}</span>
                    <em>${topics.length ? `è¯é¢ï¼${esc(topics.slice(0, 3).join(' / '))}` : 'æªè®¾ç½®è¯é¢'}</em>
                </div>
            </div>
        `;
    };

    const refreshEditorPanels = (markDirty = false) => {
        const nextPayload = readPayload();
        state.editor.payload = { ...nextPayload };
        if (markDirty) {
            state.editor.dirty = true;
            state.editor.draftRestored = false;
            persistEditorDraft(state.editor);
        }

        const nextMetrics = buildEditorMetrics(nextPayload);
        const nextChecklist = buildEditorChecklist(nextPayload, nextMetrics);
        const nextCurrentPageUrl = resolveArticlePageUrl(nextPayload, state.editor.id);

        if (titleMirror) titleMirror.textContent = nextPayload.main_title.trim() || 'æªå½åæç« ';
        if (saveStateChip) {
            saveStateChip.textContent = state.editor.dirty ? 'æªä¿å­åæ´' : 'èç¨¿å·²åæ­¥';
            saveStateChip.classList.toggle('is-warning', state.editor.dirty);
            saveStateChip.classList.toggle('is-ok', !state.editor.dirty);
        }
        if (heroNoteNode && !state.editor.dirty && !state.editor.draftRestored) {
            heroNoteNode.textContent = 'æ¬é¡µä¼å¨å½åæµè§å¨ä¼è¯åæå­èç¨¿ï¼å¹¶å¨ç¦»å¼åæéæªä¿å­åå®¹ã';
        }
        if (statusPillNode) statusPillNode.innerHTML = pill(nextPayload.status || 'draft');
        if (metricsNode) {
            metricsNode.innerHTML = `
                ${renderEditorMetricCard('æ­£æå­ç¬¦', nextMetrics.chars || 0, 'å»ç©ºæ ¼ç»è®¡')}
                ${renderEditorMetricCard('ä¼°ç®éè¯»', nextMetrics.readMinutes ? `${nextMetrics.readMinutes} åé` : '0 åé', 'æä¸­è±æ··æä¼°ç®')}
                ${renderEditorMetricCard('ç»ææ é¢', nextMetrics.headings.length, 'æå¤å±ç¤ºå 8 ä¸ª')}
                ${renderEditorMetricCard('è¯é¢æ°é', nextMetrics.topics.length, 'ç¨äºåå°èå')}
            `;
        }
        if (checklistNode) checklistNode.innerHTML = renderEditorChecklist(nextChecklist);
        if (coverPanel) coverPanel.innerHTML = renderCoverPanel(nextPayload);
        if (previewNode) previewNode.innerHTML = resolveEditorPreviewHtml(nextPayload) || '<p class="ams-empty">Nothing to preview.</p>';
        if (timeMetaNode) timeMetaNode.textContent = fmtDate(nextPayload.time);
        if (currentPageInput) currentPageInput.value = nextCurrentPageUrl;
        if (openCurrentPageBtn) openCurrentPageBtn.disabled = !nextCurrentPageUrl;
        if (copyCurrentPageBtn) copyCurrentPageBtn.disabled = !nextCurrentPageUrl;
        if (openSourceBtn) openSourceBtn.disabled = !String(nextPayload.link || '').trim();
        if (copySourceBtn) copySourceBtn.disabled = !String(nextPayload.link || '').trim();
    };

    refreshEditorPanels(false);

    editorForm?.addEventListener('input', () => refreshEditorPanels(true));
    editorForm?.addEventListener('change', () => refreshEditorPanels(true));

    openCurrentPageBtn?.addEventListener('click', () => {
        openExternalUrl(currentPageInput?.value || '', 'å½åé¡µé¢é¾æ¥å°æªçæã');
    });

    copyCurrentPageBtn?.addEventListener('click', async () => {
        await withButtonBusy(copyCurrentPageBtn, 'å¤å¶ä¸­...', async () => {
            await copyText(currentPageInput?.value || '', currentPageInput, 'å½åé¡µé¢é¾æ¥å·²å¤å¶ã', 'å¤å¶å¤±è´¥ï¼è¯·æå¨å¤å¶ã');
        });
    });

    openSourceBtn?.addEventListener('click', () => {
        openExternalUrl(document.getElementById('ed-link')?.value || '', 'è¯·åå¡«ååæé¾æ¥ã');
    });

    copySourceBtn?.addEventListener('click', async () => {
        const linkInput = document.getElementById('ed-link');
        await withButtonBusy(copySourceBtn, 'å¤å¶ä¸­...', async () => {
            await copyText(linkInput?.value || '', linkInput, 'åæé¾æ¥å·²å¤å¶ã', 'è¯·åå¡«ååæé¾æ¥ã');
        });
    });

    document.getElementById('ed-set-now')?.addEventListener('click', () => {
        if (!timeInput) return;
        timeInput.value = new Date().toISOString();
        timeInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    document.getElementById('ed-copy-time')?.addEventListener('click', async (event) => {
        await withButtonBusy(event.currentTarget, 'å¤å¶ä¸­...', async () => {
            await copyText(timeInput?.value || '', timeInput, 'åå¸æ¶é´å·²å¤å¶ã', 'è¯·åå¡«ååå¸æ¶é´ã');
        });
    });

    document.querySelectorAll('[data-md-action]').forEach((button) => {
        button.addEventListener('click', () => {
            const action = button.dataset.mdAction;
            if (action === 'h2') insertMarkdownSnippet(contentInput, '## ', '', 'äºçº§æ é¢');
            if (action === 'h3') insertMarkdownSnippet(contentInput, '### ', '', 'ä¸çº§æ é¢');
            if (action === 'list') insertMarkdownSnippet(contentInput, '- ', '\n- ', 'æ¡ç®');
            if (action === 'quote') insertMarkdownSnippet(contentInput, '> ', '', 'å¼ç¨åå®¹');
            if (action === 'link') insertMarkdownSnippet(contentInput, '[', '](https://)', 'é¾æ¥æ é¢');
            if (action === 'code') insertMarkdownSnippet(contentInput, '```text\n', '\n```', 'ä»£ç æéç½®');
            if (action === 'image') insertMarkdownSnippet(contentInput, '![å¾çè¯´æ](', ')', 'https://example.com/image.jpg');
        });
    });

    document.getElementById('ed-sync-html')?.addEventListener('click', () => {
        if (!htmlInput) return;
        htmlInput.value = markdownToHtml(contentInput?.value || '');
        htmlInput.dispatchEvent(new Event('input', { bubbles: true }));
        showToast('å·²ç± Markdown çæ HTML æºç ã');
    });

    document.getElementById('ed-copy-html')?.addEventListener('click', async (event) => {
        await withButtonBusy(event.currentTarget, 'å¤å¶ä¸­...', async () => {
            await copyText(htmlInput?.value || '', htmlInput, 'HTML æºç å·²å¤å¶ã', 'å½åæ²¡æå¯å¤å¶ç HTML æºç ã');
        });
    });

    const save = async (statusOverride = null, triggerBtn = null) => {
        const payloadForSave = ensureEditorHtmlPayload(readPayload());
        if (statusOverride) payloadForSave.status = statusOverride;
        if (!payloadForSave.main_title.trim()) {
            showToast('æ é¢ä¸è½ä¸ºç©ºã', true);
            titleInput?.focus();
            return;
        }
        const saveMetrics = buildEditorMetrics(payloadForSave);
        const saveChecklist = buildEditorChecklist(payloadForSave, saveMetrics);
        const missingRequired = saveChecklist.filter((item) => item.required && !item.ready).map((item) => item.name);
        if (payloadForSave.status === 'published' && missingRequired.length) {
            const confirmed = window.confirm(`å½åä»ç¼ºå°ï¼${missingRequired.join('ã')}ãç¡®è®¤ç»§ç»­åå¸åï¼`);
            if (!confirmed) return;
        }

        await withButtonBusy(triggerBtn, statusOverride === 'published' ? 'åå¸ä¸­...' : 'ä¿å­ä¸­...', async () => {
            try {
                let savedRow = null;
                if (state.editor.mode === 'edit' && state.editor.id) {
                    savedRow = await updateArticle(state.editor.id, payloadForSave, state.user?.id || null);
                    showToast(payloadForSave.status === 'published' ? 'æç« å·²æ´æ°å¹¶åå¸ã' : 'æç« å·²æ´æ°ã');
                } else {
                    savedRow = await createArticle(payloadForSave, state.user?.id || null);
                    showToast(payloadForSave.status === 'published' ? 'æç« å·²åå»ºå¹¶åå¸ã' : 'æç« å·²åå»ºã');
                }
                clearStoredEditorDraft();
                state.editor = createEditorState('edit', savedRow?.id || state.editor.id, savedRow || payloadForSave);
                invalidateArticlesCache();
                await renderPage();
            } catch (error) {
                showToast(error.message || 'ä¿å­å¤±è´¥ã', true);
            }
        });
    };

    editorForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitBtn = event.submitter || event.currentTarget?.querySelector('button[type="submit"]');
        await save(null, submitBtn);
    });

    editorForm?.addEventListener('keydown', async (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
            event.preventDefault();
            const submitBtn = editorForm.querySelector('button[type="submit"]');
            await save(null, submitBtn);
            return;
        }
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault();
            await save('published', document.getElementById('ed-publish'));
        }
    });

    document.getElementById('ed-save-draft')?.addEventListener('click', async (event) => save('draft', event.currentTarget));
    document.getElementById('ed-publish')?.addEventListener('click', async (event) => save('published', event.currentTarget));
    document.getElementById('ed-cancel')?.addEventListener('click', () => {
        if (!confirmDiscardEditorChanges()) return;
        clearStoredEditorDraft();
        state.editor = createEditorState();
        state.page = 'articles';
        void renderPage();
    });
}

async function renderTags(forceRefresh = false) {
    setPageHeader('æ ç­¾ç®¡ç', 'ç®¡ç feeder_form_optionsï¼åç±»/åå¸æ¹/æ ç­¾ç­ä¸æéé¡¹ï¼ã');
    const rows = await getCachedTagOptions(forceRefresh);
    state.cache.tags = rows;
    const grouped = TAG_SECTIONS.reduce((acc, section) => ({ ...acc, [section]: [] }), {});
    const sectionLabels = {
        category: 'åç±»',
        publisher: 'åå¸æ¹',
        tag: 'ä¸»æ ç­¾',
        secondary_tag: 'äºçº§æ ç­¾',
    };
    rows.forEach((row) => {
        if (grouped[row.section]) grouped[row.section].push(row);
    });

    setContent(`
        <div class="ams-split">
            <section class="ams-card">
                <h3>æ°å¢ / æ´æ°éé¡¹</h3>
                <form id="tag-form" class="ams-form" style="margin-top:10px">
                    <div class="ams-field"><label>åç»</label><select id="tg-section" class="ams-select">${TAG_SECTIONS.map((section) => `<option value="${section}">${sectionLabels[section] || section}</option>`).join('')}</select></div>
                    <div class="ams-field"><label>éé¡¹ID</label><input id="tg-option-id" class="ams-input" placeholder="Hardware"></div>
                    <div class="ams-field"><label>è±æå</label><input id="tg-label-en" class="ams-input" placeholder="Hardware"></div>
                    <div class="ams-field"><label>ä¸­æå</label><input id="tg-label-zh" class="ams-input" placeholder="ç¡¬ä»¶"></div>
                    <div class="ams-field"><label>æåºå¼</label><input id="tg-sort-order" class="ams-input" type="number" value="100"></div>
                    <button class="ams-btn ams-btn-primary" type="submit">ä¿å­éé¡¹</button>
                </form>
            </section>
            <section class="ams-card"><h3>è¯´æ</h3><p class="ams-kpi-sub">éé¡¹IDå»ºè®®ä¿æç¨³å®ãç¦ç¨ç¨äºä¸çº¿æ§éé¡¹ï¼å é¤ä¸ºæ°¸ä¹æä½ã</p></section>
        </div>
        <div class="ams-stack" style="margin-top:12px">
            ${TAG_SECTIONS.map((section) => {
                const items = grouped[section] || [];
                return `<div class="ams-card"><h3>${sectionLabels[section] || section}</h3><div class="ams-table-wrap" style="margin-top:10px"><table class="ams-table" style="min-width:760px"><thead><tr><th>ID</th><th>éé¡¹ID</th><th>è±æå</th><th>ä¸­æå</th><th>æåº</th><th>å¯ç¨</th><th>æä½</th></tr></thead><tbody>${items.length ? items.map((item) => `<tr><td><code>${item.id}</code></td><td>${esc(item.option_id || '--')}</td><td>${esc(item.label_en || '--')}</td><td>${esc(item.label_zh || '--')}</td><td>${esc(String(item.sort_order ?? '--'))}</td><td>${item.is_active ? 'æ¯' : 'å¦'}</td><td><div class="ams-row-actions"><button class="ams-btn ams-btn-muted" data-tag-action="toggle" data-id="${item.id}" data-active="${item.is_active ? 1 : 0}">${item.is_active ? 'ç¦ç¨' : 'å¯ç¨'}</button><button class="ams-btn ams-btn-muted" data-tag-action="rename" data-id="${item.id}" data-label="${esc(item.label_en || '')}">æ¹å</button><button class="ams-btn ams-btn-danger" data-tag-action="delete" data-id="${item.id}">å é¤</button></div></td></tr>`).join('') : '<tr><td colspan="7"><div class="ams-empty">ææ éé¡¹ã</div></td></tr>'}</tbody></table></div></div>`;
            }).join('')}
        </div>
    `);

    document.getElementById('tag-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitButton = event.submitter || event.currentTarget?.querySelector('button[type="submit"]');
        await withButtonBusy(submitButton, 'ä¿å­ä¸­...', async () => {
            try {
                await upsertTagOption({
                    section: document.getElementById('tg-section')?.value || '',
                    option_id: document.getElementById('tg-option-id')?.value || '',
                    label_en: document.getElementById('tg-label-en')?.value || '',
                    label_zh: document.getElementById('tg-label-zh')?.value || '',
                    sort_order: Number(document.getElementById('tg-sort-order')?.value || 100),
                    is_active: true,
                });
                invalidateTagOptionsCache();
                showToast('éé¡¹å·²ä¿å­ã');
                void renderPage();
            } catch (error) {
                showToast(error.message || 'ä¿å­å¤±è´¥ã', true);
            }
        });
    });

    document.querySelectorAll('[data-tag-action="toggle"]').forEach((button) => {
        button.addEventListener('click', async () => {
            await withButtonBusy(button, 'å¤çä¸­...', async () => {
                try {
                    const id = Number(button.dataset.id);
                    const active = button.dataset.active === '1';
                    await updateTagOptionById(id, { is_active: !active });
                    invalidateTagOptionsCache();
                    showToast('éé¡¹ç¶æå·²æ´æ°ã');
                    void renderPage();
                } catch (error) {
                    showToast(error.message || 'æ´æ°å¤±è´¥ã', true);
                }
            });
        });
    });

    document.querySelectorAll('[data-tag-action="rename"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = Number(button.dataset.id);
            const current = button.dataset.label || '';
            const next = window.prompt('è¯·è¾å¥æ°çè±æåï¼', current);
            if (next === null) return;
            await withButtonBusy(button, 'å¤çä¸­...', async () => {
                try {
                    await updateTagOptionById(id, { label_en: next });
                    invalidateTagOptionsCache();
                    showToast('éé¡¹å·²æ¹åã');
                    void renderPage();
                } catch (error) {
                    showToast(error.message || 'æ¹åå¤±è´¥ã', true);
                }
            });
        });
    });

    document.querySelectorAll('[data-tag-action="delete"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = Number(button.dataset.id);
            if (!window.confirm(`ç¡®è®¤å é¤éé¡¹ #${id} åï¼`)) return;
            await withButtonBusy(button, 'å é¤ä¸­...', async () => {
                try {
                    await deleteTagOptionById(id);
                    invalidateTagOptionsCache();
                    showToast('éé¡¹å·²å é¤ã');
                    void renderPage();
                } catch (error) {
                    showToast(error.message || 'å é¤å¤±è´¥ã', true);
                }
            });
        });
    });
}
async function renderFeatured(forceRefresh = false) {
    setPageHeader('é¦é¡µæ¨èä½ç®¡ç', 'é¦é¡µå¤§ä½ä¸å¹¿åä½å®å¨ç¬ç«ï¼åå«è°æ´ãåå«ä¿å­ã');

    const featuredCacheKey = JSON.stringify({ limit: state.featured.limit });
    let featuredData = !forceRefresh && state.cache.featured?.key === featuredCacheKey ? state.cache.featured.data : null;
    if (!featuredData) {
        const [poolRows, heroRows, featuredRows] = await Promise.all([fetchFeaturedPool(120), fetchHeroSelection(), fetchFeaturedSelection(state.featured.limit)]);
        featuredData = { poolRows, heroRows, featuredRows };
        state.cache.featured = { key: featuredCacheKey, data: featuredData };
    }
    const { poolRows, heroRows, featuredRows } = featuredData;
    if (!state.featured.heroIds.length) state.featured.heroIds = heroRows.map((row) => row.id).slice(0, HOMEPAGE_MARK_LIMIT);
    if (!state.featured.ids.length) state.featured.ids = featuredRows.map((row) => row.id);

    const mapById = new Map(poolRows.map((row) => [row.id, row]));
    const heroCards = state.featured.heroIds
        .slice(0, HOMEPAGE_MARK_LIMIT)
        .map((id) => mapById.get(id) || heroRows.find((row) => row.id === id))
        .filter(Boolean);
    const heroSlots = Array.from({ length: HOMEPAGE_MARK_LIMIT }, (_, index) => heroCards[index] || null);

    const featuredCards = state.featured.ids
        .slice(0, state.featured.limit)
        .map((id) => mapById.get(id) || featuredRows.find((row) => row.id === id))
        .filter(Boolean);

    const renderHeroSlot = (item, index) => {
        if (!item) return `<div class="ams-empty">é¦é¡µä½ ${index + 1} æªè®¾ç½®ãè¯·ä»ä¸æ¹åéæ± æ·»å ã</div>`;
        const previewUrl = resolveArticlePageUrl(item, item.id);
        return `
            <div class="ams-list-item ams-feature-row">
                <div class="ams-feature-main">
                    <span class="ams-rank">${index + 1}</span>
                    ${renderArticleMediaThumb(item, 'ams-feature-thumb')}
                    <div class="ams-feature-text">
                        <strong>${esc(item.main_title || 'æªå½å')}</strong>
                        <div class="ams-footnote">#${item.id} Â· ${esc(item.tag || '--')} Â· é¦é¡µä½${index + 1}</div>
                    </div>
                </div>
                <div class="ams-feature-actions ams-feature-actions-4">
                    ${previewUrl ? `<a class="ams-btn ams-btn-muted" href="${esc(previewUrl)}" target="_blank" rel="noopener noreferrer">é¢è§</a>` : ''}
                    <button class="ams-btn ams-btn-muted" data-hero-action="up" data-id="${item.id}">ä¸ç§»</button>
                    <button class="ams-btn ams-btn-muted" data-hero-action="down" data-id="${item.id}">ä¸ç§»</button>
                    <button class="ams-btn ams-btn-danger" data-hero-action="remove" data-id="${item.id}">ç§»é¤</button>
                </div>
            </div>
        `;
    };

    const renderAdRow = (item, index) => {
        const previewUrl = resolveArticlePageUrl(item, item.id);
        return `
            <div class="ams-list-item ams-feature-row">
                <div class="ams-feature-main">
                    <span class="ams-rank">${index + 1}</span>
                    ${renderArticleMediaThumb(item, 'ams-feature-thumb')}
                    <div class="ams-feature-text">
                        <strong>${esc(item.main_title || 'æªå½å')}</strong>
                        <div class="ams-footnote">#${item.id} Â· ${esc(item.tag || '--')} Â· å¹¿åä½${index + 1}</div>
                    </div>
                </div>
                <div class="ams-feature-actions ams-feature-actions-4">
                    ${previewUrl ? `<a class="ams-btn ams-btn-muted" href="${esc(previewUrl)}" target="_blank" rel="noopener noreferrer">é¢è§</a>` : ''}
                    <button class="ams-btn ams-btn-muted" data-ft-action="up" data-id="${item.id}">ä¸ç§»</button>
                    <button class="ams-btn ams-btn-muted" data-ft-action="down" data-id="${item.id}">ä¸ç§»</button>
                    <button class="ams-btn ams-btn-danger" data-ft-action="remove" data-id="${item.id}">ç§»é¤</button>
                </div>
            </div>
        `;
    };

    setContent(`
        <section class="ams-card" style="margin-bottom:12px">
            <h3>æä½è¯´æï¼ç¬ç«æ§å¶ï¼</h3>
            <div class="ams-footnote" style="margin-top:8px;line-height:1.6">
                1ï¼é¦é¡µ3ä¸ªå¤§ä½åªæ§å¶ <code>homepage_mark 1/2/3</code>ã<br>
                2ï¼å¹¿åä½åªæ§å¶ <code>featured_rank 1..N</code>ã<br>
                3ï¼ä¸¤ä¸ªåºåäºä¸å½±åï¼åå«ä¿å­ã
            </div>
        </section>
        <div class="ams-split">
            <section class="ams-card">
                <div class="ams-feature-header-row">
                    <div>
                        <h3>â  é¦é¡µ3ä¸ªå¤§æ¨èä½ï¼åºå®ä½ç½®ï¼</h3>
                        <div class="ams-footnote">ä½ç½®è¯´æï¼1=å·¦ä¾§å¤§å¾ï¼2=å³ä¸ï¼3=å³ä¸ã</div>
                    </div>
                    <button id="hero-publish" class="ams-btn ams-btn-primary" type="button">ä¿å­é¦é¡µ3å¤§ä½</button>
                </div>
                <div class="ams-list" style="margin-top:10px">
                    ${heroSlots.map((item, index) => renderHeroSlot(item, index)).join('')}
                </div>
            </section>
            <section class="ams-card">
                <div class="ams-feature-header-row">
                    <div>
                        <h3>â¡ å¹¿åæ¨èä½åè¡¨</h3>
                        <div class="ams-footnote">å¹¿åä½æ°éä¸æåºç¬ç«æ§å¶ã</div>
                    </div>
                </div>
                <div class="ams-toolbar" style="grid-template-columns:180px 1fr;">
                    <div class="ams-field"><label>å¹¿åä½æ°éï¼Nï¼</label><input id="ft-limit" class="ams-input" type="number" min="1" max="30" value="${state.featured.limit}"></div>
                    <div class="ams-toolbar-actions">
                        <button id="ft-apply" class="ams-btn ams-btn-muted" type="button">åºç¨æ°éN</button>
                        <button id="ft-publish" class="ams-btn ams-btn-primary" type="button">ä¿å­å¹¿åä½</button>
                    </div>
                </div>
                <div class="ams-list" style="margin-top:10px">
                    ${featuredCards.length ? featuredCards.map((item, index) => renderAdRow(item, index)).join('') : '<div class="ams-empty">è¿æ²¡è®¾ç½®å¹¿åæ¨èä½ï¼è¯·å°ä¸æ¹åéæ± ç¹å»âå å¥å¹¿åä½âã</div>'}
                </div>
            </section>
        </div>
        <section class="ams-card" style="margin-top:12px">
            <h3>â¢ å·²åå¸æç« åéæ± ï¼å«ç¼©ç¥å¾ä¸é¢è§ï¼</h3>
            <div id="featured-pool-list" class="ams-list" style="margin-top:10px;max-height:520px;overflow:auto;">
                ${
                    poolRows.length
                        ? poolRows
                              .map((item) => {
                                  const previewUrl = resolveArticlePageUrl(item, item.id);
                                  return `<div class="ams-list-item ams-pool-row">
                                    <div class="ams-feature-main">
                                        ${renderArticleMediaThumb(item, 'ams-feature-thumb')}
                                        <div class="ams-feature-text"><strong>${esc(item.main_title || 'æªå½å')}</strong><div class="ams-footnote">#${item.id} Â· ${esc(item.tag || '--')} Â· ${fmtDate(item.time)}</div></div>
                                    </div>
                                    <div class="ams-feature-actions ams-feature-actions-4">
                                        ${previewUrl ? `<a class="ams-btn ams-btn-muted" href="${esc(previewUrl)}" target="_blank" rel="noopener noreferrer">é¢è§</a>` : ''}
                                        <button class="ams-btn ${state.featured.heroIds.includes(item.id) ? 'ams-btn-danger' : 'ams-btn-muted'}" data-hero-action="toggle" data-id="${item.id}">${state.featured.heroIds.includes(item.id) ? 'ç§»åºé¦é¡µå¤§ä½' : 'å å¥é¦é¡µå¤§ä½'}</button>
                                        <button class="ams-btn ${state.featured.ids.includes(item.id) ? 'ams-btn-danger' : 'ams-btn-muted'}" data-ft-action="toggle" data-id="${item.id}">${state.featured.ids.includes(item.id) ? 'ç§»åºå¹¿åä½' : 'å å¥å¹¿åä½'}</button>
                                    </div>
                                </div>`;
                              })
                              .join('')
                        : '<div class="ams-empty">ææ å·²åå¸æç« ã</div>'
                }
            </div>
        </section>
        <div class="ams-footnote">å½åç¶æï¼é¦é¡µå¤§ä½ ${heroCards.length}/${HOMEPAGE_MARK_LIMIT}ï¼å¹¿åä½ ${featuredCards.length}/${state.featured.limit}ã</div>
    `);
    const poolList = document.getElementById('featured-pool-list');
    if (poolList) {
        poolList.scrollTop = Number.isFinite(state.featured.poolScrollTop) ? state.featured.poolScrollTop : 0;
    }
    const rerenderFeatured = () => {
        const nextPool = document.getElementById('featured-pool-list');
        state.featured.poolScrollTop = nextPool ? nextPool.scrollTop : 0;
        void renderFeatured();
    };

    document.getElementById('ft-apply')?.addEventListener('click', () => {
        state.featured.limit = Math.max(1, Math.min(30, Number(document.getElementById('ft-limit')?.value || DEFAULT_FEATURED_LIMIT)));
        state.featured.ids = state.featured.ids.slice(0, state.featured.limit);
        showToast(`å¹¿åæ¨èä½æ°éå·²è®¾ç½®ä¸º N=${state.featured.limit}ï¼ç¹å»ä¿å­åçæï¼ã`);
        rerenderFeatured();
    });

    document.getElementById('hero-publish')?.addEventListener('click', async (event) => {
        await withButtonBusy(event.currentTarget, 'ä¿å­ä¸­...', async () => {
            try {
                await publishHeroMarks(state.featured.heroIds, state.user?.id || null);
                showToast('é¦é¡µ3ä¸ªå¤§æ¨èä½å·²ä¿å­ã');
                rerenderFeatured();
            } catch (error) {
                showToast(error.message || 'é¦é¡µä½ä¿å­å¤±è´¥ã', true);
            }
        });
    });

    document.getElementById('ft-publish')?.addEventListener('click', async (event) => {
        await withButtonBusy(event.currentTarget, 'ä¿å­ä¸­...', async () => {
            try {
                await publishFeaturedRanks(state.featured.ids, state.featured.limit, state.user?.id || null);
                showToast('å¹¿åæ¨èä½åè¡¨å·²ä¿å­ã');
                rerenderFeatured();
            } catch (error) {
                showToast(error.message || 'å¹¿åä½ä¿å­å¤±è´¥ã', true);
            }
        });
    });

    document.querySelectorAll('[data-hero-action]').forEach((button) => {
        button.addEventListener('click', () => {
            const action = button.dataset.heroAction;
            const id = Number(button.dataset.id);
            const index = state.featured.heroIds.indexOf(id);
            if (action === 'toggle') {
                if (index >= 0) state.featured.heroIds = state.featured.heroIds.filter((item) => item !== id);
                else if (state.featured.heroIds.length < HOMEPAGE_MARK_LIMIT) state.featured.heroIds.push(id);
                else showToast(`é¦é¡µå¤§æ¨èä½æå¤ ${HOMEPAGE_MARK_LIMIT} æ¡ã`, true);
            }
            if (action === 'remove') state.featured.heroIds = state.featured.heroIds.filter((item) => item !== id);
            if (action === 'up' && index > 0) {
                const next = [...state.featured.heroIds];
                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                state.featured.heroIds = next;
            }
            if (action === 'down' && index >= 0 && index < state.featured.heroIds.length - 1) {
                const next = [...state.featured.heroIds];
                [next[index + 1], next[index]] = [next[index], next[index + 1]];
                state.featured.heroIds = next;
            }
            rerenderFeatured();
        });
    });

    document.querySelectorAll('[data-ft-action]').forEach((button) => {
        button.addEventListener('click', () => {
            const action = button.dataset.ftAction;
            const id = Number(button.dataset.id);
            const index = state.featured.ids.indexOf(id);
            if (action === 'toggle') {
                if (index >= 0) state.featured.ids = state.featured.ids.filter((item) => item !== id);
                else if (state.featured.ids.length < state.featured.limit) state.featured.ids.push(id);
                else showToast(`å¹¿åæ¨èä½å·²æ»¡ï¼N=${state.featured.limit}ï¼ã`, true);
            }
            if (action === 'remove') state.featured.ids = state.featured.ids.filter((item) => item !== id);
            if (action === 'up' && index > 0) {
                const next = [...state.featured.ids];
                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                state.featured.ids = next;
            }
            if (action === 'down' && index >= 0 && index < state.featured.ids.length - 1) {
                const next = [...state.featured.ids];
                [next[index + 1], next[index]] = [next[index], next[index + 1]];
                state.featured.ids = next;
            }
            rerenderFeatured();
        });
    });
}

function renderFooterSocialRow(item) {
    const iconHtml = item.iconClass
        ? `<i class="${esc(item.iconClass)}"></i>`
        : `<span class="ams-social-text-badge">${esc(item.label)}</span>`;

    return `
        <div class="ams-social-row" data-social-row="${esc(item.id)}">
            <div class="ams-social-meta">
                <div class="ams-social-icon">${iconHtml}</div>
                <div>
                    <strong>${esc(item.label)}</strong>
                    <div class="ams-footnote">${esc(item.id)}</div>
                </div>
            </div>
            <label class="ams-social-toggle">
                <input type="checkbox" data-social-enabled="${esc(item.id)}" ${item.enabled ? 'checked' : ''}>
                <span>å±ç¤º</span>
            </label>
            <input class="ams-input" data-social-href="${esc(item.id)}" value="${esc(item.href)}" placeholder="${esc(item.defaultHref)}">
            <button class="ams-btn ams-btn-primary" type="button" data-social-save="${esc(item.id)}">ä¿å­</button>
        </div>
    `;
}

async function renderSiteSettings(forceRefresh = false) {
    setPageHeader('ç«ç¹è®¾ç½®', 'ç»ä¸ç®¡ç footer èç³»æ¹å¼åç¤¾äº¤æé®ã');
    const settings = !forceRefresh && state.cache.siteSettings ? state.cache.siteSettings : await fetchFooterSocialSettings();
    state.siteSettings.footerSocial = settings;
    state.cache.siteSettings = settings;

    setContent(`
        <section class="ams-card" style="margin-bottom:12px">
            <div class="ams-section-head">
                <div>
                    <h3>Footer èç³»æ¹å¼</h3>
                    <p>æ§å¶ footer å³ä¾§ Contact Us ä¸æ¹æ¾ç¤ºææ¬åè·³è½¬é¾æ¥ã</p>
                </div>
            </div>
            <div class="ams-settings-stack">
                <div class="ams-social-row">
                    <div class="ams-social-meta">
                        <div class="ams-social-icon"><i class="fa-brands fa-weixin"></i></div>
                        <div>
                            <strong>Contact Us</strong>
                            <div class="ams-footnote">News footer èç³»æ¹å¼å¥å£</div>
                        </div>
                    </div>
                    <div class="ams-field" style="gap:4px">
                        <label style="font-size:10px">æ¾ç¤ºææ¬</label>
                        <input class="ams-input" id="am-footer-contact-label" value="${esc(settings.contact?.label || 'www_gasgx_com')}" placeholder="www_gasgx_com">
                    </div>
                    <div class="ams-field" style="gap:4px">
                        <label style="font-size:10px">è·³è½¬é¾æ¥</label>
                        <input class="ams-input" id="am-footer-contact-href" value="${esc(settings.contact?.href || '/about/contact')}" placeholder="/about/contact">
                    </div>
                    <button class="ams-btn ams-btn-primary" type="button" id="am-footer-contact-save">ä¿å­èç³»æ¹å¼</button>
                </div>
            </div>
        </section>
        <section class="ams-card">
            <div class="ams-section-head">
                <div>
                    <h3>Footer ç¤¾äº¤æé®</h3>
                    <p>æ§å¶ News é¡µåºé¨ç¤¾äº¤æé®æ¯å¦å±ç¤ºï¼ä»¥åæ¯ä¸ªæé®è·³è½¬é¾æ¥ã</p>
                </div>
            </div>
            <div class="ams-settings-stack">
                <div class="ams-social-row ams-social-row-group">
                    <div>
                        <strong>ç¤¾äº¤æé®æ»å¼å³</strong>
                        <div class="ams-footnote">å³é­åï¼footer æ´ç»ç¤¾äº¤æé®éèã</div>
                    </div>
                    <label class="ams-social-toggle">
                        <input type="checkbox" id="am-social-group-visible" ${settings.groupVisible ? 'checked' : ''}>
                        <span>${settings.groupVisible ? 'å·²å¼å¯' : 'å·²å³é­'}</span>
                    </label>
                    <div></div>
                    <button class="ams-btn ams-btn-primary" type="button" id="am-social-group-save">ä¿å­æ»å¼å³</button>
                </div>
                <div class="ams-settings-list">
                    ${settings.items.map((item) => renderFooterSocialRow(item)).join('')}
                </div>
            </div>
        </section>
        <div class="ams-footnote">è¯´æï¼çç©ºç¤¾äº¤é¾æ¥æ¶ï¼åå°ä»ä¼ä½¿ç¨ç³»ç»é»è®¤é¾æ¥ï¼å³é­å±ç¤ºæ¶ï¼è¯¥æé®ä¸ä¼åºç°å¨ footerã</div>
    `);

    document.getElementById('am-footer-contact-save')?.addEventListener('click', async (event) => {
        const label = document.getElementById('am-footer-contact-label')?.value || '';
        const href = document.getElementById('am-footer-contact-href')?.value || '';
        await withButtonBusy(event.currentTarget, 'ä¿å­ä¸­...', async () => {
            try {
                await upsertFooterContactSettings({ label, href });
                settings.contact = { ...(settings.contact || {}), label, href };
                state.cache.siteSettings = settings;
                showToast('Footer èç³»æ¹å¼å·²æ´æ°ã');
            } catch (error) {
                showToast(error.message || 'ä¿å­èç³»æ¹å¼å¤±è´¥ã', true);
            }
        });
    });

    document.getElementById('am-social-group-save')?.addEventListener('click', async (event) => {
        const checkbox = document.getElementById('am-social-group-visible');
        const nextVisible = Boolean(checkbox?.checked);
        await withButtonBusy(event.currentTarget, 'ä¿å­ä¸­...', async () => {
            try {
                await updateFooterSocialGroupVisible(nextVisible);
                settings.groupVisible = nextVisible;
                state.cache.siteSettings = settings;
                showToast(`ç¤¾äº¤æé®æ»å¼å³å·²${nextVisible ? 'å¼å¯' : 'å³é­'}ã`);
            } catch (error) {
                showToast(error.message || 'ä¿å­ç¤¾äº¤æé®æ»å¼å³å¤±è´¥ã', true);
            }
        });
    });

    document.querySelectorAll('[data-social-save]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = String(button.dataset.socialSave || '').trim();
            const enabledNode = document.querySelector(`[data-social-enabled="${id}"]`);
            const hrefNode = document.querySelector(`[data-social-href="${id}"]`);
            const enabled = Boolean(enabledNode?.checked);
            const href = hrefNode?.value || '';
            const item = settings.items.find((entry) => entry.id === id);

            await withButtonBusy(button, 'ä¿å­ä¸­...', async () => {
                try {
                    await upsertFooterSocialItem({
                        id,
                        href,
                        enabled,
                        sortOrder: item?.sortOrder || 100,
                    });
                    if (item) {
                        item.enabled = enabled;
                        item.href = href;
                    }
                    state.cache.siteSettings = settings;
                    showToast(`${item?.label || id} å·²æ´æ°ã`);
                } catch (error) {
                    showToast(error.message || 'ä¿å­ç¤¾äº¤æé®å¤±è´¥ã', true);
                }
            });
        });
    });
}

async function renderQueue(forceRefresh = false) {
    setPageHeader('éééå', 'æ¥ç scrape_queue çééç¶æï¼å¹¶æ¯ææå¨æ´æ¹ç¶æã');
    const queueCacheKey = JSON.stringify({
        page: state.queue.page,
        pageSize: state.queue.pageSize,
        status: state.queue.status,
    });
    let queueData = !forceRefresh && state.cache.queue?.key === queueCacheKey ? state.cache.queue.data : null;
    if (!queueData) {
        const [result, discoveredStatuses] = await Promise.all([fetchReviewQueue(state.queue), fetchQueueStatuses()]);
        queueData = { result, discoveredStatuses };
        state.cache.queue = { key: queueCacheKey, data: queueData };
    }
    const { result, discoveredStatuses } = queueData;
    const statusSet = new Set(
        (discoveredStatuses || [])
            .map((item) => queueStatusKey(item, ''))
            .filter(Boolean)
    );
    (result.rows || []).forEach((item) => {
        statusSet.add(resolveQueueRowStatus(item, 'pending'));
    });

    const normalizedSelectedStatus = queueStatusKey(state.queue.status, 'all');
    const selectedStatus = normalizedSelectedStatus !== 'all' && isFinalQueueStatus(normalizedSelectedStatus) ? 'all' : normalizedSelectedStatus;
    if (selectedStatus !== 'all') statusSet.add(selectedStatus);
    const statusValues = sortQueueStatuses(Array.from(statusSet));
    const totalPages = calcTotalPages(result.count, state.queue.pageSize);
    pruneQueueSelection(result.rows.map((row) => row.id));
    const selectedCount = getSelectedQueueIds().length;
    const allRowsSelected = result.rows.length > 0 && result.rows.every((row) => state.selectedQueueIds.has(String(row.id)));
    const filterOptions = [
        `<option value="all" ${selectedStatus === 'all' ? 'selected' : ''}>å¨é¨ç¶æ</option>`,
        ...statusValues.map((status) => `<option value="${esc(status)}" ${selectedStatus === status ? 'selected' : ''}>${esc(queueStatusLabel(status))}</option>`),
    ].join('');

    setContent(`
        <div class="ams-toolbar-card">
        <div class="ams-toolbar ams-queue-toolbar">
            <div class="ams-field"><label>ç¶æ</label><select id="qr-status" class="ams-select">${filterOptions}</select></div>
            <div class="ams-field"><label>æ¯é¡µæ°é</label><select id="qr-page-size" class="ams-select">${pageSizeOptions(state.queue.pageSize || 20)}</select></div>
            <div class="ams-field"><label>é¡µç </label><input id="qr-page" class="ams-input" type="number" min="1" value="${state.queue.page}"></div>
            <div class="ams-toolbar-actions"><button id="qr-apply" class="ams-btn ams-btn-primary" type="button">å·æ°</button></div>
        </div>
        </div>
        ${renderSummaryChips([
            { label: 'éåæ»æ°', value: `${result.count} æ¡` },
            { label: 'å½åé¡µ', value: `${state.queue.page} / ${totalPages}` },
            { label: 'æ¯é¡µæ°é', value: `${state.queue.pageSize}` },
            { label: 'ç­éç¶æ', value: selectedStatus === 'all' ? 'å¨é¨' : queueStatusLabel(selectedStatus) },
        ])}
        <div class="ams-bulk-toolbar ams-bulk-toolbar-queue">
            <div class="ams-bulk-meta">å·²é <strong id="qr-selected-count">${selectedCount}</strong> æ¡éå</div>
            <div class="ams-bulk-actions">
                <button class="ams-btn ams-btn-muted" id="qr-select-visible" type="button">æ¬é¡µå¨é</button>
                <button class="ams-btn ams-btn-muted" id="qr-clear-selection" type="button" ${selectedCount ? '' : 'disabled'}>æ¸ç©ºéæ©</button>
                <select id="qr-bulk-status" class="ams-select">
                    <option value="">æ¹éå®¡æ ¸ç¶æ</option>
                    ${statusValues.map((status) => `<option value="${esc(status)}">${esc(queueStatusLabel(status))}</option>`).join('')}
                </select>
                <button class="ams-btn ams-btn-primary" id="qr-bulk-apply" type="button" ${selectedCount ? '' : 'disabled'}>æ¹éå®¡æ ¸</button>
            </div>
        </div>
        <div class="ams-table-wrap"><table class="ams-table ams-queue-table"><thead><tr><th class="ams-col-check"><input class="ams-check" type="checkbox" id="qr-select-all" ${allRowsSelected ? 'checked' : ''} aria-label="å¨éå½åé¡µéå"></th><th>ID</th><th>æ¥æº</th><th>åç±»</th><th>åå¸æ¹</th><th>æ ç­¾</th><th class="ams-col-status">ç¶æ</th><th class="ams-col-time">åå»ºæ¶é´</th><th class="ams-col-actions">æä½</th></tr></thead><tbody>${result.rows.length ? result.rows.map((item) => {
        const currentStatus = resolveQueueRowStatus(item, 'pending');
        const rowStatusValues = sortQueueStatuses([...statusValues, currentStatus]);
        const checked = state.selectedQueueIds.has(String(item.id)) ? 'checked' : '';
        const sourceLink = String(item.link || '').trim();
        const sourceMarkup = sourceLink
            ? `<a class="ams-queue-link" href="${esc(sourceLink)}" target="_blank" rel="noopener noreferrer">${esc(sourceLink)}</a>`
            : '<span class="ams-footnote">--</span>';
        return `<tr data-queue-row="${item.id}"><td class="ams-col-check"><input class="ams-check" type="checkbox" data-queue-select="1" data-id="${item.id}" ${checked} aria-label="éæ©éå ${item.id}"></td><td><code>${item.id}</code></td><td class="ams-queue-source"><strong>${esc(item.title || item.main_title || 'æªå½å')}</strong><div class="ams-footnote">${sourceMarkup}</div></td><td>${esc(item.category || '--')}</td><td>${esc(item.publisher || '--')}</td><td>${esc(item.tag_choice || item.tag || '--')} / ${esc(item.secondary_tag || '--')}</td><td class="ams-col-status" data-queue-status-pill="${item.id}">${queueStatusPill(currentStatus)}</td><td class="ams-col-time">${fmtDate(item.created_at)}</td><td class="ams-col-actions"><div class="ams-row-actions ams-row-actions-stacked ams-queue-actions"><div class="ams-queue-inline ams-queue-inline-status"><select class="ams-select ams-queue-status-select" data-queue-status-select="1" data-id="${item.id}">${rowStatusValues.map((status) => `<option value="${esc(status)}" ${status === currentStatus ? 'selected' : ''}>${esc(queueStatusLabel(status))}</option>`).join('')}</select></div></div></td></tr>`;
    }).join('') : '<tr><td colspan="9"><div class="ams-empty">ææ éåæ°æ®ã</div></td></tr>'}</tbody></table></div>
    `);

    document.getElementById('qr-apply')?.addEventListener('click', () => {
        state.queue.status = document.getElementById('qr-status')?.value || 'all';
        state.queue.pageSize = Math.max(1, Number(document.getElementById('qr-page-size')?.value || 20));
        state.queue.page = Math.max(1, Number(document.getElementById('qr-page')?.value || 1));
        clearQueueSelection();
        invalidateQueueCache();
        void renderPage();
    });

    const mapById = new Map(result.rows.map((row) => [row.id, row]));
    const syncQueueBulkToolbar = () => {
        const nextSelectedCount = getSelectedQueueIds().length;
        const selectedCountNode = document.getElementById('qr-selected-count');
        if (selectedCountNode) selectedCountNode.textContent = String(nextSelectedCount);

        const selectAllNode = document.getElementById('qr-select-all');
        if (selectAllNode) {
            selectAllNode.checked = result.rows.length > 0 && result.rows.every((row) => state.selectedQueueIds.has(String(row.id)));
        }

        const clearNode = document.getElementById('qr-clear-selection');
        const applyNode = document.getElementById('qr-bulk-apply');
        if (clearNode) clearNode.disabled = !nextSelectedCount;
        if (applyNode) applyNode.disabled = !nextSelectedCount;
    };

    document.getElementById('qr-select-all')?.addEventListener('change', (event) => {
        const checked = Boolean(event.currentTarget?.checked);
        result.rows.forEach((row) => {
            if (checked) state.selectedQueueIds.add(String(row.id));
            else state.selectedQueueIds.delete(String(row.id));
        });
        document.querySelectorAll('[data-queue-select="1"]').forEach((input) => {
            input.checked = checked;
        });
        syncQueueBulkToolbar();
    });

    document.querySelectorAll('[data-queue-select="1"]').forEach((input) => {
        input.addEventListener('change', (event) => {
            const id = String(event.currentTarget?.dataset.id || '');
            if (!id) return;
            if (event.currentTarget.checked) state.selectedQueueIds.add(id);
            else state.selectedQueueIds.delete(id);
            syncQueueBulkToolbar();
        });
    });

    document.getElementById('qr-select-visible')?.addEventListener('click', () => {
        result.rows.forEach((row) => state.selectedQueueIds.add(String(row.id)));
        document.querySelectorAll('[data-queue-select="1"]').forEach((input) => {
            input.checked = true;
        });
        syncQueueBulkToolbar();
    });

    document.getElementById('qr-clear-selection')?.addEventListener('click', () => {
        clearQueueSelection();
        document.querySelectorAll('[data-queue-select="1"]').forEach((input) => {
            input.checked = false;
        });
        syncQueueBulkToolbar();
    });

    document.getElementById('qr-bulk-apply')?.addEventListener('click', async (event) => {
        const nextStatus = queueStatusKey(document.getElementById('qr-bulk-status')?.value || '', '');
        const ids = getSelectedQueueIds();
        if (!nextStatus) {
            showToast('è¯·åéæ©ç®æ ç¶æã', true);
            return;
        }
        if (!ids.length) {
            showToast('è¯·åéæ©è³å°ä¸æ¡éåã', true);
            return;
        }

        let note = null;
        if (nextStatus === 'rejected') {
            const input = window.prompt('æç»å¤æ³¨ï¼å¯éï¼ï¼', '');
            if (input === null) return;
            note = input;
        }

        await withButtonBusy(event.currentTarget, 'æ¹éå¤çä¸­...', async () => {
            try {
                await Promise.all(ids.map((id) => updateQueueStatus(id, nextStatus, state.user?.id || null, note)));
                clearQueueSelection();
                invalidateQueueCache();
                showToast(`å·²æ ${ids.length} æ¡éåæ´æ°ä¸º ${queueStatusLabel(nextStatus)}ã`);
                await renderQueue(true);
            } catch (error) {
                showToast(error.message || 'æ¹éæ´æ°éåç¶æå¤±è´¥ã', true);
            }
        });
    });

    document.querySelectorAll('[data-queue-status-select="1"]').forEach((selectNode) => {
        selectNode.dataset.prevValue = selectNode.value || '';
        selectNode.addEventListener('change', async () => {
            const id = Number(selectNode.dataset.id);
            const nextStatus = queueStatusKey(selectNode?.value, '');
            if (!nextStatus) {
                showToast('è¯·éæ©ç¶æã', true);
                return;
            }
            const previousStatus = queueStatusKey(selectNode.dataset.prevValue || '', '');
            if (nextStatus === previousStatus) return;

            let note = null;
            if (nextStatus === 'rejected') {
                const input = window.prompt('æç»å¤æ³¨ï¼å¯éï¼ï¼', '');
                if (input === null) {
                    selectNode.value = previousStatus || selectNode.dataset.prevValue || '';
                    return;
                }
                note = input;
            }

            const previousDisabled = selectNode.disabled;
            selectNode.disabled = true;
            try {
                try {
                    await updateQueueStatus(id, nextStatus, state.user?.id || null, note);
                    invalidateQueueCache();
                    const statusPillNode = document.querySelector(`[data-queue-status-pill="${id}"]`);
                    if (statusPillNode) statusPillNode.innerHTML = queueStatusPill(nextStatus);
                    selectNode.dataset.prevValue = nextStatus;
                    const row = mapById.get(id);
                    if (row) {
                        row.review_status = nextStatus;
                        row.status = nextStatus;
                    }
                    showToast(`éå #${id} ç¶æå·²æ´æ°ä¸º ${queueStatusLabel(nextStatus)}ã`);
                } catch (error) {
                    selectNode.value = previousStatus || '';
                    showToast(error.message || 'ç¶ææ´æ°å¤±è´¥ã', true);
                }
            } finally {
                if (selectNode.isConnected) selectNode.disabled = previousDisabled;
            }
        });
    });

    syncQueueBulkToolbar();
}

async function refreshAdminAccess(forceRefresh = false) {
    if (!state.user) {
        state.adminAccess = null;
        state.entryAllowed = false;
        return false;
    }
    state.adminAccess = await getAdminUserAccess(state.user, { forceRefresh });
    state.entryAllowed = state.adminAccess?.allowed === true && canAccessConsoleEntry(state.adminAccess?.row, ADMIN_ENTRY_KIND);
    return state.adminAccess?.allowed === true;
}

async function renderPage() {
    if (!state.user || !(await refreshAdminAccess(false))) {
        state.renderedUserId = null;
        state.authView = isPasswordRecoveryMode() ? 'reset' : 'login';
        renderLogin();
        return;
    }
    if (!state.entryAllowed) {
        if (!tryRedirectToSalesDashboard()) {
            state.renderedUserId = null;
            state.authView = 'login';
            renderLogin();
        }
        return;
    }

    if (state.page === 'site-settings') {
        state.page = 'site-general';
    }

    clearPreviewBinding();
    renderShell();
    state.renderedUserId = state.user?.id || null;
    syncPageToUrl();

    try {
        if (state.page === 'dashboard') await renderDashboard();
        else if (state.page === 'site-general') await renderSiteGeneralAdmin({
            user: state.user,
            setPageHeader,
            setContent,
            showToast,
            withButtonBusy,
            rerender: () => renderPage(),
        });
        else if (state.page === 'site-navigation') await renderSiteNavigationAdmin({
            user: state.user,
            setPageHeader,
            setContent,
            showToast,
            withButtonBusy,
            rerender: () => renderPage(),
        });
        else if (state.page === 'site-footer') await renderSiteFooterAdmin({
            user: state.user,
            setPageHeader,
            setContent,
            showToast,
            withButtonBusy,
            rerender: () => renderPage(),
        });
        else if (state.page === 'admin-users') await renderAdminUsersPage({
            user: state.user,
            setPageHeader,
            setContent,
            showToast,
            withButtonBusy,
            rerender: () => renderPage(),
        });
        else if (state.page === 'admin-security') await renderAdminSecurityPage({
            user: state.user,
            setPageHeader,
            setContent,
            showToast,
            withButtonBusy,
            rerender: () => renderPage(),
        });
        else if (state.page === 'quote-brands') await renderQuoteBrandsPage({
            user: state.user,
            setPageHeader,
            setContent,
            showToast,
            withButtonBusy,
            rerender: () => renderPage(),
        });
        else if (state.page === 'quote-customers') await renderQuoteCustomersPage({
            user: state.user,
            setPageHeader,
            setContent,
            showToast,
            withButtonBusy,
            rerender: () => renderPage(),
        });
        else if (state.page === 'quote-requirements') await renderQuoteRequirementsPage({
            user: state.user,
            setPageHeader,
            setContent,
            showToast,
            withButtonBusy,
            rerender: () => renderPage(),
        });
        else if (state.page === 'quote-products') await renderQuoteProductsPage({
            user: state.user,
            setPageHeader,
            setContent,
            showToast,
            withButtonBusy,
            rerender: () => renderPage(),
        });
        else if (state.page === 'quote-instances') await renderQuoteInstancesPage({
            user: state.user,
            setPageHeader,
            setContent,
            showToast,
            withButtonBusy,
            rerender: () => renderPage(),
        });
        else if (state.page === 'articles') await renderArticles();
        else if (state.page === 'editor') await renderEditor();
        else if (state.page === 'recycle') await renderRecycleBin();
        else if (state.page === 'featured') await renderFeatured();
        else if (state.page === 'queue') await renderQueue();
        else if (state.page === 'tags') await renderTags();
        else setContent('<div class="ams-empty">æªç¥é¡µé¢ã</div>');
    } catch (error) {
        console.error(error);
        setContent(`<div class="ams-empty">${esc(error.message || 'é¡µé¢æ¸²æå¤±è´¥ã')}</div>`);
    }
}

async function boot() {
    try {
        const session = await getCurrentSession();
        state.session = session;
        state.user = session?.user || null;

        if (isPasswordRecoveryMode()) {
            state.authView = 'reset';
            renderLogin();
        } else if (!state.user || !(await refreshAdminAccess(true))) {
            state.authView = 'login';
            renderLogin();
        } else if (!state.entryAllowed) {
            if (!tryRedirectToSalesDashboard()) {
                state.authView = 'login';
                renderLogin();
            }
        } else {
            state.authView = 'login';
            await renderPage();
        }

        onAuthStateChange(async (event, nextSession) => {
            state.session = nextSession;
            state.user = nextSession?.user || null;
            if (shouldIgnoreAuthRender(event, nextSession)) return;
            if (event === 'PASSWORD_RECOVERY' || isPasswordRecoveryMode()) {
                state.authView = 'reset';
                renderLogin();
                return;
            }
            if (!state.user || !(await refreshAdminAccess(true))) {
                state.authView = 'login';
                renderLogin();
                return;
            }
            if (!state.entryAllowed) {
                if (!tryRedirectToSalesDashboard()) {
                    state.authView = 'login';
                    renderLogin();
                }
                return;
            }
            state.authView = 'login';
            await renderPage();
        });
    } catch (error) {
        console.error(error);
        state.authView = isPasswordRecoveryMode() ? 'reset' : 'login';
        renderLogin();
        showToast(error.message || 'åå§åå¤±è´¥ã', true);
    }
}

boot();

