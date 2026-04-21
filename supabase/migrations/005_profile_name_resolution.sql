-- Ensure profile names use real display names and not placeholder labels like "Student 40".

create or replace function public.derive_display_name(meta jsonb, email text)
returns text
language plpgsql
as $$
declare
  candidate text;
  local_part text;
begin
  candidate := nullif(trim(coalesce(meta->>'full_name', '')), '');
  if candidate is null then
    candidate := nullif(trim(coalesce(meta->>'name', '')), '');
  end if;
  if candidate is null then
    candidate := nullif(trim(coalesce(meta->>'display_name', '')), '');
  end if;

  if candidate ~* '^(student|user|counselor)([\s_-]*\d+)?$' then
    candidate := null;
  end if;

  if candidate is null then
    local_part := split_part(coalesce(email, ''), '@', 1);
    local_part := regexp_replace(local_part, '[._-]+', ' ', 'g');
    local_part := regexp_replace(local_part, '\d+', ' ', 'g');
    local_part := trim(regexp_replace(local_part, '\s+', ' ', 'g'));

    if local_part <> '' then
      candidate := initcap(local_part);
    end if;

    if candidate ~* '^(student|user|counselor)$' then
      candidate := null;
    end if;
  end if;

  return candidate;
end;
$$;

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    public.derive_display_name(new.raw_user_meta_data, new.email),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

update public.profiles p
set name = resolved.derived_name
from (
  select
    u.id,
    public.derive_display_name(u.raw_user_meta_data, u.email) as derived_name
  from auth.users u
) as resolved
where
  p.id = resolved.id
  and resolved.derived_name is not null
  and (
    p.name is null
    or p.name ~* '^(student|user|counselor)([\s_-]*\d+)?$'
  );
