(function (window, document) {
    'use strict';

    const STAGES = [
        { key: 'customer_profile', label: '客户建档', customerAction: false },
        { key: 'requirement_capture', label: '获取需求', customerAction: true },
        { key: 'requirement_confirmed', label: '确认需求', customerAction: false },
        { key: 'quote_draft', label: '转入报价', customerAction: false },
        { key: 'quote_confirmed', label: '确认报价', customerAction: true },
        { key: 'contract_signed', label: '签约合同', customerAction: true },
        { key: 'deposit_paid', label: '定金付款', customerAction: false },
        { key: 'production_scheduled', label: '排产安排', customerAction: false, readonlyProgress: true },
        { key: 'factory_accepted', label: '出厂验收', customerAction: true },
        { key: 'balance_confirmed', label: '尾款确认', customerAction: false },
        { key: 'shipping_in_transit', label: '物流运输', customerAction: false },
        { key: 'deployment_completed', label: '到场部署', customerAction: false },
        { key: 'support_active', label: '运维支持', customerAction: false },
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
        selectedDealId: '',
        selectedStage: '',
        pendingReqSubmit: false,
        pendingStageSubmit: false,
        resolvedLegacyEntry: false,
        legacyEntry: null,
    };

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

    function byId(id) {
        return document.getElementById(id);
    }

    function formatDate(value) {
        if (!value) return '--';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '--';
        return date.toLocaleString();
    }

    function stageLabel(stageKey = '') {
        const target = STAGES.find((item) => item.key === text(stageKey));
        return target ? target.label : text(stageKey, '--');
    }

    function normalizeStatus(value = '') {
        const normalized = text(value, 'pending');
        if (['pending', 'active', 'completed', 'blocked'].includes(normalized)) return normalized;
        return 'pending';
    }

    function statusLabel(value = '') {
        const normalized = normalizeStatus(value);
        if (normalized === 'completed') return '已完成';
        if (normalized === 'active') return '进行中';
        if (normalized === 'blocked') return '阻塞';
        return '待开始';
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
            deal_title: text(row.title, '客户需求确认'),
            current_stage: currentStage,
            deal_status: 'active',
            summary: text(row.title),
            requirement: {
                id: text(row.id),
                status,
                title: text(row.title),
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
            deal_title: text(row.customer_name || row.title, '客户节点确认'),
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
                        <strong>${esc(item.label)}</strong>
                        <em>${esc(statusLabel(status))}</em>
                    </span>
                </button>
            `;
        }).join('');
    }

    function renderOverviewCards() {
        if (!state.overview.length) {
            return '<div class="sales-empty">当前账号还没有匹配的销售线。</div>';
        }
        return state.overview.map((item) => {
            const selected = text(item.deal_id) === text(state.selectedDealId);
            return `
                <button type="button" class="sales-deal-card ${selected ? 'is-active' : ''}" data-sales-deal="${esc(item.deal_id)}">
                    <strong>${esc(text(item.deal_title, item.deal_id))}</strong>
                    <span>${esc(stageLabel(item.current_stage))} · ${esc(text(item.deal_status, 'active'))}</span>
                    <em>${esc(text(item.summary, '暂无摘要'))}</em>
                </button>
            `;
        }).join('');
    }

    function requirementFormMarkup(detail, editable) {
        const req = detail.requirement && typeof detail.requirement === 'object' ? detail.requirement : {};
        return `
            <div class="sales-stage-form-grid">
                <label><span>需求标题</span><input class="field-input px-4 py-3" data-sales-req-field="title" value="${esc(text(req.title))}" ${editable ? '' : 'disabled'}></label>
                <label><span>需求类型</span><input class="field-input px-4 py-3" data-sales-req-field="requirement_type" value="${esc(text(req.requirement_type))}" placeholder="integrated_mining_power" ${editable ? '' : 'disabled'}></label>
                <label><span>公司</span><input class="field-input px-4 py-3" data-sales-req-field="requester_company" value="${esc(text(req.requester_company, detail.customer_company))}" ${editable ? '' : 'disabled'}></label>
                <label><span>联系人</span><input class="field-input px-4 py-3" data-sales-req-field="requester_name" value="${esc(text(req.requester_name))}" ${editable ? '' : 'disabled'}></label>
                <label><span>邮箱</span><input class="field-input px-4 py-3" data-sales-req-field="requester_email" value="${esc(text(req.requester_email, detail.customer_email))}" ${editable ? '' : 'disabled'}></label>
                <label><span>电话</span><input class="field-input px-4 py-3" data-sales-req-field="requester_phone" value="${esc(text(req.requester_phone))}" ${editable ? '' : 'disabled'}></label>
                <label><span>国家/地区</span><input class="field-input px-4 py-3" data-sales-req-field="country" value="${esc(text(req.country))}" ${editable ? '' : 'disabled'}></label>
                <label class="sales-span-2"><span>需求补充说明</span><textarea class="field-textarea px-4 py-3" rows="4" data-sales-req-field="note" placeholder="补充交付要求、预算和时间线" ${editable ? '' : 'disabled'}></textarea></label>
            </div>
        `;
    }

    function stageConfirmationMarkup(stageKey, detail, editable) {
        const recordMap = parseStageRecords(detail);
        const record = recordMap[stageKey] || {};
        const meta = record.meta && typeof record.meta === 'object' ? record.meta : {};
        return `
            <div class="sales-stage-confirm">
                <div class="sales-stage-note">${esc(text(meta.quote_terms || '请确认当前节点关键信息，提交后流程将进入下一节点。'))}</div>
                <label class="sales-check-line">
                    <input type="checkbox" id="sales-stage-confirm-checkbox" ${editable ? '' : 'disabled'}>
                    <span>我已确认当前节点信息，并同意推进到下一节点。</span>
                </label>
                <label><span>确认备注</span><textarea id="sales-stage-confirm-note" class="field-textarea px-4 py-3" rows="4" placeholder="可选：填写备注" ${editable ? '' : 'disabled'}></textarea></label>
            </div>
        `;
    }

    function productionReadonlyMarkup(detail) {
        const record = parseStageRecords(detail).production_scheduled || {};
        const meta = record.meta && typeof record.meta === 'object' ? record.meta : {};
        return `
            <div class="sales-stage-readonly-grid">
                <div><span>进度状态</span><strong>${esc(text(meta.production_schedule_status, 'pending'))}</strong></div>
                <div><span>预计完工</span><strong>${esc(text(meta.production_eta, '--'))}</strong></div>
                <div><span>工厂/产线</span><strong>${esc(text(meta.factory_name, '--'))}</strong></div>
                <div><span>批次</span><strong>${esc(text(meta.production_batch, '--'))}</strong></div>
                <div class="sales-span-2"><span>延期说明</span><strong>${esc(text(meta.production_delay_reason, '--'))}</strong></div>
            </div>
        `;
    }

    function stageActionArea(detail = {}) {
        const stageKey = resolveDisplayStage(detail);
        const stage = STAGES.find((item) => item.key === stageKey) || STAGES[0];
        const editable = isCurrentStageActionable(stageKey, detail);
        const dealCurrent = resolveDealCurrentStage(detail);

        let body = '<div class="sales-stage-note">该节点为只读节点，客户侧无需操作。</div>';
        let actions = '';

        if (stageKey === 'requirement_capture') {
            body = requirementFormMarkup(detail, editable);
            actions = editable
                ? `<button type="button" class="rounded-2xl bg-gas-green px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black" id="sales-stage-submit-requirement" ${state.pendingReqSubmit ? 'disabled' : ''}>提交需求</button>`
                : '';
        } else if (ACTIONABLE_STAGE_SET.has(stageKey)) {
            body = stageConfirmationMarkup(stageKey, detail, editable);
            actions = editable
                ? `<button type="button" class="rounded-2xl bg-gas-green px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black" id="sales-stage-submit-confirmation" ${state.pendingStageSubmit ? 'disabled' : ''}>确认并推进</button>`
                : '';
        } else if (stageKey === 'production_scheduled') {
            body = productionReadonlyMarkup(detail);
        }

        if (stageKey !== dealCurrent) {
            actions = '';
            body = `
                <div class="sales-stage-note">
                    当前查看的是历史/未来节点。仅当流程到达「${esc(stageLabel(dealCurrent))}」时才允许客户提交动作。
                </div>
                ${body}
            `;
        }

        const visibilityHint = stage.customerAction
            ? '客户动作节点：提交后会同步推进下一节点。'
            : stage.readonlyProgress
                ? '只读节点：展示交付进度，不提供提交按钮。'
                : '系统节点：仅展示状态。';

        return `
            <section class="sales-stage-card">
                <div class="sales-stage-head">
                    <div>
                        <div class="sales-kicker">当前节点</div>
                        <h3>${esc(stage.label)}</h3>
                        <p>${esc(visibilityHint)}</p>
                    </div>
                    <span class="sales-stage-pill ${statusClass(stageStatusForKey(stage.key, resolveDealCurrentStage(detail), parseStageRecords(detail)))}">${esc(statusLabel(stageStatusForKey(stage.key, resolveDealCurrentStage(detail), parseStageRecords(detail))))}</span>
                </div>
                ${body}
                <div class="sales-action-bar">
                    <span>关键动作执行前会弹窗确认。</span>
                    <div class="sales-action-buttons">${actions || '<button type="button" class="rounded-2xl border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-gray-400" disabled>当前无需操作</button>'}</div>
                </div>
            </section>
        `;
    }

    function activitiesMarkup(detail = {}) {
        const list = Array.isArray(detail.activities) ? detail.activities : [];
        if (!list.length) return '<div class="sales-empty">暂无客户侧活动记录。</div>';
        return list.slice(0, 30).map((item) => `
            <article class="sales-activity-item">
                <div>
                    <strong>${esc(text(item.action_label, '--'))}</strong>
                    <span>${esc(text(item.summary, ''))}</span>
                </div>
                <em>${esc(formatDate(item.occurred_at))}</em>
            </article>
        `).join('');
    }

    function render() {
        const root = byId('sales-pipeline-root');
        if (!root) return;

        if (state.overviewLoading && !state.loadedOnce) {
            root.innerHTML = '<div class="sales-loading"><i class="fa-solid fa-circle-notch fa-spin"></i><span>正在加载销售流水线...</span></div>';
            return;
        }

        if (!state.overview.length) {
            root.innerHTML = '<div class="sales-empty-card"><h3>Sales Pipeline</h3><p>当前账号还未匹配客户销售线，请联系销售同事绑定客户邮箱。</p></div>';
            return;
        }

        const detail = state.detail || {};
        root.innerHTML = `
            <div class="sales-main-grid">
                <aside class="sales-deal-list">
                    <div class="sales-list-head">
                        <strong>销售线列表</strong>
                        <span>${state.overview.length} 条</span>
                    </div>
                    <div class="sales-list-scroll">${renderOverviewCards()}</div>
                </aside>
                <section class="sales-detail">
                    <div class="sales-detail-head">
                        <div>
                            <div class="sales-kicker">Sales Pipeline</div>
                            <h2>${esc(text(detail.deal_title, '未命名销售线'))}</h2>
                            <p>${esc(text(detail.summary, '客户节点确认统一在用户中心执行。'))}</p>
                        </div>
                    </div>
                    <div class="sales-timeline">${renderTimeline(detail)}</div>
                    ${stageActionArea(detail)}
                    <section class="sales-stage-card">
                        <div class="sales-stage-head">
                            <div>
                                <div class="sales-kicker">客户活动</div>
                                <h3>对接记录</h3>
                                <p>仅展示客户可见轨迹，不包含内部沟通草稿。</p>
                            </div>
                        </div>
                        <div class="sales-activity-list">${activitiesMarkup(detail)}</div>
                    </section>
                </section>
            </div>
        `;

        bindRenderedActions();
    }

    function collectRequirementPayload() {
        const payload = {};
        document.querySelectorAll('[data-sales-req-field]').forEach((node) => {
            const key = text(node.dataset.salesReqField);
            if (!key) return;
            payload[key] = text(node.value);
        });
        payload.answers = {
            contact_channel: 'account_portal',
            communication_note_draft: text(payload.note),
        };
        return payload;
    }

    async function submitRequirement() {
        if ((!state.selectedDealId && !state.legacyEntry) || state.pendingReqSubmit) return;
        const payload = collectRequirementPayload();
        const requiredFields = ['requester_company', 'requester_name', 'requester_email', 'requester_phone', 'country'];
        const missing = requiredFields.find((key) => !text(payload[key]));
        if (missing) {
            showToast('请先完整填写客户需求核心字段。', 'error');
            return;
        }
        if (!window.confirm('确认提交需求并进入下一节点吗？')) return;

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
            showToast('需求已提交，流程已推进。');
            await reloadData();
        } catch (error) {
            showToast(error.message || '提交需求失败。', 'error');
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
            showToast('请先勾选确认后再提交。', 'error');
            return;
        }
        if (!window.confirm('确认提交并推进到下一节点吗？')) return;

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
            showToast('节点确认已提交。');
            await reloadData();
        } catch (error) {
            showToast(error.message || '节点确认提交失败。', 'error');
        } finally {
            state.pendingStageSubmit = false;
            render();
        }
    }

    function bindRenderedActions() {
        document.querySelectorAll('[data-sales-deal]').forEach((button) => {
            button.addEventListener('click', async () => {
                const dealId = text(button.dataset.salesDeal);
                if (!dealId || dealId === state.selectedDealId) return;
                state.selectedDealId = dealId;
                state.selectedStage = '';
                syncUrl();
                await loadDetail();
            });
        });

        document.querySelectorAll('[data-sales-stage-node]').forEach((button) => {
            button.addEventListener('click', () => {
                const stageKey = text(button.dataset.salesStageNode);
                if (!stageKey || STAGE_INDEX[stageKey] == null) return;
                state.selectedStage = stageKey;
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

    async function resolveLegacyEntryFromUrl() {
        if (state.resolvedLegacyEntry) return;
        state.resolvedLegacyEntry = true;

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

        try {
            if (reqSlug && reqToken) {
                const data = await rpc('resolve_customer_pipeline_entry', { entry_kind: 'requirement', slug: reqSlug, token: reqToken });
                const row = Array.isArray(data) ? data[0] : null;
                if (row?.deal_id) {
                    state.selectedDealId = text(row.deal_id);
                    state.selectedStage = text(row.stage_key, 'requirement_capture');
                    return;
                }
            }
            if (confirmSlug && confirmToken) {
                const data = await rpc('resolve_customer_pipeline_entry', { entry_kind: 'stage', slug: confirmSlug, token: confirmToken });
                const row = Array.isArray(data) ? data[0] : null;
                if (row?.deal_id) {
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
        }

        if (reqSlug && reqToken) {
            state.legacyEntry = { kind: 'requirement', slug: reqSlug, token: reqToken };
            state.selectedDealId = 'legacy-public';
            state.selectedStage = 'requirement_capture';
            return;
        }
        if (confirmSlug && confirmToken) {
            state.legacyEntry = { kind: 'stage', slug: confirmSlug, token: confirmToken };
            state.selectedDealId = 'legacy-public';
            state.selectedStage = 'quote_confirmed';
            return;
        }
        if (quoteSlug) {
            state.legacyEntry = { kind: 'quote', slug: quoteSlug, token: '' };
            state.selectedDealId = 'legacy-public';
            state.selectedStage = '';
        }
    }

    async function loadOverview() {
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
                    deal_title: 'Legacy Entry',
                    current_stage: fallbackStage,
                    deal_status: 'active',
                    summary: '从历史公开链接进入的客户节点',
                    next_action: '',
                    next_action_due_at: null,
                    updated_at: new Date().toISOString(),
                    stage_records: [],
                }];
                state.selectedDealId = 'legacy-public';
                state.loadedOnce = true;
            } else {
                state.overview = [];
                showToast(error.message || '加载销售流水线失败。', 'error');
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
            state.detail = row || null;
            if (!state.selectedStage) state.selectedStage = text(row?.current_stage, 'requirement_capture');
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
                state.detail = fallbackRow;
                if (!state.selectedStage) state.selectedStage = text(fallbackRow.current_stage, 'requirement_capture');
                syncUrl();
                showToast('详情接口临时不可用，已切换到兼容模式继续处理流程。', 'error');
            } else {
                state.detail = null;
                showToast(error.message || '加载销售线详情失败。', 'error');
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

        await resolveLegacyEntryFromUrl();
        await loadOverview();
        await loadDetail();
    }

    async function onTabActivated() {
        const salesTab = byId('tab-sales');
        if (!salesTab?.classList.contains('active')) return;
        await ensureLoaded();
    }

    function init() {
        if (state.initialized) return;
        state.initialized = true;

        document.addEventListener('gasgx-account-ready', () => {
            void onTabActivated();
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
