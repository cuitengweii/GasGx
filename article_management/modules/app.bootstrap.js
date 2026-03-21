
import {
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
} from './auth.module.js?v=20260321admin01';
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
import { renderAdminSecurityPage, renderAdminUsersPage } from './admin-users.module.js?v=20260321admin01';
import { renderQuoteBrandsPage, renderQuoteInstancesPage, renderQuoteProductsPage } from './quote-system.module.js?v=20260321quote01';
import { renderSiteFooterAdmin, renderSiteGeneralAdmin, renderSiteNavigationAdmin } from './site-shell-admin.module.js?v=20260321site08';
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
    { value: 'all', label: '全部' },
    { value: 'published', label: '已发布' },
    { value: 'archived', label: '已下架' },
    { value: 'scraping', label: '采集中' },
    { value: 'failed', label: '采集失败' },
];

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
    page: 'dashboard',
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

function showToast(message, isError = false) {
    if (!toastNode) return;
    toastNode.textContent = message;
    toastNode.style.borderColor = isError ? 'rgba(239,68,68,0.55)' : 'rgba(93,214,44,0.45)';
    toastNode.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toastNode.classList.remove('show'), 2600);
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
    button.textContent = busyText || '处理中...';

    try {
        await task();
    } finally {
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
    return ARTICLE_TYPE_MAP.get(key) || (key ? key : '未设置');
}

function articleTypeOptionsMarkup(selected = '', includeEmpty = true) {
    const current = normalizeArticleTypeValue(selected);
    const options = includeEmpty ? [{ value: '', label: '未设置' }, ...ARTICLE_TYPE_OPTIONS] : [...ARTICLE_TYPE_OPTIONS];
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
    return [{ value: 'all', label: '全部' }, ...unique.map((value) => ({ value, label: value }))].map(
        (item) => `<option value="${esc(item.value)}" ${selected === item.value ? 'selected' : ''}>${esc(item.label)}</option>`
    ).join('');
}

