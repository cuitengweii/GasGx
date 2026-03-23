import {
    ADMIN_ROLE_ADMIN,
    ADMIN_ROLE_EDITOR,
    ADMIN_ROLE_SALES,
    ADMIN_ROLE_SUPER_ADMIN,
    fetchAdminUsers,
    getDisplayName,
    provisionAdminUserAccount,
    saveAdminUserEntry,
    sendPasswordResetEmail,
    updateCurrentPassword,
} from './auth.module.js?v=20260321admin01';

function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function fmtDate(value) {
    const date = new Date(value || '');
    if (Number.isNaN(date.getTime())) return '--';
    return date.toISOString().slice(0, 16).replace('T', ' ');
}

function roleLabel(value) {
    const role = String(value || ADMIN_ROLE_ADMIN).trim();
    if (role === ADMIN_ROLE_SUPER_ADMIN) return '超级管理员';
    if (role === ADMIN_ROLE_EDITOR) return '内容编辑';
    if (role === ADMIN_ROLE_SALES) return '销售';
    return '管理员';
}

function roleOptions(selected = ADMIN_ROLE_ADMIN) {
    return [
        { value: ADMIN_ROLE_SUPER_ADMIN, label: '超级管理员' },
        { value: ADMIN_ROLE_ADMIN, label: '管理员' },
        { value: ADMIN_ROLE_SALES, label: '销售' },
        { value: ADMIN_ROLE_EDITOR, label: '内容编辑' },
    ]
        .map((item) => `<option value="${item.value}" ${item.value === selected ? 'selected' : ''}>${item.label}</option>`)
        .join('');
}

