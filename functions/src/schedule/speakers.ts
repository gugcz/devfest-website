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
)({});