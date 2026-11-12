# Koverr MVP handover

Updated 12 November 2026. Continue on the existing `MVP` branch and push each major milestone. Product scope and build order live in the [PRD](../docs/03-prd-mvp.md), [architecture](../docs/05-architecture.md), [build plan](../docs/07-validation-and-build-plan.md) and [design direction](../docs/08-design-direction.md).

## Built

- The implementation lives in `MVP/`. A small Astro integration mounts `/app/`, `/app/privacy/` and `/app/password/` in the existing project, using the shared shell and design tokens.
- Sample mode uses five fictional breaches. Done, skip and undo use a short-lived sample cookie that is cleared when the user exits.
- The live free check sends a six-digit Supabase email code. Only a session with a confirmed email can reserve a scan. The lookup address comes from Supabase Auth, and the browser cannot supply a different address to scan.
- The Have I Been Pwned adapter distinguishes a clean response from provider failures. It stores breach metadata and ranks the next three fixes from a versioned Stolen playbook.
- Postgres stores the scan snapshot and fix outcomes. Row-level security scopes reads to the account owner. Only the server writes these tables. The database limits verification requests to five per address per rolling hour and prevents overlapping scans.
- The password checker uses Web Crypto in the browser. It requests a padded range with only the first five hash characters, matches the suffix on-device and keeps no history.
- The E3 pricing survey records a first choice after viewing results. The internal [free-check funnel query](supabase/reports/free-check-funnel.sql) reports completed checks, seven-day activation and paid intent. Sample choices stay local and are excluded.
- Account controls provide a JSON export and hard deletion of the active account. Foreign keys cascade deletion to saved results and progress. The app has its own privacy notice.

## Run the sample

Use Node 24 or newer. From the repository root, run `npm ci` if dependencies are missing, then `npm run dev`. Open `/app/` or go directly to `/app/?sample=1`. The sample needs no provider credentials. The separate password checker uses the public Pwned Passwords range API and needs no sign-in.

## Hosted sample preview

[Open the private cloud preview](https://koverr-mvp-preview.kondrat-adrian.chatgpt.site). Sign in to ChatGPT with the account that owns the Site if prompted. The cloud build uses the same sample findings, playbook, styling and password checker as the application. Sample progress stays in the browser tab and clears when you exit the sample. The preview has no email signup or personal breach lookup.

The static preview source is in `MVP/preview/`. Build it from the repository root with `node node_modules/astro/bin/astro.mjs build --config MVP/preview/astro.config.mjs --outDir dist/preview`. ChatGPT Sites project ID is `appgprj_6af5c87a174881919bfe32be11ec951d`. Reuse that private Site and its source checkout for future updates. The deployment includes only the preview source and shared files it imports.

## Connect a private live preview

1. Apply the SQL migrations in [supabase/migrations](supabase/migrations) in timestamp order to a UK or EU Supabase project. Configure transactional SMTP for the preview and put `{{ .Token }}` in the sign-up confirmation and sign-in email templates. Use a six-digit code and a ten-minute expiry. Review provider-side abuse limits and require confirmation for email sign-ins.
2. Copy [the environment template](.env.example) to `MVP/.env` and fill in the exact app origin, Supabase URL and keys, and a Have I Been Pwned key that supports breached-account lookups. Keep the service-role and breach-index keys on the server. The live form is available only at the configured origin.
3. Run `node --env-file=MVP/.env node_modules/astro/bin/astro.mjs dev --host 127.0.0.1 --port 4327`. Open `http://127.0.0.1:4327/app/`. For hosted builds, set `KOVERR_APP_ORIGIN` at build time as well as runtime so Astro can recognise the origin behind a proxy.
4. Use a mailbox you control to verify code delivery, scan, complete a step, sign in again to confirm persistence, export and delete. Check that the account and saved rows are gone. Provider reference: [Supabase email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless) and [Have I Been Pwned API](https://haveibeenpwned.com/API/V3).

The first live version uses a separate Run breach check action after verification. It sends the address directly to Have I Been Pwned and stores one successful scan per free account. Sessions expire within an hour and can be renewed by signing in with a new code.

## Verification

```sh
node --test MVP/test/*.test.ts
npm run check
npm run build
```

The built route passed a headless Chromium walkthrough using mocked providers, including a wrong code, verification, scan, completion, undo, export and deletion. The migration passed an embedded Postgres check for OTP limits, scan retries, per-account reads, write restrictions and cascading deletion. Have I Been Pwned returned a result for its documented synthetic account using its public test key. On a mobile Chromium viewport, the real password-range lookup sent only the expected five-character prefix and made no request to Koverr. Live Supabase, SMTP and production breach-index credentials remain unconfigured.

## Next

1. Complete the P1 follow-up for accounts the user no longer uses and record actual time spent if useful in the beta.
2. Set up and verify the private preview. Before public signup, settle provider backup and log retention, scheduled expiry of rate-limit data, abuse protection and operational monitoring. Complete the launch-list import and public-launch items in the build plan.
3. Continue with signed authority, browser-local account import, the company directory, request drafts and the concierge admin queue.
