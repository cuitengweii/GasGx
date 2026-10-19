import { client } from '../../article_management/modules/supabase.client.js';
import { ADMIN_ENTRY_KIND, SALES_ENTRY_KIND, adminConsolePath, normalizeEntryKind } from '../../article_management/modules/admin-entry.module.js';
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
    createPublicSlug,
    createQuoteItem,
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
    serializeQuoteItemI18n,
    sortItems,
    sortMediaItems,
} from './quote-data.module.js?v=20260723fields14';

const RATE_API_URL = 'https://open.er-api.com/v6/latest/CNY';
const TABLE_BRANDS = 'quote_brands';
const TABLE_PRODUCTS = 'quote_products';
const TABLE_PRODUCT_ITEMS = 'quote_product_items';
const TABLE_PRODUCT_MEDIA = 'quote_product_media';
const TABLE_INSTANCES = 'quote_instances';
const TABLE_INSTANCE_ITEMS = 'quote_instance_items';
const TABLE_CUSTOMERS = 'quote_customers';
const TRANSLATE_FUNCTION_NAME = 'quote-translate';
const TRANSLATE_TIMEOUT_MS = 3_000;
const AUTO_TRANSLATE_TARGETS = ['en', 'ru'];

function withTimeout(promise, timeoutMs, message = 'Request timed out.') {
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error(message)), timeoutMs);
        }),
    ]);
}

const dict = {
    zh: {
        supplier: '供应商：',
        sender: '发件人：',
        receiver: '收件人：',
        validity: '报价有效期：',
        included: '包含',
        mainConfig: '主配置',
        servicePackage: '服务包',
        optionalConfig: '选配',
        wearPartsModule: '易损件模块',
        systemTotal: '系统预估总价 / EST. SYSTEM TOTAL',
        pricingBreakdown: '报价构成',
        pricingFormula: '计算过程',
        mainTotal: '主配总价',
        optionalIncrease: '选配增加',
        serviceTotal: '服务包总价',
        wearPartsTotal: '易损件模块总价',
        send: '发送',
        refresh: '刷新汇率',
        receiverPlaceholder: '请输入客户名称',
        sectionSubtotalHint: '主配置、服务包和易损件模块可直接改区块小计；选配请勾选要计入报价的行。',
        defaultLang: '默认语言',
        validityHours: '有效期（小时）',
        customerName: '客户名称',
        receiverName: '收件人',
        receiverEmail: '客户邮箱',
        publicSlug: '公开链接 Slug',
        mediaPosition: '图片位置',
        mediaLayout: '图片样式',
        imageAbove: '产品标题下方',
        imageBelow: '报价表格下方',
        imageCarousel: '轮播图',
        imageStack: '纵向铺图',
        galleryTitle: '产品图片',
        galleryModeCarousel: '轮播图',
        galleryModeStack: '纵向铺图',
        galleryPrev: '上一张',
        galleryNext: '下一张',
        rowMoveUp: '上移',
        rowMoveDown: '下移',
        rowDelete: '删除',
        rowToggleInclude: '包含/价格',
        optionalSelect: '计入报价',
        rateOnline: '全球实时汇率在线',
        rateRefreshing: '正在刷新...',
        rateFallback: '汇率获取失败，使用当前快照',
        productMode: '当前编辑的是产品模板，本页修改会回写到基础模板。',
        instanceMode: '当前编辑的是报价单草稿，本页修改会回写到当前报价单。',
        saveSuccess: '保存成功。',
        saveFailed: '保存失败。',
        editorProductTitle: '真实模板页编辑',
        editorInstanceTitle: '真实报价页编辑',
        previewProduct: '生成报价单',
        previewCustomer: '预览客户页',
        addMainRow: '主配置新增行',
        addServiceRow: '服务包新增行',
        addOptionalRow: '选配新增行',
        addWearPartsRow: '易损件服务包新增行',
        saveProductTemplate: '保存产品模板',
        saveDraft: '保存草稿',
        needLogin: '当前未检测到管理员登录，保存可能会被数据库策略拒绝。',
        invalidRoute: '缺少 kind 或 id，无法打开真实编辑页。',
        loadFailed: '加载编辑数据失败。',
        days: '天',
        hours: '时',
        minutes: '分',
        seconds: '秒',
        headers: ['SEQ', '模块描述 (DESCRIPTION)', '规格 (BRAND)', 'QTY', 'RMB (¥)', 'USD ($)'],
    },
    en: {
        supplier: 'Supplier:',
        sender: 'Sender:',
        receiver: 'Receiver:',
        validity: 'Validity:',
        included: 'Included',
        mainConfig: 'Main Config',
        servicePackage: 'Service Package',
        optionalConfig: 'Optional Config',
        wearPartsModule: 'Wear Parts Module',
        systemTotal: 'EST. SYSTEM TOTAL',
        pricingBreakdown: 'PRICE BREAKDOWN',
        pricingFormula: 'CALCULATION',
        mainTotal: 'Main configuration total',
        optionalIncrease: 'Optional additions',
        serviceTotal: 'Service package total',
        wearPartsTotal: 'Wear parts module total',
        send: 'Send',
        refresh: 'Refresh Rates',
        receiverPlaceholder: 'Enter receiver',
        sectionSubtotalHint: 'Edit main/service/wear-parts subtotals directly; select optional rows to include them in the quote.',
        defaultLang: 'Default language',
        validityHours: 'Validity (hours)',
        customerName: 'Customer name',
        receiverName: 'Receiver',
        receiverEmail: 'Customer email',
        publicSlug: 'Public slug',
        mediaPosition: 'Image position',
        mediaLayout: 'Image layout',
        imageAbove: 'Below title',
        imageBelow: 'Below table',
        imageCarousel: 'Carousel',
        imageStack: 'Stack',
        galleryTitle: 'Product Gallery',
        galleryModeCarousel: 'Carousel',
        galleryModeStack: 'Stack',
        galleryPrev: 'Previous',
        galleryNext: 'Next',
        rowMoveUp: 'Up',
        rowMoveDown: 'Down',
        rowDelete: 'Delete',
        rowToggleInclude: 'Include/Price',
        optionalSelect: 'Include in quote',
        rateOnline: 'Live FX online',
        rateRefreshing: 'Refreshing...',
        rateFallback: 'Rate refresh failed. Using current snapshot.',
        productMode: 'Editing product template mode. Changes write back to the base template.',
        instanceMode: 'Editing quote instance mode. Changes write back to the current draft.',
        saveSuccess: 'Saved.',
        saveFailed: 'Save failed.',
        editorProductTitle: 'Product Template Editor',
        editorInstanceTitle: 'Quote Editor',
        previewProduct: 'Generate Quote',
        previewCustomer: 'Preview Customer Page',
        addMainRow: 'Add Main Config Row',
        addServiceRow: 'Add Service Package Row',
        addOptionalRow: 'Add Optional Row',
        addWearPartsRow: 'Add Wear Parts Service Row',
        saveProductTemplate: 'Save Product Template',
        saveDraft: 'Save Draft',
        needLogin: 'Admin login was not detected. Save may be rejected by RLS.',
        invalidRoute: 'Missing kind or id.',
        loadFailed: 'Failed to load editor data.',
        days: 'd',
        hours: 'h',
        minutes: 'm',
        seconds: 's',
        headers: ['SEQ', 'Description', 'Brand', 'QTY', 'RMB (¥)', 'USD ($)'],
    },
    ru: {
        supplier: 'Поставщик:',
        sender: 'Отправитель:',
        receiver: 'Получатель:',
        validity: 'Срок действия:',
        included: 'Включено',
        mainConfig: 'Основная конфигурация',
        servicePackage: 'Сервисный пакет',
        optionalConfig: 'Опции',
        wearPartsModule: 'Модуль быстроизнашиваемых деталей',
        systemTotal: 'ОЦЕНОЧНАЯ СТОИМОСТЬ СИСТЕМЫ',
        pricingBreakdown: 'Состав стоимости',
        pricingFormula: 'Расчёт',
        mainTotal: 'Стоимость основной конфигурации',
        optionalIncrease: 'Дополнительные опции',
        serviceTotal: 'Стоимость сервисного пакета',
        wearPartsTotal: 'Стоимость модуля быстроизнашиваемых деталей',
        send: 'Отправить',
        refresh: 'Обновить курсы',
        receiverPlaceholder: 'Введите получателя',
        sectionSubtotalHint: 'Изменяйте суммы основной конфигурации, сервиса и быстроизнашиваемых деталей; отмечайте опции для включения в предложение.',
        defaultLang: 'Язык по умолчанию',
        validityHours: 'Срок (часы)',
        customerName: 'Клиент',
        receiverName: 'Получатель',
        receiverEmail: 'Email клиента',
        publicSlug: 'Публичный slug',
        mediaPosition: 'Положение изображений',
        mediaLayout: 'Режим изображений',
        imageAbove: 'Под заголовком',
        imageBelow: 'Под таблицей',
        imageCarousel: 'Карусель',
        imageStack: 'Стек',
        galleryTitle: 'Галерея продукта',
        galleryModeCarousel: 'Карусель',
        galleryModeStack: 'Стек',
        galleryPrev: 'Назад',
        galleryNext: 'Вперед',
        rowMoveUp: 'Вверх',
        rowMoveDown: 'Вниз',
        rowDelete: 'Удалить',
        rowToggleInclude: 'Вкл/Цена',
        optionalSelect: 'Включить в предложение',
        rateOnline: 'Онлайн-курсы доступны',
        rateRefreshing: 'Обновление...',
        rateFallback: 'Не удалось обновить курс. Используется текущий снимок.',
        productMode: 'Режим редактирования шаблона продукта. Изменения будут сохранены в базовый шаблон.',
        instanceMode: 'Режим редактирования коммерческого предложения. Изменения будут сохранены в текущий черновик.',
        saveSuccess: 'Сохранено.',
        saveFailed: 'Не удалось сохранить.',
        editorProductTitle: 'Редактор шаблона продукта',
        editorInstanceTitle: 'Редактор предложения',
        previewProduct: 'Создать предложение',
        previewCustomer: 'Предпросмотр страницы клиента',
        addMainRow: 'Добавить строку основной конфигурации',
        addServiceRow: 'Добавить строку сервисного пакета',
        addOptionalRow: 'Добавить строку дополнительной конфигурации',
        addWearPartsRow: 'Добавить строку пакета быстроизнашиваемых деталей',
        saveProductTemplate: 'Сохранить шаблон продукта',
        saveDraft: 'Сохранить черновик',
        needLogin: 'Администратор не авторизован. Сохранение может быть отклонено RLS.',
        invalidRoute: 'Не указан kind или id.',
        loadFailed: 'Не удалось загрузить данные редактора.',
        days: 'д',
        hours: 'ч',
        minutes: 'м',
        seconds: 'с',
        headers: ['SEQ', 'Описание', 'Бренд', 'QTY', 'RMB (¥)', 'USD ($)'],
    },
};

const state = {
    kind: 'product',
    id: '',
    currentLang: DEFAULT_LANG,
    user: null,
    brand: null,
    product: null,
    instance: null,
    items: [],
    persistedItemIds: new Set(),
    media: [],
    rates: { ...DEFAULT_RATES },
    snapshot: null,
    baseTime: Date.now(),
    clockTimer: 0,
    galleryIndex: 0,
    productPreviewInstanceId: '',
    translationDirty: new Set(),
    translationRequest: null,
    saveInFlight: false,
    hasUnsavedChanges: false,
    changeVersion: 0,
    settingsRenderKey: '',
};

function byId(id) {
    return document.getElementById(id);
}

function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function text(value, fallback = '') {
    return String(value ?? fallback).trim();
}

function normalizedCustomerEmail(value = '') {
    return text(value).toLowerCase();
}

