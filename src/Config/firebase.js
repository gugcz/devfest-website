import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/performance";
import "firebase/messaging";
import "firebase/storage"

import firebaseConfigData from './firebase-config'

const firebaseConfig = firebaseConfigData

firebase.initializeApp(firebaseConfig);
// { synchronizeTabs: !0 }
firebase
  .firestore()
  .enablePersistence()
  .catch(() => {
    console.warn("DB offline support not available");
  });

export default {
  firestore: firebase.firestore(),
  auth: firebase.auth(),
  authw: firebase.auth,
  firebase: firebase,
  notificationSupported: firebase.messaging.isSupported(),
  messaging: firebase.messaging.isSupported() ? firebase.messaging() : null,
};