# 06 — Pricing and unit economics

Every figure not attributed to a source is a planning assumption. Replace with invoices, logs and cohort data as soon as they exist. Competitor prices and the reasoning behind this ladder are in the Notion page "10 — Competitive teardown · November 2026".

## Why the ladder changed (12 November 2026)

The earlier ladder was Free → Fixer $15/month → Autopilot $29/month. The competitive teardown found three problems with it:

- **Fixer lost the first comparison.** "$15, you approve each request" sits next to "Incogni, about $8 a month on annual billing, fully automatic". Covering more paths does not register on a pricing page. Doing more of the work yourself does.
- **Autopilot needed trust the brand does not have yet.** The category clusters at $8–15 a month. $29 is premium pricing, against incumbents with years of reviews.
- **A subscription-first price rests on the least-proven assumption.** The strategy names episodic need as the main risk. Charging for the cleanup as a one-off gets cash on day one without depending on retention nobody has measured.

The lead product is now a one-off 90-day Cleanup. Watch keeps people afterwards. Autopilot waits until there is proof to sell it on.

## The ladder

UK prices are the reference and include 20% VAT. Launch market is UK/EU (see [01-strategy.md](01-strategy.md#geography)).

| | **Leak Check** | **Cleanup** (lead offer) | **Watch** | **Autopilot** (later) |
| --- | --- | --- | --- | --- |
| Price | Free | **£49 one-off** | **£6/month** or £59/year | **£19/month** or £190/year |
| Other markets | — | €55 · $59 | €6 · $7/month | €19 · $19/month |
| Job | "How bad is it?" | "Fix what's out there now" | "Tell me when something new leaks, with the fix" | "Just handle it, ongoing" |
| Length | — | 90 days | Rolling | Rolling |
| Identifiers | 1 email | 3 emails, 1 phone, usernames | Same as Cleanup | 5 emails, 2 phones, usernames |
| Breach scan and fix plans | Top 3 in full | All | All, for new breaches | All |
| Breach monitoring with fix-attached alerts | — | Daily, during the 90 days | Daily | Daily |
| Account inventory | — | Yes | Kept up to date | Yes |
| Tracking shut-off checklist | — | Yes | — | Yes |
| Rights requests | — | Up to 25, you approve each | 3 new a month, you approve each | Sent for you under standing approvals; 50 a month fair use |
| Chasing and deadline tracking | — | Reminders sent for you; complaint and regulator drafts | Same, for its requests | Same |
| Search and AI footprint sweep | — | At start and day 90 | Quarterly | Monthly |
| Broker and people-search sweep | — | Guided, once | Quarterly re-check | Sent for you, repeated quarterly |
| Proof report | — | Day 45 and day 90 | Quarterly | Monthly, exportable |
| Human review of hard cases | — | Yes | Best effort | Priority |

**Day 90 is the conversion point.** The customer gets the final proof report ("18 requests, 12 confirmed deletions, 3 listings no longer found") and is offered Watch. The retention question becomes "what share of Cleanup buyers take Watch?" It can be read at day 90 instead of month 4.

**Annual Watch is the visual default.** The payment fee's fixed part takes a large share of a £6 charge (see the economics below).

### The outcome promise

"If we can't close at least five leaks in 90 days, you get your money back." No competitor offers a refund tied to results. It answers the category's biggest objection (the Consumer Reports finding that paid removal is "largely ineffective"). The risk is limited because playbooks rank fixable leaks first. Count a leak as closed only on the honest-status rules in [03-prd-mvp.md](03-prd-mvp.md#f9--proof-report). Have the wording checked with the terms.

### The founding offer (weeks 3–8 only)

**Cleanup for £29 plus three months of Watch free. First 50 customers.** Delivered partly by hand. In exchange: a review, and permission to quote anonymised results. It tests willingness to pay, funds legal review, and its 90 days covers one full request cycle. State the standard price next to it. No lifetime deals.

At 60 founder-minutes per customer it does not cover your time valued at £25 an hour (about −£7 each). It is still about £17 cash-positive per sale. Treat the gap as research spend: about £370 across 50 customers, cheaper than any ad test.

### Later, not now

- Autopilot launches only when both hold: month-4 retention of Watch at 50% or better, and a median of 5 or more closed leaks in Cleanup proof reports.
- Additional adult on Cleanup: about £29. On Watch: about £3/month.
- An "urgent cleanup" for fraud scares with a 7-day first response, priced well above Cleanup. Only if customers ask for it.

## Why these prices hold

Third-party reports, October–November 2026. Verify on the vendor's live page before quoting.

| Reference | Price | Monthly equivalent | What it covers |
| --- | --- | --- | --- |
| EasyOptOuts | $19.99/year | Under $2 | US people-search, automated |
| Offlist | $7 for 24 hours to about $45–60 a year, one-off passes | — | Broker requests; shows demand for paying once |
| Incogni Standard | $95.88/year, or $15.98 monthly | About $8 | Broker requests, UK/EU included |
| Incogni Unlimited | $179.88/year | About $15 | Plus custom removals |
| DeleteMe | $129/year, annual only | About $11 | People-search removal, mostly US |
| Optery | $39–249/year | About $3–21 | People-search removal, US only |
| Experian Identity Plus / CreditExpert (UK) | £10.99 / £14.99 a month | £11–15 | Web monitoring alerts, no fixes |
| Kanary | $250–500/year | About $21–42 | Removal plus claimed AI exposure |

Readings:

- **£49 once is easy to compare and easy to say yes to.** It costs less than three months of Experian alerts plus an hour of your own time, and it is one payment rather than another subscription. Ninety days matches the one-month legal clock plus a round of chasing.
- **£6 Watch sits under Experian's £10.99**, which only alerts. Watch alerts and attaches the fix.
- **£19 Autopilot sits above Incogni Standard** and below Incogni Unlimited. It is defensible only with proof reports showing more paths closed. It does not launch before that proof exists.
- **Going lower on Cleanup is a trap.** Below about £39 the founder minutes stop being covered (see the minutes table). The comparison then becomes broker count, which this product loses.

## What each sale is worth

UK case: prices include 20% VAT, so net revenue is the price divided by 1.2. Payment fee is a merchant-of-record rate of 5% + about £0.40. Support time is valued at £25 an hour. Machine costs come from [05-architecture.md](05-architecture.md#cost-model), rounded up.

### Cleanup (£49, one-off, 90 days)

| | At 60 min (concierge) | At 20 min (console target) |
| --- | --- | --- |
| Net revenue | £40.83 | £40.83 |
| Payment and tax handling | −£2.85 | −£2.85 |
| Machine cost over 90 days | −£3.50 | −£3.50 |
| Human time | −£25.00 | −£8.33 |
| Refund reserve, outcome promise (5%) | −£2.04 | −£2.04 |
| **Contribution** | **£7.44** | **£24.11** |

### Watch and Autopilot (per month)

| | Watch £6 monthly | Watch £59 annual (per month) | Autopilot £19 monthly |
| --- | --- | --- | --- |
| Net revenue | £5.00 | £4.10 | £15.83 |
| Payment and tax handling | −£0.70 | −£0.28 | −£1.35 |
| Machine cost | −£0.50 | −£0.50 | −£1.20 |
| Human time (3 / 3 / 8 min) | −£1.25 | −£1.25 | −£3.33 |
| Refund reserve (3%) | −£0.15 | −£0.12 | −£0.48 |
| **Contribution** | **£2.40** | **£1.95** | **£9.47** |

Watch is a retention layer, not a profit centre. It earns its place by keeping the customer, their directory data and their word of mouth, and by being where Autopilot is sold from. If Watch takes more than about 5 human minutes a month it loses money: automate its alerts first.

### The number that decides margin

| Founder minutes per Cleanup | Cleanup contribution |
| --- | --- |
| 20 (target) | £24.11 |
| 30 | £19.94 |
| 60 (concierge) | £7.44 |
| 90 | −£5.06 |
| 120 | −£17.56 |

Machine cost could double and barely move these. Human minutes decide them. **The cap is 60 minutes per Cleanup during the concierge beta.** If the median goes over it, raise Cleanup to £79 or narrow what it includes before taking more customers. The console times every task from day one so this number is measured, not guessed.

## How many customers for the revenue goals

Steady-state model:

- N Cleanups sold per month.
- 40% take Watch at day 90.
- Watch loses 5% a month.
- So the Watch base settles at 0.4N ÷ 0.05 = 8N subscribers.

Net revenue per month ≈ N × £40.83 + 8N × £5.00 = **£80.83 × N**.

| Net revenue per month (excluding VAT) | Cleanups per month | Watch base at steady state |
| --- | --- | --- |
| £5,000 | 62 | about 500 |
| £10,000 | 124 | about 990 |
| £20,000 | 247 | about 1,980 |

Two warnings:

- **Steady state takes about two years to reach** at 5% churn. In the first year, almost all revenue is Cleanups. Plan cash on Cleanup sales alone.
- **Revenue is not income.** At the 20-minute target, contribution is about £43 per Cleanup sold once its Watch tail is counted: 62 Cleanups a month gives about £2,700 a month before fixed costs (about £100), acquisition and tax. Autopilot, once proven, is what lifts margin.

## Acquisition limits

- **Ceiling until Watch conversion is known:** about £15 per Cleanup buyer. That is two-thirds of the 20-minute contribution, leaving room for error.
- Incumbents pay affiliates about $24–30 a sale, and Incogni pays referrers up to $120. Do not compete in those auctions. Content, the free check, UK-specific guides and partners come first.
- Count founder time in the cost. A partnership that takes ten hours to land is not free.
- No paid advertising before day-90 Watch conversion is measured on at least 30 Cleanups.

## Free tier economics

A free check costs one breach-index call and no model call. The index subscription is flat-rate with rate limits, so the marginal cost is close to zero and the constraint is requests per minute. Keep the free tier to verified email breach results and three full fix plans. Anything that costs search queries, model calls or human time stays paid.

If 3% of people who complete a free check buy a Cleanup, 1,000 completed checks yield 30 Cleanups, about £1,225 net. That conversion rate is a hypothesis to test from week 2, not a benchmark.

## Pricing experiments

Traffic will be too low for split tests to reach significance for months. Use sequential cohorts and direct conversations instead, and change one thing at a time.

| # | Question | Method | Decision rule |
| --- | --- | --- | --- |
| P1 | One-off or subscription? | After a free check, a one-tap picker: "£49 once for a 90-day cleanup" / "£12 a month, ongoing" / "not now", leading to "we'll invite you" | Under 10% choosing a paid option: the offer or audience is wrong; fix that before building billing. If the subscription wins by 2× or more, revisit this ladder |
| P2 | Will people pay now? | Founding offer to launch-list members and free-check completers | 10 purchases from the first 100 people asked |
| P3 | Does Cleanup convert to Watch? | Offer Watch with the day-90 proof report | 40% or more: the model holds. Under 20%: the need is one-off; sell Cleanup again at 12 months instead of a subscription |
| P4 | Annual default for Watch? | Alternate weekly which billing period is preselected | Keep the one with higher cash per buyer, provided refunds do not rise |
| P5 | Where should the free boundary sit? | Cohort A: three full fix plans. Cohort B: all plans visible, requests paid | Higher Cleanup conversion wins, checked against activation |
| P6 | Does the outcome promise lift conversion? | Show it to alternate weeks' visitors | Keep it if conversion rises and refunds stay under 5% |
| P7 | Is £49 too low? | After 30 sales at £49, raise new visitors to £59 for two weeks | Keep £59 if cash per visitor does not fall |

## Rules for changing price

- Existing customers keep their price for the term they bought.
- Announce changes on the pricing page with a date.
- Never discount by removing the cancellation ease or by lifetime deals.
- A price rise needs a matching change the customer can see: a new path covered, a faster cycle, a published outcome rate.
