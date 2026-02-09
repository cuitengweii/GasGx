function mobileToggleExpr(appGlobal) {
    return `window.${appGlobal} && window.${appGlobal}.toggleMobileMenu()`;
}

function renderNewsHomeHeader({ idPrefix, appGlobal }) {
    const onToggle = mobileToggleExpr(appGlobal);
    return `
    <section class="gsh-header-shell">
        <header class="fixed top-0 w-full z-50 gsh-header-glass h-16">
            <div class="max-w-[1600px] mx-auto px-4 lg:px-6 h-full flex justify-between items-center">
                <div class="flex items-center gap-8 h-full">
                    <a href="/news/index.html" class="flex items-center gap-1 group" aria-label="GasGx News Home">
                        <div class="flex flex-col justify-center -space-y-1">
                            <span class="text-2xl font-bold italic text-white tracking-tighter font-header group-hover:text-gas-green transition-colors">GasGx</span>
                            <span class="text-[9px] font-bold text-gas-green tracking-[0.2em] uppercase leading-none pl-0.5">MINING NEWS</span>
                        </div>
                    </a>

                    <nav id="${idPrefix}-desktop-nav" class="hidden lg:flex items-center gap-1 h-full pl-6 border-l border-white/5 ml-4"></nav>
                </div>

                <div class="flex items-center gap-3 md:gap-4">
                    <div id="${idPrefix}-auth-btn-container" class="hidden lg:block ml-4"></div>

                    <a href="/news/flash/account.html" id="${idPrefix}-header-account-trigger" class="lg:hidden flex items-center gap-2 text-[10px] font-bold text-gas-green border border-gas-green/30 bg-gas-green/10 px-3 py-1.5 rounded-full hover:bg-gas-green hover:text-black transition-all max-w-[140px]" aria-label="Account">
                        <i class="fa-solid fa-user"></i>
                        <span id="${idPrefix}-mobile-trigger-text" class="truncate">SIGN IN</span>
                    </a>

                    <button onclick="${onToggle}" class="lg:hidden text-white text-lg ml-2" aria-label="Toggle Menu">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                </div>
            </div>
        </header>

        <div class="pt-16 bg-[#080808] border-b border-white/5 relative z-40 shadow-sm">
            <div class="max-w-[1800px] mx-auto flex items-center h-8 overflow-hidden">
                <div class="flex items-center gap-2 px-4 h-full shrink-0 border-r border-white/10 bg-[#050505] z-10">
                    <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-gas-green opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-gas-green"></span></span>
                    <span class="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Live Data</span>
                </div>
                <div class="flex-1 overflow-hidden relative h-full flex items-center">
                    <div id="${idPrefix}-live-data-container" class="animate-marquee whitespace-nowrap flex items-center gap-12 px-4">
                        <div class="text-xs font-mono text-gray-600">Initializing Data Stream...</div>
                    </div>
                </div>
            </div>
        </div>

        <div id="${idPrefix}-mobile-menu-overlay" onclick="${onToggle}" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] hidden gsh-fade-transition lg:hidden"></div>

        <div id="${idPrefix}-mobile-menu-container" class="fixed top-0 right-0 bottom-0 w-64 bg-[#0F0F0F]/95 backdrop-blur-xl border-l border-white/10 z-[70] transform translate-x-full gsh-drawer-transition shadow-2xl flex flex-col pt-6 px-6 lg:hidden">
            <div class="flex justify-between items-center mb-8">
                <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Global Menu</span>
                <button onclick="${onToggle}" class="text-gray-400 hover:text-white" aria-label="Close Menu"><i class="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <div id="${idPrefix}-mobile-nav-links" class="space-y-4"></div>
        </div>
    </section>`;
}

