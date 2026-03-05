# Article Management System

GasGx article admin console (static frontend + Supabase).

## Location

- `article_management/index.html`
- `article_management/modules/*`
- `article_management/styles/main.css`
- `article_management/sql/*.sql`

## What It Covers

1. Authenticated admin login (Supabase Auth).
2. Article CRUD with soft delete recycle bin.
3. Markdown editor with live preview.
4. Tag management on `feeder_form_options`.
5. Featured ranking publish (`featured_rank`, configurable N).
6. Review queue workflow from `scrape_queue` to `articles`.

## One-Time SQL Setup

Run in Supabase SQL editor in order:

1. `sql/001_ams_schema.sql`
2. `sql/002_ams_rls.sql`

## Admin Account

Create an auth user in Supabase:

- Email: `cuitengwei@gasgx.com`
- Password: `cuitengwei2023`
- Display name: `cuitengwei`

The frontend allowlist is in `modules/supabase.client.js` (`ADMIN_EMAILS`).

## Security Notes

1. Password is verified by Supabase Auth, not hardcoded in page logic.
2. RLS policies in `002_ams_rls.sql` enforce admin-only write access.
3. Public read on `articles` is restricted to `status='published'` and `deleted_at is null`.

## Local Preview

From repo root:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Open:

- `http://127.0.0.1:4173/article_management/index.html`

## Deployment

Upload `article_management` directory with the same FTP flow as the rest of the static site.

