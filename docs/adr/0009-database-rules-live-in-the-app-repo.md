# 0009. Firestore and RTDB rules live whole in the app repo

- Status: accepted
- Date: 2026-10-21
- PR: [#481](https://github.com/gugcz/devfest-website/pull/481)
- Supersedes: the rules bullet of [0002](0002-shared-firebase-project.md)

## Context

[0002](0002-shared-firebase-project.md) split the Firestore and RTDB rules by
collection between this repo and the mobile app's, merged by hand in the
console. Both rulesets are project-global, so each deploy from one side
replaced the other's half.

## Decision

The app repo (`ryzizub/devfest_mobile_app`) holds `firestore.rules` and
`database.rules.json` whole and deploys them from its CI. This repo keeps no
rules files and deploys only its functions and the `devfest-public` hosting
site. A rule this site needs is a PR in the app repo.

## Consequences

- Rules are no longer a manual console step.
- A website change that needs a new collection or path waits on an app-repo
  PR; the list of what this site reads and writes is in CLAUDE.md.
