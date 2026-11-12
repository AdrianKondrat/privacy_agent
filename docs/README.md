# Koverr — Personal Leak Fixer

Strategy, PRD and build plan. Prepared 11 November 2026. Design direction added 12 November 2026.

This set replaces the UK founder/director wedge from the Notion plan (pages 01–08). It keeps that plan's cautions about claims, identity checks and evidence, and drops its audience. Nothing here is validated by customers yet; every number that is not sourced is a planning assumption and is labelled as one.

## The call, in one page

**What we sell.** Not detection. Detection is free and getting freer: Have I Been Pwned is free, Google's Results About You is free, California's DROP deletes broker data for free. Google shut down its Dark Web Report in February 2026 and gave the reason itself: it "didn't provide helpful next steps". That sentence is the product brief. Koverr sells **the fix, tracked to closed**.

**The promise.** "Find where your personal data leaked. Fix it. Prove it stayed fixed." Free finds the leaks. Paid fixes them.

**The framework.** Personal data escapes along six paths, and each needs a different fix:

| Path | What happened | Typical fix |
| --- | --- | --- |
| **Stolen** | A company you used was breached | Rotate, lock down, close the account |
| **Sold** | Brokers and people-search sites trade your profile | Opt-out and deletion requests |
| **Shared** | Apps and services pass your data to advertisers and partners | Object, opt out, delete dormant accounts |
| **Published** | Public registers print it by law | Suppress at source where the law allows |
| **Posted** | You, or people you know, put it on social media and the open web | Lock down, delete, ask the host |
| **Indexed** | Search engines and AI assistants surface all of the above | Removal requests to the index |

Every leak runs through the same loop: **Locate → Evaluate → Act → Keep watch** (LEAK).

**The core asset.** One **request engine** that sends, tracks and chases legal requests to any organisation. Brokers, breached companies, dormant accounts, ad-tech partners and listing sites are all just different target lists for the same engine. Detection modules feed it. This is what a solo founder can build that compounds: every request teaches the company directory how that organisation behaves.

