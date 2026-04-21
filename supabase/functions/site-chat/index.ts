import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
};

const CONTACT_EMAIL = 'contact@gasgx.com';
const REQUIREMENT_INTAKE_URL = 'https://www.gasgx.com/quote/requirement.html';
const SITE_FIT_URL = 'https://www.gasgx.com/tools/site-fit/';
const GAS_FIT_URL = 'https://www.gasgx.com/tools/gas-fit/';
const ENGINE_SELECTION_URL = 'https://www.gasgx.com/tools/engine-selection/';
const DATASHEETS_URL = 'https://www.gasgx.com/resources/datasheets/';
const REPORTS_URL = 'https://www.gasgx.com/resources/reports/';
const FAQ_URL = 'https://www.gasgx.com/resources/faq/';
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

type CraftedReply = {
    provider: 'gasgx_rag' | 'gasgx_policy';
    reply: string;
    sources: SourceRef[];
    handoff: HandoffMeta;
    matchedIntent: string;
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
        key: 'requirement_intake',
        patterns: [
            'requirement form',
            'requirement intake',
            'project intake',
            'sales brief',
            'quotation form',
            'quote form',
            '需求单',
            '需求表',
            '填写需求',
            '售前表单',
            'форма заявки',
            'форма запроса',
            'коммерческая форма',
        ],
    },
    {
        key: 'site_fit_tool',
        patterns: [
            'site fit',
            'gas fit',
            'engine selection',
            'fit tool',
            'which tool',
            '站点适配',
            '气源适配',
            '选型工具',
            '可研工具',
            'подбор площадки',
            'подбор газа',
            'подбор двигателя',
        ],
    },
    {
        key: 'deployment_compare',
        patterns: [
            'container vs ais',
            'container vs skid',
            'ais vs skid',
            'deployment compare',
            'containerized vs ais',
            '部署区别',
            '部署差别',
            '集装箱 和 ais',
            '撬装 和 集装箱',
            'контейнер или ais',
            'контейнер или skid',
            'сравнение deployment',
        ],
    },
    {
        key: 'oilfield_scenario_fit',
        patterns: [
            'oilfield power',
            'oilfield associated gas',
            'wellhead power',
            'flare mitigation',
            '油田',
            '伴生气发电',
            '井口供电',
            'нефтепромысел',
            'попутный газ на месторождении',
            'энергия для oilfield',
        ],
    },
    {
        key: 'mining_scenario_fit',
        patterns: [
            'mining power',
            'bitcoin mining',
            'gas power mining',
            'data center power',
            '矿场',
            '算力',
            '比特币挖矿',
            'майнинг',
            'энергия для майнинга',
            'мощность для дата центра',
        ],
    },
    {
        key: 'industrial_scenario_fit',
        patterns: [
            'industrial power',
            'distributed generation',
            'factory power',
            'industrial plant',
            '工业发电',
            '工厂供电',
            '分布式能源',
            'промышленная генерация',
            'энергия для завода',
            'распределенная генерация',
        ],
    },
    {
        key: 'chp_scenario_fit',
        patterns: [
            'chp',
            'combined heat and power',
            'cogeneration',
            'heat recovery',
            '热电联供',
            '余热利用',
            '供热',
            'когенерация',
            'тепло и электроэнергия',
            'утилизация тепла',
        ],
    },
    {
        key: 'resource_guidance',
        patterns: [
            'datasheet',
            'data sheet',
            'report',
            'whitepaper',
            'faq',
            'case study',
            '参数表',
            '报告',
            '白皮书',
            '案例',
            '资料',
            'даташит',
            'отчет',
            'кейс',
            'faq',
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

function rawText(value: unknown, fallback = ''): string {
    return String(value ?? fallback);
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
    if (/[\u4e00-\u9fff]/.test(message)) return 'zh';
    if (/[\u0400-\u04FF]/.test(message)) return 'ru';
    if (explicit) return explicit;
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
            next_fields: ['application', 'power', 'gas_type', 'gas_quality', 'country', 'site_type', 'delivery_scope', 'service_scope'],
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
        quote_requirements: { required: true, reason: 'quote', next_fields: ['application', 'power', 'gas_type', 'gas_quality', 'country', 'site_type', 'delivery_scope', 'service_scope'] },
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

function phase1FallbackFaqCatalog(): Array<{
    intent_key: string;
    answer_template: string;
    handoff: HandoffMeta;
    source_refs: SourceRef[];
}> {
    return [
        {
            intent_key: 'requirement_intake',
            answer_template: `If the project is already moving toward budget, implementation or supplier comparison, the best next step is the GasGx requirement intake: ${REQUIREMENT_INTAKE_URL}. It captures application, power, gas type, gas quality, country, voltage and frequency, deployment preference, delivery scope and service scope in one place.`,
            handoff: {
                required: true,
                reason: 'quote',
                next_fields: ['application', 'power', 'gas_type', 'gas_quality', 'country', 'site_type', 'delivery_scope', 'service_scope'],
            },
            source_refs: [{ title: 'GasGx Requirement Intake', url: REQUIREMENT_INTAKE_URL, source_type: 'public_page' }],
        },
        {
            intent_key: 'site_fit_tool',
            answer_template: `For exploration-stage qualification, GasGx normally points users to the website tools rather than a quotation form. Site-fit is the best first screen for overall feasibility, gas-fit helps qualify the fuel boundary, and engine-selection helps narrow equipment direction.`,
            handoff: { required: false, reason: 'unknown', next_fields: [] },
            source_refs: [
                { title: 'Site Fit Tool', url: SITE_FIT_URL, source_type: 'public_page' },
                { title: 'Gas Fit Tool', url: GAS_FIT_URL, source_type: 'public_page' },
                { title: 'Engine Selection Tool', url: ENGINE_SELECTION_URL, source_type: 'public_page' },
            ],
        },
        {
            intent_key: 'deployment_compare',
            answer_template: 'Containerized deployment is usually the fastest packaged field option, AIS-integrated deployment is stronger when the project needs a tighter electrical or integration boundary, and skid-mounted deployment is more open when the site team or EPC side will absorb more balance-of-plant work.',
            handoff: {
                required: true,
                reason: 'lead',
                next_fields: ['application', 'power', 'gas_type', 'site_type', 'deployment', 'delivery_scope'],
            },
            source_refs: [{ title: 'Deployment Format Guide', url: 'kb://gasgx/deployment-compare', source_type: 'internal_sales_kb' }],
        },
        {
            intent_key: 'oilfield_scenario_fit',
            answer_template: `Oilfield gas-to-power is usually a strong fit when the site has repeatable gas availability, a defined electrical load and a clear field-service boundary. GasGx would normally qualify gas type and quality, available flow or pressure, target power, site conditions and service scope before moving to quotation.`,
            handoff: {
                required: true,
                reason: 'lead',
                next_fields: ['power', 'gas_type', 'gas_quality', 'available_flow', 'country', 'site_type'],
            },
            source_refs: [{ title: 'GasGx Solutions | Oilfield', url: 'https://www.gasgx.com/solutions/oilfield/', source_type: 'public_page' }],
        },
        {
            intent_key: 'mining_scenario_fit',
            answer_template: `Gas-to-power mining is usually a good fit when the site has repeatable gas supply, a stable compute load and a practical field O&M model. GasGx would normally confirm gas quality, target power or miner load, country, voltage or frequency and deployment preference before recommending a direction.`,
            handoff: {
                required: true,
                reason: 'lead',
                next_fields: ['power', 'gas_type', 'gas_quality', 'country', 'voltage_frequency', 'deployment'],
            },
            source_refs: [{ title: 'GasGx Solutions | Mining', url: 'https://www.gasgx.com/solutions/mining/', source_type: 'public_page' }],
        },
        {
            intent_key: 'industrial_scenario_fit',
            answer_template: `Industrial distributed generation is usually the right fit when the plant has a defined power profile, clear fuel availability and a realistic boundary for heat, cooling, grid interaction and service responsibility. GasGx would normally qualify power, gas type, site type, voltage or frequency and service scope before moving deeper.`,
            handoff: {
                required: true,
                reason: 'lead',
                next_fields: ['power', 'gas_type', 'site_type', 'voltage_frequency', 'service_scope'],
            },
            source_refs: [{ title: 'GasGx Solutions | Industrial', url: 'https://www.gasgx.com/solutions/industrial/', source_type: 'public_page' }],
        },
        {
            intent_key: 'chp_scenario_fit',
            answer_template: `CHP is usually a good fit only when the project has both a stable electrical load and a useful heat load that can actually be recovered. GasGx would normally confirm power, gas type, heat-use scenario, site type, service scope and delivery boundary before treating CHP as the preferred direction.`,
            handoff: {
                required: true,
                reason: 'lead',
                next_fields: ['power', 'gas_type', 'site_type', 'delivery_scope', 'service_scope'],
            },
            source_refs: [{ title: 'GasGx Solutions | CHP', url: 'https://www.gasgx.com/solutions/chp/', source_type: 'public_page' }],
        },
        {
            intent_key: 'resource_guidance',
            answer_template: `For documentation-stage questions, GasGx normally points users to the site resources first: datasheets for equipment details, reports or whitepapers for market and scenario context, and FAQ for short operational answers.`,
            handoff: { required: false, reason: 'unknown', next_fields: [] },
            source_refs: [
                { title: 'GasGx Datasheets', url: DATASHEETS_URL, source_type: 'public_page' },
                { title: 'GasGx Reports', url: REPORTS_URL, source_type: 'public_page' },
                { title: 'GasGx FAQ', url: FAQ_URL, source_type: 'public_page' },
            ],
        },
    ];
}

function phase1FallbackFaqRules(language: string): FaqRule[] {
    const normalizedLanguage = normalizeLanguage(language, 'en');
    return phase1FallbackFaqCatalog().map((item) => ({
        id: `phase1:${normalizedLanguage}:${item.intent_key}`,
        intent_key: item.intent_key,
        language: normalizedLanguage,
        trigger_patterns: INTENT_DEFINITIONS.find((definition) => definition.key === item.intent_key)?.patterns || [],
        answer_template: item.answer_template,
        handoff_required: item.handoff.required,
        handoff_reason: item.handoff.reason,
        next_fields: item.handoff.next_fields,
        source_refs: item.source_refs,
    }));
}

function phase1CanonicalFallbackRule(intentKey: string, language: string): FaqRule | null {
    const normalizedLanguage = normalizeLanguage(language, 'en');
    return phase1FallbackFaqRules(normalizedLanguage).find((rule) => rule.intent_key === intentKey) || null;
}

function pickPhase1ScenarioRule(message: string, language: string, rules: FaqRule[]): FaqRule | null {
    const normalized = normalizedIntentText(message);
    const mentionsOilfield = /(oilfield|wellhead|well site|井口|油田|伴生气发电|нефтепромыс|месторожд)/i.test(normalized);
    const mentionsMining = /(mining|bitcoin|miner|mining power|矿场|矿机|算力|挖矿|майнинг|дата центр)/i.test(normalized);
    const mentionsIndustrial = /(industrial|factory|plant|distributed generation|工厂|工业|分布式能源|промышлен|распределенн)/i.test(normalized);
    const mentionsChp = /(chp|combined heat and power|cogeneration|heat recovery|热电联供|余热利用|供热|когенерац|утилизац)/i.test(normalized);

    const byIntent = (intentKey: string) =>
        rules.find((rule) => rule.intent_key === intentKey && rule.language === language)
        || rules.find((rule) => rule.intent_key === intentKey);

    if (mentionsChp) return byIntent('chp_scenario_fit');
    if (mentionsOilfield && !mentionsMining) return byIntent('oilfield_scenario_fit');
    if (mentionsIndustrial && !mentionsMining) return byIntent('industrial_scenario_fit');
    if (mentionsMining) return byIntent('mining_scenario_fit');
    return null;
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
    const localizedFallback = phase1CanonicalFallbackRule(preferredIntent, language)
        || canonicalFallbackRule(preferredIntent, language);
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

function pickStrandedGasQuoteRule(message: string, language: string, rules: FaqRule[]): FaqRule | null {
    const normalized = normalizedIntentText(message);
    const strandedTopicPattern = new RegExp([
        'stranded gas',
        'associated gas',
        'flare gas',
        'flared gas',
        'apg',
        'bitcoin mining',
        'mining power',
        'gas power mining',
        '\u4f34\u751f\u6c14',
        '\u706b\u70ac\u6c14',
        '\u653e\u7a7a\u6c14',
        '\u653e\u6563\u6c14',
        '\u5f03\u6c14',
        '\u6cb9\u7530\u6c14',
        '\u77ff\u573a\u4f9b\u7535',
        '\u6cb9\u7530\u4f34\u751f\u6c14',
        '\u043f\u043e\u043f\u0443\u0442\u043d[\u0430-\u044f\u0451-]*\\s+\u0433\u0430\u0437[\u0430-\u044f\u0451-]*',
        '\u0444\u0430\u043a\u0435\u043b\u044c\u043d[\u0430-\u044f\u0451-]*\\s+\u0433\u0430\u0437[\u0430-\u044f\u0451-]*',
        '\u0430\u043f\u0433',
        '\u043d\u0435\u0444\u0442\u044f\u043d[\u0430-\u044f\u0451-]*\\s+\u0433\u0430\u0437[\u0430-\u044f\u0451-]*',
        '\u043c\u0430\u0439\u043d\u0438\u043d\u0433\\s+\u043d\u0430\\s+\u0433\u0430\u0437\u0435',
        '\u0433\u0430\u0437\u043e\u0432[\u0430-\u044f\u0451-]*\\s+\u0433\u0435\u043d\u0435\u0440\u0430\u0446[\u0430-\u044f\u0451-]*',
    ].join('|'), 'i');
    const quoteIntentPattern = new RegExp([
        'quote',
        'quotation',
        'price',
        'pricing',
        'budget',
        'cost',
        'how much',
        'proposal',
        'commercial offer',
        '\u62a5\u4ef7',
        '\u62a5\u4ef7\u5355',
        '\u8be2\u4ef7',
        '\u4ef7\u683c',
        '\u6210\u672c',
        '\u9884\u7b97',
        '\u591a\u5c11\u94b1',
        '\u0441\u0442\u043e\u0438\u043c\u043e\u0441\u0442[\u0430-\u044f\u0451-]*',
        '\u0446\u0435\u043d[\u0430-\u044f\u0451-]*',
        '\u0431\u044e\u0434\u0436\u0435\u0442[\u0430-\u044f\u0451-]*',
        '\u0440\u0430\u0441\u0447[\u0435\u0451]\u0442[\u0430-\u044f\u0451-]*',
        '\u043a\u043e\u043c\u043c\u0435\u0440\u0447\u0435\u0441\u043a[\u0430-\u044f\u0451-]*\\s+\u043f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d[\u0430-\u044f\u0451-]*',
        '\u043f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d[\u0430-\u044f\u0451-]*',
    ].join('|'), 'i');
    const mentionsStrandedTopic = strandedTopicPattern.test(normalized);
    const mentionsQuoteIntent = quoteIntentPattern.test(normalized);
    if (!mentionsStrandedTopic || !mentionsQuoteIntent) return null;

    return rules.find((rule) => rule.intent_key === 'stranded_gas_quote_checklist' && rule.language === language)
        || rules.find((rule) => rule.intent_key === 'stranded_gas_quote_checklist');
}

function localizedPolicyAnswer(rule: FaqRule, language: string): string {
    const usePhase1Override = rule.id.startsWith('phase1:') || rule.intent_key === 'quote_requirements';
    if (usePhase1Override) {
        const normalizedLanguage = normalizeLanguage(language, 'en');
        const catalog = {
            en: {
                quote_requirements: `GasGx can support a formal quotation, but it should be built from a structured project brief rather than a loose price request. The fastest path is the requirement intake at ${REQUIREMENT_INTAKE_URL}. Please prepare application, target power, gas type and gas quality, country, voltage and frequency, deployment preference, delivery scope and service scope.`,
                requirement_intake: `If the project is already moving toward budget, implementation or supplier comparison, the best next step is the GasGx requirement intake: ${REQUIREMENT_INTAKE_URL}. It captures application, power, gas type, gas quality, country, voltage and frequency, deployment preference, delivery scope and service scope in one place.`,
                site_fit_tool: `For exploration-stage qualification, GasGx normally points users to the website tools first. Use site-fit for overall feasibility, gas-fit for fuel boundary checks, and engine-selection when you want to narrow the equipment direction before asking for a quote.`,
                deployment_compare: 'Containerized deployment is usually best when the project needs a faster packaged field rollout; AIS-integrated deployment is stronger when the electrical interface and integrated balance of plant matter more; skid-mounted deployment is better when the site team or EPC side will absorb more custom field work.',
                oilfield_scenario_fit: `Oilfield gas-to-power is usually a strong fit when the site has repeatable gas availability, a defined electrical load and a workable field-service boundary. The next qualification inputs are normally gas type and quality, available flow or pressure, target power, country, site conditions and service scope. For an active project, move to ${REQUIREMENT_INTAKE_URL}; for early feasibility, start with ${SITE_FIT_URL}.`,
                mining_scenario_fit: `Gas-to-power mining is usually a good fit when the site has repeatable gas supply, a stable compute load and a practical field O&M model. GasGx would normally confirm gas quality, target power or miner load, country, voltage or frequency and deployment preference before recommending a direction. Early-stage screening fits ${SITE_FIT_URL}; project-stage qualification fits ${REQUIREMENT_INTAKE_URL}.`,
                industrial_scenario_fit: `Industrial distributed generation is usually the right fit when the plant has a defined power profile, clear fuel availability and a realistic boundary for grid interaction, cooling and service responsibility. GasGx would normally qualify power, gas type, site type, voltage or frequency and service scope before moving deeper.`,
                chp_scenario_fit: `CHP is usually the right fit only when the project has both a stable electrical load and a useful heat load that can actually be recovered. GasGx would normally confirm power, gas type, heat-use scenario, site type, delivery scope and service scope before treating CHP as the preferred direction.`,
                resource_guidance: `For documentation-stage questions, GasGx normally points users to site resources first: datasheets for equipment details, reports for market or scenario context, and FAQ for short operational answers. Start with ${DATASHEETS_URL}, ${REPORTS_URL} and ${FAQ_URL}.`,
            },
            zh: {
                quote_requirements: `GasGx 可以支持正式报价，但应该先基于结构化需求单，而不是只给一个松散的询价。最快的方式是填写公开需求入口：${REQUIREMENT_INTAKE_URL}。建议先准备应用场景、目标功率、气源类型与气质、国家地区、电压频率、部署偏好、交付范围和服务范围。`,
                requirement_intake: `如果项目已经进入预算、落地或供应商比较阶段，最合适的下一步就是填写 GasGx 公开需求单：${REQUIREMENT_INTAKE_URL}。这个入口会统一收集应用场景、目标功率、气源类型、气质、国家地区、电压频率、部署偏好、交付范围和服务范围。`,
                site_fit_tool: `如果你现在还处于可研或方向筛选阶段，GasGx 更建议先用站内工具而不是直接报价。整体可研先看 ${SITE_FIT_URL}，气源边界先看 ${GAS_FIT_URL}，设备方向筛选可以看 ${ENGINE_SELECTION_URL}。`,
                deployment_compare: '一般来说，集装箱化更适合追求快速打包部署的项目；AIS 一体化更适合电气边界和集成度要求更高的项目；撬装更适合由现场团队或 EPC 侧吸收更多定制化土建与配套工作的项目。',
                oilfield_scenario_fit: `油田伴生气发电通常适合那些气源相对稳定、站内负载明确、现场服务边界可控的项目。下一步通常要确认气源类型、气质、可用流量或压力、目标功率、国家地区、现场条件和服务范围。早期可研可先看 ${SITE_FIT_URL}，如果项目已经在推进，建议直接进入 ${REQUIREMENT_INTAKE_URL}。`,
                mining_scenario_fit: `燃气供能的算力 / 矿场项目，通常适合那些气源相对稳定、负载明确、现场运维模式清晰的站点。GasGx 下一步一般会确认气质、目标功率或矿机负载、国家地区、电压频率和部署偏好。早期筛选适合先看 ${SITE_FIT_URL}，项目推进阶段适合直接填写 ${REQUIREMENT_INTAKE_URL}。`,
                industrial_scenario_fit: '工业分布式发电通常适合那些用能轮廓明确、燃料边界清晰、并网 / 冷却 / 运维责任边界可定义的项目。GasGx 一般会先确认目标功率、气源类型、站点类型、电压频率和服务范围，再继续缩小方案。',
                chp_scenario_fit: 'CHP 热电联供只有在项目同时具备稳定电负荷和可被实际消纳的热负荷时才真正成立。GasGx 一般会先确认目标功率、气源类型、热利用场景、站点类型、交付范围和服务范围，再判断 CHP 是否应作为优先方向。',
                resource_guidance: `如果你当前主要是资料型需求，GasGx 更建议先看站内资源：设备细节优先看参数表，市场和场景背景优先看研究报告，简短运营问答优先看 FAQ。入口分别是 ${DATASHEETS_URL}、${REPORTS_URL} 和 ${FAQ_URL}。`,
            },
            ru: {
                quote_requirements: `GasGx может подготовить коммерческое предложение, но оно должно строиться на структурированном проектном брифе, а не на свободном запросе цены. Самый быстрый путь — заполнить публичный intake: ${REQUIREMENT_INTAKE_URL}. Подготовьте сценарий проекта, требуемую мощность, тип и качество газа, страну, напряжение и частоту, предпочтительный формат размещения, границы поставки и сервисный объем.`,
                requirement_intake: `Если проект уже перешел к бюджету, внедрению или сравнению поставщиков, лучший следующий шаг — публичная форма intake GasGx: ${REQUIREMENT_INTAKE_URL}. Она собирает сценарий проекта, мощность, тип и качество газа, страну, напряжение и частоту, предпочтительный deployment, границы поставки и сервисный объем.`,
                site_fit_tool: `Если вы еще на стадии предварительной оценки, GasGx обычно рекомендует сначала использовать инструменты сайта, а не идти сразу в quotation. Для общей feasibility — ${SITE_FIT_URL}, для оценки газа — ${GAS_FIT_URL}, для narrowing оборудования — ${ENGINE_SELECTION_URL}.`,
                deployment_compare: 'Как правило, контейнерный формат лучше, когда нужен быстрый упакованный запуск на площадке; AIS-интеграция сильнее там, где важнее электрическая граница и более плотная интеграция; skid лучше там, где команда площадки или EPC берут на себя больше кастомной полевой работы.',
                oilfield_scenario_fit: `Газопоршневая генерация для oilfield обычно хорошо подходит, когда на площадке есть повторяемый объем газа, понятная электрическая нагрузка и реалистичная сервисная граница. Дальше GasGx обычно уточняет тип и качество газа, доступный расход или давление, требуемую мощность, страну, условия площадки и сервисный объем. Для ранней оценки подходит ${SITE_FIT_URL}, для активного проекта — ${REQUIREMENT_INTAKE_URL}.`,
                mining_scenario_fit: `Gas-to-power для майнинга обычно подходит там, где есть повторяемый объем газа, стабильная вычислительная нагрузка и рабочая модель field O&M. Дальше GasGx обычно подтверждает качество газа, требуемую мощность или miner load, страну, напряжение и частоту, а также формат размещения. Для раннего screening подойдет ${SITE_FIT_URL}, для проектной qualification — ${REQUIREMENT_INTAKE_URL}.`,
                industrial_scenario_fit: 'Промышленная распределенная генерация обычно подходит там, где у площадки есть понятный профиль нагрузки, доступное топливо и реалистичная граница по сети, охлаждению и сервисной ответственности. GasGx обычно уточняет мощность, тип газа, тип площадки, напряжение и частоту, а также сервисный объем.',
                chp_scenario_fit: 'CHP действительно имеет смысл только тогда, когда у проекта есть и стабильная электрическая нагрузка, и полезная тепловая нагрузка, которую реально можно утилизировать. GasGx обычно уточняет мощность, тип газа, сценарий использования тепла, тип площадки, границы поставки и сервисный объем, прежде чем рекомендовать CHP как приоритетный путь.',
                resource_guidance: `Если запрос сейчас больше документный, GasGx обычно сначала направляет на ресурсы сайта: datasheets для деталей оборудования, reports для рыночного и сценарного контекста, FAQ для коротких operational answers. Начните с ${DATASHEETS_URL}, ${REPORTS_URL} и ${FAQ_URL}.`,
            },
        } as const;
        const localized = catalog[normalizedLanguage as keyof typeof catalog] || catalog.en;
        const override = localized[rule.intent_key as keyof typeof localized];
        if (override) {
            return override;
        }
    }
    if (rule.intent_key !== 'stranded_gas_quote_checklist') {
        return rule.answer_template;
    }
    if (language === 'zh') {
        return '如果是伴生气或火炬气发电、矿场供电类项目报价，GasGx 通常需要先确认：所在国家、盆地或省州，站点类型，目标功率或算力负载，气源类型，气体组分与杂质，可用流量与压力，电压频率，并网或离网模式，环境与防寒条件，期望部署形式，以及是否包含开关柜、冷却、箱体、监控和运维范围。还需要补充机动性要求、物流限制、调试模式、服务可达范围、燃气预处理边界，以及这是试点还是批量项目。在这些输入没有确认前，任何报价都应视为初步报价。';
    }
    if (language === 'ru') {
        return 'Для расчета коммерческого предложения по попутному или факельному газу GasGx обычно сначала уточняет: страну, бассейн или регион, тип площадки, целевую мощность или вычислительную нагрузку, тип газа, состав и примеси, доступный расход и давление, напряжение и частоту, режим работы с сетью или автономно, климатические условия и требования к зимизации, предпочтительный формат размещения, а также входят ли в объем switchgear, охлаждение, enclosure, мониторинг и сервис. Дополнительно нужно подтвердить требования к мобильности, логистические ограничения, модель пусконаладки, доступность сервиса, границы gas treatment и пилотный это проект или полномасштабное развертывание. До подтверждения этих данных любое предложение следует считать предварительным.';
    }
    return rule.answer_template;
}

function isContainerDeploymentPage(pageContext?: PageContext): boolean {
    const currentPath = normalizeUrlPath(pageContext?.url || pageContext?.path || '');
    return currentPath === '/products/deployment/container/';
}

function classifyContainerDeploymentQuery(message: string): 'quote' | 'qualification' | 'fit' | 'overview' | '' {
    const normalized = normalizedIntentText(message);
    if (!normalized) return '';
    if (/(quote|quotation|pricing|price|proposal|prepare|报价|询价|准备|стоимост|цен|коммерческ|предложен|подготов)/.test(normalized)) {
        return 'quote';
    }
    if (/(confirm|qualification|qualify|requirements|checklist|scope|what should be confirmed|需要确认|确认|清单|条件|подтверд|квалификац|чек|что нужно подготовить)/.test(normalized)) {
        return 'qualification';
    }
    if (/(fit|good fit|when is|when should|site fit|适合|适用|场景|подходит|когда|сценар)/.test(normalized)) {
        return 'fit';
    }
    if (/(container|containerized|deployment|集装箱|部署|контейнер|размещени)/.test(normalized)) {
        return 'overview';
    }
    return '';
}

function containerDeploymentSource(): SourceRef[] {
    return [{
        title: 'GasGx Product Catalog | Containerized',
        url: 'https://www.gasgx.com/products/deployment/container/',
        source_type: 'public_page',
    }];
}

function localizedContainerDeploymentReply(language: string, mode: 'quote' | 'qualification' | 'fit' | 'overview'): string {
    const catalog = {
        en: {
            quote: [
                'For a container deployment quotation, GasGx usually needs six items up front:',
                '- Application and target load, including whether the project is for oilfield power, mining, CHP or industrial use.',
                '- Gas source, gas quality, available flow and pressure.',
                '- Electrical target: required power, voltage, frequency, and whether the site is grid-tied or islanded.',
                '- Delivery scope: generator only, or generator plus switchgear, cooling, controls, enclosure, monitoring and commissioning support.',
                '- Site conditions: ambient temperature, altitude, dust, rain, winterization and noise limits.',
                '- Logistics and service boundaries: transport envelope, lifting access, installation window and service region.',
                `If you send those inputs, GasGx can turn them into a practical pre-sales brief and quotation scope for ${CONTACT_EMAIL}.`,
            ].join('\n'),
            qualification: [
                'For container deployment qualification, GasGx normally confirms these points first:',
                '- Whether the project needs a packaged outdoor power block with faster field installation and repeatable delivery.',
                '- Gas interface, electrical interface and target operating mode.',
                '- Enclosure scope, cooling path, controls and monitoring boundary.',
                '- Site civil and logistics constraints, including transport size, lifting access and commissioning conditions.',
                '- Service model, spare-parts expectation and who will operate the unit after start-up.',
            ].join('\n'),
            fit: 'Container deployment is usually the right fit when the project needs a packaged outdoor power block, faster field installation, repeatable rollout, clearer logistics boundaries and a cleaner O&M handoff than a loose equipment set.',
            overview: 'GasGx container deployment is positioned as a packaged outdoor power solution for projects that need faster deployment, repeatable site rollout and clearer scope control across power generation, enclosure and field delivery.',
        },
        zh: {
            quote: [
                '如果是集装箱部署项目报价，GasGx 通常会先确认六类信息：',
                '- 应用场景和目标负载，例如油田供电、矿场、CHP 或工业项目。',
                '- 气源类型、气质、可用流量和压力。',
                '- 电气目标，包括目标功率、电压、频率，以及并网还是离网。',
                '- 交付范围：是只要发电机组，还是同时包含开关柜、冷却、控制、箱体、监控和调试支持。',
                '- 现场条件，包括环境温度、海拔、粉尘、雨雪、防寒和噪音限制。',
                '- 物流与服务边界，包括运输尺寸、吊装条件、安装窗口和后续服务区域。',
                `如果你把这些信息发给我，GasGx 就可以进一步整理成一份可执行的售前简表和报价范围，继续交给 ${CONTACT_EMAIL} 跟进。`,
            ].join('\n'),
            qualification: [
                '如果要判断集装箱部署是否成立，GasGx 一般会先确认这些点：',
                '- 项目是否需要一体化户外电站，而不是分散设备拼装。',
                '- 气源接口、电气接口，以及目标运行模式。',
                '- 箱体范围、冷却路径、控制系统和监控边界。',
                '- 现场土建与物流限制，包括运输尺寸、吊装条件和调试环境。',
                '- 后续运维模式、备件预期，以及项目投运后由谁负责操作。',
            ].join('\n'),
            fit: '如果项目更看重一体化户外部署、现场安装更快、批量复制更容易，以及物流和运维边界更清晰，那么集装箱部署通常会比散装设备方案更合适。',
            overview: 'GasGx 的集装箱部署定位，是把发电、箱体和现场交付范围打包成更易落地的户外电力模块，适合追求部署速度、复制效率和边界清晰度的项目。',
        },
        ru: {
            quote: [
                'Для коммерческого предложения по контейнерному размещению GasGx обычно сначала уточняет шесть блоков данных:',
                '- Сценарий проекта и целевую нагрузку: нефтепромысловое энергоснабжение, майнинг, CHP или промышленное применение.',
                '- Тип газа, качество газа, доступный расход и давление.',
                '- Электрическую цель: требуемую мощность, напряжение, частоту и режим работы с сетью или автономно.',
                '- Границы поставки: только генераторный блок или также распределительное оборудование, охлаждение, систему управления, контейнер, мониторинг и пусконаладочную поддержку.',
                '- Условия площадки: температура, высота, пыль, осадки, требования к зимизации и ограничения по шуму.',
                '- Логистические и сервисные границы: транспортный габарит, подъемный доступ, окно монтажа и сервисный регион.',
                `Если вы пришлете эти данные, GasGx сможет собрать практичный пресейл-бриф и рамку коммерческого предложения для дальнейшей работы через ${CONTACT_EMAIL}.`,
            ].join('\n'),
            qualification: [
                'Для квалификации проекта по контейнерному размещению GasGx обычно подтверждает следующие точки:',
                '- Нужен ли проекту пакетный наружный энергоблок вместо набора разрозненного оборудования.',
                '- Газовый интерфейс, электрический интерфейс и целевой режим работы.',
                '- Границы контейнера, схема охлаждения, система управления и контур мониторинга.',
                '- Ограничения площадки и логистики: габарит перевозки, подъемный доступ и условия пусконаладки.',
                '- Модель сервиса, ожидания по запасным частям и кто будет эксплуатировать установку после запуска.',
            ].join('\n'),
            fit: 'Контейнерное размещение обычно подходит там, где проекту нужен пакетный наружный энергоблок, более быстрый монтаж на площадке, повторяемое развертывание и более чистая граница между поставкой, логистикой и эксплуатацией.',
            overview: 'GasGx позиционирует контейнерное размещение как пакетное наружное энергорешение для проектов, которым важны скорость развертывания, повторяемость площадок и более понятная граница поставки.',
        },
    } as const;
    const localized = catalog[language as keyof typeof catalog] || catalog.en;
    return localized[mode];
}

function pickContainerDeploymentPageReply(message: string, language: string, pageContext: PageContext): CraftedReply | null {
    if (!isContainerDeploymentPage(pageContext)) return null;
    const mode = classifyContainerDeploymentQuery(message);
    if (!mode) return null;
    const handoff = mode === 'quote'
        ? {
            required: true,
            reason: 'quote' as const,
            next_fields: ['application', 'power', 'gas_type', 'gas_quality', 'country', 'voltage_frequency', 'delivery_scope', 'site_conditions'],
        }
        : mode === 'qualification'
            ? {
                required: true,
                reason: 'lead' as const,
                next_fields: ['application', 'power', 'gas_type', 'deployment_scope', 'site_constraints', 'service_model'],
            }
            : {
                required: false,
                reason: 'unknown' as const,
                next_fields: [],
            };
    const matchedIntent = mode === 'quote'
        ? 'container_deployment_quote'
        : mode === 'qualification'
            ? 'container_deployment_qualification'
            : mode === 'fit'
                ? 'container_deployment_fit'
                : 'container_deployment_overview';
    return {
        provider: 'gasgx_rag',
        reply: localizedContainerDeploymentReply(language, mode),
        sources: containerDeploymentSource(),
        handoff,
        matchedIntent,
    };
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
    const fallbackRules = [
        ...fallbackFaqRules(language),
        ...phase1FallbackFaqRules(language),
    ];
    const { data, error } = await client
        .from('chat_faq_rules')
        .select('id, intent_key, language, trigger_patterns, answer_template, handoff_required, handoff_reason, next_fields, source_refs')
        .eq('status', 'published')
        .in('language', Array.from(new Set([language, 'en'])))
        .order('updated_at', { ascending: false });
    if (error) {
        console.warn('site-chat faq load failed', error);
        return fallbackRules;
    }
    const rows = Array.isArray(data) ? data.map((row) => toFaqRule(row as Record<string, unknown>)) : [];
    const merged = [...rows];
    const seen = new Set(rows.map((row) => `${row.intent_key}:${row.language}`));
    for (const rule of fallbackRules) {
        const key = `${rule.intent_key}:${rule.language}`;
        if (!seen.has(key)) {
            seen.add(key);
            merged.push(rule);
        }
    }
    return merged.length ? merged : fallbackRules;
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
    const currentPathDepth = pathSegments(currentPath).length;
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
        const maxPerPath = hitPath && hitPath === currentPath
            ? (currentPathDepth >= 3 ? 4 : 2)
            : 1;
        if (nextCount > maxPerPath) continue;
        pathCounts.set(pathKey, nextCount);

        output.push(hit);
        if (output.length >= DEFAULT_TOP_K) break;
    }
    return output;
}

function focusKnowledgeHitsForCurrentSection(hits: KnowledgeChunkHit[], pageContext?: PageContext): KnowledgeChunkHit[] {
    const currentPath = normalizeUrlPath(pageContext?.url || pageContext?.path || '');
    const currentSection = primarySection(currentPath);
    if (!currentSection) return hits;
    const currentPathDepth = pathSegments(currentPath).length;
    const exactCurrentPageHits = hits.filter((hit) => normalizeUrlPath(hit.canonical_url) === currentPath);
    const isSpecificProductPage = currentSection === 'products' && currentPathDepth >= 3;

    if (isSpecificProductPage && exactCurrentPageHits.length) {
        return exactCurrentPageHits;
    }

    const hasInternalSalesKb = hits.some((hit) => hit.source_type === 'internal_sales_kb');
    if (hasInternalSalesKb) {
        return hits;
    }

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
        return 'Reply in natural, customer-facing Simplified Chinese unless the user explicitly asks for another language. Keep technical units such as kW, MW, V, Hz, container, AIS and skid terms accurate.';
    }
    if (language === 'ru') {
        return 'Reply in natural, customer-facing Russian unless the user explicitly asks for another language. Keep technical units and product-family labels accurate.';
    }
    return 'Reply in natural, customer-facing English unless the user explicitly asks for another language.';
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
        '- Write with normal spacing and punctuation. Avoid robotic phrasing, broken word joins and repeated filler.',
        '- Prefer short paragraphs or flat bullets for fit, scope, checklist and qualification questions.',
        '- Never fabricate exact inventory, lead time, pricing, warranty, certification status or contractual commitments.',
        `- When the conversation reaches quotation or project-intent stage, guide the user toward the structured requirement intake at ${REQUIREMENT_INTAKE_URL} before falling back to ${CONTACT_EMAIL}.`,
        '- Ask only the minimum follow-up questions needed to advance qualification.',
        '- If the current page is a specific product detail page, prioritize that page\'s fit, scope, qualification and quotation details before broader catalog copy.',
        '- Default reply flow: direct answer first, then 2-4 critical missing inputs, then one concrete website action.',
        `- Exploration stage should usually point to ${SITE_FIT_URL}, ${GAS_FIT_URL} or ${ENGINE_SELECTION_URL}.`,
        `- Documentation stage should usually point to ${DATASHEETS_URL}, ${REPORTS_URL} or ${FAQ_URL}.`,
        '- Do not promise final pricing, ROI, compliance approval or delivery commitments before qualification is complete.',
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

function normalizeGeneratedReply(value: string): string {
    return rawText(value)
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\s+([,.;:!?])/g, '$1')
        .replace(/([,.;:!?])(?=[^\s)\]}])/g, '$1 ')
        .replace(/([)\]}])(?=[A-Za-z\u0400-\u04FF])/g, '$1 ')
        .trim();
}

