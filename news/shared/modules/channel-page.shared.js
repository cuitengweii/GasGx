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
        colors: ['#6683a3', '#79c3a2', 'red', 'orange'],
        lineIndexes: [2, 3],
    },
    retailer_rates: {
        containerId: 'ggx-chart-retailer-rates',
        seriesOrder: ['Monthly Index', 'Forecast', 'ATCO 5 Year', 'ENCOR 5 Year', 'ENMAX 5 Year'],
        colors: ['red', '#6683a3', 'orange', '#79c3a2', 'purple'],
        lineIndexes: [2, 3, 4],
    },
    aeco_ng_current: {
        containerId: 'ggx-chart-aeco-ng-current',
        seriesOrder: ['Daily Index', 'Monthly Index'],
        colors: ['#6683a3', 'red'],
        lineIndexes: [1],
    },
    aeco_ng_prior: {
        containerId: 'ggx-chart-aeco-ng-prior',
        seriesOrder: ['Daily Index', 'Monthly Index'],
        colors: ['#6683a3', 'red'],
        lineIndexes: [1],
    },
    aeco_c_futures: {
        containerId: 'ggx-chart-aeco-c-futures',
        seriesOrder: ['Current', 'One Year Ago', 'One Month Ago'],
        colors: ['#6683a3', 'orange', 'red'],
        lineIndexes: [1, 2],
    },
};