function isValidCustomerEmail(value = '') {
    const email = normalizedCustomerEmail(value);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function safeNumber(value, fallback = 0) {
    const next = Number(value);
    return Number.isFinite(next) ? next : fallback;
}

function t(key) {
    return dict[state.currentLang]?.[key] || dict.en[key] || key;
}

function editorT(key) {
    return dict.zh?.[key] || key;
}

function localizedEditorValue(value = {}) {
    const localized = normalizeLocalizedText(value);
    return text(localized.zh || localized.en || localized.ru);
}

function localeCopy(map) {
    return map[state.currentLang] || map.en || map.zh || '';
}

function markTranslationDirty(path) {
    if (state.currentLang !== DEFAULT_LANG) return;
    if (!path) return;
    state.translationDirty.add(path);
}

function clearTranslationDirty() {
    state.translationDirty = new Set();
}

function updateSaveButtons(label = '保存', disabled = false) {
    ['btn-save-editor'].forEach((id) => {
        const node = byId(id);
        if (!node) return;
        node.disabled = disabled;
        node.textContent = label;
    });
}

function publishedInstanceActionMode() {
    if (state.kind !== 'instance') return 'publish';
    if (state.instance?.status !== 'published') return 'publish';
    return 'update';
}

function parseQuoteVersionNumber(value = '') {
    const raw = text(value);
    if (!raw) return 0;
    const matched = raw.match(/(\d+)(?:\.\d+)?/);
    if (!matched) return 0;
    const next = Number(matched[1]);
    return Number.isFinite(next) && next > 0 ? next : 0;
}

function publishedQuoteVersion(instance = {}) {
    return text(
        instance?.published_snapshot?.quote?.quoteVersion
        || instance?.published_snapshot?.quote?.version
    ) || '1.0';
}

function nextQuoteVersion(instance = {}) {
    const major = parseQuoteVersionNumber(publishedQuoteVersion(instance));
    return `${Math.max(major, 0) + 1}.0`;
}

function instanceHasPendingChanges(instance = {}) {
    const publishedAt = Date.parse(text(instance?.published_at));
    const updatedAt = Date.parse(text(instance?.updated_at));
    if (!Number.isFinite(publishedAt) || !Number.isFinite(updatedAt)) return false;
    return updatedAt > publishedAt + 1000;
}

function pipelineReturnUrl() {
    const backHref = byId('btn-back-admin')?.getAttribute('href') || '';
    const params = new URLSearchParams(window.location.search || '');
    const entryKind = normalizeEntryKind(params.get('admin_entry') || ADMIN_ENTRY_KIND);
    const dealId = text(params.get('deal'));
    const stage = text(params.get('stage'), 'quote_draft');
    const returnMode = text(params.get('return_mode'));
    const customerId = text(params.get('customer'));
    if (entryKind === SALES_ENTRY_KIND && dealId) {
        const url = new URL(adminConsolePath(entryKind), window.location.origin);
        if (returnMode === 'customer-flow' && customerId) {
            url.searchParams.set('page', 'quote-customer-flow');
            url.searchParams.set('customer', customerId);
        } else {
            url.searchParams.set('page', 'quote-pipeline');
        }
        url.searchParams.set('stage', stage || 'quote_draft');
        url.searchParams.set('deal', dealId);
        url.searchParams.set('admin_entry', entryKind);
        return url.toString();
    }
    if (backHref) return new URL(backHref, window.location.origin).toString();
    return new URL(adminConsolePath(entryKind), window.location.origin).toString();
}

function markEditorDirty(options = {}) {
    state.hasUnsavedChanges = true;
    state.changeVersion += 1;
    if (options.showStatus !== false && !state.saveInFlight) {
        renderStatus(
            localeCopy({
                zh: '已修改，请点击保存。',
                en: 'Changed. Click Save to keep your changes.',
                ru: 'Есть изменения. Нажмите «Сохранить».',
            }),
            'warning',
        );
    }
}

function hasMeaningfulTranslation(localized, lang) {
    const normalized = normalizeLocalizedText(localized);
    const zh = text(normalized.zh);
    const current = text(normalized[lang]);
    return Boolean(current && current !== zh);
}

function shouldTranslateLocalized(path, localized, lang, force = false) {
    const normalized = normalizeLocalizedText(localized);
    const zh = text(normalized.zh);
    if (!zh) return false;
    if (force) return true;
    if (state.translationDirty.has(path)) return true;
    return !hasMeaningfulTranslation(normalized, lang);
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

function containsCjk(value = '') {
    return /[\u3400-\u9fff]/.test(text(value));
}

function mergeLocalizedForSave(currentValue, serverValue, activeLang = state.currentLang) {
    const current = expandLocalizedFromChinese(currentValue);
    const server = normalizeLocalizedText(serverValue);
    SUPPORTED_LANGS.forEach((lang) => {
        if (lang === activeLang) {
            if (containsCjk(current[lang]) && text(server[lang]) && !containsCjk(server[lang])) {
                current[lang] = text(server[lang]);
            }
            return;
        }
        if (text(server[lang])) current[lang] = text(server[lang]);
    });
    return current;
}

function normalizeBrandEditor(value = {}) {
    const snapshot = extractBrandSnapshot(value);
    return {
        id: text(value.id),
        slug: snapshot.slug,
        brand_name: text(value.brand_name || snapshot.brand_name || snapshot.display_name),
        display_name: text(value.display_name || snapshot.display_name || snapshot.brand_name),
        supplier_name: snapshot.supplier_name,
        sender_email: snapshot.sender_email,
        subject_name: text(value.subject_name || snapshot.subject_name || snapshot.display_name),
        overview_title: normalizeLocalizedText(snapshot.overview_title),
        footer_note: normalizeLocalizedText(snapshot.footer_note),
        theme_primary: text(value.theme_primary || snapshot.theme_primary || DEFAULT_THEME_PRIMARY) || DEFAULT_THEME_PRIMARY,
        theme_dark: text(value.theme_dark || snapshot.theme_dark || DEFAULT_THEME_DARK) || DEFAULT_THEME_DARK,
        share_signing_secret: text(value.share_signing_secret || snapshot.share_signing_secret || DEFAULT_SHARE_SECRET),
        share_unlock_prefix: text(value.share_unlock_prefix || snapshot.share_unlock_prefix || `${snapshot.slug || 'quote'}-share-unlocked`),
        default_quote_slug: text(value.default_quote_slug),
        is_active: value.is_active !== false,
    };
}

function normalizeProductEditor(value = {}) {
    const snapshot = extractProductSnapshot(value);
    const defaultLang = normalizeLangCode(value.default_lang || snapshot.default_lang, DEFAULT_LANG);
    return {
        id: text(value.id),
        brand_id: text(value.brand_id),
        slug: snapshot.slug,
        product_code: text(value.product_code || snapshot.product_code || snapshot.slug),
        public_title: normalizeLocalizedText(snapshot.public_title),
        default_lang: defaultLang,
        validity_hours: Math.max(1, safeNumber(value.validity_hours || snapshot.validity_hours, 72)),
        default_rates: normalizeRates(value.default_rates || snapshot.default_rates || DEFAULT_RATES),
        section_config: normalizeSectionConfig(value.section_config || snapshot.section_config),
        ui_text: normalizeProductUiText(value.ui_text || snapshot.ui_text),
        media_config: normalizeMediaConfig(value.media_config || snapshot.media_config),
        media_gallery: sortMediaItems(value.media_gallery || snapshot.media_gallery || []),
        sort_order: safeNumber(value.sort_order, 100),
        is_active: value.is_active !== false,
    };
}

function normalizeInstanceEditor(value = {}) {
    const defaultLang = normalizeLangCode(value.default_lang, DEFAULT_LANG);
    return {
        id: text(value.id),
        customer_id: text(value.customer_id || value.customerId),
        deal_id: text(value.deal_id || value.dealId),
        requirement_id: text(value.requirement_id || value.requirementId),
        brand_id: text(value.brand_id),
        product_id: text(value.product_id),
        public_slug: text(value.public_slug),
        status: text(value.status || 'draft') === 'published' ? 'published' : 'draft',
        customer_name: text(value.customer_name),
        receiver_name: text(value.receiver_name),
        receiver_email: normalizedCustomerEmail(value.receiver_email),
        default_lang: defaultLang,
        validity_hours: Math.max(1, safeNumber(value.validity_hours, 72)),
        draft_rates: normalizeRates(value.draft_rates || value.rates || DEFAULT_RATES),
        share_config: value.share_config && typeof value.share_config === 'object' ? { ...value.share_config } : {},
        section_config: normalizeSectionConfig(value.section_config),
        published_snapshot: value.published_snapshot && typeof value.published_snapshot === 'object' ? { ...value.published_snapshot } : null,
        published_at: text(value.published_at),
        updated_at: text(value.updated_at),
    };
}

function formatMoney(value) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.round(safeNumber(value, 0)));
}

function formatCurrency(code, amount) {
    if (code === 'RMB') return `¥${formatMoney(amount)}`;
    if (code === 'USD') return `$${formatMoney(amount)}`;
    if (code === 'EUR') return `€${formatMoney(amount)}`;
    if (code === 'CAD') return `C$${formatMoney(amount)}`;
    return `₽${formatMoney(amount)}`;
}

function localizedValue(value = {}) {
    const localized = normalizeLocalizedText(value);
    const current = text(localized[state.currentLang]);
    if (current) return current;
    return text(localized.zh || localized.en || localized.ru);
}

function uiText(key, fallback = '') {
    return localizedValue(state.product?.ui_text?.[key]) || fallback || t(key);
}

function configuredEditorLangs() {
    const source = state.kind === 'instance'
        ? state.instance?.share_config?.enabled_langs
        : state.product?.ui_text?.enabled_langs;
    const values = Array.isArray(source) ? source.map((item) => normalizeLangCode(item)).filter((item) => SUPPORTED_LANGS.includes(item)) : [];
    if (values.length) return [...new Set(values)];
    const fallback = state.kind === 'instance' ? state.instance?.default_lang : state.product?.default_lang;
    return [normalizeLangCode(fallback, DEFAULT_LANG)];
}

function updateConfiguredEditorLangs(nextLangs = []) {
    const langs = [...new Set(nextLangs.map((item) => normalizeLangCode(item)).filter((item) => SUPPORTED_LANGS.includes(item)))];
    const safeLangs = langs.length ? langs : [DEFAULT_LANG];
    if (state.kind === 'instance') {
        state.instance.share_config = state.instance.share_config && typeof state.instance.share_config === 'object' ? { ...state.instance.share_config } : {};
        state.instance.share_config.enabled_langs = safeLangs;
        if (!safeLangs.includes(state.instance.default_lang)) state.instance.default_lang = safeLangs[0];
    } else {
        state.product.ui_text = state.product.ui_text && typeof state.product.ui_text === 'object' ? { ...state.product.ui_text } : {};
        state.product.ui_text.enabled_langs = safeLangs;
        if (!safeLangs.includes(state.product.default_lang)) state.product.default_lang = safeLangs[0];
    }
    if (!safeLangs.includes(state.currentLang)) state.currentLang = safeLangs[0];
}

function setLocalizedValue(target, field, value) {
    target[field] = normalizeLocalizedText(target[field]);
    target[field][state.currentLang] = text(value);
}

function currentSectionConfig() {
    return state.kind === 'product'
        ? normalizeSectionConfig(state.product?.section_config)
        : normalizeSectionConfig(state.instance?.section_config || state.product?.section_config);
}

function setSectionConfig(nextSections) {
    if (state.kind === 'product') {
        state.product.section_config = normalizeSectionConfig(nextSections);
    } else {
        state.instance.section_config = normalizeSectionConfig(nextSections);
        state.product.section_config = normalizeSectionConfig(nextSections);
    }
}

function translationTargets(targets = AUTO_TRANSLATE_TARGETS) {
    const source = Array.isArray(targets) ? targets : AUTO_TRANSLATE_TARGETS;
    return [...new Set(source.filter((lang) => AUTO_TRANSLATE_TARGETS.includes(lang)))];
}

  function collectTranslationEntries(force = false, targets = AUTO_TRANSLATE_TARGETS) {
      const entries = [];
    const targetLangs = translationTargets(targets);
    const pushEntry = (path, localized) => {
        const normalized = normalizeLocalizedText(localized);
        const zh = text(normalized.zh);
        if (!zh) return;
        const missingTargets = targetLangs.filter((lang) => shouldTranslateLocalized(path, normalized, lang, force));
        if (!missingTargets.length) return;
        entries.push({ path, text: zh, targets: missingTargets });
    };

    pushEntry('brand.overview_title', state.brand?.overview_title);
    pushEntry('brand.footer_note', state.brand?.footer_note);
    pushEntry('product.public_title', state.product?.public_title);

    Object.entries(state.product?.ui_text || {}).forEach(([key, localized]) => {
        pushEntry(`product.ui_text.${key}`, localized);
    });

    currentSectionConfig().forEach((section) => {
        pushEntry(`section.${section.key}.title`, section.title);
    });

    state.items.forEach((item) => {
        pushEntry(`item.${item.localId}.name_i18n`, item.name_i18n);
        pushEntry(`item.${item.localId}.brand_i18n`, item.brand_i18n);
        pushEntry(`item.${item.localId}.qty_i18n`, item.qty_i18n);
    });

      return entries;
  }

  function chunkTranslationEntries(entries) {
      const chunks = [];
      let current = [];
      let charCount = 0;
      entries.forEach((entry) => {
          const nextSize = text(entry?.text).length;
          const wouldOverflow = current.length >= 10 || (charCount + nextSize) > 320;
          if (current.length && wouldOverflow) {
              chunks.push(current);
              current = [];
              charCount = 0;
          }
          current.push(entry);
          charCount += nextSize;
      });
      if (current.length) chunks.push(current);
      return chunks;
  }

