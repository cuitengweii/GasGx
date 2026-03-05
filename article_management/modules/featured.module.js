import { client, DEFAULT_FEATURED_LIMIT } from './supabase.client.js';

export const HOMEPAGE_MARK_LIMIT = 3;

function normalizeFeaturedLimit(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return DEFAULT_FEATURED_LIMIT;
    return Math.max(1, Math.min(30, Math.round(parsed)));
}

function hasLegacyColumnError(error, columnName) {
    const text = String(error?.message || '').toLowerCase();
    return text.includes(String(columnName || '').toLowerCase());
}

async function fetchPublishedArticlesBase(limit = 120) {
    const safeLimit = Math.max(10, Math.min(300, Number(limit) || 120));

    let { data, error } = await client
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('time', { ascending: false })
        .limit(safeLimit);

    if (error && (hasLegacyColumnError(error, 'status') || hasLegacyColumnError(error, 'deleted_at'))) {
        const legacyRes = await client.from('articles').select('*').order('time', { ascending: false }).limit(safeLimit);
        data = legacyRes.data;
        error = legacyRes.error;
    }

    if (error) throw error;
    return Array.isArray(data) ? data : [];
}

export async function fetchFeaturedPool(limit = 120) {
    return fetchPublishedArticlesBase(limit);
}

export async function fetchHeroSelection() {
    let { data, error } = await client
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .is('deleted_at', null)
        .not('homepage_mark', 'is', null)
        .gte('homepage_mark', 1)
        .lte('homepage_mark', HOMEPAGE_MARK_LIMIT)
        .order('homepage_mark', { ascending: true })
        .limit(HOMEPAGE_MARK_LIMIT);

    if (error && (hasLegacyColumnError(error, 'status') || hasLegacyColumnError(error, 'deleted_at'))) {
        const legacyRes = await client
            .from('articles')
            .select('*')
            .not('homepage_mark', 'is', null)
            .gte('homepage_mark', 1)
            .lte('homepage_mark', HOMEPAGE_MARK_LIMIT)
            .order('homepage_mark', { ascending: true })
            .limit(HOMEPAGE_MARK_LIMIT);
        data = legacyRes.data;
        error = legacyRes.error;
    }

    if (error) throw error;
    return Array.isArray(data) ? data : [];
}

export async function fetchFeaturedSelection(limit = DEFAULT_FEATURED_LIMIT) {
    const topN = normalizeFeaturedLimit(limit);

    let { data, error } = await client
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .is('deleted_at', null)
        .not('featured_rank', 'is', null)
        .gte('featured_rank', 1)
        .lte('featured_rank', topN)
        .order('featured_rank', { ascending: true })
        .limit(topN);

    if (error && (hasLegacyColumnError(error, 'status') || hasLegacyColumnError(error, 'deleted_at'))) {
        const legacyRes = await client
            .from('articles')
            .select('*')
            .not('featured_rank', 'is', null)
            .gte('featured_rank', 1)
            .lte('featured_rank', topN)
            .order('featured_rank', { ascending: true })
            .limit(topN);
        data = legacyRes.data;
        error = legacyRes.error;
    }

    if (error) throw error;
    return Array.isArray(data) ? data : [];
}

async function clearHomepageMarks(userId) {
    const payload = {
        homepage_mark: null,
        updated_at: new Date().toISOString(),
        updated_by: userId || null,
    };

    let { error } = await client.from('articles').update(payload).in('homepage_mark', [1, 2, 3]);
    if (!error) return;

    if (hasLegacyColumnError(error, 'updated_by') || hasLegacyColumnError(error, 'updated_at')) {
        const legacyRes = await client.from('articles').update({ homepage_mark: null }).in('homepage_mark', [1, 2, 3]);
        error = legacyRes.error;
    }
    if (error) throw error;
}

async function clearFeaturedRanks(userId) {
    const payload = {
        featured_rank: null,
        updated_at: new Date().toISOString(),
        updated_by: userId || null,
    };

    let { error } = await client.from('articles').update(payload).not('featured_rank', 'is', null);
    if (!error) return;

    if (hasLegacyColumnError(error, 'updated_by') || hasLegacyColumnError(error, 'updated_at')) {
        const legacyRes = await client.from('articles').update({ featured_rank: null }).not('featured_rank', 'is', null);
        error = legacyRes.error;
    }
    if (error) throw error;
}

async function updateHomepageMark(articleId, rank, userId) {
    const now = new Date().toISOString();
    const payload = {
        homepage_mark: rank,
        updated_at: now,
        updated_by: userId || null,
    };

    let { error } = await client.from('articles').update(payload).eq('id', articleId);
    if (!error) return;

    if (hasLegacyColumnError(error, 'updated_by') || hasLegacyColumnError(error, 'updated_at')) {
        const legacyRes = await client.from('articles').update({ homepage_mark: rank }).eq('id', articleId);
        error = legacyRes.error;
    }
    if (error) throw error;
}

async function updateFeaturedRank(articleId, rank, userId) {
    const now = new Date().toISOString();
    const payload = {
        featured_rank: rank,
        updated_at: now,
        updated_by: userId || null,
    };

    let { error } = await client.from('articles').update(payload).eq('id', articleId);
    if (!error) return;

    if (hasLegacyColumnError(error, 'updated_by') || hasLegacyColumnError(error, 'updated_at')) {
        const legacyRes = await client.from('articles').update({ featured_rank: rank }).eq('id', articleId);
        error = legacyRes.error;
    }
    if (error) throw error;
}

export async function publishHeroMarks(articleIds = [], userId = null) {
    const unique = Array.from(new Set((articleIds || []).map((id) => Number(id)).filter((id) => Number.isFinite(id)))).slice(0, HOMEPAGE_MARK_LIMIT);

    await clearHomepageMarks(userId);

    for (let index = 0; index < unique.length; index += 1) {
        await updateHomepageMark(unique[index], index + 1, userId);
    }

    return unique;
}

export async function publishFeaturedRanks(articleIds = [], limit = DEFAULT_FEATURED_LIMIT, userId = null) {
    const topN = normalizeFeaturedLimit(limit);
    const unique = Array.from(new Set((articleIds || []).map((id) => Number(id)).filter((id) => Number.isFinite(id)))).slice(0, topN);

    await clearFeaturedRanks(userId);

    for (let index = 0; index < unique.length; index += 1) {
        await updateFeaturedRank(unique[index], index + 1, userId);
    }

    return unique;
}
