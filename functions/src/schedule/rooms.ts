import * as functions from 'firebase-functions';
import { buildSpeakerForSchedule } from './speakers';
import { reject, isEmpty } from 'ramda';
import { assocTalkProps, dissocTalkProps} from './talks';
import * as admin from 'firebase-admin';

const containsTalkAndSpeakerRef = data => data && data.talkRef && data.speakerRef;

export const removeEmptyScheduleItems = reject(isEmpty);

export const performFunctionOnEachRoom = fn => admin.firestore().collection('rooms').get().then(snapshot => snapshot.forEach(fn));

export const onWrite = functions.firestore.document('rooms/{roomId}').onWrite(async (change, context) => {
    const dataAfter = change.after.data();
    const dataBefore = change.before.data();
    if (dataAfter.schedule && dataAfter.schedule.length > 0) {
        const scheduleAfter = dataAfter.schedule;
        const scheduleBefore = dataBefore.schedule;
        const schedule = scheduleAfter.map(async (item, index) => {
            let scheduleItem = item;
            if (!(containsTalkAndSpeakerRef(scheduleItem) && containsTalkAndSpeakerRef(scheduleBefore[index])
                && scheduleItem.talkRef.path === scheduleBefore[index].talkRef.path && scheduleItem.speakerRef.path === scheduleBefore[index].speakerRef.path)) {
                if (scheduleItem.talkRef) {
                    const talkRef = await scheduleItem.talkRef.get();
                    scheduleItem = assocTalkProps(dissocTalkProps(scheduleItem), talkRef.data());
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
            dataAfter.schedule = removeEmptyScheduleItems(values);
            return change.after.ref.set(dataAfter);
        });
    } else {
        return change.after.ref.set(dataAfter);
    }
});
