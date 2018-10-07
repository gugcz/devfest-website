import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import FieldValue = admin.firestore.FieldValue;

export const timeSlotCreated = functions.firestore
  .document('timeSlots/{timeSlotId}')
  .onCreate((snap, context) => {
    addSessionsHalls(snap.data());
  });

export const timeSlotUpdated = functions.firestore
  .document('timeSlots/{timeSlotId}')
  .onUpdate((change, context) => {
    removeSessionsHalls(change.before.data());
    addSessionsHalls(change.after.data());
  });

export const timeSlotDeleted = functions.firestore
  .document('timeSlots/{timeSlotId}')
  .onDelete((snap, context) => {
    removeSessionsHalls(snap.data());
  });

const removeSessionsHalls = (data) => {
  if (data.sessions) {
    data.sessions.forEach(async session => {
      if (session.track && session.session) {
        session.session.set({hall: FieldValue.delete()}, {merge: true});
      }
    });
  }
};

const addSessionsHalls = (data) => {
  if (data.sessions) {
    data.sessions.forEach(async session => {
      if (session.track && session.session) {
        session.track.get().then(doc => {
          const tracktData = doc.data();
          session.session.set({hall: {name: tracktData.name, order: tracktData.order}}, {merge: true});
        });
      }
    });
  }
};
