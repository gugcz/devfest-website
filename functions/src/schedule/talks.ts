import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {assoc, dissoc, pipe, ifElse, has, identity} from 'ramda';

export const dissocTalkProps = pipe(
    dissoc('name'),
    dissoc('description'),
    dissoc('duration'),
    dissoc('language')
);

export const assocTalkProps = (scheduleItem, talk) => pipe(
    ifElse(x => has('name', talk), assoc('name', talk.name), identity),
    ifElse(x => has('description', talk), assoc('description', talk.description), identity),
    ifElse(x => has('duration', talk), assoc('duration', talk.duration), identity),
    ifElse(x => has('language', talk), assoc('language', talk.language), identity),
)(scheduleItem);

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
});

export const updateScheduleOnTalkUpdate = functions.firestore.document('talks/{talkId}').onUpdate((change, context) => {
    return admin.firestore().collection('rooms').get().then(snapshot => {
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.schedule && data.schedule.length > 0) {
                data.schedule = data.schedule.map(item => {
                    let scheduleItem = item;
                    if (scheduleItem.talkRef && scheduleItem.talkRef.path === change.after.ref.path) {
                        scheduleItem = assocTalkProps(dissocTalkProps(scheduleItem), change.after.data());
                    }
                    return scheduleItem;
                });
                doc.ref.set(data);
            }
        });
    });
});