function setLocalizedByPath(path, lang, value) {
    const nextValue = text(value);
    if (!nextValue) return;

    if (path === 'brand.overview_title') {
        state.brand.overview_title = normalizeLocalizedText(state.brand.overview_title);
        state.brand.overview_title[lang] = nextValue;
        return;
    }
    if (path === 'brand.footer_note') {
        state.brand.footer_note = normalizeLocalizedText(state.brand.footer_note);
        state.brand.footer_note[lang] = nextValue;
        return;
    }
    if (path === 'product.public_title') {
        state.product.public_title = normalizeLocalizedText(state.product.public_title);
        state.product.public_title[lang] = nextValue;
        return;
    }
    if (path.startsWith('product.ui_text.')) {
        const key = path.slice('product.ui_text.'.length);
        state.product.ui_text[key] = normalizeLocalizedText(state.product.ui_text[key]);
        state.product.ui_text[key][lang] = nextValue;
        return;
    }
    if (path.startsWith('section.')) {
        const sectionKey = path.split('.')[1];
        const section = currentSectionConfig().find((entry) => entry.key === sectionKey);
        if (!section) return;
        section.title = normalizeLocalizedText(section.title);
        section.title[lang] = nextValue;
        updateSection(sectionKey, { title: section.title });
        return;
    }
    if (path.startsWith('item.')) {
        const itemId = path.split('.')[1];
        const item = state.items.find((entry) => entry.localId === itemId);
        if (!item) return;
        const field = path.split('.')[2] || 'name_i18n';
        const itemField = ['name_i18n', 'brand_i18n', 'qty_i18n'].includes(field) ? field : 'name_i18n';
        const nextLocalized = normalizeLocalizedText(item[itemField]);
        nextLocalized[lang] = nextValue;
        updateItem(itemId, { [itemField]: nextLocalized });
    }
}

  async function autoTranslateLocalizedFields(force = false, targets = AUTO_TRANSLATE_TARGETS) {
      const targetLangs = translationTargets(targets);
      const entries = collectTranslationEntries(force, targetLangs);
      if (!entries.length) return { attempted: false, translated: false };

      const mergedTranslations = Object.fromEntries(
          targetLangs.map((lang) => [lang, {}]),
      );
      const chunks = chunkTranslationEntries(entries);
      for (const chunk of chunks) {
          const { data, error } = await withTimeout(
              client.functions.invoke(TRANSLATE_FUNCTION_NAME, {
                  body: {
                      source: DEFAULT_LANG,
                      targets: targetLangs,
                      entries: chunk.map((entry) => ({ key: entry.path, text: entry.text })),
                  },
              }),
              TRANSLATE_TIMEOUT_MS,
              'Quote translation request timed out.',
          );
          if (error) throw error;
          const translations = data?.translations && typeof data.translations === 'object' ? data.translations : {};
          targetLangs.forEach((lang) => {
              const bucket = translations?.[lang] && typeof translations[lang] === 'object' ? translations[lang] : {};
              Object.assign(mergedTranslations[lang], bucket);
          });
      }

      targetLangs.forEach((lang) => {
          const bucket = mergedTranslations[lang] && typeof mergedTranslations[lang] === 'object' ? mergedTranslations[lang] : {};
          entries.forEach((entry) => {
              if (!entry.targets.includes(lang)) return;
              const translated = text(bucket?.[entry.path]);
              if (translated) setLocalizedByPath(entry.path, lang, translated);
          });
      });

      if (AUTO_TRANSLATE_TARGETS.every((lang) => targetLangs.includes(lang))) clearTranslationDirty();
      return { attempted: true, translated: true };
  }

function sectionSubtotal(section, items = []) {
    if (section?.key === SECTION_KEYS.OPTIONAL) {
        return items.reduce((sum, item) => {
            if (!item.is_selected || item.is_included) return sum;
            return sum + Math.max(0, safeNumber(item.price_rmb, 0));
        }, 0);
    }
    const manualSubtotal = safeNumber(section?.subtotal, 0);
    const defaultToItemTotal = section?.key === SECTION_KEYS.SERVICE || section?.key === SECTION_KEYS.WEAR_PARTS;
    if (section?.subtotalMode === 'manual' && (!defaultToItemTotal || manualSubtotal > 0)) {
        return manualSubtotal;
    }
    if (section?.subtotalMode === 'sum') {
        return items.reduce((sum, item) => {
            if (item.is_included) return sum;
            return sum + Math.max(0, safeNumber(item.price_rmb, 0));
        }, 0);
    }
    return items.reduce((sum, item) => {
        if (item.is_included) return sum;
        return sum + Math.max(0, safeNumber(item.price_rmb, 0));
    }, 0);
}

function quoteTotal() {
    return currentSectionConfig().reduce((sum, section) => {
        const items = state.items.filter((item) => item.section_key === section.key);
        return sum + sectionSubtotal(section, items);
    }, 0);
}

function buildSnapshot() {
    if (!state.brand || !state.product) return null;
    const productSnapshot = extractProductSnapshot({
        ...state.product,
        media_gallery: state.media,
        media_config: state.product.media_config,
        section_config: currentSectionConfig(),
        ui_text: state.product.ui_text,
    });

    const instanceSeed = state.kind === 'instance'
        ? {
              ...state.instance,
              brand_snapshot: state.brand,
              product_snapshot: productSnapshot,
              section_config: currentSectionConfig(),
              draft_rates: state.rates,
          }
        : {
              id: '',
              public_slug: '',
              status: 'draft',
              customer_name: '',
              receiver_name: '',
              receiver_email: '',
              default_lang: state.product.default_lang,
              validity_hours: state.product.validity_hours,
              draft_rates: state.rates,
              brand_snapshot: state.brand,
              product_snapshot: productSnapshot,
              section_config: currentSectionConfig(),
          };

    return buildQuoteSnapshot({
        brand: state.brand,
        product: productSnapshot,
        instance: instanceSeed,
        items: state.items,
        mode: state.kind,
    });
}

function applyTheme() {
    const primary = text(state.brand?.theme_primary, DEFAULT_THEME_PRIMARY) || DEFAULT_THEME_PRIMARY;
    const dark = text(state.brand?.theme_dark, DEFAULT_THEME_DARK) || DEFAULT_THEME_DARK;
    document.documentElement.style.setProperty('--gas-green-primary', primary);
    document.documentElement.style.setProperty('--gas-green-light', primary);
    document.documentElement.style.setProperty('--gas-green-bg-solid', dark);
}

