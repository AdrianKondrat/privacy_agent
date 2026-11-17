create table public.koverr_launch_list (
  email text primary key check (email = lower(email) and length(email) <= 254 and position('@' in email) > 1),
  variant text not null check (variant in ('director', 'breach', 'scam', 'address', 'map')),
  consent_version text not null check (length(consent_version) between 1 and 100),
  joined_at timestamptz not null,
  region text check (region in ('uk', 'eu', 'us', 'ca', 'au', 'other')),
  worry text check (worry in ('breach', 'scams', 'findable', 'fraud', 'sharing')),
  invited_at timestamptz
);

alter table public.koverr_launch_list enable row level security;
revoke all on public.koverr_launch_list from public, anon, authenticated;
grant select, insert, update, delete on public.koverr_launch_list to service_role;

create function public.koverr_expire_otp_limits()
returns bigint language sql set search_path = '' as $$
  with expired as (
    delete from public.koverr_otp_limits where touched_at <= now() - interval '1 hour' returning 1
  )
  select count(*) from expired;
$$;

revoke execute on function public.koverr_expire_otp_limits() from public, anon, authenticated;
grant execute on function public.koverr_expire_otp_limits() to service_role;
