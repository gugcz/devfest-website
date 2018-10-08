import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const createdTimeSlot = functions.firestore.document('timeSlots/{sectionId}').onCreate((snap, context) => {
  const id = snap.id;
  const data = snap.data();
  return updateOrCreateTimeSlot(id, data);
});

export const changedTimeSlot = functions.firestore.document('timeSlots/{sectionId}').onUpdate((snap, context) => {
  const id = snap.after.id;
  const data = snap.after.data();
  return updateOrCreateTimeSlot(id, data);
});

export const deletedTimeSlot = functions.firestore.document('timeSlots/{sectionId}').onDelete((snap, context) => {
  return admin.database().ref('schedule').child(snap.id).ref.remove();
});

async function updateOrCreateTimeSlot(id, data) {
  const timeSlot = {};
  const tracks = [];
  const timeslots = [];
  if (data.sessions.length > 0){
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < data.sessions.length; i++){
      const session = data.sessions[i];
      if (!(tracks.indexOf(session.track.id) >= -1)){
        tracks[session.track.id] = {};
        const trackData = await session.track.get();
        tracks[session.track.id] = {title: trackData.data().name}
      }
      const sessionDataSnapshot = await session.session.get();
      const sessionData = sessionDataSnapshot.data();
      let findId = null;
      timeslots.forEach((slot,ind) => {
        if (slot.startTime === sessionData.startTime && slot.endTime === sessionData.endTime) {
          findId = ind;
        }
      })
      if (findId === null) {
        const sessionsIn = [];
        sessionsIn.push(session.session.id);
        timeslots.push({startTime: sessionData.startTime, endTime: sessionData.endTime, sessions: sessionsIn});
      } else {
        const timeSlotIn = timeslots[findId];
        const sessionsIn = timeSlotIn.sessions;
        sessionsIn.push(session.session.id)
        timeSlotIn['sessions'] = sessionsIn;
        console.log(timeSlotIn);
        timeslots[findId] = timeSlotIn;
      };
    }
  }
  timeSlot['tracks'] = tracks;
  timeSlot['date'] = data.startTime;
  timeSlot['dateReadable'] = data.text;
  timeSlot['sessions'] = timeslots;
  return admin.database().ref('schedule').child(id).update(timeSlot);
}