#!/usr/bin/env perl
# PreToolUse hook: enforces the "agents do not merge to 2026 and do not deploy"
# rule from CLAUDE.md. Blocks the command unconditionally; the maintainer runs
# these from their own shell, never through Claude.
#
# A belt, not a boundary — the boundary is the GitHub ruleset on `2026`.
#
# Perl + core JSON::PP only, so there is no jq dependency to fail open on.
use strict;
use warnings;
use JSON::PP;

local $/;
my $raw = <STDIN>;
my $input = eval { JSON::PP->new->decode($raw) };
if (!$input) {
	print STDERR "block-deploy.sh: could not parse hook input; refusing to allow the command\n";
	exit 2;
}
my $command = $input->{tool_input}{command} // '';
exit 0 if $command eq '';

sub deny {
	my ($what) = @_;
	print STDERR "Blocked by .claude/hooks/block-deploy.sh: $what (see CLAUDE.md — only the maintainer merges to 2026 or deploys)\n";
	exit 2;
}

# 1. Join backslash line continuations so a wrapped command is one segment.
$command =~ s/\\\n\s*/ /g;

# 2. Drop heredoc bodies (file content, not commands). Only when the
#    terminator is actually found: an unterminated or quoted `<<` must not
#    swallow the commands that follow it. `<<-` allows a tab-indented terminator.
my @lines = split /\n/, $command;
my @kept;
for (my $i = 0; $i < @lines; $i++) {
	my $line = $lines[$i];
	push @kept, $line;
	next unless $line =~ /<<(-?)\s*["']?([A-Za-z_][A-Za-z0-9_]*)["']?/;
	my ($dash, $term) = ($1, $2);
	my $end;
	for (my $j = $i + 1; $j < @lines; $j++) {
		my $cand = $lines[$j];
		$cand =~ s/^\t+// if $dash;
		if ($cand eq $term) { $end = $j; last }
	}
	$i = $end if defined $end;
}

# 3. Split into simple commands on newlines, `;`, `&&`, `||`, `|`.
my @segments = map { split /\s*(?:&&|\|\||\||;)\s*/, $_ } @kept;

# Global options between executable and verb (`git -C . push`, `firebase --project p deploy`).
my $git_opts      = qr/(?:-C \S+|-c \S+|--git-dir=\S+|--work-tree=\S+|--no-pager|--paginate|-p|--no-optional-locks)\s+/;
my $firebase_opts = qr/(?:--project[= ]\S+|-P \S+|--config[= ]\S+|--token[= ]\S+|--non-interactive|--debug|--json|--force|-f)\s+/;
my $npm_opts      = qr/(?:--prefix[= ]\S+|-C \S+|-w \S+|--workspace[= ]\S+|--filter[= ]\S+|--cwd[= ]\S+|-s|--silent)\s+/;

while (@segments) {
	my $seg = shift @segments;
	$seg =~ s/^\s+|\s+$//g;
	$seg =~ s/\s+/ /g;
	next if $seg eq '';

	# 4. Strip wrappers and env assignments, then basename the executable, so
	#    `npx firebase deploy`, `FOO=1 firebase deploy`, `command gh pr merge`
	#    and `/usr/local/bin/gh pr merge` all reduce to the bare command.
	1 while $seg =~ s/^(?:[A-Za-z_][A-Za-z0-9_]*=\S*|env|command|sudo|exec|time|nohup|npx|pnpx|bunx|-y|--yes|--no-install|-p \S+|--package[= ]\S+)\s+//;
	$seg =~ s{^\S*/}{};
	$seg =~ s/^firebase-tools\b/firebase/;

	# 5. Unwrap `sh -c "…"` / `eval "…"` and scan the inner command.
	if ($seg =~ /^(?:sh|bash|zsh|dash|ksh|fish)\s+(?:-\S+\s+)*-\S*c\s+(.+)$/ || $seg =~ /^eval\s+(.+)$/) {
		my $inner = $1;
		$inner =~ s/^(["'])(.*)\1$/$2/s;
		unshift @segments, map { split /\s*(?:&&|\|\||\||;)\s*/, $_ } ($inner);
		next;
	}

	# 6. Drop quotes: `git push origin "2026"` is `git push origin 2026`.
	$seg =~ s/["']//g;

	$seg =~ s/^git $git_opts+/git /;
	$seg =~ s/^firebase $firebase_opts+/firebase /;
	$seg =~ s/^(npm|pnpm|yarn|bun) $npm_opts+/$1 /;

	if ($seg =~ /^git push\b/) {
		# Any refspec form landing on 2026: `2026`, `HEAD:2026`,
		# `x:refs/heads/2026`, `refs/heads/2026`, `+2026`, `:2026`.
		deny('git push to 2026') if $seg =~ /(?:^|[ :\/+])2026(?:\s|$)/;
		deny('pushing tags')     if $seg =~ /\s--tags(?:\s|$)/;
	}
	deny('gh pr merge')             if $seg =~ /^gh pr merge\b/;
	deny('PR merge via gh api')     if $seg =~ /^gh api\b.*\/pulls\/\d+\/merge/;
	deny('PR merge via GraphQL')    if $seg =~ /^gh api\b.*mergePullRequest/;
	deny('firebase deploy')         if $seg =~ /^firebase deploy\b/;
	deny('deploy to live channel')  if $seg =~ /^firebase hosting:channel:deploy live\b/;
	deny('deploy via package script') if $seg =~ /^(?:npm|pnpm|yarn|bun) (?:run |run-script |exec )?deploy\b/;
	deny('workflow dispatch')       if $seg =~ /^gh workflow run\b/;
	deny('workflow dispatch via gh api') if $seg =~ /^gh api\b.*\/dispatches\b/;
	deny('release tag')             if $seg =~ /^git tag\b.*\sv?\d/;
}

exit 0;
