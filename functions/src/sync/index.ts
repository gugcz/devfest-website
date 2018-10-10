import * as tags from './tags';
import * as partners from './partners';
import * as speakers from './speakers';
import * as sessions from './sessions';
import * as timeslots from './schedule';

export const changedTag = tags.changed;
export const createdTag = tags.created;
export const deletedTag = tags.deleted;

export const changedSections = partners.changedSections;
export const changedPartners = partners.changedPartners;

export const changedSpeakers = speakers.changedSpeakers;

export const changedSessions = sessions.changedSessions;

export const createdTimeSlot = timeslots.createdTimeSlot;
export const changedTimeSlot = timeslots.changedTimeSlot;
export const deletedTimeSlot = timeslots.deletedTimeSlot;
