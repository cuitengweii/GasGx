import { client, ADMIN_EMAILS } from './supabase.client.js';

function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}

export function isAdminEmail(email) {
    const normalized = normalizeEmail(email);
    return ADMIN_EMAILS.some((item) => normalizeEmail(item) === normalized);
}

export function isAdminUser(user) {
    return Boolean(user && isAdminEmail(user.email));
}

export function getDisplayName(user) {
    if (!user) return '访客';
    const metadata = user.user_metadata || {};
    const fullName = String(metadata.full_name || '').trim();
    if (fullName) return fullName;
    const email = String(user.email || '').trim();
    if (email.includes('@')) return email.split('@')[0];
    return email || '未知用户';
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
            throw new Error('Email not confirmed. 请到 Supabase Auth 用户列表把该账号标记为 Confirmed，或关闭邮箱确认后重试。');
        }
        throw error;
    }

    if (!isAdminUser(data?.user)) {
        await client.auth.signOut();
        throw new Error('当前账号不在管理员白名单中。');
    }

    return data;
}

export async function signOut() {
    const { error } = await client.auth.signOut();
    if (error) throw error;
}

export function onAuthStateChange(handler) {
    return client.auth.onAuthStateChange((_event, session) => {
        handler(session || null);
    });
}
