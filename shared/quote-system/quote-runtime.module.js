import {
    DEFAULT_LANG,
    DEFAULT_RATES,
    DEFAULT_SHARE_SECRET,
    MEDIA_LAYOUTS,
    MEDIA_POSITIONS,
    SUPPORTED_LANGS,
    buildLegacyFallbackSnapshot,
    buildQuoteSnapshot,
    ensureLegacyQuotePagesLoaded,
    normalizeMediaConfig,
    normalizeRates,
    normalizeShareConfig,
    normalizeShareHistoryEntry,
    sortMediaItems,
} from './quote-data.module.js?v=20260323quote12';

const SUPABASE_URL = window.AMS_SUPABASE_URL || 'https://mkpcliytqudclkwtewru.supabase.co';
const SUPABASE_KEY = window.AMS_SUPABASE_KEY || 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';
const ADMIN_EMAILS = ['cuitengwei@gasgx.com'];
const RATE_API_URL = 'https://open.er-api.com/v6/latest/CNY';
const TABLE_INSTANCES = 'quote_instances';
const TABLE_INSTANCE_EVENTS = 'quote_instance_events';
const TABLE_INSTANCE_SENDS = 'quote_instance_sends';
const TABLE_CUSTOMER_ACTIVITIES = 'quote_customer_activities';

const dict = {
    zh: {
        supplier: '供应商：',
        sender: '发件人：',
        receiver: '收件人：',
        validity: '报价有效期：',
        update: 'SYS_TIME_SYNC',
        included: '包含',
        mainConfig: '主配置',
        optionalConfig: '选配',
        systemTotal: '系统预估总价 / EST. SYSTEM TOTAL',
        headers: ['SEQ', '模块描述 (DESCRIPTION)', '规格 (BRAND)', 'QTY', 'RMB (¥)', 'USD ($)', 'EUR (€)', 'CAD (C$)', 'RUB (₽)'],
        ratesOnline: '全球实时汇率在线',
        ratesRefreshing: '正在刷新...',
        ratesFallback: '汇率获取失败，使用本地快照',
        refresh: '刷新汇率',
        send: '发送',
        share: '分享/导出',
        shareLink: '创建分享链接',
        exportImage: '生成长图',
        exportPdf: '导出 PDF',
        shareTitle: '创建分享链接',
        shareDesc: '设置链接有效期和提取码后生成客户访问链接。管理员登录状态下始终可打开页面。',
        shareExpiryLabel: '链接有效期',
        shareExpiry1d: '1天后过期',
        shareExpiry3d: '3天后过期',
        shareExpiry7d: '7天后过期',
        shareExpiryNever: '永不过期',
        shareExpiryCustom: '自定义时间',
        shareCustomLabel: '自定义到期时间',
        shareCustomPicker: '选择时间',
        shareAdminHint: '后台管理员登录状态不受分享时间限制。',
        sharePasscodeLabel: '提取码',
        sharePasscodePlaceholder: '自动生成',
        shareLinkLabel: '分享链接',
        shareLinkPlaceholder: '点击下方按钮生成分享链接',
        shareGenerate: '生成并复制链接',
        shareClose: '关闭',
        sharePreviewDefault: '默认生成 3 天有效链接。',
        sharePreviewAdmin: '管理员登录后仍可直接打开，不受外链过期限制。',
        shareCopySuccess: '链接已复制到剪贴板',
        shareCopyFallback: '已生成链接，请手动复制。',
        shareAdminOnly: '只有后台管理员登录后才可以创建分享链接。',
        shareCustomRequired: '请先选择一个有效的自定义到期时间。',
        shareCustomExpired: '自定义到期时间必须晚于当前时间。',
        shareUnavailable: '当前页面没有可分享的已发布报价。',
        shareGenerateError: '分享链接生成失败，请稍后重试。',
        accessBadge: '受控访问',
        accessCheckingTitle: '正在验证访问权限...',
        accessCheckingMessage: '正在检查分享链接和管理员会话，请稍候。',
        accessInvalid: '分享链接无效或已损坏，请重新生成。',
        accessExpired: '分享链接已过期，请联系管理员重新生成。',
        accessPasscodeTitle: '请输入提取码',
        accessPasscodeMessage: '当前分享链接已开启提取码保护，请输入 4 位提取码继续访问。',
        accessPasscodeLabel: '请输入提取码',
        accessPasscodeSubmit: '验证并打开',
        accessPasscodeError: '提取码不正确，请重试。',
        accessDeniedTitle: '无法访问预览页',
        accessDeniedMessage: '草稿预览仅限后台管理员登录后查看。',
        accessRefresh: '重新检测',
        notFoundTitle: '未找到报价单',
        notFoundMessage: '当前链接没有对应的已发布报价数据。',
        loading: '处理中...',
        exportLoading: '正在生成高清文档...',
        exportSubText: '正在进行高清文档渲染，请稍候。',
        receiverPlaceholder: '请输入客户邮箱',
        days: '天',
        hours: '时',
        minutes: '分',
        seconds: '秒',
        galleryTitle: '产品展示图片',
        galleryPrev: '上一张',
        galleryNext: '下一张',
        galleryModeCarousel: '轮播图',
        galleryModeStack: '纵向铺图',
        shareMetaMode: '访问模式：分享链接',
        shareMetaAdmin: '访问模式：管理员预览',
        shareMetaExpired: '链接到期：',
        shareMetaNever: '永不过期',
        unknownBrand: '报价系统',
        mailSubjectPrefix: '[SYS_DATA]',
        noEmail: '请先维护客户邮箱。',
    },
    en: {
        supplier: 'SUPPLIER:',
        sender: 'SENDER:',
        receiver: 'RECEIVER:',
        validity: 'VALIDITY:',
        update: 'SYS_TIME_SYNC',
        included: 'Included',
        mainConfig: 'Main Config',
        optionalConfig: 'Optional Config',
        systemTotal: 'EST. SYSTEM TOTAL',
        headers: ['SEQ', 'DESCRIPTION', 'BRAND', 'QTY', 'RMB (¥)', 'USD ($)', 'EUR (€)', 'CAD (C$)', 'RUB (₽)'],
        ratesOnline: 'GLOBAL LIVE RATES',
        ratesRefreshing: 'Refreshing...',
        ratesFallback: 'Rate fetch failed, using saved snapshot',
        refresh: 'REFRESH',
        send: 'Send',
        share: 'Share/Export',
        shareLink: 'Create Share Link',
        exportImage: 'Export Image',
        exportPdf: 'Export PDF',
        shareTitle: 'Create Share Link',
        shareDesc: 'Generate a customer link with expiry and passcode. Signed-in admins can always open this page.',
        shareExpiryLabel: 'Link expiry',
        shareExpiry1d: 'Expire in 1 day',
        shareExpiry3d: 'Expire in 3 days',
        shareExpiry7d: 'Expire in 7 days',
        shareExpiryNever: 'Never expire',
        shareExpiryCustom: 'Custom time',
        shareCustomLabel: 'Custom expiration time',
        shareCustomPicker: 'Pick time',
        shareAdminHint: 'Admin sessions from the site backend always bypass link expiry.',
        sharePasscodeLabel: 'Passcode',
        sharePasscodePlaceholder: 'Generated automatically',
        shareLinkLabel: 'Share link',
        shareLinkPlaceholder: 'Generate a share link below',
        shareGenerate: 'Generate & Copy Link',
        shareClose: 'Close',
        sharePreviewDefault: 'The default output is a 3-day share link.',
        sharePreviewAdmin: 'Signed-in admins can still open the page after link expiry.',
        shareCopySuccess: 'Link copied to clipboard',
        shareCopyFallback: 'Link generated. Copy it manually.',
        shareAdminOnly: 'Only signed-in site admins can create share links.',
        shareCustomRequired: 'Choose a valid custom expiration time first.',
        shareCustomExpired: 'The custom expiration time must be later than now.',
        shareUnavailable: 'This page does not have a published quote target yet.',
        shareGenerateError: 'Failed to generate the share link. Try again later.',
        accessBadge: 'Protected Access',
        accessCheckingTitle: 'Checking access...',
        accessCheckingMessage: 'Verifying share token and admin session. Please wait.',
        accessInvalid: 'The share link is invalid or corrupted. Generate a new one.',
        accessExpired: 'This share link has expired.',
        accessPasscodeTitle: 'Passcode required',
        accessPasscodeMessage: 'This share link is protected by a passcode. Enter the 4-character code to continue.',
        accessPasscodeLabel: 'Passcode',
        accessPasscodeSubmit: 'Unlock',
        accessPasscodeError: 'Incorrect passcode. Try again.',
        accessDeniedTitle: 'Preview unavailable',
        accessDeniedMessage: 'Draft previews are only available to signed-in admins.',
        accessRefresh: 'Check Again',
        notFoundTitle: 'Quote not found',
        notFoundMessage: 'No published quote data is available for this link.',
        loading: 'Loading...',
        exportLoading: 'GENERATING DOCUMENT...',
        exportSubText: 'Rendering a high-resolution document. Please wait.',
        receiverPlaceholder: 'Enter customer email',
        days: 'd',
        hours: 'h',
        minutes: 'm',
        seconds: 's',
        galleryTitle: 'Product Gallery',
        galleryPrev: 'Previous',
        galleryNext: 'Next',
        galleryModeCarousel: 'Carousel',
        galleryModeStack: 'Gallery',
        shareMetaMode: 'Mode: share-link',
        shareMetaAdmin: 'Mode: admin-preview',
        shareMetaExpired: 'Expires at: ',
        shareMetaNever: 'Never expires',
        unknownBrand: 'Quote System',
        mailSubjectPrefix: '[SYS_DATA]',
        noEmail: 'Set a customer email first.',
    },
    ru: {
        supplier: 'ПОСТАВЩИК:',
        sender: 'ОТПРАВИТЕЛЬ:',
        receiver: 'ПОЛУЧАТЕЛЬ:',
        validity: 'СРОК ДЕЙСТВИЯ:',
        update: 'SYS_TIME_SYNC',
        included: 'Вкл.',
        mainConfig: 'Основная конфигурация',
        optionalConfig: 'Опции',
        systemTotal: 'ОЦЕНОЧНАЯ СТОИМОСТЬ СИСТЕМЫ',
        headers: ['№', 'ОПИСАНИЕ', 'БРЕНД', 'КОЛ', 'RMB (¥)', 'USD ($)', 'EUR (€)', 'CAD (C$)', 'RUB (₽)'],
        ratesOnline: 'ГЛОБАЛЬНЫЕ КУРСЫ ОНЛАЙН',
        ratesRefreshing: 'Обновление...',
        ratesFallback: 'Не удалось получить курс, используем сохраненный снимок',
        refresh: 'ОБНОВИТЬ',
        send: 'Отправить',
        share: 'Поделиться/Экспорт',
        shareLink: 'Создать ссылку',
        exportImage: 'Экспорт изображения',
        exportPdf: 'Экспорт PDF',
        shareTitle: 'Создать ссылку',
        shareDesc: 'Сформируйте клиентскую ссылку с ограничением по времени и кодом доступа. Администратор может открыть страницу в любой момент.',
        shareExpiryLabel: 'Срок действия ссылки',
        shareExpiry1d: 'Истекает через 1 день',
        shareExpiry3d: 'Истекает через 3 дня',
        shareExpiry7d: 'Истекает через 7 дней',
        shareExpiryNever: 'Без срока',
        shareExpiryCustom: 'Своя дата',
        shareCustomLabel: 'Своя дата истечения',
        shareCustomPicker: 'Выбрать',
        shareAdminHint: 'Сессия администратора сайта не ограничивается сроком действия ссылки.',
        sharePasscodeLabel: 'Код доступа',
        sharePasscodePlaceholder: 'Генерируется автоматически',
        shareLinkLabel: 'Ссылка',
        shareLinkPlaceholder: 'Сначала создайте ссылку',
        shareGenerate: 'Создать и скопировать',
        shareClose: 'Закрыть',
        sharePreviewDefault: 'По умолчанию создается ссылка на 3 дня.',
        sharePreviewAdmin: 'Администратор может открыть страницу и после окончания срока.',
        shareCopySuccess: 'Ссылка скопирована',
        shareCopyFallback: 'Ссылка создана. Скопируйте ее вручную.',
        shareAdminOnly: 'Создавать ссылки может только вошедший администратор сайта.',
        shareCustomRequired: 'Сначала выберите корректное время истечения.',
        shareCustomExpired: 'Время истечения должно быть позже текущего времени.',
        shareUnavailable: 'Для этой страницы пока нет опубликованной ссылки.',
        shareGenerateError: 'Не удалось создать ссылку. Повторите попытку позже.',
        accessBadge: 'Защищенный доступ',
        accessCheckingTitle: 'Проверка доступа...',
        accessCheckingMessage: 'Проверяем ссылку и сессию администратора. Подождите.',
        accessInvalid: 'Ссылка повреждена или недействительна.',
        accessExpired: 'Срок действия ссылки истек.',
        accessPasscodeTitle: 'Требуется код доступа',
        accessPasscodeMessage: 'Для этой ссылки включен код доступа. Введите 4-символьный код, чтобы продолжить.',
        accessPasscodeLabel: 'Код доступа',
        accessPasscodeSubmit: 'Открыть',
        accessPasscodeError: 'Неверный код доступа.',
        accessDeniedTitle: 'Нет доступа к предпросмотру',
        accessDeniedMessage: 'Черновой предпросмотр доступен только администратору.',
        accessRefresh: 'Проверить снова',
        notFoundTitle: 'Предложение не найдено',
        notFoundMessage: 'Для этой ссылки нет опубликованных данных.',
        loading: 'Загрузка...',
        exportLoading: 'СОЗДАНИЕ ДОКУМЕНТА...',
        exportSubText: 'Идет рендеринг документа высокого качества.',
        receiverPlaceholder: 'Введите email клиента',
        days: 'д',
        hours: 'ч',
        minutes: 'м',
        seconds: 'с',
        galleryTitle: 'Галерея продукта',
        galleryPrev: 'Назад',
        galleryNext: 'Далее',
        galleryModeCarousel: 'Карусель',
        galleryModeStack: 'Лента',
        shareMetaMode: 'Режим: share-link',
        shareMetaAdmin: 'Режим: admin-preview',
        shareMetaExpired: 'Истекает: ',
        shareMetaNever: 'Без срока',
        unknownBrand: 'Quote System',
        mailSubjectPrefix: '[SYS_DATA]',
        noEmail: 'Сначала укажите email клиента.',
    },
};

