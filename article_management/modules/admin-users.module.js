import {
    ADMIN_ROLE_ADMIN,
    ADMIN_ROLE_AFTER_SALES,
    ADMIN_ROLE_EDITOR,
    ADMIN_ROLE_PRE_SALES,
    ADMIN_ROLE_SALES,
    ADMIN_ROLE_SUPER_ADMIN,
    fetchAdminUsers,
    getDisplayName,
    provisionAdminUserAccount,
    saveAdminUserEntry,
    setLinkedinExtensionAccessByEmail,
    sendPasswordResetEmail,
    updateCurrentPassword,
} from './auth.module.js?v=20260419auth04';

let adminUsersCreatePanelExpanded = false;

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

function allowedRoleEntries(input = null) {
    if (input?.entryKind === 'sales') {
        return [
            { value: ADMIN_ROLE_SUPER_ADMIN, label: '\u8d85\u7ea7\u7ba1\u7406\u5458' },
            { value: ADMIN_ROLE_ADMIN, label: '\u7ba1\u7406\u5458' },
            { value: ADMIN_ROLE_PRE_SALES, label: '\u552e\u524d\u8054\u7cfb\u4eba' },
            { value: ADMIN_ROLE_AFTER_SALES, label: '\u552e\u540e\u8054\u7cfb\u4eba' },
            { value: ADMIN_ROLE_SALES, label: '\u9500\u552e' },
        ];
    }
    return [
        { value: ADMIN_ROLE_SUPER_ADMIN, label: '\u8d85\u7ea7\u7ba1\u7406\u5458' },
        { value: ADMIN_ROLE_ADMIN, label: '\u7ba1\u7406\u5458' },
        { value: ADMIN_ROLE_PRE_SALES, label: '\u552e\u524d\u8054\u7cfb\u4eba' },
        { value: ADMIN_ROLE_AFTER_SALES, label: '\u552e\u540e\u8054\u7cfb\u4eba' },
        { value: ADMIN_ROLE_SALES, label: '\u9500\u552e' },
        { value: ADMIN_ROLE_EDITOR, label: '\u5185\u5bb9\u7f16\u8f91' },
    ];
}

function defaultRoleValue(input = null) {
    return input?.entryKind === 'sales' ? ADMIN_ROLE_SALES : ADMIN_ROLE_ADMIN;
}

function roleOptions(selected = ADMIN_ROLE_ADMIN, input = null) {
    const allowed = allowedRoleEntries(input);
    const fallback = selected || defaultRoleValue(input);
    const resolved = allowed.some((item) => item.value === fallback) ? fallback : defaultRoleValue(input);
    return allowed
        .map((item) => `<option value="${item.value}" ${item.value === resolved ? 'selected' : ''}>${item.label}</option>`)
        .join('');
}

