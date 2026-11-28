// The Claude Code setup in .claude/: the deploy and edit hooks, the session
// start hook, settings.json, and the path-scoped rule globs (ADR 0017).
// `npm run test:claude`. Each case feeds a hook the JSON Claude Code sends
// on stdin; no command in a case ever runs.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { accessSync, constants, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join, matchesGlob, relative } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');
const HOOKS = join(ROOT, '.claude/hooks');
const BLOCKED = 'Blocked by .claude/hooks/block-deploy.sh';

/** The environment without GIT_* variables, so a git hook running these tests cannot redirect git. */
function cleanEnv(extra = {}) {
	const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')));
	return { ...env, CLAUDE_PROJECT_DIR: ROOT, ...extra };
}

function git(...args) {
	execFileSync('git', args, { env: cleanEnv(), stdio: 'ignore' });
}

/** { decision: 'deny' | 'ask' | 'allow', reason }, as Claude Code reads a PreToolUse hook. */
function runHook(name, input, env = {}) {
	const stdin = typeof input === 'string' ? input : JSON.stringify(input);
	const result = spawnSync(join(HOOKS, name), { input: stdin, encoding: 'utf8', env: cleanEnv(env) });
	if (result.status === 2) return { decision: 'deny', reason: result.stderr };
	assert.equal(result.status, 0, `${name} exited ${result.status}: ${result.stderr}`);
	const out = result.stdout.trim();
	if (out === '') return { decision: 'allow', reason: '' };
	const { permissionDecision, permissionDecisionReason } = JSON.parse(out).hookSpecificOutput;
	return { decision: permissionDecision, reason: permissionDecisionReason };
}

