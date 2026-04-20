import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
};

const CONTACT_EMAIL = 'contact@gasgx.com';
const DEFAULT_DOMAIN = 'generalv3.5';
const SPARK_TIMEOUT_MS = 45000;
const DEFAULT_TOP_K = 6;
const KNOWLEDGE_SEARCH_LIMIT = 8;
const SECTION_ROOTS = ['products', 'solutions', 'digitalization', 'support', 'resources', 'use-cases', 'rankings', 'about'] as const;
const GENERIC_PATH_SEGMENTS = new Set<string>([
    ...SECTION_ROOTS,
    'gas',
    'power-range',
    'cooling',
    'deployment',
    'overview',
    'page',
    'pages',
]);

type ChatTurn = {
    role: 'user' | 'assistant';
    content: string;
};

type PageContext = {
    title: string;
    path: string;
    url: string;
    lang: string;
};

type SourceRef = {
    title: string;
    url: string;
    source_type: string;
};

type HandoffMeta = {
    required: boolean;
    reason: 'quote' | 'lead' | 'support' | 'unknown';
    next_fields: string[];
};

type KnowledgeChunkHit = {
    chunk_id: string;
    document_id: string;
    title: string;
    canonical_url: string;
    source_type: string;
    visibility: string;
    language: string;
    section_path: string;
    chunk_text: string;
    chunk_summary: string;
    keywords: string[];
    score: number;
};

type KnowledgeSearchContext = {
    message: string;
    language: string;
    matchedIntent: string;
    pageContext: PageContext;
};

type FaqRule = {
    id: string;
    intent_key: string;
    language: string;
    trigger_patterns: string[];
    answer_template: string;
    handoff_required: boolean;
    handoff_reason: HandoffMeta['reason'];
    next_fields: string[];
    source_refs: SourceRef[];
};

const INTENT_DEFINITIONS = [
    {
        key: 'product_overview',
        patterns: [
            'what products',
            'what do you offer',
            'product lines',
            'solutions',
            'services',
            '你们有什么产品',
            '都有什么产品',
            '有哪些产品',
            '有哪些方案',
            '有哪些服务',
            'какие продукты',
            'что вы предлагаете',
            'какие решения',
            'какие услуги',
        ],
    },
    {
        key: 'quote_requirements',
        patterns: [
            'quote',
            'quotation',
            'price',
            'cost',
            'how much',
            '报价',
            '价格',
            '多少钱',
            '预算',
            'стоимость',
            'цена',
            'коммерческое предложение',
            'сколько стоит',
        ],
    },
    {
        key: 'contact_support',
        patterns: [
            'contact',
            'email',
            'support',
            'after-sales',
            'service network',
            '联系方式',
            '联系',
            '邮箱',
            '售后',
            '技术支持',
            '服务网络',
            'контакты',
            'связаться',
            'сервис',
            'техподдержка',
        ],
    },
    {
        key: 'mining_associated_gas_1mw',
        patterns: [
            '1 mw mining',
            '1000 kw mining',
            'associated gas',
            'flare gas',
            '矿场',
            '1mw矿场',
            '1000kw矿场',
            '伴生气',
            '火炬气',
            'майнинг',
            '1 mw',
            'попутный газ',
            'факельный газ',
        ],
    },
];

function text(value: unknown, fallback = ''): string {
    return String(value ?? fallback).trim();
}

function env(name: string, fallback = ''): string {
    return text(Deno.env.get(name), fallback);
}

function json(data: Record<string, unknown>, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: corsHeaders,
    });
}

function bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
    }
    return btoa(binary);
}

function utf8Base64(value: string): string {
    return bytesToBase64(new TextEncoder().encode(value));
}

async function hmacSha256(secret: string, value: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
    );
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
    return bytesToBase64(new Uint8Array(signature));
}

async function createSparkAuthUrl(url: string, apiKey: string, apiSecret: string): Promise<string> {
    const parsed = new URL(url);
    const host = parsed.host;
    const path = parsed.pathname;
    const date = new Date().toUTCString();
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
    const signature = await hmacSha256(apiSecret, signatureOrigin);
    const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    parsed.searchParams.set('authorization', utf8Base64(authorizationOrigin));
    parsed.searchParams.set('date', date);
    parsed.searchParams.set('host', host);
    return parsed.toString();
}

function normalizeLanguage(value: unknown, fallback = 'en'): string {
    const lang = text(value, fallback).toLowerCase();
    if (lang.startsWith('zh')) return 'zh';
    if (lang.startsWith('ru')) return 'ru';
    return 'en';
}

function detectPreferredLanguage(explicitLanguage: unknown, message: string, pageContext?: PageContext): string {
    const explicit = normalizeLanguage(explicitLanguage, '');
    if (explicit) return explicit;
    if (/[\u4e00-\u9fff]/.test(message)) return 'zh';
    if (/[\u0400-\u04FF]/.test(message)) return 'ru';
    return normalizeLanguage(pageContext?.lang, 'en');
}

function sanitizePageContext(value: unknown): PageContext {
    const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
    return {
        title: text(source.title),
        path: text(source.path),
        url: text(source.url),
        lang: normalizeLanguage(source.lang, 'en'),
    };
}

function sanitizeHistory(value: unknown): ChatTurn[] {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => {
            const source = item && typeof item === 'object' ? item as Record<string, unknown> : {};
            const role = text(source.role).toLowerCase() === 'assistant' ? 'assistant' : 'user';
            const content = text(source.content);
            if (!content) return null;
            return { role, content };
        })
        .filter((item): item is ChatTurn => !!item)
        .slice(-10);
}

function createServiceClient() {
    const supabaseUrl = env('SUPABASE_URL');
    const serviceRoleKey = env('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('supabase_service_env_missing');
    }
    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}

function normalizedIntentText(message: string): string {
    return text(message).toLowerCase();
}

function scorePatterns(normalizedMessage: string, patterns: string[]): number {
    let score = 0;
    for (const pattern of patterns) {
        const normalizedPattern = text(pattern).toLowerCase();
        if (!normalizedPattern) continue;
        if (normalizedMessage.includes(normalizedPattern)) {
            score += normalizedPattern.length >= 8 ? 1.25 : 1;
        }
    }
    return score;
}

function detectIntent(message: string): string {
    const normalized = normalizedIntentText(message);
    let bestKey = '';
    let bestScore = 0;
    for (const definition of INTENT_DEFINITIONS) {
        const score = scorePatterns(normalized, definition.patterns);
        if (score > bestScore) {
            bestKey = definition.key;
            bestScore = score;
        }
    }
    return bestScore > 0 ? bestKey : '';
}

function sourceRefArray(value: unknown): SourceRef[] {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => {
            const source = item && typeof item === 'object' ? item as Record<string, unknown> : {};
            const title = text(source.title);
            const url = text(source.url);
            const sourceType = text(source.source_type || source.sourceType);
            if (!title) return null;
            return { title, url, source_type: sourceType || 'internal_sales_kb' };
        })
        .filter((item): item is SourceRef => !!item);
}

