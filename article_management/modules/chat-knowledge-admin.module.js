import { client } from './supabase.client.js?v=20260321admin01';

const KNOWLEDGE_BASE_MIGRATION_HINT = 'supabase/migrations/20260420160000_chat_knowledge_rag.sql';
const KNOWLEDGE_SITE_FUNCTION_MIGRATION_HINT = 'supabase/migrations/20260421110000_chat_public_site_feature_directory.sql';
const KNOWLEDGE_MIGRATION_HINT = `${KNOWLEDGE_BASE_MIGRATION_HINT} + ${KNOWLEDGE_SITE_FUNCTION_MIGRATION_HINT}`;
const KNOWLEDGE_SOURCE_TYPES = ['public_page', 'site_function', 'resource_doc', 'internal_sales_kb', 'faq', 'datasheet', 'case_study', 'certification'];
const KNOWLEDGE_VISIBILITY = ['public', 'internal_sales'];
const KNOWLEDGE_STATUS = ['draft', 'published', 'archived'];
const FEEDBACK_STATUS = ['unreviewed', 'good', 'bad', 'needs_knowledge'];
const FILTER_ALL = '__all__';
const KNOWLEDGE_SOURCE_TYPE_LABELS = {
    public_page: '公开页面',
    site_function: '站点功能入口',
    resource_doc: '资源文档',
    internal_sales_kb: '销售内部知识',
    faq: 'FAQ',
    datasheet: '参数表',
    case_study: '案例',
    certification: '认证',
};
const KNOWLEDGE_VISIBILITY_LABELS = {
    public: '公开可见',
    internal_sales: '仅销售内部',
};
const KNOWLEDGE_STATUS_LABELS = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档',
};
const FEEDBACK_STATUS_LABELS = {
    unreviewed: '未复核',
    good: '好答案',
    bad: '差答案',
    needs_knowledge: '缺知识',
};
const HANDOFF_REASON_LABELS = {
    unknown: '无',
    quote: '报价',
    lead: '商机',
    support: '支持',
};
const DEFAULT_INGEST_PREFIXES = ['/products/', '/solutions/', '/digitalization/', '/support/', '/resources/', '/use-cases/', '/rankings/', '/about/', '/tools/'];
const DEFAULT_INGEST_MANUAL_URLS = [
    'https://www.gasgx.com/',
    'https://www.gasgx.com/news/',
    'https://www.gasgx.com/quote/requirement.html',
    'https://www.gasgx.com/vman/',
    'https://www.gasgx.com/minerpower/',
];
const INGEST_EXCLUDED_PATH_PREFIXES = [
    '/article_management/',
    '/account/',
    '/private-use/',
    '/test/',
    '/quote/editor.html',
    '/quote/view.html',
    '/tools/quote-system/',
    '/news/article/',
];

const moduleState = {
    editingDocumentId: '',
    editingRuleId: '',
    crawlReport: null,
    lastKnowledgeSaveSummary: null,
    documentFilters: {
        query: '',
        sourceType: FILTER_ALL,
        visibility: FILTER_ALL,
        status: FILTER_ALL,
        language: FILTER_ALL,
    },
    ruleFilters: {
        query: '',
        status: FILTER_ALL,
        language: FILTER_ALL,
        handoff: FILTER_ALL,
    },
    qaFilters: {
        feedback: FILTER_ALL,
        failed: FILTER_ALL,
        provider: FILTER_ALL,
        intent: '',
    },
};

function text(value, fallback = '') {
    return String(value ?? fallback).trim();
}

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

function normalizeLanguage(value, fallback = 'en') {
    const lang = text(value, fallback).toLowerCase();
    if (lang.startsWith('zh')) return 'zh';
    if (lang.startsWith('ru')) return 'ru';
    return 'en';
}

function optionMarkup(options = [], current = '') {
    return options.map((item) => `<option value="${esc(item)}" ${item === current ? 'selected' : ''}>${esc(item)}</option>`).join('');
}

function optionMarkupFromPairs(options = [], current = '') {
    return options.map((item) => `<option value="${esc(item.value)}" ${item.value === current ? 'selected' : ''}>${esc(item.label)}</option>`).join('');
}

function parseListInput(value = '') {
    return Array.from(new Set(
        String(value || '')
            .split(/[\n,]+/)
            .map((item) => item.trim())
            .filter(Boolean),
    ));
}

function normalizeKeywordList(value = '') {
    return Array.from(new Set(
        (Array.isArray(value) ? value : parseListInput(value))
            .map((item) => text(item))
            .filter(Boolean),
    )).slice(0, 80);
}

function asPlainObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function labelFor(value, labels = {}, fallback = '--') {
    const normalized = text(value);
    return labels[normalized] || normalized || fallback;
}

function optionPairs(values = [], labels = {}) {
    return values.map((item) => ({ value: item, label: labels[item] || item }));
}

function sourceMetaKeywords(sourceMeta = {}, fallbackKeywords = []) {
    const meta = asPlainObject(sourceMeta);
    const rawKeywords = Array.isArray(meta.keywords) ? meta.keywords : fallbackKeywords;
    return normalizeKeywordList(rawKeywords);
}

function mergeSourceMeta(sourceMeta = {}, keywords = []) {
    const meta = { ...asPlainObject(sourceMeta) };
    meta.keywords = normalizeKeywordList(keywords);
    return meta;
}

function normalizeSourceRefs(value = []) {
    const rows = Array.isArray(value) ? value : [];
    return rows.map((item) => {
        const ref = item && typeof item === 'object' ? item : {};
        return {
            title: text(ref.title),
            url: text(ref.url),
            source_type: text(ref.source_type || ref.sourceType, 'public_page'),
        };
    }).filter((item) => item.title || item.url);
}

function matchesQuery(fields = [], query = '') {
    const normalizedQuery = text(query).toLowerCase();
    if (!normalizedQuery) return true;
    return fields.some((field) => text(field).toLowerCase().includes(normalizedQuery));
}

function knowledgeAdminErrorMessage(error, fallback = '操作失败') {
    const code = text(error?.code);
    const message = text(error?.message || error?.details || error?.hint, fallback);
    if (code === '42P01' || /relation .* does not exist|does not exist/i.test(message)) {
        return `知识库相关表还没建好，请先执行 ${KNOWLEDGE_BASE_MIGRATION_HINT}。`;
    }
    if (/knowledge_documents_source_type_check|site_function/i.test(message)) {
        return `当前环境还不支持 site_function，请先执行 ${KNOWLEDGE_SITE_FUNCTION_MIGRATION_HINT}。`;
    }
    return message || fallback;
}

function normalizeSourceType(pathname = '') {
    const path = String(pathname || '').toLowerCase();
    if (path.includes('/resources/faq')) return 'faq';
    if (path.includes('/resources/datasheets')) return 'datasheet';
    if (path.includes('/resources/case-studies')) return 'case_study';
    if (path.includes('/resources/certifications')) return 'certification';
    if (path.includes('/resources/')) return 'resource_doc';
    return 'public_page';
}

function normalizePathname(pathname = '') {
    const raw = String(pathname || '').trim();
    if (!raw) return '';
    const cleaned = raw.split('#')[0].split('?')[0] || '';
    const normalized = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
    if (normalized === '/') return normalized;
    return normalized.replace(/\/+$/, '') + '/';
}

function isKnowledgeIngestAllowed(url = '') {
    try {
        const parsed = new URL(String(url || ''), window.location.origin);
        const pathname = normalizePathname(parsed.pathname || '/');
        return !INGEST_EXCLUDED_PATH_PREFIXES.some((prefix) => pathname === normalizePathname(prefix) || pathname.startsWith(normalizePathname(prefix)));
    } catch (_error) {
        return false;
    }
}

