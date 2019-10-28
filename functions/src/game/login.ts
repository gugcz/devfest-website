import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

class TokenResponse {
  constructor(public token: string, private type: string = 'token') { }
}

class ErrorResponse {
  constructor(public message: string, private type: string = 'error') { }
}

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

function sendResponse(response: TokenResponse | ErrorResponse, http: functions.Response) {
  http.setHeader('Access-Control-Allow-Origin', '*');
  http.setHeader('Access-Control-Request-Method', '*');
  http.setHeader('Access-Control-Allow-Headers', '*');
  http.status(200);
  http.end(JSON.stringify({ data: response }));
}