function toFaqRule(row: Record<string, unknown>): FaqRule {
    return {
        id: text(row.id),
        intent_key: text(row.intent_key),
        language: normalizeLanguage(row.language, 'en'),
        trigger_patterns: Array.isArray(row.trigger_patterns) ? row.trigger_patterns.map((item) => text(item)).filter(Boolean) : [],
        answer_template: text(row.answer_template),
        handoff_required: row.handoff_required === true,
        handoff_reason: ['quote', 'lead', 'support'].includes(text(row.handoff_reason)) ? text(row.handoff_reason) as HandoffMeta['reason'] : 'unknown',
        next_fields: Array.isArray(row.next_fields) ? row.next_fields.map((item) => text(item)).filter(Boolean) : [],
        source_refs: sourceRefArray(row.source_refs),
    };
}

function fallbackFaqRules(language: string): FaqRule[] {
    const sourceByIntent: Record<string, SourceRef[]> = {
        product_overview: [{ title: 'GasGx Offering Map', url: 'kb://gasgx/offering-overview', source_type: 'internal_sales_kb' }],
        quote_requirements: [{ title: 'Quotation Checklist', url: 'kb://gasgx/quote-checklist', source_type: 'internal_sales_kb' }],
        contact_support: [{ title: 'Support Scope', url: 'kb://gasgx/support-scope', source_type: 'internal_sales_kb' }],
        mining_associated_gas_1mw: [{ title: 'Project Qualification Playbook', url: 'kb://gasgx/project-qualification', source_type: 'internal_sales_kb' }],
    };

    const catalog = {
        en: {
            product_overview: 'GasGx mainly covers generator product lines by power range, gas source, cooling and deployment format; solution families for oilfield, mining, industrial energy and CHP; digital systems such as O&M Platform, ECM, IMS and Sales System; plus support resources including case studies, datasheets, certifications and FAQ. If you share your scenario, target power and gas source, I can narrow the recommendation.',
            quote_requirements: `GasGx can support a formal quotation, but exact pricing depends on the application, target load, gas type and gas quality, deployment format, country, voltage and frequency, plus whether controls, cooling, switchgear, miners and remote O&M are in scope. If you share those inputs, I can turn them into a concise pre-sales brief for follow-up at ${CONTACT_EMAIL}.`,
            contact_support: `You can contact GasGx at ${CONTACT_EMAIL}. GasGx also supports technical support, after-sales service and service-network coordination. If you share the scenario, power range and gas source first, I can help structure the request before manual follow-up.`,
            mining_associated_gas_1mw: 'For a 1 MW mining site powered by associated or flare gas, GasGx would usually start with a 1 MW+ gas-power solution, typically containerized or AIS-integrated for field deployment. The next critical checks are gas quality, miner load, voltage and frequency, grid mode, country, ambient conditions and the O&M model.',
        },
        zh: {
            product_overview: 'GasGx 目前主要覆盖四类能力：燃气发电机组产品线、油田伴生气/矿场/工业能源/CHP 等解决方案、O&M Platform/ECM/IMS/Sales System 等数字化系统，以及技术支持、售后服务、服务网络、案例、参数表、认证和 FAQ 等配套资源。如果你告诉我场景、目标功率和气源，我可以继续缩小到更合适的方向。',
            quote_requirements: `GasGx 可以配合正式报价，但准确价格通常取决于应用场景、目标负载、气源类型与气质、部署形式、国家地区、电压频率，以及是否包含电控、冷却、矿机、开关柜和远程运维等范围。如果你把这些信息发给我，我可以先帮你整理成一份售前简表，再转给 ${CONTACT_EMAIL} 跟进。`,
            contact_support: `你可以通过 ${CONTACT_EMAIL} 联系 GasGx。GasGx 也支持技术支持、售后服务和服务网络协调。如果你先告诉我项目场景、功率范围和气源类型，我可以先帮你整理需求，再交给人工继续跟进。`,
            mining_associated_gas_1mw: '如果是 1MW 级矿场使用伴生气或火炬气供电，GasGx 通常会优先从 1MW+ 级燃气发电方案切入，常见部署形式是集装箱化或 AIS 一体化。下一步最关键的是确认气质、矿机负载、电压频率、并网还是离网、所在国家与环境条件，以及后续运维模式。',
        },
        ru: {
            product_overview: 'GasGx в основном покрывает линейки газогенераторов по мощности, типу газа, охлаждению и формату установки; решения для нефтепромыслов, майнинга, промышленной распределенной энергетики и CHP; цифровые системы O&M Platform, ECM, IMS и Sales System; а также сервисные ресурсы, кейсы, даташиты, сертификаты и FAQ. Если вы сообщите сценарий, мощность и тип газа, я сузлю рекомендацию.',
            quote_requirements: `GasGx может подготовить коммерческое предложение, но точная цена зависит от сценария проекта, требуемой нагрузки, типа и качества газа, формата установки, страны, напряжения и частоты, а также состава поставки: управление, охлаждение, майнеры, switchgear и удаленная O&M поддержка. Если вы передадите эти данные, я соберу краткий пресейл-бриф для дальнейшей работы через ${CONTACT_EMAIL}.`,
            contact_support: `Связаться с GasGx можно по адресу ${CONTACT_EMAIL}. GasGx также поддерживает техническую поддержку, послепродажный сервис и координацию сервисной сети. Если вы сначала сообщите сценарий проекта, диапазон мощности и тип газа, я помогу структурировать запрос перед ручным сопровождением.`,
            mining_associated_gas_1mw: 'Для майнинговой площадки уровня 1 MW на попутном или факельном газе GasGx обычно начинает с решения уровня 1 MW+ на газовой генерации, чаще всего в контейнерном или AIS-интегрированном формате. Далее нужно уточнить качество газа, майнинговую нагрузку, напряжение и частоту, режим сети, страну, условия площадки и модель эксплуатации.',
        },
    } as const;

    const localized = catalog[language as keyof typeof catalog] || catalog.en;
    return [
        {
            id: `fallback:${language}:product_overview`,
            intent_key: 'product_overview',
            language,
            trigger_patterns: INTENT_DEFINITIONS.find((item) => item.key === 'product_overview')?.patterns || [],
            answer_template: localized.product_overview,
            handoff_required: false,
            handoff_reason: 'unknown',
            next_fields: [],
            source_refs: sourceByIntent.product_overview,
        },
        {
            id: `fallback:${language}:quote_requirements`,
            intent_key: 'quote_requirements',
            language,
            trigger_patterns: INTENT_DEFINITIONS.find((item) => item.key === 'quote_requirements')?.patterns || [],
            answer_template: localized.quote_requirements,
            handoff_required: true,
            handoff_reason: 'quote',
            next_fields: ['application', 'power', 'gas_type', 'country', 'voltage_frequency', 'deployment'],
            source_refs: sourceByIntent.quote_requirements,
        },
        {
            id: `fallback:${language}:contact_support`,
            intent_key: 'contact_support',
            language,
            trigger_patterns: INTENT_DEFINITIONS.find((item) => item.key === 'contact_support')?.patterns || [],
            answer_template: localized.contact_support,
            handoff_required: true,
            handoff_reason: 'support',
            next_fields: ['application', 'power', 'gas_type', 'issue_or_goal'],
            source_refs: sourceByIntent.contact_support,
        },
        {
            id: `fallback:${language}:mining_associated_gas_1mw`,
            intent_key: 'mining_associated_gas_1mw',
            language,
            trigger_patterns: INTENT_DEFINITIONS.find((item) => item.key === 'mining_associated_gas_1mw')?.patterns || [],
            answer_template: localized.mining_associated_gas_1mw,
            handoff_required: true,
            handoff_reason: 'lead',
            next_fields: ['application', 'power', 'gas_quality', 'country', 'voltage_frequency', 'deployment'],
            source_refs: sourceByIntent.mining_associated_gas_1mw,
        },
    ];
}

