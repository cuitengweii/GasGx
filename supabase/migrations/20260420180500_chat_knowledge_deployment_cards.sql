delete from public.knowledge_chunks
where source_meta ->> 'seed' = 'v1_deployment_cards';

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
    jsonb_build_object('seed', 'v1_deployment_cards', 'kind', 'deployment_profile'),
    seed.chunk_text || ' ' || seed.chunk_summary || ' ' || array_to_string(seed.keywords, ' ')
from (
    values
        (
            'https://www.gasgx.com/products/deployment/container/',
            110,
            'GasGx containerized deployment packages generator sets into a transportable enclosure for field delivery, outdoor placement and faster on-site commissioning. This path is commonly used when customers need a compact power block with clearer logistics and easier relocation across oilfield, mining or remote industrial sites.',
            'Containerized deployment focuses on transportable packaged power for field delivery, outdoor placement and faster commissioning.',
            array['containerized deployment', 'container genset', 'field deployment', 'outdoor power', 'mobile power block', 'oilfield', 'mining', 'commissioning'],
            'deployment_profile',
            64
        ),
        (
            'https://www.gasgx.com/products/deployment/container/',
            120,
            'For pre-sales guidance, containerized units usually fit projects that care about deployment speed, packaged balance-of-plant coordination, transport efficiency and easier site standardization. Qualification should still confirm power target, gas source and gas quality, voltage and frequency, ambient conditions, grid mode and local transport limits.',
            'Containerized units are a good fit when the project values deployment speed, packaged coordination and easier relocation.',
            array['deployment speed', 'packaged solution', 'transport efficiency', 'site standardization', 'gas quality', 'voltage frequency', 'grid mode', 'ambient conditions'],
            'deployment_fit',
            67
        ),
        (
            'https://www.gasgx.com/products/deployment/ais/',
            110,
            'GasGx AIS-integrated deployment is positioned for customers who want an integrated unit architecture rather than a loose multi-skid layout. In chat guidance, AIS pages should be treated as deployment-specific knowledge, not as a generic power-range page.',
            'AIS deployment is an integrated unit architecture and should rank as deployment-specific knowledge.',
            array['AIS integrated', 'integrated unit', 'deployment architecture', 'integrated package', 'deployment specific', 'field integration'],
            'deployment_profile',
            44
        ),
        (
            'https://www.gasgx.com/products/deployment/ais/',
            120,
            'AIS-oriented qualification should emphasize site integration boundaries, electrical interface expectations, installation footprint, maintenance access and whether the customer wants a more consolidated deployment format for long-term operation.',
            'AIS qualification emphasizes site integration boundaries, interfaces, footprint and maintenance access.',
            array['electrical interface', 'installation footprint', 'maintenance access', 'integrated format', 'site integration', 'long-term operation'],
            'deployment_fit',
            37
        ),
        (
            'https://www.gasgx.com/products/deployment/skid/',
            110,
            'GasGx skid-mounted deployment is typically used when the project wants equipment on a skid base for site assembly flexibility, mechanical accessibility and coordination with local balance-of-plant scope. This is still deployment knowledge and should rank ahead of broad product-family pages when users ask about skid deployment.',
            'Skid-mounted deployment fits projects that want skid-base assembly flexibility and easier mechanical access.',
            array['skid mounted', 'skid base', 'site assembly', 'mechanical access', 'balance of plant', 'deployment type'],
            'deployment_profile',
            49
        ),
        (
            'https://www.gasgx.com/products/deployment/skid/',
            120,
            'Skid deployment conversations should confirm whether the customer prefers local enclosure scope, how much on-site integration is acceptable, transport constraints, maintenance workflow and whether the project prioritizes modular assembly over a fully containerized package.',
            'Skid qualification focuses on local enclosure scope, on-site integration and modular assembly preference.',
            array['local enclosure', 'on-site integration', 'transport constraints', 'maintenance workflow', 'modular assembly', 'containerized comparison'],
            'deployment_fit',
            39
        )
) as seed(canonical_url, sort_order, chunk_text, chunk_summary, keywords, section_path, token_count)
join public.knowledge_documents kd
    on kd.canonical_url = seed.canonical_url
where kd.status = 'published';
