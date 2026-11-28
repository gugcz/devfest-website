#!/usr/bin/env perl
# PreToolUse hook for file edits (Edit, Write, MultiEdit, NotebookEdit):
# denies or asks for the guarded paths in HookLib.pm, which block-deploy.sh
# shares for Bash writes. Each path is resolved against its own worktree,
# so `./dist/x`, `src/../dist/x`, `DIST/x` and a file in another worktree
# all count.
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

my $rel = HookLib::repo_relative($file, $input->{cwd} // '.', $ENV{CLAUDE_PROJECT_DIR});
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
