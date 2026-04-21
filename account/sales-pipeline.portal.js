(function (window, document) {
    'use strict';

    function normalizeLang(langCandidate) {
        return String(langCandidate || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
    }

    function currentLang() {
        try {
            const stored = window.localStorage.getItem('gasgx-lang') || window.localStorage.getItem('gas_lang');
            if (stored) return normalizeLang(stored);
        } catch (_error) {
            // Ignore storage failures.
        }
        return normalizeLang(document.documentElement.getAttribute('lang') || 'en');
    }

    const COPY = {
        en: {
            sales_pipeline: 'Sales Pipeline',
            noDeals: 'No sales deal is linked to this account yet.',
            noSummary: 'No summary yet.',
            loadingPipeline: 'Loading sales pipeline...',
            unmatchedHint: 'Your account is not linked to a customer deal yet. Please contact sales to bind your customer email.',
            listTitle: 'Deal List',
            listCountSuffix: '',
            listExpand: 'Show all deals',
            listCollapse: 'Collapse list',
            timelineTitle: 'Sales Timeline',
            timelineExpand: 'Show timeline',
            timelineCollapse: 'Hide timeline',
            dealUntitled: 'Untitled Deal',
            dealSummary: 'Customer confirmations are handled in this user portal.',
            stageReadonly: 'This is a read-only stage. No customer action is required.',
            stageRequirementLinkTitle: 'Requirement Link',
            stageRequirementLinkHint: 'Your sales contact has already prepared the requirement form. Please open the dedicated link to complete it once.',
            stageRequirementLinkOpen: 'Open Requirement Link',
            stageRequirementLinkMissing: 'Requirement link is not ready yet. Please contact sales.',
            stageDefaultNote: 'Please confirm key information at this stage before moving forward.',
            stageConfirmLine: 'I have reviewed the stage information and agree to move to the next stage.',
            stageConfirmNote: 'Confirmation Note',
            stageConfirmNotePlaceholder: 'Optional note',
            stageRequirementTitle: 'Requirement Title',
            stageRequirementType: 'Requirement Type',
            stageRequirementTypePlaceholder: 'Select requirement type',
            stageGasReport: 'Gas Source Report',
            stageGasReportHelp: 'Upload gas composition or source report (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG).',
            stageGasReportUpload: 'Upload Report',
            stageGasReportEmpty: 'No gas source report uploaded yet.',
            stageGasReportUploading: 'Uploading gas source report...',
            stageGasReportUploadFailed: 'Failed to upload gas source report.',
            stageCompany: 'Company',
            stageContact: 'Contact',
            stageEmail: 'Email',
            stagePhone: 'Phone',
            stageCountry: 'Country/Region',
            stageRequirementNote: 'Requirement Notes',
            stageRequirementNotePlaceholder: 'Add delivery constraints, budget range, and timeline',
            stageProductionStatus: 'Progress Status',
            stageProductionEta: 'Estimated Completion',
            stageProductionFactory: 'Factory / Line',
            stageProductionBatch: 'Batch',
            stageProductionDelay: 'Delay Notes',
            stageCurrent: 'Current Stage',
            stageHintActionable: 'Customer action stage: submission will move the flow to the next stage.',
            stageHintReadonly: 'Read-only stage: progress display only, no submit action.',
            stageHintSystem: 'System stage: status display only.',
            stageOutOfTurn: 'You are viewing a past/future stage. Submission is only allowed when the flow reaches "{stage}".',
            actionHint: 'Critical actions will ask for confirmation first.',
            actionNone: 'No action required now',
            commentsKicker: 'Communication',
            commentsTitle: '沟通记录',
            commentsDesc: 'This node uses one shared public comment flow for both sales and customer replies.',
            commentsCurrentTitle: 'Current Stage',
            commentsHistoryTitle: 'All Stages',
            commentsHistoryDesc: 'Expand previous nodes to review the whole sales lifecycle.',
            commentsEmpty: 'No communication record for this stage yet.',
            commentsHistoryEmpty: 'No public communication record yet.',
            commentsReplying: 'Replying to',
            commentsReplyCancel: 'Cancel Reply',
            commentsReplyAction: 'Reply',
            commentsComposerLabel: 'New Communication',
            commentsComposerPlaceholder: 'Leave a message for this stage, or reply to a specific message.',
            commentsSubmit: 'Post Communication',
            commentsPosted: 'Communication posted.',
            commentsPostFailed: 'Failed to post communication.',
            commentsNeedBody: 'Please enter communication content first.',
            commentsReplyPrefix: 'Reply to',
            commentsEdited: 'Edited',
            submitRequirement: 'Submit Requirement',
            submitConfirm: 'Confirm & Proceed',
            toastNeedFields: 'Please complete required requirement fields before submitting.',
            toastInvalidEmail: 'Please enter a valid email address.',
            toastNeedCheck: 'Please tick confirmation before submitting.',
            toastSubmittedRequirement: 'Requirement submitted. Flow moved forward.',
            toastFailedRequirement: 'Failed to submit requirement.',
            toastSubmittedStage: 'Stage confirmation submitted.',
            toastFailedStage: 'Failed to submit stage confirmation.',
            toastFailedOverview: 'Failed to load sales pipeline overview.',
            toastFailedDetail: 'Failed to load deal details.',
            toastFallbackDetail: 'Detail endpoint is temporarily unavailable. Compatibility mode is enabled.',
            confirmRequirement: 'Submit requirement and move to next stage?',
            confirmStage: 'Submit confirmation and move to next stage?',
            statusPending: 'Pending',
            statusActive: 'In Progress',
            statusCompleted: 'Completed',
            statusBlocked: 'Blocked'
        },
        zh: {
            sales_pipeline: '销售流水线',
            noDeals: '当前账号还没有匹配的销售线。',
            noSummary: '暂无摘要',
            loadingPipeline: '正在加载销售流水线...',
            unmatchedHint: '当前账号还未匹配客户销售线，请联系销售同事绑定客户邮箱。',
            listTitle: '销售线列表',
            listCountSuffix: '条',
            listExpand: '展开订单',
            listCollapse: '收起订单',
            timelineTitle: '销售流水线',
            timelineExpand: '展开流水线',
            timelineCollapse: '折叠流水线',
            dealUntitled: '未命名销售线',
            dealSummary: '客户节点确认统一在用户中心执行。',
            stageReadonly: '该节点为只读节点，客户侧无需操作。',
            stageRequirementLinkTitle: '需求链接',
            stageRequirementLinkHint: '销售已提前创建好需求单，请直接打开专属需求链接完成填写，无需在这里重复填写。',
            stageRequirementLinkOpen: '打开需求链接',
            stageRequirementLinkMissing: '需求链接暂未准备好，请联系销售。',
            stageDefaultNote: '请确认当前节点关键信息，提交后流程将进入下一节点。',
            stageConfirmLine: '我已确认当前节点信息，并同意推进到下一节点。',
            stageConfirmNote: '确认备注',
            stageConfirmNotePlaceholder: '可选：填写备注',
            stageRequirementTitle: '需求标题',
            stageRequirementType: '需求类型',
            stageRequirementTypePlaceholder: '请选择需求类型',
            stageGasReport: '气源报告',
            stageGasReportHelp: '上传气体成分报告或气源说明（支持 PDF、Word、Excel、JPG、PNG）。',
            stageGasReportUpload: '上传报告',
            stageGasReportEmpty: '暂未上传气源报告。',
            stageGasReportUploading: '正在上传气源报告...',
            stageGasReportUploadFailed: '上传气源报告失败。',
            stageCompany: '公司',
            stageContact: '联系人',
            stageEmail: '邮箱',
            stagePhone: '电话',
            stageCountry: '国家/地区',
            stageRequirementNote: '需求补充说明',
            stageRequirementNotePlaceholder: '补充交付要求、预算和时间线',
            stageProductionStatus: '进度状态',
            stageProductionEta: '预计完工',
            stageProductionFactory: '工厂/产线',
            stageProductionBatch: '批次',
            stageProductionDelay: '延期说明',
            stageCurrent: '当前节点',
            stageHintActionable: '客户动作节点：提交后会同步推进下一节点。',
            stageHintReadonly: '只读节点：展示交付进度，不提供提交按钮。',
            stageHintSystem: '系统节点：仅展示状态。',
            stageOutOfTurn: '当前查看的是历史/未来节点。仅当流程到达「{stage}」时才允许客户提交动作。',
            actionHint: '关键动作执行前会弹窗确认。',
            actionNone: '当前无需操作',
            commentsKicker: '沟通记录',
            commentsTitle: '沟通记录',
            commentsDesc: '当前节点与历史节点统一使用同一套公开评论流，客户和销售都看到同样内容。',
            commentsCurrentTitle: '当前节点',
            commentsHistoryTitle: '全部节点回顾',
            commentsHistoryDesc: '可展开以往节点，回顾整个销售生命周期内的沟通记录。',
            commentsEmpty: '当前节点还没有沟通记录。',
            commentsHistoryEmpty: '当前销售流程还没有公开沟通记录。',
            commentsReplying: '正在回复',
            commentsReplyCancel: '取消回复',
            commentsReplyAction: '回复',
            commentsComposerLabel: '新增沟通记录',
            commentsComposerPlaceholder: '像评论一样记录当前节点沟通，或先点“回复这条”再针对性回应。',
            commentsSubmit: '提交沟通记录',
            commentsPosted: '沟通记录已提交。',
            commentsPostFailed: '提交沟通记录失败。',
            commentsNeedBody: '请先填写沟通记录。',
            commentsReplyPrefix: '回复给',
            commentsEdited: '已编辑',
            submitRequirement: '提交需求',
            submitConfirm: '确认并推进',
            toastNeedFields: '请先完整填写客户需求核心字段。',
            toastInvalidEmail: '请输入有效的邮箱地址。',
            toastNeedCheck: '请先勾选确认后再提交。',
            toastSubmittedRequirement: '需求已提交，流程已推进。',
            toastFailedRequirement: '提交需求失败。',
            toastSubmittedStage: '节点确认已提交。',
            toastFailedStage: '节点确认提交失败。',
            toastFailedOverview: '加载销售流水线失败。',
            toastFailedDetail: '加载销售线详情失败。',
            toastFallbackDetail: '详情接口临时不可用，已切换到兼容模式继续处理流程。',
            confirmRequirement: '确认提交需求并进入下一节点吗？',
            confirmStage: '确认提交并推进到下一节点吗？',
            statusPending: '待开始',
            statusActive: '进行中',
            statusCompleted: '已完成',
            statusBlocked: '阻塞'
        }
    };

    const STAGE_LABELS = {
        customer_profile: { zh: '客户建档', en: 'Customer Profile' },
        requirement_capture: { zh: '获取需求', en: 'Requirement Capture' },
        requirement_confirmed: { zh: '确认需求', en: 'Requirement Confirmed' },
        quote_draft: { zh: '转入报价', en: 'Quote Draft' },
        quote_confirmed: { zh: '确认报价', en: 'Quote Confirmed' },
        contract_signed: { zh: '签约合同', en: 'Contract Signed' },
        deposit_paid: { zh: '定金付款', en: 'Deposit Paid' },
        production_scheduled: { zh: '排产安排', en: 'Production Scheduled' },
        factory_accepted: { zh: '出厂验收', en: 'Factory Acceptance' },
        balance_confirmed: { zh: '尾款确认', en: 'Balance Confirmed' },
        shipping_in_transit: { zh: '物流运输', en: 'Shipping In Transit' },
        deployment_completed: { zh: '到场部署', en: 'Deployment Completed' },
        support_active: { zh: '运维支持', en: 'Support Active' }
    };

    const REQUIREMENT_TYPE_LABELS = Object.freeze({
        oilfield_gas_to_power: { zh: '油田伴生气发电', en: 'Oilfield Associated Gas Power' },
        integrated_mining_power: { zh: '燃气发电集成矿箱', en: 'Integrated Mining Container + Gas Power' },
        industrial_power_generation: { zh: '工业分布式发电', en: 'Industrial Distributed Generation' },
        chp_project: { zh: 'CHP 热电联供项目', en: 'CHP / Cogeneration Project' },
        power_only: { zh: '独立燃气发电机组', en: 'Standalone Gas Power Unit' },
        miner_only: { zh: '独立矿机矿箱', en: 'Standalone Miner Container' },
        unclear: { zh: '需要推荐', en: 'Need Recommendation' }
    });
    const REQUIREMENT_TYPE_OPTIONS = Object.freeze([
        'oilfield_gas_to_power',
        'integrated_mining_power',
        'industrial_power_generation',
        'chp_project',
        'power_only',
        'miner_only',
        'unclear'
    ]);
    const STORAGE_BUCKET_REQUIREMENT_FILES = 'quote-product-media';
    const GAS_REPORT_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png';

    function tr(key, vars = {}) {
        const lang = currentLang();
        const dict = COPY[lang] || COPY.en;
        let value = dict[key] ?? COPY.en[key] ?? key;
        Object.entries(vars).forEach(([token, replacement]) => {
            value = value.replaceAll(`{${token}}`, String(replacement ?? ''));
        });
        return value;
    }

    function trSafe(key, fallback, vars = {}) {
        const resolved = tr(key, vars);
        return resolved === key ? fallback : resolved;
    }

    function pipelineLabel() {
        return currentLang() === 'zh' ? '销售流水线' : 'Sales Pipeline';
    }

    function localeText(zh, en) {
        return currentLang() === 'zh' ? zh : en;
    }

    const STAGES = [
        { key: 'customer_profile', label: 'Customer Profile', customerAction: false },
        { key: 'requirement_capture', label: 'Requirement Capture', customerAction: true },
        { key: 'requirement_confirmed', label: 'Requirement Confirmed', customerAction: false },
        { key: 'quote_draft', label: 'Quote Draft', customerAction: false },
        { key: 'quote_confirmed', label: 'Quote Confirmed', customerAction: true },
        { key: 'contract_signed', label: 'Contract Signed', customerAction: true },
        { key: 'deposit_paid', label: 'Deposit Paid', customerAction: false },
        { key: 'production_scheduled', label: 'Production Scheduled', customerAction: false, readonlyProgress: true },
        { key: 'factory_accepted', label: 'Factory Acceptance', customerAction: true },
        { key: 'balance_confirmed', label: 'Balance Confirmed', customerAction: false },
        { key: 'shipping_in_transit', label: 'Shipping In Transit', customerAction: false },
        { key: 'deployment_completed', label: 'Deployment Completed', customerAction: false },
        { key: 'support_active', label: 'Support Active', customerAction: false },
    ];

    const STAGE_INDEX = Object.fromEntries(STAGES.map((item, index) => [item.key, index]));
    const ACTIONABLE_STAGE_SET = new Set(['requirement_capture', 'quote_confirmed', 'contract_signed', 'factory_accepted']);

    const state = {
        client: null,
        initialized: false,
        loadedOnce: false,
        overviewLoading: false,
        detailLoading: false,
        overview: [],
        detail: null,
        commentReplyToId: '',
        selectedDealId: '',
        selectedStage: '',
        pendingReqSubmit: false,
        pendingStageSubmit: false,
        resolvedLegacyEntry: false,
        legacyEntry: null,
        invalidEntry: false,
        mobileViewport: false,
        mobileListCollapsed: true,
        timelineCollapsed: false,
        showFullMap: false,
        requirementDraft: {},
        sessionUser: null,
    };

    function isMobileViewport() {
        return window.matchMedia('(max-width: 767px)').matches;
    }

    function normalizeMobileListState(forceCollapseOnMobile = false) {
        const mobileNow = isMobileViewport();
        state.mobileViewport = mobileNow;
        if (!mobileNow) {
            state.mobileListCollapsed = false;
            if (forceCollapseOnMobile) state.timelineCollapsed = false;
            return;
        }
        if (forceCollapseOnMobile || typeof state.mobileListCollapsed !== 'boolean') {
            state.mobileListCollapsed = true;
            state.timelineCollapsed = true;
        }
    }

    function text(value, fallback = '') {
        const normalized = value == null ? '' : String(value).trim();
        return normalized || fallback;
    }

    function esc(value = '') {
        return text(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function requirementTypeLabel(value) {
        const normalized = text(value);
        if (!normalized) return '';
        const labels = REQUIREMENT_TYPE_LABELS[normalized];
        if (!labels) return normalized;
        return currentLang() === 'zh' ? labels.zh : labels.en;
    }

    function requirementTypeValue(value) {
        const normalized = text(value);
        if (!normalized) return '';
        const matchedKey = Object.entries(REQUIREMENT_TYPE_LABELS).find(([, labels]) => (
            normalized === labels.zh || normalized === labels.en
        ));
        return matchedKey ? matchedKey[0] : normalized;
    }

    function requirementTypeOptionsMarkup(selectedValue = '', editable = true) {
        const normalized = requirementTypeValue(selectedValue);
        const placeholder = tr('stageRequirementTypePlaceholder');
        const disabled = editable ? '' : 'disabled';
        return `
            <select class="field-select px-4 py-3" data-sales-req-field="requirement_type" ${disabled}>
                <option value="">${esc(placeholder)}</option>
                ${REQUIREMENT_TYPE_OPTIONS.map((value) => `
                    <option value="${esc(value)}" ${value === normalized ? 'selected' : ''}>${esc(requirementTypeLabel(value))}</option>
                `).join('')}
            </select>
        `;
    }

    function fileBaseName(name = '') {
        return text(name).replace(/[^\w.\-]+/g, '_');
    }

    function gasReportPath(detail = {}, fileName = '') {
        const dealId = text(detail.deal_id || state.selectedDealId || 'unknown-deal');
        const safeName = fileBaseName(fileName || 'gas-report');
        return `requirement-gas-reports/${dealId}/${Date.now()}-${safeName}`;
    }

    function requirementPublicUrl(publicSlug = '', publicToken = '') {
        const url = new URL('/quote/requirement.html', window.location.origin);
        if (text(publicSlug)) url.searchParams.set('req', text(publicSlug));
        if (text(publicToken)) url.searchParams.set('token', text(publicToken));
        return url.toString();
    }

    function requirementLinkInfo(detail = {}) {
        const req = detail.requirement && typeof detail.requirement === 'object' ? detail.requirement : {};
        const slug = text(req.public_slug);
        const token = text(req.public_token);
        return {
            slug,
            token,
            url: slug && token ? requirementPublicUrl(slug, token) : '',
        };
    }

    function gasReportFromDraft(draft = {}) {
        const answers = draft.answers && typeof draft.answers === 'object' ? draft.answers : {};
        const report = answers.gas_source_report && typeof answers.gas_source_report === 'object'
            ? answers.gas_source_report
            : {};
        return {
            name: text(report.name),
            url: text(report.url),
            path: text(report.path),
            mime: text(report.mime),
        };
    }

    function allowGasSourceReport(draft = {}) {
        const answers = draft.answers && typeof draft.answers === 'object' ? draft.answers : {};
        return answers.allow_gas_source_report !== false;
    }

    async function uploadGasSourceReport(detail = {}, file) {
        if (!file) return gasReportFromDraft(state.requirementDraft);
        const client = ensureClient();
        if (!client) throw new Error('Supabase client unavailable.');
        const storagePath = gasReportPath(detail, file.name);
        const uploadResult = await client.storage.from(STORAGE_BUCKET_REQUIREMENT_FILES).upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
        });
        if (uploadResult.error) throw uploadResult.error;
        const publicUrlResult = client.storage.from(STORAGE_BUCKET_REQUIREMENT_FILES).getPublicUrl(storagePath);
        return {
            name: text(file.name),
            url: text(publicUrlResult?.data?.publicUrl),
            path: storagePath,
            mime: text(file.type),
        };
    }

    const INTERNAL_ACTIVITY_TYPES = new Set([
        'page_view',
        'button_click',
        'field_change',
        'status_change',
        'stage_advanced',
        'quote_generated',
        'public_link_opened'
    ]);

    const INTERNAL_ACTIVITY_LABEL_PATTERNS = [
        /^创建客户档案$/,
        /^更新客户档案$/,
        /^创建销售流程$/,
        /^更新销售流程$/,
        /^创建需求单$/,
        /^更新需求单$/,
        /^创建报价草稿$/,
        /^保存报价草稿$/,
        /^从产品模板生成报价草稿$/,
        /^从需求单生成报价草稿$/,
        /^销售流程推进到/,
        /^确认报价并转入签约合同$/,
        /^报价已发布并进入确认报价$/,
        /^进入客户档案页$/,
        /^进入阶段总览/,
        /^进入客户流水线/,
        /^进入销售总览$/
    ];

    function isCustomerVisibleActivity(activity = {}) {
        const actorType = text(activity.actor_type);
        const activityType = text(activity.activity_type);
        const actionLabel = text(activity.action_label);
        const summary = text(activity.summary);

        if (actorType !== 'sales') return false;
        if (INTERNAL_ACTIVITY_TYPES.has(activityType)) return false;
        if (INTERNAL_ACTIVITY_LABEL_PATTERNS.some((pattern) => pattern.test(actionLabel))) return false;
        return Boolean(actionLabel || summary);
    }

    function customerVisibleActivities(detail = {}) {
        const list = Array.isArray(detail.activities) ? detail.activities : [];
        return list.filter((item) => isCustomerVisibleActivity(item)).slice(0, 30);
    }

    function communicationRows(detail = {}) {
        const list = Array.isArray(detail.communications) ? detail.communications : [];
        return list
            .map((item) => ({
                id: text(item.id),
                stage_key: text(item.stage_key),
                reply_to_id: text(item.reply_to_id),
                actor_type: text(item.actor_type, 'sales'),
                actor_label: text(item.actor_label),
                body: text(item.body),
                created_at: text(item.created_at),
                updated_at: text(item.updated_at || item.created_at),
                reply_to_body: text(item.reply_to_body),
                reply_to_actor_label: text(item.reply_to_actor_label),
                reply_to_stage_key: text(item.reply_to_stage_key),
            }))
            .filter((item) => item.body && item.stage_key)
            .sort((left, right) => {
                const rightTime = new Date(text(right.updated_at || right.created_at)).getTime() || 0;
                const leftTime = new Date(text(left.updated_at || left.created_at)).getTime() || 0;
                return rightTime - leftTime;
            });
    }

    function currentStageCommunications(detail = {}) {
        const currentStage = resolveDisplayStage(detail);
        return communicationRows(detail).filter((item) => item.stage_key === currentStage);
    }

    function communicationRowsByStage(detail = {}) {
        const groups = {};
        communicationRows(detail).forEach((item) => {
            if (!groups[item.stage_key]) groups[item.stage_key] = [];
            groups[item.stage_key].push(item);
        });
        return groups;
    }

    function communicationReplyTarget(detail = {}) {
        const replyId = text(state.commentReplyToId);
        if (!replyId) return null;
        return communicationRows(detail).find((item) => item.id === replyId) || null;
    }

    function communicationActorRole(entry = {}) {
        if (text(entry.actor_type) === 'customer') return currentLang() === 'zh' ? '客户' : 'Customer';
        if (text(entry.actor_type) === 'system') return currentLang() === 'zh' ? '系统' : 'System';
        return currentLang() === 'zh' ? '销售' : 'Sales';
    }

    function communicationToneClass(entry = {}) {
        if (text(entry.actor_type) === 'customer') return 'is-customer';
        if (text(entry.actor_type) === 'system') return 'is-system';
        return 'is-sales';
    }

    function communicationPreview(entry = {}) {
        const body = text(entry.body);
        return body.length > 80 ? `${body.slice(0, 77)}...` : body;
    }

    function communicationAvatar(entry = {}) {
        const label = text(entry.actor_label, communicationActorRole(entry));
        const compact = Array.from(label.replace(/\s+/g, '')).slice(0, 2).join('');
        return (compact || communicationActorRole(entry).slice(0, 1)).toUpperCase();
    }

    function communicationMeta(entry = {}) {
        const createdAt = formatDate(entry.created_at);
        const updatedAt = text(entry.updated_at);
        if (updatedAt && updatedAt !== text(entry.created_at)) return `${createdAt} · ${tr('commentsEdited')}`;
        return createdAt;
    }

    function byId(id) {
        return document.getElementById(id);
    }

    function formatDate(value) {
        if (!value) return '--';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '--';
        return date.toLocaleString(currentLang() === 'zh' ? 'zh-CN' : 'en-US');
    }

    function isValidEmail(value = '') {
        const normalized = text(value);
        if (!normalized) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
    }

    function requirementDraftFromDetail(detail = {}) {
        const req = detail.requirement && typeof detail.requirement === 'object' ? detail.requirement : {};
        const answers = req.answers && typeof req.answers === 'object' ? req.answers : {};
        const sessionEmail = text(state.sessionUser?.email);
        return {
            deal_id: text(detail.deal_id || state.selectedDealId),
            requirement_type: text(req.requirement_type),
            requester_company: text(req.requester_company, detail.customer_company),
            requester_name: text(req.requester_name),
            requester_email: text(req.requester_email, detail.customer_email || sessionEmail),
            requester_phone: text(req.requester_phone),
            country: text(req.country),
            note: text(req.note || req.notes),
            answers: {
                allow_gas_source_report: answers.allow_gas_source_report !== false,
                gas_source_report: answers.gas_source_report && typeof answers.gas_source_report === 'object' ? answers.gas_source_report : {},
            },
        };
    }

    function ensureRequirementDraft(detail = {}) {
        const nextDealId = text(detail.deal_id || state.selectedDealId);
        if (text(state.requirementDraft.deal_id) !== nextDealId) {
            state.requirementDraft = requirementDraftFromDetail(detail);
        } else if (!Object.keys(state.requirementDraft || {}).length) {
            state.requirementDraft = requirementDraftFromDetail(detail);
        }
        return state.requirementDraft;
    }

    function stageLabel(stageKey = '') {
        const normalized = text(stageKey);
        const label = STAGE_LABELS[normalized];
        if (!label) return text(stageKey, '--');
        return currentLang() === 'zh' ? label.zh : label.en;
    }

    function normalizeStatus(value = '') {
        const normalized = text(value, 'pending');
        if (['pending', 'active', 'completed', 'blocked'].includes(normalized)) return normalized;
        return 'pending';
    }

    function statusLabel(value = '') {
        const normalized = normalizeStatus(value);
        if (normalized === 'completed') return tr('statusCompleted');
        if (normalized === 'active') return tr('statusActive');
        if (normalized === 'blocked') return tr('statusBlocked');
        return tr('statusPending');
    }

    function statusClass(value = '') {
        const normalized = normalizeStatus(value);
        if (normalized === 'completed') return 'is-completed';
        if (normalized === 'active') return 'is-active';
        if (normalized === 'blocked') return 'is-blocked';
        return 'is-pending';
    }

    function showToast(message, tone = 'success') {
        const container = byId('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${tone === 'error' ? 'error' : ''}`;
        const iconClass = tone === 'error' ? 'fa-circle-exclamation text-red-500' : 'fa-circle-check text-gas-green';
        toast.innerHTML = `<i class="fa-solid ${iconClass} mt-0.5"></i><span class="text-sm leading-6">${esc(message)}</span>`;
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 220);
        }, 3200);
    }

    function ensureClient() {
        if (state.client) return state.client;
        const helper = window.GasGxMainAuthShared;
        if (!helper?.createClient || !window.supabase) return null;
        const runtime = helper.resolveConfig(window.GASGX_SITE_SHELL_CONFIG?.site?.mainAuth);
        state.client = helper.createClient(window.supabase, runtime);
        return state.client;
    }

    async function getSessionUser() {
        const client = ensureClient();
        if (!client) return null;
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        return data?.session?.user || null;
    }

    function parseQuery() {
        return new URL(window.location.href).searchParams;
    }

    function buildSalesUrl(dealId = '', stageKey = '') {
        const url = new URL('/account/account.html', window.location.origin);
        url.searchParams.set('tab', 'sales');
        if (state.legacyEntry && text(dealId) === 'legacy-public') {
            if (state.legacyEntry.kind === 'requirement') {
                url.searchParams.set('req', state.legacyEntry.slug);
                url.searchParams.set('req_token', state.legacyEntry.token);
            } else if (state.legacyEntry.kind === 'stage') {
                url.searchParams.set('confirm_stage', state.legacyEntry.slug);
                url.searchParams.set('confirm_token', state.legacyEntry.token);
            } else if (state.legacyEntry.kind === 'quote') {
                url.searchParams.set('quote', state.legacyEntry.slug);
            }
            if (text(stageKey)) url.searchParams.set('stage', text(stageKey));
            return `${url.pathname}${url.search}`;
        }
        if (text(dealId)) url.searchParams.set('deal', text(dealId));
        if (text(stageKey)) url.searchParams.set('stage', text(stageKey));
        return `${url.pathname}${url.search}`;
    }

    function syncUrl(dealId = state.selectedDealId, stageKey = state.selectedStage) {
        const next = buildSalesUrl(dealId, stageKey);
        window.history.replaceState({}, '', next);
    }

    async function rpc(name, payload = {}) {
        const client = ensureClient();
        if (!client) throw new Error('Supabase client unavailable.');
        const { data, error } = await client.rpc(name, payload);
        if (error) throw error;
        return data;
    }

    function missingRpc(error, functionName = '') {
        const message = text(error?.message).toLowerCase();
        if (!message) return false;
        const rpcName = text(functionName).toLowerCase();
        return message.includes('could not find the function')
            && (!rpcName || message.includes(`public.${rpcName}`));
    }

    async function loadLegacyRequirementDetail() {
        const entry = state.legacyEntry;
        if (!entry || entry.kind !== 'requirement') return null;
        const data = await rpc('get_public_quote_requirement', {
            req_slug: entry.slug,
            req_token: entry.token,
        });
        const row = Array.isArray(data) ? data[0] : null;
        if (!row) return null;
        const status = text(row.status, 'draft');
        const currentStage = status === 'draft' ? 'requirement_capture' : 'requirement_confirmed';
        const stageRecords = [
            { stage_key: 'customer_profile', stage_status: 'completed', meta: {} },
            { stage_key: 'requirement_capture', stage_status: status === 'draft' ? 'active' : 'completed', meta: {} },
            { stage_key: 'requirement_confirmed', stage_status: status === 'draft' ? 'pending' : 'active', meta: {} },
        ];
        return {
            deal_id: 'legacy-public',
            customer_id: text(row.customer_id),
            customer_company: text(row.requester_company || row.customer_company),
            customer_email: text(row.requester_email || row.customer_email),
            deal_title: text(row.title, tr('stage_requirement_confirmed')),
            current_stage: currentStage,
            deal_status: 'active',
            summary: text(row.title),
            requirement: {
                id: text(row.id),
                status,
                title: text(row.title),
                public_slug: text(row.public_slug),
                public_token: text(row.public_token),
                requirement_type: text(row.requirement_type),
                country: text(row.country),
                requester_company: text(row.requester_company || row.customer_company),
                requester_name: text(row.requester_name || row.customer_contact),
                requester_email: text(row.requester_email || row.customer_email),
                requester_phone: text(row.requester_phone || row.customer_phone),
                answers: row.answers && typeof row.answers === 'object' ? row.answers : {},
                submitted_at: row.submitted_at || null,
                updated_at: row.updated_at || row.submitted_at || null,
            },
            quote: {},
            stage_records: stageRecords,
            activities: [],
        };
    }

    async function loadLegacyStageConfirmationDetail() {
        const entry = state.legacyEntry;
        if (!entry || entry.kind !== 'stage') return null;
        const data = await rpc('get_public_quote_stage_confirmation', {
            stage_slug: entry.slug,
            stage_token: entry.token,
        });
        const row = Array.isArray(data) ? data[0] : null;
        if (!row) return null;
        const stageKey = text(row.stage_key, 'quote_confirmed');
        const submitted = text(row.stage_status) === 'completed' || Boolean(row.completed_at);
        const nextStage = text(row.next_stage);
        const fallbackNext = STAGES[(STAGE_INDEX[stageKey] || 0) + 1]?.key || stageKey;
        const resolvedNextStage = STAGE_INDEX[nextStage] != null ? nextStage : fallbackNext;
        const currentStage = submitted ? resolvedNextStage : stageKey;
        const stageRecords = [
            {
                stage_key: stageKey,
                stage_status: submitted ? 'completed' : 'active',
                completed_at: row.completed_at || null,
                meta: row.meta && typeof row.meta === 'object' ? row.meta : {},
            },
        ];
        return {
            deal_id: 'legacy-public',
            customer_id: '',
            customer_company: text(row.customer_company),
            customer_email: text(row.customer_email),
            deal_title: text(row.customer_name || row.title, tr('stage_requirement_confirmed')),
            current_stage: STAGE_INDEX[currentStage] != null ? currentStage : stageKey,
            deal_status: 'active',
            summary: text(row.customer_name || row.title),
            requirement: {},
            quote: {},
            stage_records: stageRecords,
            activities: [],
        };
    }

    function parseStageRecords(detail = {}) {
        const records = Array.isArray(detail.stage_records) ? detail.stage_records : [];
        const map = {};
        records.forEach((record) => {
            const key = text(record.stage_key);
            if (key) map[key] = record;
        });
        return map;
    }

    function stageStatusForKey(stageKey, currentStage, recordMap) {
        const record = recordMap[stageKey];
        if (record && text(record.stage_status)) return normalizeStatus(record.stage_status);
        const stageIdx = STAGE_INDEX[stageKey];
        const currentIdx = STAGE_INDEX[currentStage];
        if (stageIdx == null || currentIdx == null) return 'pending';
        if (stageIdx < currentIdx) return 'completed';
        if (stageIdx === currentIdx) return 'active';
        return 'pending';
    }

    function resolveDealCurrentStage(detail = {}) {
        const stage = text(detail.current_stage, 'requirement_capture');
        return STAGE_INDEX[stage] != null ? stage : 'requirement_capture';
    }

    function resolveDisplayStage(detail = {}) {
        const dealStage = resolveDealCurrentStage(detail);
        const selected = text(state.selectedStage);
        if (selected && STAGE_INDEX[selected] != null) return selected;
        return dealStage;
    }

    function isCurrentStageActionable(stageKey, detail) {
        const current = resolveDealCurrentStage(detail);
        return stageKey === current && ACTIONABLE_STAGE_SET.has(stageKey);
    }

    function renderTimeline(detail = {}) {
        const current = resolveDealCurrentStage(detail);
        const recordMap = parseStageRecords(detail);
        return STAGES.map((item, index) => {
            const status = stageStatusForKey(item.key, current, recordMap);
            const active = item.key === current;
            return `
                <button type="button" class="sales-pipeline-node ${statusClass(status)} ${active ? 'is-current' : ''}" data-sales-stage-node="${esc(item.key)}">
                    <span class="sales-pipeline-node-index">${index + 1}</span>
                    <span class="sales-pipeline-node-main">
                        <strong>${esc(stageLabel(item.key))}</strong>
                        <em>${esc(statusLabel(status))}</em>
                    </span>
                </button>
            `;
        }).join('');
    }

    function renderOverviewCards() {
        if (!state.overview.length) {
            return `<div class="sales-empty">${esc(tr('noDeals'))}</div>`;
        }
        const shouldCollapse = state.mobileViewport && state.mobileListCollapsed;
        const selectedDeal = overviewRowByDealId(state.selectedDealId) || state.overview[0] || null;
        const rows = shouldCollapse && selectedDeal ? [selectedDeal] : state.overview;
        return rows.map((item) => {
            const selected = text(item.deal_id) === text(state.selectedDealId);
            return `
                <button type="button" class="sales-deal-card ${selected ? 'is-active' : ''}" data-sales-deal="${esc(item.deal_id)}">
                    <strong>${esc(text(item.deal_title, item.deal_id))}</strong>
                    <span>${esc(stageLabel(item.current_stage))} · ${esc(text(item.deal_status, 'active'))}</span>
                    <em>${esc(text(item.summary, tr('noSummary')))}</em>
                </button>
            `;
        }).join('');
    }

    function scrollActiveDealCardIntoView(smooth = false) {
        if (!state.mobileViewport) return;
        const container = document.querySelector('#sales-pipeline-root .sales-list-scroll');
        const activeCard = container?.querySelector('.sales-deal-card.is-active');
        if (!container || !activeCard) return;
        activeCard.scrollIntoView({
            behavior: smooth ? 'smooth' : 'auto',
            block: 'nearest',
            inline: 'center',
        });
    }

    function requirementFormMarkup(detail, editable) {
        const req = ensureRequirementDraft(detail);
        const gasReport = gasReportFromDraft(req);
        const showGasReport = allowGasSourceReport(req);
        return `
            <div class="sales-stage-form-grid">
                <label><span>${esc(tr('stageRequirementType'))}</span>${requirementTypeOptionsMarkup(req.requirement_type, editable)}</label>
                <label><span>${esc(tr('stageCompany'))}</span><input class="field-input px-4 py-3" data-sales-req-field="requester_company" value="${esc(text(req.requester_company))}" ${editable ? '' : 'disabled'}></label>
                <label><span>${esc(tr('stageContact'))}</span><input class="field-input px-4 py-3" data-sales-req-field="requester_name" value="${esc(text(req.requester_name))}" ${editable ? '' : 'disabled'}></label>
                <label><span>${esc(tr('stageEmail'))}</span><input type="email" inputmode="email" class="field-input px-4 py-3" data-sales-req-field="requester_email" value="${esc(text(req.requester_email))}" ${editable ? '' : 'disabled'}></label>
                <label><span>${esc(tr('stagePhone'))}</span><input class="field-input px-4 py-3" data-sales-req-field="requester_phone" value="${esc(text(req.requester_phone))}" ${editable ? '' : 'disabled'}></label>
                <label><span>${esc(tr('stageCountry'))}</span><input class="field-input px-4 py-3" data-sales-req-field="country" value="${esc(text(req.country))}" ${editable ? '' : 'disabled'}></label>
                ${showGasReport ? `<label class="sales-span-2">
                    <span>${esc(tr('stageGasReport'))}</span>
                    <div class="sales-stage-note">
                        <div>${gasReport.url ? `<a href="${esc(gasReport.url)}" target="_blank" rel="noreferrer">${esc(gasReport.name || tr('stageGasReport'))}</a>` : esc(tr('stageGasReportEmpty'))}</div>
                        <small>${esc(tr('stageGasReportHelp'))}</small>
                    </div>
                    <input type="file" id="sales-gas-report-upload" accept="${esc(GAS_REPORT_ACCEPT)}" ${editable ? '' : 'disabled'} hidden>
                    <button type="button" class="rounded-2xl border border-white/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-gray-200" id="sales-gas-report-upload-trigger" ${editable ? '' : 'disabled'}>${esc(tr('stageGasReportUpload'))}</button>
                </label>` : ''}
                <label class="sales-span-2"><span>${esc(tr('stageRequirementNote'))}</span><textarea class="field-textarea px-4 py-3" rows="4" data-sales-req-field="note" placeholder="${esc(tr('stageRequirementNotePlaceholder'))}" ${editable ? '' : 'disabled'}>${esc(text(req.note))}</textarea></label>
            </div>
        `;
    }

    function requirementLinkMarkup(detail = {}) {
        const requirementLink = requirementLinkInfo(detail).url;
        return `
            <div class="sales-stage-confirm">
                <div class="sales-stage-note">
                    <strong>${esc(tr('stageRequirementLinkTitle'))}</strong>
                    <p>${esc(tr('stageRequirementLinkHint'))}</p>
                    ${requirementLink
                        ? `
                            <a class="rounded-2xl border border-gas-green/50 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-gas-green inline-flex items-center justify-center" href="${esc(requirementLink)}" data-sales-open-requirement-link="inline">${esc(tr('stageRequirementLinkOpen'))}</a>
                            <div class="mt-3 break-all text-[11px] leading-5 text-gray-400">${esc(requirementLink)}</div>
                        `
                        : `<span>${esc(tr('stageRequirementLinkMissing'))}</span>`}
                </div>
            </div>
        `;
    }

    function stageConfirmationMarkup(stageKey, detail, editable) {
        const recordMap = parseStageRecords(detail);
        const record = recordMap[stageKey] || {};
        const meta = record.meta && typeof record.meta === 'object' ? record.meta : {};
        return `
            <div class="sales-stage-confirm">
                <div class="sales-stage-note">${esc(text(meta.quote_terms || tr('stageDefaultNote')))}</div>
                <label class="sales-check-line">
                    <input type="checkbox" id="sales-stage-confirm-checkbox" ${editable ? '' : 'disabled'}>
                    <span>${esc(tr('stageConfirmLine'))}</span>
                </label>
                <label><span>${esc(tr('stageConfirmNote'))}</span><textarea id="sales-stage-confirm-note" class="field-textarea px-4 py-3" rows="4" placeholder="${esc(tr('stageConfirmNotePlaceholder'))}" ${editable ? '' : 'disabled'}></textarea></label>
            </div>
        `;
    }

    function productionReadonlyMarkup(detail) {
        const record = parseStageRecords(detail).production_scheduled || {};
        const meta = record.meta && typeof record.meta === 'object' ? record.meta : {};
        return `
            <div class="sales-stage-readonly-grid">
                <div><span>${esc(tr('stageProductionStatus'))}</span><strong>${esc(text(meta.production_schedule_status, 'pending'))}</strong></div>
                <div><span>${esc(tr('stageProductionEta'))}</span><strong>${esc(text(meta.production_eta, '--'))}</strong></div>
                <div><span>${esc(tr('stageProductionFactory'))}</span><strong>${esc(text(meta.factory_name, '--'))}</strong></div>
                <div><span>${esc(tr('stageProductionBatch'))}</span><strong>${esc(text(meta.production_batch, '--'))}</strong></div>
                <div class="sales-span-2"><span>${esc(tr('stageProductionDelay'))}</span><strong>${esc(text(meta.production_delay_reason, '--'))}</strong></div>
            </div>
        `;
    }

    function stageActionArea(detail = {}) {
        const stageKey = resolveDisplayStage(detail);
        const stage = STAGES.find((item) => item.key === stageKey) || STAGES[0];
        const editable = isCurrentStageActionable(stageKey, detail);
        const dealCurrent = resolveDealCurrentStage(detail);

        let body = `<div class="sales-stage-note">${esc(tr('stageReadonly'))}</div>`;
        let actions = '';

        if (stageKey === 'requirement_capture') {
            body = requirementLinkMarkup(detail);
            const requirementLink = requirementLinkInfo(detail).url;
            actions = requirementLink
                ? `<a class="rounded-2xl bg-gas-green px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black inline-flex items-center justify-center" href="${esc(requirementLink)}" data-sales-open-requirement-link="action">${esc(tr('stageRequirementLinkOpen'))}</a>`
                : '';
        } else if (ACTIONABLE_STAGE_SET.has(stageKey)) {
            body = stageConfirmationMarkup(stageKey, detail, editable);
            actions = editable
                ? `<button type="button" class="rounded-2xl bg-gas-green px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black" id="sales-stage-submit-confirmation" ${state.pendingStageSubmit ? 'disabled' : ''}>${esc(tr('submitConfirm'))}</button>`
                : '';
        } else if (stageKey === 'production_scheduled') {
            body = productionReadonlyMarkup(detail);
        }

        if (stageKey !== dealCurrent) {
            actions = '';
            body = `
                <div class="sales-stage-note">
                    ${esc(tr('stageOutOfTurn', { stage: stageLabel(dealCurrent) }))}
                </div>
                ${body}
            `;
        }

        const visibilityHint = stage.customerAction
            ? tr('stageHintActionable')
            : stage.readonlyProgress
                ? tr('stageHintReadonly')
                : tr('stageHintSystem');

        return `
            <section class="sales-stage-card">
                <div class="sales-stage-head">
                    <div>
                        <div class="sales-kicker">${esc(tr('stageCurrent'))}</div>
                        <h3>${esc(stageLabel(stage.key))}</h3>
                        <p>${esc(visibilityHint)}</p>
                    </div>
                    <span class="sales-stage-pill ${statusClass(stageStatusForKey(stage.key, resolveDealCurrentStage(detail), parseStageRecords(detail)))}">${esc(statusLabel(stageStatusForKey(stage.key, resolveDealCurrentStage(detail), parseStageRecords(detail))))}</span>
                </div>
                ${body}
                <div class="sales-action-bar">
                    <span>${esc(tr('actionHint'))}</span>
                    <div class="sales-action-buttons">${actions || `<button type="button" class="rounded-2xl border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-gray-400" disabled>${esc(tr('actionNone'))}</button>`}</div>
                </div>
            </section>
        `;
    }

    function communicationItemMarkup(item = {}) {
        const replyLabel = text(item.reply_to_actor_label);
        const replyStage = text(item.reply_to_stage_key);
        return `
            <article class="sales-comment-item ${communicationToneClass(item)}">
                <div class="sales-comment-head">
                    <div class="sales-comment-avatar">${esc(communicationAvatar(item))}</div>
                    <div class="sales-comment-author">
                        <div class="sales-comment-author-line">
                            <strong>${esc(text(item.actor_label, communicationActorRole(item)))}</strong>
                            <span class="sales-comment-role">${esc(communicationActorRole(item))}</span>
                        </div>
                        <div class="sales-comment-meta-line">
                            <em>${esc(stageLabel(item.stage_key))}</em>
                            <time>${esc(communicationMeta(item))}</time>
                        </div>
                    </div>
                </div>
                ${replyLabel
                    ? `
                        <div class="sales-comment-reply-context">
                            <span>${esc(`${tr('commentsReplyPrefix')} ${replyLabel}${replyStage ? ` · ${stageLabel(replyStage)}` : ''}`)}</span>
                            <strong>${esc(text(item.reply_to_body))}</strong>
                        </div>
                    `
                    : ''}
                <div class="sales-comment-body">${esc(item.body)}</div>
                <div class="sales-comment-actions">
                    <button type="button" class="rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold tracking-[0.08em] text-gray-300 transition hover:border-gas-green/60 hover:text-gas-green" data-sales-comment-reply="${esc(item.id)}">
                        ${esc(text(state.commentReplyToId) === text(item.id) ? tr('commentsReplyCancel') : tr('commentsReplyAction'))}
                    </button>
                </div>
            </article>
        `;
    }

    function commentsMarkup(detail = {}) {
        const currentList = currentStageCommunications(detail);
        const grouped = communicationRowsByStage(detail);
        const currentStage = resolveDisplayStage(detail);
        const replyTarget = communicationReplyTarget(detail);
        const historyStages = STAGES
            .map((stage) => ({ stage, rows: grouped[stage.key] || [] }))
            .filter((entry) => entry.rows.length);

        return `
            <section class="sales-stage-card sales-comments-card">
                <div class="sales-stage-head">
                    <div>
                        <div class="sales-kicker">${esc(tr('commentsKicker'))}</div>
                        <h3>${esc(tr('commentsTitle'))}</h3>
                        <p>${esc(tr('commentsDesc'))}</p>
                    </div>
                </div>
                <div class="sales-comment-composer">
                    ${replyTarget
                        ? `
                            <div class="sales-comment-reply-banner">
                                <div>
                                    <span>${esc(`${tr('commentsReplying')} ${text(replyTarget.actor_label, communicationActorRole(replyTarget))}`)}</span>
                                    <strong>${esc(communicationPreview(replyTarget))}</strong>
                                </div>
                                <button type="button" class="rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold tracking-[0.08em] text-gray-300 transition hover:border-red-400 hover:text-red-300" data-sales-comment-reply-cancel="true">${esc(tr('commentsReplyCancel'))}</button>
                            </div>
                        `
                        : ''}
                    <label class="sales-comment-compose-field">
                        <span>${esc(tr('commentsComposerLabel'))}</span>
                        <textarea id="sales-comment-input" class="field-textarea px-4 py-3" rows="4" placeholder="${esc(tr('commentsComposerPlaceholder'))}"></textarea>
                    </label>
                    <div class="sales-action-buttons">
                        <button type="button" class="rounded-2xl bg-gas-green px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black" id="sales-comment-submit">${esc(tr('commentsSubmit'))}</button>
                    </div>
                </div>
                <div class="sales-comment-stage-block">
                    <div class="sales-comment-stage-head">
                        <strong>${esc(tr('commentsCurrentTitle'))}</strong>
                        <span>${esc(stageLabel(currentStage))}</span>
                    </div>
                    <div class="sales-comment-list">
                        ${currentList.length ? currentList.map((item) => communicationItemMarkup(item)).join('') : `<div class="sales-empty">${esc(tr('commentsEmpty'))}</div>`}
                    </div>
                </div>
                <details class="sales-comment-history" ${historyStages.length ? '' : 'open'}>
                    <summary class="sales-comment-history-summary">
                        <strong>${esc(tr('commentsHistoryTitle'))}</strong>
                        <span>${esc(tr('commentsHistoryDesc'))}</span>
                    </summary>
                    <div class="sales-comment-history-body">
                        ${historyStages.length
                            ? historyStages.map(({ stage, rows }) => `
                                <details class="sales-comment-history-group ${stage.key === currentStage ? 'is-current' : ''}" ${stage.key === currentStage ? 'open' : ''}>
                                    <summary class="sales-comment-history-group-summary">
                                        <strong>${esc(stageLabel(stage.key))}</strong>
                                        <span>${esc(`${rows.length} 条`)}</span>
                                    </summary>
                                    <div class="sales-comment-list">
                                        ${rows.map((item) => communicationItemMarkup(item)).join('')}
                                    </div>
                                </details>
                            `).join('')
                            : `<div class="sales-empty">${esc(tr('commentsHistoryEmpty'))}</div>`}
                    </div>
                </details>
            </section>
        `;
    }

    function displayActorName(value = '') {
        const normalized = text(value);
        if (!normalized) return localeText('用户', 'User');
        return normalized.includes('@') ? normalized.split('@')[0] : normalized;
    }

    function communicationTimeValue(entry = {}) {
        return new Date(text(entry.updated_at || entry.created_at)).getTime() || 0;
    }

    function buildCurrentStageThreads(detail = {}) {
        const currentList = currentStageCommunications(detail);
        const map = new Map(currentList.map((item) => [item.id, { ...item, replies: [] }]));
        const roots = [];

        currentList.forEach((item) => {
            const node = map.get(item.id);
            const parentId = text(item.reply_to_id);
            if (parentId && map.has(parentId)) {
                let rootId = parentId;
                while (map.has(rootId) && text(map.get(rootId).reply_to_id) && map.has(text(map.get(rootId).reply_to_id))) {
                    rootId = text(map.get(rootId).reply_to_id);
                }
                map.get(rootId)?.replies.push(node);
                return;
            }
            roots.push(node);
        });

        roots.forEach((root) => {
            root.replies.sort((left, right) => communicationTimeValue(right) - communicationTimeValue(left));
        });
        roots.sort((left, right) => {
            const leftLatest = Math.max(communicationTimeValue(left), ...left.replies.map((item) => communicationTimeValue(item)));
            const rightLatest = Math.max(communicationTimeValue(right), ...right.replies.map((item) => communicationTimeValue(item)));
            return rightLatest - leftLatest;
        });
        return roots;
    }

    function activeTaskHeadline(stageKey = '') {
        if (stageKey === 'requirement_capture') return localeText('等待填写需求', 'Waiting for Requirement');
        return localeText(`处理中：${stageLabel(stageKey)}`, `In Progress: ${stageLabel(stageKey)}`);
    }

    function currentTaskCardMarkup(detail = {}) {
        const activeStageKey = resolveDealCurrentStage(detail);
        const activeStage = STAGES.find((item) => item.key === activeStageKey) || STAGES[0];
        const activeIndex = (STAGE_INDEX[activeStageKey] ?? 0) + 1;
        const requirementLink = requirementLinkInfo(detail).url;

        let body = `
            <div class="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col gap-3">
                <p class="text-xs text-gray-400 leading-relaxed">${esc(tr('stageReadonly'))}</p>
                <div class="flex justify-end gap-2 mt-1 flex-wrap">
                    <button type="button" class="px-4 py-2 rounded-full border border-gray-600 text-gray-300 text-xs font-medium hover:bg-gray-800 transition-colors" data-sales-focus-composer>${esc(localeText('联系销售', 'Contact Sales'))}</button>
                    <button type="button" class="px-4 py-2 rounded-full border border-gray-700 text-gray-500 text-xs font-medium cursor-not-allowed" disabled>${esc(tr('actionNone'))}</button>
                </div>
            </div>
        `;

        if (activeStageKey === 'requirement_capture') {
            body = `
                <div class="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col gap-3">
                    <p class="text-xs text-gray-400 leading-relaxed">${esc(tr('stageRequirementLinkHint'))}</p>
                    <div class="flex justify-end gap-2 mt-1 flex-wrap">
                        <button type="button" class="px-4 py-2 rounded-full border border-gray-600 text-gray-300 text-xs font-medium hover:bg-gray-800 transition-colors" data-sales-focus-composer>${esc(localeText('联系销售', 'Contact Sales'))}</button>
                        ${requirementLink
                            ? `<a class="px-4 py-2 rounded-full bg-[#39b54a] text-black text-xs font-bold shadow-[0_0_15px_rgba(57,181,74,0.2)] hover:bg-[#2e9c3a] transition-all flex items-center gap-1.5" href="${esc(requirementLink)}" data-sales-open-requirement-link="task"><i class="fa-solid fa-link text-[12px]"></i><span>${esc(localeText('去填写表单', 'Open Form'))}</span></a>`
                            : `<button type="button" class="px-4 py-2 rounded-full border border-gray-700 text-gray-500 text-xs font-medium cursor-not-allowed" disabled>${esc(tr('stageRequirementLinkMissing'))}</button>`}
                    </div>
                </div>
            `;
        } else if (ACTIONABLE_STAGE_SET.has(activeStageKey)) {
            body = `
                <div class="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col gap-3">
                    ${stageConfirmationMarkup(activeStageKey, detail, true)}
                    <div class="flex justify-end gap-2 mt-1 flex-wrap">
                        <button type="button" class="px-4 py-2 rounded-full border border-gray-600 text-gray-300 text-xs font-medium hover:bg-gray-800 transition-colors" data-sales-focus-composer>${esc(localeText('联系销售', 'Contact Sales'))}</button>
                        <button type="button" class="px-4 py-2 rounded-full bg-[#39b54a] text-black text-xs font-bold shadow-[0_0_15px_rgba(57,181,74,0.2)] hover:bg-[#2e9c3a] transition-all" id="sales-stage-submit-confirmation" ${state.pendingStageSubmit ? 'disabled' : ''}>${esc(tr('submitConfirm'))}</button>
                    </div>
                </div>
            `;
        }

        return `
            <section class="bg-gradient-to-r from-[#1a2e1e] to-[#121212] border border-[#39b54a]/30 rounded-2xl p-4 relative shadow-md">
                <div class="flex items-start justify-between mb-4 gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="w-10 h-10 rounded-full bg-[#39b54a]/20 flex items-center justify-center flex-shrink-0">
                            <i class="fa-solid fa-clock text-[#39b54a]"></i>
                        </div>
                        <div class="min-w-0">
                            <h2 class="text-lg font-bold text-white mb-0.5">${esc(activeTaskHeadline(activeStageKey))}</h2>
                            <p class="text-xs text-[#39b54a]">${esc(localeText(`当前任务：${stageLabel(activeStage.key)} (${activeIndex}/${STAGES.length})`, `Current Task: ${stageLabel(activeStage.key)} (${activeIndex}/${STAGES.length})`))}</p>
                        </div>
                    </div>
                </div>
                ${body}
            </section>
        `;
    }

    function pipelineTabsMarkup(detail = {}) {
        const currentStageKey = resolveDealCurrentStage(detail);
        const selectedStageKey = resolveDisplayStage(detail);
        return `
            <div class="bg-[#0a0a0a] border-b border-gray-800 pt-3 pb-2 px-3 transition-all ${state.showFullMap ? '' : 'overflow-x-auto hide-scrollbar'}">
                <div class="flex gap-2 ${state.showFullMap ? 'flex-wrap' : 'items-center'}">
                    <div class="flex items-center gap-2 flex-shrink-0 mr-1 ${state.showFullMap ? 'w-full mb-2 justify-between border-b border-gray-800/50 pb-2' : ''}">
                        <span class="text-[10px] text-gray-500 whitespace-nowrap uppercase font-semibold">${esc(localeText(`全流程 (${STAGES.length}步)`, `Full Flow (${STAGES.length})`))}</span>
                        <button type="button" class="text-[#39b54a] text-[10px] bg-[#39b54a]/10 hover:bg-[#39b54a]/20 px-2 py-1 rounded flex items-center gap-1 transition-colors" data-sales-map-toggle>${esc(state.showFullMap ? localeText('收起导航', 'Collapse') : localeText('展开全景', 'Expand'))}</button>
                    </div>
                    ${STAGES.map((stage, index) => {
                        const status = stageStatusForKey(stage.key, currentStageKey, parseStageRecords(detail));
                        const selected = stage.key === selectedStageKey;
                        let styleClass = '';
                        let icon = `<span class="text-[10px] font-mono">${index + 1}.</span>`;
                        if (status === 'completed') {
                            styleClass = selected ? 'bg-[#39b54a]/20 text-[#39b54a] border-[#39b54a]/50' : 'bg-gray-800/50 text-gray-400 border-gray-800';
                            icon = `<i class="fa-solid fa-circle-check ${selected ? 'text-[#39b54a]' : 'text-gray-500'} text-[12px]"></i>`;
                        } else if (status === 'active') {
                            styleClass = selected ? 'bg-[#39b54a] text-black border-[#39b54a]' : 'bg-[#39b54a]/10 text-[#39b54a] border-[#39b54a]/30';
                            icon = `<i class="fa-solid fa-clock ${selected ? 'text-black' : 'text-[#39b54a]'} text-[12px]"></i>`;
                        } else {
                            styleClass = 'bg-transparent text-gray-600 border-transparent opacity-50 cursor-not-allowed';
                        }
                        return `
                            <button type="button" data-sales-stage-node="${esc(stage.key)}" data-stage-status="${esc(status)}" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all ${state.showFullMap ? 'mb-1' : 'flex-shrink-0'} ${styleClass}">
                                ${icon}
                                <span>${esc(stageLabel(stage.key))}</span>
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    function renderReferenceCommentThread(message = {}) {
        const replies = Array.isArray(message.replies) ? message.replies : [];
        return `
            <div class="py-4 flex gap-3 group">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shadow-sm ${text(message.actor_type) === 'customer' ? 'bg-[#1e4a25] text-[#39b54a] border border-[#39b54a]/30' : 'bg-gray-800 text-gray-300 border border-gray-700'}">
                        ${esc(communicationAvatar(message))}
                    </div>
                </div>
                <div class="flex-1 flex flex-col min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-gray-300 text-xs font-medium truncate">${esc(displayActorName(message.actor_label))}</span>
                        <span class="text-[9px] px-1 py-0.5 rounded-sm flex-shrink-0 leading-none ${text(message.actor_type) === 'customer' ? 'bg-[#39b54a]/20 text-[#39b54a]' : 'bg-gray-800 text-gray-400'}">${esc(communicationActorRole(message))}</span>
                    </div>
                    <div class="text-gray-200 text-sm mt-1 leading-relaxed whitespace-pre-wrap break-words">${esc(message.body)}</div>
                    <div class="flex items-center gap-3 mt-1.5">
                        <span class="text-gray-500 text-[10px]">${esc(communicationMeta(message))}</span>
                        <button type="button" data-sales-comment-reply="${esc(message.id)}" class="text-gray-500 text-[11px] font-medium hover:text-gray-200 transition-colors">${esc(tr('commentsReplyAction'))}</button>
                    </div>
                    ${replies.length ? `
                        <div class="mt-3 flex flex-col gap-3">
                            ${replies.map((reply) => `
                                <div class="flex gap-2">
                                    <div class="flex-shrink-0 mt-0.5">
                                        <div class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] ${text(reply.actor_type) === 'customer' ? 'bg-[#1e4a25] text-[#39b54a] border border-[#39b54a]/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}">
                                            ${esc(communicationAvatar(reply))}
                                        </div>
                                    </div>
                                    <div class="flex-1 flex flex-col min-w-0">
                                        <div class="text-gray-400 text-xs flex items-center flex-wrap gap-1">
                                            <span class="font-medium text-gray-300">${esc(displayActorName(reply.actor_label))}</span>
                                            <span class="text-[8px] px-1 py-[1px] rounded-sm leading-none ${text(reply.actor_type) === 'customer' ? 'bg-[#39b54a]/20 text-[#39b54a]' : 'bg-gray-800 text-gray-500'}">${esc(communicationActorRole(reply))}</span>
                                            ${text(reply.reply_to_id) && text(reply.reply_to_id) !== text(message.id)
                                                ? `<span class="ml-1 text-gray-500">${esc(localeText('回复', 'Reply'))} <span class="font-medium text-gray-400">@${esc(displayActorName(reply.reply_to_actor_label))}</span></span>`
                                                : ''}
                                        </div>
                                        <div class="text-gray-200 text-sm mt-0.5 leading-relaxed break-words whitespace-pre-wrap">${esc(reply.body)}</div>
                                        <div class="flex items-center gap-3 mt-1">
                                            <span class="text-gray-500 text-[10px]">${esc(communicationMeta(reply))}</span>
                                            <button type="button" data-sales-comment-reply="${esc(reply.id)}" class="text-gray-500 text-[10px] font-medium hover:text-gray-200 transition-colors">${esc(tr('commentsReplyAction'))}</button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    function commentsPanelMarkup(detail = {}) {
        const selectedStage = resolveDisplayStage(detail);
        const threads = buildCurrentStageThreads(detail);
        const selectedMessages = currentStageCommunications(detail);
        const replyTarget = communicationReplyTarget(detail);
        return `
            <section class="bg-[#121212] border border-gray-800 rounded-2xl overflow-hidden mt-1 shadow-md flex flex-col flex-1 min-h-0">
                ${pipelineTabsMarkup(detail)}
                <div class="p-3 px-4 border-b border-gray-800/50 bg-[#121212] z-10 flex justify-between items-center gap-3">
                    <div class="flex items-center gap-2 min-w-0">
                        <i class="fa-regular fa-message text-gray-400"></i>
                        <h3 class="text-sm font-bold text-gray-200 truncate"><span class="text-[#39b54a]">${esc(stageLabel(selectedStage))}</span> ${esc(localeText('沟通记录', 'Comments'))}</h3>
                    </div>
                    <span class="text-[10px] text-gray-500 whitespace-nowrap">${esc(localeText(`${selectedMessages.length} 条互动`, `${selectedMessages.length} interactions`))}</span>
                </div>
                <div id="sales-comment-scroll" class="sales-comment-scroll-region p-4 pb-28 sm:pb-24 overflow-y-auto custom-scrollbar">
                    <div class="divide-y divide-gray-800/50">
                        ${threads.length
                            ? threads.map((thread) => renderReferenceCommentThread(thread)).join('')
                            : `<div class="flex flex-col items-center justify-center py-10 text-gray-500"><i class="fa-regular fa-message text-3xl opacity-20 mb-2"></i><div class="text-xs">${esc(tr('commentsEmpty'))}</div></div>`}
                    </div>
                    <div class="sales-comment-scroll-indicator" aria-hidden="true">
                        <span id="sales-comment-scroll-thumb" class="sales-comment-scroll-thumb"></span>
                    </div>
                </div>
            </section>
            <div class="fixed bottom-0 left-0 right-0 bg-[#0f0f0f]/95 backdrop-blur-md border-t border-gray-800 p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] z-40 shadow-[0_-15px_30px_rgba(0,0,0,0.6)]">
                <div class="max-w-xl mx-auto">
                    <div class="bg-gray-900 border border-gray-700 rounded-2xl flex flex-col focus-within:border-[#39b54a] transition-colors overflow-hidden">
                        ${replyTarget
                            ? `
                                <div class="flex items-center justify-between bg-gray-800/60 px-3 py-1.5 border-b border-gray-800 gap-2">
                                    <span class="text-[11px] text-gray-400 flex items-center gap-1 min-w-0">${esc(tr('commentsReplying'))} <span class="text-[#39b54a] font-medium truncate">@${esc(displayActorName(replyTarget.actor_label))}</span></span>
                                    <button type="button" class="text-gray-500 hover:text-gray-300 p-0.5 transition-colors" data-sales-comment-reply-cancel="true"><i class="fa-solid fa-xmark text-[12px]"></i></button>
                                </div>
                            `
                            : ''}
                        <div class="flex gap-2 items-end px-2 py-2">
                            <textarea id="sales-comment-input" placeholder="${esc(replyTarget ? localeText('输入回复内容...', 'Write a reply...') : localeText(`在「${stageLabel(selectedStage)}」节点留言...`, `Leave a comment in ${stageLabel(selectedStage)}...`))}" class="flex-1 bg-transparent border-none px-2 py-1 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-0 resize-none min-h-[32px] max-h-[100px] hide-scrollbar" rows="1"></textarea>
                            <button type="button" id="sales-comment-submit" ${!text(state.selectedDealId) ? 'disabled' : ''} class="rounded-full p-2 flex items-center justify-center transition-all flex-shrink-0 bg-[#39b54a] text-black hover:bg-[#2e9c3a] disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed">
                                <i class="fa-solid fa-paper-plane text-[14px]"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function render() {
        const root = byId('sales-pipeline-root');
        if (!root) return;
        root.setAttribute('aria-busy', state.overviewLoading || state.detailLoading ? 'true' : 'false');
        normalizeMobileListState(false);

        if (state.overviewLoading && !state.loadedOnce) {
            root.innerHTML = `<div class="sales-loading"><i class="fa-solid fa-circle-notch fa-spin"></i><span>${esc(tr('loadingPipeline'))}</span></div>`;
            return;
        }

        if (!state.overview.length) {
            root.innerHTML = `<div class="sales-empty-card"><h3>${esc(trSafe('sales_pipeline', pipelineLabel()))}</h3><p>${esc(tr('unmatchedHint'))}</p></div>`;
            return;
        }

        const detail = state.detail || {};
        root.innerHTML = `
            <div class="h-full bg-[#050505] text-gray-200 font-sans flex flex-col relative min-h-0">
                <main class="sales-pipeline-main-shell flex-1 w-full max-w-xl mx-auto p-4 flex flex-col gap-4 relative pb-28 min-h-0 overflow-hidden">
                    <section class="mb-2">
                        <div class="text-[#39b54a] text-xs font-semibold mb-1 tracking-wide">${esc(pipelineLabel())}</div>
                        <h1 class="text-2xl font-bold text-white mb-2">${esc(localeText('客户交易流程', 'Customer Deal Flow'))}</h1>
                        <p class="text-xs text-gray-400 leading-relaxed">${esc(localeText('客户端里程碑都在此处处理。节点切换、沟通回复和当前任务提交统一在当前页面完成。', 'Customer-side milestones, discussions, and current-stage actions are all handled here.'))}</p>
                        <p class="mt-2 text-[11px] text-gray-500">${esc(text(detail.deal_title || detail.customer_company || state.selectedDealId, ''))}</p>
                    </section>
                    ${currentTaskCardMarkup(detail)}
                    ${commentsPanelMarkup(detail)}
                </main>
            </div>
        `;

        bindRenderedActions();
    }

    function collectRequirementPayload() {
        const payload = { ...(state.requirementDraft || {}) };
        document.querySelectorAll('[data-sales-req-field]').forEach((node) => {
            const key = text(node.dataset.salesReqField);
            if (!key) return;
            const value = text(node.value);
            payload[key] = key === 'requirement_type' ? requirementTypeValue(value) : value;
        });
        payload.answers = {
            contact_channel: 'account_portal',
            communication_note_draft: text(payload.note),
            allow_gas_source_report: allowGasSourceReport(payload),
            gas_source_report: gasReportFromDraft(payload),
        };
        return payload;
    }

    async function submitRequirement() {
        if ((!state.selectedDealId && !state.legacyEntry) || state.pendingReqSubmit) return;
        const payload = collectRequirementPayload();
        const requiredFields = ['requester_company', 'requester_name', 'requester_email', 'requester_phone', 'country'];
        const missing = requiredFields.find((key) => !text(payload[key]));
        if (missing) {
            showToast(tr('toastNeedFields'), 'error');
            return;
        }
        if (!isValidEmail(payload.requester_email)) {
            showToast(tr('toastInvalidEmail'), 'error');
            return;
        }
        if (!window.confirm(tr('confirmRequirement'))) return;

        state.pendingReqSubmit = true;
        render();
        try {
            if (state.legacyEntry?.kind === 'requirement' && text(state.selectedDealId) === 'legacy-public') {
                await rpc('submit_public_quote_requirement', {
                    req_slug: state.legacyEntry.slug,
                    req_token: state.legacyEntry.token,
                    payload,
                });
            } else {
                await rpc('submit_customer_requirement', {
                    target_deal_id: state.selectedDealId,
                    payload,
                });
            }
            state.requirementDraft = {};
            showToast(tr('toastSubmittedRequirement'));
            await reloadData();
        } catch (error) {
            showToast(error.message || tr('toastFailedRequirement'), 'error');
        } finally {
            state.pendingReqSubmit = false;
            render();
        }
    }

    async function submitStageConfirmation() {
        const detail = state.detail || {};
        const stageKey = resolveDealCurrentStage(detail);
        if (!ACTIONABLE_STAGE_SET.has(stageKey) || stageKey === 'requirement_capture') return;
        if ((!state.selectedDealId && !state.legacyEntry) || state.pendingStageSubmit) return;

        const checked = byId('sales-stage-confirm-checkbox')?.checked === true;
        if (!checked) {
            showToast(tr('toastNeedCheck'), 'error');
            return;
        }
        if (!window.confirm(tr('confirmStage'))) return;

        const note = text(byId('sales-stage-confirm-note')?.value);
        state.pendingStageSubmit = true;
        render();
        try {
            if (state.legacyEntry?.kind === 'stage' && text(state.selectedDealId) === 'legacy-public') {
                await rpc('submit_public_quote_stage_confirmation', {
                    stage_slug: state.legacyEntry.slug,
                    stage_token: state.legacyEntry.token,
                    payload: { note },
                });
            } else {
                await rpc('submit_customer_stage_confirmation', {
                    target_deal_id: state.selectedDealId,
                    target_stage_key: stageKey,
                    payload: { note },
                });
            }
            showToast(tr('toastSubmittedStage'));
            await reloadData();
        } catch (error) {
            showToast(error.message || tr('toastFailedStage'), 'error');
        } finally {
            state.pendingStageSubmit = false;
            render();
        }
    }

    async function submitCommunication() {
        const detail = state.detail || {};
        const targetStage = resolveDisplayStage(detail);
        const body = text(byId('sales-comment-input')?.value).trim();
        if (!body) {
            showToast(tr('commentsNeedBody'), 'error');
            return;
        }
        try {
            await rpc('add_customer_pipeline_comment', {
                target_deal_id: state.selectedDealId,
                target_stage_key: targetStage,
                comment_body: body,
                target_reply_to_id: text(state.commentReplyToId) || null,
            });
            state.commentReplyToId = '';
            showToast(tr('commentsPosted'));
            await reloadData();
        } catch (error) {
            showToast(error.message || tr('commentsPostFailed'), 'error');
        }
    }

    function bindRenderedActions() {
        document.querySelectorAll('[data-sales-req-field]').forEach((node) => {
            node.addEventListener('input', () => {
                const key = text(node.dataset.salesReqField);
                if (!key) return;
                if (key === 'requester_email') {
                    const valid = isValidEmail(node.value);
                    node.setCustomValidity(text(node.value) && !valid ? tr('toastInvalidEmail') : '');
                }
                state.requirementDraft = {
                    ...(state.requirementDraft || {}),
                    deal_id: text(state.requirementDraft.deal_id || state.selectedDealId),
                    [key]: text(node.value),
                };
            });
            node.addEventListener('change', () => {
                const key = text(node.dataset.salesReqField);
                if (!key) return;
                if (key === 'requester_email') {
                    const valid = isValidEmail(node.value);
                    node.setCustomValidity(text(node.value) && !valid ? tr('toastInvalidEmail') : '');
                    if (text(node.value) && !valid) {
                        node.reportValidity();
                    }
                }
                state.requirementDraft = {
                    ...(state.requirementDraft || {}),
                    deal_id: text(state.requirementDraft.deal_id || state.selectedDealId),
                    [key]: text(node.value),
                };
            });
        });

        byId('sales-gas-report-upload-trigger')?.addEventListener('click', () => {
            byId('sales-gas-report-upload')?.click();
        });

        byId('sales-gas-report-upload')?.addEventListener('change', async (event) => {
            const detail = state.detail || {};
            const file = event.target?.files?.[0];
            event.target.value = '';
            if (!file) return;
            showToast(tr('stageGasReportUploading'));
            try {
                const report = await uploadGasSourceReport(detail, file);
                state.requirementDraft = {
                    ...(state.requirementDraft || {}),
                    deal_id: text(state.requirementDraft.deal_id || state.selectedDealId),
                    gas_source_report: report,
                };
                render();
            } catch (error) {
                showToast(error.message || tr('stageGasReportUploadFailed'), 'error');
            }
        });

        document.querySelectorAll('[data-sales-deal]').forEach((button) => {
            button.addEventListener('click', async () => {
                const dealId = text(button.dataset.salesDeal);
                if (!dealId || dealId === state.selectedDealId) return;
                state.selectedDealId = dealId;
                state.selectedStage = '';
                state.commentReplyToId = '';
                state.requirementDraft = {};
                syncUrl();
                await loadDetail();
                requestAnimationFrame(() => scrollActiveDealCardIntoView(true));
            });
        });

        byId('sales-pipeline-root')?.querySelector('[data-sales-map-toggle]')?.addEventListener('click', () => {
            state.showFullMap = !state.showFullMap;
            render();
        });

        document.querySelectorAll('[data-sales-focus-composer]').forEach((button) => {
            button.addEventListener('click', () => {
                byId('sales-comment-input')?.focus();
            });
        });

        document.querySelectorAll('[data-sales-stage-node]').forEach((button) => {
            button.addEventListener('click', () => {
                const stageKey = text(button.dataset.salesStageNode);
                const stageStatus = text(button.dataset.stageStatus);
                if (!stageKey || STAGE_INDEX[stageKey] == null) return;
                if (stageStatus === 'pending') {
                    showToast(localeText(`「${stageLabel(stageKey)}」阶段尚未开始，暂无内容。`, `"${stageLabel(stageKey)}" has not started yet.`), 'error');
                    return;
                }
                state.selectedStage = stageKey;
                state.commentReplyToId = '';
                syncUrl();
                render();
            });
        });

        byId('sales-stage-submit-requirement')?.addEventListener('click', () => {
            void submitRequirement();
        });
        byId('sales-stage-submit-confirmation')?.addEventListener('click', () => {
            void submitStageConfirmation();
        });
        byId('sales-comment-submit')?.addEventListener('click', () => {
            void submitCommunication();
        });
        const commentInput = byId('sales-comment-input');
        const commentSubmit = byId('sales-comment-submit');
        const syncCommentSubmitState = () => {
            if (!commentSubmit) return;
            commentSubmit.disabled = !text(commentInput?.value).trim();
        };
        syncCommentSubmitState();
        commentInput?.addEventListener('input', () => {
            syncCommentSubmitState();
        });
        commentInput?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void submitCommunication();
            }
        });
        document.querySelectorAll('[data-sales-comment-reply]').forEach((button) => {
            button.addEventListener('click', () => {
                const nextId = text(button.dataset.salesCommentReply);
                state.commentReplyToId = state.commentReplyToId === nextId ? '' : nextId;
                render();
                requestAnimationFrame(() => byId('sales-comment-input')?.focus());
            });
        });
        document.querySelector('[data-sales-comment-reply-cancel]')?.addEventListener('click', () => {
            state.commentReplyToId = '';
            render();
        });

        const commentScroll = byId('sales-comment-scroll');
        const commentScrollThumb = byId('sales-comment-scroll-thumb');
        const syncCommentScrollIndicator = () => {
            if (!commentScroll || !commentScrollThumb) return;
            const { scrollHeight, clientHeight, scrollTop } = commentScroll;
            const maxScroll = Math.max(scrollHeight - clientHeight, 0);
            const hasOverflow = maxScroll > 4;
            commentScroll.dataset.scrollable = hasOverflow ? 'true' : 'false';
            if (!hasOverflow) {
                commentScrollThumb.style.height = '0px';
                commentScrollThumb.style.transform = 'translateY(0)';
                return;
            }
            const trackHeight = Math.max(clientHeight - 24, 0);
            const thumbHeight = Math.max((clientHeight / scrollHeight) * trackHeight, 36);
            const travel = Math.max(trackHeight - thumbHeight, 0);
            const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
            commentScrollThumb.style.height = `${thumbHeight}px`;
            commentScrollThumb.style.transform = `translateY(${progress * travel}px)`;
        };
        syncCommentScrollIndicator();
        commentScroll?.addEventListener('scroll', syncCommentScrollIndicator, { passive: true });
        window.addEventListener('resize', syncCommentScrollIndicator);
    }

    function overviewRowByDealId(dealId = '') {
        const target = text(dealId);
        if (!target) return null;
        return state.overview.find((item) => text(item.deal_id) === target) || null;
    }

    function buildDetailFromOverview(dealId = '') {
        const row = overviewRowByDealId(dealId);
        if (!row) return null;
        return {
            deal_id: text(row.deal_id),
            customer_id: '',
            customer_company: '',
            customer_email: '',
            deal_title: text(row.deal_title),
            current_stage: text(row.current_stage, 'requirement_capture'),
            deal_status: text(row.deal_status, 'active'),
            summary: text(row.summary),
            requirement: {},
            quote: {},
            stage_records: Array.isArray(row.stage_records) ? row.stage_records : [],
            activities: [],
        };
    }

    async function loadRequirementLinkFallback(dealId = '') {
        const targetDealId = text(dealId);
        if (!targetDealId || targetDealId === 'legacy-public') return {};

        try {
            const data = await rpc('get_customer_requirement_link', {
                target_deal_id: targetDealId,
            });
            const requirementRow = Array.isArray(data) ? data[0] : null;

            return {
                id: text(requirementRow?.requirement_id),
                public_slug: text(requirementRow?.public_slug),
                public_token: text(requirementRow?.public_token),
            };
        } catch (_error) {
            return {};
        }
    }

    async function resolveLegacyEntryFromUrl() {
        if (state.resolvedLegacyEntry) return;
        state.resolvedLegacyEntry = true;
        state.invalidEntry = false;
        let resolverUnavailable = false;

        const query = parseQuery();
        const deal = text(query.get('deal'));
        const stage = text(query.get('stage'));
        if (deal) {
            state.selectedDealId = deal;
            state.selectedStage = stage;
            return;
        }

        const reqSlug = text(query.get('req'));
        const reqToken = text(query.get('req_token')) || text(query.get('token'));
        const confirmSlug = text(query.get('confirm_stage')) || text(query.get('stage_slug'));
        const confirmToken = text(query.get('confirm_token')) || text(query.get('token'));
        const quoteSlug = text(query.get('quote'));
        const hasEntryParams = Boolean((reqSlug && reqToken) || (confirmSlug && confirmToken) || quoteSlug);

        try {
            if (reqSlug && reqToken) {
                const data = await rpc('resolve_customer_pipeline_entry', { entry_kind: 'requirement', slug: reqSlug, token: reqToken });
                const row = Array.isArray(data) ? data[0] : null;
                if (row?.deal_id) {
                    const publicRequirement = await rpc('get_public_quote_requirement', {
                        req_slug: reqSlug,
                        req_token: reqToken,
                    }).catch(() => []);
                    const requirementRow = Array.isArray(publicRequirement) ? publicRequirement[0] : null;
                    if (!requirementRow) {
                        state.invalidEntry = true;
                        return;
                    }
                    state.selectedDealId = text(row.deal_id);
                    state.selectedStage = text(row.stage_key, 'requirement_capture');
                    return;
                }
            }
            if (confirmSlug && confirmToken) {
                const data = await rpc('resolve_customer_pipeline_entry', { entry_kind: 'stage', slug: confirmSlug, token: confirmToken });
                const row = Array.isArray(data) ? data[0] : null;
                if (row?.deal_id) {
                    const publicStage = await rpc('get_public_quote_stage_confirmation', {
                        stage_slug: confirmSlug,
                        stage_token: confirmToken,
                    }).catch(() => []);
                    const stageRow = Array.isArray(publicStage) ? publicStage[0] : null;
                    if (!stageRow) {
                        state.invalidEntry = true;
                        return;
                    }
                    state.selectedDealId = text(row.deal_id);
                    state.selectedStage = text(row.stage_key);
                    return;
                }
            }
            if (quoteSlug) {
                const data = await rpc('resolve_customer_pipeline_entry', { entry_kind: 'quote', slug: quoteSlug, token: '' });
                const row = Array.isArray(data) ? data[0] : null;
                if (row?.deal_id) {
                    state.selectedDealId = text(row.deal_id);
                    state.selectedStage = text(row.stage_key);
                }
            }
        } catch (error) {
            if (!missingRpc(error, 'resolve_customer_pipeline_entry')) return;
            resolverUnavailable = true;
        }

        if (resolverUnavailable && reqSlug && reqToken) {
            state.legacyEntry = { kind: 'requirement', slug: reqSlug, token: reqToken };
            state.selectedDealId = 'legacy-public';
            state.selectedStage = 'requirement_capture';
            return;
        }
        if (resolverUnavailable && confirmSlug && confirmToken) {
            state.legacyEntry = { kind: 'stage', slug: confirmSlug, token: confirmToken };
            state.selectedDealId = 'legacy-public';
            state.selectedStage = 'quote_confirmed';
            return;
        }
        if (resolverUnavailable && quoteSlug) {
            state.legacyEntry = { kind: 'quote', slug: quoteSlug, token: '' };
            state.selectedDealId = 'legacy-public';
            state.selectedStage = '';
            return;
        }
        if (hasEntryParams) {
            state.invalidEntry = true;
            state.selectedDealId = '';
            state.selectedStage = '';
        }
    }

    async function loadOverview() {
        if (state.invalidEntry) {
            state.overview = [];
            state.loadedOnce = true;
            render();
            return;
        }
        state.overviewLoading = true;
        render();
        try {
            const data = await rpc('get_customer_pipeline_overview', {});
            state.overview = Array.isArray(data) ? data : [];
            state.loadedOnce = true;

            if (!state.selectedDealId || !state.overview.some((item) => text(item.deal_id) === text(state.selectedDealId))) {
                state.selectedDealId = text(state.overview[0]?.deal_id);
            }
        } catch (error) {
            if (state.legacyEntry && missingRpc(error, 'get_customer_pipeline_overview')) {
                const fallbackStage = state.selectedStage || (state.legacyEntry.kind === 'requirement' ? 'requirement_capture' : 'quote_confirmed');
                state.overview = [{
                    deal_id: 'legacy-public',
                    deal_title: tr('legacy_entry'),
                    current_stage: fallbackStage,
                    deal_status: 'active',
                    summary: tr('legacy_summary'),
                    next_action: '',
                    next_action_due_at: null,
                    updated_at: new Date().toISOString(),
                    stage_records: [],
                }];
                state.selectedDealId = 'legacy-public';
                state.loadedOnce = true;
            } else {
                state.overview = [];
                showToast(error.message || tr('toastFailedOverview'), 'error');
            }
        } finally {
            state.overviewLoading = false;
            render();
        }
    }

    async function loadDetail() {
        if (!state.selectedDealId) {
            state.detail = null;
            render();
            return;
        }
        state.detailLoading = true;
        render();
        try {
            let row = null;
            if (state.legacyEntry && text(state.selectedDealId) === 'legacy-public') {
                if (state.legacyEntry.kind === 'requirement') {
                    row = await loadLegacyRequirementDetail();
                } else if (state.legacyEntry.kind === 'stage') {
                    row = await loadLegacyStageConfirmationDetail();
                }
            } else {
                const data = await rpc('get_customer_pipeline_detail', { target_deal_id: state.selectedDealId });
                row = Array.isArray(data) ? data[0] : null;
            }
            let detailRow = row || null;
            if (detailRow && !requirementLinkInfo(detailRow).url) {
                const requirementFallback = await loadRequirementLinkFallback(text(detailRow.deal_id || state.selectedDealId));
                if (text(requirementFallback.public_slug) && text(requirementFallback.public_token)) {
                    detailRow = {
                        ...detailRow,
                        requirement: {
                            ...(detailRow.requirement && typeof detailRow.requirement === 'object' ? detailRow.requirement : {}),
                            ...requirementFallback,
                        },
                    };
                }
            }
            state.detail = detailRow;
            state.commentReplyToId = '';
            if (!state.selectedStage) state.selectedStage = text(detailRow?.current_stage, 'requirement_capture');
            syncUrl();
        } catch (error) {
            const message = text(error?.message);
            const fallbackRow = buildDetailFromOverview(state.selectedDealId);
            const canFallback = Boolean(
                fallbackRow
                && message
                && (
                    message.toLowerCase().includes('ambiguous')
                    || message.toLowerCase().includes('column reference')
                    || message.toLowerCase().includes('get_customer_pipeline_detail')
                )
            );
            if (canFallback) {
                const requirementFallback = await loadRequirementLinkFallback(state.selectedDealId);
                state.detail = {
                    ...fallbackRow,
                    requirement: requirementFallback,
                };
                if (!state.selectedStage) state.selectedStage = text(fallbackRow.current_stage, 'requirement_capture');
                syncUrl();
                showToast(tr('toastFallbackDetail'), 'error');
            } else {
                state.detail = null;
                showToast(error.message || tr('toastFailedDetail'), 'error');
            }
        } finally {
            state.detailLoading = false;
            render();
        }
    }

    async function reloadData() {
        await loadOverview();
        await loadDetail();
    }

    async function ensureLoaded() {
        if (state.overviewLoading || state.detailLoading) return;
        const user = await getSessionUser();
        if (!user) return;
        state.sessionUser = user;

        await resolveLegacyEntryFromUrl();
        await loadOverview();
        await loadDetail();
    }

    async function onTabActivated() {
        const salesTab = byId('tab-sales');
        if (salesTab && !salesTab.classList.contains('active')) return;
        await ensureLoaded();
    }

    function init() {
        if (state.initialized) return;
        state.initialized = true;
        normalizeMobileListState(true);

        document.addEventListener('gasgx-account-ready', () => {
            void onTabActivated();
        });

        document.addEventListener('gasgx:lang-changed', () => {
            render();
        });

        window.addEventListener('storage', (event) => {
            if (event.key === 'gasgx-lang' || event.key === 'gas_lang') {
                render();
            }
        });

        window.addEventListener('resize', () => {
            const before = state.mobileViewport;
            normalizeMobileListState(true);
            if (before !== state.mobileViewport) {
                render();
            }
        });

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                void onTabActivated();
            });
        } else {
            void onTabActivated();
        }
    }

    window.GasGxSalesPipelinePortal = {
        onTabActivated,
        refresh: reloadData,
    };

    init();
})(window, document);
