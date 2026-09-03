/**
 * Copy for the team's personal invitation pages (`/invite/<member>`).
 *
 * These pages are an unlisted referral channel: each of the eleven people in
 * `src/content/team.json` gets one page, written in their voice, which they
 * share themselves. They are `noindex`, kept out of the sitemap and linked from
 * nowhere on the site — see `src/pages/invite/[member].astro`.
 *
 * This is v1 GENERIC copy, agreed as a deliberate stop-gap: the members will
 * write their own paragraphs later, and when they do only `body` changes here.
 * `roleLine` is the one line that varies between the eleven pages, so they are
 * not literally the same page with a name swapped.
 */

/** The facts the copy states out loud. Kept here so all eleven pages agree. */
export const INVITE_EVENT = {
	date: 'October 30, 2026',
	city: 'Prague',
	/** The one-line meta under the CTA. */
	stamp: 'Oct 30, 2026 · Prague',
} as const;

/**
 * The closing line, chosen by the member's `role`. Six variants cover all
 * eleven people; an unknown role falls back to the organiser line rather than
 * dropping the line altogether (a missing sentence would be the one visible
 * difference between an invite and a broken invite).
 */
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

/**
 * First name only. The invitation is one person speaking to one person, so the
 * poster line reads "Eliška is putting you on the list", not the full record.
 * `split` on whitespace is enough for this roster — it is a fixed eleven names,
 * not user input.
 */
export function firstName(name: string): string {
	return name.trim().split(/\s+/)[0];
}

export interface InviteCopy {
	/** Poster headline, with the accent word wrapped — rendered with set:html. */
	titleHtml: string;
	/** Same headline as flat text, for <title> and OG. */
	titleFlat: string;
	/** Three short paragraphs: what this is → what DevFest is → take it. */
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
		titleFlat: `${first} is putting you on the list.`,
		body: [
			"This isn't a mailing list. I picked the people I actually want in the room, and you're one of them.",
			`DevFest is the Czech Google developer community's day of the year — talks from people who ship things, and the corridor conversations that are the real reason anyone shows up. ${INVITE_EVENT.date}, ${INVITE_EVENT.city}.`,
			"Ticket's yours to take. Come find me there.",
		],
		roleLine: roleLine(member.role),
		cta: 'Take the ticket',
	};
}
