import { ADMIN_EMAILS, SUPABASE_KEY, SUPABASE_URL, client } from './supabase.client.js?v=20260321admin01';

const ADMIN_USERS_TABLE = 'admin_users';

const adminDirectoryCache = {
    rows: null,
    loaded: false,
    source: 'static',
};

function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}

function normalizeAdminRow(row = {}) {
    return {
        id: row.id || '',
        email: normalizeEmail(row.email),
        full_name: String(row.full_name || '').trim(),
        role: String(row.role || 'admin').trim() || 'admin',
        is_active: row.is_active !== false,
        created_at: row.created_at || '',
        updated_at: row.updated_at || '',
    };
}

function buildStaticAdminRows() {
    return ADMIN_EMAILS.map((email) => ({
        id: `static:${normalizeEmail(email)}`,
        email: normalizeEmail(email),
        full_name: '',
        role: 'super_admin',
        is_active: true,
        created_at: '',
        updated_at: '',
    }));
}

function shouldFallbackToStatic(error) {
    const text = String(error?.message || '').toLowerCase();
    return text.includes('relation') || text.includes('does not exist') || text.includes('permission denied') || text.includes('rls') || text.includes('infinite recursion');
}

function getRecoveryRedirectUrl() {
    if (typeof window === 'undefined' || !window.location) return undefined;
    return `${window.location.origin}/article_management/index.html?mode=reset-password`;
}

function createProvisionClient() {
    const createClient = globalThis.supabase?.createClient;
    if (typeof createClient !== 'function') throw new Error('Supabase SDK 尚未加载，无法创建新账号。');
    return createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
    });
}

export function invalidateAdminUsersCache() {
    adminDirectoryCache.rows = null;
    adminDirectoryCache.loaded = false;
    adminDirectoryCache.source = 'static';
}

export async function fetchAdminUsers(forceRefresh = false) {
    if (!forceRefresh && adminDirectoryCache.loaded && Array.isArray(adminDirectoryCache.rows)) {
        return adminDirectoryCache.rows;
    }

    const { data, error } = await client
        .from(ADMIN_USERS_TABLE)
        .select('id, email, full_name, role, is_active, created_at, updated_at')
        .order('created_at', { ascending: true });

    if (error) throw error;

    adminDirectoryCache.rows = Array.isArray(data) ? data.map(normalizeAdminRow) : [];
    adminDirectoryCache.loaded = true;
    adminDirectoryCache.source = 'supabase';
    return adminDirectoryCache.rows;
}

export async function getAdminUserAccess(user, options = {}) {
    const email = normalizeEmail(user?.email);
    if (!email) return { allowed: false, row: null, source: 'none' };
    const staticRow = buildStaticAdminRows().find((item) => item.email === email) || null;

    try {
        const rows = await fetchAdminUsers(options.forceRefresh === true);
        const row = rows.find((item) => item.email === email && item.is_active !== false) || null;
        if (row) return { allowed: true, row, source: 'supabase' };
        if (staticRow) return { allowed: true, row: staticRow, source: 'static-legacy' };
        return { allowed: false, row: null, source: 'supabase' };
    } catch (error) {
        if (!shouldFallbackToStatic(error)) throw error;
        return { allowed: Boolean(staticRow), row: staticRow, source: 'static-fallback' };
    }
}

export async function isAdminUser(user, options = {}) {
    const access = await getAdminUserAccess(user, options);
    return access.allowed === true;
}

export function getDisplayName(user, adminRow = null) {
    if (adminRow?.full_name) return adminRow.full_name;
    if (!user) return '访客';
    const metadata = user.user_metadata || {};
    const fullName = String(metadata.full_name || '').trim();
    if (fullName) return fullName;
    const email = String(user.email || '').trim();
    if (email.includes('@')) return email.split('@')[0];
    return email || '未知用户';
}

export async function assertAdminUser(user, options = {}) {
    const access = await getAdminUserAccess(user, options);
    if (!access.allowed) throw new Error('当前账号不在后台人员名单中。');
    return access;
}

export async function getCurrentSession() {
    const {
        data: { session },
        error,
    } = await client.auth.getSession();
    if (error) throw error;
    return session || null;
}