function buildFilterCategoryOptions(selected = 'all') {
    return [{ value: 'all', label: '全部' }, ...ARTICLE_TYPE_OPTIONS]
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
        draft: '草稿',
        published: '已发布',
        archived: '已下架',
        scraping: '采集中',
        failed: '采集失败',
        pending: '待处理',
        rejected: '已拒绝',
        queued: '已入队',
        scraping: '采集中',
        processing: '处理中',
        fetched: '已采集',
        completed: '已完成',
        failed: '失败',
        success: '成功',
        error: '错误',
        all: '全部',
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
        pending: '待处理',
        done: '已完成',
        rejected: '已拒绝',
        published: '已发布',
        queued: '已入队',
        processing: '处理中',
        fetched: '已采集',
        failed: '失败',
        error: '错误',
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

function summarizeCategoryStats(rows, limit = 10) {
    const counter = new Map();
    (rows || []).forEach((row) => {
        const key = String(row?.type || row?.tag || '未分类').trim() || '未分类';
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
    return window.confirm('当前文章有未保存的内容，确认离开编辑页吗？');
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
        { name: '标题', label: '标题已填写', ready: Boolean(String(payload.main_title || '').trim()), required: true },
        { name: '分类', label: '分类已选择', ready: Boolean(String(payload.type || '').trim()), required: false },
        { name: '发布方', label: '发布方已选择', ready: Boolean(String(payload.publisher || '').trim()), required: false },
        { name: '主标签', label: '主标签已选择', ready: Boolean(String(payload.tag || '').trim()), required: false },
        { name: '封面图', label: '封面图已配置', ready: Boolean(String(payload.cover_image || '').trim()), required: false },
        { name: '正文', label: '正文达到 80 字', ready: metrics.chars >= 80, required: true },
        { name: '原文链接', label: '原文链接已填写', ready: Boolean(String(payload.link || '').trim()), required: false },
    ];
}

function pageSizeOptions(selected = 20) {
    return PAGE_SIZE_OPTIONS.map((value) => `<option value="${value}" ${Number(selected) === value ? 'selected' : ''}>${value} / 页</option>`).join('');
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
                <label class="ams-pagination-label" for="${esc(idPrefix)}-page-size">每页数量</label>
                <select class="ams-select ams-pagination-select" id="${esc(idPrefix)}-page-size" data-page-size-change="${esc(idPrefix)}">
                    ${pageSizeOptions(idPrefix === 'recycle' ? state.recycle.pageSize : state.articles.pageSize)}
                </select>
            </div>
            <button class="ams-btn ams-btn-muted" type="button" data-page-jump="${esc(idPrefix)}" data-page="${current - 1}" ${current <= 1 ? 'disabled' : ''}>上一页</button>
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
            <button class="ams-btn ams-btn-muted" type="button" data-page-jump="${esc(idPrefix)}" data-page="${current + 1}" ${current >= total ? 'disabled' : ''}>下一页</button>
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
                    ${item.required ? '<em>必需</em>' : '<em>建议</em>'}
                </div>
            `
        )
        .join('')}</div>`;
}

function renderEditorOutline(headings = []) {
    if (!headings.length) return '<div class="ams-empty">还没有识别到标题结构，建议至少添加一个二级标题。</div>';
    return `<div class="ams-editor-outline-list">${headings
        .map((heading, index) => `<div class="ams-editor-outline-item"><span>${index + 1}</span><strong>${esc(heading)}</strong></div>`)
        .join('')}</div>`;
}

function renderTopicChips(topics = []) {
    if (!topics.length) return '<div class="ams-empty">用英文逗号分隔多个话题，便于内容聚合。</div>';
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
                <p class="ams-subtitle">网站管理后台 · 仅允许后台人员登录</p>
                ${
                    isResetView
                        ? `
                    <form id="ams-reset-form" class="ams-form">
                        <div class="ams-field">
                            <label>新密码</label>
                            <input id="ams-reset-password" class="ams-input" type="password" placeholder="至少 8 位" required>
                        </div>
                        <div class="ams-field">
                            <label>确认新密码</label>
                            <input id="ams-reset-password-confirm" class="ams-input" type="password" placeholder="再次输入新密码" required>
                        </div>
                        <button class="ams-btn ams-btn-primary" type="submit">保存新密码</button>
                    </form>
                    <div class="ams-auth-links">
                        <button class="ams-btn ams-btn-muted" type="button" data-auth-view="login">返回登录</button>
                    </div>
                    <p class="ams-footnote">这是通过找回密码邮件进入的重置页。保存后会自动退出，请用新密码重新登录。</p>
                `
                        : isForgotView
                          ? `
                    <form id="ams-forgot-form" class="ams-form">
                        <div class="ams-field">
                            <label>邮箱</label>
                            <input id="ams-forgot-email" class="ams-input" type="email" placeholder="请输入管理员邮箱" required>
                        </div>
                        <button class="ams-btn ams-btn-primary" type="submit">发送重置邮件</button>
                    </form>
                    <div class="ams-auth-links">
                        <button class="ams-btn ams-btn-muted" type="button" data-auth-view="login">返回登录</button>
                    </div>
                    <p class="ams-footnote">系统会把重置链接发到该邮箱。只有后台人员名单中的账号才允许登录后台。</p>
                `
                          : `
                    <form id="ams-login-form" class="ams-form">
                        <div class="ams-field">
                            <label>邮箱</label>
                            <input id="ams-login-email" class="ams-input" type="email" placeholder="请输入管理员邮箱" required>
                        </div>
                        <div class="ams-field">
                            <label>密码</label>
                            <input id="ams-login-password" class="ams-input" type="password" placeholder="••••••••" required>
                        </div>
                        <button class="ams-btn ams-btn-primary" type="submit">登录</button>
                    </form>
                    <div class="ams-auth-links">
                        <button class="ams-btn ams-btn-link" type="button" data-auth-view="forgot">忘记密码</button>
                    </div>
                    <p class="ams-footnote">使用 Supabase Auth 登录，后台人员权限由 admin_users 名单控制。</p>
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
        await withButtonBusy(submitButton, '登录中...', async () => {
            try {
                const result = await signInWithPassword(email, password);
                state.session = { ...(result.session || {}) };
                state.user = result.user || result.session?.user || null;
                state.authView = 'login';
                state.page = 'dashboard';
                await refreshAdminAccess(true);
                await renderPage();
                showToast('登录成功。');
            } catch (error) {
                showToast(error.message || '登录失败。', true);
            }
        });
    });

    document.getElementById('ams-forgot-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('ams-forgot-email')?.value || '';
        const submitButton = event.submitter || event.currentTarget?.querySelector('button[type="submit"]');
        await withButtonBusy(submitButton, '发送中...', async () => {
            try {
                await sendPasswordResetEmail(email);
                showToast('重置密码邮件已发送。');
            } catch (error) {
                showToast(error.message || '发送重置密码邮件失败。', true);
            }
        });
    });

    document.getElementById('ams-reset-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nextPassword = document.getElementById('ams-reset-password')?.value || '';
        const confirmPassword = document.getElementById('ams-reset-password-confirm')?.value || '';
        const submitButton = event.submitter || event.currentTarget?.querySelector('button[type="submit"]');
        await withButtonBusy(submitButton, '保存中...', async () => {
            try {
                if (nextPassword !== confirmPassword) throw new Error('两次输入的新密码不一致。');
                await updateCurrentPassword(nextPassword);
                clearPasswordRecoveryUrl();
                await signOut();
                state.authView = 'login';
                renderLogin();
                showToast('密码已重置，请使用新密码重新登录。');
            } catch (error) {
                showToast(error.message || '重置密码失败。', true);
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
    root.innerHTML = `
        <div class="ams-app">
            <aside class="ams-sidebar">
                <div class="ams-sidebar-head">
                    <h2 class="ams-sidebar-title">GasGx <span>AMS</span></h2>
                    <div class="ams-sidebar-meta">网站管理后台</div>
                </div>
                <nav class="ams-nav">
                    ${navGroup('Dashboard', [navButton('dashboard', '总览', 'fa-chart-line')])}
                    ${navGroup('Site', [
                        navButton('site-general', '主站配置', 'fa-sliders'),
                        navButton('site-navigation', '主站导航', 'fa-compass'),
                        navButton('site-footer', '主站页脚', 'fa-window-maximize'),
                    ])}
                    ${navGroup('System', [
                        navButton('admin-users', '人员管理', 'fa-users-gear'),
                        navButton('admin-security', '账号安全', 'fa-user-shield'),
                    ])}
                    ${navGroup('Quotes', [
                        navButton('quote-brands', '品牌管理', 'fa-layer-group'),
                        navButton('quote-products', '产品模板', 'fa-cubes'),
                        navButton('quote-instances', '报价单管理', 'fa-file-invoice-dollar'),
                    ])}
                    ${navGroup('News', [
                        navButton('articles', '文章管理', 'fa-file-lines'),
                        navButton('editor', '新建文章', 'fa-pen-to-square'),
                        navButton('recycle', '回收站', 'fa-trash-can-arrow-up'),
                        navButton('featured', '首页推荐位', 'fa-ranking-star'),
                        navButton('queue', '采集队列', 'fa-list-check'),
                        navButton('tags', '标签管理', 'fa-tags'),
                    ])}
                </nav>
            </aside>
            <main class="ams-main">
                <header class="ams-header">
                    <div>
                        <h1 id="ams-page-title">GasGx 网站管理后台</h1>
                        <p id="ams-page-sub">统一管理主站壳、News 内容与推荐位</p>
                    </div>
                    <div class="ams-user">
                        <span><i class="fa-solid fa-user"></i> <strong>${name}</strong></span>
                        <button id="ams-signout" class="ams-btn ams-btn-muted" type="button">退出登录</button>
                    </div>
                </header>
                <section id="ams-content" class="ams-content"><div class="ams-empty">加载中...</div></section>
            </main>
        </div>
    `;

    document.getElementById('ams-signout')?.addEventListener('click', async (event) => {
        await withButtonBusy(event.currentTarget, '退出中...', async () => {
            try {
                await signOut();
            } catch (error) {
                showToast(error.message || '退出失败。', true);
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
            void renderPage();
        });
    });
}
async function renderDashboard(forceRefresh = false) {
    setPageHeader('总览', '查看主站导航、News 内容、推荐位和采集队列的整体状态。');

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
        { title: '在线文章', value: active.count, sub: '当前可在前台展示的文章数量' },
        { title: '待处理采集', value: queue.count, sub: '采集队列中待处理记录' },
        { title: '首页大位', value: `${heroSlots.length}/${HOMEPAGE_MARK_LIMIT}`, sub: 'homepage_mark 已配置数量' },
        { title: '广告推荐位', value: `${featured.length}/${state.featured.limit}`, sub: 'featured_rank 已配置数量' },
        { title: '回收站', value: recycled.count, sub: '已软删除文章数量' },
    ];

    setContent(`
        <section class="ams-card ams-dashboard-intro">
            <div class="ams-dashboard-intro-copy">
                <p class="ams-eyebrow">Dashboard</p>
                <h2>把主站壳、内容发布、推荐位和采集审核放进同一个后台。</h2>
                <p class="ams-hero-text">第一阶段先接管 www.gasgx.com 的共享 Header / Footer，同时保留原有 News 内容运营功能。这里先看整体状态，再进入 Site 或 News 具体操作页。</p>
            </div>
            <div class="ams-dashboard-intro-meta">
                <div class="ams-dashboard-highlight">
                    <span>今日重点</span>
                    <strong>${queue.count ? `优先处理 ${queue.count} 条采集记录` : '当前没有待处理采集内容'}</strong>
                </div>
                <div class="ams-dashboard-highlight">
                    <span>站点壳状态</span>
                    <strong>主站导航与 Footer 现已可在 Site 模块中统一管理</strong>
                </div>
            </div>
        </section>
        <section class="ams-dashboard-actions">
            <button class="ams-quick-link" type="button" data-dashboard-nav="site-navigation">
                <div class="ams-quick-link-icon"><i class="fa-solid fa-compass"></i></div>
                <div class="ams-quick-link-body">
                    <strong>主站导航</strong>
                    <span>调整 Header 与 Footer 导航树</span>
                </div>
            </button>
            <button class="ams-quick-link" type="button" data-dashboard-nav="site-footer">
                <div class="ams-quick-link-icon"><i class="fa-solid fa-window-maximize"></i></div>
                <div class="ams-quick-link-body">
                    <strong>主站 Footer</strong>
                    <span>管理 Contact、社交入口与合作伙伴</span>
                </div>
            </button>
            <button class="ams-quick-link" type="button" data-dashboard-nav="editor">
                <div class="ams-quick-link-icon"><i class="fa-solid fa-pen-to-square"></i></div>
                <div class="ams-quick-link-body">
                    <strong>新建文章</strong>
                    <span>直接进入发布工作区</span>
                </div>
            </button>
            <button class="ams-quick-link" type="button" data-dashboard-nav="queue">
                <div class="ams-quick-link-icon"><i class="fa-solid fa-list-check"></i></div>
                <div class="ams-quick-link-body">
                    <strong>处理采集队列</strong>
                    <span>${queue.count ? `当前还有 ${queue.count} 条待处理记录` : '当前没有待处理采集内容'}</span>
                </div>
            </button>
            <button class="ams-quick-link" type="button" data-dashboard-nav="featured">
                <div class="ams-quick-link-icon"><i class="fa-solid fa-ranking-star"></i></div>
                <div class="ams-quick-link-body">
                    <strong>调整首页推荐位</strong>
                    <span>同步管理 hero 与 featured</span>
                </div>
            </button>
        </section>
        <section class="ams-dashboard-overview">
            <div class="ams-section-head">
                <div>
                    <h3>核心概览</h3>
                    <p>优先看文章数量、采集状态和推荐位占用情况。</p>
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
            { label: '已发布抽样', value: `${sampleRows.rows.length} 篇` },
            { label: '首页推荐位', value: `${heroSlots.length}/${HOMEPAGE_MARK_LIMIT}` },
            { label: '广告位', value: `${featured.length}/${state.featured.limit}` },
            { label: '待处理', value: `${queue.count} 条` },
        ])}
        <section class="ams-card ams-category-card">
            <div class="ams-section-head">
                <div>
                    <h3>分类分布</h3>
                    <p>统计最近 200 条已发布文章，快速查看内容重心。</p>
                </div>
            </div>
            <div class="ams-category-grid">
                ${categoryStats.length ? categoryStats.map((item) => `<div class="ams-category-item"><span>${esc(item.name)}</span><strong>${item.count}</strong></div>`).join('') : '<div class="ams-empty">暂无分类数据。</div>'}
            </div>
        </section>
        <div class="ams-footnote">点击左侧菜单可进入对应功能页。</div>
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
                <label>搜索</label>
                <div class="ams-search-box">
                    <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                    <input id="am-search" class="ams-input" value="${esc(filters.search || '')}" placeholder="按标题、发布方、链接搜索">
                </div>
            </div>
            ${recycleMode ? '' : `<div class="ams-field"><label>状态</label><select id="am-status" class="ams-select">${ARTICLE_STATUS_FILTER_OPTIONS.map((item) => `<option value="${esc(item.value)}" ${filters.status === item.value ? 'selected' : ''}>${esc(item.label)}</option>`).join('')}</select></div>`}
            ${recycleMode ? '' : `<div class="ams-field"><label>标签</label><select id="am-tag" class="ams-select">${tagOptionsHtml}</select></div>`}
            ${recycleMode ? '' : `<div class="ams-field"><label>分类</label><select id="am-category" class="ams-select">${categoryOptionsHtml}</select></div>`}
            <div class="ams-toolbar-actions ams-article-toolbar-actions"><button class="ams-btn ams-btn-primary" id="am-apply" type="button">查询</button>${recycleMode ? '' : '<button class="ams-btn ams-btn-muted" id="am-new" type="button">新建</button>'}</div>
        </div>
        ${
            recycleMode
                ? ''
                : `<div class="ams-bulk-toolbar ams-bulk-toolbar-articles">
                    <div class="ams-bulk-meta">已选 <strong id="am-selected-count">${selectedCount}</strong> 篇文章</div>
                    <div class="ams-bulk-actions">
                        <button class="ams-btn ams-btn-muted" id="am-select-visible" type="button">本页全选</button>
                        <button class="ams-btn ams-btn-muted" id="am-clear-selection" type="button" ${selectedCount ? '' : 'disabled'}>清空选择</button>
                        <select id="am-bulk-type" class="ams-select">
                            <option value="">批量修改类型</option>
                            ${articleTypeOptionsMarkup('', false)}
                        </select>
                        <button class="ams-btn ams-btn-muted" id="am-bulk-apply-type" type="button" ${selectedCount ? '' : 'disabled'}>应用类型</button>
                        <button class="ams-btn ams-btn-warning" id="am-bulk-offline" type="button" ${selectedCount ? '' : 'disabled'}>批量下架</button>
                    </div>
                </div>`
        }
        </div>
    `;
}

function articleRows(rows, recycleMode = false) {
    const emptyColspan = 11;
    if (!rows.length) return `<tr><td colspan="${emptyColspan}"><div class="ams-empty">暂无数据。</div></td></tr>`;
    return rows
        .map((row) => {
            const previewUrl = resolveArticlePageUrl(row, row.id);
            const displayId = resolveArticleDisplayId(row);
            const previewAction = previewUrl
                ? `<a class="ams-btn ams-btn-muted" href="${esc(previewUrl)}" target="_blank" rel="noopener noreferrer">预览</a>`
                : '';
            const checked = state.selectedArticleIds.has(String(row.id)) ? 'checked' : '';

            return `
        <tr>
            <td class="ams-col-check">
                ${
                    recycleMode
                        ? '--'
                        : `<input class="ams-check" type="checkbox" data-article-select="1" data-id="${row.id}" ${checked} aria-label="选择文章 ${esc(displayId)}">`
                }
            </td>
            <td><code>${esc(displayId)}</code></td>
            <td>
                <div class="ams-article-cell">
                    ${renderArticleMediaThumb(row)}
                    <div class="ams-article-text">
                        <strong>${esc(row.main_title || '未命名')}</strong>
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
                            ? `${previewAction}<button class="ams-btn ams-btn-muted" data-action="restore" data-id="${row.id}">恢复</button><button class="ams-btn ams-btn-danger" data-action="purge" data-id="${row.id}">永久删除</button>`
                            : `${previewAction}<button class="ams-btn ams-btn-muted" data-action="edit" data-id="${row.id}">编辑</button>${
                                  row.status === 'archived'
                                      ? `<button class="ams-btn ams-btn-primary" data-action="online" data-id="${row.id}">上架</button>`
                                      : `<button class="ams-btn ams-btn-warning" data-action="offline" data-id="${row.id}">下架</button>`
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
    setPageHeader('文章管理', '新建、编辑、筛选、批量改类型与下架文章。');
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
            { label: '文章总数', value: `${result.count} 篇` },
            { label: '当前页', value: `${query.page} / ${resolvedTotalPages}` },
            { label: '每页数量', value: `${query.pageSize}` },
            { label: '筛选状态', value: ARTICLE_STATUS_FILTER_OPTIONS.find((item) => item.value === query.status)?.label || query.status },
            { label: '关键词', value: query.search ? query.search : '未设置' },
            { label: '已选文章', value: `${selectedCount} 篇` },
        ])}
        <div class="ams-table-wrap"><table class="ams-table"><thead><tr><th class="ams-col-check"><input class="ams-check" type="checkbox" id="am-select-all" ${allRowsSelected ? 'checked' : ''} aria-label="全选当前页"></th><th>ID</th><th>标题</th><th>发布方</th><th class="ams-col-type">文章类型</th><th>主标签</th><th>二级标签</th><th class="ams-col-status">状态</th><th class="ams-col-featured">推荐位</th><th class="ams-col-time">时间</th><th class="ams-col-actions">操作</th></tr></thead><tbody>${articleRows(result.rows, false)}</tbody></table></div>
        ${renderPagination('articles', query.page, resolvedTotalPages)}
        <div class="ams-footnote">总数：${result.count}（仅统计未删除文章），当前第 ${query.page} / ${resolvedTotalPages} 页。</div>
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
                await withButtonBusy(btn, '加载中...', async () => {
                    try {
                        const id = Number(btn.dataset.id);
                        const row = await fetchArticleById(id);
                        if (!confirmDiscardEditorChanges()) return;
                        state.editor = prepareEditorState('edit', id, row);
                        state.page = 'editor';
                        void renderPage();
                    } catch (error) {
                        showToast(error.message || '加载文章失败。', true);
                    }
                });
            });
        });

        document.querySelectorAll('[data-action="offline"]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const id = Number(btn.dataset.id);
                if (!window.confirm(`确认下架文章 ${id} 吗？下架后将不在 /news 前台展示。`)) return;
                await withButtonBusy(btn, '下架中...', async () => {
                    try {
                        await updateArticleStatus(id, 'archived', state.user?.id || null);
                        showToast('文章已下架。');
                        invalidateArticlesCache();
                        await reloadArticlesBody(true);
                    } catch (error) {
                        showToast(error.message || '下架失败。', true);
                    }
                });
            });
        });

        document.querySelectorAll('[data-action="online"]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const id = Number(btn.dataset.id);
                if (!window.confirm(`确认上架文章 ${id} 吗？上架后将重新在 /news 前台展示。`)) return;
                await withButtonBusy(btn, '上架中...', async () => {
                    try {
                        await updateArticleStatus(id, 'published', state.user?.id || null);
                        showToast('文章已上架。');
                        invalidateArticlesCache();
                        await reloadArticlesBody(true);
                    } catch (error) {
                        showToast(error.message || '上架失败。', true);
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
                    showToast(`文章 ${id} 类型已更新为 ${articleTypeLabel(nextType)}。`);
                    selectNode.dataset.currentType = nextType;
                    invalidateArticlesCache();
                    await reloadArticlesBody(true);
                } catch (error) {
                    selectNode.value = previousValue;
                    showToast(error.message || '修改文章类型失败。', true);
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
            showToast('请先选择目标文章类型。', true);
            return;
        }
        if (!ids.length) {
            showToast('请先选择至少一篇文章。', true);
            return;
        }
        await withButtonBusy(event.currentTarget, '更新中...', async () => {
            try {
                await batchUpdateArticleType(ids, nextType, state.user?.id || null);
                showToast(`已把 ${ids.length} 篇文章更新为 ${articleTypeLabel(nextType)}。`);
                clearArticleSelection();
                invalidateArticlesCache();
                await reloadArticlesBody(true);
            } catch (error) {
                showToast(error.message || '批量修改文章类型失败。', true);
            }
        });
    });

    document.getElementById('am-bulk-offline')?.addEventListener('click', async (event) => {
        const ids = getSelectedArticleIds();
        if (!ids.length) {
            showToast('请先选择至少一篇文章。', true);
            return;
        }
        if (!window.confirm(`确认下架所选 ${ids.length} 篇文章吗？`)) return;
        await withButtonBusy(event.currentTarget, '下架中...', async () => {
            try {
                await batchUpdateArticleStatus(ids, 'archived', state.user?.id || null);
                showToast(`已下架 ${ids.length} 篇文章。`);
                clearArticleSelection();
                invalidateArticlesCache();
                await reloadArticlesBody(true);
            } catch (error) {
                showToast(error.message || '批量下架失败。', true);
            }
        });
    });
}

async function renderRecycleBin(forceRefresh = false) {
    setPageHeader('回收站', '恢复文章或执行永久删除。');
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
            { label: '回收站总数', value: `${result.count} 篇` },
            { label: '当前页', value: `${query.page} / ${totalPages}` },
            { label: '每页数量', value: `${query.pageSize}` },
            { label: '关键词', value: query.search ? query.search : '未设置' },
        ])}
        <div class="ams-table-wrap"><table class="ams-table"><thead><tr><th class="ams-col-check">选择</th><th>ID</th><th>标题</th><th>发布方</th><th class="ams-col-type">文章类型</th><th>主标签</th><th>二级标签</th><th class="ams-col-status">状态</th><th class="ams-col-featured">推荐位</th><th class="ams-col-time">时间</th><th class="ams-col-actions">操作</th></tr></thead><tbody>${articleRows(result.rows, true)}</tbody></table></div>
        ${renderPagination('recycle', query.page, totalPages)}
        <div class="ams-footnote">注意：永久删除后不可恢复。当前第 ${query.page} / ${totalPages} 页。</div>
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
                await withButtonBusy(btn, '恢复中...', async () => {
                    try {
                        await restoreArticle(Number(btn.dataset.id), state.user?.id || null);
                        showToast('文章已恢复。');
                        invalidateArticlesCache();
                        await reloadRecycleBody(true);
                    } catch (error) {
                        showToast(error.message || '恢复失败。', true);
                    }
                });
            });
        });

        document.querySelectorAll('[data-action="purge"]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const id = Number(btn.dataset.id);
                if (!window.confirm(`确认永久删除文章 ${id} 吗？`)) return;
                await withButtonBusy(btn, '删除中...', async () => {
                    try {
                        await hardDeleteArticle(id);
                        showToast('已永久删除。');
                        invalidateArticlesCache();
                        await reloadRecycleBody(true);
                    } catch (error) {
                        showToast(error.message || '永久删除失败。', true);
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
    const mode = state.editor.mode === 'edit' ? `编辑文章 #${state.editor.id}` : '新建文章';
    setPageHeader(mode, '支持草稿保护、快捷插入、实时预览与发布检查。');

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
        ? `已恢复本地草稿${restoredLabel ? ` · ${restoredLabel}` : ''}，保存后会自动清除缓存。`
        : '本页会在当前浏览器会话内暂存草稿，并在离开前提醒未保存内容。';

    setContent(`
        <form id="editor-form" class="ams-editor-page">
            <section class="ams-card ams-editor-hero">
                <div class="ams-hero-copy">
                    <p class="ams-eyebrow">${state.editor.mode === 'edit' ? 'Edit Workspace' : 'Create Workspace'}</p>
                    <h2 id="ed-title-mirror">${esc(payload.main_title || '未命名文章')}</h2>
                    <p id="ed-hero-note" class="ams-hero-text">${esc(heroMessage)}</p>
                    <div class="ams-chip-row">
                        <span id="ed-save-state" class="ams-mini-chip ${state.editor.dirty ? 'is-warning' : 'is-ok'}">${state.editor.dirty ? '未保存变更' : '草稿保护已开启'}</span>
                        <span class="ams-mini-chip">${state.editor.mode === 'edit' ? `文章 #${state.editor.id}` : '新文章'}</span>
                        <span class="ams-mini-chip">${esc(payload.status || 'draft')}</span>
                    </div>
                </div>
                <div id="ed-metrics" class="ams-editor-metrics-grid">
                    ${renderEditorMetricCard('正文字符', metrics.chars || 0, '去空格统计')}
                    ${renderEditorMetricCard('估算阅读', metrics.readMinutes ? `${metrics.readMinutes} 分钟` : '0 分钟', '按中英混排估算')}
                    ${renderEditorMetricCard('结构标题', metrics.headings.length, '最多展示前 8 个')}
                    ${renderEditorMetricCard('话题数量', metrics.topics.length, '用于前台聚合')}
                </div>
            </section>
            <div class="ams-editor-layout">
                <div class="ams-editor-main">
                    <section class="ams-card">
                        <div class="ams-section-head">
                            <div>
                                <h3>发布信息</h3>
                                <p>标题、链接、分类和媒体资源集中维护。</p>
                            </div>
                            <div id="ed-status-pill">${pill(payload.status || 'draft')}</div>
                        </div>
                        <div class="ams-editor-meta-grid">
                            <div class="ams-field ams-field-span-2"><label>标题</label><input id="ed-main_title" class="ams-input" value="${esc(payload.main_title)}" placeholder="输入文章主标题" required></div>
                            <div class="ams-field ams-field-span-2"><label>副标题</label><textarea id="ed-subheading" class="ams-textarea" placeholder="用于列表摘要或导语">${esc(payload.subheading)}</textarea></div>
                            <div class="ams-field"><label>发布方</label><select id="ed-publisher" class="ams-select"><option value="">请选择发布方</option>${optionsFor(optionMap.publisher, payload.publisher)}</select></div>
                            <div class="ams-field"><label>分类</label><select id="ed-type" class="ams-select"><option value="">请选择分类</option>${articleTypeOptionsMarkup(payload.type, true)}</select></div>
                            <div class="ams-field"><label>主标签</label><select id="ed-tag" class="ams-select"><option value="">请选择主标签</option>${optionsFor(optionMap.tag, payload.tag)}</select></div>
                            <div class="ams-field"><label>二级标签</label><select id="ed-secondary_tag" class="ams-select"><option value="">请选择二级标签</option>${optionsFor(optionMap.secondary_tag, payload.secondary_tag)}</select></div>
                            <div class="ams-field"><label>状态</label><select id="ed-status" class="ams-select"><option value="draft" ${payload.status === 'draft' ? 'selected' : ''}>草稿</option><option value="published" ${payload.status === 'published' ? 'selected' : ''}>已发布</option><option value="archived" ${payload.status === 'archived' ? 'selected' : ''}>已下架</option><option value="scraping" ${payload.status === 'scraping' ? 'selected' : ''}>采集中</option><option value="failed" ${payload.status === 'failed' ? 'selected' : ''}>采集失败</option></select></div>
                            <div class="ams-field"><label>发布时间（ISO）</label><input id="ed-time" class="ams-input" value="${esc(payload.time || '')}" placeholder="2026-03-07T08:30:00.000Z"><div class="ams-inline-actions ams-inline-actions-compact"><button type="button" class="ams-btn ams-btn-muted" id="ed-set-now">设为当前时间</button><button type="button" class="ams-btn ams-btn-muted" id="ed-copy-time">复制时间</button></div><div id="ed-time-meta" class="ams-footnote">${esc(fmtDate(payload.time))}</div></div>
                            <div class="ams-field ams-field-span-2"><label>原文链接</label><input id="ed-link" class="ams-input" value="${esc(payload.link)}" placeholder="https://..."><div class="ams-inline-actions"><button type="button" class="ams-btn ams-btn-muted" id="ed-open-source" ${payload.link ? '' : 'disabled'}>打开原文</button><button type="button" class="ams-btn ams-btn-muted" id="ed-copy-source" ${payload.link ? '' : 'disabled'}>复制原文链接</button></div></div>
                            <div class="ams-field ams-field-span-2"><label>当前页面链接</label><input id="ed-current-page-url" class="ams-input" value="${esc(currentPageUrl)}" placeholder="文章创建后才会生成链接" readonly><div class="ams-inline-actions"><button type="button" class="ams-btn ams-btn-muted" id="ed-open-current-page" ${currentPageUrl ? '' : 'disabled'}>打开页面</button><button type="button" class="ams-btn ams-btn-muted" id="ed-copy-current-page" ${currentPageUrl ? '' : 'disabled'}>复制链接</button></div></div>
                            <div class="ams-field"><label>封面图链接</label><input id="ed-cover_image" class="ams-input" value="${esc(payload.cover_image)}" placeholder="https://.../cover.jpg"></div>
                            <div class="ams-field"><label>作者头像链接</label><input id="ed-author_avatar" class="ams-input" value="${esc(payload.author_avatar)}" placeholder="https://.../avatar.png"></div>
                            <div class="ams-field ams-field-span-2"><label>话题（英文逗号分隔）</label><input id="ed-topics" class="ams-input" value="${esc(payload.topics)}" placeholder="AI, Methane, Generator"></div>
                        </div>
                    </section>
                    <section class="ams-card">
                        <div class="ams-section-head">
                            <div>
                                <h3>正文编辑</h3>
                                <p>Markdown 与 HTML 源码同时维护。HTML 有值时，右侧预览优先显示 HTML。</p>
                            </div>
                            <span class="ams-footnote">Ctrl/Cmd + S 保存，Ctrl/Cmd + Enter 发布</span>
                        </div>
                        <div class="ams-markdown-tools">
                            <button class="ams-btn ams-btn-muted" type="button" data-md-action="h2">H2</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-md-action="h3">H3</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-md-action="list">列表</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-md-action="quote">引用</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-md-action="link">链接</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-md-action="code">代码块</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-md-action="image">图片</button>
                        </div>
                        <div class="ams-editor-code-grid">
                            <div class="ams-field">
                                <label>Markdown 正文</label>
                                <textarea id="ed-content_markdown" class="ams-textarea ams-editor-textarea" placeholder="# 标题\n\n正文内容...">${esc(payload.content_markdown || '')}</textarea>
                            </div>
                            <div class="ams-field">
                                <label>HTML 源码</label>
                                <textarea id="ed-content_html" class="ams-textarea ams-editor-textarea ams-code-textarea" placeholder="<section>\n  <h2>Title</h2>\n  <p>HTML content...</p>\n</section>" spellcheck="false">${esc(payload.content_html || '')}</textarea>
                                <div class="ams-inline-actions">
                                    <button type="button" class="ams-btn ams-btn-muted" id="ed-sync-html">由 Markdown 生成 HTML</button>
                                    <button type="button" class="ams-btn ams-btn-muted" id="ed-copy-html">复制 HTML</button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                <aside class="ams-editor-side">
                    <section class="ams-card ams-editor-sticky-card">
                        <div class="ams-section-head">
                            <div>
                                <h3>发布检查</h3>
                                <p>先看完整度，再决定直接发布还是继续补充。</p>
                            </div>
                            <span class="ams-rank">${readyCount}/${checklist.length}</span>
                        </div>
                        <div id="ed-checklist-panel">${renderEditorChecklist(checklist)}</div>
                    </section>
                    <section class="ams-card">
                        <div class="ams-section-head">
                            <div>
                                <h3>封面预览</h3>
                                <p>发布前确认图片、标题和发布方的组合效果。</p>
                            </div>
                        </div>
                        <div id="ed-cover-panel"></div>
                    </section>
                    <section class="ams-card">
                        <div class="ams-section-head">
                            <div>
                                <h3>实时预览</h3>
                                <p>用于检查基础排版，不替代前台最终渲染。</p>
                            </div>
                        </div>
                        <div id="ed-preview" class="ams-preview"></div>
                    </section>
                </aside>
            </div>
            <div class="ams-editor-action-bar">
                <div class="ams-editor-action-hint">建议先保存一次，再检查页面链接与封面图。</div>
                <div class="ams-row-actions ams-editor-submit-row">
                    <button type="submit" class="ams-btn ams-btn-primary">${state.editor.mode === 'edit' ? '保存修改' : '创建文章'}</button>
                    <button type="button" class="ams-btn ams-btn-muted" id="ed-save-draft">保存草稿</button>
                    <button type="button" class="ams-btn ams-btn-muted" id="ed-publish">立即发布</button>
                    <button type="button" class="ams-btn ams-btn-muted" id="ed-cancel">返回列表</button>
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
        const title = String(nextPayload.main_title || '').trim() || '未命名文章';
        const publisher = String(nextPayload.publisher || '').trim() || '未设置发布方';
        const topics = splitTopics(nextPayload.topics);
        return `
            <div class="ams-cover-preview">
                <img src="${esc(media.url)}" alt="cover preview" loading="lazy" onerror="this.src='https://www.gasgx.com/news/advertisement/zhanwei.jpg'">
                <div class="ams-cover-preview-body">
                    <strong>${esc(title)}</strong>
                    <span>${esc(publisher)}</span>
                    <em>${topics.length ? `话题：${esc(topics.slice(0, 3).join(' / '))}` : '未设置话题'}</em>
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

        if (titleMirror) titleMirror.textContent = nextPayload.main_title.trim() || '未命名文章';
        if (saveStateChip) {
            saveStateChip.textContent = state.editor.dirty ? '未保存变更' : '草稿已同步';
            saveStateChip.classList.toggle('is-warning', state.editor.dirty);
            saveStateChip.classList.toggle('is-ok', !state.editor.dirty);
        }
        if (heroNoteNode && !state.editor.dirty && !state.editor.draftRestored) {
            heroNoteNode.textContent = '本页会在当前浏览器会话内暂存草稿，并在离开前提醒未保存内容。';
        }
        if (statusPillNode) statusPillNode.innerHTML = pill(nextPayload.status || 'draft');
        if (metricsNode) {
            metricsNode.innerHTML = `
                ${renderEditorMetricCard('正文字符', nextMetrics.chars || 0, '去空格统计')}
                ${renderEditorMetricCard('估算阅读', nextMetrics.readMinutes ? `${nextMetrics.readMinutes} 分钟` : '0 分钟', '按中英混排估算')}
                ${renderEditorMetricCard('结构标题', nextMetrics.headings.length, '最多展示前 8 个')}
                ${renderEditorMetricCard('话题数量', nextMetrics.topics.length, '用于前台聚合')}
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
        openExternalUrl(currentPageInput?.value || '', '当前页面链接尚未生成。');
    });

    copyCurrentPageBtn?.addEventListener('click', async () => {
        await withButtonBusy(copyCurrentPageBtn, '复制中...', async () => {
            await copyText(currentPageInput?.value || '', currentPageInput, '当前页面链接已复制。', '复制失败，请手动复制。');
        });
    });

    openSourceBtn?.addEventListener('click', () => {
        openExternalUrl(document.getElementById('ed-link')?.value || '', '请先填写原文链接。');
    });

    copySourceBtn?.addEventListener('click', async () => {
        const linkInput = document.getElementById('ed-link');
        await withButtonBusy(copySourceBtn, '复制中...', async () => {
            await copyText(linkInput?.value || '', linkInput, '原文链接已复制。', '请先填写原文链接。');
        });
    });

    document.getElementById('ed-set-now')?.addEventListener('click', () => {
        if (!timeInput) return;
        timeInput.value = new Date().toISOString();
        timeInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    document.getElementById('ed-copy-time')?.addEventListener('click', async (event) => {
        await withButtonBusy(event.currentTarget, '复制中...', async () => {
            await copyText(timeInput?.value || '', timeInput, '发布时间已复制。', '请先填写发布时间。');
        });
    });

    document.querySelectorAll('[data-md-action]').forEach((button) => {
        button.addEventListener('click', () => {
            const action = button.dataset.mdAction;
            if (action === 'h2') insertMarkdownSnippet(contentInput, '## ', '', '二级标题');
            if (action === 'h3') insertMarkdownSnippet(contentInput, '### ', '', '三级标题');
            if (action === 'list') insertMarkdownSnippet(contentInput, '- ', '\n- ', '条目');
            if (action === 'quote') insertMarkdownSnippet(contentInput, '> ', '', '引用内容');
            if (action === 'link') insertMarkdownSnippet(contentInput, '[', '](https://)', '链接标题');
            if (action === 'code') insertMarkdownSnippet(contentInput, '```text\n', '\n```', '代码或配置');
            if (action === 'image') insertMarkdownSnippet(contentInput, '![图片说明](', ')', 'https://example.com/image.jpg');
        });
    });

    document.getElementById('ed-sync-html')?.addEventListener('click', () => {
        if (!htmlInput) return;
        htmlInput.value = markdownToHtml(contentInput?.value || '');
        htmlInput.dispatchEvent(new Event('input', { bubbles: true }));
        showToast('已由 Markdown 生成 HTML 源码。');
    });

    document.getElementById('ed-copy-html')?.addEventListener('click', async (event) => {
        await withButtonBusy(event.currentTarget, '复制中...', async () => {
            await copyText(htmlInput?.value || '', htmlInput, 'HTML 源码已复制。', '当前没有可复制的 HTML 源码。');
        });
    });

    const save = async (statusOverride = null, triggerBtn = null) => {
        const payloadForSave = ensureEditorHtmlPayload(readPayload());
        if (statusOverride) payloadForSave.status = statusOverride;
        if (!payloadForSave.main_title.trim()) {
            showToast('标题不能为空。', true);
            titleInput?.focus();
            return;
        }
        const saveMetrics = buildEditorMetrics(payloadForSave);
        const saveChecklist = buildEditorChecklist(payloadForSave, saveMetrics);
        const missingRequired = saveChecklist.filter((item) => item.required && !item.ready).map((item) => item.name);
        if (payloadForSave.status === 'published' && missingRequired.length) {
            const confirmed = window.confirm(`当前仍缺少：${missingRequired.join('、')}。确认继续发布吗？`);
            if (!confirmed) return;
        }

        await withButtonBusy(triggerBtn, statusOverride === 'published' ? '发布中...' : '保存中...', async () => {
            try {
                let savedRow = null;
                if (state.editor.mode === 'edit' && state.editor.id) {
                    savedRow = await updateArticle(state.editor.id, payloadForSave, state.user?.id || null);
                    showToast(payloadForSave.status === 'published' ? '文章已更新并发布。' : '文章已更新。');
                } else {
                    savedRow = await createArticle(payloadForSave, state.user?.id || null);
                    showToast(payloadForSave.status === 'published' ? '文章已创建并发布。' : '文章已创建。');
                }
                clearStoredEditorDraft();
                state.editor = createEditorState('edit', savedRow?.id || state.editor.id, savedRow || payloadForSave);
                invalidateArticlesCache();
                await renderPage();
            } catch (error) {
                showToast(error.message || '保存失败。', true);
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
    setPageHeader('标签管理', '管理 feeder_form_options（分类/发布方/标签等下拉选项）。');
    const rows = await getCachedTagOptions(forceRefresh);
    state.cache.tags = rows;
    const grouped = TAG_SECTIONS.reduce((acc, section) => ({ ...acc, [section]: [] }), {});
    const sectionLabels = {
        category: '分类',
        publisher: '发布方',
        tag: '主标签',
        secondary_tag: '二级标签',
    };
    rows.forEach((row) => {
        if (grouped[row.section]) grouped[row.section].push(row);
    });

    setContent(`
        <div class="ams-split">
            <section class="ams-card">
                <h3>新增 / 更新选项</h3>
                <form id="tag-form" class="ams-form" style="margin-top:10px">
                    <div class="ams-field"><label>分组</label><select id="tg-section" class="ams-select">${TAG_SECTIONS.map((section) => `<option value="${section}">${sectionLabels[section] || section}</option>`).join('')}</select></div>
                    <div class="ams-field"><label>选项ID</label><input id="tg-option-id" class="ams-input" placeholder="Hardware"></div>
                    <div class="ams-field"><label>英文名</label><input id="tg-label-en" class="ams-input" placeholder="Hardware"></div>
                    <div class="ams-field"><label>中文名</label><input id="tg-label-zh" class="ams-input" placeholder="硬件"></div>
                    <div class="ams-field"><label>排序值</label><input id="tg-sort-order" class="ams-input" type="number" value="100"></div>
                    <button class="ams-btn ams-btn-primary" type="submit">保存选项</button>
                </form>
            </section>
            <section class="ams-card"><h3>说明</h3><p class="ams-kpi-sub">选项ID建议保持稳定。禁用用于下线旧选项，删除为永久操作。</p></section>
        </div>
        <div class="ams-stack" style="margin-top:12px">
            ${TAG_SECTIONS.map((section) => {
                const items = grouped[section] || [];
                return `<div class="ams-card"><h3>${sectionLabels[section] || section}</h3><div class="ams-table-wrap" style="margin-top:10px"><table class="ams-table" style="min-width:760px"><thead><tr><th>ID</th><th>选项ID</th><th>英文名</th><th>中文名</th><th>排序</th><th>启用</th><th>操作</th></tr></thead><tbody>${items.length ? items.map((item) => `<tr><td><code>${item.id}</code></td><td>${esc(item.option_id || '--')}</td><td>${esc(item.label_en || '--')}</td><td>${esc(item.label_zh || '--')}</td><td>${esc(String(item.sort_order ?? '--'))}</td><td>${item.is_active ? '是' : '否'}</td><td><div class="ams-row-actions"><button class="ams-btn ams-btn-muted" data-tag-action="toggle" data-id="${item.id}" data-active="${item.is_active ? 1 : 0}">${item.is_active ? '禁用' : '启用'}</button><button class="ams-btn ams-btn-muted" data-tag-action="rename" data-id="${item.id}" data-label="${esc(item.label_en || '')}">改名</button><button class="ams-btn ams-btn-danger" data-tag-action="delete" data-id="${item.id}">删除</button></div></td></tr>`).join('') : '<tr><td colspan="7"><div class="ams-empty">暂无选项。</div></td></tr>'}</tbody></table></div></div>`;
            }).join('')}
        </div>
    `);

    document.getElementById('tag-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitButton = event.submitter || event.currentTarget?.querySelector('button[type="submit"]');
        await withButtonBusy(submitButton, '保存中...', async () => {
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
                showToast('选项已保存。');
                void renderPage();
            } catch (error) {
                showToast(error.message || '保存失败。', true);
            }
        });
    });

    document.querySelectorAll('[data-tag-action="toggle"]').forEach((button) => {
        button.addEventListener('click', async () => {
            await withButtonBusy(button, '处理中...', async () => {
                try {
                    const id = Number(button.dataset.id);
                    const active = button.dataset.active === '1';
                    await updateTagOptionById(id, { is_active: !active });
                    invalidateTagOptionsCache();
                    showToast('选项状态已更新。');
                    void renderPage();
                } catch (error) {
                    showToast(error.message || '更新失败。', true);
                }
            });
        });
    });

    document.querySelectorAll('[data-tag-action="rename"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = Number(button.dataset.id);
            const current = button.dataset.label || '';
            const next = window.prompt('请输入新的英文名：', current);
            if (next === null) return;
            await withButtonBusy(button, '处理中...', async () => {
                try {
                    await updateTagOptionById(id, { label_en: next });
                    invalidateTagOptionsCache();
                    showToast('选项已改名。');
                    void renderPage();
                } catch (error) {
                    showToast(error.message || '改名失败。', true);
                }
            });
        });
    });

    document.querySelectorAll('[data-tag-action="delete"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = Number(button.dataset.id);
            if (!window.confirm(`确认删除选项 #${id} 吗？`)) return;
            await withButtonBusy(button, '删除中...', async () => {
                try {
                    await deleteTagOptionById(id);
                    invalidateTagOptionsCache();
                    showToast('选项已删除。');
                    void renderPage();
                } catch (error) {
                    showToast(error.message || '删除失败。', true);
                }
            });
        });
    });
}
async function renderFeatured(forceRefresh = false) {
    setPageHeader('首页推荐位管理', '首页大位与广告位完全独立：分别调整、分别保存。');

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
        if (!item) return `<div class="ams-empty">首页位 ${index + 1} 未设置。请从下方候选池添加。</div>`;
        const previewUrl = resolveArticlePageUrl(item, item.id);
        return `
            <div class="ams-list-item ams-feature-row">
                <div class="ams-feature-main">
                    <span class="ams-rank">${index + 1}</span>
                    ${renderArticleMediaThumb(item, 'ams-feature-thumb')}
                    <div class="ams-feature-text">
                        <strong>${esc(item.main_title || '未命名')}</strong>
                        <div class="ams-footnote">#${item.id} · ${esc(item.tag || '--')} · 首页位${index + 1}</div>
                    </div>
                </div>
                <div class="ams-feature-actions ams-feature-actions-4">
                    ${previewUrl ? `<a class="ams-btn ams-btn-muted" href="${esc(previewUrl)}" target="_blank" rel="noopener noreferrer">预览</a>` : ''}
                    <button class="ams-btn ams-btn-muted" data-hero-action="up" data-id="${item.id}">上移</button>
                    <button class="ams-btn ams-btn-muted" data-hero-action="down" data-id="${item.id}">下移</button>
                    <button class="ams-btn ams-btn-danger" data-hero-action="remove" data-id="${item.id}">移除</button>
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
                        <strong>${esc(item.main_title || '未命名')}</strong>
                        <div class="ams-footnote">#${item.id} · ${esc(item.tag || '--')} · 广告位${index + 1}</div>
                    </div>
                </div>
                <div class="ams-feature-actions ams-feature-actions-4">
                    ${previewUrl ? `<a class="ams-btn ams-btn-muted" href="${esc(previewUrl)}" target="_blank" rel="noopener noreferrer">预览</a>` : ''}
                    <button class="ams-btn ams-btn-muted" data-ft-action="up" data-id="${item.id}">上移</button>
                    <button class="ams-btn ams-btn-muted" data-ft-action="down" data-id="${item.id}">下移</button>
                    <button class="ams-btn ams-btn-danger" data-ft-action="remove" data-id="${item.id}">移除</button>
                </div>
            </div>
        `;
    };

    setContent(`
        <section class="ams-card" style="margin-bottom:12px">
            <h3>操作说明（独立控制）</h3>
            <div class="ams-footnote" style="margin-top:8px;line-height:1.6">
                1）首页3个大位只控制 <code>homepage_mark 1/2/3</code>。<br>
                2）广告位只控制 <code>featured_rank 1..N</code>。<br>
                3）两个区域互不影响，分别保存。
            </div>
        </section>
        <div class="ams-split">
            <section class="ams-card">
                <div class="ams-feature-header-row">
                    <div>
                        <h3>① 首页3个大推荐位（固定位置）</h3>
                        <div class="ams-footnote">位置说明：1=左侧大图，2=右上，3=右下。</div>
                    </div>
                    <button id="hero-publish" class="ams-btn ams-btn-primary" type="button">保存首页3大位</button>
                </div>
                <div class="ams-list" style="margin-top:10px">
                    ${heroSlots.map((item, index) => renderHeroSlot(item, index)).join('')}
                </div>
            </section>
            <section class="ams-card">
                <div class="ams-feature-header-row">
                    <div>
                        <h3>② 广告推荐位列表</h3>
                        <div class="ams-footnote">广告位数量与排序独立控制。</div>
                    </div>
                </div>
                <div class="ams-toolbar" style="grid-template-columns:180px 1fr;">
                    <div class="ams-field"><label>广告位数量（N）</label><input id="ft-limit" class="ams-input" type="number" min="1" max="30" value="${state.featured.limit}"></div>
                    <div class="ams-toolbar-actions">
                        <button id="ft-apply" class="ams-btn ams-btn-muted" type="button">应用数量N</button>
                        <button id="ft-publish" class="ams-btn ams-btn-primary" type="button">保存广告位</button>
                    </div>
                </div>
                <div class="ams-list" style="margin-top:10px">
                    ${featuredCards.length ? featuredCards.map((item, index) => renderAdRow(item, index)).join('') : '<div class="ams-empty">还没设置广告推荐位，请到下方候选池点击“加入广告位”。</div>'}
                </div>
            </section>
        </div>
        <section class="ams-card" style="margin-top:12px">
            <h3>③ 已发布文章候选池（含缩略图与预览）</h3>
            <div id="featured-pool-list" class="ams-list" style="margin-top:10px;max-height:520px;overflow:auto;">
                ${
                    poolRows.length
                        ? poolRows
                              .map((item) => {
                                  const previewUrl = resolveArticlePageUrl(item, item.id);
                                  return `<div class="ams-list-item ams-pool-row">
                                    <div class="ams-feature-main">
                                        ${renderArticleMediaThumb(item, 'ams-feature-thumb')}
                                        <div class="ams-feature-text"><strong>${esc(item.main_title || '未命名')}</strong><div class="ams-footnote">#${item.id} · ${esc(item.tag || '--')} · ${fmtDate(item.time)}</div></div>
                                    </div>
                                    <div class="ams-feature-actions ams-feature-actions-4">
                                        ${previewUrl ? `<a class="ams-btn ams-btn-muted" href="${esc(previewUrl)}" target="_blank" rel="noopener noreferrer">预览</a>` : ''}
                                        <button class="ams-btn ${state.featured.heroIds.includes(item.id) ? 'ams-btn-danger' : 'ams-btn-muted'}" data-hero-action="toggle" data-id="${item.id}">${state.featured.heroIds.includes(item.id) ? '移出首页大位' : '加入首页大位'}</button>
                                        <button class="ams-btn ${state.featured.ids.includes(item.id) ? 'ams-btn-danger' : 'ams-btn-muted'}" data-ft-action="toggle" data-id="${item.id}">${state.featured.ids.includes(item.id) ? '移出广告位' : '加入广告位'}</button>
                                    </div>
                                </div>`;
                              })
                              .join('')
                        : '<div class="ams-empty">暂无已发布文章。</div>'
                }
            </div>
        </section>
        <div class="ams-footnote">当前状态：首页大位 ${heroCards.length}/${HOMEPAGE_MARK_LIMIT}，广告位 ${featuredCards.length}/${state.featured.limit}。</div>
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
        showToast(`广告推荐位数量已设置为 N=${state.featured.limit}（点击保存后生效）。`);
        rerenderFeatured();
    });

    document.getElementById('hero-publish')?.addEventListener('click', async (event) => {
        await withButtonBusy(event.currentTarget, '保存中...', async () => {
            try {
                await publishHeroMarks(state.featured.heroIds, state.user?.id || null);
                showToast('首页3个大推荐位已保存。');
                rerenderFeatured();
            } catch (error) {
                showToast(error.message || '首页位保存失败。', true);
            }
        });
    });

    document.getElementById('ft-publish')?.addEventListener('click', async (event) => {
        await withButtonBusy(event.currentTarget, '保存中...', async () => {
            try {
                await publishFeaturedRanks(state.featured.ids, state.featured.limit, state.user?.id || null);
                showToast('广告推荐位列表已保存。');
                rerenderFeatured();
            } catch (error) {
                showToast(error.message || '广告位保存失败。', true);
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
                else showToast(`首页大推荐位最多 ${HOMEPAGE_MARK_LIMIT} 条。`, true);
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
                else showToast(`广告推荐位已满（N=${state.featured.limit}）。`, true);
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
                <span>展示</span>
            </label>
            <input class="ams-input" data-social-href="${esc(item.id)}" value="${esc(item.href)}" placeholder="${esc(item.defaultHref)}">
            <button class="ams-btn ams-btn-primary" type="button" data-social-save="${esc(item.id)}">保存</button>
        </div>
    `;
}