function renderFlashHeader({ idPrefix, appGlobal }) {
    const onToggle = mobileToggleExpr(appGlobal);
    return `
    <section class="gsh-header-shell">
        <header class="fixed top-0 w-full z-50 gsh-header-glass h-16">
            <div class="max-w-[1600px] mx-auto px-6 h-full flex justify-between items-center">
                <div class="flex items-center gap-8 h-full">
                    <a href="/news/index.html" class="flex items-center gap-1 group" aria-label="GasGx News Home">
                        <div class="flex flex-col justify-center -space-y-1">
                            <span class="text-2xl font-bold italic text-white tracking-tighter font-header group-hover:text-gas-green transition-colors">GasGx</span>
                            <span class="text-[9px] font-bold text-gas-green tracking-[0.2em] uppercase leading-none pl-0.5">MINING NEWS</span>
                        </div>
                    </a>

                    <nav id="${idPrefix}-desktop-nav" class="hidden lg:flex items-center gap-1 h-full pl-6 border-l border-white/5 ml-4"></nav>
                </div>

                <div class="flex items-center gap-3 md:gap-4">
                    <div id="${idPrefix}-desktop-auth-container" class="hidden lg:flex items-center gap-2 ml-4"></div>
                    <div id="${idPrefix}-mobile-auth-trigger-wrapper" class="lg:hidden"></div>

                    <button onclick="${onToggle}" class="lg:hidden text-white text-xl w-8 h-8 flex items-center justify-center hover:text-gas-green transition-colors" aria-label="Toggle Menu">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                </div>
            </div>
        </header>

        <div id="${idPrefix}-mobile-menu-container" class="fixed inset-0 z-[60] pointer-events-none">
            <div id="${idPrefix}-mobile-menu-overlay" onclick="${onToggle}" class="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-300 pointer-events-auto hidden"></div>
            <div id="${idPrefix}-mobile-menu-drawer" class="absolute top-0 right-0 bottom-0 w-64 bg-[#0F0F0F]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col pt-6 px-6 transform translate-x-full gsh-drawer-transition pointer-events-auto">
                <div class="flex justify-between items-center mb-8">
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">GLOBAL MENU</span>
                    <button onclick="${onToggle}" class="text-gray-400 hover:text-white" aria-label="Close Menu"><i class="fa-solid fa-xmark text-xl"></i></button>
                </div>
                <div class="space-y-4" id="${idPrefix}-mobile-nav-links"></div>
            </div>
        </div>

        <div class="pt-16 bg-[#080808] border-b border-white/5 relative z-40 shadow-sm">
            <div class="max-w-[1800px] mx-auto flex items-center h-8 overflow-hidden">
                <div class="flex items-center gap-2 px-4 h-full shrink-0 border-r border-white/10 bg-[#050505] z-10">
                    <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-gas-green opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-gas-green"></span></span>
                    <span class="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Live Data</span>
                </div>
                <div class="flex-1 overflow-hidden relative h-full flex items-center">
                    <div id="${idPrefix}-live-data-container" class="animate-marquee whitespace-nowrap flex items-center gap-12 px-4">
                        <div class="flex items-center gap-2 text-xs font-mono text-gray-400"><span class="text-purple-400 font-bold">BTC</span><span class="text-white font-bold">$42,380</span><span class="text-red-500 text-[10px] ml-1">-1.3%</span></div>
                        <div class="flex items-center gap-2 text-xs font-mono text-gray-400"><span class="text-purple-400 font-bold">ETH</span><span class="text-white font-bold">$2,250</span><span class="text-gas-green text-[10px] ml-1">+0.5%</span></div>
                        <div class="flex items-center gap-2 text-xs font-mono text-gray-400"><span class="text-purple-400 font-bold">Hashrate</span><span class="text-white font-bold">750 EH/s</span><span class="text-gas-green text-[10px] ml-1">ATH</span></div>
                        <div class="flex items-center gap-2 text-xs font-mono text-gray-400"><span class="text-purple-400 font-bold">Difficulty</span><span class="text-white font-bold">82.3T</span><span class="text-gas-green text-[10px] ml-1">+2%</span></div>
                    </div>
                </div>
            </div>
        </div>
    </section>`;
}

