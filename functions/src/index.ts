import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);

import * as ticket from './tickets/ticketPrice';
import * as press from './press';
import * as invoice from './invoice/invoiceTriggers';
import * as sync from './sync';
import * as gaSpeakers from './assistant/speakers';
 
export const gaGetSpeakers = gaSpeakers.getSpeakers;
import * as schedule from './schedule';

/**** Tickets ***/
export const getTickets = ticket.getTickets;
/**** Press ***/
export const pressGraphicsThumb = press.graphicsThumb;
/**** Invoice ***/
export const invoiceProcessCompany = invoice.invoiceProcessCompany;
export const invoiceProcessInvoice = invoice.invoiceProcessInvoice;
export const invoicePaid = invoice.invoicePaid;
export const invoiceGetCurrentExchangeRate = invoice.getCurrentExchangeRate;
export const invoiceGetCurrentCompanyFundedPrice = invoice.getCurrentCompanyFundedPrice;
export const syncChangedTag = sync.changedTag;
export const syncCreatedTag = sync.createdTag;
export const syncDeletedTag = sync.deletedTag;
export const syncChangedSection = sync.changedSection;
export const syncCreatedSection = sync.createdSection;
export const syncDeletedSection = sync.deletedSection;
export const syncCreatedPartner = sync.createdPartner;
export const syncChangedPartner = sync.changedPartner;
export const syncDeletedPartner = sync.deletedPartner;
export const syncChangedSpeakers = sync.changedSpeakers;
export const syncCreatedSession = sync.createdSession;
export const syncChangedSession = sync.changedSession;
export const syncDeletedSession = sync.deletedSession;
export const syncCreatedTimeSlot = sync.createdTimeSlot;
export const syncChangedTimeSlot = sync.changedTimeSlot;
export const syncDeletedTimeSlot = sync.deletedTimeSlot;
export const timeSlotCreated = schedule.timeSlotCreated;
export const timeSlotUpdated = schedule.timeSlotUpdated;
export const addSpeakerToSession = schedule.addSpeakerToSession;
export const changeSpeakerToSession = schedule.changeSpeakerToSession;
