import {
    ADMIN_ROLE_ADMIN,
    ADMIN_ROLE_SUPER_ADMIN,
    clearPasswordRecoveryUrl,
    canAccessConsoleEntry,
    getAdminUserAccess,
    getCurrentSession,
    getDisplayName,
    isPasswordRecoveryMode,
    onAuthStateChange,
    sendPasswordResetEmail,
    signInWithPassword,
    signOut,
    updateCurrentPassword,
} from './auth.module.js?v=20260324sales01';
import {
    ADMIN_ENTRY_KIND,
    SALES_ENTRY_KIND,
    adminConsoleUrl,
} from './admin-entry.module.js';
import {
    renderAdminSecurityPage,
    renderAdminUsersPage,
} from './admin-users.module.js?v=20260324sales02';
import {
    renderQuoteBrandsPage,
    renderQuoteCustomerFlowPage,
    renderQuoteCustomersPage,
    renderQuotePipelinePage,
    renderQuoteProductsPage,
    renderQuoteSalesDashboardPage,
} from './quote-system.module.js?v=20260324quote32';

const root = document.getElementById('ams-root');
const toastNode = document.getElementById('ams-toast');

const SALES_PAGE_IDS = new Set([
    'dashboard',
    'quote-customers',
    'quote-pipeline',
    'quote-customer-flow',
    'quote-brands',
    'quote-products',
    'admin-users',
    'admin-security',
]);

const ADMIN_ONLY_PAGES = new Set([
    'quote-brands',
    'quote-products',
    'admin-users',
]);

const FLOW_CONTEXT_KEYS = ['stage', 'customer', 'deal', 'requirement', 'instance'];

const state = {
    session: null,
    user: null,
    adminAccess: null,
    page: pageFromUrl() || 'dashboard',
    authView: 'login',
    entryAllowed: false,
};

function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function text(value, fallback = '') {
    const normalized = String(value ?? '').trim();
    return normalized || fallback;
}

function pageFromUrl() {
    try {
        const url = new URL(window.location.href);
        const page = text(url.searchParams.get('page'));
        return SALES_PAGE_IDS.has(page) ? page : null;
    } catch {
        return null;
    }
}

function syncPageToUrl(options = {}) {
    try {
        const url = new URL(window.location.href);
        if (state.page && state.page !== 'dashboard') url.searchParams.set('page', state.page);
        else url.searchParams.delete('page');
        if (options.clearFlowParams) {
            FLOW_CONTEXT_KEYS.forEach((key) => url.searchParams.delete(key));
        }
        window.history.replaceState({}, '', url);
    } catch {
        return;
    }
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
    const previousText = button.textContent || '';
    const previousDisabled = button.disabled;
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
            button.disabled = previousDisabled;
            button.textContent = previousText;
        }
    }
}

function setPageHeader(title, sub) {
    const titleNode = document.getElementById('ams-page-title');
    const subNode = document.getElementById('ams-page-sub');
    if (titleNode) titleNode.textContent = title;
    if (subNode) subNode.textContent = sub;
}

function setContent(html) {
    const content = document.getElementById('ams-content');
    if (content) content.innerHTML = html;
}

function isMaintenanceAdmin() {
    const role = text(state.adminAccess?.row?.role).toLowerCase();
    return role === ADMIN_ROLE_ADMIN || role === ADMIN_ROLE_SUPER_ADMIN;
}

function navIsActive(id) {
    if (state.page === id) return true;
    return id === 'quote-customers' && ['quote-pipeline', 'quote-customer-flow'].includes(state.page);
}

function navButton(id, label, icon) {
    const active = navIsActive(id) ? 'active' : '';
    return `<button type="button" class="ams-nav-btn ${active}" data-page="${id}"><span><i class="fa-solid ${icon}"></i> ${label}</span><i class="fa-solid fa-angle-right"></i></button>`;
}

