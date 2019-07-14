import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const applyTalk = functions.firestore.document('speakers/{documentId}').onCreate((snap) => {
    const data = snap.data();
    if (data.talkRef === null){
        return null;
    }
    return data.talkRef
        .get()
        .then((talkSnap) => {
            const talkData = talkSnap.data();
            if (talkData === null || talkData.empty) {
                throw Error('Missing talk');
            }
            return snap.ref.update({
                talkName: talkData.name,
                talkDescription: talkData.description
            })
        });
});

export const updateOfTalk = functions.firestore.document('talks/{documentId}').onUpdate((snap) => {
    const data = snap.after.data();
    return admin.firestore().collection('speakers').where('talkRef', '==',snap.before.ref)
    .get()
    .then(async(speakers) => {
        if (speakers.empty){
            return null;
        }
        const batch = admin.firestore().batch();
        speakers.forEach((speaker) => {
            batch.update(speaker.ref, { 
                talkName: data.name,
                talkDescription: data.description
            })
        })
        return batch.commit();
    })
})