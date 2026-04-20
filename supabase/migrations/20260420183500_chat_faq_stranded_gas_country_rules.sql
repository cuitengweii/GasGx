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
        'stranded_gas_us',
        'en',
        array[
            'united states stranded gas',
            'usa stranded gas',
            'us stranded gas',
            'united states flare gas mining',
            'usa flare gas bitcoin mining'
        ],
        'For stranded-gas power mining opportunities in the United States, GasGx should qualify the project as an oilfield flare-mitigation and on-site power case before treating it as a pure mining case. The key checks are: land status (federal, tribal, state or private), gas composition and stability, pressure and contaminants, flare-capture or anti-waste compliance expectations, local permitting path, emissions and noise expectations, and whether the customer needs a modular containerized package that can move with changing well-site economics. In U.S. sales language, the strongest value proposition is usually wasted-gas monetization plus deployable field power, not a promise of permanent export-power infrastructure.',
        true,
        'lead',
        array['application', 'state_or_basin', 'land_status', 'gas_quality', 'available_flow', 'voltage_frequency', 'deployment'],
        jsonb_build_array(
            jsonb_build_object('title', 'Stranded Gas Mining Playbook - United States', 'url', 'kb://gasgx/stranded-gas/united-states', 'source_type', 'internal_sales_kb')
        ),
        'published'
    ),
    (
        'stranded_gas_canada',
        'en',
        array[
            'canada stranded gas',
            'canada flare gas mining',
            'canada bitcoin mining stranded gas',
            'alberta stranded gas mining',
            'canada methane flare mining'
        ],
        'For stranded-gas power mining projects in Canada, GasGx should start by identifying the province because Alberta, Saskatchewan and British Columbia operate under different upstream frameworks and methane-control expectations. The project should be qualified as a flare-reduction, vent-reduction or gas-conservation case with remote digital load support. The key checks are: province, gas quality and contaminants, winterization needs, enclosure type, site logistics, maintenance model, electrical scope, and the customer''s permitting path. In Canada, the safest sales posture is conservative compliance language: do not promise flare exemptions or emissions approvals; position GasGx as a packaged generation partner that can help convert otherwise wasted gas into controlled on-site power if the operator clears the provincial path.',
        true,
        'lead',
        array['application', 'province', 'gas_quality', 'winterization', 'available_flow', 'voltage_frequency', 'deployment'],
        jsonb_build_array(
            jsonb_build_object('title', 'Stranded Gas Mining Playbook - Canada', 'url', 'kb://gasgx/stranded-gas/canada', 'source_type', 'internal_sales_kb')
        ),
        'published'
    ),
    (
        'stranded_gas_russia',
        'en',
        array[
            'russia stranded gas',
            'russia associated gas mining',
            'russia apg mining',
            'russian associated petroleum gas mining',
            'russia flare gas mining'
        ],
        'In Russia, GasGx should frame stranded-gas mining as an associated-petroleum-gas utilization project rather than as generic bitcoin mining alone. The strongest fit is a remote oilfield APG case where gathering, processing or transport infrastructure is limited and where the operator wants an on-site load to improve gas utilization. Qualification should cover APG stability, contaminants, remote logistics, winterization, data-network availability, service reach, sanctions and supply-chain constraints, and whether the customer needs a self-contained field-power package with low dependence on missing midstream infrastructure. The sales message should focus on APG monetization, reduced waste and interim field monetization while infrastructure is incomplete.',
        true,
        'lead',
        array['application', 'region_or_field', 'gas_quality', 'available_flow', 'winterization', 'service_model', 'deployment'],
        jsonb_build_array(
            jsonb_build_object('title', 'Stranded Gas Mining Playbook - Russia', 'url', 'kb://gasgx/stranded-gas/russia', 'source_type', 'internal_sales_kb')
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
