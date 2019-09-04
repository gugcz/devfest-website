import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { assoc, dissoc, pipe, prop, map, ifElse, has, identity } from 'ramda';
import { removeEmptyScheduleItems } from './rooms';

export const buildSpeakerForSchedule = speakerData => pipe(
    ifElse(x => has('name', speakerData), assoc('name', prop('name', speakerData)), identity),
    ifElse(x => has('photoPath', speakerData), assoc('photoPath', prop('photoPath', speakerData)), identity),
    ifElse(x => has('language', speakerData), assoc('language', prop('language', speakerData)), identity),
    ifElse(x => has('company', speakerData), assoc('company', prop('company', speakerData)), identity),
    ifElse(x => has('tag', speakerData), assoc('tag', prop('tag', speakerData)), identity),
    ifElse(x => has('tagColor', speakerData), assoc('tagColor', prop('tagColor', speakerData)), identity),
    ifElse(x => has('pronoun', speakerData), assoc('pronoun', prop('pronoun', speakerData)), identity),
)({});

export const onSpeakerUpdate = functions.firestore.document('speakers/{speakerId}').onUpdate((change, context) => {
    return admin.firestore().collection('rooms').get().then(snapshot => {
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.schedule && data.schedule.length > 0) {
                data.schedule = data.schedule.map(scheduleItem => {
                    if (scheduleItem.speakerRef && scheduleItem.speakerRef.path === change.after.ref.path) {
                        scheduleItem.speaker = buildSpeakerForSchedule(change.after.data());
                    }
                    if (scheduleItem.cospeakerRef && scheduleItem.cospeakerRef.path === change.after.ref.path) {
                        scheduleItem.cospeaker = buildSpeakerForSchedule(change.after.data());
                    }
                    return scheduleItem;
                });
                doc.ref.set(data);
            }
        });
    });
});

export const onSpeakerDelete = functions.firestore.document('speakers/{speakerId}').onDelete((snap) => {
    return admin.firestore().collection('rooms').get().then(snapshot => {
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.schedule && data.schedule.length > 0) {
                data.schedule = pipe(
                    map(item => {
                        let scheduleItem = item;
                        if (scheduleItem.speakerRef && scheduleItem.speakerRef.path === snap.ref.path) {
                            scheduleItem = pipe(
                                dissoc('speaker'),
                                dissoc('speakerRef')
                            )(scheduleItem);
                        }
                        if (scheduleItem.cospeakerRef && scheduleItem.cospeakerRef.path === snap.ref.path) {
                            scheduleItem = pipe(
                                dissoc('cospeaker'),
                                dissoc('cospeakerRef')
                            )(scheduleItem);
                        }
                        return scheduleItem;
                    }),
                    removeEmptyScheduleItems,
                )(data.schedule);
                doc.ref.set(data);
            }
        });
    });
});