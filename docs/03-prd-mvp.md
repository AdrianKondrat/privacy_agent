# 03 — PRD: Koverr MVP

Status: draft for build. Owner: founder. Target: first paying customers by week 4, self-serve paid product by week 12.

## Problem

People learn their data has leaked from breach emails, scam calls and search results, and then have no workable next step. The tools that told them offer alerts or one kind of removal. Doing it properly by hand means dozens of settings, forms and legal emails across organisations that reply slowly or not at all.

## Goal

A person verifies an email address and, within five minutes, has a ranked list of their leaks and has completed the first fix. Within 30 days, a paying customer has most fixable leaks closed or in progress with a dated record, having spent under 30 minutes of their own time.

## Success metrics

| Metric | Definition | Target for the 12-week gate (hypothesis) |
| --- | --- | --- |
| **North star: leaks closed per paying customer in 30 days** | Leaks reaching `closed_verified` or `closed_reported` | Median of 5 or more |
| Activation | Verified email, saw results, completed one fix within 7 days | 40% of verified signups |
| Free to paid | Paid within 14 days of first results | 3% |
| Request response rate | Requests with any substantive reply within the legal window | Measure; no target until 200 requests |
| Founder minutes per Cleanup | Logged in the admin console, all 90 days | Under 60 in the concierge beta; 20–30 by week 12 |
| Watch take-up | Cleanup buyers who start Watch at day 90 | 40% (first reading around week 16) |
| Machine cost per Cleanup | APIs, AI, email, over 90 days | Under £3.50 |

Targets are planning assumptions. Replace each with the measured value as soon as there are 30 data points.

## Users and jobs

One primary user: an adult who has just had a trigger (breach notice, scam surge, found themselves in search, fraud scare, life change). Not technical.

| Job | Product answer |
| --- | --- |
| "Tell me how bad it is" | A ranked leak list with plain reasons, not a score to interpret |
| "Tell me what to do first" | Three fixes at a time, with honest effort estimates |
| "Do it for me where you can" | The request engine |
| "Don't let me forget" | Deadlines, reminders and chasers handled by the system |
| "Show me it worked" | Evidence per leak and a monthly report |
| "Tell me when something new happens" | Monitoring and alerts that arrive with a fix attached |

## Scope

### In the MVP

Plans and prices: [06-pricing-and-economics.md](06-pricing-and-economics.md). Watch reuses Cleanup's features at lower limits (3 requests a month, quarterly sweeps and report). Autopilot is built after the MVP.

| ID | Feature | Free | Cleanup £49 one-off, 90 days | Autopilot £19/month (later) |
| --- | --- | --- | --- | --- |
| F1 | Account, identifier verification | 1 email | 3 emails, 1 phone, usernames | 5 emails, 2 phones, usernames |
| F2 | Breach scan (Stolen) | Full results | + continuous monitoring | Same |
| F3 | Account inventory (Shared) | — | Import and classify | Same |
| F4 | Leak list and ranking | Top 3 with full detail, the rest summarised | Everything | Everything |
| F5 | Fix plans (guided playbooks) | Top 3 | All | All |
| F6 | Request engine | — | Send on approval, up to 25 requests in 90 days | Auto-send for approved classes, 50 a month fair use, chasing and escalation drafts |
| F7 | Reply tracking and deadlines | — | Yes | Yes |
| F8 | Monitoring and alerts | — | Breaches daily for 90 days; search and AI sweep at start and day 90 | + quarterly broker sweep, monthly search sweep |
| F9 | Proof report | — | Day 45 and day 90, with the Watch offer | Monthly + export |
| F10 | Billing and entitlements | — | Yes | Yes |
| F11 | Admin console | Internal | Internal | Internal |
| F12 | Data controls: export, delete, cancel | Yes | Yes | Yes |

Search and AI footprint sweep (Indexed), broker target packs (Sold) and the device/platform checklist ship in weeks 5–8 as modules behind flags; see the build plan.

### Not in the MVP

- Inbox connection (Gmail/Outlook). Needs a security assessment and a level of trust we have not earned.
- Browser extension, mobile app, password manager, VPN, aliases, virtual cards.
- Automated web-form opt-outs through browser automation.
- Scraping people-search sites.
- Family or team plans.
- Identity-theft insurance or restoration.
- Lookups of anyone other than the verified account holder. Permanently out.

