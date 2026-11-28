#!/usr/bin/env bash
# SessionStart hook: install npm dependencies in a fresh checkout (cloud
# session, new worktree) so `npm run verify` runs without a setup step.
# Skips a tree whose last install finished (npm writes
# node_modules/.package-lock.json at the end); never fails the session.
# A failed install is removed, so the next session tries again, and
# reported on stdout, which Claude reads as session context.
set -u
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

for dir in . functions; do
	if [ -f "$dir/package-lock.json" ] && [ ! -f "$dir/node_modules/.package-lock.json" ]; then
		echo "session-start: npm ci in $dir" >&2
		if ! npm --prefix "$dir" ci --no-audit --no-fund >&2; then
			rm -rf "$dir/node_modules"
			echo "session-start: npm ci failed in $dir and its node_modules was removed. Run npm --prefix $dir ci before npm run verify."
		fi
	fi
done
exit 0