export async function renderAdminUsersPage(input) {
    const { user, setPageHeader, setContent, showToast, withButtonBusy } = input;
    setPageHeader('人员管理', '管理后台人员名单、角色权限、账号开通和密码找回。');

    let rows = [];
    let loadError = null;
    try {
        rows = await fetchAdminUsers(false);
    } catch (error) {
        loadError = error;
    }

    setContent(`
        <section class="ams-card">
            <div class="ams-section-head">
                <div>
                    <h3>新增后台人员</h3>
                    <p>先把人员加入后台 allowlist；如需直接开通账号，可同时填写初始密码创建 Supabase Auth 账号。</p>
                </div>
                <div class="ams-row-actions">
                    <button class="ams-btn ams-btn-muted" type="button" id="ams-admin-users-refresh">刷新名单</button>
                </div>
            </div>
            <div class="ams-site-field-grid ams-site-field-grid-wide">
                <div class="ams-field">
                    <label>邮箱</label>
                    <input id="ams-admin-create-email" class="ams-input" type="email" placeholder="admin@gasgx.com">
                </div>
                <div class="ams-field">
                    <label>姓名</label>
                    <input id="ams-admin-create-name" class="ams-input" type="text" placeholder="运营负责人">
                </div>
                <div class="ams-field">
                    <label>角色</label>
                    <select id="ams-admin-create-role" class="ams-select">${roleOptions(ADMIN_ROLE_ADMIN)}</select>
                </div>
                <div class="ams-field">
                    <label>初始密码</label>
                    <input id="ams-admin-create-password" class="ams-input" type="password" placeholder="至少 8 位">
                </div>
            </div>
            <div class="ams-inline-actions">
                <label class="ams-social-toggle">
                    <input id="ams-admin-create-active" type="checkbox" checked>
                    <span>加入后台允许名单</span>
                </label>
                <label class="ams-social-toggle">
                    <input id="ams-admin-create-account" type="checkbox" checked>
                    <span>同步创建登录账号</span>
                </label>
                <button class="ams-btn ams-btn-primary" type="button" id="ams-admin-create-submit">添加人员</button>
            </div>
            <p class="ams-footnote">如果只加入名单、不创建账号，则该邮箱必须先在 Supabase Auth 中存在，之后才能使用“忘记密码”找回。</p>
        </section>
        <section class="ams-card">
            <div class="ams-section-head">
                <div>
                    <h3>后台人员列表</h3>
                    <p>当前登录人：${esc(getDisplayName(user))}</p>
                </div>
            </div>
            ${
                loadError
                    ? `<div class="ams-empty">人员表当前不可用：${esc(loadError.message || '未知错误')}。请先执行 SQL：article_management/sql/005_admin_users.sql。</div>`
                    : `<div class="ams-table-wrap">
                        <table class="ams-table ams-admin-users-table">
                            <thead>
                                <tr>
                                    <th>邮箱</th>
                                    <th>姓名</th>
                                    <th>角色</th>
                                    <th>状态</th>
                                    <th>更新时间</th>
                                    <th class="ams-col-actions">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${
                                    rows.length
                                        ? rows
                                              .map(
                                                  (row) => `
                                        <tr data-admin-row="${esc(row.id)}">
                                            <td>
                                                <div class="ams-article-cell">
                                                    <strong>${esc(row.email)}</strong>
                                                    <span class="ams-footnote">${row.email === String(user?.email || '').trim().toLowerCase() ? '当前登录账号' : '--'}</span>
                                                </div>
                                            </td>
                                            <td><input class="ams-input" data-admin-name="${esc(row.id)}" value="${esc(row.full_name || '')}" placeholder="姓名"></td>
                                            <td>
                                                <select class="ams-select" data-admin-role="${esc(row.id)}" aria-label="角色">
                                                    ${roleOptions(row.role)}
                                                </select>
                                                <div class="ams-footnote">${esc(roleLabel(row.role))}</div>
                                            </td>
                                            <td><label class="ams-social-toggle"><input type="checkbox" data-admin-active="${esc(row.id)}" ${row.is_active !== false ? 'checked' : ''}><span>${row.is_active !== false ? '启用' : '停用'}</span></label></td>
                                            <td>${esc(fmtDate(row.updated_at || row.created_at))}</td>
                                            <td class="ams-col-actions">
                                                <div class="ams-row-actions">
                                                    <button class="ams-btn ams-btn-primary" type="button" data-admin-save="${esc(row.id)}">保存</button>
                                                    <button class="ams-btn ams-btn-muted" type="button" data-admin-reset="${esc(row.email)}">发送重置邮件</button>
                                                </div>
                                            </td>
                                        </tr>`,
                                              )
                                              .join('')
                                        : '<tr><td colspan="6"><div class="ams-empty">当前还没有后台人员记录。</div></td></tr>'
                                }
                            </tbody>
                        </table>
                    </div>`
            }
        </section>
    `);

    document.getElementById('ams-admin-users-refresh')?.addEventListener('click', async () => {
        await renderAdminUsersPage(input);
    });

    document.getElementById('ams-admin-create-submit')?.addEventListener('click', async (event) => {
        const email = document.getElementById('ams-admin-create-email')?.value || '';
        const fullName = document.getElementById('ams-admin-create-name')?.value || '';
        const role = document.getElementById('ams-admin-create-role')?.value || ADMIN_ROLE_ADMIN;
        const password = document.getElementById('ams-admin-create-password')?.value || '';
        const isActive = Boolean(document.getElementById('ams-admin-create-active')?.checked);
        const createAccount = Boolean(document.getElementById('ams-admin-create-account')?.checked);

        await withButtonBusy(event.currentTarget, '提交中...', async () => {
            try {
                if (createAccount) {
                    await provisionAdminUserAccount({ email, password, fullName });
                }
                await saveAdminUserEntry(
                    {
                        email,
                        full_name: fullName,
                        role,
                        is_active: isActive,
                    },
                    user?.id || null,
                );
                showToast(createAccount ? '后台人员已添加，并已创建登录账号。' : '后台人员已加入允许名单。');
                await renderAdminUsersPage(input);
            } catch (error) {
                showToast(error.message || '新增后台人员失败。', true);
            }
        });
    });

    document.querySelectorAll('[data-admin-save]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = String(button.dataset.adminSave || '').trim();
            const row = rows.find((item) => item.id === id);
            if (!row) return;
            const fullName = document.querySelector(`[data-admin-name="${id}"]`)?.value || '';
            const role = document.querySelector(`[data-admin-role="${id}"]`)?.value || ADMIN_ROLE_ADMIN;
            const isActive = Boolean(document.querySelector(`[data-admin-active="${id}"]`)?.checked);

            await withButtonBusy(button, '保存中...', async () => {
                try {
                    await saveAdminUserEntry(
                        {
                            id,
                            email: row.email,
                            full_name: fullName,
                            role,
                            is_active: isActive,
                        },
                        user?.id || null,
                    );
                    showToast('人员信息已更新。');
                    await renderAdminUsersPage(input);
                } catch (error) {
                    showToast(error.message || '保存人员信息失败。', true);
                }
            });
        });
    });

    document.querySelectorAll('[data-admin-reset]').forEach((button) => {
        button.addEventListener('click', async () => {
            const email = String(button.dataset.adminReset || '').trim();
            if (!email) return;

            await withButtonBusy(button, '发送中...', async () => {
                try {
                    await sendPasswordResetEmail(email);
                    showToast(`已向 ${email} 发送重置密码邮件。`);
                } catch (error) {
                    showToast(error.message || '发送重置密码邮件失败。', true);
                }
            });
        });
    });
}