function canonicalFallbackRule(intentKey: string, language: string): FaqRule | null {
    const localizedLanguage = normalizeLanguage(language, 'en');
    const sourceByIntent: Record<string, SourceRef[]> = {
        product_overview: [{ title: 'GasGx Offering Map', url: 'kb://gasgx/offering-overview', source_type: 'internal_sales_kb' }],
        quote_requirements: [{ title: 'Quotation Checklist', url: 'kb://gasgx/quote-checklist', source_type: 'internal_sales_kb' }],
        contact_support: [{ title: 'Support Scope', url: 'kb://gasgx/support-scope', source_type: 'internal_sales_kb' }],
        mining_associated_gas_1mw: [{ title: 'Project Qualification Playbook', url: 'kb://gasgx/project-qualification', source_type: 'internal_sales_kb' }],
    };

    const handoffByIntent: Record<string, HandoffMeta> = {
        product_overview: { required: false, reason: 'unknown', next_fields: [] },
        quote_requirements: { required: true, reason: 'quote', next_fields: ['application', 'power', 'gas_type', 'country', 'voltage_frequency', 'deployment'] },
        contact_support: { required: true, reason: 'support', next_fields: ['application', 'power', 'gas_type', 'issue_or_goal'] },
        mining_associated_gas_1mw: { required: true, reason: 'lead', next_fields: ['application', 'power', 'gas_quality', 'country', 'voltage_frequency', 'deployment'] },
    };

    const answerCatalog = {
        en: {
            product_overview: 'GasGx mainly covers generator product lines by power range, gas source, cooling and deployment format; solution families for oilfield, mining, industrial energy and CHP; digital systems such as O&M Platform, ECM, IMS and Sales System; plus support resources including case studies, datasheets, certifications and FAQ. If you share your scenario, target power and gas source, I can narrow the recommendation.',
            quote_requirements: `GasGx can support a formal quotation, but exact pricing depends on the application, target load, gas type and gas quality, deployment format, country, voltage and frequency, plus whether controls, cooling, switchgear, miners and remote O&M are in scope. If you share those inputs, I can turn them into a concise pre-sales brief for follow-up at ${CONTACT_EMAIL}.`,
            contact_support: `You can contact GasGx at ${CONTACT_EMAIL}. GasGx also supports technical support, after-sales service and service-network coordination. If you share the scenario, power range and gas source first, I can help structure the request before manual follow-up.`,
            mining_associated_gas_1mw: 'For a 1 MW mining site powered by associated or flare gas, GasGx would usually start with a 1 MW+ gas-power solution, typically containerized or AIS-integrated for field deployment. The next critical checks are gas quality, miner load, voltage and frequency, grid mode, country, ambient conditions and the O&M model.',
        },
        zh: {
            product_overview: 'GasGx 目前主要覆盖四类能力：一是燃气发电机组产品线，按功率段、气源、冷却方式和部署形式组织；二是油田伴生气、矿场供电、工业分布式能源和 CHP 等解决方案；三是 O&M Platform、ECM、IMS、Sales System 等数字化系统；四是技术支持、售后服务、服务网络、案例、白皮书、参数表、认证和 FAQ 等配套资源。如果你告诉我应用场景、目标功率和气源类型，我可以继续缩小到更合适的产品方向。',
            quote_requirements: `GasGx 可以配合正式报价，但准确价格通常取决于应用场景、目标负载、气源类型与气质、部署形式、国家地区、电压频率，以及是否包含控制、冷却、开关柜、矿机和远程运维等范围。如果你把这些信息发给我，我可以先帮你整理成一份售前需求简表，再转给 ${CONTACT_EMAIL} 跟进。`,
            contact_support: `你可以通过 ${CONTACT_EMAIL} 联系 GasGx。GasGx 也支持技术支持、售后服务和服务网络协调。如果你先告诉我项目场景、功率范围和气源类型，我可以先帮你整理需求，再交给人工继续跟进。`,
            mining_associated_gas_1mw: '如果是 1MW 级矿场使用伴生气或火炬气供电，GasGx 通常会优先从 1MW+ 级燃气发电方案切入，常见部署形式是集装箱化或 AIS 一体化。下一步最关键的是确认气质、矿机负载、电压频率、并网还是离网、所在国家与环境条件，以及后续运维模式。',
        },
        ru: {
            product_overview: 'GasGx в основном охватывает четыре группы возможностей: газогенераторные установки по диапазону мощности, типу газа, охлаждению и формату размещения; решения для нефтепромыслов, майнинга, промышленной распределенной энергетики и CHP; цифровые системы O&M Platform, ECM, IMS и Sales System; а также сервисные ресурсы, включая кейсы, даташиты, сертификаты и FAQ. Если вы опишете сценарий, требуемую мощность и тип газа, я сузю рекомендацию.',
            quote_requirements: `GasGx может подготовить коммерческое предложение, но точная цена зависит от сценария проекта, требуемой нагрузки, типа и качества газа, формата установки, страны, напряжения и частоты, а также состава поставки. Если вы пришлете эти данные, я помогу оформить краткий пресейл-бриф для follow-up через ${CONTACT_EMAIL}.`,
            contact_support: `Связаться с GasGx можно по адресу ${CONTACT_EMAIL}. GasGx также поддерживает техническую поддержку, послепродажный сервис и координацию сервисной сети. Если вы сначала опишете сценарий, диапазон мощности и тип газа, я помогу структурировать запрос перед ручным сопровождением.`,
            mining_associated_gas_1mw: 'Для майнинговой площадки уровня 1 MW на попутном или факельном газе GasGx обычно начинает с решения уровня 1 MW+ на газовой генерации, чаще всего в контейнерном или AIS-интегрированном формате. Далее нужно уточнить качество газа, нагрузку майнеров, напряжение и частоту, режим сети, страну, условия площадки и модель эксплуатации.',
        },
    } as const;

    const localizedAnswers = answerCatalog[localizedLanguage as keyof typeof answerCatalog] || answerCatalog.en;
    const answerTemplate = localizedAnswers[intentKey as keyof typeof localizedAnswers];
    const handoff = handoffByIntent[intentKey];
    if (!answerTemplate || !handoff) {
        return null;
    }
    return {
        id: `canonical:${localizedLanguage}:${intentKey}`,
        intent_key: intentKey,
        language: localizedLanguage,
        trigger_patterns: INTENT_DEFINITIONS.find((item) => item.key === intentKey)?.patterns || [],
        answer_template: answerTemplate,
        handoff_required: handoff.required,
        handoff_reason: handoff.reason,
        next_fields: handoff.next_fields,
        source_refs: sourceByIntent[intentKey] || [],
    };
}