export async function signInWithPassword(email, password) {
    const normalized = normalizeEmail(email);
    if (!normalized || !password) throw new Error('邮箱和密码不能为空。');

    const { data, error } = await client.auth.signInWithPassword({ email: normalized, password });
    if (error) {
        const raw = String(error.message || '');
        const lowered = raw.toLowerCase();
        if (lowered.includes('email not confirmed')) {
            throw new Error('账号邮箱尚未确认，请先完成邮箱确认后再登录。');
        }
        throw error;
    }

    try {
        await assertAdminUser(data?.user, { forceRefresh: true });
    } catch (error) {
        await client.auth.signOut();
        throw error;
    }

    return data;
}

export async function sendPasswordResetEmail(email) {
    const normalized = normalizeEmail(email);
    if (!normalized) throw new Error('请输入邮箱。');

    const { error } = await client.auth.resetPasswordForEmail(normalized, {
        redirectTo: getRecoveryRedirectUrl(),
    });
    if (error) throw error;
    return true;
}

export function isPasswordRecoveryMode() {
    if (typeof window === 'undefined' || !window.location) return false;
    const text = `${window.location.search || ''} ${window.location.hash || ''}`.toLowerCase();
    return text.includes('type=recovery') || text.includes('mode=reset-password') || text.includes('access_token=');
}

export function clearPasswordRecoveryUrl() {
    if (typeof window === 'undefined' || !window.location || !window.history?.replaceState) return;
    const url = new URL(window.location.href);
    url.hash = '';
    url.searchParams.delete('mode');
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}`);
}

export async function updateCurrentPassword(nextPassword) {
    const password = String(nextPassword || '').trim();
    if (!password) throw new Error('请输入新密码。');
    if (password.length < 8) throw new Error('新密码至少需要 8 位。');

    const { error } = await client.auth.updateUser({ password });
    if (error) throw error;
    return true;
}

export async function provisionAdminUserAccount({ email, password, fullName = '' } = {}) {
    const normalized = normalizeEmail(email);
    const cleanPassword = String(password || '');
    if (!normalized) throw new Error('请输入人员邮箱。');
    if (!cleanPassword || cleanPassword.length < 8) throw new Error('初始密码至少需要 8 位。');

    const provisionClient = createProvisionClient();
    const { data, error } = await provisionClient.auth.signUp({
        email: normalized,
        password: cleanPassword,
        options: {
            data: fullName ? { full_name: String(fullName).trim() } : undefined,
            emailRedirectTo: getRecoveryRedirectUrl(),
        },
    });
    if (error) throw error;
    return data;
}

export async function saveAdminUserEntry({ id = '', email, full_name = '', role = 'admin', is_active = true } = {}, actorId = null) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) throw new Error('人员邮箱不能为空。');

    const payload = {
        email: normalizedEmail,
        full_name: String(full_name || '').trim(),
        role: String(role || 'admin').trim() || 'admin',
        is_active: is_active !== false,
        updated_by: actorId || null,
    };
    if (id) payload.id = id;
    if (!id) payload.created_by = actorId || null;

    const { data, error } = await client
        .from(ADMIN_USERS_TABLE)
        .upsert(payload, { onConflict: 'email' })
        .select('id, email, full_name, role, is_active, created_at, updated_at')
        .single();

    if (error) throw error;
    invalidateAdminUsersCache();
    return normalizeAdminRow(data);
}

export async function setAdminUserActive(id, isActive, actorId = null) {
    if (!id) throw new Error('缺少人员记录 ID。');
    const { data, error } = await client
        .from(ADMIN_USERS_TABLE)
        .update({
            is_active: isActive === true,
            updated_by: actorId || null,
        })
        .eq('id', id)
        .select('id, email, full_name, role, is_active, created_at, updated_at')
        .single();

    if (error) throw error;
    invalidateAdminUsersCache();
    return normalizeAdminRow(data);
}

export async function signOut() {
    const { error } = await client.auth.signOut();
    if (error) throw error;
}

export function onAuthStateChange(handler) {
    return client.auth.onAuthStateChange((event, session) => {
        handler(event, session || null);
    });
}
