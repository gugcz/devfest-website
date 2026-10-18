import type { CSSProperties } from 'react';
import { formatMinutes, parseLocalMinutes } from '../lib/agenda';
import type { Lineup } from '../lib/lineup';
import type { Room, Session } from '../lib/sessions';
import { cleanTagline, PORTRAIT_TRANSITION, type Speaker } from '../lib/speakers';
import SpeakerPhoto from './SpeakerPhoto';
import s from './SpeakerTile.module.scss';

/** One speaker as a print on the table: who they are, what they give, where
 * and when. Built once per lineup by {@link billLineup}. */
export interface Billing {
	speaker: Speaker;
	/** The talk's title; '' for a host. */
	talk: string;
	/** The other presenters of the same talk. */
	with: string[];
	/** The typewritten tape over the print: the room, "Host", or that the time is still to come. */
	tape: string;
	/** The tape on a phone print, one line in half the width. */
	tapeShort: string;
	/** The right end of the print's edge: the CET start, or '' for a host or
	 * an unscheduled talk (the tape says which). Mono sets figures only. */
	clock: string;
	/** The opening keynote: the first talk of the day, the large print. */
	keynote: boolean;
	/** The emcee: no talk; /speakers sets the hosts in their own row. */
	host: boolean;
}

interface Slot {
	speaker: Speaker;
	session: Session | undefined;
	host: boolean;
	minutes: number | null;
	roomRank: number;
	room: string;
}

const LAST = Number.MAX_SAFE_INTEGER;

/** Sessionize carries the emcee as a "speaker" of a session titled HOST,
 * which the browser lineup drops; the speaker doc still names it. */
function isHost(speaker: Speaker): boolean {
	return speaker.sessions.some((talk) => talk.name.trim().toUpperCase() === 'HOST');
}

function firstTalk(speaker: Speaker, sessions: Session[]): Session | undefined {
	let first: Session | undefined;
	let firstAt = LAST;
	for (const session of sessions) {
		if (!session.speakers.some((ref) => ref.id === speaker.id)) continue;
		const at = parseLocalMinutes(session.startsAt) ?? LAST - 1;
		if (!first || at < firstAt) {
			first = session;
			firstAt = at;
		}
	}
	return first;
}

function slotFor(speaker: Speaker, lineup: Lineup): Slot {
	const session = firstTalk(speaker, lineup.sessions);
	const room: Room | undefined = session ? lineup.rooms.find((r) => r.id === session.roomId) : undefined;
	return {
		speaker,
		session,
		host: !session && isHost(speaker),
		minutes: session ? parseLocalMinutes(session.startsAt) : null,
		roomRank: room?.order ?? LAST,
		room: session?.room.trim() || room?.name || '',
	};
}

/** Timed talks first (start, then room), then talks still untimed, then the hosts. */
function group(slot: Slot): number {
	if (slot.host) return 2;
	return slot.minutes === null ? 1 : 0;
}

function bySlot(a: Slot, b: Slot): number {
	return (
		group(a) - group(b) ||
		(a.minutes ?? 0) - (b.minutes ?? 0) ||
		a.roomRank - b.roomRank ||
		a.speaker.order - b.speaker.order
	);
}

function tapeFor(slot: Slot, keynote: boolean): string {
	if (slot.host) return 'Host';
	if (slot.minutes === null) return 'Time to be announced';
	if (keynote) return slot.room ? `Opening keynote, ${slot.room}` : 'Opening keynote';
	return slot.room;
}

function tapeShortFor(slot: Slot, keynote: boolean): string {
	if (slot.host) return 'Host';
	if (slot.minutes === null) return 'Time TBA';
	if (keynote) return 'Opening keynote';
	return slot.room;
}

function clockFor(slot: Slot): string {
	return slot.host || slot.minutes === null ? '' : formatMinutes(slot.minutes);
}