function featureIdFromPath(pathname = '') {
    const normalized = normalizePathname(pathname);
    if (normalized === '/') return 'home';
    return normalized
        .replace(/^\/+|\/+$/g, '')
        .replace(/\/index\.html$/i, '')
        .replace(/\.html$/i, '')
        .replace(/[^a-z0-9/._-]+/gi, '-')
        .replace(/\//g, '__')
        .replace(/-+/g, '-')
        .replace(/^[-_]+|[-_]+$/g, '')
        .toLowerCase();
}

function featureGroupFromPath(pathname = '') {
    const normalized = normalizePathname(pathname);
    if (normalized === '/' || normalized === '/index.html/') return 'site_entry';
    if (normalized.startsWith('/tools/')) return 'tool';
    if (normalized.startsWith('/quote/requirement.html/')) return 'workflow';
    if (normalized.startsWith('/resources/')) return 'resource';
    if (normalized.startsWith('/support/') || normalized.startsWith('/about/contact/')) return 'support';
    if (normalized.startsWith('/solutions/')) return 'solution';
    if (normalized.startsWith('/digitalization/')) return 'digitalization';
    if (normalized.startsWith('/products/')) return 'product_catalog';
    if (normalized.startsWith('/rankings/')) return 'ranking';
    if (normalized.startsWith('/news/')) return 'news_entry';
    if (normalized.startsWith('/vman/') || normalized.startsWith('/minerpower/')) return 'brand_quote';
    if (normalized.startsWith('/about/')) return 'site_entry';
    return '';
}

function buildFeatureSourceMeta(pathname = '', title = '', excerpt = '') {
    const path = normalizePathname(pathname);
    const featureGroup = featureGroupFromPath(path);
    if (!featureGroup) {
        return {
            path,
            fetched_at: new Date().toISOString(),
            title,
        };
    }
    return {
        kind: 'site_function',
        feature_group: featureGroup,
        feature_id: featureIdFromPath(path),
        path,
        link_label: text(title),
        recommendation_hint: text(excerpt || title),
        fetched_at: new Date().toISOString(),
        title,
    };
}

function chunkSourceMeta(sourceMeta = {}) {
    const meta = sourceMeta && typeof sourceMeta === 'object' ? sourceMeta : {};
    return {
        kind: text(meta.kind),
        feature_group: text(meta.feature_group),
        feature_id: text(meta.feature_id),
        path: text(meta.path),
        link_label: text(meta.link_label),
        recommendation_hint: text(meta.recommendation_hint),
    };
}

function sourceRefRowHtml(item = {}) {
    const ref = {
        title: text(item.title),
        url: text(item.url),
        source_type: text(item.source_type || item.sourceType, 'public_page'),
    };
    return `
        <div class="ams-site-field-grid ams-site-field-grid-wide" data-source-ref-row style="margin-top:10px">
            <div class="ams-field"><label>来源标题</label><input data-source-ref-title class="ams-input" value="${esc(ref.title)}" placeholder="GasGx Requirement Intake"></div>
            <div class="ams-field"><label>来源链接</label><input data-source-ref-url class="ams-input" value="${esc(ref.url)}" placeholder="https://www.gasgx.com/... 或 kb://gasgx/..."></div>
            <div class="ams-field"><label>来源类型</label><select data-source-ref-type class="ams-select">${optionMarkup(KNOWLEDGE_SOURCE_TYPES, ref.source_type)}</select></div>
            <div class="ams-field" style="display:flex; align-items:flex-end"><button class="ams-btn ams-btn-muted" type="button" data-source-ref-remove>移除</button></div>
        </div>
    `;
}

function sourceRefsEditorHtml(sourceRefs = []) {
    const rows = normalizeSourceRefs(sourceRefs);
    const effectiveRows = rows.length ? rows : [{ title: '', url: '', source_type: 'public_page' }];
    return effectiveRows.map((item) => sourceRefRowHtml(item)).join('');
}

function bindSourceRefEditor(containerId, addButtonId) {
    const container = document.getElementById(containerId);
    const addButton = document.getElementById(addButtonId);
    if (!container || !addButton) return;

    addButton.addEventListener('click', () => {
        container.insertAdjacentHTML('beforeend', sourceRefRowHtml());
    });

    container.addEventListener('click', (event) => {
        const button = event.target?.closest?.('[data-source-ref-remove]');
        if (!button) return;
        const rows = Array.from(container.querySelectorAll('[data-source-ref-row]'));
        if (rows.length <= 1) {
            const row = rows[0];
            row?.querySelectorAll('input').forEach((input) => {
                input.value = '';
            });
            const select = row?.querySelector('[data-source-ref-type]');
            if (select) select.value = 'public_page';
            return;
        }
        button.closest('[data-source-ref-row]')?.remove();
    });
}

function readSourceRefsFromEditor(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    const rows = Array.from(container.querySelectorAll('[data-source-ref-row]'));
    return rows.map((row) => ({
        title: text(row.querySelector('[data-source-ref-title]')?.value),
        url: text(row.querySelector('[data-source-ref-url]')?.value),
        source_type: text(row.querySelector('[data-source-ref-type]')?.value, 'public_page'),
    })).filter((item) => item.title || item.url);
}

function extractKeywords(input = '') {
    const value = text(input).toLowerCase();
    if (!value) return [];
    const base = value.match(/[a-z0-9]{2,}|[\u0400-\u04FF]{2,}|[\u4e00-\u9fff]{2,}/g) || [];
    const terms = new Set();
    base.forEach((entry) => {
        const safe = entry.trim();
        if (!safe) return;
        terms.add(safe);
        if (/^[\u4e00-\u9fff]+$/.test(safe) && safe.length <= 16) {
            for (let index = 0; index < safe.length - 1; index += 1) {
                terms.add(safe.slice(index, index + 2));
            }
        }
    });
    return Array.from(terms).slice(0, 60);
}

function buildContentBlocks(content = '') {
    return String(content || '')
        .split(/\n{2,}/)
        .map((item) => item.replace(/\r/g, '').trim())
        .filter(Boolean);
}

function buildChunksFromContent(input) {
    const title = text(input?.title);
    const language = normalizeLanguage(input?.language, 'en');
    const content = text(input?.content_markdown);
    const meta = chunkSourceMeta(input?.source_meta);
    const baseKeywords = [
        ...extractKeywords(title),
        ...extractKeywords(input?.canonical_url),
        ...(Array.isArray(input?.keywords) ? input.keywords.map((item) => text(item)).filter(Boolean) : []),
    ];
    const blocks = buildContentBlocks(content);
    const chunks = [];
    let currentText = '';
    let currentSection = '';
    let currentTokens = 0;
    let sortOrder = 0;

    function flush() {
        const chunkText = text(currentText);
        if (!chunkText) return;
        chunks.push({
            chunk_text: chunkText,
            chunk_summary: chunkText.slice(0, 220),
            language,
            keywords: Array.from(new Set([...baseKeywords, ...extractKeywords(chunkText)])).slice(0, 80),
            section_path: currentSection || 'content',
            sort_order: sortOrder,
            token_count: currentTokens,
            search_text: '',
            source_meta: meta,
        });
        chunks[chunks.length - 1].search_text = `${chunks[chunks.length - 1].chunk_text} ${chunks[chunks.length - 1].chunk_summary} ${(chunks[chunks.length - 1].keywords || []).join(' ')}`.trim();
        currentText = '';
        currentTokens = 0;
        sortOrder += 1;
    }

    blocks.forEach((block) => {
        const isHeading = /^#{1,4}\s+/.test(block);
        if (isHeading) {
            currentSection = block.replace(/^#{1,4}\s+/, '').trim() || currentSection;
        }
        const appended = currentText ? `${currentText}\n\n${block}` : block;
        if (appended.length > 1100 && currentText) {
            flush();
        }
        currentText = currentText ? `${currentText}\n\n${block}` : block;
        currentTokens += Math.max(1, Math.ceil(block.length / 4));
        if (currentText.length > 1100) {
            flush();
        }
    });
    flush();

    if (!chunks.length && content) {
        chunks.push({
            chunk_text: content,
            chunk_summary: content.slice(0, 220),
            language,
            keywords: Array.from(new Set([...baseKeywords, ...extractKeywords(content)])).slice(0, 80),
            section_path: 'content',
            sort_order: 0,
            token_count: Math.max(1, Math.ceil(content.length / 4)),
            search_text: '',
            source_meta: meta,
        });
        chunks[0].search_text = `${chunks[0].chunk_text} ${chunks[0].chunk_summary} ${(chunks[0].keywords || []).join(' ')}`.trim();
    }

    return chunks;
}

function collapseWhitespace(value = '') {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function extractDocumentFromHtml(html, url) {
    const parser = new DOMParser();
    const documentNode = parser.parseFromString(String(html || ''), 'text/html');
    documentNode.querySelectorAll('script, style, noscript, iframe, svg, canvas, template').forEach((node) => node.remove());

    const root = documentNode.querySelector('main') || documentNode.querySelector('article') || documentNode.body;
    const title = collapseWhitespace(documentNode.querySelector('title')?.textContent || documentNode.querySelector('h1')?.textContent || url);
    const language = normalizeLanguage(documentNode.documentElement?.lang, 'en');
    const blocks = [];
    const seen = new Set();

    (root?.querySelectorAll('h1, h2, h3, h4, p, li, dt, dd, figcaption') || []).forEach((node) => {
        const safe = collapseWhitespace(node.textContent || '');
        if (!safe || safe.length < 3) return;
        if (seen.has(safe)) return;
        seen.add(safe);
        const tag = String(node.tagName || '').toLowerCase();
        if (tag === 'h1') blocks.push(`# ${safe}`);
        else if (tag === 'h2') blocks.push(`## ${safe}`);
        else if (tag === 'h3') blocks.push(`### ${safe}`);
        else if (tag === 'h4') blocks.push(`#### ${safe}`);
        else if (tag === 'li') blocks.push(`- ${safe}`);
        else blocks.push(safe);
    });

    const contentMarkdown = blocks.join('\n\n').trim();
    const excerptBlock = blocks.find((item) => !item.startsWith('#') && !item.startsWith('-')) || blocks[0] || '';
    const parsedUrl = new URL(url, window.location.origin);
    const excerpt = collapseWhitespace(excerptBlock).slice(0, 260);
    const sourceMeta = buildFeatureSourceMeta(parsedUrl.pathname, title, excerpt);
    const sourceType = text(sourceMeta.kind) === 'site_function' ? 'site_function' : normalizeSourceType(parsedUrl.pathname);

    return {
        title,
        language,
        canonical_url: text(documentNode.querySelector('link[rel="canonical"]')?.href, parsedUrl.toString()),
        excerpt,
        content_markdown: contentMarkdown,
        source_type: sourceType,
        source_meta: sourceMeta,
        keywords: Array.from(new Set([
            ...extractKeywords(title),
            ...extractKeywords(parsedUrl.pathname),
            ...extractKeywords(contentMarkdown.slice(0, 1600)),
        ])).slice(0, 80),
    };
}

async function fetchKnowledgeDocuments() {
    const { data, error } = await client
        .from('knowledge_documents')
        .select('id, source_type, visibility, language, title, canonical_url, excerpt, content_markdown, source_meta, status, last_crawled_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(80);
    if (error) throw error;
    return Array.isArray(data) ? data : [];
}

async function fetchFaqRules() {
    const { data, error } = await client
        .from('chat_faq_rules')
        .select('id, intent_key, language, trigger_patterns, answer_template, handoff_required, handoff_reason, next_fields, source_refs, status, updated_at')
        .order('updated_at', { ascending: false })
        .limit(80);
    if (error) throw error;
    return Array.isArray(data) ? data : [];
}

async function fetchChatLogs() {
    const { data, error } = await client
        .from('chat_qa_logs')
        .select('id, session_id, user_message, assistant_reply, language, provider, matched_intent, source_refs, handoff, failed, error_code, feedback_status, feedback_note, created_at')
        .order('created_at', { ascending: false })
        .limit(60);
    if (error) throw error;
    return Array.isArray(data) ? data : [];
}

async function fetchLeadIntents() {
    const { data, error } = await client
        .from('chat_lead_intents')
        .select('id, session_id, user_question, detected_intent, project_summary, required_followup_fields, contact_channel, language, provider, created_at')
        .order('created_at', { ascending: false })
        .limit(40);
    if (error) throw error;
    return Array.isArray(data) ? data : [];
}

async function replaceKnowledgeChunks(documentId, chunks = []) {
    const { error: deleteError } = await client.from('knowledge_chunks').delete().eq('document_id', documentId);
    if (deleteError) throw deleteError;
    if (!chunks.length) return;
    const rows = chunks.map((chunk) => ({ ...chunk, document_id: documentId }));
    const { error: insertError } = await client.from('knowledge_chunks').insert(rows);
    if (insertError) throw insertError;
}

async function saveKnowledgeDocument(payload, userId = null) {
    const keywords = sourceMetaKeywords(payload.source_meta, payload.keywords);
    const rowPayload = {
        id: text(payload.id) || undefined,
        source_type: text(payload.source_type, 'internal_sales_kb'),
        visibility: text(payload.visibility, 'public'),
        language: normalizeLanguage(payload.language, 'en'),
        title: text(payload.title),
        canonical_url: text(payload.canonical_url),
        excerpt: text(payload.excerpt),
        content_markdown: text(payload.content_markdown),
        source_meta: mergeSourceMeta(payload.source_meta, keywords),
        status: text(payload.status, 'draft'),
        last_crawled_at: payload.last_crawled_at || null,
        updated_by: userId || null,
        created_by: text(payload.id) ? undefined : (userId || null),
    };

    const query = text(payload.id)
        ? client
            .from('knowledge_documents')
            .update(rowPayload)
            .eq('id', text(payload.id))
        : client
            .from('knowledge_documents')
            .upsert(rowPayload, { onConflict: 'canonical_url' });
    const { data, error } = await query
        .select('id, source_type, visibility, language, title, canonical_url, excerpt, content_markdown, source_meta, status')
        .single();
    if (error) throw error;
    const chunks = buildChunksFromContent({
        title: data.title,
        language: data.language,
        canonical_url: data.canonical_url,
        content_markdown: data.content_markdown,
        source_meta: data.source_meta,
        keywords: sourceMetaKeywords(data.source_meta, keywords),
    });
    await replaceKnowledgeChunks(data.id, chunks);
    return {
        ...data,
        keywords: sourceMetaKeywords(data.source_meta, keywords),
        chunk_count: chunks.length,
        chunk_preview: chunks.slice(0, 3).map((chunk) => ({
            section_path: text(chunk.section_path, 'content'),
            preview: text(chunk.chunk_summary),
        })),
    };
}

async function saveFaqRule(payload, userId = null) {
    const rowPayload = {
        id: text(payload.id) || undefined,
        intent_key: text(payload.intent_key),
        language: normalizeLanguage(payload.language, 'en'),
        trigger_patterns: Array.isArray(payload.trigger_patterns) ? payload.trigger_patterns : parseListInput(payload.trigger_patterns),
        answer_template: text(payload.answer_template),
        handoff_required: payload.handoff_required === true,
        handoff_reason: text(payload.handoff_reason, 'unknown'),
        next_fields: Array.isArray(payload.next_fields) ? payload.next_fields : parseListInput(payload.next_fields),
        source_refs: normalizeSourceRefs(payload.source_refs),
        status: text(payload.status, 'draft'),
        updated_by: userId || null,
        created_by: text(payload.id) ? undefined : (userId || null),
    };

    const query = text(payload.id)
        ? client
            .from('chat_faq_rules')
            .update(rowPayload)
            .eq('id', text(payload.id))
        : client
            .from('chat_faq_rules')
            .upsert(rowPayload, { onConflict: 'intent_key,language' });
    const { data, error } = await query.select('id, source_refs').single();
    if (error) throw error;
    return data;
}

async function updateKnowledgeDocumentStatus(id, status, userId = null) {
    const { error } = await client
        .from('knowledge_documents')
        .update({
            status: text(status, 'draft'),
            updated_by: userId || null,
        })
        .eq('id', id);
    if (error) throw error;
}

async function updateFaqRuleStatus(id, status, userId = null) {
    const { error } = await client
        .from('chat_faq_rules')
        .update({
            status: text(status, 'draft'),
            updated_by: userId || null,
        })
        .eq('id', id);
    if (error) throw error;
}

async function updateChatFeedback(id, feedbackStatus, feedbackNote = '', userId = null) {
    const { error } = await client
        .from('chat_qa_logs')
        .update({
            feedback_status: feedbackStatus,
            feedback_note: text(feedbackNote),
            reviewed_by: userId || null,
        })
        .eq('id', id);
    if (error) throw error;
}

async function createFaqDraftFromLog(log, userId = null) {
    const intentBase = text(log.matched_intent) || `draft_${Date.now()}`;
    const handoff = asPlainObject(log.handoff);
    return saveFaqRule({
        intent_key: `${intentBase}_draft`,
        language: normalizeLanguage(log.language, 'en'),
        trigger_patterns: [text(log.user_message)],
        answer_template: text(log.assistant_reply),
        handoff_required: handoff.required === true,
        handoff_reason: text(handoff.reason, 'unknown'),
        next_fields: Array.isArray(handoff.next_fields) ? handoff.next_fields : [],
        source_refs: normalizeSourceRefs(log.source_refs),
        status: 'draft',
    }, userId);
}

async function createKnowledgeDraftFromLog(log, userId = null) {
    const matchedIntent = text(log.matched_intent);
    const question = text(log.user_message);
    const reply = text(log.assistant_reply);
    const keywords = normalizeKeywordList([
        matchedIntent,
        ...extractKeywords(question),
        ...extractKeywords(reply).slice(0, 20),
    ]);
    return saveKnowledgeDocument({
        source_type: 'internal_sales_kb',
        visibility: 'internal_sales',
        language: normalizeLanguage(log.language, 'en'),
        title: matchedIntent || question.slice(0, 80) || `chat_log_${text(log.id)}`,
        canonical_url: `kb://gasgx/chat-log/${text(log.id)}`,
        excerpt: collapseWhitespace(question).slice(0, 220),
        content_markdown: [
            '## 用户问题',
            question || '--',
            '## 机器人回答',
            reply || '--',
            '## Review Note',
            '- 在这里补充应沉淀的知识点、边界、来源链接或修正说明。',
        ].join('\n\n'),
        source_meta: {
            created_from: 'chat_qa',
            from_chat_log_id: text(log.id),
            matched_intent: matchedIntent,
            provider: text(log.provider),
            source_refs: normalizeSourceRefs(log.source_refs),
        },
        status: 'draft',
        keywords,
    }, userId);
}

async function getSitemapUrls() {
    const response = await fetch('/sitemap.xml', { cache: 'no-store' });
    if (!response.ok) throw new Error(`sitemap_http_${response.status}`);
    const raw = await response.text();
    return Array.from(new Set(
        Array.from(raw.matchAll(/<loc>(.*?)<\/loc>/gi)).map((match) => text(match[1])).filter((item) => item && isKnowledgeIngestAllowed(item)),
    ));
}

async function crawlKnowledgeUrls(urls = [], options = {}) {
    const userId = options.userId || null;
    const results = [];
    for (const url of urls) {
        try {
            if (!isKnowledgeIngestAllowed(url)) {
                throw new Error('crawl_blocked_by_scope');
            }
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) throw new Error(`crawl_http_${response.status}`);
            const html = await response.text();
            const extracted = extractDocumentFromHtml(html, url);
            const saved = await saveKnowledgeDocument({
                source_type: extracted.source_type,
                visibility: 'public',
                language: extracted.language,
                title: extracted.title,
                canonical_url: extracted.canonical_url,
                excerpt: extracted.excerpt,
                content_markdown: extracted.content_markdown,
                source_meta: extracted.source_meta,
                status: 'published',
                last_crawled_at: new Date().toISOString(),
                keywords: extracted.keywords,
            }, userId);
            results.push({
                ok: true,
                url,
                title: saved.title,
                language: saved.language,
                status: saved.status,
            });
        } catch (error) {
            results.push({
                ok: false,
                url,
                error: knowledgeAdminErrorMessage(error, 'crawl_failed'),
                status: 'failed',
            });
        }
    }
    return results;
}

function summaryCardsHtml(items = []) {
    return `<div class="ams-kpi-grid">${items.map((item) => `
        <article class="ams-card">
            <div class="ams-kpi-value">${esc(String(item.value))}</div>
            <div class="ams-kpi-label">${esc(item.label)}</div>
            ${item.help ? `<div class="ams-kpi-sub">${esc(item.help)}</div>` : ''}
        </article>
    `).join('')}</div>`;
}

function selectedDocument(documents = []) {
    return documents.find((item) => item.id === moduleState.editingDocumentId) || null;
}

function selectedRule(rules = []) {
    return rules.find((item) => item.id === moduleState.editingRuleId) || null;
}

function filterKnowledgeDocuments(documents = []) {
    const filters = moduleState.documentFilters;
    return documents.filter((doc) => (
        matchesQuery([doc.title, doc.canonical_url, doc.excerpt], filters.query)
        && (filters.sourceType === FILTER_ALL || text(doc.source_type) === filters.sourceType)
        && (filters.visibility === FILTER_ALL || text(doc.visibility) === filters.visibility)
        && (filters.status === FILTER_ALL || text(doc.status) === filters.status)
        && (filters.language === FILTER_ALL || normalizeLanguage(doc.language, 'en') === filters.language)
    ));
}

function filterFaqRules(rules = []) {
    const filters = moduleState.ruleFilters;
    return rules.filter((rule) => (
        matchesQuery([rule.intent_key, ...(rule.trigger_patterns || [])], filters.query)
        && (filters.status === FILTER_ALL || text(rule.status) === filters.status)
        && (filters.language === FILTER_ALL || normalizeLanguage(rule.language, 'en') === filters.language)
        && (filters.handoff === FILTER_ALL || text(rule.handoff_reason) === filters.handoff)
    ));
}

function filterChatLogs(logs = []) {
    const filters = moduleState.qaFilters;
    return logs.filter((log) => {
        const failedState = log.failed ? 'failed' : 'ok';
        return (
            (filters.feedback === FILTER_ALL || text(log.feedback_status) === filters.feedback)
            && (filters.failed === FILTER_ALL || failedState === filters.failed)
            && (filters.provider === FILTER_ALL || text(log.provider) === filters.provider)
            && matchesQuery([log.matched_intent], filters.intent)
        );
    });
}

function buildKnowledgeSaveSummary(saved = null) {
    if (!saved) return null;
    return {
        documentId: saved.id,
        title: saved.title,
        chunkCount: saved.chunk_count,
        preview: saved.chunk_preview || [],
        keywords: saved.keywords || [],
    };
}

export async function renderKnowledgeAdminPage(input) {
    const { user, setPageHeader, setContent, showToast, withButtonBusy } = input;
    setPageHeader('知识库', '管理机器人知识文档和确定性 FAQ 规则。');

    let documents = [];
    let rules = [];
    let loadError = null;
    try {
        [documents, rules] = await Promise.all([fetchKnowledgeDocuments(), fetchFaqRules()]);
    } catch (error) {
        loadError = error;
    }

    if (loadError) {
        setContent(`<div class="ams-empty">知识库页面暂不可用：${esc(knowledgeAdminErrorMessage(loadError, 'unknown error'))}<br>建议先检查迁移：${esc(KNOWLEDGE_MIGRATION_HINT)}</div>`);
        return;
    }

    const activeDocument = selectedDocument(documents);
    const activeRule = selectedRule(rules);
    const filteredDocuments = filterKnowledgeDocuments(documents);
    const filteredRules = filterFaqRules(rules);
    const activeDocumentKeywords = sourceMetaKeywords(activeDocument?.source_meta);
    const activeRuleSourceRefs = normalizeSourceRefs(activeRule?.source_refs);
    const documentSummary = moduleState.lastKnowledgeSaveSummary && moduleState.lastKnowledgeSaveSummary.documentId === activeDocument?.id
        ? moduleState.lastKnowledgeSaveSummary
        : null;
    const documentSourceTypeOptions = [
        { value: FILTER_ALL, label: '全部类型' },
        ...Array.from(new Set(documents.map((item) => text(item.source_type)).filter(Boolean))).sort().map((item) => ({
            value: item,
            label: labelFor(item, KNOWLEDGE_SOURCE_TYPE_LABELS, item),
        })),
    ];
    const documentVisibilityOptions = [
        { value: FILTER_ALL, label: '全部可见性' },
        ...optionPairs(KNOWLEDGE_VISIBILITY, KNOWLEDGE_VISIBILITY_LABELS),
    ];
    const documentStatusOptions = [
        { value: FILTER_ALL, label: '全部状态' },
        ...optionPairs(KNOWLEDGE_STATUS, KNOWLEDGE_STATUS_LABELS),
    ];
    const languageOptions = [
        { value: FILTER_ALL, label: '全部语言' },
        { value: 'zh', label: 'ZH' },
        { value: 'en', label: 'EN' },
        { value: 'ru', label: 'RU' },
    ];
    const ruleStatusOptions = [
        { value: FILTER_ALL, label: '全部状态' },
        ...optionPairs(KNOWLEDGE_STATUS, KNOWLEDGE_STATUS_LABELS),
    ];
    const ruleHandoffOptions = [
        { value: FILTER_ALL, label: '全部交接' },
        ...optionPairs(['unknown', 'quote', 'lead', 'support'], HANDOFF_REASON_LABELS),
    ];

    setContent(`
        ${summaryCardsHtml([
            { label: '知识文档', value: filteredDocuments.length, help: filteredDocuments.length === documents.length ? '当前文档总数' : `筛选后 ${filteredDocuments.length} / 全部 ${documents.length}` },
            { label: 'FAQ 规则', value: filteredRules.length, help: filteredRules.length === rules.length ? '当前规则总数' : `筛选后 ${filteredRules.length} / 全部 ${rules.length}` },
        ])}
        <section class="ams-card" style="margin-top:12px">
            <div class="ams-section-head"><div><h3>${activeDocument ? '编辑知识文档' : '新建知识文档'}</h3><p>保存文档后会自动重建检索 chunks；原始 source meta 由系统维护，不在这里直接暴露。</p></div></div>
            <form id="knowledge-document-form" class="ams-form">
                <div class="ams-site-field-grid ams-site-field-grid-wide">
                    <div class="ams-field"><label>标题</label><input id="kb-doc-title" class="ams-input" value="${esc(activeDocument?.title || '')}" placeholder="GasGx 技术支持范围"></div>
                    <div class="ams-field"><label>语言</label><select id="kb-doc-language" class="ams-select">${optionMarkup(['en', 'zh', 'ru'], normalizeLanguage(activeDocument?.language, 'en'))}</select></div>
                    <div class="ams-field"><label>来源类型</label><select id="kb-doc-source-type" class="ams-select">${optionMarkup(KNOWLEDGE_SOURCE_TYPES, text(activeDocument?.source_type, 'internal_sales_kb'))}</select></div>
                    <div class="ams-field"><label>可见性</label><select id="kb-doc-visibility" class="ams-select">${optionMarkup(KNOWLEDGE_VISIBILITY, text(activeDocument?.visibility, 'public'))}</select></div>
                    <div class="ams-field"><label>状态</label><select id="kb-doc-status" class="ams-select">${optionMarkup(KNOWLEDGE_STATUS, text(activeDocument?.status, 'draft'))}</select></div>
                    <div class="ams-field"><label>Canonical URL</label><input id="kb-doc-url" class="ams-input" value="${esc(activeDocument?.canonical_url || '')}" placeholder="kb://gasgx/example 或 https://www.gasgx.com/products/..."></div>
                </div>
                <div class="ams-site-field-grid ams-site-field-grid-wide" style="margin-top:10px">
                    <div class="ams-field"><label>摘要</label><textarea id="kb-doc-excerpt" class="ams-input" rows="3">${esc(activeDocument?.excerpt || '')}</textarea></div>
                    <div class="ams-field"><label>关键词（逗号或换行分隔）</label><textarea id="kb-doc-keywords" class="ams-input" rows="3" placeholder="support, after-sales, service scope">${esc(activeDocumentKeywords.join('\n'))}</textarea></div>
                </div>
                <div class="ams-field" style="margin-top:10px"><label>正文 Markdown</label><textarea id="kb-doc-content" class="ams-input" rows="12">${esc(activeDocument?.content_markdown || '')}</textarea></div>
                <div class="ams-row-actions" style="margin-top:12px">
                    <button id="kb-doc-save" class="ams-btn ams-btn-primary" type="submit">${activeDocument ? '保存文档' : '创建文档'}</button>
                    <button id="kb-doc-reset" class="ams-btn ams-btn-muted" type="button">清空表单</button>
                </div>
            </form>
        </section>
        ${documentSummary ? `
        <section class="ams-card" style="margin-top:12px">
            <div class="ams-section-head"><div><h3>最近一次切块结果</h3><p>${esc(documentSummary.title || '当前文档')}</p></div></div>
            <div class="ams-footnote">共生成 ${esc(String(documentSummary.chunkCount || 0))} 个 chunk；关键词：${esc((documentSummary.keywords || []).join(', ') || '--')}</div>
            <div class="ams-table-wrap" style="margin-top:10px"><table class="ams-table" style="min-width:780px"><thead><tr><th>Section</th><th>Chunk Preview</th></tr></thead><tbody>
                ${(documentSummary.preview || []).map((item) => `<tr><td>${esc(item.section_path || '--')}</td><td>${esc(item.preview || '--')}</td></tr>`).join('') || '<tr><td colspan="2"><div class="ams-empty">当前没有 chunk 预览。</div></td></tr>'}
            </tbody></table></div>
        </section>
        ` : ''}
        <section class="ams-card" style="margin-top:12px">
            <div class="ams-section-head"><div><h3>知识文档列表</h3><p>公开站功能目录用 <code>site_function</code>，公开事实用 <code>public_page / resource_doc</code>，销售内知识用 <code>internal_sales_kb</code>。</p></div></div>
            <div class="ams-site-field-grid ams-site-field-grid-wide" style="margin-bottom:12px">
                <div class="ams-field"><label>搜索标题 / URL</label><input id="kb-doc-filter-query" class="ams-input" value="${esc(moduleState.documentFilters.query)}" placeholder="support / kb:// / products"></div>
                <div class="ams-field"><label>来源类型</label><select id="kb-doc-filter-type" class="ams-select">${optionMarkupFromPairs(documentSourceTypeOptions, moduleState.documentFilters.sourceType)}</select></div>
                <div class="ams-field"><label>可见性</label><select id="kb-doc-filter-visibility" class="ams-select">${optionMarkupFromPairs(documentVisibilityOptions, moduleState.documentFilters.visibility)}</select></div>
                <div class="ams-field"><label>状态</label><select id="kb-doc-filter-status" class="ams-select">${optionMarkupFromPairs(documentStatusOptions, moduleState.documentFilters.status)}</select></div>
                <div class="ams-field"><label>语言</label><select id="kb-doc-filter-language" class="ams-select">${optionMarkupFromPairs(languageOptions, moduleState.documentFilters.language)}</select></div>
            </div>
            <div class="ams-table-wrap"><table class="ams-table" style="min-width:980px"><thead><tr><th>Title</th><th>Lang</th><th>Type</th><th>Visibility</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead><tbody>
                ${filteredDocuments.length ? filteredDocuments.map((doc) => `<tr>
                    <td><strong>${esc(doc.title || '--')}</strong><div class="ams-footnote">${esc(doc.canonical_url || '--')}</div></td>
                    <td>${esc(normalizeLanguage(doc.language, 'en').toUpperCase())}</td>
                    <td>${esc(labelFor(doc.source_type, KNOWLEDGE_SOURCE_TYPE_LABELS))}</td>
                    <td>${esc(labelFor(doc.visibility, KNOWLEDGE_VISIBILITY_LABELS))}</td>
                    <td>${esc(labelFor(doc.status, KNOWLEDGE_STATUS_LABELS))}</td>
                    <td>${esc(fmtDate(doc.updated_at || doc.last_crawled_at))}</td>
                    <td><div class="ams-row-actions">
                        <button class="ams-btn ams-btn-muted" type="button" data-kb-doc-edit="${esc(doc.id)}">编辑</button>
                        ${doc.status !== 'published' ? `<button class="ams-btn ams-btn-primary" type="button" data-kb-doc-status="${esc(doc.id)}" data-kb-next-status="published">发布</button>` : ''}
                        ${doc.status !== 'archived' ? `<button class="ams-btn ams-btn-muted" type="button" data-kb-doc-status="${esc(doc.id)}" data-kb-next-status="archived">归档</button>` : ''}
                    </div></td>
                </tr>`).join('') : '<tr><td colspan="7"><div class="ams-empty">当前筛选下没有知识文档。</div></td></tr>'}
            </tbody></table></div>
        </section>
        <section class="ams-card" style="margin-top:12px">
            <div class="ams-section-head"><div><h3>${activeRule ? '编辑 FAQ 规则' : '新建 FAQ 规则'}</h3><p>这些规则会在高置信意图下优先于 RAG / 模型生成。</p></div></div>
            <form id="knowledge-rule-form" class="ams-form">
                <div class="ams-site-field-grid ams-site-field-grid-wide">
                    <div class="ams-field"><label>Intent Key</label><input id="kb-rule-intent" class="ams-input" value="${esc(activeRule?.intent_key || '')}" placeholder="product_overview"></div>
                    <div class="ams-field"><label>语言</label><select id="kb-rule-language" class="ams-select">${optionMarkup(['en', 'zh', 'ru'], normalizeLanguage(activeRule?.language, 'en'))}</select></div>
                    <div class="ams-field"><label>状态</label><select id="kb-rule-status" class="ams-select">${optionMarkup(KNOWLEDGE_STATUS, text(activeRule?.status, 'draft'))}</select></div>
                    <div class="ams-field"><label>交接类型</label><select id="kb-rule-handoff-reason" class="ams-select">${optionMarkup(['unknown', 'quote', 'lead', 'support'], text(activeRule?.handoff_reason, 'unknown'))}</select></div>
                </div>
                <div class="ams-field" style="margin-top:10px"><label>触发词（逗号或换行分隔）</label><textarea id="kb-rule-patterns" class="ams-input" rows="4">${esc((activeRule?.trigger_patterns || []).join('\n'))}</textarea></div>
                <div class="ams-field" style="margin-top:10px"><label>回答模板</label><textarea id="kb-rule-answer" class="ams-input" rows="8">${esc(activeRule?.answer_template || '')}</textarea></div>
                <div class="ams-field" style="margin-top:10px"><label>下一步所需字段（逗号或换行分隔）</label><textarea id="kb-rule-next-fields" class="ams-input" rows="3">${esc((activeRule?.next_fields || []).join('\n'))}</textarea></div>
                <div class="ams-card" style="margin-top:12px; background:rgba(255,255,255,0.02)">
                    <div class="ams-section-head"><div><h3>来源链接</h3><p>这里配置回答里要带出的主来源或推荐入口。</p></div></div>
                    <div id="kb-rule-source-refs">${sourceRefsEditorHtml(activeRuleSourceRefs)}</div>
                    <div class="ams-row-actions" style="margin-top:12px">
                        <button id="kb-rule-add-source-ref" class="ams-btn ams-btn-muted" type="button">添加来源链接</button>
                    </div>
                </div>
                <div class="ams-inline-actions" style="margin-top:12px">
                    <label class="ams-social-toggle"><input id="kb-rule-handoff-required" type="checkbox" ${activeRule?.handoff_required ? 'checked' : ''}><span>需要交接</span></label>
                </div>
                <div class="ams-row-actions" style="margin-top:12px">
                    <button id="kb-rule-save" class="ams-btn ams-btn-primary" type="submit">${activeRule ? '保存规则' : '创建规则'}</button>
                    <button id="kb-rule-reset" class="ams-btn ams-btn-muted" type="button">清空表单</button>
                </div>
            </form>
        </section>
        <section class="ams-card" style="margin-top:12px">
            <div class="ams-section-head"><div><h3>FAQ 规则列表</h3><p>已发布规则会在知识检索和模型生成之前优先生效。</p></div></div>
            <div class="ams-site-field-grid ams-site-field-grid-wide" style="margin-bottom:12px">
                <div class="ams-field"><label>搜索 Intent / 触发词</label><input id="kb-rule-filter-query" class="ams-input" value="${esc(moduleState.ruleFilters.query)}" placeholder="product_overview / quote"></div>
                <div class="ams-field"><label>状态</label><select id="kb-rule-filter-status" class="ams-select">${optionMarkupFromPairs(ruleStatusOptions, moduleState.ruleFilters.status)}</select></div>
                <div class="ams-field"><label>语言</label><select id="kb-rule-filter-language" class="ams-select">${optionMarkupFromPairs(languageOptions, moduleState.ruleFilters.language)}</select></div>
                <div class="ams-field"><label>交接</label><select id="kb-rule-filter-handoff" class="ams-select">${optionMarkupFromPairs(ruleHandoffOptions, moduleState.ruleFilters.handoff)}</select></div>
            </div>
            <div class="ams-table-wrap"><table class="ams-table" style="min-width:980px"><thead><tr><th>Intent</th><th>Lang</th><th>Status</th><th>Handoff</th><th>Updated</th><th>Actions</th></tr></thead><tbody>
                ${filteredRules.length ? filteredRules.map((rule) => `<tr>
                    <td><strong>${esc(rule.intent_key || '--')}</strong><div class="ams-footnote">${esc((rule.trigger_patterns || []).slice(0, 3).join(', ') || '--')}</div></td>
                    <td>${esc(normalizeLanguage(rule.language, 'en').toUpperCase())}</td>
                    <td>${esc(labelFor(rule.status, KNOWLEDGE_STATUS_LABELS))}</td>
                    <td>${rule.handoff_required ? `${esc(labelFor(rule.handoff_reason, HANDOFF_REASON_LABELS))}` : '无'}</td>
                    <td>${esc(fmtDate(rule.updated_at))}</td>
                    <td><div class="ams-row-actions">
                        <button class="ams-btn ams-btn-muted" type="button" data-kb-rule-edit="${esc(rule.id)}">编辑</button>
                        ${rule.status !== 'published' ? `<button class="ams-btn ams-btn-primary" type="button" data-kb-rule-status="${esc(rule.id)}" data-kb-next-status="published">发布</button>` : ''}
                        ${rule.status !== 'archived' ? `<button class="ams-btn ams-btn-muted" type="button" data-kb-rule-status="${esc(rule.id)}" data-kb-next-status="archived">归档</button>` : ''}
                    </div></td>
                </tr>`).join('') : '<tr><td colspan="6"><div class="ams-empty">当前筛选下没有 FAQ 规则。</div></td></tr>'}
            </tbody></table></div>
        </section>
    `);

    bindSourceRefEditor('kb-rule-source-refs', 'kb-rule-add-source-ref');

    document.getElementById('knowledge-document-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        await withButtonBusy(document.getElementById('kb-doc-save'), '保存中...', async () => {
            try {
                const saved = await saveKnowledgeDocument({
                    id: moduleState.editingDocumentId,
                    title: document.getElementById('kb-doc-title')?.value || '',
                    language: document.getElementById('kb-doc-language')?.value || 'en',
                    source_type: document.getElementById('kb-doc-source-type')?.value || 'internal_sales_kb',
                    visibility: document.getElementById('kb-doc-visibility')?.value || 'public',
                    status: document.getElementById('kb-doc-status')?.value || 'draft',
                    canonical_url: document.getElementById('kb-doc-url')?.value || '',
                    excerpt: document.getElementById('kb-doc-excerpt')?.value || '',
                    content_markdown: document.getElementById('kb-doc-content')?.value || '',
                    source_meta: activeDocument?.source_meta || {},
                    keywords: document.getElementById('kb-doc-keywords')?.value || '',
                }, user?.id || null);
                moduleState.editingDocumentId = saved.id;
                moduleState.lastKnowledgeSaveSummary = buildKnowledgeSaveSummary(saved);
                showToast('知识文档已保存，检索块已重建。');
                await renderKnowledgeAdminPage(input);
            } catch (error) {
                showToast(knowledgeAdminErrorMessage(error, '保存知识文档失败。'), true);
            }
        });
    });

    document.getElementById('kb-doc-reset')?.addEventListener('click', async () => {
        moduleState.editingDocumentId = '';
        await renderKnowledgeAdminPage(input);
    });

    document.querySelectorAll('[data-kb-doc-edit]').forEach((button) => {
        button.addEventListener('click', async () => {
            moduleState.editingDocumentId = button.dataset.kbDocEdit || '';
            await renderKnowledgeAdminPage(input);
        });
    });

    document.querySelectorAll('[data-kb-doc-status]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = button.dataset.kbDocStatus || '';
            const nextStatus = button.dataset.kbNextStatus || 'draft';
            await withButtonBusy(button, '处理中...', async () => {
                try {
                    await updateKnowledgeDocumentStatus(id, nextStatus, user?.id || null);
                    showToast(`知识文档已${labelFor(nextStatus, KNOWLEDGE_STATUS_LABELS)}。`);
                    await renderKnowledgeAdminPage(input);
                } catch (error) {
                    showToast(knowledgeAdminErrorMessage(error, '更新知识文档状态失败。'), true);
                }
            });
        });
    });

    document.getElementById('knowledge-rule-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        await withButtonBusy(document.getElementById('kb-rule-save'), '保存中...', async () => {
            try {
                const saved = await saveFaqRule({
                    id: moduleState.editingRuleId,
                    intent_key: document.getElementById('kb-rule-intent')?.value || '',
                    language: document.getElementById('kb-rule-language')?.value || 'en',
                    trigger_patterns: document.getElementById('kb-rule-patterns')?.value || '',
                    answer_template: document.getElementById('kb-rule-answer')?.value || '',
                    handoff_required: Boolean(document.getElementById('kb-rule-handoff-required')?.checked),
                    handoff_reason: document.getElementById('kb-rule-handoff-reason')?.value || 'unknown',
                    next_fields: document.getElementById('kb-rule-next-fields')?.value || '',
                    source_refs: readSourceRefsFromEditor('kb-rule-source-refs'),
                    status: document.getElementById('kb-rule-status')?.value || 'draft',
                }, user?.id || null);
                moduleState.editingRuleId = saved?.id || moduleState.editingRuleId;
                showToast('FAQ 规则已保存。');
                await renderKnowledgeAdminPage(input);
            } catch (error) {
                showToast(knowledgeAdminErrorMessage(error, '保存 FAQ 规则失败。'), true);
            }
        });
    });

    document.getElementById('kb-rule-reset')?.addEventListener('click', async () => {
        moduleState.editingRuleId = '';
        await renderKnowledgeAdminPage(input);
    });

    document.querySelectorAll('[data-kb-rule-edit]').forEach((button) => {
        button.addEventListener('click', async () => {
            moduleState.editingRuleId = button.dataset.kbRuleEdit || '';
            await renderKnowledgeAdminPage(input);
        });
    });

    document.querySelectorAll('[data-kb-rule-status]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = button.dataset.kbRuleStatus || '';
            const nextStatus = button.dataset.kbNextStatus || 'draft';
            await withButtonBusy(button, '处理中...', async () => {
                try {
                    await updateFaqRuleStatus(id, nextStatus, user?.id || null);
                    showToast(`FAQ 规则已${labelFor(nextStatus, KNOWLEDGE_STATUS_LABELS)}。`);
                    await renderKnowledgeAdminPage(input);
                } catch (error) {
                    showToast(knowledgeAdminErrorMessage(error, '更新 FAQ 规则状态失败。'), true);
                }
            });
        });
    });

    const bindFilter = (id, target, key, eventName = 'change') => {
        document.getElementById(id)?.addEventListener(eventName, async (event) => {
            moduleState[target][key] = event.currentTarget?.value || '';
            await renderKnowledgeAdminPage(input);
        });
    };
    bindFilter('kb-doc-filter-query', 'documentFilters', 'query', 'input');
    bindFilter('kb-doc-filter-type', 'documentFilters', 'sourceType');
    bindFilter('kb-doc-filter-visibility', 'documentFilters', 'visibility');
    bindFilter('kb-doc-filter-status', 'documentFilters', 'status');
    bindFilter('kb-doc-filter-language', 'documentFilters', 'language');
    bindFilter('kb-rule-filter-query', 'ruleFilters', 'query', 'input');
    bindFilter('kb-rule-filter-status', 'ruleFilters', 'status');
    bindFilter('kb-rule-filter-language', 'ruleFilters', 'language');
    bindFilter('kb-rule-filter-handoff', 'ruleFilters', 'handoff');
}

