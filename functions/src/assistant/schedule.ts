import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const getLastSessions = functions.https.onRequest((req, res) => {
  return getSessions().then(data => {
    res.send(data);
  });
});

async function getSessions() {
  const sessionsSnapshot = await admin.firestore().collection('sessions').orderBy('startTime').limit(3).get();
  const sessions = [];
  for (const session of sessionsSnapshot.docs){
    const date = session.data().startTime.toDate();
    const finalOut = date.getFullYear() + "-" + (date.getMonth() - 1) + "-" + date.getDate() + " " + (date.getUTCHours() + 2) + ":" + (("0" + date.getMinutes()).slice(-2))
    sessions.push({
      name: session.data().name,
      startTime: finalOut,
      place: session.data().hall.name,
    })
  }
  return sessions;
}