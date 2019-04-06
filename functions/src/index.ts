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

export const universal = functions.https.onRequest((request, response) => {
    require(`${process.cwd()}/dist/devfest2019-webpack/server`).app(request, response);
  });