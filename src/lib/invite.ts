/**
 * Copy for the personal invitation pages (`/invite/<member>`) — an unlisted
 * referral channel, one page per person in `src/content/team.json`. See
 * `src/pages/invite/[member].astro`.
 *
 * v1 GENERIC copy, a deliberate stop-gap: members write their own paragraphs
 * later, and then only `body` changes. `roleLine` is the one line that varies.
 */

/** The facts the copy states out loud. Kept here so all eleven pages agree. */
export const INVITE_EVENT = {
	date: 'October 30, 2026',
	city: 'Prague',
	/** The one-line meta under the CTA. */
	stamp: 'Oct 30, 2026 · Prague',
} as const;

/** The closing line, by `role`. An unknown role falls back to the organiser
 * line rather than dropping the sentence. */
const ROLE_LINES: Record<string, string> = {
	'lead org': "I'm the one who has to answer for how the day goes. Come make it easy.",
	'deputy lead org': "I'm the one who has to answer for how the day goes. Come make it easy.",
	production: "I'll be the one making sure the room actually works. Say hi.",
	festival: "I'll be the one making sure the room actually works. Say hi.",
	'festival sidekick': "I'll be the one making sure the room actually works. Say hi.",
	speakers: 'I hunted down the people on that stage. Tell me if I got it right.',
	partners:
		'I spend the year making the numbers work so the day is worth it. Come see what they bought.',
	finance:
		'I spend the year making the numbers work so the day is worth it. Come see what they bought.',
	'pr & marketing': "You've probably seen my work already. This time come see the real thing.",
	'web & app': "You've probably seen my work already. This time come see the real thing.",
	'tickets & registration': "I'm the one at the door. Yours is already sorted.",
};

const FALLBACK_ROLE_LINE = ROLE_LINES['lead org'];

export function roleLine(role?: string): string {
	if (!role) return FALLBACK_ROLE_LINE;
	return ROLE_LINES[role.trim().toLowerCase()] ?? FALLBACK_ROLE_LINE;
}

/** First name only — one person speaking to one person. `split` on
 * whitespace is enough for a fixed roster. */
export function firstName(name: string): string {
	return name.trim().split(/\s+/)[0];
}

export interface InviteCopy {
	/** Poster headline, with the accent word wrapped — rendered with set:html. */
	titleHtml: string;
	/**
	 * Same headline as flat text, for <title> and OG. No full stop: the
	 * document title appends " — DevFest.cz 2026", and a sentence period
	 * immediately before an em dash reads as a typo.
	 */
	titleFlat: string;
	/**
	 * Three short paragraphs: what this is → what DevFest is → take it.
	 * `body[0]` is the hero lede over the photo — one sentence, ~14 words.
	 * `body[1]` and `body[2]` render below the fold, in the note band.
	 */
	body: [string, string, string];
	/** The one line that differs between the eleven pages. */
	roleLine: string;
	/** The single primary action. */
	cta: string;
}

export function inviteCopy(member: { name: string; role?: string }): InviteCopy {
	const first = firstName(member.name);
	return {
		titleHtml: `${first} is putting you<br />on the <span class="red">list.</span>`,
		titleFlat: `${first} is putting you on the list`,
		body: [
			// Hero lede: one sentence, 14 words — the only copy that sits over the
			// photo, so it has to read at a glance, not carry the pitch.
			"I picked the people I actually want in the room — you're one of them.",
			`DevFest is the Czech Google developer community's day of the year — talks from people who ship things, and the corridor conversations that are the real reason anyone shows up. ${INVITE_EVENT.date}, ${INVITE_EVENT.city}.`,
			"Ticket's yours to take. Come find me there.",
		],
		roleLine: roleLine(member.role),
		cta: 'Take the ticket',
	};
}
