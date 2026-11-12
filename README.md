# Koverr launch pages

Landing pages for a pre-launch personal data leak fixer. The product strategy, PRD and build plan are in [docs/](docs/README.md); earlier exploration is in the [AI privacy agent plan](https://app.notion.com/p/3f543965b45d80b78b5fef8e5d43568b).

| Route | Signup key | Message |
| --- | --- | --- |
| `/` | `director` | Find the leaks. Get them fixed. |
| `/breach/` | `breach` | Got a breach email? Here’s the fix. |
| `/scam-calls/` | `scam` | How did they get your number? |
| `/home-address/` | `address` | Is your home address online? |
| `/leak-map/` | `map` | Interactive radial tree with sample privacy controls and real breach / tracker data |
| `/privacy/` | | How the launch list uses what you give it |

The radial map starts with a clearly labelled fictional footprint. Filters select public visibility, potential action and data type; the preview marks simulated hiding/removal with green hollow nodes and dashed branches while preserving the layout. Counts are appearances of a detail at a source, and the average is per visible source, not per person. The two real-data tabs show account records and site–company pairs separately; neither dataset measures removal potential. The source table provides an alternative to selecting tree nodes.

The leak map reads `src/data/leak-map.json`. Refresh it with `npm run leak-map-data`, which pulls the Have I Been Pwned breach list and the latest WhoTracks.me month (both CC BY 4.0). Sector groups, short names and severity steps are defined in `scripts/leak-map-data.mjs`.

The pages share an email signup with two optional follow-up questions, a leak record that starts in black and white and gains colour as the leak is fixed, a market map of real breach data, the six leak paths, a sample leak record, and an FAQ. Headlines, the six paths and the question options live in `src/lib/launch.ts`. Astro serves the pages and the signup endpoint. React owns the hero record, the market map and the leak map. GSAP drives the headline reveal. On phones the market map becomes a ranked list.

The brand rule: exposure is black and white, and colour returns when something is fixed. Greys show exposure; one green marks fixed leaks and the main action. Reduced motion shows the fixed state without animation.

## Run locally

Use Node.js 24.14 or newer in the Node 24 release line.

```sh
npm ci
npm run dev
```

Astro prints the local URL. The default SQLite file is `.data/waitlist.sqlite` and is created on the first valid signup.

```sh
npm run check
npm run build
HOST=127.0.0.1 PORT=4321 npm start
```

## Use the launch list

Every form saves to the same database. An email counts once across all pages, and the database keeps the page associated with the first signup. The email form works with JavaScript disabled. This project stores signups. The launch invitation is sent separately from an email service.

After a successful signup the form asks two optional one-tap questions: where the person lives (UK, EU or EEA, US, Canada, Australia or NZ, somewhere else) and what worries them most (a breach, scam calls and spam, being findable, fraud, apps sharing data). Answers are tied to the signup by a single-use token that expires after a day. An email that was already on the list gets the same confirmation and a token that matches nothing, so the response never reveals who is on the list; the trade-off is that a repeat signup cannot change earlier answers. The questions need JavaScript.

```sh
npm run waitlist -- count
npm run waitlist -- answers
npm run --silent waitlist -- export > /path/to/private/launch-list.jsonl
npm run waitlist -- remove you@example.com
```

`count` totals signups per page. `answers` totals the two questions, which is the input for the launch-geography decision in [docs/01-strategy.md](docs/01-strategy.md#geography).

A database created by the first version of these pages is upgraded in place on the next signup: rows are copied to a table with the `region` and `worry` columns. Back up the file before deploying this version over a live list.

Set the same `WAITLIST_DB_PATH` for the server and the CLI. Keep the export private. Before you send launch invites, import the export into your email service and include a way to unsubscribe.

## Publish

Run the standalone Astro Node build on a host with a persistent volume. Put the database in a private directory on that volume and keep its backups private. This application uses one shared SQLite file. Multiple replicas would need shared storage with SQLite-compatible locking or a managed database.

Set `WAITLIST_DB_PATH` to the absolute database path. Set `WAITLIST_CONTACT` to the real inbox for requests to leave the list. Export `WAITLIST_ORIGIN` as the public HTTPS origin with no trailing slash at build time and runtime. Configure the reverse proxy to preserve the public host and scheme and rate-limit POST requests to `/api/launch-list/`. Send a test signup through the public URL before sharing the page.

The original signup keys, `director` and `address`, still identify `/` and `/home-address/`. Signups from the leak-fixer positioning, with the optional questions, use consent version `launch-invite-v3`.

The three campaign pages use `noindex` and are intended for campaign links. To compare messages, send comparable groups to each URL and record visitor totals for each group separately. `waitlist count` supplies the signup totals. There are no visitor analytics in this project.