function pickFaqRule(message: string, language: string, rules: FaqRule[], preferredIntent = ''): FaqRule | null {
    const normalized = normalizedIntentText(message);
    let bestRule: FaqRule | null = null;
    let bestScore = 0;
    for (const rule of rules) {
        const patternScore = scorePatterns(normalized, rule.trigger_patterns);
        if (patternScore <= 0) continue;
        const score = patternScore + (rule.language === language ? 0.2 : 0);
        if (score > bestScore) {
            bestRule = rule;
            bestScore = score;
        }
    }
    if (bestScore > 0) {
        return bestRule;
    }
    if (!preferredIntent) {
        return null;
    }
    const localizedFallback = canonicalFallbackRule(preferredIntent, language);
    if (localizedFallback) {
        return localizedFallback;
    }
    return rules.find((rule) => rule.intent_key === preferredIntent && rule.language === language)
        || rules.find((rule) => rule.intent_key === preferredIntent)
        || null;
}

function pickCountryStrandedGasRule(message: string, language: string, rules: FaqRule[]): FaqRule | null {
    const normalized = normalizedIntentText(message);
    const mentionsStrandedTopic = /(stranded gas|associated gas|flare gas|flared gas|apg|bitcoin mining|mining power|gas power mining)/.test(normalized);
    if (!mentionsStrandedTopic) return null;

    const byIntent = (intentKey: string) =>
        rules.find((rule) => rule.intent_key === intentKey && rule.language === language)
        || rules.find((rule) => rule.intent_key === intentKey);

    if (/(united states|usa|us\b|america)/.test(normalized)) {
        return byIntent('stranded_gas_us');
    }
    if (/canada/.test(normalized)) {
        return byIntent('stranded_gas_canada');
    }
    if (/(russia|russian)/.test(normalized)) {
        return byIntent('stranded_gas_russia');
    }
    return null;
}

function normalizeSource(value: unknown): SourceRef | null {
    const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
    const title = text(source.title);
    if (!title) return null;
    return {
        title,
        url: text(source.url),
        source_type: text(source.source_type || source.sourceType, 'internal_sales_kb'),
    };
}

function uniqueSources(items: SourceRef[], limit = 3): SourceRef[] {
    const seen = new Set<string>();
    const output: SourceRef[] = [];
    for (const item of items) {
        const source = normalizeSource(item);
        if (!source) continue;
        const key = `${source.title}::${source.url}::${source.source_type}`;
        if (seen.has(key)) continue;
        seen.add(key);
        output.push(source);
        if (output.length >= limit) break;
    }
    return output;
}

function toKnowledgeHit(row: Record<string, unknown>): KnowledgeChunkHit {
    return {
        chunk_id: text(row.chunk_id || row.id),
        document_id: text(row.document_id),
        title: text(row.title),
        canonical_url: text(row.canonical_url),
        source_type: text(row.source_type, 'public_page'),
        visibility: text(row.visibility, 'public'),
        language: normalizeLanguage(row.language, 'en'),
        section_path: text(row.section_path),
        chunk_text: text(row.chunk_text),
        chunk_summary: text(row.chunk_summary),
        keywords: Array.isArray(row.keywords) ? row.keywords.map((item) => text(item)).filter(Boolean) : [],
        score: Number(row.score ?? 0) || 0,
    };
}

async function loadFaqRules(client: ReturnType<typeof createServiceClient>, language: string): Promise<FaqRule[]> {
    const { data, error } = await client
        .from('chat_faq_rules')
        .select('id, intent_key, language, trigger_patterns, answer_template, handoff_required, handoff_reason, next_fields, source_refs')
        .eq('status', 'published')
        .in('language', Array.from(new Set([language, 'en'])))
        .order('updated_at', { ascending: false });
    if (error) {
        console.warn('site-chat faq load failed', error);
        return fallbackFaqRules(language);
    }
    const rows = Array.isArray(data) ? data.map((row) => toFaqRule(row as Record<string, unknown>)) : [];
    return rows.length ? rows : fallbackFaqRules(language);
}

function extractSearchTerms(message: string): string[] {
    const rawTerms = normalizedIntentText(message).match(/[a-z0-9]{2,}|[\u0400-\u04FF]{2,}|[\u4e00-\u9fff]{2,}/g) || [];
    const stopwords = new Set([
        'what', 'which', 'where', 'when', 'why', 'how', 'do', 'does', 'did', 'you', 'your', 'for', 'and', 'the', 'that', 'this', 'with', 'from', 'into', 'have', 'has', 'can',
        'это', 'как', 'для', 'или', 'что', 'мне', 'вам', 'если', 'есть',
    ]);
    return Array.from(new Set(
        rawTerms
            .map((item) => item.trim())
            .filter((item) => item && !stopwords.has(item)),
    )).slice(0, 8);
}

function buildSearchQueries(message: string): string[] {
    const base = text(message);
    const terms = extractSearchTerms(base);
    const expandedQueries: string[] = [];
    const normalized = normalizedIntentText(base);
    if (isCountryStrandedGasQuery(base)) {
        if (/(united states|usa|us\b|america)/.test(normalized)) {
            expandedQueries.push(
                'united states stranded gas flare gas mining',
                'usa associated gas flare gas bitcoin mining',
                'united states oilfield flare mitigation mobile compute',
            );
        }
        if (/canada/.test(normalized)) {
            expandedQueries.push(
                'canada stranded gas flare venting methane mining',
                'canada remote basin flare reduction gas power mining',
                'alberta british columbia saskatchewan stranded gas mining',
            );
        }
        if (/(russia|russian)/.test(normalized)) {
            expandedQueries.push(
                'russia associated petroleum gas apg mining',
                'russia apg utilization remote oilfield mining',
                'russia flare gas associated gas digital load',
            );
        }
    }
    return Array.from(new Set([
        base,
        terms.join(' '),
        terms.slice(0, 4).join(' '),
        terms.slice(0, 2).join(' '),
        ...expandedQueries,
    ].map((item) => text(item)).filter(Boolean)));
}

function normalizeUrlPath(value: string): string {
    const input = text(value).toLowerCase();
    if (!input) return '';
    try {
        const parsed = input.startsWith('http://') || input.startsWith('https://')
            ? new URL(input)
            : new URL(input.startsWith('/') ? input : `/${input}`, 'https://www.gasgx.com');
        const normalizedPath = (parsed.pathname || '/').replace(/\/{2,}/g, '/');
        if (normalizedPath === '/') return normalizedPath;
        return `${normalizedPath.replace(/\/+$/, '')}/`;
    } catch (_error) {
        const stripped = input.split('#')[0]?.split('?')[0] || '';
        if (!stripped) return '';
        const normalizedPath = `${stripped.startsWith('/') ? stripped : `/${stripped}`}`.replace(/\/{2,}/g, '/');
        if (normalizedPath === '/') return normalizedPath;
        return `${normalizedPath.replace(/\/+$/, '')}/`;
    }
}

function pathSegments(value: string): string[] {
    return normalizeUrlPath(value)
        .split('/')
        .map((item) => item.trim())
        .filter(Boolean);
}

function primarySection(value: string): string {
    return pathSegments(value)[0] || '';
}

function splitKeywordTokens(value: string): string[] {
    const matches = text(value)
        .toLowerCase()
        .replace(/[-_/]+/g, ' ')
        .match(/[a-z0-9]{2,}|[\u0400-\u04FF]{2,}|[\u4e00-\u9fff]{2,}/g) || [];
    return Array.from(new Set(matches.filter(Boolean)));
}

function meaningfulPathSegments(value: string): string[] {
    const segments = pathSegments(value);
    if (!segments.length) return [];
    const filtered = segments.filter((segment, index) => index > 0 && !GENERIC_PATH_SEGMENTS.has(segment));
    if (filtered.length) {
        return filtered;
    }
    return segments.slice(-2);
}

