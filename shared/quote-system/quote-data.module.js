export const SUPPORTED_LANGS = ['zh', 'en', 'ru'];
export const DEFAULT_LANG = 'zh';
export const DEFAULT_RATES = Object.freeze({
    USD: 0.1398,
    EUR: 0.1265,
    CAD: 0.1888,
    RUB: 12.866,
});
export const DEFAULT_THEME_PRIMARY = '#5DD62C';
export const DEFAULT_THEME_DARK = '#337418';
export const DEFAULT_SHARE_SECRET = 'GasGx::Quote::ShareGate::20260321';
export const SECTION_KEYS = Object.freeze({
    MAIN: 'main_config',
    OPTIONAL: 'optional_config',
});
export const MEDIA_LAYOUTS = Object.freeze({
    CAROUSEL: 'carousel',
    STACK: 'stack',
});
export const MEDIA_POSITIONS = Object.freeze({
    ABOVE: 'above',
    BELOW: 'below',
});
export const PRODUCT_UI_TEXT_KEYS = Object.freeze([
    'supplier_label',
    'sender_label',
    'receiver_label',
    'validity_label',
    'system_total_label',
    'refresh_button',
    'send_button',
    'share_button',
    'receiver_placeholder',
]);
export const PRODUCT_UI_ARRAY_KEYS = Object.freeze([
    'enabled_langs',
]);

const DEFAULT_SECTION_TITLES = Object.freeze({
    [SECTION_KEYS.MAIN]: {
        zh: '主配置',
        en: 'Main Config',
        ru: 'Основная конфигурация',
    },
    [SECTION_KEYS.OPTIONAL]: {
        zh: '选配',
        en: 'Optional Config',
        ru: 'Опции',
    },
});

function safeNumber(value, fallback = 0) {
    const next = Number(value);
    return Number.isFinite(next) ? next : fallback;
}

function text(value, fallback = '') {
    return String(value ?? fallback).trim();
}

function looksCorrupted(value) {
    const sample = text(value);
    if (!sample) return false;
    if (sample.includes('�') || sample.includes('鈧')) return true;
    return /(锛|鏈|褋|袘|袨|€|銆?)/.test(sample);
}

export function createLocalizedText(seed = '') {
    const clean = text(seed);
    return {
        zh: clean,
        en: clean,
        ru: clean,
    };
}

export function createProductUiText(seed = {}) {
    const base = PRODUCT_UI_TEXT_KEYS.reduce((acc, key) => {
        acc[key] = createLocalizedText(seed?.[key] || '');
        return acc;
    }, {});
    base.enabled_langs = Array.isArray(seed?.enabled_langs) ? seed.enabled_langs.map((item) => text(item)).filter(Boolean) : [];
    return base;
}

export function normalizeLocalizedText(value, fallback = '') {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        const next = { ...createLocalizedText(fallback), ...value };
        SUPPORTED_LANGS.forEach((lang) => {
            next[lang] = text(next[lang], lang === 'zh' ? fallback : next.zh || fallback);
        });
        return next;
    }
    return createLocalizedText(value || fallback);
}

export function normalizeProductUiText(value = {}) {
    const base = createProductUiText();
    if (!value || typeof value !== 'object' || Array.isArray(value)) return base;
    PRODUCT_UI_TEXT_KEYS.forEach((key) => {
        base[key] = normalizeLocalizedText(value?.[key] || '', '');
    });
    PRODUCT_UI_ARRAY_KEYS.forEach((key) => {
        base[key] = Array.isArray(value?.[key]) ? value[key].map((item) => text(item)).filter(Boolean) : [];
    });
    return base;
}

export function normalizeShareConfig(value = {}, fallback = {}) {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const base = fallback && typeof fallback === 'object' && !Array.isArray(fallback) ? fallback : {};
    return {
        recipient_name: text(source.recipient_name || source.recipientName || base.recipient_name || base.recipientName),
        recipient_email: text(source.recipient_email || source.recipientEmail || base.recipient_email || base.recipientEmail),
        recipient_company: text(source.recipient_company || source.recipientCompany || base.recipient_company || base.recipientCompany),
        follow_up_notes: text(source.follow_up_notes || source.followUpNotes || base.follow_up_notes || base.followUpNotes),
        owner_name: text(source.owner_name || source.ownerName || base.owner_name || base.ownerName),
        owner_email: text(source.owner_email || source.ownerEmail || base.owner_email || base.ownerEmail),
    };
}

