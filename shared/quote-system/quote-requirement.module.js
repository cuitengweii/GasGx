const SUPABASE_URL = window.AMS_SUPABASE_URL || 'https://mkpcliytqudclkwtewru.supabase.co';
const SUPABASE_KEY = window.AMS_SUPABASE_KEY || 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';

const REQUIREMENT_TYPE_OPTIONS = Object.freeze([
    { value: 'integrated_mining_power', label: '矿机 + 供电一体化' },
    { value: 'miner_only', label: '仅矿机需求' },
    { value: 'power_only', label: '仅供电 / 发电需求' },
    { value: 'unclear', label: '需要方案推荐' },
]);

const REQUIREMENT_SELECT_OPTIONS = Object.freeze({
    deployment_mode: [
        { value: 'new_site', label: '新建站点' },
        { value: 'existing_site_upgrade', label: '已有站点扩容' },
        { value: 'mobile_container', label: '移动 / 集装箱方案' },
        { value: 'unknown', label: '待确认' },
    ],
    miner_hashrate_band: [
        { value: 'under_150t', label: '150T 以下' },
        { value: '150t_200t', label: '150T - 200T' },
        { value: '200t_300t', label: '200T - 300T' },
        { value: 'over_300t', label: '300T 以上' },
        { value: 'need_recommendation', label: '需要推荐' },
    ],
    miner_power_band: [
        { value: 'under_3kw', label: '3kW 以下' },
        { value: '3kw_4kw', label: '3kW - 4kW' },
        { value: '4kw_5_5kw', label: '4kW - 5.5kW' },
        { value: 'over_5_5kw', label: '5.5kW 以上' },
        { value: 'need_recommendation', label: '需要推荐' },
    ],
    miner_quantity_band: [
        { value: '1_10', label: '1 - 10 台' },
        { value: '10_50', label: '10 - 50 台' },
        { value: '50_200', label: '50 - 200 台' },
        { value: '200_plus', label: '200 台以上' },
        { value: 'unknown', label: '待确认' },
    ],
    power_capacity_band: [
        { value: 'under_100kw', label: '100kW 以下' },
        { value: '100_500kw', label: '100kW - 500kW' },
        { value: '500kw_1mw', label: '500kW - 1MW' },
        { value: '1mw_5mw', label: '1MW - 5MW' },
        { value: 'over_5mw', label: '5MW 以上' },
        { value: 'unknown', label: '待确认' },
    ],
    voltage_frequency: [
        { value: '400v_50hz', label: '400V / 50Hz' },
        { value: '415v_50hz', label: '415V / 50Hz' },
        { value: '480v_60hz', label: '480V / 60Hz' },
        { value: 'custom', label: '其他 / 待确认' },
    ],
    container_preference: [
        { value: 'integrated_container', label: '整柜一体化' },
        { value: 'rack_only', label: '仅机架 / 机位' },
        { value: 'site_buildout', label: '场站部署' },
        { value: 'need_recommendation', label: '需要推荐' },
    ],
    silent_requirement: [
        { value: 'standard', label: '常规即可' },
        { value: 'low_noise', label: '低噪要求' },
        { value: 'ultra_low_noise', label: '极低噪要求' },
        { value: 'unknown', label: '待确认' },
    ],
    budget_band: [
        { value: 'need_recommendation', label: '先看推荐方案' },
        { value: '150k_250k_per_mw', label: '15万 - 25万 USD / MW' },
        { value: '250k_400k_per_mw', label: '25万 - 40万 USD / MW' },
        { value: '400k_600k_per_mw', label: '40万 - 60万 USD / MW' },
        { value: '600k_800k_per_mw', label: '60万 - 80万 USD / MW' },
    ],
    timeline_band: [
        { value: 'urgent', label: '尽快' },
        { value: 'within_1_month', label: '1 个月内' },
        { value: '1_3_months', label: '1 - 3 个月' },
        { value: '3_6_months', label: '3 - 6 个月' },
        { value: 'unknown', label: '待确认' },
    ],
});

