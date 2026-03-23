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
const TABLE_REQUIREMENTS = 'quote_requirements';
const TABLE_INSTANCES = 'quote_instances';
const TABLE_INSTANCE_ITEMS = 'quote_instance_items';
const TABLE_INSTANCE_EVENTS = 'quote_instance_events';
const TABLE_INSTANCE_SENDS = 'quote_instance_sends';
const STORAGE_BUCKET_PRODUCT_MEDIA = 'quote-product-media';

const moduleState = {
    brands: [],
    products: [],
    customers: [],
    requirements: [],
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
    requirementEditor: null,
    customerEvents: [],
    customerSends: [],
    productLoadedId: '',
    instanceLoadedId: '',
    customerLoadedId: '',
    requirementLoadedId: '',
    customerSearch: '',
    requirementSearch: '',
    requirementProductSelection: '',
    requirementStatusFilter: 'all',
    customerArchiveView: false,
    customerCreateMode: false,
    requirementCreateMode: false,
    brandDisplayNameTouched: false,
    brandDefaultLinkTouched: false,
    brandArchiveView: false,
    productBrandFilter: 'all',
    productArchiveView: false,
    instanceSearch: '',
    instanceStatusFilter: 'all',
    instanceRequirementFilter: '',
    instancePage: 1,
    instancePageSize: 10,
    instanceListMode: 'active',
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
        label: '独立发电产品模板',
        hint: '独立燃气发电机组模板，适合标准发电产品线。',
        order: 10,
    },
    minerpower: {
        label: '一体化产品模板',
        hint: '矿电一体和集装箱模板，适合整机集成产品线。',
        order: 20,
    },
});

const REQUIREMENT_STATUS_OPTIONS = Object.freeze([
    { value: 'draft', label: '待客户提交' },
    { value: 'submitted', label: '客户已提交' },
    { value: 'reviewing', label: '内部评估中' },
    { value: 'quoted', label: '已转报价' },
    { value: 'closed', label: '已关闭' },
]);

const REQUIREMENT_TYPE_OPTIONS = Object.freeze([
    { value: 'integrated_mining_power', label: '矿机 + 供电一体化' },
    { value: 'miner_only', label: '仅矿机需求' },
    { value: 'power_only', label: '仅供电 / 发电需求' },
    { value: 'unclear', label: '需求待推荐' },
]);

const REQUIREMENT_SELECT_OPTIONS = Object.freeze({
    deployment_mode: [
        { value: 'new_site', label: '新建站点' },
        { value: 'existing_site_upgrade', label: '已有站点扩容' },
        { value: 'mobile_container', label: '移动 / 集装箱方案' },
        { value: 'unknown', label: '待确认' },
    ],
    miner_hashrate_band: [
        { value: 'under_150t', label: '150T 以下' },
        { value: '150t_200t', label: '150T - 200T' },
        { value: '200t_300t', label: '200T - 300T' },
        { value: 'over_300t', label: '300T 以上' },
        { value: 'need_recommendation', label: '待推荐' },
    ],
    miner_power_band: [
        { value: 'under_3kw', label: '3kW 以下' },
        { value: '3kw_4kw', label: '3kW - 4kW' },
        { value: '4kw_5_5kw', label: '4kW - 5.5kW' },
        { value: 'over_5_5kw', label: '5.5kW 以上' },
        { value: 'need_recommendation', label: '待推荐' },
    ],
    miner_quantity_band: [
        { value: '1_10', label: '1 - 10 台' },
        { value: '10_50', label: '10 - 50 台' },
        { value: '50_200', label: '50 - 200 台' },
        { value: '200_plus', label: '200 台以上' },
        { value: 'unknown', label: '待确认' },
    ],
    power_capacity_band: [
        { value: 'under_100kw', label: '100kW 以下' },
        { value: '100_500kw', label: '100kW - 500kW' },
        { value: '500kw_1mw', label: '500kW - 1MW' },
        { value: '1mw_5mw', label: '1MW - 5MW' },
        { value: 'over_5mw', label: '5MW 以上' },
        { value: 'unknown', label: '待确认' },
    ],
    voltage_frequency: [
        { value: '400v_50hz', label: '400V / 50Hz' },
        { value: '415v_50hz', label: '415V / 50Hz' },
        { value: '480v_60hz', label: '480V / 60Hz' },
        { value: 'custom', label: '其他 / 待确认' },
    ],
    container_preference: [
        { value: 'integrated_container', label: '整柜一体化' },
        { value: 'rack_only', label: '仅机架 / 机位' },
        { value: 'site_buildout', label: '场站部署' },
        { value: 'need_recommendation', label: '待推荐' },
    ],
    silent_requirement: [
        { value: 'standard', label: '常规即可' },
        { value: 'low_noise', label: '低噪要求' },
        { value: 'ultra_low_noise', label: '极低噪要求' },
        { value: 'unknown', label: '待确认' },
    ],
    budget_band: [
        { value: 'need_recommendation', label: '先看推荐方案' },
        { value: 'under_100k_usd', label: '10 万 USD 以下' },
        { value: '100k_500k_usd', label: '10 - 50 万 USD' },
        { value: '500k_2m_usd', label: '50 - 200 万 USD' },
        { value: 'over_2m_usd', label: '200 万 USD 以上' },
    ],
    timeline_band: [
        { value: 'urgent', label: '尽快' },
        { value: 'within_1_month', label: '1 个月内' },
        { value: '1_3_months', label: '1 - 3 个月' },
        { value: '3_6_months', label: '3 - 6 个月' },
        { value: 'unknown', label: '待确认' },
    ],
    source_channel: [
        { value: 'whatsapp', label: 'WhatsApp' },
        { value: 'wechat', label: '微信' },
        { value: 'email', label: '邮箱' },
        { value: 'phone', label: '电话 / 会议' },
        { value: 'website', label: '官网线索' },
        { value: 'referral', label: '转介绍' },
        { value: 'other', label: '其他' },
    ],
});