export function normalizeShareHistoryEntry(value = {}) {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const channels = Array.isArray(source.channels)
        ? source.channels.map((entry) => text(entry)).filter(Boolean)
        : [text(source.channel)].filter(Boolean);
    const firstSentAt = text(source.first_sent_at || source.firstSentAt || source.sent_at || source.sentAt || source.created_at || source.createdAt);
    const lastSentAt = text(source.last_sent_at || source.lastSentAt || source.sent_at || source.sentAt || source.updated_at || source.updatedAt);
    return {
        id: text(source.id),
        channel: text(source.channel || channels[channels.length - 1], 'share_link'),
        channels: Array.from(new Set(channels.length ? channels : ['share_link'])),
        status: text(source.status, 'recorded'),
        recipient_name: text(source.recipient_name || source.recipientName),
        recipient_email: text(source.recipient_email || source.recipientEmail),
        recipient_company: text(source.recipient_company || source.recipientCompany),
        owner_name: text(source.owner_name || source.ownerName),
        owner_email: text(source.owner_email || source.ownerEmail),
        follow_up_notes: text(source.follow_up_notes || source.followUpNotes),
        outcome_notes: text(source.outcome_notes || source.outcomeNotes),
        attempt_count: Math.max(1, safeNumber(source.attempt_count || source.attemptCount, 1)),
        first_sent_at: firstSentAt,
        last_sent_at: lastSentAt,
        sent_at: text(source.sent_at || source.sentAt || source.created_at || source.createdAt),
        expires_at: text(source.expires_at || source.expiresAt),
        passcode_protected: source.passcode_protected === true || source.passcodeProtected === true,
        share_target: text(source.share_target || source.shareTarget),
        sender_name: text(source.sender_name || source.senderName),
        sender_email: text(source.sender_email || source.senderEmail),
        updated_at: text(source.updated_at || source.updatedAt || lastSentAt || firstSentAt),
    };
}

export function pickLocalized(value, lang = DEFAULT_LANG, fallback = '') {
    const localized = normalizeLocalizedText(value, fallback);
    const ordered = [localized[lang], localized.en, localized.zh, localized.ru, fallback].map((entry) => text(entry));
    return ordered.find((entry) => entry && !looksCorrupted(entry)) || ordered.find(Boolean) || '';
}

export function normalizeRates(value) {
    return {
        USD: safeNumber(value?.USD, DEFAULT_RATES.USD),
        EUR: safeNumber(value?.EUR, DEFAULT_RATES.EUR),
        CAD: safeNumber(value?.CAD, DEFAULT_RATES.CAD),
        RUB: safeNumber(value?.RUB, DEFAULT_RATES.RUB),
    };
}

export function createSectionConfig() {
    return [
        {
            key: SECTION_KEYS.MAIN,
            title: { ...DEFAULT_SECTION_TITLES[SECTION_KEYS.MAIN] },
            subtotalMode: 'manual',
            subtotal: 0,
        },
        {
            key: SECTION_KEYS.OPTIONAL,
            title: { ...DEFAULT_SECTION_TITLES[SECTION_KEYS.OPTIONAL] },
            subtotalMode: 'manual',
            subtotal: 0,
        },
    ];
}

export function normalizeSectionConfig(value) {
    const base = createSectionConfig();
    if (!Array.isArray(value) || !value.length) return base;

    const byKey = new Map(
        value
            .map((entry) => ({
                key: entry?.key === SECTION_KEYS.OPTIONAL ? SECTION_KEYS.OPTIONAL : SECTION_KEYS.MAIN,
                title: normalizeLocalizedText(entry?.title, pickLocalized(DEFAULT_SECTION_TITLES[entry?.key] || DEFAULT_SECTION_TITLES[SECTION_KEYS.MAIN], 'zh')),
                subtotalMode: entry?.subtotalMode === 'sum' ? 'sum' : 'manual',
                subtotal: safeNumber(entry?.subtotal, 0),
            }))
            .map((entry) => [entry.key, entry]),
    );

    return base.map((entry) => byKey.get(entry.key) || entry);
}

