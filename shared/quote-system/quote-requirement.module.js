const SUPABASE_URL = window.AMS_SUPABASE_URL || 'https://mkpcliytqudclkwtewru.supabase.co';
const SUPABASE_KEY = window.AMS_SUPABASE_KEY || 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';

const REQUIREMENT_TYPE_OPTIONS = Object.freeze([
    { value: 'integrated_mining_power', label: '矿机 + 供电一体化' },
    { value: 'miner_only', label: '仅矿机需求' },
    { value: 'power_only', label: '仅供电 / 发电需求' },
    { value: 'unclear', label: '需要方案推荐' },
]);

const CONTACT_CHANNEL_OPTIONS = Object.freeze([
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'wechat', label: 'WeChat' },
    { value: 'signal', label: 'Signal' },
    { value: 'viber', label: 'Viber' },
    { value: 'line', label: 'LINE' },
    { value: 'kakaotalk', label: 'KakaoTalk' },
    { value: 'messenger', label: 'Facebook Messenger' },
    { value: 'instagram', label: 'Instagram DM' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'x', label: 'X (Twitter)' },
    { value: 'skype', label: 'Skype' },
    { value: 'discord', label: 'Discord' },
    { value: 'slack', label: 'Slack' },
    { value: 'teams', label: 'Microsoft Teams' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'other', label: 'Other' },
]);

