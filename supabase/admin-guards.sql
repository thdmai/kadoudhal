-- Garde : seul un admin peut changer role / deleted_at.
-- À lancer une fois dans le SQL Editor (sans recréer les tables).

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
