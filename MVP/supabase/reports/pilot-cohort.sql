-- Run in the SQL editor. Set both boundaries to the invitation batch window in UTC.
-- The output contains aggregate counts only. An empty window returns one total row.
-- Deleted users no longer contribute account events.
with bounds as (
  select '2026-11-17 00:00:00+00'::timestamptz as starts_at,
         '2026-11-18 00:00:00+00'::timestamptz as ends_at
),
cohort as (
  select list.email, list.variant, list.region, list.worry, list.invited_at, users.id
  from public.koverr_launch_list list
  cross join bounds
  left join auth.users users on lower(users.email) = list.email
  where list.invited_at >= bounds.starts_at and list.invited_at < bounds.ends_at
    and list.invited_at <= now() and list.consent_version <> 'controlled-test'
),
funnel as (
  select cohort.*,
    max(e.happened_at) filter (where e.event_name = 'email_verified') as verified,
    max(e.happened_at) filter (where e.event_name = 'check_completed') as checked,
    max(e.happened_at) filter (where e.event_name = 'results_seen') as results_seen,
    max(e.happened_at) filter (where e.event_name = 'first_fix_done') as first_fix,
    max(e.happened_at) filter (where e.event_name = 'plan_choice') as plan_at,
    max(e.choice) filter (where e.event_name = 'plan_choice') as plan
  from cohort
  left join public.koverr_events e on e.user_id = cohort.id and e.happened_at >= cohort.invited_at
  group by cohort.email, cohort.variant, cohort.region, cohort.worry, cohort.invited_at, cohort.id
),
dimensions as (
  select funnel.*, buckets.dimension, buckets.bucket
  from (values (1)) seed(n)
  left join funnel on true
  cross join lateral (values ('total', 'all'), ('signup_variant', variant),
    ('region', coalesce(region, 'unanswered')), ('worry', coalesce(worry, 'unanswered'))
  ) buckets(dimension, bucket)
  where email is not null or dimension = 'total'
),
totals as (
  select dimension, bucket, count(email) as invited,
    count(verified) as verified, count(checked) as completed_checks,
    count(*) filter (where verified <= now() - interval '7 days') as activation_eligible,
    count(*) filter (where verified <= now() - interval '7 days'
      and results_seen between verified and verified + interval '7 days'
      and first_fix between results_seen and verified + interval '7 days') as activated,
    count(results_seen) as plan_picker_views,
    count(*) filter (where plan = 'once' and plan_at >= results_seen) as one_off_choices,
    count(*) filter (where plan = 'monthly' and plan_at >= results_seen) as monthly_choices,
    count(*) filter (where plan = 'later' and plan_at >= results_seen) as not_now_choices
  from dimensions group by dimension, bucket
)
select totals.*,
  round(100.0 * activated / nullif(activation_eligible, 0), 1) as activation_pct,
  round(100.0 * (one_off_choices + monthly_choices) / nullif(plan_picker_views, 0), 1) as paid_intent_pct,
  case when dimension = 'total' then completed_checks >= 100 end as g1_completed_checks_met,
  case when dimension = 'total' and activation_eligible > 0
    then 100.0 * activated >= 40.0 * activation_eligible end as g1_activation_met,
  case when dimension = 'total' and plan_picker_views > 0
    then 100.0 * (one_off_choices + monthly_choices) >= 10.0 * plan_picker_views end as g1_paid_intent_met
from totals
order by case when dimension = 'total' then 0 else 1 end, dimension, bucket;