export function createQuoteItem(sectionKey = SECTION_KEYS.MAIN) {
    return {
        localId: globalThis.crypto?.randomUUID?.() || `item-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        section_key: sectionKey === SECTION_KEYS.OPTIONAL ? SECTION_KEYS.OPTIONAL : SECTION_KEYS.MAIN,
        sort_order: 100,
        line_code: '',
        brand_label: '',
        qty_label: '1',
        price_rmb: 0,
        is_included: false,
        name_i18n: createLocalizedText(''),
    };
}

export function createMediaConfig(seed = {}) {
    return {
        enabled: seed?.enabled === true,
        position: seed?.position === MEDIA_POSITIONS.ABOVE ? MEDIA_POSITIONS.ABOVE : MEDIA_POSITIONS.BELOW,
        layout: seed?.layout === MEDIA_LAYOUTS.CAROUSEL ? MEDIA_LAYOUTS.CAROUSEL : MEDIA_LAYOUTS.STACK,
    };
}

export function normalizeMediaConfig(value) {
    return createMediaConfig(value || {});
}

export function createQuoteMediaItem(seed = {}) {
    return {
        localId: text(seed?.localId || seed?.id || (globalThis.crypto?.randomUUID?.() || `media-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`)),
        title: text(seed?.title),
        storage_path: text(seed?.storage_path || seed?.storagePath),
        public_url: text(seed?.public_url || seed?.publicUrl || seed?.url),
        sort_order: safeNumber(seed?.sort_order, 100),
        is_active: seed?.is_active !== false,
    };
}

export function normalizeQuoteMediaItem(value = {}) {
    const base = createQuoteMediaItem(value);
    return {
        ...base,
        localId: text(value?.localId || value?.id || base.localId),
        title: text(value?.title || value?.name),
        storage_path: text(value?.storage_path || value?.storagePath),
        public_url: text(value?.public_url || value?.publicUrl || value?.url),
        sort_order: safeNumber(value?.sort_order, base.sort_order),
        is_active: value?.is_active !== false,
    };
}

export function sortMediaItems(items = []) {
    return [...(items || [])]
        .map((item) => normalizeQuoteMediaItem(item))
        .filter((item) => item.is_active !== false && text(item.public_url))
        .sort((a, b) => {
            const orderDiff = safeNumber(a?.sort_order, 100) - safeNumber(b?.sort_order, 100);
            if (orderDiff !== 0) return orderDiff;
            return text(a?.title || a?.public_url).localeCompare(text(b?.title || b?.public_url));
        });
}

export function normalizeQuoteItem(value, fallbackSectionKey = SECTION_KEYS.MAIN) {
    const base = createQuoteItem(fallbackSectionKey);
    return {
        ...base,
        ...value,
        localId: text(value?.localId || value?.id || base.localId),
        section_key: value?.section_key === SECTION_KEYS.OPTIONAL ? SECTION_KEYS.OPTIONAL : fallbackSectionKey,
        sort_order: safeNumber(value?.sort_order, base.sort_order),
        line_code: text(value?.line_code || value?.id || ''),
        brand_label: text(value?.brand_label || value?.brand || ''),
        qty_label: text(value?.qty_label || value?.qty || '1'),
        price_rmb: safeNumber(value?.price_rmb ?? value?.price, 0),
        is_included: value?.is_included === true || safeNumber(value?.price, 0) === -1,
        name_i18n: normalizeLocalizedText(value?.name_i18n || value?.n || ''),
    };
}

export function sortItems(items = []) {
    return [...(items || [])].sort((a, b) => {
        const orderDiff = safeNumber(a?.sort_order, 100) - safeNumber(b?.sort_order, 100);
        if (orderDiff !== 0) return orderDiff;
        return text(a?.line_code).localeCompare(text(b?.line_code));
    });
}

export function groupItemsBySection(items = [], sectionConfig = createSectionConfig()) {
    const normalizedItems = sortItems(items).map((item) => normalizeQuoteItem(item, item?.section_key));
    return sectionConfig.map((section) => ({
        ...section,
        items: normalizedItems.filter((item) => item.section_key === section.key),
    }));
}

export function calculateSectionSubtotal(section, items = []) {
    if (section?.subtotalMode === 'manual') {
        return safeNumber(section?.subtotal, 0);
    }
    return sortItems(items).reduce((sum, item) => {
        const row = normalizeQuoteItem(item, section?.key);
        if (row.is_included) return sum;
        return sum + Math.max(0, safeNumber(row.price_rmb, 0));
    }, 0);
}

export function extractBrandSnapshot(value = {}) {
    return {
        slug: text(value.slug),
        brand_name: text(value.brand_name || value.brandName || value.brandShort),
        display_name: text(value.display_name || value.displayName || value.brandFull || value.brand_name),
        supplier_name: text(value.supplier_name || value.supplierName || value.display_name),
        sender_email: text(value.sender_email || value.senderEmail),
        subject_name: text(value.subject_name || value.subjectName || value.display_name),
        overview_title: normalizeLocalizedText(value.overview_title || value.title || value.overviewTitle || ''),
        footer_note: normalizeLocalizedText(value.footer_note || value.footerText || ''),
        theme_primary: text(value.theme_primary || value.themePrimary || DEFAULT_THEME_PRIMARY) || DEFAULT_THEME_PRIMARY,
        theme_dark: text(value.theme_dark || value.themeDark || DEFAULT_THEME_DARK) || DEFAULT_THEME_DARK,
        share_signing_secret: text(value.share_signing_secret || value.shareSigningSecret || DEFAULT_SHARE_SECRET) || DEFAULT_SHARE_SECRET,
        share_unlock_prefix: text(value.share_unlock_prefix || value.shareUnlockPrefix || `${text(value.slug || 'quote')}-share-unlocked`) || 'quote-share-unlocked',
    };
}

export function extractProductSnapshot(value = {}) {
    return {
        slug: text(value.slug),
        product_code: text(value.product_code || value.productCode || value.slug),
        public_title: normalizeLocalizedText(value.public_title || value.title || value.publicTitle || ''),
        default_lang: SUPPORTED_LANGS.includes(text(value.default_lang || value.defaultLang)) ? text(value.default_lang || value.defaultLang) : DEFAULT_LANG,
        validity_hours: Math.max(1, safeNumber(value.validity_hours || value.validityHours, 72)),
        default_rates: normalizeRates(value.default_rates || value.defaultRates || DEFAULT_RATES),
        section_config: normalizeSectionConfig(value.section_config || value.sectionConfig),
        ui_text: normalizeProductUiText(value.ui_text || value.uiText),
        media_config: normalizeMediaConfig(value.media_config || value.mediaConfig),
        media_gallery: sortMediaItems(value.media_gallery || value.mediaGallery || []),
    };
}

export function buildQuoteSnapshot({ brand, product, instance, items = [], publishedAt = '', mode = 'published' } = {}) {
    const brandSnapshot = extractBrandSnapshot({
        ...(brand || {}),
        ...(instance?.brand_snapshot || {}),
    });
    const productSnapshot = extractProductSnapshot({
        ...(product || {}),
        ...(instance?.product_snapshot || {}),
    });
    const sectionConfig = normalizeSectionConfig(instance?.section_config || productSnapshot.section_config);
    const groupedSections = groupItemsBySection(items, sectionConfig).map((section) => ({
        key: section.key,
        title: normalizeLocalizedText(section.title, pickLocalized(DEFAULT_SECTION_TITLES[section.key], 'zh')),
        subtotalMode: section.subtotalMode === 'sum' ? 'sum' : 'manual',
        subtotal: calculateSectionSubtotal(section, section.items),
        items: sortItems(section.items).map((item) => {
            const normalized = normalizeQuoteItem(item, section.key);
            return {
                lineCode: normalized.line_code,
                brandLabel: normalized.brand_label,
                qtyLabel: normalized.qty_label,
                priceRmb: normalized.price_rmb,
                isIncluded: normalized.is_included === true,
                nameI18n: normalizeLocalizedText(normalized.name_i18n),
                sortOrder: normalized.sort_order,
            };
        }),
    }));

    return {
        mode,
        brand: brandSnapshot,
        product: {
            ...productSnapshot,
            sections: groupedSections,
        },
        quote: {
            id: text(instance?.id),
            publicSlug: text(instance?.public_slug || instance?.publicSlug),
            status: text(instance?.status || mode),
            customerId: text(instance?.customer_id || instance?.customerId),
            customerName: text(instance?.customer_name || instance?.customerName),
            receiverName: text(instance?.receiver_name || instance?.receiverName),
            receiverEmail: text(instance?.receiver_email || instance?.receiverEmail),
            customerProfile:
                instance?.customer_snapshot && typeof instance.customer_snapshot === 'object'
                    ? { ...instance.customer_snapshot }
                    : {},
            defaultLang: SUPPORTED_LANGS.includes(text(instance?.default_lang || instance?.defaultLang))
                ? text(instance?.default_lang || instance?.defaultLang)
                : productSnapshot.default_lang,
            validityHours: Math.max(1, safeNumber(instance?.validity_hours || instance?.validityHours, productSnapshot.validity_hours)),
            rates: normalizeRates(instance?.draft_rates || instance?.rates || productSnapshot.default_rates),
            publishedAt: text(publishedAt || instance?.published_at || instance?.publishedAt),
            updatedAt: text(instance?.updated_at || instance?.updatedAt),
            shareConfig: normalizeShareConfig(instance?.share_config || instance?.shareConfig, {
                recipient_name: instance?.receiver_name || instance?.receiverName,
                recipient_email: instance?.receiver_email || instance?.receiverEmail,
                recipient_company: instance?.customer_name || instance?.customerName,
            }),
        },
    };
}

function getByPath(root, path) {
    return String(path || '')
        .split('.')
        .filter(Boolean)
        .reduce((cursor, segment) => (cursor == null ? undefined : cursor[segment]), root);
}

function normalizeLegacySections(rawItems = []) {
    const items = Array.isArray(rawItems) ? rawItems : [];
    const sections = [];
    let sectionIndex = 0;
    let currentSection = {
        key: SECTION_KEYS.MAIN,
        title: { ...DEFAULT_SECTION_TITLES[SECTION_KEYS.MAIN] },
        subtotalMode: 'sum',
        subtotal: 0,
        items: [],
    };

    items.forEach((entry, index) => {
        if (entry?.isHeader) {
            if (currentSection.items.length || sectionIndex > 0) sections.push(currentSection);
            currentSection = {
                key: sectionIndex === 0 ? SECTION_KEYS.MAIN : SECTION_KEYS.OPTIONAL,
                title: normalizeLocalizedText(entry?.n, pickLocalized(DEFAULT_SECTION_TITLES[sectionIndex === 0 ? SECTION_KEYS.MAIN : SECTION_KEYS.OPTIONAL], 'zh')),
                subtotalMode: 'manual',
                subtotal: safeNumber(entry?.price, 0),
                items: [],
            };
            sectionIndex += 1;
            return;
        }

        const normalized = normalizeQuoteItem(
            {
                line_code: entry?.id || `${index + 1}`,
                brand_label: entry?.brand,
                qty_label: entry?.qty,
                price_rmb: entry?.price,
                is_included: safeNumber(entry?.price, 0) === -1,
                name_i18n: entry?.n,
                sort_order: (index + 1) * 10,
            },
            currentSection.key,
        );
        currentSection.items.push(normalized);
    });

    if (currentSection.items.length || !sections.length) sections.push(currentSection);
    return sections;
}

export function normalizeLegacyProduct(page = {}, mapping = {}, index = 0) {
    const title = getByPath(page.rawData, mapping.titlePath);
    const rawItems = getByPath(page.rawData, mapping.itemsPath) || [];
    const sections = normalizeLegacySections(rawItems);
    const productRow = {
        slug: text(mapping.id || `legacy-product-${index + 1}`),
        product_code: text(mapping.id || `legacy-product-${index + 1}`),
        public_title: normalizeLocalizedText(title, mapping.id || `Product ${index + 1}`),
        default_lang: DEFAULT_LANG,
        validity_hours: 72,
        default_rates: normalizeRates(page.rates || DEFAULT_RATES),
        section_config: sections.map((section) => ({
            key: section.key,
            title: section.title,
            subtotalMode: section.subtotalMode,
            subtotal: section.subtotal,
        })),
        sort_order: (index + 1) * 10,
        is_active: true,
    };

    const itemRows = sections.flatMap((section, sectionIndex) =>
        section.items.map((item, itemIndex) => ({
            ...item,
            section_key: section.key,
            sort_order: sectionIndex * 1000 + (itemIndex + 1) * 10,
        })),
    );

    return {
        product: productRow,
        items: itemRows,
    };
}

export function convertLegacyPagesToSeedPayloads(pages = {}) {
    return Object.entries(pages || {}).map(([pageKey, page]) => {
        const brand = extractBrandSnapshot({
            slug: pageKey,
            brand_name: page?.company?.brandShort || pageKey.toUpperCase(),
            display_name: page?.company?.brandFull || page?.company?.brandShort || pageKey,
            supplier_name: page?.company?.supplierName || page?.company?.brandFull || pageKey,
            sender_email: page?.company?.senderEmail || '',
            subject_name: page?.company?.subjectName || page?.company?.brandFull || pageKey,
            overview_title: page?.title || '',
            footer_note: page?.footerText || '',
            theme_primary: DEFAULT_THEME_PRIMARY,
            theme_dark: DEFAULT_THEME_DARK,
            share_signing_secret: page?.share?.signingSecret || DEFAULT_SHARE_SECRET,
            share_unlock_prefix: page?.share?.unlockPrefix || `${pageKey}-share-unlocked`,
        });

        const products = (page?.productMappings || []).map((mapping, index) => {
            const normalized = normalizeLegacyProduct(page, mapping, index);
            const demoInstance = {
                public_slug: `${pageKey}-${normalized.product.slug}-demo`,
                status: 'published',
                customer_name: `${brand.display_name} Demo`,
                receiver_name: '',
                receiver_email: '',
                default_lang: normalized.product.default_lang,
                validity_hours: normalized.product.validity_hours,
                draft_rates: normalized.product.default_rates,
                brand_snapshot: brand,
                product_snapshot: extractProductSnapshot(normalized.product),
                section_config: normalized.product.section_config,
            };

            return {
                ...normalized,
                demoInstance,
            };
        });

        return {
            brand: {
                ...brand,
                default_quote_slug: products[0]?.demoInstance?.public_slug || null,
                is_active: true,
            },
            products,
        };
    });
}

export function buildLegacyFallbackSnapshot(pages = {}, brandKey = '', productId = '') {
    const page = pages?.[brandKey];
    if (!page) return null;

    const normalizedProducts = (page.productMappings || []).map((mapping, index) => normalizeLegacyProduct(page, mapping, index));
    const product = normalizedProducts.find((entry) => entry.product.slug === productId) || normalizedProducts[0];
    if (!product) return null;

    return buildQuoteSnapshot({
        brand: extractBrandSnapshot({
            slug: brandKey,
            brand_name: page?.company?.brandShort || brandKey.toUpperCase(),
            display_name: page?.company?.brandFull || page?.company?.brandShort || brandKey,
            supplier_name: page?.company?.supplierName || page?.company?.brandFull || brandKey,
            sender_email: page?.company?.senderEmail || '',
            subject_name: page?.company?.subjectName || page?.company?.brandFull || brandKey,
            overview_title: page?.title || '',
            footer_note: page?.footerText || '',
            theme_primary: DEFAULT_THEME_PRIMARY,
            theme_dark: DEFAULT_THEME_DARK,
            share_signing_secret: page?.share?.signingSecret || DEFAULT_SHARE_SECRET,
            share_unlock_prefix: page?.share?.unlockPrefix || `${brandKey}-share-unlocked`,
        }),
        product: product.product,
        instance: {
            public_slug: `${brandKey}-${product.product.slug}-legacy`,
            status: 'published',
            default_lang: product.product.default_lang,
            validity_hours: product.product.validity_hours,
            draft_rates: product.product.default_rates,
            brand_snapshot: {},
            product_snapshot: extractProductSnapshot(product.product),
            section_config: product.product.section_config,
        },
        items: product.items,
        mode: 'legacy',
    });
}

let legacyPagesPromise = null;

export function ensureLegacyQuotePagesLoaded(scriptSrc = '/shared/quote-system/quote-pages.js') {
    if (typeof window === 'undefined' || typeof document === 'undefined') return Promise.resolve({});
    if (window.GASGX_QUOTE_PAGES && typeof window.GASGX_QUOTE_PAGES === 'object') {
        return Promise.resolve(window.GASGX_QUOTE_PAGES);
    }
    if (legacyPagesPromise) return legacyPagesPromise;

    legacyPagesPromise = new Promise((resolve) => {
        const existing = document.querySelector('script[data-quote-legacy-pages="1"]');
        const done = () => resolve(window.GASGX_QUOTE_PAGES || {});
        const fail = () => resolve({});

        if (existing) {
            existing.addEventListener('load', done, { once: true });
            existing.addEventListener('error', fail, { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = scriptSrc;
        script.async = true;
        script.dataset.quoteLegacyPages = '1';
        script.addEventListener('load', done, { once: true });
        script.addEventListener('error', fail, { once: true });
        document.head.appendChild(script);
    });

    return legacyPagesPromise;
}

export function createPublicSlug(brandSlug, productSlug) {
    const left = text(brandSlug || 'quote')
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const right = text(productSlug || 'item')
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const suffix = Math.random().toString(36).slice(2, 8);
    return `${left || 'quote'}-${right || 'item'}-${suffix}`;
}
