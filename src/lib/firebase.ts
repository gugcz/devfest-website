import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig = {
	apiKey: 'AIzaSyB7lXxnVicSWTtUe9CbVUarm2MwFVRMucU',
	authDomain: 'devfest-cz-app.firebaseapp.com',
	databaseURL: 'https://devfest-cz-app-default-rtdb.europe-west1.firebasedatabase.app',
	projectId: 'devfest-cz-app',
	storageBucket: 'devfest-cz-app.firebasestorage.app',
	messagingSenderId: '544417536046',
	appId: '1:544417536046:web:a238af229f95f75c2aa7bf',
	measurementId: 'G-L5NK2S2EZ0',
};

let appInstance: FirebaseApp | null = null;
function getApp(): FirebaseApp {
	if (!appInstance) appInstance = initializeApp(firebaseConfig);
	return appInstance;
}

let databaseInstance: Database | null = null;
export function getDb(): Database {
	if (!databaseInstance) databaseInstance = getDatabase(getApp());
	return databaseInstance;
}

let analyticsInstance: Analytics | null = null;
export async function initAnalytics(): Promise<void> {
	if (analyticsInstance) return;
	try {
		const supported = await isSupported();
		if (supported) {
			analyticsInstance = getAnalytics(getApp());
		}
	} catch (err) {
		console.warn('[firebase] Analytics init failed:', err);
	}
}
