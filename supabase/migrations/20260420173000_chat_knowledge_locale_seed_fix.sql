update public.chat_faq_rules
set
    trigger_patterns = array['你们有什么产品', '都有什么产品', '有哪些产品', '有哪些方案', '有哪些服务'],
    answer_template = 'GasGx 目前主要覆盖四类能力：一是燃气发电机组产品线，按功率段、气源、冷却方式和部署形式组织；二是油田伴生气、矿场供电、工业分布式能源和 CHP 等解决方案；三是 O&M Platform、ECM、IMS、Sales System 等数字化系统；四是技术支持、售后服务、服务网络、案例、白皮书、参数表、认证和 FAQ 等配套资源。如果你告诉我应用场景、目标功率和气源类型，我可以继续缩小到更合适的产品方向。'
where intent_key = 'product_overview'
  and language = 'zh';

update public.chat_faq_rules
set
    trigger_patterns = array['报价', '价格', '多少钱', '成本', '预算'],
    answer_template = 'GasGx 可以配合正式报价，但准确价格通常取决于应用场景、目标负载、气源类型与气质、部署形式、国家地区、电压频率，以及是否包含控制、冷却、开关柜、矿机和远程运维等范围。如果你把这些信息发给我，我可以先帮你整理成一份售前需求简表，再转给 contact@gasgx.com 跟进。'
where intent_key = 'quote_requirements'
  and language = 'zh';

update public.chat_faq_rules
set
    trigger_patterns = array['联系方式', '联系', '邮箱', '售后', '技术支持'],
    answer_template = '你可以通过 contact@gasgx.com 联系 GasGx。GasGx 也支持技术支持、售后服务和服务网络协调。如果你先告诉我项目场景、功率范围和气源类型，我可以先帮你整理需求，再交给人工继续跟进。'
where intent_key = 'contact_support'
  and language = 'zh';

update public.chat_faq_rules
set
    trigger_patterns = array['1mw矿场', '1000kw矿场', '伴生气', '火炬气', '矿场供电'],
    answer_template = '如果是 1MW 级矿场使用伴生气或火炬气供电，GasGx 通常会优先从 1MW+ 级燃气发电方案切入，常见部署形式是集装箱化或 AIS 一体化。下一步最关键的是确认气质、矿机负载、电压频率、并网还是离网、所在国家与环境条件，以及后续运维模式。'
where intent_key = 'mining_associated_gas_1mw'
  and language = 'zh';

update public.chat_faq_rules
set
    trigger_patterns = array['какие продукты', 'что вы предлагаете', 'какие решения', 'какие услуги'],
    answer_template = 'GasGx в основном охватывает четыре группы возможностей: газогенераторные установки по диапазону мощности, типу газа, охлаждению и формату размещения; решения для нефтепромыслов, майнинга, промышленной распределенной энергетики и CHP; цифровые системы O&M Platform, ECM, IMS и Sales System; а также сервисные ресурсы, включая кейсы, даташиты, сертификаты и FAQ. Если вы опишете сценарий, требуемую мощность и тип газа, я сузю рекомендацию.'
where intent_key = 'product_overview'
  and language = 'ru';

update public.chat_faq_rules
set
    trigger_patterns = array['цена', 'стоимость', 'сколько стоит', 'коммерческое предложение'],
    answer_template = 'GasGx может подготовить коммерческое предложение, но точная цена зависит от сценария проекта, требуемой нагрузки, типа и качества газа, формата установки, страны, напряжения и частоты, а также состава поставки. Если вы пришлете эти данные, я помогу оформить краткий пресейл-бриф для follow-up через contact@gasgx.com.'
where intent_key = 'quote_requirements'
  and language = 'ru';

update public.chat_faq_rules
set
    trigger_patterns = array['контакты', 'связаться', 'сервис', 'техподдержка'],
    answer_template = 'Связаться с GasGx можно по адресу contact@gasgx.com. GasGx также поддерживает техническую поддержку, послепродажный сервис и координацию сервисной сети. Если вы сначала опишете сценарий, диапазон мощности и тип газа, я помогу структурировать запрос перед ручным сопровождением.'
where intent_key = 'contact_support'
  and language = 'ru';

update public.chat_faq_rules
set
    trigger_patterns = array['майнинг', '1 mw', 'попутный газ', 'факельный газ'],
    answer_template = 'Для майнинговой площадки уровня 1 MW на попутном или факельном газе GasGx обычно начинает с решения уровня 1 MW+ на газовой генерации, чаще всего в контейнерном или AIS-интегрированном формате. Далее нужно уточнить качество газа, нагрузку майнеров, напряжение и частоту, режим сети, страну, условия площадки и модель эксплуатации.'
where intent_key = 'mining_associated_gas_1mw'
  and language = 'ru';
