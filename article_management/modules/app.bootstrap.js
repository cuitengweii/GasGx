
import { getCurrentSession, getDisplayName, isAdminUser, onAuthStateChange, signInWithPassword, signOut } from './auth.module.js';
import {
    createArticle,
    createEmptyArticlePayload,
    fetchArticleById,
    fetchArticles,
    fetchDistinctCategories,
    fetchDistinctTags,
    hardDeleteArticle,
    restoreArticle,
    softDeleteArticle,
    updateArticle,
    updateArticleStatus,
} from './articles.module.js';
import { bindMarkdownPreview } from './editor.module.js';
import { deleteTagOptionById, fetchTagOptions, TAG_SECTIONS, updateTagOptionById, upsertTagOption } from './tags.module.js';
import * as featuredApi from './featured.module.js';
import {
    approveAndPublishQueueItem,
    buildArticlePayloadFromQueue,
    fetchQueueStatuses,
    fetchReviewQueue,
    rejectQueueItem,
    updateQueueStatus,
} from './review-queue.module.js';
import { client, DEFAULT_FEATURED_LIMIT } from './supabase.client.js';

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

const state = {
    session: null,
    user: null,
    page: 'dashboard',
    articles: { page: 1, pageSize: 20, search: '', status: 'all', tag: 'all', category: 'all' },
    recycle: { page: 1, pageSize: 20, search: '' },
    editor: { mode: 'create', id: null, payload: createEmptyArticlePayload() },
    featured: { limit: DEFAULT_FEATURED_LIMIT, ids: [], heroIds: [], poolScrollTop: 0 },
    queue: { page: 1, pageSize: 20, status: 'all' },
    cache: { articles: null },
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
}

function resolveArticlePageId(payload, editorId) {
    return payload?.app_id || payload?.api_id || editorId || '';
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
        archived: '已归档',
        pending: '待审核',
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
    return key || fallback;
}

function queueStatusLabel(value) {
    const key = queueStatusKey(value, '');
    const labels = {
        pending: '待审核',
        rejected: '已拒绝',
        published: '已发布',
        queued: '已入队',
        scraping: '采集中',
        processing: '处理中',
        fetched: '已采集',
        completed: '已完成',
        failed: '失败',
        success: '成功',
        error: '错误',
    };
    return labels[key] || String(value || '--');
}

function sortQueueStatuses(values = []) {
    const preferredOrder = ['pending', 'queued', 'processing', 'scraping', 'fetched', 'published', 'rejected', 'failed', 'success', 'error', 'completed'];
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

function renderLogin() {
    root.innerHTML = `
        <section class="ams-auth-shell">
            <div class="ams-auth-card">
                <h1 class="ams-logo">GasGx <span>AMS</span></h1>
                <p class="ams-subtitle">文章管理后台 · 仅管理员可访问</p>
                <form id="ams-login-form" class="ams-form">
                    <div class="ams-field">
                        <label>邮箱</label>
                        <input id="ams-login-email" class="ams-input" type="email" placeholder="cuitengwei@gasgx.com" required>
                    </div>
                    <div class="ams-field">
                        <label>密码</label>
                        <input id="ams-login-password" class="ams-input" type="password" placeholder="••••••••" required>
                    </div>
                    <button class="ams-btn ams-btn-primary" type="submit">登录</button>
                </form>
                <p class="ams-footnote">使用 Supabase Auth 登录，密码不写死在前端。</p>
            </div>
        </section>
    `;

    document.getElementById('ams-login-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('ams-login-email')?.value || '';
        const password = document.getElementById('ams-login-password')?.value || '';
        const submitButton = event.submitter || event.currentTarget?.querySelector('button[type="submit"]');
        await withButtonBusy(submitButton, '登录中...', async () => {
            try {
                await signInWithPassword(email, password);
                showToast('登录成功。');
            } catch (error) {
                showToast(error.message || '登录失败。', true);
            }
        });
    });
}

