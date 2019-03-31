import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);
admin.firestore().settings({ timestampsInSnapshots: true });

import * as tickets from './tickets';

export const getTickets = tickets.getTickets;
export const getCurrentTicketsForInvoice = tickets.getCurrentTicketsForInvoice;
export const registeredNewTicket = tickets.registeredNewTicket;
export const newInvoiceRequest = tickets.newInvoiceRequest;
export const invoicePaid = tickets.invoicePaid;