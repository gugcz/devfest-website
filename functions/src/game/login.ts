import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

class TokenResponse {
    constructor(public token: string, private type: string = 'token') {}
}

class ErrorResponse {
    constructor(public message: string, private type: string = 'error') {}
}

export const login = functions.https.onRequest(async (request: functions.Request, response: functions.Response) => {
    const uid = request.body.number;
    if (uid) {
        const notUsedNumbers = db.collection('notUsedNumbers');
        notUsedNumbers.where('number', '==', parseInt(uid)).get().then(snapshot => {
            if (snapshot.empty) {
              console.log('Wrong user number.');
              sendResponse(new ErrorResponse('Wrong user number.'), response);
              return;
            }  
        
            snapshot.forEach(doc => {
              console.log('Creating token for ' + uid);
              admin.auth().createCustomToken(uid)
                .then(customToken => sendResponse(new TokenResponse(customToken), response))
                .catch(error => {
                  console.log('Error creating custom token:', error);
                  sendResponse(new ErrorResponse('No user number provided.'), response);
                });
            });
          })
          .catch(err => {
            console.error('Error getting documents', err);
            sendResponse(new ErrorResponse('No user number provided.'), response);
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
    http.end(JSON.stringify({data: response}));
}
