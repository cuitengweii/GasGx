const SUPABASE_URL = window.AMS_SUPABASE_URL || 'https://mkpcliytqudclkwtewru.supabase.co';
const SUPABASE_KEY = window.AMS_SUPABASE_KEY || 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';
const TABLE_CUSTOMER_ACTIVITIES = 'quote_customer_activities';

const REQUIREMENT_TYPE_OPTIONS = Object.freeze([
    { value: '', label: '请选择需求类型' },
    { value: 'oilfield_gas_to_power', label: '油田伴生气发电' },
    { value: 'integrated_mining_power', label: '燃气发电+算力一体化' },
    { value: 'industrial_power_generation', label: '工业分布式发电' },
    { value: 'chp_project', label: 'CHP 热电联供项目' },
    { value: 'miner_only', label: '独立矿机矿箱' },
    { value: 'power_only', label: '独立燃气发电机组' },
    { value: 'unclear', label: '需要推荐' },
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
    site_type: [
        { value: 'new_greenfield', label: '新建项目' },
        { value: 'existing_brownfield', label: '既有站点改造' },
        { value: 'remote_oilfield', label: '远程油田 / 井场' },
        { value: 'industrial_plant', label: '工业园区 / 工厂' },
        { value: 'chp_site', label: '热电联供 / 热负荷场景' },
        { value: 'unknown', label: '待确认' },
    ],
    target_power: [
        { value: 'under_500kw', label: '500kW 以下' },
        { value: '500kw_1mw', label: '500kW - 1MW' },
        { value: '1mw_5mw', label: '1MW - 5MW' },
        { value: '5mw_10mw', label: '5MW - 10MW' },
        { value: 'over_10mw', label: '10MW 以上' },
        { value: 'need_recommendation', label: '需要推荐' },
    ],
    gas_type: [
        { value: 'natural_gas', label: '天然气' },
        { value: 'associated_gas', label: '伴生气 / APG' },
        { value: 'flare_gas', label: '火炬气 / flare gas' },
        { value: 'biogas', label: '沼气 / landfill gas' },
        { value: 'cbm_cmm', label: '煤层气 / CBM/CMM' },
        { value: 'unknown', label: '待确认' },
    ],
    gas_quality: [
        { value: 'pipeline_grade', label: '管道气 / 稳定气' },
        { value: 'field_gas_treatable', label: '现场气（可预处理）' },
        { value: 'raw_wet_or_sour', label: '原始湿气 / 含硫气' },
        { value: 'low_methane', label: '低甲烷气体' },
        { value: 'report_available', label: '已有气体分析报告' },
        { value: 'unknown', label: '待确认' },
    ],
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
    deployment_preference: [
        { value: 'containerized', label: '集装箱化' },
        { value: 'ais_integrated', label: 'AIS 一体化' },
        { value: 'skid_mounted', label: '撬装 / skid' },
        { value: 'site_built', label: '场站定制' },
        { value: 'need_recommendation', label: '需要推荐' },
    ],
    container_preference: [
        { value: 'integrated_container', label: '整柜一体化' },
        { value: 'rack_only', label: '仅机架 / 机位' },
        { value: 'site_buildout', label: '场站部署' },
        { value: 'need_recommendation', label: '需要推荐' },
    ],
    delivery_scope: [
        { value: 'generator_only', label: '仅发电机组' },
        { value: 'generator_plus_switchgear', label: '发电机组 + 开关柜 / 配电' },
        { value: 'generator_plus_enclosure', label: '发电机组 + 冷却 / 箱体' },
        { value: 'packaged_solution', label: '成套交付（含控制与调试）' },
        { value: 'unknown', label: '待确认' },
    ],
    service_scope: [
        { value: 'equipment_only', label: '仅设备供货' },
        { value: 'commissioning_support', label: '指导安装 / 调试支持' },
        { value: 'long_term_om', label: '长期运维支持' },
        { value: 'spares_and_network', label: '备件与服务网络' },
        { value: 'unknown', label: '待确认' },
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
        { value: 'air', label: '风冷' },
        { value: 'liquid', label: '液冷' },
        { value: 'immersion', label: '浸没式' },
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

const LATEST_MINER_MODEL_CATALOG = Object.freeze({
    bitmain: [
        { value: 'antminer-s23-hyd', model: 'Antminer S23 Hyd', hashrate: 'Latest series', power: 'Hydro' },
        { value: 'antminer-s23', model: 'Antminer S23', hashrate: 'Latest series', power: 'Air' },
        { value: 'antminer-s21-xp-hyd', model: 'Antminer S21 XP Hyd', hashrate: '473 TH/s', power: '5676W' },
        { value: 'antminer-s21-pro-hyd', model: 'Antminer S21 Pro Hyd', hashrate: 'Hydro series', power: '--' },
        { value: 'antminer-s21-xp', model: 'Antminer S21 XP', hashrate: '270 TH/s', power: '--' },
        { value: 'antminer-s21-pro', model: 'Antminer S21 Pro', hashrate: '234 TH/s', power: '3510W' },
        { value: 'antminer-s21-200t', model: 'Antminer S21', hashrate: '200 TH/s', power: '3500W' },
    ],
    microbt: [
        { value: 'whatsminer-m66s-plus-plus', model: 'WhatsMiner M66S++', hashrate: 'Immersion series', power: '--' },
        { value: 'whatsminer-m66s-plus', model: 'WhatsMiner M66S+', hashrate: 'Immersion series', power: '--' },
        { value: 'whatsminer-m66s', model: 'WhatsMiner M66S', hashrate: 'Immersion series', power: '--' },
        { value: 'whatsminer-m66', model: 'WhatsMiner M66', hashrate: 'Immersion series', power: '--' },
        { value: 'whatsminer-m65s', model: 'WhatsMiner M65S', hashrate: 'Hydro series', power: '--' },
        { value: 'whatsminer-m64', model: 'WhatsMiner M64', hashrate: 'Hydro series', power: '--' },
        { value: 'whatsminer-m63s-plus-plus', model: 'WhatsMiner M63S++', hashrate: 'Hydro / immersion', power: '--' },
        { value: 'whatsminer-m61', model: 'WhatsMiner M61 Series', hashrate: 'Air series', power: '~5000W OC' },
        { value: 'whatsminer-m60s', model: 'WhatsMiner M60S', hashrate: '170-186 TH/s', power: '3145-3441W' },
    ],
    canaan: [
        { value: 'avalon-a16xp-300t', model: 'AvalonMiner A16XP-300T', hashrate: '300 TH/s', power: '3850W' },
        { value: 'avalon-a16-282t', model: 'AvalonMiner A16-282T', hashrate: '282 TH/s', power: '3900W' },
        { value: 'avalon-a15-200t', model: 'AvalonMiner A15-200T', hashrate: '200 TH/s', power: '3760W' },
        { value: 'avalon-a1566ha-500t', model: 'AvalonMiner A1566HA-500T', hashrate: '500 TH/s', power: '8064W' },
        { value: 'avalon-a1566ha-480t', model: 'AvalonMiner A1566HA-480T', hashrate: '480 TH/s', power: '8064W' },
        { value: 'avalon-a15pro-221t', model: 'AvalonMiner A15Pro', hashrate: '221 TH/s', power: '3662W' },
        { value: 'avalon-a15xp-209t', model: 'AvalonMiner A15XP', hashrate: '209 TH/s', power: '3667W' },
    ],
    bitdeer: [
        { value: 'sealminer-a3-pro-hyd', model: 'SEALMINER A3 Pro Hydro', hashrate: '660 TH/s', power: '7875-8625W' },
        { value: 'sealminer-a3-hyd', model: 'SEALMINER A3 Hydro', hashrate: '500 TH/s', power: '6210-7290W' },
        { value: 'sealminer-a3-pro-air', model: 'SEALMINER A3 Pro Air', hashrate: '290 TH/s', power: '3250-4000W' },
        { value: 'sealminer-a3-air', model: 'SEALMINER A3 Air', hashrate: '260 TH/s', power: '3360-3920W' },
        { value: 'sealminer-a2-pro-hyd', model: 'SEALMINER A2 Pro Hydro', hashrate: '500 TH/s', power: '--' },
        { value: 'sealminer-a2-pro-air', model: 'SEALMINER A2 Pro Air', hashrate: '260 TH/s', power: '--' },
        { value: 'sealminer-a2-hyd', model: 'SEALMINER A2 Hydro', hashrate: '446 TH/s', power: '--' },
        { value: 'sealminer-a2', model: 'SEALMINER A2', hashrate: '226 TH/s', power: '3729W' },
    ],
    auradine: [
        { value: 'teraflux-ah3880', model: 'Teraflux AH3880', hashrate: '100-600 TH/s', power: 'Hydro' },
        { value: 'teraflux-ai3680', model: 'Teraflux AI3680', hashrate: '40-365 TH/s', power: 'Immersion' },
        { value: 'teraflux-at2880', model: 'Teraflux AT2880', hashrate: '40-270 TH/s', power: '5000W' },
        { value: 'teraflux-at2870', model: 'Teraflux AT2870', hashrate: 'Air-cooled', power: '--' },
        { value: 'teraflux-at1500', model: 'Teraflux AT1500', hashrate: 'Air-cooled', power: '--' },
    ],
});

function minerBrandLabelMap() {
    return Object.fromEntries(REQUIREMENT_MULTI_OPTIONS.miner_brands.map((item) => [item.value, localize(item.label)]));
}

const COUNTRY_LABEL_ALIASES = Object.freeze({
    Bolivia: 'BO',
    Brunei: 'BN',
    'Cape Verde': 'CV',
    'Congo (Congo-Brazzaville)': 'CG',
    Czechia: 'CZ',
    Iran: 'IR',
    Laos: 'LA',
    Micronesia: 'FM',
    Moldova: 'MD',
    'North Korea': 'KP',
    Russia: 'RU',
    'South Korea': 'KR',
    Syria: 'SY',
    Taiwan: 'TW',
    Turkey: 'TR',
    'Vatican City': 'VA',
    Venezuela: 'VE',
    Vietnam: 'VN',
});

function minerModelOptionsFor(brands = []) {
    const selected = normalizeStringList(brands).filter((brand) => brand !== 'other');
    if (!selected.length) return [];
    const brandLabels = minerBrandLabelMap();
    return selected.flatMap((brand) => {
        const entries = (LATEST_MINER_MODEL_CATALOG[brand] || MINER_MODEL_CATALOG[brand] || []).slice(0, 12);
        return entries.map((entry) => ({
            ...entry,
            brand,
            brandLabel: brandLabels[brand] || brand,
        }));
    });
}

function allMinerModelOptions() {
    return Object.keys({ ...MINER_MODEL_CATALOG, ...LATEST_MINER_MODEL_CATALOG })
        .flatMap((brand) => minerModelOptionsFor([brand]));
}

function normalizeMinerCooling(value) {
    return normalizeStringList(value)
        .map((item) => {
            const normalized = text(item).toLowerCase();
            if (!normalized || normalized === 'unknown') return '';
            if (normalized === 'hydro') return 'liquid';
            return normalized;
        })
        .filter(Boolean)
        .slice(0, 1);
}

function parseNumericMax(raw) {
    const value = text(raw).replace(/[–—]/g, '-');
    const matches = value.match(/\d+(?:\.\d+)?/g);
    if (!matches?.length) return null;
    return Math.max(...matches.map((item) => Number(item)));
}

function inferCoolingType(entry = {}) {
    const raw = `${text(entry.model)} ${text(entry.hashrate)} ${text(entry.power)}`.toLowerCase();
    if (raw.includes('immersion')) return 'immersion';
    if (raw.includes('hyd') || raw.includes('hydro') || raw.includes('liquid') || raw.includes('water')) return 'liquid';
    if (raw.includes('air')) return 'air';
    return '';
}

function inferHashrateBand(entry = {}) {
    const max = parseNumericMax(entry.hashrate);
    if (max == null) return 'need_recommendation';
    if (max < 150) return 'under_150t';
    if (max <= 200) return '150t_200t';
    if (max <= 300) return '200t_300t';
    return 'over_300t';
}

function inferPowerBand(entry = {}) {
    const raw = text(entry.power).toLowerCase();
    const max = parseNumericMax(raw);
    if (max == null) return 'need_recommendation';
    const kw = raw.includes('kw') ? max : max / 1000;
    if (kw < 3) return 'under_3kw';
    if (kw <= 4) return '3kw_4kw';
    if (kw <= 5.5) return '4kw_5_5kw';
    return 'over_5_5kw';
}

function selectedMinerModelEntry(requirement = state.requirement) {
    const answers = normalizeAnswers(requirement?.answers);
    const selectedValue = answers.miner_models[0] || '';
    if (!selectedValue) return null;
    return minerModelOptionsFor(answers.miner_brands).find((item) => item.value === selectedValue)
        || allMinerModelOptions().find((item) => item.value === selectedValue)
        || null;
}

function syncDerivedAnswersFromSelectedModel(requirement = state.requirement, { resetIfMissing = false } = {}) {
    if (!requirement?.answers) return;
    const entry = selectedMinerModelEntry(requirement);
    if (!entry) {
        if (resetIfMissing) {
            requirement.answers.miner_hashrate_band = 'need_recommendation';
            requirement.answers.miner_power_band = 'need_recommendation';
            requirement.answers.miner_cooling = [];
        }
        return;
    }
    requirement.answers.miner_hashrate_band = inferHashrateBand(entry);
    requirement.answers.miner_power_band = inferPowerBand(entry);
    requirement.answers.miner_cooling = normalizeMinerCooling([inferCoolingType(entry)]);
}

function minerCoolingLabel(value = '') {
    const current = text(value);
    const label = REQUIREMENT_MULTI_OPTIONS.miner_cooling.find((item) => item.value === current)?.label || current;
    return localize(label);
}

function minerDerivedFieldsMarkup(answers = {}, locked = false) {
    const hasModel = normalizeStringList(answers.miner_models).length > 0;
    const coolingValue = normalizeMinerCooling(answers.miner_cooling)[0] || '';
    const readOnlyText = (value, fallback = '将随推荐机型自动填入') => {
        if (!hasModel) return localize('请先选择推荐机型');
        return value ? value : localize(fallback);
    };
    return `
        <div class="requirement-grid">
            <label class="requirement-field" data-required-field="miner_hashrate_band">
                <span>${esc(localize('矿机算力范围'))}</span>
                <input class="share-input" value="${esc(readOnlyText(optionLabel(REQUIREMENT_SELECT_OPTIONS.miner_hashrate_band, answers.miner_hashrate_band), '请先选择推荐机型'))}" readonly disabled>
            </label>
            <label class="requirement-field" data-required-field="miner_power_band">
                <span>${esc(localize('矿机功耗范围'))}</span>
                <input class="share-input" value="${esc(readOnlyText(optionLabel(REQUIREMENT_SELECT_OPTIONS.miner_power_band, answers.miner_power_band), '请先选择推荐机型'))}" readonly disabled>
            </label>
            <label class="requirement-field" data-required-field="miner_cooling">
                <span>${esc(localize('散热机位类型'))}</span>
                <input class="share-input" value="${esc(readOnlyText(minerCoolingLabel(coolingValue), '请先选择推荐机型'))}" readonly disabled>
            </label>
            <label class="requirement-field ${state.validationErrors.miner_quantity_band ? 'is-invalid' : ''}" data-required-field="miner_quantity_band">
                <span>${esc(localize('矿机数量范围'))}</span>
                <select class="share-select" data-answer-field="miner_quantity_band" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.miner_quantity_band, answers.miner_quantity_band)}</select>
                ${fieldErrorMarkup('miner_quantity_band')}
            </label>
            <label class="requirement-field ${state.validationErrors.voltage_frequency ? 'is-invalid' : ''}" data-required-field="voltage_frequency">
                <span>${esc(localize('电压 / 频率'))}</span>
                <select class="share-select" data-answer-field="voltage_frequency" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.voltage_frequency, answers.voltage_frequency)}</select>
                ${fieldErrorMarkup('voltage_frequency')}
            </label>
        </div>
    `;
}

function localizedCountryOptions(locale = state?.locale || 'zh') {
    const targetLocale = locale === 'zh' ? 'zh-CN' : locale === 'ru' ? 'ru-RU' : 'en-US';
    let displayNames = null;
    let reverseMap = null;
    try {
        displayNames = new Intl.DisplayNames([targetLocale], { type: 'region' });
        reverseMap = new Map(
            Intl.supportedValuesOf('region')
                .map((code) => [new Intl.DisplayNames(['en-US'], { type: 'region' }).of(code), code])
                .filter((entry) => entry[0] && entry[1]),
        );
    } catch (_error) {
        return COUNTRY_OPTIONS;
    }
    return COUNTRY_OPTIONS.map((item) => {
        if (!item.value) return { ...item };
        const code = COUNTRY_LABEL_ALIASES[item.value] || reverseMap.get(item.value);
        return {
            ...item,
            label: code ? (displayNames.of(code) || item.label) : item.label,
        };
    });
}

function minerModelChoiceMarkup(selectedValues = [], brands = [], disabled = false) {
    const options = minerModelOptionsFor(brands);
    if (!options.length) {
        return `<div class="requirement-empty-hint">${esc(localize('请先选择矿机品牌'))}</div>`;
    }
    const selectedValue = normalizeStringList(selectedValues)[0] || '';
    return `
        <select class="share-select" data-answer-field="miner_model" ${disabled ? 'disabled' : ''}>
            <option value="">${esc(localize('璇烽€夋嫨鎺ㄨ崘鏈哄瀷'))}</option>
            ${options.map((item) => `
                <option value="${esc(item.value)}" ${item.value === selectedValue ? 'selected' : ''}>
                    ${esc(`${item.model} · ${item.brandLabel} · ${item.hashrate} · ${item.power}`)}
                        <small>${esc(item.brandLabel)} · ${esc(item.hashrate)} · ${esc(item.power)}</small>
                </option>
            `).join('')}
        </select>
    `;
}

function minerModelChoiceSelectMarkup(selectedValues = [], brands = [], disabled = false) {
    const options = minerModelOptionsFor(brands);
    const selectedValue = normalizeStringList(selectedValues)[0] || '';
    if (!options.length) {
        return `<div class="requirement-empty-hint">${esc(localize('请先选择矿机品牌'))}</div>`;
    }
    return `
        <select class="share-select" data-answer-field="miner_model" ${disabled ? 'disabled' : ''}>
            <option value="">${esc(localize('请选择推荐机型'))}</option>
            ${options.map((item) => `<option value="${esc(item.value)}" ${item.value === selectedValue ? 'selected' : ''}>${esc(`${item.model} · ${item.brandLabel} · ${item.hashrate} · ${item.power}`)}</option>`).join('')}
        </select>
    `;
}

const state = {
    requirement: null,
    error: '',
    loading: true,
    locale: 'zh',
    viewOnly: false,
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
    lastChangedField: '',
    autoSaveBound: false,
    validationErrors: {},
    authUser: null,
    authError: '',
};

let params = new URL(window.location.href).searchParams;
let languageDropdownGlobalBound = false;
const SUPPORTED_LOCALES = ['zh', 'en', 'ru'];
function isViewOnlyAccess() {
    return text(params.get('mode')).toLowerCase() === 'readonly';
}
function resolveLocale(rawValue = '') {
    const raw = text(rawValue || params.get('lang')).toLowerCase();
    if (SUPPORTED_LOCALES.includes(raw)) return raw;
    return 'zh';
}
state.locale = resolveLocale();

const LABEL_MAP = Object.freeze({
    '矿机与供电需求收集': { en: 'Mining & Power Requirement Intake', ru: 'Сбор потребностей по майнингу и электропитанию' },
    '客户需求单': { en: 'Customer Request', ru: 'Запрос клиента' },
    '请根据当前这一轮采购或部署计划填写下面的选择题。提交后，这份需求会作为后续报价、跟进和内部协作的统一基线。': {
        en: 'Please fill in the selections based on your current procurement or deployment plan. After submission, this request becomes the baseline for pricing and follow-up.',
        ru: 'Пожалуйста, заполните выборы исходя из текущего плана закупки или развертывания. После отправки этот запрос станет базовой линией для расчета и дальнейшей работы.',
    },
    '需求类型': { en: 'Requirement Type', ru: 'Тип запроса' },
    '请选择需求类型': { en: 'Select requirement type', ru: 'Выберите тип запроса' },
    '油田伴生气发电': { en: 'Oilfield Associated Gas Power', ru: 'Энергоснабжение oilfield на попутном газе' },
    '燃气发电+算力一体化': { en: 'Integrated Gas Power + Compute', ru: 'Интегрированный gas power + compute' },
    '工业分布式发电': { en: 'Industrial Distributed Generation', ru: 'Промышленная распределенная генерация' },
    'CHP 热电联供项目': { en: 'CHP / Cogeneration Project', ru: 'Проект CHP / когенерации' },
    '客户提交时间': { en: 'Submitted At', ru: 'Время отправки' },
    '说明': { en: 'Note', ru: 'Примечание' },
    '这份需求已经提交，目前为只读状态。': { en: 'This request has been submitted and is now read-only.', ru: 'Этот запрос отправлен и теперь доступен только для чтения.' },
    '提交后将自动锁定，避免后续报价依据反复变化。': { en: 'After submission it will be locked to avoid changes to the pricing baseline.', ru: 'После отправки он будет заблокирован, чтобы избежать изменений базы для расчета.' },
    '售前项目需求收集': { en: 'Pre-Sales Project Intake', ru: 'Сбор проектных данных для pre-sales' },
    '联系人信息': { en: 'Contact Details', ru: 'Контактные данные' },
    '这里只保留最必要的联系方式，方便我们确认后续报价和交付细节。': {
        en: 'Only essential contact details are collected to confirm pricing and delivery.',
        ru: 'Собираются только основные контакты для уточнения цены и поставки.',
    },
    '项目基础信息': { en: 'Project Basics', ru: 'Базовая информация по проекту' },
    '请先确认项目场景、目标规模和气源条件，这些信息决定推荐方向。': {
        en: 'Start with the project scenario, target scale and gas boundary. These inputs shape the recommendation direction.',
        ru: 'Сначала уточните сценарий проекта, масштаб и параметры газа. Эти данные определяют направление рекомендации.',
    },
    '项目技术与交付范围': { en: 'Technical & Delivery Scope', ru: 'Технические и поставочные границы' },
    '这些信息会直接影响报价边界、交付范围和后续服务方式。': {
        en: 'These inputs directly shape the quotation boundary, delivery scope and service model.',
        ru: 'Эти данные напрямую влияют на рамку предложения, границы поставки и сервисную модель.',
    },
    '矿机与负载信息': { en: 'Miner & Load Details', ru: 'Данные по майнерам и нагрузке' },
    '仅当项目包含算力 / 矿机负载时填写这一组信息。': {
        en: 'Fill this section only when the project includes compute or miner load.',
        ru: 'Заполняйте этот раздел только если проект включает вычислительную или miner-нагрузку.',
    },
    '站点类型': { en: 'Site Type', ru: 'Тип площадки' },
    '目标功率': { en: 'Target Power', ru: 'Требуемая мощность' },
    '气源类型': { en: 'Gas Type', ru: 'Тип газа' },
    '气质情况': { en: 'Gas Quality', ru: 'Качество газа' },
    '可用气量 / 压力': { en: 'Available Flow / Pressure', ru: 'Доступный расход / давление' },
    '部署偏好': { en: 'Deployment Preference', ru: 'Предпочтительный deployment' },
    '交付范围': { en: 'Delivery Scope', ru: 'Границы поставки' },
    '服务范围': { en: 'Service Scope', ru: 'Сервисный объем' },
    '例如：2 MMSCFD @ 5 bar，或已具备气体分析报告': {
        en: 'Example: 2 MMSCFD @ 5 bar, or gas analysis report available',
        ru: 'Например: 2 MMSCFD @ 5 bar, или уже есть анализ газа',
    },
    '这里可填写可用流量、压力、气体报告编号或其他关键约束': {
        en: 'Use this field for available flow, pressure, gas report reference, or other critical constraints.',
        ru: 'Здесь можно указать расход, давление, номер анализа газа или другие ключевые ограничения.',
    },
    '如涉及指定机型、并网限制、冬化、防爆、噪音或物流限制，请在这里补充说明。': {
        en: 'Use this field for requested models, grid limits, winterization, hazardous-area, noise, or logistics constraints.',
        ru: 'Используйте это поле для указания нужных моделей, ограничений по сети, winterization, hazardous-area, шуму или логистике.',
    },
    '当前为公开售前收资入口，填写后会自动创建专属需求单。': {
        en: 'This is the public pre-sales intake. A dedicated requirement record will be created automatically after you start filling it.',
        ru: 'Это публичный pre-sales intake. После начала заполнения система автоматически создаст отдельный requirement record.',
    },
    '客户公司': { en: 'Company', ru: 'Компания' },
    '联系人': { en: 'Contact Person', ru: 'Контактное лицо' },
    '邮箱': { en: 'Email', ru: 'Email' },
    '联系渠道': { en: 'Contact Channel', ru: 'Канал связи' },
    '账号 / 电话': { en: 'Handle / Phone', ru: 'Аккаунт / Телефон' },
    '填写账号或手机号': { en: 'Enter handle or phone number', ru: 'Введите аккаунт или номер телефона' },
    '国家 / 地区': { en: 'Country / Region', ru: 'Страна / Регион' },
    '请选择国家 / 地区': { en: 'Select country / region', ru: 'Выберите страну / регион' },
    '新建项目': { en: 'New project', ru: 'Новый проект' },
    '既有站点改造': { en: 'Existing site upgrade', ru: 'Модернизация существующей площадки' },
    '远程油田 / 井场': { en: 'Remote oilfield / wellsite', ru: 'Удаленный oilfield / wellsite' },
    '工业园区 / 工厂': { en: 'Industrial park / factory', ru: 'Промышленная площадка / завод' },
    '热电联供 / 热负荷场景': { en: 'CHP / heat-use scenario', ru: 'CHP / сценарий с тепловой нагрузкой' },
    '500kW 以下': { en: 'Under 500 kW', ru: 'Менее 500 кВт' },
    '500kW - 1MW': { en: '500 kW - 1 MW', ru: '500 кВт - 1 МВт' },
    '5MW - 10MW': { en: '5 MW - 10 MW', ru: '5 МВт - 10 МВт' },
    '10MW 以上': { en: 'Over 10 MW', ru: 'Более 10 МВт' },
    '天然气': { en: 'Natural gas', ru: 'Природный газ' },
    '伴生气 / APG': { en: 'Associated gas / APG', ru: 'Попутный газ / APG' },
    '火炬气 / flare gas': { en: 'Flare gas', ru: 'Факельный газ' },
    '沼气 / landfill gas': { en: 'Biogas / landfill gas', ru: 'Биогаз / landfill gas' },
    '煤层气 / CBM/CMM': { en: 'CBM / CMM', ru: 'CBM / CMM' },
    '管道气 / 稳定气': { en: 'Pipeline-grade / stable gas', ru: 'Трубопроводный / стабильный газ' },
    '现场气（可预处理）': { en: 'Field gas (treatable)', ru: 'Площадочный газ (с возможностью подготовки)' },
    '原始湿气 / 含硫气': { en: 'Raw wet / sour gas', ru: 'Сырой влажный / сернистый газ' },
    '低甲烷气体': { en: 'Low-methane gas', ru: 'Газ с низким метановым числом' },
    '已有气体分析报告': { en: 'Gas analysis report available', ru: 'Есть анализ газа' },
    '集装箱化': { en: 'Containerized', ru: 'Контейнерный формат' },
    'AIS 一体化': { en: 'AIS-integrated', ru: 'AIS-интеграция' },
    '撬装 / skid': { en: 'Skid-mounted', ru: 'Skid-mounted' },
    '场站定制': { en: 'Site-built customization', ru: 'Кастомизация под площадку' },
    '仅发电机组': { en: 'Generator set only', ru: 'Только генераторный блок' },
    '发电机组 + 开关柜 / 配电': { en: 'Generator set + switchgear / distribution', ru: 'Генераторный блок + switchgear / распределение' },
    '发电机组 + 冷却 / 箱体': { en: 'Generator set + cooling / enclosure', ru: 'Генераторный блок + охлаждение / enclosure' },
    '成套交付（含控制与调试）': { en: 'Packaged delivery (including controls and commissioning)', ru: 'Комплектная поставка (включая управление и commissioning)' },
    '仅设备供货': { en: 'Equipment supply only', ru: 'Только поставка оборудования' },
    '指导安装 / 调试支持': { en: 'Installation guidance / commissioning support', ru: 'Шефмонтаж / commissioning support' },
    '长期运维支持': { en: 'Long-term O&M support', ru: 'Долгосрочная O&M поддержка' },
    '备件与服务网络': { en: 'Spares and service network', ru: 'Запчасти и сервисная сеть' },
    '矿机偏好': { en: 'Miner Preferences', ru: 'Предпочтения по майнерам' },
    '尽量用选择题完成首轮确认，减少自由输入。': {
        en: 'Use selections for the first pass to reduce free text.',
        ru: 'Для первого шага используйте выборы, чтобы уменьшить свободный ввод.',
    },
    '部署模式': { en: 'Deployment Mode', ru: 'Режим развертывания' },
    '矿机算力范围': { en: 'Miner Hashrate Range', ru: 'Диапазон хэшрейта майнера' },
    '矿机功耗范围': { en: 'Miner Power Range', ru: 'Диапазон энергопотребления майнера' },
    '矿机数量范围': { en: 'Miner Quantity', ru: 'Количество майнеров' },
    '电压 / 频率': { en: 'Voltage / Frequency', ru: 'Напряжение / Частота' },
    '矿机品牌': { en: 'Miner Brands', ru: 'Бренды майнеров' },
    '矿机冷却方式': { en: 'Cooling Type', ru: 'Тип охлаждения' },
    '散热机位类型': { en: 'Cooling Slot Type', ru: 'Тип посадочного места по охлаждению' },
    '推荐机型 (Top 10)': { en: 'Suggested Models (Top 10)', ru: 'Рекомендуемые модели (Топ 10)' },
    '需求已存证': { en: 'Request Archived', ru: 'Запрос зафиксирован' },
    '请先选择矿机品牌': { en: 'Select miner brands first', ru: 'Сначала выберите бренды майнеров' },
    '将随推荐机型自动填入': { en: 'Will auto-fill after model selection', ru: 'Будет заполнено автоматически после выбора модели' },
    '请先选择推荐机型': { en: 'Please select a recommended model first', ru: 'Сначала выберите рекомендованную модель' },
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
    '请选择推荐机型': { en: 'Select recommended miner model', ru: 'Выберите рекомендованную модель майнера' },
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
    '风冷': { en: 'Air Cooling', ru: 'Воздушное охлаждение' },
    '液冷': { en: 'Liquid Cooling', ru: 'Жидкостное охлаждение' },
    '浸没式': { en: 'Immersion', ru: 'Иммерсионное охлаждение' },
    '待推荐': { en: 'Need recommendation', ru: 'Нужна рекомендация' },
    '并网 / 电力接口合规': { en: 'Grid / power compliance', ru: 'Соответствие подключению' },
    '暂无明确要求': { en: 'No specific requirements', ru: 'Без требований' },
    '燃气发电+矿箱一体化': { en: 'Integrated gas power + mining container', ru: 'Интегрированное решение: газовая генерация + майнинг-контейнер' },
    '独立矿机矿箱': { en: 'Standalone miners / mining container', ru: 'Отдельные майнеры / майнинг-контейнер' },
    '独立燃气发电机组': { en: 'Standalone gas generator set', ru: 'Отдельная газовая генераторная установка' },
    '需要推荐': { en: 'Need recommendation', ru: 'Нужна рекомендация' },
    'Other': { en: 'Other', ru: 'Другое' },
    '客户公司不能为空。': { en: 'Company is required.', ru: 'Укажите компанию.' },
    '联系人不能为空。': { en: 'Contact name is required.', ru: 'Укажите контактное лицо.' },
    '请输入有效的邮箱地址。': { en: 'Enter a valid email address.', ru: 'Введите корректный email.' },
    '联系渠道不能为空。': { en: 'Select a contact channel.', ru: 'Выберите канал связи.' },
    '账号或电话至少填写 5 个字符。': { en: 'Handle or phone must be at least 5 characters.', ru: 'Аккаунт или телефон должен содержать не менее 5 символов.' },
    '请选择国家 / 地区。': { en: 'Select a country or region.', ru: 'Выберите страну или регион.' },
    '请先补全并修正联系人信息。': { en: 'Please complete and correct the contact details first.', ru: 'Сначала заполните и исправьте контактные данные.' },
    '语言': { en: 'Language', ru: 'Язык' },
});

function localize(value) {
    const raw = text(value);
    if (!raw || state.locale === 'zh') return raw;
    const mapped = LABEL_MAP[raw];
    return mapped?.[state.locale] || mapped?.en || raw;
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
    const normalizedTargetPower = text(source.target_power || source.power_capacity_band || 'need_recommendation');
    const normalizedDeploymentPreference = text(source.deployment_preference || source.container_preference || 'need_recommendation');
    return {
        site_type: text(source.site_type || 'unknown'),
        target_power: normalizedTargetPower,
        gas_type: text(source.gas_type || 'unknown'),
        gas_quality: text(source.gas_quality || 'unknown'),
        available_flow: text(source.available_flow),
        deployment_mode: text(source.deployment_mode || 'new_site'),
        contact_channel: text(source.contact_channel || 'whatsapp'),
        miner_brands: normalizeStringList(source.miner_brands),
        miner_models: normalizeStringList(source.miner_models),
        miner_cooling: normalizeMinerCooling(source.miner_cooling),
        miner_hashrate_band: text(source.miner_hashrate_band || 'need_recommendation'),
        miner_power_band: text(source.miner_power_band || 'need_recommendation'),
        miner_quantity_band: text(source.miner_quantity_band || 'unknown'),
        power_capacity_band: normalizedTargetPower,
        voltage_frequency: text(source.voltage_frequency || 'custom'),
        deployment_preference: normalizedDeploymentPreference,
        container_preference: normalizedDeploymentPreference,
        delivery_scope: text(source.delivery_scope || 'unknown'),
        service_scope: text(source.service_scope || 'unknown'),
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
        public_slug: text(row.public_slug || row.publicSlug || state?.requirement?.public_slug),
        public_token: text(row.public_token || row.publicToken || state?.requirement?.public_token),
        title: text(row.title),
        status: text(row.status, 'draft'),
        requirement_type: text(row.requirement_type),
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

function isMiningRequirementType(requirementType = '') {
    return ['integrated_mining_power', 'miner_only'].includes(text(requirementType));
}

function createEmptyRequirementDraft(seed = {}) {
    return normalizeRequirement({
        status: 'draft',
        requirement_type: '',
        requester_company: '',
        requester_name: '',
        requester_email: '',
        requester_phone: '',
        country: '',
        public_slug: '',
        public_token: '',
        answers: {
            contact_channel: 'whatsapp',
            deployment_mode: 'new_site',
            site_type: 'unknown',
            target_power: 'need_recommendation',
            gas_type: 'unknown',
            gas_quality: 'unknown',
            deployment_preference: 'need_recommendation',
            delivery_scope: 'unknown',
            service_scope: 'unknown',
            ...normalizeAnswers(seed.answers || {}),
        },
        ...seed,
    });
}

function requirementStageKey(status = '') {
    const normalized = text(status, 'draft');
    if (normalized === 'submitted' || normalized === 'reviewing') return 'requirement_confirmed';
    if (normalized === 'quoted') return 'quote_preparing';
    if (normalized === 'closed') return 'closed_lost';
    return 'requirement_capture';
}

async function logRequirementActivity(activityType, actionLabel, detail = {}) {
    const requirement = state.requirement;
    if (!requirement?.customer_id || !requirement?.id) return;
    const supabase = getClient();
    if (!supabase) return;

    try {
        await supabase.from(TABLE_CUSTOMER_ACTIVITIES).insert({
            customer_id: requirement.customer_id,
            requirement_id: requirement.id,
            stage_key: requirementStageKey(requirement.status),
            actor_type: 'customer',
            actor_label: text(requirement.requester_name || requirement.requester_company || 'Customer'),
            activity_type: text(activityType),
            entity_type: 'requirement',
            entity_id: requirement.id,
            page_key: 'quote-requirements',
            action_label: text(actionLabel),
            detail_json: detail && typeof detail === 'object' ? detail : {},
        });
    } catch (_error) {
        // Best-effort logging for public requirement interactions.
    }
}

function requirementDraftStorageKey() {
    const req = text(params.get('req'));
    const token = text(params.get('token'));
    if (!req || !token) return 'gasgx.requirement.draft:public-intake';
    return `gasgx.requirement.draft:${req}:${token}`;
}

function currentRequirementLink() {
    return {
        req: text(params.get('req')),
        token: text(params.get('token')),
    };
}

function setRequirementLink(req = '', token = '') {
    if (!req || !token) return;
    const url = new URL(window.location.href);
    url.searchParams.set('req', req);
    url.searchParams.set('token', token);
    window.history.replaceState({}, '', url.toString());
    params = url.searchParams;
}

function buildRequirementPayload(requirement = {}) {
    return {
        title: text(requirement.title),
        requirement_type: text(requirement.requirement_type),
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
    const locked = isReadOnlyMode(state.requirement);
    const submittedLocked = isLocked(state.requirement?.status);
    const statusText = locked
        ? localize(submittedLocked ? '客户已提交，当前公开页为只读状态。' : '当前为只读预览，不能填写或同步。')
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
    if (!state.requirement || isReadOnlyMode(state.requirement) || state.submitting) return;
    state.lastChangedField = text(options.field);
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

async function ensurePublicRequirementOnServer(supabase, payload) {
    const link = currentRequirementLink();
    if (link.req && link.token) return link;

    const { data, error } = await supabase.rpc('create_public_quote_requirement', {
        payload,
    });
    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
        throw new Error(localize('公开需求链接不可用'));
    }

    state.requirement = normalizeRequirement(row);
    setRequirementLink(state.requirement.public_slug, state.requirement.public_token);
    writeRequirementDraft(state.requirement);
    return currentRequirementLink();
}

async function saveRequirementDraftToServer(force = false) {
    const supabase = getClient();
    if (!supabase || !state.requirement || isReadOnlyMode(state.requirement)) return;
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
        const link = await ensurePublicRequirementOnServer(supabase, payload);
        const { data, error } = await supabase.rpc('save_public_quote_requirement_draft', {
            req_slug: link.req,
            req_token: link.token,
            payload,
        });
        if (error) throw error;
        const row = Array.isArray(data) ? data[0] : data;
        if (row) state.requirement = normalizeRequirement(row);
        state.lastSavedSignature = requirementPayloadSignature(buildRequirementPayload(state.requirement));
        state.lastAutoSavedAt = text(state.requirement?.updated_at || new Date().toISOString());
        state.autoSavePending = false;
        state.autoSaveMessage = localize('已自动保存，后台可实时查看最新填写进度。');
        if (state.lastChangedField) {
            const answers = normalizeAnswers(state.requirement.answers);
            const latestValue = state.lastChangedField in state.requirement
                ? state.requirement[state.lastChangedField]
                : answers[state.lastChangedField];
            await logRequirementActivity('field_change', '客户修改需求表', {
                field: state.lastChangedField,
                value: latestValue ?? null,
            });
            state.lastChangedField = '';
        }
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
        if (document.visibilityState === 'hidden' && state.requirement && !isReadOnlyMode(state.requirement)) {
            writeRequirementDraft(state.requirement);
            void saveRequirementDraftToServer(true);
        }
    });
    window.addEventListener('beforeunload', () => {
        if (state.requirement && !isReadOnlyMode(state.requirement)) {
            writeRequirementDraft(state.requirement);
        }
    });
}

function getClient() {
    if (!window.supabase?.createClient) return null;
    if (!getClient.instance) {
        getClient.instance = window.GasGxMainAuthShared?.createClient
            ? window.GasGxMainAuthShared.createClient(window.supabase)
            : window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true,
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

function localizedCountryOptionsMarkup(selected = '') {
    return selectOptionsMarkup(localizedCountryOptions(state.locale), selected);
}

function requirementHeading(requirement = {}) {
    return text(requirement.requester_company || requirement.requester_name) || localize('售前项目需求收集');
}

function choiceChipMarkup(field, options = [], selectedValues = [], disabled = false, mode = 'multiple') {
    const selectedSet = new Set(normalizeStringList(selectedValues));
    const inputType = mode === 'single' ? 'radio' : 'checkbox';
    return `
        <div class="requirement-choice-grid">
            ${options.map((item) => `
                <label class="requirement-choice ${selectedSet.has(item.value) ? 'is-active' : ''} ${disabled ? 'is-disabled' : ''}">
                    <input type="${inputType}" name="requirement-${esc(field)}" data-answer-check="${esc(field)}" value="${esc(item.value)}" ${selectedSet.has(item.value) ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
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

function loginUrlForCurrentPage() {
    const config = window.GasGxMainAuthShared?.resolveConfig?.() || {};
    const signInUrl = text(config.signInUrl, '/account/user.html');
    const returnPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    try {
        window.sessionStorage.setItem(text(config.returnUrlStorageKey, 'gx_main_return_url'), returnPath);
    } catch (_error) {}
    const url = new URL(signInUrl, window.location.origin);
    url.searchParams.set('return', returnPath);
    return url.toString();
}

function authEmail() {
    return text(state.authUser?.email || state.authUser?.user_metadata?.email).toLowerCase();
}

function requiredRequirementEmail(requirement = state.requirement) {
    return text(requirement?.requester_email).toLowerCase();
}

function hasRequirementEditAccess(requirement = state.requirement) {
    if (!requirement || isLocked(requirement?.status)) return false;
    const currentEmail = authEmail();
    if (!currentEmail) return false;
    const requiredEmail = requiredRequirementEmail(requirement);
    return !requiredEmail || currentEmail === requiredEmail;
}

function isReadOnlyMode(requirement = state.requirement) {
    return !!state.viewOnly || isLocked(requirement?.status) || !hasRequirementEditAccess(requirement);
}

function requirementAuthNoticeMarkup(requirement = state.requirement) {
    if (isLocked(requirement?.status)) return '';
    const currentEmail = authEmail();
    const requiredEmail = requiredRequirementEmail(requirement);
    if (currentEmail && (!requiredEmail || currentEmail === requiredEmail)) {
        return `
            <section class="requirement-card requirement-auth-card is-ok">
                <div>
                    <strong>${esc(localize('已通过 GasGx 邮箱登录'))}</strong>
                    <p>${esc(currentEmail)} · ${esc(localize('提交后系统会把填写内容同步回客户档案。'))}</p>
                </div>
            </section>
        `;
    }
    const message = currentEmail && requiredEmail && currentEmail !== requiredEmail
        ? `当前登录邮箱 ${currentEmail} 与本需求单绑定邮箱 ${requiredEmail} 不一致，请切换账号后填写。`
        : '请先使用客户邮箱登录 GasGx，再填写并提交这份需求单。';
    return `
        <section class="requirement-card requirement-auth-card is-blocked">
            <div>
                <strong>${esc(localize('需要客户邮箱登录'))}</strong>
                <p>${esc(localize(message))}</p>
            </div>
            <a class="btn-glow px-5 py-3 inline-flex items-center gap-2" href="${esc(loginUrlForCurrentPage())}">
                <i class="fa-solid fa-right-to-bracket"></i>
                <span>${esc(localize('登录 GasGx'))}</span>
            </a>
        </section>
    `;
}

function fmtDate(value) {
    const date = new Date(value || '');
    if (Number.isNaN(date.getTime())) return '--';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function requirementPageUrl(locale = state.locale) {
    const url = new URL(window.location.href);
    if (locale === 'zh') url.searchParams.delete('lang');
    else url.searchParams.set('lang', locale);
    return url.toString();
}

function localeLabel(locale = state.locale) {
    if (locale === 'zh') return '中文';
    if (locale === 'ru') return 'RU';
    return 'EN';
}

function validateRequirementContactField(field, requirement = state.requirement) {
    const current = requirement || {};
    const answers = normalizeAnswers(current.answers);
    if (field === 'requester_company' && !text(current.requester_company)) return localize('客户公司不能为空。');
    if (field === 'requester_name' && !text(current.requester_name)) return localize('联系人不能为空。');
    if (field === 'requester_email') {
        const email = text(current.requester_email);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return localize('请输入有效的邮箱地址。');
    }
    if (field === 'contact_channel' && !text(answers.contact_channel)) return localize('联系渠道不能为空。');
    if (field === 'requester_phone') {
        const handle = text(current.requester_phone);
        if (handle.length < 5) return localize('账号或电话至少填写 5 个字符。');
    }
    if (field === 'country' && !text(current.country)) return localize('请选择国家 / 地区。');
    return '';
}

function validateRequirementContactSection(requirement = state.requirement) {
    const fields = ['requester_company', 'requester_name', 'requester_email', 'contact_channel', 'requester_phone', 'country'];
    const nextErrors = {};
    fields.forEach((field) => {
        const error = validateRequirementContactField(field, requirement);
        if (error) nextErrors[field] = error;
    });
    state.validationErrors = nextErrors;
    return Object.keys(nextErrors).length === 0;
}

function updateFieldValidation(field) {
    const error = validateRequirementField(field, state.requirement);
    if (error) state.validationErrors[field] = error;
    else delete state.validationErrors[field];
}

function fieldErrorMarkup(field) {
    const error = text(state.validationErrors?.[field]);
    return error ? `<small class="requirement-field-error">${esc(error)}</small>` : '';
}

const CONTACT_REQUIRED_FIELDS = [
    'requester_company',
    'requester_name',
    'requester_email',
    'contact_channel',
    'requester_phone',
    'country',
];

const PROJECT_REQUIRED_FIELDS = [
    'requirement_type',
    'site_type',
    'target_power',
    'gas_type',
    'gas_quality',
    'available_flow',
    'voltage_frequency',
    'deployment_preference',
    'delivery_scope',
    'service_scope',
    'budget_band',
    'timeline_band',
];

const MINING_REQUIRED_FIELDS = [
    'miner_brands',
    'miner_model',
    'miner_quantity_band',
];

const REQUIRED_FIELD_LABELS = {
    requester_company: '客户公司',
    requester_name: '联系人',
    requester_email: '邮箱',
    contact_channel: '联系渠道',
    requester_phone: '账号 / 电话',
    country: '国家 / 地区',
    requirement_type: '需求类型',
    site_type: '站点类型',
    target_power: '目标功率',
    gas_type: '气源类型',
    gas_quality: '气质情况',
    available_flow: '可用气量 / 压力',
    miner_model: '推荐机型',
    miner_hashrate_band: '矿机算力范围',
    miner_power_band: '矿机功耗范围',
    miner_quantity_band: '矿机数量范围',
    voltage_frequency: '电压 / 频率',
    miner_brands: '矿机品牌',
    miner_cooling: '散热机位类型',
    deployment_preference: '部署偏好',
    delivery_scope: '交付范围',
    service_scope: '服务范围',
    budget_band: '每 MW 预算',
    timeline_band: '期望周期',
};

function requiredFieldOrderForRequirement(requirement = state.requirement) {
    return [
        ...CONTACT_REQUIRED_FIELDS,
        ...PROJECT_REQUIRED_FIELDS,
        ...(isMiningRequirementType(requirement?.requirement_type) ? MINING_REQUIRED_FIELDS : []),
    ];
}

function requiredFieldLabel(field) {
    return localize(REQUIRED_FIELD_LABELS[field] || field);
}

function requiredFieldMessage(field) {
    const label = requiredFieldLabel(field);
    if (state.locale === 'en') return `${label} is required.`;
    if (state.locale === 'ru') return `Поле "${label}" обязательно.`;
    return `请先填写或选择${label}。`;
}

function missingRequiredFieldLabels(requirement = state.requirement, fields = requiredFieldOrderForRequirement(requirement)) {
    return fields
        .filter((field) => validateRequirementField(field, requirement))
        .map((field) => requiredFieldLabel(field));
}

function validateRequirementField(field, requirement = state.requirement) {
    if (CONTACT_REQUIRED_FIELDS.includes(field)) {
        return validateRequirementContactField(field, requirement);
    }

    const answers = normalizeAnswers(requirement?.answers);
    const selectFields = new Set([
        'requirement_type',
        'site_type',
        'target_power',
        'gas_type',
        'gas_quality',
        'miner_quantity_band',
        'voltage_frequency',
        'deployment_preference',
        'delivery_scope',
        'service_scope',
        'budget_band',
        'timeline_band',
    ]);
    if (selectFields.has(field)) {
        const value = field === 'requirement_type' ? text(requirement?.requirement_type) : text(answers[field]);
        if (!value || value === 'unknown') return requiredFieldMessage(field);
        return '';
    }

    if (field === 'available_flow' && !text(answers.available_flow)) {
        return requiredFieldMessage(field);
    }
    if (field === 'miner_brands' && !answers.miner_brands?.length) {
        return requiredFieldMessage(field);
    }
    if (field === 'miner_model' && !answers.miner_models?.length) {
        return requiredFieldMessage(field);
    }

    return '';
}

function validateRequirementSubmission(requirement = state.requirement) {
    const nextErrors = {};
    requiredFieldOrderForRequirement(requirement).forEach((field) => {
        const error = validateRequirementField(field, requirement);
        if (error) nextErrors[field] = error;
    });
    state.validationErrors = nextErrors;
    return Object.keys(nextErrors).length === 0;
}

function validationFieldSelector(field) {
    if (field === 'contact_channel') return '[data-answer-field="contact_channel"]';
    if (['site_type', 'target_power', 'gas_type', 'gas_quality', 'available_flow', 'deployment_preference', 'miner_model', 'miner_quantity_band', 'voltage_frequency', 'delivery_scope', 'service_scope', 'budget_band', 'timeline_band'].includes(field)) {
        return `[data-answer-field="${field}"]`;
    }
    if (['miner_brands', 'miner_cooling'].includes(field)) {
        return `[data-answer-check="${field}"]`;
    }
    return `[data-field="${field}"]`;
}

function syncFieldValidationUI(field) {
    const wrapper = document.querySelector(`[data-required-field="${field}"]`);
    if (!wrapper) return;
    const error = text(state.validationErrors?.[field]);
    wrapper.classList.toggle('is-invalid', !!error);
    let errorNode = wrapper.querySelector('.requirement-field-error');
    if (error) {
        if (!errorNode) {
            errorNode = document.createElement('small');
            errorNode.className = 'requirement-field-error';
            wrapper.appendChild(errorNode);
        }
        errorNode.textContent = error;
    } else if (errorNode) {
        errorNode.remove();
    }
}

function focusValidationField(field) {
    if (!field) return;
    const target = document.querySelector(validationFieldSelector(field));
    const wrapper = target?.closest('.requirement-field') || document.querySelector(`[data-required-field="${field}"]`);
    if (!wrapper || !target) return;

    wrapper.classList.add('is-attention');
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => wrapper.classList.remove('is-attention'), 2200);
    if (typeof target.focus === 'function') {
        target.focus({ preventScroll: true });
    }
}

function focusSubmitConfirm() {
    const confirm = document.getElementById('requirement-submit-confirm');
    const wrapper = confirm?.closest('.requirement-confirm');
    if (wrapper) {
        wrapper.classList.add('is-attention');
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => wrapper.classList.remove('is-attention'), 2200);
    }
    if (typeof confirm?.focus === 'function') {
        confirm.focus({ preventScroll: true });
    }
}

function setSubmitStatus(message, isError = false) {
    const statusNode = document.getElementById('requirement-submit-status');
    if (!statusNode) return;
    statusNode.textContent = localize(message);
    statusNode.classList.toggle('is-error', !!isError);
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

function refreshMinerModelChoices() {
    const wrap = document.getElementById('requirement-miner-model-wrap');
    const requirement = state.requirement;
    if (!wrap || !requirement) return;
    const answers = normalizeAnswers(requirement.answers);
    const availableModels = minerModelOptionsFor(answers.miner_brands);
    const availableModelSet = new Set(availableModels.map((item) => item.value));
    const filteredModels = answers.miner_models.filter((item) => availableModelSet.has(item));
    if (filteredModels.length !== answers.miner_models.length) {
        requirement.answers.miner_models = filteredModels;
    }
    syncDerivedAnswersFromSelectedModel(requirement, { resetIfMissing: true });
    wrap.innerHTML = minerModelChoiceSelectMarkup(filteredModels, answers.miner_brands, isLocked(requirement.status));
    wrap.querySelectorAll('[data-answer-field]').forEach((node) => bindAnswerFieldNode(node, requirement));
    updateFieldValidation('miner_model');
    syncFieldValidationUI('miner_model');
    const derivedWrap = document.getElementById('requirement-miner-derived-fields');
    if (derivedWrap) {
        derivedWrap.innerHTML = minerDerivedFieldsMarkup(normalizeAnswers(requirement.answers), isLocked(requirement.status));
        derivedWrap.querySelectorAll('[data-answer-field]').forEach((node) => bindAnswerFieldNode(node, requirement));
    }
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
    syncDerivedAnswersFromSelectedModel(requirement, { resetIfMissing: true });
    const answers = normalizeAnswers(requirement.answers);
    const locked = isReadOnlyMode(requirement);
    const submittedLocked = isLocked(requirement.status);
    const buttonDisabled = locked || state.submitting;
    const availableModels = minerModelOptionsFor(answers.miner_brands);
    const availableModelSet = new Set(availableModels.map((item) => item.value));
    const filteredModels = answers.miner_models.filter((item) => availableModelSet.has(item));
    if (filteredModels.length !== answers.miner_models.length) {
        requirement.answers.miner_models = filteredModels;
    }

    document.title = `${text(requirement.requester_company || requirement.requester_name || localize('售前项目需求收集') || 'Requirement Intake')} | GasGx`;
    root().innerHTML = `
        <div class="requirement-page ${locked ? 'is-locked' : ''}">
        <div class="requirement-toolbar">
            <div class="requirement-lang-dropdown" data-requirement-lang-dropdown>
                <button class="requirement-lang-trigger" type="button" aria-haspopup="true" aria-expanded="false" data-requirement-lang-trigger>
                    <i class="fa-solid fa-globe"></i>
                    <span>${esc(localeLabel(state.locale))}</span>
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
                <div class="requirement-lang-menu" role="menu" aria-label="${esc(localize('语言'))}">
                ${SUPPORTED_LOCALES.map((locale) => `
                    <a class="requirement-lang-option ${state.locale === locale ? 'is-active' : ''}" href="${esc(requirementPageUrl(locale))}" role="menuitem">
                        <span>${esc(localeLabel(locale))}</span>
                        ${state.locale === locale ? '<i class="fa-solid fa-check"></i>' : ''}
                    </a>
                `).join('')}
                </div>
            </div>
        </div>
        ${submittedLocked ? `
            <div class="requirement-watermark" aria-hidden="true">
                ${Array.from({ length: 81 }).map(() => `
                    <span>
                        <b>${esc(localize('需求已存证'))}</b>
                        <small>www.gasgx.com</small>
                    </span>
                `).join('')}
            </div>
        ` : ''}
        <section class="requirement-hero">
            <div class="requirement-hero__copy">
                <div class="requirement-hero__kicker">GASGX REQUIREMENT INTAKE</div>
                <h1>${esc(requirementHeading(requirement))}</h1>
                <p>${esc(localize('请根据当前这一轮采购或部署计划填写下面的选择题。提交后，这份需求会作为后续报价、跟进和内部协作的统一基线。'))}</p>
            </div>
            <div class="requirement-hero__meta">
                <div class="requirement-status-chip tone-${esc(statusTone(requirement.status))}">${esc(requirementStatusLabel(requirement.status))}</div>
                <div class="requirement-hero__meta-line"><strong>${esc(localize('客户提交时间'))}</strong><span>${esc(fmtDate(requirement.submitted_at))}</span></div>
                <div class="requirement-hero__meta-line"><strong>${esc(localize('说明'))}</strong><span>${esc(localize(submittedLocked ? '这份需求已经提交，目前为只读状态。' : '提交前必须使用客户邮箱登录 GasGx。'))}</span></div>
            </div>
        </section>
        ${requirementAuthNoticeMarkup(requirement)}

        <section class="requirement-card">
            <div class="requirement-section-head">
                <div>
                    <h2>${esc(localize('联系人信息'))}</h2>
                    <p>${esc(localize('这里只保留最必要的联系方式，方便我们确认后续报价和交付细节。'))}</p>
                </div>
            </div>
            <div class="requirement-grid">
                <label class="requirement-field ${state.validationErrors.requester_company ? 'is-invalid' : ''}" data-required-field="requester_company">
                    <span>${esc(localize('客户公司'))}</span>
                    <input class="share-input" data-field="requester_company" value="${esc(requirement.requester_company)}" placeholder="Demo Mining" ${locked ? 'disabled' : ''}>
                    ${fieldErrorMarkup('requester_company')}
                </label>
                <label class="requirement-field ${state.validationErrors.requester_name ? 'is-invalid' : ''}" data-required-field="requester_name">
                    <span>${esc(localize('联系人'))}</span>
                    <input class="share-input" data-field="requester_name" value="${esc(requirement.requester_name)}" placeholder="Allen" ${locked ? 'disabled' : ''}>
                    ${fieldErrorMarkup('requester_name')}
                </label>
                <label class="requirement-field ${state.validationErrors.requester_email ? 'is-invalid' : ''}" data-required-field="requester_email">
                    <span>${esc(localize('邮箱'))}</span>
                    <input class="share-input" data-field="requester_email" value="${esc(requirement.requester_email)}" placeholder="customer@example.com" ${locked ? 'disabled' : ''}>
                    ${fieldErrorMarkup('requester_email')}
                </label>
                <div class="requirement-field-stack">
                    <label class="requirement-field ${state.validationErrors.contact_channel ? 'is-invalid' : ''}" data-required-field="contact_channel">
                        <span>${esc(localize('联系渠道'))}</span>
                        <select class="share-select" data-answer-field="contact_channel" ${locked ? 'disabled' : ''}>
                            ${selectOptionsMarkup(CONTACT_CHANNEL_OPTIONS, answers.contact_channel || 'whatsapp')}
                        </select>
                        ${fieldErrorMarkup('contact_channel')}
                    </label>
                    <label class="requirement-field ${state.validationErrors.requester_phone ? 'is-invalid' : ''}" data-required-field="requester_phone">
                        <span>${esc(localize('账号 / 电话'))}</span>
                        <input class="share-input" data-field="requester_phone" value="${esc(requirement.requester_phone)}" placeholder="${esc(localize('填写账号或手机号'))}" ${locked ? 'disabled' : ''}>
                        ${fieldErrorMarkup('requester_phone')}
                    </label>
                </div>
                <label class="requirement-field ${state.validationErrors.country ? 'is-invalid' : ''}" data-required-field="country">
                    <span>${esc(localize('国家 / 地区'))}</span>
                    <select class="share-select" data-field="country" ${locked ? 'disabled' : ''}>
                        ${localizedCountryOptionsMarkup(requirement.country)}
                    </select>
                    ${fieldErrorMarkup('country')}
                </label>
            </div>
        </section>
        ${projectBasicsMarkup(requirement, answers, locked)}
        ${projectScopeMarkup(answers, locked)}
        ${miningSectionMarkup(requirement, answers, locked, filteredModels)}

        <section class="requirement-card requirement-submit-card">
            <div class="requirement-submit-main">
                ${locked ? '' : `
                    <label class="requirement-confirm">
                        <input id="requirement-submit-confirm" type="checkbox" ${state.submitConfirmed ? 'checked' : ''}>
                        <span>${esc(localize('我已确认以上需求信息准确无误，并理解它将直接影响最终报价。'))}</span>
                    </label>
                `}
                <div class="requirement-submit-autosave">
                    <strong>自动保存</strong>
                    <span id="requirement-autosave-status">${esc(locked ? '客户已提交，当前公开页为只读状态。' : text(state.autoSaveMessage, '正在等待填写...'))}</span>
                    <em>最近同步：<span id="requirement-autosave-time">${esc(fmtDate(state.lastAutoSavedAt || requirement.updated_at))}</span></em>
                </div>
            </div>
            <div class="requirement-submit-actions">
                <button id="requirement-submit" type="button" class="btn-glow px-5 py-3 inline-flex items-center gap-2" ${buttonDisabled ? 'disabled' : ''}>
                    <i class="fa-solid ${locked ? 'fa-lock' : 'fa-paper-plane'}"></i>
                    <span>${esc(submittedLocked ? '已提交' : (state.submitting ? '提交中...' : '提交需求单'))}</span>
                </button>
                <div id="requirement-submit-status" class="requirement-submit-status">${submittedLocked ? ('已提交 / ' + esc(fmtDate(requirement.submitted_at))) : esc(locked ? '当前需求单为只读状态，不能提交。' : (state.submitConfirmed ? '提交后公开需求页会自动锁定。' : '请先勾选最终确认，再提交需求单。'))}</div>
            </div>
        </section>
        </div>
    `;

    bindEvents();
    updateAutoSaveIndicators();
}

function bindAnswerFieldNode(node, requirement = state.requirement) {
    if (!node || node.dataset.boundAnswerField === 'true') return;
    node.dataset.boundAnswerField = 'true';
    const apply = () => {
        const field = node.dataset.answerField;
        if (!field) return;
        if (field === 'miner_model') {
            requirement.answers.miner_models = node.value ? [node.value] : [];
            syncDerivedAnswersFromSelectedModel(requirement, { resetIfMissing: true });
            refreshMinerModelChoices();
        } else {
            requirement.answers[field] = node.value;
        }
        updateFieldValidation(field);
        syncFieldValidationUI(field);
        queueRequirementAutoSave({ field });
    };
    node.addEventListener('input', apply);
    if (node.tagName === 'SELECT') {
        node.addEventListener('change', apply);
    }
}

function bindEvents() {
    bindLanguageDropdown();
    const requirement = state.requirement;
    if (!requirement || isLocked(requirement.status)) return;

    document.querySelectorAll('[data-field]').forEach((node) => {
        node.addEventListener('input', () => {
            const field = node.dataset.field;
            if (!field) return;
            requirement[field] = node.value;
            if (field === 'requirement_type') {
                renderApp();
                queueRequirementAutoSave({ field, immediate: true });
                return;
            }
            updateFieldValidation(field);
            syncFieldValidationUI(field);
            queueRequirementAutoSave({ field });
        });
        node.addEventListener('blur', () => {
            const field = node.dataset.field;
            if (!field) return;
            updateFieldValidation(field);
            syncFieldValidationUI(field);
        });
        if (node.tagName === 'SELECT') {
            node.addEventListener('change', () => {
                const field = node.dataset.field;
                if (!field) return;
                requirement[field] = node.value;
                if (field === 'requirement_type') {
                    renderApp();
                    queueRequirementAutoSave({ field, immediate: true });
                    return;
                }
                updateFieldValidation(field);
                syncFieldValidationUI(field);
                queueRequirementAutoSave({ field });
            });
        }
    });

    document.querySelectorAll('[data-answer-field]').forEach((node) => bindAnswerFieldNode(node, requirement));

    document.querySelectorAll('[data-answer-check]').forEach((node) => {
        node.addEventListener('change', () => {
            const field = node.dataset.answerCheck;
            if (!field) return;
            const selectedValues = Array.from(document.querySelectorAll(`[data-answer-check="${field}"]`))
                .filter((item) => item.checked)
                .map((item) => item.value);
            requirement.answers[field] = ['miner_brands', 'miner_cooling'].includes(field)
                ? selectedValues.slice(0, 1)
                : selectedValues;
            updateFieldValidation(field);
            syncFieldValidationUI(field);
            queueRequirementAutoSave({ field });
            if (field === 'miner_brands') {
                refreshMinerModelChoices();
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

    document.getElementById('requirement-submit-confirm')?.addEventListener('change', () => {
        const submitButton = document.getElementById('requirement-submit');
        if (submitButton) submitButton.disabled = !!state.submitting;
        setSubmitStatus(
            state.submitConfirmed
                ? '提交后公开需求页会自动锁定。'
                : '请先勾选最终确认，再提交需求单。',
            false
        );
    });

    document.getElementById('requirement-submit')?.addEventListener('click', () => {
        void submitCurrentRequirement();
    });
}

function bindLanguageDropdown() {
    const dropdown = document.querySelector('[data-requirement-lang-dropdown]');
    const trigger = document.querySelector('[data-requirement-lang-trigger]');
    if (!dropdown || !trigger || dropdown.dataset.bound === 'true') {
        return;
    }
    dropdown.dataset.bound = 'true';

    const close = () => {
        document.querySelectorAll('[data-requirement-lang-dropdown].is-open').forEach((node) => {
            node.classList.remove('is-open');
            node.querySelector('[data-requirement-lang-trigger]')?.setAttribute('aria-expanded', 'false');
        });
    };

    trigger.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const nextOpen = !dropdown.classList.contains('is-open');
        dropdown.classList.toggle('is-open', nextOpen);
        trigger.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
    });

    if (!languageDropdownGlobalBound) {
        languageDropdownGlobalBound = true;
        document.addEventListener('click', close);
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') close();
        });
    }
}

function projectBasicsMarkup(requirement, answers, locked) {
    return `
        <section class="requirement-card">
            <div class="requirement-section-head">
                <div>
                    <h2>${esc(localize('项目基础信息'))}</h2>
                    <p>${esc(localize('请先确认项目场景、目标规模和气源条件，这些信息决定推荐方向。'))}</p>
                </div>
            </div>
            <div class="requirement-grid">
                <label class="requirement-field ${state.validationErrors.requirement_type ? 'is-invalid' : ''}" data-required-field="requirement_type">
                    <span>${esc(localize('需求类型'))}</span>
                    <select class="share-select" data-field="requirement_type" ${locked ? 'disabled' : ''}>
                        ${selectOptionsMarkup(REQUIREMENT_TYPE_OPTIONS, requirement.requirement_type)}
                    </select>
                    ${fieldErrorMarkup('requirement_type')}
                </label>
                <label class="requirement-field ${state.validationErrors.site_type ? 'is-invalid' : ''}" data-required-field="site_type">
                    <span>${esc(localize('站点类型'))}</span>
                    <select class="share-select" data-answer-field="site_type" ${locked ? 'disabled' : ''}>
                        ${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.site_type, answers.site_type)}
                    </select>
                    ${fieldErrorMarkup('site_type')}
                </label>
                <label class="requirement-field ${state.validationErrors.target_power ? 'is-invalid' : ''}" data-required-field="target_power">
                    <span>${esc(localize('目标功率'))}</span>
                    <select class="share-select" data-answer-field="target_power" ${locked ? 'disabled' : ''}>
                        ${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.target_power, answers.target_power)}
                    </select>
                    ${fieldErrorMarkup('target_power')}
                </label>
                <label class="requirement-field ${state.validationErrors.gas_type ? 'is-invalid' : ''}" data-required-field="gas_type">
                    <span>${esc(localize('气源类型'))}</span>
                    <select class="share-select" data-answer-field="gas_type" ${locked ? 'disabled' : ''}>
                        ${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.gas_type, answers.gas_type)}
                    </select>
                    ${fieldErrorMarkup('gas_type')}
                </label>
                <label class="requirement-field ${state.validationErrors.gas_quality ? 'is-invalid' : ''}" data-required-field="gas_quality">
                    <span>${esc(localize('气质情况'))}</span>
                    <select class="share-select" data-answer-field="gas_quality" ${locked ? 'disabled' : ''}>
                        ${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.gas_quality, answers.gas_quality)}
                    </select>
                    ${fieldErrorMarkup('gas_quality')}
                </label>
                <label class="requirement-field ${state.validationErrors.available_flow ? 'is-invalid' : ''}" data-required-field="available_flow">
                    <span>${esc(localize('可用气量 / 压力'))}</span>
                    <input class="share-input" data-answer-field="available_flow" value="${esc(answers.available_flow)}" placeholder="${esc(localize('例如：2 MMSCFD @ 5 bar，或已具备气体分析报告'))}" ${locked ? 'disabled' : ''}>
                    <small>${esc(localize('这里可填写可用流量、压力、气体报告编号或其他关键约束'))}</small>
                    ${fieldErrorMarkup('available_flow')}
                </label>
            </div>
        </section>
    `;
}

function projectScopeMarkup(answers, locked) {
    return `
        <section class="requirement-card">
            <div class="requirement-section-head">
                <div>
                    <h2>${esc(localize('项目技术与交付范围'))}</h2>
                    <p>${esc(localize('这些信息会直接影响报价边界、交付范围和后续服务方式。'))}</p>
                </div>
            </div>
            <div class="requirement-grid">
                <label class="requirement-field ${state.validationErrors.voltage_frequency ? 'is-invalid' : ''}" data-required-field="voltage_frequency">
                    <span>${esc(localize('电压 / 频率'))}</span>
                    <select class="share-select" data-answer-field="voltage_frequency" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.voltage_frequency, answers.voltage_frequency)}</select>
                    ${fieldErrorMarkup('voltage_frequency')}
                </label>
                <label class="requirement-field ${state.validationErrors.deployment_preference ? 'is-invalid' : ''}" data-required-field="deployment_preference">
                    <span>${esc(localize('部署偏好'))}</span>
                    <select class="share-select" data-answer-field="deployment_preference" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.deployment_preference, answers.deployment_preference)}</select>
                    ${fieldErrorMarkup('deployment_preference')}
                </label>
                <label class="requirement-field ${state.validationErrors.delivery_scope ? 'is-invalid' : ''}" data-required-field="delivery_scope">
                    <span>${esc(localize('交付范围'))}</span>
                    <select class="share-select" data-answer-field="delivery_scope" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.delivery_scope, answers.delivery_scope)}</select>
                    ${fieldErrorMarkup('delivery_scope')}
                </label>
                <label class="requirement-field ${state.validationErrors.service_scope ? 'is-invalid' : ''}" data-required-field="service_scope">
                    <span>${esc(localize('服务范围'))}</span>
                    <select class="share-select" data-answer-field="service_scope" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.service_scope, answers.service_scope)}</select>
                    ${fieldErrorMarkup('service_scope')}
                </label>
                <label class="requirement-field ${state.validationErrors.budget_band ? 'is-invalid' : ''}" data-required-field="budget_band">
                    <span>${esc(localize('每 MW 预算'))}</span>
                    <select class="share-select" data-answer-field="budget_band" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.budget_band, answers.budget_band)}</select>
                    ${fieldErrorMarkup('budget_band')}
                </label>
                <label class="requirement-field ${state.validationErrors.timeline_band ? 'is-invalid' : ''}" data-required-field="timeline_band">
                    <span>${esc(localize('期望周期'))}</span>
                    <select class="share-select" data-answer-field="timeline_band" ${locked ? 'disabled' : ''}>${selectOptionsMarkup(REQUIREMENT_SELECT_OPTIONS.timeline_band, answers.timeline_band)}</select>
                    ${fieldErrorMarkup('timeline_band')}
                </label>
            </div>
            <div class="requirement-field">
                <span>${esc(localize('认证 / 合规要求'))}</span>
                ${choiceChipMarkup('certification_needs', REQUIREMENT_MULTI_OPTIONS.certification_needs, answers.certification_needs, locked)}
            </div>
            <label class="requirement-field">
                <span>${esc(localize('补充说明'))}</span>
                <textarea class="share-input requirement-textarea" data-answer-field="extra_notes" placeholder="${esc(localize('如涉及指定机型、并网限制、冬化、防爆、噪音或物流限制，请在这里补充说明。'))}" ${locked ? 'disabled' : ''}>${esc(answers.extra_notes)}</textarea>
            </label>
        </section>
    `;
}

function miningSectionMarkup(requirement, answers, locked, filteredModels) {
    if (!isMiningRequirementType(requirement?.requirement_type)) return '';
    return `
        <section class="requirement-card">
            <div class="requirement-section-head">
                <div>
                    <h2>${esc(localize('矿机与负载信息'))}</h2>
                    <p>${esc(localize('仅当项目包含算力 / 矿机负载时填写这一组信息。'))}</p>
                </div>
            </div>
            <div class="requirement-field ${state.validationErrors.miner_brands ? 'is-invalid' : ''}" data-required-field="miner_brands">
                <span>${esc(localize('矿机品牌'))}</span>
                ${choiceChipMarkup('miner_brands', REQUIREMENT_MULTI_OPTIONS.miner_brands, answers.miner_brands, locked, 'single')}
                ${fieldErrorMarkup('miner_brands')}
            </div>
            <div class="requirement-field ${state.validationErrors.miner_model ? 'is-invalid' : ''}" data-required-field="miner_model">
                <span>${esc(localize('推荐机型 (Top 10)'))}</span>
                <div id="requirement-miner-model-wrap">${minerModelChoiceSelectMarkup(filteredModels, answers.miner_brands, locked)}</div>
                ${fieldErrorMarkup('miner_model')}
            </div>
            <div id="requirement-miner-derived-fields">${minerDerivedFieldsMarkup(answers, locked)}</div>
        </section>
    `;
}

async function fetchRequirement() {
    const supabase = getClient();
    if (!supabase) {
        throw new Error('Supabase client is unavailable.');
    }

    const { req, token } = currentRequirementLink();
    if (!req || !token) {
        const localDraft = readRequirementDraft();
        const serverRequirement = createEmptyRequirementDraft();
        state.requirement = applyRequirementDraft(serverRequirement, localDraft);
        state.submitConfirmed = false;
        state.lastSavedSignature = '';
        state.lastAutoSavedAt = text(localDraft?.saved_at || '');
        state.autoSavePending = Boolean(localDraft?.payload);
        state.autoSaveError = false;
        state.autoSaveMessage = localize('当前为公开售前收资入口，填写后会自动创建专属需求单。');
        return;
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
    const localDraft = !isReadOnlyMode(serverRequirement) ? readRequirementDraft() : null;
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
    await logRequirementActivity('public_link_opened', '客户打开需求表', {
        status: text(state.requirement.status),
        title: text(state.requirement.title),
    });
}

async function submitCurrentRequirement() {
    const supabase = getClient();
    if (!supabase || !state.requirement) return;

    if (isReadOnlyMode(state.requirement)) {
        setSubmitStatus('当前需求单为只读状态，不能提交。', true);
        return;
    }

    if (!validateRequirementSubmission(state.requirement)) {
        renderApp();
        const firstInvalidField = requiredFieldOrderForRequirement(state.requirement).find((field) => state.validationErrors[field]);
        const missingLabels = missingRequiredFieldLabels(state.requirement);
        setSubmitStatus(
            missingLabels.length
                ? `请先补充或修正：${missingLabels.join('、')}。`
                : firstInvalidField
                    ? `请先补充或修正：${requiredFieldLabel(firstInvalidField)}。`
                : '请先补全需求信息。',
            true
        );
        window.requestAnimationFrame(() => focusValidationField(firstInvalidField));
        return;
    }

    if (!state.submitConfirmed) {
        setSubmitStatus('请先勾选最终确认，再提交需求单。', true);
        window.requestAnimationFrame(() => focusSubmitConfirm());
        return;
    }

    if (!validateRequirementContactSection(state.requirement)) {
        renderApp();
        const statusNode = document.getElementById('requirement-submit-status');
        const missingLabels = missingRequiredFieldLabels(state.requirement, ['requester_company', 'requester_name', 'requester_email', 'contact_channel', 'requester_phone', 'country']);
        if (statusNode) {
            statusNode.textContent = missingLabels.length
                ? `请先补全联系人信息：${missingLabels.join('、')}。`
                : localize('请先补全并修正联系人信息。');
            statusNode.classList.add('is-error');
        }
        return;
    }

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
        const link = await ensurePublicRequirementOnServer(supabase, buildRequirementPayload(state.requirement));
        const payload = buildRequirementPayload(state.requirement);

        const { error } = await supabase.rpc('submit_public_quote_requirement', {
            req_slug: link.req,
            req_token: link.token,
            payload,
        });
        if (error) throw error;

        await fetchRequirement();
        await logRequirementActivity('status_change', '客户提交需求表', {
            status: text(state.requirement?.status),
            title: text(state.requirement?.title),
        });
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
        state.viewOnly = isViewOnlyAccess();
        if (document?.documentElement) {
            document.documentElement.lang = state.locale === 'zh' ? 'zh-CN' : state.locale;
        }
        bindAutoSaveLifecycle();
        renderApp();
        const supabase = getClient();
        if (supabase?.auth?.getUser) {
            const { data, error } = await supabase.auth.getUser();
            state.authUser = data?.user || null;
            state.authError = text(error?.message);
        }
        await fetchRequirement();
        if (state.requirement && authEmail() && !text(state.requirement.requester_email) && !isLocked(state.requirement.status)) {
            state.requirement.requester_email = authEmail();
            state.autoSavePending = true;
        }
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
