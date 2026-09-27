#!/usr/bin/env bash
# SessionStart hook: install npm dependencies in a fresh checkout (cloud
# session, new worktree) so `npm run verify` runs without a setup step.
# Skips a tree that already has node_modules; never fails the session.
set -u
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

for dir in . functions; do
	if [ -f "$dir/package-lock.json" ] && [ ! -d "$dir/node_modules" ]; then
		echo "session-start: npm ci in $dir" >&2
		npm --prefix "$dir" ci --no-audit --no-fund >&2 || echo "session-start: npm ci failed in $dir" >&2
	fi
done
exit 0
