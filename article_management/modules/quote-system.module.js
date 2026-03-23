import { client } from './supabase.client.js';
import {
    DEFAULT_LANG,
    DEFAULT_RATES,
    DEFAULT_SHARE_SECRET,
    DEFAULT_THEME_DARK,
    DEFAULT_THEME_PRIMARY,
    MEDIA_LAYOUTS,
    MEDIA_POSITIONS,
    SECTION_KEYS,
    SUPPORTED_LANGS,
    buildQuoteSnapshot,
    convertLegacyPagesToSeedPayloads,
    createMediaConfig,
    createProductUiText,
    createPublicSlug,
    createQuoteItem,
    createQuoteMediaItem,
    createSectionConfig,
    ensureLegacyQuotePagesLoaded,
    extractBrandSnapshot,
    extractProductSnapshot,
    normalizeLocalizedText,
    normalizeMediaConfig,
    normalizeProductUiText,
    normalizeQuoteItem,
    normalizeQuoteMediaItem,
    normalizeRates,
    normalizeSectionConfig,
    normalizeShareConfig,
    normalizeShareHistoryEntry,
    pickLocalized,
    sortMediaItems,
    sortItems,
} from '../../shared/quote-system/quote-data.module.js?v=20260323quote12';

const TABLE_BRANDS = 'quote_brands';
const TABLE_PRODUCTS = 'quote_products';
const TABLE_PRODUCT_ITEMS = 'quote_product_items';
const TABLE_PRODUCT_MEDIA = 'quote_product_media';
const TABLE_CUSTOMERS = 'quote_customers';
const TABLE_INSTANCES = 'quote_instances';
const TABLE_INSTANCE_ITEMS = 'quote_instance_items';
const TABLE_INSTANCE_EVENTS = 'quote_instance_events';
const TABLE_INSTANCE_SENDS = 'quote_instance_sends';
const STORAGE_BUCKET_PRODUCT_MEDIA = 'quote-product-media';

const moduleState = {
    brands: [],
    products: [],
    customers: [],
    instances: [],
    baseTemplates: [],
    brandEditor: null,
    productEditor: null,
    productBrandDraft: null,
    instanceEditor: null,
    instanceEvents: [],
    instanceEventSummary: null,
    instanceSends: [],
    customerEditor: null,
    customerEvents: [],
    customerSends: [],
    productLoadedId: '',
    instanceLoadedId: '',
    customerLoadedId: '',
    customerSearch: '',
    brandDisplayNameTouched: false,
    brandDefaultLinkTouched: false,
    productBrandFilter: 'all',
    instanceBrandFilter: 'all',
    instanceStatusFilter: 'all',
};

const quoteBusyState = {
    depth: 0,
};

const SEND_STATUS_ORDER = {
    recorded: 0,
    generated: 1,
    emailed: 2,
    following_up: 3,
    delivered: 4,
    replied: 5,
    failed: 5,
    closed: 6,
};

const PUBLIC_TEMPLATE_LIBRARY = Object.freeze({
    vman: {
        label: 'VMAN / 独立发电模板',
        hint: '独立燃气发电机组模板，适合标准发电产品线。',
        order: 10,
    },
    minerpower: {
        label: 'MinerPower / 一体化产品模板',
        hint: '矿电一体和集装箱模板，适合整机集成产品线。',
        order: 20,
    },
});

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

function deepClone(value) {
    return JSON.parse(JSON.stringify(value ?? null));
}

function safeNumber(value, fallback = 0) {
    const next = Number(value);
    return Number.isFinite(next) ? next : fallback;
}

function text(value, fallback = '') {
    return String(value ?? fallback).trim();
}

function hasTextValue(value) {
    return Boolean(text(value));
}

function normalizeCustomerSnapshot(value = {}) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {
            company_name: '',
            contact_name: '',
            email: '',
            phone: '',
            country: '',
            notes: '',
        };
    }
    return {
        company_name: text(value.company_name || value.companyName),
        contact_name: text(value.contact_name || value.contactName),
        email: text(value.email),
        phone: text(value.phone),
        country: text(value.country),
        notes: text(value.notes),
    };
}

function createCustomerRecord(seed = {}) {
    return {
        id: text(seed.id),
        company_name: text(seed.company_name || seed.companyName),
        contact_name: text(seed.contact_name || seed.contactName),
        email: text(seed.email),
        phone: text(seed.phone),
        country: text(seed.country),
        notes: text(seed.notes),
        is_active: seed.is_active !== false,
        created_at: text(seed.created_at || seed.createdAt),
        updated_at: text(seed.updated_at || seed.updatedAt),
    };
}

function createCustomerDraft(seed = {}) {
    return createCustomerRecord(seed);
}

function customerDisplayName(customer = {}) {
    return text(customer.company_name || customer.customer_name || customer.contact_name || customer.email, '未关联客户');
}

function buildInstanceCustomerSnapshot(draft = {}) {
    return normalizeCustomerSnapshot({
        company_name: draft.customer_name,
        contact_name: draft.receiver_name,
        email: draft.receiver_email,
        phone: draft.customer_phone,
        country: draft.customer_country,
        notes: draft.customer_notes,
    });
}

function defaultShareConfigFromInstance(draft = {}) {
    return normalizeShareConfig({}, {
        recipient_name: draft.receiver_name,
        recipient_email: draft.receiver_email,
        recipient_company: draft.customer_name,
        follow_up_notes: draft.customer_notes,
    });
}

function syncInstanceShareConfig(draft = {}, options = {}) {
    const defaults = defaultShareConfigFromInstance(draft);
    const current = normalizeShareConfig(draft.share_config || draft.shareConfig, defaults);
    const forceRecipient = options.forceRecipient === true;
    const forceNotes = options.forceNotes === true;
    return normalizeShareConfig({
        recipient_name: forceRecipient || !hasTextValue(current.recipient_name) ? defaults.recipient_name : current.recipient_name,
        recipient_email: forceRecipient || !hasTextValue(current.recipient_email) ? defaults.recipient_email : current.recipient_email,
        recipient_company: forceRecipient || !hasTextValue(current.recipient_company) ? defaults.recipient_company : current.recipient_company,
        follow_up_notes: forceNotes || !hasTextValue(current.follow_up_notes) ? defaults.follow_up_notes : current.follow_up_notes,
        owner_name: current.owner_name,
        owner_email: current.owner_email,
    });
}

function shareConfigSummary(config = {}, options = {}) {
    const normalized = normalizeShareConfig(config);
    return {
        recipient: text(normalized.recipient_name || normalized.recipient_email || normalized.recipient_company, '未设定'),
        company: text(normalized.recipient_company, '未设定'),
        owner: text(normalized.owner_name || normalized.owner_email, '未设定'),
        send_count: safeNumber(options.sendCount, 0),
    };
}

function eventRecipientSummary(event = {}) {
    const metadata = event?.metadata && typeof event.metadata === 'object' ? event.metadata : {};
    const recipient = text(metadata.recipientName || metadata.recipientEmail || metadata.recipientCompany);
    const owner = text(metadata.ownerName || metadata.ownerEmail);
    const parts = [recipient, owner ? `负责人 ${owner}` : ''].filter(Boolean);
    return parts.join(' · ');
}

function createSendLedgerRecord(seed = {}) {
    return {
        ...normalizeShareHistoryEntry(seed),
        instance_id: text(seed.instance_id || seed.instanceId),
        customer_id: text(seed.customer_id || seed.customerId),
        created_at: text(seed.created_at || seed.createdAt),
        updated_at: text(seed.updated_at || seed.updatedAt),
    };
}

function shareHistoryRecipientLine(entry = {}) {
    const parts = [
        text(entry.recipient_name || entry.recipient_email || entry.recipient_company),
        text(entry.owner_name || entry.owner_email) ? `负责人 ${text(entry.owner_name || entry.owner_email)}` : '',
    ].filter(Boolean);
    return parts.join(' · ');
}

function shareHistoryStatusLabel(status = '') {
    const key = text(status, 'recorded');
    if (key === 'emailed') return '已触发邮件';
    if (key === 'generated') return '已生成链接';
    if (key === 'following_up') return '跟进中';
    if (key === 'delivered') return '已送达';
    if (key === 'replied') return '已回复';
    if (key === 'failed') return '发送失败';
    if (key === 'closed') return '已关闭';
    return '已记录';
}

function shareHistoryChannelLabel(channel = '') {
    const key = text(channel, 'share_link');
    if (key === 'email') return '邮件发送';
    return '分享链接';
}

function shareHistoryStatusOptions(current = '') {
    const value = text(current, 'recorded');
    return [
        ['generated', '已生成链接'],
        ['emailed', '已触发邮件'],
        ['following_up', '跟进中'],
        ['delivered', '已送达'],
        ['replied', '已回复'],
        ['failed', '发送失败'],
        ['closed', '已关闭'],
    ].map(([optionValue, label]) => `<option value="${esc(optionValue)}" ${value === optionValue ? 'selected' : ''}>${esc(label)}</option>`).join('');
}

function sendLedgerModeMarkup() {
    return '<div class="ams-field-help ams-quote-ledger-note">Send ledger now reads only <code>quote_instance_sends</code>.</div>';
}

function instanceShareHistory() {
    return moduleState.instanceSends;
}

function customerShareHistory(customerId = '') {
    if (!customerId) return [];
    return moduleState.customerSends;
}

