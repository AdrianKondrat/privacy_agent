-- Use the SQL editor as an operator. This report has no addresses, URLs or user IDs.
-- Take a snapshot before records expire. The audit itself generates no external requests.
with audits as (
  select user_id, data from public.koverr_exposure_audits where expires_at > now()
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
  (select count(*) from audits) as audits_started,
  (select count(*) from audits where data->'checks' ?& array['192', 'ukphonebook']) as quick_audits_recorded,
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
  (select count(*) from audits where data ? 'assistedSession') as time_records,
  (select coalesce(sum((data->'assistedSession'->>'minutes')::int), 0) from audits) as founder_minutes,
  (select coalesce(sum((data->'assistedSession'->>'userMinutes')::int), 0) from audits) as user_minutes;
