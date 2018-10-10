import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const changedSpeakers = functions.firestore.document('speakers/{speakerId}').onWrite((snap, context) => {
  return updateOrCreateSpeaker();
});

async function updateOrCreateSpeaker() {
  const allSpeakersFirestore = await admin.firestore().collection('speakers').get();
  const pushArray = [];
  let count = 0;
  for (const speakerFireDoc of allSpeakersFirestore.docs){
    try {
      const speaker = {};
      const speakerFire = speakerFireDoc.data();
      speaker["bio"] = speakerFire.about;
      const companyArray = speakerFire.companies[0].split("/");
      speaker["company"] = companyArray[companyArray.length-1].slice(0,-4);
      speaker["companyLogo"] = speakerFire.companies[0];
      speaker["featured"] = speakerFire.show;
      speaker["id"] = count;
      speaker["customId"] = speakerFireDoc.id;
      speaker["name"] = speakerFire.name;
      speaker["photoUrl"] = speakerFire.photo;
      speaker["shortBio"] = speakerFire.about.substring(0,80) + "...";
      speaker["socials"] = [];
      if (speakerFire.twitter){
        speaker["socials"][0] = {icon: "twitter", link: ("https://twitter.com/" + speaker['twitter']), name: "Twitter"};
      }
      speaker["tags"] = [];
      speaker["title"] = speakerFire.job;
      pushArray.push(speaker);
      count += 1;
    } catch (e){
      count -= 1;
    }
  }
  return admin.database().ref('speakers').set(pushArray);
}