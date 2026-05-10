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

export const app: FirebaseApp = initializeApp(firebaseConfig);

let databaseInstance: Database | null = null;
export function getDb(): Database {
	if (!databaseInstance) databaseInstance = getDatabase(app);
	return databaseInstance;
}

let analyticsInstance: Analytics | null = null;

async function initAnalytics() {
	if (analyticsInstance) return;
	const supported = await isSupported();
	if (supported) {
		analyticsInstance = getAnalytics(app);
	}
}

// Browser-only: initialise analytics if the user has already consented,
// and listen for consent granted during this session.
if (typeof window !== 'undefined') {
	if (localStorage.getItem('cookie-consent') === 'accepted') {
		initAnalytics();
	}
	window.addEventListener('cookie-consent-accepted', () => initAnalytics(), { once: true });
}
