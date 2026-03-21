
import { renderSharedAuthState } from '../../shared/modules/layout.shared.js?v=20260321authux03';
import { HEADER_NAVIGATION } from '../../shared/config/navigation.config.js';

const DEFAULT_MAIN_AUTH = Object.freeze({
    storageKey: 'gasgx-main-auth',
    supabaseUrl: 'https://mkpcliytqudclkwtewru.supabase.co',
    supabaseKey: 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw',
});
const FLASH_ACCOUNT_URL = '/news/flash/account.html';
const FLASH_SIGN_IN_URL = '/news/flash/user.html';
const API_BASE = 'https://api.theblockbeats.news/v1/open-api/open-flash';
const FLASH_PROXY_BASES = ['https://corsproxy.io/?', 'https://api.allorigins.win/raw?url='];
const FLASH_FETCH_TIMEOUT_MS = 15000;

const HASHTAGS = '#GasGx #NaturalGas #EnergyMining #BitcoinMining';
const SHARE_URL = 'https://www.gasgx.com/news/flash/';

const CACHE_KEY_EN = 'gasgx_en_v9_stable';
const CACHE_KEY_CN = 'gasgx_cn_v9_stable';
const MAX_CACHE_SIZE = 100;
const ITEMS_PER_PAGE = 15;
const FLASH_FETCH_LIMIT = 120;
const FLASH_POLL_INTERVAL_MS = 600000;

