-- Kadoudhal — réglages admin. SQL Editor → Run une fois (idempotent).

create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

grant select on table public.site_settings to anon, authenticated;
grant select, insert, update, delete on table public.site_settings to authenticated;

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings for select
  using (true);

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.site_settings (key, value)
values
  ('max_audio_mb', '40'),
  ('max_cover_mb', '4'),
  ('max_home_image_mb', '2'),
  ('coran_kinds', 'djouzou,soumin'),
  ('publish_by_default', '1')
on conflict (key) do nothing;
