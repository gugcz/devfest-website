/** Firebase Admin SDK singleton, initialised once per instance. The runtime
 * injects `FIREBASE_CONFIG` and credentials — no service-account JSON. */

import { initializeApp, type App } from 'firebase-admin/app';
import { getDatabase, type Database } from 'firebase-admin/database';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

export const adminApp: App = initializeApp();

let dbInstance: Database | null = null;
export function db(): Database {
	if (!dbInstance) dbInstance = getDatabase(adminApp);
	return dbInstance;
}

let firestoreInstance: Firestore | null = null;
export function firestore(): Firestore {
	if (!firestoreInstance) firestoreInstance = getFirestore(adminApp);
	return firestoreInstance;
}
