import {
    createSiteShellMegaItem,
    createSiteShellMegaSection,
    createSiteShellNavChild,
    createSiteShellNavItem,
    createSiteShellPartner,
    createSiteShellSocialLink,
    deepClone,
    loadSiteShellConfig,
    normalizeSiteShellConfig,
    resetSiteShellConfigCache,
    savePublishedSiteShellConfig,
} from './site-shell.module.js?v=20260321site06';

const moduleState = {
    draft: null,
    source: 'static',
    error: null,
    row: null,
    dirty: false,
    saving: false,
    saveError: null,
    lastSavedAt: '',
    expanded: new Set(),
    collapsed: new Set(),
    deps: null,
    boundContent: null,
};

const SHARED_TEXT_FIELDS = [
    { key: 'tagline', label: '页头标语' },
    { key: 'footerTagline', label: '页脚标语' },
    { key: 'strategicPartners', label: '合作伙伴标题' },
    { key: 'contactUs', label: '联系入口标题' },
    { key: 'privacyPolicy', label: '隐私政策标题' },
    { key: 'authLogin', label: '登录文案' },
    { key: 'authLogout', label: '退出文案' },
    { key: 'account', label: '账号文案' },
    { key: 'welcome', label: '欢迎前缀' },
    { key: 'languageEnglish', label: '英文按钮文案' },
    { key: 'languageChinese', label: '中文按钮文案' },
];

const HOME_PAGE_LOCALIZED_FIELDS = [
    { path: 'pages.home.meta.title', label: '页面标题' },
    { path: 'pages.home.meta.description', label: '页面描述' },
    { path: 'pages.home.heroCard.label', label: '范围标签' },
    { path: 'pages.home.heroCard.unit', label: '范围单位' },
    { path: 'pages.home.map.loadingText', label: '地图加载文案' },
    { path: 'pages.home.map.rotateHint', label: '地图旋转提示' },
    { path: 'pages.home.ranking.title', label: '排行榜标题' },
    { path: 'pages.home.ranking.legendLegal', label: '图例：合法' },
    { path: 'pages.home.ranking.legendRestricted', label: '图例：受限' },
    { path: 'pages.home.ranking.legendBanned', label: '图例：禁止' },
    { path: 'pages.home.capture.modalTitle', label: '截图弹窗标题' },
    { path: 'pages.home.capture.modalDescription', label: '截图弹窗说明' },
    { path: 'pages.home.capture.closeLabel', label: '截图弹窗关闭文案' },
    { path: 'pages.home.capture.qrSubtitle', label: '二维码副标题' },
    { path: 'pages.home.capture.qrHint', label: '二维码提示' },
    { path: 'pages.home.capture.watermarkTagline', label: '水印标语' },
];

const ABOUT_COMPANY_LOCALIZED_FIELDS = [
    { path: 'pages.aboutCompany.meta.title', label: '页面标题' },
    { path: 'pages.aboutCompany.texts.zh.hero_badge', label: '头图徽标（中）', direct: true },
    { path: 'pages.aboutCompany.texts.en.hero_badge', label: '头图徽标（英）', direct: true },
    { path: 'pages.aboutCompany.texts.ru.hero_badge', label: '头图徽标（俄）', direct: true },
    { path: 'pages.aboutCompany.texts.zh.hero_title_1', label: '头图主标题 1（中）', direct: true },
    { path: 'pages.aboutCompany.texts.en.hero_title_1', label: '头图主标题 1（英）', direct: true },
    { path: 'pages.aboutCompany.texts.ru.hero_title_1', label: '头图主标题 1（俄）', direct: true },
    { path: 'pages.aboutCompany.texts.zh.hero_title_2', label: '头图主标题 2（中）', direct: true },
    { path: 'pages.aboutCompany.texts.en.hero_title_2', label: '头图主标题 2（英）', direct: true },
    { path: 'pages.aboutCompany.texts.ru.hero_title_2', label: '头图主标题 2（俄）', direct: true },
    { path: 'pages.aboutCompany.texts.zh.hero_desc', label: '头图说明（中）', direct: true },
    { path: 'pages.aboutCompany.texts.en.hero_desc', label: '头图说明（英）', direct: true },
    { path: 'pages.aboutCompany.texts.ru.hero_desc', label: '头图说明（俄）', direct: true },
    { path: 'pages.aboutCompany.texts.zh.cta_title', label: 'CTA 标题（中）', direct: true },
    { path: 'pages.aboutCompany.texts.en.cta_title', label: 'CTA 标题（英）', direct: true },
    { path: 'pages.aboutCompany.texts.ru.cta_title', label: 'CTA 标题（俄）', direct: true },
    { path: 'pages.aboutCompany.texts.zh.cta_desc', label: 'CTA 描述（中）', direct: true },
    { path: 'pages.aboutCompany.texts.en.cta_desc', label: 'CTA 描述（英）', direct: true },
    { path: 'pages.aboutCompany.texts.ru.cta_desc', label: 'CTA 描述（俄）', direct: true },
];

const ABOUT_CONTACT_LOCALIZED_FIELDS = [
    { path: 'pages.aboutContact.meta.title', label: '页面标题' },
    { path: 'pages.aboutContact.texts.zh.page_badge', label: '页面徽标（中）', direct: true },
    { path: 'pages.aboutContact.texts.en.page_badge', label: '页面徽标（英）', direct: true },
    { path: 'pages.aboutContact.texts.ru.page_badge', label: '页面徽标（俄）', direct: true },
    { path: 'pages.aboutContact.texts.zh.page_title', label: '页面标题文案（中）', direct: true },
    { path: 'pages.aboutContact.texts.en.page_title', label: '页面标题文案（英）', direct: true },
    { path: 'pages.aboutContact.texts.ru.page_title', label: '页面标题文案（俄）', direct: true },
    { path: 'pages.aboutContact.texts.zh.page_desc', label: '页面说明（中）', direct: true },
    { path: 'pages.aboutContact.texts.en.page_desc', label: '页面说明（英）', direct: true },
    { path: 'pages.aboutContact.texts.ru.page_desc', label: '页面说明（俄）', direct: true },
    { path: 'pages.aboutContact.texts.zh.social_hint', label: '社交提示（中）', direct: true },
    { path: 'pages.aboutContact.texts.en.social_hint', label: '社交提示（英）', direct: true },
    { path: 'pages.aboutContact.texts.ru.social_hint', label: '社交提示（俄）', direct: true },
    { path: 'pages.aboutContact.texts.zh.scan_hint', label: '扫码提示（中）', direct: true },
    { path: 'pages.aboutContact.texts.en.scan_hint', label: '扫码提示（英）', direct: true },
    { path: 'pages.aboutContact.texts.ru.scan_hint', label: '扫码提示（俄）', direct: true },
];

function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function textLabel(value, fallback = '未命名') {
    if (value && typeof value === 'object') {
        const zh = String(value.zh || '').trim();
        const en = String(value.en || '').trim();
        return en || zh || fallback;
    }
    return String(value || fallback).trim() || fallback;
}

function bilingualLabel(value, fallback = '未命名') {
    if (value && typeof value === 'object') {
        const zh = String(value.zh || '').trim();
        const en = String(value.en || '').trim();
        if (en && zh && en !== zh) return `${en} / ${zh}`;
        return en || zh || fallback;
    }
    return String(value || fallback).trim() || fallback;
}

function navTypeLabel(type) {
    const current = String(type || 'link').trim().toLowerCase();
    if (current === 'menu') return '下拉菜单';
    if (current === 'mega') return '大菜单';
    return '链接';
}

function formatSavedTime(value) {
    const date = new Date(value || '');
    if (Number.isNaN(date.getTime())) return '';
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
}

function parsePath(path) {
    return String(path || '')
        .split('.')
        .filter(Boolean)
        .map((segment) => (/^\d+$/.test(segment) ? Number(segment) : segment));
}

function getPathValue(root, path) {
    return parsePath(path).reduce((cursor, segment) => (cursor == null ? undefined : cursor[segment]), root);
}

function setPathValue(root, path, value) {
    const segments = parsePath(path);
    if (!segments.length) return;

    let cursor = root;
    for (let index = 0; index < segments.length; index += 1) {
        const segment = segments[index];
        const isLast = index === segments.length - 1;
        if (isLast) {
            cursor[segment] = value;
            return;
        }

        const nextSegment = segments[index + 1];
        if (cursor[segment] == null) {
            cursor[segment] = typeof nextSegment === 'number' ? [] : {};
        }
        cursor = cursor[segment];
    }
}

function getArray(path) {
    const draft = getDraftConfig();
    const current = getPathValue(draft, path);
    if (Array.isArray(current)) return current;
    setPathValue(draft, path, []);
    return getPathValue(draft, path);
}

function getDraftConfig() {
    if (!moduleState.draft) {
        moduleState.draft = normalizeSiteShellConfig({}, {});
    }
    return moduleState.draft;
}

function syncRuntimePreview() {
    if (typeof window !== 'undefined') {
        window.GASGX_SITE_SHELL_CONFIG = deepClone(getDraftConfig());
    }
}

