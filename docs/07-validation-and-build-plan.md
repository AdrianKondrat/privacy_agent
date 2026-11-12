# 07 — Validation and build plan

Twelve weeks from today (11 November 2026) to a self-serve paid product, with four gates where the plan can be narrowed or stopped. Planned on about 20 hours a week of build time plus the 3–4 hours a week already set aside for marketing. With fewer hours, stretch the calendar and keep the order.

## The questions, in the order they can kill the business

| # | Question | Answered by | When |
| --- | --- | --- | --- |
| 1 | Does the "leak fixer" message pull better than what is live now, and for which trigger? | E0, E1 | Week 0–2 |
| 2 | Will people act on a fix when it is put in front of them? | E2 | Week 2 |
| 3 | Will anyone pay for fixes to be done for them? | E3, E4 | Week 3–4 |
| 4 | Do organisations actually respond to requests sent this way? | E6 | Week 4–8 |
| 5 | Can one person serve a customer in minutes, not hours? | Admin console timers | Week 4 onward |
| 6 | Do customers stay after the first cleanup? | Cohort retention | Month 2, then month 4 |
| 7 | Can customers be acquired for less than they are worth? | Channel tests | Week 9 onward |

Questions 3 and 6 are the ones the earlier plan could not answer either. Everything else is in service of reaching them quickly.

## Experiments

| ID | Hypothesis | Build | Metric | Pass |
| --- | --- | --- | --- | --- |
| **E0** Message | A trigger-led headline beats the current category headline | Three landing variants on campaign links: breach email / scam calls / home address | Signup or check-start rate per variant, at least 200 visitors each | One variant at least 1.5× the current page |
| **E1** Worry and country | We do not know which trigger or market dominates | Two one-tap questions after signup | Distribution | Decides front-door copy and the first jurisdiction pack. US share above 50% flips geography |
| **E2** Fix activation | People shown a specific fix will do it | Free leak check | Share of verified users completing one fix within 7 days | 40% |
| **E3** Price intent | There is intent at £49 one-off, and it beats a monthly subscription | One-tap plan picker after results: £49 once / £12 a month / not now | Share choosing a paid option; one-off versus monthly split | 10% or more choose a paid option |
| **E4** Founding offer | Some will pay before the product is finished | Payment link for Cleanup at £29 plus three months of Watch free, concierge delivery | Purchases from the first 100 people asked | 10 |
| **E5** Inventory | People will export their password manager if parsing is local | Import screen | Completion among those who start | 30%; otherwise lead with manual entry |
| **E6** Request acceptance | Organisations respond to authorised requests | Engine at L2 with every send reviewed | Substantive reply inside the legal window; identity challenge rate; relay versus own-mailbox | Measure first; no automation promise until 200 requests |
| **E7** Retention driver | The day-90 proof report sells Watch | Watch offer with the final Cleanup report | Share of Cleanup buyers taking Watch; Watch month-4 retention | 40% take Watch |

Run them in this order. Each needs only what the previous one built.

## Twelve weeks

### Week 0 — this week (2–3 days of work)

- Reposition the landing page copy: trigger-led headlines as variants, six-path labels, a sample closed leak. Done on 12 November 2026, together with the move to the black-and-white design in [08-design-direction.md](08-design-direction.md). The cartoon artwork no longer exists; do not restore it.
- Add the two post-signup questions (country, biggest worry). Extend the signup record; bump the consent version.
- Set up the requests mail subdomain now so it has weeks of quiet history before real sending.
- Subscribe to the breach index (entry tier).
- Ask a solicitor for a fixed quote to review: the authority, the terms, and four request templates.
- Start the ICO registration and a one-page data-protection assessment.
- List 30 people to ask personally for the concierge beta.

### Weeks 1–2 — Free leak check

Build: Postgres with row-level security; import the launch list; sign-in by emailed code; breach adapter; Stolen playbook as data; leak list and fix-plan screens; in-browser password check; plan picker (E3); account export and deletion; data policy page; internal events.

