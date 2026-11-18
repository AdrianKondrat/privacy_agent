# Deploy the private live pilot

Use a dedicated UK or EU Supabase project and a Node 24 host with HTTPS. The current ChatGPT Sites walkthrough is a static sample deployment. Use a separate origin for the live server.

1. Apply the migrations in `MVP/supabase/migrations/` in timestamp order. Configure Supabase Auth confirmation, six-digit OTP templates with a ten-minute expiry, custom SMTP, and Auth limits. Use the project's publishable key and keep its server secret in the host’s secret store. Set the exact live origin at build and runtime. [Supabase SMTP setup](https://supabase.com/docs/guides/auth/auth-smtp)
2. Configure the host using `MVP/.env.example`. Store the production Have I Been Pwned key on the server. The provider's synthetic test key works only for its test addresses. [Have I Been Pwned API documentation](https://haveibeenpwned.com/API/v3)
3. Build from the repository root. Only the public origins are build arguments. The Docker context allowlist excludes environment files, Git history and local databases.

```sh
docker build -f MVP/deploy/Dockerfile \
  --build-arg KOVERR_APP_ORIGIN=https://pilot.example.com \
  --build-arg WAITLIST_ORIGIN=https://pilot.example.com \
  -t koverr-pilot .
```

Run the container with the live environment injected by the host, a persistent writable volume mounted at `/storage` for the standalone landing site's SQLite data, and the HTTPS proxy forwarding the configured public host and scheme. Alternatively, run `npm ci`, `npm run build`, and `npm start` on a Node 24 host. The app listens on the host-provided `PORT`. Restrict direct access to the server behind the proxy.

### Use the dedicated pilot stack on a Docker host