export async function renderAdminUsersPage(input) {
    const { user, setPageHeader, setContent, showToast, withButtonBusy } = input;
    const salesConsole = input?.entryKind === 'sales';
    setPageHeader(
        '\u4eba\u5458\u7ba1\u7406',
        salesConsole
            ? '\u4ec5\u7ba1\u7406\u53ef\u7ef4\u62a4\u9500\u552e\u540e\u53f0\u8d26\u53f7\u3001\u542f\u505c\u72b6\u6001\u548c\u89d2\u8272\u5206\u914d\u3002'
            : '\u7ba1\u7406\u540e\u53f0\u4eba\u5458\u540d\u5355\u3001\u89d2\u8272\u6743\u9650\u3001\u8d26\u53f7\u5f00\u901a\u548c\u5bc6\u7801\u627e\u56de\u3002',
    );

    let rows = [];
    let loadError = null;
    try {
        rows = await fetchAdminUsers(false);
    } catch (error) {
        loadError = error;
    }

    setContent(`
        <section class="ams-card ams-admin-users-toolbar-card">
            <div class="ams-section-head ams-section-head-compact ams-admin-users-toolbar-head">
                <div></div>
                <div class="ams-row-actions">
                    <button class="ams-btn ams-btn-primary" type="button" id="ams-admin-users-toggle-create">${adminUsersCreatePanelExpanded ? '\u6536\u8d77\u65b0\u589e' : '\u65b0\u589e\u4eba\u5458'}</button>
                    <button class="ams-btn ams-btn-muted" type="button" id="ams-admin-users-refresh">\u5237\u65b0\u540d\u5355</button>
                </div>
            </div>
            <div id="ams-admin-create-panel" ${adminUsersCreatePanelExpanded ? '' : 'hidden'}>
                <div class="ams-site-field-grid ams-site-field-grid-wide">
                    <div class="ams-field">
                        <label>\u90ae\u7bb1</label>
                        <input id="ams-admin-create-email" class="ams-input" type="email" placeholder="sales@gasgx.com">
                    </div>
                    <div class="ams-field">
                        <label>\u59d3\u540d</label>
                        <input id="ams-admin-create-name" class="ams-input" type="text" placeholder="\u9500\u552e\u8d1f\u8d23\u4eba">
                    </div>
                    <div class="ams-field">
                        <label>\u89d2\u8272</label>
                        <select id="ams-admin-create-role" class="ams-select">${roleOptions(defaultRoleValue(input), input)}</select>
                    </div>
                    <div class="ams-field">
                        <label>\u521d\u59cb\u5bc6\u7801</label>
                        <input id="ams-admin-create-password" class="ams-input" type="password" placeholder="\u81f3\u5c11 8 \u4f4d">
                    </div>
                </div>
                <div class="ams-inline-actions">
                    <label class="ams-social-toggle">
                        <input id="ams-admin-create-active" type="checkbox" checked>
                        <span>\u52a0\u5165\u540e\u53f0\u5141\u8bb8\u540d\u5355</span>
                    </label>
                    <label class="ams-social-toggle">
                        <input id="ams-admin-create-account" type="checkbox" checked>
                        <span>\u540c\u6b65\u521b\u5efa\u767b\u5f55\u8d26\u53f7</span>
                    </label>
                    <button class="ams-btn ams-btn-primary" type="button" id="ams-admin-create-submit">\u6dfb\u52a0\u4eba\u5458</button>
                </div>
                <p class="ams-footnote">\u5982\u679c\u53ea\u52a0\u5165\u540d\u5355\u3001\u4e0d\u521b\u5efa\u8d26\u53f7\uff0c\u5219\u8be5\u90ae\u7bb1\u5fc5\u987b\u5148\u5b58\u5728\u4e8e Supabase Auth \u4e2d\uff0c\u4e4b\u540e\u624d\u80fd\u4f7f\u7528\u201c\u5fd8\u8bb0\u5bc6\u7801\u201d\u627e\u56de\u3002</p>
            </div>
        </section>
        <section class="ams-card">
            <div class="ams-section-head">
                <div>
                    <h3>\u540e\u53f0\u4eba\u5458\u5217\u8868</h3>
                    <p>\u5728\u8fd9\u91cc\u76f4\u63a5\u7ef4\u62a4\u540e\u53f0\u4eba\u5458\u3001\u89d2\u8272\u3001\u542f\u505c\u72b6\u6001\u4e0e\u5bc6\u7801\u91cd\u7f6e\u3002</p>
                </div>
            </div>
            ${
                loadError
                    ? `<div class="ams-empty">\u4eba\u5458\u8868\u5f53\u524d\u4e0d\u53ef\u7528\uff1a${esc(loadError.message || '\u672a\u77e5\u9519\u8bef')}\u3002\u8bf7\u5148\u6267\u884c SQL\uff1aarticle_management/sql/005_admin_users.sql\u3001article_management/sql/026_admin_user_extension_entitlement.sql \u548c article_management/sql/027_set_linkedin_extension_access_rpc.sql\u3002</div>`
                    : `<div class="ams-table-wrap">
                        <table class="ams-table ams-admin-users-table">
                            <thead>
                                <tr>
                                    <th>\u90ae\u7bb1</th>
                                    <th>\u59d3\u540d</th>
                                    <th>\u89d2\u8272</th>
                                    <th>\u72b6\u6001</th>
                                    <th>LinkedIn \u6269\u5c55</th>
                                    <th>\u66f4\u65b0\u65f6\u95f4</th>
                                    <th class="ams-col-actions">\u64cd\u4f5c</th>
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
                                                <div class="ams-admin-user-email-cell">
                                                    <strong>${esc(row.email)}</strong>
                                                </div>
                                            </td>
                                            <td><input class="ams-input" data-admin-name="${esc(row.id)}" value="${esc(row.full_name || '')}" placeholder="\u59d3\u540d"></td>
                                            <td>
                                                <select class="ams-select" data-admin-role="${esc(row.id)}" aria-label="\u89d2\u8272">
                                                    ${roleOptions(row.role, input)}
                                                </select>
                                            </td>
                                            <td><label class="ams-social-toggle ams-admin-user-status-toggle"><input type="checkbox" data-admin-active="${esc(row.id)}" ${row.is_active !== false ? 'checked' : ''}><span>${row.is_active !== false ? '\u542f\u7528' : '\u505c\u7528'}</span></label></td>
                                            <td>
                                                <div class="ams-row-actions ams-admin-user-actions">
                                                    <button
                                                        class="ams-btn ${row.linkedin_extension_enabled ? 'ams-btn-primary' : 'ams-btn-muted'}"
                                                        type="button"
                                                        data-admin-extension-toggle="${esc(row.id)}"
                                                    >${row.linkedin_extension_enabled ? '\u5df2\u5f00\u901a' : '\u5f00\u901a'}</button>
                                                </div>
                                                <div class="ams-footnote">${row.linkedin_extension_enabled ? '\u5df2\u5199\u5165 profiles \u6269\u5c55\u6743\u9650' : '\u6309\u8d26\u53f7\u76f4\u63a5\u5f00\u901a LinkedIn \u6269\u5c55'}</div>
                                            </td>
                                            <td>${esc(fmtDate(row.updated_at || row.created_at))}</td>
                                            <td class="ams-col-actions">
                                                <div class="ams-row-actions ams-admin-user-actions">
                                                    <button class="ams-btn ams-btn-primary" type="button" data-admin-save="${esc(row.id)}">\u4fdd\u5b58</button>
                                                    <button class="ams-btn ams-btn-muted" type="button" data-admin-reset="${esc(row.email)}">\u53d1\u9001\u91cd\u7f6e\u90ae\u4ef6</button>
                                                </div>
                                            </td>
                                        </tr>`,
                                              )
                                              .join('')
                                        : '<tr><td colspan="7"><div class="ams-empty">\u5f53\u524d\u8fd8\u6ca1\u6709\u540e\u53f0\u4eba\u5458\u8bb0\u5f55\u3002</div></td></tr>'
                                }
                            </tbody>
                        </table>
                    </div>`
            }
        </section>
    `);

    document.getElementById('ams-admin-users-toggle-create')?.addEventListener('click', async () => {
        adminUsersCreatePanelExpanded = !adminUsersCreatePanelExpanded;
        await renderAdminUsersPage(input);
    });

    document.getElementById('ams-admin-users-refresh')?.addEventListener('click', async () => {
        await renderAdminUsersPage(input);
    });

    document.getElementById('ams-admin-create-submit')?.addEventListener('click', async (event) => {
        const email = document.getElementById('ams-admin-create-email')?.value || '';
        const fullName = document.getElementById('ams-admin-create-name')?.value || '';
        const role = document.getElementById('ams-admin-create-role')?.value || defaultRoleValue(input);
        const password = document.getElementById('ams-admin-create-password')?.value || '';
        const isActive = Boolean(document.getElementById('ams-admin-create-active')?.checked);
        const createAccount = Boolean(document.getElementById('ams-admin-create-account')?.checked);

        await withButtonBusy(event.currentTarget, '\u63d0\u4ea4\u4e2d...', async () => {
            try {
                let provisionedUserId = '';
                if (createAccount) {
                    const provisioned = await provisionAdminUserAccount({ email, password, fullName });
                    provisionedUserId = String(provisioned?.user?.id || '').trim();
                }
                await saveAdminUserEntry(
                    {
                        email,
                        full_name: fullName,
                        role,
                        is_active: isActive,
                        auth_user_id: provisionedUserId,
                        linkedin_extension_enabled: false,
                    },
                    user?.id || null,
                );
                adminUsersCreatePanelExpanded = false;
                showToast(createAccount ? '\u540e\u53f0\u4eba\u5458\u5df2\u6dfb\u52a0\uff0c\u5e76\u5df2\u521b\u5efa\u767b\u5f55\u8d26\u53f7\u3002' : '\u540e\u53f0\u4eba\u5458\u5df2\u52a0\u5165\u5141\u8bb8\u540d\u5355\u3002');
                await renderAdminUsersPage(input);
            } catch (error) {
                showToast(error.message || '\u65b0\u589e\u540e\u53f0\u4eba\u5458\u5931\u8d25\u3002', true);
            }
        });
    });

    document.querySelectorAll('[data-admin-save]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = String(button.dataset.adminSave || '').trim();
            const row = rows.find((item) => item.id === id);
            if (!row) return;
            const fullName = document.querySelector(`[data-admin-name="${id}"]`)?.value || '';
            const role = document.querySelector(`[data-admin-role="${id}"]`)?.value || defaultRoleValue(input);
            const isActive = Boolean(document.querySelector(`[data-admin-active="${id}"]`)?.checked);

            await withButtonBusy(button, '\u4fdd\u5b58\u4e2d...', async () => {
                try {
                    await saveAdminUserEntry(
                        {
                            id,
                            email: row.email,
                            full_name: fullName,
                            role,
                            is_active: isActive,
                            auth_user_id: row.auth_user_id || '',
                            linkedin_extension_enabled: row.linkedin_extension_enabled === true,
                        },
                        user?.id || null,
                    );
                    showToast('\u4eba\u5458\u4fe1\u606f\u5df2\u66f4\u65b0\u3002');
                    await renderAdminUsersPage(input);
                } catch (error) {
                    showToast(error.message || '\u4fdd\u5b58\u4eba\u5458\u4fe1\u606f\u5931\u8d25\u3002', true);
                }
            });
        });
    });

    document.querySelectorAll('[data-admin-extension-toggle]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = String(button.dataset.adminExtensionToggle || '').trim();
            const row = rows.find((item) => item.id === id);
            if (!row) return;

            await withButtonBusy(button, row.linkedin_extension_enabled ? '\u5173\u95ed\u4e2d...' : '\u5f00\u901a\u4e2d...', async () => {
                try {
                    await setLinkedinExtensionAccessByEmail(row.email, row.linkedin_extension_enabled !== true, user?.id || null);
                    showToast(row.linkedin_extension_enabled ? '\u5df2\u5173\u95ed LinkedIn \u6269\u5c55\u6743\u9650\u3002' : '\u5df2\u5f00\u901a LinkedIn \u6269\u5c55\u6743\u9650\u3002');
                    await renderAdminUsersPage(input);
                } catch (error) {
                    showToast(error.message || '\u66f4\u65b0 LinkedIn \u6269\u5c55\u6743\u9650\u5931\u8d25\u3002', true);
                }
            });
        });
    });

    document.querySelectorAll('[data-admin-reset]').forEach((button) => {
        button.addEventListener('click', async () => {
            const email = String(button.dataset.adminReset || '').trim();
            if (!email) return;

            await withButtonBusy(button, '\u53d1\u9001\u4e2d...', async () => {
                try {
                    await sendPasswordResetEmail(email);
                    showToast(`\u5df2\u5411 ${email} \u53d1\u9001\u91cd\u7f6e\u5bc6\u7801\u90ae\u4ef6\u3002`);
                } catch (error) {
                    showToast(error.message || '\u53d1\u9001\u91cd\u7f6e\u5bc6\u7801\u90ae\u4ef6\u5931\u8d25\u3002', true);
                }
            });
        });
    });
}

export async function renderAdminSecurityPage(input) {
    const { user, setPageHeader, setContent, showToast, withButtonBusy } = input;
    const email = String(user?.email || '').trim();
    setPageHeader('\u8d26\u53f7\u5b89\u5168', '\u4fee\u6539\u5f53\u524d\u8d26\u53f7\u5bc6\u7801\uff0c\u6216\u91cd\u65b0\u53d1\u9001\u5bc6\u7801\u91cd\u7f6e\u90ae\u4ef6\u3002');

    setContent(`
        <section class="ams-card">
            <div class="ams-section-head">
                <div>
                    <h3>\u5f53\u524d\u8d26\u53f7</h3>
                    <p>\u90ae\u7bb1\uff1a${esc(email || '--')}</p>
                </div>
            </div>
            <div class="ams-site-field-grid">
                <div class="ams-field">
                    <label>\u663e\u793a\u540d\u79f0</label>
                    <input class="ams-input" value="${esc(getDisplayName(user))}" disabled>
                </div>
                <div class="ams-field">
                    <label>\u767b\u5f55\u90ae\u7bb1</label>
                    <input class="ams-input" value="${esc(email || '')}" disabled>
                </div>
            </div>
        </section>
        <section class="ams-card">
            <div class="ams-section-head">
                <div>
                    <h3>\u4fee\u6539\u5bc6\u7801</h3>
                    <p>\u5f53\u524d\u5df2\u767b\u5f55\u65f6\u53ef\u76f4\u63a5\u66f4\u65b0\u5bc6\u7801\uff0c\u65e0\u9700\u518d\u8f93\u5165\u65e7\u5bc6\u7801\u3002</p>
                </div>
            </div>
            <form id="ams-security-password-form" class="ams-form">
                <div class="ams-site-field-grid">
                    <div class="ams-field">
                        <label>\u65b0\u5bc6\u7801</label>
                        <input id="ams-security-password" class="ams-input" type="password" placeholder="\u81f3\u5c11 8 \u4f4d">
                    </div>
                    <div class="ams-field">
                        <label>\u786e\u8ba4\u65b0\u5bc6\u7801</label>
                        <input id="ams-security-password-confirm" class="ams-input" type="password" placeholder="\u518d\u6b21\u8f93\u5165\u65b0\u5bc6\u7801">
                    </div>
                </div>
                <div class="ams-inline-actions">
                    <button class="ams-btn ams-btn-primary" type="submit">\u66f4\u65b0\u5bc6\u7801</button>
                    <button class="ams-btn ams-btn-muted" type="button" id="ams-security-reset-mail">\u53d1\u9001\u91cd\u7f6e\u90ae\u4ef6</button>
                </div>
            </form>
        </section>
    `);

    document.getElementById('ams-security-password-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nextPassword = document.getElementById('ams-security-password')?.value || '';
        const confirmPassword = document.getElementById('ams-security-password-confirm')?.value || '';
        const submitButton = event.submitter || event.currentTarget?.querySelector('button[type="submit"]');

        await withButtonBusy(submitButton, '\u66f4\u65b0\u4e2d...', async () => {
            try {
                if (nextPassword !== confirmPassword) throw new Error('\u4e24\u6b21\u8f93\u5165\u7684\u65b0\u5bc6\u7801\u4e0d\u4e00\u81f4\u3002');
                await updateCurrentPassword(nextPassword);
                showToast('\u5bc6\u7801\u5df2\u66f4\u65b0\u3002');
                const passwordInput = document.getElementById('ams-security-password');
                const confirmInput = document.getElementById('ams-security-password-confirm');
                if (passwordInput) passwordInput.value = '';
                if (confirmInput) confirmInput.value = '';
            } catch (error) {
                showToast(error.message || '\u4fee\u6539\u5bc6\u7801\u5931\u8d25\u3002', true);
            }
        });
    });

    document.getElementById('ams-security-reset-mail')?.addEventListener('click', async (event) => {
        await withButtonBusy(event.currentTarget, '\u53d1\u9001\u4e2d...', async () => {
            try {
                await sendPasswordResetEmail(email);
                showToast('\u91cd\u7f6e\u5bc6\u7801\u90ae\u4ef6\u5df2\u53d1\u9001\u3002');
            } catch (error) {
                showToast(error.message || '\u53d1\u9001\u91cd\u7f6e\u5bc6\u7801\u90ae\u4ef6\u5931\u8d25\u3002', true);
            }
        });
    });
}