export async function renderKnowledgeIngestionAdminPage(input) {
    const { user, setPageHeader, setContent, showToast, withButtonBusy } = input;
    setPageHeader('知识采集', '抓取公开站允许范围内的页面，并写入机器人可检索知识。');

    const report = moduleState.crawlReport;
    const reportItems = report?.items || [];
    const successCount = reportItems.filter((item) => item.ok).length;
    const failedCount = reportItems.length - successCount;

    setContent(`
        ${summaryCardsHtml([
            { label: '允许前缀', value: DEFAULT_INGEST_PREFIXES.length, help: '仅用于 sitemap 批量采集的公开路径前缀' },
            { label: '手工补种 URL', value: DEFAULT_INGEST_MANUAL_URLS.length, help: '适合首页、品牌页、报价入口等手工指定地址' },
            { label: '最近一次成功', value: successCount, help: report ? `共处理 ${reportItems.length} 条，失败 ${failedCount} 条` : '当前浏览器会话还没有执行过采集' },
        ])}
        <section class="ams-card" style="margin-top:12px">
            <div class="ams-section-head"><div><h3>批量采集配置</h3><p>保留 sitemap crawl 和 manual URL crawl 两种入口。系统只会保存允许范围内的公开页面，写入后默认发布为 public knowledge。</p></div></div>
            <div class="ams-site-field-grid ams-site-field-grid-wide">
                <div class="ams-field">
                    <label>允许采集前缀</label>
                    <textarea id="kb-ingest-prefixes" class="ams-input" rows="7">${esc(DEFAULT_INGEST_PREFIXES.join('\n'))}</textarea>
                    <div class="ams-footnote">用于 sitemap 批量过滤；每行一个前缀，支持逗号或换行分隔。</div>
                </div>
                <div class="ams-field">
                    <label>手工 URL</label>
                    <textarea id="kb-ingest-urls" class="ams-input" rows="7" placeholder="https://www.gasgx.com/products/...">${esc(DEFAULT_INGEST_MANUAL_URLS.join('\n'))}</textarea>
                    <div class="ams-footnote">手工 URL 仍会校验允许范围，超出范围的地址会被直接拦截。</div>
                </div>
            </div>
            <div class="ams-site-field-grid" style="margin-top:10px">
                <div class="ams-field"><label>单次上限</label><input id="kb-ingest-limit" class="ams-input" type="number" min="1" max="120" value="24"></div>
                <div class="ams-field">
                    <label>默认排除路径</label>
                    <textarea class="ams-input" rows="5" readonly>${esc(INGEST_EXCLUDED_PATH_PREFIXES.join('\n'))}</textarea>
                </div>
            </div>
            <div class="ams-footnote" style="margin-top:10px">采集失败如果提示知识表不存在，请先执行迁移：${esc(KNOWLEDGE_BASE_MIGRATION_HINT)}；如果是 <code>site_function</code> 保存失败，请补跑：${esc(KNOWLEDGE_SITE_FUNCTION_MIGRATION_HINT)}。</div>
            <div class="ams-row-actions" style="margin-top:12px">
                <button id="kb-run-sitemap" class="ams-btn ams-btn-primary" type="button">采集 sitemap</button>
                <button id="kb-run-urls" class="ams-btn ams-btn-muted" type="button">采集手工 URL</button>
            </div>
        </section>
        <section class="ams-card" style="margin-top:12px">
            <div class="ams-section-head"><div><h3>最近一次运行</h3><p>采集结果会直接写入 <code>knowledge_documents</code> 和 <code>knowledge_chunks</code>，并显示每条 URL 的写入状态。</p></div></div>
            <div id="kb-ingest-report">${report ? `
                <div class="ams-footnote">完成时间：${esc(fmtDate(report.completedAt))}；共 ${reportItems.length} 条，成功 ${successCount} 条，失败 ${failedCount} 条。</div>
                <div class="ams-table-wrap" style="margin-top:10px"><table class="ams-table" style="min-width:1080px"><thead><tr><th>URL</th><th>结果</th><th>标题 / 错误</th><th>语言</th><th>最终写入状态</th></tr></thead><tbody>
                    ${reportItems.map((item) => `<tr>
                        <td>${esc(item.url)}</td>
                        <td>${item.ok ? '成功' : '失败'}</td>
                        <td>${esc(item.ok ? (item.title || '--') : (item.error || '--'))}</td>
                        <td>${esc(item.language || '--')}</td>
                        <td>${esc(item.ok ? labelFor(KNOWLEDGE_STATUS_LABELS, item.status, item.status || '--') : '失败')}</td>
                    </tr>`).join('')}
                </tbody></table></div>
            ` : '<div class="ams-empty">当前浏览器会话里还没有执行过知识采集。</div>'}</div>
        </section>
    `);

    document.getElementById('kb-run-sitemap')?.addEventListener('click', async (event) => {
        await withButtonBusy(event.currentTarget, '采集中...', async () => {
            try {
                const limit = Math.max(1, Math.min(120, Number(document.getElementById('kb-ingest-limit')?.value || 24) || 24));
                const prefixes = parseListInput(document.getElementById('kb-ingest-prefixes')?.value || '').map((item) => item.replace(/\/?$/, '/'));
                const sitemapUrls = await getSitemapUrls();
                const filtered = sitemapUrls.filter((item) => {
                    try {
                        if (!isKnowledgeIngestAllowed(item)) return false;
                        const pathname = normalizePathname(new URL(item).pathname);
                        return prefixes.some((prefix) => {
                            const normalizedPrefix = normalizePathname(prefix);
                            return pathname === normalizedPrefix || pathname.startsWith(normalizedPrefix);
                        });
                    } catch (_error) {
                        return false;
                    }
                }).slice(0, limit);
                if (!filtered.length) {
                    throw new Error('当前前缀过滤后没有可采集 URL，请检查 sitemap 或允许前缀配置。');
                }
                const items = await crawlKnowledgeUrls(filtered, { userId: user?.id || null });
                moduleState.crawlReport = { completedAt: new Date().toISOString(), items };
                showToast(`sitemap 采集完成：成功 ${items.filter((item) => item.ok).length} / ${items.length}。`);
                await renderKnowledgeIngestionAdminPage(input);
            } catch (error) {
                showToast(knowledgeAdminErrorMessage(error, 'sitemap 采集失败。'), true);
            }
        });
    });

    document.getElementById('kb-run-urls')?.addEventListener('click', async (event) => {
        await withButtonBusy(event.currentTarget, '采集中...', async () => {
            try {
                const rawUrls = parseListInput(document.getElementById('kb-ingest-urls')?.value || '');
                const blockedUrls = rawUrls.filter((item) => !isKnowledgeIngestAllowed(item));
                if (blockedUrls.length) {
                    throw new Error(`以下 URL 不在允许采集范围内：${blockedUrls.slice(0, 5).join('、')}`);
                }
                const urls = rawUrls.filter((item) => isKnowledgeIngestAllowed(item));
                if (!urls.length) throw new Error('请至少输入一个允许采集的 URL。');
                const items = await crawlKnowledgeUrls(urls, { userId: user?.id || null });
                moduleState.crawlReport = { completedAt: new Date().toISOString(), items };
                showToast(`手工 URL 采集完成：成功 ${items.filter((item) => item.ok).length} / ${items.length}。`);
                await renderKnowledgeIngestionAdminPage(input);
            } catch (error) {
                showToast(knowledgeAdminErrorMessage(error, '手工 URL 采集失败。'), true);
            }
        });
    });
}