1. Point the pilot domain to the host. Allow ports 80 and 443 to reach Caddy so it can obtain a certificate. [Caddy HTTPS instructions](https://caddyserver.com/docs/automatic-https)
2. Set the values from [the environment example](../.env.example) in the host's secret store or in a private environment file. Set `KOVERR_APP_ORIGIN` to the exact public HTTPS origin. Use the new Supabase server secret.
3. Run these commands from the repository root on the host. Use the path to the private environment file.

```sh
docker compose --env-file /private/koverr-pilot.env -f MVP/deploy/compose.yaml config --quiet
docker compose --env-file /private/koverr-pilot.env -f MVP/deploy/compose.yaml up -d --build --wait
```

If the host supplies the settings as environment variables, omit `--env-file` and its path.

The [Compose stack](compose.yaml) runs the app in invite-only mode. Only Caddy publishes ports. It redirects the root URL to `/app/` and serves the pilot routes and assets. The marketing pages and signup endpoint are outside the pilot routes. Caddy saves its certificate state in a Docker volume.

The Koverr pilot project is in West EU (Ireland). Its eight migrations through `20261117104500` were applied in the Supabase SQL editor on 17 November 2026.

Email confirmation is on. The email code length is six digits and the expiry is 600 seconds. The pilot project has Resend SMTP and uses `{{ .Token }}` in the Confirm sign up and Magic link or OTP templates. Verify delivery during the live mailbox test. [Resend SMTP instructions](https://resend.com/changelog/smtp-service)

## Verify the deployed server

- Set `KOVERR_PILOT_MODE=invite-only` for the hosted deployment. Before importing the launch list, add a dedicated test mailbox you control directly in the Supabase SQL editor. Replace the example address with the lowercase test address. The insert leaves any existing roster row untouched.

```sql
insert into public.koverr_launch_list (email, variant, consent_version, joined_at, invited_at)
values ('controlled-test-address@example.test', 'breach', 'controlled-test', now(), now())
on conflict (email) do nothing;
```

- Run `node MVP/scripts/check-live-pilot.ts https://pilot.example.com` with the public HTTPS origin. The script checks the health route and confirms that the live invite-only form is available. It sends no code and needs no credentials.
- Confirm that email delivery works and an incorrect code is rejected. Verify a real code, run a scan, record a fix when available, export, sign out, sign back in, and delete the test account.
- Check that the account's rows are gone from the active database and remove the dedicated `controlled-test` roster row. Check that a provider error shows an inconclusive or failed result. Verify the password range request contains only the prefix.
- Configure alerts for app health, provider availability and repeated scan failures. Keep email addresses, tokens, request bodies and provider lookup URLs out of application and proxy logs.

## Migrate the launch list

After the controlled mailbox test passes, reconcile opt-outs and recent signup answers. From the landing site's data host, make a roster snapshot in a private directory. Use the live SQLite path from `WAITLIST_DB_PATH`. The export copies the six roster fields and prints the row count. The export omits follow-up tokens.

```sh
node MVP/scripts/export-launch-list.ts --source /storage/waitlist.sqlite --output /private/roster.sqlite
```

Use the same snapshot for the dry run, import, and verification. Keep the snapshot outside Git.

```sh
node MVP/scripts/import-launch-list.ts --source /private/roster.sqlite
node --env-file=MVP/.env MVP/scripts/import-launch-list.ts --source /private/roster.sqlite --apply
node --env-file=MVP/.env MVP/scripts/import-launch-list.ts --source /private/roster.sqlite --verify
```

The dry run validates the full input before any writes. The import preserves the email, signup variant, consent version, signup date and optional answers. It reports counts and leaves existing rows and invitation status unchanged. It never transfers follow-up tokens, provisions Auth users or sends messages. Avoid replaying an older backup after handling opt-outs. Reconcile removals on both sides while the landing page remains on SQLite.

Run the read-only verification before marking any invitations. Remove the controlled test row first. Keep the destination roster unchanged during verification. Check that `matched` equals the dry-run row count and that `different`, `extra`, `missing` and `invited` are zero. The command returns a nonzero exit status for any of these differences. Reconcile each difference privately and repeat the check with the current backup.

The pilot project has an active hourly job named `koverr-expire-otp-limits`. Supabase scheduled its first run for 15:00 GMT on 18 November 2026. Check the run before you import the real launch list.

For a new project, enable Supabase Cron and run this command in the SQL Editor. Use the same job name if you must update the schedule.

```sql
select cron.schedule(
  'koverr-expire-otp-limits',
  '0 * * * *',
  'select public.koverr_expire_otp_limits();'
);
```

After the scheduled time, check the latest run. Make sure the job is active and the latest run status is `succeeded`. Check that provider backup and log retention match the privacy notice.

```sql
select j.active, j.schedule, r.status, r.start_time, r.end_time
from cron.job j
left join cron.job_run_details r on r.jobid = j.jobid
where j.jobname = 'koverr-expire-otp-limits'
order by r.start_time desc nulls last
limit 1;
```

[Supabase Cron instructions](https://supabase.com/docs/guides/cron/quickstart)

## Run the invited free pilot

1. Confirm that the live deployment is in invite-only mode, the controlled mailbox checks passed, and the roster import completed. Importing leaves every new row uninvited.
2. Once launch emails are explicitly authorized, set `invited_at` for the selected consented recipients when their batch is ready. Send the approved [pilot invitation](../pilot-preparation.md) from your normal launch channel. Use the HTTPS `/app/` link with no address or private data in the URL. To stop access for an invitation, clear its `invited_at`. Handle launch-list removal separately under the signup privacy notice. If a removed user needs access to an existing export or deletion request, route them through the privacy contact.
3. Set the UTC invite window in [the cohort report](../supabase/reports/pilot-cohort.sql). The report excludes the `controlled-test` marker. Review completed checks, seven-day activation among accounts that have had seven full days, and paid intent among users shown the picker. Compare landing variants using the visit counts from the marketing host.
4. Read the three G1 flags on the total row. The targets are 100 completed checks, 40% seven-day activation and 10% paid intent. A null rate flag means the report has no eligible users for that rate. Use [the build plan](../../docs/07-validation-and-build-plan.md) to decide when to expand signup. To expand access, set `KOVERR_PILOT_MODE=open` and deploy again.

The invite gate applies at the app's OTP request, verification and scan entry points. Supabase Auth is a separate public API. Configure provider-side delivery and signup abuse protection before sending invitations.
