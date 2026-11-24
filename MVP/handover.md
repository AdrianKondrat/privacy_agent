# Koverr MVP handover

Updated 24 November 2026. Use the `MVP/` folder on the `MVP` branch of `AdrianKondrat/privacy_agent`. Read the [development plan](../docs/07-validation-and-build-plan.md) before you continue.

## What the MVP does

1. The user signs in with an email code. Supabase verifies the address.
2. The user selects the United Kingdom. They can select the types of information to check.
3. The free audit gives instructions for 192.com and ukphonebook.com. The deeper audit adds Google Search.
4. The user checks each site. Koverr records the result, date, and coverage gaps. Search terms go directly to the site.
5. The user reviews possible matches. Koverr gives the official removal step for a confirmed match.
6. The user submits the request on the official site. They record the submission date in Koverr.
7. The case history shows replies, follow-up dates, and public rechecks. Failed rechecks stay inconclusive.
8. The user can export their account data or delete the account. The audit expires after 90 days.

The deeper audit also covers Experian marketing suppression and the open electoral register opt-out. Each optional route shows Holding not confirmed.

## Private deployment

- The [invite-only audit](https://koverr-mvp.uceiond.workers.dev/app/audit/) runs on the existing `koverr-mvp` Worker.
- The deployed Worker version is `b9a71794-7776-4f61-b5b8-4ecb7aa93733`. The release uses the `MVP` branch build.
- Automatic builds from the earlier repository are off. Release from the `MVP` branch with Wrangler. [Deployment instructions](deploy/live-pilot.md)
- Supabase has the audit table and the owner access rule. The hourly expiry job first ran successfully at 10:15 GMT. It found zero expired rows.
- Cloudflare stores the publishable key and dedicated server secret. The audit has zero paid search calls.

## Verification and pilot results

- All 35 automated tests passed. Astro diagnostics, the Worker build, the Node build, and the static sample build passed.
- The live HTTPS check passed. It checked the audit form, health route, redirects, fictional sample, and landing signup isolation.
- The deployed Worker rejected an uninvited fictional address through the live Supabase gate. The test sent no email.
- The compiled Worker passed sign-in, audit write, export, and deletion with synthetic data. Real email delivery and signed-in checks are pending.
- The real report returned zero invites, verified accounts, and audits at 10:06 GMT. It contains no participant outcomes. Paid Cleanup stays on hold.

## Next three milestones

1. **Verify one mailbox.** Get approval for a mailbox. Check live email delivery, sign-in, export, and deletion.
2. **Run the assisted pilot.** Get approval for the participants and invitations. Record their check results, removal outcomes, and founder time.
3. **Review the pilot results.** Run the report for the approved group. Review coverage, submissions, replies, rechecks, and time. Decide if paid Cleanup is ready.

[Aggregate pilot report](supabase/reports/exposure-pilot.sql) · [Assisted session and review instructions](pilot-preparation.md) · [Deployment instructions](deploy/live-pilot.md)

## Development diagram

[Full MVP workflow and blocker guide](mvp-workflow.md)

![Koverr MVP deployment and the next three milestones](diagrams/mvp-development.svg)

[Mermaid source](diagrams/mvp-development.mmd) · [Editable Excalidraw file](diagrams/mvp-development.excalidraw) · [PNG](diagrams/mvp-development.png)

The description and diagram use short sentences and direct instructions from the ASD-STE100 writing rules. [ASD-STE100 Issue 9](https://www.asd-ste100.org/assets/files/ASD-STE100_ISSUE9.pdf)
