import { client } from './supabase.client.js?v=20260321admin01';

const KNOWLEDGE_MIGRATION_HINT = 'supabase/migrations/20260420160000_chat_knowledge_rag.sql';
const KNOWLEDGE_SOURCE_TYPES = ['public_page', 'resource_doc', 'internal_sales_kb', 'faq', 'datasheet', 'case_study', 'certification'];
const KNOWLEDGE_VISIBILITY = ['public', 'internal_sales'];
const KNOWLEDGE_STATUS = ['draft', 'published', 'archived'];
const FEEDBACK_STATUS = ['unreviewed', 'good', 'bad', 'needs_knowledge'];
const DEFAULT_INGEST_PREFIXES = ['/products/', '/solutions/', '/digitalization/', '/support/', '/resources/', '/use-cases/', '/rankings/', '/about/'];

const moduleState = {
    editingDocumentId: '',
    editingRuleId: '',
    crawlReport: null,
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

function parseListInput(value = '') {
    return Array.from(new Set(
        String(value || '')
            .split(/[\n,]+/)
            .map((item) => item.trim())
            .filter(Boolean),
    ));
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
            source_meta: {},
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
            source_meta: {},
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

    return {
        title,
        language,
        canonical_url: text(documentNode.querySelector('link[rel="canonical"]')?.href, parsedUrl.toString()),
        excerpt: collapseWhitespace(excerptBlock).slice(0, 260),
        content_markdown: contentMarkdown,
        source_type: normalizeSourceType(parsedUrl.pathname),
        source_meta: {
            path: parsedUrl.pathname,
            fetched_at: new Date().toISOString(),
            title,
        },
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
        .select('id, source_type, visibility, language, title, canonical_url, excerpt, content_markdown, status, last_crawled_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(80);
    if (error) throw error;
    return Array.isArray(data) ? data : [];
}

async function fetchFaqRules() {
    const { data, error } = await client
        .from('chat_faq_rules')
        .select('id, intent_key, language, trigger_patterns, answer_template, handoff_required, handoff_reason, next_fields, status, updated_at')
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
    const rowPayload = {
        id: text(payload.id) || undefined,
        source_type: text(payload.source_type, 'internal_sales_kb'),
        visibility: text(payload.visibility, 'public'),
        language: normalizeLanguage(payload.language, 'en'),
        title: text(payload.title),
        canonical_url: text(payload.canonical_url),
        excerpt: text(payload.excerpt),
        content_markdown: text(payload.content_markdown),
        source_meta: payload.source_meta && typeof payload.source_meta === 'object' ? payload.source_meta : {},
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
        keywords: payload.keywords || [],
    });
    await replaceKnowledgeChunks(data.id, chunks);
    return data;
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
    const { error } = await query;
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
    await saveFaqRule({
        intent_key: `${intentBase}_draft`,
        language: normalizeLanguage(log.language, 'en'),
        trigger_patterns: [text(log.user_message)],
        answer_template: text(log.assistant_reply),
        handoff_required: false,
        handoff_reason: 'unknown',
        next_fields: [],
        status: 'draft',
    }, userId);
}

async function getSitemapUrls() {
    const response = await fetch('/sitemap.xml', { cache: 'no-store' });
    if (!response.ok) throw new Error(`sitemap_http_${response.status}`);
    const raw = await response.text();
    return Array.from(new Set(
        Array.from(raw.matchAll(/<loc>(.*?)<\/loc>/gi)).map((match) => text(match[1])).filter(Boolean),
    ));
}

async function crawlKnowledgeUrls(urls = [], options = {}) {
    const userId = options.userId || null;
    const results = [];
    for (const url of urls) {
        try {
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
            });
        } catch (error) {
            results.push({
                ok: false,
                url,
                error: error.message || 'crawl_failed',
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

export async function renderKnowledgeAdminPage(input) {
    const { user, setPageHeader, setContent, showToast, withButtonBusy } = input;
    setPageHeader('Knowledge', 'Manage chatbot documents and deterministic FAQ rules for GasGx sales conversations.');

    let documents = [];
    let rules = [];
    let loadError = null;
    try {
        [documents, rules] = await Promise.all([fetchKnowledgeDocuments(), fetchFaqRules()]);
    } catch (error) {
        loadError = error;
    }

    if (loadError) {
        setContent(`<div class="ams-empty">Knowledge tables are unavailable: ${esc(loadError.message || 'unknown error')}. Run SQL migration: ${esc(KNOWLEDGE_MIGRATION_HINT)}</div>`);
        return;
    }

    const activeDocument = selectedDocument(documents);
    const activeRule = selectedRule(rules);

    setContent(`
        ${summaryCardsHtml([
            { label: 'Documents', value: documents.length, help: 'Published, draft and archived knowledge records' },
            { label: 'FAQ Rules', value: rules.length, help: 'Deterministic answers for high-frequency intents' },
        ])}
        <section class="ams-card" style="margin-top:12px">
            <div class="ams-section-head"><div><h3>${activeDocument ? 'Edit Knowledge Document' : 'Create Knowledge Document'}</h3><p>Saving a document automatically rebuilds its knowledge chunks.</p></div></div>
            <form id="knowledge-document-form" class="ams-form">
                <div class="ams-site-field-grid ams-site-field-grid-wide">
                    <div class="ams-field"><label>Title</label><input id="kb-doc-title" class="ams-input" value="${esc(activeDocument?.title || '')}" placeholder="GasGx support scope"></div>
                    <div class="ams-field"><label>Language</label><select id="kb-doc-language" class="ams-select">${optionMarkup(['en', 'zh', 'ru'], normalizeLanguage(activeDocument?.language, 'en'))}</select></div>
                    <div class="ams-field"><label>Source Type</label><select id="kb-doc-source-type" class="ams-select">${optionMarkup(KNOWLEDGE_SOURCE_TYPES, text(activeDocument?.source_type, 'internal_sales_kb'))}</select></div>
                    <div class="ams-field"><label>Visibility</label><select id="kb-doc-visibility" class="ams-select">${optionMarkup(KNOWLEDGE_VISIBILITY, text(activeDocument?.visibility, 'public'))}</select></div>
                    <div class="ams-field"><label>Status</label><select id="kb-doc-status" class="ams-select">${optionMarkup(KNOWLEDGE_STATUS, text(activeDocument?.status, 'draft'))}</select></div>
                    <div class="ams-field"><label>Canonical URL</label><input id="kb-doc-url" class="ams-input" value="${esc(activeDocument?.canonical_url || '')}" placeholder="kb://gasgx/example or https://www.gasgx.com/products/..."></div>
                </div>
                <div class="ams-field" style="margin-top:10px"><label>Excerpt</label><textarea id="kb-doc-excerpt" class="ams-input" rows="3">${esc(activeDocument?.excerpt || '')}</textarea></div>
                <div class="ams-field" style="margin-top:10px"><label>Content Markdown</label><textarea id="kb-doc-content" class="ams-input" rows="12">${esc(activeDocument?.content_markdown || '')}</textarea></div>
                <div class="ams-row-actions" style="margin-top:12px">
                    <button id="kb-doc-save" class="ams-btn ams-btn-primary" type="submit">${activeDocument ? 'Save document' : 'Create document'}</button>
                    <button id="kb-doc-reset" class="ams-btn ams-btn-muted" type="button">Clear form</button>
                </div>
            </form>
        </section>
        <section class="ams-card" style="margin-top:12px">
            <div class="ams-section-head"><div><h3>Knowledge Documents</h3><p>Use public documents for site facts and internal_sales for sales-only guidance.</p></div></div>
            <div class="ams-table-wrap"><table class="ams-table" style="min-width:980px"><thead><tr><th>Title</th><th>Lang</th><th>Type</th><th>Visibility</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead><tbody>
                ${documents.length ? documents.map((doc) => `<tr>
                    <td><strong>${esc(doc.title || '--')}</strong><div class="ams-footnote">${esc(doc.canonical_url || '--')}</div></td>
                    <td>${esc(doc.language || '--')}</td>
                    <td>${esc(doc.source_type || '--')}</td>
                    <td>${esc(doc.visibility || '--')}</td>
                    <td>${esc(doc.status || '--')}</td>
                    <td>${esc(fmtDate(doc.updated_at || doc.last_crawled_at))}</td>
                    <td><button class="ams-btn ams-btn-muted" type="button" data-kb-doc-edit="${esc(doc.id)}">Edit</button></td>
                </tr>`).join('') : '<tr><td colspan="7"><div class="ams-empty">No knowledge documents yet.</div></td></tr>'}
            </tbody></table></div>
        </section>
        <section class="ams-card" style="margin-top:12px">
            <div class="ams-section-head"><div><h3>${activeRule ? 'Edit FAQ Rule' : 'Create FAQ Rule'}</h3><p>These rules override model generation for high-confidence sales questions.</p></div></div>
            <form id="knowledge-rule-form" class="ams-form">
                <div class="ams-site-field-grid ams-site-field-grid-wide">
                    <div class="ams-field"><label>Intent Key</label><input id="kb-rule-intent" class="ams-input" value="${esc(activeRule?.intent_key || '')}" placeholder="product_overview"></div>
                    <div class="ams-field"><label>Language</label><select id="kb-rule-language" class="ams-select">${optionMarkup(['en', 'zh', 'ru'], normalizeLanguage(activeRule?.language, 'en'))}</select></div>
                    <div class="ams-field"><label>Status</label><select id="kb-rule-status" class="ams-select">${optionMarkup(KNOWLEDGE_STATUS, text(activeRule?.status, 'draft'))}</select></div>
                    <div class="ams-field"><label>Handoff Reason</label><select id="kb-rule-handoff-reason" class="ams-select">${optionMarkup(['unknown', 'quote', 'lead', 'support'], text(activeRule?.handoff_reason, 'unknown'))}</select></div>
                </div>
                <div class="ams-field" style="margin-top:10px"><label>Trigger Patterns (comma or newline separated)</label><textarea id="kb-rule-patterns" class="ams-input" rows="4">${esc((activeRule?.trigger_patterns || []).join('\n'))}</textarea></div>
                <div class="ams-field" style="margin-top:10px"><label>Answer Template</label><textarea id="kb-rule-answer" class="ams-input" rows="8">${esc(activeRule?.answer_template || '')}</textarea></div>
                <div class="ams-field" style="margin-top:10px"><label>Next Fields (comma or newline separated)</label><textarea id="kb-rule-next-fields" class="ams-input" rows="3">${esc((activeRule?.next_fields || []).join('\n'))}</textarea></div>
                <div class="ams-inline-actions" style="margin-top:12px">
                    <label class="ams-social-toggle"><input id="kb-rule-handoff-required" type="checkbox" ${activeRule?.handoff_required ? 'checked' : ''}><span>Require handoff</span></label>
                </div>
                <div class="ams-row-actions" style="margin-top:12px">
                    <button id="kb-rule-save" class="ams-btn ams-btn-primary" type="submit">${activeRule ? 'Save rule' : 'Create rule'}</button>
                    <button id="kb-rule-reset" class="ams-btn ams-btn-muted" type="button">Clear form</button>
                </div>
            </form>
        </section>
        <section class="ams-card" style="margin-top:12px">
            <div class="ams-section-head"><div><h3>FAQ Rules</h3><p>Published rules are evaluated before RAG retrieval.</p></div></div>
            <div class="ams-table-wrap"><table class="ams-table" style="min-width:980px"><thead><tr><th>Intent</th><th>Lang</th><th>Status</th><th>Handoff</th><th>Updated</th><th>Actions</th></tr></thead><tbody>
                ${rules.length ? rules.map((rule) => `<tr>
                    <td><strong>${esc(rule.intent_key || '--')}</strong><div class="ams-footnote">${esc((rule.trigger_patterns || []).slice(0, 3).join(', ') || '--')}</div></td>
                    <td>${esc(rule.language || '--')}</td>
                    <td>${esc(rule.status || '--')}</td>
                    <td>${rule.handoff_required ? `${esc(rule.handoff_reason || 'unknown')}` : 'no'}</td>
                    <td>${esc(fmtDate(rule.updated_at))}</td>
                    <td><button class="ams-btn ams-btn-muted" type="button" data-kb-rule-edit="${esc(rule.id)}">Edit</button></td>
                </tr>`).join('') : '<tr><td colspan="6"><div class="ams-empty">No FAQ rules yet.</div></td></tr>'}
            </tbody></table></div>
        </section>
    `);

    document.getElementById('knowledge-document-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        await withButtonBusy(document.getElementById('kb-doc-save'), 'Saving...', async () => {
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
                }, user?.id || null);
                moduleState.editingDocumentId = saved.id;
                showToast('Knowledge document saved and chunks rebuilt.');
                await renderKnowledgeAdminPage(input);
            } catch (error) {
                showToast(error.message || 'Saving knowledge document failed.', true);
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

    document.getElementById('knowledge-rule-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        await withButtonBusy(document.getElementById('kb-rule-save'), 'Saving...', async () => {
            try {
                await saveFaqRule({
                    id: moduleState.editingRuleId,
                    intent_key: document.getElementById('kb-rule-intent')?.value || '',
                    language: document.getElementById('kb-rule-language')?.value || 'en',
                    trigger_patterns: document.getElementById('kb-rule-patterns')?.value || '',
                    answer_template: document.getElementById('kb-rule-answer')?.value || '',
                    handoff_required: Boolean(document.getElementById('kb-rule-handoff-required')?.checked),
                    handoff_reason: document.getElementById('kb-rule-handoff-reason')?.value || 'unknown',
                    next_fields: document.getElementById('kb-rule-next-fields')?.value || '',
                    status: document.getElementById('kb-rule-status')?.value || 'draft',
                }, user?.id || null);
                showToast('FAQ rule saved.');
                await renderKnowledgeAdminPage(input);
            } catch (error) {
                showToast(error.message || 'Saving FAQ rule failed.', true);
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
}

export async function renderKnowledgeIngestionAdminPage(input) {
    const { user, setPageHeader, setContent, showToast, withButtonBusy } = input;
    setPageHeader('Ingestion', 'Crawl approved GasGx site sections from sitemap.xml and rebuild searchable knowledge chunks.');

    setContent(`
        <section class="ams-card">
            <div class="ams-section-head"><div><h3>Run Sitemap Crawl</h3><p>Only approved public sections are ingested by default.</p></div></div>
            <div class="ams-site-field-grid ams-site-field-grid-wide">
                <div class="ams-field"><label>Allowed Prefixes (comma or newline separated)</label><textarea id="kb-ingest-prefixes" class="ams-input" rows="6">${esc(DEFAULT_INGEST_PREFIXES.join('\n'))}</textarea></div>
                <div class="ams-field"><label>Manual URLs</label><textarea id="kb-ingest-urls" class="ams-input" rows="6" placeholder="https://www.gasgx.com/products/..."></textarea></div>
            </div>
            <div class="ams-site-field-grid" style="margin-top:10px">
                <div class="ams-field"><label>Limit</label><input id="kb-ingest-limit" class="ams-input" type="number" min="1" max="120" value="24"></div>
            </div>
            <div class="ams-row-actions" style="margin-top:12px">
                <button id="kb-run-sitemap" class="ams-btn ams-btn-primary" type="button">Crawl sitemap</button>
                <button id="kb-run-urls" class="ams-btn ams-btn-muted" type="button">Crawl manual URLs</button>
            </div>
        </section>
        <section class="ams-card" style="margin-top:12px">
            <div class="ams-section-head"><div><h3>Latest Run</h3><p>Results are written directly into knowledge_documents and knowledge_chunks.</p></div></div>
            <div id="kb-ingest-report">${moduleState.crawlReport ? `
                <div class="ams-footnote">Completed at ${esc(fmtDate(moduleState.crawlReport.completedAt))}</div>
                <div class="ams-table-wrap" style="margin-top:10px"><table class="ams-table" style="min-width:920px"><thead><tr><th>URL</th><th>Status</th><th>Title / Error</th><th>Language</th></tr></thead><tbody>
                    ${moduleState.crawlReport.items.map((item) => `<tr>
                        <td>${esc(item.url)}</td>
                        <td>${item.ok ? 'ok' : 'failed'}</td>
                        <td>${esc(item.ok ? (item.title || '--') : (item.error || '--'))}</td>
                        <td>${esc(item.language || '--')}</td>
                    </tr>`).join('')}
                </tbody></table></div>
            ` : '<div class="ams-empty">No crawl has been run in this browser session yet.</div>'}</div>
        </section>
    `);

    document.getElementById('kb-run-sitemap')?.addEventListener('click', async (event) => {
        await withButtonBusy(event.currentTarget, 'Crawling...', async () => {
            try {
                const limit = Math.max(1, Math.min(120, Number(document.getElementById('kb-ingest-limit')?.value || 24) || 24));
                const prefixes = parseListInput(document.getElementById('kb-ingest-prefixes')?.value || '').map((item) => item.replace(/\/?$/, '/'));
                const sitemapUrls = await getSitemapUrls();
                const filtered = sitemapUrls.filter((item) => {
                    try {
                        const pathname = new URL(item).pathname;
                        return prefixes.some((prefix) => pathname === prefix.slice(0, -1) || pathname.startsWith(prefix));
                    } catch (_error) {
                        return false;
                    }
                }).slice(0, limit);
                const items = await crawlKnowledgeUrls(filtered, { userId: user?.id || null });
                moduleState.crawlReport = { completedAt: new Date().toISOString(), items };
                showToast(`Sitemap crawl completed: ${items.filter((item) => item.ok).length}/${items.length} successful.`);
                await renderKnowledgeIngestionAdminPage(input);
            } catch (error) {
                showToast(error.message || 'Sitemap crawl failed.', true);
            }
        });
    });

    document.getElementById('kb-run-urls')?.addEventListener('click', async (event) => {
        await withButtonBusy(event.currentTarget, 'Crawling...', async () => {
            try {
                const urls = parseListInput(document.getElementById('kb-ingest-urls')?.value || '');
                if (!urls.length) throw new Error('Please enter at least one URL.');
                const items = await crawlKnowledgeUrls(urls, { userId: user?.id || null });
                moduleState.crawlReport = { completedAt: new Date().toISOString(), items };
                showToast(`Manual crawl completed: ${items.filter((item) => item.ok).length}/${items.length} successful.`);
                await renderKnowledgeIngestionAdminPage(input);
            } catch (error) {
                showToast(error.message || 'Manual URL crawl failed.', true);
            }
        });
    });
}

export async function renderChatQaAdminPage(input) {
    const { user, setPageHeader, setContent, showToast, withButtonBusy } = input;
    setPageHeader('Chat QA', 'Review chatbot conversations, flag failures, and convert good answers into new FAQ drafts.');

    let logs = [];
    let leads = [];
    let loadError = null;
    try {
        [logs, leads] = await Promise.all([fetchChatLogs(), fetchLeadIntents()]);
    } catch (error) {
        loadError = error;
    }

    if (loadError) {
        setContent(`<div class="ams-empty">Chat QA tables are unavailable: ${esc(loadError.message || 'unknown error')}. Run SQL migration: ${esc(KNOWLEDGE_MIGRATION_HINT)}</div>`);
        return;
    }

    setContent(`
        ${summaryCardsHtml([
            { label: 'Recent Logs', value: logs.length, help: 'Latest chatbot turns stored for QA review' },
            { label: 'Lead Intents', value: leads.length, help: 'Sessions that triggered quote/support handoff' },
        ])}
        <section class="ams-card" style="margin-top:12px">
            <div class="ams-section-head"><div><h3>Recent Chat Logs</h3><p>Use feedback status to drive rule training and knowledge gaps.</p></div></div>
            <div class="ams-table-wrap"><table class="ams-table" style="min-width:1280px"><thead><tr><th>Time</th><th>Question</th><th>Provider</th><th>Intent</th><th>Status</th><th>Reply</th><th>Actions</th></tr></thead><tbody>
                ${logs.length ? logs.map((log) => `<tr>
                    <td>${esc(fmtDate(log.created_at))}</td>
                    <td><strong>${esc(log.user_message || '--')}</strong><div class="ams-footnote">${esc(log.language || '--')} / ${esc(log.session_id || '--')}</div></td>
                    <td>${esc(log.provider || '--')}${log.failed ? `<div class="ams-footnote" style="color:#ef4444">${esc(log.error_code || 'failed')}</div>` : ''}</td>
                    <td>${esc(log.matched_intent || '--')}</td>
                    <td>${esc(log.feedback_status || '--')}</td>
                    <td><div style="max-width:360px; white-space:pre-wrap">${esc((log.assistant_reply || '').slice(0, 280) || '--')}</div></td>
                    <td>
                        <div class="ams-row-actions">
                            ${FEEDBACK_STATUS.map((status) => `<button class="ams-btn ams-btn-muted" type="button" data-chat-feedback="${esc(log.id)}" data-feedback-status="${esc(status)}">${esc(status)}</button>`).join('')}
                            <button class="ams-btn ams-btn-primary" type="button" data-chat-faq-draft="${esc(log.id)}">FAQ draft</button>
                        </div>
                    </td>
                </tr>`).join('') : '<tr><td colspan="7"><div class="ams-empty">No chatbot logs yet.</div></td></tr>'}
            </tbody></table></div>
        </section>
        <section class="ams-card" style="margin-top:12px">
            <div class="ams-section-head"><div><h3>Lead Intents</h3><p>These rows show sessions where the chatbot recommended manual follow-up.</p></div></div>
            <div class="ams-table-wrap"><table class="ams-table" style="min-width:980px"><thead><tr><th>Time</th><th>Intent</th><th>Question</th><th>Required Fields</th><th>Channel</th></tr></thead><tbody>
                ${leads.length ? leads.map((lead) => `<tr>
                    <td>${esc(fmtDate(lead.created_at))}</td>
                    <td>${esc(lead.detected_intent || '--')}</td>
                    <td><strong>${esc(lead.user_question || '--')}</strong><div class="ams-footnote">${esc(lead.language || '--')} / ${esc(lead.provider || '--')}</div></td>
                    <td>${esc((lead.required_followup_fields || []).join(', ') || '--')}</td>
                    <td>${esc(lead.contact_channel || '--')}</td>
                </tr>`).join('') : '<tr><td colspan="5"><div class="ams-empty">No handoff rows yet.</div></td></tr>'}
            </tbody></table></div>
        </section>
    `);

    const logMap = new Map(logs.map((item) => [item.id, item]));

    document.querySelectorAll('[data-chat-feedback]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = button.dataset.chatFeedback || '';
            const status = button.dataset.feedbackStatus || 'unreviewed';
            await withButtonBusy(button, 'Saving...', async () => {
                try {
                    const note = window.prompt(`Optional note for "${status}":`, '') || '';
                    await updateChatFeedback(id, status, note, user?.id || null);
                    showToast('Chat feedback updated.');
                    await renderChatQaAdminPage(input);
                } catch (error) {
                    showToast(error.message || 'Updating chat feedback failed.', true);
                }
            });
        });
    });

    document.querySelectorAll('[data-chat-faq-draft]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = button.dataset.chatFaqDraft || '';
            const log = logMap.get(id);
            if (!log) return;
            await withButtonBusy(button, 'Creating...', async () => {
                try {
                    await createFaqDraftFromLog(log, user?.id || null);
                    showToast('FAQ draft created from chat log.');
                } catch (error) {
                    showToast(error.message || 'Creating FAQ draft failed.', true);
                }
            });
        });
    });
}