function renderShareHistoryList(entries = [], options = {}) {
    const includeQuoteMeta = options.includeQuoteMeta === true;
    const editable = options.editable === true;
    return entries.length
        ? entries.map((entry) => {
            const recipientLine = shareHistoryRecipientLine(entry);
            const quoteLine = includeQuoteMeta
                ? `${brandLabelById(entry.brand_id)} · ${productLabelById(entry.product_id)} · ${text(entry.public_slug || entry.instance_id)}`
                : '';
            return `
                <article class="ams-quote-event-row">
                    <div class="ams-quote-event-copy">
                        <strong>${esc(shareHistoryChannelLabel(entry.channel))} · ${esc(shareHistoryStatusLabel(entry.status))}</strong>
                        <span>${esc(recipientLine || '未记录收件人')}</span>
                        <span class="ams-quote-inline-submeta">尝试 ${esc(entry.attempt_count || 1)} 次 · 最近发送 ${esc(fmtDate(entry.last_sent_at || entry.sent_at))}</span>
                        ${quoteLine ? `<span class="ams-quote-inline-submeta">${esc(quoteLine)}</span>` : ''}
                        ${text(entry.follow_up_notes) ? `<span class="ams-quote-inline-submeta">${esc(entry.follow_up_notes)}</span>` : ''}
                        ${text(entry.outcome_notes) ? `<span class="ams-quote-inline-submeta">${esc(entry.outcome_notes)}</span>` : ''}
                        ${editable ? `
                            <div class="ams-share-history-editor">
                                <select class="ams-select" data-share-history-status="${esc(entry.id)}">
                                    ${shareHistoryStatusOptions(entry.status)}
                                </select>
                                <textarea class="ams-textarea" rows="2" data-share-history-outcome="${esc(entry.id)}" placeholder="记录交付结果、回复摘要、失败原因或关闭说明。">${esc(entry.outcome_notes)}</textarea>
                                <div class="ams-row-actions">
                                    <button class="ams-btn ams-btn-primary" type="button" data-share-history-save="${esc(entry.id)}">更新结果</button>
                                    <button class="ams-btn ams-btn-muted" type="button" data-share-history-retry="${esc(entry.id)}">记录重发</button>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <time>${esc(fmtDate(entry.updated_at || entry.last_sent_at || entry.sent_at || entry.expires_at))}</time>
                </article>
            `;
        }).join('')
        : '<div class="ams-empty">还没有发送台账。</div>';
}

function emptyInstanceEventSummary() {
    return {
        total_views: 0,
        share_views: 0,
        admin_views: 0,
        share_links: 0,
        email_clicks: 0,
        last_viewed_at: '',
        last_shared_at: '',
    };
}

function summarizeInstanceEvents(events = []) {
    return events.reduce((summary, event) => {
        const createdAt = text(event.created_at || event.createdAt);
        const type = text(event.event_type || event.eventType);
        if (type === 'quote_viewed' || type === 'share_opened' || type === 'preview_opened' || type === 'passcode_unlocked') {
            summary.total_views += 1;
            if (!summary.last_viewed_at || createdAt > summary.last_viewed_at) summary.last_viewed_at = createdAt;
        }
        if (type === 'share_opened' || type === 'passcode_unlocked') summary.share_views += 1;
        if (type === 'preview_opened') summary.admin_views += 1;
        if (type === 'share_link_generated') {
            summary.share_links += 1;
            if (!summary.last_shared_at || createdAt > summary.last_shared_at) summary.last_shared_at = createdAt;
        }
        if (type === 'email_clicked') summary.email_clicks += 1;
        return summary;
    }, emptyInstanceEventSummary());
}

function summarizeCustomerQuotes(customerId = '') {
    return moduleState.instances.reduce((summary, instance) => {
        if (text(instance.customer_id) !== text(customerId)) return summary;
        summary.total_quotes += 1;
        if (instance.status === 'published') summary.published_quotes += 1;
        else if (instance.status === 'archived') summary.archived_quotes += 1;
        else summary.draft_quotes += 1;
        if (!summary.last_quote_updated_at || text(instance.updated_at) > summary.last_quote_updated_at) {
            summary.last_quote_updated_at = text(instance.updated_at);
        }
        return summary;
    }, {
        total_quotes: 0,
        draft_quotes: 0,
        published_quotes: 0,
        archived_quotes: 0,
        last_quote_updated_at: '',
    });
}

function summarizeCustomerActivity(customerId = '', events = []) {
    const quoteSummary = summarizeCustomerQuotes(customerId);
    const eventSummary = summarizeInstanceEvents(events);
    const viewerEmails = new Set();
    let logged_in_views = 0;
    let anonymous_views = 0;

    events.forEach((event) => {
        const label = text(event.viewer_label);
        const email = text(event.viewer_email).toLowerCase();
        if (label === 'anonymous') {
            anonymous_views += 1;
        } else if (label !== 'admin') {
            logged_in_views += 1;
            if (email) viewerEmails.add(email);
        }
    });

    return {
        ...quoteSummary,
        ...eventSummary,
        logged_in_views,
        anonymous_views,
        named_viewers: viewerEmails.size,
    };
}

function ensureQuoteBusyMask() {
    const host = document.getElementById('ams-content');
    if (!host) return null;
    let mask = host.querySelector('.ams-page-busy');
    if (mask) return mask;

    mask = document.createElement('div');
    mask.className = 'ams-page-busy';
    mask.innerHTML = `
        <div class="ams-page-busy-card">
            <span class="ams-page-busy-spinner" aria-hidden="true"></span>
            <strong data-quote-busy-title>正在加载...</strong>
            <span data-quote-busy-subtitle>请稍候，后台正在处理当前操作。</span>
        </div>
    `;
    host.appendChild(mask);
    return mask;
}

function showQuoteBusy(message = '正在加载...', subtitle = '请稍候，后台正在处理当前操作。') {
    const host = document.getElementById('ams-content');
    const mask = ensureQuoteBusyMask();
    if (!host || !mask) return;

    quoteBusyState.depth += 1;
    host.classList.add('is-busy');
    const titleNode = mask.querySelector('[data-quote-busy-title]');
    const subtitleNode = mask.querySelector('[data-quote-busy-subtitle]');
    if (titleNode) titleNode.textContent = message;
    if (subtitleNode) subtitleNode.textContent = subtitle;
    mask.classList.add('is-active');
}

function hideQuoteBusy() {
    const host = document.getElementById('ams-content');
    const mask = host?.querySelector('.ams-page-busy');
    quoteBusyState.depth = Math.max(0, quoteBusyState.depth - 1);
    if (quoteBusyState.depth > 0) return;
    if (mask) mask.classList.remove('is-active');
    if (host) host.classList.remove('is-busy');
}

async function withQuoteBusy(message, task, sourceNode = null, subtitle = '请稍候，后台正在处理当前操作。') {
    if (sourceNode?.classList) sourceNode.classList.add('is-loading');
    showQuoteBusy(message, subtitle);
    try {
        return await task();
    } finally {
        if (sourceNode?.classList) sourceNode.classList.remove('is-loading');
        hideQuoteBusy();
    }
}

function expandLocalizedFromChinese(value) {
    const localized = normalizeLocalizedText(value);
    const zh = text(localized.zh || localized.en || localized.ru);
    return {
        zh,
        en: text(localized.en) || zh,
        ru: text(localized.ru) || zh,
    };
}

function expandSectionConfigLocalized(sections = createSectionConfig()) {
    return normalizeSectionConfig(sections).map((section) => ({
        ...section,
        title: expandLocalizedFromChinese(section.title),
    }));
}

function enableMediaIfNeeded(config = {}, gallery = []) {
    const normalized = normalizeMediaConfig(config);
    if (normalizeMediaGallery(gallery).length && normalized.enabled !== true) {
        normalized.enabled = true;
    }
    return normalized;
}

function normalizeMediaGallery(items = []) {
    return sortMediaItems(items).map((item, index) => ({
        ...normalizeQuoteMediaItem(item),
        sort_order: (index + 1) * 10,
    }));
}

function expandMediaConfig(config = {}) {
    return normalizeMediaConfig(config);
}

function buildStorageFileName(originalName = '') {
    const source = text(originalName, 'image');
    const extMatch = source.match(/\.[a-z0-9]+$/i);
    const ext = extMatch ? extMatch[0].toLowerCase() : '.jpg';
    const stem = source
        .replace(/\.[^.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'image';
    return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}-${stem}${ext}`;
}

function productMediaPath(product, fileName) {
    const brandSlug = text(product?.brand_slug || product?.brandSlug || brandSlugById(product?.brand_id) || brandLabelById(product?.brand_id), 'brand')
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'brand';
    const productSlug = text(product?.slug, 'product')
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'product';
    return `${brandSlug}/${productSlug}/${fileName}`;
}

function createBrandDraft(seed = {}) {
    return {
        id: text(seed.id),
        slug: text(seed.slug),
        brand_name: text(seed.brand_name || seed.brandName),
        display_name: text(seed.display_name || seed.displayName),
        supplier_name: text(seed.supplier_name || seed.supplierName),
        sender_email: text(seed.sender_email || seed.senderEmail),
        subject_name: text(seed.subject_name || seed.subjectName),
        overview_title: normalizeLocalizedText(seed.overview_title || seed.overviewTitle || ''),
        footer_note: normalizeLocalizedText(seed.footer_note || seed.footerNote || ''),
        theme_primary: text(seed.theme_primary || seed.themePrimary || DEFAULT_THEME_PRIMARY) || DEFAULT_THEME_PRIMARY,
        theme_dark: text(seed.theme_dark || seed.themeDark || DEFAULT_THEME_DARK) || DEFAULT_THEME_DARK,
        share_signing_secret: text(seed.share_signing_secret || seed.shareSigningSecret || DEFAULT_SHARE_SECRET) || DEFAULT_SHARE_SECRET,
        share_unlock_prefix: text(seed.share_unlock_prefix || seed.shareUnlockPrefix || 'quote-share-unlocked') || 'quote-share-unlocked',
        default_quote_slug: text(seed.default_quote_slug || seed.defaultQuoteSlug),
        is_active: seed.is_active !== false,
    };
}

function createProductDraft(seed = {}) {
    return {
        id: text(seed.id),
        brand_id: text(seed.brand_id || seed.brandId),
        slug: text(seed.slug),
        product_code: text(seed.product_code || seed.productCode),
        public_title: normalizeLocalizedText(seed.public_title || seed.publicTitle || ''),
        default_lang: SUPPORTED_LANGS.includes(text(seed.default_lang || seed.defaultLang)) ? text(seed.default_lang || seed.defaultLang) : DEFAULT_LANG,
        validity_hours: Math.max(1, safeNumber(seed.validity_hours || seed.validityHours, 72)),
        default_rates: normalizeRates(seed.default_rates || seed.defaultRates || DEFAULT_RATES),
        section_config: normalizeSectionConfig(seed.section_config || seed.sectionConfig),
        ui_text: normalizeProductUiText(seed.ui_text || seed.uiText || createProductUiText()),
        media_config: normalizeMediaConfig(seed.media_config || seed.mediaConfig),
        sort_order: safeNumber(seed.sort_order, 100),
        is_active: seed.is_active !== false,
        items: sortItems((seed.items || []).map((item) => normalizeQuoteItem(item, item?.section_key))),
        media_gallery: sortMediaItems((seed.media_gallery || seed.mediaGallery || []).map((item) => normalizeQuoteMediaItem(item))),
    };
}

function createInstanceDraft(seed = {}) {
    const customerSnapshot = seed.customer_snapshot && typeof seed.customer_snapshot === 'object'
        ? deepClone(seed.customer_snapshot)
        : (seed.customerSnapshot && typeof seed.customerSnapshot === 'object' ? deepClone(seed.customerSnapshot) : {});
    const normalizedStatus = text(seed.status || 'draft').toLowerCase();
    const draft = {
        id: text(seed.id),
        brand_id: text(seed.brand_id || seed.brandId),
        product_id: text(seed.product_id || seed.productId),
        customer_id: text(seed.customer_id || seed.customerId),
        public_slug: text(seed.public_slug || seed.publicSlug),
        status: normalizedStatus === 'published' || normalizedStatus === 'archived' ? normalizedStatus : 'draft',
        last_active_status: text(seed.last_active_status || seed.lastActiveStatus || 'draft') === 'published' ? 'published' : 'draft',
        archived_at: text(seed.archived_at || seed.archivedAt),
        customer_name: text(seed.customer_name || seed.customerName),
        receiver_name: text(seed.receiver_name || seed.receiverName),
        receiver_email: text(seed.receiver_email || seed.receiverEmail),
        customer_phone: text(seed.customer_phone || seed.customerPhone || customerSnapshot.phone),
        customer_country: text(seed.customer_country || seed.customerCountry || customerSnapshot.country),
        customer_notes: text(seed.customer_notes || seed.customerNotes || customerSnapshot.notes),
        default_lang: SUPPORTED_LANGS.includes(text(seed.default_lang || seed.defaultLang)) ? text(seed.default_lang || seed.defaultLang) : DEFAULT_LANG,
        validity_hours: Math.max(1, safeNumber(seed.validity_hours || seed.validityHours, 72)),
        draft_rates: normalizeRates(seed.draft_rates || seed.rates || DEFAULT_RATES),
        share_config: normalizeShareConfig(seed.share_config || seed.shareConfig, {
            recipient_name: seed.receiver_name || seed.receiverName,
            recipient_email: seed.receiver_email || seed.receiverEmail,
            recipient_company: seed.customer_name || seed.customerName,
            follow_up_notes: seed.customer_notes || seed.customerNotes || customerSnapshot.notes,
        }),
        customer_snapshot: customerSnapshot,
        brand_snapshot: extractBrandSnapshot(seed.brand_snapshot || seed.brandSnapshot || {}),
        product_snapshot: extractProductSnapshot(seed.product_snapshot || seed.productSnapshot || {}),
        section_config: normalizeSectionConfig(seed.section_config || seed.sectionConfig),
        published_at: text(seed.published_at || seed.publishedAt),
        updated_at: text(seed.updated_at || seed.updatedAt),
        items: sortItems((seed.items || []).map((item) => normalizeQuoteItem(item, item?.section_key))),
    };
    draft.share_config = syncInstanceShareConfig(draft);
    return draft;
}

moduleState.brandEditor = createBrandDraft();
moduleState.productEditor = createProductDraft();
moduleState.productBrandDraft = createBrandDraft();
moduleState.instanceEditor = createInstanceDraft();

function upsertLocalizedField(target, key, lang, value) {
    target[key] = normalizeLocalizedText(target[key]);
    target[key][lang] = text(value);
}

function updateSectionField(target, sectionKey, field, value) {
    const nextSections = normalizeSectionConfig(target.section_config).map((section) => ({ ...section }));
    const section = nextSections.find((entry) => entry.key === sectionKey);
    if (!section) return;
    if (field === 'title' && value && typeof value === 'object') {
        section.title = normalizeLocalizedText(value);
    } else if (field === 'subtotalMode') {
        section.subtotalMode = text(value) === 'sum' ? 'sum' : 'manual';
    } else if (field === 'subtotal') {
        section.subtotal = Math.max(0, safeNumber(value, 0));
    }
    target.section_config = nextSections;
}

function updateItemField(items, itemId, field, value) {
    return items.map((item) => {
        if (item.localId !== itemId) return item;
        const next = { ...item, name_i18n: normalizeLocalizedText(item.name_i18n) };
        if (field === 'price_rmb') next.price_rmb = Math.max(0, safeNumber(value, 0));
        else if (field === 'sort_order') next.sort_order = Math.max(0, safeNumber(value, 0));
        else if (field === 'is_included') next.is_included = value === true;
        else next[field] = text(value);
        return next;
    });
}

function updateItemLocalizedField(items, itemId, lang, value) {
    return items.map((item) => {
        if (item.localId !== itemId) return item;
        const next = { ...item, name_i18n: normalizeLocalizedText(item.name_i18n) };
        next.name_i18n[lang] = text(value);
        return next;
    });
}

function rowMove(items, localId, direction) {
    const next = [...items];
    const index = next.findIndex((item) => item.localId === localId);
    if (index === -1) return next;
    const current = next[index];
    const sameSectionIndexes = next
        .map((item, itemIndex) => ({ item, itemIndex }))
        .filter((entry) => entry.item.section_key === current.section_key)
        .map((entry) => entry.itemIndex);
    const localSectionIndex = sameSectionIndexes.indexOf(index);
    const targetSectionIndex = localSectionIndex + direction;
    if (targetSectionIndex < 0 || targetSectionIndex >= sameSectionIndexes.length) return next;
    const swapIndex = sameSectionIndexes[targetSectionIndex];
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    return next.map((item, itemIndex) => ({
        ...item,
        sort_order: (itemIndex + 1) * 10,
    }));
}

function mediaMove(items, localId, direction) {
    const next = normalizeMediaGallery(items);
    const index = next.findIndex((item) => item.localId === localId);
    if (index === -1) return next;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= next.length) return next;
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    return next.map((item, itemIndex) => ({
        ...item,
        sort_order: (itemIndex + 1) * 10,
    }));
}

async function fetchBrandRows() {
    const { data, error } = await client
        .from(TABLE_BRANDS)
        .select('id, slug, brand_name, display_name, supplier_name, sender_email, subject_name, overview_title, footer_note, theme_primary, theme_dark, share_signing_secret, share_unlock_prefix, default_quote_slug, is_active, created_at, updated_at')
        .order('slug', { ascending: true });
    if (error) throw error;
    moduleState.brands = Array.isArray(data) ? data.map((row) => createBrandDraft(row)) : [];
    return moduleState.brands;
}

async function fetchCustomerRows() {
    const { data, error } = await client
        .from(TABLE_CUSTOMERS)
        .select('id, company_name, contact_name, email, phone, country, notes, is_active, created_at, updated_at')
        .eq('is_active', true)
        .order('company_name', { ascending: true })
        .order('contact_name', { ascending: true });
    if (error) throw error;
    moduleState.customers = Array.isArray(data) ? data.map((row) => createCustomerRecord(row)) : [];
    return moduleState.customers;
}

async function fetchProductRows() {
    const { data, error } = await client
        .from(TABLE_PRODUCTS)
        .select('*')
        .order('sort_order', { ascending: true })
        .order('slug', { ascending: true });
    if (error) throw error;
    moduleState.products = Array.isArray(data) ? data.map((row) => createProductDraft(row)) : [];
    return moduleState.products;
}

async function fetchProductMediaRows(productId) {
    if (!productId) return [];
    const { data, error } = await client.from(TABLE_PRODUCT_MEDIA).select('*').eq('product_id', productId).order('sort_order', { ascending: true });
    if (error) throw error;
    return Array.isArray(data) ? data.map((row) => normalizeQuoteMediaItem(row)) : [];
}

async function fetchProductEditor(productId) {
    if (!productId) {
        moduleState.productLoadedId = '';
        moduleState.productEditor = createProductDraft();
        moduleState.productBrandDraft = createBrandDraft();
        return moduleState.productEditor;
    }
    const { data, error } = await client.from(TABLE_PRODUCTS).select('*').eq('id', productId).single();
    if (error) throw error;
    const [itemsResult, mediaRows] = await Promise.all([
        client.from(TABLE_PRODUCT_ITEMS).select('*').eq('product_id', productId).order('sort_order', { ascending: true }),
        fetchProductMediaRows(productId),
    ]);
    if (itemsResult.error) throw itemsResult.error;
    moduleState.productLoadedId = productId;
    moduleState.productEditor = createProductDraft({
        ...data,
        items: itemsResult.data || [],
        media_gallery: mediaRows,
    });
    syncProductBrandDraft(moduleState.productEditor.brand_id);
    return moduleState.productEditor;
}

async function fetchInstanceRows() {
    const { data, error } = await client
        .from(TABLE_INSTANCES)
        .select('id, brand_id, product_id, customer_id, public_slug, status, last_active_status, archived_at, customer_name, receiver_name, receiver_email, customer_snapshot, share_config, default_lang, validity_hours, published_at, updated_at')
        .order('updated_at', { ascending: false });
    if (error) throw error;
    moduleState.instances = Array.isArray(data) ? data.map((row) => createInstanceDraft(row)) : [];
    return moduleState.instances;
}

async function fetchInstanceAnalytics(instanceId) {
    if (!instanceId) {
        moduleState.instanceEvents = [];
        moduleState.instanceEventSummary = emptyInstanceEventSummary();
        return moduleState.instanceEventSummary;
    }
    const { data, error } = await client
        .from(TABLE_INSTANCE_EVENTS)
        .select('*')
        .eq('instance_id', instanceId)
        .order('created_at', { ascending: false })
        .limit(50);
    if (error) throw error;
    moduleState.instanceEvents = Array.isArray(data) ? data : [];
    moduleState.instanceEventSummary = summarizeInstanceEvents(moduleState.instanceEvents);
    return moduleState.instanceEventSummary;
}

async function fetchInstanceSendLedger(instanceId) {
    if (!instanceId) {
        moduleState.instanceSends = [];
        return [];
    }
    const { data, error } = await client
        .from(TABLE_INSTANCE_SENDS)
        .select('*')
        .eq('instance_id', instanceId)
        .order('updated_at', { ascending: false })
        .limit(100);
    if (error) throw error;
    moduleState.instanceSends = Array.isArray(data) ? data.map((row) => createSendLedgerRecord(row)) : [];
    return moduleState.instanceSends;
}

async function fetchCustomerAnalytics(customerId) {
    if (!customerId) {
        moduleState.customerEvents = [];
        return [];
    }
    const { data, error } = await client
        .from(TABLE_INSTANCE_EVENTS)
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(200);
    if (error) throw error;
    moduleState.customerEvents = Array.isArray(data) ? data : [];
    return moduleState.customerEvents;
}

async function fetchCustomerSendLedger(customerId) {
    if (!customerId) {
        moduleState.customerSends = [];
        return [];
    }
    const { data, error } = await client
        .from(TABLE_INSTANCE_SENDS)
        .select('*')
        .eq('customer_id', customerId)
        .order('updated_at', { ascending: false })
        .limit(200);
    if (error) throw error;
    moduleState.customerSends = Array.isArray(data) ? data.map((row) => createSendLedgerRecord(row)) : [];
    return moduleState.customerSends;
}

async function fetchInstanceEditor(instanceId) {
    if (!instanceId) {
        moduleState.instanceLoadedId = '';
        moduleState.instanceEditor = createInstanceDraft();
        moduleState.instanceEvents = [];
        moduleState.instanceEventSummary = emptyInstanceEventSummary();
        moduleState.instanceSends = [];
        return moduleState.instanceEditor;
    }
    const { data, error } = await client.from(TABLE_INSTANCES).select('*').eq('id', instanceId).single();
    if (error) throw error;
    const [itemsResult] = await Promise.all([
        client.from(TABLE_INSTANCE_ITEMS).select('*').eq('instance_id', instanceId).order('sort_order', { ascending: true }),
        fetchInstanceAnalytics(instanceId),
        fetchInstanceSendLedger(instanceId),
    ]);
    if (itemsResult.error) throw itemsResult.error;
    moduleState.instanceLoadedId = instanceId;
    moduleState.instanceEditor = createInstanceDraft({
        ...data,
        items: itemsResult.data || [],
    });
    return moduleState.instanceEditor;
}

async function fetchCustomerEditor(customerId) {
    if (!customerId) {
        moduleState.customerLoadedId = '';
        moduleState.customerEditor = createCustomerDraft();
        moduleState.customerEvents = [];
        moduleState.customerSends = [];
        return moduleState.customerEditor;
    }
    const { data, error } = await client.from(TABLE_CUSTOMERS).select('*').eq('id', customerId).single();
    if (error) throw error;
    await Promise.all([
        fetchCustomerAnalytics(customerId),
        fetchCustomerSendLedger(customerId),
    ]);
    moduleState.customerLoadedId = customerId;
    moduleState.customerEditor = createCustomerDraft(data);
    return moduleState.customerEditor;
}

async function persistItemRows(tableName, ownerColumn, ownerId, items = []) {
    const deleteResult = await client.from(tableName).delete().eq(ownerColumn, ownerId);
    if (deleteResult.error) throw deleteResult.error;

    const payload = sortItems(items).map((item, index) => {
        const normalized = normalizeQuoteItem(item, item.section_key);
        return {
            [ownerColumn]: ownerId,
            section_key: normalized.section_key,
            sort_order: (index + 1) * 10,
            line_code: normalized.line_code,
            brand_label: normalized.brand_label,
            qty_label: normalized.qty_label,
            price_rmb: normalized.price_rmb,
            is_included: normalized.is_included === true,
            name_i18n: expandLocalizedFromChinese(normalized.name_i18n),
        };
    });

    if (!payload.length) return [];
    const insertResult = await client.from(tableName).insert(payload).select('*');
    if (insertResult.error) throw insertResult.error;
    return insertResult.data || [];
}

async function persistProductMediaRows(ownerId, items = []) {
    const deleteResult = await client.from(TABLE_PRODUCT_MEDIA).delete().eq('product_id', ownerId);
    if (deleteResult.error) throw deleteResult.error;

    const payload = normalizeMediaGallery(items).map((item, index) => {
        const normalized = normalizeQuoteMediaItem(item);
        return {
            product_id: ownerId,
            title: normalized.title,
            storage_path: normalized.storage_path,
            public_url: normalized.public_url,
            sort_order: (index + 1) * 10,
            is_active: normalized.is_active !== false,
        };
    });

    if (!payload.length) return [];
    const insertResult = await client.from(TABLE_PRODUCT_MEDIA).insert(payload).select('*');
    if (insertResult.error) throw insertResult.error;
    return insertResult.data || [];
}

async function syncDraftInstanceMedia(productId, mediaConfig = {}, mediaGallery = [], userId = null) {
    if (!productId) return;
    const listResult = await client
        .from(TABLE_INSTANCES)
        .select('id, product_snapshot')
        .eq('product_id', productId)
        .eq('status', 'draft');
    if (listResult.error) throw listResult.error;
    const rows = Array.isArray(listResult.data) ? listResult.data : [];
    if (!rows.length) return;

    await Promise.all(
        rows.map((row) =>
            client
                .from(TABLE_INSTANCES)
                .update({
                    product_snapshot: extractProductSnapshot({
                        ...(row.product_snapshot || {}),
                        media_config: enableMediaIfNeeded(mediaConfig, mediaGallery),
                        media_gallery: normalizeMediaGallery(mediaGallery),
                    }),
                    updated_by: userId || null,
                })
                .eq('id', row.id),
        ),
    ).then((results) => {
        const failed = results.find((result) => result?.error);
        if (failed?.error) throw failed.error;
    });
}

async function syncProductMediaState(productId, mediaConfig = {}, mediaGallery = [], userId = null) {
    if (!productId) {
        return normalizeMediaConfig(enableMediaIfNeeded(mediaConfig, mediaGallery));
    }

    const nextConfig = normalizeMediaConfig(enableMediaIfNeeded(mediaConfig, mediaGallery));
    const updateResult = await client
        .from(TABLE_PRODUCTS)
        .update({
            media_config: expandMediaConfig(nextConfig),
            updated_by: userId || null,
        })
        .eq('id', productId)
        .select('media_config')
        .single();
    if (updateResult.error) throw updateResult.error;

    await syncDraftInstanceMedia(productId, nextConfig, mediaGallery, userId);
    return normalizeMediaConfig(updateResult.data?.media_config || nextConfig);
}

async function uploadProductMediaFiles(product, files = []) {
    if (!product?.id) throw new Error('请先保存产品模板，再上传图片。');
    if (!files.length) return normalizeMediaGallery(product.media_gallery);

    const pending = Array.from(files)
        .filter((file) => file && /^image\//i.test(file.type || ''))
        .map(async (file) => {
            const fileName = buildStorageFileName(file.name);
            const storagePath = productMediaPath(product, fileName);
            const uploadResult = await client.storage.from(STORAGE_BUCKET_PRODUCT_MEDIA).upload(storagePath, file, {
                cacheControl: '3600',
                upsert: false,
            });
            if (uploadResult.error) throw uploadResult.error;
            const publicUrlResult = client.storage.from(STORAGE_BUCKET_PRODUCT_MEDIA).getPublicUrl(storagePath);
            return createQuoteMediaItem({
                title: file.name.replace(/\.[^.]+$/, ''),
                storage_path: storagePath,
                public_url: publicUrlResult?.data?.publicUrl || '',
                sort_order: 100,
            });
        });

    const uploadedItems = await Promise.all(pending);
    const savedRows = await persistProductMediaRows(product.id, [...normalizeMediaGallery(product.media_gallery), ...uploadedItems]);
    return normalizeMediaGallery(savedRows);
}

async function saveProductMediaCollection(productId, items = []) {
    if (!productId) throw new Error('未找到产品模板。');
    const savedRows = await persistProductMediaRows(productId, items);
    return normalizeMediaGallery(savedRows);
}

async function deleteProductMediaItem(productId, gallery, mediaItem) {
    if (!productId) throw new Error('未找到产品模板。');
    const storagePath = text(mediaItem?.storage_path);
    if (storagePath) {
        const removeResult = await client.storage.from(STORAGE_BUCKET_PRODUCT_MEDIA).remove([storagePath]);
        if (removeResult.error) throw removeResult.error;
    }
    const nextItems = normalizeMediaGallery(gallery).filter((item) => item.localId !== mediaItem.localId);
    return saveProductMediaCollection(productId, nextItems);
}

async function replaceProductMediaFile(product, gallery, mediaItem, file) {
    if (!product?.id) throw new Error('请先保存产品模板，再更换图片。');
    if (!file || !/^image\//i.test(file.type || '')) throw new Error('请选择有效的图片文件。');
    const fileName = buildStorageFileName(file.name);
    const storagePath = productMediaPath(product, fileName);
    const uploadResult = await client.storage.from(STORAGE_BUCKET_PRODUCT_MEDIA).upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
    });
    if (uploadResult.error) throw uploadResult.error;

    const publicUrlResult = client.storage.from(STORAGE_BUCKET_PRODUCT_MEDIA).getPublicUrl(storagePath);
    const nextGallery = normalizeMediaGallery(gallery).map((entry) => {
        if (entry.localId !== mediaItem.localId) return entry;
        return createQuoteMediaItem({
            ...entry,
            title: file.name.replace(/\.[^.]+$/, '') || entry.title,
            storage_path: storagePath,
            public_url: publicUrlResult?.data?.publicUrl || '',
            sort_order: entry.sort_order,
        });
    });

    const oldStoragePath = text(mediaItem?.storage_path);
    if (oldStoragePath) {
        const removeResult = await client.storage.from(STORAGE_BUCKET_PRODUCT_MEDIA).remove([oldStoragePath]);
        if (removeResult.error) throw removeResult.error;
    }
    return saveProductMediaCollection(product.id, nextGallery);
}

function syncProductMediaToEditors(productId, mediaGallery, mediaConfig = null) {
    const nextGallery = normalizeMediaGallery(mediaGallery);
    const nextConfig = normalizeMediaConfig(enableMediaIfNeeded(mediaConfig || {}, nextGallery));
    if (moduleState.productEditor?.id === productId) {
        moduleState.productEditor.media_gallery = nextGallery;
        moduleState.productEditor.media_config = mediaConfig
            ? nextConfig
            : enableMediaIfNeeded(moduleState.productEditor.media_config, nextGallery);
    }
    if (moduleState.instanceEditor?.product_id === productId) {
        moduleState.instanceEditor.product_snapshot = extractProductSnapshot({
            ...moduleState.instanceEditor.product_snapshot,
            media_config: mediaConfig ? nextConfig : enableMediaIfNeeded(moduleState.instanceEditor.product_snapshot?.media_config, nextGallery),
            media_gallery: nextGallery,
        });
    }
}

async function saveBrandDraft(user, draft) {
    const payload = createBrandDraft(draft);
    if (!payload.slug) throw new Error('品牌 slug 不能为空。');
    if (!payload.display_name) throw new Error('品牌显示名不能为空。');

    const savePayload = {
        slug: payload.slug,
        brand_name: payload.brand_name || payload.display_name,
        display_name: payload.display_name,
        supplier_name: payload.supplier_name || payload.display_name,
        sender_email: payload.sender_email,
        subject_name: payload.subject_name || payload.display_name,
        overview_title: expandLocalizedFromChinese(payload.overview_title),
        footer_note: expandLocalizedFromChinese(payload.footer_note),
        theme_primary: payload.theme_primary || DEFAULT_THEME_PRIMARY,
        theme_dark: payload.theme_dark || DEFAULT_THEME_DARK,
        share_signing_secret: payload.share_signing_secret || DEFAULT_SHARE_SECRET,
        share_unlock_prefix: payload.share_unlock_prefix || `${payload.slug}-share-unlocked`,
        default_quote_slug: payload.default_quote_slug || null,
        is_active: payload.is_active !== false,
        updated_by: user?.id || null,
    };
    let data = null;
    let error = null;
    if (payload.id) {
        const result = await client
            .from(TABLE_BRANDS)
            .update(savePayload)
            .eq('id', payload.id)
            .select('*')
            .single();
        data = result.data;
        error = result.error;
    } else {
        const result = await client
            .from(TABLE_BRANDS)
            .insert({
                ...savePayload,
                created_by: user?.id || null,
            })
            .select('*')
            .single();
        data = result.data;
        error = result.error;
    }
    if (error?.code === '23505') {
        throw new Error('Brand slug already exists. Use a unique slug.');
    }
    if (error) throw error;
    const saved = createBrandDraft(data);
    await fetchBrandRows();
    moduleState.brandEditor = saved;
    return saved;
}

async function saveProductDraft(user, draft) {
    const payload = createProductDraft(draft);
    if (!payload.brand_id) throw new Error('请选择所属品牌。');
    if (!payload.slug) throw new Error('产品 slug 不能为空。');
    if (!pickLocalized(payload.public_title, payload.default_lang)) {
        payload.public_title = normalizeLocalizedText(payload.product_code || payload.slug || '', payload.product_code || payload.slug || '');
    }
    if (!pickLocalized(payload.public_title, payload.default_lang)) throw new Error('请至少填写一个产品标题。');

    const linkedBrandDraft = currentProductBrandDraft();
    if (linkedBrandDraft?.id === payload.brand_id || linkedBrandDraft?.slug) {
        const savedBrand = await saveBrandDraft(user, {
            ...linkedBrandDraft,
            id: linkedBrandDraft.id || payload.brand_id,
        });
        moduleState.productBrandDraft = savedBrand;
        payload.brand_id = savedBrand.id;
    }

    const savePayload = {
        brand_id: payload.brand_id,
        slug: payload.slug,
        product_code: payload.product_code || payload.slug,
        public_title: expandLocalizedFromChinese(payload.public_title),
        default_lang: payload.default_lang,
        validity_hours: payload.validity_hours,
        default_rates: normalizeRates(payload.default_rates),
        section_config: expandSectionConfigLocalized(payload.section_config),
        ui_text: normalizeProductUiText(payload.ui_text),
        media_config: expandMediaConfig(payload.media_config),
        sort_order: payload.sort_order,
        is_active: payload.is_active !== false,
        updated_by: user?.id || null,
    };
    let data = null;
    let error = null;
    if (payload.id) {
        const result = await client
            .from(TABLE_PRODUCTS)
            .update(savePayload)
            .eq('id', payload.id)
            .select('*')
            .single();
        data = result.data;
        error = result.error;
    } else {
        const result = await client
            .from(TABLE_PRODUCTS)
            .insert({
                ...savePayload,
                created_by: user?.id || null,
            })
            .select('*')
            .single();
        data = result.data;
        error = result.error;
    }
    if (error?.code === '23505') {
        throw new Error('Product slug already exists. Use a unique slug.');
    }
    if (error) throw error;

    const [savedItems, savedMedia] = await Promise.all([
        persistItemRows(TABLE_PRODUCT_ITEMS, 'product_id', data.id, payload.items),
        persistProductMediaRows(data.id, payload.media_gallery),
    ]);
    const syncedMediaConfig = await syncProductMediaState(data.id, data.media_config, savedMedia, user?.id || null);
    syncProductMediaToEditors(data.id, savedMedia, syncedMediaConfig);
    await fetchProductRows();
    moduleState.productLoadedId = data.id;
    moduleState.productEditor = createProductDraft({
        ...data,
        media_config: syncedMediaConfig,
        items: savedItems,
        media_gallery: savedMedia,
    });
    return moduleState.productEditor;
}

async function saveCustomerDraft(user, draft) {
    const payload = createCustomerDraft(draft);
    if (!payload.company_name && !payload.contact_name && !payload.email) {
        throw new Error('请至少填写客户公司、联系人或邮箱中的一项。');
    }

    const savePayload = {
        company_name: payload.company_name,
        contact_name: payload.contact_name,
        email: payload.email,
        phone: payload.phone,
        country: payload.country,
        notes: payload.notes,
        is_active: true,
        updated_by: user?.id || null,
    };

    let saved = null;
    if (payload.id) {
        const { data, error } = await client.from(TABLE_CUSTOMERS).update(savePayload).eq('id', payload.id).select('*').single();
        if (error) throw error;
        saved = data;
    } else {
        const { data, error } = await client.from(TABLE_CUSTOMERS).insert({
            ...savePayload,
            created_by: user?.id || null,
        }).select('*').single();
        if (error) throw error;
        saved = data;
    }

    await fetchCustomerRows();
    moduleState.customerLoadedId = text(saved?.id);
    moduleState.customerEditor = createCustomerDraft(saved);
    return moduleState.customerEditor;
}

async function updateInstanceShareHistory(user, instanceId, entryId, patch = {}, options = {}) {
    if (!instanceId || !entryId) throw new Error('Send record not found.');

    const { data: existing, error: existingError } = await client
        .from(TABLE_INSTANCE_SENDS)
        .select('*')
        .eq('id', entryId)
        .maybeSingle();
    if (existingError) throw existingError;
    if (!existing) throw new Error('Send record was not found or has been refreshed.');

    const now = new Date().toISOString();
    const nextAttemptCount = options.incrementAttempt === true
        ? Math.max(1, safeNumber(existing.attempt_count, 1)) + 1
        : Math.max(1, safeNumber(existing.attempt_count, 1));
    const currentChannels = Array.isArray(existing.channels) ? existing.channels.map((entry) => text(entry)).filter(Boolean) : [text(existing.last_channel)].filter(Boolean);
    const nextChannels = options.incrementAttempt === true
        ? Array.from(new Set([...currentChannels, text(existing.last_channel, 'share_link')].filter(Boolean)))
        : currentChannels;

    const { data, error } = await client
        .from(TABLE_INSTANCE_SENDS)
        .update({
            status: text(patch.status, existing.status),
            outcome_notes: text(patch.outcome_notes, existing.outcome_notes),
            attempt_count: nextAttemptCount,
            last_sent_at: options.incrementAttempt === true ? now : existing.last_sent_at,
            channels: nextChannels,
            updated_at: now,
            updated_by: user?.id || null,
        })
        .eq('id', entryId)
        .select('*')
        .single();
    if (error) throw error;

    moduleState.instanceSends = moduleState.instanceSends.map((entry) => entry.id === data.id ? createSendLedgerRecord(data) : entry);
    if (!moduleState.instanceSends.some((entry) => entry.id === data.id)) {
        moduleState.instanceSends = [createSendLedgerRecord(data), ...moduleState.instanceSends];
    }
    if (moduleState.instanceEditor?.customer_id) {
        moduleState.customerSends = moduleState.customerSends.map((entry) => entry.id === data.id ? createSendLedgerRecord(data) : entry);
    }
    await fetchInstanceRows();
    return createSendLedgerRecord(data);
}

async function upsertCustomerForInstance(user, draft) {
    const snapshot = buildInstanceCustomerSnapshot(draft);
    const hasCustomerData = Object.values(snapshot).some((value) => hasTextValue(value));
    if (!hasCustomerData) {
        return {
            customer_id: '',
            customer_snapshot: normalizeCustomerSnapshot({}),
        };
    }

    const payload = {
        company_name: snapshot.company_name,
        contact_name: snapshot.contact_name,
        email: snapshot.email,
        phone: snapshot.phone,
        country: snapshot.country,
        notes: snapshot.notes,
        is_active: true,
        updated_by: user?.id || null,
    };

    let savedCustomer = null;
    const currentCustomerId = text(draft.customer_id);
    if (currentCustomerId) {
        const { data, error } = await client.from(TABLE_CUSTOMERS).update(payload).eq('id', currentCustomerId).select('*').single();
        if (error) throw error;
        savedCustomer = data;
    } else if (payload.email) {
        const lookupResult = await client.from(TABLE_CUSTOMERS).select('*').ilike('email', payload.email).maybeSingle();
        if (lookupResult.error && lookupResult.error.code !== 'PGRST116') throw lookupResult.error;
        if (lookupResult.data?.id) {
            const { data, error } = await client.from(TABLE_CUSTOMERS).update(payload).eq('id', lookupResult.data.id).select('*').single();
            if (error) throw error;
            savedCustomer = data;
        }
    }

    if (!savedCustomer) {
        const insertPayload = {
            ...payload,
            created_by: user?.id || null,
        };
        const { data, error } = await client.from(TABLE_CUSTOMERS).insert(insertPayload).select('*').single();
        if (error) throw error;
        savedCustomer = data;
    }

    await fetchCustomerRows();
    return {
        customer_id: text(savedCustomer?.id),
        customer_snapshot: normalizeCustomerSnapshot(savedCustomer),
    };
}

async function archiveQuoteInstance(user, instanceId) {
    if (!instanceId) throw new Error('请先选择一份报价单。');
    const current = moduleState.instances.find((item) => item.id === instanceId) || moduleState.instanceEditor;
    const previousStatus = text(current?.status);
    const fallbackStatus = previousStatus === 'published' ? 'published' : 'draft';
    const { data, error } = await client
        .from(TABLE_INSTANCES)
        .update({
            status: 'archived',
            last_active_status: fallbackStatus,
            archived_at: new Date().toISOString(),
            archived_by: user?.id || null,
            updated_by: user?.id || null,
        })
        .eq('id', instanceId)
        .select('*')
        .single();
    if (error) throw error;
    await fetchInstanceRows();
    if (moduleState.instanceEditor.id === data.id) {
        moduleState.instanceLoadedId = data.id;
        moduleState.instanceEditor = createInstanceDraft({
            ...(current || {}),
            ...data,
            items: moduleState.instanceEditor.items,
        });
    }
    return createInstanceDraft({
        ...(current || {}),
        ...data,
        items: moduleState.instanceEditor.id === data.id ? moduleState.instanceEditor.items : [],
    });
}

async function restoreQuoteInstance(user, instanceId) {
    if (!instanceId) throw new Error('请先选择一份报价单。');
    const current = moduleState.instances.find((item) => item.id === instanceId) || moduleState.instanceEditor;
    const nextStatus = text(current?.last_active_status || 'draft') === 'published' ? 'published' : 'draft';
    const { data, error } = await client
        .from(TABLE_INSTANCES)
        .update({
            status: nextStatus,
            archived_at: null,
            archived_by: null,
            updated_by: user?.id || null,
        })
        .eq('id', instanceId)
        .select('*')
        .single();
    if (error) throw error;
    await fetchInstanceRows();
    if (moduleState.instanceEditor.id === data.id) {
        moduleState.instanceLoadedId = data.id;
        moduleState.instanceEditor = createInstanceDraft({
            ...(current || {}),
            ...data,
            items: moduleState.instanceEditor.items,
        });
    }
    return createInstanceDraft({
        ...(current || {}),
        ...data,
        items: moduleState.instanceEditor.id === data.id ? moduleState.instanceEditor.items : [],
    });
}

async function createInstanceFromProduct(user, productId) {
    const product = productId
        ? moduleState.productEditor?.id === productId
            ? createProductDraft(moduleState.productEditor)
            : await fetchProductEditor(productId)
        : moduleState.productEditor?.id
          ? createProductDraft(moduleState.productEditor)
          : null;
    if (!product?.id) throw new Error('请先选择一个产品模板。');

    const brand = moduleState.brands.find((item) => item.id === product.brand_id);
    if (!brand?.id) throw new Error('未找到对应品牌。');

    const draft = createInstanceDraft({
        brand_id: brand.id,
        product_id: product.id,
        public_slug: createPublicSlug(brand.slug, product.slug),
        status: 'draft',
        last_active_status: 'draft',
        customer_name: '',
        receiver_name: '',
        receiver_email: '',
        default_lang: product.default_lang,
        validity_hours: product.validity_hours,
        draft_rates: product.default_rates,
        brand_snapshot: extractBrandSnapshot({
            ...brand,
            overview_title: expandLocalizedFromChinese(brand.overview_title),
            footer_note: expandLocalizedFromChinese(brand.footer_note),
        }),
        product_snapshot: extractProductSnapshot({
            ...product,
            public_title: expandLocalizedFromChinese(product.public_title),
            section_config: expandSectionConfigLocalized(product.section_config),
            media_config: expandMediaConfig(product.media_config),
            media_gallery: normalizeMediaGallery(product.media_gallery),
        }),
        section_config: expandSectionConfigLocalized(product.section_config),
        items: product.items,
    });

    const { data, error } = await client
        .from(TABLE_INSTANCES)
        .insert({
            brand_id: draft.brand_id,
            product_id: draft.product_id,
            customer_id: null,
            public_slug: draft.public_slug,
            status: 'draft',
            last_active_status: 'draft',
            customer_name: '',
            receiver_name: '',
            receiver_email: '',
            customer_snapshot: {},
            default_lang: draft.default_lang,
            validity_hours: draft.validity_hours,
            draft_rates: draft.draft_rates,
            share_config: {},
            brand_snapshot: draft.brand_snapshot,
            product_snapshot: draft.product_snapshot,
            section_config: draft.section_config,
            created_by: user?.id || null,
            updated_by: user?.id || null,
        })
        .select('*')
        .single();

    if (error) throw error;
    const savedItems = await persistItemRows(TABLE_INSTANCE_ITEMS, 'instance_id', data.id, draft.items);
    await fetchInstanceRows();
    moduleState.instanceLoadedId = data.id;
    moduleState.instanceEditor = createInstanceDraft({
        ...data,
        items: savedItems,
    });
    return moduleState.instanceEditor;
}

async function saveInstanceDraft(user, draft) {
    const payload = createInstanceDraft(draft);
    if (!payload.brand_id || !payload.product_id) throw new Error('报价单必须绑定品牌和产品模板。');
    if (!payload.public_slug) throw new Error('请填写公开链接 slug。');
    if (!pickLocalized(payload.product_snapshot.public_title, payload.default_lang)) throw new Error('请至少填写一个产品标题。');
    const customerRelation = await upsertCustomerForInstance(user, payload);

    const savePayload = {
        brand_id: payload.brand_id,
        product_id: payload.product_id,
        customer_id: customerRelation.customer_id || null,
        public_slug: payload.public_slug,
        status: 'draft',
        last_active_status: 'draft',
        archived_at: null,
        archived_by: null,
        customer_name: payload.customer_name,
        receiver_name: payload.receiver_name,
        receiver_email: payload.receiver_email,
        default_lang: payload.default_lang,
        validity_hours: payload.validity_hours,
        draft_rates: normalizeRates(payload.draft_rates),
        share_config: payload.share_config && typeof payload.share_config === 'object' ? payload.share_config : {},
        customer_snapshot: customerRelation.customer_snapshot,
        brand_snapshot: extractBrandSnapshot({
            ...payload.brand_snapshot,
            overview_title: expandLocalizedFromChinese(payload.brand_snapshot?.overview_title),
            footer_note: expandLocalizedFromChinese(payload.brand_snapshot?.footer_note),
        }),
        product_snapshot: extractProductSnapshot({
            ...payload.product_snapshot,
            public_title: expandLocalizedFromChinese(payload.product_snapshot?.public_title),
            section_config: expandSectionConfigLocalized(payload.section_config),
            default_rates: payload.draft_rates,
            default_lang: payload.default_lang,
            validity_hours: payload.validity_hours,
            media_config: expandMediaConfig(payload.product_snapshot?.media_config),
            media_gallery: normalizeMediaGallery(payload.product_snapshot?.media_gallery),
        }),
        section_config: expandSectionConfigLocalized(payload.section_config),
        updated_by: user?.id || null,
    };
    if (payload.id) savePayload.id = payload.id;
    if (!payload.id) savePayload.created_by = user?.id || null;

    const { data, error } = await client.from(TABLE_INSTANCES).upsert(savePayload, { onConflict: 'public_slug' }).select('*').single();
    if (error) throw error;
    const savedItems = await persistItemRows(TABLE_INSTANCE_ITEMS, 'instance_id', data.id, payload.items);
    await fetchInstanceRows();
    moduleState.instanceLoadedId = data.id;
    moduleState.instanceEditor = createInstanceDraft({
        ...data,
        items: savedItems,
    });
    return moduleState.instanceEditor;
}

async function publishInstance(user, draft) {
    const savedDraft = await saveInstanceDraft(user, draft);
    const snapshot = buildQuoteSnapshot({
        brand: savedDraft.brand_snapshot,
        product: savedDraft.product_snapshot,
        instance: savedDraft,
        items: savedDraft.items,
        publishedAt: new Date().toISOString(),
        mode: 'published',
    });

    const { data, error } = await client
        .from(TABLE_INSTANCES)
        .update({
            status: 'published',
            last_active_status: 'published',
            archived_at: null,
            archived_by: null,
            published_snapshot: snapshot,
            published_at: snapshot.quote.publishedAt,
            updated_by: user?.id || null,
        })
        .eq('id', savedDraft.id)
        .select('*')
        .single();
    if (error) throw error;
    await fetchInstanceRows();
    moduleState.instanceLoadedId = data.id;
    moduleState.instanceEditor = createInstanceDraft({
        ...data,
        items: savedDraft.items,
    });
    return moduleState.instanceEditor;
}

function publicQuoteUrl(publicSlug) {
    return new URL(`/quote/view.html?quote=${encodeURIComponent(publicSlug)}`, window.location.origin).toString();
}

function previewQuoteUrl(instanceId) {
    return new URL(`/quote/view.html?preview=${encodeURIComponent(instanceId)}`, window.location.origin).toString();
}

function quoteEditorUrl(kind, id) {
    return new URL(`/quote/editor.html?kind=${encodeURIComponent(kind)}&id=${encodeURIComponent(id)}`, window.location.origin).toString();
}

async function importLegacySeedData(user) {
    const legacyPages = await ensureLegacyQuotePagesLoaded('/shared/quote-system/quote-pages.js');
    const bundles = convertLegacyPagesToSeedPayloads(legacyPages);
    if (!bundles.length) throw new Error('没有找到可导入的示例报价数据。');

    for (const bundle of bundles) {
        const brandSave = await saveBrandDraft(user, bundle.brand);
        let defaultQuoteSlug = '';

        for (const entry of bundle.products) {
            const savedProduct = await saveProductDraft(user, {
                ...entry.product,
                brand_id: brandSave.id,
                items: entry.items,
            });

            const draft = createInstanceDraft({
                ...entry.demoInstance,
                brand_id: brandSave.id,
                product_id: savedProduct.id,
                brand_snapshot: extractBrandSnapshot(brandSave),
                product_snapshot: extractProductSnapshot(savedProduct),
                items: entry.items,
            });

            const savedInstance = await saveInstanceDraft(user, draft);
            await publishInstance(user, savedInstance);
            if (!defaultQuoteSlug) defaultQuoteSlug = savedInstance.public_slug;
        }

        if (defaultQuoteSlug) {
            await saveBrandDraft(user, {
                ...brandSave,
                default_quote_slug: defaultQuoteSlug,
            });
        }
    }

    await Promise.all([fetchBrandRows(), fetchProductRows(), fetchInstanceRows()]);
}

async function ensureBaseTemplates() {
    const liveTemplates = await buildLiveBaseTemplates();
    if (liveTemplates.length) {
        moduleState.baseTemplates = liveTemplates;
        return moduleState.baseTemplates;
    }

    const legacyPages = await ensureLegacyQuotePagesLoaded('/shared/quote-system/quote-pages.js');
    const bundles = convertLegacyPagesToSeedPayloads(legacyPages);
    moduleState.baseTemplates = bundles
        .map((bundle) => {
            const brandSlug = text(bundle?.brand?.slug).toLowerCase();
            const meta = PUBLIC_TEMPLATE_LIBRARY[brandSlug];
            return {
                key: brandSlug,
                label: text(meta?.label || bundle?.brand?.display_name || bundle?.brand?.brand_name || bundle?.brand?.slug),
                hint: text(meta?.hint),
                brand: createBrandDraft(bundle?.brand || {}),
                products: (bundle?.products || []).map((entry) => ({
                    key: `${brandSlug}:${text(entry?.product?.slug)}`,
                    brandKey: brandSlug,
                    label: pickLocalized(entry?.product?.public_title, 'zh', text(entry?.product?.slug)),
                    product: createProductDraft({
                        ...(entry?.product || {}),
                        items: entry?.items || [],
                    }),
                })),
            };
        })
        .filter((group) => group.products.length);
    return moduleState.baseTemplates;
}

function baseTemplateOptionsMarkup() {
    const options = moduleState.baseTemplates
        .map(
            (group) => `
                <optgroup label="${esc(group.label)}">
                    ${group.products
                        .map((entry) => `<option value="${esc(entry.key)}">${esc(entry.label)}</option>`)
                        .join('')}
                </optgroup>
            `,
        )
        .join('');
    return options || '<option value="">当前没有可载入的基础模板</option>';
}

function applyBaseTemplateToProductEditor(templateKey = '') {
    const [brandKey, productKey] = String(templateKey || '').split(':');
    const templateGroup = moduleState.baseTemplates.find((entry) => entry.key === brandKey);
    const templateProduct = templateGroup?.products.find((entry) => entry.product.slug === productKey);
    if (!templateGroup || !templateProduct) throw new Error('未找到对应的基础模板。');

    const currentBrandId =
        text(moduleState.productEditor?.brand_id) ||
        (moduleState.productBrandFilter !== 'all' ? text(moduleState.productBrandFilter) : '') ||
        text(moduleState.brands[0]?.id);

    moduleState.productLoadedId = '';
    moduleState.productEditor = createProductDraft({
        ...templateProduct.product,
        id: '',
        brand_id: currentBrandId,
        slug: buildTemplateProductSlug(currentBrandId, templateProduct.product.slug),
        product_code: templateProduct.product.product_code,
        items: templateProduct.product.items,
        media_gallery: templateProduct.product.media_gallery,
    });
    syncProductBrandDraft(currentBrandId);
}

function templateLibraryMeta(brandSlug = '') {
    return PUBLIC_TEMPLATE_LIBRARY[text(brandSlug).toLowerCase()] || null;
}

function normalizeSlugPart(value = '', fallback = 'template') {
    return text(value, fallback)
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '') || fallback;
}