const REQUIREMENT_MULTI_OPTIONS = Object.freeze({
    miner_brands: [
        { value: 'bitmain', label: 'Bitmain / ANTMINER（比特大陆）' },
        { value: 'microbt', label: 'MicroBT / WhatsMiner（比特微）' },
        { value: 'canaan', label: 'Canaan / Avalon Miner（嘉楠）' },
        { value: 'bitdeer', label: 'Bitdeer / SEALMINER（比特小鹿）' },
        { value: 'auradine', label: 'Auradine / Teraflux' },
        { value: 'other', label: '其他 / 待确认' },
    ],
    miner_cooling: [
        { value: 'air', label: '风冷矿机' },
        { value: 'liquid', label: '液冷矿机' },
        { value: 'hydro', label: '水冷 / 浸没式' },
        { value: 'unknown', label: '待推荐' },
    ],
    certification_needs: [
        { value: 'ce', label: 'CE' },
        { value: 'eac', label: 'EAC' },
        { value: 'ul', label: 'UL' },
        { value: 'grid_sync', label: '并网 / 电力接口合规' },
        { value: 'none', label: '暂无明确要求' },
    ],
});

const state = {
    requirement: null,
    error: '',
    loading: true,
    submitting: false,
    submitConfirmed: false,
};

const params = new URL(window.location.href).searchParams;

function text(value, fallback = '') {
    return String(value ?? fallback).trim();
}

function normalizeStringList(value) {
    if (Array.isArray(value)) {
        return Array.from(new Set(value.map((item) => text(item)).filter(Boolean)));
    }
    if (typeof value === 'string') {
        const trimmed = text(value);
        if (!trimmed) return [];
        if (trimmed.startsWith('[')) {
            try {
                return normalizeStringList(JSON.parse(trimmed));
            } catch (_error) {
                return [trimmed];
            }
        }
        return [trimmed];
    }
    return [];
}

function normalizeAnswers(value = {}) {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    return {
        deployment_mode: text(source.deployment_mode || 'new_site'),
        miner_brands: normalizeStringList(source.miner_brands),
        miner_cooling: normalizeStringList(source.miner_cooling),
        miner_hashrate_band: text(source.miner_hashrate_band || 'need_recommendation'),
        miner_power_band: text(source.miner_power_band || 'need_recommendation'),
        miner_quantity_band: text(source.miner_quantity_band || 'unknown'),
        power_capacity_band: text(source.power_capacity_band || 'unknown'),
        voltage_frequency: text(source.voltage_frequency || 'custom'),
        container_preference: text(source.container_preference || 'need_recommendation'),
        silent_requirement: text(source.silent_requirement || 'unknown'),
        budget_band: text(source.budget_band || 'need_recommendation'),
        timeline_band: text(source.timeline_band || 'unknown'),
        certification_needs: normalizeStringList(source.certification_needs),
        extra_notes: text(source.extra_notes),
    };
}

function normalizeRequirement(row = {}) {
    return {
        id: text(row.id),
        customer_id: text(row.customer_id),
        title: text(row.title),
        status: text(row.status, 'draft'),
        requirement_type: text(row.requirement_type, 'integrated_mining_power'),
        country: text(row.country),
        requester_company: text(row.requester_company || row.customer_company),
        requester_name: text(row.requester_name || row.customer_contact),
        requester_email: text(row.requester_email || row.customer_email),
        requester_phone: text(row.requester_phone || row.customer_phone),
        submitted_at: text(row.submitted_at),
        answers: normalizeAnswers(row.answers),
    };
}

function getClient() {
    if (!window.supabase?.createClient) return null;
    if (!getClient.instance) {
        getClient.instance = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        });
    }
    return getClient.instance;
}

function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function optionLabel(options = [], value = '') {
    return options.find((item) => item.value === text(value))?.label || text(value);
}

