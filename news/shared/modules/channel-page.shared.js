
import { renderSharedAuthState } from './layout.shared.js?v=20260413authsync02';
import { HEADER_NAVIGATION } from '../config/navigation.config.js';
import {
    DEFAULT_COVER,
    extractCoverFromArticleHtml as extractSharedCoverFromArticleHtml,
    fetchArticleDetailHtml as fetchSharedArticleDetailHtml,
    getArticleMediaMeta,
    isVideoMediaPath,
} from './media.shared.js';

const SUPABASE_URL = 'https://mkpcliytqudclkwtewru.supabase.co';
const SUPABASE_KEY = 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';
const EDITORIAL_CHANNELS = ['gas-energy', 'generators', 'mining', 'insights'];
const NON_DATA_CHANNELS = [...EDITORIAL_CHANNELS, 'events'];
const ALL_CHANNELS = [...NON_DATA_CHANNELS, 'data'];

const DATA_SIGNAL_KEYWORDS = [
    'data',
    'metric',
    'index',
    'spread',
    'difficulty',
    'hashrate',
    'dashboard',
    'model',
    'terminal',
    'table',
    'efficiency',
    'finance',
];

const EXCLUDED_TYPES = new Set(['unclassified', 'news', 'unclassified/news', 'uncategorized']);

const TYPE_ALIAS_TO_CANONICAL = {
    'gas-energy': 'gas-energy',
    'gas energy': 'gas-energy',
    gas_energy: 'gas-energy',
    gasenergy: 'gas-energy',
    generators: 'generators',
    generator: 'generators',
    hardware: 'generators',
    gen: 'generators',
    mining: 'mining',
    'bitcoin-mining': 'mining',
    bitcoin_mining: 'mining',
    btc: 'mining',
    'btc-mining': 'mining',
    insights: 'insights',
    insight: 'insights',
    'deep-dive': 'insights',
    deep_dive: 'insights',
    analysis: 'insights',
    regulatory: 'insights',
    data: 'data',
    finance: 'data',
    'market-data': 'data',
    'data-finance': 'data',
    events: 'events',
    event: 'events',
};

const CHANNEL_CONFIGS = {
    'gas-energy': {
        navTitle: 'GAS ENERGY',
        layoutVariant: 'gas-energy',
        pageTitle: 'Gas Energy Command Deck',
        pageSubtitle: 'Pipeline and dispatch intelligence with an operations-first view.',
        feedTitle: 'Dispatch Briefs',
        icon: 'fa-fire-flame-curved',
        accent: '#00d7ff',
        accentSoft: 'rgba(0, 215, 255, 0.16)',
        accentGlow: 'rgba(0, 215, 255, 0.32)',
        chips: ['Pipeline', 'Dispatch', 'Flare Recovery'],
    },
    generators: {
        navTitle: 'GENERATORS',
        layoutVariant: 'generators',
        pageTitle: 'Generator Fleet Board',
        pageSubtitle: 'Specification-driven perspective across models, vendors and operational baselines.',
        feedTitle: 'Equipment Logs',
        icon: 'fa-gears',
        accent: '#ff9f1c',
        accentSoft: 'rgba(255, 159, 28, 0.16)',
        accentGlow: 'rgba(255, 159, 28, 0.32)',
        chips: ['Prime Power', 'Recip Engines', 'Turbines'],
    },
    mining: {
        navTitle: 'MINING',
        layoutVariant: 'mining',
        pageTitle: 'Mining Situation Room',
        pageSubtitle: 'Signal-heavy monitoring of hashrate, ASIC cycle and treasury pressure.',
        feedTitle: 'Warboard Stream',
        icon: 'fa-bitcoin-sign',
        accent: '#f7931a',
        accentSoft: 'rgba(247, 147, 26, 0.16)',
        accentGlow: 'rgba(247, 147, 26, 0.3)',
        chips: ['Hashrate', 'ASIC', 'Treasury'],
    },
    insights: {
        navTitle: 'INSIGHTS',
        layoutVariant: 'insights',
        pageTitle: 'Insights Briefing',
        pageSubtitle: 'Reading-oriented briefing stream with timeline structure and opinion context.',
        feedTitle: 'Briefing Timeline',
        icon: 'fa-chart-line',
        accent: '#8be34f',
        accentSoft: 'rgba(139, 227, 79, 0.15)',
        accentGlow: 'rgba(139, 227, 79, 0.3)',
        chips: ['Policy', 'Finance', 'Research'],
    },
    data: {
        navTitle: 'DATA',
        layoutVariant: 'data',
        pageTitle: 'Data Terminal',
        pageSubtitle: 'Structured metrics and cross-channel notes from canonical data aggregation.',
        feedTitle: 'Integrated Notes',
        icon: 'fa-database',
        accent: '#22d3ee',
        accentSoft: 'rgba(34, 211, 238, 0.16)',
        accentGlow: 'rgba(34, 211, 238, 0.34)',
    },
    events: {
        navTitle: 'EVENTS',
        layoutVariant: 'events',
        pageTitle: 'Events Timeline',
        pageSubtitle: 'Chronological signal deck from events, saved sources and canonical event articles.',
        feedTitle: 'Event Stream',
        icon: 'fa-calendar-days',
        accent: '#5dd62c',
        accentSoft: 'rgba(93, 214, 44, 0.15)',
        accentGlow: 'rgba(93, 214, 44, 0.32)',
        chips: ['Articles', 'Saved Sources', 'Timeline'],
    },
};

function createEmptyBuckets() {
    return {
        'gas-energy': [],
        generators: [],
        mining: [],
        insights: [],
        events: [],
        data: [],
    };
}