const supplementalDict = {
    zh: {
        authLogin: '登录',
        authAccount: '账号',
        authModalTitle: '需要登录',
        authModalMessage: '登录后才能继续使用报价页的受限操作。',
        authModalHint: '当前浏览不会中断，登录完成后会自动回到这个报价页。',
        authModalLogin: '立即登录',
        authModalCancel: '继续浏览',
        authProtectedAction: '受限功能',
        authActionShare: '分享与导出',
        authActionSend: '邮件发送',
        authActionImage: '图片导出',
        authActionPdf: 'PDF 导出',
        authActionLink: '分享链接',
        tableSwipeHint: '手机端可左右滑动表格查看完整报价明细',
    },
    en: {
        authLogin: 'Login',
        authAccount: 'Account',
        authModalTitle: 'Login required',
        authModalMessage: 'Sign in to keep using protected quote actions.',
        authModalHint: 'Browsing stays open. After sign-in, you will return to this quote automatically.',
        authModalLogin: 'Login now',
        authModalCancel: 'Continue browsing',
        authProtectedAction: 'Protected action',
        authActionShare: 'Share / Export',
        authActionSend: 'Send email',
        authActionImage: 'Export image',
        authActionPdf: 'Export PDF',
        authActionLink: 'Create share link',
        tableSwipeHint: 'Swipe sideways on mobile to review the full pricing table',
    },
    ru: {
        authLogin: 'Login',
        authAccount: 'Account',
        authModalTitle: 'Login required',
        authModalMessage: 'Sign in to keep using protected quote actions.',
        authModalHint: 'Browsing stays open. After sign-in, you will return to this quote automatically.',
        authModalLogin: 'Login now',
        authModalCancel: 'Continue browsing',
        authProtectedAction: 'Protected action',
        authActionShare: 'Share / Export',
        authActionSend: 'Send email',
        authActionImage: 'Export image',
        authActionPdf: 'Export PDF',
        authActionLink: 'Create share link',
        tableSwipeHint: 'Swipe sideways on mobile to review the full pricing table',
    },
};

SUPPORTED_LANGS.forEach((lang) => {
    dict[lang] = Object.assign({}, dict[lang] || {}, supplementalDict[lang] || {});
});

const params = new URLSearchParams(window.location.search);

const state = {
    snapshot: null,
    currentLang: DEFAULT_LANG,
    rates: { ...DEFAULT_RATES },
    rateStatusMode: 'online',
    rateDetail: { message: '', tone: 'muted' },
    isLoggedIn: false,
    isAdmin: false,
    adminUser: null,
    route: null,
    sharePayload: null,
    shareTarget: null,
    pendingSharedAccess: null,
    isMobileMenuOpen: false,
    clockTimer: null,
    galleryIndex: 0,
    publicConfirmation: {
        loading: false,
        payload: null,
        error: '',
        submitting: false,
        submitted: false,
        confirmed: false,
        note: '',
        result: null,
    },
    quoteBehavior: {
        visitCount: 0,
        visitType: 'first',
        sectionObserver: null,
        sectionSeenMap: {},
        sectionDwellMap: {},
        activeSectionKey: '',
        activeSectionStartedAt: 0,
        activitySentMap: {},
    },
};

function localeCopy(options = {}) {
    return options[state.currentLang] || options.en || options.zh || '';
}

function byId(id) {
    return document.getElementById(id);
}

function publicConfirmationParams() {
    return {
        stage: text(params.get('confirm_stage')),
        token: text(params.get('confirm_token')),
    };
}