function selectOptionsMarkup(options = [], selected = '') {
    const current = text(selected);
    return options.map((item) => `<option value="${esc(item.value)}" ${item.value === current ? 'selected' : ''}>${esc(item.label)}</option>`).join('');
}

function choiceChipMarkup(field, options = [], selectedValues = [], disabled = false) {
    const selectedSet = new Set(normalizeStringList(selectedValues));
    return `
        <div class="requirement-choice-grid">
            ${options.map((item) => `
                <label class="requirement-choice ${selectedSet.has(item.value) ? 'is-active' : ''} ${disabled ? 'is-disabled' : ''}">
                    <input type="checkbox" data-answer-check="${esc(field)}" value="${esc(item.value)}" ${selectedSet.has(item.value) ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
                    <span>${esc(item.label)}</span>
                </label>
            `).join('')}
        </div>
    `;
}

function requirementStatusLabel(status = '') {
    const key = text(status, 'draft');
    if (key === 'draft') return '等待提交';
    if (key === 'submitted') return '已提交';
    if (key === 'reviewing') return '审核中';
    if (key === 'quoted') return '已进入报价';
    if (key === 'closed') return '已关闭';
    return key || '--';
}

function statusTone(status = '') {
    const key = text(status, 'draft');
    if (key === 'quoted') return 'ok';
    if (key === 'closed') return 'danger';
    if (key === 'submitted') return 'warn';
    return 'muted';
}

function isLocked(status = '') {
    return ['submitted', 'reviewing', 'quoted', 'closed'].includes(text(status, 'draft'));
}

function fmtDate(value) {
    const date = new Date(value || '');
    if (Number.isNaN(date.getTime())) return '--';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function root() {
    return document.getElementById('requirement-app');
}

function renderLoading() {
    root().innerHTML = `
        <section class="requirement-card requirement-loading">
            <div class="requirement-loading__spinner"><i class="fa-solid fa-circle-notch fa-spin"></i></div>
            <div class="requirement-loading__title">正在读取需求单...</div>
            <div class="requirement-loading__desc">请稍候，系统正在校验公开需求链接并加载当前问卷。</div>
        </section>
    `;
}

function renderError(message) {
    document.title = 'Requirement Link Unavailable';
    root().innerHTML = `
        <section class="requirement-card requirement-empty">
            <div class="requirement-empty__icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <h1>公开需求链接不可用</h1>
            <p>${esc(message || '当前链接无效、已失效，或还没有对应的需求单。')}</p>
        </section>
    `;
}

function renderApp() {
    if (state.loading) {
        renderLoading();
        return;
    }
    if (state.error) {
        renderError(state.error);
        return;
    }

    const requirement = state.requirement;
    const answers = normalizeAnswers(requirement.answers);
    const locked = isLocked(requirement.status);
    const buttonDisabled = locked || state.submitting || !state.submitConfirmed;

    document.title = `${text(requirement.requester_company || requirement.title || 'Requirement Intake')} | GasGx`;
    root().innerHTML = `
        <div class="requirement-page ${locked ? 'is-locked' : ''}">
        ${locked ? `
            <div class="requirement-watermark" aria-hidden="true">
                <span>已存证不可修改</span>
                <span>已存证不可修改</span>
                <span>已存证不可修改</span>
                <span>已存证不可修改</span>
                <span>已存证不可修改</span>
                <span>已存证不可修改</span>
            </div>
        ` : ''}
        <section class="requirement-hero">
            <div class="requirement-hero__copy">
                <div class="requirement-hero__kicker">GASGX REQUIREMENT INTAKE</div>
                <h1>${esc(requirement.title || '矿机与供电需求收集')}</h1>
                <p>请根据当前这一轮采购或部署计划填写下面的选择题。提交后，这份需求会作为后续报价、跟进和内部协作的统一基线。</p>
            </div>
            <div class="requirement-hero__meta">
                <div class="requirement-status-chip tone-${esc(statusTone(requirement.status))}">${esc(requirementStatusLabel(requirement.status))}</div>
                <div class="requirement-hero__meta-line"><strong>需求类型</strong><span>${esc(optionLabel(REQUIREMENT_TYPE_OPTIONS, requirement.requirement_type))}</span></div>
                <div class="requirement-hero__meta-line"><strong>客户提交时间</strong><span>${esc(fmtDate(requirement.submitted_at))}</span></div>
                <div class="requirement-hero__meta-line"><strong>说明</strong><span>${locked ? '这份需求已经提交，目前为只读状态。' : '提交后将自动锁定，避免后续报价依据反复变化。'}</span></div>
            </div>
        </section>

        <section class="requirement-card">
            <div class="requirement-section-head">
                <div>
                    <h2>联系人信息</h2>
                    <p>这里只保留最必要的联系方式，方便我们确认后续报价和交付细节。</p>
                </div>
            </div>
            <div class="requirement-grid">
                <label class="requirement-field">
                    <span>客户公司</span>
                    <input class="share-input" data-field="requester_company" value="${esc(requirement.requester_company)}" placeholder="Demo Mining" ${locked ? 'disabled' : ''}>
                </label>
                <label class="requirement-field">
                    <span>联系人</span>
                    <input class="share-input" data-field="requester_name" value="${esc(requirement.requester_name)}" placeholder="Allen" ${locked ? 'disabled' : ''}>
                </label>
                <label class="requirement-field">
                    <span>邮箱</span>
                    <input class="share-input" data-field="requester_email" value="${esc(requirement.requester_email)}" placeholder="customer@example.com" ${locked ? 'disabled' : ''}>
                </label>
                <label class="requirement-field">
                    <span>WhatsApp / 电话</span>
                    <input class="share-input" data-field="requester_phone" value="${esc(requirement.requester_phone)}" placeholder="+7 000 000 0000" ${locked ? 'disabled' : ''}>
                </label>
                <label class="requirement-field">
                    <span>国家 / 地区</span>
                    <input class="share-input" data-field="country" value="${esc(requirement.country)}" placeholder="Russia" ${locked ? 'disabled' : ''}>
                </label>
                <label class="requirement-field">
                    <span>需求类型</span>
                    <select class="share-select" data-field="requirement_type" ${locked ? 'disabled' : ''}>
                        ${selectOptionsMarkup(REQUIREMENT_TYPE_OPTIONS, requirement.requirement_type)}
                    </select>
                </label>
            </div>
        </section>

        <section class="requirement-card">
            <div class="requirement-section-head">
                <div>
                    <h2>矿机偏好</h2>
                    <p>尽量用选择题完成首轮确认，减少自由输入。</p>
                </div>
            </div>
            <div class="requirement-grid">
                <label class="requirement-field">
                    <span>部署模式</span>
                    <select class="share-select" data-answer-field="deployment_mode" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.deployment_mode, answers.deployment_mode)}</select>
                </label>
                <label class="requirement-field">
                    <span>单机算力范围</span>
                    <select class="share-select" data-answer-field="miner_hashrate_band" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.miner_hashrate_band, answers.miner_hashrate_band)}</select>
                </label>
                <label class="requirement-field">
                    <span>单机功耗范围</span>
                    <select class="share-select" data-answer-field="miner_power_band" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.miner_power_band, answers.miner_power_band)}</select>
                </label>
                <label class="requirement-field">
                    <span>矿机数量范围</span>
                    <select class="share-select" data-answer-field="miner_quantity_band" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.miner_quantity_band, answers.miner_quantity_band)}</select>
                </label>
                <label class="requirement-field">
                    <span>电压 / 频率</span>
                    <select class="share-select" data-answer-field="voltage_frequency" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.voltage_frequency, answers.voltage_frequency)}</select>
                </label>
            </div>
            <div class="requirement-field">
                <span>矿机品牌</span>
                ${choiceChipMarkup('miner_brands', REQUIREMENT_MULTI_OPTIONS.miner_brands, answers.miner_brands, locked)}
            </div>
            <div class="requirement-field">
                <span>矿机冷却方式</span>
                ${choiceChipMarkup('miner_cooling', REQUIREMENT_MULTI_OPTIONS.miner_cooling, answers.miner_cooling, locked)}
            </div>
        </section>

        <section class="requirement-card">
            <div class="requirement-section-head">
                <div>
                    <h2>交付与现场条件</h2>
                    <p>这些信息会直接影响配置推荐、报价和交付节奏。</p>
                </div>
            </div>
            <div class="requirement-grid">
                <label class="requirement-field">
                    <span>供电规模</span>
                    <select class="share-select" data-answer-field="power_capacity_band" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.power_capacity_band, answers.power_capacity_band)}</select>
                </label>
                <label class="requirement-field">
                    <span>部署偏好</span>
                    <select class="share-select" data-answer-field="container_preference" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.container_preference, answers.container_preference)}</select>
                </label>
                <label class="requirement-field">
                    <span>噪音要求</span>
                    <select class="share-select" data-answer-field="silent_requirement" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.silent_requirement, answers.silent_requirement)}</select>
                </label>
                <label class="requirement-field">
                    <span>每 MW 预算</span>
                    <select class="share-select" data-answer-field="budget_band" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.budget_band, answers.budget_band)}</select>
                </label>
                <label class="requirement-field">
                    <span>期望周期</span>
                    <select class="share-select" data-answer-field="timeline_band" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.timeline_band, answers.timeline_band)}</select>
                </label>
            </div>
            <div class="requirement-field">
                <span>认证 / 合规要求</span>
                ${choiceChipMarkup('certification_needs', REQUIREMENT_MULTI_OPTIONS.certification_needs, answers.certification_needs, locked)}
            </div>
            <label class="requirement-field">
                <span>补充说明</span>
                <textarea class="share-input requirement-textarea" data-answer-field="extra_notes" placeholder="只填写必须说明的现场条件、指定机型或其他特殊要求。" ${locked ? 'disabled' : ''}>${esc(answers.extra_notes)}</textarea>
            </label>
        </section>

        <section class="requirement-card requirement-submit-card">
            <div class="requirement-submit-copy">
                <h2>${locked ? '这份需求已经提交' : '提交并锁定本轮需求'}</h2>
                <p>${locked ? '如果后续需求变化，请直接联系 GasGx 销售并重新开启新一轮需求单。' : '提交后，这份需求会作为后续报价、跟进和内部协作的统一基线。'}</p>
            </div>
            ${locked ? '' : `
                <div class="requirement-warning">
                    <strong>请最终确认</strong>
                    <p>你的需求将直接决定后续的实际报价、配置推荐和交付评估。这个信息非常重要，请慎重填写后再提交。</p>
                </div>
                <label class="requirement-confirm">
                    <input id="requirement-submit-confirm" type="checkbox" ${state.submitConfirmed ? 'checked' : ''}>
                    <span>我已确认以上需求信息准确无误，并理解它将直接影响最终报价。</span>
                </label>
            `}
            <div class="requirement-submit-actions">
                <button id="requirement-submit" type="button" class="btn-glow px-5 py-3 inline-flex items-center gap-2" ${buttonDisabled ? 'disabled' : ''}>
                    <i class="fa-solid ${locked ? 'fa-lock' : 'fa-paper-plane'}"></i>
                    <span>${locked ? '已提交' : (state.submitting ? '提交中...' : '提交需求单')}</span>
                </button>
                <div id="requirement-submit-status" class="requirement-submit-status">${locked ? `已于 ${esc(fmtDate(requirement.submitted_at))} 提交。` : (state.submitConfirmed ? '提交后公开需求页会自动锁定。' : '请先勾选最终确认，再提交需求单。')}</div>
            </div>
        </section>
        </div>
    `;

    bindEvents();
}

function bindEvents() {
    const requirement = state.requirement;
    if (!requirement || isLocked(requirement.status)) return;

    document.querySelectorAll('[data-field]').forEach((node) => {
        node.addEventListener('input', () => {
            const field = node.dataset.field;
            if (!field) return;
            requirement[field] = node.value;
        });
        if (node.tagName === 'SELECT') {
            node.addEventListener('change', () => {
                const field = node.dataset.field;
                if (!field) return;
                requirement[field] = node.value;
            });
        }
    });

    document.querySelectorAll('[data-answer-field]').forEach((node) => {
        const apply = () => {
            const field = node.dataset.answerField;
            if (!field) return;
            requirement.answers[field] = node.value;
        };
        node.addEventListener('input', apply);
        if (node.tagName === 'SELECT') node.addEventListener('change', apply);
    });

    document.querySelectorAll('[data-answer-check]').forEach((node) => {
        node.addEventListener('change', () => {
            const field = node.dataset.answerCheck;
            if (!field) return;
            requirement.answers[field] = Array.from(document.querySelectorAll(`[data-answer-check="${field}"]`))
                .filter((item) => item.checked)
                .map((item) => item.value);
        });
    });

    document.getElementById('requirement-submit-confirm')?.addEventListener('change', (event) => {
        state.submitConfirmed = !!event.target?.checked;
        const submitButton = document.getElementById('requirement-submit');
        const statusNode = document.getElementById('requirement-submit-status');
        if (submitButton) submitButton.disabled = !state.submitConfirmed || state.submitting;
        if (statusNode) {
            statusNode.textContent = state.submitConfirmed ? '提交后公开需求页会自动锁定。' : '请先勾选最终确认，再提交需求单。';
            statusNode.classList.remove('is-error');
        }
    });

    document.getElementById('requirement-submit')?.addEventListener('click', () => {
        void submitCurrentRequirement();
    });
}

async function fetchRequirement() {
    const req = text(params.get('req'));
    const token = text(params.get('token'));
    if (!req || !token) {
        throw new Error('缺少 req 或 token，无法打开这份公开需求链接。');
    }

    const supabase = getClient();
    if (!supabase) {
        throw new Error('Supabase client is unavailable.');
    }

    const { data, error } = await supabase.rpc('get_public_quote_requirement', {
        req_slug: req,
        req_token: token,
    });
    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
        throw new Error('这份公开需求链接不存在，或已经不可用。');
    }

    state.requirement = normalizeRequirement(row);
    state.submitConfirmed = false;
}

async function submitCurrentRequirement() {
    const supabase = getClient();
    if (!supabase || !state.requirement) return;

    if (!state.submitConfirmed) {
        const statusNode = document.getElementById('requirement-submit-status');
        if (statusNode) {
            statusNode.textContent = '请先勾选最终确认，再提交需求单。';
            statusNode.classList.add('is-error');
        }
        return;
    }

    state.submitting = true;
    renderApp();

    try {
        const req = text(params.get('req'));
        const token = text(params.get('token'));
        const payload = {
            title: state.requirement.title,
            country: state.requirement.country,
            requester_company: state.requirement.requester_company,
            requester_name: state.requirement.requester_name,
            requester_email: state.requirement.requester_email,
            requester_phone: state.requirement.requester_phone,
            answers: normalizeAnswers(state.requirement.answers),
        };

        const { error } = await supabase.rpc('submit_public_quote_requirement', {
            req_slug: req,
            req_token: token,
            payload,
        });
        if (error) throw error;

        await fetchRequirement();
        state.submitting = false;
        renderApp();
    } catch (error) {
        state.submitting = false;
        renderApp();
        const statusNode = document.getElementById('requirement-submit-status');
        if (statusNode) {
            statusNode.textContent = text(error?.message, '提交失败，请稍后重试。');
            statusNode.classList.add('is-error');
        }
    }
}

async function init() {
    try {
        state.loading = true;
        renderApp();
        await fetchRequirement();
        state.loading = false;
        renderApp();
    } catch (error) {
        state.loading = false;
        state.error = text(error?.message, '当前公开需求链接不可用。');
        renderApp();
    }
}

void init();
