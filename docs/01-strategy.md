# 01 — Strategy

## The market in four facts

1. **Detection has been given away.** Have I Been Pwned is free for individuals. Google's Results About You monitors contact details and, since February 2026, government ID numbers, at no charge in the US. Mozilla Monitor's free tier survives; its paid tier was discontinued. Nobody can charge for "we found your email in a breach" any more.
2. **Detection without a fix is worthless, and the biggest player said so.** Google stopped Dark Web Report scans on 15 January 2026 and removed the feature on 16 February, stating that feedback showed it "didn't provide helpful next steps". The alert industry trained people to receive bad news and do nothing with it.
3. **Broker removal is consolidating into a price war.** Surfshark owns Incogni and, since September 2026, a majority of Optery. Annualised prices sit around $8–13 a month. Competing on broker count against that group is a losing game for a solo founder.
4. **Regulators are starting to do broker deletion for free.** California's DROP has been open to residents since January 2026, and registered brokers have had to collect and process requests at least every 45 days since 1 August 2026. Expect other states to copy it. One removal path is being commoditised by law.

**Conclusion.** The defensible position is not "we find more" or "we cover more brokers". It is "we get more of it fixed, across more kinds of leak, with proof". The unit of value is a closed leak.

## What competitors sell, and the gap

Prices are third-party reports from October–November 2026. Verify before publishing comparisons.

| Player | What it does | Price signal | Paths covered | Gap |
| --- | --- | --- | --- | --- |
| Incogni | Automated deletion requests to brokers; UK/EU/US. Escalates unresolved cases to regulators; custom removals on Unlimited | About $8/month annual, about $16 monthly; Unlimited about $15 annual | Sold | Blanket requests, little evidence per leak, nothing for breaches, apps or accounts |
| Experian Identity Plus (UK) | Web monitoring and credit alerts | £10.99/month | Stolen (alerts) | Alerts with no fix; the UK price people already pay |
| Offlist, EasyOptOuts | Cheap broker removal; Offlist sells one-off passes | $7 pass to $60/year; $19.99/year | Sold | One path; show demand for paying once and a very low price floor |
| DeleteMe | Human-assisted people-search removal, mostly US | $129/year, annual only | Sold | US-centric, one path |
| Optery | Scan with screenshots, tiered removal, US | Free scan; $39–$249/year | Sold | One path, US only |
| Aura and identity suites | Monitoring, insurance, VPN, some removal | About $12/month | Stolen (alerts), Sold (partial) | Alerts and insurance rather than fixes |
| Kanary | Removal plus AI/LLM exposure | About $250/year | Sold, Indexed | Premium, narrow |
| Mine | Inbox-header scan lists companies holding your data, sends deletion requests | Free/consumer | Shared | Reported to stop at sending: no chasing, no verification |
| Permission Slip (Consumer Reports) | Free app sending requests under US state law, with follow-up | $0 | Shared, Sold | US only |
| Rightly | Free UK tool for sending GDPR requests | $0 | Shared | No visible activity since 2024; reviews cite blanket deletions that cost people loyalty points |
| HIBP, Results About You, DROP | Free detection or free single-path deletion | $0 | One each | No workflow, no cross-path view, no follow-through |

Read across the last column. Three things are missing almost everywhere:

- **Cross-path coverage.** A breach, a broker listing and a dormant account are treated by different products, when for the person they are one problem: "my details are out there".
- **Follow-through across paths.** Some services now chase within their own path (Incogni escalates broker cases; Permission Slip follows up in the US). Nobody tracks the legal clock for the breached company, the dormant account and the listing site together. Chasing is part of the product, not its headline: competitors can match it.
- **Proof.** "We sent 200 requests" is activity. "This listing was visible on 3 November and not observed on 4 December" is an outcome. This answers the category's biggest objection: Consumer Reports found paid people-search removal "largely ineffective" (0–58.7% removed in week one, against 70% for manual opt-outs).