function hasEmbeddedQuoteConfirmation() {
    const next = publicConfirmationParams();
    return Boolean(next.stage && next.token);
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

function currentShareConfig() {
    return normalizeShareConfig(state.snapshot?.quote?.shareConfig, {
        recipient_name: state.snapshot?.quote?.receiverName || state.snapshot?.quote?.receiver_name,
        recipient_email: state.snapshot?.quote?.receiverEmail || state.snapshot?.quote?.receiver_email,
        recipient_company: state.snapshot?.quote?.customerName || state.snapshot?.quote?.customer_name,
    });
}

function shareMetadata(config = currentShareConfig()) {
    const normalized = normalizeShareConfig(config);
    return {
        recipientName: normalized.recipient_name,
        recipientEmail: normalized.recipient_email,
        recipientCompany: normalized.recipient_company,
        followUpNotes: normalized.follow_up_notes,
        ownerName: normalized.owner_name,
        ownerEmail: normalized.owner_email,
    };
}

function isMobileViewport() {
    return window.matchMedia('(max-width: 767px)').matches;
}

const AUTH_ACTIONS = Object.freeze({
    share: { icon: 'fa-share-nodes', labelKey: 'authActionShare' },
    send: { icon: 'fa-paper-plane', labelKey: 'authActionSend' },
    image: { icon: 'fa-image', labelKey: 'authActionImage' },
    pdf: { icon: 'fa-file-pdf', labelKey: 'authActionPdf' },
    link: { icon: 'fa-link', labelKey: 'authActionLink' },
});

function getAuthConfig() {
    const helper = window.GasGxMainAuthShared;
    if (helper?.resolveConfig) {
        return helper.resolveConfig(window.GASGX_SITE_SHELL_CONFIG?.site?.mainAuth);
    }
    return {
        signInUrl: '/account/user.html',
        accountUrl: '/account/account.html',
        returnUrlStorageKey: 'gx_main_return_url',
    };
}

function currentReturnUrl() {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function persistReturnUrl() {
    const config = getAuthConfig();
    try {
        window.sessionStorage.setItem(config.returnUrlStorageKey, currentReturnUrl());
    } catch (_error) {
        return null;
    }
    return config.returnUrlStorageKey;
}

function redirectToSignIn() {
    const config = getAuthConfig();
    persistReturnUrl();
    window.location.href = config.signInUrl;
}

function userDisplayName(user) {
    const metadata = user?.user_metadata && typeof user.user_metadata === 'object' ? user.user_metadata : {};
    const candidate = text(
        metadata.full_name ||
            metadata.name ||
            metadata.user_name ||
            metadata.preferred_username ||
            metadata.email ||
            user?.email,
    );
    if (!candidate) return '';
    return candidate.length > 18 ? `${candidate.slice(0, 17)}…` : candidate;
}

function authActionMeta(actionKey = 'share') {
    return AUTH_ACTIONS[actionKey] || AUTH_ACTIONS.share;
}

function openAuthModal(actionKey = 'share') {
    const modal = byId('auth-modal');
    if (!modal) return;
    const action = authActionMeta(actionKey);
    byId('auth-modal-kicker').textContent = t('authProtectedAction');
    byId('auth-modal-title').textContent = t('authModalTitle');
    byId('auth-modal-message').textContent = t('authModalMessage');
    byId('auth-modal-hint').textContent = t('authModalHint');
    byId('auth-modal-action').textContent = t(action.labelKey);
    const icon = byId('auth-modal-icon');
    if (icon) icon.className = `fa-solid ${action.icon}`;
    byId('auth-modal-login-text').textContent = t('authModalLogin');
    byId('auth-modal-cancel-text').textContent = t('authModalCancel');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeAuthModal() {
    const modal = byId('auth-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
}

function requireSignedIn(actionKey = 'share') {
    if (state.isLoggedIn) return true;
    closeShareMenu();
    openAuthModal(actionKey);
    return false;
}

function t(key) {
    return dict[state.currentLang]?.[key] || dict.en[key] || key;
}

function uiText(key, fallbackKey = key, fallback = '') {
    const value = pickDisplayText(state.snapshot?.product?.ui_text?.[key], '');
    return value || t(fallbackKey) || fallback || '';
}

function looksCorrupted(value) {
    const sample = text(value);
    if (!sample) return false;
    if (sample.includes('�') || sample.includes('鈧')) return true;
    return /(锛|鏈|褋|袘|袨|€|銆?)/.test(sample);
}

function pickDisplayText(value, fallback = '') {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        const requested = text(value[state.currentLang]);
        const english = text(value.en);
        const chinese = text(value.zh);
        const russian = text(value.ru);
        const ordered = [requested, english, chinese, russian, text(fallback)];
        return ordered.find((entry) => entry && !looksCorrupted(entry)) || ordered.find(Boolean) || text(fallback);
    }
    const raw = text(value, fallback);
    return looksCorrupted(raw) ? text(fallback) || raw : raw;
}

function safeNumber(value, fallback = 0) {
    const next = Number(value);
    return Number.isFinite(next) ? next : fallback;
}

function quoteBehaviorSectionLabel(sectionKey = '') {
    const key = text(sectionKey);
    if (key === 'overview') return state.currentLang === 'zh' ? '报价总览' : key;
    if (key === 'pricing') return state.currentLang === 'zh' ? '价格明细' : key;
    if (key === 'media') return state.currentLang === 'zh' ? '产品图片' : key;
    if (key === 'confirmation') return state.currentLang === 'zh' ? '报价确认区' : key;
    return key || 'quote';
}

function quoteBehaviorAccessMode() {
    if (state.route?.type === 'share') return 'share';
    if (state.route?.type === 'preview') return 'preview';
    return state.isAdmin ? 'admin' : 'quote';
}

function quoteBehaviorStorageKey() {
    const instanceId = text(state.snapshot?.quote?.id || state.snapshot?.quote?.publicSlug || state.route?.quoteSlug || state.route?.token || state.route?.brand);
    const accessMode = quoteBehaviorAccessMode();
    if (!instanceId) return '';
    return `gasgx.quote.visit:${instanceId}:${accessMode}`;
}

function resetQuoteBehaviorTracking() {
    state.quoteBehavior.sectionObserver?.disconnect?.();
    state.quoteBehavior = {
        visitCount: 0,
        visitType: 'first',
        sectionObserver: null,
        sectionSeenMap: {},
        sectionDwellMap: {},
        activeSectionKey: '',
        activeSectionStartedAt: 0,
        activitySentMap: {},
    };
}

function prepareQuoteBehaviorTracking() {
    resetQuoteBehaviorTracking();
    if (state.isAdmin) return;
    const storageKey = quoteBehaviorStorageKey();
    let nextCount = 1;
    if (storageKey) {
        try {
            nextCount = safeNumber(window.localStorage.getItem(storageKey), 0) + 1;
            window.localStorage.setItem(storageKey, String(nextCount));
        } catch (_error) {
            nextCount = 1;
        }
    }
    state.quoteBehavior.visitCount = Math.max(1, nextCount);
    state.quoteBehavior.visitType = nextCount > 1 ? 'return' : 'first';
}

function formatMoney(value) {
    return Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatCurrency(code, amount) {
    if (code === 'RMB') return `¥${formatMoney(amount)}`;
    if (code === 'USD') return `$${formatMoney(amount)}`;
    if (code === 'EUR') return `€${formatMoney(amount)}`;
    if (code === 'CAD') return `C$${formatMoney(amount)}`;
    return `₽${formatMoney(amount)}`;
}

function getSectionLabel(section) {
    const explicit = pickDisplayText(section?.title, '');
    if (explicit) return explicit;
    return section?.key === 'optional_config' ? t('optionalConfig') : t('mainConfig');
}

function sectionSubtotal(section) {
    return safeNumber(section?.subtotal, 0);
}

function quoteTotal(snapshot) {
    return (snapshot?.product?.sections || []).reduce((sum, section) => sum + sectionSubtotal(section), 0);
}

function hexToRgba(hex, alpha = 1) {
    const source = text(hex).replace('#', '');
    const normalized = source.length === 3
        ? source
              .split('')
              .map((char) => `${char}${char}`)
              .join('')
        : source;
    const parsed = Number.parseInt(normalized, 16);
    if (!Number.isFinite(parsed)) return `rgba(93, 214, 44, ${alpha})`;
    const r = (parsed >> 16) & 255;
    const g = (parsed >> 8) & 255;
    const b = parsed & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applyTheme(brand = {}) {
    const primary = text(brand.theme_primary, '#5DD62C') || '#5DD62C';
    const dark = text(brand.theme_dark, '#337418') || '#337418';
    document.documentElement.style.setProperty('--gas-green-primary', primary);
    document.documentElement.style.setProperty('--gas-green-light', primary);
    document.documentElement.style.setProperty('--gas-green-bg-solid', dark);
    document.documentElement.style.setProperty('--gas-green-bg', hexToRgba(primary, 0.1));
}

function normalizeLang(value) {
    return SUPPORTED_LANGS.includes(text(value)) ? text(value) : DEFAULT_LANG;
}

function bodyReadonly(readonly) {
    document.body.classList.toggle('is-readonly', readonly);
}

function setStatusMessage(message, isError = false) {
    const node = byId('share-copy-status');
    if (!node) return;
    node.textContent = text(message);
    node.style.color = isError ? '#fca5a5' : 'var(--text-muted)';
}

function updateRateStatus(mode = 'online') {
    const node = byId('rate-status');
    if (!node) return;
    if (mode === 'loading') {
        node.innerHTML = `<i class="fa-solid fa-rotate fa-spin text-[var(--gas-green-light)] mr-1.5"></i>${esc(t('ratesRefreshing'))}`;
        return;
    }
    if (mode === 'error') {
        node.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-yellow-500 mr-1.5"></i>${esc(t('ratesFallback'))}`;
        return;
    }
    node.innerHTML = `<i class="fa-solid fa-money-bill-transfer text-[var(--gas-green-light)] mr-1.5"></i>${esc(t('ratesOnline'))}`;
}

function renderRateDetail() {
    const node = byId('rate-status-detail');
    if (!node) return;
    const message = text(state.rateDetail?.message);
    if (!message) {
        node.textContent = '';
        node.classList.add('hidden');
        return;
    }
    node.textContent = message;
    node.classList.remove('hidden');
    node.dataset.tone = text(state.rateDetail?.tone, 'muted');
}

function setRateDetail(message = '', tone = 'muted') {
    state.rateDetail = { message: text(message), tone: text(tone, 'muted') };
    renderRateDetail();
}

function renderRateLine() {
    const node = byId('live-rates-display');
    if (!node) return;
    node.innerHTML = `1 CNY <i class="fa-solid fa-arrow-right-arrow-left mx-1 text-white"></i> <span class="text-[var(--gas-green-light)]">${state.rates.USD.toFixed(4)} USD</span> | <span class="text-[var(--gas-green-light)]">${state.rates.EUR.toFixed(4)} EUR</span> | <span class="text-[var(--gas-green-light)]">${state.rates.CAD.toFixed(4)} CAD</span> | <span class="text-[var(--gas-green-light)]">${state.rates.RUB.toFixed(4)} RUB</span>`;
}

function renderViewContextBanner() {
    const banner = byId('view-context-banner');
    const kicker = byId('view-context-kicker');
    const title = byId('view-context-title');
    const meta = byId('view-context-meta');
    if (!banner || !kicker || !title || !meta) return;

    if (state.route?.type !== 'preview') {
        banner.classList.add('hidden');
        return;
    }

    kicker.textContent = localeCopy({
        zh: 'ADMIN PREVIEW',
        en: 'ADMIN PREVIEW',
        ru: 'ADMIN PREVIEW',
    });
    title.textContent = localeCopy({
        zh: '当前页面正在读取后台草稿快照，只用于校对，不会直接对外展示。',
        en: 'This page is reading the current draft snapshot for internal review only.',
        ru: 'Эта страница показывает текущий черновик только для внутренней проверки.',
    });

    const slug = text(state.snapshot?.quote?.publicSlug || state.snapshot?.quote?.public_slug);
    const modeText = localeCopy({
        zh: '继续在“报价单管理”里修改并重新发布，客户页才会更新。',
        en: 'Keep editing in Quote Instances and publish again to update the customer page.',
        ru: 'Продолжайте редактировать в Quote Instances и опубликуйте снова, чтобы обновить клиентскую страницу.',
    });
    meta.textContent = slug ? `${modeText} SLUG: ${slug}` : modeText;
    banner.classList.remove('hidden');
}

function renderToolbar() {
    const node = byId('toolbar-brand-name');
    if (!node) return;
    node.textContent = 'GasGx Quotation System';
}

function renderAuthButton() {
    const button = byId('btn-auth');
    if (!button) return;
    button.hidden = true;
}

function renderLangButtons() {
    SUPPORTED_LANGS.forEach((lang) => {
        const button = byId(`btn-${lang}`);
        if (!button) return;
        button.textContent = lang.toUpperCase();
        if (lang === state.currentLang) {
            button.className = 'px-2 md:px-4 py-1 md:py-1.5 rounded transition-all bg-[var(--gas-green-primary)] text-white font-semibold shadow-[0_0_8px_rgba(93,214,44,0.4)]';
            return;
        }
        button.className = 'px-2 md:px-4 py-1 md:py-1.5 rounded transition-all text-[var(--text-body)] hover:text-white';
    });
}

function renderStaticText() {
    const snapshot = state.snapshot;
    if (!snapshot) return;

    renderLangButtons();
    renderToolbar();
    renderAuthButton();
    renderViewContextBanner();

    const overviewTitle = pickDisplayText(snapshot.brand.overview_title, pickDisplayText(snapshot.product.public_title, snapshot.product.product_code));
    const receiver = text(snapshot.quote.receiver_email || snapshot.quote.receiver_name || snapshot.quote.customer_name, '');

    byId('f-title').textContent = overviewTitle;
    byId('lbl-receiver').textContent = uiText('receiver_label', 'receiver');
    byId('lbl-validity').textContent = uiText('validity_label', 'validity');
    byId('lbl-update').innerHTML = `<span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--gas-green-light)] opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--gas-green-light)]"></span></span>${esc(t('update'))}`;
    byId('view-meta-supplier')?.setAttribute('hidden', 'hidden');
    byId('view-meta-sender')?.setAttribute('hidden', 'hidden');
    byId('btn-send')?.setAttribute('hidden', 'hidden');
    byId('val-receiver').textContent = receiver;
    byId('val-receiver').setAttribute('data-placeholder', uiText('receiver_placeholder', 'receiverPlaceholder'));
    byId('footer-note').innerHTML = pickDisplayText(snapshot.brand.footer_note, '');
    byId('btn-text-send').textContent = uiText('send_button', 'send');
    byId('btn-text-share').textContent = isMobileViewport()
        ? (state.currentLang === 'zh' ? '分享' : 'Share')
        : uiText('share_button', 'share');
    byId('btn-text-share').className = isMobileViewport() ? '' : 'ml-2';
    byId('btn-menu-share-link').textContent = t('shareLink');
    byId('btn-menu-img').textContent = t('exportImage');
    byId('btn-menu-pdf').textContent = t('exportPdf');
    byId('btn-text-refresh').textContent = uiText('refresh_button', 'refresh');
    byId('export-loading-text').textContent = t('exportLoading');
    byId('export-sub-text').textContent = t('exportSubText');
    byId('back-to-top').setAttribute('aria-label', state.currentLang === 'zh' ? '返回顶部' : state.currentLang === 'ru' ? 'Наверх' : 'Back to top');
    byId('back-to-top').setAttribute('title', state.currentLang === 'zh' ? '返回顶部' : state.currentLang === 'ru' ? 'Наверх' : 'Back to top');
    byId('share-modal-title').textContent = t('shareTitle');
    byId('share-modal-desc').textContent = t('shareDesc');
    byId('share-expiry-label').textContent = t('shareExpiryLabel');
    byId('share-custom-expiry-label').textContent = t('shareCustomLabel');
    byId('share-custom-expiry-picker-text').textContent = t('shareCustomPicker');
    byId('share-admin-hint').textContent = state.isAdmin ? t('shareAdminHint') : t('authModalHint');
    byId('share-passcode-label').textContent = t('sharePasscodeLabel');
    byId('share-link-label').textContent = t('shareLinkLabel');
    byId('btn-generate-share-text').textContent = t('shareGenerate');
    byId('btn-share-close-text').textContent = t('shareClose');
    byId('share-passcode-output').setAttribute('placeholder', t('sharePasscodePlaceholder'));
    byId('share-link-output').setAttribute('placeholder', t('shareLinkPlaceholder'));
    byId('access-gate-badge').textContent = t('accessBadge');
    byId('access-passcode-label').textContent = t('accessPasscodeLabel');
    byId('access-passcode-submit-text').textContent = t('accessPasscodeSubmit');
    byId('access-gate-refresh-text').textContent = t('accessRefresh');
    byId('auth-modal-kicker').textContent = t('authProtectedAction');
    byId('auth-modal-title').textContent = t('authModalTitle');
    byId('auth-modal-message').textContent = t('authModalMessage');
    byId('auth-modal-hint').textContent = t('authModalHint');
    byId('auth-modal-login-text').textContent = t('authModalLogin');
    byId('auth-modal-cancel-text').textContent = t('authModalCancel');

    const expirySelect = byId('share-expiry-select');
    if (expirySelect) {
        expirySelect.innerHTML = `
            <option value="3d">${esc(t('shareExpiry3d'))}</option>
            <option value="1d">${esc(t('shareExpiry1d'))}</option>
            <option value="7d">${esc(t('shareExpiry7d'))}</option>
            <option value="never">${esc(t('shareExpiryNever'))}</option>
            <option value="custom">${esc(t('shareExpiryCustom'))}</option>
        `;
        if (!expirySelect.value) expirySelect.value = '3d';
    }

    document.title = `${overviewTitle} - ${supplier}`;
}

function getProductMediaState(snapshot = state.snapshot) {
    const config = normalizeMediaConfig(snapshot?.product?.media_config || {});
    const items = sortMediaItems(snapshot?.product?.media_gallery || []);
    if (!config.enabled || !items.length) return { enabled: false, config, items: [] };
    return { enabled: true, config, items };
}

function renderProductMediaBlock(snapshot = state.snapshot) {
    const mediaState = getProductMediaState(snapshot);
    if (!mediaState.enabled) return '';

    const { config, items } = mediaState;
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
                    ${items
                        .map(
                            (item, index) => `
                                <figure class="quote-media-figure">
                                    <img src="${esc(item.public_url)}" alt="${esc(item.title || `${t('galleryTitle')} ${index + 1}`)}" loading="lazy">
                                </figure>
                            `,
                        )
                        .join('')}
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
                ${items
                    .map(
                        (item, index) => `
                            <figure class="quote-media-slide ${index === currentIndex ? 'is-active' : ''}" data-gallery-slide="${index}">
                                <img src="${esc(item.public_url)}" alt="${esc(item.title || `${t('galleryTitle')} ${index + 1}`)}" loading="lazy">
                            </figure>
                        `,
                    )
                    .join('')}
                ${
                    items.length > 1
                        ? `
                    <button type="button" class="quote-media-nav prev" data-gallery-nav="prev" aria-label="${esc(t('galleryPrev'))}">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    <button type="button" class="quote-media-nav next" data-gallery-nav="next" aria-label="${esc(t('galleryNext'))}">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                `
                        : ''
                }
            </div>
            ${
                items.length > 1
                    ? `
                <div class="quote-media-dots">
                    ${items
                        .map(
                            (_item, index) => `
                                <button type="button" class="quote-media-dot ${index === currentIndex ? 'is-active' : ''}" data-gallery-dot="${index}" aria-label="${esc(`${t('galleryTitle')} ${index + 1}`)}"></button>
                            `,
                        )
                        .join('')}
                </div>
            `
                    : ''
            }
        </section>
    `;
}

function bindProductMediaControls() {
    const mediaState = getProductMediaState();
    if (!mediaState.enabled || mediaState.config.layout !== MEDIA_LAYOUTS.CAROUSEL || mediaState.items.length <= 1) return;

    document.querySelectorAll('[data-gallery-nav]').forEach((button) => {
        button.addEventListener('click', () => {
            const direction = button.dataset.galleryNav === 'prev' ? -1 : 1;
            state.galleryIndex = (state.galleryIndex + direction + mediaState.items.length) % mediaState.items.length;
            renderContent();
        });
    });

    document.querySelectorAll('[data-gallery-dot]').forEach((button) => {
        button.addEventListener('click', () => {
            state.galleryIndex = Number(button.dataset.galleryDot || 0) || 0;
            renderContent();
        });
    });
}

function syncScrollableTable(wrapper) {
    const shell = wrapper?.closest('.table-scroll-shell');
    if (!wrapper || !shell) return;
    const maxScroll = Math.max(0, wrapper.scrollWidth - wrapper.clientWidth);
    shell.dataset.scrollLeft = wrapper.scrollLeft > 12 ? 'true' : 'false';
    shell.dataset.scrollRight = wrapper.scrollLeft < maxScroll - 12 ? 'true' : 'false';
}

function bindScrollableTables(root = document) {
    [...root.querySelectorAll('.table-responsive-wrapper')].forEach((wrapper) => {
        const sync = () => syncScrollableTable(wrapper);
        wrapper.addEventListener('scroll', sync, { passive: true });
        window.requestAnimationFrame(sync);
    });
}

function renderContent() {
    const snapshot = state.snapshot;
    const container = byId('content-area');
    if (!snapshot || !container) return;

    const productTitle = pickDisplayText(snapshot.product.public_title, snapshot.product.product_code);
    const total = quoteTotal(snapshot);
    const rows = [];
    const mediaState = getProductMediaState(snapshot);
    const mediaBlock = renderProductMediaBlock(snapshot);
    const mediaAbove = mediaState.enabled && mediaState.config.position === MEDIA_POSITIONS.ABOVE ? mediaBlock : '';
    const mediaBelow = mediaState.enabled && mediaState.config.position !== MEDIA_POSITIONS.ABOVE ? mediaBlock : '';
    const confirmationPanel = quoteConfirmationPanelMarkup();

    (snapshot.product.sections || []).forEach((section) => {
        const subtotal = sectionSubtotal(section);
        rows.push(`
            <tr class="quote-section-row" style="background-color: var(--bg-base);">
                <td class="text-[var(--text-muted)] opacity-50 text-center text-xs font-mono-num whitespace-nowrap">-</td>
                <td class="text-[var(--gas-green-light)] font-semibold whitespace-nowrap">${esc(getSectionLabel(section))}</td>
                <td class="text-[var(--text-muted)] opacity-50 text-xs whitespace-nowrap">-</td>
                <td class="text-[var(--text-muted)] opacity-50 text-center font-mono-num whitespace-nowrap">-</td>
                <td class="font-mono-num text-[var(--gas-green-light)] font-medium whitespace-nowrap">${esc(formatCurrency('RMB', subtotal))}</td>
                <td class="font-mono-num text-[var(--gas-green-light)] font-medium whitespace-nowrap">${esc(formatCurrency('USD', subtotal * state.rates.USD))}</td>
                <td class="font-mono-num text-[var(--gas-green-light)] font-medium whitespace-nowrap">${esc(formatCurrency('EUR', subtotal * state.rates.EUR))}</td>
                <td class="font-mono-num text-[var(--gas-green-light)] font-medium whitespace-nowrap">${esc(formatCurrency('CAD', subtotal * state.rates.CAD))}</td>
                <td class="font-mono-num text-[var(--gas-green-light)] font-medium whitespace-nowrap">${esc(formatCurrency('RUB', subtotal * state.rates.RUB))}</td>
            </tr>
        `);

        (section.items || []).forEach((item) => {
            const included = item.isIncluded === true;
            const price = safeNumber(item.priceRmb, 0);
            rows.push(`
                <tr class="quote-item-row">
                    <td class="text-[var(--text-body)] text-center text-xs font-mono-num whitespace-nowrap">${esc(item.lineCode || '--')}</td>
                    <td class="text-white min-w-[200px]">${esc(pickDisplayText(item.nameI18n, item.lineCode || '--'))}</td>
                    <td class="text-[var(--text-body)] text-xs whitespace-nowrap">${esc(item.brandLabel || '-')}</td>
                    <td class="text-[var(--text-body)] text-center font-mono-num whitespace-nowrap">${esc(item.qtyLabel || '1')}</td>
                    <td class="font-mono-num ${included ? 'text-[var(--text-muted)]' : 'text-[var(--gas-green-light)] font-medium'} whitespace-nowrap">${included ? esc(t('included')) : esc(formatCurrency('RMB', price))}</td>
                    <td class="font-mono-num ${included ? 'text-[#333333]' : 'text-[var(--gas-green-light)] font-medium'} whitespace-nowrap">${included ? '-' : esc(formatCurrency('USD', price * state.rates.USD))}</td>
                    <td class="font-mono-num ${included ? 'text-[#333333]' : 'text-[var(--gas-green-light)] font-medium'} whitespace-nowrap">${included ? '-' : esc(formatCurrency('EUR', price * state.rates.EUR))}</td>
                    <td class="font-mono-num ${included ? 'text-[#333333]' : 'text-[var(--gas-green-light)] font-medium'} whitespace-nowrap">${included ? '-' : esc(formatCurrency('CAD', price * state.rates.CAD))}</td>
                    <td class="font-mono-num ${included ? 'text-[#333333]' : 'text-[var(--gas-green-light)] font-medium'} whitespace-nowrap">${included ? '-' : esc(formatCurrency('RUB', price * state.rates.RUB))}</td>
                </tr>
            `);
        });
    });

    container.innerHTML = `
        <div class="mb-10 md:mb-16">
            <section data-quote-section="overview">
                <h3 class="text-base md:text-lg font-semibold text-[var(--gas-green-light)] mb-4 md:mb-5 flex items-center gap-2 md:gap-3">
                    <span class="bg-[var(--gas-green-bg)] border border-[var(--gas-green-primary)] text-[var(--gas-green-light)] w-6 h-6 md:w-7 md:h-7 rounded flex items-center justify-center text-xs md:text-sm font-mono-num flex-shrink-0">1</span>
                    <span class="leading-tight">${esc(productTitle)}</span>
                </h3>
            </section>
            ${mediaAbove ? `<section data-quote-section="media">${mediaAbove}</section>` : ''}

            <section data-quote-section="pricing">
                <div class="quote-total-card bg-[var(--bg-base)] border border-[var(--border-color)] rounded p-4 md:p-5 mb-4 md:mb-6 flex flex-col md:flex-row md:flex-wrap items-start md:items-center justify-between shadow-inner gap-4">
                    <span class="font-bold text-white tracking-wider text-xs md:text-sm">${esc(uiText('system_total_label', 'systemTotal'))}:</span>
                    <div class="quote-total-grid text-sm md:text-[15px]">
                        <span class="flex items-center gap-2"><span class="gas-tag">RMB</span> <span class="text-[var(--gas-green-light)] font-mono-num font-bold">${esc(formatCurrency('RMB', total))}</span></span>
                        <span class="flex items-center gap-2"><span class="gas-tag">USD</span> <span class="text-[var(--gas-green-light)] font-mono-num font-bold">${esc(formatCurrency('USD', total * state.rates.USD))}</span></span>
                        <span class="flex items-center gap-2"><span class="gas-tag">EUR</span> <span class="text-[var(--gas-green-light)] font-mono-num font-bold">${esc(formatCurrency('EUR', total * state.rates.EUR))}</span></span>
                        <span class="flex items-center gap-2"><span class="gas-tag">CAD</span> <span class="text-[var(--gas-green-light)] font-mono-num font-bold">${esc(formatCurrency('CAD', total * state.rates.CAD))}</span></span>
                        <span class="flex items-center gap-2"><span class="gas-tag">RUB</span> <span class="text-[var(--gas-green-light)] font-mono-num font-bold">${esc(formatCurrency('RUB', total * state.rates.RUB))}</span></span>
                    </div>
                </div>

                <div class="table-scroll-shell" data-scroll-left="false" data-scroll-right="false">
                    <div class="table-scroll-note"><i class="fa-solid fa-arrows-left-right"></i><span>${esc(t('tableSwipeHint'))}</span></div>
                    <div class="table-responsive-wrapper w-full">
                        <table class="industrial-table text-left">
                            <thead>
                                <tr>${t('headers').map((header, index) => `<th class="${index === 0 ? 'w-12 text-center whitespace-nowrap' : 'whitespace-nowrap'}">${esc(header)}</th>`).join('')}</tr>
                            </thead>
                            <tbody>${rows.join('')}</tbody>
                        </table>
                    </div>
                </div>
            </section>
            ${mediaBelow ? `<section data-quote-section="media">${mediaBelow}</section>` : ''}
        </div>
        ${confirmationPanel ? `<section data-quote-section="confirmation">${confirmationPanel}</section>` : ''}
    `;
    bindScrollableTables(container);
    bindProductMediaControls();
    observeQuoteSections(container);
    byId('quote-confirm-checkbox')?.addEventListener('change', (event) => {
        state.publicConfirmation.confirmed = Boolean(event.currentTarget.checked);
        if (state.publicConfirmation.confirmed) {
            logQuoteBehavior('勾选报价确认', {
                section_key: 'confirmation',
                section_label: quoteBehaviorSectionLabel('confirmation'),
                summary: '客户已勾选报价确认复选框',
            }, {
                activityType: 'button_click',
                dedupeKey: 'confirm-checkbox',
            });
        }
    });
    byId('quote-confirm-note')?.addEventListener('input', (event) => {
        state.publicConfirmation.note = event.currentTarget.value || '';
    });
    byId('quote-confirm-submit')?.addEventListener('click', () => {
        logQuoteBehavior('点击提交报价确认', {
            section_key: 'confirmation',
            section_label: quoteBehaviorSectionLabel('confirmation'),
            note_length: text(state.publicConfirmation.note).length,
            summary: '客户尝试提交报价确认',
        }, {
            activityType: 'button_click',
            dedupeKey: 'confirm-submit-click',
        });
        void submitEmbeddedPublicConfirmation();
    });
}

function renderAll() {
    if (!state.snapshot) return;
    applyTheme(state.snapshot.brand);
    renderStaticText();
    flushQuoteSectionDwell();
    renderContent();
    renderRateLine();
    updateRateStatus(state.rateStatusMode || 'online');
    renderRateDetail();
    syncShareAvailability();
}

function baseQuoteTime() {
    const published = Date.parse(state.snapshot?.quote?.publishedAt || '');
    if (Number.isFinite(published)) return published;
    const updated = Date.parse(state.snapshot?.quote?.updatedAt || '');
    if (Number.isFinite(updated)) return updated;
    return Date.now();
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
    const liveDate = byId('live-date');
    const liveClock = byId('live-clock');
    const validity = byId('val-validity');
    if (liveDate) liveDate.textContent = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (liveClock) liveClock.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    if (validity && state.snapshot) {
        const target = baseQuoteTime() + safeNumber(state.snapshot.quote.validityHours, 72) * 60 * 60 * 1000;
        validity.textContent = formatValidity(target - Date.now());
    }
}

function startClock() {
    if (state.clockTimer) window.clearInterval(state.clockTimer);
    renderClock();
    state.clockTimer = window.setInterval(renderClock, 1000);
}

function changedRateCodes(previousRates = {}, nextRates = {}, digits = null) {
    return ['USD', 'EUR', 'CAD', 'RUB'].filter((code) => {
        const prev = safeNumber(previousRates[code], 0);
        const next = safeNumber(nextRates[code], 0);
        if (digits === null) return Math.abs(prev - next) > 1e-12;
        return prev.toFixed(digits) !== next.toFixed(digits);
    });
}

function manualRateRefreshMessage(previousRates = {}, nextRates = {}) {
    const exactChanged = changedRateCodes(previousRates, nextRates);
    const roundedChanged = changedRateCodes(previousRates, nextRates, 4);
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (!exactChanged.length) {
        return {
            tone: 'muted',
            message: localeCopy({
                zh: `汇率已刷新，接口返回未变化。${timeLabel}`,
                en: `Rates refreshed. The API returned the same values. ${timeLabel}`,
                ru: `Курсы обновлены. API вернул те же значения. ${timeLabel}`,
            }),
        };
    }

    if (!roundedChanged.length) {
        return {
            tone: 'muted',
            message: localeCopy({
                zh: `汇率已刷新，但四舍五入到 4 位后显示未变化。${timeLabel}`,
                en: `Rates refreshed, but the rounded 4-digit display did not change. ${timeLabel}`,
                ru: `Курсы обновлены, но после округления до 4 знаков отображение не изменилось. ${timeLabel}`,
            }),
        };
    }

    const changedText = roundedChanged.join(' / ');
    return {
        tone: 'success',
        message: localeCopy({
            zh: `汇率已刷新，${changedText} 已更新。${timeLabel}`,
            en: `Rates refreshed. Updated: ${changedText}. ${timeLabel}`,
            ru: `Курсы обновлены. Изменено: ${changedText}. ${timeLabel}`,
        }),
    };
}

async function fetchRates(isManual = false) {
    if (isManual) {
        state.rateStatusMode = 'loading';
        updateRateStatus('loading');
    }
    const previousRates = normalizeRates(state.rates);
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
        state.rateStatusMode = 'online';
        renderContent();
        renderRateLine();
        updateRateStatus('online');
        if (isManual) {
            const detail = manualRateRefreshMessage(previousRates, state.rates);
            setRateDetail(detail.message, detail.tone);
        }
    } catch (_error) {
        state.rateStatusMode = 'error';
        renderContent();
        renderRateLine();
        updateRateStatus('error');
        if (isManual) {
            setRateDetail(
                localeCopy({
                    zh: '汇率刷新失败，当前继续使用报价单里的汇率快照。',
                    en: 'Rate refresh failed. The page is still using the saved quote snapshot.',
                    ru: 'Не удалось обновить курсы. Страница продолжает использовать сохраненный снимок.',
                }),
                'error',
            );
        }
    }
}

function getFileName(ext) {
    const title = text(byId('f-title')?.textContent, 'quotation')
        .replace(/[\n\r]/g, '')
        .trim()
        .replace(/\s+/g, '_');
    const now = new Date();
    const suffix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    return `${title || 'quotation'}_${suffix}.${ext}`;
}

async function createDirectCapture() {
    const element = byId('export-area');
    if (!element) throw new Error('Export area missing');

    const original = {
        width: element.style.width,
        padding: element.style.padding,
        backgroundColor: element.style.backgroundColor,
    };

    element.style.width = '1280px';
    element.style.padding = '40px';
    element.style.backgroundColor = '#161B22';

    const wrappers = [...element.querySelectorAll('.table-responsive-wrapper')];
    const wrapperOverflow = wrappers.map((node) => node.style.overflowX);
    wrappers.forEach((node) => {
        node.style.overflowX = 'visible';
    });

    await new Promise((resolve) => window.setTimeout(resolve, 100));

    const exactWidth = element.offsetWidth;
    const exactHeight = element.scrollHeight;
    const canvas = await window.html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#161B22',
        width: exactWidth,
        windowWidth: exactWidth,
    });

    element.style.width = original.width;
    element.style.padding = original.padding;
    element.style.backgroundColor = original.backgroundColor;
    wrappers.forEach((node, index) => {
        node.style.overflowX = wrapperOverflow[index];
    });

    return { canvas, exactWidth, exactHeight };
}

function showExportOverlay() {
    const overlay = byId('export-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    void overlay.offsetWidth;
    overlay.classList.remove('opacity-0');
    overlay.classList.add('opacity-100');
}

function hideExportOverlay() {
    const overlay = byId('export-overlay');
    if (!overlay) return;
    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0');
    window.setTimeout(() => overlay.classList.add('hidden'), 300);
}

async function exportImage() {
    if (!window.html2canvas) return;
    if (!requireSignedIn('image')) return;
    closeShareMenu();
    showExportOverlay();
    try {
        const { canvas } = await createDirectCapture();
        const link = document.createElement('a');
        link.download = getFileName('png');
        link.href = canvas.toDataURL('image/png');
        link.click();
    } finally {
        hideExportOverlay();
    }
}

async function exportPdf() {
    if (!window.html2pdf || !window.html2canvas) return;
    if (!requireSignedIn('pdf')) return;
    closeShareMenu();
    showExportOverlay();
    try {
        const { canvas, exactWidth, exactHeight } = await createDirectCapture();
        await window.html2pdf()
            .set({
                margin: 0,
                filename: getFileName('pdf'),
                image: { type: 'jpeg', quality: 1 },
                jsPDF: { unit: 'px', format: [exactWidth, exactHeight], orientation: 'portrait' },
            })
            .from(canvas)
            .save();
    } finally {
        hideExportOverlay();
    }
}

function updateBackToTop() {
    const button = byId('back-to-top');
    if (!button) return;
    const visible = window.scrollY > Math.max(320, window.innerHeight * 0.6);
    button.classList.toggle('is-visible', visible);
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeShareMenu() {
    const menu = byId('share-menu');
    const arrow = byId('icon-share-down');
    state.isMobileMenuOpen = false;
    if (menu) menu.classList.add('hidden');
    if (arrow) arrow.classList.remove('rotate-180');
}

function toggleShareMenu(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    if (!requireSignedIn('share')) return;
    const menu = byId('share-menu');
    const arrow = byId('icon-share-down');
    if (!menu) return;
    const willOpen = menu.classList.contains('hidden');
    menu.classList.toggle('hidden', !willOpen);
    state.isMobileMenuOpen = willOpen;
    if (arrow) arrow.classList.toggle('rotate-180', willOpen);
}

function syncShareAvailability() {
    const shareLinkButton = byId('btn-menu-share-link-wrap');
    const divider = byId('share-menu-divider');
    if (!shareLinkButton) return;
    const allow = Boolean(state.shareTarget);
    shareLinkButton.classList.toggle('hidden', !allow);
    if (divider) divider.classList.toggle('hidden', !allow);
}

function openShareModal() {
    if (!requireSignedIn('link')) return;
    if (!state.shareTarget) {
        setStatusMessage(t('shareUnavailable'), true);
        return;
    }
    closeShareMenu();
    const modal = byId('share-modal');
    if (!modal) return;
    byId('share-expiry-select').value = '3d';
    byId('share-custom-expiry').value = '';
    byId('share-passcode-output').value = generatePasscode();
    byId('share-link-output').value = '';
    byId('share-copy-status').textContent = '';
    syncShareExpiryUi();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeShareModal() {
    const modal = byId('share-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
}

function generatePasscode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = new Uint8Array(4);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join('');
}

function syncShareExpiryUi() {
    const mode = byId('share-expiry-select')?.value || '3d';
    const customWrap = byId('share-custom-expiry-wrap');
    const preview = byId('share-expiry-preview');
    if (customWrap) customWrap.classList.toggle('hidden', mode !== 'custom');
    if (!preview) return;
    if (mode === 'custom') {
        const value = byId('share-custom-expiry')?.value || '';
        preview.textContent = value ? `${t('shareMetaExpired')}${value.replace('T', ' ')}` : t('shareCustomRequired');
        return;
    }
    if (mode === 'never') {
        preview.textContent = t('shareMetaNever');
        return;
    }
    preview.textContent = t('sharePreviewDefault');
}

function getShareExpiry() {
    const mode = byId('share-expiry-select')?.value || '3d';
    const now = Date.now();
    if (mode === '1d') return new Date(now + 24 * 60 * 60 * 1000).toISOString();
    if (mode === '3d') return new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString();
    if (mode === '7d') return new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();
    if (mode === 'never') return '';
    const custom = byId('share-custom-expiry')?.value || '';
    if (!custom) throw new Error(t('shareCustomRequired'));
    const customMs = Date.parse(custom);
    if (!Number.isFinite(customMs)) throw new Error(t('shareCustomRequired'));
    if (customMs <= now) throw new Error(t('shareCustomExpired'));
    return new Date(customMs).toISOString();
}

function getShareSecret() {
    return text(state.snapshot?.brand?.share_signing_secret, DEFAULT_SHARE_SECRET) || DEFAULT_SHARE_SECRET;
}

async function copyText(value) {
    const clean = text(value);
    if (!clean) return false;
    try {
        await navigator.clipboard.writeText(clean);
        return true;
    } catch (_error) {
        const input = document.createElement('textarea');
        input.value = clean;
        input.setAttribute('readonly', 'readonly');
        input.style.position = 'absolute';
        input.style.left = '-9999px';
        document.body.appendChild(input);
        input.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(input);
        return copied;
    }
}

async function generateShareLink() {
    if (!requireSignedIn('link')) return;
    if (!state.shareTarget) {
        setStatusMessage(t('shareUnavailable'), true);
        return;
    }

    try {
        const expiresAt = getShareExpiry();
        const passcode = text(byId('share-passcode-output')?.value, generatePasscode()).toUpperCase();
        const shareMeta = shareMetadata();
        byId('share-passcode-output').value = passcode;
        const payload = {
            createdAt: new Date().toISOString(),
            expiresAt: expiresAt || '',
            passcode,
            shareMeta,
        };

        if (state.shareTarget.type === 'quote') {
            payload.quoteSlug = state.shareTarget.quoteSlug;
        } else {
            payload.brand = state.shareTarget.brand;
            payload.productId = state.shareTarget.productId || '';
        }

        const token = await signPayload(payload, getShareSecret());
        const url = `${window.location.origin}/quote/view.html?share=${encodeURIComponent(token)}`;
        byId('share-link-output').value = url;
        const copied = await copyText(url);
        void appendShareHistoryRecord({
            channel: 'share_link',
            status: 'generated',
            recipientName: shareMeta.recipientName,
            recipientEmail: shareMeta.recipientEmail,
            recipientCompany: shareMeta.recipientCompany,
            ownerName: shareMeta.ownerName,
            ownerEmail: shareMeta.ownerEmail,
            followUpNotes: shareMeta.followUpNotes,
            sentAt: payload.createdAt,
            expiresAt,
            passcodeProtected: Boolean(passcode),
            shareTarget: state.shareTarget?.type || '',
        });
        void logQuoteEvent('share_link_generated', {
            accessMode: 'admin',
            shareToken: token,
            shareExpiresAt: expiresAt,
            metadata: {
                shareTarget: state.shareTarget?.type || '',
                passcodeProtected: Boolean(passcode),
                customerName: text(state.snapshot?.quote?.customerName),
                ...shareMeta,
            },
        });
        setStatusMessage(copied ? t('shareCopySuccess') : t('shareCopyFallback'), !copied);
    } catch (error) {
        setStatusMessage(error.message || t('shareGenerateError'), true);
    }
}

function sendEmail() {
    if (!requireSignedIn('send')) return;
    const shareMeta = shareMetadata();
    const receiver = text(shareMeta.recipientEmail || state.snapshot?.quote?.receiverEmail || state.snapshot?.quote?.receiver_email || state.snapshot?.quote?.receiverName || state.snapshot?.quote?.receiver_name);
    if (!receiver) {
        window.alert(t('noEmail'));
        return;
    }
    const sender = text(state.snapshot?.brand?.sender_email || state.snapshot?.brand?.senderEmail);
    const brandName = text(state.snapshot?.brand?.subject_name || state.snapshot?.brand?.display_name || state.snapshot?.brand?.brand_name);
    const title = text(byId('f-title')?.textContent, 'Quotation');
    const salutation = text(shareMeta.recipientName, 'sir/madam');
    void appendShareHistoryRecord({
        channel: 'email',
        status: 'emailed',
        recipientName: shareMeta.recipientName,
        recipientEmail: receiver,
        recipientCompany: shareMeta.recipientCompany,
        ownerName: shareMeta.ownerName,
        ownerEmail: shareMeta.ownerEmail,
        followUpNotes: shareMeta.followUpNotes,
        sentAt: new Date().toISOString(),
        shareTarget: state.shareTarget?.type || '',
    });
    void logQuoteEvent('email_clicked', {
        accessMode: state.isAdmin ? 'admin' : 'quote',
        metadata: {
            receiver,
            brandName,
            title,
            ...shareMeta,
        },
    });
    const subject = encodeURIComponent(`${t('mailSubjectPrefix')} ${title} - ${brandName}`);
    const body = encodeURIComponent(`Dear ${salutation},\n\nPlease find the latest quotation document attached or review it from the shared quote page.\n\nBest Regards,\n${sender}`);
    window.location.href = `mailto:${receiver}?subject=${subject}&body=${body}`;
}

function textToBytes(value) {
    return new TextEncoder().encode(String(value ?? ''));
}

function bytesToBase64Url(bytes) {
    const binary = Array.from(bytes, (value) => String.fromCharCode(value)).join('');
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToString(value) {
    const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
    return atob(`${normalized}${padding}`);
}

function parseUnsignedPayload(token) {
    const payloadPart = String(token || '').split('.')[0];
    if (!payloadPart) return null;
    try {
        return JSON.parse(base64UrlToString(payloadPart));
    } catch (_error) {
        return null;
    }
}

async function signPayload(payload, secret) {
    const clientSecret = String(secret || DEFAULT_SHARE_SECRET);
    const payloadText = JSON.stringify(payload);
    const key = await crypto.subtle.importKey('raw', textToBytes(clientSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, textToBytes(payloadText));
    return `${bytesToBase64Url(textToBytes(payloadText))}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

async function decodeSignedPayload(token, secret) {
    const [payloadPart, signaturePart] = String(token || '').split('.');
    if (!payloadPart || !signaturePart) return { valid: false, payload: null, signaturePart: '' };
    const payloadText = base64UrlToString(payloadPart);
    let payload = null;
    try {
        payload = JSON.parse(payloadText);
    } catch (_error) {
        return { valid: false, payload: null, signaturePart: '' };
    }
    const expectedToken = await signPayload(payload, secret);
    return {
        valid: expectedToken.split('.')[1] === signaturePart,
        payload,
        signaturePart,
    };
}

function passcodeStorageKey(prefix, signaturePart) {
    return `${prefix || 'quote-share-unlocked'}:${signaturePart || 'sig'}`;
}

function readUnlockedPasscode(prefix, signaturePart) {
    try {
        return window.localStorage.getItem(passcodeStorageKey(prefix, signaturePart)) || '';
    } catch (_error) {
        return '';
    }
}

function persistUnlockedPasscode(prefix, signaturePart, value) {
    try {
        window.localStorage.setItem(passcodeStorageKey(prefix, signaturePart), value);
    } catch (_error) {
        return '';
    }
    return value;
}

function getClient() {
    if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
    if (!getClient.instance) {
        getClient.instance = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            },
        });
    }
    return getClient.instance;
}

function hydrateSnapshotWithLiveMeta(snapshot, row = {}) {
    if (!snapshot || typeof snapshot !== 'object') return null;
    const quote = snapshot.quote && typeof snapshot.quote === 'object' ? { ...snapshot.quote } : {};
    if (!text(quote.id) && text(row.id)) quote.id = text(row.id);
    if (!text(quote.publicSlug) && text(row.public_slug)) quote.publicSlug = text(row.public_slug);
    if (!text(quote.customerId) && text(row.customer_id)) quote.customerId = text(row.customer_id);
    if ((!quote.customerProfile || typeof quote.customerProfile !== 'object' || !Object.keys(quote.customerProfile).length)
        && row.customer_snapshot && typeof row.customer_snapshot === 'object') {
        quote.customerProfile = { ...row.customer_snapshot };
    }
    return {
        ...snapshot,
        quote,
    };
}

async function sha256Hex(value) {
    const input = text(value);
    if (!input || !window.crypto?.subtle) return '';
    const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    return Array.from(new Uint8Array(digest), (item) => item.toString(16).padStart(2, '0')).join('');
}

async function logQuoteEvent(eventType, options = {}) {
    const supabase = getClient();
    const instanceId = text(state.snapshot?.quote?.id);
    if (!supabase || !instanceId) return;
    try {
        const shareTokenHash = options.shareToken ? await sha256Hex(options.shareToken) : '';
        await supabase.from(TABLE_INSTANCE_EVENTS).insert({
            instance_id: instanceId,
            customer_id: text(state.snapshot?.quote?.customerId) || null,
            event_type: text(eventType),
            access_mode: text(options.accessMode || 'quote') || 'quote',
            viewer_email: text(state.adminUser?.email).toLowerCase(),
            viewer_user_id: state.adminUser?.id || null,
            viewer_label: state.isAdmin ? 'admin' : (state.isLoggedIn ? 'logged-in-user' : 'anonymous'),
            share_token_hash: shareTokenHash,
            share_expires_at: text(options.shareExpiresAt) || null,
            user_agent: text(navigator.userAgent).slice(0, 1200),
            referrer_url: text(document.referrer).slice(0, 1200),
            page_url: text(window.location.href).slice(0, 1200),
            locale: text(state.currentLang, DEFAULT_LANG),
            metadata: options.metadata && typeof options.metadata === 'object' ? options.metadata : {},
        });
        const customerId = text(state.snapshot?.quote?.customerId);
        if (customerId) {
            const visitType = text(options.metadata?.visitType);
            const activityType = eventType === 'share_opened'
                ? 'public_link_opened'
                : eventType === 'share_link_generated' || eventType === 'email_clicked' || eventType === 'passcode_unlocked'
                    ? 'button_click'
                    : 'page_view';
            const actionLabel = eventType === 'share_link_generated'
                ? '生成报价分享链接'
                : eventType === 'email_clicked'
                    ? '点击邮件发送'
                    : eventType === 'preview_opened'
                        ? '后台打开报价预览'
                        : eventType === 'passcode_unlocked'
                            ? '客户完成提取码验证'
                            : eventType === 'share_opened'
                                ? '客户打开报价链接'
                                : '客户查看报价';
            let normalizedActionLabel = actionLabel;
            if (eventType === 'share_link_generated') normalizedActionLabel = '生成报价分享链接';
            else if (eventType === 'email_clicked') normalizedActionLabel = '点击邮件发送';
            else if (eventType === 'preview_opened') normalizedActionLabel = '后台打开报价预览';
            else if (eventType === 'passcode_unlocked') normalizedActionLabel = '客户完成提取码验证';
            else if (eventType === 'share_opened') normalizedActionLabel = visitType === 'return' ? '客户再次回访报价链接' : '客户首次打开报价链接';
            else if (eventType === 'quote_viewed') normalizedActionLabel = visitType === 'return' ? '客户再次回访报价' : '客户首次打开报价';
            else normalizedActionLabel = '客户查看报价';
            await supabase.from(TABLE_CUSTOMER_ACTIVITIES).insert({
                customer_id: customerId,
                instance_id: instanceId,
                stage_key: 'quote_confirmed',
                actor_type: state.isAdmin ? 'sales' : 'customer',
                actor_id: state.adminUser?.id || null,
                actor_label: text(state.adminUser?.email || (state.isAdmin ? 'Sales' : 'Customer')),
                activity_type: activityType,
                entity_type: 'quote_instance',
                entity_id: instanceId,
                page_key: 'quote-instances',
                action_label: normalizedActionLabel,
                detail_json: options.metadata && typeof options.metadata === 'object' ? options.metadata : {},
            });
        }
    } catch (_error) {
        // Event logging is best-effort and must not block customer access.
    }
}

async function appendQuoteCustomerActivity(actionLabel = '', detail = {}, options = {}) {
    const supabase = getClient();
    const customerId = text(state.snapshot?.quote?.customerId);
    const instanceId = text(state.snapshot?.quote?.id);
    if (!supabase || !customerId || !instanceId || !actionLabel) return;
    try {
        await supabase.from(TABLE_CUSTOMER_ACTIVITIES).insert({
            customer_id: customerId,
            instance_id: instanceId,
            stage_key: text(options.stageKey, 'quote_confirmed'),
            actor_type: state.isAdmin ? 'sales' : 'customer',
            actor_id: state.adminUser?.id || null,
            actor_label: text(state.adminUser?.email || (state.isAdmin ? 'Sales' : 'Customer')),
            activity_type: text(options.activityType, 'page_view'),
            entity_type: 'quote_instance',
            entity_id: instanceId,
            page_key: text(options.pageKey, 'quote-view'),
            action_label: actionLabel,
            detail_json: detail && typeof detail === 'object' ? detail : {},
        });
    } catch (_error) {
        return;
    }
}

function logQuoteBehavior(actionLabel = '', detail = {}, options = {}) {
    if (state.isAdmin) return;
    const dedupeKey = text(options.dedupeKey);
    if (dedupeKey && state.quoteBehavior.activitySentMap[dedupeKey]) return;
    if (dedupeKey) state.quoteBehavior.activitySentMap[dedupeKey] = true;
    void appendQuoteCustomerActivity(actionLabel, {
        access_mode: quoteBehaviorAccessMode(),
        ...detail,
    }, options);
}

function markQuoteSectionSeen(sectionKey = '') {
    const key = text(sectionKey);
    if (!key || state.isAdmin) return;
    const label = quoteBehaviorSectionLabel(key);
    if (!state.quoteBehavior.sectionSeenMap[key]) {
        state.quoteBehavior.sectionSeenMap[key] = true;
        logQuoteBehavior(`查看${label}`, {
            section_key: key,
            section_label: label,
            summary: `客户已查看${label}`,
        }, {
            activityType: 'page_view',
            dedupeKey: `section-seen:${key}`,
        });
    }
    if (state.quoteBehavior.activeSectionKey !== key) {
        flushQuoteSectionDwell();
        state.quoteBehavior.activeSectionKey = key;
        state.quoteBehavior.activeSectionStartedAt = Date.now();
    }
}

function flushQuoteSectionDwell() {
    const activeKey = text(state.quoteBehavior.activeSectionKey);
    if (!activeKey || !state.quoteBehavior.activeSectionStartedAt) return;
    const elapsedMs = Date.now() - state.quoteBehavior.activeSectionStartedAt;
    if (elapsedMs > 0) {
        state.quoteBehavior.sectionDwellMap[activeKey] = safeNumber(state.quoteBehavior.sectionDwellMap[activeKey], 0) + elapsedMs;
    }
    state.quoteBehavior.activeSectionKey = '';
    state.quoteBehavior.activeSectionStartedAt = 0;
}

function flushQuoteBehaviorSummary() {
    if (state.isAdmin) return;
    flushQuoteSectionDwell();
    const focused = Object.entries(state.quoteBehavior.sectionDwellMap)
        .sort((left, right) => safeNumber(right[1], 0) - safeNumber(left[1], 0))[0];
    if (!focused) return;
    const [sectionKey, dwellMs] = focused;
    const dwellSeconds = Math.round(safeNumber(dwellMs, 0) / 1000);
    if (dwellSeconds < 12) return;
    const label = quoteBehaviorSectionLabel(sectionKey);
    logQuoteBehavior(`重点查看${label}`, {
        section_key: sectionKey,
        section_label: label,
        dwell_seconds: dwellSeconds,
        summary: `停留约 ${dwellSeconds} 秒`,
    }, {
        activityType: 'page_view',
        dedupeKey: `section-focus:${sectionKey}`,
    });
}

function observeQuoteSections(root = byId('content-area')) {
    state.quoteBehavior.sectionObserver?.disconnect?.();
    if (!root || state.isAdmin || typeof IntersectionObserver !== 'function') return;
    const nodes = [...root.querySelectorAll('[data-quote-section]')];
    if (!nodes.length) return;
    state.quoteBehavior.sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting || entry.intersectionRatio < 0.2) return;
            markQuoteSectionSeen(entry.target?.dataset?.quoteSection || '');
        });
    }, {
        threshold: [0.2],
    });
    nodes.forEach((node) => state.quoteBehavior.sectionObserver.observe(node));
}

