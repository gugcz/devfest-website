# CLAUDE.md

Guidance for Claude Code working in this repository.

## Agents do not merge to `2026` and do not deploy

`2026` is production: a merge into it deploys to devfest.cz. **Only the
maintainer merges, pushes to it, or deploys.** An agent's work ends at: branch
pushed, PR opened, CI reported.

- Never `git push origin 2026`, `gh pr merge`, `firebase deploy`, dispatch a
  deploy workflow, or cut a release tag.
- "push it", "ship it", a green CI report — not merge permission. Only an
  instruction naming the merge is ("merge PR #X", "mergni", "revertni").
- Permission is per PR, once. Does not carry to the next PR or a follow-up fix.
- Hand back the **PR preview URL** (`devfest-public--pr-<n>-*.web.app`), never
  a production URL.

Enforced by a PreToolUse hook (`.claude/hooks/block-deploy.sh`, wired in
`.claude/settings.json`): pushes to `2026`, PR merges, `firebase deploy`,
`npm run deploy`-style scripts, workflow dispatch and release tags are denied
before they run — including through `sh -c`, `eval`, `git -C`, `npx -p` and
flag-before-verb spellings. The hook is a belt against accidents; the
boundary is the GitHub ruleset on `2026` (pull request required).

## Real customer data never enters this repository

**The repo is public.** Pushed data is world-readable forever (orphaned
commits stay reachable by SHA). Never commit real customer, partner or
attendee data anywhere — fixtures, doc examples, commit messages, branch
names, PR text, internal ids (tickets, invoices, Firestore/RTDB doc ids,
iDoklad contact ids, order ids).

Covered: names, emails, phones, addresses, VAT / IČO / DIČ, invoice/order
numbers, discount codes, any id mapping to those. Masking is not an exemption.

Use obviously fake stand-ins: `Acme Example s.r.o.`, IČO `12345678`,
`billing@example.com`, ids like `4242`. A real value needed for a repro stays
in the issue tracker.

# DevFest Website

DevFest.cz 2026 landing page. Astro 7, React 19 islands, TypeScript strict,
SCSS (CSS Modules for React, globals in `BaseLayout.astro`), Node >= 22.12.0,
Firebase Hosting.

Commands, setup, deploys, secrets: [README.md](README.md). No lint script.
Checks: `npm run a11y` (axe on an `A11Y_MOCK=1` build), `npm test` in
`functions/` (`node --test`, stubs `fetch`). Function tests compile via
`tsconfig.test.json` into `lib-test/`; deploy `tsconfig.json` excludes
`*.test.ts`.

## PR conventions

- **No `## Test plan` section.** Summary / Why / Behavior / Files, stop.

## Architecture

### Pages & Routing

File-based under `src/pages/` — list in [README.md](README.md#key-pages).
React islands (`.tsx`, `client:load`) in `src/components/`.

### Browser data access (`/api/*`)

**Browser reads DB data only through cached HTTP functions, never the client
SDK** (client reads blocked on an App Check token, ~30s on mobile).

| Endpoint | Function | Reads | Caller |
| --- | --- | --- | --- |
| `/api/lineup` | `lineupApi` | Firestore `speakers` + `sessions` | `src/lib/lineup.ts` |
| `/api/tickets` | `ticketsApi` | RTDB `/tickets` | `src/lib/tito.ts::fetchTickets` |

- 2nd-gen `onRequest`, public, `europe-west1`, codebase `website`. Edge
  `s-maxage` + in-instance memo. Lineup TTL 15min, tickets 5min. Failed read →
  `no-store` 503.
- `lineupApi` scales to zero; `ticketsApi` has `minInstances: 1` (override in
  `tickets-api.ts`, not the preset).
- Rewrites carry **no `pinTag`**: hosting deploys never build functions.
  Functions deploy only via `firebase-functions-merge.yml`. A PR preview hits
  **production** functions — verify function changes locally.
- Endpoints return raw docs; browser parses with `speakerFromDoc` /
  `sessionFromDoc` / `filterDisplayable`.
- Dev and a11y serve `/api/*` from `scripts/a11y-mocks/api.mjs` (a dev server
  has no rewrite table). `DEVFEST_LIVE_API=1 npm run dev` hits deployed
  functions. Only `firebase/app-check` is mocked under `A11Y_MOCK`.

### Domain rules (`.claude/rules/`)

Path-scoped; they load when you touch matching files. Read one directly when
working outside its paths.

| Rule | Covers |
| --- | --- |
| `analytics.md` | GA4 Consent Mode, page views, conversion events |
| `backend.md` | `functions/src/lib/` helpers, option presets, error/HTTP/Slack rules |
| `tickets.md` | ti.to flags, cache, visibility, domain layout |
| `sessionize.md` | lineup sync, delete-guard, photo mirror |
| `invoices.md` | iDoklad OAuth/API, invoice flow, discount code, emails |
| `invite.md` | `/invite/<member>` pages, CTA, visual direction |

### Styling

[DESIGN.md](DESIGN.md) is the source of truth. Tokens in `BaseLayout.scss`;
React components use co-located `.module.scss`.

### Design workflow

**Pencil first.** `design/devfest.pen` (pen.dev, MCP server `pencil` in
`.mcp.json`) is the primary design tool: a surface is composed on the canvas
from the `Components` frame before it is coded, and the canvas variables
mirror `BaseLayout.scss` tokens. **Impeccable** (`/impeccable shape`,
`critique`, `audit`, the design hook on UI edits) is the brief and the gate.
`PRODUCT.md` is product truth; `DESIGN.md` + `.impeccable/design.json` are
the design record and move in the same PR as any token or primitive change.
Full loop and guardrails: `.claude/rules/design-pencil.md`.

### SEO

`BaseLayout.astro`: meta, OG/Twitter, JSON-LD (Event + WebSite). Sitemap via
`@astrojs/sitemap`.