function renderLogin() {
    const authView = ['forgot', 'reset'].includes(state.authView) ? state.authView : 'login';
    const isResetView = authView === 'reset';
    const isForgotView = authView === 'forgot';
    root.innerHTML = `
        <section class="ams-auth-shell ams-auth-shell-sales">
            <div class="ams-auth-card">
                <h1 class="ams-logo">GasGx <span>Sales</span></h1>
                <p class="ams-subtitle">独立销售入口，面向销售与管理员的专用后台。</p>
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
                        `
                        : isForgotView
                            ? `
                                <form id="ams-forgot-form" class="ams-form">
                                    <div class="ams-field">
                                        <label>邮箱</label>
                                        <input id="ams-forgot-email" class="ams-input" type="email" placeholder="请输入后台账号邮箱" required>
                                    </div>
                                    <button class="ams-btn ams-btn-primary" type="submit">发送重置邮件</button>
                                </form>
                                <div class="ams-auth-links">
                                    <button class="ams-btn ams-btn-muted" type="button" data-auth-view="login">返回登录</button>
                                </div>
                            `
                            : `
                                <form id="ams-login-form" class="ams-form">
                                    <div class="ams-field">
                                        <label>邮箱</label>
                                        <input id="ams-login-email" class="ams-input" type="email" placeholder="请输入后台账号邮箱" required>
                                    </div>
                                    <div class="ams-field">
                                        <label>密码</label>
                                        <input id="ams-login-password" class="ams-input" type="password" placeholder="请输入密码" required>
                                    </div>
                                    <button class="ams-btn ams-btn-primary" type="submit">登录销售后台</button>
                                </form>
                                <div class="ams-auth-links">
                                    <button class="ams-btn ams-btn-link" type="button" data-auth-view="forgot">忘记密码</button>
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
                showToast(error.message || '发送重置邮件失败。', true);
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

function renderShell() {
    const displayName = esc(getDisplayName(state.user, state.adminAccess?.row || null));
    const row = state.adminAccess?.row || null;
    const canOpenAdmin = canAccessConsoleEntry(row, ADMIN_ENTRY_KIND);
    const adminNav = isMaintenanceAdmin()
        ? `
            <div class="ams-nav-group">
                <div class="ams-nav-group-label">Maintenance</div>
                <div class="ams-nav-group-items">
                    ${navButton('quote-brands', '品牌列表', 'fa-layer-group')}
                    ${navButton('quote-products', '产品列表', 'fa-cubes')}
                    ${navButton('admin-users', '人员管理', 'fa-users')}
                </div>
            </div>
        `
        : '';

    root.innerHTML = `
        <div class="ams-app ams-app-sales">
            <aside class="ams-sidebar">
                <div class="ams-sidebar-head">
                    <h2 class="ams-sidebar-title">GasGx <span>Sales</span></h2>
                    <div class="ams-sidebar-meta">独立销售入口</div>
                </div>
                <nav class="ams-nav">
                    <div class="ams-nav-group">
                        <div class="ams-nav-group-label">Sales</div>
                        <div class="ams-nav-group-items">
                            ${navButton('dashboard', '销售总览', 'fa-chart-line')}
                            ${navButton('quote-customers', '客户档案', 'fa-address-book')}
                        </div>
                    </div>
                    ${adminNav}
                </nav>
            </aside>
            <main class="ams-main">
                <header class="ams-header">
                    <div>
                        <h1 id="ams-page-title">GasGx Sales</h1>
                        <p id="ams-page-sub">围绕客户建档到运维支持的单线销售后台。</p>
                    </div>
                    <div class="ams-user">
                        <button id="ams-open-security" class="ams-btn ams-btn-muted" type="button">账号安全</button>
                        ${canOpenAdmin ? `<a class="ams-btn ams-btn-muted" href="${esc(adminConsoleUrl('dashboard', {}, { entryKind: ADMIN_ENTRY_KIND }))}">进入主站后台</a>` : ''}
                        <span><i class="fa-solid fa-user"></i> <strong>${displayName}</strong></span>
                        <button id="ams-signout" class="ams-btn ams-btn-muted" type="button">退出登录</button>
                    </div>
                </header>
                <section id="ams-content" class="ams-content"><div class="ams-empty">加载中...</div></section>
            </main>
        </div>
    `;

    document.getElementById('ams-open-security')?.addEventListener('click', () => {
        state.page = 'admin-security';
        syncPageToUrl({ clearFlowParams: true });
        void renderPage();
    });

    document.getElementById('ams-signout')?.addEventListener('click', async (event) => {
        await withButtonBusy(event.currentTarget, '退出中...', async () => {
            try {
                await signOut();
            } catch (error) {
                showToast(error.message || '退出失败。', true);
            }
        });
    });

    document.querySelectorAll('.ams-nav-btn').forEach((button) => {
        button.addEventListener('click', () => {
            state.page = button.dataset.page || 'dashboard';
            syncPageToUrl({ clearFlowParams: true });
            void renderPage();
        });
    });
}

function renderEntryDenied() {
    const row = state.adminAccess?.row || null;
    const canOpenAdmin = canAccessConsoleEntry(row, ADMIN_ENTRY_KIND);
    root.innerHTML = `
        <section class="ams-auth-shell ams-auth-shell-sales">
            <div class="ams-auth-card">
                <h1 class="ams-logo">GasGx <span>Sales</span></h1>
                <p class="ams-subtitle">当前账号没有销售后台权限。</p>
                <div class="ams-auth-links">
                    ${canOpenAdmin ? `<a class="ams-btn ams-btn-primary" href="${esc(adminConsoleUrl('dashboard', {}, { entryKind: ADMIN_ENTRY_KIND }))}">进入主站后台</a>` : ''}
                    <button class="ams-btn ams-btn-muted" type="button" id="ams-entry-signout">退出登录</button>
                </div>
            </div>
        </section>
    `;
    document.getElementById('ams-entry-signout')?.addEventListener('click', async () => {
        await signOut();
    });
}

async function refreshAdminAccess(forceRefresh = false) {
    if (!state.user) {
        state.adminAccess = null;
        state.entryAllowed = false;
        return false;
    }
    state.adminAccess = await getAdminUserAccess(state.user, { forceRefresh });
    state.entryAllowed = state.adminAccess?.allowed === true && canAccessConsoleEntry(state.adminAccess?.row, SALES_ENTRY_KIND);
    return state.entryAllowed;
}

function normalizeAccessiblePage() {
    if (!SALES_PAGE_IDS.has(state.page)) {
        state.page = 'dashboard';
        syncPageToUrl({ clearFlowParams: true });
        return;
    }
    if (ADMIN_ONLY_PAGES.has(state.page) && !isMaintenanceAdmin()) {
        state.page = 'dashboard';
        syncPageToUrl({ clearFlowParams: true });
    }
}

async function renderPage() {
    if (!state.user) {
        state.authView = isPasswordRecoveryMode() ? 'reset' : 'login';
        renderLogin();
        return;
    }
    await refreshAdminAccess(false);
    if (state.adminAccess?.allowed !== true) {
        state.authView = isPasswordRecoveryMode() ? 'reset' : 'login';
        renderLogin();
        return;
    }
    if (!state.entryAllowed) {
        renderEntryDenied();
        return;
    }

    normalizeAccessiblePage();
    renderShell();
    syncPageToUrl();

    try {
        const pageInput = {
            user: state.user,
            entryKind: SALES_ENTRY_KIND,
            adminRow: state.adminAccess?.row || null,
            setPageHeader,
            setContent,
            showToast,
            withButtonBusy,
            rerender: () => renderPage(),
        };

        if (state.page === 'dashboard') await renderQuoteSalesDashboardPage(pageInput);
        else if (state.page === 'quote-customers') await renderQuoteCustomersPage(pageInput);
        else if (state.page === 'quote-pipeline') await renderQuotePipelinePage(pageInput);
        else if (state.page === 'quote-customer-flow') await renderQuoteCustomerFlowPage(pageInput);
        else if (state.page === 'quote-brands') await renderQuoteBrandsPage(pageInput);
        else if (state.page === 'quote-products') await renderQuoteProductsPage(pageInput);
        else if (state.page === 'admin-users') await renderAdminUsersPage(pageInput);
        else if (state.page === 'admin-security') await renderAdminSecurityPage(pageInput);
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
        } else if (!state.user) {
            state.authView = 'login';
            renderLogin();
        } else {
            state.authView = 'login';
            await renderPage();
        }

        onAuthStateChange(async (_event, nextSession) => {
            state.session = nextSession;
            state.user = nextSession?.user || null;
            if (isPasswordRecoveryMode()) {
                state.authView = 'reset';
                renderLogin();
                return;
            }
            if (!state.user) {
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
