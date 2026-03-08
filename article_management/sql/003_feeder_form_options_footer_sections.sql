alter table public.feeder_form_options
drop constraint if exists feeder_form_options_section_check;

alter table public.feeder_form_options
add constraint feeder_form_options_section_check
check (
    section in (
        'category',
        'publisher',
        'tag',
        'secondary_tag',
        'footer_social',
        'footer_social_meta',
        'footer_contact'
    )
);

create unique index if not exists feeder_form_options_section_option_id_idx
on public.feeder_form_options (section, option_id);
