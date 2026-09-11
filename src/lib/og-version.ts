/**
 * Content hash for the invite OG card URL (`/og/invite/<slug>.png?v=<hash>`).
 *
 * Slack caches a `.png` under its own URL and we send a 1-year `max-age`, so a
 * changed card is otherwise invisible in an existing Slack thread/unfurl until
 * the query string itself changes — see the OG card comment in
 * `src/pages/og/invite/[member].png.ts`. The hash covers everything that can
 * change a card's pixels: the render template, the logo, and the two
 * per-member inputs the template draws from (name, photo).
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

let cachedTemplateDigest: string | undefined;
function templateDigest(): string {
	if (!cachedTemplateDigest) {
		const hash = createHash('sha256');
		hash.update(readFileSync(join(root, 'src/pages/og/invite/[member].png.ts')));
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