async function appendShareHistoryRecord(options = {}) {
    const supabase = getClient();
    const instanceId = text(state.snapshot?.quote?.id);
    if (!supabase || !instanceId || !state.isLoggedIn) return null;

    try {
        const baseConfig = currentShareConfig();
        const customerId = text(state.snapshot?.quote?.customerId) || null;
        const now = text(options.sentAt, new Date().toISOString());
        const recipientEmail = text(options.recipientEmail, baseConfig.recipient_email).toLowerCase();
        const recipientName = text(options.recipientName, baseConfig.recipient_name);
        const recipientCompany = text(options.recipientCompany, baseConfig.recipient_company);
        const ownerEmail = text(options.ownerEmail, baseConfig.owner_email).toLowerCase();
        const ownerName = text(options.ownerName, baseConfig.owner_name);
        const shareTarget = text(options.shareTarget, state.shareTarget?.type || '');
        const channel = text(options.channel, 'share_link');
        const nextStatus = text(options.status, channel === 'email' ? 'emailed' : 'generated');

        let query = supabase
            .from(TABLE_INSTANCE_SENDS)
            .select('*')
            .eq('instance_id', instanceId)
            .eq('share_target', shareTarget)
            .order('updated_at', { ascending: false })
            .limit(20);
        if (recipientEmail) {
            query = query.eq('recipient_email', recipientEmail);
        } else {
            query = query.eq('recipient_name', recipientName).eq('recipient_company', recipientCompany);
        }
        const { data: matches, error: matchError } = await query;
        if (matchError) throw matchError;

        const existing = (Array.isArray(matches) ? matches : [])
            .map((entry) => normalizeShareHistoryEntry({
                ...entry,
                instance_id: entry.instance_id,
                customer_id: entry.customer_id,
                updated_at: entry.updated_at,
            }))
            .find((entry) => text(entry.status) !== 'closed') || null;

        let saved = null;
        if (existing?.id) {
            const nextChannels = Array.from(new Set([...(Array.isArray(existing.channels) ? existing.channels : [existing.channel]), channel].filter(Boolean)));
            const { data, error } = await supabase
                .from(TABLE_INSTANCE_SENDS)
                .update({
                    customer_id: customerId,
                    recipient_name: recipientName || existing.recipient_name,
                    recipient_email: recipientEmail || existing.recipient_email,
                    recipient_company: recipientCompany || existing.recipient_company,
                    owner_name: ownerName || existing.owner_name,
                    owner_email: ownerEmail || existing.owner_email,
                    follow_up_notes: text(options.followUpNotes, existing.follow_up_notes),
                    share_target: shareTarget,
                    last_channel: channel,
                    channels: nextChannels,
                    status: nextStatus,
                    attempt_count: Math.max(1, Number(existing.attempt_count || 1)) + 1,
                    last_sent_at: now,
                    expires_at: text(options.expiresAt, existing.expires_at) || null,
                    passcode_protected: options.passcodeProtected === true || existing.passcode_protected === true,
                    sender_name: userDisplayName(state.adminUser),
                    sender_email: text(state.adminUser?.email).toLowerCase(),
                    updated_by: state.adminUser?.id || null,
                })
                .eq('id', existing.id)
                .select('*')
                .single();
            if (error) throw error;
            saved = data;
        } else {
            const { data, error } = await supabase
                .from(TABLE_INSTANCE_SENDS)
                .insert({
                    instance_id: instanceId,
                    customer_id: customerId,
                    recipient_name: recipientName,
                    recipient_email: recipientEmail,
                    recipient_company: recipientCompany,
                    owner_name: ownerName,
                    owner_email: ownerEmail,
                    follow_up_notes: text(options.followUpNotes, baseConfig.follow_up_notes),
                    share_target: shareTarget,
                    last_channel: channel,
                    channels: [channel],
                    status: nextStatus,
                    attempt_count: 1,
                    first_sent_at: now,
                    last_sent_at: now,
                    expires_at: text(options.expiresAt) || null,
                    passcode_protected: options.passcodeProtected === true,
                    sender_name: userDisplayName(state.adminUser),
                    sender_email: text(state.adminUser?.email).toLowerCase(),
                    created_by: state.adminUser?.id || null,
                    updated_by: state.adminUser?.id || null,
                })
                .select('*')
                .single();
            if (error) throw error;
            saved = data;
        }

        if (saved && state.snapshot?.quote?.shareConfig) {
            const current = normalizeShareConfig(state.snapshot.quote.shareConfig);
            state.snapshot.quote.shareConfig = normalizeShareConfig({
                ...current,
                recipient_name: recipientName || current.recipient_name,
                recipient_email: recipientEmail || current.recipient_email,
                recipient_company: recipientCompany || current.recipient_company,
                owner_name: ownerName || current.owner_name,
                owner_email: ownerEmail || current.owner_email,
                follow_up_notes: text(options.followUpNotes, current.follow_up_notes),
            });
        }
        return saved;
    } catch (_error) {
        return null;
    }
}

