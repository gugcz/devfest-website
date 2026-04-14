import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

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

export const analytics: Promise<Analytics | null> = isSupported().then((ok) =>
	ok ? getAnalytics(app) : null,
);
