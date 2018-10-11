import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const changedTimeSlots = functions.firestore.document('timeSlots/{sectionId}').onWrite((snap, context) => {
  return changedTimeslot();
});

async function changedTimeslot() {
  admin.firestore().settings({timestampsInSnapshots: true});
  const timeslotsSnapshot = await admin.firestore().collection('timeSlots').get();
  const pushArray = [];
  for (const timeSlotSnapshot of timeslotsSnapshot.docs){
      const data = timeSlotSnapshot.data();
      const timeslot = {};
      
      const date = data.startTime.toDate();
      timeslot['date'] = date.getFullYear() + "-" + (date.getMonth()-1) + "-" + date.getDate();
      timeslot['dateReadable'] = data.text;
      const tracks = [];
      const timeslots = [];
      if (data.sessions.length > 0){
        for (const session of data.sessions){
          const tracksFi = tracks.filter((a) => a.customId === session.track.id);
          if (tracksFi.length === 0){
            const trackData = await session.track.get();
            tracks.push({title: trackData.data().name, customId: session.track.id});
          }
          const sessionDataSnapshot = await session.session.get();
          const sessionData = sessionDataSnapshot.data();
          if (sessionData.startTime && sessionData.endTime){
            const sessionStartTime = (sessionData.startTime.toDate().getHours() + 2) + ":" + (("0" + sessionData.startTime.toDate().getMinutes()).slice(-2))
            const sessionEndTime = (sessionData.endTime.toDate().getHours() + 2) + ":" + (("0" + sessionData.endTime.toDate().getMinutes()).slice(-2))
            let findId = null;
            timeslots.forEach((slot,ind) => {
              if (slot.startTime === sessionStartTime &&  slot.endTime === sessionEndTime) {
                findId = ind;
              }
            })
            const sessionsSnapshot = await admin.database().ref('sessions').once('value');
            const sessionFi = sessionsSnapshot.val().filter((a) => a.customId === session.session.id);
            const tracksFi2 = tracks.filter((a) => a.customId === session.track.id);
            if (sessionFi.length > 0){
              if (findId === null) {
                const sessionsIn = [];
                sessionsIn[tracks.indexOf(tracksFi2[0])] = sessionFi[0].id;
                timeslots.push({startTime: sessionStartTime, endTime: sessionEndTime, sessions: sessionsIn});
              } else {
                const timeSlotIn = timeslots[findId];
                const sessionsIn = timeSlotIn.sessions;
                sessionsIn[tracks.indexOf(tracksFi2[0])] = sessionFi[0].id;
                timeSlotIn['sessions'] = sessionsIn;
                timeslots[findId] = timeSlotIn;
              };
            }
          }
        }
      }
      timeslot['tracks'] = tracks;
      timeslot['timeslots'] = timeslots;
      pushArray.push(timeslot);
  }
  return admin.database().ref('schedule').set(pushArray);
}
