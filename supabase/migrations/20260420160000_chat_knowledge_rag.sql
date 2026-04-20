create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_generic_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

create table if not exists public.knowledge_documents (
    id uuid primary key default gen_random_uuid(),
    source_type text not null default 'public_page'
        check (source_type in ('public_page', 'resource_doc', 'internal_sales_kb', 'faq', 'datasheet', 'case_study', 'certification')),
    visibility text not null default 'public'
        check (visibility in ('public', 'internal_sales')),
    language text not null default 'en'
        check (language in ('zh', 'en', 'ru')),
    title text not null default '',
    canonical_url text not null,
    excerpt text not null default '',
    content_markdown text not null default '',
    source_meta jsonb not null default '{}'::jsonb,
    status text not null default 'draft'
        check (status in ('draft', 'published', 'archived')),
    last_crawled_at timestamptz null,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    created_by uuid null,
    updated_by uuid null
);

create unique index if not exists knowledge_documents_canonical_url_idx
    on public.knowledge_documents (canonical_url);

create index if not exists knowledge_documents_status_idx
    on public.knowledge_documents (status, visibility, language, updated_at desc);

create table if not exists public.knowledge_chunks (
    id uuid primary key default gen_random_uuid(),
    document_id uuid not null references public.knowledge_documents(id) on delete cascade,
    chunk_text text not null default '',
    chunk_summary text not null default '',
    language text not null default 'en'
        check (language in ('zh', 'en', 'ru')),
    keywords text[] not null default '{}'::text[],
    section_path text not null default '',
    sort_order integer not null default 0,
    token_count integer not null default 0,
    source_meta jsonb not null default '{}'::jsonb,
    search_text text not null default '',
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists knowledge_chunks_document_idx
    on public.knowledge_chunks (document_id, sort_order);

create index if not exists knowledge_chunks_language_idx
    on public.knowledge_chunks (language, updated_at desc);

create index if not exists knowledge_chunks_search_idx
    on public.knowledge_chunks using gin (
        to_tsvector(
            'simple',
            coalesce(search_text, '')
        )
    );

create table if not exists public.chat_faq_rules (
    id uuid primary key default gen_random_uuid(),
    intent_key text not null,
    language text not null default 'en'
        check (language in ('zh', 'en', 'ru')),
    trigger_patterns text[] not null default '{}'::text[],
    answer_template text not null default '',
    handoff_required boolean not null default false,
    handoff_reason text not null default 'unknown'
        check (handoff_reason in ('quote', 'lead', 'support', 'unknown')),
    next_fields text[] not null default '{}'::text[],
    source_refs jsonb not null default '[]'::jsonb,
    status text not null default 'draft'
        check (status in ('draft', 'published', 'archived')),
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    created_by uuid null,
    updated_by uuid null
);

create unique index if not exists chat_faq_rules_intent_language_idx
    on public.chat_faq_rules (intent_key, language);

create index if not exists chat_faq_rules_status_idx
    on public.chat_faq_rules (status, language, updated_at desc);

create table if not exists public.chat_lead_intents (
    id uuid primary key default gen_random_uuid(),
    session_id text not null default '',
    user_question text not null default '',
    detected_intent text not null default '',
    project_summary text not null default '',
    required_followup_fields text[] not null default '{}'::text[],
    contact_channel text not null default 'contact@gasgx.com',
    language text not null default 'en'
        check (language in ('zh', 'en', 'ru')),
    provider text not null default '',
    source_refs jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists chat_lead_intents_session_idx
    on public.chat_lead_intents (session_id, created_at desc);

create index if not exists chat_lead_intents_intent_idx
    on public.chat_lead_intents (detected_intent, created_at desc);

create table if not exists public.chat_qa_logs (
    id uuid primary key default gen_random_uuid(),
    session_id text not null default '',
    user_message text not null default '',
    assistant_reply text not null default '',
    language text not null default 'en'
        check (language in ('zh', 'en', 'ru')),
    provider text not null default '',
    matched_intent text not null default '',
    page_context jsonb not null default '{}'::jsonb,
    source_refs jsonb not null default '[]'::jsonb,
    handoff jsonb not null default '{}'::jsonb,
    failed boolean not null default false,
    error_code text not null default '',
    feedback_status text not null default 'unreviewed'
        check (feedback_status in ('unreviewed', 'good', 'bad', 'needs_knowledge')),
    feedback_note text not null default '',
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    reviewed_by uuid null
);

create index if not exists chat_qa_logs_created_idx
    on public.chat_qa_logs (created_at desc);

create index if not exists chat_qa_logs_feedback_idx
    on public.chat_qa_logs (feedback_status, failed, created_at desc);

drop trigger if exists trg_knowledge_documents_updated_at on public.knowledge_documents;
create trigger trg_knowledge_documents_updated_at
before update on public.knowledge_documents
for each row
execute function public.set_generic_updated_at();

drop trigger if exists trg_knowledge_chunks_updated_at on public.knowledge_chunks;
create trigger trg_knowledge_chunks_updated_at
before update on public.knowledge_chunks
for each row
execute function public.set_generic_updated_at();

drop trigger if exists trg_chat_faq_rules_updated_at on public.chat_faq_rules;
create trigger trg_chat_faq_rules_updated_at
before update on public.chat_faq_rules
for each row
execute function public.set_generic_updated_at();

drop trigger if exists trg_chat_qa_logs_updated_at on public.chat_qa_logs;
create trigger trg_chat_qa_logs_updated_at
before update on public.chat_qa_logs
for each row
execute function public.set_generic_updated_at();

create or replace function public.search_knowledge_chunks(search_term text, search_language text default 'en', result_limit integer default 6)
returns table (
    chunk_id uuid,
    document_id uuid,
    title text,
    canonical_url text,
    source_type text,
    visibility text,
    language text,
    section_path text,
    chunk_text text,
    chunk_summary text,
    keywords text[],
    score double precision
)
language sql
stable
security definer
set search_path = public
as $$
    with normalized as (
        select
            trim(coalesce(search_term, '')) as q,
            lower(trim(coalesce(search_term, ''))) as lowered_q,
            case
                when lower(coalesce(search_language, '')) like 'zh%' then 'zh'
                when lower(coalesce(search_language, '')) like 'ru%' then 'ru'
                else 'en'
            end as lang,
            greatest(1, least(coalesce(result_limit, 6), 12)) as safe_limit
    )
    select
        kc.id as chunk_id,
        kd.id as document_id,
        kd.title,
        kd.canonical_url,
        kd.source_type,
        kd.visibility,
        kd.language,
        kc.section_path,
        kc.chunk_text,
        kc.chunk_summary,
        kc.keywords,
        (
            case
                when normalized.q = '' then 0
                else ts_rank_cd(
                    to_tsvector('simple', coalesce(kc.search_text, '')),
                    websearch_to_tsquery('simple', normalized.q)
                )
            end
            + case when kd.language = normalized.lang then 0.20 else 0 end
            + case when kd.language = 'en' then 0.05 else 0 end
            + case when position(normalized.lowered_q in lower(kc.chunk_text)) > 0 then 1.20 else 0 end
            + coalesce((
                select count(*)::double precision * 0.25
                from unnest(coalesce(kc.keywords, '{}'::text[])) as keyword
                where length(keyword) >= 2
                  and (
                      normalized.lowered_q like '%' || lower(keyword) || '%'
                      or lower(keyword) like '%' || normalized.lowered_q || '%'
                  )
            ), 0)
        ) as score
    from normalized
    join public.knowledge_chunks kc on true
    join public.knowledge_documents kd on kd.id = kc.document_id
    where kd.status = 'published'
      and normalized.q <> ''
      and (
          to_tsvector('simple', coalesce(kc.search_text, '')) @@ websearch_to_tsquery('simple', normalized.q)
          or position(normalized.lowered_q in lower(kc.chunk_text)) > 0
          or exists (
              select 1
              from unnest(coalesce(kc.keywords, '{}'::text[])) as keyword
              where length(keyword) >= 2
                and (
                    normalized.lowered_q like '%' || lower(keyword) || '%'
                    or lower(keyword) like '%' || normalized.lowered_q || '%'
                )
          )
      )
    order by score desc, kd.updated_at desc, kc.sort_order asc
    limit (select safe_limit from normalized);
$$;

alter table public.knowledge_documents enable row level security;
alter table public.knowledge_chunks enable row level security;
alter table public.chat_faq_rules enable row level security;
alter table public.chat_lead_intents enable row level security;
alter table public.chat_qa_logs enable row level security;

drop policy if exists "knowledge_documents_admin_all" on public.knowledge_documents;
create policy "knowledge_documents_admin_all"
on public.knowledge_documents
for all
to authenticated
using (public.is_admin_console_user())
with check (public.is_admin_console_user());

drop policy if exists "knowledge_chunks_admin_all" on public.knowledge_chunks;
create policy "knowledge_chunks_admin_all"
on public.knowledge_chunks
for all
to authenticated
using (public.is_admin_console_user())
with check (public.is_admin_console_user());

drop policy if exists "chat_faq_rules_admin_all" on public.chat_faq_rules;
create policy "chat_faq_rules_admin_all"
on public.chat_faq_rules
for all
to authenticated
using (public.is_admin_console_user())
with check (public.is_admin_console_user());

drop policy if exists "chat_lead_intents_admin_all" on public.chat_lead_intents;
create policy "chat_lead_intents_admin_all"
on public.chat_lead_intents
for all
to authenticated
using (public.is_admin_console_user())
with check (public.is_admin_console_user());

drop policy if exists "chat_qa_logs_admin_all" on public.chat_qa_logs;
create policy "chat_qa_logs_admin_all"
on public.chat_qa_logs
for all
to authenticated
using (public.is_admin_console_user())
with check (public.is_admin_console_user());

insert into public.chat_faq_rules (intent_key, language, trigger_patterns, answer_template, handoff_required, handoff_reason, next_fields, source_refs, status)
values
    (
        'product_overview',
        'en',
        array['what products', 'what do you offer', 'product lines', 'solutions', 'services'],
        'GasGx mainly covers four capability groups: generator product lines by power range, gas source, cooling and deployment; solution families for oilfield, mining, industrial energy and CHP; digital systems including O&M Platform, ECM, IMS and Sales System; and support resources such as service, network, case studies, datasheets, certifications and FAQ. If you share your scenario, power target and gas source, I can narrow the recommendation.',
        false,
        'unknown',
        '{}'::text[],
        '[{"title":"GasGx Offering Map","url":"kb://gasgx/offering-overview","source_type":"internal_sales_kb"}]'::jsonb,
        'published'
    ),
    (
        'product_overview',
        'zh',
        array['你们有什么产品', '都有什么产品', '有哪些产品', '有哪些方案', '有哪些服务'],
        'GasGx 目前主要覆盖四类能力：一是燃气发电机组产品线，按功率段、气源、冷却方式和部署形式组织；二是油田伴生气、矿场供电、工业分布式能源和 CHP 等解决方案；三是 O&M Platform、ECM、IMS、Sales System 等数字化系统；四是技术支持、售后服务、服务网络、案例、白皮书、参数表、认证和 FAQ 等配套资源。如果你告诉我应用场景、目标功率和气源类型，我可以继续缩小到更合适的产品方向。',
        false,
        'unknown',
        '{}'::text[],
        '[{"title":"GasGx Offering Map","url":"kb://gasgx/offering-overview","source_type":"internal_sales_kb"}]'::jsonb,
        'published'
    ),
    (
        'product_overview',
        'ru',
        array['какие продукты', 'что вы предлагаете', 'какие решения', 'какие услуги'],
        'GasGx в основном покрывает четыре группы возможностей: линейки газогенераторов по диапазону мощности, типу газа, охлаждению и формату установки; решения для нефтепромыслов, майнинга, промышленной распределенной энергетики и CHP; цифровые системы O&M Platform, ECM, IMS и Sales System; а также поддержку, сервисную сеть, кейсы, даташиты, сертификаты и FAQ. Если вы сообщите сценарий проекта, мощность и тип газа, я сузлю рекомендацию.',
        false,
        'unknown',
        '{}'::text[],
        '[{"title":"GasGx Offering Map","url":"kb://gasgx/offering-overview","source_type":"internal_sales_kb"}]'::jsonb,
        'published'
    ),
    (
        'quote_requirements',
        'en',
        array['quote', 'quotation', 'price', 'cost', 'how much'],
        'GasGx can support a formal quotation, but the exact price depends on the project scenario, target load, gas type and quality, deployment format, country, ambient conditions, voltage and frequency, plus whether controls, mining load, cooling and remote O&M are included. If you want, send the application, power target, gas source, country and grid mode, and I can turn that into a clean pre-sales brief for follow-up at contact@gasgx.com.',
        true,
        'quote',
        array['application', 'power', 'gas_type', 'country', 'voltage_frequency', 'deployment'],
        '[{"title":"Quotation Checklist","url":"kb://gasgx/quote-checklist","source_type":"internal_sales_kb"}]'::jsonb,
        'published'
    ),
    (
        'quote_requirements',
        'zh',
        array['报价', '价格', '多少钱', '成本', '预算'],
        'GasGx 可以配合正式报价，但准确报价通常取决于项目场景、目标负载、气源类型与气质、部署形式、国家地区、环境条件、电压频率，以及是否包含电控、矿机、冷却和远程运维等范围。如果你愿意，可以把应用场景、目标功率、气源、国家和并网方式发给我，我先帮你整理成一份售前需求简表，后续可继续转给 contact@gasgx.com。',
        true,
        'quote',
        array['application', 'power', 'gas_type', 'country', 'voltage_frequency', 'deployment'],
        '[{"title":"Quotation Checklist","url":"kb://gasgx/quote-checklist","source_type":"internal_sales_kb"}]'::jsonb,
        'published'
    ),
    (
        'quote_requirements',
        'ru',
        array['цена', 'стоимость', 'сколько стоит', 'коммерческое предложение', '报价'],
        'GasGx может подготовить коммерческое предложение, но точная цена зависит от сценария проекта, требуемой мощности, типа и качества газа, формата установки, страны, условий площадки, напряжения и частоты, а также от состава поставки: управление, майнинговая нагрузка, охлаждение и удаленная O&M поддержка. Если вы отправите сферу применения, мощность, тип газа, страну и режим сети, я подготовлю краткий пресейл-бриф для дальнейшей работы через contact@gasgx.com.',
        true,
        'quote',
        array['application', 'power', 'gas_type', 'country', 'voltage_frequency', 'deployment'],
        '[{"title":"Quotation Checklist","url":"kb://gasgx/quote-checklist","source_type":"internal_sales_kb"}]'::jsonb,
        'published'
    ),
    (
        'contact_support',
        'en',
        array['contact', 'email', 'support', 'service network', 'after-sales'],
        'You can contact GasGx at contact@gasgx.com. GasGx also supports technical support, after-sales service and service-network coordination. If you share the project scenario, power range and gas source first, I can help structure the request before manual follow-up.',
        true,
        'support',
        array['application', 'power', 'gas_type', 'issue_or_goal'],
        '[{"title":"Support Scope","url":"kb://gasgx/support-scope","source_type":"internal_sales_kb"}]'::jsonb,
        'published'
    ),
    (
        'contact_support',
        'zh',
        array['联系方式', '联系', '邮箱', '售后', '技术支持', '服务网络'],
        '你可以通过 contact@gasgx.com 联系 GasGx。GasGx 也支持技术支持、售后服务和服务网络协调。如果你先告诉我项目场景、功率范围和气源类型，我也可以先帮你把需求整理清楚，再转人工跟进。',
        true,
        'support',
        array['application', 'power', 'gas_type', 'issue_or_goal'],
        '[{"title":"Support Scope","url":"kb://gasgx/support-scope","source_type":"internal_sales_kb"}]'::jsonb,
        'published'
    ),
    (
        'contact_support',
        'ru',
        array['контакты', 'связаться', 'email', 'сервис', 'послепродажное обслуживание', 'техподдержка'],
        'Связаться с GasGx можно по адресу contact@gasgx.com. GasGx также поддерживает техническую поддержку, послепродажный сервис и координацию сервисной сети. Если вы сначала сообщите сценарий проекта, диапазон мощности и тип газа, я помогу структурировать запрос перед ручным сопровождением.',
        true,
        'support',
        array['application', 'power', 'gas_type', 'issue_or_goal'],
        '[{"title":"Support Scope","url":"kb://gasgx/support-scope","source_type":"internal_sales_kb"}]'::jsonb,
        'published'
    ),
    (
        'mining_associated_gas_1mw',
        'en',
        array['1 mw mining', 'associated gas', 'flare gas', 'mining power', '1000 kw mining'],
        'For a 1 MW mining site powered by associated or flare gas, GasGx would usually start with a 1 MW+ gas-power solution, typically containerized or AIS-integrated for field deployment. The next critical checks are gas quality, target miner load, voltage and frequency, off-grid vs grid-parallel mode, country and ambient conditions, plus the expected O&M model. If you share those items, I can structure a shortlist and quotation brief.',
        true,
        'lead',
        array['application', 'power', 'gas_quality', 'country', 'voltage_frequency', 'deployment'],
        '[{"title":"Project Qualification Playbook","url":"kb://gasgx/project-qualification","source_type":"internal_sales_kb"}]'::jsonb,
        'published'
    ),
    (
        'mining_associated_gas_1mw',
        'zh',
        array['1mw矿场', '1000kw矿场', '伴生气', '火炬气', '矿场供电'],
        '如果是 1MW 级矿场使用伴生气或火炬气供电，GasGx 通常会优先从 1MW+ 级燃气发电方案切入，部署形式常见为集装箱化或 AIS 一体化。下一步最关键的是确认气质、矿机负载、电压频率、并网还是离网、所在国家与环境条件，以及后续运维模式。如果你把这些条件发给我，我可以继续帮你整理成预选型和报价简表。',
        true,
        'lead',
        array['application', 'power', 'gas_quality', 'country', 'voltage_frequency', 'deployment'],
        '[{"title":"Project Qualification Playbook","url":"kb://gasgx/project-qualification","source_type":"internal_sales_kb"}]'::jsonb,
        'published'
    ),
    (
        'mining_associated_gas_1mw',
        'ru',
        array['1 mw майнинг', '1000 kw майнинг', 'попутный газ', 'факельный газ', 'энергия для майнинга'],
        'Для майнинговой площадки на 1 MW с попутным или факельным газом GasGx обычно начинает с решения уровня 1 MW+ на газовой генерации, чаще всего в контейнерном или AIS-интегрированном формате. Далее важно уточнить качество газа, нагрузку майнеров, напряжение и частоту, автономный или параллельный режим, страну и условия площадки, а также модель эксплуатации. Если вы передадите эти данные, я подготовлю структурированный пресейл-лист и основу для коммерческого предложения.',
        true,
        'lead',
        array['application', 'power', 'gas_quality', 'country', 'voltage_frequency', 'deployment'],
        '[{"title":"Project Qualification Playbook","url":"kb://gasgx/project-qualification","source_type":"internal_sales_kb"}]'::jsonb,
        'published'
    )
on conflict (intent_key, language) do update
set trigger_patterns = excluded.trigger_patterns,
    answer_template = excluded.answer_template,
    handoff_required = excluded.handoff_required,
    handoff_reason = excluded.handoff_reason,
    next_fields = excluded.next_fields,
    source_refs = excluded.source_refs,
    status = excluded.status,
    updated_at = timezone('utc', now());

insert into public.knowledge_documents (source_type, visibility, language, title, canonical_url, excerpt, content_markdown, source_meta, status, last_crawled_at)
values
    (
        'internal_sales_kb',
        'public',
        'en',
        'GasGx Offering Map',
        'kb://gasgx/offering-overview',
        'GasGx offering overview covering product lines, solutions, digital systems and support resources.',
        '# GasGx Offering Map

GasGx organizes generator products by power range, gas source, cooling and deployment form.

- Power ranges: under 500 kW, 500-1000 kW, and 1 MW+.
- Gas fit: natural gas, associated or flare gas, and low-methane gas.
- Cooling: air-cooled and liquid-cooled.
- Deployment: containerized, AIS-integrated, and skid-mounted.
- Brand grouping: made-in-China and overseas brands.

GasGx solution families include oilfield or associated-gas power, mining or data-center power, industrial distributed energy and CHP.

GasGx digital systems include O&M Platform, ECM, IMS and Sales System.

Support resources include technical support, after-sales service, service network, FAQ, whitepapers, reports, case studies, datasheets, certifications and videos.',
        '{"seed":"v1","kind":"manual"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'internal_sales_kb',
        'internal_sales',
        'en',
        'Quotation Checklist',
        'kb://gasgx/quote-checklist',
        'Required inputs for a qualified quotation and safe commercial boundaries.',
        '# Quotation Checklist

GasGx should not promise exact pricing, inventory, warranty scope, certifications, delivery lead time or contractual commitments without project confirmation.

Minimum inputs before quotation:

- Application scenario
- Target power or electrical load
- Gas type and gas quality
- Country or region
- Voltage and frequency
- Grid-parallel, off-grid or backup requirement
- Preferred deployment format: container, AIS or skid
- Whether miners, controls, cooling, switchgear or remote O&M are in scope

Commercial follow-up should be routed to contact@gasgx.com with a structured summary.',
        '{"seed":"v1","kind":"manual"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'internal_sales_kb',
        'internal_sales',
        'en',
        'Support Scope',
        'kb://gasgx/support-scope',
        'Support and after-sales positioning for chatbot handoff.',
        '# Support Scope

GasGx support positioning includes technical support, after-sales service and service-network coordination.

When a visitor asks about support, collect:

- Project scenario or installed base
- Power range or model family
- Gas source and site location
- Current issue, target outcome or urgency

If the answer depends on contract scope or project-specific service coverage, direct the visitor to contact@gasgx.com for manual confirmation.',
        '{"seed":"v1","kind":"manual"}'::jsonb,
        'published',
        timezone('utc', now())
    ),
    (
        'internal_sales_kb',
        'internal_sales',
        'en',
        'Project Qualification Playbook',
        'kb://gasgx/project-qualification',
        'Pre-sales qualification checklist for mining, oilfield, CHP and industrial projects.',
        '# Project Qualification Playbook

Qualification should focus on application, target load, gas source, country, ambient conditions, altitude, grid mode, deployment preference and O&M model.

For 1 MW+ associated-gas mining projects, prioritize:

- 1 MW+ gas-power solution
- associated or flare gas adaptation
- containerized or AIS deployment
- clarity on miner load, gas quality, voltage and frequency

The chatbot should always ask only the minimum number of follow-up questions needed to move toward a recommendation or quotation brief.',
        '{"seed":"v1","kind":"manual"}'::jsonb,
        'published',
        timezone('utc', now())
    )
on conflict (canonical_url) do update
set title = excluded.title,
    excerpt = excluded.excerpt,
    content_markdown = excluded.content_markdown,
    source_meta = excluded.source_meta,
    status = excluded.status,
    last_crawled_at = excluded.last_crawled_at,
    updated_at = timezone('utc', now());

delete from public.knowledge_chunks
where document_id in (
    select id
    from public.knowledge_documents
    where canonical_url in (
        'kb://gasgx/offering-overview',
        'kb://gasgx/quote-checklist',
        'kb://gasgx/support-scope',
        'kb://gasgx/project-qualification'
    )
);

insert into public.knowledge_chunks (document_id, chunk_text, chunk_summary, language, keywords, section_path, sort_order, token_count, source_meta, search_text)
select kd.id,
       chunk_text,
       chunk_summary,
       kd.language,
       keywords,
       section_path,
       sort_order,
       token_count,
       '{"seed":"v1","kind":"manual"}'::jsonb,
       chunk_text || ' ' || chunk_summary || ' ' || array_to_string(keywords, ' ')
from (
    values
        (
            'kb://gasgx/offering-overview',
            0,
            'GasGx offers generator product lines by power range, gas source, cooling and deployment form, covering under 500 kW, 500-1000 kW and 1 MW+ with natural gas, associated gas and low-methane gas options.',
            'GasGx product structure and ranges.',
            array['gasgx', 'products', 'solutions', '500kw', '1mw', 'natural gas', 'associated gas', 'deployment', 'container', 'ais', 'skid']::text[],
            'offering_map',
            54
        ),
        (
            'kb://gasgx/offering-overview',
            1,
            'GasGx also covers solution families for oilfield power, mining and data-center power, industrial distributed energy and CHP, plus digital systems such as O&M Platform, ECM, IMS and Sales System, and support resources including case studies, datasheets, certifications and FAQ.',
            'GasGx solutions, digital systems and support resources.',
            array['oilfield', 'mining', 'data center', 'industrial', 'chp', 'o&m', 'ecm', 'ims', 'support', 'case studies', 'datasheets', 'certifications', 'faq']::text[],
            'offering_map',
            51
        ),
        (
            'kb://gasgx/quote-checklist',
            0,
            'Do not promise exact price, inventory, warranty, certifications, lead time or contract commitments without project confirmation. Collect application, power, gas type and quality, country, voltage and frequency, grid mode, deployment format, and scope items such as miners, controls, cooling, switchgear or remote O&M before quotation.',
            'Quotation checklist and commercial safety boundaries.',
            array['quote', 'quotation', 'price', 'cost', 'warranty', 'lead time', 'inventory', 'application', 'power', 'gas type', 'voltage', 'frequency', 'deployment']::text[],
            'quotation',
            49
        ),
        (
            'kb://gasgx/support-scope',
            0,
            'GasGx support positioning includes technical support, after-sales service and service-network coordination. For support requests, collect the project scenario or installed base, power range, gas source, site location, and the current issue or target outcome before manual follow-up.',
            'Support scope and support intake checklist.',
            array['support', 'after-sales', 'service network', 'technical support', 'installed base', 'issue', 'service']::text[],
            'support',
            40
        ),
        (
            'kb://gasgx/project-qualification',
            0,
            'Project qualification should focus on application, target load, gas source, country, ambient conditions, altitude, grid mode, deployment preference and O&M model. For 1 MW+ associated-gas mining projects, prioritize gas quality, miner load, voltage and frequency, and a containerized or AIS deployment path.',
            'Qualification checklist for solution recommendation.',
            array['qualification', 'application', 'load', 'gas source', 'country', 'ambient', 'altitude', 'grid', 'deployment', 'mining', '1mw', 'associated gas', 'flare gas']::text[],
            'qualification',
            43
        )
) as seed(canonical_url, sort_order, chunk_text, chunk_summary, keywords, section_path, token_count)
join public.knowledge_documents kd on kd.canonical_url = seed.canonical_url;