function buildTemplateProductSlug(targetBrandId = '', sourceSlug = '') {
    const targetBrandSlug = normalizeSlugPart(brandSlugById(targetBrandId), '');
    const source = normalizeSlugPart(sourceSlug, 'product');
    const baseSlug = targetBrandSlug && !source.startsWith(`${targetBrandSlug}-`)
        ? `${targetBrandSlug}-${source}`
        : source;
    const existingSlugs = new Set(moduleState.products.map((product) => text(product.slug).toLowerCase()).filter(Boolean));
    if (!existingSlugs.has(baseSlug.toLowerCase())) return baseSlug;

    let index = 2;
    let candidate = `${baseSlug}-copy`;
    while (existingSlugs.has(candidate.toLowerCase())) {
        candidate = `${baseSlug}-copy-${index}`;
        index += 1;
    }
    return candidate;
}

async function buildLiveBaseTemplates() {
    const sourceBrands = moduleState.brands
        .map((brand) => {
            const slug = text(brand.slug).toLowerCase();
            const meta = templateLibraryMeta(slug);
            if (!meta || !brand.id) return null;
            return { brand, slug, meta };
        })
        .filter(Boolean)
        .sort((left, right) => safeNumber(left.meta?.order, 100) - safeNumber(right.meta?.order, 100));

    if (!sourceBrands.length) return [];

    const sourceBrandIds = new Set(sourceBrands.map((entry) => entry.brand.id));
    const sourceProducts = moduleState.products.filter((product) => sourceBrandIds.has(product.brand_id) && product.is_active !== false);
    if (!sourceProducts.length) return [];

    const productIds = sourceProducts.map((product) => text(product.id)).filter(Boolean);
    const itemsByProduct = new Map();
    const mediaByProduct = new Map();
    if (productIds.length) {
        const [itemsResult, mediaResult] = await Promise.all([
            client.from(TABLE_PRODUCT_ITEMS).select('*').in('product_id', productIds).order('sort_order', { ascending: true }),
            client.from(TABLE_PRODUCT_MEDIA).select('*').in('product_id', productIds).order('sort_order', { ascending: true }),
        ]);
        if (itemsResult.error) throw itemsResult.error;
        if (mediaResult.error) throw mediaResult.error;

        (itemsResult.data || []).forEach((row) => {
            const key = text(row.product_id);
            const list = itemsByProduct.get(key) || [];
            list.push(row);
            itemsByProduct.set(key, list);
        });
        (mediaResult.data || []).forEach((row) => {
            const key = text(row.product_id);
            const list = mediaByProduct.get(key) || [];
            list.push(row);
            mediaByProduct.set(key, list);
        });
    }

    return sourceBrands
        .map(({ brand, slug, meta }) => ({
            key: slug,
            label: meta.label,
            hint: meta.hint,
            brand: createBrandDraft(brand),
            products: sourceProducts
                .filter((product) => product.brand_id === brand.id)
                .map((product) => ({
                    key: `${slug}:${text(product.slug)}`,
                    brandKey: slug,
                    label: pickLocalized(product.public_title, product.default_lang, text(product.slug)),
                    product: createProductDraft({
                        ...product,
                        items: itemsByProduct.get(text(product.id)) || [],
                        media_gallery: mediaByProduct.get(text(product.id)) || [],
                    }),
                }))
                .sort((left, right) => {
                    const leftOrder = safeNumber(left.product?.sort_order, 100);
                    const rightOrder = safeNumber(right.product?.sort_order, 100);
                    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
                    return text(left.label).localeCompare(text(right.label));
                }),
        }))
        .filter((group) => group.products.length);
}

function filteredProducts() {
    if (moduleState.productBrandFilter === 'all') return moduleState.products;
    return moduleState.products.filter((item) => item.brand_id === moduleState.productBrandFilter);
}

function filteredInstances() {
    return moduleState.instances.filter((item) => {
        if (moduleState.instanceBrandFilter !== 'all' && item.brand_id !== moduleState.instanceBrandFilter) return false;
        if (moduleState.instanceStatusFilter !== 'all' && item.status !== moduleState.instanceStatusFilter) return false;
        return true;
    });
}

function filteredCustomers() {
    const query = text(moduleState.customerSearch).toLowerCase();
    const rows = moduleState.customers.filter((customer) => {
        if (!query) return true;
        return [
            customer.company_name,
            customer.contact_name,
            customer.email,
            customer.phone,
            customer.country,
        ].some((value) => text(value).toLowerCase().includes(query));
    });
    return rows.sort((left, right) => {
        const leftName = customerDisplayName(left).toLowerCase();
        const rightName = customerDisplayName(right).toLowerCase();
        return leftName.localeCompare(rightName);
    });
}

function customerQuotes(customerId = '') {
    return moduleState.instances
        .filter((item) => text(item.customer_id) === text(customerId))
        .sort((left, right) => text(right.updated_at).localeCompare(text(left.updated_at)));
}

function brandLabelById(brandId) {
    const brand = moduleState.brands.find((item) => item.id === brandId);
    return brand?.display_name || brand?.brand_name || '--';
}

function brandSlugById(brandId) {
    const brand = moduleState.brands.find((item) => item.id === brandId);
    return brand?.slug || '';
}

