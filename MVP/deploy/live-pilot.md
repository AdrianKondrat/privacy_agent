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

The Koverr pilot project is in West EU (Ireland). Its eight migrations through `20261117104500` were applied in the Supabase SQL editor on 17 November 2026. Runtime secret injection, SMTP, the Node host, the production breach-index key, and the real roster import are pending.

## Verify the deployed server

- Set `KOVERR_PILOT_MODE=invite-only` for the hosted deployment. Before importing the launch list, add a dedicated test mailbox you control directly in the Supabase SQL editor. Replace the example address with the lowercase test address. The insert leaves any existing roster row untouched.

```sql
insert into public.koverr_launch_list (email, variant, consent_version, joined_at, invited_at)
values ('controlled-test-address@example.test', 'breach', 'controlled-test', now(), now())
on conflict (email) do nothing;
```

- Check that `/app/health/` returns HTTP 200 and that the free-check page responds at the configured HTTPS origin. The health endpoint checks the app process only.
- Confirm that email delivery works and an incorrect code is rejected. Verify a real code, run a scan, record a fix when available, export, sign out, sign back in, and delete the test account.
- Check that the account's rows are gone from the active database and remove the dedicated `controlled-test` roster row. Check that a provider error shows an inconclusive or failed result. Verify the password range request contains only the prefix.
- Configure alerts for app health, provider availability and repeated scan failures. Keep email addresses, tokens, request bodies and provider lookup URLs out of application and proxy logs.

## Migrate the launch list

After the controlled mailbox checks pass, use a consistent SQLite backup made by the landing-site operator. Reconcile opt-outs and recent signup answers before making the backup. Keep the file and any copies private.

```sh
node MVP/scripts/import-launch-list.ts --source /private/waitlist.sqlite
node --env-file=MVP/.env MVP/scripts/import-launch-list.ts --source /private/waitlist.sqlite --apply
```

The dry run validates the full input before any writes. The import preserves the email, signup variant, consent version, signup date and optional answers. It reports counts and leaves existing rows and invitation status unchanged. It never transfers follow-up tokens, provisions Auth users or sends messages. Avoid replaying an older backup after handling opt-outs. Reconcile removals on both sides while the landing page remains on SQLite.

Enable Supabase Cron for the live deployment and schedule `select public.koverr_expire_otp_limits();` hourly if it is available on the selected project. Verify the job ran and that provider backup and log retention match the privacy notice. The application also prunes stale counters when processing a code request.

## Run the invited free pilot

1. Confirm that the live deployment is in invite-only mode, the controlled mailbox checks passed, and the roster import completed. Importing leaves every new row uninvited.
2. Once launch emails are explicitly authorized, set `invited_at` for the selected consented recipients when their batch is ready and send the approved invitation from your normal launch channel. Use the HTTPS `/app/` link with no address or private data in the URL. To stop access for an invitation, clear its `invited_at`. Handle launch-list removal separately under the signup privacy notice. If a removed user needs access to an existing export or deletion request, route them through the privacy contact.
3. Set the invite window in [the cohort report](../supabase/reports/pilot-cohort.sql). Review completed checks, seven-day activation among accounts that have had seven full days, and paid intent among users shown the picker. Use a fresh test address outside the real cohort's window. Compare landing variants using the aggregate visit counts from the marketing host as denominators. The SQL shows signup variant for invited users and contains no traffic counts.
4. Compare with G1 in `docs/07-validation-and-build-plan.md`. The targets are 100 completed checks, 40% seven-day activation and 10% paid intent. Expand to open signup only when the launch checks and pilot decision are complete. To switch modes, set `KOVERR_PILOT_MODE=open` and redeploy.

The invite gate applies at the app's OTP request, verification and scan entry points. Supabase Auth is a separate public API. Configure provider-side delivery and signup abuse protection before sending invitations.
