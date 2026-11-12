# Koverr MVP handover

## 12 November 2026

Start with the [PRD](../docs/03-prd-mvp.md), [architecture](../docs/05-architecture.md), [build plan](../docs/07-validation-and-build-plan.md) and [design direction](../docs/08-design-direction.md). Work on the existing `MVP` branch. Commit and push each major update.

### Built

- The isolated `MVP/` implementation registers `/app/` in the existing Astro app. The route uses the shared shell and design tokens.
- Sample mode shows five fictional breaches, ranks the next three, and records done, skip and undo in a short-lived sample cookie.
- P1 breach guidance comes from a versioned JSON playbook. The ranking uses exposure sensitivity, freshness, estimated fix effectiveness and effort.

### Run

From the repository root, run `npm ci` if dependencies are missing and start `npm run dev`. Open `/app/` or go directly to `/app/?sample=1`. Use Node 24 or newer.

```sh
node --test MVP/test/*.test.ts
npm run check
npm run build
```

### Next

1. Add emailed verification and a Have I Been Pwned adapter. Exercise successful, clean and failed results. Scan only the authenticated account's verified email.
2. Persist results and progress in Postgres with per-account isolation. Implement export and deletion before enabling a public deployment.
3. Add the in-browser password check, the plan picker and internal experiment events.
4. Follow the later paid concierge milestones once the free check is ready.

The sample route needs no credentials. Live services are pending.