function latestPublishedQuoteSlugForBrand(brandId = '') {
    return moduleState.instances
        .filter((item) => text(item.brand_id) === text(brandId) && text(item.status) === 'published' && text(item.public_slug))
        .sort((left, right) => {
            const rightStamp = text(right.published_at || right.updated_at);
            const leftStamp = text(left.published_at || left.updated_at);
            return rightStamp.localeCompare(leftStamp);
        })[0]?.public_slug || '';
}

function syncProductBrandDraft(brandId) {
    const brand = moduleState.brands.find((item) => item.id === brandId);
    moduleState.productBrandDraft = createBrandDraft(brand || { id: brandId });
    return moduleState.productBrandDraft;
}

function currentProductBrandDraft() {
    if (!moduleState.productBrandDraft?.id || moduleState.productBrandDraft.id !== moduleState.productEditor?.brand_id) {
        syncProductBrandDraft(moduleState.productEditor?.brand_id);
    }
    return moduleState.productBrandDraft;
}

function productLabelById(productId) {
    const product = moduleState.products.find((item) => item.id === productId);
    return pickLocalized(product?.public_title, product?.default_lang || DEFAULT_LANG, '--');
}

async function ensureBaseData() {
    await Promise.all([fetchBrandRows(), fetchProductRows(), fetchCustomerRows(), fetchInstanceRows()]);
}

function isQuoteSetupMissing(error) {
    const message = String(error?.message || '').toLowerCase();
    return (
        message.includes('quote_brands') ||
        message.includes('quote_products') ||
        message.includes('quote_product_media') ||
        message.includes('quote_instances') ||
        message.includes('admin_users') ||
        message.includes('infinite recursion') ||
        message.includes('relation') ||
        message.includes('does not exist')
    );
}

function renderQuoteSetupRequired(input, error) {
    input.setPageHeader('报价系统 / 初始化', '当前环境还没有完成报价系统数据表初始化。');
    input.setContent(`
        <section class="ams-card ams-hero-card ams-hero-card-compact">
            <div class="ams-hero-copy">
                <p class="ams-eyebrow">Quote System</p>
                <h2>先执行 SQL 初始化，再进入品牌 / 产品 / 报价单管理。</h2>
                <p class="ams-hero-text">报价系统当前依赖品牌、产品、产品图片库、报价单和明细等业务表，以及对应的 RLS / Storage 策略。当前后台检测到这些对象还未在 Supabase 中就绪，所以先给出明确安装步骤，而不是让页面直接报错。</p>
            </div>
            <div class="ams-quick-actions">
                <div class="ams-quick-link ams-quick-link-static">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-database"></i></div>
                    <div class="ams-quick-link-body">
                        <strong>执行 SQL 文件</strong>
                        <span>请先在 Supabase SQL Editor 执行 <code>article_management/sql/006_quote_system.sql</code>；已有旧版库时，再补执行 <code>article_management/sql/008_quote_product_media.sql</code>、<code>article_management/sql/010_quote_customer_tracking.sql</code> 和 <code>article_management/sql/011_quote_send_ledger.sql</code>。</span>
                    </div>
                </div>
                <div class="ams-quick-link ams-quick-link-static">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-file-import"></i></div>
                    <div class="ams-quick-link-body">
                        <strong>完成后导入示例模板</strong>
                        <span>执行完成后回到“品牌管理”，点击“导入示例模板”，即可生成 VMAN / MinerPower 的初始品牌、产品模板和演示报价单。</span>
                    </div>
                </div>
            </div>
        </section>
        <section class="ams-card">
            <div class="ams-section-head">
                <div>
                    <h3>当前错误</h3>
                    <p>用于确认当前缺的是数据库初始化，而不是页面代码本身。</p>
                </div>
            </div>
            <pre class="ams-preview">${esc(error?.message || 'Unknown quote setup error')}</pre>
        </section>
    `);
}

function localizedFieldGroup(idPrefix, label, value = {}) {
    const localized = normalizeLocalizedText(value);
    return `
        <div class="ams-quote-field-card">
            <div class="ams-quote-field-card-head">
                <strong>${esc(label)}</strong>
                <span>默认中文录入</span>
            </div>
            <div class="ams-field">
                <label>中文</label>
                <textarea class="ams-textarea ams-quote-textarea" data-i18n-prefix="${esc(idPrefix)}" data-lang="zh">${esc(localized.zh || '')}</textarea>
                <div class="ams-field-help">EN / RU 不填时会自动继承中文内容。</div>
            </div>
            <details class="ams-locale-details">
                <summary>可选：多语言覆盖</summary>
                <div class="ams-site-field-grid ams-site-field-grid-wide">
                    ${['en', 'ru']
                        .map(
                            (lang) => `
                                <div class="ams-field">
                                    <label>${lang.toUpperCase()}</label>
                                    <textarea class="ams-textarea ams-quote-textarea" data-i18n-prefix="${esc(idPrefix)}" data-lang="${esc(lang)}">${esc(localized[lang] || '')}</textarea>
                                </div>
                            `,
                        )
                        .join('')}
                </div>
            </details>
        </div>
    `;
}

function ratesFieldset(prefix, rates = DEFAULT_RATES) {
    const normalized = normalizeRates(rates);
    return `
        <div class="ams-site-field-grid ams-site-field-grid-wide">
            ${Object.entries(normalized)
                .map(
                    ([code, value]) => `
                        <div class="ams-field">
                            <label>${esc(code)}</label>
                            <input class="ams-input" type="number" step="0.0001" min="0" data-rate-prefix="${esc(prefix)}" data-rate-code="${esc(code)}" value="${esc(value)}">
                        </div>
                    `,
                )
                .join('')}
        </div>
    `;
}

function sectionConfigMarkup(prefix, sections = createSectionConfig()) {
    const normalized = normalizeSectionConfig(sections);
    return normalized
        .map(
            (section) => `
                <div class="ams-quote-section-config">
                    <div class="ams-quote-section-config-head">
                        <strong>${esc(section.key === SECTION_KEYS.MAIN ? '主配置 / Main' : '选配 / Optional')}</strong>
                    </div>
                    ${localizedFieldGroup(`${prefix}:title:${section.key}`, '区块标题', section.title)}
                    <div class="ams-site-field-grid ams-site-field-grid-wide">
                        <div class="ams-field">
                            <label>小计模式</label>
                            <select class="ams-select" data-section-prefix="${esc(prefix)}" data-section-key="${esc(section.key)}" data-section-field="subtotalMode">
                                <option value="manual" ${section.subtotalMode === 'manual' ? 'selected' : ''}>手动小计</option>
                                <option value="sum" ${section.subtotalMode === 'sum' ? 'selected' : ''}>自动汇总</option>
                            </select>
                        </div>
                        <div class="ams-field">
                            <label>手动小计 RMB</label>
                            <input class="ams-input" type="number" step="0.01" min="0" data-section-prefix="${esc(prefix)}" data-section-key="${esc(section.key)}" data-section-field="subtotal" value="${esc(section.subtotal)}">
                        </div>
                    </div>
                </div>
            `,
        )
        .join('');
}

function statusPill(status = 'draft') {
    const normalized = text(status || 'draft').toLowerCase();
    const key = normalized === 'published' || normalized === 'archived' ? normalized : 'draft';
    const label = key === 'published' ? '已发布' : key === 'archived' ? '已归档' : '草稿';
    return `<span class="ams-pill ${esc(key)}">${label}</span>`;
}

function eventTypeLabel(eventType = '') {
    const key = text(eventType);
    if (key === 'share_link_generated') return '生成分享链接';
    if (key === 'share_opened') return '外链访问';
    if (key === 'preview_opened') return '后台预览';
    if (key === 'passcode_unlocked') return '提取码解锁';
    if (key === 'email_clicked') return '点击邮件发送';
    return '报价浏览';
}

function accessModeLabel(accessMode = '') {
    const key = text(accessMode);
    if (key === 'share') return '分享链接';
    if (key === 'preview') return '后台预览';
    if (key === 'admin') return '管理员';
    return '公开链接';
}

function itemTableMarkup(prefix, sectionKey, items = []) {
    const rows = sortItems(items.filter((item) => item.section_key === sectionKey));
    return `
        <div class="ams-table-wrap">
            <table class="ams-table ams-quote-line-table">
                <thead>
                    <tr>
                        <th>排序</th>
                        <th>编码</th>
                        <th>品牌</th>
                        <th>数量</th>
                        <th>RMB</th>
                        <th>包含</th>
                        <th>名称（中文）</th>
                        <th>多语言（可选）</th>
                        <th class="ams-col-actions">操作</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                        rows.length
                            ? rows
                                  .map(
                                      (row) => `
                                <tr data-item-row="${esc(row.localId)}">
                                    <td><input class="ams-input" type="number" step="10" data-item-prefix="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-item-field="sort_order" value="${esc(row.sort_order)}"></td>
                                    <td><input class="ams-input" data-item-prefix="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-item-field="line_code" value="${esc(row.line_code)}"></td>
                                    <td><input class="ams-input" data-item-prefix="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-item-field="brand_label" value="${esc(row.brand_label)}"></td>
                                    <td><input class="ams-input" data-item-prefix="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-item-field="qty_label" value="${esc(row.qty_label)}"></td>
                                    <td><input class="ams-input" type="number" step="0.01" min="0" data-item-prefix="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-item-field="price_rmb" value="${esc(row.price_rmb)}"></td>
                                    <td class="ams-col-check"><input class="ams-check" type="checkbox" data-item-prefix="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-item-field="is_included" ${row.is_included ? 'checked' : ''}></td>
                                    <td><textarea class="ams-textarea ams-quote-row-textarea" data-item-prefix="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-item-lang="zh">${esc(row.name_i18n?.zh || '')}</textarea></td>
                                    <td class="ams-quote-locales-cell">
                                        <details class="ams-locale-details ams-locale-details-compact">
                                            <summary>EN / RU 可选</summary>
                                            <div class="ams-quote-locale-stack">
                                                <div class="ams-field">
                                                    <label>EN</label>
                                                    <textarea class="ams-textarea ams-quote-row-textarea" data-item-prefix="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-item-lang="en">${esc(row.name_i18n?.en || '')}</textarea>
                                                </div>
                                                <div class="ams-field">
                                                    <label>RU</label>
                                                    <textarea class="ams-textarea ams-quote-row-textarea" data-item-prefix="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-item-lang="ru">${esc(row.name_i18n?.ru || '')}</textarea>
                                                </div>
                                            </div>
                                        </details>
                                    </td>
                                    <td class="ams-col-actions">
                                        <div class="ams-row-actions">
                                            <button class="ams-btn ams-btn-muted" type="button" data-item-move="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-direction="-1">上移</button>
                                            <button class="ams-btn ams-btn-muted" type="button" data-item-move="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-direction="1">下移</button>
                                            <button class="ams-btn ams-btn-danger" type="button" data-item-delete="${esc(prefix)}" data-item-id="${esc(row.localId)}">删除</button>
                                        </div>
                                    </td>
                                </tr>
                            `,
                                  )
                                  .join('')
                            : '<tr><td colspan="9"><div class="ams-empty">当前区块还没有明细。</div></td></tr>'
                    }
                </tbody>
            </table>
        </div>
        <div class="ams-inline-actions">
            <button class="ams-btn ams-btn-muted" type="button" data-item-add="${esc(prefix)}" data-section-key="${esc(sectionKey)}">新增一行</button>
        </div>
    `;
}

function visualSectionName(sectionKey) {
    return sectionKey === SECTION_KEYS.OPTIONAL ? '选配区块' : '主配置区块';
}

function visualSectionEditorMarkup(prefix, section, items = []) {
    const rows = sortItems(items.filter((item) => item.section_key === section.key));
    return `
        <section class="ams-quote-visual-block">
            <div class="ams-quote-visual-block-head">
                <div class="ams-quote-visual-block-copy">
                    <span class="ams-quote-visual-kicker">${esc(visualSectionName(section.key))}</span>
                    <textarea class="ams-textarea ams-quote-visual-title-input" rows="2" data-i18n-prefix="${esc(`${prefix}:title:${section.key}`)}" data-lang="zh">${esc(section.title?.zh || '')}</textarea>
                    <details class="ams-locale-details ams-locale-details-compact">
                        <summary>可选：多语言标题</summary>
                        <div class="ams-site-field-grid ams-site-field-grid-wide">
                            ${['en', 'ru']
                                .map(
                                    (lang) => `
                                        <div class="ams-field">
                                            <label>${lang.toUpperCase()}</label>
                                            <textarea class="ams-textarea ams-quote-row-textarea" rows="2" data-i18n-prefix="${esc(`${prefix}:title:${section.key}`)}" data-lang="${esc(lang)}">${esc(section.title?.[lang] || '')}</textarea>
                                        </div>
                                    `,
                                )
                                .join('')}
                        </div>
                    </details>
                </div>
                <div class="ams-quote-visual-block-meta">
                    <div class="ams-field">
                        <label>小计模式</label>
                        <select class="ams-select" data-section-prefix="${esc(prefix)}" data-section-key="${esc(section.key)}" data-section-field="subtotalMode">
                            <option value="manual" ${section.subtotalMode === 'manual' ? 'selected' : ''}>手动小计</option>
                            <option value="sum" ${section.subtotalMode === 'sum' ? 'selected' : ''}>自动汇总</option>
                        </select>
                    </div>
                    <div class="ams-field">
                        <label>手动小计 RMB</label>
                        <input class="ams-input" type="number" step="0.01" min="0" data-section-prefix="${esc(prefix)}" data-section-key="${esc(section.key)}" data-section-field="subtotal" value="${esc(section.subtotal)}">
                    </div>
                </div>
            </div>
            <div class="ams-table-wrap ams-quote-visual-table-wrap">
                <table class="ams-table ams-quote-visual-table">
                    <thead>
                        <tr>
                            <th>SEQ</th>
                            <th>描述</th>
                            <th>品牌</th>
                            <th>QTY</th>
                            <th>RMB</th>
                            <th>包含</th>
                            <th class="ams-col-actions">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
                            rows.length
                                ? rows
                                      .map(
                                          (row) => `
                                    <tr data-item-row="${esc(row.localId)}">
                                        <td>
                                            <input class="ams-input ams-quote-inline-input" data-item-prefix="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-item-field="line_code" value="${esc(row.line_code)}" placeholder="I-1">
                                        </td>
                                        <td>
                                            <textarea class="ams-textarea ams-quote-inline-textarea" rows="2" data-item-prefix="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-item-lang="zh">${esc(row.name_i18n?.zh || '')}</textarea>
                                            <details class="ams-locale-details ams-locale-details-compact ams-quote-inline-locales">
                                                <summary>EN / RU 可选</summary>
                                                <div class="ams-quote-locale-stack">
                                                    <div class="ams-field">
                                                        <label>EN</label>
                                                        <textarea class="ams-textarea ams-quote-row-textarea" rows="2" data-item-prefix="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-item-lang="en">${esc(row.name_i18n?.en || '')}</textarea>
                                                    </div>
                                                    <div class="ams-field">
                                                        <label>RU</label>
                                                        <textarea class="ams-textarea ams-quote-row-textarea" rows="2" data-item-prefix="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-item-lang="ru">${esc(row.name_i18n?.ru || '')}</textarea>
                                                    </div>
                                                </div>
                                            </details>
                                        </td>
                                        <td><input class="ams-input ams-quote-inline-input" data-item-prefix="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-item-field="brand_label" value="${esc(row.brand_label)}" placeholder="Vman"></td>
                                        <td><input class="ams-input ams-quote-inline-input" data-item-prefix="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-item-field="qty_label" value="${esc(row.qty_label)}" placeholder="1"></td>
                                        <td><input class="ams-input ams-quote-inline-input" type="number" step="0.01" min="0" data-item-prefix="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-item-field="price_rmb" value="${esc(row.price_rmb)}"></td>
                                        <td class="ams-col-check"><input class="ams-check" type="checkbox" data-item-prefix="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-item-field="is_included" ${row.is_included ? 'checked' : ''}></td>
                                        <td class="ams-col-actions">
                                            <div class="ams-row-actions ams-quote-visual-row-actions">
                                                <button class="ams-btn ams-btn-muted" type="button" data-item-move="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-direction="-1">上移</button>
                                                <button class="ams-btn ams-btn-muted" type="button" data-item-move="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-direction="1">下移</button>
                                                <button class="ams-btn ams-btn-danger" type="button" data-item-delete="${esc(prefix)}" data-item-id="${esc(row.localId)}">删除</button>
                                            </div>
                                        </td>
                                    </tr>
                                `,
                                      )
                                      .join('')
                                : '<tr><td colspan="7"><div class="ams-empty">当前区块还没有明细，点击下方按钮新增一行。</div></td></tr>'
                        }
                    </tbody>
                </table>
            </div>
            <div class="ams-inline-actions">
                <button class="ams-btn ams-btn-primary ams-quote-visual-add" type="button" data-item-add="${esc(prefix)}" data-section-key="${esc(section.key)}">新增一行</button>
            </div>
        </section>
    `;
}

function uiTextFieldMarkup(prefix, key, label, value = {}) {
    const localized = normalizeLocalizedText(value);
    return `
        <div class="ams-field ams-quote-ui-field">
            <label>${esc(label)}</label>
            <input class="ams-input" data-ui-text-prefix="${esc(prefix)}" data-ui-text-key="${esc(key)}" data-lang="zh" value="${esc(localized.zh || '')}" placeholder="留空则使用系统默认">
            <details class="ams-locale-details ams-locale-details-compact">
                <summary>EN / RU 可选</summary>
                <div class="ams-site-field-grid ams-site-field-grid-wide">
                    <div class="ams-field">
                        <label>EN</label>
                        <input class="ams-input" data-ui-text-prefix="${esc(prefix)}" data-ui-text-key="${esc(key)}" data-lang="en" value="${esc(localized.en || '')}">
                    </div>
                    <div class="ams-field">
                        <label>RU</label>
                        <input class="ams-input" data-ui-text-prefix="${esc(prefix)}" data-ui-text-key="${esc(key)}" data-lang="ru" value="${esc(localized.ru || '')}">
                    </div>
                </div>
            </details>
        </div>
    `;
}

function quoteUiTextMarkup(prefix, uiText = {}) {
    const normalized = normalizeProductUiText(uiText);
    const fields = [
        ['receiver_placeholder', '收件人提示语'],
        ['supplier_label', '供应商标签'],
        ['sender_label', '发件人标签'],
        ['receiver_label', '收件人标签'],
        ['validity_label', '有效期标签'],
        ['system_total_label', '总价标题'],
        ['refresh_button', '刷新汇率按钮'],
        ['send_button', '发送按钮'],
        ['share_button', '分享按钮'],
    ];
    return `
        <details class="ams-quote-ui-panel">
            <summary>页面文案与提示语</summary>
            <div class="ams-site-field-grid ams-site-field-grid-wide">
                ${fields.map(([key, label]) => uiTextFieldMarkup(prefix, key, label, normalized[key])).join('')}
            </div>
        </details>
    `;
}

function productVisualEditorMarkup(product, brandDraft = {}) {
    const normalized = createProductDraft(product);
    const brand = createBrandDraft(brandDraft);
    const title = normalizeLocalizedText(normalized.public_title);
    const rates = normalizeRates(normalized.default_rates);
    const sections = normalizeSectionConfig(normalized.section_config);
    return `
        <section class="ams-quote-visual-shell ams-instance-visual-shell" id="ams-product-visual-editor">
            <div class="ams-quote-visual-stage">
                <div class="ams-quote-visual-header">
                    <div class="ams-quote-visual-title-panel">
                        <span class="ams-quote-visual-kicker">原页面可视化编辑</span>
                        <textarea class="ams-textarea ams-quote-visual-hero-input" rows="2" data-product-brand-i18n="overview_title" data-lang="zh">${esc(brand.overview_title?.zh || '')}</textarea>
                        <div class="ams-quote-visual-meta-grid">
                            <div class="ams-field">
                                <label>供应商</label>
                                <input class="ams-input" data-product-brand-field="supplier_name" value="${esc(brand.supplier_name)}" placeholder="VMAN Engineering">
                            </div>
                            <div class="ams-field">
                                <label>发件邮箱</label>
                                <input class="ams-input" data-product-brand-field="sender_email" value="${esc(brand.sender_email)}" placeholder="sales@example.com">
                            </div>
                        </div>
                        <div class="ams-quote-visual-product-title">
                            <span class="ams-quote-visual-kicker">产品标题</span>
                            <textarea class="ams-textarea ams-quote-visual-title-input" rows="2" data-i18n-prefix="product:public_title" data-lang="zh">${esc(title.zh || '')}</textarea>
                        </div>
                        <details class="ams-locale-details">
                            <summary>可选：多语言标题与页头</summary>
                            <div class="ams-site-field-grid ams-site-field-grid-wide">
                                ${['en', 'ru']
                                    .map(
                                        (lang) => `
                                            <div class="ams-field">
                                                <label>页面总标题 ${lang.toUpperCase()}</label>
                                                <textarea class="ams-textarea ams-quote-textarea" data-product-brand-i18n="overview_title" data-lang="${esc(lang)}">${esc(brand.overview_title?.[lang] || '')}</textarea>
                                            </div>
                                            <div class="ams-field">
                                                <label>产品标题 ${lang.toUpperCase()}</label>
                                                <textarea class="ams-textarea ams-quote-textarea" data-i18n-prefix="product:public_title" data-lang="${esc(lang)}">${esc(title[lang] || '')}</textarea>
                                            </div>
                                        `,
                                    )
                                    .join('')}
                            </div>
                        </details>
                        ${quoteUiTextMarkup('product', normalized.ui_text)}
                    </div>
                    <div class="ams-quote-visual-rates-card">
                        <div class="ams-quote-visual-rates-head">
                            <strong>默认汇率</strong>
                            <span>直接改这里，生成报价单时自动带入</span>
                        </div>
                        <div class="ams-quote-visual-rates-grid">
                            ${Object.entries(rates)
                                .map(
                                    ([code, value]) => `
                                        <label class="ams-quote-rate-chip">
                                            <span>${esc(code)}</span>
                                            <input class="ams-input ams-quote-rate-input" type="number" step="0.0001" min="0" data-rate-prefix="product" data-rate-code="${esc(code)}" value="${esc(value)}">
                                        </label>
                                    `,
                                )
                                .join('')}
                        </div>
                        <div class="ams-field">
                            <label>页脚说明</label>
                            <textarea class="ams-textarea ams-quote-textarea" rows="4" data-product-brand-i18n="footer_note" data-lang="zh">${esc(brand.footer_note?.zh || '')}</textarea>
                        </div>
                    </div>
                </div>
                <div class="ams-quote-visual-sections">
                    ${sections.map((section) => visualSectionEditorMarkup('product', section, normalized.items)).join('')}
                </div>
            </div>
        </section>
    `;
}