const MAIN_TEMPLATE = `
<section class="gxf-main-module">
    <div id="gxf-toast-container"></div>

    <div id="gxf-poster-modal" class="gxf-modal-overlay">
        <div class="gxf-poster-preview-card bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
            <button onclick="window.GGXFlashApp && window.GGXFlashApp.closePosterModal()" class="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-gray-400 hover:text-white hover:bg-black/80 transition-all" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="p-6 pb-4 border-b border-white/5 bg-[#111] z-10 relative">
                <h3 class="text-white font-bold text-lg uppercase tracking-wider text-center"><span class="text-gas-green">Share</span> Poster</h3>
            </div>
            <div id="gxf-generated-poster-container" class="w-full relative">
                <div class="absolute inset-0 flex items-center justify-center"><i class="fa-solid fa-circle-notch fa-spin text-gas-green text-2xl"></i></div>
            </div>
            <div class="p-5 border-t border-white/10 bg-[#111] z-10 relative">
                <div class="grid grid-cols-4 gap-3 w-full">
                    <button onclick="window.GGXFlashApp && window.GGXFlashApp.sharePosterWeChat()" class="flex flex-col items-center gap-1 group"><div class="w-10 h-10 rounded-full bg-[#1F1F1F] flex items-center justify-center group-hover:bg-[#222] transition-colors border border-white/5 group-hover:border-gas-green/30"><i class="fa-brands fa-weixin text-lg text-[#07C160]"></i></div><span class="text-[9px] text-gray-500 uppercase font-bold group-hover:text-gray-300">WeChat</span></button>
                    <button onclick="window.GGXFlashApp && window.GGXFlashApp.sharePosterX()" class="flex flex-col items-center gap-1 group"><div class="w-10 h-10 rounded-full bg-[#1F1F1F] flex items-center justify-center group-hover:bg-[#222] transition-colors border border-white/5 group-hover:border-gas-green/30"><i class="fa-brands fa-x-twitter text-lg text-white"></i></div><span class="text-[9px] text-gray-500 uppercase font-bold group-hover:text-gray-300">X</span></button>
                    <button onclick="window.GGXFlashApp && window.GGXFlashApp.sharePosterLinkedIn()" class="flex flex-col items-center gap-1 group"><div class="w-10 h-10 rounded-full bg-[#1F1F1F] flex items-center justify-center group-hover:bg-[#222] transition-colors border border-white/5 group-hover:border-gas-green/30"><i class="fa-brands fa-linkedin text-lg text-[#0077B5]"></i></div><span class="text-[9px] text-gray-500 uppercase font-bold group-hover:text-gray-300">LinkedIn</span></button>
                    <button onclick="window.GGXFlashApp && window.GGXFlashApp.downloadGeneratedPoster()" class="flex flex-col items-center gap-1 group"><div class="w-10 h-10 rounded-full bg-[#1F1F1F] flex items-center justify-center group-hover:bg-[#222] transition-colors border border-white/5 group-hover:border-gas-green/30"><i class="fa-solid fa-download text-lg text-gas-green"></i></div><span class="text-[9px] text-gray-500 uppercase font-bold group-hover:text-gray-300">Save</span></button>
                </div>
            </div>
        </div>
    </div>

    <div class="relative z-30 bg-[#050505]/95 backdrop-blur border-b border-white/5 shadow-lg">
        <div class="max-w-[1200px] mx-auto px-4 lg:px-6 py-3 flex items-center justify-between gap-3 min-w-0">
            <h1 class="gxf-page-title min-w-0 flex-1 text-base sm:text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2 sm:gap-3"><i class="fa-solid fa-bolt text-gas-green animate-pulse shrink-0"></i><span class="truncate">7x24 Flash News</span></h1>
            <div class="flex gap-2 shrink-0">
                <button onclick="window.GGXFlashApp && window.GGXFlashApp.forceRefresh()" class="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111] border border-white/10 hover:border-gas-green hover:bg-[#1a1a1a] transition-all cursor-pointer">
                    <span class="text-[10px] font-bold text-gray-400 group-hover:text-white uppercase tracking-wide">Sync</span>
                    <i id="gxf-sync-icon" class="fa-solid fa-rotate-right text-gas-green transition-transform duration-700 text-xs"></i>
                </button>
            </div>
        </div>
    </div>

    <main class="flex-grow w-full max-w-[1200px] mx-auto px-4 lg:px-6 pt-2 pb-6 overflow-x-hidden">
        <div class="gxf-main-layout flex flex-col lg:flex-row gap-0 lg:gap-12 items-start relative min-w-0">
            <div class="gxf-primary-column w-full lg:w-[70%] relative min-h-screen min-w-0">
                <div id="gxf-flash-timeline-container" class="relative">
                    <div class="hidden lg:block gxf-timeline-line"></div>
                    <div id="gxf-flash-items-wrapper" class="space-y-0 min-w-0"><div class="text-center py-20 text-gray-500"><i class="fa-solid fa-circle-notch fa-spin text-3xl mb-4"></i><br>Syncing News...</div></div>
                    <div id="gxf-pagination-controls" class="mt-12 text-center pl-0 lg:pl-[140px] pb-10">
                        <button id="gxf-load-more-btn" onclick="window.GGXFlashApp && window.GGXFlashApp.loadMoreLocal()" class="hidden px-8 py-3 rounded-full border border-white/10 text-xs font-bold text-white hover:bg-white hover:text-black transition-all uppercase tracking-wide">Load More History</button>
                        <div id="gxf-no-more-msg" class="hidden text-xs text-gray-600 font-mono uppercase tracking-widest"><span class="inline-block w-2 h-2 rounded-full bg-gray-800 mr-2"></span> No more history</div>
                    </div>
                </div>
            </div>

            <div class="gxf-secondary-column hidden lg:flex w-[30%] flex-col gap-6 sticky top-40">
                <div class="rounded-xl overflow-hidden relative group cursor-pointer border border-white/10 hover:border-gas-green/50 transition-all duration-500 shadow-2xl" onclick="window.open('https://www.gasgx.com', '_blank')">
                    <div class="absolute inset-0 bg-gradient-to-br from-[#0f0f0f] via-[#050505] to-[#000]"></div>
                    <div class="absolute inset-0 bg-[linear-gradient(rgba(93,214,44,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(93,214,44,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                    <div class="relative z-10 p-8 flex flex-col items-center text-center h-full justify-center min-h-[240px]">
                        <div class="w-16 h-16 rounded-full bg-[#111] border border-gas-green/30 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(93,214,44,0.15)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(93,214,44,0.4)] transition-all duration-500"><span class="text-2xl font-bold italic text-gas-green font-header tracking-tighter">Gx</span></div>
                        <h3 class="text-white font-bold text-xl mb-2 font-header tracking-wide uppercase">GASGX.COM</h3>
                        <p class="text-[11px] text-gray-400 mb-6 leading-relaxed max-w-[200px]">The definitive intelligence platform for energy-compute convergence.</p>
                        <button class="bg-gas-green text-black font-bold text-[10px] px-6 py-2.5 rounded-full hover:bg-white hover:scale-105 transition-all uppercase tracking-widest shadow-lg shadow-gas-green/10">Visit Official Site</button>
                    </div>
                    <div class="absolute -bottom-12 -right-12 w-32 h-32 bg-gas-green/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-gas-green/20 transition-colors"></div>
                </div>
            </div>
        </div>
    </main>

    <button id="gxf-back-to-top-btn" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })" class="fixed right-6 bottom-24 w-10 h-10 bg-[#111] border border-gas-green text-gas-green rounded-full flex items-center justify-center z-40 hover:scale-110 transition-all duration-300 shadow-neon group opacity-0 pointer-events-none" aria-label="Back to Top">
        <i class="fa-solid fa-arrow-up group-hover:-translate-y-0.5 transition-transform"></i>
    </button>

    <div id="gxf-poster-capture-area" class="gxf-poster-bg" style="position: absolute; top: -9999px; left: -9999px; width: 450px; padding: 0; display: flex; flex-direction: column; text-align: left; overflow: hidden;">
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
                <div class="text-gas-green font-mono text-xs font-bold flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-gas-green animate-pulse"></span><span id="gxf-poster-time-text"></span></div>
            </div>
            <h2 id="gxf-poster-title" class="text-2xl font-bold text-white leading-tight mb-5 font-sans text-left tracking-tight"></h2>
            <p id="gxf-poster-text" class="text-[#d0d0d0] text-[15px] leading-relaxed font-sans text-justify"></p>
        </div>
        <div class="w-full p-8 bg-[#050505] border-t border-white/10 flex justify-between items-end relative">
            <div class="flex flex-col gap-1 max-w-[65%]">
                <span class="text-gas-green font-header font-bold text-xl leading-none uppercase">Make Natural Gas-Powered</span>
                <span class="text-white font-header font-bold text-xl leading-none uppercase">Mining Easier</span>
                <span class="text-[9px] text-gray-600 mt-2 tracking-widest font-mono">POWERED BY GASGX INTELLIGENCE</span>
            </div>
            <div class="relative bg-white p-2 rounded-xl shadow-xl shadow-gas-green/10 flex items-center justify-center">
                <div id="gxf-poster-qrcode" class="flex items-center justify-center"></div>
            </div>
        </div>
    </div>
</section>`;

