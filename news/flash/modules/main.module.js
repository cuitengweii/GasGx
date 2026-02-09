
import { renderSharedAuthState } from '../../shared/modules/layout.shared.js';
import { HEADER_NAVIGATION } from '../../shared/config/navigation.config.js';

const SUPABASE_URL = 'https://mkpcliytqudclkwtewru.supabase.co';
const SUPABASE_KEY = 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';

const API_BASE = 'https://api.theblockbeats.news/v1/open-api/open-flash';
const PROXY_URL = 'https://corsproxy.io/?';
const HASHTAGS = '#GasGx #NaturalGas #EnergyMining #BitcoinMining';
const SHARE_URL = 'https://www.gasgx.com/news/flash/';

const CACHE_KEY_EN = 'gasgx_en_v9_stable';
const CACHE_KEY_CN = 'gasgx_cn_v9_stable';
const MAX_CACHE_SIZE = 100;
const ITEMS_PER_PAGE = 15;

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

    <div class="sticky top-16 z-30 bg-[#050505]/95 backdrop-blur border-b border-white/5 shadow-lg">
        <div class="max-w-[1200px] mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
            <h1 class="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3"><i class="fa-solid fa-bolt text-gas-green animate-pulse"></i> 7x24 Flash News</h1>
            <div class="flex gap-2">
                <button onclick="window.GGXFlashApp && window.GGXFlashApp.forceRefresh()" class="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111] border border-white/10 hover:border-gas-green hover:bg-[#1a1a1a] transition-all cursor-pointer">
                    <span class="text-[10px] font-bold text-gray-400 group-hover:text-white uppercase tracking-wide">Sync</span>
                    <i id="gxf-sync-icon" class="fa-solid fa-rotate-right text-gas-green transition-transform duration-700 text-xs"></i>
                </button>
            </div>
        </div>
    </div>

    <main class="flex-grow w-full max-w-[1200px] mx-auto px-4 lg:px-6 py-6">
        <div class="flex flex-col lg:flex-row gap-0 lg:gap-12 items-start relative">
            <div class="w-full lg:w-[70%] relative min-h-screen">
                <div id="gxf-flash-timeline-container" class="relative">
                    <div class="hidden lg:block gxf-timeline-line"></div>
                    <div id="gxf-flash-items-wrapper" class="space-y-0"><div class="text-center py-20 text-gray-500"><i class="fa-solid fa-circle-notch fa-spin text-3xl mb-4"></i><br>Syncing News...</div></div>
                    <div id="gxf-pagination-controls" class="mt-12 text-center pl-0 lg:pl-[140px] pb-10">
                        <button id="gxf-load-more-btn" onclick="window.GGXFlashApp && window.GGXFlashApp.loadMoreLocal()" class="hidden px-8 py-3 rounded-full border border-white/10 text-xs font-bold text-white hover:bg-white hover:text-black transition-all uppercase tracking-wide">Load More History</button>
                        <div id="gxf-no-more-msg" class="hidden text-xs text-gray-600 font-mono uppercase tracking-widest"><span class="inline-block w-2 h-2 rounded-full bg-gray-800 mr-2"></span> No more history</div>
                    </div>
                </div>
            </div>

            <div class="hidden lg:flex w-[30%] flex-col gap-6 sticky top-40">
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

export function mountFlashMain(container) {
    if (!container) return;
    container.innerHTML = MAIN_TEMPLATE;
}

