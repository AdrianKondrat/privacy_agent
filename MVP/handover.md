# Koverr MVP handover

Updated 12 November 2026. Continue on the existing `MVP` branch and push each major milestone. Product scope and build order live in the [PRD](../docs/03-prd-mvp.md), [architecture](../docs/05-architecture.md), [build plan](../docs/07-validation-and-build-plan.md) and [design direction](../docs/08-design-direction.md).

## Built

- The implementation lives in `MVP/`. A small Astro integration mounts the free check, password checker, browser-only inventory and Cleanup workspace in the existing project, using the shared shell and design tokens.
- Sample mode uses five fictional breaches. Done, skip and undo use a short-lived sample cookie that is cleared when the user exits.
- The live free check sends a six-digit Supabase email code. Only a session with a confirmed email can reserve a scan. The lookup address comes from Supabase Auth, and the browser cannot supply a different address to scan.
- The Have I Been Pwned adapter distinguishes a clean response from provider failures. It stores breach metadata and ranks the next three fixes from a versioned Stolen playbook.
- Postgres stores the scan snapshot and fix outcomes. Row-level security scopes reads to the account owner. Only the server writes these tables. The database limits verification requests to five per address per rolling hour and prevents overlapping scans.
- The password checker uses Web Crypto in the browser. It requests a padded range with only the first five hash characters, matches the suffix on-device and keeps no history.
- Cleanup pilot accounts can explicitly save registrable domains and review choices. The app matches domains against saved breach metadata when available. An aggregate research query surfaces unknown domains without account identifiers.
- The browser-local inventory imports CSV or accepts manual domains, deduplicates registrable sites, and records Keep, Close or Not sure in memory. Close reveals the next step and an official guide for the starter directory. Reloading clears the list. Nothing is uploaded.
- Verified Cleanup pilot users can grant or withdraw versioned permission to prepare closure drafts. Changes are audited and included in account export. The agreement covers draft preparation only.
- Each of the top three breach plans asks whether the account is still used. Choosing no shows steps for closing it with the provider. Answers are editable, exported and deleted with the account.
- Customers can queue one active closure draft per saved website marked Close when an official guide is known. An allowlisted founder can review or decline the fixed template and log minutes. Reviewers see an email placeholder. Permission withdrawal or changing the Close decision cancels active drafts while retaining the review outcome.
- The E3 pricing survey records a first choice after viewing results. The internal [free-check funnel query](supabase/reports/free-check-funnel.sql) reports completed checks, seven-day activation and paid intent. Sample choices stay local and are excluded.
- Account controls provide a JSON export and hard deletion of the active account. Foreign keys cascade deletion to saved results and progress. The app has its own privacy notice.

## Run the sample

Use Node 24 or newer. From the repository root, run `npm ci` if dependencies are missing, then `npm run dev`. Open `/app/` or go directly to `/app/?sample=1`. The sample needs no provider credentials. The separate password checker uses the public Pwned Passwords range API and needs no sign-in.

## Hosted sample preview

[Open the private cloud preview](https://koverr-mvp-preview.kondrat-adrian.chatgpt.site). Sign in to ChatGPT with the account that owns the Site if prompted. The cloud build uses the same sample findings, playbook, styling and password checker as the application. Sample progress, closure answers and the sample pricing choice stay in the browser tab and clear when you exit the sample. The separate inventory screen also runs locally in the browser. The Cleanup walkthrough lets you enable sample permission, queue a fictional draft, simulate founder review and withdraw permission. The preview has no email signup or personal breach lookup.

The static preview source is in `MVP/preview/`. Build it from the repository root with `node node_modules/astro/bin/astro.mjs build --config MVP/preview/astro.config.mjs --outDir dist/preview`. ChatGPT Sites project ID is `appgprj_6af5c87a174881919bfe32be11ec951d`. Reuse that private Site and its source checkout for future updates. The deployment includes only the preview source and shared files it imports.

## Connect a private live preview

1. Apply the SQL migrations in [supabase/migrations](supabase/migrations) in timestamp order to a UK or EU Supabase project. Configure transactional SMTP for the preview and put `{{ .Token }}` in the sign-up confirmation and sign-in email templates. Use a six-digit code and a ten-minute expiry. Review provider-side abuse limits and require confirmation for email sign-ins.
2. Copy [the environment template](.env.example) to `MVP/.env` and fill in the exact app origin, Supabase URL and keys, and a Have I Been Pwned key that supports breached-account lookups. Keep the service-role and breach-index keys on the server. The live form is available only at the configured origin.
3. Run `node --env-file=MVP/.env node_modules/astro/bin/astro.mjs dev --host 127.0.0.1 --port 4327`. Open `http://127.0.0.1:4327/app/`. For hosted builds, set `KOVERR_APP_ORIGIN` at build time as well as runtime so Astro can recognise the origin behind a proxy.
4. Use a mailbox you control to verify code delivery, scan, complete a step, sign in again to confirm persistence, export and delete. Check that the account and saved rows are gone. Provider reference: [Supabase email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless) and [Have I Been Pwned API](https://haveibeenpwned.com/API/V3).

### Enable Cleanup pilot access

After the user has verified their email in the private live preview, use their Supabase Auth user UUID to grant time-limited access in the Supabase SQL editor. Replace the example value with the intended pilot's UUID.

```sql
insert into public.koverr_cleanup_access (user_id, expires_at)
values ('<verified-user-uuid>', now() + interval '90 days')
on conflict (user_id) do update set expires_at = excluded.expires_at;
```

Set `KOVERR_CONCIERGE_REVIEWER_IDS` to comma-separated Supabase Auth user UUIDs for the founder review route. Use a separate reviewer identity when testing the customer flow. The queue is at `/app/cleanup/review/`. Inspect unresolved domains there and add verified official guides to `MVP/data/closure-directory.json`.

The first live version uses a separate Run breach check action after verification. It sends the address directly to Have I Been Pwned and stores one successful scan per free account. Sessions expire within an hour and can be renewed by signing in with a new code.

## Verification

```sh
node --test MVP/test/*.test.ts
npm run check
npm run build
```

The built route passed a headless Chromium walkthrough using mocked providers, including a wrong code, verification, scan, completion, undo, export and deletion. The migrations passed embedded Postgres checks for OTP limits, scan retries, per-account reads, write restrictions, pricing deduplication, activation event capture, Cleanup access, draft permission and withdrawal, reviewer separation and cascading deletion. Have I Been Pwned returned a result for its documented synthetic account using its public test key. On a mobile Chromium viewport, the real password-range lookup sent only the expected five-character prefix and made no request to Koverr. Live Supabase, SMTP and production breach-index credentials remain unconfigured.

## Next

1. Connect a private live preview with Supabase, SMTP and production breach-index credentials. Confirm backup and log retention, scheduled expiry of rate-limit data, abuse controls and operational monitoring. Import the launch list before expanding access.
2. Use the research queue to expand the official-guide directory and add reviewed policy classifications. Breach matching uses provider domains on new scans; earlier snapshots without a domain stay usable and cannot be matched by name alone.
3. Add checkout-backed Cleanup entitlements, solicitor-reviewed sending authority and reviewed rights templates before implementing relay sends or reply handling. Current permission covers draft preparation. The only template is account closure, and reviewed drafts are copied into the customer’s own mailbox or support form.