export async function renderAdminSecurityPage(input) {
    const { user, setPageHeader, setContent, showToast, withButtonBusy } = input;
    const email = String(user?.email || '').trim();
    setPageHeader('账号安全', '修改当前管理员密码，或重新发送密码重置邮件。');

    setContent(`
        <section class="ams-card">
            <div class="ams-section-head">
                <div>
                    <h3>当前账号</h3>
                    <p>邮箱：${esc(email || '--')}</p>
                </div>
            </div>
            <div class="ams-site-field-grid">
                <div class="ams-field">
                    <label>显示名称</label>
                    <input class="ams-input" value="${esc(getDisplayName(user))}" disabled>
                </div>
                <div class="ams-field">
                    <label>登录邮箱</label>
                    <input class="ams-input" value="${esc(email || '')}" disabled>
                </div>
            </div>
        </section>
        <section class="ams-card">
            <div class="ams-section-head">
                <div>
                    <h3>修改密码</h3>
                    <p>当前已登录时可直接修改密码，无需再输入旧密码。</p>
                </div>
            </div>
            <form id="ams-security-password-form" class="ams-form">
                <div class="ams-site-field-grid">
                    <div class="ams-field">
                        <label>新密码</label>
                        <input id="ams-security-password" class="ams-input" type="password" placeholder="至少 8 位">
                    </div>
                    <div class="ams-field">
                        <label>确认新密码</label>
                        <input id="ams-security-password-confirm" class="ams-input" type="password" placeholder="再次输入新密码">
                    </div>
                </div>
                <div class="ams-inline-actions">
                    <button class="ams-btn ams-btn-primary" type="submit">更新密码</button>
                    <button class="ams-btn ams-btn-muted" type="button" id="ams-security-reset-mail">发送重置邮件</button>
                </div>
            </form>
        </section>
    `);

    document.getElementById('ams-security-password-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nextPassword = document.getElementById('ams-security-password')?.value || '';
        const confirmPassword = document.getElementById('ams-security-password-confirm')?.value || '';
        const submitButton = event.submitter || event.currentTarget?.querySelector('button[type="submit"]');

        await withButtonBusy(submitButton, '更新中...', async () => {
            try {
                if (nextPassword !== confirmPassword) throw new Error('两次输入的新密码不一致。');
                await updateCurrentPassword(nextPassword);
                showToast('密码已更新。');
                const passwordInput = document.getElementById('ams-security-password');
                const confirmInput = document.getElementById('ams-security-password-confirm');
                if (passwordInput) passwordInput.value = '';
                if (confirmInput) confirmInput.value = '';
            } catch (error) {
                showToast(error.message || '修改密码失败。', true);
            }
        });
    });

    document.getElementById('ams-security-reset-mail')?.addEventListener('click', async (event) => {
        await withButtonBusy(event.currentTarget, '发送中...', async () => {
            try {
                await sendPasswordResetEmail(email);
                showToast('重置密码邮件已发送。');
            } catch (error) {
                showToast(error.message || '发送重置密码邮件失败。', true);
            }
        });
    });
}