let flashAppInstance = null;

function getFlashMainAuthConfig() {
    const source = window.GASGX_SITE_SHELL_CONFIG?.site?.mainAuth || {};
    return {
        storageKey: typeof source.storageKey === 'string' && source.storageKey.trim() ? source.storageKey.trim() : DEFAULT_MAIN_AUTH.storageKey,
        supabaseUrl: typeof source.supabaseUrl === 'string' && source.supabaseUrl.trim() ? source.supabaseUrl.trim() : DEFAULT_MAIN_AUTH.supabaseUrl,
        supabaseKey: typeof source.supabaseKey === 'string' && source.supabaseKey.trim() ? source.supabaseKey.trim() : DEFAULT_MAIN_AUTH.supabaseKey,
    };
}

export function mountFlashMain(container) {
    if (!container) return;
    container.innerHTML = MAIN_TEMPLATE;
}

export function createFlashApp() {
    if (flashAppInstance) return flashAppInstance;

    const { createClient } = supabase;
    const authConfig = getFlashMainAuthConfig();
    const _supabase = createClient(authConfig.supabaseUrl, authConfig.supabaseKey, {
        auth: {
            storageKey: authConfig.storageKey,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    });

    flashAppInstance = {
        state: {
            allNews: [],
            translations: {},
            visibleCount: ITEMS_PER_PAGE,
            generatedPosterUrl: null,
            currentPosterData: { title: '', content: '', time: '' },
            lastDateHeader: null,
            user: null,
            displayName: null,
            bookmarks: new Set(),
            pollTimer: null,
            visibilityHandler: null,
            lastAutoFetchAt: 0,
        },
        async init() {
            await this.initAuth();
            this.renderNav();
            this.loadLiveData();
            this.loadFromCache();
            this.fetchAndMerge();
            this.state.lastAutoFetchAt = Date.now();

            if (this.state.pollTimer) clearInterval(this.state.pollTimer);
            this.state.pollTimer = setInterval(() => {
                if (!document.hidden && this.shouldRunAutoFetch()) this.fetchAndMerge(true);
            }, FLASH_POLL_INTERVAL_MS);

            if (this.state.visibilityHandler) {
                document.removeEventListener('visibilitychange', this.state.visibilityHandler);
            }
            this.state.visibilityHandler = () => {
                if (!document.hidden && this.shouldRunAutoFetch()) this.fetchAndMerge(true);
            };
            document.addEventListener('visibilitychange', this.state.visibilityHandler);

            window.addEventListener('scroll', () => {
                const btn = document.getElementById('gxf-back-to-top-btn');
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
                    this.state.user = session.user;
                    this.state.displayName = session.user.email.split('@')[0];
                    this.fetchProfile(session.user);
                    this.fetchBookmarks();
                } else {
                    this.state.user = null;
                    this.state.displayName = null;
                    this.state.bookmarks = new Set();
                }

                _supabase.auth.onAuthStateChange((event, session) => {
                    this.state.user = session ? session.user : null;
                    if (session) {
                        this.state.displayName = session.user.email.split('@')[0];
                        this.fetchProfile(session.user);
                        this.fetchBookmarks();
                    } else {
                        this.state.displayName = null;
                        this.state.bookmarks = new Set();
                    }
                    this.renderNav();
                    this.renderList();
                });
            } catch (e) {
                console.error('Auth init failed:', e);
            }
        },

        async fetchProfile(user) {
            try {
                const { data: profile } = await _supabase.from('profiles').select('full_name').eq('id', user.id).single();
                if (profile && profile.full_name) {
                    this.state.displayName = profile.full_name;
                    this.renderNav();
                }
            } catch (e) {
                console.log('Profile fetch failed, using fallback name');
            }
        },

        async fetchBookmarks() {
            if (!this.state.user) return;
            try {
                const { data } = await _supabase.from('bookmarks').select('news_id').eq('user_id', this.state.user.id);
                if (data) {
                    this.state.bookmarks = new Set(data.map((i) => i.news_id));
                    this.renderList();
                }
            } catch (e) {
                console.log('Fetch bookmarks failed:', e);
            }
        },

        async loadLiveData() {
            const container = document.getElementById('gxf-live-data-container');
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
                console.error('Live data load failed:', e);
            }
        },

        async toggleBookmark(id) {
            if (!this.state.user) {
                window.location.href = FLASH_SIGN_IN_URL;
                return;
            }

            const item = this.state.allNews.find((i) => i.id == id);
            if (!item) return;

            const idStr = id.toString();
            const isSaved = this.state.bookmarks.has(idStr);
            const icon = document.getElementById(`gxf-btn-icon-save-${id}`);

            if (isSaved) {
                this.state.bookmarks.delete(idStr);
                if (icon) icon.className = 'fa-regular fa-bookmark text-sm';

                const { error } = await _supabase.from('bookmarks').delete().eq('user_id', this.state.user.id).eq('news_id', idStr);
                if (error) {
                    this.showToast('Error removing bookmark', 'error');
                    this.state.bookmarks.add(idStr);
                    if (icon) icon.className = 'fa-solid fa-bookmark text-gas-green text-sm';
                } else {
                    this.showToast('Removed from Library');
                }
            } else {
                this.state.bookmarks.add(idStr);
                if (icon) icon.className = 'fa-solid fa-bookmark text-gas-green text-sm';

                const { error } = await _supabase.from('bookmarks').insert({
                    user_id: this.state.user.id,
                    news_id: idStr,
                    title: item.title,
                    content: item.content,
                    link: item.link,
                    news_time: item.time.toISOString(),
                });

                if (error) {
                    this.showToast('Error saving bookmark', 'error');
                    this.state.bookmarks.delete(idStr);
                    if (icon) icon.className = 'fa-regular fa-bookmark text-sm';
                } else {
                    this.showToast('Saved to Library');
                }
            }
        },

        renderNav() {
            renderSharedAuthState({
                page: 'flash',
                idPrefix: 'gxf',
                navigation: HEADER_NAVIGATION,
                currentUser: this.state.user,
                displayName: this.state.displayName,
                accountUrl: '/news/flash/account.html',
                signInUrl: FLASH_SIGN_IN_URL,
                activeTitle: 'FLASH',
            });
        },

        toggleMobileMenu() {
            const menu = document.getElementById('gxf-mobile-menu-drawer');
            const overlay = document.getElementById('gxf-mobile-menu-overlay');
            if (!menu || !overlay) return;

            const isHidden = menu.classList.contains('translate-x-full');
            if (isHidden) {
                menu.classList.remove('translate-x-full');
                overlay.classList.remove('hidden');
                overlay.classList.remove('opacity-0');
            } else {
                menu.classList.add('translate-x-full');
                overlay.classList.add('opacity-0');
                setTimeout(() => overlay.classList.add('hidden'), 300);
            }
        },

        showToast(message, type = 'success') {
            const container = document.getElementById('gxf-toast-container');
            if (!container) return;
            const toast = document.createElement('div');
            toast.className = 'gxf-toast';
            toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check text-gas-green' : 'fa-info-circle text-blue-400'}"></i> <span>${message}</span>`;
            container.appendChild(toast);
            toast.offsetHeight;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        },

        loadFromCache() {
            const cachedEN = localStorage.getItem(CACHE_KEY_EN);
            const cachedCN = localStorage.getItem(CACHE_KEY_CN);
            if (cachedEN) {
                try {
                    this.state.allNews = JSON.parse(cachedEN).map((item) => ({ ...item, time: new Date(item.time) }));
                    this.renderList();
                } catch (e) {
                    console.error('Cache EN error:', e);
                }
            }
            if (cachedCN) {
                try {
                    this.state.translations = JSON.parse(cachedCN);
                } catch (e) {
                    console.error('Cache CN error:', e);
                }
            }
        },

        saveToCache() {
            localStorage.setItem(CACHE_KEY_EN, JSON.stringify(this.state.allNews.slice(0, MAX_CACHE_SIZE)));
            localStorage.setItem(CACHE_KEY_CN, JSON.stringify(this.state.translations));
        },

        shouldRunAutoFetch() {
            return Date.now() - this.state.lastAutoFetchAt >= FLASH_POLL_INTERVAL_MS;
        },

        forceRefresh() {
            const icon = document.getElementById('gxf-sync-icon');
            if (icon) icon.classList.add('fa-spin');
            const wrapper = document.getElementById('gxf-flash-items-wrapper');
            if (wrapper) {
                wrapper.innerHTML = '<div class="text-center py-20 text-gray-500"><i class="fa-solid fa-circle-notch fa-spin text-3xl mb-4"></i><br>Syncing News...</div>';
            }
            this.fetchAndMerge().finally(() => {
                if (icon) setTimeout(() => icon.classList.remove('fa-spin'), 1000);
            });
        },

        async fetchAndMerge(isAuto = false) {
            const wrapper = document.getElementById('gxf-flash-items-wrapper');
            if (isAuto) this.state.lastAutoFetchAt = Date.now();
            try {
                const normalized = await this.fetchFlashApiItems('en');

                if (normalized.length === 0) {
                    if (this.state.allNews.length === 0 && wrapper) {
                        wrapper.innerHTML = '<div class="text-center py-20 text-gray-500">No flash news available.</div>';
                    }
                    return;
                }

                const existingIds = new Set(this.state.allNews.map((item) => String(item.id)));
                const freshCount = normalized.filter((item) => !existingIds.has(String(item.id))).length;

                this.state.allNews = normalized;
                this.saveToCache();
                this.renderList();

                if (!isAuto) {
                    if (freshCount > 0) this.showToast(`Synced ${freshCount} new stories.`);
                    else this.showToast('Flash feed is up to date.');
                }
            } catch (e) {
                console.error('Fetch Error:', e);
                if (this.state.allNews.length === 0 && wrapper) {
                    wrapper.innerHTML = '<div class="text-center py-20 text-red-500">Connection Failed. <button onclick="window.GGXFlashApp && window.GGXFlashApp.forceRefresh()" class="underline">Retry</button></div>';
                }
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

        async typeWriter(element, text) {
            const currentHeight = element.offsetHeight;
            element.style.minHeight = `${currentHeight}px`;
            element.innerHTML = '';
            const dot = document.createElement('span');
            dot.className = 'gxf-thinking-circle';
            element.appendChild(dot);
            await new Promise((r) => setTimeout(r, 1000));
            element.innerHTML = '';
            element.classList.add('gxf-typing');
            const chunkSize = 2;
            let i = 0;
            return new Promise((resolve) => {
                const type = () => {
                    if (i < text.length) {
                        element.textContent += text.substring(i, i + chunkSize);
                        i += chunkSize;
                        setTimeout(type, 30 + Math.random() * 20);
                    } else {
                        element.classList.remove('gxf-typing');
                        element.style.minHeight = '';
                        resolve();
                    }
                };
                type();
            });
        },
        async translateItem(id) {
            if (!this.state.user) {
                window.location.href = '/news/flash/user.html';
                return;
            }

            const item = this.state.allNews.find((i) => i.id == id);
            if (!item) return;
            const titleEl = document.getElementById(`gxf-title-${id}`);
            const contentEl = document.getElementById(`gxf-content-${id}`);
            const btnIcon = document.querySelector(`#gxf-btn-trans-${id} i`);
            const btnExpand = document.getElementById(`gxf-btn-expand-${id}`);
            if (!titleEl || !contentEl || !btnIcon) return;

            const expandContent = () => {
                contentEl.classList.remove('line-clamp-4');
                if (btnExpand) btnExpand.innerText = 'Show Less';
            };

            if (titleEl.dataset.translated === 'true') {
                titleEl.innerText = item.title;
                contentEl.innerText = item.content;
                titleEl.dataset.translated = 'false';
                btnIcon.classList.remove('text-gas-green');
                return;
            }

            btnIcon.className = 'fa-solid fa-circle-notch fa-spin text-gas-green';
            if (this.state.translations[id]) {
                const trans = this.state.translations[id];
                btnIcon.className = 'fa-solid fa-language text-gas-green';
                titleEl.dataset.translated = 'true';
                expandContent();
                await this.typeWriter(titleEl, trans.title);
                this.typeWriter(contentEl, trans.content);
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
                this.state.translations[id] = { title: transTitle, content: transContent };
                this.saveToCache();
                titleEl.dataset.translated = 'true';
                btnIcon.className = 'fa-solid fa-language text-gas-green';
                expandContent();
                await this.typeWriter(titleEl, transTitle);
                this.typeWriter(contentEl, transContent);
            } catch (e) {
                console.error('Translate error', e);
                this.showToast('Translation Unavailable', 'error');
                btnIcon.className = 'fa-solid fa-language';
            }
        },

        toggleExpand(id) {
            const contentEl = document.getElementById(`gxf-content-${id}`);
            const btn = document.getElementById(`gxf-btn-expand-${id}`);
            if (!contentEl || !btn) return;

            if (contentEl.classList.contains('line-clamp-4')) {
                contentEl.classList.remove('line-clamp-4');
                btn.innerText = 'Show Less';
            } else {
                contentEl.classList.add('line-clamp-4');
                btn.innerText = 'Show More';
            }
        },

        loadMoreLocal() {
            this.state.visibleCount += ITEMS_PER_PAGE;
            this.renderList();
        },

        renderList() {
            const wrapper = document.getElementById('gxf-flash-items-wrapper');
            const loadMoreBtn = document.getElementById('gxf-load-more-btn');
            const noMoreMsg = document.getElementById('gxf-no-more-msg');
            if (!wrapper || !loadMoreBtn || !noMoreMsg) return;

            this.state.lastDateHeader = null;
            const dataToShow = this.state.allNews.slice(0, this.state.visibleCount);
            if (dataToShow.length === 0) return;

            let html = '';
            dataToShow.forEach((item) => {
                const displayDate = item.time.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                const timeStr = item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

                if (displayDate !== this.state.lastDateHeader) {
                    html += `<div class="gxf-date-divider">${displayDate}</div>`;
                    this.state.lastDateHeader = displayDate;
                }

                const isLong = item.content.length > 180;
                const isSaved = this.state.bookmarks.has(item.id.toString());
                const saveIconClass = isSaved ? 'fa-solid fa-bookmark text-gas-green' : 'fa-regular fa-bookmark';

                html += `
                <div class="pb-8 gxf-news-item-scroll-target min-w-0" id="gxf-flash-${item.id}">
                    <div class="relative flex-1 w-full min-w-0 flex flex-col lg:flex-row group lg:min-h-[120px] bg-[#111] lg:bg-transparent border border-white/10 lg:border-none rounded-xl p-5 lg:p-0 shadow-lg lg:shadow-none max-w-full">
                        <div class="hidden lg:block w-[140px] shrink-0 text-right pr-8 pt-6 font-mono text-gray-400 text-sm font-bold group-hover:text-gas-green transition-colors">${timeStr}</div>
                        <div class="hidden lg:block gxf-timeline-dot bg-[#1F1F1F] border border-gray-700 group-hover:bg-gas-green transition-colors"></div>
                        <div class="flex-1 min-w-0 lg:pl-12 lg:pr-4 lg:pt-4 lg:pb-6 lg:border-l lg:border-transparent lg:hover:bg-white/5 transition-colors">
                            <div class="lg:hidden flex items-center justify-between gap-3 min-w-0 mb-3 border-b border-white/5 pb-2">
                                <span class="font-mono text-gas-green font-bold text-xs tracking-wider">${timeStr}</span>
                                <span class="text-[10px] text-gray-600 font-bold uppercase truncate text-right">${displayDate}</span>
                            </div>
                            <h3 id="gxf-title-${item.id}" onclick="window.open('${item.link}', '_blank')" class="text-lg lg:text-xl font-bold text-white mb-3 leading-relaxed group-hover:text-gas-green transition-colors cursor-pointer text-left break-words">${item.title}</h3>
                            <div id="gxf-content-${item.id}" class="text-[#BBBBBB] text-[15px] lg:text-sm leading-7 mb-4 text-left whitespace-pre-wrap font-light break-all line-clamp-4 overflow-hidden transition-all">${item.content}</div>
                            <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 lg:border-none">
                                <div class="flex items-center gap-4 min-w-0">
                                    ${isLong ? `<button id="gxf-btn-expand-${item.id}" onclick="window.GGXFlashApp && window.GGXFlashApp.toggleExpand('${item.id}')" class="text-xs text-gas-green hover:text-white font-bold uppercase transition-colors">Show More</button>` : ''}
                                    <button id="gxf-btn-trans-${item.id}" onclick="window.GGXFlashApp && window.GGXFlashApp.translateItem('${item.id}')" class="text-gray-500 hover:text-gas-green transition-colors flex items-center gap-1" title="Translate"><i class="fa-solid fa-language text-lg"></i></button>
                                </div>
                                <div class="flex items-center gap-4 shrink-0">
                                    <button onclick="window.GGXFlashApp && window.GGXFlashApp.toggleBookmark('${item.id}')" class="text-gray-500 hover:text-gas-green transition-colors" title="Save to Library"><i id="gxf-btn-icon-save-${item.id}" class="${saveIconClass} text-sm"></i></button>
                                    <button onclick="window.GGXFlashApp && window.GGXFlashApp.openPosterModal('${item.id}')" class="text-gray-500 hover:text-gas-green" title="Poster"><i class="fa-solid fa-camera text-sm"></i></button>
                                    <button onclick="window.GGXFlashApp && window.GGXFlashApp.shareX('${item.id}')" class="text-gray-500 hover:text-white" title="Quick Share to X"><i class="fa-brands fa-x-twitter text-sm"></i></button>
                                    <button onclick="window.GGXFlashApp && window.GGXFlashApp.shareLinkedIn('${item.id}')" class="text-gray-500 hover:text-[#0077B5]" title="Quick Share to LinkedIn"><i class="fa-brands fa-linkedin text-sm"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            });

            wrapper.innerHTML = html;
            loadMoreBtn.classList.toggle('hidden', this.state.visibleCount >= this.state.allNews.length);
            if (this.state.allNews.length > 0) {
                noMoreMsg.classList.toggle('hidden', this.state.visibleCount < this.state.allNews.length);
            }
        },

        async updatePosterDOM(item, displayTitle, displayContent) {
            const posterTime = document.getElementById('gxf-poster-time-text');
            const posterTitle = document.getElementById('gxf-poster-title');
            const posterText = document.getElementById('gxf-poster-text');
            const qrContainer = document.getElementById('gxf-poster-qrcode');
            if (!posterTime || !posterTitle || !posterText || !qrContainer) return;

            posterTime.innerText = `${item.time.toLocaleDateString()} ${item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
            posterTitle.innerText = displayTitle || item.title || '';
            posterText.innerText = displayContent || item.content || '';
            qrContainer.innerHTML = '';
            new QRCode(qrContainer, {
                text: SHARE_URL,
                width: 90,
                height: 90,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.M,
            });
            await new Promise((r) => setTimeout(r, 500));
        },

        async generateCanvas() {
            const captureEl = document.getElementById('gxf-poster-capture-area');
            if (!captureEl) return this.generateFallbackPoster();

            try {
                const canvas = await Promise.race([
                    html2canvas(captureEl, {
                        backgroundColor: null,
                        scale: 3,
                        logging: false,
                        useCORS: true,
                    }),
                    new Promise((_, reject) => {
                        setTimeout(() => reject(new Error('Poster render timeout')), 12000);
                    }),
                ]);
                const url = canvas.toDataURL('image/png');
                this.state.generatedPosterUrl = url;
                return url;
            } catch (e) {
                console.error('Canvas error:', e);
                return this.generateFallbackPoster();
            }
        },

        wrapPosterText(ctx, text, maxWidth, maxLines) {
            const source = String(text || '').replace(/\s+/g, ' ').trim();
            if (!source) return [];

            const lines = [];
            let current = '';
            for (const ch of source) {
                const trial = current + ch;
                if (ctx.measureText(trial).width <= maxWidth) {
                    current = trial;
                } else {
                    if (current) lines.push(current.trim());
                    current = ch;
                    if (lines.length >= maxLines) break;
                }
            }
            if (current && lines.length < maxLines) lines.push(current.trim());
            if (lines.length === maxLines && source.length > lines.join('').length) {
                lines[maxLines - 1] = `${lines[maxLines - 1].replace(/\.\.\.$/, '')}...`;
            }
            return lines;
        },

        generateFallbackPoster() {
            try {
                const width = 1080;
                const height = 1420;
                const padding = 72;
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return null;

                const title = this.state.currentPosterData.title || 'GasGx Flash';
                const content = this.state.currentPosterData.content || '';
                const time = this.state.currentPosterData.time || new Date().toLocaleString();

                const bg = ctx.createLinearGradient(0, 0, width, height);
                bg.addColorStop(0, '#0a0a0a');
                bg.addColorStop(1, '#030303');
                ctx.fillStyle = bg;
                ctx.fillRect(0, 0, width, height);

                ctx.strokeStyle = 'rgba(93, 214, 44, 0.35)';
                ctx.lineWidth = 2;
                ctx.strokeRect(24, 24, width - 48, height - 48);

                ctx.fillStyle = '#5DD62C';
                ctx.font = 'bold 42px Oswald, Inter, sans-serif';
                ctx.fillText('GasGx FLASH', padding, 120);

                ctx.fillStyle = '#A4A4A4';
                ctx.font = '28px Inter, sans-serif';
                ctx.fillText(time, padding, 168);

                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 58px Inter, sans-serif';
                const titleLines = this.wrapPosterText(ctx, title, width - padding * 2, 4);
                let cursorY = 270;
                titleLines.forEach((line) => {
                    ctx.fillText(line, padding, cursorY);
                    cursorY += 78;
                });

                ctx.strokeStyle = 'rgba(255,255,255,0.15)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(padding, cursorY + 12);
                ctx.lineTo(width - padding, cursorY + 12);
                ctx.stroke();

                ctx.fillStyle = '#CFCFCF';
                ctx.font = '36px Inter, sans-serif';
                const bodyLines = this.wrapPosterText(ctx, content, width - padding * 2, 12);
                cursorY += 74;
                bodyLines.forEach((line) => {
                    ctx.fillText(line, padding, cursorY);
                    cursorY += 52;
                });

                ctx.fillStyle = '#5DD62C';
                ctx.font = 'bold 28px Inter, sans-serif';
                ctx.fillText('www.gasgx.com/news/flash/', padding, height - 92);

                const url = canvas.toDataURL('image/png');
                this.state.generatedPosterUrl = url;
                return url;
            } catch (error) {
                console.error('Fallback poster error:', error);
                return null;
            }
        },

        async openPosterModal(id) {
            const item = this.state.allNews.find((i) => i.id == id);
            if (!item) return;

            const srcTitle = document.getElementById(`gxf-title-${id}`);
            const srcContent = document.getElementById(`gxf-content-${id}`);
            const displayTitle = (srcTitle && srcTitle.innerText.trim()) || item.title || '';
            const displayContent = (srcContent && srcContent.innerText.trim()) || item.content || '';

            this.state.currentPosterData = {
                title: displayTitle,
                content: displayContent,
                time: item.time.toLocaleString(),
            };

            const modal = document.getElementById('gxf-poster-modal');
            const container = document.getElementById('gxf-generated-poster-container');
            if (!modal || !container) return;

            container.innerHTML = '<div class="absolute inset-0 flex items-center justify-center"><i class="fa-solid fa-circle-notch fa-spin text-gas-green text-2xl"></i></div>';
            modal.classList.add('active');
            await this.updatePosterDOM(item, displayTitle, displayContent);
            const url = await this.generateCanvas();
            if (url) {
                const img = new Image();
                img.src = url;
                container.innerHTML = '';
                container.appendChild(img);
            } else {
                container.innerHTML = '<div class="w-full min-h-[220px] flex items-center justify-center text-sm text-red-400">Poster generation failed. Please retry.</div>';
                this.showToast('Generation failed', 'error');
            }
        },
        async sharePosterWeChat() {
            this.downloadGeneratedPoster();
            const text = this.generateShareText();
            await this.copyToClipboard(text);
            this.showToast('Image saved and text copied. Opening WeChat...', 'success');
            setTimeout(() => {
                window.location.href = 'weixin://';
            }, 1000);
        },

        async sharePosterX() {
            const text = this.generateTruncatedTweet();
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
            this.showToast('Opening X composer...', 'success');
        },

        async sharePosterLinkedIn() {
            const text = this.generateShareText();
            await this.copyToClipboard(text);
            this.showToast('Text copied. Opening LinkedIn...', 'success');
            setTimeout(() => window.open('https://www.linkedin.com/feed/', '_blank'), 800);
        },

        async shareX(id) {
            const item = this.state.allNews.find((i) => i.id == id);
            if (!item) return;
            this.showToast('Generating for X...', 'success');

            const srcTitle = document.getElementById(`gxf-title-${id}`);
            const srcContent = document.getElementById(`gxf-content-${id}`);
            if (!srcTitle || !srcContent) return;

            this.state.currentPosterData = {
                title: srcTitle.innerText,
                content: srcContent.innerText,
                time: item.time.toLocaleString(),
            };

            await this.updatePosterDOM(item);
            await this.generateCanvas();
            const text = this.generateTruncatedTweet();
            setTimeout(() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank'), 500);
            this.downloadGeneratedPoster();
        },

        async shareLinkedIn(id) {
            const item = this.state.allNews.find((i) => i.id == id);
            if (!item) return;
            this.showToast('Generating for LinkedIn...', 'success');

            const srcTitle = document.getElementById(`gxf-title-${id}`);
            const srcContent = document.getElementById(`gxf-content-${id}`);
            if (!srcTitle || !srcContent) return;

            this.state.currentPosterData = {
                title: srcTitle.innerText,
                content: srcContent.innerText,
                time: item.time.toLocaleString(),
            };

            await this.updatePosterDOM(item);
            await this.generateCanvas();
            const text = this.generateShareText();
            await this.copyToClipboard(text);
            setTimeout(() => window.open('https://www.linkedin.com/feed/', '_blank'), 1500);
            this.downloadGeneratedPoster();
        },

        closePosterModal() {
            document.getElementById('gxf-poster-modal')?.classList.remove('active');
        },

        downloadGeneratedPoster() {
            if (!this.state.generatedPosterUrl) return;
            const link = document.createElement('a');
            link.download = `GasGx-News-${Date.now()}.png`;
            link.href = this.state.generatedPosterUrl;
            link.click();
        },

        generateShareText() {
            return `From GasGx News ${this.state.currentPosterData.time}\n\n"${this.state.currentPosterData.title}"\n\n${this.state.currentPosterData.content}\n\nFlash Link: ${SHARE_URL}\n\n${HASHTAGS}`;
        },

        generateTruncatedTweet() {
            return `From GasGx News\n"${this.state.currentPosterData.title}"\n${SHARE_URL}\n${HASHTAGS}`;
        },

        copyToClipboard(text) {
            return navigator.clipboard.writeText(text).catch((err) => {
                console.error('Could not copy text:', err);
                this.showToast('Clipboard access failed', 'error');
            });
        },
    };

    return flashAppInstance;
}