export async function renderChatQaAdminPage(input) {
    const { user, setPageHeader, setContent, showToast, withButtonBusy, navigateToPage } = input;
    setPageHeader('机器人质检', '复核聊天记录、补 FAQ 规则，并把缺失知识沉淀成知识草稿。');

    let logs = [];
    let leads = [];
    let loadError = null;
    try {
        [logs, leads] = await Promise.all([fetchChatLogs(), fetchLeadIntents()]);
    } catch (error) {
        loadError = error;
    }

    if (loadError) {
        setContent(`<div class="ams-empty">机器人质检数据暂不可用：${esc(knowledgeAdminErrorMessage(loadError, 'unknown error'))}。请检查迁移：${esc(KNOWLEDGE_MIGRATION_HINT)}</div>`);
        return;
    }

    const filteredLogs = filterChatLogs(logs);
    const providerOptions = [
        [FILTER_ALL, '全部模型'],
        ...optionPairs(Array.from(new Set(logs.map((item) => text(item.provider)).filter(Boolean))).sort()),
    ];
    const feedbackOptions = [
        [FILTER_ALL, '全部复核状态'],
        ...FEEDBACK_STATUS.map((status) => [status, labelFor(FEEDBACK_STATUS_LABELS, status, status)]),
    ];
    const failedOptions = [
        [FILTER_ALL, '全部运行结果'],
        ['ok', '仅正常'],
        ['failed', '仅失败'],
    ];

    setContent(`
        ${summaryCardsHtml([
            { label: '聊天记录', value: logs.length, help: '最近写入 chat_qa_logs 的问答记录' },
            { label: '当前筛选结果', value: filteredLogs.length, help: '按 feedback / failed / provider / matched intent 过滤后的记录数' },
            { label: '人工跟进线索', value: leads.length, help: '触发 quote / lead / support handoff 的会话' },
        ])}
        <section class="ams-card" style="margin-top:12px">
            <div class="ams-section-head"><div><h3>聊天记录复核</h3><p>优先用反馈状态标记“好答案 / 差答案 / 缺知识”。如果公开站功能问答缺主站链接，优先按 <code>site_function</code> 修知识，不要直接堆 FAQ。</p></div></div>
            <div class="ams-site-field-grid ams-site-field-grid-wide" style="margin-bottom:12px">
                <div class="ams-field"><label>复核状态</label><select id="kb-qa-filter-feedback" class="ams-input">${optionMarkupFromPairs(feedbackOptions, moduleState.qaFilters.feedback)}</select></div>
                <div class="ams-field"><label>运行结果</label><select id="kb-qa-filter-failed" class="ams-input">${optionMarkupFromPairs(failedOptions, moduleState.qaFilters.failed)}</select></div>
                <div class="ams-field"><label>模型提供方</label><select id="kb-qa-filter-provider" class="ams-input">${optionMarkupFromPairs(providerOptions, moduleState.qaFilters.provider)}</select></div>
                <div class="ams-field"><label>匹配意图</label><input id="kb-qa-filter-intent" class="ams-input" type="text" value="${esc(moduleState.qaFilters.intent)}" placeholder="按 matched_intent 搜索"></div>
            </div>
            <div class="ams-table-wrap"><table class="ams-table" style="min-width:1280px"><thead><tr><th>Time</th><th>Question</th><th>Provider</th><th>Intent</th><th>Status</th><th>Reply</th><th>Actions</th></tr></thead><tbody>
                ${filteredLogs.length ? filteredLogs.map((log) => `<tr>
                    <td>${esc(fmtDate(log.created_at))}</td>
                    <td><strong>${esc(log.user_message || '--')}</strong><div class="ams-footnote">${esc(log.language || '--')} / ${esc(log.session_id || '--')}</div></td>
                    <td>${esc(log.provider || '--')}${log.failed ? `<div class="ams-footnote" style="color:#ef4444">${esc(log.error_code || 'failed')}</div>` : '<div class="ams-footnote">ok</div>'}</td>
                    <td>${esc(log.matched_intent || '--')}</td>
                    <td>${esc(labelFor(FEEDBACK_STATUS_LABELS, log.feedback_status, log.feedback_status || '--'))}</td>
                    <td><div style="max-width:360px; white-space:pre-wrap">${esc((log.assistant_reply || '').slice(0, 280) || '--')}</div></td>
                    <td>
                        <div class="ams-row-actions">
                            ${FEEDBACK_STATUS.map((status) => `<button class="ams-btn ams-btn-muted" type="button" data-chat-feedback="${esc(log.id)}" data-feedback-status="${esc(status)}">${esc(labelFor(FEEDBACK_STATUS_LABELS, status, status))}</button>`).join('')}
                            <button class="ams-btn ams-btn-primary" type="button" data-chat-faq-draft="${esc(log.id)}">生成 FAQ 草稿</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-chat-knowledge-draft="${esc(log.id)}">生成知识草稿</button>
                        </div>
                    </td>
                </tr>`).join('') : '<tr><td colspan="7"><div class="ams-empty">当前筛选条件下没有机器人聊天记录。</div></td></tr>'}
            </tbody></table></div>
        </section>
        <section class="ams-card" style="margin-top:12px">
            <div class="ams-section-head"><div><h3>人工跟进线索</h3><p>这些记录来自机器人建议人工承接的会话，可用于回看 handoff 规则和字段要求。</p></div></div>
            <div class="ams-table-wrap"><table class="ams-table" style="min-width:980px"><thead><tr><th>Time</th><th>Intent</th><th>Question</th><th>Required Fields</th><th>Channel</th></tr></thead><tbody>
                ${leads.length ? leads.map((lead) => `<tr>
                    <td>${esc(fmtDate(lead.created_at))}</td>
                    <td>${esc(lead.detected_intent || '--')}</td>
                    <td><strong>${esc(lead.user_question || '--')}</strong><div class="ams-footnote">${esc(lead.language || '--')} / ${esc(lead.provider || '--')}</div></td>
                    <td>${esc((lead.required_followup_fields || []).join(', ') || '--')}</td>
                    <td>${esc(lead.contact_channel || '--')}</td>
                </tr>`).join('') : '<tr><td colspan="5"><div class="ams-empty">当前没有人工跟进线索。</div></td></tr>'}
            </tbody></table></div>
        </section>
    `);

    const logMap = new Map(logs.map((item) => [item.id, item]));
    const bindQaFilter = (id, key, eventName = 'change') => {
        document.getElementById(id)?.addEventListener(eventName, async (event) => {
            moduleState.qaFilters[key] = event.currentTarget?.value || (key === 'intent' ? '' : FILTER_ALL);
            await renderChatQaAdminPage(input);
        });
    };

    bindQaFilter('kb-qa-filter-feedback', 'feedback');
    bindQaFilter('kb-qa-filter-failed', 'failed');
    bindQaFilter('kb-qa-filter-provider', 'provider');
    bindQaFilter('kb-qa-filter-intent', 'intent', 'input');

    document.querySelectorAll('[data-chat-feedback]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = button.dataset.chatFeedback || '';
            const status = button.dataset.feedbackStatus || 'unreviewed';
            await withButtonBusy(button, '保存中...', async () => {
                try {
                    const note = window.prompt(`给“${labelFor(FEEDBACK_STATUS_LABELS, status, status)}”补充复核备注（可留空）：`, '') || '';
                    await updateChatFeedback(id, status, note, user?.id || null);
                    showToast('机器人质检状态已更新。');
                    await renderChatQaAdminPage(input);
                } catch (error) {
                    showToast(knowledgeAdminErrorMessage(error, '更新机器人质检状态失败。'), true);
                }
            });
        });
    });

    document.querySelectorAll('[data-chat-faq-draft]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = button.dataset.chatFaqDraft || '';
            const log = logMap.get(id);
            if (!log) return;
            await withButtonBusy(button, '生成中...', async () => {
                try {
                    await createFaqDraftFromLog(log, user?.id || null);
                    showToast('已从聊天记录生成 FAQ 草稿。');
                } catch (error) {
                    showToast(knowledgeAdminErrorMessage(error, '生成 FAQ 草稿失败。'), true);
                }
            });
        });
    });

    document.querySelectorAll('[data-chat-knowledge-draft]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = button.dataset.chatKnowledgeDraft || '';
            const log = logMap.get(id);
            if (!log) return;
            await withButtonBusy(button, '生成中...', async () => {
                try {
                    const saved = await createKnowledgeDraftFromLog(log, user?.id || null);
                    moduleState.editingDocumentId = saved.id;
                    moduleState.lastKnowledgeSaveSummary = buildKnowledgeSaveSummary(saved);
                    showToast('已从聊天记录生成知识草稿。');
                    if (typeof navigateToPage === 'function') {
                        await navigateToPage('knowledge');
                    } else {
                        await renderKnowledgeAdminPage(input);
                    }
                } catch (error) {
                    showToast(knowledgeAdminErrorMessage(error, '生成知识草稿失败。'), true);
                }
            });
        });
    });
}