async function resolveAdminSession() {
    const supabase = getClient();
    if (!supabase) return { allowed: false, isLoggedIn: false, user: null };
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user || null;
    const email = String(user?.email || '').trim().toLowerCase();
    if (!email) return { allowed: false, isLoggedIn: false, user: null };
    if (ADMIN_EMAILS.includes(email)) return { allowed: true, isLoggedIn: true, user };

    const { data, error } = await supabase.from('admin_users').select('email,is_active').eq('email', email).maybeSingle();
    if (error) return { allowed: false, isLoggedIn: true, user };
    return { allowed: data?.is_active === true, isLoggedIn: true, user };
}

async function fetchPublishedQuoteBySlug(publicSlug) {
    const supabase = getClient();
    if (!supabase || !publicSlug) return null;
    const { data, error } = await supabase
        .from('quote_instances')
        .select('id, public_slug, customer_id, customer_snapshot, published_snapshot')
        .eq('public_slug', publicSlug)
        .eq('status', 'published')
        .maybeSingle();
    if (error) return null;
    return hydrateSnapshotWithLiveMeta(data?.published_snapshot || null, data || {});
}

async function fetchPreviewQuote(instanceId) {
    const supabase = getClient();
    if (!supabase || !instanceId) return null;
    const { data, error } = await supabase.from('quote_instances').select('*').eq('id', instanceId).maybeSingle();
    if (error || !data) return null;
    const [itemsResult, productResult, mediaResult] = await Promise.all([
        supabase.from('quote_instance_items').select('*').eq('instance_id', instanceId).order('sort_order', { ascending: true }),
        supabase.from('quote_products').select('media_config, ui_text').eq('id', data.product_id).maybeSingle(),
        supabase.from('quote_product_media').select('title,storage_path,public_url,sort_order,is_active').eq('product_id', data.product_id).eq('is_active', true).order('sort_order', { ascending: true }),
    ]);
    if (itemsResult.error) return null;
    const liveMedia = sortMediaItems(mediaResult.data || []);
    const mergedProductSnapshot = {
        ...(data.product_snapshot || {}),
        media_config: normalizeMediaConfig(
            data.product_snapshot?.media_config && typeof data.product_snapshot.media_config === 'object'
                ? data.product_snapshot.media_config
                : productResult.data?.media_config || {}
        ),
        ui_text:
            data.product_snapshot?.ui_text && typeof data.product_snapshot.ui_text === 'object'
                ? data.product_snapshot.ui_text
                : productResult.data?.ui_text || {},
        media_gallery: liveMedia.length ? liveMedia : sortMediaItems(data.product_snapshot?.media_gallery || []),
    };
    return hydrateSnapshotWithLiveMeta(buildQuoteSnapshot({
        brand: data.brand_snapshot,
        product: mergedProductSnapshot,
        instance: data,
        items: itemsResult.data || [],
        mode: 'preview',
    }), data);
}

