insert into public.knowledge_documents (
    source_type,
    visibility,
    language,
    title,
    canonical_url,
    excerpt,
    content_markdown,
    source_meta,
    status,
    last_crawled_at
)
values
    (
        'internal_sales_kb',
        'internal_sales',
        'en',
        'Stranded Gas Mining Quotation Checklist',
        'kb://gasgx/stranded-gas/quote-checklist',
        'GasGx quotation checklist for stranded-gas and flare-gas power mining projects.',
        'Internal sales playbook for collecting quotation inputs on stranded-gas power mining opportunities.',
        jsonb_build_object('seed', 'v1_stranded_gas_sales_playbook', 'topic', 'quote_checklist'),
        'published',
        timezone('utc', now())
    ),
    (
        'internal_sales_kb',
        'internal_sales',
        'en',
        'Stranded Gas Mining Promise Boundaries',
        'kb://gasgx/stranded-gas/promise-boundaries',
        'GasGx sales boundary card describing what should not be promised on stranded-gas power mining projects.',
        'Internal sales playbook for compliance-safe and delivery-safe language on stranded-gas mining opportunities.',
        jsonb_build_object('seed', 'v1_stranded_gas_sales_playbook', 'topic', 'promise_boundaries'),
        'published',
        timezone('utc', now())
    )
on conflict (canonical_url) do update
set
    title = excluded.title,
    excerpt = excluded.excerpt,
    content_markdown = excluded.content_markdown,
    source_meta = excluded.source_meta,
    status = excluded.status,
    last_crawled_at = excluded.last_crawled_at,
    updated_at = timezone('utc', now());

delete from public.knowledge_chunks
where source_meta ->> 'seed' = 'v1_stranded_gas_sales_playbook';

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
    jsonb_build_object('seed', 'v1_stranded_gas_sales_playbook', 'kind', seed.kind),
    seed.chunk_text || ' ' || seed.chunk_summary || ' ' || array_to_string(seed.keywords, ' ')
from (
    values
        (
            'kb://gasgx/stranded-gas/quote-checklist',
            'quote_checklist',
            10,
            'For stranded-gas or flare-gas power mining quotations, GasGx should collect: country and basin or province, site type (oilfield, flare site, remote gas site), target load in kW or MW, expected compute load type, gas source type, gas composition and contaminants, available flow and pressure, voltage and frequency target, grid mode, ambient conditions, winterization requirement, preferred deployment format, and whether switchgear, cooling, enclosure, remote monitoring and maintenance support are in scope.',
            'Quotation intake for stranded-gas mining should capture location, site type, load, gas quality, electrical target, environment and deployment scope.',
            array['quotation checklist', 'stranded gas quote', 'flare gas quote', 'gas composition', 'available flow', 'voltage frequency', 'winterization', 'deployment format'],
            'quotation_inputs',
            75
        ),
        (
            'kb://gasgx/stranded-gas/quote-checklist',
            'quote_checklist',
            20,
            'A strong stranded-gas quotation brief also needs commercial boundaries: temporary or permanent deployment, mobility expectations, local logistics limits, commissioning model, service reach, fuel-treatment scope, emissions or noise constraints, and whether the customer expects a pilot phase before a larger field rollout. If these are missing, the quotation should be positioned as preliminary only.',
            'Quotation briefs should also capture commercial boundaries such as mobility, logistics, commissioning, service reach and pilot-vs-rollout scope.',
            array['pilot phase', 'commissioning model', 'service reach', 'fuel treatment', 'noise constraints', 'preliminary quotation', 'field rollout'],
            'quotation_boundaries',
            54
        ),
        (
            'kb://gasgx/stranded-gas/promise-boundaries',
            'promise_boundaries',
            10,
            'On stranded-gas mining projects, GasGx should not promise emissions approval, flaring exemptions, guaranteed permitting outcomes, exact lead times, exact warranty terms beyond approved commercial documents, exact gas suitability before analysis, or guaranteed mining profitability. These topics depend on gas testing, local regulation, site-specific engineering and the final commercial contract.',
            'Do not promise approvals, exemptions, exact lead times, exact warranty terms, untested gas suitability or mining profitability.',
            array['do not promise', 'emissions approval', 'flare exemption', 'lead time', 'warranty', 'gas suitability', 'profitability'],
            'promise_limits',
            49
        ),
        (
            'kb://gasgx/stranded-gas/promise-boundaries',
            'promise_boundaries',
            20,
            'The correct sales language is to say that GasGx can help evaluate site fit, propose a packaged generation direction, structure the qualification checklist, and support the customer toward a formal technical and commercial review. This keeps the conversation useful without overcommitting on compliance, infrastructure, economics or delivery scope too early.',
            'The safe posture is to offer evaluation, packaged-direction guidance and formal review support without overcommitting too early.',
            array['sales boundary', 'formal review', 'technical evaluation', 'packaged direction', 'qualification checklist', 'compliance safe'],
            'safe_language',
            43
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
            'flare gas quote',
            'quote for stranded gas mining',
            'what info do you need for stranded gas quote',
            'quotation checklist stranded gas'
        ],
        'For a stranded-gas or flare-gas power mining quotation, GasGx should first collect the country and basin or province, site type, target power or compute load, gas source type, gas composition and contaminants, available flow and pressure, voltage and frequency, grid mode, ambient and winterization conditions, preferred deployment format, and whether switchgear, cooling, enclosure, monitoring and maintenance are in scope. We should also confirm mobility expectations, logistics limits, commissioning model, service reach, fuel-treatment scope and whether this is a pilot or a full rollout. Without those inputs, any quotation should be treated as preliminary.',
        true,
        'quote',
        array['country', 'basin_or_province', 'site_type', 'power', 'gas_quality', 'available_flow', 'voltage_frequency', 'deployment', 'service_scope'],
        jsonb_build_array(
            jsonb_build_object('title', 'Stranded Gas Mining Quotation Checklist', 'url', 'kb://gasgx/stranded-gas/quote-checklist', 'source_type', 'internal_sales_kb')
        ),
        'published'
    ),
    (
        'stranded_gas_promise_boundaries',
        'en',
        array[
            'what should not be promised on stranded gas mining',
            'what can you not promise',
            'stranded gas compliance promise',
            'flare gas promise boundary',
            'what are the promise boundaries'
        ],
        'On stranded-gas mining projects, GasGx should not promise emissions approval, flare exemptions, guaranteed permitting outcomes, exact lead times, final warranty terms outside approved commercial documents, untested gas suitability, or guaranteed mining profitability. The correct position is that GasGx can help evaluate site fit, recommend a packaged generation direction, structure the qualification checklist and support the project toward formal technical and commercial review once site-specific data is confirmed.',
        false,
        'unknown',
        array[]::text[],
        jsonb_build_array(
            jsonb_build_object('title', 'Stranded Gas Mining Promise Boundaries', 'url', 'kb://gasgx/stranded-gas/promise-boundaries', 'source_type', 'internal_sales_kb')
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
