# 05 — Architecture and systems

Designed for one founder, a product that must be trusted with personal identifiers, and a roadmap where every module starts as an experiment. Three consequences: few moving parts, a human-in-the-loop twin for every automated step, and behaviour defined in data rather than code wherever a non-engineer decision is involved.

## Design principles

1. **Everything launches as an experiment.** Each module moves through four stages, and the code supports all four from the start:

   | Stage | What exists | Gate to the next stage |
   | --- | --- | --- |
   | Fake door | A button or card that records interest and says "coming soon" | Enough clicks relative to views to justify a week of work |
   | Concierge | The founder does the work by hand in the admin console; the customer sees the normal interface | People pay or come back for it; minutes per case measured |
   | Assisted | The system drafts or proposes; a human approves | Approval rate without edits above 90% on 50 cases |
   | Automated | The system acts; humans see exceptions | Exception rate and harm rate stay under threshold |

2. **Manual twin.** Any step the system can perform, the admin console can perform, writing the same records. This is how features ship before they are automated, and how failures are recovered.
3. **Behaviour as data.** Playbooks, request templates, jurisdiction packs, target packs and the company directory are versioned data. Adding the US pack, a new broker or a new fix is a content change.
4. **Adapters at the edges.** Every outside source (breach index, search API, model provider, email, payments) sits behind a small interface so it can be swapped or stubbed.
5. **Measure the two things that decide the business.** Every action records minutes of human time and its outcome. Cost-to-serve and fix success are first-class data, not afterthoughts.
6. **Hold the minimum.** No passwords, no breach contents, no identity documents, no inbox access. Short retention. What we do not hold cannot leak.

## System overview

```
                        ┌───────────────────────────────────────────┐
  Browser               │  Web app (existing Astro + React project)  │
  ─ landing             │  ─ marketing pages (existing)              │
  ─ leak check          │  ─ /app: leak list, plans, requests        │
  ─ in-browser parsing  │  ─ /admin: review queue, manual twin       │
    (passwords, CSV,    │  ─ API routes: auth, scans, approvals,     │
     platform exports)  │    payment and inbound-mail webhooks       │
                        └───────────────┬───────────────────────────┘
                                        │
                        ┌───────────────▼───────────────────────────┐
                        │  Postgres (UK/EU region)                   │
                        │  row-level security · field encryption     │
                        │  jobs table · audit log · events           │
                        └───────────────┬───────────────────────────┘
                                        │
                        ┌───────────────▼───────────────────────────┐
                        │  Worker (same codebase, separate process)  │
                        │  scan · monitor · send · classify · recheck│
                        │  · remind · report · retention             │
                        └──┬────────┬────────┬────────┬─────────┬───┘
                           │        │        │        │         │
                      Breach     Search    Model    Email     Payments
                      index      API       API      out + in  (merchant
                                                              of record)
```

### Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Web | Keep the existing Astro + React + TypeScript project; add `/app` and `/admin` on the same `Shell` layout and the tokens in `src/styles/market.css` | No replatforming, and no second design system. The app is lists, forms and detail pages. Visual rules and status colours: [08-design-direction.md](08-design-direction.md) |
| Database | Managed Postgres in a UK or EU region, with built-in auth, storage and scheduled jobs (Supabase fits and its tooling is already installed here) | One vendor for data, sign-in, files and cron. Row-level security enforces customer isolation in the database, not just in code |
| Jobs | A `jobs` table polled by the worker with `FOR UPDATE SKIP LOCKED`; due times on rows | The product's long waits (30 and 45 days) are just rows with a `run_at`. No workflow engine to learn or pay for until volume demands it |
| Email | A transactional provider that supports inbound parsing, on a dedicated subdomain | Outbound requests and inbound replies through one webhook-driven service |
| Payments | A merchant of record | Selling to consumers across the UK, EU and US means VAT and sales tax from the first sale. A merchant of record takes that on for roughly 5% + $0.50 per transaction. Confirm the treatment with an accountant |
| AI | Anthropic API through the official TypeScript SDK | See "Where AI does the work" |
| Analytics | Cookieless page analytics plus an internal `events` table with no identifiers | A privacy product cannot run ad pixels or session replay |

The existing SQLite launch list is imported into Postgres once; the current signup endpoint keeps working against the new table.

## Core data model

| Table | Holds | Notes |
| --- | --- | --- |
| `users` | Account, plan, country, consent and authority records | Country drives the jurisdiction pack |
| `identifiers` | Email, phone, username, name, address; kind, verified_at, method | Values encrypted at field level; a keyed hash alongside for lookups. Only rows with `verified_at` can enter a scan |
| `scans` | One run of one adapter for one user | Cost, duration, result state (ok / partial / failed) |
| `leaks` | One exposure: path, source, company, data types, evidence reference, risk, status, first and last seen | The unit the customer sees and the north-star metric counts |
| `actions` | One step of a plan: playbook id and version, level, status, effort estimate, actual minutes, outcome, `run_at` | Scheduling lives here |
| `requests` | An outbound rights request: type, pack, company, mode, sent copy (immutable), deadline | One action may own one request |
| `messages` | Inbound and outbound mail for a request; classifier label and confidence; who resolved it | Bodies expire per the retention policy |
| `companies` | The directory: domains, privacy contacts, delete and settings links, policy facts, allow-listed link domains, behaviour statistics | The compounding asset. Seed from open datasets after checking each licence |
| `playbooks`, `templates`, `packs` | Versioned content | Loaded from files in the repository at deploy; versions recorded on every action |
| `events` | Product analytics: event name, module, plan, pseudonymous user key | No identifiers, no free text |
| `audit_log` | Every send, approval, admin reveal and manual action | Append-only |
| `jobs` | Queue | Idempotency key per job |

