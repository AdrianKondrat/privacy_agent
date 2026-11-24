-- Use the SQL editor as an operator. This report has no addresses, URLs or user IDs.
-- Set the half-open UTC invitation window for the approved pilot group.
-- Capture a snapshot before records expire. Dates here do not change invitation access.
with settings as (
  select timestamptz '2026-11-24 00:00:00+00' as invited_from,
         timestamptz '2026-11-25 00:00:00+00' as invited_before
), invitations as (
  select roster.invited_at, account.id as user_id,
         account.email_confirmed_at is not null as email_verified
  from public.koverr_launch_list roster
  cross join settings
  left join auth.users account on lower(account.email) = roster.email
  where roster.invited_at >= settings.invited_from
    and roster.invited_at < settings.invited_before
    and roster.invited_at <= now()
    and roster.consent_version <> 'controlled-test'
), audits as (
  select audit.user_id, audit.data
  from public.koverr_exposure_audits audit
  join invitations on invitations.user_id = audit.user_id
  where audit.expires_at > now()
    and (audit.data->>'startedAt')::timestamptz >= invitations.invited_at
), checks as (
  select a.user_id, item.value as result, item.key as source
  from audits a cross join lateral jsonb_each(a.data->'checks') item
), cases as (
  select a.user_id, item.value as record, item.key as target
  from audits a cross join lateral jsonb_each(a.data->'cases') item
), events as (
  select c.user_id, c.target, event.value->>'type' as type
  from cases c cross join lateral jsonb_array_elements(c.record->'events') event
)
select
  settings.invited_from,
  settings.invited_before,
  now() as observed_at,
  (select count(*) from invitations) as invited_participants,
  (select count(*) from invitations where email_verified) as verified_accounts,
  (select count(*) from audits) as audits_started,
  (select count(*) from audits where data->'checks' ?& array['192', 'ukphonebook']) as quick_audits_recorded,
  (select count(*) from audits
    where data->'checks'->'192'->>'status' in ('none', 'possible')
      and data->'checks'->'ukphonebook'->>'status' in ('none', 'possible')) as quick_audits_fully_checked,
  (select count(*) from checks where result->>'status' in ('none', 'possible')) as completed_source_checks,
  (select count(*) from checks where result->>'status' in ('failed', 'not-checked')) as recorded_coverage_gaps,
  (select count(distinct (user_id, result->>'url')) from checks where result->>'decision' = 'mine') as confirmed_findings,
  (select count(distinct user_id) from events where type = 'submitted') as users_who_submitted,
  (select count(distinct (user_id, target)) from events where type = 'submitted') as cases_submitted,
  (select count(distinct (user_id, target)) from events
    where type in ('refused', 'removal-reported', 'search-removed', 'marketing-suppressed', 'register-opted-out')) as cases_with_reply,
  (select count(distinct (user_id, target)) from events where type = 'removal-reported') as removals_reported,
  (select count(distinct (user_id, target)) from events where type = 'search-removed') as search_removals_reported,
  (select count(distinct (user_id, target)) from events where type = 'marketing-suppressed') as marketing_suppressions_reported,
  (select count(distinct (user_id, target)) from events where type = 'register-opted-out') as register_opt_outs_reported,
  (select count(distinct (user_id, target)) from events where type = 'recheck-absent') as listings_absent_on_recheck,
  (select count(distinct (user_id, target)) from events where type = 'recheck-delisted') as search_results_absent_on_recheck,
  (select count(distinct (user_id, target)) from events where type = 'recheck-failed') as inconclusive_recheck_cases,
  (select count(distinct (user_id, target)) from events where type = 'unanswered') as no_response_cases,
  (select count(*) from audits where data ? 'assistedSession') as time_records,
  (select coalesce(sum((data->'assistedSession'->>'minutes')::int), 0) from audits) as founder_minutes,
  (select coalesce(sum((data->'assistedSession'->>'userMinutes')::int), 0) from audits) as user_minutes
from settings;
