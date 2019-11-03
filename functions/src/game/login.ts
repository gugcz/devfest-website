import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendResponse } from './index';
import { TokenResponse, ErrorResponse } from './responses';

const db = admin.firestore();

export const deleteLogin = functions.firestore.document('users/{userId}').onDelete(async (snap, cont) => {
  const numberBadge = snap.data().number;
  const uid = cont.params.userId;
  await admin.auth().deleteUser(uid);
  return db.collection('numbersOnBadges').doc(numberBadge).update({
    isUsed: false
  });
});