## Source adapters

One interface for everything that looks for leaks:

```ts
interface SourceAdapter {
  id: string;                          // "hibp.breaches"
  path: LeakPath;                      // "stolen" | "sold" | "shared" | ...
  requires: IdentifierKind[];          // verified identifiers needed
  budgetCents: number;                 // hard cap per run
  scan(ctx: ScanContext, ids: VerifiedIdentifier[]): Promise<ScanResult>;
  recheck?(ctx: ScanContext, leak: Leak): Promise<"still_visible" | "not_observed" | "inconclusive">;
}
```

`ScanResult` always carries a state. A failed or partial scan is stored as such and shown as "could not check"; it can never produce a clean result.

| Adapter | Path | Stage at launch |
| --- | --- | --- |
| Breach index by email | Stolen | Automated |
| Password range check (runs in the browser) | Stolen | Automated |
| Account inventory import (parsed in the browser) | Shared | Automated |
| Policy reader (per company, cached in the directory) | Shared | Assisted |
| Platform export parser (in the browser) | Shared | Fake door → assisted |
| Web search sweep | Indexed, Sold | Assisted |
| AI assistant probe | Indexed | Fake door → assisted |
| Username check | Posted | Fake door |

## The request engine

The piece that turns a list of leaks into closed leaks. Components:

- **Composer.** Template + pack + slots → message. A deterministic check confirms the output is the template with slots filled before anything is queued.
- **Approver.** Cleanup and Watch: the customer approves each request or a batch. Autopilot: a standing approval per request class, stored with its date and scope.
- **Sender.** Relay mode sends from the customer's unique address on the requests subdomain. Own-mailbox mode produces a pre-filled message with the tracking address in copy.
- **Receiver.** Inbound webhook → verify the provider's signature → match the recipient token to a request → store → enqueue classification. Mail from a sender unrelated to the target company is quarantined.
- **Classifier.** Labels the reply from a fixed set. Safe labels apply automatically; the rest become tasks.
- **Clock.** Deadlines and next steps are `run_at` values computed from the pack. A daily job moves overdue requests forward.
- **Verifier.** Schedules rechecks where a public location exists.

Deliverability basics: separate subdomain from marketing mail, SPF, DKIM and DMARC aligned, plain-text messages, low and steady volume, immediate handling of bounces.

## Where AI does the work

Language models are used where reading or writing messy text is the bottleneck. Code keeps control of identity, entitlements, money, deadlines, status changes and what is sent to whom.

| Job | Model | Input → output | Guardrail | Est. cost |
| --- | --- | --- | --- | --- |
| Sort search hits: about this person or not, which data types | `claude-haiku-5-5` | Snippet + the person's confirmed identifiers → label and types (structured output) | Person confirms every "about me" | About $0.01 per sweep |
| Classify a reply | `claude-haiku-5-5`, escalating low-confidence cases to `claude-opus-5-5` | Reply text + request summary → one label from a fixed set | Fixed label set; only safe labels auto-apply; no tools; reply text is treated as data | Fractions of a cent; about $0.03 for a hard one |
| Fill and adapt a request template | `claude-opus-5-5` | Template + slots → message | Deterministic comparison against the template | About $0.01–0.02 |
| Read a privacy policy for the directory | `claude-opus-5-5`, via the Batch API | Policy page → sells/shares, partners named, opt-out and deletion routes, contact | Founder approves each new directory row at first | About $0.08 once per company, half that in batch |
| Draft the answer to a question or a form | `claude-opus-5-5` | Known facts only | Customer approves | About $0.02 |
| Write the fix explanation and monthly report | `claude-opus-5-5`, via Batch | Verified rows only → short text | No new facts: every claim maps to a row | About $0.03 |

Prices used: Opus 5.5 at $4 per million input tokens and $20 per million output; Haiku 5.5 at $0.10 and $0.50; batch jobs at half price; cached prompt prefixes at a fraction of input price. Keep each job's instructions in a stable system prompt so caching applies.

Routing is a cost-and-quality choice that is yours to make. The recommendation is Opus 5.5 wherever judgement or wording matters and Haiku 5.5 only for high-volume labelling, because at these volumes the whole AI bill is well under a dollar per customer per month and a wrong reading of a refusal costs far more in support time.

### AI acceptance tests before a job is promoted to automated

