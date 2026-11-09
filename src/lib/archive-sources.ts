/**
 * Where past editions' frozen builds come from (ADR 0012). They live on the
 * `archives` branch, one `<year>/` per edition; `archive/sources.json` pins
 * each year to a commit there. `ensureArchives()` puts every pinned build at
 * `archive/<year>/` before a build reads it. Build time only.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** Year → the commit on `archives` that holds its build. */
export type ArchiveSources = Record<string, string>;

/** The pins in `<root>/archive/sources.json`; none without the file. */
export function readArchiveSources(root = process.cwd()): ArchiveSources {
	const file = join(root, 'archive', 'sources.json');
	if (!existsSync(file)) return {};
	const sources: unknown = JSON.parse(readFileSync(file, 'utf8'));
	if (typeof sources !== 'object' || sources === null || Array.isArray(sources)) {
		throw new Error('archive/sources.json must be an object of year → commit SHA.');
	}
	for (const [year, sha] of Object.entries(sources)) {
		if (!/^\d{4}$/.test(year) || typeof sha !== 'string' || !/^[0-9a-f]{40}$/.test(sha)) {
			throw new Error(`archive/sources.json: "${year}" must map a year to a full commit SHA on the archives branch.`);
		}
	}
	return sources as ArchiveSources;
}

function git(root: string, args: string[]): string {
	return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function hasCommit(root: string, sha: string): boolean {
	try {
		git(root, ['cat-file', '-e', `${sha}^{commit}`]);
		return true;
	} catch {
		return false;
	}
}

/** Fetches `sha` unless the clone has it; a full clone stays full. */
function fetchCommit(root: string, sha: string): void {
	if (hasCommit(root, sha)) return;
	const shallow = git(root, ['rev-parse', '--is-shallow-repository']).trim() === 'true';
	git(root, ['fetch', '--quiet', ...(shallow ? ['--depth=1'] : []), 'origin', sha]);
}

/** Replaces `dir` with `<sha>:<year>`, through a temp dir so no stale file survives. */
function extract(root: string, year: string, sha: string, dir: string): void {
	const tmp = mkdtempSync(join(root, 'archive', `.${year}-`));
	const tar = join(tmp, 'build.tar');
	git(root, ['archive', '--format=tar', `--output=${tar}`, sha, year]);
	execFileSync('tar', ['-xf', tar, '-C', tmp]);
	rmSync(dir, { recursive: true, force: true });
	renameSync(join(tmp, year), dir);
	rmSync(tmp, { recursive: true, force: true });
}

const reason = (error: unknown): string =>
	error instanceof Error && 'stderr' in error && String(error.stderr).trim()
		? String(error.stderr).trim().split('\n')[0]
		: String(error);

/**
 * Puts every pinned build at `<root>/archive/<year>/`. A year whose stamp
 * (`archive/<year>.source`) already names its pin is left alone, so only the
 * first build after a pin changes needs the network.
 */
export function ensureArchives(root = process.cwd(), log: (line: string) => void = console.log): void {
	for (const [year, sha] of Object.entries(readArchiveSources(root))) {
		const dir = join(root, 'archive', year);
		const stamp = `${dir}.source`;
		if (existsSync(dir) && existsSync(stamp) && readFileSync(stamp, 'utf8').trim() === sha) continue;
		rmSync(stamp, { force: true });
		try {
			fetchCommit(root, sha);
			extract(root, year, sha, dir);
		} catch (error) {
			throw new Error(
				`archive/${year}: cannot get ${year}/ from commit ${sha} (${reason(error)}). Check the network, and that archive/sources.json pins a commit on origin/archives that has ${year}/.`,
				{ cause: error },
			);
		}
		writeFileSync(stamp, `${sha}\n`);
		log(`archive/${year} ← ${sha}`);
	}
}
