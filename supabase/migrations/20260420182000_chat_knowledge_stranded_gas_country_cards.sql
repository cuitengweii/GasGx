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
        'Stranded Gas Mining Playbook - United States',
        'kb://gasgx/stranded-gas/united-states',
        'United States stranded-gas mining knowledge covering flare-gas context, public-land and state compliance attention points, and pre-sales qualification guidance.',
        'GasGx internal knowledge card for stranded natural gas power mining opportunities in the United States.',
        jsonb_build_object(
            'seed', 'v1_stranded_gas_country_cards',
            'country', 'United States',
            'topic', 'stranded_gas_mining',
            'sources', jsonb_build_array(
                'https://www.worldbank.org/en/programs/gasflaringreduction/global-flaring-data',
                'https://www.blm.gov/press-release/interior-department-finalizes-rule-reduce-oil-and-gas-waste-public-and-tribal-lands',
                'https://www.aer.ca/regulations-and-compliance-enforcement/rules-and-regulations/directives/directive-060'
            )
        ),
        'published',
        timezone('utc', now())
    ),
    (
        'internal_sales_kb',
        'internal_sales',
        'en',
        'Stranded Gas Mining Playbook - Canada',
        'kb://gasgx/stranded-gas/canada',
        'Canada stranded-gas mining knowledge covering flare and venting controls, provincial upstream frameworks, and qualification guidance for remote oilfield and gas sites.',
        'GasGx internal knowledge card for stranded natural gas power mining opportunities in Canada.',
        jsonb_build_object(
            'seed', 'v1_stranded_gas_country_cards',
            'country', 'Canada',
            'topic', 'stranded_gas_mining',
            'sources', jsonb_build_array(
                'https://www.aer.ca/regulations-and-compliance-enforcement/rules-and-regulations/directives/directive-060',
                'https://www.canada.ca/en/environment-climate-change/news/2018/04/federal-methane-regulations-for-the-upstream-oil-and-gas-sector.html',
                'https://www.bc-er.ca/how-we-regulate/legislative-framework/regulatory-update/drilling-and-production-regulation-dpr-methane-regulations-review/'
            )
        ),
        'published',
        timezone('utc', now())
    ),
    (
        'internal_sales_kb',
        'internal_sales',
        'en',
        'Stranded Gas Mining Playbook - Russia',
        'kb://gasgx/stranded-gas/russia',
        'Russia stranded-gas mining knowledge covering associated petroleum gas utilization, remote-field constraints, and qualification guidance for APG-powered digital loads.',
        'GasGx internal knowledge card for stranded natural gas power mining opportunities in Russia.',
        jsonb_build_object(
            'seed', 'v1_stranded_gas_country_cards',
            'country', 'Russia',
            'topic', 'stranded_gas_mining',
            'sources', jsonb_build_array(
                'https://www.worldbank.org/en/programs/gasflaringreduction/global-flaring-data',
                'https://flaringventingregulations.worldbank.org/russian-federation',
                'https://www.worldbank.org/en/news/feature/2013/11/12/igniting-solutions-to-gas-flaring-in-russia'
            )
        ),
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
where source_meta ->> 'seed' = 'v1_stranded_gas_country_cards';

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
    jsonb_build_object('seed', 'v1_stranded_gas_country_cards', 'country', seed.country_code, 'kind', 'country_playbook'),
    seed.chunk_text || ' ' || seed.chunk_summary || ' ' || array_to_string(seed.keywords, ' ')
from (
    values
        (
            'kb://gasgx/stranded-gas/united-states',
            'us',
            10,
            'In the United States, stranded-gas power mining opportunities usually come from associated gas or flare-gas streams at remote oil production sites, especially where gathering or takeaway is constrained and where the operator wants to reduce routine flaring while monetizing otherwise wasted gas through on-site power generation.',
            'United States opportunities usually come from associated-gas and flare-gas streams at remote oil sites with takeaway constraints.',
            array['united states', 'usa', 'flare gas', 'associated gas', 'stranded gas', 'remote oil site', 'takeaway constraint', 'bitcoin mining'],
            'market_context',
            49
        ),
        (
            'kb://gasgx/stranded-gas/united-states',
            'us',
            20,
            'For U.S. qualification, GasGx should confirm whether the site is on federal, tribal, state, or private land; whether the operator is constrained by flare-capture targets or anti-waste rules; and whether the project is best framed as flare mitigation plus mobile compute rather than a permanent export-power plant. Public-land projects need extra care because venting and flaring compliance can involve federal rules as well as state regulators.',
            'United States qualification should check land status, anti-waste compliance and whether the project is framed as flare mitigation with mobile compute.',
            array['federal land', 'tribal land', 'private land', 'anti-waste rule', 'flare capture', 'mobile compute', 'public land compliance', 'oilfield power'],
            'qualification',
            67
        ),
        (
            'kb://gasgx/stranded-gas/united-states',
            'us',
            30,
            'In sales conversations for the United States, the best deployment language is usually modular and rapidly deployable packaged generation: confirm gas composition, pressure, H2S or contaminants, available flow stability, ambient conditions, interconnection expectations, local permitting path, noise and emissions expectations, and whether the customer wants a movable containerized system for changing well-site economics.',
            'United States sales guidance should emphasize modular packaged generation and qualification around gas quality, permitting and mobility.',
            array['containerized', 'modular deployment', 'gas composition', 'H2S', 'emissions', 'noise', 'permitting', 'interconnection'],
            'sales_guidance',
            58
        ),
        (
            'kb://gasgx/stranded-gas/canada',
            'ca',
            10,
            'In Canada, stranded-gas mining opportunities usually need to be discussed in the context of stricter upstream flare, venting and methane-management expectations, especially in producing provinces such as Alberta, Saskatchewan and British Columbia. The commercial opening is strongest where operators want to reduce waste-gas losses while keeping a deployable on-site load in remote basins.',
            'Canada opportunities should be framed around stricter flare, venting and methane-management expectations in producing provinces.',
            array['canada', 'alberta', 'saskatchewan', 'british columbia', 'flare', 'venting', 'methane', 'remote basin'],
            'market_context',
            53
        ),
        (
            'kb://gasgx/stranded-gas/canada',
            'ca',
            20,
            'For Canada qualification, GasGx should identify the province first because Alberta, Saskatchewan and British Columbia have different operating frameworks and equivalency arrangements relative to federal methane rules. The project discussion should confirm whether the value proposition is flare reduction, vent reduction, gas conservation, remote digital load, or a broader field-power package.',
            'Canada qualification starts with the province because regulatory frameworks differ across Alberta, Saskatchewan and British Columbia.',
            array['province', 'alberta regulator', 'bc regulator', 'saskatchewan', 'equivalency', 'flare reduction', 'vent reduction', 'gas conservation'],
            'qualification',
            57
        ),
        (
            'kb://gasgx/stranded-gas/canada',
            'ca',
            30,
            'In Canada pre-sales, emphasize conservative compliance language: do not promise emissions approval or flare exemptions. Instead, position GasGx as a packaged generation partner that can help convert otherwise wasted gas into controlled on-site power, provided the operator confirms gas quality, winterization requirements, enclosure choice, electrical scope, maintenance model and provincial permitting path.',
            'Canada sales language should stay conservative on compliance and focus on packaged generation, winterization and provincial permitting.',
            array['winterization', 'provincial permitting', 'conservative compliance', 'packaged generation', 'on-site power', 'maintenance model', 'enclosure choice'],
            'sales_guidance',
            49
        ),
        (
            'kb://gasgx/stranded-gas/russia',
            'ru',
            10,
            'In Russia, the stranded-gas mining discussion is mainly an associated-petroleum-gas utilization discussion. The strongest fit is remote oilfield APG where gathering, processing or transport infrastructure is limited and where the operator needs an on-site load to support better APG utilization instead of continued flaring.',
            'Russia opportunities are mainly remote oilfield APG-utilization cases where on-site load can improve gas use instead of flaring.',
            array['russia', 'associated petroleum gas', 'APG', 'remote oilfield', 'gas utilization', 'flaring reduction', 'on-site load'],
            'market_context',
            46
        ),
        (
            'kb://gasgx/stranded-gas/russia',
            'ru',
            20,
            'GasGx should treat Russia opportunities as technically attractive but operationally sensitive: confirm APG stability, contaminants, remote logistics, winterization, service reach, sanctions and supply-chain constraints, data-network availability, and whether the customer needs a self-contained field-power package with low dependence on missing midstream infrastructure.',
            'Russia qualification should cover APG stability, contaminants, remote logistics, winterization and supply-chain constraints.',
            array['winterization', 'remote logistics', 'sanctions', 'supply chain', 'field power package', 'midstream constraint', 'service reach', 'contaminants'],
            'qualification',
            51
        ),
        (
            'kb://gasgx/stranded-gas/russia',
            'ru',
            30,
            'In Russia sales guidance, the correct value proposition is not generic bitcoin mining alone. It is APG monetization plus reduced waste plus remote digital load support. Qualification should verify whether the operator is trying to improve APG-utilization performance, avoid building oversized gathering assets too early, or create an interim monetization path while field infrastructure remains incomplete.',
            'Russia sales guidance should position the project as APG monetization and utilization improvement, not just generic mining.',
            array['APG monetization', 'utilization target', 'remote digital load', 'interim monetization', 'gathering assets', 'field infrastructure'],
            'sales_guidance',
            50
        )
) as seed(canonical_url, country_code, sort_order, chunk_text, chunk_summary, keywords, section_path, token_count)
join public.knowledge_documents kd
    on kd.canonical_url = seed.canonical_url
where kd.status = 'published';