function navButton(id, label, icon) {
    const active = state.page === id ? 'active' : '';
    return `<button type="button" class="ams-nav-btn ${active}" data-page="${id}"><span><i class="fa-solid ${icon}"></i> ${label}</span><i class="fa-solid fa-angle-right"></i></button>`;
}

function renderShell() {
    const name = esc(getDisplayName(state.user));
    root.innerHTML = `
        <div class="ams-app">
            <aside class="ams-sidebar">
                <div class="ams-sidebar-head">
                    <h2 class="ams-sidebar-title">GasGx <span>AMS</span></h2>
                    <div class="ams-sidebar-meta">文章运营控制台</div>
                </div>
                <nav class="ams-nav">
                    ${navButton('dashboard', '总览', 'fa-chart-line')}
                    ${navButton('articles', '文章管理', 'fa-file-lines')}
                    ${navButton('editor', '新建文章', 'fa-pen-to-square')}
                    ${navButton('recycle', '回收站', 'fa-trash-can-arrow-up')}
                    ${navButton('featured', '首页推荐位', 'fa-ranking-star')}
                    ${navButton('queue', '采集队列', 'fa-list-check')}
                    ${navButton('tags', '标签管理', 'fa-tags')}
                </nav>
            </aside>
            <main class="ams-main">
                <header class="ams-header">
                    <div>
                        <h1 id="ams-page-title">文章管理后台</h1>
                        <p id="ams-page-sub">GasGx 新闻内容运营后台</p>
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
            state.page = btn.dataset.page || 'dashboard';
            if (state.page === 'editor' && state.editor.mode !== 'edit') {
                state.editor = { mode: 'create', id: null, payload: createEmptyArticlePayload() };
            }
            void renderPage();
        });
    });
}
async function renderDashboard() {
    setPageHeader('总览', '查看文章、推荐位和采集队列的整体状态。');

    const [active, recycled, heroSlots, featured, queue, sampleRows] = await Promise.all([
        fetchArticles({ page: 1, pageSize: 1 }),
        fetchArticles({ page: 1, pageSize: 1, includeDeleted: true }),
        fetchHeroSelection(),
        fetchFeaturedSelection(state.featured.limit),
        fetchReviewQueue({ page: 1, pageSize: 1, status: 'pending' }),
        fetchArticles({ page: 1, pageSize: 200, status: 'published' }),
    ]);
    const categoryStats = summarizeCategoryStats(sampleRows.rows, 10);

    setContent(`
        <div class="ams-grid">
            <article class="ams-card"><h3>在线文章</h3><div class="ams-kpi">${active.count}</div><div class="ams-kpi-sub">未进入回收站的文章数</div></article>
            <article class="ams-card"><h3>回收站</h3><div class="ams-kpi">${recycled.count}</div><div class="ams-kpi-sub">已软删除文章数</div></article>
            <article class="ams-card"><h3>首页大位</h3><div class="ams-kpi">${heroSlots.length}/${HOMEPAGE_MARK_LIMIT}</div><div class="ams-kpi-sub">homepage_mark 1/2/3 已配置数量</div></article>
            <article class="ams-card"><h3>广告推荐位</h3><div class="ams-kpi">${featured.length}/${state.featured.limit}</div><div class="ams-kpi-sub">featured_rank 已配置数量</div></article>
            <article class="ams-card"><h3>待处理采集</h3><div class="ams-kpi">${queue.count}</div><div class="ams-kpi-sub">scrape_queue pending 数量</div></article>
        </div>
        <section class="ams-card ams-category-card">
            <h3>分类分布（最近 200 条已发布文章）</h3>
            <div class="ams-category-grid">
                ${categoryStats.length ? categoryStats.map((item) => `<div class="ams-category-item"><span>${esc(item.name)}</span><strong>${item.count}</strong></div>`).join('') : '<div class="ams-empty">暂无分类数据。</div>'}
            </div>
        </section>
        <div class="ams-footnote">点击左侧菜单可进入对应功能页。</div>
    `);
}

function articleToolbar(filters, tags = [], categories = [], recycleMode = false) {
    return `
        <div class="ams-toolbar">
            <div class="ams-field"><label>搜索</label><input id="am-search" class="ams-input" value="${esc(filters.search || '')}" placeholder="标题 / 发布方 / 链接"></div>
            ${recycleMode ? '' : `<div class="ams-field"><label>状态</label><select id="am-status" class="ams-select"><option value="all" ${filters.status === 'all' ? 'selected' : ''}>全部</option><option value="draft" ${filters.status === 'draft' ? 'selected' : ''}>草稿</option><option value="published" ${filters.status === 'published' ? 'selected' : ''}>已发布</option><option value="archived" ${filters.status === 'archived' ? 'selected' : ''}>已归档</option></select></div>`}
            ${recycleMode ? '' : `<div class="ams-field"><label>标签</label><select id="am-tag" class="ams-select"><option value="all">全部</option>${tags.map((t) => `<option value="${esc(t)}" ${filters.tag === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></div>`}
            ${recycleMode ? '' : `<div class="ams-field"><label>分类</label><select id="am-category" class="ams-select"><option value="all">全部</option>${categories.map((item) => `<option value="${esc(item)}" ${filters.category === item ? 'selected' : ''}>${esc(item)}</option>`).join('')}</select></div>`}
            <div class="ams-field"><label>页码</label><input id="am-page" class="ams-input" type="number" min="1" value="${filters.page}"></div>
            <div class="ams-toolbar-actions"><button class="ams-btn ams-btn-primary" id="am-apply" type="button">查询</button>${recycleMode ? '' : '<button class="ams-btn ams-btn-muted" id="am-new" type="button">新建</button>'}</div>
        </div>
    `;
}

function articleRows(rows, recycleMode = false) {
    if (!rows.length) return '<tr><td colspan="9"><div class="ams-empty">暂无数据。</div></td></tr>';
    return rows
        .map((row) => {
            const previewUrl = resolveArticlePageUrl(row, row.id);
            const previewAction = previewUrl
                ? `<a class="ams-btn ams-btn-muted" href="${esc(previewUrl)}" target="_blank" rel="noopener noreferrer">预览</a>`
                : '';

            return `
        <tr>
            <td><code>${row.id}</code></td>
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
                            : `${previewAction}<button class="ams-btn ams-btn-muted" data-action="edit" data-id="${row.id}">编辑</button><button class="ams-btn ams-btn-warning" data-action="offline" data-id="${row.id}" ${row.status === 'archived' ? 'disabled' : ''}>${row.status === 'archived' ? '已下架' : '下架'}</button><button class="ams-btn ams-btn-danger" data-action="soft-delete" data-id="${row.id}">删除</button>`
                    }
                </div>
            </td>
        </tr>
    `;
        })
        .join('');
}

async function renderArticles() {
    setPageHeader('文章管理', '新建、编辑、查询、软删除文章。');
    const query = { ...state.articles };
    const cacheKey = articleCacheKey(query);
    let tags = [];
    let categories = [];
    let result = { rows: [], count: 0 };

    if (state.cache.articles?.key === cacheKey) {
        ({ tags, categories, result } = state.cache.articles);
    } else {
        [tags, categories, result] = await Promise.all([fetchDistinctTags(), fetchDistinctCategories(), fetchArticles(query)]);
        state.cache.articles = { key: cacheKey, tags, categories, result };
    }

    setContent(`
        ${articleToolbar(state.articles, tags, categories, false)}
        <div class="ams-table-wrap"><table class="ams-table"><thead><tr><th>ID</th><th>标题</th><th>发布方</th><th>主标签</th><th>二级标签</th><th class="ams-col-status">状态</th><th class="ams-col-featured">推荐位</th><th class="ams-col-time">时间</th><th class="ams-col-actions">操作</th></tr></thead><tbody>${articleRows(result.rows, false)}</tbody></table></div>
        <div class="ams-footnote">总数：${result.count}（仅统计未删除文章）。</div>
    `);

    document.getElementById('am-apply')?.addEventListener('click', () => {
        state.articles.search = document.getElementById('am-search')?.value || '';
        state.articles.status = document.getElementById('am-status')?.value || 'all';
        state.articles.tag = document.getElementById('am-tag')?.value || 'all';
        state.articles.category = document.getElementById('am-category')?.value || 'all';
        state.articles.page = Math.max(1, Number(document.getElementById('am-page')?.value || 1));
        invalidateArticlesCache();
        void renderPage();
    });

    document.getElementById('am-new')?.addEventListener('click', () => {
        state.page = 'editor';
        state.editor = { mode: 'create', id: null, payload: createEmptyArticlePayload() };
        void renderPage();
    });

    document.querySelectorAll('[data-action="edit"]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            await withButtonBusy(btn, '加载中...', async () => {
                try {
                    const id = Number(btn.dataset.id);
                    const row = await fetchArticleById(id);
                    state.editor = { mode: 'edit', id, payload: { ...createEmptyArticlePayload(), ...row } };
                    state.page = 'editor';
                    void renderPage();
                } catch (error) {
                    showToast(error.message || '加载文章失败。', true);
                }
            });
        });
    });

    document.querySelectorAll('[data-action="soft-delete"]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const id = Number(btn.dataset.id);
            if (!window.confirm(`确认把文章 ${id} 移入回收站吗？`)) return;
            await withButtonBusy(btn, '处理中...', async () => {
                try {
                    await softDeleteArticle(id, state.user?.id || null);
                    showToast('已移入回收站。');
                    invalidateArticlesCache();
                    void renderPage();
                } catch (error) {
                    showToast(error.message || '删除失败。', true);
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
                    void renderPage();
                } catch (error) {
                    showToast(error.message || '下架失败。', true);
                }
            });
        });
    });
}