async function renderSiteSettings(forceRefresh = false) {
    setPageHeader('站点设置', '统一管理 footer 联系方式和社交按钮。');
    const settings = !forceRefresh && state.cache.siteSettings ? state.cache.siteSettings : await fetchFooterSocialSettings();
    state.siteSettings.footerSocial = settings;
    state.cache.siteSettings = settings;

    setContent(`
        <section class="ams-card" style="margin-bottom:12px">
            <div class="ams-section-head">
                <div>
                    <h3>Footer 联系方式</h3>
                    <p>控制 footer 右侧 Contact Us 下方显示文本和跳转链接。</p>
                </div>
            </div>
            <div class="ams-settings-stack">
                <div class="ams-social-row">
                    <div class="ams-social-meta">
                        <div class="ams-social-icon"><i class="fa-brands fa-weixin"></i></div>
                        <div>
                            <strong>Contact Us</strong>
                            <div class="ams-footnote">News footer 联系方式入口</div>
                        </div>
                    </div>
                    <div class="ams-field" style="gap:4px">
                        <label style="font-size:10px">显示文本</label>
                        <input class="ams-input" id="am-footer-contact-label" value="${esc(settings.contact?.label || 'www_gasgx_com')}" placeholder="www_gasgx_com">
                    </div>
                    <div class="ams-field" style="gap:4px">
                        <label style="font-size:10px">跳转链接</label>
                        <input class="ams-input" id="am-footer-contact-href" value="${esc(settings.contact?.href || '/about/contact')}" placeholder="/about/contact">
                    </div>
                    <button class="ams-btn ams-btn-primary" type="button" id="am-footer-contact-save">保存联系方式</button>
                </div>
            </div>
        </section>
        <section class="ams-card">
            <div class="ams-section-head">
                <div>
                    <h3>Footer 社交按钮</h3>
                    <p>控制 News 页底部社交按钮是否展示，以及每个按钮跳转链接。</p>
                </div>
            </div>
            <div class="ams-settings-stack">
                <div class="ams-social-row ams-social-row-group">
                    <div>
                        <strong>社交按钮总开关</strong>
                        <div class="ams-footnote">关闭后，footer 整组社交按钮隐藏。</div>
                    </div>
                    <label class="ams-social-toggle">
                        <input type="checkbox" id="am-social-group-visible" ${settings.groupVisible ? 'checked' : ''}>
                        <span>${settings.groupVisible ? '已开启' : '已关闭'}</span>
                    </label>
                    <div></div>
                    <button class="ams-btn ams-btn-primary" type="button" id="am-social-group-save">保存总开关</button>
                </div>
                <div class="ams-settings-list">
                    ${settings.items.map((item) => renderFooterSocialRow(item)).join('')}
                </div>
            </div>
        </section>
        <div class="ams-footnote">说明：留空社交链接时，前台仍会使用系统默认链接；关闭展示时，该按钮不会出现在 footer。</div>
    `);

    document.getElementById('am-footer-contact-save')?.addEventListener('click', async (event) => {
        const label = document.getElementById('am-footer-contact-label')?.value || '';
        const href = document.getElementById('am-footer-contact-href')?.value || '';
        await withButtonBusy(event.currentTarget, '保存中...', async () => {
            try {
                await upsertFooterContactSettings({ label, href });
                settings.contact = { ...(settings.contact || {}), label, href };
                state.cache.siteSettings = settings;
                showToast('Footer 联系方式已更新。');
            } catch (error) {
                showToast(error.message || '保存联系方式失败。', true);
            }
        });
    });

    document.getElementById('am-social-group-save')?.addEventListener('click', async (event) => {
        const checkbox = document.getElementById('am-social-group-visible');
        const nextVisible = Boolean(checkbox?.checked);
        await withButtonBusy(event.currentTarget, '保存中...', async () => {
            try {
                await updateFooterSocialGroupVisible(nextVisible);
                settings.groupVisible = nextVisible;
                state.cache.siteSettings = settings;
                showToast(`社交按钮总开关已${nextVisible ? '开启' : '关闭'}。`);
            } catch (error) {
                showToast(error.message || '保存社交按钮总开关失败。', true);
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

            await withButtonBusy(button, '保存中...', async () => {
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
                    showToast(`${item?.label || id} 已更新。`);
                } catch (error) {
                    showToast(error.message || '保存社交按钮失败。', true);
                }
            });
        });
    });
}

