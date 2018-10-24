import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const changedTimeSlots = functions.firestore.document('timeSlots/{sectionId}').onWrite((snap, context) => {
  return changedTimeslot();
});

async function changedTimeslot() {
  const timeslotsSnapshot = await admin.firestore().collection('timeSlots').get();
  const pushArray = [];
  for (const timeSlotSnapshot of timeslotsSnapshot.docs) {
    const data = timeSlotSnapshot.data();
    const timeslot = {};
    if (data.isWorkshopDay === undefined || data.isWorkshopDay === null || data.isWorkshopDay === false) {
      const date = data.startTime.toDate();
      timeslot['date'] = date.getFullYear() + "-" + (date.getMonth() - 1) + "-" + date.getDate();
      timeslot['dateReadable'] = data.text;
      const tracks = [];
      const timeslots = [];
      if (data.sessions.length > 0) {
        for (const session of data.sessions) {
          const tracksFi = tracks.filter((a) => a.customId === session.track.id);
          if (tracksFi.length === 0) {
            const trackData = await session.track.get();
            tracks.push({ title: trackData.data().name, customId: session.track.id, count: 1 });
          } else {
            tracks[tracks.indexOf(tracksFi[0])]['count']++;
          }
        }
        tracks.sort((a, b) => { return b.count - a.count });
        for (const session of data.sessions) {
          const sessionDataSnapshot = await session.session.get();
          const sessionData = sessionDataSnapshot.data();
          if (sessionData.startTime && sessionData.endTime) {
            const sessionStartTime = (sessionData.startTime.toDate().getUTCHours() + 2) + ":" + (("0" + sessionData.startTime.toDate().getMinutes()).slice(-2))
            const sessionEndTime = (sessionData.endTime.toDate().getUTCHours() + 2) + ":" + (("0" + sessionData.endTime.toDate().getMinutes()).slice(-2))
            let findId = null;
            timeslots.forEach((slot, ind) => {
              if (slot.startTime === sessionStartTime && slot.endTime === sessionEndTime) {
                findId = ind;
              }
            })
            const sessionsSnapshot = await admin.database().ref('sessions').once('value');
            const sessionFi = sessionsSnapshot.val().filter((a) => a.customId === session.session.id);
            const tracksFi2 = tracks.filter((a) => a.customId === session.track.id);
            if (sessionFi.length > 0) {
              if (findId === null) {
                const sessionsIn = [];
                const sessionInIn = [];
                sessionInIn.push(sessionFi[0].id);
                sessionsIn[tracks.indexOf(tracksFi2[0])] = sessionInIn;
                timeslots.push({ startTime: sessionStartTime, endTime: sessionEndTime, sessions: sessionsIn });
              } else {
                const timeSlotIn = timeslots[findId];
                const sessionsIn = timeSlotIn.sessions;
                const sessionInIn = [];
                sessionInIn.push(sessionFi[0].id);
                sessionsIn[tracks.indexOf(tracksFi2[0])] = sessionInIn;
                timeSlotIn['sessions'] = sessionsIn;
                timeslots[findId] = timeSlotIn;
              };
            }
          }
        }
      }
      timeslot['tracks'] = tracks;
      timeslots.sort((a, b) => {
        if (parseInt(a['startTime'].split(":")[0]) - parseInt(b['startTime'].split(":")[0]) === 0) {
          return parseInt(a['startTime'].split(":")[1]) - parseInt(b['startTime'].split(":")[1]);
        } else {
          return parseInt(a['startTime'].split(":")[0]) - parseInt(b['startTime'].split(":")[0]);
        }
      });
      timeslot['timeslots'] = timeslots;
      pushArray.push(timeslot);
    }
  }
  return admin.database().ref('schedule').set(pushArray);
}
