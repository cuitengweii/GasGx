import { client } from './supabase.client.js';
import { createArticle } from './articles.module.js';

function clean(value) {
    return String(value || '').trim();
}

const QUEUE_STATUS_ALIASES = {
    scraping: 'processing',
    completed: 'done',
    success: 'done',
};

function normalizeStatus(value, fallback = 'pending') {
    const next = clean(value).toLowerCase();
    if (!next) return fallback;
    return QUEUE_STATUS_ALIASES[next] || next;
}

const FINAL_QUEUE_STATUSES = new Set(['published', 'done', 'rejected']);

function isFinalQueueStatus(value) {
    return FINAL_QUEUE_STATUSES.has(normalizeStatus(value, ''));
}

function resolveRowStatus(row, fallback = 'pending') {
    const status = normalizeStatus(row?.status, '');
    const reviewStatus = normalizeStatus(row?.review_status, '');

    if (reviewStatus && (!status || status === 'pending' || isFinalQueueStatus(reviewStatus))) return reviewStatus;
    return status || reviewStatus || fallback;
}

function expandStatusFilter(status) {
    const normalizedStatus = normalizeStatus(status, '');
    if (!normalizedStatus) return [];
    const rawValues = new Set([normalizedStatus]);
    Object.entries(QUEUE_STATUS_ALIASES).forEach(([rawStatus, canonicalStatus]) => {
        if (canonicalStatus === normalizedStatus) rawValues.add(rawStatus);
    });
    return Array.from(rawValues);
}

function buildFieldFilter(column, rawStatuses = []) {
    const tokens = Array.from(new Set((rawStatuses || []).map((item) => clean(item).replace(/,/g, '')).filter(Boolean)));
    if (!tokens.length) return '';
    if (tokens.length === 1) return `${column}.eq.${tokens[0]}`;
    return `${column}.in.(${tokens.join(',')})`;
}

function buildEffectiveStatusFilter(status) {
    const rawStatuses = expandStatusFilter(status);
    const statusFilter = buildFieldFilter('status', rawStatuses);
    const reviewFilter = buildFieldFilter('review_status', rawStatuses);

    if (!statusFilter && !reviewFilter) return '';
    if (normalizeStatus(status, '') === 'pending') {
        return [
            statusFilter ? `and(${statusFilter},review_status.is.null)` : '',
            statusFilter && reviewFilter ? `and(${statusFilter},${reviewFilter})` : '',
            reviewFilter ? `and(status.is.null,${reviewFilter})` : '',
        ].filter(Boolean).join(',');
    }

    return [
        statusFilter,
        reviewFilter ? `and(status.eq.pending,${reviewFilter})` : '',
        reviewFilter ? `and(status.is.null,${reviewFilter})` : '',
    ].filter(Boolean).join(',');
}

function stripUnsupportedQueueColumns(payload, error) {
    const text = String(error?.message || '').toLowerCase();
    const nextPayload = { ...payload };
    let changed = false;

    ['review_status', 'review_note', 'reviewed_at', 'reviewed_by', 'article_id'].forEach((column) => {
        if (text.includes(column) && column in nextPayload) {
            delete nextPayload[column];
            changed = true;
        }
    });

    return changed ? nextPayload : null;
}

async function runQueueMutation(executor, payload) {
    let currentPayload = { ...payload };

    while (true) {
        const result = await executor(currentPayload);
        if (!result.error) return result;

        const fallbackPayload = stripUnsupportedQueueColumns(currentPayload, result.error);
        if (!fallbackPayload) return result;
        currentPayload = fallbackPayload;
    }
}

export async function fetchReviewQueue({ status = 'pending', page = 1, pageSize = 20 } = {}) {
    const from = Math.max(0, (page - 1) * pageSize);
    const to = from + pageSize - 1;
    const normalizedStatus = normalizeStatus(status, 'all');

    let query = client
        .from('scrape_queue')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false })
        .range(from, to);

    if (normalizedStatus === 'all') {
        query = query.or('status.is.null,status.not.in.(published,done,completed,success,rejected)');
    } else {
        const filter = buildEffectiveStatusFilter(normalizedStatus);
        if (filter) query = query.or(filter);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
        rows: Array.isArray(data) ? data.map((row) => ({ ...row, status: resolveRowStatus(row, 'pending') })) : [],
        count: Number.isFinite(count) ? count : 0,
    };
}

export async function fetchQueueStatuses(limit = 1200) {
    const safeLimit = Math.max(50, Math.min(5000, Number(limit) || 1200));
    const { data, error } = await client.from('scrape_queue').select('review_status,status').order('id', { ascending: false }).limit(safeLimit);
    if (error) throw error;

    const seed = ['pending', 'processing', 'queued', 'fetched', 'error', 'failed'];
    const set = new Set(seed);
    (data || []).forEach((row) => {
        const status = resolveRowStatus(row, '');
        if (status && !isFinalQueueStatus(status)) set.add(status);
    });
    return Array.from(set);
}

export function buildArticlePayloadFromQueue(item) {
    if (!item || typeof item !== 'object') return null;

    return {
        main_title: clean(item.main_title || item.title),
        subheading: clean(item.subheading || item.summary),
        content_markdown: clean(item.content_markdown || item.content || ''),
        tag: clean(item.tag_choice || item.tag || ''),
        secondary_tag: clean(item.secondary_tag || ''),
        type: clean(item.category || item.type || ''),
        publisher: clean(item.publisher || ''),
        cover_image: clean(item.cover_image || ''),
        author_avatar: clean(item.author_avatar || ''),
        topics: clean(item.topics || ''),
        link: clean(item.link || item.url || ''),
        time: item.time || item.created_at || new Date().toISOString(),
        status: 'published',
    };
}

export async function approveAndPublishQueueItem(queueItem, articlePayload, userId) {
    if (!queueItem || !queueItem.id) throw new Error('无效的队列数据。');

    const article = await createArticle({
        ...buildArticlePayloadFromQueue(queueItem),
        ...articlePayload,
        status: 'published',
        link: clean(articlePayload?.link || queueItem.link || ''),
    }, userId);

    const payload = {
        review_status: 'published',
        article_id: article.id,
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId || null,
        status: 'published',
    };
    const { error } = await runQueueMutation(
        (nextPayload) => client.from('scrape_queue').update(nextPayload).eq('id', queueItem.id),
        payload
    );

    if (error) throw error;
    return article;
}

export async function rejectQueueItem(queueId, reviewNote, userId) {
    const note = clean(reviewNote);
    if (!note) throw new Error('拒绝原因不能为空。');

    const payload = {
        review_status: 'rejected',
        review_note: note,
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId || null,
        status: 'rejected',
    };
    const { error } = await runQueueMutation(
        (nextPayload) => client.from('scrape_queue').update(nextPayload).eq('id', queueId),
        payload
    );

    if (error) throw error;
}

export async function updateQueueStatus(queueId, nextStatus, userId, reviewNote = null) {
    const status = normalizeStatus(nextStatus, '');
    if (!status) throw new Error('状态不能为空。');

    const payload = {
        review_status: status,
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId || null,
    };

    if (typeof reviewNote === 'string') payload.review_note = clean(reviewNote);

    const { error } = await runQueueMutation(
        (nextPayload) => client.from('scrape_queue').update(nextPayload).eq('id', queueId),
        payload
    );
    if (error) throw error;
}
