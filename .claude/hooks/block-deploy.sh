#!/usr/bin/env perl
# PreToolUse hook for Bash and the terminal panel (mcp__terminal__run_in_terminal):
# enforces the "agents do not merge to main and do not deploy" rule from
# CLAUDE.md. The maintainer runs these from their own shell, never through
# Claude.
#
# Denies (exit 2):
# - git push to `main` or a year branch (`2026`, …), of every branch (`--all`,
#   `--mirror`, a `*` refspec) or of tags; a bare push from `main`, a year
#   branch or a branch that cannot be resolved
# - release tags, PR merges and auto-merge, workflow dispatch and reruns, gh
#   aliases (one can hide a merge)
# - every firebase CLI verb outside the allowlist (ADR 0017)
# - `deploy` package scripts
# - a command fed by `xargs` or read by a bare shell from stdin, since neither
#   shows what runs
# Asks (JSON on stdout) when a command writes to a guarded path (HookLib.pm).
#
# A belt, not a boundary: the GitHub ruleset guards `main` and the year
# branches. Nothing but this hook and the deny rules in settings.json guards
# the Firebase CLI and the MCP tools.
use strict;
use warnings;
use JSON::PP;
use FindBin;
use lib $FindBin::RealBin;
use HookLib;

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
	print STDERR "Blocked by .claude/hooks/block-deploy.sh: $what (see CLAUDE.md — only the maintainer merges to main or deploys)\n";
	exit 2;
}

