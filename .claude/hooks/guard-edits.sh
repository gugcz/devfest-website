#!/usr/bin/env perl
# PreToolUse hook for file edits (Edit, Write, MultiEdit, NotebookEdit).
#
# - Build output and lockfiles are denied: change the source or the manifest
#   and rebuild or reinstall instead.
# - Files that reach the Firebase project shared with the mobile app or the
#   production deploy, and the hooks and shared permissions themselves, ask
#   first (CLAUDE.md > Firebase shared project).
#
# The guarded paths live in HookLib.pm, shared with block-deploy.sh, which
# asks before a Bash command writes to one. Each path is resolved against
# its own worktree, so `./dist/x`, `src/../dist/x`, `DIST/x` and a file in
# another worktree all count.
#
# Perl core modules only, like block-deploy.sh. An unreadable input is let
# through: this guard is a convenience, the deploy guard is the hard one.
use strict;
use warnings;
use JSON::PP;
use FindBin;
use lib $FindBin::RealBin;
use HookLib;

local $/;
my $raw = <STDIN>;
my $input = eval { JSON::PP->new->decode($raw) } or exit 0;
my $file = $input->{tool_input}{file_path} // $input->{tool_input}{notebook_path} // '';
exit 0 if $file eq '';

my $root = $ENV{CLAUDE_PROJECT_DIR} // '';
my $base = $input->{cwd} // ($root ne '' ? $root : '.');
my $rel = HookLib::repo_relative($file, $base, $root);
exit 0 if $rel eq '';

my ($decision, $reason) = HookLib::classify($rel);
exit 0 if $decision eq '';

print JSON::PP->new->canonical->encode({
	hookSpecificOutput => {
		hookEventName            => 'PreToolUse',
		permissionDecision       => $decision,
		permissionDecisionReason => $reason,
	},
});
exit 0;