async function resolveSnapshotFromBrand(brandSlug, productId = '') {
    const brandKey = text(brandSlug, 'vman') || 'vman';
    const supabase = getClient();
    if (supabase) {
        const brandResult = await supabase.from('quote_brands').select('slug,default_quote_slug').eq('slug', brandKey).maybeSingle();
        if (!brandResult.error && brandResult.data?.default_quote_slug) {
            const published = await fetchPublishedQuoteBySlug(brandResult.data.default_quote_slug);
            if (published) return published;
        }
    }
    const legacyPages = await ensureLegacyQuotePagesLoaded('/shared/quote-system/quote-pages.js');
    return buildLegacyFallbackSnapshot(legacyPages, brandKey, productId);
}

function resolveInitialRoute() {
    const previewId = text(params.get('preview'));
    if (previewId) return { type: 'preview', previewId };

    const shareToken = text(params.get('share'));
    if (shareToken) return { type: 'share', token: shareToken };

    const quoteSlug = text(params.get('quote'));
    if (quoteSlug) return { type: 'quote', quoteSlug };

    const brand = text(params.get('brand') || params.get('company'), 'vman') || 'vman';
    const productId = text(params.get('product'));
    return { type: 'brand', brand, productId };
}

function deriveShareTarget() {
    if (!state.snapshot) return null;
    if (state.route?.type === 'quote') {
        return { type: 'quote', quoteSlug: state.route.quoteSlug };
    }
    if (state.route?.type === 'brand') {
        if (state.snapshot.mode !== 'legacy' && text(state.snapshot.quote?.publicSlug)) {
            return { type: 'quote', quoteSlug: state.snapshot.quote.publicSlug };
        }
        return { type: 'brand', brand: state.route.brand, productId: state.route.productId || state.snapshot.product.slug };
    }
    if (state.route?.type === 'share' && state.sharePayload) {
        if (state.sharePayload.quoteSlug) {
            return { type: 'quote', quoteSlug: state.sharePayload.quoteSlug };
        }
        if (state.sharePayload.brand) {
            return { type: 'brand', brand: state.sharePayload.brand, productId: state.sharePayload.productId || state.snapshot.product.slug };
        }
    }
    return null;
}

