import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendResponse } from './index';
import { TokenResponse, ErrorResponse } from './responses';

const db = admin.firestore();

export const login = functions.https.onRequest(async (request: functions.Request, response: functions.Response) => {
  const uid = request.body.number;
  if (uid) {
    db.collection('numbersOnBadges').doc(uid).get().then(async snapshot => {
      if (!snapshot.exists) {
        console.log('Wrong user number.');
        sendResponse(new ErrorResponse('Wrong user number.'), response);
        return;
      }

      const data = await snapshot.data();
      if (!data.isUsed) {
        console.log('Creating token for ' + uid);
        admin.auth().createCustomToken(uid)
          .then(async customToken => {
            data.isUsed = true;
            await db.collection('users').doc(uid).set({ number: parseInt(uid), totalScore: 0, actualScore: 0 });
            await snapshot.ref.set(data);
            sendResponse(new TokenResponse(customToken), response);
          })
          .catch(error => {
            console.error('Error creating custom token:', error);
            sendResponse(new ErrorResponse('Error creating custom token.'), response);
          });
      } else {
        console.log(`The number ${uid} is already used!`);
        sendResponse(new ErrorResponse(`The number ${uid} is already used.`), response);
      }
    })
      .catch(err => {
        console.error('Error getting user number: ', err);
        sendResponse(new ErrorResponse('Error getting user number.'), response);
      });
  } else {
    sendResponse(new ErrorResponse('No user number provided.'), response);
  }
});
