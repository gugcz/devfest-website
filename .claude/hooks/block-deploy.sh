#!/bin/bash
# PreToolUse hook: enforces the "agents do not merge to 2026 and do not deploy"
# rule from CLAUDE.md. Blocks the command unconditionally; the maintainer runs
# these from their own shell, never through Claude.
COMMAND=$(jq -r '.tool_input.command // empty')
[ -z "$COMMAND" ] && exit 0

# Drop heredoc bodies (file content, not commands), then split into one
# command per line on newlines, `;`, `&&`, `||` and `|`, and squeeze spaces.
CMDS=$(printf '%s\n' "$COMMAND" \
  | awk '
      skip && $0 == term { skip = 0; next }
      skip { next }
      match($0, /<<-?[ \t]*["'\''"]?[A-Za-z_][A-Za-z0-9_]*/) {
        term = substr($0, RSTART, RLENGTH)
        sub(/^<<-?[ \t]*["'\''"]?/, "", term)
        skip = 1
      }
      { print }
    ' \
  | perl -pe 's/(&&|\|\||\||;)/\n/g' \
  | perl -pe 's/[ \t]+/ /g; s/^ //; s/ $//')

deny() {
  echo "Blocked by .claude/hooks/block-deploy.sh: $1 (see CLAUDE.md — only the maintainer merges to 2026 or deploys)" >&2
  exit 2
}

# Each line is now one simple command; anchor every pattern to its start.
while IFS= read -r c; do
  [ -z "$c" ] && continue
  case "$c" in
    "git push "*)
      printf '%s' "$c" | grep -Eq '( |:)2026( |$)' && deny "git push to 2026"
      printf '%s' "$c" | grep -Eq ' --tags( |$)' && deny "pushing tags"
      ;;
    "gh pr merge"*) deny "gh pr merge" ;;
    "gh api "*)     printf '%s' "$c" | grep -Eq '/pulls/[0-9]+/merge' && deny "PR merge via gh api" ;;
    "firebase deploy"*) deny "firebase deploy" ;;
    "firebase hosting:channel:deploy live"*) deny "deploy to live channel" ;;
    "gh workflow run"*) deny "workflow dispatch" ;;
    "git tag "*)    printf '%s' "$c" | grep -Eq ' v?[0-9]' && deny "release tag" ;;
  esac
done <<< "$CMDS"

exit 0
