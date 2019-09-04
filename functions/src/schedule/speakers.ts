import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {assoc, pipe, propOr} from 'ramda';

export const buildSpeakerForSchedule = speakerData => pipe(
    assoc('name', propOr('', 'name', speakerData)),
    assoc('photoPath', propOr('', 'photoPath', speakerData)),
    assoc('language', propOr('', 'language', speakerData)),
    assoc('company', propOr('', 'company', speakerData)),
    assoc('tag', propOr('', 'tag', speakerData)),
    assoc('tagColor', propOr('', 'tagColor', speakerData)),
    assoc('pronoun', propOr('', 'pronoun', speakerData)),
)({});

export const onSpeakerUpdate = functions.firestore.document('speakers/{documentId}').onUpdate((change, context) => {
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