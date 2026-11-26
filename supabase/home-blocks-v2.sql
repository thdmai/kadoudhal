-- Kadoudhal — assouplit home_blocks + bucket images (SQL Editor → Run)
-- Sans tout recréer. À lancer une fois sur une base déjà seedée.

-- Slugs libres (plus seulement coran / hadith / fiqh)
alter table public.home_blocks
  drop constraint if exists home_blocks_slug_check;

alter table public.home_blocks
  add constraint home_blocks_slug_check
  check (
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and char_length(slug) between 2 and 40
  );

-- Images d’accueil (bucket public)
insert into storage.buckets (id, name, public)
values ('home-images', 'home-images', true)
on conflict (id) do nothing;

drop policy if exists "home_images_public_read" on storage.objects;
create policy "home_images_public_read"
  on storage.objects for select
  using (bucket_id = 'home-images');

drop policy if exists "home_images_admin_all" on storage.objects;
create policy "home_images_admin_all"
  on storage.objects for all
  using (bucket_id = 'home-images' and public.is_admin())
  with check (bucket_id = 'home-images' and public.is_admin());