function renderFullFooter() {
    return `
    <footer class="gsh-footer gsh-footer-full bg-[#020202] border-t border-[#1F1F1F] mt-auto pt-10 pb-8 text-sm relative z-20">
        <div class="max-w-[1600px] mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div class="space-y-4">
                    <div class="flex items-center gap-2">
                        <span class="text-2xl font-bold italic text-white tracking-tighter">GasGx</span>
                    </div>
                    <p class="text-xs text-gray-500 leading-relaxed">The definitive intelligence platform for the energy-compute convergence.</p>
                </div>
                <div>
                    <h4 class="text-white font-bold text-xs uppercase tracking-widest mb-4">Public Services</h4>
                    <ul class="space-y-3 text-xs text-gray-500">
                        <li>Mining Calculator</li>
                        <li>Gas Price Index</li>
                        <li>Miner Rankings</li>
                        <li>API Docs</li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-white font-bold text-xs uppercase tracking-widest mb-4">Legal</h4>
                    <ul class="space-y-3 text-xs text-gray-500">
                        <li>Privacy Policy</li>
                        <li>Terms of Service</li>
                        <li>Contact Us</li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-white font-bold text-xs uppercase tracking-widest mb-4">Connect</h4>
                    <div class="grid grid-cols-6 gap-4 md:flex md:flex-wrap">
                        <a href="#" class="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all hover:-translate-y-1" aria-label="X"><i class="fa-brands fa-x-twitter text-lg"></i></a>
                        <a href="#" class="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center text-gray-400 hover:bg-[#229ED9] hover:text-white transition-all hover:-translate-y-1" aria-label="Telegram"><i class="fa-brands fa-telegram text-lg"></i></a>
                        <a href="#" class="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center text-gray-400 hover:bg-[#5865F2] hover:text-white transition-all hover:-translate-y-1" aria-label="Discord"><i class="fa-brands fa-discord text-lg"></i></a>
                        <a href="#" class="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center text-gray-400 hover:bg-[#FF0000] hover:text-white transition-all hover:-translate-y-1" aria-label="YouTube"><i class="fa-brands fa-youtube text-lg"></i></a>
                        <a href="#" class="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center text-gray-400 hover:bg-[#0077B5] hover:text-white transition-all hover:-translate-y-1" aria-label="LinkedIn"><i class="fa-brands fa-linkedin text-lg"></i></a>
                        <a href="#" class="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center text-gray-400 hover:bg-[#1877F2] hover:text-white transition-all hover:-translate-y-1" aria-label="Facebook"><i class="fa-brands fa-facebook text-lg"></i></a>
                        <a href="#" class="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center text-gray-400 hover:bg-[#000000] hover:text-white transition-all hover:-translate-y-1" aria-label="TikTok"><i class="fa-brands fa-tiktok text-lg"></i></a>
                        <a href="#" class="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center text-gray-400 hover:bg-[#07C160] hover:text-white transition-all hover:-translate-y-1" aria-label="WeChat"><i class="fa-brands fa-weixin text-lg"></i></a>
                        <a href="#" class="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center text-gray-400 hover:bg-[#25D366] hover:text-white transition-all hover:-translate-y-1" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp text-lg"></i></a>
                        <a href="#" class="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center text-gray-400 hover:bg-[#E1306C] hover:text-white transition-all hover:-translate-y-1" aria-label="Instagram"><i class="fa-brands fa-instagram text-lg"></i></a>
                        <a href="#" class="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center text-gray-400 transition-all hover:-translate-y-1 hover:bg-[#FF2442] hover:text-white" aria-label="Xiaohongshu"><span class="font-black text-[9px] leading-none">XHS</span></a>
                        <a href="#" class="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center text-gray-400 hover:bg-[#FF9900] hover:text-white transition-all hover:-translate-y-1" aria-label="Video"><i class="fa-solid fa-circle-play text-lg"></i></a>
                    </div>
                </div>
            </div>
            <div class="border-t border-white/5 pt-8 text-xs text-gray-600 text-center">&copy; 2026 GasGx Technology. All rights reserved.</div>
        </div>
    </footer>`;
}

function renderMinimalFooter() {
    return `
    <footer class="gsh-footer gsh-footer-minimal hidden lg:block bg-[#020202] border-t border-[#1F1F1F] mt-auto pt-10 pb-8 text-sm relative z-20">
        <div class="max-w-[1600px] mx-auto px-6">
            <div class="border-t border-white/5 pt-8 text-xs text-gray-600 text-center">&copy; 2026 GasGx Technology. All rights reserved.</div>
        </div>
    </footer>`;
}

const RUNTIME_NAV_STYLE_ID = 'gsh-runtime-nav-styles';

function ensureRuntimeNavStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(RUNTIME_NAV_STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = RUNTIME_NAV_STYLE_ID;
    style.textContent = `
        .gsh-header-glass{background:rgba(5,5,5,.78)!important;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.08)}
        .gsh-drawer-transition{transition:transform .3s cubic-bezier(.4,0,.2,1)}
        .gsh-fade-transition{transition:opacity .3s ease-in-out}
        .gsh-nav-item{position:relative;height:100%;display:flex;align-items:center}
        .gsh-nav-link{display:inline-flex;align-items:center;gap:.35rem}
        .gsh-nav-link-active{background:rgba(93,214,44,.08)}
        .gsh-nav-caret{font-size:10px;opacity:.75;transition:transform .2s ease}
        .gsh-nav-item:hover .gsh-nav-caret,.gsh-nav-item:focus-within .gsh-nav-caret{transform:rotate(180deg)}
        .gsh-nav-submenu{position:absolute;left:0;top:calc(100% + 8px);min-width:220px;background:rgba(10,10,10,.98);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:8px;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(6px);transition:opacity .2s ease,transform .2s ease,visibility .2s ease;z-index:80;backdrop-filter:blur(12px);box-shadow:0 12px 32px rgba(0,0,0,.45)}
        .gsh-nav-item:hover>.gsh-nav-submenu,.gsh-nav-item:focus-within>.gsh-nav-submenu{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0)}
        .gsh-nav-submenu-link{display:block;border-radius:8px;padding:8px 10px;color:#b6b6b6;font-size:12px;font-weight:700;line-height:1.2;text-transform:uppercase;letter-spacing:.04em;text-decoration:none;transition:color .2s ease,background-color .2s ease}
        .gsh-nav-submenu-link:hover{color:#5dd62c;background:rgba(93,214,44,.1)}
        .gsh-nav-submenu-link-active{color:#5dd62c;background:rgba(93,214,44,.14)}
        .gsh-mobile-nav-group+.gsh-mobile-nav-group{margin-top:.25rem}
        .gsh-mobile-subnav{margin:.35rem 0 .25rem 1.8rem;padding-left:.75rem;border-left:1px solid rgba(255,255,255,.12);display:flex;flex-direction:column;gap:.2rem}
        .gsh-mobile-subnav-link{color:#9ca3af;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;text-decoration:none;padding:4px 0;transition:color .2s ease}
        .gsh-mobile-subnav-link:hover,.gsh-mobile-subnav-link-active{color:#5dd62c}
        .gsh-footer a{text-decoration:none}
        .gsh-footer ul{list-style:none;margin:0;padding:0}
    `;

    document.head.appendChild(style);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function resolveDisplayName(currentUser, displayName) {
    if (!currentUser) return 'Sign In';
    if (displayName && String(displayName).trim()) return String(displayName).trim();

    const email = currentUser.email || '';
    const emailPrefix = typeof email === 'string' && email.includes('@') ? email.split('@')[0] : email;
    return emailPrefix || 'Sign In';
}

function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
}

function normalizePath(value) {
    if (!value) return '';
    let path = String(value).trim().toLowerCase();
    if (!path) return '';

    path = path.split('#')[0].split('?')[0];
    if (!path) return '';

    if (path.endsWith('/index.html')) {
        path = path.slice(0, -'/index.html'.length);
    }

    if (path.length > 1) {
        path = path.replace(/\/+$/, '');
    }

    return path;
}

function isPathActive(itemPath, activePath) {
    const normalizedItemPath = normalizePath(itemPath);
    const normalizedActivePath = normalizePath(activePath);

    if (!normalizedItemPath || !normalizedActivePath) return false;
    if (normalizedItemPath === normalizedActivePath) return true;
    if (normalizedItemPath === '/news') return false;
    return normalizedActivePath.startsWith(`${normalizedItemPath}/`);
}

function isNavItemActive(item, activeTitle, activePath) {
    const titleMatch = normalizeText(item?.title) && normalizeText(item?.title) === normalizeText(activeTitle);
    const pathMatch = isPathActive(item?.path, activePath);
    return Boolean(titleMatch || pathMatch);
}

function getNavChildren(item) {
    if (!Array.isArray(item?.children)) return [];
    return item.children.filter((child) => child && child.title && child.path);
}

