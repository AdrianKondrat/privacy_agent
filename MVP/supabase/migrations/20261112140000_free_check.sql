create table public.koverr_otp_limits (
  address_key text primary key,
  requests timestamptz[] not null,
  touched_at timestamptz not null
);
create index koverr_otp_limits_expiry on public.koverr_otp_limits (touched_at);

create table public.koverr_checks (
  user_id uuid primary key references auth.users (id) on delete cascade,
  claim_id uuid not null,
  attempted_at timestamptz not null default now(),
  checked_at timestamptz,
  state text not null default 'checking' check (state in ('checking', 'failed', 'complete')),
  findings jsonb not null default '[]' check (jsonb_typeof(findings) = 'array')
);

create table public.koverr_fix_progress (
  user_id uuid not null references public.koverr_checks (user_id) on delete cascade,
  step_key text not null,
  outcome jsonb not null check (jsonb_typeof(outcome) = 'object'),
  primary key (user_id, step_key)
);

alter table public.koverr_otp_limits enable row level security;
alter table public.koverr_checks enable row level security;
alter table public.koverr_fix_progress enable row level security;

revoke all on public.koverr_otp_limits, public.koverr_checks, public.koverr_fix_progress from public, anon, authenticated;
grant select on public.koverr_checks, public.koverr_fix_progress to authenticated;
grant select, insert, update, delete on public.koverr_otp_limits, public.koverr_checks, public.koverr_fix_progress to service_role;

create policy read_own_check on public.koverr_checks for select to authenticated using ((select auth.uid()) = user_id);
create policy read_own_progress on public.koverr_fix_progress for select to authenticated using ((select auth.uid()) = user_id);

create function public.koverr_claim_otp(address_key_arg text)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  cutoff timestamptz := now() - interval '1 hour';
begin
  delete from public.koverr_otp_limits where touched_at <= cutoff;
  insert into public.koverr_otp_limits as limits (address_key, requests, touched_at)
    values (address_key_arg, array[now()], now())
    on conflict (address_key) do update
      set requests = array_append(array(select ts from unnest(limits.requests) as ts where ts > cutoff), now()),
          touched_at = now()
      where cardinality(array(select ts from unnest(limits.requests) as ts where ts > cutoff)) < 5;
  return found;
end;
$$;

create function public.koverr_claim_scan(user_id_arg uuid, claim_id_arg uuid)
returns boolean
language plpgsql
set search_path = ''
as $$
begin
  insert into public.koverr_checks as checks (user_id, claim_id)
    values (user_id_arg, claim_id_arg)
    on conflict (user_id) do update
      set claim_id = claim_id_arg, attempted_at = now(), state = 'checking'
      where checks.state <> 'complete' and checks.attempted_at <= now() - interval '1 minute';
  return found;
end;
$$;

revoke execute on function public.koverr_claim_otp(text), public.koverr_claim_scan(uuid, uuid) from public, anon, authenticated;
grant execute on function public.koverr_claim_otp(text), public.koverr_claim_scan(uuid, uuid) to service_role;