function pathSignature(value: string): string {
    const section = primarySection(value);
    const meaningful = meaningfulPathSegments(value);
    return `${section}:${meaningful.join('/') || normalizeUrlPath(value)}`;
}

function structuralPathSegments(value: string): string[] {
    return pathSegments(value)
        .filter((segment, index) => index > 0 && segment !== 'gas');
}

function sharedStructuralPrefixLength(a: string, b: string): number {
    const left = structuralPathSegments(a);
    const right = structuralPathSegments(b);
    let count = 0;
    const max = Math.min(left.length, right.length);
    for (let index = 0; index < max; index += 1) {
        if (left[index] !== right[index]) {
            break;
        }
        count += 1;
    }
    return count;
}

function buildKnowledgeQueryTokens(message: string, pageContext: PageContext): string[] {
    return Array.from(new Set([
        ...extractSearchTerms(message),
        ...splitKeywordTokens(pageContext.title),
        ...meaningfulPathSegments(pageContext.path || pageContext.url),
    ]));
}

function isCountryStrandedGasQuery(message: string): boolean {
    const normalized = normalizedIntentText(message);
    const mentionsCountry = /(united states|usa|us\b|america|canada|russia|russian)/.test(normalized);
    const mentionsTopic = /(stranded gas|associated gas|flare gas|flared gas|apg|bitcoin mining|mining power|gas power mining)/.test(normalized);
    return mentionsCountry && mentionsTopic;
}

function inferPreferredSections(message: string, matchedIntent: string, pageContext: PageContext): string[] {
    const preferred = new Set<string>();
    const currentSection = primarySection(pageContext.path || pageContext.url);
    if (currentSection) {
        preferred.add(currentSection);
    }

    if (matchedIntent === 'product_overview') {
        ['products', 'solutions', 'digitalization', 'support', 'resources'].forEach((item) => preferred.add(item));
    } else if (matchedIntent === 'quote_requirements') {
        ['products', 'solutions', 'support', 'resources'].forEach((item) => preferred.add(item));
    } else if (matchedIntent === 'contact_support') {
        ['support', 'resources', 'about'].forEach((item) => preferred.add(item));
    } else if (matchedIntent === 'mining_associated_gas_1mw') {
        ['solutions', 'products', 'resources'].forEach((item) => preferred.add(item));
    }

    const normalized = normalizedIntentText(message);
    if (/(datasheet|whitepaper|case stud|certif|faq|brochure|manual|resource)/.test(normalized)) {
        preferred.add('resources');
    }
    if (/(support|service|after-sales|commissioning|maintenance|parts)/.test(normalized)) {
        preferred.add('support');
    }
    if (/(ecm|ims|o&m|platform|digital|monitor)/.test(normalized)) {
        preferred.add('digitalization');
    }
    if (/(mining|oilfield|industrial|chp|data center|associated gas|flare gas)/.test(normalized)) {
        preferred.add('solutions');
    }
    if (/(generator|genset|container|skid|ais|natural gas|low methane|cooling|power range)/.test(normalized)) {
        preferred.add('products');
    }

    return Array.from(preferred);
}

function overlapCount(reference: Set<string>, candidates: string[]): number {
    let count = 0;
    for (const candidate of candidates) {
        if (reference.has(candidate)) {
            count += 1;
        }
    }
    return count;
}

function sharedMeaningfulSegmentCount(a: string, b: string): number {
    const left = new Set(meaningfulPathSegments(a));
    let count = 0;
    for (const segment of meaningfulPathSegments(b)) {
        if (left.has(segment)) {
            count += 1;
        }
    }
    return count;
}

function knowledgeSourceKey(value: string): string {
    const normalizedPath = normalizeUrlPath(value);
    const section = primarySection(normalizedPath);
    const meaningful = meaningfulPathSegments(normalizedPath);
    return `${section}:${meaningful.join('/') || normalizedPath || text(value).toLowerCase()}`;
}

async function searchKnowledge(client: ReturnType<typeof createServiceClient>, message: string, language: string): Promise<KnowledgeChunkHit[]> {
    const bestHits = new Map<string, KnowledgeChunkHit>();
    for (const query of buildSearchQueries(message)) {
        const { data, error } = await client.rpc('search_knowledge_chunks', {
            search_term: query,
            search_language: language,
            result_limit: KNOWLEDGE_SEARCH_LIMIT,
        });
        if (error) {
            console.warn('site-chat knowledge search failed', error);
            continue;
        }
        const hits = Array.isArray(data) ? data.map((row) => toKnowledgeHit(row as Record<string, unknown>)).filter((row) => row.chunk_text) : [];
        for (const hit of hits) {
            const key = text(hit.chunk_id || `${hit.document_id}:${hit.section_path}:${hit.chunk_text.slice(0, 160)}`);
            const previous = bestHits.get(key);
            if (!previous || hit.score > previous.score) {
                bestHits.set(key, hit);
            }
        }
    }
    return Array.from(bestHits.values());
}

async function loadCurrentPageKnowledge(client: ReturnType<typeof createServiceClient>, pageContext: PageContext): Promise<KnowledgeChunkHit[]> {
    const currentUrl = text(pageContext.url);
    if (!currentUrl) return [];
    const { data, error } = await client
        .from('knowledge_documents')
        .select('id, title, canonical_url, source_type, visibility, language, excerpt, content_markdown')
        .eq('canonical_url', currentUrl)
        .eq('status', 'published')
        .limit(1);
    if (error || !Array.isArray(data) || !data.length) return [];
    const doc = data[0] as Record<string, unknown>;
    return [{
        chunk_id: `page:${text(doc.id)}`,
        document_id: text(doc.id),
        title: text(doc.title),
        canonical_url: text(doc.canonical_url),
        source_type: text(doc.source_type, 'public_page'),
        visibility: text(doc.visibility, 'public'),
        language: normalizeLanguage(doc.language, 'en'),
        section_path: 'page_context',
        chunk_text: text(doc.excerpt || doc.content_markdown).slice(0, 1400),
        chunk_summary: text(doc.excerpt),
        keywords: [],
        score: 9,
    }];
}

