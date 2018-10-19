import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const getLastSessions = functions.https.onRequest((req, res) => {
  return getSessions().then(data => {
    res.send(data);
  });
});

/**
 * Getting near 3 sessions by time
 * @return []
 */
async function getSessions() {
  const sessionsSnapshot = await admin.firestore().collection('sessions').orderBy('startTime').limit(3).get();
  return sessionsSnapshot.docs.map(session => {
    const date = session.data().startTime.toDate();
    const finalOut = (date.getUTCHours() + 2) + ':' + (('0' + date.getMinutes()).slice(-2));
    return {
      name: session.data().name,
      description: session.data().description,
      startTime: finalOut,
      place: session.data().hall.name,
    };
  });
}
