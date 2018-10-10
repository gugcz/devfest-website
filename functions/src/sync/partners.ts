import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const changedSections = functions.firestore.document('partners/{sectionId}').onWrite(() => {
  return updatePartners();
});

export const changedPartners = functions.firestore.document('partners/{sectionId}/logos/{partnerId}').onWrite(() => {
  return updatePartners();
});

async function updatePartners() {
  const partnerSectionSnapshot = await admin.firestore().collection('partners').get();
  const pushArray = [];
  for (const oneSection of partnerSectionSnapshot.docs){
    try {
      const oneSectionData = oneSection.data();
      const partners = {
        title: oneSectionData.name
      };
      const logos = [];
      const logosSecitonSnapshot = await admin.firestore()
      .collection('partners').doc(oneSection.id).collection('logos').get();
      for (const oneLogo of logosSecitonSnapshot.docs){
        logos.push({
          logoUrl: oneLogo.data().logo,
          name: oneLogo.data().name,
          url: oneLogo.data().url
        })
      }
      partners['logos'] = logos;
      pushArray.push(partners);
    } catch (e){}
  }
  return admin.database().ref('partners').set(pushArray);
}
