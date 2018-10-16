import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const timeSlotCreated = functions.firestore
  .document('timeSlots/{timeSlotId}')
  .onCreate((snap) => {
    return addSessionsHalls(snap.data());
  });

export const timeSlotUpdated = functions.firestore
  .document('timeSlots/{timeSlotId}')
  .onUpdate((change) => {
    return addSessionsHalls(change.after.data());
  });

export const addSpeakerToSession = functions.firestore.document('sessions/{sessionId}')
  .onCreate((snap) => {
    const speakers = snap.data().speakers;
    const ref = snap.ref;
    return addSessionToSpeaker(speakers, ref)
  });

export const changeSpeakerToSession = functions.firestore.document('sessions/{sessionId}')
  .onUpdate((snap) => {
    const speakers = snap.after.data().speakers;
    const ref = snap.after.ref;
    return addSessionToSpeaker(speakers, ref)
  });

async function addSessionToSpeaker(speakersRef, sessionRef) {
  if (speakersRef) {
    await speakersRef.forEach(async oneRef => {
      await oneRef.set({ session: sessionRef }, { merge: true });
    })
  }
  return true
}

async function addSessionsHalls(data) {
  const batch = admin.firestore().batch();
  if (data.sessions) {
    await data.sessions.forEach(async session => {
      if (session.track && session.session) {
        const doc = await session.track.get();
        const tracktData = doc.data();
        const sessionRef = session.session;
        if (tracktData) {
          batch.set(sessionRef, { hall: { name: tracktData.name, order: tracktData.order } }, { merge: true })
        }
      }
    });
  }
  return batch.commit();
}
