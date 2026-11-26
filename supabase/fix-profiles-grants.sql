-- Kadoudhal — corrige "permission denied for table profiles"
-- À coller dans Supabase → SQL Editor → Run
-- (ne recrée pas les tables, ajoute seulement les droits)

grant usage on schema public to anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select on table public.profiles to anon;

grant select on table public.home_blocks to anon, authenticated;
grant select, insert, update, delete on table public.home_blocks to authenticated;

grant select on table public.sections to authenticated;
grant select, insert, update, delete on table public.sections to authenticated;

grant select on table public.tracks to authenticated;
grant select, insert, update, delete on table public.tracks to authenticated;