function billingFor(slot: Slot, keynote: boolean): Billing {
	const { speaker, session } = slot;
	return {
		speaker,
		talk: session?.title ?? (slot.host ? '' : (speaker.sessions[0]?.name ?? '')),
		with: (session?.speakers ?? [])
			.filter((ref) => ref.id !== speaker.id && ref.fullName.trim())
			.map((ref) => ref.fullName),
		tape: tapeFor(slot, keynote),
		tapeShort: tapeShortFor(slot, keynote),
		clock: clockFor(slot),
		keynote,
		host: slot.host,
	};
}

/** The lineup in running order: by start time, then room; the first talk of
 * the day is the opening keynote. Shared by the home teaser and /speakers. */
export function billLineup(lineup: Lineup): Billing[] {
	const slots = lineup.speakers.map((speaker) => slotFor(speaker, lineup)).sort(bySlot);
	return slots.map((slot, i) => billingFor(slot, i === 0 && group(slot) === 0));
}

// Prints set down by hand: a small tilt, never the same twice in a row.
const TILTS = ['var(--tilt-2)', 'calc(-1 * var(--tilt-1))', 'var(--tilt-1)', 'calc(-1 * var(--tilt-2))'];

/** One speaker as a paper print: the portrait, the name in Bebas, the role
 * on the typewriter, the talk, and the edge with the sheet number and the
 * CET start. The tape says the room. The opening keynote is the large
 * print. The same tile on the home page (a link to the
 * speaker) and on /speakers (a button that opens the sheet). The photo
 * develops to colour while the tile is hovered or focused. */
export default function SpeakerTile({
	billing,
	index,
	total,
	href,
	onOpen,
	morphing = false,
	eager = false,
}: {
	billing: Billing;
	/** Position in the running order, from 1. */
	index: number;
	total: number;
	/** A link to the speaker (home); omit and pass `onOpen` for a button. */
	href?: string;
	onOpen?: (speaker: Speaker) => void;
	/** This tile's photo carries the morph into the open sheet. */
	morphing?: boolean;
	eager?: boolean;
}) {
	const { speaker, keynote } = billing;
	const tag = cleanTagline(speaker.tagLine);
	const tilt = keynote ? 'calc(-1 * var(--tilt-1))' : TILTS[index % TILTS.length];
	const body = (
		<>
			{billing.tape && (
				<span className="tape">
					<span className={s.tapeFull}>{billing.tape}</span>
					<span className={s.tapeShort}>{billing.tapeShort}</span>
				</span>
			)}
			<span
				className={`paper-photo ${s.photo}`}
				style={morphing ? ({ viewTransitionName: PORTRAIT_TRANSITION } as CSSProperties) : undefined}
			>
				<SpeakerPhoto
					speaker={speaker}
					photoClass={s.img}
					monogramClass={s.monogram}
					width={360}
					height={450}
					eager={eager}
				/>
			</span>
			<span className={s.caption}>
				<span className={s.name}>{speaker.fullName}</span>
				{tag && <span className={s.role}>{tag}</span>}
				{billing.talk && <span className={s.talk}>{billing.talk}</span>}
				{billing.with.length > 0 && <span className={s.with}>With {billing.with.join(', ')}</span>}
				<span className={`paper-edge ${s.edge}`}>
					<span>
						{String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
					</span>
					{billing.clock && <span>{billing.clock}</span>}
				</span>
			</span>
		</>
	);

	return (
		<li
			className={`${s.cell} ${keynote ? s.keynote : ''}`}
			style={{ '--tilt': tilt } as CSSProperties}
		>
			{href ? (
				<a className={`paper ${s.tile}`} href={href}>
					{body}
				</a>
			) : (
				<button
					type="button"
					className={`paper ${s.tile}`}
					onClick={() => onOpen?.(speaker)}
					aria-label={`View ${speaker.fullName}'s profile`}
				>
					{body}
				</button>
			)}
		</li>
	);
}
