import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
};

type TelegramLoginUser = {
    id?: number | string;
    first_name?: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date?: number | string;
    hash?: string;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: corsHeaders,
    });
}

function bytesToHex(bytes: ArrayBuffer) {
    return Array.from(new Uint8Array(bytes))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}

function normalizeTelegramUser(input: unknown): TelegramLoginUser {
    if (!input || typeof input !== 'object') return {};
    const user = input as TelegramLoginUser;
    return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url,
        auth_date: user.auth_date,
        hash: user.hash,
    };
}

function buildTelegramDataCheckString(user: TelegramLoginUser) {
    return Object.entries(user)
        .filter(([key, value]) => key !== 'hash' && value !== undefined && value !== null && String(value) !== '')
        .map(([key, value]) => `${key}=${String(value)}`)
        .sort()
        .join('\n');
}

async function verifyTelegramLogin(user: TelegramLoginUser, botToken: string) {
    const providedHash = String(user.hash || '').trim();
    const authDate = Number(user.auth_date || 0);
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (!user.id || !providedHash || !authDate) return false;
    if (nowSeconds - authDate > 24 * 60 * 60) return false;

    const encoder = new TextEncoder();
    const secretKey = await crypto.subtle.digest('SHA-256', encoder.encode(botToken));
    const key = await crypto.subtle.importKey('raw', secretKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(buildTelegramDataCheckString(user)));
    return bytesToHex(signature) === providedHash;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }
    if (req.method !== 'POST') {
        return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const botToken = Deno.env.get('GASGX_TELEGRAM_BOT_TOKEN') || '';
    if (!supabaseUrl || !serviceRoleKey || !botToken) {
        return jsonResponse({ error: 'Telegram auth is not configured.' }, 500);
    }

    const payload = await req.json().catch(() => ({}));
    const telegramUser = normalizeTelegramUser(payload.user);
    const redirectTo = typeof payload.redirectTo === 'string' ? payload.redirectTo : undefined;
    const isValid = await verifyTelegramLogin(telegramUser, botToken);
    if (!isValid) {
        return jsonResponse({ error: 'Invalid Telegram login signature.' }, 401);
    }

    const telegramId = String(telegramUser.id);
    const email = `telegram-${telegramId}@telegram.gasgx.com`;
    const fullName = [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ').trim()
        || telegramUser.username
        || `Telegram ${telegramId}`;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });

    const metadata = {
        provider: 'telegram',
        telegram_id: telegramId,
        telegram_username: telegramUser.username || '',
        full_name: fullName,
        avatar_url: telegramUser.photo_url || '',
    };

    const createResult = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: metadata,
        app_metadata: { provider: 'telegram', providers: ['telegram'] },
    });
    if (createResult.error && !/already registered|already exists|duplicate/i.test(createResult.error.message)) {
        return jsonResponse({ error: createResult.error.message }, 500);
    }

    const linkResult = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
            redirectTo,
            data: metadata,
        },
    });
    if (linkResult.error || !linkResult.data.properties?.action_link) {
        return jsonResponse({ error: linkResult.error?.message || 'Unable to create Telegram login link.' }, 500);
    }

    return jsonResponse({ actionLink: linkResult.data.properties.action_link });
});
