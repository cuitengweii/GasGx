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
    normalizeLangCode,
    normalizeRates,
    normalizeShareConfig,
    normalizeShareHistoryEntry,
    sortMediaItems,
} from './quote-data.module.js?v=20260711service03';

const SUPABASE_URL = window.AMS_SUPABASE_URL || 'https://mkpcliytqudclkwtewru.supabase.co';
const SUPABASE_KEY = window.AMS_SUPABASE_KEY || 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';
const ADMIN_EMAILS = ['cuitengwei@gasgx.com'];
const RATE_API_URL = 'https://open.er-api.com/v6/latest/CNY';
const TABLE_INSTANCES = 'quote_instances';
const TABLE_INSTANCE_EVENTS = 'quote_instance_events';
const TABLE_INSTANCE_SENDS = 'quote_instance_sends';
const TABLE_CUSTOMER_ACTIVITIES = 'quote_customer_activities';

const sharedUiDict = {
    supplier: 'SUPPLIER:',
    sender: 'SENDER:',
    receiver: 'RECEIVER:',
    validity: 'VALIDITY:',
    update: 'SYS_TIME_SYNC',
    included: 'Included',
    mainConfig: 'Main Config',
    servicePackage: 'Service Package',
    optionalConfig: 'Optional Config',
    systemTotal: 'EST. SYSTEM TOTAL',
    pricingBreakdown: 'PRICE BREAKDOWN',
    pricingFormula: 'CALCULATION',
    mainTotal: 'Main configuration total',
    optionalIncrease: 'Optional additions',
    serviceTotal: 'Service package total',
    optionalSelect: 'Include in quote',
    headers: ['SEQ', 'DESCRIPTION', 'BRAND', 'QTY', 'RMB (?)', 'USD ($)'],
    ratesOnline: 'GLOBAL LIVE RATES',
    ratesRefreshing: 'Refreshing...',
    ratesFallback: 'Rate fetch failed, using saved snapshot.',
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
    exportLibraryMissing: 'Export tools are still loading. Refresh the page and try again.',
    receiverPlaceholder: 'Enter customer email',
    customerName: 'CUSTOMER:',
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
    emailInvalid: 'Enter a valid customer email first.',
    sendQuote: 'Send quotation',
    sendQuoteBusy: 'Preparing email...',
    sendQuoteSuccess: 'Customer record saved. Your email client is ready to send the quotation.',
    sendQuoteError: 'The quotation could not be prepared. Try again later.',
    sendQuoteHint: 'The send action opens your email client with the quotation link and sales record is saved automatically.',
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
    authActionConfirm: 'Quote confirmation',
    quoteConfirmLoginRequired: 'Sign in before submitting quote confirmation.',
    quoteConfirmEmailRequired: 'Set the customer email on the customer archive or quote first.',
    quoteConfirmEmailMismatch: 'You are signed in as {actual}. Only the registered customer email {expected} can submit this quote confirmation.',
    quoteConfirmHintMatched: 'The signed-in account matches the registered customer email and can submit confirmation.',
    quoteConfirmHintLogin: 'Sign in with the customer email registered on this quote before submitting.',
    tableSwipeHint: 'Swipe sideways on mobile to review the full pricing table',
};

