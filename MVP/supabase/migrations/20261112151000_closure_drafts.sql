create table public.koverr_closure_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  domain text not null,
  company_name text not null check (char_length(company_name) between 1 and 80 and company_name !~ '[[:cntrl:]{}]'),
  template_version integer not null check (template_version > 0),
  state text not null default 'pending' check (state in ('pending','ready','declined','cancelled')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_id uuid references auth.users(id) on delete set null,
  review_outcome text check (review_outcome in ('ready','declined')),
  review_minutes integer check (review_minutes between 0 and 1440),
  foreign key (user_id, domain) references public.koverr_inventory(user_id, domain) on delete cascade
);

create unique index koverr_one_active_closure_draft on public.koverr_closure_drafts(user_id, domain)
  where state in ('pending','ready');
create index koverr_closure_drafts_owner on public.koverr_closure_drafts(user_id, created_at desc);
create index koverr_closure_drafts_pending on public.koverr_closure_drafts(created_at) where state = 'pending';

alter table public.koverr_closure_drafts enable row level security;
revoke all on public.koverr_closure_drafts from public, anon, authenticated;
grant select, insert, update on public.koverr_closure_drafts to service_role;

create function public.koverr_lock_draft_permission(user_id_arg uuid)
returns boolean language plpgsql set search_path = '' as $$
begin
  perform 1 from public.koverr_draft_permission
    where user_id = user_id_arg and active and version = 1 for update;
  return found;
end;
$$;

create function public.koverr_queue_closure_draft(user_id_arg uuid, domain_arg text, company_arg text, version_arg integer)
returns boolean language plpgsql set search_path = '' as $$
begin
  if version_arg is distinct from 1 or not public.koverr_lock_cleanup_access(user_id_arg)
    or not public.koverr_lock_draft_permission(user_id_arg) then return false; end if;
  if not exists (select 1 from public.koverr_inventory
    where user_id = user_id_arg and domain = domain_arg and choice = 'close') then return false; end if;

  insert into public.koverr_closure_drafts (user_id, domain, company_name, template_version)
    values (user_id_arg, domain_arg, company_arg, version_arg)
    on conflict (user_id, domain) where state in ('pending','ready') do nothing;
  return true;
end;
$$;

create function public.koverr_cancel_closure_drafts()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_table_name = 'koverr_draft_permission' then
    update public.koverr_closure_drafts set state = 'cancelled'
      where user_id = new.user_id and state in ('pending','ready');
  else
    update public.koverr_closure_drafts set state = 'cancelled'
      where user_id = new.user_id and domain = new.domain and state in ('pending','ready');
  end if;
  return new;
end;
$$;

create trigger koverr_cancel_drafts_on_withdrawal after update of active on public.koverr_draft_permission
for each row when (old.active and not new.active) execute function public.koverr_cancel_closure_drafts();
create trigger koverr_cancel_drafts_on_choice after update of choice on public.koverr_inventory
for each row when (old.choice = 'close' and new.choice <> 'close') execute function public.koverr_cancel_closure_drafts();

create function public.koverr_review_closure_draft(draft_id_arg uuid, reviewer_id_arg uuid, outcome_arg text, minutes_arg integer)
returns boolean language plpgsql set search_path = '' as $$
declare
  owner_id uuid;
begin
  if outcome_arg is null or outcome_arg not in ('ready','declined')
    or minutes_arg is null or minutes_arg not between 0 and 1440 or reviewer_id_arg is null then return false; end if;
  select user_id into owner_id from public.koverr_closure_drafts where id = draft_id_arg and state = 'pending';
  if owner_id is null or owner_id = reviewer_id_arg or not public.koverr_lock_cleanup_access(owner_id)
    or not public.koverr_lock_draft_permission(owner_id) then return false; end if;
  update public.koverr_closure_drafts set
    state = outcome_arg, review_outcome = outcome_arg, reviewed_at = clock_timestamp(),
    reviewer_id = reviewer_id_arg, review_minutes = minutes_arg
    where id = draft_id_arg and state = 'pending' and template_version = 1;
  return found;
end;
$$;

create function public.koverr_read_closure_drafts(user_id_arg uuid)
returns jsonb language sql stable set search_path = '' as $$
  select coalesce(jsonb_agg(to_jsonb(draft) - 'user_id' - 'reviewer_id' order by created_at desc, id), '[]'::jsonb)
  from public.koverr_closure_drafts draft where user_id = user_id_arg;
$$;

create function public.koverr_closure_review_queue(reviewer_id_arg uuid)
returns table (id uuid, domain text, company_name text, template_version integer, created_at timestamptz)
language sql stable set search_path = '' as $$
  select d.id, d.domain, d.company_name, d.template_version, d.created_at
    from public.koverr_closure_drafts d
    join public.koverr_cleanup_access a using (user_id)
    join public.koverr_draft_permission p using (user_id)
    where d.state = 'pending' and d.user_id <> reviewer_id_arg and a.expires_at > now() and p.active and p.version = 1
    order by d.created_at, d.id limit 100;
$$;

revoke execute on function public.koverr_lock_draft_permission(uuid), public.koverr_queue_closure_draft(uuid,text,text,integer),
  public.koverr_cancel_closure_drafts(), public.koverr_review_closure_draft(uuid,uuid,text,integer),
  public.koverr_read_closure_drafts(uuid), public.koverr_closure_review_queue(uuid) from public, anon, authenticated;
grant execute on function public.koverr_lock_draft_permission(uuid), public.koverr_queue_closure_draft(uuid,text,text,integer),
  public.koverr_review_closure_draft(uuid,uuid,text,integer), public.koverr_read_closure_drafts(uuid),
  public.koverr_closure_review_queue(uuid) to service_role;
