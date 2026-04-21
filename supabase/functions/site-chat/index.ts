import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
};

const ROOT_SITE_URL = 'https://www.gasgx.com';
const CONTACT_EMAIL = 'contact@gasgx.com';
const HOME_URL = `${ROOT_SITE_URL}/`;
const NEWS_URL = `${ROOT_SITE_URL}/news/`;
const PRODUCTS_URL = `${ROOT_SITE_URL}/products/`;
const SOLUTIONS_URL = `${ROOT_SITE_URL}/solutions/`;
const RESOURCES_URL = `${ROOT_SITE_URL}/resources/`;
const SUPPORT_URL = `${ROOT_SITE_URL}/support/`;
const RANKINGS_URL = `${ROOT_SITE_URL}/rankings/`;
const TOOLS_URL = `${ROOT_SITE_URL}/tools/`;
const ABOUT_CONTACT_URL = `${ROOT_SITE_URL}/about/contact/`;
const REQUIREMENT_INTAKE_URL = `${ROOT_SITE_URL}/quote/requirement.html`;
const SITE_FIT_URL = `${ROOT_SITE_URL}/tools/site-fit/`;
const GAS_FIT_URL = `${ROOT_SITE_URL}/tools/gas-fit/`;
const ENGINE_SELECTION_URL = `${ROOT_SITE_URL}/tools/engine-selection/`;
const MINER_BUYING_GUIDE_URL = `${ROOT_SITE_URL}/tools/miner-buying-guide/`;
const ROI_TOOL_URL = `${ROOT_SITE_URL}/tools/roi/`;
const LCOE_TOOL_URL = `${ROOT_SITE_URL}/tools/lcoe-calculator/`;
const GAS_ANALYZER_URL = `${ROOT_SITE_URL}/tools/gas-analyzer/`;
const GLOBAL_LOGISTICS_URL = `${ROOT_SITE_URL}/tools/global-logistics/`;
const GLOBAL_COMPLIANCE_URL = `${ROOT_SITE_URL}/tools/global-compliance/`;
const DATASHEETS_URL = `${ROOT_SITE_URL}/resources/datasheets/`;
const REPORTS_URL = `${ROOT_SITE_URL}/resources/reports/`;
const FAQ_URL = `${ROOT_SITE_URL}/resources/faq/`;
const CASE_STUDIES_URL = `${ROOT_SITE_URL}/resources/case-studies/`;
const VIDEOS_URL = `${ROOT_SITE_URL}/resources/videos/`;
const CERTIFICATIONS_URL = `${ROOT_SITE_URL}/resources/certifications/`;
const WHITEPAPERS_URL = `${ROOT_SITE_URL}/resources/whitepapers/`;
const SUPPORT_SERVICE_URL = `${ROOT_SITE_URL}/support/service/`;
const SUPPORT_NETWORK_URL = `${ROOT_SITE_URL}/support/network/`;
const SUPPORT_TECH_URL = `${ROOT_SITE_URL}/support/tech/`;
const OILFIELD_SOLUTION_URL = `${ROOT_SITE_URL}/solutions/oilfield/`;
const MINING_SOLUTION_URL = `${ROOT_SITE_URL}/solutions/mining/`;
const INDUSTRIAL_SOLUTION_URL = `${ROOT_SITE_URL}/solutions/industrial/`;
const CHP_SOLUTION_URL = `${ROOT_SITE_URL}/solutions/chp/`;
const DIGITALIZATION_PLATFORM_URL = `${ROOT_SITE_URL}/digitalization/platform/`;
const DIGITALIZATION_ECM_URL = `${ROOT_SITE_URL}/digitalization/ecm/`;
const DIGITALIZATION_IMS_URL = `${ROOT_SITE_URL}/digitalization/ims/`;
const DIGITALIZATION_SALES_URL = `${ROOT_SITE_URL}/digitalization/sales/`;
const VMAN_URL = `${ROOT_SITE_URL}/vman/`;
const MINERPOWER_URL = `${ROOT_SITE_URL}/minerpower/`;
const DEFAULT_DOMAIN = 'generalv3.5';
const SPARK_TIMEOUT_MS = 45000;
const DEFAULT_TOP_K = 6;
const KNOWLEDGE_SEARCH_LIMIT = 8;
const SECTION_ROOTS = ['products', 'solutions', 'digitalization', 'support', 'resources', 'use-cases', 'rankings', 'about', 'tools', 'quote', 'news'] as const;
const GENERIC_PATH_SEGMENTS = new Set<string>([
    ...SECTION_ROOTS,
    'gas',
    'power-range',
    'cooling',
    'deployment',
    'brands',
    'case-studies',
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

type LocalizedCopy = {
    en: string;
    zh: string;
    ru: string;
};

type PublicFeatureGroup =
    | 'site_entry'
    | 'workflow'
    | 'tool'
    | 'resource'
    | 'support'
    | 'solution'
    | 'digitalization'
    | 'brand';

type PublicFeatureEntry = {
    id: string;
    feature_group: PublicFeatureGroup;
    url: string;
    label: string;
    purpose: LocalizedCopy;
    recommendation: LocalizedCopy;
    patterns: string[];
    related_ids?: string[];
    handoff?: HandoffMeta;
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
    const rawMessage = text(message).trim();
    const rawExplicit = text(explicitLanguage, '').trim();
    if (/[\u4e00-\u9fff]/.test(rawMessage)) return 'zh';
    if (/[\u0400-\u04FF]/.test(rawMessage)) return 'ru';
    if (/[A-Za-z]/.test(rawMessage)) return 'en';
    if (rawExplicit) return normalizeLanguage(rawExplicit, 'en');
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
            quote_requirements: `GasGx can support a formal quotation, but reliable pricing still depends on the application, target load, gas type and gas quality, deployment format, country, voltage and frequency, plus whether controls, cooling, switchgear, miners and remote O&M are in scope. Send those inputs and I can tighten the quotation scope before it continues through ${CONTACT_EMAIL}.`,
            contact_support: `You can reach GasGx at ${CONTACT_EMAIL}. If you share the scenario, power range, gas source and current issue first, I can help sort whether this should go to technical support, after-sales or the service network.`,
            mining_associated_gas_1mw: 'For a 1 MW mining site powered by associated or flare gas, GasGx would usually start with a 1 MW+ gas-power solution, typically containerized or AIS-integrated for field deployment. The next critical checks are gas quality, miner load, voltage and frequency, grid mode, country, ambient conditions and the O&M model.',
        },
        zh: {
            product_overview: 'GasGx 目前主要覆盖四类能力：燃气发电机组产品线、油田伴生气/矿场/工业能源/CHP 等解决方案、O&M Platform/ECM/IMS/Sales System 等数字化系统，以及技术支持、售后服务、服务网络、案例、参数表、认证和 FAQ 等配套资源。如果你告诉我场景、目标功率和气源，我可以继续缩小到更合适的方向。',
            quote_requirements: `GasGx 可以配合正式报价。要把价格收得靠谱，通常还要先确认应用场景、目标负载、气源类型与气质、部署形式、国家地区、电压频率，以及是否包含电控、冷却、矿机、开关柜和远程运维。你把这些信息发我后，我就能先帮你收成报价范围，再由 ${CONTACT_EMAIL} 接着跟。`,
            contact_support: `你可以直接发邮件到 ${CONTACT_EMAIL}。如果你先把项目场景、功率范围、气源类型和当前问题发我，我可以先帮你判断更适合走技术支持、售后，还是服务网络这条线。`,
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
            quote_requirements: `GasGx can support a formal quotation, but reliable pricing still depends on the application, target load, gas type and gas quality, deployment format, country, voltage and frequency, plus whether controls, cooling, switchgear, miners and remote O&M are in scope. Send those inputs and I can tighten the quotation scope before it continues through ${CONTACT_EMAIL}.`,
            contact_support: `You can reach GasGx at ${CONTACT_EMAIL}. If you share the scenario, power range, gas source and current issue first, I can help sort whether this should go to technical support, after-sales or the service network.`,
            mining_associated_gas_1mw: 'For a 1 MW mining site powered by associated or flare gas, GasGx would usually start with a 1 MW+ gas-power solution, typically containerized or AIS-integrated for field deployment. The next critical checks are gas quality, miner load, voltage and frequency, grid mode, country, ambient conditions and the O&M model.',
        },
        zh: {
            product_overview: 'GasGx 目前主要覆盖四类能力：一是燃气发电机组产品线，按功率段、气源、冷却方式和部署形式组织；二是油田伴生气、矿场供电、工业分布式能源和 CHP 等解决方案；三是 O&M Platform、ECM、IMS、Sales System 等数字化系统；四是技术支持、售后服务、服务网络、案例、白皮书、参数表、认证和 FAQ 等配套资源。如果你告诉我应用场景、目标功率和气源类型，我可以继续缩小到更合适的产品方向。',
            quote_requirements: `GasGx 可以配合正式报价。要把价格收得靠谱，通常还要先确认应用场景、目标负载、气源类型与气质、部署形式、国家地区、电压频率，以及是否包含控制、冷却、开关柜、矿机和远程运维。你把这些信息发我后，我就能先帮你收成报价范围，再由 ${CONTACT_EMAIL} 接着跟。`,
            contact_support: `你可以直接发邮件到 ${CONTACT_EMAIL}。如果你先把项目场景、功率范围、气源类型和当前问题发我，我可以先帮你判断更适合走技术支持、售后，还是服务网络这条线。`,
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

function copy(en: string, zh: string, ru: string): LocalizedCopy {
    return { en, zh, ru };
}

function copyEn(en: string): LocalizedCopy {
    return { en, zh: en, ru: en };
}

function localizedCopy(value: LocalizedCopy, language: string): string {
    const normalized = normalizeLanguage(language, 'en');
    return value[normalized as keyof LocalizedCopy] || value.en;
}

function toolEntryId(slug: string): string {
    return `tool_${slug.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase()}`;
}

function buildToolUrl(slug: string): string {
    return `${TOOLS_URL}${slug}/`;
}

function toolPatterns(slug: string, aliases: string[] = []): string[] {
    const base = [
        slug,
        slug.replace(/-/g, ' '),
        ...aliases,
    ].map((item) => text(item).toLowerCase()).filter(Boolean);
    return Array.from(new Set(base));
}

const PUBLIC_TOOL_BLUEPRINTS = [
    {
        slug: 'site-fit',
        label: 'Site Fit Tool',
        purpose: copy(
            'screen overall project feasibility before quotation.',
            '先做项目整体适配和可研初筛。',
            'сначала провести общий feasibility-скрининг проекта.',
        ),
        recommendation: copy(
            'If the fuel boundary is still unclear, open Gas Fit next. If equipment direction matters, continue with Engine Selection.',
            '如果燃料边界还不清楚，下一步看 Gas Fit；如果设备方向更重要，再继续看 Engine Selection。',
            'Если еще неясна топливная граница, дальше откройте Gas Fit; если важнее выбор оборудования, продолжайте через Engine Selection.',
        ),
        aliases: ['site fit', 'site-fit', 'feasibility screening', 'project fit'],
        related_ids: [toolEntryId('gas-fit'), toolEntryId('engine-selection')],
    },
    {
        slug: 'gas-fit',
        label: 'Gas Fit Tool',
        purpose: copy(
            'check whether the gas source and fuel boundary look workable for GasGx solutions.',
            '判断气源条件和燃料边界是否适合 GasGx 方案。',
            'проверить, выглядит ли газовая граница рабочей для решений GasGx.',
        ),
        recommendation: copy(
            'If the project itself is still early-stage, start from Site Fit first.',
            '如果项目阶段还很早，建议先从 Site Fit 开始。',
            'Если проект еще на ранней стадии, начните с Site Fit.',
        ),
        aliases: ['gas fit', 'gas-fit', 'fuel fit', 'gas boundary'],
        related_ids: [toolEntryId('site-fit'), toolEntryId('engine-selection')],
    },
    {
        slug: 'engine-selection',
        label: 'Engine Selection Tool',
        purpose: copy(
            'narrow the equipment direction before moving to a formal quotation.',
            '在正式报价前先收敛设备方向。',
            'сузить направление по оборудованию перед формальным quotation.',
        ),
        recommendation: copy(
            'When the project is already budget-stage, continue with the requirement intake after this step.',
            '如果项目已经进入预算阶段，下一步可以直接转 requirement intake。',
            'Если проект уже перешел к бюджету, после этого шага переходите к requirement intake.',
        ),
        aliases: ['engine selection', 'engine-selection', 'generator selection', 'equipment direction'],
        related_ids: [toolEntryId('site-fit'), toolEntryId('gas-fit')],
    },
    {
        slug: 'miner-buying-guide',
        label: 'Miner Buying Guide',
        purpose: copyEn('compare miner procurement direction against the planned power strategy.'),
        recommendation: copyEn('Pair it with Mining Power Calc if you need to estimate the electrical load as well.'),
        aliases: ['miner buying guide', 'buying guide', 'miner guide'],
        related_ids: [toolEntryId('mining-power-calc'), toolEntryId('miner-profitability')],
    },
    {
        slug: 'gas-analyzer',
        label: 'Gas Analyzer',
        purpose: copyEn('review gas composition and fuel-side implications.'),
        recommendation: copyEn('If you also need energy-value conversion, continue with Gas Composition Heat.'),
        aliases: ['gas analyzer', 'gas analyser', 'gas analysis'],
        related_ids: [toolEntryId('gas-composition-heat'), toolEntryId('gas-fit')],
    },
    {
        slug: 'gas-cost-analysis',
        label: 'Gas Cost Analysis',
        purpose: copyEn('estimate gas-cost assumptions for the project.'),
        recommendation: copyEn('If you want a broader project-cost direction, pair it with the LCOE Calculator.'),
        aliases: ['gas cost analysis', 'gas cost', 'fuel cost'],
        related_ids: [toolEntryId('lcoe-calculator')],
    },
    {
        slug: 'gas-location-analysis',
        label: 'Gas Location Analysis',
        purpose: copyEn('review location and regional context for a gas project.'),
        recommendation: copyEn('Use it together with Global Logistics when transport constraints matter.'),
        aliases: ['gas location analysis', 'location analysis', 'gas location'],
        related_ids: [toolEntryId('global-logistics')],
    },
    {
        slug: 'gas-composition-heat',
        label: 'Gas Composition Heat',
        purpose: copyEn('convert gas-composition inputs into heat-value context.'),
        recommendation: copyEn('Use it after Gas Analyzer if you need a clearer fuel-value picture.'),
        aliases: ['gas composition heat', 'heating value', 'gas heat value', 'methane number'],
        related_ids: [toolEntryId('gas-analyzer')],
    },
    {
        slug: 'lcoe-calculator',
        label: 'LCOE Calculator',
        purpose: copyEn('estimate levelized electricity-cost direction.'),
        recommendation: copyEn('If you also want investment-return direction, compare it with the ROI Calculator.'),
        aliases: ['lcoe', 'lcoe calculator', 'levelized cost of electricity'],
        related_ids: [toolEntryId('roi'), toolEntryId('roce-calculator')],
    },
    {
        slug: 'roi',
        label: 'ROI Calculator',
        purpose: copyEn('estimate return-on-investment direction.'),
        recommendation: copyEn('Use it with LCOE when you need both cost and return direction.'),
        aliases: ['roi', 'roi calculator', 'return on investment'],
        related_ids: [toolEntryId('lcoe-calculator'), toolEntryId('roce-calculator')],
    },
    {
        slug: 'roce-calculator',
        label: 'ROCE Calculator',
        purpose: copyEn('estimate return-on-capital-employed direction.'),
        recommendation: copyEn('Use it when the project discussion is already capital-structure oriented.'),
        aliases: ['roce', 'roce calculator', 'return on capital employed'],
    },
    {
        slug: 'global-logistics',
        label: 'Global Logistics',
        purpose: copyEn('review transport, routing and delivery-boundary constraints.'),
        recommendation: copyEn('This is most useful when logistics limits may affect deployment or quotation scope.'),
        aliases: ['global logistics', 'logistics', 'shipping', 'delivery logistics'],
    },
    {
        slug: 'global-compliance',
        label: 'Global Compliance',
        purpose: copyEn('review high-level compliance and market-entry considerations.'),
        recommendation: copyEn('Use it early to understand whether local compliance issues may slow the project path.'),
        aliases: ['global compliance', 'compliance', 'market entry', 'regulatory'],
    },
    {
        slug: 'aeco-price-forecast',
        label: 'AECO Price Forecast',
        purpose: copyEn('review AECO gas-price outlook.'),
        recommendation: copyEn('This is mainly useful for market-context research rather than equipment qualification.'),
        aliases: ['aeco price forecast', 'aeco', 'gas price forecast'],
    },
    {
        slug: '3y-compare',
        label: '3Y Compare',
        purpose: copyEn('compare three-year scenarios in one place.'),
        recommendation: copyEn('Use it when the discussion is about medium-term comparison rather than a single snapshot.'),
        aliases: ['3y compare', 'three year compare', '3 year compare'],
    },
    {
        slug: 'emission',
        label: 'Emission Tool',
        purpose: copyEn('estimate emissions-related metrics.'),
        recommendation: copyEn('Use it when emissions direction matters, but do not treat it as a formal compliance approval.'),
        aliases: ['emission', 'emissions', 'co2'],
    },
    {
        slug: 'energy-conversion',
        label: 'Energy Conversion',
        purpose: copyEn('convert energy units and gas-power values.'),
        recommendation: copyEn('It helps when the team is working across different energy or power units.'),
        aliases: ['energy conversion', 'unit conversion', 'power conversion'],
    },
    {
        slug: 'miner-profitability',
        label: 'Miner Profitability',
        purpose: copyEn('estimate miner profitability direction.'),
        recommendation: copyEn('Use it for miner-side economics, not as a final project ROI commitment.'),
        aliases: ['miner profitability', 'miner profit', 'asic profitability'],
        related_ids: [toolEntryId('miner-buying-guide'), toolEntryId('mining-income-calculator')],
    },
    {
        slug: 'mining-income-calculator',
        label: 'Mining Income Calculator',
        purpose: copyEn('estimate mining-income direction.'),
        recommendation: copyEn('Pair it with Mining Power Calc when you need to connect income and load assumptions.'),
        aliases: ['mining income calculator', 'mining income', 'mining revenue'],
        related_ids: [toolEntryId('mining-power-calc'), toolEntryId('miner-profitability')],
    },
    {
        slug: 'mining-power-calc',
        label: 'Mining Power Calc',
        purpose: copyEn('calculate mining power demand.'),
        recommendation: copyEn('Use it before quotation if the compute-side load is still unclear.'),
        aliases: ['mining power calc', 'mining power calculator', 'miner power'],
        related_ids: [toolEntryId('mining-income-calculator'), toolEntryId('engine-selection')],
    },
    {
        slug: 'monte-carlo-profit',
        label: 'Monte Carlo Profit',
        purpose: copyEn('stress-test profitability assumptions.'),
        recommendation: copyEn('Use it for scenario analysis, not as a commercial guarantee.'),
        aliases: ['monte carlo profit', 'monte carlo', 'profit simulation'],
    },
    {
        slug: 'oil-consumption',
        label: 'Oil Consumption',
        purpose: copyEn('estimate oil or lubricant-consumption context.'),
        recommendation: copyEn('This is best used as an operating reference rather than a quotation shortcut.'),
        aliases: ['oil consumption', 'lubricant consumption'],
    },
    {
        slug: 'vehicle-vs-industrial-10mw',
        label: 'Vehicle vs Industrial 10MW',
        purpose: copyEn('compare vehicle-style and industrial-style 10 MW scenarios.'),
        recommendation: copyEn('Use it when the project discussion is really about scenario comparison at around 10 MW.'),
        aliases: ['vehicle vs industrial 10mw', '10mw compare', 'vehicle vs industrial'],
    },
] as const;

function buildPublicToolEntries(): PublicFeatureEntry[] {
    return PUBLIC_TOOL_BLUEPRINTS.map((item) => ({
        id: toolEntryId(item.slug),
        feature_group: 'tool',
        url: buildToolUrl(item.slug),
        label: item.label,
        purpose: item.purpose,
        recommendation: item.recommendation,
        patterns: toolPatterns(item.slug, item.aliases),
        related_ids: item.related_ids ? [...item.related_ids] : [],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    }));
}

const PUBLIC_FEATURE_ENTRIES: PublicFeatureEntry[] = [
    {
        id: 'site_overview',
        feature_group: 'site_entry',
        url: HOME_URL,
        label: 'GasGx Home',
        purpose: copy(
            'start from the public site entry and branch into products, solutions, tools and resources.',
            '从公开首页进入产品、方案、工具和资料入口。',
            'начать с публичной главной страницы и перейти к продуктам, решениям, инструментам и ресурсам.',
        ),
        recommendation: copy(
            'If you already know the direction, jump straight to Products or Solutions next.',
            '如果你已经知道方向，下一步可以直接看 Products 或 Solutions。',
            'Если направление уже понятно, сразу переходите в Products или Solutions.',
        ),
        patterns: [
            'what can i do on this website',
            'what features does this site have',
            'what can i use on gasgx',
            'website functions',
            '这个网站有哪些功能',
            '这个网站有什么功能',
            '站点功能',
            '网站功能',
            'какие функции есть на сайте',
            'что есть на сайте gasgx',
        ],
        related_ids: ['site_products', 'tools_overview'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'site_home',
        feature_group: 'site_entry',
        url: HOME_URL,
        label: 'GasGx Home',
        purpose: copy(
            'open the main public homepage.',
            '打开公开首页。',
            'открыть главную публичную страницу.',
        ),
        recommendation: copy(
            'Use it when you want the broadest starting point before choosing a product, solution or tool.',
            '当你还没有确定方向时，这里是最宽的起点。',
            'Используйте ее, если нужен самый широкий старт до выбора продукта, решения или инструмента.',
        ),
        patterns: ['home page', 'homepage', 'main page', '首页', '主页', 'главная страница'],
        related_ids: ['site_products', 'site_solutions'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'site_news',
        feature_group: 'site_entry',
        url: NEWS_URL,
        label: 'GasGx News',
        purpose: copy(
            'open the public News hub for flash, data and market updates.',
            '打开公开 News 栏目，看 flash、data 和市场更新。',
            'открыть публичный News hub для flash, data и рыночных обновлений.',
        ),
        recommendation: copy(
            'This is for news and media updates, not for quotation intake.',
            '这里更适合看资讯，不是提交项目需求单的入口。',
            'Это раздел для новостей и обновлений, а не для project intake.',
        ),
        patterns: ['news page', 'gasgx news', 'where is news', '新闻页', '新闻入口', 'страница news', 'где новости'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'site_products',
        feature_group: 'site_entry',
        url: PRODUCTS_URL,
        label: 'Products',
        purpose: copy(
            'browse the public product catalog by power range, gas type, cooling and deployment.',
            '按功率、气源、冷却和部署方式浏览公开产品目录。',
            'просматривать публичный каталог продуктов по мощности, типу газа, охлаждению и deployment.',
        ),
        recommendation: copy(
            'Use this section when the question is mainly about equipment direction.',
            '如果问题主要是设备方向，优先看这里。',
            'Используйте этот раздел, когда вопрос в первую очередь связан с направлением по оборудованию.',
        ),
        patterns: ['products page', 'product catalog', 'where are products', '产品页', '产品目录', 'страница products', 'каталог продуктов'],
        related_ids: ['site_solutions', 'requirement_intake_public'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'site_solutions',
        feature_group: 'site_entry',
        url: SOLUTIONS_URL,
        label: 'Solutions',
        purpose: copy(
            'open the public solution hub for oilfield, mining, industrial and CHP scenarios.',
            '打开公开 Solutions 栏目，查看油田、矿场、工业和 CHP 场景。',
            'открыть публичный раздел Solutions для oilfield, mining, industrial и CHP сценариев.',
        ),
        recommendation: copy(
            'Use this section when the question is about scenario fit rather than only equipment.',
            '如果问题是场景适配而不只是设备本身，优先看这里。',
            'Используйте этот раздел, когда вопрос о сценарии применения, а не только об оборудовании.',
        ),
        patterns: ['solutions page', 'solution page', 'where are solutions', '解决方案页', '方案页', 'страница solutions', 'страница решений'],
        related_ids: ['solution_oilfield', 'solution_mining'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'site_resources',
        feature_group: 'site_entry',
        url: RESOURCES_URL,
        label: 'Resources',
        purpose: copy(
            'open the public resource center for datasheets, reports, FAQ and reference content.',
            '打开公开资源中心，查看 datasheets、reports、FAQ 等资料。',
            'открыть публичный resource center для datasheets, reports, FAQ и справочных материалов.',
        ),
        recommendation: copy(
            'Use this section for documentation-stage questions rather than early quotation routing.',
            '如果你现在主要是资料型问题，优先看这里。',
            'Используйте этот раздел для документационной стадии, а не как ранний quotation route.',
        ),
        patterns: ['resources page', 'resource center', 'where are resources', '资源中心', '资料页', 'resource page', 'центр ресурсов'],
        related_ids: ['resource_datasheets', 'resource_reports'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'site_support',
        feature_group: 'site_entry',
        url: SUPPORT_URL,
        label: 'Support',
        purpose: copy(
            'open the public support section for service, tech and network information.',
            '打开公开 Support 栏目，查看 service、tech 和 network 信息。',
            'открыть публичный раздел Support для service, tech и network информации.',
        ),
        recommendation: copy(
            'Use this section when the question is about service boundaries rather than only products.',
            '如果问题主要是服务边界，而不是单纯产品介绍，优先看这里。',
            'Используйте этот раздел, когда вопрос касается сервисной границы, а не только продукта.',
        ),
        patterns: ['support page', 'support section', 'where is support', '支持页', '支持入口', 'страница support', 'где support'],
        related_ids: ['contact_entry', 'support_service'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'site_rankings',
        feature_group: 'site_entry',
        url: RANKINGS_URL,
        label: 'Rankings',
        purpose: copy(
            'open the public rankings section for comparative views and ranking-based pages.',
            '打开公开 Rankings 栏目，查看对比和排行类页面。',
            'открыть публичный раздел Rankings для сравнений и ranking-страниц.',
        ),
        recommendation: copy(
            'Use this section when the discussion is comparative, not when a project is already ready for quotation.',
            '如果问题偏比较研究而不是立刻报价，优先看这里。',
            'Используйте этот раздел для сравнительного исследования, а не когда проект уже готов к quotation.',
        ),
        patterns: ['rankings page', 'ranking page', 'where are rankings', '排行页', '排名页', 'страница rankings', 'рейтинги'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'site_digitalization',
        feature_group: 'digitalization',
        url: DIGITALIZATION_PLATFORM_URL,
        label: 'O&M Platform',
        purpose: copy(
            'open the public digitalization entry and start from the O&M Platform page.',
            '打开公开 digitalization 入口，从 O&M Platform 页面开始看。',
            'открыть публичный digitalization-вход и начать со страницы O&M Platform.',
        ),
        recommendation: copy(
            'This is for digital systems and operations visibility, not for public admin access.',
            '这里是数字化系统和运维可视化入口，不是公开后台入口。',
            'Это вход в digital systems и operations visibility, а не публичная админка.',
        ),
        patterns: ['digitalization', 'o&m platform', 'operations platform', '数字化', '运维平台', 'платформа o&m', 'digitalization page'],
        related_ids: ['digitalization_ecm', 'digitalization_ims'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'digitalization_ecm',
        feature_group: 'digitalization',
        url: DIGITALIZATION_ECM_URL,
        label: 'ECM Controller',
        purpose: copyEn('review the ECM controller and diagnostics page.'),
        recommendation: copyEn('Use it when the question is about engine-control diagnostics rather than sales workflow.'),
        patterns: ['ecm', 'ecm controller', 'engine controller'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'digitalization_ims',
        feature_group: 'digitalization',
        url: DIGITALIZATION_IMS_URL,
        label: 'IMS',
        purpose: copyEn('review the IMS spare-parts and inventory-management page.'),
        recommendation: copyEn('Use it when the discussion is about parts flow and inventory visibility.'),
        patterns: ['ims', 'inventory management system', 'spare parts system'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'digitalization_sales',
        feature_group: 'digitalization',
        url: DIGITALIZATION_SALES_URL,
        label: 'Sales System',
        purpose: copyEn('review the public sales-system capability page.'),
        recommendation: copyEn('This is a public product page, not a public operator console.'),
        patterns: ['sales system', 'digital sales', 'sales capability page'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'contact_entry',
        feature_group: 'support',
        url: ABOUT_CONTACT_URL,
        label: 'Contact GasGx',
        purpose: copy(
            'reach the public contact entry for project, support or cooperation requests.',
            '进入公开联系入口，提交项目、支持或合作请求。',
            'перейти к публичному contact-входу для project, support или cooperation запросов.',
        ),
        recommendation: copy(
            'If the request is already quotation-oriented, the requirement intake is usually a better structured entry.',
            '如果已经是报价导向需求，requirement intake 通常是更结构化的入口。',
            'Если запрос уже quotation-ориентированный, requirement intake обычно лучше как структурированный вход.',
        ),
        patterns: ['contact page', 'how to contact', 'contact gasgx', 'contact support', '联系页面', '联系gasgx', '怎么联系', 'страница контактов', 'как связаться'],
        related_ids: ['requirement_intake_public', 'support_service'],
        handoff: { required: true, reason: 'support', next_fields: ['application', 'power', 'gas_type', 'issue_or_goal'] },
    },
    {
        id: 'requirement_intake_public',
        feature_group: 'workflow',
        url: REQUIREMENT_INTAKE_URL,
        label: 'GasGx Requirement Intake',
        purpose: copy(
            'submit a structured project brief for quotation follow-up.',
            '提交结构化项目需求单，用于报价跟进。',
            'отправить структурированный project brief для quotation follow-up.',
        ),
        recommendation: copy(
            'Prepare application, target power, gas type and gas quality, country, voltage or frequency, deployment preference and scope boundary before opening it.',
            '打开前最好先准备应用场景、目标功率、气源与气质、国家地区、电压频率、部署偏好和范围边界。',
            'Перед открытием лучше подготовить сценарий, мощность, тип и качество газа, страну, напряжение/частоту, deployment preference и границы scope.',
        ),
        patterns: ['where should i submit a project brief', 'project brief', 'submit requirement', 'requirement form', 'quotation form', 'quote form', '需求应该去哪里提交', '项目需求', '需求单入口', 'где отправить запрос', 'форма запроса', 'коммерческое предложение форма'],
        related_ids: ['tool_site_fit', 'contact_entry'],
        handoff: { required: true, reason: 'quote', next_fields: ['application', 'power', 'gas_type', 'gas_quality', 'country', 'site_type', 'delivery_scope', 'service_scope'] },
    },
    {
        id: 'tools_overview',
        feature_group: 'tool',
        url: TOOLS_URL,
        label: 'GasGx Tools',
        purpose: copy(
            'browse the public tool hub for screening, calculators, analyzers and comparisons.',
            '浏览公开工具中心，查看筛选、计算、分析和对比工具。',
            'просмотреть публичный tool hub для screening, calculators, analyzers и comparisons.',
        ),
        recommendation: copy(
            'If you need the best first screening tool, start from Site Fit.',
            '如果你想找最适合先开始的工具，优先从 Site Fit 开始。',
            'Если нужен лучший инструмент для первого шага, начните с Site Fit.',
        ),
        patterns: ['what tools', 'which tool', 'available tools', 'tool page', 'tools page', '有什么工具', '哪些工具', '工具页', 'какие инструменты', 'страница инструментов'],
        related_ids: [toolEntryId('site-fit'), toolEntryId('gas-fit')],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'solution_oilfield',
        feature_group: 'solution',
        url: OILFIELD_SOLUTION_URL,
        label: 'Oilfield Solution',
        purpose: copy(
            'open the public oilfield gas-to-power solution page.',
            '打开公开油田伴生气发电方案页。',
            'открыть публичную страницу oilfield gas-to-power solution.',
        ),
        recommendation: copy(
            'Use this page when the question is specifically about the oilfield scenario, not just generic gas generation.',
            '如果问题是油田场景本身，而不是泛泛的燃气发电，优先看这个页面。',
            'Используйте эту страницу, когда вопрос именно про oilfield-сценарий, а не про общую газовую генерацию.',
        ),
        patterns: ['oilfield solution page', 'show me the oilfield solution', '油田方案页', '油田解决方案', 'страница oilfield solution'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'solution_mining',
        feature_group: 'solution',
        url: MINING_SOLUTION_URL,
        label: 'Mining Solution',
        purpose: copy(
            'open the public mining or data-center power solution page.',
            '打开公开矿场 / 数据中心供电方案页。',
            'открыть публичную страницу mining / data-center power solution.',
        ),
        recommendation: copy(
            'Use this page when the question is about mining solution positioning rather than only miner economics.',
            '如果问题是矿场方案定位，而不是单纯矿机收益，优先看这个页面。',
            'Используйте эту страницу, когда вопрос о позиции mining solution, а не только об экономике miners.',
        ),
        patterns: ['mining solution page', 'show me the mining solution page', '矿场方案页', '挖矿方案页', 'страница mining solution'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'solution_industrial',
        feature_group: 'solution',
        url: INDUSTRIAL_SOLUTION_URL,
        label: 'Industrial Solution',
        purpose: copy(
            'open the public industrial distributed-generation solution page.',
            '打开公开工业分布式发电方案页。',
            'открыть публичную страницу industrial distributed-generation solution.',
        ),
        recommendation: copy(
            'Use it when the discussion is about plant-side power scenarios rather than oilfield or mining.',
            '如果讨论的是工厂侧用能场景，而不是油田或矿场，优先看这里。',
            'Используйте ее, когда обсуждение про plant-side power scenario, а не oilfield или mining.',
        ),
        patterns: ['industrial solution page', 'industrial solution', '工业方案页', '工业解决方案', 'страница industrial solution'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'solution_chp',
        feature_group: 'solution',
        url: CHP_SOLUTION_URL,
        label: 'CHP Solution',
        purpose: copy(
            'open the public CHP and cogeneration solution page.',
            '打开公开 CHP / 热电联供方案页。',
            'открыть публичную страницу CHP / cogeneration solution.',
        ),
        recommendation: copy(
            'Use it when the project really depends on both power and heat load.',
            '如果项目同时依赖电负荷和热负荷，优先看这里。',
            'Используйте ее, когда проект действительно зависит и от power, и от heat load.',
        ),
        patterns: ['chp solution page', 'cogeneration page', 'chp page', 'chp方案页', '热电联供方案页', 'страница chp solution'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'resource_datasheets',
        feature_group: 'resource',
        url: DATASHEETS_URL,
        label: 'Datasheets',
        purpose: copy(
            'open the public datasheet library for equipment-detail references.',
            '打开公开 datasheet 资料库，查看设备细节参考。',
            'открыть публичную библиотеку datasheets для деталей по оборудованию.',
        ),
        recommendation: copy(
            'Use datasheets for equipment details, not as a substitute for a qualified quotation scope.',
            'datasheet 适合看设备细节，但不能替代已完成资格确认的报价范围。',
            'Используйте datasheets для деталей по оборудованию, но не как замену квалифицированному quotation scope.',
        ),
        patterns: ['datasheet', 'datasheets', 'where can i find datasheets', '参数表', '资料表', 'где посмотреть datasheets', 'даташиты'],
        related_ids: ['resource_reports', 'resource_faq'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'resource_reports',
        feature_group: 'resource',
        url: REPORTS_URL,
        label: 'Reports',
        purpose: copy(
            'open the public reports library for market and scenario context.',
            '打开公开 reports 资料库，查看市场和场景背景。',
            'открыть публичную библиотеку reports для рыночного и сценарного контекста.',
        ),
        recommendation: copy(
            'Use reports when the question is research-oriented rather than quotation-ready.',
            '如果问题偏研究和判断，而不是立刻报价，优先看 reports。',
            'Используйте reports, когда вопрос исследовательский, а не quotation-ready.',
        ),
        patterns: ['report', 'reports', 'where can i find reports', '报告', '研究报告', 'где посмотреть reports', 'отчеты'],
        related_ids: ['resource_datasheets', 'resource_case_studies'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'resource_faq',
        feature_group: 'resource',
        url: FAQ_URL,
        label: 'FAQ',
        purpose: copy(
            'open the public FAQ entry for short operational answers.',
            '打开公开 FAQ 入口，查看短问短答。',
            'открыть публичный FAQ для коротких operational answers.',
        ),
        recommendation: copy(
            'Use FAQ when you need a short answer first, then move to datasheets or reports if you need depth.',
            '如果你先要短答案，看 FAQ；如果需要更深资料，再转 datasheets 或 reports。',
            'Используйте FAQ для короткого ответа, а если нужна глубина — переходите в datasheets или reports.',
        ),
        patterns: ['faq', 'where is faq', 'faq page', '常见问题', 'faq入口', 'faq страница', 'где faq'],
        related_ids: ['resource_datasheets', 'resource_reports'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'resource_case_studies',
        feature_group: 'resource',
        url: CASE_STUDIES_URL,
        label: 'Case Studies',
        purpose: copyEn('open the public case-studies library.'),
        recommendation: copyEn('Use it when you want examples and scenario references rather than only specifications.'),
        patterns: ['case study', 'case studies', '案例', 'кейсы'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'resource_videos',
        feature_group: 'resource',
        url: VIDEOS_URL,
        label: 'Videos',
        purpose: copyEn('open the public videos library.'),
        recommendation: copyEn('Use it when you want a visual overview rather than a text-heavy document first.'),
        patterns: ['videos', 'video page', '视频', 'видео'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'resource_certifications',
        feature_group: 'resource',
        url: CERTIFICATIONS_URL,
        label: 'Certifications',
        purpose: copyEn('open the public certifications page.'),
        recommendation: copyEn('Use it for certification references, but do not assume project-specific compliance approval from it alone.'),
        patterns: ['certification', 'certifications', '认证', 'сертификация'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'resource_whitepapers',
        feature_group: 'resource',
        url: WHITEPAPERS_URL,
        label: 'Whitepapers',
        purpose: copyEn('open the public whitepapers library.'),
        recommendation: copyEn('Use it for longer-form technical or market reading.'),
        patterns: ['whitepaper', 'whitepapers', '白皮书', 'white paper', 'вайтпейпер'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'support_service',
        feature_group: 'support',
        url: SUPPORT_SERVICE_URL,
        label: 'Service Support',
        purpose: copyEn('open the public service-support page.'),
        recommendation: copyEn('Use it when the discussion is about after-sales service scope or service boundaries.'),
        patterns: ['service support', 'after-sales service', 'service page', '售后服务', '服务支持', 'сервисная поддержка'],
        handoff: { required: true, reason: 'support', next_fields: ['application', 'power', 'gas_type', 'issue_or_goal'] },
    },
    {
        id: 'support_network',
        feature_group: 'support',
        url: SUPPORT_NETWORK_URL,
        label: 'Service Network',
        purpose: copyEn('open the public service-network page.'),
        recommendation: copyEn('Use it when the question is about regional support reach.'),
        patterns: ['service network', 'support network', '服务网络', 'network page', 'сервисная сеть'],
        handoff: { required: true, reason: 'support', next_fields: ['country', 'site_type', 'issue_or_goal'] },
    },
    {
        id: 'support_tech',
        feature_group: 'support',
        url: SUPPORT_TECH_URL,
        label: 'Technical Support',
        purpose: copyEn('open the public technical-support page.'),
        recommendation: copyEn('Use it when the question is technical support scope rather than quotation routing.'),
        patterns: ['technical support', 'tech support', '技术支持', 'техническая поддержка'],
        handoff: { required: true, reason: 'support', next_fields: ['application', 'power', 'gas_type', 'issue_or_goal'] },
    },
    {
        id: 'brand_vman',
        feature_group: 'brand',
        url: VMAN_URL,
        label: 'VMAN',
        purpose: copyEn('open the public VMAN brand quote/demo entry.'),
        recommendation: copyEn('Use it when you need the public VMAN-facing quote or brand page.'),
        patterns: ['vman', 'vman page', 'vman quote'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    {
        id: 'brand_minerpower',
        feature_group: 'brand',
        url: MINERPOWER_URL,
        label: 'MinerPower',
        purpose: copyEn('open the public MinerPower brand quote/demo entry.'),
        recommendation: copyEn('Use it when the request is specifically about the public MinerPower route.'),
        patterns: ['minerpower', 'miner power', 'minerpower page', 'minerpower quote'],
        handoff: { required: false, reason: 'unknown', next_fields: [] },
    },
    ...buildPublicToolEntries(),
];

const PUBLIC_FEATURE_ENTRY_MAP = new Map(PUBLIC_FEATURE_ENTRIES.map((item) => [item.id, item] as const));

function publicFeatureEntriesById(ids: string[] = []): PublicFeatureEntry[] {
    return ids
        .map((item) => PUBLIC_FEATURE_ENTRY_MAP.get(item) || null)
        .filter((item): item is PublicFeatureEntry => !!item)
        .slice(0, 2);
}

function buildPublicFeatureCraftedReply(entryId: string, language: string, relatedIds: string[] = [], matchedIntent = ''): CraftedReply | null {
    const entry = PUBLIC_FEATURE_ENTRY_MAP.get(entryId);
    if (!entry) return null;
    const relatedEntries = publicFeatureEntriesById(relatedIds.length ? relatedIds : (entry.related_ids || []));
    return {
        provider: 'gasgx_policy',
        reply: buildReadablePublicFeatureReply(entry, language, relatedEntries),
        sources: publicFeatureSources(entry, relatedEntries),
        handoff: entry.handoff || { required: false, reason: 'unknown', next_fields: [] },
        matchedIntent: matchedIntent || `public_feature_${entry.id}`,
    };
}

function publicFeatureLink(entry: PublicFeatureEntry): string {
    return `[${entry.label}](${entry.url})`;
}

function publicFeatureLead(entry: PublicFeatureEntry, language: string): string {
    if (language === 'zh') {
        if (entry.feature_group === 'workflow') return '这个公开入口就是当前最合适的站内流程入口。';
        if (entry.feature_group === 'tool') return 'GasGx 站内有对应的公开工具可以直接用。';
        if (entry.feature_group === 'resource') return '这个公开资料入口最适合你现在这个问题。';
        if (entry.feature_group === 'support') return '这个公开支持入口最适合你现在这个诉求。';
        if (entry.feature_group === 'solution') return 'GasGx 有对应的公开方案页可以直接打开。';
        if (entry.feature_group === 'digitalization') return 'GasGx 有对应的公开数字化能力页可以直接查看。';
        if (entry.feature_group === 'brand') return 'GasGx 也提供这个公开品牌入口。';
        return '这个公开站点入口就是你现在最该打开的页面。';
    }
    if (language === 'ru') {
        if (entry.feature_group === 'workflow') return 'Это лучший публичный workflow-вход для вашего запроса.';
        if (entry.feature_group === 'tool') return 'На сайте GasGx есть публичный инструмент под этот запрос.';
        if (entry.feature_group === 'resource') return 'Этот публичный ресурсный вход подходит сюда лучше всего.';
        if (entry.feature_group === 'support') return 'Этот публичный support-вход лучше всего подходит под ваш запрос.';
        if (entry.feature_group === 'solution') return 'У GasGx есть публичная solution-страница под этот сценарий.';
        if (entry.feature_group === 'digitalization') return 'У GasGx есть публичная digitalization-страница для этого направления.';
        if (entry.feature_group === 'brand') return 'У GasGx также есть этот публичный brand-вход.';
        return 'Это правильный публичный раздел сайта для вашего запроса.';
    }
    if (entry.feature_group === 'workflow') return 'This is the best public workflow entry for your request.';
    if (entry.feature_group === 'tool') return 'GasGx has a public website tool for this.';
    if (entry.feature_group === 'resource') return 'This is the best public resource entry for this question.';
    if (entry.feature_group === 'support') return 'This is the right public support entry for this request.';
    if (entry.feature_group === 'solution') return 'GasGx has a public solution page for this scenario.';
    if (entry.feature_group === 'digitalization') return 'GasGx has a public digitalization page for this capability.';
    if (entry.feature_group === 'brand') return 'GasGx also exposes this as a public brand entry.';
    return 'This is the right public site section for your request.';
}

function publicFeatureLineTwo(entry: PublicFeatureEntry, language: string): string {
    const link = publicFeatureLink(entry);
    const purpose = localizedCopy(entry.purpose, language);
    if (language === 'zh') {
        return `主入口：${link}。它用于${purpose}`;
    }
    if (language === 'ru') {
        return `Основной вход: ${link}. Он нужен, чтобы ${purpose}`;
    }
    return `Primary link: ${link} — use it to ${purpose}`;
}

function publicFeatureRelatedSentence(relatedEntries: PublicFeatureEntry[], language: string): string {
    if (!relatedEntries.length) return '';
    const parts = relatedEntries.slice(0, 2).map((item) => {
        const link = publicFeatureLink(item);
        const purpose = localizedCopy(item.purpose, language);
        if (language === 'zh') return `${link}（${purpose}）`;
        if (language === 'ru') return `${link} (${purpose})`;
        return `${link} (${purpose})`;
    });
    if (language === 'zh') return `相关入口也可以继续看：${parts.join('；')}`;
    if (language === 'ru') return `Если нужен соседний вход, также посмотрите: ${parts.join('; ')}`;
    return `If you need adjacent entries, also see: ${parts.join('; ')}`;
}

function buildPublicFeatureReply(entry: PublicFeatureEntry, language: string, relatedEntries: PublicFeatureEntry[]): string {
    const recommendation = localizedCopy(entry.recommendation, language);
    const relatedSentence = publicFeatureRelatedSentence(relatedEntries, language);
    const lineThree = relatedSentence ? `${recommendation} ${relatedSentence}`.trim() : recommendation;
    return [
        `1. ${publicFeatureLead(entry, language)}`,
        `2. ${publicFeatureLineTwo(entry, language)}`,
        `3. ${lineThree}`,
    ].join('\n');
}

function publicFeatureSources(entry: PublicFeatureEntry, relatedEntries: PublicFeatureEntry[]): SourceRef[] {
    return uniqueSources([
        {
            title: entry.label,
            url: entry.url,
            source_type: 'site_function',
        },
        ...relatedEntries.map((item) => ({
            title: item.label,
            url: item.url,
            source_type: 'site_function',
        })),
    ], 3);
}

function readablePublicFeatureLead(entry: PublicFeatureEntry, language: string): string {
    if (language === 'zh') {
        if (entry.feature_group === 'workflow') return '\u8fd9\u4e2a\u516c\u5f00\u5165\u53e3\u5c31\u662f\u5f53\u524d\u6700\u5408\u9002\u7684\u7ad9\u5185\u6d41\u7a0b\u5165\u53e3\u3002';
        if (entry.feature_group === 'tool') return 'GasGx \u7ad9\u5185\u6709\u5bf9\u5e94\u7684\u516c\u5f00\u5de5\u5177\u53ef\u4ee5\u76f4\u63a5\u7528\u3002';
        if (entry.feature_group === 'resource') return '\u8fd9\u4e2a\u516c\u5f00\u8d44\u6599\u5165\u53e3\u6700\u9002\u5408\u4f60\u73b0\u5728\u8fd9\u4e2a\u95ee\u9898\u3002';
        if (entry.feature_group === 'support') return '\u8fd9\u4e2a\u516c\u5f00\u652f\u6301\u5165\u53e3\u6700\u9002\u5408\u4f60\u73b0\u5728\u8fd9\u4e2a\u8bc9\u6c42\u3002';
        if (entry.feature_group === 'solution') return 'GasGx \u6709\u5bf9\u5e94\u7684\u516c\u5f00\u65b9\u6848\u9875\u53ef\u4ee5\u76f4\u63a5\u6253\u5f00\u3002';
        if (entry.feature_group === 'digitalization') return 'GasGx \u6709\u5bf9\u5e94\u7684\u516c\u5f00\u6570\u5b57\u5316\u80fd\u529b\u9875\u53ef\u4ee5\u76f4\u63a5\u67e5\u770b\u3002';
        if (entry.feature_group === 'brand') return 'GasGx \u4e5f\u63d0\u4f9b\u8fd9\u4e2a\u516c\u5f00\u54c1\u724c\u5165\u53e3\u3002';
        return '\u8fd9\u4e2a\u516c\u5f00\u7ad9\u70b9\u5165\u53e3\u5c31\u662f\u4f60\u73b0\u5728\u6700\u8be5\u6253\u5f00\u7684\u9875\u9762\u3002';
    }
    if (language === 'ru') {
        if (entry.feature_group === 'workflow') return '\u042d\u0442\u043e \u043b\u0443\u0447\u0448\u0438\u0439 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u044b\u0439 workflow-\u0432\u0445\u043e\u0434 \u0434\u043b\u044f \u0432\u0430\u0448\u0435\u0433\u043e \u0437\u0430\u043f\u0440\u043e\u0441\u0430.';
        if (entry.feature_group === 'tool') return '\u041d\u0430 \u0441\u0430\u0439\u0442\u0435 GasGx \u0435\u0441\u0442\u044c \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u044b\u0439 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442 \u043f\u043e\u0434 \u044d\u0442\u043e\u0442 \u0437\u0430\u043f\u0440\u043e\u0441.';
        if (entry.feature_group === 'resource') return '\u042d\u0442\u043e\u0442 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u044b\u0439 \u0440\u0435\u0441\u0443\u0440\u0441\u043d\u044b\u0439 \u0432\u0445\u043e\u0434 \u043f\u043e\u0434\u0445\u043e\u0434\u0438\u0442 \u0441\u044e\u0434\u0430 \u043b\u0443\u0447\u0448\u0435 \u0432\u0441\u0435\u0433\u043e.';
        if (entry.feature_group === 'support') return '\u042d\u0442\u043e\u0442 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u044b\u0439 support-\u0432\u0445\u043e\u0434 \u043b\u0443\u0447\u0448\u0435 \u0432\u0441\u0435\u0433\u043e \u043f\u043e\u0434\u0445\u043e\u0434\u0438\u0442 \u043f\u043e\u0434 \u0432\u0430\u0448 \u0437\u0430\u043f\u0440\u043e\u0441.';
        if (entry.feature_group === 'solution') return '\u0423 GasGx \u0435\u0441\u0442\u044c \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u0430\u044f solution-\u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043f\u043e\u0434 \u044d\u0442\u043e\u0442 \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u0439.';
        if (entry.feature_group === 'digitalization') return '\u0423 GasGx \u0435\u0441\u0442\u044c \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u0430\u044f digitalization-\u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0434\u043b\u044f \u044d\u0442\u043e\u0433\u043e \u043d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f.';
        if (entry.feature_group === 'brand') return '\u0423 GasGx \u0442\u0430\u043a\u0436\u0435 \u0435\u0441\u0442\u044c \u044d\u0442\u043e\u0442 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u044b\u0439 brand-\u0432\u0445\u043e\u0434.';
        return '\u042d\u0442\u043e \u043f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u044b\u0439 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u044b\u0439 \u0440\u0430\u0437\u0434\u0435\u043b \u0441\u0430\u0439\u0442\u0430 \u0434\u043b\u044f \u0432\u0430\u0448\u0435\u0433\u043e \u0437\u0430\u043f\u0440\u043e\u0441\u0430.';
    }
    return publicFeatureLead(entry, language);
}

function readablePublicFeatureLineTwo(entry: PublicFeatureEntry, language: string): string {
    const link = publicFeatureLink(entry);
    const purpose = localizedPublicFeaturePurpose(entry, language);
    if (language === 'zh') return `\u4e3b\u5165\u53e3\uff1a${link}\u3002\u5b83\u7528\u4e8e${purpose}`;
    if (language === 'ru') return `\u041e\u0441\u043d\u043e\u0432\u043d\u043e\u0439 \u0432\u0445\u043e\u0434: ${link}. \u041e\u043d \u043d\u0443\u0436\u0435\u043d, \u0447\u0442\u043e\u0431\u044b ${purpose}`;
    return `Primary link: ${link} — use it to ${purpose}`;
}

function readablePublicFeatureRelatedSentence(relatedEntries: PublicFeatureEntry[], language: string): string {
    if (!relatedEntries.length) return '';
    const parts = relatedEntries.slice(0, 2).map((item) => {
        const link = publicFeatureLink(item);
        const purpose = localizedPublicFeaturePurpose(item, language);
        if (language === 'zh') return `${link}\uff08${purpose}\uff09`;
        return `${link} (${purpose})`;
    });
    if (language === 'zh') return `\u76f8\u5173\u5165\u53e3\u4e5f\u53ef\u4ee5\u7ee7\u7eed\u770b\uff1a${parts.join('\uff1b')}`;
    if (language === 'ru') return `\u0415\u0441\u043b\u0438 \u043d\u0443\u0436\u0435\u043d \u0441\u043e\u0441\u0435\u0434\u043d\u0438\u0439 \u0432\u0445\u043e\u0434, \u0442\u0430\u043a\u0436\u0435 \u043f\u043e\u0441\u043c\u043e\u0442\u0440\u0438\u0442\u0435: ${parts.join('; ')}`;
    return `If you need adjacent entries, also see: ${parts.join('; ')}`;
}

function buildReadablePublicFeatureReply(entry: PublicFeatureEntry, language: string, relatedEntries: PublicFeatureEntry[]): string {
    const recommendation = localizedPublicFeatureRecommendation(entry, language);
    const relatedSentence = readablePublicFeatureRelatedSentence(relatedEntries, language);
    const lineThree = relatedSentence ? `${recommendation} ${relatedSentence}`.trim() : recommendation;
    return [
        `1. ${readablePublicFeatureLead(entry, language)}`,
        `2. ${readablePublicFeatureLineTwo(entry, language)}`,
        `3. ${lineThree}`,
    ].join('\n');
}

function buildReadablePublicBoundaryReply(message: string, language: string): CraftedReply {
    const normalized = normalizedPublicFeatureIntentText(message);
    const mainIsRequirement = /(quote|quotation|pricing|project brief|requirement|commercial)/i.test(normalized);
    const mainEntry = mainIsRequirement
        ? PUBLIC_FEATURE_ENTRY_MAP.get('requirement_intake_public')
        : PUBLIC_FEATURE_ENTRY_MAP.get('contact_entry');
    const secondaryEntry = mainIsRequirement
        ? PUBLIC_FEATURE_ENTRY_MAP.get('contact_entry')
        : PUBLIC_FEATURE_ENTRY_MAP.get('requirement_intake_public');
    const entry = mainEntry || PUBLIC_FEATURE_ENTRY_MAP.get('contact_entry') || PUBLIC_FEATURE_ENTRIES[0];
    const relatedEntries = secondaryEntry ? [secondaryEntry] : [];
    const boundaryLead = language === 'zh'
        ? '\u4f60\u95ee\u5230\u7684\u662f\u5185\u90e8\u540e\u53f0\u6216\u975e\u516c\u5f00\u64cd\u4f5c\u5165\u53e3\uff0c\u8fd9\u7c7b\u80fd\u529b\u4e0d\u5bf9\u516c\u5f00\u8bbf\u5ba2\u76f4\u63a5\u5f00\u653e\u3002'
        : language === 'ru'
            ? '\u0412\u044b \u0441\u043f\u0440\u043e\u0441\u0438\u043b\u0438 \u043f\u0440\u043e \u0432\u043d\u0443\u0442\u0440\u0435\u043d\u043d\u0438\u0439 backend \u0438\u043b\u0438 \u043d\u0435\u043f\u0443\u0431\u043b\u0438\u0447\u043d\u044b\u0439 \u043e\u043f\u0435\u0440\u0430\u0442\u043e\u0440\u0441\u043a\u0438\u0439 \u0432\u0445\u043e\u0434. \u0422\u0430\u043a\u0438\u0435 \u0432\u043e\u0437\u043c\u043e\u0436\u043d\u043e\u0441\u0442\u0438 \u043d\u0435 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u044e\u0442\u0441\u044f \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u044b\u043c \u043f\u043e\u0441\u0435\u0442\u0438\u0442\u0435\u043b\u044f\u043c \u043d\u0430\u043f\u0440\u044f\u043c\u0443\u044e.'
            : 'You are asking about an internal backend or non-public operator entry. Those capabilities are not exposed directly to public visitors.';
    return {
        provider: 'gasgx_policy',
        reply: [
            `1. ${boundaryLead}`,
            `2. ${readablePublicFeatureLineTwo(entry, language)}`,
            `3. ${readablePublicFeatureRelatedSentence(relatedEntries, language) || localizedPublicFeatureRecommendation(entry, language)}`,
        ].join('\n'),
        sources: publicFeatureSources(entry, relatedEntries),
        handoff: entry.handoff || { required: false, reason: 'unknown', next_fields: [] },
        matchedIntent: 'public_access_boundary',
    };
}

const PUBLIC_FEATURE_PURPOSE_OVERRIDES: Record<string, LocalizedCopy> = {
    contact_entry: copy(
        'reach the public contact entry for project, support or cooperation requests.',
        '进入公开联系入口，提交项目、支持或合作请求。',
        'перейти к публичному контакту для проектных, сервисных или партнерских запросов.',
    ),
    requirement_intake_public: copy(
        'submit a structured project brief for quotation follow-up.',
        '提交结构化项目需求单，用于报价跟进。',
        'отправить структурированный проектный бриф для дальнейшей подготовки коммерческого предложения.',
    ),
    solution_mining: copy(
        'open the public mining or data-center power solution page.',
        '打开公开矿场 / 数据中心供电方案页。',
        'открыть публичную страницу решения для майнинга или питания дата-центров.',
    ),
    resource_datasheets: copy(
        'open the public datasheet library for equipment-detail references.',
        '打开公开 datasheets 资料库，查看设备细节参考。',
        'открыть публичную библиотеку datasheets для просмотра параметров и деталей оборудования.',
    ),
    resource_reports: copy(
        'open the public reports library for market and scenario context.',
        '打开公开 reports 资料库，查看市场和场景背景。',
        'открыть публичную библиотеку reports для просмотра рыночного и сценарного контекста.',
    ),
    resource_faq: copy(
        'open the public FAQ entry for short operational answers.',
        '打开公开 FAQ 入口，查看简短常见问题回答。',
        'открыть публичный FAQ-раздел для быстрых операционных ответов.',
    ),
    tool_site_fit: copy(
        'screen overall project feasibility before quotation.',
        '先做项目整体适配与可行性初筛。',
        'сначала проверить общую применимость и базовую реализуемость проекта до этапа коммерческого предложения.',
    ),
    tool_gas_fit: copy(
        'check whether the gas source and fuel boundary look workable for GasGx solutions.',
        '判断气源与燃气边界是否适合 GasGx 方案。',
        'проверить, подходит ли источник газа и топливная граница для решений GasGx.',
    ),
    tool_engine_selection: copy(
        'narrow the equipment direction before moving to a formal quotation.',
        '在正式报价前先收窄设备方向。',
        'сузить направление по оборудованию перед переходом к формальному报价流程。',
    ),
};

const PUBLIC_FEATURE_RECOMMENDATION_OVERRIDES: Record<string, LocalizedCopy> = {
    contact_entry: copy(
        'If the request is already quotation-oriented, the requirement intake is usually a better structured entry.',
        '如果已经进入报价阶段，requirement intake 通常是更结构化的入口。',
        'Если запрос уже перешел в стадию коммерческого предложения, requirement intake обычно будет более структурированным входом.',
    ),
    requirement_intake_public: copy(
        'Prepare application, target power, gas type and gas quality, country, voltage or frequency, deployment preference and scope boundary before opening it.',
        '打开前最好先准备应用场景、目标功率、气源与气质、国家地区、电压频率、部署偏好和范围边界。',
        'Перед открытием лучше подготовить сценарий применения, мощность, тип и качество газа, страну, напряжение/частоту, предпочтение по deployment и границы scope.',
    ),
    solution_mining: copy(
        'Use this page when the question is about mining solution positioning rather than only miner economics.',
        '如果问题是矿场方案定位，而不是单纯矿机收益，优先看这个页面。',
        'Используйте эту страницу, когда вопрос про позиционирование решения для майнинга, а не только про экономику майнеров.',
    ),
    resource_datasheets: copy(
        'Use datasheets for equipment details, not as a substitute for a qualified quotation scope.',
        'datasheets 适合看设备细节，Reports 更适合做场景或市场背景判断。',
        'Datasheets подходят для деталей оборудования, а reports лучше использовать для оценки сценария и рыночного контекста.',
    ),
    resource_reports: copy(
        'Use reports when you need market context or scenario reading before a detailed quotation.',
        '如果你先想看市场和场景背景，优先看 reports。',
        'Используйте reports, когда сначала нужен рыночный или сценарный контекст, а не детальная报价单。',
    ),
    resource_faq: copy(
        'Use FAQ for short repeated questions before opening longer documents.',
        '如果你只想先看简短高频问题，FAQ 会更快。',
        'Используйте FAQ, если сначала нужен короткий ответ на повторяющийся вопрос.',
    ),
    tool_site_fit: copy(
        'If the fuel boundary is still unclear, open Gas Fit next. If equipment direction matters, continue with Engine Selection.',
        '如果燃气边界还不清楚，下一步看 Gas Fit；如果设备方向更重要，再看 Engine Selection。',
        'Если топливная граница еще не ясна, следующим шагом откройте Gas Fit; если важнее направление по оборудованию, переходите к Engine Selection.',
    ),
    tool_gas_fit: copy(
        'Use it after Site Fit when the main uncertainty is gas quality or fuel boundary.',
        '如果主要不确定项是气质和燃气边界，Site Fit 之后优先看它。',
        'Используйте этот инструмент после Site Fit, когда главная неопределенность связана с качеством газа и топливной границей.',
    ),
    tool_engine_selection: copy(
        'Use it after Site Fit when the next question is equipment direction.',
        '如果下一步重点是设备方向，就接着看它。',
        'Используйте его после Site Fit, когда следующий关键问题是设备方向。',
    ),
};

function localizedPublicFeaturePurpose(entry: PublicFeatureEntry, language: string): string {
    if (language === 'zh') {
        if (entry.id === 'contact_entry') return '\u8fdb\u5165\u516c\u5f00\u8054\u7cfb\u5165\u53e3\uff0c\u63d0\u4ea4\u9879\u76ee\u3001\u652f\u6301\u6216\u5408\u4f5c\u8bf7\u6c42\u3002';
        if (entry.id === 'requirement_intake_public') return '\u63d0\u4ea4\u7ed3\u6784\u5316\u9879\u76ee\u9700\u6c42\u5355\uff0c\u7528\u4e8e\u62a5\u4ef7\u8ddf\u8fdb\u3002';
        if (entry.id === 'solution_mining') return '\u6253\u5f00\u516c\u5f00\u77ff\u573a / \u6570\u636e\u4e2d\u5fc3\u4f9b\u7535\u65b9\u6848\u9875\u3002';
        if (entry.id === 'resource_datasheets') return '\u6253\u5f00\u516c\u5f00 datasheets \u8d44\u6599\u5e93\uff0c\u67e5\u770b\u8bbe\u5907\u7ec6\u8282\u53c2\u8003\u3002';
        if (entry.id === 'resource_reports') return '\u6253\u5f00\u516c\u5f00 reports \u8d44\u6599\u5e93\uff0c\u67e5\u770b\u5e02\u573a\u548c\u573a\u666f\u80cc\u666f\u3002';
        if (entry.id === 'resource_faq') return '\u6253\u5f00\u516c\u5f00 FAQ \u5165\u53e3\uff0c\u67e5\u770b\u7b80\u77ed\u5e38\u89c1\u95ee\u9898\u56de\u7b54\u3002';
        if (entry.id === 'tool_site_fit') return '\u5148\u505a\u9879\u76ee\u6574\u4f53\u9002\u914d\u4e0e\u53ef\u884c\u6027\u521d\u7b5b\u3002';
        if (entry.id === 'tool_gas_fit') return '\u5224\u65ad\u6c14\u6e90\u4e0e\u71c3\u6c14\u8fb9\u754c\u662f\u5426\u9002\u5408 GasGx \u65b9\u6848\u3002';
        if (entry.id === 'tool_engine_selection') return '\u5728\u6b63\u5f0f\u62a5\u4ef7\u524d\u5148\u6536\u7a84\u8bbe\u5907\u65b9\u5411\u3002';
    }
    if (language === 'ru') {
        if (entry.id === 'contact_entry') return '\u043f\u0435\u0440\u0435\u0439\u0442\u0438 \u043a \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u043e\u043c\u0443 \u043a\u043e\u043d\u0442\u0430\u043a\u0442\u0443 \u0434\u043b\u044f \u043f\u0440\u043e\u0435\u043a\u0442\u043d\u044b\u0445, \u0441\u0435\u0440\u0432\u0438\u0441\u043d\u044b\u0445 \u0438\u043b\u0438 \u043f\u0430\u0440\u0442\u043d\u0435\u0440\u0441\u043a\u0438\u0445 \u0437\u0430\u043f\u0440\u043e\u0441\u043e\u0432.';
        if (entry.id === 'requirement_intake_public') return '\u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0439 \u043f\u0440\u043e\u0435\u043a\u0442\u043d\u044b\u0439 \u0431\u0440\u0438\u0444 \u0434\u043b\u044f \u0434\u0430\u043b\u044c\u043d\u0435\u0439\u0448\u0435\u0439 \u043f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u043a\u0438 \u043a\u043e\u043c\u043c\u0435\u0440\u0447\u0435\u0441\u043a\u043e\u0433\u043e \u043f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d\u0438\u044f.';
        if (entry.id === 'solution_mining') return '\u043e\u0442\u043a\u0440\u044b\u0442\u044c \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u0443\u044e \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u0440\u0435\u0448\u0435\u043d\u0438\u044f \u0434\u043b\u044f \u043c\u0430\u0439\u043d\u0438\u043d\u0433\u0430 \u0438\u043b\u0438 \u043f\u0438\u0442\u0430\u043d\u0438\u044f \u0434\u0430\u0442\u0430-\u0446\u0435\u043d\u0442\u0440\u043e\u0432.';
        if (entry.id === 'resource_datasheets') return '\u043e\u0442\u043a\u0440\u044b\u0442\u044c \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u0443\u044e \u0431\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0443 datasheets \u0434\u043b\u044f \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0430 \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u043e\u0432 \u0438 \u0434\u0435\u0442\u0430\u043b\u0435\u0439 \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u044f.';
        if (entry.id === 'resource_reports') return '\u043e\u0442\u043a\u0440\u044b\u0442\u044c \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u0443\u044e \u0431\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0443 reports \u0434\u043b\u044f \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0430 \u0440\u044b\u043d\u043e\u0447\u043d\u043e\u0433\u043e \u0438 \u0441\u0446\u0435\u043d\u0430\u0440\u043d\u043e\u0433\u043e \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442\u0430.';
        if (entry.id === 'resource_faq') return '\u043e\u0442\u043a\u0440\u044b\u0442\u044c \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u044b\u0439 FAQ-\u0440\u0430\u0437\u0434\u0435\u043b \u0434\u043b\u044f \u0431\u044b\u0441\u0442\u0440\u044b\u0445 \u043e\u043f\u0435\u0440\u0430\u0446\u0438\u043e\u043d\u043d\u044b\u0445 \u043e\u0442\u0432\u0435\u0442\u043e\u0432.';
        if (entry.id === 'tool_site_fit') return '\u0441\u043d\u0430\u0447\u0430\u043b\u0430 \u043f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u043e\u0431\u0449\u0443\u044e \u043f\u0440\u0438\u043c\u0435\u043d\u0438\u043c\u043e\u0441\u0442\u044c \u0438 \u0431\u0430\u0437\u043e\u0432\u0443\u044e \u0440\u0435\u0430\u043b\u0438\u0437\u0443\u0435\u043c\u043e\u0441\u0442\u044c \u043f\u0440\u043e\u0435\u043a\u0442\u0430 \u0434\u043e \u044d\u0442\u0430\u043f\u0430 \u043a\u043e\u043c\u043c\u0435\u0440\u0447\u0435\u0441\u043a\u043e\u0433\u043e \u043f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d\u0438\u044f.';
        if (entry.id === 'tool_gas_fit') return '\u043f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c, \u043f\u043e\u0434\u0445\u043e\u0434\u0438\u0442 \u043b\u0438 \u0438\u0441\u0442\u043e\u0447\u043d\u0438\u043a \u0433\u0430\u0437\u0430 \u0438 \u0442\u043e\u043f\u043b\u0438\u0432\u043d\u0430\u044f \u0433\u0440\u0430\u043d\u0438\u0446\u0430 \u0434\u043b\u044f \u0440\u0435\u0448\u0435\u043d\u0438\u0439 GasGx.';
        if (entry.id === 'tool_engine_selection') return '\u0441\u0443\u0437\u0438\u0442\u044c \u043d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u043f\u043e \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u044e \u043f\u0435\u0440\u0435\u0434 \u043f\u0435\u0440\u0435\u0445\u043e\u0434\u043e\u043c \u043a \u0444\u043e\u0440\u043c\u0430\u043b\u044c\u043d\u043e\u043c\u0443 \u0446\u0435\u043d\u043e\u0432\u043e\u043c\u0443 \u043f\u0440\u043e\u0446\u0435\u0441\u0441\u0443.';
    }
    return localizedCopy(PUBLIC_FEATURE_PURPOSE_OVERRIDES[entry.id] || entry.purpose, language);
}

function localizedPublicFeatureRecommendation(entry: PublicFeatureEntry, language: string): string {
    if (language === 'zh') {
        if (entry.id === 'contact_entry') return '\u5982\u679c\u5df2\u7ecf\u8fdb\u5165\u62a5\u4ef7\u9636\u6bb5\uff0crequirement intake \u901a\u5e38\u662f\u66f4\u7ed3\u6784\u5316\u7684\u5165\u53e3\u3002';
        if (entry.id === 'requirement_intake_public') return '\u6253\u5f00\u524d\u6700\u597d\u5148\u51c6\u5907\u5e94\u7528\u573a\u666f\u3001\u76ee\u6807\u529f\u7387\u3001\u6c14\u6e90\u4e0e\u6c14\u8d28\u3001\u56fd\u5bb6\u5730\u533a\u3001\u7535\u538b\u9891\u7387\u3001\u90e8\u7f72\u504f\u597d\u548c\u8303\u56f4\u8fb9\u754c\u3002';
        if (entry.id === 'solution_mining') return '\u5982\u679c\u95ee\u9898\u662f\u77ff\u573a\u65b9\u6848\u5b9a\u4f4d\uff0c\u800c\u4e0d\u662f\u5355\u7eaf\u77ff\u673a\u6536\u76ca\uff0c\u4f18\u5148\u770b\u8fd9\u4e2a\u9875\u9762\u3002';
        if (entry.id === 'resource_datasheets') return 'datasheets \u9002\u5408\u770b\u8bbe\u5907\u7ec6\u8282\uff0cReports \u66f4\u9002\u5408\u505a\u573a\u666f\u6216\u5e02\u573a\u80cc\u666f\u5224\u65ad\u3002';
        if (entry.id === 'resource_reports') return '\u5982\u679c\u4f60\u5148\u60f3\u770b\u5e02\u573a\u548c\u573a\u666f\u80cc\u666f\uff0c\u4f18\u5148\u770b reports\u3002';
        if (entry.id === 'resource_faq') return '\u5982\u679c\u4f60\u53ea\u60f3\u5148\u770b\u7b80\u77ed\u9ad8\u9891\u95ee\u9898\uff0cFAQ \u4f1a\u66f4\u5feb\u3002';
        if (entry.id === 'tool_site_fit') return '\u5982\u679c\u71c3\u6c14\u8fb9\u754c\u8fd8\u4e0d\u6e05\u695a\uff0c\u4e0b\u4e00\u6b65\u770b Gas Fit\uff1b\u5982\u679c\u8bbe\u5907\u65b9\u5411\u66f4\u91cd\u8981\uff0c\u518d\u770b Engine Selection\u3002';
        if (entry.id === 'tool_gas_fit') return '\u5982\u679c\u4e3b\u8981\u4e0d\u786e\u5b9a\u9879\u662f\u6c14\u8d28\u548c\u71c3\u6c14\u8fb9\u754c\uff0cSite Fit \u4e4b\u540e\u4f18\u5148\u770b\u5b83\u3002';
        if (entry.id === 'tool_engine_selection') return '\u5982\u679c\u4e0b\u4e00\u6b65\u91cd\u70b9\u662f\u8bbe\u5907\u65b9\u5411\uff0c\u5c31\u63a5\u7740\u770b\u5b83\u3002';
    }
    if (language === 'ru') {
        if (entry.id === 'contact_entry') return '\u0415\u0441\u043b\u0438 \u0437\u0430\u043f\u0440\u043e\u0441 \u0443\u0436\u0435 \u043f\u0435\u0440\u0435\u0448\u0435\u043b \u0432 \u0441\u0442\u0430\u0434\u0438\u044e \u043a\u043e\u043c\u043c\u0435\u0440\u0447\u0435\u0441\u043a\u043e\u0433\u043e \u043f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d\u0438\u044f, requirement intake \u043e\u0431\u044b\u0447\u043d\u043e \u0431\u0443\u0434\u0435\u0442 \u0431\u043e\u043b\u0435\u0435 \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u043c \u0432\u0445\u043e\u0434\u043e\u043c.';
        if (entry.id === 'requirement_intake_public') return '\u041f\u0435\u0440\u0435\u0434 \u043e\u0442\u043a\u0440\u044b\u0442\u0438\u0435\u043c \u043b\u0443\u0447\u0448\u0435 \u043f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u0438\u0442\u044c \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u0439 \u043f\u0440\u0438\u043c\u0435\u043d\u0435\u043d\u0438\u044f, \u043c\u043e\u0449\u043d\u043e\u0441\u0442\u044c, \u0442\u0438\u043f \u0438 \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u043e \u0433\u0430\u0437\u0430, \u0441\u0442\u0440\u0430\u043d\u0443, \u043d\u0430\u043f\u0440\u044f\u0436\u0435\u043d\u0438\u0435/\u0447\u0430\u0441\u0442\u043e\u0442\u0443, \u043f\u0440\u0435\u0434\u043f\u043e\u0447\u0442\u0435\u043d\u0438\u0435 \u043f\u043e deployment \u0438 \u0433\u0440\u0430\u043d\u0438\u0446\u044b scope.';
        if (entry.id === 'solution_mining') return '\u0418\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0439\u0442\u0435 \u044d\u0442\u0443 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443, \u043a\u043e\u0433\u0434\u0430 \u0432\u043e\u043f\u0440\u043e\u0441 \u043f\u0440\u043e \u043f\u043e\u0437\u0438\u0446\u0438\u043e\u043d\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u0440\u0435\u0448\u0435\u043d\u0438\u044f \u0434\u043b\u044f \u043c\u0430\u0439\u043d\u0438\u043d\u0433\u0430, \u0430 \u043d\u0435 \u0442\u043e\u043b\u044c\u043a\u043e \u043f\u0440\u043e \u044d\u043a\u043e\u043d\u043e\u043c\u0438\u043a\u0443 \u043c\u0430\u0439\u043d\u0435\u0440\u043e\u0432.';
        if (entry.id === 'resource_datasheets') return 'Datasheets \u043f\u043e\u0434\u0445\u043e\u0434\u044f\u0442 \u0434\u043b\u044f \u0434\u0435\u0442\u0430\u043b\u0435\u0439 \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u044f, \u0430 reports \u043b\u0443\u0447\u0448\u0435 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u044c \u0434\u043b\u044f \u043e\u0446\u0435\u043d\u043a\u0438 \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u044f \u0438 \u0440\u044b\u043d\u043e\u0447\u043d\u043e\u0433\u043e \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442\u0430.';
        if (entry.id === 'resource_reports') return '\u0418\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0439\u0442\u0435 reports, \u043a\u043e\u0433\u0434\u0430 \u0441\u043d\u0430\u0447\u0430\u043b\u0430 \u043d\u0443\u0436\u0435\u043d \u0440\u044b\u043d\u043e\u0447\u043d\u044b\u0439 \u0438\u043b\u0438 \u0441\u0446\u0435\u043d\u0430\u0440\u043d\u044b\u0439 \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442, \u0430 \u043d\u0435 \u0434\u0435\u0442\u0430\u043b\u044c\u043d\u0430\u044f \u0446\u0435\u043d\u043e\u0432\u0430\u044f \u043f\u0440\u043e\u0440\u0430\u0431\u043e\u0442\u043a\u0430.';
        if (entry.id === 'resource_faq') return '\u0418\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0439\u0442\u0435 FAQ, \u0435\u0441\u043b\u0438 \u0441\u043d\u0430\u0447\u0430\u043b\u0430 \u043d\u0443\u0436\u0435\u043d \u043a\u043e\u0440\u043e\u0442\u043a\u0438\u0439 \u043e\u0442\u0432\u0435\u0442 \u043d\u0430 \u043f\u043e\u0432\u0442\u043e\u0440\u044f\u044e\u0449\u0438\u0439\u0441\u044f \u0432\u043e\u043f\u0440\u043e\u0441.';
        if (entry.id === 'tool_site_fit') return '\u0415\u0441\u043b\u0438 \u0442\u043e\u043f\u043b\u0438\u0432\u043d\u0430\u044f \u0433\u0440\u0430\u043d\u0438\u0446\u0430 \u0435\u0449\u0435 \u043d\u0435 \u044f\u0441\u043d\u0430, \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u043c \u0448\u0430\u0433\u043e\u043c \u043e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 Gas Fit; \u0435\u0441\u043b\u0438 \u0432\u0430\u0436\u043d\u0435\u0435 \u043d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u043f\u043e \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u044e, \u043f\u0435\u0440\u0435\u0445\u043e\u0434\u0438\u0442\u0435 \u043a Engine Selection.';
        if (entry.id === 'tool_gas_fit') return '\u0418\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0439\u0442\u0435 \u044d\u0442\u043e\u0442 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442 \u043f\u043e\u0441\u043b\u0435 Site Fit, \u043a\u043e\u0433\u0434\u0430 \u0433\u043b\u0430\u0432\u043d\u0430\u044f \u043d\u0435\u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u043d\u043e\u0441\u0442\u044c \u0441\u0432\u044f\u0437\u0430\u043d\u0430 \u0441 \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u043e\u043c \u0433\u0430\u0437\u0430 \u0438 \u0442\u043e\u043f\u043b\u0438\u0432\u043d\u043e\u0439 \u0433\u0440\u0430\u043d\u0438\u0446\u0435\u0439.';
        if (entry.id === 'tool_engine_selection') return '\u0418\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0439\u0442\u0435 \u0435\u0433\u043e \u043f\u043e\u0441\u043b\u0435 Site Fit, \u043a\u043e\u0433\u0434\u0430 \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u0439 \u043a\u043b\u044e\u0447\u0435\u0432\u043e\u0439 \u0432\u043e\u043f\u0440\u043e\u0441 \u2014 \u043d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u043f\u043e \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u044e.';
    }
    return localizedCopy(PUBLIC_FEATURE_RECOMMENDATION_OVERRIDES[entry.id] || entry.recommendation, language);
}

function cleanPublicFeatureLead(entry: PublicFeatureEntry, language: string): string {
    if (language === 'zh') {
        if (entry.feature_group === 'workflow') return '这个公开入口就是当前最合适的站内流程入口。';
        if (entry.feature_group === 'tool') return 'GasGx 站内有对应的公开工具可以直接用。';
        if (entry.feature_group === 'resource') return '这个公开资料入口最适合你现在这个问题。';
        if (entry.feature_group === 'support') return '这个公开支持入口最适合你现在这个诉求。';
        if (entry.feature_group === 'solution') return 'GasGx 有对应的公开方案页可以直接打开。';
        if (entry.feature_group === 'digitalization') return 'GasGx 有对应的公开数字化能力页可以直接查看。';
        if (entry.feature_group === 'brand') return 'GasGx 也提供这个公开品牌入口。';
        return '这个公开站点入口就是你现在最该打开的页面。';
    }
    if (language === 'ru') {
        if (entry.feature_group === 'workflow') return 'Это лучший публичный workflow-вход для вашего запроса.';
        if (entry.feature_group === 'tool') return 'На сайте GasGx есть публичный инструмент под этот запрос.';
        if (entry.feature_group === 'resource') return 'Этот публичный ресурсный вход подходит сюда лучше всего.';
        if (entry.feature_group === 'support') return 'Этот публичный support-вход лучше всего подходит под ваш запрос.';
        if (entry.feature_group === 'solution') return 'У GasGx есть публичная solution-страница под этот сценарий.';
        if (entry.feature_group === 'digitalization') return 'У GasGx есть публичная digitalization-страница для этого направления.';
        if (entry.feature_group === 'brand') return 'У GasGx также есть этот публичный brand-вход.';
        return 'Это правильный публичный раздел сайта для вашего запроса.';
    }
    return publicFeatureLead(entry, language);
}

function cleanPublicFeatureLineTwo(entry: PublicFeatureEntry, language: string): string {
    const link = publicFeatureLink(entry);
    const purpose = localizedPublicFeaturePurpose(entry, language);
    if (language === 'zh') return `主入口：${link}。它用于${purpose}`;
    if (language === 'ru') return `Основной вход: ${link}. Он нужен, чтобы ${purpose}`;
    return `Primary link: ${link} — use it to ${purpose}`;
}

function cleanPublicFeatureRelatedSentence(relatedEntries: PublicFeatureEntry[], language: string): string {
    if (!relatedEntries.length) return '';
    const parts = relatedEntries.slice(0, 2).map((item) => {
        const link = publicFeatureLink(item);
        const purpose = localizedPublicFeaturePurpose(item, language);
        if (language === 'zh') return `${link}（${purpose}）`;
        return `${link} (${purpose})`;
    });
    if (language === 'zh') return `相关入口也可以继续看：${parts.join('；')}`;
    if (language === 'ru') return `Если нужен соседний вход, также посмотрите: ${parts.join('; ')}`;
    return `If you need adjacent entries, also see: ${parts.join('; ')}`;
}

function buildCleanPublicFeatureReply(entry: PublicFeatureEntry, language: string, relatedEntries: PublicFeatureEntry[]): string {
    const recommendation = localizedPublicFeatureRecommendation(entry, language);
    const relatedSentence = cleanPublicFeatureRelatedSentence(relatedEntries, language);
    const lineThree = relatedSentence ? `${recommendation} ${relatedSentence}`.trim() : recommendation;
    return [
        `1. ${cleanPublicFeatureLead(entry, language)}`,
        `2. ${cleanPublicFeatureLineTwo(entry, language)}`,
        `3. ${lineThree}`,
    ].join('\n');
}

function normalizedPublicFeatureIntentText(message: string): string {
    return normalizedIntentText(message)
        .replace(/\u9879\u76ee\u9700\u6c42|\u9700\u6c42\u5355|\u62a5\u4ef7|\u8be2\u4ef7|\u9700\u6c42/g, ' requirement quotation ')
        .replace(/\u63d0\u4ea4|\u5165\u53e3|\u8868\u5355/g, ' submit form ')
        .replace(/\u8d44\u6e90\u4e2d\u5fc3|\u8d44\u6599\u4e2d\u5fc3|\u8d44\u6e90\u9875|\u8d44\u6599\u9875/g, ' resources hub ')
        .replace(/\u5de5\u5177\u4e2d\u5fc3|\u5de5\u5177\u9875/g, ' tools hub ')
        .replace(/\u540e\u53f0\u6587\u7ae0\u7ba1\u7406|\u6587\u7ae0\u7ba1\u7406\u540e\u53f0|\u540e\u53f0\u7ba1\u7406|\u5185\u90e8\u540e\u53f0|\u7f16\u8f91\u5668\u540e\u53f0|\u5185\u90e8\u7cfb\u7edf/g, ' internal admin backend ')
        .replace(/\u53ef\u7814|\u521d\u6b65\u7b5b\u9009|\u9879\u76ee\u9002\u914d|\u7b5b\u9009/g, ' screening ')
        .replace(/\u5de5\u5177|\u8ba1\u7b97\u5668|\u5206\u6790\u5de5\u5177/g, ' tool ')
        .replace(/\u53c2\u6570\u8868|\u8d44\u6599\u8868/g, ' datasheets ')
        .replace(/\u62a5\u544a\u5165\u53e3|\u884c\u4e1a\u62a5\u544a|\u7814\u7a76\u62a5\u544a|\u62a5\u544a/g, ' reports ')
        .replace(/\u5e38\u89c1\u95ee\u9898|\u5e2e\u52a9\u95ee\u7b54/g, ' faq ')
        .replace(/\u6848\u4f8b|\u6210\u529f\u6848\u4f8b/g, ' case studies ')
        .replace(/\u89c6\u9891|\u89c6\u9891\u8d44\u6599/g, ' videos ')
        .replace(/\u767d\u76ae\u4e66/g, ' whitepapers ')
        .replace(/\u8ba4\u8bc1|\u8bc1\u4e66/g, ' certifications ')
        .replace(/\u77ff\u573a\u65b9\u6848\u9875|\u6316\u77ff\u65b9\u6848\u9875/g, ' mining solution ')
        .replace(/\u6cb9\u7530\u65b9\u6848\u9875|\u4f34\u751f\u6c14\u65b9\u6848\u9875/g, ' oilfield solution ')
        .replace(/\u5de5\u4e1a\u65b9\u6848\u9875|\u5de5\u5382\u65b9\u6848\u9875/g, ' industrial solution ')
        .replace(/\u70ed\u7535\u8054\u4f9b\u65b9\u6848\u9875|chp \u9875\u9762/g, ' chp solution ')
        .replace(/\u9879\u76ee\u9002\u914d\u5de5\u5177/g, ' site fit tool ')
        .replace(/\u6c14\u6e90\u9002\u914d\u5de5\u5177/g, ' gas fit tool ')
        .replace(/\u9009\u578b\u5de5\u5177|\u53d1\u52a8\u673a\u9009\u578b/g, ' engine selection tool ')
        .replace(/\u77ff\u673a\u9009\u8d2d|\u77ff\u673a\u9009\u578b/g, ' miner buying guide ')
        .replace(/\u6295\u8d44\u56de\u62a5/g, ' roi ')
        .replace(/\u8d44\u672c\u56de\u62a5|\u8d44\u672c\u56de\u62a5\u7387/g, ' roce ')
        .replace(/\u5e73\u51c6\u5316\u5ea6\u7535\u6210\u672c/g, ' lcoe ')
        .replace(/\u6c14\u4f53\u5206\u6790\u5de5\u5177/g, ' gas analyzer ')
        .replace(/\u8fd0\u8f93\u5206\u6790|\u7269\u6d41\u5de5\u5177/g, ' logistics ')
        .replace(/\u5408\u89c4\u5de5\u5177|\u6cd5\u89c4\u5de5\u5177/g, ' compliance ')
        .replace(/\u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c|\u0444\u043e\u0440\u043c\u0430 \u0437\u0430\u044f\u0432\u043a\u0438|\u0444\u043e\u0440\u043c\u0430 \u0437\u0430\u043f\u0440\u043e\u0441\u0430|\u043a\u043e\u043c\u043c\u0435\u0440\u0447\u0435\u0441\u043a/g, ' requirement quotation submit ')
        .replace(/\u0446\u0435\u043d\u0442\u0440 \u0440\u0435\u0441\u0443\u0440\u0441\u043e\u0432|\u0440\u0430\u0437\u0434\u0435\u043b \u0440\u0435\u0441\u0443\u0440\u0441\u043e\u0432/g, ' resources hub ')
        .replace(/\u0446\u0435\u043d\u0442\u0440 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u043e\u0432|\u0440\u0430\u0437\u0434\u0435\u043b \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u043e\u0432/g, ' tools hub ')
        .replace(/\u043a\u0430\u043a\u043e\u0439 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442|\u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442|\u043f\u0435\u0440\u0432\u0438\u0447\u043d|\u0441\u043a\u0440\u0438\u043d\u0438\u043d\u0433|\u043f\u0440\u043e\u0435\u043a\u0442/g, ' tool screening ')
        .replace(/\u0432\u043d\u0443\u0442\u0440\u0435\u043d\u043d|\u0430\u0434\u043c\u0438\u043d\u043a|\u0430\u0434\u043c\u0438\u043d/g, ' internal admin backend ')
        .replace(/\u043e\u043a\u0443\u043f\u0430\u0435\u043c|\u0432\u043e\u0437\u0432\u0440\u0430\u0442 \u0438\u043d\u0432\u0435\u0441\u0442/g, ' roi ')
        .replace(/\u043a\u0435\u0439\u0441|\u043a\u0435\u0439\u0441\u044b/g, ' case studies ')
        .replace(/\u0432\u0438\u0434\u0435\u043e/g, ' videos ')
        .replace(/\u0432\u0430\u0439\u0442\u043f\u0435\u0439\u043f\u0435\u0440/g, ' whitepapers ')
        .replace(/\u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043a\u0430\u0446/g, ' certifications ')
        .replace(/\u043f\u043e\u043a\u0443\u043f\u043a\u0430 \u043c\u0430\u0439\u043d\u0435\u0440|\u0432\u044b\u0431\u043e\u0440 \u043c\u0430\u0439\u043d\u0435\u0440/g, ' miner buying guide ')
        .replace(/\u043e\u043a\u0443\u043f\u0430\u0435\u043c\u043e\u0441\u0442\u044c \u043a\u0430\u043f\u0438\u0442\u0430\u043b|\u0440\u0435\u043d\u0442\u0430\u0431\u0435\u043b\u044c\u043d\u043e\u0441\u0442\u044c \u043a\u0430\u043f\u0438\u0442\u0430\u043b/g, ' roce ')
        .replace(/\u0434\u0430\u0442\u0430\u0448\u0438\u0442/g, ' datasheets ')
        .replace(/\u043e\u0442\u0447\u0435\u0442/g, ' reports ')
        .replace(/\u0447\u0430\u0441\u0442\u043e \u0437\u0430\u0434\u0430\u0432\u0430\u0435\u043c/g, ' faq ');
}

function isInternalAdminFeatureQuery(message: string): boolean {
    const normalized = normalizedPublicFeatureIntentText(message);
    return /(admin backend|admin panel|internal admin|article management|cms backend|sales portal|operator portal|editor backend|back office|dashboard login|internal.*backend)/i.test(normalized);
}

function buildPublicBoundaryReply(message: string, language: string): CraftedReply {
    const normalized = normalizedPublicFeatureIntentText(message);
    const mainIsRequirement = /(quote|quotation|pricing|project brief|requirement|commercial)/i.test(normalized);
    const mainEntry = mainIsRequirement
        ? PUBLIC_FEATURE_ENTRY_MAP.get('requirement_intake_public')
        : PUBLIC_FEATURE_ENTRY_MAP.get('contact_entry');
    const secondaryEntry = mainIsRequirement
        ? PUBLIC_FEATURE_ENTRY_MAP.get('contact_entry')
        : PUBLIC_FEATURE_ENTRY_MAP.get('requirement_intake_public');
    const entry = mainEntry || PUBLIC_FEATURE_ENTRY_MAP.get('contact_entry') || PUBLIC_FEATURE_ENTRIES[0];
    const relatedEntries = secondaryEntry ? [secondaryEntry] : [];
    const boundaryLead = language === 'zh'
        ? '你问到的是内部后台或非公开操作入口，这类能力不对公开访客直接开放。'
        : language === 'ru'
            ? 'Вы спросили про внутренний backend или непубличный операторский вход. Такие возможности не открываются публичным посетителям напрямую.'
            : 'You are asking about an internal backend or non-public operator entry. Those capabilities are not exposed directly to public visitors.';
    const reply = [
        `1. ${boundaryLead}`,
        `2. ${publicFeatureLineTwo(entry, language)}`,
        `3. ${publicFeatureRelatedSentence(relatedEntries, language) || localizedCopy(entry.recommendation, language)}`,
    ].join('\n');
    return {
        provider: 'gasgx_policy',
        reply,
        sources: publicFeatureSources(entry, relatedEntries),
        handoff: entry.handoff || { required: false, reason: 'unknown', next_fields: [] },
        matchedIntent: 'public_access_boundary',
    };
}

function pickPublicFeatureAnswer(message: string, language: string, _pageContext: PageContext): CraftedReply | null {
    if (isInternalAdminFeatureQuery(message)) {
        return buildReadablePublicBoundaryReply(message, language);
    }

    const normalized = normalizedPublicFeatureIntentText(message);
    if (/(where should i submit|submit.*project brief|submit.*requirement|requirement form|quotation form|quote form|quotation workflow|requirement.*submit|quotation.*submit|requirement quotation)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('requirement_intake_public', language, ['tool_site_fit', 'contact_entry'], 'public_feature_requirement_intake_public');
    }
    if (/(resources hub|resources page|resource center|resource library)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('site_resources', language, ['resource_datasheets', 'resource_reports'], 'public_feature_site_resources');
    }
    if (/(tools hub|tools page|tool center|tool library|available tools)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('tools_overview', language, ['tool_site_fit', 'tool_gas_fit'], 'public_feature_tools_overview');
    }
    if (/(which tool.*first|which tool.*feasibility|feasibility screening|first screening tool|project fit tool|tool.*screening|screening.*tool|site fit tool)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('tool_site_fit', language, ['tool_gas_fit', 'tool_engine_selection'], 'public_feature_tool_site_fit');
    }
    if (/(datasheet|datasheets|parameter sheet)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('resource_datasheets', language, ['resource_reports', 'resource_faq'], 'public_feature_resource_datasheets');
    }
    if (/(report|reports)/i.test(normalized) && !/(datasheet|datasheets|parameter sheet)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('resource_reports', language, ['resource_datasheets', 'resource_faq'], 'public_feature_resource_reports');
    }
    if (/(faq|faq entry)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('resource_faq', language, ['resource_datasheets', 'resource_reports'], 'public_feature_resource_faq');
    }
    if (/(case stud|case studies|example projects|reference cases)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('resource_case_studies', language, ['resource_reports', 'resource_datasheets'], 'public_feature_resource_case_studies');
    }
    if (/(videos|video library|video page|visual overview)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('resource_videos', language, ['resource_case_studies', 'resource_whitepapers'], 'public_feature_resource_videos');
    }
    if (/(whitepaper|whitepapers|white paper|long-form resource)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('resource_whitepapers', language, ['resource_reports', 'resource_case_studies'], 'public_feature_resource_whitepapers');
    }
    if (/(certification|certifications|certificate references|certificate page)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('resource_certifications', language, ['tool_global_compliance', 'resource_datasheets'], 'public_feature_resource_certifications');
    }
    if (/(mining solution|mining solution page)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('solution_mining', language, [], 'public_feature_solution_mining');
    }
    if (/(oilfield solution)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('solution_oilfield', language, [], 'public_feature_solution_oilfield');
    }
    if (/(industrial solution)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('solution_industrial', language, [], 'public_feature_solution_industrial');
    }
    if (/(chp solution|cogeneration page)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('solution_chp', language, [], 'public_feature_solution_chp');
    }
    if (/(site fit|site-fit)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('tool_site_fit', language, ['tool_gas_fit', 'tool_engine_selection'], 'public_feature_tool_site_fit');
    }
    if (/(gas fit|gas-fit)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('tool_gas_fit', language, ['tool_site_fit', 'tool_engine_selection'], 'public_feature_tool_gas_fit');
    }
    if (/(engine selection|engine-selection)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('tool_engine_selection', language, ['tool_site_fit', 'tool_gas_fit'], 'public_feature_tool_engine_selection');
    }
    if (/(miner buying guide|buying guide|miner guide)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('tool_miner_buying_guide', language, ['tool_mining_power_calc', 'tool_miner_profitability'], 'public_feature_tool_miner_buying_guide');
    }
    if (/(roi|return on investment)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('tool_roi', language, ['tool_lcoe_calculator', 'tool_roce_calculator'], 'public_feature_tool_roi');
    }
    if (/(roce|return on capital employed|capital return)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('tool_roce_calculator', language, ['tool_roi', 'tool_lcoe_calculator'], 'public_feature_tool_roce_calculator');
    }
    if (/(lcoe|levelized cost)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('tool_lcoe_calculator', language, ['tool_roi', 'tool_roce_calculator'], 'public_feature_tool_lcoe_calculator');
    }
    if (/(gas analyzer|gas analyser)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('tool_gas_analyzer', language, ['tool_gas_fit'], 'public_feature_tool_gas_analyzer');
    }
    if (/(logistics|shipping)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('tool_global_logistics', language, ['tool_global_compliance'], 'public_feature_tool_global_logistics');
    }
    if (/(compliance|regulatory)/i.test(normalized)) {
        return buildPublicFeatureCraftedReply('tool_global_compliance', language, ['tool_global_logistics'], 'public_feature_tool_global_compliance');
    }

    let bestEntry: PublicFeatureEntry | null = null;
    let bestScore = 0;
    for (const entry of PUBLIC_FEATURE_ENTRIES) {
        const score = scorePatterns(normalized, entry.patterns);
        if (score > bestScore) {
            bestEntry = entry;
            bestScore = score;
        }
    }
    if (!bestEntry || bestScore <= 0) return null;
    return buildPublicFeatureCraftedReply(bestEntry.id, language, bestEntry.related_ids || []);
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
                quote_requirements: `GasGx 可以支持正式报价，但别只丢一个泛泛的询价。要往报价走，最省时间的是直接填这个公开需求单：${REQUIREMENT_INTAKE_URL}。先准备应用场景、目标功率、气源类型与气质、国家地区、电压频率、部署偏好、交付范围和服务范围。`,
                requirement_intake: `如果项目已经进入预算、落地或供应商比较阶段，直接填 GasGx 公开需求单最合适：${REQUIREMENT_INTAKE_URL}。这个入口会把应用场景、目标功率、气源类型、气质、国家地区、电压频率、部署偏好、交付范围和服务范围一次收齐。`,
                site_fit_tool: `如果你还在可研或方向筛选阶段，先用站内工具更合适，不用急着直接问报价。整体可研看 ${SITE_FIT_URL}，气源边界看 ${GAS_FIT_URL}，设备方向筛选看 ${ENGINE_SELECTION_URL}。`,
                deployment_compare: '一般来说，集装箱化更适合追求快速打包部署的项目；AIS 一体化更适合电气边界和集成度要求更高的项目；撬装更适合由现场团队或 EPC 侧吸收更多定制化土建与配套工作的项目。',
                oilfield_scenario_fit: `油田伴生气发电通常适合那些气源相对稳定、站内负载明确、现场服务边界可控的项目。下一步通常要确认气源类型、气质、可用流量或压力、目标功率、国家地区、现场条件和服务范围。早期可研可先看 ${SITE_FIT_URL}，如果项目已经在推进，建议直接进入 ${REQUIREMENT_INTAKE_URL}。`,
                mining_scenario_fit: `燃气供能的算力 / 矿场项目，通常适合那些气源相对稳定、负载明确、现场运维模式清晰的站点。GasGx 下一步一般会确认气质、目标功率或矿机负载、国家地区、电压频率和部署偏好。早期筛选适合先看 ${SITE_FIT_URL}，项目推进阶段适合直接填写 ${REQUIREMENT_INTAKE_URL}。`,
                industrial_scenario_fit: '工业分布式发电通常适合那些用能轮廓明确、燃料边界清晰、并网 / 冷却 / 运维责任边界可定义的项目。GasGx 一般会先确认目标功率、气源类型、站点类型、电压频率和服务范围，再继续缩小方案。',
                chp_scenario_fit: 'CHP 热电联供只有在项目同时具备稳定电负荷和可被实际消纳的热负荷时才真正成立。GasGx 一般会先确认目标功率、气源类型、热利用场景、站点类型、交付范围和服务范围，再判断 CHP 是否应作为优先方向。',
                resource_guidance: `如果你现在主要是找资料，先看站内资源就够了：设备细节看参数表，市场和场景背景看研究报告，短问题先看 FAQ。入口分别是 ${DATASHEETS_URL}、${REPORTS_URL} 和 ${FAQ_URL}。`,
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
                `If you send those inputs, GasGx can tighten the quotation scope and move the project forward through ${CONTACT_EMAIL}.`,
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
                `如果你把这些信息发我，GasGx 就能先把报价范围收出来，再由 ${CONTACT_EMAIL} 接着往下跟。`,
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
    } else if (matchedIntent.startsWith('public_feature_')) {
        ['tools', 'resources', 'support', 'quote', 'about', 'solutions', 'products', 'news'].forEach((item) => preferred.add(item));
    }

    const normalized = normalizedIntentText(message);
    if (/(datasheet|whitepaper|case stud|certif|faq|brochure|manual|resource)/.test(normalized)) {
        preferred.add('resources');
    }
    if (/(tool|calculator|analyzer|analysis|site fit|gas fit|engine selection|roi|lcoe|compliance|logistics|矿机|工具|可研|计算器|分析工具|инструмент|калькулятор|анализатор)/.test(normalized)) {
        preferred.add('tools');
    }
    if (/(requirement|project brief|quotation form|quote form|submit a brief|project intake|需求单|需求表|报价表单|коммерческ|форма запроса|project brief)/.test(normalized)) {
        preferred.add('quote');
        preferred.add('about');
        preferred.add('support');
    }
    if (/(news|flash|event|insight|data page|新闻|快讯|数据页|活动|новости|flash|data)/.test(normalized)) {
        preferred.add('news');
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
        'Your job is to help prospects, customers and partners understand GasGx products, solutions, public site features, quotation requirements, delivery boundaries, service scope and next-step project qualification.',
        '',
        'Priority rules:',
        '- Lead with a direct answer, not a disclaimer.',
        '- Your external identity is always GasGx Assistant / GasGx 智能顾问. Never say you are Spark, XFYUN, iFlytek, a large language model, or the underlying model provider.',
        '- If the user asks who you are, answer as the GasGx website assistant and solution advisor. Do not expose the model vendor as your identity.',
        '- If retrieved GasGx knowledge exists, use it as the primary factual basis.',
        '- Keep the first answer concise but commercially useful.',
        '- Write with normal spacing and punctuation. Avoid robotic phrasing, broken word joins and repeated filler.',
        '- Never narrate your own process or retrieval with lead-ins like "根据当前知识库", "以下是", "为了更好地帮助你", "Here is the most relevant...", or "If helpful, I can also...". Start from the answer, recommendation or next step itself.',
        '- Sound like an experienced human pre-sales engineer, not a scripted chatbot or customer-service template.',
        '- Avoid formulaic sales filler such as "我可以帮你整理成售前简表" unless the user explicitly asks for a brief or a draft email.',
        '- Prefer short paragraphs or flat bullets for fit, scope, checklist and qualification questions.',
        '- Never fabricate exact inventory, lead time, pricing, warranty, certification status or contractual commitments.',
        `- When the conversation reaches quotation or project-intent stage, guide the user toward the structured requirement intake at ${REQUIREMENT_INTAKE_URL} before falling back to ${CONTACT_EMAIL}.`,
        '- Ask only the minimum follow-up questions needed to advance qualification.',
        '- If the current page is a specific product detail page, prioritize that page\'s fit, scope, qualification and quotation details before broader catalog copy.',
        '- Default reply flow: direct answer first, then 2-4 critical missing inputs, then one concrete website action.',
        '- For public site feature questions, explain the best public entry and include one primary Markdown link with a short explanation.',
        `- Exploration stage should usually point to ${SITE_FIT_URL}, ${GAS_FIT_URL} or ${ENGINE_SELECTION_URL}.`,
        `- Documentation stage should usually point to ${DATASHEETS_URL}, ${REPORTS_URL} or ${FAQ_URL}.`,
        `- Public contact or support routing should usually point to ${ABOUT_CONTACT_URL}.`,
        '- Do not promise final pricing, ROI, compliance approval or delivery commitments before qualification is complete.',
        '',
        'Known GasGx offering map:',
        '- Generator products are organized by power range, gas source, cooling and deployment form.',
        '- Power range families: under 500 kW, 500-1000 kW and 1 MW+.',
        '- Gas fit includes natural gas, associated or flare gas and low-methane gas.',
        '- Deployment forms include containerized, AIS-integrated and skid-mounted units.',
        '- Solution families include oilfield power, mining or data-center power, industrial distributed energy and CHP.',
        '- Digital systems include O&M Platform, ECM, IMS and Sales System.',
        '- Public workflow and feature entries include requirement intake, tools, resources, support, news and brand quote routes.',
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

function hasAssistantIdentityLeak(reply: string): boolean {
    const head = normalizeGeneratedReply(reply).slice(0, 240);
    if (!head) return false;
    return [
        /(?:^|[\n。！？.!?])\s*(?:我是|我叫|我是由).{0,24}(?:讯飞|星火|科大讯飞)/,
        /(?:^|[\n。！？.!?])\s*我是.{0,18}(?:认知大模型|大语言模型|语言模型|AI模型)/,
        /(?:^|[\n.!?])\s*(?:i am|i'm|this is)\s+.{0,32}(?:spark|xfyun|iflytek|large language model|language model|ai model)/i,
        /(?:^|[\n.!?])\s*(?:i was built by|built by|developed by)\s+.{0,24}(?:xfyun|iflytek|spark)/i,
        /(?:^|[\n.!?])\s*(?:я|это)\s+.{0,28}(?:spark|xfyun|iflytek|языковая модель|модель ии)/i,
    ].some((pattern) => pattern.test(head));
}

function genericIdentitySafeReply(language: string): string {
    if (language === 'zh') {
        return `我是 GasGx 智能顾问，主要帮助你了解 GasGx 的产品、解决方案、公开工具、资料入口和报价流程。你可以直接告诉我你的应用场景、目标功率和气源类型，我会继续给你收敛到合适方向。`;
    }
    if (language === 'ru') {
        return `Я GasGx Assistant. Я помогаю разобраться в продуктах GasGx, сценариях применения, публичных инструментах, ресурсах сайта и входе в процесс коммерческого предложения. Сообщите сценарий, целевую мощность и тип газа, и я сузю следующий шаг.`;
    }
    return `I am GasGx Assistant. I help with GasGx products, solution paths, public tools, website resources and quotation intake. Share your scenario, target power and gas type, and I will narrow the next step.`;
}

function recoverIdentityLeakReply(
    language: string,
    message: string,
    matchedIntent: string,
    knowledgeHits: KnowledgeChunkHit[],
    handoff: HandoffMeta,
): CraftedReply {
    const fallbackRule = phase1CanonicalFallbackRule(matchedIntent, language)
        || canonicalFallbackRule(matchedIntent, language);

    if (fallbackRule) {
        const safeHandoff = deriveHandoff(message, matchedIntent || fallbackRule.intent_key, fallbackRule);
        return {
            provider: 'gasgx_policy',
            reply: localizedPolicyAnswer(fallbackRule, language),
            sources: uniqueSources(fallbackRule.source_refs || []),
            handoff: safeHandoff,
            matchedIntent: fallbackRule.intent_key,
        };
    }

    if (knowledgeHits.length) {
        return {
            provider: 'gasgx_rag',
            reply: composeKnowledgeFallbackReply(language, knowledgeHits, handoff),
            sources: buildKnowledgeSources(knowledgeHits, { title: '', path: '', url: '', lang: language }),
            handoff,
            matchedIntent: matchedIntent || 'identity_safe_knowledge_fallback',
        };
    }

    return {
        provider: 'gasgx_policy',
        reply: genericIdentitySafeReply(language),
        sources: [],
        handoff,
        matchedIntent: matchedIntent || 'identity_safe_fallback',
    };
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
            ...sourceLines,
            handoff.required && handoff.next_fields.length
                ? `如果你想继续往方案或报价走，把这些信息发我：${handoff.next_fields.join('、')}。`
                : `如果你想继续，我可以帮你把需求收齐后发到 ${CONTACT_EMAIL}。`,
        ].join('\n');
    }
    if (language === 'ru') {
        return [
            ...sourceLines,
            handoff.required && handoff.next_fields.length
                ? `Если хотите двигаться дальше по решению или коммерческому предложению, пришлите: ${handoff.next_fields.join(', ')}.`
                : `Если хотите продолжить, я помогу собрать вводные и отправить их на ${CONTACT_EMAIL}.`,
        ].join('\n');
    }
    return [
        ...sourceLines,
        handoff.required && handoff.next_fields.length
            ? `If you want to keep moving toward a solution or quotation, send me: ${handoff.next_fields.join(', ')}. You can also use ${REQUIREMENT_INTAKE_URL}.`
            : `If you want to keep going, I can help gather the key inputs and send them to ${CONTACT_EMAIL}.`,
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
        const publicFeatureReply = craftedReply ? null : pickPublicFeatureAnswer(message, language, pageContext);
        const matchedRule = pickStrandedGasQuoteRule(message, language, faqRules)
            || pickCountryStrandedGasRule(message, language, faqRules)
            || (craftedReply || publicFeatureReply ? null : pickPhase1ScenarioRule(message, language, faqRules))
            || (craftedReply || publicFeatureReply ? null : pickFaqRule(message, language, faqRules, matchedIntent));

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

        if (publicFeatureReply) {
            await insertChatLog(serviceClient, {
                sessionId,
                message,
                reply: publicFeatureReply.reply,
                language,
                provider: publicFeatureReply.provider,
                matchedIntent: publicFeatureReply.matchedIntent,
                pageContext,
                sources: publicFeatureReply.sources,
                handoff: publicFeatureReply.handoff,
            });
            await insertLeadIntent(serviceClient, {
                sessionId,
                message,
                intent: publicFeatureReply.matchedIntent,
                language,
                provider: publicFeatureReply.provider,
                sources: publicFeatureReply.sources,
                handoff: publicFeatureReply.handoff,
            });
            return json({
                ok: true,
                provider: publicFeatureReply.provider,
                reply: publicFeatureReply.reply,
                language,
                sources: publicFeatureReply.sources,
                handoff: publicFeatureReply.handoff,
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
        let sources = buildKnowledgeSources(knowledgeHits, pageContext);
        let handoff = deriveHandoff(message, matchedIntent, null);
        let responseIntent = matchedIntent;

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

        if (hasAssistantIdentityLeak(reply)) {
            const recovered = recoverIdentityLeakReply(language, message, matchedIntent, knowledgeHits, handoff);
            reply = recovered.reply;
            provider = recovered.provider;
            sources = recovered.sources;
            handoff = recovered.handoff;
            responseIntent = recovered.matchedIntent;
        }

        await insertChatLog(serviceClient, {
            sessionId,
            message,
            reply,
            language,
            provider,
            matchedIntent: responseIntent,
            pageContext,
            sources,
            handoff,
        });
        await insertLeadIntent(serviceClient, {
            sessionId,
            message,
            intent: responseIntent,
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
            matchedIntent: responseIntent,
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
