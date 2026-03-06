import { client } from './supabase.client.js';
import { createArticle } from './articles.module.js';

function clean(value) {
    return String(value || '').trim();
}

function normalizeStatus(value, fallback = 'pending') {
    const next = clean(value).toLowerCase();
    return next || fallback;
}

export async function fetchReviewQueue({ status = 'pending', page = 1, pageSize = 20 } = {}) {
    const from = Math.max(0, (page - 1) * pageSize);
    const to = from + pageSize - 1;

    let query = client
        .from('scrape_queue')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false, nullsFirst: false })
        .order('id', { ascending: false })
        .range(from, to);

    if (status !== 'all') {
        const token = normalizeStatus(status, '').replace(/,/g, '');
        if (token) query = query.or(`review_status.eq.${token},status.eq.${token}`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
        rows: Array.isArray(data) ? data : [],
        count: Number.isFinite(count) ? count : 0,
    };
}

export async function fetchQueueStatuses(limit = 1200) {
    const safeLimit = Math.max(50, Math.min(5000, Number(limit) || 1200));
    const { data, error } = await client.from('scrape_queue').select('review_status,status').order('id', { ascending: false }).limit(safeLimit);
    if (error) throw error;

    const seed = ['pending', 'published', 'rejected'];
    const set = new Set(seed);
    (data || []).forEach((row) => {
        const reviewStatus = normalizeStatus(row?.review_status, '');
        const status = normalizeStatus(row?.status, '');
        if (reviewStatus) set.add(reviewStatus);
        if (status) set.add(status);
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

    const { error } = await client
        .from('scrape_queue')
        .update({
            review_status: 'published',
            article_id: article.id,
            reviewed_at: new Date().toISOString(),
            reviewed_by: userId || null,
            status: 'published',
        })
        .eq('id', queueItem.id);

    if (error) throw error;
    return article;
}

export async function rejectQueueItem(queueId, reviewNote, userId) {
    const note = clean(reviewNote);
    if (!note) throw new Error('拒绝原因不能为空。');

    const { error } = await client
        .from('scrape_queue')
        .update({
            review_status: 'rejected',
            review_note: note,
            reviewed_at: new Date().toISOString(),
            reviewed_by: userId || null,
            status: 'rejected',
        })
        .eq('id', queueId);

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

    const { error } = await client.from('scrape_queue').update(payload).eq('id', queueId);
    if (error) throw error;
}
