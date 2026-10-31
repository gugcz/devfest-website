# DevFest Website

DevFest.cz 2026 landing page. Astro 7, React 19 islands, TypeScript strict,
SCSS (CSS Modules for React, globals in `BaseLayout.astro`), Node >= 22.12.0,
Firebase Hosting + Cloud Functions in the project `devfest-cz-app`, shared with
the mobile app ([Firebase shared project](#firebase-shared-project)).

CLAUDE.md stays short and always true. Setup, deploys, secrets and console
steps: [README.md](README.md). Why things are the way they are:
[docs/adr/](docs/adr/README.md). Anything that only matters when touching
certain files is a [path-scoped rule](#path-scoped-rules).

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
`.claude/settings.json`): pushes to `2026` (also a bare `git push` or
`git push origin HEAD` while on `2026`, or when the branch cannot be
resolved), PR merges, `firebase deploy`, `npm run deploy`-style scripts,
workflow dispatch and release tags are denied before they run — including
through `sh -c`, `eval`, `git -C`, `npx -p` and flag-before-verb spellings.
The hook is a belt against accidents; the boundary is the GitHub ruleset on
`2026` (pull request required).

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
- `src/layouts/`: `BaseLayout.astro` (meta, OG, JSON-LD; tokens and global
  SCSS in `BaseLayout.scss`), `Share.astro` (share-page preview, then
  forward) and `Redirect.astro` (`/press`, `/sessions`).
- `functions/src/<domain>/`: Cloud Functions per domain (`tickets`,
  `sessionize`, `lineup`, `invoice`, `workshops`); shared helpers in `lib/`,
  option presets in `options.ts`.
- `scripts/`: the axe sweep (`a11y.mjs`), its `/api/*` fixtures
  (`a11y-mocks/`) and the anchor-scroll measure (`anchor-measure.mjs`,
  `npm run anchors`).
- `public/`: static assets, the press kit, `.well-known/` (iOS app links).
- `docs/design.md`: the design system; `docs/product.md`: the product
  record.
- `docs/adr/`: architecture decision records; `docs/brainstorm/` and
  `docs/plan/`: the `vgv-wingspan` brainstorms and plans, committed with the
  change they led to and never deleted (`.claude/rules/docs.md`).

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

Only a green `npm run verify` counts as green: `astro check` alone misses
complexity, the function tests and the axe sweep. A function over 15 is
refactored; never raise the threshold or add an ignore comment.

## Plugins and project tooling

- **Plugins.** `vgv-wingspan` and Impeccable are declared in
  `.claude/settings.json` (`extraKnownMarketplaces` + `enabledPlugins`);
  Claude Code offers to install them when the repo is trusted. **Where a
  plugin skill or agent disagrees with this file, `docs/design.md` or
  `.claude/rules/`, the repo wins.**
- **`vgv-wingspan`** is the workflow for anything bigger than a small fix:
  1. `/brainstorm` writes to `docs/brainstorm/`. Commit the file.
  2. `/plan` writes to `docs/plan/`. The plan is approved, and linked from
     its issue if there is one, before code.
  3. `/build` implements the plan.
  4. `/review` runs the architecture, test-quality and simplicity agents.
  - `/hotfix` for an urgent fix, `/debrief` after an incident.
  - Finish with the project `ship` skill rather than `/create-pr`.
- **Impeccable**: `/impeccable shape`, `critique`, `audit` and the design hook
  on UI edits. Reads `docs/product.md` and `docs/design.md` (its
  `.impeccable/design.json` sidecar comes from `/impeccable document`).
  Loop: `.claude/rules/design.md`.
- **Skills** (`.claude/skills/`): `ship` runs the definition of done.
  `update-docs` keeps the product record, the design record (via
  Impeccable), the ADRs, CLAUDE.md and README true to the code.
- **Hooks** (`.claude/hooks/`, wired in `.claude/settings.json`):
  - `block-deploy.sh`: [above](#agents-do-not-merge-to-2026-and-do-not-deploy).
  - `guard-edits.sh` denies hand edits to build output and lockfiles
    (`dist/`, `functions/lib/`, `functions/lib-test/`, `package-lock.json`)
    and asks before editing what reaches the shared project (`firebase.json`,
    the deploy workflows, the iOS app-links file).
  - `session-start.sh` runs `npm ci` in a fresh checkout.
  - `.env` files are denied to Claude in `permissions.deny`;
    `permissions.allow` pre-approves only the `verify` gate and its parts,
    `npm ci` and read-only git (never push, merge or deploy).
- **Path-scoped rules** (`.claude/rules/`): [below](#path-scoped-rules).

## Path-scoped rules

`.claude/rules/*.md` load when Claude reads a file under their paths. Read
one directly when working outside them.

| Rule | Paths | Covers |
| --- | --- | --- |
| `api.md` | `/api/*` functions, their browser callers, `scripts/a11y-mocks/**`, `firebase.json`, `astro.config.mjs` | The `/api/*` endpoint table, cache TTLs, callables for writes, dev mocks |
| `pages.md` | `src/pages/**`, `src/layouts/**`, `public/.well-known/**`, `astro.config.mjs` | Routes, SEO (meta, OG, JSON-LD, sitemap), iOS app links |
| `backend.md` | `functions/**` | `functions/src/lib/` helpers, option presets, error/HTTP/Slack rules, function tests |
| `tickets.md` | `functions/src/tickets/**`, `src/lib/tito.ts`, `Tickets.tsx`, `InvoiceForm.tsx` | ti.to flags, cache, visibility, domain layout |
| `sessionize.md` | `functions/src/sessionize/**`, `functions/src/lineup/**`, the lineup helpers, share pages | Lineup sync, delete-guard, photo mirror, share pages |
| `invoices.md` | `functions/src/invoice/**`, `InvoiceForm.tsx`, `invoice.astro` | iDoklad OAuth/API, invoice flow, discount code, emails |
| `workshops.md` | `functions/src/workshops/**`, `src/lib/workshops.ts`, `Workshops.tsx`, `workshops.astro` | Seat limits, waitlist order, the app's ticket login |
| `analytics.md` | `src/lib/firebase.ts`, `analytics.ts`, `consent.ts`, `CookieBanner.astro`, the thank-you pages | GA4 Consent Mode, page views, conversion events, Performance Monitoring |
| `invite.md` | `src/pages/invite/**`, `src/pages/og/invite/**`, `src/lib/invite.ts`, `InviteCta.tsx`, `team.json` | `/invite/<member>` pages, CTA, visual direction |
| `design.md` | `docs/design.md`, `docs/product.md`, `.impeccable/**`, `src/components/**`, `src/pages/**`, `src/layouts/**`, `src/styles/**` | Impeccable loop, `docs/design.md` as the record |
| `docs.md` | `docs/**`, `README.md`, `CLAUDE.md`, `.claude/**`, the PR template | README, CLAUDE.md, ADRs, brainstorms, plans, what goes where |

## Firebase shared project

**The website and the mobile app (`ryzizub/devfest_mobile_app`) deploy to the
same Firebase project, `devfest-cz-app`.** Getting this wrong breaks the other
one ([ADR 0002](docs/adr/0002-shared-firebase-project.md)). Function
conventions: `.claude/rules/backend.md`; endpoints: `.claude/rules/api.md`.

- This repo is `"codebase": "website"`; deploys are only ever
  `--only functions:website` (the workflow) and the `devfest-public` hosting
  site. The app is codebase `app` and owns the `devfest-cz-app` hosting site.
- Hosting deploys never build functions. Functions deploy only via
  `firebase-functions-merge.yml`. A PR preview hits **production** functions —
  verify function changes locally.
- The browser reads data only through the cached `/api/*` functions and writes
  only through callables, never the client SDK
  ([ADR 0001](docs/adr/0001-browser-reads-through-cached-api.md)).
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
- Firestore and RTDB rules are project-global, so they live whole in the app
  repo (`ryzizub/devfest_mobile_app`: `firestore.rules`,
  `database.rules.json`) and deploy from its CI. A rule this site needs
  (Firestore `sessions`, `speakers`, `invoices`; RTDB `tickets`,
  `webhookDedup`) is a PR there. `rooms`, `invoiceRateLimits` and RTDB
  `workshops`, `ops` are server-only under the root deny. Storage
  `speakers/` stays this repo's.
- App Check enforcement is project-global; coordinate before flipping it.

## Work tracking

- Conventional Commits with a scope; the subject says what a visitor or the
  maintainer notices, not which file moved:
  `fix(menu): second tier back in the list, one step smaller`.
  Types in use: `feat`, `fix`, `refactor`, `perf`, `docs`, `ci`, `chore`,
  `security`.
- PR title = the squash commit subject, same format.
- PR body follows `.github/PULL_REQUEST_TEMPLATE.md`: Summary / Why /
  Behavior / Files / Type of Change. **No `## Test plan` section.** Name any
  `verify` check you skipped.
- Branches: humans `<type>/<slug>`, Claude Code `claude/<slug>`. Dependabot
  opens grouped weekly bumps for the root, `functions/` and Actions.
- Docs stay true through `update-docs`: `docs/product.md` and ADRs by hand,
  `docs/design.md` through `/impeccable document`.

## Definition of done

1. Anything bigger than a small fix has a committed plan in `docs/plan/`.
2. `npm run verify` passes on the branch. A change that cannot touch one of
   the checks may skip it, but say which and why in the PR.
3. A change to architecture (data access, the Firebase split, a new
   integration, storage) records its decision in `docs/adr/` in the same PR.
4. `/review` (or a review agent) has run over the diff and its findings are
   fixed or answered.
5. The branch is committed and pushed, and a draft PR against `2026` is open.
6. CI is green on the PR's head.
7. The user has the PR link and its preview URL
   (`devfest-public--pr-<n>-*.web.app`).

The `ship` skill (`.claude/skills/ship/`) runs steps 2–7. Never share a PR
as ready before step 2 is green.
