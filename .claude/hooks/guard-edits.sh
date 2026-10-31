#!/usr/bin/env perl
# PreToolUse hook for file edits (Edit, Write, MultiEdit, NotebookEdit).
#
# - Build output and lockfiles are denied: change the source or the manifest
#   and rebuild or reinstall instead.
# - Files that reach the Firebase project shared with the mobile app, or the
#   production deploy, ask first (CLAUDE.md > Firebase shared project).
#
# Perl + core JSON::PP only, like block-deploy.sh. An unreadable input is let
# through: this guard is a convenience, the deploy guard is the hard one.
use strict;
use warnings;
use JSON::PP;

local $/;
my $raw = <STDIN>;
my $input = eval { JSON::PP->new->decode($raw) } or exit 0;
my $file = $input->{tool_input}{file_path} // $input->{tool_input}{notebook_path} // '';
exit 0 if $file eq '';

my $root = $ENV{CLAUDE_PROJECT_DIR} // '';
my $rel = $file;
$rel =~ s{^\Q$root\E/}{} if $root ne '';

sub decide {
	my ($decision, $reason) = @_;
	print JSON::PP->new->canonical->encode({
		hookSpecificOutput => {
			hookEventName            => 'PreToolUse',
			permissionDecision       => $decision,
			permissionDecisionReason => $reason,
		},
	});
	exit 0;
}

if ($rel =~ m{^(dist|functions/lib|functions/lib-test)/}) {
	decide('deny', "$rel is build output. Edit the source and rebuild.");
}
if ($rel =~ m{^(functions/)?package-lock\.json$}) {
	decide('deny', "$rel is a lockfile. Change package.json and run npm install in that directory.");
}
if ($rel =~ m{^(firebase\.json|public/\.well-known/apple-app-site-association|\.github/workflows/firebase-[\w-]+\.yml)$}) {
	decide('ask', "$rel reaches the Firebase project shared with the mobile app or the production deploy. Read CLAUDE.md > Firebase shared project before changing it.");
}
exit 0
