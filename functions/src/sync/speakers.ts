import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface SpeakerFirestore {
    about: string;
    cardPosition: number;
    companies: string[];
    intro: string;
    job: string;
    name: string;
    photo: string;
    show: boolean;
    twitter?: string;
}

export const createdSpeaker = functions.firestore.document('speakers/{speakerId}').onCreate((snap, context) => {
  const id = snap.id;
  const speaker =  snap.data();
  return updateOrCreateSpeaker(id, speakerDocumentToObject(speaker));
});

export const changedSpeaker = functions.firestore.document('speakers/{speakerId}').onUpdate((snap, context) => {
  const id = snap.after.id;
  const speaker = snap.after.data();
  return updateOrCreateSpeaker(id, speakerDocumentToObject(speaker));
});

export const deletedSpeaker = functions.firestore.document('speakers/{speakerId}').onDelete((snap, context) => {
  return admin.database().ref('speakers').child(snap.id).ref.remove();
});


async function updateOrCreateSpeaker(id, speakerFire: SpeakerFirestore) {
  const databaseTag = await admin.database().ref('speakers').child(id).once('value');
  let speaker = databaseTag.val();
  if (speaker === null) {
    speaker = {};
  }
  speaker["bio"] = speakerFire.about;
  const companyArray = speakerFire.companies[0].split("/");
  speaker["company"] = companyArray[companyArray.length-1].slice(0,-4);
  speaker["companyLogo"] = speakerFire.companies[0];
  speaker["featured"] = speakerFire.show;
  speaker["id"] = id;
  speaker["name"] = speakerFire.name;
  speaker["photoUrl"] = speakerFire.photo;
  speaker["shortBio"] = speakerFire.about.substring(0,80) + "...";
  speaker["socials"] = [];
  if (speakerFire.twitter){
    speaker["socials"][0] = {icon: "twitter", link: ("https://twitter.com/" + speaker.twitter), name: "Twitter"};
  }
  speaker["tags"] = [];
  speaker["title"] = speakerFire.job;
  return admin.database().ref('speakers').child(id).update(speaker);
}

function speakerDocumentToObject(document): SpeakerFirestore {
  return {
    about: document.about,
    cardPosition: document.cardPosition,
    companies: document.companies,
    intro: document.intro,
    job: document.job,
    name: document.name,
    photo: document.photo,
    show: document.show,
    twitter: document.twitter? document.twitter: undefined
  }
}