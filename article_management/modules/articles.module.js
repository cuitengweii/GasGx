import { client } from './supabase.client.js';

const ARTICLE_TABLE = 'articles';
const STATUS_VALUES = new Set(['draft', 'published', 'archived', 'scraping', 'failed']);
export const ARTICLE_TYPE_OPTIONS = [
    { value: 'gas-energy', label: 'Gas Energy' },
    { value: 'generators', label: 'Generators' },
    { value: 'mining', label: 'Mining' },
    { value: 'insights', label: 'Insights' },
    { value: 'data', label: 'Data' },
    { value: 'events', label: 'Events' },
];
const ARTICLE_TYPE_VALUES = new Set(ARTICLE_TYPE_OPTIONS.map((item) => item.value));

function normalizeText(value) {
    return String(value || '').trim();
}

function normalizeStatus(value, fallback = 'draft') {
    const next = normalizeText(value).toLowerCase();
    return STATUS_VALUES.has(next) ? next : fallback;
}

function normalizeArticleType(value) {
    const next = normalizeText(value).toLowerCase();
    if (!next) return '';
    return ARTICLE_TYPE_VALUES.has(next) ? next : next;
}

export function createEmptyArticlePayload() {
    return {
        main_title: '',
        subheading: '',
        content_markdown: '',
        content_html: '',
        tag: '',
        secondary_tag: '',
        type: '',
        publisher: '',
        cover_image: '',
        author_avatar: '',
        topics: '',
        link: '',
        time: new Date().toISOString(),
        status: 'draft',
    };
}

export function normalizeArticleRow(row) {
    if (!row || typeof row !== 'object') return null;
    return {
        ...row,
        id: row.id,
        main_title: normalizeText(row.main_title),
        subheading: normalizeText(row.subheading),
        tag: normalizeText(row.tag),
        secondary_tag: normalizeText(row.secondary_tag),
        type: normalizeText(row.type),
        publisher: normalizeText(row.publisher),
        topics: normalizeText(row.topics),
        link: normalizeText(row.link),
        cover_image: normalizeText(row.cover_image),
        author_avatar: normalizeText(row.author_avatar),
        content_markdown: normalizeText(row.content_markdown || ''),
        content_html: normalizeText(row.content_html || row.article_content || row.content || ''),
        status: normalizeStatus(row.status, 'published'),
        deleted_at: row.deleted_at || null,
        featured_rank: Number.isFinite(row.featured_rank) ? row.featured_rank : null,
        time: row.time || row.created_at || null,
    };
}

