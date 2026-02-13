// Supabase Init
        const SUPABASE_URL = "https://mkpcliytqudclkwtewru.supabase.co";
        const SUPABASE_KEY = "sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw"; 
        const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        const FEEDER_OPTIONS_TABLE = 'feeder_form_options';
        const REMOTE_OPTION_SECTIONS = ['category', 'publisher', 'tag', 'secondary_tag'];
        let remoteOptionsTableReady = false;

        const I18N = {
            en: {
                pageTitle: 'GasGx Mobile Feeder v23',
                appName: 'GasGx Feeder',
                appSubtitle: 'Mobile Link Control',
                targetUrl: 'Target URL',
                ready: 'Ready',
                category: 'Category',
                publisher: 'Publisher',
                mainTag: 'Main Tag',
                secondaryTag: 'Secondary Tag',
                categoryCustomPlaceholder: 'Type custom Category...',
                publisherCustomPlaceholder: 'Type custom Publisher...',
                tagCustomPlaceholder: 'Type custom Tag...',
                secondaryTagCustomPlaceholder: 'Type custom Sec Tag...',
                sendToCloud: 'SEND TO CLOUD',
                recentGeneratedLinks: 'Recent Generated Links',
                clearHistory: 'Clear History',
                toastDefault: 'Task Added!',
                pasteLink: 'Paste link',
                send: 'Send',
                deleteCachedOption: 'Delete cached option',
                toastPasted: 'Content pasted',
                toastClipboardEmpty: 'Clipboard is empty',
                toastManualPaste: 'Please paste manually in input box',
                toastPublishSuccess: 'Published successfully!',
                toastSubmittedNoId: 'Submitted, but no ID returned',
                toastErrorPrefix: 'Error: ',
                statusSending: 'Sending...',
                historyEmpty: 'No recent history',
                manageOptions: 'Edit Options',
                manageOptionsDone: 'Done Editing',
                editOptionLabel: 'Edit option',
                toastManageModeOn: 'Option edit mode ON',
                toastManageModeOff: 'Option edit mode OFF',
                toastOptionRenamed: 'Option renamed',
                renameOptionPrompt: 'Rename option',
                renameOptionInvalid: 'Option name cannot be empty',
                renameOptionFailed: 'Rename failed',
                addOptionNow: 'Add option',
                toastOptionAdded: 'Option added',
                toastOptionExists: 'Option already exists',
                addOptionFailed: 'Add option failed'
            },
            zh: {
                pageTitle: 'GasGx 移动采集台 v23',
                appName: 'GasGx 采集台',
                appSubtitle: '移动链接录入',
                targetUrl: '目标链接',
                ready: '就绪',
                category: '分类',
                publisher: '来源',
                mainTag: '主标签',
                secondaryTag: '次标签',
                categoryCustomPlaceholder: '输入自定义 Category...',
                publisherCustomPlaceholder: '输入自定义 Publisher...',
                tagCustomPlaceholder: '输入自定义 Tag...',
                secondaryTagCustomPlaceholder: '输入自定义 Secondary Tag...',
                sendToCloud: '提交到云端',
                recentGeneratedLinks: '最近生成链接',
                clearHistory: '清空历史',
                toastDefault: '任务已添加！',
                pasteLink: '粘贴链接',
                send: '发送',
                deleteCachedOption: '删除缓存项',
                toastPasted: '已粘贴内容',
                toastClipboardEmpty: '剪贴板为空',
                toastManualPaste: '请长按输入框手动粘贴',
                toastPublishSuccess: '发布成功！',
                toastSubmittedNoId: '已提交，但未返回ID',
                toastErrorPrefix: '错误：',
                statusSending: '发送中...',
                historyEmpty: '暂无历史记录',
                manageOptions: '编辑标签',
                manageOptionsDone: '完成编辑',
                editOptionLabel: '编辑选项',
                toastManageModeOn: '已开启标签编辑模式',
                toastManageModeOff: '已关闭标签编辑模式',
                toastOptionRenamed: '标签已重命名',
                renameOptionPrompt: '重命名标签',
                renameOptionInvalid: '标签名称不能为空',
                renameOptionFailed: '重命名失败',
                addOptionNow: '新增标签',
                toastOptionAdded: '标签已新增',
                toastOptionExists: '标签已存在',
                addOptionFailed: '新增失败'
            }
        };

        const LANG_STORE_KEY = 'gasgx_feeder_lang';
        let currentLang = localStorage.getItem(LANG_STORE_KEY) === 'zh' ? 'zh' : 'en';

        function t(key) {
            const active = I18N[currentLang] || I18N.en;
            return active[key] || I18N.en[key] || key;
        }

        function getLocalizedLabel(label) {
            if (label && typeof label === 'object') {
                return label[currentLang] || label.en || label.zh || '';
            }
            return String(label || '');
        }

        function setLanguage(lang) {
            if (!I18N[lang]) return;
            currentLang = lang;
            localStorage.setItem(LANG_STORE_KEY, lang);
            applyI18n();
        }

        function updateOptionManageBtn() {
            const btn = document.getElementById('optionManageBtn');
            if (!btn) return;
            btn.classList.toggle('active', optionManageMode);
            btn.innerHTML = optionManageMode
                ? '<i class="fa-solid fa-check"></i>'
                : '<i class="fa-solid fa-pen"></i>';
            const label = optionManageMode ? t('manageOptionsDone') : t('manageOptions');
            btn.setAttribute('aria-label', label);
            btn.setAttribute('title', label);
            document.body.classList.toggle('manage-mode', optionManageMode);
        }

        function toggleOptionManageMode() {
            optionManageMode = !optionManageMode;
            updateOptionManageBtn();
            renderSecondaryTagGroups();
            Object.entries(gridConfigMap).forEach(([inputId, cfg]) => {
                if (inputId === 'secondary_tag') return;
                renderGrid(cfg.containerId, inputId, cfg.items, cfg.defaultVal);
            });
            showToast(optionManageMode ? t('toastManageModeOn') : t('toastManageModeOff'));
        }

        // Data Config (parameter IDs stay in English)
        const categories = [
            { id: 'gas-energy', label: { en: 'Gas Energy', zh: '天然气能源' } },
            { id: 'generators', label: { en: 'Generators', zh: '发电机' } },
            { id: 'bitcoin-mining', label: { en: 'BTC Mining', zh: '比特币挖矿' } },
            { id: 'flash', label: { en: 'Flash', zh: '快讯' } },
            { id: 'insights', label: { en: 'Insights', zh: '洞察' } },
            { id: 'data', label: { en: 'Data', zh: '数据' } },
            { id: 'events', label: { en: 'Events', zh: '活动' } },
            { id: 'custom', label: { en: '+ DIY', zh: '+ 自定义' } }
        ];

        const publishers = [
            { id: 'GasGx-Researcher', label: { en: 'GasGx', zh: 'GasGx' } },
            { id: 'WuShuoBlock', label: { en: 'WuShuo', zh: '吴说' } },
            { id: 'Blockbeats', label: { en: 'Blockbeats', zh: 'Blockbeats' } },
            { id: 'Chaincatcher', label: { en: 'ChainC.', zh: '链捕手' } },
            { id: 'Panewslab', label: { en: 'Panews', zh: 'Panews' } },
            { id: 'Odaily', label: { en: 'Odaily', zh: 'Odaily' } },
            { id: 'Techflow', label: { en: 'Techflow', zh: 'Techflow' } },
            { id: 'Linkein', label: { en: 'LinkedIn', zh: '领英' } },
            { id: 'custom', label: { en: '+ DIY', zh: '+ 自定义' } }
        ];

        const mainTags = [
            { id: 'Hardware', label: { en: 'Hardware', zh: '硬件' } },
            { id: 'Policy', label: { en: 'Policy', zh: '政策' } },
            { id: 'Finance', label: { en: 'Finance', zh: '金融' } },
            { id: 'Tech', label: { en: 'Tech', zh: '技术' } },
            { id: 'Market', label: { en: 'Market', zh: '市场' } },
            { id: 'custom', label: { en: '+ DIY', zh: '+ 自定义' } }
        ];

        const SECONDARY_TAG_SECTION_PREFIX = 'secondary_tag__';
        const DEFAULT_SECONDARY_TAG_GROUP = 'gas-energy';
        let secondaryTagRemoteSectionMode = 'grouped';
        let activeSecondaryTagGroup = DEFAULT_SECONDARY_TAG_GROUP;
        let secondaryTagGroupIds = [];
        const secondaryCustomOpenState = {};
        const secondaryTagOptionsByGroup = {};

        function getFallbackSecondaryTagGroupId() {
            return secondaryTagGroupIds[0] || DEFAULT_SECONDARY_TAG_GROUP;
        }

        function setSecondaryTagGroupIds(groupIds = []) {
            const normalized = Array.from(new Set(
                (groupIds || [])
                    .map((id) => normalizeValue(id).toLowerCase())
                    .filter((id) => id && id !== 'custom')
            ));
            if (!normalized.length) normalized.push(DEFAULT_SECONDARY_TAG_GROUP);

            secondaryTagGroupIds = normalized;

            Object.keys(secondaryTagOptionsByGroup).forEach((groupId) => {
                if (!secondaryTagGroupIds.includes(groupId)) delete secondaryTagOptionsByGroup[groupId];
            });
            secondaryTagGroupIds.forEach((groupId) => {
                if (!Array.isArray(secondaryTagOptionsByGroup[groupId]) || !secondaryTagOptionsByGroup[groupId].length) {
                    secondaryTagOptionsByGroup[groupId] = [
                        { id: 'custom', label: { en: '+ DIY', zh: '+ 自定义' } }
                    ];
                }
            });

            Object.keys(secondaryCustomOpenState).forEach((groupId) => {
                if (!secondaryTagGroupIds.includes(groupId)) delete secondaryCustomOpenState[groupId];
            });
            secondaryTagGroupIds.forEach((groupId) => {
                if (typeof secondaryCustomOpenState[groupId] !== 'boolean') secondaryCustomOpenState[groupId] = false;
            });

            const normalizedActive = normalizeSecondaryTagGroupId(activeSecondaryTagGroup);
            activeSecondaryTagGroup = normalizedActive || getFallbackSecondaryTagGroupId();
        }

        setSecondaryTagGroupIds(categories.map((item) => item && item.id));

        const baseOptions = {
            category: categories,
            publisher: publishers,
            tag: mainTags
        };
        const gridConfigMap = {
            category: { containerId: 'category-container', items: categories, defaultVal: 'gas-energy' },
            publisher: { containerId: 'publisher-container', items: publishers, defaultVal: 'GasGx-Researcher' },
            tag: { containerId: 'tag-container', items: mainTags, defaultVal: 'Hardware' },
            secondary_tag: { containerId: 'secondary_tag-groups', items: [], defaultVal: '' }
        };
        const LAST_STORE_KEY = 'gasgx_feeder_last_state';
        const manualOverride = {};
        let optionManageMode = false;

        function applyI18n() {
            document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
            document.title = t('pageTitle');

            document.querySelectorAll('[data-i18n]').forEach((node) => {
                const key = node.getAttribute('data-i18n');
                node.textContent = t(key);
            });

            document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
                const key = node.getAttribute('data-i18n-placeholder');
                node.setAttribute('placeholder', t(key));
            });

            document.querySelectorAll('[data-i18n-aria]').forEach((node) => {
                const key = node.getAttribute('data-i18n-aria');
                node.setAttribute('aria-label', t(key));
            });

            const langBtnEn = document.getElementById('langBtnEn');
            const langBtnZh = document.getElementById('langBtnZh');
            if (langBtnEn) langBtnEn.classList.toggle('active', currentLang === 'en');
            if (langBtnZh) langBtnZh.classList.toggle('active', currentLang === 'zh');
            updateOptionManageBtn();

            Object.entries(gridConfigMap).forEach(([inputId, cfg]) => {
                renderGrid(cfg.containerId, inputId, cfg.items, cfg.defaultVal);
            });
            const categoryValue = document.getElementById('category') ? document.getElementById('category').value : '';
            const targetGroup = normalizeSecondaryTagGroupId(categoryValue);
            if (targetGroup) {
                activeSecondaryTagGroup = targetGroup;
                const groupInput = document.getElementById('secondary_tag_group');
                if (groupInput) groupInput.value = targetGroup;
            }
            renderSecondaryTagGroups();
            renderHistory();
        }

        function normalizeValue(value) {
            return (value || '').toString().trim();
        }

        function encodeOptionId(value) {
            // Keep decodeURIComponent compatibility while safely embedding in single-quoted inline handlers.
            return encodeURIComponent(normalizeValue(value)).replace(/[!'()*]/g, (char) =>
                `%${char.charCodeAt(0).toString(16).toUpperCase()}`
            );
        }

        function escapeHtmlAttr(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }

        function normalizeSectionKey(rawSection) {
            const section = normalizeValue(rawSection).toLowerCase();
            if (!section) return '';
            if (section === 'main_tag') return 'tag';
            if (section === 'maintag') return 'tag';
            if (section === 'secondary') return 'secondary_tag';
            if (section === 'secondarytag') return 'secondary_tag';
            return REMOTE_OPTION_SECTIONS.includes(section) ? section : '';
        }

        function normalizeSecondaryTagGroupId(rawValue) {
            const value = normalizeValue(rawValue).toLowerCase();
            if (!value) return '';
            if (value === 'btc-mining') return 'bitcoin-mining';
            return secondaryTagGroupIds.includes(value) ? value : '';
        }

        function getSecondaryTagSection(groupId = activeSecondaryTagGroup) {
            const normalizedGroup = normalizeSecondaryTagGroupId(groupId) || getFallbackSecondaryTagGroupId();
            return `${SECONDARY_TAG_SECTION_PREFIX}${normalizedGroup}`;
        }

        function encodeSecondaryOptionIdForLegacy(optionId, groupId = '') {
            const normalizedOptionId = normalizeValue(optionId);
            if (!normalizedOptionId) return '';
            const normalizedGroup = normalizeSecondaryTagGroupId(groupId || activeSecondaryTagGroup) || getFallbackSecondaryTagGroupId();
            if (!normalizedGroup) return normalizedOptionId;
            return `${normalizedGroup}::${normalizedOptionId}`;
        }

        function decodeSecondaryOptionIdForLegacy(rawOptionId) {
            const optionId = normalizeValue(rawOptionId);
            if (!optionId) return { groupId: '', optionId: '' };
            const separatorIndex = optionId.indexOf('::');
            if (separatorIndex <= 0) return { groupId: '', optionId };

            const maybeGroup = normalizeSecondaryTagGroupId(optionId.slice(0, separatorIndex));
            const plainOptionId = normalizeValue(optionId.slice(separatorIndex + 2));
            if (!maybeGroup || !plainOptionId) return { groupId: '', optionId };
            return { groupId: maybeGroup, optionId: plainOptionId };
        }

        function toRemoteOptionId(inputId, optionId, groupId = '') {
            const normalizedInputId = normalizeSectionKey(inputId);
            const normalizedOptionId = normalizeValue(optionId);
            if (!normalizedOptionId) return '';
            if (normalizedInputId === 'secondary_tag' && secondaryTagRemoteSectionMode === 'legacy') {
                return encodeSecondaryOptionIdForLegacy(normalizedOptionId, groupId);
            }
            return normalizedOptionId;
        }

        function resolveInMemorySectionForInput(inputId, groupId = '') {
            const normalizedInputId = normalizeSectionKey(inputId);
            if (!normalizedInputId) return '';
            if (normalizedInputId === 'secondary_tag') return getSecondaryTagSection(groupId || activeSecondaryTagGroup);
            return normalizedInputId;
        }

        function isGroupedSecondaryTagSection(section) {
            return normalizeValue(section).toLowerCase().startsWith(SECONDARY_TAG_SECTION_PREFIX);
        }

        function isSecondaryTagSectionConstraintError(error) {
            const code = normalizeValue(error && error.code).toUpperCase();
            const msg = normalizeValue(error && error.message).toLowerCase();
            return code === '23514' || (msg.includes('section') && msg.includes('check'));
        }

        function getSecondaryTagGroupFromSection(rawSection) {
            const section = normalizeValue(rawSection).toLowerCase();
            if (!section) return '';
            if (section.startsWith(SECONDARY_TAG_SECTION_PREFIX)) {
                return normalizeSecondaryTagGroupId(section.slice(SECONDARY_TAG_SECTION_PREFIX.length));
            }
            if (section === 'secondary_tag' || section === 'secondary' || section === 'secondarytag') {
                return DEFAULT_SECONDARY_TAG_GROUP;
            }
            return '';
        }

        function resolveRemoteSectionForInput(inputId, groupId = '') {
            const normalizedInputId = normalizeSectionKey(inputId);
            if (!normalizedInputId) return '';
            if (normalizedInputId === 'secondary_tag') {
                if (secondaryTagRemoteSectionMode === 'legacy') return 'secondary_tag';
                return getSecondaryTagSection(groupId || activeSecondaryTagGroup);
            }
            return normalizedInputId;
        }

        function getOptionItemsByInput(inputId, groupId = '') {
            const normalizedInputId = normalizeSectionKey(inputId);
            if (!normalizedInputId) return [];
            if (normalizedInputId === 'secondary_tag') {
                const normalizedGroup = normalizeSecondaryTagGroupId(groupId || activeSecondaryTagGroup) || getFallbackSecondaryTagGroupId();
                return secondaryTagOptionsByGroup[normalizedGroup] || [];
            }
            return baseOptions[normalizedInputId] || [];
        }

        function getCategoryLabelById(categoryId) {
            const key = normalizeValue(categoryId).toLowerCase();
            if (!key) return '';
            const match = categories.find(item => normalizeValue(item.id).toLowerCase() === key);
            return match ? getLocalizedLabel(match.label) : categoryId;
        }

        function ensureCustomOption(items) {
            const dedup = [];
            const seen = new Set();
            (items || []).forEach((item) => {
                const id = normalizeValue(item && item.id);
                if (!id || id.toLowerCase() === 'custom') return;
                const key = id.toLowerCase();
                if (seen.has(key)) return;
                seen.add(key);
                dedup.push({
                    id,
                    label: item.label
                });
            });
            dedup.push({ id: 'custom', label: { en: '+ DIY', zh: '+ 自定义' } });
            return dedup;
        }

        function replaceOptionItems(targetItems, nextItems) {
            targetItems.splice(0, targetItems.length, ...ensureCustomOption(nextItems));
        }

        async function loadRemoteOptionConfig() {
            try {
                const { data, error } = await client
                    .from(FEEDER_OPTIONS_TABLE)
                    .select('section, option_id, label_en, label_zh, sort_order, is_active')
                    .eq('is_active', true)
                    .order('sort_order', { ascending: true });

                if (error) {
                    console.warn('Load feeder options from Supabase failed:', error);
                    return;
                }

                remoteOptionsTableReady = true;
                const rows = Array.isArray(data) ? data : [];

                const grouped = {
                    category: [],
                    publisher: [],
                    tag: []
                };
                const groupedSecondary = {};
                const legacySecondaryByGroup = {};
                let hasGroupedSecondaryRows = false;
                let hasLegacySecondaryRows = false;

                rows.forEach((row) => {
                    const optionId = normalizeValue(row.option_id);
                    if (!optionId || optionId.toLowerCase() === 'custom') return;

                    const optionItem = {
                        id: optionId,
                        label: {
                            en: normalizeValue(row.label_en) || optionId,
                            zh: normalizeValue(row.label_zh) || normalizeValue(row.label_en) || optionId
                        }
                    };

                    const rawSection = normalizeValue(row.section).toLowerCase();
                    const secondaryGroup = getSecondaryTagGroupFromSection(row.section);
                    if (secondaryGroup && rawSection.startsWith(SECONDARY_TAG_SECTION_PREFIX)) {
                        hasGroupedSecondaryRows = true;
                        if (!Array.isArray(groupedSecondary[secondaryGroup])) groupedSecondary[secondaryGroup] = [];
                        groupedSecondary[secondaryGroup].push(optionItem);
                        return;
                    }
                    if (rawSection === 'secondary_tag' || rawSection === 'secondary' || rawSection === 'secondarytag') {
                        hasLegacySecondaryRows = true;
                        const decodedLegacy = decodeSecondaryOptionIdForLegacy(optionId);
                        const targetGroup = decodedLegacy.groupId || getFallbackSecondaryTagGroupId();
                        if (!targetGroup) return;
                        if (!Array.isArray(legacySecondaryByGroup[targetGroup])) legacySecondaryByGroup[targetGroup] = [];
                        legacySecondaryByGroup[targetGroup].push({
                            ...optionItem,
                            id: decodedLegacy.optionId || optionId,
                            label: {
                                en: normalizeValue(row.label_en) || decodedLegacy.optionId || optionId,
                                zh: normalizeValue(row.label_zh) || normalizeValue(row.label_en) || decodedLegacy.optionId || optionId
                            }
                        });
                        return;
                    }

                    const section = normalizeSectionKey(row.section);
                    if (!section || section === 'secondary_tag') return;
                    grouped[section].push(optionItem);
                });

                const optionMap = {
                    category: categories,
                    publisher: publishers,
                    tag: mainTags
                };

                Object.entries(grouped).forEach(([section, items]) => {
                    if (!items.length) return;
                    replaceOptionItems(optionMap[section], items);
                });

                const categoryGroupIds = categories
                    .map((item) => normalizeValue(item && item.id).toLowerCase())
                    .filter((id) => id && id !== 'custom');
                const groupedSecondaryIds = Object.keys(groupedSecondary);
                const nextGroupIds = Array.from(new Set([...categoryGroupIds, ...groupedSecondaryIds]));
                setSecondaryTagGroupIds(nextGroupIds);

                secondaryTagGroupIds.forEach((groupId) => {
                    const byGroup = groupedSecondary[groupId] || [];
                    const legacyItems = legacySecondaryByGroup[groupId] || [];
                    const nextItems = byGroup.length ? byGroup : legacyItems;
                    replaceOptionItems(secondaryTagOptionsByGroup[groupId], nextItems);
                });

                if (hasGroupedSecondaryRows) {
                    secondaryTagRemoteSectionMode = 'grouped';
                } else if (hasLegacySecondaryRows) {
                    secondaryTagRemoteSectionMode = 'legacy';
                }
            } catch (e) {
                console.warn('Load feeder options exception:', e);
            }
        }

        async function saveCustomOptionRemote(inputId, value, groupId = '') {
            if (!remoteOptionsTableReady) return false;
            let section = resolveRemoteSectionForInput(inputId, groupId);
            const optionId = normalizeValue(value);
            if (!section || !optionId) return false;
            try {
                const doUpsert = async (targetSection, targetOptionId) => {
                    const payload = {
                        section: targetSection,
                        option_id: targetOptionId,
                        label_en: optionId,
                        label_zh: optionId,
                        sort_order: 999,
                        is_active: true
                    };
                    return client
                        .from(FEEDER_OPTIONS_TABLE)
                        .upsert([payload], { onConflict: 'section,option_id' });
                };

                let remoteOptionId = toRemoteOptionId(inputId, optionId, groupId);
                let { error } = await doUpsert(section, remoteOptionId);
                if (
                    error &&
                    isGroupedSecondaryTagSection(section) &&
                    isSecondaryTagSectionConstraintError(error)
                ) {
                    secondaryTagRemoteSectionMode = 'legacy';
                    section = 'secondary_tag';
                    remoteOptionId = toRemoteOptionId(inputId, optionId, groupId);
                    ({ error } = await doUpsert(section, remoteOptionId));
                }
                if (error) {
                    console.warn('Save custom option to Supabase failed:', error);
                    return false;
                }
                return true;
            } catch (e) {
                console.warn('Save custom option exception:', e);
                return false;
            }
        }

        async function removeCustomOptionRemote(inputId, value, groupId = '') {
            if (!remoteOptionsTableReady) return;
            let section = resolveRemoteSectionForInput(inputId, groupId);
            const optionId = normalizeValue(value);
            if (!section || !optionId) return;
            try {
                const doDelete = async (targetSection, targetOptionId) => client
                    .from(FEEDER_OPTIONS_TABLE)
                    .delete()
                    .eq('section', targetSection)
                    .eq('option_id', targetOptionId);

                let remoteOptionId = toRemoteOptionId(inputId, optionId, groupId);
                let { error } = await doDelete(section, remoteOptionId);
                if (
                    error &&
                    isGroupedSecondaryTagSection(section) &&
                    isSecondaryTagSectionConstraintError(error)
                ) {
                    secondaryTagRemoteSectionMode = 'legacy';
                    section = 'secondary_tag';
                    remoteOptionId = toRemoteOptionId(inputId, optionId, groupId);
                    ({ error } = await doDelete(section, remoteOptionId));
                }
                if (error) {
                    console.warn('Remove custom option from Supabase failed:', error);
                }
            } catch (e) {
                console.warn('Remove custom option exception:', e);
            }
        }

        async function renameOptionRemote(inputId, oldValue, nextValue, groupId = '') {
            if (!remoteOptionsTableReady) return false;
            let section = resolveRemoteSectionForInput(inputId, groupId);
            const oldOptionId = normalizeValue(oldValue);
            const nextOptionId = normalizeValue(nextValue);
            if (!section || !oldOptionId || !nextOptionId) return false;
            if (oldOptionId.toLowerCase() === nextOptionId.toLowerCase()) return true;

            try {
                const executeRenameForSection = async (targetSection, sourceOptionId, targetOptionId) => {
                    const { data: existingData, error: findError } = await client
                        .from(FEEDER_OPTIONS_TABLE)
                        .select('sort_order, is_active')
                        .eq('section', targetSection)
                        .eq('option_id', sourceOptionId)
                        .limit(1);
                    if (findError) return { ok: false, error: findError };

                    const current = Array.isArray(existingData) && existingData.length ? existingData[0] : null;
                    const payload = {
                        section: targetSection,
                        option_id: targetOptionId,
                        label_en: nextOptionId,
                        label_zh: nextOptionId,
                        sort_order: current && typeof current.sort_order === 'number' ? current.sort_order : 999,
                        is_active: current && typeof current.is_active === 'boolean' ? current.is_active : true
                    };

                    const { error: upsertError } = await client
                        .from(FEEDER_OPTIONS_TABLE)
                        .upsert([payload], { onConflict: 'section,option_id' });
                    if (upsertError) return { ok: false, error: upsertError };

                    const { error: deleteOldError } = await client
                        .from(FEEDER_OPTIONS_TABLE)
                        .delete()
                        .eq('section', targetSection)
                        .eq('option_id', sourceOptionId);
                    if (deleteOldError) return { ok: false, error: deleteOldError };

                    return { ok: true, error: null };
                };

                let remoteOldOptionId = toRemoteOptionId(inputId, oldOptionId, groupId);
                let remoteNextOptionId = toRemoteOptionId(inputId, nextOptionId, groupId);
                let renameResult = await executeRenameForSection(section, remoteOldOptionId, remoteNextOptionId);
                if (
                    !renameResult.ok &&
                    isGroupedSecondaryTagSection(section) &&
                    isSecondaryTagSectionConstraintError(renameResult.error)
                ) {
                    secondaryTagRemoteSectionMode = 'legacy';
                    section = 'secondary_tag';
                    remoteOldOptionId = toRemoteOptionId(inputId, oldOptionId, groupId);
                    remoteNextOptionId = toRemoteOptionId(inputId, nextOptionId, groupId);
                    renameResult = await executeRenameForSection(section, remoteOldOptionId, remoteNextOptionId);
                }

                if (!renameResult.ok) {
                    console.warn('Rename option failed:', renameResult.error);
                    return false;
                }

                return true;
            } catch (e) {
                console.warn('Rename option exception:', e);
                return false;
            }
        }

        function persistCustomValue(inputId, value, groupId = '') {
            const val = normalizeValue(value);
            if (!val) return;
            const baseList = getOptionItemsByInput(inputId, groupId).map(item => (item.id || '').toString().toLowerCase());
            if (baseList.includes(val.toLowerCase())) return;
            const section = resolveInMemorySectionForInput(inputId, groupId);
            saveCustomOptionRemote(inputId, val, groupId);
            if (section) upsertOptionInMemory(section, val, val);
        }

        function saveLastSelections(data) {
            try {
                localStorage.setItem(LAST_STORE_KEY, JSON.stringify(data));
            } catch (e) {
                console.warn('Save last selections failed:', e);
            }
        }

        function loadLastSelections() {
            try {
                const raw = localStorage.getItem(LAST_STORE_KEY);
                if (!raw) return;
                const data = JSON.parse(raw);
                if (!data || typeof data !== 'object') return;
                Object.keys(gridConfigMap).forEach(inputId => {
                    if (data[inputId]) {
                        const hiddenInput = document.getElementById(inputId);
                        if (hiddenInput) hiddenInput.value = data[inputId];
                    }
                });
                if (data.secondary_tag_group) {
                    const savedGroup = normalizeSecondaryTagGroupId(data.secondary_tag_group);
                    if (savedGroup) activeSecondaryTagGroup = savedGroup;
                }
                const savedCategory = data.category;
                const targetGroup = normalizeSecondaryTagGroupId(savedCategory);
                if (targetGroup) activeSecondaryTagGroup = targetGroup;
                const groupInput = document.getElementById('secondary_tag_group');
                if (groupInput) groupInput.value = activeSecondaryTagGroup;
            } catch (e) {
                console.warn('Load last selections failed:', e);
            }
        }

        function applySelection(inputId, value, force = false) {
            const val = normalizeValue(value);
            if (!val) return;
            if (!force && manualOverride[inputId]) return;
            const hiddenInput = document.getElementById(inputId);
            if (hiddenInput) hiddenInput.value = val;
            if (inputId === 'category') {
                const targetGroup = normalizeSecondaryTagGroupId(val);
                const groupInput = document.getElementById('secondary_tag_group');
                if (targetGroup) {
                    activeSecondaryTagGroup = targetGroup;
                    if (groupInput) groupInput.value = targetGroup;
                } else {
                    activeSecondaryTagGroup = '';
                    if (groupInput) groupInput.value = '';
                    const secondaryTagInput = document.getElementById('secondary_tag');
                    if (secondaryTagInput) secondaryTagInput.value = '';
                }
                renderSecondaryTagGroups();
            }
            const cfg = gridConfigMap[inputId];
            if (cfg) renderGrid(cfg.containerId, inputId, cfg.items, cfg.defaultVal);
        }

        function getOptionTargetListBySection(section) {
            const rawSection = normalizeValue(section);
            if (!rawSection) return [];
            const groupId = getSecondaryTagGroupFromSection(rawSection);
            if (groupId && rawSection.toLowerCase().startsWith(SECONDARY_TAG_SECTION_PREFIX)) {
                return secondaryTagOptionsByGroup[groupId] || [];
            }
            const normalizedSection = normalizeSectionKey(rawSection);
            if (!normalizedSection) return [];
            if (normalizedSection === 'secondary_tag') {
                return secondaryTagOptionsByGroup[getFallbackSecondaryTagGroupId()] || [];
            }
            return baseOptions[normalizedSection] || [];
        }

        function upsertOptionInMemory(section, optionId, labelEn = optionId, labelZh = optionId) {
            const val = normalizeValue(optionId);
            if (!val) return;
            const targetItems = getOptionTargetListBySection(section);
            if (!Array.isArray(targetItems)) return;

            const key = val.toLowerCase();
            const existingIndex = targetItems.findIndex(item => normalizeValue(item && item.id).toLowerCase() === key);
            if (existingIndex >= 0) {
                if (normalizeValue(targetItems[existingIndex].id).toLowerCase() === 'custom') return;
                targetItems[existingIndex] = {
                    ...targetItems[existingIndex],
                    id: val,
                    label: {
                        en: normalizeValue(labelEn) || val,
                        zh: normalizeValue(labelZh) || normalizeValue(labelEn) || val
                    }
                };
                return;
            }

            const customIndex = targetItems.findIndex(item => normalizeValue(item && item.id).toLowerCase() === 'custom');
            const newItem = {
                id: val,
                label: {
                    en: normalizeValue(labelEn) || val,
                    zh: normalizeValue(labelZh) || normalizeValue(labelEn) || val
                }
            };
            if (customIndex >= 0) {
                targetItems.splice(customIndex, 0, newItem);
            } else {
                targetItems.push(newItem);
            }
        }

        function removeOptionInMemory(section, optionId) {
            const val = normalizeValue(optionId);
            if (!val) return;
            const targetItems = getOptionTargetListBySection(section);
            if (!Array.isArray(targetItems) || !targetItems.length) return;
            const keep = targetItems.filter((item) => normalizeValue(item && item.id).toLowerCase() !== val.toLowerCase());
            replaceOptionItems(targetItems, keep);
        }

        function renameOptionInMemory(section, oldOptionId, nextOptionId) {
            const oldVal = normalizeValue(oldOptionId);
            const nextVal = normalizeValue(nextOptionId);
            if (!oldVal || !nextVal) return;
            const targetItems = getOptionTargetListBySection(section);
            if (!Array.isArray(targetItems) || !targetItems.length) return;

            const oldKey = oldVal.toLowerCase();
            const renamedItems = [];
            const seen = new Set();

            targetItems.forEach((item) => {
                const id = normalizeValue(item && item.id);
                if (!id || id.toLowerCase() === 'custom') return;
                const idKey = id.toLowerCase();
                const finalId = idKey === oldKey ? nextVal : id;
                const finalKey = finalId.toLowerCase();
                if (seen.has(finalKey)) return;
                seen.add(finalKey);

                if (idKey === oldKey) {
                    renamedItems.push({
                        ...item,
                        id: nextVal,
                        label: {
                            en: nextVal,
                            zh: nextVal
                        }
                    });
                    return;
                }
                renamedItems.push(item);
            });

            replaceOptionItems(targetItems, renamedItems);
        }

        function parseUrlSafe(url) {
            if (!url) return null;
            try {
                return new URL(url);
            } catch (e) {
                try {
                    return new URL(`https://${url}`);
                } catch (err) {
                    return null;
                }
            }
        }

        function detectPublisherFromUrl(url) {
            if (!url) return '';
            const parsedUrl = parseUrlSafe(url);
            if (!parsedUrl) return '';

            const host = (parsedUrl.hostname || '').toLowerCase().replace(/^www\./, '');
            const isHost = (domain) => host === domain || host.endsWith(`.${domain}`);

            if (isHost('gasgx.com')) return 'GasGx-Researcher';
            if (isHost('x.com') || isHost('twitter.com')) return 'X';
            if (isHost('linkedin.com')) return 'Linkein';
            if (isHost('wublock123.com')) return 'WuShuoBlock';
            if (isHost('theblockbeats.news')) return 'Blockbeats';
            if (isHost('chaincatcher.com')) return 'Chaincatcher';
            if (isHost('panewslab.com')) return 'Panewslab';
            if (isHost('odaily.news') || isHost('odaily.com')) return 'Odaily';
            if (isHost('techflowpost.com')) return 'Techflow';
            if (isHost('mp.weixin.qq.com') || isHost('weixin.qq.com')) return 'Weixin';

            return '';
        }

        function isMissingColumnError(error) {
            const code = (error && error.code ? String(error.code) : '').toUpperCase();
            const msg = (error && error.message ? error.message : '').toLowerCase();
            return code === 'PGRST204' || (msg.includes('column') && (msg.includes('does not exist') || msg.includes('schema cache')));
        }

        function applyUrlHints(url) {
            if (!url) return;
            const detectedPublisher = detectPublisherFromUrl(url);
            if (!detectedPublisher) return;
            manualOverride.publisher = false;
            applySelection('publisher', detectedPublisher, true);
        }

        function mergeOptions(items) {
            const seen = new Set();
            const merged = [];
            for (const item of (items || [])) {
                const key = normalizeValue(item && item.id).toLowerCase();
                if (key && !seen.has(key)) {
                    seen.add(key);
                    merged.push(item);
                }
            }
            return merged;
        }

        function collectDisplayedOptionPayload(inputId, groupId = '') {
            const normalizedInputId = normalizeSectionKey(inputId);
            if (!normalizedInputId) return [];
            if (normalizedInputId === 'secondary_tag' && !groupId) {
                return secondaryTagGroupIds.flatMap((gId) => collectDisplayedOptionPayload('secondary_tag', gId));
            }

            const cfg = gridConfigMap[inputId];
            if (!cfg) return [];
            const mergedItems = mergeOptions(getOptionItemsByInput(inputId, groupId));
            const section = resolveRemoteSectionForInput(inputId, groupId);
            if (!section) return [];
            const seen = new Set();
            const payload = [];
            mergedItems.forEach((item, index) => {
                const optionId = normalizeValue(item && item.id);
                if (!optionId || optionId.toLowerCase() === 'custom') return;
                const dedupeKey = optionId.toLowerCase();
                if (seen.has(dedupeKey)) return;
                seen.add(dedupeKey);

                const rawLabel = item && item.label;
                const labelEn = normalizeValue(
                    rawLabel && typeof rawLabel === 'object'
                        ? (rawLabel.en || rawLabel.zh)
                        : rawLabel
                ) || optionId;
                const labelZh = normalizeValue(
                    rawLabel && typeof rawLabel === 'object'
                        ? (rawLabel.zh || rawLabel.en)
                        : rawLabel
                ) || labelEn;
                const remoteOptionId = toRemoteOptionId(inputId, optionId, groupId);

                payload.push({
                    section,
                    option_id: remoteOptionId,
                    label_en: labelEn,
                    label_zh: labelZh,
                    sort_order: index + 1,
                    is_active: true
                });
            });
            return payload;
        }

        function collapseSecondaryPayloadForLegacy(payload = []) {
            const dedup = new Map();
            (payload || []).forEach((item) => {
                const section = 'secondary_tag';
                const optionIdRaw = normalizeValue(item.option_id);
                if (!optionIdRaw) return;
                let optionId = optionIdRaw;
                if (isGroupedSecondaryTagSection(item.section)) {
                    const groupId = getSecondaryTagGroupFromSection(item.section);
                    optionId = encodeSecondaryOptionIdForLegacy(optionIdRaw, groupId);
                }
                if (!section || !optionId) return;
                const key = `${section}::${optionId.toLowerCase()}`;
                if (dedup.has(key)) return;
                dedup.set(key, { ...item, section, option_id: optionId });
            });
            return Array.from(dedup.values());
        }

        async function syncDisplayedOptionsToRemote(inputIds = ['tag', 'secondary_tag']) {
            if (!remoteOptionsTableReady) return;

            const normalizedInputIds = Array.from(new Set(
                (inputIds || [])
                    .map(normalizeSectionKey)
                    .filter(Boolean)
            ));
            if (!normalizedInputIds.length) return;

            const sections = Array.from(new Set(
                normalizedInputIds.flatMap((inputId) => {
                    if (inputId === 'secondary_tag') {
                        return secondaryTagGroupIds.map((groupId) => resolveRemoteSectionForInput('secondary_tag', groupId));
                    }
                    return [resolveRemoteSectionForInput(inputId)];
                }).filter(Boolean)
            ));
            if (!sections.length) return;

            const displayPayload = normalizedInputIds.flatMap((inputId) => collectDisplayedOptionPayload(inputId));
            if (!displayPayload.length) return;

            try {
                const { data, error } = await client
                    .from(FEEDER_OPTIONS_TABLE)
                    .select('section, option_id, is_active')
                    .in('section', sections);
                if (error) {
                    console.warn('Load options for display sync failed:', error);
                    return;
                }

                const remoteState = new Map();
                (data || []).forEach((row) => {
                    const section = normalizeValue(row.section).toLowerCase();
                    const optionId = normalizeValue(row.option_id);
                    if (!section || !optionId) return;
                    remoteState.set(`${section}::${optionId.toLowerCase()}`, Boolean(row.is_active));
                });

                const payloadToUpsert = displayPayload.filter((item) => {
                    const key = `${item.section}::${item.option_id.toLowerCase()}`;
                    return !remoteState.has(key) || !remoteState.get(key);
                });
                if (!payloadToUpsert.length) return;

                let { error: upsertError } = await client
                    .from(FEEDER_OPTIONS_TABLE)
                    .upsert(payloadToUpsert, { onConflict: 'section,option_id' });
                if (
                    upsertError &&
                    payloadToUpsert.some((item) => isGroupedSecondaryTagSection(item.section)) &&
                    isSecondaryTagSectionConstraintError(upsertError)
                ) {
                    secondaryTagRemoteSectionMode = 'legacy';
                    const legacyPayload = collapseSecondaryPayloadForLegacy(payloadToUpsert);
                    if (!legacyPayload.length) return;
                    ({ error: upsertError } = await client
                        .from(FEEDER_OPTIONS_TABLE)
                        .upsert(legacyPayload, { onConflict: 'section,option_id' }));
                }
                if (upsertError) {
                    console.warn('Upsert display sync options failed:', upsertError);
                }
            } catch (e) {
                console.warn('Sync displayed options to Supabase exception:', e);
            }
        }

        // --- 1. Paste Logic (点击图标触发) ---
        async function triggerPaste(autoSend = false) {
            try {
                const text = await navigator.clipboard.readText();
                if (text) {
                    const input = document.getElementById('link');
                    input.value = text;
                    manualOverride.publisher = false;
                    applyUrlHints(text);
                    // Visual Feedback
                    input.classList.add('border-gas-green');
                    setTimeout(() => input.classList.remove('border-gas-green'), 500);
                    if (autoSend) {
                        const formEl = document.getElementById('taskForm');
                        if (formEl) formEl.requestSubmit();
                    } else {
                        input.focus();
                    }
                    showToast(t('toastPasted'));
                } else {
                    showToast(t('toastClipboardEmpty'));
                }
            } catch (err) {
                console.error(err);
                // Fallback prompt for security restrictions
                showToast(t('toastManualPaste'));
            }
        }

        // --- 2. Grid & DIY Logic ---
        function renderSecondaryTagGroups() {
            const container = document.getElementById('secondary_tag-groups');
            const hiddenInput = document.getElementById('secondary_tag');
            const groupInput = document.getElementById('secondary_tag_group');
            const categoryInput = document.getElementById('category');
            if (!container || !hiddenInput) return;

            const selectedCategoryGroup = normalizeSecondaryTagGroupId(categoryInput ? categoryInput.value : '');
            if (!selectedCategoryGroup) {
                activeSecondaryTagGroup = '';
                if (groupInput) groupInput.value = '';
                hiddenInput.value = '';
                container.innerHTML = '';
                return;
            }

            const selectedValue = normalizeValue(hiddenInput.value);
            const selectedKey = selectedValue.toLowerCase();
            const normalizedActiveGroup = selectedCategoryGroup;
            activeSecondaryTagGroup = normalizedActiveGroup;
            if (groupInput) groupInput.value = normalizedActiveGroup;

            const groupId = normalizedActiveGroup;
            const mergedItems = mergeOptions(getOptionItemsByInput('secondary_tag', groupId));
            const customOpen = Boolean(secondaryCustomOpenState[groupId]);
            const customInputValue = customOpen ? escapeHtmlAttr(selectedValue) : '';

            const cardsHtml = mergedItems.map((item) => {
                const encodedId = encodeOptionId(item.id);
                const manageClass = optionManageMode && item.id !== 'custom' ? 'manage-item' : '';
                const optionKey = normalizeValue(item.id).toLowerCase();
                const isActive = selectedKey && optionKey === selectedKey;
                const showDeleteBtn = optionManageMode && item.id !== 'custom';
                const editBtn = optionManageMode && item.id !== 'custom'
                    ? `<button type="button" class="edit-x" onclick="editOption(event, 'secondary_tag', '${encodedId}', '${groupId}')" aria-label="${t('editOptionLabel')}">e</button>`
                    : '';
                const deleteBtn = showDeleteBtn
                    ? `<button type="button" class="delete-x" onclick="removeCustomOption(event, 'secondary_tag', '${encodedId}', '${groupId}')" aria-label="${t('deleteCachedOption')}">x</button>`
                    : '';
                return `
                    <div class="option-card ${manageClass} ${isActive ? 'active' : ''} ${item.id === 'custom' ? 'border-dashed border-gray-600 text-gray-500' : ''}"
                         onclick="handleSelection('secondary_tag', '${encodedId}', this, '${groupId}')">
                        ${editBtn}
                        ${getLocalizedLabel(item.label)}
                        ${deleteBtn}
                    </div>
                `;
            }).join('');

            container.innerHTML = `
                <div class="secondary-group active-group">
                    <div class="secondary-group-title">${getCategoryLabelById(groupId)}</div>
                    <div class="grid-select grid-cols-3">${cardsHtml}</div>
                    <div id="secondary_tag-custom-wrapper-${groupId}" class="custom-input-wrapper ${customOpen ? 'show' : ''}">
                        <div class="custom-input-row">
                            <input type="text"
                                   id="secondary_tag-custom-input-${groupId}"
                                   class="input-gas border-gas-green"
                                   data-i18n-placeholder="secondaryTagCustomPlaceholder"
                                   placeholder="${escapeHtmlAttr(t('secondaryTagCustomPlaceholder'))}"
                                   value="${customInputValue}"
                                   oninput="syncCustomValue('secondary_tag', this.value, '${groupId}')"
                                   onkeydown="handleCustomInputKeydown(event, 'secondary_tag', '${groupId}')">
                            <button type="button" class="custom-add-btn" onclick="addCustomOptionFromInput('secondary_tag', '${groupId}')" aria-label="${t('addOptionNow')}">+</button>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderGrid(containerId, inputId, items, defaultVal) {
            if (inputId === 'secondary_tag') {
                renderSecondaryTagGroups();
                return;
            }

            const container = document.getElementById(containerId);
            const hiddenInput = document.getElementById(inputId);
            if (!container || !hiddenInput) return;
            const resolvedItems = getOptionItemsByInput(inputId);
            const mergedItems = mergeOptions(resolvedItems.length ? resolvedItems : items);

            // Set default logic
            if(!hiddenInput.value && defaultVal) hiddenInput.value = defaultVal;
            const hasCurrentValue = mergedItems.some(item => item.id === hiddenInput.value);
            if (!hasCurrentValue && hiddenInput.value !== 'custom') {
                const firstNormal = mergedItems.find(item => item.id !== 'custom');
                hiddenInput.value = firstNormal ? firstNormal.id : '';
            }

            container.innerHTML = mergedItems.map(item => {
                const encodedId = encodeOptionId(item.id);
                const manageClass = optionManageMode && item.id !== 'custom' ? 'manage-item' : '';
                const showDeleteBtn = optionManageMode && item.id !== 'custom';
                const editBtn = optionManageMode && item.id !== 'custom'
                    ? `<button type="button" class="edit-x" onclick="editOption(event, '${inputId}', '${encodedId}')" aria-label="${t('editOptionLabel')}">e</button>`
                    : '';
                const deleteBtn = showDeleteBtn
                    ? `<button type="button" class="delete-x" onclick="removeCustomOption(event, '${inputId}', '${encodedId}')" aria-label="${t('deleteCachedOption')}">x</button>`
                    : '';
                return `
                    <div class="option-card ${manageClass} ${item.id === hiddenInput.value ? 'active' : ''} ${item.id === 'custom' ? 'border-dashed border-gray-600 text-gray-500' : ''}"
                         onclick="handleSelection('${inputId}', '${encodedId}', this)">
                        ${editBtn}
                        ${getLocalizedLabel(item.label)}
                        ${deleteBtn}
                    </div>
                `;
            }).join('');

            // Init check: if default was custom, show input
            const wrap = document.getElementById(`${inputId}-custom-wrapper`);
            if (wrap) wrap.classList.toggle('show', hiddenInput.value === 'custom');
        }

        function handleSelection(inputId, value, element, groupId = '') {
            const decodedValue = decodeURIComponent(value);
            const hiddenInput = document.getElementById(inputId);
            if (!hiddenInput) return;
            manualOverride[inputId] = true;

            if (inputId === 'secondary_tag') {
                const normalizedGroup = normalizeSecondaryTagGroupId(groupId) || getFallbackSecondaryTagGroupId();
                activeSecondaryTagGroup = normalizedGroup;
                const groupInput = document.getElementById('secondary_tag_group');
                if (groupInput) groupInput.value = normalizedGroup;

                secondaryTagGroupIds.forEach((gId) => {
                    secondaryCustomOpenState[gId] = false;
                });

                if (decodedValue === 'custom') {
                    secondaryCustomOpenState[normalizedGroup] = true;
                    const customInput = document.getElementById(`secondary_tag-custom-input-${normalizedGroup}`);
                    hiddenInput.value = customInput ? customInput.value : '';
                    renderSecondaryTagGroups();
                    const nextInput = document.getElementById(`secondary_tag-custom-input-${normalizedGroup}`);
                    if (nextInput) nextInput.focus();
                } else {
                    hiddenInput.value = decodedValue;
                    renderSecondaryTagGroups();
                }

                if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(5);
                return;
            }

            const customWrapper = document.getElementById(`${inputId}-custom-wrapper`);
            const customInput = document.getElementById(`${inputId}-custom-input`);

            // 1. UI Style Update
            const siblings = element.parentElement.children;
            for (let el of siblings) el.classList.remove('active');
            element.classList.add('active');

            // 2. Data Logic
            if(decodedValue === 'custom') {
                // Show Input
                if(customWrapper) customWrapper.classList.add('show');
                if(customInput) {
                    customInput.focus();
                    // If user already typed something, use that. If empty, it's empty string.
                    hiddenInput.value = customInput.value;
                }
            } else {
                // Hide Input & Set Value
                if(customWrapper) customWrapper.classList.remove('show');
                hiddenInput.value = decodedValue;
            }

            if (inputId === 'category') {
                const targetGroup = normalizeSecondaryTagGroupId(decodedValue);
                const groupInput = document.getElementById('secondary_tag_group');
                if (targetGroup) {
                    activeSecondaryTagGroup = targetGroup;
                    if (groupInput) groupInput.value = targetGroup;
                } else {
                    activeSecondaryTagGroup = '';
                    if (groupInput) groupInput.value = '';
                    const secondaryTagInput = document.getElementById('secondary_tag');
                    if (secondaryTagInput) secondaryTagInput.value = '';
                }
                renderSecondaryTagGroups();
            }

            // Haptic
            if(window.navigator && window.navigator.vibrate) window.navigator.vibrate(5);
        }

        async function editOption(event, inputId, encodedValue, groupId = '') {
            if (event) event.stopPropagation();
            const oldVal = normalizeValue(decodeURIComponent(encodedValue || ''));
            if (!oldVal || oldVal.toLowerCase() === 'custom') return;

            const promptTitle = `${t('renameOptionPrompt')}: ${oldVal}`;
            const nextRaw = window.prompt(promptTitle, oldVal);
            if (nextRaw === null) return;
            const nextVal = normalizeValue(nextRaw);
            if (!nextVal) {
                showToast(t('renameOptionInvalid'));
                return;
            }
            if (nextVal.toLowerCase() === 'custom') {
                showToast(t('renameOptionInvalid'));
                return;
            }

            const normalizedGroup = normalizeSecondaryTagGroupId(groupId) || activeSecondaryTagGroup;
            const section = resolveInMemorySectionForInput(inputId, normalizedGroup);
            if (!section) return;

            const renameOk = remoteOptionsTableReady
                ? await renameOptionRemote(inputId, oldVal, nextVal, normalizedGroup)
                : false;
            if (remoteOptionsTableReady && !renameOk) {
                showToast(`${t('toastErrorPrefix')}${t('renameOptionFailed')}`);
                return;
            }

            renameOptionInMemory(section, oldVal, nextVal);

            const hiddenInput = document.getElementById(inputId);
            const hiddenGroupInput = document.getElementById('secondary_tag_group');
            const hiddenGroup = normalizeSecondaryTagGroupId(hiddenGroupInput ? hiddenGroupInput.value : '');
            if (
                hiddenInput &&
                normalizeValue(hiddenInput.value).toLowerCase() === oldVal.toLowerCase() &&
                (inputId !== 'secondary_tag' || hiddenGroup === normalizedGroup)
            ) {
                hiddenInput.value = nextVal;
            }

            if (inputId === 'secondary_tag') {
                renderSecondaryTagGroups();
            } else {
                const cfg = gridConfigMap[inputId];
                if (cfg) renderGrid(cfg.containerId, inputId, cfg.items, cfg.defaultVal);
            }
            showToast(t('toastOptionRenamed'));
        }

        function getCustomInputElement(inputId, groupId = '') {
            const normalizedInputId = normalizeSectionKey(inputId);
            if (normalizedInputId === 'secondary_tag') {
                const normalizedGroup = normalizeSecondaryTagGroupId(groupId || activeSecondaryTagGroup) || getFallbackSecondaryTagGroupId();
                return document.getElementById(`secondary_tag-custom-input-${normalizedGroup}`);
            }
            return document.getElementById(`${normalizedInputId}-custom-input`);
        }

        async function addCustomOptionFromInput(inputId, groupId = '') {
            if (!optionManageMode) return;
            const normalizedInputId = normalizeSectionKey(inputId);
            if (!normalizedInputId) return;

            const normalizedGroup = normalizedInputId === 'secondary_tag'
                ? (normalizeSecondaryTagGroupId(groupId || activeSecondaryTagGroup) || getFallbackSecondaryTagGroupId())
                : '';
            const inputEl = getCustomInputElement(normalizedInputId, normalizedGroup);
            const nextVal = normalizeValue(inputEl ? inputEl.value : '');
            if (!nextVal || nextVal.toLowerCase() === 'custom') {
                showToast(t('renameOptionInvalid'));
                return;
            }

            const optionExists = getOptionItemsByInput(normalizedInputId, normalizedGroup)
                .some((item) => normalizeValue(item && item.id).toLowerCase() === nextVal.toLowerCase());
            if (optionExists) {
                showToast(t('toastOptionExists'));
                return;
            }

            const savedOk = await saveCustomOptionRemote(normalizedInputId, nextVal, normalizedGroup);
            if (remoteOptionsTableReady && !savedOk) {
                showToast(`${t('toastErrorPrefix')}${t('addOptionFailed')}`);
                return;
            }

            const section = resolveRemoteSectionForInput(normalizedInputId, normalizedGroup);
            const memorySection = resolveInMemorySectionForInput(normalizedInputId, normalizedGroup);
            if (!section || !memorySection) return;
            upsertOptionInMemory(memorySection, nextVal, nextVal);

            const hiddenInput = document.getElementById(normalizedInputId);
            if (hiddenInput) hiddenInput.value = nextVal;
            manualOverride[normalizedInputId] = true;
            if (inputEl) inputEl.value = '';

            if (normalizedInputId === 'secondary_tag') {
                activeSecondaryTagGroup = normalizedGroup;
                const groupInput = document.getElementById('secondary_tag_group');
                if (groupInput) groupInput.value = normalizedGroup;
                secondaryCustomOpenState[normalizedGroup] = false;
                renderSecondaryTagGroups();
            } else {
                const wrap = document.getElementById(`${normalizedInputId}-custom-wrapper`);
                if (wrap) wrap.classList.remove('show');
                const cfg = gridConfigMap[normalizedInputId];
                if (cfg) renderGrid(cfg.containerId, normalizedInputId, cfg.items, cfg.defaultVal);
            }

            showToast(t('toastOptionAdded'));
        }

        function handleCustomInputKeydown(event, inputId, groupId = '') {
            if (!event || event.key !== 'Enter' || !optionManageMode) return;
            event.preventDefault();
            addCustomOptionFromInput(inputId, groupId);
        }

        // Called when user types in DIY box: Syncs to the hidden input which Supabase uses
        function syncCustomValue(inputId, val, groupId = '') {
            const hiddenInput = document.getElementById(inputId);
            if (!hiddenInput) return;
            if (inputId === 'secondary_tag') {
                const normalizedGroup = normalizeSecondaryTagGroupId(groupId) || getFallbackSecondaryTagGroupId();
                activeSecondaryTagGroup = normalizedGroup;
                const groupInput = document.getElementById('secondary_tag_group');
                if (groupInput) groupInput.value = normalizedGroup;
                secondaryCustomOpenState[normalizedGroup] = true;
            }
            hiddenInput.value = val;
            manualOverride[inputId] = true;
        }

        function removeCustomOption(event, inputId, encodedValue, groupId = '') {
            if (event) event.stopPropagation();
            const val = decodeURIComponent(encodedValue || '');
            if (!val) return;

            const normalizedGroup = normalizeSecondaryTagGroupId(groupId) || activeSecondaryTagGroup;
            const memorySection = resolveInMemorySectionForInput(inputId, normalizedGroup);
            if (memorySection) removeOptionInMemory(memorySection, val);
            removeCustomOptionRemote(inputId, val, normalizedGroup);

            const hiddenInput = document.getElementById(inputId);
            const hiddenGroupInput = document.getElementById('secondary_tag_group');
            if (
                hiddenInput &&
                hiddenInput.value &&
                hiddenInput.value.toLowerCase() === val.toLowerCase() &&
                (inputId !== 'secondary_tag' || normalizeSecondaryTagGroupId(hiddenGroupInput && hiddenGroupInput.value) === normalizedGroup)
            ) {
                hiddenInput.value = '';
            }

            if (inputId === 'secondary_tag') {
                secondaryCustomOpenState[normalizedGroup] = false;
                renderSecondaryTagGroups();
                return;
            }

            const cfg = gridConfigMap[inputId];
            if (cfg) renderGrid(cfg.containerId, inputId, cfg.items, cfg.defaultVal);
        }

        // --- 3. History Logic (双链接) ---
        function saveToHistory(newUrl, originalUrl) {
            let currentHistory = getCookie("gas_url_list_v2");
            let list = currentHistory ? JSON.parse(currentHistory) : [];
            const timeLocale = currentLang === 'zh' ? 'zh-CN' : 'en-US';
            
            list.unshift({ 
                newUrl: newUrl, 
                originalUrl: originalUrl,
                time: new Date().toLocaleTimeString(timeLocale, { hour: '2-digit', minute: '2-digit' })
            });
            
            if(list.length > 10) list.pop();
            setCookie("gas_url_list_v2", JSON.stringify(list), 30);
            renderHistory();
        }

        function renderHistory() {
            const listEl = document.getElementById('history-list');
            const currentHistory = getCookie("gas_url_list_v2");
            
            if (!currentHistory) {
                listEl.innerHTML = `<div class="p-4 text-center text-xs text-gray-600 italic bg-gas-card rounded-lg border border-gas-border">${t('historyEmpty')}</div>`;
                return;
            }

            try {
                const list = JSON.parse(currentHistory);
                listEl.innerHTML = list.map(item => `
                    <div class="bg-gas-card border border-gas-border rounded-lg p-3 flex flex-col gap-2">
                        <div class="flex justify-between items-center border-b border-gray-800 pb-2">
                            <div class="flex items-center gap-2 overflow-hidden w-full">
                                <span class="bg-gas-green text-black text-[9px] font-bold px-1 rounded flex-shrink-0">GAS</span>
                                <a href="${item.newUrl}" target="_blank" class="text-sm font-bold text-white truncate flex-1 hover:text-gas-green">${item.newUrl}</a>
                            </div>
                        </div>
                        
                        <div class="flex justify-between items-center pt-1">
                             <div class="flex items-center gap-2 overflow-hidden w-full">
                                <span class="bg-gray-700 text-gray-300 text-[9px] font-bold px-1 rounded flex-shrink-0">SRC</span>
                                <a href="${item.originalUrl}" target="_blank" class="text-xs text-gray-500 truncate flex-1 hover:text-gray-300">${item.originalUrl}</a>
                            </div>
                        </div>
                    </div>
                `).join('');
            } catch (e) {
                console.error(e);
            }
        }

        function clearHistory() { setCookie("gas_url_list_v2", "", -1); renderHistory(); }
        function setCookie(n, v, d) { let e=""; if(d){const dt=new Date();dt.setTime(dt.getTime()+(d*24*60*60*1000));e="; expires="+dt.toUTCString();} document.cookie=n+"="+(v||"")+e+"; path=/"; }
        function getCookie(n) { const ne=n+"="; const ca=document.cookie.split(';'); for(let i=0;i<ca.length;i++){let c=ca[i];while(c.charAt(0)==' ')c=c.substring(1);if(c.indexOf(ne)==0)return c.substring(ne.length,c.length);}return null; }
        
        function showToast(msg) {
            const toast = document.getElementById('toast');
            document.getElementById('toast-msg').innerText = msg;
            toast.classList.remove('opacity-0', 'scale-90', 'pointer-events-none');
            setTimeout(() => toast.classList.add('opacity-0', 'scale-90', 'pointer-events-none'), 3000);
        }

        // --- Submit ---
        const form = document.getElementById('taskForm');
        const btn = document.getElementById('submitBtn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const originalText = btn.innerHTML;
            btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> ${t('statusSending')}`;
            btn.disabled = true;
            btn.style.opacity = '0.7';

            // Keep displayed tags aligned with remote option table before submit.
            await syncDisplayedOptionsToRemote(['tag', 'secondary_tag']);

            // Data Gathering
            const link = document.getElementById('link').value;
            const category = document.getElementById('category').value;
            const detectedPublisher = detectPublisherFromUrl(link);
            if (detectedPublisher) {
                document.getElementById('publisher').value = detectedPublisher;
            } else if (!document.getElementById('publisher').value) {
                document.getElementById('publisher').value = 'GasGx-Researcher';
            }
            const publisher = document.getElementById('publisher').value;
            const tag_choice = document.getElementById('tag').value;
            const secondary_tag = document.getElementById('secondary_tag').value;
            const secondary_tag_group = normalizeSecondaryTagGroupId(
                document.getElementById('secondary_tag_group').value
            ) || activeSecondaryTagGroup;
            const parsedUrl = parseUrlSafe(link);
            const source_host = parsedUrl ? (parsedUrl.hostname || '').toLowerCase().replace(/^www\./, '') : '';
            const source_path = parsedUrl ? (parsedUrl.pathname || '') : '';
            const submitted_at = new Date().toISOString();
            const params_snapshot = JSON.stringify({
                link,
                category,
                publisher,
                tag_choice,
                secondary_tag,
                secondary_tag_group,
                ui_lang: currentLang,
                submitted_at
            });

            const corePayload = {
                link,
                category,
                publisher,
                tag_choice,
                secondary_tag,
                status: 'pending'
            };

            // Preferred payload: keeps core fields + optional extended params if table already has these columns.
            const extendedPayload = {
                ...corePayload,
                source_host,
                source_path,
                ui_lang: currentLang,
                feeder_version: 'v23.0',
                submitted_at,
                params_snapshot
            };

            try {
                let data;
                let error;
                ({ data, error } = await client
                    .from('scrape_queue')
                    .insert([extendedPayload])
                    .select());

                // Fallback: keep compatibility with old table schema.
                if (error && isMissingColumnError(error)) {
                    ({ data, error } = await client
                        .from('scrape_queue')
                        .insert([corePayload])
                        .select());
                }

                if (error) throw error;

                if (data && data.length > 0) {
                    const newId = data[0].id;
                    const newUrl = `https://www.gasgx.com/news/article/${newId}`;
                    saveToHistory(newUrl, link);

                    // Persist DIY values only after successful submit
                    persistCustomValue('category', category);
                    persistCustomValue('publisher', publisher);
                    persistCustomValue('tag', tag_choice);
                    persistCustomValue('secondary_tag', secondary_tag, secondary_tag_group);
                    
                    showToast(`✅ ${t('toastPublishSuccess')}`);
                    
                    // Save last selections for faster next entry
                    saveLastSelections({ category, publisher, tag: tag_choice, secondary_tag, secondary_tag_group });
                    manualOverride.category = false;
                    manualOverride.publisher = false;
                    manualOverride.tag = false;
                    manualOverride.secondary_tag = false;

                    // Reset link only, keep selections
                    document.getElementById('link').value = '';
                    document.querySelectorAll('.custom-input-wrapper').forEach(wrapper => {
                        const inputEl = wrapper.querySelector('input');
                        if (!wrapper.classList.contains('show') && inputEl) inputEl.value = '';
                    });
                    
                    // Re-render grids to include any new custom options
                    Object.entries(gridConfigMap).forEach(([inputId, cfg]) => {
                        renderGrid(cfg.containerId, inputId, cfg.items, cfg.defaultVal);
                    });
                } else {
                    showToast(`⚠️ ${t('toastSubmittedNoId')}`);
                }
            } catch (err) {
                console.error(err);
                showToast(`❌ ${t('toastErrorPrefix')}${err.message}`);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        });

        // Init
        document.addEventListener('DOMContentLoaded', () => {
            loadLastSelections();
            applyI18n();

            // Do not block first paint on remote option fetch.
            setTimeout(async () => {
                await loadRemoteOptionConfig();
                applyI18n();
            }, 0);

            const linkInput = document.getElementById('link');
            if (linkInput) {
                linkInput.addEventListener('change', () => applyUrlHints(linkInput.value));
                linkInput.addEventListener('paste', () => setTimeout(() => applyUrlHints(linkInput.value), 0));
                linkInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const formEl = document.getElementById('taskForm');
                        if (formEl) formEl.requestSubmit();
                    }
                });
                linkInput.focus();
            }
        });

        // Capture bar sizing + compact mode while scrolling
        const captureBar = document.getElementById('captureBar');

        function updateCaptureHeight() {
            if (!captureBar) return;
            const height = captureBar.offsetHeight || 0;
            document.documentElement.style.setProperty('--capture-h', `${height}px`);
        }

        function setCompactMode(isCompact) {
            if (!captureBar) return;
            captureBar.classList.toggle('compact', isCompact);
            updateCaptureHeight();
        }

        updateCaptureHeight();
        window.addEventListener('resize', updateCaptureHeight);

        let lastCompact = false;
        window.addEventListener('scroll', () => {
            const currentY = window.scrollY || 0;
            const shouldCompact = currentY > 40;
            if (shouldCompact !== lastCompact) {
                setCompactMode(shouldCompact);
                lastCompact = shouldCompact;
            }
        }, { passive: true });
    