Those three are the product. In the UK the field is thinner still: Optery, DuckDuckGo's removal feature, Permission Slip and DROP are US-only, DeleteMe's UK coverage is disputed, and Rightly appears dormant. Incogni is the only serious UK removal service.

## Who buys

One buyer, defined by a trigger rather than a demographic. The person has just had a moment that made exposure feel personal:

| Trigger | What they say | Front-door module |
| --- | --- | --- |
| Breach notice arrived | "I got another one of those emails. What am I actually supposed to do?" | Leak check (Stolen) |
| Scam and spam surge | "How did they get my number?" | Sold + Shared |
| Found themselves online | "My home address is on Google." | Indexed + Sold + Published |
| Fraud or account takeover scare | "Someone tried to log into my bank." | Stolen, urgent track |
| Life change | New public-facing job, moving house, a difficult ex, a child going online | Posted + Sold |

Adults, comfortable paying for software subscriptions, not security professionals. They do not want a dashboard to study. They want a short list of things to do, most of them done for them.

**Explicitly not served at launch:** active stalking or domestic-abuse emergencies, children's accounts, reputation management, removing news coverage, and corporate executive protection. The first two need safeguards a small beta cannot provide; signpost specialist help instead. Excluding them is a scope choice, not a judgement about importance.

**Why the director wedge is retired.** It was a sensible narrow test, but it tied the product to one country, one register and one fix, with a buyer who needs the job done once. The company-record workflow survives as a playbook inside the Published path for anyone who needs it.

## Positioning

**Category:** personal data leak fixer.

**One line:** Find where your personal data leaked. Fix it. Prove it stayed fixed.

**Against alert products:** "Every alert comes with a fix, and we stay on it until it's closed."

**Against removal services:** "Brokers are one of six ways your data gets out. We work all six." Also test "use it alongside Incogni": Incogni customers already pay for privacy and still feel exposed.

