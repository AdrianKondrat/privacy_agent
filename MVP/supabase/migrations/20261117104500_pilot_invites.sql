create index koverr_launch_list_invited on public.koverr_launch_list (invited_at)
  where invited_at is not null;

create function public.koverr_pilot_invited(email_arg text)
returns boolean language sql stable set search_path = '' as $$
  select exists (
    select 1 from public.koverr_launch_list
    where email = lower(email_arg) and invited_at <= now()
  );
$$;

revoke execute on function public.koverr_pilot_invited(text) from public, anon, authenticated;
grant execute on function public.koverr_pilot_invited(text) to service_role;