function rerankKnowledgeHits(hits: KnowledgeChunkHit[], context: KnowledgeSearchContext): KnowledgeChunkHit[] {
    const currentPath = normalizeUrlPath(context.pageContext.url || context.pageContext.path);
    const currentSection = primarySection(currentPath);
    const currentSignature = pathSignature(currentPath);
    const preferredSections = new Set(inferPreferredSections(context.message, context.matchedIntent, context.pageContext));
    const queryTokens = new Set(buildKnowledgeQueryTokens(context.message, context.pageContext));

    const ranked = hits.map((hit, index) => {
        const hitPath = normalizeUrlPath(hit.canonical_url);
        const hitSection = primarySection(hitPath);
        const hitSignature = pathSignature(hitPath);
        const titleTokens = splitKeywordTokens(hit.title);
        const pathTokens = meaningfulPathSegments(hitPath);
        const keywordTokens = Array.from(new Set(hit.keywords.flatMap((item) => splitKeywordTokens(item))));

        let adjustedScore = Number(hit.score || 0);

        if (currentPath && hitPath === currentPath) {
            adjustedScore += 8;
        }
        if (currentSection && hitSection === currentSection) {
            adjustedScore += 2.6;
        }
        if (hitSection && preferredSections.has(hitSection)) {
            adjustedScore += 1.6;
        } else if (hitSection && preferredSections.size) {
            adjustedScore -= 1.1;
        }
        if (currentSignature && hitSignature === currentSignature && hitPath !== currentPath) {
            adjustedScore += 1.8;
        }

        const titleOverlap = overlapCount(queryTokens, titleTokens);
        const pathOverlap = overlapCount(queryTokens, pathTokens);
        const keywordOverlap = overlapCount(queryTokens, keywordTokens);
        const sharedSegments = currentPath ? sharedMeaningfulSegmentCount(currentPath, hitPath) : 0;
        const structuralPrefix = currentPath ? sharedStructuralPrefixLength(currentPath, hitPath) : 0;

        adjustedScore += (titleOverlap * 0.9)
            + (pathOverlap * 1.35)
            + (keywordOverlap * 0.45)
            + Math.min(2.4, sharedSegments * 1.1)
            + Math.min(3.2, structuralPrefix * 1.25);

        if (hit.language === context.language) {
            adjustedScore += 0.35;
        }
        if (isCountryStrandedGasQuery(context.message) && hit.source_type === 'internal_sales_kb') {
            adjustedScore += 4.5;
        }
        if (currentPath && hitPath && currentSection === 'products' && structuralPrefix === 0) {
            adjustedScore -= 1.25;
        }
        if (currentSection && hitSection && currentSection !== hitSection && sharedSegments === 0 && pathOverlap === 0 && titleOverlap === 0) {
            adjustedScore -= 0.9;
        }

        return {
            hit,
            adjustedScore,
            hitPath,
            hitSection,
            index,
        };
    });

    const hasCurrentSectionCoverage = Boolean(currentSection) && ranked.some((item) => item.hitSection === currentSection);
    if (hasCurrentSectionCoverage) {
        ranked.forEach((item) => {
            if (item.hitSection && item.hitSection !== currentSection) {
                item.adjustedScore -= 1.35;
            }
        });
    }

    return ranked
        .sort((left, right) => right.adjustedScore - left.adjustedScore || left.index - right.index)
        .map((item) => ({
            ...item.hit,
            score: item.adjustedScore,
        }));
}

function dedupeKnowledgeHits(hits: KnowledgeChunkHit[], pageContext?: PageContext): KnowledgeChunkHit[] {
    const seenExact = new Set<string>();
    const sourcePrimaryPaths = new Map<string, string>();
    const pathCounts = new Map<string, number>();
    const currentPath = normalizeUrlPath(pageContext?.url || pageContext?.path || '');
    const output: KnowledgeChunkHit[] = [];
    for (const hit of hits) {
        const exactKey = `${hit.document_id}:${hit.section_path}:${hit.chunk_text}`;
        if (seenExact.has(exactKey)) continue;
        seenExact.add(exactKey);

        const hitPath = normalizeUrlPath(hit.canonical_url);
        const sourceKey = knowledgeSourceKey(hit.canonical_url || hit.title || hit.section_path || hit.document_id);
        const canonicalPathKey = hitPath || sourceKey;
        const primaryPath = sourcePrimaryPaths.get(sourceKey);
        if (!primaryPath) {
            sourcePrimaryPaths.set(sourceKey, canonicalPathKey);
        } else if (primaryPath !== canonicalPathKey) {
            continue;
        }

        const pathKey = sourcePrimaryPaths.get(sourceKey) || canonicalPathKey;
        const nextCount = (pathCounts.get(pathKey) || 0) + 1;
        const maxPerPath = hitPath && hitPath === currentPath ? 2 : 1;
        if (nextCount > maxPerPath) continue;
        pathCounts.set(pathKey, nextCount);

        output.push(hit);
        if (output.length >= DEFAULT_TOP_K) break;
    }
    return output;
}

function focusKnowledgeHitsForCurrentSection(hits: KnowledgeChunkHit[], pageContext?: PageContext): KnowledgeChunkHit[] {
    const hasInternalSalesKb = hits.some((hit) => hit.source_type === 'internal_sales_kb');
    if (hasInternalSalesKb) {
        return hits;
    }
    const currentPath = normalizeUrlPath(pageContext?.url || pageContext?.path || '');
    const currentSection = primarySection(currentPath);
    if (!currentSection) return hits;

    const sameSectionHits = hits.filter((hit) => primarySection(hit.canonical_url) === currentSection);
    const hasExactCurrentPageHit = sameSectionHits.some((hit) => normalizeUrlPath(hit.canonical_url) === currentPath);
    if (sameSectionHits.length >= 2 || (hasExactCurrentPageHit && sameSectionHits.length >= 1)) {
        const currentMeaningfulSegments = meaningfulPathSegments(currentPath);
        if (currentMeaningfulSegments.length >= 2) {
            const sharedSubpathHits = sameSectionHits.filter((hit) => sharedMeaningfulSegmentCount(currentPath, hit.canonical_url) >= 2);
            if (sharedSubpathHits.length >= 2 || (hasExactCurrentPageHit && sharedSubpathHits.length >= 1)) {
                return sharedSubpathHits;
            }
        }
        return sameSectionHits;
    }
    return hits;
}

function buildKnowledgeSources(hits: KnowledgeChunkHit[], pageContext?: PageContext): SourceRef[] {
    const focusedHits = focusKnowledgeHitsForCurrentSection(hits, pageContext);
    const seen = new Set<string>();
    const output: SourceRef[] = [];
    for (const hit of focusedHits) {
        const sourceKey = knowledgeSourceKey(hit.canonical_url || hit.title || hit.section_path || hit.document_id);
        if (seen.has(sourceKey)) continue;
        seen.add(sourceKey);
        const source = normalizeSource({
            title: hit.title || hit.section_path || 'GasGx Knowledge',
            url: hit.canonical_url,
            source_type: hit.source_type || 'public_page',
        });
        if (!source) continue;
        output.push(source);
        if (output.length >= 4) break;
    }
    return output;
}

function buildLanguageRule(language: string): string {
    if (language === 'zh') {
        return 'Reply in Simplified Chinese unless the user explicitly asks for another language. Keep technical units such as kW, MW, V, Hz, container, AIS and skid terms accurate.';
    }
    if (language === 'ru') {
        return 'Reply in Russian unless the user explicitly asks for another language. Keep technical units and product-family labels accurate.';
    }
    return 'Reply in clear English unless the user explicitly asks for another language.';
}

function buildPageContextBlock(pageContext: PageContext): string[] {
    const lines: string[] = [];
    if (pageContext.title) lines.push(`- Current page title: ${pageContext.title}`);
    if (pageContext.path) lines.push(`- Current page path: ${pageContext.path}`);
    if (pageContext.url) lines.push(`- Current page URL: ${pageContext.url}`);
    return lines;
}

function buildKnowledgeBlock(hits: KnowledgeChunkHit[]): string[] {
    if (!hits.length) return [];
    const lines = ['Retrieved GasGx knowledge snippets:'];
    hits.slice(0, DEFAULT_TOP_K).forEach((hit, index) => {
        const snippet = text(hit.chunk_summary || hit.chunk_text).replace(/\s+/g, ' ').slice(0, 700);
        lines.push(`${index + 1}. [${hit.title || 'GasGx Knowledge'}] (${hit.source_type}${hit.section_path ? ` / ${hit.section_path}` : ''}) ${snippet}`);
        if (hit.canonical_url) {
            lines.push(`   Source URL: ${hit.canonical_url}`);
        }
    });
    return lines;
}