const REQUIREMENT_MULTI_OPTIONS = Object.freeze({
    miner_brands: [
        { value: 'bitmain', label: 'Bitmain / ANTMINER（比特大陆）' },
        { value: 'microbt', label: 'MicroBT / WhatsMiner（比特微）' },
        { value: 'canaan', label: 'Canaan / Avalon Miner（嘉楠）' },
        { value: 'bitdeer', label: 'Bitdeer / SEALMINER（比特小鹿）' },
        { value: 'auradine', label: 'Auradine / Teraflux' },
        { value: 'other', label: '其他 / 待确认' },
    ],
    miner_cooling: [
        { value: 'air', label: '风冷矿机' },
        { value: 'liquid', label: '液冷矿机' },
        { value: 'hydro', label: '水冷 / 浸没式' },
        { value: 'unknown', label: '待推荐' },
    ],
    certification_needs: [
        { value: 'ce', label: 'CE' },
        { value: 'eac', label: 'EAC' },
        { value: 'ul', label: 'UL' },
        { value: 'grid_sync', label: '并网 / 电力接口合规' },
        { value: 'none', label: '暂无明确要求' },
    ],
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

function normalizeRequirementStatus(value = '') {
    const normalized = text(value).toLowerCase();
    if (normalized === 'intake') return 'draft';
    return REQUIREMENT_STATUS_OPTIONS.some((item) => item.value === normalized) ? normalized : 'draft';
}

function requirementStatusReadyForQuote(status = '') {
    return ['submitted', 'reviewing', 'quoted'].includes(normalizeRequirementStatus(status));
}

function requirementIsLocked(status = '') {
    return ['submitted', 'reviewing', 'quoted', 'closed'].includes(normalizeRequirementStatus(status));
}

function randomAlphaNumeric(length = 10) {
    const size = Math.max(6, Number(length) || 10);
    const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
    if (window.crypto?.getRandomValues) {
        const bytes = new Uint8Array(size);
        window.crypto.getRandomValues(bytes);
        return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join('');
    }
    return Array.from({ length: size }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

function createRequirementPublicSlug(draft = {}) {
    const customer = moduleState.customers.find((item) => item.id === text(draft.customer_id));
    const companyPart = normalizeSlugPart(
        draft.requester_company || customer?.company_name || customer?.customer_name || draft.title || 'requirement',
        'requirement'
    );
    const typePart = normalizeSlugPart(draft.requirement_type || 'draft', 'draft');
    return `req-${companyPart}-${typePart}-${randomAlphaNumeric(6)}`;
}

function createRequirementPublicToken() {
    return randomAlphaNumeric(16);
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

function normalizeStringList(value) {
    if (Array.isArray(value)) return Array.from(new Set(value.map((item) => text(item)).filter(Boolean)));
    if (typeof value === 'string') {
        const trimmed = text(value);
        if (!trimmed) return [];
        if (trimmed.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmed);
                return normalizeStringList(parsed);
            } catch (_error) {
                return [trimmed];
            }
        }
        return [trimmed];
    }
    return [];
}

function normalizeRequirementAnswers(value = {}) {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    return {
        deployment_mode: text(source.deployment_mode || 'new_site'),
        miner_brands: normalizeStringList(source.miner_brands),
        miner_cooling: normalizeStringList(source.miner_cooling),
        miner_hashrate_band: text(source.miner_hashrate_band || 'need_recommendation'),
        miner_power_band: text(source.miner_power_band || 'need_recommendation'),
        miner_quantity_band: text(source.miner_quantity_band || 'unknown'),
        power_capacity_band: text(source.power_capacity_band || 'unknown'),
        voltage_frequency: text(source.voltage_frequency || 'custom'),
        container_preference: text(source.container_preference || 'need_recommendation'),
        silent_requirement: text(source.silent_requirement || 'unknown'),
        budget_band: text(source.budget_band || 'need_recommendation'),
        timeline_band: text(source.timeline_band || 'unknown'),
        certification_needs: normalizeStringList(source.certification_needs),
        source_channel: text(source.source_channel || 'other'),
        extra_notes: text(source.extra_notes),
    };
}

function createRequirementDraft(seed = {}) {
    return {
        id: text(seed.id),
        customer_id: text(seed.customer_id || seed.customerId),
        title: text(seed.title),
        status: normalizeRequirementStatus(seed.status),
        requirement_type: REQUIREMENT_TYPE_OPTIONS.some((item) => item.value === text(seed.requirement_type || seed.requirementType))
            ? text(seed.requirement_type || seed.requirementType)
            : 'integrated_mining_power',
        country: text(seed.country),
        requester_company: text(seed.requester_company || seed.requesterCompany),
        requester_name: text(seed.requester_name || seed.requesterName),
        requester_email: text(seed.requester_email || seed.requesterEmail),
        requester_phone: text(seed.requester_phone || seed.requesterPhone),
        public_slug: text(seed.public_slug || seed.publicSlug),
        public_token: text(seed.public_token || seed.publicToken),
        submitted_at: text(seed.submitted_at || seed.submittedAt),
        answers: normalizeRequirementAnswers(seed.answers),
        notes: text(seed.notes),
        is_active: seed.is_active !== false,
        created_at: text(seed.created_at || seed.createdAt),
        updated_at: text(seed.updated_at || seed.updatedAt),
    };
}

function optionLabel(options = [], value = '') {
    return options.find((item) => item.value === text(value))?.label || text(value, '--');
}

function requirementTypeLabel(value = '') {
    return optionLabel(REQUIREMENT_TYPE_OPTIONS, value);
}

function requirementStatusLabel(value = '') {
    return optionLabel(REQUIREMENT_STATUS_OPTIONS, value);
}

function multiOptionLabels(options = [], values = []) {
    const list = normalizeStringList(values);
    return list.map((value) => optionLabel(options, value)).filter(Boolean);
}

function requirementDisplayName(requirement = {}) {
    const customer = moduleState.customers.find((item) => item.id === text(requirement.customer_id));
    const base = text(requirement.title);
    if (base) return base;
    return `${customerDisplayName(customer || {})} / ${requirementTypeLabel(requirement.requirement_type || 'integrated_mining_power')}`;
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

function currentSalesOwner(user = null) {
    const email = text(user?.email).toLowerCase();
    const fullName = text(user?.user_metadata?.full_name);
    return {
        name: text(fullName || (email.includes('@') ? email.split('@')[0] : email), '当前销售'),
        email,
    };
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

function syncInstanceSalesOwner(draft = {}, user = null, options = {}) {
    const current = normalizeShareConfig(draft.share_config || draft.shareConfig, defaultShareConfigFromInstance(draft));
    const salesOwner = currentSalesOwner(user);
    const forceOwner = options.forceOwner === true;
    draft.share_config = normalizeShareConfig({
        ...current,
        owner_name: forceOwner || !hasTextValue(current.owner_name) ? salesOwner.name : current.owner_name,
        owner_email: forceOwner || !hasTextValue(current.owner_email) ? salesOwner.email : current.owner_email,
    }, defaultShareConfigFromInstance(draft));
    return draft.share_config;
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
    return '<div class="ams-field-help ams-quote-ledger-note">这里记录这份报价实际发给过谁、由谁负责跟进，以及每次发送后的结果。</div>';
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
        else if (instance.status === 'voided') summary.voided_quotes += 1;
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
        voided_quotes: 0,
        last_quote_updated_at: '',
    });
}

function summarizeCustomerRequirements(customerId = '') {
    return moduleState.requirements.reduce((summary, requirement) => {
        if (text(requirement.customer_id) !== text(customerId)) return summary;
        summary.total_requirements += 1;
        if (normalizeRequirementStatus(requirement.status) === 'quoted') summary.quoted_requirements += 1;
        else if (normalizeRequirementStatus(requirement.status) === 'closed') summary.closed_requirements += 1;
        else summary.open_requirements += 1;
        if (!summary.last_requirement_updated_at || text(requirement.updated_at) > summary.last_requirement_updated_at) {
            summary.last_requirement_updated_at = text(requirement.updated_at);
        }
        return summary;
    }, {
        total_requirements: 0,
        open_requirements: 0,
        quoted_requirements: 0,
        closed_requirements: 0,
        last_requirement_updated_at: '',
    });
}

function summarizeCustomerActivity(customerId = '', events = []) {
    const quoteSummary = summarizeCustomerQuotes(customerId);
    const requirementSummary = summarizeCustomerRequirements(customerId);
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
        ...requirementSummary,
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
        requirement_id: text(seed.requirement_id || seed.requirementId),
        public_slug: text(seed.public_slug || seed.publicSlug),
        status: normalizedStatus === 'published' || normalizedStatus === 'archived' || normalizedStatus === 'voided' ? normalizedStatus : 'draft',
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
moduleState.requirementEditor = createRequirementDraft();

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
        .order('company_name', { ascending: true })
        .order('contact_name', { ascending: true });
    if (error) throw error;
    moduleState.customers = Array.isArray(data) ? data.map((row) => createCustomerRecord(row)) : [];
    return moduleState.customers;
}

async function fetchRequirementRows() {
    const { data, error } = await client
        .from(TABLE_REQUIREMENTS)
        .select('id, customer_id, title, status, requirement_type, country, requester_company, requester_name, requester_email, requester_phone, public_slug, public_token, submitted_at, answers, notes, is_active, created_at, updated_at')
        .eq('is_active', true)
        .order('updated_at', { ascending: false });
    if (error) throw error;
    moduleState.requirements = Array.isArray(data) ? data.map((row) => createRequirementDraft(row)) : [];
    return moduleState.requirements;
}

async function fetchRequirementEditor(requirementId) {
    if (!requirementId) {
        moduleState.requirementLoadedId = '';
        moduleState.requirementEditor = createRequirementDraft();
        moduleState.requirementCreateMode = true;
        return moduleState.requirementEditor;
    }
    const { data, error } = await client.from(TABLE_REQUIREMENTS).select('*').eq('id', requirementId).single();
    if (error) throw error;
    moduleState.requirementLoadedId = requirementId;
    moduleState.requirementEditor = createRequirementDraft(data);
    moduleState.requirementCreateMode = false;
    return moduleState.requirementEditor;
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
        .select('id, brand_id, product_id, customer_id, requirement_id, public_slug, status, last_active_status, archived_at, customer_name, receiver_name, receiver_email, customer_snapshot, share_config, default_lang, validity_hours, published_at, updated_at')
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
        moduleState.customerCreateMode = true;
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
    moduleState.customerCreateMode = false;
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

async function archiveProductTemplate(user, productId) {
    if (!productId) throw new Error('请先选择一个产品模板。');
    const current = moduleState.products.find((item) => item.id === productId) || moduleState.productEditor;
    const { data, error } = await client
        .from(TABLE_PRODUCTS)
        .update({
            is_active: false,
            updated_by: user?.id || null,
        })
        .eq('id', productId)
        .select('*')
        .single();
    if (error) throw error;
    await fetchProductRows();
    if (moduleState.productEditor?.id === data.id) {
        moduleState.productLoadedId = data.id;
        moduleState.productEditor = createProductDraft({
            ...(current || {}),
            ...data,
            items: moduleState.productEditor.items,
            media_gallery: moduleState.productEditor.media_gallery,
        });
    }
    return createProductDraft({
        ...(current || {}),
        ...data,
        items: moduleState.productEditor?.id === data.id ? moduleState.productEditor.items : [],
        media_gallery: moduleState.productEditor?.id === data.id ? moduleState.productEditor.media_gallery : [],
    });
}

async function restoreProductTemplate(user, productId) {
    if (!productId) throw new Error('请先选择一个产品模板。');
    const current = moduleState.products.find((item) => item.id === productId) || moduleState.productEditor;
    const { data, error } = await client
        .from(TABLE_PRODUCTS)
        .update({
            is_active: true,
            updated_by: user?.id || null,
        })
        .eq('id', productId)
        .select('*')
        .single();
    if (error) throw error;
    await fetchProductRows();
    if (moduleState.productEditor?.id === data.id) {
        moduleState.productLoadedId = data.id;
        moduleState.productEditor = createProductDraft({
            ...(current || {}),
            ...data,
            items: moduleState.productEditor.items,
            media_gallery: moduleState.productEditor.media_gallery,
        });
    }
    return createProductDraft({
        ...(current || {}),
        ...data,
        items: moduleState.productEditor?.id === data.id ? moduleState.productEditor.items : [],
        media_gallery: moduleState.productEditor?.id === data.id ? moduleState.productEditor.media_gallery : [],
    });
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
        is_active: payload.is_active !== false,
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
    moduleState.customerCreateMode = false;
    return moduleState.customerEditor;
}

async function saveRequirementDraft(user, draft) {
    const payload = createRequirementDraft(draft);
    if (!payload.customer_id) throw new Error('需求获取单必须绑定一个客户档案。');
    const customer = moduleState.customers.find((item) => item.id === payload.customer_id) || moduleState.customerEditor;
    const publicSlug = payload.public_slug || createRequirementPublicSlug(payload);
    const publicToken = payload.public_token || createRequirementPublicToken();
    const savePayload = {
        customer_id: payload.customer_id,
        title: payload.title || `${customerDisplayName(customer || {})} / ${requirementTypeLabel(payload.requirement_type)}`,
        status: normalizeRequirementStatus(payload.status),
        requirement_type: payload.requirement_type,
        country: payload.country,
        requester_company: payload.requester_company,
        requester_name: payload.requester_name,
        requester_email: payload.requester_email,
        requester_phone: payload.requester_phone,
        public_slug: publicSlug,
        public_token: publicToken,
        submitted_at: payload.submitted_at || null,
        answers: normalizeRequirementAnswers(payload.answers),
        notes: payload.notes,
        is_active: payload.is_active !== false,
        updated_by: user?.id || null,
    };

    let saved = null;
    if (payload.id) {
        const { data, error } = await client.from(TABLE_REQUIREMENTS).update(savePayload).eq('id', payload.id).select('*').single();
        if (error) throw error;
        saved = data;
    } else {
        const { data, error } = await client.from(TABLE_REQUIREMENTS).insert({
            ...savePayload,
            created_by: user?.id || null,
        }).select('*').single();
        if (error) throw error;
        saved = data;
    }

    await fetchRequirementRows();
    moduleState.requirementLoadedId = text(saved?.id);
    moduleState.requirementEditor = createRequirementDraft(saved);
    return moduleState.requirementEditor;
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

async function setQuoteInstanceInactive(user, instanceId, nextStatus = 'voided') {
    if (!instanceId) throw new Error('请先选择一份报价单。');
    const current = moduleState.instances.find((item) => item.id === instanceId) || moduleState.instanceEditor;
    const previousStatus = text(current?.status);
    const fallbackStatus = previousStatus === 'published' ? 'published' : 'draft';
    const inactiveStatus = text(nextStatus).toLowerCase() === 'archived' ? 'archived' : 'voided';
    const { data, error } = await client
        .from(TABLE_INSTANCES)
        .update({
            status: inactiveStatus,
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
    if (product.is_active === false) throw new Error('已删除的产品模板不能继续生成报价单，请先恢复。');

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
            requirement_id: null,
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

async function createInstanceFromRequirement(user, requirementId, productId) {
    if (!requirementId) throw new Error('请先选择一份需求获取单。');
    const requirement = moduleState.requirementEditor?.id === requirementId
        ? createRequirementDraft(moduleState.requirementEditor)
        : await fetchRequirementEditor(requirementId);
    if (!requirementStatusReadyForQuote(requirement.status)) {
        throw new Error('请先把公开需求链接发给客户，并等待客户提交后再生成报价。');
    }
    const product = productId
        ? moduleState.productEditor?.id === productId
            ? createProductDraft(moduleState.productEditor)
            : await fetchProductEditor(productId)
        : null;
    if (!product?.id) throw new Error('请先选择一个产品模板。');
    if (product.is_active === false) throw new Error('已删除的产品模板不能继续生成报价单，请先恢复。');

    const brand = moduleState.brands.find((item) => item.id === product.brand_id);
    if (!brand?.id) throw new Error('未找到对应品牌。');

    const customer = moduleState.customers.find((item) => item.id === requirement.customer_id);
    if (!customer?.id) throw new Error('未找到需求单绑定的客户档案。');

    const notesBlock = [customer.notes, `需求获取摘要：${requirementSummaryLine(requirement)}`, text(requirement.answers?.extra_notes), requirement.notes]
        .map((entry) => text(entry))
        .filter(Boolean)
        .join('\n\n');

    const draft = createInstanceDraft({
        brand_id: brand.id,
        product_id: product.id,
        customer_id: customer.id,
        requirement_id: requirement.id,
        public_slug: createPublicSlug(brand.slug, product.slug),
        status: 'draft',
        last_active_status: 'draft',
        customer_name: customer.company_name,
        receiver_name: customer.contact_name,
        receiver_email: customer.email,
        customer_phone: customer.phone,
        customer_country: requirement.country || customer.country,
        customer_notes: notesBlock,
        default_lang: product.default_lang,
        validity_hours: product.validity_hours,
        draft_rates: product.default_rates,
        customer_snapshot: normalizeCustomerSnapshot({
            ...customer,
            country: requirement.country || customer.country,
            notes: notesBlock,
        }),
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
            customer_id: draft.customer_id || null,
            requirement_id: draft.requirement_id || null,
            public_slug: draft.public_slug,
            status: 'draft',
            last_active_status: 'draft',
            customer_name: draft.customer_name,
            receiver_name: draft.receiver_name,
            receiver_email: draft.receiver_email,
            customer_snapshot: draft.customer_snapshot,
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
        requirement_id: payload.requirement_id || null,
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

function requirementPublicUrl(publicSlug, publicToken) {
    const url = new URL('/quote/requirement.html', window.location.origin);
    if (text(publicSlug)) url.searchParams.set('req', text(publicSlug));
    if (text(publicToken)) url.searchParams.set('token', text(publicToken));
    return url.toString();
}

function adminPageUrl(page, params = {}) {
    const url = new URL('/article_management/index.html', window.location.origin);
    url.searchParams.set('page', page);
    Object.entries(params || {}).forEach(([key, value]) => {
        const normalized = text(value);
        if (normalized) url.searchParams.set(key, normalized);
    });
    return url.toString();
}

function readAdminPageParam(name) {
    try {
        return text(new URL(window.location.href).searchParams.get(name));
    } catch (_error) {
        return '';
    }
}

function clearAdminPageParams(...names) {
    try {
        const url = new URL(window.location.href);
        let changed = false;
        names.forEach((name) => {
            if (url.searchParams.has(name)) {
                url.searchParams.delete(name);
                changed = true;
            }
        });
        if (changed) window.history.replaceState({}, '', url);
    } catch (_error) {
        return;
    }
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
    const legacyPages = await ensureLegacyQuotePagesLoaded('/shared/quote-system/quote-pages.js');
    const bundles = convertLegacyPagesToSeedPayloads(legacyPages);
    const legacyTemplates = bundles
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
    if (!liveTemplates.length) {
        moduleState.baseTemplates = legacyTemplates;
        return moduleState.baseTemplates;
    }

    const liveKeys = new Set(liveTemplates.map((group) => group.key));
    moduleState.baseTemplates = [
        ...liveTemplates,
        ...legacyTemplates.filter((group) => !liveKeys.has(group.key)),
    ].sort((left, right) => {
        const leftOrder = safeNumber(PUBLIC_TEMPLATE_LIBRARY[left.key]?.order, 100);
        const rightOrder = safeNumber(PUBLIC_TEMPLATE_LIBRARY[right.key]?.order, 100);
        return leftOrder - rightOrder;
    });
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
    return moduleState.products.filter((item) => {
        if (moduleState.productBrandFilter !== 'all' && item.brand_id !== moduleState.productBrandFilter) return false;
        if (moduleState.productArchiveView) return item.is_active === false;
        return item.is_active !== false;
    });
}

function archivedProductCount() {
    return moduleState.products.filter((item) => item.is_active === false).length;
}

function activeProducts() {
    return moduleState.products.filter((item) => item.is_active !== false);
}

function filteredInstances() {
    const query = text(moduleState.instanceSearch).toLowerCase();
    return moduleState.instances.filter((item) => {
        if (moduleState.instanceRequirementFilter && text(item.requirement_id) !== text(moduleState.instanceRequirementFilter)) return false;
        if (moduleState.instanceListMode === 'archived') {
            if (item.status !== 'archived') return false;
        } else if (moduleState.instanceListMode === 'voided') {
            if (item.status !== 'voided') return false;
        } else if (item.status === 'archived' || item.status === 'voided') {
            return false;
        }
        if (moduleState.instanceStatusFilter !== 'all' && item.status !== moduleState.instanceStatusFilter) return false;
        if (!query) return true;
        const linkedRequirement = requirementById(item.requirement_id);
        const customerLabel = customerDisplayName(item.customer_snapshot || { company_name: item.customer_name, contact_name: item.receiver_name, email: item.receiver_email });
        return [
            item.customer_name,
            item.receiver_name,
            item.receiver_email,
            item.public_slug,
            productLabelById(item.product_id),
            brandLabelById(item.brand_id),
            linkedRequirement ? requirementDisplayName(linkedRequirement) : '',
            linkedRequirement ? requirementSummaryLine(linkedRequirement) : '',
            customerLabel,
        ].some((value) => text(value).toLowerCase().includes(query));
    });
}

function archivedInstanceCount() {
    return moduleState.instances.filter((item) => item.status === 'archived').length;
}

function voidedInstanceCount() {
    return moduleState.instances.filter((item) => item.status === 'voided').length;
}

function instancePaginationState() {
    const totalItems = filteredInstances().length;
    const pageSize = Math.max(1, safeNumber(moduleState.instancePageSize, 10));
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(Math.max(1, safeNumber(moduleState.instancePage, 1)), totalPages);
    moduleState.instancePage = currentPage;
    return {
        totalItems,
        pageSize,
        totalPages,
        currentPage,
        startIndex: totalItems ? ((currentPage - 1) * pageSize) + 1 : 0,
        endIndex: Math.min(currentPage * pageSize, totalItems),
    };
}

function pagedInstances() {
    const rows = filteredInstances();
    const pagination = instancePaginationState();
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    return rows.slice(start, start + pagination.pageSize);
}

function filteredCustomers() {
    const query = text(moduleState.customerSearch).toLowerCase();
    const rows = moduleState.customers.filter((customer) => {
        if (moduleState.customerArchiveView) {
            if (customer.is_active !== false) return false;
        } else if (customer.is_active === false) {
            return false;
        }
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

function archivedCustomerCount() {
    return moduleState.customers.filter((item) => item.is_active === false).length;
}

function filteredRequirements() {
    const query = text(moduleState.requirementSearch).toLowerCase();
    return moduleState.requirements.filter((requirement) => {
        if (moduleState.requirementStatusFilter !== 'all' && text(requirement.status) !== moduleState.requirementStatusFilter) return false;
        if (!query) return true;
        const customer = moduleState.customers.find((item) => item.id === requirement.customer_id);
        const preview = requirementSummaryLine(requirement).toLowerCase();
        return [
            requirement.title,
            requirement.country,
            requirement.requester_company,
            requirement.requester_name,
            requirement.requester_email,
            requirementTypeLabel(requirement.requirement_type),
            customerDisplayName(customer || {}),
            preview,
        ].some((value) => text(value).toLowerCase().includes(query));
    });
}

function requirementQuotes(requirementId = '') {
    return moduleState.instances
        .filter((item) => text(item.requirement_id) === text(requirementId))
        .sort((left, right) => text(right.updated_at).localeCompare(text(left.updated_at)));
}

function summarizeRequirementQuotes(requirementId = '') {
    return requirementQuotes(requirementId).reduce((summary, instance) => {
        summary.total_quotes += 1;
        if (instance.status === 'published') summary.published_quotes += 1;
        else if (instance.status === 'archived') summary.archived_quotes += 1;
        else if (instance.status === 'voided') summary.voided_quotes += 1;
        else summary.draft_quotes += 1;
        return summary;
    }, {
        total_quotes: 0,
        draft_quotes: 0,
        published_quotes: 0,
        archived_quotes: 0,
        voided_quotes: 0,
    });
}

function customerQuotes(customerId = '') {
    return moduleState.instances
        .filter((item) => text(item.customer_id) === text(customerId))
        .sort((left, right) => text(right.updated_at).localeCompare(text(left.updated_at)));
}

function customerRequirements(customerId = '') {
    return moduleState.requirements
        .filter((item) => text(item.customer_id) === text(customerId))
        .sort((left, right) => text(right.updated_at).localeCompare(text(left.updated_at)));
}

function requirementById(requirementId = '') {
    return moduleState.requirements.find((item) => item.id === text(requirementId)) || null;
}

function instanceRequirementOptions(instance = {}) {
    const customerId = text(instance.customer_id);
    const linkedRequirement = requirementById(instance.requirement_id);
    const rows = customerId ? customerRequirements(customerId) : [];
    if (linkedRequirement?.id && !rows.some((item) => item.id === linkedRequirement.id)) {
        return [linkedRequirement, ...rows];
    }
    return rows;
}

function requirementSummaryLine(requirement = {}) {
    const answers = normalizeRequirementAnswers(requirement.answers);
    const brandLabels = multiOptionLabels(REQUIREMENT_MULTI_OPTIONS.miner_brands, answers.miner_brands).slice(0, 2);
    const coolingLabels = multiOptionLabels(REQUIREMENT_MULTI_OPTIONS.miner_cooling, answers.miner_cooling);
    const pieces = [
        requirementTypeLabel(requirement.requirement_type),
        brandLabels.join(' / '),
        coolingLabels.join(' / '),
        optionLabel(REQUIREMENT_SELECT_OPTIONS.miner_hashrate_band, answers.miner_hashrate_band),
        optionLabel(REQUIREMENT_SELECT_OPTIONS.miner_power_band, answers.miner_power_band),
        optionLabel(REQUIREMENT_SELECT_OPTIONS.miner_quantity_band, answers.miner_quantity_band),
        optionLabel(REQUIREMENT_SELECT_OPTIONS.power_capacity_band, answers.power_capacity_band),
        text(requirement.country),
    ].map((entry) => text(entry)).filter(Boolean);
    return pieces.join(' · ');
}

function requirementCheckboxGroup(field, options = [], selectedValues = []) {
    const selected = new Set(normalizeStringList(selectedValues));
    return `
        <div class="ams-choice-grid">
            ${options.map((option) => `
                <label class="ams-social-toggle">
                    <input type="checkbox" data-requirement-check="${esc(field)}" value="${esc(option.value)}" ${selected.has(option.value) ? 'checked' : ''}>
                    <span>${esc(option.label)}</span>
                </label>
            `).join('')}
        </div>
    `;
}

function selectOptionsMarkup(options = [], current = '') {
    return options.map((option) => `<option value="${esc(option.value)}" ${text(current) === text(option.value) ? 'selected' : ''}>${esc(option.label)}</option>`).join('');
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

function publishedBrandInstances(brandId = '') {
    return moduleState.instances
        .filter((item) => text(item.brand_id) === text(brandId) && text(item.status) === 'published' && text(item.public_slug))
        .sort((left, right) => {
            const rightStamp = text(right.published_at || right.updated_at);
            const leftStamp = text(left.published_at || left.updated_at);
            return rightStamp.localeCompare(leftStamp);
        });
}

function publishedBrandInstanceLabel(instance = {}) {
    const productTitle = text(productLabelById(instance.product_id), 'Untitled product');
    const customerLabel = text(instance.customer_name || instance.receiver_name || instance.receiver_email, 'Unnamed quote');
    return `${productTitle} · ${customerLabel} · ${text(instance.public_slug)}`;
}

function brandDefaultLinkContext(brandDraft = {}) {
    const published = publishedBrandInstances(brandDraft.id);
    const current = text(brandDraft.default_quote_slug);
    const matched = published.find((item) => text(item.public_slug) === current) || null;
    const pickerValue = matched ? current : text(published[0]?.public_slug);
    const selectedInstance = matched || published.find((item) => text(item.public_slug) === pickerValue) || null;
    const overrideValue = current && !matched ? current : '';
    const effectiveSlug = text(current || pickerValue);
    const effectiveMode = overrideValue ? '手动覆盖' : effectiveSlug ? '已发布报价' : '未设置';
    return {
        published,
        pickerValue,
        overrideValue,
        selectedInstance,
        effectiveSlug,
        effectiveMode,
    };
}

async function ensureBaseData() {
    await Promise.all([fetchBrandRows(), fetchProductRows(), fetchCustomerRows(), fetchRequirementRows(), fetchInstanceRows()]);
}

function isQuoteSetupMissing(error) {
    const message = String(error?.message || '').toLowerCase();
    return (
        message.includes('quote_brands') ||
        message.includes('quote_products') ||
        message.includes('quote_product_media') ||
        message.includes('quote_requirements') ||
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
                        <span>请先在 Supabase SQL Editor 执行 <code>article_management/sql/006_quote_system.sql</code>；已有旧版库时，再补执行 <code>article_management/sql/008_quote_product_media.sql</code>、<code>article_management/sql/010_quote_customer_tracking.sql</code>、<code>article_management/sql/011_quote_send_ledger.sql</code>、<code>article_management/sql/012_quote_requirement_intake.sql</code> 和 <code>article_management/sql/013_quote_requirement_public_flow.sql</code>。</span>
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
    const key = normalized === 'published' ? 'published' : normalized === 'archived' ? 'archived' : normalized === 'voided' ? 'archived' : 'draft';
    const label = normalized === 'published' ? '已发布' : normalized === 'archived' ? '已归档' : normalized === 'voided' ? '已作废' : '草稿';
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

function productBrandLocalizedFieldGroup(field, label, value = {}) {
    const localized = normalizeLocalizedText(value);
    return `
        <div class="ams-quote-field-card">
            <div class="ams-quote-field-card-head">
                <strong>${esc(label)}</strong>
                <span>品牌共享文案</span>
            </div>
            <div class="ams-field">
                <label>中文</label>
                <textarea class="ams-textarea ams-quote-textarea" data-product-brand-i18n="${esc(field)}" data-lang="zh">${esc(localized.zh || '')}</textarea>
                <div class="ams-field-help">EN / RU 留空时会沿用中文内容。</div>
            </div>
            <details class="ams-locale-details">
                <summary>可选：多语言覆盖</summary>
                <div class="ams-site-field-grid ams-site-field-grid-wide">
                    ${['en', 'ru']
                        .map(
                            (lang) => `
                                <div class="ams-field">
                                    <label>${lang.toUpperCase()}</label>
                                    <textarea class="ams-textarea ams-quote-textarea" data-product-brand-i18n="${esc(field)}" data-lang="${esc(lang)}">${esc(localized[lang] || '')}</textarea>
                                </div>
                            `,
                        )
                        .join('')}
                </div>
            </details>
        </div>
    `;
}

function productPublishCopyPanelMarkup(product, brandDraft = {}) {
    const normalized = createProductDraft(product);
    const brand = createBrandDraft(brandDraft);
    return `
        <section class="ams-quote-block ams-quote-product-copy-panel">
            <div class="ams-section-head">
                <div>
                    <h3>发布文案</h3>
                    <p>先把客户会直接看到的标题、页头和品牌落款处理完，再往下维护汇率、配置区块和明细行。</p>
                </div>
            </div>
            <div class="ams-site-field-grid ams-site-field-grid-wide">
                <div class="ams-field">
                    <label>供应商</label>
                    <input class="ams-input" data-product-brand-field="supplier_name" value="${esc(brand.supplier_name)}" placeholder="VMAN Engineering">
                </div>
                <div class="ams-field">
                    <label>发件邮箱</label>
                    <input class="ams-input" data-product-brand-field="sender_email" value="${esc(brand.sender_email)}" placeholder="sales@example.com">
                </div>
                <div class="ams-field">
                    <label>邮件主题署名</label>
                    <input class="ams-input" data-product-brand-field="subject_name" value="${esc(brand.subject_name)}" placeholder="VMAN Engineering">
                </div>
            </div>
            <div class="ams-quote-product-copy-grid">
                ${localizedFieldGroup('product:public_title', '产品标题', normalized.public_title)}
                ${productBrandLocalizedFieldGroup('overview_title', '页面页头标题', brand.overview_title)}
                ${productBrandLocalizedFieldGroup('footer_note', '页脚说明', brand.footer_note)}
            </div>
        </section>
    `;
}

function brandDefaultLinkPanelMarkup(brandDraft = {}) {
    const context = brandDefaultLinkContext(brandDraft);
    const selectedHint = context.selectedInstance
        ? `${publishedBrandInstanceLabel(context.selectedInstance)} · 发布于 ${fmtDate(context.selectedInstance.published_at || context.selectedInstance.updated_at)}`
        : context.published.length
            ? '请选择一个已发布报价作为品牌默认入口。'
            : '当前品牌还没有已发布报价，可先手动覆盖。';
    return `
        <div class="ams-quote-block ams-brand-default-link-panel">
            <div class="ams-section-head">
                <div>
                    <h3>默认链接</h3>
                    <p>优先从当前品牌的已发布报价中选择默认入口；如需特殊跳转，可再手动覆盖 slug。</p>
                </div>
                <div class="ams-row-actions">
                    <button class="ams-btn ams-btn-muted" type="button" id="ams-brand-default-link-autofill" ${context.published.length ? '' : 'disabled'}>带入最新已发布</button>
                    <button class="ams-btn ams-btn-muted" type="button" id="ams-brand-default-link-clear-override">清除覆盖</button>
                </div>
            </div>
            <div class="ams-brand-default-link-row">
                <div class="ams-field">
                    <label>已发布报价</label>
                    <select class="ams-select" data-brand-default-picker ${context.published.length ? '' : 'disabled'}>
                        <option value="">${context.published.length ? '请选择已发布报价' : '当前品牌暂无已发布报价'}</option>
                        ${context.published
                            .map(
                                (instance) => `
                                    <option value="${esc(instance.public_slug)}" ${context.pickerValue === text(instance.public_slug) ? 'selected' : ''}>${esc(publishedBrandInstanceLabel(instance))}</option>
                                `,
                            )
                            .join('')}
                    </select>
                    <div class="ams-field-help" data-brand-default-picker-hint>${esc(selectedHint)}</div>
                </div>
                <div class="ams-field">
                    <label>手动覆盖 slug</label>
                    <input class="ams-input" data-brand-default-override value="${esc(context.overrideValue)}" placeholder="${esc(context.pickerValue || 'quote-public-slug')}">
                    <div class="ams-field-help">留空时跟随上面的已发布报价；填写后优先使用这里。</div>
                </div>
                <div class="ams-brand-default-link-meta">
                    <strong>当前生效</strong>
                    <span data-brand-default-effective>${esc(context.effectiveSlug || '--')}</span>
                    <small class="ams-brand-default-link-status" data-brand-default-mode>${esc(context.effectiveMode)}</small>
                </div>
            </div>
        </div>
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

function productVisualEditorSurfaceMarkup(product, brandDraft = {}) {
    const normalized = createProductDraft(product);
    const brand = createBrandDraft(brandDraft);
    const rates = normalizeRates(normalized.default_rates);
    const sections = normalizeSectionConfig(normalized.section_config);
    const overviewTitle = pickLocalized(brand.overview_title, DEFAULT_LANG, '未设置页头标题');
    const productTitle = pickLocalized(normalized.public_title, normalized.default_lang, normalized.product_code || normalized.slug || '未设置产品标题');
    const footerNote = pickLocalized(brand.footer_note, DEFAULT_LANG, '未设置页脚说明');
    return `
        <section class="ams-quote-visual-shell ams-instance-visual-shell" id="ams-product-visual-editor">
            <div class="ams-quote-visual-stage">
                <div class="ams-quote-visual-header">
                    <div class="ams-quote-visual-title-panel ams-quote-visual-title-panel-static">
                        <span class="ams-quote-visual-kicker">已发布页头摘要</span>
                        <strong class="ams-quote-visual-preview-title">${esc(overviewTitle)}</strong>
                        <div class="ams-quote-visual-preview-meta">
                            <div class="ams-quote-visual-preview-chip">
                                <strong>产品标题</strong>
                                <span>${esc(productTitle)}</span>
                            </div>
                            <div class="ams-quote-visual-preview-chip">
                                <strong>供应商</strong>
                                <span>${esc(text(brand.supplier_name, '--'))}</span>
                            </div>
                            <div class="ams-quote-visual-preview-chip">
                                <strong>发件邮箱</strong>
                                <span>${esc(text(brand.sender_email, '--'))}</span>
                            </div>
                            <div class="ams-quote-visual-preview-chip">
                                <strong>页脚说明</strong>
                                <span>${esc(footerNote)}</span>
                            </div>
                        </div>
                        <div class="ams-field-help">标题、多语言页头和品牌落款已前置到上方“发布文案”面板。</div>
                        ${quoteUiTextMarkup('product', normalized.ui_text)}
                    </div>
                    <div class="ams-quote-visual-rates-card">
                        <div class="ams-quote-visual-rates-head">
                            <strong>默认汇率</strong>
                            <span>直接改这里，生成报价单时会自动带入。</span>
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
    const rows = filteredBrands();
    return rows.length
        ? rows
              .map(
                  (brand) => `
                <button class="ams-quote-list-card ${brand.id === moduleState.brandEditor.id ? 'is-active' : ''}" type="button" data-brand-edit="${esc(brand.id)}">
                    <strong>${esc(brand.display_name || brand.brand_name)}</strong>
                    <span>${esc(brand.slug)}</span>
                    <em>${brand.is_active === false ? '已归档' : '启用中'} · 默认链接 ${esc(brand.default_quote_slug || '--')}</em>
                </button>
            `,
              )
              .join('')
        : `<div class="ams-empty">${moduleState.brandArchiveView ? '当前没有已归档品牌。' : '当前没有有效品牌。'}</div>`;
}

function filteredBrands() {
    if (moduleState.brandArchiveView) return moduleState.brands.filter((item) => item.is_active === false);
    return moduleState.brands.filter((item) => item.is_active !== false);
}

function archivedBrandCount() {
    return moduleState.brands.filter((item) => item.is_active === false).length;
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

function renderProductListCards() {
    const rows = filteredProducts();
    return rows.length
        ? rows
              .map(
                  (product) => `
                <article class="ams-quote-list-card-shell ${product.id === moduleState.productEditor.id ? 'is-active' : ''}">
                    <button class="ams-quote-list-card ${product.id === moduleState.productEditor.id ? 'is-active' : ''}" type="button" data-product-edit="${esc(product.id)}">
                        <strong>${esc(pickLocalized(product.public_title, product.default_lang, product.slug))}</strong>
                        <span>${esc(product.slug)} 路 ${esc(brandLabelById(product.brand_id))}</span>
                        <em>${product.is_active === false ? '已删除' : '启用中'} 路 有效期 ${esc(product.validity_hours)} 小时</em>
                    </button>
                    <div class="ams-quote-list-card-actions">
                        ${
                            product.is_active === false
                                ? `<button class="ams-btn ams-btn-muted" type="button" data-product-restore="${esc(product.id)}">恢复</button>`
                                : `<button class="ams-btn ams-btn-danger" type="button" data-product-archive="${esc(product.id)}">删除</button>`
                        }
                    </div>
                </article>
            `,
              )
              .join('')
        : '<div class="ams-empty">当前筛选下没有产品模板。</div>';
}

function renderInstanceList() {
    const rows = pagedInstances();
    return rows.length
        ? rows
              .map((quote) => {
                  const linkedRequirement = requirementById(quote.requirement_id);
                  const syncLabel = quote.published_at ? `发布于 ${fmtDate(quote.published_at)}` : `更新于 ${fmtDate(quote.updated_at)}`;
                  const relationshipLine = [
                      customerDisplayName(quote.customer_snapshot || { company_name: quote.customer_name, contact_name: quote.receiver_name, email: quote.receiver_email }),
                      linkedRequirement ? `需求：${requirementDisplayName(linkedRequirement)}` : '',
                  ].filter(Boolean).join(' · ');
                  return `
                <article class="ams-quote-list-card-shell ${quote.id === moduleState.instanceEditor.id ? 'is-active' : ''}">
                    <button class="ams-quote-list-card ${quote.id === moduleState.instanceEditor.id ? 'is-active' : ''}" type="button" data-instance-edit="${esc(quote.id)}">
                        <strong>${esc(quote.customer_name || productLabelById(quote.product_id) || quote.public_slug)}</strong>
                        <span>${esc(brandLabelById(quote.brand_id))} · ${esc(productLabelById(quote.product_id))}</span>
                        <span class="ams-quote-inline-submeta">${esc(relationshipLine)}</span>
                        <em>${statusPill(quote.status)} <span class="ams-quote-inline-meta">${esc(syncLabel)}</span></em>
                    </button>
                    <div class="ams-quote-list-card-actions">
                        ${
                            quote.status === 'archived' || quote.status === 'voided'
                                ? `<button class="ams-btn ams-btn-muted" type="button" data-instance-restore="${esc(quote.id)}">恢复</button>`
                                : `
                                    <button class="ams-btn ams-btn-muted" type="button" data-instance-archive="${esc(quote.id)}">归档</button>
                                    <button class="ams-btn ams-btn-danger" type="button" data-instance-void="${esc(quote.id)}">作废</button>
                                `
                        }
                    </div>
                </article>
            `;
              })
              .join('')
        : '<div class="ams-empty">当前筛选下没有报价单。</div>';
}

function quoteManagementFold(title, description, body, open = false) {
    return `
        <details class="ams-quote-management-fold"${open ? ' open' : ''}>
            <summary>
                <span>${esc(title)}</span>
                <small>${esc(description)}</small>
            </summary>
            <div class="ams-quote-management-fold-body">
                ${body}
            </div>
        </details>
    `;
}

function renderCustomerList() {
    const rows = filteredCustomers();
    return rows.length
        ? rows
              .map((customer) => {
                  const quoteSummary = summarizeCustomerQuotes(customer.id);
                  const requirementSummary = summarizeCustomerRequirements(customer.id);
                  return `
                    <article class="ams-customer-list-card-shell">
                        <button class="ams-quote-list-card ${moduleState.customerLoadedId === customer.id ? 'active' : ''}" type="button" data-customer-edit="${esc(customer.id)}">
                            <strong>${esc(customerDisplayName(customer))}</strong>
                            <span>${esc(text(customer.contact_name || customer.email || customer.phone, '未填写联系人'))}</span>
                            <span class="ams-quote-inline-submeta">${esc(text(customer.email || customer.phone || customer.country, '未填写联系信息'))}</span>
                            <em>${requirementSummary.total_requirements} 份需求单 / ${quoteSummary.total_quotes} 份报价单 <span class="ams-quote-inline-meta">${quoteSummary.published_quotes} 已发布 / ${quoteSummary.archived_quotes} 已归档 / ${quoteSummary.voided_quotes} 已作废</span></em>
                        </button>
                        <div class="ams-quote-list-card-actions">
                            ${
                                customer.is_active === false
                                    ? `<button class="ams-btn ams-btn-muted" type="button" data-customer-restore="${esc(customer.id)}">恢复</button>`
                                    : `<button class="ams-btn ams-btn-danger" type="button" data-customer-archive="${esc(customer.id)}">归档</button>`
                            }
                        </div>
                    </article>
                `;
              })
              .join('')
        : `<div class="ams-empty">${moduleState.customerArchiveView ? '当前没有已归档客户。' : '当前没有有效客户档案。'}</div>`;
}

function requirementStatusPill(status = 'draft') {
    const normalized = normalizeRequirementStatus(status);
    const tone = normalized === 'quoted' ? 'published' : normalized === 'closed' ? 'archived' : normalized === 'submitted' ? 'warning' : 'draft';
    return `<span class="ams-status-pill ams-status-${tone}">${esc(requirementStatusLabel(normalized))}</span>`;
}

function renderRequirementList() {
    const rows = filteredRequirements();
    return rows.length
        ? rows
              .map((requirement) => {
                  const customer = moduleState.customers.find((item) => item.id === requirement.customer_id);
                  const quoteSummary = summarizeRequirementQuotes(requirement.id);
                  const contactLabel = text(requirement.requester_name || requirement.requester_email || requirement.requester_phone || customer?.contact_name, '未填写联系人');
                  return `
                    <article class="ams-customer-list-card-shell">
                        <button class="ams-quote-list-card ${moduleState.requirementLoadedId === requirement.id ? 'active' : ''}" type="button" data-requirement-edit="${esc(requirement.id)}">
                            <strong>${esc(requirementDisplayName(requirement))}</strong>
                            <span>${esc(text(requirement.requester_company || customerDisplayName(customer || {})))}</span>
                            <span class="ams-quote-inline-submeta">${esc(requirementSummaryLine(requirement) || '待补充需求摘要')}</span>
                            <em>${requirementStatusPill(requirement.status)} <span class="ams-quote-inline-meta">${esc(contactLabel)} / ${esc(quoteSummary.total_quotes)} 份关联报价 / ${esc(fmtDate(requirement.submitted_at || requirement.updated_at))}</span></em>
                        </button>
                        ${quoteSummary.total_quotes
                            ? `<div class="ams-quote-list-card-actions"><button class="ams-btn ams-btn-muted" type="button" data-requirement-open-instances="${esc(requirement.id)}">查看报价单</button></div>`
                            : ''}
                    </article>
                `;
              })
              .join('')
        : '<div class="ams-empty">当前没有需求获取单。</div>';
}

function requirementQuoteListMarkup(requirementId = '') {
    const rows = requirementQuotes(requirementId);
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
                                <button class="ams-btn ams-btn-muted" type="button" data-requirement-quote-open="${esc(quote.id)}">后台查看</button>
                                ${quote.status === 'published'
                                    ? `<button class="ams-btn ams-btn-warning" type="button" data-requirement-quote-public="${esc(quote.public_slug)}">客户页</button>`
                                    : ''}
                            </div>
                        </div>
                    </article>
                `)
              .join('')
        : '<div class="ams-empty">这份需求单还没有生成报价单。</div>';
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

function customerRequirementListMarkup(customerId = '') {
    const rows = customerRequirements(customerId);
    return rows.length
        ? rows
              .map((requirement) => {
                  const quoteSummary = summarizeRequirementQuotes(requirement.id);
                  return `
                    <article class="ams-customer-quote-row">
                        <div class="ams-customer-quote-copy">
                            <strong>${esc(requirementDisplayName(requirement))}</strong>
                            <span>${esc(requirementSummaryLine(requirement) || '待补充需求摘要')}</span>
                            <span class="ams-quote-inline-submeta">${requirementStatusPill(requirement.status)} <span class="ams-quote-inline-meta">${esc(quoteSummary.total_quotes)} 份关联报价</span></span>
                        </div>
                        <div class="ams-customer-quote-meta">
                            <time>${esc(fmtDate(requirement.updated_at))}</time>
                            <div class="ams-row-actions">
                                <button class="ams-btn ams-btn-muted" type="button" data-customer-requirement-open="${esc(requirement.id)}">查看需求单</button>
                            </div>
                        </div>
                    </article>
                `;
              })
              .join('')
        : '<div class="ams-empty">这个客户还没有需求获取单。</div>';
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
                <span class="ams-summary-chip"><strong>关联需求单</strong><span>${esc(summary.total_requirements)}</span></span>
                <span class="ams-summary-chip"><strong>待跟进需求</strong><span>${esc(summary.open_requirements)}</span></span>
                <span class="ams-summary-chip"><strong>已转报价需求</strong><span>${esc(summary.quoted_requirements)}</span></span>
                <span class="ams-summary-chip"><strong>关联报价单</strong><span>${esc(summary.total_quotes)}</span></span>
                <span class="ams-summary-chip"><strong>草稿</strong><span>${esc(summary.draft_quotes)}</span></span>
                <span class="ams-summary-chip"><strong>已发布</strong><span>${esc(summary.published_quotes)}</span></span>
                <span class="ams-summary-chip"><strong>已归档</strong><span>${esc(summary.archived_quotes)}</span></span>
                <span class="ams-summary-chip"><strong>已作废</strong><span>${esc(summary.voided_quotes)}</span></span>
                <span class="ams-summary-chip"><strong>总浏览</strong><span>${esc(summary.total_views)}</span></span>
                <span class="ams-summary-chip"><strong>分享访问</strong><span>${esc(summary.share_views)}</span></span>
                <span class="ams-summary-chip"><strong>登录浏览</strong><span>${esc(summary.logged_in_views)}</span></span>
                <span class="ams-summary-chip"><strong>匿名浏览</strong><span>${esc(summary.anonymous_views)}</span></span>
                <span class="ams-summary-chip"><strong>分享次数</strong><span>${esc(summary.share_links)}</span></span>
                <span class="ams-summary-chip"><strong>邮件触发</strong><span>${esc(summary.email_clicks)}</span></span>
                <span class="ams-summary-chip"><strong>发送台账</strong><span>${esc(sendHistory.length)}</span></span>
                <span class="ams-summary-chip"><strong>最近浏览</strong><span>${esc(fmtDate(summary.last_viewed_at))}</span></span>
                <span class="ams-summary-chip"><strong>最近需求更新</strong><span>${esc(fmtDate(summary.last_requirement_updated_at))}</span></span>
                <span class="ams-summary-chip"><strong>最近报价更新</strong><span>${esc(fmtDate(summary.last_quote_updated_at))}</span></span>
            </div>
            <div class="ams-quote-block">
                <div class="ams-section-head"><div><h3>需求获取单</h3><p>这里列出这名客户当前绑定的全部需求单，用来衔接“客户 -> 需求 -> 报价”。</p></div></div>
                <div class="ams-customer-quote-list">${customerRequirementListMarkup(customerId)}</div>
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
    const linkedRequirement = requirementById(moduleState.instanceEditor.requirement_id);
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
                    <h3>发送与查看记录</h3>
                    <p>这里专门回答三件事：这份报价发给谁，谁负责跟进，以及客户后来有没有打开看过。</p>
                </div>
            </div>
            <div class="ams-summary-row">
                <span class="ams-summary-chip"><strong>客户档案</strong><span>${esc(customerDisplayName(currentCustomer || buildInstanceCustomerSnapshot(moduleState.instanceEditor)))}</span></span>
                <span class="ams-summary-chip"><strong>关联需求单</strong><span>${esc(linkedRequirement ? requirementDisplayName(linkedRequirement) : '未绑定')}</span></span>
                <span class="ams-summary-chip"><strong>当前发给谁</strong><span>${esc(shareSummary.recipient)}</span></span>
                <span class="ams-summary-chip"><strong>负责销售</strong><span>${esc(shareSummary.owner)}</span></span>
                <span class="ams-summary-chip"><strong>发送记录</strong><span>${esc(shareSummary.send_count)} 条</span></span>
                <span class="ams-summary-chip"><strong>总浏览</strong><span>${esc(summary.total_views)}</span></span>
                <span class="ams-summary-chip"><strong>客户打开</strong><span>${esc(summary.share_views)}</span></span>
                <span class="ams-summary-chip"><strong>后台预览</strong><span>${esc(summary.admin_views)}</span></span>
                <span class="ams-summary-chip"><strong>链接发送</strong><span>${esc(summary.share_links)}</span></span>
                <span class="ams-summary-chip"><strong>邮件发送</strong><span>${esc(summary.email_clicks)}</span></span>
                <span class="ams-summary-chip"><strong>最近发送</strong><span>${esc(fmtDate(summary.last_shared_at))}</span></span>
                <span class="ams-summary-chip"><strong>最近浏览</strong><span>${esc(fmtDate(summary.last_viewed_at))}</span></span>
            </div>
            <div class="ams-quote-block">
                <div class="ams-section-head"><div><h3>发送记录</h3><p>每一条都代表一次对外发送动作，能看出当时发给谁、谁负责，以及后续结果。</p></div></div>
                ${sendLedgerNote}
                <div class="ams-quote-event-timeline">${renderShareHistoryList(sendHistory, { editable: true })}</div>
            </div>
            <div class="ams-quote-block">
                <div class="ams-section-head"><div><h3>查看记录</h3><p>这里记录客户打开链接、后台预览和其他访问动作，用来判断这份报价有没有被真正查看。</p></div></div>
                <div class="ams-quote-event-timeline">${timeline}</div>
            </div>
        </section>
    `;
}

function bindBrandEditor(input) {
    const content = document.getElementById('ams-content');
    if (!content) return;
    const legacyDefaultLinkPanel = content.querySelector('.ams-brand-default-link-panel');
    if (legacyDefaultLinkPanel) {
        legacyDefaultLinkPanel.outerHTML = brandDefaultLinkPanelMarkup(moduleState.brandEditor);
    }
    const displayNameField = () => content.querySelector('[data-brand-field="display_name"]');
    const defaultLinkPicker = () => content.querySelector('[data-brand-default-picker]');
    const defaultLinkOverride = () => content.querySelector('[data-brand-default-override]');
    const defaultLinkHint = () => content.querySelector('[data-brand-default-picker-hint]');
    const defaultLinkEffective = () => content.querySelector('[data-brand-default-effective]');
    const defaultLinkMode = () => content.querySelector('[data-brand-default-mode]');
    const syncDisplayNameFromBrandName = (value) => {
        moduleState.brandEditor.display_name = text(value);
        const displayNode = displayNameField();
        if (displayNode && displayNode.value !== moduleState.brandEditor.display_name) {
            displayNode.value = moduleState.brandEditor.display_name;
        }
    };
    const applyBrandDefaultLinkValue = () => {
        const pickerValue = text(defaultLinkPicker()?.value);
        const overrideValue = text(defaultLinkOverride()?.value);
        const selectedInstance = publishedBrandInstances(moduleState.brandEditor.id).find((item) => text(item.public_slug) === pickerValue) || null;
        const effectiveSlug = text(overrideValue || pickerValue);
        const pickerHint = selectedInstance
            ? `${publishedBrandInstanceLabel(selectedInstance)} · 发布于 ${fmtDate(selectedInstance.published_at || selectedInstance.updated_at)}`
            : pickerValue
                ? `已选择 ${pickerValue}`
                : '当前品牌还没有已发布报价，可先手动覆盖。';
        moduleState.brandEditor.default_quote_slug = effectiveSlug;
        if (defaultLinkHint()) defaultLinkHint().textContent = pickerHint;
        if (defaultLinkEffective()) defaultLinkEffective().textContent = effectiveSlug || '--';
        if (defaultLinkMode()) defaultLinkMode().textContent = overrideValue ? '手动覆盖' : effectiveSlug ? '已发布报价' : '未设置';
    };
    const syncDefaultLinkField = (force = false) => {
        if (moduleState.brandDefaultLinkTouched && !force) return;
        const candidate = latestPublishedQuoteSlugForBrand(moduleState.brandEditor.id);
        if (!candidate && !force) {
            applyBrandDefaultLinkValue();
            return;
        }
        if (defaultLinkPicker()) defaultLinkPicker().value = candidate;
        if (defaultLinkOverride()) defaultLinkOverride().value = '';
        moduleState.brandEditor.default_quote_slug = candidate;
        applyBrandDefaultLinkValue();
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

    defaultLinkPicker()?.addEventListener('change', () => {
        moduleState.brandDefaultLinkTouched = true;
        applyBrandDefaultLinkValue();
    });

    defaultLinkOverride()?.addEventListener('input', () => {
        moduleState.brandDefaultLinkTouched = true;
        applyBrandDefaultLinkValue();
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

    document.getElementById('ams-quote-brand-archive-entry')?.addEventListener('click', () => {
        moduleState.brandArchiveView = !moduleState.brandArchiveView;
        if (moduleState.brandArchiveView && moduleState.brandEditor?.is_active !== false) {
            const archived = moduleState.brands.find((item) => item.is_active === false);
            if (archived) moduleState.brandEditor = createBrandDraft(archived);
        }
        if (!moduleState.brandArchiveView && moduleState.brandEditor?.is_active === false) {
            const active = moduleState.brands.find((item) => item.is_active !== false);
            moduleState.brandEditor = createBrandDraft(active || {});
        }
        moduleState.brandDisplayNameTouched = false;
        moduleState.brandDefaultLinkTouched = false;
        void renderQuoteBrandsPage(input);
    });

    document.getElementById('ams-quote-brand-archive-current')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '归档中...', async () => {
            try {
                await saveBrandDraft(input.user, {
                    ...moduleState.brandEditor,
                    is_active: false,
                });
                input.showToast('品牌已归档。');
                await renderQuoteBrandsPage(input);
            } catch (error) {
                input.showToast(error.message || '归档品牌失败。', true);
            }
        });
    });

    document.getElementById('ams-quote-brand-restore-current')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '恢复中...', async () => {
            try {
                await saveBrandDraft(input.user, {
                    ...moduleState.brandEditor,
                    is_active: true,
                });
                input.showToast('品牌已恢复。');
                moduleState.brandArchiveView = false;
                await renderQuoteBrandsPage(input);
            } catch (error) {
                input.showToast(error.message || '恢复品牌失败。', true);
            }
        });
    });

    document.getElementById('ams-brand-default-link-autofill')?.addEventListener('click', () => {
        moduleState.brandDefaultLinkTouched = false;
        syncDefaultLinkField(true);
    });

    document.getElementById('ams-brand-default-link-clear-override')?.addEventListener('click', () => {
        if (defaultLinkOverride()) defaultLinkOverride().value = '';
        moduleState.brandDefaultLinkTouched = true;
        applyBrandDefaultLinkValue();
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
    const archiveView = moduleState.brandArchiveView === true;
    const visibleBrandCount = filteredBrands().length;
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
        <div class="ams-inline-actions" style="margin: 0 0 16px;">
            <button class="ams-btn ${archiveView ? 'ams-btn-primary' : 'ams-btn-muted'}" type="button" id="ams-quote-brand-archive-entry">${archiveView ? '返回主列表' : `归档列表（${archivedBrandCount()}）`}</button>
            <span class="ams-field-help">${archiveView ? '这里只显示已归档品牌，可恢复继续使用。' : '默认只显示有效品牌，已归档品牌收纳在单独列表。'}</span>
        </div>
        <section class="ams-quote-layout">
            <aside class="ams-card ams-quote-list-panel">
                <div class="ams-section-head"><div><h3>${archiveView ? '已归档品牌' : '品牌列表'}</h3><p>共 ${visibleBrandCount} 个${archiveView ? '归档品牌' : '有效品牌'}</p></div></div>
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
                ${
                    moduleState.brandEditor.id
                        ? `
                    <div class="ams-inline-actions">
                        ${
                            moduleState.brandEditor.is_active === false
                                ? '<button class="ams-btn ams-btn-muted" type="button" id="ams-quote-brand-restore-current">恢复品牌</button>'
                                : '<button class="ams-btn ams-btn-danger" type="button" id="ams-quote-brand-archive-current">归档品牌</button>'
                        }
                        <span class="ams-field-help">${moduleState.brandEditor.is_active === false ? '已归档品牌默认不再出现在主列表、模板选择和报价入口。' : '归档后品牌会从默认列表和新建入口中隐藏，但历史数据仍保留。'}</span>
                    </div>
                `
                        : ''
                }
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

    document.getElementById('ams-quote-product-brand-filter')?.addEventListener('change', (event) => {
        moduleState.productBrandFilter = event.currentTarget.value || 'all';
        void withQuoteBusy('正在刷新模板列表...', async () => {
            await renderQuoteProductsPage(input);
        });
    });

    document.getElementById('ams-quote-product-archive-entry')?.addEventListener('click', () => {
        moduleState.productArchiveView = !moduleState.productArchiveView;
        void withQuoteBusy(moduleState.productArchiveView ? '正在切换到已删除模板...' : '正在返回模板主列表...', async () => {
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

    document.querySelectorAll('[data-product-archive]').forEach((button) => {
        button.addEventListener('click', async () => {
            if (!window.confirm('删除后会从默认模板列表中隐藏，但不会删除已生成的报价单。确定继续吗？')) return;
            try {
                await withQuoteBusy('正在删除产品模板...', async () => {
                    await archiveProductTemplate(input.user, button.dataset.productArchive);
                    await renderQuoteProductsPage(input);
                }, button, '删除会隐藏模板入口，但不会影响已经生成的报价单快照。');
                input.showToast('产品模板已删除。');
            } catch (error) {
                input.showToast(error.message || '删除产品模板失败。', true);
            }
        });
    });

    document.querySelectorAll('[data-product-restore]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await withQuoteBusy('正在恢复产品模板...', async () => {
                    await restoreProductTemplate(input.user, button.dataset.productRestore);
                    await renderQuoteProductsPage(input);
                }, button, '恢复后模板会重新出现在主列表和报价单新建入口中。');
                input.showToast('产品模板已恢复。');
            } catch (error) {
                input.showToast(error.message || '恢复产品模板失败。', true);
            }
        });
    });

    document.getElementById('ams-quote-product-archive-current')?.addEventListener('click', async (event) => {
        if (!window.confirm('删除后会从默认模板列表中隐藏，但不会删除已生成的报价单。确定继续吗？')) return;
        await input.withButtonBusy(event.currentTarget, '删除中...', async () => {
            try {
                await archiveProductTemplate(input.user, moduleState.productEditor.id);
                input.showToast('产品模板已删除。');
                await renderQuoteProductsPage(input);
            } catch (error) {
                input.showToast(error.message || '删除产品模板失败。', true);
            }
        });
    });

    document.getElementById('ams-quote-product-restore-current')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '恢复中...', async () => {
            try {
                await restoreProductTemplate(input.user, moduleState.productEditor.id);
                input.showToast('产品模板已恢复。');
                await renderQuoteProductsPage(input);
            } catch (error) {
                input.showToast(error.message || '恢复产品模板失败。', true);
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
    const archiveView = moduleState.productArchiveView === true;
    const visibleProductCount = filteredProducts().length;
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
        <div class="ams-inline-actions" style="margin: 0 0 16px;">
            <button class="ams-btn ${archiveView ? 'ams-btn-primary' : 'ams-btn-muted'}" type="button" id="ams-quote-product-archive-entry">${archiveView ? '返回主列表' : `已删除列表（${archivedProductCount()}）`}</button>
            <span class="ams-field-help">${archiveView ? '这里只显示已删除模板，可恢复继续使用。' : '默认只显示有效模板，已删除模板收纳在单独列表。'}</span>
        </div>
        <section class="ams-quote-layout">
            <aside class="ams-card ams-quote-list-panel">
                <div class="ams-section-head">
                    <div><h3>${archiveView ? '已删除模板' : '模板列表'}</h3><p>品牌筛选后共 ${visibleProductCount} 个模板</p></div>
                </div>
                <div class="ams-field">
                    <label>品牌筛选</label>
                    <select id="ams-quote-product-brand-filter" class="ams-select">
                        <option value="all" ${moduleState.productBrandFilter === 'all' ? 'selected' : ''}>全部品牌</option>
                        ${moduleState.brands.map((brand) => `<option value="${esc(brand.id)}" ${moduleState.productBrandFilter === brand.id ? 'selected' : ''}>${esc(brand.display_name)}</option>`).join('')}
                    </select>
                </div>
                <div class="ams-quote-list">${renderProductListCards()}</div>
            </aside>
            <section class="ams-card ams-quote-editor-panel ams-product-editor-panel">
                <div class="ams-section-head">
                    <div>
                        <h3>${moduleState.productEditor.id ? '编辑产品模板' : '新建产品模板'}</h3>
                        <p>模板只做默认值来源，不直接给客户使用。</p>
                    </div>
                    <div class="ams-row-actions">
                        <button class="ams-btn ams-btn-muted" type="button" id="ams-quote-product-create-instance">从模板生成报价单</button>
                        <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-product-save">保存模板</button>
                    </div>
                </div>
                ${
                    moduleState.productEditor.id
                        ? `
                    ${
                        moduleState.productEditor.is_active === false
                            ? '<div class="ams-field-help" style="margin-bottom: 12px;">已删除模板默认不再出现在主列表和新建报价入口。</div>'
                            : '<div class="ams-inline-actions" style="margin-bottom: 12px;"><button class="ams-btn ams-btn-danger" type="button" id="ams-quote-product-archive-current">删除模板</button><span class="ams-field-help">删除只会隐藏模板入口，不会删除已生成报价单。</span></div>'
                    }
                `
                        : ''
                }
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
                ${productPublishCopyPanelMarkup(moduleState.productEditor, currentProductBrandDraft())}
                ${productVisualEditorSurfaceMarkup(moduleState.productEditor, currentProductBrandDraft())}
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
            input.showToast('先从左侧选择一份报价单，再进入可视化编辑。', true);
            return;
        }
        window.open(quoteEditorUrl('instance', moduleState.instanceEditor.id), '_blank', 'noopener');
    });

    document.getElementById('ams-quote-instance-search')?.addEventListener('input', (event) => {
        moduleState.instanceSearch = event.currentTarget.value || '';
        moduleState.instancePage = 1;
        void withQuoteBusy('正在刷新报价单列表...', async () => {
            await renderQuoteInstancesPage(input);
        });
    });
    document.getElementById('ams-quote-instance-clear-requirement-filter')?.addEventListener('click', () => {
        moduleState.instanceRequirementFilter = '';
        moduleState.instancePage = 1;
        void withQuoteBusy('正在返回全部报价单...', async () => {
            await renderQuoteInstancesPage(input);
        });
    });
    document.querySelectorAll('[data-instance-list-mode]').forEach((button) => {
        button.addEventListener('click', () => {
            const nextMode = text(button.dataset.instanceListMode, 'active');
            moduleState.instanceListMode = nextMode;
            moduleState.instanceStatusFilter = 'all';
            moduleState.instancePage = 1;
            const busyLabel = nextMode === 'archived'
                ? '正在打开归档报价单...'
                : nextMode === 'voided'
                    ? '正在打开作废报价单...'
                    : '正在返回报价单列表...';
            void withQuoteBusy(busyLabel, async () => {
                await renderQuoteInstancesPage(input);
            });
        });
    });
    document.getElementById('ams-quote-instance-status-filter')?.addEventListener('change', (event) => {
        moduleState.instanceStatusFilter = event.currentTarget.value || 'all';
        moduleState.instancePage = 1;
        void withQuoteBusy('正在刷新报价单列表...', async () => {
            await renderQuoteInstancesPage(input);
        });
    });
    document.getElementById('ams-quote-instance-page-prev')?.addEventListener('click', () => {
        moduleState.instancePage = Math.max(1, safeNumber(moduleState.instancePage, 1) - 1);
        void renderQuoteInstancesPage(input);
    });
    document.getElementById('ams-quote-instance-page-next')?.addEventListener('click', () => {
        const pagination = instancePaginationState();
        moduleState.instancePage = Math.min(pagination.totalPages, safeNumber(moduleState.instancePage, 1) + 1);
        void renderQuoteInstancesPage(input);
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
                    await setQuoteInstanceInactive(input.user, button.dataset.instanceArchive, 'archived');
                    await fetchInstanceAnalytics(button.dataset.instanceArchive);
                    await renderQuoteInstancesPage(input);
                }, button, '归档代表这份报价单已经完成收口，默认退出主编辑列表，但历史链路和浏览记录都会保留。');
                input.showToast('报价单已归档。');
            } catch (error) {
                input.showToast(error.message || '归档报价单失败。', true);
            }
        });
    });

    document.querySelectorAll('[data-instance-void]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await withQuoteBusy('正在作废报价单...', async () => {
                    await setQuoteInstanceInactive(input.user, button.dataset.instanceVoid, 'voided');
                    await fetchInstanceAnalytics(button.dataset.instanceVoid);
                    await renderQuoteInstancesPage(input);
                }, button, '作废代表这份报价单不再继续使用，会从主业务入口移出，但历史链路和浏览记录仍然保留。');
                input.showToast('报价单已作废。');
            } catch (error) {
                input.showToast(error.message || '作废报价单失败。', true);
            }
        });
    });

    document.querySelectorAll('[data-instance-restore]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await withQuoteBusy('正在恢复报价单...', async () => {
                    await restoreQuoteInstance(input.user, button.dataset.instanceRestore);
                    moduleState.instanceListMode = 'active';
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
        if (text(moduleState.instanceEditor.customer_id)) {
            void renderQuoteInstancesPage(input);
            return;
        }
        const customerId = event.currentTarget.value || '';
        moduleState.instanceEditor.customer_id = customerId;
        const availableRequirements = instanceRequirementOptions(moduleState.instanceEditor);
        if (!availableRequirements.some((item) => item.id === moduleState.instanceEditor.requirement_id)) {
            moduleState.instanceEditor.requirement_id = '';
        }
        if (!customerId) {
            void renderQuoteInstancesPage(input);
            return;
        }
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
        syncInstanceSalesOwner(moduleState.instanceEditor, input.user);
        void renderQuoteInstancesPage(input);
    });

    document.getElementById('ams-quote-instance-requirement-select')?.addEventListener('change', (event) => {
        if (text(moduleState.instanceEditor.requirement_id)) {
            void renderQuoteInstancesPage(input);
            return;
        }
        moduleState.instanceEditor.requirement_id = event.currentTarget.value || '';
        void renderQuoteInstancesPage(input);
    });

    document.getElementById('ams-quote-instance-open-requirement')?.addEventListener('click', () => {
        if (!moduleState.instanceEditor.requirement_id) {
            input.showToast('当前报价单还没有绑定需求单。', true);
            return;
        }
        window.location.assign(adminPageUrl('quote-requirements', { requirement: moduleState.instanceEditor.requirement_id }));
    });

    content.querySelectorAll('[data-instance-field]').forEach((node) => {
        const apply = () => {
            const field = node.dataset.instanceField;
            if (!field) return;
            moduleState.instanceEditor[field] = node.type === 'checkbox' ? Boolean(node.checked) : node.value;
            moduleState.instanceEditor.customer_snapshot = buildInstanceCustomerSnapshot(moduleState.instanceEditor);
            if (['customer_name', 'receiver_name', 'receiver_email', 'customer_notes'].includes(field)) {
                moduleState.instanceEditor.share_config = syncInstanceShareConfig(moduleState.instanceEditor);
                syncInstanceSalesOwner(moduleState.instanceEditor, input.user);
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
                syncInstanceSalesOwner(moduleState.instanceEditor, input.user, { forceOwner: true });
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
                syncInstanceSalesOwner(moduleState.instanceEditor, input.user, { forceOwner: true });
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
                syncInstanceSalesOwner(moduleState.instanceEditor, input.user, { forceOwner: true });
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

    document.getElementById('ams-quote-customer-archive-entry')?.addEventListener('click', () => {
        moduleState.customerArchiveView = !moduleState.customerArchiveView;
        if (moduleState.customerArchiveView && moduleState.customerEditor?.is_active !== false) {
            const archived = moduleState.customers.find((item) => item.is_active === false);
            if (archived) {
                moduleState.customerLoadedId = archived.id;
                moduleState.customerEditor = createCustomerDraft(archived);
                moduleState.customerCreateMode = false;
            }
        }
        if (!moduleState.customerArchiveView && moduleState.customerEditor?.is_active === false) {
            const active = moduleState.customers.find((item) => item.is_active !== false);
            moduleState.customerLoadedId = text(active?.id);
            moduleState.customerEditor = active ? createCustomerDraft(active) : createCustomerDraft();
            moduleState.customerCreateMode = !active;
        }
        void renderQuoteCustomersPage(input);
    });

    document.getElementById('ams-quote-customer-search')?.addEventListener('input', (event) => {
        moduleState.customerSearch = event.currentTarget.value || '';
        void renderQuoteCustomersPage(input);
    });

    document.getElementById('ams-quote-customer-new')?.addEventListener('click', () => {
        moduleState.customerArchiveView = false;
        moduleState.customerLoadedId = '';
        moduleState.customerEditor = createCustomerDraft();
        moduleState.customerEvents = [];
        moduleState.customerSends = [];
        moduleState.customerCreateMode = true;
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

    document.querySelectorAll('[data-customer-archive]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await withQuoteBusy('正在归档客户...', async () => {
                    const saved = await saveCustomerDraft(input.user, {
                        ...(moduleState.customers.find((item) => item.id === button.dataset.customerArchive) || {}),
                        is_active: false,
                    });
                    await Promise.all([
                        fetchCustomerAnalytics(saved.id),
                        fetchCustomerSendLedger(saved.id),
                    ]);
                    await renderQuoteCustomersPage(input);
                }, button, '归档后客户会从默认客户列表和新建绑定入口中隐藏，但历史需求和报价仍会保留。');
                input.showToast('客户已归档。');
            } catch (error) {
                input.showToast(error.message || '归档客户失败。', true);
            }
        });
    });

    document.getElementById('ams-quote-instance-archive-current')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '归档中...', async () => {
            try {
                await setQuoteInstanceInactive(input.user, moduleState.instanceEditor.id, 'archived');
                await fetchInstanceAnalytics(moduleState.instanceEditor.id);
                input.showToast('报价单已归档。');
                await renderQuoteInstancesPage(input);
            } catch (error) {
                input.showToast(error.message || '归档报价单失败。', true);
            }
        });
    });

    document.getElementById('ams-quote-instance-void-current')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '作废中...', async () => {
            try {
                await setQuoteInstanceInactive(input.user, moduleState.instanceEditor.id, 'voided');
                await fetchInstanceAnalytics(moduleState.instanceEditor.id);
                input.showToast('报价单已作废。');
                await renderQuoteInstancesPage(input);
            } catch (error) {
                input.showToast(error.message || '作废报价单失败。', true);
            }
        });
    });

    document.getElementById('ams-quote-instance-restore-current')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '恢复中...', async () => {
            try {
                await restoreQuoteInstance(input.user, moduleState.instanceEditor.id);
                moduleState.instanceListMode = 'active';
                await fetchInstanceAnalytics(moduleState.instanceEditor.id);
                input.showToast('报价单已恢复。');
                await renderQuoteInstancesPage(input);
            } catch (error) {
                input.showToast(error.message || '恢复报价单失败。', true);
            }
        });
    });

    document.querySelectorAll('[data-customer-restore]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await withQuoteBusy('正在恢复客户...', async () => {
                    const saved = await saveCustomerDraft(input.user, {
                        ...(moduleState.customers.find((item) => item.id === button.dataset.customerRestore) || {}),
                        is_active: true,
                    });
                    await Promise.all([
                        fetchCustomerAnalytics(saved.id),
                        fetchCustomerSendLedger(saved.id),
                    ]);
                    moduleState.customerArchiveView = false;
                    await renderQuoteCustomersPage(input);
                }, button, '恢复后客户会重新出现在主列表、需求绑定和报价关联入口中。');
                input.showToast('客户已恢复。');
            } catch (error) {
                input.showToast(error.message || '恢复客户失败。', true);
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

    document.getElementById('ams-quote-customer-archive-current')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '归档中...', async () => {
            try {
                const saved = await saveCustomerDraft(input.user, {
                    ...moduleState.customerEditor,
                    is_active: false,
                });
                await Promise.all([
                    fetchCustomerAnalytics(saved.id),
                    fetchCustomerSendLedger(saved.id),
                ]);
                input.showToast('客户已归档。');
                await renderQuoteCustomersPage(input);
            } catch (error) {
                input.showToast(error.message || '归档客户失败。', true);
            }
        });
    });

    document.getElementById('ams-quote-customer-restore-current')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '恢复中...', async () => {
            try {
                const saved = await saveCustomerDraft(input.user, {
                    ...moduleState.customerEditor,
                    is_active: true,
                });
                await Promise.all([
                    fetchCustomerAnalytics(saved.id),
                    fetchCustomerSendLedger(saved.id),
                ]);
                moduleState.customerArchiveView = false;
                input.showToast('客户已恢复。');
                await renderQuoteCustomersPage(input);
            } catch (error) {
                input.showToast(error.message || '恢复客户失败。', true);
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

    document.querySelectorAll('[data-customer-requirement-open]').forEach((button) => {
        button.addEventListener('click', () => {
            const requirementId = button.dataset.customerRequirementOpen;
            if (!requirementId) return;
            window.location.assign(adminPageUrl('quote-requirements', { requirement: requirementId }));
        });
    });
}

function bindRequirementEditor(input) {
    const content = document.getElementById('ams-content');
    if (!content) return;

    document.getElementById('ams-quote-requirement-search')?.addEventListener('input', (event) => {
        moduleState.requirementSearch = event.currentTarget.value || '';
        void renderQuoteRequirementsPage(input);
    });

    document.getElementById('ams-quote-requirement-status-filter')?.addEventListener('change', (event) => {
        moduleState.requirementStatusFilter = event.currentTarget.value || 'all';
        void renderQuoteRequirementsPage(input);
    });

    document.getElementById('ams-quote-requirement-new')?.addEventListener('click', () => {
        const seededCustomer = moduleState.customers.find((item) => item.id === text(moduleState.requirementEditor?.customer_id || moduleState.customerLoadedId));
        moduleState.requirementLoadedId = '';
        moduleState.requirementEditor = createRequirementDraft({
            customer_id: text(moduleState.requirementEditor?.customer_id || moduleState.customerLoadedId),
            requester_company: seededCustomer?.company_name || '',
            requester_name: seededCustomer?.contact_name || '',
            requester_email: seededCustomer?.email || '',
            requester_phone: seededCustomer?.phone || '',
            country: seededCustomer?.country || '',
        });
        moduleState.requirementCreateMode = true;
        void renderQuoteRequirementsPage(input);
    });

    document.querySelectorAll('[data-requirement-edit]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await withQuoteBusy('正在加载需求获取单...', async () => {
                    await fetchRequirementEditor(button.dataset.requirementEdit);
                    await renderQuoteRequirementsPage(input);
                }, button, '正在读取需求问卷、客户绑定和关联报价单。');
            } catch (error) {
                input.showToast(error.message || '加载需求获取单失败。', true);
            }
        });
    });

    content.querySelectorAll('[data-requirement-field]').forEach((node) => {
        const apply = () => {
            const field = node.dataset.requirementField;
            if (!field) return;
            if (field === 'customer_id' && text(moduleState.requirementEditor?.id)) return;
            moduleState.requirementEditor[field] = node.type === 'checkbox' ? Boolean(node.checked) : node.value;
            if (field === 'customer_id') {
                const customer = moduleState.customers.find((item) => item.id === text(moduleState.requirementEditor.customer_id));
                if (customer) {
                    if (!hasTextValue(moduleState.requirementEditor.requester_company)) moduleState.requirementEditor.requester_company = text(customer.company_name || customer.customer_name);
                    if (!hasTextValue(moduleState.requirementEditor.requester_name)) moduleState.requirementEditor.requester_name = text(customer.contact_name);
                    if (!hasTextValue(moduleState.requirementEditor.requester_email)) moduleState.requirementEditor.requester_email = text(customer.email);
                    if (!hasTextValue(moduleState.requirementEditor.requester_phone)) moduleState.requirementEditor.requester_phone = text(customer.phone);
                    if (!hasTextValue(moduleState.requirementEditor.country)) moduleState.requirementEditor.country = text(customer.country);
                }
            }
        };
        node.addEventListener('input', apply);
        if (node.type === 'checkbox' || node.tagName === 'SELECT') {
            node.addEventListener('change', () => {
                apply();
                if (node.dataset.requirementField === 'customer_id') void renderQuoteRequirementsPage(input);
            });
        }
    });

    content.querySelectorAll('[data-requirement-answer]').forEach((node) => {
        const apply = () => {
            const field = node.dataset.requirementAnswer;
            if (!field) return;
            moduleState.requirementEditor.answers[field] = node.value;
        };
        node.addEventListener('input', apply);
        if (node.type === 'checkbox' || node.tagName === 'SELECT') node.addEventListener('change', apply);
    });

    content.querySelectorAll('[data-requirement-check]').forEach((node) => {
        const apply = () => {
            const field = node.dataset.requirementCheck;
            if (!field) return;
            const checked = [...content.querySelectorAll(`[data-requirement-check="${field}"]`)]
                .filter((item) => item.checked)
                .map((item) => item.value);
            moduleState.requirementEditor.answers[field] = checked;
        };
        node.addEventListener('change', apply);
    });

    document.getElementById('ams-quote-requirement-save')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '保存中...', async () => {
            try {
                const saved = await saveRequirementDraft(input.user, moduleState.requirementEditor);
                input.showToast('需求获取单已保存。');
                await fetchRequirementEditor(saved.id);
                await renderQuoteRequirementsPage(input);
            } catch (error) {
                input.showToast(error.message || '保存需求获取单失败。', true);
            }
        });
    });

    document.getElementById('ams-quote-requirement-copy-link')?.addEventListener('click', async () => {
        if (!moduleState.requirementEditor?.public_slug || !moduleState.requirementEditor?.public_token) {
            input.showToast('请先保存需求单，再复制客户需求链接。', true);
            return;
        }
        const url = requirementPublicUrl(moduleState.requirementEditor.public_slug, moduleState.requirementEditor.public_token);
        try {
            await navigator.clipboard.writeText(url);
            input.showToast('客户需求链接已复制。');
        } catch (_error) {
            input.showToast(url, false);
        }
    });
    document.getElementById('ams-quote-requirement-copy-link-inline')?.addEventListener('click', async () => {
        document.getElementById('ams-quote-requirement-copy-link')?.click();
    });

    document.getElementById('ams-quote-requirement-open-link')?.addEventListener('click', () => {
        if (!moduleState.requirementEditor?.public_slug || !moduleState.requirementEditor?.public_token) {
            input.showToast('请先保存需求单，再打开公开需求页。', true);
            return;
        }
        window.open(requirementPublicUrl(moduleState.requirementEditor.public_slug, moduleState.requirementEditor.public_token), '_blank', 'noopener');
    });
    document.getElementById('ams-quote-requirement-open-link-inline')?.addEventListener('click', () => {
        document.getElementById('ams-quote-requirement-open-link')?.click();
    });

    document.getElementById('ams-quote-requirement-create-instance')?.addEventListener('click', async (event) => {
        const productId = document.getElementById('ams-quote-requirement-product-select')?.value || '';
        await input.withButtonBusy(event.currentTarget, '生成中...', async () => {
            try {
                const savedRequirement = await saveRequirementDraft(input.user, moduleState.requirementEditor);
                const instance = await createInstanceFromRequirement(input.user, savedRequirement.id, productId);
                moduleState.requirementEditor = createRequirementDraft({
                    ...savedRequirement,
                    status: 'quoted',
                });
                await saveRequirementDraft(input.user, moduleState.requirementEditor);
                input.showToast('已从需求获取单生成报价草稿。');
                await fetchRequirementEditor(savedRequirement.id);
                await renderQuoteRequirementsPage(input);
                window.open(quoteEditorUrl('instance', instance.id), '_blank', 'noopener');
            } catch (error) {
                input.showToast(error.message || '从需求获取单生成报价失败。', true);
            }
        });
    });

    content.querySelectorAll('[data-requirement-product-select]').forEach((node) => {
        node.addEventListener('change', () => {
            moduleState.requirementProductSelection = node.value || '';
            content.querySelectorAll('[data-requirement-product-select]').forEach((selectNode) => {
                if (selectNode !== node) selectNode.value = moduleState.requirementProductSelection;
            });
        });
    });

    content.querySelectorAll('[data-requirement-create-instance]').forEach((button) => {
        button.addEventListener('click', async (event) => {
            const productId = moduleState.requirementProductSelection || '';
            await input.withButtonBusy(event.currentTarget, '生成中...', async () => {
                try {
                    const savedRequirement = await saveRequirementDraft(input.user, moduleState.requirementEditor);
                    const instance = await createInstanceFromRequirement(input.user, savedRequirement.id, productId);
                    moduleState.requirementEditor = createRequirementDraft({
                        ...savedRequirement,
                        status: 'quoted',
                    });
                    await saveRequirementDraft(input.user, moduleState.requirementEditor);
                    input.showToast('已从需求获取单生成报价草稿。');
                    await fetchRequirementEditor(savedRequirement.id);
                    await renderQuoteRequirementsPage(input);
                    window.open(quoteEditorUrl('instance', instance.id), '_blank', 'noopener');
                } catch (error) {
                    input.showToast(error.message || '从需求获取单生成报价失败。', true);
                }
            });
        });
    });

    document.querySelectorAll('[data-requirement-quote-open]').forEach((button) => {
        button.addEventListener('click', () => {
            const instanceId = button.dataset.requirementQuoteOpen;
            if (!instanceId) return;
            window.open(quoteEditorUrl('instance', instanceId), '_blank', 'noopener');
        });
    });

    document.querySelectorAll('[data-requirement-quote-public]').forEach((button) => {
        button.addEventListener('click', () => {
            const publicSlug = button.dataset.requirementQuotePublic;
            if (!publicSlug) return;
            window.open(publicQuoteUrl(publicSlug), '_blank', 'noopener');
        });
    });

    document.querySelectorAll('[data-requirement-open-instances]').forEach((button) => {
        button.addEventListener('click', () => {
            const requirementId = button.dataset.requirementOpenInstances;
            if (!requirementId) return;
            window.location.assign(adminPageUrl('quote-instances', { requirement: requirementId }));
        });
    });
}

