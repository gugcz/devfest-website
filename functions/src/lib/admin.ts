/**
 * Firebase Admin SDK singleton.
 *
 * Cloud Functions instances reuse the same Node process across invocations,
 * so we initialize the Admin app once at module load and share it from every
 * handler. The default credentials are supplied automatically by the Cloud
 * Functions runtime — no service-account JSON required.
 */

import { initializeApp, type App } from 'firebase-admin/app';
import { getDatabase, type Database } from 'firebase-admin/database';

const DATABASE_URL = 'https://devfest-cz-app-default-rtdb.europe-west1.firebasedatabase.app';

export const adminApp: App = initializeApp({ databaseURL: DATABASE_URL });

let dbInstance: Database | null = null;
export function db(): Database {
	if (!dbInstance) dbInstance = getDatabase(adminApp);
	return dbInstance;
}
