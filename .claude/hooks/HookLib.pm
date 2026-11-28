# Shared by guard-edits.sh and block-deploy.sh: a quiet git call, and the
# paths the hooks guard.
#
# Guarded paths:
# - Build output and lockfiles: deny. Change the source or the manifest and
#   rebuild or reinstall instead.
# - Files that reach the Firebase project shared with the mobile app or the
#   production deploy, and the agent guardrails themselves: ask first.
#
# Perl core modules only, so there is no dependency to fail open on.
package HookLib;

use strict;
use warnings;
use Cwd ();

# First line of `git @args`, '' when git fails or prints nothing. Its stderr
# is dropped, so a missing repo never leaks into a hook's message.
sub git_line {
	my (@args) = @_;
	open(my $saved, '>&', \*STDERR) or return '';
	open(STDERR, '>', '/dev/null');
	my $ok = open(my $fh, '-|', 'git', @args);
	open(STDERR, '>&', $saved);
	return '' unless $ok;
	local $/ = "\n";
	my $line = <$fh> // '';
	close $fh;
	$line =~ s/\s+$//;
	return $line;
}

# Absolute, lexically normalised path (`./`, `..`, `//`), with the deepest
# existing ancestor run through realpath so a symlinked folder resolves.
sub resolve {
	my ($path, $base) = @_;
	$path = "$base/$path" unless $path =~ m{^/};
	my @parts;
	for my $part (split m{/+}, $path) {
		next if $part eq '' || $part eq '.';
		if ($part eq '..') { pop @parts; next }
		push @parts, $part;
	}
	my ($head, $tail) = ('/' . join('/', @parts), '');
	while ($head ne '/' && !-e $head) {
		$head =~ s{/([^/]*)$}{};
		$tail = "/$1$tail";
		$head = '/' if $head eq '';
	}
	my $real = Cwd::realpath($head) // $head;
	$real = '' if $real eq '/';
	return ($real . $tail) || '/';
}

# The git worktree that holds an absolute path, or '' outside any repo. Each
# worktree under .claude/worktrees/ is its own root, whatever
# CLAUDE_PROJECT_DIR says.
sub repo_root {
	my ($abs) = @_;
	my $dir = $abs;
	$dir =~ s{/[^/]*$}{} until $dir eq '' || -d $dir;
	return '' if $dir eq '';
	my $root = git_line('-C', $dir, 'rev-parse', '--show-toplevel');
	return $root eq '' ? '' : (Cwd::realpath($root) // $root);
}

# The path relative to its repo root ($fallback_root outside any repo), or ''
# when it lies outside both. Compared without case: the default macOS volume
# ignores it, so `DIST/x` is `dist/x`.
sub repo_relative {
	my ($path, $base, $fallback_root) = @_;
	my $abs  = resolve($path, $base);
	my $root = repo_root($abs);
	$root = resolve($fallback_root, '/') if $root eq '' && defined $fallback_root && $fallback_root ne '';
	return '' if $root eq '' || index(lc $abs, lc "$root/") != 0;
	return substr($abs, length($root) + 1);
}

# ('deny' | 'ask' | '', reason) for a repo-relative path.
sub classify {
	my ($rel) = @_;
	return ('deny', "$rel is build output. Edit the source and rebuild.")
		if $rel =~ m{^(?:dist|functions/lib|functions/lib-test)(?:/|$)}i;
	return ('deny', "$rel is a lockfile. Change package.json and run npm install in that directory.")
		if $rel =~ m{^(?:functions/)?package-lock\.json$}i;
	return ('ask', "$rel reaches the Firebase project shared with the mobile app or the production deploy. Read CLAUDE.md > Firebase shared project before changing it.")
		if $rel =~ m{^(?:firebase\.json|\.firebaserc|public/\.well-known/apple-app-site-association|\.github/workflows/firebase-[\w-]+\.yml)$}i;
	return ('ask', "$rel is an agent guardrail (a hook or the shared permissions). Changing it changes what agents may do.")
		if $rel =~ m{^\.claude/(?:hooks/|settings\.json$)}i;
	return ('', '');
}

1;
