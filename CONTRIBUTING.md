# Contributing

Thanks for helping with the DevFest.cz site. The repo is public and the
code is MIT ([LICENSE](LICENSE)); the brand, the photographs and the press
kit stay GUG.cz's.

## Run it

```bash
npm ci && npm --prefix functions ci
npm run dev          # /api/* served from fixtures
npm run verify       # the gate CI runs on every PR
```

Node 24 (`.nvmrc`). The dev server needs no Firebase credentials. Secrets
and console steps for the Cloud Functions: [README.md](README.md).

## Before you open a PR

- `npm run verify` is green: `astro check`, cognitive complexity (max 15,
  never raised, never ignored), the literal guard, the site and function
  tests, the axe sweep.
- A change that adds, removes or renames a page, a function, a secret or a
  rule updates the docs in the same PR (`.claude/rules/docs.md` says which).
- No real customer, partner or attendee data anywhere, not even masked
  (`CLAUDE.md`, "Real customer data never enters this repository").
- One branch per change, `<type>/<slug>`; Conventional Commits with a
  scope, the subject saying what a visitor or the maintainer notices.
- Open the PR as a draft against `2026` and fill
  `.github/PULL_REQUEST_TEMPLATE.md`. Every PR gets a preview channel;
  previews call the **production** functions.

`2026` is production. Only the maintainer merges, pushes to it or deploys.

## Using this site for your own event

[docs/adapting.md](docs/adapting.md): the config, the flags, the assets and
the Firebase project you need to change. The working rules for contributors
and coding agents are in [CLAUDE.md](CLAUDE.md).
