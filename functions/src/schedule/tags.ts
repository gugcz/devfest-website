import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const applyColor = functions.firestore.document('speakers/{documentId}').onCreate((snap) => {
    const data = snap.data();
    return admin.firestore().collection('tags').where('name', '==', data.tag)
        .get()
        .then((tagSNap) => {
            const tagData = tagSNap.docs[0].data();
            if (tagData === null || tagSNap.empty || tagData.color === null) {
                throw Error('Missing tag color');
            }
            return snap.ref.update({
                tagColor: tagData.color
            })
        });
});

export const updateOfColor = functions.firestore.document('tags/{documentId}').onUpdate((snap) => {
    const data = snap.after.data();
    // TODO update of talk colors
    return admin.firestore().collection('speakers').where('tag', '==', data.name)
    .get()
    .then(async(speakers) => {
        if (speakers.empty){
            return null;
        }
        const batch = admin.firestore().batch();
        speakers.forEach((speaker) => {
            batch.update(speaker.ref, { 
                tagColor: data.color,
                tagIcon: data.icon
            })
        })
        return batch.commit();
    })
})