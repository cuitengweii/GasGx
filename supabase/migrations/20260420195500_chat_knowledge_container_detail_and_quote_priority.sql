delete from public.knowledge_chunks
where source_meta ->> 'seed' = 'v2_container_deployment_detail';

insert into public.knowledge_chunks (
    document_id,
    chunk_text,
    chunk_summary,
    language,
    keywords,
    section_path,
    sort_order,
    token_count,
    source_meta,
    search_text
)
select
    kd.id,
    seed.chunk_text,
    seed.chunk_summary,
    'en',
    seed.keywords,
    seed.section_path,
    seed.sort_order,
    seed.token_count,
    jsonb_build_object('seed', 'v2_container_deployment_detail', 'kind', seed.kind),
    seed.chunk_text || ' ' || seed.chunk_summary || ' ' || array_to_string(seed.keywords, ' ')
from (
    values
        (
            'https://www.gasgx.com/products/deployment/container/',
            'container_positioning',
            210,
            'GasGx container deployment should be explained as a packaged outdoor power block for customers who want generator set, enclosure and core balance-of-plant coordination in one transport-oriented delivery format. It is the right first answer when the customer asks for containerized gas power, mobile container genset supply, or faster field deployment with reduced on-site assembly burden.',
            'Container deployment is the packaged outdoor power-block answer for customers asking for containerized gas power and faster field delivery.',
            array['container deployment', 'containerized gas power', 'mobile container genset', 'packaged power block', 'outdoor enclosure', 'field deployment'],
            'container/positioning',
            58
        ),
        (
            'https://www.gasgx.com/products/deployment/container/',
            'container_scope',
            220,
            'When qualifying a container deployment project, GasGx should confirm whether the customer expects only the power core inside the container or also switchgear, cooling, controls, remote monitoring, gas treatment interface, step-up or step-down electrical scope, and service-access arrangement around the enclosure. This keeps the chat answer aligned with quotation intake instead of sounding like a generic product page.',
            'Container deployment qualification should confirm enclosure scope, electrical scope, controls, cooling, monitoring and service-access expectations.',
            array['container scope', 'switchgear', 'cooling', 'controls', 'remote monitoring', 'gas treatment', 'service access', 'quotation intake'],
            'container/qualification',
            63
        ),
        (
            'https://www.gasgx.com/products/deployment/container/',
            'container_site_fit',
            230,
            'Container deployment is usually a good fit when the site values transport efficiency, repeatable rollout, weather protection, simpler relocation and a cleaner packaged appearance for oilfield, mining or remote industrial use. It may be less suitable when the customer wants maximum open mechanical access, heavy local customization outside the enclosure, or a site-built integration model that is better served by skid deployment.',
            'Container deployment fits transportable repeatable projects, while open-access or highly customized integration may fit skid deployment better.',
            array['site fit', 'transport efficiency', 'repeatable rollout', 'weather protection', 'relocation', 'skid comparison', 'mechanical access'],
            'container/site-fit',
            57
        ),
        (
            'https://www.gasgx.com/products/deployment/container/',
            'container_quote_checklist',
            240,
            'For a container deployment quotation, GasGx should collect target load, gas type and gas quality, available flow and pressure, voltage and frequency target, grid mode, ambient temperature range, altitude, noise boundary, transport route limits, local lifting or crane constraints, service clearance around the container, and whether mining load, cooling, switchgear, remote O&M or winterization are included. Without those inputs, the answer should stay at guidance level rather than implying a finished quote.',
            'Container quotation intake should capture gas, electrical target, environment, logistics and included-scope boundaries before pricing is discussed.',
            array['container quote', 'container quotation', 'transport limits', 'lifting constraints', 'service clearance', 'winterization', 'remote o&m', 'guidance level'],
            'container/quote-checklist',
            72
        )
) as seed(canonical_url, kind, sort_order, chunk_text, chunk_summary, keywords, section_path, token_count)
join public.knowledge_documents kd
    on kd.canonical_url = seed.canonical_url
where kd.status = 'published';

insert into public.chat_faq_rules (
    intent_key,
    language,
    trigger_patterns,
    answer_template,
    handoff_required,
    handoff_reason,
    next_fields,
    source_refs,
    status
)
values
    (
        'stranded_gas_quote_checklist',
        'en',
        array[
            'stranded gas quote',
            'stranded gas quotation',
            'stranded gas pricing',
            'price for stranded gas mining',
            'cost for stranded gas mining',
            'flare gas quote',
            'flare gas pricing',
            'quote for stranded gas mining',
            'what info do you need for stranded gas quote',
            'quotation checklist stranded gas',
            'associated gas quote',
            'apg quote'
        ],
        'For a stranded-gas or flare-gas power mining quotation, GasGx should first collect the country and basin or province, site type, target power or compute load, gas source type, gas composition and contaminants, available flow and pressure, voltage and frequency, grid mode, ambient and winterization conditions, preferred deployment format, and whether switchgear, cooling, enclosure, monitoring and maintenance are in scope. We should also confirm mobility expectations, logistics limits, commissioning model, service reach, fuel-treatment scope and whether this is a pilot or a full rollout. Without those inputs, any quotation should be treated as preliminary.',
        true,
        'quote',
        array['country', 'basin_or_province', 'site_type', 'power', 'gas_quality', 'available_flow', 'voltage_frequency', 'deployment', 'service_scope'],
        jsonb_build_array(
            jsonb_build_object('title', 'Stranded Gas Mining Quotation Checklist', 'url', 'kb://gasgx/stranded-gas/quote-checklist', 'source_type', 'internal_sales_kb')
        ),
        'published'
    )
on conflict (intent_key, language) do update
set
    trigger_patterns = excluded.trigger_patterns,
    answer_template = excluded.answer_template,
    handoff_required = excluded.handoff_required,
    handoff_reason = excluded.handoff_reason,
    next_fields = excluded.next_fields,
    source_refs = excluded.source_refs,
    status = excluded.status,
    updated_at = timezone('utc', now());
