import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

class LoginResponse {
    constructor(public token: string) {}
}

class ErrorResponse {
    constructor(public message: string) {}
}

export const login = functions.https.onRequest(async (request: functions.Request, response: functions.Response) => {
    const uid = request.body.number;
    if (uid) {
        const notUsedNumbers = db.collection('notUsedNumbers');
        notUsedNumbers.where('number', '==', parseInt(uid)).get().then(snapshot => {
            if (snapshot.empty) {
              console.log('No matching documents.');
              return;
            }  
        
            snapshot.forEach(doc => {
              console.log('doc.data()');
              console.log(doc.data());
              sendResponse({message: 'User succesfully registered!'}, response);
            });
          })
          .catch(err => {
            console.log('Error getting documents', err);
          });;
    } else {
        sendResponse({message: 'No user number provided.'}, response);
    }
});

function sendResponse(response: any, http: functions.Response) {
    http.setHeader('Access-Control-Allow-Origin', '*');
    http.setHeader('Access-Control-Request-Method', '*');
    http.setHeader('Access-Control-Allow-Headers', '*');
    http.status(200);
    http.end(JSON.stringify({data: response}));
}
