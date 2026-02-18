import { renderSharedAuthState } from './layout.shared.js';
import { HEADER_NAVIGATION } from '../config/navigation.config.js';

const SUPABASE_URL = 'https://mkpcliytqudclkwtewru.supabase.co';
const SUPABASE_KEY = 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';
const DEFAULT_COVER = '/news/advertisement/zhanwei.jpg';
const GOOGLE_CHARTS_LOADER = 'https://www.gstatic.com/charts/loader.js';
const CANADA_LOCAL_TIMEZONE = 'Asia/Shanghai';

const CANADA_CHART_SPECS = {
    gas_alberta_vs_regulated: {
        containerId: 'ggx-chart-gas-alberta-vs-regulated',
        seriesOrder: ['Gas Alberta', 'WTD AVG', 'DERS', 'AUI'],
        colors: ['#3dd6f5', '#5dd62c', '#ff6b6b', '#f7b84a'],
        lineIndexes: [2, 3],
    },
    retailer_rates: {
        containerId: 'ggx-chart-retailer-rates',
        seriesOrder: ['Monthly Index', 'Forecast', 'ATCO 5 Year', 'ENCOR 5 Year', 'ENMAX 5 Year'],
        colors: ['#ff6b6b', '#3dd6f5', '#f7b84a', '#5dd62c', '#a88bff'],
        lineIndexes: [2, 3, 4],
    },
    aeco_ng_current: {
        containerId: 'ggx-chart-aeco-ng-current',
        seriesOrder: ['Daily Index', 'Monthly Index'],
        colors: ['#3dd6f5', '#ff6b6b'],
        lineIndexes: [1],
    },
    aeco_ng_prior: {
        containerId: 'ggx-chart-aeco-ng-prior',
        seriesOrder: ['Daily Index', 'Monthly Index'],
        colors: ['#3dd6f5', '#ff6b6b'],
        lineIndexes: [1],
    },
    aeco_c_futures: {
        containerId: 'ggx-chart-aeco-c-futures',
        seriesOrder: ['Current', 'One Year Ago', 'One Month Ago'],
        colors: ['#3dd6f5', '#f7b84a', '#ff6b6b'],
        lineIndexes: [1, 2],
    },
};

const DATA_REGION_CONFIGS = [
    {
        key: 'ca-ab',
        label: 'Canada · Alberta (AB)',
        shortLabel: 'CA-AB',
        articleKeywords: ['alberta', 'aeco', 'calgary', 'edmonton', 'henry hub gas'],
        chartKeywords: ['alberta', 'aeco', 'intra_alberta', 'retailer_rates'],
    },
    {
        key: 'ca-bc',
        label: 'Canada · British Columbia (BC)',
        shortLabel: 'CA-BC',
        articleKeywords: ['british columbia', 'vancouver', 'fort st. john', 'montney basin'],
        chartKeywords: ['british columbia', 'bc gas', 'bc utility'],
    },
    {
        key: 'us-tx',
        label: 'United States · Texas (TX)',
        shortLabel: 'US-TX',
        articleKeywords: ['texas', 'permian', 'midland', 'eagle ford'],
        chartKeywords: ['texas', 'permian'],
    },
    {
        key: 'us-la',
        label: 'United States · Louisiana (LA)',
        shortLabel: 'US-LA',
        articleKeywords: ['louisiana', 'haynesville', 'lake charles'],
        chartKeywords: ['louisiana', 'haynesville'],
    },
    {
        key: 'us-pa',
        label: 'United States · Pennsylvania (PA)',
        shortLabel: 'US-PA',
        articleKeywords: ['pennsylvania', 'marcellus', 'appalachia'],
        chartKeywords: ['pennsylvania', 'marcellus'],
    },
    {
        key: 'us-ok',
        label: 'United States · Oklahoma (OK)',
        shortLabel: 'US-OK',
        articleKeywords: ['oklahoma', 'scooop', 'stack play', 'ankha'],
        chartKeywords: ['oklahoma', 'scooop', 'stack'],
    },
];

const GASGX_UI_ICONS = {
    dashboard:
        '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M7 9.5h10M7 13h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    chartBars:
        '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19.5V12.5M12 19.5V8.5M19 19.5V5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M4 19.5h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    rates:
        '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 18.5h14M7.5 18.5v-5.5M12 18.5v-8.5M16.5 18.5v-3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M5.5 8.5l3-3 2.5 2.5 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    currentMonth:
        '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14" rx="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M4 9.5h16M9 3.8v3.4M15 3.8v3.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="14" r="2" fill="currentColor"/></svg>',
    priorMonth:
        '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14" rx="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M4 9.5h16M9 3.8v3.4M15 3.8v3.4M14.8 14h-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    futures:
        '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 18.5h15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M6 15.5l3.8-3.8 3 2.9 5.2-5.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 9.5h2.5V12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    table:
        '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 10h17M9 10v8.5M14.8 10v8.5" stroke="currentColor" stroke-width="1.4"/></svg>',
};

const CHANNEL_CONFIGS = {
    'gas-energy': {
        navTitle: 'GAS ENERGY',
        layout: 'gas-energy',
        pageTitle: 'Gas Energy Insights',
        pageSubtitle: 'Latest news, tech updates, and market analysis on natural gas power for crypto mining.',
        feedTitle: 'Energy Dispatch',
        icon: 'fa-fire-flame-curved',
        accent: '#00E676',
        accentSoft: 'rgba(0, 230, 118, 0.16)',
        accentGlow: 'rgba(0, 230, 118, 0.36)',
        chips: ['Pipeline', 'Flare Recovery', 'Merchant Power'],
    },
    generators: {
        navTitle: 'GENERATORS',
        layout: 'generators',
        pageTitle: 'Generators & Engines',
        pageSubtitle: 'Hardware reviews, technical analysis, and equipment news.',
        feedTitle: 'Fleet Logs',
        icon: 'fa-gears',
        accent: '#00E676',
        accentSoft: 'rgba(0, 230, 118, 0.16)',
        accentGlow: 'rgba(0, 230, 118, 0.36)',
        chips: ['Gas Turbines', 'Recip Engines', 'Maintenance'],
    },
    mining: {
        navTitle: 'MINING',
        layout: 'btc-mining',
        pageTitle: 'BTC Mining Operations',
        pageSubtitle: 'Economics, Hashrate Analysis, and Farm Management.',
        feedTitle: 'Mining Signals',
        icon: 'fa-bitcoin-sign',
        accent: '#f7931a',
        accentSoft: 'rgba(247, 147, 26, 0.16)',
        accentGlow: 'rgba(247, 147, 26, 0.34)',
        chips: ['Hashrate', 'ASIC Hardware', 'Treasury Moves'],
    },
    insights: {
        navTitle: 'INSIGHTS',
        layout: 'editorial',
        pageTitle: 'Strategic Insights Desk',
        pageSubtitle: 'Deeper reads across policy, finance and operating strategy for the energy-compute convergence.',
        feedTitle: 'Intelligence Briefs',
        icon: 'fa-chart-line',
        accent: '#8be34f',
        accentSoft: 'rgba(139, 227, 79, 0.15)',
        accentGlow: 'rgba(139, 227, 79, 0.3)',
        chips: ['Policy', 'Finance', 'Research'],
    },
    data: {
        navTitle: 'DATA',
        layout: 'data',
        pageTitle: 'Data Terminal',
        pageSubtitle: 'Live metrics and equipment baselines pulled from structured tables in the GasGx data stack.',
        feedTitle: 'Data Notes',
        icon: 'fa-database',
        accent: '#22d3ee',
        accentSoft: 'rgba(34, 211, 238, 0.16)',
        accentGlow: 'rgba(34, 211, 238, 0.34)',
    },
    events: {
        navTitle: 'EVENTS',
        layout: 'events',
        pageTitle: 'Events Radar',
        pageSubtitle: 'Conference and summit coverage synthesized from event-like records and source feeds.',
        feedTitle: 'Event Stream',
        icon: 'fa-calendar-days',
        accent: '#5dd62c',
        accentSoft: 'rgba(93, 214, 44, 0.15)',
        accentGlow: 'rgba(93, 214, 44, 0.32)',
    },
};

const CHANNEL_RULES = {
    'gas-energy': {
        types: ['gas-energy', 'gas energy', '天然气能源', 'geothermal energy'],
        tags: ['policy', 'esg', 'electricity'],
        keywords: ['gas', 'lng', 'pipeline', 'flare', 'mmbtu', 'natural gas', 'power'],
    },
    generators: {
        types: ['generators', '发电机组', 'hardware'],
        tags: ['hardware', 'tech', 'tech review'],
        keywords: ['generator', 'genset', 'engine', 'turbine', 'recip', 'wartsila', 'siemens', 'cummins', 'cat'],
    },
    mining: {
        types: ['bitcoin-mining', '比特币挖矿'],
        tags: ['hardware'],
        keywords: ['bitcoin', 'btc', 'hashrate', 'difficulty', 'asic', 'mining', 'mempool'],
    },
    insights: {
        types: ['insights', 'deep_dive', '深度', 'ai与算力', 'regulatory'],
        tags: ['policy', 'finance', 'data', 'deep dive', 'policy alert'],
        keywords: ['insight', 'analysis', 'report', 'regulation', 'outlook', 'alpha', 'macro'],
    },
    data: {
        types: ['data', 'finance'],
        tags: ['data', 'finance'],
        keywords: ['metrics', 'index', 'spread', 'difficulty', 'hashrate', 'dashboard', 'model', 'efficiency'],
    },
    events: {
        types: ['events'],
        tags: [],
        keywords: ['summit', 'expo', 'conference', 'event', 'meetup', 'webinar', 'forum'],
    },
};

function getChannelConfig(channelKey) {
    return CHANNEL_CONFIGS[channelKey] || CHANNEL_CONFIGS.mining;
}

let googleChartsReadyPromise = null;

function ensureScriptLoaded(src, id) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            if (existing.dataset.loaded === 'true') {
                resolve();
                return;
            }
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), { once: true });
            return;
        }

        const script = document.createElement('script');
        if (id) script.id = id;
        script.src = src;
        script.async = true;
        script.onload = () => {
            script.dataset.loaded = 'true';
            resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}

