
import { getCurrentSession, getDisplayName, isAdminUser, onAuthStateChange, signInWithPassword, signOut } from './auth.module.js';
import {
    createArticle,
    createEmptyArticlePayload,
    fetchArticleById,
    fetchArticles,
    fetchDistinctTags,
    hardDeleteArticle,
    restoreArticle,
    softDeleteArticle,
    updateArticle,
} from './articles.module.js';
import { bindMarkdownPreview } from './editor.module.js';
import { deleteTagOptionById, fetchTagOptions, TAG_SECTIONS, updateTagOptionById, upsertTagOption } from './tags.module.js';
import { fetchFeaturedPool, fetchFeaturedSelection, publishFeaturedRanks } from './featured.module.js';
import { approveAndPublishQueueItem, buildArticlePayloadFromQueue, fetchReviewQueue, rejectQueueItem } from './review-queue.module.js';
import { DEFAULT_FEATURED_LIMIT } from './supabase.client.js';

const root = document.getElementById('ams-root');
const toastNode = document.getElementById('ams-toast');

const state = {
    session: null,
    user: null,
    page: 'dashboard',
    articles: { page: 1, pageSize: 20, search: '', status: 'all', tag: 'all' },
    recycle: { page: 1, pageSize: 20, search: '' },
    editor: { mode: 'create', id: null, payload: createEmptyArticlePayload() },
    featured: { limit: DEFAULT_FEATURED_LIMIT, ids: [] },
    queue: { page: 1, pageSize: 20, status: 'pending' },
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

function pill(value) {
    return `<span class="ams-pill ${esc(String(value || '').toLowerCase())}">${esc(value || '--')}</span>`;
}

function clearPreviewBinding() {
    if (typeof state.previewUnbind === 'function') state.previewUnbind();
    state.previewUnbind = null;
}

function renderLogin() {
    root.innerHTML = `
        <section class="ams-auth-shell">
            <div class="ams-auth-card">
                <h1 class="ams-logo">GasGx <span>AMS</span></h1>
                <p class="ams-subtitle">Article Management System · Admin access only</p>
                <form id="ams-login-form" class="ams-form">
                    <div class="ams-field">
                        <label>Email</label>
                        <input id="ams-login-email" class="ams-input" type="email" placeholder="cuitengwei@gasgx.com" required>
                    </div>
                    <div class="ams-field">
                        <label>Password</label>
                        <input id="ams-login-password" class="ams-input" type="password" placeholder="••••••••" required>
                    </div>
                    <button class="ams-btn ams-btn-primary" type="submit">Sign In</button>
                </form>
                <p class="ams-footnote">Supabase Auth login. Password is not hardcoded.</p>
            </div>
        </section>
    `;

    document.getElementById('ams-login-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('ams-login-email')?.value || '';
        const password = document.getElementById('ams-login-password')?.value || '';
        try {
            await signInWithPassword(email, password);
            showToast('Signed in successfully.');
        } catch (error) {
            showToast(error.message || 'Sign in failed.', true);
        }
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
                    <div class="ams-sidebar-meta">Article Operations Control</div>
                </div>
                <nav class="ams-nav">
                    ${navButton('dashboard', 'Dashboard', 'fa-chart-line')}
                    ${navButton('articles', 'Articles', 'fa-file-lines')}
                    ${navButton('editor', 'New Article', 'fa-pen-to-square')}
                    ${navButton('recycle', 'Recycle Bin', 'fa-trash-can-arrow-up')}
                    ${navButton('featured', 'Featured', 'fa-ranking-star')}
                    ${navButton('queue', 'Review Queue', 'fa-list-check')}
                    ${navButton('tags', 'Tags', 'fa-tags')}
                </nav>
            </aside>
            <main class="ams-main">
                <header class="ams-header">
                    <div>
                        <h1 id="ams-page-title">Article Management System</h1>
                        <p id="ams-page-sub">Internal admin console for GasGx newsroom.</p>
                    </div>
                    <div class="ams-user">
                        <span><i class="fa-solid fa-user"></i> <strong>${name}</strong></span>
                        <button id="ams-signout" class="ams-btn ams-btn-muted" type="button">Sign Out</button>
                    </div>
                </header>
                <section id="ams-content" class="ams-content"><div class="ams-empty">Loading...</div></section>
            </main>
        </div>
    `;

    document.getElementById('ams-signout')?.addEventListener('click', async () => {
        try {
            await signOut();
        } catch (error) {
            showToast(error.message || 'Sign out failed.', true);
        }
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
    setPageHeader('Dashboard', 'Overview of content, queue and featured states.');

    const [active, recycled, featured, queue] = await Promise.all([
        fetchArticles({ page: 1, pageSize: 1 }),
        fetchArticles({ page: 1, pageSize: 1, includeDeleted: true }),
        fetchFeaturedSelection(state.featured.limit),
        fetchReviewQueue({ page: 1, pageSize: 1, status: 'pending' }),
    ]);

    setContent(`
        <div class="ams-grid">
            <article class="ams-card"><h3>Published / Active</h3><div class="ams-kpi">${active.count}</div><div class="ams-kpi-sub">Rows not in recycle bin</div></article>
            <article class="ams-card"><h3>Recycle Bin</h3><div class="ams-kpi">${recycled.count}</div><div class="ams-kpi-sub">Soft deleted rows</div></article>
            <article class="ams-card"><h3>Featured Slots</h3><div class="ams-kpi">${featured.length}/${state.featured.limit}</div><div class="ams-kpi-sub">Configured homepage recommendations</div></article>
            <article class="ams-card"><h3>Pending Queue</h3><div class="ams-kpi">${queue.count}</div><div class="ams-kpi-sub">Awaiting review in scrape_queue</div></article>
        </div>
        <div class="ams-footnote">Use the left navigation to manage all newsroom operations.</div>
    `);
}

function articleToolbar(filters, tags = [], recycleMode = false) {
    return `
        <div class="ams-toolbar">
            <div class="ams-field"><label>Search</label><input id="am-search" class="ams-input" value="${esc(filters.search || '')}" placeholder="Title / publisher / link"></div>
            ${recycleMode ? '' : `<div class="ams-field"><label>Status</label><select id="am-status" class="ams-select"><option value="all" ${filters.status === 'all' ? 'selected' : ''}>all</option><option value="draft" ${filters.status === 'draft' ? 'selected' : ''}>draft</option><option value="published" ${filters.status === 'published' ? 'selected' : ''}>published</option><option value="archived" ${filters.status === 'archived' ? 'selected' : ''}>archived</option></select></div>`}
            ${recycleMode ? '' : `<div class="ams-field"><label>Tag</label><select id="am-tag" class="ams-select"><option value="all">all</option>${tags.map((t) => `<option value="${esc(t)}" ${filters.tag === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></div>`}
            <div class="ams-field"><label>Page</label><input id="am-page" class="ams-input" type="number" min="1" value="${filters.page}"></div>
            <div class="ams-toolbar-actions"><button class="ams-btn ams-btn-primary" id="am-apply" type="button">Apply</button>${recycleMode ? '' : '<button class="ams-btn ams-btn-muted" id="am-new" type="button">New</button>'}</div>
        </div>
    `;
}

function articleRows(rows, recycleMode = false) {
    if (!rows.length) return '<tr><td colspan="9"><div class="ams-empty">No rows found.</div></td></tr>';
    return rows
        .map(
            (row) => `
        <tr>
            <td><code>${row.id}</code></td>
            <td><strong>${esc(row.main_title || 'Untitled')}</strong><div class="ams-footnote">${esc(row.subheading || '')}</div></td>
            <td>${esc(row.publisher || '--')}</td>
            <td>${esc(row.tag || '--')}</td>
            <td>${esc(row.secondary_tag || '--')}</td>
            <td>${pill(row.status || '--')}</td>
            <td>${row.featured_rank ? `#${row.featured_rank}` : '--'}</td>
            <td>${fmtDate(row.time)}</td>
            <td>
                <div class="ams-row-actions">
                    ${recycleMode ? `<button class="ams-btn ams-btn-muted" data-action="restore" data-id="${row.id}">Restore</button><button class="ams-btn ams-btn-danger" data-action="purge" data-id="${row.id}">Purge</button>` : `<button class="ams-btn ams-btn-muted" data-action="edit" data-id="${row.id}">Edit</button><button class="ams-btn ams-btn-danger" data-action="soft-delete" data-id="${row.id}">Delete</button>`}
                </div>
            </td>
        </tr>
    `
        )
        .join('');
}

async function renderArticles() {
    setPageHeader('Articles', 'Create, edit, search and soft delete article records.');
    const [tags, result] = await Promise.all([fetchDistinctTags(), fetchArticles(state.articles)]);

    setContent(`
        ${articleToolbar(state.articles, tags, false)}
        <div class="ams-table-wrap"><table class="ams-table"><thead><tr><th>ID</th><th>Title</th><th>Publisher</th><th>Tag</th><th>Secondary</th><th>Status</th><th>Featured</th><th>Time</th><th>Actions</th></tr></thead><tbody>${articleRows(result.rows, false)}</tbody></table></div>
        <div class="ams-footnote">Total rows: ${result.count}. Filters target active (non-deleted) rows.</div>
    `);

    document.getElementById('am-apply')?.addEventListener('click', () => {
        state.articles.search = document.getElementById('am-search')?.value || '';
        state.articles.status = document.getElementById('am-status')?.value || 'all';
        state.articles.tag = document.getElementById('am-tag')?.value || 'all';
        state.articles.page = Math.max(1, Number(document.getElementById('am-page')?.value || 1));
        void renderPage();
    });

    document.getElementById('am-new')?.addEventListener('click', () => {
        state.page = 'editor';
        state.editor = { mode: 'create', id: null, payload: createEmptyArticlePayload() };
        void renderPage();
    });

    document.querySelectorAll('[data-action="edit"]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            try {
                const id = Number(btn.dataset.id);
                const row = await fetchArticleById(id);
                state.editor = { mode: 'edit', id, payload: { ...createEmptyArticlePayload(), ...row } };
                state.page = 'editor';
                void renderPage();
            } catch (error) {
                showToast(error.message || 'Failed to load article.', true);
            }
        });
    });

    document.querySelectorAll('[data-action="soft-delete"]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const id = Number(btn.dataset.id);
            if (!window.confirm(`Move article ${id} to recycle bin?`)) return;
            try {
                await softDeleteArticle(id, state.user?.id || null);
                showToast('Article moved to recycle bin.');
                void renderPage();
            } catch (error) {
                showToast(error.message || 'Delete failed.', true);
            }
        });
    });
}

async function renderRecycleBin() {
    setPageHeader('Recycle Bin', 'Restore or permanently delete soft-deleted rows.');
    const result = await fetchArticles({
        page: state.recycle.page,
        pageSize: state.recycle.pageSize,
        includeDeleted: true,
        search: state.recycle.search,
    });

    setContent(`
        ${articleToolbar(state.recycle, [], true)}
        <div class="ams-table-wrap"><table class="ams-table"><thead><tr><th>ID</th><th>Title</th><th>Publisher</th><th>Tag</th><th>Secondary</th><th>Status</th><th>Featured</th><th>Time</th><th>Actions</th></tr></thead><tbody>${articleRows(result.rows, true)}</tbody></table></div>
        <div class="ams-footnote">Permanent delete is irreversible.</div>
    `);

    document.getElementById('am-apply')?.addEventListener('click', () => {
        state.recycle.search = document.getElementById('am-search')?.value || '';
        state.recycle.page = Math.max(1, Number(document.getElementById('am-page')?.value || 1));
        void renderPage();
    });

    document.querySelectorAll('[data-action="restore"]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            try {
                await restoreArticle(Number(btn.dataset.id), state.user?.id || null);
                showToast('Article restored.');
                void renderPage();
            } catch (error) {
                showToast(error.message || 'Restore failed.', true);
            }
        });
    });

    document.querySelectorAll('[data-action="purge"]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const id = Number(btn.dataset.id);
            if (!window.confirm(`Permanently delete article ${id}?`)) return;
            try {
                await hardDeleteArticle(id);
                showToast('Article permanently deleted.');
                void renderPage();
            } catch (error) {
                showToast(error.message || 'Purge failed.', true);
            }
        });
    });
}
function optionsFor(values, selected) {
    return values
        .map((value) => `<option value="${esc(value)}" ${selected === value ? 'selected' : ''}>${esc(value)}</option>`)
        .join('');
}

async function renderEditor() {
    const mode = state.editor.mode === 'edit' ? `Edit Article #${state.editor.id}` : 'Create New Article';
    setPageHeader(mode, 'Markdown editor with live preview and publish controls.');

    const optionRows = await fetchTagOptions();
    const optionMap = TAG_SECTIONS.reduce((acc, section) => ({ ...acc, [section]: [] }), {});
    optionRows.forEach((item) => {
        if (!item || item.is_active === false || !optionMap[item.section]) return;
        optionMap[item.section].push(item.option_id || item.label_en);
    });

    const payload = { ...createEmptyArticlePayload(), ...(state.editor.payload || {}) };

    setContent(`
        <form id="editor-form" class="ams-stack">
            <div class="ams-split">
                <div class="ams-stack">
                    <div class="ams-field"><label>Title</label><input id="ed-main_title" class="ams-input" value="${esc(payload.main_title)}" required></div>
                    <div class="ams-field"><label>Subheading</label><textarea id="ed-subheading" class="ams-textarea">${esc(payload.subheading)}</textarea></div>
                    <div class="ams-field"><label>Publisher</label><select id="ed-publisher" class="ams-select"><option value="">Select publisher</option>${optionsFor(optionMap.publisher, payload.publisher)}</select></div>
                    <div class="ams-field"><label>Category</label><select id="ed-type" class="ams-select"><option value="">Select category</option>${optionsFor(optionMap.category, payload.type)}</select></div>
                    <div class="ams-field"><label>Main Tag</label><select id="ed-tag" class="ams-select"><option value="">Select tag</option>${optionsFor(optionMap.tag, payload.tag)}</select></div>
                    <div class="ams-field"><label>Secondary Tag</label><select id="ed-secondary_tag" class="ams-select"><option value="">Select secondary tag</option>${optionsFor(optionMap.secondary_tag, payload.secondary_tag)}</select></div>
                    <div class="ams-field"><label>Status</label><select id="ed-status" class="ams-select"><option value="draft" ${payload.status === 'draft' ? 'selected' : ''}>draft</option><option value="published" ${payload.status === 'published' ? 'selected' : ''}>published</option><option value="archived" ${payload.status === 'archived' ? 'selected' : ''}>archived</option></select></div>
                    <div class="ams-field"><label>Published Time (ISO)</label><input id="ed-time" class="ams-input" value="${esc(payload.time || '')}"></div>
                    <div class="ams-field"><label>Article Link</label><input id="ed-link" class="ams-input" value="${esc(payload.link)}" placeholder="https://..."></div>
                    <div class="ams-field"><label>Cover Image</label><input id="ed-cover_image" class="ams-input" value="${esc(payload.cover_image)}"></div>
                    <div class="ams-field"><label>Author Avatar</label><input id="ed-author_avatar" class="ams-input" value="${esc(payload.author_avatar)}"></div>
                    <div class="ams-field"><label>Topics (comma separated)</label><input id="ed-topics" class="ams-input" value="${esc(payload.topics)}"></div>
                </div>
                <div class="ams-stack">
                    <div class="ams-field"><label>Markdown Content</label><textarea id="ed-content_markdown" class="ams-textarea" style="min-height:320px" placeholder="# Headline\n\nBody text...">${esc(payload.content_markdown || '')}</textarea></div>
                    <div><label style="font-size:11px;color:#9f9f9f;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Live Preview</label><div id="ed-preview" class="ams-preview"></div></div>
                </div>
            </div>
            <div class="ams-row-actions">
                <button type="submit" class="ams-btn ams-btn-primary">${state.editor.mode === 'edit' ? 'Update Article' : 'Create Article'}</button>
                <button type="button" class="ams-btn ams-btn-muted" id="ed-save-draft">Save as Draft</button>
                <button type="button" class="ams-btn ams-btn-muted" id="ed-publish">Publish</button>
                <button type="button" class="ams-btn ams-btn-muted" id="ed-cancel">Cancel</button>
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

    const save = async (statusOverride = null) => {
        const payloadForSave = readPayload();
        if (statusOverride) payloadForSave.status = statusOverride;
        if (!payloadForSave.main_title.trim()) {
            showToast('Title is required.', true);
            return;
        }
        try {
            if (state.editor.mode === 'edit' && state.editor.id) {
                await updateArticle(state.editor.id, payloadForSave, state.user?.id || null);
                showToast('Article updated.');
            } else {
                const created = await createArticle(payloadForSave, state.user?.id || null);
                state.editor = { mode: 'edit', id: created.id, payload: { ...created } };
                showToast('Article created.');
            }
            state.page = 'articles';
            void renderPage();
        } catch (error) {
            showToast(error.message || 'Save failed.', true);
        }
    };

    document.getElementById('editor-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        await save();
    });
    document.getElementById('ed-save-draft')?.addEventListener('click', async () => save('draft'));
    document.getElementById('ed-publish')?.addEventListener('click', async () => save('published'));
    document.getElementById('ed-cancel')?.addEventListener('click', () => {
        state.page = 'articles';
        void renderPage();
    });
}

async function renderTags() {
    setPageHeader('Tag Manager', 'Manage feeder_form_options entries for all editor selectors.');
    const rows = await fetchTagOptions();
    const grouped = TAG_SECTIONS.reduce((acc, section) => ({ ...acc, [section]: [] }), {});
    rows.forEach((row) => {
        if (grouped[row.section]) grouped[row.section].push(row);
    });

    setContent(`
        <div class="ams-split">
            <section class="ams-card">
                <h3>Create / Upsert Option</h3>
                <form id="tag-form" class="ams-form" style="margin-top:10px">
                    <div class="ams-field"><label>Section</label><select id="tg-section" class="ams-select">${TAG_SECTIONS.map((section) => `<option value="${section}">${section}</option>`).join('')}</select></div>
                    <div class="ams-field"><label>Option ID</label><input id="tg-option-id" class="ams-input" placeholder="Hardware"></div>
                    <div class="ams-field"><label>Label EN</label><input id="tg-label-en" class="ams-input" placeholder="Hardware"></div>
                    <div class="ams-field"><label>Label ZH</label><input id="tg-label-zh" class="ams-input" placeholder="硬件"></div>
                    <div class="ams-field"><label>Sort Order</label><input id="tg-sort-order" class="ams-input" type="number" value="100"></div>
                    <button class="ams-btn ams-btn-primary" type="submit">Upsert Option</button>
                </form>
            </section>
            <section class="ams-card"><h3>Notes</h3><p class="ams-kpi-sub">Option ID should stay stable. Use disable for soft retire. Deleting option is permanent.</p></section>
        </div>
        <div class="ams-stack" style="margin-top:12px">
            ${TAG_SECTIONS.map((section) => {
                const items = grouped[section] || [];
                return `<div class="ams-card"><h3>${section}</h3><div class="ams-table-wrap" style="margin-top:10px"><table class="ams-table" style="min-width:760px"><thead><tr><th>ID</th><th>Option</th><th>Label EN</th><th>Label ZH</th><th>Order</th><th>Active</th><th>Actions</th></tr></thead><tbody>${items.length ? items.map((item) => `<tr><td><code>${item.id}</code></td><td>${esc(item.option_id || '--')}</td><td>${esc(item.label_en || '--')}</td><td>${esc(item.label_zh || '--')}</td><td>${esc(String(item.sort_order ?? '--'))}</td><td>${item.is_active ? 'yes' : 'no'}</td><td><div class="ams-row-actions"><button class="ams-btn ams-btn-muted" data-tag-action="toggle" data-id="${item.id}" data-active="${item.is_active ? 1 : 0}">${item.is_active ? 'Disable' : 'Enable'}</button><button class="ams-btn ams-btn-muted" data-tag-action="rename" data-id="${item.id}" data-label="${esc(item.label_en || '')}">Rename</button><button class="ams-btn ams-btn-danger" data-tag-action="delete" data-id="${item.id}">Delete</button></div></td></tr>`).join('') : '<tr><td colspan="7"><div class="ams-empty">No options.</div></td></tr>'}</tbody></table></div></div>`;
            }).join('')}
        </div>
    `);

    document.getElementById('tag-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            await upsertTagOption({
                section: document.getElementById('tg-section')?.value || '',
                option_id: document.getElementById('tg-option-id')?.value || '',
                label_en: document.getElementById('tg-label-en')?.value || '',
                label_zh: document.getElementById('tg-label-zh')?.value || '',
                sort_order: Number(document.getElementById('tg-sort-order')?.value || 100),
                is_active: true,
            });
            showToast('Option upserted.');
            void renderPage();
        } catch (error) {
            showToast(error.message || 'Upsert failed.', true);
        }
    });

    document.querySelectorAll('[data-tag-action="toggle"]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                const id = Number(button.dataset.id);
                const active = button.dataset.active === '1';
                await updateTagOptionById(id, { is_active: !active });
                showToast('Option status updated.');
                void renderPage();
            } catch (error) {
                showToast(error.message || 'Update failed.', true);
            }
        });
    });

    document.querySelectorAll('[data-tag-action="rename"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = Number(button.dataset.id);
            const current = button.dataset.label || '';
            const next = window.prompt('New EN label:', current);
            if (next === null) return;
            try {
                await updateTagOptionById(id, { label_en: next });
                showToast('Option renamed.');
                void renderPage();
            } catch (error) {
                showToast(error.message || 'Rename failed.', true);
            }
        });
    });

    document.querySelectorAll('[data-tag-action="delete"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = Number(button.dataset.id);
            if (!window.confirm(`Delete option row ${id}?`)) return;
            try {
                await deleteTagOptionById(id);
                showToast('Option deleted.');
                void renderPage();
            } catch (error) {
                showToast(error.message || 'Delete failed.', true);
            }
        });
    });
}
async function renderFeatured() {
    setPageHeader('Featured Manager', 'Configure homepage featured ranking and publish order.');

    const [poolRows, selectedRows] = await Promise.all([fetchFeaturedPool(120), fetchFeaturedSelection(state.featured.limit)]);
    if (!state.featured.ids.length) state.featured.ids = selectedRows.map((row) => row.id);

    const mapById = new Map(poolRows.map((row) => [row.id, row]));
    const selectedCards = state.featured.ids
        .slice(0, state.featured.limit)
        .map((id) => mapById.get(id) || selectedRows.find((row) => row.id === id))
        .filter(Boolean);

    setContent(`
        <div class="ams-toolbar" style="grid-template-columns:240px 1fr;">
            <div class="ams-field"><label>Featured Limit (N)</label><input id="ft-limit" class="ams-input" type="number" min="1" max="30" value="${state.featured.limit}"></div>
            <div class="ams-toolbar-actions"><button id="ft-apply" class="ams-btn ams-btn-primary" type="button">Apply N</button><button id="ft-publish" class="ams-btn ams-btn-primary" type="button">Publish Featured Order</button></div>
        </div>
        <div class="ams-split">
            <section class="ams-card"><h3>Current Order (1-${state.featured.limit})</h3><div class="ams-list" style="margin-top:10px">${selectedCards.length ? selectedCards.map((item, index) => `<div class="ams-list-item"><div style="display:flex;align-items:flex-start;gap:10px;"><span class="ams-rank">${index + 1}</span><div><strong>${esc(item.main_title || 'Untitled')}</strong><div class="ams-footnote">#${item.id} · ${esc(item.tag || '--')}</div></div></div><div class="ams-row-actions"><button class="ams-btn ams-btn-muted" data-ft-action="up" data-id="${item.id}">Up</button><button class="ams-btn ams-btn-muted" data-ft-action="down" data-id="${item.id}">Down</button><button class="ams-btn ams-btn-danger" data-ft-action="remove" data-id="${item.id}">Remove</button></div></div>`).join('') : '<div class="ams-empty">No featured rows selected.</div>'}</div></section>
            <section class="ams-card"><h3>Published Pool</h3><div class="ams-list" style="margin-top:10px;max-height:620px;overflow:auto;">${poolRows.length ? poolRows.map((item) => `<div class="ams-list-item"><div><strong>${esc(item.main_title || 'Untitled')}</strong><div class="ams-footnote">#${item.id} · ${esc(item.tag || '--')} · ${fmtDate(item.time)}</div></div><button class="ams-btn ${state.featured.ids.includes(item.id) ? 'ams-btn-danger' : 'ams-btn-muted'}" data-ft-action="toggle" data-id="${item.id}">${state.featured.ids.includes(item.id) ? 'Remove' : 'Add'}</button></div>`).join('') : '<div class="ams-empty">No published pool rows.</div>'}</div></section>
        </div>
    `);

    document.getElementById('ft-apply')?.addEventListener('click', () => {
        state.featured.limit = Math.max(1, Math.min(30, Number(document.getElementById('ft-limit')?.value || DEFAULT_FEATURED_LIMIT)));
        state.featured.ids = state.featured.ids.slice(0, state.featured.limit);
        void renderPage();
    });

    document.getElementById('ft-publish')?.addEventListener('click', async () => {
        try {
            await publishFeaturedRanks(state.featured.ids, state.featured.limit, state.user?.id || null);
            showToast('Featured ranks published.');
            void renderPage();
        } catch (error) {
            showToast(error.message || 'Publish failed.', true);
        }
    });

    document.querySelectorAll('[data-ft-action]').forEach((button) => {
        button.addEventListener('click', () => {
            const action = button.dataset.ftAction;
            const id = Number(button.dataset.id);
            const index = state.featured.ids.indexOf(id);
            if (action === 'toggle') {
                if (index >= 0) state.featured.ids = state.featured.ids.filter((item) => item !== id);
                else if (state.featured.ids.length < state.featured.limit) state.featured.ids.push(id);
                else showToast(`Featured list is full (N=${state.featured.limit}).`, true);
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
            void renderPage();
        });
    });
}

async function renderQueue() {
    setPageHeader('Review Queue', 'Review scrape_queue rows and publish into articles.');
    const result = await fetchReviewQueue(state.queue);

    setContent(`
        <div class="ams-toolbar" style="grid-template-columns:240px 180px 1fr;">
            <div class="ams-field"><label>Status</label><select id="qr-status" class="ams-select"><option value="pending" ${state.queue.status === 'pending' ? 'selected' : ''}>pending</option><option value="published" ${state.queue.status === 'published' ? 'selected' : ''}>published</option><option value="rejected" ${state.queue.status === 'rejected' ? 'selected' : ''}>rejected</option><option value="all" ${state.queue.status === 'all' ? 'selected' : ''}>all</option></select></div>
            <div class="ams-field"><label>Page</label><input id="qr-page" class="ams-input" type="number" min="1" value="${state.queue.page}"></div>
            <div class="ams-toolbar-actions"><button id="qr-apply" class="ams-btn ams-btn-primary" type="button">Reload</button></div>
        </div>
        <div class="ams-table-wrap"><table class="ams-table"><thead><tr><th>ID</th><th>Source</th><th>Category</th><th>Publisher</th><th>Tags</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>${result.rows.length ? result.rows.map((item) => `<tr><td><code>${item.id}</code></td><td><strong>${esc(item.title || item.main_title || 'Untitled')}</strong><div class="ams-footnote">${esc(item.link || '')}</div></td><td>${esc(item.category || '--')}</td><td>${esc(item.publisher || '--')}</td><td>${esc(item.tag_choice || item.tag || '--')} / ${esc(item.secondary_tag || '--')}</td><td>${pill(item.review_status || item.status || 'pending')}</td><td>${fmtDate(item.created_at)}</td><td><div class="ams-row-actions"><button class="ams-btn ams-btn-primary" data-queue-action="approve" data-id="${item.id}">Approve & Publish</button><button class="ams-btn ams-btn-danger" data-queue-action="reject" data-id="${item.id}">Reject</button></div></td></tr>`).join('') : '<tr><td colspan="8"><div class="ams-empty">No queue rows.</div></td></tr>'}</tbody></table></div>
    `);

    document.getElementById('qr-apply')?.addEventListener('click', () => {
        state.queue.status = document.getElementById('qr-status')?.value || 'pending';
        state.queue.page = Math.max(1, Number(document.getElementById('qr-page')?.value || 1));
        void renderPage();
    });

    const mapById = new Map(result.rows.map((row) => [row.id, row]));
    document.querySelectorAll('[data-queue-action="approve"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = Number(button.dataset.id);
            const row = mapById.get(id);
            if (!row) return;

            const seed = buildArticlePayloadFromQueue(row) || createEmptyArticlePayload();
            const title = window.prompt('Article title:', seed.main_title || '');
            if (title === null) return;
            const subheading = window.prompt('Subheading:', seed.subheading || '');
            if (subheading === null) return;
            try {
                await approveAndPublishQueueItem(row, { ...seed, main_title: title, subheading, status: 'published' }, state.user?.id || null);
                showToast(`Queue #${id} published.`);
                void renderPage();
            } catch (error) {
                showToast(error.message || 'Publish failed.', true);
            }
        });
    });

    document.querySelectorAll('[data-queue-action="reject"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = Number(button.dataset.id);
            const note = window.prompt('Rejection note (required):', 'Insufficient quality for publish');
            if (note === null) return;
            try {
                await rejectQueueItem(id, note, state.user?.id || null);
                showToast(`Queue #${id} rejected.`);
                void renderPage();
            } catch (error) {
                showToast(error.message || 'Reject failed.', true);
            }
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
        else setContent('<div class="ams-empty">Unknown panel.</div>');
    } catch (error) {
        console.error(error);
        setContent(`<div class="ams-empty">${esc(error.message || 'Panel render failed.')}</div>`);
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
        showToast(error.message || 'Initialization failed.', true);
    }
}

boot();
