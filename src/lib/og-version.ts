/** Content hash for the invite OG card URL (`?v=<hash>`). Slack caches the
 * `.jpg` under its URL and we send a 1-year `max-age`, so a changed card is
 * invisible until the query string changes. Covers template, logo, name,
 * photo. */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

let cachedTemplateDigest: string | undefined;
function templateDigest(): string {
	if (!cachedTemplateDigest) {
		const hash = createHash('sha256');
		hash.update(readFileSync(join(root, 'src/pages/og/invite/[member].jpg.ts')));
		hash.update(readFileSync(join(root, 'src/assets/logo.png')));
		cachedTemplateDigest = hash.digest('hex');
	}
	return cachedTemplateDigest;
}

export function ogCardVersion(member: { name: string; photo?: string }): string {
	const hash = createHash('sha256');
	hash.update(templateDigest());
	hash.update(member.name);
	if (member.photo) hash.update(member.photo);
	return hash.digest('hex').slice(0, 10);
}