function getChannelConfig(channelKey) {
    return CHANNEL_CONFIGS[channelKey] || CHANNEL_CONFIGS.mining;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function toLower(value) {
    return String(value || '').trim().toLowerCase();
}

function normalizeSlug(value) {
    return toLower(value)
        .replace(/[\s_]+/g, '-')
        .replace(/[\/|]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function normalizeDay(value) {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
}

function getTimestamp(value) {
    if (!value) return 0;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}
function formatDate(value) {
    if (!value) return '--';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(value) {
    if (!value) return '--';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function cleanSummary(value) {
    if (!value) return '';
    return String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function isGasGxHost(url) {
    return /^https?:\/\/(www\.)?gasgx\.com/i.test(url || '');
}

function getArticleUrl(item) {
    if (!item || typeof item !== 'object') return '#';
    const articleId = item.api_id || item.id;
    if (articleId) return `https://www.gasgx.com/news/article/${articleId}`;
    const link = String(item.link || '').trim();
    return link || '#';
}

function getImageUrl(item) {
    const media = getArticleMediaMeta(item);
    if (!media.url) return DEFAULT_COVER;
    if (isVideoMediaPath(media.url)) return DEFAULT_COVER;
    return media.url;
}

function getAuthorAvatarUrl(item) {
    const fallback = '/news/author_avatar/GasGx-Researcher.png';
    if (!item || typeof item !== 'object') return fallback;

    const articleId = item.api_id || item.id;
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

function compareArticleTimeDesc(a, b) {
    return getTimestamp(b.time || b.date || b.created_at) - getTimestamp(a.time || a.date || a.created_at);
}

function resolveCanonicalType(rawType) {
    const raw = toLower(rawType);
    if (!raw) return null;

    const compact = normalizeSlug(raw);
    if (!compact) return null;

    if (EXCLUDED_TYPES.has(raw) || EXCLUDED_TYPES.has(compact)) return null;

    const direct = TYPE_ALIAS_TO_CANONICAL[raw] || TYPE_ALIAS_TO_CANONICAL[compact];
    if (direct) return direct;

    const tokens = raw
        .split(/[\/,|;]+/)
        .map((token) => token.trim())
        .filter(Boolean);
    for (const token of tokens) {
        const tokenSlug = normalizeSlug(token);
        if (EXCLUDED_TYPES.has(token) || EXCLUDED_TYPES.has(tokenSlug)) return null;
        const mapped = TYPE_ALIAS_TO_CANONICAL[token] || TYPE_ALIAS_TO_CANONICAL[tokenSlug];
        if (mapped) return mapped;
    }

    return null;
}

function getArticleIdentity(article) {
    if (!article || typeof article !== 'object') return '';
    return String(article.api_id || article.id || article.link || '').trim();
}

function getArticleDedupKey(article) {
    const apiId = String(article?.api_id || '').trim();
    if (apiId) return `api:${apiId}`;

    const link = toLower(article?.link);
    if (link) return `link:${link}`;

    const title = toLower(article?.main_title);
    const publisher = toLower(article?.publisher);
    const day = normalizeDay(article?.time || article?.date || article?.created_at) || 'na';
    return `fallback:${title}|${publisher}|${day}`;
}

function dedupeArticlesByFreshness(articles) {
    if (!Array.isArray(articles)) return [];

    const map = new Map();
    articles.forEach((article) => {
        const key = getArticleDedupKey(article);
        if (!key) return;

        const current = map.get(key);
        if (!current) {
            map.set(key, article);
            return;
        }

        const currentTime = getTimestamp(current.time || current.date || current.created_at);
        const incomingTime = getTimestamp(article.time || article.date || article.created_at);
        if (incomingTime >= currentTime) {
            map.set(key, article);
        }
    });

    return Array.from(map.values()).sort(compareArticleTimeDesc);
}

function dedupeArticlesLight(articles) {
    if (!Array.isArray(articles)) return [];
    const seen = new Set();
    const rows = [];

    articles.forEach((article) => {
        const key = getArticleDedupKey(article);
        if (!key || seen.has(key)) return;
        seen.add(key);
        rows.push(article);
    });

    return rows;
}

function getDataSignalScore(article) {
    const block = [article?.main_title, article?.subheading, article?.tag, article?.secondary_tag, article?.topics, article?.keywords]
        .map((value) => toLower(value))
        .join(' ');

    let score = 0;
    DATA_SIGNAL_KEYWORDS.forEach((keyword) => {
        if (block.includes(keyword)) score += 1;
    });
    return score;
}

function distributeArticles(articles) {
    const deduped = dedupeArticlesByFreshness(articles);
    const channelBuckets = createEmptyBuckets();
    const canonicalAssignments = {};
    const dataNative = [];

    deduped.forEach((article) => {
        const canonical = resolveCanonicalType(article.type);
        const identity = getArticleIdentity(article) || getArticleDedupKey(article);
        canonicalAssignments[identity] = canonical || 'unassigned';

        if (!canonical) return;
        if (canonical === 'data') {
            dataNative.push(article);
            return;
        }

        if (NON_DATA_CHANNELS.includes(canonical)) {
            channelBuckets[canonical].push(article);
        }
    });

    NON_DATA_CHANNELS.forEach((channel) => {
        channelBuckets[channel] = channelBuckets[channel].sort(compareArticleTimeDesc);
    });

    const dataAggregate = [
        ...channelBuckets['gas-energy'],
        ...channelBuckets.generators,
        ...channelBuckets.mining,
        ...channelBuckets.insights,
        ...channelBuckets.events,
        ...dataNative,
    ];

    channelBuckets.data = dedupeArticlesLight(dataAggregate).sort((a, b) => {
        const t = compareArticleTimeDesc(a, b);
        if (t !== 0) return t;
        return getDataSignalScore(b) - getDataSignalScore(a);
    });

    return {
        channelBuckets,
        canonicalAssignments,
    };
}
function renderShell(channelKey, innerHtml) {
    return `
<section class="ggx-channel-shell ggx-channel--${escapeHtml(channelKey)}">
    <main class="ggx-channel-main">
        ${innerHtml}
    </main>
    <button id="ggx-to-top" class="ggx-to-top" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })" aria-label="Back to top">
        <i class="fa-solid fa-arrow-up"></i>
    </button>
</section>`;
}

function renderChipRow(chips = []) {
    if (!Array.isArray(chips) || chips.length === 0) return '';
    return `<div class="ggx-chip-row">${chips
        .map((chip, index) => `<span class="ggx-chip${index === 0 ? ' active' : ''}">${escapeHtml(chip)}</span>`)
        .join('')}</div>`;
}

function renderSectionHead(config) {
    return `
    <div class="ggx-section-head">
        <h2><i class="fa-solid ${escapeHtml(config.icon)}"></i> ${escapeHtml(config.feedTitle)}</h2>
        ${renderChipRow(config.chips || [])}
    </div>`;
}

function renderGasEnergyTemplate(config, channelKey) {
    return renderShell(
        channelKey,
        `
        <header class="ggx-page-head">
            <p class="ggx-page-kicker">Command Deck</p>
            <h1>${escapeHtml(config.pageTitle)}</h1>
            <p>${escapeHtml(config.pageSubtitle)}</p>
        </header>
        <section class="ggx-ge-grid">
            <article id="ggx-ge-hero" class="ggx-card ggx-ge-hero"><div class="ggx-empty">Loading command headline...</div></article>
            <aside id="ggx-ge-signals" class="ggx-ge-signals"><div class="ggx-empty">Loading operation signals...</div></aside>
        </section>
        ${renderSectionHead(config)}
        <section id="ggx-ge-feed" class="ggx-feed-grid"><div class="ggx-empty">Loading channel stories...</div></section>
        <div class="ggx-load-more-wrap">
            <button id="ggx-load-more-btn" class="ggx-load-more-btn" onclick="window.GGXChannelApp && window.GGXChannelApp.loadMore()">Load More</button>
        </div>`
    );
}

function renderGeneratorsTemplate(config, channelKey) {
    return renderShell(
        channelKey,
        `
        <header class="ggx-page-head">
            <p class="ggx-page-kicker">Equipment Board</p>
            <h1>${escapeHtml(config.pageTitle)}</h1>
            <p>${escapeHtml(config.pageSubtitle)}</p>
        </header>
        <section class="ggx-gen-grid">
            <article id="ggx-gen-hero" class="ggx-card ggx-gen-hero"><div class="ggx-empty">Loading fleet headline...</div></article>
            <section id="ggx-gen-compare" class="ggx-card ggx-gen-compare"><div class="ggx-empty">Loading comparison block...</div></section>
        </section>
        <section id="ggx-gen-specs" class="ggx-gen-specs"><div class="ggx-empty">Loading model cards...</div></section>
        ${renderSectionHead(config)}
        <section id="ggx-gen-feed" class="ggx-feed-grid"><div class="ggx-empty">Loading equipment logs...</div></section>
        <div class="ggx-load-more-wrap">
            <button id="ggx-load-more-btn" class="ggx-load-more-btn" onclick="window.GGXChannelApp && window.GGXChannelApp.loadMore()">Load More</button>
        </div>`
    );
}

function renderMiningTemplate(config, channelKey) {
    return renderShell(
        channelKey,
        `
        <header class="ggx-page-head">
            <p class="ggx-page-kicker">Situation Board</p>
            <h1>${escapeHtml(config.pageTitle)}</h1>
            <p>${escapeHtml(config.pageSubtitle)}</p>
        </header>
        <section class="ggx-mining-grid">
            <section id="ggx-mining-stream" class="ggx-card ggx-mining-stream"><div class="ggx-empty">Loading quick stream...</div></section>
            <section id="ggx-mining-heat" class="ggx-card ggx-mining-heat"><div class="ggx-empty">Loading heat zones...</div></section>
            <section id="ggx-mining-risk" class="ggx-card ggx-mining-risk"><div class="ggx-empty">Loading risk board...</div></section>
        </section>
        ${renderSectionHead(config)}
        <section id="ggx-mining-feed" class="ggx-feed-grid ggx-feed-grid-compact"><div class="ggx-empty">Loading mining signals...</div></section>
        <div class="ggx-load-more-wrap">
            <button id="ggx-load-more-btn" class="ggx-load-more-btn" onclick="window.GGXChannelApp && window.GGXChannelApp.loadMore()">Load More</button>
        </div>`
    );
}

function renderInsightsTemplate(config, channelKey) {
    return renderShell(
        channelKey,
        `
        <header class="ggx-page-head">
            <p class="ggx-page-kicker">Briefing Flow</p>
            <h1>${escapeHtml(config.pageTitle)}</h1>
            <p>${escapeHtml(config.pageSubtitle)}</p>
        </header>
        <section class="ggx-insights-grid">
            <article id="ggx-insights-feature" class="ggx-card ggx-insights-feature"><div class="ggx-empty">Loading feature briefing...</div></article>
            <aside id="ggx-insights-topics" class="ggx-card ggx-insights-topics"><div class="ggx-empty">Loading topic index...</div></aside>
        </section>
        ${renderSectionHead(config)}
        <section id="ggx-insights-timeline" class="ggx-timeline-list"><div class="ggx-empty">Loading timeline...</div></section>
        <div class="ggx-load-more-wrap">
            <button id="ggx-load-more-btn" class="ggx-load-more-btn" onclick="window.GGXChannelApp && window.GGXChannelApp.loadMore()">Load More</button>
        </div>`
    );
}

function renderDataTemplate(config, channelKey) {
    return renderShell(
        channelKey,
        `
        <header class="ggx-page-head">
            <p class="ggx-page-kicker">Terminal</p>
            <h1>${escapeHtml(config.pageTitle)}</h1>
            <p>${escapeHtml(config.pageSubtitle)}</p>
        </header>
        <section class="ggx-data-top">
            <article class="ggx-card ggx-data-block"><div class="ggx-section-head"><h2><i class="fa-solid fa-wave-square"></i> Structured Metrics</h2></div><div id="ggx-metric-grid" class="ggx-metric-grid"></div></article>
            <article class="ggx-card ggx-data-block"><div class="ggx-section-head"><h2><i class="fa-solid fa-layer-group"></i> Regional Fuel Mix</h2></div><ul id="ggx-fuel-mix" class="ggx-signal-list"></ul></article>
        </section>
        <section class="ggx-data-bottom">
            <article class="ggx-card ggx-data-block"><div class="ggx-section-head"><h2><i class="fa-solid fa-server"></i> Equipment Snapshot</h2></div><div id="ggx-equipment-table" class="ggx-table-wrap"></div></article>
            <article class="ggx-card ggx-data-block"><div class="ggx-section-head"><h2><i class="fa-solid fa-circle-nodes"></i> Cross-channel Notes</h2></div><div id="ggx-data-notes" class="ggx-feed-grid ggx-feed-grid-compact"></div><div class="ggx-load-more-wrap ggx-load-inline"><button id="ggx-load-more-btn" class="ggx-load-more-btn" onclick="window.GGXChannelApp && window.GGXChannelApp.loadMore()">Load More</button></div></article>
        </section>`
    );
}

function renderEventsTemplate(config, channelKey) {
    return renderShell(
        channelKey,
        `
        <header class="ggx-page-head">
            <p class="ggx-page-kicker">Timeline Deck</p>
            <h1>${escapeHtml(config.pageTitle)}</h1>
            <p>${escapeHtml(config.pageSubtitle)}</p>
        </header>
        <section id="ggx-events-hero" class="ggx-card ggx-events-hero"><div class="ggx-empty">Loading event headline...</div></section>
        ${renderSectionHead(config)}
        <section class="ggx-events-layout">
            <aside id="ggx-events-source-tags" class="ggx-card ggx-events-source-tags"><div class="ggx-empty">Loading source tags...</div></aside>
            <div id="ggx-events-grid" class="ggx-events-grid"><div class="ggx-empty">Loading timeline cards...</div></div>
        </section>
        <div class="ggx-load-more-wrap">
            <button id="ggx-load-more-btn" class="ggx-load-more-btn" onclick="window.GGXChannelApp && window.GGXChannelApp.loadMore()">Load More Events</button>
        </div>`
    );
}

function renderChannelTemplate(config, channelKey) {
    switch (config.layoutVariant) {
        case 'gas-energy':
            return renderGasEnergyTemplate(config, channelKey);
        case 'generators':
            return renderGeneratorsTemplate(config, channelKey);
        case 'mining':
            return renderMiningTemplate(config, channelKey);
        case 'insights':
            return renderInsightsTemplate(config, channelKey);
        case 'data':
            return renderDataTemplate(config, channelKey);
        case 'events':
            return renderEventsTemplate(config, channelKey);
        default:
            return renderInsightsTemplate(config, channelKey);
    }
}

function renderArticleCoverMedia(article) {
    const media = getArticleMediaMeta(article);
    const mediaUrl = escapeHtml(media.url || DEFAULT_COVER);
    const mediaAlt = escapeHtml(article?.main_title || '');
    const articleId = escapeHtml(String(article?.app_id || article?.api_id || article?.id || ''));
    const hasVideoSource = isVideoMediaPath(media.url);
    const showVideoBadge = Boolean(media.isVideoCover || hasVideoSource);
    const badgeHtml = `<span data-video-badge-id="${articleId}" class="ggx-video-badge${showVideoBadge ? '' : ' hidden'}"><i class="fa-solid fa-play"></i></span>`;

    if (hasVideoSource) {
        return `
            <video data-article-id="${articleId}" data-video-cover="${showVideoBadge ? '1' : '0'}" class="ggx-feed-media" muted playsinline autoplay loop preload="metadata" poster="${DEFAULT_COVER}">
                <source src="${mediaUrl}">
            </video>
            ${badgeHtml}
        `;
    }

    return `<img data-article-id="${articleId}" data-video-cover="${showVideoBadge ? '1' : '0'}" src="${mediaUrl}" alt="${mediaAlt}" class="ggx-feed-media" loading="lazy" onerror="this.src='${DEFAULT_COVER}'">${badgeHtml}`;
}

function renderArticleCard(article, options = {}) {
    const url = getArticleUrl(article);
    const summary = cleanSummary(article.subheading) || 'No summary available.';
    const tag = article.secondary_tag || article.tag || 'Update';
    const compact = options.compact ? ' ggx-feed-card-compact' : '';

    return `
        <article class="ggx-card ggx-feed-card${compact}">
            <a ${buildLinkAttrs(url)} class="ggx-feed-cover">${renderArticleCoverMedia(article)}</a>
            <div class="ggx-feed-body">
                <div class="ggx-feed-meta"><span class="ggx-feed-kicker">${escapeHtml(tag)}</span><span>${escapeHtml(formatDate(article.time))}</span></div>
                <h3 class="ggx-feed-title ggx-line-clamp-2"><a ${buildLinkAttrs(url)}>${escapeHtml(article.main_title || 'Untitled')}</a></h3>
                <p class="ggx-feed-summary ggx-line-clamp-2">${escapeHtml(summary)}</p>
                <div class="ggx-feed-footer"><span class="ggx-feed-publisher"><img src="${escapeHtml(getAuthorAvatarUrl(article))}" alt="${escapeHtml(article.publisher || 'GasGx Desk')}" loading="lazy" onerror="this.src='/news/author_avatar/GasGx-Researcher.png'"> ${escapeHtml(article.publisher || 'GasGx Desk')}</span><a ${buildLinkAttrs(url)} class="ggx-feed-read">Read</a></div>
            </div>
        </article>`;
}

function renderMiniSignalList(items, formatter) {
    if (!Array.isArray(items) || items.length === 0) return '<div class="ggx-empty">No records available.</div>';
    return `<ul class="ggx-signal-list">${items.map((item) => formatter(item)).join('')}</ul>`;
}

function collectTopTags(rows, limit = 6) {
    return countBy(rows, (row) => {
        const raw = toLower(row.secondary_tag || row.tag);
        return raw || null;
    }).slice(0, limit);
}

export function mountChannelMain(container, channelKey) {
    if (!container) return;
    const config = getChannelConfig(channelKey);
    container.innerHTML = renderChannelTemplate(config, channelKey);
}

export function createChannelApp(channelKey) {
    const config = getChannelConfig(channelKey);
    const { createClient } = supabase;
    const mainAuthConfig = window.GASGX_SITE_SHELL_CONFIG?.site?.mainAuth || {};
    const mainAuthStorageKey = typeof mainAuthConfig.storageKey === 'string' && mainAuthConfig.storageKey.trim()
        ? mainAuthConfig.storageKey.trim()
        : 'gasgx-main-auth';
    const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            storageKey: mainAuthStorageKey,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    });

    return {
        state: {
            currentUser: null,
            displayName: null,
            marketMetrics: [],
            equipmentData: [],
            allArticles: [],
            filteredArticles: [],
            channelBuckets: createEmptyBuckets(),
            canonicalAssignments: {},
            savedNews: [],
            eventsRows: [],
            articleCoverCache: {},
            articleCoverLoading: {},
            articleCoverIsVideo: {},
            visibleCount: config.layoutVariant === 'events' ? 6 : 8,
            pageSize: config.layoutVariant === 'events' ? 6 : 6,
            scrollBound: false,
        },
        async init() {
            this.applyTheme();
            await this.initAuth();
            this.renderNav();
            this.loadLiveData();

            await Promise.allSettled([
                this.loadArticles(),
                this.loadMarketMetrics(),
                this.loadEquipmentData(),
                this.loadSavedNews(),
            ]);

            await this.renderCurrentLayout();
            this.bindScroll();
        },

        applyTheme() {
            document.body.classList.add('ggx-channel-page');
            ALL_CHANNELS.forEach((key) => document.body.classList.remove(`ggx-channel--${key}`));
            document.body.classList.add(`ggx-channel--${channelKey}`);

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
                // silent fallback
            }
        },

        renderNav() {
            renderSharedAuthState({
                page: 'news-home',
                idPrefix: 'ggx',
                navigation: HEADER_NAVIGATION,
                currentUser: this.state.currentUser,
                displayName: this.state.displayName,
                accountUrl: '/account/account.html',
                signInUrl: '/account/user.html',
                activeTitle: config.navTitle,
                activePath: window.location.pathname,
            });
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

        buildPublishedArticlesQuery(query) {
            return query.eq('status', 'published').is('deleted_at', null);
        },

        isPublishedFilterUnsupported(error) {
            const text = String(error?.message || '').toLowerCase();
            return text.includes('status') || text.includes('deleted_at');
        },

        isDisplayableArticle(article) {
            if (!article || typeof article !== 'object') return false;
            if (article.deleted_at) return false;
            if (article.status && String(article.status).toLowerCase() !== 'published') return false;
            return true;
        },

        rebuildDistribution() {
            const distributed = distributeArticles(this.state.allArticles);
            this.state.channelBuckets = distributed.channelBuckets;
            this.state.canonicalAssignments = distributed.canonicalAssignments;

            const channelRows = this.state.channelBuckets[channelKey] || [];
            this.state.filteredArticles = dedupeArticlesLight(channelRows);
        },

        async loadLiveData() {
            const container = document.getElementById('ggx-live-data-container');
            if (!container) return;

            try {
                const { data } = await _supabase.from('homepage_scrolling_data').select('*').order('sort_order', { ascending: true });
                if (!Array.isArray(data) || data.length === 0) return;

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
                const maxRows = channelKey === 'events' ? 699 : 399;

                let query = _supabase
                    .from('articles')
                    .select('*')
                    .order('time', { ascending: false, nullsFirst: false })
                    .order('api_id', { ascending: false, nullsFirst: false })
                    .order('id', { ascending: false })
                    .range(0, maxRows);
                query = this.buildPublishedArticlesQuery(query);

                let { data, error } = await query;

                if (error && this.isPublishedFilterUnsupported(error)) {
                    const legacyRes = await _supabase
                        .from('articles')
                        .select('*')
                        .order('time', { ascending: false, nullsFirst: false })
                        .order('api_id', { ascending: false, nullsFirst: false })
                        .order('id', { ascending: false })
                        .range(0, maxRows);
                    data = legacyRes.data;
                    error = legacyRes.error;
                }

                if (error) throw error;

                this.state.allArticles = (Array.isArray(data) ? data : []).filter((item) => this.isDisplayableArticle(item));
                this.rebuildDistribution();
            } catch (error) {
                console.error('Channel article load failed:', error);
                this.state.allArticles = [];
                this.state.channelBuckets = createEmptyBuckets();
                this.state.filteredArticles = [];
                this.state.canonicalAssignments = {};
            }
        },

        async loadMarketMetrics() {
            try {
                const { data } = await _supabase.from('market_metrics').select('*').order('id', { ascending: true });
                this.state.marketMetrics = Array.isArray(data) ? data : [];
            } catch {
                this.state.marketMetrics = [];
            }
        },

        async loadEquipmentData() {
            try {
                const { data } = await _supabase
                    .from('equipment_data')
                    .select('*')
                    .order('power_output_kw', { ascending: false })
                    .limit(32);
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
                    .limit(40);
                this.state.savedNews = Array.isArray(data) ? data : [];
            } catch {
                this.state.savedNews = [];
            }
        },

        extractCoverFromArticleHtml(html, articleUrl) {
            return extractSharedCoverFromArticleHtml(html, articleUrl);
        },

        async fetchArticleDetailHtml(articleId) {
            return fetchSharedArticleDetailHtml(articleId);
        },

        updateArticleMediaNodes(articleId, mediaUrl, isVideoCover = false) {
            const targetId = String(articleId || '').trim();
            if (!targetId) return;

            document.querySelectorAll(`[data-article-id="${targetId}"]`).forEach((el) => {
                if (mediaUrl && el.tagName === 'IMG' && !isVideoMediaPath(mediaUrl)) {
                    el.src = mediaUrl;
                }

                if (mediaUrl && el.tagName === 'VIDEO') {
                    if (isVideoMediaPath(mediaUrl)) {
                        const source = el.querySelector('source');
                        if (source) source.src = mediaUrl;
                        else el.src = mediaUrl;
                        if (typeof el.load === 'function') el.load();
                    } else {
                        el.setAttribute('poster', mediaUrl);
                    }
                }

                el.dataset.videoCover = isVideoCover ? '1' : '0';
            });

            document.querySelectorAll(`[data-video-badge-id="${targetId}"]`).forEach((badge) => {
                badge.classList.toggle('hidden', !isVideoCover);
            });
        },

        async loadArticleCoverFromDetailPage(article) {
            const articleId = String(article?.app_id || article?.api_id || article?.id || '').trim();
            if (!articleId) return;

            if (this.state.articleCoverLoading[articleId]) return;

            if (this.state.articleCoverCache[articleId] || this.state.articleCoverIsVideo[articleId]) {
                this.updateArticleMediaNodes(articleId, this.state.articleCoverCache[articleId] || '', !!this.state.articleCoverIsVideo[articleId]);
                return;
            }

            this.state.articleCoverLoading[articleId] = true;
            try {
                const { html, articleUrl } = await this.fetchArticleDetailHtml(articleId);
                const coverMeta = this.extractCoverFromArticleHtml(html, articleUrl);
                if (!coverMeta.url && !coverMeta.isVideoCover) return;

                this.state.articleCoverCache[articleId] = coverMeta.url || '';
                this.state.articleCoverIsVideo[articleId] = !!coverMeta.isVideoCover;
                this.updateArticleMediaNodes(articleId, coverMeta.url || '', !!coverMeta.isVideoCover);
            } catch (error) {
                console.warn(`Failed to load fallback cover for article ${articleId}:`, error);
            } finally {
                delete this.state.articleCoverLoading[articleId];
            }
        },

        hydrateArticleMediaForRows(rows) {
            if (!Array.isArray(rows) || rows.length === 0) return;

            rows.forEach((row) => {
                const media = getArticleMediaMeta(row);
                if (media.isVideoCover) {
                    const id = String(row?.app_id || row?.api_id || row?.id || '').trim();
                    if (id) this.updateArticleMediaNodes(id, media.url || '', true);
                    return;
                }
                this.loadArticleCoverFromDetailPage(row);
            });
        },

        loadMore() {
            this.state.visibleCount += this.state.pageSize;

            if (channelKey === 'gas-energy') this.renderGasEnergyLayout();
            else if (channelKey === 'generators') this.renderGeneratorsLayout();
            else if (channelKey === 'mining') this.renderMiningLayout();
            else if (channelKey === 'insights') this.renderInsightsLayout();
            else if (channelKey === 'data') this.renderDataLayout();
            else if (channelKey === 'events') this.renderEventsLayout();
        },

        getBucketRows(targetChannelKey) {
            const rows = this.state.channelBuckets[targetChannelKey] || [];
            return dedupeArticlesLight(rows).sort(compareArticleTimeDesc);
        },

        getVisibleRows(rows, skipHead = 0) {
            if (!Array.isArray(rows)) return [];
            const source = skipHead > 0 ? rows.slice(skipHead) : rows;
            return source.slice(0, this.state.visibleCount);
        },

        setLoadMoreVisibility(total, skipHead = 0) {
            const btn = document.getElementById('ggx-load-more-btn');
            if (!btn) return;
            const available = Math.max(0, Number(total || 0) - Number(skipHead || 0));
            btn.style.display = available > this.state.visibleCount ? 'inline-flex' : 'none';
        },

        async renderCurrentLayout() {
            if (channelKey === 'gas-energy') {
                this.renderGasEnergyLayout();
                return;
            }
            if (channelKey === 'generators') {
                this.renderGeneratorsLayout();
                return;
            }
            if (channelKey === 'mining') {
                this.renderMiningLayout();
                return;
            }
            if (channelKey === 'insights') {
                this.renderInsightsLayout();
                return;
            }
            if (channelKey === 'data') {
                this.renderDataLayout();
                return;
            }
            if (channelKey === 'events') {
                await this.renderEventsLayout();
            }
        },
        renderGasEnergyLayout() {
            const rows = this.getBucketRows('gas-energy');
            const hero = rows[0] || null;

            const heroContainer = document.getElementById('ggx-ge-hero');
            const signalContainer = document.getElementById('ggx-ge-signals');
            const feedContainer = document.getElementById('ggx-ge-feed');

            if (heroContainer) {
                if (!hero) {
                    heroContainer.innerHTML = '<div class="ggx-empty">No canonical gas-energy stories found.</div>';
                } else {
                    const url = getArticleUrl(hero);
                    heroContainer.innerHTML = `
                        <img src="${escapeHtml(getImageUrl(hero))}" alt="${escapeHtml(hero.main_title || '')}" class="ggx-hero-image" loading="lazy" onerror="this.src='${DEFAULT_COVER}'">
                        <div class="ggx-hero-overlay"></div>
                        <div class="ggx-hero-content">
                            <span class="ggx-hero-badge">${escapeHtml(hero.secondary_tag || hero.tag || 'Gas Energy')}</span>
                            <h2><a ${buildLinkAttrs(url)}>${escapeHtml(hero.main_title || 'Untitled')}</a></h2>
                            <p class="ggx-line-clamp-3">${escapeHtml(cleanSummary(hero.subheading) || config.pageSubtitle)}</p>
                            <div class="ggx-hero-meta"><span>${escapeHtml(formatDate(hero.time))}</span><span>${escapeHtml(hero.publisher || 'GasGx Desk')}</span></div>
                        </div>
                    `;
                }
            }

            if (signalContainer) {
                const metrics = this.state.marketMetrics.slice(0, 3);
                const metricHtml = metrics.length
                    ? metrics
                          .map((item) => `<li><span>${escapeHtml(item.label || '--')}</span><strong>${escapeHtml(item.value || '--')} ${escapeHtml(item.unit || '')}</strong></li>`)
                          .join('')
                    : '<li><span>No market metric</span><strong>--</strong></li>';

                const streamRows = rows.slice(1, 6);
                const streamHtml = streamRows.length
                    ? streamRows
                          .map((item) => {
                              const url = getArticleUrl(item);
                              return `<li><a ${buildLinkAttrs(url)}>${escapeHtml(item.main_title || 'Untitled')}</a><time>${escapeHtml(formatDateTime(item.time))}</time></li>`;
                          })
                          .join('')
                    : '<li><a href="#">No additional dispatch stories.</a><time>--</time></li>';

                signalContainer.innerHTML = `
                    <section class="ggx-card ggx-signal-box"><h3>Run Signals</h3><ul class="ggx-inline-list">${metricHtml}</ul></section>
                    <section class="ggx-card ggx-signal-box"><h3>Headline Queue</h3><ul class="ggx-stream-list">${streamHtml}</ul></section>
                `;
            }

            if (feedContainer) {
                const visible = this.getVisibleRows(rows, 1);
                feedContainer.innerHTML = visible.length
                    ? visible.map((article) => renderArticleCard(article)).join('')
                    : '<div class="ggx-empty">No dispatch briefs available.</div>';
                this.hydrateArticleMediaForRows(visible);
            }

            this.setLoadMoreVisibility(rows.length, 1);
        },

        renderGeneratorsLayout() {
            const rows = this.getBucketRows('generators');
            const hero = rows[0] || null;

            const heroContainer = document.getElementById('ggx-gen-hero');
            const compareContainer = document.getElementById('ggx-gen-compare');
            const specsContainer = document.getElementById('ggx-gen-specs');
            const feedContainer = document.getElementById('ggx-gen-feed');

            if (heroContainer) {
                if (!hero) {
                    heroContainer.innerHTML = '<div class="ggx-empty">No canonical generator stories found.</div>';
                } else {
                    const url = getArticleUrl(hero);
                    heroContainer.innerHTML = `
                        <h2>${escapeHtml(config.pageTitle)}</h2>
                        <h3><a ${buildLinkAttrs(url)}>${escapeHtml(hero.main_title || 'Untitled')}</a></h3>
                        <p>${escapeHtml(cleanSummary(hero.subheading) || config.pageSubtitle)}</p>
                        <div class="ggx-meta-row"><span>${escapeHtml(formatDateTime(hero.time))}</span><span>${escapeHtml(hero.publisher || 'GasGx Desk')}</span></div>
                    `;
                }
            }

            if (compareContainer) {
                const equipmentRows = this.state.equipmentData.slice(0, 4);
                compareContainer.innerHTML = equipmentRows.length
                    ? `<h3>Spec Comparison</h3><table class="ggx-compact-table"><thead><tr><th>Model</th><th>kW</th><th>Eff.</th></tr></thead><tbody>${equipmentRows
                          .map((row) => `<tr><td>${escapeHtml(row.model || '--')}</td><td>${escapeHtml(String(row.power_output_kw ?? '--'))}</td><td>${escapeHtml(String(row.efficiency ?? '--'))}%</td></tr>`)
                          .join('')}</tbody></table>`
                    : '<div class="ggx-empty">No equipment data for comparison.</div>';
            }

            if (specsContainer) {
                const cards = this.state.equipmentData.slice(0, 8);
                specsContainer.innerHTML = cards.length
                    ? cards
                          .map(
                              (item) => `<article class="ggx-card ggx-spec-card"><div class="ggx-spec-head"><strong>${escapeHtml(item.model || '--')}</strong><span>${escapeHtml(item.manufacturer || '--')}</span></div><div class="ggx-spec-body"><span><label>Power</label><b>${escapeHtml(String(item.power_output_kw ?? '--'))} kW</b></span><span><label>Efficiency</label><b>${escapeHtml(String(item.efficiency ?? '--'))}%</b></span><span><label>Fuel</label><b>${escapeHtml(item.fuel_type || '--')}</b></span></div></article>`
                          )
                          .join('')
                    : '<div class="ggx-empty">No generator specification cards found.</div>';
            }

            if (feedContainer) {
                const visible = this.getVisibleRows(rows, 1);
                feedContainer.innerHTML = visible.length
                    ? visible.map((article) => renderArticleCard(article, { compact: true })).join('')
                    : '<div class="ggx-empty">No equipment logs available.</div>';
                this.hydrateArticleMediaForRows(visible);
            }

            this.setLoadMoreVisibility(rows.length, 1);
        },

        renderMiningLayout() {
            const rows = this.getBucketRows('mining');
            const streamContainer = document.getElementById('ggx-mining-stream');
            const heatContainer = document.getElementById('ggx-mining-heat');
            const riskContainer = document.getElementById('ggx-mining-risk');
            const feedContainer = document.getElementById('ggx-mining-feed');

            if (streamContainer) {
                streamContainer.innerHTML = `<h3>Quick Stream</h3>${renderMiniSignalList(rows.slice(0, 8), (item) => {
                    const url = getArticleUrl(item);
                    return `<li><a ${buildLinkAttrs(url)}>${escapeHtml(item.main_title || 'Untitled')}</a><time>${escapeHtml(formatDateTime(item.time))}</time></li>`;
                })}`;
            }

            if (heatContainer) {
                const tags = collectTopTags(rows, 6);
                heatContainer.innerHTML = `<h3>Heat Zones</h3>${renderMiniSignalList(tags, ([tag, count]) => `<li><span>${escapeHtml(tag.toUpperCase())}</span><strong>${escapeHtml(String(count))}</strong></li>`)}`;
            }

            if (riskContainer) {
                const metrics = this.state.marketMetrics.slice(0, 5);
                riskContainer.innerHTML = `<h3>Risk Board</h3>${renderMiniSignalList(metrics, (item) => `<li><span>${escapeHtml(item.label || '--')}</span><strong>${escapeHtml(item.change_24h || '--')}</strong></li>`)}`;
            }

            if (feedContainer) {
                const visible = this.getVisibleRows(rows);
                feedContainer.innerHTML = visible.length
                    ? visible.map((article) => renderArticleCard(article, { compact: true })).join('')
                    : '<div class="ggx-empty">No mining warboard signals available.</div>';
                this.hydrateArticleMediaForRows(visible);
            }

            this.setLoadMoreVisibility(rows.length);
        },

        renderInsightsLayout() {
            const rows = this.getBucketRows('insights');
            const featureContainer = document.getElementById('ggx-insights-feature');
            const topicsContainer = document.getElementById('ggx-insights-topics');
            const timelineContainer = document.getElementById('ggx-insights-timeline');
            const feature = rows[0] || null;

            if (featureContainer) {
                if (!feature) {
                    featureContainer.innerHTML = '<div class="ggx-empty">No canonical insights brief found.</div>';
                } else {
                    const url = getArticleUrl(feature);
                    featureContainer.innerHTML = `<span class="ggx-feature-kicker">Featured Brief</span><h2><a ${buildLinkAttrs(url)}>${escapeHtml(feature.main_title || 'Untitled')}</a></h2><p>${escapeHtml(cleanSummary(feature.subheading) || config.pageSubtitle)}</p><div class="ggx-meta-row"><span>${escapeHtml(formatDateTime(feature.time))}</span><span>${escapeHtml(feature.publisher || 'GasGx Desk')}</span></div>`;
                }
            }

            if (topicsContainer) {
                const topics = collectTopTags(rows, 8);
                topicsContainer.innerHTML = `<h3>Topic Density</h3>${renderMiniSignalList(topics, ([tag, count]) => `<li><span>${escapeHtml(tag)}</span><strong>${escapeHtml(String(count))}</strong></li>`)}`;
            }

            if (timelineContainer) {
                const visible = this.getVisibleRows(rows, 1);
                timelineContainer.innerHTML = visible.length
                    ? visible
                          .map((item) => {
                              const url = getArticleUrl(item);
                              return `<article class="ggx-card ggx-timeline-item"><time>${escapeHtml(formatDate(item.time))}</time><h3><a ${buildLinkAttrs(url)}>${escapeHtml(item.main_title || 'Untitled')}</a></h3><p>${escapeHtml(cleanSummary(item.subheading) || 'No summary available.')}</p><span class="ggx-timeline-source">${escapeHtml(item.publisher || 'GasGx Desk')}</span></article>`;
                          })
                          .join('')
                    : '<div class="ggx-empty">No timeline entries available.</div>';
            }

            this.setLoadMoreVisibility(rows.length, 1);
        },
        renderDataLayout() {
            this.renderDataMetrics();
            this.renderFuelMix();
            this.renderEquipmentTable();
            this.renderDataNotes();
        },

        renderDataMetrics() {
            const container = document.getElementById('ggx-metric-grid');
            if (!container) return;

            const metrics = this.state.marketMetrics.slice(0, 8);
            if (metrics.length === 0) {
                container.innerHTML = '<div class="ggx-empty">No market metrics in table.</div>';
                return;
            }

            container.innerHTML = metrics
                .map((item) => {
                    const trendIcon = item.trend === 'up' ? 'fa-caret-up' : item.trend === 'down' ? 'fa-caret-down' : 'fa-minus';
                    return `<article class="ggx-metric-card"><div class="ggx-metric-name">${escapeHtml(item.label || '--')}</div><div class="ggx-metric-value">${escapeHtml(item.value || '--')} <span>${escapeHtml(item.unit || '')}</span></div><div class="ggx-metric-trend"><i class="fa-solid ${trendIcon}"></i> ${escapeHtml(item.change_24h || '--')}</div></article>`;
                })
                .join('');
        },

        renderFuelMix() {
            const container = document.getElementById('ggx-fuel-mix');
            if (!container) return;

            if (!this.state.equipmentData.length) {
                container.innerHTML = '<li><span>No equipment rows available.</span><strong>--</strong></li>';
                return;
            }

            const grouped = countBy(this.state.equipmentData, (item) => toLower(item.fuel_type) || 'unknown').slice(0, 8);
            container.innerHTML = grouped
                .map(([fuel, count]) => {
                    const share = ((count / this.state.equipmentData.length) * 100).toFixed(1);
                    return `<li><span>${escapeHtml(fuel.toUpperCase())}</span><strong>${escapeHtml(String(count))} units / ${share}%</strong></li>`;
                })
                .join('');
        },

        renderEquipmentTable() {
            const container = document.getElementById('ggx-equipment-table');
            if (!container) return;

            const rows = this.state.equipmentData.slice(0, 14);
            if (rows.length === 0) {
                container.innerHTML = '<div class="ggx-empty">No equipment_data records.</div>';
                return;
            }

            const body = rows
                .map(
                    (row) => `<tr><td>${escapeHtml(row.manufacturer || '--')}</td><td>${escapeHtml(row.model || '--')}</td><td>${escapeHtml(String(row.power_output_kw ?? '--'))}</td><td>${escapeHtml(String(row.efficiency ?? '--'))}%</td><td>${escapeHtml(row.fuel_type || '--')}</td><td>$${escapeHtml(String(row.capital_cost ?? '--'))}</td></tr>`
                )
                .join('');

            container.innerHTML = `<table class="ggx-data-table"><thead><tr><th>Manufacturer</th><th>Model</th><th>Power kW</th><th>Efficiency</th><th>Fuel</th><th>Capex</th></tr></thead><tbody>${body}</tbody></table>`;
        },

        renderDataNotes() {
            const container = document.getElementById('ggx-data-notes');
            if (!container) return;

            const notes = this.getBucketRows('data');
            const visible = this.getVisibleRows(notes);

            if (!visible.length) container.innerHTML = '<div class="ggx-empty">No aggregated data notes found.</div>';
            else {
                container.innerHTML = visible.map((row) => renderArticleCard(row, { compact: true })).join('');
                this.hydrateArticleMediaForRows(visible);
            }

            this.setLoadMoreVisibility(notes.length);
        },

        async buildEventsRows() {
            const rows = [];
            const pushRow = (row) => {
                if (!row || !row.title) return;
                rows.push(row);
            };

            try {
                const { data, error } = await _supabase.from('events').select('*').order('date', { ascending: false }).limit(36);
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
                // events table may not exist.
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

            this.getBucketRows('events').forEach((item) => {
                pushRow({
                    id: `article-${item.id || item.api_id || getArticleDedupKey(item)}`,
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
                const key = `${toLower(row.title)}|${toLower(row.url)}|${normalizeDay(row.date)}`;
                const current = dedup.get(key);
                if (!current || getTimestamp(row.date) >= getTimestamp(current.date)) {
                    dedup.set(key, row);
                }
            });

            return Array.from(dedup.values()).sort((a, b) => getTimestamp(b.date) - getTimestamp(a.date));
        },

        async renderEventsLayout() {
            this.state.eventsRows = await this.buildEventsRows();
            const rows = this.state.eventsRows;

            const hero = document.getElementById('ggx-events-hero');
            const sourceTags = document.getElementById('ggx-events-source-tags');
            const grid = document.getElementById('ggx-events-grid');

            if (hero) {
                const top = rows[0];
                if (!top) {
                    hero.innerHTML = '<div class="ggx-empty">No timeline records found.</div>';
                } else {
                    hero.innerHTML = `
                        <p class="ggx-page-kicker">Latest Event</p>
                        <h2>${escapeHtml(top.title)}</h2>
                        <p class="ggx-line-clamp-3">${escapeHtml(top.summary || '')}</p>
                        <div class="ggx-meta-row">
                            <span>${escapeHtml(formatDateTime(top.date))}</span>
                            <span>${escapeHtml(top.source || '--')}</span>
                        </div>
                    `;
                }
            }

            if (sourceTags) {
                const groups = countBy(rows, (row) => toLower(row.source) || 'unknown').slice(0, 6);
                sourceTags.innerHTML = `<h3>Source Tags</h3>${renderMiniSignalList(groups, ([source, count]) => `<li><span>${escapeHtml(source)}: ${escapeHtml(String(count))}</span></li>`)}`;
            }

            if (grid) {
                const visible = rows.slice(0, this.state.visibleCount);
                grid.innerHTML = visible.length
                    ? visible
                          .map(
                              (item) =>
                                  `<article class="ggx-card ggx-event-card"><time>${escapeHtml(formatDateTime(item.date))}</time><h3 class="ggx-line-clamp-2">${escapeHtml(item.title || 'Untitled')}</h3><p class="ggx-line-clamp-3">${escapeHtml(item.summary || 'No summary provided.')}</p><div class="ggx-event-actions"><span>${escapeHtml(item.source || '--')} / ${escapeHtml(item.type || '--')}</span><a ${buildLinkAttrs(item.url || '#')}>Open</a></div></article>`
                          )
                          .join('')
                    : '<div class="ggx-empty">No timeline cards available.</div>';
            }

            this.setLoadMoreVisibility(rows.length);
        },
    };
}
