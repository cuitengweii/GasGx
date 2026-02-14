// Supabase Init
        const SUPABASE_URL = "https://mkpcliytqudclkwtewru.supabase.co";
        const SUPABASE_KEY = "sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw"; 
        const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        const FEEDER_OPTIONS_TABLE = 'feeder_form_options';
        const REMOTE_OPTION_SECTIONS = ['category', 'publisher', 'tag', 'secondary_tag'];
        let remoteOptionsTableReady = false;

        const TEXT = {
            pageTitle: 'GasGx Mobile Feeder v23',
            secondaryTagCustomPlaceholder: 'Type custom Sec Tag...',
            deleteCachedOption: 'Delete cached option',
            addOptionNow: 'Add option',
            editOptionLabel: 'Edit option',
            manageOptions: 'Edit Options',
            manageOptionsDone: 'Done Editing',
            toastManageModeOn: 'Option edit mode ON',
            toastManageModeOff: 'Option edit mode OFF',
            renameOptionPrompt: 'Rename option',
            renameOptionInvalid: 'Option name cannot be empty',
            renameOptionFailed: 'Rename failed',
            toastErrorPrefix: 'Error: ',
            toastPasted: 'Content pasted',
            toastClipboardEmpty: 'Clipboard is empty',
            toastManualPaste: 'Please paste manually in input box',
            historyEmpty: 'No recent history',
            statusSending: 'Sending...',
            toastOptionRenamed: 'Option renamed',
            toastOptionAdded: 'Option added',
            toastOptionExists: 'Option already exists',
            addOptionFailed: 'Add option failed',
            toastPublishSuccess: 'Published successfully!',
            toastSubmittedNoId: 'Submitted, but no ID returned',
            toastAiNeedUrl: 'Please input URL first',
            toastAiInvalidUrl: 'Invalid URL',
            toastAiApplied: 'AI tags applied',
            toastAiSecondaryAdded: 'AI added new secondary tag',
            toastAiFailed: 'AI auto submit failed'
        };

        function t(key) {
            return TEXT[key] || key;
        }

        function getLocalizedLabel(label) {
            return normalizeValue(label);
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
            { id: 'gas-energy', label: 'Gas Energy' },
            { id: 'generators', label: 'Generators' },
            { id: 'bitcoin-mining', label: 'BTC Mining' },
            { id: 'flash', label: 'Flash' },
            { id: 'insights', label: 'Insights' },
            { id: 'data', label: 'Data' },
            { id: 'events', label: 'Events' },
            { id: 'custom', label: '+ DIY' }
        ];

        const publishers = [
            { id: 'GasGx-Researcher', label: 'GasGx' },
            { id: 'WuShuoBlock', label: 'WuShuo' },
            { id: 'Blockbeats', label: 'Blockbeats' },
            { id: 'Chaincatcher', label: 'ChainC.' },
            { id: 'Panewslab', label: 'Panews' },
            { id: 'Odaily', label: 'Odaily' },
            { id: 'Techflow', label: 'Techflow' },
            { id: 'Linkein', label: 'LinkedIn' },
            { id: 'custom', label: '+ DIY' }
        ];

        const mainTags = [
            { id: 'Hardware', label: 'Hardware' },
            { id: 'Policy', label: 'Policy' },
            { id: 'Finance', label: 'Finance' },
            { id: 'Tech', label: 'Tech' },
            { id: 'Market', label: 'Market' },
            { id: 'custom', label: '+ DIY' }
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
                        { id: 'custom', label: '+ DIY' }
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
        let aiQuickBusy = false;

        const AI_SECONDARY_TAG_MAX_LENGTH = 40;
        const AI_CATEGORY_RULES = {
            'bitcoin-mining': [
                'bitcoin', 'btc', 'mining', 'miner', 'hashrate', 'hash rate', 'asic', '挖矿', '矿机', '算力'
            ],
            'generators': [
                'generator', 'genset', 'gas engine', 'turbine', 'microgrid', 'power plant', '发电机', '机组', '燃机'
            ],
            'events': [
                'summit', 'conference', 'forum', 'expo', 'webinar', 'meetup', '活动', '大会', '峰会', '论坛'
            ],
            'data': [
                'dataset', 'dashboard', 'index', 'statistics', 'data', 'report', 'metric', '数据', '统计', '图表'
            ],
            'insights': [
                'insight', 'analysis', 'opinion', 'deep dive', 'research note', '观点', '解读', '深度', '研报'
            ],
            'flash': ['breaking', 'flash', 'quick update', 'just in', '快讯', '突发'],
            'gas-energy': [
                'natural gas', 'lng', 'pipeline', 'gas power', 'gas-to-power', 'flare gas', '天然气', '气电'
            ]
        };
        const AI_MAIN_TAG_RULES = {
            'Hardware': ['generator', 'genset', 'engine', 'turbine', 'rig', 'asic', '矿机', '设备', '机组'],
            'Policy': ['policy', 'regulation', 'permit', 'approval', 'bill', 'law', 'government', '监管', '政策', '法案'],
            'Finance': ['funding', 'investment', 'financing', 'revenue', 'profit', 'valuation', '融资', '投资', '营收'],
            'Tech': ['technology', 'platform', 'software', 'ai', 'algorithm', 'optimization', '技术', '系统', '算法'],
            'Market': ['market', 'price', 'demand', 'supply', 'trading', 'trend', '市场', '价格', '需求']
        };
        const AI_SECONDARY_RULES = {
            'gas-energy': [
                ['LNG', ['lng', '液化天然气']],
                ['Pipeline', ['pipeline', '管道']],
                ['Gas-to-Power', ['gas-to-power', 'gas power', '气电']],
                ['Flare Gas', ['flare gas', 'flaring', '放空气', '火炬气']],
                ['Gas Price', ['gas price', 'henry hub', '天然气价格']]
            ],
            'generators': [
                ['Genset', ['genset', '发电机组', '发电机']],
                ['Gas Turbine', ['gas turbine', '燃气轮机']],
                ['Reciprocating Engine', ['reciprocating', '往复式发动机']],
                ['Microgrid', ['microgrid', '微电网']],
                ['Power Plant', ['power plant', '电厂']]
            ],
            'bitcoin-mining': [
                ['ASIC', ['asic', '矿机']],
                ['Hashrate', ['hashrate', 'hash rate', '算力']],
                ['Off-grid Mining', ['off-grid', '离网']],
                ['Gas-to-Power Mining', ['gas-to-power', 'flare gas', '天然气发电挖矿']],
                ['Mining Policy', ['mining policy', 'mining ban', '矿业监管', '挖矿政策']]
            ],
            'flash': [
                ['Breaking News', ['breaking', 'flash', '快讯', '突发']]
            ],
            'insights': [
                ['Industry Analysis', ['analysis', 'insight', 'research', '深度', '解读']],
                ['Interview', ['interview', '访谈']]
            ],
            'data': [
                ['Dataset', ['dataset', '数据集']],
                ['Dashboard', ['dashboard', '看板']],
                ['Price Index', ['index', '价格指数']],
                ['Metrics', ['metric', '统计', '指标']]
            ],
            'events': [
                ['Conference', ['conference', '大会', '峰会']],
                ['Webinar', ['webinar', '线上研讨会']],
                ['Forum', ['forum', '论坛']]
            ]
        };
        const AI_DEFAULT_SECONDARY_BY_CATEGORY = {
            'gas-energy': 'Gas-to-Power',
            'generators': 'Genset',
            'bitcoin-mining': 'ASIC',
            'flash': 'Breaking News',
            'insights': 'Industry Analysis',
            'data': 'Metrics',
            'events': 'Conference'
        };
        const AI_CATEGORY_MAIN_BOOST = {
            'gas-energy': 'Tech',
            'generators': 'Hardware',
            'bitcoin-mining': 'Hardware',
            'flash': 'Market',
            'insights': 'Tech',
            'data': 'Market',
            'events': 'Market'
        };
        const AI_CATEGORY_PICK_ORDER = [
            'bitcoin-mining',
            'generators',
            'events',
            'data',
            'insights',
            'flash',
            'gas-energy'
        ];
        const AI_MAIN_TAG_PICK_ORDER = ['Hardware', 'Policy', 'Finance', 'Tech', 'Market'];
        const AI_EN_STOPWORDS = new Set([
            'the', 'and', 'for', 'with', 'from', 'this', 'that', 'into', 'over', 'about', 'news', 'post', 'update', 'daily'
        ]);
        const AI_ZH_STOPWORDS = new Set([
            '天然气', '行业', '市场', '今日', '最新', '新闻', '报道', '分析'
        ]);
        const AI_GENERIC_SECONDARY_BLOCKLIST = new Set([
            'gas', 'energy', 'market', 'news', 'flash', 'data', 'report', 'analysis', 'insight', 'event',
            'article', 'post', 'source', 'default', 'general', 'industry', 'natural', 'mining', 'bitcoin',
            'x', 'twitter', 'linkedin'
        ]);

        function renderStaticUi() {
            document.documentElement.lang = 'en';
            document.title = t('pageTitle');

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
            dedup.push({ id: 'custom', label: '+ DIY' });
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
                        label: normalizeValue(row.label_en) || optionId
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
                            label: normalizeValue(row.label_en) || decodedLegacy.optionId || optionId
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

        function upsertOptionInMemory(section, optionId, label = optionId) {
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
                    label: normalizeValue(label) || val
                };
                return;
            }

            const customIndex = targetItems.findIndex(item => normalizeValue(item && item.id).toLowerCase() === 'custom');
            const newItem = {
                id: val,
                label: normalizeValue(label) || val
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
                        label: nextVal
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

        function normalizeAiKey(value) {
            return normalizeValue(value).toLowerCase();
        }

        function containsCjk(value) {
            return /[\u4e00-\u9fff]/.test(value || '');
        }

        function escapeRegex(value) {
            return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        function keywordHit(textLower, keyword) {
            const kw = normalizeAiKey(keyword);
            if (!kw) return false;
            if (containsCjk(kw)) return textLower.includes(kw);
            const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(kw)}([^a-z0-9]|$)`);
            return pattern.test(textLower);
        }

        function scoreWithKeywords(textLower, keywords = []) {
            let score = 0;
            (keywords || []).forEach((keyword) => {
                if (keywordHit(textLower, keyword)) score += 1;
            });
            return score;
        }

        function scoreMap(textLower, mapping = {}) {
            const scores = {};
            Object.entries(mapping || {}).forEach(([label, keywords]) => {
                scores[label] = scoreWithKeywords(textLower, keywords || []);
            });
            return scores;
        }

        function pickBestScore(scores, orderedCandidates = [], fallback = '') {
            let best = fallback;
            let bestScore = -1;
            (orderedCandidates || []).forEach((candidate) => {
                const score = Number(scores && scores[candidate]) || 0;
                if (score > bestScore) {
                    best = candidate;
                    bestScore = score;
                }
            });
            if (bestScore <= 0) return fallback;
            return best;
        }

        function formatSecondaryTag(value, maxLen = AI_SECONDARY_TAG_MAX_LENGTH) {
            let cleaned = normalizeValue(String(value || '').replace(/[\r\n\t]+/g, ' '));
            cleaned = cleaned.replace(/^[ _\-.;:|/\\]+|[ _\-.;:|/\\]+$/g, '');
            if (!cleaned) return '';
            if (cleaned.length > maxLen) {
                cleaned = cleaned.slice(0, maxLen).replace(/[ _\-.;:|/\\]+$/g, '');
            }
            return cleaned;
        }

        function safeDecodeURIComponent(value) {
            try {
                return decodeURIComponent(value);
            } catch (e) {
                return value;
            }
        }

        function getAvailableOptionValues(inputId, groupId = '') {
            return mergeOptions(getOptionItemsByInput(inputId, groupId))
                .map((item) => normalizeValue(item && item.id))
                .filter((id) => id && id.toLowerCase() !== 'custom');
        }

        function findCaseInsensitiveMatch(values = [], candidate = '') {
            const targetKey = normalizeAiKey(candidate);
            if (!targetKey) return '';
            return (values || []).find((value) => normalizeAiKey(value) === targetKey) || '';
        }

        async function fetchTextWithTimeout(url, timeoutMs = 12000) {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeoutMs);
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    signal: controller.signal,
                    cache: 'no-store',
                    headers: {
                        'Accept': 'text/html,text/plain,application/json;q=0.9,*/*;q=0.8'
                    }
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.text();
            } finally {
                clearTimeout(timer);
            }
        }

        function buildAllOriginsUrl(targetUrl) {
            return `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
        }

        function buildJinaReaderUrl(targetUrl) {
            const parsed = parseUrlSafe(targetUrl);
            if (!parsed) return '';
            const body = `${parsed.host}${parsed.pathname || ''}${parsed.search || ''}`;
            return `https://r.jina.ai/http://${body}`;
        }

        function deriveTitleFromPath(targetUrl) {
            const parsed = parseUrlSafe(targetUrl);
            if (!parsed) return '';
            const pathTokens = (parsed.pathname || '')
                .split('/')
                .map((segment) => normalizeValue(safeDecodeURIComponent(segment)))
                .filter(Boolean)
                .map((segment) => segment.replace(/[-_]+/g, ' '));
            if (!pathTokens.length) return '';
            return pathTokens[pathTokens.length - 1];
        }

        function toTitleCaseWords(value) {
            return normalizeValue(value)
                .split(' ')
                .filter(Boolean)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                .join(' ');
        }

        function normalizeAuthorCandidate(value) {
            let text = normalizeValue(safeDecodeURIComponent(value || ''));
            if (!text) return '';
            text = text
                .replace(/^[\s"'`([{<]+|[\s"'`)\]}>]+$/g, '')
                .replace(/\s+/g, ' ')
                .replace(/\b(?:posted by|author|by)\s*[:\-]\s*/i, '')
                .replace(/\s*\(@[A-Za-z0-9_]{1,30}\)\s*$/, '')
                .replace(/\s+on\s+(?:x|twitter|linkedin)\b.*$/i, '')
                .replace(/\s*[|/]\s*(?:x|twitter|linkedin)\b.*$/i, '')
                .replace(/^\s*(?:on\s+)?(?:x|twitter|linkedin)\s*[:\-]\s*/i, '')
                .trim();
            if (!text) return '';

            const lowered = text.toLowerCase();
            if (AI_GENERIC_SECONDARY_BLOCKLIST.has(lowered)) return '';
            if (text.length > AI_SECONDARY_TAG_MAX_LENGTH) text = text.slice(0, AI_SECONDARY_TAG_MAX_LENGTH).trim();
            if (text.length < 2) return '';
            if (/^\d+$/.test(text)) return '';

            return formatSecondaryTag(text);
        }

        function humanizeSlug(slug) {
            const cleaned = normalizeValue(String(slug || ''))
                .replace(/[-_]+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            if (!cleaned) return '';
            if (/^[A-Z0-9@_.-]+$/.test(cleaned)) return cleaned;
            if (/^[a-z0-9 ]+$/.test(cleaned)) return toTitleCaseWords(cleaned);
            return cleaned;
        }

        function isReservedXSegment(value) {
            const key = normalizeAiKey(value);
            if (!key) return true;
            const reserved = new Set([
                'i', 'home', 'explore', 'notifications', 'messages', 'settings', 'compose', 'search',
                'intent', 'login', 'signup', 'share', 'hashtag'
            ]);
            return reserved.has(key);
        }

        function extractAuthorFromUrl(targetUrl) {
            const parsed = parseUrlSafe(targetUrl);
            if (!parsed) return '';
            const host = (parsed.hostname || '').toLowerCase().replace(/^www\./, '');
            const segments = (parsed.pathname || '')
                .split('/')
                .map((seg) => normalizeValue(safeDecodeURIComponent(seg)))
                .filter(Boolean);
            if (!segments.length) return '';

            const isHost = (domain) => host === domain || host.endsWith(`.${domain}`);

            if (isHost('x.com') || isHost('twitter.com')) {
                const account = segments[0];
                if (account && !isReservedXSegment(account)) {
                    return normalizeAuthorCandidate(`@${account}`);
                }
                return '';
            }

            if (isHost('linkedin.com')) {
                if ((segments[0] === 'in' || segments[0] === 'company') && segments[1]) {
                    return normalizeAuthorCandidate(humanizeSlug(segments[1]));
                }
                if (segments[0] === 'posts' && segments[1]) {
                    const authorSlug = normalizeValue(segments[1]).split('_')[0];
                    if (authorSlug) return normalizeAuthorCandidate(humanizeSlug(authorSlug));
                }
                if (segments[0] === 'feed' && segments[1] === 'update') return '';
            }

            if (segments[0] && segments[0].startsWith('@')) {
                return normalizeAuthorCandidate(segments[0]);
            }

            return '';
        }

        function extractAuthorFromTitleOrSnippet(title, snippet) {
            const titleText = normalizeValue(title || '');
            const snippetText = normalizeValue(snippet || '');

            const applyPatterns = (sourceText) => {
                if (!sourceText) return '';
                const patterns = [
                    /^(.{2,60}?)\s+on\s+(?:X|Twitter|LinkedIn)\b/i,
                    /^(.{2,60}?)\s*[|/]\s*(?:X|Twitter|LinkedIn)\b/i,
                    /^(.{2,60}?)\s*[:：]\s*["“]/i,
                    /\bposted by\s+(.{2,60}?)(?:$|[|,.;])/i,
                    /\bauthor\s*[:\-]\s*(.{2,60}?)(?:$|[|,.;])/i,
                    /\bby\s+(.{2,60}?)(?:$|[|,.;])/i
                ];
                for (const pattern of patterns) {
                    const match = sourceText.match(pattern);
                    if (!match || !match[1]) continue;
                    const candidate = normalizeAuthorCandidate(match[1]);
                    if (candidate) return candidate;
                }
                return '';
            };

            let candidate = applyPatterns(titleText);
            if (candidate) return candidate;
            candidate = applyPatterns(snippetText);
            if (candidate) return candidate;

            const mentionMatch = (titleText || snippetText).match(/@([A-Za-z0-9_]{2,30})/);
            if (mentionMatch && mentionMatch[1]) {
                return normalizeAuthorCandidate(`@${mentionMatch[1]}`);
            }
            return '';
        }

        function extractAuthorCandidate(context = {}) {
            const byTitle = extractAuthorFromTitleOrSnippet(context.title || '', context.snippet || '');
            if (byTitle) return byTitle;

            const byUrl = extractAuthorFromUrl(context.url || '');
            if (byUrl) return byUrl;

            return '';
        }

        function extractContentFromHtml(rawHtml) {
            if (!rawHtml) return { title: '', snippet: '', body: '' };
            let title = '';
            let snippet = '';
            let body = '';
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(rawHtml, 'text/html');
                const getMeta = (selector) => {
                    const el = doc.querySelector(selector);
                    return normalizeValue(el && el.getAttribute('content'));
                };
                title = normalizeValue(
                    getMeta('meta[property="og:title"]') ||
                    getMeta('meta[name="twitter:title"]') ||
                    (doc.title || '')
                );
                snippet = normalizeValue(
                    getMeta('meta[property="og:description"]') ||
                    getMeta('meta[name="description"]') ||
                    getMeta('meta[name="twitter:description"]')
                );
                const bodyNode = doc.body || doc.documentElement;
                body = normalizeValue(bodyNode ? (bodyNode.innerText || bodyNode.textContent || '') : '');
            } catch (e) {
                body = normalizeValue(String(rawHtml).replace(/<[^>]+>/g, ' '));
            }
            return { title, snippet, body };
        }

        function extractFromJinaReader(rawText) {
            const text = String(rawText || '');
            const titleMatch = text.match(/^\s*Title:\s*(.+)$/mi);
            const title = normalizeValue(titleMatch && titleMatch[1]);
            const contentParts = text.split('Markdown Content:');
            const markdown = normalizeValue(contentParts.length > 1 ? contentParts.slice(1).join('Markdown Content:') : text);
            const snippet = normalizeValue(markdown.slice(0, 3200));
            return { title, snippet, body: markdown };
        }

        function isLikelyUsefulText(value) {
            const text = normalizeValue(value);
            if (!text) return false;
            if (text.length < 80) return false;
            const lower = text.toLowerCase();
            if (lower.includes('enable javascript') && lower.length < 500) return false;
            return true;
        }

        async function loadAiSourceContext(targetUrl) {
            const parsed = parseUrlSafe(targetUrl);
            if (!parsed) throw new Error(t('toastAiInvalidUrl'));
            const normalizedUrl = parsed.href;
            const sourceHost = (parsed.hostname || '').toLowerCase().replace(/^www\./, '');
            const sourcePath = parsed.pathname || '';

            let title = '';
            let snippet = '';
            let body = '';
            let source = 'url-only';

            try {
                const rawHtml = await fetchTextWithTimeout(buildAllOriginsUrl(normalizedUrl), 12000);
                const extracted = extractContentFromHtml(rawHtml);
                title = extracted.title;
                snippet = extracted.snippet;
                body = extracted.body;
                source = 'allorigins';
            } catch (e) {
                console.warn('AI context allorigins fetch failed:', e);
            }

            const initialText = normalizeValue([title, snippet, body].join(' '));
            if (!isLikelyUsefulText(initialText)) {
                const readerUrl = buildJinaReaderUrl(normalizedUrl);
                if (readerUrl) {
                    try {
                        const readerText = await fetchTextWithTimeout(buildAllOriginsUrl(readerUrl), 12000);
                        const extractedReader = extractFromJinaReader(readerText);
                        title = title || extractedReader.title;
                        snippet = snippet || extractedReader.snippet;
                        body = normalizeValue([body, extractedReader.body].join(' '));
                        source = source === 'url-only' ? 'jina-via-allorigins' : `${source}+jina`;
                    } catch (e) {
                        console.warn('AI context jina fetch failed:', e);
                    }
                }
            }

            if (!title) title = deriveTitleFromPath(normalizedUrl);
            const combinedText = normalizeValue([
                title,
                snippet,
                body.slice(0, 12000),
                sourceHost,
                sourcePath.replace(/[-_/]+/g, ' ')
            ].join(' '));

            return {
                url: normalizedUrl,
                sourceHost,
                sourcePath,
                title,
                snippet,
                text: combinedText,
                source
            };
        }

        function chooseCategoryByRules(textLower) {
            const available = getAvailableOptionValues('category');
            const byKey = new Map(available.map((value) => [normalizeAiKey(value), value]));
            const scores = scoreMap(textLower, AI_CATEGORY_RULES);
            const ordered = AI_CATEGORY_PICK_ORDER.filter((candidate) => byKey.has(candidate));
            const bestKey = pickBestScore(scores, ordered, '');

            if (bestKey && byKey.has(bestKey)) {
                return { value: byKey.get(bestKey), scores };
            }

            const current = normalizeSecondaryTagGroupId(document.getElementById('category') && document.getElementById('category').value);
            if (current && byKey.has(current)) return { value: byKey.get(current), scores };
            if (byKey.has('gas-energy')) return { value: byKey.get('gas-energy'), scores };
            return { value: available[0] || 'gas-energy', scores };
        }

        function chooseMainTagByRules(textLower, categoryId) {
            const available = getAvailableOptionValues('tag');
            const byKey = new Map(available.map((value) => [normalizeAiKey(value), value]));
            const scores = scoreMap(textLower, AI_MAIN_TAG_RULES);
            const boosted = AI_CATEGORY_MAIN_BOOST[normalizeAiKey(categoryId)];
            if (boosted) scores[boosted] = (Number(scores[boosted]) || 0) + 1;

            const ordered = AI_MAIN_TAG_PICK_ORDER.filter((candidate) => byKey.has(normalizeAiKey(candidate)));
            const best = pickBestScore(scores, ordered, '');
            const bestKey = normalizeAiKey(best);
            if (best && byKey.has(bestKey)) return { value: byKey.get(bestKey), scores };

            const currentTag = normalizeValue(document.getElementById('tag') && document.getElementById('tag').value);
            const currentKey = normalizeAiKey(currentTag);
            if (currentTag && byKey.has(currentKey)) return { value: byKey.get(currentKey), scores };
            return { value: available[0] || 'Hardware', scores };
        }

        function isStrictSecondaryTagCandidate(candidate, categoryId, mainTag) {
            const formatted = formatSecondaryTag(candidate);
            const key = normalizeAiKey(formatted);
            if (!formatted || !key) return false;
            if (key.length < 2 || key.length > AI_SECONDARY_TAG_MAX_LENGTH) return false;
            if (/^\d+$/.test(key)) return false;
            if (key.includes('http') || key.includes('www')) return false;
            if (AI_EN_STOPWORDS.has(key) || AI_ZH_STOPWORDS.has(key)) return false;
            if (AI_GENERIC_SECONDARY_BLOCKLIST.has(key)) return false;
            if (key === normalizeAiKey(categoryId)) return false;
            if (key === normalizeAiKey(mainTag)) return false;
            return true;
        }

        function pickDefaultSecondaryTag(categoryId, existingTags = []) {
            const fallbackName = AI_DEFAULT_SECONDARY_BY_CATEGORY[normalizeAiKey(categoryId)];
            const matched = findCaseInsensitiveMatch(existingTags, fallbackName);
            if (matched) return matched;
            return normalizeValue(existingTags[0] || '');
        }

        function countKeywordFrequency(textLower, keyword) {
            const key = normalizeAiKey(keyword);
            if (!key) return 0;
            if (containsCjk(key)) {
                let count = 0;
                let index = textLower.indexOf(key);
                while (index !== -1) {
                    count += 1;
                    index = textLower.indexOf(key, index + key.length);
                }
                return count;
            }
            const regex = new RegExp(`(^|[^a-z0-9])${escapeRegex(key)}([^a-z0-9]|$)`, 'g');
            let count = 0;
            while (regex.exec(textLower) !== null) count += 1;
            return count;
        }

        function collectDynamicSecondaryCandidates(context = {}, blockedKeys = new Set()) {
            const fullText = normalizeValue([
                context.title || '',
                context.snippet || '',
                context.body || '',
                context.url || ''
            ].join(' '));
            const titleText = normalizeValue(context.title || '');
            const candidates = [];
            const seen = new Set();

            const pushCandidate = (rawValue, confidence, source) => {
                const formatted = formatSecondaryTag(rawValue);
                const key = normalizeAiKey(formatted);
                if (!formatted || !key || seen.has(key)) return;
                if (blockedKeys.has(key)) return;
                if (AI_EN_STOPWORDS.has(key) || AI_ZH_STOPWORDS.has(key)) return;
                if (AI_GENERIC_SECONDARY_BLOCKLIST.has(key)) return;
                candidates.push({ value: formatted, confidence, source });
                seen.add(key);
            };

            let match;
            const hashtagRegex = /#([A-Za-z][A-Za-z0-9_+\-/]{1,30}|[\u4e00-\u9fff]{2,10})/g;
            while ((match = hashtagRegex.exec(fullText)) !== null) {
                pushCandidate(match[1], 4, 'hashtag');
            }

            const mentionRegex = /@([A-Za-z][A-Za-z0-9_]{1,30})/g;
            while ((match = mentionRegex.exec(fullText)) !== null) {
                pushCandidate(`@${match[1]}`, 4, 'mention');
            }

            const acronymRegex = /\b[A-Z]{2,10}\b/g;
            while ((match = acronymRegex.exec(titleText || fullText)) !== null) {
                pushCandidate(match[0], 3, 'acronym');
            }

            const nameRegex = /\b[A-Za-z][A-Za-z0-9+\-/]{2,30}\b/g;
            while ((match = nameRegex.exec(titleText)) !== null) {
                const token = match[0];
                const normalized = normalizeAiKey(token);
                if (AI_EN_STOPWORDS.has(normalized)) continue;
                pushCandidate(token, 2, 'title-token');
            }

            const parsed = parseUrlSafe(context.url || '');
            if (parsed) {
                const pathTokens = (parsed.pathname || '')
                    .split('/')
                    .map((token) => safeDecodeURIComponent(token))
                    .flatMap((token) => token.split(/[_-]+/))
                    .map((token) => normalizeValue(token))
                    .filter((token) => token.length >= 3 && !/^\d+$/.test(token));
                pathTokens.forEach((token) => {
                    pushCandidate(token, 2, 'path-token');
                });
            }

            return candidates;
        }

        function chooseSecondaryTagByRules(categoryId, mainTag, textLower, context = {}) {
            const normalizedCategory = normalizeSecondaryTagGroupId(categoryId) || normalizeAiKey(categoryId);
            const existingTags = getAvailableOptionValues('secondary_tag', normalizedCategory);
            const existingByKey = new Map(existingTags.map((tag) => [normalizeAiKey(tag), tag]));
            const authorCandidate = extractAuthorCandidate(context);

            if (authorCandidate && isStrictSecondaryTagCandidate(authorCandidate, categoryId, mainTag)) {
                const existingAuthor = existingByKey.get(normalizeAiKey(authorCandidate));
                if (existingAuthor) {
                    return { value: existingAuthor, add: false, scores: {}, reason: 'author-existing' };
                }
                return { value: authorCandidate, add: true, scores: {}, reason: 'author-priority' };
            }

            const secondaryRules = AI_SECONDARY_RULES[normalizedCategory] || [];
            const scoredCandidates = {};
            secondaryRules.forEach(([tagName, keywords]) => {
                const score = scoreWithKeywords(textLower, keywords || []);
                if (score > 0) scoredCandidates[tagName] = score;
            });
            existingTags.forEach((tag) => {
                if (scoredCandidates[tag]) return;
                if (keywordHit(textLower, tag)) scoredCandidates[tag] = 1;
            });

            const ordered = [...existingTags, ...Object.keys(scoredCandidates)];
            const bestCandidate = pickBestScore(scoredCandidates, ordered, '');
            if (bestCandidate) {
                const existing = existingByKey.get(normalizeAiKey(bestCandidate));
                if (existing) {
                    return { value: existing, add: false, scores: scoredCandidates, reason: 'existing-score' };
                }
                const score = Number(scoredCandidates[bestCandidate]) || 0;
                const formattedBest = formatSecondaryTag(bestCandidate);
                if (score >= 2 && isStrictSecondaryTagCandidate(formattedBest, categoryId, mainTag)) {
                    return { value: formattedBest, add: true, scores: scoredCandidates, reason: 'rule-high-score' };
                }
            }

            const blockedKeys = new Set([
                normalizeAiKey(categoryId),
                normalizeAiKey(mainTag),
                ...AI_MAIN_TAG_PICK_ORDER.map((tag) => normalizeAiKey(tag)),
                ...AI_CATEGORY_PICK_ORDER.map((tag) => normalizeAiKey(tag))
            ]);
            const dynamicCandidates = collectDynamicSecondaryCandidates(context, blockedKeys);
            for (const candidate of dynamicCandidates) {
                const existing = existingByKey.get(normalizeAiKey(candidate.value));
                if (existing) {
                    return { value: existing, add: false, scores: scoredCandidates, reason: `existing-${candidate.source}` };
                }
                if (!isStrictSecondaryTagCandidate(candidate.value, categoryId, mainTag)) continue;
                const frequency = countKeywordFrequency(textLower, candidate.value);
                if (
                    candidate.confidence >= 4 ||
                    (candidate.confidence >= 3 && frequency >= 1) ||
                    (candidate.confidence >= 2 && frequency >= 2)
                ) {
                    return { value: candidate.value, add: true, scores: scoredCandidates, reason: candidate.source };
                }
            }

            const fallback = pickDefaultSecondaryTag(categoryId, existingTags);
            return { value: fallback, add: false, scores: scoredCandidates, reason: 'default' };
        }

        async function ensureSecondaryTagOption(tagValue, groupId) {
            const normalizedGroup = normalizeSecondaryTagGroupId(groupId) || getFallbackSecondaryTagGroupId();
            const formatted = formatSecondaryTag(tagValue);
            if (!normalizedGroup || !formatted) return '';
            const existing = findCaseInsensitiveMatch(getAvailableOptionValues('secondary_tag', normalizedGroup), formatted);
            if (existing) return existing;

            const section = resolveInMemorySectionForInput('secondary_tag', normalizedGroup);
            if (section) upsertOptionInMemory(section, formatted, formatted);
            if (remoteOptionsTableReady) {
                await saveCustomOptionRemote('secondary_tag', formatted, normalizedGroup);
            }
            return formatted;
        }

        function applySecondaryTagSelection(tagValue, groupId) {
            const normalizedGroup = normalizeSecondaryTagGroupId(groupId) || getFallbackSecondaryTagGroupId();
            const hiddenInput = document.getElementById('secondary_tag');
            const groupInput = document.getElementById('secondary_tag_group');
            if (!hiddenInput || !normalizedGroup) return;

            activeSecondaryTagGroup = normalizedGroup;
            if (groupInput) groupInput.value = normalizedGroup;
            hiddenInput.value = normalizeValue(tagValue);
            manualOverride.secondary_tag = false;
            renderSecondaryTagGroups();
        }

        async function analyzeAndApplyAiSuggestions(rawUrl) {
            const parsed = parseUrlSafe(rawUrl);
            if (!parsed) throw new Error(t('toastAiInvalidUrl'));

            const normalizedUrl = parsed.href;
            const linkInput = document.getElementById('link');
            if (linkInput) linkInput.value = normalizedUrl;

            manualOverride.publisher = false;
            applyUrlHints(normalizedUrl);

            const context = await loadAiSourceContext(normalizedUrl);
            const textLower = normalizeAiKey(context.text || normalizedUrl);

            const categoryResult = chooseCategoryByRules(textLower);
            const categoryValue = normalizeValue(categoryResult.value);
            applySelection('category', categoryValue, true);
            manualOverride.category = false;

            const mainTagResult = chooseMainTagByRules(textLower, categoryValue);
            const mainTagValue = normalizeValue(mainTagResult.value);
            applySelection('tag', mainTagValue, true);
            manualOverride.tag = false;

            const secondaryResult = chooseSecondaryTagByRules(
                categoryValue,
                mainTagValue,
                textLower,
                {
                    title: context.title,
                    snippet: context.snippet,
                    body: context.text,
                    url: normalizedUrl
                }
            );
            let secondaryValue = formatSecondaryTag(secondaryResult.value);
            let secondaryAdded = false;
            if (secondaryValue && secondaryResult.add) {
                secondaryValue = await ensureSecondaryTagOption(secondaryValue, categoryValue);
                secondaryAdded = true;
            }
            applySecondaryTagSelection(secondaryValue, categoryValue);

            return {
                category: categoryValue,
                mainTag: mainTagValue,
                secondaryTag: secondaryValue,
                secondaryAdded,
                source: context.source
            };
        }

        function setAiQuickButtonState(isBusy) {
            const aiBtn = document.getElementById('aiQuickSubmitBtn');
            if (!aiBtn) return;
            if (!isBusy && btn && btn.disabled) return;
            if (isBusy) {
                if (!aiBtn.dataset.originalHtml) aiBtn.dataset.originalHtml = aiBtn.innerHTML;
                aiBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-base"></i>';
                aiBtn.disabled = true;
                aiBtn.style.opacity = '0.7';
                aiBtn.style.pointerEvents = 'none';
                return;
            }
            aiBtn.innerHTML = aiBtn.dataset.originalHtml || '<i class="fa-solid fa-paper-plane text-base"></i>';
            aiBtn.disabled = false;
            aiBtn.style.opacity = '1';
            aiBtn.style.pointerEvents = '';
        }

        async function handleAiQuickSubmit() {
            if (aiQuickBusy) return;
            const linkInput = document.getElementById('link');
            const rawUrl = normalizeValue(linkInput && linkInput.value);
            if (!rawUrl) {
                showToast(`⚠️ ${t('toastAiNeedUrl')}`);
                if (linkInput) linkInput.focus();
                return;
            }
            if (!parseUrlSafe(rawUrl)) {
                showToast(`⚠️ ${t('toastAiInvalidUrl')}`);
                if (linkInput) linkInput.focus();
                return;
            }

            aiQuickBusy = true;
            setAiQuickButtonState(true);
            try {
                const result = await analyzeAndApplyAiSuggestions(rawUrl);
                const summaryPrefix = result.secondaryAdded ? t('toastAiSecondaryAdded') : t('toastAiApplied');
                showToast(`🤖 ${summaryPrefix}: ${result.category} / ${result.mainTag} / ${result.secondaryTag || '-'}`);
                const formEl = document.getElementById('taskForm');
                if (formEl) formEl.requestSubmit();
            } catch (err) {
                console.error(err);
                const errMsg = normalizeValue(err && err.message);
                showToast(`❌ ${t('toastAiFailed')}${errMsg ? ` (${errMsg})` : ''}`);
            } finally {
                aiQuickBusy = false;
                setAiQuickButtonState(false);
            }
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
                const labelEn = normalizeValue(rawLabel) || optionId;
                const remoteOptionId = toRemoteOptionId(inputId, optionId, groupId);

                payload.push({
                    section,
                    option_id: remoteOptionId,
                    label_en: labelEn,
                    label_zh: labelEn,
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

        // --- 1. Paste logic ---
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

        // --- 3. History ---
        function saveToHistory(newUrl, originalUrl) {
            let currentHistory = getCookie("gas_url_list_v2");
            let list = currentHistory ? JSON.parse(currentHistory) : [];
            const timeLocale = 'en-US';
            
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

        function markAppReady() {
            if (document.body) document.body.classList.remove('app-loading');
        }

        // Fallback: always reveal app once page load completes.
        window.addEventListener('load', markAppReady);

        // --- Submit ---
        const form = document.getElementById('taskForm');
        const btn = document.getElementById('submitBtn');
        const aiQuickBtn = document.getElementById('aiQuickSubmitBtn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const originalText = btn.innerHTML;
            btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> ${t('statusSending')}`;
            btn.disabled = true;
            btn.style.opacity = '0.7';
            if (aiQuickBtn) {
                aiQuickBtn.disabled = true;
                aiQuickBtn.style.opacity = '0.7';
                aiQuickBtn.style.pointerEvents = 'none';
            }

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
                ui_lang: 'en',
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
                ui_lang: 'en',
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
                if (aiQuickBtn && !aiQuickBusy) {
                    setAiQuickButtonState(false);
                }
            }
        });

        // Init
        document.addEventListener('DOMContentLoaded', () => {
            try {
                loadLastSelections();
                renderStaticUi();
                markAppReady();

                // Do not block first paint on remote option fetch.
                setTimeout(async () => {
                    await loadRemoteOptionConfig();
                    renderStaticUi();
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
                if (aiQuickBtn && !aiQuickBtn.dataset.originalHtml) {
                    aiQuickBtn.dataset.originalHtml = aiQuickBtn.innerHTML;
                }
            } finally {
                markAppReady();
            }
        });

        // Capture bar compact mode while scrolling
        const captureBar = document.getElementById('captureBar');

        function setCompactMode(isCompact) {
            if (!captureBar) return;
            captureBar.classList.toggle('compact', isCompact);
        }

        let lastCompact = false;
        window.addEventListener('scroll', () => {
            const currentY = window.scrollY || 0;
            const shouldCompact = currentY > 40;
            if (shouldCompact !== lastCompact) {
                setCompactMode(shouldCompact);
                lastCompact = shouldCompact;
            }
        }, { passive: true });
    
