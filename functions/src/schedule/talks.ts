import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { assoc, dissoc, pipe, ifElse, has, identity, map } from 'ramda';
import { removeEmptyScheduleItems } from './rooms';

export const dissocTalkProps = pipe(
    dissoc('name'),
    dissoc('description'),
    dissoc('duration'),
    dissoc('language')
);

export const assocTalkProps = (scheduleItem, talk) => pipe(
    ifElse(_ => has('name', talk), assoc('name', talk.name), identity),
    ifElse(_ => has('description', talk), assoc('description', talk.description), identity),
    ifElse(_ => has('startTime', talk), assoc('startTime', talk.startTime), identity),
    ifElse(_ => has('duration', talk), assoc('duration', talk.duration), identity),
    ifElse(_ => has('language', talk), assoc('language', talk.language), identity),
)(scheduleItem);

export const applyTalk = functions.firestore.document('speakers/{documentId}').onCreate((snap) => {
    const data = snap.data();
    if (data.talkRef === null) {
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
    return admin.firestore().collection('speakers').where('talkRef', '==', snap.before.ref)
        .get()
        .then(async (speakers) => {
            if (speakers.empty) {
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
    return admin.firestore().collection('rooms').get().then(async snapshot => {
        const batch = admin.firestore().batch();

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
                batch.set(doc.ref, data);
            }
        });

        return batch.commit();
    });
});

export const onTalkDelete = functions.firestore.document('talks/{talkId}').onDelete((snap) => {
    return admin.firestore().collection('rooms').get().then(async snapshot => {
        const batch = admin.firestore().batch();

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.schedule && data.schedule.length > 0) {
                data.schedule = pipe(
                    map(item => {
                        let scheduleItem = item;
                        if (scheduleItem.talkRef && scheduleItem.talkRef.path === snap.ref.path) {
                            scheduleItem = dissoc('talkRef', dissocTalkProps(scheduleItem));
                        }
                        return scheduleItem;
                    }),
                    removeEmptyScheduleItems,
                )(data.schedule);
                batch.set(doc.ref, data);
            }
        });

        return batch.commit();
    });
});