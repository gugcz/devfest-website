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

The same goes for business internals: ticket sales numbers or pace, revenue,
conversion rates, or why a change matters commercially. Justify a change by
what a visitor sees or by public facts (a wave deadline, a price step). An
edited PR body keeps its old text in the public edit history.

# DevFest Website

DevFest.cz 2026 landing page. Astro 7, React 19 islands, TypeScript strict,
SCSS (CSS Modules for React, globals in `BaseLayout.astro`), Node >= 22.12.0,
Firebase Hosting + Cloud Functions in the project `devfest-cz-app`, shared with
the mobile app ([Firebase shared project](#firebase-shared-project)).

CLAUDE.md stays short and always true. Setup, deploys, secrets and console
steps: [README.md](README.md). Why things are the way they are:
[docs/adr/](docs/adr/README.md). Anything that only matters when touching
certain files is a path-scoped rule under `.claude/rules/`.

## Map of the repo

- `src/pages/`: file-based routes (list in [README.md](README.md#key-pages)).
  `speakers/[id]` and `talks/[id]` are share pages built from the lineup at
  build time; `invite/[member]` and `og/` are unlisted.
- `src/components/`: `.astro` sections and React islands (`.tsx`,
  `client:load`) with co-located `.module.scss`.
- `src/lib/`: browser and build helpers, one file per concern (`lineup.ts`,
  `tito.ts`, `workshops.ts`, `firebase.ts`, `analytics.ts`, …).
- `src/content/`: `faq.json`, `partners.json`, `team.json`. The mobile app
  bundles `faq.json` and `partners.json` verbatim, so a shape change there
  breaks its next copy.
- `src/layouts/`: `BaseLayout.astro` (meta, OG, JSON-LD, global SCSS, tokens)
  and `Share.astro` (share-page preview, then forward).
- `functions/src/<domain>/`: Cloud Functions per domain (`tickets`,
  `sessionize`, `lineup`, `invoice`, `workshops`); shared helpers in `lib/`,
  option presets in `options.ts`.
- `scripts/`: the axe sweep (`a11y.mjs`) and its `/api/*` fixtures
  (`a11y-mocks/`).
- `public/`: static assets, the press kit, `.well-known/` (iOS app links).
- `design/devfest.pen`: the Pencil canvas. `DESIGN.md` is the design system,
  `PRODUCT.md` the product record.
- `docs/adr/`: architecture decision records (`.claude/rules/docs.md`).

## Commands

| Task | Command |
| --- | --- |
| Install | `npm ci && npm --prefix functions ci` (the SessionStart hook does this when `node_modules` is missing) |
| Dev server | `npm run dev` (`/api/*` from mocks; `DEVFEST_LIVE_API=1` for deployed functions) |
| Full gate (= the CI checks) | `npm run verify` |
| Types | `npm run check` (`astro check`) |
| Cognitive complexity | `npm run complexity` (`sonarjs/cognitive-complexity`, max 15) |
| Function tests | `npm --prefix functions test` (`node --test`, stubs `fetch`) |
| Accessibility | `npm run a11y` (axe on an `A11Y_MOCK=1` build, needs Playwright Chromium) |

Function tests compile via `tsconfig.test.json` into `lib-test/`; deploy
`tsconfig.json` excludes `*.test.ts`. Only a green `npm run verify` counts as
green: `astro check` alone misses complexity, the function tests and the axe
sweep. A function over 15 is refactored; never raise the threshold or add an
ignore comment.

## Definition of done

1. `npm run verify` passes on the branch. A change that cannot touch one of
   the checks may skip it, but say which and why in the PR.
2. A change to architecture (data access, the Firebase split, a new
   integration, storage) records its decision in `docs/adr/` in the same PR.
3. The branch is committed and pushed, and a PR against `2026` is open.
4. CI is green on the PR's head.
5. The user has the PR link and its preview URL
   (`devfest-public--pr-<n>-*.web.app`).

The `ship` skill (`.claude/skills/ship/`) runs these steps. Never share a PR
as ready before step 1 is green.

## Commits and PRs

- Conventional Commits with a scope; the subject says what a visitor or the
  maintainer notices, not which file moved:
  `fix(menu): second tier back in the list, one step smaller`.
  Types in use: `feat`, `fix`, `refactor`, `perf`, `docs`, `ci`, `chore`,
  `security`.
- PR title = the squash commit subject, same format.
- PR body follows `.github/PULL_REQUEST_TEMPLATE.md`: Summary / Why /
  Behavior / Files. **No `## Test plan` section.** Name any `verify` check
  you skipped.
- Branches: humans `<type>/<slug>`, Claude Code `claude/<slug>`. Dependabot
  opens grouped weekly bumps for the root, `functions/` and Actions.

## Architecture

### Pages & Routing

File-based under `src/pages/` — list in [README.md](README.md#key-pages).
React islands (`.tsx`, `client:load`) in `src/components/`.

### Browser data access (`/api/*`)

**Browser reads DB data only through cached HTTP functions, never the client
SDK** (client reads blocked on an App Check token, ~30s on mobile;
[ADR 0001](docs/adr/0001-browser-reads-through-cached-api.md)).

| Endpoint | Function | Reads | Caller |
| --- | --- | --- | --- |
| `/api/lineup` | `lineupApi` | Firestore `speakers` + `sessions` + `rooms` | `src/lib/lineup.ts`, `src/lib/lineup-static.ts` (build) |
| `/api/tickets` | `ticketsApi` | RTDB `/tickets` | `src/lib/tito.ts::fetchTickets` |
| `/api/speaker-photo?id=` | `speakerPhotoApi` | Storage `speakers/{id}` or the Sessionize CDN (image bytes) | `src/components/SpeakerCard.tsx` |
| `/api/workshops` | `workshopsApi` | RTDB `/workshops` (seat counts only) | `src/lib/workshops.ts::fetchSeats` |

- 2nd-gen `onRequest`, public, `europe-west1`, codebase `website`. Edge
  `s-maxage` + in-instance memo. Lineup TTL 15min, tickets 5min, speaker
  photo 1 day, workshops 30s. Failed read → `no-store` 503.
- `ticketsApi` has `minInstances: 1` (override in `tickets-api.ts`, not the
  preset); the others scale to zero.
- Writes go through callables, never the client SDK: `submitInvoiceCallable`
  (`/invoice`) and `workshopRegistrationCallable` (`/workshops`). Both
  enforce App Check and list devfest.cz + PR previews in `cors`.
- Rewrites carry **no `pinTag`**: hosting deploys never build functions.
  Functions deploy only via `firebase-functions-merge.yml`. A PR preview hits
  **production** functions — verify function changes locally.
- Endpoints return raw docs; browser parses with `speakerFromDoc` /
  `sessionFromDoc` / `filterDisplayable`.
- The build reads production `/api/lineup` once for the share pages
  (`lineup-static.ts`, `DEVFEST_LINEUP_URL` overrides); a failed read builds
  none and `404.astro` forwards their links.
- Dev and a11y serve `/api/*` from `scripts/a11y-mocks/api.mjs` (a dev server
  has no rewrite table). `DEVFEST_LIVE_API=1 npm run dev` hits deployed
  functions. Only `firebase/app-check` is mocked under `A11Y_MOCK`.

### Firebase shared project

**The website and the mobile app (`ryzizub/devfest_mobile_app`) deploy to the
same Firebase project, `devfest-cz-app`.** Getting this wrong breaks the other
one ([ADR 0002](docs/adr/0002-shared-firebase-project.md)).

- This repo is `"codebase": "website"`; deploys are only ever
  `--only functions:website` (the workflow) and the `devfest-public` hosting
  site. The app is codebase `app` and owns the `devfest-cz-app` hosting site.
- Function names are unique per project: `camelCase` + trigger suffix
  (`Scheduled`, `Api`, `Webhook`, `Callable`, `Trigger`), no prefix. Check a
  new name against the app's before adding it.
- **Functions this repo deploys** (keep current): `refreshTicketsScheduled`,
  `ticketsApi`, `ticketsWebhook`, `dailyTicketStatusScheduled` (`tickets/`),
  `refreshSessionizeScheduled` (`sessionize/`), `lineupApi`,
  `speakerPhotoApi` (`lineup/`), `submitInvoiceCallable`,
  `processInvoiceTrigger`, `pollPaidInvoicesScheduled` (`invoice/`),
  `workshopsApi`, `workshopRegistrationCallable` (`workshops/`).
- The website **calls the app's** `verifyRegistrationCodeCallable` and
  `completeEmailVerificationCallable` for the workshop sign-in and reads the
  app's Firestore `users/{uid}`. Renaming either side breaks `/workshops`.
- Rules are split by collection and merged by hand in the console:
  this repo owns Firestore `sessions`, `speakers`, `rooms`, `invoices`,
  `invoiceRateLimits`, all of RTDB (`tickets`, `workshops`, `webhookDedup`,
  `ops`) and Storage `speakers/`. Neither `firestore.rules` nor
  `database.rules.json` is wired into `firebase.json`.
- App Check enforcement is project-global; coordinate before flipping it.
- `public/.well-known/apple-app-site-association` decides which devfest.cz
  links open the iOS app. List only paths the app has a route for.

### Domain rules (`.claude/rules/`)

Path-scoped; they load when you touch matching files. Read one directly when
working outside its paths.

| Rule | Covers |
| --- | --- |
| `analytics.md` | GA4 Consent Mode, page views, conversion events, Performance Monitoring |
| `backend.md` | `functions/src/lib/` helpers, option presets, error/HTTP/Slack rules |
| `tickets.md` | ti.to flags, cache, visibility, domain layout |
| `sessionize.md` | lineup sync, delete-guard, photo mirror, share pages |
| `invoices.md` | iDoklad OAuth/API, invoice flow, discount code, emails |
| `workshops.md` | seat limits, waitlist order, the app's ticket login |
| `invite.md` | `/invite/<member>` pages, CTA, visual direction |
| `design-pencil.md` | Pencil canvas, Impeccable loop, DESIGN.md as the record |
| `docs.md` | README, CLAUDE.md, ADRs, what goes where |

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
`@astrojs/sitemap`. Share pages and `/invite/*` set their own OG image.

## Project tooling

- **Plugins.** Impeccable is declared in `.claude/settings.json`
  (`extraKnownMarketplaces` + `enabledPlugins`); Claude Code offers to install
  it when the repo is trusted. **Where a plugin skill or agent disagrees with
  this file, `DESIGN.md` or `.claude/rules/`, the repo wins.**
- **Pencil** needs a local pen.dev app (the `.mcp.json` entry is the macOS
  desktop app path; the VS Code extension is the other route). In a cloud or
  Linux session the `pencil` server fails to start: say so, skip the canvas
  steps, and still run the Impeccable critique/audit and `npm run a11y`.
- **Skills** (`.claude/skills/`): `ship` runs the definition of done.
- **Hooks** (`.claude/hooks/`, wired in `.claude/settings.json`):
  - `block-deploy.sh` denies pushes to `2026`, merges, deploys, workflow
    dispatch and release tags ([above](#agents-do-not-merge-to-2026-and-do-not-deploy)).
  - `guard-edits.sh` denies hand edits to build output and lockfiles
    (`dist/`, `functions/lib/`, `functions/lib-test/`, `package-lock.json`)
    and asks before editing what reaches the shared project (`firebase.json`,
    the rules files, the deploy workflows, the iOS app-links file).
  - `session-start.sh` runs `npm ci` in a fresh checkout.
  - `.env` files are denied to Claude in `permissions.deny`.
