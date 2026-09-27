-- Replace mixed Chinese/Russian values in the G300 Russian quote view.
update public.quote_products
set public_title = jsonb_set(public_title, '{ru}', to_jsonb('GasGx-G300 | Газогенераторная установка открытого типа 300 кВт'::text)),
    ui_text = jsonb_set(jsonb_set(jsonb_set(jsonb_set(ui_text, '{receiver_label,ru}', to_jsonb('Получатель:'::text)), '{receiver_placeholder,ru}', to_jsonb('Введите имя клиента'::text)), '{validity_label,ru}', to_jsonb('Срок действия предложения:'::text)), '{system_total_label,ru}', to_jsonb('Системная оценочная стоимость'::text)),
    section_config = jsonb_set(jsonb_set(jsonb_set(section_config, '{0,title,ru}', to_jsonb('GasGx — стандартная конфигурация открытого типа'::text)), '{1,title,ru}', to_jsonb('Сервисный пакет технического обслуживания 10 000 часов'::text)), '{2,title,ru}', to_jsonb('GasGx — дополнительная конфигурация'::text))
where slug = 'G300';

update public.quote_brands
set overview_title = jsonb_set(overview_title, '{ru}', to_jsonb('Обзор продукции серии GasGx Magie-AIO'::text)),
    footer_note = jsonb_set(footer_note, '{ru}', to_jsonb(E'Котировка сформирована на основе глобальных курсов валют в реальном времени. Окончательная цена определяется официальным коммерческим договором, заключённым сторонами. GasGx оставляет за собой право окончательного толкования.\n1. Условия оплаты: предоплата 30%, 100% до отгрузки;\n2. Таможенные пошлины и НДС не включены.'::text))
where id = (select brand_id from public.quote_products where slug = 'G300');

with translations(line_code, ru_name) as (
    values
        ('A-25', 'Датчик температуры воды'),
        ('A-27', 'Датчик температуры и давления впускного коллектора'),
        ('B-10', 'Редукционный блок'),
        ('A-28', 'Датчик температуры и давления после воздушного фильтра'),
        ('A-29', 'Датчик температуры и давления перед турбокомпрессором'),
        ('A-30', 'Датчик температуры и давления после турбокомпрессора'),
        ('A-31', 'Датчик температуры и давления после охладителя наддувочного воздуха'),
        ('C-1', 'Клиновой ремень (V-образный ремень)'),
        ('C-2', 'Клиновой ремень (V-образный ремень)'),
        ('C-12', 'Седло выпускного клапана')
)
update public.quote_product_items item
set name_i18n = jsonb_set(item.name_i18n, '{ru}', to_jsonb(translations.ru_name::text))
from translations
where item.product_id = (select id from public.quote_products where slug = 'G300')
  and item.line_code = translations.line_code;

update public.quote_instance_items item
set name_i18n = jsonb_set(
    item.name_i18n,
    '{ru}',
    to_jsonb((case item.line_code
        when 'B-1' then 'Комплект подогрева для холодного запуска (подогрев охлаждающей жидкости и масла, усиленная аккумуляторная батарея для сурового холода, подогреватель аккумулятора)'
        when 'B-12' then 'Сертификация CSA'
        else item.name_i18n->>'ru'
    end)::text))
where item.line_code in ('B-1', 'B-12')
  and item.instance_id in (
      select id from public.quote_instances
      where product_id = (select id from public.quote_products where slug = 'G300')
        and share_config->>'preview_source' = 'product_template'
        and status = 'draft'
  );
