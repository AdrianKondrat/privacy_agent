-- Set the cohort start before running this internal report. Activation includes accounts
-- with at least seven elapsed days since verification. Deleted accounts are excluded.
with cohort as (
  select user_id, happened_at as verified_at
  from public.koverr_events
  where event_name = 'email_verified' and happened_at >= '2026-11-12 00:00:00+00'
),
funnel as (
  select cohort.*,
    max(e.happened_at) filter (where e.event_name = 'check_completed') as checked_at,
    max(e.happened_at) filter (where e.event_name = 'results_seen') as seen_at,
    max(e.happened_at) filter (where e.event_name = 'first_fix_done') as first_fix_at,
    max(e.choice) filter (where e.event_name = 'plan_choice') as choice
  from cohort
  left join public.koverr_events e on e.user_id = cohort.user_id
  group by cohort.user_id, cohort.verified_at
),
totals as (
  select
    count(*) as verified_accounts,
    count(checked_at) as completed_checks,
    count(*) filter (where verified_at <= now() - interval '7 days') as activation_eligible,
    count(*) filter (
      where verified_at <= now() - interval '7 days'
        and seen_at is not null and first_fix_at between verified_at and verified_at + interval '7 days'
    ) as activated_within_seven_days,
    count(seen_at) as plan_picker_views,
    count(*) filter (where choice = 'once') as once_choices,
    count(*) filter (where choice = 'monthly') as monthly_choices,
    count(*) filter (where choice = 'later') as not_now_choices
  from funnel
)
select totals.*,
  round(100.0 * activated_within_seven_days / nullif(activation_eligible, 0), 1) as activation_pct,
  round(100.0 * (once_choices + monthly_choices) / nullif(plan_picker_views, 0), 1) as paid_intent_pct
from totals;
