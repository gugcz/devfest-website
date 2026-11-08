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
	 * The edition's programme: `/agenda`, `/speakers`, the share pages
	 * (`/speakers/<id>`, `/talks/<id>`), `/sessions`, `/tv`, the speakers on
	 * the home page. Off until the lineup is published. Needs `event.date`.
	 */
	'lineup',
	/** `/venue` and the venue's facts. Needs `event.venue` and `event.date`. */
	'venue',
	/** The ti.to ticket section on the home page and `/thank-you`. Needs `event.date` and `event.venue`. */
	'tickets',
	/** `/invoice`, company tickets paid by bank transfer. Needs `tickets`. */
	'invoice',
	/** `/workshops`, seat sign-up for ticket holders. Needs `app` (its sign-in) and `lineup`. */
	'workshops',
	/**
	 * `/app`, the store badges and every "Get the app" link: the web's
	 * promotion of the mobile app. `/login` (the app's sign-in link) and
	 * `/delete-account` (its store listing's account deletion) stay either way.
	 */
	'app',
	/** `/invite/<member>`, the team's personal invitation pages. Needs `tickets`. */
	'invite',
	/** `/partners` and the partner bands. */
	'partners',
	/** The newsletter form and `/newsletter-subscription-thank-you`. */
	'newsletter',
	/** `/attending` and `/speaker-card`, the canvas share cards. Needs `event.date` and `event.venue`. */
	'attending',
] as const;

export type FeatureFlag = (typeof FEATURE_FLAGS)[number];
export type Features = Record<FeatureFlag, boolean>;

/** What a flag can need besides another flag: a fact of `config.event`. */
type EventFact = 'date' | 'venue';

/** `needs` must be on (a flag) or set (an event fact) for the key to be on. */
const DEPENDENCIES: ReadonlyArray<{ flag: FeatureFlag; needs: FeatureFlag | EventFact; why: string }> = [
	{ flag: 'tickets', needs: 'date', why: 'a ticket is for a dated edition' },
	{ flag: 'tickets', needs: 'venue', why: 'the confirmation and its calendar entry give the venue' },
	{ flag: 'lineup', needs: 'date', why: 'the agenda and the speakers give the day and its times' },
	{ flag: 'venue', needs: 'venue', why: 'the page gives the venue\'s address and route' },
	{ flag: 'venue', needs: 'date', why: 'the page gives the day\'s hours' },
	{ flag: 'workshops', needs: 'lineup', why: 'workshops sit in the agenda' },
	{ flag: 'attending', needs: 'date', why: 'the share cards name the day' },
	{ flag: 'attending', needs: 'venue', why: 'the share cards name the venue\'s town' },
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

/** Throws one sentence when a flag is on without the flag or the event fact it depends on. */
export function checkFeatureDependencies(features: Features, event: Partial<Record<EventFact, unknown>>): void {
	for (const { flag, needs, why } of DEPENDENCIES) {
		if (!features[flag]) continue;
		if (needs === 'date' || needs === 'venue') {
			if (event[needs] === undefined) {
				throw new Error(`features.${flag} needs event.${needs}: ${why}. Turn ${flag} off or set event.${needs} in src/site.config.ts.`);
			}
		} else if (!features[needs]) {
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
	lineup: ['/agenda', '/speakers', '/talks/', '/sessions', '/tv'],
	venue: ['/venue'],
	tickets: ['/#tickets', '#tickets'],
	invoice: ['/invoice'],
	workshops: ['/workshops'],
	app: ['/app'],
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
