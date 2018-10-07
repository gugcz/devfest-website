import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);

import * as ticket from './tickets/ticketPrice';
import * as press from './press';
import * as invoice from './invoice/invoiceTriggers';
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
/**** Schedule ***/
export const timeSlotCreated = schedule.timeSlotCreated;
export const timeSlotUpdated = schedule.timeSlotUpdated;
export const timeSlotDeleted = schedule.timeSlotDeleted;
export const addSpeakerToSession = schedule.addSpeakerToSession;
export const changeSpeakerToSession = schedule.changeSpeakerToSession;