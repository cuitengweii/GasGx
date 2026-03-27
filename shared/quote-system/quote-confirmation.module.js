const SUPABASE_URL = window.AMS_SUPABASE_URL || 'https://mkpcliytqudclkwtewru.supabase.co';
const SUPABASE_KEY = window.AMS_SUPABASE_KEY || 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';

const params = new URL(window.location.href).searchParams;

const STAGE_CONFIG = Object.freeze({
    quote_confirmed: {
        title: '客户报价确认单',
        badge: 'QUOTE CONFIRM',
        summary: '请确认当前报价版本、关键条款和交付边界。提交后 GasGx 会自动进入签约合同阶段。',
        confirmLabel: '我已确认当前报价、商务条款和交付边界，可进入合同阶段',
        noteLabel: '客户确认备注',
        notePlaceholder: '如对价格、配置、付款条款或交付周期有补充说明，请写在这里。',
    },
    contract_signed: {
        title: '客户合同确认单',
        badge: 'CONTRACT CONFIRM',
        summary: '请确认最终合同版本已无误。提交后 GasGx 会自动进入定金付款阶段。',
        confirmLabel: '我已确认最终合同版本，可进入定金付款阶段',
        noteLabel: '合同确认备注',
        notePlaceholder: '如有合同版本说明、回传时间或特殊条款，请写在这里。',
    },
    factory_accepted: {
        title: '客户出厂验收确认单',
        badge: 'FACTORY ACCEPTANCE',
        summary: '请确认本次出厂验收已经完成。提交后 GasGx 会自动进入尾款确认阶段。',
        confirmLabel: '我已完成本次出厂验收确认，可进入尾款确认阶段',
        noteLabel: '验收确认备注',
        notePlaceholder: '如有遗留问题、整改点或纸质验收单说明，请写在这里。',
        checks: [
            '外观与铭牌信息已核对',
            '核心设备数量与配置已核对',
            '关键功能与试运行结果已确认',
            '需要留存的纸质或图片验收单已准备',
        ],
    },
    production_scheduled: {
        title: '客户生产进度页',
        badge: 'PRODUCTION PROGRESS',
        summary: '该页面会持续同步销售与工厂更新的生产子流水线，客户可随时查看当前进度。',
        readonly: true,
    },
});

const PRODUCTION_STEPS = Object.freeze([
    { key: 'production_step_plan', label: '排程确认' },
    { key: 'production_step_material', label: '物料齐套' },
    { key: 'production_step_assembly', label: '产线组装' },
    { key: 'production_step_test', label: '联调测试' },
    { key: 'production_step_ready', label: '待验收' },
]);

const state = {
    loading: true,
    error: '',
    submitting: false,
    payload: null,
    note: '',
    confirmed: false,
    checklist: {},
    submitted: false,
    result: null,
};