export async function fetchArticles({
    page = 1,
    pageSize = 20,
    search = '',
    status = 'all',
    tag = 'all',
    category = 'all',
    includeDeleted = false,
    featuredOnly = false,
} = {}) {
    const from = Math.max(0, (page - 1) * pageSize);
    const to = from + pageSize - 1;

    let query = client
        .from(ARTICLE_TABLE)
        .select('*', { count: 'exact' })
        .order('time', { ascending: false, nullsFirst: false })
        .order('id', { ascending: false })
        .range(from, to);

    if (includeDeleted) query = query.not('deleted_at', 'is', null);
    else query = query.is('deleted_at', null);

    if (status !== 'all') query = query.eq('status', normalizeStatus(status, 'published'));
    if (tag !== 'all') query = query.eq('tag', tag);
    if (category !== 'all') query = query.eq('type', normalizeText(category));
    if (featuredOnly) query = query.not('featured_rank', 'is', null);

    const cleanSearch = normalizeText(search);
    if (cleanSearch) {
        const escaped = cleanSearch.replace(/,/g, ' ');
        query = query.or(`main_title.ilike.%${escaped}%,subheading.ilike.%${escaped}%,publisher.ilike.%${escaped}%,link.ilike.%${escaped}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
        rows: (data || []).map(normalizeArticleRow).filter(Boolean),
        count: Number.isFinite(count) ? count : 0,
    };
}

function buildUpsertPayload(input = {}, userId = null) {
    const nowIso = new Date().toISOString();
    const contentMarkdown = normalizeText(input.content_markdown);
    const contentHtml = normalizeText(input.content_html);
    const payload = {
        main_title: normalizeText(input.main_title),
        subheading: normalizeText(input.subheading),
        content_markdown: contentMarkdown,
        content_html: contentHtml,
        article_content: contentHtml,
        tag: normalizeText(input.tag),
        secondary_tag: normalizeText(input.secondary_tag),
        type: normalizeArticleType(input.type),
        publisher: normalizeText(input.publisher),
        cover_image: normalizeText(input.cover_image),
        author_avatar: normalizeText(input.author_avatar),
        topics: normalizeText(input.topics),
        link: normalizeText(input.link),
        time: input.time || nowIso,
        status: normalizeStatus(input.status, 'draft'),
        updated_at: nowIso,
        updated_by: userId || null,
    };

    return payload;
}

function hasLegacyUpdatedColumnsError(error) {
    const text = String(error?.message || '').toLowerCase();
    return text.includes('updated_at') || text.includes('updated_by');
}

function stripUnsupportedColumns(payload, error) {
    const text = String(error?.message || '').toLowerCase();
    const nextPayload = { ...payload };
    let changed = false;

    if ((text.includes('updated_at') || text.includes('updated_by')) && ('updated_at' in nextPayload || 'updated_by' in nextPayload)) {
        delete nextPayload.updated_at;
        delete nextPayload.updated_by;
        changed = true;
    }
    if (text.includes('content_html') && 'content_html' in nextPayload) {
        delete nextPayload.content_html;
        changed = true;
    }
    if (text.includes('article_content') && 'article_content' in nextPayload) {
        delete nextPayload.article_content;
        changed = true;
    }

    return changed ? nextPayload : null;
}

async function runArticleMutation(executor, payload) {
    let currentPayload = { ...payload };

    while (true) {
        const result = await executor(currentPayload);
        if (!result.error) return result;

        const fallbackPayload = stripUnsupportedColumns(currentPayload, result.error);
        if (!fallbackPayload) return result;
        currentPayload = fallbackPayload;
    }
}

export async function createArticle(input, userId) {
    const payload = buildUpsertPayload(input, userId);
    payload.deleted_at = null;
    payload.deleted_by = null;

    const { data, error } = await runArticleMutation(
        (nextPayload) => client.from(ARTICLE_TABLE).insert([nextPayload]).select('*').single(),
        payload
    );
    if (error) throw error;
    return normalizeArticleRow(data);
}

export async function updateArticle(articleId, input, userId) {
    const payload = buildUpsertPayload(input, userId);
    const { data, error } = await runArticleMutation(
        (nextPayload) => client.from(ARTICLE_TABLE).update(nextPayload).eq('id', articleId).select('*').single(),
        payload
    );
    if (error) throw error;
    return normalizeArticleRow(data);
}

async function updateArticleFields(articleId, fields = {}, userId) {
    const nowIso = new Date().toISOString();
    const payload = {
        ...fields,
        updated_at: nowIso,
        updated_by: userId || null,
    };

    const { data, error } = await runArticleMutation(
        (nextPayload) => client.from(ARTICLE_TABLE).update(nextPayload).eq('id', articleId).select('*').single(),
        payload
    );
    if (error) throw error;
    return normalizeArticleRow(data);
}

export async function updateArticleStatus(articleId, status, userId) {
    return updateArticleFields(articleId, { status: normalizeStatus(status, 'draft') }, userId);
}

export async function updateArticleType(articleId, type, userId) {
    return updateArticleFields(articleId, { type: normalizeArticleType(type) }, userId);
}

export async function batchUpdateArticleFields(articleIds = [], fields = {}, userId) {
    const ids = Array.from(new Set((articleIds || []).map((item) => Number(item)).filter((item) => Number.isFinite(item))));
    if (!ids.length) return [];

    const nowIso = new Date().toISOString();
    const payload = {
        ...fields,
        updated_at: nowIso,
        updated_by: userId || null,
    };

    const { data, error } = await runArticleMutation(
        (nextPayload) => client.from(ARTICLE_TABLE).update(nextPayload).in('id', ids).select('*'),
        payload
    );
    if (error) throw error;
    return (data || []).map(normalizeArticleRow).filter(Boolean);
}

export async function batchUpdateArticleStatus(articleIds = [], status, userId) {
    return batchUpdateArticleFields(articleIds, { status: normalizeStatus(status, 'draft') }, userId);
}

export async function batchUpdateArticleType(articleIds = [], type, userId) {
    return batchUpdateArticleFields(articleIds, { type: normalizeArticleType(type) }, userId);
}

export async function softDeleteArticle(articleId, userId) {
    const { error } = await client
        .from(ARTICLE_TABLE)
        .update({ deleted_at: new Date().toISOString(), deleted_by: userId || null, updated_by: userId || null })
        .eq('id', articleId);
    if (error) throw error;
}

export async function restoreArticle(articleId, userId) {
    const { error } = await client
        .from(ARTICLE_TABLE)
        .update({ deleted_at: null, deleted_by: null, updated_at: new Date().toISOString(), updated_by: userId || null })
        .eq('id', articleId);
    if (error) throw error;
}

export async function hardDeleteArticle(articleId) {
    const { error } = await client.from(ARTICLE_TABLE).delete().eq('id', articleId);
    if (error) throw error;
}

export async function fetchDistinctTags() {
    const { data, error } = await client.from(ARTICLE_TABLE).select('tag').is('deleted_at', null).order('tag', { ascending: true });
    if (error) throw error;

    const tags = Array.from(
        new Set((data || []).map((item) => normalizeText(item.tag)).filter(Boolean))
    );
    return tags;
}

export async function fetchDistinctCategories() {
    const { data, error } = await client.from(ARTICLE_TABLE).select('type').is('deleted_at', null).order('type', { ascending: true });
    if (error) throw error;

    const categories = Array.from(
        new Set((data || []).map((item) => normalizeText(item.type)).filter(Boolean))
    );
    return categories;
}

export async function fetchArticleById(articleId) {
    const { data, error } = await client.from(ARTICLE_TABLE).select('*').eq('id', articleId).single();
    if (error) throw error;
    return normalizeArticleRow(data);
}