function instanceVisualEditorMarkup(instance) {
    const draft = createInstanceDraft(instance);
    const brand = extractBrandSnapshot(draft.brand_snapshot);
    const product = extractProductSnapshot({
        ...draft.product_snapshot,
        section_config: draft.section_config,
    });
    const title = normalizeLocalizedText(product.public_title);
    const sections = normalizeSectionConfig(draft.section_config);
    const rates = normalizeRates(draft.draft_rates);

    return `
        <section class="ams-quote-visual-shell" id="ams-instance-visual-editor">
            <div class="ams-quote-visual-stage">
                <div class="ams-quote-visual-header">
                    <div class="ams-quote-visual-title-panel">
                        <span class="ams-quote-visual-kicker">报价页 1:1 可视化编辑</span>
                        <textarea class="ams-textarea ams-quote-visual-hero-input" rows="2" data-i18n-prefix="instance-brand:overview_title" data-lang="zh">${esc(brand.overview_title?.zh || '')}</textarea>
                        <div class="ams-quote-visual-meta-grid">
                            <div class="ams-field">
                                <label>供应商</label>
                                <input class="ams-input" data-brand-snapshot-field="supplier_name" value="${esc(brand.supplier_name)}" placeholder="VMAN Engineering">
                            </div>
                            <div class="ams-field">
                                <label>发件邮箱</label>
                                <input class="ams-input" data-brand-snapshot-field="sender_email" value="${esc(brand.sender_email)}" placeholder="sales@example.com">
                            </div>
                            <div class="ams-field">
                                <label>收件人</label>
                                <input class="ams-input" data-instance-field="receiver_name" value="${esc(draft.receiver_name)}" placeholder="Receiver">
                            </div>
                            <div class="ams-field">
                                <label>客户邮箱</label>
                                <input class="ams-input" data-instance-field="receiver_email" value="${esc(draft.receiver_email)}" placeholder="customer@example.com">
                            </div>
                        </div>
                        <div class="ams-quote-visual-product-title">
                            <span class="ams-quote-visual-kicker">产品标题</span>
                            <textarea class="ams-textarea ams-quote-visual-title-input" rows="2" data-i18n-prefix="instance-product:public_title" data-lang="zh">${esc(title.zh || '')}</textarea>
                        </div>
                        <details class="ams-locale-details">
                            <summary>可选：多语言页头与标题</summary>
                            <div class="ams-site-field-grid ams-site-field-grid-wide">
                                ${['en', 'ru']
                                    .map(
                                        (lang) => `
                                            <div class="ams-field">
                                                <label>页面总标题 ${lang.toUpperCase()}</label>
                                                <textarea class="ams-textarea ams-quote-textarea" data-i18n-prefix="instance-brand:overview_title" data-lang="${esc(lang)}">${esc(brand.overview_title?.[lang] || '')}</textarea>
                                            </div>
                                            <div class="ams-field">
                                                <label>产品标题 ${lang.toUpperCase()}</label>
                                                <textarea class="ams-textarea ams-quote-textarea" data-i18n-prefix="instance-product:public_title" data-lang="${esc(lang)}">${esc(title[lang] || '')}</textarea>
                                            </div>
                                        `,
                                    )
                                    .join('')}
                            </div>
                        </details>
                        ${quoteUiTextMarkup('instance', product.ui_text)}
                    </div>
                    <div class="ams-quote-visual-rates-card">
                        <div class="ams-quote-visual-rates-head">
                            <strong>报价页头部信息</strong>
                            <span>这里改的就是客户最终看到的这张报价页。</span>
                        </div>
                        <div class="ams-quote-visual-meta-grid">
                            <div class="ams-field">
                                <label>客户名称</label>
                                <input class="ams-input" data-instance-field="customer_name" value="${esc(draft.customer_name)}" placeholder="Demo Customer">
                            </div>
                            <div class="ams-field">
                                <label>有效期（小时）</label>
                                <input class="ams-input" type="number" min="1" step="1" data-instance-field="validity_hours" value="${esc(draft.validity_hours)}">
                            </div>
                        </div>
                        <div class="ams-quote-visual-rates-head">
                            <strong>汇率快照</strong>
                            <span>预览页和发布页都会按这里的数值重算总价与小计。</span>
                        </div>
                        <div class="ams-quote-visual-rates-grid">
                            ${Object.entries(rates)
                                .map(
                                    ([code, value]) => `
                                        <label class="ams-quote-rate-chip">
                                            <span>${esc(code)}</span>
                                            <input class="ams-input ams-quote-rate-input" type="number" step="0.0001" min="0" data-rate-prefix="instance" data-rate-code="${esc(code)}" value="${esc(value)}">
                                        </label>
                                    `,
                                )
                                .join('')}
                        </div>
                        <div class="ams-field">
                            <label>页脚说明</label>
                            <textarea class="ams-textarea ams-quote-textarea" rows="4" data-i18n-prefix="instance-brand:footer_note" data-lang="zh">${esc(brand.footer_note?.zh || '')}</textarea>
                        </div>
                    </div>
                </div>
                <div class="ams-quote-visual-sections">
                    ${sections.map((section) => visualSectionEditorMarkup('instance', section, draft.items)).join('')}
                </div>
            </div>
        </section>
    `;
}

function mediaLibraryMarkup(prefix, mediaConfig = createMediaConfig(), mediaGallery = [], options = {}) {
    const config = normalizeMediaConfig(mediaConfig);
    const gallery = normalizeMediaGallery(mediaGallery);
    const editable = options.editable !== false;
    const extraClass = prefix === 'instance' ? 'ams-quote-media-block' : text(options.extraClass);
    const uploadLabel = options.uploadLabel || '上传图片';
    const description =
        options.description ||
        (prefix === 'instance'
            ? '这里维护的是当前产品的公共图片库。上传、替换、删除和排序后，当前报价单会同步最新图片快照。'
            : '每个品牌 / 产品维护独立图片库。客户页可选择展示在产品上方或下方，并切换为轮播图或纵向铺图。');

    return `
        <section class="ams-quote-block ${esc(extraClass)}">
            <div class="ams-section-head">
                <div>
                    <h3>产品图片库</h3>
                    <p>${esc(description)}</p>
                </div>
            </div>
            <div class="ams-site-field-grid ams-site-field-grid-wide">
                <div class="ams-field">
                    <label class="ams-social-toggle">
                        <input type="checkbox" data-media-config-prefix="${esc(prefix)}" data-media-config-field="enabled" ${config.enabled ? 'checked' : ''} ${editable ? '' : 'disabled'}>
                        <span>在客户页显示产品图片</span>
                    </label>
                </div>
                <div class="ams-field">
                    <label>展示位置</label>
                    <select class="ams-select" data-media-config-prefix="${esc(prefix)}" data-media-config-field="position" ${editable ? '' : 'disabled'}>
                        <option value="${MEDIA_POSITIONS.ABOVE}" ${config.position === MEDIA_POSITIONS.ABOVE ? 'selected' : ''}>产品标题下方</option>
                        <option value="${MEDIA_POSITIONS.BELOW}" ${config.position === MEDIA_POSITIONS.BELOW ? 'selected' : ''}>报价表格下方</option>
                    </select>
                </div>
                <div class="ams-field">
                    <label>展示样式</label>
                    <select class="ams-select" data-media-config-prefix="${esc(prefix)}" data-media-config-field="layout" ${editable ? '' : 'disabled'}>
                        <option value="${MEDIA_LAYOUTS.CAROUSEL}" ${config.layout === MEDIA_LAYOUTS.CAROUSEL ? 'selected' : ''}>轮播图</option>
                        <option value="${MEDIA_LAYOUTS.STACK}" ${config.layout === MEDIA_LAYOUTS.STACK ? 'selected' : ''}>纵向铺图</option>
                    </select>
                </div>
                ${
                    editable
                        ? `
                    <div class="ams-field">
                        <label>${esc(uploadLabel)}</label>
                        <label class="ams-media-upload-trigger">
                            <input class="ams-media-upload-input" type="file" accept="image/*" multiple data-media-upload="${esc(prefix)}">
                            <span><i class="fa-solid fa-image"></i> 选择图片</span>
                        </label>
                    </div>
                `
                        : ''
                }
            </div>
            <div class="ams-field-help">图片为空时客户页不会显示该图片区块；轮播图适合少量重点图，纵向铺图适合设备细节和安装示意。</div>
            ${
                gallery.length
                    ? `
                <div class="ams-media-grid">
                    ${gallery
                        .map(
                            (item, index) => `
                                <article class="ams-media-card">
                                    <div class="ams-media-thumb-wrap">
                                        <img class="ams-media-thumb" src="${esc(item.public_url)}" alt="${esc(item.title || `图片 ${index + 1}`)}" loading="lazy">
                                        <span class="ams-media-order">${index + 1}</span>
                                    </div>
                                    <div class="ams-media-card-body">
                                        <strong>${esc(item.title || `图片 ${index + 1}`)}</strong>
                                        <span>${esc(item.public_url.split('/').pop() || 'image')}</span>
                                        <div class="ams-row-actions ams-media-actions">
                                            <a class="ams-btn ams-btn-muted" href="${esc(item.public_url)}" target="_blank" rel="noopener">查看</a>
                                            ${
                                                editable
                                                    ? `
                                                <label class="ams-btn ams-btn-muted ams-media-replace-trigger">
                                                    更换
                                                    <input class="ams-media-replace-input" type="file" accept="image/*" data-media-replace="${esc(prefix)}" data-media-id="${esc(item.localId)}">
                                                </label>
                                                <button class="ams-btn ams-btn-muted" type="button" data-media-move="${esc(prefix)}" data-media-id="${esc(item.localId)}" data-direction="-1" ${index === 0 ? 'disabled' : ''}>上移</button>
                                                <button class="ams-btn ams-btn-muted" type="button" data-media-move="${esc(prefix)}" data-media-id="${esc(item.localId)}" data-direction="1" ${index === gallery.length - 1 ? 'disabled' : ''}>下移</button>
                                                <button class="ams-btn ams-btn-danger" type="button" data-media-delete="${esc(prefix)}" data-media-id="${esc(item.localId)}">删除</button>
                                            `
                                                    : ''
                                            }
                                        </div>
                                    </div>
                                </article>
                            `,
                        )
                        .join('')}
                </div>
            `
                    : '<div class="ams-empty">当前产品还没有上传图片。</div>'
            }
        </section>
    `;
}

function renderBrandList() {
    return moduleState.brands.length
        ? moduleState.brands
              .map(
                  (brand) => `
                <button class="ams-quote-list-card ${brand.id === moduleState.brandEditor.id ? 'is-active' : ''}" type="button" data-brand-edit="${esc(brand.id)}">
                    <strong>${esc(brand.display_name || brand.brand_name)}</strong>
                    <span>${esc(brand.slug)}</span>
                    <em>${brand.is_active ? '启用中' : '已停用'} · 默认链接 ${esc(brand.default_quote_slug || '--')}</em>
                </button>
            `,
              )
              .join('')
        : '<div class="ams-empty">还没有品牌数据。</div>';
}

function renderProductList() {
    const rows = filteredProducts();
    return rows.length
        ? rows
              .map(
                  (product) => `
                <button class="ams-quote-list-card ${product.id === moduleState.productEditor.id ? 'is-active' : ''}" type="button" data-product-edit="${esc(product.id)}">
                    <strong>${esc(pickLocalized(product.public_title, product.default_lang, product.slug))}</strong>
                    <span>${esc(product.slug)} · ${esc(brandLabelById(product.brand_id))}</span>
                    <em>${product.is_active ? '启用中' : '已停用'} · 有效期 ${esc(product.validity_hours)} 小时</em>
                </button>
            `,
              )
              .join('')
        : '<div class="ams-empty">当前筛选下没有产品模板。</div>';
}

function renderInstanceList() {
    const rows = filteredInstances();
    return rows.length
        ? rows
              .map(
                  (quote) => `
                <article class="ams-quote-list-card-shell ${quote.id === moduleState.instanceEditor.id ? 'is-active' : ''}">
                    <button class="ams-quote-list-card ${quote.id === moduleState.instanceEditor.id ? 'is-active' : ''}" type="button" data-instance-edit="${esc(quote.id)}">
                        <strong>${esc(quote.customer_name || productLabelById(quote.product_id) || quote.public_slug)}</strong>
                        <span>${esc(brandLabelById(quote.brand_id))} · ${esc(productLabelById(quote.product_id))}</span>
                        <span class="ams-quote-inline-submeta">${esc(customerDisplayName(quote.customer_snapshot || { company_name: quote.customer_name, contact_name: quote.receiver_name, email: quote.receiver_email }))}</span>
                        <em>${statusPill(quote.status)} <span class="ams-quote-inline-meta">${esc(quote.public_slug)}</span></em>
                    </button>
                    <div class="ams-quote-list-card-actions">
                        ${
                            quote.status === 'archived'
                                ? `<button class="ams-btn ams-btn-muted" type="button" data-instance-restore="${esc(quote.id)}">恢复</button>`
                                : `<button class="ams-btn ams-btn-danger" type="button" data-instance-archive="${esc(quote.id)}">归档</button>`
                        }
                    </div>
                </article>
            `,
              )
              .join('')
        : '<div class="ams-empty">当前筛选下没有报价单。</div>';
}

function renderCustomerList() {
    const rows = filteredCustomers();
    return rows.length
        ? rows
              .map((customer) => {
                  const quoteSummary = summarizeCustomerQuotes(customer.id);
                  return `
                    <article class="ams-customer-list-card-shell">
                        <button class="ams-quote-list-card ${moduleState.customerLoadedId === customer.id ? 'active' : ''}" type="button" data-customer-edit="${esc(customer.id)}">
                            <strong>${esc(customerDisplayName(customer))}</strong>
                            <span>${esc(text(customer.contact_name || customer.email || customer.phone, '未填写联系人'))}</span>
                            <span class="ams-quote-inline-submeta">${esc(text(customer.email || customer.phone || customer.country, '未填写联系信息'))}</span>
                            <em>${quoteSummary.total_quotes} 份报价单 <span class="ams-quote-inline-meta">${quoteSummary.published_quotes} 已发布 / ${quoteSummary.archived_quotes} 已归档</span></em>
                        </button>
                    </article>
                `;
              })
              .join('')
        : '<div class="ams-empty">当前没有客户档案。</div>';
}

function customerQuoteListMarkup(customerId = '') {
    const rows = customerQuotes(customerId);
    return rows.length
        ? rows
              .map((quote) => `
                    <article class="ams-customer-quote-row">
                        <div class="ams-customer-quote-copy">
                            <strong>${esc(quote.customer_name || productLabelById(quote.product_id) || quote.public_slug)}</strong>
                            <span>${esc(brandLabelById(quote.brand_id))} · ${esc(productLabelById(quote.product_id))}</span>
                            <span class="ams-quote-inline-submeta">${statusPill(quote.status)} <span class="ams-quote-inline-meta">${esc(quote.public_slug)}</span></span>
                        </div>
                        <div class="ams-customer-quote-meta">
                            <time>${esc(fmtDate(quote.updated_at))}</time>
                            <div class="ams-row-actions">
                                <button class="ams-btn ams-btn-muted" type="button" data-customer-quote-preview="${esc(quote.id)}">后台预览</button>
                                ${quote.status === 'published'
                                    ? `<button class="ams-btn ams-btn-warning" type="button" data-customer-quote-public="${esc(quote.public_slug)}">客户页</button>`
                                    : ''}
                            </div>
                        </div>
                    </article>
                `)
              .join('')
        : '<div class="ams-empty">这个客户还没有关联报价单。</div>';
}

function customerInsightsMarkup() {
    const customerId = text(moduleState.customerLoadedId || moduleState.customerEditor?.id);
    if (!customerId) return '<div class="ams-empty">先创建客户档案，或从左侧选择一个已有关联记录的客户。</div>';
    const summary = summarizeCustomerActivity(customerId, moduleState.customerEvents);
    const sendHistory = customerShareHistory(customerId);
    const sendLedgerNote = sendLedgerModeMarkup();
    const timeline = moduleState.customerEvents.length
        ? moduleState.customerEvents
              .map((event) => {
                  const quote = moduleState.instances.find((item) => item.id === event.instance_id);
                  const quoteLabel = quote
                      ? `${brandLabelById(quote.brand_id)} · ${productLabelById(quote.product_id)} · ${text(quote.public_slug, quote.id)}`
                      : text(event.instance_id);
                  const recipientLine = eventRecipientSummary(event);
                  return `
                    <article class="ams-quote-event-row">
                        <div class="ams-quote-event-copy">
                            <strong>${esc(eventTypeLabel(event.event_type))}</strong>
                            <span>${esc(accessModeLabel(event.access_mode))} · ${esc(text(event.viewer_email || event.viewer_label, '匿名访问'))}</span>
                            <span class="ams-quote-inline-submeta">${esc(quoteLabel)}</span>
                            ${recipientLine ? `<span class="ams-quote-inline-submeta">${esc(recipientLine)}</span>` : ''}
                        </div>
                        <time>${esc(fmtDate(event.created_at))}</time>
                    </article>
                `;
              })
              .join('')
        : '<div class="ams-empty">这个客户还没有浏览或分享事件。</div>';

    return `
        <section class="ams-quote-block">
            <div class="ams-section-head">
                <div>
                    <h3>客户洞察</h3>
                    <p>按客户聚合这名客户关联的全部报价单、分享行为和浏览事件。</p>
                </div>
            </div>
            <div class="ams-summary-row">
                <span class="ams-summary-chip"><strong>关联报价单</strong><span>${esc(summary.total_quotes)}</span></span>
                <span class="ams-summary-chip"><strong>草稿</strong><span>${esc(summary.draft_quotes)}</span></span>
                <span class="ams-summary-chip"><strong>已发布</strong><span>${esc(summary.published_quotes)}</span></span>
                <span class="ams-summary-chip"><strong>已归档</strong><span>${esc(summary.archived_quotes)}</span></span>
                <span class="ams-summary-chip"><strong>总浏览</strong><span>${esc(summary.total_views)}</span></span>
                <span class="ams-summary-chip"><strong>分享访问</strong><span>${esc(summary.share_views)}</span></span>
                <span class="ams-summary-chip"><strong>登录浏览</strong><span>${esc(summary.logged_in_views)}</span></span>
                <span class="ams-summary-chip"><strong>匿名浏览</strong><span>${esc(summary.anonymous_views)}</span></span>
                <span class="ams-summary-chip"><strong>分享次数</strong><span>${esc(summary.share_links)}</span></span>
                <span class="ams-summary-chip"><strong>邮件触发</strong><span>${esc(summary.email_clicks)}</span></span>
                <span class="ams-summary-chip"><strong>发送台账</strong><span>${esc(sendHistory.length)}</span></span>
                <span class="ams-summary-chip"><strong>最近浏览</strong><span>${esc(fmtDate(summary.last_viewed_at))}</span></span>
                <span class="ams-summary-chip"><strong>最近报价更新</strong><span>${esc(fmtDate(summary.last_quote_updated_at))}</span></span>
            </div>
            <div class="ams-quote-block">
                <div class="ams-section-head"><div><h3>关联报价单</h3><p>这里列出这名客户当前关联的全部报价单实例。</p></div></div>
                <div class="ams-customer-quote-list">${customerQuoteListMarkup(customerId)}</div>
            </div>
            <div class="ams-quote-block">
                <div class="ams-section-head"><div><h3>发送台账</h3><p>这里聚合这名客户全部报价单上的分享链接生成和邮件触发记录。</p></div></div>
                ${sendLedgerNote}
                <div class="ams-quote-event-timeline">${renderShareHistoryList(sendHistory, { includeQuoteMeta: true })}</div>
            </div>
            <div class="ams-quote-block">
                <div class="ams-section-head"><div><h3>最近事件</h3><p>已登录用户会记录邮箱，匿名访问则降级为匿名标签。</p></div></div>
                <div class="ams-quote-event-timeline">${timeline}</div>
            </div>
        </section>
    `;
}

function instanceInsightsMarkup() {
    if (!moduleState.instanceEditor?.id) return '';
    const summary = moduleState.instanceEventSummary || emptyInstanceEventSummary();
    const currentCustomer = moduleState.instanceEditor.customer_id
        ? moduleState.customers.find((item) => item.id === moduleState.instanceEditor.customer_id)
        : null;
    const sendHistory = instanceShareHistory();
    const shareSummary = shareConfigSummary(moduleState.instanceEditor.share_config, { sendCount: sendHistory.length });
    const sendLedgerNote = sendLedgerModeMarkup();
    const timeline = moduleState.instanceEvents.length
        ? moduleState.instanceEvents
              .map(
                  (event) => {
                      const recipientLine = eventRecipientSummary(event);
                      return `
                    <article class="ams-quote-event-row">
                        <div class="ams-quote-event-copy">
                            <strong>${esc(eventTypeLabel(event.event_type))}</strong>
                            <span>${esc(accessModeLabel(event.access_mode))} · ${esc(text(event.viewer_email || event.viewer_label, '匿名访问'))}</span>
                            ${recipientLine ? `<span class="ams-quote-inline-submeta">${esc(recipientLine)}</span>` : ''}
                        </div>
                        <time>${esc(fmtDate(event.created_at))}</time>
                    </article>
                `;
                  },
              )
              .join('')
        : '<div class="ams-empty">还没有访问记录。</div>';
    return `
        <section class="ams-quote-block">
            <div class="ams-section-head">
                <div>
                    <h3>客户关系与访问洞察</h3>
                    <p>这里会显示报价单绑定的客户档案，以及分享、浏览、后台预览的事件流水。</p>
                </div>
            </div>
            <div class="ams-summary-row">
                <span class="ams-summary-chip"><strong>客户档案</strong><span>${esc(customerDisplayName(currentCustomer || buildInstanceCustomerSnapshot(moduleState.instanceEditor)))}</span></span>
                <span class="ams-summary-chip"><strong>分享联系人</strong><span>${esc(shareSummary.recipient)}</span></span>
                <span class="ams-summary-chip"><strong>负责跟进</strong><span>${esc(shareSummary.owner)}</span></span>
                <span class="ams-summary-chip"><strong>发送台账</strong><span>${esc(shareSummary.send_count)}</span></span>
                <span class="ams-summary-chip"><strong>总浏览</strong><span>${esc(summary.total_views)}</span></span>
                <span class="ams-summary-chip"><strong>分享访问</strong><span>${esc(summary.share_views)}</span></span>
                <span class="ams-summary-chip"><strong>后台预览</strong><span>${esc(summary.admin_views)}</span></span>
                <span class="ams-summary-chip"><strong>分享次数</strong><span>${esc(summary.share_links)}</span></span>
                <span class="ams-summary-chip"><strong>邮件触发</strong><span>${esc(summary.email_clicks)}</span></span>
                <span class="ams-summary-chip"><strong>最近分享</strong><span>${esc(fmtDate(summary.last_shared_at))}</span></span>
                <span class="ams-summary-chip"><strong>最近浏览</strong><span>${esc(fmtDate(summary.last_viewed_at))}</span></span>
            </div>
            <div class="ams-quote-block">
                <div class="ams-section-head"><div><h3>发送台账</h3><p>记录管理员生成分享链接或触发邮件发送时的收件人、负责人和备注快照。</p></div></div>
                ${sendLedgerNote}
                <div class="ams-quote-event-timeline">${renderShareHistoryList(sendHistory, { editable: true })}</div>
            </div>
            <div class="ams-quote-event-timeline">${timeline}</div>
        </section>
    `;
}

