import { client } from './supabase.client.js';

const TABLE = 'feeder_form_options';

export const TAG_SECTIONS = ['category', 'publisher', 'tag', 'secondary_tag'];

function normalizeText(value) {
    return String(value || '').trim();
}

export async function fetchTagOptions() {
    const { data, error } = await client
        .from(TABLE)
        .select('*')
        .order('section', { ascending: true })
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
}

export async function upsertTagOption({ section, option_id, label_en, label_zh = '', sort_order = 100, is_active = true }) {
    const normalizedSection = normalizeText(section).toLowerCase();
    const normalizedOptionId = normalizeText(option_id);
    const normalizedLabel = normalizeText(label_en);

    if (!TAG_SECTIONS.includes(normalizedSection)) throw new Error('Invalid section.');
    if (!normalizedOptionId || !normalizedLabel) throw new Error('Option id and label are required.');

    const payload = {
        section: normalizedSection,
        option_id: normalizedOptionId,
        label_en: normalizedLabel,
        label_zh: normalizeText(label_zh),
        sort_order: Number.isFinite(Number(sort_order)) ? Number(sort_order) : 100,
        is_active: Boolean(is_active),
    };

    const { data, error } = await client
        .from(TABLE)
        .upsert([payload], { onConflict: 'section,option_id' })
        .select('*')
        .single();

    if (error) throw error;
    return data;
}

export async function updateTagOptionById(id, patch = {}) {
    const payload = {};

    if ('label_en' in patch) payload.label_en = normalizeText(patch.label_en);
    if ('label_zh' in patch) payload.label_zh = normalizeText(patch.label_zh);
    if ('sort_order' in patch) {
        const nextOrder = Number(patch.sort_order);
        payload.sort_order = Number.isFinite(nextOrder) ? nextOrder : 100;
    }
    if ('is_active' in patch) payload.is_active = Boolean(patch.is_active);

    const { data, error } = await client.from(TABLE).update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
}

export async function deleteTagOptionById(id) {
    const { error } = await client.from(TABLE).delete().eq('id', id);
    if (error) throw error;
}
