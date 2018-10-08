import * as tags from './tags';
import * as partners from './partners';
import * as speakers from './speakers';
import * as sessions from './sessions';
import * as timeslots from './schedule';

export const changedTag = tags.changed;
export const createdTag = tags.created;
export const deletedTag = tags.deleted;

export const changedSection = partners.changedSection;
export const createdSection = partners.createdSection;
export const deletedSection = partners.deletedSection;
export const createdPartner = partners.createdPartner;
export const changedPartner = partners.changedPartner;
export const deletedPartner = partners.deletedPartner;

export const changedSpeaker = speakers.changedSpeaker;
export const createdSpeaker = speakers.createdSpeaker;
export const deletedSpeaker = speakers.deletedSpeaker;

export const createdSession = sessions.createdSession;
export const changedSession = sessions.changedSession;
export const deletedSession = sessions.deletedSession;

export const createdTimeSlot = timeslots.createdTimeSlot;
export const changedTimeSlot = timeslots.changedTimeSlot;
export const deletedTimeSlot = timeslots.deletedTimeSlot;
