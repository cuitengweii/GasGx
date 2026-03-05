
import { renderSharedAuthState } from '../shared/modules/layout.shared.js';
import { HEADER_NAVIGATION } from '../shared/config/navigation.config.js';

const SUPABASE_URL = 'https://mkpcliytqudclkwtewru.supabase.co';
const SUPABASE_KEY = 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';
const API_BASE = 'https://api.theblockbeats.news/v1/open-api/open-flash';
const FLASH_PROXY_BASES = ['https://corsproxy.io/?', 'https://api.allorigins.win/raw?url='];
const FLASH_FETCH_TIMEOUT_MS = 15000;
const FEED_PAGE_SIZE = 15;
const FEATURED_LIMIT = 10;

const SHARE_URL = 'https://www.gasgx.com/news/flash/';
const DB_NAME = 'GasGxFlashDB';
const DB_VERSION = 1;
const FLASH_FETCH_LIMIT = 120;
const FLASH_PAGE_SIZE = 10;
const FLASH_POLL_INTERVAL_MS = 600000;
const HOME_AD_URL = 'https://www.gasgx.com/';
const HOME_AD_IMAGE = '/news/advertisement/gasgx.png';
const HOME_AD_SEEN_KEY = 'ggx_news_home_popup_ad_seen_v1';

const MAIN_TEMPLATE = `
<section class="ggx-main-module">
    <div id="ggx-toast-container"></div>

    <div id="ggx-poster-modal" class="ggx-modal-overlay">
        <div class="ggx-poster-preview-card bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
            <button onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.closePosterModal()" class="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-gray-400 hover:text-white hover:bg-black/80 transition-all" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="p-6 pb-4 border-b border-white/5 bg-[#111] z-10 relative">
                <h3 class="text-white font-bold text-lg uppercase tracking-wider text-center"><span class="text-gas-green">Share</span> Poster</h3>
            </div>
            <div id="ggx-generated-poster-container" class="w-full relative min-h-[300px] bg-[#050505] flex items-center justify-center">
                <i class="fa-solid fa-circle-notch fa-spin text-gas-green text-2xl"></i>
            </div>
            <div class="p-5 border-t border-white/10 bg-[#111] z-10 relative">
                <button onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.downloadGeneratedPoster()" class="w-full bg-gas-green text-black font-bold py-3 rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2 uppercase tracking-widest shadow-neon">
                    <i class="fa-solid fa-download"></i> Download Image
                </button>
            </div>
        </div>
    </div>

    <div id="ggx-home-ad-modal" class="ggx-modal-overlay" aria-hidden="true">
        <div class="ggx-home-ad-card bg-[#0b0b0b] border border-white/15 rounded-2xl shadow-2xl overflow-hidden relative">
            <button onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.closeHomeAdModal()" class="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-gray-400 hover:text-white hover:bg-black/85 transition-all" aria-label="Close popup ad">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <a href="${HOME_AD_URL}" target="_blank" rel="noopener noreferrer" class="block group" onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.closeHomeAdModal()">
                <img src="${HOME_AD_IMAGE}" alt="GasGx Ad" loading="lazy" class="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" onerror="this.src='/news/advertisement/zhanwei.jpg'">
            </a>
        </div>
    </div>

    <main class="flex-grow w-full max-w-[1600px] mx-auto px-4 lg:px-6 py-8 pb-8">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8 h-auto lg:h-[520px]" id="ggx-hero-grid-container">
            <div class="lg:col-span-2 lg:row-span-2 bg-[#111] animate-pulse rounded-xl h-64 lg:h-auto border border-white/5 flex items-center justify-center text-gray-700 text-xs">Loading Hero...</div>
            <div class="lg:col-span-1 lg:row-span-1 bg-[#111] animate-pulse rounded-xl h-32 lg:h-auto border border-white/5"></div>
            <div class="lg:col-span-1 lg:row-span-1 bg-[#111] animate-pulse rounded-xl h-32 lg:h-auto border border-white/5"></div>
            <div class="lg:col-span-2 lg:row-span-1 bg-[#111] animate-pulse rounded-xl h-32 lg:h-auto border border-white/5"></div>
        </div>

        <div class="mb-10">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2 px-1">
                <i class="fa-solid fa-ranking-star text-gas-green"></i>
                <span>Featured Picks</span>
            </h3>
            <div id="ggx-featured-grid-container" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div class="bg-[#111] h-36 rounded-xl animate-pulse border border-white/5"></div>
            </div>
        </div>

        <div class="mb-12">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2 px-1">
                <i class="fa-solid fa-wave-square text-gas-green"></i>
                <span>Market Pulse</span>
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="ggx-market-pulse-container">
                <div class="bg-[#111] h-24 rounded-xl animate-pulse"></div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div class="lg:col-span-8 flex flex-col gap-6">
                <div class="flex items-center gap-6 border-b border-white/10 mb-2 sticky top-16 bg-[#050505]/95 backdrop-blur z-30 pt-4 overflow-x-auto">
                    <button onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.switchTab('latest')" id="ggx-tab-btn-latest" class="ggx-tab-btn text-sm uppercase tracking-wider font-bold pb-3 border-b-2 border-gas-green text-white whitespace-nowrap">LATEST</button>
                    <button onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.switchTab('hardware')" id="ggx-tab-btn-hardware" class="ggx-tab-btn text-sm uppercase tracking-wider font-medium pb-3 border-b-2 border-transparent text-gray-400 hover:text-white transition-colors whitespace-nowrap">HARDWARE</button>
                    <button onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.switchTab('policy')" id="ggx-tab-btn-policy" class="ggx-tab-btn text-sm uppercase tracking-wider font-medium pb-3 border-b-2 border-transparent text-gray-400 hover:text-white transition-colors whitespace-nowrap">POLICY</button>
                    <button onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.switchTab('finance')" id="ggx-tab-btn-finance" class="ggx-tab-btn text-sm uppercase tracking-wider font-medium pb-3 border-b-2 border-transparent text-gray-400 hover:text-white transition-colors whitespace-nowrap">FINANCE</button>
                </div>

                <div id="ggx-news-feed-container" class="space-y-4 min-h-[300px]">
                    <div class="text-center text-gray-500 py-10"><i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Loading Articles...</div>
                </div>

                <div id="ggx-load-more-container" class="mt-8 text-center pb-8">
                    <button id="ggx-load-more-btn" onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.loadMore()" class="px-8 py-3 rounded-full border border-white/10 text-xs font-bold text-white hover:bg-white hover:text-black transition-all uppercase tracking-wide">Load More</button>
                    <div id="ggx-load-more-spinner" class="hidden text-gas-green"><i class="fa-solid fa-circle-notch fa-spin"></i></div>
                </div>
            </div>

            <div class="lg:col-span-4 pl-0 lg:pl-6 space-y-6 flex flex-col self-start h-fit">
                <div class="grid grid-cols-2 gap-3">
                    <a href="#" class="ggx-tech-card ggx-sidebar-card rounded-lg p-4 flex flex-col items-center justify-center gap-2 group hover:bg-[#151515]">
                        <i class="fa-solid fa-server text-xl text-gray-500 group-hover:text-gas-green transition-colors"></i><span class="text-xs font-bold text-white">Miners</span>
                    </a>
                    <a href="#" class="ggx-tech-card ggx-sidebar-card rounded-lg p-4 flex flex-col items-center justify-center gap-2 group hover:bg-[#151515]">
                        <i class="fa-solid fa-fan text-xl text-gray-500 group-hover:text-gas-green transition-colors"></i><span class="text-xs font-bold text-white">Generators</span>
                    </a>
                </div>

                <section class="ggx-tech-card rounded-xl p-4 lg:p-5">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <i class="fa-solid fa-bolt text-gas-green"></i>
                            Flash 7x24
                        </h3>
                        <button onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.forceRefreshFlash()" class="w-7 h-7 rounded-full border border-white/10 text-gray-400 hover:text-gas-green hover:border-gas-green/40 transition-colors" title="Refresh flash">
                            <i id="ggx-flash-sync-icon" class="fa-solid fa-rotate-right text-xs"></i>
                        </button>
                    </div>
                    <div id="ggx-flash-news-container" class="relative pl-6 space-y-4 min-h-[120px]">
                        <div class="absolute left-[7px] top-2 bottom-0 w-[1px] bg-white/10"></div>
                        <div class="text-gray-500 text-xs p-4">Loading flash news...</div>
                    </div>
                    <div id="ggx-flash-load-more-wrap" class="pt-3 mt-3 border-t border-white/10 text-center">
                        <button id="ggx-flash-load-more-btn" onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.loadMoreFlash()" class="px-4 py-2 rounded-full border border-white/10 text-[10px] font-bold text-white/90 hover:border-gas-green/50 hover:text-gas-green transition-all uppercase tracking-wide">Load More</button>
                    </div>
                </section>

            </div>
        </div>
    </main>

    <button id="ggx-back-to-top-btn" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })" class="fixed right-6 bottom-24 w-10 h-10 bg-[#111] border border-gas-green text-gas-green rounded-full flex items-center justify-center z-40 hover:scale-110 transition-all duration-300 shadow-neon group opacity-0 pointer-events-none" aria-label="Back to Top">
        <i class="fa-solid fa-arrow-up group-hover:-translate-y-0.5 transition-transform"></i>
    </button>

    <div id="ggx-poster-capture-area" class="ggx-poster-bg" style="position: absolute; top: -9999px; left: -9999px; width: 450px; padding: 0; display: flex; flex-direction: column; text-align: left; overflow: hidden;">
        <div class="w-full flex justify-between items-center px-8 py-6 border-b border-white/10 bg-[#080808] relative overflow-hidden h-32">
            <div class="absolute top-0 right-0 w-40 h-40 bg-gas-green/10 blur-[50px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
            <div class="flex flex-col justify-center h-full z-10 gap-3">
                <div class="flex items-end gap-3 leading-none">
                    <span class="text-3xl font-header italic font-bold text-white tracking-tighter mb-1">GasGx</span>
                    <span class="text-6xl font-header font-black text-gas-green tracking-tight leading-none drop-shadow-lg">NEWS</span>
                </div>
                <div class="flex items-center gap-2"><span class="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] pl-1">MINING INTELLIGENCE</span></div>
            </div>
            <div class="z-10 bg-[#111] border border-white/20 px-4 py-2 rounded-full flex items-center justify-center shadow-lg"><span class="text-xs font-black text-gas-green tracking-widest">7x24 FLASH</span></div>
        </div>
        <div class="p-8 flex-1 flex flex-col items-start text-left relative z-10">
            <div class="inline-flex items-center justify-center bg-gas-green/10 border border-gas-green/20 rounded-full px-4 py-1.5 mb-6">
                <div class="text-gas-green font-mono text-xs font-bold flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-gas-green animate-pulse"></span><span id="ggx-poster-time-text"></span></div>
            </div>
            <h2 id="ggx-poster-title" class="text-2xl font-bold text-white leading-tight mb-5 font-sans text-left tracking-tight"></h2>
            <p id="ggx-poster-text" class="text-[#d0d0d0] text-[15px] leading-relaxed font-sans text-justify"></p>
        </div>
        <div class="w-full p-8 bg-[#050505] border-t border-white/10 flex justify-between items-end relative">
            <div class="flex flex-col gap-1 max-w-[65%]">
                <span class="text-gas-green font-header font-bold text-xl leading-none uppercase">Make Natural Gas-Powered</span>
                <span class="text-white font-header font-bold text-xl leading-none uppercase">Mining Easier</span>
                <span class="text-[9px] text-gray-600 mt-2 tracking-widest font-mono">POWERED BY GASGX INTELLIGENCE</span>
            </div>
            <div class="relative bg-white p-2 rounded-xl shadow-xl shadow-gas-green/10 flex items-center justify-center">
                <div id="ggx-poster-qrcode" class="flex items-center justify-center"></div>
            </div>
        </div>
    </div>
</section>`;

const dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('news')) db.createObjectStore('news', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('translations')) db.createObjectStore('translations', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
});

const DB = {
    async put(storeName, data) {
        const db = await dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            if (Array.isArray(data)) data.forEach((item) => store.put(item));
            else store.put(data);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },
    async getAll(storeName) {
        const db = await dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },
    async get(storeName, key) {
        const db = await dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },
};

export function mountNewsMain(container) {
    if (!container) return;
    container.innerHTML = MAIN_TEMPLATE;
}

export function createNewsHomeApp() {
    const { createClient } = supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    return {
        state: {
            currentCategory: 'latest',
            currentOffset: 0,
            isLoading: false,
            flashData: [],
            translations: {},
            generatedPosterUrl: null,
            currentUser: null,
            displayName: null,
            currentPosterData: { title: '', content: '', time: '' },
            flashVisibleCount: FLASH_PAGE_SIZE,
            flashPollTimer: null,
            flashVisibilityHandler: null,
            lastFlashAutoFetchAt: 0,
            articleCoverCache: {},
            articleCoverLoading: {},
            articleCoverIsVideo: {},
            feedRenderedKeys: new Set(),
            feedRequestToken: 0,
        },

        async init() {
            await this.initAuth();
            this.renderNav();
            this.loadHero();
            this.loadMarketPulse();
            this.loadLiveData();
            this.loadFeed('latest', true);

            if (document.getElementById('ggx-flash-news-container')) {
                await this.loadFlashFromDB();
                this.fetchAndMergeFlash();
                this.state.lastFlashAutoFetchAt = Date.now();
                if (this.state.flashPollTimer) clearInterval(this.state.flashPollTimer);
                this.state.flashPollTimer = setInterval(() => {
                    if (!document.hidden && this.shouldRunFlashAutoFetch()) this.fetchAndMergeFlash(true);
                }, FLASH_POLL_INTERVAL_MS);

                if (this.state.flashVisibilityHandler) {
                    document.removeEventListener('visibilitychange', this.state.flashVisibilityHandler);
                }
                this.state.flashVisibilityHandler = () => {
                    if (!document.hidden && this.shouldRunFlashAutoFetch()) this.fetchAndMergeFlash(true);
                };
                document.addEventListener('visibilitychange', this.state.flashVisibilityHandler);
            }

            const posterModal = document.getElementById('ggx-poster-modal');
            if (posterModal) {
                posterModal.addEventListener('click', (e) => {
                    if (e.target === posterModal) this.closePosterModal();
                });
            }

            const homeAdModal = document.getElementById('ggx-home-ad-modal');
            if (homeAdModal) {
                homeAdModal.addEventListener('click', (e) => {
                    if (e.target === homeAdModal) this.closeHomeAdModal();
                });
            }

            this.maybeShowHomeAdForNewUser();

            window.addEventListener('scroll', () => {
                const btn = document.getElementById('ggx-back-to-top-btn');
                if (btn) btn.classList.toggle('opacity-0', window.scrollY <= 300);
                if (btn) btn.classList.toggle('pointer-events-none', window.scrollY <= 300);
            });
        },

        async initAuth() {
            try {
                const {
                    data: { session },
                } = await _supabase.auth.getSession();

                if (session) {
                    this.state.currentUser = session.user;
                    const meta = session.user.user_metadata || {};
                    this.state.displayName = meta.full_name || session.user.email.split('@')[0];
                    this.fetchProfile(session.user.id);
                }

                _supabase.auth.onAuthStateChange((event, sessionValue) => {
                    this.state.currentUser = sessionValue ? sessionValue.user : null;
                    if (sessionValue) {
                        const meta = sessionValue.user.user_metadata || {};
                        this.state.displayName = meta.full_name || sessionValue.user.email.split('@')[0];
                        this.fetchProfile(sessionValue.user.id);
                    } else {
                        this.state.displayName = null;
                    }
                    this.renderNav();
                });
            } catch (e) {
                console.error('Auth check failed:', e);
            }
        },

        async fetchProfile(userId) {
            try {
                const { data: profile } = await _supabase.from('profiles').select('full_name').eq('id', userId).single();
                if (profile && profile.full_name) {
                    this.state.displayName = profile.full_name;
                    this.renderNav();
                }
            } catch (e) {
                console.log('Profile fetch warning:', e);
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
                signInUrl: '/news/flash/account.html',
                activeTitle: 'HOME',
            });
        },

        toggleMobileMenu() {
            const menu = document.getElementById('ggx-mobile-menu-container');
            const overlay = document.getElementById('ggx-mobile-menu-overlay');
            if (!menu || !overlay) return;
            const isHidden = menu.classList.contains('translate-x-full');
            if (isHidden) {
                menu.classList.remove('translate-x-full');
                overlay.classList.remove('hidden');
            } else {
                menu.classList.add('translate-x-full');
                overlay.classList.add('hidden');
            }
        },

        showToast(message, type = 'success') {
            const container = document.getElementById('ggx-toast-container');
            if (!container) return;
            const toast = document.createElement('div');
            toast.className = 'ggx-toast';
            const icon = type === 'success' ? 'fa-circle-check' : 'fa-info-circle';
            const colorClass = type === 'success' ? 'text-gas-green' : 'text-blue-400';
            toast.innerHTML = `<i class="fa-solid ${icon} ${colorClass}"></i> <span>${message}</span>`;
            container.appendChild(toast);
            toast.offsetHeight;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        },

        hasSeenHomeAd() {
            try {
                return localStorage.getItem(HOME_AD_SEEN_KEY) === '1';
            } catch {
                return false;
            }
        },

        markHomeAdSeen() {
            try {
                localStorage.setItem(HOME_AD_SEEN_KEY, '1');
            } catch {
                // ignore storage errors
            }
        },

        maybeShowHomeAdForNewUser() {
            if (this.hasSeenHomeAd()) return;
            const modal = document.getElementById('ggx-home-ad-modal');
            if (!modal) return;
            this.markHomeAdSeen();
            setTimeout(() => {
                modal.classList.add('active');
                modal.setAttribute('aria-hidden', 'false');
            }, 400);
        },

        closeHomeAdModal() {
            const modal = document.getElementById('ggx-home-ad-modal');
            if (!modal) return;
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        },

        async loadFlashFromDB() {
            try {
                const items = await DB.getAll('news');
                const trans = await DB.getAll('translations');
                if (items.length > 0) {
                    this.state.flashData = items
                        .map((item) => ({ ...item, time: new Date(item.timestamp) }))
                        .sort((a, b) => b.time - a.time);
                }
                if (trans.length > 0) {
                    trans.forEach((t) => {
                        this.state.translations[t.id] = t;
                    });
                }
                this.renderFlashSidebar();
            } catch (e) {
                console.error('DB Load Error:', e);
            }
        },

        shouldRunFlashAutoFetch() {
            return Date.now() - this.state.lastFlashAutoFetchAt >= FLASH_POLL_INTERVAL_MS;
        },

        async fetchAndMergeFlash(isAuto = false) {
            if (isAuto) this.state.lastFlashAutoFetchAt = Date.now();
            try {
                const normalized = await this.fetchFlashApiItems('en');

                if (normalized.length > 0) {
                    const existingIds = new Set(this.state.flashData.map((n) => String(n.id)));
                    const freshCount = normalized.filter((item) => !existingIds.has(String(item.id))).length;

                    this.state.flashData = normalized;
                    const dbItems = normalized.map((item) => ({
                        id: item.id,
                        title: item.title,
                        content: item.content,
                        link: item.link,
                        timestamp: item.time.getTime(),
                    }));
                    await DB.put('news', dbItems);

                    if (!isAuto) {
                        if (freshCount > 0) this.showToast(`Synced ${freshCount} new flash stories.`);
                        else this.showToast('Flash feed is up to date.');
                    }
                }
                this.renderFlashSidebar();
            } catch (e) {
                console.error('Fetch Error:', e);
            }
        },

        getFlashApiUrl(lang = 'en') {
            const params = new URLSearchParams({ size: '20', page: '1', lang });
            return `${API_BASE}?${params.toString()}`;
        },

        getFlashRequestCandidates(lang = 'en') {
            const originUrl = this.getFlashApiUrl(lang);
            const proxies = [...FLASH_PROXY_BASES];
            for (let i = proxies.length - 1; i > 0; i -= 1) {
                const j = Math.floor(Math.random() * (i + 1));
                [proxies[i], proxies[j]] = [proxies[j], proxies[i]];
            }
            return [originUrl, ...proxies.map((proxyBase) => `${proxyBase}${encodeURIComponent(originUrl)}`)];
        },

        async fetchFlashApiItems(lang = 'en') {
            const candidates = this.getFlashRequestCandidates(lang);
            let lastError = null;

            for (const candidateUrl of candidates) {
                let timeoutId = null;
                try {
                    const controller = new AbortController();
                    timeoutId = setTimeout(() => controller.abort(), FLASH_FETCH_TIMEOUT_MS);
                    const response = await fetch(candidateUrl, {
                        method: 'GET',
                        headers: { Accept: 'application/json' },
                        credentials: 'omit',
                        cache: 'default',
                        signal: controller.signal,
                    });
                    clearTimeout(timeoutId);

                    if (!response.ok) throw new Error(`HTTP ${response.status}`);

                    const text = await response.text();
                    const json = this.safeParseJson(text);
                    if (!json) throw new Error('Invalid JSON payload');

                    const parsed = this.parseFlashApiData(json);
                    if (parsed.length === 0) throw new Error('No flash records in payload');
                    return parsed;
                } catch (error) {
                    lastError = error;
                } finally {
                    if (timeoutId) clearTimeout(timeoutId);
                }
            }

            throw lastError || new Error('Flash API and proxy fallbacks all failed');
        },

        safeParseJson(text) {
            try {
                return JSON.parse(text);
            } catch {
                return null;
            }
        },

        cleanContent(htmlString) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlString;
            const images = tempDiv.getElementsByTagName('img');
            while (images.length > 0) images[0].parentNode.removeChild(images[0]);
            return (tempDiv.textContent || tempDiv.innerText || '').trim();
        },

        parseFlashApiData(jsonRes) {
            let data = jsonRes;
            if (jsonRes && typeof jsonRes.contents === 'string') {
                try {
                    data = JSON.parse(jsonRes.contents);
                } catch {
                    return [];
                }
            }

            if (!data || !data.data || !Array.isArray(data.data.data)) return [];

            return data.data.data
                .slice(0, FLASH_FETCH_LIMIT)
                .map((item) => {
                    const createTime = Number.parseInt(item.create_time, 10);
                    const title = String(item.title || '').trim();
                    const content = this.cleanContent(String(item.content || ''));
                    const link = String(item.link || '').trim();
                    const id = item.id || link || `${title}-${createTime || Date.now()}`;
                    const time = Number.isFinite(createTime) ? new Date(createTime * 1000) : new Date();
                    return {
                        id: String(id),
                        title: title || 'Untitled',
                        content: content || '',
                        link: link || '#',
                        time,
                    };
                })
                .filter((item) => item.id && item.title);
        },

        forceRefreshFlash() {
            const icon = document.getElementById('ggx-flash-sync-icon');
            if (icon) icon.classList.add('fa-spin');
            this.fetchAndMergeFlash().finally(() => {
                if (icon) setTimeout(() => icon.classList.remove('fa-spin'), 1000);
            });
        },

        async typeWriter(element, text) {
            const currentHeight = element.offsetHeight;
            element.style.minHeight = `${currentHeight}px`;

            element.innerHTML = '<span class="thinking-circle"></span>';
            await new Promise((r) => setTimeout(r, 600));

            element.innerHTML = '';
            element.classList.add('typing');

            const chunkSize = 4;
            let i = 0;

            return new Promise((resolve) => {
                const type = () => {
                    if (i < text.length) {
                        element.textContent += text.substring(i, i + chunkSize);
                        i += chunkSize;
                        requestAnimationFrame(type);
                    } else {
                        element.classList.remove('typing');
                        element.style.minHeight = '';
                        resolve();
                    }
                };
                type();
            });
        },

        renderFlashSidebar() {
            const container = document.getElementById('ggx-flash-news-container');
            if (!container) return;
            const loadMoreWrap = document.getElementById('ggx-flash-load-more-wrap');
            const loadMoreBtn = document.getElementById('ggx-flash-load-more-btn');

            const dataToShow = this.state.flashData.slice(0, this.state.flashVisibleCount);
            if (dataToShow.length === 0) {
                container.innerHTML = '<div class="absolute left-[7px] top-2 bottom-0 w-[1px] bg-white/10"></div><div class="text-gray-500 text-xs p-4">No flash news.</div>';
                if (loadMoreWrap) loadMoreWrap.style.display = 'none';
                return;
            }

            const html = dataToShow
                .map((item, idx) => {
                    const timeStr = item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                    const isLong = item.content.length > 150;

                    return `
                    <div class="relative group pl-2" id="flash-${item.id}">
                        <div class="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-gas-green shadow-neon' : 'bg-gray-700 group-hover:bg-gas-green transition-colors'}"></div>
                        <div class="text-gas-green font-mono font-bold text-xs mb-1">${timeStr}</div>
                        <h4 id="title-${item.id}" class="text-white font-bold text-sm leading-tight mb-2 group-hover:text-gas-green transition-colors cursor-pointer" onclick="window.open('${item.link}', '_blank')">${item.title}</h4>

                        <div id="content-${item.id}" class="text-gray-400 text-xs leading-relaxed mb-3 text-justify break-words line-clamp-3 transition-all">${item.content}</div>

                        <div class="flex items-center justify-between border-t border-white/5 pt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            <div class="flex items-center gap-3">
                                <button type="button" id="btn-expand-${item.id}" onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.toggleExpand('${item.id}')" class="relative z-10 text-[10px] font-bold text-gas-green hover:text-white uppercase tracking-wider ${isLong ? '' : 'hidden'}">SHOW MORE</button>
                                <button type="button" id="btn-trans-${item.id}" onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.translateItem('${item.id}')" class="relative z-10 bg-[#222] hover:bg-[#333] text-gray-400 hover:text-white px-1.5 py-0.5 rounded transition-colors" title="Translate">
                                    <i class="fa-solid fa-language text-xs"></i>
                                </button>
                            </div>
                            <div class="flex items-center gap-3 text-gray-500">
                                <button type="button" onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.openPosterModal('${item.id}')" class="relative z-10 hover:text-gas-green transition-colors" title="Generate poster"><i class="fa-solid fa-camera text-xs"></i></button>
                                <button type="button" onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.shareX('${item.id}')" class="relative z-10 hover:text-white transition-colors" title="Share to X"><i class="fa-brands fa-x-twitter text-xs"></i></button>
                                <button type="button" onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.shareLinkedIn('${item.id}')" class="relative z-10 hover:text-[#0077B5] transition-colors" title="Share to LinkedIn"><i class="fa-brands fa-linkedin text-xs"></i></button>
                            </div>
                        </div>
                    </div>`;
                })
                .join('');

            container.innerHTML = `<div class="absolute left-[7px] top-2 bottom-0 w-[1px] bg-white/10"></div>${html}`;
            const canLoadMore = this.state.flashData.length > dataToShow.length;
            if (loadMoreWrap) loadMoreWrap.style.display = canLoadMore ? 'block' : 'none';
            if (loadMoreBtn) loadMoreBtn.disabled = !canLoadMore;
        },

        loadMoreFlash() {
            this.state.flashVisibleCount += FLASH_PAGE_SIZE;
            this.renderFlashSidebar();
        },

        toggleExpand(id) {
            const contentEl = document.getElementById(`content-${id}`);
            const btn = document.getElementById(`btn-expand-${id}`);
            if (!contentEl || !btn) return;
            if (contentEl.classList.contains('line-clamp-3')) {
                contentEl.classList.remove('line-clamp-3');
                btn.innerText = 'SHOW LESS';
            } else {
                contentEl.classList.add('line-clamp-3');
                btn.innerText = 'SHOW MORE';
            }
        },

        async translateItem(id) {
            const item = this.state.flashData.find((i) => i.id === id || String(i.id) === String(id));
            if (!item) return;
            const titleEl = document.getElementById(`title-${id}`);
            const contentEl = document.getElementById(`content-${id}`);
            const btnIcon = document.querySelector(`#btn-trans-${id} i`);
            if (!titleEl || !contentEl || !btnIcon) return;

            if (titleEl.dataset.translated === 'true') {
                titleEl.innerText = item.title;
                contentEl.innerText = item.content;
                titleEl.dataset.translated = 'false';
                btnIcon.classList.remove('text-gas-green');
                return;
            }

            btnIcon.className = 'fa-solid fa-circle-notch fa-spin text-gas-green text-xs';

            const cachedTrans = this.state.translations[id] || (await DB.get('translations', id));
            if (cachedTrans) {
                this.applyTranslation(id, cachedTrans);
                return;
            }

            try {
                const translateText = async (text) => {
                    const chunks = text.match(/[\s\S]{1,450}/g) || [];
                    const translatedChunks = await Promise.all(
                        chunks.map(async (chunk) => {
                            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|zh-CN`);
                            const data = await res.json();
                            return data.responseData.translatedText;
                        })
                    );
                    return translatedChunks.join('');
                };

                const [transTitle, transContent] = await Promise.all([translateText(item.title), translateText(item.content)]);
                const transObj = { id, title: transTitle, content: transContent };
                await DB.put('translations', transObj);
                this.state.translations[id] = transObj;
                this.applyTranslation(id, transObj);
            } catch (e) {
                console.error('Translation fetch error:', e);
                this.showToast('Translation error', 'error');
                btnIcon.className = 'fa-solid fa-language text-xs';
            }
        },

        async applyTranslation(id, trans) {
            const titleEl = document.getElementById(`title-${id}`);
            const contentEl = document.getElementById(`content-${id}`);
            const btnIcon = document.querySelector(`#btn-trans-${id} i`);
            if (!titleEl || !contentEl || !btnIcon) return;

            titleEl.dataset.translated = 'true';
            btnIcon.className = 'fa-solid fa-language text-gas-green text-xs';

            await this.typeWriter(titleEl, trans.title);
            this.typeWriter(contentEl, trans.content);
        },
        async openPosterModal(id) {
            const item = this.state.flashData.find((i) => i.id === id || String(i.id) === String(id));
            if (!item) return;

            const titleText = document.getElementById(`title-${id}`)?.innerText || '';
            const contentText = document.getElementById(`content-${id}`)?.innerText || '';

            this.state.currentPosterData = {
                title: titleText,
                content: contentText,
                time: item.time.toLocaleString(),
            };

            const modal = document.getElementById('ggx-poster-modal');
            if (modal) modal.classList.add('active');
            const generatedContainer = document.getElementById('ggx-generated-poster-container');
            if (generatedContainer) {
                generatedContainer.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-gas-green text-2xl"></i>';
            }

            const posterTime = document.getElementById('ggx-poster-time-text');
            const posterTitle = document.getElementById('ggx-poster-title');
            const posterText = document.getElementById('ggx-poster-text');

            if (posterTime) {
                posterTime.innerText = `${item.time.toLocaleDateString()} ${item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
            }
            if (posterTitle) posterTitle.innerText = titleText;
            if (posterText) posterText.innerText = contentText;

            const qrContainer = document.getElementById('ggx-poster-qrcode');
            if (!qrContainer) return;
            qrContainer.innerHTML = '';
            if (typeof QRCode === 'function') {
                new QRCode(qrContainer, {
                    text: SHARE_URL,
                    width: 80,
                    height: 80,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.M,
                });
            } else {
                qrContainer.innerHTML = '<span class="text-[10px] text-black font-bold">QR</span>';
            }

            await new Promise((r) => setTimeout(r, 500));

            try {
                if (typeof html2canvas !== 'function') throw new Error('html2canvas unavailable');
                const captureEl = document.getElementById('ggx-poster-capture-area');
                if (!captureEl) throw new Error('poster capture container missing');
                const canvas = await html2canvas(captureEl, {
                    backgroundColor: null,
                    scale: 2,
                    logging: false,
                    useCORS: true,
                });
                this.state.generatedPosterUrl = canvas.toDataURL('image/png');
                const img = new Image();
                img.src = this.state.generatedPosterUrl;
                img.className = 'w-full h-auto block';
                if (generatedContainer) {
                    generatedContainer.innerHTML = '';
                    generatedContainer.appendChild(img);
                }
            } catch (e) {
                console.error('Canvas error:', e);
                if (generatedContainer) {
                    generatedContainer.innerHTML = '<div class="text-center text-gray-400 text-sm p-8">Poster preview is temporarily unavailable.</div>';
                }
                this.showToast('Poster generation is currently unavailable.', 'info');
            }
        },

        closePosterModal() {
            document.getElementById('ggx-poster-modal')?.classList.remove('active');
        },

        downloadGeneratedPoster() {
            if (!this.state.generatedPosterUrl) return;
            const link = document.createElement('a');
            link.download = `GasGx-Flash-${Date.now()}.png`;
            link.href = this.state.generatedPosterUrl;
            link.click();
        },

        shareX(id) {
            const title = document.getElementById(`title-${id}`)?.innerText || '';
            const text = `From GasGx News\n"${title}"\n${SHARE_URL}\n#GasGx #Mining`;
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
        },

        async shareLinkedIn(id) {
            const item = this.state.flashData.find((i) => i.id === id || String(i.id) === String(id));
            const title = document.getElementById(`title-${id}`)?.innerText || item?.title || '';
            const content = document.getElementById(`content-${id}`)?.innerText || item?.content || '';
            const shareUrl = String(item?.link || '').trim() || SHARE_URL;
            const text = `GasGx News Report\n\n"${title}"\n\n${content}\n\nLink: ${shareUrl}`;
            const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(text);
                    this.showToast('Copied text. Opening LinkedIn share...', 'success');
                } else {
                    this.showToast('Opening LinkedIn share...', 'info');
                }
            } catch (e) {
                console.warn('Clipboard unavailable:', e);
                this.showToast('Opening LinkedIn share...', 'info');
            }

            window.open(linkedInShareUrl, '_blank', 'noopener,noreferrer');
        },

        getImageUrl(item) {
            return this.getImageMeta(item).url;
        },

        getImageMeta(item) {
            const placeholder = 'https://www.gasgx.com/news/advertisement/zhanwei.jpg';
            if (!item) return { url: placeholder, isVideoCover: false };

            const articleId = item.app_id || item.api_id || item.id;
            const coverImage = (item.cover_image || '').toString().trim();
            if (coverImage) return { url: this.resolveArticleMediaUrl(articleId, coverImage, placeholder), isVideoCover: false };

            const inlineCoverMeta = this.getInlineCoverMeta(item, articleId);
            if (inlineCoverMeta.url) return inlineCoverMeta;

            if (articleId) {
                const key = String(articleId);
                if (this.state.articleCoverCache[key]) {
                    return {
                        url: this.state.articleCoverCache[key],
                        isVideoCover: !!this.state.articleCoverIsVideo[key],
                    };
                }
                this.loadArticleCoverFromDetailPage(articleId);
            }

            return { url: placeholder, isVideoCover: false };
        },

        resolveArticleMediaUrl(articleId, mediaPath, fallback = '') {
            const path = String(mediaPath || '').trim();
            if (!path) return fallback;
            if (/^https?:\/\//i.test(path)) return path;

            const normalized = path.replace(/^\.?\/*(images\/)?/i, '');
            if (articleId) return `https://www.gasgx.com/news/article/${articleId}/images/${normalized}`;
            return path.startsWith('/') ? path : `/${normalized}`;
        },

        getInlineCoverMeta(item, articleId) {
            if (!item || typeof item !== 'object') return { url: '', isVideoCover: false };

            const videoFields = [
                'video_cover',
                'video_cover_image',
                'video_poster',
                'video_thumbnail',
            ];
            for (const field of videoFields) {
                const value = String(item[field] || '').trim();
                if (value) return { url: this.resolveArticleMediaUrl(articleId, value, ''), isVideoCover: true };
            }

            const genericFields = ['thumbnail', 'thumb', 'poster'];
            for (const field of genericFields) {
                const value = String(item[field] || '').trim();
                if (value) return { url: this.resolveArticleMediaUrl(articleId, value, ''), isVideoCover: false };
            }

            const link = String(item.link || '').trim();
            if (/\.(avif|webp|png|jpe?g|gif)(\?.*)?$/i.test(link)) return { url: link, isVideoCover: false };
            return { url: '', isVideoCover: false };
        },

        extractCoverFromArticleHtml(html, articleUrl) {
            if (!html) return { url: '', isVideoCover: false };
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                const videoPoster = doc.querySelector('video[poster]')?.getAttribute('poster');
                if (videoPoster) return { url: new URL(videoPoster, articleUrl).href, isVideoCover: true };

                const contentImage = doc.querySelector('.article-content img')?.getAttribute('src');
                if (contentImage) return { url: new URL(contentImage, articleUrl).href, isVideoCover: false };
            } catch (error) {
                console.warn('Failed to extract article cover from detail page:', error);
            }
            return { url: '', isVideoCover: false };
        },

        async loadArticleCoverFromDetailPage(articleId) {
            const key = String(articleId || '').trim();
            if (!key) return;
            if (this.state.articleCoverCache[key] || this.state.articleCoverLoading[key]) return;

            this.state.articleCoverLoading[key] = true;
            try {
                const articleUrl = this.getArticleUrl({ app_id: key });
                const response = await fetch(articleUrl, { cache: 'force-cache' });
                if (!response.ok) return;

                const html = await response.text();
                const coverMeta = this.extractCoverFromArticleHtml(html, articleUrl);
                if (!coverMeta.url) return;

                this.state.articleCoverCache[key] = coverMeta.url;
                this.state.articleCoverIsVideo[key] = !!coverMeta.isVideoCover;
                this.updateArticleImages(key, coverMeta.url, !!coverMeta.isVideoCover);
            } catch (error) {
                console.warn(`Failed to load fallback cover for article ${key}:`, error);
            } finally {
                delete this.state.articleCoverLoading[key];
            }
        },

        updateArticleImages(articleId, imageUrl, isVideoCover = false) {
            if (!imageUrl) return;
            const targetId = String(articleId);
            document.querySelectorAll('img[data-article-id]').forEach((img) => {
                if (img.dataset.articleId === targetId) {
                    img.src = imageUrl;
                    img.dataset.videoCover = isVideoCover ? '1' : '0';
                }
            });
            document.querySelectorAll(`[data-video-badge-id="${targetId}"]`).forEach((badge) => {
                badge.classList.toggle('hidden', !isVideoCover);
            });
        },

        getAuthorAvatarUrl(item) {
            const fallback = '/news/author_avatar/GasGx-Researcher.png';
            if (!item || typeof item !== 'object') return fallback;

            const articleId = item.app_id || item.api_id || item.id;
            const authorAvatar = String(item.author_avatar || '').trim();
            if (authorAvatar) {
                if (/^https?:\/\//i.test(authorAvatar)) return authorAvatar;
                const normalizedAvatar = authorAvatar.replace(/^\.?\/*(images\/)?/i, '');
                if (articleId) return `https://www.gasgx.com/news/article/${articleId}/images/${normalizedAvatar}`;
            }

            const publisher = String(item.publisher || '').trim().toLowerCase();
            if (publisher.includes('blockbeats')) return '/news/author_avatar/Blockbeats.png';
            if (publisher.includes('odaily')) return '/news/author_avatar/Odaily.png';
            if (publisher.includes('techflow')) return '/news/author_avatar/Techflow.png';
            if (publisher.includes('wushuo') || publisher.includes('wu shuo')) return '/news/author_avatar/WuShuoBlock.png';
            return fallback;
        },

        getArticleUrl(item) {
            if (!item) return '#';
            const articleId = item.app_id || item.api_id || item.id;
            return articleId ? `https://www.gasgx.com/news/article/${articleId}` : '#';
        },

        openArticle(url) {
            const href = String(url || '').trim();
            if (!href || href === '#') return;
            window.open(href, '_blank', 'noopener,noreferrer');
        },

        getArticleUniqueKey(item) {
            if (!item || typeof item !== 'object') return '';

            const apiId = item.api_id || item.app_id;
            if (apiId) return `api:${apiId}`;

            const link = String(item.link || '').trim();
            if (link) return `link:${link}`;

            const title = String(item.main_title || '').trim();
            const time = String(item.time || '').trim();
            if (title || time) return `fallback:${title}|${time}`;

            return '';
        },

        getFeedCategoryLabel(item) {
            if (!item || typeof item !== 'object') return 'NEWS';

            const normalize = (value) =>
                String(value || '')
                    .toLowerCase()
                    .replace(/[_-]+/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

            const typeKey = normalize(item.type);
            const typeMap = {
                'gas energy': 'GAS ENERGY',
                generators: 'GENERATORS',
                mining: 'MINING',
                insights: 'INSIGHTS',
                data: 'DATA',
                events: 'EVENTS',
                flash: 'FLASH',
            };
            if (typeMap[typeKey]) return typeMap[typeKey];
            if (typeKey) return typeKey.toUpperCase();

            const tagKey = normalize(item.tag);
            const tagMap = {
                hardware: 'HARDWARE',
                policy: 'POLICY',
                finance: 'FINANCE',
            };
            if (tagMap[tagKey]) return tagMap[tagKey];
            if (tagKey) return tagKey.toUpperCase();

            return 'NEWS';
        },

        formatArticleDateTime(value) {
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return '--';
            const pad = (num) => String(num).padStart(2, '0');
            return `${date.getUTCFullYear()}/${pad(date.getUTCMonth() + 1)}/${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} UTC`;
        },

        buildPublishedArticlesQuery(baseQuery) {
            if (!baseQuery || typeof baseQuery !== 'object') return baseQuery;
            return baseQuery.eq('status', 'published').is('deleted_at', null);
        },

        isPublishedFilterUnsupported(error) {
            const text = String(error?.message || '').toLowerCase();
            return text.includes('status') || text.includes('deleted_at');
        },

        async fetchHomeFeaturedArticles() {
            const featuredQuery = this.buildPublishedArticlesQuery(
                _supabase.from('articles').select('*').not('featured_rank', 'is', null).lte('featured_rank', FEATURED_LIMIT).order('featured_rank', { ascending: true })
            );
            const { data: featuredRows, error: featuredErr } = await featuredQuery;
            if (featuredErr) console.error('Featured query failed:', featuredErr);

            let featured = Array.isArray(featuredRows) ? featuredRows : [];
            if (featuredErr && this.isPublishedFilterUnsupported(featuredErr)) {
                const { data: legacyFeatured } = await _supabase
                    .from('articles')
                    .select('*')
                    .not('featured_rank', 'is', null)
                    .lte('featured_rank', FEATURED_LIMIT)
                    .order('featured_rank', { ascending: true });
                featured = Array.isArray(legacyFeatured) ? legacyFeatured : [];
            }
            if (featured.length >= FEATURED_LIMIT) return featured.slice(0, FEATURED_LIMIT);

            const fallbackQuery = this.buildPublishedArticlesQuery(
                _supabase.from('articles').select('*').order('time', { ascending: false }).limit(FEATURED_LIMIT * 3)
            );
            const { data: fallbackRows, error: fallbackErr } = await fallbackQuery;
            let fallback = Array.isArray(fallbackRows) ? fallbackRows : [];
            if (fallbackErr && this.isPublishedFilterUnsupported(fallbackErr)) {
                const { data: legacyFallback } = await _supabase.from('articles').select('*').order('time', { ascending: false }).limit(FEATURED_LIMIT * 3);
                fallback = Array.isArray(legacyFallback) ? legacyFallback : [];
            }
            const unique = [];
            const seen = new Set();

            featured.forEach((row) => {
                const key = this.getArticleUniqueKey(row);
                if (!key || seen.has(key)) return;
                seen.add(key);
                unique.push(row);
            });

            fallback.forEach((row) => {
                if (unique.length >= FEATURED_LIMIT) return;
                const key = this.getArticleUniqueKey(row);
                if (!key || seen.has(key)) return;
                seen.add(key);
                unique.push(row);
            });

            return unique.slice(0, FEATURED_LIMIT);
        },

        renderFeaturedGrid(items = []) {
            const container = document.getElementById('ggx-featured-grid-container');
            if (!container) return;

            const rows = Array.isArray(items) ? items.slice(3, FEATURED_LIMIT) : [];
            if (!rows.length) {
                container.innerHTML = '<div class="text-xs text-gray-500 border border-white/10 rounded-xl p-4">No featured picks available.</div>';
                return;
            }

            container.innerHTML = rows
                .map((item, index) => {
                    const articleId = item?.app_id || item?.api_id || item?.id || '';
                    const articleUrl = this.getArticleUrl(item);
                    const imageUrl = this.getImageUrl(item);
                    const rank = index + 4;
                    return `
                        <article class="ggx-tech-card ggx-featured-card rounded-xl overflow-hidden cursor-pointer" onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.openArticle('${articleUrl}')">
                            <div class="relative h-40 overflow-hidden">
                                <img src="${imageUrl}" data-article-id="${articleId}" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 hover:scale-105" onerror="this.src='https://www.gasgx.com/news/advertisement/zhanwei.jpg'">
                                <span class="ggx-featured-rank">#${rank}</span>
                            </div>
                            <div class="p-4">
                                <div class="text-[10px] font-bold text-gas-green uppercase tracking-wide mb-2">${item.secondary_tag || item.tag || 'Featured'}</div>
                                <h4 class="text-sm font-bold text-white leading-snug line-clamp-2">${item.main_title || 'Untitled'}</h4>
                            </div>
                        </article>
                    `;
                })
                .join('');
        },

        async loadHero() {
            const container = document.getElementById('ggx-hero-grid-container');
            if (!container) return;

            try {
                const articles = await this.fetchHomeFeaturedArticles();
                const { data: spark } = await _supabase.from('market_metrics').select('*').eq('id', 'spark_spread').single();

                const sparkData = spark || {
                    label: 'Spark Spread',
                    change_24h: 'Arbitrage gap in Alberta.',
                    value: '18.50',
                    unit: '$ / MWh',
                };
                const displayValue = sparkData.value.startsWith('$') ? sparkData.value : `$${sparkData.value}`;
                const displayUnit = sparkData.unit.replace('$', '').trim();

                if (!articles || articles.length === 0) {
                    container.innerHTML = '<div class="col-span-4 text-center">No hero content.</div>';
                    this.renderFeaturedGrid([]);
                    return;
                }

                const hero1 = articles.find((d) => Number(d.featured_rank) === 1 || Number(d.homepage_mark) === 1) || articles[0];
                const hero2 = articles.find((d) => Number(d.featured_rank) === 2 || Number(d.homepage_mark) === 2) || articles[1];
                const hero3 = articles.find((d) => Number(d.featured_rank) === 3 || Number(d.homepage_mark) === 3) || articles[2];
                const img1 = this.getImageUrl(hero1);
                const img2 = hero2 ? this.getImageUrl(hero2) : '';
                const hero1Id = hero1?.app_id || hero1?.api_id || hero1?.id || '';
                const hero2Id = hero2?.app_id || hero2?.api_id || hero2?.id || '';
                const hero1Url = this.getArticleUrl(hero1);
                const hero2Url = hero2 ? this.getArticleUrl(hero2) : '#';
                const hero3Url = hero3 ? this.getArticleUrl(hero3) : '#';

                container.innerHTML = `
                    <div class="lg:col-span-2 lg:row-span-2 relative group rounded-xl overflow-hidden cursor-pointer ggx-tech-card border-0" onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.openArticle('${hero1Url}')">
                        <img src="${img1}" data-article-id="${hero1Id}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" onerror="this.src='https://www.gasgx.com/news/advertisement/zhanwei.jpg'">
                        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-8 flex flex-col justify-end">
                            <div class="flex items-center mb-3"><span class="bg-gas-green text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-neon uppercase tracking-wide">${hero1.secondary_tag || hero1.tag}</span></div>
                            <h2 class="text-3xl md:text-4xl font-bold text-white leading-tight mb-2 font-header">${hero1.main_title}</h2>
                        </div>
                    </div>
                    ${hero2 ? `<div class="lg:col-span-1 lg:row-span-1 relative group rounded-xl overflow-hidden cursor-pointer ggx-tech-card border-0" onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.openArticle('${hero2Url}')"><img src="${img2}" data-article-id="${hero2Id}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onerror="this.src='https://www.gasgx.com/news/advertisement/zhanwei.jpg'"><div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-6 flex flex-col justify-end"><span class="text-gas-green text-[10px] font-bold uppercase mb-1">${hero2.secondary_tag || hero2.tag}</span><h3 class="text-lg font-bold text-white leading-snug">${hero2.main_title}</h3></div></div>` : '<div class="lg:col-span-1 lg:row-span-1 bg-[#111]"></div>'}
                    <div class="lg:col-span-1 lg:row-span-1 bg-[#111] border border-white/5 rounded-xl p-6 flex flex-col justify-between group cursor-pointer relative overflow-hidden">
                        <div class="grid-bg absolute inset-0"></div>
                        <div class="relative z-10"><div class="flex justify-between items-start mb-4"><i class="fa-solid fa-chart-area text-2xl text-gas-green"></i><span class="text-[10px] text-gray-500 font-mono border border-gray-700 px-1 rounded">LIVE</span></div><h3 class="text-lg font-bold text-white mb-1">${sparkData.label}</h3><p class="text-xs text-gray-400">${sparkData.change_24h}</p></div>
                        <div class="text-3xl font-mono font-bold text-white group-hover:text-gas-green transition-colors relative z-10">${displayValue} <span class="text-xs text-gray-500 font-sans font-normal">${displayUnit}</span></div>
                    </div>
                    ${hero3 ? `<div class="lg:col-span-2 lg:row-span-1 bg-[#121212] border border-white/5 rounded-xl p-6 flex items-center justify-between group cursor-pointer" onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.openArticle('${hero3Url}')"><div class="max-w-[70%]"><span class="text-orange-500 text-[10px] font-bold uppercase mb-2 block"><i class="fa-solid fa-fire mr-1"></i> ${hero3.secondary_tag || hero3.tag}</span><h3 class="text-xl font-bold text-white leading-snug group-hover:text-orange-400">${hero3.main_title}</h3></div><div class="w-12 h-12 rounded-full border border-gray-700 flex items-center justify-center text-gray-500 group-hover:text-gas-green bg-[#1a1a1a]"><i class="fa-solid fa-arrow-right"></i></div></div>` : '<div class="lg:col-span-2 lg:row-span-1 bg-[#111] border border-white/5 rounded-xl"></div>'}
                `;

                this.renderFeaturedGrid(articles);
            } catch (e) {
                console.error(e);
            }
        },

        async loadMarketPulse() {
            const container = document.getElementById('ggx-market-pulse-container');
            if (!container) return;

            const fallbackMetrics = [
                { id: 'metric_hashrate', label: 'Network Hashrate', value: '--', unit: 'EH/s', trend: 'flat', change_24h: 'Awaiting feed' },
                { id: 'metric_difficulty', label: 'Difficulty', value: '--', unit: 'T', trend: 'flat', change_24h: 'Awaiting feed' },
                { id: 'metric_gasprice', label: 'Natural Gas', value: '--', unit: '$/MMBtu', trend: 'flat', change_24h: 'Awaiting feed' },
                { id: 'metric_btc', label: 'BTC Price', value: '--', unit: 'USD', trend: 'flat', change_24h: 'Awaiting feed' },
            ];

            const normalizeTrend = (value, fallback = '') => {
                const v = String(value || fallback || '').toLowerCase();
                if (v.includes('up') || v.includes('+') || v.includes('positive')) return 'up';
                if (v.includes('down') || v.includes('-') || v.includes('negative')) return 'down';
                return 'flat';
            };

            const mapLiveDataToPulse = (liveRows) => {
                const rows = Array.isArray(liveRows) ? liveRows : [];
                if (!rows.length) return [];

                const wanted = [
                    { key: 'hashrate', test: /(hash\s*rate|hashrate)/i },
                    { key: 'difficulty', test: /(difficulty)/i },
                    { key: 'gas', test: /(henry|natural\s*gas|gas)/i },
                    { key: 'btc', test: /(btc|bitcoin)/i },
                ];

                const picked = [];
                const used = new Set();
                wanted.forEach((rule) => {
                    const idx = rows.findIndex((row, i) => !used.has(i) && rule.test.test(String(row.label || '')));
                    if (idx >= 0) {
                        used.add(idx);
                        const row = rows[idx];
                        picked.push({
                            id: `live_${rule.key}`,
                            label: row.label || 'Metric',
                            value: row.display_value ?? '--',
                            unit: row.unit || '',
                            trend: normalizeTrend(row.status, row.secondary_text),
                            change_24h: row.secondary_text || '--',
                        });
                    }
                });

                rows.forEach((row, i) => {
                    if (picked.length >= 4 || used.has(i)) return;
                    picked.push({
                        id: `live_extra_${i}`,
                        label: row.label || 'Metric',
                        value: row.display_value ?? '--',
                        unit: row.unit || '',
                        trend: normalizeTrend(row.status, row.secondary_text),
                        change_24h: row.secondary_text || '--',
                    });
                });

                return picked.slice(0, 4);
            };

            const renderMetrics = (items) => {
                const source = Array.isArray(items) ? items : [];
                const dbMetrics = source.filter((item) => item && item.id !== 'spark_spread').slice(0, 4);
                const merged = [...dbMetrics];
                for (const fallback of fallbackMetrics) {
                    if (merged.length >= 4) break;
                    merged.push(fallback);
                }

                container.innerHTML = merged
                    .map((item) => {
                        const trend = String(item.trend || '').toLowerCase();
                        const trendClass = trend === 'up' ? 'text-gas-green' : trend === 'down' ? 'text-red-500' : 'text-blue-400';
                        const trendIcon = trend === 'up' ? '<i class="fa-solid fa-caret-up"></i>' : trend === 'down' ? '<i class="fa-solid fa-caret-down"></i>' : '';
                        const label = item.label || 'Metric';
                        const value = item.value ?? '--';
                        const unit = item.unit || '';
                        const change = item.change_24h || '--';
                        return `<div class="bg-[#0A0A0A] border border-white/10 rounded-xl p-4 flex flex-col justify-between h-24 hover:border-gas-green/30 transition-all group"><div class="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate">${label}</div><div><div class="text-xl font-mono font-bold text-white flex items-baseline gap-1">${value} <span class="text-[10px] text-gray-600 font-sans font-normal">${unit}</span></div><div class="text-[10px] font-bold ${trendClass} mt-1 flex items-center gap-1">${trendIcon} ${change}</div></div></div>`;
                    })
                    .join('');
            };

            try {
                const { data: liveData, error: liveErr } = await _supabase.from('homepage_scrolling_data').select('*').order('sort_order', { ascending: true });
                if (!liveErr) {
                    const mapped = mapLiveDataToPulse(liveData);
                    if (mapped.length > 0) {
                        renderMetrics(mapped);
                        return;
                    }
                } else {
                    console.error('Market pulse live source failed:', liveErr);
                }

                const { data: metricData, error: metricErr } = await _supabase.from('market_metrics').select('*');
                if (metricErr) {
                    console.error('Market pulse metric source failed:', metricErr);
                    renderMetrics(fallbackMetrics);
                    return;
                }
                renderMetrics(metricData);
            } catch (e) {
                console.error(e);
                renderMetrics(fallbackMetrics);
            }
        },

        async loadLiveData() {
            const container = document.getElementById('ggx-live-data-container');
            if (!container) return;

            try {
                const { data } = await _supabase.from('homepage_scrolling_data').select('*').order('sort_order', { ascending: true });
                if (data && data.length > 0) {
                    const itemsHtml = data
                        .map((item) => {
                            const color = item.status === 'positive' ? 'text-gas-green' : item.status === 'negative' ? 'text-red-500' : 'text-gray-500';
                            return `<div class="flex items-center gap-2 text-xs font-mono text-gray-400 whitespace-nowrap"><span class="text-purple-400 font-bold">${item.label}</span><span class="text-white font-bold">${item.display_value}</span>${item.unit ? `<span class="text-gray-500 text-[10px]">${item.unit}</span>` : ''}${item.secondary_text ? `<span class="${color} text-[10px] ml-1">${item.secondary_text}</span>` : ''}</div>`;
                        })
                        .join('');
                    container.innerHTML = `<div class="flex items-center gap-12">${itemsHtml}</div>`.repeat(2);
                }
            } catch (e) {
                console.error(e);
            }
        },
        loadMore() {
            if (this.state.isLoading) return;
            this.loadFeed(this.state.currentCategory, false);
        },

        async loadFeed(category, isReset = false) {
            const container = document.getElementById('ggx-news-feed-container');
            const btnContainer = document.getElementById('ggx-load-more-container');
            const loadBtn = document.getElementById('ggx-load-more-btn');
            const spinner = document.getElementById('ggx-load-more-spinner');
            if (!container || !btnContainer || !loadBtn || !spinner) return;
            const requestToken = ++this.state.feedRequestToken;

            if (isReset) {
                this.state.currentCategory = category;
                this.state.currentOffset = 0;
                this.state.feedRenderedKeys = new Set();
                container.innerHTML = '<div class="text-center text-gray-500 py-10"><i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Loading Articles...</div>';
                container.className = category === 'latest' ? 'space-y-4 min-h-[300px]' : 'grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[300px]';
                btnContainer.style.display = 'none';
            } else {
                this.state.isLoading = true;
                loadBtn.classList.add('hidden');
                spinner.classList.remove('hidden');
            }

            const limit = FEED_PAGE_SIZE;
            const from = this.state.currentOffset;
            const to = from + limit - 1;

            try {
                let query = _supabase
                    .from('articles')
                    .select('*')
                    .order('time', { ascending: false, nullsFirst: false })
                    .order('api_id', { ascending: false, nullsFirst: false })
                    .order('id', { ascending: false })
                    .range(from, to);
                query = this.buildPublishedArticlesQuery(query);
                if (category !== 'latest') query = query.eq('tag', `${category.charAt(0).toUpperCase()}${category.slice(1)}`);
                let { data, error } = await query;
                if (error && this.isPublishedFilterUnsupported(error)) {
                    let legacyQuery = _supabase
                        .from('articles')
                        .select('*')
                        .order('time', { ascending: false, nullsFirst: false })
                        .order('api_id', { ascending: false, nullsFirst: false })
                        .order('id', { ascending: false })
                        .range(from, to);
                    if (category !== 'latest') legacyQuery = legacyQuery.eq('tag', `${category.charAt(0).toUpperCase()}${category.slice(1)}`);
                    const legacyRes = await legacyQuery;
                    data = legacyRes.data;
                    error = legacyRes.error;
                }
                if (error) throw error;
                if (requestToken !== this.state.feedRequestToken) return;
                const incoming = Array.isArray(data) ? data : [];

                if (isReset && incoming.length === 0) {
                    container.innerHTML = '<div class="text-center text-gray-500 py-8">No articles found in this section.</div>';
                    btnContainer.style.display = 'none';
                    return;
                }

                const deduped = [];
                incoming.forEach((art) => {
                    const key = this.getArticleUniqueKey(art);
                    if (key && this.state.feedRenderedKeys.has(key)) return;
                    if (key) this.state.feedRenderedKeys.add(key);
                    deduped.push(art);
                });

                const html = deduped
                    .map((art) => {
                        const imageMeta = this.getImageMeta(art);
                        const imgUrl = imageMeta.url;
                        const isVideoCover = imageMeta.isVideoCover;
                        const articleUrl = this.getArticleUrl(art);
                        const articleId = art.app_id || art.api_id || art.id || '';
                        const categoryDisplay = this.getFeedCategoryLabel(art);

                        if (category === 'latest') {
                            return `
                                <article class="ggx-tech-card ggx-latest-card rounded-lg p-0 flex flex-col md:flex-row group h-auto cursor-pointer mb-4" onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.openArticle('${articleUrl}')">
                                    <div class="ggx-latest-cover w-full md:w-60 overflow-hidden shrink-0 relative">
                                        <img src="${imgUrl}" data-article-id="${articleId}" data-video-cover="${isVideoCover ? '1' : '0'}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onerror="this.src='https://www.gasgx.com/news/advertisement/zhanwei.jpg'">
                                        <span data-video-badge-id="${articleId}" class="ggx-video-badge ${isVideoCover ? '' : 'hidden'}">
                                            <i class="fa-solid fa-play text-base ml-[2px]"></i>
                                        </span>
                                    </div>
                                    <div class="flex-1 p-5 ggx-card-body ggx-latest-card-body">
                                        <div>
                                            <div class="flex items-center gap-2 mb-2"><span class="text-[10px] font-bold text-gas-green uppercase border border-gas-green/30 px-1.5 rounded">${categoryDisplay}</span><span class="text-[10px] text-gray-500">${this.formatArticleDateTime(art.time)}</span></div>
                                            <h3 class="text-lg font-bold text-white mb-2 leading-snug group-hover:text-gas-green transition-colors line-clamp-2">${art.main_title}</h3>
                                            <p class="text-gray-400 text-sm line-clamp-2">${art.subheading || ''}</p>
                                        </div>
                                        <div class="flex items-center gap-2 mt-1 pt-3 border-t border-white/5">
                                            <img src="${this.getAuthorAvatarUrl(art)}" alt="${art.publisher || 'GasGx Team'}" loading="lazy" class="w-7 h-7 rounded-full object-cover border border-white/10 bg-[#111]" onerror="this.onerror=null;this.src='/news/author_avatar/GasGx-Researcher.png'">
                                            <span class="text-xs text-gray-500 min-w-0 truncate">By <span class="text-white">${art.publisher || 'GasGx Team'}</span></span>
                                        </div>
                                    </div>
                                </article>`;
                        }

                        return `
                            <article class="ggx-tech-card rounded-lg p-5 group cursor-pointer" onclick="window.GGXNewsHomeApp && window.GGXNewsHomeApp.openArticle('${articleUrl}')">
                                <div class="ggx-card-body">
                                    <div><span class="text-gas-green text-[10px] font-bold uppercase mb-2 block tracking-wider">${categoryDisplay}</span><h3 class="text-lg font-bold text-white mb-2 group-hover:text-gas-green transition-colors">${art.main_title}</h3><p class="text-gray-400 text-sm mb-4 line-clamp-3">${art.subheading || ''}</p></div>
                                    <div class="text-[10px] text-gray-600 mt-auto pt-2 border-t border-white/5">${this.formatArticleDateTime(art.time)}</div>
                                </div>
                            </article>`;
                    })
                    .join('');

                if (isReset) container.innerHTML = html;
                else container.insertAdjacentHTML('beforeend', html);

                this.state.currentOffset += incoming.length;
                this.state.isLoading = false;
                btnContainer.style.display = 'block';
                spinner.classList.add('hidden');
                if (incoming.length < limit) loadBtn.style.display = 'none';
                else {
                    loadBtn.style.display = 'inline-block';
                    loadBtn.classList.remove('hidden');
                }
            } catch (e) {
                console.error(e);
                this.state.isLoading = false;
                spinner.classList.add('hidden');
                loadBtn.classList.remove('hidden');
            }
        },

        switchTab(tabId) {
            document.querySelectorAll('.ggx-tab-btn').forEach((btn) => {
                btn.classList.remove('border-gas-green', 'text-white', 'font-bold');
                btn.classList.add('border-transparent', 'text-gray-400', 'font-medium');
            });
            const activeBtn = document.getElementById(`ggx-tab-btn-${tabId}`);
            if (activeBtn) {
                activeBtn.classList.remove('border-transparent', 'text-gray-400', 'font-medium');
                activeBtn.classList.add('border-gas-green', 'text-white', 'font-bold');
            }
            this.loadFeed(tabId, true);
        },
    };
}