function buildSystemPrompt(language: string, pageContext: PageContext, extraInstructions: string, hits: KnowledgeChunkHit[]): string {
    return [
        'You are GasGx Assistant, the customer-facing pre-sales engineer and solution advisor for www.gasgx.com.',
        buildLanguageRule(language),
        'Your job is to help prospects, customers and partners understand GasGx products, solutions, quotation requirements, delivery boundaries, service scope and next-step project qualification.',
        '',
        'Priority rules:',
        '- Lead with a direct answer, not a disclaimer.',
        '- If retrieved GasGx knowledge exists, use it as the primary factual basis.',
        '- Keep the first answer concise but commercially useful.',
        '- Never fabricate exact inventory, lead time, pricing, warranty, certification status or contractual commitments.',
        `- When the conversation reaches quotation or project-intent stage, guide the user toward a structured handoff or ${CONTACT_EMAIL}.`,
        '- Ask only the minimum follow-up questions needed to advance qualification.',
        '',
        'Known GasGx offering map:',
        '- Generator products are organized by power range, gas source, cooling and deployment form.',
        '- Power range families: under 500 kW, 500-1000 kW and 1 MW+.',
        '- Gas fit includes natural gas, associated or flare gas and low-methane gas.',
        '- Deployment forms include containerized, AIS-integrated and skid-mounted units.',
        '- Solution families include oilfield power, mining or data-center power, industrial distributed energy and CHP.',
        '- Digital systems include O&M Platform, ECM, IMS and Sales System.',
        '- Support resources include technical support, after-sales service, service network, whitepapers, case studies, datasheets, certifications and FAQ.',
        '',
        ...buildKnowledgeBlock(hits),
        '',
        'Current page context:',
        ...buildPageContextBlock(pageContext),
        extraInstructions ? `Additional internal instructions: ${extraInstructions}` : '',
    ].filter(Boolean).join('\n');
}

function buildSparkMessages(systemPrompt: string, history: ChatTurn[], message: string) {
    return [
        { role: 'system', content: systemPrompt },
        ...history.map((item) => ({ role: item.role, content: item.content })),
        { role: 'user', content: message },
    ];
}

function handoffFromIntent(intentKey: string): HandoffMeta {
    if (intentKey === 'quote_requirements') {
        return {
            required: true,
            reason: 'quote',
            next_fields: ['application', 'power', 'gas_type', 'country', 'voltage_frequency', 'deployment'],
        };
    }
    if (intentKey === 'contact_support') {
        return {
            required: true,
            reason: 'support',
            next_fields: ['application', 'power', 'gas_type', 'issue_or_goal'],
        };
    }
    if (intentKey === 'mining_associated_gas_1mw') {
        return {
            required: true,
            reason: 'lead',
            next_fields: ['application', 'power', 'gas_quality', 'country', 'voltage_frequency', 'deployment'],
        };
    }
    return {
        required: false,
        reason: 'unknown',
        next_fields: [],
    };
}

function deriveHandoff(message: string, matchedIntent: string, matchedRule: FaqRule | null): HandoffMeta {
    if (matchedRule) {
        return {
            required: matchedRule.handoff_required,
            reason: matchedRule.handoff_reason || 'unknown',
            next_fields: matchedRule.next_fields || [],
        };
    }
    const intentDriven = handoffFromIntent(matchedIntent);
    if (intentDriven.required) return intentDriven;
    const normalized = normalizedIntentText(message);
    if (normalized.includes('quote') || normalized.includes('quotation') || normalized.includes('报价') || normalized.includes('стоимость')) {
        return handoffFromIntent('quote_requirements');
    }
    if (normalized.includes('support') || normalized.includes('售后') || normalized.includes('техподдержка')) {
        return handoffFromIntent('contact_support');
    }
    return intentDriven;
}

function composeKnowledgeFallbackReply(language: string, hits: KnowledgeChunkHit[], handoff: HandoffMeta): string {
    const sourceLines = hits.slice(0, 3).map((hit) => {
        const snippet = text(hit.chunk_summary || hit.chunk_text).replace(/\s+/g, ' ').slice(0, 220);
        return `- ${hit.title}: ${snippet}`;
    });

    if (language === 'zh') {
        return [
            '我先根据当前 GasGx 知识库里最相关的内容给你一个直接结论：',
            ...sourceLines,
            handoff.required && handoff.next_fields.length
                ? `如果你希望我继续往方案或报价方向推进，请补充：${handoff.next_fields.join('、')}。`
                : `如果你愿意，我也可以继续帮你整理成一份发给 ${CONTACT_EMAIL} 的售前需求简表。`,
        ].join('\n');
    }
    if (language === 'ru') {
        return [
            'Вот самый релевантный вывод по текущей базе знаний GasGx:',
            ...sourceLines,
            handoff.required && handoff.next_fields.length
                ? `Чтобы перейти к подбору решения или коммерческому предложению, пришлите: ${handoff.next_fields.join(', ')}.`
                : `При необходимости я также могу помочь оформить краткий пресейл-бриф для ${CONTACT_EMAIL}.`,
        ].join('\n');
    }
    return [
        'Here is the most relevant GasGx knowledge I can confirm right now:',
        ...sourceLines,
        handoff.required && handoff.next_fields.length
            ? `To move toward a solution or quotation, please share: ${handoff.next_fields.join(', ')}.`
            : `If helpful, I can also turn this into a short pre-sales brief for ${CONTACT_EMAIL}.`,
    ].join('\n');
}

async function insertChatLog(
    client: ReturnType<typeof createServiceClient>,
    payload: {
        sessionId: string;
        message: string;
        reply: string;
        language: string;
        provider: string;
        matchedIntent: string;
        pageContext: PageContext;
        sources: SourceRef[];
        handoff: HandoffMeta;
        failed?: boolean;
        errorCode?: string;
    },
) {
    const { error } = await client.from('chat_qa_logs').insert({
        session_id: payload.sessionId || '',
        user_message: payload.message,
        assistant_reply: payload.reply,
        language: payload.language,
        provider: payload.provider,
        matched_intent: payload.matchedIntent,
        page_context: payload.pageContext,
        source_refs: payload.sources,
        handoff: payload.handoff,
        failed: payload.failed === true,
        error_code: text(payload.errorCode),
    });
    if (error) {
        console.warn('site-chat log insert failed', error);
    }
}

async function insertLeadIntent(
    client: ReturnType<typeof createServiceClient>,
    payload: {
        sessionId: string;
        message: string;
        intent: string;
        language: string;
        provider: string;
        sources: SourceRef[];
        handoff: HandoffMeta;
    },
) {
    if (!payload.handoff.required) return;
    const summary = `Intent=${payload.intent || 'unknown'}; requested fields=${payload.handoff.next_fields.join(', ')}`;
    const { error } = await client.from('chat_lead_intents').insert({
        session_id: payload.sessionId || '',
        user_question: payload.message,
        detected_intent: payload.intent || 'unknown',
        project_summary: summary,
        required_followup_fields: payload.handoff.next_fields,
        contact_channel: CONTACT_EMAIL,
        language: payload.language,
        provider: payload.provider,
        source_refs: payload.sources,
    });
    if (error) {
        console.warn('site-chat lead insert failed', error);
    }
}

