import { client } from './supabase.client.js';
import {
    DEFAULT_LANG,
    DEFAULT_RATES,
    DEFAULT_SHARE_SECRET,
    DEFAULT_THEME_DARK,
    DEFAULT_THEME_PRIMARY,
    SECTION_KEYS,
    SUPPORTED_LANGS,
    buildQuoteSnapshot,
    convertLegacyPagesToSeedPayloads,
    createPublicSlug,
    createQuoteItem,
    createSectionConfig,
    ensureLegacyQuotePagesLoaded,
    extractBrandSnapshot,
    extractProductSnapshot,
    normalizeLocalizedText,
    normalizeQuoteItem,
    normalizeRates,
    normalizeSectionConfig,
    pickLocalized,
    sortItems,
} from '../../shared/quote-system/quote-data.module.js';

const TABLE_BRANDS = 'quote_brands';
const TABLE_PRODUCTS = 'quote_products';
const TABLE_PRODUCT_ITEMS = 'quote_product_items';
const TABLE_INSTANCES = 'quote_instances';
const TABLE_INSTANCE_ITEMS = 'quote_instance_items';

const moduleState = {
    brands: [],
    products: [],
    instances: [],
    brandEditor: null,
    productEditor: null,
    instanceEditor: null,
    productLoadedId: '',
    instanceLoadedId: '',
    productBrandFilter: 'all',
    instanceBrandFilter: 'all',
    instanceStatusFilter: 'all',
};

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
        sort_order: safeNumber(seed.sort_order, 100),
        is_active: seed.is_active !== false,
        items: sortItems((seed.items || []).map((item) => normalizeQuoteItem(item, item?.section_key))),
    };
}

function createInstanceDraft(seed = {}) {
    return {
        id: text(seed.id),
        brand_id: text(seed.brand_id || seed.brandId),
        product_id: text(seed.product_id || seed.productId),
        public_slug: text(seed.public_slug || seed.publicSlug),
        status: text(seed.status || 'draft') === 'published' ? 'published' : 'draft',
        customer_name: text(seed.customer_name || seed.customerName),
        receiver_name: text(seed.receiver_name || seed.receiverName),
        receiver_email: text(seed.receiver_email || seed.receiverEmail),
        default_lang: SUPPORTED_LANGS.includes(text(seed.default_lang || seed.defaultLang)) ? text(seed.default_lang || seed.defaultLang) : DEFAULT_LANG,
        validity_hours: Math.max(1, safeNumber(seed.validity_hours || seed.validityHours, 72)),
        draft_rates: normalizeRates(seed.draft_rates || seed.rates || DEFAULT_RATES),
        share_config: seed.share_config && typeof seed.share_config === 'object' ? deepClone(seed.share_config) : {},
        brand_snapshot: extractBrandSnapshot(seed.brand_snapshot || seed.brandSnapshot || {}),
        product_snapshot: extractProductSnapshot(seed.product_snapshot || seed.productSnapshot || {}),
        section_config: normalizeSectionConfig(seed.section_config || seed.sectionConfig),
        published_at: text(seed.published_at || seed.publishedAt),
        updated_at: text(seed.updated_at || seed.updatedAt),
        items: sortItems((seed.items || []).map((item) => normalizeQuoteItem(item, item?.section_key))),
    };
}

moduleState.brandEditor = createBrandDraft();
moduleState.productEditor = createProductDraft();
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

async function fetchBrandRows() {
    const { data, error } = await client
        .from(TABLE_BRANDS)
        .select('id, slug, brand_name, display_name, supplier_name, sender_email, subject_name, overview_title, footer_note, theme_primary, theme_dark, share_signing_secret, share_unlock_prefix, default_quote_slug, is_active, created_at, updated_at')
        .order('slug', { ascending: true });
    if (error) throw error;
    moduleState.brands = Array.isArray(data) ? data.map((row) => createBrandDraft(row)) : [];
    return moduleState.brands;
}

async function fetchProductRows() {
    const { data, error } = await client
        .from(TABLE_PRODUCTS)
        .select('id, brand_id, slug, product_code, public_title, default_lang, validity_hours, default_rates, section_config, sort_order, is_active, created_at, updated_at')
        .order('sort_order', { ascending: true })
        .order('slug', { ascending: true });
    if (error) throw error;
    moduleState.products = Array.isArray(data) ? data.map((row) => createProductDraft(row)) : [];
    return moduleState.products;
}

