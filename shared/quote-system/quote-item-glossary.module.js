const WEAR_PARTS_GLOSSARY = Object.freeze({
    '机油（自备）': { en: 'Engine Oil (Customer Supplied)', ru: 'Моторное масло (предоставляется заказчиком)' },
    '机油(自备)': { en: 'Engine Oil (Customer Supplied)', ru: 'Моторное масло (предоставляется заказчиком)' },
    '机油滤芯': { en: 'Engine Oil Filter', ru: 'Масляный фильтр' },
    '火花塞': { en: 'Spark Plug', ru: 'Свеча зажигания' },
    '高压线': { en: 'High-Voltage Ignition Lead', ru: 'Высоковольтный провод' },
    '空滤芯': { en: 'Air Filter Element', ru: 'Воздушный фильтрующий элемент' },
    '燃气过滤器滤芯': { en: 'Gas Filter Element', ru: 'Фильтрующий элемент газового фильтра' },
    '点火线圈': { en: 'Ignition Coil', ru: 'Катушка зажигания' },
    '调速电子节气门': { en: 'Electronic Throttle Actuator', ru: 'Электронный привод дроссельной заслонки' },
    '燃气节气门': { en: 'Gas Throttle Valve', ru: 'Газовая дроссельная заслонка' },
    '小发电机皮带': { en: 'Auxiliary Generator Belt', ru: 'Ремень вспомогательного генератора' },
    '皮带涨紧轮': { en: 'Belt Tensioner Pulley', ru: 'Натяжной ролик ремня' },
    '稳压阀': { en: 'Pressure Regulating Valve', ru: 'Регулятор давления' },
    '零压阀': { en: 'Zero Pressure Valve', ru: 'Клапан нулевого давления' },
    AVR: { en: 'AVR', ru: 'AVR' },
    '压力表': { en: 'Pressure Gauge', ru: 'Манометр' },
});

function text(value, fallback = '') {
    return String(value ?? fallback).trim();
}

export function applyQuoteItemGlossary(value = {}) {
    const localized = value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : { zh: text(value) };
    const zh = text(localized.zh || localized.cn || localized['zh-cn'] || localized['zh_cn']);
    const glossary = WEAR_PARTS_GLOSSARY[zh];
    if (!glossary) return localized;
    localized.zh = zh;
    ['en', 'ru'].forEach((lang) => {
        const current = text(localized[lang]);
        if (!current || current === zh) localized[lang] = glossary[lang];
    });
    return localized;
}

export function quoteItemDisplayName(value, lang = 'zh', fallback = '') {
    const localized = applyQuoteItemGlossary(value);
    const requested = text(localized[lang]);
    const english = text(localized.en);
    const chinese = text(localized.zh);
    const russian = text(localized.ru);
    return [requested, english, chinese, russian, text(fallback)].find(Boolean) || text(fallback);
}
