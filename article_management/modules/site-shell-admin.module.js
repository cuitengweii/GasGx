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
} from './site-shell.module.js';

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
    deps: null,
    bound: false,
};

function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function textLabel(value, fallback = 'Untitled') {
    if (value && typeof value === 'object') {
        const zh = String(value.zh || '').trim();
        const en = String(value.en || '').trim();
        return en || zh || fallback;
    }
    return String(value || fallback).trim() || fallback;
}

function bilingualLabel(value, fallback = 'Untitled') {
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
    if (current === 'menu') return 'Dropdown';
    if (current === 'mega') return 'Mega';
    return 'Link';
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
    if (nextValue) moduleState.expanded.add(key);
    else moduleState.expanded.delete(key);
}

function isExpanded(key, fallback = false) {
    if (moduleState.expanded.has(key)) return true;
    return fallback;
}

function expandDefaults(config) {
    const navList = Array.isArray(config.navigation) ? config.navigation : [];
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
    const sourceLabel = moduleState.source === 'supabase' ? 'Published config' : 'Static fallback';
    const syncLabel = moduleState.saving
        ? 'Saving...'
        : moduleState.saveError
          ? 'Save failed'
          : moduleState.dirty
            ? 'Unsynced changes'
            : moduleState.lastSavedAt
              ? `Synced ${formatSavedTime(moduleState.lastSavedAt)}`
              : 'Synced';

    return `
        <div class="ams-site-meta-row">
            <span class="ams-status-pill ${moduleState.source === 'supabase' ? 'is-ok' : 'is-warn'}">${esc(sourceLabel)}</span>
            <span class="ams-status-pill ${moduleState.saveError ? 'is-warn' : moduleState.saving ? 'is-warn' : 'is-ok'}">${esc(syncLabel)}</span>
        </div>
    `;
}

function renderSourceBanner(title, copy) {
    const errorBlock = moduleState.error
        ? `<div class="ams-site-notice-copy">Published config is unavailable. Fallback is active. Reason: ${esc(moduleState.error.message || 'load failed')}</div>`
        : '';
    const saveErrorBlock = moduleState.saveError
        ? `<div class="ams-site-notice-copy">Save failed: ${esc(moduleState.saveError.message || 'unknown error')}</div>`
        : '';

    return `
        <section class="ams-card ams-site-hero">
            <div class="ams-site-hero-copy">
                <p class="ams-eyebrow">Site Admin</p>
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
                    <h3>Header Preview</h3>
                    <p>Top-level navigation rendered from the same config.</p>
                </div>
            </div>
            <div class="ams-site-preview-nav">
                ${items.length ? items.map((item) => `<span class="ams-site-preview-chip"><strong>${esc(textLabel(item.title))}</strong><em>${esc(navTypeLabel(item.type))}</em></span>`).join('') : '<div class="ams-empty">No visible navigation items.</div>'}
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
                    <h3>Footer Preview</h3>
                    <p>Footer nav groups are generated from the same navigation tree.</p>
                </div>
            </div>
            <div class="ams-site-preview-stack">
                <div class="ams-site-preview-pane">
                    <strong>Footer Groups</strong>
                    <div class="ams-site-preview-list">
                        ${groups.length ? groups.map((group) => `<span class="ams-site-preview-row"><span>${esc(group.title)}</span><em>${group.count} links</em></span>`).join('') : '<div class="ams-empty">No footer groups.</div>'}
                    </div>
                </div>
                <div class="ams-site-preview-pane">
                    <strong>Special Blocks</strong>
                    <div class="ams-site-preview-list">
                        <span class="ams-site-preview-row"><span>Contact</span><em>${esc(footer.contact?.label || 'Not set')}</em></span>
                        <span class="ams-site-preview-row"><span>Social</span><em>${socialLinks.length} active</em></span>
                        <span class="ams-site-preview-row"><span>Partners</span><em>${partners.length} active</em></span>
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
                <label>${esc(label)} (ZH)</label>
                <input class="ams-input" data-site-config-path="${esc(`${path}.zh`)}" value="${esc(value?.zh || '')}" placeholder="中文">
            </div>
            <div class="ams-field">
                <label>${esc(label)} (EN)</label>
                <input class="ams-input" data-site-config-path="${esc(`${path}.en`)}" value="${esc(value?.en || '')}" placeholder="English">
            </div>
        </div>
    `;
}