- **Reply classifier:** a labelled set of at least 150 real replies (collected during the concierge stage). At least 95% agreement on the safe labels, and no case where a refusal, identity demand or question is labelled completed.
- **Hit triage:** no wrong-person result may become a confirmed leak without the person's tap, by construction.
- **Template fidelity:** 100% of outgoing messages pass the deterministic comparison.
- **Injection set:** at least 30 hostile inputs (replies and web pages containing instructions). None may cause a send, a state change beyond labelling, or a disclosure.
- **No invented law:** generated text is checked against the pack's list of permitted legal references.

## Security and privacy

### Threats that matter here

| Threat | Mitigation |
| --- | --- |
| Someone uses the product to investigate another person | Verified identifiers only; no third-party lookups; masked results; velocity flags; suspension |
| Takeover of a customer's Koverr account exposes their leak list | Passwordless sign-in with short-lived codes; sensitive values masked by default; new-device notice; re-verification before revealing addresses or changing the authority |
| Our database is breached | Field-level encryption of identifiers with keys outside the database; no passwords, breach contents or identity documents stored; short retention; minimal evidence excerpts |
| Hostile content in replies or web pages steers the model | Models have no tools and return labels or text only; code decides actions; link allow-list; injection test set |
| The relay addresses are used to spam or phish customers | Accept only in-thread mail from the target's domains; quarantine the rest; never forward raw inbound mail to the customer without rendering it as inert text |
| Founder access is abused or compromised | Multi-factor on admin; masked by default; every reveal logged; no production data on laptops |
| A provider retains customer data | Processor terms reviewed before use; smallest possible payloads (for example, send a snippet and a first name rather than a full profile) |

### Data policy to implement, then publish

| Data | Retention |
| --- | --- |
| Free leak check: email and breach metadata | Until the account is deleted; auto-delete after 12 months of inactivity |
| Identifiers | Until removed by the customer or account deletion |
| Evidence excerpts and reply bodies | 90 days after the leak closes, unless pinned by the customer |
| Sent request copies and the authority | For the life of the account plus the period needed to defend a complaint; state the period |
| Password-manager file, platform exports, passwords | Never uploaded |
| Billing records | Held by the merchant of record; we keep the minimum |
| Backups | Encrypted; 30-day expiry |
| Analytics | No identifiers |

Before taking payment: register with the ICO, write a data-protection impact assessment, publish the data policy and the list of processors, and test deletion end to end.

## Cost model

### Fixed, per month (planning estimates)

| Item | Estimate |
| --- | --- |
| Database, auth, storage, hosting | $30–50 |
| Email (outbound and inbound) | $15 |
| Breach index subscription | From about $5 on the entry tier; budget $50 until Pro-tier pricing is confirmed |
| Monitoring, error tracking, analytics | $0–20 |
| Domain and mail subdomain | $2 |
| **Total** | **About $100–140** |

One-off: solicitor review of the authority, terms and request templates (get a quote; budget for it before the paid beta), and the ICO fee.

### Variable, per paying customer

| Item | First month | Steady month |
| --- | --- | --- |
| Search API (about $5 per 1,000 queries) | $0.25–0.30 | $0.10–0.15 |
| AI | $0.30–0.50 | $0.10–0.25 |
| New directory entries (shared by later customers) | Up to $0.80 early on, falling fast | Near zero |
| Email and SMS verification | $0.10–0.15 | $0.05 |
| **Machine cost** | **$0.80–1.60** | **$0.25–0.50** |

The planning figures in the pricing doc (£3.50 for a 90-day Cleanup, £0.50 a month for Watch, £1.20 a month for Autopilot) sit above these on purpose. Machine cost is not what decides margin. Human minutes per customer is.

### Free leak check

One breach-index call and no model call: effectively free at the margin. Rate limits on the index, not cost, set the ceiling. Queue scans and show a progress state rather than buying a higher tier early.

## What breaks as it grows

| Paying customers | Pressure point | Response |
| --- | --- | --- |
| 100 | Founder review queue | The assisted stage must already be drafting; aim for under 10 minutes per customer per month |
| 500 | Reply volume; identity challenges; mail reputation | Classifier past its test; second sending subdomain warmed; own-mailbox mode as default for account-holder requests |
| 1,000 | Breach-index rate limits on mass rescans; directory upkeep; support | Rescan only on new breaches; scheduled directory re-verification; first part-time support hire |
| 5,000 | Job table as a queue; single region; solo on-call | Move to a managed queue or workflow service; read replica; formal incident rota |

Nothing in the first two rows needs an architectural change. That is the point of starting simple.

## Build, buy or borrow

| Need | Decision |
| --- | --- |
| Breach data | Buy (breach index). Never collect or host dumps |
| Web search | Buy (search API). No scraping at launch |
| Company privacy contacts, deletion links, two-factor links, username site lists | Borrow from open datasets, each licence checked and attributed; then improve with our own outcome data |
| Request templates and legal packs | Build, with paid legal review |
| Request engine, reply handling, verification | Build. This is the product |
| Auth, payments, email delivery, tax | Buy |
| Browser automation for web-form opt-outs | Not yet. Revisit only if the Sold module proves it is worth an operations burden |