async function renderRecycleBin() {
    setPageHeader('回收站', '恢复文章或执行永久删除。');
    const result = await fetchArticles({
        page: state.recycle.page,
        pageSize: state.recycle.pageSize,
        includeDeleted: true,
        search: state.recycle.search,
    });

    setContent(`
        ${articleToolbar(state.recycle, [], [], true)}
        <div class="ams-table-wrap"><table class="ams-table"><thead><tr><th>ID</th><th>标题</th><th>发布方</th><th>主标签</th><th>二级标签</th><th class="ams-col-status">状态</th><th class="ams-col-featured">推荐位</th><th class="ams-col-time">时间</th><th class="ams-col-actions">操作</th></tr></thead><tbody>${articleRows(result.rows, true)}</tbody></table></div>
        <div class="ams-footnote">注意：永久删除后不可恢复。</div>
    `);

    document.getElementById('am-apply')?.addEventListener('click', () => {
        state.recycle.search = document.getElementById('am-search')?.value || '';
        state.recycle.page = Math.max(1, Number(document.getElementById('am-page')?.value || 1));
        void renderPage();
    });

    document.querySelectorAll('[data-action="restore"]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            await withButtonBusy(btn, '恢复中...', async () => {
                try {
                    await restoreArticle(Number(btn.dataset.id), state.user?.id || null);
                    showToast('文章已恢复。');
                    invalidateArticlesCache();
                    void renderPage();
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
                    void renderPage();
                } catch (error) {
                    showToast(error.message || '永久删除失败。', true);
                }
            });
        });
    });
}
function optionsFor(values, selected) {
    return values
        .map((value) => `<option value="${esc(value)}" ${selected === value ? 'selected' : ''}>${esc(value)}</option>`)
        .join('');
}