async function chatWithSpark(messages: Array<{ role: string; content: string }>): Promise<string> {
    const url = env('XFYUN_SPARK_URL');
    const appId = env('XFYUN_SPARK_APP_ID');
    const apiKey = env('XFYUN_SPARK_API_KEY');
    const apiSecret = env('XFYUN_SPARK_API_SECRET');
    const domain = env('XFYUN_SPARK_DOMAIN', DEFAULT_DOMAIN);
    const temperature = Number(env('XFYUN_SPARK_TEMPERATURE', '0.2')) || 0.2;
    const maxTokens = Math.max(256, Number(env('XFYUN_SPARK_MAX_TOKENS', '2048')) || 2048);

    if (!url || !appId || !apiKey || !apiSecret) {
        throw new Error('xfyun_spark_env_missing');
    }

    const authUrl = await createSparkAuthUrl(url, apiKey, apiSecret);
    const payload = {
        header: { app_id: appId, uid: 'gasgx-site-chat' },
        parameter: {
            chat: {
                domain,
                temperature,
                max_tokens: maxTokens,
            },
        },
        payload: {
            message: {
                text: messages,
            },
        },
    };

    return await new Promise<string>((resolve, reject) => {
        let settled = false;
        let chunks = '';
        const timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            try { socket.close(); } catch (_error) {}
            reject(new Error('spark_timeout'));
        }, SPARK_TIMEOUT_MS);

        const socket = new WebSocket(authUrl);

        socket.onopen = () => {
            socket.send(JSON.stringify(payload));
        };

        socket.onerror = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            reject(new Error('spark_socket_error'));
        };

        socket.onmessage = (event) => {
            try {
                const packet = JSON.parse(text(event.data));
                const header = packet?.header || {};
                const code = Number(header?.code ?? 0);
                if (code !== 0) {
                    throw new Error(`spark_code_${code}:${text(header?.message, '-')}`);
                }

                const choices = packet?.payload?.choices;
                const status = Number(choices?.status ?? -1);
                const parts = Array.isArray(choices?.text) ? choices.text : [];
                for (const item of parts) {
                    const content = text(item?.content);
                    if (content) chunks += content;
                }

                if (status === 2 && !settled) {
                    settled = true;
                    clearTimeout(timer);
                    socket.close();
                    resolve(chunks.trim());
                }
            } catch (error) {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                try { socket.close(); } catch (_error) {}
                reject(error instanceof Error ? error : new Error('spark_parse_error'));
            }
        };

        socket.onclose = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (chunks.trim()) {
                resolve(chunks.trim());
            } else {
                reject(new Error('spark_closed_without_reply'));
            }
        };
    });
}

Deno.serve(async (request) => {
    if (request.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
        return json({ ok: false, error: 'method_not_allowed' }, 405);
    }

    let serviceClient: ReturnType<typeof createServiceClient> | null = null;
    let parsedPayload: Record<string, unknown> = {};

    try {
        parsedPayload = await request.json().catch(() => ({})) as Record<string, unknown>;
        const message = text(parsedPayload?.message);
        const sessionId = text(parsedPayload?.sessionId);
        const pageContext = sanitizePageContext(parsedPayload?.pageContext);
        const history = sanitizeHistory(parsedPayload?.history || parsedPayload?.messages);
        const language = detectPreferredLanguage(parsedPayload?.language, message, pageContext);
        const extraInstructions = env('XFYUN_SPARK_CHAT_SYSTEM_PROMPT');

        if (!message) {
            return json({ ok: false, error: 'message_required' }, 400);
        }

        serviceClient = createServiceClient();

        const matchedIntent = detectIntent(message);
        const faqRules = await loadFaqRules(serviceClient, language);
        const matchedRule = pickCountryStrandedGasRule(message, language, faqRules)
            || pickFaqRule(message, language, faqRules, matchedIntent);

        if (matchedRule) {
            const sources = uniqueSources(matchedRule.source_refs || []);
            const handoff = deriveHandoff(message, matchedIntent || matchedRule.intent_key, matchedRule);
            await insertChatLog(serviceClient, {
                sessionId,
                message,
                reply: matchedRule.answer_template,
                language,
                provider: 'gasgx_policy',
                matchedIntent: matchedRule.intent_key,
                pageContext,
                sources,
                handoff,
            });
            await insertLeadIntent(serviceClient, {
                sessionId,
                message,
                intent: matchedRule.intent_key,
                language,
                provider: 'gasgx_policy',
                sources,
                handoff,
            });
            return json({
                ok: true,
                provider: 'gasgx_policy',
                reply: matchedRule.answer_template,
                language,
                sources,
                handoff,
                sessionId,
            });
        }

        const currentPageHits = await loadCurrentPageKnowledge(serviceClient, pageContext);
        const searchedHits = await searchKnowledge(serviceClient, message, language);
        const rankedKnowledgeHits = rerankKnowledgeHits([...currentPageHits, ...searchedHits], {
            message,
            language,
            matchedIntent,
            pageContext,
        });
        const knowledgeHits = focusKnowledgeHitsForCurrentSection(
            dedupeKnowledgeHits(rankedKnowledgeHits, pageContext),
            pageContext,
        );
        const sources = buildKnowledgeSources(knowledgeHits, pageContext);
        const handoff = deriveHandoff(message, matchedIntent, null);

        let reply = '';
        let provider = knowledgeHits.length ? 'gasgx_rag' : 'xfyun_spark';

        try {
            const systemPrompt = buildSystemPrompt(language, pageContext, extraInstructions, knowledgeHits);
            reply = await chatWithSpark(buildSparkMessages(systemPrompt, history, message));
        } catch (sparkError) {
            if (knowledgeHits.length) {
                reply = composeKnowledgeFallbackReply(language, knowledgeHits, handoff);
                provider = 'gasgx_rag';
            } else {
                throw sparkError;
            }
        }

        await insertChatLog(serviceClient, {
            sessionId,
            message,
            reply,
            language,
            provider,
            matchedIntent,
            pageContext,
            sources,
            handoff,
        });
        await insertLeadIntent(serviceClient, {
            sessionId,
            message,
            intent: matchedIntent,
            language,
            provider,
            sources,
            handoff,
        });

        return json({
            ok: true,
            provider,
            reply,
            language,
            sources,
            handoff,
            sessionId,
        });
    } catch (error) {
        console.error('site-chat error', error);
        if (serviceClient) {
            try {
                const message = text(parsedPayload?.message);
                const sessionId = text(parsedPayload?.sessionId);
                const pageContext = sanitizePageContext(parsedPayload?.pageContext);
                const language = detectPreferredLanguage(parsedPayload?.language, message, pageContext);
                await insertChatLog(serviceClient, {
                    sessionId,
                    message,
                    reply: '',
                    language,
                    provider: 'error',
                    matchedIntent: detectIntent(message),
                    pageContext,
                    sources: [],
                    handoff: { required: false, reason: 'unknown', next_fields: [] },
                    failed: true,
                    errorCode: error instanceof Error ? error.message : 'unknown_error',
                });
            } catch (_logError) {
                // Ignore logging failures in the error path.
            }
        }
        return json({
            ok: false,
            error: error instanceof Error ? error.message : 'unknown_error',
        }, 500);
    }
});
