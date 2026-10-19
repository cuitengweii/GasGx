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
} from './auth.module.js?v=20260419auth05';
import {
    ADMIN_ENTRY_KIND,
    SALES_ENTRY_KIND,
    adminConsoleUrl,
} from './admin-entry.module.js';
import {
    renderAdminSecurityPage,
    renderAdminUsersPage,
} from './admin-users.module.js?v=20260327sales03';
import {
    renderQuoteBrandsPage,
    renderQuoteCustomerFlowPage,
    renderQuoteCustomersPage,
    renderQuotePipelinePage,
    renderQuoteProductsPage,
    renderQuoteSalesDashboardPage,
} from './quote-system.module.js?v=20260420quote63';

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
    renderedUserId: null,
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

function loadingPanelMarkup(message = '正在加载销售数据...', detail = '页面可能需要几秒，请稍候。') {
    return `
        <section class="ams-loading-panel" aria-live="polite" aria-busy="true">
            <div class="ams-loading-panel-head">
                <span class="ams-loading-panel-dot"></span>
                <strong>${esc(message)}</strong>
            </div>
            <p>${esc(detail)}</p>
            <div class="ams-loading-panel-skeleton">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </section>
    `;
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
    const shouldShowBusyToast = /(\u4fdd\u5b58|\u66f4\u65b0|\u521b\u5efa|\u63d0\u4ea4|\u53d1\u5e03|\u786e\u8ba4|\u63a8\u8fdb|\u751f\u6210)/.test(String(busyText || ''));
    if (shouldShowBusyToast) {
        showToast(busyText || '处理中...', false, { prominent: true, busy: true, persist: true });
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
            button.disabled = previousDisabled;
            button.textContent = previousText;
        }
    }
}

function setPageHeader(title, sub) {
    const compactCustomerFlow = state.page === 'quote-customer-flow';
    const titleNode = document.getElementById('ams-page-title');
    const subNode = document.getElementById('ams-page-sub');
    if (titleNode) titleNode.textContent = compactCustomerFlow ? '' : title;
    if (subNode) subNode.textContent = compactCustomerFlow ? '' : sub;
}

function setContent(html) {
    const content = document.getElementById('ams-content');
    if (content) content.innerHTML = html;
    normalizeQuoteCustomerFlowUi();
}

function normalizeQuoteCustomerFlowUi() {
    const compactCustomerFlow = state.page === 'quote-customer-flow';
    document.body.classList.toggle('ams-customer-flow-focus', compactCustomerFlow);
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

function bindShellEvents() {
    document.querySelectorAll('.ams-nav-btn').forEach((button) => {
        if (button.dataset.bound === '1') return;
        button.dataset.bound = '1';
        button.addEventListener('click', () => {
            state.page = button.dataset.page || 'dashboard';
            syncPageToUrl({ clearFlowParams: true });
            void renderPage();
        });
    });
}

function updateShellState() {
    document.querySelectorAll('.ams-nav-btn').forEach((button) => {
        button.classList.toggle('active', navIsActive(button.dataset.page || ''));
    });
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
    if (root.querySelector('.ams-app-sales')) {
        updateShellState();
        return;
    }
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
                <div class="ams-sidebar-footer">
                    <details class="ams-sidebar-user-menu">
                        <summary class="ams-sidebar-user-badge" data-shell-user-badge>
                            <span class="ams-sidebar-user-main"><i class="fa-solid fa-user"></i> <strong>${displayName}</strong></span>
                            <i class="fa-solid fa-chevron-up ams-sidebar-user-caret"></i>
                        </summary>
                        <div class="ams-sidebar-user-panel">
                            <div class="ams-sidebar-user-panel-head">
                                <span class="ams-sidebar-user-panel-kicker">Account</span>
                                <strong>${displayName}</strong>
                            </div>
                            <button id="ams-open-security" class="ams-sidebar-user-item" type="button">
                                <i class="fa-solid fa-shield-halved"></i>
                                <span>账号安全</span>
                            </button>
                            ${canOpenAdmin ? `<a class="ams-sidebar-user-item" href="${esc(adminConsoleUrl('dashboard', {}, { entryKind: ADMIN_ENTRY_KIND }))}"><i class="fa-solid fa-up-right-from-square"></i><span>进入主站后台</span></a>` : ''}
                            <button id="ams-signout" class="ams-sidebar-user-item is-danger" type="button">
                                <i class="fa-solid fa-right-from-bracket"></i>
                                <span>退出登录</span>
                            </button>
                        </div>
                    </details>
                </div>
            </aside>
            <main class="ams-main">
                <section id="ams-content" class="ams-content">${loadingPanelMarkup()}</section>
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

    bindShellEvents();
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

async function renderPage() {
    if (!state.user) {
        state.renderedUserId = null;
        state.authView = isPasswordRecoveryMode() ? 'reset' : 'login';
        renderLogin();
        return;
    }
    await refreshAdminAccess(false);
    if (state.adminAccess?.allowed !== true) {
        state.renderedUserId = null;
        state.authView = isPasswordRecoveryMode() ? 'reset' : 'login';
        renderLogin();
        return;
    }
    if (!state.entryAllowed) {
        state.renderedUserId = state.user?.id || null;
        renderEntryDenied();
        return;
    }

    normalizeAccessiblePage();
    renderShell();
    state.renderedUserId = state.user?.id || null;
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

        const delayedLoadingTimer = window.setTimeout(() => {
            setContent(loadingPanelMarkup('销售总览整理中', '正在准备当前页面所需的客户、流程和报价数据。'));
        }, 180);

        try {
            if (state.page === 'dashboard') await renderQuoteSalesDashboardPage(pageInput);
            else if (state.page === 'quote-customers') await renderQuoteCustomersPage(pageInput);
            else if (state.page === 'quote-pipeline') await renderQuotePipelinePage(pageInput);
            else if (state.page === 'quote-customer-flow') await renderQuoteCustomerFlowPage(pageInput);
            else if (state.page === 'quote-brands') await renderQuoteBrandsPage(pageInput);
            else if (state.page === 'quote-products') await renderQuoteProductsPage(pageInput);
            else if (state.page === 'admin-users') await renderAdminUsersPage(pageInput);
            else if (state.page === 'admin-security') await renderAdminSecurityPage(pageInput);
            else setContent('<div class="ams-empty">未知页面。</div>');
        } finally {
            window.clearTimeout(delayedLoadingTimer);
        }
    } catch (error) {
        console.error(error);
        setContent(`<div class="ams-empty">${esc(error.message || '页面渲染失败。')}</div>`);
    }
}

async function boot() {
    const bootFallbackTimer = window.setTimeout(() => {
        if (state.user || root.querySelector('#ams-login-form, .ams-app-sales, .ams-auth-card')) return;
        state.authView = isPasswordRecoveryMode() ? 'reset' : 'login';
        renderLogin();
    }, 1200);
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

        onAuthStateChange(async (event, nextSession) => {
            state.session = nextSession;
            state.user = nextSession?.user || null;
            if (shouldIgnoreAuthRender(event, nextSession)) return;
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
    } finally {
        window.clearTimeout(bootFallbackTimer);
    }
}

boot();