**Against "does it even work?":** a refund if fewer than five leaks are closed in 90 days, and a dated proof report. See [06-pricing-and-economics.md](06-pricing-and-economics.md#the-outcome-promise).

**Proof points to earn, not claim:** median leaks closed per customer in 90 days; share of requests answered; median days to closure. Publish them once there are 50 customers' worth. Until then, show the method and the fictional sample.

**Claims we never make:** permanent removal, complete coverage, "unfindable", "delete yourself from the internet", breach prevention, any score presented as a probability. A clean result reads "no leak found in the sources checked", never "you are safe".

### What this means for the landing page

The launch pages changed direction on 12 November 2026: the cartoon pipe-and-cork artwork was replaced by a black-and-white design where colour returns when a leak is fixed. The visual direction, and what must not be restored, is in [08-design-direction.md](08-design-direction.md). What is bland is still the promise underneath, so the copy changes below stand. Status is in 08.

1. Lead with the trigger, not the category. Rotate three headlines as campaign variants: "Got a breach email? Here's the fix." / "How did they get your number?" / "Is your home address online?" (done)
2. Replace "join the list" with a real action as soon as the leak check exists: "Check my email for leaks" → result → signup.
3. Teach the six-path language on the page itself. (done, as the six-ways table; the earlier stream demo was removed with the artwork)
4. Show the paid outcome: a sample closed leak with dates and evidence, next to a sample alert-only product. (the closed leak is done; the comparison is not)
5. Add two fields after signup, one tap each: country, and "what worries you most" with five trigger options. This is the cheapest demand research available and it settles the geography decision. (done)

## Geography

**Recommendation: build the request engine for UK and EU law first; keep the breach, account and social modules global; add the US pack when the launch list says so.**

Why UK/EU first:

- **One lever fits every organisation.** GDPR and UK GDPR give access, erasure and objection rights against any controller, with a one-month clock. One engine, one template family, every target.
- **It runs on email.** Most GDPR requests are accepted by email to a privacy contact. US people-search opt-outs are web forms with CAPTCHAs and per-site quirks; maintaining those is an operations business.
- **The strongest "who sold my data" tool is European.** Article 15 lets a person ask who received their data and where it came from. That turns the vague fear "apps sell my data" into a named list.
- **Home ground.** You can register with the ICO, test on your own data and speak to customers in your own time zone.
- **Less crowded.** The removal incumbents are built around US people-search sites.

What it costs: the visceral US pain (home address on a people-search site) is weaker in Europe, so the European message leans on breaches, scams and companies holding data.

What flips it: if more than half of launch-list signups are in the US, build the US pack first (DROP walkthrough for Californians, guided opt-outs for the highest-traffic people-search sites, CCPA request templates). The engine is the same; only the target list, templates and clocks change. That is why jurisdiction is a data field in the design, not a code path.

Price in local currency: Cleanup £49 · €55 · $59 one-off; Watch £6 · €6 · $7 a month. Full ladder in [06-pricing-and-economics.md](06-pricing-and-economics.md).

## Where a solo founder can win

Be honest about the playing field. Incumbents have affiliate budgets, hundreds of broker integrations and brand trust. What they do not have:

1. **A cross-path product.** Their architecture and brand are welded to one path.
2. **A reason to chase.** Blanket-request models make money on volume sent, not on outcomes verified.
3. **Cheap long-tail handling.** Reading a messy reply from a privacy inbox, deciding what it means and writing the right follow-up used to need an operations team. A language model does it for a fraction of a cent, with a human reviewing the uncertain ones. This is the specific thing AI changes, and it favours a small team.

### Assets that compound

| Asset | How it grows | Why it matters |
| --- | --- | --- |
| **Company directory** | Every request records the contact that worked, the reply pattern, the median response time, the success rate | Requests get faster and more successful per company; new customers benefit from old ones |
| **Playbook library with outcomes** | Each completed step records effort and result | Ranking fixes by "risk removed per minute" becomes empirical |
| **Published outcome statistics** | Aggregate, anonymous closure rates | Trust in a category full of unverifiable claims |
| **Audience** | The planned short-video and content programme, plus the free leak check | Customer acquisition without competing in affiliate auctions |

None of these is a moat on day one. An LLM, a breach API and a request template are all replicable. The directory and the outcome data are not, after a few thousand requests.

## Strategic risks

| Risk | Why it is real | Response |
| --- | --- | --- |
| **The need is episodic** | People clean up once and cancel | Legal clocks keep the first cycle open for 30–90 days; after that, retention must come from new breaches, re-listings and new accounts. Priced for it: the Cleanup is a one-off, so revenue does not depend on retention. Watch take-up at day 90 measures recurrence before any spend on acquisition |
| **Trust barrier** | An unknown brand asking for personal identifiers to "protect privacy" | Free check needs only an email the person proves they own. Minimal retention, plain-language data policy, named founder, no trackers on the site |
| **Abuse** | A tool that finds where someone's details appear is a stalking tool if pointed at someone else | Scan only identifiers the account holder has verified. No lookups of third parties. Masked results until verification. Detail in the PRD |
| **Acquisition cost** | Incumbents pay large affiliate commissions | Free tool, content and communities first; no paid ads until payback is measured |
| **Platform and regulator moves** | More DROP-style free deletion; Google expanding Results About You | These remove single paths, which hurts single-path products most. Integrate them as steps in playbooks; the value is orchestration |
| **Operational drag** | Replies, identity challenges and edge cases eat founder time | Admin console and a strict support budget per customer from day one; automate only what the console proves is repetitive |
| **Legal exposure** | Acting as someone's agent, handling breach data, making claims | Signed authority, bounded templates reviewed by a solicitor before Autopilot, breach metadata only, conservative copy |

## The bet, stated plainly

People will pay £49 once for a 90-day cleanup that takes the leaks they already know they have, fixes most of them without their effort, and shows evidence. A meaningful share will then pay £6 a month to keep it that way. The first sentence is supported by the removal and identity-protection markets, and by one-off removal passes already selling. The second, that a cross-path fixer keeps people after the first cleanup, is the unproven part. The day-90 Watch offer measures it. The plan in [07-validation-and-build-plan.md](07-validation-and-build-plan.md) is built to answer it for the least money and time.