function bindBrandEditor(input) {
    const content = document.getElementById('ams-content');
    if (!content) return;
    const displayNameField = () => content.querySelector('[data-brand-field="display_name"]');
    const defaultLinkField = () => content.querySelector('[data-brand-field="default_quote_slug"]');
    const syncDisplayNameFromBrandName = (value) => {
        moduleState.brandEditor.display_name = text(value);
        const displayNode = displayNameField();
        if (displayNode && displayNode.value !== moduleState.brandEditor.display_name) {
            displayNode.value = moduleState.brandEditor.display_name;
        }
    };
    const syncDefaultLinkField = (force = false) => {
        if (moduleState.brandDefaultLinkTouched && !force) return;
        const candidate = latestPublishedQuoteSlugForBrand(moduleState.brandEditor.id);
        if (!candidate && !force) return;
        moduleState.brandEditor.default_quote_slug = candidate;
        const defaultNode = defaultLinkField();
        if (defaultNode && defaultNode.value !== moduleState.brandEditor.default_quote_slug) {
            defaultNode.value = moduleState.brandEditor.default_quote_slug;
        }
    };

    syncDefaultLinkField(false);

    content.querySelectorAll('[data-brand-field]').forEach((node) => {
        node.addEventListener('input', () => {
            const field = node.dataset.brandField;
            if (!field) return;
            const nextValue = node.type === 'checkbox' ? Boolean(node.checked) : node.value;
            if (field === 'brand_name') {
                moduleState.brandEditor[field] = nextValue;
                if (!moduleState.brandDisplayNameTouched) {
                    syncDisplayNameFromBrandName(nextValue);
                }
                return;
            }
            moduleState.brandEditor[field] = nextValue;
            if (field === 'display_name') {
                moduleState.brandDisplayNameTouched = text(nextValue) !== text(moduleState.brandEditor.brand_name);
            } else if (field === 'default_quote_slug') {
                moduleState.brandDefaultLinkTouched = true;
            }
        });
        if (node.type === 'checkbox') {
            node.addEventListener('change', () => {
                const field = node.dataset.brandField;
                if (!field) return;
                moduleState.brandEditor[field] = Boolean(node.checked);
            });
        }
    });

    content.querySelectorAll('[data-i18n-prefix^="brand:"]').forEach((node) => {
        node.addEventListener('input', () => {
            const [, key] = String(node.dataset.i18nPrefix || '').split(':');
            const lang = node.dataset.lang;
            if (!key || !lang) return;
            upsertLocalizedField(moduleState.brandEditor, key, lang, node.value);
        });
    });

    document.getElementById('ams-quote-brand-new')?.addEventListener('click', () => {
        moduleState.brandEditor = createBrandDraft();
        moduleState.brandDisplayNameTouched = false;
        moduleState.brandDefaultLinkTouched = false;
        void renderQuoteBrandsPage(input);
    });

    document.querySelectorAll('[data-brand-edit]').forEach((button) => {
        button.addEventListener('click', () => {
            const brandId = button.dataset.brandEdit;
            const brand = moduleState.brands.find((item) => item.id === brandId);
            if (!brand) return;
            moduleState.brandEditor = createBrandDraft(brand);
            moduleState.brandDisplayNameTouched = false;
            moduleState.brandDefaultLinkTouched = false;
            void renderQuoteBrandsPage(input);
        });
    });

    document.getElementById('ams-brand-default-link-autofill')?.addEventListener('click', () => {
        moduleState.brandDefaultLinkTouched = false;
        syncDefaultLinkField(true);
    });

    document.getElementById('ams-quote-brand-save')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '保存中...', async () => {
            try {
                await saveBrandDraft(input.user, moduleState.brandEditor);
                moduleState.brandDisplayNameTouched = false;
                moduleState.brandDefaultLinkTouched = false;
                input.showToast('品牌已保存。');
                await renderQuoteBrandsPage(input);
            } catch (error) {
                input.showToast(error.message || '保存品牌失败。', true);
            }
        });
    });

    document.getElementById('ams-quote-import-legacy')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '导入中...', async () => {
            try {
                await importLegacySeedData(input.user);
                input.showToast('VMAN / MinerPower 示例模板已导入。');
                await renderQuoteBrandsPage(input);
            } catch (error) {
                input.showToast(error.message || '导入示例模板失败。', true);
            }
        });
    });
}

export async function renderQuoteBrandsPage(input) {
    try {
        await ensureBaseData();
    } catch (error) {
        if (isQuoteSetupMissing(error)) {
            renderQuoteSetupRequired(input, error);
            return;
        }
        throw error;
    }
    input.setPageHeader('报价系统 / 品牌管理', '维护报价品牌、供应商信息、统一页头页脚和默认对外入口。');
    input.setContent(`
        <section class="ams-card ams-hero-card ams-hero-card-compact">
            <div class="ams-hero-copy">
                <p class="ams-eyebrow">Quote System</p>
                <h2>先维护品牌，再维护产品模板和客户报价单。</h2>
                <p class="ams-hero-text">这里定义品牌名、供应商、发件邮箱、主题色、公共标题和默认品牌入口。首批可一键导入 VMAN / MinerPower 示例数据。</p>
            </div>
            <div class="ams-quick-actions">
                <button class="ams-quick-link" type="button" id="ams-quote-import-legacy">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-file-import"></i></div>
                    <div class="ams-quick-link-body"><strong>导入示例模板</strong><span>把现有 VMAN / MinerPower 数据导入成品牌、产品和演示报价单。</span></div>
                </button>
                <button class="ams-quick-link" type="button" id="ams-quote-brand-new">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-plus"></i></div>
                    <div class="ams-quick-link-body"><strong>新建品牌</strong><span>创建新的报价品牌，为后续产品模板和报价单做承载。</span></div>
                </button>
            </div>
        </section>
        <section class="ams-quote-layout">
            <aside class="ams-card ams-quote-list-panel">
                <div class="ams-section-head"><div><h3>品牌列表</h3><p>共 ${moduleState.brands.length} 个品牌</p></div></div>
                <div class="ams-quote-list">${renderBrandList()}</div>
            </aside>
            <section class="ams-card ams-quote-editor-panel ams-brand-editor-panel">
                <div class="ams-section-head">
                    <div>
                        <h3>${moduleState.brandEditor.id ? '编辑品牌' : '新建品牌'}</h3>
                        <p>品牌是产品模板和报价单的最上层容器。</p>
                    </div>
                    <div class="ams-row-actions"><button class="ams-btn ams-btn-primary" type="button" id="ams-quote-brand-save">保存品牌</button></div>
                </div>
                <div class="ams-site-field-grid ams-site-field-grid-wide">
                    <div class="ams-field"><label>品牌 slug</label><input class="ams-input" data-brand-field="slug" value="${esc(moduleState.brandEditor.slug)}" placeholder="vman"></div>
                    <div class="ams-field"><label>品牌简称</label><input class="ams-input" data-brand-field="brand_name" value="${esc(moduleState.brandEditor.brand_name)}" placeholder="VMAN"></div>
                    <div class="ams-field"><label>品牌显示名</label><input class="ams-input" data-brand-field="display_name" value="${esc(moduleState.brandEditor.display_name)}" placeholder="VMAN Engineering"></div>
                    <div class="ams-field"><label>供应商</label><input class="ams-input" data-brand-field="supplier_name" value="${esc(moduleState.brandEditor.supplier_name)}" placeholder="VMAN Engineering"></div>
                    <div class="ams-field"><label>发件邮箱</label><input class="ams-input" data-brand-field="sender_email" value="${esc(moduleState.brandEditor.sender_email)}" placeholder="sales@brand.com"></div>
                    <div class="ams-field"><label>邮件主题署名</label><input class="ams-input" data-brand-field="subject_name" value="${esc(moduleState.brandEditor.subject_name)}" placeholder="VMAN Engineering"></div>
                    <div class="ams-field"><label>主题绿</label><input class="ams-input" data-brand-field="theme_primary" value="${esc(moduleState.brandEditor.theme_primary)}" placeholder="#5DD62C"></div>
                    <div class="ams-field"><label>深绿底</label><input class="ams-input" data-brand-field="theme_dark" value="${esc(moduleState.brandEditor.theme_dark)}" placeholder="#337418"></div>
                    <div class="ams-field"><label>分享签名密钥</label><input class="ams-input" data-brand-field="share_signing_secret" value="${esc(moduleState.brandEditor.share_signing_secret)}"></div>
                    <div class="ams-field"><label>分享本地前缀</label><input class="ams-input" data-brand-field="share_unlock_prefix" value="${esc(moduleState.brandEditor.share_unlock_prefix)}"></div>
                    <div class="ams-field"><label class="ams-social-toggle"><input type="checkbox" data-brand-field="is_active" ${moduleState.brandEditor.is_active ? 'checked' : ''}><span>启用品牌</span></label></div>
                </div>
                <div class="ams-quote-block ams-brand-default-link-panel">
                    <div class="ams-section-head">
                        <div>
                            <h3>默认链接</h3>
                            <p>左侧绿色“默认链接”显示这里。会优先带入该品牌最近已发布报价单的 slug，你也可以手动自定义。</p>
                        </div>
                        <div class="ams-row-actions"><button class="ams-btn ams-btn-muted" type="button" id="ams-brand-default-link-autofill">自动带入已发布报价</button></div>
                    </div>
                    <div class="ams-brand-default-link-row">
                        <div class="ams-field">
                            <label>默认链接 slug</label>
                            <input class="ams-input" data-brand-field="default_quote_slug" value="${esc(moduleState.brandEditor.default_quote_slug || latestPublishedQuoteSlugForBrand(moduleState.brandEditor.id))}" placeholder="vman-p1200gf-demo">
                        </div>
                        <div class="ams-brand-default-link-meta">
                            <strong>当前显示</strong>
                            <span>${esc(moduleState.brandEditor.default_quote_slug || latestPublishedQuoteSlugForBrand(moduleState.brandEditor.id) || '--')}</span>
                        </div>
                    </div>
                </div>
                ${localizedFieldGroup('brand:overview_title', '页面总标题', moduleState.brandEditor.overview_title)}
                ${localizedFieldGroup('brand:footer_note', '页脚说明', moduleState.brandEditor.footer_note)}
            </section>
        </section>
    `);
    bindBrandEditor(input);
}

function bindProductEditor(input) {
    const content = document.getElementById('ams-content');
    if (!content) return;

    document.getElementById('ams-open-product-visual-editor')?.addEventListener('click', () => {
        if (!moduleState.productEditor?.id) {
            input.showToast('请先保存模板，再打开真实模板页。', true);
            return;
        }
        window.open(quoteEditorUrl('product', moduleState.productEditor.id), '_blank', 'noopener');
    });

    document.getElementById('ams-quote-product-brand-filter')?.addEventListener('change', (event) => {
        moduleState.productBrandFilter = event.currentTarget.value || 'all';
        void withQuoteBusy('正在刷新模板列表...', async () => {
            await renderQuoteProductsPage(input);
        });
    });

    document.getElementById('ams-quote-product-new')?.addEventListener('click', () => {
        moduleState.productLoadedId = '';
        moduleState.productEditor = createProductDraft({
            brand_id: moduleState.productBrandFilter !== 'all' ? moduleState.productBrandFilter : '',
        });
        syncProductBrandDraft(moduleState.productEditor.brand_id);
        void renderQuoteProductsPage(input);
    });

    document.getElementById('ams-quote-product-load-base-template')?.addEventListener('click', () => {
        try {
            const templateKey = document.getElementById('ams-quote-product-base-template')?.value || '';
            if (!templateKey) throw new Error('请先选择一个基础模板。');
            applyBaseTemplateToProductEditor(templateKey);
            input.showToast('基础模板已载入当前编辑区。');
            void renderQuoteProductsPage(input);
        } catch (error) {
            input.showToast(error.message || '载入基础模板失败。', true);
        }
    });

    document.querySelectorAll('[data-product-edit]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await withQuoteBusy('正在加载产品模板...', async () => {
                    await fetchProductEditor(button.dataset.productEdit);
                    await renderQuoteProductsPage(input);
                }, button, '正在读取模板详情、配置项和图片库。');
            } catch (error) {
                input.showToast(error.message || '加载产品模板失败。', true);
            }
        });
    });

    content.querySelectorAll('[data-product-field]').forEach((node) => {
        node.addEventListener('input', () => {
            const field = node.dataset.productField;
            if (!field) return;
            moduleState.productEditor[field] = node.type === 'checkbox' ? Boolean(node.checked) : node.value;
        });
        if (node.type === 'checkbox' || node.tagName === 'SELECT') {
            node.addEventListener('change', () => {
                const field = node.dataset.productField;
                if (!field) return;
                moduleState.productEditor[field] = node.type === 'checkbox' ? Boolean(node.checked) : node.value;
                if (field === 'brand_id') {
                    syncProductBrandDraft(moduleState.productEditor.brand_id);
                    void withQuoteBusy('正在切换品牌配置...', async () => {
                        await renderQuoteProductsPage(input);
                    });
                }
            });
        }
    });

    content.querySelectorAll('[data-product-brand-field]').forEach((node) => {
        node.addEventListener('input', () => {
            const field = node.dataset.productBrandField;
            if (!field) return;
            currentProductBrandDraft()[field] = node.value;
        });
    });

    content.querySelectorAll('[data-product-brand-i18n]').forEach((node) => {
        node.addEventListener('input', () => {
            const field = node.dataset.productBrandI18n;
            const lang = node.dataset.lang;
            if (!field || !lang) return;
            upsertLocalizedField(currentProductBrandDraft(), field, lang, node.value);
        });
    });

    content.querySelectorAll('[data-i18n-prefix="product:public_title"]').forEach((node) => {
        node.addEventListener('input', () => {
            const lang = node.dataset.lang;
            if (!lang) return;
            upsertLocalizedField(moduleState.productEditor, 'public_title', lang, node.value);
        });
    });

    content.querySelectorAll('[data-ui-text-prefix="product"]').forEach((node) => {
        const apply = () => {
            const key = node.dataset.uiTextKey;
            const lang = node.dataset.lang;
            if (!key || !lang) return;
            moduleState.productEditor.ui_text = normalizeProductUiText(moduleState.productEditor.ui_text);
            moduleState.productEditor.ui_text[key][lang] = node.value;
        };
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
    });

    content.querySelectorAll('[data-media-config-prefix="product"]').forEach((node) => {
        const apply = () => {
            const field = node.dataset.mediaConfigField;
            if (!field) return;
            const current = normalizeMediaConfig(moduleState.productEditor.media_config);
            current[field] = node.type === 'checkbox' ? Boolean(node.checked) : node.value;
            moduleState.productEditor.media_config = normalizeMediaConfig(current);
        };
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
    });

    content.querySelectorAll('[data-media-upload="product"]').forEach((node) => {
        node.addEventListener('change', async () => {
            const files = Array.from(node.files || []);
            node.value = '';
            if (!files.length) return;
            try {
                const productContext = {
                    ...moduleState.productEditor,
                    brand_slug: brandSlugById(moduleState.productEditor.brand_id),
                };
                const gallery = await uploadProductMediaFiles(productContext, files);
                const mediaConfig = await syncProductMediaState(
                    moduleState.productEditor.id,
                    moduleState.productEditor.media_config,
                    gallery,
                    input.user?.id || null,
                );
                syncProductMediaToEditors(moduleState.productEditor.id, gallery, mediaConfig);
                input.showToast(`已上传 ${gallery.length} 张产品图片。`);
                await renderQuoteProductsPage(input);
            } catch (error) {
                input.showToast(error.message || '上传产品图片失败。', true);
            }
        });
    });

    content.querySelectorAll('[data-rate-prefix="product"]').forEach((node) => {
        node.addEventListener('input', () => {
            const code = node.dataset.rateCode;
            if (!code) return;
            moduleState.productEditor.default_rates = normalizeRates({
                ...(moduleState.productEditor.default_rates || DEFAULT_RATES),
                [code]: safeNumber(node.value, DEFAULT_RATES[code]),
            });
        });
    });

    content.querySelectorAll('[data-section-prefix="product"]').forEach((node) => {
        const apply = () => {
            updateSectionField(moduleState.productEditor, node.dataset.sectionKey, node.dataset.sectionField, node.value);
        };
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
    });

    content.querySelectorAll('[data-i18n-prefix^="product:title:"]').forEach((node) => {
        node.addEventListener('input', () => {
            const parts = String(node.dataset.i18nPrefix || '').split(':');
            const sectionKey = parts[2];
            const lang = node.dataset.lang;
            if (!sectionKey || !lang) return;
            const section = normalizeSectionConfig(moduleState.productEditor.section_config).find((entry) => entry.key === sectionKey);
            if (!section) return;
            section.title[lang] = node.value;
            updateSectionField(moduleState.productEditor, sectionKey, 'title', section.title);
        });
    });

    content.querySelectorAll('[data-item-prefix="product"][data-item-field]').forEach((node) => {
        const apply = () => {
            const field = node.dataset.itemField;
            const itemId = node.dataset.itemId;
            if (!field || !itemId) return;
            const value = node.type === 'checkbox' ? Boolean(node.checked) : node.value;
            moduleState.productEditor.items = updateItemField(moduleState.productEditor.items, itemId, field, value);
        };
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
    });

    content.querySelectorAll('[data-item-prefix="product"][data-item-lang]').forEach((node) => {
        node.addEventListener('input', () => {
            const itemId = node.dataset.itemId;
            const lang = node.dataset.itemLang;
            if (!itemId || !lang) return;
            moduleState.productEditor.items = updateItemLocalizedField(moduleState.productEditor.items, itemId, lang, node.value);
        });
    });

    document.querySelectorAll('[data-item-add="product"]').forEach((button) => {
        button.addEventListener('click', () => {
            const sectionKey = button.dataset.sectionKey;
            moduleState.productEditor.items = [
                ...moduleState.productEditor.items,
                {
                    ...createQuoteItem(sectionKey),
                    sort_order: (moduleState.productEditor.items.length + 1) * 10,
                },
            ];
            void renderQuoteProductsPage(input);
        });
    });

    document.querySelectorAll('[data-item-delete="product"]').forEach((button) => {
        button.addEventListener('click', () => {
            const itemId = button.dataset.itemId;
            moduleState.productEditor.items = moduleState.productEditor.items.filter((item) => item.localId !== itemId);
            void renderQuoteProductsPage(input);
        });
    });

    document.querySelectorAll('[data-item-move="product"]').forEach((button) => {
        button.addEventListener('click', () => {
            const itemId = button.dataset.itemId;
            const direction = safeNumber(button.dataset.direction, 0);
            moduleState.productEditor.items = rowMove(moduleState.productEditor.items, itemId, direction);
            void renderQuoteProductsPage(input);
        });
    });

    document.querySelectorAll('[data-media-move="product"]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                const mediaId = button.dataset.mediaId;
                const direction = safeNumber(button.dataset.direction, 0);
                const nextGallery = mediaMove(moduleState.productEditor.media_gallery, mediaId, direction);
                const savedGallery = await saveProductMediaCollection(moduleState.productEditor.id, nextGallery);
                const mediaConfig = await syncProductMediaState(
                    moduleState.productEditor.id,
                    moduleState.productEditor.media_config,
                    savedGallery,
                    input.user?.id || null,
                );
                syncProductMediaToEditors(moduleState.productEditor.id, savedGallery, mediaConfig);
                await renderQuoteProductsPage(input);
            } catch (error) {
                input.showToast(error.message || '调整图片顺序失败。', true);
            }
        });
    });

    document.querySelectorAll('[data-media-delete="product"]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                const mediaId = button.dataset.mediaId;
                const mediaItem = normalizeMediaGallery(moduleState.productEditor.media_gallery).find((item) => item.localId === mediaId);
                if (!mediaItem) return;
                const savedGallery = await deleteProductMediaItem(moduleState.productEditor.id, moduleState.productEditor.media_gallery, mediaItem);
                const mediaConfig = await syncProductMediaState(
                    moduleState.productEditor.id,
                    moduleState.productEditor.media_config,
                    savedGallery,
                    input.user?.id || null,
                );
                syncProductMediaToEditors(moduleState.productEditor.id, savedGallery, mediaConfig);
                input.showToast('产品图片已删除。');
                await renderQuoteProductsPage(input);
            } catch (error) {
                input.showToast(error.message || '删除产品图片失败。', true);
            }
        });
    });

    content.querySelectorAll('[data-media-replace="product"]').forEach((node) => {
        node.addEventListener('change', async () => {
            const files = Array.from(node.files || []);
            node.value = '';
            if (!files.length) return;
            try {
                const mediaId = node.dataset.mediaId;
                const mediaItem = normalizeMediaGallery(moduleState.productEditor.media_gallery).find((item) => item.localId === mediaId);
                if (!mediaItem) return;
                const productContext = {
                    ...moduleState.productEditor,
                    brand_slug: brandSlugById(moduleState.productEditor.brand_id),
                };
                const savedGallery = await replaceProductMediaFile(productContext, moduleState.productEditor.media_gallery, mediaItem, files[0]);
                const mediaConfig = await syncProductMediaState(
                    moduleState.productEditor.id,
                    moduleState.productEditor.media_config,
                    savedGallery,
                    input.user?.id || null,
                );
                syncProductMediaToEditors(moduleState.productEditor.id, savedGallery, mediaConfig);
                input.showToast('产品图片已更换。');
                await renderQuoteProductsPage(input);
            } catch (error) {
                input.showToast(error.message || '更换产品图片失败。', true);
            }
        });
    });

    document.getElementById('ams-quote-product-save')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '保存中...', async () => {
            try {
                await saveProductDraft(input.user, moduleState.productEditor);
                input.showToast('产品模板已保存。');
                await renderQuoteProductsPage(input);
            } catch (error) {
                input.showToast(error.message || '保存产品模板失败。', true);
            }
        });
    });

    document.getElementById('ams-quote-product-create-instance')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '生成中...', async () => {
            try {
                const instance = await createInstanceFromProduct(input.user, moduleState.productEditor.id);
                input.showToast('已从模板生成新的报价单草稿。');
                await fetchInstanceEditor(instance.id);
                await renderQuoteInstancesPage(input);
            } catch (error) {
                input.showToast(error.message || '从模板生成报价单失败。', true);
            }
        });
    });
}