function renderItemFields(basePath, item, options = {}) {
    const showType = options.showType === true;
    return `
        <div class="ams-site-editor-panel">
            ${renderFieldPair(`${basePath}.title`, options.titleLabel || 'Title', item.title)}
            <div class="ams-site-field-grid ams-site-field-grid-wide">
                ${showType ? `
                    <div class="ams-field">
                        <label>Type</label>
                        <select class="ams-select" data-site-action="change-nav-type" data-site-nav-index="${esc(options.navIndex)}">
                            <option value="link" ${item.type === 'link' ? 'selected' : ''}>Link</option>
                            <option value="menu" ${item.type === 'menu' ? 'selected' : ''}>Dropdown</option>
                            <option value="mega" ${item.type === 'mega' ? 'selected' : ''}>Mega</option>
                        </select>
                    </div>
                ` : ''}
                <div class="ams-field">
                    <label>Path</label>
                    <input class="ams-input" data-site-config-path="${esc(`${basePath}.path`)}" value="${esc(item.path || '')}" placeholder="/products">
                </div>
                <div class="ams-field">
                    <label>Icon</label>
                    <input class="ams-input" data-site-config-path="${esc(`${basePath}.icon`)}" value="${esc(item.icon || '')}" placeholder="fa-solid fa-house">
                </div>
                <div class="ams-field">
                    <label>Target</label>
                    <input class="ams-input" data-site-config-path="${esc(`${basePath}.target`)}" value="${esc(item.target || '')}" placeholder="_self / _blank">
                </div>
                <div class="ams-field">
                    <label>Rel</label>
                    <input class="ams-input" data-site-config-path="${esc(`${basePath}.rel`)}" value="${esc(item.rel || '')}" placeholder="noopener noreferrer">
                </div>
                <label class="ams-social-toggle ams-site-visible-toggle">
                    <input type="checkbox" data-site-config-path="${esc(`${basePath}.visible`)}" data-site-input-type="boolean" ${item.visible === false ? '' : 'checked'}>
                    <span>Visible</span>
                </label>
            </div>
            ${item.type === 'mega' ? `
                <div class="ams-field">
                    <label>Mega Grid Cols</label>
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
                        <strong>${esc(bilingualLabel(child.title, `Child ${childIndex + 1}`))}</strong>
                        <span>${esc(child.path || 'No path')} · ${child.visible === false ? 'Hidden' : 'Visible'}</span>
                    </div>
                </div>
                <div class="ams-site-tree-actions">
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="navigation.${topIndex}.children" data-site-index="${childIndex}" data-site-direction="-1" ${childIndex <= 0 ? 'disabled' : ''}>Up</button>
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="navigation.${topIndex}.children" data-site-index="${childIndex}" data-site-direction="1">Down</button>
                    <button class="ams-btn ams-btn-danger" type="button" data-site-action="delete-array-item" data-site-array-path="navigation.${topIndex}.children" data-site-index="${childIndex}">Delete</button>
                </div>
            </div>
            ${expanded ? renderItemFields(basePath, child, { titleLabel: 'Child Title', navIndex: topIndex }) : ''}
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
                        <strong>${esc(bilingualLabel(item.title, `Item ${itemIndex + 1}`))}</strong>
                        <span>${esc(item.path || 'No path')} · ${item.visible === false ? 'Hidden' : 'Visible'}</span>
                    </div>
                </div>
                <div class="ams-site-tree-actions">
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="navigation.${topIndex}.sections.${sectionIndex}.items" data-site-index="${itemIndex}" data-site-direction="-1" ${itemIndex <= 0 ? 'disabled' : ''}>Up</button>
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="navigation.${topIndex}.sections.${sectionIndex}.items" data-site-index="${itemIndex}" data-site-direction="1">Down</button>
                    <button class="ams-btn ams-btn-danger" type="button" data-site-action="delete-array-item" data-site-array-path="navigation.${topIndex}.sections.${sectionIndex}.items" data-site-index="${itemIndex}">Delete</button>
                </div>
            </div>
            ${expanded ? renderItemFields(basePath, item, { titleLabel: 'Mega Item Title', navIndex: topIndex }) : ''}
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
                        <strong>${esc(bilingualLabel(section.header, `Section ${sectionIndex + 1}`))}</strong>
                        <span>${items.length} items · ${section.visible === false ? 'Hidden' : 'Visible'}</span>
                    </div>
                </div>
                <div class="ams-site-tree-actions">
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="navigation.${topIndex}.sections" data-site-index="${sectionIndex}" data-site-direction="-1" ${sectionIndex <= 0 ? 'disabled' : ''}>Up</button>
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="navigation.${topIndex}.sections" data-site-index="${sectionIndex}" data-site-direction="1">Down</button>
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="push-array-item" data-site-array-path="${esc(`${basePath}.items`)}" data-site-template="mega-item">Add Item</button>
                    <button class="ams-btn ams-btn-danger" type="button" data-site-action="delete-array-item" data-site-array-path="navigation.${topIndex}.sections" data-site-index="${sectionIndex}">Delete</button>
                </div>
            </div>
            ${expanded ? `
                <div class="ams-site-editor-panel">
                    ${renderFieldPair(`${basePath}.header`, 'Section Title', section.header)}
                    <label class="ams-social-toggle ams-site-visible-toggle">
                        <input type="checkbox" data-site-config-path="${esc(`${basePath}.visible`)}" data-site-input-type="boolean" ${section.visible === false ? '' : 'checked'}>
                        <span>Visible</span>
                    </label>
                </div>
                <div class="ams-site-tree-children">
                    ${items.length ? items.map((entry, itemIndex) => renderMegaItem(entry, topIndex, sectionIndex, itemIndex)).join('') : '<div class="ams-empty">No mega items yet.</div>'}
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
                        <strong>${esc(bilingualLabel(item.title, `Navigation ${index + 1}`))}</strong>
                        <span>${esc(navTypeLabel(item.type))} · ${item.visible === false ? 'Hidden' : 'Visible'} · ${esc(item.path || '/')}</span>
                    </div>
                </div>
                <div class="ams-site-tree-actions">
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="navigation" data-site-index="${index}" data-site-direction="-1" ${index <= 0 ? 'disabled' : ''}>Up</button>
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="navigation" data-site-index="${index}" data-site-direction="1">Down</button>
                    ${item.type === 'menu' ? `<button class="ams-btn ams-btn-muted" type="button" data-site-action="push-array-item" data-site-array-path="navigation.${index}.children" data-site-template="nav-child">Add Child</button>` : ''}
                    ${item.type === 'mega' ? `<button class="ams-btn ams-btn-muted" type="button" data-site-action="push-array-item" data-site-array-path="navigation.${index}.sections" data-site-template="mega-section">Add Section</button>` : ''}
                    <button class="ams-btn ams-btn-danger" type="button" data-site-action="delete-array-item" data-site-array-path="navigation" data-site-index="${index}">Delete</button>
                </div>
            </div>
            ${expanded ? `
                ${renderItemFields(`navigation.${index}`, item, { titleLabel: 'Navigation Title', showType: true, navIndex: index })}
                ${item.type === 'menu' ? `
                    <div class="ams-site-branch">
                        <div class="ams-site-branch-head">
                            <div class="ams-site-branch-title ams-site-tree-copy-toggle" data-site-action="toggle-expand" data-site-toggle-path="${esc(`${key}:children`)}">Level 2 Menu Items <span>${children.length}</span></div>
                            ${renderToggleButton('toggle-expand', `${key}:children`, menuListOpen)}
                        </div>
                        ${menuListOpen ? `<div class="ams-site-tree-children">${children.length ? children.map((child, childIndex) => renderMenuChild(child, index, childIndex)).join('') : '<div class="ams-empty">No child items yet.</div>'}</div>` : ''}
                    </div>
                ` : ''}
                ${item.type === 'mega' ? `
                    <div class="ams-site-branch">
                        <div class="ams-site-branch-head">
                            <div class="ams-site-branch-title ams-site-tree-copy-toggle" data-site-action="toggle-expand" data-site-toggle-path="${esc(`${key}:sections`)}">Mega Sections <span>${sections.length}</span></div>
                            ${renderToggleButton('toggle-expand', `${key}:sections`, megaListOpen)}
                        </div>
                        ${megaListOpen ? `<div class="ams-site-tree-children">${sections.length ? sections.map((section, sectionIndex) => renderMegaSection(section, index, sectionIndex)).join('') : '<div class="ams-empty">No mega sections yet.</div>'}</div>` : ''}
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
                        <span>${esc(item.mode || 'link')} · ${item.enabled === false ? 'Disabled' : 'Enabled'}</span>
                    </div>
                </div>
                <div class="ams-site-tree-actions">
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="footer.socialLinks" data-site-index="${index}" data-site-direction="-1" ${index <= 0 ? 'disabled' : ''}>Up</button>
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="footer.socialLinks" data-site-index="${index}" data-site-direction="1">Down</button>
                    <button class="ams-btn ams-btn-danger" type="button" data-site-action="delete-array-item" data-site-array-path="footer.socialLinks" data-site-index="${index}">Delete</button>
                </div>
            </div>
            ${expanded ? `
                <div class="ams-site-editor-panel">
                    <div class="ams-site-field-grid ams-site-field-grid-wide">
                        <div class="ams-field"><label>ID</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.id`)}" value="${esc(item.id || '')}" placeholder="linkedin"></div>
                        <div class="ams-field"><label>Mode</label><select class="ams-select" data-site-config-path="${esc(`${basePath}.mode`)}"><option value="link" ${item.mode === 'link' ? 'selected' : ''}>link</option><option value="qr" ${item.mode === 'qr' ? 'selected' : ''}>qr</option></select></div>
                        <div class="ams-field"><label>Href</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.href`)}" value="${esc(item.href || '')}" placeholder="https://..."></div>
                        <div class="ams-field"><label>QR Type</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.qrType`)}" value="${esc(item.qrType || '')}" placeholder="wechat"></div>
                        <div class="ams-field"><label>Icon Class</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.iconClass`)}" value="${esc(item.iconClass || '')}" placeholder="fa-brands fa-linkedin"></div>
                        <div class="ams-field"><label>Text Icon</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.text`)}" value="${esc(item.text || '')}" placeholder="XHS"></div>
                        <div class="ams-field"><label>Aria Label</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.ariaLabel`)}" value="${esc(item.ariaLabel || '')}" placeholder="Open LinkedIn"></div>
                        <div class="ams-field"><label>Target</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.target`)}" value="${esc(item.target || '')}" placeholder="_blank"></div>
                        <div class="ams-field"><label>Rel</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.rel`)}" value="${esc(item.rel || '')}" placeholder="noopener noreferrer"></div>
                        <label class="ams-social-toggle"><input type="checkbox" data-site-config-path="${esc(`${basePath}.enabled`)}" data-site-input-type="boolean" ${item.enabled === false ? '' : 'checked'}><span>Enabled</span></label>
                        <label class="ams-social-toggle"><input type="checkbox" data-site-config-path="${esc(`${basePath}.visible`)}" data-site-input-type="boolean" ${item.visible === false ? '' : 'checked'}><span>Visible</span></label>
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
                        <strong>${esc(item.title || `Partner ${index + 1}`)}</strong>
                        <span>${esc(item.href || 'No link')} · ${item.visible === false ? 'Hidden' : 'Visible'}</span>
                    </div>
                </div>
                <div class="ams-site-tree-actions">
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="footer.partners" data-site-index="${index}" data-site-direction="-1" ${index <= 0 ? 'disabled' : ''}>Up</button>
                    <button class="ams-btn ams-btn-muted" type="button" data-site-action="move-array-item" data-site-array-path="footer.partners" data-site-index="${index}" data-site-direction="1">Down</button>
                    <button class="ams-btn ams-btn-danger" type="button" data-site-action="delete-array-item" data-site-array-path="footer.partners" data-site-index="${index}">Delete</button>
                </div>
            </div>
            ${expanded ? `
                <div class="ams-site-editor-panel">
                    <div class="ams-site-field-grid ams-site-field-grid-wide">
                        <div class="ams-field"><label>ID</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.id`)}" value="${esc(item.id || '')}" placeholder="bitmain"></div>
                        <div class="ams-field"><label>Title</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.title`)}" value="${esc(item.title || '')}" placeholder="BITMAIN"></div>
                        <div class="ams-field"><label>Href</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.href`)}" value="${esc(item.href || '')}" placeholder="https://www.bitmain.com/"></div>
                        <div class="ams-field"><label>Target</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.target`)}" value="${esc(item.target || '')}" placeholder="_blank"></div>
                        <div class="ams-field"><label>Rel</label><input class="ams-input" data-site-config-path="${esc(`${basePath}.rel`)}" value="${esc(item.rel || '')}" placeholder="noopener noreferrer"></div>
                        <label class="ams-social-toggle"><input type="checkbox" data-site-config-path="${esc(`${basePath}.visible`)}" data-site-input-type="boolean" ${item.visible === false ? '' : 'checked'}><span>Visible</span></label>
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
        ${renderSourceBanner('主站导航管理', '按照主站真实的一级导航与二级导航结构管理 Header 和 Footer。字段改动会自动异步同步，不再依赖统一保存。')}
        <section class="ams-site-layout">
            <div class="ams-site-main">
                <article class="ams-card">
                    <div class="ams-section-head">
                        <div>
                            <h3>Navigation Tree</h3>
                            <p>Top-level items map to website primary navigation. Open a branch, edit fields, then the change is synced immediately.</p>
                        </div>
                        <div class="ams-site-header-actions">
                            <button class="ams-btn ams-btn-muted" type="button" data-site-action="refresh-site-shell">Refresh Published</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-site-action="expand-all-nav">Expand All</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-site-action="collapse-all-nav">Collapse All</button>
                        </div>
                    </div>
                    <div class="ams-site-inline-actions">
                        <button class="ams-btn ams-btn-muted" type="button" data-site-action="push-array-item" data-site-array-path="navigation" data-site-template="top-link">Add Link</button>
                        <button class="ams-btn ams-btn-muted" type="button" data-site-action="push-array-item" data-site-array-path="navigation" data-site-template="top-menu">Add Dropdown</button>
                        <button class="ams-btn ams-btn-muted" type="button" data-site-action="push-array-item" data-site-array-path="navigation" data-site-template="top-mega">Add Mega</button>
                    </div>
                    <div class="ams-site-tree">
                        ${navigation.length ? navigation.map((item, index) => renderTopNavItem(item, index)).join('') : '<div class="ams-empty">No navigation items yet.</div>'}
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

function renderFooterPage() {
    const config = getDraftConfig();
    const footer = config.footer || {};
    const socialLinks = Array.isArray(footer.socialLinks) ? footer.socialLinks : [];
    const partners = Array.isArray(footer.partners) ? footer.partners : [];
    return `
        ${renderSourceBanner('主站 Footer 管理', 'Footer 特殊区块单独管理，Footer 导航分组仍然复用 Header 导航树。字段变更会直接异步同步。')}
        <section class="ams-site-layout">
            <div class="ams-site-main">
                <article class="ams-card">
                    <div class="ams-section-head">
                        <div>
                            <h3>Footer Blocks</h3>
                            <p>Contact, privacy policy, social links and partners are managed independently.</p>
                        </div>
                        <div class="ams-site-header-actions">
                            <button class="ams-btn ams-btn-muted" type="button" data-site-action="refresh-site-shell">Refresh Published</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-site-action="expand-all-footer">Expand All</button>
                            <button class="ams-btn ams-btn-muted" type="button" data-site-action="collapse-all-footer">Collapse All</button>
                        </div>
                    </div>
                    <div class="ams-site-tree">
                        ${renderFooterSection('footer:display', 'Display Controls', 'Toggle entire footer and social area visibility.', `
                            <div class="ams-site-inline-actions">
                                <label class="ams-social-toggle"><input type="checkbox" data-site-config-path="footer.visible" data-site-input-type="boolean" ${footer.visible === false ? '' : 'checked'}><span>Show Footer</span></label>
                                <label class="ams-social-toggle"><input type="checkbox" data-site-config-path="footer.socialEnabled" data-site-input-type="boolean" ${footer.socialEnabled === false ? '' : 'checked'}><span>Show Social Area</span></label>
                            </div>
                        `)}
                        ${renderFooterSection('footer:contact', 'Contact Us', footer.contact?.label || 'Edit contact label, link and mode.', `
                            <div class="ams-site-field-grid ams-site-field-grid-wide">
                                <div class="ams-field"><label>Mode</label><select class="ams-select" data-site-config-path="footer.contact.mode"><option value="link" ${footer.contact?.mode === 'link' ? 'selected' : ''}>link</option><option value="qr" ${footer.contact?.mode === 'qr' ? 'selected' : ''}>qr</option></select></div>
                                <div class="ams-field"><label>Label</label><input class="ams-input" data-site-config-path="footer.contact.label" value="${esc(footer.contact?.label || '')}" placeholder="www_gasgx_com"></div>
                                <div class="ams-field"><label>Icon Class</label><input class="ams-input" data-site-config-path="footer.contact.iconClass" value="${esc(footer.contact?.iconClass || '')}" placeholder="fa-brands fa-weixin"></div>
                                <div class="ams-field"><label>Href</label><input class="ams-input" data-site-config-path="footer.contact.href" value="${esc(footer.contact?.href || '')}" placeholder="/about/contact"></div>
                                <div class="ams-field"><label>QR Type</label><input class="ams-input" data-site-config-path="footer.contact.qrType" value="${esc(footer.contact?.qrType || '')}" placeholder="wechat"></div>
                                <div class="ams-field"><label>Target</label><input class="ams-input" data-site-config-path="footer.contact.target" value="${esc(footer.contact?.target || '')}" placeholder="_blank"></div>
                                <div class="ams-field"><label>Rel</label><input class="ams-input" data-site-config-path="footer.contact.rel" value="${esc(footer.contact?.rel || '')}" placeholder="noopener noreferrer"></div>
                            </div>
                        `)}
                        ${renderFooterSection('footer:privacy', 'Privacy Policy', bilingualLabel(footer.privacyPolicy?.text, 'Privacy Policy'), `
                            ${renderFieldPair('footer.privacyPolicy.text', 'Policy Label', footer.privacyPolicy?.text)}
                            <div class="ams-site-field-grid ams-site-field-grid-wide">
                                <div class="ams-field"><label>Href</label><input class="ams-input" data-site-config-path="footer.privacyPolicy.href" value="${esc(footer.privacyPolicy?.href || '')}" placeholder="/about/app_privacy_policy.html"></div>
                                <div class="ams-field"><label>Target</label><input class="ams-input" data-site-config-path="footer.privacyPolicy.target" value="${esc(footer.privacyPolicy?.target || '')}" placeholder="_blank"></div>
                                <div class="ams-field"><label>Rel</label><input class="ams-input" data-site-config-path="footer.privacyPolicy.rel" value="${esc(footer.privacyPolicy?.rel || '')}" placeholder="noopener noreferrer"></div>
                            </div>
                        `)}
                        ${renderFooterSection('footer:social', 'Social Links', `${socialLinks.length} entries`, `
                            <div class="ams-site-inline-actions">
                                <button class="ams-btn ams-btn-muted" type="button" data-site-action="push-array-item" data-site-array-path="footer.socialLinks" data-site-template="social-link">Add Social Link</button>
                            </div>
                            <div class="ams-site-tree-children">
                                ${socialLinks.length ? socialLinks.map((item, index) => renderSocialRow(item, index)).join('') : '<div class="ams-empty">No social links yet.</div>'}
                            </div>
                        `)}
                        ${renderFooterSection('footer:partners', 'Strategic Partners', `${partners.length} entries`, `
                            <div class="ams-site-inline-actions">
                                <button class="ams-btn ams-btn-muted" type="button" data-site-action="push-array-item" data-site-array-path="footer.partners" data-site-template="partner">Add Partner</button>
                            </div>
                            <div class="ams-site-tree-children">
                                ${partners.length ? partners.map((item, index) => renderPartnerRow(item, index)).join('') : '<div class="ams-empty">No partners yet.</div>'}
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
        deps.showToast(`保存失败：${error.message || 'unknown error'}`, true);
        return false;
    }
}

function refreshPreviewPanels() {
    const config = getDraftConfig();
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
    Array.from(moduleState.expanded).forEach((key) => {
        if (key.startsWith('nav:')) moduleState.expanded.delete(key);
    });
}

function expandAllFooter() {
    ['footer:display', 'footer:contact', 'footer:privacy', 'footer:social', 'footer:partners'].forEach((key) => setExpanded(key, true));
    const footer = getDraftConfig().footer || {};
    (footer.socialLinks || []).forEach((_, index) => setExpanded(`footer:social:${index}`, true));
    (footer.partners || []).forEach((_, index) => setExpanded(`footer:partner:${index}`, true));
}

function collapseAllFooter() {
    Array.from(moduleState.expanded).forEach((key) => {
        if (key.startsWith('footer:')) moduleState.expanded.delete(key);
    });
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
        if (moduleState.dirty && !window.confirm('There are unsynced changes. Replace local draft with published config?')) return;
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
    if (moduleState.bound) return;
    moduleState.bound = true;

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
    deps.setPageHeader('主站导航', '按主站 Header / Footer 共用导航树管理一级与二级结构。');
    await ensureLoaded(false);
    deps.setContent(renderNavigationPage());
    bindEditor(deps);
}

export async function renderSiteFooterAdmin(input) {
    const deps = createDeps(input, renderFooterPage);
    deps.setPageHeader('主站 Footer', '管理 Contact、Privacy、Social、Partners，改动异步即时同步。');
    await ensureLoaded(false);
    deps.setContent(renderFooterPage());
    bindEditor(deps);
}
