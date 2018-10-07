import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import FieldValue = admin.firestore.FieldValue;

export const timeSlotCreated = functions.firestore
  .document('timeSlots/{timeSlotId}')
  .onCreate((snap, context) => {
    return addSessionsHalls(snap.data());
  });

export const timeSlotUpdated = functions.firestore
  .document('timeSlots/{timeSlotId}')
  .onUpdate((change, context) => {
    return removeSessionsHalls(change.before.data()).then(() => {
      return addSessionsHalls(change.after.data());
    });
  });

export const timeSlotDeleted = functions.firestore
  .document('timeSlots/{timeSlotId}')
  .onDelete((snap, context) => {
    return removeSessionsHalls(snap.data());
  });

async function removeSessionsHalls(data) {
  if (data.sessions) {
    await data.sessions.forEach(async session => {
      if (session.track && session.session) {
        const sessionref = session.session;
        await sessionref.set({ hall: FieldValue.delete() }, { merge: true });
      }
    });
  }
  return true;
};

async function addSessionsHalls(data) {
  if (data.sessions) {
    await data.sessions.forEach(async session => {
      if (session.track && session.session) {
        const doc = await session.track.get()
        const tracktData = doc.data();
        const sessionRef = session.session;
        if (tracktData) {
          await sessionRef.set({ hall: { name: tracktData.name, order: tracktData.order } }, { merge: true });
        }
      }
    });
  }
  return true;
};