export async function renderQuoteProductsPage(input) {
    try {
        await ensureBaseData();
        await ensureBaseTemplates();
    } catch (error) {
        if (isQuoteSetupMissing(error)) {
            renderQuoteSetupRequired(input, error);
            return;
        }
        throw error;
    }
    if (!moduleState.productEditor.brand_id && moduleState.brands[0]?.id) {
        moduleState.productEditor.brand_id = moduleState.brands[0].id;
    }
    currentProductBrandDraft();
    input.setPageHeader('报价系统 / 产品模板', '在品牌下维护标准产品模板，定义主配置、选配、默认汇率和有效期。');
    input.setContent(`
        <section class="ams-card ams-hero-card ams-hero-card-compact ams-quote-product-hero">
            <div class="ams-hero-copy">
                <p class="ams-eyebrow">Product Templates</p>
                <h2>当前基础模板只认 VMAN 和 MinerPower 两套。</h2>
                <p class="ams-hero-text">先从这两套真实模板载入一份基础版本，再复制到具体品牌 / 产品上维护。现在这一步先解决模板来源，不再让你从空白模板开始。</p>
            </div>
            <div class="ams-quick-actions ams-quote-product-quick-actions">
                <button class="ams-quick-link" type="button" id="ams-quote-product-new">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-cube"></i></div>
                    <div class="ams-quick-link-body"><strong>空白模板</strong><span>仅在你明确要从零搭建时使用；正常请优先载入下面的基础模板。</span></div>
                </button>
                <div class="ams-quick-link ams-quote-template-loader">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-layer-group"></i></div>
                    <div class="ams-quick-link-body">
                        <strong>公共模板区</strong>
                        <span>新品牌先从 VMAN 独立发电模板或 MinerPower 一体化模板复制一份，再在当前品牌下 DIY。</span>
                        <div class="ams-quote-template-family-list">
                            ${moduleState.baseTemplates.map((group) => `
                                <div class="ams-quote-template-family-chip">
                                    <strong>${esc(group.label)}</strong>
                                    <span>${esc(group.hint || '')}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="ams-inline-actions ams-quote-template-loader-actions">
                            <select id="ams-quote-product-base-template" class="ams-select ams-quote-template-select">
                                ${baseTemplateOptionsMarkup()}
                            </select>
                            <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-product-load-base-template">复制到当前品牌编辑区</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="ams-quote-layout">
            <aside class="ams-card ams-quote-list-panel">
                <div class="ams-section-head">
                    <div><h3>模板列表</h3><p>品牌筛选后共 ${filteredProducts().length} 个模板</p></div>
                </div>
                <div class="ams-field">
                    <label>品牌筛选</label>
                    <select id="ams-quote-product-brand-filter" class="ams-select">
                        <option value="all" ${moduleState.productBrandFilter === 'all' ? 'selected' : ''}>全部品牌</option>
                        ${moduleState.brands.map((brand) => `<option value="${esc(brand.id)}" ${moduleState.productBrandFilter === brand.id ? 'selected' : ''}>${esc(brand.display_name)}</option>`).join('')}
                    </select>
                </div>
                <div class="ams-quote-list">${renderProductList()}</div>
            </aside>
            <section class="ams-card ams-quote-editor-panel ams-product-editor-panel">
                <div class="ams-section-head">
                    <div>
                        <h3>${moduleState.productEditor.id ? '编辑产品模板' : '新建产品模板'}</h3>
                        <p>模板只做默认值来源，不直接给客户使用。</p>
                    </div>
                    <div class="ams-row-actions">
                        <button class="ams-btn ams-btn-warning" type="button" id="ams-open-product-visual-editor" ${moduleState.productEditor.id ? '' : 'disabled'}>打开真实模板页</button>
                        <button class="ams-btn ams-btn-muted" type="button" id="ams-quote-product-create-instance">从模板生成报价单</button>
                        <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-product-save">保存模板</button>
                    </div>
                </div>
                <div class="ams-direct-entry-banner">
                    <strong>真实模板页入口</strong>
                    <span>${moduleState.productEditor.id ? '点击上面的“打开真实模板页”，会进入原报价模板页面本体进行编辑。' : '先保存或选择一个已存在模板，再打开真实模板页。'}</span>
                </div>
                <div class="ams-site-field-grid ams-site-field-grid-wide">
                    <div class="ams-field">
                        <label>所属品牌</label>
                        <select class="ams-select" data-product-field="brand_id">
                            <option value="">请选择品牌</option>
                            ${moduleState.brands.map((brand) => `<option value="${esc(brand.id)}" ${moduleState.productEditor.brand_id === brand.id ? 'selected' : ''}>${esc(brand.display_name)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="ams-field"><label>模板 slug</label><input class="ams-input" data-product-field="slug" value="${esc(moduleState.productEditor.slug)}" placeholder="p1200gf"></div>
                    <div class="ams-field"><label>产品代码</label><input class="ams-input" data-product-field="product_code" value="${esc(moduleState.productEditor.product_code)}" placeholder="P1200GF"></div>
                    <div class="ams-field">
                        <label>默认语言</label>
                        <select class="ams-select" data-product-field="default_lang">
                            ${SUPPORTED_LANGS.map((lang) => `<option value="${lang}" ${moduleState.productEditor.default_lang === lang ? 'selected' : ''}>${lang.toUpperCase()}</option>`).join('')}
                        </select>
                    </div>
                    <div class="ams-field"><label>有效期（小时）</label><input class="ams-input" type="number" min="1" step="1" data-product-field="validity_hours" value="${esc(moduleState.productEditor.validity_hours)}"></div>
                    <div class="ams-field"><label>排序</label><input class="ams-input" type="number" min="0" step="10" data-product-field="sort_order" value="${esc(moduleState.productEditor.sort_order)}"></div>
                    <div class="ams-field"><label class="ams-social-toggle"><input type="checkbox" data-product-field="is_active" ${moduleState.productEditor.is_active ? 'checked' : ''}><span>启用模板</span></label></div>
                </div>
                ${productVisualEditorMarkup(moduleState.productEditor, currentProductBrandDraft())}
                ${mediaLibraryMarkup('product', moduleState.productEditor.media_config, moduleState.productEditor.media_gallery, {
                    uploadLabel: '上传产品图片',
                })}
            </section>
        </section>
    `);
    bindProductEditor(input);
}

function bindInstanceEditor(input) {
    const content = document.getElementById('ams-content');
    if (!content) return;

    document.getElementById('ams-open-instance-visual-editor')?.addEventListener('click', () => {
        if (!moduleState.instanceEditor?.id) {
            input.showToast('先从左侧选择一份报价单，再打开真实报价页。', true);
            return;
        }
        window.open(quoteEditorUrl('instance', moduleState.instanceEditor.id), '_blank', 'noopener');
    });

    document.getElementById('ams-quote-instance-brand-filter')?.addEventListener('change', (event) => {
        moduleState.instanceBrandFilter = event.currentTarget.value || 'all';
        void withQuoteBusy('正在刷新报价单列表...', async () => {
            await renderQuoteInstancesPage(input);
        });
    });
    document.getElementById('ams-quote-instance-status-filter')?.addEventListener('change', (event) => {
        moduleState.instanceStatusFilter = event.currentTarget.value || 'all';
        void withQuoteBusy('正在刷新报价单列表...', async () => {
            await renderQuoteInstancesPage(input);
        });
    });

    document.getElementById('ams-quote-instance-create-from-product')?.addEventListener('click', async (event) => {
        const productId = document.getElementById('ams-quote-instance-product-select')?.value || '';
        await input.withButtonBusy(event.currentTarget, '生成中...', async () => {
            try {
                const instance = await createInstanceFromProduct(input.user, productId);
                input.showToast('报价单草稿已生成。');
                await fetchInstanceEditor(instance.id);
                await renderQuoteInstancesPage(input);
            } catch (error) {
                input.showToast(error.message || '生成报价单草稿失败。', true);
            }
        });
    });
    document.querySelectorAll('[data-instance-edit]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await withQuoteBusy('正在加载报价单...', async () => {
                    await fetchInstanceEditor(button.dataset.instanceEdit);
                    await renderQuoteInstancesPage(input);
                }, button, '正在读取报价单详情、条目和媒体配置。');
            } catch (error) {
                input.showToast(error.message || '加载报价单失败。', true);
            }
        });
    });

    document.querySelectorAll('[data-instance-archive]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await withQuoteBusy('正在归档报价单...', async () => {
                    await archiveQuoteInstance(input.user, button.dataset.instanceArchive);
                    await fetchInstanceAnalytics(button.dataset.instanceArchive);
                    await renderQuoteInstancesPage(input);
                }, button, '归档只会隐藏业务入口，不会删除报价单、客户关系和浏览记录。');
                input.showToast('报价单已归档。');
            } catch (error) {
                input.showToast(error.message || '归档报价单失败。', true);
            }
        });
    });

    document.querySelectorAll('[data-instance-restore]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await withQuoteBusy('正在恢复报价单...', async () => {
                    await restoreQuoteInstance(input.user, button.dataset.instanceRestore);
                    await fetchInstanceAnalytics(button.dataset.instanceRestore);
                    await renderQuoteInstancesPage(input);
                }, button, '恢复后会回到归档前的草稿或已发布状态。');
                input.showToast('报价单已恢复。');
            } catch (error) {
                input.showToast(error.message || '恢复报价单失败。', true);
            }
        });
    });

    document.getElementById('ams-quote-instance-customer-select')?.addEventListener('change', (event) => {
        const customerId = event.currentTarget.value || '';
        moduleState.instanceEditor.customer_id = customerId;
        if (!customerId) return;
        const customer = moduleState.customers.find((item) => item.id === customerId);
        if (!customer) return;
        moduleState.instanceEditor.customer_name = customer.company_name;
        moduleState.instanceEditor.receiver_name = customer.contact_name;
        moduleState.instanceEditor.receiver_email = customer.email;
        moduleState.instanceEditor.customer_phone = customer.phone;
        moduleState.instanceEditor.customer_country = customer.country;
        moduleState.instanceEditor.customer_notes = customer.notes;
        moduleState.instanceEditor.customer_snapshot = normalizeCustomerSnapshot(customer);
        moduleState.instanceEditor.share_config = syncInstanceShareConfig(moduleState.instanceEditor, { forceRecipient: true, forceNotes: true });
        void renderQuoteInstancesPage(input);
    });

    content.querySelectorAll('[data-instance-field]').forEach((node) => {
        const apply = () => {
            const field = node.dataset.instanceField;
            if (!field) return;
            moduleState.instanceEditor[field] = node.type === 'checkbox' ? Boolean(node.checked) : node.value;
            moduleState.instanceEditor.customer_snapshot = buildInstanceCustomerSnapshot(moduleState.instanceEditor);
            if (['customer_name', 'receiver_name', 'receiver_email', 'customer_notes'].includes(field)) {
                moduleState.instanceEditor.share_config = syncInstanceShareConfig(moduleState.instanceEditor);
            }
        };
        node.addEventListener('input', apply);
        if (node.type === 'checkbox' || node.tagName === 'SELECT') node.addEventListener('change', apply);
    });

    content.querySelectorAll('[data-instance-share-field]').forEach((node) => {
        const apply = () => {
            const field = node.dataset.instanceShareField;
            if (!field) return;
            moduleState.instanceEditor.share_config = normalizeShareConfig({
                ...(moduleState.instanceEditor.share_config || {}),
                [field]: node.value,
            }, defaultShareConfigFromInstance(moduleState.instanceEditor));
        };
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
    });

    document.querySelectorAll('[data-share-history-save]').forEach((button) => {
        button.addEventListener('click', async (event) => {
            const entryId = button.dataset.shareHistorySave;
            const statusNode = content.querySelector(`[data-share-history-status="${entryId}"]`);
            const outcomeNode = content.querySelector(`[data-share-history-outcome="${entryId}"]`);
            await input.withButtonBusy(event.currentTarget, '更新中...', async () => {
                try {
                    await updateInstanceShareHistory(input.user, moduleState.instanceEditor.id, entryId, {
                        status: statusNode?.value || '',
                        outcome_notes: outcomeNode?.value || '',
                    });
                    input.showToast('发送记录已更新。');
                    await renderQuoteInstancesPage(input);
                } catch (error) {
                    input.showToast(error.message || '更新发送记录失败。', true);
                }
            });
        });
    });

    document.querySelectorAll('[data-share-history-retry]').forEach((button) => {
        button.addEventListener('click', async (event) => {
            const entryId = button.dataset.shareHistoryRetry;
            await input.withButtonBusy(event.currentTarget, '记录中...', async () => {
                try {
                    await updateInstanceShareHistory(input.user, moduleState.instanceEditor.id, entryId, {
                        status: 'following_up',
                    }, {
                        incrementAttempt: true,
                    });
                    input.showToast('已记录一次重发。');
                    await renderQuoteInstancesPage(input);
                } catch (error) {
                    input.showToast(error.message || '记录重发失败。', true);
                }
            });
        });
    });
    content.querySelectorAll('[data-rate-prefix="instance"]').forEach((node) => {
        node.addEventListener('input', () => {
            const code = node.dataset.rateCode;
            if (!code) return;
            moduleState.instanceEditor.draft_rates = normalizeRates({
                ...(moduleState.instanceEditor.draft_rates || DEFAULT_RATES),
                [code]: safeNumber(node.value, DEFAULT_RATES[code]),
            });
        });
    });

    content.querySelectorAll('[data-i18n-prefix^="instance-brand:"]').forEach((node) => {
        node.addEventListener('input', () => {
            const parts = String(node.dataset.i18nPrefix || '').split(':');
            const key = parts[1];
            const lang = node.dataset.lang;
            if (!key || !lang) return;
            moduleState.instanceEditor.brand_snapshot = extractBrandSnapshot(moduleState.instanceEditor.brand_snapshot);
            upsertLocalizedField(moduleState.instanceEditor.brand_snapshot, key, lang, node.value);
        });
    });

    content.querySelectorAll('[data-i18n-prefix^="instance-product:"]').forEach((node) => {
        node.addEventListener('input', () => {
            const parts = String(node.dataset.i18nPrefix || '').split(':');
            const key = parts[1];
            const lang = node.dataset.lang;
            if (!key || !lang) return;
            moduleState.instanceEditor.product_snapshot = extractProductSnapshot(moduleState.instanceEditor.product_snapshot);
            upsertLocalizedField(moduleState.instanceEditor.product_snapshot, key, lang, node.value);
        });
    });

    content.querySelectorAll('[data-ui-text-prefix="instance"]').forEach((node) => {
        const apply = () => {
            const key = node.dataset.uiTextKey;
            const lang = node.dataset.lang;
            if (!key || !lang) return;
            moduleState.instanceEditor.product_snapshot = extractProductSnapshot(moduleState.instanceEditor.product_snapshot);
            moduleState.instanceEditor.product_snapshot.ui_text = normalizeProductUiText(moduleState.instanceEditor.product_snapshot.ui_text);
            moduleState.instanceEditor.product_snapshot.ui_text[key][lang] = node.value;
        };
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
    });

    content.querySelectorAll('[data-media-config-prefix="instance"]').forEach((node) => {
        const apply = () => {
            const field = node.dataset.mediaConfigField;
            if (!field) return;
            const current = normalizeMediaConfig(moduleState.instanceEditor.product_snapshot?.media_config);
            current[field] = node.type === 'checkbox' ? Boolean(node.checked) : node.value;
            moduleState.instanceEditor.product_snapshot = extractProductSnapshot({
                ...moduleState.instanceEditor.product_snapshot,
                media_config: current,
            });
        };
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
    });

    content.querySelectorAll('[data-media-upload="instance"]').forEach((node) => {
        node.addEventListener('change', async () => {
            const files = Array.from(node.files || []);
            node.value = '';
            if (!files.length) return;
            try {
                const productContext = {
                    ...(moduleState.products.find((item) => item.id === moduleState.instanceEditor.product_id) || {}),
                    ...moduleState.instanceEditor.product_snapshot,
                    id: moduleState.instanceEditor.product_id,
                    brand_id: moduleState.instanceEditor.brand_id,
                    brand_slug: brandSlugById(moduleState.instanceEditor.brand_id),
                    media_gallery: moduleState.instanceEditor.product_snapshot?.media_gallery || [],
                };
                const savedGallery = await uploadProductMediaFiles(productContext, files);
                const mediaConfig = await syncProductMediaState(
                    moduleState.instanceEditor.product_id,
                    moduleState.instanceEditor.product_snapshot?.media_config,
                    savedGallery,
                    input.user?.id || null,
                );
                syncProductMediaToEditors(moduleState.instanceEditor.product_id, savedGallery, mediaConfig);
                input.showToast('当前产品图片库已更新。');
                await renderQuoteInstancesPage(input);
            } catch (error) {
                input.showToast(error.message || '上传产品图片失败。', true);
            }
        });
    });

    content.querySelectorAll('[data-brand-snapshot-field]').forEach((node) => {
        node.addEventListener('input', () => {
            const field = node.dataset.brandSnapshotField;
            if (!field) return;
            moduleState.instanceEditor.brand_snapshot[field] = node.value;
        });
    });

    content.querySelectorAll('[data-section-prefix="instance"]').forEach((node) => {
        const apply = () => {
            updateSectionField(moduleState.instanceEditor, node.dataset.sectionKey, node.dataset.sectionField, node.value);
            moduleState.instanceEditor.product_snapshot.section_config = moduleState.instanceEditor.section_config;
        };
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
    });

    content.querySelectorAll('[data-i18n-prefix^="instance:title:"]').forEach((node) => {
        node.addEventListener('input', () => {
            const parts = String(node.dataset.i18nPrefix || '').split(':');
            const sectionKey = parts[2];
            const lang = node.dataset.lang;
            if (!sectionKey || !lang) return;
            const section = normalizeSectionConfig(moduleState.instanceEditor.section_config).find((entry) => entry.key === sectionKey);
            if (!section) return;
            section.title[lang] = node.value;
            updateSectionField(moduleState.instanceEditor, sectionKey, 'title', section.title);
            moduleState.instanceEditor.product_snapshot.section_config = moduleState.instanceEditor.section_config;
        });
    });

    content.querySelectorAll('[data-item-prefix="instance"][data-item-field]').forEach((node) => {
        const apply = () => {
            const field = node.dataset.itemField;
            const itemId = node.dataset.itemId;
            if (!field || !itemId) return;
            const value = node.type === 'checkbox' ? Boolean(node.checked) : node.value;
            moduleState.instanceEditor.items = updateItemField(moduleState.instanceEditor.items, itemId, field, value);
        };
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
    });

    content.querySelectorAll('[data-item-prefix="instance"][data-item-lang]').forEach((node) => {
        node.addEventListener('input', () => {
            const itemId = node.dataset.itemId;
            const lang = node.dataset.itemLang;
            if (!itemId || !lang) return;
            moduleState.instanceEditor.items = updateItemLocalizedField(moduleState.instanceEditor.items, itemId, lang, node.value);
        });
    });

    document.querySelectorAll('[data-media-move="instance"]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                const mediaId = button.dataset.mediaId;
                const direction = safeNumber(button.dataset.direction, 0);
                const nextGallery = mediaMove(moduleState.instanceEditor.product_snapshot?.media_gallery || [], mediaId, direction);
                const savedGallery = await saveProductMediaCollection(moduleState.instanceEditor.product_id, nextGallery);
                const mediaConfig = await syncProductMediaState(
                    moduleState.instanceEditor.product_id,
                    moduleState.instanceEditor.product_snapshot?.media_config,
                    savedGallery,
                    input.user?.id || null,
                );
                syncProductMediaToEditors(moduleState.instanceEditor.product_id, savedGallery, mediaConfig);
                await renderQuoteInstancesPage(input);
            } catch (error) {
                input.showToast(error.message || '调整图片顺序失败。', true);
            }
        });
    });

    document.querySelectorAll('[data-media-delete="instance"]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                const mediaId = button.dataset.mediaId;
                const mediaItem = normalizeMediaGallery(moduleState.instanceEditor.product_snapshot?.media_gallery || []).find((item) => item.localId === mediaId);
                if (!mediaItem) return;
                const savedGallery = await deleteProductMediaItem(moduleState.instanceEditor.product_id, moduleState.instanceEditor.product_snapshot?.media_gallery || [], mediaItem);
                const mediaConfig = await syncProductMediaState(
                    moduleState.instanceEditor.product_id,
                    moduleState.instanceEditor.product_snapshot?.media_config,
                    savedGallery,
                    input.user?.id || null,
                );
                syncProductMediaToEditors(moduleState.instanceEditor.product_id, savedGallery, mediaConfig);
                input.showToast('产品图片已删除。');
                await renderQuoteInstancesPage(input);
            } catch (error) {
                input.showToast(error.message || '删除产品图片失败。', true);
            }
        });
    });

    content.querySelectorAll('[data-media-replace="instance"]').forEach((node) => {
        node.addEventListener('change', async () => {
            const files = Array.from(node.files || []);
            node.value = '';
            if (!files.length) return;
            try {
                const mediaId = node.dataset.mediaId;
                const mediaItem = normalizeMediaGallery(moduleState.instanceEditor.product_snapshot?.media_gallery || []).find((item) => item.localId === mediaId);
                if (!mediaItem) return;
                const productContext = {
                    ...(moduleState.products.find((item) => item.id === moduleState.instanceEditor.product_id) || {}),
                    ...moduleState.instanceEditor.product_snapshot,
                    id: moduleState.instanceEditor.product_id,
                    brand_id: moduleState.instanceEditor.brand_id,
                    brand_slug: brandSlugById(moduleState.instanceEditor.brand_id),
                    media_gallery: moduleState.instanceEditor.product_snapshot?.media_gallery || [],
                };
                const savedGallery = await replaceProductMediaFile(productContext, moduleState.instanceEditor.product_snapshot?.media_gallery || [], mediaItem, files[0]);
                const mediaConfig = await syncProductMediaState(
                    moduleState.instanceEditor.product_id,
                    moduleState.instanceEditor.product_snapshot?.media_config,
                    savedGallery,
                    input.user?.id || null,
                );
                syncProductMediaToEditors(moduleState.instanceEditor.product_id, savedGallery, mediaConfig);
                input.showToast('产品图片已更换。');
                await renderQuoteInstancesPage(input);
            } catch (error) {
                input.showToast(error.message || '更换产品图片失败。', true);
            }
        });
    });

    document.querySelectorAll('[data-item-add="instance"]').forEach((button) => {
        button.addEventListener('click', () => {
            const sectionKey = button.dataset.sectionKey;
            moduleState.instanceEditor.items = [
                ...moduleState.instanceEditor.items,
                {
                    ...createQuoteItem(sectionKey),
                    sort_order: (moduleState.instanceEditor.items.length + 1) * 10,
                },
            ];
            void renderQuoteInstancesPage(input);
        });
    });

    document.querySelectorAll('[data-item-delete="instance"]').forEach((button) => {
        button.addEventListener('click', () => {
            const itemId = button.dataset.itemId;
            moduleState.instanceEditor.items = moduleState.instanceEditor.items.filter((item) => item.localId !== itemId);
            void renderQuoteInstancesPage(input);
        });
    });

    document.querySelectorAll('[data-item-move="instance"]').forEach((button) => {
        button.addEventListener('click', () => {
            const itemId = button.dataset.itemId;
            const direction = safeNumber(button.dataset.direction, 0);
            moduleState.instanceEditor.items = rowMove(moduleState.instanceEditor.items, itemId, direction);
            void renderQuoteInstancesPage(input);
        });
    });

    document.getElementById('ams-quote-instance-save')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '保存中...', async () => {
            try {
                await saveInstanceDraft(input.user, moduleState.instanceEditor);
                input.showToast('报价单草稿已保存。');
                await renderQuoteInstancesPage(input);
            } catch (error) {
                input.showToast(error.message || '保存报价单失败。', true);
            }
        });
    });

    document.getElementById('ams-quote-instance-publish')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '发布中...', async () => {
            try {
                await publishInstance(input.user, moduleState.instanceEditor);
                input.showToast('报价单已发布。');
                await renderQuoteInstancesPage(input);
            } catch (error) {
                input.showToast(error.message || '发布报价单失败。', true);
            }
        });
    });

    document.getElementById('ams-quote-instance-preview')?.addEventListener('click', () => {
        input.withButtonBusy(document.getElementById('ams-quote-instance-preview'), '预览中...', async () => {
            if (!moduleState.instanceEditor.id) {
                input.showToast('请先保存报价单草稿。', true);
                return;
            }
            try {
                const saved = await saveInstanceDraft(input.user, moduleState.instanceEditor);
                moduleState.instanceEditor = saved;
                window.open(previewQuoteUrl(saved.id), '_blank', 'noopener');
            } catch (error) {
                input.showToast(error.message || '预览前保存草稿失败。', true);
            }
        });
    });

    document.getElementById('ams-quote-instance-copy-link')?.addEventListener('click', async () => {
        if (!moduleState.instanceEditor.public_slug) {
            input.showToast('请先填写公开链接 slug。', true);
            return;
        }
        const url = publicQuoteUrl(moduleState.instanceEditor.public_slug);
        try {
            await navigator.clipboard.writeText(url);
            input.showToast('客户链接已复制。');
        } catch (_error) {
            input.showToast(url, false);
        }
    });
}