function markDirty() {
    moduleState.dirty = true;
    moduleState.saveError = null;
    syncRuntimePreview();
}

function setExpanded(key, nextValue) {
    if (nextValue) {
        moduleState.expanded.add(key);
        moduleState.collapsed.delete(key);
        return;
    }
    moduleState.expanded.delete(key);
    moduleState.collapsed.add(key);
}

function isExpanded(key, fallback = false) {
    if (moduleState.expanded.has(key)) return true;
    if (moduleState.collapsed.has(key)) return false;
    return fallback;
}

function expandDefaults(config) {
    const navList = Array.isArray(config.navigation) ? config.navigation : [];
    setExpanded('site:brand', true);
    setExpanded('site:shared-text', true);
    setExpanded('site:home', true);
    setExpanded('site:about-company', true);
    setExpanded('site:about-contact', true);
    if (navList.length) {
        setExpanded('nav:0', true);
        if (navList[0]?.type === 'menu') setExpanded('nav:0:children', true);
        if (navList[0]?.type === 'mega') setExpanded('nav:0:sections', true);
    }
    setExpanded('footer:display', true);
    setExpanded('footer:contact', true);
}

async function ensureLoaded(forceRefresh = false) {
    if (!forceRefresh && moduleState.draft) return moduleState;
    const loaded = await loadSiteShellConfig(forceRefresh);
    moduleState.draft = deepClone(loaded.config);
    moduleState.source = loaded.source || 'static';
    moduleState.error = loaded.error || null;
    moduleState.row = loaded.row || null;
    moduleState.dirty = false;
    moduleState.saving = false;
    moduleState.saveError = null;
    moduleState.lastSavedAt = loaded.row?.updated_at || '';
    moduleState.expanded.clear();
    moduleState.collapsed.clear();
    syncRuntimePreview();
    expandDefaults(moduleState.draft);
    return moduleState;
}

function createTemplate(template) {
    switch (template) {
        case 'top-menu':
            return createSiteShellNavItem('menu');
        case 'top-mega':
            return createSiteShellNavItem('mega');
        case 'nav-child':
            return createSiteShellNavChild();
        case 'mega-section':
            return createSiteShellMegaSection();
        case 'mega-item':
            return createSiteShellMegaItem();
        case 'social-link':
            return createSiteShellSocialLink({ enabled: true, visible: true });
        case 'partner':
            return createSiteShellPartner();
        case 'top-link':
        default:
            return createSiteShellNavItem('link');
    }
}

function buildFooterGroups(config) {
    const navItems = Array.isArray(config.navigation) ? config.navigation.filter((item) => item && item.visible !== false) : [];
    return navItems
        .filter((item) => {
            const path = String(item.path || '').trim();
            return path && path !== '/' && path !== '/index.html';
        })
        .map((item) => {
            if (item.type === 'menu') {
                return {
                    title: textLabel(item.title),
                    count: (item.children || []).filter((entry) => entry && entry.visible !== false).length,
                };
            }
            if (item.type === 'mega') {
                return {
                    title: textLabel(item.title),
                    count: (item.sections || []).reduce((sum, section) => {
                        if (!section || section.visible === false) return sum;
                        return sum + (Array.isArray(section.items) ? section.items.filter((entry) => entry && entry.visible !== false).length : 0);
                    }, 0),
                };
            }
            return { title: textLabel(item.title), count: 1 };
        });
}

function renderStatusMeta() {
    const sourceLabel = moduleState.source === 'supabase' ? '已发布配置' : '静态回退';
    const syncLabel = moduleState.saving
        ? '保存中...'
        : moduleState.saveError
          ? '保存失败'
          : moduleState.dirty
            ? '有未同步改动'
            : moduleState.lastSavedAt
              ? `已同步 ${formatSavedTime(moduleState.lastSavedAt)}`
              : '已同步';

    return `
        <div class="ams-site-meta-row">
            <span class="ams-status-pill ${moduleState.source === 'supabase' ? 'is-ok' : 'is-warn'}">${esc(sourceLabel)}</span>
            <span class="ams-status-pill ${moduleState.saveError ? 'is-warn' : moduleState.saving ? 'is-warn' : 'is-ok'}">${esc(syncLabel)}</span>
        </div>
    `;
}

function renderSourceBanner(title, copy) {
    const errorBlock = moduleState.error
        ? `<div class="ams-site-notice-copy">发布态配置不可用，当前已回退到静态配置。原因：${esc(moduleState.error.message || '加载失败')}</div>`
        : '';
    const saveErrorBlock = moduleState.saveError
        ? `<div class="ams-site-notice-copy">保存失败：${esc(moduleState.saveError.message || '未知错误')}</div>`
        : '';

    return `
        <section class="ams-card ams-site-hero">
            <div class="ams-site-hero-copy">
                <p class="ams-eyebrow">主站配置后台</p>
                <h2>${esc(title)}</h2>
                <p class="ams-hero-text">${esc(copy)}</p>
            </div>
            ${renderStatusMeta()}
            ${errorBlock || saveErrorBlock ? `<div class="ams-site-notice">${errorBlock}${saveErrorBlock}</div>` : ''}
        </section>
    `;
}

function renderHeaderPreview(config) {
    const items = Array.isArray(config.navigation) ? config.navigation.filter((item) => item && item.visible !== false) : [];
    return `
        <div class="ams-site-preview-block">
            <div class="ams-section-head">
                <div>
                    <h3>页头预览</h3>
                    <p>这里展示同一份配置渲染出的一级导航效果。</p>
                </div>
            </div>
            <div class="ams-site-preview-nav">
                ${items.length ? items.map((item) => `<span class="ams-site-preview-chip"><strong>${esc(textLabel(item.title))}</strong><em>${esc(navTypeLabel(item.type))}</em></span>`).join('') : '<div class="ams-empty">当前没有可见导航项。</div>'}
            </div>
        </div>
    `;
}