Ship to the launch list first, then publicly.

**Gate G1 (end of week 2)**

| Signal | Continue | Rework |
| --- | --- | --- |
| Completed checks | 100 or more | Under 50: distribution problem; spend a week on audience before building more |
| Fix activation | 40% or more | Under 20%: the plans are not usable; fix them before adding the engine |
| Paid intent (E3) | 10% or more | Under 5%: revisit the promise with 10 conversations |

### Weeks 3–4 — Paid concierge beta

Build: signed authority; account inventory import; company directory seeded with the few hundred most common services; request composer with template check; relay sending; inbound capture; admin console with queue, manual twin and timers; payment link for the founding offer.

Run: sell the founding offer to 10–20 people. Review every outgoing request and label every reply by hand. Log minutes.

**Gate G2 (end of week 4)**

| Signal | Continue | Stop and rethink |
| --- | --- | --- |
| Founding purchases | 10 or more | Fewer than 5 from 100 asked: stop building; run 15 interviews; change the offer or audience |
| Requests sent per customer in week one | Median 5 or more | Under 2: the inventory or approval step is the blocker |
| Founder time per customer in week one | Under 60 minutes | Over 120: scope each customer down before taking more; if the 90-day total heads past 60 minutes, raise Cleanup to £79 |

### Weeks 5–8 — Assisted

Build, in this order: deadlines and reminders; reply classifier in shadow mode (it predicts, the founder labels, compare); tracking shut-off checklist; search and AI footprint sweep; monthly proof report; the first target pack for the geography E1 chose; proper billing and entitlements.

Run: grow to 25–40 paying customers. Collect at least 150 labelled replies for the classifier test. Record relay versus own-mailbox outcomes per company.

**Gate G3 (end of week 8)**

| Signal | Continue | Adjust |
| --- | --- | --- |
| Paying customers | 25 or more | Under 15: acquisition is the constraint; pause features for two weeks of distribution |
| Leaks closed or reported per customer in 30 days | Median 5 or more | Under 3: narrow to the playbooks that close |
| Founder minutes per Cleanup so far (first cohort) | On track for 60 or fewer over 90 days | Heading past 90: no new customers until the top two task types are assisted |
| Proof report shown at day 45 to the first cohort | Median 5 or more leaks closed or reported | Under 3: interview those customers before week 9; check the outcome promise is affordable |
| Classifier on safe labels | 95% agreement, zero dangerous mislabels | Stay in shadow mode |

### Weeks 9–12 — Self-serve Cleanup and Watch

Build: self-serve checkout and onboarding for Cleanup; the Watch offer attached to the day-90 report; Autopilot standing approvals built and tested internally for the request classes that passed in weeks 5–8, but not sold yet; quarterly sweep scheduling; referral link; public pricing page; security checklist; published list of sources and targets.

Run: open signups. Start two acquisition tests from the Notion marketing lab with the new message. Pricing experiments P3 and P4.

**Gate G4 (end of week 12)**

| Signal | Scale | Hold |
| --- | --- | --- |
| Cleanups sold | 50 or more | Under 30 |
| Free check → Cleanup, self-serve | 3% or more | Under 1.5% |
| Founder minutes per Cleanup, 90 days in total | 20–30 or fewer | Over 60 |
| One channel under the acquisition ceiling | Yes | No |
| Open privacy or security defects | None material | Any |

"Scale" means: continue, and plan the next quarter around the day-90 Watch reading. "Hold" means: no new features; fix the failing signal.

### After week 12 — the retention reading

Around week 16 the founding cohort reaches day 90 and gets the Watch offer. This is the test of the central bet. Month-4 Watch retention follows around week 32.

| Cleanup buyers taking Watch at day 90 | Meaning | Move |
| --- | --- | --- |
| 40% or more | Recurrence is real | Spend on acquisition up to the ceiling; add the second jurisdiction pack; plan Autopilot once Watch month-4 retention is 50% or better |
| 20–40% | Partly episodic | Strengthen monitoring and the report; test annual Watch as the default; keep Autopilot on hold |
| Under 20% | Episodic | Run as a cleanup business: offer a repeat Cleanup at 12 months instead of a subscription; the Watch revenue lines in 06 no longer apply |