function bindCustomerEditor(input) {
    const content = document.getElementById('ams-content');
    if (!content) return;

    document.getElementById('ams-quote-customer-search')?.addEventListener('input', (event) => {
        moduleState.customerSearch = event.currentTarget.value || '';
        void renderQuoteCustomersPage(input);
    });

    document.getElementById('ams-quote-customer-new')?.addEventListener('click', () => {
        moduleState.customerLoadedId = '';
        moduleState.customerEditor = createCustomerDraft();
        moduleState.customerEvents = [];
        void renderQuoteCustomersPage(input);
    });

    document.querySelectorAll('[data-customer-edit]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await withQuoteBusy('正在加载客户档案...', async () => {
                    await fetchCustomerEditor(button.dataset.customerEdit);
                    await renderQuoteCustomersPage(input);
                }, button, '正在聚合这名客户关联的报价单和最近访问事件。');
            } catch (error) {
                input.showToast(error.message || '加载客户档案失败。', true);
            }
        });
    });

    content.querySelectorAll('[data-customer-field]').forEach((node) => {
        const apply = () => {
            const field = node.dataset.customerField;
            if (!field) return;
            moduleState.customerEditor[field] = node.type === 'checkbox' ? Boolean(node.checked) : node.value;
        };
        node.addEventListener('input', apply);
        if (node.type === 'checkbox' || node.tagName === 'SELECT') node.addEventListener('change', apply);
    });

    document.getElementById('ams-quote-customer-save')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '保存中...', async () => {
            try {
                const saved = await saveCustomerDraft(input.user, moduleState.customerEditor);
                await fetchCustomerAnalytics(saved.id);
                input.showToast('客户档案已保存。');
                await renderQuoteCustomersPage(input);
            } catch (error) {
                input.showToast(error.message || '保存客户档案失败。', true);
            }
        });
    });

    document.querySelectorAll('[data-customer-quote-preview]').forEach((button) => {
        button.addEventListener('click', () => {
            const instanceId = button.dataset.customerQuotePreview;
            if (!instanceId) return;
            window.open(previewQuoteUrl(instanceId), '_blank', 'noopener');
        });
    });

    document.querySelectorAll('[data-customer-quote-public]').forEach((button) => {
        button.addEventListener('click', () => {
            const publicSlug = button.dataset.customerQuotePublic;
            if (!publicSlug) return;
            window.open(publicQuoteUrl(publicSlug), '_blank', 'noopener');
        });
    });
}

export async function renderQuoteInstancesPage(input) {
    try {
        await ensureBaseData();
    } catch (error) {
        if (isQuoteSetupMissing(error)) {
            renderQuoteSetupRequired(input, error);
            return;
        }
        throw error;
    }
    input.setPageHeader('报价系统 / 报价单管理', '从产品模板生成客户报价单草稿，编辑后发布，生成客户独立链接。');
    input.setContent(`
        <section class="ams-card ams-hero-card ams-hero-card-compact ams-quote-instance-hero">
            <div class="ams-hero-copy">
                <p class="ams-eyebrow">Quote Instances</p>
                <h2>报价单实例才是最终业务对象。</h2>
                <p class="ams-hero-text">实例从产品模板复制品牌快照、产品标题、主配置/选配和汇率。保存草稿不影响客户页，点击发布后才会更新客户看到的内容；默认按中文生成，多语言缺省项会自动继承中文。</p>
            </div>
            <div class="ams-quick-actions ams-quote-instance-quick-actions">
                <div class="ams-quick-link ams-quick-link-static ams-quote-create-panel">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-file-circle-plus"></i></div>
                    <div class="ams-quick-link-body">
                        <strong>从模板生成报价单</strong>
                        <span>先选一个产品模板，系统会按中文默认值生成一份可编辑草稿；EN / RU 未填写时会自动继承中文。</span>
                        <div class="ams-inline-actions ams-quote-create-bar ams-quote-create-bar-compact">
                            <select id="ams-quote-instance-product-select" class="ams-select ams-quote-create-select">
                                <option value="">请选择产品模板</option>
                                ${moduleState.products.map((product) => `<option value="${esc(product.id)}">${esc(brandLabelById(product.brand_id))} / ${esc(pickLocalized(product.public_title, product.default_lang, product.slug))}</option>`).join('')}
                            </select>
                            <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-instance-create-from-product">生成草稿</button>
                        </div>
                        <div class="ams-field-help ams-quote-create-hint">生成后可在草稿里单独补充客户信息、覆盖汇率、调整主配置和选配明细。</div>
                        <div class="ams-field-help ams-quote-create-hint">Send ledger is now stored only in <code>quote_instance_sends</code>.</div>
                    </div>
                </div>
            </div>
        </section>
        <section class="ams-quote-layout">
            <aside class="ams-card ams-quote-list-panel">
                <div class="ams-section-head"><div><h3>报价单列表</h3><p>共 ${filteredInstances().length} 份报价单</p></div></div>
                <div class="ams-site-field-grid ams-site-field-grid-wide">
                    <div class="ams-field">
                        <label>品牌筛选</label>
                        <select id="ams-quote-instance-brand-filter" class="ams-select">
                            <option value="all" ${moduleState.instanceBrandFilter === 'all' ? 'selected' : ''}>全部品牌</option>
                            ${moduleState.brands.map((brand) => `<option value="${esc(brand.id)}" ${moduleState.instanceBrandFilter === brand.id ? 'selected' : ''}>${esc(brand.display_name)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="ams-field">
                        <label>状态筛选</label>
                        <select id="ams-quote-instance-status-filter" class="ams-select">
                            <option value="all" ${moduleState.instanceStatusFilter === 'all' ? 'selected' : ''}>全部状态</option>
                            <option value="draft" ${moduleState.instanceStatusFilter === 'draft' ? 'selected' : ''}>草稿</option>
                            <option value="published" ${moduleState.instanceStatusFilter === 'published' ? 'selected' : ''}>已发布</option>
                            <option value="archived" ${moduleState.instanceStatusFilter === 'archived' ? 'selected' : ''}>已归档</option>
                        </select>
                    </div>
                </div>
                <div class="ams-quote-list">${renderInstanceList()}</div>
            </aside>
            <section class="ams-card ams-quote-editor-panel ams-customer-editor-panel">
                <div class="ams-section-head">
                    <div>
                        <h3>${moduleState.instanceEditor.id ? '编辑报价单' : '选择一份报价单'}</h3>
                        <p>客户页只读取已发布快照。草稿变更只有再次发布后才会生效。</p>
                    </div>
                    <div class="ams-row-actions">
                        <button class="ams-btn ams-btn-warning" type="button" id="ams-open-instance-visual-editor" ${moduleState.instanceEditor.id ? '' : 'disabled'}>打开真实报价页</button>
                        <button class="ams-btn ams-btn-muted" type="button" id="ams-quote-instance-preview">预览客户页</button>
                        <button class="ams-btn ams-btn-muted" type="button" id="ams-quote-instance-copy-link">复制客户链接</button>
                        <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-instance-save">保存草稿</button>
                        <button class="ams-btn ams-btn-warning" type="button" id="ams-quote-instance-publish">发布</button>
                    </div>
                </div>
                <div class="ams-direct-entry-banner">
                    <strong>真实报价页入口</strong>
                    <span>${moduleState.instanceEditor.id ? '点击上面的“打开真实报价页”，会进入客户报价页本体进行编辑。' : '先从左侧选择一份报价单，顶部按钮才会启用。'}</span>
                </div>
                ${
                    moduleState.instanceEditor.id
                        ? `
                    <div class="ams-quote-meta-grid">
                        <div class="ams-summary-chip"><strong>状态</strong><span>${statusPill(moduleState.instanceEditor.status)}</span></div>
                        <div class="ams-summary-chip"><strong>客户档案</strong><span>${esc(customerDisplayName(moduleState.customers.find((item) => item.id === moduleState.instanceEditor.customer_id) || buildInstanceCustomerSnapshot(moduleState.instanceEditor)))}</span></div>
                        <div class="ams-summary-chip"><strong>公开链接</strong><span>${esc(publicQuoteUrl(moduleState.instanceEditor.public_slug))}</span></div>
                        <div class="ams-summary-chip"><strong>预览链接</strong><span>${esc(previewQuoteUrl(moduleState.instanceEditor.id))}</span></div>
                        <div class="ams-summary-chip"><strong>最近发布时间</strong><span>${esc(fmtDate(moduleState.instanceEditor.published_at))}</span></div>
                    </div>
                    <div class="ams-site-field-grid ams-site-field-grid-wide">
                        <div class="ams-field"><label>公开链接 slug</label><input class="ams-input" data-instance-field="public_slug" value="${esc(moduleState.instanceEditor.public_slug)}"></div>
                        <div class="ams-field"><label>默认语言</label><select class="ams-select" data-instance-field="default_lang">${SUPPORTED_LANGS.map((lang) => `<option value="${lang}" ${moduleState.instanceEditor.default_lang === lang ? 'selected' : ''}>${lang.toUpperCase()}</option>`).join('')}</select></div>
                        <div class="ams-field">
                            <label>客户档案</label>
                            <select class="ams-select" id="ams-quote-instance-customer-select">
                                <option value="">新建或未关联</option>
                                ${moduleState.customers.map((customer) => `<option value="${esc(customer.id)}" ${moduleState.instanceEditor.customer_id === customer.id ? 'selected' : ''}>${esc(customerDisplayName(customer))}${customer.email ? ` · ${esc(customer.email)}` : ''}</option>`).join('')}
                            </select>
                        </div>
                        <div class="ams-field"><label>客户公司</label><input class="ams-input" data-instance-field="customer_name" value="${esc(moduleState.instanceEditor.customer_name)}" placeholder="Demo Customer"></div>
                        <div class="ams-field"><label>联系人</label><input class="ams-input" data-instance-field="receiver_name" value="${esc(moduleState.instanceEditor.receiver_name)}" placeholder="Receiver"></div>
                        <div class="ams-field"><label>客户邮箱</label><input class="ams-input" data-instance-field="receiver_email" value="${esc(moduleState.instanceEditor.receiver_email)}" placeholder="customer@example.com"></div>
                        <div class="ams-field"><label>客户电话</label><input class="ams-input" data-instance-field="customer_phone" value="${esc(moduleState.instanceEditor.customer_phone)}" placeholder="+7 000 000 0000"></div>
                        <div class="ams-field"><label>国家/地区</label><input class="ams-input" data-instance-field="customer_country" value="${esc(moduleState.instanceEditor.customer_country)}" placeholder="Russia"></div>
                        <div class="ams-field"><label>有效期（小时）</label><input class="ams-input" type="number" min="1" step="1" data-instance-field="validity_hours" value="${esc(moduleState.instanceEditor.validity_hours)}"></div>
                    </div>
                    <div class="ams-field">
                        <label>客户备注</label>
                        <textarea class="ams-textarea" rows="3" data-instance-field="customer_notes" placeholder="记录客户偏好、分享要求或跟进备注。">${esc(moduleState.instanceEditor.customer_notes)}</textarea>
                    </div>
                    <section class="ams-quote-block">
                        <div class="ams-section-head"><div><h3>分享对象</h3><p>这里维护默认外发联系人、跟进负责人和分享备注；运行时生成链接、邮件动作和分享访问事件都会带上这些信息。</p></div></div>
                        <div class="ams-site-field-grid ams-site-field-grid-wide">
                            <div class="ams-field"><label>分享联系人</label><input class="ams-input" data-instance-share-field="recipient_name" value="${esc(moduleState.instanceEditor.share_config?.recipient_name)}" placeholder="Receiver"></div>
                            <div class="ams-field"><label>分享邮箱</label><input class="ams-input" data-instance-share-field="recipient_email" value="${esc(moduleState.instanceEditor.share_config?.recipient_email)}" placeholder="customer@example.com"></div>
                            <div class="ams-field"><label>分享公司</label><input class="ams-input" data-instance-share-field="recipient_company" value="${esc(moduleState.instanceEditor.share_config?.recipient_company)}" placeholder="Demo Customer"></div>
                            <div class="ams-field"><label>跟进负责人</label><input class="ams-input" data-instance-share-field="owner_name" value="${esc(moduleState.instanceEditor.share_config?.owner_name)}" placeholder="Allen"></div>
                            <div class="ams-field"><label>负责人邮箱</label><input class="ams-input" data-instance-share-field="owner_email" value="${esc(moduleState.instanceEditor.share_config?.owner_email)}" placeholder="allen@example.com"></div>
                        </div>
                        <div class="ams-field">
                            <label>分享备注</label>
                            <textarea class="ams-textarea" rows="3" data-instance-share-field="follow_up_notes" placeholder="记录这份报价对外发送的上下文、承诺、跟进节点或提醒。">${esc(moduleState.instanceEditor.share_config?.follow_up_notes)}</textarea>
                        </div>
                        <div class="ams-field-help">客户公司 / 联系人 / 邮箱 / 客户备注变更时，未手工覆盖的分享对象字段会自动继承默认值。</div>
                    </section>
                    ${instanceInsightsMarkup()}
                    <section class="ams-quote-block">
                        <div class="ams-section-head"><div><h3>品牌信息快照</h3><p>这是当前报价单自己的品牌页头和页脚，不会反向改动品牌模板。</p></div></div>
                        <div class="ams-site-field-grid ams-site-field-grid-wide">
                            <div class="ams-field"><label>供应商</label><input class="ams-input" data-brand-snapshot-field="supplier_name" value="${esc(moduleState.instanceEditor.brand_snapshot.supplier_name)}"></div>
                            <div class="ams-field"><label>发件邮箱</label><input class="ams-input" data-brand-snapshot-field="sender_email" value="${esc(moduleState.instanceEditor.brand_snapshot.sender_email)}"></div>
                        </div>
                        ${localizedFieldGroup('instance-brand:overview_title', '页面总标题', moduleState.instanceEditor.brand_snapshot.overview_title)}
                        ${localizedFieldGroup('instance-brand:footer_note', '页脚说明', moduleState.instanceEditor.brand_snapshot.footer_note)}
                    </section>
                    <section class="ams-quote-block">
                        <div class="ams-section-head"><div><h3>产品展示信息</h3><p>这里维护客户页上显示的产品标题和区块标题。</p></div></div>
                        ${localizedFieldGroup('instance-product:public_title', '产品标题', moduleState.instanceEditor.product_snapshot.public_title)}
                        <div class="ams-quote-section-grid">${sectionConfigMarkup('instance', moduleState.instanceEditor.section_config)}</div>
                    </section>
                    ${instanceVisualEditorMarkup(moduleState.instanceEditor)}
                    ${mediaLibraryMarkup('instance', moduleState.instanceEditor.product_snapshot.media_config, moduleState.instanceEditor.product_snapshot.media_gallery, {
                        uploadLabel: '上传当前产品图片',
                        description: '这里是当前报价单使用的产品图片入口。图片库按产品独立维护，上传、替换、删除和排序后，本报价草稿会同步最新图片快照；展示位置和样式可单独调整。',
                    })}
                    <section class="ams-quote-block">
                        <div class="ams-section-head"><div><h3>汇率</h3><p>保存的是这份报价单自己的汇率快照，刷新汇率时会在客户页即时重算。</p></div></div>
                        ${ratesFieldset('instance', moduleState.instanceEditor.draft_rates)}
                    </section>
                    <section class="ams-quote-block">
                        <div class="ams-section-head"><div><h3>主配置明细</h3><p>支持独立增删排序，发布后客户页只读取这一版快照。</p></div></div>
                        ${itemTableMarkup('instance', SECTION_KEYS.MAIN, moduleState.instanceEditor.items)}
                    </section>
                    <section class="ams-quote-block">
                        <div class="ams-section-head"><div><h3>选配明细</h3><p>与主配置分开维护，发布后一起进入客户页。</p></div></div>
                        ${itemTableMarkup('instance', SECTION_KEYS.OPTIONAL, moduleState.instanceEditor.items)}
                    </section>
                `
                        : '<div class="ams-empty">先从左侧选择一份报价单，或从产品模板生成一份新的草稿。</div>'
                }
            </section>
        </section>
    `);
    bindInstanceEditor(input);
}

export async function renderQuoteCustomersPage(input) {
    try {
        await ensureBaseData();
    } catch (error) {
        if (isQuoteSetupMissing(error)) {
            renderQuoteSetupRequired(input, error);
            return;
        }
        throw error;
    }

    if (!moduleState.customerEditor) {
        moduleState.customerEditor = createCustomerDraft();
    }

    const currentCustomerExists = moduleState.customerLoadedId && moduleState.customers.some((item) => item.id === moduleState.customerLoadedId);
    if (moduleState.customerLoadedId && !currentCustomerExists) {
        moduleState.customerLoadedId = '';
        moduleState.customerEditor = createCustomerDraft();
        moduleState.customerEvents = [];
    }
    if (!moduleState.customerLoadedId && !moduleState.customerEditor?.id && moduleState.customers[0]?.id) {
        await fetchCustomerEditor(moduleState.customers[0].id);
    }

    const activeCustomerId = text(moduleState.customerLoadedId || moduleState.customerEditor?.id);
    const quoteSummary = activeCustomerId ? summarizeCustomerQuotes(activeCustomerId) : summarizeCustomerQuotes('');
    input.setPageHeader('报价系统 / 客户洞察', '按客户查看关联报价单、浏览记录、分享动作，并维护客户主档信息。');
    input.setContent(`
        <section class="ams-card ams-hero-card ams-hero-card-compact ams-quote-instance-hero">
            <div class="ams-hero-copy">
                <p class="ams-eyebrow">Quote Customers</p>
                <h2>客户是报价系统里的主业务对象。</h2>
                <p class="ams-hero-text">这里按客户聚合相关报价单、访问时间线和分享行为。报价单继续保留自己的客户快照，客户主档则作为后台的长期关系入口。</p>
            </div>
            <div class="ams-quick-actions ams-quote-instance-quick-actions">
                <div class="ams-quick-link ams-quick-link-static ams-quote-create-panel">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-address-book"></i></div>
                    <div class="ams-quick-link-body">
                        <strong>客户主档</strong>
                        <span>客户主档用于复用公司、联系人、邮箱、电话和备注；每份报价单发布时仍然保留自己的客户快照。</span>
                        <div class="ams-inline-actions ams-quote-create-bar ams-quote-create-bar-compact">
                            <input id="ams-quote-customer-search" class="ams-input ams-quote-create-select" value="${esc(moduleState.customerSearch)}" placeholder="搜索公司 / 联系人 / 邮箱 / 电话">
                            <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-customer-new">新建客户档案</button>
                        </div>
                        <div class="ams-field-help ams-quote-create-hint">已执行 <code>010_quote_customer_tracking.sql</code> 和 <code>011_quote_send_ledger.sql</code> 后，这里会读取 <code>quote_customers</code>、<code>quote_instance_events</code> 和 <code>quote_instance_sends</code>。</div>
                        <div class="ams-field-help ams-quote-create-hint">This page reads <code>quote_customers</code>, <code>quote_instance_events</code>, and <code>quote_instance_sends</code>.</div>
                    </div>
                </div>
            </div>
        </section>
        <section class="ams-quote-layout">
            <aside class="ams-card ams-quote-list-panel">
                <div class="ams-section-head"><div><h3>客户列表</h3><p>共 ${filteredCustomers().length} 个活跃客户</p></div></div>
                <div class="ams-quote-list">${renderCustomerList()}</div>
            </aside>
            <section class="ams-card ams-quote-editor-panel ams-instance-editor-panel">
                <div class="ams-section-head">
                    <div>
                        <h3>${activeCustomerId ? '编辑客户档案' : '新建客户档案'}</h3>
                        <p>客户主档是后台关系视图；报价单内的 <code>customer_snapshot</code> 仍用于保留发布时的业务历史。</p>
                    </div>
                    <div class="ams-row-actions">
                        <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-customer-save">保存客户档案</button>
                    </div>
                </div>
                <div class="ams-quote-meta-grid">
                    <div class="ams-summary-chip"><strong>客户名称</strong><span>${esc(customerDisplayName(moduleState.customerEditor || {}))}</span></div>
                    <div class="ams-summary-chip"><strong>关联报价单</strong><span>${esc(quoteSummary.total_quotes)}</span></div>
                    <div class="ams-summary-chip"><strong>创建时间</strong><span>${esc(fmtDate(moduleState.customerEditor?.created_at))}</span></div>
                    <div class="ams-summary-chip"><strong>更新时间</strong><span>${esc(fmtDate(moduleState.customerEditor?.updated_at))}</span></div>
                </div>
                <div class="ams-site-field-grid ams-site-field-grid-wide">
                    <div class="ams-field"><label>客户公司</label><input class="ams-input" data-customer-field="company_name" value="${esc(moduleState.customerEditor?.company_name)}" placeholder="Demo Customer"></div>
                    <div class="ams-field"><label>联系人</label><input class="ams-input" data-customer-field="contact_name" value="${esc(moduleState.customerEditor?.contact_name)}" placeholder="Receiver"></div>
                    <div class="ams-field"><label>客户邮箱</label><input class="ams-input" data-customer-field="email" value="${esc(moduleState.customerEditor?.email)}" placeholder="customer@example.com"></div>
                    <div class="ams-field"><label>客户电话</label><input class="ams-input" data-customer-field="phone" value="${esc(moduleState.customerEditor?.phone)}" placeholder="+7 000 000 0000"></div>
                    <div class="ams-field"><label>国家/地区</label><input class="ams-input" data-customer-field="country" value="${esc(moduleState.customerEditor?.country)}" placeholder="Russia"></div>
                </div>
                <div class="ams-field">
                    <label>客户备注</label>
                    <textarea class="ams-textarea" rows="4" data-customer-field="notes" placeholder="记录客户来源、偏好、跟进节奏、分享要求或内部备注。">${esc(moduleState.customerEditor?.notes)}</textarea>
                </div>
                ${customerInsightsMarkup()}
            </section>
        </section>
    `);
    bindCustomerEditor(input);
}