async function fetchProductEditor(productId) {
    if (!productId) {
        moduleState.productLoadedId = '';
        moduleState.productEditor = createProductDraft();
        return moduleState.productEditor;
    }
    const { data, error } = await client.from(TABLE_PRODUCTS).select('*').eq('id', productId).single();
    if (error) throw error;
    const itemsResult = await client.from(TABLE_PRODUCT_ITEMS).select('*').eq('product_id', productId).order('sort_order', { ascending: true });
    if (itemsResult.error) throw itemsResult.error;
    moduleState.productLoadedId = productId;
    moduleState.productEditor = createProductDraft({
        ...data,
        items: itemsResult.data || [],
    });
    return moduleState.productEditor;
}

async function fetchInstanceRows() {
    const { data, error } = await client
        .from(TABLE_INSTANCES)
        .select('id, brand_id, product_id, public_slug, status, customer_name, receiver_name, receiver_email, default_lang, validity_hours, published_at, updated_at')
        .order('updated_at', { ascending: false });
    if (error) throw error;
    moduleState.instances = Array.isArray(data) ? data.map((row) => createInstanceDraft(row)) : [];
    return moduleState.instances;
}

async function fetchInstanceEditor(instanceId) {
    if (!instanceId) {
        moduleState.instanceLoadedId = '';
        moduleState.instanceEditor = createInstanceDraft();
        return moduleState.instanceEditor;
    }
    const { data, error } = await client.from(TABLE_INSTANCES).select('*').eq('id', instanceId).single();
    if (error) throw error;
    const itemsResult = await client.from(TABLE_INSTANCE_ITEMS).select('*').eq('instance_id', instanceId).order('sort_order', { ascending: true });
    if (itemsResult.error) throw itemsResult.error;
    moduleState.instanceLoadedId = instanceId;
    moduleState.instanceEditor = createInstanceDraft({
        ...data,
        items: itemsResult.data || [],
    });
    return moduleState.instanceEditor;
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
            name_i18n: normalizeLocalizedText(normalized.name_i18n),
        };
    });

    if (!payload.length) return [];
    const insertResult = await client.from(tableName).insert(payload).select('*');
    if (insertResult.error) throw insertResult.error;
    return insertResult.data || [];
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
        overview_title: normalizeLocalizedText(payload.overview_title),
        footer_note: normalizeLocalizedText(payload.footer_note),
        theme_primary: payload.theme_primary || DEFAULT_THEME_PRIMARY,
        theme_dark: payload.theme_dark || DEFAULT_THEME_DARK,
        share_signing_secret: payload.share_signing_secret || DEFAULT_SHARE_SECRET,
        share_unlock_prefix: payload.share_unlock_prefix || `${payload.slug}-share-unlocked`,
        default_quote_slug: payload.default_quote_slug || null,
        is_active: payload.is_active !== false,
        updated_by: user?.id || null,
    };
    if (payload.id) savePayload.id = payload.id;
    if (!payload.id) savePayload.created_by = user?.id || null;

    const { data, error } = await client.from(TABLE_BRANDS).upsert(savePayload, { onConflict: 'slug' }).select('*').single();
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
    if (!pickLocalized(payload.public_title, payload.default_lang)) throw new Error('请至少填写一个产品标题。');

    const savePayload = {
        brand_id: payload.brand_id,
        slug: payload.slug,
        product_code: payload.product_code || payload.slug,
        public_title: normalizeLocalizedText(payload.public_title),
        default_lang: payload.default_lang,
        validity_hours: payload.validity_hours,
        default_rates: normalizeRates(payload.default_rates),
        section_config: normalizeSectionConfig(payload.section_config),
        sort_order: payload.sort_order,
        is_active: payload.is_active !== false,
        updated_by: user?.id || null,
    };
    if (payload.id) savePayload.id = payload.id;
    if (!payload.id) savePayload.created_by = user?.id || null;

    const { data, error } = await client.from(TABLE_PRODUCTS).upsert(savePayload, { onConflict: 'slug' }).select('*').single();
    if (error) throw error;

    const savedItems = await persistItemRows(TABLE_PRODUCT_ITEMS, 'product_id', data.id, payload.items);
    await fetchProductRows();
    moduleState.productLoadedId = data.id;
    moduleState.productEditor = createProductDraft({
        ...data,
        items: savedItems,
    });
    return moduleState.productEditor;
}