async function renderQueue(forceRefresh = false) {
    setPageHeader('采集队列', '查看 scrape_queue 的采集状态，并支持手动更改状态。');
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
        `<option value="all" ${selectedStatus === 'all' ? 'selected' : ''}>全部状态</option>`,
        ...statusValues.map((status) => `<option value="${esc(status)}" ${selectedStatus === status ? 'selected' : ''}>${esc(queueStatusLabel(status))}</option>`),
    ].join('');

    setContent(`
        <div class="ams-toolbar-card">
        <div class="ams-toolbar ams-queue-toolbar">
            <div class="ams-field"><label>状态</label><select id="qr-status" class="ams-select">${filterOptions}</select></div>
            <div class="ams-field"><label>每页数量</label><select id="qr-page-size" class="ams-select">${pageSizeOptions(state.queue.pageSize || 20)}</select></div>
            <div class="ams-field"><label>页码</label><input id="qr-page" class="ams-input" type="number" min="1" value="${state.queue.page}"></div>
            <div class="ams-toolbar-actions"><button id="qr-apply" class="ams-btn ams-btn-primary" type="button">刷新</button></div>
        </div>
        </div>
        ${renderSummaryChips([
            { label: '队列总数', value: `${result.count} 条` },
            { label: '当前页', value: `${state.queue.page} / ${totalPages}` },
            { label: '每页数量', value: `${state.queue.pageSize}` },
            { label: '筛选状态', value: selectedStatus === 'all' ? '全部' : queueStatusLabel(selectedStatus) },
        ])}
        <div class="ams-bulk-toolbar ams-bulk-toolbar-queue">
            <div class="ams-bulk-meta">已选 <strong id="qr-selected-count">${selectedCount}</strong> 条队列</div>
            <div class="ams-bulk-actions">
                <button class="ams-btn ams-btn-muted" id="qr-select-visible" type="button">本页全选</button>
                <button class="ams-btn ams-btn-muted" id="qr-clear-selection" type="button" ${selectedCount ? '' : 'disabled'}>清空选择</button>
                <select id="qr-bulk-status" class="ams-select">
                    <option value="">批量审核状态</option>
                    ${statusValues.map((status) => `<option value="${esc(status)}">${esc(queueStatusLabel(status))}</option>`).join('')}
                </select>
                <button class="ams-btn ams-btn-primary" id="qr-bulk-apply" type="button" ${selectedCount ? '' : 'disabled'}>批量审核</button>
            </div>
        </div>
        <div class="ams-table-wrap"><table class="ams-table ams-queue-table"><thead><tr><th class="ams-col-check"><input class="ams-check" type="checkbox" id="qr-select-all" ${allRowsSelected ? 'checked' : ''} aria-label="全选当前页队列"></th><th>ID</th><th>来源</th><th>分类</th><th>发布方</th><th>标签</th><th class="ams-col-status">状态</th><th class="ams-col-time">创建时间</th><th class="ams-col-actions">操作</th></tr></thead><tbody>${result.rows.length ? result.rows.map((item) => {
        const currentStatus = resolveQueueRowStatus(item, 'pending');
        const rowStatusValues = sortQueueStatuses([...statusValues, currentStatus]);
        const checked = state.selectedQueueIds.has(String(item.id)) ? 'checked' : '';
        const sourceLink = String(item.link || '').trim();
        const sourceMarkup = sourceLink
            ? `<a class="ams-queue-link" href="${esc(sourceLink)}" target="_blank" rel="noopener noreferrer">${esc(sourceLink)}</a>`
            : '<span class="ams-footnote">--</span>';
        return `<tr data-queue-row="${item.id}"><td class="ams-col-check"><input class="ams-check" type="checkbox" data-queue-select="1" data-id="${item.id}" ${checked} aria-label="选择队列 ${item.id}"></td><td><code>${item.id}</code></td><td class="ams-queue-source"><strong>${esc(item.title || item.main_title || '未命名')}</strong><div class="ams-footnote">${sourceMarkup}</div></td><td>${esc(item.category || '--')}</td><td>${esc(item.publisher || '--')}</td><td>${esc(item.tag_choice || item.tag || '--')} / ${esc(item.secondary_tag || '--')}</td><td class="ams-col-status" data-queue-status-pill="${item.id}">${queueStatusPill(currentStatus)}</td><td class="ams-col-time">${fmtDate(item.created_at)}</td><td class="ams-col-actions"><div class="ams-row-actions ams-row-actions-stacked ams-queue-actions"><div class="ams-queue-inline ams-queue-inline-status"><select class="ams-select ams-queue-status-select" data-queue-status-select="1" data-id="${item.id}">${rowStatusValues.map((status) => `<option value="${esc(status)}" ${status === currentStatus ? 'selected' : ''}>${esc(queueStatusLabel(status))}</option>`).join('')}</select></div></div></td></tr>`;
    }).join('') : '<tr><td colspan="9"><div class="ams-empty">暂无队列数据。</div></td></tr>'}</tbody></table></div>
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
            showToast('请先选择目标状态。', true);
            return;
        }
        if (!ids.length) {
            showToast('请先选择至少一条队列。', true);
            return;
        }

        let note = null;
        if (nextStatus === 'rejected') {
            const input = window.prompt('拒绝备注（可选）：', '');
            if (input === null) return;
            note = input;
        }

        await withButtonBusy(event.currentTarget, '批量处理中...', async () => {
            try {
                await Promise.all(ids.map((id) => updateQueueStatus(id, nextStatus, state.user?.id || null, note)));
                clearQueueSelection();
                invalidateQueueCache();
                showToast(`已把 ${ids.length} 条队列更新为 ${queueStatusLabel(nextStatus)}。`);
                await renderQueue(true);
            } catch (error) {
                showToast(error.message || '批量更新队列状态失败。', true);
            }
        });
    });

    document.querySelectorAll('[data-queue-status-select="1"]').forEach((selectNode) => {
        selectNode.dataset.prevValue = selectNode.value || '';
        selectNode.addEventListener('change', async () => {
            const id = Number(selectNode.dataset.id);
            const nextStatus = queueStatusKey(selectNode?.value, '');
            if (!nextStatus) {
                showToast('请选择状态。', true);
                return;
            }
            const previousStatus = queueStatusKey(selectNode.dataset.prevValue || '', '');
            if (nextStatus === previousStatus) return;

            let note = null;
            if (nextStatus === 'rejected') {
                const input = window.prompt('拒绝备注（可选）：', '');
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
                    showToast(`队列 #${id} 状态已更新为 ${queueStatusLabel(nextStatus)}。`);
                } catch (error) {
                    selectNode.value = previousStatus || '';
                    showToast(error.message || '状态更新失败。', true);
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
        return false;
    }
    state.adminAccess = await getAdminUserAccess(state.user, { forceRefresh });
    return state.adminAccess?.allowed === true;
}

async function renderPage() {
    if (!state.user || !(await refreshAdminAccess(false))) {
        state.authView = isPasswordRecoveryMode() ? 'reset' : 'login';
        renderLogin();
        return;
    }

    if (state.page === 'site-settings') {
        state.page = 'site-general';
    }

    clearPreviewBinding();
    renderShell();

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
        else setContent('<div class="ams-empty">未知页面。</div>');
    } catch (error) {
        console.error(error);
        setContent(`<div class="ams-empty">${esc(error.message || '页面渲染失败。')}</div>`);
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
        } else {
            state.authView = 'login';
            await renderPage();
        }

        onAuthStateChange(async (event, nextSession) => {
            state.session = nextSession;
            state.user = nextSession?.user || null;
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
            state.authView = 'login';
            await renderPage();
        });
    } catch (error) {
        console.error(error);
        state.authView = isPasswordRecoveryMode() ? 'reset' : 'login';
        renderLogin();
        showToast(error.message || '初始化失败。', true);
    }
}

boot();