const dict = {
    zh: {
        ...sharedUiDict,
        supplier: '供应商：',
        sender: '发件人：',
        receiver: '收件人：',
        validity: '报价有效期：',
        update: '系统时间同步',
        included: '包含',
        mainConfig: '主配置',
        servicePackage: '服务包',
        optionalConfig: '选配',
        systemTotal: '系统预估总价',
        pricingBreakdown: '报价构成',
        pricingFormula: '计算过程',
        mainTotal: '主配总价',
        optionalIncrease: '选配增加',
        serviceTotal: '服务包总价',
        optionalSelect: '计入报价',
        headers: ['序号', '模块描述', '规格品牌', '数量', '人民币 (¥)', '美元 ($)'],
        ratesOnline: '全球实时汇率在线',
        ratesRefreshing: '正在刷新...',
        ratesFallback: '汇率获取失败，使用本地快照。',
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
        exportLibraryMissing: '导出工具还未加载完成，请刷新页面后重试。',
        receiverPlaceholder: '请输入客户邮箱',
        customerName: '客户名称：',
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
        noEmail: '请先维护客户邮箱。',
        emailInvalid: '请输入格式正确的客户邮箱。',
        sendQuote: '发送报价邮件',
        sendQuoteBusy: '正在准备邮件...',
        sendQuoteSuccess: '客户档案已保存，邮件客户端已打开，请确认发送报价。',
        sendQuoteError: '报价邮件准备失败，请稍后重试。',
        sendQuoteHint: '点击后会调起本机邮件客户端并带入报价链接，同时自动保存销售客户档案。',
        authModalTitle: '需要登录',
        authModalMessage: '登录后才能继续使用受保护的报价操作。',
        authModalHint: '当前浏览不会中断。登录完成后会自动回到这份报价。',
        authModalLogin: '立即登录',
        authModalCancel: '继续浏览',
        authProtectedAction: '受保护操作',
        authActionShare: '分享 / 导出',
        authActionSend: '发送邮件',
        authActionImage: '导出图片',
        authActionPdf: '导出 PDF',
        authActionLink: '创建分享链接',
        authActionConfirm: '报价确认',
        quoteConfirmLoginRequired: '提交报价确认前请先登录。',
        quoteConfirmEmailRequired: '请先在客户档案或报价单里维护客户邮箱。',
        quoteConfirmEmailMismatch: '当前登录账号为 {actual}。只有登记的客户邮箱 {expected} 才能提交这份报价确认。',
        quoteConfirmHintMatched: '当前登录账号与登记的客户邮箱一致，可以提交确认。',
        quoteConfirmHintLogin: '请使用报价中登记的客户邮箱登录后再提交。',
        tableSwipeHint: '移动端可左右滑动查看完整报价表',
    },
    en: {
        ...sharedUiDict,
    },
    ru: {
        ...sharedUiDict,
        supplier: 'Поставщик:',
        sender: 'Отправитель:',
        receiver: 'Получатель:',
        validity: 'Срок действия предложения:',
        update: 'Синхронизация системного времени',
        included: 'Включено',
        mainConfig: 'Основная конфигурация',
        servicePackage: 'Сервисный пакет',
        optionalConfig: 'Дополнительная конфигурация',
        systemTotal: 'Расчётная общая стоимость системы',
        pricingBreakdown: 'Состав стоимости',
        pricingFormula: 'Расчёт',
        mainTotal: 'Стоимость основной конфигурации',
        optionalIncrease: 'Дополнительные опции',
        serviceTotal: 'Стоимость сервисного пакета',
        optionalSelect: 'Включить в предложение',
        headers: ['№', 'Описание модуля', 'Спецификация / бренд', 'Кол-во', 'RMB (¥)', 'USD ($)'],
        ratesOnline: 'Актуальные мировые курсы валют',
        ratesRefreshing: 'Обновление курсов...',
        ratesFallback: 'Не удалось получить курсы, используется сохранённый снимок.',
        refresh: 'Обновить курсы',
        send: 'Отправить',
        share: 'Поделиться / экспорт',
        shareLink: 'Создать ссылку',
        exportImage: 'Создать длинное изображение',
        exportPdf: 'Экспортировать PDF',
        shareTitle: 'Создание ссылки',
        shareDesc: 'Настройте срок действия и код доступа для ссылки клиента. Авторизованные администраторы всегда могут открыть эту страницу.',
        shareExpiryLabel: 'Срок действия ссылки',
        shareExpiry1d: '1 день',
        shareExpiry3d: '3 дня',
        shareExpiry7d: '7 дней',
        shareExpiryNever: 'Без ограничения срока',
        shareExpiryCustom: 'Указать срок',
        shareCustomLabel: 'Пользовательский срок',
        shareCustomPicker: 'Выбрать время',
        shareAdminHint: 'Сессии администраторов сайта не ограничиваются сроком ссылки.',
        sharePasscodeLabel: 'Код доступа',
        sharePasscodePlaceholder: 'Создаётся автоматически',
        shareLinkLabel: 'Ссылка',
        shareLinkPlaceholder: 'Создайте ссылку ниже',
        shareGenerate: 'Создать и скопировать ссылку',
        shareClose: 'Закрыть',
        sharePreviewDefault: 'По умолчанию ссылка действует 3 дня.',
        sharePreviewAdmin: 'Авторизованные администраторы могут открыть страницу после истечения срока ссылки.',
        shareCopySuccess: 'Ссылка скопирована',
        shareCopyFallback: 'Ссылка создана. Скопируйте её вручную.',
        shareAdminOnly: 'Только авторизованные администраторы могут создавать ссылки.',
        shareCustomRequired: 'Сначала укажите корректный срок действия.',
        shareCustomExpired: 'Срок действия должен быть позже текущего времени.',
        shareUnavailable: 'Для этой страницы пока нет опубликованного предложения.',
        shareGenerateError: 'Не удалось создать ссылку. Повторите попытку позже.',
        accessBadge: 'Защищённый доступ',
        accessCheckingTitle: 'Проверка доступа...',
        accessCheckingMessage: 'Проверяем ссылку и сессию администратора.',
        accessInvalid: 'Ссылка недействительна или повреждена. Создайте новую ссылку.',
        accessExpired: 'Срок действия ссылки истёк.',
        accessPasscodeTitle: 'Требуется код доступа',
        accessPasscodeMessage: 'Введите 4-значный код доступа, чтобы продолжить.',
        accessPasscodeLabel: 'Код доступа',
        accessPasscodeSubmit: 'Разблокировать',
        accessPasscodeError: 'Неверный код доступа.',
        accessDeniedTitle: 'Предпросмотр недоступен',
        accessDeniedMessage: 'Предпросмотр черновика доступен только авторизованным администраторам.',
        accessRefresh: 'Проверить ещё раз',
        notFoundTitle: 'Предложение не найдено',
        notFoundMessage: 'По этой ссылке нет опубликованного предложения.',
        loading: 'Загрузка...',
        exportLoading: 'Формирование документа...',
        exportSubText: 'Подготавливаем документ высокого качества.',
        exportLibraryMissing: 'Инструменты экспорта ещё загружаются. Обновите страницу и повторите попытку.',
        receiverPlaceholder: 'Введите email клиента',
        customerName: 'Клиент:',
        days: 'д',
        hours: 'ч',
        minutes: 'мин',
        seconds: 'с',
        galleryTitle: 'Галерея продукта',
        galleryPrev: 'Предыдущее изображение',
        galleryNext: 'Следующее изображение',
        galleryModeCarousel: 'Карусель',
        galleryModeStack: 'Галерея',
        shareMetaMode: 'Режим: ссылка',
        shareMetaAdmin: 'Режим: предпросмотр администратора',
        shareMetaExpired: 'Срок действия: ',
        shareMetaNever: 'Без ограничения срока',
        unknownBrand: 'Система коммерческих предложений',
        noEmail: 'Сначала укажите email клиента.',
        emailInvalid: 'Введите корректный email клиента.',
        sendQuote: 'Отправить предложение',
        sendQuoteBusy: 'Подготовка письма...',
        sendQuoteSuccess: 'Карточка клиента сохранена. Почтовый клиент готов к отправке предложения.',
        sendQuoteError: 'Не удалось подготовить письмо. Повторите попытку позже.',
        sendQuoteHint: 'Откроется почтовый клиент со ссылкой на предложение, а карточка клиента сохранится автоматически.',
        authLogin: 'Войти',
        authAccount: 'Аккаунт',
        authModalTitle: 'Требуется вход',
        authModalMessage: 'Войдите, чтобы продолжить защищённые действия с предложением.',
        authModalHint: 'Просмотр останется доступным. После входа вы вернётесь к этому предложению.',
        authModalLogin: 'Войти сейчас',
        authModalCancel: 'Продолжить просмотр',
        authProtectedAction: 'Защищённое действие',
        authActionShare: 'Поделиться / экспорт',
        authActionSend: 'Отправить email',
        authActionImage: 'Экспорт изображения',
        authActionPdf: 'Экспорт PDF',
        authActionLink: 'Создать ссылку',
        authActionConfirm: 'Подтверждение предложения',
        quoteConfirmLoginRequired: 'Перед подтверждением войдите в систему.',
        quoteConfirmEmailRequired: 'Сначала укажите email клиента в карточке клиента или предложении.',
        quoteConfirmEmailMismatch: 'Текущий аккаунт: {actual}. Для подтверждения используйте зарегистрированный email: {expected}.',
        quoteConfirmHintMatched: 'Email аккаунта совпадает с зарегистрированным email клиента.',
        quoteConfirmHintLogin: 'Войдите с email клиента, указанным в предложении.',
        tableSwipeHint: 'На мобильном устройстве проведите по таблице в сторону, чтобы увидеть все цены.',
    },
};

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
    authResolved: false,
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
        alertShownSignature: '',
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

const PRODUCTION_PROGRESS_STEPS = Object.freeze([
    { key: 'production_step_plan', label: { zh: '排程确认', en: 'Planning confirmed', ru: 'Планирование подтверждено' } },
    { key: 'production_step_material', label: { zh: '物料齐套', en: 'Materials ready', ru: 'Материалы готовы' } },
    { key: 'production_step_assembly', label: { zh: '产线组装', en: 'Assembly', ru: 'Сборка' } },
    { key: 'production_step_test', label: { zh: '联调测试', en: 'Integrated testing', ru: 'Комплексное тестирование' } },
    { key: 'production_step_ready', label: { zh: '待验收', en: 'Ready for FAT', ru: 'Готово к FAT' } },
]);

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

function embeddedPublicStageKey() {
    return text(state.publicConfirmation?.payload?.stage_key);
}

function isEmbeddedProductionProgressStage() {
    return embeddedPublicStageKey() === 'production_scheduled';
}

function productionProgressMetaValue(payload = {}, key = '', fallback = '') {
    const meta = payload?.meta && typeof payload.meta === 'object' ? payload.meta : {};
    return text(meta[key], fallback);
}

function productionProgressStatusLabel(value = '') {
    const status = text(value, 'pending');
    if (status === 'completed') return localeCopy({ zh: '已完成', en: 'Completed', ru: 'Завершено' });
    if (status === 'in_progress') return localeCopy({ zh: '进行中', en: 'In progress', ru: 'В процессе' });
    if (status === 'delayed') return localeCopy({ zh: '延误', en: 'Delayed', ru: 'Задержка' });
    return localeCopy({ zh: '待开始', en: 'Pending', ru: 'Ожидается' });
}

function productionProgressStatusClass(value = '') {
    const status = text(value, 'pending');
    if (status === 'completed') return 'is-completed';
    if (status === 'in_progress') return 'is-active';
    if (status === 'delayed') return 'is-delayed';
    return 'is-pending';
}

