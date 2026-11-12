create table public.koverr_cleanup_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  expires_at timestamptz not null
);

create table public.koverr_inventory (
  user_id uuid not null references auth.users(id) on delete cascade,
  domain text not null check (
    length(domain) <= 253 and domain ~ '^[a-z0-9-]+(\.[a-z0-9-]+)+$'
  ),
  choice text not null default 'review' check (choice in ('review','keep','close','unsure')),
  updated_at timestamptz not null default now(),
  primary key (user_id, domain)
);
create index koverr_inventory_domain on public.koverr_inventory (domain);

alter table public.koverr_cleanup_access enable row level security;
alter table public.koverr_inventory enable row level security;
revoke all on public.koverr_cleanup_access, public.koverr_inventory from public, anon, authenticated;
grant select on public.koverr_cleanup_access to service_role;
grant select, insert, update on public.koverr_inventory to service_role;

-- Serialize imports and inventory decisions for one account, including entitlement changes.
create function public.koverr_lock_cleanup_access(user_id_arg uuid)
returns boolean language plpgsql set search_path = '' as $$
begin
  perform 1 from public.koverr_cleanup_access
    where user_id = user_id_arg and expires_at > clock_timestamp() for update;
  return found;
end;
$$;

-- PostgreSQL requires UPDATE privilege to lock a row with FOR UPDATE.
grant update on public.koverr_cleanup_access to service_role;

create function public.koverr_import_inventory(user_id_arg uuid, domains_arg text[])
returns text language plpgsql set search_path = '' as $$
begin
  if not public.koverr_lock_cleanup_access(user_id_arg) then return 'locked'; end if;
  if domains_arg is null or cardinality(domains_arg) not between 1 and 2000
    or exists (select 1 from unnest(domains_arg) as item(domain)
      where domain is null or length(domain) > 253 or domain !~ '^[a-z0-9-]+(\.[a-z0-9-]+)+$')
  then return 'invalid'; end if;
  if (select count(*) from (
    select domain from public.koverr_inventory where user_id = user_id_arg
    union select unnest(domains_arg)
  ) as all_domains) > 2000 then return 'limit'; end if;
  insert into public.koverr_inventory (user_id, domain)
    select user_id_arg, unnest(domains_arg) on conflict do nothing;
  return 'saved';
end;
$$;

create function public.koverr_set_inventory_choice(user_id_arg uuid, domain_arg text, choice_arg text)
returns boolean language plpgsql set search_path = '' as $$
begin
  if not public.koverr_lock_cleanup_access(user_id_arg) then return false; end if;
  if choice_arg is null or choice_arg not in ('review','keep','close','unsure') then return false; end if;
  update public.koverr_inventory set choice = choice_arg, updated_at = now()
    where user_id = user_id_arg and domain = domain_arg;
  return found;
end;
$$;

create function public.koverr_read_inventory(user_id_arg uuid)
returns jsonb language sql stable set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('domain', domain, 'choice', choice, 'updated_at', updated_at) order by domain), '[]'::jsonb)
  from public.koverr_inventory where user_id = user_id_arg;
$$;

create function public.koverr_directory_research(known_domains_arg text[])
returns table (domain text, accounts bigint) language sql stable set search_path = '' as $$
  select i.domain, count(*)
  from public.koverr_inventory i
  join public.koverr_cleanup_access a using (user_id)
  where a.expires_at > now() and not (i.domain = any(known_domains_arg))
  group by i.domain order by count(*) desc, i.domain limit 100;
$$;

revoke execute on function public.koverr_lock_cleanup_access(uuid),
  public.koverr_import_inventory(uuid,text[]), public.koverr_set_inventory_choice(uuid,text,text),
  public.koverr_read_inventory(uuid), public.koverr_directory_research(text[]) from public, anon, authenticated;
grant execute on function public.koverr_lock_cleanup_access(uuid),
  public.koverr_import_inventory(uuid,text[]), public.koverr_set_inventory_choice(uuid,text,text),
  public.koverr_read_inventory(uuid), public.koverr_directory_research(text[]) to service_role;
