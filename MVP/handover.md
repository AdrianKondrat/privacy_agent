# Koverr MVP handover

Updated 23 November 2026. Use the `MVP/` folder on the `MVP` branch of `AdrianKondrat/privacy_agent`. The previous session used `koverr_mvp/main` to deploy a separate Cloudflare Worker. The current branch contains the new work. Read the [development plan](../docs/07-validation-and-build-plan.md) before you continue.

## What the MVP does

1. The user signs in with an email code. Supabase verifies the address.
2. The user selects the United Kingdom. They can select the types of information to check.
3. The free audit gives instructions for 192.com and ukphonebook.com. The deeper audit adds Google Search.
4. The user checks each site. Koverr records the result, the date, and the coverage gaps. Search terms go directly to the site.
5. The user selects Mine, Not mine, or Unsure for a possible match. Koverr gives the official removal step for a confirmed match.
6. The user submits the request on the official site. They record the submission date in Koverr.
7. The case history shows replies, follow-up dates, and public rechecks. A failed recheck has the status Inconclusive recheck.
8. The user can export all account data or delete the account. The audit expires after 90 days.

The deeper audit also gives two optional opt-out routes. The user can track Experian marketing suppression and the open electoral register opt-out. Each route shows Holding not confirmed.

## Verification and limits

- All 33 automated tests passed. Astro diagnostics, the Node build, the static sample build, and the Docker Compose configuration check passed.
- Chromium passed a local test with synthetic accounts. It checked the email code, match review, submission, reply, recheck, export, and deletion.
- Embedded Postgres passed the owner access, expiry, deletion, and report checks. Check the scheduled job on Supabase during deployment.

- The public source review found a company listing, an empty test search, and a source page that the test could not open. A live personal audit is pending. [Source review](pilot-preparation.md)
- The checked UK routes are 192.com, ukphonebook.com, Google Search, Experian UK, and the open electoral register. The route check used official instructions.
- The app has zero search API calls. The email code flow uses Supabase and Resend. The password tool uses the free Pwned Passwords service.
- The Node app opens the audit from `/app/`. The existing static Cloudflare build continues to show the breach sample. The new audit needs a private Node host. [Deployment instructions](deploy/live-pilot.md)
- The previous session set up Resend in the Supabase project `koverr_privacy_agent_alpha` in West EU. Live code delivery is pending.
- Apply migration `20261123120000_exposure_audits.sql` before you enable the pilot. The new table stores owner-only audit records. The scheduled job removes expired records each hour.
- Keep the launch list outside this test. Add only an approved test address to the pilot roster. Keep keys in the host secret store.

## Next three milestones

1. **Verify the private deployment.** Apply the new migration. Set the Supabase keys on an HTTPS host. Test code delivery, sign-in, export, deletion, and audit expiry with an approved mailbox.
2. **Run the assisted pilot.** Get approval for the first participants. Watch them check the sources and send their own requests. Record real outcomes and founder time.
3. **Review the pilot results.** Use the aggregate report. Check coverage, completed checks, confirmed matches, submissions, replies, rechecks, and time. Use those results to decide whether to offer paid Cleanup.

[Aggregate pilot report](supabase/reports/exposure-pilot.sql) · [Pilot preparation](pilot-preparation.md) · [Deployment instructions](deploy/live-pilot.md)

## Development diagram

![Koverr MVP functions and the next three milestones](diagrams/mvp-development.svg)

[Mermaid source](diagrams/mvp-development.mmd) · [Editable Excalidraw file](diagrams/mvp-development.excalidraw) · [PNG](diagrams/mvp-development.png)

The description and diagram use short sentences and direct instructions from the ASD-STE100 writing rules. [ASD-STE100 Issue 9](https://www.asd-ste100.org/assets/files/ASD-STE100_ISSUE9.pdf)
