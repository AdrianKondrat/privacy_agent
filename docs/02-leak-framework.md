# 02 — The leak framework

How personal data gets out, how to find it, what can be done about it, and how much of that a machine can do. This is the analytical core; the PRD and playbooks are built on it.

Legal references are product-planning notes, not legal advice. Have a solicitor review request templates before the engine sends at volume.

## The six leak paths

| # | Path | Who exposed it | Example | Can the person see it? | How often it recurs |
| --- | --- | --- | --- | --- | --- |
| 1 | **Stolen** | A criminal, via a company's breach or malware on a device | Email and password in a breach dump; saved logins in a stealer log | Only through breach indexes | Constantly: new breaches every week |
| 2 | **Sold** | Data brokers and people-search sites | Name, address, phone and relatives on a people-search page; a marketing list | People-search: yes. Marketing brokers: no | High: listings reappear after removal |
| 3 | **Shared** | Apps and services you signed up to | A retailer sending purchase events to ad platforms; a dormant account still holding your address | Rarely, unless you ask | Medium: grows with every new signup |
| 4 | **Published** | A public body, by law | Company register, open electoral register, planning applications, court and property records | Yes | Low: changes with life events |
| 5 | **Posted** | You, or people who know you | Public profile with birthday and employer; a tagged photo; an old forum post with a phone number | Yes | Low to medium |
| 6 | **Indexed** | Search engines and AI assistants | Any of the above appearing for a search on your name; an assistant answering "where does X live" | Yes | Medium: follows the other five |

Two properties make this framing useful for building:

- **Paths chain.** Published records feed Sold. Stolen and Shared feed scam targeting. Everything feeds Indexed. Fixing upstream first is cheaper: suppress the source, then clear the copies, then clear the index.
- **Each path has one dominant fix type.** That keeps the playbook library small.

## The LEAK loop

Every finding, on every path, moves through four stages.

### 1. Locate

Find a candidate exposure and attach evidence: source, where exactly, when observed, which data types.

Then confirm it is this person. Name matches are not identity. The user marks each candidate **mine**, **not mine** or **unsure**; nothing is acted on until it is marked mine. Breach hits on a verified email skip this step, because the identifier itself is proven.

### 2. Evaluate

Score it (model below) and decide whether it is worth fixing now, later or never. Output a ranked list with an honest effort estimate. The interface shows three fixes at a time, not thirty.

### 3. Act

Pick the cheapest lever that works, at the highest automation level that is safe:

| Lever | Use when |
| --- | --- |
| **Self-service control** | The platform has a setting, a delete button or an opt-out form |
| **Rights request** | A law gives the person a right against the organisation (erase, object, opt out, access) |
| **Hardening** | The data cannot be recalled (a breached password), so the fix is to make it useless |
| **Index removal** | The source cannot or will not remove it, or the copy in search outlives the source |
| **Escalation** | The organisation ignores or refuses a valid request: internal complaint, then regulator |
| **Acceptance** | The fix costs more than the risk; record it and move on |

### 4. Keep watch

Verify the fix with evidence, not with the organisation's word. Recheck on a schedule. Reopen if it comes back. A check that is blocked, timed out or behind a CAPTCHA is **inconclusive**, never **closed**.

## Scoring

A simple, explainable heuristic for version 1. Tune it with outcome data later.

**Risk = Sensitivity × Reach × Freshness**

| Sensitivity | Data type | Weight |
| --- | --- | --- |
| Critical | Government ID number, bank or card details, current password in plain text, health or other special-category data | 5 |
| High | Home address, date of birth, security answers, passwords (hashed), precise location history | 4 |
| Medium | Mobile number, personal email, employer, family links, photos of the home | 3 |
| Low | Name with city, work email, old username | 2 |
| Minimal | Data already intentionally public | 1 |

| Reach | Who can get it | Weight |
| --- | --- | --- |
| Anyone, free, via search | 5 |
| Anyone, for a small fee or signup | 4 |
| Criminal marketplaces and breach dumps | 4 |
| Commercial buyers (marketing brokers, ad-tech) | 3 |
| One organisation's internal systems | 2 |

