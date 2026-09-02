-- Complete the Russian names that were still copied from the English fields.
with translations(line_code, ru_name) as (
    values
        ('A-1', 'Двигатель'), ('A-2', 'Генератор LSA50.2L8'), ('A-3', 'Система управления'),
        ('A-4', 'Турбокомпрессор'), ('A-5', 'Монтажная рама'), ('A-6', 'Электрическая система управления'),
        ('A-7', 'Распределительное устройство'), ('A-8', 'Система газовой арматуры'),
        ('A-11', 'Взрывозащищённый выпускной клапан'),
        ('A-16', 'Опорная плита'), ('A-17', 'Насос'), ('A-18', 'Амортизатор'),
        ('A-21', 'Датчик кислорода'), ('A-22', 'Датчик частоты вращения'), ('A-23', 'Датчик давления масла'),
        ('A-24', 'Датчик противодавления выхлопных газов'), ('A-25', 'Датчик температуры воды'),
        ('A-26', 'Стартерная аккумуляторная батарея'),
        ('A-27', 'Датчик температуры и давления впускного коллектора'),
        ('B-2', 'Система утилизации тепла выхлопных газов'), ('B-4', 'Система автоматической заправки масла'),
        ('B-5', 'Соединительный блок 40HQ'), ('B-6', 'Газовый клапан — фильтр'), ('B-7', 'Синхронный модуль'),
        ('B-10', 'Редукционный блок'), ('A-28', 'Датчик температуры и давления после воздушного фильтра'),
        ('A-29', 'Датчик температуры и давления перед турбокомпрессором'),
        ('A-30', 'Датчик температуры и давления после турбокомпрессора'),
        ('A-31', 'Датчик температуры и давления после охладителя наддувочного воздуха'),
        ('A-32', 'Стоимость монтажа, сборки и испытаний установки'), ('B-11', 'Сертифицировано UL'),
        ('C-1', 'Клиновой шкив (V-образный шкив)'), ('C-2', 'Шкив (V-образный)'),
        ('C-3', 'Масляный фильтр'), ('C-4', 'Фильтрующий элемент воздушного фильтра'),
        ('C-5', 'Прокладка головки цилиндров'), ('C-6', 'Свеча зажигания'), ('C-7', 'Высоковольтный провод'),
        ('C-8', 'Катушка зажигания'), ('C-9', 'Впускной клапан'), ('C-10', 'Выпускной клапан'),
        ('C-11', 'Седло впускного клапана'), ('C-12', 'Седло выпускного клапана'),
        ('C-13', 'Маслосъёмный колпачок клапана'), ('C-14', 'Прокладка впускного коллектора'),
        ('C-15', 'Прокладка выпускного коллектора'), ('C-16', 'Прокладка головки цилиндров'),
        ('C-17', 'Поршень'), ('C-18', 'Поршневой палец'), ('C-19', 'Блок цилиндров'),
        ('C-20', 'Комплект уплотнительных колец блока цилиндров'), ('C-21', 'Комплект поршневых колец'),
        ('C-22', 'Верхняя пластина опорного подшипника'), ('C-23', 'Нижняя пластина опорного подшипника')
)
update public.quote_product_items item
set name_i18n = jsonb_set(item.name_i18n, '{ru}', to_jsonb(translations.ru_name::text))
from translations
where item.product_id = (select id from public.quote_products where slug = 'G300')
  and item.line_code = translations.line_code;

update public.quote_instance_items item
set name_i18n = (
    select product_item.name_i18n
    from public.quote_product_items product_item
    where product_item.product_id = (select id from public.quote_products where slug = 'G300')
      and product_item.line_code = item.line_code
    order by product_item.sort_order
    limit 1
)
where item.instance_id in (
    select id from public.quote_instances
    where product_id = (select id from public.quote_products where slug = 'G300')
      and share_config->>'preview_source' = 'product_template'
      and status = 'draft'
)
and exists (
    select 1 from public.quote_product_items product_item
    where product_item.product_id = (select id from public.quote_products where slug = 'G300')
      and product_item.line_code = item.line_code
);
