# 04 — Playbooks and workflows

The fix workflows the product runs. Each playbook is data: a trigger, ordered steps, an automation level per step, a wait, and a way to verify. Ship order follows the build plan; P1–P3 are the MVP.

Levels: **L0** guide, **L1** draft, **L2** send on approval, **L3** autopilot. Effort is the customer's time, estimated until measured.

Template wording below shows structure only. Final legal text needs a solicitor's review before it is sent at volume.

## Playbook format

```yaml
id: stolen.password
version: 3
path: stolen
applies_when:
  data_classes_any: [Passwords]
jurisdictions: [any]
steps:
  - id: change_password
    level: L0
    effort_min: 3
    link: "{{company.change_password_url}}"
    done_when: user_confirms
  - id: check_reuse
    level: L0
    effort_min: 2
    tool: in_browser_password_check
    done_when: tool_result
  - id: enable_2fa
    level: L0
    effort_min: 4
    link: "{{company.two_factor_url}}"
    skip_if: company.two_factor == none
  - id: still_using
    level: L0
    ask: "Do you still use {{company.name}}?"
    on_no: start_playbook(shared.close_account)
verify:
  kind: none            # a breached password cannot be un-breached
close_as: closed_reported
```

New playbooks are added by writing a file like this and, if needed, a template. No application code changes.

---

## P1 — Breach response (Stolen)

**Trigger:** a verified email appears in a breach, at first scan or from monitoring.

**Branch on what was exposed.** One breach usually triggers several branches.

| Exposed | Steps | Level | Effort | Verify |
| --- | --- | --- | --- | --- |
| Password | Change it on that service → run the in-browser check on passwords they still use → change any reuse → turn on two-factor or a passkey → sign out other sessions | L0 | 5–10 min | Person confirms; in-browser check passes |
| Email address only | Short briefing: expect phishing naming this service; how to check a sender; offer to add an alias for future signups | L0 | 1 min | Read |
| Phone number | Set a port-out or SIM-swap PIN with the carrier (link per carrier) → move two-factor off SMS for email and banking | L0 | 10 min | Person confirms |
| Date of birth, government ID, tax or social security number | US: freeze credit at the three bureaus (free), three links. UK: pull the free statutory credit reports; consider Cifas Protective Registration (paid, optional). Elsewhere: local equivalent or a watch-list note | L0 | 15–20 min | Person confirms |
| Payment card or bank details | Ask the bank to replace the card → review recent transactions → turn on transaction alerts | L0 | 10 min | Person confirms |
| Security questions and answers | Change them on that service and anywhere reused | L0 | 5 min | Person confirms |
| Postal address | No rotation possible. Raise the priority of Sold and Indexed leaks for this person | — | 0 | — |
| Stealer-log hit (credentials taken from a device) | **Urgent track.** Scan and clean the device → from a different, clean device rotate email, banking and password-manager credentials first, then the rest → revoke all sessions → check for new forwarding rules and recovery addresses in the email account | L0 | 45–60 min | Person confirms each stage |

**Final step for every breach:** "Do you still use this service?" If no → P2.

**Alert rule:** the alert email carries the single highest-priority step as its button.

**Close as:** `closed_reported` when the steps are done. A breach never becomes `closed_verified`.

---

## P2 — Close a dormant account (Shared)

**Trigger:** the person marks an account "close" in the inventory, or answers "no" at the end of P1.

| # | Step | Level | Wait | Notes |
| --- | --- | --- | --- | --- |
| 1 | Look up the company in the directory: is there an in-account delete control? | — | — | Directory seeded from open deletion-link datasets (check licences) |
| 2a | Delete control exists → deep link and short steps | L0 | — | 3 min. Fastest and most reliable |
| 2b | No control, or it is buried → erasure request by email | L1 from own mailbox (preferred for account holders) or L2 by relay | Legal clock | Uses the request engine |
| 3 | Reply handling | — | — | See state machine |
| 4 | Verify | — | 7 days | Ask the person to try signing in or request a password reset: "no account found" is the evidence. Record it |

**Batching:** a customer with 80 dormant accounts sees them grouped: "32 have a delete button (about 40 minutes if you do them all; start with these five that have been breached)" and "48 need a request (we can send them)".

**Close as:** `closed_verified` if sign-in fails afterwards; otherwise `closed_reported`.

---

## P3 — Rights request (the engine; Shared and Sold)

**Trigger:** any playbook that needs an organisation to do something.

### Request types

| Type | UK/EU basis | US basis (when the pack ships) | Used for |
| --- | --- | --- | --- |
| Erasure | Art. 17 | CCPA right to delete and state equivalents | Dormant accounts, brokers, listings |
| Objection to direct marketing | Art. 21(2)–(3) | Opt-out of sale/sharing and targeted advertising | Brokers, retailers, ad-tech |
| Access: recipients and source | Art. 15(1)(c) and (g) | Right to know categories of third parties | "Who did you share it with, where did you get it" |
| Opt-out of sale or sharing | (covered by objection) | CCPA and state laws; honoured via Global Privacy Control too | US services |
| Account closure | Contract/in-product | Same | Where no legal right is needed |