async function fetchEmbeddedPublicConfirmation() {
    if (!hasEmbeddedQuoteConfirmation()) {
        state.publicConfirmation = {
            loading: false,
            payload: null,
            error: '',
            submitting: false,
            submitted: false,
            confirmed: false,
            note: '',
            result: null,
        };
        return;
    }
    const client = getClient();
    if (!client) return;
    const next = publicConfirmationParams();
    state.publicConfirmation.loading = true;
    state.publicConfirmation.error = '';
    state.publicConfirmation.result = null;
    try {
        const { data, error } = await client.rpc('get_public_quote_stage_confirmation', {
            stage_slug: next.stage,
            stage_token: next.token,
        });
        if (error) throw error;
        const row = Array.isArray(data) ? data[0] : null;
        if (!row || text(row.stage_key) !== 'quote_confirmed') {
            throw new Error('The quote confirmation request is no longer available.');
        }
        if (text(state.route?.quoteSlug) && text(row.quote_public_slug) && text(row.quote_public_slug) !== text(state.route.quoteSlug)) {
            throw new Error('This confirmation request does not match the current quote page.');
        }
        state.publicConfirmation.payload = row;
        state.publicConfirmation.error = '';
        state.publicConfirmation.submitted = Boolean(text(row.stage_status) === 'completed' || row.completed_at);
        state.publicConfirmation.confirmed = state.publicConfirmation.submitted;
        state.publicConfirmation.note = '';
        state.publicConfirmation.result = state.publicConfirmation.submitted
            ? {
                error: false,
                message: localeCopy({
                    zh: '这份报价确认单已经提交，无需重复操作。',
                    en: 'This quote confirmation has already been submitted.',
                    ru: 'Это подтверждение报价已提交。',
                }),
            }
            : null;
    } catch (error) {
        state.publicConfirmation.payload = null;
        state.publicConfirmation.error = text(error?.message, 'Failed to load quote confirmation.');
    } finally {
        state.publicConfirmation.loading = false;
    }
}

function quoteConfirmationPanelMarkup() {
    if (!hasEmbeddedQuoteConfirmation()) return '';
    const confirmation = state.publicConfirmation || {};
    if (confirmation.loading) {
        return `
            <section class="quote-confirm-card">
                <div class="quote-confirm-card__head">
                    <div>
                        <div class="quote-confirm-card__kicker">QUOTE CONFIRM</div>
                        <h3>正在加载报价确认</h3>
                        <p>正在检查这份报价是否需要客户确认，请稍候。</p>
                    </div>
                </div>
            </section>
        `;
    }
    if (confirmation.error) {
        return `
            <section class="quote-confirm-card is-muted">
                <div class="quote-confirm-card__head">
                    <div>
                        <div class="quote-confirm-card__kicker">QUOTE CONFIRM</div>
                        <h3>报价确认入口不可用</h3>
                        <p>${esc(confirmation.error)}</p>
                    </div>
                </div>
            </section>
        `;
    }
    const payload = confirmation.payload || {};
    const terms = text(payload.meta?.quote_terms);
    return `
        <section class="quote-confirm-card ${confirmation.submitted ? 'is-success' : ''}">
            <div class="quote-confirm-card__head">
                <div>
                    <div class="quote-confirm-card__kicker">QUOTE CONFIRM</div>
                    <h3>确认当前报价并进入合同阶段</h3>
                    <p>请在看完这份报价后，直接在这里确认。提交后 GasGx 会自动把流程推进到签约合同，并保留完整确认记录。</p>
                </div>
                <div class="quote-confirm-card__badge">${confirmation.submitted ? '已提交' : '待确认'}</div>
            </div>
            ${terms ? `
                <div class="quote-confirm-card__terms">
                    <strong>本次确认条款</strong>
                    <p>${esc(terms)}</p>
                </div>
            ` : ''}
            <label class="quote-confirm-card__checkbox ${confirmation.submitted ? 'is-disabled' : ''}">
                <input id="quote-confirm-checkbox" type="checkbox" ${confirmation.confirmed ? 'checked' : ''} ${confirmation.submitted ? 'disabled' : ''}>
                <span>我已确认当前报价版本、商务条款、交付范围与说明，可进入合同阶段。</span>
            </label>
            <label class="quote-confirm-card__field">
                <span>客户确认备注</span>
                <textarea id="quote-confirm-note" class="share-input" rows="4" placeholder="如需补充备注、说明最终确认条件或额外要求，请写在这里。" ${confirmation.submitted ? 'disabled' : ''}>${esc(confirmation.note || '')}</textarea>
            </label>
            <div class="quote-confirm-card__foot">
                <div class="quote-confirm-card__hint">
                    <strong>提交结果会同步到后台</strong>
                    <p>销售可立即在确认报价节点看到这次客户确认，并继续进入合同处理。</p>
                </div>
                <button id="quote-confirm-submit" type="button" class="btn-glow px-5 py-3 inline-flex items-center gap-2" ${confirmation.submitting || confirmation.submitted ? 'disabled' : ''}>
                    <i class="fa-solid fa-paper-plane"></i>
                    <span>${confirmation.submitted ? '已提交' : confirmation.submitting ? '提交中...' : '提交报价确认'}</span>
                </button>
            </div>
            <div class="quote-confirm-card__status ${confirmation.result?.error ? 'is-error' : ''}">${esc(text(confirmation.result?.message))}</div>
        </section>
    `;
}

async function submitEmbeddedPublicConfirmation() {
    const confirmation = state.publicConfirmation || {};
    const next = publicConfirmationParams();
    if (!confirmation.payload || !next.stage || !next.token) return;
    if (!confirmation.confirmed) {
        state.publicConfirmation.result = {
            error: true,
            message: localeCopy({
                zh: '请先勾选确认，再提交报价确认。',
                en: 'Check the confirmation box before submitting.',
                ru: 'Сначала отметьте подтверждение.',
            }),
        };
        renderAll();
        byId('quote-confirm-checkbox')?.focus();
        return;
    }
    state.publicConfirmation.submitting = true;
    state.publicConfirmation.result = null;
    renderAll();
    try {
        const client = getClient();
        if (!client) throw new Error('Supabase client is unavailable.');
        const { data, error } = await client.rpc('submit_public_quote_stage_confirmation', {
            stage_slug: next.stage,
            stage_token: next.token,
            payload: {
                note: text(confirmation.note),
                stage_key: 'quote_confirmed',
            },
        });
        if (error) throw error;
        const row = Array.isArray(data) ? data[0] : null;
        state.publicConfirmation.submitting = false;
        state.publicConfirmation.submitted = true;
        state.publicConfirmation.confirmed = true;
        state.publicConfirmation.result = {
            error: false,
            message: localeCopy({
                zh: `报价确认已提交，GasGx 将自动进入下一阶段：${text(row?.next_stage, 'contract_signed')}。`,
                en: `Quote confirmation submitted. GasGx will continue to the next stage: ${text(row?.next_stage, 'contract_signed')}.`,
                ru: `Подтверждение报价已提交。Следующий этап: ${text(row?.next_stage, 'contract_signed')}.`,
            }),
        };
        try {
            const customerId = text(state.snapshot?.quote?.customerId);
            const instanceId = text(state.snapshot?.quote?.id);
            if (customerId && instanceId) {
                await client.from(TABLE_CUSTOMER_ACTIVITIES).insert({
                    customer_id: customerId,
                    instance_id: instanceId,
                    stage_key: 'quote_confirmed',
                    actor_type: 'customer',
                    actor_label: 'Customer',
                    activity_type: 'status_change',
                    entity_type: 'quote_instance',
                    entity_id: instanceId,
                    page_key: 'quote-instances',
                    action_label: '客户确认报价',
                    detail_json: {
                        next_stage: text(row?.next_stage, 'contract_signed'),
                        note: text(confirmation.note),
                    },
                });
            }
        } catch (_error) {
            // Best-effort timeline logging only.
        }
        renderAll();
    } catch (error) {
        state.publicConfirmation.submitting = false;
        state.publicConfirmation.result = {
            error: true,
            message: text(error?.message, 'Failed to submit quote confirmation.'),
        };
        renderAll();
    }
}

function applySnapshot(snapshot) {
    state.snapshot = snapshot;
    prepareQuoteBehaviorTracking();
    state.galleryIndex = 0;
    state.currentLang = normalizeLang(params.get('lang') || snapshot?.quote?.defaultLang || snapshot?.product?.default_lang || DEFAULT_LANG);
    state.rates = normalizeRates(snapshot?.quote?.rates || snapshot?.product?.default_rates || DEFAULT_RATES);
    state.rateStatusMode = 'online';
    state.rateDetail = { message: '', tone: 'muted' };
    state.shareTarget = deriveShareTarget();
    bodyReadonly(!state.isAdmin);
    renderAll();
    startClock();
    updateBackToTop();
}

function openAccessOverlay() {
    const overlay = byId('access-gate-overlay');
    if (overlay) overlay.classList.remove('hidden');
}

