/**
 * Feature flags: the sections of the site a chapter may not run. A flag set
 * to `false` removes the section's routes (`src/integrations/feature-routes.ts`),
 * its links, its sitemap entries, its structured data and its `llms.txt`
 * lines. Flags own routes, links and whole sections, never prose.
 *
 * Pure helpers only; `src/site.config.ts` applies them and
 * `src/lib/flags.ts` exposes the resolved answer.
 */

export const FEATURE_FLAGS = [
	/**
	 * The dated edition's own pages: the event home, `/agenda`, `/speakers`,
	 * the share pages, `/venue`, `/faq`, `/team`, `/contact`, `/press`,
	 * `/tv`, `/calendar.ics`. Off while the next edition has no date: the home
	 * page is the teaser of `upcoming` and the old URLs redirect to the
	 * archive (ADR 0011).
	 */
	'edition',
	/** The ti.to ticket section on the home page and `/thank-you`. Needs `edition`. */
	'tickets',
	/** `/invoice`, company tickets paid by bank transfer. Needs `tickets`. */
	'invoice',
	/** `/workshops`, seat sign-up for ticket holders. Needs `app` (its sign-in) and `edition`. */
	'workshops',
	/** `/app`, `/login`, `/delete-account` and the store badges. */
	'app',
	/** `/invite/<member>`, the team's personal invitation pages. Needs `tickets`. */
	'invite',
	/** `/partners` and the partner bands. Needs `edition`. */
	'partners',
	/** The newsletter form and `/newsletter-subscription-thank-you`. */
	'newsletter',
	/** `/attending` and `/speaker-card`, the canvas share cards. Needs `edition`. */
	'attending',
] as const;

export type FeatureFlag = (typeof FEATURE_FLAGS)[number];
export type Features = Record<FeatureFlag, boolean>;

/** `needs` must be on for the key to be on. */
const DEPENDENCIES: ReadonlyArray<{ flag: FeatureFlag; needs: FeatureFlag; why: string }> = [
	{ flag: 'tickets', needs: 'edition', why: 'a ticket is for a dated edition' },
	{ flag: 'workshops', needs: 'edition', why: 'workshops sit in the agenda' },
	{ flag: 'attending', needs: 'edition', why: 'the share cards name the day and the talks' },
	{ flag: 'partners', needs: 'edition', why: 'the partners are the dated edition\'s, and /partners redirects to the archive while it is off' },
	{ flag: 'invoice', needs: 'tickets', why: 'an invoice redeems a ti.to ticket code' },
	{ flag: 'invite', needs: 'tickets', why: 'the invitation CTA is a ticket checkout' },
	{ flag: 'workshops', needs: 'app', why: 'the workshop sign-in is the app login' },
];

/** The flags a comma-separated list names; an unknown name is an error. */
function flagList(list: string, variable: string): FeatureFlag[] {
	const names = list.split(',').map((s) => s.trim()).filter(Boolean);
	for (const name of names) {
		if (!(FEATURE_FLAGS as readonly string[]).includes(name)) {
			throw new Error(`${variable} names "${name}", which is not a feature flag (${FEATURE_FLAGS.join(', ')}).`);
		}
	}
	return names as FeatureFlag[];
}

/**
 * `features` with every flag named in `off` set to `false` and every flag
 * named in `on` set to `true` (comma-separated lists, as the
 * `PUBLIC_FEATURES_OFF` and `PUBLIC_FEATURES_ON` build variables carry
 * them; `off` wins). `on` is for an archive build, which puts back the
 * edition it freezes (`npm run archive`, ADR 0011). An unknown name is an
 * error: a typo must not pass as "nothing changed".
 */
export function resolveFeatures(features: Features, off: string = '', on: string = ''): Features {
	const resolved = { ...features };
	for (const name of flagList(on, 'PUBLIC_FEATURES_ON')) resolved[name] = true;
	for (const name of flagList(off, 'PUBLIC_FEATURES_OFF')) resolved[name] = false;
	return resolved;
}

/** Throws one sentence when a flag is on without the flag it depends on. */
export function checkFeatureDependencies(features: Features): void {
	for (const { flag, needs, why } of DEPENDENCIES) {
		if (features[flag] && !features[needs]) {
			throw new Error(`features.${flag} needs features.${needs}: ${why}. Turn ${flag} off or ${needs} on in src/site.config.ts.`);
		}
	}
}

/**
 * The links each flag owns: what a page may carry only while the flag is on.
 * `unlinkDisabled` strips them from authored HTML (the FAQ answers); the
 * flags-off check (`scripts/flags-off-build.mjs`) asserts no built page
 * carries one.
 */
export const FEATURE_LINKS: Record<FeatureFlag, readonly string[]> = {
	edition: [
		'/agenda',
		'/speakers',
		'/talks/',
		'/sessions',
		'/venue',
		'/faq',
		'/team',
		'/contact',
		'/press',
		'/tv',
		'/calendar.ics',
	],
	tickets: ['/#tickets', '#tickets'],
	invoice: ['/invoice'],
	workshops: ['/workshops'],
	app: ['/app', '/login', '/delete-account'],
	invite: ['/invite/'],
	partners: ['/partners'],
	newsletter: ['/#newsletter', '#newsletter'],
	attending: ['/attending', '/speaker-card'],
};

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * `html` with every `<a href="…">text</a>` that points at a section whose
 * flag is off unwrapped to its text. The sentence stays; only the link goes.
 */
export function unlinkDisabled(html: string, features: Features): string {
	let out = html;
	for (const flag of FEATURE_FLAGS) {
		if (features[flag]) continue;
		for (const href of FEATURE_LINKS[flag]) {
			const target = escapeRegExp(href);
			out = out.replace(new RegExp(`<a\\s[^>]*href=["']${target}[/#?"'][^>]*>(.*?)</a>`, 'gs'), '$1');
		}
	}
	return out;
}