Freshness: 1.0 if observed or dated within 12 months; 0.7 within three years; 0.4 older; 0.2 if the data itself is out of date (old address, changed password).

**Priority = Risk × chance the fix works ÷ minutes of the person's effort**

Chance and effort start as estimates per playbook and are replaced by measured values. This is why completed actions record time spent and outcome: the ranking becomes an asset.

Show the person the reason, not the number: "Home address, visible to anyone on a free page. Fix takes about 2 minutes of your time."

## The automation ladder

| Level | Name | What the system does | What the person does | Risk |
| --- | --- | --- | --- | --- |
| L0 | **Guide** | Deep link, exact steps, a way to mark done | Everything | None |
| L1 | **Draft** | Writes the request, form answers or message | Reviews and sends from their own account | Low |
| L2 | **Send on approval** | Sends from a per-user relay address, tracks replies and deadlines | Taps approve | Medium: we are now their agent |
| L3 | **Autopilot** | Sends pre-approved request classes without asking, chases, escalates, reports | Reads the monthly report | Higher: errors happen without a human looking |

Rules:

- A playbook step is promoted one level at a time, and only after it has run at the level below with measured success and no harm.
- L2 and above require a signed authority from the customer.
- Three things never go above L1: anything that sends an identity document, anything that costs the customer money, and anything addressed to a regulator or court.
- The MVP ships L0–L2. L3 is the Autopilot tier and arrives per request class.

## Path by path

For each path: how to detect, how to fix, the legal lever, what can be automated, what it costs, and the honest limits.

### 1. Stolen

**Detect**

| Source | Gives | Cost | Notes |
| --- | --- | --- | --- |
| Have I Been Pwned API | Breaches for an email, with the data classes exposed in each | Subscription from about $4.39/month (Core); Pro tier needed for stealer-log site detail | Legitimate, metadata only, attribution required. The backbone |
| HIBP Pwned Passwords | Whether a password appears in known dumps | Free | Uses k-anonymity: only the first five characters of a hash leave the device. Run it in the browser so we never see the password |
| HIBP stealer logs | Which sites' logins were captured by malware on a device | Pro tier | A stealer-log hit means a device was infected: a different, more urgent playbook |
| Commercial breach-content APIs | The leaked values themselves | Varies | **Avoid.** Holding or querying stolen credentials raises legal and ethical problems under UK and EU law and makes us a target |

Monitoring is cheap: poll the public list of breaches daily, and re-query only when a new breach is added.

**Fix.** The data cannot be recalled, so the fix is to make it worthless. What to do depends on the data classes in the breach:

| Exposed | Fix |
| --- | --- |
| Password | Change it there; find and change every reuse; turn on two-factor or a passkey; sign out other sessions |
| Email only | Expect phishing that names the breached service; consider an alias for future signups |
| Phone | Add a port-out/SIM-swap PIN with the carrier; move two-factor off SMS for important accounts |
| Date of birth, government ID, national insurance or social security number | US: free credit freeze at all three bureaus. UK: check the free statutory credit reports; consider Cifas Protective Registration (paid) |
| Card or bank details | Replace the card; review transactions; set alerts |
| Security questions | Change them everywhere they were reused |
| Address | Nothing to rotate; raise the priority of Sold and Indexed fixes |
| Stealer-log hit | Clean the device first, then rotate every credential from a clean device, then revoke sessions |

Then one question that links to path 3: "Do you still use this service?" If not, close the account and request erasure, so the next breach of that company does not include you.

**Legal lever.** None against the criminal. Against the breached company: erasure if the account is no longer needed; in some jurisdictions, compensation or settlement claims (signpost only, never advise).

**Automation.** Detection: full. Fix: L0 with deep links (many sites publish a standard change-password address; two-factor setup links exist in open directories). The dormant-account erasure step runs through the request engine at L2.

**Limits.** No index sees every breach. Never say "you have not been breached".

**Recurrence.** The strongest of any path, which makes this the retention backbone as well as the front door.

