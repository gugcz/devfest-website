import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const getSpeakers = functions.https.onRequest((req, res) => {
  return getAllSpeakers().then(data => {
    res.send(data);
  });
});

async function getAllSpeakers() {
  const speakersSnapshot = await admin.firestore().collection('speakers').get();
  const speakers = [];
  for (const speaker of speakersSnapshot.docs){
    const speakerData = speaker.data();
    let sessionData = null;
    if (speakerData.session){
      const sessionSnapshot = await speakerData.session.get();
      sessionData = sessionSnapshot.data();
    }
    speakers.push({
      name: speakerData.name,
      about: speakerData.about,
      twitter: speakerData.twitter ? speakerData.twitter : undefined,
      sessionName: sessionData ? sessionData.name : undefined,
      sessionDescription: sessionData ? sessionData.description : undefined
    })
  }
  return speakers;
}