// The Claude Code setup in .claude/: the deploy and edit hooks, the
// settings.json deny rules, and the path-scoped rule globs (ADR 0017).
// `npm run test:claude`. Each case feeds a hook the JSON Claude Code sends
// on stdin; no command in a case ever runs.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, matchesGlob } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');
const HOOKS = join(ROOT, '.claude/hooks');

/** 'deny' (exit 2), 'ask' or 'allow', as Claude Code reads a PreToolUse hook. */
function runHook(name, input, env = {}) {
	const result = spawnSync(join(HOOKS, name), {
		input: JSON.stringify(input),
		encoding: 'utf8',
		env: { ...process.env, CLAUDE_PROJECT_DIR: ROOT, ...env },
	});
	if (result.status === 2) return 'deny';
	assert.equal(result.status, 0, `${name} exited ${result.status}: ${result.stderr}`);
	const out = result.stdout.trim();
	return out === '' ? 'allow' : JSON.parse(out).hookSpecificOutput.permissionDecision;
}

describe('block-deploy.sh', () => {
	const repos = {};
	let scratch;

	before(() => {
		scratch = mkdtempSync(join(tmpdir(), 'claude-setup-'));
		for (const [name, branch] of [['main', 'main'], ['year', '2026'], ['feature', 'feat/x']]) {
			repos[name] = join(scratch, name);
			execFileSync('git', ['init', '-q', '-b', branch, repos[name]]);
		}
		repos.none = join(scratch, 'none');
		mkdirSync(repos.none);
	});

	after(() => rmSync(scratch, { recursive: true, force: true }));

	const bash = (command, cwd) => runHook('block-deploy.sh', { tool_name: 'Bash', tool_input: { command }, cwd });

	const denied = [
		// Pushes to main or a year branch, in every refspec spelling.
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
		'git -C ../elsewhere push origin main',
		'cd /tmp && git push origin main',
		// Shell structure around a blocked command.
		'(git push origin main)',
		'{ git push origin main; }',
		'if true; then git push origin main; fi',
		'for b in x; do git push origin main; done',
		'! git push origin main',
		'timeout 60 git push origin main',
		'nice -n 5 git push origin main',
		'\\git push origin main',
		'echo $(git push origin main)',
		'echo `git push origin main`',
		'echo "$(git push origin main)"',
		'echo main | xargs git push origin',
		'bash <<< "git push origin main"',
		"echo 'git push origin main' | sh",
		'git push origin main&',
		'git push origin main>/dev/null',
		"bash -lc 'git push origin main'",
		'eval "git push origin main"',
		// Tags, merges, workflows.
		'git tag v1.0.0',
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
		'npm exec firebase deploy',
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
		// Deploy scripts.
		'npm run deploy',
		'npm run deploy:hosting',
		'npm --prefix functions run deploy',
		'yarn deploy',
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
		'grep "firebase deploy" README.md',
		'git commit -m "fix: thing\n\ngit push origin main\nfirebase deploy"',
		"gh pr create --draft --body \"$(cat <<'EOF'\n## Summary\ngit push origin main\nEOF\n)\"",
		'gh pr view 12',
		'gh pr list --repo gugcz/devfest-website',
		'npm run verify',
		'firebase',
		'firebase --version',
		'firebase login',
		'firebase use devfest-cz-app',
		'firebase emulators:start --only functions',
		'firebase hosting:channel:list',
		'firebase projects:list',
		'firebase hosting:channel:deploy pr-1 --expires 7d',
		'ls 2>&1 | head',
	];

	for (const command of denied) {
		it(`denies ${JSON.stringify(command)}`, () => assert.equal(bash(command, repos.feature), 'deny'));
	}

	for (const command of allowed) {
		it(`allows ${JSON.stringify(command)}`, () => assert.equal(bash(command, repos.feature), 'allow'));
	}

	it('denies a bare push from main, a year branch, or no branch at all', () => {
		for (const repo of [repos.main, repos.year, repos.none]) {
			assert.equal(bash('git push', repo), 'deny');
			assert.equal(bash('git push origin HEAD', repo), 'deny');
		}
	});

	it('checks the terminal panel tool, in the tab cwd', () => {
		const run = (command, cwd) =>
			runHook('block-deploy.sh', {
				tool_name: 'mcp__terminal__run_in_terminal',
				tool_input: { command, cwd },
				cwd: repos.feature,
			});
		assert.equal(run('git push origin main', repos.feature), 'deny');
		assert.equal(run('git push', repos.main), 'deny');
		assert.equal(run('git push', repos.feature), 'allow');
	});

	it('asks before a command writes to a guarded path', () => {
		for (const command of [
			"sed -i '' 's/a/b/' firebase.json",
			'echo x > dist/index.html',
			'echo {} | tee .claude/settings.json',
			'cp /tmp/x .firebaserc',
			'perl -pi -e s/a/b/ .claude/hooks/block-deploy.sh',
		]) {
			assert.equal(bash(command, ROOT), 'ask', command);
		}
	});

	it('lets a write elsewhere through', () => {
		for (const command of ['echo x > notes.txt', 'cp a.txt b.txt', "sed -i '' 's/a/b/' src/site.config.ts"]) {
			assert.equal(bash(command, ROOT), 'allow', command);
		}
	});
});

describe('guard-edits.sh', () => {
	const edit = (filePath, env) => runHook('guard-edits.sh', { tool_name: 'Edit', tool_input: { file_path: filePath }, cwd: ROOT }, env);

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

	it('resolves each file against its own worktree, whatever CLAUDE_PROJECT_DIR says', () => {
		const elsewhere = mkdtempSync(join(tmpdir(), 'claude-setup-root-'));
		try {
			assert.equal(edit(`${ROOT}/dist/index.html`, { CLAUDE_PROJECT_DIR: elsewhere }), 'deny');
			assert.equal(edit(`${ROOT}/dist/index.html`, { CLAUDE_PROJECT_DIR: `${ROOT}/` }), 'deny');
		} finally {
			rmSync(elsewhere, { recursive: true, force: true });
		}
	});

	it('lets source files through', () => {
		for (const path of ['src/site.config.ts', 'package.json', 'distance.md', 'docs/firebase.json.md']) {
			assert.equal(edit(`${ROOT}/${path}`), 'allow', path);
		}
	});
});

describe('settings.json', () => {
	const settings = JSON.parse(readFileSync(join(ROOT, '.claude/settings.json'), 'utf8'));
	const deniedTool = (tool) => settings.permissions.deny.some((rule) => matchesGlob(tool, rule));

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

	it('turns bypass permissions mode off', () => {
		assert.equal(settings.permissions.disableBypassPermissionsMode, 'disable');
	});
});

describe('.claude/rules', () => {
	const tracked = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' }).split('\n');
	const rulesDir = join(ROOT, '.claude/rules');

	for (const file of readdirSync(rulesDir).filter((name) => name.endsWith('.md'))) {
		const frontmatter = readFileSync(join(rulesDir, file), 'utf8').split('---')[1] ?? '';
		const globs = [...frontmatter.matchAll(/^\s+- "([^"]+)"$/gm)].map((match) => match[1]);

		it(`${file}: every paths glob matches a tracked file`, () => {
			const dead = globs.filter((glob) => !tracked.some((path) => matchesGlob(path, glob)));
			assert.deepEqual(dead, []);
		});
	}
});
