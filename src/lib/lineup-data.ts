/**
 * Server-only data access for the public lineup — the single source of the
 * Firestore query + parse + failure contract that the on-demand `/speakers` and
 * `/sessions` routes and the build-time homepage teaser share. Reads go through
 * the Admin SDK (see `firebase-admin.ts`), which bypasses App Check + rules.
 *
 * `failed` means the read *threw* (Firestore down, missing creds) — NOT an empty
 * collection. An empty result is a healthy "not announced yet" state and must
 * render 200 + the empty UI, never a 503. Callers set the cache/status from
 * `failed`, and the islands drive their `failed` prop from it.
 */
import { adminFirestore } from './firebase-admin';
import { speakerFromDoc, type Speaker } from './speakers';
import { isDisplayableSession, sessionFromDoc, type Session } from './sessions';

export interface SpeakersRead {
	speakers: Speaker[];
	/** True only when the read threw — not when the collection is empty. */
	failed: boolean;
}

export interface SessionsRead {
	sessions: Session[];
	/** True only when the read threw — not when the collection is empty. */
	failed: boolean;
}

export async function readSpeakers(): Promise<SpeakersRead> {
	try {
		const snap = await adminFirestore().collection('speakers').orderBy('order').get();
		return { speakers: snap.docs.map((doc) => speakerFromDoc(doc.id, doc.data())), failed: false };
	} catch (err) {
		console.error('[lineup] speakers read failed:', err);
		return { speakers: [], failed: true };
	}
}

export async function readSessions(): Promise<SessionsRead> {
	try {
		const snap = await adminFirestore().collection('sessions').orderBy('order').get();
		const sessions = snap.docs
			.map((doc) => sessionFromDoc(doc.id, doc.data()))
			.filter(isDisplayableSession);
		return { sessions, failed: false };
	} catch (err) {
		console.error('[lineup] sessions read failed:', err);
		return { sessions: [], failed: true };
	}
}

/**
 * Full speaker profiles keyed by id, for the session → speaker drill-down in
 * `SessionDetail`. Best-effort: a read failure yields an empty map so the
 * drill-down falls back to the summary embedded on each session, without failing
 * the sessions page itself.
 */
export async function readSpeakersById(): Promise<Record<string, Speaker>> {
	const { speakers } = await readSpeakers();
	return Object.fromEntries(speakers.map((speaker) => [speaker.id, speaker]));
}
