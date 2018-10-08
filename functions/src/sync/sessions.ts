import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const createdSession = functions.firestore.document('sessions/{sessionId}').onCreate((snap, context) => {
  const id = snap.id;
  const data = snap.data();
  return updateOrCreateSession(id, data);
});

export const changedSession = functions.firestore.document('sessions/{sessionId}').onUpdate((snap, context) => {
  const id = snap.after.id;
  const data = snap.after.data();
  return updateOrCreateSession(id, data);
});

export const deletedSession = functions.firestore.document('sessions/{sessionId}').onDelete((snap) => {
  return admin.database().ref('sessions').child(snap.id).ref.remove();
});

async function updateOrCreateSession(id, data){
  const databaseSession = await admin.database().ref('sessions').child(id).once('value');
  let session = databaseSession.val();
  if (session === null){
    session = {}
  }
  session["description"] = data.description;
  session["id"] = id;
  session["title"] = data.name;
  session["language"] = data.language ? data.language : undefined;
  const speakers = [];
  if (data.speakers){
    data.speakers.forEach(speaker => {
      speakers.push(speaker.id);
    });
  }
  session["speakers"] = speakers;
  session["complexity"] = data.level ? data.level : undefined;
  session["track"] = data.hall ? data.hall.name : undefined;
  return admin.database().ref('sessions').child(id).update(session);
}