async function renderEditor() {
    const mode = state.editor.mode === 'edit' ? `编辑文章 #${state.editor.id}` : '新建文章';
    setPageHeader(mode, '支持 Markdown 编辑、实时预览与发布。');

    const optionRows = await fetchTagOptions();
    const optionMap = TAG_SECTIONS.reduce((acc, section) => ({ ...acc, [section]: [] }), {});
    optionRows.forEach((item) => {
        if (!item || item.is_active === false || !optionMap[item.section]) return;
        optionMap[item.section].push(item.option_id || item.label_en);
    });

    const payload = { ...createEmptyArticlePayload(), ...(state.editor.payload || {}) };
    const currentPageUrl = resolveArticlePageUrl(payload, state.editor.id);
    const hasCurrentPageUrl = Boolean(currentPageUrl);

    setContent(`
        <form id="editor-form" class="ams-stack">
            <div class="ams-split">
                <div class="ams-stack">
                    <div class="ams-editor-meta-grid">
                        <div class="ams-field ams-field-span-2"><label>标题</label><input id="ed-main_title" class="ams-input" value="${esc(payload.main_title)}" required></div>
                        <div class="ams-field ams-field-span-2"><label>副标题</label><textarea id="ed-subheading" class="ams-textarea">${esc(payload.subheading)}</textarea></div>
                        <div class="ams-field"><label>发布方</label><select id="ed-publisher" class="ams-select"><option value="">请选择发布方</option>${optionsFor(optionMap.publisher, payload.publisher)}</select></div>
                        <div class="ams-field"><label>分类</label><select id="ed-type" class="ams-select"><option value="">请选择分类</option>${optionsFor(optionMap.category, payload.type)}</select></div>
                        <div class="ams-field"><label>主标签</label><select id="ed-tag" class="ams-select"><option value="">请选择主标签</option>${optionsFor(optionMap.tag, payload.tag)}</select></div>
                        <div class="ams-field"><label>二级标签</label><select id="ed-secondary_tag" class="ams-select"><option value="">请选择二级标签</option>${optionsFor(optionMap.secondary_tag, payload.secondary_tag)}</select></div>
                        <div class="ams-field"><label>状态</label><select id="ed-status" class="ams-select"><option value="draft" ${payload.status === 'draft' ? 'selected' : ''}>草稿</option><option value="published" ${payload.status === 'published' ? 'selected' : ''}>已发布</option><option value="archived" ${payload.status === 'archived' ? 'selected' : ''}>已归档</option></select></div>
                        <div class="ams-field"><label>发布时间（ISO）</label><input id="ed-time" class="ams-input" value="${esc(payload.time || '')}"></div>
                        <div class="ams-field ams-field-span-2"><label>原文链接</label><input id="ed-link" class="ams-input" value="${esc(payload.link)}" placeholder="https://..."></div>
                        <div class="ams-field ams-field-span-2">
                        <label>当前页面链接</label>
                        <input id="ed-current-page-url" class="ams-input" value="${esc(currentPageUrl)}" placeholder="文章创建后才会生成链接" readonly>
                        <div class="ams-inline-actions">
                            <button type="button" class="ams-btn ams-btn-muted" id="ed-open-current-page" ${hasCurrentPageUrl ? '' : 'disabled'}>打开页面</button>
                            <button type="button" class="ams-btn ams-btn-muted" id="ed-copy-current-page" ${hasCurrentPageUrl ? '' : 'disabled'}>复制链接</button>
                        </div>
                        </div>
                        <div class="ams-field"><label>封面图链接</label><input id="ed-cover_image" class="ams-input" value="${esc(payload.cover_image)}"></div>
                        <div class="ams-field"><label>作者头像链接</label><input id="ed-author_avatar" class="ams-input" value="${esc(payload.author_avatar)}"></div>
                        <div class="ams-field ams-field-span-2"><label>话题（逗号分隔）</label><input id="ed-topics" class="ams-input" value="${esc(payload.topics)}"></div>
                    </div>
                </div>
                <div class="ams-stack">
                    <div class="ams-field"><label>Markdown 正文</label><textarea id="ed-content_markdown" class="ams-textarea" style="min-height:320px" placeholder="# 标题\n\n正文内容...">${esc(payload.content_markdown || '')}</textarea></div>
                    <div><label style="font-size:11px;color:#9f9f9f;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">实时预览</label><div id="ed-preview" class="ams-preview"></div></div>
                </div>
            </div>
            <div class="ams-row-actions ams-editor-submit-row">
                <button type="submit" class="ams-btn ams-btn-primary">${state.editor.mode === 'edit' ? '保存修改' : '创建文章'}</button>
                <button type="button" class="ams-btn ams-btn-muted" id="ed-save-draft">保存草稿</button>
                <button type="button" class="ams-btn ams-btn-muted" id="ed-publish">立即发布</button>
                <button type="button" class="ams-btn ams-btn-muted" id="ed-cancel">返回列表</button>
            </div>
        </form>
    `);

    clearPreviewBinding();
    state.previewUnbind = bindMarkdownPreview(document.getElementById('ed-content_markdown'), document.getElementById('ed-preview'));

    const readPayload = () => ({
        main_title: document.getElementById('ed-main_title')?.value || '',
        subheading: document.getElementById('ed-subheading')?.value || '',
        content_markdown: document.getElementById('ed-content_markdown')?.value || '',
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

    const openCurrentPageBtn = document.getElementById('ed-open-current-page');
    const copyCurrentPageBtn = document.getElementById('ed-copy-current-page');
    const currentPageInput = document.getElementById('ed-current-page-url');

    openCurrentPageBtn?.addEventListener('click', () => {
        const url = String(currentPageInput?.value || '').trim();
        if (!url) {
            showToast('当前页面链接尚未生成。', true);
            return;
        }
        window.open(url, '_blank', 'noopener,noreferrer');
    });

    copyCurrentPageBtn?.addEventListener('click', async () => {
        const url = String(currentPageInput?.value || '').trim();
        if (!url) {
            showToast('当前页面链接尚未生成。', true);
            return;
        }
        await withButtonBusy(copyCurrentPageBtn, '复制中...', async () => {
            try {
                if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                    await navigator.clipboard.writeText(url);
                } else {
                    currentPageInput?.select();
                    document.execCommand('copy');
                }
                showToast('当前页面链接已复制。');
            } catch (_error) {
                showToast('复制失败，请手动复制。', true);
            }
        });
    });

    const save = async (statusOverride = null, triggerBtn = null) => {
        const payloadForSave = readPayload();
        if (statusOverride) payloadForSave.status = statusOverride;
        if (!payloadForSave.main_title.trim()) {
            showToast('标题不能为空。', true);
            return;
        }
        await withButtonBusy(triggerBtn, statusOverride === 'published' ? '发布中...' : '保存中...', async () => {
            try {
                if (state.editor.mode === 'edit' && state.editor.id) {
                    await updateArticle(state.editor.id, payloadForSave, state.user?.id || null);
                    showToast('文章已更新。');
                } else {
                    const created = await createArticle(payloadForSave, state.user?.id || null);
                    state.editor = { mode: 'edit', id: created.id, payload: { ...created } };
                    showToast('文章已创建。');
                }
                invalidateArticlesCache();
                state.page = 'articles';
                void renderPage();
            } catch (error) {
                showToast(error.message || '保存失败。', true);
            }
        });
    };

    document.getElementById('editor-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitBtn = event.submitter || event.currentTarget?.querySelector('button[type="submit"]');
        await save(null, submitBtn);
    });
    document.getElementById('ed-save-draft')?.addEventListener('click', async (event) => save('draft', event.currentTarget));
    document.getElementById('ed-publish')?.addEventListener('click', async (event) => save('published', event.currentTarget));
    document.getElementById('ed-cancel')?.addEventListener('click', () => {
        state.page = 'articles';
        void renderPage();
    });
}