describe('block-deploy.sh', () => {
	const repos = {};
	let scratch;

	before(() => {
		scratch = mkdtempSync(join(tmpdir(), 'claude-setup-'));
		for (const [name, branch] of [['main', 'main'], ['year', '2026'], ['feature', 'feat/x']]) {
			repos[name] = join(scratch, name);
			git('init', '-q', '-b', branch, repos[name]);
		}
		repos.none = join(scratch, 'none');
		mkdirSync(repos.none);
	});

	after(() => rmSync(scratch, { recursive: true, force: true }));

	const bash = (command, cwd) => runHook('block-deploy.sh', { tool_name: 'Bash', tool_input: { command }, cwd });
	const decision = (command, cwd) => bash(command, cwd).decision;

	const denied = [
		// Pushes to main, a year branch or a tag, in every refspec spelling.
		'git push origin main',
		'git push origin HEAD:main',
		'git push origin +main',
		'git push origin refs/heads/main',
		'git push origin :main',
		'git push -u origin 2026',
		'git push origin HEAD:refs/heads/2027',
		'git push --all origin',
		'git push --mirror origin',
		"git push origin 'refs/heads/*:refs/heads/*'",
		'git push --tags',
		'git push --follow-tags',
		'git push origin HEAD:refs/tags/v2.0.0',
		'git push origin v1.2.3',
		'git -C ../elsewhere push origin main',
		'cd /tmp && git push origin main',
		// Shell structure around a blocked command.
		'(git push origin main)',
		'{ git push origin main; }',
		'if true; then git push origin main; fi',
		'if false; then :; elif true; then git push origin main; fi',
		'if false; then :; else git push origin main; fi',
		'for b in x; do git push origin main; done',
		'while true; do git push origin main; done',
		'until false; do git push origin main; done',
		'! git push origin main',
		'timeout 60 git push origin main',
		'nice -n 5 git push origin main',
		'nohup git push origin main',
		'builtin command git push origin main',
		'sudo -E git push origin main',
		'\\git push origin main',
		'echo $(git push origin main)',
		'echo `git push origin main`',
		'echo "$(git push origin main)"',
		'echo main | xargs git push origin',
		'bash <<< "git push origin main"',
		"echo 'git push origin main' | sh",
		'bash <<EOF\nfirebase deploy\nEOF',
		'bash < script.sh',
		'git push origin main&',
		'git push origin main>/dev/null',
		"bash -lc 'git push origin main'",
		'eval "git push origin main"',
		// Tags, releases, merges, workflows.
		'git tag v1.0.0',
		'gh release create v1.0.0',
		'gh pr merge 12',
		'gh pr merge --auto 12',
		'gh pr -R owner/repo merge 12',
		'gh --repo owner/repo pr merge 12',
		'gh api -X PUT repos/o/r/pulls/$PR/merge',
		"gh api graphql -f query='mutation { mergePullRequest(input: {}) { clientMutationId } }'",
		"gh api graphql -f query='mutation { enablePullRequestAutoMerge(input: {}) { clientMutationId } }'",
		"gh alias set m 'pr merge'",
		'gh workflow run firebase-hosting-merge.yml',
		'gh run rerun 123456',
		'gh api -X POST repos/o/r/actions/runs/123/rerun',
		'gh api repos/o/r/dispatches -f event_type=deploy',
		// The firebase CLI outside its allowlist, behind every runner.
		'firebase deploy',
		'npx firebase deploy',
		'npx -y firebase-tools@latest deploy',
		'npx firebase-tools@13 deploy',
		'npx -p firebase-tools firebase deploy',
		"npx -c 'firebase deploy'",
		'npm exec firebase deploy',
		'npm exec -c "firebase deploy"',
		'npm x firebase deploy',
		'"npx" firebase deploy',
		'env -i firebase deploy',
		'env -u HOME firebase deploy',
		'command -p firebase deploy',
		'pnpm dlx firebase-tools deploy',
		'yarn dlx firebase-tools deploy',
		'bun x firebase-tools deploy',
		'bunx firebase-tools deploy',
		'./node_modules/.bin/firebase deploy',
		'node node_modules/firebase-tools/lib/bin/firebase.js deploy',
		'firebase hosting:clone devfest-public:pr-1 devfest-public:live',
		'firebase functions:delete ticketsApi --force',
		'firebase hosting:disable',
		'firebase --account someone@example.com deploy',
		'firebase -c firebase.json deploy',
		'firebase --project devfest-cz-app --non-interactive deploy --only hosting',
		'firebase hosting:channel:deploy live',
		'firebase hosting:channel:deploy',
		"firebase emulators:exec 'firebase deploy'",
		"firebase emulators:exec --only functions 'npm test && firebase deploy'",
		// Deploy scripts, behind the package-manager options.
		'npm run deploy',
		'npm run deploy:hosting',
		'npm --prefix functions run deploy',
		'npm -w functions run deploy',
		'npm --workspace=functions run deploy',
		'pnpm --filter functions run deploy',
		'yarn --cwd functions deploy',
		'npm --silent run deploy',
		'yarn deploy',
		// Deny wins over a pending ask.
		'echo x > firebase.json; git push origin main',
	];

	const allowed = [
		'git push origin claude/foo',
		'git push origin fix/main',
		'git push origin feat/recap-2026',
		'git push -u origin HEAD',
		'git push',
		'git log main',
		'git diff main...HEAD',
		"git tag -l 'v2*'",
		'git tag --list v1*',
		'git tag --contains 4f2a9c1',
		'git tag',
		'git tag foo',
		'grep "firebase deploy" README.md',
		'git commit -m "fix: thing\n\ngit push origin main\nfirebase deploy"',
		'git commit -m "note -> firebase.json"',
		"gh pr create --draft --body \"$(cat <<'EOF'\n## Summary\ngit push origin main\nEOF\n)\"",
		'gh pr view 12',
		'gh pr list --repo gugcz/devfest-website',
		'npm run verify',
		'echo a | xargs ls',
		'npx prettier --check .',
		'timeout 5 ls',
		"bash -c 'ls'",
		'firebase',
		'firebase --version',
		'firebase login',
		'firebase use devfest-cz-app',
		'firebase emulators:start --only functions',
		"firebase emulators:exec --only functions 'npm test'",
		'firebase hosting:channel:list',
		'firebase projects:list',
		'firebase hosting:channel:deploy pr-1 --expires 7d',
		'ls 2>&1 | head',
	];

	for (const command of denied) {
		it(`denies ${JSON.stringify(command)}`, () => {
			const { decision: got, reason } = bash(command, repos.feature);
			assert.equal(got, 'deny');
			assert.ok(reason.includes(BLOCKED), reason);
		});
	}

	for (const command of allowed) {
		it(`allows ${JSON.stringify(command)}`, () => assert.equal(decision(command, repos.feature), 'allow'));
	}

	it('denies a bare push from main, a year branch, or no branch at all', () => {
		for (const repo of [repos.main, repos.year, repos.none]) {
			assert.equal(decision('git push', repo), 'deny');
			assert.equal(decision('git push origin HEAD', repo), 'deny');
		}
	});

	it('checks the terminal panel tool, in the tab cwd', () => {
		const run = (command, cwd) =>
			runHook('block-deploy.sh', {
				tool_name: 'mcp__terminal__run_in_terminal',
				tool_input: { command, cwd },
				cwd: repos.feature,
			}).decision;
		assert.equal(run('git push origin main', repos.feature), 'deny');
		assert.equal(run('git push', repos.main), 'deny');
		assert.equal(run('git push', repos.feature), 'allow');
	});

	it('denies input it cannot parse and allows an empty command', () => {
		assert.equal(runHook('block-deploy.sh', 'not json').decision, 'deny');
		assert.equal(runHook('block-deploy.sh', {}).decision, 'allow');
	});

	it('asks before a command changes a guarded path', () => {
		const viaHome = relative(homedir(), ROOT).startsWith('..') ? [] : [`echo x > ~/${relative(homedir(), ROOT)}/firebase.json`];
		for (const command of [
			"sed -i '' 's/a/b/' firebase.json",
			"sed --in-place 's/a/b/' firebase.json",
			'echo x > dist/index.html',
			'echo x >> firebase.json',
			'echo x > "firebase.json"',
			'echo {} | tee .claude/settings.json',
			'cp /tmp/x .firebaserc',
			'mv /tmp/x .firebaserc',
			'rsync -a /tmp/x/ .claude/hooks/',
			'perl -pi -e s/a/b/ .claude/hooks/block-deploy.sh',
			'truncate -s0 .claude/hooks/HookLib.pm',
			'rm .claude/hooks/block-deploy.sh',
			'chmod -x .claude/hooks/block-deploy.sh',
			'mv .claude/settings.json /tmp/settings.json',
			'git rm .claude/settings.json',
			'cd .claude && echo {} > settings.json',
			...viaHome,
		]) {
			assert.equal(decision(command, ROOT), 'ask', command);
		}
	});

	it('lets other writes and the removal of build output through', () => {
		for (const command of ['echo x > notes.txt', 'cp a.txt b.txt', "sed -i '' 's/a/b/' src/site.config.ts", 'rm -rf dist', 'git checkout -- package-lock.json']) {
			assert.equal(decision(command, ROOT), 'allow', command);
		}
	});
});