export function createFlashApp() {
    if (flashAppInstance) return flashAppInstance;

    const { createClient } = supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
        },
        async init() {
            await this.initAuth();
            this.renderNav();
            this.loadFromCache();
            this.fetchAndMerge();
            setInterval(() => this.fetchAndMerge(true), 60000);

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

        async toggleBookmark(id) {
            if (!this.state.user) {
                window.location.href = '/news/flash/user.html';
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
                signInUrl: '/news/flash/user.html',
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
            try {
                const urlEN = PROXY_URL + encodeURIComponent(`${API_BASE}?size=20&page=1&lang=en`);
                const resEN = await fetch(urlEN);
                if (!resEN.ok) throw new Error('API Error');
                const jsonEN = await resEN.json();
                const newDataEN = this.parseJsonData(jsonEN);

                if (newDataEN.length > 0) {
                    const existingIds = new Set(this.state.allNews.map((n) => n.id));
                    const uniqueNew = newDataEN.filter((n) => !existingIds.has(n.id));

                    if (uniqueNew.length > 0) {
                        this.state.allNews = [...uniqueNew, ...this.state.allNews].sort((a, b) => b.time - a.time);
                        if (!isAuto) this.showToast(`Synced ${uniqueNew.length} new stories.`);

                        const queuePayload = uniqueNew
                            .filter((item) => item.link)
                            .map((item) => ({
                                link: item.link,
                                category: 'flash',
                                notes: 'null',
                                status: 'pending',
                                tag_choice: 'flash',
                                publisher: 'GasGx-Researcher',
                                secondary_tag: 'flash',
                            }));

                        if (queuePayload.length > 0) {
                            _supabase
                                .from('scrape_queue')
                                .upsert(queuePayload, { onConflict: 'link', ignoreDuplicates: true })
                                .then(({ error }) => {
                                    if (error) console.error('Auto-scrape queue error:', error);
                                    else console.log(`Queued ${queuePayload.length} items for scraping.`);
                                });
                        }
                    }
                }

                this.saveToCache();
                this.renderList();

                const urlCN = PROXY_URL + encodeURIComponent(`${API_BASE}?size=20&page=1&lang=cn`);
                fetch(urlCN)
                    .then((res) => res.json())
                    .then((jsonCN) => {
                        const newDataCN = this.parseJsonData(jsonCN);
                        if (newDataCN.length > 0) {
                            newDataCN.forEach((item) => {
                                this.state.translations[item.id] = { title: item.title, content: item.content };
                            });
                            this.saveToCache();
                        }
                    })
                    .catch((e) => console.log('CN ignored', e));
            } catch (e) {
                console.error('Fetch Error:', e);
                if (this.state.allNews.length === 0 && wrapper) {
                    wrapper.innerHTML = '<div class="text-center py-20 text-red-500">Connection Failed. <button onclick="window.GGXFlashApp && window.GGXFlashApp.forceRefresh()" class="underline">Retry</button></div>';
                }
            }
        },

        cleanContent(htmlString) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlString;
            const images = tempDiv.getElementsByTagName('img');
            while (images.length > 0) images[0].parentNode.removeChild(images[0]);
            return (tempDiv.textContent || tempDiv.innerText || '').trim();
        },

        parseJsonData(jsonRes) {
            let data = jsonRes;
            if (jsonRes.contents) {
                try {
                    data = JSON.parse(jsonRes.contents);
                } catch {
                    return [];
                }
            }
            if (!data || !data.data || !Array.isArray(data.data.data)) return [];
            return data.data.data.map((item) => {
                const timeMs = parseInt(item.create_time, 10) * 1000;
                return {
                    id: item.id,
                    title: item.title,
                    content: this.cleanContent(item.content),
                    time: new Date(timeMs),
                    link: item.link || '',
                };
            });
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
                <div class="flex lg:block gap-4 pb-8 gxf-news-item-scroll-target" id="gxf-flash-${item.id}">
                    <div class="lg:hidden flex flex-col items-center shrink-0 w-4 relative">
                        <div class="absolute top-0 bottom-0 w-[1px] bg-[#333]"></div>
                        <div class="relative w-2 h-2 rounded-full bg-gas-green shadow-neon mt-[26px] z-10"></div>
                    </div>
                    <div class="relative flex-1 flex flex-col lg:flex-row group lg:min-h-[120px] bg-[#111] lg:bg-transparent border border-white/10 lg:border-none rounded-xl p-5 lg:p-0 shadow-lg lg:shadow-none max-w-full">
                        <div class="hidden lg:block w-[140px] shrink-0 text-right pr-8 pt-6 font-mono text-gray-400 text-sm font-bold group-hover:text-gas-green transition-colors">${timeStr}</div>
                        <div class="hidden lg:block gxf-timeline-dot bg-[#1F1F1F] border border-gray-700 group-hover:bg-gas-green transition-colors"></div>
                        <div class="flex-1 min-w-0 lg:pl-12 lg:pr-4 lg:pt-4 lg:pb-6 lg:border-l lg:border-transparent lg:hover:bg-white/5 transition-colors">
                            <div class="lg:hidden flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                                <span class="font-mono text-gas-green font-bold text-xs tracking-wider">${timeStr}</span>
                                <span class="text-[10px] text-gray-600 font-bold uppercase">${displayDate}</span>
                            </div>
                            <h3 id="gxf-title-${item.id}" onclick="window.open('${item.link}', '_blank')" class="text-lg lg:text-xl font-bold text-white mb-3 leading-relaxed group-hover:text-gas-green transition-colors cursor-pointer text-left break-words">${item.title}</h3>
                            <div id="gxf-content-${item.id}" class="text-[#BBBBBB] text-[15px] lg:text-sm leading-7 mb-4 text-left whitespace-pre-wrap font-light break-all line-clamp-4 overflow-hidden transition-all">${item.content}</div>
                            <div class="flex items-center justify-between pt-3 border-t border-white/10 lg:border-none">
                                <div class="flex items-center gap-4">
                                    ${isLong ? `<button id="gxf-btn-expand-${item.id}" onclick="window.GGXFlashApp && window.GGXFlashApp.toggleExpand('${item.id}')" class="text-xs text-gas-green hover:text-white font-bold uppercase transition-colors">Show More</button>` : ''}
                                    <button id="gxf-btn-trans-${item.id}" onclick="window.GGXFlashApp && window.GGXFlashApp.translateItem('${item.id}')" class="text-gray-500 hover:text-gas-green transition-colors flex items-center gap-1" title="Translate"><i class="fa-solid fa-language text-lg"></i></button>
                                </div>
                                <div class="flex items-center gap-4">
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

        async updatePosterDOM(item) {
            const posterTime = document.getElementById('gxf-poster-time-text');
            const posterTitle = document.getElementById('gxf-poster-title');
            const posterText = document.getElementById('gxf-poster-text');
            const sourceTitle = document.getElementById(`gxf-title-${item.id}`);
            const sourceText = document.getElementById(`gxf-content-${item.id}`);
            const qrContainer = document.getElementById('gxf-poster-qrcode');
            if (!posterTime || !posterTitle || !posterText || !sourceTitle || !sourceText || !qrContainer) return;

            posterTime.innerText = `${item.time.toLocaleDateString()} ${item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
            posterTitle.innerText = sourceTitle.innerText;
            posterText.innerText = sourceText.innerText;
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
            try {
                const canvas = await html2canvas(document.getElementById('gxf-poster-capture-area'), {
                    backgroundColor: null,
                    scale: 3,
                    logging: false,
                    useCORS: true,
                });
                const url = canvas.toDataURL('image/png');
                this.state.generatedPosterUrl = url;
                return url;
            } catch (e) {
                console.error('Canvas error:', e);
                return null;
            }
        },

        async openPosterModal(id) {
            const item = this.state.allNews.find((i) => i.id == id);
            if (!item) return;

            const srcTitle = document.getElementById(`gxf-title-${id}`);
            const srcContent = document.getElementById(`gxf-content-${id}`);
            if (!srcTitle || !srcContent) return;

            this.state.currentPosterData = {
                title: srcTitle.innerText,
                content: srcContent.innerText,
                time: item.time.toLocaleString(),
            };

            const modal = document.getElementById('gxf-poster-modal');
            const container = document.getElementById('gxf-generated-poster-container');
            if (!modal || !container) return;

            container.innerHTML = '<div class="absolute inset-0 flex items-center justify-center"><i class="fa-solid fa-circle-notch fa-spin text-gas-green text-2xl"></i></div>';
            modal.classList.add('active');
            await this.updatePosterDOM(item);
            const url = await this.generateCanvas();
            if (url) {
                const img = new Image();
                img.src = url;
                container.innerHTML = '';
                container.appendChild(img);
            } else {
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