function text(value = '', fallback = '') {
    const raw = value == null ? '' : String(value);
    const normalized = raw.trim();
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

function getClient() {
    if (!window.supabase?.createClient) return null;
    if (!window.__gasgxPublicStageConfirmClient) {
        window.__gasgxPublicStageConfirmClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
    }
    return window.__gasgxPublicStageConfirmClient;
}

function stageConfig() {
    return STAGE_CONFIG[text(state.payload?.stage_key)] || STAGE_CONFIG.quote_confirmed;
}

function stageMeta(payload = {}, key = '', fallback = '') {
    const meta = payload?.meta && typeof payload.meta === 'object' ? payload.meta : {};
    return text(meta[key], fallback);
}

function quoteViewUrl(publicSlug = '') {
    if (!text(publicSlug)) return '';
    const url = new URL('/quote/view.html', window.location.origin);
    url.searchParams.set('quote', text(publicSlug));
    return url.toString();
}

function productionStatusLabel(value = '') {
    const normalized = text(value, 'pending');
    if (normalized === 'completed') return '已完成';
    if (normalized === 'in_progress') return '进行中';
    if (normalized === 'delayed') return '延误';
    return '待开始';
}

function productionStatusClass(value = '') {
    const normalized = text(value, 'pending');
    if (normalized === 'completed') return 'is-completed';
    if (normalized === 'in_progress') return 'is-active';
    if (normalized === 'delayed') return 'is-delayed';
    return 'is-pending';
}

function renderError(message = '') {
    const root = byId('stage-confirmation-app');
    if (!root) return;
    root.innerHTML = `
        <section class="requirement-card">
            <div class="requirement-kicker">LINK ERROR</div>
            <h1 class="requirement-title">无法打开这份确认页</h1>
            <p class="requirement-subtitle">${esc(message || '当前链接无效、已过期，或对应节点不可用。')}</p>
        </section>
    `;
}

function renderProductionProgress(payload = {}) {
    const root = byId('stage-confirmation-app');
    if (!root) return;
    const quoteUrl = quoteViewUrl(payload.quote_public_slug);
    const scheduleStatus = stageMeta(payload, 'production_schedule_status', 'pending');
    const scheduleEta = stageMeta(payload, 'production_eta', '--');
    const factoryName = stageMeta(payload, 'factory_name', '--');
    const batch = stageMeta(payload, 'production_batch', '--');
    const delayReason = stageMeta(payload, 'production_delay_reason');

    root.innerHTML = `
        <section class="requirement-card">
            <div class="requirement-hero">
                <div class="requirement-kicker">PRODUCTION PROGRESS</div>
                <h1 class="requirement-title">客户生产进度页</h1>
                <p class="requirement-subtitle">本页与销售端“排产安排”中的生产子流水线实时联动。</p>
            </div>
            <div class="requirement-meta-grid">
                <div class="requirement-stat-card">
                    <span>客户</span>
                    <strong>${esc(text(payload.customer_name, '--'))}</strong>
                </div>
                <div class="requirement-stat-card">
                    <span>销售流程</span>
                    <strong>${esc(text(payload.deal_title, '--'))}</strong>
                </div>
                <div class="requirement-stat-card">
                    <span>工厂 / 产线</span>
                    <strong>${esc(factoryName)}</strong>
                </div>
                <div class="requirement-stat-card">
                    <span>预计完工</span>
                    <strong>${esc(scheduleEta)}</strong>
                </div>
            </div>
            <div class="requirement-inline-banner">
                <div>
                    <strong>工期状态</strong>
                    <p>当前工期状态：${esc(productionStatusLabel(scheduleStatus))}；批次：${esc(batch)}</p>
                </div>
                ${quoteUrl ? `
                    <a class="btn-outline px-4 py-2 inline-flex items-center gap-2" href="${esc(quoteUrl)}" target="_blank" rel="noopener">
                        <i class="fa-solid fa-file-invoice-dollar"></i>
                        <span>查看报价单</span>
                    </a>
                ` : ''}
            </div>
            ${delayReason ? `
                <div class="requirement-field">
                    <span>延误说明</span>
                    <div class="requirement-static-note">${esc(delayReason)}</div>
                </div>
            ` : ''}
            <div class="quote-production-track">
                ${PRODUCTION_STEPS.map((step, index) => {
        const status = stageMeta(payload, `${step.key}_status`, 'pending');
        const date = stageMeta(payload, `${step.key}_date`, '--');
        const note = stageMeta(payload, `${step.key}_note`, '--');
        return `
                        <article class="quote-production-step">
                            <div class="quote-production-step__head">
                                <strong>${esc(`${index + 1}. ${step.label}`)}</strong>
                                <span class="quote-production-step__status ${productionStatusClass(status)}">${esc(productionStatusLabel(status))}</span>
                            </div>
                            <div class="quote-production-step__meta">
                                <span>更新时间：${esc(date)}</span>
                                <span>阶段备注：${esc(note)}</span>
                            </div>
                        </article>
                    `;
    }).join('')}
            </div>
        </section>
    `;
}

function renderApp() {
    const root = byId('stage-confirmation-app');
    if (!root) return;
    if (state.loading) return;
    if (state.error) {
        renderError(state.error);
        return;
    }

    const payload = state.payload || {};
    if (text(payload.stage_key) === 'production_scheduled') {
        renderProductionProgress(payload);
        return;
    }

    const config = stageConfig();
    const quoteUrl = quoteViewUrl(payload.quote_public_slug);
    const checklist = Array.isArray(config.checks) ? config.checks : [];
    const checklistMarkup = checklist.length
        ? `
            <div class="requirement-card">
                <div class="requirement-section-head">
                    <div>
                        <h2>验收检查项</h2>
                        <p>请逐项确认完成后再提交最终验收结果。</p>
                    </div>
                </div>
                <div class="requirement-choice-grid">
                    ${checklist.map((item, index) => `
                        <label class="requirement-choice-chip ${state.checklist[index] ? 'is-active' : ''}">
                            <input type="checkbox" data-check-index="${index}" ${state.checklist[index] ? 'checked' : ''}>
                            <span>${esc(item)}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `
        : '';

    root.innerHTML = `
        <section class="requirement-card">
            <div class="requirement-hero">
                <div class="requirement-kicker">${esc(config.badge)}</div>
                <h1 class="requirement-title">${esc(config.title)}</h1>
                <p class="requirement-subtitle">${esc(config.summary)}</p>
            </div>
            <div class="requirement-meta-grid">
                <div class="requirement-stat-card">
                    <span>客户</span>
                    <strong>${esc(text(payload.customer_name, '--'))}</strong>
                </div>
                <div class="requirement-stat-card">
                    <span>客户公司</span>
                    <strong>${esc(text(payload.customer_company, '--'))}</strong>
                </div>
                <div class="requirement-stat-card">
                    <span>销售流程</span>
                    <strong>${esc(text(payload.deal_title, '--'))}</strong>
                </div>
                <div class="requirement-stat-card">
                    <span>当前节点</span>
                    <strong>${esc(text(payload.stage_label, '--'))}</strong>
                </div>
            </div>
            ${quoteUrl ? `
                <div class="requirement-inline-banner">
                    <div>
                        <strong>关联报价单</strong>
                        <p>如需回看最终报价版本，请先打开报价单后再回来提交确认。</p>
                    </div>
                    <a class="btn-outline px-4 py-2 inline-flex items-center gap-2" href="${esc(quoteUrl)}" target="_blank" rel="noopener">
                        <i class="fa-solid fa-file-invoice-dollar"></i>
                        <span>查看报价单</span>
                    </a>
                </div>
            ` : ''}
        </section>

        <section class="requirement-card">
            <div class="requirement-section-head">
                <div>
                    <h2>确认内容</h2>
                    <p>提交后，GasGx 销售后台会自动推进到下一节点，并保留本次确认记录。</p>
                </div>
            </div>
            <div class="requirement-field">
                <span>当前阶段关键说明</span>
                <div class="requirement-static-note">${esc(text(payload.meta?.quote_terms || payload.meta?.fat_summary || payload.meta?.contract_archive_note || payload.meta?.contract_review_result, '请按本节点内容确认。'))}</div>
            </div>
            <label class="requirement-confirm">
                <input id="stage-confirmation-checkbox" type="checkbox" ${state.confirmed ? 'checked' : ''}>
                <span>${esc(config.confirmLabel)}</span>
            </label>
            <label class="requirement-field">
                <span>${esc(config.noteLabel)}</span>
                <textarea id="stage-confirmation-note" class="share-input" rows="5" placeholder="${esc(config.notePlaceholder)}">${esc(state.note)}</textarea>
            </label>
            ${checklistMarkup}
            <div class="requirement-submit-panel">
                <div class="requirement-submit-note">
                    <strong>提交后将自动推进流程</strong>
                    <p>GasGx 会把本次客户确认结果写入后台节点记录，并立即进入下一阶段。</p>
                </div>
                <button id="stage-confirmation-submit" type="button" class="btn-glow px-6 py-3 inline-flex items-center gap-2" ${state.submitting || state.submitted ? 'disabled' : ''}>
                    <i class="fa-solid fa-paper-plane"></i>
                    <span>${state.submitted ? '已提交' : state.submitting ? '提交中...' : '提交确认'}</span>
                </button>
            </div>
            <div id="stage-confirmation-status" class="requirement-submit-status ${state.result?.error ? 'is-error' : ''}">
                ${esc(text(state.result?.message))}
            </div>
        </section>
    `;

    byId('stage-confirmation-checkbox')?.addEventListener('change', (event) => {
        state.confirmed = !!event.target?.checked;
    });
    byId('stage-confirmation-note')?.addEventListener('input', (event) => {
        state.note = event.target?.value || '';
    });
    document.querySelectorAll('[data-check-index]').forEach((node) => {
        node.addEventListener('change', (event) => {
            state.checklist[event.currentTarget.dataset.checkIndex] = !!event.currentTarget.checked;
            renderApp();
        });
    });
    byId('stage-confirmation-submit')?.addEventListener('click', () => {
        void submitConfirmation();
    });
}

async function fetchPayload() {
    const stage = text(params.get('stage'));
    const token = text(params.get('token'));
    if (!stage || !token) throw new Error('缺少 stage 或 token，无法打开确认页。');

    const client = getClient();
    if (!client) throw new Error('Supabase client is unavailable.');

    const { data, error } = await client.rpc('get_public_quote_stage_confirmation', {
        stage_slug: stage,
        stage_token: token,
    });
    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : null;
    if (!row) throw new Error('当前确认页不存在或已失效。');
    state.payload = row;

    if (text(row.stage_status) === 'completed' || row.completed_at) {
        state.submitted = true;
        state.confirmed = true;
        state.result = {
            error: false,
            message: '这份确认单已经提交，无需重复操作。',
        };
    }
}

async function submitConfirmation() {
    const config = stageConfig();
    if (config.readonly) return;

    if (!state.confirmed) {
        state.result = { error: true, message: '请先勾选确认，再提交。' };
        renderApp();
        byId('stage-confirmation-checkbox')?.focus();
        return;
    }

    if (Array.isArray(config.checks) && config.checks.some((_item, index) => !state.checklist[index])) {
        state.result = { error: true, message: '请先完成所有验收检查项，再提交确认。' };
        renderApp();
        const firstUnchecked = document.querySelector('[data-check-index]:not(:checked)');
        firstUnchecked?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstUnchecked?.focus?.({ preventScroll: true });
        return;
    }

    state.submitting = true;
    state.result = { error: false, message: '' };
    renderApp();

    try {
        const client = getClient();
        if (!client) throw new Error('Supabase client is unavailable.');

        const { data, error } = await client.rpc('submit_public_quote_stage_confirmation', {
            stage_slug: text(params.get('stage')),
            stage_token: text(params.get('token')),
            payload: {
                note: state.note,
                checklist: state.checklist,
            },
        });
        if (error) throw error;

        const row = Array.isArray(data) ? data[0] : null;
        state.submitted = true;
        state.result = {
            error: false,
            message: `提交成功，GasGx 已收到确认结果，并会自动进入下一阶段：${text(row?.next_stage, '--')}。`,
        };
    } catch (error) {
        state.result = {
            error: true,
            message: text(error?.message, '提交失败，请稍后重试。'),
        };
    } finally {
        state.submitting = false;
        renderApp();
    }
}

async function init() {
    try {
        state.loading = true;
        renderApp();
        await fetchPayload();
        state.loading = false;
        renderApp();
    } catch (error) {
        state.loading = false;
        state.error = text(error?.message, '当前确认页无法打开。');
        renderApp();
    }
}

void init();