function renderDesktopSubmenu(children, activeChildTitle, activePath) {
    if (!children.length) return '';

    const submenuItems = children
        .map((child) => {
            const childTitle = escapeHtml(child.title);
            const childPath = escapeHtml(child.path);
            const isActive = isNavItemActive(child, activeChildTitle, activePath);
            return `<a href="${childPath}" class="gsh-nav-submenu-link${isActive ? ' gsh-nav-submenu-link-active' : ''}">${childTitle}</a>`;
        })
        .join('');

    return `<div class="gsh-nav-submenu">${submenuItems}</div>`;
}

function renderDesktopNav(page, navigation, activeTitle, activePath, activeChildTitle) {
    if (!Array.isArray(navigation) || navigation.length === 0) return '';

    return navigation
        .map((item) => {
            const title = escapeHtml(item?.title || '');
            const path = escapeHtml(item?.path || '#');
            const children = getNavChildren(item);
            const hasChildren = children.length > 0;
            const hasActiveChild = hasChildren && children.some((child) => isNavItemActive(child, activeChildTitle, activePath));
            const isActive = isNavItemActive(item, activeTitle, activePath) || hasActiveChild;
            const colorClass = isActive ? 'text-gas-green gsh-nav-link-active' : 'text-gray-400';
            const extra = page === 'flash' ? ' whitespace-nowrap' : '';
            const caret = hasChildren ? '<i class="fa-solid fa-chevron-down gsh-nav-caret"></i>' : '';
            const submenu = hasChildren ? renderDesktopSubmenu(children, activeChildTitle, activePath) : '';

            return `
                <div class="gsh-nav-item">
                    <a href="${path}" class="${colorClass} text-xs font-bold hover:text-white px-4 py-2 transition-colors uppercase tracking-wide rounded-full${extra} gsh-nav-link">
                        <span>${title}</span>${caret}
                    </a>
                    ${submenu}
                </div>
            `;
        })
        .join('');
}

function renderMobileNav(navigation, activeTitle, activePath, activeChildTitle) {
    if (!Array.isArray(navigation) || navigation.length === 0) return '';

    return navigation
        .map((item) => {
            const title = escapeHtml(item?.title || '');
            const path = escapeHtml(item?.path || '#');
            const icon = escapeHtml(item?.icon || 'fa-circle');
            const children = getNavChildren(item);
            const hasChildren = children.length > 0;
            const isParentActive = isNavItemActive(item, activeTitle, activePath);
            const parentClass = isParentActive ? 'text-gas-green' : 'text-gray-300';

            const childLinks = hasChildren
                ? `
                    <div class="gsh-mobile-subnav">
                        ${children
                            .map((child) => {
                                const childTitle = escapeHtml(child.title);
                                const childPath = escapeHtml(child.path);
                                const isChildActive = isNavItemActive(child, activeChildTitle, activePath);
                                return `<a href="${childPath}" class="gsh-mobile-subnav-link${isChildActive ? ' gsh-mobile-subnav-link-active' : ''}">${childTitle}</a>`;
                            })
                            .join('')}
                    </div>
                `
                : '';

            return `
                <div class="gsh-mobile-nav-group">
                    <a href="${path}" class="flex items-center gap-3 text-sm font-bold ${parentClass} hover:text-gas-green py-2 border-b border-white/5 transition-colors">
                        <i class="fa-solid ${icon} w-5 text-center"></i> ${title}
                    </a>
                    ${childLinks}
                </div>
            `;
        })
        .join('');
}

function renderNewsHomeAuthState({ idPrefix, isLogged, displayName, accountUrl, signInUrl }) {
    const desktopAuthContainer = document.getElementById(`${idPrefix}-auth-btn-container`);
    const mobileTrigger = document.getElementById(`${idPrefix}-header-account-trigger`);
    const mobileTriggerText = document.getElementById(`${idPrefix}-mobile-trigger-text`);

    const safeName = escapeHtml(displayName);
    const desktopTarget = escapeHtml(isLogged ? accountUrl : signInUrl);
    const mobileTarget = isLogged ? accountUrl : signInUrl;

    if (desktopAuthContainer) {
        desktopAuthContainer.innerHTML = `
            <a href="${desktopTarget}" class="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gas-green text-black hover:bg-white transition-all text-xs font-bold uppercase tracking-wider shadow-neon">
                <i class="fa-solid fa-user"></i> <span class="max-w-[100px] truncate">${safeName}</span>
            </a>
        `;
    }

    if (mobileTriggerText) {
        mobileTriggerText.textContent = isLogged ? displayName : 'SIGN IN';
    }

    if (mobileTrigger) {
        mobileTrigger.href = mobileTarget;
    }
}