function handoffFromIntent(intentKey: string): HandoffMeta {
    if (intentKey === 'quote_requirements' || intentKey === 'requirement_intake') {
        return {
            required: true,
            reason: 'quote',
            next_fields: ['application', 'power', 'gas_type', 'gas_quality', 'country', 'site_type', 'delivery_scope', 'service_scope'],
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
    if (['oilfield_scenario_fit', 'mining_scenario_fit', 'industrial_scenario_fit', 'chp_scenario_fit', 'deployment_compare'].includes(intentKey)) {
        return {
            required: true,
            reason: 'lead',
            next_fields: ['application', 'power', 'gas_type', 'country', 'site_type', 'delivery_scope'],
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
        const overrideIntent = text(matchedRule.intent_key || matchedIntent);
        if ([
            'quote_requirements',
            'requirement_intake',
            'oilfield_scenario_fit',
            'mining_scenario_fit',
            'industrial_scenario_fit',
            'chp_scenario_fit',
            'deployment_compare',
        ].includes(overrideIntent)) {
            return handoffFromIntent(overrideIntent);
        }
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
            ? `To move toward a solution or quotation, please share: ${handoff.next_fields.join(', ')}. You can also fill the structured intake at ${REQUIREMENT_INTAKE_URL}.`
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
                    const content = rawText(item?.content);
                    if (content) chunks += content;
                }

                if (status === 2 && !settled) {
                    settled = true;
                    clearTimeout(timer);
                    socket.close();
                    resolve(normalizeGeneratedReply(chunks));
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
                resolve(normalizeGeneratedReply(chunks));
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
        const craftedReply = pickContainerDeploymentPageReply(message, language, pageContext);
        const faqRules = await loadFaqRules(serviceClient, language);
        const matchedRule = pickStrandedGasQuoteRule(message, language, faqRules)
            || pickCountryStrandedGasRule(message, language, faqRules)
            || pickPhase1ScenarioRule(message, language, faqRules)
            || (craftedReply ? null : pickFaqRule(message, language, faqRules, matchedIntent));

        if (matchedRule) {
            const reply = localizedPolicyAnswer(matchedRule, language);
            const sources = uniqueSources(matchedRule.source_refs || []);
            const handoff = deriveHandoff(message, matchedIntent || matchedRule.intent_key, matchedRule);
            await insertChatLog(serviceClient, {
                sessionId,
                message,
                reply,
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
                reply,
                language,
                sources,
                handoff,
                sessionId,
            });
        }

        if (craftedReply) {
            await insertChatLog(serviceClient, {
                sessionId,
                message,
                reply: craftedReply.reply,
                language,
                provider: craftedReply.provider,
                matchedIntent: craftedReply.matchedIntent,
                pageContext,
                sources: craftedReply.sources,
                handoff: craftedReply.handoff,
            });
            await insertLeadIntent(serviceClient, {
                sessionId,
                message,
                intent: craftedReply.matchedIntent,
                language,
                provider: craftedReply.provider,
                sources: craftedReply.sources,
                handoff: craftedReply.handoff,
            });
            return json({
                ok: true,
                provider: craftedReply.provider,
                reply: craftedReply.reply,
                language,
                sources: craftedReply.sources,
                handoff: craftedReply.handoff,
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