async function renderTags() {
    setPageHeader('标签管理', '管理 feeder_form_options（分类/发布方/标签等下拉选项）。');
    const rows = await fetchTagOptions();
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
                    showToast('选项已删除。');
                    void renderPage();
                } catch (error) {
                    showToast(error.message || '删除失败。', true);
                }
            });
        });
    });
}
async function renderFeatured() {
    setPageHeader('首页推荐位管理', '首页大位与广告位完全独立：分别调整、分别保存。');

    const [poolRows, heroRows, featuredRows] = await Promise.all([fetchFeaturedPool(120), fetchHeroSelection(), fetchFeaturedSelection(state.featured.limit)]);
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

async function renderQueue() {
    setPageHeader('采集队列', '查看 scrape_queue 的采集状态，并支持手动更改状态。');
    const [result, discoveredStatuses] = await Promise.all([fetchReviewQueue(state.queue), fetchQueueStatuses()]);
    const statusSet = new Set(
        (discoveredStatuses || [])
            .map((item) => queueStatusKey(item, ''))
            .filter(Boolean)
    );
    (result.rows || []).forEach((item) => {
        statusSet.add(queueStatusKey(item.review_status || item.status, 'pending'));
    });

    const selectedStatus = queueStatusKey(state.queue.status, 'all');
    if (selectedStatus !== 'all') statusSet.add(selectedStatus);
    const statusValues = sortQueueStatuses(Array.from(statusSet));
    const filterOptions = [
        `<option value="all" ${selectedStatus === 'all' ? 'selected' : ''}>全部状态</option>`,
        ...statusValues.map((status) => `<option value="${esc(status)}" ${selectedStatus === status ? 'selected' : ''}>${esc(queueStatusLabel(status))}</option>`),
    ].join('');

    setContent(`
        <div class="ams-toolbar ams-queue-toolbar">
            <div class="ams-field"><label>状态</label><select id="qr-status" class="ams-select">${filterOptions}</select></div>
            <div class="ams-field"><label>页码</label><input id="qr-page" class="ams-input" type="number" min="1" value="${state.queue.page}"></div>
            <div class="ams-toolbar-actions"><button id="qr-apply" class="ams-btn ams-btn-primary" type="button">刷新</button></div>
        </div>
        <div class="ams-table-wrap"><table class="ams-table ams-queue-table"><thead><tr><th>ID</th><th>来源</th><th>分类</th><th>发布方</th><th>标签</th><th class="ams-col-status">状态</th><th class="ams-col-time">创建时间</th><th class="ams-col-actions">操作</th></tr></thead><tbody>${result.rows.length ? result.rows.map((item) => {
        const currentStatus = queueStatusKey(item.review_status || item.status, 'pending');
        const rowStatusValues = sortQueueStatuses([...statusValues, currentStatus]);
        const publishDisabled = currentStatus === 'published' ? 'disabled' : '';
        const rejectDisabled = currentStatus === 'rejected' ? 'disabled' : '';
        return `<tr><td><code>${item.id}</code></td><td class="ams-queue-source"><strong>${esc(item.title || item.main_title || '未命名')}</strong><div class="ams-footnote">${esc(item.link || '')}</div></td><td>${esc(item.category || '--')}</td><td>${esc(item.publisher || '--')}</td><td>${esc(item.tag_choice || item.tag || '--')} / ${esc(item.secondary_tag || '--')}</td><td class="ams-col-status">${pill(currentStatus)}</td><td class="ams-col-time">${fmtDate(item.created_at)}</td><td class="ams-col-actions"><div class="ams-row-actions ams-row-actions-stacked ams-queue-actions"><div class="ams-queue-inline ams-queue-inline-status"><select class="ams-select ams-queue-status-select" data-queue-status-select="1" data-id="${item.id}">${rowStatusValues.map((status) => `<option value="${esc(status)}" ${status === currentStatus ? 'selected' : ''}>${esc(queueStatusLabel(status))}</option>`).join('')}</select><button class="ams-btn ams-btn-muted" data-queue-action="set-status" data-id="${item.id}">更新状态</button></div><div class="ams-queue-inline ams-queue-inline-shortcuts"><button class="ams-btn ams-btn-primary" data-queue-action="approve" data-id="${item.id}" ${publishDisabled}>通过并发布</button><button class="ams-btn ams-btn-danger" data-queue-action="reject" data-id="${item.id}" ${rejectDisabled}>拒绝</button></div></div></td></tr>`;
    }).join('') : '<tr><td colspan="8"><div class="ams-empty">暂无队列数据。</div></td></tr>'}</tbody></table></div>
    `);

    document.getElementById('qr-apply')?.addEventListener('click', () => {
        state.queue.status = document.getElementById('qr-status')?.value || 'all';
        state.queue.page = Math.max(1, Number(document.getElementById('qr-page')?.value || 1));
        void renderPage();
    });

    const mapById = new Map(result.rows.map((row) => [row.id, row]));
    document.querySelectorAll('[data-queue-action="set-status"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = Number(button.dataset.id);
            const selectNode = document.querySelector(`[data-queue-status-select][data-id="${id}"]`);
            const nextStatus = queueStatusKey(selectNode?.value, '');
            if (!nextStatus) {
                showToast('请选择状态。', true);
                return;
            }

            let note = null;
            if (nextStatus === 'rejected') {
                const input = window.prompt('拒绝备注（可选）：', '');
                if (input === null) return;
                note = input;
            }

            await withButtonBusy(button, '更新中...', async () => {
                try {
                    await updateQueueStatus(id, nextStatus, state.user?.id || null, note);
                    showToast(`队列 #${id} 状态已更新为 ${queueStatusLabel(nextStatus)}。`);
                    void renderPage();
                } catch (error) {
                    showToast(error.message || '状态更新失败。', true);
                }
            });
        });
    });

    document.querySelectorAll('[data-queue-action="approve"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = Number(button.dataset.id);
            const row = mapById.get(id);
            if (!row) return;

            const seed = buildArticlePayloadFromQueue(row) || createEmptyArticlePayload();
            const title = window.prompt('文章标题：', seed.main_title || '');
            if (title === null) return;
            const subheading = window.prompt('副标题：', seed.subheading || '');
            if (subheading === null) return;
            await withButtonBusy(button, '发布中...', async () => {
                try {
                    await approveAndPublishQueueItem(row, { ...seed, main_title: title, subheading, status: 'published' }, state.user?.id || null);
                    showToast(`队列 #${id} 已发布。`);
                    invalidateArticlesCache();
                    void renderPage();
                } catch (error) {
                    showToast(error.message || '发布失败。', true);
                }
            });
        });
    });

    document.querySelectorAll('[data-queue-action="reject"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = Number(button.dataset.id);
            const note = window.prompt('拒绝原因（必填）：', '内容质量不足，暂不发布');
            if (note === null) return;
            await withButtonBusy(button, '处理中...', async () => {
                try {
                    await rejectQueueItem(id, note, state.user?.id || null);
                    showToast(`队列 #${id} 已拒绝。`);
                    void renderPage();
                } catch (error) {
                    showToast(error.message || '拒绝失败。', true);
                }
            });
        });
    });
}

async function renderPage() {
    if (!state.user || !isAdminUser(state.user)) {
        renderLogin();
        return;
    }

    clearPreviewBinding();
    renderShell();

    try {
        if (state.page === 'dashboard') await renderDashboard();
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

        if (!state.user || !isAdminUser(state.user)) renderLogin();
        else await renderPage();

        onAuthStateChange(async (nextSession) => {
            state.session = nextSession;
            state.user = nextSession?.user || null;
            if (!state.user || !isAdminUser(state.user)) {
                renderLogin();
                return;
            }
            await renderPage();
        });
    } catch (error) {
        console.error(error);
        renderLogin();
        showToast(error.message || '初始化失败。', true);
    }
}

boot();