async function ensureGoogleChartsLoaded() {
    if (window.google?.visualization?.ComboChart) return;
    if (googleChartsReadyPromise) {
        await googleChartsReadyPromise;
        return;
    }

    googleChartsReadyPromise = (async () => {
        await ensureScriptLoaded(GOOGLE_CHARTS_LOADER, 'ggx-google-charts-loader');
        await new Promise((resolve, reject) => {
            if (!window.google?.charts) {
                reject(new Error('Google Charts runtime unavailable.'));
                return;
            }
            window.google.charts.load('current', { packages: ['corechart'] });
            window.google.charts.setOnLoadCallback(() => {
                if (window.google?.visualization?.ComboChart) resolve();
                else reject(new Error('Google Charts corechart package failed to initialize.'));
            });
        });
    })();

    await googleChartsReadyPromise;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderGasGxUiIcon(iconName) {
    return `<span class="ggx-ui-icon">${GASGX_UI_ICONS[iconName] || GASGX_UI_ICONS.dashboard}</span>`;
}

function toLower(value) {
    return String(value || '').trim().toLowerCase();
}

function containsAny(text, keywords = []) {
    const source = toLower(text);
    return keywords.some((keyword) => source.includes(toLower(keyword)));
}

function textMatchesRegion(text, keywords = []) {
    const source = toLower(text);
    return (keywords || []).some((keyword) => {
        const token = toLower(keyword);
        if (!token) return false;
        return source.includes(token);
    });
}

function isGasGxHost(url) {
    return /^https?:\/\/(www\.)?gasgx\.com/i.test(url || '');
}

function formatDate(value) {
    if (!value) return '--';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(value) {
    if (!value) return '--';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatUtcDateTime(value) {
    if (!value) return '--';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toISOString().replace('T', ' ').replace('.000Z', ' UTC');
}

function formatDateTimeByTimezone(value, timezone, locale = 'zh-CN') {
    if (!value) return '--';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(date);
}

function toIsoDateTime(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return new Date().toISOString();
    return date.toISOString();
}

function cleanSummary(value) {
    if (!value) return '';
    return String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function getArticleUrl(item) {
    if (!item || typeof item !== 'object') return '#';

    const articleId = item.app_id || item.api_id || item.id;
    if (articleId) return `https://www.gasgx.com/news/article/${articleId}`;

    const link = String(item.link || '').trim();
    return link || '#';
}

function getImageUrl(item) {
    if (!item || typeof item !== 'object') return DEFAULT_COVER;

    const articleId = item.app_id || item.api_id || item.id;
    const coverImage = String(item.cover_image || '').trim();
    if (!coverImage || !articleId) return DEFAULT_COVER;

    if (/^https?:\/\//i.test(coverImage)) return coverImage;
    const normalizedCover = coverImage.replace(/^\.?\/*(images\/)?/i, '');
    return `https://www.gasgx.com/news/article/${articleId}/images/${normalizedCover}`;
}

function hasRenderableCover(item) {
    if (!item || typeof item !== 'object') return false;
    const articleId = item.app_id || item.api_id || item.id;
    const coverImage = String(item.cover_image || '').trim();
    if (!coverImage) return false;
    if (/^https?:\/\//i.test(coverImage)) return true;
    return Boolean(articleId);
}

function normalizeArticleText(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

function normalizeCoverKey(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) {
        try {
            const parsed = new URL(raw);
            return `${parsed.hostname}${parsed.pathname}`.toLowerCase();
        } catch {
            return raw.toLowerCase();
        }
    }
    return raw.replace(/^\.?\/*(images\/)?/i, '').toLowerCase();
}

function getArticleDedupKey(item) {
    if (!item || typeof item !== 'object') return '';

    const title = normalizeArticleText(item.main_title);
    const cover = normalizeCoverKey(item.cover_image);
    const link = normalizeArticleText(item.link);
    const summary = normalizeArticleText(item.subheading);

    if (title && cover) return `tc:${title}|${cover}`;
    if (title && link) return `tl:${title}|${link}`;
    if (title && summary) return `ts:${title}|${summary.slice(0, 120)}`;
    if (title) return `t:${title}`;
    return String(item.app_id || item.api_id || item.id || '');
}

function dedupeArticles(items = []) {
    if (!Array.isArray(items)) return [];
    const seen = new Set();
    const rows = [];

    items.forEach((item) => {
        const key = getArticleDedupKey(item);
        if (key && seen.has(key)) return;
        if (key) seen.add(key);
        rows.push(item);
    });
    return rows;
}

function collectArticlesWithCover(primary = [], fallback = [], minCount = 0) {
    const result = [];
    const seen = new Set();

    const pushRows = (rows) => {
        rows.forEach((row) => {
            if (!hasRenderableCover(row)) return;
            const key = getArticleDedupKey(row) || String(row.app_id || row.api_id || row.id || `${row.main_title || ''}-${row.time || ''}`);
            if (seen.has(key)) return;
            seen.add(key);
            result.push(row);
        });
    };

    if (Array.isArray(primary)) pushRows(primary);
    if (result.length < minCount && Array.isArray(fallback)) pushRows(fallback);
    return result;
}

function estimateReadMinutes(article) {
    const text = `${article?.main_title || ''} ${cleanSummary(article?.subheading) || ''}`.replace(/\s+/g, '');
    const minutes = Math.ceil(text.length / 420);
    return Math.max(3, Math.min(12, minutes || 3));
}

function articleTag(article, fallback = 'News') {
    return article?.secondary_tag || article?.tag || article?.type || fallback;
}

function resolveTagTone(tag) {
    const value = toLower(tag);
    if (containsAny(value, ['market', 'spec', 'review', 'maintenance', 'price'])) return 'orange';
    if (containsAny(value, ['compliance', 'policy', 'permit', 'regulation', 'bc'])) return 'purple';
    return 'green';
}

function toneClasses(tone) {
    if (tone === 'orange') {
        return {
            badge: 'border-[#FF6D00]/60 bg-[#FF6D00]/16 text-[#FF9D58]',
            cardHover: 'hover:border-[#FF6D00]/70 hover:shadow-[0_0_18px_rgba(255,109,0,0.2)]',
        };
    }
    if (tone === 'purple') {
        return {
            badge: 'border-purple-300/45 bg-purple-500/12 text-purple-200',
            cardHover: 'hover:border-purple-300/65 hover:shadow-[0_0_18px_rgba(168,85,247,0.2)]',
        };
    }
    return {
        badge: 'border-[#00E676]/50 bg-[#00E676]/12 text-[#00E676]',
        cardHover: 'hover:border-[#00E676]/70 hover:shadow-[0_0_18px_rgba(0,230,118,0.2)]',
    };
}

function findMetricByKeywords(metrics = [], keywords = []) {
    if (!Array.isArray(metrics)) return null;
    return (
        metrics.find((item) => containsAny(item.label, keywords)) ||
        metrics.find((item) => containsAny(item.id, keywords)) ||
        null
    );
}

function getAuthorAvatarUrl(item) {
    const fallback = '/news/author_avatar/GasGx-Researcher.png';
    if (!item || typeof item !== 'object') return fallback;

    const articleId = item.app_id || item.api_id || item.id;
    const authorAvatar = String(item.author_avatar || '').trim();
    if (authorAvatar) {
        if (/^https?:\/\//i.test(authorAvatar)) return authorAvatar;
        const normalized = authorAvatar.replace(/^\.?\/*(images\/)?/i, '');
        if (articleId) return `https://www.gasgx.com/news/article/${articleId}/images/${normalized}`;
    }

    const publisher = toLower(item.publisher);
    if (publisher.includes('blockbeats')) return '/news/author_avatar/Blockbeats.png';
    if (publisher.includes('odaily')) return '/news/author_avatar/Odaily.png';
    if (publisher.includes('techflow')) return '/news/author_avatar/Techflow.png';
    if (publisher.includes('wushuo') || publisher.includes('wu shuo')) return '/news/author_avatar/WuShuoBlock.png';
    return fallback;
}

function buildLinkAttrs(url) {
    const href = url || '#';
    if (href === '#') return 'href="#"';
    if (isGasGxHost(href)) return `href="${escapeHtml(href)}"`;
    return `href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"`;
}

function countBy(items, keyFn) {
    const map = new Map();
    items.forEach((item) => {
        const key = keyFn(item);
        if (!key) return;
        map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

function matchArticleByRule(article, channelKey) {
    const rule = CHANNEL_RULES[channelKey];
    if (!rule) return true;

    const type = toLower(article.type);
    const tag = toLower(article.tag);
    const secondaryTag = toLower(article.secondary_tag);
    const topics = toLower(article.topics);
    const textBlock = [article.main_title, article.subheading, article.keywords, article.publisher].map((v) => String(v || '')).join(' ');

    let score = 0;
    if (containsAny(type, rule.types)) score += 3;
    if (containsAny(tag, rule.tags)) score += 1;
    if (containsAny(secondaryTag, rule.tags)) score += 1;
    if (containsAny(topics, rule.keywords)) score += 2;
    if (containsAny(textBlock, rule.keywords)) score += 2;

    const minScore = channelKey === 'events' ? 3 : 2;
    return score >= minScore;
}

function scoreArticleByRule(article, channelKey) {
    const rule = CHANNEL_RULES[channelKey];
    if (!rule) return 0;

    const type = toLower(article.type);
    const tag = toLower(article.tag);
    const secondaryTag = toLower(article.secondary_tag);
    const topics = toLower(article.topics);
    const textBlock = [article.main_title, article.subheading, article.keywords, article.publisher].map((v) => String(v || '')).join(' ');

    let score = 0;
    if (containsAny(type, rule.types)) score += 6;
    if (containsAny(tag, rule.tags)) score += 3;
    if (containsAny(secondaryTag, rule.tags)) score += 2;
    if (containsAny(topics, rule.keywords)) score += 3;
    if (containsAny(textBlock, rule.keywords)) score += 2;
    if (channelKey === 'events' && containsAny(textBlock, ['summit', 'expo', 'forum', 'conference', 'webinar'])) score += 2;
    return score;
}

function filterArticlesByChannel(articles, channelKey) {
    if (!Array.isArray(articles)) return [];

    const source = dedupeArticles(articles);
    const matched = source.filter((article) => matchArticleByRule(article, channelKey));
    const minMatched = channelKey === 'data' ? 6 : 10;
    if (matched.length >= minMatched) return matched;

    const scored = source
        .map((article) => ({
            article,
            score: scoreArticleByRule(article, channelKey),
            ts: new Date(article.time || 0).getTime() || 0,
        }))
        .sort((a, b) => (b.score !== a.score ? b.score - a.score : b.ts - a.ts));

    const positive = scored.filter((item) => item.score > 0).map((item) => item.article);
    if (positive.length >= 6) return positive.slice(0, 48);

    return source.slice(0, 48);
}

function renderEditorialTemplate(config) {
    const chips = (config.chips || [])
        .map((chip, index) => `<button class="ggx-chip${index === 0 ? ' active' : ''}">${escapeHtml(chip)}</button>`)
        .join('');

    return `
<section class="ggx-channel-shell">
    <main class="ggx-channel-main">
        <section class="ggx-channel-hero">
            <article id="ggx-hero-main" class="ggx-channel-card ggx-channel-hero-main">
                <div class="ggx-empty">Loading headline feed...</div>
            </article>
            <div id="ggx-hero-sidecards" class="ggx-channel-sidecards">
                <div class="ggx-channel-card ggx-mini-card"><h3>Market Metric</h3><div class="ggx-mini-value">--</div></div>
                <div class="ggx-channel-card ggx-mini-card"><h3>Equipment Pulse</h3><div class="ggx-mini-value">--</div></div>
            </div>
        </section>

        <div class="ggx-section-head">
            <h2><i class="fa-solid ${escapeHtml(config.icon)}"></i> ${escapeHtml(config.feedTitle)}</h2>
            <div class="ggx-chip-row">${chips}</div>
        </div>

        <section class="ggx-channel-layout">
            <div>
                <div id="ggx-feed-stack" class="ggx-feed-stack">
                    <div class="ggx-empty">Loading channel stories...</div>
                </div>
                <div class="ggx-load-more-wrap">
                    <button id="ggx-load-more-btn" class="ggx-load-more-btn" onclick="window.GGXChannelApp && window.GGXChannelApp.loadMore()">Load More</button>
                </div>
            </div>
            <aside id="ggx-aside-stack" class="ggx-aside-stack"></aside>
        </section>
    </main>
    <button id="ggx-to-top" class="ggx-to-top" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })" aria-label="Back to top">
        <i class="fa-solid fa-arrow-up"></i>
    </button>
</section>`;
}

function renderGasEnergyTemplate(config) {
    return `
<main id="gas-energy-news" class="mx-auto w-full max-w-[1700px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
    <!-- Channel Header / Breadcrumb -->
    <section class="mb-6 rounded-2xl border border-white/10 bg-[#121212]/80 p-5 sm:p-6 lg:p-7">
        <p class="text-xs uppercase tracking-[0.22em] text-gray-400">
            <a href="/news/" class="transition-colors hover:text-[#00E676]">Home</a>
            <span class="px-2 text-gray-500">&gt;</span>
            <span class="text-gray-300">Gas Energy</span>
        </p>
        <h1 class="mt-3 text-3xl font-bold text-white sm:text-4xl" style="font-family: 'Oswald', sans-serif;">
            ${escapeHtml(config.pageTitle)}
        </h1>
        <p class="mt-3 max-w-3xl text-sm leading-relaxed text-gray-300 sm:text-base">
            ${escapeHtml(config.pageSubtitle)}
        </p>
    </section>

    <!-- Featured Hero Article -->
    <article class="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-gray-900/90 transition duration-300 hover:border-[#00E676]/70 hover:shadow-[0_0_24px_rgba(0,230,118,0.2)]">
        <div class="grid gap-0 lg:grid-cols-12">
            <figure id="ggx-gas-featured-media" class="relative min-h-[220px] bg-gradient-to-br from-gray-800 to-[#1b1f2a] sm:min-h-[300px] lg:col-span-7 lg:min-h-[420px]">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,230,118,0.18),transparent_48%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.16),transparent_46%)]"></div>
                <div class="absolute inset-0 flex items-center justify-center text-sm uppercase tracking-widest text-gray-400">
                    Loading featured cover...
                </div>
            </figure>
            <div id="ggx-gas-featured-content" class="flex flex-col justify-between p-5 sm:p-6 lg:col-span-5 lg:p-8">
                <div class="ggx-empty">Loading featured article...</div>
            </div>
        </div>
    </article>

    <!-- Latest Articles Grid -->
    <section aria-label="Latest gas energy articles">
        <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold text-white sm:text-2xl">Latest Articles</h2>
            <span class="rounded-full border border-orange-300/40 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-200">
                Mining + Gas Power
            </span>
        </div>

        <div id="ggx-gas-article-grid" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div class="ggx-empty col-span-full">Loading gas energy articles...</div>
        </div>
    </section>

    <!-- Pagination / Load More -->
    <div class="ggx-load-more-wrap">
        <button id="ggx-load-more-btn" class="ggx-load-more-btn" onclick="window.GGXChannelApp && window.GGXChannelApp.loadMore()">Load More Articles</button>
    </div>
</main>`;
}

function renderGeneratorsTemplate(config) {
    return `
<main id="generators-news" class="mx-auto w-full max-w-[1700px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
    <!-- Channel Header & Filter Tabs -->
    <section class="mb-6 rounded-2xl border border-gray-700/90 bg-[#121212]/88 p-5 sm:p-6 lg:p-7">
        <h1 class="text-3xl font-bold text-white sm:text-4xl" style="font-family: 'Oswald', sans-serif;">
            ${escapeHtml(config.pageTitle)}
        </h1>
        <p class="mt-3 max-w-3xl text-sm leading-relaxed text-gray-300 sm:text-base">
            ${escapeHtml(config.pageSubtitle)}
        </p>

        <div class="mt-5 -mx-1 overflow-x-auto pb-1">
            <div class="flex min-w-max gap-2 px-1">
                <button type="button" class="rounded-full border border-[#00E676]/60 bg-[#00E676]/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#00E676]">
                    All
                </button>
                <button type="button" class="rounded-full border border-gray-600/90 bg-gray-800/70 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-300 transition hover:border-[#00E676]/60 hover:text-[#00E676]">
                    Hardware Reviews
                </button>
                <button type="button" class="rounded-full border border-gray-600/90 bg-gray-800/70 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-300 transition hover:border-[#00E676]/60 hover:text-[#00E676]">
                    VMAN &amp; Brands
                </button>
                <button type="button" class="rounded-full border border-gray-600/90 bg-gray-800/70 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-300 transition hover:border-[#00E676]/60 hover:text-[#00E676]">
                    Maintenance
                </button>
                <button type="button" class="rounded-full border border-gray-600/90 bg-gray-800/70 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-300 transition hover:border-[#00E676]/60 hover:text-[#00E676]">
                    Tech Specs
                </button>
            </div>
        </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-12">
        <div class="space-y-6 lg:col-span-9">
            <!-- Hardware Spotlight -->
            <article class="overflow-hidden rounded-2xl border border-gray-700/80 bg-gray-900/88 transition duration-300 hover:border-[#FF6D00]/75 hover:shadow-[0_0_24px_rgba(255,109,0,0.2)]">
                <div class="grid gap-0 lg:grid-cols-12">
                    <figure id="ggx-generators-featured-media" class="relative aspect-video bg-gradient-to-br from-gray-800 to-[#1b1f29] lg:col-span-7">
                        <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,230,118,0.2),transparent_45%),radial-gradient(circle_at_80%_65%,rgba(255,109,0,0.2),transparent_42%)]"></div>
                        <div class="absolute inset-0 flex items-center justify-center text-sm uppercase tracking-widest text-gray-400">
                            Loading featured hardware cover...
                        </div>
                    </figure>
                    <div id="ggx-generators-featured-content" class="flex flex-col justify-between p-5 sm:p-6 lg:col-span-5 lg:p-8">
                        <div class="ggx-empty">Loading hardware spotlight...</div>
                    </div>
                </div>
            </article>

            <!-- Equipment News Feed -->
            <section aria-label="Equipment news feed">
                <h2 class="text-xl font-semibold text-white sm:text-2xl">Equipment News Feed</h2>
                <div id="ggx-generators-article-grid" class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div class="ggx-empty col-span-full">Loading equipment articles...</div>
                </div>
            </section>

            <!-- Pagination / Load More -->
            <div class="ggx-load-more-wrap">
                <button id="ggx-load-more-btn" class="ggx-load-more-btn" onclick="window.GGXChannelApp && window.GGXChannelApp.loadMore()">Load More Articles</button>
            </div>
        </div>

        <!-- Trending Tech Specs Sidebar (Desktop) -->
        <aside class="hidden lg:block lg:col-span-3">
            <div class="sticky top-24 rounded-2xl border border-gray-700/90 bg-gray-900/92 p-5">
                <h3 class="text-lg font-semibold text-white">Top Rated Engines</h3>
                <ul id="ggx-generators-top-engines" class="mt-4 space-y-3">
                    <li class="ggx-empty">Loading top rated engines...</li>
                </ul>
            </div>
        </aside>
    </section>
</main>`;
}

function renderBtcMiningTemplate(config) {
    return `
<main id="btc-mining-news" class="mx-auto w-full max-w-[1700px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
    <!-- Channel Header + Live Mining Metrics Ticker -->
    <section class="mb-6 rounded-2xl border border-gray-700/90 bg-[#121212]/88 p-5 sm:p-6 lg:p-7">
        <h1 class="text-3xl font-bold text-white sm:text-4xl" style="font-family: 'Oswald', sans-serif;">
            ${escapeHtml(config.pageTitle)}
        </h1>
        <p class="mt-3 max-w-3xl text-sm leading-relaxed text-gray-300 sm:text-base">
            ${escapeHtml(config.pageSubtitle)}
        </p>

        <div class="mt-5 overflow-hidden rounded-xl border border-gray-700/90 bg-[#1A1A1A]/95 py-2">
            <div class="flex min-w-max items-center animate-marquee">
                <div class="flex items-center gap-8 whitespace-nowrap px-4 text-xs uppercase tracking-wider text-gray-300">
                    <span id="ggx-btc-ticker-price">BTC Price: --</span>
                    <span id="ggx-btc-ticker-hashrate">Global Hashrate: --</span>
                    <span id="ggx-btc-ticker-difficulty">Network Difficulty: --</span>
                    <span id="ggx-btc-ticker-adjustment">Next Adjustment: --</span>
                </div>
                <div class="flex items-center gap-8 whitespace-nowrap px-4 text-xs uppercase tracking-wider text-gray-300" aria-hidden="true">
                    <span id="ggx-btc-ticker-price-dup">BTC Price: --</span>
                    <span id="ggx-btc-ticker-hashrate-dup">Global Hashrate: --</span>
                    <span id="ggx-btc-ticker-difficulty-dup">Network Difficulty: --</span>
                    <span id="ggx-btc-ticker-adjustment-dup">Next Adjustment: --</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Featured Operations Hero + Aside Snapshot -->
    <section class="mb-6 grid gap-4 lg:grid-cols-12">
        <article class="overflow-hidden rounded-2xl border border-gray-700/90 bg-[#1A1A1A]/95 transition duration-300 hover:border-[#F7931A]/70 hover:shadow-[0_0_22px_rgba(247,147,26,0.2)] lg:col-span-8">
            <figure id="ggx-btc-featured-media" class="relative aspect-video bg-gradient-to-br from-gray-800 to-[#1e2430]">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(0,230,118,0.2),transparent_45%),radial-gradient(circle_at_82%_70%,rgba(247,147,26,0.22),transparent_44%)]"></div>
                <div class="absolute inset-0 flex items-center justify-center text-sm uppercase tracking-widest text-gray-400">
                    Loading featured mining cover...
                </div>
            </figure>
            <div id="ggx-btc-featured-content" class="p-5 sm:p-6">
                <div class="ggx-empty">Loading featured mining article...</div>
            </div>
        </article>

        <aside class="rounded-2xl border border-gray-700/90 bg-[#1A1A1A]/95 p-5 lg:col-span-4">
            <h3 class="text-lg font-semibold text-white">Operations Snapshot</h3>
            <ul class="mt-4 space-y-3">
                <li class="rounded-lg border border-gray-700/80 bg-gray-800/70 p-3">
                    <p class="text-xs uppercase tracking-wider text-gray-400">Fleet Uptime</p>
                    <p class="mt-1 text-base font-semibold text-[#00E676]">98.4% across 14 sites</p>
                </li>
                <li class="rounded-lg border border-gray-700/80 bg-gray-800/70 p-3">
                    <p class="text-xs uppercase tracking-wider text-gray-400">Power Cost Band</p>
                    <p class="mt-1 text-base font-semibold text-[#F7931A]">$0.039 - $0.052 / kWh</p>
                </li>
                <li class="rounded-lg border border-gray-700/80 bg-gray-800/70 p-3">
                    <p class="text-xs uppercase tracking-wider text-gray-400">Regional Compliance</p>
                    <p class="mt-1 text-base font-semibold text-purple-300">2 pending permit updates in BC</p>
                </li>
            </ul>
        </aside>
    </section>

    <!-- Mining News & Analysis Feed -->
    <section aria-label="Mining news and analysis feed">
        <h2 class="text-xl font-semibold text-white sm:text-2xl">Mining News &amp; Analysis</h2>
        <div id="ggx-btc-article-grid" class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div class="ggx-empty col-span-full">Loading mining articles...</div>
        </div>
    </section>

    <div class="ggx-load-more-wrap mt-5">
        <button id="ggx-load-more-btn" class="ggx-load-more-btn" onclick="window.GGXChannelApp && window.GGXChannelApp.loadMore()">Load More Articles</button>
    </div>

    <!-- Newsletter / Alert Signup -->
    <section class="mt-8 rounded-2xl border border-gray-700/90 bg-gray-800/70 p-6 sm:p-8">
        <h2 class="text-2xl font-semibold text-white sm:text-3xl" style="font-family: 'Oswald', sans-serif;">
            Get the Weekly Mining Difficulty &amp; Gas Price Digest
        </h2>
        <p class="mt-2 text-sm text-gray-300 sm:text-base">
            Receive curated updates on hashrate trends, gas market shifts, and operational benchmarks for mining operators.
        </p>
        <form class="mt-5 flex flex-col gap-3 sm:flex-row" action="#" method="post">
            <label for="ggx-btc-newsletter-email" class="sr-only">Email address</label>
            <input
                id="ggx-btc-newsletter-email"
                type="email"
                name="email"
                required
                placeholder="you@company.com"
                class="w-full rounded-xl border border-gray-600 bg-[#121212] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#00E676] focus:outline-none"
            />
            <button type="submit" class="rounded-xl bg-[#00E676] px-6 py-3 text-sm font-semibold text-[#03200f] transition duration-300 hover:brightness-105 hover:shadow-[0_0_20px_rgba(0,230,118,0.3)]">
                Subscribe
            </button>
        </form>
    </section>
</main>`;
}

function renderDataTemplate(config) {
    return `
<section class="ggx-channel-shell">
    <main class="ggx-channel-main">
        <section class="ggx-channel-card ggx-mini-card" id="ggx-data-headline">
            <h3>${escapeHtml(config.pageTitle)}</h3>
            <p class="ggx-mini-caption">GasGx Canada dashboard one-page terminal with charts and parsed static tables.</p>
        </section>

        <section class="ggx-channel-card p-4 mt-4">
            <div class="ggx-section-head">
                <h2><i class="fa-solid fa-globe"></i> Regional Data Views</h2>
                <span class="ggx-chip active">Scope Selector</span>
            </div>
            <div id="ggx-data-region-tabs" class="ggx-chip-row"></div>
            <p id="ggx-data-region-subtitle" class="ggx-mini-caption mt-3">Loading regional coverage...</p>
        </section>

        <section class="ggx-channel-card p-4 mt-4">
            <div class="ggx-section-head">
                <h2>${renderGasGxUiIcon('dashboard')}<span>Canada Gas Dashboard</span></h2>
                <span class="ggx-chip active">Integrated View</span>
            </div>
            <p class="ggx-mini-caption">Sourced from canada_scrape_runs, canada_chart_points and canada_chart_tables only.</p>

            <div class="ggx-canada-run-grid mt-3">
                <article class="ggx-canada-run-card">
                    <div class="ggx-canada-run-label">Latest Successful Run</div>
                    <div id="ggx-canada-run-local" class="ggx-canada-run-value">--</div>
                    <div id="ggx-canada-run-utc" class="ggx-canada-run-meta">--</div>
                    <div id="ggx-canada-run-id" class="ggx-canada-run-meta">run_id: --</div>
                </article>
                <article id="ggx-canada-status" class="ggx-canada-status-box">
                    <span class="text-yellow-300 font-semibold">LOADING</span> Fetching Canada dashboard data...
                </article>
            </div>
        </section>

        <section class="ggx-canada-chart-grid mt-4">
            <article class="ggx-channel-card p-4">
                <div class="ggx-section-head">
                    <h2>${renderGasGxUiIcon('chartBars')}<span>Gas Alberta vs Regulated</span></h2>
                </div>
                <div id="ggx-chart-gas-alberta-vs-regulated" class="ggx-canada-chart"></div>
            </article>
            <article class="ggx-channel-card p-4">
                <div class="ggx-section-head">
                    <h2>${renderGasGxUiIcon('rates')}<span>Retailer Rates</span></h2>
                </div>
                <div id="ggx-chart-retailer-rates" class="ggx-canada-chart"></div>
            </article>
            <article class="ggx-channel-card p-4">
                <div class="ggx-section-head">
                    <h2>${renderGasGxUiIcon('currentMonth')}<span>AECO Current Month</span></h2>
                </div>
                <div id="ggx-chart-aeco-ng-current" class="ggx-canada-chart"></div>
            </article>
            <article class="ggx-channel-card p-4">
                <div class="ggx-section-head">
                    <h2>${renderGasGxUiIcon('priorMonth')}<span>AECO Prior Month</span></h2>
                </div>
                <div id="ggx-chart-aeco-ng-prior" class="ggx-canada-chart"></div>
            </article>
        </section>

        <section class="mt-4">
            <article class="ggx-channel-card p-4">
                <div class="ggx-section-head">
                    <h2>${renderGasGxUiIcon('futures')}<span>AECO C Futures Pricing</span></h2>
                </div>
                <div id="ggx-chart-aeco-c-futures" class="ggx-canada-chart"></div>
            </article>
        </section>

        <section class="mt-4">
            <article class="ggx-channel-card p-4">
                <div class="ggx-section-head">
                    <h2>${renderGasGxUiIcon('table')}<span>Canada Static Tables (Parsed)</span></h2>
                </div>
                <div id="ggx-canada-static-tables" class="ggx-canada-static-grid"></div>
            </article>
        </section>

        <section class="mt-4">
            <article class="ggx-channel-card p-4">
                <div class="ggx-section-head">
                    <h2><i class="fa-solid fa-signal"></i> Homepage Metrics</h2>
                </div>
                <div id="ggx-metric-grid" class="ggx-metric-grid"></div>
            </article>
        </section>

        <section class="mt-4">
            <article class="ggx-channel-card p-4">
                <div class="ggx-section-head">
                    <h2><i class="fa-solid fa-gears"></i> Equipment Baseline</h2>
                </div>
                <div id="ggx-equipment-table" class="ggx-table-wrap"></div>
            </article>
        </section>

        <section class="mt-4">
            <div class="ggx-section-head">
                <h2><i class="fa-solid fa-book-open"></i> Data Notes</h2>
            </div>
            <div id="ggx-data-notes" class="ggx-events-grid">
                <div class="ggx-empty">Loading data notes...</div>
            </div>
        </section>
    </main>
    <button id="ggx-to-top" class="ggx-to-top" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })" aria-label="Back to top">
        <i class="fa-solid fa-arrow-up"></i>
    </button>
</section>`;
}

function renderEventsTemplate(config) {
    return `
<section class="ggx-channel-shell">
    <main class="ggx-channel-main">
        <section id="ggx-events-hero" class="ggx-channel-card ggx-mini-card">
            <h3>${escapeHtml(config.pageTitle)}</h3>
            <p class="ggx-mini-caption">${escapeHtml(config.pageSubtitle)}</p>
            <div id="ggx-events-hero-meta" class="ggx-mini-caption"></div>
        </section>

        <div class="ggx-section-head mt-4">
            <h2><i class="fa-solid ${escapeHtml(config.icon)}"></i> ${escapeHtml(config.feedTitle)}</h2>
            <div class="ggx-chip-row">
                <span class="ggx-chip active">Articles</span>
                <span class="ggx-chip">Saved Sources</span>
                <span class="ggx-chip">Chronological</span>
            </div>
        </div>

        <section>
            <div id="ggx-events-grid" class="ggx-events-grid">
                <div class="ggx-empty">Loading event stream...</div>
            </div>
            <div class="ggx-load-more-wrap">
                <button id="ggx-load-more-btn" class="ggx-load-more-btn" onclick="window.GGXChannelApp && window.GGXChannelApp.loadMore()">Load More Events</button>
            </div>
        </section>
    </main>
    <button id="ggx-to-top" class="ggx-to-top" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })" aria-label="Back to top">
        <i class="fa-solid fa-arrow-up"></i>
    </button>
</section>`;
}

export function mountChannelMain(container, channelKey) {
    if (!container) return;
    const config = getChannelConfig(channelKey);

    if (config.layout === 'gas-energy') {
        container.innerHTML = renderGasEnergyTemplate(config);
    } else if (config.layout === 'generators') {
        container.innerHTML = renderGeneratorsTemplate(config);
    } else if (config.layout === 'btc-mining') {
        container.innerHTML = renderBtcMiningTemplate(config);
    } else if (config.layout === 'data') {
        container.innerHTML = renderDataTemplate(config);
    } else if (config.layout === 'events') {
        container.innerHTML = renderEventsTemplate(config);
    } else {
        container.innerHTML = renderEditorialTemplate(config);
    }
}

export function createChannelApp(channelKey) {
    const config = getChannelConfig(channelKey);
    const { createClient } = supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    return {
        state: {
            currentUser: null,
            displayName: null,
            homepageMetrics: [],
            equipmentData: [],
            allArticles: [],
            filteredArticles: [],
            savedNews: [],
            eventsRows: [],
            canadaRun: null,
            canadaPointRows: [],
            canadaTableRows: [],
            dataRegionViews: [],
            activeDataRegion: 'ca-ab',
            canadaStatus: {
                type: 'loading',
                message: 'Fetching Canada dashboard data...',
            },
            canadaResizeBound: false,
            visibleCount: config.layout === 'editorial' ? 7 : 6,
            pageSize: 6,
            scrollBound: false,
            activeTag: '',
        },

        async init() {
            this.applyTheme();
            await this.initAuth();
            this.renderNav();
            if (config.layout !== 'data') this.loadLiveData();
            else this.hideLiveDataStrip();

            let loadTasks = [];
            if (config.layout === 'data') {
                loadTasks = [this.loadCanadaDashboardData(), this.loadArticles(), this.loadHomepageMetrics(), this.loadEquipmentData()];
            } else {
                loadTasks = [this.loadArticles(), this.loadHomepageMetrics(), this.loadEquipmentData(), this.loadSavedNews()];
            }
            await Promise.allSettled(loadTasks);
            if (config.layout === 'data') this.buildDataRegionViews();

            if (config.layout === 'data') this.renderDataLayout();
            else if (config.layout === 'events') this.renderEventsLayout();
            else if (config.layout === 'gas-energy') this.renderGasEnergyLayout();
            else if (config.layout === 'generators') this.renderGeneratorsLayout();
            else if (config.layout === 'btc-mining') this.renderBtcMiningLayout();
            else this.renderEditorialLayout();

            this.bindScroll();
        },

        applyTheme() {
            document.body.classList.add('ggx-channel-page');
            document.body.style.setProperty('--ggx-accent', config.accent);
            document.body.style.setProperty('--ggx-accent-soft', config.accentSoft);
            document.body.style.setProperty('--ggx-accent-glow', config.accentGlow);
        },

        async initAuth() {
            try {
                const {
                    data: { session },
                } = await _supabase.auth.getSession();

                if (session) {
                    this.state.currentUser = session.user;
                    const meta = session.user.user_metadata || {};
                    this.state.displayName = meta.full_name || (session.user.email ? session.user.email.split('@')[0] : null);
                    this.fetchProfile(session.user.id);
                }

                _supabase.auth.onAuthStateChange((_event, sessionValue) => {
                    this.state.currentUser = sessionValue ? sessionValue.user : null;
                    if (sessionValue) {
                        const meta = sessionValue.user.user_metadata || {};
                        this.state.displayName = meta.full_name || (sessionValue.user.email ? sessionValue.user.email.split('@')[0] : null);
                        this.fetchProfile(sessionValue.user.id);
                    } else {
                        this.state.displayName = null;
                    }
                    this.renderNav();
                });
            } catch (error) {
                console.error('Channel auth init failed:', error);
            }
        },

        async fetchProfile(userId) {
            try {
                const { data: profile } = await _supabase.from('profiles').select('full_name').eq('id', userId).single();
                if (profile && profile.full_name) {
                    this.state.displayName = profile.full_name;
                    this.renderNav();
                }
            } catch {
                // Silent fallback to metadata.
            }
        },

        renderNav() {
            renderSharedAuthState({
                page: 'news-home',
                idPrefix: 'ggx',
                navigation: HEADER_NAVIGATION,
                currentUser: this.state.currentUser,
                displayName: this.state.displayName,
                accountUrl: '/news/flash/account.html',
                signInUrl: '/news/flash/user.html',
                activeTitle: config.navTitle,
                activePath: window.location.pathname,
            });
        },

        hideLiveDataStrip() {
            const liveData = document.getElementById('ggx-live-data-container');
            if (!liveData) return;

            const stripRow = liveData.parentElement?.parentElement;
            const stripShell = stripRow?.parentElement;

            if (stripRow) stripRow.remove();
            if (stripShell) {
                stripShell.classList.remove('border-b', 'border-white/5', 'shadow-sm');
            }
        },

        toggleMobileMenu() {
            const menu = document.getElementById('ggx-mobile-menu-container');
            const overlay = document.getElementById('ggx-mobile-menu-overlay');
            if (!menu || !overlay) return;

            const hidden = menu.classList.contains('translate-x-full');
            if (hidden) {
                menu.classList.remove('translate-x-full');
                overlay.classList.remove('hidden');
            } else {
                menu.classList.add('translate-x-full');
                overlay.classList.add('hidden');
            }
        },

        bindScroll() {
            if (this.state.scrollBound) return;
            this.state.scrollBound = true;

            window.addEventListener('scroll', () => {
                const btn = document.getElementById('ggx-to-top');
                if (!btn) return;
                if (window.scrollY > 260) btn.classList.add('visible');
                else btn.classList.remove('visible');
            });
        },

        async loadLiveData() {
            const container = document.getElementById('ggx-live-data-container');
            if (!container) return;

            try {
                const { data } = await _supabase.from('homepage_scrolling_data').select('*').order('sort_order', { ascending: true });
                if (!data || data.length === 0) return;

                const html = data
                    .map((item) => {
                        const color = item.status === 'positive' ? 'text-green-400' : item.status === 'negative' ? 'text-red-500' : 'text-gray-500';
                        const label = escapeHtml(item.label || '--');
                        const value = escapeHtml(item.display_value || '--');
                        const unit = item.unit ? `<span class="text-gray-600 text-[10px]">${escapeHtml(item.unit)}</span>` : '';
                        const extra = item.secondary_text ? `<span class="${color} text-[10px]">${escapeHtml(item.secondary_text)}</span>` : '';

                        return `<div class="flex items-center gap-2 text-xs font-mono text-gray-400 whitespace-nowrap"><span class="text-purple-400 font-bold">${label}</span><span class="text-white font-bold">${value}</span>${unit}${extra}</div>`;
                    })
                    .join('');

                container.innerHTML = `<div class="flex items-center gap-12">${html}</div>`.repeat(2);
            } catch (error) {
                console.error('Channel ticker load failed:', error);
            }
        },

        async loadArticles() {
            try {
                const maxRows = config.layout === 'events' ? 999 : 799;
                const { data } = await _supabase.from('articles').select('*').order('time', { ascending: false }).range(0, maxRows);
                this.state.allArticles = Array.isArray(data) ? data : [];
                this.state.filteredArticles = filterArticlesByChannel(this.state.allArticles, channelKey);
            } catch (error) {
                console.error('Channel article load failed:', error);
                this.state.allArticles = [];
                this.state.filteredArticles = [];
            }
        },

        async loadHomepageMetrics() {
            try {
                const { data } = await _supabase
                    .from('homepage_scrolling_data')
                    .select('*')
                    .order('sort_order', { ascending: true });

                this.state.homepageMetrics = Array.isArray(data)
                    ? data.map((item) => {
                          const status = String(item.status || '').toLowerCase();
                          const trend = status === 'positive' ? 'up' : status === 'negative' ? 'down' : 'flat';
                          return {
                              ...item,
                              value: item.display_value ?? item.value ?? '--',
                              change_24h: item.secondary_text ?? item.change_24h ?? '--',
                              trend,
                          };
                      })
                    : [];
            } catch {
                this.state.homepageMetrics = [];
            }
        },

        async loadEquipmentData() {
            try {
                const { data } = await _supabase
                    .from('equipment_data')
                    .select('*')
                    .order('power_output_kw', { ascending: false })
                    .limit(24);
                this.state.equipmentData = Array.isArray(data) ? data : [];
            } catch {
                this.state.equipmentData = [];
            }
        },

        async loadSavedNews() {
            try {
                const { data } = await _supabase
                    .from('saved_news')
                    .select('id,title,url,source,created_at,user_id')
                    .order('created_at', { ascending: false })
                    .limit(24);
                this.state.savedNews = Array.isArray(data) ? data : [];
            } catch {
                this.state.savedNews = [];
            }
        },

        async loadCanadaDashboardData() {
            this.state.canadaStatus = {
                type: 'loading',
                message: 'Fetching latest successful run from Supabase...',
            };

            try {
                const run = await this.loadCanadaLatestRun();
                this.state.canadaRun = run;

                const rows = await this.loadCanadaRows(run.run_hour_utc);
                this.state.canadaPointRows = rows.pointRows;
                this.state.canadaTableRows = rows.tableRows;

                if (!this.state.canadaPointRows.length) {
                    this.state.canadaStatus = {
                        type: 'error',
                        message: `No point data found for run_hour ${run.run_hour_utc}.`,
                    };
                    return;
                }

                this.state.canadaStatus = {
                    type: 'ok',
                    message: `Loaded ${this.state.canadaPointRows.length} point rows and ${this.state.canadaTableRows.length} static tables.`,
                };
            } catch (error) {
                console.error('Canada dashboard load failed:', error);
                this.state.canadaRun = null;
                this.state.canadaPointRows = [];
                this.state.canadaTableRows = [];
                this.state.canadaStatus = {
                    type: 'error',
                    message: error?.message || 'Failed to load Canada dashboard data.',
                };
            }
        },

        async loadCanadaLatestRun() {
            const { data, error } = await _supabase
                .from('canada_scrape_runs')
                .select('run_id,run_at_utc,run_hour_utc,status,chart_success_count,point_count')
                .eq('status', 'success')
                .order('run_hour_utc', { ascending: false })
                .limit(1);

            if (error) throw error;
            if (!Array.isArray(data) || !data.length) {
                throw new Error('No successful Canada scrape run found.');
            }
            return data[0];
        },

        async loadCanadaRows(runHourUtc) {
            const [pointsRes, tablesRes] = await Promise.all([
                _supabase
                    .from('canada_chart_points')
                    .select('chart_id,chart_title,row_index,x_label,x_date,series_name,series_value,currency,unit')
                    .eq('run_hour_utc', runHourUtc)
                    .order('row_index', { ascending: true }),
                _supabase
                    .from('canada_chart_tables')
                    .select('chart_id,chart_title,headers,table_rows,row_count,source_asset_url')
                    .eq('run_hour_utc', runHourUtc),
            ]);

            if (pointsRes.error) throw pointsRes.error;
            if (tablesRes.error) throw tablesRes.error;

            return {
                pointRows: Array.isArray(pointsRes.data) ? pointsRes.data : [],
                tableRows: Array.isArray(tablesRes.data) ? tablesRes.data : [],
            };
        },

        getActiveDataRegionView() {
            if (!Array.isArray(this.state.dataRegionViews) || this.state.dataRegionViews.length === 0) return null;
            return this.state.dataRegionViews.find((region) => region.key === this.state.activeDataRegion) || this.state.dataRegionViews[0];
        },

        buildDataRegionViews() {
            const articleRows = dedupeArticles(Array.isArray(this.state.allArticles) ? this.state.allArticles : []);
            const metricRows = Array.isArray(this.state.homepageMetrics) ? this.state.homepageMetrics : [];
            const equipmentRows = Array.isArray(this.state.equipmentData) ? this.state.equipmentData : [];
            const pointRows = Array.isArray(this.state.canadaPointRows) ? this.state.canadaPointRows : [];
            const tableRows = Array.isArray(this.state.canadaTableRows) ? this.state.canadaTableRows : [];

            this.state.dataRegionViews = DATA_REGION_CONFIGS.map((region) => {
                const chartRows = pointRows.filter((row) => textMatchesRegion(`${row?.chart_id || ''} ${row?.chart_title || ''}`, region.chartKeywords));
                const staticRows = tableRows.filter((row) => textMatchesRegion(`${row?.chart_id || ''} ${row?.chart_title || ''}`, region.chartKeywords));

                const notes = articleRows.filter((article) => {
                    const text = [article.main_title, article.subheading, article.topics, article.publisher, article.tag, article.type].join(' ');
                    return textMatchesRegion(text, region.articleKeywords);
                });

                const metrics = metricRows.filter((metric) => {
                    const text = [metric.id, metric.label, metric.secondary_text, metric.change_24h].join(' ');
                    return textMatchesRegion(text, region.articleKeywords);
                });

                const equipment = equipmentRows.filter((row) => {
                    const text = [row.manufacturer, row.model, row.fuel_type, row.notes].join(' ');
                    return textMatchesRegion(text, region.articleKeywords);
                });

                const resolvedPointRows = region.key === 'ca-ab' ? (chartRows.length ? chartRows : pointRows) : chartRows;
                const resolvedTableRows = region.key === 'ca-ab' ? (staticRows.length ? staticRows : tableRows) : staticRows;

                return {
                    ...region,
                    pointRows: resolvedPointRows,
                    tableRows: resolvedTableRows,
                    notes,
                    metrics,
                    equipment,
                };
            });

            if (!this.state.dataRegionViews.some((region) => region.key === this.state.activeDataRegion)) {
                this.state.activeDataRegion = this.state.dataRegionViews[0]?.key || 'ca-ab';
            }
        },

        switchDataRegion(regionKey) {
            if (config.layout !== 'data') return;
            if (!regionKey || this.state.activeDataRegion === regionKey) return;
            if (!this.state.dataRegionViews.some((region) => region.key === regionKey)) return;

            this.state.activeDataRegion = regionKey;
            this.renderDataLayout();
        },

        renderDataRegionTabs() {
            const tabs = document.getElementById('ggx-data-region-tabs');
            const subtitle = document.getElementById('ggx-data-region-subtitle');
            if (!tabs || !subtitle) return;

            const regions = Array.isArray(this.state.dataRegionViews) ? this.state.dataRegionViews : [];
            if (!regions.length) {
                tabs.innerHTML = '<span class="ggx-chip">No region configs</span>';
                subtitle.textContent = 'No regional mapping available.';
                return;
            }

            tabs.innerHTML = regions
                .map((region) => {
                    const isActive = region.key === this.state.activeDataRegion;
                    const activeClass = isActive ? ' ggx-data-region-tab-active' : '';
                    const pointCount = Array.isArray(region.pointRows) ? region.pointRows.length : 0;
                    return `<button type="button" class="ggx-chip ggx-data-region-tab${activeClass}" onclick="window.GGXChannelApp && window.GGXChannelApp.switchDataRegion('${escapeHtml(region.key)}')">${escapeHtml(region.shortLabel)} <span class="text-[10px] opacity-80">(${pointCount})</span></button>`;
                })
                .join('');

            const active = this.getActiveDataRegionView();
            if (!active) {
                subtitle.textContent = 'No active regional view.';
                return;
            }

            const pointCount = Array.isArray(active.pointRows) ? active.pointRows.length : 0;
            const tableCount = Array.isArray(active.tableRows) ? active.tableRows.length : 0;
            const noteCount = Array.isArray(active.notes) ? active.notes.length : 0;
            subtitle.textContent = `${active.label}: structured points ${pointCount}, tables ${tableCount}, matched notes ${noteCount}.`;
        },

        loadMore() {
            this.state.visibleCount += this.state.pageSize;
            if (config.layout === 'events') this.renderEventsCards();
            else if (config.layout === 'editorial') this.renderEditorialFeed();
            else if (config.layout === 'gas-energy') this.renderGasEnergyLayout();
            else if (config.layout === 'generators') this.renderGeneratorsLayout();
            else if (config.layout === 'btc-mining') this.renderBtcMiningLayout();
        },

        toggleLoadMoreButton(visibleRows, totalRows) {
            const btn = document.getElementById('ggx-load-more-btn');
            if (!btn) return;
            if (visibleRows >= totalRows) btn.style.display = 'none';
            else btn.style.display = 'inline-flex';
        },

        renderEditorialLayout() {
            this.renderEditorialHero();
            this.renderEditorialFeed();
            this.renderEditorialAside();
        },

        renderGasEnergyLayout() {
            const featuredMedia = document.getElementById('ggx-gas-featured-media');
            const featuredContent = document.getElementById('ggx-gas-featured-content');
            const grid = document.getElementById('ggx-gas-article-grid');
            if (!featuredMedia || !featuredContent || !grid) return;

            const rows = collectArticlesWithCover(this.state.filteredArticles, this.state.allArticles, 8);
            if (!rows.length) {
                featuredContent.innerHTML = '<div class="ggx-empty">No featured article with cover image.</div>';
                grid.innerHTML = '<div class="ggx-empty col-span-full">No article cards with cover image.</div>';
                this.toggleLoadMoreButton(0, 0);
                return;
            }

            const featured = rows[0];
            const featuredUrl = getArticleUrl(featured);
            const featuredTag = articleTag(featured, 'Featured');
            const featuredSummary = cleanSummary(featured.subheading) || config.pageSubtitle;
            const featuredDateValue = featured.time || new Date();

            featuredMedia.innerHTML = `
                <img src="${escapeHtml(getImageUrl(featured))}" alt="${escapeHtml(featured.main_title || '')}" class="absolute inset-0 h-full w-full object-cover opacity-85" loading="lazy" onerror="this.remove()">
                <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
            `;

            featuredContent.innerHTML = `
                <div>
                    <span class="inline-flex items-center rounded-full border border-[#00E676]/50 bg-[#00E676]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#00E676]">
                        ${escapeHtml(featuredTag)}
                    </span>
                    <h2 class="mt-4 text-2xl font-semibold leading-tight text-white sm:text-3xl">
                        <a ${buildLinkAttrs(featuredUrl)} class="transition-colors hover:text-[#7DFFBA]">${escapeHtml(featured.main_title || 'Untitled')}</a>
                    </h2>
                    <p class="mt-4 text-sm leading-relaxed text-gray-300 sm:text-base">${escapeHtml(featuredSummary)}</p>
                </div>
                <footer class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-wider text-gray-400">
                    <span>By ${escapeHtml(featured.publisher || 'GasGx Editorial Desk')}</span>
                    <time datetime="${escapeHtml(toIsoDateTime(featuredDateValue))}">${escapeHtml(formatDate(featuredDateValue))}</time>
                </footer>
            `;

            const sourceRows = rows.slice(1);
            const feedRows = sourceRows.slice(0, this.state.visibleCount);
            if (!feedRows.length) {
                grid.innerHTML = '<div class="ggx-empty col-span-full">No additional article cards with cover image.</div>';
                this.toggleLoadMoreButton(0, 0);
                return;
            }

            grid.innerHTML = feedRows
                .map((article) => {
                    const tag = articleTag(article, 'News');
                    const tone = toneClasses(resolveTagTone(tag));
                    const url = getArticleUrl(article);
                    const summary = cleanSummary(article.subheading) || 'No summary available.';

                    return `
                        <article class="group overflow-hidden rounded-xl border border-white/10 bg-gray-800/60 transition duration-300 hover:-translate-y-1 ${tone.cardHover}">
                            <a ${buildLinkAttrs(url)} class="relative block aspect-video bg-gradient-to-br from-gray-700 to-[#1e2431]">
                                <img src="${escapeHtml(getImageUrl(article))}" alt="${escapeHtml(article.main_title || '')}" class="h-full w-full object-cover opacity-85 transition duration-300 group-hover:opacity-100" loading="lazy" onerror="this.remove()">
                            </a>
                            <div class="p-4">
                                <span class="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${tone.badge}">${escapeHtml(tag)}</span>
                                <h2 class="mt-3 text-lg font-semibold leading-snug text-white">${escapeHtml(article.main_title || 'Untitled')}</h2>
                                <p class="mt-2 text-sm leading-relaxed text-gray-300" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(summary)}</p>
                            </div>
                            <footer class="flex items-center justify-between border-t border-white/10 px-4 py-3 text-xs text-gray-400">
                                <time datetime="${escapeHtml(toIsoDateTime(article.time))}">${escapeHtml(formatDate(article.time))}</time>
                                <a ${buildLinkAttrs(url)} class="font-semibold text-[#00E676] transition-colors hover:text-[#7DFFBA]">Read article -&gt;</a>
                            </footer>
                        </article>
                    `;
                })
                .join('');

            this.toggleLoadMoreButton(feedRows.length, sourceRows.length);
        },

        renderGeneratorsLayout() {
            const featuredMedia = document.getElementById('ggx-generators-featured-media');
            const featuredContent = document.getElementById('ggx-generators-featured-content');
            const grid = document.getElementById('ggx-generators-article-grid');
            const topEngines = document.getElementById('ggx-generators-top-engines');
            if (!featuredMedia || !featuredContent || !grid || !topEngines) return;

            const rows = collectArticlesWithCover(this.state.filteredArticles, this.state.allArticles, 8);
            if (!rows.length) {
                featuredContent.innerHTML = '<div class="ggx-empty">No hardware spotlight with cover image.</div>';
                grid.innerHTML = '<div class="ggx-empty col-span-full">No equipment cards with cover image.</div>';
                this.toggleLoadMoreButton(0, 0);
            } else {
                const featured = rows[0];
                const featuredUrl = getArticleUrl(featured);
                const featuredSummary = cleanSummary(featured.subheading) || 'No summary available.';
                const featuredDateValue = featured.time || new Date();

                featuredMedia.innerHTML = `
                    <img src="${escapeHtml(getImageUrl(featured))}" alt="${escapeHtml(featured.main_title || '')}" class="absolute inset-0 h-full w-full object-cover opacity-85" loading="lazy" onerror="this.remove()">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent"></div>
                `;

                featuredContent.innerHTML = `
                    <div>
                        <span class="inline-flex rounded-full border border-[#FF6D00]/60 bg-[#FF6D00]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#FF9D58]">
                            In-Depth Review
                        </span>
                        <h2 class="mt-4 text-2xl font-semibold leading-tight text-white sm:text-3xl">
                            <a ${buildLinkAttrs(featuredUrl)} class="transition-colors hover:text-[#FFB575]">${escapeHtml(featured.main_title || 'Untitled')}</a>
                        </h2>
                        <p class="mt-4 text-sm leading-relaxed text-gray-300 sm:text-base">${escapeHtml(featuredSummary)}</p>
                    </div>
                    <footer class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-wider text-gray-400">
                        <span>By ${escapeHtml(featured.publisher || 'GasGx Hardware Lab')}</span>
                        <time datetime="${escapeHtml(toIsoDateTime(featuredDateValue))}">${escapeHtml(formatDate(featuredDateValue))}</time>
                    </footer>
                `;

                const sourceRows = rows.slice(1);
                const feedRows = sourceRows.slice(0, this.state.visibleCount);
                if (!feedRows.length) {
                    grid.innerHTML = '<div class="ggx-empty col-span-full">No equipment cards with cover image.</div>';
                    this.toggleLoadMoreButton(0, 0);
                } else {
                    grid.innerHTML = feedRows
                        .map((article) => {
                            const tag = articleTag(article, 'News');
                            const toneName = resolveTagTone(tag);
                            const tone = toneClasses(toneName);
                            const toneHover =
                                toneName === 'orange'
                                    ? 'hover:border-l-[#FF6D00] hover:border-[#FF6D00]/45'
                                    : toneName === 'purple'
                                      ? 'hover:border-l-purple-300 hover:border-purple-300/45'
                                      : 'hover:border-l-[#00E676] hover:border-[#00E676]/45';
                            const url = getArticleUrl(article);
                            const summary = cleanSummary(article.subheading) || 'No summary available.';

                            return `
                                <article class="group overflow-hidden rounded-xl border border-gray-700/90 border-l-2 border-l-transparent bg-gray-800/70 transition duration-300 hover:-translate-y-1 ${toneHover}">
                                    <a ${buildLinkAttrs(url)} class="relative block aspect-video bg-gradient-to-br from-gray-700 to-[#1f2430]">
                                        <img src="${escapeHtml(getImageUrl(article))}" alt="${escapeHtml(article.main_title || '')}" class="h-full w-full object-cover opacity-85 transition duration-300 group-hover:opacity-100" loading="lazy" onerror="this.remove()">
                                    </a>
                                    <div class="p-4">
                                        <span class="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${tone.badge}">${escapeHtml(tag)}</span>
                                        <h2 class="mt-3 text-lg font-semibold leading-snug text-white">${escapeHtml(article.main_title || 'Untitled')}</h2>
                                        <p class="mt-2 text-sm leading-relaxed text-gray-300" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(summary)}</p>
                                    </div>
                                    <footer class="flex items-center justify-between border-t border-gray-700/85 px-4 py-3 text-xs text-gray-400">
                                        <span>${escapeHtml(String(estimateReadMinutes(article)))} min read</span>
                                        <a ${buildLinkAttrs(url)} class="font-semibold text-[#00E676] transition-colors hover:text-[#7DFFBA]">Read More -&gt;</a>
                                    </footer>
                                </article>
                            `;
                        })
                        .join('');

                    this.toggleLoadMoreButton(feedRows.length, sourceRows.length);
                }
            }

            const ranked = Array.isArray(this.state.equipmentData) ? this.state.equipmentData.slice(0, 4) : [];
            if (!ranked.length) {
                topEngines.innerHTML = '<li class="ggx-empty">No equipment records available.</li>';
                return;
            }

            topEngines.innerHTML = ranked
                .map((item) => {
                    const model = item.model || 'Unknown Model';
                    const maker = item.manufacturer || 'Unknown Manufacturer';
                    const efficiency = item.efficiency ?? '--';
                    const output = item.power_output_kw ?? '--';
                    return `
                        <li class="rounded-lg border border-gray-700/90 bg-gray-800/70 p-3">
                            <span class="text-sm font-semibold text-white">${escapeHtml(model)}</span>
                            <p class="mt-1 text-xs text-gray-400">${escapeHtml(maker)} | Thermal Efficiency: ${escapeHtml(String(efficiency))}% | Output: ${escapeHtml(String(output))} kW</p>
                        </li>
                    `;
                })
                .join('');
        },

        renderBtcMiningLayout() {
            const setTicker = (id, label, metric, valueClass = 'text-[#F7931A]') => {
                const node = document.getElementById(id);
                if (!node) return;
                const value = metric ? `${metric.value || '--'}${metric.unit ? ` ${metric.unit}` : ''}` : '--';
                const trendClass = metric?.trend === 'up' ? 'text-[#00E676]' : metric?.trend === 'down' ? 'text-red-400' : 'text-gray-400';
                const change = metric?.change_24h ? `<span class="${trendClass}">${escapeHtml(metric.change_24h)}</span>` : '';
                node.innerHTML = `${escapeHtml(label)}: <strong class="${valueClass}">${escapeHtml(value)}</strong>${change ? ` ${change}` : ''}`;
            };

            const metrics = this.state.homepageMetrics || [];
            const btcMetric = findMetricByKeywords(metrics, ['btc', 'bitcoin']);
            const hashrateMetric = findMetricByKeywords(metrics, ['hashrate']);
            const difficultyMetric = findMetricByKeywords(metrics, ['difficulty']);
            const adjustmentMetric = findMetricByKeywords(metrics, ['adjustment', 'next adjustment', 'block time']);

            setTicker('ggx-btc-ticker-price', 'BTC Price', btcMetric, 'text-[#F7931A]');
            setTicker('ggx-btc-ticker-hashrate', 'Global Hashrate', hashrateMetric, 'text-[#F7931A]');
            setTicker('ggx-btc-ticker-difficulty', 'Network Difficulty', difficultyMetric, 'text-[#F7931A]');
            setTicker('ggx-btc-ticker-adjustment', 'Next Adjustment', adjustmentMetric, 'text-[#00E676]');
            setTicker('ggx-btc-ticker-price-dup', 'BTC Price', btcMetric, 'text-[#F7931A]');
            setTicker('ggx-btc-ticker-hashrate-dup', 'Global Hashrate', hashrateMetric, 'text-[#F7931A]');
            setTicker('ggx-btc-ticker-difficulty-dup', 'Network Difficulty', difficultyMetric, 'text-[#F7931A]');
            setTicker('ggx-btc-ticker-adjustment-dup', 'Next Adjustment', adjustmentMetric, 'text-[#00E676]');

            const featuredMedia = document.getElementById('ggx-btc-featured-media');
            const featuredContent = document.getElementById('ggx-btc-featured-content');
            const grid = document.getElementById('ggx-btc-article-grid');
            if (!featuredMedia || !featuredContent || !grid) return;

            const rows = collectArticlesWithCover(this.state.filteredArticles, this.state.allArticles, 8);
            if (!rows.length) {
                featuredContent.innerHTML = '<div class="ggx-empty">No featured mining article with cover image.</div>';
                grid.innerHTML = '<div class="ggx-empty col-span-full">No mining cards with cover image.</div>';
                this.toggleLoadMoreButton(0, 0);
                return;
            }

            const featured = rows[0];
            const featuredUrl = getArticleUrl(featured);
            const featuredSummary = cleanSummary(featured.subheading) || config.pageSubtitle;
            const featuredDateValue = featured.time || new Date();

            featuredMedia.innerHTML = `
                <img src="${escapeHtml(getImageUrl(featured))}" alt="${escapeHtml(featured.main_title || '')}" class="absolute inset-0 h-full w-full object-cover opacity-85" loading="lazy" onerror="this.remove()">
                <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
            `;

            featuredContent.innerHTML = `
                <span class="inline-flex rounded-full border border-[#F7931A]/65 bg-[#F7931A]/18 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#FFC37D]">
                    Featured
                </span>
                <h2 class="mt-4 text-2xl font-semibold leading-tight text-white sm:text-3xl">
                    <a ${buildLinkAttrs(featuredUrl)} class="transition-colors hover:text-[#FFC37D]">${escapeHtml(featured.main_title || 'Untitled')}</a>
                </h2>
                <p class="mt-3 text-sm leading-relaxed text-gray-300 sm:text-base">${escapeHtml(featuredSummary)}</p>
                <footer class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-wider text-gray-400">
                    <span>${escapeHtml(String(estimateReadMinutes(featured)))} min read</span>
                    <span>By ${escapeHtml(featured.publisher || 'GasGx Mining Desk')}</span>
                    <time datetime="${escapeHtml(toIsoDateTime(featuredDateValue))}">${escapeHtml(formatDate(featuredDateValue))}</time>
                </footer>
            `;

            const sourceRows = rows.slice(1);
            const feedRows = sourceRows.slice(0, this.state.visibleCount);
            if (!feedRows.length) {
                grid.innerHTML = '<div class="ggx-empty col-span-full">No mining cards with cover image.</div>';
                this.toggleLoadMoreButton(0, 0);
                return;
            }

            grid.innerHTML = feedRows
                .map((article) => {
                    const tag = articleTag(article, 'Farm Ops');
                    const tone = toneClasses(resolveTagTone(tag));
                    const url = getArticleUrl(article);
                    const summary = cleanSummary(article.subheading) || 'No summary available.';

                    return `
                        <article class="group overflow-hidden rounded-xl border border-gray-700/90 bg-[#1A1A1A]/95 transition duration-300 hover:-translate-y-1 ${tone.cardHover}">
                            <a ${buildLinkAttrs(url)} class="relative block aspect-video bg-gradient-to-br from-gray-700 to-[#1f2430]">
                                <img src="${escapeHtml(getImageUrl(article))}" alt="${escapeHtml(article.main_title || '')}" class="h-full w-full object-cover opacity-85 transition duration-300 group-hover:opacity-100" loading="lazy" onerror="this.remove()">
                            </a>
                            <div class="p-4">
                                <span class="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${tone.badge}">${escapeHtml(tag)}</span>
                                <h2 class="mt-3 text-lg font-semibold leading-snug text-white">${escapeHtml(article.main_title || 'Untitled')}</h2>
                                <p class="mt-2 text-sm leading-relaxed text-gray-300" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(summary)}</p>
                            </div>
                            <footer class="flex items-center justify-between border-t border-gray-700/85 px-4 py-3 text-xs text-gray-400">
                                <span>${escapeHtml(article.publisher || 'GasGx Desk')} · <time datetime="${escapeHtml(toIsoDateTime(article.time))}">${escapeHtml(formatDate(article.time))}</time></span>
                                <a ${buildLinkAttrs(url)} class="font-semibold text-[#00E676] transition-colors hover:text-[#7DFFBA]">Read Article</a>
                            </footer>
                        </article>
                    `;
                })
                .join('');

            this.toggleLoadMoreButton(feedRows.length, sourceRows.length);
        },

        renderEditorialHero() {
            const heroContainer = document.getElementById('ggx-hero-main');
            const sidecards = document.getElementById('ggx-hero-sidecards');
            if (!heroContainer || !sidecards) return;

            const hero = this.state.filteredArticles[0] || this.state.allArticles[0];
            if (!hero) {
                heroContainer.innerHTML = '<div class="ggx-empty">No headline data available.</div>';
                return;
            }

            const tagText = hero.secondary_tag || hero.tag || 'Signal';
            const articleUrl = getArticleUrl(hero);
            const summary = cleanSummary(hero.subheading) || config.pageSubtitle;

            heroContainer.innerHTML = `
                <img src="${escapeHtml(getImageUrl(hero))}" alt="${escapeHtml(hero.main_title || '')}" class="ggx-channel-hero-image" loading="lazy" onerror="this.src='${DEFAULT_COVER}'">
                <div class="ggx-channel-hero-overlay"></div>
                <div class="ggx-channel-hero-content">
                    <span class="ggx-channel-badge"><i class="fa-solid ${escapeHtml(config.icon)}"></i> ${escapeHtml(tagText)}</span>
                    <h1 class="ggx-channel-title">
                        <a ${buildLinkAttrs(articleUrl)} class="text-white hover:opacity-90">${escapeHtml(hero.main_title || 'Untitled')}</a>
                    </h1>
                    <p class="ggx-channel-sub ggx-line-clamp-3">${escapeHtml(summary)}</p>
                    <div class="ggx-channel-hero-meta">
                        <span>${escapeHtml(formatDate(hero.time))}</span>
                        <span>By ${escapeHtml(hero.publisher || 'GasGx Desk')}</span>
                    </div>
                </div>
            `;

            const spark =
                this.state.homepageMetrics.find((item) => String(item.id || '').toLowerCase() === 'spark_spread') ||
                this.state.homepageMetrics.find((item) => String(item.label || '').toLowerCase().includes('spark')) ||
                this.state.homepageMetrics[0];
            const equipmentTop = this.state.equipmentData[0];

            sidecards.innerHTML = `
                <article class="ggx-channel-card ggx-mini-card">
                    <h3>${escapeHtml(spark ? spark.label : 'Homepage Pulse')}</h3>
                    <div class="ggx-mini-value">${escapeHtml(spark ? spark.value : '--')} <span class="text-sm text-gray-500">${escapeHtml(spark?.unit || '')}</span></div>
                    <p class="ggx-mini-caption">${escapeHtml(spark?.change_24h || 'No metric change available.')}</p>
                </article>
                <article class="ggx-channel-card ggx-mini-card">
                    <h3>Top Equipment</h3>
                    <div class="ggx-mini-value">${escapeHtml(equipmentTop ? equipmentTop.model : '--')}</div>
                    <p class="ggx-mini-caption">
                        ${escapeHtml(equipmentTop ? `${equipmentTop.manufacturer} · ${equipmentTop.power_output_kw} kW · ${equipmentTop.efficiency}% efficiency` : 'Equipment baseline table is empty.')}
                    </p>
                </article>
            `;
        },

        renderEditorialFeed() {
            const container = document.getElementById('ggx-feed-stack');
            const btn = document.getElementById('ggx-load-more-btn');
            if (!container || !btn) return;

            const source = this.state.filteredArticles.length > 1 ? this.state.filteredArticles.slice(1) : this.state.filteredArticles;
            if (source.length === 0) {
                container.innerHTML = '<div class="ggx-empty">No stories matched this channel yet.</div>';
                btn.style.display = 'none';
                return;
            }

            const rows = source.slice(0, this.state.visibleCount);
            container.innerHTML = rows
                .map((art) => {
                    const url = getArticleUrl(art);
                    const summary = cleanSummary(art.subheading) || 'No summary provided.';
                    const tag = art.secondary_tag || art.tag || 'Update';
                    return `
                        <article class="ggx-channel-card ggx-feed-card">
                            <a ${buildLinkAttrs(url)} class="ggx-feed-cover">
                                <img src="${escapeHtml(getImageUrl(art))}" alt="${escapeHtml(art.main_title || '')}" loading="lazy" onerror="this.src='${DEFAULT_COVER}'">
                            </a>
                            <div class="ggx-feed-body">
                                <div class="ggx-feed-meta">
                                    <span class="ggx-feed-kicker">${escapeHtml(tag)}</span>
                                    <span>${escapeHtml(formatDate(art.time))}</span>
                                </div>
                                <h3 class="ggx-feed-title ggx-line-clamp-2"><a ${buildLinkAttrs(url)} class="text-white hover:opacity-90">${escapeHtml(art.main_title || 'Untitled')}</a></h3>
                                <p class="ggx-feed-summary ggx-line-clamp-3">${escapeHtml(summary)}</p>
                                <div class="ggx-feed-footer">
                                    <div class="ggx-feed-author">
                                        <img src="${escapeHtml(getAuthorAvatarUrl(art))}" alt="${escapeHtml(art.publisher || 'GasGx Desk')}" loading="lazy" onerror="this.src='/news/author_avatar/GasGx-Researcher.png'">
                                        <span>${escapeHtml(art.publisher || 'GasGx Desk')}</span>
                                    </div>
                                    <a ${buildLinkAttrs(url)} class="text-gray-300 hover:text-white text-[10px] uppercase tracking-wide font-bold">Read</a>
                                </div>
                            </div>
                        </article>
                    `;
                })
                .join('');

            if (rows.length >= source.length) btn.style.display = 'none';
            else btn.style.display = 'inline-flex';
        },

        renderEditorialAside() {
            const container = document.getElementById('ggx-aside-stack');
            if (!container) return;

            const signalItems = (this.state.filteredArticles.length ? this.state.filteredArticles : this.state.allArticles).slice(0, 8);
            const topTags = countBy(signalItems, (item) => toLower(item.tag) || null).slice(0, 4);

            const tagsHtml = topTags.length
                ? topTags
                      .map(([tag, count]) => `<li class="ggx-signal-item"><a href="#">${escapeHtml(tag.toUpperCase())} · ${escapeHtml(String(count))} hits</a></li>`)
                      .join('')
                : '<li class="ggx-signal-item"><a href="#">No tag distribution available.</a></li>';

            const streamHtml = signalItems.length
                ? signalItems
                      .map((item) => {
                          const url = getArticleUrl(item);
                          return `<li class="ggx-signal-item"><a ${buildLinkAttrs(url)}>${escapeHtml(item.main_title || 'Untitled')}</a><span class="ggx-signal-time">${escapeHtml(formatDateTime(item.time))}</span></li>`;
                      })
                      .join('')
                : '<li class="ggx-signal-item"><a href="#">No stream records yet.</a></li>';

            const metrics = this.state.homepageMetrics.slice(0, 4);
            const metricsHtml = metrics.length
                ? metrics
                      .map(
                          (item) => `
                    <li class="ggx-signal-item">
                        <a href="#">${escapeHtml(item.label || '--')}</a>
                        <span class="ggx-signal-time">${escapeHtml(item.value || '--')} ${escapeHtml(item.unit || '')} · ${escapeHtml(item.change_24h || '--')}</span>
                    </li>`
                      )
                      .join('')
                : '<li class="ggx-signal-item"><a href="#">No homepage metrics available.</a></li>';

            container.innerHTML = `
                <section class="ggx-channel-card p-4">
                    <div class="ggx-section-head">
                        <h2><i class="fa-solid fa-tower-broadcast"></i> Live Stream</h2>
                    </div>
                    <ul class="ggx-signal-list">${streamHtml}</ul>
                </section>

                <section class="ggx-channel-card p-4">
                    <div class="ggx-section-head">
                        <h2><i class="fa-solid fa-bars-progress"></i> Tag Density</h2>
                    </div>
                    <ul class="ggx-signal-list">${tagsHtml}</ul>
                </section>

                <section class="ggx-channel-card p-4">
                    <div class="ggx-section-head">
                            <h2><i class="fa-solid fa-chart-simple"></i> Metric Tape</h2>
                    </div>
                    <ul class="ggx-signal-list">${metricsHtml}</ul>
                </section>
            `;
        },

        renderDataLayout() {
            if (!Array.isArray(this.state.dataRegionViews) || this.state.dataRegionViews.length === 0) {
                this.buildDataRegionViews();
            }
            this.renderDataRegionTabs();
            this.renderDataMetrics();
            this.renderEquipmentTable();
            this.renderDataNotes();
            this.renderCanadaDashboard().catch((error) => {
                console.error('Canada dashboard render failed:', error);
                this.setCanadaStatus('error', 'Failed to render Canada dashboard charts.');
            });
        },

        renderDataMetrics() {
            const container = document.getElementById('ggx-metric-grid');
            if (!container) return;

            const activeRegion = this.getActiveDataRegionView();
            const metrics =
                activeRegion && Array.isArray(activeRegion.metrics) && activeRegion.metrics.length
                    ? activeRegion.metrics.slice(0, 8)
                    : this.state.homepageMetrics.slice(0, 8);
            if (metrics.length === 0) {
                container.innerHTML = '<div class="ggx-empty">No homepage metrics in table.</div>';
                return;
            }

            container.innerHTML = metrics
                .map((item) => {
                    const trendIcon = item.trend === 'up' ? 'fa-caret-up' : item.trend === 'down' ? 'fa-caret-down' : 'fa-minus';
                    return `
                        <article class="ggx-metric-card">
                            <div class="ggx-metric-name">${escapeHtml(item.label || '--')}</div>
                            <div class="ggx-metric-value">${escapeHtml(item.value || '--')} <span class="text-xs text-gray-500">${escapeHtml(item.unit || '')}</span></div>
                            <div class="ggx-metric-trend"><i class="fa-solid ${trendIcon}"></i> ${escapeHtml(item.change_24h || '--')}</div>
                        </article>
                    `;
                })
                .join('');
        },

        renderFuelMix() {
            const container = document.getElementById('ggx-fuel-mix');
            if (!container) return;

            if (!this.state.equipmentData.length) {
                container.innerHTML = '<li class="ggx-signal-item"><a href="#">No equipment rows available.</a></li>';
                return;
            }

            const grouped = countBy(this.state.equipmentData, (item) => toLower(item.fuel_type) || 'unknown').slice(0, 8);
            container.innerHTML = grouped
                .map(([fuel, count]) => {
                    const share = ((count / this.state.equipmentData.length) * 100).toFixed(1);
                    return `<li class="ggx-signal-item"><a href="#">${escapeHtml(fuel.toUpperCase())}</a><span class="ggx-signal-time">${escapeHtml(String(count))} units · ${share}% share</span></li>`;
                })
                .join('');
        },

        renderEquipmentTable() {
            const container = document.getElementById('ggx-equipment-table');
            if (!container) return;

            const activeRegion = this.getActiveDataRegionView();
            const regionRows =
                activeRegion && Array.isArray(activeRegion.equipment) && activeRegion.equipment.length
                    ? activeRegion.equipment
                    : this.state.equipmentData;
            const rows = regionRows.slice(0, 12);
            if (rows.length === 0) {
                container.innerHTML = '<div class="ggx-empty">No equipment_data records.</div>';
                return;
            }

            const body = rows
                .map(
                    (row) => `
                    <tr>
                        <td>${escapeHtml(row.manufacturer || '--')}</td>
                        <td>${escapeHtml(row.model || '--')}</td>
                        <td>${escapeHtml(String(row.power_output_kw ?? '--'))}</td>
                        <td>${escapeHtml(String(row.efficiency ?? '--'))}%</td>
                        <td>${escapeHtml(row.fuel_type || '--')}</td>
                        <td>$${escapeHtml(String(row.capital_cost ?? '--'))}</td>
                    </tr>
                `
                )
                .join('');

            container.innerHTML = `
                <table class="ggx-data-table">
                    <thead>
                        <tr>
                            <th>Manufacturer</th>
                            <th>Model</th>
                            <th>Power kW</th>
                            <th>Efficiency</th>
                            <th>Fuel</th>
                            <th>Capex</th>
                        </tr>
                    </thead>
                    <tbody>${body}</tbody>
                </table>
            `;
        },

        renderDataNotes() {
            const container = document.getElementById('ggx-data-notes');
            if (!container) return;

            const activeRegion = this.getActiveDataRegionView();
            const notes =
                activeRegion && Array.isArray(activeRegion.notes)
                    ? activeRegion.notes
                    : this.state.filteredArticles.length
                      ? this.state.filteredArticles
                      : this.state.allArticles;
            const rows = notes.slice(0, 8);
            if (!rows.length) {
                container.innerHTML = `<div class="ggx-empty">No data notes matched ${escapeHtml(activeRegion?.label || 'this region')}.</div>`;
                return;
            }

            container.innerHTML = rows
                .map((row) => {
                    const url = getArticleUrl(row);
                    return `
                        <article class="ggx-channel-card ggx-event-card">
                            <div class="ggx-event-date"><i class="fa-solid fa-circle-nodes"></i>${escapeHtml(formatDate(row.time))}</div>
                            <h3 class="ggx-event-title"><a ${buildLinkAttrs(url)} class="text-white hover:opacity-90">${escapeHtml(row.main_title || 'Untitled')}</a></h3>
                            <p class="ggx-event-summary ggx-line-clamp-3">${escapeHtml(cleanSummary(row.subheading) || 'No summary available.')}</p>
                            <div class="ggx-event-actions">
                                <span class="text-xs text-gray-500">${escapeHtml(row.tag || row.secondary_tag || 'Data')}</span>
                                <a ${buildLinkAttrs(url)} class="ggx-event-link">Open</a>
                            </div>
                        </article>
                    `;
                })
                .join('');
        },

        setCanadaStatus(type, message) {
            const container = document.getElementById('ggx-canada-status');
            if (!container) return;

            const normalizedType = String(type || 'loading').toLowerCase();
            const color =
                normalizedType === 'error'
                    ? 'text-red-400'
                    : normalizedType === 'ok'
                      ? 'text-gas-green'
                      : 'text-yellow-300';
            container.innerHTML = `<span class="${color} font-semibold">${escapeHtml(normalizedType.toUpperCase())}</span> ${escapeHtml(message || '--')}`;
        },

        renderCanadaRunSummary(regionView = null) {
            const runLocal = document.getElementById('ggx-canada-run-local');
            const runUtc = document.getElementById('ggx-canada-run-utc');
            const runId = document.getElementById('ggx-canada-run-id');
            if (!runLocal || !runUtc || !runId) return;

            const run = this.state.canadaRun;
            if (!run) {
                runLocal.textContent = '--';
                runUtc.textContent = '--';
                runId.textContent = 'run_id: --';
                return;
            }

            runLocal.textContent = `${formatDateTimeByTimezone(run.run_at_utc, CANADA_LOCAL_TIMEZONE)} (${CANADA_LOCAL_TIMEZONE})`;
            runUtc.textContent = formatUtcDateTime(run.run_at_utc);
            runId.textContent = `${regionView?.shortLabel || 'GLOBAL'} · run_id: ${run.run_id || '--'}`;
        },

        toCanadaChartMatrix(rows, seriesOrder) {
            const grouped = new Map();
            rows.forEach((row) => {
                const xLabel = String(row?.x_label || '').trim();
                if (!xLabel) return;

                if (!grouped.has(xLabel)) {
                    grouped.set(xLabel, {
                        x_label: xLabel,
                        x_date: row?.x_date || '',
                        row_index: Number(row?.row_index) || 0,
                        values: {},
                    });
                }

                grouped.get(xLabel).values[row.series_name] = Number(row.series_value);
            });

            return Array.from(grouped.values())
                .sort((a, b) => {
                    if (a.x_date && b.x_date) return String(a.x_date).localeCompare(String(b.x_date));
                    if (a.row_index !== b.row_index) return a.row_index - b.row_index;
                    return a.x_label.localeCompare(b.x_label);
                })
                .map((item) => [item.x_label, ...seriesOrder.map((name) => item.values[name] ?? null)]);
        },

        drawCanadaComboChart(spec, rows) {
            const container = document.getElementById(spec.containerId);
            if (!container) return;

            if (!Array.isArray(rows) || rows.length === 0) {
                container.innerHTML = '<div class="ggx-empty">No chart data.</div>';
                return;
            }

            const table = new window.google.visualization.DataTable();
            table.addColumn('string', 'Date');
            spec.seriesOrder.forEach((seriesName) => table.addColumn('number', seriesName));
            table.addRows(this.toCanadaChartMatrix(rows, spec.seriesOrder));

            const formatter = new window.google.visualization.NumberFormat({ prefix: '$' });
            for (let index = 1; index <= spec.seriesOrder.length; index += 1) {
                formatter.format(table, index);
            }

            const seriesConfig = {};
            spec.lineIndexes.forEach((index) => {
                seriesConfig[index] = {
                    type: 'line',
                    lineWidth: 2.3,
                    pointSize: 4.2,
                    pointShape: 'circle',
                    visibleInLegend: true,
                };
            });

            const containerWidth = container.clientWidth || container.offsetWidth || 0;
            const isWide = containerWidth >= 1280;
            const isMedium = containerWidth >= 820;
            const chartAreaLeft = isWide ? 56 : isMedium ? 58 : 62;
            const chartAreaWidth = isWide ? '90%' : isMedium ? '88%' : '80%';
            const chartAreaHeight = isMedium ? '70%' : '66%';

            const options = {
                width: '100%',
                height: 420,
                backgroundColor: 'transparent',
                chartArea: {
                    width: chartAreaWidth,
                    height: chartAreaHeight,
                    left: chartAreaLeft,
                    top: 62,
                    backgroundColor: { fill: 'rgba(255,255,255,0.02)', stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 },
                },
                legend: {
                    position: 'top',
                    alignment: 'start',
                    maxLines: 2,
                    textStyle: { color: '#d8dee9', fontSize: 11, bold: true },
                },
                bar: { groupWidth: '66%' },
                focusTarget: 'category',
                tooltip: {
                    textStyle: { color: '#0e141c', fontSize: 11 },
                    showColorCode: true,
                },
                crosshair: { trigger: 'focus', orientation: 'vertical', color: '#5dd62c' },
                vAxis: {
                    title: 'CDN$ / GJ',
                    titleTextStyle: { color: '#e6edf5', bold: true, fontSize: 12 },
                    textStyle: { color: '#a8b3c2', fontSize: 11 },
                    gridlines: { color: 'rgba(255,255,255,0.14)' },
                    minorGridlines: { color: 'rgba(255,255,255,0.06)' },
                    format: 'currency',
                },
                hAxis: {
                    slantedText: true,
                    slantedTextAngle: 65,
                    textStyle: { color: '#a8b3c2', fontSize: 10 },
                    baselineColor: 'rgba(255,255,255,0.14)',
                },
                colors: spec.colors,
                seriesType: 'bars',
                series: seriesConfig,
                animation: { startup: true, duration: 480, easing: 'out' },
            };

            const chart = new window.google.visualization.ComboChart(container);
            chart.draw(table, options);
        },

        drawCanadaCharts(pointRows = null) {
            const sourceRows = Array.isArray(pointRows) ? pointRows : this.state.canadaPointRows;
            Object.entries(CANADA_CHART_SPECS).forEach(([chartId, spec]) => {
                const rows = sourceRows.filter((row) => row.chart_id === chartId);
                this.drawCanadaComboChart(spec, rows);
            });
        },

        parseMaybeArray(value) {
            if (Array.isArray(value)) return value;
            if (typeof value !== 'string') return [];
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        },

        getCanadaTableCellValue(row, header, index) {
            if (row && typeof row === 'object' && !Array.isArray(row)) return row[header] ?? '';
            if (Array.isArray(row)) return row[index] ?? '';
            return '';
        },

        renderCanadaStaticTables(tableRows = null) {
            const wrap = document.getElementById('ggx-canada-static-tables');
            if (!wrap) return;

            const sourceRows = Array.isArray(tableRows) ? tableRows : this.state.canadaTableRows;
            if (!sourceRows.length) {
                wrap.innerHTML = '<div class="ggx-empty">No parsed Canada static tables in this run.</div>';
                return;
            }

            const preferredOrder = ['intra_alberta_cost_image', 'current_utility_delivery_costs_image'];
            const sorted = [...sourceRows].sort((a, b) => {
                const ai = preferredOrder.indexOf(a.chart_id);
                const bi = preferredOrder.indexOf(b.chart_id);
                if (ai === -1 && bi === -1) return String(a.chart_title || '').localeCompare(String(b.chart_title || ''));
                if (ai === -1) return 1;
                if (bi === -1) return -1;
                return ai - bi;
            });

            wrap.innerHTML = sorted
                .map((item) => {
                    const headers = this.parseMaybeArray(item.headers);
                    const rows = this.parseMaybeArray(item.table_rows);

                    if (!headers.length) {
                        return `
                            <article class="ggx-channel-card p-4">
                                <h3 class="ggx-event-title">${escapeHtml(item.chart_title || item.chart_id || 'Untitled')}</h3>
                                <div class="ggx-empty mt-3">No parsed table headers in this record.</div>
                            </article>
                        `;
                    }

                    const headerHtml = headers
                        .map((header) => `<th class="ggx-canada-head-cell">${escapeHtml(header)}</th>`)
                        .join('');
                    const bodyHtml = rows
                        .map((row, rowIndex) => {
                            const isSection = row && typeof row === 'object' && !Array.isArray(row) && row._row_type === 'section';
                            const cellHtml = headers
                                .map((header, index) => {
                                    const raw = this.getCanadaTableCellValue(row, header, index);
                                    const value = isSection && header !== 'Component' ? '' : raw;
                                    const cellClass = isSection && header === 'Component' ? 'ggx-canada-cell ggx-canada-cell-section' : 'ggx-canada-cell';
                                    return `<td class="${cellClass}">${escapeHtml(value)}</td>`;
                                })
                                .join('');
                            const rowClass = isSection ? 'ggx-canada-row is-section' : `ggx-canada-row ${rowIndex % 2 === 0 ? 'is-even' : 'is-odd'}`;
                            return `<tr class="${rowClass}">${cellHtml}</tr>`;
                        })
                        .join('');

                    return `
                        <article class="ggx-channel-card p-4">
                            <h3 class="ggx-event-title">${escapeHtml(item.chart_title || item.chart_id || 'Untitled')}</h3>
                            <div class="ggx-table-wrap mt-3">
                                <table class="ggx-data-table ggx-canada-data-table">
                                    <thead>
                                        <tr>${headerHtml}</tr>
                                    </thead>
                                    <tbody>${bodyHtml}</tbody>
                                </table>
                            </div>
                            <p class="ggx-mini-caption mt-3">Parsed rows: ${escapeHtml(String(item.row_count || 0))}</p>
                        </article>
                    `;
                })
                .join('');
        },

        async renderCanadaDashboard() {
            const activeRegion = this.getActiveDataRegionView();
            const pointRows = Array.isArray(activeRegion?.pointRows) ? activeRegion.pointRows : this.state.canadaPointRows;
            const tableRows = Array.isArray(activeRegion?.tableRows) ? activeRegion.tableRows : this.state.canadaTableRows;

            this.renderCanadaRunSummary(activeRegion);
            if (!pointRows.length && !tableRows.length) {
                this.setCanadaStatus('loading', `No structured chart/table data yet for ${activeRegion?.label || 'selected region'}.`);
            } else {
                this.setCanadaStatus(
                    this.state.canadaStatus.type,
                    `${this.state.canadaStatus.message} Scope ${activeRegion?.shortLabel || 'GLOBAL'}: ${pointRows.length} points / ${tableRows.length} tables.`
                );
            }
            this.renderCanadaStaticTables(tableRows);
            this.drawCanadaCharts(pointRows);

            if (!pointRows.length) return;

            await ensureGoogleChartsLoaded();
            this.drawCanadaCharts(pointRows);

            if (!this.state.canadaResizeBound) {
                this.state.canadaResizeBound = true;
                let resizeTimer = null;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(() => {
                        const active = this.getActiveDataRegionView();
                        const scopedRows = Array.isArray(active?.pointRows) ? active.pointRows : this.state.canadaPointRows;
                        this.drawCanadaCharts(scopedRows);
                    }, 180);
                });
            }
        },

        async buildEventsRows() {
            const rows = [];
            const pushRow = (row) => {
                if (!row || !row.title) return;
                rows.push(row);
            };

            try {
                const { data, error } = await _supabase.from('events').select('*').order('date', { ascending: false }).limit(24);
                if (!error && Array.isArray(data)) {
                    data.forEach((item) => {
                        pushRow({
                            id: `events-${item.id}`,
                            title: item.title || item.name || 'Untitled Event',
                            summary: item.description || item.location || 'Event item from events table.',
                            source: 'events',
                            date: item.date || item.created_at,
                            url: item.link || item.url || '#',
                            type: item.type || 'event',
                        });
                    });
                }
            } catch {
                // events table can be absent.
            }

            this.state.savedNews.forEach((item) => {
                pushRow({
                    id: `saved-${item.id}`,
                    title: item.title || 'Saved source item',
                    summary: item.source ? `Source: ${item.source}` : 'Saved item from saved_news table.',
                    source: 'saved_news',
                    date: item.created_at,
                    url: item.url || '#',
                    type: item.source || 'saved',
                });
            });

            const articleEvents = filterArticlesByChannel(this.state.allArticles, 'events').slice(0, 36);
            articleEvents.forEach((item) => {
                pushRow({
                    id: `article-${item.id}`,
                    title: item.main_title || 'Article event',
                    summary: cleanSummary(item.subheading) || item.publisher || 'Article-derived event note.',
                    source: 'articles',
                    date: item.time,
                    url: getArticleUrl(item),
                    type: item.secondary_tag || item.tag || 'article',
                });
            });

            const dedup = new Map();
            rows.forEach((row) => {
                const key = `${toLower(row.title)}|${toLower(row.url)}|${toLower(row.date)}`;
                if (!dedup.has(key)) dedup.set(key, row);
            });

            return Array.from(dedup.values()).sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        },

        async renderEventsLayout() {
            this.state.eventsRows = await this.buildEventsRows();
            this.renderEventsHero();
            this.renderEventsCards();
        },

        renderEventsHero() {
            const hero = document.getElementById('ggx-events-hero');
            const meta = document.getElementById('ggx-events-hero-meta');
            if (!hero || !meta) return;

            const top = this.state.eventsRows[0];
            const sources = countBy(this.state.eventsRows, (row) => row.source).slice(0, 3);
            const sourceText = sources.length
                ? sources.map(([source, count]) => `${source}: ${count}`).join(' · ')
                : 'No event records found';

            if (top) {
                hero.innerHTML = `
                    <h3>${escapeHtml(config.pageTitle)}</h3>
                    <h2 class="text-2xl font-bold leading-tight mt-2">${escapeHtml(top.title)}</h2>
                    <p class="ggx-mini-caption mt-2">${escapeHtml(top.summary || '')}</p>
                    <div class="ggx-mini-caption mt-3">Latest update: ${escapeHtml(formatDateTime(top.date))}</div>
                    <div id="ggx-events-hero-meta" class="ggx-mini-caption">${escapeHtml(sourceText)}</div>
                `;
            } else {
                meta.textContent = sourceText;
            }
        },

        renderEventsCards() {
            const container = document.getElementById('ggx-events-grid');
            const btn = document.getElementById('ggx-load-more-btn');
            if (!container || !btn) return;

            if (!this.state.eventsRows.length) {
                container.innerHTML = '<div class="ggx-empty">No events-like records from tables yet.</div>';
                btn.style.display = 'none';
                return;
            }

            const rows = this.state.eventsRows.slice(0, this.state.visibleCount);
            container.innerHTML = rows
                .map((item) => `
                    <article class="ggx-channel-card ggx-event-card">
                        <span class="ggx-event-date"><i class="fa-solid fa-clock"></i>${escapeHtml(formatDateTime(item.date))}</span>
                        <h3 class="ggx-event-title">${escapeHtml(item.title || 'Untitled')}</h3>
                        <p class="ggx-event-summary ggx-line-clamp-3">${escapeHtml(item.summary || 'No summary provided.')}</p>
                        <div class="ggx-event-actions">
                            <span class="text-xs text-gray-500 uppercase tracking-wide">${escapeHtml(item.source || '--')} · ${escapeHtml(item.type || '--')}</span>
                            <a ${buildLinkAttrs(item.url || '#')} class="ggx-event-link">Open Link</a>
                        </div>
                    </article>
                `)
                .join('');

            if (rows.length >= this.state.eventsRows.length) btn.style.display = 'none';
            else btn.style.display = 'inline-flex';
        },
    };
}