function renderFooterPreview(config) {
    const footer = config.footer || {};
    const groups = buildFooterGroups(config);
    const socialLinks = Array.isArray(footer.socialLinks) ? footer.socialLinks.filter((item) => item && item.enabled !== false && item.visible !== false && item.hidden !== true) : [];
    const partners = Array.isArray(footer.partners) ? footer.partners.filter((item) => item && item.visible !== false) : [];
    return `
        <div class="ams-site-preview-block">
            <div class="ams-section-head">
                <div>
                    <h3>页脚预览</h3>
                    <p>页脚导航分组由同一份导航树自动生成。</p>
                </div>
            </div>
            <div class="ams-site-preview-stack">
                <div class="ams-site-preview-pane">
                    <strong>页脚分组</strong>
                    <div class="ams-site-preview-list">
                        ${groups.length ? groups.map((group) => `<span class="ams-site-preview-row"><span>${esc(group.title)}</span><em>${group.count} 个链接</em></span>`).join('') : '<div class="ams-empty">当前没有页脚分组。</div>'}
                    </div>
                </div>
                <div class="ams-site-preview-pane">
                    <strong>特殊区块</strong>
                    <div class="ams-site-preview-list">
                        <span class="ams-site-preview-row"><span>联系入口</span><em>${esc(footer.contact?.label || '未设置')}</em></span>
                        <span class="ams-site-preview-row"><span>社交入口</span><em>${socialLinks.length} 个启用</em></span>
                        <span class="ams-site-preview-row"><span>合作伙伴</span><em>${partners.length} 个启用</em></span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderGeneralPreview(config) {
    const site = config.site || {};
    const aboutCompany = config.pages?.aboutCompany || {};
    const aboutContact = config.pages?.aboutContact || {};
    const brand = site.brand || {};
    const features = site.features || {};
    const mainAuth = site.mainAuth || {};
    const providerRollout = mainAuth.providerRollout || {};
    const sharedText = config.sharedText || {};
    const home = config.pages?.home || {};
    const zhText = sharedText.zh || {};
    const enText = sharedText.en || {};

    return `
        <div class="ams-site-preview-block">
            <div class="ams-section-head">
                <div>
                    <h3>主站配置预览</h3>
                    <p>这里汇总共享壳实际会消费的品牌、文案和运行开关。</p>
                </div>
            </div>
            <div class="ams-site-preview-stack">
                <div class="ams-site-preview-pane">
                    <strong>品牌信息</strong>
                    <div class="ams-site-preview-list">
                        <span class="ams-site-preview-row"><span>品牌名</span><em>${esc(brand.name || 'GasGx')}</em></span>
                        <span class="ams-site-preview-row"><span>首页地址</span><em>${esc(brand.homeHref || '/index.html')}</em></span>
                        <span class="ams-site-preview-row"><span>页脚说明</span><em>${esc(brand.footerMeta || '--')}</em></span>
                    </div>
                </div>
                <div class="ams-site-preview-pane">
                    <strong>运行开关</strong>
                    <div class="ams-site-preview-list">
                        <span class="ams-site-preview-row"><span>返回顶部</span><em>${features.backToTopEnabled === false ? '关闭' : '开启'}</em></span>
                        <span class="ams-site-preview-row"><span>聊天机器人</span><em>${features.chatbotEnabled === true ? '开启' : '关闭'}</em></span>
                        <span class="ams-site-preview-row"><span>聊天接口</span><em>${esc(features.chatApiUrl || '默认')}</em></span>
                    </div>
                </div>
                <div class="ams-site-preview-pane">
                    <strong>共享文案</strong>
                    <div class="ams-site-preview-list">
                        <span class="ams-site-preview-row"><span>页头标语</span><em>${esc(enText.tagline || zhText.tagline || '--')}</em></span>
                        <span class="ams-site-preview-row"><span>页脚标语</span><em>${esc(enText.footerTagline || zhText.footerTagline || '--')}</em></span>
                        <span class="ams-site-preview-row"><span>合作伙伴标题</span><em>${esc(enText.strategicPartners || zhText.strategicPartners || '--')}</em></span>
                    </div>
                </div>
                <div class="ams-site-preview-pane">
                    <strong>首页配置</strong>
                    <div class="ams-site-preview-list">
                        <span class="ams-site-preview-row"><span>页面标题</span><em>${esc(home.meta?.title?.en || home.meta?.title?.zh || '--')}</em></span>
                        <span class="ams-site-preview-row"><span>范围值</span><em>${esc(home.heroCard?.value || '--')} ${esc(home.heroCard?.unit?.en || home.heroCard?.unit?.zh || '')}</em></span>
                        <span class="ams-site-preview-row"><span>排行榜标题</span><em>${esc(home.ranking?.title?.en || home.ranking?.title?.zh || '--')}</em></span>
                    </div>
                </div>
                <div class="ams-site-preview-pane">
                    <strong>主站认证</strong>
                    <div class="ams-site-preview-list">
                        <span class="ams-site-preview-row"><span>登录地址</span><em>${esc(mainAuth.signInUrl || '/account/user.html')}</em></span>
                        <span class="ams-site-preview-row"><span>账号地址</span><em>${esc(mainAuth.accountUrl || '/account/account.html')}</em></span>
                        <span class="ams-site-preview-row"><span>返回地址缓存键</span><em>${esc(mainAuth.returnUrlStorageKey || 'gx_main_return_url')}</em></span>
                        <span class="ams-site-preview-row"><span>第三方登录</span><em>${esc(['Google', providerRollout.twitter ? 'X' : null, providerRollout.linkedin ? 'LinkedIn' : null].filter(Boolean).join(' / '))}</em></span>
                    </div>
                </div>
                <div class="ams-site-preview-pane">
                    <strong>关于页面</strong>
                    <div class="ams-site-preview-list">
                        <span class="ams-site-preview-row"><span>公司介绍页</span><em>${esc(aboutCompany.meta?.title?.en || aboutCompany.meta?.title?.zh || '--')}</em></span>
                        <span class="ams-site-preview-row"><span>联系页面</span><em>${esc(aboutContact.meta?.title?.en || aboutContact.meta?.title?.zh || '--')}</em></span>
                        <span class="ams-site-preview-row"><span>联系邮箱</span><em>${esc(aboutContact.contactEmail || '--')}</em></span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderToggleButton(action, path, expanded) {
    return `<button class="ams-site-tree-toggle" type="button" data-site-action="${esc(action)}" data-site-toggle-path="${esc(path)}" aria-expanded="${expanded ? 'true' : 'false'}"><i class="fa-solid ${expanded ? 'fa-chevron-down' : 'fa-chevron-right'}"></i></button>`;
}

function renderFieldPair(path, label, value = {}) {
    return `
        <div class="ams-site-field-grid">
            <div class="ams-field">
                <label>${esc(label)}（中）</label>
                <input class="ams-input" data-site-config-path="${esc(`${path}.zh`)}" value="${esc(value?.zh || '')}" placeholder="请输入中文">
            </div>
            <div class="ams-field">
                <label>${esc(label)}（英）</label>
                <input class="ams-input" data-site-config-path="${esc(`${path}.en`)}" value="${esc(value?.en || '')}" placeholder="请输入英文">
            </div>
        </div>
    `;
}

function renderTextField(path, label, value = '', placeholder = '') {
    return `
        <div class="ams-field">
            <label>${esc(label)}</label>
            <input class="ams-input" data-site-config-path="${esc(path)}" value="${esc(value || '')}" placeholder="${esc(placeholder)}">
        </div>
    `;
}

function renderLocalizedTextFields(field, sharedText = {}) {
    const zhText = sharedText.zh || {};
    const enText = sharedText.en || {};
    return `
        <div class="ams-site-field-grid">
            <div class="ams-field">
                <label>${esc(field.label)}（中）</label>
                <input class="ams-input" data-site-config-path="${esc(`sharedText.zh.${field.key}`)}" value="${esc(zhText[field.key] || '')}" placeholder="请输入中文">
            </div>
            <div class="ams-field">
                <label>${esc(field.label)}（英）</label>
                <input class="ams-input" data-site-config-path="${esc(`sharedText.en.${field.key}`)}" value="${esc(enText[field.key] || '')}" placeholder="请输入英文">
            </div>
        </div>
    `;
}

function renderLocalizedPathField(path, label, value = {}) {
    return `
        <div class="ams-site-field-grid">
            <div class="ams-field">
                <label>${esc(label)}（中）</label>
                <input class="ams-input" data-site-config-path="${esc(`${path}.zh`)}" value="${esc(value?.zh || '')}" placeholder="请输入中文">
            </div>
            <div class="ams-field">
                <label>${esc(label)}（英）</label>
                <input class="ams-input" data-site-config-path="${esc(`${path}.en`)}" value="${esc(value?.en || '')}" placeholder="请输入英文">
            </div>
        </div>
    `;
}

function renderDescriptorField(field, config) {
    if (field.direct) {
        return `
            <div class="ams-field">
                <label>${esc(field.label)}</label>
                <input class="ams-input" data-site-config-path="${esc(field.path)}" value="${esc(getPathValue(config, field.path) || '')}" placeholder="">
            </div>
        `;
    }
    return renderLocalizedPathField(field.path, field.label, getPathValue(config, field.path));
}

function renderItemFields(basePath, item, options = {}) {
    const showType = options.showType === true;
    return `
        <div class="ams-site-editor-panel">
            ${renderFieldPair(`${basePath}.title`, options.titleLabel || '标题', item.title)}
            <div class="ams-site-field-grid ams-site-field-grid-wide">
                ${showType ? `
                    <div class="ams-field">
                        <label>类型</label>
                        <select class="ams-select" data-site-action="change-nav-type" data-site-nav-index="${esc(options.navIndex)}">
                            <option value="link" ${item.type === 'link' ? 'selected' : ''}>链接</option>
                            <option value="menu" ${item.type === 'menu' ? 'selected' : ''}>下拉菜单</option>
                            <option value="mega" ${item.type === 'mega' ? 'selected' : ''}>大菜单</option>
                        </select>
                    </div>
                ` : ''}
                <div class="ams-field">
                    <label>路径</label>
                    <input class="ams-input" data-site-config-path="${esc(`${basePath}.path`)}" value="${esc(item.path || '')}" placeholder="/products">
                </div>
                <div class="ams-field">
                    <label>图标</label>
                    <input class="ams-input" data-site-config-path="${esc(`${basePath}.icon`)}" value="${esc(item.icon || '')}" placeholder="fa-solid fa-house">
                </div>
                <div class="ams-field">
                    <label>打开目标</label>
                    <input class="ams-input" data-site-config-path="${esc(`${basePath}.target`)}" value="${esc(item.target || '')}" placeholder="_self / _blank">
                </div>
                <div class="ams-field">
                    <label>Rel 属性</label>
                    <input class="ams-input" data-site-config-path="${esc(`${basePath}.rel`)}" value="${esc(item.rel || '')}" placeholder="noopener noreferrer">
                </div>
                <label class="ams-social-toggle ams-site-visible-toggle">
                    <input type="checkbox" data-site-config-path="${esc(`${basePath}.visible`)}" data-site-input-type="boolean" ${item.visible === false ? '' : 'checked'}>
                    <span>显示</span>
                </label>
            </div>
            ${item.type === 'mega' ? `
                <div class="ams-field">
                    <label>大菜单列样式</label>
                    <input class="ams-input" data-site-config-path="${esc(`${basePath}.gridCols`)}" value="${esc(item.gridCols || '')}" placeholder="grid-cols-5">
                </div>
            ` : ''}
        </div>
    `;
}

function renderMenuChild(child, topIndex, childIndex) {
    const key = `nav:${topIndex}:child:${childIndex}`;
    const expanded = isExpanded(key, false);
    const basePath = `navigation.${topIndex}.children.${childIndex}`;
    return `
        <div class="ams-site-tree-node ams-site-tree-node-child">
            <div class="ams-site-tree-row">
                <div class="ams-site-tree-main">
                    ${renderToggleButton('toggle-expand', key, expanded)}
                    <div class="ams-site-tree-copy ams-site-tree-copy-toggle" data-site-action="toggle-expand" data-site-toggle-path="${esc(key)}">
                        <strong>${esc(bilingualLabel(child.title, `子项 ${childIndex + 1}`))}</strong>
                        <span>${esc(child.path || '未设置路径')} · ${child.visible === false ? '隐藏' : '显示'}</span>
                    </div>
                </div>
                <div class="ams-site-tree-actions">
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="toggle-expand" data-site-toggle-path="${esc(key)}">${expanded ? '收起编辑' : '编辑'}</button>
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="navigation.${topIndex}.children" data-site-index="${childIndex}" data-site-direction="-1" ${childIndex <= 0 ? 'disabled' : ''}>上移</button>
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="navigation.${topIndex}.children" data-site-index="${childIndex}" data-site-direction="1">下移</button>
                    <button class="ams-btn ams-btn-danger" type="button" data-site-action="delete-array-item" data-site-array-path="navigation.${topIndex}.children" data-site-index="${childIndex}">删除</button>
                </div>
            </div>
            ${expanded ? renderItemFields(basePath, child, { titleLabel: '子项标题', navIndex: topIndex }) : ''}
        </div>
    `;
}

function renderMegaItem(item, topIndex, sectionIndex, itemIndex) {
    const key = `nav:${topIndex}:section:${sectionIndex}:item:${itemIndex}`;
    const expanded = isExpanded(key, false);
    const basePath = `navigation.${topIndex}.sections.${sectionIndex}.items.${itemIndex}`;
    return `
        <div class="ams-site-tree-node ams-site-tree-node-leaf">
            <div class="ams-site-tree-row">
                <div class="ams-site-tree-main">
                    ${renderToggleButton('toggle-expand', key, expanded)}
                    <div class="ams-site-tree-copy ams-site-tree-copy-toggle" data-site-action="toggle-expand" data-site-toggle-path="${esc(key)}">
                        <strong>${esc(bilingualLabel(item.title, `项目 ${itemIndex + 1}`))}</strong>
                        <span>${esc(item.path || '未设置路径')} · ${item.visible === false ? '隐藏' : '显示'}</span>
                    </div>
                </div>
                <div class="ams-site-tree-actions">
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="toggle-expand" data-site-toggle-path="${esc(key)}">${expanded ? '收起编辑' : '编辑'}</button>
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="navigation.${topIndex}.sections.${sectionIndex}.items" data-site-index="${itemIndex}" data-site-direction="-1" ${itemIndex <= 0 ? 'disabled' : ''}>上移</button>
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="navigation.${topIndex}.sections.${sectionIndex}.items" data-site-index="${itemIndex}" data-site-direction="1">下移</button>
                    <button class="ams-btn ams-btn-danger" type="button" data-site-action="delete-array-item" data-site-array-path="navigation.${topIndex}.sections.${sectionIndex}.items" data-site-index="${itemIndex}">删除</button>
                </div>
            </div>
            ${expanded ? renderItemFields(basePath, item, { titleLabel: '项目标题', navIndex: topIndex }) : ''}
        </div>
    `;
}

function renderMegaSection(section, topIndex, sectionIndex) {
    const key = `nav:${topIndex}:section:${sectionIndex}`;
    const expanded = isExpanded(key, false);
    const basePath = `navigation.${topIndex}.sections.${sectionIndex}`;
    const items = Array.isArray(section.items) ? section.items : [];
    return `
        <div class="ams-site-tree-node ams-site-tree-node-section">
            <div class="ams-site-tree-row">
                <div class="ams-site-tree-main">
                    ${renderToggleButton('toggle-expand', key, expanded)}
                    <div class="ams-site-tree-copy ams-site-tree-copy-toggle" data-site-action="toggle-expand" data-site-toggle-path="${esc(key)}">
                        <strong>${esc(bilingualLabel(section.header, `分组 ${sectionIndex + 1}`))}</strong>
                        <span>${items.length} 个项目 · ${section.visible === false ? '隐藏' : '显示'}</span>
                    </div>
                </div>
                <div class="ams-site-tree-actions">
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="navigation.${topIndex}.sections" data-site-index="${sectionIndex}" data-site-direction="-1" ${sectionIndex <= 0 ? 'disabled' : ''}>上移</button>
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="navigation.${topIndex}.sections" data-site-index="${sectionIndex}" data-site-direction="1">下移</button>
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="push-array-item" data-site-array-path="${esc(`${basePath}.items`)}" data-site-template="mega-item">添加项目</button>
                    <button class="ams-btn ams-btn-danger" type="button" data-site-action="delete-array-item" data-site-array-path="navigation.${topIndex}.sections" data-site-index="${sectionIndex}">删除</button>
                </div>
            </div>
            ${expanded ? `
                <div class="ams-site-editor-panel">
                    ${renderFieldPair(`${basePath}.header`, '分组标题', section.header)}
                    <label class="ams-social-toggle ams-site-visible-toggle">
                        <input type="checkbox" data-site-config-path="${esc(`${basePath}.visible`)}" data-site-input-type="boolean" ${section.visible === false ? '' : 'checked'}>
                        <span>显示</span>
                    </label>
                </div>
                <div class="ams-site-tree-children">
                    ${items.length ? items.map((entry, itemIndex) => renderMegaItem(entry, topIndex, sectionIndex, itemIndex)).join('') : '<div class="ams-empty">当前还没有项目。</div>'}
                </div>
            ` : ''}
        </div>
    `;
}

function renderTopNavItem(item, index) {
    const key = `nav:${index}`;
    const expanded = isExpanded(key, index === 0);
    const menuListOpen = isExpanded(`${key}:children`, index === 0 && item.type === 'menu');
    const megaListOpen = isExpanded(`${key}:sections`, index === 0 && item.type === 'mega');
    const children = Array.isArray(item.children) ? item.children : [];
    const sections = Array.isArray(item.sections) ? item.sections : [];
    return `
        <article class="ams-site-tree-node ams-site-tree-node-root">
            <div class="ams-site-tree-row">
                <div class="ams-site-tree-main">
                    ${renderToggleButton('toggle-expand', key, expanded)}
                    <div class="ams-site-tree-copy ams-site-tree-copy-toggle" data-site-action="toggle-expand" data-site-toggle-path="${esc(key)}">
                        <strong>${esc(bilingualLabel(item.title, `导航 ${index + 1}`))}</strong>
                        <span>${esc(navTypeLabel(item.type))} · ${item.visible === false ? '隐藏' : '显示'} · ${esc(item.path || '/')}</span>
                    </div>
                </div>
                <div class="ams-site-tree-actions">
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="navigation" data-site-index="${index}" data-site-direction="-1" ${index <= 0 ? 'disabled' : ''}>上移</button>
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="navigation" data-site-index="${index}" data-site-direction="1">下移</button>
                    ${item.type === 'menu' ? `<button class="ams-btn ams-btn-muted" type="button" data-site-action="push-array-item" data-site-array-path="navigation.${index}.children" data-site-template="nav-child">添加子项</button>` : ''}
                    ${item.type === 'mega' ? `<button class="ams-btn ams-btn-muted" type="button" data-site-action="push-array-item" data-site-array-path="navigation.${index}.sections" data-site-template="mega-section">添加分组</button>` : ''}
                    <button class="ams-btn ams-btn-danger" type="button" data-site-action="delete-array-item" data-site-array-path="navigation" data-site-index="${index}">删除</button>
                </div>
            </div>
            ${expanded ? `
                ${renderItemFields(`navigation.${index}`, item, { titleLabel: '导航标题', showType: true, navIndex: index })}
                ${item.type === 'menu' ? `
                    <div class="ams-site-branch">
                        <div class="ams-site-branch-head">
                            <div class="ams-site-branch-title ams-site-tree-copy-toggle" data-site-action="toggle-expand" data-site-toggle-path="${esc(`${key}:children`)}">二级菜单项 <span>${children.length}</span></div>
                            ${renderToggleButton('toggle-expand', `${key}:children`, menuListOpen)}
                        </div>
                        ${menuListOpen ? `<div class="ams-site-tree-children">${children.length ? children.map((child, childIndex) => renderMenuChild(child, index, childIndex)).join('') : '<div class="ams-empty">当前还没有子项。</div>'}</div>` : ''}
                    </div>
                ` : ''}
                ${item.type === 'mega' ? `
                    <div class="ams-site-branch">
                        <div class="ams-site-branch-head">
                            <div class="ams-site-branch-title ams-site-tree-copy-toggle" data-site-action="toggle-expand" data-site-toggle-path="${esc(`${key}:sections`)}">大菜单分组 <span>${sections.length}</span></div>
                            ${renderToggleButton('toggle-expand', `${key}:sections`, megaListOpen)}
                        </div>
                        ${megaListOpen ? `<div class="ams-site-tree-children">${sections.length ? sections.map((section, sectionIndex) => renderMegaSection(section, index, sectionIndex)).join('') : '<div class="ams-empty">当前还没有分组。</div>'}</div>` : ''}
                    </div>
                ` : ''}
            ` : ''}
        </article>
    `;
}

function renderSocialRow(item, index) {
    const key = `footer:social:${index}`;
    const expanded = isExpanded(key, false);
    const basePath = `footer.socialLinks.${index}`;
    return `
        <div class="ams-site-tree-node ams-site-tree-node-child">
            <div class="ams-site-tree-row">
                <div class="ams-site-tree-main">
                    ${renderToggleButton('toggle-expand', key, expanded)}
                    <div class="ams-site-tree-copy ams-site-tree-copy-toggle" data-site-action="toggle-expand" data-site-toggle-path="${esc(key)}">
                        <strong>${esc(item.id || `social-${index + 1}`)}</strong>
                        <span>${esc(item.mode === 'qr' ? '二维码' : '链接')} · ${item.enabled === false ? '停用' : '启用'}</span>
                    </div>
                </div>
                <div class="ams-site-tree-actions">
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="footer.socialLinks" data-site-index="${index}" data-site-direction="-1" ${index <= 0 ? 'disabled' : ''}>上移</button>
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="footer.socialLinks" data-site-index="${index}" data-site-direction="1">下移</button>
                    <button class="ams-btn ams-btn-danger" type="button" data-site-action="delete-array-item" data-site-array-path="footer.socialLinks" data-site-index="${index}">删除</button>
                </div>
            </div>
            ${expanded ? `
                <div class="ams-site-editor-panel">
                    <div class="ams-site-field-grid ams-site-field-grid-wide">
                        <div class="ams-field"><label>标识 ID</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.id`)}" value="${esc(item.id || '')}" placeholder="linkedin"></div>
                        <div class="ams-field"><label>模式</label><select class="ams-select" data-site-config-path="${esc(`${basePath}.mode`)}"><option value="link" ${item.mode === 'link' ? 'selected' : ''}>链接</option><option value="qr" ${item.mode === 'qr' ? 'selected' : ''}>二维码</option></select></div>
                        <div class="ams-field"><label>跳转地址</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.href`)}" value="${esc(item.href || '')}" placeholder="https://..."></div>
                        <div class="ams-field"><label>二维码类型</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.qrType`)}" value="${esc(item.qrType || '')}" placeholder="wechat"></div>
                        <div class="ams-field"><label>图标类名</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.iconClass`)}" value="${esc(item.iconClass || '')}" placeholder="fa-brands fa-linkedin"></div>
                        <div class="ams-field"><label>文字图标</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.text`)}" value="${esc(item.text || '')}" placeholder="XHS"></div>
                        <div class="ams-field"><label>辅助说明</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.ariaLabel`)}" value="${esc(item.ariaLabel || '')}" placeholder="例如：打开 LinkedIn"></div>
                        <div class="ams-field"><label>打开目标</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.target`)}" value="${esc(item.target || '')}" placeholder="_blank"></div>
                        <div class="ams-field"><label>Rel 属性</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.rel`)}" value="${esc(item.rel || '')}" placeholder="noopener noreferrer"></div>
                        <label class="ams-social-toggle"><input type="checkbox" data-site-config-path="${esc(`${basePath}.enabled`)}" data-site-input-type="boolean" ${item.enabled === false ? '' : 'checked'}><span>启用</span></label>
                        <label class="ams-social-toggle"><input type="checkbox" data-site-config-path="${esc(`${basePath}.visible`)}" data-site-input-type="boolean" ${item.visible === false ? '' : 'checked'}><span>显示</span></label>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function renderPartnerRow(item, index) {
    const key = `footer:partner:${index}`;
    const expanded = isExpanded(key, false);
    const basePath = `footer.partners.${index}`;
    return `
        <div class="ams-site-tree-node ams-site-tree-node-child">
            <div class="ams-site-tree-row">
                <div class="ams-site-tree-main">
                    ${renderToggleButton('toggle-expand', key, expanded)}
                    <div class="ams-site-tree-copy ams-site-tree-copy-toggle" data-site-action="toggle-expand" data-site-toggle-path="${esc(key)}">
                        <strong>${esc(item.title || `伙伴 ${index + 1}`)}</strong>
                        <span>${esc(item.href || '未设置链接')} · ${item.visible === false ? '隐藏' : '显示'}</span>
                    </div>
                </div>
                <div class="ams-site-tree-actions">
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="footer.partners" data-site-index="${index}" data-site-direction="-1" ${index <= 0 ? 'disabled' : ''}>上移</button>
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="footer.partners" data-site-index="${index}" data-site-direction="1">下移</button>
                    <button class="ams-btn ams-btn-danger" type="button" data-site-action="delete-array-item" data-site-array-path="footer.partners" data-site-index="${index}">删除</button>
                </div>
            </div>
            ${expanded ? `
                <div class="ams-site-editor-panel">
                    <div class="ams-site-field-grid ams-site-field-grid-wide">
                        <div class="ams-field"><label>标识 ID</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.id`)}" value="${esc(item.id || '')}" placeholder="bitmain"></div>
                        <div class="ams-field"><label>标题</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.title`)}" value="${esc(item.title || '')}" placeholder="BITMAIN"></div>
                        <div class="ams-field"><label>跳转地址</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.href`)}" value="${esc(item.href || '')}" placeholder="https://www.bitmain.com/"></div>
                        <div class="ams-field"><label>打开目标</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.target`)}" value="${esc(item.target || '')}" placeholder="_blank"></div>
                        <div class="ams-field"><label>Rel 属性</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.rel`)}" value="${esc(item.rel || '')}" placeholder="noopener noreferrer"></div>
                        <label class="ams-social-toggle"><input type="checkbox" data-site-config-path="${esc(`${basePath}.visible`)}" data-site-input-type="boolean" ${item.visible === false ? '' : 'checked'}><span>显示</span></label>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function renderNavigationPage() {
    const config = getDraftConfig();
    const navigation = Array.isArray(config.navigation) ? config.navigation : [];
    return `
        ${renderSourceBanner('主站导航管理', '按照主站真实的一级导航与二级导航结构管理页头和页脚。字段改动会自动异步同步，不再依赖统一保存。')}
        <section class="ams-site-layout">
            <div class="ams-site-main">
                <article class="ams-card">
                    <div class="ams-section-head">
                        <div>
                            <h3>导航树</h3>
                            <p>一级导航直接映射主站导航。展开节点后即可编辑标题、类型、路径与二级结构，修改会立即同步。</p>
                        </div>
                        <div class="ams-site-header-actions">
                            <button class="ams-btn ams-btn-muted" type="button" data-site-action="refresh-site-shell">刷新发布态</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-site-action="expand-all-nav">全部展开</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-site-action="collapse-all-nav">全部收起</button>
                        </div>
                    </div>
                    <div class="ams-site-inline-actions">
                        <button class="ams-btn ams-btn-muted" type="button" data-site-action="push-array-item" data-site-array-path="navigation" data-site-template="top-link">添加链接</button>
                        <button class="ams-btn ams-btn-muted" type="button" data-site-action="push-array-item" data-site-array-path="navigation" data-site-template="top-menu">添加下拉菜单</button>
                        <button class="ams-btn ams-btn-muted" type="button" data-site-action="push-array-item" data-site-array-path="navigation" data-site-template="top-mega">添加大菜单</button>
                    </div>
                    <div class="ams-site-tree">
                        ${navigation.length ? navigation.map((item, index) => renderTopNavItem(item, index)).join('') : '<div class="ams-empty">当前还没有导航项。</div>'}
                    </div>
                </article>
            </div>
            <aside class="ams-site-sidebar">
                <div id="ams-site-header-preview">${renderHeaderPreview(config)}</div>
                <div id="ams-site-footer-preview">${renderFooterPreview(config)}</div>
            </aside>
        </section>
    `;
}

function renderFooterSection(key, title, copy, body) {
    const expanded = isExpanded(key, false);
    return `
        <section class="ams-site-tree-node ams-site-tree-node-root">
            <div class="ams-site-tree-row">
                <div class="ams-site-tree-main">
                    ${renderToggleButton('toggle-expand', key, expanded)}
                    <div class="ams-site-tree-copy ams-site-tree-copy-toggle" data-site-action="toggle-expand" data-site-toggle-path="${esc(key)}">
                        <strong>${esc(title)}</strong>
                        <span>${esc(copy)}</span>
                    </div>
                </div>
            </div>
            ${expanded ? `<div class="ams-site-editor-panel">${body}</div>` : ''}
        </section>
    `;
}

function renderGeneralPage() {
    const config = getDraftConfig();
    const site = config.site || {};
    const home = config.pages?.home || {};
    const aboutCompany = config.pages?.aboutCompany || {};
    const aboutContact = config.pages?.aboutContact || {};
    const brand = site.brand || {};
    const features = site.features || {};
    const mainAuth = site.mainAuth || {};
    const providerRollout = mainAuth.providerRollout || {};
    const sharedText = config.sharedText || {};

    return `
        ${renderSourceBanner('主站基础配置', '集中管理主站品牌信息、共享文案、运行开关和主站账号跳转。改动会直接异步同步到 site_shell_configs。')}
        <section class="ams-site-layout">
            <div class="ams-site-main">
                <article class="ams-card">
                    <div class="ams-section-head">
                        <div>
                            <h3>主站级配置</h3>
                            <p>这里集中管理品牌、共享文案、页面文案、运行开关和主站账号跳转，修改后共享壳会立刻消费。</p>
                        </div>
                        <div class="ams-site-header-actions">
                            <button class="ams-btn ams-btn-muted" type="button" data-site-action="refresh-site-shell">刷新发布态</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-site-action="expand-all-general">全部展开</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-site-action="collapse-all-general">全部收起</button>
                        </div>
                    </div>
                    <div class="ams-site-tree">
                        ${renderFooterSection('site:brand', '品牌与版权', brand.name || 'GasGx', `
                            <div class="ams-site-field-grid ams-site-field-grid-wide">
                                ${renderTextField('site.brand.name', '品牌名称', brand.name, 'GasGx')}
                                ${renderTextField('site.brand.homeHref', '首页地址', brand.homeHref, '/index.html')}
                                ${renderTextField('site.brand.footerMeta', '页脚说明', brand.footerMeta, 'Energy-compute infrastructure for mining operators.')}
                                ${renderTextField('site.brand.copyright', '版权文案', brand.copyright, '© 2026 GasGx. All rights reserved.')}
                            </div>
                        `)}
                        ${renderFooterSection('site:shared-text', '共享文案', `${SHARED_TEXT_FIELDS.length} 个多语言字段`, `
                            <div class="ams-site-tree-children">
                                ${SHARED_TEXT_FIELDS.map((field) => renderLocalizedTextFields(field, sharedText)).join('')}
                            </div>
                        `)}
                        ${renderFooterSection('site:home', '首页配置', home.meta?.title?.en || home.meta?.title?.zh || '首页多语言文案', `
                            <div class="ams-site-field-grid ams-site-field-grid-wide">
                                ${renderTextField('pages.home.heroCard.value', '范围数值', home.heroCard?.value, '25+')}
                                ${renderTextField('pages.home.capture.downloadFileName', '截图文件名', home.capture?.downloadFileName, 'GasGx-Map-Capture.png')}
                            </div>
                            <div class="ams-site-tree-children">
                                ${HOME_PAGE_LOCALIZED_FIELDS.map((field) => renderDescriptorField(field, config)).join('')}
                            </div>
                        `)}
                        ${renderFooterSection('site:about-company', '公司介绍页', aboutCompany.meta?.title?.en || aboutCompany.meta?.title?.zh || '公司介绍页文案', `
                            <div class="ams-site-field-grid ams-site-field-grid-wide">
                                ${renderTextField('pages.aboutCompany.subscribe.recipientEmail', '订阅收件邮箱', aboutCompany.subscribe?.recipientEmail, 'contact@gasgx.com')}
                                ${renderTextField('pages.aboutCompany.subscribe.subject', '订阅邮件主题', aboutCompany.subscribe?.subject, 'GasGx 2026 行业白皮书')}
                            </div>
                            <div class="ams-site-tree-children">
                                ${ABOUT_COMPANY_LOCALIZED_FIELDS.map((field) => renderDescriptorField(field, config)).join('')}
                                ${renderLocalizedPathField('pages.aboutCompany.subscribe.emailPlaceholder', '邮箱占位文案', aboutCompany.subscribe?.emailPlaceholder)}
                                ${renderLocalizedPathField('pages.aboutCompany.subscribe.invalidEmail', '邮箱校验失败文案', aboutCompany.subscribe?.invalidEmail)}
                            </div>
                        `)}
                        ${renderFooterSection('site:about-contact', '联系页面', aboutContact.meta?.title?.en || aboutContact.meta?.title?.zh || '联系页面文案', `
                            <div class="ams-site-field-grid ams-site-field-grid-wide">
                                ${renderTextField('pages.aboutContact.contactEmail', '联系邮箱', aboutContact.contactEmail, 'contact@gasgx.com')}
                            </div>
                            <div class="ams-site-tree-children">
                                ${ABOUT_CONTACT_LOCALIZED_FIELDS.map((field) => renderDescriptorField(field, config)).join('')}
                            </div>
                        `)}
                        ${renderFooterSection('site:features', '运行开关', features.chatbotEnabled === true ? '聊天机器人已开启' : '共享壳运行开关', `
                            <div class="ams-site-inline-actions">
                                <label class="ams-social-toggle"><input type="checkbox" data-site-config-path="site.features.backToTopEnabled" data-site-input-type="boolean" ${features.backToTopEnabled === false ? '' : 'checked'}><span>返回顶部</span></label>
                                <label class="ams-social-toggle"><input type="checkbox" data-site-config-path="site.features.chatbotEnabled" data-site-input-type="boolean" ${features.chatbotEnabled === true ? 'checked' : ''}><span>聊天机器人</span></label>
                            </div>
                            <div class="ams-site-field-grid ams-site-field-grid-wide">
                                ${renderTextField('site.features.chatApiUrl', '聊天接口地址', features.chatApiUrl, 'http://localhost:8000/chat')}
                            </div>
                        `)}
                        ${renderFooterSection('site:auth', '主站认证跳转', mainAuth.signInUrl || '/account/user.html', `
                            <div class="ams-site-field-grid ams-site-field-grid-wide">
                                ${renderTextField('site.mainAuth.signInUrl', '登录地址', mainAuth.signInUrl, '/account/user.html')}
                                ${renderTextField('site.mainAuth.accountUrl', '账号地址', mainAuth.accountUrl, '/account/account.html')}
                                ${renderTextField('site.mainAuth.signOutRedirectUrl', '退出后跳转地址', mainAuth.signOutRedirectUrl, '/account/user.html')}
                                ${renderTextField('site.mainAuth.returnUrlStorageKey', '返回地址缓存键', mainAuth.returnUrlStorageKey, 'gx_main_return_url')}
                                ${renderTextField('site.mainAuth.storageKey', '认证缓存键', mainAuth.storageKey, 'gasgx-main-auth')}
                                ${renderTextField('site.mainAuth.supabaseUrl', '认证 Supabase 地址', mainAuth.supabaseUrl, 'https://mkpcliytqudclkwtewru.supabase.co')}
                                ${renderTextField('site.mainAuth.supabaseKey', '认证 Supabase 密钥', mainAuth.supabaseKey, 'sb_publishable_...')}
                            </div>
                            <div class="ams-site-inline-actions">
                                <label class="ams-social-toggle"><input type="checkbox" data-site-config-path="site.mainAuth.providerRollout.twitter" data-site-input-type="boolean" ${providerRollout.twitter === true ? 'checked' : ''}><span>启用 X 登录按钮</span></label>
                                <label class="ams-social-toggle"><input type="checkbox" data-site-config-path="site.mainAuth.providerRollout.linkedin" data-site-input-type="boolean" ${providerRollout.linkedin === true ? 'checked' : ''}><span>启用 LinkedIn 登录按钮</span></label>
                            </div>
                            <div class="ams-footnote">Google 和邮箱登录默认常开。这里仅控制前台登录页是否显示 X / LinkedIn 按钮；实际 Client ID / Secret 仍需在 Supabase Authentication Providers 中配置。</div>
                        `)}
                    </div>
                </article>
            </div>
            <aside class="ams-site-sidebar">
                <div id="ams-site-general-preview">${renderGeneralPreview(config)}</div>
                <div id="ams-site-header-preview">${renderHeaderPreview(config)}</div>
                <div id="ams-site-footer-preview">${renderFooterPreview(config)}</div>
            </aside>
        </section>
    `;
}

function renderFooterPage() {
    const config = getDraftConfig();
    const footer = config.footer || {};
    const socialLinks = Array.isArray(footer.socialLinks) ? footer.socialLinks : [];
    const partners = Array.isArray(footer.partners) ? footer.partners : [];
    return `
        ${renderSourceBanner('主站页脚管理', '页脚特殊区块单独管理，页脚导航分组仍然复用页头导航树。字段变更会直接异步同步。')}
        <section class="ams-site-layout">
            <div class="ams-site-main">
                <article class="ams-card">
                    <div class="ams-section-head">
                        <div>
                            <h3>页脚模块</h3>
                            <p>这里集中管理联系入口、隐私政策、社交入口和合作伙伴，不和导航结构混在一起。</p>
                        </div>
                        <div class="ams-site-header-actions">
                            <button class="ams-btn ams-btn-muted" type="button" data-site-action="refresh-site-shell">刷新发布态</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-site-action="expand-all-footer">全部展开</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-site-action="collapse-all-footer">全部收起</button>
                        </div>
                    </div>
                    <div class="ams-site-tree">
                        ${renderFooterSection('footer:display', '显示控制', '控制整个页脚与社交区是否显示。', `
                            <div class="ams-site-inline-actions">
                                <label class="ams-social-toggle"><input type="checkbox" data-site-config-path="footer.visible" data-site-input-type="boolean" ${footer.visible === false ? '' : 'checked'}><span>显示页脚</span></label>
                                <label class="ams-social-toggle"><input type="checkbox" data-site-config-path="footer.socialEnabled" data-site-input-type="boolean" ${footer.socialEnabled === false ? '' : 'checked'}><span>显示社交区</span></label>
                            </div>
                        `)}
                        ${renderFooterSection('footer:contact', '联系入口', footer.contact?.label || '编辑联系入口的标题、模式与链接。', `
                            <div class="ams-site-field-grid ams-site-field-grid-wide">
                                <div class="ams-field"><label>模式</label><select class="ams-select" data-site-config-path="footer.contact.mode"><option value="link" ${footer.contact?.mode === 'link' ? 'selected' : ''}>链接</option><option value="qr" ${footer.contact?.mode === 'qr' ? 'selected' : ''}>二维码</option></select></div>
                                <div class="ams-field"><label>标题</label><input class="ams-input" data-site-config-path="footer.contact.label" value="${esc(footer.contact?.label || '')}" placeholder="www_gasgx_com"></div>
                                <div class="ams-field"><label>图标类名</label><input class="ams-input" data-site-config-path="footer.contact.iconClass" value="${esc(footer.contact?.iconClass || '')}" placeholder="fa-brands fa-weixin"></div>
                                <div class="ams-field"><label>跳转地址</label><input class="ams-input" data-site-config-path="footer.contact.href" value="${esc(footer.contact?.href || '')}" placeholder="/about/contact"></div>
                                <div class="ams-field"><label>二维码类型</label><input class="ams-input" data-site-config-path="footer.contact.qrType" value="${esc(footer.contact?.qrType || '')}" placeholder="wechat"></div>
                                <div class="ams-field"><label>打开目标</label><input class="ams-input" data-site-config-path="footer.contact.target" value="${esc(footer.contact?.target || '')}" placeholder="_blank"></div>
                                <div class="ams-field"><label>Rel 属性</label><input class="ams-input" data-site-config-path="footer.contact.rel" value="${esc(footer.contact?.rel || '')}" placeholder="noopener noreferrer"></div>
                            </div>
                        `)}
                        ${renderFooterSection('footer:privacy', '隐私政策', bilingualLabel(footer.privacyPolicy?.text, '隐私政策'), `
                            ${renderFieldPair('footer.privacyPolicy.text', '政策标题', footer.privacyPolicy?.text)}
                            <div class="ams-site-field-grid ams-site-field-grid-wide">
                                <div class="ams-field"><label>跳转地址</label><input class="ams-input" data-site-config-path="footer.privacyPolicy.href" value="${esc(footer.privacyPolicy?.href || '')}" placeholder="/about/app_privacy_policy.html"></div>
                                <div class="ams-field"><label>打开目标</label><input class="ams-input" data-site-config-path="footer.privacyPolicy.target" value="${esc(footer.privacyPolicy?.target || '')}" placeholder="_blank"></div>
                                <div class="ams-field"><label>Rel 属性</label><input class="ams-input" data-site-config-path="footer.privacyPolicy.rel" value="${esc(footer.privacyPolicy?.rel || '')}" placeholder="noopener noreferrer"></div>
                            </div>
                        `)}
                        ${renderFooterSection('footer:social', '社交入口', `${socialLinks.length} 条记录`, `
                            <div class="ams-site-inline-actions">
                                <button class="ams-btn ams-btn-muted" type="button" data-site-action="push-array-item" data-site-array-path="footer.socialLinks" data-site-template="social-link">添加社交入口</button>
                            </div>
                            <div class="ams-site-tree-children">
                                ${socialLinks.length ? socialLinks.map((item, index) => renderSocialRow(item, index)).join('') : '<div class="ams-empty">当前还没有社交入口。</div>'}
                            </div>
                        `)}
                        ${renderFooterSection('footer:partners', '战略伙伴', `${partners.length} 条记录`, `
                            <div class="ams-site-inline-actions">
                                <button class="ams-btn ams-btn-muted" type="button" data-site-action="push-array-item" data-site-array-path="footer.partners" data-site-template="partner">添加伙伴</button>
                            </div>
                            <div class="ams-site-tree-children">
                                ${partners.length ? partners.map((item, index) => renderPartnerRow(item, index)).join('') : '<div class="ams-empty">当前还没有伙伴。</div>'}
                            </div>
                        `)}
                    </div>
                </article>
            </div>
            <aside class="ams-site-sidebar">
                <div id="ams-site-header-preview">${renderHeaderPreview(config)}</div>
                <div id="ams-site-footer-preview">${renderFooterPreview(config)}</div>
            </aside>
        </section>
    `;
}

async function persistDraft(deps, options = {}) {
    const { rerender = true, toastMessage = '' } = options;

    moduleState.saving = true;
    moduleState.saveError = null;
    if (rerender) deps.setContent(deps.pageRenderer());

    try {
        const saved = await savePublishedSiteShellConfig(getDraftConfig(), deps.user);
        resetSiteShellConfigCache();
        moduleState.draft = deepClone(normalizeSiteShellConfig(saved.config, getDraftConfig()));
        moduleState.source = 'supabase';
        moduleState.error = null;
        moduleState.row = saved;
        moduleState.dirty = false;
        moduleState.saving = false;
        moduleState.lastSavedAt = saved.updated_at || new Date().toISOString();
        moduleState.saveError = null;
        syncRuntimePreview();
        if (toastMessage) deps.showToast(toastMessage);
        if (rerender) {
            deps.setContent(deps.pageRenderer());
            bindEditor(deps);
        }
        return true;
    } catch (error) {
        moduleState.saving = false;
        moduleState.saveError = error;
        if (rerender) {
            deps.setContent(deps.pageRenderer());
            bindEditor(deps);
        }
        deps.showToast(`保存失败：${error.message || '未知错误'}`, true);
        return false;
    }
}

function refreshPreviewPanels() {
    const config = getDraftConfig();
    const generalPreview = document.getElementById('ams-site-general-preview');
    if (generalPreview) generalPreview.innerHTML = renderGeneralPreview(config);
    const headerPreview = document.getElementById('ams-site-header-preview');
    if (headerPreview) headerPreview.innerHTML = renderHeaderPreview(config);
    const footerPreview = document.getElementById('ams-site-footer-preview');
    if (footerPreview) footerPreview.innerHTML = renderFooterPreview(config);
}

function expandAllNav() {
    const config = getDraftConfig();
    const navList = Array.isArray(config.navigation) ? config.navigation : [];
    navList.forEach((item, navIndex) => {
        setExpanded(`nav:${navIndex}`, true);
        if (item?.type === 'menu') {
            setExpanded(`nav:${navIndex}:children`, true);
            (item.children || []).forEach((_, childIndex) => setExpanded(`nav:${navIndex}:child:${childIndex}`, true));
        }
        if (item?.type === 'mega') {
            setExpanded(`nav:${navIndex}:sections`, true);
            (item.sections || []).forEach((section, sectionIndex) => {
                setExpanded(`nav:${navIndex}:section:${sectionIndex}`, true);
                (section?.items || []).forEach((_, itemIndex) => setExpanded(`nav:${navIndex}:section:${sectionIndex}:item:${itemIndex}`, true));
            });
        }
    });
}

function collapseAllNav() {
    const config = getDraftConfig();
    const navList = Array.isArray(config.navigation) ? config.navigation : [];
    navList.forEach((item, navIndex) => {
        setExpanded(`nav:${navIndex}`, false);
        setExpanded(`nav:${navIndex}:children`, false);
        setExpanded(`nav:${navIndex}:sections`, false);
        (item?.children || []).forEach((_, childIndex) => setExpanded(`nav:${navIndex}:child:${childIndex}`, false));
        (item?.sections || []).forEach((section, sectionIndex) => {
            setExpanded(`nav:${navIndex}:section:${sectionIndex}`, false);
            (section?.items || []).forEach((_, itemIndex) => setExpanded(`nav:${navIndex}:section:${sectionIndex}:item:${itemIndex}`, false));
        });
    });
}

function expandAllGeneral() {
    ['site:brand', 'site:shared-text', 'site:home', 'site:about-company', 'site:about-contact', 'site:features', 'site:auth'].forEach((key) => setExpanded(key, true));
}

function collapseAllGeneral() {
    ['site:brand', 'site:shared-text', 'site:home', 'site:about-company', 'site:about-contact', 'site:features', 'site:auth'].forEach((key) => setExpanded(key, false));
}

function expandAllFooter() {
    ['footer:display', 'footer:contact', 'footer:privacy', 'footer:social', 'footer:partners'].forEach((key) => setExpanded(key, true));
    const footer = getDraftConfig().footer || {};
    (footer.socialLinks || []).forEach((_, index) => setExpanded(`footer:social:${index}`, true));
    (footer.partners || []).forEach((_, index) => setExpanded(`footer:partner:${index}`, true));
}

function collapseAllFooter() {
    ['footer:display', 'footer:contact', 'footer:privacy', 'footer:social', 'footer:partners'].forEach((key) => setExpanded(key, false));
    const footer = getDraftConfig().footer || {};
    (footer.socialLinks || []).forEach((_, index) => setExpanded(`footer:social:${index}`, false));
    (footer.partners || []).forEach((_, index) => setExpanded(`footer:partner:${index}`, false));
}

function expandNewNode(arrayPath, index, template) {
    if (arrayPath === 'navigation') {
        setExpanded(`nav:${index}`, true);
        if (template === 'top-menu') setExpanded(`nav:${index}:children`, true);
        if (template === 'top-mega') setExpanded(`nav:${index}:sections`, true);
        return;
    }

    const navChildMatch = arrayPath.match(/^navigation\.(\d+)\.children$/);
    if (navChildMatch) {
        setExpanded(`nav:${navChildMatch[1]}`, true);
        setExpanded(`nav:${navChildMatch[1]}:children`, true);
        setExpanded(`nav:${navChildMatch[1]}:child:${index}`, true);
        return;
    }

    const sectionMatch = arrayPath.match(/^navigation\.(\d+)\.sections$/);
    if (sectionMatch) {
        setExpanded(`nav:${sectionMatch[1]}`, true);
        setExpanded(`nav:${sectionMatch[1]}:sections`, true);
        setExpanded(`nav:${sectionMatch[1]}:section:${index}`, true);
        return;
    }

    const megaItemMatch = arrayPath.match(/^navigation\.(\d+)\.sections\.(\d+)\.items$/);
    if (megaItemMatch) {
        setExpanded(`nav:${megaItemMatch[1]}`, true);
        setExpanded(`nav:${megaItemMatch[1]}:sections`, true);
        setExpanded(`nav:${megaItemMatch[1]}:section:${megaItemMatch[2]}`, true);
        setExpanded(`nav:${megaItemMatch[1]}:section:${megaItemMatch[2]}:item:${index}`, true);
        return;
    }

    if (arrayPath === 'footer.socialLinks') {
        setExpanded('footer:social', true);
        setExpanded(`footer:social:${index}`, true);
        return;
    }

    if (arrayPath === 'footer.partners') {
        setExpanded('footer:partners', true);
        setExpanded(`footer:partner:${index}`, true);
    }
}

async function handleAction(target, deps) {
    const action = String(target?.dataset.siteAction || '').trim();
    if (!action) return;

    const arrayPath = String(target.dataset.siteArrayPath || '').trim();
    const index = Number(target.dataset.siteIndex || 0);
    const direction = Number(target.dataset.siteDirection || 0);

    if (action === 'toggle-expand') {
        const togglePath = String(target.dataset.siteTogglePath || '').trim();
        setExpanded(togglePath, !isExpanded(togglePath, false));
        deps.setContent(deps.pageRenderer());
        bindEditor(deps);
        return;
    }

    if (action === 'expand-all-nav') {
        expandAllNav();
        deps.setContent(deps.pageRenderer());
        bindEditor(deps);
        return;
    }

    if (action === 'collapse-all-nav') {
        collapseAllNav();
        deps.setContent(deps.pageRenderer());
        bindEditor(deps);
        return;
    }

    if (action === 'expand-all-general') {
        expandAllGeneral();
        deps.setContent(deps.pageRenderer());
        bindEditor(deps);
        return;
    }

    if (action === 'collapse-all-general') {
        collapseAllGeneral();
        deps.setContent(deps.pageRenderer());
        bindEditor(deps);
        return;
    }

    if (action === 'expand-all-footer') {
        expandAllFooter();
        deps.setContent(deps.pageRenderer());
        bindEditor(deps);
        return;
    }

    if (action === 'collapse-all-footer') {
        collapseAllFooter();
        deps.setContent(deps.pageRenderer());
        bindEditor(deps);
        return;
    }

    if (action === 'push-array-item') {
        const list = getArray(arrayPath);
        const template = target.dataset.siteTemplate || 'top-link';
        list.push(createTemplate(template));
        expandNewNode(arrayPath, list.length - 1, template);
        markDirty();
        await persistDraft(deps, { rerender: true });
        return;
    }

    if (action === 'delete-array-item') {
        const list = getArray(arrayPath);
        list.splice(index, 1);
        markDirty();
        await persistDraft(deps, { rerender: true });
        return;
    }

    if (action === 'move-array-item') {
        const list = getArray(arrayPath);
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= list.length) return;
        [list[index], list[nextIndex]] = [list[nextIndex], list[index]];
        markDirty();
        await persistDraft(deps, { rerender: true });
        return;
    }

    if (action === 'change-nav-type') {
        const navIndex = Number(target.dataset.siteNavIndex || 0);
        const list = getArray('navigation');
        list[navIndex] = createSiteShellNavItem(target.value, list[navIndex] || {});
        markDirty();
        await persistDraft(deps, { rerender: true });
        return;
    }

    if (action === 'refresh-site-shell') {
        if (moduleState.dirty && !window.confirm('当前有未同步改动，是否用已发布配置覆盖本地草稿？')) return;
        moduleState.draft = null;
        moduleState.error = null;
        moduleState.dirty = false;
        moduleState.saveError = null;
        resetSiteShellConfigCache();
        await ensureLoaded(true);
        deps.setContent(deps.pageRenderer());
        bindEditor(deps);
    }
}

function bindEditor(deps) {
    const content = document.getElementById('ams-content');
    if (!content) return;
    moduleState.deps = deps;
    if (moduleState.boundContent === content) return;
    moduleState.boundContent = content;

    content.addEventListener('input', (event) => {
        const runtimeDeps = moduleState.deps;
        if (!runtimeDeps) return;
        const node = event.target;
        if (!(node instanceof HTMLElement)) return;
        const path = node.dataset?.siteConfigPath;
        if (!path) return;
        const nextValue = node.dataset.siteInputType === 'boolean' ? Boolean(node.checked) : node.value;
        setPathValue(getDraftConfig(), path, nextValue);
        markDirty();
        refreshPreviewPanels();
    });

    content.addEventListener('change', async (event) => {
        const runtimeDeps = moduleState.deps;
        if (!runtimeDeps) return;
        const node = event.target;
        if (!(node instanceof HTMLElement)) return;

        const actionTarget = node.closest('[data-site-action]');
        if (actionTarget) {
            event.preventDefault();
            await handleAction(actionTarget, runtimeDeps);
            return;
        }

        const path = node.dataset?.siteConfigPath;
        if (!path) return;
        if (!(node.matches('select') || node.type === 'checkbox')) return;

        const nextValue = node.dataset.siteInputType === 'boolean' ? Boolean(node.checked) : node.value;
        setPathValue(getDraftConfig(), path, nextValue);
        markDirty();
        await persistDraft(runtimeDeps, { rerender: true });
    });

    content.addEventListener(
        'blur',
        async (event) => {
            const runtimeDeps = moduleState.deps;
            if (!runtimeDeps) return;
            const node = event.target;
            if (!(node instanceof HTMLElement)) return;
            const path = node.dataset?.siteConfigPath;
            if (!path || node.matches('select') || node.type === 'checkbox') return;
            setPathValue(getDraftConfig(), path, node.value);
            markDirty();
            await persistDraft(runtimeDeps, { rerender: true });
        },
        true,
    );

    content.addEventListener('click', async (event) => {
        const runtimeDeps = moduleState.deps;
        if (!runtimeDeps) return;
        const clickTarget = event.target;
        if (!(clickTarget instanceof Element)) return;
        const target = clickTarget.closest('[data-site-action]');
        if (!target || target.matches('select')) return;
        event.preventDefault();
        await handleAction(target, runtimeDeps);
    });
}

function createDeps(input, pageRenderer) {
    return {
        user: input.user || null,
        setPageHeader: input.setPageHeader,
        setContent: input.setContent,
        showToast: input.showToast,
        pageRenderer,
    };
}

export async function renderSiteNavigationAdmin(input) {
    const deps = createDeps(input, renderNavigationPage);
    deps.setPageHeader('主站导航', '按主站页头 / 页脚共用导航树管理一级与二级结构。');
    await ensureLoaded(false);
    deps.setContent(renderNavigationPage());
    bindEditor(deps);
}

export async function renderSiteGeneralAdmin(input) {
    const deps = createDeps(input, renderGeneralPage);
    deps.setPageHeader('主站配置', '管理品牌信息、共享文案、运行开关与主站账号配置。');
    await ensureLoaded(false);
    deps.setContent(renderGeneralPage());
    bindEditor(deps);
}

export async function renderSiteFooterAdmin(input) {
    const deps = createDeps(input, renderFooterPage);
    deps.setPageHeader('主站页脚', '管理联系入口、隐私政策、社交入口和合作伙伴，改动异步即时同步。');
    await ensureLoaded(false);
    deps.setContent(renderFooterPage());
    bindEditor(deps);
}