### 2. Sold

Two different animals share this path.

**People-search sites** publish profiles to anyone. Mostly a US phenomenon; the UK has a handful, the EU few. **Marketing and risk brokers** hold profiles privately and sell access to businesses. They exist everywhere.

**Detect**

| Method | Works for | Notes |
| --- | --- | --- |
| Search-API queries restricted to known listing sites | People-search | Cheap, legitimate, incomplete. The person confirms each hit |
| Guided self-check | People-search | Deep link to the site's own search; the person reports what they see |
| Direct scraping of listing sites | People-search | What incumbents do. Fragile, against most sites' terms, heavy to maintain. Not for the MVP |
| Access request | Any broker | "Do you hold data about me, where did you get it, who received it?" Slow (a month) but definitive, and it is the only way to see inside a private broker |
| No detection: blanket request | Marketing brokers | Send erasure/objection to a curated list without knowing who holds data. Legitimate and efficient, but outcomes are unverifiable. Report it as "requested", never "removed" |

**Fix**

| Jurisdiction | Lever |
| --- | --- |
| UK and EU | Erasure (Art. 17) and the absolute right to object to direct marketing (Art. 21). One month to respond. The broker must also tell recipients it passed the data to (Art. 19) |
| California | One free DROP request reaches every registered broker; processed on a 45-day cycle. Plus CCPA rights to delete and to opt out of sale or sharing, exercisable through an authorised agent |
| Other US states with privacy laws | Similar deletion and opt-out rights; details and agent rules vary by state |
| Rest of US | Site-by-site voluntary opt-out forms |

Plus the national suppression lists that cut marketing at the source: Telephone and Mailing Preference Services in the UK; DMAchoice, the Do Not Call registry and OptOutPrescreen in the US.

**Automation.** Email-based requests: L2 now, L3 later. Web-form opt-outs: L0/L1 (guided, with pre-filled answers); automating them means browser automation against sites that fight it. DROP: L0 walkthrough, since the person must verify residency themselves.

**Limits.** Re-listing is normal. Private brokers cannot be independently verified. Our broker list will be shorter than incumbents' for a long time; say so.

**Recurrence.** High. Quarterly re-sweeps are a legitimate recurring service.

### 3. Shared

This is the "apps sold my data" angle. It is the least visible path and the one with the least competition.

**Detect.** Sharing cannot be observed from outside. Four proxies make it concrete:

| Method | What it reveals | Trust cost |
| --- | --- | --- |
| **Account inventory** from a password-manager export | Every service the person has an account with, typically 100–300 | Low: parse the file in the browser, send only site names, never passwords or usernames |
| **Platform transparency exports** | Meta's "activity off Meta technologies" lists every business that sent Meta data about the person. Parsed in the browser, it produces a named list of who shared | Low: the person downloads their own file |
| **Access request** | Asking a specific company who received the data (Art. 15(1)(c)) and where it came from (Art. 15(1)(g)). EU case law supports naming actual recipients where possible | Medium: sends a legal request |
| **Privacy-policy reading** | An LLM extracts whether a service says it sells or shares data, with whom, and where the opt-out lives. Done once per company and stored in the directory | None |