sub resolve_dir {
	my ($base, $dir) = @_;
	return $dir if $dir =~ m{^/};
	return ($ENV{HOME} // '') . substr($dir, 1) if $dir =~ m{^~(?:/|$)};
	return "$base/$dir";
}

# The directory a bare `git push` runs in: the session cwd from the hook
# input (the terminal tab's own cwd when it names one), moved by any
# `cd <dir>` segment that precedes the push.
my $cwd = $input->{cwd} // $ENV{PWD} // '.';
$cwd = resolve_dir($cwd, $input->{tool_input}{cwd}) if defined $input->{tool_input}{cwd};

# The first write to a guarded path; asked about once every segment passed.
my $ask;

# The branch a push with no refspec (or `HEAD` / `@`) sends. Empty when it
# cannot be resolved (detached HEAD, no repo, git missing).
sub current_branch {
	my ($dir, @git_opts) = @_;
	return HookLib::git_line('-C', $dir, @git_opts, 'symbolic-ref', '--short', '-q', 'HEAD');
}

# The body of the `$(…)` or backtick substitution that opens at $i, and the
# index of its closing character.
sub extract_substitution {
	my ($s, $i) = @_;
	if (substr($s, $i, 1) eq '`') {
		my $j = $i + 1;
		$j++ while $j < length($s) && substr($s, $j, 1) ne '`';
		return (substr($s, $i + 1, $j - $i - 1), $j);
	}
	my ($depth, $quote, $j) = (1, '', $i + 2);
	for (; $j < length $s; $j++) {
		my $c = substr($s, $j, 1);
		if ($quote ne '') { $quote = '' if $c eq $quote; next }
		if ($c eq '\\') { $j++; next }
		if ($c eq "'" || $c eq '"') { $quote = $c; next }
		$depth++ if $c eq '(';
		$depth-- if $c eq ')';
		last if $depth == 0;
	}
	return (substr($s, $i + 2, $j - $i - 2), $j);
}

# Split a command line into simple commands on newlines, `;`, `&&`, `||`,
# `|`, `&` and parentheses (subshells). Quote-aware: a newline or `;` inside
# quotes stays in its command, so a multi-line commit message is one
# command. `$(…)` and backticks run even inside double quotes, so their
# bodies are commands of their own.
sub split_commands {
	my ($s) = @_;
	my (@out, $quote);
	my $cur = '';
	$quote = '';
	for (my $i = 0; $i < length $s; $i++) {
		my $c    = substr($s, $i, 1);
		my $next = substr($s, $i + 1, 1);
		if ($quote eq "'") { $cur .= $c; $quote = '' if $c eq "'"; next }
		if ($c eq '\\') { $cur .= $c . $next; $i++; next }
		if (($c eq '$' && $next eq '(') || $c eq '`') {
			my ($body, $end) = extract_substitution($s, $i);
			push @out, split_commands($body);
			$cur .= 'SUBSTITUTION';
			$i = $end;
			next;
		}
		if ($quote eq '"') { $cur .= $c; $quote = '' if $c eq '"'; next }
		if ($c eq "'" || $c eq '"') { $quote = $c; $cur .= $c; next }
		my $redirect_amp = $c eq '&' && ($next eq '>' || $cur =~ />$/);
		if ($c =~ /[\n;()|]/ || ($c eq '&' && !$redirect_amp)) {
			push @out, $cur;
			$cur = '';
			$i++ if ($c eq '|' || $c eq '&') && ($next eq $c || ($c eq '|' && $next eq '&'));
			next;
		}
		$cur .= $c;
	}
	push @out, $cur;
	return grep { /\S/ } @out;
}

# Drop heredoc bodies (file content, not commands). Only when the terminator
# is actually found: an unterminated or quoted `<<` must not swallow the
# commands that follow it. `<<-` allows a tab-indented terminator.
sub drop_heredoc_bodies {
	my ($text) = @_;
	my @lines = split /\n/, $text;
	my @kept;
	for (my $i = 0; $i < @lines; $i++) {
		push @kept, $lines[$i];
		next unless $lines[$i] =~ /<<(-?)\s*["']?([A-Za-z_][A-Za-z0-9_]*)["']?/;
		my ($dash, $term) = ($1, $2);
		for (my $j = $i + 1; $j < @lines; $j++) {
			my $cand = $lines[$j];
			$cand =~ s/^\t+// if $dash;
			if ($cand eq $term) { $i = $j; last }
		}
	}
	return join "\n", @kept;
}

# Global options between executable and verb (`git -C . push`, `npm --prefix functions run x`).
my $git_opts = qr/(?:-C \S+|-c \S+|--git-dir=\S+|--work-tree=\S+|--no-pager|--paginate|-p|--no-optional-locks)\s+/;
my $npm_opts = qr/(?:--prefix[= ]\S+|-C \S+|-w \S+|--workspace[= ]\S+|--filter[= ]\S+|--cwd[= ]\S+|-s|--silent)\s+/;

# What runs another command in front of it: env assignments, shell keywords
# and grouping, `timeout`/`nice`, and the package runners.
my $wrapper = qr/(?:[A-Za-z_][A-Za-z0-9_]*=\S*|env|command|builtin|sudo|exec|time|nohup|!|\{|\}|then|do|else|elif|if|while|until|nice(?: -n ?-?\d+| -\d+)?|timeout(?: -[sk] \S+| --?[a-z-]+(?:=\S+)?)* \d+(?:\.\d+)?[smhd]?|npx|pnpx|bunx|bun x|npm exec|pnpm (?:dlx|exec)|yarn (?:dlx|exec)|-y|--yes|--no-install|--|-p \S+|--package[= ]\S+)/;
my $xargs   = qr/xargs(?: -[IdEnLPs] ?\S+| -\S+)*/;

# Strip wrappers and env assignments, then basename the executable, so
# `npx -y firebase-tools@13 deploy`, `FOO=1 firebase deploy`,
# `timeout 60 \git push` and `/usr/local/bin/gh pr merge` all reduce to the
# bare command. Returns the command and whether xargs fed it.
sub unwrap {
	my ($seg) = @_;
	my $via_xargs = 0;
	while (1) {
		next if $seg =~ s/^(?:$wrapper) //;
		next if $seg =~ s/^(npm|pnpm|yarn|bun) $npm_opts+/$1 /;
		next if $seg =~ s/^\\//;
		if ($seg =~ s/^$xargs //) { $via_xargs = 1; next }
		last;
	}
	$seg =~ s{^node \S*/firebase(?:-tools)?(?:\.js)?(?= |$)}{firebase};
	$seg =~ s{^\S*/}{};
	$seg =~ s/^firebase-tools(?:@\S*)?(?= |$)/firebase/;
	return ($seg, $via_xargs);
}

# Paths a command writes to: redirections, `tee`, in-place `sed`/`perl`,
# and the destination of `cp`/`mv`/`install`/`rsync`.
sub write_targets {
	my ($seg) = @_;
	my @targets = $seg =~ /(?:^|[^<>&\d])\d*&?>>?\s*([^\s&>|][^\s>|]*)/g;
	my ($cmd, @args) = split / /, $seg;
	my @positional = grep { !/^-/ } @args;
	push @targets, @positional if $cmd eq 'tee';
	push @targets, @positional if $cmd =~ /^(?:sed|perl)$/ && grep { /^-\w*i|^--in-place/ } @args;
	push @targets, $positional[-1] if $cmd =~ /^(?:cp|mv|install|rsync)$/ && @positional;
	return @targets;
}

sub check_writes {
	my ($seg) = @_;
	return if defined $ask;
	for my $target (write_targets($seg)) {
		my $rel = HookLib::repo_relative($target, $cwd, $ENV{CLAUDE_PROJECT_DIR});
		next if $rel eq '';
		my ($decision, $reason) = HookLib::classify($rel);
		next if $decision eq '';
		$ask = "This command writes to $rel. $reason";
		return;
	}
}

sub check_git_push {
	my ($seg, $git_dir, @git_loc) = @_;
	my @args = split / /, $seg;
	splice @args, 0, 2;
	my (@positional, %flag);
	while (@args) {
		my $arg = shift @args;
		if ($arg =~ /^(?:-o|--push-option|--receive-pack|--exec|--repo)$/) { shift @args; next }
		if ($arg =~ /^-/) { $flag{$arg} = 1; next }
		push @positional, $arg;
	}
	deny('git push --all or --mirror, which pushes main too') if $flag{'--all'} || $flag{'--mirror'};
	deny('pushing tags') if $flag{'--tags'};

	shift @positional; # the remote
	# Any refspec landing on main or a year branch: `main`, `HEAD:main`,
	# `x:refs/heads/2026`, `refs/heads/main`, `+2026`, `:2026`.
	for my $ref (@positional) {
		deny('git push with a wildcard refspec') if $ref =~ /\*/;
		my $dst = (split /:/, $ref, -1)[-1];
		$dst =~ s/^\+//;
		$dst =~ s{^refs/heads/}{};
		deny("git push to $dst") if $dst =~ /^(?:main|20\d\d)$/;
	}

	# No refspec, or `HEAD` / `@` (optionally forced), pushes the current
	# branch. Deny it when that branch is main, a year branch, or cannot be
	# resolved.
	return if @positional && !grep { /^\+?(?:HEAD|@)$/ } @positional;
	my $branch = current_branch($git_dir, @git_loc);
	deny("git push of the current branch, $branch") if $branch =~ /^(?:main|20\d\d)$/;
	deny('git push of the current branch, which could not be resolved') if $branch eq '';
}

# Creating a release tag is denied; listing, deleting and verifying tags is not.
sub check_git_tag {
	my ($seg) = @_;
	my @args = split / /, $seg;
	splice @args, 0, 2;
	return if grep { /^(?:-l|--list|--contains|--no-contains|--merged|--no-merged|--points-at|-n\d*|-d|--delete|-v|--verify)$/ } @args;
	deny('release tag') if grep { /^v?\d/ } grep { !/^-/ } @args;
}

sub check_gh {
	my ($seg) = @_;
	(my $gh = $seg) =~ s/ (?:-R|--repo)(?:=| )\S+//g;
	deny('gh pr merge')                  if $gh =~ /^gh pr merge\b/;
	deny('workflow dispatch')            if $gh =~ /^gh workflow run\b/;
	deny('workflow rerun')               if $gh =~ /^gh run rerun\b/;
	deny('gh alias, which can hide a merge') if $gh =~ /^gh alias (?:set|import)\b/;
	return unless $gh =~ /^gh api\b/;
	deny('PR merge via gh api')          if $gh =~ m{/pulls/[^/ ]+/merge\b};
	deny('PR merge or auto-merge via GraphQL') if $gh =~ /mergePullRequest|enablePullRequestAutoMerge/i;
	deny('workflow dispatch via gh api') if $gh =~ m{/dispatches\b};
	deny('workflow rerun via gh api')    if $gh =~ m{/rerun(?:-failed-jobs)?\b};
}

# The firebase CLI allowlist (ADR 0017): local emulators, read-only lists,
# account and project selection, help, and preview channels. Everything else
# reaches the project shared with the mobile app.
my $firebase_valued = qr/^(?:--project|-P|--config|-c|--token|--account|--only|--expires|--site)$/;

sub check_firebase {
	my ($seg) = @_;
	my @args = split / /, $seg;
	shift @args;
	while (@args && $args[0] =~ /^-/) {
		my $opt = shift @args;
		return if $opt =~ /^(?:--version|-V|--help|-h)$/;
		shift @args if $opt =~ $firebase_valued;
	}
	my $verb = shift @args // '';
	return if $verb =~ /^(?:|help|login(?::\S+)?|logout|use|emulators:\S+|\S+:list)$/;
	if ($verb eq 'hosting:channel:deploy') {
		my @positional;
		while (@args) {
			my $arg = shift @args;
			if ($arg =~ $firebase_valued) { shift @args; next }
			push @positional, $arg unless $arg =~ /^-/;
		}
		my $channel = $positional[0] // '';
		return if $channel ne '' && $channel ne 'live';
		deny('firebase hosting:channel:deploy to live or without a channel');
	}
	deny("firebase $verb (allowed: emulators, *:list, login, logout, use, help, hosting:channel:deploy to a preview channel)");
}

my @segments = split_commands(drop_heredoc_bodies($command =~ s/\\\n\s*/ /gr));

while (@segments) {
	my $seg = shift @segments;
	$seg =~ s/\s+/ /g;
	$seg =~ s/^ | $//g;
	my $via_xargs;
	($seg, $via_xargs) = unwrap($seg);
	next if $seg eq '';

	# Unwrap `sh -c "…"`, `bash <<< "…"` and `eval "…"`, and scan the inner command.
	if ($seg =~ /^(?:sh|bash|zsh|dash|ksh|fish)(?: -\S+)* -\S*c (.+)$/ || $seg =~ /^(?:sh|bash|zsh|dash|ksh|fish)\b[^<]*<<< ?(.+)$/ || $seg =~ /^eval (.+)$/) {
		my $inner = $1;
		$inner =~ s/^(["'])(.*)\1$/$2/s;
		unshift @segments, split_commands($inner);
		next;
	}
	deny('a shell reading commands from stdin, which hides what runs') if $seg =~ /^(?:sh|bash|zsh|dash|ksh|fish)(?: -[A-Za-z]+)*$/;

	# Drop quotes: `git push origin "main"` is `git push origin main`.
	$seg =~ s/["']//g;

	check_writes($seg);

	# Drop redirections: `git push origin main>/dev/null` is `git push origin main`.
	$seg =~ s/ ?\d*&?>>? ?(?:&\d+|[^ &>|]+)//g;
	$seg =~ s/ ?\d*<{1,3} ?[^ <]+//g;

	# `cd <dir>` moves where a later bare `git push` resolves its branch.
	if ($seg =~ /^cd(?: (\S+))?$/) {
		$cwd = resolve_dir($cwd, $1 // ($ENV{HOME} // '/'));
		next;
	}

	# Keep the repo-locating global options (`-C`, `--git-dir`, `--work-tree`)
	# so a bare push is checked against the repository it actually targets.
	my ($git_dir, @git_loc) = ($cwd);
	if ($seg =~ /^git ((?:$git_opts)+)/) {
		my $prefix = $1;
		while ($prefix =~ /(-C (\S+)|--git-dir=\S+|--work-tree=\S+)/g) {
			if (defined $2) { $git_dir = resolve_dir($git_dir, $2) } else { push @git_loc, $1 }
		}
	}
	$seg =~ s/^git $git_opts+/git /;

	deny('a guarded command fed by xargs') if $via_xargs && $seg =~ /^(?:git push|gh|firebase)\b/;
	check_git_push($seg, $git_dir, @git_loc) if $seg =~ /^git push\b/;
	check_git_tag($seg)                      if $seg =~ /^git tag\b/;
	check_gh($seg)                           if $seg =~ /^gh\b/;
	check_firebase($seg)                     if $seg =~ /^firebase\b/;
	deny('deploy via package script') if $seg =~ /^(?:npm|pnpm|yarn|bun) (?:run |run-script )?deploy\b/;
}

if (defined $ask) {
	print JSON::PP->new->canonical->encode({
		hookSpecificOutput => {
			hookEventName            => 'PreToolUse',
			permissionDecision       => 'ask',
			permissionDecisionReason => $ask,
		},
	});
}
exit 0;