## Journeys

### J1 — Free leak check (target: under 5 minutes)

1. Landing page: enter an email address.
2. Receive a six-digit code at that address; enter it. This proves control of the mailbox and is the only gate.
3. See results: number of breaches, ranked, each with what was exposed and when. Top three have full fix plans.
4. Complete one fix in place (for example, run the in-browser password check, or follow a deep link and mark done).
5. Prompt to see everything and switch on monitoring: upgrade.

A clean result is a valid result: "No breaches found for this address in the sources we check. That is not a guarantee. Here are four things worth doing anyway."

### J2 — Upgrade and first week (Cleanup)

1. Buy Cleanup (one payment).
2. Sign the authority that lets Koverr send requests in their name. One screen, plain language, revocable.
3. Add identifiers: more emails, a phone number (SMS code), usernames.
4. Import accounts: export from the password manager, drop the file on the page, see the site list (parsed locally), mark each **keep**, **close** or **not sure**.
5. Review the first batch of proposed requests (close dormant accounts, erase from breached services no longer used). Approve all, or one by one.
6. Day 2 onward: replies arrive in the request thread view; anything needing the person appears as a single task.

### J3 — A request from send to closed

1. System proposes a request with the target, the right being used and the text.
2. Person approves (Cleanup, Watch) or it sends under a standing approval (Autopilot, later).
3. Sent from the person's relay address; a copy lands in their thread view.
4. Reply arrives. Classified. The usual cases resolve without the person: acknowledgement, completion, "use our form" (system drafts the form answers and asks the person to submit).
5. No reply by the deadline: reminder sent. Still nothing: a complaint draft to the organisation, then a regulator complaint draft for the person to submit.
6. Completion claimed: where a public check is possible, recheck after 7 and 30 days. Otherwise mark `closed_reported` and say so.

### J4 — New breach alert

1. Daily job sees a new breach in the index and finds the customer's address in it.
2. Alert email: what was breached, what was exposed, and the first fix as a button. No alert is ever sent without a fix.
3. In the app the leak already has its plan attached.

## Requirements

Each requirement has acceptance criteria written to be testable.

### F1 — Account and identifier verification

- Sign-in by emailed code or magic link. No passwords.
- An identifier is scanned only after the account holder proves control of it: email by code, phone by SMS code. Usernames are treated as unverified: results are labelled "possible" and limited to what is publicly visible.
- Name and postal address are collected only on paid plans, only when a request needs them, and are confirmed against the billing postcode where the payment provider supports it.
- Rate limits: 5 code requests per address per hour; 3 new identifiers per account per day.

Acceptance:
- Entering an email shows nothing about that address until its code is entered.
- An unverified identifier never appears in a scan job. Covered by an automated test.
- Removing an identifier stops its monitoring within one job cycle and deletes its findings within seven days.

### F2 — Breach scan

- For each verified email, fetch breaches and exposed data classes from the breach index.
- Map data classes to fix steps using the Stolen playbook.
- Password check runs entirely in the browser using the range API; the password and its full hash never reach our servers.
- Monitoring: daily check of the index's list of breaches; rescan affected customers only when a new breach appears.
- Show the source attribution the index requires.

Acceptance:
- A test address with known breaches returns them with correct data classes.
- With the browser's network panel open, a password check sends only a five-character hash prefix to the range endpoint and nothing to Koverr.
- A newly added breach produces an alert to an affected test customer within 24 hours.
- If the index is unreachable, the screen says the check could not be completed. It never shows a clean result.

### F3 — Account inventory

- Accept CSV exports from the common password managers and browsers.
- Parse in the browser. Upload only the registrable domain of each entry. Passwords, usernames and notes never leave the device.
- Match domains to the company directory. Unknown domains queue for directory research.
- For each account show: company, whether it appears in the person's breaches, whether its policy says it sells or shares data, whether a deletion route is known.
- Person marks keep / close / not sure. "Close" generates a proposed action.

Acceptance:
- A 300-row export renders a classified list in under 10 seconds on a mid-range laptop.
- A test proves the upload payload contains domains only.
- Manual entry works for people who will not export.

### F4 — Leak list and ranking