async function createInstanceFromProduct(user, productId) {
    const product = productId
        ? await fetchProductEditor(productId)
        : moduleState.productEditor?.id
          ? moduleState.productEditor
          : null;
    if (!product?.id) throw new Error('请先选择一个产品模板。');

    const brand = moduleState.brands.find((item) => item.id === product.brand_id);
    if (!brand?.id) throw new Error('未找到对应品牌。');

    const draft = createInstanceDraft({
        brand_id: brand.id,
        product_id: product.id,
        public_slug: createPublicSlug(brand.slug, product.slug),
        status: 'draft',
        customer_name: '',
        receiver_name: '',
        receiver_email: '',
        default_lang: product.default_lang,
        validity_hours: product.validity_hours,
        draft_rates: product.default_rates,
        brand_snapshot: extractBrandSnapshot(brand),
        product_snapshot: extractProductSnapshot(product),
        section_config: product.section_config,
        items: product.items,
    });

    const { data, error } = await client
        .from(TABLE_INSTANCES)
        .insert({
            brand_id: draft.brand_id,
            product_id: draft.product_id,
            public_slug: draft.public_slug,
            status: 'draft',
            customer_name: '',
            receiver_name: '',
            receiver_email: '',
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

    const savePayload = {
        brand_id: payload.brand_id,
        product_id: payload.product_id,
        public_slug: payload.public_slug,
        status: 'draft',
        customer_name: payload.customer_name,
        receiver_name: payload.receiver_name,
        receiver_email: payload.receiver_email,
        default_lang: payload.default_lang,
        validity_hours: payload.validity_hours,
        draft_rates: normalizeRates(payload.draft_rates),
        share_config: payload.share_config && typeof payload.share_config === 'object' ? payload.share_config : {},
        brand_snapshot: extractBrandSnapshot(payload.brand_snapshot),
        product_snapshot: extractProductSnapshot({
            ...payload.product_snapshot,
            section_config: payload.section_config,
            default_rates: payload.draft_rates,
            default_lang: payload.default_lang,
            validity_hours: payload.validity_hours,
        }),
        section_config: normalizeSectionConfig(payload.section_config),
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

function brandLabelById(brandId) {
    const brand = moduleState.brands.find((item) => item.id === brandId);
    return brand?.display_name || brand?.brand_name || '--';
}

function productLabelById(productId) {
    const product = moduleState.products.find((item) => item.id === productId);
    return pickLocalized(product?.public_title, product?.default_lang || DEFAULT_LANG, '--');
}

async function ensureBaseData() {
    await Promise.all([fetchBrandRows(), fetchProductRows(), fetchInstanceRows()]);
}

function isQuoteSetupMissing(error) {
    const message = String(error?.message || '').toLowerCase();
    return (
        message.includes('quote_brands') ||
        message.includes('quote_products') ||
        message.includes('quote_instances') ||
        message.includes('relation') ||
        message.includes('does not exist')
    );
}

function renderQuoteSetupRequired(input, error) {
    input.setPageHeader('报价系统 / 初始化', '当前环境还没有完成报价系统数据表初始化。');
    input.setContent(`
        <section class="ams-card ams-hero-card">
            <div class="ams-hero-copy">
                <p class="ams-eyebrow">Quote System</p>
                <h2>先执行 SQL 初始化，再进入品牌 / 产品 / 报价单管理。</h2>
                <p class="ams-hero-text">报价系统 V1 依赖 5 张业务表和对应的 RLS 策略。当前后台检测到这些表还未在 Supabase 中就绪，所以先给出明确安装步骤，而不是让页面直接报错。</p>
            </div>
            <div class="ams-quick-actions">
                <div class="ams-quick-link ams-quick-link-static">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-database"></i></div>
                    <div class="ams-quick-link-body">
                        <strong>执行 SQL 文件</strong>
                        <span>请先在 Supabase SQL Editor 执行 <code>article_management/sql/006_quote_system.sql</code>。</span>
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
                <span>ZH / EN / RU</span>
            </div>
            <div class="ams-site-field-grid ams-site-field-grid-wide">
                ${SUPPORTED_LANGS.map(
                    (lang) => `
                        <div class="ams-field">
                            <label>${lang.toUpperCase()}</label>
                            <textarea class="ams-textarea ams-quote-textarea" data-i18n-prefix="${esc(idPrefix)}" data-lang="${esc(lang)}">${esc(localized[lang] || '')}</textarea>
                        </div>
                    `,
                ).join('')}
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
    const key = text(status || 'draft').toLowerCase() === 'published' ? 'published' : 'draft';
    return `<span class="ams-pill ${esc(key)}">${key === 'published' ? '已发布' : '草稿'}</span>`;
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
                        <th>名称 ZH</th>
                        <th>名称 EN</th>
                        <th>名称 RU</th>
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
                                    <td><textarea class="ams-textarea ams-quote-row-textarea" data-item-prefix="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-item-lang="en">${esc(row.name_i18n?.en || '')}</textarea></td>
                                    <td><textarea class="ams-textarea ams-quote-row-textarea" data-item-prefix="${esc(prefix)}" data-item-id="${esc(row.localId)}" data-item-lang="ru">${esc(row.name_i18n?.ru || '')}</textarea></td>
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
                            : '<tr><td colspan="10"><div class="ams-empty">当前区块还没有明细。</div></td></tr>'
                    }
                </tbody>
            </table>
        </div>
        <div class="ams-inline-actions">
            <button class="ams-btn ams-btn-muted" type="button" data-item-add="${esc(prefix)}" data-section-key="${esc(sectionKey)}">新增一行</button>
        </div>
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
                <button class="ams-quote-list-card ${quote.id === moduleState.instanceEditor.id ? 'is-active' : ''}" type="button" data-instance-edit="${esc(quote.id)}">
                    <strong>${esc(quote.customer_name || productLabelById(quote.product_id) || quote.public_slug)}</strong>
                    <span>${esc(brandLabelById(quote.brand_id))} · ${esc(productLabelById(quote.product_id))}</span>
                    <em>${statusPill(quote.status)} <span class="ams-quote-inline-meta">${esc(quote.public_slug)}</span></em>
                </button>
            `,
              )
              .join('')
        : '<div class="ams-empty">当前筛选下没有报价单。</div>';
}

function bindBrandEditor(input) {
    const content = document.getElementById('ams-content');
    if (!content) return;

    content.querySelectorAll('[data-brand-field]').forEach((node) => {
        node.addEventListener('input', () => {
            const field = node.dataset.brandField;
            if (!field) return;
            moduleState.brandEditor[field] = node.type === 'checkbox' ? Boolean(node.checked) : node.value;
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
        void renderQuoteBrandsPage(input);
    });

    document.querySelectorAll('[data-brand-edit]').forEach((button) => {
        button.addEventListener('click', () => {
            const brandId = button.dataset.brandEdit;
            const brand = moduleState.brands.find((item) => item.id === brandId);
            if (!brand) return;
            moduleState.brandEditor = createBrandDraft(brand);
            void renderQuoteBrandsPage(input);
        });
    });

    document.getElementById('ams-quote-brand-save')?.addEventListener('click', async (event) => {
        await input.withButtonBusy(event.currentTarget, '保存中...', async () => {
            try {
                await saveBrandDraft(input.user, moduleState.brandEditor);
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
        <section class="ams-card ams-hero-card">
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
            <section class="ams-card ams-quote-editor-panel">
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
                    <div class="ams-field"><label>默认品牌链接 slug</label><input class="ams-input" data-brand-field="default_quote_slug" value="${esc(moduleState.brandEditor.default_quote_slug)}" placeholder="vman-p1200gf-demo"></div>
                    <div class="ams-field"><label class="ams-social-toggle"><input type="checkbox" data-brand-field="is_active" ${moduleState.brandEditor.is_active ? 'checked' : ''}><span>启用品牌</span></label></div>
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
        void renderQuoteProductsPage(input);
    });

    document.getElementById('ams-quote-product-new')?.addEventListener('click', () => {
        moduleState.productLoadedId = '';
        moduleState.productEditor = createProductDraft({
            brand_id: moduleState.productBrandFilter !== 'all' ? moduleState.productBrandFilter : '',
        });
        void renderQuoteProductsPage(input);
    });

    document.querySelectorAll('[data-product-edit]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await fetchProductEditor(button.dataset.productEdit);
                await renderQuoteProductsPage(input);
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
            });
        }
    });

    content.querySelectorAll('[data-i18n-prefix="product:public_title"]').forEach((node) => {
        node.addEventListener('input', () => {
            const lang = node.dataset.lang;
            if (!lang) return;
            upsertLocalizedField(moduleState.productEditor, 'public_title', lang, node.value);
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
    input.setPageHeader('报价系统 / 产品模板', '在品牌下维护标准产品模板，定义主配置、选配、默认汇率和有效期。');
    input.setContent(`
        <section class="ams-card ams-hero-card">
            <div class="ams-hero-copy">
                <p class="ams-eyebrow">Product Templates</p>
                <h2>产品模板是报价单的默认来源。</h2>
                <p class="ams-hero-text">品牌建好后，在这里维护标准产品、默认标题、多语言、主配置/选配区块和明细行。后续客户报价从模板派生，再做客户级修改。</p>
            </div>
            <div class="ams-quick-actions">
                <button class="ams-quick-link" type="button" id="ams-quote-product-new">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-cube"></i></div>
                    <div class="ams-quick-link-body"><strong>新建模板</strong><span>从空白开始创建一个新的产品报价模板。</span></div>
                </button>
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
            <section class="ams-card ams-quote-editor-panel">
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
                ${localizedFieldGroup('product:public_title', '产品标题', moduleState.productEditor.public_title)}
                <section class="ams-quote-block">
                    <div class="ams-section-head"><div><h3>区块配置</h3><p>固定分成主配置和选配两大类，可手动或自动计算小计。</p></div></div>
                    <div class="ams-quote-section-grid">${sectionConfigMarkup('product', moduleState.productEditor.section_config)}</div>
                </section>
                <section class="ams-quote-block">
                    <div class="ams-section-head"><div><h3>默认汇率</h3><p>新报价单会从模板复制一份，可在报价单里单独覆盖。</p></div></div>
                    ${ratesFieldset('product', moduleState.productEditor.default_rates)}
                </section>
                <section class="ams-quote-block">
                    <div class="ams-section-head"><div><h3>主配置明细</h3><p>这些行会出现在客户报价的主配置区块。</p></div></div>
                    ${itemTableMarkup('product', SECTION_KEYS.MAIN, moduleState.productEditor.items)}
                </section>
                <section class="ams-quote-block">
                    <div class="ams-section-head"><div><h3>选配明细</h3><p>这些行会出现在客户报价的选配区块。</p></div></div>
                    ${itemTableMarkup('product', SECTION_KEYS.OPTIONAL, moduleState.productEditor.items)}
                </section>
            </section>
        </section>
    `);
    bindProductEditor(input);
}

function bindInstanceEditor(input) {
    const content = document.getElementById('ams-content');
    if (!content) return;

    document.getElementById('ams-quote-instance-brand-filter')?.addEventListener('change', (event) => {
        moduleState.instanceBrandFilter = event.currentTarget.value || 'all';
        void renderQuoteInstancesPage(input);
    });
    document.getElementById('ams-quote-instance-status-filter')?.addEventListener('change', (event) => {
        moduleState.instanceStatusFilter = event.currentTarget.value || 'all';
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
                await fetchInstanceEditor(button.dataset.instanceEdit);
                await renderQuoteInstancesPage(input);
            } catch (error) {
                input.showToast(error.message || '加载报价单失败。', true);
            }
        });
    });

    content.querySelectorAll('[data-instance-field]').forEach((node) => {
        node.addEventListener('input', () => {
            const field = node.dataset.instanceField;
            if (!field) return;
            moduleState.instanceEditor[field] = node.type === 'checkbox' ? Boolean(node.checked) : node.value;
        });
        if (node.type === 'checkbox' || node.tagName === 'SELECT') {
            node.addEventListener('change', () => {
                const field = node.dataset.instanceField;
                if (!field) return;
                moduleState.instanceEditor[field] = node.type === 'checkbox' ? Boolean(node.checked) : node.value;
            });
        }
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
        if (!moduleState.instanceEditor.id) {
            input.showToast('请先保存报价单草稿。', true);
            return;
        }
        window.open(previewQuoteUrl(moduleState.instanceEditor.id), '_blank', 'noopener');
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
        <section class="ams-card ams-hero-card">
            <div class="ams-hero-copy">
                <p class="ams-eyebrow">Quote Instances</p>
                <h2>报价单实例才是最终业务对象。</h2>
                <p class="ams-hero-text">实例从产品模板复制品牌快照、产品标题、主配置/选配和汇率。保存草稿不影响客户页，点击发布后才会更新客户看到的内容。</p>
            </div>
            <div class="ams-quick-actions">
                <div class="ams-quick-link ams-quick-link-static">
                    <div class="ams-quick-link-icon"><i class="fa-solid fa-file-circle-plus"></i></div>
                    <div class="ams-quick-link-body">
                        <strong>从模板生成报价单</strong>
                        <span>先选一个产品模板，系统会生成一份可编辑草稿。</span>
                        <div class="ams-inline-actions">
                            <select id="ams-quote-instance-product-select" class="ams-select">
                                <option value="">请选择产品模板</option>
                                ${moduleState.products.map((product) => `<option value="${esc(product.id)}">${esc(brandLabelById(product.brand_id))} / ${esc(pickLocalized(product.public_title, product.default_lang, product.slug))}</option>`).join('')}
                            </select>
                            <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-instance-create-from-product">生成草稿</button>
                        </div>
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
                        </select>
                    </div>
                </div>
                <div class="ams-quote-list">${renderInstanceList()}</div>
            </aside>
            <section class="ams-card ams-quote-editor-panel">
                <div class="ams-section-head">
                    <div>
                        <h3>${moduleState.instanceEditor.id ? '编辑报价单' : '选择一份报价单'}</h3>
                        <p>客户页只读取已发布快照。草稿变更只有再次发布后才会生效。</p>
                    </div>
                    <div class="ams-row-actions">
                        <button class="ams-btn ams-btn-muted" type="button" id="ams-quote-instance-preview">预览客户页</button>
                        <button class="ams-btn ams-btn-muted" type="button" id="ams-quote-instance-copy-link">复制客户链接</button>
                        <button class="ams-btn ams-btn-primary" type="button" id="ams-quote-instance-save">保存草稿</button>
                        <button class="ams-btn ams-btn-warning" type="button" id="ams-quote-instance-publish">发布</button>
                    </div>
                </div>
                ${
                    moduleState.instanceEditor.id
                        ? `
                    <div class="ams-quote-meta-grid">
                        <div class="ams-summary-chip"><strong>状态</strong><span>${statusPill(moduleState.instanceEditor.status)}</span></div>
                        <div class="ams-summary-chip"><strong>公开链接</strong><span>${esc(publicQuoteUrl(moduleState.instanceEditor.public_slug))}</span></div>
                        <div class="ams-summary-chip"><strong>预览链接</strong><span>${esc(previewQuoteUrl(moduleState.instanceEditor.id))}</span></div>
                        <div class="ams-summary-chip"><strong>最近发布时间</strong><span>${esc(fmtDate(moduleState.instanceEditor.published_at))}</span></div>
                    </div>
                    <div class="ams-site-field-grid ams-site-field-grid-wide">
                        <div class="ams-field"><label>公开链接 slug</label><input class="ams-input" data-instance-field="public_slug" value="${esc(moduleState.instanceEditor.public_slug)}"></div>
                        <div class="ams-field"><label>默认语言</label><select class="ams-select" data-instance-field="default_lang">${SUPPORTED_LANGS.map((lang) => `<option value="${lang}" ${moduleState.instanceEditor.default_lang === lang ? 'selected' : ''}>${lang.toUpperCase()}</option>`).join('')}</select></div>
                        <div class="ams-field"><label>客户名称</label><input class="ams-input" data-instance-field="customer_name" value="${esc(moduleState.instanceEditor.customer_name)}" placeholder="Demo Customer"></div>
                        <div class="ams-field"><label>收件人</label><input class="ams-input" data-instance-field="receiver_name" value="${esc(moduleState.instanceEditor.receiver_name)}" placeholder="Receiver"></div>
                        <div class="ams-field"><label>客户邮箱</label><input class="ams-input" data-instance-field="receiver_email" value="${esc(moduleState.instanceEditor.receiver_email)}" placeholder="customer@example.com"></div>
                        <div class="ams-field"><label>有效期（小时）</label><input class="ams-input" type="number" min="1" step="1" data-instance-field="validity_hours" value="${esc(moduleState.instanceEditor.validity_hours)}"></div>
                    </div>
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