**The price.** Free leak check → **Cleanup £49 one-off** (90 days: requests you approve, sent, tracked and chased for you, with a dated proof report) → **Watch £6/month** (new leaks with the fix attached). **Autopilot £19/month** (sent without asking) launches only once retention and proof reports justify it. Reasoning in [06-pricing-and-economics.md](06-pricing-and-economics.md#why-the-ladder-changed-12-november-2026).

**The first 12 weeks.** Ship a free leak check in two weeks. Sell a founding-member offer delivered by hand through an admin console in weeks 3–4. Automate only what the first 20 customers prove they value. Gates at weeks 2, 4, 8 and 12 decide whether to continue, narrow or stop.

## Reading order

| File | What it answers |
| --- | --- |
| [01-strategy.md](01-strategy.md) | Why this, why now, who buys, who we compete with, where we can win |
| [02-leak-framework.md](02-leak-framework.md) | The six paths in depth: how to detect, how to fix, what the law gives you, what can be automated |
| [03-prd-mvp.md](03-prd-mvp.md) | The MVP: scope, journeys, requirements, acceptance criteria, metrics |
| [04-playbooks.md](04-playbooks.md) | Step-by-step fix workflows and the request state machine |
| [05-architecture.md](05-architecture.md) | System design, data model, AI use, security, cost per user |
| [06-pricing-and-economics.md](06-pricing-and-economics.md) | Tiers, competitor prices, unit economics, revenue targets |
| [07-validation-and-build-plan.md](07-validation-and-build-plan.md) | Experiments, 12-week plan, gates, risks, what to do this week |
| [08-design-direction.md](08-design-direction.md) | How the product looks: the colour rule, what shipped, what was retired, how the MVP screens must follow it |

## Design direction (12 November 2026)

The launch pages use one rule: **exposure is black and white, and colour returns when a leak is fixed.** The earlier cartoon artwork, pipe-and-cork scene, violet paper theme and coral/mint colours were removed. The MVP must build on the shipped design, not on the older notes in these documents. Start with [08-design-direction.md](08-design-direction.md); the exact tokens are in [`DESIGN.md`](../DESIGN.md).

## Three decisions that are yours

1. **Launch geography.** Recommended: UK and EU first for the request engine (one legal framework, email-based, your home regulator), with breach and account modules open to everyone. Flip to US-first if more than half of the launch list turns out to be American. The landing page should start asking for country now. Reasoning in [01-strategy.md](01-strategy.md#geography).
2. **How much the agent may do unattended.** Recommended: nothing is sent without a tap for the first 100 customers; Autopilot unlocks per request class once reply handling is measured. Reasoning in [02-leak-framework.md](02-leak-framework.md#the-automation-ladder).
3. **Model routing.** Recommended: `claude-opus-5-5` for drafting and judgement, `claude-haiku-5-5` for bulk classification. At this product's volumes the AI bill is cents per user either way; the choice is about quality on hard replies. Detail in [05-architecture.md](05-architecture.md#where-ai-does-the-work).

## What changes from the Notion plan

| Notion plan (Oct 2026) | This plan |
| --- | --- |
| UK directors exposed through company records | Any adult worried about breaches, spam, scams or a findable home address |
| One path (Published) and one source (Companies House) | Six paths; Published becomes one playbook pack |
| One-off cleanup pack, then test a subscription | A one-off 90-day Cleanup, then a low-priced Watch plan offered with the day-90 proof report (changed back from subscription-first on 12 November 2026, after the competitive teardown) |
| User sends every request | User approves; the engine sends, tracks and chases |
| Breach checks and AI probes out of scope | Breach check is the free front door |

What stays: no "guaranteed removal", no "unfindable", no treating a blocked check as success, no people-search for anyone but the verified account holder, minimal retention.

## Sources checked on 11 November 2026

Prices and availability move. Recheck before quoting any of these publicly.

- Google Dark Web Report shutdown and stated reason: [Google support](https://support.google.com/websearch/answer/16767242), [TechCrunch](https://techcrunch.com/2025/12/15/googles-dark-web-report-feature-will-no-longer-be-available-starting-in-february/)
- Have I Been Pwned plans (Core, Pro, High RPM since March 2026): [subscription page](https://haveibeenpwned.com/subscription), [plan change note](https://support.haveibeenpwned.com/hc/en-au/articles/15617510034063-What-happened-to-the-old-Pwned-subscription-plans), [stealer-log access](https://support.haveibeenpwned.com/hc/en-au/articles/12029246540175-What-stealer-log-information-can-I-access-with-a-Pro-or-High-RPM-subscription)
- California DROP: [CalPrivacy](https://privacy.ca.gov/2026/07/drop-data-broker-deletions-how-do-they-work/), [CPPA regulations](https://cppa.ca.gov/announcements/2025/20251113.html)
- Results About You expansion (US first, Japan since 2025): [TechRepublic](https://www.techrepublic.com/article/news-google-expands-search-privacy-tools-identity-theft-deepfakes/)
- Surfshark's majority stake in Optery (8 September 2026): [Surfshark](https://surfshark.com/blog/surfshark-acquires-optery), [TechRadar](https://techradar.com/vpn/vpn-services/surfshark-bolsters-its-privacy-empire-with-optery-data-removal-acquisition)
- Competitor prices (third-party reports, not vendor quotes): [Toolradar on Incogni](https://toolradar.com/tools/incogni/pricing), [Offlist comparison](https://www.offlist.me/blog/incogni-vs-deleteme-vs-optery), [Security.org](https://www.security.org/data-removal/incogni-vs-aura/)
- Mine: [product page](https://saymine.com/digital-footprint-assistant)
- Gmail restricted scopes and the security assessment: [Google verification docs](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification)
- Brave Search API: [Brave](https://brave.com/search/api/)
- Third-party subject access requests: [ICO guide](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/subject-access-requests/a-guide-to-subject-access/)
- Merchant-of-record fees: [comparison](https://dev.to/jettfu/stripe-vs-paddle-vs-lemon-squeezy-fee-comparison-2026-2c77)
- Competitive teardown (12 November 2026): Notion page 10, with sources for every price used in 06.
- Earlier evidence register: Notion page 08 (Companies House fees, ICO erasure guidance, Consumer Reports study, Kanary and Optery plans).

Not verified in this pass and flagged where used: current Pro-tier HIBP prices, the security assessment cost for Gmail scopes (reports range from hundreds to tens of thousands of dollars), which UK Data (Use and Access) Act provisions are in force, and the exact form URLs for AI-assistant removal requests.
