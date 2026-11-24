# Deploy the private assisted pilot

Use the dedicated [koverr-mvp Worker](https://koverr-mvp.uceiond.workers.dev/app/audit/) for the invite-only pilot. Build it from `privacy_agent/MVP`. The repository's root Cloudflare configuration serves the static breach sample.

## Release the pilot Worker

1. Check out the `MVP` branch. Install the locked dependencies with `npm ci`.
2. Check the production Supabase URL, app origin, and invite-only setting in [the Worker configuration](wrangler.pilot.jsonc).
3. Keep both Supabase keys in the existing Worker's production settings. Store the server key as an encrypted secret.
4. Run the build and the two deployment commands below. Use the generated configuration in all Wrangler commands.
5. Run the HTTPS smoke test. Check that the audit is private and the fictional sample is available.

```sh
npm run build:pilot
npx wrangler deploy --config dist/pilot-worker/server/wrangler.json --dry-run
npx wrangler deploy --config dist/pilot-worker/server/wrangler.json
node MVP/scripts/check-live-pilot.ts https://koverr-mvp.uceiond.workers.dev
```

The old Git build connection points to `koverr_mvp/main`. Its automatic builds are off. Use the manual release from `privacy_agent/MVP` until a Git build uses that branch.

## Set up the database and the Node fallback

1. Use the existing Supabase project in West EU. Check its migration log. Apply [the exposure audit migration](../supabase/migrations/20261123120000_exposure_audits.sql) if it is pending.
2. For a new project, apply all migrations in timestamp order. Enable Supabase Cron. Schedule the existing OTP cleanup function. [Supabase Cron instructions](https://supabase.com/docs/guides/cron/quickstart)
3. Check email confirmation, both code templates, Resend SMTP, and Auth rate limits. Use a six-digit code and a ten-minute expiry. Put `{{ .Token }}` in both templates. [Supabase SMTP setup](https://supabase.com/docs/guides/auth/auth-smtp)
4. Set the values in [the environment example](../.env.example). Keep the Supabase server secret in the host secret store. Use the same HTTPS origin at build and runtime. Leave the HIBP API key empty.
5. Point the domain to the pilot host. Open ports 80 and 443 for Caddy. Keep the Node port private. [Caddy HTTPS instructions](https://caddyserver.com/docs/automatic-https)

Run these commands on the pilot host. Use the path to its private environment file.

```sh
docker compose --env-file /private/koverr-pilot.env -f MVP/deploy/compose.yaml config --quiet
docker compose --env-file /private/koverr-pilot.env -f MVP/deploy/compose.yaml up -d --build --wait
```

Caddy serves the audit paths and app assets. It redirects the pilot root to `/app/`. The landing signup endpoint is outside the pilot paths. The existing Worker serves the live pilot.

Check both scheduled jobs in the Supabase SQL editor. Confirm that each job is active. Check that the most recent run succeeded.

```sql
select distinct on (j.jobname) j.jobname, j.active, j.schedule, r.status, r.start_time
from cron.job j
left join cron.job_run_details r on r.jobid = j.jobid
where j.jobname in ('koverr-expire-otp-limits', 'koverr-expire-exposure-audits')
order by j.jobname, r.start_time desc nulls last;
```

## Verify one controlled account

1. Get permission to use a test mailbox. Add its lowercase address as an invited test entry in Supabase.
2. Run the public availability check. It uses only GET requests. It checks the invite-only form, the redirects, the sample, and the landing signup route.

```sh
node MVP/scripts/check-live-pilot.ts https://pilot.example.com
```

3. Open the audit page. Request a code. Check that a wrong code fails. Check that the mailbox gets the correct code.
4. Start a UK audit. Check a controlled result and a source failure. Reject a wrong match. Confirm a match that belongs to the test user.
5. Open the official removal steps. For a dry run, use test providers to record submissions and replies. Get approval for any real external request.
6. Export the account. Check that the audit and case history are in the export. Check that a second account cannot read them.
7. Delete the test account. Verify that Supabase removed its audit row. Remove its controlled roster entry.

Use a controlled test entry only. Replace the example address with the approved address.

```sql
insert into public.koverr_launch_list (email, variant, consent_version, joined_at, invited_at)
values ('controlled-test@example.test', 'breach', 'controlled-test', now(), now())
on conflict (email) do nothing;
```

## Run the pilot

Keep `KOVERR_PILOT_MODE=invite-only`. Add each approved participant before an authorized invitation. The existing roster export, import, and verification scripts are available if recruitment uses the landing list. For the first controlled audit, add only the approved accounts.

Use [the pilot preparation notes](../pilot-preparation.md) during the session. Review aggregate results in [the exposure pilot report](../supabase/reports/exposure-pilot.sql). Run the report before the earliest audit expires.