## What to build first inside each week

When time is short, the order of sacrifice is fixed. Never cut: verification of identifiers, the template check on outgoing requests, deletion, honest status labels (text label on every status, green only for a fix). Cut first: visual polish beyond the shipped system, the plan picker's design, report formatting, any second sending mode.

## Risk register

| Risk | Likelihood | Impact | Early warning | Response |
| --- | --- | --- | --- | --- |
| People like the free check and do not pay | High | Fatal | E3 under 5%; E4 under 5 sales | Change what paid means before building more of it |
| Need is episodic | Medium | High | Day-90 Watch take-up; Watch month-4 retention | Priced for it: Cleanup is one-off; repeat Cleanup at 12 months if Watch fails |
| Organisations ignore or challenge relay requests | Medium | High | E6 reply and challenge rates | Default to own-mailbox for account holders; publish honest rates; narrow Autopilot's promise |
| Founder time per customer too high | High | High | Console timers | Assisted stage for the top task types before adding customers |
| A wrong or harmful message is sent | Low | High | Template check failures; complaints | Human review of every send until the check has passed 500 times without a miss |
| Misuse to investigate someone else | Low | Severe | Velocity flags | Verified identifiers only; suspend; third-party contact route |
| Security incident | Low | Severe | — | Minimal data; field encryption; incident plan written before paid launch |
| Breach index or search API changes terms or price | Medium | Medium | Provider notices | Adapters make each replaceable; keep a second option evaluated |
| A larger competitor adds cross-path fixing | Medium | Medium | Their release notes | Speed, the directory, published outcomes, a narrower promise done better |
| Legal challenge to acting as an agent | Low | High | Solicitor's review | Signed authority; conservative templates; L1 fallback where the law is unclear |

## Compliance checklist

Product-planning list, not legal advice. Items marked * need a professional's sign-off.

Before the free check goes public:
- ICO registration.
- Privacy notice that matches behaviour; list of processors.
- Deletion and export working and tested.
- Breach index attribution and terms respected.
- No trackers on the site.

Before the first paid customer:
- Customer authority to act as agent *.
- Terms of service, including refunds, cancellation, acceptable use and suspension *.
- Request templates for the launch jurisdiction pack *.
- Data-protection impact assessment written.
- Tax handling confirmed with an accountant (the merchant-of-record route is designed to cover VAT and sales tax, but confirm for your entity).
- Subscription rules for consumers in the markets served: clear pre-contract information, easy cancellation, renewal reminders *.

Before Autopilot sends unattended:
- Classifier and template tests passed and recorded.
- Standing-approval wording reviewed *.
- Incident procedure and a named contact.
- Complaints route published.

Before adding the US pack:
- Authorised-agent requirements under CCPA and the other state laws customers fall under *.
- Whether the business meets any state's registration thresholds *.

## How the existing marketing plan fits

The 12-week marketing lab in Notion (page 09) keeps its structure: content, founder communities and referral partners first, then pick a lead channel. Change the message and the call to action:

- Content pillars map to the six paths. The reels already drafted (advertiser labels, soldiers' data for sale, app tracking, the four ways brokers collect) are Sold and Shared stories; add Stolen ("what to do in the ten minutes after a breach email") because it is the front door.
- Every piece ends with the free leak check instead of a waitlist.
- Partners change from accountants and formation agents to people with an audience at a trigger moment: security newsletters, fraud-victim communities, moving and home-buying services, creators who cover scams.

## The first five things to do

1. Add country and biggest-worry questions to the signup flow and put the three trigger headlines live as variants.
2. Subscribe to the breach index and build the free leak check.
3. Get the solicitor's quote for the authority, terms and templates.
4. Write down 30 names for the concierge beta and message the first ten.
5. Create the admin console's timer before the first customer, so cost-to-serve is measured from customer one.
