import { client } from './supabase.client.js';
import {
    SALES_ENTRY_KIND,
    adminConsoleUrl,
    detectAdminEntryKind,
    quoteEditorContextParams,
} from './admin-entry.module.js';
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
    normalizeLangCode,
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
} from '../../shared/quote-system/quote-data.module.js?v=20260414lang02';

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
const TABLE_DEALS = 'quote_deals';
const TABLE_DEAL_STAGE_RECORDS = 'quote_deal_stage_records';
const TABLE_CUSTOMER_ACTIVITIES = 'quote_customer_activities';
const TABLE_ACTIVITY_READS = 'quote_activity_reads';
const STORAGE_BUCKET_PRODUCT_MEDIA = 'quote-product-media';
const DEFAULT_CUSTOMER_ACTIVITY_FILTER = 'customer';

const moduleState = {
    brands: [],
    products: [],
    customers: [],
    requirements: [],
    instances: [],
    deals: [],
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
    dealEditor: null,
    customerEvents: [],
    customerActivities: [],
    customerActivityFilter: DEFAULT_CUSTOMER_ACTIVITY_FILTER,
    recentActivities: [],
    activityReadMap: {},
    unreadStageActivityMap: {},
    unreadCustomerActivityMap: {},
    unreadStageCustomerActivityMap: {},
    activityThrottleMap: {},
    customerSends: [],
    customerArchiveExpandedMap: {},
    dealStageRecords: [],
    dealStagePublicLinkSupported: true,
    productLoadedId: '',
    instanceLoadedId: '',
    customerLoadedId: '',
    requirementLoadedId: '',
    dealLoadedId: '',
    customerSearch: '',
    requirementSearch: '',
    dealSearch: '',
    requirementProductSelection: '',
    pipelineProductSelection: '',
    requirementStatusFilter: 'all',
    dealStageFilter: 'all',
    dealStatusFilter: 'all',
    customerListMode: 'active',
    dashboardRange: 'quarter',
    brandCreateMode: false,
    customerCreateMode: false,
    requirementCreateMode: false,
    dealCreateMode: false,
    productCreateMode: false,
    brandDisplayNameTouched: false,
    brandDefaultLinkTouched: false,
    brandLegacyRepairAttempted: false,
    productLegacyRepairAttempted: false,
    brandArchiveView: false,
    productBrandFilter: 'all',
    productArchiveView: false,
    instanceSearch: '',
    instanceStatusFilter: 'all',
    instanceRequirementFilter: '',
    instancePage: 1,
    instancePageSize: 10,
    instanceListMode: 'active',
    instanceViewPage: 1,
    salesPipelineExpanded: false,
    baseDataLoadedAt: 0,
    baseDataLoadingPromise: null,
    unreadSummaryLoadedAt: 0,
    unreadSummaryLoadingPromise: null,
};

const quoteBusyState = {
    depth: 0,
};

const SALES_ACTIVITY_LIMIT = 800;
const BASE_DATA_FRESH_MS = 15 * 1000;
const BASE_DATA_MAX_STALE_MS = 3 * 60 * 1000;
const BASE_DATA_SESSION_CACHE_MS = 90 * 1000;
const BASE_DATA_SESSION_CACHE_KEY = 'ams_quote_base_data_cache_v1';
const UNREAD_SUMMARY_CACHE_MS = 12 * 1000;

const SALES_ACTIVITY_ACTOR_LABELS = Object.freeze({
    customer: '客户',
    sales: '销售',
    system: '系统',
});

const SALES_ACTIVITY_COLLAPSIBLE_TYPES = new Set([
    'page_view',
    'public_link_opened',
]);

const SALES_ACTIVITY_COLLAPSE_WINDOW_MS = 30 * 60 * 1000;

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

const DEAL_STAGE_DEFINITIONS = Object.freeze([
    { key: 'customer_profile', label: '客户建档', shortLabel: '客户', icon: 'fa-address-card', page: 'quote-customers', anchor: '', scope: 'customer' },
    { key: 'requirement_capture', label: '获取需求', shortLabel: '需求获取', icon: 'fa-clipboard-list', page: 'quote-requirements', anchor: 'capture', scope: 'requirement' },
    { key: 'requirement_confirmed', label: '确认需求', shortLabel: '需求确认', icon: 'fa-clipboard-check', page: 'quote-requirements', anchor: 'review', scope: 'requirement' },
    { key: 'quote_draft', label: '转入报价', shortLabel: '报价草稿', icon: 'fa-file-invoice-dollar', page: 'quote-instances', anchor: 'draft', scope: 'quote' },
    { key: 'quote_confirmed', label: '确认报价', shortLabel: '报价确认', icon: 'fa-file-circle-check', page: 'quote-instances', anchor: 'confirm', scope: 'quote' },
    { key: 'contract_signed', label: '签约合同', shortLabel: '合同', icon: 'fa-file-signature', page: 'quote-deals', anchor: 'contract', scope: 'deal' },
    { key: 'deposit_paid', label: '定金付款', shortLabel: '定金', icon: 'fa-sack-dollar', page: 'quote-deals', anchor: 'deposit', scope: 'deal' },
    { key: 'production_scheduled', label: '排产安排', shortLabel: '排产', icon: 'fa-industry', page: 'quote-deals', anchor: 'production', scope: 'deal' },
    { key: 'factory_accepted', label: '出厂验收', shortLabel: '验收', icon: 'fa-clipboard-check', page: 'quote-deals', anchor: 'fat', scope: 'deal' },
    { key: 'balance_confirmed', label: '尾款确认', shortLabel: '尾款', icon: 'fa-wallet', page: 'quote-deals', anchor: 'balance', scope: 'deal' },
    { key: 'shipping_in_transit', label: '物流运输', shortLabel: '物流', icon: 'fa-truck-fast', page: 'quote-deals', anchor: 'shipping', scope: 'deal' },
    { key: 'deployment_completed', label: '到场部署', shortLabel: '部署', icon: 'fa-screwdriver-wrench', page: 'quote-deals', anchor: 'deployment', scope: 'deal' },
    { key: 'support_active', label: '运维支持', shortLabel: '运维', icon: 'fa-headset', page: 'quote-deals', anchor: 'support', scope: 'deal' },
]);

const DEAL_STATUS_OPTIONS = Object.freeze([
    { value: 'active', label: '推进中' },
    { value: 'paused', label: '暂停' },
    { value: 'lost', label: '已丢单' },
    { value: 'cancelled', label: '已取消' },
    { value: 'completed', label: '已完成' },
]);

const DEAL_STAGE_STATUS_OPTIONS = Object.freeze([
    { value: 'pending', label: '待开始' },
    { value: 'active', label: '进行中' },
    { value: 'completed', label: '已完成' },
    { value: 'blocked', label: '阻塞' },
]);

const PRODUCTION_SUBFLOW_STATUS_OPTIONS = Object.freeze([
    { value: 'pending', label: '待开始' },
    { value: 'in_progress', label: '进行中' },
    { value: 'completed', label: '已完成' },
    { value: 'delayed', label: '延误' },
]);

const PRODUCTION_SUBFLOW_STEPS = Object.freeze([
    { key: 'production_step_plan', label: '排程确认', hint: '确认工厂档期、批次和资源。' },
    { key: 'production_step_material', label: '物料齐套', hint: '核心部件采购到位并齐套。' },
    { key: 'production_step_assembly', label: '产线组装', hint: '机组、矿箱、配套组件装配。' },
    { key: 'production_step_test', label: '联调测试', hint: '整机联调与运行稳定性测试。' },
    { key: 'production_step_ready', label: '待验收', hint: '完成生产并预约客户出厂验收。' },
]);

const STAGE_CONTACT_META_KEYS = Object.freeze({
    preSalesName: 'pre_sales_contact_name',
    preSalesEmail: 'pre_sales_contact_email',
    afterSalesName: 'after_sales_contact_name',
    afterSalesEmail: 'after_sales_contact_email',
});

function salesActivityReader(inputUser = null) {
    const email = text(inputUser?.email).trim().toLowerCase();
    const fallbackUserId = text(inputUser?.id).trim();
    return {
        userId: fallbackUserId || email || 'sales-console',
        email: email || fallbackUserId || 'sales-console',
    };
}

function createSalesActivityRecord(row = {}) {
    return {
        id: text(row.id),
        customer_id: text(row.customer_id),
        deal_id: text(row.deal_id),
        requirement_id: text(row.requirement_id),
        instance_id: text(row.instance_id),
        stage_key: text(row.stage_key),
        actor_type: text(row.actor_type, 'system'),
        actor_id: text(row.actor_id),
        actor_label: text(row.actor_label),
        activity_type: text(row.activity_type),
        entity_type: text(row.entity_type),
        entity_id: text(row.entity_id),
        page_key: text(row.page_key),
        action_label: text(row.action_label),
        detail_json: row.detail_json && typeof row.detail_json === 'object' ? row.detail_json : {},
        occurred_at: text(row.occurred_at || row.created_at),
        source: text(row.source, 'activity'),
    };
}

function salesActivityTimestampMs(activity = {}) {
    const stamp = Date.parse(text(activity.occurred_at));
    return Number.isFinite(stamp) ? stamp : 0;
}

function salesActivityCollapseKey(activity = {}) {
    const detail = activity.detail_json && typeof activity.detail_json === 'object' ? activity.detail_json : {};
    return [
        text(activity.actor_type, 'system'),
        text(activity.activity_type),
        text(activity.action_label),
        normalizeDealStageKey(activity.stage_key),
        text(activity.page_key),
        text(activity.entity_type),
        text(activity.entity_id),
        text(activity.instance_id),
        text(detail.access_mode),
        text(detail.button),
    ].join(':');
}

function salesActivityCollapseLabel(activity = {}, count = 1) {
    const base = text(activity.action_label, salesActivityTypeLabel(activity.activity_type));
    if (count <= 1) return base;
    if (text(activity.activity_type) === 'public_link_opened') return `${base}（${count} 次）`;
    if (text(activity.activity_type) === 'page_view') return `${base}（${count} 次访问）`;
    return `${base}（${count} 次）`;
}

function collapseCustomerActivityRows(rows = []) {
    const groups = [];
    rows.forEach((activity) => {
        const current = createSalesActivityRecord(activity);
        const collapsible = SALES_ACTIVITY_COLLAPSIBLE_TYPES.has(text(current.activity_type));
        if (!collapsible) {
            groups.push({
                key: '',
                latestAt: salesActivityTimestampMs(current),
                items: [current],
            });
            return;
        }

        const activityMs = salesActivityTimestampMs(current);
        const collapseKey = salesActivityCollapseKey(current);
        const matched = groups.find((group) => (
            group.key
            && group.key === collapseKey
            && Math.abs(group.latestAt - activityMs) <= SALES_ACTIVITY_COLLAPSE_WINDOW_MS
        ));
        if (matched) {
            matched.items.push(current);
            matched.latestAt = Math.max(matched.latestAt, activityMs);
            return;
        }
        groups.push({
            key: collapseKey,
            latestAt: activityMs,
            items: [current],
        });
    });

    return groups.map((group) => {
        if (group.items.length <= 1) return group.items[0];
        const latest = group.items[0];
        const oldest = group.items[group.items.length - 1];
        const detail = latest.detail_json && typeof latest.detail_json === 'object' ? { ...latest.detail_json } : {};
        detail.aggregate_count = group.items.length;
        detail.aggregate_from = oldest.occurred_at;
        detail.aggregate_to = latest.occurred_at;
        if (!text(detail.summary)) {
            detail.summary = `同类动作集中发生 ${group.items.length} 次`;
        }
        return createSalesActivityRecord({
            ...latest,
            action_label: salesActivityCollapseLabel(latest, group.items.length),
            detail_json: detail,
        });
    });
}

function inferSalesActivityStageKey(payload = {}) {
    const direct = normalizeDealStageKey(payload.stage_key || payload.stageKey);
    if (direct) return direct;
    const dealId = text(payload.deal_id || payload.dealId);
    if (dealId) {
        const deal = dealById(dealId);
        if (deal?.id) return normalizeDealStageKey(deal.current_stage);
    }
    const requirementId = text(payload.requirement_id || payload.requirementId);
    if (requirementId) {
        const requirement = requirementById(requirementId);
        if (requirement?.deal_id) {
            const deal = dealById(requirement.deal_id);
            if (deal?.id) return normalizeDealStageKey(deal.current_stage);
        }
        return normalizeRequirementStatus(requirement?.status) === 'submitted' ? 'requirement_confirmed' : 'requirement_capture';
    }
    const instanceId = text(payload.instance_id || payload.instanceId);
    if (instanceId) {
        const instance = instanceById(instanceId);
        if (instance?.deal_id) {
            const deal = dealById(instance.deal_id);
            if (deal?.id) return normalizeDealStageKey(deal.current_stage);
        }
        return text(payload.activity_type || payload.activityType) === 'quote_generated' ? 'quote_draft' : 'quote_confirmed';
    }
    if (text(payload.entity_type || payload.entityType) === 'customer') return 'customer_profile';
    return '';
}

function salesActorLabel(actorType = '', actorLabel = '') {
    return text(actorLabel) || SALES_ACTIVITY_ACTOR_LABELS[text(actorType, 'system')] || '系统';
}

function legacyEventActivityType(eventType = '') {
    const key = text(eventType);
    if (key === 'share_link_generated') return 'button_click';
    if (key === 'email_clicked') return 'button_click';
    return 'page_view';
}

function legacyEventToSalesActivity(event = {}) {
    const instance = instanceById(event.instance_id);
    return createSalesActivityRecord({
        id: `legacy:${text(event.id || `${event.instance_id}:${event.created_at}:${event.event_type}`)}`,
        customer_id: text(event.customer_id || instance?.customer_id),
        deal_id: text(instance?.deal_id),
        requirement_id: text(instance?.requirement_id),
        instance_id: text(event.instance_id),
        stage_key: inferSalesActivityStageKey({
            instance_id: event.instance_id,
            activity_type: legacyEventActivityType(event.event_type),
        }),
        actor_type: text(event.viewer_user_id || event.viewer_email) ? 'sales' : 'customer',
        actor_id: text(event.viewer_user_id),
        actor_label: text(event.viewer_email || event.viewer_label),
        activity_type: legacyEventActivityType(event.event_type),
        entity_type: 'quote_instance',
        entity_id: text(event.instance_id),
        page_key: 'quote-view',
        action_label: eventTypeLabel(event.event_type),
        detail_json: {
            access_mode: text(event.access_mode),
            legacy_event_type: text(event.event_type),
            viewer_label: text(event.viewer_label),
        },
        occurred_at: text(event.created_at),
        source: 'legacy-event',
    });
}

async function appendSalesActivity(payload = {}) {
    const customerId = text(payload.customer_id || payload.customerId);
    const actionLabel = text(payload.action_label || payload.actionLabel);
    const actorType = text(payload.actor_type || payload.actorType, 'system');
    const entityType = text(payload.entity_type || payload.entityType);
    const activityType = text(payload.activity_type || payload.activityType);
    if (!customerId || !actionLabel || !entityType) return null;
    if (activityType === 'page_view') {
        const throttleKey = [customerId, text(payload.deal_id || payload.dealId), text(payload.page_key || payload.pageKey), text(payload.stage_key || payload.stageKey)].join(':');
        const nowMs = Date.now();
        if (safeNumber(moduleState.activityThrottleMap[throttleKey], 0) > nowMs - 15000) return null;
        moduleState.activityThrottleMap[throttleKey] = nowMs;
    }
    const row = {
        customer_id: customerId,
        deal_id: text(payload.deal_id || payload.dealId) || null,
        requirement_id: text(payload.requirement_id || payload.requirementId) || null,
        instance_id: text(payload.instance_id || payload.instanceId) || null,
        stage_key: inferSalesActivityStageKey(payload) || null,
        actor_type: actorType,
        actor_id: text(payload.actor_id || payload.actorId) || null,
        actor_label: salesActorLabel(actorType, payload.actor_label || payload.actorLabel),
        activity_type: activityType,
        entity_type: entityType,
        entity_id: text(payload.entity_id || payload.entityId) || null,
        page_key: text(payload.page_key || payload.pageKey) || null,
        action_label: actionLabel,
        detail_json: payload.detail_json && typeof payload.detail_json === 'object' ? payload.detail_json : {},
        occurred_at: text(payload.occurred_at || payload.occurredAt) || new Date().toISOString(),
    };
    try {
        const { data, error } = await client.from(TABLE_CUSTOMER_ACTIVITIES).insert(row).select('*').single();
        if (error) throw error;
        moduleState.unreadSummaryLoadedAt = 0;
        return createSalesActivityRecord(data || row);
    } catch (_error) {
        return null;
    }
}

async function appendSalesActivities(payloads = []) {
    const rows = payloads
        .map((entry) => ({
            customer_id: text(entry.customer_id || entry.customerId),
            deal_id: text(entry.deal_id || entry.dealId) || null,
            requirement_id: text(entry.requirement_id || entry.requirementId) || null,
            instance_id: text(entry.instance_id || entry.instanceId) || null,
            stage_key: inferSalesActivityStageKey(entry) || null,
            actor_type: text(entry.actor_type || entry.actorType, 'system'),
            actor_id: text(entry.actor_id || entry.actorId) || null,
            actor_label: salesActorLabel(text(entry.actor_type || entry.actorType, 'system'), entry.actor_label || entry.actorLabel),
            activity_type: text(entry.activity_type || entry.activityType),
            entity_type: text(entry.entity_type || entry.entityType),
            entity_id: text(entry.entity_id || entry.entityId) || null,
            page_key: text(entry.page_key || entry.pageKey) || null,
            action_label: text(entry.action_label || entry.actionLabel),
            detail_json: entry.detail_json && typeof entry.detail_json === 'object' ? entry.detail_json : {},
            occurred_at: text(entry.occurred_at || entry.occurredAt) || new Date().toISOString(),
        }))
        .filter((entry) => entry.customer_id && entry.action_label && entry.entity_type && entry.activity_type);
    if (!rows.length) return [];
    try {
        const { data, error } = await client.from(TABLE_CUSTOMER_ACTIVITIES).insert(rows).select('*');
        if (error) throw error;
        moduleState.unreadSummaryLoadedAt = 0;
        return Array.isArray(data) ? data.map((item) => createSalesActivityRecord(item)) : [];
    } catch (_error) {
        return [];
    }
}

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

const LEGACY_TEMPLATE_BRAND_ALIASES = Object.freeze({
    vman: Object.freeze({
        slug: 'independent-power',
        brand_name: '独立发电',
        display_name: '独立发电产品线',
        supplier_name: '独立发电产品线',
        subject_name: '独立发电产品线',
    }),
    minerpower: Object.freeze({
        slug: 'integrated-power',
        brand_name: '一体化供电',
        display_name: '一体化产品线',
        supplier_name: '一体化产品线',
        subject_name: '一体化产品线',
    }),
});

const REQUIREMENT_STATUS_OPTIONS = Object.freeze([
    { value: 'draft', label: '待客户提交' },
    { value: 'submitted', label: '客户已提交' },
    { value: 'reviewing', label: '内部评估中' },
    { value: 'quoted', label: '已转报价' },
    { value: 'closed', label: '已关闭' },
]);

const REQUIREMENT_TYPE_OPTIONS = Object.freeze([
    { value: 'integrated_mining_power', label: '燃气发电+矿箱一体化' },
    { value: 'miner_only', label: '独立矿机矿箱' },
    { value: 'power_only', label: '独立燃气发电机组' },
    { value: 'unclear', label: '需要推荐' },
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
        email: normalizedCustomerEmail(seed.email),
        phone: text(seed.phone),
        country: text(seed.country),
        notes: text(seed.notes),
        is_active: seed.is_active !== false,
        is_deleted: seed.is_deleted === true,
        created_at: text(seed.created_at || seed.createdAt),
        updated_at: text(seed.updated_at || seed.updatedAt),
    };
}

function createCustomerDraft(seed = {}) {
    return createCustomerRecord(seed);
}

function normalizedCustomerEmail(value = '') {
    return text(value).trim().toLowerCase();
}

function isValidCustomerEmail(value = '') {
    const email = normalizedCustomerEmail(value);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeDealStageKey(value = '') {
    const current = text(value, 'requirement_capture');
    return DEAL_STAGE_DEFINITIONS.some((stage) => stage.key === current) ? current : 'requirement_capture';
}

function normalizeDealStatus(value = '') {
    const normalized = text(value, 'active').toLowerCase();
    const alias = {
        canceled: 'cancelled',
        cancel: 'cancelled',
        voided: 'cancelled',
        void: 'cancelled',
        invalid: 'cancelled',
        archived: 'completed',
        archive: 'completed',
        closed: 'completed',
        done: 'completed',
        finished: 'completed',
        complete: 'completed',
    };
    const current = alias[normalized] || normalized;
    return DEAL_STATUS_OPTIONS.some((option) => option.value === current) ? current : 'active';
}

function normalizeDealStageStatus(value = '') {
    const current = text(value, 'pending');
    return DEAL_STAGE_STATUS_OPTIONS.some((option) => option.value === current) ? current : 'pending';
}

function dealStageDefinition(stageKey = '') {
    return DEAL_STAGE_DEFINITIONS.find((item) => item.key === normalizeDealStageKey(stageKey)) || DEAL_STAGE_DEFINITIONS[0];
}

function dealStageLabel(stageKey = '') {
    return dealStageDefinition(stageKey).label;
}

function dealStatusLabel(status = '') {
    return optionLabel(DEAL_STATUS_OPTIONS, normalizeDealStatus(status));
}

function dealStageStatusLabel(status = '') {
    return optionLabel(DEAL_STAGE_STATUS_OPTIONS, normalizeDealStageStatus(status));
}

function stageMetaFields(stageKey = '') {
    const key = normalizeDealStageKey(stageKey);
    if (key === 'contract_signed') {
        return [
            { key: 'contract_number', label: '合同编号', type: 'text', placeholder: 'CT-2026-001' },
            { key: 'contract_date', label: '签约日期', type: 'date' },
            { key: 'contract_amount', label: '合同金额', type: 'number', placeholder: '0' },
            { key: 'contract_currency', label: '币种', type: 'text', placeholder: 'USD' },
            { key: 'contract_link', label: '合同链接', type: 'text', placeholder: 'https://...' },
        ];
    }
    if (key === 'deposit_paid') {
        return [
            { key: 'deposit_expected', label: '应收定金', type: 'number', placeholder: '0' },
            { key: 'deposit_received', label: '实收定金', type: 'number', placeholder: '0' },
            { key: 'deposit_received_at', label: '到账日期', type: 'date' },
            { key: 'deposit_reference', label: '凭证引用', type: 'text', placeholder: '银行回单 / 流水号' },
        ];
    }
    if (key === 'production_scheduled') {
        return [
            { key: 'factory_name', label: '工厂 / 产线', type: 'text', placeholder: 'Factory A' },
            { key: 'production_batch', label: '批次', type: 'text', placeholder: 'Batch-01' },
            { key: 'production_start_at', label: '开始时间', type: 'date' },
            { key: 'production_eta', label: '预计完工', type: 'date' },
        ];
    }
    if (key === 'factory_accepted') {
        return [
            { key: 'fat_date', label: '验收日期', type: 'date' },
            { key: 'fat_result', label: '验收结果', type: 'text', placeholder: '通过 / 待整改' },
            { key: 'fat_summary', label: '检查摘要', type: 'text', placeholder: '关键检查点摘要' },
        ];
    }
    if (key === 'balance_confirmed') {
        return [
            { key: 'balance_expected', label: '应收尾款', type: 'number', placeholder: '0' },
            { key: 'balance_confirmed_amount', label: '确认金额', type: 'number', placeholder: '0' },
            { key: 'balance_confirmed_at', label: '确认日期', type: 'date' },
        ];
    }
    if (key === 'shipping_in_transit') {
        return [
            { key: 'shipping_carrier', label: '承运商', type: 'text', placeholder: 'DHL / 海运代理' },
            { key: 'shipping_tracking_no', label: '运单号', type: 'text', placeholder: 'Tracking No.' },
            { key: 'shipping_departed_at', label: '发运时间', type: 'date' },
            { key: 'shipping_eta', label: '预计到达', type: 'date' },
        ];
    }
    if (key === 'deployment_completed') {
        return [
            { key: 'deployment_site_ready', label: '现场条件', type: 'text', placeholder: '已完成 / 待补电力' },
            { key: 'deployment_date', label: '部署日期', type: 'date' },
            { key: 'deployment_result', label: '部署结果', type: 'text', placeholder: '已上线 / 待复检' },
        ];
    }
    if (key === 'support_active') {
        return [
            { key: 'support_warranty_until', label: '质保到期', type: 'date' },
            { key: 'support_owner', label: '支持负责人', type: 'text', placeholder: 'Support Owner' },
            { key: 'support_channel', label: '支持渠道', type: 'text', placeholder: 'WhatsApp / 邮箱 / 工单' },
        ];
    }
    return [];
}

function stageMetaValue(record = {}, key = '', fallback = '') {
    return text(record?.meta?.[key], fallback);
}

function stageContactSnapshot(record = {}, deal = null) {
    const preSalesName = stageMetaValue(record, STAGE_CONTACT_META_KEYS.preSalesName, text(record.owner_name || deal?.owner_name));
    const preSalesEmail = stageMetaValue(record, STAGE_CONTACT_META_KEYS.preSalesEmail, text(record.owner_email || deal?.owner_email));
    const afterSalesName = stageMetaValue(record, STAGE_CONTACT_META_KEYS.afterSalesName);
    const afterSalesEmail = stageMetaValue(record, STAGE_CONTACT_META_KEYS.afterSalesEmail);
    return {
        preSalesName,
        preSalesEmail,
        afterSalesName,
        afterSalesEmail,
    };
}

function stageContactDisplayLabel(record = {}, deal = null) {
    const contact = stageContactSnapshot(record, deal);
    const preSales = text(contact.preSalesName || contact.preSalesEmail, '未设置');
    const afterSales = text(contact.afterSalesName || contact.afterSalesEmail, '未设置');
    return `售前 ${preSales} · 售后 ${afterSales}`;
}

function stageContactFieldsMarkup(stageKey = '', record = {}, options = {}) {
    const contact = stageContactSnapshot(record);
    const compact = options.compact === true;
    const datasetAttr = text(options.datasetAttr, 'data-sales-flow-stage-meta');
    const stageKeyAttr = options.withStageKey === false ? '' : ` data-stage-key="${esc(stageKey)}"`;
    return `
        <div class="ams-site-field-grid ams-site-field-grid-wide ${compact ? 'ams-site-field-grid-compact' : ''}">
            <div class="ams-field">
                <label>售前联系人</label>
                <input class="ams-input" ${datasetAttr}="${esc(STAGE_CONTACT_META_KEYS.preSalesName)}"${stageKeyAttr} value="${esc(contact.preSalesName)}" placeholder="售前负责人姓名">
            </div>
            <div class="ams-field">
                <label>售前邮箱</label>
                <input class="ams-input" type="email" ${datasetAttr}="${esc(STAGE_CONTACT_META_KEYS.preSalesEmail)}"${stageKeyAttr} value="${esc(contact.preSalesEmail)}" placeholder="presales@example.com">
            </div>
            <div class="ams-field">
                <label>售后联系人</label>
                <input class="ams-input" ${datasetAttr}="${esc(STAGE_CONTACT_META_KEYS.afterSalesName)}"${stageKeyAttr} value="${esc(contact.afterSalesName)}" placeholder="售后负责人姓名">
            </div>
            <div class="ams-field">
                <label>售后邮箱</label>
                <input class="ams-input" type="email" ${datasetAttr}="${esc(STAGE_CONTACT_META_KEYS.afterSalesEmail)}"${stageKeyAttr} value="${esc(contact.afterSalesEmail)}" placeholder="aftersales@example.com">
            </div>
        </div>
    `;
}

function normalizeStageCommunicationLogs(value) {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => ({
            note: text(item?.note),
            created_at: text(item?.created_at || item?.createdAt),
            author: text(item?.author),
        }))
        .filter((item) => item.note);
}

function stageCommunicationLogs(record = {}) {
    return normalizeStageCommunicationLogs(record?.meta?.communication_logs);
}

function appendStageCommunicationLog(stageKey = '', note = '', author = '') {
    const message = text(note);
    if (!message) return;
    replaceStageRecord(stageKey, (record) => {
        const logs = stageCommunicationLogs(record);
        record.meta = {
            ...(record.meta || {}),
            communication_logs: [
                {
                    note: message,
                    created_at: new Date().toISOString(),
                    author: text(author, '销售沟通'),
                },
                ...logs,
            ],
            communication_note_draft: '',
        };
        return record;
    });
}

function flushStageCommunicationDraft(stageKey = '', author = '') {
    const record = stageRecordByKey(stageKey, moduleState.dealStageRecords);
    const draft = text(record?.meta?.communication_note_draft);
    if (!draft) return;
    appendStageCommunicationLog(stageKey, draft, author);
}

function createDealDraft(seed = {}) {
    const archivedFlag = seed.is_archived ?? seed.isArchived;
    return {
        id: text(seed.id),
        customer_id: text(seed.customer_id || seed.customerId),
        title: text(seed.title),
        current_stage: normalizeDealStageKey(seed.current_stage || seed.currentStage),
        deal_status: normalizeDealStatus(seed.deal_status || seed.dealStatus),
        is_archived: archivedFlag === true || archivedFlag === 'true' || archivedFlag === 1 || archivedFlag === '1',
        archived_at: text(seed.archived_at || seed.archivedAt),
        archived_by: text(seed.archived_by || seed.archivedBy),
        owner_name: text(seed.owner_name || seed.ownerName),
        owner_email: text(seed.owner_email || seed.ownerEmail),
        primary_requirement_id: text(seed.primary_requirement_id || seed.primaryRequirementId),
        primary_instance_id: text(seed.primary_instance_id || seed.primaryInstanceId),
        summary: text(seed.summary),
        next_action: text(seed.next_action || seed.nextAction),
        next_action_due_at: text(seed.next_action_due_at || seed.nextActionDueAt),
        lost_reason: text(seed.lost_reason || seed.lostReason),
        created_at: text(seed.created_at || seed.createdAt),
        updated_at: text(seed.updated_at || seed.updatedAt),
    };
}

function createDealStageRecord(seed = {}) {
    return {
        id: text(seed.id),
        deal_id: text(seed.deal_id || seed.dealId),
        stage_key: normalizeDealStageKey(seed.stage_key || seed.stageKey),
        stage_status: normalizeDealStageStatus(seed.stage_status || seed.stageStatus),
        planned_at: text(seed.planned_at || seed.plannedAt),
        completed_at: text(seed.completed_at || seed.completedAt),
        owner_name: text(seed.owner_name || seed.ownerName),
        owner_email: text(seed.owner_email || seed.ownerEmail),
        notes: text(seed.notes),
        meta: seed.meta && typeof seed.meta === 'object' && !Array.isArray(seed.meta) ? deepClone(seed.meta) : {},
        public_slug: text(seed.public_slug || seed.publicSlug),
        public_token: text(seed.public_token || seed.publicToken),
        created_at: text(seed.created_at || seed.createdAt),
        updated_at: text(seed.updated_at || seed.updatedAt),
    };
}

function isDealStagePublicLinkSchemaMissing(error) {
    const message = text(error?.message || error?.details || error?.hint || error);
    return (
        message.includes("Could not find the 'public_slug' column of 'quote_deal_stage_records'")
        || message.includes("Could not find the 'public_token' column of 'quote_deal_stage_records'")
        || message.includes('quote_deal_stage_records')
            && (message.includes('public_slug') || message.includes('public_token'))
            && message.toLowerCase().includes('schema cache')
    );
}

function dealStageRecordSelectColumns() {
    return moduleState.dealStagePublicLinkSupported
        ? 'id, deal_id, stage_key, stage_status, planned_at, completed_at, owner_name, owner_email, notes, meta, public_slug, public_token, created_at, updated_at'
        : 'id, deal_id, stage_key, stage_status, planned_at, completed_at, owner_name, owner_email, notes, meta, created_at, updated_at';
}

function mergeDealStageRecords(deal = {}, rows = []) {
    return DEAL_STAGE_DEFINITIONS.map((stage, index) => {
        const existing = rows.find((item) => normalizeDealStageKey(item.stage_key) === stage.key);
        if (existing) return createDealStageRecord(existing);
        let stageStatus = 'pending';
        if (stage.key === 'customer_profile' && text(deal.customer_id)) stageStatus = 'completed';
        else if (stage.key === normalizeDealStageKey(deal.current_stage)) stageStatus = 'active';
        else if (!text(deal.id) && index === 1) stageStatus = 'active';
        return createDealStageRecord({
            deal_id: deal.id,
            stage_key: stage.key,
            stage_status: stageStatus,
            owner_name: deal.owner_name,
            owner_email: deal.owner_email,
        });
    });
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
    const communicationNotes = Array.isArray(source.communication_notes)
        ? source.communication_notes
            .map((item) => ({
                note: text(item?.note),
                created_at: text(item?.created_at || item?.createdAt),
                author: text(item?.author),
            }))
            .filter((item) => item.note)
        : [];
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
        communication_notes: communicationNotes,
        communication_note_draft: text(source.communication_note_draft),
    };
}

function createRequirementDraft(seed = {}) {
    return {
        id: text(seed.id),
        customer_id: text(seed.customer_id || seed.customerId),
        deal_id: text(seed.deal_id || seed.dealId),
        title: text(seed.title),
        status: normalizeRequirementStatus(seed.status),
        requirement_type: REQUIREMENT_TYPE_OPTIONS.some((item) => item.value === text(seed.requirement_type || seed.requirementType))
            ? text(seed.requirement_type || seed.requirementType)
            : 'integrated_mining_power',
        country: text(seed.country),
        requester_company: text(seed.requester_company || seed.requesterCompany),
        requester_name: text(seed.requester_name || seed.requesterName),
        requester_email: normalizedCustomerEmail(seed.requester_email || seed.requesterEmail),
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

const REQUIREMENT_SUBMISSION_FIELD_LABELS = {
    requester_company: '客户公司',
    requester_name: '联系人',
    requester_email: '邮箱',
    contact_channel: '联系渠道',
    requester_phone: '账号 / 电话',
    country: '国家 / 地区',
    requirement_type: '需求类型',
    deployment_mode: '部署模式',
    miner_hashrate_band: '矿机算力范围',
    miner_power_band: '矿机功耗范围',
    miner_quantity_band: '矿机数量范围',
    voltage_frequency: '电压 / 频率',
    miner_brands: '矿机品牌',
    miner_cooling: '矿机冷却方式',
    power_capacity_band: '供电规模',
    container_preference: '部署偏好',
    silent_requirement: '噪音要求',
    budget_band: '每 MW 预算',
    timeline_band: '期望周期',
};

function requirementSubmissionFieldLabel(field = '') {
    return REQUIREMENT_SUBMISSION_FIELD_LABELS[text(field)] || text(field);
}

function requirementMissingSubmissionFields(requirement = {}) {
    const answers = normalizeRequirementAnswers(requirement.answers);
    const missing = [];
    const pushMissing = (field, invalid) => {
        if (invalid) missing.push(requirementSubmissionFieldLabel(field));
    };
    pushMissing('requester_company', !text(requirement.requester_company));
    pushMissing('requester_name', !text(requirement.requester_name));
    pushMissing('requester_email', !text(requirement.requester_email));
    pushMissing('contact_channel', !text(answers.contact_channel));
    pushMissing('requester_phone', text(requirement.requester_phone).length < 5);
    pushMissing('country', !text(requirement.country));
    pushMissing('requirement_type', !text(requirement.requirement_type));
    pushMissing('deployment_mode', !text(answers.deployment_mode));
    pushMissing('miner_hashrate_band', !text(answers.miner_hashrate_band));
    pushMissing('miner_power_band', !text(answers.miner_power_band));
    pushMissing('miner_quantity_band', !text(answers.miner_quantity_band));
    pushMissing('voltage_frequency', !text(answers.voltage_frequency));
    pushMissing('miner_brands', !Array.isArray(answers.miner_brands) || answers.miner_brands.length === 0);
    pushMissing('miner_cooling', !Array.isArray(answers.miner_cooling) || answers.miner_cooling.length === 0);
    pushMissing('power_capacity_band', !text(answers.power_capacity_band));
    pushMissing('container_preference', !text(answers.container_preference));
    pushMissing('silent_requirement', !text(answers.silent_requirement));
    pushMissing('budget_band', !text(answers.budget_band));
    pushMissing('timeline_band', !text(answers.timeline_band));
    return missing;
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

function currentEntryKind(input = null) {
    return text(input?.entryKind || detectAdminEntryKind(), 'admin');
}

function isSalesConsole(input = null) {
    return currentEntryKind(input) === SALES_ENTRY_KIND;
}

function dealById(dealId = '') {
    return moduleState.deals.find((item) => item.id === text(dealId)) || null;
}

function instanceById(instanceId = '') {
    return moduleState.instances.find((item) => item.id === text(instanceId)) || null;
}

function customerDeals(customerId = '') {
    return moduleState.deals
        .filter((item) => text(item.customer_id) === text(customerId))
        .sort((left, right) => text(right.updated_at).localeCompare(text(left.updated_at)));
}

function requirementDeal(requirementId = '') {
    const requirement = requirementById(requirementId);
    return requirement?.deal_id ? dealById(requirement.deal_id) : null;
}

function quoteDeal(instanceId = '') {
    const instance = moduleState.instances.find((item) => item.id === text(instanceId));
    return instance?.deal_id ? dealById(instance.deal_id) : null;
}

function activeDealIdFromState(explicitDealId = '') {
    const fromParam = text(explicitDealId);
    if (fromParam) return fromParam;
    if (text(moduleState.dealLoadedId)) return text(moduleState.dealLoadedId);
    if (text(moduleState.dealEditor?.id)) return text(moduleState.dealEditor.id);
    if (text(moduleState.instanceEditor?.deal_id)) return text(moduleState.instanceEditor.deal_id);
    if (text(moduleState.requirementEditor?.deal_id)) return text(moduleState.requirementEditor.deal_id);
    const customerId = text(moduleState.customerLoadedId || moduleState.customerEditor?.id);
    const deals = customerDeals(customerId);
    if (deals.length === 1) return deals[0].id;
    return '';
}

function stageRecordByKey(stageKey = '', records = moduleState.dealStageRecords) {
    const key = normalizeDealStageKey(stageKey);
    return (records || []).find((item) => normalizeDealStageKey(item.stage_key) === key) || null;
}

function ensureActiveStage(records = [], stageKey = '') {
    const normalizedKey = normalizeDealStageKey(stageKey);
    let sawActive = false;
    return mergeDealStageRecords({ current_stage: normalizedKey }, records).map((record) => {
        const next = createDealStageRecord(record);
        if (next.stage_status === 'active' && next.stage_key === normalizedKey) {
            sawActive = true;
            return next;
        }
        if (next.stage_status === 'active' && next.stage_key !== normalizedKey) {
            next.stage_status = 'pending';
        }
        return next;
    }).map((record) => {
        const next = createDealStageRecord(record);
        if (!sawActive && next.stage_key === normalizedKey && next.stage_status !== 'completed') {
            next.stage_status = 'active';
            sawActive = true;
        }
        return next;
    });
}

function nextStageKey(currentStageKey = '') {
    const index = DEAL_STAGE_DEFINITIONS.findIndex((item) => item.key === normalizeDealStageKey(currentStageKey));
    if (index < 0 || index >= DEAL_STAGE_DEFINITIONS.length - 1) return normalizeDealStageKey(currentStageKey);
    return DEAL_STAGE_DEFINITIONS[index + 1].key;
}

function stageOrderIndex(stageKey = '') {
    return DEAL_STAGE_DEFINITIONS.findIndex((item) => item.key === normalizeDealStageKey(stageKey));
}

function primaryRequirementForDeal(deal = {}) {
    const explicit = text(deal.primary_requirement_id)
        ? requirementById(deal.primary_requirement_id)
        : null;
    if (explicit) return explicit;
    return dealRequirements(deal.id)[0] || null;
}

function syncDealProgressFromRequirements(deal = {}) {
    const currentStage = normalizeDealStageKey(deal.current_stage);
    const requirement = primaryRequirementForDeal(deal);
    const requirementStatus = normalizeRequirementStatus(requirement?.status);
    if (!['submitted', 'reviewing', 'quoted', 'closed'].includes(requirementStatus)) return createDealDraft(deal);
    if (stageOrderIndex(currentStage) > stageOrderIndex('requirement_capture')) return createDealDraft(deal);
    return createDealDraft({
        ...deal,
        current_stage: 'requirement_confirmed',
    });
}

function alignDealStageRecordsWithCurrentStage(records = [], deal = {}) {
    const currentStage = normalizeDealStageKey(deal.current_stage);
    const currentIndex = stageOrderIndex(currentStage);
    if (currentIndex < 0) return mergeDealStageRecords(deal, records);
    return mergeDealStageRecords(deal, records).map((record) => {
        const next = createDealStageRecord(record);
        const index = stageOrderIndex(next.stage_key);
        if (index < 0) return next;
        if (index < currentIndex && next.stage_status !== 'blocked') {
            next.stage_status = 'completed';
            next.completed_at = text(next.completed_at || deal.updated_at || new Date().toISOString());
        } else if (index === currentIndex && next.stage_status !== 'completed') {
            next.stage_status = 'active';
        } else if (index > currentIndex && next.stage_status !== 'completed' && next.stage_status !== 'blocked') {
            next.stage_status = 'pending';
        }
        return next;
    });
}

function inferDealCurrentStage(records = [], fallback = 'requirement_capture') {
    const merged = mergeDealStageRecords({ current_stage: fallback }, records);
    const active = merged.find((record) => record.stage_status === 'active' || record.stage_status === 'blocked');
    if (active) return active.stage_key;
    const pending = merged.find((record) => record.stage_status !== 'completed');
    if (pending) return pending.stage_key;
    return 'support_active';
}

function touchDealStageRecords(records = [], deal = {}) {
    const merged = alignDealStageRecordsWithCurrentStage(records, deal);
    if (text(deal.customer_id)) {
        const customerStage = stageRecordByKey('customer_profile', merged);
        if (customerStage) customerStage.stage_status = 'completed';
    }
    const currentStage = inferDealCurrentStage(merged, deal.current_stage || 'requirement_capture');
    return ensureActiveStage(merged, currentStage);
}

function stageJumpTarget(stageKey = '', deal = null, options = {}) {
    const mode = text(options.mode || '', readAdminPageParam('page') === 'quote-customer-flow' ? 'detail' : 'overview');
    if (mode === 'detail') return customerFlowStageUrl(stageKey, deal, options.customerId);
    return pipelineStageUrl(stageKey, deal);
}

function setStageRecordMeta(stageKey = '', field = '', value = '') {
    moduleState.dealStageRecords = moduleState.dealStageRecords.map((record) => {
        if (normalizeDealStageKey(record.stage_key) !== normalizeDealStageKey(stageKey)) return record;
        const next = createDealStageRecord(record);
        next.meta = {
            ...(next.meta || {}),
            [field]: value,
        };
        return next;
    });
}

function dealRequirements(dealId = '') {
    return moduleState.requirements
        .filter((item) => text(item.deal_id) === text(dealId))
        .sort((left, right) => text(right.updated_at || right.created_at).localeCompare(text(left.updated_at || left.created_at)));
}

function dealQuotes(dealId = '') {
    return moduleState.instances
        .filter((item) => text(item.deal_id) === text(dealId))
        .sort((left, right) => text(right.updated_at || right.created_at).localeCompare(text(left.updated_at || left.created_at)));
}

function dealCurrentRecords(deal = null) {
    const activeDeal = syncDealProgressFromRequirements(deal || dealById(activeDealIdFromState()));
    if (!activeDeal?.id) return [];
    const source = text(activeDeal.id) === text(moduleState.dealLoadedId) ? moduleState.dealStageRecords : [];
    return touchDealStageRecords(source, activeDeal);
}

function dealStageAnchor(stageKey = '') {
    return text(dealStageDefinition(stageKey).anchor);
}

function defaultStageForPage(page = '') {
    const current = text(page);
    if (current === 'quote-customers') return 'customer_profile';
    if (current === 'quote-requirements') return 'requirement_capture';
    if (current === 'quote-instances') return 'quote_draft';
    if (current === 'quote-deals') return 'contract_signed';
    return 'customer_profile';
}

function dealStatusTone(status = '') {
    const normalized = normalizeDealStatus(status);
    if (normalized === 'completed') return 'published';
    if (normalized === 'paused') return 'warning';
    if (normalized === 'lost' || normalized === 'cancelled') return 'archived';
    return 'draft';
}

function dealStatusPill(status = '') {
    return `<span class="ams-status-pill ams-status-${dealStatusTone(status)}">${esc(dealStatusLabel(status))}</span>`;
}

function dealStageStatusTone(status = '') {
    const normalized = normalizeDealStageStatus(status);
    if (normalized === 'completed') return 'published';
    if (normalized === 'blocked') return 'archived';
    if (normalized === 'active') return 'warning';
    return 'draft';
}

function dealStageStatusPill(status = '') {
    return `<span class="ams-status-pill ams-status-${dealStageStatusTone(status)}">${esc(dealStageStatusLabel(status))}</span>`;
}

function adminRoleForInput(input = null) {
    return text(input?.adminRow?.role, 'admin').toLowerCase();
}

function isSalesMaintenanceAdmin(input = null) {
    return ['admin', 'super_admin'].includes(adminRoleForInput(input));
}

function isSalesOnlyUser(input = null) {
    return adminRoleForInput(input) === 'sales';
}

function isDealArchived(deal = {}) {
    const archivedFlag = deal?.is_archived;
    return archivedFlag === true || archivedFlag === 'true' || archivedFlag === 1 || archivedFlag === '1';
}

function isCustomerPipelineVisible(customerId = '') {
    const customer = moduleState.customers.find((item) => item.id === text(customerId));
    if (!customer) return false;
    return customer.is_active !== false && !customer.is_deleted;
}

function isDealPipelineVisible(deal = {}) {
    const status = normalizeDealStatus(deal?.deal_status);
    return isCustomerPipelineVisible(deal?.customer_id)
        && !isDealArchived(deal)
        && !['lost', 'cancelled', 'completed'].includes(status);
}

function visibleDealsForInput(input = null, options = {}) {
    const includeArchived = options.includeArchived === true;
    const includeClosed = options.includeClosed === true;
    let rows = [...moduleState.deals];
    if (isSalesConsole(input) && isSalesOnlyUser(input)) {
        const email = text(input?.user?.email).toLowerCase();
        rows = rows.filter((deal) => text(deal.owner_email).toLowerCase() === email);
    }
    rows = rows.filter((deal) => isCustomerPipelineVisible(deal.customer_id));
    if (!includeArchived) rows = rows.filter((deal) => !isDealArchived(deal));
    if (!includeClosed) rows = rows.filter((deal) => isDealPipelineVisible(deal));
    return rows;
}

function salesStageCount(stageKey = '', input = null) {
    if (normalizeDealStageKey(stageKey) === 'customer_profile') {
        return moduleState.customers.filter((customer) => customer.is_active !== false && !customer.is_deleted).length;
    }
    return visibleDealsForInput(input).filter((deal) => normalizeDealStageKey(deal.current_stage) === normalizeDealStageKey(stageKey)).length;
}

function salesStageCustomerCount(stageKey = '', input = null) {
    const normalizedStage = normalizeDealStageKey(stageKey);
    if (normalizedStage === 'customer_profile') {
        return moduleState.customers.filter((customer) => customer.is_active !== false && !customer.is_deleted).length;
    }
    const customerIds = new Set(
        visibleDealsForInput(input)
            .filter((deal) => normalizeDealStageKey(deal.current_stage) === normalizedStage)
            .map((deal) => text(deal.customer_id))
            .filter(Boolean),
    );
    return customerIds.size;
}

function pipelineStageUrl(stageKey = '', deal = null) {
    const stage = dealStageDefinition(stageKey);
    const params = {};
    const activeDeal = deal || dealById(activeDealIdFromState());
    if (stage.key === 'customer_profile') {
        if (activeDeal?.customer_id) params.customer = activeDeal.customer_id;
        if (activeDeal?.id) params.deal = activeDeal.id;
        return adminPageUrl('quote-customers', params);
    }
    params.stage = stage.key;
    if (activeDeal?.id) params.deal = activeDeal.id;
    return adminPageUrl('quote-pipeline', params);
}

function customerFlowStageUrl(stageKey = '', deal = null, customerId = '') {
    const stage = dealStageDefinition(stageKey);
    const activeDeal = deal || dealById(activeDealIdFromState());
    const resolvedCustomerId = text(customerId || activeDeal?.customer_id);
    return adminPageUrl('quote-customer-flow', {
        stage: stage.key,
        customer: resolvedCustomerId,
        deal: activeDeal?.id || '',
    });
}

function filteredDeals() {
    const query = text(moduleState.dealSearch).toLowerCase();
    return visibleDealsForInput()
        .filter((deal) => {
            if (moduleState.dealStageFilter !== 'all' && normalizeDealStageKey(deal.current_stage) !== moduleState.dealStageFilter) return false;
            if (moduleState.dealStatusFilter !== 'all' && normalizeDealStatus(deal.deal_status) !== moduleState.dealStatusFilter) return false;
            if (!query) return true;
            const customer = moduleState.customers.find((item) => item.id === deal.customer_id);
            const requirement = requirementById(deal.primary_requirement_id);
            const instance = moduleState.instances.find((item) => item.id === deal.primary_instance_id);
            return [
                deal.title,
                deal.summary,
                deal.next_action,
                deal.owner_name,
                deal.owner_email,
                dealStatusLabel(deal.deal_status),
                dealStageLabel(deal.current_stage),
                customerDisplayName(customer || {}),
                requirement ? requirementDisplayName(requirement) : '',
                instance ? text(instance.customer_name || instance.public_slug) : '',
            ].some((value) => text(value).toLowerCase().includes(query));
        })
        .sort((left, right) => text(right.updated_at || right.created_at).localeCompare(text(left.updated_at || left.created_at)));
}

function dealStageCount(stageKey = '', input = null) {
    return visibleDealsForInput(input).filter((deal) => normalizeDealStageKey(deal.current_stage) === normalizeDealStageKey(stageKey)).length;
}

function stageNavigationTarget(stageKey = '', deal = null, options = {}) {
    const activeDeal = deal || dealById(activeDealIdFromState());
    const stage = dealStageDefinition(stageKey);
    const mode = text(options.mode || '', 'overview');
    const disabled = mode === 'detail' && !activeDeal?.id && stage.scope === 'deal';
    return {
        disabled,
        href: disabled ? '' : stageJumpTarget(stage.key, activeDeal, options),
    };
}

function salesPipelineMarkup(input, options = {}) {
    const activeDeal = Object.prototype.hasOwnProperty.call(options, 'deal')
        ? options.deal
        : dealById(activeDealIdFromState(options.dealId));
    const pipelineMode = text(options.pipelineMode || '', activeDeal?.id ? 'detail' : 'overview');
    const currentStage = normalizeDealStageKey(
        options.currentStage
        || activeDeal?.current_stage
        || defaultStageForPage(text(options.page || readAdminPageParam('page') || '')),
    );
    const currentCustomer = activeDeal ? moduleState.customers.find((item) => item.id === activeDeal.customer_id) : null;
    const records = activeDeal ? dealCurrentRecords(activeDeal) : [];
    return `
        <section class="ams-card ams-sales-pipeline" id="ams-sales-pipeline">
            <div class="ams-sales-pipeline-summary">
                <p class="ams-eyebrow">Sales Pipeline</p>
            </div>
            <div class="ams-sales-pipeline-track">
                ${DEAL_STAGE_DEFINITIONS.map((stage, index) => {
                    const jump = stageNavigationTarget(stage.key, activeDeal, {
                        mode: pipelineMode,
                        page: options.page,
                        customerId: text(options.customerId || currentCustomer?.id),
                    });
                    const stageRecord = activeDeal
                        ? stageRecordByKey(stage.key, records) || createDealStageRecord({ stage_key: stage.key, stage_status: stage.key === currentStage ? 'active' : 'pending' })
                        : createDealStageRecord({ stage_key: stage.key, stage_status: stage.key === currentStage ? 'active' : 'pending' });
                    const stageStatus = pipelineMode === 'detail' && activeDeal
                        ? normalizeDealStageStatus(stageRecord.stage_status)
                        : stage.key === currentStage ? 'active' : 'pending';
                    const isPendingLocked = pipelineMode === 'detail' && activeDeal?.id && stageStatus === 'pending';
                    const isDisabled = Boolean(jump.disabled || isPendingLocked);
                    const className = stageStatus === 'completed'
                        ? 'is-success'
                        : stageStatus === 'active'
                            ? 'is-active'
                            : stageStatus === 'blocked'
                                ? 'is-warning'
                                : isDisabled
                                    ? 'is-muted'
                                    : '';
                    const useCustomerCount = isSalesConsole(input) && text(options.page) === 'quote-customers';
                    const stageCount = useCustomerCount
                        ? salesStageCustomerCount(stage.key, input)
                        : salesStageCount(stage.key, input);
                    const countUnit = useCustomerCount ? '客' : '条';
                    const badgeLabel = pipelineMode === 'detail' && activeDeal?.id
                        ? dealStageStatusLabel(stageStatus)
                        : isDisabled
                            ? '需销售线'
                            : `${stageCount} ${countUnit}`;
                    const description = pipelineMode === 'detail' && activeDeal?.id
                        ? dealStageStatusLabel(stageStatus)
                        : stage.key === 'customer_profile'
                            ? '建档入口'
                            : '阶段列表';
                    const body = `
                        <div class="ams-sales-pipeline-stage-head">
                            <span class="ams-customer-pipeline-icon">${esc(index + 1)}</span>
                            <span class="ams-customer-pipeline-badge">${esc(badgeLabel)}</span>
                        </div>
                        <strong>${esc(stage.label)}</strong>
                        <span>${esc(description)}</span>
                        <em>${esc(
                            pipelineMode === 'detail' && activeDeal?.id
                                ? (text(stageRecord.completed_at)
                                    ? `完成于 ${fmtDate(stageRecord.completed_at)} · ${stageContactDisplayLabel(stageRecord, activeDeal)}`
                                    : stageContactDisplayLabel(stageRecord, activeDeal))
                                : (isDisabled ? '先创建销售线' : (stage.key === 'customer_profile' ? '打开客户档案' : '打开列表'))
                        )}</em>
                    `;
                    if (isDisabled) {
                        return `<div class="ams-customer-pipeline-node ams-sales-pipeline-stage ${className}">${body}</div>`;
                    }
                    if (pipelineMode === 'overview') {
                        return `<button class="ams-customer-pipeline-node ams-sales-pipeline-stage is-link ${className}" type="button" data-sales-pipeline-filter="${esc(stage.key)}">${body}</button>`;
                    }
                    return `<a class="ams-customer-pipeline-node ams-sales-pipeline-stage is-link ${className}" href="${esc(jump.href)}">${body}</a>`;
                }).join('')}
            </div>
        </section>
    `;
}

function renderSalesPageFrame(input, title, sub, body, options = {}) {
    input.setPageHeader(options.hidePageHeader ? '' : title, options.hidePageHeader ? '' : sub);
    if (!isSalesConsole(input)) {
        input.setContent(body);
        return;
    }
    const showPipeline = options.showPipeline !== false;
    const activeDeal = Object.prototype.hasOwnProperty.call(options, 'deal')
        ? options.deal
        : dealById(activeDealIdFromState(options.dealId));
    const modeMarkup = options.pipelineMode === 'detail'
        ? `
            <section class="ams-sales-mode-banner is-detail">
                <span class="ams-sales-mode-badge">独立客户流水线</span>
                <strong>当前正在处理单个客户 / 单条销售流程</strong>
                <span>左侧只显示这位客户自己的流程，顶部可回看已完成节点并继续推进当前节点。</span>
            </section>
        `
        : options.pipelineMode === 'overview'
          ? `
            <section class="ams-sales-mode-banner is-overview">
                <span class="ams-sales-mode-badge">总流水线模式（全客户）</span>
                <strong>当前正在查看全局阶段列表</strong>
                <span>左侧是当前节点下全部待处理销售线，适合统一筛选、归档和进入单客户流程。</span>
            </section>
          `
          : '';
    const pageModeClass = options.pipelineMode === 'overview'
        ? 'is-overview'
        : options.pipelineMode === 'detail'
            ? 'is-detail'
            : '';
    input.setContent(`
        <div class="ams-sales-page ${pageModeClass}">
            ${showPipeline ? salesPipelineMarkup(input, {
                deal: activeDeal,
                currentStage: options.currentStage,
                page: options.page,
                pipelineMode: options.pipelineMode,
                customerId: options.customerId,
            }) : ''}
            <div class="ams-sales-page-body">
                ${modeMarkup}
                ${body}
            </div>
        </div>
    `);
}

function bindSalesPageChrome(input) {
    if (!isSalesConsole(input)) return;
    document.querySelectorAll('[data-sales-pipeline-filter]').forEach((button) => {
        button.addEventListener('click', () => {
            const nextStage = normalizeDealStageKey(button.dataset.salesPipelineFilter || '');
            const currentStage = currentSalesStageParam('customer_profile');
            if (!nextStage || nextStage === currentStage) return;
            window.history.replaceState({}, '', adminPageUrl('quote-customers', { stage: nextStage }));
            void renderQuoteCustomersPage(input);
        });
    });
}

function replaceStageRecord(stageKey = '', updater) {
    const normalizedKey = normalizeDealStageKey(stageKey);
    let changed = false;
    const existingRecords = moduleState.dealStageRecords.length
        ? moduleState.dealStageRecords
        : mergeDealStageRecords(moduleState.dealEditor || {}, []);
    moduleState.dealStageRecords = existingRecords.map((record) => {
        if (normalizeDealStageKey(record.stage_key) !== normalizedKey) return createDealStageRecord(record);
        changed = true;
        const next = createDealStageRecord(record);
        return typeof updater === 'function' ? createDealStageRecord(updater(next) || next) : next;
    });
    if (!changed) {
        const seed = createDealStageRecord({
            deal_id: moduleState.dealEditor?.id,
            stage_key: normalizedKey,
            owner_name: moduleState.dealEditor?.owner_name,
            owner_email: moduleState.dealEditor?.owner_email,
        });
        const next = typeof updater === 'function' ? createDealStageRecord(updater(seed) || seed) : seed;
        moduleState.dealStageRecords = [...moduleState.dealStageRecords, next];
    }
}

function setDealStageStatus(stageKey = '', status = 'pending') {
    const normalizedStatus = normalizeDealStageStatus(status);
    const now = new Date().toISOString();
    replaceStageRecord(stageKey, (record) => {
        record.stage_status = normalizedStatus;
        if (normalizedStatus === 'completed') {
            record.completed_at = text(record.completed_at || now);
        } else if (normalizedStatus === 'active') {
            record.completed_at = text(record.completed_at);
        } else if (normalizedStatus === 'pending') {
            record.completed_at = '';
        }
        return record;
    });
    if (normalizedStatus === 'active') {
        moduleState.dealEditor.current_stage = normalizeDealStageKey(stageKey);
    } else if (normalizedStatus === 'completed') {
        moduleState.dealEditor.current_stage = normalizeDealStageKey(nextStageKey(stageKey));
        replaceStageRecord(nextStageKey(stageKey), (record) => {
            if (record.stage_status !== 'completed') record.stage_status = 'active';
            return record;
        });
    }
    moduleState.dealStageRecords = touchDealStageRecords(moduleState.dealStageRecords, moduleState.dealEditor || {});
}

function applyDealStageProgress(completedStages = [], nextStage = '') {
    const completed = new Set((completedStages || []).map((item) => normalizeDealStageKey(item)));
    const activeStage = text(nextStage) ? normalizeDealStageKey(nextStage) : '';
    const now = new Date().toISOString();
    const base = moduleState.dealStageRecords.length
        ? moduleState.dealStageRecords
        : mergeDealStageRecords(moduleState.dealEditor || {}, []);
    moduleState.dealStageRecords = base.map((record) => {
        const next = createDealStageRecord(record);
        if (completed.has(next.stage_key)) {
            next.stage_status = 'completed';
            next.completed_at = text(next.completed_at || now);
        } else if (activeStage && next.stage_key === activeStage) {
            if (next.stage_status !== 'completed') next.stage_status = 'active';
        } else if (next.stage_status !== 'completed' && next.stage_status !== 'blocked') {
            next.stage_status = 'pending';
        }
        return next;
    });
    if (activeStage) {
        moduleState.dealEditor.current_stage = activeStage;
        moduleState.dealStageRecords = ensureActiveStage(moduleState.dealStageRecords, activeStage);
    }
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

function createShareSigningSecret(seed = {}) {
    const slugSource = text(seed.slug || seed.brand_name || seed.display_name || 'brand')
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'brand';
    const timestamp = Date.now().toString(36);
    const randomToken = (() => {
        if (window.crypto?.getRandomValues) {
            const bytes = new Uint8Array(6);
            window.crypto.getRandomValues(bytes);
            return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
        }
        return Math.random().toString(16).slice(2, 10);
    })();
    return `GasGx::Quote::ShareGate::${slugSource}-${timestamp}-${randomToken}`;
}

function ensureShareSigningSecret(seed = {}) {
    const existing = text(seed.share_signing_secret || seed.shareSigningSecret);
    return existing || createShareSigningSecret(seed);
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
        share_signing_secret: ensureShareSigningSecret(seed),
        share_unlock_prefix: text(seed.share_unlock_prefix || seed.shareUnlockPrefix || 'quote-share-unlocked') || 'quote-share-unlocked',
        default_quote_slug: text(seed.default_quote_slug || seed.defaultQuoteSlug),
        is_active: seed.is_active !== false,
    };
}

function createProductDraft(seed = {}) {
    const defaultLang = normalizeLangCode(seed.default_lang || seed.defaultLang, DEFAULT_LANG);
    return {
        id: text(seed.id),
        brand_id: text(seed.brand_id || seed.brandId),
        slug: text(seed.slug),
        product_code: text(seed.product_code || seed.productCode),
        public_title: normalizeLocalizedText(seed.public_title || seed.publicTitle || ''),
        default_lang: defaultLang,
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
    const defaultLang = normalizeLangCode(seed.default_lang || seed.defaultLang, DEFAULT_LANG);
    const draft = {
        id: text(seed.id),
        brand_id: text(seed.brand_id || seed.brandId),
        product_id: text(seed.product_id || seed.productId),
        customer_id: text(seed.customer_id || seed.customerId),
        deal_id: text(seed.deal_id || seed.dealId),
        requirement_id: text(seed.requirement_id || seed.requirementId),
        public_slug: text(seed.public_slug || seed.publicSlug),
        status: normalizedStatus === 'published' || normalizedStatus === 'archived' || normalizedStatus === 'voided' ? normalizedStatus : 'draft',
        last_active_status: text(seed.last_active_status || seed.lastActiveStatus || 'draft') === 'published' ? 'published' : 'draft',
        archived_at: text(seed.archived_at || seed.archivedAt),
        customer_name: text(seed.customer_name || seed.customerName),
        receiver_name: text(seed.receiver_name || seed.receiverName),
        receiver_email: normalizedCustomerEmail(seed.receiver_email || seed.receiverEmail || customerSnapshot.email),
        customer_phone: text(seed.customer_phone || seed.customerPhone || customerSnapshot.phone),
        customer_country: text(seed.customer_country || seed.customerCountry || customerSnapshot.country),
        customer_notes: text(seed.customer_notes || seed.customerNotes || customerSnapshot.notes),
        default_lang: defaultLang,
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
        published_snapshot: seed.published_snapshot && typeof seed.published_snapshot === 'object'
            ? deepClone(seed.published_snapshot)
            : (seed.publishedSnapshot && typeof seed.publishedSnapshot === 'object' ? deepClone(seed.publishedSnapshot) : null),
        section_config: normalizeSectionConfig(seed.section_config || seed.sectionConfig),
        created_at: text(seed.created_at || seed.createdAt),
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
moduleState.dealEditor = createDealDraft();

const BRAND_EDITOR_DRAFT_STORAGE_KEY = 'gasgx.quote.brand-editor-draft.v1';

function persistBrandEditorDraftState() {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    try {
        const draft = createBrandDraft(moduleState.brandEditor || {});
        const hasDraft = moduleState.brandCreateMode === true || Boolean(text(draft.id || draft.slug || draft.display_name || draft.brand_name));
        if (!hasDraft) {
            window.sessionStorage.removeItem(BRAND_EDITOR_DRAFT_STORAGE_KEY);
            return;
        }
        window.sessionStorage.setItem(BRAND_EDITOR_DRAFT_STORAGE_KEY, JSON.stringify({
            brandEditor: draft,
            brandCreateMode: moduleState.brandCreateMode === true,
            brandDisplayNameTouched: moduleState.brandDisplayNameTouched === true,
            brandDefaultLinkTouched: moduleState.brandDefaultLinkTouched === true,
        }));
    } catch (error) {
        // ignore storage failures
    }
}

function restoreBrandEditorDraftState() {
    if (typeof window === 'undefined' || !window.sessionStorage) return false;
    try {
        const raw = window.sessionStorage.getItem(BRAND_EDITOR_DRAFT_STORAGE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (!parsed?.brandEditor) return false;
        moduleState.brandEditor = createBrandDraft(parsed.brandEditor);
        moduleState.brandCreateMode = parsed.brandCreateMode === true;
        moduleState.brandDisplayNameTouched = parsed.brandDisplayNameTouched === true;
        moduleState.brandDefaultLinkTouched = parsed.brandDefaultLinkTouched === true;
        return true;
    } catch (error) {
        return false;
    }
}

function clearBrandEditorDraftState() {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    try {
        window.sessionStorage.removeItem(BRAND_EDITOR_DRAFT_STORAGE_KEY);
    } catch (error) {
        // ignore storage failures
    }
}

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
        .select('id, company_name, contact_name, email, phone, country, notes, is_active, is_deleted, created_at, updated_at')
        .order('company_name', { ascending: true })
        .order('contact_name', { ascending: true });
    if (error) throw error;
    moduleState.customers = Array.isArray(data) ? data.map((row) => createCustomerRecord(row)) : [];
    return moduleState.customers;
}

async function fetchRequirementRows() {
    const { data, error } = await client
        .from(TABLE_REQUIREMENTS)
        .select('id, customer_id, deal_id, title, status, requirement_type, country, requester_company, requester_name, requester_email, requester_phone, public_slug, public_token, submitted_at, answers, notes, is_active, created_at, updated_at')
        .eq('is_active', true)
        .order('updated_at', { ascending: false });
    if (error) throw error;
    moduleState.requirements = Array.isArray(data) ? data.map((row) => createRequirementDraft(row)) : [];
    if (moduleState.deals.length) {
        moduleState.deals = moduleState.deals.map((deal) => syncDealProgressFromRequirements(deal));
        if (text(moduleState.dealLoadedId)) {
            const activeDeal = moduleState.deals.find((item) => item.id === text(moduleState.dealLoadedId));
            if (activeDeal) moduleState.dealEditor = createDealDraft(activeDeal);
        }
    }
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
    const nextRequirement = createRequirementDraft(data);
    const nextRequirements = [...moduleState.requirements];
    const existingIndex = nextRequirements.findIndex((item) => item.id === nextRequirement.id);
    if (existingIndex >= 0) nextRequirements[existingIndex] = nextRequirement;
    else nextRequirements.unshift(nextRequirement);
    moduleState.requirements = nextRequirements;
    moduleState.deals = moduleState.deals.map((deal) => syncDealProgressFromRequirements(deal));
    if (moduleState.dealLoadedId) {
        const syncedDeal = moduleState.deals.find((deal) => deal.id === moduleState.dealLoadedId);
        if (syncedDeal) moduleState.dealEditor = createDealDraft(syncedDeal);
    }
    moduleState.requirementCreateMode = false;
    return moduleState.requirementEditor;
}

async function fetchDealRows() {
    const { data, error } = await client
        .from(TABLE_DEALS)
        .select('id, customer_id, title, current_stage, deal_status, is_archived, archived_at, archived_by, owner_name, owner_email, primary_requirement_id, primary_instance_id, summary, next_action, next_action_due_at, lost_reason, created_at, updated_at')
        .order('updated_at', { ascending: false });
    if (error) throw error;
    moduleState.deals = Array.isArray(data) ? data.map((row) => syncDealProgressFromRequirements(createDealDraft(row))) : [];
    return moduleState.deals;
}

async function fetchDealStageRecords(dealId) {
    if (!dealId) {
        moduleState.dealStageRecords = [];
        return [];
    }
    let query = client
        .from(TABLE_DEAL_STAGE_RECORDS)
        .select(dealStageRecordSelectColumns())
        .eq('deal_id', dealId)
        .order('created_at', { ascending: true });
    let { data, error } = await query;
    if (error && isDealStagePublicLinkSchemaMissing(error) && moduleState.dealStagePublicLinkSupported) {
        moduleState.dealStagePublicLinkSupported = false;
        ({ data, error } = await client
            .from(TABLE_DEAL_STAGE_RECORDS)
            .select(dealStageRecordSelectColumns())
            .eq('deal_id', dealId)
            .order('created_at', { ascending: true }));
    }
    if (error) throw error;
    moduleState.dealStageRecords = mergeDealStageRecords(
        moduleState.deals.find((item) => item.id === dealId) || moduleState.dealEditor || {},
        Array.isArray(data) ? data.map((row) => createDealStageRecord(row)) : [],
    );
    return moduleState.dealStageRecords;
}

async function fetchDealEditor(dealId) {
    if (!dealId) {
        moduleState.dealLoadedId = '';
        moduleState.dealEditor = createDealDraft();
        moduleState.dealStageRecords = mergeDealStageRecords(moduleState.dealEditor, []);
        moduleState.dealCreateMode = true;
        return moduleState.dealEditor;
    }
    const { data, error } = await client.from(TABLE_DEALS).select('*').eq('id', dealId).single();
    if (error) throw error;
    moduleState.dealLoadedId = dealId;
    moduleState.dealEditor = createDealDraft(data);
    moduleState.dealCreateMode = false;
    await fetchDealStageRecords(dealId);
    return moduleState.dealEditor;
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

async function fetchFullProductDraft(productId, seed = {}) {
    if (!productId) return createProductDraft(seed);
    const [itemsResult, mediaRows] = await Promise.all([
        client.from(TABLE_PRODUCT_ITEMS).select('*').eq('product_id', productId).order('sort_order', { ascending: true }),
        fetchProductMediaRows(productId),
    ]);
    if (itemsResult.error) throw itemsResult.error;
    return createProductDraft({
        ...seed,
        id: productId,
        items: itemsResult.data || [],
        media_gallery: mediaRows,
    });
}

async function fetchProductEditor(productId) {
    if (!productId) {
        moduleState.productLoadedId = '';
        moduleState.productEditor = createProductDraft();
        moduleState.productBrandDraft = createBrandDraft();
        moduleState.productCreateMode = false;
        return moduleState.productEditor;
    }
    const { data, error } = await client.from(TABLE_PRODUCTS).select('*').eq('id', productId).single();
    if (error) throw error;
    moduleState.productLoadedId = productId;
    moduleState.productEditor = await fetchFullProductDraft(productId, data);
    moduleState.productCreateMode = false;
    syncProductBrandDraft(moduleState.productEditor.brand_id);
    return moduleState.productEditor;
}

async function fetchInstanceRows() {
    const { data, error } = await client
        .from(TABLE_INSTANCES)
            .select('id, brand_id, product_id, customer_id, deal_id, requirement_id, public_slug, status, last_active_status, archived_at, customer_name, receiver_name, receiver_email, customer_snapshot, share_config, published_snapshot, default_lang, validity_hours, created_at, published_at, updated_at')
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

async function fetchRecentSalesActivities() {
    try {
        const { data, error } = await client
            .from(TABLE_CUSTOMER_ACTIVITIES)
            .select('*')
            .order('occurred_at', { ascending: false })
            .limit(SALES_ACTIVITY_LIMIT);
        if (error) throw error;
        moduleState.recentActivities = Array.isArray(data) ? data.map((row) => createSalesActivityRecord(row)) : [];
        return moduleState.recentActivities;
    } catch (_error) {
        moduleState.recentActivities = [];
        return [];
    }
}

async function fetchActivityReadsForUser(inputUser = null, activityIds = []) {
    const reader = salesActivityReader(inputUser);
    if (!activityIds.length) {
        moduleState.activityReadMap = {};
        return moduleState.activityReadMap;
    }
    try {
        const { data, error } = await client
            .from(TABLE_ACTIVITY_READS)
            .select('activity_id,reader_email,reader_user_id,read_at')
            .eq('reader_email', reader.email)
            .in('activity_id', activityIds);
        if (error) throw error;
        moduleState.activityReadMap = Object.fromEntries(
            (Array.isArray(data) ? data : []).map((row) => [text(row.activity_id), text(row.read_at || new Date().toISOString())]),
        );
        return moduleState.activityReadMap;
    } catch (_error) {
        moduleState.activityReadMap = {};
        return {};
    }
}

function activityIsRead(activity = {}) {
    return Boolean(moduleState.activityReadMap[text(activity.id)]);
}

function activityIsOwnForReader(activity = {}, reader = null) {
    const currentReader = salesActivityReader(reader);
    const actorType = text(activity.actor_type);
    const actorId = text(activity.actor_id);
    const actorLabel = text(activity.actor_label).trim().toLowerCase();
    return actorType === 'sales' && (
        (actorId && actorId === currentReader.userId)
        || (actorLabel && actorLabel === currentReader.email)
    );
}

function recomputeUnreadActivityMaps(reader = null) {
    const stageMap = {};
    const customerMap = {};
    const stageCustomerMap = {};
    (Array.isArray(moduleState.recentActivities) ? moduleState.recentActivities : []).forEach((activity) => {
        if (!activity?.id || activityIsRead(activity) || activityIsOwnForReader(activity, reader)) return;
        const stageKey = normalizeDealStageKey(activity.stage_key);
        if (stageKey) stageMap[stageKey] = true;
        const customerId = text(activity.customer_id);
        if (customerId) customerMap[customerId] = true;
        if (stageKey && customerId) stageCustomerMap[`${stageKey}:${customerId}`] = true;
    });
    moduleState.unreadStageActivityMap = stageMap;
    moduleState.unreadCustomerActivityMap = customerMap;
    moduleState.unreadStageCustomerActivityMap = stageCustomerMap;
    return {
        stageMap,
        customerMap,
        stageCustomerMap,
    };
}

function stageHasUnreadActivity(stageKey = '') {
    return Boolean(moduleState.unreadStageActivityMap[normalizeDealStageKey(stageKey)]);
}

function customerHasUnreadActivity(customerId = '') {
    return Boolean(moduleState.unreadCustomerActivityMap[text(customerId)]);
}

function customerHasUnreadActivityInStage(customerId = '', stageKey = '') {
    const customer = text(customerId);
    const stage = normalizeDealStageKey(stageKey);
    if (!customer || !stage) return customerHasUnreadActivity(customer);
    return Boolean(moduleState.unreadStageCustomerActivityMap[`${stage}:${customer}`]);
}

async function fetchUnreadStageActivitySummary(reader = null) {
    const now = Date.now();
    if (
        moduleState.unreadSummaryLoadedAt > 0
        && now - moduleState.unreadSummaryLoadedAt <= UNREAD_SUMMARY_CACHE_MS
    ) {
        return moduleState.unreadStageActivityMap;
    }
    if (moduleState.unreadSummaryLoadingPromise) {
        return moduleState.unreadSummaryLoadingPromise;
    }
    const request = (async () => {
        const activities = await fetchRecentSalesActivities();
        await fetchActivityReadsForUser(reader, activities.map((item) => item.id).filter(Boolean));
        const summary = recomputeUnreadActivityMaps(reader).stageMap;
        moduleState.unreadSummaryLoadedAt = Date.now();
        return summary;
    })();
    moduleState.unreadSummaryLoadingPromise = request.finally(() => {
        if (moduleState.unreadSummaryLoadingPromise === request) {
            moduleState.unreadSummaryLoadingPromise = null;
        }
    });
    return moduleState.unreadSummaryLoadingPromise;
}

function visibleStageCustomerIds(stageKey = '', input = null) {
    const key = normalizeDealStageKey(stageKey);
    if (key === 'customer_profile') {
        return filteredCustomers().map((item) => text(item.id)).filter(Boolean);
    }
    return visibleStageDeals(key, input).map((deal) => text(deal.customer_id)).filter(Boolean);
}

async function fetchUnreadCustomerActivitySummary(stageKey = '', reader = null, input = null) {
    const key = normalizeDealStageKey(stageKey);
    await fetchUnreadStageActivitySummary(reader);
    const visibleIds = new Set(visibleStageCustomerIds(stageKey, input));
    return Object.fromEntries(
        Object.entries(moduleState.unreadStageCustomerActivityMap)
            .filter(([entry]) => entry.startsWith(`${key}:`))
            .map(([entry]) => [entry.split(':')[1], true])
            .filter(([customerId]) => visibleIds.has(customerId)),
    );
}

function customerActivityTimelineRows(customerId = '') {
    const activityRows = (Array.isArray(moduleState.customerActivities) ? moduleState.customerActivities : []).map((item) => createSalesActivityRecord(item));
    const legacyRows = (Array.isArray(moduleState.customerEvents) ? moduleState.customerEvents : [])
        .map((item) => legacyEventToSalesActivity(item))
        .filter((item) => text(item.customer_id) === text(customerId));
    const seen = new Set(activityRows.map((item) => [text(item.instance_id), text(item.occurred_at), text(item.action_label)].join(':')));
    return collapseCustomerActivityRows(
        [...activityRows, ...legacyRows.filter((item) => !seen.has([text(item.instance_id), text(item.occurred_at), text(item.action_label)].join(':')))]
            .sort((left, right) => text(right.occurred_at).localeCompare(text(left.occurred_at))),
    );
}

async function fetchCustomerActivityTimeline(customerId = '', reader = null) {
    if (!customerId) {
        moduleState.customerActivities = [];
        return [];
    }
    try {
        const { data, error } = await client
            .from(TABLE_CUSTOMER_ACTIVITIES)
            .select('*')
            .eq('customer_id', customerId)
            .order('occurred_at', { ascending: false })
            .limit(200);
        if (error) throw error;
        moduleState.customerActivities = Array.isArray(data) ? data.map((row) => createSalesActivityRecord(row)) : [];
        await fetchActivityReadsForUser(reader, moduleState.customerActivities.map((item) => item.id).filter(Boolean));
        return customerActivityTimelineRows(customerId);
    } catch (_error) {
        moduleState.customerActivities = [];
        return customerActivityTimelineRows(customerId);
    }
}

async function markCustomerActivitiesRead(customerId = '', reader = null, visibleActivityIds = []) {
    const nextIds = visibleActivityIds.filter((item) => text(item) && !String(item).startsWith('legacy:'));
    if (!customerId || !nextIds.length) return;
    const currentReader = salesActivityReader(reader);
    try {
        const now = new Date().toISOString();
        await client.from(TABLE_ACTIVITY_READS).upsert(
            nextIds.map((activityId) => ({
                activity_id: activityId,
                reader_user_id: currentReader.userId,
                reader_email: currentReader.email,
                read_at: now,
            })),
            { onConflict: 'activity_id,reader_email' },
        );
        nextIds.forEach((activityId) => {
            moduleState.activityReadMap[text(activityId)] = now;
        });
        recomputeUnreadActivityMaps();
        moduleState.unreadSummaryLoadedAt = Date.now();
    } catch (_error) {
        return;
    }
}

async function fetchInstanceEditor(instanceId) {
    if (!instanceId) {
        moduleState.instanceLoadedId = '';
        moduleState.instanceEditor = createInstanceDraft();
        moduleState.instanceEvents = [];
        moduleState.instanceEventSummary = emptyInstanceEventSummary();
        moduleState.instanceSends = [];
        moduleState.instanceViewPage = 1;
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
    moduleState.instanceViewPage = 1;
    return moduleState.instanceEditor;
}

async function fetchCustomerEditor(customerId) {
    if (!customerId) {
        moduleState.customerLoadedId = '';
        moduleState.customerEditor = createCustomerDraft();
        moduleState.customerEvents = [];
        moduleState.customerSends = [];
        moduleState.customerActivityFilter = DEFAULT_CUSTOMER_ACTIVITY_FILTER;
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
    moduleState.customerActivityFilter = DEFAULT_CUSTOMER_ACTIVITY_FILTER;
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
        share_signing_secret: ensureShareSigningSecret(payload),
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
    moduleState.brandCreateMode = false;
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
    if (linkedBrandDraft?.id && text(linkedBrandDraft.id) === text(payload.brand_id)) {
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

    const mediaPayload = payload.id
        ? payload.media_gallery
        : normalizeMediaGallery(payload.media_gallery).map((item, index) => createQuoteMediaItem({
            ...item,
            id: '',
            product_id: data.id,
            storage_path: '',
            sort_order: item.sort_order || (index + 1) * 10,
        }));

    const [savedItems, savedMedia] = await Promise.all([
        persistItemRows(TABLE_PRODUCT_ITEMS, 'product_id', data.id, payload.items),
        persistProductMediaRows(data.id, mediaPayload),
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
    moduleState.productCreateMode = false;
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

function summarizeFieldChanges(previous = {}, next = {}, fields = []) {
    return fields
        .map((field) => {
            const before = text(previous?.[field]);
            const after = text(next?.[field]);
            if (before === after) return null;
            return {
                field,
                label: field,
                before,
                after,
            };
        })
        .filter(Boolean);
}

async function saveCustomerDraft(user, draft) {
    const payload = createCustomerDraft(draft);
    const previous = payload.id ? moduleState.customers.find((item) => item.id === payload.id) || {} : {};
    payload.email = normalizedCustomerEmail(payload.email);
    if (!payload.email) throw new Error('客户邮箱是必填项，请填写后再保存。');
    if (!isValidCustomerEmail(payload.email)) throw new Error('客户邮箱格式不正确，请检查后再保存。');
    const duplicated = moduleState.customers.find((item) =>
        text(item.id) !== text(payload.id)
        && normalizedCustomerEmail(item.email) === payload.email
        && item.is_deleted !== true
    );
    if (duplicated) throw new Error('该客户邮箱已被其他客户档案占用，请使用唯一邮箱。');

    const savePayload = {
        company_name: payload.company_name,
        contact_name: payload.contact_name,
        email: payload.email,
        phone: payload.phone,
        country: payload.country,
        notes: payload.notes,
        is_active: payload.is_active !== false,
        is_deleted: payload.is_deleted === true,
        updated_by: user?.id || null,
    };

    let saved = null;
    if (payload.id) {
        const { data, error } = await client.from(TABLE_CUSTOMERS).update(savePayload).eq('id', payload.id).select('*').single();
        if (error?.code === '23505') throw new Error('该客户邮箱已被其他客户档案占用，请使用唯一邮箱。');
        if (error) throw error;
        saved = data;
    } else {
        const { data, error } = await client.from(TABLE_CUSTOMERS).insert({
            ...savePayload,
            created_by: user?.id || null,
        }).select('*').single();
        if (error?.code === '23505') throw new Error('该客户邮箱已被其他客户档案占用，请使用唯一邮箱。');
        if (error) throw error;
        saved = data;
    }

    await fetchCustomerRows();
    moduleState.customerLoadedId = text(saved?.id);
    moduleState.customerEditor = createCustomerDraft(saved);
    moduleState.customerCreateMode = false;
    const fieldChanges = summarizeFieldChanges(previous, saved, ['company_name', 'contact_name', 'email', 'phone', 'country', 'notes']);
    await appendSalesActivity({
        customer_id: saved.id,
        actor_type: 'sales',
        actor_id: user?.id,
        actor_label: user?.email || user?.id || 'sales',
        activity_type: payload.id ? (fieldChanges.length ? 'field_change' : 'status_change') : 'button_click',
        entity_type: 'customer',
        entity_id: saved.id,
        page_key: 'quote-customers',
        action_label: payload.id ? '更新客户档案' : '创建客户档案',
        stage_key: 'customer_profile',
        detail_json: {
            fields: fieldChanges,
            summary: payload.id ? '客户主档已保存' : '客户主档已创建',
            is_deleted: saved.is_deleted === true,
            is_active: saved.is_active !== false,
        },
    });
    return moduleState.customerEditor;
}

async function saveDealStageRecords(user, dealId, records = moduleState.dealStageRecords, dealDraft = moduleState.dealEditor) {
    if (!dealId) {
        moduleState.dealStageRecords = [];
        return [];
    }
    const baseDeal = createDealDraft({
        ...(dealDraft || {}),
        id: dealId,
    });
    const owner = currentSalesOwner(user);
    const payload = touchDealStageRecords(records, baseDeal).map((record) => {
        const next = createDealStageRecord({
            ...record,
            deal_id: dealId,
            owner_name: text(record.owner_name, baseDeal.owner_name || owner.name),
            owner_email: text(record.owner_email, baseDeal.owner_email || owner.email),
        });
        return {
            deal_id: dealId,
            stage_key: next.stage_key,
            stage_status: next.stage_status,
            planned_at: next.planned_at || null,
            completed_at: next.completed_at || null,
            owner_name: next.owner_name,
            owner_email: next.owner_email,
            notes: next.notes,
            meta: next.meta && typeof next.meta === 'object' ? next.meta : {},
            updated_by: user?.id || null,
            created_by: user?.id || null,
        };
    });
    const { data, error } = await client
        .from(TABLE_DEAL_STAGE_RECORDS)
        .upsert(payload, { onConflict: 'deal_id,stage_key' })
        .select('*');
    if (error) throw error;
    moduleState.dealStageRecords = mergeDealStageRecords(
        baseDeal,
        Array.isArray(data) ? data.map((row) => createDealStageRecord(row)) : payload,
    );
    return moduleState.dealStageRecords;
}

async function saveDealDraft(user, draft, options = {}) {
    const payload = createDealDraft(draft);
    const previous = payload.id ? dealById(payload.id) || {} : {};
    if (!payload.customer_id) throw new Error('销售流程必须绑定一个客户档案。');
    const customer = moduleState.customers.find((item) => item.id === payload.customer_id) || moduleState.customerEditor;
    const owner = currentSalesOwner(user);
    const currentStage = normalizeDealStageKey(options.currentStage || payload.current_stage);
    const nextDraft = createDealDraft({
        ...payload,
        current_stage: currentStage,
        owner_name: text(payload.owner_name, owner.name),
        owner_email: text(payload.owner_email, owner.email),
        title: text(payload.title, `${customerDisplayName(customer || {})} / 销售流程`),
    });
    const stageRecords = touchDealStageRecords(options.stageRecords || moduleState.dealStageRecords, nextDraft);
    nextDraft.current_stage = inferDealCurrentStage(stageRecords, currentStage);
    const savePayload = {
        customer_id: nextDraft.customer_id,
        title: nextDraft.title,
        current_stage: nextDraft.current_stage,
        deal_status: normalizeDealStatus(nextDraft.deal_status),
        is_archived: nextDraft.is_archived === true,
        archived_at: nextDraft.is_archived === true ? text(nextDraft.archived_at || new Date().toISOString()) : null,
        archived_by: nextDraft.is_archived === true ? text(nextDraft.archived_by || user?.id) || null : null,
        owner_name: nextDraft.owner_name,
        owner_email: nextDraft.owner_email,
        primary_requirement_id: nextDraft.primary_requirement_id || null,
        primary_instance_id: nextDraft.primary_instance_id || null,
        summary: nextDraft.summary,
        next_action: nextDraft.next_action,
        next_action_due_at: nextDraft.next_action_due_at || null,
        lost_reason: nextDraft.lost_reason,
        updated_by: user?.id || null,
    };
    let saved = null;
    if (nextDraft.id) {
        const { data, error } = await client.from(TABLE_DEALS).update(savePayload).eq('id', nextDraft.id).select('*').single();
        if (error) throw error;
        saved = data;
    } else {
        const { data, error } = await client.from(TABLE_DEALS).insert({
            ...savePayload,
            created_by: user?.id || null,
        }).select('*').single();
        if (error) throw error;
        saved = data;
    }
    await fetchDealRows();
    moduleState.dealLoadedId = text(saved?.id);
    moduleState.dealEditor = createDealDraft(saved);
    moduleState.dealCreateMode = false;
    moduleState.dealStageRecords = stageRecords.map((record) => createDealStageRecord({
        ...record,
        deal_id: saved.id,
        owner_name: text(record.owner_name, moduleState.dealEditor.owner_name),
        owner_email: text(record.owner_email, moduleState.dealEditor.owner_email),
    }));
    await saveDealStageRecords(user, saved.id, moduleState.dealStageRecords, moduleState.dealEditor);
    const fieldChanges = summarizeFieldChanges(previous, saved, ['title', 'current_stage', 'deal_status', 'next_action', 'next_action_due_at', 'owner_name', 'owner_email', 'summary']);
    await appendSalesActivity({
        customer_id: saved.customer_id,
        deal_id: saved.id,
        actor_type: 'sales',
        actor_id: user?.id,
        actor_label: user?.email || user?.id || 'sales',
        activity_type: payload.id ? (fieldChanges.some((item) => item.field === 'current_stage') ? 'status_change' : 'field_change') : 'button_click',
        entity_type: 'deal',
        entity_id: saved.id,
        page_key: 'quote-deals',
        action_label: payload.id ? '更新销售流程' : '创建销售流程',
        stage_key: saved.current_stage,
        detail_json: {
            fields: fieldChanges,
            summary: text(saved.next_action || saved.summary),
        },
    });
    return moduleState.dealEditor;
}

async function saveRequirementDraft(user, draft) {
    const payload = createRequirementDraft(draft);
    const previous = payload.id ? requirementById(payload.id) || {} : {};
    if (!payload.customer_id) throw new Error('需求获取单必须绑定一个客户档案。');
    const customer = moduleState.customers.find((item) => item.id === payload.customer_id) || moduleState.customerEditor;
    const customerEmail = normalizedCustomerEmail(customer?.email);
    if (!customerEmail) throw new Error('当前客户档案缺少邮箱，请先在客户建档节点补全邮箱。');
    payload.requester_email = customerEmail;
    const publicSlug = payload.public_slug || createRequirementPublicSlug(payload);
    const publicToken = payload.public_token || createRequirementPublicToken();
    const savePayload = {
        customer_id: payload.customer_id,
        deal_id: payload.deal_id || null,
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
    const fieldChanges = summarizeFieldChanges(previous, saved, ['title', 'status', 'requester_company', 'requester_name', 'requester_email', 'requester_phone', 'country', 'notes']);
    await appendSalesActivity({
        customer_id: saved.customer_id,
        deal_id: saved.deal_id,
        requirement_id: saved.id,
        actor_type: 'sales',
        actor_id: user?.id,
        actor_label: user?.email || user?.id || 'sales',
        activity_type: payload.id ? (fieldChanges.some((item) => item.field === 'status') ? 'status_change' : 'field_change') : 'button_click',
        entity_type: 'requirement',
        entity_id: saved.id,
        page_key: 'quote-requirements',
        action_label: payload.id ? '更新需求单' : '创建需求单',
        stage_key: normalizeRequirementStatus(saved.status) === 'submitted' ? 'requirement_confirmed' : 'requirement_capture',
        detail_json: {
            fields: fieldChanges,
            summary: requirementSummaryLine(saved),
        },
    });
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

async function createInstanceFromProduct(user, productId, options = {}) {
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
    const dealId = text(options.dealId || activeDealIdFromState());
    const deal = dealId ? dealById(dealId) : null;
    const customer = deal?.customer_id ? moduleState.customers.find((item) => item.id === deal.customer_id) : null;
    const customerEmail = normalizedCustomerEmail(customer?.email);
    if (deal?.customer_id && !customerEmail) throw new Error('当前客户档案缺少邮箱，请先在客户建档节点补全邮箱。');

    const draft = createInstanceDraft({
        brand_id: brand.id,
        product_id: product.id,
        customer_id: customer?.id || '',
        deal_id: dealId,
        public_slug: createPublicSlug(brand.slug, product.slug),
        status: 'draft',
        last_active_status: 'draft',
        customer_name: text(customer?.company_name),
        receiver_name: text(customer?.contact_name),
        receiver_email: customerEmail,
        customer_phone: text(customer?.phone),
        customer_country: text(customer?.country),
        customer_notes: text(customer?.notes),
        customer_snapshot: normalizeCustomerSnapshot(customer || {}),
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
            customer_id: draft.customer_id || null,
            deal_id: draft.deal_id || null,
            requirement_id: null,
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
            share_config: draft.share_config || {},
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
    if (dealId) {
        await saveAndAdvanceDeal(user, {
            id: dealId,
            customer_id: customer?.id || moduleState.instanceEditor.customer_id,
            primary_instance_id: moduleState.instanceEditor.id,
        }, ['customer_profile'], 'quote_draft');
    }
    await appendSalesActivity({
        customer_id: moduleState.instanceEditor.customer_id,
        deal_id: moduleState.instanceEditor.deal_id,
        instance_id: moduleState.instanceEditor.id,
        actor_type: 'system',
        actor_id: user?.id,
        actor_label: user?.email || 'system',
        activity_type: 'quote_generated',
        entity_type: 'quote_instance',
        entity_id: moduleState.instanceEditor.id,
        page_key: 'quote-instances',
        stage_key: 'quote_draft',
        action_label: '从产品模板生成报价草稿',
        detail_json: {
            product_id: moduleState.instanceEditor.product_id,
            brand_id: moduleState.instanceEditor.brand_id,
            summary: productLabelById(moduleState.instanceEditor.product_id),
        },
    });
    return moduleState.instanceEditor;
}

async function createInstanceFromRequirement(user, requirementId, productId, options = {}) {
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
    const customerEmail = normalizedCustomerEmail(customer.email);
    if (!customerEmail) throw new Error('当前客户档案缺少邮箱，请先在客户建档节点补全邮箱。');
    const dealId = text(requirement.deal_id || options.dealId || activeDealIdFromState());

    const notesBlock = [customer.notes, `需求获取摘要：${requirementSummaryLine(requirement)}`, text(requirement.answers?.extra_notes), requirement.notes]
        .map((entry) => text(entry))
        .filter(Boolean)
        .join('\n\n');

    const draft = createInstanceDraft({
        brand_id: brand.id,
        product_id: product.id,
        customer_id: customer.id,
        deal_id: dealId,
        requirement_id: requirement.id,
        public_slug: createPublicSlug(brand.slug, product.slug),
        status: 'draft',
        last_active_status: 'draft',
        customer_name: customer.company_name,
        receiver_name: customer.contact_name,
        receiver_email: customerEmail,
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
            deal_id: draft.deal_id || null,
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
    if (dealId) {
        await saveAndAdvanceDeal(user, {
            id: dealId,
            customer_id: customer.id,
            primary_requirement_id: requirement.id,
            primary_instance_id: moduleState.instanceEditor.id,
        }, ['customer_profile', 'requirement_capture', 'requirement_confirmed'], 'quote_draft');
    }
    await appendSalesActivity({
        customer_id: moduleState.instanceEditor.customer_id,
        deal_id: moduleState.instanceEditor.deal_id,
        requirement_id: requirement.id,
        instance_id: moduleState.instanceEditor.id,
        actor_type: 'system',
        actor_id: user?.id,
        actor_label: user?.email || 'system',
        activity_type: 'quote_generated',
        entity_type: 'quote_instance',
        entity_id: moduleState.instanceEditor.id,
        page_key: 'quote-instances',
        stage_key: 'quote_draft',
        action_label: '从需求单生成报价草稿',
        detail_json: {
            requirement_id: requirement.id,
            product_id: moduleState.instanceEditor.product_id,
            summary: requirementSummaryLine(requirement),
        },
    });
    return moduleState.instanceEditor;
}

async function saveInstanceDraft(user, draft) {
    const payload = createInstanceDraft(draft);
    const previous = payload.id ? instanceById(payload.id) || {} : {};
    if (!payload.brand_id || !payload.product_id) throw new Error('报价单必须绑定品牌和产品模板。');
    if (!payload.public_slug) throw new Error('请填写公开链接 slug。');
    if (!pickLocalized(payload.product_snapshot.public_title, payload.default_lang)) throw new Error('请至少填写一个产品标题。');
    if (payload.customer_id) {
        const customer = moduleState.customers.find((item) => item.id === payload.customer_id) || moduleState.customerEditor;
        const customerEmail = normalizedCustomerEmail(customer?.email);
        if (!customerEmail) throw new Error('当前客户档案缺少邮箱，请先在客户建档节点补全邮箱。');
        payload.receiver_email = customerEmail;
        payload.share_config = normalizeShareConfig(payload.share_config, {
            recipient_email: customerEmail,
        });
    }
    const customerRelation = await upsertCustomerForInstance(user, payload);
    const normalizedReceiverEmail = normalizedCustomerEmail(customerRelation.customer_snapshot?.email || payload.receiver_email);
    if (!normalizedReceiverEmail) throw new Error('当前客户邮箱为空，无法保存报价。请先补全客户邮箱。');
    payload.receiver_email = normalizedReceiverEmail;

    const savePayload = {
        brand_id: payload.brand_id,
        product_id: payload.product_id,
        customer_id: customerRelation.customer_id || null,
        deal_id: payload.deal_id || null,
        requirement_id: payload.requirement_id || null,
        public_slug: payload.public_slug,
        status: 'draft',
        last_active_status: 'draft',
        archived_at: null,
        archived_by: null,
        customer_name: payload.customer_name,
        receiver_name: payload.receiver_name,
        receiver_email: normalizedReceiverEmail,
        default_lang: payload.default_lang,
        validity_hours: payload.validity_hours,
        draft_rates: normalizeRates(payload.draft_rates),
        share_config: normalizeShareConfig(payload.share_config, {
            recipient_email: normalizedReceiverEmail,
        }),
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
    const fieldChanges = summarizeFieldChanges(previous, data, ['public_slug', 'customer_name', 'receiver_name', 'receiver_email', 'default_lang', 'validity_hours', 'status']);
    await appendSalesActivity({
        customer_id: customerRelation.customer_id || previous.customer_id,
        deal_id: data.deal_id,
        requirement_id: data.requirement_id,
        instance_id: data.id,
        actor_type: 'sales',
        actor_id: user?.id,
        actor_label: user?.email || user?.id || 'sales',
        activity_type: payload.id ? 'field_change' : 'button_click',
        entity_type: 'quote_instance',
        entity_id: data.id,
        page_key: 'quote-instances',
        stage_key: inferSalesActivityStageKey({ instance_id: data.id }),
        action_label: payload.id ? '保存报价草稿' : '创建报价草稿',
        detail_json: {
            fields: fieldChanges,
            summary: text(data.public_slug),
        },
    });
    return moduleState.instanceEditor;
}

async function saveAndAdvanceDeal(user, dealPatch = {}, completedStages = [], nextStage = '') {
    const dealId = text(dealPatch.id || dealPatch.deal_id || activeDealIdFromState());
    if (!dealId) throw new Error('当前动作必须绑定到一个商机。');
    if (text(moduleState.dealLoadedId) !== dealId) {
        await fetchDealEditor(dealId);
    }
    moduleState.dealEditor = createDealDraft({
        ...moduleState.dealEditor,
        ...dealPatch,
        id: dealId,
    });
    moduleState.dealStageRecords = dealCurrentRecords(moduleState.dealEditor);
    applyDealStageProgress(completedStages, nextStage || moduleState.dealEditor.current_stage);
    const saved = await saveDealDraft(user, moduleState.dealEditor, {
        stageRecords: moduleState.dealStageRecords,
        currentStage: moduleState.dealEditor.current_stage,
    });
    if (nextStage) {
        await appendSalesActivity({
            customer_id: saved.customer_id,
            deal_id: saved.id,
            actor_type: 'system',
            actor_id: user?.id,
            actor_label: user?.email || 'system',
            activity_type: 'stage_advanced',
            entity_type: 'deal_stage',
            entity_id: nextStage,
            page_key: 'quote-customer-flow',
            stage_key: nextStage,
            action_label: `销售流程推进到${dealStageLabel(nextStage)}`,
            detail_json: {
                completed_stages: completedStages,
                next_stage: nextStage,
            },
        });
    }
    return saved;
}

async function confirmRequirementForDeal(user, requirementDraft) {
    const savedRequirement = await saveRequirementDraft(user, {
        ...requirementDraft,
        status: normalizeRequirementStatus(requirementDraft?.status) === 'draft' ? 'reviewing' : requirementDraft?.status,
    });
    if (!savedRequirement.deal_id) throw new Error('请先把需求单绑定到一个商机，再确认需求。');
    await saveAndAdvanceDeal(user, {
        id: savedRequirement.deal_id,
        customer_id: savedRequirement.customer_id,
        primary_requirement_id: savedRequirement.id,
    }, ['customer_profile', 'requirement_capture', 'requirement_confirmed'], 'quote_draft');
    moduleState.requirementEditor = createRequirementDraft(savedRequirement);
    return savedRequirement;
}

async function confirmQuoteForDeal(user, instanceDraft) {
    const savedInstance = await saveInstanceDraft(user, instanceDraft);
    if (!savedInstance.deal_id) throw new Error('请先把报价单绑定到一个商机，再确认报价。');
    const completedStages = ['quote_draft', 'quote_confirmed'];
    if (savedInstance.customer_id) completedStages.unshift('customer_profile');
    if (savedInstance.requirement_id || moduleState.dealEditor?.primary_requirement_id) {
        completedStages.splice(1, 0, 'requirement_capture', 'requirement_confirmed');
    }
    const quoteTerms = stageMetaValue(stageRecordByKey('quote_confirmed', moduleState.dealStageRecords), 'quote_terms');
    if (quoteTerms) {
        replaceStageRecord('contract_signed', (record) => {
            record.meta = {
                ...(record.meta || {}),
                quote_terms: quoteTerms,
            };
            return record;
        });
    }
    await saveAndAdvanceDeal(user, {
        id: savedInstance.deal_id,
        customer_id: savedInstance.customer_id || moduleState.dealEditor?.customer_id,
        primary_requirement_id: savedInstance.requirement_id || moduleState.dealEditor?.primary_requirement_id,
        primary_instance_id: savedInstance.id,
    }, completedStages, 'contract_signed');
    moduleState.instanceEditor = createInstanceDraft(savedInstance);
    await appendSalesActivity({
        customer_id: savedInstance.customer_id,
        deal_id: savedInstance.deal_id,
        requirement_id: savedInstance.requirement_id,
        instance_id: savedInstance.id,
        actor_type: 'sales',
        actor_id: user?.id,
        actor_label: user?.email || user?.id || 'sales',
        activity_type: 'status_change',
        entity_type: 'quote_instance',
        entity_id: savedInstance.id,
        page_key: 'quote-customer-flow',
        stage_key: 'quote_confirmed',
        action_label: '确认报价并转入签约合同',
        detail_json: {
            next_stage: 'contract_signed',
            summary: text(savedInstance.public_slug),
        },
    });
    return savedInstance;
}

function quoteInstanceReadyForConfirmation(instanceDraft = {}) {
    return text(instanceDraft?.status) === 'published' && Boolean(text(instanceDraft?.public_slug));
}

function parseQuoteVersionNumber(value = '') {
    const raw = text(value);
    if (!raw) return 0;
    const matched = raw.match(/(\d+)(?:\.\d+)?/);
    if (!matched) return 0;
    const next = Number(matched[1]);
    return Number.isFinite(next) && next > 0 ? next : 0;
}

function quoteVersionLabel(instance = {}) {
    const value = text(
        instance?.published_snapshot?.quote?.quoteVersion
        || instance?.published_snapshot?.quote?.version
    );
    return value || '--';
}

function nextQuoteVersionLabel(instance = {}) {
    const current = quoteVersionLabel(instance);
    const major = parseQuoteVersionNumber(current);
    return `${Math.max(major, 0) + 1}.0`;
}

function quoteHasUnpublishedChanges(instance = {}) {
    const publishedAt = Date.parse(text(instance?.published_at));
    const updatedAt = Date.parse(text(instance?.updated_at));
    if (!Number.isFinite(publishedAt) || !Number.isFinite(updatedAt)) return false;
    return updatedAt > publishedAt + 1000;
}

async function ensurePublishedQuoteForStage(user, stageKey = '', instanceDraft = {}) {
    const normalizedStageKey = normalizeDealStageKey(stageKey);
    if (!instanceDraft?.id || !text(instanceDraft?.public_slug)) return instanceDraft;
    const publishedReceiverEmail = normalizedCustomerEmail(
        instanceDraft?.published_snapshot?.quote?.receiverEmail
        || instanceDraft?.published_snapshot?.quote?.receiver_email
    );
    if (text(instanceDraft?.status) === 'published' && instanceDraft?.published_snapshot && publishedReceiverEmail) return instanceDraft;
    if (normalizedStageKey !== 'quote_confirmed') return instanceDraft;
    return publishInstance(user, instanceDraft);
}

function quotePublishedForStage(stageKey = '', instance = {}) {
    const normalizedStageKey = normalizeDealStageKey(stageKey);
    return Boolean(text(instance?.public_slug)) && (
        text(instance?.status) === 'published'
        || normalizedStageKey === 'quote_confirmed'
    );
}

function quoteStatusForStage(stageKey = '', instance = {}) {
    if (quotePublishedForStage(stageKey, instance)) return 'published';
    return text(instance?.status || 'draft');
}

async function advancePublishedQuoteDeal(user, instanceDraft) {
    const savedInstance = await saveInstanceDraft(user, instanceDraft);
    if (!savedInstance.deal_id) throw new Error('请先把报价单绑定到一个商机，再推进到确认报价。');
    const completedStages = ['quote_draft'];
    if (savedInstance.customer_id) completedStages.unshift('customer_profile');
    if (savedInstance.requirement_id || moduleState.dealEditor?.primary_requirement_id) {
        completedStages.splice(1, 0, 'requirement_capture', 'requirement_confirmed');
    }
    const savedDeal = await saveAndAdvanceDeal(user, {
        id: savedInstance.deal_id,
        customer_id: savedInstance.customer_id || moduleState.dealEditor?.customer_id,
        primary_requirement_id: savedInstance.requirement_id || moduleState.dealEditor?.primary_requirement_id,
        primary_instance_id: savedInstance.id,
    }, completedStages, 'quote_confirmed');
    moduleState.instanceEditor = createInstanceDraft(savedInstance);
    await appendSalesActivity({
        customer_id: savedInstance.customer_id,
        deal_id: savedInstance.deal_id,
        requirement_id: savedInstance.requirement_id,
        instance_id: savedInstance.id,
        actor_type: 'system',
        actor_id: user?.id,
        actor_label: user?.email || user?.id || 'system',
        activity_type: 'stage_advanced',
        entity_type: 'quote_instance',
        entity_id: savedInstance.id,
        page_key: 'quote-customer-flow',
        stage_key: 'quote_confirmed',
        action_label: '报价已发布并进入确认报价',
        detail_json: {
            next_stage: 'quote_confirmed',
            summary: text(savedInstance.public_slug),
        },
    });
    return savedDeal;
}

async function publishInstance(user, draft) {
    const savedDraft = await saveInstanceDraft(user, draft);
    const publishVersion = nextQuoteVersionLabel(savedDraft);
    const snapshot = buildQuoteSnapshot({
        brand: savedDraft.brand_snapshot,
        product: savedDraft.product_snapshot,
        instance: {
            ...savedDraft,
            quote_version: publishVersion,
        },
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
    const linkedDeal = dealById(text(data.deal_id || savedDraft.deal_id)) || moduleState.dealEditor;
    if (
        linkedDeal?.id
        && stageOrderIndex(normalizeDealStageKey(linkedDeal.current_stage)) <= stageOrderIndex('quote_draft')
        && quoteInstanceReadyForConfirmation(moduleState.instanceEditor)
    ) {
        try {
            await advancePublishedQuoteDeal(user, moduleState.instanceEditor);
        } catch (_error) {
            // Keep publish successful even if the sales stage sync is temporarily unavailable.
        }
    }
    return moduleState.instanceEditor;
}

function publicQuoteUrl(publicSlug, options = {}) {
    const url = new URL(`/quote/view.html?quote=${encodeURIComponent(publicSlug)}`, window.location.origin);
    if (text(options.confirmStage)) url.searchParams.set('confirm_stage', text(options.confirmStage));
    if (text(options.confirmToken)) url.searchParams.set('confirm_token', text(options.confirmToken));
    const assetVersion = text(window.AMS_QUOTE_PUBLIC_ASSET_VERSION);
    if (assetVersion) url.searchParams.set('v', assetVersion);
    return url.toString();
}

function quotePublicUrlForStage(instance = {}, stageRecord = null) {
    const publicSlug = text(instance?.public_slug);
    if (!publicSlug) return '';
    return publicQuoteUrl(publicSlug, {
        confirmStage: text(stageRecord?.public_slug),
        confirmToken: text(stageRecord?.public_token),
    });
}

function quoteSharePrimaryBrandLine(instance = {}) {
    const brand = displayBrandDraft(extractBrandSnapshot(instance.brand_snapshot || instance.brandSnapshot || {}));
    return text(brand.display_name || brand.brand_name || brandLabelById(instance.brand_id), 'GasGx');
}

function quoteSharePrimaryProductLine(instance = {}) {
    const product = extractProductSnapshot(instance.product_snapshot || instance.productSnapshot || {});
    return text(pickLocalized(product.public_title, instance.default_lang || product.default_lang, ''), productLabelById(instance.product_id));
}

function quoteShareSupportLine(instance = {}) {
    const shareConfig = normalizeShareConfig(instance.share_config || instance.shareConfig || {});
    return text(shareConfig.owner_email || shareConfig.recipient_email || '', 'sales@gasgx.com');
}

function quoteShareCopyText(instance = {}, options = {}) {
    const url = text(options.url, publicQuoteUrl(instance.public_slug));
    const brandLine = quoteSharePrimaryBrandLine(instance);
    const productLine = quoteSharePrimaryProductLine(instance);
    const customerLine = text(instance.customer_name || instance.receiver_name || '', '尊敬的客户');
    return [
        `${customerLine}，您好：`,
        '',
        `这是来自 ${brandLine} 的 ${productLine} 报价方案链接。`,
        '用途说明：打开后可直接查看本次产品配置、价格明细、交付范围与说明，方便您内部转发、评估和确认。',
        '品牌说明：GasGx 提供面向燃气发电与矿电场景的产品方案整合、配置呈现与报价支持服务。',
        '',
        `Hello ${customerLine},`,
        '',
        `This is the quotation link for ${productLine} from ${brandLine}.`,
        'Purpose: open the link to review the product configuration, pricing details, delivery scope, and key notes for internal sharing and confirmation.',
        'About GasGx: integrated quotation and solution support for gas power generation and mining power scenarios.',
        '',
        '查看链接：',
        url,
        '',
        `如需调整配置或补充商务信息，请直接联系 ${quoteShareSupportLine(instance)} 。`,
        `For configuration updates or commercial questions, please contact ${quoteShareSupportLine(instance)}.`,
    ].join('\n');
}

const sharePosterQrCache = new Map();

function quoteQrImageUrl(url = '', size = 512) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${Math.max(180, Number(size) || 512)}x${Math.max(180, Number(size) || 512)}&margin=0&format=svg&data=${encodeURIComponent(url)}`;
}

function svgTextLine(value = '', fallback = '--') {
    return text(value, fallback)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function svgTextMeasureUnit(char = '') {
    return /[ -~]/.test(char) ? 0.54 : 1;
}

function wrapSvgText(value = '', { fallback = '--', maxUnits = 18, maxLines = 2 } = {}) {
    const source = text(value, fallback).replace(/\s+/g, ' ').trim() || fallback;
    const chars = Array.from(source);
    const lines = [];
    let buffer = '';
    let units = 0;
    chars.forEach((char) => {
        const nextUnits = units + svgTextMeasureUnit(char);
        if (buffer && nextUnits > maxUnits && lines.length < maxLines - 1) {
            lines.push(buffer.trim());
            buffer = char;
            units = svgTextMeasureUnit(char);
            return;
        }
        if (buffer && nextUnits > maxUnits && lines.length >= maxLines - 1) {
            buffer = `${buffer.trim()}…`;
            units = maxUnits;
            return;
        }
        buffer += char;
        units = nextUnits;
    });
    if (buffer.trim()) lines.push(buffer.trim());
    return lines.slice(0, maxLines);
}

function svgTextBlock(lines = [], { x = 0, y = 0, lineHeight = 32, fill = '#ffffff', fontSize = 24, fontWeight = 700, letterSpacing = 0 } = {}) {
    return lines.map((line, index) => `
  <text x="${x}" y="${y + (index * lineHeight)}" fill="${fill}" font-size="${fontSize}" font-weight="${fontWeight}" font-family="Segoe UI, Arial, sans-serif"${letterSpacing ? ` letter-spacing="${letterSpacing}"` : ''}>${svgTextLine(line, '')}</text>`).join('');
}

async function quoteQrSvgMarkup(url = '', { x = 0, y = 0, size = 360, radius = 28 } = {}) {
    const normalizedUrl = text(url);
    if (!normalizedUrl) throw new Error('缺少二维码链接。');
    const cacheKey = `${normalizedUrl}::${size}`;
    if (sharePosterQrCache.has(cacheKey)) return sharePosterQrCache.get(cacheKey);
    const response = await fetch(quoteQrImageUrl(normalizedUrl, size), { cache: 'force-cache' });
    if (!response.ok) throw new Error('二维码加载失败。');
    const source = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(source, 'image/svg+xml');
    const svgNode = doc.querySelector('svg');
    if (!svgNode) throw new Error('二维码内容无效。');
    const viewBox = text(svgNode.getAttribute('viewBox')) || `0 0 ${size} ${size}`;
    const inner = svgNode.innerHTML;
    const markup = `
  <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${radius}" fill="#ffffff"/>
  <svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
    sharePosterQrCache.set(cacheKey, markup);
    return markup;
}

function posterDataUrlFromSvg(svg = '') {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function quoteSharePosterDataUrl(instance = {}, options = {}) {
    const url = text(options.url, publicQuoteUrl(instance.public_slug));
    const brandLine = svgTextLine(quoteSharePrimaryBrandLine(instance), 'GasGx');
    const productLines = wrapSvgText(quoteSharePrimaryProductLine(instance), { fallback: '客户报价方案', maxUnits: 13, maxLines: 2 });
    const customerLine = svgTextLine(text(instance.customer_name || instance.receiver_name || '', '专属客户报价'));
    const customerLines = wrapSvgText(text(instance.customer_name || instance.receiver_name || '', 'Exclusive Customer Quote'), { fallback: 'Exclusive Customer Quote', maxUnits: 20, maxLines: 2 });
    const supportLine = svgTextLine(quoteShareSupportLine(instance), 'sales@gasgx.com');
    const qrMarkup = await quoteQrSvgMarkup(url, { x: 312, y: 714, size: 336, radius: 26 });
    const slugLine = svgTextLine(text(instance.public_slug), '');
    const customerLineY = 332 + (Math.max(customerLines.length - 1, 0) * 34);
    const productLineY = customerLineY + 62;
    const productMetaY = productLineY + (Math.max(productLines.length - 1, 0) * 48) + 58;
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="1360" viewBox="0 0 960 1360">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#091109"/>
      <stop offset="55%" stop-color="#122512"/>
      <stop offset="100%" stop-color="#081008"/>
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#133213"/>
      <stop offset="100%" stop-color="#0b1b0b"/>
    </linearGradient>
    <linearGradient id="hero" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="rgba(125,255,69,0.18)"/>
      <stop offset="100%" stop-color="rgba(125,255,69,0.04)"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#93ff5a"/>
      <stop offset="100%" stop-color="#56cc28"/>
    </linearGradient>
  </defs>
  <rect width="960" height="1360" rx="0" fill="url(#bg)"/>
  <circle cx="790" cy="168" r="180" fill="#183f18" opacity="0.22"/>
  <circle cx="180" cy="1154" r="244" fill="#143014" opacity="0.2"/>
  <rect x="56" y="56" width="848" height="1248" rx="42" fill="rgba(8,12,8,0.82)" stroke="rgba(125,255,69,0.22)" />
  <rect x="108" y="108" width="744" height="392" rx="34" fill="url(#hero)" stroke="rgba(125,255,69,0.14)"/>
  <text x="136" y="170" fill="#ffffff" font-size="60" font-weight="800" font-family="Segoe UI, Arial, sans-serif">GasGx</text>
  <text x="336" y="170" fill="#7dff45" font-size="60" font-weight="800" font-family="Segoe UI, Arial, sans-serif">AMS</text>
  <text x="136" y="216" fill="#a7ef79" font-size="19" font-weight="800" font-family="Segoe UI, Arial, sans-serif" letter-spacing="4">QUOTE SHARE</text>
  <text x="136" y="266" fill="#8be35b" font-size="18" font-weight="700" font-family="Segoe UI, Arial, sans-serif">客户报价 | Customer Quote</text>
  ${svgTextBlock(customerLines, { x: 136, y: 332, lineHeight: 34, fill: '#ffffff', fontSize: 28, fontWeight: 800 })}
  <text x="136" y="${customerLineY + 34}" fill="rgba(255,255,255,0.66)" font-size="18" font-weight="500" font-family="Segoe UI, Arial, sans-serif">${customerLine}</text>
  ${svgTextBlock(productLines, { x: 136, y: productLineY, lineHeight: 48, fill: '#f5fbef', fontSize: 40, fontWeight: 800 })}
  <text x="136" y="${productMetaY}" fill="#cce2c2" font-size="20" font-weight="600" font-family="Segoe UI, Arial, sans-serif">${brandLine}</text>
  <text x="136" y="${productMetaY + 32}" fill="rgba(255,255,255,0.72)" font-size="18" font-weight="500" font-family="Segoe UI, Arial, sans-serif">Commercial quotation and solution overview</text>

  <rect x="108" y="536" width="744" height="132" rx="28" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.06)"/>
  <text x="144" y="584" fill="#ffffff" font-size="30" font-weight="800" font-family="Segoe UI, Arial, sans-serif">扫码查看完整报价方案</text>
  <text x="144" y="620" fill="#9af569" font-size="19" font-weight="700" font-family="Segoe UI, Arial, sans-serif">Scan to view the full quotation package</text>
  <text x="144" y="650" fill="rgba(255,255,255,0.7)" font-size="17" font-weight="500" font-family="Segoe UI, Arial, sans-serif">查看配置、价格、交付范围和关键说明 | Configuration, pricing, scope and notes</text>

  <rect x="228" y="688" width="504" height="504" rx="44" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.08)"/>
  <rect x="270" y="726" width="420" height="420" rx="34" fill="rgba(13,22,13,0.9)" stroke="rgba(125,255,69,0.12)"/>
  ${qrMarkup}
  <text x="480" y="1088" text-anchor="middle" fill="#ffffff" font-size="24" font-weight="800" font-family="Segoe UI, Arial, sans-serif">Quote access via QR code</text>
  <text x="480" y="1118" text-anchor="middle" fill="rgba(255,255,255,0.68)" font-size="17" font-weight="500" font-family="Segoe UI, Arial, sans-serif">Forward on WeChat, email, or internal review threads</text>

  <rect x="108" y="1220" width="744" height="106" rx="24" fill="rgba(125,255,69,0.08)" stroke="rgba(125,255,69,0.16)" />
  <text x="144" y="1260" fill="#91ef5c" font-size="16" font-weight="800" font-family="Segoe UI, Arial, sans-serif" letter-spacing="1">QUOTE REF</text>
  <text x="144" y="1290" fill="#ffffff" font-size="20" font-weight="700" font-family="Segoe UI, Arial, sans-serif">${slugLine}</text>
  <text x="540" y="1260" fill="#91ef5c" font-size="16" font-weight="800" font-family="Segoe UI, Arial, sans-serif" letter-spacing="1">BUSINESS SUPPORT</text>
  <text x="540" y="1290" fill="#ffffff" font-size="20" font-weight="700" font-family="Segoe UI, Arial, sans-serif">${supportLine}</text>
  <text x="144" y="1314" fill="rgba(255,255,255,0.62)" font-size="15" font-weight="500" font-family="Segoe UI, Arial, sans-serif">报价识别码 | Customer-facing share identifier</text>
  <text x="540" y="1314" fill="rgba(255,255,255,0.62)" font-size="15" font-weight="500" font-family="Segoe UI, Arial, sans-serif">商务联系邮箱 | Commercial contact email</text>
</svg>`;
    return posterDataUrlFromSvg(svg);
}

function requirementPublicUrl(publicSlug, publicToken, options = {}) {
    const url = new URL('/quote/requirement.html', window.location.origin);
    if (text(publicSlug)) url.searchParams.set('req', text(publicSlug));
    if (text(publicToken)) url.searchParams.set('token', text(publicToken));
    if (options.readonly) url.searchParams.set('mode', 'readonly');
    return url.toString();
}

const PUBLIC_STAGE_CONFIRMATION_CONFIG = Object.freeze({
    quote_confirmed: {
        title: '客户报价确认单',
        description: '客户确认当前报价版本、商务条款和交付边界后，这条销售线自动进入签约合同。',
    },
    contract_signed: {
        title: '客户合同确认单',
        description: '客户确认合同最终版本并回传后，这条销售线自动进入定金付款。',
    },
    factory_accepted: {
        title: '客户验收确认单',
        description: '客户完成线上验收确认或纸质单回传后，这条销售线自动进入尾款确认。',
    },
    production_scheduled: {
        title: '客户生产进度页',
        description: '客户可随时查看生产子节点进度、预计完工与延期说明。',
    },
});

function publicStageConfirmationConfig(stageKey = '') {
    return PUBLIC_STAGE_CONFIRMATION_CONFIG[normalizeDealStageKey(stageKey)] || null;
}

function stageSupportsPublicConfirmation(stageKey = '') {
    return Boolean(publicStageConfirmationConfig(stageKey));
}

function randomHex(bytes = 8) {
    const buffer = new Uint8Array(bytes);
    window.crypto.getRandomValues(buffer);
    return Array.from(buffer, (value) => value.toString(16).padStart(2, '0')).join('');
}

let salesConfirmDialogNode = null;
let salesConfirmDialogResolver = null;

function ensureSalesConfirmDialog() {
    if (salesConfirmDialogNode) return salesConfirmDialogNode;
    const node = document.createElement('div');
    node.className = 'ams-confirm-dialog';
    node.hidden = true;
    node.innerHTML = `
        <div class="ams-confirm-dialog-backdrop" data-sales-confirm-close></div>
        <div class="ams-confirm-dialog-panel" role="dialog" aria-modal="true" aria-labelledby="ams-confirm-dialog-title">
            <div class="ams-confirm-dialog-head">
                <span class="ams-confirm-dialog-badge">Confirm</span>
                <h3 id="ams-confirm-dialog-title"></h3>
                <p id="ams-confirm-dialog-message"></p>
            </div>
            <div class="ams-confirm-dialog-actions">
                <button class="ams-btn ams-btn-muted" type="button" data-sales-confirm-cancel>取消</button>
                <button class="ams-btn ams-btn-danger" type="button" data-sales-confirm-submit>确认继续</button>
            </div>
        </div>
    `;
    const close = (result) => {
        node.hidden = true;
        const resolver = salesConfirmDialogResolver;
        salesConfirmDialogResolver = null;
        if (resolver) resolver(Boolean(result));
    };
    node.querySelectorAll('[data-sales-confirm-close], [data-sales-confirm-cancel]').forEach((button) => {
        button.addEventListener('click', () => close(false));
    });
    node.querySelector('[data-sales-confirm-submit]')?.addEventListener('click', () => close(true));
    document.body.appendChild(node);
    salesConfirmDialogNode = node;
    return node;
}

async function confirmSalesAction({
    title = '请确认操作',
    message = '这个操作会影响当前销售流程，请确认后继续。',
    confirmLabel = '确认继续',
    danger = true,
} = {}) {
    const node = ensureSalesConfirmDialog();
    node.querySelector('#ams-confirm-dialog-title').textContent = title;
    node.querySelector('#ams-confirm-dialog-message').textContent = message;
    const submit = node.querySelector('[data-sales-confirm-submit]');
    if (submit) {
        submit.textContent = confirmLabel;
        submit.className = `ams-btn ${danger ? 'ams-btn-danger' : 'ams-btn-warning'}`;
    }
    node.hidden = false;
    return new Promise((resolve) => {
        salesConfirmDialogResolver = resolve;
    });
}

function stageConfirmationPublicUrl(publicSlug = '', publicToken = '') {
    const url = new URL('/quote/confirmation.html', window.location.origin);
    if (text(publicSlug)) url.searchParams.set('stage', text(publicSlug));
    if (text(publicToken)) url.searchParams.set('token', text(publicToken));
    return url.toString();
}

function stageCustomerFacingUrl(stageKey = '', record = {}, deal = null) {
    const quoteLine = moduleState.instances.find((item) => item.id === text(deal?.primary_instance_id))
        || dealQuotes(text(deal?.id))[0]
        || null;
    const normalizedStageKey = normalizeDealStageKey(stageKey);
    if (normalizedStageKey === 'production_scheduled') {
        return stageConfirmationPublicUrl(record.public_slug, record.public_token);
    }
    if (normalizedStageKey === 'quote_confirmed' && text(quoteLine?.public_slug)) {
        return publicQuoteUrl(quoteLine.public_slug, {
            confirmStage: record.public_slug,
            confirmToken: record.public_token,
        });
    }
    return stageConfirmationPublicUrl(record.public_slug, record.public_token);
}

function stageConfirmationCopyText(stageKey = '', record = {}, deal = null) {
    const config = publicStageConfirmationConfig(stageKey);
    const url = stageCustomerFacingUrl(stageKey, record, deal);
    const customer = moduleState.customers.find((item) => item.id === deal?.customer_id) || {};
    const customerLine = text(customerDisplayName(customer), text(deal?.title, '尊敬的客户'));
    const quoteLine = moduleState.instances.find((item) => item.id === text(deal?.primary_instance_id))
        || dealQuotes(text(deal?.id))[0]
        || null;
    return [
        `${customerLine}，您好：`,
        '',
        `${config?.title || '客户确认入口'}`,
        config?.description || '',
        `销售流程：${text(deal?.title, '--')}`,
        normalizeDealStageKey(stageKey) === 'quote_confirmed'
            ? '请直接打开下方报价单链接，在报价页面底部完成最终确认。'
            : normalizeDealStageKey(stageKey) === 'production_scheduled'
                ? '请直接打开下方链接查看最新生产进度节点、工期状态和备注。'
                : quoteLine?.public_slug
                    ? `关联报价：${publicQuoteUrl(quoteLine.public_slug)}`
                    : '',
        '',
        '请打开下方入口完成确认：',
        url,
        '',
        'GasGx 将基于您提交的确认结果推进下一阶段，并保留完整的流程记录与沟通溯源。',
    ].filter(Boolean).join('\n');
}

function stagePublicEntryChipMarkup(stageKey = '', record = {}, deal = null, options = {}) {
    if (!stageSupportsPublicConfirmation(stageKey)) return '';
    const openLabel = text(options.openLabel, '打开客户确认入口');
    const copyLabel = text(options.copyLabel, '复制确认链接');
    const panelClassName = text(options.panelClassName);
    const kicker = text(options.kicker);
    const schemaMissing = !moduleState.dealStagePublicLinkSupported;
    const summary = schemaMissing
        ? '当前环境缺少公开确认入口所需的数据库字段，需先执行 019 迁移。'
        : text(options.summary, '对外发送时会自动带上本节点的确认说明、流程指引以及 GasGx 品牌说明。');
    const emptyText = schemaMissing
        ? '公开确认入口功能待数据库迁移完成。'
        : text(options.emptyText, '客户确认入口可随时打开查看，也可复制链接发给对方。');
    const hasLink = Boolean(text(record?.public_slug) && text(record?.public_token));
    const href = hasLink ? stageCustomerFacingUrl(stageKey, record, deal) : '';
    const normalizedStageKey = normalizeDealStageKey(stageKey);
    return `
        <div class="ams-summary-chip ams-summary-chip-link ${esc(panelClassName)}">
            ${kicker ? `<em class="ams-stage-role-kicker">${esc(kicker)}</em>` : ''}
            <strong>公开入口</strong>
            <span>${hasLink ? `<a class="ams-inline-link" href="${esc(href)}" target="_blank" rel="noopener">${esc(href)}</a>` : esc(emptyText)}</span>
            <small>${esc(summary)}</small>
            <div class="ams-summary-chip-actions">
                <button class="ams-btn ams-btn-muted" type="button" data-sales-flow-open-public-confirmation="${esc(normalizedStageKey)}" ${schemaMissing ? 'disabled' : ''}>${esc(openLabel)}</button>
                <button class="ams-btn ams-btn-primary" type="button" data-sales-flow-copy-public-confirmation="${esc(normalizedStageKey)}" ${schemaMissing ? 'disabled' : ''}>${esc(copyLabel)}</button>
            </div>
        </div>
    `;
}

function quoteConfirmationSubmitted(record = {}) {
    return Boolean(
        text(record?.stage_status) === 'completed'
        || text(record?.completed_at)
        || text(record?.meta?.public_confirmed_at)
    );
}

async function ensurePublicStageConfirmationLink(user, stageKey = '', deal = null) {
    if (!moduleState.dealStagePublicLinkSupported) {
        throw new Error('公开确认入口依赖数据库迁移。请先执行 article_management/sql/019_quote_stage_public_confirmation.sql。');
    }
    const normalizedStageKey = normalizeDealStageKey(stageKey);
    if (!stageSupportsPublicConfirmation(normalizedStageKey)) {
        throw new Error('当前节点不支持公开确认入口。');
    }
    const activeDeal = deal || moduleState.dealEditor || {};
    const dealId = text(activeDeal.id || activeDealIdFromState());
    if (!dealId) throw new Error('缺少销售线 ID。');
    if (text(moduleState.dealLoadedId) !== dealId) await fetchDealEditor(dealId);
    let record = stageRecordByKey(normalizedStageKey, moduleState.dealStageRecords);
    if (!record) {
        record = createDealStageRecord({
            deal_id: dealId,
            stage_key: normalizedStageKey,
            stage_status: normalizeDealStageKey(moduleState.dealEditor?.current_stage) === normalizedStageKey ? 'active' : 'pending',
        });
        replaceStageRecord(normalizedStageKey, () => record);
    }
    const nextSlug = text(record.public_slug) || `stage-${normalizedStageKey.replace(/_/g, '-')}-${text(record.id).slice(0, 8) || dealId.slice(0, 8)}`;
    const nextToken = text(record.public_token) || randomHex(8);
    const stagePayload = {
        deal_id: dealId,
        stage_key: normalizedStageKey,
        stage_status: normalizeDealStageKey(moduleState.dealEditor?.current_stage) === normalizedStageKey ? 'active' : 'pending',
        owner_name: text(moduleState.dealEditor?.owner_name),
        owner_email: text(moduleState.dealEditor?.owner_email),
        notes: text(record.notes),
        meta: deepClone(record.meta || {}),
        public_slug: nextSlug,
        public_token: nextToken,
    };
    const result = await client
        .from(TABLE_DEAL_STAGE_RECORDS)
        .upsert(stagePayload, { onConflict: 'deal_id,stage_key' })
        .select('*');
    const { data, error } = result;
    if (error && isDealStagePublicLinkSchemaMissing(error)) {
        moduleState.dealStagePublicLinkSupported = false;
        throw new Error('公开确认入口依赖数据库迁移。请先执行 article_management/sql/019_quote_stage_public_confirmation.sql。');
    }
    if (error) throw error;
    moduleState.dealStageRecords = mergeDealStageRecords(moduleState.dealEditor || {}, data || moduleState.dealStageRecords);
    const saved = stageRecordByKey(normalizedStageKey, mergeDealStageRecords(moduleState.dealEditor || {}, data || [])) || {
        ...record,
        public_slug: nextSlug,
        public_token: nextToken,
    };
    return {
        ...saved,
        public_slug: nextSlug,
        public_token: nextToken,
        public_url: stageConfirmationPublicUrl(nextSlug, nextToken),
    };
}

function requirementSeenStorageKey(requirementId = '') {
    return `gasgx-sales-requirement-seen:${text(requirementId)}`;
}

function requirementLatestCustomerActivityAt(requirement = {}) {
    return text(requirement.submitted_at || requirement.updated_at || '');
}

function requirementHasUnreadCustomerUpdate(requirement = {}) {
    const requirementId = text(requirement.id);
    const latestAt = requirementLatestCustomerActivityAt(requirement);
    if (!requirementId || !latestAt) return false;
    try {
        const seenAt = text(window.localStorage.getItem(requirementSeenStorageKey(requirementId)));
        return !seenAt || latestAt > seenAt;
    } catch {
        return false;
    }
}

function markRequirementCustomerUpdateSeen(requirement = {}) {
    const requirementId = text(requirement.id);
    const latestAt = requirementLatestCustomerActivityAt(requirement);
    if (!requirementId || !latestAt) return;
    try {
        window.localStorage.setItem(requirementSeenStorageKey(requirementId), latestAt);
    } catch {
        return;
    }
}

function requirementLinkCopyText({ url = '', customerName = '', title = '' } = {}) {
    const header = 'GasGx 客户需求采集入口';
    const customerLine = customerName ? `客户：${customerName}` : '客户：请填写客户名称';
    const titleLine = title ? `需求主题：${title}` : '需求主题：请填写需求主题';
    const hintLine = '请通过以下链接填写需求信息（提交后将自动锁定）：';
    return [header, customerLine, titleLine, hintLine, url].filter(Boolean).join('\n');
}

function requirementShareSupportLine(requirement = {}) {
    const contact = text(requirement.requester_name || requirement.requester_company || requirement.customer_name || '');
    return contact || 'GasGx Sales Desk';
}

function requirementShareCopyText(requirement = {}) {
    const url = requirementPublicUrl(requirement.public_slug, requirement.public_token);
    const customerLine = text(requirement.requester_company || requirement.requester_name || requirement.customer_name || '', '待填写客户');
    const titleLine = text(requirementDisplayName(requirement), '客户需求填报单');
    return [
        'GasGx 客户原始需求填报单',
        `客户：${customerLine}`,
        `需求主题：${titleLine}`,
        '用途说明：请客户直接打开此链接，按当前采购/部署计划分步填写；系统会自动保存填写进度，后台可随时查看最新内容。',
        '品牌说明：GasGx 将基于这份原始需求，统一整理后续方案、报价与交付建议。',
        `对接支持：${requirementShareSupportLine(requirement)}`,
        url,
    ].filter(Boolean).join('\n');
}

async function requirementSharePosterDataUrl(requirement = {}) {
    const url = requirementPublicUrl(requirement.public_slug, requirement.public_token);
    const customerLine = svgTextLine(text(requirement.requester_company || requirement.requester_name || requirement.customer_name || '', '专属客户需求入口'));
    const supportLine = svgTextLine(requirementShareSupportLine(requirement), 'GasGx Sales Desk');
    const qrMarkup = await quoteQrSvgMarkup(url, { x: 312, y: 650, size: 336, radius: 26 });
    const slugLine = svgTextLine(text(requirement.public_slug), '');
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="1360" viewBox="0 0 960 1360">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0d170d"/>
      <stop offset="55%" stop-color="#122112"/>
      <stop offset="100%" stop-color="#091009"/>
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#163116"/>
      <stop offset="100%" stop-color="#0e1a0e"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#7fff3a"/>
      <stop offset="100%" stop-color="#4dcf22"/>
    </linearGradient>
  </defs>
  <rect width="960" height="1360" rx="36" fill="url(#bg)"/>
  <rect x="44" y="44" width="872" height="1272" rx="32" fill="rgba(6,10,6,0.72)" stroke="rgba(127,255,58,0.18)"/>
  <text x="84" y="122" fill="#8fff5b" font-size="28" font-family="Segoe UI, Arial, sans-serif" font-weight="800" letter-spacing="4">GASGX AMS</text>
  <text x="84" y="174" fill="#ffffff" font-size="54" font-family="Segoe UI, Arial, sans-serif" font-weight="800">客户需求填报入口</text>
  <text x="84" y="218" fill="rgba(255,255,255,0.78)" font-size="22" font-family="Segoe UI, Arial, sans-serif">客户扫码即可填写，系统会自动保存进度，后台能随时查看最新内容。</text>
  <rect x="84" y="266" width="792" height="188" rx="28" fill="url(#panel)" stroke="rgba(127,255,58,0.18)"/>
  <text x="118" y="324" fill="#8fff5b" font-size="22" font-family="Segoe UI, Arial, sans-serif" font-weight="700">客户信息</text>
  <text x="118" y="372" fill="#ffffff" font-size="34" font-family="Segoe UI, Arial, sans-serif" font-weight="700">${customerLine}</text>
  <text x="118" y="418" fill="rgba(255,255,255,0.72)" font-size="20" font-family="Segoe UI, Arial, sans-serif">GasGx 会基于这份原始需求，统一整理后续方案、报价与交付建议。</text>
  <rect x="84" y="500" width="792" height="500" rx="28" fill="rgba(11,18,11,0.9)" stroke="rgba(127,255,58,0.18)"/>
  <text x="480" y="558" fill="#ffffff" font-size="30" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-weight="800">扫码填写客户需求</text>
  <text x="480" y="594" fill="rgba(255,255,255,0.68)" font-size="18" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif">填写后自动保存，可随时回来继续补充</text>
  <rect x="270" y="626" width="420" height="420" rx="34" fill="rgba(13,22,13,0.9)" stroke="rgba(127,255,58,0.12)"/>
  ${qrMarkup}
  <rect x="84" y="1036" width="792" height="206" rx="28" fill="rgba(17,28,17,0.94)" stroke="rgba(127,255,58,0.18)"/>
  <text x="118" y="1090" fill="#8fff5b" font-size="22" font-family="Segoe UI, Arial, sans-serif" font-weight="700">填写引导</text>
  <text x="118" y="1130" fill="#d7e8d2" font-size="18" font-family="Segoe UI, Arial, sans-serif">公开识别：${slugLine}</text>
  <text x="118" y="1172" fill="#ffffff" font-size="20" font-family="Segoe UI, Arial, sans-serif">1. 按当前采购或部署计划逐项填写。</text>
  <text x="118" y="1206" fill="#ffffff" font-size="20" font-family="Segoe UI, Arial, sans-serif">2. 中途离开也会自动保存，稍后可继续补充。</text>
  <text x="118" y="1276" fill="rgba(255,255,255,0.74)" font-size="20" font-family="Segoe UI, Arial, sans-serif">GasGx Support · ${supportLine}</text>
</svg>`;
    return posterDataUrlFromSvg(svg);
}

function adminPageUrl(page, params = {}) {
    return adminConsoleUrl(page, params, {
        entryKind: detectAdminEntryKind(),
    });
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

function replaceAdminPageParams(params = {}) {
    try {
        const url = new URL(window.location.href);
        Object.entries(params || {}).forEach(([name, value]) => {
            const next = text(value);
            if (next) {
                url.searchParams.set(name, next);
            } else {
                url.searchParams.delete(name);
            }
        });
        window.history.replaceState({}, '', url);
    } catch (_error) {
        return;
    }
}

function previewQuoteUrl(instanceId) {
    return new URL(`/quote/view.html?preview=${encodeURIComponent(instanceId)}`, window.location.origin).toString();
}

function quoteEditorUrl(kind, id, options = {}) {
    const params = quoteEditorContextParams({}, {
        entryKind: options.entryKind || currentEntryKind(options.input),
    });
    params.set('kind', text(kind));
    params.set('id', text(id));
    const dealId = text(options.dealId || activeDealIdFromState());
    if (dealId) params.set('deal', dealId);
    const stage = text(options.stage || readAdminPageParam('stage'));
    if (stage) params.set('stage', stage);
    const customerId = text(options.customerId || readAdminPageParam('customer'));
    if (customerId) params.set('customer', customerId);
    const returnMode = text(options.returnMode);
    if (returnMode) params.set('return_mode', returnMode);
    const url = new URL('/quote/editor.html', window.location.origin);
    url.search = params.toString();
    return url.toString();
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

function legacyBrandSeedKey(brand = {}) {
    const current = createBrandDraft(brand);
    const signature = [
        current.slug,
        current.brand_name,
        current.display_name,
        current.supplier_name,
        current.subject_name,
        current.sender_email,
        current.share_signing_secret,
        current.share_unlock_prefix,
        current.overview_title?.zh,
        current.footer_note?.zh,
    ].map((entry) => text(entry).toLowerCase()).join(' ');
    if (text(current.slug).toLowerCase() === 'vman' || signature.includes('vman')) return 'vman';
    if (text(current.slug).toLowerCase() === 'minerpower' || signature.includes('minerpower')) return 'minerpower';
    return '';
}

function brandNeedsLegacySeedRepair(brand = {}, seedBrand = {}) {
    const current = createBrandDraft(brand);
    const target = createBrandDraft(seedBrand);
    return [
        'slug',
        'brand_name',
        'display_name',
        'supplier_name',
        'sender_email',
        'subject_name',
        'share_signing_secret',
        'share_unlock_prefix',
    ].some((field) => text(current[field]) !== text(target[field]))
        || text(current.overview_title?.zh) !== text(target.overview_title?.zh)
        || text(current.footer_note?.zh) !== text(target.footer_note?.zh);
}

function buildLegacyBrandRepairDraft(brand = {}, seedBrand = {}) {
    const current = createBrandDraft(brand);
    const target = createBrandDraft(seedBrand);
    return {
        ...target,
        id: current.id,
        slug: current.slug || target.slug,
        default_quote_slug: text(current.default_quote_slug),
        is_active: current.is_active !== false,
    };
}

async function repairLegacyBrandRecords(user) {
    if (moduleState.brandLegacyRepairAttempted) return false;
    moduleState.brandLegacyRepairAttempted = true;
    if (!user?.id) return false;

    const currentEditor = createBrandDraft(moduleState.brandEditor || {});
    const currentCreateMode = moduleState.brandCreateMode === true;
    const currentDisplayTouched = moduleState.brandDisplayNameTouched === true;
    const currentDefaultTouched = moduleState.brandDefaultLinkTouched === true;
    const legacyPages = await ensureLegacyQuotePagesLoaded('/shared/quote-system/quote-pages.js');
    const legacyBundles = convertLegacyPagesToSeedPayloads(legacyPages);
    const legacyBrandMap = new Map(legacyBundles.map((bundle) => [text(bundle?.brand?.slug).toLowerCase(), bundle?.brand]));
    let repairedAny = false;

    for (const brand of moduleState.brands) {
        const seedKey = legacyBrandSeedKey(brand);
        const seedBrand = legacyBrandMap.get(seedKey);
        if (!seedBrand || !brandNeedsLegacySeedRepair(brand, seedBrand)) continue;
        await saveBrandDraft(user, buildLegacyBrandRepairDraft(brand, seedBrand));
        repairedAny = true;
    }

    if (!repairedAny) return false;

    await fetchBrandRows();
    if (currentCreateMode) {
        moduleState.brandEditor = currentEditor;
    } else if (currentEditor.id) {
        const refreshed = moduleState.brands.find((item) => text(item.id) === text(currentEditor.id));
        moduleState.brandEditor = createBrandDraft(refreshed || currentEditor);
    } else {
        moduleState.brandEditor = createBrandDraft();
    }
    moduleState.brandCreateMode = currentCreateMode;
    moduleState.brandDisplayNameTouched = currentDisplayTouched;
    moduleState.brandDefaultLinkTouched = currentDefaultTouched;
    persistBrandEditorDraftState();
    return true;
}

function productNeedsLegacySeedRepair(product = {}, seedEntry = {}) {
    const current = createProductDraft(product);
    const target = createProductDraft({
        ...(seedEntry.product || {}),
        items: seedEntry.items || [],
    });
    const currentTitle = text(current.public_title?.zh);
    const targetTitle = text(target.public_title?.zh);
    const hasPlaceholderTitle = !currentTitle || currentTitle === '产品标题' || currentTitle.includes('填写客户看到的产品名称');
    return hasPlaceholderTitle
        || text(current.product_code) !== text(target.product_code)
        || text(current.slug) !== text(target.slug)
        || currentTitle !== targetTitle
        || normalizeSectionConfig(current.section_config).length !== normalizeSectionConfig(target.section_config).length
        || (current.items || []).length !== (target.items || []).length;
}

function matchLegacyProductRecord(products = [], seedEntry = {}, index = 0) {
    const seedProduct = createProductDraft(seedEntry.product || {});
    const seedTitle = text(seedProduct.public_title?.zh).toLowerCase();
    const byExactKey = products.find((product) =>
        text(product.slug).toLowerCase() === text(seedProduct.slug).toLowerCase()
        || text(product.product_code).toLowerCase() === text(seedProduct.product_code).toLowerCase()
        || text(product.public_title?.zh).toLowerCase() === seedTitle,
    );
    if (byExactKey) return byExactKey;
    if (products.length === 1 && index === 0) return products[0];
    return products[index] || null;
}

function buildLegacyProductRepairDraft(product = {}, seedEntry = {}, brandId = '', products = [], index = 0) {
    const current = createProductDraft(product);
    const target = createProductDraft({
        ...(seedEntry.product || {}),
        items: seedEntry.items || [],
    });
    const targetSlug = text(target.slug).toLowerCase();
    const slugTakenByOther = products.some((item) =>
        text(item.id) !== text(current.id)
        && text(item.slug).toLowerCase() === targetSlug,
    );
    const targetCode = text(target.product_code).toLowerCase();
    const codeTakenByOther = products.some((item) =>
        text(item.id) !== text(current.id)
        && text(item.product_code).toLowerCase() === targetCode,
    );
    return {
        ...target,
        id: current.id,
        brand_id: brandId || current.brand_id || target.brand_id,
        slug: slugTakenByOther ? current.slug : target.slug,
        product_code: codeTakenByOther ? (current.product_code || current.slug) : target.product_code,
        sort_order: current.sort_order || target.sort_order || (index + 1) * 10,
        is_active: current.is_active !== false,
        media_gallery: seedEntry.product?.media_gallery || current.media_gallery || [],
        media_config: seedEntry.product?.media_config || current.media_config,
    };
}

async function repairLegacyProductRecords(user) {
    if (moduleState.productLegacyRepairAttempted) return false;
    moduleState.productLegacyRepairAttempted = true;
    if (!user?.id) return false;

    const currentEditorId = text(moduleState.productEditor?.id);
    const currentCreateMode = moduleState.productCreateMode === true;
    const currentBrandDraft = createBrandDraft(moduleState.productBrandDraft || {});
    const legacyPages = await ensureLegacyQuotePagesLoaded('/shared/quote-system/quote-pages.js');
    const legacyBundles = convertLegacyPagesToSeedPayloads(legacyPages);
    let repairedAny = false;

    for (const bundle of legacyBundles) {
        const bundleSlug = text(bundle?.brand?.slug).toLowerCase();
        if (!bundleSlug) continue;
        const matchingBrands = moduleState.brands.filter((brand) => legacyBrandSeedKey(brand) === bundleSlug);
        for (const brand of matchingBrands) {
            const brandProducts = moduleState.products.filter((product) => text(product.brand_id) === text(brand.id));
            for (const [index, seedEntry] of (bundle.products || []).entries()) {
                const matched = matchLegacyProductRecord(brandProducts, seedEntry, index);
                if (!matched?.id) continue;
                const fullProduct = await fetchFullProductDraft(matched.id, matched);
                if (!productNeedsLegacySeedRepair(fullProduct, seedEntry)) continue;
                await saveProductDraft(user, buildLegacyProductRepairDraft(fullProduct, seedEntry, brand.id, brandProducts, index));
                repairedAny = true;
            }
        }
    }

    if (!repairedAny) return false;

    await fetchProductRows();
    if (currentEditorId && !currentCreateMode) {
        const refreshed = moduleState.products.find((item) => text(item.id) === currentEditorId);
        if (refreshed) {
            moduleState.productLoadedId = refreshed.id;
            moduleState.productEditor = await fetchFullProductDraft(refreshed.id, refreshed);
            moduleState.productCreateMode = false;
            syncProductBrandDraft(moduleState.productEditor.brand_id);
        }
    } else if (!currentCreateMode) {
        moduleState.productEditor = createProductDraft();
        moduleState.productLoadedId = '';
        moduleState.productBrandDraft = currentBrandDraft;
    }
    return true;
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
                        .map((entry) => {
                            const displayLabel = stripTemplateBrandLabel(entry.label, group);
                            return `<option value="${esc(entry.key)}">${esc(displayLabel)}</option>`;
                        })
                        .join('')}
                </optgroup>
            `,
        )
        .join('');
    return options || '<option value="">当前没有可载入的基础模板</option>';
}

function stripTemplateBrandLabel(label = '', group = {}) {
    const raw = text(label);
    if (!raw) return '';
    const brandCandidates = [
        group?.brand?.display_name,
        group?.brand?.brand_name,
        group?.brand?.slug,
        group?.key,
    ].map((value) => text(value)).filter(Boolean);
    if (!brandCandidates.length) return raw;
    let cleaned = raw;
    brandCandidates.forEach((name) => {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        cleaned = cleaned.replace(new RegExp(`\\b${escaped}\\b\\s*[\\/|·-]?\\s*`, 'gi'), '');
    });
    cleaned = cleaned.replace(/\s{2,}/g, ' ').replace(/^[\\/|·-]\s*/, '').trim();
    return cleaned || raw;
}

function applyBaseTemplateToProductEditor(templateKey = '') {
    const [brandKey, productKey] = String(templateKey || '').split(':');
    const templateGroup = moduleState.baseTemplates.find((entry) => entry.key === brandKey);
    const templateProduct = templateGroup?.products.find((entry) => entry.product.slug === productKey);
    if (!templateGroup || !templateProduct) throw new Error('\u672a\u627e\u5230\u5bf9\u5e94\u7684\u57fa\u7840\u6a21\u677f\u3002');

    const currentProduct = createProductDraft(moduleState.productEditor || {});
    const currentBrandId =
        text(currentProduct.brand_id) ||
        (moduleState.productBrandFilter !== 'all' ? text(moduleState.productBrandFilter) : '') ||
        text(moduleState.brands[0]?.id);
    const hasSelectedProduct = Boolean(text(currentProduct.id));
    const nextSlug = hasSelectedProduct
        ? text(currentProduct.slug || buildTemplateProductSlug(currentBrandId, templateProduct.product.slug))
        : buildTemplateProductSlug(currentBrandId, templateProduct.product.slug);

    moduleState.productLoadedId = hasSelectedProduct ? currentProduct.id : '';
    moduleState.productEditor = createProductDraft({
        ...templateProduct.product,
        id: hasSelectedProduct ? currentProduct.id : '',
        brand_id: currentBrandId,
        slug: nextSlug,
        product_code: text(currentProduct.product_code || templateProduct.product.product_code || templateProduct.product.slug),
        sort_order: hasSelectedProduct ? safeNumber(currentProduct.sort_order, templateProduct.product.sort_order) : templateProduct.product.sort_order,
        is_active: hasSelectedProduct ? currentProduct.is_active !== false : templateProduct.product.is_active !== false,
        items: templateProduct.product.items,
        media_gallery: templateProduct.product.media_gallery,
    });
    moduleState.productCreateMode = !hasSelectedProduct;
    moduleState.productBrandDraft = mergeTemplateBrandIntoProductBrandDraft(
        syncProductBrandDraft(currentBrandId),
        templateGroup.brand,
    );
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

function mergeTemplateBrandIntoProductBrandDraft(currentBrand = {}, templateBrand = {}) {
    const target = createBrandDraft(currentBrand);
    const source = createBrandDraft(templateBrand);
    return createBrandDraft({
        ...target,
        supplier_name: target.supplier_name || source.supplier_name,
        sender_email: target.sender_email || source.sender_email,
        subject_name: target.subject_name || source.subject_name,
        overview_title: {
            zh: target.overview_title?.zh || source.overview_title?.zh || '',
            en: target.overview_title?.en || source.overview_title?.en || target.overview_title?.zh || source.overview_title?.zh || '',
            ru: target.overview_title?.ru || source.overview_title?.ru || target.overview_title?.zh || source.overview_title?.zh || '',
        },
        footer_note: {
            zh: target.footer_note?.zh || source.footer_note?.zh || '',
            en: target.footer_note?.en || source.footer_note?.en || target.footer_note?.zh || source.footer_note?.zh || '',
            ru: target.footer_note?.ru || source.footer_note?.ru || target.footer_note?.zh || source.footer_note?.zh || '',
        },
    });
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

let customSelectBindingsReady = false;
let salesFlowShareMenuBindingsReady = false;

function closeCustomSelectPanels(scope = document) {
    scope.querySelectorAll('.ams-select-shell.is-open').forEach((shell) => shell.classList.remove('is-open'));
}

function ensureCustomSelectBindings() {
    if (customSelectBindingsReady) return;
    customSelectBindingsReady = true;
    document.addEventListener('pointerdown', (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target?.closest('.ams-select-shell')) closeCustomSelectPanels();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeCustomSelectPanels();
    });
    window.addEventListener('resize', () => closeCustomSelectPanels());
}

function closeSalesFlowShareMenus() {
    document.querySelectorAll('.ams-sales-flow-requirement-share-menu[open], .ams-sales-flow-quote-share-menu[open]')
        .forEach((menu) => menu.removeAttribute('open'));
}

function ensureSalesFlowShareMenuBindings() {
    if (salesFlowShareMenuBindingsReady) return;
    salesFlowShareMenuBindingsReady = true;
    document.addEventListener('pointerdown', (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) return;
        if (target.closest('.ams-sales-flow-requirement-share-menu, .ams-sales-flow-quote-share-menu')) return;
        closeSalesFlowShareMenus();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeSalesFlowShareMenus();
    });
    window.addEventListener('resize', closeSalesFlowShareMenus);
}

function customSelectCurrentLabel(select) {
    const selectedOption = select.options[select.selectedIndex];
    return text(selectedOption?.textContent || selectedOption?.label || '', text(select.dataset.placeholder || '请选择'));
}

function customSelectGroupMarkup(groupLabel = '', optionButtons = '') {
    return `
        <div class="ams-select-group">
            ${groupLabel ? `<div class="ams-select-group-label">${esc(groupLabel)}</div>` : ''}
            ${optionButtons}
        </div>
    `;
}

function customSelectPanelMarkup(select) {
    const groups = [];
    let rootButtons = '';
    Array.from(select.children).forEach((node) => {
        if (node.tagName === 'OPTGROUP') {
            const optionButtons = Array.from(node.children)
                .filter((option) => option.tagName === 'OPTION' && text(option.value) !== '')
                .map((option) => {
                    const isSelected = option.selected;
                    const isDisabled = select.disabled || option.disabled;
                    return `<button class="ams-select-option ${isSelected ? 'is-selected' : ''} ${isDisabled ? 'is-disabled' : ''}" type="button" data-custom-select-value="${esc(option.value)}" ${isDisabled ? 'disabled' : ''}>${esc(option.textContent || option.label || option.value)}</button>`;
                })
                .join('');
            if (optionButtons) groups.push(customSelectGroupMarkup(node.label || '', optionButtons));
            return;
        }
        if (node.tagName === 'OPTION' && text(node.value) !== '') {
            const isSelected = node.selected;
            const isDisabled = select.disabled || node.disabled;
            rootButtons += `<button class="ams-select-option ${isSelected ? 'is-selected' : ''} ${isDisabled ? 'is-disabled' : ''}" type="button" data-custom-select-value="${esc(node.value)}" ${isDisabled ? 'disabled' : ''}>${esc(node.textContent || node.label || node.value)}</button>`;
        }
    });
    if (rootButtons) groups.unshift(customSelectGroupMarkup('', rootButtons));
    return groups.join('');
}

function refreshCustomSelect(select) {
    const shell = select.closest('.ams-select-shell');
    if (!shell) return;
    const trigger = shell.querySelector('.ams-select-display');
    const triggerValue = shell.querySelector('.ams-select-display-value');
    const panel = shell.querySelector('.ams-select-panel');
    shell.classList.toggle('is-disabled', Boolean(select.disabled));
    if (trigger) trigger.disabled = Boolean(select.disabled);
    if (triggerValue) triggerValue.textContent = customSelectCurrentLabel(select);
    if (panel) panel.innerHTML = customSelectPanelMarkup(select);
}

function hydrateCustomSelect(select) {
    if (!(select instanceof HTMLSelectElement) || select.multiple) return;
    if (select.closest('.ams-select-shell')) {
        refreshCustomSelect(select);
        return;
    }

    const shell = document.createElement('div');
    shell.className = 'ams-select-shell';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'ams-select-display';
    trigger.innerHTML = `
        <span class="ams-select-display-value"></span>
        <svg class="ams-select-display-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M4.5 6.75 9 11.25l4.5-4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
    `;

    const panel = document.createElement('div');
    panel.className = 'ams-select-panel';

    select.parentNode?.insertBefore(shell, select);
    shell.appendChild(select);
    shell.appendChild(trigger);
    shell.appendChild(panel);
    select.classList.add('ams-select-native');

    trigger.addEventListener('click', () => {
        if (select.disabled) return;
        const nextState = !shell.classList.contains('is-open');
        closeCustomSelectPanels(document);
        if (nextState) shell.classList.add('is-open');
    });

    panel.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target.closest('[data-custom-select-value]') : null;
        if (!target || target.hasAttribute('disabled')) return;
        const nextValue = target.getAttribute('data-custom-select-value') || '';
        if (select.value !== nextValue) {
            select.value = nextValue;
            select.dispatchEvent(new Event('input', { bubbles: true }));
            select.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            refreshCustomSelect(select);
        }
        shell.classList.remove('is-open');
    });

    select.addEventListener('change', () => refreshCustomSelect(select));
    refreshCustomSelect(select);
}

function hydrateCustomSelects(root = document) {
    ensureCustomSelectBindings();
    root.querySelectorAll('select.ams-select').forEach((select) => hydrateCustomSelect(select));
}

function filteredCustomers() {
    const query = text(moduleState.customerSearch).toLowerCase();
    const rows = moduleState.customers.filter((customer) => {
        const listMode = moduleState.customerListMode || 'active';
        if (listMode === 'archived') {
            if (customer.is_active !== false || customer.is_deleted) return false;
        } else if (listMode === 'deleted') {
            if (!customer.is_deleted) return false;
        } else if (customer.is_active === false || customer.is_deleted) {
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
    return moduleState.customers.filter((item) => item.is_active === false && !item.is_deleted).length;
}

function deletedCustomerCount() {
    return moduleState.customers.filter((item) => item.is_deleted).length;
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

function requirementQuoteJumpMarkup(requirementId = '') {
    const rows = requirementQuotes(requirementId);
    if (!rows.length) return '<span>0</span>';
    if (rows.length === 1) {
        const quote = rows[0];
        const label = text(quote.customer_name || productLabelById(quote.product_id) || quote.public_slug, quote.id);
        return `<a class="ams-inline-link" href="${esc(adminPageUrl('quote-instances', { instance: quote.id }))}">${esc(label)}</a>`;
    }
    return `
        <select class="ams-select" data-requirement-linked-instance>
            <option value="">共 ${rows.length} 份报价，选择后直达</option>
            ${rows.map((quote) => {
                const label = text(quote.customer_name || productLabelById(quote.product_id) || quote.public_slug, quote.id);
                const statusText = text(quote.status) === 'published' ? '已发布' : text(quote.status) === 'archived' ? '已归档' : text(quote.status) === 'voided' ? '已作废' : '草稿';
                return `<option value="${esc(quote.id)}">${esc(label)} · ${esc(statusText)}</option>`;
            }).join('')}
        </select>
    `;
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
    const dealId = text(instance.deal_id || activeDealIdFromState());
    const customerId = text(instance.customer_id);
    const linkedRequirement = requirementById(instance.requirement_id);
    const rows = dealId
        ? dealRequirements(dealId)
        : customerId
            ? customerRequirements(customerId)
            : [];
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

function requirementCheckboxGroup(field, options = [], selectedValues = [], disabled = false) {
    const selected = new Set(normalizeStringList(selectedValues));
    return `
        <div class="ams-choice-grid">
            ${options.map((option) => `
                <label class="ams-social-toggle">
                    <input type="checkbox" data-requirement-check="${esc(field)}" value="${esc(option.value)}" ${selected.has(option.value) ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
                    <span>${esc(option.label)}</span>
                </label>
            `).join('')}
        </div>
    `;
}

function selectOptionsMarkup(options = [], current = '') {
    return options.map((option) => `<option value="${esc(option.value)}" ${text(current) === text(option.value) ? 'selected' : ''}>${esc(option.label)}</option>`).join('');
}

function legacyTemplateBrandAlias() {
    return null;
}

function hasLegacyTemplateBrandToken() {
    return false;
}

function displayBrandFieldValue(value = '') {
    return text(value);
}

function displayBrandSlugValue(value = '') {
    return text(value);
}

function displayBrandDraft(brand = {}) {
    return {
        ...brand,
        slug: displayBrandFieldValue(brand.slug, brand, 'slug'),
        brand_name: displayBrandFieldValue(brand.brand_name, brand, 'brand_name'),
        display_name: displayBrandFieldValue(brand.display_name, brand, 'display_name'),
        supplier_name: displayBrandFieldValue(brand.supplier_name, brand, 'supplier_name'),
        subject_name: displayBrandFieldValue(brand.subject_name, brand, 'subject_name'),
    };
}

function brandLabelById(brandId, options = {}) {
    const brand = moduleState.brands.find((item) => item.id === brandId);
    const rawLabel = brand?.display_name || brand?.brand_name || '--';
    if (options.allowTemplateSourceName) return rawLabel;
    return displayBrandFieldValue(rawLabel, brand, 'display_name') || '--';
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

function startBaseDataLoad({ force = false } = {}) {
    if (moduleState.baseDataLoadingPromise && !force) return moduleState.baseDataLoadingPromise;
    const request = Promise.all([
        fetchBrandRows(),
        fetchProductRows(),
        fetchCustomerRows(),
        fetchRequirementRows(),
        fetchInstanceRows(),
        fetchDealRows(),
    ]).then(() => {
        moduleState.baseDataLoadedAt = Date.now();
        writeBaseDataSessionCache();
    });
    moduleState.baseDataLoadingPromise = request.finally(() => {
        if (moduleState.baseDataLoadingPromise === request) moduleState.baseDataLoadingPromise = null;
    });
    return moduleState.baseDataLoadingPromise;
}

function writeBaseDataSessionCache() {
    try {
        const storage = window?.sessionStorage;
        if (!storage) return;
        const payload = {
            savedAt: Date.now(),
            brands: Array.isArray(moduleState.brands) ? moduleState.brands : [],
            products: Array.isArray(moduleState.products) ? moduleState.products : [],
            customers: Array.isArray(moduleState.customers) ? moduleState.customers : [],
            requirements: Array.isArray(moduleState.requirements) ? moduleState.requirements : [],
            instances: Array.isArray(moduleState.instances) ? moduleState.instances : [],
            deals: Array.isArray(moduleState.deals) ? moduleState.deals : [],
        };
        storage.setItem(BASE_DATA_SESSION_CACHE_KEY, JSON.stringify(payload));
    } catch {
        // Ignore cache write failures (quota / privacy mode / unavailable storage).
    }
}

function tryHydrateBaseDataFromSessionCache() {
    try {
        const storage = window?.sessionStorage;
        if (!storage) return false;
        const raw = storage.getItem(BASE_DATA_SESSION_CACHE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        const savedAt = Number(parsed?.savedAt || 0);
        if (!Number.isFinite(savedAt) || Date.now() - savedAt > BASE_DATA_SESSION_CACHE_MS) return false;
        const keys = ['brands', 'products', 'customers', 'requirements', 'instances', 'deals'];
        if (keys.some((key) => !Array.isArray(parsed?.[key]))) return false;
        moduleState.brands = parsed.brands;
        moduleState.products = parsed.products;
        moduleState.customers = parsed.customers;
        moduleState.requirements = parsed.requirements;
        moduleState.instances = parsed.instances;
        moduleState.deals = parsed.deals;
        moduleState.baseDataLoadedAt = savedAt;
        return true;
    } catch {
        return false;
    }
}

async function ensureBaseData() {
    const now = Date.now();
    const hasSnapshot = moduleState.baseDataLoadedAt > 0;
    const age = hasSnapshot ? (now - moduleState.baseDataLoadedAt) : Number.POSITIVE_INFINITY;

    if (!hasSnapshot) {
        if (tryHydrateBaseDataFromSessionCache()) {
            if (!moduleState.baseDataLoadingPromise) void startBaseDataLoad();
            return;
        }
        await startBaseDataLoad();
        return;
    }

    if (age <= BASE_DATA_FRESH_MS) return;

    if (age <= BASE_DATA_MAX_STALE_MS) {
        if (!moduleState.baseDataLoadingPromise) void startBaseDataLoad();
        return;
    }

    await startBaseDataLoad();
}

function isQuoteSetupMissing(error) {
    const message = String(error?.message || '').toLowerCase();
    return (
        message.includes('quote_brands') ||
        message.includes('quote_products') ||
        message.includes('quote_product_media') ||
        message.includes('quote_requirements') ||
        message.includes('quote_instances') ||
        message.includes('quote_deals') ||
        message.includes('quote_customer_activities') ||
        message.includes('quote_activity_reads') ||
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
                        <span>请先在 Supabase SQL Editor 执行 <code>article_management/sql/006_quote_system.sql</code>；已有旧版库时，再补执行 <code>article_management/sql/008_quote_product_media.sql</code>、<code>article_management/sql/010_quote_customer_tracking.sql</code>、<code>article_management/sql/011_quote_send_ledger.sql</code>、<code>article_management/sql/012_quote_requirement_intake.sql</code>、<code>article_management/sql/013_quote_requirement_public_flow.sql</code>、<code>article_management/sql/017_sales_console_roles_and_deals.sql</code>、<code>article_management/sql/018_quote_deals_archive_fields.sql</code>、<code>article_management/sql/021_quote_customer_activities.sql</code>；如果当前错误是 <code>quote_customers.is_deleted does not exist</code>，再单独执行 <code>article_management/sql/015_quote_customer_soft_delete.sql</code>。</span>
                    </div>
                </div>
                <div class="ams-quick-link ams-quick-link-static">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-file-import"></i></div>
                    <div class="ams-quick-link-body">
                        <strong>完成后导入示例模板</strong>
                        <span>执行完成后回到“品牌管理”，点击“导入示例模板”，即可生成两套初始品牌、产品和演示报价单。</span>
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

function localizedFieldGroup(idPrefix, label, value = {}, options = {}) {
    const localized = normalizeLocalizedText(value);
    const placeholders = options.placeholders || {};
    const effective = options.forceEmpty ? {} : localized;
    return `
        <div class="ams-quote-field-card">
            <div class="ams-quote-field-card-head">
                <strong>${esc(label)}</strong>
                <span>默认中文录入</span>
            </div>
            <div class="ams-field">
                <label>中文</label>
                <textarea class="ams-textarea ams-quote-textarea" data-i18n-prefix="${esc(idPrefix)}" data-lang="zh" placeholder="${esc(placeholders.zh || '')}">${esc(effective.zh || '')}</textarea>
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
                                    <textarea class="ams-textarea ams-quote-textarea" data-i18n-prefix="${esc(idPrefix)}" data-lang="${esc(lang)}" placeholder="${esc(placeholders[lang] || '')}">${esc(effective[lang] || '')}</textarea>
                                </div>
                            `,
                        )
                        .join('')}
                </div>
            </details>
        </div>
    `;
}

function brandLocalizedFieldGroup(idPrefix, label, value = {}, options = {}) {
    const localized = normalizeLocalizedText(value);
    const placeholders = options.placeholders || {};
    const effective = options.forceEmpty ? {} : localized;
    return `
        <div class="ams-quote-field-card">
            <div class="ams-quote-field-card-head">
                <strong>${esc(label)}</strong>
                <span>默认中文录入</span>
            </div>
            <div class="ams-field">
                <label>中文</label>
                <textarea class="ams-textarea ams-quote-textarea" data-i18n-prefix="${esc(idPrefix)}" data-lang="zh" placeholder="${esc(placeholders.zh || '')}">${esc(effective.zh || '')}</textarea>
                <div class="ams-field-help">最终多语言内容在报价可视化编辑中处理，这里只维护中文基线。</div>
            </div>
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

function salesActivityTypeLabel(activityType = '') {
    const key = text(activityType);
    if (key === 'field_change') return '字段修改';
    if (key === 'status_change') return '状态变化';
    if (key === 'stage_advanced') return '节点推进';
    if (key === 'quote_generated') return '生成报价';
    if (key === 'public_link_opened') return '打开公开入口';
    if (key === 'button_click') return '关键动作';
    return '页面访问';
}

function salesActivityStageLabel(stageKey = '') {
    return stageKey ? dealStageLabel(stageKey) : '未归类节点';
}

function salesActivityDetailLine(activity = {}) {
    const detail = activity.detail_json && typeof activity.detail_json === 'object' ? activity.detail_json : {};
    const aggregateCount = safeNumber(detail.aggregate_count, 0);
    if (aggregateCount > 1) {
        return `集中触发 ${aggregateCount} 次 · 首次 ${fmtDate(detail.aggregate_from)} · 最近 ${fmtDate(detail.aggregate_to || activity.occurred_at)}`;
    }
    if (Array.isArray(detail.fields) && detail.fields.length) {
        const rendered = detail.fields
            .slice(0, 4)
            .map((field) => `${text(field.label || field.field)}: ${text(field.before, '空')} -> ${text(field.after, '空')}`)
            .join('；');
        return detail.fields.length > 4 ? `${rendered}；等 ${detail.fields.length} 项` : rendered;
    }
    if (text(detail.summary)) return text(detail.summary);
    if (text(detail.button)) return `按钮：${text(detail.button)}`;
    if (text(detail.access_mode)) return `访问方式：${accessModeLabel(detail.access_mode)}`;
    return '';
}

function salesActivityTimelineItemMarkup(activity = {}) {
    const detailLine = salesActivityDetailLine(activity);
    const stageLabel = salesActivityStageLabel(activity.stage_key);
    const actorLabel = salesActorLabel(activity.actor_type, activity.actor_label);
    return `
        <article class="ams-sales-activity-item">
            <div class="ams-sales-activity-main">
                <div class="ams-sales-activity-head">
                    <strong>${esc(text(activity.action_label, salesActivityTypeLabel(activity.activity_type)))}</strong>
                    <span class="ams-sales-activity-pill is-${esc(text(activity.actor_type, 'system'))}">${esc(actorLabel)}</span>
                    <span class="ams-sales-activity-stage">${esc(stageLabel)}</span>
                </div>
                <div class="ams-sales-activity-meta">
                    <span>${esc(text(activity.page_key || activity.entity_type, 'sales'))}</span>
                    <span>${esc(salesActivityTypeLabel(activity.activity_type))}</span>
                    ${detailLine ? `<span>${esc(detailLine)}</span>` : ''}
                </div>
            </div>
            <time>${esc(fmtDate(activity.occurred_at))}</time>
        </article>
    `;
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
                                        <td><input class="ams-input ams-quote-inline-input" data-item-prefix="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-item-field="brand_label" value="${esc(row.brand_label)}" placeholder="品牌名"></td>
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

function productBrandLocalizedFieldGroup(field, label, value = {}, options = {}) {
    const localized = normalizeLocalizedText(value);
    const placeholders = options.placeholders || {};
    const effective = options.forceEmpty ? {} : localized;
    return `
        <div class="ams-quote-field-card">
            <div class="ams-quote-field-card-head">
                <strong>${esc(label)}</strong>
                <span>品牌共享文案</span>
            </div>
            <div class="ams-field">
                <label>中文</label>
                <textarea class="ams-textarea ams-quote-textarea" data-product-brand-i18n="${esc(field)}" data-lang="zh" placeholder="${esc(placeholders.zh || '')}">${esc(effective.zh || '')}</textarea>
                <div class="ams-field-help">最终多语言内容在报价可视化编辑中处理，这里只维护中文基线。</div>
            </div>
        </div>
    `;
}

function brandDefaultLinkPanelMarkup(brandDraft = {}) {
    const context = brandDefaultLinkContext(brandDraft);
    return `
        <div class="ams-quote-block ams-brand-default-link-panel">
            <div class="ams-section-head">
                <div>
                    <h3>默认链接</h3>
                    <p>左侧绿色“默认链接”读这里。默认可直接填 slug，需要时再一键带入最新已发布报价。</p>
                </div>
                <div class="ams-row-actions">
                    <button class="ams-btn ams-btn-muted" type="button" id="ams-brand-default-link-autofill" ${context.published.length ? '' : 'disabled'}>带入最新已发布</button>
                </div>
            </div>
            <div class="ams-brand-default-link-row">
                <div class="ams-field">
                    <label>默认链接 slug</label>
                    <input class="ams-input" data-brand-field="default_quote_slug" value="${esc(context.effectiveSlug)}" placeholder="${esc(context.pickerValue || 'quote-public-slug')}">
                    <div class="ams-field-help">${context.published.length ? '不填时可点右侧按钮自动带入最近已发布报价。' : '当前品牌还没有已发布报价，请直接手填。'}</div>
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
                        <div class="ams-field-help">供应商与发件邮箱继承品牌默认信息。</div>
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
    const brand = displayBrandDraft(extractBrandSnapshot(draft.brand_snapshot));
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
                            <input class="ams-input" data-brand-snapshot-field="supplier_name" value="${esc(brand.supplier_name)}" placeholder="供应商名称">
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
            : '每个品牌 / 产品维护独立图片库。客户页默认在报价表格下方以纵向铺图展示，最终样式在可视化编辑端确认。');

    return `
        <section class="ams-quote-block ${esc(extraClass)}">
            <div class="ams-section-head">
                <div>
                    <h3>产品图片库</h3>
                    <p>${esc(description)}</p>
                </div>
            </div>
            <div class="ams-media-toolbar">
                <label class="ams-social-toggle">
                    <input type="checkbox" data-media-config-prefix="${esc(prefix)}" data-media-config-field="enabled" ${config.enabled ? 'checked' : ''} ${editable ? '' : 'disabled'}>
                    <span>在客户页显示产品图片</span>
                </label>
                ${
                    editable
                        ? `
                    <label class="ams-media-upload-trigger">
                        <input class="ams-media-upload-input" type="file" accept="image/*" multiple data-media-upload="${esc(prefix)}">
                        <span><i class="fa-solid fa-image"></i> ${esc(uploadLabel)}</span>
                    </label>
                `
                        : ''
                }
            </div>
            <div class="ams-field-help ams-media-toolbar-help">图片为空时客户页不会显示该图片区块；后续可在可视化编辑端再确认最终展示方式，默认为报价表格下方纵向铺图。</div>
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
                  (brand) => {
                      const viewBrand = displayBrandDraft(brand);
                      return `
                <button class="ams-quote-list-card ${brand.id === moduleState.brandEditor.id ? 'is-active' : ''}" type="button" data-brand-edit="${esc(brand.id)}">
                    <strong>${esc(viewBrand.display_name || viewBrand.brand_name)}</strong>
                    <span>${esc(viewBrand.slug)}</span>
                    <em>${brand.is_active === false ? '已归档' : '启用中'} · 默认链接 ${esc(displayBrandSlugValue(brand.default_quote_slug || '--', brand))}</em>
                </button>
            `;
                  },
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
                  (product) => {
                      const title = pickLocalized(product.public_title, product.default_lang, product.slug);
                      const brandLabel = brandLabelById(product.brand_id);
                      return `
                <button class="ams-quote-list-card ${product.id === moduleState.productEditor.id ? 'is-active' : ''}" type="button" data-product-edit="${esc(product.id)}">
                    <strong>${esc(`${brandLabel} / ${title}`)}</strong>
                    <em>${product.is_active ? '启用中' : '已停用'} · 有效期 ${esc(product.validity_hours)} 小时</em>
                </button>
            `;
                  },
              )
              .join('')
        : '<div class="ams-empty">当前筛选下没有产品。</div>';
}

function renderProductListCards() {
    const rows = filteredProducts();
    return rows.length
        ? rows
              .map(
                  (product) => {
                      const title = pickLocalized(product.public_title, product.default_lang, product.slug);
                      const brandLabel = brandLabelById(product.brand_id);
                      const statusLine = [
                          brandLabel,
                          `${product.is_active === false ? '已删除' : '启用中'}`,
                          `${product.validity_hours} 小时`,
                      ].filter(Boolean).join(' · ');
                      return `
                <button class="ams-quote-list-card ${product.id === moduleState.productEditor.id ? 'is-active' : ''}" type="button" data-product-edit="${esc(product.id)}">
                    <strong>${esc(title)}</strong>
                    <span>${esc(product.slug)}</span>
                    <em>${esc(statusLine)}</em>
                </button>
            `;
                  },
              )
              .join('')
        : '<div class="ams-empty">当前筛选下没有产品。</div>';
}

function renderInstanceList() {
    const rows = pagedInstances();
    return rows.length
        ? rows
              .map((quote) => {
                  const linkedRequirement = requirementById(quote.requirement_id);
                  const linkedDeal = quoteDeal(quote.id);
                  const generatedAt = quote.published_at || quote.created_at || quote.updated_at;
                  const syncLabel = quote.published_at
                      ? `发布于 ${fmtDate(quote.published_at)}`
                      : generatedAt
                          ? `生成于 ${fmtDate(generatedAt)}`
                          : `更新于 ${fmtDate(quote.updated_at)}`;
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
                        ${linkedDeal ? `<span class="ams-quote-inline-submeta">商机：${esc(text(linkedDeal.title, linkedDeal.id))} · ${esc(dealStageLabel(linkedDeal.current_stage))}</span>` : ''}
                        <em>${statusPill(quote.status)} <span class="ams-quote-inline-meta">${esc(syncLabel)}</span></em>
                    </button>
                    <div class="ams-quote-list-card-actions">
                        ${
                            quote.status === 'archived' || quote.status === 'voided'
                                ? `
                                    ${linkedRequirement ? `<button class="ams-btn ams-btn-muted" type="button" data-instance-open-requirement="${esc(quote.id)}">查看需求</button>` : ''}
                                    <button class="ams-btn ams-btn-muted" type="button" data-instance-restore="${esc(quote.id)}">恢复</button>
                                  `
                                : `
                                    ${linkedRequirement ? `<button class="ams-btn ams-btn-muted" type="button" data-instance-open-requirement="${esc(quote.id)}">查看需求</button>` : ''}
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
                  const deals = customerDeals(customer.id);
                  const isActive = text(moduleState.customerLoadedId || moduleState.customerEditor?.id) === text(customer.id);
                  const notePreview = text(customer.notes).replace(/\s+/g, ' ').trim();
                  return `
                    <article class="ams-customer-list-card-shell ${isActive ? 'is-active' : ''}">
                        <button class="ams-quote-list-card ${isActive ? 'is-active' : ''}" type="button" data-customer-edit="${esc(customer.id)}">
                            <strong>${esc(customerDisplayName(customer))}</strong>
                            <span>${esc(text(customer.contact_name || customer.email || customer.phone, '未填写联系人'))}</span>
                            <span class="ams-quote-inline-submeta">${esc(text(customer.company_name || customer.email || customer.phone || customer.country, '未填写联系信息'))}</span>
                            <span class="ams-quote-inline-submeta">${esc(notePreview ? `客户备注：${notePreview.slice(0, 42)}${notePreview.length > 42 ? '...' : ''}` : '客户备注：未填写')}</span>
                            ${deals.length ? `<span class="ams-quote-inline-submeta">销售流程：${esc(text(deals[0].title, deals[0].id))}${deals.length > 1 ? ` 等 ${deals.length} 条` : ''}</span>` : ''}
                            <span class="ams-quote-inline-submeta">${esc(`更新时间：${fmtDate(customer.updated_at || customer.created_at)}`)}</span>
                            <em>${deals.length} 条销售流程 / ${requirementSummary.total_requirements} 份需求单 / ${quoteSummary.total_quotes} 份报价单 <span class="ams-quote-inline-meta">${quoteSummary.published_quotes} 已发布 / ${quoteSummary.archived_quotes} 已归档 / ${quoteSummary.voided_quotes} 已作废</span></em>
                        </button>
                <div class="ams-quote-list-card-actions">
                    ${
                        customer.is_deleted
                            ? `<button class="ams-btn ams-btn-muted" type="button" data-customer-restore="${esc(customer.id)}">恢复</button>`
                            : customer.is_active === false
                                ? `
                                    <button class="ams-btn ams-btn-muted" type="button" data-customer-restore="${esc(customer.id)}">恢复</button>
                                    <button class="ams-btn ams-btn-danger" type="button" data-customer-delete="${esc(customer.id)}">作废</button>
                                  `
                                : `
                                    <button class="ams-btn ams-btn-muted" type="button" data-customer-archive="${esc(customer.id)}">归档</button>
                                    <button class="ams-btn ams-btn-danger" type="button" data-customer-delete="${esc(customer.id)}">作废</button>
                                  `
                    }
                </div>
            </article>
        `;
              })
              .join('')
        : `<div class="ams-empty">${
            moduleState.customerListMode === 'deleted'
                ? '当前没有已作废客户。'
                : moduleState.customerListMode === 'archived'
                    ? '当前没有已归档客户。'
                    : '当前没有有效客户档案。'
        }</div>`;
}

function customerActivePipelineDeals(customerId = '') {
    return customerDeals(customerId).filter((deal) => !isDealArchived(deal));
}

function customerVisibleStageDeals(customerId = '', input = null, stageKey = '') {
    const scopedStage = normalizeDealStageKey(stageKey || 'customer_profile');
    const baseDeals = input
        ? visibleDealsForInput(input, { includeClosed: false, includeArchived: false })
            .filter((deal) => text(deal.customer_id) === text(customerId))
        : customerActivePipelineDeals(customerId);
    return baseDeals
        .filter((deal) => scopedStage === 'customer_profile' || normalizeDealStageKey(deal.current_stage) === scopedStage);
}

function customerMatchesStageFilter(customerId = '', stageKey = 'customer_profile', input = null) {
    const normalizedStage = normalizeDealStageKey(stageKey || 'customer_profile');
    if (normalizedStage === 'customer_profile') return true;
    return customerVisibleStageDeals(customerId, input, normalizedStage).length > 0;
}

function customerStageCounts(customerId = '', input = null, stageScope = 'customer_profile') {
    const counts = new Map(DEAL_STAGE_DEFINITIONS.map((stage) => [stage.key, 0]));
    customerVisibleStageDeals(customerId, input, stageScope).forEach((deal) => {
        const key = normalizeDealStageKey(deal.current_stage);
        counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
}

function customerPrimaryFlowTarget(customerId = '') {
    const deal = customerActivePipelineDeals(customerId)[0] || customerDeals(customerId)[0] || null;
    if (!deal?.id) return '';
    return customerFlowStageUrl(deal.current_stage, deal, customerId);
}

function customerPrimaryRequirement(customerId = '') {
    const deals = customerActivePipelineDeals(customerId);
    for (const deal of deals) {
        const requirement = dealRequirements(deal.id)[0] || null;
        if (requirement?.public_slug && requirement?.public_token) return requirement;
    }
    return customerRequirements(customerId).find((item) => item.public_slug && item.public_token) || null;
}

function customerRequirementLink(customerId = '') {
    const requirement = customerPrimaryRequirement(customerId);
    if (!requirement?.public_slug || !requirement?.public_token) return '';
    return requirementPublicUrl(requirement.public_slug, requirement.public_token);
}

async function ensureCustomerRequirementFlow(user, customer) {
    const customerId = text(customer?.id);
    if (!customerId) throw new Error('请先保存客户档案。');

    const activeDeals = customerActivePipelineDeals(customerId);
    let deal = activeDeals.find((item) => normalizeDealStageKey(item.current_stage) === 'requirement_capture')
        || activeDeals.find((item) => normalizeDealStageKey(item.current_stage) === 'customer_profile')
        || null;
    if (!deal?.id) {
        const owner = currentSalesOwner(user);
        deal = await saveDealDraft(user, {
            customer_id: customerId,
            current_stage: 'requirement_capture',
            owner_name: owner.name,
            owner_email: owner.email,
            title: `${customerDisplayName(customer || {})} / 获取需求`,
        }, {
            currentStage: 'requirement_capture',
            stageRecords: [],
        });
    }

    let requirement = dealRequirements(deal.id)[0] || null;
    if (!requirement?.id) {
        requirement = await saveRequirementDraft(user, {
            customer_id: customerId,
            deal_id: deal.id,
            title: `${customerDisplayName(customer || {})} / ${requirementTypeLabel('integrated_mining_power')}`,
            requester_company: customer?.company_name || '',
            requester_name: customer?.contact_name || '',
            requester_email: normalizedCustomerEmail(customer?.email),
            requester_phone: customer?.phone || '',
            country: customer?.country || '',
            notes: customer?.notes || '',
        });
        deal = await saveDealDraft(user, {
            ...deal,
            primary_requirement_id: requirement.id,
            current_stage: 'requirement_capture',
        }, {
            currentStage: 'requirement_capture',
            stageRecords: dealCurrentRecords(deal),
        });
    } else if (text(deal.primary_requirement_id) !== text(requirement.id)) {
        deal = await saveDealDraft(user, {
            ...deal,
            primary_requirement_id: requirement.id,
        }, {
            currentStage: deal.current_stage,
            stageRecords: dealCurrentRecords(deal),
        });
    }

    return {
        deal: createDealDraft(deal),
        requirement: createRequirementDraft(requirement),
        link: requirementPublicUrl(requirement.public_slug, requirement.public_token),
    };
}

function salesCustomerStageStripMarkup(customerId = '', input = null, stageScope = 'customer_profile') {
    const normalizedScope = normalizeDealStageKey(stageScope || 'customer_profile');
    const stageCounts = customerStageCounts(customerId, input, normalizedScope);
    const deal = customerVisibleStageDeals(customerId, input, normalizedScope)[0]
        || customerVisibleStageDeals(customerId, input)[0]
        || customerDeals(customerId)[0]
        || null;
    const dealRecords = deal ? dealCurrentRecords(deal) : [];
    return `
        <div class="ams-sales-customer-stage-strip">
            ${DEAL_STAGE_DEFINITIONS.map((stage) => {
                const count = stageCounts.get(stage.key) || 0;
                const stageRecord = deal
                    ? stageRecordByKey(stage.key, dealRecords) || createDealStageRecord({
                        deal_id: deal.id,
                        stage_key: stage.key,
                        stage_status: normalizeDealStageKey(deal.current_stage) === stage.key ? 'active' : 'pending',
                    })
                    : createDealStageRecord({ stage_key: stage.key, stage_status: 'pending' });
                const stageStatus = normalizeDealStageStatus(stageRecord.stage_status);
                const clickable = Boolean(
                    deal?.id
                    && count > 0
                    && ['completed', 'active', 'blocked'].includes(stageStatus),
                );
                const tone = count <= 0
                    ? 'is-muted'
                    : stageStatus === 'completed'
                        ? 'is-completed'
                        : stageStatus === 'blocked'
                            ? 'is-warning'
                            : 'is-active';
                const body = `
                    ${count > 0 ? '<span class="ams-sales-customer-stage-pin" aria-hidden="true">📌</span>' : ''}
                    <strong>${esc(stage.shortLabel || stage.label)}</strong>
                    <span>${esc(count)}</span>
                `;
                if (!clickable) {
                    return `<div class="ams-sales-customer-stage-chip ${tone}">${body}</div>`;
                }
                return `<a class="ams-sales-customer-stage-chip is-link ${tone}" href="${esc(customerFlowStageUrl(stage.key, deal, customerId))}">${body}</a>`;
            }).join('')}
        </div>
    `;
}

function renderSalesCustomerArchiveList(input = null) {
    const stageFilter = currentSalesStageParam('customer_profile');
    const listMode = moduleState.customerListMode || 'active';
    const rows = filteredCustomers().filter((customer) => {
        if (listMode !== 'active') return true;
        return customerMatchesStageFilter(customer.id, stageFilter, input);
    });
    return rows.length
        ? rows
            .map((customer) => {
                const scopedInput = listMode === 'active' ? input : null;
                const scopedStage = listMode === 'active' ? stageFilter : 'customer_profile';
                const deals = customerVisibleStageDeals(customer.id, scopedInput, scopedStage);
                const quoteSummary = summarizeCustomerQuotes(customer.id);
                const requirementSummary = summarizeCustomerRequirements(customer.id);
                const notePreview = text(customer.notes).replace(/\s+/g, ' ').trim();
                const expanded = moduleState.customerArchiveExpandedMap[text(customer.id)] === true;
                return `
                        <article class="ams-sales-customer-card">
                            <div class="ams-sales-customer-card-main">
                                <details class="ams-sales-customer-card-copy ams-sales-customer-disclosure" data-customer-expand-wrap="${esc(customer.id)}" ${expanded ? 'open' : ''}>
                                    <summary class="ams-sales-customer-card-head" aria-label="${expanded ? '收起客户信息' : '展开客户信息'}">
                                        <div class="ams-sales-customer-card-title">
                                            <strong>${esc(customerDisplayName(customer))}</strong>
                                            <span class="ams-sales-customer-expand" aria-hidden="true">
                                                <i class="fa-solid fa-chevron-${expanded ? 'up' : 'down'}"></i>
                                            </span>
                                        </div>
                                    </summary>
                                    <div class="ams-sales-customer-card-meta is-compact" data-customer-expand-panel="${esc(customer.id)}">
                                        <span><strong>联系人</strong><em>${esc(text(customer.contact_name, '未填写'))}</em></span>
                                        <span><strong>客户公司</strong><em>${esc(text(customer.company_name, '未填写'))}</em></span>
                                        <span><strong>电话 / 邮箱</strong><em>${esc(text(customer.phone || customer.email, '未填写'))}</em></span>
                                        <span><strong>更新时间</strong><em>${esc(fmtDate(customer.updated_at || customer.created_at))}</em></span>
                                        <span class="is-wide"><strong>统计</strong><em>${esc(`${deals.length} 条销售流程 / ${requirementSummary.total_requirements} 份需求单 / ${quoteSummary.total_quotes} 份报价单`)}</em></span>
                                        <span class="is-wide"><strong>客户备注</strong><em>${esc(notePreview ? `${notePreview.slice(0, 96)}${notePreview.length > 96 ? '...' : ''}` : '未填写')}</em></span>
                                    </div>
                                </details>
                                <div class="ams-sales-customer-card-actions">
                                  ${customer.is_deleted
                                    ? `<button class="ams-btn ams-btn-muted" type="button" data-customer-restore="${esc(customer.id)}">恢复</button>`
                                    : customer.is_active === false
                                        ? `
                                            <button class="ams-btn ams-btn-muted" type="button" data-customer-restore="${esc(customer.id)}">恢复</button>
                                            <button class="ams-btn ams-btn-danger" type="button" data-customer-delete="${esc(customer.id)}">作废</button>
                                        `
                                        : `
                                            <button class="ams-btn ams-btn-muted" type="button" data-customer-archive="${esc(customer.id)}">归档</button>
                                            <button class="ams-btn ams-btn-danger" type="button" data-customer-delete="${esc(customer.id)}">作废</button>
                                        `}
                            </div>
                        </div>
                        ${salesCustomerStageStripMarkup(customer.id, scopedInput, scopedStage)}
                    </article>
                `;
              })
              .join('')
        : `<div class="ams-empty">${
            moduleState.customerListMode === 'deleted'
                ? '当前没有已作废客户。'
                : moduleState.customerListMode === 'archived'
                    ? '当前没有已归档客户。'
                    : '当前没有有效客户档案。'
        }</div>`;
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
                  const linkedDeal = requirementDeal(requirement.id);
                  const contactLabel = text(requirement.requester_name || requirement.requester_email || requirement.requester_phone || customer?.contact_name, '未填写联系人');
                  return `
                    <article class="ams-customer-list-card-shell">
                        <button class="ams-quote-list-card ${moduleState.requirementLoadedId === requirement.id ? 'active' : ''}" type="button" data-requirement-edit="${esc(requirement.id)}">
                            <strong>${esc(requirementDisplayName(requirement))}</strong>
                            <span>${esc(text(requirement.requester_company || customerDisplayName(customer || {})))}</span>
                            <span class="ams-quote-inline-submeta">${esc(requirementSummaryLine(requirement) || '待补充需求摘要')}</span>
                            ${linkedDeal ? `<span class="ams-quote-inline-submeta">商机：${esc(text(linkedDeal.title, linkedDeal.id))} · ${esc(dealStageLabel(linkedDeal.current_stage))}</span>` : ''}
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

function renderDealList() {
    const rows = filteredDeals();
    return rows.length
        ? rows
              .map((deal) => {
                  const customer = moduleState.customers.find((item) => item.id === deal.customer_id);
                  const requirements = dealRequirements(deal.id);
                  const quotes = dealQuotes(deal.id);
                  const isActive = text(moduleState.dealLoadedId || moduleState.dealEditor?.id) === text(deal.id);
                  return `
                    <article class="ams-customer-list-card-shell ${isActive ? 'is-active' : ''}">
                        <button class="ams-quote-list-card ${isActive ? 'is-active' : ''}" type="button" data-deal-edit="${esc(deal.id)}">
                            <strong>${esc(text(deal.title, deal.id))}</strong>
                            <span>${esc(customerDisplayName(customer || {}))}</span>
                            <span class="ams-quote-inline-submeta">${esc(text(deal.summary || deal.next_action, '待补充商机摘要'))}</span>
                            <span class="ams-quote-inline-submeta">${esc(`${dealStageLabel(deal.current_stage)} · ${dealStatusLabel(deal.deal_status)}`)}</span>
                            <em>${dealStatusPill(deal.deal_status)} <span class="ams-quote-inline-meta">${esc(`${requirements.length} 份需求 / ${quotes.length} 份报价 / 更新于 ${fmtDate(deal.updated_at || deal.created_at)}`)}</span></em>
                        </button>
                    </article>
                `;
              })
              .join('')
        : '<div class="ams-empty">当前筛选下没有商机项目。</div>';
}

function requirementQuoteListMarkup(requirementId = '') {
    const rows = requirementQuotes(requirementId);
    return rows.length
        ? rows
              .map((quote) => {
                  const stamp = quote.published_at || quote.created_at || quote.updated_at;
                  return `
                    <article class="ams-customer-quote-row">
                        <div class="ams-customer-quote-copy">
                            <strong>${esc(quote.customer_name || productLabelById(quote.product_id) || quote.public_slug)}</strong>
                            <span>${esc(brandLabelById(quote.brand_id))} · ${esc(productLabelById(quote.product_id))}</span>
                            <span class="ams-quote-inline-submeta">${statusPill(quote.status)} <span class="ams-quote-inline-meta">${esc(quote.public_slug)}</span></span>
                        </div>
                        <div class="ams-customer-quote-meta">
                            <time>${esc(fmtDate(stamp))}</time>
                            <div class="ams-row-actions">
                                <button class="ams-btn ams-btn-muted" type="button" data-requirement-quote-open="${esc(quote.id)}">后台查看</button>
                                ${quote.status === 'published'
                                    ? `<button class="ams-btn ams-btn-warning" type="button" data-requirement-quote-public="${esc(quote.public_slug)}">客户页</button>`
                                    : ''}
                            </div>
                        </div>
                    </article>
                `;
              })
              .join('')
        : '<div class="ams-empty">这份需求单还没有生成报价单。</div>';
}

function customerQuoteListMarkup(customerId = '') {
    const rows = customerQuotes(customerId);
    return rows.length
        ? rows
              .map((quote) => {
                  const stamp = quote.published_at || quote.created_at || quote.updated_at;
                  return `
                    <article class="ams-customer-quote-row">
                        <div class="ams-customer-quote-copy">
                            <strong>${esc(quote.customer_name || productLabelById(quote.product_id) || quote.public_slug)}</strong>
                            <span>${esc(brandLabelById(quote.brand_id))} · ${esc(productLabelById(quote.product_id))}</span>
                            <span class="ams-quote-inline-submeta">${statusPill(quote.status)} <span class="ams-quote-inline-meta">${esc(quote.public_slug)}</span></span>
                        </div>
                        <div class="ams-customer-quote-meta">
                            <time>${esc(fmtDate(stamp))}</time>
                            <div class="ams-row-actions">
                                <button class="ams-btn ams-btn-muted" type="button" data-customer-quote-preview="${esc(quote.id)}">后台预览</button>
                                ${quote.status === 'published'
                                    ? `<button class="ams-btn ams-btn-warning" type="button" data-customer-quote-public="${esc(quote.public_slug)}">客户页</button>`
                                    : ''}
                            </div>
                        </div>
                    </article>
                `;
              })
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

function customerTrackingStageSummary(customerId = '') {
    const requirements = customerRequirements(customerId);
    const quotes = customerQuotes(customerId);
    const sends = customerShareHistory(customerId);
    const events = Array.isArray(moduleState.customerEvents) ? moduleState.customerEvents : [];
    const latestRequirement = requirements[0] || null;
    const latestQuote = quotes[0] || null;
    const latestSend = sends[0] || null;
    const latestEvent = events[0] || null;

    if (latestEvent) {
        return {
            title: '客户已查看报价',
            detail: `${eventTypeLabel(latestEvent.event_type)} · ${fmtDate(latestEvent.created_at)}`,
            tone: 'success',
            href: latestEvent.instance_id ? adminPageUrl('quote-instances', { instance: latestEvent.instance_id }) : '',
        };
    }
    if (latestSend) {
        return {
            title: '报价已发出待反馈',
            detail: `${shareHistoryStatusLabel(latestSend.status)} · ${fmtDate(latestSend.updated_at || latestSend.last_sent_at || latestSend.sent_at)}`,
            tone: 'active',
            href: latestSend.instance_id ? adminPageUrl('quote-instances', { instance: latestSend.instance_id }) : '',
        };
    }
    if (latestQuote) {
        return {
            title: text(latestQuote.status) === 'published' ? '报价已发布' : '报价推进中',
            detail: `${productLabelById(latestQuote.product_id)} · ${fmtDate(latestQuote.updated_at || latestQuote.created_at)}`,
            tone: 'active',
            href: adminPageUrl('quote-instances', { instance: latestQuote.id }),
        };
    }
    if (latestRequirement) {
        return {
            title: requirementStatusReadyForQuote(latestRequirement.status) ? '需求已进入报价前整理' : '需求收集中',
            detail: `${requirementStatusLabel(latestRequirement.status)} · ${fmtDate(latestRequirement.updated_at || latestRequirement.created_at)}`,
            tone: 'warning',
            href: adminPageUrl('quote-requirements', { requirement: latestRequirement.id }),
        };
    }
    return {
        title: '等待录入首条线索',
        detail: '客户已建档，可继续进入线索收集。',
        tone: 'muted',
        href: customerId ? adminPageUrl('quote-customers', { customer: customerId }) : '',
    };
}

function customerPipelineNodeMarkup(node = {}) {
    const href = text(node.href);
    const external = node.external === true;
    const tag = href ? 'a' : 'div';
    const attrs = href
        ? ` href="${esc(href)}"${external ? ' target="_blank" rel="noopener"' : ''}`
        : '';
    return `
        <${tag} class="ams-customer-pipeline-node is-${esc(text(node.tone, 'muted'))}${href ? ' is-link' : ''}"${attrs}>
            <div class="ams-customer-pipeline-node-head">
                <span class="ams-customer-pipeline-icon"><i class="fa-solid ${esc(text(node.icon, 'fa-circle'))}"></i></span>
                <span class="ams-customer-pipeline-badge">${esc(text(node.badge, '--'))}</span>
            </div>
            <strong>${esc(text(node.title, '未命名节点'))}</strong>
            <span>${esc(text(node.detail, '暂无状态'))}</span>
            <em>${esc(text(node.meta, href ? '点击直达查看' : '等待链路推进'))}</em>
        </${tag}>
    `;
}

function customerPipelineMarkup(customerId = '') {
    if (!customerId) {
        return `
            <section class="ams-card ams-customer-pipeline-shell">
                <div class="ams-section-head">
                    <div>
                        <h3>客户跟踪流水线</h3>
                        <p>从客户建档到线索、报价、发送和访问，整条链路会在这里汇总。</p>
                    </div>
                    <div class="ams-row-actions">
                        <button class="ams-btn ams-btn-muted" type="button" disabled>关系图谱</button>
                    </div>
                </div>
                <div class="ams-empty">先从下方左侧选择一个客户，流水线和关系图谱会自动聚合这名客户的完整链路。</div>
            </section>
        `;
    }

    const customer = moduleState.customers.find((item) => item.id === customerId) || moduleState.customerEditor || {};
    const requirements = customerRequirements(customerId);
    const latestRequirement = requirements[0] || null;
    const quotes = customerQuotes(customerId);
    const latestQuote = quotes[0] || null;
    const sends = customerShareHistory(customerId);
    const latestSend = sends[0] || null;
    const events = Array.isArray(moduleState.customerEvents) ? moduleState.customerEvents : [];
    const latestEvent = events[0] || null;
    const stage = customerTrackingStageSummary(customerId);
    const publicRequirementLink = latestRequirement?.public_slug && latestRequirement?.public_token
        ? requirementPublicUrl(latestRequirement.public_slug, latestRequirement.public_token)
        : '';

    const nodes = [
        {
            icon: 'fa-address-book',
            badge: '客户',
            title: '客户主档',
            detail: customerDisplayName(customer),
            meta: `创建于 ${fmtDate(customer.created_at)}`,
            tone: 'success',
            href: adminPageUrl('quote-customers', { customer: customerId }),
        },
        {
            icon: 'fa-clipboard-list',
            badge: `${requirements.length} 份`,
            title: '客户线索',
            detail: latestRequirement ? requirementDisplayName(latestRequirement) : '暂未录入线索',
            meta: latestRequirement ? `${requirementStatusLabel(latestRequirement.status)} · ${fmtDate(latestRequirement.updated_at || latestRequirement.created_at)}` : '点击直达线索页',
            tone: latestRequirement ? 'warning' : 'muted',
            href: latestRequirement ? adminPageUrl('quote-requirements', { requirement: latestRequirement.id }) : '',
        },
        {
            icon: 'fa-link',
            badge: publicRequirementLink ? '已生成' : '未生成',
            title: '公开填报页',
            detail: publicRequirementLink ? '客户可直接填写原始线索' : '当前还没有可发给客户的公开页',
            meta: publicRequirementLink ? '点击打开客户填写入口' : '先保存并生成公开链接',
            tone: publicRequirementLink ? 'active' : 'muted',
            href: publicRequirementLink,
            external: true,
        },
        {
            icon: 'fa-file-invoice-dollar',
            badge: `${quotes.length} 份`,
            title: '报价单',
            detail: latestQuote ? productLabelById(latestQuote.product_id) : '当前还没有报价单',
            meta: latestQuote ? `${text(latestQuote.status) === 'published' ? '已发布' : text(latestQuote.status) === 'archived' ? '已归档' : text(latestQuote.status) === 'voided' ? '已作废' : '草稿'} · ${fmtDate(latestQuote.updated_at || latestQuote.created_at)}` : '点击后会进入报价管理',
            tone: latestQuote ? (text(latestQuote.status) === 'published' ? 'success' : 'active') : 'muted',
            href: latestQuote ? adminPageUrl('quote-instances', { instance: latestQuote.id }) : '',
        },
        {
            icon: 'fa-paper-plane',
            badge: `${sends.length} 次`,
            title: '发送台账',
            detail: latestSend ? shareHistoryStatusLabel(latestSend.status) : '暂未对外发送报价',
            meta: latestSend ? `${shareHistoryRecipientLine(latestSend) || '未记录收件人'} · ${fmtDate(latestSend.updated_at || latestSend.last_sent_at || latestSend.sent_at)}` : '点击后直达最近发送相关报价',
            tone: latestSend ? 'active' : 'muted',
            href: latestSend?.instance_id ? adminPageUrl('quote-instances', { instance: latestSend.instance_id }) : '',
        },
        {
            icon: 'fa-binoculars',
            badge: `${events.length} 次`,
            title: '客户查看',
            detail: latestEvent ? eventTypeLabel(latestEvent.event_type) : '客户还没有查看记录',
            meta: latestEvent ? `${accessModeLabel(latestEvent.access_mode)} · ${fmtDate(latestEvent.created_at)}` : '点击后直达最近浏览相关报价',
            tone: latestEvent ? 'success' : 'muted',
            href: latestEvent?.instance_id ? adminPageUrl('quote-instances', { instance: latestEvent.instance_id }) : '',
        },
        {
            icon: 'fa-flag-checkered',
            badge: '当前',
            title: '链路阶段',
            detail: stage.title,
            meta: stage.detail,
            tone: stage.tone,
            href: stage.href,
        },
    ];

    return `
        <section class="ams-card ams-customer-pipeline-shell">
            <div class="ams-section-head">
                <div>
                    <h3>客户跟踪流水线</h3>
                    <p>一条标准链路会依次经过客户建档、线索收集、公开填报、报价生成、发送跟进和客户查看；下面所有节点都支持一键直达。</p>
                </div>
                <div class="ams-row-actions">
                    <button class="ams-btn ams-btn-muted" type="button" id="ams-customer-graph-open">
                        <i class="fa-solid fa-diagram-project"></i>
                        关系图谱
                    </button>
                </div>
            </div>
            <div class="ams-customer-pipeline-track">
                ${nodes.map((node) => customerPipelineNodeMarkup(node)).join('')}
            </div>
        </section>
    `;
}

function customerRelationshipGraphMarkup(customerId = '') {
    if (!customerId) return '';
    const customer = moduleState.customers.find((item) => item.id === customerId) || moduleState.customerEditor || {};
    const requirements = customerRequirements(customerId);
    const quotes = customerQuotes(customerId);
    const sends = customerShareHistory(customerId);
    const events = Array.isArray(moduleState.customerEvents) ? moduleState.customerEvents : [];
    const latestQuote = quotes[0] || null;
    const latestRequirement = requirements[0] || null;
    const brandLine = latestQuote ? brandLabelById(latestQuote.brand_id) : '--';
    const productLine = latestQuote ? productLabelById(latestQuote.product_id) : '--';
    const stage = customerTrackingStageSummary(customerId);

    const nodeMarkup = (title, subtitle, detail, tone = 'muted') => `
        <article class="ams-customer-graph-node is-${esc(tone)}">
            <strong>${esc(title)}</strong>
            <span>${esc(subtitle)}</span>
            <em>${esc(detail)}</em>
        </article>
    `;

    return `
        <div class="ams-customer-graph-modal" id="ams-customer-graph-modal" hidden>
            <div class="ams-customer-graph-backdrop" data-customer-graph-close></div>
            <div class="ams-customer-graph-dialog">
                <div class="ams-customer-graph-head">
                    <div>
                        <strong>客户关系图谱</strong>
                        <span>按当前客户聚合客户主档、线索、公开入口、品牌产品、报价单、发送台账和访问事件。</span>
                    </div>
                    <button class="ams-btn ams-btn-muted" type="button" data-customer-graph-close>关闭</button>
                </div>
                <div class="ams-customer-graph-summary">
                    <span class="ams-summary-chip"><strong>当前客户</strong><span>${esc(customerDisplayName(customer))}</span></span>
                    <span class="ams-summary-chip"><strong>当前阶段</strong><span>${esc(stage.title)}</span></span>
                    <span class="ams-summary-chip"><strong>最近动作</strong><span>${esc(stage.detail)}</span></span>
                </div>
                <div class="ams-customer-graph-board">
                    <div class="ams-customer-graph-row ams-customer-graph-row-top">
                        ${nodeMarkup('quote_customers', '客户主档', customerDisplayName(customer), 'success')}
                        ${nodeMarkup('quote_brands', '品牌', brandLine, latestQuote ? 'active' : 'muted')}
                    </div>
                    <div class="ams-customer-graph-connector-row">
                        <span>↓</span>
                        <span>↓</span>
                    </div>
                    <div class="ams-customer-graph-row ams-customer-graph-row-middle">
                        ${nodeMarkup('quote_requirements', '客户线索', latestRequirement ? `${requirements.length} 份 / ${requirementStatusLabel(latestRequirement.status)}` : '暂无线索', latestRequirement ? 'warning' : 'muted')}
                        ${nodeMarkup('quote_products', '产品', latestQuote ? productLine : '暂无产品关联', latestQuote ? 'active' : 'muted')}
                    </div>
                    <div class="ams-customer-graph-branch-row">
                        ${nodeMarkup('quote/requirement.html', '公开填报页', latestRequirement?.public_slug && latestRequirement?.public_token ? '已生成客户填写入口' : '未生成公开页', latestRequirement?.public_slug && latestRequirement?.public_token ? 'active' : 'muted')}
                        <span class="ams-customer-graph-merge">→</span>
                        ${nodeMarkup('quote_instances', '报价单', quotes.length ? `${quotes.length} 份 / ${latestQuote ? productLine : '已生成'}` : '暂无报价', quotes.length ? 'success' : 'muted')}
                    </div>
                    <div class="ams-customer-graph-connector-row is-wide">
                        <span>↘</span>
                        <span>↓</span>
                        <span>↙</span>
                    </div>
                    <div class="ams-customer-graph-row ams-customer-graph-row-bottom">
                        ${nodeMarkup('quote_instance_sends', '发送台账', sends.length ? `${sends.length} 次 / ${shareHistoryStatusLabel(sends[0]?.status)}` : '暂无发送', sends.length ? 'active' : 'muted')}
                        ${nodeMarkup('quote_instance_events', '访问事件', events.length ? `${events.length} 次 / ${eventTypeLabel(events[0]?.event_type)}` : '暂无访问', events.length ? 'success' : 'muted')}
                    </div>
                </div>
            </div>
        </div>
    `;
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
                    <h3>客户跟踪</h3>
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

function customerActivityTimelinePanelMarkup(customerId = '') {
    const filter = text(moduleState.customerActivityFilter, 'all');
    const rows = customerActivityTimelineRows(customerId)
        .filter((item) => filter === 'all' ? true : text(item.actor_type) === filter);
    return `
        <details class="ams-card ams-stage-log-card ams-fold-card ams-stage-module-fold" data-customer-activity-panel="${esc(customerId)}">
            <summary class="ams-fold-summary">
                <span>用户行为轨迹</span>
                <em>${esc(`${rows.length} 条`)}</em>
            </summary>
            <div class="ams-fold-body">
                <p class="ams-field-help">记录客户、销售和系统在这条客户销售链路上的关键动作。</p>
                <div class="ams-row-actions">
                    ${['all', 'customer', 'sales', 'system'].map((actorType) => `
                        <button class="ams-btn ${filter === actorType ? 'ams-btn-primary' : 'ams-btn-muted'}" type="button" data-customer-activity-filter="${esc(actorType)}">${esc(actorType === 'all' ? '全部' : SALES_ACTIVITY_ACTOR_LABELS[actorType])}</button>
                    `).join('')}
                </div>
                <div class="ams-sales-activity-list">
                    ${rows.length ? rows.map((item) => salesActivityTimelineItemMarkup(item)).join('') : '<div class="ams-empty">当前客户还没有可展示的销售活动。</div>'}
                </div>
            </div>
        </details>
    `;
}

function bindCustomerActivityPanel(panel = null, customerId = '') {
    if (!panel || !customerId) return;
    panel.querySelectorAll('[data-customer-activity-filter]').forEach((button) => {
        if (button.dataset.bound === '1') return;
        button.dataset.bound = '1';
        button.addEventListener('click', () => {
            const nextFilter = text(button.dataset.customerActivityFilter, DEFAULT_CUSTOMER_ACTIVITY_FILTER);
            if (!['all', 'customer', 'sales', 'system'].includes(nextFilter)) return;
            if (moduleState.customerActivityFilter === nextFilter) return;
            const keepOpen = panel.open === true;
            moduleState.customerActivityFilter = nextFilter;
            panel.outerHTML = customerActivityTimelinePanelMarkup(customerId);
            const nextPanel = document.querySelector(`[data-customer-activity-panel="${customerId}"]`);
            if (nextPanel && keepOpen) nextPanel.open = true;
            bindCustomerActivityPanel(nextPanel, customerId);
        });
    });
}

function instanceInsightsMarkup() {
    if (!moduleState.instanceEditor?.id) return '';
    const summary = moduleState.instanceEventSummary || emptyInstanceEventSummary();
    const currentCustomer = moduleState.instanceEditor.customer_id
        ? moduleState.customers.find((item) => item.id === moduleState.instanceEditor.customer_id)
        : null;
    const linkedRequirement = requirementById(moduleState.instanceEditor.requirement_id);
    const customerJumpHref = currentCustomer?.id ? adminPageUrl('quote-customers', { customer: currentCustomer.id }) : '';
    const requirementJumpHref = linkedRequirement?.id ? adminPageUrl('quote-requirements', { requirement: linkedRequirement.id }) : '';
    const sendHistory = instanceShareHistory();
    const shareSummary = shareConfigSummary(moduleState.instanceEditor.share_config, { sendCount: sendHistory.length });
    const sendLedgerNote = sendLedgerModeMarkup();
    const viewPageSize = 10;
    const viewPage = Math.max(1, safeNumber(moduleState.instanceViewPage, 1));
    const visibleEvents = moduleState.instanceEvents.slice(0, viewPage * viewPageSize);
    const hasMoreEvents = moduleState.instanceEvents.length > visibleEvents.length;
    const timeline = visibleEvents.length
        ? visibleEvents
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
                    <h3>客户轨迹记录</h3>
                    <p>这里专门回答三件事：这份报价发给谁，谁负责跟进，以及客户后来有没有打开看过。</p>
                </div>
            </div>
            <div class="ams-summary-group-grid">
                <section class="ams-summary-group-card">
                    <div class="ams-summary-group-head">
                        <strong>归属信息</strong>
                        <span>这份报价当前绑定给谁</span>
                    </div>
                    <div class="ams-summary-group-body">
                        ${
                            customerJumpHref
                                ? `<a class="ams-summary-chip ams-summary-chip-link-card" href="${esc(customerJumpHref)}"><strong>客户档案</strong><span>${esc(customerDisplayName(currentCustomer || buildInstanceCustomerSnapshot(moduleState.instanceEditor)))}</span></a>`
                                : `<span class="ams-summary-chip"><strong>客户档案</strong><span>${esc(customerDisplayName(currentCustomer || buildInstanceCustomerSnapshot(moduleState.instanceEditor)))}</span></span>`
                        }
                        ${
                            requirementJumpHref
                                ? `<a class="ams-summary-chip ams-summary-chip-link-card" href="${esc(requirementJumpHref)}"><strong>关联需求单</strong><span>${esc(requirementDisplayName(linkedRequirement))}</span></a>`
                                : `<span class="ams-summary-chip"><strong>关联需求单</strong><span>${esc(linkedRequirement ? requirementDisplayName(linkedRequirement) : '未绑定')}</span></span>`
                        }
                    </div>
                </section>
                <section class="ams-summary-group-card">
                    <div class="ams-summary-group-head">
                        <strong>发送信息</strong>
                        <span>现在由谁发，发了多少次</span>
                    </div>
                    <div class="ams-summary-group-body">
                        <span class="ams-summary-chip"><strong>当前发给谁</strong><span>${esc(shareSummary.recipient)}</span></span>
                        <span class="ams-summary-chip"><strong>负责销售</strong><span>${esc(shareSummary.owner)}</span></span>
                        <span class="ams-summary-chip"><strong>发送记录</strong><span>${esc(shareSummary.send_count)} 条</span></span>
                        <span class="ams-summary-chip"><strong>最近发送</strong><span>${esc(fmtDate(summary.last_shared_at))}</span></span>
                    </div>
                </section>
                <section class="ams-summary-group-card">
                    <div class="ams-summary-group-head">
                        <strong>查看统计</strong>
                        <span>客户有没有打开，后台看了多少次</span>
                    </div>
                    <div class="ams-summary-group-body">
                        <span class="ams-summary-chip"><strong>总浏览</strong><span>${esc(summary.total_views)}</span></span>
                        <span class="ams-summary-chip"><strong>客户打开</strong><span>${esc(summary.share_views)}</span></span>
                        <span class="ams-summary-chip"><strong>后台预览</strong><span>${esc(summary.admin_views)}</span></span>
                        <span class="ams-summary-chip"><strong>链接发送</strong><span>${esc(summary.share_links)}</span></span>
                        <span class="ams-summary-chip"><strong>邮件发送</strong><span>${esc(summary.email_clicks)}</span></span>
                        <span class="ams-summary-chip"><strong>最近浏览</strong><span>${esc(fmtDate(summary.last_viewed_at))}</span></span>
                    </div>
                </section>
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
    hydrateCustomSelects(content);
    const displayNameField = () => content.querySelector('[data-brand-field="display_name"]');
    const defaultLinkField = () => content.querySelector('[data-brand-field="default_quote_slug"]');
    const shareSecretField = () => content.querySelector('[data-brand-field="share_signing_secret"]');
    const updateBrandColorPreview = (field, value) => {
        const color = text(value);
        const swatch = content.querySelector(`[data-brand-color-preview=\"${field}\"]`);
        const valueNode = content.querySelector(`[data-brand-color-value=\"${field}\"]`);
        if (swatch) swatch.style.background = color || 'transparent';
        if (valueNode) valueNode.textContent = color || '--';
    };
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
        if (defaultLinkField()) defaultLinkField().value = candidate;
    };

    syncDefaultLinkField(false);
    const nextSecret = ensureShareSigningSecret(moduleState.brandEditor);
    if (nextSecret !== moduleState.brandEditor.share_signing_secret) {
        moduleState.brandEditor.share_signing_secret = nextSecret;
        if (shareSecretField()) shareSecretField().value = nextSecret;
    }
    updateBrandColorPreview('theme_primary', moduleState.brandEditor.theme_primary);
    updateBrandColorPreview('theme_dark', moduleState.brandEditor.theme_dark);

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
                persistBrandEditorDraftState();
                return;
            }
            moduleState.brandEditor[field] = nextValue;
            if (field === 'theme_primary' || field === 'theme_dark') {
                updateBrandColorPreview(field, nextValue);
            }
            if (field === 'display_name') {
                moduleState.brandDisplayNameTouched = text(nextValue) !== text(moduleState.brandEditor.brand_name);
            }
            persistBrandEditorDraftState();
        });
        if (node.type === 'checkbox') {
            node.addEventListener('change', () => {
                const field = node.dataset.brandField;
                if (!field) return;
                moduleState.brandEditor[field] = Boolean(node.checked);
                persistBrandEditorDraftState();
            });
        }
    });

    content.querySelector('[data-brand-copy-secret]')?.addEventListener('click', async () => {
        const secretValue = text(shareSecretField()?.value || moduleState.brandEditor.share_signing_secret);
        if (!secretValue) {
            input.showToast('暂无可复制的密钥。', true);
            return;
        }
        try {
            await navigator.clipboard.writeText(secretValue);
            input.showToast('密钥已复制。');
        } catch (error) {
            input.showToast('复制失败，请手动选择。', true);
        }
    });

    content.querySelectorAll('[data-i18n-prefix^="brand:"]').forEach((node) => {
        node.addEventListener('input', () => {
            const [, key] = String(node.dataset.i18nPrefix || '').split(':');
            const lang = node.dataset.lang;
            if (!key || !lang) return;
            upsertLocalizedField(moduleState.brandEditor, key, lang, node.value);
            persistBrandEditorDraftState();
        });
    });

    document.getElementById('ams-quote-brand-new')?.addEventListener('click', () => {
        moduleState.brandEditor = createBrandDraft();
        moduleState.brandDisplayNameTouched = false;
        moduleState.brandDefaultLinkTouched = false;
        moduleState.brandCreateMode = true;
        persistBrandEditorDraftState();
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
            moduleState.brandCreateMode = false;
            persistBrandEditorDraftState();
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
        moduleState.brandCreateMode = false;
        persistBrandEditorDraftState();
        void renderQuoteBrandsPage(input);
    });

    document.getElementById('ams-quote-brand-archive-current')?.addEventListener('click', async (event) => {
        if (!window.confirm('归档后品牌会从默认列表和新建入口中隐藏，但历史产品与报价数据仍会保留。确定继续吗？')) return;
        await input.withButtonBusy(event.currentTarget, '归档中...', async () => {
            try {
                await saveBrandDraft(input.user, {
                    ...moduleState.brandEditor,
                    is_active: false,
                });
                clearBrandEditorDraftState();
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
                clearBrandEditorDraftState();
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
        persistBrandEditorDraftState();
    });

    document.getElementById('ams-quote-brand-save')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '保存中...', async () => {
            try {
                await saveBrandDraft(input.user, moduleState.brandEditor);
                clearBrandEditorDraftState();
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
                clearBrandEditorDraftState();
                await importLegacySeedData(input.user);
                input.showToast('两套示例模板已导入。');
                await renderQuoteBrandsPage(input);
            } catch (error) {
                input.showToast(error.message || '导入示例模板失败。', true);
            }
        });
    });
}

export async function renderQuoteBrandsPage(input) {
    restoreBrandEditorDraftState();
    try {
        await ensureBaseData();
        try {
            await repairLegacyBrandRecords(input.user);
        } catch (error) {
            console.error('repairLegacyBrandRecords failed on quote-brands page', error);
        }
    } catch (error) {
        if (isQuoteSetupMissing(error)) {
            renderQuoteSetupRequired(input, error);
            return;
        }
        throw error;
    }
    const archiveView = moduleState.brandArchiveView === true;
    const visibleBrandCount = filteredBrands().length;
    const brandEditorView = displayBrandDraft(moduleState.brandEditor);
    const displayedDefaultQuoteSlug = displayBrandSlugValue(moduleState.brandEditor.default_quote_slug || latestPublishedQuoteSlugForBrand(moduleState.brandEditor.id), moduleState.brandEditor);
    const showBrandEditor = moduleState.brandCreateMode === true || Boolean(moduleState.brandEditor?.id);
    const salesConsole = isSalesConsole(input);
    const brandFieldPlaceholders = {
        slug: '用于品牌路由和默认链接前缀，只用小写字母、数字和短横线，例如 gasgx-brand',
        brand_name: '列表里的短名称，建议 2-8 个字，例如 GasGx',
        display_name: '完整品牌显示名，会出现在品牌列表和对外页面，例如 GasGx Energy',
        supplier_name: '供应商 / 公司全称，会显示在报价页基础信息中，例如 GasGx Energy Equipment Co., Ltd.',
        sender_email: '客户收到邮件时显示的发件邮箱，例如 sales@gasgx.com',
        subject_name: '邮件主题署名或品牌落款，例如 GasGx Sales Team',
        share_unlock_prefix: '客户打开分享链接后的本地识别前缀，例如 quote-share-unlocked',
        default_quote_slug: '默认品牌入口 slug，可手填，也可自动带入最近已发布报价，例如 gasgx-demo-001',
        overview_title: {
            zh: '品牌页头主标题，例如：燃气发电产品报价方案',
            en: 'English page header, optional. Falls back to Chinese when empty.',
            ru: 'Russian page header, optional. Falls back to Chinese when empty.',
        },
        footer_note: {
            zh: '页脚说明或品牌落款，例如：GasGx 报价支持 | sales@gasgx.com',
            en: 'English footer note, optional. Falls back to Chinese when empty.',
            ru: 'Russian footer note, optional. Falls back to Chinese when empty.',
        },
    };
    input.setPageHeader(salesConsole ? '品牌列表' : '报价系统 / 品牌管理', salesConsole ? '只维护品牌基础资料，不直接连接任何销售流水线。' : '维护报价品牌、供应商信息、统一页头页脚和默认对外入口。');
    input.setContent(`
        <section class="ams-card ams-hero-card ams-hero-card-compact">
            <div class="ams-hero-copy">
                <p class="ams-eyebrow">${salesConsole ? 'Brand Library' : 'Quote System'}</p>
                <h2>${salesConsole ? '品牌页只做基础资料维护。' : '先维护品牌，再维护产品模板和客户报价单。'}</h2>
                <p class="ams-hero-text">${salesConsole ? '这里不处理销售线跳转，只维护品牌名、供应商、发件邮箱、主题色和公共文案。' : '这里定义品牌名、供应商、发件邮箱、主题色、公共标题和默认品牌入口。首批可一键导入两套基础产品示例数据。'}</p>
            </div>
            <div class="ams-quick-actions">
                <button class="ams-quick-link" type="button" id="ams-quote-import-legacy">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-file-import"></i></div>
                    <div class="ams-quick-link-body"><strong>导入示例模板</strong><span>${salesConsole ? '把现有两套基础产品数据导入成品牌和产品模板。' : '把现有两套基础产品数据导入成品牌、产品和演示报价单。'}</span></div>
                </button>
                <button class="ams-quick-link" type="button" id="ams-quote-brand-new">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-plus"></i></div>
                    <div class="ams-quick-link-body"><strong>新建品牌</strong><span>创建新的报价品牌，为后续产品模板和报价单做承载。</span></div>
                </button>
            </div>
        </section>
        <section class="ams-quote-layout">
            <aside class="ams-card ams-quote-list-panel">
                <div class="ams-section-head">
                    <div><h3>${archiveView ? '已归档品牌' : '品牌列表'}</h3><p>共 ${visibleBrandCount} 个${archiveView ? '归档品牌' : '有效品牌'}</p></div>
                    <div class="ams-row-actions">
                        <button class="ams-btn ${archiveView ? 'ams-btn-primary' : 'ams-btn-muted'}" type="button" id="ams-quote-brand-archive-entry">${archiveView ? '返回主列表' : `归档列表（${archivedBrandCount()}）`}</button>
                    </div>
                </div>
                <div class="ams-field-help" style="margin: 0 0 12px;">${archiveView ? '这里只显示已归档品牌，可恢复继续使用。' : '默认只显示有效品牌，已归档品牌收纳在单独列表。'}</div>
                <div class="ams-quote-list">${renderBrandList()}</div>
            </aside>
            ${
                showBrandEditor
                    ? `
            <section class="ams-card ams-quote-editor-panel ams-brand-editor-panel">
                <div class="ams-section-head">
                    <div>
                        <h3>${moduleState.brandEditor.id ? '编辑品牌' : '新建品牌'}</h3>
                        <p>品牌是产品模板和报价单的最上层容器。</p>
                    </div>
                    <div class="ams-row-actions">
                        ${
                            moduleState.brandEditor.id
                                ? moduleState.brandEditor.is_active === false
                                    ? '<button class="ams-btn ams-btn-muted" type="button" id="ams-quote-brand-restore-current">恢复品牌</button>'
                                    : '<button class="ams-btn ams-btn-muted" type="button" id="ams-quote-brand-archive-current">归档品牌</button>'
                                : ''
                        }
                        <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-brand-save">保存品牌</button>
                    </div>
                </div>
                ${
                    moduleState.brandEditor.id
                        ? `<div class="ams-field-help" style="margin: 6px 0 12px;">${moduleState.brandEditor.is_active === false ? '\u5df2\u5f52\u6863\u54c1\u724c\u9ed8\u8ba4\u4e0d\u518d\u51fa\u73b0\u5728\u4e3b\u5217\u8868\u3001\u6a21\u677f\u9009\u62e9\u548c\u62a5\u4ef7\u5165\u53e3\u3002' : '\u5f52\u6863\u540e\u54c1\u724c\u4f1a\u4ece\u9ed8\u8ba4\u5217\u8868\u548c\u65b0\u5efa\u5165\u53e3\u4e2d\u9690\u85cf\uff0c\u4f46\u5386\u53f2\u6570\u636e\u4ecd\u4fdd\u7559\u3002'}</div>`
                        : ''
                }
                <div class="ams-site-field-grid ams-site-field-grid-wide">
                    <div class="ams-field"><label>品牌 slug</label><input class="ams-input" data-brand-field="slug" value="${esc(brandEditorView.slug)}" placeholder="${esc(brandFieldPlaceholders.slug)}"></div>
                    <div class="ams-field"><label>品牌简称</label><input class="ams-input" data-brand-field="brand_name" value="${esc(brandEditorView.brand_name)}" placeholder="${esc(brandFieldPlaceholders.brand_name)}"></div>
                    <div class="ams-field"><label>品牌显示名</label><input class="ams-input" data-brand-field="display_name" value="${esc(brandEditorView.display_name)}" placeholder="${esc(brandFieldPlaceholders.display_name)}"></div>
                    <div class="ams-field"><label>供应商</label><input class="ams-input" data-brand-field="supplier_name" value="${esc(brandEditorView.supplier_name)}" placeholder="${esc(brandFieldPlaceholders.supplier_name)}"></div>
                    <div class="ams-field"><label>发件邮箱</label><input class="ams-input" data-brand-field="sender_email" value="${esc(moduleState.brandEditor.sender_email)}" placeholder="${esc(brandFieldPlaceholders.sender_email)}"></div>
                    <div class="ams-field"><label>邮件主题署名</label><input class="ams-input" data-brand-field="subject_name" value="${esc(brandEditorView.subject_name)}" placeholder="${esc(brandFieldPlaceholders.subject_name)}"></div>
                    <div class="ams-field"><label>\u4e3b\u9898\u7eff</label><div class="ams-inline-actions ams-inline-actions-compact"><input class="ams-input" type="color" data-brand-field="theme_primary" value="${esc(moduleState.brandEditor.theme_primary)}"><span data-brand-color-preview="theme_primary" aria-hidden="true" style="width:28px;height:28px;border-radius:8px;border:1px solid rgba(255,255,255,.14);background:${esc(moduleState.brandEditor.theme_primary)};box-shadow:inset 0 0 0 1px rgba(0,0,0,.12);"></span><span class="ams-field-help" data-brand-color-value="theme_primary">${esc(moduleState.brandEditor.theme_primary)}</span></div></div>
                    <div class="ams-field"><label>\u6df1\u7eff\u5e95</label><div class="ams-inline-actions ams-inline-actions-compact"><input class="ams-input" type="color" data-brand-field="theme_dark" value="${esc(moduleState.brandEditor.theme_dark)}"><span data-brand-color-preview="theme_dark" aria-hidden="true" style="width:28px;height:28px;border-radius:8px;border:1px solid rgba(255,255,255,.14);background:${esc(moduleState.brandEditor.theme_dark)};box-shadow:inset 0 0 0 1px rgba(0,0,0,.12);"></span><span class="ams-field-help" data-brand-color-value="theme_dark">${esc(moduleState.brandEditor.theme_dark)}</span></div></div>
                    <div class="ams-field">
                        <label>分享签名密钥</label>
                        <input class="ams-input" data-brand-field="share_signing_secret" value="${esc(moduleState.brandEditor.share_signing_secret)}" readonly spellcheck="false" autocomplete="off">
                        <div class="ams-inline-actions ams-inline-actions-compact">
                            <button class="ams-btn ams-btn-muted" type="button" data-brand-copy-secret>复制密钥</button>
                        </div>
                        <div class="ams-field-help">自动生成，仅支持查看与复制。</div>
                    </div>
                    <div class="ams-field"><label>分享本地前缀</label><input class="ams-input" data-brand-field="share_unlock_prefix" value="${esc(moduleState.brandEditor.share_unlock_prefix)}" placeholder="${esc(brandFieldPlaceholders.share_unlock_prefix)}"></div>
                    <div class="ams-field"><label class="ams-social-toggle"><input type="checkbox" data-brand-field="is_active" ${moduleState.brandEditor.is_active ? 'checked' : ''}><span>启用品牌</span></label></div>
                </div>
                ${brandDefaultLinkPanelMarkup(moduleState.brandEditor)}
${brandLocalizedFieldGroup('brand:overview_title', '页面总标题', moduleState.brandEditor.overview_title, { placeholders: brandFieldPlaceholders.overview_title })}
${brandLocalizedFieldGroup('brand:footer_note', '页脚说明', moduleState.brandEditor.footer_note, { placeholders: brandFieldPlaceholders.footer_note })}
            </section>
                    `
                    : `
            <section class="ams-card ams-quote-editor-panel ams-brand-editor-panel">
                <div class="ams-empty">默认不展开品牌编辑区。点击左侧品牌进入编辑，或点击上方“新建品牌”开始录入。</div>
            </section>
                    `
            }
        </section>
    `);
    bindBrandEditor(input);
}

function bindProductEditor(input) {
    const content = document.getElementById('ams-content');
    if (!content) return;
    hydrateCustomSelects(content);

    document.getElementById('ams-quote-product-brand-filter')?.addEventListener('change', (event) => {
        moduleState.productBrandFilter = event.currentTarget.value || 'all';
        void withQuoteBusy('正在刷新产品列表...', async () => {
            await renderQuoteProductsPage(input);
        });
    });

    document.getElementById('ams-quote-product-archive-entry')?.addEventListener('click', () => {
        moduleState.productArchiveView = !moduleState.productArchiveView;
        void withQuoteBusy(moduleState.productArchiveView ? '正在切换到已删除产品...' : '正在返回产品主列表...', async () => {
            await renderQuoteProductsPage(input);
        });
    });

    document.getElementById('ams-quote-product-new')?.addEventListener('click', () => {
        moduleState.productLoadedId = '';
        moduleState.productEditor = createProductDraft({
            brand_id: moduleState.productBrandFilter !== 'all' ? moduleState.productBrandFilter : '',
        });
        moduleState.productCreateMode = true;
        syncProductBrandDraft(moduleState.productEditor.brand_id);
        void renderQuoteProductsPage(input);
    });

    document.getElementById('ams-quote-product-load-base-template')?.addEventListener('click', () => {
        try {
            const templateKey = document.getElementById('ams-quote-product-base-template')?.value || '';
            if (!templateKey) throw new Error('请先选择一个基础模板。');
            applyBaseTemplateToProductEditor(templateKey);
            input.showToast('基础模板已载入当前产品编辑区。');
            void renderQuoteProductsPage(input);
        } catch (error) {
            input.showToast(error.message || '载入基础模板失败。', true);
        }
    });

    document.getElementById('ams-open-product-visual-editor')?.addEventListener('click', () => {
        if (!moduleState.productEditor?.id) {
            input.showToast('Save the product before opening visual editor.', true);
            return;
        }
        window.open(quoteEditorUrl('product', moduleState.productEditor.id), '_blank', 'noopener');
    });

    document.querySelectorAll('[data-product-edit]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await withQuoteBusy('正在加载产品...', async () => {
                    await fetchProductEditor(button.dataset.productEdit);
                    await renderQuoteProductsPage(input);
                }, button, '正在读取产品详情、配置项和图片库。');
            } catch (error) {
                input.showToast(error.message || '加载产品失败。', true);
            }
        });
    });

    document.querySelectorAll('[data-product-archive]').forEach((button) => {
        button.addEventListener('click', async () => {
            if (!window.confirm('删除后会从默认产品列表中隐藏，但不会删除已生成的报价单。确定继续吗？')) return;
            try {
                await withQuoteBusy('正在删除产品...', async () => {
                    await archiveProductTemplate(input.user, button.dataset.productArchive);
                    await renderQuoteProductsPage(input);
                }, button, '删除会隐藏产品入口，但不会影响已经生成的报价单快照。');
                input.showToast('产品已删除。');
            } catch (error) {
                input.showToast(error.message || '删除产品失败。', true);
            }
        });
    });

    document.querySelectorAll('[data-product-restore]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await withQuoteBusy('正在恢复产品...', async () => {
                    await restoreProductTemplate(input.user, button.dataset.productRestore);
                    await renderQuoteProductsPage(input);
                }, button, '恢复后产品会重新出现在主列表和报价单新建入口中。');
                input.showToast('产品已恢复。');
            } catch (error) {
                input.showToast(error.message || '恢复产品失败。', true);
            }
        });
    });

    document.getElementById('ams-quote-product-restore-current')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '恢复中...', async () => {
            try {
                await restoreProductTemplate(input.user, moduleState.productEditor.id);
                input.showToast('产品已恢复。');
                await renderQuoteProductsPage(input);
            } catch (error) {
                input.showToast(error.message || '恢复产品失败。', true);
            }
        });
    });

    document.getElementById('ams-quote-product-archive-current')?.addEventListener('click', async (event) => {
        if (!window.confirm('删除后会从默认产品列表中隐藏，但不会删除已生成的报价单。确定继续吗？')) return;
        await input.withButtonBusy(event.currentTarget, '删除中...', async () => {
            try {
                await archiveProductTemplate(input.user, moduleState.productEditor.id);
                input.showToast('产品已删除。');
                await renderQuoteProductsPage(input);
            } catch (error) {
                input.showToast(error.message || '删除产品失败。', true);
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
                input.showToast(`正在上传 ${files.length} 张产品图片...`, false, { prominent: true, busy: true, persist: true });
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
                input.showToast('产品已保存。');
                await renderQuoteProductsPage(input);
            } catch (error) {
                input.showToast(error.message || '保存产品失败。', true);
            }
        });
    });

    document.getElementById('ams-quote-product-create-instance')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '生成中...', async () => {
            try {
                const instance = await createInstanceFromProduct(input.user, moduleState.productEditor.id);
                input.showToast('已从产品生成新的报价单草稿。');
                await fetchInstanceEditor(instance.id);
                await renderQuoteInstancesPage(input);
            } catch (error) {
                input.showToast(error.message || '从产品生成报价单失败。', true);
            }
        });
    });
}

export async function renderQuoteProductsPage(input) {
    try {
        await ensureBaseData();
        try {
            await repairLegacyBrandRecords(input.user);
        } catch (error) {
            console.error('repairLegacyBrandRecords failed on quote-products page', error);
        }
        try {
            await repairLegacyProductRecords(input.user);
        } catch (error) {
            console.error('repairLegacyProductRecords failed on quote-products page', error);
        }
        await ensureBaseTemplates();
    } catch (error) {
        if (isQuoteSetupMissing(error)) {
            renderQuoteSetupRequired(input, error);
            return;
        }
        throw error;
    }
    const archiveView = moduleState.productArchiveView === true;
    const visibleProducts = filteredProducts();
    const currentVisibleProduct = visibleProducts.find((item) => text(item.id) === text(moduleState.productLoadedId));
    if (!moduleState.productCreateMode && visibleProducts.length && !currentVisibleProduct) {
        await fetchProductEditor(visibleProducts[0].id);
    }
    const product = moduleState.productEditor || createProductDraft();
    const showProductEditor = Boolean(moduleState.productLoadedId || moduleState.productCreateMode || visibleProducts.length);
    if (showProductEditor && !product.brand_id && moduleState.brands[0]?.id) {
        product.brand_id = moduleState.brands[0].id;
    }
    moduleState.productEditor = product;
    if (showProductEditor) {
        currentProductBrandDraft();
    }
    const visibleProductCount = filteredProducts().length;
    const salesConsole = isSalesConsole(input);
    input.setPageHeader(salesConsole ? '产品列表' : '报价系统 / 产品模板', salesConsole ? '只维护基础产品定义，不在这里直接创建销售报价。' : '在品牌下维护标准产品，定义主配置、选配、默认汇率和有效期。');
    input.setContent(`
        <section class="ams-card ams-hero-card ams-hero-card-compact ams-quote-product-hero">
            <div class="ams-hero-copy">
                <p class="ams-eyebrow">${salesConsole ? 'Product Library' : 'Product Templates'}</p>
                <h2>${salesConsole ? '产品页只做基础模板维护。' : '当前基础模板分为“独立发电产品模板”和“一体化产品模板”。'}</h2>
                <p class="ams-hero-text">${salesConsole ? '先从基础模板克隆，再在当前品牌下维护产品定义。这里不直接创建销售报价。' : '先从对应的基础模板载入一份版本，再复制到具体品牌 / 产品上维护。现在这一步先解决模板来源，不再让你从空白模板开始。'}</p>
            </div>
            <div class="ams-quick-actions ams-quote-product-quick-actions">
                <button class="ams-quick-link" type="button" id="ams-quote-product-new">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-cube"></i></div>
                    <div class="ams-quick-link-body"><strong>新建产品</strong><span>仅在你明确要从零搭建时使用；正常请优先载入右侧基础模板后再继续。</span></div>
                </button>
                <div class="ams-quick-link ams-quote-template-loader">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-layer-group"></i></div>
                    <div class="ams-quick-link-body">
                        <strong>公共产品模板</strong>
                        <span>新品牌先从“独立发电产品模板”或“一体化产品模板”复制一份，再在当前品牌下 DIY。</span>
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
                            <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-product-load-base-template">克隆产品信息</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="ams-quote-layout">
            <aside class="ams-card ams-quote-list-panel ams-quote-product-list-panel">
                <div class="ams-section-head">
                    <div><h3>${archiveView ? '已删除产品' : '产品列表'}</h3><p>共 ${visibleProductCount} 个${archiveView ? '已删除产品' : '有效产品'}</p></div>
                    <div class="ams-row-actions">
                        <button class="ams-btn ${archiveView ? 'ams-btn-primary' : 'ams-btn-muted'}" type="button" id="ams-quote-product-archive-entry">${archiveView ? '返回主列表' : `已删除列表（${archivedProductCount()}）`}</button>
                    </div>
                </div>
                <div class="ams-field-help" style="margin: 0 0 12px;">${archiveView ? '这里只显示已删除产品，可恢复继续使用。' : '默认只显示有效产品，已删除产品收纳在单独列表。'}</div>
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
                ${
                    showProductEditor
                        ? `
                    <div class="ams-section-head">
                        <div>
                            <h3>${product.id ? '编辑产品' : '新建产品'}</h3>
                            <p>${salesConsole ? '这里维护的是当前品牌下的基础产品定义。' : '这里维护的是当前品牌下的实际产品定义，可直接用于后续生成报价单。'}</p>
                        </div>
                        <div class="ams-row-actions">
                            ${
                                product.id
                                    ? product.is_active === false
                                        ? '<button class="ams-btn ams-btn-primary" type="button" id="ams-quote-product-restore-current">恢复产品</button>'
                                        : '<button class="ams-btn ams-btn-danger" type="button" id="ams-quote-product-archive-current">删除产品</button>'
                                    : ''
                            }
                            <button class="ams-btn ams-btn-primary" type="button" id="ams-open-product-visual-editor" ${product.id ? '' : 'disabled'}>可视化产品编辑</button>
                            ${salesConsole ? '' : '<button class="ams-btn ams-btn-primary" type="button" id="ams-quote-product-create-instance">从产品生成报价单</button>'}
                            <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-product-save">保存产品</button>
                        </div>
                    </div>
                    ${
                        product.id
                            ? `
                        ${
                            product.is_active === false
                                ? '<div class="ams-field-help" style="margin-bottom: 12px;">已删除产品默认不再出现在主列表和新建报价入口。</div>'
                                : '<div class="ams-field-help" style="margin-bottom: 12px;">删除只会隐藏产品入口，不会删除已生成报价单。</div>'
                        }
                    `
                            : ''
                    }
                    <div class="ams-site-field-grid ams-site-field-grid-wide">
                        <div class="ams-field">
                            <label>所属品牌</label>
                            <select class="ams-select" data-product-field="brand_id">
                                <option value="">请选择品牌</option>
                                ${moduleState.brands.map((brand) => `<option value="${esc(brand.id)}" ${product.brand_id === brand.id ? 'selected' : ''}>${esc(brand.display_name)}</option>`).join('')}
                            </select>
                        </div>
                        <div class="ams-field"><label>链接标识</label><input class="ams-input" data-product-field="slug" value="${esc(product.slug)}" placeholder="仅用于链接与系统识别，例如 magie-aio-500l"></div>
                        <div class="ams-field"><label>产品型号</label><input class="ams-input" data-product-field="product_code" value="${esc(product.product_code)}" placeholder="产品型号/代号，例如 AIO-500L、P1200GF"></div>
                        <div class="ams-field"><label>有效期（小时）</label><input class="ams-input" type="number" min="1" step="1" data-product-field="validity_hours" value="${esc(product.validity_hours)}" placeholder="报价有效期（小时），例如 72"></div>
                        <div class="ams-field"><label>排序</label><input class="ams-input" type="number" min="0" step="10" data-product-field="sort_order" value="${esc(product.sort_order)}" placeholder="列表排序，数值越小越靠前"></div>
                        <div class="ams-field">
                            <label>产品标题</label>
                            <input class="ams-input" data-i18n-prefix="product:public_title" data-lang="zh" value="${esc(product.public_title?.zh || '')}" placeholder="客户页面看到的产品名称，例如：Magie AIO-500L 液冷版 500kW">
                            <div class="ams-field-help">客户页面直接显示这里，默认只维护中文基线。</div>
                        </div>
                    </div>
                    ${productVisualEditorSurfaceMarkup(product, currentProductBrandDraft())}
                    ${mediaLibraryMarkup('product', product.media_config, product.media_gallery, {
                        uploadLabel: '上传产品图片',
                    })}
                `
                        : '<div class="ams-empty">默认只显示产品列表。点击左侧产品，或使用上方“新建产品”/“克隆产品信息”后再进入编辑区。</div>'
                }
            </section>
        </section>
    `);
    bindProductEditor(input);
}

function bindInstanceEditor(input) {
    const content = document.getElementById('ams-content');
    if (!content) return;
    hydrateCustomSelects(content);

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
                const instance = await createInstanceFromProduct(input.user, productId, {
                    dealId: activeDealIdFromState(text(moduleState.instanceEditor?.deal_id)),
                });
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
                    moduleState.instanceViewPage = 1;
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

    document.querySelectorAll('[data-instance-view-more]').forEach((button) => {
        button.addEventListener('click', () => {
            moduleState.instanceViewPage = Math.max(1, safeNumber(moduleState.instanceViewPage, 1) + 1);
            void renderQuoteInstancesPage(input);
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
        const linkedRequirement = requirementById(moduleState.instanceEditor.requirement_id);
        if (linkedRequirement?.deal_id && !text(moduleState.instanceEditor.deal_id)) {
            moduleState.instanceEditor.deal_id = linkedRequirement.deal_id;
        }
        void renderQuoteInstancesPage(input);
    });

    document.getElementById('ams-quote-instance-deal-select')?.addEventListener('change', (event) => {
        moduleState.instanceEditor.deal_id = event.currentTarget.value || '';
        const deal = dealById(moduleState.instanceEditor.deal_id);
        if (deal?.customer_id && !text(moduleState.instanceEditor.customer_id)) {
            moduleState.instanceEditor.customer_id = deal.customer_id;
        }
        if (deal?.primary_requirement_id && !text(moduleState.instanceEditor.requirement_id)) {
            moduleState.instanceEditor.requirement_id = deal.primary_requirement_id;
        }
        void renderQuoteInstancesPage(input);
    });

    content.querySelectorAll('[data-instance-open-requirement]').forEach((button) => {
        button.addEventListener('click', () => {
            const instanceId = button.dataset.instanceOpenRequirement;
            const instance = moduleState.instances.find((item) => item.id === instanceId) || moduleState.instanceEditor;
            if (!instance?.requirement_id) {
                input.showToast('当前报价单还没有绑定需求单。', true);
                return;
            }
            window.location.assign(adminPageUrl('quote-requirements', {
                requirement: instance.requirement_id,
                deal: instance.deal_id,
            }));
        });
    });

    content.querySelectorAll('[data-instance-field]').forEach((node) => {
        const fieldName = node.dataset.instanceField || '';
        const apply = () => {
            const field = fieldName;
            if (!field) return;
            moduleState.instanceEditor[field] = node.type === 'checkbox' ? Boolean(node.checked) : node.value;
            moduleState.instanceEditor.customer_snapshot = buildInstanceCustomerSnapshot(moduleState.instanceEditor);
            if (['customer_name', 'receiver_name', 'receiver_email', 'customer_notes'].includes(field)) {
                moduleState.instanceEditor.share_config = syncInstanceShareConfig(moduleState.instanceEditor);
                syncInstanceSalesOwner(moduleState.instanceEditor, input.user);
            }
            if (field === 'deal_id') {
                const deal = dealById(moduleState.instanceEditor.deal_id);
                if (deal?.customer_id && !text(moduleState.instanceEditor.customer_id)) {
                    moduleState.instanceEditor.customer_id = deal.customer_id;
                }
            }
        };
        node.addEventListener('input', apply);
        if (node.type === 'checkbox' || node.tagName === 'SELECT') {
            node.addEventListener('change', () => {
                apply();
                if (fieldName === 'deal_id') void renderQuoteInstancesPage(input);
            });
        }
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
                input.showToast(`正在上传 ${files.length} 张产品图片...`, false, { prominent: true, busy: true, persist: true });
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
                const publishedInstance = await publishInstance(input.user, moduleState.instanceEditor);
                input.showToast('报价单已发布。');
                const linkedDeal = dealById(text(publishedInstance?.deal_id || moduleState.dealEditor?.id || currentDeal?.id));
                if (linkedDeal?.id && linkedDeal.customer_id) {
                    const nextDeal = dealById(linkedDeal.id) || linkedDeal;
                    window.history.replaceState({}, '', customerFlowStageUrl('quote_confirmed', nextDeal, linkedDeal.customer_id));
                    await renderQuoteCustomerFlowPage(input);
                    return;
                }
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

    document.getElementById('ams-quote-instance-confirm')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '确认中...', async () => {
            try {
                const saved = await confirmQuoteForDeal(input.user, moduleState.instanceEditor);
                input.showToast('报价已确认，已推进到合同阶段。');
                await fetchInstanceEditor(saved.id);
                await renderQuoteInstancesPage(input);
            } catch (error) {
                input.showToast(error.message || '确认报价失败。', true);
            }
        });
    });

    const posterModal = document.getElementById('ams-quote-share-poster-modal');
    const posterImage = document.getElementById('ams-quote-share-poster-image');
    const posterDownload = document.getElementById('ams-quote-share-poster-download');
    const shareMenu = content.querySelector('.ams-share-menu');
    const closePosterModal = () => {
        if (posterModal) posterModal.hidden = true;
    };

    document.getElementById('ams-quote-instance-share-link')?.addEventListener('click', async () => {
        if (!moduleState.instanceEditor.public_slug) {
            input.showToast('请先填写公开链接 slug。', true);
            return;
        }
        const payload = quoteShareCopyText(moduleState.instanceEditor);
        try {
            await navigator.clipboard.writeText(payload);
            input.showToast('分享文案已复制。');
        } catch (_error) {
            input.showToast(payload, false);
        }
        if (shareMenu) shareMenu.removeAttribute('open');
    });

    document.getElementById('ams-quote-instance-share-poster')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '生成中...', async () => {
            if (!moduleState.instanceEditor.public_slug) {
                input.showToast('请先填写公开链接 slug。', true);
                return;
            }
            try {
                const posterUrl = await quoteSharePosterDataUrl(moduleState.instanceEditor);
                if (posterImage) posterImage.setAttribute('src', posterUrl);
                if (posterDownload) posterDownload.setAttribute('href', posterUrl);
                if (posterModal) posterModal.hidden = false;
                if (shareMenu) shareMenu.removeAttribute('open');
            } catch (error) {
                input.showToast(error.message || '二维码海报生成失败。', true);
            }
        });
    });

    document.getElementById('ams-quote-share-poster-copy-link')?.addEventListener('click', async () => {
        if (!moduleState.instanceEditor.public_slug) {
            input.showToast('请先填写公开链接 slug。', true);
            return;
        }
        const payload = quoteShareCopyText(moduleState.instanceEditor);
        try {
            await navigator.clipboard.writeText(payload);
            input.showToast('海报说明文案已复制。');
        } catch (_error) {
            input.showToast(payload, false);
        }
    });

    content.querySelectorAll('[data-share-poster-close]').forEach((button) => {
        button.addEventListener('click', closePosterModal);
    });
}

function bindCustomerEditor(input) {
    const content = document.getElementById('ams-content');
    if (!content) return;
    hydrateCustomSelects(content);

    const graphModal = document.getElementById('ams-customer-graph-modal');
    const closeGraphModal = () => {
        if (graphModal) graphModal.hidden = true;
    };

    document.getElementById('ams-customer-graph-open')?.addEventListener('click', () => {
        if (graphModal) graphModal.hidden = false;
    });

    content.querySelectorAll('[data-customer-graph-close]').forEach((button) => {
        button.addEventListener('click', closeGraphModal);
    });

    const switchCustomerListMode = (mode) => {
        moduleState.customerListMode = mode;
        if (mode === 'archived') {
            moduleState.customerLoadedId = '';
            moduleState.customerEditor = createCustomerDraft();
            moduleState.customerCreateMode = false;
        } else if (mode === 'deleted') {
            moduleState.customerLoadedId = '';
            moduleState.customerEditor = createCustomerDraft();
            moduleState.customerCreateMode = false;
        } else if (moduleState.customerEditor?.is_active === false || moduleState.customerEditor?.is_deleted) {
            const active = moduleState.customers.find((item) => item.is_active !== false && !item.is_deleted);
            moduleState.customerLoadedId = text(active?.id);
            moduleState.customerEditor = active ? createCustomerDraft(active) : createCustomerDraft();
            moduleState.customerCreateMode = !active;
        }
        void renderQuoteCustomersPage(input);
    };

    document.getElementById('ams-quote-customer-archive-entry')?.addEventListener('click', () => {
        switchCustomerListMode(moduleState.customerListMode === 'archived' ? 'active' : 'archived');
    });

    document.getElementById('ams-quote-customer-delete-entry')?.addEventListener('click', () => {
        switchCustomerListMode(moduleState.customerListMode === 'deleted' ? 'active' : 'deleted');
    });

    document.getElementById('ams-quote-customer-search')?.addEventListener('input', (event) => {
        moduleState.customerSearch = event.currentTarget.value || '';
        void renderQuoteCustomersPage(input);
    });

    document.getElementById('ams-quote-customer-new')?.addEventListener('click', () => {
        moduleState.customerListMode = 'active';
        moduleState.customerLoadedId = '';
        moduleState.customerEditor = createCustomerDraft();
        moduleState.customerEvents = [];
        moduleState.customerSends = [];
        moduleState.customerCreateMode = true;
        void renderQuoteCustomersPage(input);
    });

    document.querySelectorAll('[data-customer-expand-wrap]').forEach((disclosure) => {
        disclosure.addEventListener('toggle', () => {
            const customerId = text(disclosure.dataset.customerExpandWrap);
            const expanded = disclosure.open === true;
            moduleState.customerArchiveExpandedMap[customerId] = expanded;
            const summary = disclosure.querySelector('.ams-sales-customer-card-head');
            if (summary) summary.setAttribute('aria-label', expanded ? '收起客户信息' : '展开客户信息');
            const icon = disclosure.querySelector('.ams-sales-customer-expand i');
            if (icon) {
                icon.classList.toggle('fa-chevron-up', expanded);
                icon.classList.toggle('fa-chevron-down', !expanded);
            }
        });
    });

    document.querySelectorAll('[data-customer-edit]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await withQuoteBusy('正在加载客户档案...', async () => {
                    replaceAdminPageParams({ customer: button.dataset.customerEdit });
                    await renderQuoteCustomersPage(input);
                }, button, '正在聚合这名客户关联的报价单和最近访问事件。');
            } catch (error) {
                input.showToast(error.message || '加载客户档案失败。', true);
            }
        });
    });

    document.querySelectorAll('[data-customer-archive]').forEach((button) => {
        button.addEventListener('click', async () => {
            const confirmed = await confirmSalesAction({
                title: '确认归档这个客户？',
                message: '归档后客户会从默认客户列表隐藏，但历史需求、报价和流程记录仍会保留。',
                confirmLabel: '确认归档',
            });
            if (!confirmed) return;
            try {
                await withQuoteBusy('正在归档客户...', async () => {
                    const saved = await saveCustomerDraft(input.user, {
                        ...(moduleState.customers.find((item) => item.id === button.dataset.customerArchive) || {}),
                        is_active: false,
                        is_deleted: false,
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

    document.querySelectorAll('[data-customer-delete]').forEach((button) => {
        button.addEventListener('click', async () => {
            const confirmed = await confirmSalesAction({
                title: '确认作废这个客户？',
                message: '作废后客户会进入作废列表，默认不再出现在主列表和归档列表中。',
                confirmLabel: '确认作废',
            });
            if (!confirmed) return;
            try {
                await withQuoteBusy('正在作废客户...', async () => {
                    const saved = await saveCustomerDraft(input.user, {
                        ...(moduleState.customers.find((item) => item.id === button.dataset.customerDelete) || {}),
                        is_active: false,
                        is_deleted: true,
                    });
                    moduleState.customerListMode = 'deleted';
                    moduleState.customerLoadedId = '';
                    moduleState.customerEditor = createCustomerDraft();
                    moduleState.customerCreateMode = false;
                    await Promise.all([
                        fetchCustomerAnalytics(saved.id),
                        fetchCustomerSendLedger(saved.id),
                    ]);
                    await renderQuoteCustomersPage(input);
                }, button, '作废仅隐藏客户入口，不会清除历史需求与报价数据。');
                input.showToast('客户已作废。');
            } catch (error) {
                input.showToast(error.message || '作废客户失败。', true);
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
                        is_deleted: false,
                    });
                    await Promise.all([
                        fetchCustomerAnalytics(saved.id),
                        fetchCustomerSendLedger(saved.id),
                    ]);
                    moduleState.customerListMode = 'active';
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
                moduleState.customerEditor = createCustomerDraft(saved);
                moduleState.customerLoadedId = saved.id;
                await Promise.all([
                    fetchCustomerAnalytics(saved.id),
                    fetchCustomerSendLedger(saved.id),
                ]);
                if (isSalesConsole(input)) {
                    const flow = await ensureCustomerRequirementFlow(input.user, saved);
                    if (flow?.deal?.id) moduleState.dealLoadedId = flow.deal.id;
                    if (flow?.requirement?.id) moduleState.requirementLoadedId = flow.requirement.id;
                    input.showToast('客户档案已保存，已自动生成客户需求链接。');
                    if (flow?.deal?.id) {
                        window.location.assign(adminPageUrl('quote-customer-flow', {
                            customer: saved.id,
                            deal: flow.deal.id,
                            stage: 'requirement_capture',
                        }));
                        return;
                    }
                } else {
                    input.showToast('客户档案已保存。');
                }
                await renderQuoteCustomersPage(input);
            } catch (error) {
                input.showToast(error.message || '保存客户档案失败。', true);
            }
        });
    });

    document.getElementById('ams-customer-copy-requirement-link')?.addEventListener('click', async () => {
        const customerId = text(moduleState.customerLoadedId || moduleState.customerEditor?.id);
        const link = customerRequirementLink(customerId);
        if (!link) {
            input.showToast('请先保存客户档案，再生成客户需求链接。', true);
            return;
        }
        try {
            await navigator.clipboard.writeText(link);
            input.showToast('客户需求链接已复制。');
        } catch (_error) {
            input.showToast(link, false);
        }
    });

    document.getElementById('ams-quote-customer-archive-current')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '归档中...', async () => {
            try {
                const saved = await saveCustomerDraft(input.user, {
                    ...moduleState.customerEditor,
                    is_active: false,
                    is_deleted: false,
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
                    is_deleted: false,
                });
                await Promise.all([
                    fetchCustomerAnalytics(saved.id),
                    fetchCustomerSendLedger(saved.id),
                ]);
                moduleState.customerListMode = 'active';
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

    document.querySelectorAll('[data-customer-activity-panel]').forEach((panel) => {
        bindCustomerActivityPanel(panel, text(panel.dataset.customerActivityPanel));
    });
}

function bindRequirementEditor(input) {
    const content = document.getElementById('ams-content');
    if (!content) return;
    hydrateCustomSelects(content);
    const requirementShareMenu = content.querySelector('.ams-share-menu');
    const requirementPosterModal = document.getElementById('ams-requirement-share-poster-modal');
    const requirementPosterImage = document.getElementById('ams-requirement-share-poster-image');
    const requirementPosterDownload = document.getElementById('ams-requirement-share-poster-download');
    const closeRequirementPosterModal = () => {
        if (requirementPosterModal) requirementPosterModal.hidden = true;
    };

    document.getElementById('ams-quote-requirement-search')?.addEventListener('input', (event) => {
        moduleState.requirementSearch = event.currentTarget.value || '';
        void renderQuoteRequirementsPage(input);
    });

    document.getElementById('ams-quote-requirement-status-filter')?.addEventListener('change', (event) => {
        moduleState.requirementStatusFilter = event.currentTarget.value || 'all';
        void renderQuoteRequirementsPage(input);
    });

    document.getElementById('ams-quote-requirement-new')?.addEventListener('click', () => {
        const seededDeal = dealById(activeDealIdFromState(text(moduleState.requirementEditor?.deal_id)));
        const seededCustomer = moduleState.customers.find((item) => item.id === text(seededDeal?.customer_id || moduleState.requirementEditor?.customer_id || moduleState.customerLoadedId));
        moduleState.requirementLoadedId = '';
        moduleState.requirementEditor = createRequirementDraft({
            customer_id: text(seededDeal?.customer_id || moduleState.requirementEditor?.customer_id || moduleState.customerLoadedId),
            deal_id: text(seededDeal?.id || moduleState.requirementEditor?.deal_id || activeDealIdFromState()),
            requester_company: seededCustomer?.company_name || '',
            requester_name: seededCustomer?.contact_name || '',
            requester_email: normalizedCustomerEmail(seededCustomer?.email),
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
            if (requirementIsLocked(moduleState.requirementEditor?.status) && !['notes', 'deal_id'].includes(field)) return;
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
            if (field === 'deal_id') {
                const deal = dealById(moduleState.requirementEditor.deal_id);
                if (deal?.customer_id) {
                    moduleState.requirementEditor.customer_id = deal.customer_id;
                    const customer = moduleState.customers.find((item) => item.id === deal.customer_id);
                    if (customer) {
                        moduleState.requirementEditor.requester_company = text(moduleState.requirementEditor.requester_company || customer.company_name);
                        moduleState.requirementEditor.requester_name = text(moduleState.requirementEditor.requester_name || customer.contact_name);
                        moduleState.requirementEditor.requester_email = text(moduleState.requirementEditor.requester_email || customer.email);
                        moduleState.requirementEditor.requester_phone = text(moduleState.requirementEditor.requester_phone || customer.phone);
                        moduleState.requirementEditor.country = text(moduleState.requirementEditor.country || customer.country);
                    }
                }
            }
        };
        node.addEventListener('input', apply);
        if (node.type === 'checkbox' || node.tagName === 'SELECT') {
            node.addEventListener('change', () => {
                apply();
                if (['customer_id', 'deal_id'].includes(node.dataset.requirementField || '')) void renderQuoteRequirementsPage(input);
            });
        }
    });

    content.querySelectorAll('[data-requirement-answer]').forEach((node) => {
        const apply = () => {
            const field = node.dataset.requirementAnswer;
            if (!field) return;
            if (requirementIsLocked(moduleState.requirementEditor?.status)) return;
            moduleState.requirementEditor.answers[field] = node.value;
        };
        node.addEventListener('input', apply);
        if (node.type === 'checkbox' || node.tagName === 'SELECT') node.addEventListener('change', apply);
    });

    content.querySelectorAll('[data-requirement-check]').forEach((node) => {
        const apply = () => {
            const field = node.dataset.requirementCheck;
            if (!field) return;
            if (requirementIsLocked(moduleState.requirementEditor?.status)) return;
            const checked = [...content.querySelectorAll(`[data-requirement-check="${field}"]`)]
                .filter((item) => item.checked)
                .map((item) => item.value);
            moduleState.requirementEditor.answers[field] = checked;
        };
        node.addEventListener('change', apply);
    });

    document.getElementById('ams-quote-requirement-save')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '生成中...', async () => {
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

    document.getElementById('ams-quote-requirement-confirm')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '确认中...', async () => {
            try {
                const saved = await confirmRequirementForDeal(input.user, moduleState.requirementEditor);
                input.showToast('需求基线已确认。');
                await fetchRequirementEditor(saved.id);
                await renderQuoteRequirementsPage(input);
            } catch (error) {
                input.showToast(error.message || '确认需求失败。', true);
            }
        });
    });

    document.getElementById('ams-quote-requirement-open-link')?.addEventListener('click', () => {
        if (!moduleState.requirementEditor?.public_slug || !moduleState.requirementEditor?.public_token) {
            input.showToast('请先保存需求单，再打开公开需求页。', true);
            return;
        }
        window.open(requirementPublicUrl(moduleState.requirementEditor.public_slug, moduleState.requirementEditor.public_token, { readonly: true }), '_blank', 'noopener');
    });
    document.getElementById('ams-quote-requirement-open-link-inline')?.addEventListener('click', () => {
        document.getElementById('ams-quote-requirement-open-link')?.click();
    });
    const copyRequirementShareLink = async () => {
        if (!moduleState.requirementEditor?.public_slug || !moduleState.requirementEditor?.public_token) {
            input.showToast('请先生成需求单，再分享给客户填写。', true);
            return;
        }
        const payload = requirementShareCopyText(moduleState.requirementEditor);
        try {
            await navigator.clipboard.writeText(payload);
            input.showToast('需求单分享文案已复制。');
        } catch (_error) {
            input.showToast(payload, false);
        }
        if (requirementShareMenu) requirementShareMenu.removeAttribute('open');
    };
    document.getElementById('ams-quote-requirement-share-link')?.addEventListener('click', copyRequirementShareLink);
    content.querySelectorAll('[data-requirement-share-link-trigger]').forEach((button) => {
        button.addEventListener('click', copyRequirementShareLink);
    });
    const openRequirementSharePoster = async (event = null) => {
        if (!moduleState.requirementEditor?.public_slug || !moduleState.requirementEditor?.public_token) {
            input.showToast('请先生成需求单，再分享二维码。', true);
            return;
        }
        try {
            const runner = async () => {
                const posterUrl = await requirementSharePosterDataUrl(moduleState.requirementEditor);
                if (requirementPosterImage) requirementPosterImage.setAttribute('src', posterUrl);
                if (requirementPosterDownload) requirementPosterDownload.setAttribute('href', posterUrl);
                if (requirementPosterModal) requirementPosterModal.hidden = false;
                if (requirementShareMenu) requirementShareMenu.removeAttribute('open');
            };
            if (event?.currentTarget) {
                await input.withButtonBusy(event.currentTarget, '生成中...', runner);
            } else {
                await runner();
            }
        } catch (error) {
            input.showToast(error.message || '二维码海报生成失败。', true);
        }
    };
    document.getElementById('ams-quote-requirement-share-poster')?.addEventListener('click', openRequirementSharePoster);
    content.querySelectorAll('[data-requirement-share-poster-trigger]').forEach((button) => {
        button.addEventListener('click', openRequirementSharePoster);
    });
    document.getElementById('ams-requirement-share-poster-copy-link')?.addEventListener('click', async () => {
        if (!moduleState.requirementEditor?.public_slug || !moduleState.requirementEditor?.public_token) {
            input.showToast('请先生成需求单，再复制分享说明。', true);
            return;
        }
        const payload = requirementShareCopyText(moduleState.requirementEditor);
        try {
            await navigator.clipboard.writeText(payload);
            input.showToast('海报说明文案已复制。');
        } catch (_error) {
            input.showToast(payload, false);
        }
    });
    requirementPosterModal?.querySelectorAll('[data-requirement-share-poster-close]').forEach((node) => {
        node.addEventListener('click', closeRequirementPosterModal);
    });

    document.getElementById('ams-quote-requirement-create-instance')?.addEventListener('click', async (event) => {
        const productId = document.getElementById('ams-quote-requirement-product-select')?.value || '';
        await input.withButtonBusy(event.currentTarget, '生成中...', async () => {
            try {
                const savedRequirement = await saveRequirementDraft(input.user, moduleState.requirementEditor);
                const instance = await createInstanceFromRequirement(input.user, savedRequirement.id, productId, {
                    dealId: savedRequirement.deal_id || activeDealIdFromState(),
                });
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
                    const instance = await createInstanceFromRequirement(input.user, savedRequirement.id, productId, {
                        dealId: savedRequirement.deal_id || activeDealIdFromState(),
                    });
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
            const requirement = requirementById(requirementId);
            window.location.assign(adminPageUrl('quote-instances', {
                requirement: requirementId,
                deal: requirement?.deal_id,
            }));
        });
    });
    content.querySelectorAll('[data-requirement-linked-instance]').forEach((select) => {
        select.addEventListener('change', (event) => {
            const instanceId = event.currentTarget.value || '';
            if (!instanceId) return;
            const quote = moduleState.instances.find((item) => item.id === instanceId);
            window.location.assign(adminPageUrl('quote-instances', {
                instance: instanceId,
                deal: quote?.deal_id,
            }));
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

    const requestedDealId = readAdminPageParam('deal');
    if (requestedDealId && moduleState.deals.some((item) => item.id === requestedDealId) && moduleState.dealLoadedId !== requestedDealId) {
        await fetchDealEditor(requestedDealId);
    }
    const requestedRequirementId = readAdminPageParam('requirement');
    if (requestedRequirementId) {
        if (moduleState.requirements.some((item) => item.id === requestedRequirementId) && moduleState.requirementLoadedId !== requestedRequirementId) {
            await fetchRequirementEditor(requestedRequirementId);
        }
        clearAdminPageParams('requirement');
    } else if (requestedDealId && moduleState.dealEditor?.primary_requirement_id && moduleState.requirementLoadedId !== moduleState.dealEditor.primary_requirement_id) {
        await fetchRequirementEditor(moduleState.dealEditor.primary_requirement_id);
    } else if (requestedDealId && !moduleState.requirementLoadedId) {
        const firstDealRequirement = dealRequirements(requestedDealId)[0];
        if (firstDealRequirement?.id) await fetchRequirementEditor(firstDealRequirement.id);
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

    let requirement = moduleState.requirementEditor || createRequirementDraft();
    const currentDeal = dealById(activeDealIdFromState(text(requirement.deal_id || requestedDealId)));
    if (currentDeal?.id && !text(requirement.deal_id)) {
        requirement = createRequirementDraft({
            ...requirement,
            deal_id: currentDeal.id,
            customer_id: text(requirement.customer_id || currentDeal.customer_id),
        });
        moduleState.requirementEditor = requirement;
    }
    const activeRequirementId = text(moduleState.requirementLoadedId || requirement.id);
    const showRequirementEditor = Boolean(activeRequirementId || moduleState.requirementCreateMode);
    const answers = normalizeRequirementAnswers(requirement.answers);
    const currentCustomer = moduleState.customers.find((item) => item.id === requirement.customer_id) || null;
    const quoteSummary = requirement.id ? summarizeRequirementQuotes(requirement.id) : summarizeRequirementQuotes('');
    const dealRecords = currentDeal ? dealCurrentRecords(currentDeal) : [];
    const requirementConfirmed = currentDeal
        ? normalizeDealStageStatus(stageRecordByKey('requirement_confirmed', dealRecords)?.stage_status) === 'completed'
        : false;
    const availableDeals = requirement.customer_id
        ? customerDeals(requirement.customer_id)
        : currentDeal?.customer_id
            ? customerDeals(currentDeal.customer_id)
            : [...moduleState.deals].sort((left, right) => text(right.updated_at || right.created_at).localeCompare(text(left.updated_at || left.created_at)));
    const requirementLink = requirement.id && requirement.public_slug && requirement.public_token
        ? requirementPublicUrl(requirement.public_slug, requirement.public_token)
        : '';
    const canCreateQuote = requirementStatusReadyForQuote(requirement.status) && (!isSalesConsole(input) || !currentDeal?.id || requirementConfirmed);
    const canConfirmRequirement = Boolean(requirement.customer_id && (requirement.deal_id || currentDeal?.id));
    const linkLocked = requirementIsLocked(requirement.status);
    const requirementLocked = requirementIsLocked(requirement.status);
    const requirementSubmitted = normalizeRequirementStatus(requirement.status) === 'submitted';
    const availableProducts = activeProducts();
    if (!availableProducts.some((product) => product.id === moduleState.requirementProductSelection)) {
        moduleState.requirementProductSelection = availableProducts[0]?.id || '';
    }
    const selectedRequirementProductId = moduleState.requirementProductSelection;

    const requirementPageTitle = isSalesConsole(input) ? '销售需求 / 获取与确认' : '报价系统 / 需求获取单';
    const requirementPageSub = isSalesConsole(input)
        ? '先把客户原始需求锁成一条 deal 基线，再推进到报价。'
        : '先发客户公开需求链接，等客户提交后，再进入整理与报价流程。';
    renderSalesPageFrame(input, requirementPageTitle, requirementPageSub, `
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
                <div class="ams-quick-link ams-quick-link-static ams-quote-create-panel ${requirementSubmitted ? 'ams-need-attention' : ''}">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-file-invoice-dollar"></i></div>
                    <div class="ams-quick-link-body">
                        <strong>从需求生成报价单</strong>
                        <span>${canCreateQuote ? '客户已提交且已锁定需求基线，选择产品模板后可直接生成报价草稿。' : isSalesConsole(input) && currentDeal?.id && !requirementConfirmed ? '当前商机还没完成“确认需求”，请先锁定需求基线，再转入报价。' : '只有客户正式提交后的需求单才能进入报价链路。当前需求还不能生成报价单。'}</span>
                        <div class="ams-inline-actions ams-quote-create-bar ams-quote-create-bar-compact">
                            <select class="ams-select ams-quote-create-select" data-requirement-product-select>
                                <option value="">请选择产品模板</option>
                                ${availableProducts.map((product) => `<option value="${esc(product.id)}" ${selectedRequirementProductId === product.id ? 'selected' : ''}>${esc(productLabelById(product.id))}</option>`).join('')}
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
                        <h3>${requirement.id ? '客户原始需求填报单' : '新建需求获取单'}</h3>
                            <p>后台在这里做客户绑定、公开链接发放、提交状态确认和报价衔接，不直接代替客户填写问卷。</p>
                        </div>
                        <div class="ams-row-actions">
                            ${isSalesConsole(input)
                                ? `<button class="ams-btn ams-btn-warning" type="button" id="ams-quote-requirement-confirm" ${canConfirmRequirement ? '' : 'disabled'}>确认需求</button>`
                                : ''}
                            ${requirement.id && quoteSummary.total_quotes
                                ? `<button class="ams-btn ams-btn-muted" type="button" data-requirement-open-instances="${esc(requirement.id)}">查看报价单</button>`
                                : ''
                            }
                            <details class="ams-share-menu">
                                <summary class="ams-btn ams-btn-muted" ${requirementLink ? '' : 'aria-disabled="true"'}>
                                    分享需求单
                                </summary>
                                <div class="ams-share-menu-panel">
                                    <div class="ams-share-menu-copy">
                                        <strong>选择分享方式</strong>
                                        <span>对外发送时，会自动带上填写引导、GasGx 品牌说明，以及“自动保存、后台可同步查看进度”的说明。</span>
                                    </div>
                                    <button class="ams-share-menu-item" type="button" id="ams-quote-requirement-share-link" ${requirementLink ? '' : 'disabled'}>
                                        <i class="fa-solid fa-link"></i>
                                        <span>分享链接</span>
                                    </button>
                                    <button class="ams-share-menu-item" type="button" id="ams-quote-requirement-share-poster" ${requirementLink ? '' : 'disabled'}>
                                        <i class="fa-solid fa-qrcode"></i>
                                        <span>分享二维码</span>
                                    </button>
                                </div>
                            </details>
                            <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-requirement-save">生成需求单</button>
                        </div>
                    </div>
                    <div class="ams-share-poster-modal" id="ams-requirement-share-poster-modal" hidden>
                        <div class="ams-share-poster-backdrop" data-requirement-share-poster-close></div>
                        <div class="ams-share-poster-dialog">
                            <div class="ams-share-poster-head">
                                <div>
                                    <strong>需求单分享二维码海报</strong>
                                    <span>适合微信、邮件或群转发，已包含填写引导与 GasGx 品牌说明。</span>
                                </div>
                                <button class="ams-btn ams-btn-muted" type="button" data-requirement-share-poster-close>关闭</button>
                            </div>
                            <div class="ams-share-poster-stage">
                                <img class="ams-share-poster-image" id="ams-requirement-share-poster-image" alt="需求单分享二维码海报">
                            </div>
                            <div class="ams-row-actions">
                                <a class="ams-btn ams-btn-primary" id="ams-requirement-share-poster-download" download="gasgx-requirement-share-poster.svg">下载海报</a>
                                <button class="ams-btn ams-btn-muted" type="button" id="ams-requirement-share-poster-copy-link">复制海报说明文案</button>
                            </div>
                        </div>
                    </div>
                    <div class="ams-quote-meta-grid">
                        ${isSalesConsole(input)
                            ? `<div class="ams-summary-chip"><strong>所属商机</strong><span>${currentDeal?.id ? `<a class="ams-inline-link" href="${esc(adminPageUrl('quote-deals', { deal: currentDeal.id }))}">${esc(text(currentDeal.title, currentDeal.id))}</a>` : '未绑定'}</span></div>`
                            : ''}
                        <div class="ams-summary-chip"><strong>绑定客户</strong><span>${esc(customerDisplayName(currentCustomer || {}))}</span></div>
                        <div class="ams-summary-chip"><strong>当前状态</strong><span>${esc(requirementStatusLabel(requirement.status))}</span></div>
                        ${isSalesConsole(input) && currentDeal?.id
                            ? `<div class="ams-summary-chip"><strong>商机阶段</strong><span>${esc(dealStageLabel(currentDeal.current_stage))}</span></div>`
                            : ''}
                          <div class="ams-summary-chip ams-summary-chip-link">
                              <strong>公开链接</strong>
                              <span>${requirementLink ? `<a class="ams-inline-link" href="${esc(requirementLink)}" target="_blank" rel="noopener">${esc(requirementLink)}</a>` : esc('先保存后生成')}</span>
                              <div class="ams-summary-chip-actions">
                                  <button class="ams-btn ams-btn-warning" type="button" id="ams-quote-requirement-open-link-inline" ${requirementLink ? '' : 'disabled'}>查看</button>
                                  <button class="ams-btn ams-btn-primary" type="button" data-requirement-share-link-trigger ${requirementLink ? '' : 'disabled'}>复制链接</button>
                                  <button class="ams-btn ams-btn-muted" type="button" data-requirement-share-poster-trigger ${requirementLink ? '' : 'disabled'}>二维码海报</button>
                              </div>
                          </div>
                        <div class="ams-summary-chip"><strong>客户提交时间</strong><span>${esc(fmtDate(requirement.submitted_at))}</span></div>
                        <div class="ams-summary-chip"><strong>已关联报价</strong><span>${requirementQuoteJumpMarkup(requirement.id)}</span></div>
                        <div class="ams-summary-chip"><strong>更新时间</strong><span>${esc(fmtDate(requirement.updated_at))}</span></div>
                    </div>
                    <div class="ams-site-field-grid ams-site-field-grid-wide">
                        ${isSalesConsole(input)
                            ? `
                                <div class="ams-field">
                                    <label>绑定商机</label>
                                    <select class="ams-select" data-requirement-field="deal_id" ${normalizeRequirementStatus(requirement.status) === 'closed' ? 'disabled' : ''}>
                                        <option value="">暂不绑定</option>
                                        ${availableDeals.map((deal) => `<option value="${esc(deal.id)}" ${text(requirement.deal_id || currentDeal?.id) === deal.id ? 'selected' : ''}>${esc(text(deal.title, deal.id))} · ${esc(customerDisplayName(moduleState.customers.find((item) => item.id === deal.customer_id) || {}))}</option>`).join('')}
                                    </select>
                                    <div class="ams-field-help">${currentDeal?.id ? '当前页面已带商机上下文，确认需求后会直接推进这条业务链路。' : '销售入口里建议先绑定商机，再执行确认需求和转入报价。'}</div>
                                </div>
                            `
                            : ''}
                        <div class="ams-field">
                            <label>绑定客户</label>
                            <select class="ams-select" data-requirement-field="customer_id" ${requirement.id || requirementLocked ? 'disabled' : ''}>
                                <option value="">请选择客户档案</option>
                                ${moduleState.customers.map((customer) => `<option value="${esc(customer.id)}" ${requirement.customer_id === customer.id ? 'selected' : ''}>${esc(customerDisplayName(customer))}</option>`).join('')}
                            </select>
                            <div class="ams-field-help">${requirement.id ? '需求单创建后，绑定客户不可更改。若客户归属有误，请新建一份正确的需求单。' : '先绑定客户，再继续完善公开需求链接和问卷内容。'}</div>
                        </div>
                        <div class="ams-field"><label>需求标题</label><input class="ams-input" data-requirement-field="title" value="${esc(requirement.title)}" placeholder="例如：俄罗斯 200 台液冷矿机一体化需求" ${requirementLocked ? 'disabled' : ''}></div>
                        <div class="ams-field">
                            <label>状态</label>
                            <select class="ams-select" data-requirement-field="status" ${requirementLocked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_STATUS_OPTIONS, requirement.status)}</select>
                        </div>
                        <div class="ams-field">
                            <label>需求类型</label>
                            <select class="ams-select" data-requirement-field="requirement_type" ${requirementLocked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_TYPE_OPTIONS, requirement.requirement_type)}</select>
                        </div>
                        <div class="ams-field"><label>国家 / 地区</label><input class="ams-input" data-requirement-field="country" value="${esc(requirement.country)}" placeholder="Russia" ${requirementLocked ? 'disabled' : ''}></div>
                        <div class="ams-field"><label>客户公司</label><input class="ams-input" data-requirement-field="requester_company" value="${esc(requirement.requester_company)}" placeholder="Demo Mining" ${requirementLocked ? 'disabled' : ''}></div>
                        <div class="ams-field"><label>联系人</label><input class="ams-input" data-requirement-field="requester_name" value="${esc(requirement.requester_name)}" placeholder="Allen" ${requirementLocked ? 'disabled' : ''}></div>
                        <div class="ams-field"><label>邮箱</label><input class="ams-input" data-requirement-field="requester_email" value="${esc(requirement.requester_email)}" placeholder="customer@example.com" ${requirementLocked ? 'disabled' : ''}></div>
                        <div class="ams-field"><label>WhatsApp / 电话</label><input class="ams-input" data-requirement-field="requester_phone" value="${esc(requirement.requester_phone)}" placeholder="+7 000 000 0000" ${requirementLocked ? 'disabled' : ''}></div>
                        <div class="ams-field">
                            <label>线索来源</label>
                            <select class="ams-select" data-requirement-answer="source_channel" ${requirementLocked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.source_channel, answers.source_channel)}</select>
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
                              <button class="ams-btn ams-btn-warning" type="button" id="ams-quote-requirement-open-link" ${requirementLink ? '' : 'disabled'}>打开公开需求页</button>
                              <button class="ams-btn ams-btn-primary" type="button" data-requirement-share-link-trigger ${requirementLink ? '' : 'disabled'}>复制链接</button>
                              <button class="ams-btn ams-btn-muted" type="button" data-requirement-share-poster-trigger ${requirementLink ? '' : 'disabled'}>二维码海报</button>
                          </div>
                    </section>
                    <section class="ams-quote-block">
                        <div class="ams-section-head"><div><h3>客户问卷内容</h3><p>后台这里主要用于查看和必要时预置默认值；正式基线以客户公开提交为准。</p></div></div>
                        <div class="ams-site-field-grid ams-site-field-grid-wide">
                            <div class="ams-field">
                                <label>部署方式</label>
                                <select class="ams-select" data-requirement-answer="deployment_mode" ${requirementLocked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.deployment_mode, answers.deployment_mode)}</select>
                            </div>
                            <div class="ams-field">
                                <label>单机算力范围</label>
                                <select class="ams-select" data-requirement-answer="miner_hashrate_band" ${requirementLocked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.miner_hashrate_band, answers.miner_hashrate_band)}</select>
                            </div>
                            <div class="ams-field">
                                <label>单机功耗范围</label>
                                <select class="ams-select" data-requirement-answer="miner_power_band" ${requirementLocked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.miner_power_band, answers.miner_power_band)}</select>
                            </div>
                            <div class="ams-field">
                                <label>矿机数量范围</label>
                                <select class="ams-select" data-requirement-answer="miner_quantity_band" ${requirementLocked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.miner_quantity_band, answers.miner_quantity_band)}</select>
                            </div>
                            <div class="ams-field">
                                <label>电压 / 频率</label>
                                <select class="ams-select" data-requirement-answer="voltage_frequency" ${requirementLocked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.voltage_frequency, answers.voltage_frequency)}</select>
                            </div>
                        </div>
                        <div class="ams-field">
                            <label>矿机品牌</label>
                            ${requirementCheckboxGroup('miner_brands', REQUIREMENT_MULTI_OPTIONS.miner_brands, answers.miner_brands, requirementLocked)}
                            <div class="ams-field-help">可多选；若客户暂时不确定，保留“其他 / 待确认”即可。</div>
                        </div>
                        <div class="ams-field">
                            <label>矿机冷却方式</label>
                            ${requirementCheckboxGroup('miner_cooling', REQUIREMENT_MULTI_OPTIONS.miner_cooling, answers.miner_cooling, requirementLocked)}
                        </div>
                    </section>
                    <section class="ams-quote-block">
                        <div class="ams-section-head"><div><h3>交付与现场条件</h3><p>继续用少量选择题确认约束条件，避免后续报价依据反复变化。</p></div></div>
                        <div class="ams-site-field-grid ams-site-field-grid-wide">
                            <div class="ams-field">
                                <label>供电规模</label>
                                <select class="ams-select" data-requirement-answer="power_capacity_band" ${requirementLocked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.power_capacity_band, answers.power_capacity_band)}</select>
                            </div>
                            <div class="ams-field">
                                <label>部署偏好</label>
                                <select class="ams-select" data-requirement-answer="container_preference" ${requirementLocked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.container_preference, answers.container_preference)}</select>
                            </div>
                            <div class="ams-field">
                                <label>噪音要求</label>
                                <select class="ams-select" data-requirement-answer="silent_requirement" ${requirementLocked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.silent_requirement, answers.silent_requirement)}</select>
                            </div>
                            <div class="ams-field">
                                <label>预算区间</label>
                                <select class="ams-select" data-requirement-answer="budget_band" ${requirementLocked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.budget_band, answers.budget_band)}</select>
                            </div>
                            <div class="ams-field">
                                <label>期望周期</label>
                                <select class="ams-select" data-requirement-answer="timeline_band" ${requirementLocked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.timeline_band, answers.timeline_band)}</select>
                            </div>
                        </div>
                        <div class="ams-field">
                            <label>认证 / 合规要求</label>
                            ${requirementCheckboxGroup('certification_needs', REQUIREMENT_MULTI_OPTIONS.certification_needs, answers.certification_needs, requirementLocked)}
                        </div>
                    </section>
                    <div class="ams-field">
                        <label>客户补充</label>
                        <textarea class="ams-textarea" rows="3" data-requirement-answer="extra_notes" placeholder="只保留必须记录的额外说明，例如特殊站点条件、付款方式、指定矿机型号。" ${requirementLocked ? 'disabled' : ''}>${esc(answers.extra_notes)}</textarea>
                    </div>
                    <div class="ams-field ${requirementSubmitted ? 'ams-need-attention' : ''}">
                        <label>内部备注</label>
                        <textarea class="ams-textarea" rows="3" data-requirement-field="notes" placeholder="记录内部判断、下一步动作和推荐方向。">${esc(requirement.notes)}</textarea>
                    </div>
                    <section class="ams-quote-block">
                        <div class="ams-section-head"><div><h3>生成报价</h3><p>只有客户已提交后的需求单才能进入报价链路，避免报价依据反复变化。</p></div></div>
                        <div class="ams-inline-actions ams-quote-create-bar ams-quote-create-bar-compact">
                            <select id="ams-quote-requirement-product-select" class="ams-select ams-quote-create-select" data-requirement-product-select>
                                <option value="">请选择产品模板</option>
                                ${availableProducts.map((product) => `<option value="${esc(product.id)}" ${selectedRequirementProductId === product.id ? 'selected' : ''}>${esc(productLabelById(product.id))}</option>`).join('')}
                            </select>
                            <button class="ams-btn ams-btn-warning" type="button" id="ams-quote-requirement-create-instance" ${canCreateQuote ? '' : 'disabled'}>生成报价草稿并打开真实报价页</button>
                        </div>
                        <div class="ams-field-help">${canCreateQuote ? '生成后会把客户信息、需求摘要和问卷备注自动带入报价单草稿。' : isSalesConsole(input) && currentDeal?.id && !requirementConfirmed ? '当前 deal 尚未执行需求确认，所以先不开放报价创建。' : '当前还没收到客户正式提交，暂不允许生成报价。'}</div>
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
    `, {
        deal: currentDeal,
        currentStage: currentDeal?.current_stage || 'requirement_capture',
        page: 'quote-requirements',
    });
    bindRequirementEditor(input);
    bindSalesPageChrome(input);
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

    const requestedDealId = readAdminPageParam('deal');
    if (requestedDealId && moduleState.deals.some((item) => item.id === requestedDealId) && moduleState.dealLoadedId !== requestedDealId) {
        await fetchDealEditor(requestedDealId);
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
    } else if (requestedDealId && moduleState.dealEditor?.primary_instance_id && moduleState.instanceLoadedId !== moduleState.dealEditor.primary_instance_id) {
        await fetchInstanceEditor(moduleState.dealEditor.primary_instance_id);
    } else if (requestedDealId && !moduleState.instanceLoadedId) {
        const firstDealQuote = dealQuotes(requestedDealId)[0];
        if (firstDealQuote?.id) await fetchInstanceEditor(firstDealQuote.id);
    }

    const currentDeal = dealById(activeDealIdFromState(text(moduleState.instanceEditor?.deal_id || requestedDealId)));
    if (currentDeal?.id && !text(moduleState.instanceEditor?.deal_id)) {
        moduleState.instanceEditor = createInstanceDraft({
            ...moduleState.instanceEditor,
            deal_id: currentDeal.id,
            customer_id: text(moduleState.instanceEditor?.customer_id || currentDeal.customer_id),
            requirement_id: text(moduleState.instanceEditor?.requirement_id || currentDeal.primary_requirement_id),
        });
    }
    const instancePageTitle = isSalesConsole(input) ? '销售报价 / 草稿与确认' : '报价系统 / 报价单管理';
    const instancePageSub = isSalesConsole(input)
        ? '围绕商机维护报价草稿、确认签约版本，并衔接合同执行。'
        : '从产品生成客户报价单草稿，编辑后发布，生成客户独立链接。';
    const listMode = text(moduleState.instanceListMode, 'active');
    const archiveView = listMode === 'archived';
    const voidedView = listMode === 'voided';
    const inactiveEditor = ['archived', 'voided'].includes(text(moduleState.instanceEditor?.status));
    syncInstanceSalesOwner(moduleState.instanceEditor, input.user);
    const salesOwner = currentSalesOwner(input.user);
    const linkedRequirement = requirementById(moduleState.instanceEditor?.requirement_id);
    const focusedRequirement = requirementById(moduleState.instanceRequirementFilter);
    const availableRequirements = instanceRequirementOptions(moduleState.instanceEditor);
    const availableDeals = moduleState.instanceEditor?.customer_id
        ? customerDeals(moduleState.instanceEditor.customer_id)
        : currentDeal?.customer_id
            ? customerDeals(currentDeal.customer_id)
            : [...moduleState.deals].sort((left, right) => text(right.updated_at || right.created_at).localeCompare(text(left.updated_at || left.created_at)));
    const canConfirmQuote = Boolean(moduleState.instanceEditor?.id && (moduleState.instanceEditor?.deal_id || currentDeal?.id));
    if ((archiveView || voidedView) && moduleState.instanceStatusFilter !== 'all') {
        moduleState.instanceStatusFilter = 'all';
    }
    if (!archiveView && !voidedView && moduleState.instanceStatusFilter === 'archived') {
        moduleState.instanceStatusFilter = 'all';
    }
    const pagination = instancePaginationState();
    const visibleCountLabel = pagination.totalItems;
    renderSalesPageFrame(input, instancePageTitle, instancePageSub, `
        <section class="ams-card ams-hero-card ams-hero-card-compact ams-quote-instance-hero">
            <div class="ams-hero-copy">
                <p class="ams-eyebrow">Quote Instances</p>
                <h2>报价单实例才是最终业务对象。</h2>
                <p class="ams-hero-text">这里的产品已经是正式业务产品。生成报价单后可以直接给客户；如果有细节不满意，直接在报价单里继续改，不需要再回到模板概念里理解。</p>
            </div>
            <div class="ams-quick-actions ams-quote-instance-quick-actions">
                <div class="ams-quick-link ams-quick-link-static ams-quote-create-panel">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-file-circle-plus"></i></div>
                    <div class="ams-quick-link-body">
                        <strong>从产品生成报价单</strong>
                        <span>先选一个正式产品，系统会按当前产品内容生成一份可编辑草稿；EN / RU 未填写时会自动继承中文。</span>
                        <div class="ams-inline-actions ams-quote-create-bar ams-quote-create-bar-compact">
                            <select id="ams-quote-instance-product-select" class="ams-select ams-quote-create-select">
                                <option value="">请选择产品</option>
                                ${activeProducts().map((product) => `<option value="${esc(product.id)}">${esc(productLabelById(product.id))}</option>`).join('')}
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
                            <button class="ams-btn ams-btn-muted" type="button" id="ams-quote-instance-preview">预览报价单</button>
                            ${isSalesConsole(input)
                                ? `<button class="ams-btn ams-btn-warning" type="button" id="ams-quote-instance-confirm" ${canConfirmQuote && !inactiveEditor ? '' : 'disabled'}>确认报价</button>`
                                : ''}
                            <details class="ams-share-menu">
                                <summary class="ams-btn ams-btn-muted">分享报价单</summary>
                                <div class="ams-share-menu-panel">
                                    <div class="ams-share-menu-copy">
                                        <strong>选择分享方式</strong>
                                        <span>对外发送时，系统会自动带上用途说明和 GasGx 品牌介绍。</span>
                                    </div>
                                    <button class="ams-share-menu-item" type="button" id="ams-quote-instance-share-link">
                                        <i class="fa-solid fa-link"></i>
                                        <span>分享链接</span>
                                    </button>
                                    <button class="ams-share-menu-item" type="button" id="ams-quote-instance-share-poster">
                                        <i class="fa-solid fa-qrcode"></i>
                                        <span>分享二维码</span>
                                    </button>
                                </div>
                            </details>
                            <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-instance-save" ${inactiveEditor ? 'disabled' : ''}>保存</button>
                        </div>
                    </div>
                    <div class="ams-share-poster-modal" id="ams-quote-share-poster-modal" hidden>
                        <div class="ams-share-poster-backdrop" data-share-poster-close></div>
                        <div class="ams-share-poster-dialog">
                            <div class="ams-share-poster-head">
                                <div>
                                    <strong>分享二维码海报</strong>
                                    <span>适合微信、邮件或内部转发，已包含用途说明与 GasGx 品牌信息。</span>
                                </div>
                                <button class="ams-btn ams-btn-muted" type="button" data-share-poster-close>关闭</button>
                            </div>
                            <div class="ams-share-poster-stage">
                                <img class="ams-share-poster-image" id="ams-quote-share-poster-image" alt="报价单分享二维码海报">
                            </div>
                            <div class="ams-row-actions">
                                <a class="ams-btn ams-btn-primary" id="ams-quote-share-poster-download" download="gasgx-quote-share-poster.svg">下载海报</a>
                                <button class="ams-btn ams-btn-muted" type="button" id="ams-quote-share-poster-copy-link">复制海报说明文案</button>
                            </div>
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
                    <button class="ams-direct-entry-banner ${inactiveEditor ? 'is-disabled' : ''}" type="button" id="ams-open-instance-visual-editor" ${inactiveEditor ? 'disabled' : ''}>
                        <strong>进入可视化编辑</strong>
                        <span>${inactiveEditor ? '当前这份报价单已退出主编辑流；如需继续改动，请先恢复，再进入可视化编辑。' : '点击后直接进入客户报价页本体，按最终展示效果编辑内容。'}</span>
                    </button>
                    <div class="ams-quote-meta-grid">
                        ${isSalesConsole(input)
                            ? `<div class="ams-summary-chip"><strong>所属商机</strong><span>${currentDeal?.id ? `<a class="ams-inline-link" href="${esc(adminPageUrl('quote-deals', { deal: currentDeal.id }))}">${esc(text(currentDeal.title, currentDeal.id))}</a>` : '未绑定'}</span></div>`
                            : ''}
                        <div class="ams-summary-chip"><strong>状态</strong><span>${statusPill(moduleState.instanceEditor.status)}</span></div>
                        <div class="ams-summary-chip"><strong>客户档案</strong><span>${esc(customerDisplayName(moduleState.customers.find((item) => item.id === moduleState.instanceEditor.customer_id) || buildInstanceCustomerSnapshot(moduleState.instanceEditor)))}</span></div>
                        <div class="ams-summary-chip"><strong>需求单</strong><span>${esc(linkedRequirement ? requirementDisplayName(linkedRequirement) : '未绑定')}</span></div>
                        ${isSalesConsole(input) && currentDeal?.id
                            ? `<div class="ams-summary-chip"><strong>商机阶段</strong><span>${esc(dealStageLabel(currentDeal.current_stage))}</span></div>`
                            : ''}
                        <div class="ams-summary-chip"><strong>公开 slug</strong><span>${esc(moduleState.instanceEditor.public_slug || '待生成')}</span></div>
                        <div class="ams-summary-chip"><strong>最近发布时间</strong><span>${esc(fmtDate(moduleState.instanceEditor.published_at))}</span></div>
                    </div>
                    ${quoteManagementFold(
                        '基础管理',
                        '先确认客户、需求和主要联系人；这几个字段决定这张报价单在整条链路里的归属。',
                        `
                            <div class="ams-site-field-grid ams-site-field-grid-wide">
                                ${isSalesConsole(input)
                                    ? `
                                        <div class="ams-field">
                                            <label>绑定商机</label>
                                            <select class="ams-select" id="ams-quote-instance-deal-select">
                                                <option value="">暂不绑定</option>
                                                ${availableDeals.map((deal) => `<option value="${esc(deal.id)}" ${text(moduleState.instanceEditor.deal_id || currentDeal?.id) === deal.id ? 'selected' : ''}>${esc(text(deal.title, deal.id))} · ${esc(customerDisplayName(moduleState.customers.find((item) => item.id === deal.customer_id) || {}))}</option>`).join('')}
                                            </select>
                                            <div class="ams-field-help">${currentDeal?.id ? '当前页带有商机上下文，确认报价后会推进到合同阶段。' : '建议先把报价草稿绑定到一条商机，再确认签约版本。'}</div>
                                        </div>
                                    `
                                    : ''}
                                <div class="ams-field">
                                    <label>客户档案</label>
                                    <select class="ams-select" id="ams-quote-instance-customer-select" ${text(moduleState.instanceEditor.customer_id) ? 'disabled' : ''}>
                                        <option value="">新建或未关联</option>
                                        ${moduleState.customers.map((customer) => `<option value="${esc(customer.id)}" ${moduleState.instanceEditor.customer_id === customer.id ? 'selected' : ''}>${esc(customerDisplayName(customer))}${customer.email ? ` · ${esc(customer.email)}` : ''}</option>`).join('')}
                                    </select>
                                    <div class="ams-field-help">${text(moduleState.instanceEditor.customer_id) ? '客户档案一旦绑定到这份报价单后即锁定；如归属有误，请作废当前报价单后重新建立新报价单。' : '客户档案只允许首次绑定一次。'}</div>
                                </div>
                                <div class="ams-field">
                                    <label>关联需求单</label>
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
                            <div class="ams-field">
                                <label>客户备注</label>
                                <textarea class="ams-textarea" rows="3" data-instance-field="customer_notes" placeholder="记录客户偏好、分享要求或跟进备注。">${esc(moduleState.instanceEditor.customer_notes)}</textarea>
                            </div>
                        `,
                    )}
                    ${quoteManagementFold(
                        '客户备注与分享对象',
                        '这里维护默认外发联系人和分享备注；销售负责人默认按当前登录后台账号记录。',
                        `
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
                `
                        : '<div class="ams-empty">先从左侧选择一份报价单，或从上方正式产品生成一份新的草稿。</div>'
                }
            </section>
        </section>
    `, {
        deal: currentDeal,
        currentStage: currentDeal?.current_stage || 'quote_draft',
        page: 'quote-instances',
    });
    bindInstanceEditor(input);
    bindSalesPageChrome(input);
}

export async function renderQuoteCustomersPage(input) {
    const salesConsole = isSalesConsole(input);
    try {
        await ensureBaseData();
        await fetchUnreadCustomerActivitySummary('customer_profile', input.user, input);
    } catch (error) {
        if (isQuoteSetupMissing(error)) {
            renderQuoteSetupRequired(input, error);
            return;
        }
        throw error;
    }

    const requestedDealId = readAdminPageParam('deal');
    if (requestedDealId && moduleState.deals.some((item) => item.id === requestedDealId) && moduleState.dealLoadedId !== requestedDealId) {
        await fetchDealEditor(requestedDealId);
    }
    const requestedCustomerId = readAdminPageParam('customer');
    if (requestedCustomerId) {
        if (moduleState.customers.some((item) => item.id === requestedCustomerId) && moduleState.customerLoadedId !== requestedCustomerId) {
            await fetchCustomerEditor(requestedCustomerId);
        }
        const keepCustomerParam = Boolean(requestedDealId || readAdminPageParam('stage'));
        if (!keepCustomerParam) clearAdminPageParams('customer');
    } else if (requestedDealId && moduleState.dealEditor?.customer_id && moduleState.customerLoadedId !== moduleState.dealEditor.customer_id) {
        await fetchCustomerEditor(moduleState.dealEditor.customer_id);
    }

    if (salesConsole && !requestedCustomerId && !requestedDealId && !moduleState.customerCreateMode) {
        moduleState.customerLoadedId = '';
        moduleState.customerEditor = createCustomerDraft();
        moduleState.customerEvents = [];
        moduleState.customerSends = [];
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
    const listMode = moduleState.customerListMode || 'active';
    const activeCustomerId = text(moduleState.customerLoadedId || moduleState.customerEditor?.id);
    const currentDeal = dealById(activeDealIdFromState(requestedDealId));
    const activeCustomerDeals = activeCustomerId ? customerDeals(activeCustomerId) : [];
    const quoteSummary = activeCustomerId ? summarizeCustomerQuotes(activeCustomerId) : summarizeCustomerQuotes('');
    const requirementSummary = activeCustomerId ? summarizeCustomerRequirements(activeCustomerId) : summarizeCustomerRequirements('');
    const requirementLinkTarget = activeCustomerId
        ? customerRequirements(activeCustomerId)
            .filter((item) => item.public_slug && item.public_token)
            .sort((left, right) => new Date(right.updated_at || right.created_at || 0) - new Date(left.updated_at || left.created_at || 0))[0]
        : null;
    const requirementLink = requirementLinkTarget
        ? requirementPublicUrl(requirementLinkTarget.public_slug, requirementLinkTarget.public_token)
        : '';
    const requirementChipValue = requirementLink
        ? `<a class="ams-inline-link" href="${esc(requirementLink)}" target="_blank" rel="noopener">${esc(requirementLink)}</a>`
        : esc(requirementSummary.total_requirements);
    const customerPageTitle = salesConsole ? '客户档案' : '报价系统 / 客户跟踪';
    const customerPageSub = salesConsole
        ? '先保存客户档案，系统会自动生成客户需求链接；后续按流水线等待客户提交并继续推进。'
        : '按客户查看关联报价单、浏览记录、分享动作，并维护客户主档信息。';
    if (activeCustomerId) {
        await appendSalesActivity({
            customer_id: activeCustomerId,
            deal_id: currentDeal?.id,
            actor_type: 'sales',
            actor_id: input.user?.id,
            actor_label: input.user?.email || input.user?.id || 'sales',
            activity_type: 'page_view',
            entity_type: 'customer',
            entity_id: activeCustomerId,
            page_key: 'quote-customers',
            stage_key: 'customer_profile',
            action_label: '进入客户档案页',
            detail_json: {
                summary: customerDisplayName(moduleState.customerEditor || {}),
            },
        });
    }
    const showSalesCustomerList = !(salesConsole && moduleState.customerCreateMode && !activeCustomerId);
    const customerListSwitchActions = salesConsole
        ? `
            <div class="ams-row-actions">
                <button class="ams-btn ${listMode === 'archived' ? 'ams-btn-primary' : 'ams-btn-muted'}" type="button" id="ams-quote-customer-archive-entry">${listMode === 'archived' ? '返回主列表' : `归档列表（${archivedCustomerCount()}）`}</button>
                <button class="ams-btn ${listMode === 'deleted' ? 'ams-btn-primary' : 'ams-btn-muted'}" type="button" id="ams-quote-customer-delete-entry">${listMode === 'deleted' ? '返回主列表' : `作废列表（${deletedCustomerCount()}）`}</button>
            </div>
        `
        : '';
    const showSalesCustomerEditor = listMode === 'active' && (activeCustomerId || moduleState.customerCreateMode);
    const salesCustomerEditorMarkup = showSalesCustomerEditor
        ? `
            <section class="ams-card ams-quote-editor-panel ams-instance-editor-panel">
                <div class="ams-section-head">
                    <div>
                        <h3>${activeCustomerId ? '编辑客户档案' : '新建客户档案'}</h3>
                        <p>客户主档是后台关系视图；报价单内的 <code>customer_snapshot</code> 仍用于保留发布时的业务历史。</p>
                    </div>
                    <div class="ams-row-actions">
                        <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-customer-save">${salesConsole ? '保存并生成客户需求链接' : '保存客户档案'}</button>
                    </div>
                </div>
                ${activeCustomerId ? `
                    <div class="ams-quote-meta-grid">
                        <div class="ams-summary-chip"><strong>客户名称</strong><span>${esc(customerDisplayName(moduleState.customerEditor || {}))}</span></div>
                        ${salesConsole ? `<div class="ams-summary-chip"><strong>关联销售流程</strong><span>${esc(activeCustomerDeals.length)}</span></div>` : ''}
                        <div class="ams-summary-chip"><strong>关联需求单</strong><span>${requirementChipValue}</span></div>
                        <div class="ams-summary-chip"><strong>关联报价单</strong><span>${esc(quoteSummary.total_quotes)}</span></div>
                        <div class="ams-summary-chip"><strong>创建时间</strong><span>${esc(fmtDate(moduleState.customerEditor?.created_at))}</span></div>
                        <div class="ams-summary-chip"><strong>更新时间</strong><span>${esc(fmtDate(moduleState.customerEditor?.updated_at))}</span></div>
                    </div>
                ` : ''}
                <div class="ams-site-field-grid ams-site-field-grid-wide">
<div class="ams-field"><label>客户名称</label><input class="ams-input" data-customer-field="company_name" value="${esc(moduleState.customerEditor?.company_name)}" placeholder="Demo Customer"></div>
<div class="ams-field"><label>客户邮箱（必填，仅支持邮箱格式）</label><input class="ams-input" type="email" inputmode="email" autocomplete="email" data-customer-field="email" value="${esc(moduleState.customerEditor?.email)}" placeholder="customer@example.com"></div>
                    <div class="ams-field"><label>客户电话</label><input class="ams-input" data-customer-field="phone" value="${esc(moduleState.customerEditor?.phone)}" placeholder="+7 000 000 0000"></div>
                    <div class="ams-field"><label>国家/地区</label><input class="ams-input" data-customer-field="country" value="${esc(moduleState.customerEditor?.country)}" placeholder="Russia"></div>
                </div>
                <div class="ams-field">
                    <label>客户备注</label>
                    <textarea class="ams-textarea" rows="4" data-customer-field="notes" placeholder="记录客户来源、偏好、跟进节奏、分享要求或内部备注。">${esc(moduleState.customerEditor?.notes)}</textarea>
                </div>
            </section>
        `
        : '';

    renderSalesPageFrame(input, customerPageTitle, customerPageSub, `
        <section class="ams-card ams-hero-card ams-hero-card-compact ams-quote-instance-hero">
            <div class="ams-hero-copy">
                <p class="ams-eyebrow">${salesConsole ? 'Customer Archive' : 'Quote Customers'}</p>
                <h2>${salesConsole ? '所有销售流程都从客户建档开始。' : '客户是报价系统里的主业务对象。'}</h2>
                <p class="ams-hero-text">${salesConsole ? '客户档案页只做第一节点的事情：维护客户主档、查看当前客户下的销售流程，并从这里开始新的销售流程。' : '这里按客户聚合相关报价单、访问时间线和分享行为。报价单继续保留自己的客户快照，客户主档则作为后台的长期关系入口。'}</p>
            </div>
            <div class="ams-quick-actions ams-quote-instance-quick-actions">
                <button class="ams-quick-link" type="button" id="ams-quote-customer-new">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-address-book"></i></div>
                    <div class="ams-quick-link-body">
                        <strong>新建客户档案</strong>
<span>先建立长期客户主档，再复用客户名称和邮箱到后续需求与报价流程。</span>
                    </div>
                </button>
                ${customerListSwitchActions}
            </div>
        </section>
        ${salesConsole ? '' : customerPipelineMarkup(activeCustomerId)}
        ${salesConsole ? salesCustomerEditorMarkup : ''}
        ${showSalesCustomerList ? `
        <section class="${salesConsole ? '' : 'ams-quote-layout'}">
            <aside class="ams-card ${salesConsole ? 'ams-sales-customer-archive-panel' : 'ams-quote-list-panel'}">
                <div class="ams-field">
                    <label>搜索客户</label>
                    <input id="ams-quote-customer-search" class="ams-input" value="${esc(moduleState.customerSearch)}" placeholder="搜索公司 / 联系人 / 邮箱 / 电话">
                </div>
                    <div class="ams-quote-list ${salesConsole ? 'ams-sales-customer-archive-list' : ''}">${salesConsole ? renderSalesCustomerArchiveList(input) : renderCustomerList()}</div>
            </aside>
            ${salesConsole ? '' : `<section class="ams-card ams-quote-editor-panel ams-instance-editor-panel">
                ${
                    activeCustomerId || moduleState.customerCreateMode
                        ? `
                    <div class="ams-section-head">
                        <div>
                            <h3>${activeCustomerId ? '编辑客户档案' : '新建客户档案'}</h3>
                            <p>客户主档是后台关系视图；报价单内的 <code>customer_snapshot</code> 仍用于保留发布时的业务历史。</p>
                        </div>
                        <div class="ams-row-actions">
                            <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-customer-save">${salesConsole ? '保存并生成客户需求链接' : '保存客户档案'}</button>
                        </div>
                    </div>
                    <div class="ams-quote-meta-grid">
                        <div class="ams-summary-chip"><strong>客户名称</strong><span>${esc(customerDisplayName(moduleState.customerEditor || {}))}</span></div>
                        ${salesConsole ? `<div class="ams-summary-chip"><strong>关联销售流程</strong><span>${esc(activeCustomerDeals.length)}</span></div>` : ''}
                        <div class="ams-summary-chip"><strong>关联需求单</strong><span>${requirementChipValue}</span></div>
                        <div class="ams-summary-chip"><strong>关联报价单</strong><span>${esc(quoteSummary.total_quotes)}</span></div>
                        <div class="ams-summary-chip"><strong>创建时间</strong><span>${esc(fmtDate(moduleState.customerEditor?.created_at))}</span></div>
                        <div class="ams-summary-chip"><strong>更新时间</strong><span>${esc(fmtDate(moduleState.customerEditor?.updated_at))}</span></div>
                    </div>
                    <div class="ams-site-field-grid ams-site-field-grid-wide">
<div class="ams-field"><label>客户名称</label><input class="ams-input" data-customer-field="company_name" value="${esc(moduleState.customerEditor?.company_name)}" placeholder="Demo Customer"></div>
<div class="ams-field"><label>客户邮箱（必填，仅支持邮箱格式）</label><input class="ams-input" type="email" inputmode="email" autocomplete="email" data-customer-field="email" value="${esc(moduleState.customerEditor?.email)}" placeholder="customer@example.com"></div>
                        <div class="ams-field"><label>客户电话</label><input class="ams-input" data-customer-field="phone" value="${esc(moduleState.customerEditor?.phone)}" placeholder="+7 000 000 0000"></div>
                        <div class="ams-field"><label>国家/地区</label><input class="ams-input" data-customer-field="country" value="${esc(moduleState.customerEditor?.country)}" placeholder="Russia"></div>
                    </div>
                    <div class="ams-field">
                        <label>客户备注</label>
                        <textarea class="ams-textarea" rows="4" data-customer-field="notes" placeholder="记录客户来源、偏好、跟进节奏、分享要求或内部备注。">${esc(moduleState.customerEditor?.notes)}</textarea>
                    </div>
                    ${salesConsole && activeCustomerDeals.length
                        ? `
                            <section class="ams-quote-block">
                                <div class="ams-section-head"><div><h3>客户销售流程</h3><p>同一客户可以同时推进多条独立销售流程，点击后进入这个客户自己的流水线。</p></div></div>
                                <div class="ams-sales-inline-list">
                                    ${activeCustomerDeals.map((deal) => `<a class="ams-inline-link-card" href="${esc(customerFlowStageUrl(deal.current_stage, deal, activeCustomerId))}"><strong>${esc(text(deal.title, deal.id))}</strong><span>${esc(`${dealStageLabel(deal.current_stage)} · ${dealStatusLabel(deal.deal_status)}`)}</span></a>`).join('')}
                                </div>
                            </section>
                        `
                        : ''}
                    ${salesConsole ? '' : customerInsightsMarkup()}
                `
                        : '<div class="ams-empty">先从左侧选择一个客户，或点击上方“新建客户档案”。</div>'
                }
            </section>`}
        </section>
        ` : ''}
        ${salesConsole ? '' : customerRelationshipGraphMarkup(activeCustomerId)}
    `, {
        deal: salesConsole ? null : currentDeal,
        currentStage: currentSalesStageParam('customer_profile'),
        page: 'quote-customers',
        pipelineMode: 'overview',
        hidePageHeader: salesConsole,
    });
    bindCustomerEditor(input);
    bindSalesPageChrome(input);
}

function dealStageCardMarkup(stage, record = {}) {
    const anchor = dealStageAnchor(stage.key);
    const stageRecord = createDealStageRecord(record);
    const metaFields = stageMetaFields(stage.key);
    return `
        <article class="ams-card ams-deal-stage-card" id="${esc(anchor || stage.key)}">
            <div class="ams-section-head">
                <div>
                    <h3>${esc(stage.label)}</h3>
                    <p>${esc(stage.scope === 'deal' ? '在这里记录执行信息、付款节点和交付结果。' : '前半段流程在客户 / 需求 / 报价页完成，这里只补充推进状态与备注。')}</p>
                </div>
                <div class="ams-row-actions">
                    ${dealStageStatusPill(stageRecord.stage_status)}
                    <button class="ams-btn ams-btn-muted" type="button" data-deal-stage-activate="${esc(stage.key)}">设为进行中</button>
                    <button class="ams-btn ams-btn-primary" type="button" data-deal-stage-complete="${esc(stage.key)}">标记完成</button>
                </div>
            </div>
            <div class="ams-site-field-grid ams-site-field-grid-wide">
                <div class="ams-field">
                    <label>阶段状态</label>
                    <select class="ams-select" data-deal-stage-field="stage_status" data-stage-key="${esc(stage.key)}">
                        ${selectOptionsMarkup(DEAL_STAGE_STATUS_OPTIONS, stageRecord.stage_status)}
                    </select>
                </div>
                <div class="ams-field">
                    <label>计划时间</label>
                    <input class="ams-input" type="datetime-local" data-deal-stage-field="planned_at" data-stage-key="${esc(stage.key)}" value="${esc(datetimeLocalValue(stageRecord.planned_at))}">
                </div>
                <div class="ams-field">
                    <label>完成时间</label>
                    <input class="ams-input" type="datetime-local" data-deal-stage-field="completed_at" data-stage-key="${esc(stage.key)}" value="${esc(datetimeLocalValue(stageRecord.completed_at))}">
                </div>
            </div>
            ${stageContactFieldsMarkup(stage.key, stageRecord, { datasetAttr: 'data-deal-stage-meta' })}
            ${metaFields.length
                ? `
                    <div class="ams-site-field-grid ams-site-field-grid-wide">
                        ${metaFields.map((field) => `
                            <div class="ams-field">
                                <label>${esc(field.label)}</label>
                                <input class="ams-input" type="${esc(field.type || 'text')}" data-deal-stage-meta="${esc(field.key)}" data-stage-key="${esc(stage.key)}" value="${esc(text(stageRecord.meta?.[field.key]))}" placeholder="${esc(field.placeholder || '')}">
                            </div>
                        `).join('')}
                    </div>
                `
                : ''}
            <div class="ams-field">
                <label>阶段备注</label>
                <textarea class="ams-textarea" rows="3" data-deal-stage-field="notes" data-stage-key="${esc(stage.key)}" placeholder="记录阶段结论、异常、下一步协作事项。">${esc(stageRecord.notes)}</textarea>
            </div>
        </article>
    `;
}

function datetimeLocalValue(value = '') {
    const current = text(value);
    if (!current) return '';
    const parsed = new Date(current);
    if (Number.isNaN(parsed.getTime())) return '';
    const pad = (input) => String(input).padStart(2, '0');
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

function parseDateTimeLocal(value = '') {
    const current = text(value);
    if (!current) return '';
    const parsed = new Date(current);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}

function bindDealEditor(input) {
    const content = document.getElementById('ams-content');
    if (!content) return;
    hydrateCustomSelects(content);

    document.getElementById('ams-quote-deal-search')?.addEventListener('input', (event) => {
        moduleState.dealSearch = event.currentTarget.value || '';
        void renderQuoteDealsPage(input);
    });
    document.getElementById('ams-quote-deal-stage-filter')?.addEventListener('change', (event) => {
        moduleState.dealStageFilter = event.currentTarget.value || 'all';
        void renderQuoteDealsPage(input);
    });
    document.getElementById('ams-quote-deal-status-filter')?.addEventListener('change', (event) => {
        moduleState.dealStatusFilter = event.currentTarget.value || 'all';
        void renderQuoteDealsPage(input);
    });
    document.getElementById('ams-quote-deal-new')?.addEventListener('click', () => {
        const owner = currentSalesOwner(input.user);
        const seededCustomerId = text(readAdminPageParam('customer') || moduleState.customerLoadedId || moduleState.customerEditor?.id || moduleState.dealEditor?.customer_id);
        moduleState.dealLoadedId = '';
        moduleState.dealEditor = createDealDraft({
            customer_id: seededCustomerId,
            owner_name: owner.name,
            owner_email: owner.email,
            current_stage: seededCustomerId ? 'requirement_capture' : 'customer_profile',
        });
        moduleState.dealStageRecords = mergeDealStageRecords(moduleState.dealEditor, []);
        moduleState.dealCreateMode = true;
        void renderQuoteDealsPage(input);
    });
    content.querySelectorAll('[data-deal-edit]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await withQuoteBusy('正在加载商机...', async () => {
                    await fetchDealEditor(button.dataset.dealEdit);
                    await renderQuoteDealsPage(input);
                }, button, '正在读取商机详情、阶段记录以及关联需求 / 报价。');
            } catch (error) {
                input.showToast(error.message || '加载商机失败。', true);
            }
        });
    });
    content.querySelectorAll('[data-deal-field]').forEach((node) => {
        const field = node.dataset.dealField || '';
        const apply = () => {
            if (!field) return;
            moduleState.dealEditor[field] = field === 'next_action_due_at' ? parseDateTimeLocal(node.value) : node.value;
            if (field === 'customer_id') {
                const customer = moduleState.customers.find((item) => item.id === text(node.value));
                if (customer && !text(moduleState.dealEditor.title)) {
                    moduleState.dealEditor.title = `${customerDisplayName(customer)} / 销售项目`;
                }
                moduleState.dealStageRecords = touchDealStageRecords(moduleState.dealStageRecords, moduleState.dealEditor);
            }
        };
        node.addEventListener('input', apply);
        if (node.tagName === 'SELECT') {
            node.addEventListener('change', () => {
                apply();
                if (field === 'customer_id') void renderQuoteDealsPage(input);
            });
        }
    });
    content.querySelectorAll('[data-deal-stage-field]').forEach((node) => {
        const stageKey = node.dataset.stageKey || '';
        const field = node.dataset.dealStageField || '';
        const apply = () => {
            replaceStageRecord(stageKey, (record) => {
                if (field === 'stage_status') {
                    record.stage_status = normalizeDealStageStatus(node.value);
                    if (record.stage_status === 'completed' && !record.completed_at) record.completed_at = new Date().toISOString();
                } else if (field === 'planned_at' || field === 'completed_at') {
                    record[field] = parseDateTimeLocal(node.value);
                } else {
                    record[field] = node.value;
                }
                return record;
            });
            if (field === 'stage_status') {
                moduleState.dealEditor.current_stage = inferDealCurrentStage(moduleState.dealStageRecords, moduleState.dealEditor.current_stage);
            }
        };
        node.addEventListener('input', apply);
        node.addEventListener('change', () => {
            apply();
            if (field === 'stage_status') void renderQuoteDealsPage(input);
        });
    });
    content.querySelectorAll('[data-deal-stage-meta]').forEach((node) => {
        node.addEventListener('input', () => {
            setStageRecordMeta(node.dataset.stageKey, node.dataset.dealStageMeta, node.value);
        });
        node.addEventListener('change', () => {
            setStageRecordMeta(node.dataset.stageKey, node.dataset.dealStageMeta, node.value);
        });
    });
    content.querySelectorAll('[data-deal-stage-complete]').forEach((button) => {
        button.addEventListener('click', () => {
            setDealStageStatus(button.dataset.dealStageComplete, 'completed');
            void renderQuoteDealsPage(input);
        });
    });
    content.querySelectorAll('[data-deal-stage-activate]').forEach((button) => {
        button.addEventListener('click', () => {
            setDealStageStatus(button.dataset.dealStageActivate, 'active');
            void renderQuoteDealsPage(input);
        });
    });
    document.getElementById('ams-quote-deal-save')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '保存中...', async () => {
            try {
                const saved = await saveDealDraft(input.user, moduleState.dealEditor, {
                    stageRecords: moduleState.dealStageRecords,
                });
                input.showToast('商机已保存。');
                await fetchDealEditor(saved.id);
                await renderQuoteDealsPage(input);
            } catch (error) {
                input.showToast(error.message || '保存商机失败。', true);
            }
        });
    });
}

export async function renderQuoteDealsPage(input) {
    try {
        await ensureBaseData();
    } catch (error) {
        if (isQuoteSetupMissing(error)) {
            renderQuoteSetupRequired(input, error);
            return;
        }
        throw error;
    }

    const requestedDealId = readAdminPageParam('deal');
    if (requestedDealId && moduleState.deals.some((item) => item.id === requestedDealId) && moduleState.dealLoadedId !== requestedDealId) {
        await fetchDealEditor(requestedDealId);
    }
    const requestedCustomerId = readAdminPageParam('customer');
    if (!requestedDealId && requestedCustomerId) {
        const owner = currentSalesOwner(input.user);
        moduleState.dealLoadedId = '';
        moduleState.dealEditor = createDealDraft({
            customer_id: requestedCustomerId,
            owner_name: owner.name,
            owner_email: owner.email,
            current_stage: 'requirement_capture',
        });
        moduleState.dealStageRecords = mergeDealStageRecords(moduleState.dealEditor, []);
        moduleState.dealCreateMode = true;
        clearAdminPageParams('customer');
    }
    if (!moduleState.dealEditor) {
        const firstDeal = filteredDeals()[0] || moduleState.deals[0] || null;
        if (firstDeal?.id) await fetchDealEditor(firstDeal.id);
        else {
            const owner = currentSalesOwner(input.user);
            moduleState.dealEditor = createDealDraft({
                owner_name: owner.name,
                owner_email: owner.email,
                current_stage: 'customer_profile',
            });
            moduleState.dealStageRecords = mergeDealStageRecords(moduleState.dealEditor, []);
            moduleState.dealCreateMode = true;
        }
    }
    const deal = moduleState.dealEditor || createDealDraft();
    const activeDealId = text(moduleState.dealLoadedId || deal.id);
    const currentCustomer = moduleState.customers.find((item) => item.id === deal.customer_id) || null;
    const requirements = activeDealId ? dealRequirements(activeDealId) : [];
    const quotes = activeDealId ? dealQuotes(activeDealId) : [];
    moduleState.dealStageRecords = touchDealStageRecords(moduleState.dealStageRecords, deal);

    renderSalesPageFrame(input, '销售商机 / 项目推进', '围绕单条商机推进合同、付款、排产、物流、部署和运维支持。', `
        <section class="ams-card ams-hero-card ams-hero-card-compact ams-quote-instance-hero">
            <div class="ams-hero-copy">
                <p class="ams-eyebrow">Deal Board</p>
                <h2>一条商机就是一条完整销售链路。</h2>
                <p class="ams-hero-text">客户可以同时挂多条独立商机。需求、报价只绑定到 deal，合同到运维的执行状态也在这里持续沉淀。</p>
            </div>
            <div class="ams-quick-actions ams-quote-instance-quick-actions">
                <button class="ams-quick-link" type="button" id="ams-quote-deal-new">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-diagram-project"></i></div>
                    <div class="ams-quick-link-body">
                        <strong>新建商机</strong>
                        <span>从客户主档开始拆一条独立销售链路，后续需求、报价、合同、物流都挂在这里。</span>
                    </div>
                </button>
            </div>
        </section>
        <section class="ams-quote-layout">
            <aside class="ams-card ams-quote-list-panel">
                <div class="ams-section-head"><div><h3>商机列表</h3><p>共 ${filteredDeals().length} 条商机</p></div></div>
                <div class="ams-site-field-grid ams-site-field-grid-wide">
                    <div class="ams-field">
                        <label>搜索商机</label>
                        <input id="ams-quote-deal-search" class="ams-input" value="${esc(moduleState.dealSearch)}" placeholder="搜索客户 / 商机标题 / 负责人 / 下一动作">
                    </div>
                    <div class="ams-field">
                        <label>阶段筛选</label>
                        <select id="ams-quote-deal-stage-filter" class="ams-select">
                            <option value="all" ${moduleState.dealStageFilter === 'all' ? 'selected' : ''}>全部阶段</option>
                            ${DEAL_STAGE_DEFINITIONS.map((stage) => `<option value="${esc(stage.key)}" ${moduleState.dealStageFilter === stage.key ? 'selected' : ''}>${esc(stage.label)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="ams-field">
                        <label>状态筛选</label>
                        <select id="ams-quote-deal-status-filter" class="ams-select">
                            <option value="all" ${moduleState.dealStatusFilter === 'all' ? 'selected' : ''}>全部状态</option>
                            ${selectOptionsMarkup(DEAL_STATUS_OPTIONS, moduleState.dealStatusFilter)}
                        </select>
                    </div>
                </div>
                <div class="ams-quote-list">${renderDealList()}</div>
            </aside>
            <section class="ams-card ams-quote-editor-panel ams-instance-editor-panel">
                <div class="ams-section-head">
                    <div>
                        <h3>${activeDealId ? '编辑商机项目' : '新建商机项目'}</h3>
                        <p>客户、主需求、主报价和后半段交付阶段都在这里统一管理。</p>
                    </div>
                    <div class="ams-row-actions">
                        <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-deal-save">保存商机</button>
                    </div>
                </div>
                <div class="ams-quote-meta-grid">
                    <div class="ams-summary-chip"><strong>客户</strong><span>${esc(customerDisplayName(currentCustomer || {}))}</span></div>
                    <div class="ams-summary-chip"><strong>当前阶段</strong><span>${esc(dealStageLabel(deal.current_stage))}</span></div>
                    <div class="ams-summary-chip"><strong>商机状态</strong><span>${dealStatusPill(deal.deal_status)}</span></div>
                    <div class="ams-summary-chip"><strong>需求单</strong><span>${esc(requirements.length)}</span></div>
                    <div class="ams-summary-chip"><strong>报价单</strong><span>${esc(quotes.length)}</span></div>
                </div>
                <div class="ams-site-field-grid ams-site-field-grid-wide">
                    <div class="ams-field">
                        <label>绑定客户</label>
                        <select class="ams-select" data-deal-field="customer_id">
                            <option value="">请选择客户档案</option>
                            ${moduleState.customers.filter((item) => item.is_active !== false && !item.is_deleted).map((customer) => `<option value="${esc(customer.id)}" ${deal.customer_id === customer.id ? 'selected' : ''}>${esc(customerDisplayName(customer))}</option>`).join('')}
                        </select>
                    </div>
                    <div class="ams-field"><label>商机标题</label><input class="ams-input" data-deal-field="title" value="${esc(deal.title)}" placeholder="例如：俄罗斯 5MW 矿电一体化项目"></div>
                    <div class="ams-field">
                        <label>商机状态</label>
                        <select class="ams-select" data-deal-field="deal_status">${selectOptionsMarkup(DEAL_STATUS_OPTIONS, deal.deal_status)}</select>
                    </div>
                    <div class="ams-field"><label>负责人</label><input class="ams-input" data-deal-field="owner_name" value="${esc(deal.owner_name)}" placeholder="当前销售"></div>
                    <div class="ams-field"><label>负责人邮箱</label><input class="ams-input" data-deal-field="owner_email" value="${esc(deal.owner_email)}" placeholder="sales@gasgx.com"></div>
                    <div class="ams-field"><label>下一动作截止</label><input class="ams-input" type="datetime-local" data-deal-field="next_action_due_at" value="${esc(datetimeLocalValue(deal.next_action_due_at))}"></div>
                </div>
                <div class="ams-field">
                    <label>商机摘要</label>
                    <textarea class="ams-textarea" rows="3" data-deal-field="summary" placeholder="记录项目背景、采购范围、主要决策条件。">${esc(deal.summary)}</textarea>
                </div>
                <div class="ams-field">
                    <label>下一动作</label>
                    <textarea class="ams-textarea" rows="2" data-deal-field="next_action" placeholder="记录下一步必须推进的动作和责任人。">${esc(deal.next_action)}</textarea>
                </div>
                <div class="ams-site-field-grid ams-site-field-grid-wide">
                    <div class="ams-field">
                        <label>主需求单</label>
                        <select class="ams-select" data-deal-field="primary_requirement_id">
                            <option value="">未锁定</option>
                            ${(deal.customer_id ? customerRequirements(deal.customer_id) : []).map((requirement) => `<option value="${esc(requirement.id)}" ${deal.primary_requirement_id === requirement.id ? 'selected' : ''}>${esc(requirementDisplayName(requirement))}</option>`).join('')}
                        </select>
                    </div>
                    <div class="ams-field">
                        <label>主报价单</label>
                        <select class="ams-select" data-deal-field="primary_instance_id">
                            <option value="">未锁定</option>
                            ${(deal.customer_id ? customerQuotes(deal.customer_id) : []).map((instance) => `<option value="${esc(instance.id)}" ${deal.primary_instance_id === instance.id ? 'selected' : ''}>${esc(text(instance.customer_name || instance.public_slug, instance.id))}</option>`).join('')}
                        </select>
                    </div>
                    <div class="ams-field">
                        <label>丢单 / 取消原因</label>
                        <input class="ams-input" data-deal-field="lost_reason" value="${esc(deal.lost_reason)}" placeholder="如暂停 / 丢单 / 取消，请记录原因">
                    </div>
                </div>
                <section class="ams-quote-block">
                    <div class="ams-section-head"><div><h3>阶段执行卡片</h3><p>从合同到运维的执行信息全部落在这里；前半段也可补充负责人和备注。</p></div></div>
                    <div class="ams-deal-stage-grid">
                        ${DEAL_STAGE_DEFINITIONS.map((stage) => dealStageCardMarkup(stage, stageRecordByKey(stage.key, moduleState.dealStageRecords))).join('')}
                    </div>
                </section>
            </section>
        </section>
    `, {
        deal,
        currentStage: deal.current_stage || 'contract_signed',
        page: 'quote-deals',
    });
    bindDealEditor(input);
    bindSalesPageChrome(input);
}

function currentSalesStageParam(fallback = 'requirement_capture') {
    return normalizeDealStageKey(readAdminPageParam('stage') || fallback);
}

function stagePageTitle(stageKey = '') {
    const stage = dealStageDefinition(stageKey);
    if (stage.key === 'customer_profile') return '总流水线 · 客户建档';
    return `总流水线 · ${stage.label}`;
}

function stagePageSub(stageKey = '') {
    const stage = dealStageDefinition(stageKey);
    if (stage.key === 'customer_profile') return '总流水线模式：客户建档是第一节点，先建立客户，再从客户档案创建销售线。';
    return `总流水线模式：${stage.label} 节点只处理当前阶段事项，不在中途新开销售线。`;
}

function salesOverviewStageGuideLanes() {
    return [
        {
            key: 'lane-intake',
            phase: '第一阶段',
            title: '客户与需求',
            summary: '从客户建档到需求锁定，先把意向和边界确认清楚。',
            stages: DEAL_STAGE_DEFINITIONS.slice(0, 3),
        },
        {
            key: 'lane-quote',
            phase: '第二阶段',
            title: '报价与签约',
            summary: '形成报价草稿、确认报价，并推进到合同签署。',
            stages: DEAL_STAGE_DEFINITIONS.slice(3, 6),
        },
        {
            key: 'lane-delivery',
            phase: '第三阶段',
            title: '交付执行',
            summary: '围绕定金、排产、验收和尾款，控制交付节奏。',
            stages: DEAL_STAGE_DEFINITIONS.slice(6, 10),
        },
        {
            key: 'lane-service',
            phase: '第四阶段',
            title: '物流与服务',
            summary: '物流到场、部署交付，再进入长期运维支持。',
            stages: DEAL_STAGE_DEFINITIONS.slice(10),
        },
    ];
}

const DASHBOARD_RANGE_OPTIONS = Object.freeze([
    { value: 'month', label: '本月' },
    { value: 'quarter', label: '本季度' },
    { value: 'year', label: '本年' },
]);

function startOfDashboardRange(range = 'quarter', baseDate = new Date()) {
    const current = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
    if (range === 'month') return new Date(current.getFullYear(), current.getMonth(), 1);
    if (range === 'year') return new Date(current.getFullYear(), 0, 1);
    return new Date(current.getFullYear(), Math.floor(current.getMonth() / 3) * 3, 1);
}

function endOfDashboardRange(range = 'quarter', baseDate = new Date()) {
    const start = startOfDashboardRange(range, baseDate);
    if (range === 'month') return new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
    if (range === 'year') return new Date(start.getFullYear() + 1, 0, 0, 23, 59, 59, 999);
    return new Date(start.getFullYear(), start.getMonth() + 3, 0, 23, 59, 59, 999);
}

function dateMs(value = '') {
    const stamp = Date.parse(text(value));
    return Number.isFinite(stamp) ? stamp : 0;
}

function fmtCompactNumber(value = 0) {
    const number = safeNumber(value, 0);
    if (Math.abs(number) >= 100000000) return `${(number / 100000000).toFixed(1)}亿`;
    if (Math.abs(number) >= 10000) return `${(number / 10000).toFixed(1)}万`;
    return number.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
}

function fmtPercent(value = 0, digits = 0) {
    return `${(safeNumber(value, 0) * 100).toFixed(digits)}%`;
}

function dashboardPeriodLabel(range = 'quarter') {
    const now = new Date();
    if (range === 'month') return `${now.getMonth() + 1} 月`;
    if (range === 'year') return `${now.getFullYear()} 年`;
    return `${Math.floor(now.getMonth() / 3) + 1} 季度`;
}

function dashboardDealRecords(deal = null) {
    if (!deal?.id) return [];
    const existing = text(moduleState.dealLoadedId) === text(deal.id)
        ? moduleState.dealStageRecords
        : [];
    return existing.length ? mergeDealStageRecords(deal, existing) : mergeDealStageRecords(deal, []);
}

function dashboardRecordByStage(deal = null, stageKey = '') {
    return stageRecordByKey(stageKey, dashboardDealRecords(deal)) || createDealStageRecord({ stage_key: stageKey });
}

function dashboardDealAnchorDate(deal = null) {
    if (!deal?.id) return 0;
    const contractRecord = dashboardRecordByStage(deal, 'contract_signed');
    return dateMs(stageMetaValue(contractRecord, 'contract_date'))
        || dateMs(contractRecord.completed_at)
        || dateMs(deal.updated_at)
        || dateMs(deal.created_at);
}

function dashboardDealsInRange(deals = [], range = 'quarter', now = new Date()) {
    const start = startOfDashboardRange(range, now).getTime();
    const end = endOfDashboardRange(range, now).getTime();
    return deals.filter((deal) => {
        const anchor = dashboardDealAnchorDate(deal);
        return anchor >= start && anchor <= end;
    });
}

function dashboardPreviousDeals(deals = [], range = 'quarter', now = new Date()) {
    const currentStart = startOfDashboardRange(range, now);
    const previousEnd = new Date(currentStart.getTime() - 1);
    const previousStart = startOfDashboardRange(range, previousEnd);
    return deals.filter((deal) => {
        const anchor = dashboardDealAnchorDate(deal);
        return anchor >= previousStart.getTime() && anchor <= previousEnd.getTime();
    });
}

function dashboardRevenueForDeals(deals = []) {
    return deals.reduce((total, deal) => {
        const contractRecord = dashboardRecordByStage(deal, 'contract_signed');
        return total + safeNumber(stageMetaValue(contractRecord, 'contract_amount'), 0);
    }, 0);
}

function dashboardCashForDeals(deals = []) {
    return deals.reduce((total, deal) => {
        const depositRecord = dashboardRecordByStage(deal, 'deposit_paid');
        const balanceRecord = dashboardRecordByStage(deal, 'balance_confirmed');
        return total
            + safeNumber(stageMetaValue(depositRecord, 'deposit_received'), 0)
            + safeNumber(stageMetaValue(balanceRecord, 'balance_confirmed_amount'), 0);
    }, 0);
}

function dashboardStageIndex(stageKey = '') {
    return Math.max(0, stageOrderIndex(stageKey));
}

function dashboardDelta(current = 0, previous = 0) {
    if (!previous && !current) return 0;
    if (!previous) return current > 0 ? 1 : 0;
    return (current - previous) / previous;
}

function dashboardToneForRate(rate = 0, warningThreshold = 0.8) {
    if (rate < warningThreshold) return 'is-danger';
    if (rate < 1) return 'is-warning';
    return 'is-good';
}

function dashboardTopRegions(deals = []) {
    const map = new Map();
    deals.forEach((deal) => {
        const customer = moduleState.customers.find((item) => item.id === text(deal.customer_id)) || {};
        const key = text(customer.country, '未标注地区');
        map.set(key, safeNumber(map.get(key), 0) + 1);
    });
    return [...map.entries()]
        .map(([label, value]) => ({ label, value }))
        .sort((left, right) => right.value - left.value)
        .slice(0, 5);
}

function dashboardTopProducts(deals = []) {
    const map = new Map();
    deals.forEach((deal) => {
        dealQuotes(deal.id).forEach((quote) => {
            const key = text(productLabelById(quote.product_id), '未绑定产品');
            map.set(key, safeNumber(map.get(key), 0) + 1);
        });
    });
    return [...map.entries()]
        .map(([label, value]) => ({ label, value }))
        .sort((left, right) => right.value - left.value)
        .slice(0, 5);
}

function dashboardTopChannels(deals = []) {
    const map = new Map();
    deals.forEach((deal) => {
        dealRequirements(deal.id).forEach((requirement) => {
            const key = optionLabel(REQUIREMENT_SELECT_OPTIONS.source_channel, requirement.answers?.source_channel || 'other');
            map.set(key, safeNumber(map.get(key), 0) + 1);
        });
    });
    return [...map.entries()]
        .map(([label, value]) => ({ label, value }))
        .sort((left, right) => right.value - left.value)
        .slice(0, 5);
}

function dashboardOwnerRanking(deals = []) {
    const map = new Map();
    deals.forEach((deal) => {
        const key = text(deal.owner_name || deal.owner_email, '未分配');
        const current = map.get(key) || { label: key, deals: 0, revenue: 0 };
        current.deals += 1;
        current.revenue += dashboardRevenueForDeals([deal]);
        map.set(key, current);
    });
    return [...map.values()]
        .sort((left, right) => right.revenue - left.revenue || right.deals - left.deals)
        .slice(0, 5);
}

function dashboardTrendBuckets(range = 'quarter', deals = [], now = new Date()) {
    const bucketCount = range === 'year' ? 12 : range === 'month' ? 4 : 3;
    const labels = [];
    const items = [];
    const rangeStart = startOfDashboardRange(range, now);
    for (let index = 0; index < bucketCount; index += 1) {
        let bucketStart;
        let bucketEnd;
        if (range === 'year') {
            bucketStart = new Date(rangeStart.getFullYear(), index, 1);
            bucketEnd = new Date(rangeStart.getFullYear(), index + 1, 0, 23, 59, 59, 999);
            labels.push(`${index + 1}月`);
        } else if (range === 'month') {
            bucketStart = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), index * 7 + 1);
            bucketEnd = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), (index + 1) * 7, 23, 59, 59, 999);
            if (index === bucketCount - 1) bucketEnd = endOfDashboardRange(range, now);
            labels.push(`W${index + 1}`);
        } else {
            bucketStart = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + index, 1);
            bucketEnd = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + index + 1, 0, 23, 59, 59, 999);
            labels.push(`${bucketStart.getMonth() + 1}月`);
        }
        const bucketDeals = deals.filter((deal) => {
            const anchor = dashboardDealAnchorDate(deal);
            return anchor >= bucketStart.getTime() && anchor <= bucketEnd.getTime();
        });
        items.push({
            label: labels[index],
            revenue: dashboardRevenueForDeals(bucketDeals),
            deals: bucketDeals.length,
        });
    }
    return items;
}

function dashboardSummarySentence(metrics = {}) {
    const direction = metrics.revenueDelta >= 0 ? '增长' : '下滑';
    const leadRegion = metrics.topRegions[0]?.label || '暂无明显区域';
    const weakestStage = metrics.funnelDropLabel || '漏斗暂未识别明显短板';
    const avgTicketDirection = metrics.avgOrderDelta >= 0 ? '回升' : '下降';
    return `${dashboardPeriodLabel(metrics.range)}销售额${direction}${fmtPercent(Math.abs(metrics.revenueDelta), 0)}，主要由${leadRegion}带动；客单值${avgTicketDirection}${fmtPercent(Math.abs(metrics.avgOrderDelta), 0)}，当前最需要关注 ${weakestStage}。`;
}

function buildDashboardMetrics(input = null) {
    const now = new Date();
    const range = DASHBOARD_RANGE_OPTIONS.some((item) => item.value === moduleState.dashboardRange) ? moduleState.dashboardRange : 'quarter';
    const allDeals = visibleDealsForInput(input, { includeClosed: true, includeArchived: false });
    const currentDeals = dashboardDealsInRange(allDeals, range, now);
    const previousDeals = dashboardPreviousDeals(allDeals, range, now);
    const revenue = dashboardRevenueForDeals(currentDeals);
    const previousRevenue = dashboardRevenueForDeals(previousDeals);
    const orderCount = currentDeals.length;
    const previousOrderCount = previousDeals.length;
    const avgOrder = orderCount ? revenue / orderCount : 0;
    const previousAvgOrder = previousOrderCount ? previousRevenue / previousOrderCount : 0;
    const cash = dashboardCashForDeals(currentDeals);
    const quotedDeals = currentDeals.filter((deal) => dashboardStageIndex(deal.current_stage) >= dashboardStageIndex('quote_draft')).length;
    const signedDeals = currentDeals.filter((deal) => dashboardStageIndex(deal.current_stage) >= dashboardStageIndex('contract_signed')).length;
    const conversionRate = quotedDeals ? signedDeals / quotedDeals : 0;
    const daysPassed = Math.max(1, Math.ceil((now.getTime() - startOfDashboardRange(range, now).getTime()) / 86400000));
    const totalDays = Math.max(daysPassed, Math.ceil((endOfDashboardRange(range, now).getTime() - startOfDashboardRange(range, now).getTime()) / 86400000));
    const timeProgress = Math.min(1, daysPassed / totalDays);
    const stagePressure = timeProgress ? conversionRate / timeProgress : conversionRate;
    const activePipelineDeals = visibleDealsForInput(input, { includeClosed: false, includeArchived: false });
    const topRegions = dashboardTopRegions(currentDeals);
    const topProducts = dashboardTopProducts(currentDeals);
    const topChannels = dashboardTopChannels(currentDeals);
    const ownerRanking = dashboardOwnerRanking(currentDeals);
    const trend = dashboardTrendBuckets(range, currentDeals, now);
    const funnel = [
        { label: '线索', value: new Set(currentDeals.map((deal) => text(deal.customer_id)).filter(Boolean)).size || 0 },
        { label: '需求', value: currentDeals.filter((deal) => dealRequirements(deal.id).length > 0).length },
        { label: '报价', value: currentDeals.filter((deal) => dealQuotes(deal.id).length > 0).length },
        { label: '签约', value: signedDeals },
        { label: '回款', value: currentDeals.filter((deal) => dashboardCashForDeals([deal]) > 0).length },
    ];
    let funnelDropLabel = '漏斗结构健康';
    let largestDrop = 0;
    for (let index = 1; index < funnel.length; index += 1) {
        const previous = funnel[index - 1].value;
        const current = funnel[index].value;
        const drop = previous > 0 ? (previous - current) / previous : 0;
        if (drop > largestDrop) {
            largestDrop = drop;
            funnelDropLabel = `${funnel[index - 1].label} → ${funnel[index].label} 流失 ${fmtPercent(drop, 0)}`;
        }
    }
    const newCustomers = currentDeals.filter((deal) => {
        const customer = moduleState.customers.find((item) => item.id === text(deal.customer_id));
        const createdMs = dateMs(customer?.created_at);
        return createdMs >= startOfDashboardRange(range, now).getTime();
    }).length;
    const customerMix = {
        newCount: newCustomers,
        oldCount: Math.max(0, currentDeals.length - newCustomers),
    };
    return {
        range,
        revenue,
        previousRevenue,
        revenueDelta: dashboardDelta(revenue, previousRevenue),
        orderCount,
        orderDelta: dashboardDelta(orderCount, previousOrderCount),
        avgOrder,
        avgOrderDelta: dashboardDelta(avgOrder, previousAvgOrder),
        cash,
        cashRate: revenue ? cash / revenue : 0,
        conversionRate,
        timeProgress,
        stagePressure,
        activePipelineDeals: activePipelineDeals.length,
        pausedDeals: activePipelineDeals.filter((deal) => normalizeDealStatus(deal.deal_status) === 'paused').length,
        topRegions,
        topProducts,
        topChannels,
        ownerRanking,
        trend,
        funnel,
        funnelDropLabel,
        customerMix,
        summary: '',
    };
}

function dashboardListMarkup(items = [], options = {}) {
    if (!items.length) return '<div class="ams-empty">当前筛选范围内还没有足够数据。</div>';
    const total = Math.max(1, items.reduce((sum, item) => sum + safeNumber(item.value, 0), 0));
    return items.map((item, index) => `
        <div class="ams-dashboard-rank-row">
            <div class="ams-dashboard-rank-main">
                <span class="ams-dashboard-rank-index">${esc(index + 1)}</span>
                <strong>${esc(item.label)}</strong>
            </div>
            <div class="ams-dashboard-rank-meta">
                <span>${esc(item.value)}</span>
                <em style="--dash-ratio:${Math.max(0.08, safeNumber(item.value, 0) / total)}"></em>
            </div>
        </div>
    `).join('');
}

function dashboardOwnerMarkup(items = []) {
    if (!items.length) return '<div class="ams-empty">暂无销售负责人数据。</div>';
    return items.map((item, index) => `
        <div class="ams-dashboard-owner-row">
            <div>
                <span class="ams-dashboard-rank-index">${esc(index + 1)}</span>
                <strong>${esc(item.label)}</strong>
            </div>
            <div class="ams-dashboard-owner-stats">
                <span>${esc(`${item.deals} 单`)}</span>
                <em>${esc(`¥${fmtCompactNumber(item.revenue)}`)}</em>
            </div>
        </div>
    `).join('');
}

function bindSalesDashboardEvents(input) {
    document.querySelectorAll('[data-dashboard-range]').forEach((button) => {
        if (button.dataset.bound === '1') return;
        button.dataset.bound = '1';
        button.addEventListener('click', () => {
            const nextRange = text(button.dataset.dashboardRange);
            if (!DASHBOARD_RANGE_OPTIONS.some((item) => item.value === nextRange)) return;
            if (moduleState.dashboardRange === nextRange) return;
            moduleState.dashboardRange = nextRange;
            void renderQuoteSalesDashboardPage(input);
        });
    });
}

function visibleStageDeals(stageKey = '', input = null, options = {}) {
    const query = text(options.query ?? moduleState.dealSearch).toLowerCase();
    const customerId = text(options.customerId);
    const includeClosed = options.includeClosed === true;
    return visibleDealsForInput(input, { includeClosed, includeArchived: false })
        .filter((deal) => normalizeDealStageKey(deal.current_stage) === normalizeDealStageKey(stageKey))
        .filter((deal) => !customerId || text(deal.customer_id) === customerId)
        .filter((deal) => {
            if (!query) return true;
            const customer = moduleState.customers.find((item) => item.id === deal.customer_id);
            return [
                deal.title,
                deal.summary,
                deal.next_action,
                deal.owner_name,
                deal.owner_email,
                customerDisplayName(customer || {}),
            ].some((value) => text(value).toLowerCase().includes(query));
        })
        .sort((left, right) => text(right.updated_at || right.created_at).localeCompare(text(left.updated_at || left.created_at)));
}

function customerFlowDeals(customerId = '', input = null) {
    return visibleDealsForInput(input, { includeClosed: true, includeArchived: false })
        .filter((deal) => text(deal.customer_id) === text(customerId))
        .sort((left, right) => text(right.updated_at || right.created_at).localeCompare(text(left.updated_at || left.created_at)));
}

async function ensureCustomerEditorForSalesFlow(customerId = '') {
    if (!customerId) return createCustomerDraft();
    if (moduleState.customerLoadedId !== customerId) {
        await fetchCustomerEditor(customerId);
    }
    return moduleState.customerEditor || createCustomerDraft(moduleState.customers.find((item) => item.id === customerId) || {});
}

async function ensureRequirementEditorForDeal(deal = null, user = null) {
    const activeDeal = deal || dealById(activeDealIdFromState());
    const activeCustomer = moduleState.customers.find((item) => item.id === text(activeDeal?.customer_id)) || {};
    const activeCustomerEmail = normalizedCustomerEmail(activeCustomer.email);
    if (!activeDeal?.id) {
        moduleState.requirementLoadedId = '';
        moduleState.requirementEditor = createRequirementDraft();
        return moduleState.requirementEditor;
    }
    const requirementId = text(activeDeal.primary_requirement_id || dealRequirements(activeDeal.id)[0]?.id);
    if (requirementId) {
        const existingDraft = createRequirementDraft(moduleState.requirementEditor || {});
        await fetchRequirementEditor(requirementId);
        const latestAnswers = normalizeRequirementAnswers(moduleState.requirementEditor?.answers);
        const localAnswers = normalizeRequirementAnswers(existingDraft.answers);
        moduleState.requirementEditor = createRequirementDraft({
            ...moduleState.requirementEditor,
            answers: {
                ...latestAnswers,
                communication_note_draft: text(localAnswers.communication_note_draft),
            },
            deal_id: activeDeal.id,
            customer_id: activeDeal.customer_id,
            requester_email: activeCustomerEmail || moduleState.requirementEditor?.requester_email,
        });
        if (
            requirementStatusReadyForQuote(moduleState.requirementEditor?.status)
            && stageOrderIndex(activeDeal.current_stage) <= stageOrderIndex('requirement_capture')
        ) {
            await saveAndAdvanceDeal(user, {
                id: activeDeal.id,
                customer_id: activeDeal.customer_id,
                primary_requirement_id: moduleState.requirementEditor.id,
            }, ['customer_profile', 'requirement_capture'], 'requirement_confirmed');
            const syncedDeal = dealById(activeDeal.id);
            if (syncedDeal) moduleState.dealEditor = createDealDraft(syncedDeal);
        }
        return moduleState.requirementEditor;
    }
    moduleState.requirementLoadedId = '';
    moduleState.requirementEditor = createRequirementDraft({
        deal_id: activeDeal.id,
        customer_id: activeDeal.customer_id,
        title: `${customerDisplayName(moduleState.customers.find((item) => item.id === activeDeal.customer_id) || {})} / ${requirementTypeLabel('integrated_mining_power')}`,
        requester_email: activeCustomerEmail,
    });
    return moduleState.requirementEditor;
}

async function ensureInstanceEditorForDeal(deal = null) {
    const activeDeal = deal || dealById(activeDealIdFromState());
    const customer = moduleState.customers.find((item) => item.id === text(activeDeal?.customer_id)) || {};
    const customerEmail = normalizedCustomerEmail(customer.email);
    if (!activeDeal?.id) {
        moduleState.instanceLoadedId = '';
        moduleState.instanceEditor = createInstanceDraft();
        return moduleState.instanceEditor;
    }
    const instanceId = text(activeDeal.primary_instance_id || dealQuotes(activeDeal.id)[0]?.id);
    if (instanceId) {
        if (moduleState.instanceLoadedId !== instanceId) await fetchInstanceEditor(instanceId);
        moduleState.instanceEditor = createInstanceDraft({
            ...moduleState.instanceEditor,
            deal_id: activeDeal.id,
            customer_id: text(moduleState.instanceEditor?.customer_id || activeDeal.customer_id),
            receiver_email: customerEmail || moduleState.instanceEditor?.receiver_email,
        });
        moduleState.instanceEditor.share_config = normalizeShareConfig(moduleState.instanceEditor.share_config, {
            recipient_email: customerEmail || moduleState.instanceEditor?.share_config?.recipient_email,
        });
        return moduleState.instanceEditor;
    }
    moduleState.instanceLoadedId = '';
    moduleState.instanceEditor = createInstanceDraft({
        deal_id: activeDeal.id,
        customer_id: activeDeal.customer_id,
        customer_name: customer.company_name,
        receiver_name: customer.contact_name,
        receiver_email: customerEmail,
        customer_phone: customer.phone,
        customer_country: customer.country,
        customer_notes: customer.notes,
    });
    return moduleState.instanceEditor;
}

function pipelineListCardMarkup(stageKey = '', deal = {}, options = {}) {
    const customer = moduleState.customers.find((item) => item.id === deal.customer_id);
    const selected = text(options.selectedDealId) === text(deal.id);
    const customerFlow = options.customerFlow === true;
    const unread = customerHasUnreadActivityInStage(deal.customer_id, stageKey);
    const stageUrl = customerFlow
        ? customerFlowStageUrl(stageKey, deal, deal.customer_id)
        : adminPageUrl('quote-pipeline', { stage: normalizeDealStageKey(stageKey), deal: deal.id });
    const flowUrl = customerFlowStageUrl(stageKey, deal, deal.customer_id);
    const primaryLabel = customerFlow
        ? text(deal.title, '未命名流程')
        : text(customerDisplayName(customer || {}), text(deal.title, '未命名客户'));
    const secondaryLabel = customerFlow
        ? `${dealStageLabel(deal.current_stage)} · ${dealStatusLabel(deal.deal_status)}`
        : text(deal.title, '未命名流程');
    const currentStageLabel = dealStageLabel(deal.current_stage);
    const currentStageTone = normalizeDealStageKey(deal.current_stage) === normalizeDealStageKey(stageKey) ? 'warning' : 'draft';
    const stagePill = `<span class="ams-status-pill ams-status-${currentStageTone}">${esc(currentStageLabel)}</span>`;
    const statusMeta = normalizeDealStatus(deal.deal_status) === 'active' ? '' : ` · ${dealStatusLabel(deal.deal_status)}`;
    return `
        <article class="ams-customer-list-card-shell ${selected ? 'is-active' : ''}">
            <button class="ams-quote-list-card ${selected ? 'is-active' : ''} ${unread ? 'has-activity-dot' : ''}" type="button" data-sales-stage-select="${esc(stageUrl)}">
                ${unread ? '<span class="ams-activity-dot" aria-hidden="true"></span>' : ''}
                <strong>${esc(primaryLabel)}</strong>
                <span>${esc(secondaryLabel)}</span>
                <span class="ams-quote-inline-submeta">${esc(text(deal.summary || deal.next_action, '待补充阶段说明'))}</span>
                <em>${stagePill} <span class="ams-quote-inline-meta">${esc(`${currentStageLabel}${statusMeta} · 更新于 ${fmtDate(deal.updated_at || deal.created_at)}`)}</span></em>
            </button>
            ${
                customerFlow
                    ? ''
                    : `
                        <div class="ams-quote-list-card-actions">
                            <button class="ams-btn ams-btn-muted" type="button" data-sales-stage-archive="${esc(deal.id)}">归档</button>
                            <button class="ams-btn ams-btn-danger" type="button" data-sales-stage-void="${esc(deal.id)}">作废</button>
                        </div>
                    `
            }
        </article>
    `;
}

function salesStageDateLabel(value = '') {
    return text(value) ? fmtDate(value) : '--';
}

function salesStageStatusRecord(stageKey = '', deal = null) {
    return stageRecordByKey(stageKey, moduleState.dealStageRecords) || createDealStageRecord({
        deal_id: deal?.id,
        stage_key: stageKey,
        stage_status: normalizeDealStageKey(deal?.current_stage) === normalizeDealStageKey(stageKey) ? 'active' : 'pending',
        owner_name: deal?.owner_name,
        owner_email: deal?.owner_email,
    });
}

function salesStageSideCardMarkup(title = '', eyebrow = '', bodyMarkup = '', options = {}) {
    const className = ['ams-card', 'ams-sales-stage-side-card', text(options.className)].filter(Boolean).join(' ');
    return `
        <section class="${className}">
            <div class="ams-sales-stage-side-card-head">
                ${eyebrow ? `<span>${esc(eyebrow)}</span>` : ''}
                <strong>${esc(title)}</strong>
            </div>
            <div class="ams-sales-stage-side-card-body">
                ${bodyMarkup}
            </div>
        </section>
    `;
}

function salesStageSideItemMarkup(label = '', valueMarkup = '--', hint = '') {
    return `
        <div class="ams-sales-stage-side-item">
            <span>${esc(label)}</span>
            <strong>${valueMarkup || '--'}</strong>
            ${hint ? `<small>${esc(hint)}</small>` : ''}
        </div>
    `;
}

function salesStageSideTextItemMarkup(label = '', value = '--', hint = '') {
    return salesStageSideItemMarkup(label, esc(text(value, '--')), hint);
}

function salesStageActionGroupMarkup(title = '', description = '', bodyMarkup = '') {
    return `
        <section class="ams-sales-stage-side-group">
            <div class="ams-sales-stage-side-group-head">
                <strong>${esc(title)}</strong>
                ${description ? `<p>${esc(description)}</p>` : ''}
            </div>
            ${bodyMarkup ? `<div class="ams-sales-stage-side-group-body">${bodyMarkup}</div>` : ''}
        </section>
    `;
}

function salesStageActionCardMarkup(summary = '', groupsMarkup = '') {
    return salesStageSideCardMarkup('操作区', 'Actions', `
        ${summary ? `<p class="ams-sales-stage-side-lead">${esc(summary)}</p>` : ''}
        <div class="ams-sales-stage-side-groups">
            ${groupsMarkup}
        </div>
    `, {
        className: 'ams-sales-stage-side-card-actions',
    });
}

function salesStageStatusCardMarkup(stageKey = '', deal = null) {
    const stage = dealStageDefinition(stageKey);
    const record = salesStageStatusRecord(stage.key, deal);
    const requirement = createRequirementDraft(moduleState.requirementEditor || {});
    const instance = createInstanceDraft(moduleState.instanceEditor || {});
    const items = [
        salesStageSideTextItemMarkup('当前节点', dealStageLabel(stage.key)),
    ];

    if (stage.key === 'customer_profile') {
        items.push(
            salesStageSideTextItemMarkup('建档状态', text(deal?.customer_id) ? '已建档' : '待建档'),
            salesStageSideTextItemMarkup('最新更新', salesStageDateLabel(deal?.updated_at || deal?.created_at || record.updated_at)),
        );
    } else if (stage.scope === 'requirement') {
        const missingFields = requirementStatusReadyForQuote(requirement.status) ? [] : requirementMissingSubmissionFields(requirement);
        items.push(
            salesStageSideItemMarkup('节点状态', requirementStatusPill(requirement.status)),
            salesStageSideTextItemMarkup(
                '客户提交',
                requirementStatusReadyForQuote(requirement.status) ? '已提交' : '待提交',
                requirementStatusReadyForQuote(requirement.status)
                    ? `提交于 ${salesStageDateLabel(requirement.submitted_at)}`
                    : (missingFields.length ? `仍缺 ${missingFields.length} 项基础信息` : '等待客户完成填写')
            ),
            salesStageSideTextItemMarkup('最新更新', salesStageDateLabel(requirement.updated_at || deal?.updated_at || deal?.created_at)),
        );
    } else if (stage.scope === 'quote') {
        const publishedVersion = quoteVersionLabel(instance);
        const hasPendingDraft = quoteHasUnpublishedChanges(instance);
        const draftVersion = hasPendingDraft ? nextQuoteVersionLabel(instance) : publishedVersion;
        const quoteConfirmedRecord = salesStageStatusRecord('quote_confirmed', deal);
        items.push(
            salesStageSideItemMarkup('节点状态', statusPill(quoteStatusForStage(stage.key, instance))),
            salesStageSideTextItemMarkup('已发布版本', publishedVersion === '--' ? '--' : `V${publishedVersion}`),
            salesStageSideTextItemMarkup(
                '当前草稿',
                draftVersion === '--' ? '--' : `V${draftVersion}`,
                hasPendingDraft ? '存在未发布改动' : (draftVersion === '--' ? '' : '已与客户视角同步')
            ),
        );
        if (normalizeDealStageKey(stage.key) === 'quote_confirmed') {
            items.push(salesStageSideTextItemMarkup('客户确认', quoteConfirmationSubmitted(quoteConfirmedRecord) ? '已确认' : '待客户确认'));
        }
    } else {
        items.push(
            salesStageSideItemMarkup('节点状态', dealStageStatusPill(record.stage_status)),
            salesStageSideTextItemMarkup('计划时间', salesStageDateLabel(record.planned_at)),
            salesStageSideTextItemMarkup('完成时间', salesStageDateLabel(record.completed_at)),
        );
    }

    if (deal?.id) {
        items.push(
            salesStageSideTextItemMarkup('销售线状态', dealStatusLabel(deal.deal_status)),
            salesStageSideTextItemMarkup('下一动作', text(deal.next_action, '待补充')),
        );
    }

    return salesStageSideCardMarkup('状态区', 'Stage status', `
        <div class="ams-sales-stage-side-list">
            ${items.join('')}
        </div>
    `);
}

function salesStageCustomerCardMarkup(stageKey = '', deal = null, customer = {}) {
    const record = salesStageStatusRecord(stageKey, deal);
    const requirement = createRequirementDraft(moduleState.requirementEditor || {});
    const instance = createInstanceDraft(moduleState.instanceEditor || {});
    const contactName = text(customer.contact_name, text(requirement.requester_name, text(instance.receiver_name, '--')));
    const email = text(customer.email, text(requirement.requester_email, text(instance.receiver_email, '--')));
    const phone = text(customer.phone, text(requirement.requester_phone, '--'));
    const country = text(customer.country, text(requirement.country, text(instance.customer_country, '--')));
    const lineLabel = text(deal?.title, stageKey === 'customer_profile' ? '待创建销售线' : '--');
    return salesStageSideCardMarkup('用户信息区', 'Customer context', `
        <div class="ams-sales-stage-side-list">
            ${salesStageSideTextItemMarkup('客户', customerDisplayName(customer))}
            ${salesStageSideTextItemMarkup('销售线', lineLabel)}
            ${salesStageSideTextItemMarkup('联系人', contactName)}
            ${salesStageSideTextItemMarkup('联系邮箱', email)}
            ${salesStageSideTextItemMarkup('联系电话', phone)}
            ${salesStageSideTextItemMarkup('国家 / 地区', country)}
            ${salesStageSideTextItemMarkup('节点双负责人', deal?.id ? stageContactDisplayLabel(record, deal) : '待保存后补全')}
        </div>
    `);
}

function customerProfileActionCardMarkup() {
    return salesStageActionCardMarkup('客户主档保存后，销售线才会统一进入获取需求节点。', `
        ${salesStageActionGroupMarkup('阶段推进', '当前节点只处理客户主档，需求、报价和履约内容不混放在这里。', `
            <div class="ams-sales-stage-side-actions">
                <button class="ams-btn ams-btn-primary" type="button" id="ams-sales-flow-customer-save">保存并进入获取需求</button>
            </div>
        `)}
    `);
}

function requirementStageActionCardMarkup(stageKey = '', deal = null, requirement = {}) {
    const customerRequirementLink = requirement.id && requirement.public_slug && requirement.public_token
        ? requirementPublicUrl(requirement.public_slug, requirement.public_token)
        : '';
    const readonlyRequirementLink = customerRequirementLink
        ? requirementPublicUrl(requirement.public_slug, requirement.public_token, { readonly: true })
        : '';
    const missingFields = requirementStatusReadyForQuote(requirement.status) ? [] : requirementMissingSubmissionFields(requirement);
    const submitted = requirementStatusReadyForQuote(requirement.status);
    const requirementLocked = requirementIsLocked(requirement.status);
    const canConfirm = normalizeDealStageKey(stageKey) === 'requirement_confirmed'
        && submitted
        && Boolean(text(requirement.customer_id) && text(requirement.deal_id || deal?.id));
    const requirementLinkLabel = submitted ? '查看已提交需求' : '后台只读查看';
    const linkHelp = submitted
        ? '客户已提交，当前公开需求页已锁定；后续请基于客户真实提交内容推进。'
        : (missingFields.length
            ? `客户尚未提交，当前仍缺 ${missingFields.length} 项基础信息。`
            : '客户尚未提交，请继续分享填写入口。');
    return salesStageActionCardMarkup(
        normalizeDealStageKey(stageKey) === 'requirement_capture'
            ? '当前节点统一在这里管理客户填写入口、分享方式和保存动作。'
            : '先复核客户提交内容，再统一从这里保存并确认进入报价。',
        `
            ${salesStageSideItemMarkup(
                '客户填写链接',
                customerRequirementLink
                    ? `<a class="ams-inline-link" href="${esc(customerRequirementLink)}" target="_blank" rel="noopener">${esc(customerRequirementLink)}</a>`
                    : '保存后生成',
                linkHelp
            )}
            ${salesStageActionGroupMarkup('对外入口', '客户可从这里进入填写页，销售侧也统一从这里打开或分享。', `
                <div class="ams-sales-stage-side-actions">
                    <button
                        class="ams-btn ams-btn-muted ${requirementHasUnreadCustomerUpdate(requirement) ? 'has-alert-dot' : ''}"
                        type="button"
                        id="ams-sales-flow-requirement-open-link"
                        ${readonlyRequirementLink ? '' : 'disabled'}
                    >
                        ${esc(requirementLinkLabel)}
                        ${requirementHasUnreadCustomerUpdate(requirement) ? '<span class="ams-btn-alert-dot" aria-hidden="true"></span>' : ''}
                    </button>
                    <details class="ams-share-menu ams-sales-flow-requirement-share-menu">
                        <summary class="ams-btn ams-btn-primary" ${customerRequirementLink ? '' : 'aria-disabled="true"'}>
                            分享表单
                        </summary>
                        <div class="ams-share-menu-panel">
                            <div class="ams-share-menu-copy">
                                <strong>选择分享方式</strong>
                                <span>对外发送时，系统会自动带上填写目的说明、自动保存进度说明和 GasGx 品牌介绍。</span>
                            </div>
                            <button class="ams-share-menu-item" type="button" id="ams-sales-flow-requirement-share-link" ${customerRequirementLink ? '' : 'disabled'}>
                                <i class="fa-solid fa-link"></i>
                                <span>分享链接</span>
                            </button>
                            <button class="ams-share-menu-item" type="button" id="ams-sales-flow-requirement-share-poster" ${customerRequirementLink ? '' : 'disabled'}>
                                <i class="fa-solid fa-qrcode"></i>
                                <span>分享二维码</span>
                            </button>
                        </div>
                    </details>
                </div>
            `)}
            ${salesStageActionGroupMarkup('阶段推进', '当前节点的保存与推进动作统一固定在这里。', `
                <div class="ams-sales-stage-side-actions">
                    <button class="ams-btn ams-btn-muted" type="button" id="ams-sales-flow-requirement-save" ${requirementLocked ? 'disabled' : ''}>保存需求</button>
                    ${normalizeDealStageKey(stageKey) === 'requirement_confirmed'
                        ? `<button class="ams-btn ams-btn-warning" type="button" id="ams-sales-flow-requirement-confirm" ${canConfirm ? '' : 'disabled'}>确认需求并进入报价</button>`
                        : ''}
                </div>
            `)}
        `
    );
}

function quoteStageActionCardMarkup(stageKey = '', deal = null, instance = {}) {
    const normalizedStageKey = normalizeDealStageKey(stageKey);
    const quotePublished = quotePublishedForStage(stageKey, instance);
    const quoteConfirmedRecord = salesStageStatusRecord('quote_confirmed', deal);
    const quoteCustomerConfirmed = quoteConfirmationSubmitted(quoteConfirmedRecord);
    if (!instance?.id) {
        return salesStageActionCardMarkup('先在这里选择产品模板并生成报价单，生成后再进入编辑、发布和分享。', `
            ${salesStageActionGroupMarkup('生成报价', '报价草稿生成后，系统会自动带入客户和需求快照。', `
                <div class="ams-field">
                    <label>产品模板</label>
                    <select class="ams-select" id="ams-sales-flow-instance-product">
                        <option value="">请选择产品模板</option>
                        ${activeProducts().map((product) => `<option value="${esc(product.id)}" ${moduleState.pipelineProductSelection === product.id ? 'selected' : ''}>${esc(productLabelById(product.id))}</option>`).join('')}
                    </select>
                </div>
                <div class="ams-sales-stage-side-actions">
                    <button class="ams-btn ams-btn-primary" type="button" id="ams-sales-flow-instance-create" ${normalizedStageKey === 'quote_draft' ? '' : 'disabled'}>生成报价单</button>
                </div>
            `)}
        `);
    }
    return salesStageActionCardMarkup(
        normalizedStageKey === 'quote_confirmed'
            ? '客户确认报价后，再统一从这里锁定商务基线并推进到签约合同。'
            : '当前节点统一在这里打开编辑器、查看客户视角报价以及分享对外入口。',
        `
            ${salesStageSideTextItemMarkup('客户侧查看', quotePublished ? '已可查看' : '需先发布报价')}
            ${normalizedStageKey === 'quote_confirmed'
                ? salesStageSideTextItemMarkup('客户确认', quoteConfirmationSubmitted(quoteConfirmedRecord) ? '已提交' : '待确认')
                : ''}
            ${salesStageActionGroupMarkup('报价入口', '所有对外报价动作都固定放在这里，避免不同节点入口分散。', `
                <div class="ams-sales-stage-side-actions">
                    <button class="ams-btn ams-btn-primary" type="button" id="ams-sales-flow-instance-open-inline">打开可视化报价编辑器</button>
                    <button class="ams-btn ${quotePublished ? 'ams-btn-primary' : 'ams-btn-muted'}" type="button" id="ams-sales-flow-instance-open-public" ${quotePublished ? '' : 'disabled'} aria-disabled="${quotePublished ? 'false' : 'true'}">查看用户报价</button>
                    <details class="ams-share-menu ams-sales-flow-quote-share-menu">
                        <summary class="ams-btn ${quotePublished ? 'ams-btn-primary' : 'ams-btn-muted'}" ${quotePublished ? '' : 'aria-disabled="true"'}>
                            分享报价
                        </summary>
                        <div class="ams-share-menu-panel">
                            <div class="ams-share-menu-copy">
                                <strong>选择分享方式</strong>
                                <span>对外发送时，系统会自动带上用途说明和 GasGx 品牌介绍。</span>
                            </div>
                            <button class="ams-share-menu-item" type="button" id="ams-sales-flow-instance-share-link" ${quotePublished ? '' : 'disabled'}>
                                <i class="fa-solid fa-link"></i>
                                <span>分享链接</span>
                            </button>
                            <button class="ams-share-menu-item" type="button" id="ams-sales-flow-instance-share-poster" ${quotePublished ? '' : 'disabled'}>
                                <i class="fa-solid fa-qrcode"></i>
                                <span>分享二维码</span>
                            </button>
                        </div>
                    </details>
                    ${normalizedStageKey === 'quote_confirmed'
                        ? `<button class="ams-btn ams-btn-muted" type="button" id="ams-sales-flow-open-requirement-readonly">查看用户需求</button>`
                        : ''}
                </div>
            `)}
            ${normalizedStageKey === 'quote_confirmed'
                ? salesStageActionGroupMarkup('阶段推进', '条款保存和阶段推进统一固定在这里。', `
                    <div class="ams-sales-stage-side-actions">
                        <button class="ams-btn ams-btn-muted" type="button" id="ams-sales-flow-quote-save">保存确认条款</button>
                        <button class="ams-btn ${quoteCustomerConfirmed ? 'ams-btn-warning' : 'ams-btn-muted'}" type="button" id="ams-sales-flow-instance-confirm" ${quoteCustomerConfirmed ? '' : 'disabled'}>确认报价并进入签约合同</button>
                    </div>
                `)
                : ''}
        `
    );
}

function executionStageActionLabels(stageKey = '') {
    const labels = {
        contract_signed: { save: '保存合同信息', complete: '确认合同并进入定金付款' },
        deposit_paid: { save: '保存付款跟进', complete: '确认定金到账并进入排产' },
        production_scheduled: { save: '保存排产进度', complete: '通知客户验收并进入出厂验收' },
        factory_accepted: { save: '保存验收信息', complete: '确认验收完成并进入尾款确认' },
        balance_confirmed: { save: '保存尾款信息', complete: '确认尾款并进入物流运输' },
        shipping_in_transit: { save: '保存物流信息', complete: '确认发运并进入到场部署' },
        deployment_completed: { save: '保存部署信息', complete: '确认部署完成并进入运维支持' },
        support_active: { save: '保存运维信息', complete: '完成运维归档' },
    };
    return labels[normalizeDealStageKey(stageKey)] || { save: '保存当前节点', complete: '确认完成并进入下一节点' };
}

function executionStageActionCardMarkup(stage = {}, deal = null) {
    const record = executionStageRecord(stage, deal);
    const normalizedStageKey = normalizeDealStageKey(stage.key);
    const actionLabels = executionStageActionLabels(stage.key);
    const hasPublicLink = Boolean(text(record?.public_slug) && text(record?.public_token));
    const customerFacingUrl = hasPublicLink ? stageCustomerFacingUrl(stage.key, record, deal) : '';
    const publicHint = normalizedStageKey === 'production_scheduled'
        ? '客户可从这里查看生产进度、工期状态和关键备注。'
        : '客户可从这里查看并确认当前节点。';
    return salesStageActionCardMarkup('本节点的对外入口和推进动作统一固定在这里，表单区只处理本节点内容。', `
        ${stageSupportsPublicConfirmation(stage.key)
            ? `
                ${salesStageSideItemMarkup(
                    normalizedStageKey === 'production_scheduled' ? '客户进度链接' : '客户确认链接',
                    customerFacingUrl
                        ? `<a class="ams-inline-link" href="${esc(customerFacingUrl)}" target="_blank" rel="noopener">${esc(customerFacingUrl)}</a>`
                        : '保存后生成',
                    publicHint
                )}
                ${salesStageActionGroupMarkup('对外入口', '客户侧入口的打开和复制统一从这里触发。', `
                    <div class="ams-sales-stage-side-actions">
                        <button class="ams-btn ams-btn-muted" type="button" data-sales-flow-open-public-confirmation="${esc(normalizedStageKey)}" ${moduleState.dealStagePublicLinkSupported ? '' : 'disabled'}>
                            ${normalizedStageKey === 'production_scheduled' ? '打开客户生产进度页' : '打开客户确认入口'}
                        </button>
                        <button class="ams-btn ams-btn-primary" type="button" data-sales-flow-copy-public-confirmation="${esc(normalizedStageKey)}" ${moduleState.dealStagePublicLinkSupported ? '' : 'disabled'}>
                            ${normalizedStageKey === 'production_scheduled' ? '复制进度链接' : '复制确认链接'}
                        </button>
                    </div>
                `)}
            `
            : ''}
        ${salesStageActionGroupMarkup('阶段推进', '保存当前节点后，再决定是否推进到下一环节。', `
            <div class="ams-sales-stage-side-actions">
                <button class="ams-btn ams-btn-muted" type="button" id="ams-sales-flow-stage-save">${esc(actionLabels.save)}</button>
                <button class="ams-btn ams-btn-warning" type="button" id="ams-sales-flow-stage-complete">${esc(actionLabels.complete)}</button>
            </div>
        `)}
    `);
}

function salesStageOperationsCardMarkup(stage = {}, deal = null, customer = {}) {
    const normalizedStageKey = normalizeDealStageKey(stage.key);
    if (normalizedStageKey === 'customer_profile') return customerProfileActionCardMarkup(stage.key, deal, customer);
    if (stage.scope === 'requirement') return requirementStageActionCardMarkup(stage.key, deal, moduleState.requirementEditor || createRequirementDraft());
    if (stage.scope === 'quote') return quoteStageActionCardMarkup(stage.key, deal, moduleState.instanceEditor || createInstanceDraft());
    return executionStageActionCardMarkup(stage, deal);
}

function salesStageShellMarkup(stage = {}, deal = null, customer = {}, mainMarkup = '') {
    return `
        <section class="ams-sales-stage-shell">
            <div class="ams-sales-stage-shell-main">
                ${mainMarkup}
            </div>
            <aside class="ams-sales-stage-shell-side">
                ${salesStageStatusCardMarkup(stage.key, deal)}
                ${salesStageCustomerCardMarkup(stage.key, deal, customer)}
                ${salesStageOperationsCardMarkup(stage, deal, customer)}
            </aside>
        </section>
    `;
}

function customerProfileFlowMarkup(customer = {}, deals = [], activeDeal = null) {
    const customerLabel = text(customerDisplayName(customer || {}), text(activeDeal?.title, '当前客户'));
    return `
        <section class="ams-card ams-quote-editor-panel ams-instance-editor-panel">
            <div class="ams-section-head">
                <div>
                    <h3>${esc(customerLabel)}</h3>
                    <p>当前客户流水线的第一节点，只维护客户主档信息，不在这里处理需求、报价和履约详情。</p>
                </div>
            </div>
            <div class="ams-field-help">当前客户共有 ${esc(String(deals.length))} 条销售线，当前查看的是 ${esc(activeDeal ? text(activeDeal.title, activeDeal.id) : '未选择销售线')}。</div>
            <div class="ams-site-field-grid ams-site-field-grid-wide">
                <div class="ams-field"><label>客户公司</label><input class="ams-input" data-sales-flow-customer-field="company_name" value="${esc(customer.company_name)}" placeholder="客户公司"></div>
                <div class="ams-field"><label>客户邮箱（必填，仅支持邮箱格式）</label><input class="ams-input" type="email" inputmode="email" autocomplete="email" data-sales-flow-customer-field="email" value="${esc(customer.email)}" placeholder="customer@example.com"></div>
                <div class="ams-field"><label>客户电话</label><input class="ams-input" data-sales-flow-customer-field="phone" value="${esc(customer.phone)}" placeholder="+86"></div>
                <div class="ams-field"><label>国家 / 地区</label><input class="ams-input" data-sales-flow-customer-field="country" value="${esc(customer.country)}" placeholder="国家 / 地区"></div>
            </div>
            <div class="ams-field">
                <label>客户备注</label>
                <textarea class="ams-textarea" rows="5" data-sales-flow-customer-field="notes" placeholder="记录客户来源、偏好和跟进节奏。">${esc(customer.notes)}</textarea>
            </div>
        </section>
    `;
}

function requirementFlowMarkup(stageKey = '', deal = null, requirement = {}) {
    const answers = normalizeRequirementAnswers(requirement.answers);
    const communicationNotes = answers.communication_notes || [];
    const stageIntro = normalizeDealStageKey(stageKey) === 'requirement_capture'
        ? (requirementStatusReadyForQuote(requirement.status)
            ? '客户已经提交需求。这里改为只读回看客户提交内容，并转入“确认需求”阶段锁定报价基线。'
            : '等待客户提交需求，并在这里查看填写进度、补充内部摘要，以及对外分享带有 GasGx 品牌说明的客户需求入口。')
        : '复核需求信息并锁定报价基线。';
    const requirementProgressLabel = normalizeDealStageKey(stageKey) === 'requirement_capture'
        ? (requirementStatusReadyForQuote(requirement.status)
            ? '客户已完成提交，当前页只用于回看内容和补充内部沟通备注；下一步请进入确认需求。'
            : '当前阶段只等待客户填写，客户基础信息与需求详情以公开需求页实际提交内容为准。')
        : '当前阶段请基于客户已提交的真实需求内容进行确认。';
    return `
        <section class="ams-card ams-quote-editor-panel ams-instance-editor-panel">
            <div class="ams-section-head">
                <div>
                    <h3>${esc(dealStageLabel(stageKey))}</h3>
                        <p>${esc(stageIntro)}</p>
                </div>
            </div>
            <div class="ams-share-poster-modal" id="ams-sales-flow-requirement-share-poster-modal" hidden>
                <div class="ams-share-poster-backdrop" data-sales-flow-requirement-share-poster-close></div>
                <div class="ams-share-poster-dialog">
                    <div class="ams-share-poster-head">
                        <div>
                            <strong>客户需求二维码海报</strong>
                            <span>适合微信、邮件或群转发，已包含填写目的说明、自动保存进度说明和 GasGx 品牌宣传。</span>
                        </div>
                        <button class="ams-btn ams-btn-muted" type="button" data-sales-flow-requirement-share-poster-close>关闭</button>
                    </div>
                    <div class="ams-share-poster-stage">
                        <img class="ams-share-poster-image" id="ams-sales-flow-requirement-share-poster-image" alt="客户需求二维码海报">
                    </div>
                    <div class="ams-row-actions">
                        <a class="ams-btn ams-btn-primary" id="ams-sales-flow-requirement-share-poster-download" download="gasgx-customer-requirement-share-poster.svg">下载海报</a>
                        <button class="ams-btn ams-btn-muted" type="button" id="ams-sales-flow-requirement-share-poster-copy">复制分享文案</button>
                    </div>
                </div>
            </div>
            <div class="ams-site-field-grid ams-site-field-grid-wide">
                <div class="ams-field"><label>客户填写进度说明</label><input class="ams-input" value="${esc(requirementProgressLabel)}" disabled></div>
            </div>
            <div class="ams-field">
                <label>销售沟通备注</label>
                <textarea class="ams-textarea" rows="4" data-sales-flow-requirement-answer="communication_note_draft" placeholder="记录客户在微信、电话、邮件等私下沟通里的新增信息；每次保存都会追加一条沟通记录。">${esc(answers.communication_note_draft)}</textarea>
                <div class="ams-sales-note-submit">
                    <button class="ams-btn ams-btn-primary" type="button" id="ams-sales-flow-requirement-note-submit">提交备注</button>
                </div>
            </div>
            <details class="ams-fold-card">
                <summary class="ams-fold-summary">
                    <span>沟通备注列表</span>
                    <em>${esc(communicationNotes.length)} 条</em>
                </summary>
                <div class="ams-fold-body">
                    ${communicationNotes.length
                        ? communicationNotes.map((item) => `
                            <article class="ams-note-log-item">
                                <strong>${esc(text(item.author, '销售备注'))}</strong>
                                <time>${esc(fmtDate(item.created_at))}</time>
                                <p>${esc(item.note)}</p>
                            </article>
                        `).join('')
                        : '<div class="ams-empty">当前还没有沟通备注记录。</div>'}
                </div>
            </details>
        </section>
    `;
}

function stageCommunicationSectionMarkup(stageKey = '', record = {}, options = {}) {
    const logs = stageCommunicationLogs(record);
    const title = text(options.title, '沟通记录');
    const help = text(options.help, '记录这个节点里与客户沟通、内部确认、修改原因和关键结论。每次保存都会追加一条历史。');
    return `
        <details class="ams-card ams-stage-log-card ams-fold-card ams-stage-module-fold">
            <summary class="ams-fold-summary">
                <span>${esc(title)}</span>
                <em>${esc(`${logs.length} 条`)}</em>
            </summary>
            <div class="ams-fold-body">
                <p class="ams-field-help">${esc(help)}</p>
                <div class="ams-field">
                    <label>新增沟通备注</label>
                    <textarea class="ams-textarea" rows="3" data-sales-flow-stage-meta="communication_note_draft" placeholder="记录本次和客户沟通的要点、变更原因、承诺事项或内部判断。">${esc(stageMetaValue(record, 'communication_note_draft'))}</textarea>
                    <div class="ams-sales-note-submit">
                        <button class="ams-btn ams-btn-primary" type="button" id="ams-sales-flow-stage-note-submit">提交备注</button>
                    </div>
                </div>
                <div class="ams-sales-stage-note-list">
                    ${logs.length
                        ? logs.map((item) => `
                            <article class="ams-note-log-item">
                                <strong>${esc(text(item.author, '销售沟通'))}</strong>
                                <time>${esc(fmtDate(item.created_at))}</time>
                                <p>${esc(item.note)}</p>
                            </article>
                        `).join('')
                        : '<div class="ams-empty">当前节点还没有沟通记录。</div>'}
                </div>
            </div>
        </details>
    `;
}

function quoteTermsCardMarkup(record = {}) {
    return `
        <details class="ams-card ams-stage-log-card ams-fold-card ams-stage-module-fold">
            <summary class="ams-fold-summary">
                <span>确认条款</span>
                <em>可展开编辑</em>
            </summary>
            <div class="ams-fold-body">
                <p class="ams-field-help">在客户确认报价前，把首付款比例、交付周期、服务边界和其他关键条款写清楚，并同步进入后续签约合同节点。</p>
                <div class="ams-field">
                    <label>报价确认条款</label>
                    <textarea class="ams-textarea" rows="6" data-sales-flow-stage-meta="quote_terms" placeholder="示例：30% 定金后排产；预计 45 天交付；尾款在出厂验收后支付；质保 12 个月。">${esc(stageMetaValue(record, 'quote_terms'))}</textarea>
                </div>
                <p class="ams-field-help">条款编辑完成后，请回到右侧统一操作区执行保存和推进。</p>
            </div>
        </details>
    `;
}

function executionStageFieldMarkup(record = {}, field = {}) {
    const {
        key = '',
        label = '',
        type = 'text',
        step = '',
        placeholder = '',
        defaultValue = '',
    } = field;
    const typeAttr = type === 'number'
        ? `type="number"${step ? ` step="${esc(step)}"` : ' step="0.01"'}`
        : type === 'date'
            ? 'type="date"'
            : 'type="text"';
    return `
        <div class="ams-field">
            <label>${esc(label)}</label>
            <input class="ams-input" ${typeAttr} data-sales-flow-stage-meta="${esc(key)}" value="${esc(stageMetaValue(record, key, defaultValue))}" placeholder="${esc(placeholder)}">
        </div>
    `;
}

function executionStageFieldGridMarkup(record = {}, fields = []) {
    return `
        <div class="ams-site-field-grid ams-site-field-grid-wide">
            ${fields.map((field) => executionStageFieldMarkup(record, field)).join('')}
        </div>
    `;
}

function executionStageTextareaFieldMarkup(record = {}, field = {}) {
    const {
        key = '',
        label = '',
        rows = 4,
        placeholder = '',
    } = field;
    return `
        <div class="ams-field">
            <label>${esc(label)}</label>
            <textarea class="ams-textarea" rows="${esc(String(rows))}" data-sales-flow-stage-meta="${esc(key)}" placeholder="${esc(placeholder)}">${esc(stageMetaValue(record, key))}</textarea>
        </div>
    `;
}

function quoteStageRecord(stageKey = '', deal = null) {
    return stageRecordByKey(stageKey, moduleState.dealStageRecords) || createDealStageRecord({
        deal_id: deal?.id,
        stage_key: stageKey,
        stage_status: normalizeDealStageKey(deal?.current_stage) === normalizeDealStageKey(stageKey) ? 'active' : 'pending',
    });
}

function quoteStageDetailRenderer(stageKey = '') {
    const normalized = normalizeDealStageKey(stageKey);
    if (normalized === 'quote_confirmed') return quoteConfirmedStageMarkup;
    return quoteDraftStageMarkup;
}

function quoteStageBaseMetaMarkup(stageKey = '', deal = null, instance = {}, brand = null) {
    const publishedVersion = quoteVersionLabel(instance);
    const hasPendingDraft = quoteHasUnpublishedChanges(instance);
    const draftVersion = hasPendingDraft ? nextQuoteVersionLabel(instance) : publishedVersion;
    return `
        <div class="ams-summary-chip"><strong>客户</strong><span>${esc(customerDisplayName(moduleState.customers.find((item) => item.id === deal?.customer_id) || {}))}</span></div>
        <div class="ams-summary-chip"><strong>销售线</strong><span>${esc(text(deal?.title, '--'))}</span></div>
        <div class="ams-summary-chip"><strong>品牌</strong><span>${esc(text(brand?.brand_name || brand?.display_name, '--'))}</span></div>
        <div class="ams-summary-chip"><strong>产品</strong><span>${esc(text(productLabelById(instance.product_id), '--'))}</span></div>
        <div class="ams-summary-chip"><strong>报价状态</strong><span>${statusPill(quoteStatusForStage(stageKey, instance))}</span></div>
        <div class="ams-summary-chip"><strong>已发布版本</strong><span>${publishedVersion === '--' ? '--' : `V${esc(publishedVersion)}`}</span></div>
        <div class="ams-summary-chip"><strong>当前草稿版本</strong><span>${draftVersion === '--' ? '--' : `V${esc(draftVersion)}`}${hasPendingDraft ? '（未发布）' : (draftVersion === '--' ? '' : '（已同步）')}</span></div>
    `;
}

function quoteSharePosterModalMarkup() {
    return `
        <div class="ams-share-poster-modal" id="ams-sales-flow-quote-share-poster-modal" hidden>
            <div class="ams-share-poster-backdrop" data-sales-flow-quote-share-poster-close></div>
            <div class="ams-share-poster-dialog">
                <div class="ams-share-poster-head">
                    <div>
                        <strong>报价分享二维码海报 / Quote Share Poster</strong>
                        <span>适合微信、邮件或群转发，已包含用途说明与 GasGx 品牌信息。 Ready for WeChat, email, and internal forwarding.</span>
                    </div>
                    <button class="ams-btn ams-btn-muted" type="button" data-sales-flow-quote-share-poster-close>关闭</button>
                </div>
                <div class="ams-share-poster-stage">
                    <img class="ams-share-poster-image" id="ams-sales-flow-quote-share-poster-image" alt="报价分享二维码海报 / Quote Share Poster">
                </div>
                <div class="ams-row-actions">
                    <a class="ams-btn ams-btn-primary" id="ams-sales-flow-quote-share-poster-download" download="gasgx-quote-share-poster.svg">下载海报</a>
                    <button class="ams-btn ams-btn-muted" type="button" id="ams-sales-flow-quote-share-poster-copy-link">复制海报说明文案</button>
                </div>
            </div>
        </div>
    `;
}

function quoteDraftStageMarkup(stageKey = '', deal = null, instance = {}, context = {}) {
    const { record = createDealStageRecord() } = context;
    return `
        <div class="ams-stage-detail-stack">
            <section class="ams-card ams-quote-editor-panel ams-instance-editor-panel">
                <div class="ams-section-head">
                    <div>
                        <h3>${esc(dealStageLabel(stageKey))}</h3>
                        <p>这里负责生成报价草稿、打开可视化编辑器，并持续记录客户对报价内容的修改意见。</p>
                    </div>
                </div>
                ${
                    instance.id
                        ? `<div class="ams-field-help">当前报价草稿：${esc(text(instance.customer_name || instance.public_slug, instance.id))}。这里的所有条款调整和客户反馈都应写入下面的沟通记录，确保后续签约可追溯。</div>`
                        : '<div class="ams-field-help">先在右侧操作区选择产品模板并生成报价单，生成后再进入可视化编辑、发布和分享。</div>'
                }
                ${quoteSharePosterModalMarkup()}
            </section>
            ${stageCommunicationSectionMarkup(stageKey, record, {
                title: '报价沟通记录',
                help: '把客户对报价内容、价格、条款、交付周期的每次反馈和修改要求都记在这里，便于后续签约与溯源。',
            })}
        </div>
    `;
}

function quoteStageEntryActionsMarkup(instance = {}, quotePublished = false, publishedText = '', draftText = '') {
    if (!instance?.id) return '';
    return `
        <div class="ams-summary-chip ams-summary-chip-link ams-stage-role-chip ams-stage-role-chip-sales">
            <em class="ams-stage-role-kicker">销售侧操作</em>
            <strong>报价入口</strong>
            <span>${quotePublished ? publishedText : draftText}</span>
            <div class="ams-summary-chip-actions">
                <button class="ams-btn ams-btn-primary" type="button" id="ams-sales-flow-instance-open-inline">打开可视化报价编辑器</button>
                <button class="ams-btn ${quotePublished ? 'ams-btn-primary' : 'ams-btn-muted'}" type="button" id="ams-sales-flow-instance-open-public" ${quotePublished ? '' : 'disabled'} aria-disabled="${quotePublished ? 'false' : 'true'}">查看用户报价</button>
                <details class="ams-share-menu ams-sales-flow-quote-share-menu">
                    <summary class="ams-btn ${quotePublished ? 'ams-btn-primary' : 'ams-btn-muted'}" ${quotePublished ? '' : 'aria-disabled="true"'}>
                        分享报价
                    </summary>
                    <div class="ams-share-menu-panel">
                        <div class="ams-share-menu-copy">
                            <strong>选择分享方式</strong>
                            <span>对外发送时，系统会自动带上用途说明和 GasGx 品牌介绍。</span>
                        </div>
                        <button class="ams-share-menu-item" type="button" id="ams-sales-flow-instance-share-link" ${quotePublished ? '' : 'disabled'}>
                            <i class="fa-solid fa-link"></i>
                            <span>分享链接</span>
                        </button>
                        <button class="ams-share-menu-item" type="button" id="ams-sales-flow-instance-share-poster" ${quotePublished ? '' : 'disabled'}>
                            <i class="fa-solid fa-qrcode"></i>
                            <span>分享二维码</span>
                        </button>
                    </div>
                </details>
            </div>
        </div>
    `;
}

function quoteRequirementForStage(deal = null, instance = {}) {
    return requirementById(instance.requirement_id)
        || requirementById(deal?.primary_requirement_id)
        || dealRequirements(text(deal?.id))[0]
        || null;
}

function quoteConfirmedActionPanelMarkup(deal = null, instance = {}, quotePublished = false) {
    const requirement = quoteRequirementForStage(deal, instance);
    const hasReadonlyRequirement = Boolean(text(requirement?.public_slug) && text(requirement?.public_token));
    return `
        <div class="ams-summary-chip ams-summary-chip-link ams-stage-role-chip ams-stage-role-chip-sales">
            <em class="ams-stage-role-kicker">销售侧操作</em>
            <strong>确认报价操作</strong>
            <span>确认报价节点统一在这里处理报价编辑、客户报价查看、分享，以及需求回看入口。</span>
            <div class="ams-summary-chip-actions">
                <button class="ams-btn ams-btn-primary" type="button" id="ams-sales-flow-instance-open-inline">打开可视化报价编辑器</button>
                <button class="ams-btn ${quotePublished ? 'ams-btn-primary' : 'ams-btn-muted'}" type="button" id="ams-sales-flow-instance-open-public" ${quotePublished ? '' : 'disabled'} aria-disabled="${quotePublished ? 'false' : 'true'}">查看用户报价</button>
                <details class="ams-share-menu ams-sales-flow-quote-share-menu">
                    <summary class="ams-btn ${quotePublished ? 'ams-btn-primary' : 'ams-btn-muted'}" ${quotePublished ? '' : 'aria-disabled="true"'}>
                        分享报价
                    </summary>
                    <div class="ams-share-menu-panel">
                        <div class="ams-share-menu-copy">
                            <strong>选择分享方式</strong>
                            <span>对外发送时，系统会自动带上用途说明和 GasGx 品牌介绍。</span>
                        </div>
                        <button class="ams-share-menu-item" type="button" id="ams-sales-flow-instance-share-link" ${quotePublished ? '' : 'disabled'}>
                            <i class="fa-solid fa-link"></i>
                            <span>分享链接</span>
                        </button>
                        <button class="ams-share-menu-item" type="button" id="ams-sales-flow-instance-share-poster" ${quotePublished ? '' : 'disabled'}>
                            <i class="fa-solid fa-qrcode"></i>
                            <span>分享二维码</span>
                        </button>
                    </div>
                </details>
                <button class="ams-btn ${hasReadonlyRequirement ? 'ams-btn-primary' : 'ams-btn-muted'}" type="button" id="ams-sales-flow-open-requirement-readonly" ${hasReadonlyRequirement ? '' : 'disabled'}>查看用户需求</button>
            </div>
        </div>
    `;
}

function quoteConfirmedStageMarkup(stageKey = '', deal = null, instance = {}, context = {}) {
    const { record = createDealStageRecord() } = context;
    return `
        <div class="ams-stage-detail-stack">
            <section class="ams-card ams-quote-editor-panel ams-instance-editor-panel">
                <div class="ams-section-head">
                    <div>
                        <h3>${esc(dealStageLabel(stageKey))}</h3>
                        <p>这里负责锁定客户最终认可版本。确认后直接进入签约合同，并把条款带入合同节点。</p>
                    </div>
                </div>
                <div class="ams-field-help">当前报价草稿：${esc(text(instance.customer_name || instance.public_slug, instance.id))}。这里的所有条款调整和客户反馈都应写入下面的沟通记录，确保后续签约可追溯。</div>
                ${quoteSharePosterModalMarkup()}
            </section>
            ${quoteTermsCardMarkup(record)}
            ${stageCommunicationSectionMarkup(stageKey, record, {
                title: '报价沟通记录',
                help: '把客户对报价内容、价格、条款、交付周期的每次反馈和修改要求都记在这里，便于后续签约与溯源。',
            })}
        </div>
    `;
}

function quoteFlowMarkup(stageKey = '', deal = null, instance = {}) {
    const products = activeProducts();
    if (!products.some((product) => product.id === moduleState.pipelineProductSelection)) {
        moduleState.pipelineProductSelection = instance.product_id || products[0]?.id || '';
    }
    const brand = moduleState.brands.find((item) => item.id === text(instance.brand_id));
    const record = quoteStageRecord(stageKey, deal);
    const renderer = quoteStageDetailRenderer(stageKey);
    const quoteCustomerConfirmed = quoteConfirmationSubmitted(record);
    const canConfirm = normalizeDealStageKey(stageKey) === 'quote_confirmed'
        && Boolean(text(instance.id) && text(instance.deal_id || deal?.id))
        && quoteCustomerConfirmed;
    const quotePublished = quotePublishedForStage(stageKey, instance);
    return renderer(stageKey, deal, instance, {
        products,
        brand,
        record,
        canConfirm,
        quotePublished,
    });
}

function contractStageMarkup(stage = {}, deal = null, record = {}) {
    return `
        <div class="ams-stage-detail-stack">
            ${executionStageCardMarkup(stage, {
                intro: '向客户递送合同、记录客户返修意见，合同确认无误后归档到这里，再推进到定金付款。',
                bodyMarkup: `
                    <div class="ams-site-field-grid ams-site-field-grid-wide">
                        <div class="ams-field"><label>合同编号</label><input class="ams-input" data-sales-flow-stage-meta="contract_number" value="${esc(stageMetaValue(record, 'contract_number'))}" placeholder="CT-2026-001"></div>
                        <div class="ams-field"><label>签约日期</label><input class="ams-input" type="date" data-sales-flow-stage-meta="contract_date" value="${esc(stageMetaValue(record, 'contract_date'))}"></div>
                        <div class="ams-field"><label>合同金额</label><input class="ams-input" type="number" step="0.01" data-sales-flow-stage-meta="contract_amount" value="${esc(stageMetaValue(record, 'contract_amount'))}" placeholder="0"></div>
                        <div class="ams-field"><label>币种</label><input class="ams-input" data-sales-flow-stage-meta="contract_currency" value="${esc(stageMetaValue(record, 'contract_currency', 'USD'))}" placeholder="USD"></div>
                        <div class="ams-field"><label>合同归档链接</label><input class="ams-input" data-sales-flow-stage-meta="contract_link" value="${esc(stageMetaValue(record, 'contract_link'))}" placeholder="https://..."></div>
                        <div class="ams-field"><label>客户确认结果</label><input class="ams-input" data-sales-flow-stage-meta="contract_review_result" value="${esc(stageMetaValue(record, 'contract_review_result'))}" placeholder="已确认 / 待修订 / 补充条款"></div>
                    </div>
                    <div class="ams-field">
                        <label>从确认报价继承的商务条款</label>
                        <textarea class="ams-textarea" rows="4" data-sales-flow-stage-meta="quote_terms" placeholder="这里承接确认报价节点中的首付款、交付周期、服务边界和其他约定。">${esc(stageMetaValue(record, 'quote_terms'))}</textarea>
                    </div>
                    <div class="ams-field">
                        <label>合同归档说明</label>
                        <textarea class="ams-textarea" rows="4" data-sales-flow-stage-meta="contract_archive_note" placeholder="记录客户最终回传的合同版本、修改点摘要、归档位置和内部确认结论。">${esc(stageMetaValue(record, 'contract_archive_note'))}</textarea>
                    </div>
                `,
            })}
            ${stageCommunicationSectionMarkup(stage.key, record, {
                title: '合同沟通记录',
                help: '记录合同条款往返修改、客户问题、法务确认和最终归档依据。',
            })}
        </div>
    `;
}

function depositStageMarkup(stage = {}, deal = null, record = {}) {
    return `
        <div class="ams-stage-detail-stack">
            ${executionStageCardMarkup(stage, {
                intro: '跟进客户定金支付、核对电子回单或付款证明，确认到账后推进到排产安排。',
                bodyMarkup: `
                    ${executionStageFieldGridMarkup(record, [
                        { key: 'deposit_expected', label: '应收定金', type: 'number', placeholder: '0' },
                        { key: 'deposit_received', label: '实收定金', type: 'number', placeholder: '0' },
                        { key: 'deposit_received_at', label: '到账日期', type: 'date' },
                        { key: 'deposit_reference', label: '付款凭证链接 / 回单号', placeholder: '银行回单链接 / 流水号 / 图片地址' },
                    ])}
                    ${executionStageTextareaFieldMarkup(record, {
                        key: 'deposit_review_note',
                        label: '到账核对说明',
                        placeholder: '记录客户打款渠道、到账异常、催款结果和核对结论。',
                    })}
                `,
            })}
            ${stageCommunicationSectionMarkup(stage.key, record, {
                title: '定金沟通记录',
                help: '记录催款、付款证明回传、到账确认和异常处理过程。',
            })}
        </div>
    `;
}

function productionSubflowStatusLabel(value = '') {
    return optionLabel(PRODUCTION_SUBFLOW_STATUS_OPTIONS, text(value, 'pending'));
}

function productionSubflowStatusPill(value = '') {
    const normalized = text(value, 'pending');
    const tone = normalized === 'completed'
        ? 'is-completed'
        : normalized === 'in_progress'
            ? 'is-active'
            : normalized === 'delayed'
                ? 'is-delayed'
                : 'is-pending';
    return `<span class="ams-production-subflow-status ${tone}">${esc(productionSubflowStatusLabel(normalized))}</span>`;
}

function productionSubflowCardMarkup(record = {}, step = {}, index = 0) {
    const statusKey = `${step.key}_status`;
    const dateKey = `${step.key}_date`;
    const noteKey = `${step.key}_note`;
    const currentStatus = stageMetaValue(record, statusKey, 'pending');
    return `
        <article class="ams-production-subflow-card">
            <div class="ams-production-subflow-card-head">
                <strong>${esc(`${index + 1}. ${step.label}`)}</strong>
                ${productionSubflowStatusPill(currentStatus)}
            </div>
            <p>${esc(step.hint)}</p>
            <div class="ams-production-subflow-grid">
                <div class="ams-field">
                    <label>状态</label>
                    <select class="ams-select" data-sales-flow-stage-meta="${esc(statusKey)}">
                        ${selectOptionsMarkup(PRODUCTION_SUBFLOW_STATUS_OPTIONS, currentStatus)}
                    </select>
                </div>
                <div class="ams-field">
                    <label>更新时间</label>
                    <input class="ams-input" type="date" data-sales-flow-stage-meta="${esc(dateKey)}" value="${esc(stageMetaValue(record, dateKey))}">
                </div>
                <div class="ams-field">
                    <label>阶段备注</label>
                    <input class="ams-input" data-sales-flow-stage-meta="${esc(noteKey)}" value="${esc(stageMetaValue(record, noteKey))}" placeholder="本节点重点说明">
                </div>
            </div>
        </article>
    `;
}

function productionSubflowMarkup(record = {}) {
    return `
        <section class="ams-production-subflow">
            <div class="ams-section-head">
                <div>
                    <h3>生产子流水线</h3>
                    <p>从生产开始持续推进关键节点，便于销售与工厂同步，并把同一份进度开放给客户查看。</p>
                </div>
            </div>
            <div class="ams-production-subflow-track">
                ${PRODUCTION_SUBFLOW_STEPS.map((step, index) => productionSubflowCardMarkup(record, step, index)).join('')}
            </div>
        </section>
    `;
}

function productionStageMarkup(stage = {}, deal = null, record = {}) {
    return `
        <div class="ams-stage-detail-stack">
            ${executionStageCardMarkup(stage, {
                intro: '按生产流程更新集装箱、发电机、矿箱模块等环节状态，记录工期和是否延误，并保留通知客户的方式。',
                bodyMarkup: `
                    ${executionStageFieldGridMarkup(record, [
                        { key: 'factory_name', label: '工厂 / 产线', placeholder: 'Factory A' },
                        { key: 'production_batch', label: '批次', placeholder: 'Batch-01' },
                        { key: 'production_start_at', label: '开始时间', type: 'date' },
                        { key: 'production_eta', label: '预计完工', type: 'date' },
                        { key: 'production_schedule_status', label: '工期状态', placeholder: '正常 / 延误 / 风险' },
                        { key: 'production_delay_reason', label: '延误说明', placeholder: '如有延误，请写明原因' },
                    ])}
                    ${executionStageFieldGridMarkup(record, [
                        { key: 'module_container_status', label: '集装箱模块', placeholder: '待下料 / 生产中 / 完成' },
                        { key: 'module_generator_status', label: '发电机模块', placeholder: '待采购 / 安装中 / 完成' },
                        { key: 'module_mining_box_status', label: '矿箱模块', placeholder: '待装配 / 调试中 / 完成' },
                    ])}
                    ${executionStageFieldGridMarkup(record, [
                        { key: 'customer_notify_channels', label: '通知客户方式', defaultValue: '邮箱 / WhatsApp', placeholder: '邮箱 / WhatsApp / 电话' },
                        { key: 'customer_notify_email', label: '通知客户邮箱', placeholder: 'customer@example.com' },
                    ])}
                    ${productionSubflowMarkup(record)}
                    ${executionStageTextareaFieldMarkup(record, {
                        key: 'production_notice_note',
                        label: '排产与验收通知说明',
                        placeholder: '记录工期结论、延期原因、发给客户的邮件/通知摘要，以及何时邀请客户验收。',
                    })}
                `,
            })}
            ${stageCommunicationSectionMarkup(stage.key, record, {
                title: '排产沟通记录',
                help: '记录排产确认、工期变化、延期说明、发给客户的通知和验收预约。',
            })}
        </div>
    `;
}

function factoryAcceptanceStageMarkup(stage = {}, deal = null, record = {}) {
    return `
        <div class="ams-stage-detail-stack">
            ${executionStageCardMarkup(stage, {
                intro: '支持上传纸质验收单图片，或发给客户线上验收确认入口。客户完成验收后，再推进到尾款确认。',
                bodyMarkup: `
                    ${executionStageFieldGridMarkup(record, [
                        { key: 'fat_date', label: '验收日期', type: 'date' },
                        { key: 'fat_result', label: '验收结果', placeholder: '通过 / 待整改' },
                        { key: 'acceptance_image_link', label: '纸质验收单图片链接', placeholder: 'https://...' },
                        { key: 'acceptance_form_link', label: '线上验收确认链接', placeholder: 'https://...' },
                    ])}
                    ${executionStageTextareaFieldMarkup(record, {
                        key: 'fat_summary',
                        label: '验收摘要',
                        placeholder: '记录客户现场验收结论、遗留问题和是否允许进入尾款确认。',
                    })}
                `,
            })}
            ${stageCommunicationSectionMarkup(stage.key, record, {
                title: '验收沟通记录',
                help: '记录客户验收安排、纸质单回传、线上确认单进度和整改结论。',
            })}
        </div>
    `;
}

function balanceStageMarkup(stage = {}, deal = null, record = {}) {
    return `
        <div class="ams-stage-detail-stack">
            ${executionStageCardMarkup(stage, {
                intro: '确认客户尾款金额、到账结果和尾款回单。尾款确认后，销售线推进到物流运输。',
                bodyMarkup: `
                    ${executionStageFieldGridMarkup(record, [
                        { key: 'balance_expected', label: '应收尾款', type: 'number', placeholder: '0' },
                        { key: 'balance_confirmed_amount', label: '确认金额', type: 'number', placeholder: '0' },
                        { key: 'balance_confirmed_at', label: '确认日期', type: 'date' },
                        { key: 'balance_reference', label: '尾款凭证', placeholder: '银行回单链接 / 流水号' },
                    ])}
                    ${executionStageTextareaFieldMarkup(record, {
                        key: 'balance_note',
                        label: '尾款确认说明',
                        placeholder: '记录尾款催收、客户确认、到账异常和财务核对结果。',
                    })}
                `,
            })}
            ${stageCommunicationSectionMarkup(stage.key, record, {
                title: '尾款沟通记录',
                help: '记录尾款催收、客户确认、付款凭证和异常处理过程。',
            })}
        </div>
    `;
}

function shippingStageMarkup(stage = {}, deal = null, record = {}) {
    return `
        <div class="ams-stage-detail-stack">
            ${executionStageCardMarkup(stage, {
                intro: '记录承运商、运单号和到货预估，并保留发运通知客户的方式。物流确认后进入到场部署。',
                bodyMarkup: `
                    ${executionStageFieldGridMarkup(record, [
                        { key: 'shipping_carrier', label: '承运商', placeholder: '海运代理 / 物流公司' },
                        { key: 'shipping_tracking_no', label: '运单号', placeholder: 'Tracking No.' },
                        { key: 'shipping_departed_at', label: '发运时间', type: 'date' },
                        { key: 'shipping_eta', label: '预计到达', type: 'date' },
                        { key: 'shipping_notify_channels', label: '通知客户方式', defaultValue: '邮箱 / WhatsApp', placeholder: '邮箱 / WhatsApp / 电话' },
                        { key: 'shipping_notice_summary', label: '通知摘要', placeholder: '已发送发运通知 / 待通知' },
                    ])}
                    ${executionStageTextareaFieldMarkup(record, {
                        key: 'shipping_note',
                        label: '物流说明',
                        placeholder: '记录发运方式、客户通知、在途异常和预计到场安排。',
                    })}
                `,
            })}
            ${stageCommunicationSectionMarkup(stage.key, record, {
                title: '物流沟通记录',
                help: '记录发运通知、运输异常、清关问题和预计到场协调。',
            })}
        </div>
    `;
}

function deploymentStageMarkup(stage = {}, deal = null, record = {}) {
    return `
        <div class="ams-stage-detail-stack">
            ${executionStageCardMarkup(stage, {
                intro: '跟踪现场条件、部署时间和部署结论。部署完成后进入运维支持。',
                bodyMarkup: `
                    ${executionStageFieldGridMarkup(record, [
                        { key: 'deployment_site_ready', label: '现场条件', placeholder: '电力已就绪 / 场地待补充' },
                        { key: 'deployment_date', label: '部署日期', type: 'date' },
                        { key: 'deployment_result', label: '部署结果', placeholder: '已上线 / 待复检' },
                        { key: 'deployment_contact', label: '现场负责人', placeholder: '现场联系人' },
                    ])}
                    ${executionStageTextareaFieldMarkup(record, {
                        key: 'deployment_note',
                        label: '部署说明',
                        placeholder: '记录部署过程、上线结果、客户现场反馈和遗留事项。',
                    })}
                `,
            })}
            ${stageCommunicationSectionMarkup(stage.key, record, {
                title: '部署沟通记录',
                help: '记录现场准备、部署窗口、客户反馈和上线后的遗留问题。',
            })}
        </div>
    `;
}

function supportStageMarkup(stage = {}, deal = null, record = {}) {
    return `
        <div class="ams-stage-detail-stack">
            ${executionStageCardMarkup(stage, {
                intro: '进入长期运维支持阶段，记录质保到期、支持负责人和客户服务渠道。完成后整条销售线可结案。',
                bodyMarkup: `
                    ${executionStageFieldGridMarkup(record, [
                        { key: 'support_warranty_until', label: '质保到期', type: 'date' },
                        { key: 'support_owner', label: '支持负责人', placeholder: 'Support Owner' },
                        { key: 'support_channel', label: '支持渠道', placeholder: 'WhatsApp / 邮箱 / 工单' },
                        { key: 'support_status', label: '服务状态', placeholder: '正常服务 / 待回访 / 已结案' },
                    ])}
                    ${executionStageTextareaFieldMarkup(record, {
                        key: 'support_note',
                        label: '运维说明',
                        placeholder: '记录运维交接、质保范围、客户后续问题和最终结案说明。',
                    })}
                `,
            })}
            ${stageCommunicationSectionMarkup(stage.key, record, {
                title: '运维沟通记录',
                help: '记录售后沟通、质保范围、问题回访和最终结案依据。',
            })}
        </div>
    `;
}

function executionStageRecord(stage = {}, deal = null) {
    return stageRecordByKey(stage.key, moduleState.dealStageRecords) || createDealStageRecord({
        deal_id: deal?.id,
        stage_key: stage.key,
        stage_status: normalizeDealStageKey(deal?.current_stage) === stage.key ? 'active' : 'pending',
        owner_name: deal?.owner_name,
        owner_email: deal?.owner_email,
    });
}

function executionStageRenderer(stage = {}) {
    const renderers = {
        contract_signed: contractStageMarkup,
        deposit_paid: depositStageMarkup,
        production_scheduled: productionStageMarkup,
        factory_accepted: factoryAcceptanceStageMarkup,
        balance_confirmed: balanceStageMarkup,
        shipping_in_transit: shippingStageMarkup,
        deployment_completed: deploymentStageMarkup,
        support_active: supportStageMarkup,
    };
    return renderers[normalizeDealStageKey(stage.key)] || null;
}

function executionStageActionsMarkup(saveLabel = '保存阶段', completeLabel = '标记完成并进入下一节点') {
    return salesFlowActionBarMarkup(`
        <button class="ams-btn ams-btn-muted" type="button" id="ams-sales-flow-stage-save">${esc(saveLabel)}</button>
        <button class="ams-btn ams-btn-warning" type="button" id="ams-sales-flow-stage-complete">${esc(completeLabel)}</button>
    `, '保存当前节点后，再推进到下一环节。');
}

function executionStageCardMarkup(stage = {}, options = {}) {
    const {
        intro = '',
        actionsMarkup = '',
        metaMarkup = '',
        bodyMarkup = '',
    } = options;
    return `
        <section class="ams-card ams-quote-editor-panel ams-instance-editor-panel ams-stage-module-card">
            <div class="ams-stage-module-card-head">
                <span>${esc(stage.label)}</span>
                <em>主模块</em>
            </div>
            <div class="ams-stage-module-card-body">
                <p class="ams-field-help">${esc(intro)}</p>
                ${metaMarkup}
                ${bodyMarkup}
                ${actionsMarkup}
            </div>
        </section>
    `;
}

function executionStageFlowMarkup(stage = {}, deal = null) {
    const record = executionStageRecord(stage, deal);
    const renderer = executionStageRenderer(stage);
    if (renderer) return renderer(stage, deal, record);
    return `
        <div class="ams-stage-detail-stack">
            ${executionStageCardMarkup(stage, {
                intro: `当前页面只处理 ${esc(stage.label)} 节点内容，不混放其他阶段入口。`,
                bodyMarkup: `
                    <div class="ams-site-field-grid ams-site-field-grid-wide">
                        <div class="ams-field"><label>阶段状态</label><select class="ams-select" data-sales-flow-stage-field="stage_status">${selectOptionsMarkup(DEAL_STAGE_STATUS_OPTIONS, record.stage_status)}</select></div>
                        <div class="ams-field"><label>计划时间</label><input class="ams-input" type="datetime-local" data-sales-flow-stage-field="planned_at" value="${esc(datetimeLocalValue(record.planned_at))}"></div>
                        <div class="ams-field"><label>完成时间</label><input class="ams-input" type="datetime-local" data-sales-flow-stage-field="completed_at" value="${esc(datetimeLocalValue(record.completed_at))}"></div>
                    </div>
                    ${executionStageFieldGridMarkup(record, stageMetaFields(stage.key).map((field) => ({
                        key: field.key,
                        label: field.label,
                        type: field.type || 'text',
                        placeholder: field.placeholder || '',
                    })))}
                    <div class="ams-field">
                        <label>阶段备注</label>
                        <textarea class="ams-textarea" rows="4" data-sales-flow-stage-field="notes" placeholder="记录当前节点的说明、异常、结论和下一步。">${esc(record.notes)}</textarea>
                    </div>
                `,
            })}
            ${stageCommunicationSectionMarkup(stage.key, record)}
        </div>
    `;
}

function salesStageDetailRenderer(stage = {}) {
    const key = normalizeDealStageKey(stage.key);
    if (key === 'customer_profile') {
        return (deal, customer, input) => customerProfileFlowMarkup(customer, customerFlowDeals(customer.id, input), deal);
    }
    if (stage.scope === 'requirement') {
        return (deal) => requirementFlowMarkup(key, deal, moduleState.requirementEditor || createRequirementDraft());
    }
    if (stage.scope === 'quote') {
        return (deal) => quoteFlowMarkup(key, deal, moduleState.instanceEditor || createInstanceDraft());
    }
    return (deal) => executionStageFlowMarkup(stage, deal);
}

function salesStageContactsCardMarkup(stageKey = '', deal = null) {
    if (!deal?.id) return '';
    const record = stageRecordByKey(stageKey, moduleState.dealStageRecords) || createDealStageRecord({
        deal_id: deal.id,
        stage_key: stageKey,
        owner_name: deal.owner_name,
        owner_email: deal.owner_email,
    });
    return `
        <details class="ams-card ams-stage-log-card ams-fold-card ams-stage-module-fold">
            <summary class="ams-fold-summary">
                <span>节点双负责人</span>
                <em>售前 / 售后</em>
            </summary>
            <div class="ams-fold-body">
                <p class="ams-field-help">每个节点至少维护售前与售后两位联系人，便于报价、履约和运维协同。</p>
                ${stageContactFieldsMarkup(stageKey, record)}
                <div class="ams-row-actions">
                    <button class="ams-btn ams-btn-muted" type="button" id="ams-sales-stage-contacts-save">保存双负责人</button>
                </div>
            </div>
        </details>
    `;
}

function salesStageDetailMarkup(stageKey = '', deal = null, customer = {}, input = null) {
    const stage = dealStageDefinition(stageKey);
    if (!deal?.id && stage.key !== 'customer_profile') {
        return '<section class="ams-card"><div class="ams-empty">当前阶段还没有可处理的销售线。</div></section>';
    }
    const mainMarkup = salesStageDetailRenderer(stage)(deal, customer, input);
    return `
        ${salesStageShellMarkup(stage, deal, customer, mainMarkup)}
        ${salesStageContactsCardMarkup(stage.key, deal)}
    `;
}

function flowCustomerLabel(customer = {}, deal = null) {
    return text(customerDisplayName(customer || {}), text(deal?.title, '当前客户'));
}

async function updateDealLifecycle(input, dealId, patch = {}) {
    if (!dealId) throw new Error('缺少销售线 ID。');
    if (moduleState.dealLoadedId !== dealId) await fetchDealEditor(dealId);
    await saveDealDraft(input.user, {
        ...moduleState.dealEditor,
        ...patch,
        id: dealId,
    }, {
        stageRecords: moduleState.dealStageRecords,
        currentStage: patch.current_stage || moduleState.dealEditor?.current_stage,
    });
}

function salesFlowActionBarMarkup(buttonsMarkup = '', hint = '') {
    return `
        <div class="ams-editor-action-bar ams-sales-flow-action-bar">
            ${hint ? `<span class="ams-editor-action-hint">${esc(hint)}</span>` : ''}
            <div class="ams-row-actions">${buttonsMarkup}</div>
        </div>
    `;
}

function saveConfirmPayload(options = {}) {
    return {
        title: text(options.title, '确认保存当前节点？'),
        message: text(options.message, '保存后会覆盖当前草稿并同步到销售流水线。'),
        confirmLabel: text(options.confirmLabel, '确认保存'),
        danger: false,
    };
}

function advanceConfirmPayload(options = {}) {
    return {
        title: text(options.title, '确认推进到下一节点？'),
        message: text(options.message, '推进后当前节点将标记完成，并进入下一节点。'),
        confirmLabel: text(options.confirmLabel, '确认推进'),
        danger: false,
    };
}

function bindSalesCustomerActions(input, stageKey = '', customerId = '', customerFlow = false) {
    document.querySelectorAll('[data-sales-flow-customer-field]').forEach((node) => {
        node.addEventListener('input', () => {
            const field = node.dataset.salesFlowCustomerField || '';
            if (!field) return;
            moduleState.customerEditor[field] = node.value;
        });
    });

    document.getElementById('ams-sales-flow-customer-save')?.addEventListener('click', async (event) => {
        const confirmed = await confirmSalesAction(advanceConfirmPayload({
            title: '确认保存客户档案并进入获取需求？',
            message: '系统会先保存客户主档，并把当前销售线推进到“获取需求”节点。',
            confirmLabel: '确认并进入',
        }));
        if (!confirmed) return;
        await input.withButtonBusy(event.currentTarget, '保存中...', async () => {
            const saved = await saveCustomerDraft(input.user, moduleState.customerEditor);
            moduleState.customerEditor = createCustomerDraft(saved);
            const flow = await ensureCustomerRequirementFlow(input.user, saved);
            const nextDeal = flow?.deal || moduleState.dealEditor || null;
            input.showToast('客户档案已保存，正在进入获取需求。');
            window.location.assign(customerFlow
                ? customerFlowStageUrl('requirement_capture', nextDeal, saved.id)
                : adminPageUrl('quote-pipeline', { stage: 'requirement_capture', customer: saved.id, deal: flow?.deal?.id }));
        });
    });
}

function bindSalesRequirementActions(input, stageKey = '', customerId = '', customerFlow = false) {
    document.querySelectorAll('[data-sales-flow-requirement-field]').forEach((node) => {
        const apply = () => {
            const field = node.dataset.salesFlowRequirementField || '';
            if (!field) return;
            moduleState.requirementEditor[field] = node.value;
        };
        node.addEventListener('input', apply);
        if (node.tagName === 'SELECT') node.addEventListener('change', apply);
    });

    document.querySelectorAll('[data-sales-flow-requirement-answer]').forEach((node) => {
        node.addEventListener('input', () => {
            const field = node.dataset.salesFlowRequirementAnswer || '';
            if (!field) return;
            const answers = normalizeRequirementAnswers(moduleState.requirementEditor.answers);
            answers[field] = node.value;
            moduleState.requirementEditor.answers = answers;
        });
    });

    document.getElementById('ams-sales-flow-requirement-save')?.addEventListener('click', async (event) => {
        const confirmed = await confirmSalesAction(saveConfirmPayload({
            title: '确认保存需求信息？',
            message: '保存后将更新客户需求记录，供后续“确认需求”与报价基线使用。',
        }));
        if (!confirmed) return;
        await input.withButtonBusy(event.currentTarget, '保存中...', async () => {
            const answers = normalizeRequirementAnswers(moduleState.requirementEditor.answers);
            moduleState.requirementEditor.answers = answers;
            const saved = await saveRequirementDraft(input.user, moduleState.requirementEditor);
            moduleState.requirementEditor = createRequirementDraft(saved);
            input.showToast('需求已保存。');
            await input.rerender();
        });
    });

    document.getElementById('ams-sales-flow-requirement-note-submit')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '提交中...', async () => {
            const answers = normalizeRequirementAnswers(moduleState.requirementEditor.answers);
            const noteDraft = text(answers.communication_note_draft);
            if (!noteDraft) {
                input.showToast('请先填写沟通备注。', true);
                return;
            }
            answers.communication_notes = [
                {
                    note: noteDraft,
                    created_at: new Date().toISOString(),
                    author: text(input.user?.email || input.user?.id, 'sales'),
                },
                ...(answers.communication_notes || []),
            ];
            answers.communication_note_draft = '';
            moduleState.requirementEditor.answers = answers;
            const saved = await saveRequirementDraft(input.user, moduleState.requirementEditor);
            moduleState.requirementEditor = createRequirementDraft(saved);
            input.showToast('沟通备注已提交。');
            await input.rerender();
        });
    });

    document.getElementById('ams-sales-flow-requirement-open-link')?.addEventListener('click', () => {
        const requirement = createRequirementDraft(moduleState.requirementEditor);
        if (!requirement.public_slug || !requirement.public_token) {
            input.showToast('请先保存需求，再生成客户需求链接。', true);
            return;
        }
        markRequirementCustomerUpdateSeen(requirement);
        document.getElementById('ams-sales-flow-requirement-open-link')?.classList.remove('has-alert-dot');
        document.querySelector('#ams-sales-flow-requirement-open-link .ams-btn-alert-dot')?.remove();
        window.open(requirementPublicUrl(requirement.public_slug, requirement.public_token, { readonly: true }), '_blank', 'noopener');
    });

    ensureSalesFlowShareMenuBindings();
    const salesFlowRequirementShareMenu = document.querySelector('.ams-sales-flow-requirement-share-menu');
    const salesFlowRequirementPosterModal = document.getElementById('ams-sales-flow-requirement-share-poster-modal');
    const salesFlowRequirementPosterImage = document.getElementById('ams-sales-flow-requirement-share-poster-image');
    const salesFlowRequirementPosterDownload = document.getElementById('ams-sales-flow-requirement-share-poster-download');
    const closeSalesFlowRequirementPosterModal = () => {
        if (salesFlowRequirementPosterModal) salesFlowRequirementPosterModal.hidden = true;
    };

    document.getElementById('ams-sales-flow-requirement-share-link')?.addEventListener('click', async () => {
        const requirement = createRequirementDraft(moduleState.requirementEditor);
        if (!requirement.public_slug || !requirement.public_token) {
            input.showToast('请先保存需求，再生成客户需求链接。', true);
            return;
        }
        const payload = requirementShareCopyText(requirement);
        try {
            await navigator.clipboard.writeText(payload);
            input.showToast('客户需求分享文案已复制。');
        } catch (_error) {
            input.showToast(payload, false);
        }
        if (salesFlowRequirementShareMenu) salesFlowRequirementShareMenu.removeAttribute('open');
    });

    document.getElementById('ams-sales-flow-requirement-share-poster')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '生成中...', async () => {
            const requirement = createRequirementDraft(moduleState.requirementEditor);
            if (!requirement.public_slug || !requirement.public_token) {
                input.showToast('请先保存需求，再生成客户需求链接。', true);
                return;
            }
            try {
                const posterUrl = await requirementSharePosterDataUrl(requirement);
                if (salesFlowRequirementPosterImage) salesFlowRequirementPosterImage.setAttribute('src', posterUrl);
                if (salesFlowRequirementPosterDownload) salesFlowRequirementPosterDownload.setAttribute('href', posterUrl);
                if (salesFlowRequirementPosterModal) salesFlowRequirementPosterModal.hidden = false;
                if (salesFlowRequirementShareMenu) salesFlowRequirementShareMenu.removeAttribute('open');
            } catch (error) {
                input.showToast(error.message || '二维码海报生成失败。', true);
            }
        });
    });

    document.getElementById('ams-sales-flow-requirement-share-poster-copy')?.addEventListener('click', async () => {
        const requirement = createRequirementDraft(moduleState.requirementEditor);
        if (!requirement.public_slug || !requirement.public_token) {
            input.showToast('请先保存需求，再生成客户需求链接。', true);
            return;
        }
        const payload = requirementShareCopyText(requirement);
        try {
            await navigator.clipboard.writeText(payload);
            input.showToast('海报分享文案已复制。');
        } catch (_error) {
            input.showToast(payload, false);
        }
    });
    salesFlowRequirementPosterModal?.querySelectorAll('[data-sales-flow-requirement-share-poster-close]').forEach((node) => {
        node.addEventListener('click', closeSalesFlowRequirementPosterModal);
    });

    document.getElementById('ams-sales-flow-requirement-confirm')?.addEventListener('click', async (event) => {
        const confirmed = await confirmSalesAction({
            title: '确认需求并进入报价？',
            message: '确认后当前需求会被锁定为报价基线，后续将直接进入转入报价节点。',
            confirmLabel: '确认需求',
            danger: false,
        });
        if (!confirmed) return;
        await input.withButtonBusy(event.currentTarget, '确认中...', async () => {
            const saved = await confirmRequirementForDeal(input.user, moduleState.requirementEditor);
            input.showToast('需求已确认。');
            window.location.assign(customerFlow
                ? customerFlowStageUrl('quote_draft', dealById(saved.deal_id), customerId)
                : adminPageUrl('quote-pipeline', { stage: 'quote_draft', deal: saved.deal_id }));
        });
    });
}

function bindSalesQuoteActions(input, stageKey = '', customerId = '', customerFlow = false) {
    const quotePublicReady = () => quotePublishedForStage(stageKey, moduleState.instanceEditor);

    document.getElementById('ams-sales-flow-instance-product')?.addEventListener('change', (event) => {
        moduleState.pipelineProductSelection = event.currentTarget.value || '';
    });

    document.getElementById('ams-sales-flow-instance-create')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '生成中...', async () => {
            const deal = dealById(readAdminPageParam('deal'));
            const productId = moduleState.pipelineProductSelection || '';
            if (!deal?.id) throw new Error('请先选中一条销售线。');
            const instance = await createInstanceFromProduct(input.user, productId, { dealId: deal.id });
            await fetchInstanceEditor(instance.id);
            input.showToast('报价草稿已生成。');
            window.location.assign(customerFlow
                ? customerFlowStageUrl('quote_draft', dealById(instance.deal_id), customerId)
                : adminPageUrl('quote-pipeline', { stage: 'quote_draft', deal: instance.deal_id }));
        });
    });

    ['ams-sales-flow-instance-open', 'ams-sales-flow-instance-open-inline'].forEach((id) => {
        document.getElementById(id)?.addEventListener('click', () => {
            if (!moduleState.instanceEditor?.id) return;
            window.open(quoteEditorUrl('instance', moduleState.instanceEditor.id, {
                dealId: text(moduleState.instanceEditor?.deal_id || readAdminPageParam('deal')),
                stage: normalizeDealStageKey(stageKey),
                customerId,
                returnMode: customerFlow ? 'customer-flow' : 'pipeline',
            }), '_blank', 'noopener');
        });
    });

    const ensureQuoteConfirmedRecord = async () => {
        let quoteConfirmedRecord = stageRecordByKey('quote_confirmed', moduleState.dealStageRecords);
        if (text(quoteConfirmedRecord?.public_slug) && text(quoteConfirmedRecord?.public_token)) return quoteConfirmedRecord;
        const activeDeal = dealById(text(moduleState.dealEditor?.id || moduleState.instanceEditor?.deal_id));
        if (!activeDeal?.id) return quoteConfirmedRecord;
        try {
            quoteConfirmedRecord = await ensurePublicStageConfirmationLink(input.user, 'quote_confirmed', activeDeal);
            moduleState.dealStageRecords = activeDeal ? dealCurrentRecords(moduleState.dealEditor || activeDeal) : moduleState.dealStageRecords;
        } catch (_error) {
            return quoteConfirmedRecord;
        }
        return quoteConfirmedRecord;
    };

    document.getElementById('ams-sales-flow-instance-open-public')?.addEventListener('click', async () => {
        const instance = moduleState.instanceEditor;
        if (!quotePublicReady()) {
            input.showToast('请先发布报价，再查看用户报价页。', true);
            return;
        }
        const quoteConfirmedRecord = await ensureQuoteConfirmedRecord();
        window.open(quotePublicUrlForStage(instance, quoteConfirmedRecord), '_blank', 'noopener');
    });

    document.getElementById('ams-sales-flow-open-requirement-readonly')?.addEventListener('click', () => {
        const instance = moduleState.instanceEditor;
        const activeDeal = dealById(text(moduleState.dealEditor?.id || instance?.deal_id));
        const requirement = quoteRequirementForStage(activeDeal, instance);
        if (!(text(requirement?.public_slug) && text(requirement?.public_token))) {
            input.showToast('当前还没有可查看的用户需求入口。', true);
            return;
        }
        window.open(requirementPublicUrl(requirement.public_slug, requirement.public_token, { readonly: true }), '_blank', 'noopener');
    });

    const salesFlowQuoteShareMenu = document.querySelector('.ams-sales-flow-quote-share-menu');
    salesFlowQuoteShareMenu?.querySelector('summary')?.addEventListener('click', (event) => {
        if (quotePublicReady()) return;
        event.preventDefault();
        input.showToast('请先发布报价，再分享报价。', true);
    });
    const salesFlowQuotePosterModal = document.getElementById('ams-sales-flow-quote-share-poster-modal');
    const salesFlowQuotePosterImage = document.getElementById('ams-sales-flow-quote-share-poster-image');
    const salesFlowQuotePosterDownload = document.getElementById('ams-sales-flow-quote-share-poster-download');
    const closeSalesFlowQuotePosterModal = () => {
        if (salesFlowQuotePosterModal) salesFlowQuotePosterModal.hidden = true;
    };

    document.getElementById('ams-sales-flow-instance-share-link')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '复制中...', async () => {
            const instance = moduleState.instanceEditor;
            if (!quotePublicReady()) {
                input.showToast('请先发布报价，再复制对外报价链接。', true);
                return;
            }
            const quoteConfirmedRecord = await ensureQuoteConfirmedRecord();
            const payload = quoteShareCopyText(instance, {
                url: quotePublicUrlForStage(instance, quoteConfirmedRecord),
            });
            try {
                await navigator.clipboard.writeText(payload);
                input.showToast('报价链接和对外说明已复制。');
            } catch (_error) {
                input.showToast(payload, false);
            }
            if (salesFlowQuoteShareMenu) salesFlowQuoteShareMenu.removeAttribute('open');
        });
    });

    document.getElementById('ams-sales-flow-instance-share-poster')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '生成中...', async () => {
            const instance = moduleState.instanceEditor;
            if (!quotePublicReady()) {
                input.showToast('请先发布报价，再分享二维码。', true);
                return;
            }
            const quoteConfirmedRecord = await ensureQuoteConfirmedRecord();
            try {
                const posterUrl = await quoteSharePosterDataUrl(instance, {
                    url: quotePublicUrlForStage(instance, quoteConfirmedRecord),
                });
                if (salesFlowQuotePosterImage) salesFlowQuotePosterImage.setAttribute('src', posterUrl);
                if (salesFlowQuotePosterDownload) salesFlowQuotePosterDownload.setAttribute('href', posterUrl);
                if (salesFlowQuotePosterModal) salesFlowQuotePosterModal.hidden = false;
                if (salesFlowQuoteShareMenu) salesFlowQuoteShareMenu.removeAttribute('open');
            } catch (error) {
                input.showToast(error.message || '二维码海报生成失败。', true);
            }
        });
    });

    document.getElementById('ams-sales-flow-quote-share-poster-copy-link')?.addEventListener('click', async () => {
        const instance = moduleState.instanceEditor;
        if (!quotePublicReady()) {
            input.showToast('请先发布报价，再复制分享说明。', true);
            return;
        }
        const quoteConfirmedRecord = await ensureQuoteConfirmedRecord();
        const payload = quoteShareCopyText(instance, {
            url: quotePublicUrlForStage(instance, quoteConfirmedRecord),
        });
        try {
            await navigator.clipboard.writeText(payload);
            input.showToast('海报说明文案已复制。');
        } catch (_error) {
            input.showToast(payload, false);
        }
    });

    salesFlowQuotePosterModal?.querySelectorAll('[data-sales-flow-quote-share-poster-close]').forEach((button) => {
        button.addEventListener('click', closeSalesFlowQuotePosterModal);
    });

    document.querySelectorAll('[data-sales-flow-open-public-confirmation]').forEach((button) => {
        button.addEventListener('click', async (event) => {
            const targetStageKey = normalizeDealStageKey(button.dataset.salesFlowOpenPublicConfirmation || stageKey);
            const linkLabel = targetStageKey === 'production_scheduled' ? '客户生产进度页' : '客户确认入口';
            const activeDeal = dealById(text(moduleState.dealEditor?.id || moduleState.instanceEditor?.deal_id || moduleState.requirementEditor?.deal_id));
            const existingRecord = stageRecordByKey(targetStageKey, moduleState.dealStageRecords);
            const hasExistingLink = Boolean(text(existingRecord?.public_slug) && text(existingRecord?.public_token));
            const popup = window.open('about:blank', '_blank');
            await input.withButtonBusy(event.currentTarget, '打开中...', async () => {
                try {
                    const stageRecord = hasExistingLink
                        ? existingRecord
                        : await ensurePublicStageConfirmationLink(input.user, targetStageKey, activeDeal);
                    const targetUrl = stageCustomerFacingUrl(targetStageKey, stageRecord, activeDeal);
                    if (popup) {
                        popup.location.replace(targetUrl);
                        try { popup.opener = null; } catch (_error) { /* noop */ }
                    } else {
                        window.open(targetUrl, '_blank', 'noopener');
                    }
                    input.showToast(`${linkLabel}已打开。`);
                } catch (error) {
                    popup?.close();
                    throw error;
                }
            });
        });
    });

    document.querySelectorAll('[data-sales-flow-copy-public-confirmation]').forEach((button) => {
        button.addEventListener('click', async (event) => {
            const targetStageKey = normalizeDealStageKey(button.dataset.salesFlowCopyPublicConfirmation || stageKey);
            const linkLabel = targetStageKey === 'production_scheduled' ? '客户生产进度链接' : '客户确认链接';
            const activeDeal = dealById(text(moduleState.dealEditor?.id || moduleState.instanceEditor?.deal_id || moduleState.requirementEditor?.deal_id));
            const existingRecord = stageRecordByKey(targetStageKey, moduleState.dealStageRecords);
            const hasExistingLink = Boolean(text(existingRecord?.public_slug) && text(existingRecord?.public_token));
            await input.withButtonBusy(event.currentTarget, hasExistingLink ? '复制中...' : '生成中...', async () => {
                const stageRecord = hasExistingLink
                    ? existingRecord
                    : await ensurePublicStageConfirmationLink(input.user, targetStageKey, activeDeal);
                const payload = stageConfirmationCopyText(targetStageKey, stageRecord, activeDeal);
                try {
                    await navigator.clipboard.writeText(payload);
                    input.showToast(hasExistingLink ? `${linkLabel}已复制。` : `${linkLabel}已生成并复制。`);
                } catch (_error) {
                    input.showToast(payload, false);
                }
            });
        });
    });

    document.getElementById('ams-sales-flow-quote-save')?.addEventListener('click', async (event) => {
        const confirmed = await confirmSalesAction(saveConfirmPayload({
            title: '确认保存报价确认条款？',
            message: '保存后会覆盖当前条款内容，并作为报价确认节点的内部基线。',
        }));
        if (!confirmed) return;
        await input.withButtonBusy(event.currentTarget, '保存中...', async () => {
            flushStageCommunicationDraft(stageKey, input.user?.email || input.user?.id || '销售沟通');
            if (moduleState.instanceEditor?.id) {
                await saveInstanceDraft(input.user, moduleState.instanceEditor);
            }
            if (moduleState.dealEditor?.id) {
                await saveDealDraft(input.user, moduleState.dealEditor, {
                    stageRecords: moduleState.dealStageRecords,
                    currentStage: stageKey,
                });
            }
            input.showToast('报价节点已保存。');
            await input.rerender();
        });
    });

    document.getElementById('ams-sales-flow-instance-confirm')?.addEventListener('click', async (event) => {
        const quoteConfirmedRecord = stageRecordByKey('quote_confirmed', moduleState.dealStageRecords);
        if (!quoteConfirmationSubmitted(quoteConfirmedRecord)) {
            input.showToast('客户还未提交报价确认，暂时不能推进到签约合同。', true);
            return;
        }
        const confirmed = await confirmSalesAction({
            title: '确认报价并推进到签约合同？',
            message: '确认后当前报价版本会被锁定为正式商务基线，并自动进入签约合同节点。',
            confirmLabel: '确认报价',
            danger: false,
        });
        if (!confirmed) return;
        await input.withButtonBusy(event.currentTarget, '确认中...', async () => {
            flushStageCommunicationDraft(stageKey, input.user?.email || input.user?.id || '销售沟通');
            const saved = await confirmQuoteForDeal(input.user, moduleState.instanceEditor);
            input.showToast('报价已确认。');
            window.location.assign(customerFlow
                ? customerFlowStageUrl('contract_signed', dealById(saved.deal_id), customerId)
                : adminPageUrl('quote-pipeline', { stage: 'contract_signed', deal: saved.deal_id }));
        });
    });
}

function bindSalesExecutionActions(input, stageKey = '', customerId = '', customerFlow = false) {
    document.getElementById('ams-sales-flow-stage-note-submit')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '提交中...', async () => {
            const record = stageRecordByKey(stageKey, moduleState.dealStageRecords);
            const noteDraft = text(record?.meta?.communication_note_draft);
            if (!noteDraft) {
                input.showToast('请先填写沟通备注。', true);
                return;
            }
            appendStageCommunicationLog(stageKey, noteDraft, input.user?.email || input.user?.id || '销售沟通');
            if (moduleState.dealEditor?.id) {
                const saved = await saveDealDraft(input.user, moduleState.dealEditor, {
                    stageRecords: moduleState.dealStageRecords,
                    currentStage: stageKey,
                });
                await fetchDealEditor(saved.id);
            }
            input.showToast('沟通备注已提交。');
            await input.rerender();
        });
    });

    document.querySelectorAll('[data-sales-flow-stage-field]').forEach((node) => {
        const apply = () => {
            const field = node.dataset.salesFlowStageField || '';
            replaceStageRecord(stageKey, (record) => {
                if (field === 'stage_status') record.stage_status = normalizeDealStageStatus(node.value);
                else if (field === 'planned_at' || field === 'completed_at') record[field] = parseDateTimeLocal(node.value);
                else record[field] = node.value;
                return record;
            });
        };
        node.addEventListener('input', apply);
        if (node.tagName === 'SELECT') node.addEventListener('change', apply);
    });

    document.querySelectorAll('[data-sales-flow-stage-meta]').forEach((node) => {
        const apply = () => {
            setStageRecordMeta(stageKey, node.dataset.salesFlowStageMeta, node.value);
        };
        node.addEventListener('input', apply);
        if (node.tagName === 'SELECT') node.addEventListener('change', apply);
    });

    document.getElementById('ams-sales-flow-stage-save')?.addEventListener('click', async (event) => {
        const confirmed = await confirmSalesAction(saveConfirmPayload({
            title: `确认保存${dealStageLabel(stageKey)}节点？`,
            message: '保存后将同步当前节点状态、负责人信息和沟通记录。',
        }));
        if (!confirmed) return;
        await input.withButtonBusy(event.currentTarget, '保存中...', async () => {
            flushStageCommunicationDraft(stageKey, input.user?.email || input.user?.id || '销售沟通');
            const saved = await saveDealDraft(input.user, moduleState.dealEditor, {
                stageRecords: moduleState.dealStageRecords,
                currentStage: stageKey,
            });
            await fetchDealEditor(saved.id);
            input.showToast('阶段已保存。');
            await input.rerender();
        });
    });

    document.getElementById('ams-sales-flow-stage-complete')?.addEventListener('click', async (event) => {
        const finalStage = normalizeDealStageKey(stageKey) === 'support_active';
        const confirmed = await confirmSalesAction({
            title: finalStage ? '确认完成整条销售流程？' : `确认完成${dealStageLabel(stageKey)}并进入下一节点？`,
            message: finalStage
                ? '完成后这条销售流程会进入已完成状态，不再继续往后推进。'
                : '推进后当前节点会被标记为已完成，并自动进入下一节点。',
            confirmLabel: finalStage ? '确认完成' : '确认推进',
            danger: !finalStage,
        });
        if (!confirmed) return;
        await input.withButtonBusy(event.currentTarget, '推进中...', async () => {
            flushStageCommunicationDraft(stageKey, input.user?.email || input.user?.id || '销售沟通');
            const saved = await saveAndAdvanceDeal(input.user, {
                id: moduleState.dealEditor?.id,
                deal_status: finalStage ? 'completed' : moduleState.dealEditor?.deal_status,
            }, [stageKey], finalStage ? 'support_active' : nextStageKey(stageKey));
            input.showToast(finalStage ? '销售线已完成。' : '已推进到下一节点。');
            window.location.assign(customerFlow
                ? customerFlowStageUrl(finalStage ? 'support_active' : nextStageKey(stageKey), saved, customerId)
                : adminPageUrl('quote-pipeline', { stage: finalStage ? 'support_active' : nextStageKey(stageKey), deal: saved.id }));
        });
    });
}

function bindSalesStageListActions(input, stageKey = '', customerId = '', customerFlow = false) {
    const content = document.getElementById('ams-content');
    if (content) hydrateCustomSelects(content);

    document.getElementById('ams-sales-stage-search')?.addEventListener('input', (event) => {
        moduleState.dealSearch = event.currentTarget.value || '';
        void input.rerender();
    });

    document.querySelectorAll('[data-sales-stage-select]').forEach((button) => {
        button.addEventListener('click', () => {
            const href = button.dataset.salesStageSelect;
            if (href) window.location.assign(href);
        });
    });

    document.getElementById('ams-sales-stage-contacts-save')?.addEventListener('click', async (event) => {
        const confirmed = await confirmSalesAction(saveConfirmPayload({
            title: `确认保存${dealStageLabel(stageKey)}双负责人？`,
            message: '保存后会更新当前节点的售前/售后负责人信息。',
        }));
        if (!confirmed) return;
        await input.withButtonBusy(event.currentTarget, '保存中...', async () => {
            if (!moduleState.dealEditor?.id) {
                input.showToast('当前节点没有可保存的销售线。', true);
                return;
            }
            const saved = await saveDealDraft(input.user, moduleState.dealEditor, {
                stageRecords: moduleState.dealStageRecords,
                currentStage: stageKey,
            });
            await fetchDealEditor(saved.id);
            input.showToast('节点双负责人已保存。');
            await input.rerender();
        });
    });

    document.querySelectorAll('[data-customer-activity-filter]').forEach((button) => {
        button.addEventListener('click', () => {
            moduleState.customerActivityFilter = button.dataset.customerActivityFilter || 'all';
            void input.rerender();
        });
    });

    if (!customerFlow) {
        document.querySelectorAll('[data-sales-stage-archive]').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const confirmed = await confirmSalesAction({
                    title: '确认归档这条销售流程？',
                    message: '归档后它会从默认推进列表中隐藏，但历史记录仍会保留。',
                    confirmLabel: '确认归档',
                });
                if (!confirmed) return;
                await input.withButtonBusy(event.currentTarget, '归档中...', async () => {
                    await updateDealLifecycle(input, button.dataset.salesStageArchive, {
                        is_archived: true,
                        archived_at: new Date().toISOString(),
                        archived_by: input.user?.id || '',
                    });
                    input.showToast('销售线已归档。');
                    await input.rerender();
                });
            });
        });
        document.querySelectorAll('[data-sales-stage-void]').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const confirmed = await confirmSalesAction({
                    title: '确认作废这条销售流程？',
                    message: '作废后这条销售流程会退出主推进链，只保留历史痕迹用于追溯。',
                    confirmLabel: '确认作废',
                });
                if (!confirmed) return;
                await input.withButtonBusy(event.currentTarget, '作废中...', async () => {
                    await updateDealLifecycle(input, button.dataset.salesStageVoid, {
                        deal_status: 'cancelled',
                    });
                    input.showToast('销售线已作废。');
                    await input.rerender();
                });
            });
        });
    }

    bindSalesCustomerActions(input, stageKey, customerId, customerFlow);
    bindSalesRequirementActions(input, stageKey, customerId, customerFlow);
    bindSalesQuoteActions(input, stageKey, customerId, customerFlow);
    bindSalesExecutionActions(input, stageKey, customerId, customerFlow);
}

export async function renderQuotePipelinePage(input) {
    try {
        await ensureBaseData();
        await fetchUnreadCustomerActivitySummary(currentSalesStageParam('requirement_capture'), input.user, input);
    } catch (error) {
        if (isQuoteSetupMissing(error)) {
            renderQuoteSetupRequired(input, error);
            return;
        }
        throw error;
    }

    const stageKey = currentSalesStageParam('requirement_capture');
    window.history.replaceState({}, '', adminPageUrl('quote-customers', { stage: stageKey }));
    await renderQuoteCustomersPage(input);
    return;

    if (stageKey === 'customer_profile') {
        await renderQuoteCustomersPage(input);
        return;
    }
    const stageDeals = visibleStageDeals(stageKey, input);
    const requestedDealId = text(readAdminPageParam('deal'));
    const activeDeal = stageDeals.find((deal) => deal.id === requestedDealId) || stageDeals[0] || null;
    if (activeDeal?.id && moduleState.dealLoadedId !== activeDeal.id) await fetchDealEditor(activeDeal.id);
    if (activeDeal?.customer_id) await ensureCustomerEditorForSalesFlow(activeDeal.customer_id);
    if (dealStageDefinition(stageKey).scope === 'requirement') await ensureRequirementEditorForDeal(activeDeal);
    if (dealStageDefinition(stageKey).scope === 'quote') await ensureInstanceEditorForDeal(activeDeal);
    if (normalizeDealStageKey(stageKey) === 'quote_confirmed' && moduleState.instanceEditor?.id) {
        moduleState.instanceEditor = await ensurePublishedQuoteForStage(input.user, stageKey, moduleState.instanceEditor);
    }
    if (
        normalizeDealStageKey(stageKey) === 'quote_draft'
        && activeDeal?.id
        && normalizeDealStageKey(activeDeal.current_stage) === 'quote_draft'
        && quoteInstanceReadyForConfirmation(moduleState.instanceEditor)
    ) {
        const advancedDeal = await advancePublishedQuoteDeal(input.user, moduleState.instanceEditor);
        const nextDeal = dealById(advancedDeal.id) || advancedDeal;
        window.history.replaceState({}, '', adminPageUrl('quote-pipeline', { stage: 'quote_confirmed', deal: nextDeal.id }));
        await renderQuotePipelinePage(input);
        return;
    }
    moduleState.dealEditor = activeDeal ? createDealDraft(moduleState.dealEditor || activeDeal) : createDealDraft();
    moduleState.dealStageRecords = activeDeal ? dealCurrentRecords(moduleState.dealEditor) : [];
    if (activeDeal?.customer_id) {
        await appendSalesActivity({
            customer_id: activeDeal.customer_id,
            deal_id: activeDeal.id,
            requirement_id: moduleState.requirementEditor?.id,
            instance_id: moduleState.instanceEditor?.id,
            actor_type: 'sales',
            actor_id: input.user?.id,
            actor_label: input.user?.email || input.user?.id || 'sales',
            activity_type: 'page_view',
            entity_type: 'deal',
            entity_id: activeDeal.id,
            page_key: 'quote-pipeline',
            stage_key: stageKey,
            action_label: `进入阶段总览 · ${dealStageLabel(stageKey)}`,
            detail_json: {
                summary: text(activeDeal.title),
            },
        });
    }

    renderSalesPageFrame(input, stagePageTitle(stageKey), stagePageSub(stageKey), `
        <section class="ams-quote-layout ams-sales-stage-layout">
            <aside class="ams-card ams-quote-list-panel">
                <div class="ams-section-head"><div><h3>总览模式 · ${esc(dealStageLabel(stageKey))} 列表</h3><p>当前阶段共 ${stageDeals.length} 条销售线，点击后可进入独立客户流水线。</p></div></div>
                <div class="ams-field">
                    <label>搜索销售线</label>
                    <input id="ams-sales-stage-search" class="ams-input" value="${esc(moduleState.dealSearch)}" placeholder="搜索客户 / 销售线标题 / 负责人 / 下一动作">
                </div>
                <div class="ams-quote-list">
                    ${stageDeals.length ? stageDeals.map((deal) => pipelineListCardMarkup(stageKey, deal, { selectedDealId: activeDeal?.id })).join('') : '<div class="ams-empty">当前阶段没有待处理销售线。</div>'}
                </div>
            </aside>
            ${salesStageDetailMarkup(stageKey, activeDeal, moduleState.customerEditor || createCustomerDraft(), input)}
        </section>
    `, {
        deal: null,
        currentStage: stageKey,
        page: 'quote-pipeline',
        pipelineMode: 'overview',
    });
    bindSalesPageChrome(input);
    bindSalesStageListActions(input, stageKey, '', false);
}

export async function renderQuoteCustomerFlowPage(input) {
    try {
        await ensureBaseData();
        await fetchUnreadStageActivitySummary(input.user);
    } catch (error) {
        if (isQuoteSetupMissing(error)) {
            renderQuoteSetupRequired(input, error);
            return;
        }
        throw error;
    }

    const stageKey = currentSalesStageParam('customer_profile');
    const requestedDealId = text(readAdminPageParam('deal'));
    let customerId = text(readAdminPageParam('customer'));
    let requestedDeal = dealById(requestedDealId);
    if (requestedDealId && !requestedDeal) {
        try {
            requestedDeal = await fetchDealEditor(requestedDealId);
        } catch (_error) {
            requestedDeal = null;
        }
    }
    if (!customerId && requestedDeal?.customer_id) customerId = requestedDeal.customer_id;
    if (!customerId) {
        renderSalesPageFrame(input, '独立客户流水线', '先从客户档案或总流水线选择一条销售线。', '<section class="ams-card"><div class="ams-empty">当前没有可打开的客户流水线。</div></section>', {
            deal: null,
            currentStage: stageKey,
            page: 'quote-customer-flow',
            pipelineMode: 'detail',
        });
        bindSalesPageChrome(input);
        return;
    }

    await ensureCustomerEditorForSalesFlow(customerId);
    const deals = customerFlowDeals(customerId, input);
    const requestedDealFallback = requestedDeal?.id && text(requestedDeal.customer_id) === customerId
        ? (dealById(requestedDeal.id) || requestedDeal)
        : null;
    const activeDeal = deals.find((deal) => deal.id === requestedDealId) || requestedDealFallback || deals[0] || null;
    if (!activeDeal && stageKey !== 'customer_profile') {
        window.history.replaceState({}, '', customerFlowStageUrl('customer_profile', null, customerId));
        await renderQuoteCustomerFlowPage(input);
        return;
    }
    if (
        activeDeal
        && stageOrderIndex(activeDeal.current_stage) > stageOrderIndex(stageKey)
        && stageOrderIndex(stageKey) >= 0
    ) {
        window.history.replaceState({}, '', customerFlowStageUrl(activeDeal.current_stage, activeDeal, customerId));
        await renderQuoteCustomerFlowPage(input);
        return;
    }
    if (activeDeal?.id && moduleState.dealLoadedId !== activeDeal.id) await fetchDealEditor(activeDeal.id);
    if (dealStageDefinition(stageKey).scope === 'requirement') await ensureRequirementEditorForDeal(activeDeal, input.user);
    const syncedActiveDeal = activeDeal?.id ? (dealById(activeDeal.id) || activeDeal) : activeDeal;
    if (
        syncedActiveDeal
        && stageOrderIndex(syncedActiveDeal.current_stage) > stageOrderIndex(stageKey)
        && stageOrderIndex(stageKey) >= 0
    ) {
        window.history.replaceState({}, '', customerFlowStageUrl(syncedActiveDeal.current_stage, syncedActiveDeal, customerId));
        await renderQuoteCustomerFlowPage(input);
        return;
    }
    if (dealStageDefinition(stageKey).scope === 'quote') await ensureInstanceEditorForDeal(syncedActiveDeal);
    if (normalizeDealStageKey(stageKey) === 'quote_confirmed' && moduleState.instanceEditor?.id) {
        moduleState.instanceEditor = await ensurePublishedQuoteForStage(input.user, stageKey, moduleState.instanceEditor);
    }
    if (
        normalizeDealStageKey(stageKey) === 'quote_draft'
        && syncedActiveDeal?.id
        && normalizeDealStageKey(syncedActiveDeal.current_stage) === 'quote_draft'
        && quoteInstanceReadyForConfirmation(moduleState.instanceEditor)
    ) {
        const advancedDeal = await advancePublishedQuoteDeal(input.user, moduleState.instanceEditor);
        const nextDeal = dealById(advancedDeal.id) || advancedDeal;
        window.history.replaceState({}, '', customerFlowStageUrl('quote_confirmed', nextDeal, customerId));
        await renderQuoteCustomerFlowPage(input);
        return;
    }
    const stageNeedsPublicLink = ['quote_confirmed', 'production_scheduled'].includes(normalizeDealStageKey(stageKey));
    if (stageNeedsPublicLink && syncedActiveDeal?.id && moduleState.dealStagePublicLinkSupported) {
        const confirmationRecord = stageRecordByKey(stageKey, moduleState.dealStageRecords);
        if (!(text(confirmationRecord?.public_slug) && text(confirmationRecord?.public_token))) {
            try {
                await ensurePublicStageConfirmationLink(input.user, stageKey, syncedActiveDeal);
            } catch (error) {
                if (!isDealStagePublicLinkSchemaMissing(error) && !text(error?.message).includes('公开确认入口依赖数据库迁移')) throw error;
            }
        }
    }
    moduleState.dealEditor = syncedActiveDeal ? createDealDraft(moduleState.dealEditor || syncedActiveDeal) : createDealDraft();
    moduleState.dealStageRecords = syncedActiveDeal ? dealCurrentRecords(moduleState.dealEditor) : [];
    const customerLabel = flowCustomerLabel(moduleState.customerEditor || {}, syncedActiveDeal);
    await appendSalesActivity({
        customer_id: customerId,
        deal_id: syncedActiveDeal?.id,
        requirement_id: moduleState.requirementEditor?.id,
        instance_id: moduleState.instanceEditor?.id,
        actor_type: 'sales',
        actor_id: input.user?.id,
        actor_label: input.user?.email || input.user?.id || 'sales',
        activity_type: 'page_view',
        entity_type: 'deal',
        entity_id: syncedActiveDeal?.id || customerId,
        page_key: 'quote-customer-flow',
        stage_key: stageKey,
        action_label: `进入客户流水线 · ${dealStageLabel(stageKey)}`,
        detail_json: {
            summary: customerLabel,
        },
    });
    const timeline = await fetchCustomerActivityTimeline(customerId, input.user);
    await markCustomerActivitiesRead(customerId, input.user, timeline.map((item) => item.id));
    await fetchUnreadStageActivitySummary(input.user);

    const stageLabel = dealStageLabel(stageKey);
    renderSalesPageFrame(input, `独立客户流水线 · ${stageLabel}`, `客户模式：${customerLabel} · 围绕单个客户回看已完成节点，并继续推进当前节点。`, `
        <section class="ams-quote-layout ams-sales-stage-layout ams-quote-layout-single">
            <div class="ams-sales-flow-detail-stack">
                ${salesStageDetailMarkup(stageKey, syncedActiveDeal, moduleState.customerEditor || createCustomerDraft(), input)}
                ${customerActivityTimelinePanelMarkup(customerId)}
            </div>
        </section>
    `, {
        deal: syncedActiveDeal,
        customerId,
        currentStage: stageKey,
        page: 'quote-customer-flow',
        pipelineMode: 'detail',
    });
    bindSalesPageChrome(input);
    bindSalesStageListActions(input, stageKey, customerId, true);
}

export async function renderQuoteSalesDashboardPage(input) {
    try {
        await ensureBaseData();
        await fetchUnreadStageActivitySummary(input.user);
    } catch (error) {
        if (isQuoteSetupMissing(error)) {
            renderQuoteSetupRequired(input, error);
            return;
        }
        throw error;
    }

    const visibleDeals = visibleDealsForInput(input);
    const activeDeals = visibleDeals.filter((deal) => ['active', 'paused'].includes(normalizeDealStatus(deal.deal_status)));
    const upcomingDeals = [...activeDeals]
        .filter((deal) => text(deal.next_action) || text(deal.next_action_due_at))
        .sort((left, right) => text(left.next_action_due_at || left.updated_at).localeCompare(text(right.next_action_due_at || right.updated_at)))
        .slice(0, 6);
    const metrics = buildDashboardMetrics(input);
    metrics.summary = dashboardSummarySentence(metrics);
    const progressTone = dashboardToneForRate(metrics.stagePressure, 0.85);
    const maxTrendRevenue = Math.max(1, ...metrics.trend.map((item) => safeNumber(item.revenue, 0)));
    const dashboardCustomerId = text(upcomingDeals[0]?.customer_id || activeDeals[0]?.customer_id);
    if (dashboardCustomerId) {
        await appendSalesActivity({
            customer_id: dashboardCustomerId,
            deal_id: text(upcomingDeals[0]?.id || activeDeals[0]?.id),
            actor_type: 'sales',
            actor_id: input.user?.id,
            actor_label: input.user?.email || input.user?.id || 'sales',
            activity_type: 'page_view',
            entity_type: 'deal',
            entity_id: text(upcomingDeals[0]?.id || activeDeals[0]?.id || dashboardCustomerId),
            page_key: 'sales-dashboard',
            stage_key: 'customer_profile',
            action_label: '进入销售总览',
            detail_json: {
                summary: '查看销售总览',
            },
        });
    }

    renderSalesPageFrame(input, '销售总览', '30 秒看清销售健康度、增长动因和当前堵点。', `
        <section class="ams-dashboard-command">
            <div class="ams-dashboard-command-main">
                <div class="ams-dashboard-command-kicker">AI 自动总结</div>
                <h2>${esc(metrics.summary)}</h2>
                <p>把首页当成驾驶舱来用：先看总盘，再顺着异常卡片、趋势和维度榜单往下钻。</p>
            </div>
            <div class="ams-dashboard-command-side">
                <div class="ams-dashboard-filter-group" role="tablist" aria-label="总览时间范围">
                    ${DASHBOARD_RANGE_OPTIONS.map((option) => `<button type="button" class="ams-dashboard-filter ${moduleState.dashboardRange === option.value ? 'is-active' : ''}" data-dashboard-range="${esc(option.value)}">${esc(option.label)}</button>`).join('')}
                </div>
                <div class="ams-dashboard-command-pulse ${progressTone}">
                    <span>节奏达成</span>
                    <strong>${esc(fmtPercent(metrics.stagePressure, 0))}</strong>
                    <em>时间进度 ${esc(fmtPercent(metrics.timeProgress, 0))} / 签约转化 ${esc(fmtPercent(metrics.conversionRate, 0))}</em>
                </div>
            </div>
        </section>
        <section class="ams-dashboard-metric-grid">
            <article class="ams-dashboard-metric-card ${dashboardToneForRate(metrics.revenueDelta >= 0 ? 1 : 0, 1)}">
                <span>销售额 GMV</span>
                <strong>¥${esc(fmtCompactNumber(metrics.revenue))}</strong>
                <p>${esc(`${dashboardPeriodLabel(metrics.range)}签约额 · 环比 ${fmtPercent(metrics.revenueDelta, 0)}`)}</p>
            </article>
            <article class="ams-dashboard-metric-card">
                <span>订单量 Orders</span>
                <strong>${esc(metrics.orderCount)}</strong>
                <p>${esc(`客单值 ¥${fmtCompactNumber(metrics.avgOrder)} · 环比 ${fmtPercent(metrics.orderDelta, 0)}`)}</p>
            </article>
            <article class="ams-dashboard-metric-card">
                <span>回款进度 Cash-in</span>
                <strong>¥${esc(fmtCompactNumber(metrics.cash))}</strong>
                <p>${esc(`回款率 ${fmtPercent(metrics.cashRate, 0)} · 当前推进中 ${metrics.activePipelineDeals} 单`)}</p>
            </article>
            <article class="ams-dashboard-metric-card ${progressTone}">
                <span>转化率 CVR</span>
                <strong>${esc(fmtPercent(metrics.conversionRate, 0))}</strong>
                <p>${esc(`报价转签约 · 暂停 ${metrics.pausedDeals} 单 · ${metrics.funnelDropLabel}`)}</p>
            </article>
        </section>
        <section class="ams-dashboard-dual-grid">
            <article class="ams-card ams-dashboard-trend-card">
                <div class="ams-section-head">
                    <div>
                        <span class="ams-section-kicker">Trend pulse</span>
                        <h3>销售趋势</h3>
                        <p>用阶段签约额看风向，不在首页堆细表。</p>
                    </div>
                </div>
                <div class="ams-dashboard-trend-chart">
                    ${metrics.trend.map((item) => `
                        <div class="ams-dashboard-trend-bar">
                            <span class="ams-dashboard-trend-value">¥${esc(fmtCompactNumber(item.revenue))}</span>
                            <em style="height:${Math.max(14, (safeNumber(item.revenue, 0) / maxTrendRevenue) * 100)}%"></em>
                            <strong>${esc(item.label)}</strong>
                        </div>
                    `).join('')}
                </div>
            </article>
            <article class="ams-card ams-dashboard-progress-card">
                <div class="ams-section-head">
                    <div>
                        <span class="ams-section-kicker">Progress radar</span>
                        <h3>目标节奏</h3>
                        <p>时间跑得比签约快时，首页要直接报警。</p>
                    </div>
                </div>
                <div class="ams-dashboard-progress-stack">
                    <div class="ams-dashboard-progress-item">
                        <div><strong>时间进度</strong><span>${esc(fmtPercent(metrics.timeProgress, 0))}</span></div>
                        <b><i style="width:${Math.max(6, metrics.timeProgress * 100)}%"></i></b>
                    </div>
                    <div class="ams-dashboard-progress-item">
                        <div><strong>签约转化</strong><span>${esc(fmtPercent(metrics.conversionRate, 0))}</span></div>
                        <b><i style="width:${Math.max(6, metrics.conversionRate * 100)}%"></i></b>
                    </div>
                    <div class="ams-dashboard-progress-item">
                        <div><strong>回款率</strong><span>${esc(fmtPercent(metrics.cashRate, 0))}</span></div>
                        <b><i style="width:${Math.max(6, metrics.cashRate * 100)}%"></i></b>
                    </div>
                </div>
            </article>
        </section>
        <section class="ams-dashboard-split-grid">
            <article class="ams-card ams-dashboard-split-card">
                <div class="ams-section-head"><div><span class="ams-section-kicker">Region</span><h3>地域分布</h3><p>哪里是票仓，哪里开始变慢。</p></div></div>
                <div class="ams-dashboard-rank-list">${dashboardListMarkup(metrics.topRegions)}</div>
            </article>
            <article class="ams-card ams-dashboard-split-card">
                <div class="ams-section-head"><div><span class="ams-section-kicker">Products</span><h3>产品排行</h3><p>看爆款集中在哪个产品线。</p></div></div>
                <div class="ams-dashboard-rank-list">${dashboardListMarkup(metrics.topProducts)}</div>
            </article>
            <article class="ams-card ams-dashboard-split-card">
                <div class="ams-section-head"><div><span class="ams-section-kicker">Channels</span><h3>渠道来源</h3><p>识别订单入口，不靠感觉判断渠道效果。</p></div></div>
                <div class="ams-dashboard-rank-list">${dashboardListMarkup(metrics.topChannels)}</div>
            </article>
            <article class="ams-card ams-dashboard-split-card">
                <div class="ams-section-head"><div><span class="ams-section-kicker">Team board</span><h3>销售团队排行</h3><p>让负责人贡献一眼可见。</p></div></div>
                <div class="ams-dashboard-owner-list">${dashboardOwnerMarkup(metrics.ownerRanking)}</div>
            </article>
        </section>
        <section class="ams-dashboard-dual-grid">
            <article class="ams-card ams-dashboard-funnel-card">
                <div class="ams-section-head">
                    <div>
                        <span class="ams-section-kicker">Efficiency</span>
                        <h3>销售漏斗</h3>
                        <p>${esc(metrics.funnelDropLabel)}</p>
                    </div>
                </div>
                <div class="ams-dashboard-funnel">
                    ${metrics.funnel.map((item, index) => `
                        <div class="ams-dashboard-funnel-step" style="--funnel-width:${Math.max(38, 100 - (index * 12))}%">
                            <span>${esc(item.label)}</span>
                            <strong>${esc(item.value)}</strong>
                        </div>
                    `).join('')}
                </div>
            </article>
            <article class="ams-card ams-dashboard-mix-card">
                <div class="ams-section-head">
                    <div>
                        <span class="ams-section-kicker">Customer mix</span>
                        <h3>新老客构成</h3>
                        <p>新客过多说明留存偏弱，老客过多说明增长乏力。</p>
                    </div>
                </div>
                <div class="ams-dashboard-mix">
                    <div class="ams-dashboard-mix-ring">
                        <span>销售推进池</span>
                        <em>${esc(`总计 ${metrics.customerMix.newCount + metrics.customerMix.oldCount} 单`)}</em>
                    </div>
                    <div class="ams-dashboard-mix-stats">
                        <div><strong>${esc(metrics.customerMix.newCount)}</strong><span>新客订单</span></div>
                        <div><strong>${esc(metrics.customerMix.oldCount)}</strong><span>老客订单</span></div>
                    </div>
                </div>
            </article>
        </section>
        <section class="ams-card ams-dashboard-stage-panel">
            <div class="ams-section-head">
                <div>
                    <span class="ams-section-kicker">Pipeline guide</span>
                    <h3>销售推进池</h3>
                    <p>先用这里判断当前流程位于哪一段，再点击进入对应阶段页处理。</p>
                </div>
            </div>
            <div class="ams-sales-stage-guide">
                ${salesOverviewStageGuideLanes().map((lane) => `
                    <article class="ams-sales-stage-guide-lane">
                        <div class="ams-sales-stage-guide-head">
                            <div>
                                <div class="ams-sales-stage-guide-title">
                                    <span class="ams-sales-stage-guide-phase">${esc(lane.phase)}</span>
                                    <strong>${esc(lane.title)}</strong>
                                </div>
                                <p>${esc(lane.summary)}</p>
                            </div>
                            <span class="ams-sales-stage-guide-range">${esc(`${stageOrderIndex(lane.stages[0].key) + 1}-${stageOrderIndex(lane.stages[lane.stages.length - 1].key) + 1}`)}</span>
                        </div>
                        <div class="ams-sales-stage-guide-track">
                            ${lane.stages.map((stage, stageIndex) => {
                                const count = salesStageCount(stage.key, input);
                                const countUnit = stage.key === 'customer_profile' ? '个客户' : '条销售线';
                                const countTone = count <= 0 ? 'is-empty' : count === 1 ? 'is-warm' : 'is-hot';
                                const countIcon = count <= 0
                                    ? 'fa-circle-minus'
                                    : count === 1
                                        ? 'fa-briefcase'
                                        : 'fa-chart-line';
                                return `
                                <a class="ams-sales-stage-guide-card ${countTone} ${stageHasUnreadActivity(stage.key) ? 'has-activity-dot' : ''}" href="${esc(stage.key === 'customer_profile' ? adminPageUrl('quote-customers') : adminPageUrl('quote-pipeline', { stage: stage.key }))}">
                                    ${stageHasUnreadActivity(stage.key) ? '<span class="ams-activity-dot" aria-hidden="true"></span>' : ''}
                                    <span class="ams-sales-stage-guide-index">${esc(stageOrderIndex(stage.key) + 1)}</span>
                                    <div class="ams-sales-stage-guide-copy">
                                        <strong>${esc(stage.label)}</strong>
                                        <span class="ams-sales-stage-guide-metric ${countTone}"><em><i class="fa-solid ${countIcon}" aria-hidden="true"></i></em>${esc(`${count} ${countUnit}`)}</span>
                                    </div>
                                </a>
                                ${stageIndex < lane.stages.length - 1 ? '<span class="ams-sales-stage-guide-sep" aria-hidden="true"></span>' : ''}
                            `;
                            }).join('')}
                        </div>
                    </article>
                `).join('')}
            </div>
        </section>
        <section class="ams-card ams-dashboard-todo-panel">
            <div class="ams-section-head">
                <div>
                    <span class="ams-section-kicker">Action queue</span>
                    <h3>近期待办</h3>
                    <p>按下一动作时间排序，优先清理卡住的 deal。</p>
                </div>
            </div>
            <div class="ams-sales-inline-list">
                ${upcomingDeals.length
                    ? upcomingDeals.map((deal) => `<a class="ams-inline-link-card" href="${esc(customerFlowStageUrl(deal.current_stage, deal, deal.customer_id))}"><strong>${esc(text(deal.title, deal.id))}</strong><span>${esc(`${text(deal.next_action, '未设置下一动作')} · ${fmtDate(deal.next_action_due_at || deal.updated_at)}`)}</span></a>`).join('')
                    : '<div class="ams-empty">当前没有待办中的销售流程动作。</div>'}
            </div>
        </section>
    `, {
        deal: null,
        currentStage: 'customer_profile',
        page: 'dashboard',
        showPipeline: false,
    });
    bindSalesPageChrome(input);
    bindSalesDashboardEvents(input);
}
