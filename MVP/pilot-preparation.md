# Koverr pilot preparation

## Source decision

Checked on 23 November 2026. Use the assisted audit in the United Kingdom. The user checks the source in their browser. Koverr records the result. The search API allowance is zero. Stop if a source asks for payment, blocks access, or has no free searches left.

Brave lists five US dollars in monthly Search API credit. A payment card is required. Prepaid usage stops when the balance reaches zero and auto-reload is off. An older postpaid account can incur overage charges. Brave restricts storage of API results and describes a query retention period of up to 90 days. Koverr has no approved account for automated use. [Pricing](https://api-dashboard.search.brave.com/documentation/pricing) · [Account and storage rules](https://api-dashboard.search.brave.com/documentation/resources/help-feedback) · [API privacy notice](https://api-dashboard.search.brave.com/documentation/resources/privacy-notice)

| Test | Result |
| --- | --- |
| Public result | An indexed search for the British Broadcasting Corporation on 192.com found a public company listing. This test used a public organization. [Listing](https://www.192.com/atoz/financial/business/RC000057/) |
| Empty result | The test query `"Koverr Fallowmere Test QZ73928" "Wrenhaven"` found no results in the test index. The terms are fictional. |
| Failed check | The test browser could not open the indexed listing URL. Record the page check as inconclusive. The indexed result does not show that the page is still available. |

| Route | What to check |
| --- | --- |
| 192.com | Send the form for each relevant address. Confirm it in the email from 192.com. The site uses a suppression list. [Official form](https://www.192.com/c01/new-request/) |
| ukphonebook.com | Use the free residential directory. The provider allows five free searches a day. Complete the removal form manually. [Directory](https://www.ukphonebook.com/residential-telephone-directory) · [Official form](https://www.ukphonebook.com/remove-me) |
| Google Search | Check the eligibility rules. An approved request can remove a result from the index. The original page can stay online. [Results about you](https://support.google.com/websearch/answer/12719076?hl=en-GB) |
| Experian UK | Select a direct marketing opt-out. The route applies to marketing data. [Opt-out options](https://www.experian.co.uk/privacy/consumer-information-portal/opt-out-options/) |
| Open electoral register | Ask the electoral registration office to remove the listing from the open register. The full electoral register has separate rules. [GOV.UK instructions](https://www.gov.uk/electoral-register/opt-out-of-the-open-register) |

## Draft invitation for the assisted pilot

Use this draft after the controlled mailbox test passes. Get approval for each recipient and for sending the invitation.

**Subject**

Try the Koverr UK exposure audit

**Message**

Hi [first name],

I am inviting you to try Koverr's free UK exposure audit. I can help you check a short list of public websites and find the official steps to remove a listing.

Open [pilot address]. Enter your invited email address, then enter the six-digit code. You choose the sites to check and submit any requests yourself. Koverr can keep a record of the requests and what happens next.

Reply if you want to arrange an assisted session. Keep your password and sign-in codes private.

Thanks,

Adrian

## Draft authority for the paid Cleanup review

Review this text with the solicitor before you use it to collect authority. Use the [build plan](../docs/07-validation-and-build-plan.md) for the other paid launch checks.

> I authorize [Koverr legal entity] to send the requests I approve to the organizations I select. This authority applies to the request, organization, and account shown on each approval screen. Koverr can receive replies about those requests and tell me what action I must take. I can withdraw my authority in my account or by contacting [contact address]. After I withdraw it, Koverr must stop pending sends. I understand that an organization may ask me to confirm my identity.

For each approval, record the customer, organization, request, time, and authority version. Ask the solicitor to confirm the authority end date, the evidence to share with an organization, and what to do with replies to requests that Koverr already sent.

## Draft requests for the paid Cleanup review

Use a verified support address or form. Use the customer’s approved details only. Ask the solicitor to confirm the legal basis, deadline, and required evidence for each request type before use. These drafts are review material.

**Opening for a request from Koverr**

> Hello [organization] team,
>
> I am writing for [customer name]. The customer approved this request. [Approved authority reference]. Please use [minimum approved account identifier] to find the record.

| Request | Draft text |
| --- | --- |
| Close an account | Please close the account. Tell us if the customer must complete any steps in the account settings. Confirm when you close the account. |
| Erase personal data | Please erase the personal data in [approved scope]. Tell us which data you erase and which data you keep. Explain why you keep that data. |
| Access personal data | Please send a copy of the personal data in [approved scope]. Tell us where you obtained the data and who received it. |
| Stop direct marketing | Please stop using [approved identifier] for direct marketing. Confirm when you complete this request. |

**Reply instructions**

> Please reply through [approved reply channel]. If you need the customer to confirm their identity, tell us which information you need and how the customer can send it securely.

If the official guide gives the customer a self-service route, show that route first. During the paid beta, the founder reviews each request before sending it and records the result and time spent.

## Run one assisted session

1. Confirm that the participant agreed to join. Send the sign-in instructions to the approved address.
2. Ask the participant to sign in and check their own information. Observe the steps if they agree.
3. Ask the participant to record each source result. Record blocked and paid sources as coverage gaps.
4. Ask the participant to confirm a match only when they can identify the listing as theirs.
5. If the participant wants removal, open the official instructions. Let the participant send and record the request.
6. Enter the participant and founder time totals. Arrange a follow-up date for the case if needed.
7. At follow-up, record the reply and public recheck. Record an inconclusive recheck when the source could not be checked.

Keep emails, screenshots, codes, and search terms out of the pilot notes. Collect only the in-app result and the time totals. The participant can export and delete their app data.

## Review the results

1. Set the invitation window in [the aggregate report](supabase/reports/exposure-pilot.sql). Use the UTC times that contain only the approved participant group.
2. Save the aggregate result before the first audit expires. Keep separate snapshots for the end of the sessions and the follow-up date.
3. Record how many participants were invited, verified their email, and started an audit.
4. Review how many quick audits recorded both sources. Compare that number with the number that completed both checks.
5. Count confirmed findings, submissions, replies, rechecks, and founder time. A submitted request does not prove that a provider removed a listing.
6. Review the evidence for the three gates in the [development plan](../docs/07-validation-and-build-plan.md). Record the decision and its reason.

If the report has zero participants, record that the pilot has no evidence. Keep paid Cleanup on hold until the review can use real outcomes.