function formatValidity(remainingMs) {
    const rest = Math.max(0, remainingMs);
    const days = Math.floor(rest / (24 * 60 * 60 * 1000));
    const hours = Math.floor((rest % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((rest % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((rest % (60 * 1000)) / 1000);
    return `${days}${t('days')} ${String(hours).padStart(2, '0')}${t('hours')} ${String(minutes).padStart(2, '0')}${t('minutes')} ${String(seconds).padStart(2, '0')}${t('seconds')}`;
}

function renderClock() {
    const now = new Date();
    const validNode = byId('edit-validity-value');
    const liveDate = byId('live-date');
    const liveClock = byId('live-clock');
    if (liveDate) liveDate.textContent = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (liveClock) liveClock.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    if (validNode) {
        const hours = state.kind === 'product' ? state.product?.validity_hours : state.instance?.validity_hours;
        validNode.textContent = formatValidity(state.baseTime + Math.max(1, safeNumber(hours, 72)) * 60 * 60 * 1000 - Date.now());
    }
}

function startClock() {
    if (state.clockTimer) window.clearInterval(state.clockTimer);
    renderClock();
    state.clockTimer = window.setInterval(renderClock, 1000);
}

function renderLangButtons() {
    SUPPORTED_LANGS.forEach((lang) => {
        const node = byId(`btn-${lang}`);
        if (!node) return;
        node.className = `px-2 md:px-4 py-1 md:py-1.5 rounded transition-all ${state.currentLang === lang ? 'bg-[var(--gas-green-primary)] text-[#0A0E14] font-semibold shadow-[0_0_16px_rgba(93,214,44,0.3)]' : 'text-[var(--text-body)]'}`;
    });
}

function renderToolbarBrand() {
    byId('toolbar-brand-name').textContent = 'GasGx Quotation System';
}

function settingsRenderKey() {
    const validityHours = state.kind === 'product' ? state.product.validity_hours : state.instance.validity_hours;
    const defaultLang = state.kind === 'product' ? state.product.default_lang : state.instance.default_lang;
    return JSON.stringify({
        kind: state.kind,
        lang: state.currentLang,
        defaultLang,
        enabledLangs: configuredEditorLangs(),
        validityHours,
        mediaPosition: state.product.media_config?.position || '',
        mediaLayout: state.product.media_config?.layout || '',
    });
}

function renderSettings() {
    const root = byId('editor-settings-fields');
    if (!root) return;
    const nextKey = settingsRenderKey();
    if (state.settingsRenderKey === nextKey) return;
    state.settingsRenderKey = nextKey;
    const validityHours = state.kind === 'product' ? state.product.validity_hours : state.instance.validity_hours;
    const defaultLang = state.kind === 'product' ? state.product.default_lang : state.instance.default_lang;
    root.innerHTML = `
        ${state.kind === 'instance' ? `
        <label class="quote-editor-setting">
            <span>${esc(editorT('customerName'))}</span>
            <input type="text" data-setting-field="customer_name" value="${esc(state.instance.customer_name)}" placeholder="${esc(editorT('customerName'))}">
        </label>
        <label class="quote-editor-setting">
            <span>${esc(editorT('receiverEmail'))}</span>
            <input type="email" inputmode="email" autocomplete="email" data-setting-field="receiver_email" value="${esc(state.instance.receiver_email)}" placeholder="${esc(editorT('receiverEmail'))}">
        </label>
        ` : ''}
        <label class="quote-editor-setting">
            <span>${esc(editorT('validityHours'))}</span>
            <input type="number" min="1" step="1" data-setting-field="validity_hours" value="${esc(validityHours)}">
        </label>
        <label class="quote-editor-setting">
            <span>${esc(editorT('mediaPosition'))}</span>
            <select data-setting-field="media_position">
                <option value="${MEDIA_POSITIONS.ABOVE}" ${state.product.media_config?.position === MEDIA_POSITIONS.ABOVE ? 'selected' : ''}>${esc(editorT('imageAbove'))}</option>
                <option value="${MEDIA_POSITIONS.BELOW}" ${state.product.media_config?.position !== MEDIA_POSITIONS.ABOVE ? 'selected' : ''}>${esc(editorT('imageBelow'))}</option>
            </select>
        </label>
        <label class="quote-editor-setting">
            <span>${esc(editorT('mediaLayout'))}</span>
            <select data-setting-field="media_layout">
                <option value="${MEDIA_LAYOUTS.CAROUSEL}" ${state.product.media_config?.layout !== MEDIA_LAYOUTS.STACK ? 'selected' : ''}>${esc(editorT('imageCarousel'))}</option>
                <option value="${MEDIA_LAYOUTS.STACK}" ${state.product.media_config?.layout === MEDIA_LAYOUTS.STACK ? 'selected' : ''}>${esc(editorT('imageStack'))}</option>
            </select>
        </label>
    `;

    root.querySelectorAll('[data-setting-field]').forEach((node) => {
        node.addEventListener('input', handleSettingChange);
        node.addEventListener('change', handleSettingChange);
    });
}

function applySettingField(field, value) {
    if (!field) return;
    if (field === 'default_lang') {
        const nextLang = normalizeLangCode(value, DEFAULT_LANG);
        if (state.kind === 'product') state.product.default_lang = nextLang;
        else state.instance.default_lang = nextLang;
        state.currentLang = nextLang;
        const enabledLangs = configuredEditorLangs();
        if (!enabledLangs.includes(nextLang)) updateConfiguredEditorLangs([...enabledLangs, nextLang]);
    } else if (field === 'validity_hours') {
        if (state.kind === 'product') state.product.validity_hours = Math.max(1, safeNumber(value, 72));
        else state.instance.validity_hours = Math.max(1, safeNumber(value, 72));
    } else if (field === 'media_position') {
        state.product.media_config = normalizeMediaConfig({ ...state.product.media_config, position: value });
    } else if (field === 'media_layout') {
        state.product.media_config = normalizeMediaConfig({ ...state.product.media_config, layout: value });
    } else if (state.kind === 'instance') {
        state.instance[field] = field === 'receiver_email' ? normalizedCustomerEmail(value) : text(value);
    }
}

function handleSettingChange(event) {
    const field = event.currentTarget.dataset.settingField;
    const value = event.currentTarget.value;
    applySettingField(field, value);
    renderAll();
    markEditorDirty();
}

function renderStatus(message, tone = 'normal') {
    const title = byId('editor-status-title');
    const textNode = byId('editor-status-text');
    if (title) title.textContent = state.kind === 'product' ? editorT('editorProductTitle') : editorT('editorInstanceTitle');
    if (!textNode) return;
    textNode.textContent = text(message);
    textNode.dataset.tone = tone;
}

function renderBanner() {
    const instanceVersionMeta = state.kind === 'instance'
        ? (() => {
            const published = publishedQuoteVersion(state.instance);
            const draft = instanceHasPendingChanges(state.instance) ? nextQuoteVersion(state.instance) : published;
            return ` | 已发布 V${published} | 草稿 V${draft}${instanceHasPendingChanges(state.instance) ? '（未发布）' : '（已同步）'}`;
        })()
        : '';
    byId('editor-banner-title').textContent = state.kind === 'product'
        ? '你现在编辑的就是基础模板原页面。'
        : '你现在编辑的就是当前报价单原页面。';
    byId('editor-banner-meta').textContent = state.kind === 'product'
        ? `${state.brand.display_name} / ${localizedEditorValue(state.product.public_title) || state.product.slug}。${editorT('productMode')}`
        : `${state.brand.display_name} / ${localizedEditorValue(state.product.public_title) || state.product.slug} / ${state.instance.public_slug}。${editorT('instanceMode')}`;
}

function syncBackLink() {
    const node = byId('btn-back-admin');
    if (!node) return;
    const params = new URLSearchParams(window.location.search || '');
    const entryKind = normalizeEntryKind(params.get('admin_entry') || ADMIN_ENTRY_KIND);
    const basePath = adminConsolePath(entryKind);
    const page = state.kind === 'product' ? 'quote-products' : 'quote-instances';
    const url = new URL(basePath, window.location.origin);
    const dealId = String(params.get('deal') || '').trim();
    const stage = text(params.get('stage'), 'quote_draft');
    const returnMode = text(params.get('return_mode'));
    const customerId = text(params.get('customer'));
    if (
        state.kind === 'instance'
        && entryKind === SALES_ENTRY_KIND
        && returnMode === 'customer-flow'
        && customerId
        && dealId
    ) {
        url.searchParams.set('page', 'quote-customer-flow');
        url.searchParams.set('customer', customerId);
        url.searchParams.set('stage', stage || 'quote_draft');
        url.searchParams.set('deal', dealId);
        node.href = url.toString();
        return;
    }
    url.searchParams.set('page', page);
    if (state.kind === 'instance' && state.instance?.id) {
        url.searchParams.set('instance', state.instance.id);
    }
    if (dealId && entryKind === SALES_ENTRY_KIND) {
        url.searchParams.set('deal', dealId);
    }
    node.href = url.toString();
}

function publicQuoteUrl(publicSlug) {
    return new URL(`/quote/view.html?quote=${encodeURIComponent(publicSlug)}`, window.location.origin).toString();
}

function previewQuoteUrl(instanceId) {
    return new URL(`/quote/view.html?preview=${encodeURIComponent(instanceId)}`, window.location.origin).toString();
}

function openPreviewWindow() {
    const previewWindow = window.open('about:blank', '_blank');
    if (!previewWindow) {
        renderStatus('浏览器拦截了预览窗口，请允许弹窗后重试。', 'warning');
        return null;
    }
    previewWindow.opener = null;
    previewWindow.document.title = 'GasGx Quote Preview';
    previewWindow.document.body.innerHTML = '<p style="font-family:Arial,sans-serif;padding:24px;color:#111;">正在生成预览...</p>';
    return previewWindow;
}

async function copyText(value) {
    if (!text(value)) return false;
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
    }
    const input = document.createElement('textarea');
    input.value = value;
    input.setAttribute('readonly', 'readonly');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(input);
    return copied;
}

function renderEditorActions() {
    const instanceActions = byId('instance-toolbar-actions');
    const previewButton = byId('btn-preview-instance');
    const publishButton = byId('btn-publish-instance');
    const saveButton = byId('btn-save-editor');
    byId('btn-add-main-row').textContent = editorT('addMainRow');
    byId('btn-add-service-row').textContent = editorT('addServiceRow');
    byId('btn-add-optional-row').textContent = editorT('addOptionalRow');
    byId('btn-add-wear-parts-row').textContent = editorT('addWearPartsRow');
    const saveLabel = state.kind === 'product' ? editorT('saveProductTemplate') : editorT('saveDraft');
    updateSaveButtons(saveLabel, state.saveInFlight);
    if (saveButton) saveButton.textContent = saveLabel;
    if (!instanceActions || !previewButton || !publishButton) return;
    const isInstance = state.kind === 'instance';
    instanceActions.hidden = false;
    instanceActions.style.display = 'contents';
    publishButton.hidden = !isInstance;
    if (!isInstance) {
        previewButton.disabled = state.saveInFlight;
        previewButton.textContent = editorT('previewProduct');
        return;
    }
    const hasId = Boolean(state.instance?.id);
    previewButton.disabled = !hasId;
    previewButton.textContent = editorT('previewCustomer');
    const actionMode = publishedInstanceActionMode();
    publishButton.disabled = actionMode === 'copy'
        ? !Boolean(text(state.instance?.public_slug))
        : !hasId || state.saveInFlight;
    publishButton.textContent = actionMode === 'copy'
        ? '\u590d\u5236\u5ba2\u6237\u94fe\u63a5'
        : actionMode === 'update'
            ? '\u66f4\u65b0\u62a5\u4ef7'
            : '\u53d1\u5e03\u62a5\u4ef7';
}

function renderEditorVersionText() {
    const node = byId('editor-version-text');
    if (!node) return;
    if (state.kind !== 'instance' || !state.instance?.id) {
        node.textContent = '';
        return;
    }
    const published = publishedQuoteVersion(state.instance);
    const next = nextQuoteVersion(state.instance);
    node.textContent = `已发布版本 V${published} | 下一发布版本 V${next}`;
}

function renderStaticText() {
    renderLangButtons();
    renderToolbarBrand();
    renderBanner();
    renderSettings();
    syncBackLink();
    renderEditorActions();
    renderEditorVersionText();

    byId('edit-overview-title').textContent = localizedValue(state.brand.overview_title);
    byId('btn-send-editor')?.setAttribute('hidden', 'hidden');
    byId('edit-meta-supplier')?.setAttribute('hidden', 'hidden');
    byId('edit-meta-sender')?.setAttribute('hidden', 'hidden');
    byId('edit-validity-label').textContent = uiText('validity_label', t('validity'));
    byId('edit-receiver-label').textContent = t('customerName');
    byId('footer-note').textContent = localizedValue(state.brand.footer_note);
    byId('btn-text-refresh').textContent = uiText('refresh_button', t('refresh'));

    const receiverValue = state.kind === 'instance'
        ? text(state.instance.customer_name)
        : uiText('receiver_placeholder', t('receiverPlaceholder'));
    const receiverNode = byId('edit-receiver-value');
    receiverNode.textContent = receiverValue;
    receiverNode.classList.toggle('is-placeholder', !text(state.instance?.customer_name));
}

function renderRateLine() {
    byId('live-rates-display').textContent = `1 CNY ⇄ ${state.rates.USD.toFixed(4)} USD | ${state.rates.EUR.toFixed(4)} EUR | ${state.rates.CAD.toFixed(4)} CAD | ${state.rates.RUB.toFixed(4)} RUB`;
}

function setRateDetail(message = '', tone = 'muted') {
    const node = byId('rate-status-detail');
    if (!node) return;
    node.textContent = text(message);
    node.dataset.tone = tone;
    node.classList.toggle('hidden', !text(message));
}

function updateRateStatus(mode = 'online') {
    const node = byId('rate-status');
    if (!node) return;
    if (mode === 'loading') {
        node.innerHTML = `<i class="fa-solid fa-rotate fa-spin text-[var(--gas-green-light)] mr-1.5"></i>${esc(t('rateRefreshing'))}`;
        return;
    }
    if (mode === 'error') {
        node.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-yellow-500 mr-1.5"></i>${esc(t('rateFallback'))}`;
        return;
    }
    node.innerHTML = `<i class="fa-solid fa-money-bill-transfer text-[var(--gas-green-light)] mr-1.5"></i>${esc(t('rateOnline'))}`;
}

function parseMoneyInput(value) {
    return Math.max(0, safeNumber(String(value || '').replace(/[^0-9.-]/g, ''), 0));
}

function groupedEditableSections() {
    return currentSectionConfig().map((section) => ({
        ...section,
        items: sortItems(state.items.filter((item) => item.section_key === section.key)),
        subtotalValue: sectionSubtotal(section, state.items.filter((item) => item.section_key === section.key)),
    }));
}

function dedupeQuoteItems(items = []) {
    const seen = new Set();
    return sortItems(items).filter((item) => {
        const normalized = normalizeQuoteItem(item, item?.section_key);
        const lineCode = text(normalized.line_code);
        if (!lineCode) return true;
        const key = `${normalized.section_key}:${lineCode}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function renderMediaBlock() {
    const config = normalizeMediaConfig(state.product.media_config || {});
    const items = sortMediaItems(state.media || []);
    if (!config.enabled || !items.length) return '';
    if (state.galleryIndex >= items.length) state.galleryIndex = 0;
    const currentIndex = Math.max(0, Math.min(state.galleryIndex, items.length - 1));
    const modeLabel = config.layout === MEDIA_LAYOUTS.STACK ? t('galleryModeStack') : t('galleryModeCarousel');

    if (config.layout === MEDIA_LAYOUTS.STACK) {
        return `
            <section class="quote-product-media quote-product-media-stack">
                <div class="quote-product-media-head">
                    <strong>${esc(t('galleryTitle'))}</strong>
                    <span>${esc(modeLabel)}</span>
                </div>
                <div class="quote-media-stack-list">
                    ${items.map((item, index) => `<figure class="quote-media-figure"><img src="${esc(item.public_url)}" alt="${esc(item.title || `${t('galleryTitle')} ${index + 1}`)}" loading="lazy"></figure>`).join('')}
                </div>
            </section>
        `;
    }

    return `
        <section class="quote-product-media quote-product-media-carousel">
            <div class="quote-product-media-head">
                <strong>${esc(t('galleryTitle'))}</strong>
                <span>${esc(modeLabel)}</span>
            </div>
            <div class="quote-media-carousel-stage">
                ${items.map((item, index) => `<figure class="quote-media-slide ${index === currentIndex ? 'is-active' : ''}" data-gallery-slide="${index}"><img src="${esc(item.public_url)}" alt="${esc(item.title || `${t('galleryTitle')} ${index + 1}`)}" loading="lazy"></figure>`).join('')}
                ${items.length > 1 ? `<button type="button" class="quote-media-nav prev" data-gallery-nav="prev" aria-label="${esc(t('galleryPrev'))}"><i class="fa-solid fa-chevron-left"></i></button><button type="button" class="quote-media-nav next" data-gallery-nav="next" aria-label="${esc(t('galleryNext'))}"><i class="fa-solid fa-chevron-right"></i></button>` : ''}
            </div>
            ${items.length > 1 ? `<div class="quote-media-dots">${items.map((_item, index) => `<button type="button" class="quote-media-dot ${index === currentIndex ? 'is-active' : ''}" data-gallery-dot="${index}" aria-label="${esc(`${t('galleryTitle')} ${index + 1}`)}"></button>`).join('')}</div>` : ''}
        </section>
    `;
}

function renderContent() {
    const container = byId('content-area');
    const sections = groupedEditableSections();
    const total = quoteTotal();
    const sectionTotals = Object.fromEntries(sections.map((section) => [section.key, section.subtotalValue]));
    const breakdown = [
        [t('mainTotal'), sectionTotals[SECTION_KEYS.MAIN] || 0],
        [t('optionalIncrease'), sectionTotals[SECTION_KEYS.OPTIONAL] || 0],
        [t('serviceTotal'), sectionTotals[SECTION_KEYS.SERVICE] || 0],
        [t('wearPartsTotal'), sectionTotals[SECTION_KEYS.WEAR_PARTS] || 0],
    ];
    const mediaBlock = renderMediaBlock();
    const mediaConfig = normalizeMediaConfig(state.product.media_config || {});
    const mediaAbove = mediaConfig.enabled && mediaConfig.position === MEDIA_POSITIONS.ABOVE ? mediaBlock : '';
    const mediaBelow = mediaConfig.enabled && mediaConfig.position !== MEDIA_POSITIONS.ABOVE ? mediaBlock : '';
    const rows = [];

    sections.forEach((section) => {
        rows.push(`
            <tr class="quote-section-row" data-section-key="${esc(section.key)}" style="background-color: var(--bg-base);">
                <td class="text-[var(--text-muted)] opacity-50 text-center text-xs font-mono-num whitespace-nowrap">-</td>
                <td class="text-[var(--gas-green-light)] font-semibold whitespace-nowrap">
                    <span class="quote-editable quote-editable-inline" contenteditable="true" data-section-title="${esc(section.key)}">${esc(localizedValue(section.title) || (section.key === SECTION_KEYS.OPTIONAL ? t('optionalConfig') : section.key === SECTION_KEYS.SERVICE ? t('servicePackage') : section.key === SECTION_KEYS.WEAR_PARTS ? t('wearPartsModule') : t('mainConfig')))}</span>
                </td>
                <td class="text-[var(--text-muted)] opacity-50 text-xs whitespace-nowrap">-</td>
                <td class="text-[var(--text-muted)] opacity-50 text-center font-mono-num whitespace-nowrap">-</td>
                <td class="font-mono-num text-[var(--gas-green-light)] font-medium whitespace-nowrap">
                    <span class="quote-editable quote-editable-inline" contenteditable="true" data-section-subtotal="${esc(section.key)}">${esc(formatCurrency('RMB', section.subtotalValue))}</span>
                </td>
                <td class="font-mono-num text-[var(--gas-green-light)] font-medium whitespace-nowrap">${esc(formatCurrency('USD', section.subtotalValue * state.rates.USD))}</td>
            </tr>
        `);

        section.items.forEach((item) => {
            const normalized = normalizeQuoteItem(item, item.section_key);
            const included = normalized.is_included === true;
            const optional = normalized.section_key === SECTION_KEYS.OPTIONAL;
            const selected = normalized.is_selected === true;
            const price = safeNumber(normalized.price_rmb, 0);
            rows.push(`
                <tr class="quote-item-row" data-item-id="${esc(normalized.localId)}">
                    <td class="text-[var(--text-body)] text-center text-xs font-mono-num whitespace-nowrap">
                        <span class="quote-editable quote-editable-inline" contenteditable="true" data-item-field="line_code" data-item-id="${esc(normalized.localId)}">${esc(normalized.line_code || '--')}</span>
                    </td>
                    <td class="text-white min-w-[240px] quote-editor-desc-cell">
                        <div class="quote-editor-desc-wrap">
                            <span class="quote-editable quote-editable-inline" contenteditable="true" data-item-field="name_i18n" data-item-id="${esc(normalized.localId)}">${esc(localizedValue(normalized.name_i18n) || normalized.line_code || '--')}</span>
                            ${optional ? `<label class="quote-optional-select" title="${esc(t('optionalSelect'))}"><input type="checkbox" data-item-action="toggle-selected" data-item-id="${esc(normalized.localId)}" ${selected ? 'checked' : ''}><span>${esc(t('optionalSelect'))}</span></label>` : ''}
                            <div class="quote-editor-row-actions">
                                <button type="button" class="quote-editor-icon-btn" data-item-action="toggle-include" data-item-id="${esc(normalized.localId)}" title="${esc(t('rowToggleInclude'))}"><i class="fa-solid ${included ? 'fa-box-open' : 'fa-box'}"></i></button>
                                <button type="button" class="quote-editor-icon-btn" data-item-action="move-up" data-item-id="${esc(normalized.localId)}" title="${esc(t('rowMoveUp'))}"><i class="fa-solid fa-arrow-up"></i></button>
                                <button type="button" class="quote-editor-icon-btn" data-item-action="move-down" data-item-id="${esc(normalized.localId)}" title="${esc(t('rowMoveDown'))}"><i class="fa-solid fa-arrow-down"></i></button>
                                <button type="button" class="quote-editor-icon-btn is-danger" data-item-action="delete" data-item-id="${esc(normalized.localId)}" title="${esc(t('rowDelete'))}"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    </td>
                    <td class="text-[var(--text-body)] text-xs whitespace-nowrap"><span class="quote-editable quote-editable-inline" contenteditable="true" data-item-field="brand_label" data-item-id="${esc(normalized.localId)}">${esc(localizedValue(normalized.brand_i18n) || normalized.brand_label || '-')}</span></td>
                    <td class="text-[var(--text-body)] text-center font-mono-num whitespace-nowrap"><span class="quote-editable quote-editable-inline" contenteditable="true" data-item-field="qty_label" data-item-id="${esc(normalized.localId)}">${esc(localizedValue(normalized.qty_i18n) || normalized.qty_label || '1')}</span></td>
                    <td class="font-mono-num ${included ? 'text-[var(--text-muted)]' : 'text-[var(--gas-green-light)] font-medium'} whitespace-nowrap">${included ? esc(t('included')) : `<span class="quote-editable quote-editable-inline" contenteditable="true" data-item-field="price_rmb" data-item-id="${esc(normalized.localId)}">${esc(formatCurrency('RMB', price))}</span>`}</td>
                    <td class="font-mono-num ${included ? 'text-[#333333]' : 'text-[var(--gas-green-light)] font-medium'} whitespace-nowrap">${included ? '-' : esc(formatCurrency('USD', price * state.rates.USD))}</td>
                </tr>
            `);
        });
    });

    container.innerHTML = `
        ${mediaAbove}
        <div class="space-y-8 md:space-y-10">
            <div class="flex items-center gap-3 flex-wrap">
                <span class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded border border-[var(--gas-green-primary)] text-[var(--gas-green-light)] font-mono-num text-sm">1</span>
                <h2 class="text-xl md:text-[2rem] font-bold text-[var(--gas-green-light)] leading-snug break-words">
                    <span class="quote-editable" contenteditable="true" id="edit-product-title">${esc(localizedValue(state.product.public_title) || state.product.product_code || state.product.slug)}</span>
                </h2>
            </div>

            <div class="quote-total-card quote-total-card--with-breakdown rounded border border-[var(--border-color)] bg-[var(--bg-base)] px-5 py-4 md:px-6 md:py-5">
                <div class="quote-total-card__headline">
                    <span class="font-bold text-white tracking-wider text-xs md:text-sm">
                        <span class="quote-editable quote-editable-inline" contenteditable="true" id="edit-total-label">${esc(uiText('system_total_label', t('systemTotal')))}</span>:
                    </span>
                    <div class="quote-total-grid text-sm md:text-[15px]">
                    <span class="flex items-center gap-2"><span class="gas-tag">RMB</span> <span class="text-[var(--gas-green-light)] font-mono-num font-bold">${esc(formatCurrency('RMB', total))}</span></span>
                    <span class="flex items-center gap-2"><span class="gas-tag">USD</span> <span class="text-[var(--gas-green-light)] font-mono-num font-bold">${esc(formatCurrency('USD', total * state.rates.USD))}</span></span>
                    </div>
                </div>

            <div class="quote-total-formula" aria-label="${esc(t('pricingFormula'))}">
                <div class="quote-total-formula__values">
                    <span><b>${esc(breakdown[0][0])}</b>${esc(formatCurrency('RMB', breakdown[0][1]))} + <b>${esc(breakdown[1][0])}</b>${esc(formatCurrency('RMB', breakdown[1][1]))} + <b>${esc(breakdown[2][0])}</b>${esc(formatCurrency('RMB', breakdown[2][1]))} + <b>${esc(breakdown[3][0])}</b>${esc(formatCurrency('RMB', breakdown[3][1]))} = <strong>${esc(formatCurrency('RMB', total))}</strong></span>
                </div>
            </div>
            </div>

            <div class="quote-editor-hint">${esc(t('sectionSubtotalHint'))}</div>

            <div class="table-scroll-shell" data-scroll-left="false" data-scroll-right="false">
                <div class="table-responsive-wrapper w-full">
                    <table class="industrial-table text-left">
                        <thead>
                            <tr>${t('headers').map((header, index) => `<th class="${index === 0 ? 'w-12 text-center whitespace-nowrap' : 'whitespace-nowrap'}">${esc(header)}</th>`).join('')}</tr>
                        </thead>
                        <tbody>${rows.join('')}</tbody>
                    </table>
                </div>
            </div>
            ${mediaBelow}
        </div>
    `;

    bindContentArea();
    bindMediaControls();
    bindScrollableTables(container);
}

function bindScrollableTables(root = document) {
    [...root.querySelectorAll('.table-responsive-wrapper')].forEach((wrapper) => {
        const sync = () => {
            const shell = wrapper.closest('.table-scroll-shell');
            if (!shell) return;
            const maxScroll = Math.max(0, wrapper.scrollWidth - wrapper.clientWidth);
            shell.dataset.scrollLeft = wrapper.scrollLeft > 12 ? 'true' : 'false';
            shell.dataset.scrollRight = wrapper.scrollLeft < maxScroll - 12 ? 'true' : 'false';
        };
        wrapper.addEventListener('scroll', sync, { passive: true });
        window.requestAnimationFrame(sync);
    });
}

function bindMediaControls() {
    document.querySelectorAll('[data-gallery-nav]').forEach((button) => {
        button.onclick = () => {
            const items = sortMediaItems(state.media || []);
            if (items.length <= 1) return;
            const direction = button.dataset.galleryNav === 'prev' ? -1 : 1;
            state.galleryIndex = (state.galleryIndex + direction + items.length) % items.length;
            renderContent();
        };
    });
    document.querySelectorAll('[data-gallery-dot]').forEach((button) => {
        button.onclick = () => {
            state.galleryIndex = safeNumber(button.dataset.galleryDot, 0);
            renderContent();
        };
    });
}

function updateItem(localId, patch) {
    state.items = state.items.map((item) => {
        if (item.localId !== localId) return item;
        return normalizeQuoteItem({ ...item, ...patch }, item.section_key);
    });
}

function moveItem(localId, direction) {
    const next = [...state.items];
    const index = next.findIndex((item) => item.localId === localId);
    if (index === -1) return;
    const current = next[index];
    const sameSectionIndexes = next
        .map((item, itemIndex) => ({ item, itemIndex }))
        .filter((entry) => entry.item.section_key === current.section_key)
        .map((entry) => entry.itemIndex);
    const sectionIndex = sameSectionIndexes.indexOf(index);
    const targetSectionIndex = sectionIndex + direction;
    if (targetSectionIndex < 0 || targetSectionIndex >= sameSectionIndexes.length) return;
    const targetIndex = sameSectionIndexes[targetSectionIndex];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    state.items = next.map((item, itemIndex) => ({ ...item, sort_order: (itemIndex + 1) * 10 }));
}

function updateSection(sectionKey, patch = {}) {
    const nextSections = currentSectionConfig().map((section) => {
        if (section.key !== sectionKey) return section;
        return {
            ...section,
            ...patch,
        };
    });
    setSectionConfig(nextSections);
}

function bindContentArea() {
    byId('edit-product-title').onblur = (event) => {
        setLocalizedValue(state.product, 'public_title', event.currentTarget.textContent);
        markTranslationDirty('product.public_title');
        renderAll();
        markEditorDirty();
    };
    byId('edit-total-label').onblur = (event) => {
        setLocalizedValue(state.product.ui_text, 'system_total_label', event.currentTarget.textContent);
        markTranslationDirty('product.ui_text.system_total_label');
        renderAll();
        markEditorDirty();
    };

    document.querySelectorAll('[data-section-title]').forEach((node) => {
        node.onblur = (event) => {
            const sectionKey = event.currentTarget.dataset.sectionTitle;
            const section = currentSectionConfig().find((entry) => entry.key === sectionKey);
            if (!section) return;
            section.title = normalizeLocalizedText(section.title);
            section.title[state.currentLang] = text(event.currentTarget.textContent);
            markTranslationDirty(`section.${sectionKey}.title`);
            updateSection(sectionKey, { title: section.title });
            renderAll();
            markEditorDirty();
        };
    });

    document.querySelectorAll('[data-section-subtotal]').forEach((node) => {
        node.onblur = (event) => {
            const sectionKey = event.currentTarget.dataset.sectionSubtotal;
            updateSection(sectionKey, { subtotalMode: 'manual', subtotal: parseMoneyInput(event.currentTarget.textContent) });
            renderAll();
            markEditorDirty();
        };
    });

    document.querySelectorAll('[data-item-field]').forEach((node) => {
        node.onblur = (event) => {
            const field = event.currentTarget.dataset.itemField;
            const itemId = event.currentTarget.dataset.itemId;
            if (!field || !itemId) return;
            if (field === 'name_i18n') {
                const item = state.items.find((entry) => entry.localId === itemId);
                if (!item) return;
                const nextName = normalizeLocalizedText(item.name_i18n);
                nextName[state.currentLang] = text(event.currentTarget.textContent);
                markTranslationDirty(`item.${itemId}.name_i18n`);
                updateItem(itemId, { name_i18n: nextName });
            } else if (field === 'brand_label' || field === 'qty_label') {
                const item = state.items.find((entry) => entry.localId === itemId);
                if (!item) return;
                const localizedField = field === 'brand_label' ? 'brand_i18n' : 'qty_i18n';
                const nextValue = normalizeLocalizedText(item[localizedField]);
                nextValue[state.currentLang] = text(event.currentTarget.textContent);
                markTranslationDirty(`item.${itemId}.${localizedField}`);
                updateItem(itemId, {
                    [field]: state.currentLang === DEFAULT_LANG ? nextValue.zh : item[field],
                    [localizedField]: nextValue,
                });
            } else if (field === 'price_rmb') {
                updateItem(itemId, { price_rmb: parseMoneyInput(event.currentTarget.textContent), is_included: false });
            } else {
                updateItem(itemId, { [field]: text(event.currentTarget.textContent) });
            }
            renderAll();
            markEditorDirty();
        };
    });

    document.querySelectorAll('[data-item-action]').forEach((button) => {
        button.onclick = (event) => {
            const action = button.dataset.itemAction;
            const itemId = button.dataset.itemId;
            if (!itemId) return;
            if (action === 'delete') {
                state.items = state.items.filter((item) => item.localId !== itemId);
            } else if (action === 'move-up') {
                moveItem(itemId, -1);
            } else if (action === 'move-down') {
                moveItem(itemId, 1);
            } else if (action === 'toggle-include') {
                const item = state.items.find((entry) => entry.localId === itemId);
                updateItem(itemId, { is_included: !(item?.is_included === true) });
            } else if (action === 'toggle-selected') {
                updateItem(itemId, { is_selected: event.currentTarget.checked === true });
            }
            renderAll();
            markEditorDirty();
        };
    });
}

function bindStaticEditors() {
    byId('edit-overview-title').onblur = (event) => {
        setLocalizedValue(state.brand, 'overview_title', event.currentTarget.textContent);
        markTranslationDirty('brand.overview_title');
        renderAll();
        markEditorDirty();
    };
    const sendLabelNode = byId('edit-send-label');
    if (sendLabelNode) {
        sendLabelNode.onblur = (event) => {
            setLocalizedValue(state.product.ui_text, 'send_button', event.currentTarget.textContent);
            markTranslationDirty('product.ui_text.send_button');
            renderAll();
            markEditorDirty();
        };
    }
    const supplierLabelNode = byId('edit-supplier-label');
    if (supplierLabelNode) {
        supplierLabelNode.onblur = (event) => {
            setLocalizedValue(state.product.ui_text, 'supplier_label', event.currentTarget.textContent);
            markTranslationDirty('product.ui_text.supplier_label');
            renderAll();
            markEditorDirty();
        };
    }
    const supplierValueNode = byId('edit-supplier-value');
    if (supplierValueNode) {
        supplierValueNode.onblur = (event) => {
            state.brand.supplier_name = text(event.currentTarget.textContent);
            renderAll();
            markEditorDirty();
        };
    }
    const senderLabelNode = byId('edit-sender-label');
    if (senderLabelNode) {
        senderLabelNode.onblur = (event) => {
            setLocalizedValue(state.product.ui_text, 'sender_label', event.currentTarget.textContent);
            markTranslationDirty('product.ui_text.sender_label');
            renderAll();
            markEditorDirty();
        };
    }
    const senderValueNode = byId('edit-sender-value');
    if (senderValueNode) {
        senderValueNode.onblur = (event) => {
            state.brand.sender_email = text(event.currentTarget.textContent);
            renderAll();
            markEditorDirty();
        };
    }
    byId('edit-validity-label').onblur = (event) => {
        setLocalizedValue(state.product.ui_text, 'validity_label', event.currentTarget.textContent);
        markTranslationDirty('product.ui_text.validity_label');
        renderAll();
        markEditorDirty();
    };
    byId('edit-receiver-label').onblur = (event) => {
        if (state.kind === 'instance') return;
        setLocalizedValue(state.product.ui_text, 'receiver_label', event.currentTarget.textContent);
        markTranslationDirty('product.ui_text.receiver_label');
        renderAll();
        markEditorDirty();
    };
    byId('edit-receiver-value').onblur = (event) => {
        if (state.kind === 'instance') {
            state.instance.customer_name = text(event.currentTarget.textContent);
        } else {
            setLocalizedValue(state.product.ui_text, 'receiver_placeholder', event.currentTarget.textContent);
            markTranslationDirty('product.ui_text.receiver_placeholder');
        }
        renderAll();
        markEditorDirty();
    };
    byId('footer-note').onblur = (event) => {
        setLocalizedValue(state.brand, 'footer_note', event.currentTarget.textContent);
        markTranslationDirty('brand.footer_note');
        renderAll();
        markEditorDirty();
    };
    byId('btn-text-refresh').onblur = (event) => {
        setLocalizedValue(state.product.ui_text, 'refresh_button', event.currentTarget.textContent);
        markTranslationDirty('product.ui_text.refresh_button');
        renderAll();
        markEditorDirty();
    };
}

function flushPendingEditorChanges() {
    const active = document.activeElement;
    if (active && typeof active.blur === 'function' && active !== document.body) {
        active.blur();
    }

    document.querySelectorAll('[data-setting-field]').forEach((node) => {
        applySettingField(node.dataset.settingField, node.value);
    });

    const productTitle = byId('edit-product-title');
    if (productTitle) {
        setLocalizedValue(state.product, 'public_title', productTitle.textContent);
    }

    const totalLabel = byId('edit-total-label');
    if (totalLabel) {
        setLocalizedValue(state.product.ui_text, 'system_total_label', totalLabel.textContent);
    }

    document.querySelectorAll('[data-section-title]').forEach((node) => {
        const sectionKey = node.dataset.sectionTitle;
        const section = currentSectionConfig().find((entry) => entry.key === sectionKey);
        if (!section || !sectionKey) return;
        section.title = normalizeLocalizedText(section.title);
        section.title[state.currentLang] = text(node.textContent);
        updateSection(sectionKey, { title: section.title });
    });

    document.querySelectorAll('[data-section-subtotal]').forEach((node) => {
        const sectionKey = node.dataset.sectionSubtotal;
        if (!sectionKey) return;
        updateSection(sectionKey, { subtotalMode: 'manual', subtotal: parseMoneyInput(node.textContent) });
    });

    document.querySelectorAll('[data-item-field]').forEach((node) => {
        const field = node.dataset.itemField;
        const itemId = node.dataset.itemId;
        if (!field || !itemId) return;
        if (field === 'name_i18n') {
            const item = state.items.find((entry) => entry.localId === itemId);
            if (!item) return;
            const nextName = normalizeLocalizedText(item.name_i18n);
            nextName[state.currentLang] = text(node.textContent);
            updateItem(itemId, { name_i18n: nextName });
            return;
        }
        if (field === 'brand_label' || field === 'qty_label') {
            const item = state.items.find((entry) => entry.localId === itemId);
            if (!item) return;
            const localizedField = field === 'brand_label' ? 'brand_i18n' : 'qty_i18n';
            const nextValue = normalizeLocalizedText(item[localizedField]);
            nextValue[state.currentLang] = text(node.textContent);
            updateItem(itemId, {
                [field]: state.currentLang === DEFAULT_LANG ? nextValue.zh : item[field],
                [localizedField]: nextValue,
            });
            return;
        }
        if (field === 'price_rmb') {
            updateItem(itemId, { price_rmb: parseMoneyInput(node.textContent), is_included: false });
            return;
        }
        updateItem(itemId, { [field]: text(node.textContent) });
    });

    const overviewTitle = byId('edit-overview-title');
    if (overviewTitle) {
        setLocalizedValue(state.brand, 'overview_title', overviewTitle.textContent);
    }

    const sendLabel = byId('edit-send-label');
    if (sendLabel) {
        setLocalizedValue(state.product.ui_text, 'send_button', sendLabel.textContent);
    }

    const supplierLabel = byId('edit-supplier-label');
    if (supplierLabel) {
        setLocalizedValue(state.product.ui_text, 'supplier_label', supplierLabel.textContent);
    }

    const supplierValue = byId('edit-supplier-value');
    if (supplierValue) {
        state.brand.supplier_name = text(supplierValue.textContent);
    }

    const senderLabel = byId('edit-sender-label');
    if (senderLabel) {
        setLocalizedValue(state.product.ui_text, 'sender_label', senderLabel.textContent);
    }

    const senderValue = byId('edit-sender-value');
    if (senderValue) {
        state.brand.sender_email = text(senderValue.textContent);
    }

    const validityLabel = byId('edit-validity-label');
    if (validityLabel) {
        setLocalizedValue(state.product.ui_text, 'validity_label', validityLabel.textContent);
    }

    const receiverLabel = byId('edit-receiver-label');
    if (receiverLabel && state.kind !== 'instance') {
        setLocalizedValue(state.product.ui_text, 'receiver_label', receiverLabel.textContent);
    }

    const receiverValue = byId('edit-receiver-value');
    if (receiverValue) {
        if (state.kind === 'instance') {
            state.instance.customer_name = text(receiverValue.textContent);
        } else {
            setLocalizedValue(state.product.ui_text, 'receiver_placeholder', receiverValue.textContent);
        }
    }

    const footerNote = byId('footer-note');
    if (footerNote) {
        setLocalizedValue(state.brand, 'footer_note', footerNote.textContent);
    }

    const refreshButtonText = byId('btn-text-refresh');
    if (refreshButtonText) {
        setLocalizedValue(state.product.ui_text, 'refresh_button', refreshButtonText.textContent);
    }
}

function renderAll(options = {}) {
    if (options.snapshot !== false) state.snapshot = buildSnapshot();
    applyTheme();
    renderStaticText();
    renderRateLine();
    updateRateStatus('online');
    renderContent();
    renderClock();
    bindStaticEditors();
}

async function fetchRates(isManual = false) {
    const previousRates = normalizeRates(state.rates);
    if (isManual) updateRateStatus('loading');
    renderStatus(editorT('rateRefreshing'), 'warning');
    try {
        const response = await fetch(RATE_API_URL, { cache: 'no-store' });
        const data = await response.json();
        if (data?.rates) {
            state.rates = normalizeRates({
                USD: data.rates.USD,
                EUR: data.rates.EUR,
                CAD: data.rates.CAD,
                RUB: data.rates.RUB,
            });
        }
        if (state.kind === 'product') state.product.default_rates = normalizeRates(state.rates);
        else state.instance.draft_rates = normalizeRates(state.rates);
        renderAll();
        if (JSON.stringify(previousRates) === JSON.stringify(state.rates)) {
            setRateDetail(localeCopy({
                zh: '汇率已刷新，接口返回未变化。',
                en: 'Rates refreshed. The API returned the same values.',
                ru: 'Курсы обновлены. API вернул те же значения.',
            }));
        } else {
            setRateDetail(localeCopy({
                zh: '汇率已刷新，页面金额已重算。',
                en: 'Rates refreshed. Amounts were recalculated.',
                ru: 'Курсы обновлены. Суммы пересчитаны.',
            }), 'success');
            markEditorDirty({ showStatus: false });
        }
    } catch (_error) {
        updateRateStatus('error');
        setRateDetail(t('rateFallback'), 'error');
    }
}

async function persistItemRows(tableName, ownerColumn, ownerId, items = []) {
    const persistedIds = state.persistedItemIds instanceof Set ? state.persistedItemIds : new Set();
    const orderedItems = dedupeQuoteItems(items);
    const payload = orderedItems.map((item, index) => {
        const normalized = normalizeQuoteItem(item, item.section_key);
        const row = {
            [ownerColumn]: ownerId,
            section_key: normalized.section_key,
            sort_order: (index + 1) * 10,
            line_code: normalized.line_code,
            brand_label: normalized.brand_label,
            qty_label: normalized.qty_label,
            price_rmb: normalized.price_rmb,
            is_included: normalized.is_included === true,
            is_selected: normalized.is_selected === true,
            name_i18n: serializeQuoteItemI18n(normalized),
        };
        // New editor rows already carry a UUID localId. Send it explicitly so
        // Supabase upsert never turns a new row into an explicit NULL id.
        row.id = normalized.localId;
        return row;
    });
    const currentPersistedIds = new Set(payload.filter((row) => row.id).map((row) => row.id));
    const removedIds = [...persistedIds].filter((id) => !currentPersistedIds.has(id));
    if (removedIds.length) {
        const del = await client.from(tableName).delete().eq(ownerColumn, ownerId).in('id', removedIds);
        if (del.error) throw del.error;
    }
    if (!payload.length) {
        state.persistedItemIds = new Set();
        return [];
    }
    const saved = await client.from(tableName).upsert(payload, { onConflict: 'id' }).select('*');
    if (saved.error) throw saved.error;
    state.persistedItemIds = new Set((saved.data || []).map((row) => row.id));
    return saved.data || [];
}

async function saveBrand(user) {
    let serverBrand = null;
    if (state.brand.id) {
        const result = await client.from(TABLE_BRANDS).select('overview_title,footer_note').eq('id', state.brand.id).maybeSingle();
        if (!result.error) serverBrand = result.data;
    }
    const payload = {
        slug: state.brand.slug,
        brand_name: state.brand.brand_name || state.brand.display_name,
        display_name: state.brand.display_name || state.brand.brand_name,
        supplier_name: state.brand.supplier_name || state.brand.display_name,
        sender_email: state.brand.sender_email,
        subject_name: state.brand.subject_name || state.brand.display_name,
        overview_title: mergeLocalizedForSave(state.brand.overview_title, serverBrand?.overview_title),
        footer_note: mergeLocalizedForSave(state.brand.footer_note, serverBrand?.footer_note),
        theme_primary: state.brand.theme_primary || DEFAULT_THEME_PRIMARY,
        theme_dark: state.brand.theme_dark || DEFAULT_THEME_DARK,
        share_signing_secret: state.brand.share_signing_secret || DEFAULT_SHARE_SECRET,
        share_unlock_prefix: state.brand.share_unlock_prefix || `${state.brand.slug || 'quote'}-share-unlocked`,
        default_quote_slug: state.brand.default_quote_slug || null,
        is_active: state.brand.is_active !== false,
        updated_by: user?.id || null,
    };
    if (state.brand.id) payload.id = state.brand.id;
    if (!state.brand.id) payload.created_by = user?.id || null;
    const { data, error } = await client.from(TABLE_BRANDS).upsert(payload, { onConflict: 'slug' }).select('*').single();
    if (error) throw error;
    state.brand = normalizeBrandEditor(data);
}

async function saveProduct(user) {
    let serverProduct = null;
    let serverItems = [];
    if (state.product.id) {
        const [productResult, itemResult] = await Promise.all([
            client.from(TABLE_PRODUCTS).select('public_title,section_config,ui_text').eq('id', state.product.id).maybeSingle(),
            client.from(TABLE_PRODUCT_ITEMS).select('id,line_code,name_i18n').eq('product_id', state.product.id),
        ]);
        if (!productResult.error) serverProduct = productResult.data;
        if (!itemResult.error) serverItems = itemResult.data || [];
    }
    await saveBrand(user);
    const serverSections = normalizeSectionConfig(serverProduct?.section_config);
    const mergedSections = currentSectionConfig().map((section) => {
        const serverSection = serverSections.find((entry) => entry.key === section.key);
        return {
            ...section,
            title: mergeLocalizedForSave(section.title, serverSection?.title),
        };
    });
    const serverItemsById = new Map(serverItems.map((item) => [item.id, item]));
    const serverItemsByLine = new Map(serverItems.filter((item) => text(item.line_code)).map((item) => [item.line_code, item]));
    state.items = state.items.map((item) => {
        const serverItem = serverItemsById.get(item.localId) || serverItemsByLine.get(item.line_code);
        return serverItem
            ? { ...item, name_i18n: mergeLocalizedForSave(item.name_i18n, serverItem.name_i18n) }
            : item;
    });
    const mergedUiText = normalizeProductUiText(state.product.ui_text);
    const serverUiText = normalizeProductUiText(serverProduct?.ui_text);
    Object.keys(mergedUiText).forEach((key) => {
        if (key === 'enabled_langs') return;
        mergedUiText[key] = mergeLocalizedForSave(mergedUiText[key], serverUiText[key]);
    });
    const payload = {
        brand_id: state.brand.id,
        slug: state.product.slug,
        product_code: state.product.product_code || state.product.slug,
        public_title: mergeLocalizedForSave(state.product.public_title, serverProduct?.public_title),
        default_lang: state.product.default_lang,
        validity_hours: state.product.validity_hours,
        default_rates: normalizeRates(state.rates),
        section_config: normalizeSectionConfig(mergedSections),
        ui_text: mergedUiText,
        media_config: normalizeMediaConfig(state.product.media_config),
        sort_order: state.product.sort_order,
        is_active: state.product.is_active !== false,
        updated_by: user?.id || null,
    };
    if (state.product.id) payload.id = state.product.id;
    if (!state.product.id) payload.created_by = user?.id || null;
    const { data, error } = await client.from(TABLE_PRODUCTS).upsert(payload, { onConflict: 'slug' }).select('*').single();
    if (error) throw error;
    state.product = normalizeProductEditor({ ...data, media_gallery: state.media });
    const savedItems = await persistItemRows(TABLE_PRODUCT_ITEMS, 'product_id', data.id, state.items);
    state.items = dedupeQuoteItems(savedItems.map((item) => normalizeQuoteItem(item, item.section_key)));
    state.persistedItemIds = new Set(state.items.map((item) => item.localId));
    state.id = data.id;
}

async function syncInstanceCustomerEmail(nextEmail = '') {
    const customerId = text(state.instance?.customer_id);
    if (!customerId) return;
    const { error } = await client
        .from(TABLE_CUSTOMERS)
        .update({
            email: normalizedCustomerEmail(nextEmail),
            updated_by: state.user?.id || null,
        })
        .eq('id', customerId);
    if (error?.code === '23505') throw new Error('该客户邮箱已被占用，请更换唯一邮箱后再保存。');
    if (error) throw error;
}

function buildShareSnapshot(instance, items = []) {
    return buildQuoteSnapshot({
        brand: extractBrandSnapshot(state.brand),
        product: extractProductSnapshot({
            ...state.product,
            media_gallery: state.media,
            section_config: currentSectionConfig(),
            ui_text: state.product.ui_text,
        }),
        instance,
        items,
        mode: text(instance?.status).toLowerCase() === 'published' ? 'published' : 'preview',
    });
}

async function persistShareSnapshot(instance, items = [], user) {
    const snapshot = buildShareSnapshot(instance, items);
    const { data, error } = await client
        .from(TABLE_INSTANCES)
        .update({
            published_snapshot: snapshot,
            updated_by: user?.id || null,
        })
        .eq('id', instance.id)
        .select('*')
        .single();
    if (error) throw error;
    return data;
}

async function saveInstance(user) {
    const email = normalizedCustomerEmail(state.instance.receiver_email);
    if (!email) throw new Error('客户邮箱为必填项，请先填写后再保存。');
    if (!isValidCustomerEmail(email)) throw new Error('客户邮箱格式不正确，请输入标准邮箱地址。');
    const customerId = text(state.instance?.customer_id);
    if (customerId) {
        const { data: duplicated, error: duplicateError } = await client
            .from(TABLE_CUSTOMERS)
            .select('id')
            .eq('email', email)
            .neq('id', customerId)
            .maybeSingle();
        if (duplicateError) throw duplicateError;
        if (duplicated?.id) throw new Error('该客户邮箱已被占用，请更换唯一邮箱后再保存。');
    }
    state.instance.receiver_email = email;
    if (state.instance.share_config && typeof state.instance.share_config === 'object') {
        state.instance.share_config = {
            ...state.instance.share_config,
            recipient_email: email,
        };
    }
    const currentStatus = text(state.instance.status || 'draft').toLowerCase();
    const nextStatus = currentStatus === 'published'
        ? 'published'
        : currentStatus === 'archived'
            ? 'draft'
            : 'draft';
    const nextLastActiveStatus = text(state.instance.last_active_status || currentStatus || 'draft').toLowerCase() === 'published'
        || nextStatus === 'published'
        ? 'published'
        : 'draft';
    const payload = {
        brand_id: state.brand.id,
        product_id: state.instance.product_id || state.product.id,
        public_slug: text(state.instance.public_slug) || createPublicSlug(state.brand.slug, state.product.slug),
        status: nextStatus,
        last_active_status: nextLastActiveStatus,
        customer_name: state.instance.customer_name,
        receiver_name: state.instance.receiver_name,
        receiver_email: email,
        default_lang: state.instance.default_lang,
        validity_hours: state.instance.validity_hours,
        draft_rates: normalizeRates(state.rates),
        share_config: state.instance.share_config || {},
        brand_snapshot: extractBrandSnapshot(state.brand),
        product_snapshot: extractProductSnapshot({
            ...state.product,
            media_gallery: state.media,
            section_config: currentSectionConfig(),
            ui_text: state.product.ui_text,
        }),
        section_config: currentSectionConfig(),
        updated_by: user?.id || null,
    };
    let saved;
    if (state.instance.id) {
        const { data, error } = await client.from(TABLE_INSTANCES).update(payload).eq('id', state.instance.id).select('*').single();
        if (error) throw error;
        saved = data;
    } else {
        const insertPayload = {
            ...payload,
            created_by: user?.id || null,
        };
        const { data, error } = await client.from(TABLE_INSTANCES).insert(insertPayload).select('*').single();
        if (error) throw error;
        saved = data;
    }
    const savedItems = await persistItemRows(TABLE_INSTANCE_ITEMS, 'instance_id', saved.id, state.items);
    state.instance = normalizeInstanceEditor(saved);
    await syncInstanceCustomerEmail(state.instance.receiver_email);
    state.items = dedupeQuoteItems(savedItems.map((item) => normalizeQuoteItem(item, item.section_key)));
    state.persistedItemIds = new Set(state.items.map((item) => item.localId));
    const shared = await persistShareSnapshot(saved, state.items, user);
    state.instance = normalizeInstanceEditor(shared);
    state.id = shared.id;
    return state.instance;
}

async function saveProductPreviewInstance(user) {
    flushPendingEditorChanges();
    const token = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`).replace(/[^a-z0-9]/gi, '').slice(0, 10).toLowerCase();
    const previewCustomerName = localizedValue(state.product.ui_text?.receiver_placeholder);
    const payload = {
        brand_id: state.brand.id,
        product_id: state.product.id,
        public_slug: createPublicSlug(state.brand.slug, `${state.product.slug}-preview-${token}`),
        status: 'draft',
        last_active_status: 'draft',
        customer_name: previewCustomerName || '模板预览',
        receiver_name: localizedValue(state.product.public_title) || state.product.product_code || state.product.slug,
        receiver_email: '',
        default_lang: state.currentLang || state.product.default_lang,
        validity_hours: state.product.validity_hours,
        draft_rates: normalizeRates(state.rates),
        share_config: {
            preview_source: 'product_template',
            enabled_langs: configuredEditorLangs(),
        },
        brand_snapshot: extractBrandSnapshot(state.brand),
        product_snapshot: extractProductSnapshot({
            ...state.product,
            media_gallery: state.media,
            section_config: currentSectionConfig(),
            ui_text: state.product.ui_text,
        }),
        section_config: currentSectionConfig(),
        updated_by: user?.id || null,
    };

    let saved = null;
    if (state.productPreviewInstanceId) {
        const { public_slug: _publicSlug, ...updatePayload } = payload;
        const { data, error } = await client
            .from(TABLE_INSTANCES)
            .update(updatePayload)
            .eq('id', state.productPreviewInstanceId)
            .select('*')
            .maybeSingle();
        if (!error && data?.id) saved = data;
    }

    if (!saved) {
        const { data, error } = await client
            .from(TABLE_INSTANCES)
            .insert({
                ...payload,
                created_by: user?.id || null,
            })
            .select('*')
            .single();
        if (error) throw error;
        saved = data;
    }

    state.persistedItemIds = new Set();
    const savedItems = await persistItemRows(TABLE_INSTANCE_ITEMS, 'instance_id', saved.id, state.items);
    const shared = await persistShareSnapshot(
        saved,
        savedItems.map((item) => normalizeQuoteItem(item, item.section_key)),
        user,
    );
    state.productPreviewInstanceId = shared.id;
    return shared.id;
}

async function publishInstance(user) {
    const saved = await saveInstance(user);
    const publishVersion = nextQuoteVersion(saved);
    const snapshot = buildQuoteSnapshot({
        brand: extractBrandSnapshot(state.brand),
        product: extractProductSnapshot({
            ...state.product,
            media_gallery: state.media,
            section_config: currentSectionConfig(),
            ui_text: state.product.ui_text,
        }),
        instance: {
            ...state.instance,
            ...saved,
            quote_version: publishVersion,
        },
        items: state.items,
        publishedAt: new Date().toISOString(),
        mode: 'published',
    });
    const { data, error } = await client
        .from(TABLE_INSTANCES)
        .update({
            status: 'published',
            last_active_status: 'published',
            published_snapshot: snapshot,
            published_at: snapshot.quote.publishedAt,
            updated_by: user?.id || null,
        })
        .eq('id', state.instance.id || saved.id)
        .select('*')
        .single();
    if (error) throw error;
    state.instance = normalizeInstanceEditor(data);
    return state.instance;
}

async function runAutoTranslation(force = false) {
    if (!force && state.translationDirty.size === 0) {
        return { attempted: false, translated: false, skipped: true };
    }
    try {
        const result = await autoTranslateLocalizedFields(force);
        if (!result.attempted) {
            return { attempted: false, translated: false, fallback: false };
        }
        renderAll();
        renderStatus(localeCopy({
            zh: force ? '已重新生成 EN / RU。' : '已自动补全 EN / RU。',
            en: force ? 'EN / RU regenerated.' : 'EN / RU auto-filled.',
            ru: force ? 'EN / RU пересозданы.' : 'EN / RU заполнены автоматически.',
        }), 'success');
        return { attempted: true, translated: true, fallback: false };
    } catch (error) {
        renderStatus(localeCopy({
            zh: '星火翻译暂不可用，本次将继续按中文回退保存。',
            en: 'Spark translation is unavailable. Saving will fall back to Chinese values.',
            ru: 'Перевод Spark недоступен. Сохранение продолжится с откатом на китайский текст.',
        }), 'warning');
        return { attempted: true, translated: false, fallback: true, error };
    }
}

async function autoFillCurrentLanguage() {
    const target = state.currentLang;
    if (target === DEFAULT_LANG || state.translationRequest) return;
    if (!collectTranslationEntries(false, [target]).length) return;

    const request = (async () => {
        renderStatus(localeCopy({
            zh: `正在补全 ${target.toUpperCase()} 翻译...`,
            en: `Filling missing ${target.toUpperCase()} translations...`,
            ru: `Заполняются переводы ${target.toUpperCase()}...`,
        }));
        try {
            const result = await autoTranslateLocalizedFields(false, [target]);
            if (!result.translated) return;
            markEditorDirty({ showStatus: false });
            renderAll({ snapshot: false });
            renderStatus(localeCopy({
                zh: `${target.toUpperCase()} 翻译已补全，请点击保存产品模板。`,
                en: `${target.toUpperCase()} translations are ready. Click Save Template to keep them.`,
                ru: `Переводы ${target.toUpperCase()} готовы. Нажмите «Сохранить шаблон».`,
            }), 'success');
        } catch (_error) {
            renderStatus(localeCopy({
                zh: '自动翻译暂不可用，当前仍显示中文回退。',
                en: 'Auto-translation is unavailable. Chinese fallback is still shown.',
                ru: 'Автоперевод недоступен. Пока показан китайский текст.',
            }), 'warning');
        }
    })();
    state.translationRequest = request;
    try {
        await request;
    } finally {
        if (state.translationRequest === request) state.translationRequest = null;
    }
}

async function handleSave() {
    if (state.saveInFlight) {
        return false;
    }
    flushPendingEditorChanges();
    const saveVersion = state.hasUnsavedChanges ? state.changeVersion : state.changeVersion + 1;
    if (!state.hasUnsavedChanges) {
        state.hasUnsavedChanges = true;
        state.changeVersion = saveVersion;
    }
    state.saveInFlight = true;
    updateSaveButtons('保存中...', true);
    renderStatus('保存中...');
    try {
        const auth = await client.auth.getUser();
        state.user = auth?.data?.user || null;
        if (!state.user) renderStatus(editorT('needLogin'), 'warning');
        // Translation is a best-effort supplement to the primary save. Only
        // retry fields changed in this edit so a slow translation endpoint
        // cannot make every save look stuck.
        await runAutoTranslation(false);
        if (state.kind === 'product') {
            await saveProduct(state.user);
        } else {
            await saveInstance(state.user);
        }
        state.snapshot = buildSnapshot();
        renderAll();
        clearTranslationDirty();
        if (state.changeVersion === saveVersion) {
            state.hasUnsavedChanges = false;
        }
        updateSaveButtons(state.kind === 'product' ? '保存模板' : '保存草稿', false);
        renderStatus(editorT('saveSuccess'), 'success');
        return true;
    } catch (error) {
        updateSaveButtons(state.kind === 'product' ? '保存模板' : '保存草稿', false);
        renderStatus(`${editorT('saveFailed')} ${error.message || ''}`, 'error');
        return false;
    } finally {
        state.saveInFlight = false;
        renderEditorActions();
    }
}

async function loadProduct(id) {
    const { data: productRow, error } = await client.from(TABLE_PRODUCTS).select('*').eq('id', id).single();
    if (error) throw error;
    const [{ data: brandRow, error: brandError }, { data: itemRows, error: itemError }, { data: mediaRows, error: mediaError }] = await Promise.all([
        client.from(TABLE_BRANDS).select('*').eq('id', productRow.brand_id).single(),
        client.from(TABLE_PRODUCT_ITEMS).select('*').eq('product_id', id).order('sort_order', { ascending: true }),
        client.from(TABLE_PRODUCT_MEDIA).select('*').eq('product_id', id).eq('is_active', true).order('sort_order', { ascending: true }),
    ]);
    if (brandError) throw brandError;
    if (itemError) throw itemError;
    if (mediaError) throw mediaError;
    state.brand = normalizeBrandEditor(brandRow);
    state.product = normalizeProductEditor({ ...productRow, media_gallery: mediaRows || [] });
    state.instance = null;
    state.items = dedupeQuoteItems((itemRows || []).map((item) => normalizeQuoteItem(item, item.section_key)));
    state.persistedItemIds = new Set(state.items.map((item) => item.localId));
    state.media = sortMediaItems((mediaRows || []).map((item) => normalizeQuoteMediaItem(item)));
    state.rates = normalizeRates(state.product.default_rates);
    state.currentLang = DEFAULT_LANG;
}

async function loadInstance(id) {
    const { data: instanceRow, error } = await client.from(TABLE_INSTANCES).select('*').eq('id', id).single();
    if (error) throw error;
    const [{ data: itemRows, error: itemError }, { data: productRow, error: productError }, { data: mediaRows, error: mediaError }, { data: brandRow, error: brandError }] = await Promise.all([
        client.from(TABLE_INSTANCE_ITEMS).select('*').eq('instance_id', id).order('sort_order', { ascending: true }),
        client.from(TABLE_PRODUCTS).select('*').eq('id', instanceRow.product_id).single(),
        client.from(TABLE_PRODUCT_MEDIA).select('*').eq('product_id', instanceRow.product_id).eq('is_active', true).order('sort_order', { ascending: true }),
        client.from(TABLE_BRANDS).select('*').eq('id', instanceRow.brand_id).maybeSingle(),
    ]);
    if (itemError) throw itemError;
    if (productError) throw productError;
    if (mediaError) throw mediaError;
    if (brandError) throw brandError;
    state.brand = normalizeBrandEditor({
        ...(brandRow || {}),
        ...(instanceRow.brand_snapshot || {}),
        id: instanceRow.brand_id || brandRow?.id || '',
    });
    state.product = normalizeProductEditor({
        ...productRow,
        ...(instanceRow.product_snapshot || {}),
        section_config: instanceRow.section_config || instanceRow.product_snapshot?.section_config || productRow.section_config,
        media_gallery: mediaRows?.length ? mediaRows : instanceRow.product_snapshot?.media_gallery || [],
    });
    state.instance = normalizeInstanceEditor(instanceRow);
    state.items = dedupeQuoteItems((itemRows || []).map((item) => normalizeQuoteItem(item, item.section_key)));
    state.persistedItemIds = new Set(state.items.map((item) => item.localId));
    state.media = sortMediaItems((mediaRows?.length ? mediaRows : state.product.media_gallery || []).map((item) => normalizeQuoteMediaItem(item)));
    state.rates = normalizeRates(state.instance.draft_rates);
    state.currentLang = DEFAULT_LANG;
}

function parseRoute() {
    const params = new URLSearchParams(window.location.search);
    state.kind = text(params.get('kind'), 'product');
    state.id = text(params.get('id'));
    return state.kind && state.id;
}

function updateBackToTop() {
    const button = byId('back-to-top');
    if (!button) return;
    button.classList.toggle('is-visible', window.scrollY > 320);
}

function bindGlobal() {
    byId('btn-zh').onclick = () => {
        state.currentLang = 'zh';
        renderAll({ snapshot: false });
    };
    byId('btn-en').onclick = () => {
        state.currentLang = 'en';
        renderAll({ snapshot: false });
        void autoFillCurrentLanguage();
    };
    byId('btn-ru').onclick = () => {
        state.currentLang = 'ru';
        renderAll({ snapshot: false });
        void autoFillCurrentLanguage();
    };
    byId('btn-add-main-row').onclick = () => {
        state.items = [...state.items, { ...createQuoteItem(SECTION_KEYS.MAIN), sort_order: (state.items.length + 1) * 10 }];
        renderAll();
        markEditorDirty();
    };
    byId('btn-add-service-row').onclick = () => {
        state.items = [...state.items, { ...createQuoteItem(SECTION_KEYS.SERVICE), sort_order: (state.items.length + 1) * 10 }];
        renderAll();
        markEditorDirty();
    };
    byId('btn-add-optional-row').onclick = () => {
        state.items = [...state.items, { ...createQuoteItem(SECTION_KEYS.OPTIONAL), sort_order: (state.items.length + 1) * 10 }];
        renderAll();
        markEditorDirty();
    };
    byId('btn-add-wear-parts-row').onclick = () => {
        state.items = [...state.items, { ...createQuoteItem(SECTION_KEYS.WEAR_PARTS), sort_order: (state.items.length + 1) * 10 }];
        renderAll();
        markEditorDirty();
    };

    byId('btn-save-editor').onclick = () => {
        void handleSave();
    };

    byId('btn-preview-instance')?.addEventListener('click', async () => {
        if (state.saveInFlight) return;
        const previewWindow = openPreviewWindow();
        if (!previewWindow) return;
        if (state.kind === 'product') {
            try {
                renderStatus('正在生成产品预览（使用当前语言和未保存内容）...');
                const previewId = await saveProductPreviewInstance(state.user);
                previewWindow.location.href = previewQuoteUrl(previewId);
                renderStatus('产品预览已打开，当前修改尚未保存。', 'success');
            } catch (error) {
                previewWindow.close();
                renderStatus(`产品预览生成失败。${error.message || ''}`, 'error');
            }
            return;
        }
        if (state.kind !== 'instance') {
            previewWindow.close();
            return;
        }
        if (!state.instance?.id) {
            renderStatus('\u8bf7\u5148\u4fdd\u5b58\u8349\u7a3f\uff0c\u518d\u9884\u89c8\u5ba2\u6237\u9875\u3002', 'warning');
            previewWindow.close();
            return;
        }
        const saved = await handleSave();
        if (!saved || !state.instance?.id) {
            previewWindow.close();
            return;
        }
        previewWindow.location.href = previewQuoteUrl(state.instance.id);
    });

    byId('btn-publish-instance')?.addEventListener('click', async () => {
        if (state.kind !== 'instance') return;
        const actionMode = publishedInstanceActionMode();
        if (actionMode === 'copy') {
            const publicSlug = text(state.instance?.public_slug);
            if (!publicSlug) {
                renderStatus('\u8bf7\u5148\u53d1\u5e03\u62a5\u4ef7\uff0c\u518d\u590d\u5236\u5ba2\u6237\u94fe\u63a5\u3002', 'warning');
                return;
            }
            try {
                await copyText(publicQuoteUrl(publicSlug));
                renderStatus('\u5ba2\u6237\u94fe\u63a5\u5df2\u590d\u5236\u3002', 'success');
            } catch (error) {
                renderStatus(`\u590d\u5236\u5ba2\u6237\u94fe\u63a5\u5931\u8d25 ${error?.message || ''}`, 'error');
            }
            return;
        }
        if (state.saveInFlight) return;
        flushPendingEditorChanges();
        state.saveInFlight = true;
        updateSaveButtons('\u4fdd\u5b58\u8349\u7a3f\u4e2d...', true);
        const publishButton = byId('btn-publish-instance');
        const originalLabel = publishButton?.textContent || '\u53d1\u5e03\u62a5\u4ef7';
        if (publishButton) {
            publishButton.disabled = true;
            publishButton.textContent = actionMode === 'update' ? '\u66f4\u65b0\u4e2d...' : '\u53d1\u5e03\u4e2d...';
        }
        renderStatus(actionMode === 'update' ? '\u6b63\u5728\u66f4\u65b0\u62a5\u4ef7...' : '\u6b63\u5728\u53d1\u5e03\u62a5\u4ef7...', 'warning');
        try {
            const auth = await client.auth.getUser();
            state.user = auth?.data?.user || null;
            if (!state.user) renderStatus(editorT('needLogin'), 'warning');
            await runAutoTranslation(true);
            await publishInstance(state.user);
            state.snapshot = buildSnapshot();
            renderAll();
            clearTranslationDirty();
            state.hasUnsavedChanges = false;
            state.saveInFlight = false;
            updateSaveButtons('\u4fdd\u5b58\u8349\u7a3f', false);
            renderStatus(actionMode === 'update' ? '\u62a5\u4ef7\u5df2\u66f4\u65b0\u3002' : '\u62a5\u4ef7\u5df2\u53d1\u5e03\u3002', 'success');
            window.location.assign(pipelineReturnUrl());
            return;
        } catch (error) {
            renderStatus(`${t('saveFailed')} ${error.message || ''}`, 'error');
        } finally {
            state.saveInFlight = false;
            updateSaveButtons('\u4fdd\u5b58\u8349\u7a3f', false);
            if (publishButton) {
                publishButton.disabled = false;
                publishButton.textContent = originalLabel;
            }
            renderEditorActions();
        }
    });

    byId('btn-refresh-rates').onclick = () => {
        void fetchRates(true);
    };

    byId('back-to-top').onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    window.addEventListener('beforeunload', (event) => {
        if (!state.hasUnsavedChanges && !state.saveInFlight) return;
        event.preventDefault();
        event.returnValue = '';
    });
    updateSaveButtons('\u4fdd\u5b58\u8349\u7a3f', false);
}

async function init() {
    bindGlobal();
    if (!parseRoute()) {
        renderStatus(editorT('invalidRoute'), 'error');
        return;
    }
    try {
        const auth = await client.auth.getUser();
        state.user = auth?.data?.user || null;
        if (state.kind === 'product') {
            await loadProduct(state.id);
        } else {
            await loadInstance(state.id);
        }
        clearTranslationDirty();
        state.baseTime = Date.now();
        renderAll();
        startClock();
        updateBackToTop();
        renderStatus(state.kind === 'product' ? editorT('productMode') : editorT('instanceMode'));
    } catch (error) {
        renderStatus(`${editorT('loadFailed')} ${error.message || ''}`, 'error');
    }
}

void init();
