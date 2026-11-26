-- Kadoudhal — schéma initial (SQL Editor → Run)
-- Prérequis : Auth Email activé (Authentication → Providers).
--
-- ATTENTION : ce script SUPPRIME puis recrée les tables Kadoudhal
-- (profiles, home_blocks, sections, tracks). À utiliser en début de projet.
-- Ne lance pas ça en prod s’il y a déjà des données importantes.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Nettoyage (corrige aussi un ancien profiles.id en bigint)
-- ---------------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.protect_profile_sensitive_fields() cascade;
drop function if exists public.is_admin() cascade;
drop function if exists public.is_active_user() cascade;
drop function if exists public.reject_deleted_login() cascade;

drop policy if exists "audio_admin_all" on storage.objects;
drop policy if exists "audio_active_read" on storage.objects;
drop policy if exists "home_images_public_read" on storage.objects;
drop policy if exists "home_images_admin_all" on storage.objects;

drop table if exists public.tracks cascade;
drop table if exists public.sections cascade;
drop table if exists public.home_blocks cascade;
drop table if exists public.site_settings cascade;
drop table if exists public.profiles cascade;

-- ---------------------------------------------------------------------------
-- Profils (id = auth.users.id → uuid, pas bigint)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  avatar_url text,
  last_seen_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_deleted_at_idx on public.profiles (deleted_at);
create index profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- Blocs d’accueil
-- ---------------------------------------------------------------------------
create table public.home_blocks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and char_length(slug) between 2 and 40
  ),
  title text not null,
  title_ar text not null default '',
  excerpt text not null default '',
  image_url text not null default '',
  sort_order int not null default 0,
  deleted_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Sections + tracks
-- ---------------------------------------------------------------------------
create table public.sections (
  id uuid primary key default gen_random_uuid(),
  collection text not null check (collection in ('coran', 'hadith', 'fiqh')),
  number int not null,
  title text not null,
  title_ar text not null default '',
  cover_url text,
  sort_order int not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collection, number)
);

create index sections_collection_idx
  on public.sections (collection)
  where deleted_at is null;

create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections (id) on delete cascade,
  title text not null,
  body_text text not null default '',
  cover_url text,
  audio_path text not null,
  published boolean not null default false,
  sort_order int not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tracks_section_idx
  on public.tracks (section_id)
  where deleted_at is null and published = true;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.deleted_at is null
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.deleted_at is null
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  has_admin boolean;
  new_role text := 'user';
begin
  -- Premier compte (aucun admin actif) → admin automatiquement.
  select exists (
    select 1
    from public.profiles p
    where p.role = 'admin'
      and p.deleted_at is null
  ) into has_admin;

  if not has_admin then
    new_role := 'admin';
  end if;

  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Recrée le profil manquant à la connexion (ex. après reset du schéma)
-- et promeut admin s’il n’y a encore aucun admin actif.
create or replace function public.ensure_own_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  u record;
  has_admin boolean;
  row public.profiles;
begin
  if uid is null then
    raise exception 'Non authentifié';
  end if;

  select * into row from public.profiles where id = uid;
  if found then
    -- Compte existant : s’il n’y a aucun admin, ce compte le devient.
    if row.role is distinct from 'admin' or row.deleted_at is not null then
      if not exists (
        select 1
        from public.profiles p
        where p.role = 'admin'
          and p.deleted_at is null
      ) then
        update public.profiles
        set role = 'admin', deleted_at = null, updated_at = now()
        where id = uid
        returning * into row;
      end if;
    end if;
    return row;
  end if;

  select id, email, raw_user_meta_data into u from auth.users where id = uid;
  if not found then
    raise exception 'Utilisateur introuvable';
  end if;

  select exists (
    select 1
    from public.profiles p
    where p.role = 'admin'
      and p.deleted_at is null
  ) into has_admin;

  insert into public.profiles (id, email, display_name, role)
  values (
    u.id,
    u.email,
    coalesce(u.raw_user_meta_data ->> 'display_name', split_part(u.email, '@', 1)),
    case when has_admin then 'user' else 'admin' end
  )
  on conflict (id) do update
    set email = excluded.email
  returning * into row;

  return row;
end;
$$;

