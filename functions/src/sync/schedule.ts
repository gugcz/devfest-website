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
    for (const session of data.sessions){
      if (tracks.indexOf(session.track.id) < 0){
        tracks[session.track.id] = {};
        const trackData = await session.track.get();
        tracks[session.track.id] = {title: trackData.data().name}
      }
      const sessionDataSnapshot = await session.session.get();
      const sessionData = sessionDataSnapshot.data();
      if (sessionData.startTime && sessionData.endTime){
        const sessionStartTime = sessionData.startTime.toDate().getHours() + ":" + (("0" + sessionData.startTime.toDate().getMinutes()).slice(-2))
        const sessionEndTime = sessionData.endTime.toDate().getHours() + ":" + (("0" + sessionData.endTime.toDate().getMinutes()).slice(-2))
        let findId = null;
        timeslots.forEach((slot,ind) => {
          if (slot.startTime === sessionStartTime &&  slot.endTime === sessionEndTime) {
            findId = ind;
          }
        })
        if (findId === null) {
          const sessionsIn = [];
          sessionsIn[session.track.id] = session.session.id;
          timeslots.push({startTime: sessionStartTime, endTime: sessionEndTime, sessions: sessionsIn});
        } else {
          const timeSlotIn = timeslots[findId];
          const sessionsIn = timeSlotIn.sessions;
          sessionsIn[session.track.id] = session.session.id;
          timeSlotIn['sessions'] = sessionsIn;
          timeslots[findId] = timeSlotIn;
        };
      }
    }
  }
  const date = data.startTime.toDate();
  timeSlot['date'] = date.getFullYear() + "-" + (date.getMonth()-1) + "-" + date.getDate();
  timeSlot['dateReadable'] = data.text;
  timeSlot['tracks'] = tracks;
  timeSlot['sessions'] = timeslots;
  await admin.database().ref('schedule').child(id).set(timeSlot);
  return true;
}