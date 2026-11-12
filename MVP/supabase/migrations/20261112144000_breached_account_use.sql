create table public.koverr_account_use (
  user_id uuid not null references public.koverr_checks (user_id) on delete cascade,
  breach_id text not null,
  choice text not null check (choice in ('keep', 'close', 'unsure')),
  updated_at timestamptz not null default now(),
  primary key (user_id, breach_id)
);

alter table public.koverr_account_use enable row level security;
revoke all on public.koverr_account_use from public, anon, authenticated;
grant select on public.koverr_account_use to authenticated;
grant select, insert, update on public.koverr_account_use to service_role;
create policy read_own_account_use on public.koverr_account_use for select to authenticated using ((select auth.uid()) = user_id);
