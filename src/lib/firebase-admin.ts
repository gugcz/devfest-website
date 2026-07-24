/**
 * Firebase Admin SDK — SERVER-ONLY.
 *
 * Backs the on-demand `speakers` / `sessions` reads and the homepage teaser's
 * build-time read. The Admin SDK authenticates over IAM/ADC and bypasses both
 * Firestore security rules and App Check, so these reads never pay the client
 * reCAPTCHA/App-Check token cost — that is the whole point of moving them off
 * the browser (see docs/plan/2026-07-24-fix-speakers-sessions-ssr-plan.md).
 *
 * This is a SECOND Admin runtime, distinct from `functions/src/lib/admin.ts`
 * (that one runs in Cloud Functions; this one is bundled into the Astro SSR
 * output). They share no code across the src/ ↔ functions/ boundary — keep the
 * shape in sync deliberately.
 *
 * Credentials: ambient ADC in the deployed function/Cloud Run (no key). Locally,
 * set `GOOGLE_APPLICATION_CREDENTIALS` to a service-account JSON, or point at the
 * Firestore emulator via `FIRESTORE_EMULATOR_HOST`. A credential-less local build
 * still succeeds — the callers catch a failed read and degrade gracefully.
 */

import { initializeApp, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

// Fail loudly if this module is ever pulled into a client bundle: firebase-admin
// is Node-only and would break the browser build. Client islands must receive
// the parsed data as props, never import this.
if (!import.meta.env.SSR) {
	throw new Error('src/lib/firebase-admin.ts is server-only — do not import it from a client island.');
}

// Reuse an already-initialised app (the module can be evaluated more than once in
// a warm runtime) rather than double-initialising.
const adminApp: App = getApps()[0] ?? initializeApp();

let firestoreInstance: Firestore | null = null;
export function adminFirestore(): Firestore {
	if (!firestoreInstance) firestoreInstance = getFirestore(adminApp);
	return firestoreInstance;
}
