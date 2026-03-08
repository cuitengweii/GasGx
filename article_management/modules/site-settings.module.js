import { client } from './supabase.client.js';

const TABLE = 'feeder_form_options';
const SOCIAL_SECTION = 'footer_social';
const META_SECTION = 'footer_social_meta';
const SOCIAL_ENABLED_KEY = 'social_enabled';
const CONTACT_SECTION = 'footer_contact';
const CONTACT_LABEL_KEY = 'label';
const CONTACT_HREF_KEY = 'href';

function normalizeText(value) {
    return String(value || '').trim();
}

export const FOOTER_SOCIAL_ITEMS = [
    { id: 'x', label: 'X', iconClass: 'fa-brands fa-x-twitter', defaultHref: 'https://x.com/' },
    { id: 'telegram', label: 'Telegram', iconClass: 'fa-brands fa-telegram', defaultHref: 'https://t.me/' },
    { id: 'discord', label: 'Discord', iconClass: 'fa-brands fa-discord', defaultHref: 'https://discord.com/' },
    { id: 'youtube', label: 'YouTube', iconClass: 'fa-brands fa-youtube', defaultHref: 'https://www.youtube.com/' },
    { id: 'linkedin', label: 'LinkedIn', iconClass: 'fa-brands fa-linkedin', defaultHref: 'https://www.linkedin.com/' },
    { id: 'facebook', label: 'Facebook', iconClass: 'fa-brands fa-facebook', defaultHref: 'https://www.facebook.com/' },
    { id: 'tiktok', label: 'TikTok', iconClass: 'fa-brands fa-tiktok', defaultHref: 'https://www.tiktok.com/' },
    { id: 'wechat', label: 'WeChat', iconClass: 'fa-brands fa-weixin', defaultHref: '/about/contact' },
    { id: 'whatsapp', label: 'WhatsApp', iconClass: 'fa-brands fa-whatsapp', defaultHref: 'https://wa.me/' },
    { id: 'instagram', label: 'Instagram', iconClass: 'fa-brands fa-instagram', defaultHref: 'https://www.instagram.com/' },
    { id: 'xhs', label: 'XHS', iconClass: '', defaultHref: 'https://www.xiaohongshu.com/' },
    { id: 'video', label: 'Video', iconClass: 'fa-solid fa-circle-play', defaultHref: '/news/index.html' },
];

export async function fetchFooterSocialSettings() {
    const { data, error } = await client
        .from(TABLE)
        .select('id,section,option_id,label_en,label_zh,sort_order,is_active')
        .in('section', [SOCIAL_SECTION, META_SECTION, CONTACT_SECTION])
        .order('section', { ascending: true })
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

    if (error) throw error;

    const rows = Array.isArray(data) ? data : [];
    const bySection = new Map();
    rows.forEach((row) => {
        const section = normalizeText(row.section).toLowerCase();
        if (!bySection.has(section)) bySection.set(section, []);
        bySection.get(section).push(row);
    });

    const socialRows = bySection.get(SOCIAL_SECTION) || [];
    const metaRows = bySection.get(META_SECTION) || [];
    const contactRows = bySection.get(CONTACT_SECTION) || [];
    const socialMap = new Map(socialRows.map((row) => [normalizeText(row.option_id).toLowerCase(), row]));
    const contactMap = new Map(contactRows.map((row) => [normalizeText(row.option_id).toLowerCase(), row]));
    const groupRow = metaRows.find((row) => normalizeText(row.option_id).toLowerCase() === SOCIAL_ENABLED_KEY);

    return {
        groupVisible: groupRow ? groupRow.is_active !== false : true,
        contact: {
            label: normalizeText(contactMap.get(CONTACT_LABEL_KEY)?.label_en) || 'www_gasgx_com',
            href: normalizeText(contactMap.get(CONTACT_HREF_KEY)?.label_en) || '/about/contact',
        },
        rows,
        items: FOOTER_SOCIAL_ITEMS.map((item, index) => {
            const row = socialMap.get(item.id) || null;
            return {
                id: item.id,
                label: item.label,
                iconClass: item.iconClass,
                href: normalizeText(row?.label_en),
                enabled: row ? row.is_active !== false : true,
                sortOrder: Number.isFinite(Number(row?.sort_order)) ? Number(row.sort_order) : (index + 1) * 10,
                defaultHref: item.defaultHref,
                rowId: row?.id || null,
            };
        }),
    };
}

export async function upsertFooterSocialItem({ id, href = '', enabled = true, sortOrder = 100 }) {
    const normalizedId = normalizeText(id).toLowerCase();
    if (!normalizedId) throw new Error('社交按钮 ID 无效。');

    const payload = {
        section: SOCIAL_SECTION,
        option_id: normalizedId,
        label_en: normalizeText(href),
        label_zh: '',
        sort_order: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 100,
        is_active: Boolean(enabled),
    };

    const { data, error } = await client
        .from(TABLE)
        .upsert([payload], { onConflict: 'section,option_id' })
        .select('id,section,option_id,label_en,label_zh,sort_order,is_active')
        .single();

    if (error) throw error;
    return data;
}

export async function updateFooterSocialGroupVisible(visible = true) {
    const payload = {
        section: META_SECTION,
        option_id: SOCIAL_ENABLED_KEY,
        label_en: '',
        label_zh: '',
        sort_order: 10,
        is_active: Boolean(visible),
    };

    const { data, error } = await client
        .from(TABLE)
        .upsert([payload], { onConflict: 'section,option_id' })
        .select('id,section,option_id,label_en,label_zh,sort_order,is_active')
        .single();

    if (error) throw error;
    return data;
}

export async function upsertFooterContactSettings({ label = 'www_gasgx_com', href = '/about/contact' } = {}) {
    const payload = [
        {
            section: CONTACT_SECTION,
            option_id: CONTACT_LABEL_KEY,
            label_en: normalizeText(label),
            label_zh: '',
            sort_order: 10,
            is_active: true,
        },
        {
            section: CONTACT_SECTION,
            option_id: CONTACT_HREF_KEY,
            label_en: normalizeText(href),
            label_zh: '',
            sort_order: 20,
            is_active: true,
        },
    ];

    const { data, error } = await client
        .from(TABLE)
        .upsert(payload, { onConflict: 'section,option_id' })
        .select('id,section,option_id,label_en,label_zh,sort_order,is_active');

    if (error) throw error;
    return Array.isArray(data) ? data : [];
}
