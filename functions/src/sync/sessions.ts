import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const changedSessions = functions.firestore.document('sessions/{sessionId}').onWrite(() => {
  return updateSessions();
});


async function updateSessions(){
  const sessionsSnapshot = await admin.firestore().collection('sessions').get();
  const pushArray = [];
  for (const sessionSnapshot of sessionsSnapshot.docs){
    const data = sessionSnapshot.data();
    try {
      const session = {}
      session["description"] = data.description ? data.description : null;
      session["id"] = pushArray.length;
      session["title"] = data.name;
      session["customId"] = sessionSnapshot.id;
      session["language"] = data.language ? data.language : null;
      const speakers = [];
      if (data.speakers){
        const speakersReal = await admin.database().ref('speakers').once('value');
        for (const speaker of speakers){
          const speakerRealFi = speakersReal.val().filter((a) => a["customId"] === speaker.id);
          if (speakerRealFi.length > 0) {
            speakers.push(speakerRealFi[0]["id"]);
          }
        }
      }
      session["speakers"] = speakers;
      session["complexity"] = data.level ? data.level : null;
      session["track"] = data.hall ? data.hall.name : null;
      pushArray.push(session);
    } catch(e){
    }
  }

  return admin.database().ref('sessions').set(pushArray);
}