export async function renderQuoteRequirementsPage(input) {
    try {
        await ensureBaseData();
    } catch (error) {
        if (isQuoteSetupMissing(error)) {
            renderQuoteSetupRequired(input, error);
            return;
        }
        throw error;
    }

    const requestedRequirementId = readAdminPageParam('requirement');
    if (requestedRequirementId) {
        if (moduleState.requirements.some((item) => item.id === requestedRequirementId) && moduleState.requirementLoadedId !== requestedRequirementId) {
            await fetchRequirementEditor(requestedRequirementId);
        }
        clearAdminPageParams('requirement');
    }

    if (!moduleState.requirementEditor) {
        moduleState.requirementEditor = createRequirementDraft();
    }

    const currentRequirementExists = moduleState.requirementLoadedId && moduleState.requirements.some((item) => item.id === moduleState.requirementLoadedId);
    if (moduleState.requirementLoadedId && !currentRequirementExists) {
        moduleState.requirementLoadedId = '';
        moduleState.requirementEditor = createRequirementDraft();
        moduleState.requirementCreateMode = false;
    }

    const requirement = moduleState.requirementEditor || createRequirementDraft();
    const activeRequirementId = text(moduleState.requirementLoadedId || requirement.id);
    const showRequirementEditor = Boolean(activeRequirementId || moduleState.requirementCreateMode);
    const answers = normalizeRequirementAnswers(requirement.answers);
    const currentCustomer = moduleState.customers.find((item) => item.id === requirement.customer_id) || null;
    const quoteSummary = requirement.id ? summarizeRequirementQuotes(requirement.id) : summarizeRequirementQuotes('');
    const requirementLink = requirement.id && requirement.public_slug && requirement.public_token
        ? requirementPublicUrl(requirement.public_slug, requirement.public_token)
        : '';
    const canCreateQuote = requirementStatusReadyForQuote(requirement.status);
    const linkLocked = requirementIsLocked(requirement.status);
    const availableProducts = activeProducts();
    if (!availableProducts.some((product) => product.id === moduleState.requirementProductSelection)) {
        moduleState.requirementProductSelection = availableProducts[0]?.id || '';
    }
    const selectedRequirementProductId = moduleState.requirementProductSelection;

    input.setPageHeader('报价系统 / 需求获取单', '先发客户公开需求链接，等客户提交后，再进入整理与报价流程。');
    input.setContent(`
        <section class="ams-card ams-hero-card ams-hero-card-compact ams-quote-instance-hero">
            <div class="ams-hero-copy">
                <p class="ams-eyebrow">Requirement Intake</p>
                <h2>先发公开需求链接，再整理报价。</h2>
                <p class="ams-hero-text">这里的需求单不是内部代填表，而是客户公开填写的唯一链接。你先绑定客户、保存需求单，再把链接发给客户；客户提交后，这一轮需求就成为后续报价的基线。</p>
            </div>
            <div class="ams-quick-actions ams-quote-instance-quick-actions">
                <button class="ams-quick-link" type="button" id="ams-quote-requirement-new">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-clipboard-list"></i></div>
                    <div class="ams-quick-link-body">
                        <strong>新建需求单</strong>
                        <span>先绑定客户，生成唯一公开链接，再把需求表发给客户填写。</span>
                    </div>
                </button>
                <div class="ams-quick-link ams-quick-link-static ams-quote-create-panel">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-file-invoice-dollar"></i></div>
                    <div class="ams-quick-link-body">
                        <strong>从需求生成报价单</strong>
                        <span>${canCreateQuote ? '客户已提交，选择产品模板后，直接生成报价草稿并打开真实报价页。' : '只有客户正式提交后的需求单才能进入报价链路。当前需求还不能生成报价单。'}</span>
                        <div class="ams-inline-actions ams-quote-create-bar ams-quote-create-bar-compact">
                            <select class="ams-select ams-quote-create-select" data-requirement-product-select>
                                <option value="">请选择产品模板</option>
                                ${availableProducts.map((product) => `<option value="${esc(product.id)}" ${selectedRequirementProductId === product.id ? 'selected' : ''}>${esc(brandLabelById(product.brand_id))} / ${esc(pickLocalized(product.public_title, product.default_lang, product.slug))}</option>`).join('')}
                            </select>
                            <button class="ams-btn ams-btn-warning" type="button" data-requirement-create-instance ${canCreateQuote ? '' : 'disabled'}>生成报价草稿</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="ams-quote-layout">
            <aside class="ams-card ams-quote-list-panel">
                <div class="ams-section-head"><div><h3>需求单列表</h3><p>共 ${filteredRequirements().length} 份需求单</p></div></div>
                <div class="ams-field">
                    <label>搜索需求单</label>
                    <input id="ams-quote-requirement-search" class="ams-input" value="${esc(moduleState.requirementSearch)}" placeholder="搜索客户 / 国家 / 需求标题 / 联系人 / 品牌偏好">
                </div>
                <div class="ams-field">
                    <label>状态筛选</label>
                    <select id="ams-quote-requirement-status-filter" class="ams-select">
                        <option value="all" ${moduleState.requirementStatusFilter === 'all' ? 'selected' : ''}>全部状态</option>
                        ${selectOptionsMarkup(REQUIREMENT_STATUS_OPTIONS, moduleState.requirementStatusFilter)}
                    </select>
                </div>
                <div class="ams-quote-list">${renderRequirementList()}</div>
            </aside>
            <section class="ams-card ams-quote-editor-panel ams-instance-editor-panel">
                ${
                    showRequirementEditor
                        ? `
                    <div class="ams-section-head">
                        <div>
                            <h3>${requirement.id ? '编辑需求获取单' : '新建需求获取单'}</h3>
                            <p>后台在这里做客户绑定、公开链接发放、提交状态确认和报价衔接，不直接代替客户填写问卷。</p>
                        </div>
                        <div class="ams-row-actions">
                            <button class="ams-btn ams-btn-muted" type="button" data-requirement-open-instances="${esc(requirement.id)}" ${quoteSummary.total_quotes ? '' : 'disabled'}>查看报价单</button>
                            <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-requirement-save">保存需求单</button>
                        </div>
                    </div>
                    <div class="ams-quote-meta-grid">
                        <div class="ams-summary-chip"><strong>绑定客户</strong><span>${esc(customerDisplayName(currentCustomer || {}))}</span></div>
                        <div class="ams-summary-chip"><strong>当前状态</strong><span>${esc(requirementStatusLabel(requirement.status))}</span></div>
                        <div class="ams-summary-chip ams-summary-chip-link">
                            <strong>公开链接</strong>
                            <span>${esc(requirementLink || '先保存后生成')}</span>
                            <div class="ams-summary-chip-actions">
                                <button class="ams-btn ams-btn-muted" type="button" id="ams-quote-requirement-copy-link-inline" ${requirementLink ? '' : 'disabled'}>复制</button>
                                <button class="ams-btn ams-btn-warning" type="button" id="ams-quote-requirement-open-link-inline" ${requirementLink ? '' : 'disabled'}>查看</button>
                            </div>
                        </div>
                        <div class="ams-summary-chip"><strong>客户提交时间</strong><span>${esc(fmtDate(requirement.submitted_at))}</span></div>
                        <div class="ams-summary-chip"><strong>关联报价</strong><span>${esc(quoteSummary.total_quotes)}</span></div>
                        <div class="ams-summary-chip"><strong>更新时间</strong><span>${esc(fmtDate(requirement.updated_at))}</span></div>
                    </div>
                    <div class="ams-site-field-grid ams-site-field-grid-wide">
                        <div class="ams-field">
                            <label>绑定客户</label>
                            <select class="ams-select" data-requirement-field="customer_id" ${requirement.id ? 'disabled' : ''}>
                                <option value="">请选择客户档案</option>
                                ${moduleState.customers.map((customer) => `<option value="${esc(customer.id)}" ${requirement.customer_id === customer.id ? 'selected' : ''}>${esc(customerDisplayName(customer))}</option>`).join('')}
                            </select>
                            <div class="ams-field-help">${requirement.id ? '需求单创建后，绑定客户不可更改。若客户归属有误，请新建一份正确的需求单。' : '先绑定客户，再继续完善公开需求链接和问卷内容。'}</div>
                        </div>
                        <div class="ams-field"><label>需求标题</label><input class="ams-input" data-requirement-field="title" value="${esc(requirement.title)}" placeholder="例如：俄罗斯 200 台液冷矿机一体化需求"></div>
                        <div class="ams-field">
                            <label>状态</label>
                            <select class="ams-select" data-requirement-field="status">${selectOptionsMarkup(REQUIREMENT_STATUS_OPTIONS, requirement.status)}</select>
                        </div>
                        <div class="ams-field">
                            <label>需求类型</label>
                            <select class="ams-select" data-requirement-field="requirement_type">${selectOptionsMarkup(REQUIREMENT_TYPE_OPTIONS, requirement.requirement_type)}</select>
                        </div>
                        <div class="ams-field"><label>国家 / 地区</label><input class="ams-input" data-requirement-field="country" value="${esc(requirement.country)}" placeholder="Russia"></div>
                        <div class="ams-field"><label>客户公司</label><input class="ams-input" data-requirement-field="requester_company" value="${esc(requirement.requester_company)}" placeholder="Demo Mining"></div>
                        <div class="ams-field"><label>联系人</label><input class="ams-input" data-requirement-field="requester_name" value="${esc(requirement.requester_name)}" placeholder="Allen"></div>
                        <div class="ams-field"><label>邮箱</label><input class="ams-input" data-requirement-field="requester_email" value="${esc(requirement.requester_email)}" placeholder="customer@example.com"></div>
                        <div class="ams-field"><label>WhatsApp / 电话</label><input class="ams-input" data-requirement-field="requester_phone" value="${esc(requirement.requester_phone)}" placeholder="+7 000 000 0000"></div>
                        <div class="ams-field">
                            <label>线索来源</label>
                            <select class="ams-select" data-requirement-answer="source_channel">${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.source_channel, answers.source_channel)}</select>
                        </div>
                    </div>
                    <section class="ams-quote-block">
                        <div class="ams-section-head"><div><h3>客户公开链接</h3><p>先保存需求单，再把唯一链接发给客户填写。客户提交后，公开页会自动锁定。</p></div></div>
                        <div class="ams-site-field-grid ams-site-field-grid-wide">
                            <div class="ams-field">
                                <label>公开需求链接</label>
                                <input class="ams-input" value="${esc(requirementLink)}" readonly placeholder="先保存需求单后生成唯一链接">
                                <div class="ams-field-help">${requirement.id ? '链接已经绑定到当前需求单和客户，可直接发送。' : '先保存需求单，系统才会生成唯一 req/token。'}</div>
                            </div>
                            <div class="ams-field">
                                <label>链接状态</label>
                                <div class="ams-field-help ams-quote-ledger-note ${linkLocked ? '' : 'is-warning'}">
                                    ${linkLocked ? '客户已提交，公开需求页现在是锁定只读状态。' : '客户尚未提交，公开需求页仍可继续填写。'}
                                </div>
                            </div>
                        </div>
                        <div class="ams-inline-actions ams-quote-create-bar ams-quote-create-bar-compact">
                            <button class="ams-btn ams-btn-muted" type="button" id="ams-quote-requirement-copy-link" ${requirementLink ? '' : 'disabled'}>复制客户需求链接</button>
                            <button class="ams-btn ams-btn-warning" type="button" id="ams-quote-requirement-open-link" ${requirementLink ? '' : 'disabled'}>打开公开需求页</button>
                        </div>
                    </section>
                    <section class="ams-quote-block">
                        <div class="ams-section-head"><div><h3>客户问卷内容</h3><p>后台这里主要用于查看和必要时预置默认值；正式基线以客户公开提交为准。</p></div></div>
                        <div class="ams-site-field-grid ams-site-field-grid-wide">
                            <div class="ams-field">
                                <label>部署方式</label>
                                <select class="ams-select" data-requirement-answer="deployment_mode">${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.deployment_mode, answers.deployment_mode)}</select>
                            </div>
                            <div class="ams-field">
                                <label>单机算力范围</label>
                                <select class="ams-select" data-requirement-answer="miner_hashrate_band">${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.miner_hashrate_band, answers.miner_hashrate_band)}</select>
                            </div>
                            <div class="ams-field">
                                <label>单机功耗范围</label>
                                <select class="ams-select" data-requirement-answer="miner_power_band">${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.miner_power_band, answers.miner_power_band)}</select>
                            </div>
                            <div class="ams-field">
                                <label>矿机数量范围</label>
                                <select class="ams-select" data-requirement-answer="miner_quantity_band">${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.miner_quantity_band, answers.miner_quantity_band)}</select>
                            </div>
                            <div class="ams-field">
                                <label>电压 / 频率</label>
                                <select class="ams-select" data-requirement-answer="voltage_frequency">${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.voltage_frequency, answers.voltage_frequency)}</select>
                            </div>
                        </div>
                        <div class="ams-field">
                            <label>矿机品牌</label>
                            ${requirementCheckboxGroup('miner_brands', REQUIREMENT_MULTI_OPTIONS.miner_brands, answers.miner_brands)}
                            <div class="ams-field-help">可多选；若客户暂时不确定，保留“其他 / 待确认”即可。</div>
                        </div>
                        <div class="ams-field">
                            <label>矿机冷却方式</label>
                            ${requirementCheckboxGroup('miner_cooling', REQUIREMENT_MULTI_OPTIONS.miner_cooling, answers.miner_cooling)}
                        </div>
                    </section>
                    <section class="ams-quote-block">
                        <div class="ams-section-head"><div><h3>交付与现场条件</h3><p>继续用少量选择题确认约束条件，避免后续报价依据反复变化。</p></div></div>
                        <div class="ams-site-field-grid ams-site-field-grid-wide">
                            <div class="ams-field">
                                <label>供电规模</label>
                                <select class="ams-select" data-requirement-answer="power_capacity_band">${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.power_capacity_band, answers.power_capacity_band)}</select>
                            </div>
                            <div class="ams-field">
                                <label>部署偏好</label>
                                <select class="ams-select" data-requirement-answer="container_preference">${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.container_preference, answers.container_preference)}</select>
                            </div>
                            <div class="ams-field">
                                <label>噪音要求</label>
                                <select class="ams-select" data-requirement-answer="silent_requirement">${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.silent_requirement, answers.silent_requirement)}</select>
                            </div>
                            <div class="ams-field">
                                <label>预算区间</label>
                                <select class="ams-select" data-requirement-answer="budget_band">${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.budget_band, answers.budget_band)}</select>
                            </div>
                            <div class="ams-field">
                                <label>期望周期</label>
                                <select class="ams-select" data-requirement-answer="timeline_band">${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.timeline_band, answers.timeline_band)}</select>
                            </div>
                        </div>
                        <div class="ams-field">
                            <label>认证 / 合规要求</label>
                            ${requirementCheckboxGroup('certification_needs', REQUIREMENT_MULTI_OPTIONS.certification_needs, answers.certification_needs)}
                        </div>
                    </section>
                    <div class="ams-field">
                        <label>客户补充</label>
                        <textarea class="ams-textarea" rows="3" data-requirement-answer="extra_notes" placeholder="只保留必须记录的额外说明，例如特殊站点条件、付款方式、指定矿机型号。">${esc(answers.extra_notes)}</textarea>
                    </div>
                    <div class="ams-field">
                        <label>内部备注</label>
                        <textarea class="ams-textarea" rows="3" data-requirement-field="notes" placeholder="记录内部判断、下一步动作和推荐方向。">${esc(requirement.notes)}</textarea>
                    </div>
                    <section class="ams-quote-block">
                        <div class="ams-section-head"><div><h3>生成报价</h3><p>只有客户已提交后的需求单才能进入报价链路，避免报价依据反复变化。</p></div></div>
                        <div class="ams-inline-actions ams-quote-create-bar ams-quote-create-bar-compact">
                            <select id="ams-quote-requirement-product-select" class="ams-select ams-quote-create-select" data-requirement-product-select>
                                <option value="">请选择产品模板</option>
                                ${availableProducts.map((product) => `<option value="${esc(product.id)}" ${selectedRequirementProductId === product.id ? 'selected' : ''}>${esc(brandLabelById(product.brand_id))} / ${esc(pickLocalized(product.public_title, product.default_lang, product.slug))}</option>`).join('')}
                            </select>
                            <button class="ams-btn ams-btn-warning" type="button" id="ams-quote-requirement-create-instance" ${canCreateQuote ? '' : 'disabled'}>生成报价草稿并打开真实报价页</button>
                        </div>
                        <div class="ams-field-help">${canCreateQuote ? '生成后会把客户信息、需求摘要和问卷备注自动带入报价单草稿。' : '当前还没收到客户正式提交，暂不允许生成报价。'}</div>
                    </section>
                    <section class="ams-quote-block">
                        <div class="ams-section-head"><div><h3>关联报价单</h3><p>这里聚合从当前需求单派生的全部报价草稿和已发布报价。</p></div></div>
                        <div class="ams-customer-quote-list">${requirement.id ? requirementQuoteListMarkup(requirement.id) : '<div class="ams-empty">先保存需求单，再生成对应报价。</div>'}</div>
                    </section>
                `
                        : '<div class="ams-empty">先从左侧选择一份需求单，或点击上方“新建需求单”。</div>'
                }
            </section>
        </section>
    `);
    bindRequirementEditor(input);
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

    const requestedInstanceId = readAdminPageParam('instance');
    if (requestedInstanceId) {
        if (moduleState.instances.some((item) => item.id === requestedInstanceId) && moduleState.instanceLoadedId !== requestedInstanceId) {
            await fetchInstanceEditor(requestedInstanceId);
        }
        clearAdminPageParams('instance');
    }
    const requestedRequirementId = readAdminPageParam('requirement');
    if (requestedRequirementId) {
        moduleState.instanceRequirementFilter = requestedRequirementId;
        moduleState.instancePage = 1;
        if (moduleState.instances.some((item) => text(item.requirement_id) === requestedRequirementId)) {
            const firstLinkedInstance = moduleState.instances
                .filter((item) => text(item.requirement_id) === requestedRequirementId)
                .sort((left, right) => text(right.updated_at).localeCompare(text(left.updated_at)))[0];
            if (firstLinkedInstance?.id && moduleState.instanceLoadedId !== firstLinkedInstance.id) {
                await fetchInstanceEditor(firstLinkedInstance.id);
            }
        }
        clearAdminPageParams('requirement');
    }

    input.setPageHeader('报价系统 / 报价单管理', '从产品生成客户报价单草稿，编辑后发布，生成客户独立链接。');
    const listMode = text(moduleState.instanceListMode, 'active');
    const archiveView = listMode === 'archived';
    const voidedView = listMode === 'voided';
    const inactiveEditor = ['archived', 'voided'].includes(text(moduleState.instanceEditor?.status));
    syncInstanceSalesOwner(moduleState.instanceEditor, input.user);
    const salesOwner = currentSalesOwner(input.user);
    const linkedRequirement = requirementById(moduleState.instanceEditor?.requirement_id);
    const focusedRequirement = requirementById(moduleState.instanceRequirementFilter);
    const availableRequirements = instanceRequirementOptions(moduleState.instanceEditor);
    if ((archiveView || voidedView) && moduleState.instanceStatusFilter !== 'all') {
        moduleState.instanceStatusFilter = 'all';
    }
    if (!archiveView && !voidedView && moduleState.instanceStatusFilter === 'archived') {
        moduleState.instanceStatusFilter = 'all';
    }
    const pagination = instancePaginationState();
    const visibleCountLabel = pagination.totalItems;
    input.setContent(`
        <section class="ams-card ams-hero-card ams-hero-card-compact ams-quote-instance-hero">
            <div class="ams-hero-copy">
                <p class="ams-eyebrow">Quote Instances</p>
                <h2>报价单实例才是最终业务对象。</h2>
                <p class="ams-hero-text">这里的产品已经是正式业务产品。生成报价单后可以直接给客户；如果有细节不满意，直接在报价单里继续改，不需要再回到模板概念里理解。</p>
            </div>
            <div class="ams-quick-actions ams-quote-instance-quick-actions">
                <button class="ams-quick-link" type="button" data-instance-list-mode="${archiveView ? 'active' : 'archived'}">
                    <div class="ams-quick-link-icon"><i class="fa-solid ${archiveView ? 'fa-list' : 'fa-box-archive'}"></i></div>
                    <div class="ams-quick-link-body">
                        <strong>${archiveView ? '返回主列表' : '查看归档报价'}</strong>
                        <span>${archiveView ? '当前正在查看已归档报价单，点击返回正常编辑列表。' : `已经成交、完成或收口的报价单统一收进归档列表，当前共 ${archivedInstanceCount()} 份。`}</span>
                    </div>
                </button>
                <button class="ams-quick-link" type="button" data-instance-list-mode="${voidedView ? 'active' : 'voided'}">
                    <div class="ams-quick-link-icon"><i class="fa-solid ${voidedView ? 'fa-list' : 'fa-ban'}"></i></div>
                    <div class="ams-quick-link-body">
                        <strong>${voidedView ? '返回主列表' : '查看作废报价'}</strong>
                        <span>${voidedView ? '当前正在查看已作废报价单，点击返回正常编辑列表。' : `中止、不再跟进或判废的报价单统一收进作废列表，当前共 ${voidedInstanceCount()} 份。`}</span>
                    </div>
                </button>
                <div class="ams-quick-link ams-quick-link-static ams-quote-create-panel">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-file-circle-plus"></i></div>
                    <div class="ams-quick-link-body">
                        <strong>从产品生成报价单</strong>
                        <span>先选一个正式产品，系统会按当前产品内容生成一份可编辑草稿；EN / RU 未填写时会自动继承中文。</span>
                        <div class="ams-inline-actions ams-quote-create-bar ams-quote-create-bar-compact">
                            <select id="ams-quote-instance-product-select" class="ams-select ams-quote-create-select">
                                <option value="">请选择产品</option>
                                ${activeProducts().map((product) => `<option value="${esc(product.id)}">${esc(brandLabelById(product.brand_id))} / ${esc(pickLocalized(product.public_title, product.default_lang, product.slug))}</option>`).join('')}
                            </select>
                            <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-instance-create-from-product">生成草稿</button>
                        </div>
                        <div class="ams-field-help ams-quote-create-hint">生成后可在草稿里单独补充客户信息、覆盖汇率、调整主配置和选配明细。</div>
                        <div class="ams-field-help ams-quote-create-hint">发送记录统一按报价单维度保存，后续跟进、重发和结果更新都在这里继续追加。</div>
                    </div>
                </div>
            </div>
        </section>
        <section class="ams-quote-layout">
            <aside class="ams-card ams-quote-list-panel">
                <div class="ams-section-head">
                    <div><h3>${archiveView ? '归档报价单' : voidedView ? '作废报价单' : '报价单列表'}</h3><p>共 ${visibleCountLabel} 份${archiveView ? '归档报价单' : voidedView ? '作废报价单' : focusedRequirement ? `关联“${esc(requirementDisplayName(focusedRequirement))}”的报价单` : '报价单'}</p></div>
                    <div class="ams-row-actions">
                        ${moduleState.instanceRequirementFilter ? '<button class="ams-btn ams-btn-muted" type="button" id="ams-quote-instance-clear-requirement-filter">返回全部报价</button>' : ''}
                        <button class="ams-btn ${archiveView ? 'ams-btn-primary' : 'ams-btn-muted'}" type="button" data-instance-list-mode="${archiveView ? 'active' : 'archived'}">${archiveView ? '返回主列表' : `归档列表（${archivedInstanceCount()}）`}</button>
                        <button class="ams-btn ${voidedView ? 'ams-btn-primary' : 'ams-btn-muted'}" type="button" data-instance-list-mode="${voidedView ? 'active' : 'voided'}">${voidedView ? '返回主列表' : `作废列表（${voidedInstanceCount()}）`}</button>
                    </div>
                </div>
                <div class="ams-site-field-grid ams-site-field-grid-wide">
                    <div class="ams-field">
                        <label>全局搜索</label>
                        <input id="ams-quote-instance-search" class="ams-input" value="${esc(moduleState.instanceSearch)}" placeholder="搜索客户 / 需求单 / 产品 / slug / 联系人">
                    </div>
                    ${
                        archiveView || voidedView
                            ? `
                        <div class="ams-field">
                            <label>当前列表</label>
                            <div class="ams-brand-default-link-meta">
                                <strong>筛选范围</strong>
                                <span>仅显示${archiveView ? '已归档报价单' : '已作废报价单'}</span>
                            </div>
                        </div>
                    `
                            : `
                        <div class="ams-field">
                            <label>状态筛选</label>
                            <select id="ams-quote-instance-status-filter" class="ams-select">
                                <option value="all" ${moduleState.instanceStatusFilter === 'all' ? 'selected' : ''}>全部状态</option>
                                <option value="draft" ${moduleState.instanceStatusFilter === 'draft' ? 'selected' : ''}>草稿</option>
                                <option value="published" ${moduleState.instanceStatusFilter === 'published' ? 'selected' : ''}>已发布</option>
                            </select>
                        </div>
                    `
                    }
                </div>
                <div class="ams-quote-list">${renderInstanceList()}</div>
                <div class="ams-list-pagination">
                    <div class="ams-list-pagination-meta">第 ${pagination.currentPage} / ${pagination.totalPages} 页 · 显示 ${pagination.startIndex || 0}-${pagination.endIndex || 0} / ${pagination.totalItems}</div>
                    <div class="ams-row-actions">
                        <button class="ams-btn ams-btn-muted" type="button" id="ams-quote-instance-page-prev" ${pagination.currentPage <= 1 ? 'disabled' : ''}>上一页</button>
                        <button class="ams-btn ams-btn-muted" type="button" id="ams-quote-instance-page-next" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>下一页</button>
                    </div>
                </div>
            </aside>
            <section class="ams-card ams-quote-editor-panel ams-customer-editor-panel">
                ${
                    moduleState.instanceEditor.id
                        ? `
                    <div class="ams-section-head">
                        <div>
                            <h3>编辑报价单</h3>
                            <p>这里主要做报价单基础管理。第一屏只保留客户、需求和链接入口；具体文案、价格和发布动作请进入真实报价页处理。</p>
                        </div>
                        <div class="ams-row-actions">
                            <button class="ams-btn ams-btn-warning" type="button" id="ams-open-instance-visual-editor" ${inactiveEditor ? 'disabled' : ''}>可视化编辑</button>
                            <button class="ams-btn ams-btn-muted" type="button" id="ams-quote-instance-preview">预览客户页</button>
                            <button class="ams-btn ams-btn-muted" type="button" id="ams-quote-instance-copy-link">复制客户链接</button>
                            <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-instance-save" ${inactiveEditor ? 'disabled' : ''}>保存草稿</button>
                        </div>
                    </div>
                    <div class="ams-inline-actions">
                        ${
                            inactiveEditor
                                ? '<button class="ams-btn ams-btn-muted" type="button" id="ams-quote-instance-restore-current">恢复报价单</button>'
                                : '<button class="ams-btn ams-btn-muted" type="button" id="ams-quote-instance-archive-current">归档</button><button class="ams-btn ams-btn-danger" type="button" id="ams-quote-instance-void-current">作废</button>'
                        }
                        <span class="ams-field-help">${moduleState.instanceEditor.status === 'archived' ? '归档代表这份报价单已经完成收口；如需继续编辑，请先恢复到主列表。' : moduleState.instanceEditor.status === 'voided' ? '作废代表这份报价单已经废弃不用；如需重新启用，请先恢复，再决定是否继续调整。' : '归档用于已完成收口的报价单；作废用于中止、判废或不再继续的报价单。'}</span>
                    </div>
                    <div class="ams-direct-entry-banner">
                        <strong>可视化编辑入口</strong>
                        <span>${inactiveEditor ? '当前这份报价单已退出主编辑流；如需继续改动，请先恢复，再进入可视化编辑。' : '点击上面的“可视化编辑”，会进入客户报价页本体进行编辑。'}</span>
                    </div>
                    <div class="ams-quote-meta-grid">
                        <div class="ams-summary-chip"><strong>状态</strong><span>${statusPill(moduleState.instanceEditor.status)}</span></div>
                        <div class="ams-summary-chip"><strong>客户档案</strong><span>${esc(customerDisplayName(moduleState.customers.find((item) => item.id === moduleState.instanceEditor.customer_id) || buildInstanceCustomerSnapshot(moduleState.instanceEditor)))}</span></div>
                        <div class="ams-summary-chip"><strong>需求单</strong><span>${esc(linkedRequirement ? requirementDisplayName(linkedRequirement) : '未绑定')}</span></div>
                        <div class="ams-summary-chip"><strong>公开 slug</strong><span>${esc(moduleState.instanceEditor.public_slug || '待生成')}</span></div>
                        <div class="ams-summary-chip"><strong>最近发布时间</strong><span>${esc(fmtDate(moduleState.instanceEditor.published_at))}</span></div>
                    </div>
                    <section class="ams-quote-management-primary">
                        <div class="ams-section-head">
                            <div>
                                <h3>基础管理</h3>
                                <p>先确认客户、需求和主要联系人；这几个字段决定这张报价单在整条链路里的归属。</p>
                            </div>
                        </div>
                        <div class="ams-site-field-grid ams-site-field-grid-wide">
                            <div class="ams-field">
                                <label>客户档案</label>
                                <select class="ams-select" id="ams-quote-instance-customer-select" ${text(moduleState.instanceEditor.customer_id) ? 'disabled' : ''}>
                                    <option value="">新建或未关联</option>
                                    ${moduleState.customers.map((customer) => `<option value="${esc(customer.id)}" ${moduleState.instanceEditor.customer_id === customer.id ? 'selected' : ''}>${esc(customerDisplayName(customer))}${customer.email ? ` · ${esc(customer.email)}` : ''}</option>`).join('')}
                                </select>
                                <div class="ams-field-help">${text(moduleState.instanceEditor.customer_id) ? '客户档案一旦绑定到这份报价单后即锁定；如归属有误，请作废当前报价单后重新建立新报价单。' : '客户档案只允许首次绑定一次。'}</div>
                            </div>
                            <div class="ams-field">
                                <div class="ams-field-label-row">
                                    <label>关联需求单</label>
                                    <button class="ams-btn ams-btn-muted" type="button" id="ams-quote-instance-open-requirement" ${linkedRequirement ? '' : 'disabled'}>打开</button>
                                </div>
                                <select class="ams-select" id="ams-quote-instance-requirement-select" ${text(moduleState.instanceEditor.requirement_id) ? 'disabled' : ''}>
                                    <option value="">未绑定需求单</option>
                                    ${availableRequirements.map((requirement) => `<option value="${esc(requirement.id)}" ${moduleState.instanceEditor.requirement_id === requirement.id ? 'selected' : ''}>${esc(requirementDisplayName(requirement))}</option>`).join('')}
                                </select>
                                <div class="ams-field-help">${text(moduleState.instanceEditor.requirement_id) ? '需求单一旦绑定到这份报价单后即锁定；如链路有误，请作废当前报价单后重新建立新报价单。' : moduleState.instanceEditor.customer_id ? '优先显示当前客户名下需求单；首次绑定后即锁定。' : '先绑定客户后，这里会收窄到该客户对应需求单。'}</div>
                            </div>
                            <div class="ams-field"><label>客户公司</label><input class="ams-input" data-instance-field="customer_name" value="${esc(moduleState.instanceEditor.customer_name)}" placeholder="Demo Customer"></div>
                            <div class="ams-field"><label>联系人</label><input class="ams-input" data-instance-field="receiver_name" value="${esc(moduleState.instanceEditor.receiver_name)}" placeholder="Receiver"></div>
                            <div class="ams-field"><label>客户邮箱</label><input class="ams-input" data-instance-field="receiver_email" value="${esc(moduleState.instanceEditor.receiver_email)}" placeholder="customer@example.com"></div>
                        </div>
                    </section>
                    ${quoteManagementFold(
                        '链接与交付设置',
                        '这里只保留有效期和补充联系信息；链接入口和 slug 信息以上方区域为准。',
                        `
                            <div class="ams-site-field-grid ams-site-field-grid-wide">
                                <div class="ams-field"><label>客户电话</label><input class="ams-input" data-instance-field="customer_phone" value="${esc(moduleState.instanceEditor.customer_phone)}" placeholder="+7 000 000 0000"></div>
                                <div class="ams-field"><label>国家/地区</label><input class="ams-input" data-instance-field="customer_country" value="${esc(moduleState.instanceEditor.customer_country)}" placeholder="Russia"></div>
                                <div class="ams-field"><label>有效期（小时）</label><input class="ams-input" type="number" min="1" step="1" data-instance-field="validity_hours" value="${esc(moduleState.instanceEditor.validity_hours)}"></div>
                            </div>
                        `,
                    )}
                    ${quoteManagementFold(
                        '客户备注与分享对象',
                        '客户备注和对外发送对象按需展开；销售负责人默认按当前登录后台账号记录。',
                        `
                            <div class="ams-field">
                                <label>客户备注</label>
                                <textarea class="ams-textarea" rows="3" data-instance-field="customer_notes" placeholder="记录客户偏好、分享要求或跟进备注。">${esc(moduleState.instanceEditor.customer_notes)}</textarea>
                            </div>
                            <section class="ams-quote-block">
                                <div class="ams-section-head"><div><h3>分享对象</h3><p>这里维护默认外发联系人和分享备注；销售负责人默认取当前登录人。</p></div></div>
                                <div class="ams-quote-meta-grid">
                                    <div class="ams-summary-chip"><strong>当前负责销售</strong><span>${esc(moduleState.instanceEditor.share_config?.owner_name || salesOwner.name)}</span></div>
                                    <div class="ams-summary-chip"><strong>销售邮箱</strong><span>${esc(moduleState.instanceEditor.share_config?.owner_email || salesOwner.email || '--')}</span></div>
                                </div>
                                <div class="ams-site-field-grid ams-site-field-grid-wide">
                                    <div class="ams-field"><label>分享联系人</label><input class="ams-input" data-instance-share-field="recipient_name" value="${esc(moduleState.instanceEditor.share_config?.recipient_name)}" placeholder="Receiver"></div>
                                    <div class="ams-field"><label>分享邮箱</label><input class="ams-input" data-instance-share-field="recipient_email" value="${esc(moduleState.instanceEditor.share_config?.recipient_email)}" placeholder="customer@example.com"></div>
                                    <div class="ams-field"><label>分享公司</label><input class="ams-input" data-instance-share-field="recipient_company" value="${esc(moduleState.instanceEditor.share_config?.recipient_company)}" placeholder="Demo Customer"></div>
                                </div>
                                <div class="ams-field">
                                    <label>分享备注</label>
                                    <textarea class="ams-textarea" rows="3" data-instance-share-field="follow_up_notes" placeholder="记录这份报价对外发送的上下文、承诺、跟进节点或提醒。">${esc(moduleState.instanceEditor.share_config?.follow_up_notes)}</textarea>
                                </div>
                                <div class="ams-field-help">客户公司 / 联系人 / 邮箱 / 客户备注变更时，对外联系人字段会自动继承默认值；负责销售默认随当前登录账号同步。</div>
                            </section>
                        `,
                    )}
                    ${quoteManagementFold(
                        '报价判断参考',
                        '发送、浏览和客户互动记录放在这里，避免第一屏被事件明细打断。',
                        instanceInsightsMarkup(),
                    )}
                    <section class="ams-quote-block">
                        <div class="ams-section-head">
                            <div>
                                <h3>品牌与展示内容</h3>
                                <p>这部分统一以可视化编辑页为准，这里不再重复展示和维护。</p>
                            </div>
                            <div class="ams-row-actions">
                                <a class="ams-btn ams-btn-warning" href="${esc(quoteEditorUrl('instance', moduleState.instanceEditor.id))}" target="_blank" rel="noopener">前往可视化编辑</a>
                            </div>
                        </div>
                    </section>
                `
                        : '<div class="ams-empty">先从左侧选择一份报价单，或从上方正式产品生成一份新的草稿。</div>'
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

    const requestedCustomerId = readAdminPageParam('customer');
    if (requestedCustomerId) {
        if (moduleState.customers.some((item) => item.id === requestedCustomerId) && moduleState.customerLoadedId !== requestedCustomerId) {
            await fetchCustomerEditor(requestedCustomerId);
        }
        clearAdminPageParams('customer');
    }

    if (!moduleState.customerEditor) {
        moduleState.customerEditor = createCustomerDraft();
    }

    const currentCustomerExists = moduleState.customerLoadedId && moduleState.customers.some((item) => item.id === moduleState.customerLoadedId);
    if (moduleState.customerLoadedId && !currentCustomerExists) {
        moduleState.customerLoadedId = '';
        moduleState.customerEditor = createCustomerDraft();
        moduleState.customerEvents = [];
        moduleState.customerSends = [];
        moduleState.customerCreateMode = true;
    }
    const archiveView = moduleState.customerArchiveView === true;
    const activeCustomerId = text(moduleState.customerLoadedId || moduleState.customerEditor?.id);
    const quoteSummary = activeCustomerId ? summarizeCustomerQuotes(activeCustomerId) : summarizeCustomerQuotes('');
    const requirementSummary = activeCustomerId ? summarizeCustomerRequirements(activeCustomerId) : summarizeCustomerRequirements('');
    input.setPageHeader('报价系统 / 客户洞察', '按客户查看关联报价单、浏览记录、分享动作，并维护客户主档信息。');
    input.setContent(`
        <section class="ams-card ams-hero-card ams-hero-card-compact ams-quote-instance-hero">
            <div class="ams-hero-copy">
                <p class="ams-eyebrow">Quote Customers</p>
                <h2>客户是报价系统里的主业务对象。</h2>
                <p class="ams-hero-text">这里按客户聚合相关报价单、访问时间线和分享行为。报价单继续保留自己的客户快照，客户主档则作为后台的长期关系入口。</p>
            </div>
            <div class="ams-quick-actions ams-quote-instance-quick-actions">
                <button class="ams-quick-link" type="button" id="ams-quote-customer-new">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-address-book"></i></div>
                    <div class="ams-quick-link-body">
                        <strong>新建客户档案</strong>
                        <span>先建立长期客户主档，再复用公司、联系人和联系方式到后续需求与报价流程。</span>
                    </div>
                </button>
                <div class="ams-quick-link ams-quick-link-static ams-quote-create-panel">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
                    <div class="ams-quick-link-body">
                        <strong>客户主档检索</strong>
                        <span>客户主档用于复用公司、联系人、邮箱、电话和备注；每份报价单发布时仍然保留自己的客户快照。</span>
                    </div>
                </div>
            </div>
        </section>
        <div class="ams-inline-actions" style="margin: 0 0 16px;">
            <button class="ams-btn ${archiveView ? 'ams-btn-primary' : 'ams-btn-muted'}" type="button" id="ams-quote-customer-archive-entry">${archiveView ? '返回主列表' : `归档列表（${archivedCustomerCount()}）`}</button>
            <span class="ams-field-help">${archiveView ? '这里只显示已归档客户，可恢复继续使用。' : '默认只显示有效客户，已归档客户收纳在单独列表。'}</span>
        </div>
        <section class="ams-quote-layout">
            <aside class="ams-card ams-quote-list-panel">
                <div class="ams-section-head"><div><h3>${archiveView ? '已归档客户' : '客户列表'}</h3><p>共 ${filteredCustomers().length} 个${archiveView ? '归档客户' : '活跃客户'}</p></div></div>
                <div class="ams-field">
                    <label>搜索客户</label>
                    <input id="ams-quote-customer-search" class="ams-input" value="${esc(moduleState.customerSearch)}" placeholder="搜索公司 / 联系人 / 邮箱 / 电话">
                </div>
                <div class="ams-quote-list">${renderCustomerList()}</div>
            </aside>
            <section class="ams-card ams-quote-editor-panel ams-instance-editor-panel">
                ${
                    activeCustomerId || moduleState.customerCreateMode
                        ? `
                    <div class="ams-section-head">
                        <div>
                            <h3>${activeCustomerId ? '编辑客户档案' : '新建客户档案'}</h3>
                            <p>客户主档是后台关系视图；报价单内的 <code>customer_snapshot</code> 仍用于保留发布时的业务历史。</p>
                        </div>
                        <div class="ams-row-actions">
                            <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-customer-save">保存客户档案</button>
                        </div>
                    </div>
                    ${
                        activeCustomerId
                            ? `
                    <div class="ams-inline-actions">
                        ${
                            moduleState.customerEditor?.is_active === false
                                ? '<button class="ams-btn ams-btn-muted" type="button" id="ams-quote-customer-restore-current">恢复客户</button>'
                                : '<button class="ams-btn ams-btn-danger" type="button" id="ams-quote-customer-archive-current">归档客户</button>'
                        }
                        <span class="ams-field-help">${moduleState.customerEditor?.is_active === false ? '已归档客户默认不再出现在客户主列表、需求绑定和报价关联入口。' : '归档后客户会从默认客户列表和新建绑定入口中隐藏，但历史数据仍保留。'}</span>
                    </div>
                    `
                            : ''
                    }
                    <div class="ams-quote-meta-grid">
                        <div class="ams-summary-chip"><strong>客户名称</strong><span>${esc(customerDisplayName(moduleState.customerEditor || {}))}</span></div>
                        <div class="ams-summary-chip"><strong>关联需求单</strong><span>${esc(requirementSummary.total_requirements)}</span></div>
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
                `
                        : '<div class="ams-empty">先从左侧选择一个客户，或点击上方“新建客户档案”。</div>'
                }
            </section>
        </section>
    `);
    bindCustomerEditor(input);
}