describe('guard-edits.sh', () => {
	const edit = (filePath, env) => runHook('guard-edits.sh', { tool_name: 'Edit', tool_input: { file_path: filePath }, cwd: ROOT }, env).decision;

	it('denies build output and lockfiles however the path is spelled', () => {
		for (const path of [
			`${ROOT}/dist/index.html`,
			`${ROOT}/./dist/index.html`,
			`${ROOT}/src/../dist/index.html`,
			`${ROOT}//dist/index.html`,
			`${ROOT}/DIST/index.html`,
			'dist/index.html',
			`${ROOT}/functions/lib/index.js`,
			`${ROOT}/functions/lib-test/site.test.js`,
			`${ROOT}/package-lock.json`,
			`${ROOT}/functions/package-lock.json`,
		]) {
			assert.equal(edit(path), 'deny', path);
		}
	});

	it('asks before the shared Firebase files and the guardrails', () => {
		for (const path of [
			'firebase.json',
			'.firebaserc',
			'public/.well-known/apple-app-site-association',
			'.github/workflows/firebase-hosting-merge.yml',
			'.claude/hooks/block-deploy.sh',
			'.claude/settings.json',
		]) {
			assert.equal(edit(`${ROOT}/${path}`), 'ask', path);
		}
	});

	it('guards a notebook path too', () => {
		const result = runHook('guard-edits.sh', { tool_name: 'NotebookEdit', tool_input: { notebook_path: `${ROOT}/dist/x.ipynb` }, cwd: ROOT });
		assert.equal(result.decision, 'deny');
	});

	it('resolves each file against its own worktree, whatever CLAUDE_PROJECT_DIR says', () => {
		const scratch = mkdtempSync(join(tmpdir(), 'claude-setup-worktree-'));
		try {
			const main = join(scratch, 'main');
			git('init', '-q', '-b', 'main', main);
			git('-C', main, '-c', 'user.email=agent@example.com', '-c', 'user.name=Agent', 'commit', '-q', '--allow-empty', '-m', 'init');
			git('-C', main, 'worktree', 'add', '-q', '-b', 'feat/y', join(scratch, 'sibling'));
			assert.equal(edit(join(scratch, 'sibling/dist/index.html'), { CLAUDE_PROJECT_DIR: main }), 'deny');
			assert.equal(edit(`${ROOT}/dist/index.html`, { CLAUDE_PROJECT_DIR: scratch }), 'deny');
			assert.equal(edit(`${ROOT}/dist/index.html`, { CLAUDE_PROJECT_DIR: `${ROOT}/` }), 'deny');
		} finally {
			rmSync(scratch, { recursive: true, force: true });
		}
	});

	it('lets source files, files outside every repo and unreadable input through', () => {
		for (const path of ['src/site.config.ts', 'package.json', 'distance.md', 'docs/firebase.json.md']) {
			assert.equal(edit(`${ROOT}/${path}`), 'allow', path);
		}
		assert.equal(edit(join(tmpdir(), 'dist/index.html'), { CLAUDE_PROJECT_DIR: '' }), 'allow');
		assert.equal(runHook('guard-edits.sh', 'not json').decision, 'allow');
	});
});

