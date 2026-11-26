-- Kadoudhal — premier compte = admin (sans recréer les tables)
-- À lancer une fois dans le SQL Editor après un reset de schema
-- ou si tu n’as plus d’admin.

-- 1) Inscription : 1er user → admin
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

-- 2) Connexion : recrée le profil manquant + admin si aucun
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

-- 3) Rattrapage immédiat : profils manquants depuis auth.users
insert into public.profiles (id, email, display_name, role)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'display_name', split_part(u.email, '@', 1)),
  'user'
from auth.users u
on conflict (id) do nothing;

-- 4) S’il n’y a aucun admin actif → le compte le plus ancien devient admin
update public.profiles
set role = 'admin', deleted_at = null, updated_at = now()
where id = (
  select p.id
  from public.profiles p
  order by p.created_at asc nulls last, p.id asc
  limit 1
)
and not exists (
  select 1
  from public.profiles a
  where a.role = 'admin'
    and a.deleted_at is null
);
