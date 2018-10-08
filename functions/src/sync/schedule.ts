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
  if (data.sessions){
    await data.sessions.forEach(async session => {
      if (!tracks.indexOf(session.track.id)){
        tracks[session.track.id] = {};
        const trackData = await session.track.get();
        tracks[session.track.id] = {title: trackData.data().name}
      }
      const sessionData = await session.session.get();
      if (timeslots.filter(slot => (slot.startTime === sessionData.startTime && slot.endTime === sessionData.endTime)).length === 0) {
        const sessionsIn = [];
        sessionsIn.push(session.session.id);
        timeslots.push({startTime: sessionData.startTime, endTime: sessionData.endTime, sessions: sessionsIn});
      } else {
        const timeSlotIn = timeslots.filter(slot => (slot.startTime === sessionData.startTime && slot.endTime === sessionData.endTime))[0];
        const indexTimeSlotIn = timeslots.indexOf(slot => (slot.startTime === sessionData.startTime && slot.endTime === sessionData.endTime));
        const sessionsIn = timeSlotIn.sessions;
        sessionsIn.push(session.session.id)
        timeSlotIn['sessions'] = sessionsIn;
        timeslots[indexTimeSlotIn] = timeSlotIn;
      }
    });
  }
  timeSlot['tracks'] = tracks;
  const dateFormat = new Date(data.startTime);
  const returnDate = dateFormat.getFullYear() + "-" + dateFormat.getMonth() + "-" + dateFormat.getDate();
  timeSlot['date'] = returnDate;
  timeSlot['dateReadable'] = data.text;
  timeSlot['sessions'] = timeslots;
  return admin.database().ref('schedule').child(id).update(timeSlot);
}