grant execute on function public.ensure_own_profile() to authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.protect_profile_sensitive_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    -- auth.uid() null = SQL Editor / migration (bootstrap du 1er admin)
    if auth.uid() is not null and not public.is_admin() then
      raise exception 'Seul un admin peut modifier le rôle';
    end if;

    if old.role = 'admin' and new.role <> 'admin' then
      if (
        select count(*)::int
        from public.profiles p
        where p.role = 'admin'
          and p.deleted_at is null
          and p.id <> old.id
      ) < 1 then
        raise exception 'Il doit rester au moins un admin actif';
      end if;
    end if;
  end if;

  if new.deleted_at is distinct from old.deleted_at then
    if auth.uid() is not null and not public.is_admin() then
      raise exception 'Seul un admin peut activer ou désactiver un compte';
    end if;

    if old.role = 'admin' and new.deleted_at is not null then
      if (
        select count(*)::int
        from public.profiles p
        where p.role = 'admin'
          and p.deleted_at is null
          and p.id <> old.id
      ) < 1 then
        raise exception 'Il doit rester au moins un admin actif';
      end if;
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists protect_profile_sensitive_fields on public.profiles;
create trigger protect_profile_sensitive_fields
  before update on public.profiles
  for each row
  execute function public.protect_profile_sensitive_fields();

-- ---------------------------------------------------------------------------
-- Droits API (sans ça : permission denied for table ...)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select on table public.profiles to anon;

grant select on table public.home_blocks to anon, authenticated;
grant select, insert, update, delete on table public.home_blocks to authenticated;

grant select on table public.sections to authenticated;
grant select, insert, update, delete on table public.sections to authenticated;

grant select on table public.tracks to authenticated;
grant select, insert, update, delete on table public.tracks to authenticated;

-- ---------------------------------------------------------------------------
-- Réglages (plafonds upload, etc.)
-- ---------------------------------------------------------------------------
create table public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

grant select on table public.site_settings to anon, authenticated;
grant select, insert, update, delete on table public.site_settings to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.home_blocks enable row level security;
alter table public.sections enable row level security;
alter table public.tracks enable row level security;
alter table public.site_settings enable row level security;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

create policy "home_blocks_public_read"
  on public.home_blocks for select
  using (deleted_at is null or public.is_admin());

create policy "home_blocks_admin_write"
  on public.home_blocks for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "sections_active_read"
  on public.sections for select
  using (
    (deleted_at is null and public.is_active_user())
    or public.is_admin()
  );

create policy "sections_admin_write"
  on public.sections for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "tracks_active_read"
  on public.tracks for select
  using (
    (deleted_at is null and published = true and public.is_active_user())
    or public.is_admin()
  );

create policy "tracks_admin_write"
  on public.tracks for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "site_settings_public_read"
  on public.site_settings for select
  using (true);

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
  ('publish_by_default', '1');

-- ---------------------------------------------------------------------------
-- Seed blocs d’accueil
-- ---------------------------------------------------------------------------
insert into public.home_blocks (slug, title, title_ar, excerpt, image_url, sort_order)
values
  (
    'coran',
    'Coran',
    'القرآن',
    'Traduction et récitation, sourate par sourate. Écoute, lecture et téléchargement.',
    '/images/coran.jpg',
    1
  ),
  (
    'hadith',
    'Hadith',
    'الحديث',
    'Recueils classés par bâb. Chaque piste se lit, s’écoute et se télécharge.',
    '/images/hadith.jpg',
    2
  ),
  (
    'fiqh',
    'Fiqh',
    'الفقه',
    'Kitabs de jurisprudence, chapitre par chapitre, avec le texte et l’audio.',
    '/images/fiqh.jpg',
    3
  );

-- ---------------------------------------------------------------------------
-- Storage audio
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('audio', 'audio', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('home-images', 'home-images', true)
on conflict (id) do nothing;

drop policy if exists "audio_admin_all" on storage.objects;
create policy "audio_admin_all"
  on storage.objects for all
  using (bucket_id = 'audio' and public.is_admin())
  with check (bucket_id = 'audio' and public.is_admin());

drop policy if exists "audio_active_read" on storage.objects;
create policy "audio_active_read"
  on storage.objects for select
  using (bucket_id = 'audio' and public.is_active_user());

drop policy if exists "home_images_public_read" on storage.objects;
create policy "home_images_public_read"
  on storage.objects for select
  using (bucket_id = 'home-images');

drop policy if exists "home_images_admin_all" on storage.objects;
create policy "home_images_admin_all"
  on storage.objects for all
  using (bucket_id = 'home-images' and public.is_admin())
  with check (bucket_id = 'home-images' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Premier admin : automatique (handle_new_user / ensure_own_profile).
-- Ensuite : /admin → Utilisateurs pour nommer d’autres admins.
-- Soft delete :
--   update public.profiles set deleted_at = now() where id = '<uuid>';
-- Restaurer :
--   update public.profiles set deleted_at = null where id = '<uuid>';
-- ---------------------------------------------------------------------------