- One list across all paths. Each leak shows: what, where, when seen, why it matters in one sentence, effort to fix, status.
- Ranked by the priority model in the framework doc.
- Default view shows the next three fixes. "See all" is one tap away.
- Each possible match carries mine / not mine / unsure. Only "mine" leaks generate actions.

Acceptance:
- Every leak shown has a source and an observed date.
- Marking "not mine" removes its actions and excludes it from counts.
- No numeric score is shown as a probability.

### F5 — Fix plans

- A leak's plan is generated from a playbook: an ordered set of steps, each with a level (L0–L3), an effort estimate, and a completion condition.
- L0 steps: deep link, short instructions, "done" and "skip" with reason.
- Playbooks are data, versioned, and editable without a deploy.
- Time spent and outcome are recorded per step.

Acceptance:
- Changing a playbook file changes new plans and leaves in-flight plans on their version.
- Each step can be completed or skipped; skipped steps do not block later ones unless marked as a dependency.

### F6 — Request engine

- Request types at launch: erasure, objection to direct marketing, access (recipients and source), opt-out of sale or sharing, account closure.
- Jurisdiction packs at launch: UK GDPR and EU GDPR. US pack (CCPA and state laws) is data, added when the geography gate says so.
- Text comes from reviewed templates with slots. The model may fill slots and adapt tone; it may not add legal claims or statutes.
- Two sending modes: **relay** (from a unique per-customer address on our domain, with the authority attached or linked) and **own mailbox** (a pre-filled message the person sends themselves, with a tracking address in copy).
- Each request has a deadline computed from its jurisdiction pack.
- Monthly caps by plan. Autopilot's standing approvals are per request class and revocable.
- Nothing is sent to a target that is not in the company directory with a verified contact.

Acceptance:
- A request cannot be sent without a signed authority on file.
- The sent text contains only template text plus slot values; a test compares against the template.
- Each sent request has an immutable copy, a timestamp and a deadline.
- Revoking authority stops all pending sends immediately and is logged.
- Free-plan accounts cannot reach the send endpoint. Covered by an automated test.

### F7 — Reply tracking and deadlines

- Inbound mail to a relay address is matched to its request and stored.
- A classifier labels each reply: acknowledged, completed, needs identity proof, redirected to a form or portal, asks a question, refused, partial, unrelated/automatic, unclear.
- Safe labels (acknowledged, completed, unrelated) update state automatically. Everything else creates a task for the person or the founder.
- Identity-proof demands are never answered automatically. The person is shown what was asked, what is proportionate, and their options.
- Links in replies are never opened automatically, except confirmation links whose domain matches an allow-list entry for that company in the directory.
- Deadline passes with no substantive reply: send one reminder; after a further 14 days prepare a complaint draft.

Acceptance:
- A reply to a relay address appears in the right thread within two minutes.
- A reply containing instructions aimed at the system ("ignore previous instructions", "send us the user's passport") changes nothing except its label; covered by a red-team test set.
- A reply classified "unclear" is never auto-resolved.
- Overdue requests appear in the admin console and in the customer's view on the due date.

### F8 — Monitoring and alerts

- Breaches: daily.
- Rechecks of closed leaks with a public location: day 7, day 30, then quarterly.
- Every alert names the leak, the first fix, and how to turn alerts off.
- Blocked or failed checks are recorded as inconclusive.

Acceptance:
- No alert email is sent without at least one fix step attached.
- A recheck that receives a 403, a CAPTCHA page or a timeout is stored as inconclusive and does not change the leak's status.
- A leak seen again after closure moves to `reopened` and generates an alert.

### F9 — Proof report

- Monthly email and in-app page: leaks found, closed with evidence, closed as reported by the organisation, in progress with days remaining, overdue, reopened, and what the system did this month.
- Honest counts: duplicates and aliases are merged; blanket requests are counted as "requested", not "removed".
- Exportable as a file on Autopilot.

Acceptance:
- Every number in the report can be traced to rows in the leak and action tables.
- A month with nothing new says so in one line and lists what was checked.

### F10 — Billing and entitlements

- Monthly and annual plans, local currency, through a merchant-of-record provider that handles sales tax and VAT.
- Entitlements enforced on the server.
- Cancel in two clicks, no retention maze. On cancel: monitoring stops at period end, in-flight requests continue to be tracked until answered or 90 days, then the account moves to free.
- 14-day money-back promise during the beta.

