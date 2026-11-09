import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { ensureArchives, readArchiveSources } from './archive-sources.ts';

const git = (cwd: string, ...args: string[]): string =>
	execFileSync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', '-c', 'commit.gpgsign=false', ...args], {
		cwd,
		encoding: 'utf8',
	}).trim();

function write(file: string, text: string): void {
	mkdirSync(join(file, '..'), { recursive: true });
	writeFileSync(file, text);
}

function commit(repo: string, files: Record<string, string>): string {
	git(repo, 'rm', '-rq', '--ignore-unmatch', '.');
	for (const [path, text] of Object.entries(files)) write(join(repo, path), text);
	git(repo, 'add', '-A');
	git(repo, 'commit', '-qm', 'archive');
	return git(repo, 'rev-parse', 'HEAD');
}

function pin(site: string, sources: Record<string, string>): void {
	write(join(site, 'archive', 'sources.json'), JSON.stringify(sources));
}

describe('readArchiveSources', () => {
	let site: string;
	before(() => {
		site = mkdtempSync(join(tmpdir(), 'archive-sources-'));
	});
	after(() => rmSync(site, { recursive: true, force: true }));

	it('has no pins without archive/sources.json', () => {
		assert.deepEqual(readArchiveSources(site), {});
	});

	it('refuses a pin that is not a full commit SHA', () => {
		pin(site, { 2026: 'archives' });
		assert.throws(() => readArchiveSources(site), /"2026" must map a year to a full commit SHA/);
	});
});

describe('ensureArchives', () => {
	let origin: string;
	let site: string;
	const lines: string[] = [];
	const log = (line: string) => lines.push(line);

	before(() => {
		origin = mkdtempSync(join(tmpdir(), 'archives-origin-'));
		site = mkdtempSync(join(tmpdir(), 'archives-site-'));
		git(origin, 'init', '-q', '-b', 'archives');
		git(site, 'init', '-q');
		git(site, 'remote', 'add', 'origin', origin);
	});
	after(() => {
		rmSync(origin, { recursive: true, force: true });
		rmSync(site, { recursive: true, force: true });
	});

	it('fetches the pinned build into archive/<year>/, then leaves it alone', () => {
		const sha = commit(origin, { '2026/index.html': 'first', '2026/old.html': 'gone later' });
		pin(site, { 2026: sha });

		ensureArchives(site, log);
		assert.equal(readFileSync(join(site, 'archive', '2026', 'index.html'), 'utf8'), 'first');
		assert.deepEqual(lines, [`archive/2026 ← ${sha}`]);

		ensureArchives(site, log);
		assert.equal(lines.length, 1);
	});

	it('replaces the build when the pin moves, without leftovers', () => {
		const sha = commit(origin, { '2026/index.html': 'second' });
		pin(site, { 2026: sha });

		ensureArchives(site, log);
		assert.equal(readFileSync(join(site, 'archive', '2026', 'index.html'), 'utf8'), 'second');
		assert.equal(existsSync(join(site, 'archive', '2026', 'old.html')), false);
		assert.equal(readFileSync(join(site, 'archive', '2026.source'), 'utf8').trim(), sha);
	});

	it('fetches one commit into a shallow clone and keeps it shallow', () => {
		const shallow = mkdtempSync(join(tmpdir(), 'archives-shallow-'));
		try {
			git(shallow, 'clone', '-q', '--depth=1', `file://${origin}`, '.');
			const sha = commit(origin, { '2026/index.html': 'third' });
			pin(shallow, { 2026: sha });

			ensureArchives(shallow, log);
			assert.equal(readFileSync(join(shallow, 'archive', '2026', 'index.html'), 'utf8'), 'third');
			assert.equal(git(shallow, 'rev-parse', '--is-shallow-repository'), 'true');
		} finally {
			rmSync(shallow, { recursive: true, force: true });
		}
	});

	it('fails by year and commit when the pin cannot be fetched', () => {
		const sha = '0'.repeat(40);
		pin(site, { 2026: sha });
		assert.throws(() => ensureArchives(site, log), new RegExp(`archive/2026: cannot get 2026/ from commit ${sha}`));
		assert.equal(existsSync(join(site, 'archive', '2026.source')), false);
	});
});
