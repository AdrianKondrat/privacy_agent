# Koverr pilot readiness review

Checked on 24 November 2026. The invite-only app is live. The table shows the status of the four actions in the [MVP workflow](mvp-workflow.md).

| Action | Status | Next input |
| --- | --- | --- |
| Approve the test mailbox | Waiting | Provide a separate address and approve one live sign-in code. |
| Approve participants and invitations | One address recorded in the private shortlist. The invitation draft is ready. | Approve sending to that address after the test passes. Add further participants if you want a larger group. |
| Check pilot limits and privacy | Cloudflare and Supabase checks are complete. Custom SMTP is enabled. The privacy review found gaps. | Confirm Resend usage. Confirm the privacy details and the ICO fee outcome. |
| Draft the landing page update | Complete. The copy is ready for review. | Approve the copy before the next group opens. [Landing draft](landing-pilot-draft.md) |

## Service checks

| Service | What the dashboard showed | What to do |
| --- | --- | --- |
| Cloudflare Workers | The account showed 792 of 100,000 requests used that UTC day. | Use the existing Worker. Check the account limit again before adding a large group. [Cloudflare limits](https://developers.cloudflare.com/workers/platform/pricing/) |
| Supabase | The project was healthy. Free-plan usage showed 27 of 500 MB of database storage and 0 of 50,000 monthly active users. | Use the existing project. Check its status on the day of the pilot. [Supabase pricing](https://supabase.com/pricing) |
| Supabase Auth | Custom SMTP was on and used `smtp.resend.com`. Auth allows 30 emails per hour and a 60-second minimum interval per user. | Start with one test. Allow one resend if needed. Plan up to twelve code emails for one test mailbox and five participants with one retry each. [Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits) |
| Resend | The browser reached the login page. Current account usage and sender verification need an account check. The public Free plan lists 100 transactional emails a day and 3,000 a month. | Sign in to the existing account. Check transactional usage and confirm the sending domain shows Verified. Keep paid overages off. [Resend emails](https://resend.com/emails) · [Resend domains](https://resend.com/domains) · [Resend pricing](https://resend.com/pricing) |

Use the existing inbox for manual invitations. Reserve Resend for sign-in codes. The pilot target is £0 in additional service charges, within the existing plan limits.

## Privacy notice review

The published notice explains email verification, saved audit information, the 90-day audit expiry, and account export and deletion. It names Supabase and Resend. The instructions direct invited users to reply to their invitation. [Published notice](https://koverr-mvp.uceiond.workers.dev/app/privacy/)

Confirm these details before recruiting the participant group.

| Item | What you need to confirm |
| --- | --- |
| Controller and contact | Give the legal name of the person or organisation that runs Koverr. Give a monitored privacy address that users can reach without an invitation. |
| Use of personal data | Confirm the purposes and lawful basis for account operation, the audit, and pilot measurement. Check the retention period for roster entries, provider logs, and backups. |
| Providers and user rights | Confirm which providers receive data and whether any transfers need to be described. Add the route to exercise privacy rights and contact the ICO. |
| ICO fee | Complete the free self-assessment. Save the result. Follow the payment instructions if the fee applies. |

Use the confirmed details to update the app privacy notice. The draft below covers the contact section.

> Koverr is operated by [legal name]. Contact [monitored privacy email] if you have a question or want to exercise your data protection rights. You can also complain to the Information Commissioner’s Office. [Contact the ICO](https://ico.org.uk/make-a-complaint/)

[ICO right to be informed](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-be-informed/) · [ICO fee self-assessment](https://ico.org.uk/for-organisations/data-protection-fee/data-protection-fee-self-assessment/)

## Decisions for the next pass

1. **Approve the test mailbox** to unblock **Verify live sign-in and data controls**.
2. **Approve participants and invitations** and **Check pilot limits and privacy** to unblock **Run the assisted pilot** after the live test.
3. **Review the pilot evidence** before you open the next group or decide on paid Cleanup. Review the landing draft in parallel.

[Full dependency table](mvp-workflow.md#blocked-work) · [Pilot invitation draft](pilot-preparation.md#draft-invitation-for-the-assisted-pilot) · [Live test instructions](deploy/live-pilot.md#verify-one-controlled-account)
