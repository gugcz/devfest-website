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
  speakersSnapshot.docs.forEach(speaker => {
    const speakerData = speaker.data();
    speakers.push({
      name: speakerData.name,
      about: speakerData.about,
      twitter: speakerData.twitter ? speakerData.twitter : undefined,
      sessionName: speakerData.sessions[0].name,
      sessionDescription: speakerData.sessions[0].description
    })
  });
  return speakers;
}