create table public.koverr_exposure_audits (
  user_id uuid primary key references auth.users (id) on delete cascade,
  revision integer not null check (revision > 0),
  expires_at timestamptz not null default (now() + interval '90 days'),
  data jsonb not null check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 24576)
);

create index koverr_exposure_audits_expiry on public.koverr_exposure_audits (expires_at);
alter table public.koverr_exposure_audits enable row level security;
revoke all on public.koverr_exposure_audits from public, anon, authenticated;
grant select on public.koverr_exposure_audits to authenticated;
grant select, insert, update, delete on public.koverr_exposure_audits to service_role;

create policy read_own_exposure_audit
  on public.koverr_exposure_audits for select to authenticated
  using ((select auth.uid()) = user_id and expires_at > now());

-- The pilot project already uses pg_cron for OTP cleanup.
create extension if not exists pg_cron;
select cron.schedule(
  'koverr-expire-exposure-audits',
  '15 * * * *',
  $$delete from public.koverr_exposure_audits where expires_at <= now()$$
);
