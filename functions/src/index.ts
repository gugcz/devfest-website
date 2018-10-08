import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);

import * as ticket from './tickets/ticketPrice';
import * as press from './press';
import * as invoice from './invoice/invoiceTriggers';
import * as sync from './sync';
import * as gaSpeakers from './assistant/speakers';
 
/**** Google Assitant */
export const gaGetSpeakers = gaSpeakers.getSpeakers;

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
/**** Sync ***/
export const syncChangedTag = sync.changedTag;
export const syncCreatedTag = sync.createdTag;
export const syncDeletedTag = sync.deletedTag;
export const syncChangedSection = sync.changedSection;
export const syncCreatedSection = sync.createdSection;
export const syncDeletedSection = sync.deletedSection;
export const syncCreatedPartner = sync.createdPartner;
export const syncChangedPartner = sync.changedPartner;
export const syncDeletedPartner = sync.deletedPartner;
export const syncCreatedSpeaker = sync.createdSpeaker;
export const syncChangedSpeaker = sync.changedSpeaker;
export const syncDeletedSpeaker = sync.deletedSpeaker;
export const syncCreatedSession = sync.createdSession;
export const syncChangedSession = sync.changedSession;
export const syncDeletedSession = sync.deletedSession;