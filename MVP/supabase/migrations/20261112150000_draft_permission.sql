create table public.koverr_draft_permission (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null,
  version integer not null check (version > 0),
  changed_at timestamptz not null default now()
);

create table public.koverr_draft_permission_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event text not null check (event in ('granted', 'revoked')),
  version integer not null,
  happened_at timestamptz not null
);
create index koverr_draft_permission_events_owner on public.koverr_draft_permission_events(user_id, id);

alter table public.koverr_draft_permission enable row level security;
alter table public.koverr_draft_permission_events enable row level security;
revoke all on public.koverr_draft_permission, public.koverr_draft_permission_events from public, anon, authenticated;
grant select, insert, update on public.koverr_draft_permission to service_role;
grant select, insert on public.koverr_draft_permission_events to service_role;
grant usage on sequence public.koverr_draft_permission_events_id_seq to service_role;

create function public.koverr_record_draft_permission()
returns trigger language plpgsql set search_path = '' as $$
begin
  insert into public.koverr_draft_permission_events(user_id, event, version, happened_at)
    values (new.user_id, case when new.active then 'granted' else 'revoked' end, new.version, new.changed_at);
  return new;
end;
$$;

create trigger koverr_record_draft_permission after insert or update on public.koverr_draft_permission
for each row execute function public.koverr_record_draft_permission();

create function public.koverr_set_draft_permission(user_id_arg uuid, active_arg boolean, version_arg integer)
returns boolean language plpgsql set search_path = '' as $$
begin
  if active_arg is true then
    if version_arg is distinct from 1 or not public.koverr_lock_cleanup_access(user_id_arg) then return false; end if;
    insert into public.koverr_draft_permission as permission(user_id, active, version)
      values (user_id_arg, true, version_arg)
      on conflict (user_id) do update set active = true, version = excluded.version, changed_at = clock_timestamp()
      where not permission.active or permission.version <> excluded.version;
  elsif active_arg is false then
    update public.koverr_draft_permission set active = false, changed_at = clock_timestamp()
      where user_id = user_id_arg and active;
  else
    return false;
  end if;
  return true;
end;
$$;

create function public.koverr_draft_permission_history(user_id_arg uuid)
returns jsonb language sql stable set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('event', event, 'version', version, 'happened_at', happened_at) order by id), '[]'::jsonb)
  from public.koverr_draft_permission_events where user_id = user_id_arg;
$$;

revoke execute on function public.koverr_record_draft_permission(), public.koverr_set_draft_permission(uuid,boolean,integer),
  public.koverr_draft_permission_history(uuid) from public, anon, authenticated;
grant execute on function public.koverr_set_draft_permission(uuid,boolean,integer),
  public.koverr_draft_permission_history(uuid) to service_role;