function productionProgressPanelMarkup(payload = {}) {
    const scheduleStatus = productionProgressMetaValue(payload, 'production_schedule_status', '--');
    const scheduleEta = productionProgressMetaValue(payload, 'production_eta', '--');
    const factoryName = productionProgressMetaValue(payload, 'factory_name', '--');
    const batch = productionProgressMetaValue(payload, 'production_batch', '--');
    const delayReason = productionProgressMetaValue(payload, 'production_delay_reason');
    return `
        <section class="quote-confirm-card is-muted quote-production-card">
            <div class="quote-confirm-card__head">
                <div>
                    <div class="quote-confirm-card__kicker">PRODUCTION PROGRESS</div>
                    <h3>${esc(localeCopy({ zh: '生产进度同步', en: 'Production Progress', ru: 'Прогресс производства' }))}</h3>
                    <p>${esc(localeCopy({
                        zh: '该链接用于客户查看排产阶段的最新进度，销售会根据工厂反馈持续更新。',
                        en: 'This link shows the latest production progress. Sales will keep it updated based on factory feedback.',
                        ru: 'Эта ссылка показывает актуальный прогресс производства. Отдел продаж обновляет данные по информации завода.',
                    }))}</p>
                </div>
                <div class="quote-confirm-card__badge">${esc(productionProgressStatusLabel(scheduleStatus))}</div>
            </div>
            <div class="quote-production-meta-grid">
                <span><strong>${esc(localeCopy({ zh: '工厂/产线', en: 'Factory/Line', ru: 'Завод / линия' }))}</strong>${esc(factoryName)}</span>
                <span><strong>${esc(localeCopy({ zh: '批次', en: 'Batch', ru: 'Партия' }))}</strong>${esc(batch)}</span>
                <span><strong>${esc(localeCopy({ zh: '预计完工', en: 'ETA', ru: 'Плановая дата' }))}</strong>${esc(scheduleEta)}</span>
                <span><strong>${esc(localeCopy({ zh: '工期状态', en: 'Schedule', ru: 'Статус графика' }))}</strong>${esc(productionProgressStatusLabel(scheduleStatus))}</span>
            </div>
            ${delayReason ? `<div class="quote-confirm-card__terms"><strong>${esc(localeCopy({ zh: '延误说明', en: 'Delay note', ru: 'Причина задержки' }))}</strong><p>${esc(delayReason)}</p></div>` : ''}
            <div class="quote-production-track">
                ${PRODUCTION_PROGRESS_STEPS.map((step, index) => {
                    const status = productionProgressMetaValue(payload, `${step.key}_status`, 'pending');
                    const date = productionProgressMetaValue(payload, `${step.key}_date`, '--');
                    const note = productionProgressMetaValue(payload, `${step.key}_note`, '--');
                    return `
                        <article class="quote-production-step">
                            <div class="quote-production-step__head">
                                <strong>${esc(`${index + 1}. ${localeCopy(step.label)}`)}</strong>
                                <span class="quote-production-step__status ${productionProgressStatusClass(status)}">${esc(productionProgressStatusLabel(status))}</span>
                            </div>
                            <div class="quote-production-step__meta">
                                <span>${esc(localeCopy({ zh: '更新时间', en: 'Updated', ru: 'Updated' }))}: ${esc(date)}</span>
                                <span>${esc(localeCopy({ zh: '说明', en: 'Note', ru: 'Note' }))}: ${esc(note)}</span>
                            </div>
                        </article>
                    `;
                }).join('')}
            </div>
        </section>
    `;
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

function normalizeEmail(value) {
    return text(value).toLowerCase();
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

function setQuoteEmailStatus(message = '', isError = false) {
    const node = byId('quote-email-status');
    if (!node) return;
    node.textContent = text(message);
    node.classList.toggle('is-error', Boolean(isError));
    node.classList.toggle('is-success', Boolean(message) && !isError);
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
    confirm: { icon: 'fa-file-circle-check', labelKey: 'authActionConfirm' },
});

function getAuthConfig() {
    const helper = window.GasGxMainAuthShared;
    if (helper?.resolveConfig) {
        return helper.resolveConfig(window.GASGX_SITE_SHELL_CONFIG?.site?.mainAuth);
    }
    return {
        storageKey: 'gasgx-main-auth',
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

function buildAccountSalesPath(extraParams = {}) {
    const target = new URL('/account/sales.html', window.location.origin);
    Object.entries(extraParams || {}).forEach(([key, value]) => {
        const normalized = text(value);
        if (!normalized) return;
        target.searchParams.set(key, normalized);
    });
    return `${target.pathname}${target.search}`;
}

async function redirectToAccountSales(extraParams = {}) {
    const config = getAuthConfig();
    const targetPath = buildAccountSalesPath(extraParams);
    try {
        window.sessionStorage.setItem(config.returnUrlStorageKey, targetPath);
    } catch (_error) {
        // Ignore storage errors and continue redirect.
    }
    window.location.href = targetPath;
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
    return candidate.length > 18 ? `${candidate.slice(0, 17)}...` : candidate;
}

function authActionMeta(actionKey = 'share') {
    return AUTH_ACTIONS[actionKey] || AUTH_ACTIONS.share;
}

function openAuthModal(actionKey = 'share') {
    const modal = byId('auth-modal');
    if (!modal) return;
    const action = authActionMeta(actionKey);
    const access = actionKey === 'confirm' ? quoteConfirmationAccessState() : null;
    const expectedEmail = text(access?.expectedEmail);
    const confirmMessage = localeCopy({
        zh: '提交报价确认前，请先使用绑定邮箱登录。',
        en: 'Before submitting quote confirmation, sign in with the bound customer email.',
        ru: 'Перед подтверждением предложения войдите с привязанным email клиента.',
    });
    const confirmHintWithEmail = interpolateCopy(localeCopy({
        zh: '当前绑定邮箱：{expected}。请使用该邮箱登录后再提交确认。',
        en: 'Bound customer email: {expected}. Sign in with this email before submitting confirmation.',
        ru: 'Привязанный email клиента: {expected}. Войдите с этим email перед подтверждением.',
    }), { expected: expectedEmail });
    const confirmHintNoEmail = localeCopy({
        zh: '当前报价尚未设置客户邮箱，请先联系销售补全绑定邮箱。',
        en: 'No customer email is bound to this quote yet. Ask sales to set it first.',
        ru: 'К этому предложению пока не привязан email клиента. Попросите менеджера сначала заполнить его.',
    });
    byId('auth-modal-kicker').textContent = t('authProtectedAction');
    byId('auth-modal-title').textContent = t('authModalTitle');
    byId('auth-modal-message').textContent = actionKey === 'confirm' ? confirmMessage : t('authModalMessage');
    byId('auth-modal-hint').textContent = actionKey === 'confirm'
        ? (expectedEmail ? confirmHintWithEmail : confirmHintNoEmail)
        : t('authModalHint');
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

function openQuoteConfirmAlert(options = {}) {
    const modal = byId('quote-confirm-alert-modal');
    if (!modal) return;
    modal.setAttribute('data-alert-type', text(options.alertType, 'generic'));
    byId('quote-confirm-alert-kicker').textContent = text(options.kicker, localeCopy({
        zh: '报价确认',
        en: 'QUOTE CONFIRM',
        ru: 'ПОДТВЕРЖДЕНИЕ ПРЕДЛОЖЕНИЯ',
    }));
    byId('quote-confirm-alert-title').textContent = text(options.title, localeCopy({
        zh: '当前账号无法提交确认',
        en: 'This account cannot submit confirmation',
        ru: 'Эта учетная запись не может подтвердить предложение',
    }));
    byId('quote-confirm-alert-message').textContent = text(options.message);
    byId('quote-confirm-alert-action').textContent = localeCopy({
        zh: '提交限制',
        en: 'Submission restriction',
        ru: 'Ограничение подтверждения',
    });
    byId('quote-confirm-alert-hint').textContent = text(options.hint, localeCopy({
        zh: '请使用报价中登记的客户邮箱进行确认。',
        en: 'Use the customer email registered on this quote to confirm.',
        ru: 'Используйте email клиента, указанный в этом предложении.',
    }));
    byId('quote-confirm-alert-ack-text').textContent = localeCopy({
        zh: '我知道了',
        en: 'OK',
        ru: 'Понятно',
    });
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeQuoteConfirmAlert() {
    const modal = byId('quote-confirm-alert-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('data-alert-type');
}

function requireSignedIn(actionKey = 'share') {
    if (!state.authResolved) {
        void refreshAuthState({ rerender: true, force: true });
        return false;
    }
    if (state.isLoggedIn) return true;
    closeShareMenu();
    openAuthModal(actionKey);
    return false;
}

function confirmationExpectedEmail() {
    const profile = state.snapshot?.quote?.customerProfile && typeof state.snapshot.quote.customerProfile === 'object'
        ? state.snapshot.quote.customerProfile
        : {};
    return text(
        state.snapshot?.quote?.receiverEmail
        || state.snapshot?.quote?.receiver_email
        || profile.email
        || profile.requester_email
        || profile.contact_email
        || profile.receiver_email,
    ).toLowerCase();
}

function confirmationViewerEmail() {
    return text(state.adminUser?.email).toLowerCase();
}

function interpolateCopy(template = '', values = {}) {
    return text(template).replace(/\{(\w+)\}/g, (_match, key) => text(values[key]));
}

function quoteConfirmationAccessState() {
    const expectedEmail = confirmationExpectedEmail();
    const actualEmail = confirmationViewerEmail();
    if (!expectedEmail) {
        return {
            allowed: false,
            requiresLogin: false,
            expectedEmail,
            actualEmail,
            message: t('quoteConfirmEmailRequired'),
        };
    }
    if (!state.isLoggedIn || !actualEmail) {
        return {
            allowed: false,
            requiresLogin: true,
            expectedEmail,
            actualEmail,
            message: t('quoteConfirmLoginRequired'),
        };
    }
    if (actualEmail !== expectedEmail) {
        return {
            allowed: false,
            requiresLogin: false,
            expectedEmail,
            actualEmail,
            message: interpolateCopy(t('quoteConfirmEmailMismatch'), {
                actual: actualEmail,
                expected: expectedEmail,
            }),
        };
    }
    return {
        allowed: true,
        requiresLogin: false,
        expectedEmail,
        actualEmail,
        message: t('quoteConfirmHintMatched'),
    };
}

function quoteConfirmationAccessAlertSignature(access = {}) {
    return [
        state.currentLang,
        access.requiresLogin ? 'login' : 'restricted',
        access.expectedEmail,
        access.actualEmail,
        access.message,
    ].join('|');
}

function syncQuoteConfirmationAccessAlert() {
    if (!hasEmbeddedQuoteConfirmation()) {
        closeQuoteConfirmAlert();
        return;
    }
    if (!state.authResolved) {
        closeQuoteConfirmAlert();
        return;
    }
    const confirmation = state.publicConfirmation || {};
    const access = quoteConfirmationAccessState();
    if (confirmation.submitted || access.allowed || access.requiresLogin) {
        closeQuoteConfirmAlert();
        return;
    }
    const signature = quoteConfirmationAccessAlertSignature(access);
    if (confirmation.alertShownSignature === signature) return;
    confirmation.alertShownSignature = signature;
    // Passive sync only: avoid auto popups during initial auth/snapshot race.
    return;
    openQuoteConfirmAlert({
        title: localeCopy({
            zh: '当前账号无法提交报价确认',
            en: 'This account cannot submit quote confirmation',
            ru: 'Эта учетная запись не может подтвердить предложение',
        }),
        message: access.message,
        hint: confirmationExpectedEmail()
            ? localeCopy({
                zh: '请切换到报价中登记的客户邮箱后再提交。',
                en: 'Switch to the customer email registered on this quote before submitting.',
                ru: 'Переключитесь на email клиента, указанный в предложении, перед отправкой подтверждения.',
            })
            : localeCopy({
                zh: '请先在客户档案或报价单里设置客户邮箱，再开放确认提交。',
                en: 'Set the customer email on the customer archive or quote before enabling confirmation.',
                ru: 'Сначала укажите email клиента в карточке клиента или предложении.',
            }),
    });
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
    if (sample.includes('�') || sample.includes('锟') || sample.includes('鈧') || sample.includes('閳')) return true;
    return /(閿|泑|閺|瑜|琚|袘|袨)/.test(sample);
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
    if (section?.key === 'service_package') return t('servicePackage');
    return section?.key === 'optional_config' ? t('optionalConfig') : t('mainConfig');
}

function sectionSubtotal(section) {
    if (section?.key === 'optional_config') {
        const items = Array.isArray(section?.items) ? section.items : [];
        const hasSelectionState = items.some((item) => Object.prototype.hasOwnProperty.call(item || {}, 'isSelected'));
        if (hasSelectionState) {
            return items.reduce((sum, item) => {
                if (item?.isSelected !== true || item?.isIncluded === true) return sum;
                return sum + Math.max(0, safeNumber(item?.priceRmb, 0));
            }, 0);
        }
    }
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
    return normalizeLangCode(value, DEFAULT_LANG);
}

function configuredRuntimeLangs(snapshot = state.snapshot) {
    const quoteEnabled = snapshot?.quote?.shareConfig?.enabled_langs;
    const productEnabled = snapshot?.product?.ui_text?.enabled_langs;
    const source = Array.isArray(quoteEnabled) && quoteEnabled.length ? quoteEnabled : productEnabled;
    const langs = Array.isArray(source)
        ? [...new Set(source.map((item) => normalizeLangCode(item)).filter((item) => SUPPORTED_LANGS.includes(item)))]
        : [];
    if (langs.length) return langs;
    const fallback = normalizeLang(snapshot?.quote?.defaultLang || snapshot?.product?.default_lang || DEFAULT_LANG);
    return [fallback];
}

function resolveRuntimeLang(requested = '', snapshot = state.snapshot) {
    const allowed = configuredRuntimeLangs(snapshot);
    const normalizedRequested = normalizeLang(requested);
    if (allowed.includes(normalizedRequested)) return normalizedRequested;
    const fallback = normalizeLang(snapshot?.quote?.defaultLang || snapshot?.product?.default_lang || DEFAULT_LANG);
    if (allowed.includes(fallback)) return fallback;
    return allowed[0] || DEFAULT_LANG;
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
    if (banner) banner.classList.add('hidden');
}

function renderToolbar() {
    const node = byId('toolbar-brand-name');
    if (!node) return;
    node.textContent = state.currentLang === 'zh' ? 'GasGx 报价系统' : 'GasGx Quotation System';
}

function renderAuthButton() {
    const button = byId('btn-auth');
    if (button) button.hidden = true;
}

async function refreshAuthState(options = {}) {
    const { rerender = false, force = false } = options;
    const previous = {
        isLoggedIn: state.isLoggedIn === true,
        isAdmin: state.isAdmin === true,
        email: text(state.adminUser?.email).toLowerCase(),
    };
    const access = await resolveAdminSession();
    state.isLoggedIn = access.isLoggedIn === true;
    state.isAdmin = access.allowed === true;
    state.adminUser = access.user;
    state.authResolved = true;
    bodyReadonly(!state.isAdmin);
    const changed = force
        || previous.isLoggedIn !== state.isLoggedIn
        || previous.isAdmin !== state.isAdmin
        || previous.email !== text(state.adminUser?.email).toLowerCase();
    if (changed || rerender) {
        if (state.snapshot) renderAll();
        else renderAuthButton();
        syncQuoteConfirmationAccessAlert();
    }
    return changed;
}

function renderLangButtons() {
    const enabledLangs = configuredRuntimeLangs();
    SUPPORTED_LANGS.forEach((lang) => {
        const button = byId(`btn-${lang}`);
        if (!button) return;
        const enabled = enabledLangs.includes(lang);
        button.hidden = !enabled;
        if (!enabled) return;
        button.textContent = lang.toUpperCase();
        if (lang === state.currentLang) {
            button.className = 'px-2 md:px-4 py-1 md:py-1.5 rounded transition-all bg-[var(--gas-green-primary)] text-black font-semibold shadow-[0_0_8px_rgba(93,214,44,0.4)]';
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
    const quoteVersion = text(snapshot.quote?.quoteVersion || snapshot.quote?.version);
    const customerName = text(
        snapshot.quote.customerName
        || snapshot.quote.customer_name
        || snapshot.quote.customerProfile?.company_name
        || snapshot.quote.customerProfile?.companyName
        || snapshot.quote.shareConfig?.recipient_company,
        '',
    );
    const receiverEmail = normalizeEmail(
        snapshot.quote.receiverEmail
        || snapshot.quote.receiver_email
        || snapshot.quote.shareConfig?.recipient_email
        || snapshot.quote.customerProfile?.email
        || snapshot.quote.customerProfile?.requester_email,
    );
    const supplier = text(snapshot.brand.supplier_name || snapshot.brand.display_name || snapshot.brand.brand_name || 'GasGx');

    byId('f-title').textContent = quoteVersion ? `${overviewTitle} · V${quoteVersion}` : overviewTitle;
    byId('lbl-receiver').textContent = t('customerName');
    byId('lbl-validity').textContent = uiText('validity_label', 'validity');
    const updateLabel = byId('lbl-update');
    if (updateLabel) {
        updateLabel.innerHTML = `<span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--gas-green-light)] opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--gas-green-light)]"></span></span>${esc(t('update'))}`;
    }
    byId('view-meta-supplier')?.setAttribute('hidden', 'hidden');
    byId('view-meta-sender')?.setAttribute('hidden', 'hidden');
    byId('val-receiver').textContent = customerName;
    byId('val-receiver').setAttribute('data-placeholder', state.currentLang === 'zh' ? '请填写客户名称' : 'Enter customer name');
    const emailInput = byId('quote-email-input');
    if (emailInput) {
        emailInput.value = isValidEmail(receiverEmail) ? receiverEmail : '';
        emailInput.placeholder = t('receiverPlaceholder');
        emailInput.setAttribute('inputmode', 'email');
    }
    const emailLabel = byId('quote-email-label');
    if (emailLabel) emailLabel.textContent = state.currentLang === 'zh' ? '客户邮箱' : state.currentLang === 'ru' ? 'Email клиента' : 'Customer email';
    byId('btn-text-send')?.replaceChildren(document.createTextNode(t('sendQuote')));
    setQuoteEmailStatus(t('sendQuoteHint'));
    byId('footer-note').innerHTML = pickDisplayText(snapshot.brand.footer_note, '');
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
    const quoteConfirmAccess = quoteConfirmationAccessState();
    const quoteConfirmModal = byId('quote-confirm-alert-modal');
    const quoteConfirmAlertType = quoteConfirmModal?.getAttribute('data-alert-type') || '';
    if (quoteConfirmModal?.classList.contains('is-open') && quoteConfirmAlertType === 'access' && !quoteConfirmAccess.allowed) {
        openQuoteConfirmAlert({
            alertType: 'access',
            title: localeCopy({
                zh: '当前账号无法提交报价确认',
                en: 'This account cannot submit quote confirmation',
                ru: 'Эта учетная запись не может подтвердить предложение',
            }),
            message: quoteConfirmAccess.message,
            hint: confirmationExpectedEmail()
                ? localeCopy({
                    zh: '请切换到报价中登记的客户邮箱后再提交。',
                    en: 'Switch to the customer email registered on this quote before submitting.',
                    ru: 'Переключитесь на email клиента, указанный в предложении, перед отправкой подтверждения.',
                })
                : localeCopy({
                    zh: '请先在客户档案或报价单里设置客户邮箱，再开放确认提交。',
                    en: 'Set the customer email on the customer archive or quote before enabling confirmation.',
                    ru: 'Сначала укажите email клиента в карточке клиента или предложении.',
                }),
        });
    }
    if (quoteConfirmModal?.classList.contains('is-open') && quoteConfirmAlertType === 'access' && quoteConfirmAccess.allowed) {
        closeQuoteConfirmAlert();
    }

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
    const sectionTotals = Object.fromEntries((snapshot.product.sections || []).map((section) => [section.key, sectionSubtotal(section)]));
    const breakdown = [
        [t('mainTotal'), sectionTotals.main_config || 0],
        [t('optionalIncrease'), sectionTotals.optional_config || 0],
        [t('serviceTotal'), sectionTotals.service_package || 0],
    ];
    const rows = [];
    const mediaState = getProductMediaState(snapshot);
    const mediaBlock = renderProductMediaBlock(snapshot);
    const mediaAbove = mediaState.enabled && mediaState.config.position === MEDIA_POSITIONS.ABOVE ? mediaBlock : '';
    const mediaBelow = mediaState.enabled && mediaState.config.position !== MEDIA_POSITIONS.ABOVE ? mediaBlock : '';
    const confirmationPanel = quoteConfirmationPanelMarkup();

    (snapshot.product.sections || []).forEach((section) => {
        const subtotal = sectionSubtotal(section);
        rows.push(`
            <tr class="quote-section-row" data-section-key="${esc(section.key)}" style="background-color: var(--bg-base);">
                <td class="text-[var(--text-muted)] opacity-50 text-center text-xs font-mono-num whitespace-nowrap">-</td>
                <td class="text-[var(--gas-green-light)] font-semibold whitespace-nowrap">${esc(getSectionLabel(section))}</td>
                <td class="text-[var(--text-muted)] opacity-50 text-xs whitespace-nowrap">-</td>
                <td class="text-[var(--text-muted)] opacity-50 text-center font-mono-num whitespace-nowrap">-</td>
                <td class="font-mono-num text-[var(--gas-green-light)] font-medium whitespace-nowrap">${esc(formatCurrency('RMB', subtotal))}</td>
                <td class="font-mono-num text-[var(--gas-green-light)] font-medium whitespace-nowrap">${esc(formatCurrency('USD', subtotal * state.rates.USD))}</td>
            </tr>
        `);

        (section.items || []).forEach((item) => {
            const included = item.isIncluded === true;
            const optional = section.key === 'optional_config';
            const selected = item.isSelected === true;
            const price = safeNumber(item.priceRmb, 0);
            rows.push(`
                <tr class="quote-item-row">
                    <td class="text-[var(--text-body)] text-center text-xs font-mono-num whitespace-nowrap">${esc(item.lineCode || '--')}</td>
                    <td class="text-white min-w-[200px]"><span>${esc(pickDisplayText(item.nameI18n, item.lineCode || '--'))}</span>${optional ? `<label class="quote-optional-selected"><input type="checkbox" ${selected ? 'checked' : ''} disabled aria-label="${esc(t('optionalSelect'))}"><span>${esc(t('optionalSelect'))}</span></label>` : ''}</td>
                    <td class="text-[var(--text-body)] text-xs whitespace-nowrap">${esc(item.brandLabel || '-')}</td>
                    <td class="text-[var(--text-body)] text-center font-mono-num whitespace-nowrap">${esc(item.qtyLabel || '1')}</td>
                    <td class="font-mono-num ${included ? 'text-[var(--text-muted)]' : 'text-[var(--gas-green-light)] font-medium'} whitespace-nowrap">${included ? esc(t('included')) : esc(formatCurrency('RMB', price))}</td>
                    <td class="font-mono-num ${included ? 'text-[#333333]' : 'text-[var(--gas-green-light)] font-medium'} whitespace-nowrap">${included ? '-' : esc(formatCurrency('USD', price * state.rates.USD))}</td>
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
                <div class="quote-total-card quote-total-card--with-breakdown bg-[var(--bg-base)] border border-[var(--border-color)] rounded p-4 md:p-5 mb-4 md:mb-6 shadow-inner">
                    <div class="quote-total-card__headline">
                        <span class="font-bold text-white tracking-wider text-xs md:text-sm">${esc(uiText('system_total_label', 'systemTotal'))}:</span>
                        <div class="quote-total-grid text-sm md:text-[15px]">
                        <span class="flex items-center gap-2"><span class="gas-tag">RMB</span> <span class="text-[var(--gas-green-light)] font-mono-num font-bold">${esc(formatCurrency('RMB', total))}</span></span>
                        <span class="flex items-center gap-2"><span class="gas-tag">USD</span> <span class="text-[var(--gas-green-light)] font-mono-num font-bold">${esc(formatCurrency('USD', total * state.rates.USD))}</span></span>
                        </div>
                    </div>

                <div class="quote-total-formula" aria-label="${esc(t('pricingFormula'))}">
                    <div class="quote-total-formula__values">
                        <span><b>${esc(breakdown[0][0])}</b>${esc(formatCurrency('RMB', breakdown[0][1]))} + <b>${esc(breakdown[1][0])}</b>${esc(formatCurrency('RMB', breakdown[1][1]))} + <b>${esc(breakdown[2][0])}</b>${esc(formatCurrency('RMB', breakdown[2][1]))} = <strong>${esc(formatCurrency('RMB', total))}</strong></span>
                    </div>
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
                zh: `汇率已刷新，接口返回值未发生变化。${timeLabel}`,
                en: `Rates refreshed. The API returned the same values. ${timeLabel}`,
                ru: `Rates refreshed. The API returned the same values. ${timeLabel}`,
            }),
        };
    }

    if (!roundedChanged.length) {
        return {
            tone: 'muted',
            message: localeCopy({
                zh: `汇率已刷新，但四舍五入到 4 位后显示未变化。${timeLabel}`,
                en: `Rates refreshed, but the rounded 4-digit display did not change. ${timeLabel}`,
                ru: `Rates refreshed, but the rounded 4-digit display did not change. ${timeLabel}`,
            }),
        };
    }

    const changedText = roundedChanged.join(' / ');
    return {
        tone: 'success',
        message: localeCopy({
            zh: `汇率已刷新，${changedText} 已更新。${timeLabel}`,
            en: `Rates refreshed. Updated: ${changedText}. ${timeLabel}`,
            ru: `Rates refreshed. Updated: ${changedText}. ${timeLabel}`,
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
            setRateDetail(localeCopy({
                zh: '汇率刷新失败，当前继续使用报价单里的汇率快照。',
                en: 'Rate refresh failed. The page is still using the saved quote snapshot.',
                ru: 'Rate refresh failed. The page is still using the saved quote snapshot.',
            }), 'error');
        }
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
                        <h3>Loading quote confirmation</h3>
                        <p>Loading customer confirmation context, please wait.</p>
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
                        <h3>Confirmation entry unavailable</h3>
                        <p>${esc(confirmation.error)}</p>
                    </div>
                </div>
            </section>
        `;
    }

    const payload = confirmation.payload || {};
    if (text(payload.stage_key) === 'production_scheduled') {
        return productionProgressPanelMarkup(payload);
    }

    const terms = text(payload.meta?.quote_terms);
    return `
        <section class="quote-confirm-card ${confirmation.submitted ? 'is-success' : ''}">
            <div class="quote-confirm-card__head">
                <div>
                    <div class="quote-confirm-card__kicker">QUOTE CONFIRM</div>
                    <h3>${esc(localeCopy({
                        zh: '客户确认入口已迁移到用户中心',
                        en: 'Customer confirmation moved to Account Center',
                        ru: 'Customer confirmation moved to Account Center',
                    }))}</h3>
                    <p>${esc(localeCopy({
                        zh: '报价确认提交统一在 Account > Sales Pipeline 完成。公开页仅用于查看与跳转。',
                        en: 'Quote confirmation now runs in Account > Sales Pipeline. This page is for viewing and redirect only.',
                        ru: 'Quote confirmation now runs in Account > Sales Pipeline. This page is for viewing and redirect only.',
                    }))}</p>
                </div>
                <div class="quote-confirm-card__badge">${confirmation.submitted ? 'Completed' : 'Redirect'}</div>
            </div>
            ${terms ? `
                <div class="quote-confirm-card__terms">
                    <strong>${esc(localeCopy({ zh: '客户可见条款', en: 'Customer terms', ru: 'Customer terms' }))}</strong>
                    <p>${esc(terms)}</p>
                </div>
            ` : ''}
            <div class="quote-confirm-card__foot">
                <div class="quote-confirm-card__hint">
                    <strong>${esc(localeCopy({
                        zh: '统一流程入口',
                        en: 'Single workflow entry',
                        ru: 'Single workflow entry',
                    }))}</strong>
                    <p>${esc(localeCopy({
                        zh: '登录后将自动跳转到账户中心对应节点，销售后台同步可见。',
                        en: 'After sign-in, you will be routed to the matching stage in Account Center with live backend sync.',
                        ru: 'After sign-in, you will be routed to the matching stage in Account Center with live backend sync.',
                    }))}</p>
                </div>
                <button id="quote-confirm-submit" type="button" class="btn-glow px-5 py-3 inline-flex items-center gap-2" ${confirmation.submitting || confirmation.submitted ? 'disabled' : ''}>
                    <i class="fa-solid fa-right-to-bracket"></i>
                    <span>${confirmation.submitted
                        ? localeCopy({ zh: '已完成', en: 'Completed', ru: 'Completed' })
                        : localeCopy({ zh: '登录后去用户中心处理', en: 'Sign in and continue in Account', ru: 'Sign in and continue in Account' })}</span>
                </button>
            </div>
            <div class="quote-confirm-card__status">${esc(confirmation.result?.error ? '' : text(confirmation.result?.message))}</div>
        </section>
    `;
}

function friendlyQuoteConfirmErrorMessage(error) {
    const raw = quoteConfirmErrorFingerprint(error);
    if (raw.includes('ambiguous') && raw.includes('stage_key')) {
        return localeCopy({
            zh: '系统正在修复一次提交流程异常，请稍后重试；如仍失败请联系销售支持。',
            en: 'The system is fixing a submission workflow issue. Please retry shortly or contact sales support.',
            ru: 'The system is fixing a submission workflow issue. Please retry shortly or contact sales support.',
        });
    }
    if (!raw) {
        return localeCopy({
            zh: '提交失败，请稍后重试；如持续失败请联系销售支持。',
            en: 'Submit failed. Please try again later or contact your sales rep.',
            ru: 'Submit failed. Please try again later or contact your sales rep.',
        });
    }
    if (raw.includes('permission') || raw.includes('not allowed') || raw.includes('denied') || raw.includes('forbidden')) {
        return localeCopy({
            zh: '当前账号没有提交权限。请使用建档时登记的客户邮箱登录后再提交。',
            en: 'This account is not allowed to submit. Please sign in with the registered customer email.',
            ru: 'This account is not allowed to submit. Please sign in with the registered customer email.',
        });
    }
    if (raw.includes('token') || raw.includes('expired') || raw.includes('invalid')) {
        return localeCopy({
            zh: '确认链接已失效或无效，请向销售索取最新确认链接。',
            en: 'This confirmation link is invalid or expired. Please request a new link from sales.',
            ru: 'This confirmation link is invalid or expired. Please request a new link from sales.',
        });
    }
    return localeCopy({
        zh: '提交失败，请稍后重试；如持续失败请联系销售支持。',
        en: 'Submit failed. Please try again later or contact your sales rep.',
        ru: 'Submit failed. Please try again later or contact your sales rep.',
    });
}

function quoteConfirmErrorFingerprint(error) {
    const parts = [];
    const collect = (value) => {
        const normalized = text(value);
        if (normalized) parts.push(normalized);
    };
    collect(error?.message);
    collect(error?.details);
    collect(error?.hint);
    collect(error?.code);
    collect(error?.status);
    collect(error?.statusText);
    collect(error?.error_description);
    if (error?.error && typeof error.error === 'object') {
        collect(error.error.message);
        collect(error.error.details);
        collect(error.error.hint);
        collect(error.error.code);
    }
    return parts.join(' | ').toLowerCase();
}

async function submitEmbeddedPublicConfirmation() {
    const confirmation = state.publicConfirmation || {};
    const next = publicConfirmationParams();
    if (!next.stage || !next.token) {
        openQuoteConfirmAlert({
            alertType: 'validation',
            title: localeCopy({
                zh: '无法识别当前确认链接',
                en: 'Invalid confirmation link',
                ru: 'Invalid confirmation link',
            }),
            message: localeCopy({
                zh: '当前链接缺少参数，请联系销售获取最新入口。',
                en: 'This link is missing parameters. Please request a fresh entry from sales.',
                ru: 'This link is missing parameters. Please request a fresh entry from sales.',
            }),
        });
        return;
    }

    if (confirmation.submitting) return;
    state.publicConfirmation.submitting = true;
    state.publicConfirmation.result = {
        error: false,
        message: localeCopy({
            zh: '正在跳转到账户中心...',
            en: 'Redirecting to Account Center...',
            ru: 'Redirecting to Account Center...',
        }),
    };
    renderAll();

    await redirectToAccountSales({
        confirm_stage: next.stage,
        confirm_token: next.token,
    });
}

function applySnapshot(snapshot) {
    state.snapshot = snapshot;
    prepareQuoteBehaviorTracking();
    state.galleryIndex = 0;
    state.currentLang = resolveRuntimeLang(params.get('lang') || snapshot?.quote?.defaultLang || snapshot?.product?.default_lang || DEFAULT_LANG, snapshot);
    state.rates = normalizeRates(snapshot?.quote?.rates || snapshot?.product?.default_rates || DEFAULT_RATES);
    state.rateStatusMode = 'online';
    state.rateDetail = { message: '', tone: 'muted' };
    state.shareTarget = deriveShareTarget();
    bodyReadonly(!state.isAdmin);
    renderAll();
    syncQuoteConfirmationAccessAlert();
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
        setAccessOverlay({
            title: t('accessCheckingTitle'),
            message: t('accessCheckingMessage'),
            icon: 'fa-spinner fa-spin',
            meta: state.isAdmin ? t('shareMetaAdmin') : '',
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

    const wrappers = [...element.querySelectorAll('.table-responsive-wrapper')];
    const wrapperOverflow = wrappers.map((node) => node.style.overflowX);
    try {
        element.style.width = '1280px';
        element.style.padding = '40px';
        element.style.backgroundColor = '#161B22';

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

        return { canvas, exactWidth, exactHeight };
    } finally {
        element.style.width = original.width;
        element.style.padding = original.padding;
        element.style.backgroundColor = original.backgroundColor;
        wrappers.forEach((node, index) => {
            node.style.overflowX = wrapperOverflow[index];
        });
    }
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
    if (!window.html2canvas) {
        setStatusMessage(t('exportLibraryMissing'), true);
        return;
    }
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
    if (!window.html2pdf || !window.html2canvas) {
        setStatusMessage(t('exportLibraryMissing'), true);
        return;
    }
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

async function sendEmail() {
    const input = byId('quote-email-input');
    const receiver = normalizeEmail(input?.value);
    if (!receiver) {
        setQuoteEmailStatus(t('noEmail'), true);
        input?.focus();
        return;
    }
    if (!isValidEmail(receiver)) {
        setQuoteEmailStatus(t('emailInvalid'), true);
        input?.focus();
        return;
    }

    const button = byId('btn-send');
    const previousText = button?.textContent || '';
    if (button?.dataset.loading === '1') return;
    if (button) {
        button.dataset.loading = '1';
        button.disabled = true;
        button.textContent = t('sendQuoteBusy');
    }

    const shareMeta = shareMetadata();
    const recipientName = text(shareMeta.recipientName || state.snapshot?.quote?.receiverName || state.snapshot?.quote?.receiver_name, 'sir/madam');
    const recipientCompany = text(shareMeta.recipientCompany || state.snapshot?.quote?.customerName || state.snapshot?.quote?.customer_name);
    const brandName = text(state.snapshot?.brand?.subject_name || state.snapshot?.brand?.display_name || state.snapshot?.brand?.brand_name);
    const title = text(byId('f-title')?.textContent, 'Quotation');
    const sender = text(state.snapshot?.brand?.sender_email || state.snapshot?.brand?.senderEmail || state.adminUser?.email);
    const senderName = text(userDisplayName(state.adminUser), sender);
    const sentAt = new Date().toISOString();
    const publicSlug = text(state.snapshot?.quote?.publicSlug || state.snapshot?.quote?.public_slug || state.shareTarget?.quoteSlug);
    const quoteUrl = publicSlug
        ? `${window.location.origin}/quote/view.html?quote=${encodeURIComponent(publicSlug)}`
        : '';

    try {
        await recordPublicQuoteEmailDispatch(receiver);
        void logQuoteEvent('email_clicked', {
            accessMode: state.route?.type || 'quote',
            metadata: {
                receiver,
                brandName,
                title,
                quoteUrl,
                ...shareMeta,
            },
        });
        const subject = encodeURIComponent(`${t('mailSubjectPrefix')} ${title} - ${brandName}`);
        const linkLine = quoteUrl ? `\n\nQuotation link:\n${quoteUrl}` : '';
        const body = encodeURIComponent(`Dear ${recipientName},\n\nPlease review the latest quotation from GasGx.${linkLine}\n\nBest Regards,\n${senderName}${sender && sender !== senderName ? `\n${sender}` : ''}`);
        setQuoteEmailStatus(t('sendQuoteSuccess'));
        window.location.href = `mailto:${receiver}?subject=${subject}&body=${body}`;
    } catch (error) {
        setQuoteEmailStatus(text(error?.message, t('sendQuoteError')), true);
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = previousText || t('sendQuote');
            delete button.dataset.loading;
        }
    }
}

async function recordPublicQuoteEmailDispatch(recipientEmail) {
    const supabase = getClient();
    const instanceId = text(state.snapshot?.quote?.id);
    if (!supabase || !instanceId) throw new Error(t('sendQuoteError'));

    const { data, error } = await supabase.rpc('record_public_quote_email_dispatch', {
        target_instance_id: instanceId,
        target_recipient_email: normalizeEmail(recipientEmail),
    });
    if (error) throw error;

    const record = Array.isArray(data) ? data[0] : data;
    if (!record) return null;
    const customerId = text(record.customer_id);
    const companyName = text(record.recipient_company || state.snapshot?.quote?.customerName || state.snapshot?.quote?.customer_name);
    const contactName = text(record.recipient_name || state.snapshot?.quote?.receiverName || state.snapshot?.quote?.receiver_name);
    const email = normalizeEmail(record.recipient_email || recipientEmail);
    state.snapshot = {
        ...state.snapshot,
        quote: {
            ...state.snapshot.quote,
            customerId,
            customer_id: customerId,
            customerName: companyName,
            customer_name: companyName,
            receiverName: contactName,
            receiver_name: contactName,
            receiverEmail: email,
            receiver_email: email,
            customerProfile: {
                ...(state.snapshot.quote?.customerProfile || {}),
                company_name: companyName,
                contact_name: contactName,
                email,
            },
        },
    };
    return record;
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
        const config = getAuthConfig();
        getClient.instance = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                storageKey: text(config?.storageKey, 'gasgx-main-auth'),
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
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
    if (!text(quote.receiverEmail) && text(row.receiver_email)) quote.receiverEmail = text(row.receiver_email);
    if (!text(quote.receiver_email) && text(row.receiver_email)) quote.receiver_email = text(row.receiver_email);
    if ((!quote.shareConfig || typeof quote.shareConfig !== 'object' || !Object.keys(quote.shareConfig).length)
        && row.share_config && typeof row.share_config === 'object') {
        quote.shareConfig = normalizeShareConfig(row.share_config, {
            recipient_email: text(row.receiver_email),
        });
    } else if (quote.shareConfig && typeof quote.shareConfig === 'object' && text(row.receiver_email)) {
        quote.shareConfig = normalizeShareConfig(quote.shareConfig, {
            recipient_email: text(row.receiver_email),
        });
    }
    if ((!quote.customerProfile || typeof quote.customerProfile !== 'object' || !Object.keys(quote.customerProfile).length)
        && row.customer_snapshot && typeof row.customer_snapshot === 'object') {
        quote.customerProfile = { ...row.customer_snapshot };
    }
    return {
        ...snapshot,
        quote,
    };
}

async function ensureQuoteCustomerForSend(details = {}) {
    const supabase = getClient();
    const instanceId = text(state.snapshot?.quote?.id);
    const email = normalizeEmail(details.recipientEmail);
    if (!supabase || !instanceId || !email) return null;

    const companyName = text(details.recipientCompany || state.snapshot?.quote?.customerName || state.snapshot?.quote?.customer_name);
    const contactName = text(details.recipientName || state.snapshot?.quote?.receiverName || state.snapshot?.quote?.receiver_name);
    let customer = null;
    const lookup = await supabase
        .from('quote_customers')
        .select('*')
        .ilike('email', email)
        .maybeSingle();
    if (lookup.error) throw lookup.error;
    customer = lookup.data || null;

    if (!customer) {
        const insertResult = await supabase.from('quote_customers').insert({
            company_name: companyName,
            contact_name: contactName,
            email,
            phone: '',
            country: '',
            notes: '由报价预览页发送报价时自动建立客户档案。',
            is_active: true,
            is_deleted: false,
            created_by: state.adminUser?.id || null,
            updated_by: state.adminUser?.id || null,
        }).select('*').single();
        if (insertResult.error?.code === '23505') {
            const retry = await supabase
                .from('quote_customers')
                .select('*')
                .ilike('email', email)
                .maybeSingle();
            if (retry.error) throw retry.error;
            customer = retry.data || null;
        } else if (insertResult.error) {
            throw insertResult.error;
        } else {
            customer = insertResult.data;
        }
    }

    if (!customer?.id) throw new Error('Customer record could not be created.');
    const customerSnapshot = {
        company_name: text(customer.company_name || companyName),
        contact_name: text(customer.contact_name || contactName),
        email,
        phone: text(customer.phone),
        country: text(customer.country),
        notes: text(customer.notes),
    };
    const shareConfig = normalizeShareConfig(state.snapshot?.quote?.shareConfig, {
        recipient_name: contactName,
        recipient_email: email,
        recipient_company: companyName,
    });
    const { error: instanceError } = await supabase
        .from(TABLE_INSTANCES)
        .update({
            customer_id: customer.id,
            receiver_name: contactName,
            receiver_email: email,
            customer_name: companyName,
            customer_snapshot: customerSnapshot,
            share_config: shareConfig,
            updated_by: state.adminUser?.id || null,
        })
        .eq('id', instanceId);
    if (instanceError) throw instanceError;

    state.snapshot = {
        ...state.snapshot,
        quote: {
            ...state.snapshot.quote,
            customerId: text(customer.id),
            customer_id: text(customer.id),
            customerName: companyName,
            customer_name: companyName,
            receiverName: contactName,
            receiver_name: contactName,
            receiverEmail: email,
            receiver_email: email,
            customerProfile: customerSnapshot,
            shareConfig,
        },
    };
    return customer;
}

async function appendShareHistoryRecord(options = {}) {
    const supabase = getClient();
    const instanceId = text(state.snapshot?.quote?.id);
    if (!supabase || !instanceId || !state.isAdmin) return null;

    const now = new Date().toISOString();
    const recipientEmail = normalizeEmail(options.recipientEmail);
    const customer = recipientEmail
        ? await ensureQuoteCustomerForSend({ ...options, recipientEmail })
        : null;
    const recipientName = text(options.recipientName || state.snapshot?.quote?.receiverName || state.snapshot?.quote?.receiver_name);
    const recipientCompany = text(options.recipientCompany || state.snapshot?.quote?.customerName || state.snapshot?.quote?.customer_name);
    const senderEmail = normalizeEmail(options.senderEmail || state.adminUser?.email || state.snapshot?.brand?.sender_email);
    const payload = {
        instance_id: instanceId,
        customer_id: text(customer?.id || state.snapshot?.quote?.customerId) || null,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        recipient_company: recipientCompany,
        owner_name: text(options.ownerName || userDisplayName(state.adminUser)),
        owner_email: normalizeEmail(options.ownerEmail || state.adminUser?.email),
        follow_up_notes: text(options.followUpNotes),
        outcome_notes: text(options.outcomeNotes),
        share_target: text(options.shareTarget || state.shareTarget?.type),
        last_channel: text(options.channel, 'share_link'),
        channels: [text(options.channel, 'share_link')],
        status: text(options.status, 'recorded'),
        attempt_count: 1,
        first_sent_at: text(options.sentAt, now),
        last_sent_at: text(options.sentAt, now),
        expires_at: text(options.expiresAt) || null,
        passcode_protected: options.passcodeProtected === true,
        sender_name: text(options.senderName || userDisplayName(state.adminUser)),
        sender_email: senderEmail,
        created_by: state.adminUser?.id || null,
        updated_by: state.adminUser?.id || null,
    };
    const { data, error } = await supabase
        .from(TABLE_INSTANCE_SENDS)
        .insert(payload)
        .select('*')
        .single();
    if (error) throw error;
    return data;
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
    let { data, error } = await supabase
        .from('quote_instances')
        .select('id, public_slug, customer_id, receiver_email, share_config, customer_snapshot, published_snapshot, status, last_active_status')
        .eq('public_slug', publicSlug)
        .eq('status', 'published')
        .maybeSingle();
    if ((!data || error) && publicSlug) {
        ({ data, error } = await supabase
            .from('quote_instances')
            .select('id, public_slug, customer_id, receiver_email, share_config, customer_snapshot, published_snapshot, status, last_active_status')
            .eq('public_slug', publicSlug)
            .not('published_snapshot', 'is', null)
            .maybeSingle());
    }
    if (error) return null;
    if (!data?.published_snapshot) return null;
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
        const payload = Array.isArray(data)
            ? (data[0] || null)
            : (data && typeof data === 'object' ? data : null);
        if (!payload) {
            throw new Error('No public stage payload found for this link.');
        }
        const submitted = (
            text(payload.stage_status) === 'completed'
            || Boolean(payload.completed_at)
            || Boolean(payload.meta?.public_confirmed_at)
        );
        state.publicConfirmation = {
            ...state.publicConfirmation,
            loading: false,
            payload,
            submitted,
            confirmed: submitted,
            note: text(payload.meta?.public_confirmation_note || payload.confirm_note),
            result: null,
            error: '',
        };
        syncQuoteConfirmationAccessAlert();
    } catch (error) {
        state.publicConfirmation.loading = false;
        state.publicConfirmation.payload = null;
        state.publicConfirmation.error = text(error?.message, 'Failed to load public confirmation.');
    }
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
    } catch (_error) {
        return;
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

function bindEvents() {
    const switchRuntimeLanguage = (lang) => {
        const nextLang = resolveRuntimeLang(lang);
        if (nextLang === state.currentLang) return;
        state.currentLang = nextLang;
        renderAll();
        renderClock();
        syncShareExpiryUi();
    };
    byId('btn-auth')?.addEventListener('click', () => {
        if (state.isLoggedIn) {
            window.location.href = getAuthConfig().accountUrl;
            return;
        }
        redirectToSignIn();
    });
    byId('btn-zh')?.addEventListener('click', () => switchRuntimeLanguage('zh'));
    byId('btn-en')?.addEventListener('click', () => switchRuntimeLanguage('en'));
    byId('btn-ru')?.addEventListener('click', () => switchRuntimeLanguage('ru'));

    byId('btn-refresh-rates')?.addEventListener('click', () => {
        void fetchRates(true);
    });
    byId('btn-send')?.addEventListener('click', () => {
        void sendEmail();
    });
    byId('quote-email-input')?.addEventListener('input', () => {
        setQuoteEmailStatus(t('sendQuoteHint'));
    });
    byId('quote-email-input')?.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        void sendEmail();
    });
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
    byId('btn-quote-confirm-alert-close')?.addEventListener('click', closeQuoteConfirmAlert);
    byId('btn-quote-confirm-alert-ack')?.addEventListener('click', closeQuoteConfirmAlert);
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
        if (event.target === byId('quote-confirm-alert-modal')) closeQuoteConfirmAlert();
        if (event.target === byId('share-modal')) closeShareModal();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        closeShareMenu();
        closeAuthModal();
        closeQuoteConfirmAlert();
        closeShareModal();
    });

    window.addEventListener('resize', () => {
        if (!isMobileViewport()) closeShareMenu();
    });
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            void refreshAuthState({ rerender: true });
            return;
        }
        if (document.visibilityState === 'hidden') flushQuoteBehaviorSummary();
    });
    window.addEventListener('focus', () => {
        void refreshAuthState({ rerender: true });
    });
    window.addEventListener('pagehide', () => {
        flushQuoteBehaviorSummary();
    });
}

async function init() {
    bindEvents();
    state.route = resolveInitialRoute();
    await refreshAuthState({ force: true });
    const resolved = await resolveRouteSnapshot();
    if (resolved) {
        closeAccessOverlay();
    }
}

void init();