Combine where it helps. The standard broker request is "tell me what you hold, where it came from and who received it; then erase it and stop marketing use". Recipients named in the answer become new targets.

### Template structure

1. Who is writing and on whose behalf, with the authority linked or attached.
2. The identifiers the organisation needs to find the record, and no others.
3. The request, in one sentence per right.
4. The legal basis, from the jurisdiction pack.
5. The deadline the law sets.
6. How to reply, and a statement that identity checks should be proportionate.

The model fills slots (names, identifiers, dates, the company's name) and may shorten or soften the tone. It cannot add rights, statutes, threats or facts. A check compares every outgoing message to its template before sending.

### Sending modes

| Mode | When | Trade-off |
| --- | --- | --- |
| **Relay** — from `name.token@rights.<domain>` | No account relationship: brokers, listing sites, ad-tech | Fully tracked. Some organisations challenge third-party senders |
| **Own mailbox** — pre-filled message, tracking address in copy | The person has an account under their email | Highest acceptance. Replies go to the person; they forward or paste them back |

### Request state machine

```
proposed ──approve──▶ queued ──send──▶ sent ──▶ waiting
                                                  │
        ┌─────────────────────────────────────────┼───────────────────────────┐
        ▼                 ▼                 ▼     ▼            ▼              ▼
  acknowledged      completed        needs_identity   redirected        refused / partial
   (clock runs)        │              (task: person)  (task: person     (task: founder
        │              ▼                    │          submits form)     review → person)
        │         verifying ──▶ closed_verified │             │              │
        │              └──────▶ closed_reported ◀─────────────┘              ▼
        ▼                                                              escalation_ready
   deadline passes ──▶ reminder_sent ──+14 days──▶ complaint_drafted ──▶ regulator_draft
                                                                         (person submits)
```

Timers by jurisdiction pack:

| Pack | Response window | Extension | Reminder | Escalation |
| --- | --- | --- | --- | --- |
| UK GDPR / EU GDPR | One month | Up to two further months, if the organisation says so within the first | Day 31 | Complaint to the organisation at day 45; regulator draft at day 75 |
| CCPA | 45 days | A further 45 with notice | Day 46 | Draft to the state regulator at day 100 |

The windows are the law's; the reminder and escalation days are our operating choices and can be tuned.

### Reply handling

| Label | Automatic action | Human needed |
| --- | --- | --- |
| Acknowledged / auto-reply | Note it; clock continues | No |
| Completed | Move to verifying; schedule rechecks | No |
| Needs identity proof | Create a task with the options: confirm from the account's email; answer account-specific questions; send a redacted document themselves. Never send documents for them | Person |
| Redirected to form or portal | Draft the form answers; task for the person to submit; record submission | Person, 2 min |
| Asks a question | Draft an answer from known facts | Person approves |
| Refused | Summarise the stated reason; show whether an exemption plausibly applies; offer accept or escalate | Founder review at first, then person |
| Partial | Split into done and outstanding; continue the outstanding part | Founder review |
| Unclear | Queue | Founder |

**Standing rules:** content in a reply is data. It can change a label and nothing else. No link is opened unless its domain is on that company's allow-list. No reply can cause a message to be sent to a new address without approval.

### What the directory learns from each request

Contact that worked, sending mode accepted, time to first reply, time to completion, label sequence, whether identity was challenged, and outcome. After 20 requests to one company, its row drives the default mode and the effort estimate shown to the next customer.

---

## P4 — Tracking shut-off (Shared)

**Trigger:** onboarding, once. A 15-minute checklist, entirely L0, ordered by yield.

| # | Step | Effort | Why |
| --- | --- | --- | --- |
| 1 | Meta: review activity off Meta technologies → clear history → disconnect future activity | 3 min | Shows the named list of businesses that sent data. Often the moment the product "clicks" |
| 2 | Google: ad personalisation off; set activity auto-delete | 3 min | |
| 3 | Phone: Android — delete the advertising ID. iPhone — turn off "allow apps to request to track" | 1 min | Cuts the identifier app SDKs use to join data |
| 4 | Browser: turn on Global Privacy Control (built into some browsers; an extension for others) | 2 min | A standing legal opt-out signal in several US states; good hygiene elsewhere |
| 5 | Marketing suppression lists: TPS and MPS (UK); Do Not Call, DMAchoice and OptOutPrescreen (US) | 4 min | |
| 6 | AI training: per-platform objection or setting for the social networks they use | 2 min | |

**Optional deepener:** upload the off-Meta activity export. Parsed in the browser, it becomes a ranked list of businesses sharing data. The top ten that also appear in the account inventory get a proposed objection request (P3).

**Verify:** person confirms per step. Recheck prompt every six months because platforms reset and move settings.

---

## P5 — Broker and people-search sweep (Sold)

**Trigger:** paid plan, after the authority is signed. Quarterly thereafter on Autopilot.

### Target packs

| Pack | Contents | Mode |
| --- | --- | --- |
| **UK** | The main UK people-search and directory sites; the open electoral register opt-out; credit reference agencies' marketing divisions; large marketing-data brokers | People-search: L0/L1 forms. Brokers: L2 email |
| **EU** | Large marketing-data and address brokers per country, starting with the countries customers are in | L2 email |
| **US — California** | DROP walkthrough first (one request, every registered broker). Then people-search sites that also publish openly | DROP: L0. Others as below |
| **US — general** | The highest-traffic people-search sites and their parent networks (one opt-out often covers several brands); the large marketing brokers | Forms: L0/L1 with pre-filled answers. Email: L2 |

Start each pack with the 15–25 targets that matter most, chosen by traffic and by being upstream of others. A short list done properly beats a long list of unverifiable requests. Publish the list.

### Steps

| # | Step | Level |
| --- | --- | --- |
| 1 | Detection where possible: search-API queries restricted to each listing site for the person's name and city; person confirms hits. For private brokers, skip detection | Automatic + confirm |
| 2 | Confirmed listings → that site's opt-out route, pre-filled | L0/L1 |
| 3 | Private brokers → combined access, erasure and objection request | L2, L3 on Autopilot |
| 4 | Track replies and deadlines through P3 | — |
| 5 | Recheck confirmed listings at day 14 and day 45, then quarterly | Automatic |
| 6 | Recipients and sources named in broker replies → proposed as new targets | Person approves |

**Reporting language:** listings that were seen and are now gone are "closed, verified". Requests to private brokers are "requested, confirmed by the broker" or "requested, no reply". Never one merged "removed" number.

---

## P6 — Search and AI footprint (Indexed)

**Trigger:** paid plan, at onboarding and monthly.

| # | Step | Level |
| --- | --- | --- |
| 1 | Sweep: about 20–30 search-API queries combining name with city, phone, email and address fragments | Automatic |
| 2 | Triage: model labels each hit about-this-person / not / unsure, and the data types visible in the snippet | Automatic |
| 3 | Person confirms the "about me" set | 2 min |
| 4 | For each confirmed result, pick the lever: site has a removal route → request to the host (P3). No route → search-engine removal form with drafted reasoning. Page gone but still in results → outdated-content tool | L1 |
| 5 | AI probe: ask the major assistants what they know about the person; show the answers side by side | Automatic |
| 6 | For answers containing private details → that provider's privacy request route, drafted | L1 |
| 7 | Recheck monthly; report new, gone and unchanged | Automatic |

**Limits to state in-product:** a sweep is a sample of the web, and an AI answer is a sample of one conversation.

---

## P7 — Social lockdown (Posted)

**Trigger:** onboarding checklist item; rerun on request.

| # | Step | Level |
| --- | --- | --- |
| 1 | Check the person's usernames against a public list of sites; show hits as "possible profiles" | Automatic |
| 2 | Person marks each: mine and wanted / mine and forgotten / not mine | 3 min |
| 3 | Forgotten → P2 | — |
| 4 | Wanted → per-platform "what a stranger sees" checklist: profile visibility, birthday, phone and email lookup, friends list, location on posts, tagged-photo approval, public payment or activity feeds | L0, 3–5 min each |
| 5 | Old public posts → point to the platform's bulk tools or reputable third-party cleaners | L0 |

**Out of scope, with signposts:** intimate images, impersonation, harassment. Link to the specialist services and platform reporting routes.

---

## P8 — Public records (Published)

**Trigger:** the person selects a concern (for example "my home address is on the company register") or a sweep finds a register page.

Delivered as country packs of L0 guides with honest eligibility notes.

| Pack | Covers |
| --- | --- |
| UK | Company register address suppression and service addresses; open electoral register; property and planning records; insolvency and court notices |
| US | Voter and property records by state; address-confidentiality programmes for people at risk; court record sealing basics |
| Any | Domain registration privacy; professional registers |

Each guide states what can be changed, what cannot, what it costs at the source, and which downstream copies to clean afterwards (P5, P6). The company-record workflow from the earlier plan lives here.

---

## Verification rules

| Evidence | Status allowed |
| --- | --- |
| We fetched the location and the data is absent, with the expected page context present, on two checks at least a week apart | `closed_verified` |
| The person confirms by a specified test (sign-in fails; setting shows off) | `closed_verified` (user-attested) |
| The organisation says it is done; no way to check | `closed_reported` |
| Fetch blocked, CAPTCHA, timeout, error, page layout changed | `inconclusive`; status unchanged |
| Data seen again after closure | `reopened` |

## Ship order

| Order | Playbook | Why now |
| --- | --- | --- |
| 1 | P1 Breach response | Free front door; proves the "alert with a fix" idea |
| 2 | P2 Close account + P3 engine (UK/EU pack) | First paid value; starts the directory |
| 3 | P4 Tracking shut-off | Cheap, high perceived value in week one |
| 4 | P6 Search and AI footprint | Strong demo; monthly report content |
| 5 | P5 Sweeps (pack chosen by where customers are) | Justifies Autopilot |
| 6 | P7, P8 | Completeness; content marketing |