Later, with more trust and budget: inbox connection to discover accounts from welcome emails (needs Google's restricted-scope security assessment, so not in the MVP), and per-service email aliases to see which signup an unexpected sender traces back to (an indication, never proof).

**Fix**

| Situation | Lever |
| --- | --- |
| Dormant account | Delete it (in-product control, or erasure request). The single highest-yield action on this path: data that no longer exists cannot be shared, sold or breached |
| Active account that shares for advertising | Object to marketing use (EU/UK) or opt out of sale/sharing (US states); switch off ad personalisation in the account |
| Platform-level tracking | Clear and disconnect off-platform activity; turn off ad personalisation; delete the mobile advertising ID; disable app tracking requests |
| Browser | Turn on Global Privacy Control, a signal that several US state laws require businesses to honour as an opt-out |
| AI training on personal content | Per-platform objection forms and settings |

**Automation.** Inventory and policy reading: full. Device and platform settings: L0 checklist, about 15 minutes, once. Erasure and objection requests: L2. Requests to a company where the person has an account work best when sent from the account's own email address, so offer "send from my email" (L1) alongside the relay.

**Limits.** We can show who a company says it shares with and who admits receiving data. We cannot prove a specific sale occurred. Phrase it as "shares data with advertising partners according to its policy", not "sold your data".

**Recurrence.** Medium, driven by new signups. A monthly "new accounts to review" prompt keeps it alive.

### 4. Published

**Detect.** Source-specific lookups, mostly manual or guided: company registers, the open electoral register, property and planning records, court and insolvency notices, domain registration records, professional registers.

**Fix.** Limited and specific to each register. Examples: UK company-register address suppression (a fee per document, with conditions); opting out of the open electoral register; domain privacy; in the US, state address-confidentiality programmes for people at risk. Where the source cannot be changed, fix the copies (path 2) and the index (path 6).

**Automation.** L0 guides, with L1 drafting where a form needs supporting text.

**Limits.** Many public records are public on purpose and stay that way. The product must say so plainly; overpromising here is how the category gets its bad reputation.

**Recurrence.** Low. This path is a content and playbook pack, not a subscription driver.

### 5. Posted

**Detect**

| Method | Finds |
| --- | --- |
| Username check across a public list of several hundred sites | Forgotten profiles under the person's handles. Noisy: treat every hit as "possible" |
| Web search on name plus phone, email or address | Old posts, CVs, listings, club pages |
| Guided platform audit | What a stranger sees on each profile |

**Fix.** Privacy settings (deep links per platform), deleting old accounts (joins path 3), bulk post deletion with third-party tools, asking the site owner, and for content others posted: the platform's reporting route, then a rights request, then index removal.

**Automation.** Discovery: full. Fixes: L0, some L1.

**Limits.** Content posted by other people is the hard case. Intimate images, harassment and doxxing need specialist routes; signpost them (for example StopNCII) and do not pretend to handle them.

**Recurrence.** Low to medium.

### 6. Indexed

**Detect.** A search-API sweep on combinations of name with city, phone, email and address; an LLM sorts hits into "about this person / not / unsure" and labels data types; the person confirms. Separately, an **AI probe**: ask the major assistants what they know about the person and show the answers.

**Fix**

| Target | Lever |
| --- | --- |
| Google | Results About You where available (US and Japan at the time of writing); the outdated-content tool anywhere; the right-to-be-forgotten form in the UK and EU |
| Bing and others | Their own removal and right-to-be-forgotten forms |
| AI assistants | Each provider's privacy request route for personal data in responses; opt-outs from training on the person's own content |

Always fix the source first where possible. Removing a search result leaves the page up.

**Automation.** Sweep and triage: full. Removal forms: L0/L1.

**Limits.** Index removal changes findability, not existence. AI answers are not stable; a probe is a sample.

**Recurrence.** Medium. A monthly sweep is cheap and produces visible "new / gone" changes for the report.

## What the matrix says to build

| Path | Demand at the trigger | Recurrence | Automatable fix | Competition | Build |
| --- | --- | --- | --- | --- | --- |
| Stolen | High | High | Guided | Alerts everywhere, fixes nowhere | **First.** Free front door and retention backbone |
| Shared | Medium (high once shown) | Medium | High, via requests | Thin | **Second.** The differentiator and the engine's first target list |
| Sold | High in the US, medium elsewhere | High | High for email, low for forms | Crowded | **Third.** Same engine, new target lists; table stakes for Autopilot |
| Indexed | High | Medium | Medium | Partial | **Fourth.** Strong demo, strong report content |
| Posted | Medium | Low | Low | Thin | Checklists inside onboarding |
| Published | Low overall, high for some | Low | Low | Thin | Content pack |

The pattern: lead with the path that brings people in and brings them back (Stolen), make money on the engine that fixes paths 2 and 3, and use paths 4–6 to make the picture complete.