function renderFlashAuthState({ idPrefix, isLogged, displayName, accountUrl, signInUrl }) {
    const desktopAuthContainer = document.getElementById(`${idPrefix}-desktop-auth-container`);
    const mobileAuthTriggerWrapper = document.getElementById(`${idPrefix}-mobile-auth-trigger-wrapper`);
    const safeName = escapeHtml(displayName);
    const targetUrl = escapeHtml(isLogged ? accountUrl : signInUrl);
    const iconClass = isLogged ? 'fa-user' : 'fa-right-to-bracket';

    if (desktopAuthContainer) {
        desktopAuthContainer.innerHTML = `
            <a href="${targetUrl}" class="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gas-green text-black hover:bg-white transition-all text-xs font-bold uppercase tracking-wider shadow-neon cursor-pointer">
                <i class="fa-solid ${iconClass}"></i> <span>${safeName}</span>
            </a>
        `;
    }

    if (mobileAuthTriggerWrapper) {
        mobileAuthTriggerWrapper.innerHTML = `
            <a href="${targetUrl}" class="flex items-center gap-2 text-[10px] font-bold text-gas-green border border-gas-green/30 bg-gas-green/10 px-3 py-1.5 rounded-full hover:bg-gas-green hover:text-black transition-all max-w-[140px]">
                <i class="fa-solid ${iconClass}"></i>
                <span class="truncate">${safeName}</span>
            </a>
        `;
    }
}

export function renderSharedAuthState(options = {}) {
    ensureRuntimeNavStyles();

    const page = options.page || 'news-home';
    const idPrefix = options.idPrefix || (page === 'flash' ? 'gxf' : 'ggx');
    const navigation = Array.isArray(options.navigation) ? options.navigation : [];
    const currentUser = options.currentUser || null;
    const isLogged = Boolean(currentUser);
    const displayName = resolveDisplayName(currentUser, options.displayName);
    const accountUrl = options.accountUrl || '/news/flash/account.html';
    const signInUrl = options.signInUrl || '/news/flash/user.html';
    const activeTitle = options.activeTitle || '';
    const activeChildTitle = options.activeChildTitle || '';
    const activePath = options.activePath || (typeof window !== 'undefined' ? window.location.pathname : '');

    const desktopNav = document.getElementById(`${idPrefix}-desktop-nav`);
    const mobileNavLinks = document.getElementById(`${idPrefix}-mobile-nav-links`);

    if (desktopNav) {
        desktopNav.innerHTML = renderDesktopNav(page, navigation, activeTitle, activePath, activeChildTitle);
    }

    if (mobileNavLinks) {
        mobileNavLinks.innerHTML = renderMobileNav(navigation, activeTitle, activePath, activeChildTitle);
    }

    if (page === 'flash') {
        renderFlashAuthState({ idPrefix, isLogged, displayName, accountUrl, signInUrl });
    } else {
        renderNewsHomeAuthState({ idPrefix, isLogged, displayName, accountUrl, signInUrl });
    }
}

export function mountSharedHeader(container, options = {}) {
    if (!container) return;

    const page = options.page || 'news-home';
    const idPrefix = options.idPrefix || (page === 'flash' ? 'gxf' : 'ggx');
    const appGlobal = options.appGlobal || (page === 'flash' ? 'GGXFlashApp' : 'GGXNewsHomeApp');

    container.innerHTML = page === 'flash'
        ? renderFlashHeader({ idPrefix, appGlobal })
        : renderNewsHomeHeader({ idPrefix, appGlobal });
}

export function mountSharedFooter(container, options = {}) {
    if (!container) return;

    const variant = options.variant || 'full';
    container.innerHTML = variant === 'minimal' ? renderMinimalFooter() : renderFullFooter();
}