describe('session-start.sh', () => {
	let scratch;
	let stubs;

	before(() => {
		scratch = mkdtempSync(join(tmpdir(), 'claude-setup-session-'));
		stubs = join(scratch, 'bin');
		mkdirSync(stubs);
		// A stand-in npm: records the call, then installs or fails like `npm ci`.
		writeFileSync(
			join(stubs, 'npm'),
			[
				'#!/bin/sh',
				'dir=.; [ "$1" = "--prefix" ] && dir=$2',
				'echo ci >> "$dir/npm-calls"',
				'mkdir -p "$dir/node_modules"',
				'if [ -n "$STUB_NPM_FAIL" ]; then touch "$dir/node_modules/partial"; exit 1; fi',
				'touch "$dir/node_modules/.package-lock.json"',
			].join('\n'),
			{ mode: 0o755 },
		);
	});

	after(() => rmSync(scratch, { recursive: true, force: true }));

	function checkout(name) {
		const dir = join(scratch, name);
		mkdirSync(dir);
		writeFileSync(join(dir, 'package-lock.json'), '{}');
		return dir;
	}

	function start(dir, env = {}) {
		return spawnSync(join(HOOKS, 'session-start.sh'), {
			encoding: 'utf8',
			env: cleanEnv({ CLAUDE_PROJECT_DIR: dir, PATH: `${stubs}:${process.env.PATH}`, ...env }),
		});
	}

	it('installs a fresh checkout and says nothing to Claude', () => {
		const dir = checkout('fresh');
		const result = start(dir);
		assert.equal(result.status, 0);
		assert.equal(result.stdout, '');
		assert.ok(existsSync(join(dir, 'node_modules/.package-lock.json')));
	});

	it('skips a checkout whose last install finished', () => {
		const dir = checkout('installed');
		mkdirSync(join(dir, 'node_modules'));
		writeFileSync(join(dir, 'node_modules/.package-lock.json'), '{}');
		start(dir);
		assert.ok(!existsSync(join(dir, 'npm-calls')));
	});

	it('removes a failed install and tells Claude, without failing the session', () => {
		const dir = checkout('failing');
		const result = start(dir, { STUB_NPM_FAIL: '1' });
		assert.equal(result.status, 0);
		assert.match(result.stdout, /npm ci failed in \./);
		assert.ok(!existsSync(join(dir, 'node_modules')));
	});
});