const COUNTRY_OPTIONS = Object.freeze([
    { value: '', label: '请选择国家 / 地区' },
    { value: 'Afghanistan', label: 'Afghanistan' },
    { value: 'Albania', label: 'Albania' },
    { value: 'Algeria', label: 'Algeria' },
    { value: 'Andorra', label: 'Andorra' },
    { value: 'Angola', label: 'Angola' },
    { value: 'Antigua and Barbuda', label: 'Antigua and Barbuda' },
    { value: 'Argentina', label: 'Argentina' },
    { value: 'Armenia', label: 'Armenia' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Austria', label: 'Austria' },
    { value: 'Azerbaijan', label: 'Azerbaijan' },
    { value: 'Bahamas', label: 'Bahamas' },
    { value: 'Bahrain', label: 'Bahrain' },
    { value: 'Bangladesh', label: 'Bangladesh' },
    { value: 'Barbados', label: 'Barbados' },
    { value: 'Belarus', label: 'Belarus' },
    { value: 'Belgium', label: 'Belgium' },
    { value: 'Belize', label: 'Belize' },
    { value: 'Benin', label: 'Benin' },
    { value: 'Bhutan', label: 'Bhutan' },
    { value: 'Bolivia', label: 'Bolivia' },
    { value: 'Bosnia and Herzegovina', label: 'Bosnia and Herzegovina' },
    { value: 'Botswana', label: 'Botswana' },
    { value: 'Brazil', label: 'Brazil' },
    { value: 'Brunei', label: 'Brunei' },
    { value: 'Bulgaria', label: 'Bulgaria' },
    { value: 'Burkina Faso', label: 'Burkina Faso' },
    { value: 'Burundi', label: 'Burundi' },
    { value: 'Cambodia', label: 'Cambodia' },
    { value: 'Cameroon', label: 'Cameroon' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Cape Verde', label: 'Cape Verde' },
    { value: 'Central African Republic', label: 'Central African Republic' },
    { value: 'Chad', label: 'Chad' },
    { value: 'Chile', label: 'Chile' },
    { value: 'China', label: 'China' },
    { value: 'Colombia', label: 'Colombia' },
    { value: 'Comoros', label: 'Comoros' },
    { value: 'Congo (Congo-Brazzaville)', label: 'Congo (Congo-Brazzaville)' },
    { value: 'Costa Rica', label: 'Costa Rica' },
    { value: 'Croatia', label: 'Croatia' },
    { value: 'Cuba', label: 'Cuba' },
    { value: 'Cyprus', label: 'Cyprus' },
    { value: 'Czechia', label: 'Czechia' },
    { value: 'Denmark', label: 'Denmark' },
    { value: 'Djibouti', label: 'Djibouti' },
    { value: 'Dominica', label: 'Dominica' },
    { value: 'Dominican Republic', label: 'Dominican Republic' },
    { value: 'Ecuador', label: 'Ecuador' },
    { value: 'Egypt', label: 'Egypt' },
    { value: 'El Salvador', label: 'El Salvador' },
    { value: 'Equatorial Guinea', label: 'Equatorial Guinea' },
    { value: 'Eritrea', label: 'Eritrea' },
    { value: 'Estonia', label: 'Estonia' },
    { value: 'Eswatini', label: 'Eswatini' },
    { value: 'Ethiopia', label: 'Ethiopia' },
    { value: 'Fiji', label: 'Fiji' },
    { value: 'Finland', label: 'Finland' },
    { value: 'France', label: 'France' },
    { value: 'Gabon', label: 'Gabon' },
    { value: 'Gambia', label: 'Gambia' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Germany', label: 'Germany' },
    { value: 'Ghana', label: 'Ghana' },
    { value: 'Greece', label: 'Greece' },
    { value: 'Grenada', label: 'Grenada' },
    { value: 'Guatemala', label: 'Guatemala' },
    { value: 'Guinea', label: 'Guinea' },
    { value: 'Guinea-Bissau', label: 'Guinea-Bissau' },
    { value: 'Guyana', label: 'Guyana' },
    { value: 'Haiti', label: 'Haiti' },
    { value: 'Honduras', label: 'Honduras' },
    { value: 'Hungary', label: 'Hungary' },
    { value: 'Iceland', label: 'Iceland' },
    { value: 'India', label: 'India' },
    { value: 'Indonesia', label: 'Indonesia' },
    { value: 'Iran', label: 'Iran' },
    { value: 'Iraq', label: 'Iraq' },
    { value: 'Ireland', label: 'Ireland' },
    { value: 'Israel', label: 'Israel' },
    { value: 'Italy', label: 'Italy' },
    { value: 'Jamaica', label: 'Jamaica' },
    { value: 'Japan', label: 'Japan' },
    { value: 'Jordan', label: 'Jordan' },
    { value: 'Kazakhstan', label: 'Kazakhstan' },
    { value: 'Kenya', label: 'Kenya' },
    { value: 'Kiribati', label: 'Kiribati' },
    { value: 'Kuwait', label: 'Kuwait' },
    { value: 'Kyrgyzstan', label: 'Kyrgyzstan' },
    { value: 'Laos', label: 'Laos' },
    { value: 'Latvia', label: 'Latvia' },
    { value: 'Lebanon', label: 'Lebanon' },
    { value: 'Lesotho', label: 'Lesotho' },
    { value: 'Liberia', label: 'Liberia' },
    { value: 'Libya', label: 'Libya' },
    { value: 'Liechtenstein', label: 'Liechtenstein' },
    { value: 'Lithuania', label: 'Lithuania' },
    { value: 'Luxembourg', label: 'Luxembourg' },
    { value: 'Madagascar', label: 'Madagascar' },
    { value: 'Malawi', label: 'Malawi' },
    { value: 'Malaysia', label: 'Malaysia' },
    { value: 'Maldives', label: 'Maldives' },
    { value: 'Mali', label: 'Mali' },
    { value: 'Malta', label: 'Malta' },
    { value: 'Marshall Islands', label: 'Marshall Islands' },
    { value: 'Mauritania', label: 'Mauritania' },
    { value: 'Mauritius', label: 'Mauritius' },
    { value: 'Mexico', label: 'Mexico' },
    { value: 'Micronesia', label: 'Micronesia' },
    { value: 'Moldova', label: 'Moldova' },
    { value: 'Monaco', label: 'Monaco' },
    { value: 'Mongolia', label: 'Mongolia' },
    { value: 'Montenegro', label: 'Montenegro' },
    { value: 'Morocco', label: 'Morocco' },
    { value: 'Mozambique', label: 'Mozambique' },
    { value: 'Myanmar', label: 'Myanmar' },
    { value: 'Namibia', label: 'Namibia' },
    { value: 'Nauru', label: 'Nauru' },
    { value: 'Nepal', label: 'Nepal' },
    { value: 'Netherlands', label: 'Netherlands' },
    { value: 'New Zealand', label: 'New Zealand' },
    { value: 'Nicaragua', label: 'Nicaragua' },
    { value: 'Niger', label: 'Niger' },
    { value: 'Nigeria', label: 'Nigeria' },
    { value: 'North Korea', label: 'North Korea' },
    { value: 'North Macedonia', label: 'North Macedonia' },
    { value: 'Norway', label: 'Norway' },
    { value: 'Oman', label: 'Oman' },
    { value: 'Pakistan', label: 'Pakistan' },
    { value: 'Palau', label: 'Palau' },
    { value: 'Panama', label: 'Panama' },
    { value: 'Papua New Guinea', label: 'Papua New Guinea' },
    { value: 'Paraguay', label: 'Paraguay' },
    { value: 'Peru', label: 'Peru' },
    { value: 'Philippines', label: 'Philippines' },
    { value: 'Poland', label: 'Poland' },
    { value: 'Portugal', label: 'Portugal' },
    { value: 'Qatar', label: 'Qatar' },
    { value: 'Romania', label: 'Romania' },
    { value: 'Russia', label: 'Russia' },
    { value: 'Rwanda', label: 'Rwanda' },
    { value: 'Saint Kitts and Nevis', label: 'Saint Kitts and Nevis' },
    { value: 'Saint Lucia', label: 'Saint Lucia' },
    { value: 'Saint Vincent and the Grenadines', label: 'Saint Vincent and the Grenadines' },
    { value: 'Samoa', label: 'Samoa' },
    { value: 'San Marino', label: 'San Marino' },
    { value: 'Sao Tome and Principe', label: 'Sao Tome and Principe' },
    { value: 'Saudi Arabia', label: 'Saudi Arabia' },
    { value: 'Senegal', label: 'Senegal' },
    { value: 'Serbia', label: 'Serbia' },
    { value: 'Seychelles', label: 'Seychelles' },
    { value: 'Sierra Leone', label: 'Sierra Leone' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Slovakia', label: 'Slovakia' },
    { value: 'Slovenia', label: 'Slovenia' },
    { value: 'Solomon Islands', label: 'Solomon Islands' },
    { value: 'Somalia', label: 'Somalia' },
    { value: 'South Africa', label: 'South Africa' },
    { value: 'South Korea', label: 'South Korea' },
    { value: 'South Sudan', label: 'South Sudan' },
    { value: 'Spain', label: 'Spain' },
    { value: 'Sri Lanka', label: 'Sri Lanka' },
    { value: 'Sudan', label: 'Sudan' },
    { value: 'Suriname', label: 'Suriname' },
    { value: 'Sweden', label: 'Sweden' },
    { value: 'Switzerland', label: 'Switzerland' },
    { value: 'Syria', label: 'Syria' },
    { value: 'Taiwan', label: 'Taiwan' },
    { value: 'Tajikistan', label: 'Tajikistan' },
    { value: 'Tanzania', label: 'Tanzania' },
    { value: 'Thailand', label: 'Thailand' },
    { value: 'Timor-Leste', label: 'Timor-Leste' },
    { value: 'Togo', label: 'Togo' },
    { value: 'Tonga', label: 'Tonga' },
    { value: 'Trinidad and Tobago', label: 'Trinidad and Tobago' },
    { value: 'Tunisia', label: 'Tunisia' },
    { value: 'Turkey', label: 'Turkey' },
    { value: 'Turkmenistan', label: 'Turkmenistan' },
    { value: 'Tuvalu', label: 'Tuvalu' },
    { value: 'Uganda', label: 'Uganda' },
    { value: 'Ukraine', label: 'Ukraine' },
    { value: 'United Arab Emirates', label: 'United Arab Emirates' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'United States', label: 'United States' },
    { value: 'Uruguay', label: 'Uruguay' },
    { value: 'Uzbekistan', label: 'Uzbekistan' },
    { value: 'Vanuatu', label: 'Vanuatu' },
    { value: 'Vatican City', label: 'Vatican City' },
    { value: 'Venezuela', label: 'Venezuela' },
    { value: 'Vietnam', label: 'Vietnam' },
    { value: 'Yemen', label: 'Yemen' },
    { value: 'Zambia', label: 'Zambia' },
    { value: 'Zimbabwe', label: 'Zimbabwe' },
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
        { value: '10mw', label: '10MW' },
        { value: '20mw', label: '20MW' },
        { value: '30mw', label: '30MW' },
        { value: '40mw', label: '40MW' },
        { value: '50mw_plus', label: '50MW 以上' },
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
        { value: '6_9_months', label: '6 - 9 个月' },
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

const MINER_MODEL_CATALOG = Object.freeze({
    bitmain: [
        { value: 'antminer-s21-200t', model: 'Antminer S21', hashrate: '200 TH/s', power: '3500W' },
        { value: 'antminer-s21-pro', model: 'Antminer S21 Pro', hashrate: '234 TH/s', power: '3510W' },
        { value: 'antminer-s21-xp-hyd', model: 'Antminer S21 XP Hyd', hashrate: '473 TH/s', power: '5676W' },
    ],
    microbt: [
        { value: 'whatsminer-m60s', model: 'WhatsMiner M60S', hashrate: '170–186 TH/s', power: '3145–3441W' },
    ],
    canaan: [
        { value: 'avalon-a1566ha-480t', model: 'AvalonMiner A1566HA', hashrate: '480 TH/s', power: '8064W' },
        { value: 'avalon-a15pro-221t', model: 'AvalonMiner A15Pro', hashrate: '221 TH/s', power: '3662W' },
        { value: 'avalon-a15xp-209t', model: 'AvalonMiner A15XP', hashrate: '209 TH/s', power: '3667W' },
        { value: 'avalon-a1466-162t', model: 'AvalonMiner A1466', hashrate: '162 TH/s', power: '3500W' },
        { value: 'avalon-a1366i-119t', model: 'AvalonMiner A1366I', hashrate: '119 TH/s', power: '3570W' },
        { value: 'avalon-a1346-123t', model: 'AvalonMiner A1346', hashrate: '123 TH/s', power: '3570W' },
        { value: 'avalon-a1326-109t', model: 'AvalonMiner A1326', hashrate: '109 TH/s', power: '3520W' },
    ],
    bitdeer: [
        { value: 'sealminer-a2', model: 'SEALMINER A2', hashrate: '226 TH/s', power: '3729W' },
        { value: 'sealminer-a2-pro-air', model: 'SEALMINER A2 Pro (Air)', hashrate: '255–270 TH/s', power: '3790–4050W' },
    ],
    auradine: [
        { value: 'teraflux-at2880', model: 'Teraflux AT2880', hashrate: '180–260 TH/s', power: '5000W' },
    ],
});

function minerBrandLabelMap() {
    return Object.fromEntries(REQUIREMENT_MULTI_OPTIONS.miner_brands.map((item) => [item.value, localize(item.label)]));
}

function minerModelOptionsFor(brands = []) {
    const selected = normalizeStringList(brands).filter((brand) => brand !== 'other');
    if (!selected.length) return [];
    const brandLabels = minerBrandLabelMap();
    return selected.flatMap((brand) => {
        const entries = (MINER_MODEL_CATALOG[brand] || []).slice(0, 10);
        return entries.map((entry) => ({
            ...entry,
            brand,
            brandLabel: brandLabels[brand] || brand,
        }));
    });
}

function minerModelChoiceMarkup(selectedValues = [], brands = [], disabled = false) {
    const options = minerModelOptionsFor(brands);
    if (!options.length) {
        return `<div class="requirement-empty-hint">${esc(localize('请先选择矿机品牌'))}</div>`;
    }
    const selectedSet = new Set(normalizeStringList(selectedValues));
    return `
        <div class="requirement-choice-grid is-detailed">
            ${options.map((item) => `
                <label class="requirement-choice ${selectedSet.has(item.value) ? 'is-active' : ''} ${disabled ? 'is-disabled' : ''}">
                    <input type="checkbox" data-answer-check="miner_models" value="${esc(item.value)}" ${selectedSet.has(item.value) ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
                    <span class="requirement-choice-detail">
                        <strong>${esc(item.model)}</strong>
                        <small>${esc(item.brandLabel)} · ${esc(item.hashrate)} · ${esc(item.power)}</small>
                    </span>
                </label>
            `).join('')}
        </div>
    `;
}

const state = {
    requirement: null,
    error: '',
    loading: true,
    submitting: false,
    submitConfirmed: false,
    autoSaveTimer: 0,
    autoSavePending: false,
    autoSaving: false,
    autoSaveQueued: false,
    autoSaveMessage: '',
    autoSaveError: false,
    lastAutoSavedAt: '',
    lastSavedSignature: '',
    autoSaveBound: false,
};

const params = new URL(window.location.href).searchParams;
const SUPPORTED_LOCALES = ['zh', 'en', 'ru'];
const LOCALE = (() => {
    const raw = text(params.get('lang')).toLowerCase();
    if (SUPPORTED_LOCALES.includes(raw)) return raw;
    return 'zh';
})();

const LABEL_MAP = Object.freeze({
    '矿机与供电需求收集': { en: 'Mining & Power Requirement Intake', ru: 'Сбор потребностей по майнингу и электропитанию' },
    '请根据当前这一轮采购或部署计划填写下面的选择题。提交后，这份需求会作为后续报价、跟进和内部协作的统一基线。': {
        en: 'Please fill in the selections based on your current procurement or deployment plan. After submission, this request becomes the baseline for pricing and follow-up.',
        ru: 'Пожалуйста, заполните выборы исходя из текущего плана закупки или развертывания. После отправки этот запрос станет базовой линией для расчета и дальнейшей работы.',
    },
    '需求类型': { en: 'Requirement Type', ru: 'Тип запроса' },
    '客户提交时间': { en: 'Submitted At', ru: 'Время отправки' },
    '说明': { en: 'Note', ru: 'Примечание' },
    '这份需求已经提交，目前为只读状态。': { en: 'This request has been submitted and is now read-only.', ru: 'Этот запрос отправлен и теперь доступен только для чтения.' },
    '提交后将自动锁定，避免后续报价依据反复变化。': { en: 'After submission it will be locked to avoid changes to the pricing baseline.', ru: 'После отправки он будет заблокирован, чтобы избежать изменений базы для расчета.' },
    '联系人信息': { en: 'Contact Details', ru: 'Контактные данные' },
    '这里只保留最必要的联系方式，方便我们确认后续报价和交付细节。': {
        en: 'Only essential contact details are collected to confirm pricing and delivery.',
        ru: 'Собираются только основные контакты для уточнения цены и поставки.',
    },
    '客户公司': { en: 'Company', ru: 'Компания' },
    '联系人': { en: 'Contact Person', ru: 'Контактное лицо' },
    '邮箱': { en: 'Email', ru: 'Email' },
    '联系渠道': { en: 'Contact Channel', ru: 'Канал связи' },
    '账号 / 电话': { en: 'Handle / Phone', ru: 'Аккаунт / Телефон' },
    '填写账号或手机号': { en: 'Enter handle or phone number', ru: 'Введите аккаунт или номер телефона' },
    '国家 / 地区': { en: 'Country / Region', ru: 'Страна / Регион' },
    '请选择国家 / 地区': { en: 'Select country / region', ru: 'Выберите страну / регион' },
    '矿机偏好': { en: 'Miner Preferences', ru: 'Предпочтения по майнерам' },
    '尽量用选择题完成首轮确认，减少自由输入。': {
        en: 'Use selections for the first pass to reduce free text.',
        ru: 'Для первого шага используйте выборы, чтобы уменьшить свободный ввод.',
    },
    '部署模式': { en: 'Deployment Mode', ru: 'Режим развертывания' },
    '单机算力范围': { en: 'Hashrate per Miner', ru: 'Хэшрейт на майнер' },
    '单机功耗范围': { en: 'Power per Miner', ru: 'Потребление на майнер' },
    '矿机数量范围': { en: 'Miner Quantity', ru: 'Количество майнеров' },
    '电压 / 频率': { en: 'Voltage / Frequency', ru: 'Напряжение / Частота' },
    '矿机品牌': { en: 'Miner Brands', ru: 'Бренды майнеров' },
    '矿机冷却方式': { en: 'Cooling Type', ru: 'Тип охлаждения' },
    '推荐机型 (Top 10)': { en: 'Suggested Models (Top 10)', ru: 'Рекомендуемые модели (Топ 10)' },
    '请先选择矿机品牌': { en: 'Select miner brands first', ru: 'Сначала выберите бренды майнеров' },
    '交付与现场条件': { en: 'Delivery & Site Conditions', ru: 'Условия поставки и площадки' },
    '这些信息会直接影响配置推荐、报价和交付节奏。': {
        en: 'These inputs affect configuration, pricing, and delivery planning.',
        ru: 'Эти данные влияют на конфигурацию, цену и график поставки.',
    },
    '供电规模': { en: 'Power Capacity', ru: 'Мощность' },
    '部署偏好': { en: 'Deployment Preference', ru: 'Предпочтения по размещению' },
    '噪音要求': { en: 'Noise Requirement', ru: 'Требования по шуму' },
    '每 MW 预算': { en: 'Budget per MW', ru: 'Бюджет на МВт' },
    '期望周期': { en: 'Delivery Timeline', ru: 'Сроки поставки' },
    '认证 / 合规要求': { en: 'Compliance & Certifications', ru: 'Сертификация и соответствие' },
    '补充说明': { en: 'Additional Notes', ru: 'Дополнительные требования' },
    '只填写必须说明的现场条件、指定机型或其他特殊要求。': {
        en: 'Only add required site constraints, requested models, or special requirements.',
        ru: 'Укажите только обязательные условия площадки, нужные модели или особые требования.',
    },
    '这份需求已经提交': { en: 'This request is submitted', ru: 'Запрос отправлен' },
    '提交并锁定本轮需求': { en: 'Submit & Lock This Request', ru: 'Отправить и зафиксировать запрос' },
    '如果后续需求变化，请直接联系 GasGx 销售并重新开启新一轮需求单。': {
        en: 'If requirements change, contact GasGx sales to open a new request.',
        ru: 'Если требования изменятся, свяжитесь с GasGx для нового запроса.',
    },
    '提交后，这份需求会作为后续报价、跟进和内部协作的统一基线。': {
        en: 'After submission, this request becomes the baseline for pricing and collaboration.',
        ru: 'После отправки этот запрос станет базовой линией для расчета и координации.',
    },
    '请最终确认': { en: 'Final Confirmation', ru: 'Итоговое подтверждение' },
    '你的需求将直接决定后续的实际报价、配置推荐和交付评估。这个信息非常重要，请慎重填写后再提交。': {
        en: 'Your inputs drive pricing, configuration, and delivery assessment. Please review carefully before submitting.',
        ru: 'Ваши ответы определяют цену, конфигурацию и оценку поставки. Пожалуйста, внимательно проверьте перед отправкой.',
    },
    '我已确认以上需求信息准确无误，并理解它将直接影响最终报价。': {
        en: 'I confirm the information is accurate and understand it affects the final price.',
        ru: 'Я подтверждаю, что данные верны и они влияют на итоговую цену.',
    },
    '已提交': { en: 'Submitted', ru: 'Отправлено' },
    '提交中...': { en: 'Submitting...', ru: 'Отправка...' },
    '提交需求单': { en: 'Submit Request', ru: 'Отправить запрос' },
    '提交后公开需求页会自动锁定。': { en: 'The public request page will lock after submission.', ru: 'Публичная страница будет заблокирована после отправки.' },
    '请先勾选最终确认，再提交需求单。': { en: 'Please confirm before submitting.', ru: 'Пожалуйста, подтвердите перед отправкой.' },
    '正在读取需求单...': { en: 'Loading requirement...', ru: 'Загрузка запроса...' },
    '请稍候，系统正在校验公开需求链接并加载当前问卷。': { en: 'Please wait while we validate the link and load the form.', ru: 'Пожалуйста, подождите, идет проверка ссылки и загрузка формы.' },
    '公开需求链接不可用': { en: 'Public requirement link unavailable', ru: 'Публичная ссылка недоступна' },
    '当前链接无效、已失效，或还没有对应的需求单。': { en: 'The link is invalid, expired, or the request does not exist.', ru: 'Ссылка недействительна, истекла или запрос не существует.' },
    '缺少 req 或 token，无法打开这份公开需求链接。': {
        en: 'Missing req or token. Unable to open this public requirement link.',
        ru: 'Отсутствует req или token. Невозможно открыть эту публичную ссылку.',
    },
    '这份公开需求链接不存在，或已经不可用。': {
        en: 'This public requirement link does not exist or is no longer available.',
        ru: 'Эта публичная ссылка не существует или больше недоступна.',
    },
    '提交失败，请稍后重试。': { en: 'Submission failed. Please try again later.', ru: 'Отправка не удалась. Повторите позже.' },
    '已存证不可修改': { en: 'Recorded · Locked', ru: 'Зафиксировано · Заблокировано' },
    '等待提交': { en: 'Awaiting submission', ru: 'Ожидает отправки' },
    '已提交': { en: 'Submitted', ru: 'Отправлено' },
    '审核中': { en: 'Under review', ru: 'На рассмотрении' },
    '已进入报价': { en: 'Quoted', ru: 'В расчете' },
    '已关闭': { en: 'Closed', ru: 'Закрыто' },
    '新建站点': { en: 'New site', ru: 'Новый объект' },
    '已有站点扩容': { en: 'Expand existing site', ru: 'Расширение существующего объекта' },
    '移动 / 集装箱方案': { en: 'Mobile / container solution', ru: 'Мобильное / контейнерное решение' },
    '待确认': { en: 'To be confirmed', ru: 'Требует уточнения' },
    '150T 以下': { en: 'Under 150 TH/s', ru: 'Менее 150 TH/s' },
    '150T - 200T': { en: '150–200 TH/s', ru: '150–200 TH/s' },
    '200T - 300T': { en: '200–300 TH/s', ru: '200–300 TH/s' },
    '300T 以上': { en: 'Over 300 TH/s', ru: 'Более 300 TH/s' },
    '需要推荐': { en: 'Need recommendation', ru: 'Нужна рекомендация' },
    '3kW 以下': { en: 'Under 3 kW', ru: 'Менее 3 кВт' },
    '3kW - 4kW': { en: '3–4 kW', ru: '3–4 кВт' },
    '4kW - 5.5kW': { en: '4–5.5 kW', ru: '4–5,5 кВт' },
    '5.5kW 以上': { en: 'Over 5.5 kW', ru: 'Более 5,5 кВт' },
    '1 - 10 台': { en: '1–10 units', ru: '1–10 шт.' },
    '10 - 50 台': { en: '10–50 units', ru: '10–50 шт.' },
    '50 - 200 台': { en: '50–200 units', ru: '50–200 шт.' },
    '200 台以上': { en: '200+ units', ru: '200+ шт.' },
    '100kW 以下': { en: 'Under 100 kW', ru: 'Менее 100 кВт' },
    '100kW - 500kW': { en: '100–500 kW', ru: '100–500 кВт' },
    '500kW - 1MW': { en: '500 kW–1 MW', ru: '500 кВт–1 МВт' },
    '1MW - 5MW': { en: '1–5 MW', ru: '1–5 МВт' },
    '5MW 以上': { en: 'Over 5 MW', ru: 'Более 5 МВт' },
    '10MW': { en: '10 MW', ru: '10 МВт' },
    '20MW': { en: '20 MW', ru: '20 МВт' },
    '30MW': { en: '30 MW', ru: '30 МВт' },
    '40MW': { en: '40 MW', ru: '40 МВт' },
    '50MW 以上': { en: '50+ MW', ru: '50+ МВт' },
    '400V / 50Hz': { en: '400V / 50Hz', ru: '400В / 50Гц' },
    '415V / 50Hz': { en: '415V / 50Hz', ru: '415В / 50Гц' },
    '480V / 60Hz': { en: '480V / 60Hz', ru: '480В / 60Гц' },
    '其他 / 待确认': { en: 'Other / TBD', ru: 'Другое / уточнить' },
    '整柜一体化': { en: 'Integrated container', ru: 'Интегрированный контейнер' },
    '仅机架 / 机位': { en: 'Rack / slots only', ru: 'Только стойки / места' },
    '场站部署': { en: 'Site build-out', ru: 'Строительство площадки' },
    '常规即可': { en: 'Standard', ru: 'Стандартный' },
    '低噪要求': { en: 'Low noise', ru: 'Низкий шум' },
    '极低噪要求': { en: 'Ultra low noise', ru: 'Очень низкий шум' },
    '先看推荐方案': { en: 'Show recommended plan', ru: 'Показать рекомендованный план' },
    '15万 - 25万 USD / MW': { en: '$150k–$250k / MW', ru: '150–250 тыс. $ / МВт' },
    '25万 - 40万 USD / MW': { en: '$250k–$400k / MW', ru: '250–400 тыс. $ / МВт' },
    '40万 - 60万 USD / MW': { en: '$400k–$600k / MW', ru: '400–600 тыс. $ / МВт' },
    '60万 - 80万 USD / MW': { en: '$600k–$800k / MW', ru: '600–800 тыс. $ / МВт' },
    '尽快': { en: 'ASAP', ru: 'Срочно' },
    '1 个月内': { en: 'Within 1 month', ru: 'В течение 1 месяца' },
    '1 - 3 个月': { en: '1–3 months', ru: '1–3 месяца' },
    '3 - 6 个月': { en: '3–6 months', ru: '3–6 месяцев' },
    '6 - 9 个月': { en: '6–9 months', ru: '6–9 месяцев' },
    'Bitmain / ANTMINER（比特大陆）': { en: 'Bitmain / ANTMINER', ru: 'Bitmain / ANTMINER' },
    'MicroBT / WhatsMiner（比特微）': { en: 'MicroBT / WhatsMiner', ru: 'MicroBT / WhatsMiner' },
    'Canaan / Avalon Miner（嘉楠）': { en: 'Canaan / Avalon Miner', ru: 'Canaan / Avalon Miner' },
    'Bitdeer / SEALMINER（比特小鹿）': { en: 'Bitdeer / SEALMINER', ru: 'Bitdeer / SEALMINER' },
    'Auradine / Teraflux': { en: 'Auradine / Teraflux', ru: 'Auradine / Teraflux' },
    '其他 / 待确认': { en: 'Other / TBD', ru: 'Другое / уточнить' },
    '风冷矿机': { en: 'Air cooled', ru: 'Воздушное охлаждение' },
    '液冷矿机': { en: 'Liquid cooled', ru: 'Жидкостное охлаждение' },
    '水冷 / 浸没式': { en: 'Hydro / immersion', ru: 'Водяное / иммерсионное' },
    '待推荐': { en: 'Need recommendation', ru: 'Нужна рекомендация' },
    '并网 / 电力接口合规': { en: 'Grid / power compliance', ru: 'Соответствие подключению' },
    '暂无明确要求': { en: 'No specific requirements', ru: 'Без требований' },
    '矿机 + 供电一体化': { en: 'Miners + Power (Integrated)', ru: 'Майнеры + питание (интегрировано)' },
    '仅矿机需求': { en: 'Miners only', ru: 'Только майнеры' },
    '仅供电 / 发电需求': { en: 'Power / generation only', ru: 'Только электропитание / генерация' },
    '需要方案推荐': { en: 'Need recommendation', ru: 'Нужна рекомендация' },
    'Other': { en: 'Other', ru: 'Другое' },
});

function localize(value) {
    const raw = text(value);
    if (!raw || LOCALE === 'zh') return raw;
    const mapped = LABEL_MAP[raw];
    return mapped?.[LOCALE] || mapped?.en || raw;
}

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
        contact_channel: text(source.contact_channel || 'whatsapp'),
        miner_brands: normalizeStringList(source.miner_brands),
        miner_models: normalizeStringList(source.miner_models),
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
        updated_at: text(row.updated_at),
        answers: normalizeAnswers(row.answers),
    };
}

function requirementDraftStorageKey() {
    const req = text(params.get('req'));
    const token = text(params.get('token'));
    if (!req || !token) return '';
    return `gasgx.requirement.draft:${req}:${token}`;
}

function buildRequirementPayload(requirement = {}) {
    return {
        title: text(requirement.title),
        requirement_type: text(requirement.requirement_type, 'integrated_mining_power'),
        country: text(requirement.country),
        requester_company: text(requirement.requester_company),
        requester_name: text(requirement.requester_name),
        requester_email: text(requirement.requester_email),
        requester_phone: text(requirement.requester_phone),
        answers: normalizeAnswers(requirement.answers),
    };
}

function requirementPayloadSignature(payload = {}) {
    return JSON.stringify(payload);
}

function readRequirementDraft() {
    const key = requirementDraftStorageKey();
    if (!key) return null;
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_error) {
        return null;
    }
}

function writeRequirementDraft(requirement = {}) {
    const key = requirementDraftStorageKey();
    if (!key) return;
    try {
        window.localStorage.setItem(key, JSON.stringify({
            payload: buildRequirementPayload(requirement),
            saved_at: new Date().toISOString(),
        }));
    } catch (_error) {
        // Ignore storage errors and continue with server autosave.
    }
}

function applyRequirementDraft(base = {}, draft = null) {
    if (!draft?.payload) return base;
    const payload = draft.payload;
    return normalizeRequirement({
        ...base,
        title: text(payload.title, base.title),
        requirement_type: text(payload.requirement_type, base.requirement_type),
        country: text(payload.country, base.country),
        requester_company: text(payload.requester_company, base.requester_company),
        requester_name: text(payload.requester_name, base.requester_name),
        requester_email: text(payload.requester_email, base.requester_email),
        requester_phone: text(payload.requester_phone, base.requester_phone),
        answers: normalizeAnswers({
            ...normalizeAnswers(base.answers),
            ...normalizeAnswers(payload.answers),
        }),
        updated_at: text(draft.saved_at || base.updated_at),
    });
}

function updateAutoSaveIndicators() {
    const statusNode = document.getElementById('requirement-autosave-status');
    const timeNode = document.getElementById('requirement-autosave-time');
    const submitNode = document.getElementById('requirement-submit-status');
    const locked = isLocked(state.requirement?.status);
    const statusText = locked
        ? localize('客户已提交，当前公开页为只读状态。')
        : text(state.autoSaveMessage, localize('正在等待填写...'));
    if (statusNode) {
        statusNode.textContent = statusText;
        statusNode.classList.toggle('is-error', !locked && state.autoSaveError);
    }
    if (timeNode) {
        timeNode.textContent = fmtDate(state.lastAutoSavedAt || state.requirement?.updated_at);
    }
    if (submitNode && !locked && !state.submitting) {
        submitNode.textContent = state.autoSaveError
            ? statusText
            : localize(state.submitConfirmed ? '提交后公开需求页会自动锁定。' : '请先勾选最终确认，再提交需求单。');
        submitNode.classList.toggle('is-error', !!state.autoSaveError);
    }
}

function queueRequirementAutoSave(options = {}) {
    if (!state.requirement || isLocked(state.requirement.status) || state.submitting) return;
    writeRequirementDraft(state.requirement);
    state.autoSavePending = true;
    state.autoSaveError = false;
    state.autoSaveMessage = localize('已在本地暂存，正在同步后台...');
    updateAutoSaveIndicators();
    if (state.autoSaveTimer) {
        window.clearTimeout(state.autoSaveTimer);
        state.autoSaveTimer = 0;
    }
    state.autoSaveTimer = window.setTimeout(() => {
        state.autoSaveTimer = 0;
        void saveRequirementDraftToServer(options.force === true);
    }, options.immediate ? 0 : 900);
}

async function saveRequirementDraftToServer(force = false) {
    const supabase = getClient();
    if (!supabase || !state.requirement || isLocked(state.requirement.status)) return;
    const payload = buildRequirementPayload(state.requirement);
    const signature = requirementPayloadSignature(payload);
    if (!force && !state.autoSavePending && signature === state.lastSavedSignature) return;
    if (state.autoSaving) {
        state.autoSaveQueued = true;
        return;
    }

    state.autoSaving = true;
    state.autoSaveError = false;
    state.autoSaveMessage = localize('正在同步填写进度...');
    updateAutoSaveIndicators();

    try {
        const req = text(params.get('req'));
        const token = text(params.get('token'));
        const { data, error } = await supabase.rpc('save_public_quote_requirement_draft', {
            req_slug: req,
            req_token: token,
            payload,
        });
        if (error) throw error;
        const row = Array.isArray(data) ? data[0] : data;
        if (row) state.requirement = normalizeRequirement(row);
        state.lastSavedSignature = requirementPayloadSignature(buildRequirementPayload(state.requirement));
        state.lastAutoSavedAt = text(state.requirement?.updated_at || new Date().toISOString());
        state.autoSavePending = false;
        state.autoSaveMessage = localize('已自动保存，后台可实时查看最新填写进度。');
        writeRequirementDraft(state.requirement);
    } catch (_error) {
        state.autoSavePending = true;
        state.autoSaveError = true;
        state.autoSaveMessage = localize('本地已保存，等待重新同步到后台。');
    } finally {
        state.autoSaving = false;
        updateAutoSaveIndicators();
        if (state.autoSaveQueued) {
            state.autoSaveQueued = false;
            queueRequirementAutoSave({ immediate: true, force: true });
        }
    }
}

function bindAutoSaveLifecycle() {
    if (state.autoSaveBound) return;
    state.autoSaveBound = true;
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && state.requirement && !isLocked(state.requirement.status)) {
            writeRequirementDraft(state.requirement);
            void saveRequirementDraftToServer(true);
        }
    });
    window.addEventListener('beforeunload', () => {
        if (state.requirement && !isLocked(state.requirement.status)) {
            writeRequirementDraft(state.requirement);
        }
    });
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
    const label = options.find((item) => item.value === text(value))?.label || text(value);
    return localize(label);
}

function selectOptionsMarkup(options = [], selected = '') {
    const current = text(selected);
    return options
        .map((item) => `<option value="${esc(item.value)}" ${item.value === current ? 'selected' : ''}>${esc(localize(item.label))}</option>`)
        .join('');
}

function choiceChipMarkup(field, options = [], selectedValues = [], disabled = false) {
    const selectedSet = new Set(normalizeStringList(selectedValues));
    return `
        <div class="requirement-choice-grid">
            ${options.map((item) => `
                <label class="requirement-choice ${selectedSet.has(item.value) ? 'is-active' : ''} ${disabled ? 'is-disabled' : ''}">
                    <input type="checkbox" data-answer-check="${esc(field)}" value="${esc(item.value)}" ${selectedSet.has(item.value) ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
                    <span>${esc(localize(item.label))}</span>
                </label>
            `).join('')}
        </div>
    `;
}

function requirementStatusLabel(status = '') {
    const key = text(status, 'draft');
    if (key === 'draft') return localize('等待提交');
    if (key === 'submitted') return localize('已提交');
    if (key === 'reviewing') return localize('审核中');
    if (key === 'quoted') return localize('已进入报价');
    if (key === 'closed') return localize('已关闭');
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
            <div class="requirement-loading__title">${esc(localize('正在读取需求单...'))}</div>
            <div class="requirement-loading__desc">${esc(localize('请稍候，系统正在校验公开需求链接并加载当前问卷。'))}</div>
        </section>
    `;
}

function renderError(message) {
    document.title = localize('公开需求链接不可用') || 'Requirement Link Unavailable';
    root().innerHTML = `
        <section class="requirement-card requirement-empty">
            <div class="requirement-empty__icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <h1>${esc(localize('公开需求链接不可用'))}</h1>
            <p>${esc(message || localize('当前链接无效、已失效，或还没有对应的需求单。'))}</p>
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
    const availableModels = minerModelOptionsFor(answers.miner_brands);
    const availableModelSet = new Set(availableModels.map((item) => item.value));
    const filteredModels = answers.miner_models.filter((item) => availableModelSet.has(item));
    if (filteredModels.length !== answers.miner_models.length) {
        requirement.answers.miner_models = filteredModels;
    }

    document.title = `${text(requirement.requester_company || requirement.title || localize('矿机与供电需求收集') || 'Requirement Intake')} | GasGx`;
    root().innerHTML = `
        <div class="requirement-page ${locked ? 'is-locked' : ''}">
        ${locked ? `
            <div class="requirement-watermark" aria-hidden="true">
                ${Array.from({ length: 6 }).map(() => `
                    <span>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 1.75c-2.76 0-5 2.24-5 5v3.25H5.5a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V12a2 2 0 0 0-2-2H17V6.75c0-2.76-2.24-5-5-5Zm-3 5a3 3 0 1 1 6 0v3.25H9V6.75Zm3 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"/>
                        </svg>
                        ${esc(localize('已存证不可修改'))}
                    </span>
                `).join('')}
            </div>
        ` : ''}
        <section class="requirement-hero">
            <div class="requirement-hero__copy">
                <div class="requirement-hero__kicker">GASGX REQUIREMENT INTAKE</div>
                <h1>${esc(requirement.title || localize('矿机与供电需求收集'))}</h1>
                <p>${esc(localize('请根据当前这一轮采购或部署计划填写下面的选择题。提交后，这份需求会作为后续报价、跟进和内部协作的统一基线。'))}</p>
            </div>
            <div class="requirement-hero__meta">
                <div class="requirement-status-chip tone-${esc(statusTone(requirement.status))}">${esc(requirementStatusLabel(requirement.status))}</div>
                <div class="requirement-hero__meta-line"><strong>${esc(localize('需求类型'))}</strong><span>${esc(optionLabel(REQUIREMENT_TYPE_OPTIONS, requirement.requirement_type))}</span></div>
                <div class="requirement-hero__meta-line"><strong>${esc(localize('客户提交时间'))}</strong><span>${esc(fmtDate(requirement.submitted_at))}</span></div>
                <div class="requirement-hero__meta-line"><strong>${esc(localize('说明'))}</strong><span>${esc(localize(locked ? '这份需求已经提交，目前为只读状态。' : '提交后将自动锁定，避免后续报价依据反复变化。'))}</span></div>
            </div>
        </section>

        <section class="requirement-card">
            <div class="requirement-section-head">
                <div>
                    <h2>${esc(localize('联系人信息'))}</h2>
                    <p>${esc(localize('这里只保留最必要的联系方式，方便我们确认后续报价和交付细节。'))}</p>
                </div>
            </div>
            <div class="requirement-grid">
                <label class="requirement-field">
                    <span>${esc(localize('客户公司'))}</span>
                    <input class="share-input" data-field="requester_company" value="${esc(requirement.requester_company)}" placeholder="Demo Mining" ${locked ? 'disabled' : ''}>
                </label>
                <label class="requirement-field">
                    <span>${esc(localize('联系人'))}</span>
                    <input class="share-input" data-field="requester_name" value="${esc(requirement.requester_name)}" placeholder="Allen" ${locked ? 'disabled' : ''}>
                </label>
                <label class="requirement-field">
                    <span>${esc(localize('邮箱'))}</span>
                    <input class="share-input" data-field="requester_email" value="${esc(requirement.requester_email)}" placeholder="customer@example.com" ${locked ? 'disabled' : ''}>
                </label>
                <label class="requirement-field">
                    <span>${esc(localize('联系渠道'))}</span>
                    <select class="share-select" data-answer-field="contact_channel" ${locked ? 'disabled' : ''}>
                        ${selectOptionsMarkup(CONTACT_CHANNEL_OPTIONS, answers.contact_channel || 'whatsapp')}
                    </select>
                </label>
                <label class="requirement-field">
                    <span>${esc(localize('账号 / 电话'))}</span>
                    <input class="share-input" data-field="requester_phone" value="${esc(requirement.requester_phone)}" placeholder="${esc(localize('填写账号或手机号'))}" ${locked ? 'disabled' : ''}>
                </label>
                <label class="requirement-field">
                    <span>${esc(localize('国家 / 地区'))}</span>
                    <select class="share-select" data-field="country" ${locked ? 'disabled' : ''}>
                        ${selectOptionsMarkup(COUNTRY_OPTIONS, requirement.country)}
                    </select>
                </label>
                <label class="requirement-field">
                    <span>${esc(localize('需求类型'))}</span>
                    <select class="share-select" data-field="requirement_type" ${locked ? 'disabled' : ''}>
                        ${selectOptionsMarkup(REQUIREMENT_TYPE_OPTIONS, requirement.requirement_type)}
                    </select>
                </label>
            </div>
        </section>

        <section class="requirement-card">
            <div class="requirement-section-head">
                <div>
                    <h2>${esc(localize('矿机偏好'))}</h2>
                    <p>${esc(localize('尽量用选择题完成首轮确认，减少自由输入。'))}</p>
                </div>
            </div>
            <div class="requirement-grid">
                <label class="requirement-field">
                    <span>${esc(localize('部署模式'))}</span>
                    <select class="share-select" data-answer-field="deployment_mode" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.deployment_mode, answers.deployment_mode)}</select>
                </label>
                <label class="requirement-field">
                    <span>${esc(localize('单机算力范围'))}</span>
                    <select class="share-select" data-answer-field="miner_hashrate_band" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.miner_hashrate_band, answers.miner_hashrate_band)}</select>
                </label>
                <label class="requirement-field">
                    <span>${esc(localize('单机功耗范围'))}</span>
                    <select class="share-select" data-answer-field="miner_power_band" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.miner_power_band, answers.miner_power_band)}</select>
                </label>
                <label class="requirement-field">
                    <span>${esc(localize('矿机数量范围'))}</span>
                    <select class="share-select" data-answer-field="miner_quantity_band" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.miner_quantity_band, answers.miner_quantity_band)}</select>
                </label>
                <label class="requirement-field">
                    <span>${esc(localize('电压 / 频率'))}</span>
                    <select class="share-select" data-answer-field="voltage_frequency" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.voltage_frequency, answers.voltage_frequency)}</select>
                </label>
            </div>
            <div class="requirement-field">
                <span>${esc(localize('矿机品牌'))}</span>
                ${choiceChipMarkup('miner_brands', REQUIREMENT_MULTI_OPTIONS.miner_brands, answers.miner_brands, locked)}
            </div>
            <div class="requirement-field">
                <span>${esc(localize('矿机冷却方式'))}</span>
                ${choiceChipMarkup('miner_cooling', REQUIREMENT_MULTI_OPTIONS.miner_cooling, answers.miner_cooling, locked)}
            </div>
            <div class="requirement-field">
                <span>${esc(localize('推荐机型 (Top 10)'))}</span>
                ${minerModelChoiceMarkup(filteredModels, answers.miner_brands, locked)}
            </div>
        </section>

        <section class="requirement-card">
            <div class="requirement-section-head">
                <div>
                    <h2>${esc(localize('交付与现场条件'))}</h2>
                    <p>${esc(localize('这些信息会直接影响配置推荐、报价和交付节奏。'))}</p>
                </div>
            </div>
            <div class="requirement-grid">
                <label class="requirement-field">
                    <span>${esc(localize('供电规模'))}</span>
                    <select class="share-select" data-answer-field="power_capacity_band" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.power_capacity_band, answers.power_capacity_band)}</select>
                </label>
                <label class="requirement-field">
                    <span>${esc(localize('部署偏好'))}</span>
                    <select class="share-select" data-answer-field="container_preference" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.container_preference, answers.container_preference)}</select>
                </label>
                <label class="requirement-field">
                    <span>${esc(localize('噪音要求'))}</span>
                    <select class="share-select" data-answer-field="silent_requirement" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.silent_requirement, answers.silent_requirement)}</select>
                </label>
                <label class="requirement-field">
                    <span>${esc(localize('每 MW 预算'))}</span>
                    <select class="share-select" data-answer-field="budget_band" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.budget_band, answers.budget_band)}</select>
                </label>
                <label class="requirement-field">
                    <span>${esc(localize('期望周期'))}</span>
                    <select class="share-select" data-answer-field="timeline_band" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.timeline_band, answers.timeline_band)}</select>
                </label>
            </div>
            <div class="requirement-field">
                <span>${esc(localize('认证 / 合规要求'))}</span>
                ${choiceChipMarkup('certification_needs', REQUIREMENT_MULTI_OPTIONS.certification_needs, answers.certification_needs, locked)}
            </div>
            <label class="requirement-field">
                <span>${esc(localize('补充说明'))}</span>
                <textarea class="share-input requirement-textarea" data-answer-field="extra_notes" placeholder="${esc(localize('只填写必须说明的现场条件、指定机型或其他特殊要求。'))}" ${locked ? 'disabled' : ''}>${esc(answers.extra_notes)}</textarea>
            </label>
        </section>

        <section class="requirement-card requirement-submit-card">
            <div class="requirement-submit-copy">
                <h2>${esc(localize(locked ? '这份需求已经提交' : '提交并锁定本轮需求'))}</h2>
                <p>${esc(localize(locked ? '如果后续需求变化，请直接联系 GasGx 销售并重新开启新一轮需求单。' : '提交后，这份需求会作为后续报价、跟进和内部协作的统一基线。'))}</p>
            </div>
            ${locked ? '' : `
                <div class="requirement-warning">
                    <strong>${esc(localize('请最终确认'))}</strong>
                    <p>${esc(localize('你的需求将直接决定后续的实际报价、配置推荐和交付评估。这个信息非常重要，请慎重填写后再提交。'))}</p>
                </div>
                <label class="requirement-confirm">
                    <input id="requirement-submit-confirm" type="checkbox" ${state.submitConfirmed ? 'checked' : ''}>
                    <span>${esc(localize('我已确认以上需求信息准确无误，并理解它将直接影响最终报价。'))}</span>
                </label>
            `}
            <div class="requirement-submit-actions">
                <button id="requirement-submit" type="button" class="btn-glow px-5 py-3 inline-flex items-center gap-2" ${buttonDisabled ? 'disabled' : ''}>
                    <i class="fa-solid ${locked ? 'fa-lock' : 'fa-paper-plane'}"></i>
                    <span>${esc(localize(locked ? '已提交' : (state.submitting ? '提交中...' : '提交需求单')))}</span>
                </button>
                <div id="requirement-submit-status" class="requirement-submit-status">${locked ? `${esc(localize('已提交'))} · ${esc(fmtDate(requirement.submitted_at))}` : esc(localize(state.submitConfirmed ? '提交后公开需求页会自动锁定。' : '请先勾选最终确认，再提交需求单。')))}</div>
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
            queueRequirementAutoSave();
        });
        if (node.tagName === 'SELECT') {
            node.addEventListener('change', () => {
                const field = node.dataset.field;
                if (!field) return;
                requirement[field] = node.value;
                queueRequirementAutoSave();
            });
        }
    });

    document.querySelectorAll('[data-answer-field]').forEach((node) => {
        const apply = () => {
            const field = node.dataset.answerField;
            if (!field) return;
            requirement.answers[field] = node.value;
            queueRequirementAutoSave();
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
            queueRequirementAutoSave();
            if (field === 'miner_brands') {
                renderApp();
            }
        });
    });

    document.getElementById('requirement-submit-confirm')?.addEventListener('change', (event) => {
        state.submitConfirmed = !!event.target?.checked;
        const submitButton = document.getElementById('requirement-submit');
        const statusNode = document.getElementById('requirement-submit-status');
        if (submitButton) submitButton.disabled = !state.submitConfirmed || state.submitting;
        if (statusNode) {
            statusNode.textContent = localize(state.submitConfirmed ? '提交后公开需求页会自动锁定。' : '请先勾选最终确认，再提交需求单。');
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
        throw new Error(localize('缺少 req 或 token，无法打开这份公开需求链接。'));
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
        throw new Error(localize('这份公开需求链接不存在，或已经不可用。'));
    }

    const serverRequirement = normalizeRequirement(row);
    const localDraft = !isLocked(serverRequirement.status) ? readRequirementDraft() : null;
    state.requirement = applyRequirementDraft(serverRequirement, localDraft);
    state.submitConfirmed = false;
    state.lastSavedSignature = requirementPayloadSignature(buildRequirementPayload(serverRequirement));
    state.lastAutoSavedAt = text(serverRequirement.updated_at || serverRequirement.submitted_at);
    state.autoSavePending = requirementPayloadSignature(buildRequirementPayload(state.requirement)) !== state.lastSavedSignature;
    state.autoSaveError = false;
    state.autoSaveMessage = isLocked(state.requirement.status)
        ? localize('客户已提交，当前公开页为只读状态。')
        : state.autoSavePending
            ? localize('检测到未同步草稿，正在恢复并同步...')
            : localize('已与后台同步。');
}

async function submitCurrentRequirement() {
    const supabase = getClient();
    if (!supabase || !state.requirement) return;

    if (!state.submitConfirmed) {
        const statusNode = document.getElementById('requirement-submit-status');
        if (statusNode) {
            statusNode.textContent = localize('请先勾选最终确认，再提交需求单。');
            statusNode.classList.add('is-error');
        }
        return;
    }

    state.submitting = true;
    if (state.autoSaveTimer) {
        window.clearTimeout(state.autoSaveTimer);
        state.autoSaveTimer = 0;
    }
    renderApp();

    try {
        if (state.autoSavePending) {
            await saveRequirementDraftToServer(true);
        }
        const req = text(params.get('req'));
        const token = text(params.get('token'));
        const payload = buildRequirementPayload(state.requirement);

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
            statusNode.textContent = text(error?.message, localize('提交失败，请稍后重试。'));
            statusNode.classList.add('is-error');
        }
    }
}

async function init() {
    try {
        state.loading = true;
        if (document?.documentElement) {
            document.documentElement.lang = LOCALE === 'zh' ? 'zh-CN' : LOCALE;
        }
        bindAutoSaveLifecycle();
        renderApp();
        await fetchRequirement();
        state.loading = false;
        renderApp();
        updateAutoSaveIndicators();
        if (state.autoSavePending) {
            queueRequirementAutoSave({ immediate: true, force: true });
        }
    } catch (error) {
        state.loading = false;
        state.error = text(error?.message, '当前公开需求链接不可用。');
        renderApp();
    }
}

void init();
