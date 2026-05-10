/**
 * Firebase Admin SDK singleton.
 *
 * Cloud Functions instances reuse the same Node process across invocations,
 * so we initialize the Admin app once at module load and share it from every
 * handler. The runtime injects `FIREBASE_CONFIG` (project id + default
 * `databaseURL`) and default credentials automatically — no service-account
 * JSON or hardcoded RTDB URL is required.
 */

import { initializeApp, type App } from 'firebase-admin/app';
import { getDatabase, type Database } from 'firebase-admin/database';

export const adminApp: App = initializeApp();

let dbInstance: Database | null = null;
export function db(): Database {
	if (!dbInstance) dbInstance = getDatabase(adminApp);
	return dbInstance;
}
