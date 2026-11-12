# 08 — Design direction

Current as of 12 November 2026. This file exists so that building the MVP extends the design that shipped on the launch pages instead of restoring the one it replaced. Where this file and an older sentence elsewhere in `docs/` disagree about how the product looks, this file wins. Where this file and [`DESIGN.md`](../DESIGN.md) disagree, `DESIGN.md` wins: it holds the exact tokens.

## The rule

**Exposure is black and white. Colour returns when a leak is fixed.**

A leak, a breach, a source of exposure: grey. A leak that has been found, requested, answered and checked: green. There is one chromatic colour. Nothing else in the product is allowed to be coloured. The rule is already a brand commitment in [`PRODUCT.md`](../PRODUCT.md); the launch pages now carry it, and the app must too.

## Source of truth

| What | Where |
| --- | --- |
| Tokens, type roles, components, do's and don'ts | [`DESIGN.md`](../DESIGN.md) and its sidecar `.impeccable/design.json` |
| Product context and brand commitments | [`PRODUCT.md`](../PRODUCT.md) |
| Colour, spacing and type tokens in code | `src/styles/market.css` (tokens at the top) |
| Base, header, form and record structure | `src/styles/site.css` |
| Leak-map page styles | `src/styles/leak-map.css` |
| Shared header and footer | `src/components/SiteHeader.astro`, `SiteFooter.astro` |
| Leak record (hero) | `src/components/HeroRecord.tsx` |
| Market map (treemap on desktop, ranked list on phones) | `src/components/MarketMap.tsx` |
| Interactive leak map | `src/components/LeakMap.tsx` |
| Signup and follow-up questions | `src/components/Signup.astro` |

`Shell.astro` loads `site.css` then `market.css` on every page. Build `/app` and `/admin` on the same shell, so they get the same tokens without copying them.

## What was retired, and must not come back

These belonged to the earlier direction. They were removed on 12 November 2026. Do not restore them from an old copy of the project, and do not rebuild them from the older notes in `docs/`.

- The cartoon artwork: the rubber-hose rabbit, the shopping-parcel, weather and fitness tanks, the frog, wolf and crow collectors, and the cork. The sprite atlas, its generation prompt (`ARTWORK.md`) and every use of it are gone.
- The pipe-and-cork overflow scene: the scroll-driven three-chapter animation, the "plug this leak" simulation, and the `flow-model` data behind it.
- The light paper theme with violet accents, the warm cel-style stage, and the blend-mode brand overlay.
- The two-sided colour system: coral and ochre for loss, mint and teal for gain.
- Acid green (`#e8ff61`) as the accent. The accent is now the fix green (`#4be38a`) and it means something.
- Scroll fades on every section and the staggered tile fade-in. The only authored motion is colour returning to a record.
- Colour-coded groups in the leak-map tree. Groups are told apart by labels and position, not hue.

## What the launch pages now contain

- A leak record beside the signup form in the first viewport. It starts grey and "Exposed", then turns green row by row as the request is sent, answered and checked. It can be replayed, and it shows its finished state under reduced motion.
- One breaches map built from real data (Have I Been Pwned), in greys, with a plain-language line under each source name. On phones it is a ranked list with the detail opening under the selected row.
- The six ways out as a real table. Only the fix column carries colour.
- A short "who picks it up" section with two greyscale archival photographs, and a link to the leak map for the tracker data.
- The full sample leak record, which colours row by row the first time it is read.
- The FAQ and a green closing signup block.

## Carrying it into the MVP

The product screens are lists, forms and detail pages ([05-architecture.md](05-architecture.md#stack)). They take the same system.

### Status colours

Status is never shown by colour alone, so every state has a text label ([03-prd-mvp.md](03-prd-mvp.md#non-functional)). Colour then follows the rule:

| State | Treatment |
| --- | --- |
| `closed_verified` | Fix green, label "Closed, checked", with the date and the kind of evidence |
| `closed_reported` | Green outline only, label "Closed, reported by the organisation". It is not the same as verified, and must not look the same |
| `possible`, `confirmed`, `in_progress`, `proposed`, `queued`, `sent`, `waiting`, `acknowledged`, `verifying` | Greys. The brighter the grey, the more it needs attention |
| `needs_identity`, `redirected`, `refused`, `escalation_ready`, `reminder_sent`, `complaint_drafted`, `regulator_draft` | Bright grey with a plain label and the next action. These are tasks for the person, not alarms |
| `reopened` | Back to grey, with the date it reopened. Colour is withdrawn when the fix stops holding |
| `not_mine`, `accepted`, `inconclusive` | Dim grey with a label |

Errors and warnings are written in plain words with the recovery, in warm white on a raised surface. Do not introduce red, amber or any second colour for them. If a product need cannot be met in grey, change `DESIGN.md` first and say why.

### Reuse before building

- Leak and request detail: start from the leak record (`HeroRecord`, and the sample record in `Landing.astro`). A dated log with a status line is the product's central object.
- Leak list and ranking: use the market map's ranked-list pattern (name, figure, plain-language line, bar) rather than cards.
- Fix plans and request approval: use the six-ways table pattern, which stacks into labelled blocks on phones.
- Forms and questions: use the signup structure, chips for one-tap answers, and the 44px minimum target.
- Proof report: the dated log, in greys with the green fixed rows. It prints well because the exposure is already black and white.

### Guardrails for anyone building on it

1. Take colours, type and spacing from the tokens in `market.css`. Do not add a hex value in a component. If a new value is genuinely needed, add it to the tokens and to `DESIGN.md`.
2. One typeface, Archivo, in the five roles in `DESIGN.md`. No second face without a role Archivo cannot do.
3. Flat tonal layering: ground, card, raised, bone. No shadows, gradients or glass.
4. No illustration, mascots, stock imagery in colour, or decorative graphics. Photographs, if any, are greyscale and credited.
5. No third-party scripts, session replay or advertising code. This matches the data policy in [05-architecture.md](05-architecture.md#data-policy-to-implement-then-publish).
6. Every animation needs a reduced-motion state that shows the finished result. Do not add motion beyond colour returning.
7. After changing UI, run the checks: `npm run check`, `npm run build`, and the Impeccable detector on the changed files. Then refresh the design record with `/impeccable document` so `DESIGN.md` still matches the code.

## Marketing copy and page status

The five landing-page changes proposed in [01-strategy.md](01-strategy.md#what-this-means-for-the-landing-page) are partly done:

| Change | Status on 12 November 2026 |
| --- | --- |
| Lead with the trigger; three headline variants | Done: `/breach/`, `/scam-calls/`, `/home-address/` |
| Replace "join the list" with a real leak check | Not yet. Waits for the leak check |
| Six-path language in the demo | Done, as the six-ways table (the old stream demo was removed) |
| A sample closed leak with dates and evidence | Done: the hero record and the sample record. The side-by-side "alert-only product" comparison is not built |
| Country and biggest-worry questions after signup | Done |

Open design questions that the MVP build will meet: how the leak-check result screen shows a clean result without implying "you are safe" (see [01-strategy.md](01-strategy.md#positioning)), and whether the optional "protected" preview on map tiles is worth building.
