import * as functions from 'firebase-functions';
import { buildSpeakerForSchedule } from './speakers';
import { reject, isEmpty } from 'ramda';

export const removeEmptyScheduleItems = reject(isEmpty);

const containsTalkAndSpeakerRef = data => data && data.talkRef && data.speakerRef;

export const onWrite = functions.firestore.document('rooms/{roomId}').onWrite(async (change, context) => {
    const dataAfter = change.after.data();
    const dataBefore = change.before.data();
    if (dataAfter.schedule && dataAfter.schedule.length > 0) {
        const scheduleAfter = dataAfter.schedule;
        const scheduleBefore = dataBefore.schedule;
        const schedule = scheduleAfter.map(async (scheduleItem, index) => {
            if (!(containsTalkAndSpeakerRef(scheduleItem) && containsTalkAndSpeakerRef(scheduleBefore[index])
                && scheduleItem.talkRef.path === scheduleBefore[index].talkRef.path && scheduleItem.speakerRef.path === scheduleBefore[index].speakerRef.path)) {
                if (scheduleItem.talkRef) {
                    const talkRef = await scheduleItem.talkRef.get();
                    const talk = talkRef.data();
                    if (talk.name) {
                        scheduleItem.name = talk.name;
                    }
                    if (talk.description) {
                        scheduleItem.description = talk.description;
                    }
                    if (talk.duration) {
                        scheduleItem.duration = talk.duration;
                    }
                    if (talk.language) {
                        scheduleItem.language = talk.language;
                    }
                }
                if (scheduleItem.speakerRef) {
                    const speakerRef = await scheduleItem.speakerRef.get();
                    scheduleItem.speaker = buildSpeakerForSchedule(speakerRef.data());
                }
                if (scheduleItem.cospeakerRef) {
                    const cospeakerRef = await scheduleItem.cospeakerRef.get();
                    scheduleItem.cospeaker = buildSpeakerForSchedule(cospeakerRef.data());
                }
            }
            return scheduleItem;
        });

        return Promise.all(schedule).then(values => {
            dataAfter.schedule = values.map(removeEmptyScheduleItems);
            return change.after.ref.set(dataAfter);
        });
    } else {
        return change.after.ref.set(dataAfter);
    }
});
