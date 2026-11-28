---
title: "fix(email): ticket and invoice e-mails use the current tagline"
type: fix
date: 2026-11-28
---

## fix(email): ticket and invoice e-mails use the current tagline - Minimal

Part 3 of 3 of [the Claude Code setup fix](2026-11-28-fix-claude-code-setup-plan.md).

## Overview

The e-mail footer prints `SITE.event.tagline` from `functions/src/site.ts`,
which still reads "Prague's developer conference & festival". The site's
tagline is "Developer conference & festival". This part switches the
functions copy to match.

Edition, invoice close date, `dateLine` and `venue` stay on 2026: the
e-mails print them together, and 2027 has no date or venue yet.

## Implementation

- [ ] `functions/src/site.ts`: `tagline: 'Developer conference & festival'`.

## Success Criteria

```success-criteria
GOAL: The ticket and invoice e-mails print the site's current tagline.

SUCCESS CRITERIA:
- The functions copy no longer says "Prague's" | verify: ! grep -n "Prague's" functions/src/site.ts
- The function tests pass | verify: npm --prefix functions test
- The full gate is green | verify: npm run verify

NON-GOALS:
- Edition, invoice close date, dateLine and venue for 2027.

VERIFICATION COMMAND: ! grep -n "Prague's" functions/src/site.ts && npm run verify
```

## Dependencies

None. Branch from `main`. Merging deploys production functions through
`firebase-functions-merge.yml`; the PR says so in its Behavior section.

## References

- E-mail footer: `functions/src/invoice/email.ts:175`
- Site tagline: `src/site.config.ts`