const CHANNEL_CONFIGS = {
    'gas-energy': {
        navTitle: 'GAS ENERGY',
        layout: 'editorial',
        pageTitle: 'Gas Energy Command',
        pageSubtitle: 'Pipeline volatility, flare capture and dispatch intelligence for power-dense compute operations.',
        feedTitle: 'Energy Dispatch',
        icon: 'fa-fire-flame-curved',
        accent: '#00d7ff',
        accentSoft: 'rgba(0, 215, 255, 0.16)',
        accentGlow: 'rgba(0, 215, 255, 0.35)',
        chips: ['Pipeline', 'Flare Recovery', 'Merchant Power'],
    },
    generators: {
        navTitle: 'GENERATORS',
        layout: 'editorial',
        pageTitle: 'Generator Fleet Monitor',
        pageSubtitle: 'Track turbine and reciprocating engine narratives with operating context from hardware data.',
        feedTitle: 'Fleet Logs',
        icon: 'fa-gears',
        accent: '#ff9f1c',
        accentSoft: 'rgba(255, 159, 28, 0.16)',
        accentGlow: 'rgba(255, 159, 28, 0.35)',
        chips: ['Gas Turbines', 'Recip Engines', 'Maintenance'],
    },
    mining: {
        navTitle: 'MINING',
        layout: 'editorial',
        pageTitle: 'Bitcoin Mining War Room',
        pageSubtitle: 'Hashrate, ASIC cycle and market impact signals focused on energy-backed mining operations.',
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

function toLower(value) {
    return String(value || '').trim().toLowerCase();
}

function containsAny(text, keywords = []) {
    const source = toLower(text);
    return keywords.some((keyword) => source.includes(toLower(keyword)));
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

function cleanSummary(value) {
    if (!value) return '';
    return String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function getArticleUrl(item) {
    if (!item || typeof item !== 'object') return '#';

    const articleId = item.api_id || item.id;
    if (articleId) return `https://www.gasgx.com/news/article/${articleId}`;

    const link = String(item.link || '').trim();
    return link || '#';
}

function getImageUrl(item) {
    if (!item || typeof item !== 'object') return DEFAULT_COVER;

    const articleId = item.api_id || item.id;
    const coverImage = String(item.cover_image || '').trim();
    if (!coverImage || !articleId) return DEFAULT_COVER;

    if (/^https?:\/\//i.test(coverImage)) return coverImage;
    const normalizedCover = coverImage.replace(/^\.?\/*(images\/)?/i, '');
    return `https://www.gasgx.com/news/article/${articleId}/images/${normalizedCover}`;
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

function filterArticlesByChannel(articles, channelKey) {
    if (!Array.isArray(articles)) return [];

    const rule = CHANNEL_RULES[channelKey];
    if (rule && Array.isArray(rule.types) && rule.types.length) {
        const typeMatched = articles.filter((article) => containsAny(article.type, rule.types));
        if (typeMatched.length >= 8) return typeMatched;
        if (channelKey === 'events' && typeMatched.length >= 3) return typeMatched;
    }

    const matched = articles.filter((article) => matchArticleByRule(article, channelKey));
    const minMatched = channelKey === 'data' ? 6 : 10;
    if (matched.length >= minMatched) return matched;

    if (channelKey === 'events') {
        const byType = articles.filter((article) => toLower(article.type).includes('event'));
        if (byType.length >= 3) return byType;
    }

    return articles.slice(0, 32);
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

function renderDataTemplate(config) {
    return `
<section class="ggx-channel-shell">
    <main class="ggx-channel-main">
        <section class="ggx-channel-card ggx-mini-card" id="ggx-data-headline">
            <h3>${escapeHtml(config.pageTitle)}</h3>
            <p class="ggx-mini-caption">${escapeHtml(config.pageSubtitle)}</p>
        </section>

        <section class="ggx-channel-card p-4 mt-4">
            <div class="ggx-section-head">
                <h2><i class="fa-solid fa-leaf"></i> Canada Gas Dashboard</h2>
                <span class="ggx-chip active">Integrated View</span>
            </div>
            <p class="ggx-mini-caption">Combined from the Canada dashboard and News Data terminal for one-page analysis.</p>

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
                    <h2><i class="fa-solid fa-chart-column"></i> Gas Alberta vs Regulated</h2>
                </div>
                <div id="ggx-chart-gas-alberta-vs-regulated" class="ggx-canada-chart"></div>
            </article>
            <article class="ggx-channel-card p-4">
                <div class="ggx-section-head">
                    <h2><i class="fa-solid fa-store"></i> Retailer Rates</h2>
                </div>
                <div id="ggx-chart-retailer-rates" class="ggx-canada-chart"></div>
            </article>
            <article class="ggx-channel-card p-4">
                <div class="ggx-section-head">
                    <h2><i class="fa-solid fa-calendar-day"></i> AECO Current Month</h2>
                </div>
                <div id="ggx-chart-aeco-ng-current" class="ggx-canada-chart"></div>
            </article>
            <article class="ggx-channel-card p-4">
                <div class="ggx-section-head">
                    <h2><i class="fa-solid fa-calendar-minus"></i> AECO Prior Month</h2>
                </div>
                <div id="ggx-chart-aeco-ng-prior" class="ggx-canada-chart"></div>
            </article>
        </section>

        <section class="mt-4">
            <article class="ggx-channel-card p-4">
                <div class="ggx-section-head">
                    <h2><i class="fa-solid fa-chart-line"></i> AECO C Futures Pricing</h2>
                </div>
                <div id="ggx-chart-aeco-c-futures" class="ggx-canada-chart"></div>
            </article>
        </section>

        <section class="mt-4">
            <article class="ggx-channel-card p-4">
                <div class="ggx-section-head">
                    <h2><i class="fa-solid fa-table"></i> Canada Static Tables (Parsed)</h2>
                </div>
                <div id="ggx-canada-static-tables" class="ggx-canada-static-grid"></div>
            </article>
        </section>

        <section class="ggx-data-grid mt-4">
            <div class="ggx-channel-card p-4">
                <div class="ggx-section-head">
                    <h2><i class="fa-solid fa-wave-square"></i> Homepage Metrics</h2>
                </div>
                <div id="ggx-metric-grid" class="ggx-metric-grid"></div>
            </div>

            <div class="ggx-channel-card p-4">
                <div class="ggx-section-head">
                    <h2><i class="fa-solid fa-layer-group"></i> Fuel Mix Snapshot</h2>
                </div>
                <ul id="ggx-fuel-mix" class="ggx-signal-list"></ul>
            </div>
        </section>

        <section class="ggx-data-grid mt-4">
            <div class="ggx-channel-card p-4">
                <div class="ggx-section-head">
                    <h2><i class="fa-solid fa-server"></i> Equipment Data</h2>
                </div>
                <div id="ggx-equipment-table" class="ggx-table-wrap"></div>
            </div>

            <div class="ggx-channel-card p-4">
                <div class="ggx-section-head">
                    <h2><i class="fa-solid fa-file-lines"></i> Data Notes</h2>
                </div>
                <div id="ggx-data-notes" class="ggx-feed-stack"></div>
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

    if (config.layout === 'data') {
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
            canadaStatus: {
                type: 'loading',
                message: 'Fetching Canada dashboard data...',
            },
            canadaResizeBound: false,
            visibleCount: config.layout === 'events' ? 6 : 7,
            pageSize: config.layout === 'events' ? 6 : 6,
            scrollBound: false,
            activeTag: '',
        },

        async init() {
            this.applyTheme();
            await this.initAuth();
            this.renderNav();
            this.loadLiveData();

            const loadTasks = [
                this.loadArticles(),
                this.loadHomepageMetrics(),
                this.loadEquipmentData(),
                this.loadSavedNews(),
            ];
            if (config.layout === 'data') loadTasks.push(this.loadCanadaDashboardData());
            await Promise.allSettled(loadTasks);

            if (config.layout === 'data') this.renderDataLayout();
            else if (config.layout === 'events') this.renderEventsLayout();
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
                const maxRows = config.layout === 'events' ? 599 : 199;
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

        loadMore() {
            this.state.visibleCount += this.state.pageSize;
            if (config.layout === 'events') this.renderEventsCards();
            else if (config.layout === 'editorial') this.renderEditorialFeed();
        },

        renderEditorialLayout() {
            this.renderEditorialHero();
            this.renderEditorialFeed();
            this.renderEditorialAside();
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
            this.renderDataMetrics();
            this.renderFuelMix();
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

            const metrics = this.state.homepageMetrics.slice(0, 8);
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

            const rows = this.state.equipmentData.slice(0, 12);
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

            const notes = this.state.filteredArticles.length ? this.state.filteredArticles : this.state.allArticles;
            const rows = notes.slice(0, 8);
            if (!rows.length) {
                container.innerHTML = '<div class="ggx-empty">No data-related article rows.</div>';
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

        renderCanadaRunSummary() {
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
            runId.textContent = `run_id: ${run.run_id || '--'}`;
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
                seriesConfig[index] = { type: 'line' };
            });

            const options = {
                width: '100%',
                height: 420,
                backgroundColor: 'transparent',
                chartArea: { width: '80%', height: '72%' },
                legend: { position: 'top', textStyle: { color: '#d1d5db', fontSize: 11 } },
                bar: { groupWidth: 24 },
                vAxis: {
                    title: 'CDN$ / GJ',
                    titleTextStyle: { color: '#e5e7eb', bold: true, fontSize: 13 },
                    textStyle: { color: '#9ca3af', fontSize: 11 },
                    gridlines: { color: '#2d2d2d' },
                    format: 'currency',
                },
                hAxis: {
                    slantedText: true,
                    slantedTextAngle: 90,
                    textStyle: { color: '#9ca3af', fontSize: 10 },
                },
                colors: spec.colors,
                seriesType: 'bars',
                series: seriesConfig,
            };

            const chart = new window.google.visualization.ComboChart(container);
            chart.draw(table, options);
        },

        drawCanadaCharts() {
            Object.entries(CANADA_CHART_SPECS).forEach(([chartId, spec]) => {
                const rows = this.state.canadaPointRows.filter((row) => row.chart_id === chartId);
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

        renderCanadaStaticTables() {
            const wrap = document.getElementById('ggx-canada-static-tables');
            if (!wrap) return;

            if (!this.state.canadaTableRows.length) {
                wrap.innerHTML = '<div class="ggx-empty">No parsed Canada static tables in this run.</div>';
                return;
            }

            const preferredOrder = ['intra_alberta_cost_image', 'current_utility_delivery_costs_image'];
            const sorted = [...this.state.canadaTableRows].sort((a, b) => {
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
                        .map((header) => `<th class="px-3 py-2 text-left text-[11px] uppercase tracking-wider text-gray-300 border-b border-white/10">${escapeHtml(header)}</th>`)
                        .join('');
                    const bodyHtml = rows
                        .map((row) => {
                            const isSection = row && typeof row === 'object' && !Array.isArray(row) && row._row_type === 'section';
                            const cellHtml = headers
                                .map((header, index) => {
                                    const raw = this.getCanadaTableCellValue(row, header, index);
                                    const value = isSection && header !== 'Component' ? '' : raw;
                                    const cellClass = isSection && header === 'Component' ? 'ggx-canada-cell ggx-canada-cell-section' : 'ggx-canada-cell';
                                    return `<td class="${cellClass}">${escapeHtml(value)}</td>`;
                                })
                                .join('');
                            return `<tr>${cellHtml}</tr>`;
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
            this.renderCanadaRunSummary();
            this.setCanadaStatus(this.state.canadaStatus.type, this.state.canadaStatus.message);
            this.renderCanadaStaticTables();

            if (!this.state.canadaPointRows.length) return;

            await ensureGoogleChartsLoaded();
            this.drawCanadaCharts();

            if (!this.state.canadaResizeBound) {
                this.state.canadaResizeBound = true;
                let resizeTimer = null;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(() => this.drawCanadaCharts(), 180);
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