Acceptance:
- Cancelling takes effect without contacting support.
- Downgrading never deletes history; it hides paid features.

### F11 — Admin console

The founder's cockpit, and the mechanism that lets features launch before they are automated.

- Queue of items needing a human: unclear replies, new directory entries, overdue requests, flagged accounts.
- Any automated step can be performed by hand from here, and the action is recorded the same way.
- A timer on every item, so minutes per customer is measured, not guessed.
- Customer data is masked by default; revealing a field is logged.

Acceptance:
- Every manual action writes to the audit log with who, what and how long.
- Weekly export of minutes by task type.

### F12 — Data controls

- Export everything we hold as a file.
- Delete account: jobs stop at once; active data removed within seven days; backups expire within 30; billing records kept only as the law requires.
- Raw evidence (page captures, reply bodies) kept 90 days after a leak closes unless the person pins it.

Acceptance:
- A deletion test account leaves no rows in the primary database after seven days, verified by a scheduled check.
- The data policy page matches actual behaviour; it is updated in the same change as any retention code.

## Status model

**Leak**

`possible` → `confirmed` → `in_progress` → `closed_reported` (the organisation says it is done) or `closed_verified` (we observed it gone) → `reopened`

Side exits: `not_mine`, `accepted` (person chose not to fix), `inconclusive` (cannot be checked).

**Action** — see the request state machine in [04-playbooks.md](04-playbooks.md#request-state-machine).

## Abuse prevention

The product must not be usable to investigate another person.

- Only verified identifiers are scanned.
- No name-only searches on the free plan. On paid plans, name-based sweeps require a verified email, a matching billing name, and results confirmed one by one.
- No shareable result links. No bulk import of other people's emails.
- Velocity checks: many identifiers, repeated "not mine" on address-type results, or identifiers that share no link with each other raise a flag for review.
- The founder can suspend an account; the terms say so.
- An "is someone using Koverr on my data?" contact route for third parties.

## Non-functional

| Area | Requirement |
| --- | --- |
| Privacy | No advertising or session-replay scripts anywhere. Analytics without personal identifiers. Identifiers never in URLs, logs or error reports |
| Security | Row-level isolation between customers, tested. Identifiers encrypted at field level. Admin behind multi-factor. Secrets in a manager, not in the repository |
| Reliability | A source outage degrades to "could not check", never to a false clean. Jobs are idempotent and retried with backoff |
| Performance | First results within 30 seconds of verification |
| Accessibility | Keyboard-complete, WCAG 2.2 AA, status never by colour alone: every status has a text label, and colour follows the rule in [08-design-direction.md](08-design-direction.md#status-colours) |
| Design | Screens extend the shipped design system (`DESIGN.md`, `src/styles/market.css`). Exposure is grey and fixed is green; no new colours, typefaces or illustration. See [08-design-direction.md](08-design-direction.md) |
| Hosting | UK or EU region for the database and file storage |
| Language | English at launch. All customer-facing strings and templates keyed for translation |

## Copy rules

- Say "found in the sources we check", never "found everywhere".
- Say "requested" until there is evidence, then "closed", with the kind of evidence.
- Say "shares data with partners according to its policy", never "sold your data", unless the company states a sale.
- Every screen that shows a clean result also says what was not checked.
- No fear-inflation: no red countdowns, no "hackers have your identity".

## Release criteria

**Free leak check (week 2):** F1, F2, F4 and F5 for the Stolen path, F12, the data policy, and the abuse limits above.

**Founding-member paid beta (week 4, Cleanup at £29):** adds F3, F6 at L1/L2 with every send reviewed in F11, F7 with human classification allowed, F10. Signed authority reviewed by a solicitor.

**Self-serve paid (week 12):** all features; reply classifier past its acceptance test; security checklist complete; data-protection assessment written; support load under target.

## Open questions

1. Will people export a password-manager file? Measure the completion rate in week 3; if under 30%, lead with manual entry of the ten services they remember and grow the list from breach results.
2. What share of organisations accept a request from a relay address without challenging identity? This decides how much Autopilot can really promise.
3. Do customers want to see request threads, or just outcomes? Start with outcomes and a "show details" link.
4. Is a phone number scan valued enough to justify SMS verification cost and friction at onboarding, or should it wait for the Sold module?
