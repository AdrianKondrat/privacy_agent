create table public.koverr_events (
  user_id uuid not null references auth.users (id) on delete cascade,
  event_name text not null check (event_name in (
    'email_verified', 'check_completed', 'results_seen', 'first_fix_done', 'plan_choice'
  )),
  happened_at timestamptz not null default now(),
  choice text,
  primary key (user_id, event_name),
  check (case when event_name = 'plan_choice' then choice is not null and choice in ('once', 'monthly', 'later')
    else choice is null end)
);

alter table public.koverr_events enable row level security;
revoke all on public.koverr_events from public, anon, authenticated;
grant select on public.koverr_events to authenticated;
grant select, insert on public.koverr_events to service_role;
create policy read_own_events on public.koverr_events for select to authenticated using ((select auth.uid()) = user_id);

create function public.koverr_record_check_completed()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.state = 'complete' then
    insert into public.koverr_events (user_id, event_name, happened_at)
      values (new.user_id, 'check_completed', new.checked_at)
      on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger koverr_record_check_completed
after insert or update of state on public.koverr_checks
for each row execute function public.koverr_record_check_completed();

create function public.koverr_record_first_fix()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.outcome ->> 'status' = 'done' then
    insert into public.koverr_events (user_id, event_name)
      values (new.user_id, 'first_fix_done')
      on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger koverr_record_first_fix
after insert or update of outcome on public.koverr_fix_progress
for each row execute function public.koverr_record_first_fix();

-- Include accounts and checks from earlier builds. Undone fixes cannot be recovered from older snapshots.
insert into public.koverr_events (user_id, event_name, happened_at)
  select id, 'email_verified', email_confirmed_at from auth.users where email_confirmed_at is not null;
insert into public.koverr_events (user_id, event_name, happened_at)
  select user_id, 'check_completed', checked_at from public.koverr_checks where state = 'complete' and checked_at is not null;
insert into public.koverr_events (user_id, event_name, happened_at)
  select user_id, 'first_fix_done', min((outcome ->> 'at')::timestamptz)
  from public.koverr_fix_progress
  where outcome ->> 'status' = 'done' and outcome ? 'at'
  group by user_id;

create function public.koverr_choose_plan(user_id_arg uuid, choice_arg text)
returns boolean
language plpgsql
set search_path = ''
as $$
begin
  if choice_arg is null or choice_arg not in ('once', 'monthly', 'later') then
    return false;
  end if;
  insert into public.koverr_events (user_id, event_name, choice)
    select user_id, 'plan_choice', choice_arg
    from public.koverr_events
    where user_id = user_id_arg and event_name = 'results_seen'
    on conflict do nothing;
  return exists (
    select 1 from public.koverr_events where user_id = user_id_arg and event_name = 'plan_choice'
  );
end;
$$;

revoke execute on function public.koverr_choose_plan(uuid, text),
  public.koverr_record_check_completed(), public.koverr_record_first_fix() from public, anon, authenticated;
grant execute on function public.koverr_choose_plan(uuid, text) to service_role;