function closeAccessOverlay() {
    const overlay = byId('access-gate-overlay');
    if (overlay) overlay.classList.add('hidden');
}

function setAccessOverlay({
    title,
    message,
    icon = 'fa-circle-info',
    help = '',
    meta = '',
    showRefresh = true,
    showPasscode = false,
} = {}) {
    openAccessOverlay();
    const iconNode = byId('access-gate-icon');
    if (iconNode) iconNode.className = `fa-solid ${icon}`;
    byId('access-gate-title').textContent = text(title);
    byId('access-gate-message').textContent = text(message);
    const helpNode = byId('access-gate-help');
    if (helpNode) {
        helpNode.textContent = text(help);
        helpNode.classList.toggle('hidden', !help);
    }
    byId('access-gate-meta').textContent = text(meta);
    byId('access-gate-actions').classList.toggle('hidden', !showRefresh && !showPasscode);
    byId('access-passcode-wrap').classList.toggle('hidden', !showPasscode);
    byId('access-gate-refresh').classList.toggle('hidden', !showRefresh);
    if (!showPasscode) {
        byId('access-passcode-input').value = '';
        byId('access-passcode-status').textContent = '';
    }
}

async function resolveSharedSnapshot(token) {
    const unsigned = parseUnsignedPayload(token);
    if (!unsigned) return { status: 'invalid' };

    let snapshot = null;
    if (unsigned.quoteSlug) {
        snapshot = await fetchPublishedQuoteBySlug(unsigned.quoteSlug);
    } else if (unsigned.brand) {
        snapshot = await resolveSnapshotFromBrand(unsigned.brand, unsigned.productId || '');
    }
    if (!snapshot) return { status: 'not-found' };

    const verified = await decodeSignedPayload(token, text(snapshot.brand?.share_signing_secret, DEFAULT_SHARE_SECRET));
    if (!verified.valid || !verified.payload) return { status: 'invalid' };

    const payload = verified.payload;
    const expiresAtMs = payload.expiresAt ? Date.parse(payload.expiresAt) : NaN;
    if (Number.isFinite(expiresAtMs) && expiresAtMs <= Date.now() && !state.isAdmin) {
        return { status: 'expired', snapshot, payload, signaturePart: verified.signaturePart };
    }

    const passcode = text(payload.passcode).toUpperCase();
    if (passcode && !state.isAdmin) {
        const unlocked = text(readUnlockedPasscode(snapshot.brand?.share_unlock_prefix, verified.signaturePart)).toUpperCase();
        if (unlocked !== passcode) {
            return { status: 'passcode', snapshot, payload, signaturePart: verified.signaturePart };
        }
    }

    return { status: 'allowed', snapshot, payload, signaturePart: verified.signaturePart };
}

async function handlePasscodeSubmit() {
    const pending = state.pendingSharedAccess;
    if (!pending) return;
    const input = byId('access-passcode-input');
    const statusNode = byId('access-passcode-status');
    const candidate = text(input?.value).toUpperCase();
    if (candidate === text(pending.payload?.passcode).toUpperCase()) {
        persistUnlockedPasscode(pending.snapshot.brand?.share_unlock_prefix, pending.signaturePart, candidate);
        state.sharePayload = pending.payload;
        state.pendingSharedAccess = null;
        closeAccessOverlay();
        applySnapshot(pending.snapshot);
        await fetchEmbeddedPublicConfirmation();
        renderAll();
        void logQuoteEvent('passcode_unlocked', {
            accessMode: 'share',
            shareToken: state.route?.token,
            shareExpiresAt: pending.payload?.expiresAt || '',
            metadata: {
                passcodeProtected: true,
                ...(pending.payload?.shareMeta && typeof pending.payload.shareMeta === 'object' ? pending.payload.shareMeta : {}),
            },
        });
            void logQuoteEvent('share_opened', {
                accessMode: 'share',
                shareToken: state.route?.token,
                shareExpiresAt: pending.payload?.expiresAt || '',
                metadata: {
                    visitType: state.quoteBehavior.visitType,
                    visitCount: state.quoteBehavior.visitCount,
                    unlockedByPasscode: true,
                    ...(pending.payload?.shareMeta && typeof pending.payload.shareMeta === 'object' ? pending.payload.shareMeta : {}),
                },
            });
        await fetchRates(false);
        return;
    }
    if (statusNode) {
        statusNode.textContent = t('accessPasscodeError');
        statusNode.style.color = '#fca5a5';
    }
}

async function resolveRouteSnapshot() {
    if (state.route.type === 'preview') {
        if (!state.isAdmin) {
            setAccessOverlay({
                title: t('accessDeniedTitle'),
                message: t('accessDeniedMessage'),
                icon: 'fa-lock',
                showRefresh: true,
            });
            return false;
        }
        setAccessOverlay({
            title: t('accessCheckingTitle'),
            message: t('accessCheckingMessage'),
            icon: 'fa-spinner fa-spin',
            meta: t('shareMetaAdmin'),
            showRefresh: false,
        });
        const snapshot = await fetchPreviewQuote(state.route.previewId);
        if (!snapshot) {
            setAccessOverlay({
                title: t('notFoundTitle'),
                message: t('notFoundMessage'),
                icon: 'fa-circle-exclamation',
                showRefresh: true,
            });
            return false;
        }
        closeAccessOverlay();
        applySnapshot(snapshot);
        await fetchEmbeddedPublicConfirmation();
        renderAll();
        void logQuoteEvent('preview_opened', {
            accessMode: 'preview',
            metadata: {
                previewId: state.route.previewId,
            },
        });
        await fetchRates(false);
        return true;
    }

    if (state.route.type === 'share') {
        setAccessOverlay({
            title: t('accessCheckingTitle'),
            message: t('accessCheckingMessage'),
            icon: 'fa-spinner fa-spin',
            showRefresh: false,
        });
        const result = await resolveSharedSnapshot(state.route.token);
        if (result.status === 'allowed') {
            state.sharePayload = result.payload;
            closeAccessOverlay();
            applySnapshot(result.snapshot);
            await fetchEmbeddedPublicConfirmation();
            renderAll();
            void logQuoteEvent('share_opened', {
                accessMode: 'share',
                shareToken: state.route.token,
                shareExpiresAt: result.payload?.expiresAt || '',
                metadata: {
                    visitType: state.quoteBehavior.visitType,
                    visitCount: state.quoteBehavior.visitCount,
                    passcodeProtected: Boolean(result.payload?.passcode),
                    ...(result.payload?.shareMeta && typeof result.payload.shareMeta === 'object' ? result.payload.shareMeta : {}),
                },
            });
            await fetchRates(false);
            return true;
        }
        if (result.status === 'passcode') {
            state.pendingSharedAccess = result;
            setAccessOverlay({
                title: t('accessPasscodeTitle'),
                message: t('accessPasscodeMessage'),
                icon: 'fa-lock',
                meta: result.payload?.expiresAt ? `${t('shareMetaMode')} | ${t('shareMetaExpired')}${new Date(result.payload.expiresAt).toLocaleString()}` : t('shareMetaMode'),
                showRefresh: true,
                showPasscode: true,
            });
            return false;
        }
        if (result.status === 'expired') {
            setAccessOverlay({
                title: t('accessDeniedTitle'),
                message: t('accessExpired'),
                icon: 'fa-clock',
                meta: result.payload?.expiresAt ? `${t('shareMetaExpired')}${new Date(result.payload.expiresAt).toLocaleString()}` : '',
                showRefresh: true,
            });
            return false;
        }
        if (result.status === 'not-found') {
            setAccessOverlay({
                title: t('notFoundTitle'),
                message: t('notFoundMessage'),
                icon: 'fa-circle-exclamation',
                showRefresh: true,
            });
            return false;
        }
        setAccessOverlay({
            title: t('accessDeniedTitle'),
            message: t('accessInvalid'),
            icon: 'fa-triangle-exclamation',
            showRefresh: true,
        });
        return false;
    }

    if (state.route.type === 'quote') {
        const snapshot = await fetchPublishedQuoteBySlug(state.route.quoteSlug);
        if (!snapshot) {
            setAccessOverlay({
                title: t('notFoundTitle'),
                message: t('notFoundMessage'),
                icon: 'fa-circle-exclamation',
                showRefresh: true,
            });
            return false;
        }
        closeAccessOverlay();
        applySnapshot(snapshot);
        await fetchEmbeddedPublicConfirmation();
        renderAll();
        void logQuoteEvent('quote_viewed', {
            accessMode: state.isAdmin ? 'admin' : 'quote',
            metadata: {
                visitType: state.quoteBehavior.visitType,
                visitCount: state.quoteBehavior.visitCount,
                quoteSlug: state.route.quoteSlug,
            },
        });
        await fetchRates(false);
        return true;
    }

    const snapshot = await resolveSnapshotFromBrand(state.route.brand, state.route.productId);
    if (!snapshot) {
        setAccessOverlay({
            title: t('notFoundTitle'),
            message: t('notFoundMessage'),
            icon: 'fa-circle-exclamation',
            showRefresh: true,
        });
        return false;
    }
    closeAccessOverlay();
    applySnapshot(snapshot);
    await fetchEmbeddedPublicConfirmation();
    renderAll();
    void logQuoteEvent('quote_viewed', {
        accessMode: state.isAdmin ? 'admin' : 'quote',
        metadata: {
            visitType: state.quoteBehavior.visitType,
            visitCount: state.quoteBehavior.visitCount,
            brand: state.route.brand,
            productId: state.route.productId || '',
        },
    });
    await fetchRates(false);
    return true;
}

function bindEvents() {
    byId('btn-auth')?.addEventListener('click', () => {
        if (state.isLoggedIn) {
            window.location.href = getAuthConfig().accountUrl;
            return;
        }
        redirectToSignIn();
    });
    byId('btn-zh')?.addEventListener('click', () => {
        state.currentLang = 'zh';
        renderAll();
        renderClock();
        syncShareExpiryUi();
    });
    byId('btn-en')?.addEventListener('click', () => {
        state.currentLang = 'en';
        renderAll();
        renderClock();
        syncShareExpiryUi();
    });
    byId('btn-ru')?.addEventListener('click', () => {
        state.currentLang = 'ru';
        renderAll();
        renderClock();
        syncShareExpiryUi();
    });

    byId('btn-refresh-rates')?.addEventListener('click', () => {
        void fetchRates(true);
    });
    byId('btn-send')?.addEventListener('click', sendEmail);
    byId('btn-menu-img-wrap')?.addEventListener('click', () => {
        void exportImage();
    });
    byId('btn-menu-pdf-wrap')?.addEventListener('click', () => {
        void exportPdf();
    });
    byId('btn-menu-share-link-wrap')?.addEventListener('click', openShareModal);
    byId('btn-share')?.addEventListener('click', toggleShareMenu);
    byId('btn-auth-modal-close')?.addEventListener('click', closeAuthModal);
    byId('btn-auth-modal-cancel')?.addEventListener('click', closeAuthModal);
    byId('btn-auth-modal-login')?.addEventListener('click', () => {
        closeAuthModal();
        if (state.isLoggedIn) {
            window.location.href = getAuthConfig().accountUrl;
            return;
        }
        redirectToSignIn();
    });
    byId('btn-share-modal-close')?.addEventListener('click', closeShareModal);
    byId('btn-share-close')?.addEventListener('click', closeShareModal);
    byId('share-expiry-select')?.addEventListener('change', syncShareExpiryUi);
    byId('share-custom-expiry')?.addEventListener('input', syncShareExpiryUi);
    byId('btn-share-custom-expiry-picker')?.addEventListener('click', () => {
        const input = byId('share-custom-expiry');
        if (!input) return;
        if (typeof input.showPicker === 'function') {
            input.showPicker();
            return;
        }
        input.focus();
    });
    byId('btn-generate-share')?.addEventListener('click', () => {
        void generateShareLink();
    });
    byId('back-to-top')?.addEventListener('click', scrollToTop);
    byId('access-passcode-submit')?.addEventListener('click', () => {
        void handlePasscodeSubmit();
    });
    byId('access-passcode-input')?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            void handlePasscodeSubmit();
        }
    });
    byId('access-gate-refresh')?.addEventListener('click', () => {
        window.location.reload();
    });

    document.addEventListener('click', (event) => {
        const shareGroup = byId('share-group');
        if (!shareGroup || shareGroup.contains(event.target)) return;
        closeShareMenu();
    });

    document.addEventListener('click', (event) => {
        if (event.target === byId('auth-modal')) closeAuthModal();
        if (event.target === byId('share-modal')) closeShareModal();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        closeShareMenu();
        closeAuthModal();
        closeShareModal();
    });

    window.addEventListener('resize', () => {
        if (!isMobileViewport()) closeShareMenu();
    });
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flushQuoteBehaviorSummary();
    });
    window.addEventListener('pagehide', () => {
        flushQuoteBehaviorSummary();
    });
}

async function init() {
    bindEvents();
    state.route = resolveInitialRoute();
    const access = await resolveAdminSession();
    state.isLoggedIn = access.isLoggedIn === true;
    state.isAdmin = access.allowed === true;
    state.adminUser = access.user;
    bodyReadonly(!state.isAdmin);
    const resolved = await resolveRouteSnapshot();
    if (resolved) {
        closeAccessOverlay();
    }
}

void init();
