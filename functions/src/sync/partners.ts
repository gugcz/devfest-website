import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const createdSection = functions.firestore.document('partners/{sectionId}').onCreate((snap, context) => {
  const id = snap.id;
  const name = snap.data().name;
  return updateOrCreateSection(id, name);
});

export const changedSection = functions.firestore.document('partners/{sectionId}').onUpdate((snap, context) => {
  const id = snap.after.id;
  const name = snap.after.data().name;
  return updateOrCreateSection(id, name);
});

export const deletedSection = functions.firestore.document('partners/{sectionId}').onDelete((snap, context) => {
  return admin.database().ref('partners').child(snap.id).ref.remove();
});

export const changedPartner = functions.firestore.document('partners/{sectionId}/logos/{partnerId}').onUpdate((snap, context) => {
  const sectionId = context.params['sectionId'];
  const id = snap.after.id;
  const name = snap.after.data().name;
  const url = snap.after.data().url;
  const logo = snap.after.data().logo;
  return updateOrCreatePartnerInSection(sectionId, id, name, url, logo);
});

export const createdPartner = functions.firestore.document('partners/{sectionId}/logos/{partnerId}').onCreate((snap, context) => {
  const sectionId = context.params['sectionId'];
  const id = snap.id;
  const name = snap.data().name;
  const url = snap.data().url;
  const logo = snap.data().logo;
  return updateOrCreatePartnerInSection(sectionId, id, name, url, logo);
});

export const deletedPartner = functions.firestore.document('partners/{sectionId}/logos/{partnerId}').onDelete((snap, context) => {
  const sectionId = context.params['sectionId'];
  const id = snap.id;
  return admin.database().ref('partners').child(sectionId).child('logos').child(id).ref.remove();
});

async function updateOrCreatePartnerInSection(sectionId, partnerId, namePartner, url, logo) {
  const databaseTag = await admin.database().ref('partners').child(sectionId).child('logos').once('value');
  const section = databaseTag.val();
  let logos = [];
  if (section !== null){
    logos = section;
  }
  logos[partnerId] = {};
  logos[partnerId]["name"] = namePartner;
  logos[partnerId]["url"] = url;

  logos[partnerId]["logoUrl"] = "nastavit";
  logos[partnerId]["width"] = "nastavit";
  logos[partnerId]["height"] = "nastavit";
  return admin.database().ref('partners').child(sectionId).child('logos').set(logos);
}


async function updateOrCreateSection(id, name) {
  const databaseTag = await admin.database().ref('partners').child(id).once('value');
  let partners = databaseTag.val();
  if (partners === null) {
    partners = {};
  }
  partners["title"] = name;
  return admin.database().ref('partners').child(id).update(partners);
}
