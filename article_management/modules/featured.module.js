import { client, DEFAULT_FEATURED_LIMIT } from './supabase.client.js';

function normalizeLimit(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return DEFAULT_FEATURED_LIMIT;
    return Math.max(1, Math.min(30, Math.round(parsed)));
}

export async function fetchFeaturedSelection(limit = DEFAULT_FEATURED_LIMIT) {
    const topN = normalizeLimit(limit);
    const { data, error } = await client
        .from('articles')
        .select('*')
        .is('deleted_at', null)
        .eq('status', 'published')
        .not('featured_rank', 'is', null)
        .order('featured_rank', { ascending: true })
        .limit(topN);
    if (error) throw error;
    return Array.isArray(data) ? data : [];
}

export async function fetchFeaturedPool(limit = 120) {
    const safeLimit = Math.max(10, Math.min(300, Number(limit) || 120));
    const { data, error } = await client
        .from('articles')
        .select('*')
        .is('deleted_at', null)
        .eq('status', 'published')
        .order('time', { ascending: false })
        .limit(safeLimit);
    if (error) throw error;
    return Array.isArray(data) ? data : [];
}

export async function publishFeaturedRanks(articleIds = [], limit = DEFAULT_FEATURED_LIMIT, userId = null) {
    const topN = normalizeLimit(limit);
    const unique = Array.from(new Set((articleIds || []).map((id) => Number(id)).filter((id) => Number.isFinite(id)))).slice(0, topN);

    const clearPayload = {
        featured_rank: null,
        updated_at: new Date().toISOString(),
        updated_by: userId || null,
    };

    const { error: clearError } = await client.from('articles').update(clearPayload).not('featured_rank', 'is', null);
    if (clearError) throw clearError;

    for (let index = 0; index < unique.length; index += 1) {
        const articleId = unique[index];
        const rank = index + 1;
        const { error } = await client
            .from('articles')
            .update({ featured_rank: rank, updated_at: new Date().toISOString(), updated_by: userId || null })
            .eq('id', articleId);
        if (error) throw error;
    }

    return unique;
}