describe('settings.json', () => {
	const settings = JSON.parse(readFileSync(join(ROOT, '.claude/settings.json'), 'utf8'));
	const deniedTool = (tool) => settings.permissions.deny.some((rule) => matchesGlob(tool, rule));
	const preToolUse = settings.hooks.PreToolUse;
	const entryFor = (script) => preToolUse.find((entry) => entry.hooks.some((hook) => hook.command.endsWith(script)));

	it('denies the MCP tools that deploy, write to the shared project or merge', () => {
		for (const tool of [
			'mcp__plugin_firebase_firebase__firebase_deploy',
			'mcp__firebase__firebase_deploy',
			'mcp__plugin_firebase_firebase__firestore_delete_document',
			'mcp__plugin_firebase_firebase__firestore_update_document',
			'mcp__plugin_firebase_firebase__realtimedatabase_set_data',
			'mcp__plugin_firebase_firebase__remoteconfig_update_template',
			'mcp__plugin_firebase_firebase__messaging_send_message',
			'mcp__github__merge_pull_request',
			'mcp__ccd_pr__set_auto_merge',
		]) {
			assert.ok(deniedTool(tool), tool);
		}
	});

	it('leaves the read tools alone', () => {
		for (const tool of [
			'mcp__plugin_firebase_firebase__firestore_get_document',
			'mcp__plugin_firebase_firebase__realtimedatabase_get_data',
			'mcp__plugin_firebase_firebase__functions_get_logs',
			'mcp__plugin_firebase_firebase__dataconnect_execute_graphql_read',
		]) {
			assert.ok(!deniedTool(tool), tool);
		}
	});

	it('keeps .env files from Claude and turns bypass permissions mode off', () => {
		assert.ok(settings.$schema);
		assert.ok(settings.permissions.deny.includes('Read(**/.env)'));
		assert.equal(settings.permissions.disableBypassPermissionsMode, 'disable');
	});

	it('pre-approves every step of npm run verify', () => {
		const { verify } = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).scripts;
		for (const step of verify.split(' && ')) {
			assert.ok(settings.permissions.allow.includes(`Bash(${step})`), step);
		}
	});

	it('wires the deploy hook to Bash and the terminal panel, failing closed', () => {
		const entry = entryFor('block-deploy.sh');
		assert.deepEqual(entry.matcher.split('|').sort(), ['Bash', 'mcp__terminal__run_in_terminal']);
		assert.equal(entry.hooks[0].onFailure, 'block');
		assert.match(entryFor('guard-edits.sh').matcher, /^Edit\|Write\|/);
	});

	it('runs every hook in exec form, from a script that exists and is executable', () => {
		for (const hook of [...preToolUse, ...settings.hooks.SessionStart].flatMap((entry) => entry.hooks)) {
			assert.deepEqual(hook.args, [], hook.command);
			accessSync(hook.command.replace('${CLAUDE_PROJECT_DIR}', ROOT), constants.X_OK);
		}
	});
});

describe('.claude/rules', () => {
	const tracked = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8', env: cleanEnv() }).split('\n');
	const rulesDir = join(ROOT, '.claude/rules');

	for (const file of readdirSync(rulesDir).filter((name) => name.endsWith('.md'))) {
		const frontmatter = readFileSync(join(rulesDir, file), 'utf8').split('---')[1] ?? '';
		const globs = [...frontmatter.matchAll(/^\s+- "([^"]+)"$/gm)].map((match) => match[1]);
		const listed = [...frontmatter.matchAll(/^\s+- /gm)].length;

		it(`${file}: every paths glob is double-quoted and matches a tracked file`, () => {
			assert.ok(globs.length > 0, 'no paths globs found');
			assert.equal(globs.length, listed, 'a paths entry is not a double-quoted glob');
			const dead = globs.filter((glob) => !tracked.some((path) => matchesGlob(path, glob)));
			assert.deepEqual(dead, []);
		});
	}
});
