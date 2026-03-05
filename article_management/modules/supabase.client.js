export const SUPABASE_URL = window.AMS_SUPABASE_URL || 'https://mkpcliytqudclkwtewru.supabase.co';
export const SUPABASE_KEY = window.AMS_SUPABASE_KEY || 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';

export const ADMIN_EMAILS = ['cuitengwei@gasgx.com'];
export const DEFAULT_FEATURED_LIMIT = 10;

export const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
});
